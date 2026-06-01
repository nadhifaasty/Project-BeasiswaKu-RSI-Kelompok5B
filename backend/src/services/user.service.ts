import { supabaseAdmin } from '../config/supabase';

export interface ProfileData {
  pribadi?: {
    nama_lengkap: string;
    nim_nisn: string;
    email: string;
    nomor_hp: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    jenis_kelamin?: string;
    agama?: string;
  };
  alamat?: {
    alamat: string;
    rt_rw?: string;
    kelurahan?: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    kode_pos: string;
  };
  orang_tua?: {
    ayah_nama: string;
    ayah_pekerjaan: string;
    ayah_penghasilan: string;
    ibu_nama: string;
    ibu_pekerjaan: string;
    ibu_penghasilan: string;
  };
  akademik?: {
    jenjang: string;
    asal_institusi: string;
    program_studi: string;
    ipk_nilai: number;
  };
}

export async function getProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, nama_lengkap, nim_nisn, email, nomor_hp, role, biodata_progress, biodata_complete, profile_data, created_at, updated_at')
    .eq('id', userId).single();

  if (error) throw new Error(`Gagal mengambil profil: ${error.message}`);

  return {
    id: data.id,
    nama_lengkap: data.nama_lengkap,
    nim_nisn: data.nim_nisn,
    email: data.email,
    nomor_hp: data.nomor_hp,
    role: data.role,
    biodata_progress: data.biodata_progress,
    biodata_complete: data.biodata_complete,
    profile_data: data.profile_data as ProfileData,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function updateProfile(userId: string, profileData: Partial<ProfileData>) {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('profiles').select('profile_data, biodata_progress').eq('id', userId).single();
  if (fetchError) throw new Error(`Gagal mengambil profil: ${fetchError.message}`);

  const merged = { ...(existing.profile_data as object), ...profileData };

  const sections = ['pribadi', 'alamat', 'orang_tua', 'akademik'] as const;
  let filled = 0;
  for (const section of sections) {
    if ((merged as any)[section]) filled++;
  }
  const progress = Math.round((filled / 4) * 100);
  const complete = filled === 4;

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ profile_data: merged, biodata_progress: progress, biodata_complete: complete, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (updateError) throw new Error(`Gagal menyimpan profil: ${updateError.message}`);

  return { biodata_progress: progress, biodata_complete: complete };
}
