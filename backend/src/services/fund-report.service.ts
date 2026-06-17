import { supabaseAdmin } from '../config/supabase';

export interface CreateReportPayload {
  application_id: string;
  bulan: string; // e.g. "Januari", "Februari"
  kategori: string; // e.g. "Buku", "SPP", "Akomodasi"
  jumlah: number;
  keterangan: string;
  bukti_url?: string;
}

class FundReportService {
  /**
   * Submit a new fund report (Siswa)
   */
  async createReport(userId: string, payload: CreateReportPayload) {
    const { application_id, bulan, kategori, jumlah, keterangan, bukti_url } = payload;

    // 1. Verify application ownership and accepted status
    const { data: app, error: appError } = await supabaseAdmin
      .from('applications')
      .select('id, status')
      .eq('id', application_id)
      .eq('user_id', userId)
      .single();

    if (appError || !app) {
      throw new Error('Pengajuan tidak ditemukan.');
    }

    if (app.status !== 'DITERIMA') {
      throw new Error('Hanya penerima beasiswa aktif yang dapat mengirimkan laporan penggunaan dana.');
    }

    // 2. Check if report for this month already exists
    const { data: existing } = await supabaseAdmin
      .from('fund_reports')
      .select('id')
      .eq('application_id', application_id)
      .eq('bulan', bulan)
      .single();

    if (existing) {
      throw new Error(`Laporan dana untuk bulan ${bulan} sudah pernah dikirim.`);
    }

    // 3. Create report
    const { data, error } = await supabaseAdmin
      .from('fund_reports')
      .insert({
        user_id: userId,
        application_id,
        bulan,
        kategori,
        jumlah,
        keterangan,
        bukti_url: bukti_url || null,
        status: 'dikirim', // auto submitted
      })
      .select()
      .single();

    if (error) throw new Error(`Gagal mengirim laporan: ${error.message}`);
    return data;
  }

  /**
   * Get user's own reports (Siswa)
   */
  async getUserReports(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('fund_reports')
      .select(`
        *,
        applications (
          nomor_referensi,
          scholarship_programs (
            nama
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Gagal mengambil laporan dana: ${error.message}`);
    return data;
  }

  /**
   * Get all reports (Admin)
   */
  async getAllReports(status?: string) {
    let query = supabaseAdmin
      .from('fund_reports')
      .select(`
        *,
        profiles (
          nama_lengkap,
          nim_nisn,
          email
        ),
        applications (
          nomor_referensi,
          scholarship_programs (
            nama
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Gagal mengambil data laporan dana: ${error.message}`);
    return data;
  }

  /**
   * Update report status (Admin Verify)
   */
  async updateReportStatus(reportId: string, status: 'terverifikasi' | 'ditolak', notes?: string) {
    const { data: existingReport, error: fetchErr } = await supabaseAdmin
      .from('fund_reports')
      .select('status')
      .eq('id', reportId)
      .single();

    if (fetchErr || !existingReport) {
      throw new Error('Laporan dana tidak ditemukan.');
    }

    // BR-30: Laporan Valid (terverifikasi) tidak bisa diubah
    if (existingReport.status === 'terverifikasi') {
      throw new Error('Laporan dana yang sudah terverifikasi VALID telah dikunci dan tidak dapat diubah.');
    }

    const { data, error } = await supabaseAdmin
      .from('fund_reports')
      .update({
        status,
        keterangan: notes ? `${notes} (Catatan Verifikasi)` : 'Diverifikasi oleh Admin',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw new Error(`Gagal memverifikasi laporan: ${error.message}`);
    return data;
  }

  /**
   * Generate signed upload URL for payment proof (Siswa)
   */
  async getReceiptUploadUrl(userId: string, applicationId: string, fileName: string) {
    // 1. Verify application ownership and accepted status
    const { data: app, error: appError } = await supabaseAdmin
      .from('applications')
      .select('id, status')
      .eq('id', applicationId)
      .eq('user_id', userId)
      .single();

    if (appError || !app) {
      throw new Error('Pengajuan tidak ditemukan.');
    }

    if (app.status !== 'DITERIMA') {
      throw new Error('Hanya penerima beasiswa aktif yang dapat mengunggah bukti pembayaran.');
    }

    const ext = fileName.split('.').pop() || 'jpg';
    const path = `${userId}/${applicationId}/receipts/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    // Auto-create/ensure documents bucket exists
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const bucket = buckets?.find(b => b.name === 'documents');
      if (!bucket) {
        await supabaseAdmin.storage.createBucket('documents', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        });
      }
    } catch (err: any) {
      console.warn('⚠️ Warning: failed to ensure documents bucket configuration:', err.message);
    }

    const { data, error } = await supabaseAdmin.storage
      .from('documents')
      .createSignedUploadUrl(path);

    if (error) throw new Error(`Gagal membuat upload URL: ${error.message}`);

    const { data: publicData } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(path);

    return {
      signedUrl: data.signedUrl,
      path,
      token: data.token,
      publicUrl: publicData.publicUrl,
    };
  }
}

export const fundReportService = new FundReportService();
