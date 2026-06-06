import { supabaseAdmin } from '../config/supabase';

interface CreateProgramPayload {
  name: string;
  target_level: string;
  nominal: number;
  quota: number;
  deadline: string;
  description?: string;
  requirements?: any;
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
  async getAllPrograms() {
    const { data, error } = await supabaseAdmin
      .from('scholarship_programs')
      .select('id, nama, deskripsi, nominal:monthly_amount, deadline, kuota, sisa_kuota, status, created_at, updated_at')
      .order('deadline', { ascending: true });

    if (error) throw new Error(`Gagal mengambil data program: ${error.message}`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return data.map((program: any) => {
      const deadlineDate = new Date(program.deadline);
      const isExpired = today > deadlineDate;
      return {
        ...program,
        status: isExpired ? 'ditutup' : program.status,
      };
    });
  }

  async getProgramById(programId: string) {
    const { data, error } = await supabaseAdmin
      .from('scholarship_programs')
      .select('id, nama, deskripsi, target_level, nominal:monthly_amount, deadline, kuota, sisa_kuota, status, created_at, updated_at, created_by')
      .eq('id', programId)
      .single();

    if (error || !data) throw new Error(`Program beasiswa tidak ditemukan.`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(data.deadline);
    const isExpired = today > deadlineDate;

    return {
      ...data,
      status: isExpired && data.status === 'OPEN' ? 'CLOSED' : data.status,
    };
  }

  async createProgram(adminId: string, payload: CreateProgramPayload) {
    // Validasi
    if (payload.nominal <= 0) throw new Error("Nominal beasiswa harus lebih dari 0.");
    if (payload.quota <= 0) throw new Error("Kuota penerima harus lebih dari 0.");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(payload.deadline);
    if (deadlineDate <= today) throw new Error("Deadline harus setelah hari ini.");

    const { data, error } = await supabaseAdmin
      .from('scholarship_programs')
      .insert({
        nama: payload.name,
        target_level: payload.target_level,
        deskripsi: payload.description || '',
        monthly_amount: payload.nominal,
        kuota: payload.quota,
        sisa_kuota: payload.quota,
        deadline: payload.deadline,
        created_by: adminId,
        status: 'DRAFT', // Default status
      })
      .select()
      .single();

    if (error) throw new Error(`Gagal membuat program: ${error.message}`);

    // Catat ke audit_logs (AC-08)
    await supabaseAdmin.from('audit_logs').insert({
      user_id: adminId,
      aksi: `CREATE_PROGRAM: Membuka program beasiswa baru: ${payload.name}`,
      level: 'INFO'
    });

    return data;
  }

  async updateProgram(programId: string, payload: UpdateProgramPayload) {
    // Validasi apakah program masih bisa diedit
    const program = await this.getProgramById(programId);
    
    if (program.status === 'aktif') {
      if (payload.nominal || payload.quota) {
        throw new Error("Program aktif tidak dapat diedit field intinya. Tutup program terlebih dahulu.");
      }
    }

    const updateData: any = {};
    if (payload.name !== undefined) updateData.nama = payload.name;
    if (payload.description !== undefined) updateData.deskripsi = payload.description;
    if (payload.nominal !== undefined) updateData.monthly_amount = payload.nominal;
    if (payload.quota !== undefined) {
      updateData.kuota = payload.quota;
      updateData.sisa_kuota = payload.quota; // Reset sisa_kuota to match new quota
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
