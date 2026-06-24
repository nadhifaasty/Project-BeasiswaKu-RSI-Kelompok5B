import { supabaseAdmin } from '../config/supabase';

interface CreateProgramPayload {
  name?: string;
  target_level?: string;
  nominal?: number;
  quota?: number;
  deadline?: string;
  description?: string;
  requirements?: any;
  status?: 'aktif' | 'DRAFT';
}

interface UpdateProgramPayload {
  name?: string;
  target_level?: string;
  nominal?: number;
  quota?: number;
  deadline?: string;
  description?: string;
  requirements?: any;
}

class ProgramService {
  async getAllPrograms(includeDraft = false) {
    let query = supabaseAdmin
      .from('scholarship_programs')
      .select('id, nama, deskripsi, nominal:monthly_amount, deadline, kuota, sisa_kuota, status, target_level, created_at, updated_at')
      .order('deadline', { ascending: true });

    if (!includeDraft) {
      query = query.neq('status', 'DRAFT');
    }

    const { data: programs, error } = await query;

    if (error) throw new Error(`Gagal mengambil data program: ${error.message}`);

    const { data: appCounts, error: countError } = await supabaseAdmin
      .from('applications')
      .select('program_id');

    if (countError) throw new Error(`Gagal mengambil jumlah pendaftar: ${countError.message}`);

    const countMap: Record<string, number> = {};
    for (const app of (appCounts || [])) {
      countMap[app.program_id] = (countMap[app.program_id] || 0) + 1;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (programs || []).map((program: any) => {
      const deadlineDate = new Date(program.deadline);
      const isExpired = today > deadlineDate && program.status !== 'DRAFT';
      return {
        ...program,
        status: isExpired ? 'ditutup' : program.status,
        applicant_count: countMap[program.id] || 0,
      };
    });
  }

  async getProgramById(programId: string) {
    const { data, error } = await supabaseAdmin
      .from('scholarship_programs')
      .select('id, nama, deskripsi, nominal:monthly_amount, deadline, kuota, sisa_kuota, status, target_level, created_at, updated_at')
      .eq('id', programId)
      .single();

    if (error || !data) throw new Error(`Program beasiswa tidak ditemukan.`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(data.deadline);
    const isExpired = today > deadlineDate && data.status !== 'DRAFT';

    return {
      ...data,
      status: isExpired && data.status === 'aktif' ? 'ditutup' : data.status,
    };
  }

  async createProgram(adminId: string, payload: CreateProgramPayload) {
    const isDraft = payload.status === 'DRAFT';

    if (!isDraft) {
      if (!payload.nominal || payload.nominal <= 0) throw new Error('Nominal beasiswa harus lebih dari 0.');
      if (!payload.quota || payload.quota <= 0) throw new Error('Kuota penerima harus lebih dari 0.');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(payload.deadline!);
      if (deadlineDate <= today) throw new Error('Deadline harus setelah hari ini.');
    }

    const quota = payload.quota || 0;
    const { data, error } = await supabaseAdmin
      .from('scholarship_programs')
      .insert({
        nama: payload.name || 'Draf Program',
        deskripsi: payload.description || '',
        monthly_amount: payload.nominal || 0,
        kuota: quota,
        sisa_kuota: quota,
        deadline: payload.deadline || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: isDraft ? 'DRAFT' : 'aktif',
        ...(payload.target_level ? { target_level: payload.target_level } : {}),
      })
      .select()
      .single();

    if (error) throw new Error(`Gagal membuat program: ${error.message}`);

    return data;
  }

  async updateProgram(programId: string, payload: UpdateProgramPayload) {
    const program = await this.getProgramById(programId);

    if (program.status === 'ditutup' || program.status === 'CLOSED') {
      if (payload.deadline !== undefined) {
        throw new Error('Deadline program yang sudah ditutup tidak dapat diubah.');
      }
    }

    if (program.status === 'aktif' || program.status === 'OPEN') {
      const isNominalChanged = payload.nominal !== undefined && payload.nominal !== Number(program.nominal);
      const isQuotaChanged = payload.quota !== undefined && payload.quota !== program.kuota;
      if (isNominalChanged || isQuotaChanged) {
        throw new Error('Program aktif tidak dapat diedit kuota atau nominalnya. Tutup program terlebih dahulu.');
      }
    }

    const updateData: any = {};
    if (payload.name !== undefined) updateData.nama = payload.name;
    if (payload.description !== undefined) updateData.deskripsi = payload.description;
    if (payload.nominal !== undefined) updateData.monthly_amount = payload.nominal;
    if (payload.target_level !== undefined) updateData.target_level = payload.target_level;
    if (payload.quota !== undefined) {
      const usedQuota = program.kuota - program.sisa_kuota;
      updateData.kuota = payload.quota;
      updateData.sisa_kuota = Math.max(0, payload.quota - usedQuota);
    }
    if (payload.deadline !== undefined) updateData.deadline = payload.deadline;

    const { data, error } = await supabaseAdmin
      .from('scholarship_programs')
      .update(updateData)
      .eq('id', programId)
      .select()
      .single();

    if (error) throw new Error(`Gagal memperbarui program: ${error.message}`);
    return data;
  }

  async updateProgramStatus(programId: string, status: string) {
    const current = await this.getProgramById(programId);

    if (current.status === 'ditutup' || current.status === 'CLOSED') {
      throw new Error('Program yang sudah ditutup tidak dapat diaktifkan kembali.');
    }

    const { data, error } = await supabaseAdmin
      .from('scholarship_programs')
      .update({ status })
      .eq('id', programId)
      .select()
      .single();

    if (error) throw new Error(`Gagal memperbarui status program: ${error.message}`);
    return data;
  }
}

export const programService = new ProgramService();