import { fetchApi, type ApiResponse } from './api'

export interface ProfilePribadi {
  nama_lengkap: string
  nim_nisn: string
  email: string
  nomor_hp: string
  tempat_lahir?: string
  tanggal_lahir?: string
  jenis_kelamin?: string
  agama?: string
}

export interface ProfileAlamat {
  alamat: string
  rt_rw?: string
  kelurahan?: string
  provinsi: string
  kota: string
  kecamatan: string
  kode_pos: string
}

export interface ProfileOrangTua {
  ayah_nama: string
  ayah_pekerjaan: string
  ayah_penghasilan: number
  ibu_nama: string
  ibu_pekerjaan: string
  ibu_penghasilan: number
}

export interface ProfileAkademik {
  jenjang: string
  asal_institusi: string
  program_studi: string
  ipk_nilai: number
}

export interface ProfileData {
  pribadi?: ProfilePribadi
  alamat?: ProfileAlamat
  orang_tua?: ProfileOrangTua
  akademik?: ProfileAkademik
}

export interface UserProfile {
  id: string
  nama_lengkap: string
  nim_nisn: string
  email: string
  nomor_hp: string
  role: string
  biodata_progress: number
  biodata_complete: boolean
  profile_data: ProfileData
  created_at: string
  updated_at: string
}

export async function getProfile(): Promise<UserProfile> {
  const res = await fetchApi<ApiResponse<UserProfile>>('/users/me/profile')
  return res.data!
}

export async function updateProfile(profileData: Partial<ProfileData>): Promise<{ biodata_progress: number; biodata_complete: boolean }> {
  const res = await fetchApi<ApiResponse<{ biodata_progress: number; biodata_complete: boolean }>>('/users/me/profile', {
    method: 'PATCH',
    body: JSON.stringify({ profile_data: profileData }),
  })
  return res.data!
}
