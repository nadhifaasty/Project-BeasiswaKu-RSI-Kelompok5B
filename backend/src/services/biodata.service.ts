import { supabaseAdmin } from '../config/supabase';

// ============ TYPES ============

export interface BiodataPribadi {
  nama_lengkap: string;
  nim_nisn: string;
  email: string;
  nomor_hp: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  agama?: string;
}

export interface BiodataAlamat {
  alamat: string;
  rt_rw?: string;
  kelurahan?: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kode_pos: string;
}

export interface BiodataOrangTua {
  ayah_nama: string;
  ayah_pekerjaan: string;
  ayah_penghasilan: number;
  ibu_nama: string;
  ibu_pekerjaan: string;
  ibu_penghasilan: number;
}

export interface BiodataAkademik {
  jenjang: string;
  asal_institusi: string;
  program_studi: string;
  ipk_nilai: number;
}

// ============ SERVICE ============

class BiodataService {
  /**
   * Get all biodata sections for a user
   */
  async getAll(userId: string) {
    const [pribadi, alamat, orangTua, akademik] = await Promise.all([
      supabaseAdmin.from('biodata_pribadi').select('*').eq('user_id', userId).single(),
      supabaseAdmin.from('biodata_alamat').select('*').eq('user_id', userId).single(),
      supabaseAdmin.from('biodata_orang_tua').select('*').eq('user_id', userId).single(),
      supabaseAdmin.from('biodata_akademik').select('*').eq('user_id', userId).single(),
    ]);

    return {
      pribadi: pribadi.data || null,
      alamat: alamat.data || null,
      orang_tua: orangTua.data || null,
      akademik: akademik.data || null,
    };
  }

  /**
   * Get biodata pribadi
   */
  async getPribadi(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('biodata_pribadi')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  }

  /**
   * Upsert biodata pribadi
   */
  async upsertPribadi(userId: string, payload: BiodataPribadi) {
    const { data, error } = await supabaseAdmin
      .from('biodata_pribadi')
      .upsert(
        { user_id: userId, ...payload, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw new Error(`Gagal menyimpan biodata pribadi: ${error.message}`);
    await this.updateProgress(userId);
    return data;
  }

  /**
   * Get biodata alamat
   */
  async getAlamat(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('biodata_alamat')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  }

  /**
   * Upsert biodata alamat
   */
  async upsertAlamat(userId: string, payload: BiodataAlamat) {
    const { data, error } = await supabaseAdmin
      .from('biodata_alamat')
      .upsert(
        { user_id: userId, ...payload, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw new Error(`Gagal menyimpan biodata alamat: ${error.message}`);
    await this.updateProgress(userId);
    return data;
  }

  /**
   * Get biodata orang tua
   */
  async getOrangTua(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('biodata_orang_tua')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  }

  /**
   * Upsert biodata orang tua
   */
  async upsertOrangTua(userId: string, payload: BiodataOrangTua) {
    const { data, error } = await supabaseAdmin
      .from('biodata_orang_tua')
      .upsert(
        { user_id: userId, ...payload, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw new Error(`Gagal menyimpan biodata orang tua: ${error.message}`);
    await this.updateProgress(userId);
    return data;
  }

  /**
   * Get biodata akademik
   */
  async getAkademik(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('biodata_akademik')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  }

  /**
   * Upsert biodata akademik
   */
  async upsertAkademik(userId: string, payload: BiodataAkademik) {
    const { data, error } = await supabaseAdmin
      .from('biodata_akademik')
      .upsert(
        { user_id: userId, ...payload, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw new Error(`Gagal menyimpan biodata akademik: ${error.message}`);
    await this.updateProgress(userId);
    return data;
  }

  /**
   * Calculate and update biodata_progress in profiles table.
   * Each section filled = 25% (4 sections total = 100%)
   */
  private async updateProgress(userId: string) {
    const [pribadi, alamat, orangTua, akademik] = await Promise.all([
      supabaseAdmin.from('biodata_pribadi').select('id').eq('user_id', userId).single(),
      supabaseAdmin.from('biodata_alamat').select('id').eq('user_id', userId).single(),
      supabaseAdmin.from('biodata_orang_tua').select('id').eq('user_id', userId).single(),
      supabaseAdmin.from('biodata_akademik').select('id').eq('user_id', userId).single(),
    ]);

    let progress = 0;
    if (pribadi.data) progress += 25;
    if (alamat.data) progress += 25;
    if (orangTua.data) progress += 25;
    if (akademik.data) progress += 25;

    await supabaseAdmin
      .from('profiles')
      .update({ biodata_progress: progress, updated_at: new Date().toISOString() })
      .eq('id', userId);
  }
}

export const biodataService = new BiodataService();
