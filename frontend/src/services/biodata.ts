import { fetchApi } from './api'

// ============ TYPES ============

export interface BiodataPribadi {
  id?: string
  user_id?: string
  nama_lengkap: string
  nim_nisn: string
  email: string
  nomor_hp: string
  tempat_lahir?: string
  tanggal_lahir?: string
  jenis_kelamin?: string
  agama?: string
}

export interface BiodataAlamat {
  id?: string
  user_id?: string
  alamat: string
  rt_rw?: string
  kelurahan?: string
  provinsi: string
  kota: string
  kecamatan: string
  kode_pos: string
}

export interface BiodataOrangTua {
  id?: string
  user_id?: string
  ayah_nama: string
  ayah_pekerjaan: string
  ayah_penghasilan: number
  ibu_nama: string
  ibu_pekerjaan: string
  ibu_penghasilan: number
}

export interface BiodataAkademik {
  id?: string
  user_id?: string
  jenjang: string
  asal_institusi: string
  program_studi: string
  ipk_nilai: number
}

export interface AllBiodata {
  pribadi: BiodataPribadi | null
  alamat: BiodataAlamat | null
  orang_tua: BiodataOrangTua | null
  akademik: BiodataAkademik | null
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// ============ API CALLS ============

export async function getAllBiodata(): Promise<AllBiodata> {
  const res = await fetchApi<ApiResponse<AllBiodata>>('/users/me/profile')
  return res.data
}

export async function getBiodataStatus(): Promise<{ completion_pct: number }> {
  const res = await fetchApi<ApiResponse<{ completion_pct: number }>>('/users/me/profile/status')
  return res.data
}

export async function getBiodataPribadi(): Promise<BiodataPribadi | null> {
  const res = await fetchApi<ApiResponse<BiodataPribadi | null>>('/users/me/profile/pribadi')
  return res.data
}

export async function saveBiodataPribadi(payload: BiodataPribadi): Promise<BiodataPribadi> {
  const res = await fetchApi<ApiResponse<BiodataPribadi>>('/users/me/profile/pribadi', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function getBiodataAlamat(): Promise<BiodataAlamat | null> {
  const res = await fetchApi<ApiResponse<BiodataAlamat | null>>('/users/me/profile/alamat')
  return res.data
}

export async function saveBiodataAlamat(payload: BiodataAlamat): Promise<BiodataAlamat> {
  const res = await fetchApi<ApiResponse<BiodataAlamat>>('/users/me/profile/alamat', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function getBiodataOrangTua(): Promise<BiodataOrangTua | null> {
  const res = await fetchApi<ApiResponse<BiodataOrangTua | null>>('/users/me/profile/orang-tua')
  return res.data
}

export async function saveBiodataOrangTua(payload: BiodataOrangTua): Promise<BiodataOrangTua> {
  const res = await fetchApi<ApiResponse<BiodataOrangTua>>('/users/me/profile/orang-tua', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function getBiodataAkademik(): Promise<BiodataAkademik | null> {
  const res = await fetchApi<ApiResponse<BiodataAkademik | null>>('/users/me/profile/akademik')
  return res.data
}

export async function saveBiodataAkademik(payload: BiodataAkademik): Promise<BiodataAkademik> {
  const res = await fetchApi<ApiResponse<BiodataAkademik>>('/users/me/profile/akademik', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return res.data
}
