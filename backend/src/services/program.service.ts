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
      .select('*')
      .order('deadline', { ascending: true });

    if (error) throw new Error(`Gagal mengambil data program: ${error.message}`);
    return data;
  }

  async getProgramById(programId: string) {
    const { data, error } = await supabaseAdmin
      .from('scholarship_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (error) throw new Error(`Program beasiswa tidak ditemukan.`);
    return data;
  }

  async createProgram(payload: CreateProgramPayload) {
    const { data, error } = await supabaseAdmin
      .from('scholarship_programs')
      .insert({
        ...payload,
        status: 'DRAFT', // Berdasarkan FSD-2.9.2, status awal DRAFT
      })
      .select()
      .single();

    if (error) throw new Error(`Gagal membuat program: ${error.message}`);
    return data;
  }

  async updateProgram(programId: string, payload: UpdateProgramPayload) {
    // Validasi apakah program masih bisa diedit
    const program = await this.getProgramById(programId);
    
    // Berdasarkan Business Rule, jika bukan DRAFT, field inti (nominal, kuota) tidak dapat diedit
    if (program.status !== 'DRAFT') {
      if (payload.nominal || payload.quota) {
        throw new Error("Program aktif tidak dapat diedit field intinya. Tutup program terlebih dahulu.");
      }
    }

    const { data, error } = await supabaseAdmin
      .from('scholarship_programs')
      .update(payload)
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
