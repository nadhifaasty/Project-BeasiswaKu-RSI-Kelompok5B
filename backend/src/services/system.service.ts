import { supabaseAdmin } from '../config/supabase';

interface SettingsData {
  min_ipk_sma?: number | null;
  min_ipk_pt?: number;
  max_penghasilan_ortu?: number;
}

class SystemService {
  private readonly SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

  async getSettings() {
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select(`
        *,
        profiles:updated_by (
          id,
          nama_lengkap
        )
      `)
      .eq('id', this.SETTINGS_ID)
      .single();

    if (error) throw new Error(`Gagal mengambil konfigurasi sistem: ${error.message}`);

    return {
      min_ipk_sma: data.min_ipk_sma,
      min_ipk_pt: data.min_ipk_pt,
      max_penghasilan_ortu: data.max_penghasilan_ortu,
      updated_by: data.profiles ? { id: data.profiles.id, full_name: data.profiles.nama_lengkap } : null,
      updated_at: data.updated_at,
    };
  }

  async updateSettings(adminId: string, settings: SettingsData) {
    const { min_ipk_sma, min_ipk_pt, max_penghasilan_ortu } = settings;

    if (min_ipk_sma !== undefined && min_ipk_sma !== null) {
      if (min_ipk_sma < 0 || min_ipk_sma > 4) {
        throw new Error('Nilai IPK SMA tidak valid. Harus antara 0.00 dan 4.00.');
      }
    }

    if (min_ipk_pt !== undefined) {
      if (min_ipk_pt < 0 || min_ipk_pt > 4) {
        throw new Error('Nilai IPK PT tidak valid. Harus antara 0.00 dan 4.00.');
      }
    }

    if (max_penghasilan_ortu !== undefined) {
      if (max_penghasilan_ortu < 0) {
        throw new Error('Nilai maksimal penghasilan harus lebih dari 0.');
      }
    }

    const updateData: Record<string, any> = {
      updated_by: adminId,
      updated_at: new Date().toISOString(),
    };

    if (min_ipk_sma !== undefined) updateData.min_ipk_sma = min_ipk_sma;
    if (min_ipk_pt !== undefined) updateData.min_ipk_pt = min_ipk_pt;
    if (max_penghasilan_ortu !== undefined) updateData.max_penghasilan_ortu = max_penghasilan_ortu;

    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .update(updateData)
      .eq('id', this.SETTINGS_ID)
      .select(`
        *,
        profiles:updated_by (
          id,
          nama_lengkap
        )
      `)
      .single();

    if (error) throw new Error(`Gagal memperbarui konfigurasi: ${error.message}`);

    return {
      min_ipk_sma: data.min_ipk_sma,
      min_ipk_pt: data.min_ipk_pt,
      max_penghasilan_ortu: data.max_penghasilan_ortu,
      updated_by: data.profiles ? { id: data.profiles.id, full_name: data.profiles.nama_lengkap } : null,
      updated_at: data.updated_at,
    };
  }

  async triggerReminder(adminId: string) {
    const { data: recipients, error: recipientsError } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        user_id,
        profiles (
          id,
          email,
          nama_lengkap
        )
      `)
      .eq('status', 'DITERIMA');

    if (recipientsError) throw new Error(`Gagal mengambil data penerima: ${recipientsError.message}`);

    const now = new Date();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const currentMonth = monthNames[now.getMonth()];

    let alreadyReported = 0;
    let targeted = 0;

    for (const app of recipients || []) {
      const { data: existingReport } = await supabaseAdmin
        .from('fund_reports')
        .select('id')
        .eq('application_id', app.id)
        .eq('bulan', currentMonth)
        .maybeSingle();

      if (existingReport) {
        alreadyReported++;
      } else {
        targeted++;
      }
    }

    return {
      recipients_targeted: targeted,
      emails_queued: targeted,
      skipped_already_reported: alreadyReported,
    };
  }
}

export const systemService = new SystemService();
