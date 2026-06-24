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
    const validStatuses = ['PENDING', 'TERVERIFIKASI', 'REVISI', 'DITOLAK', 'DITERIMA'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Status tidak valid. Pilihan: ${validStatuses.join(', ')}`);
    }

    // Check if currently accepted (DITERIMA)
    const { data: currentApp, error: fetchErr } = await supabaseAdmin
      .from('applications')
      .select('status, program_id')
      .eq('id', applicationId)
      .maybeSingle();

    if (fetchErr || !currentApp) {
      throw new Error('Pengajuan tidak ditemukan.');
    }

    if (currentApp.status === 'DITERIMA') {
      throw new Error('Pengajuan yang sudah lolos (DITERIMA) tidak dapat diubah statusnya lagi.');
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

    // Adjust remaining quota
    if (status === 'DITERIMA' && currentApp.status !== 'DITERIMA') {
      const { data: program } = await supabaseAdmin
        .from('scholarship_programs')
        .select('sisa_kuota')
        .eq('id', currentApp.program_id)
        .single();
      if (program) {
        await supabaseAdmin
          .from('scholarship_programs')
          .update({ sisa_kuota: Math.max(0, program.sisa_kuota - 1) })
          .eq('id', currentApp.program_id);
      }
    } else if (currentApp.status === 'DITERIMA' && status !== 'DITERIMA') {
      const { data: program } = await supabaseAdmin
        .from('scholarship_programs')
        .select('sisa_kuota')
        .eq('id', currentApp.program_id)
        .single();
      if (program) {
        await supabaseAdmin
          .from('scholarship_programs')
          .update({ sisa_kuota: program.sisa_kuota + 1 })
          .eq('id', currentApp.program_id);
      }
    }

    // Automatically validate all documents when application is verified or accepted
    if (status === 'TERVERIFIKASI' || status === 'DITERIMA') {
      const { error: docUpdateErr } = await supabaseAdmin
        .from('application_documents')
        .update({ status: 'tervalidasi' })
        .eq('application_id', applicationId);
      if (docUpdateErr) {
        console.error('Error auto-validating application documents:', docUpdateErr);
      }
    }

    // Sync with selection results
    try {
      if (['DITERIMA', 'DITOLAK'].includes(status)) {
        const { data: selectionResult } = await supabaseAdmin
          .from('selection_results')
          .select('id')
          .eq('application_id', applicationId)
          .maybeSingle();

        if (selectionResult) {
          await supabaseAdmin
            .from('selection_results')
            .update({ hasil: status })
            .eq('application_id', applicationId);
        } else {
          // Fetch application data
          const { data: appData } = await supabaseAdmin
            .from('applications')
            .select('program_id, ipk, user_id, esai_motivasi, prestasi_non_akademik')
            .eq('id', applicationId)
            .single();

          if (appData) {
            const userId = appData.user_id;
            const [acadRes, ortuRes, docsRes] = await Promise.all([
              supabaseAdmin.from('biodata_akademik').select('ipk_nilai, jenjang').eq('user_id', userId).maybeSingle(),
              supabaseAdmin.from('biodata_orang_tua').select('ayah_penghasilan, ibu_penghasilan').eq('user_id', userId).maybeSingle(),
              supabaseAdmin.from('application_documents').select('id').eq('application_id', applicationId).eq('status', 'tervalidasi')
            ]);

            const acad = acadRes.data;
            const ortu = ortuRes.data;
            const docs = docsRes.data;

            const ipk = acad?.ipk_nilai ? Number(acad.ipk_nilai) : Number(appData.ipk || 0);
            const jenjang = acad?.jenjang || '';
            const isCollege = jenjang.toLowerCase().includes('perguruan') || jenjang.toUpperCase() === 'PERGURUAN_TINGGI';
            const skor_akademik = isCollege ? Math.min(Math.max((ipk / 4.0) * 100, 0), 100) : Math.min(Math.max(ipk, 0), 100);

            const totalPenghasilan = Number(ortu?.ayah_penghasilan || 0) + Number(ortu?.ibu_penghasilan || 0);
            let skor_ekonomi = 20;
            if (totalPenghasilan <= 1500000) {
              skor_ekonomi = 100;
            } else if (totalPenghasilan <= 3000000) {
              skor_ekonomi = 80;
            } else if (totalPenghasilan <= 5000000) {
              skor_ekonomi = 60;
            } else if (totalPenghasilan <= 7500000) {
              skor_ekonomi = 40;
            }

            const prestasiText = appData.prestasi_non_akademik || '';
            let skor_prestasi = 0;
            if (prestasiText.trim().length > 0) {
              const textLower = prestasiText.toLowerCase();
              if (textLower.includes('nasional')) {
                skor_prestasi = 100;
              } else if (textLower.includes('provinsi')) {
                skor_prestasi = 90;
              } else if (textLower.includes('kota') || textLower.includes('kabupaten')) {
                skor_prestasi = 80;
              } else {
                skor_prestasi = 70;
              }
            }

            const validDocsCount = docs ? docs.length : 0;
            const skor_dokumen = Math.min((validDocsCount / 5.0) * 100, 100);

            // Get weights for program (or default to 40, 35, 15, 10)
            const { data: wData } = await supabaseAdmin
              .from('selection_weights')
              .select('*')
              .eq('program_id', appData.program_id)
              .maybeSingle();

            const WA = (wData?.bobot_akademik !== undefined ? Number(wData.bobot_akademik) : 40) / 100.0;
            const WE = (wData?.bobot_ekonomi !== undefined ? Number(wData.bobot_ekonomi) : 35) / 100.0;
            const WP = (wData?.bobot_prestasi !== undefined ? Number(wData.bobot_prestasi) : 15) / 100.0;
            const WD = (wData?.bobot_dokumen !== undefined ? Number(wData.bobot_dokumen) : 10) / 100.0;

            const skor_total = (skor_akademik * WA) + (skor_ekonomi * WE) + (skor_prestasi * WP) + (skor_dokumen * WD);

            await supabaseAdmin
              .from('selection_results')
              .upsert({
                application_id: applicationId,
                skor_akademik,
                skor_ekonomi,
                skor_prestasi,
                skor_dokumen,
                skor_total,
                hasil: status,
                created_at: new Date().toISOString()
              }, { onConflict: 'application_id' });
          }
        }
      } else {
        // If status is PENDING, TERVERIFIKASI, REVISI, delete from selection_results if exists
        await supabaseAdmin
          .from('selection_results')
          .delete()
          .eq('application_id', applicationId);
      }
    } catch (err) {
      console.error('Error syncing selection_results in updateApplicationStatus:', err);
    }

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
