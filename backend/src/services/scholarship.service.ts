import { supabaseAdmin } from '../config/supabase';

import { programService } from './program.service';

// ============ TYPES ============

export interface CreateApplicationPayload {
  program_id: string;
  ipk: number;
  esai_motivasi: string;
  prestasi_non_akademik?: string;
  data_akademik?: string;
  status?: 'DRAFT' | 'PENDING';
}

// ============ SERVICE ============

class ScholarshipService {
  /**
   * Get all applications for a user
   */
  async getUserApplications(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        scholarship_programs (
          nama,
          nominal:monthly_amount,
          deadline,
          status
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Gagal mengambil data pengajuan: ${error.message}`);
    return data;
  }

  /**
   * Get a single application by ID (with ownership check)
   */
  async getApplicationById(applicationId: string, userId: string) {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        scholarship_programs (
          nama,
          nominal:monthly_amount,
          deadline,
          status
        )
      `)
      .eq('id', applicationId)
      .eq('user_id', userId)
      .single();

    if (error) throw new Error(`Pengajuan tidak ditemukan.`);
    return data;
  }

  /**
   * Create a new scholarship application
   */
  async createApplication(userId: string, payload: CreateApplicationPayload) {
    const { program_id, ipk, esai_motivasi, prestasi_non_akademik, data_akademik, status = 'PENDING' } = payload;

    // 1. Check if program exists and is active
    const program = await programService.getProgramById(program_id);
    if (program.status !== 'aktif') {
      throw new Error('Program beasiswa ini sudah ditutup.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(program.deadline);
    if (today > deadline) {
      throw new Error('Program beasiswa ini sudah ditutup karena melewati batas deadline.');
    }

    if (program.sisa_kuota <= 0) {
      throw new Error('Kuota program beasiswa ini sudah penuh.');
    }

    // 2. Check if user already applied to ANY program (BR-01 & BR-02)
    // Kecuali jika ada DRAFT yang sudah dibuat
    const { data: existing } = await supabaseAdmin
      .from('applications')
      .select('id, status')
      .eq('user_id', userId);

    if (existing && existing.length > 0) {
      // Jika statusnya bukan DRAFT, tolak
      const hasActive = existing.some(app => app.status !== 'DRAFT');
      if (hasActive) {
        throw new Error('Kamu sudah mengajukan beasiswa. Siswa hanya diperbolehkan mendaftar ke satu program beasiswa.');
      }
      // Jika ada DRAFT tapi program beda, mungkin kita tolak atau biarkan. 
      // Untuk amannya, kita izinkan 1 DRAFT per user per program, di-handle oleh unique(user_id, program_id)
    }

    // 3. Check if biodata is complete (progress = 100%)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('biodata_progress')
      .eq('id', userId)
      .single();

    if (!profile || profile.biodata_progress < 100) {
      throw new Error('Lengkapi biodata terlebih dahulu sebelum mengajukan beasiswa.');
    }

    // 4. Check if student educational level matches program level
    const { data: akademik } = await supabaseAdmin
      .from('biodata_akademik')
      .select('jenjang')
      .eq('user_id', userId)
      .single();

    if (!akademik) {
      throw new Error('Lengkapi biodata akademik terlebih dahulu sebelum mengajukan beasiswa.');
    }

    const studentIsCollege = akademik.jenjang?.toLowerCase().includes('perguruan') || akademik.jenjang?.toUpperCase() === 'PERGURUAN_TINGGI';
    const programIsCollege = program.nama?.toLowerCase().includes('perguruan') || program.nama?.toLowerCase().includes('mahasiswa') || program.nama?.toLowerCase().includes('tinggi');

    if (studentIsCollege !== programIsCollege) {
      throw new Error(`Jenjang pendidikan Anda (${akademik.jenjang}) tidak sesuai dengan program beasiswa (${program.nama}).`);
    }

    // 4. Generate reference number (Temporary for DRAFT)
    const isDraft = status === 'DRAFT';
    const nomor_referensi = isDraft ? `DRF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}` : this.generateReferenceNumber();

    // 5. Insert application
    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert({
        user_id: userId,
        program_id,
        nomor_referensi,
        ipk,
        esai_motivasi,
        prestasi_non_akademik: prestasi_non_akademik || null,
        data_akademik: data_akademik ? JSON.parse(data_akademik) : null,
        status: status,
      })
      .select()
      .single();

    if (error) throw new Error(`Gagal membuat pengajuan: ${error.message}`);

    // 6. Decrease remaining quota ONLY IF NOT DRAFT
    if (!isDraft) {
      await supabaseAdmin
        .from('scholarship_programs')
        .update({ sisa_kuota: program.sisa_kuota - 1 })
        .eq('id', program_id);
    }

    return data;
  }

  /**
   * Submit an existing DRAFT application to PENDING
   */
  async submitApplication(applicationId: string, userId: string) {
    // 1. Get the draft application
    const { data: app, error: appError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .eq('user_id', userId)
      .single();

    if (appError || !app) throw new Error('Pengajuan tidak ditemukan.');
    if (app.status !== 'DRAFT') throw new Error('Pengajuan ini sudah dikirim sebelumnya.');

    // 2. Check if program exists and is active
    const program = await programService.getProgramById(app.program_id);
    if (program.status !== 'aktif') {
      throw new Error('Program beasiswa ini sudah ditutup.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(program.deadline);
    if (today > deadline) {
      throw new Error('Program beasiswa ini sudah ditutup karena melewati batas deadline.');
    }

    // 3. Check quota again
    if (program.sisa_kuota <= 0) {
      throw new Error('Kuota program beasiswa ini telah habis.');
    }

    // 4. Update status and generate final reference number
    const nomor_referensi = this.generateReferenceNumber();
    const { data: updatedApp, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({
        status: 'PENDING',
        nomor_referensi,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) throw new Error(`Gagal mengirim pengajuan: ${updateError.message}`);

    // 5. Decrease quota
    await supabaseAdmin
      .from('scholarship_programs')
      .update({ sisa_kuota: program.sisa_kuota - 1 })
      .eq('id', app.program_id);

    return updatedApp;
  }

  /**
   * Get all applications (admin)
   */
  async getAllApplications(status?: string) {
    let query = supabaseAdmin
      .from('applications')
      .select(`
        *,
        profiles (
          nama_lengkap,
          nim_nisn,
          email
        ),
        scholarship_programs (
          nama,
          nominal:monthly_amount
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Gagal mengambil data pengajuan: ${error.message}`);
    return data;
  }

  /**
   * Update application status (admin)
   */
  async updateApplicationStatus(
    applicationId: string,
    status: string,
    catatan_admin?: string
  ) {
    const validStatuses = ['PENDING', 'TERVERIFIKASI', 'REVISI', 'DITOLAK', 'DITERIMA', 'CADANGAN'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Status tidak valid. Pilihan: ${validStatuses.join(', ')}`);
    }

    const { data, error } = await supabaseAdmin
      .from('applications')
      .update({
        status,
        catatan_admin: catatan_admin || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw new Error(`Gagal mengupdate status: ${error.message}`);
    return data;
  }

  // ============ HELPERS ============

  private generateReferenceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BSK-${year}${month}-${random}`;
  }
}

export const scholarshipService = new ScholarshipService();
