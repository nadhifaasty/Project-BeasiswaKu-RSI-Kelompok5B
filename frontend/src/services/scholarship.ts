import { fetchApi } from './api'

// ============ TYPES ============

export interface ScholarshipProgram {
  id: string
  nama: string
  deskripsi: string
  nominal: string
  deadline: string
  kuota: number
  sisa_kuota: number
  status: 'aktif' | 'ditutup' | 'OPEN' | 'CLOSED' | 'DRAFT'
  created_at: string
}

export interface Application {
  id: string
  user_id: string
  program_id: string
  nomor_referensi: string
  ipk: number
  esai_motivasi: string
  prestasi_non_akademik: string | null
  status: 'PENDING' | 'TERVERIFIKASI' | 'REVISI' | 'DITOLAK' | 'DITERIMA' | 'CADANGAN'
  skor_kelayakan: number | null
  catatan_admin: string | null
  created_at: string
  updated_at: string
  scholarship_programs?: {
    nama: string
    nominal: string
    deadline: string
    status: string
  }
}

export interface CreateApplicationPayload {
  program_id: string
  status?: 'DRAFT' | 'PENDING'
  data_akademik?: string
  ipk: number
  esai_motivasi: string
  prestasi_non_akademik?: string
}

export interface CreateProgramPayload {
  name: string
  target_level: 'SMA' | 'PERGURUAN_TINGGI'
  nominal: number
  quota: number
  deadline: string
  description?: string
  requirements?: any
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// ============ API CALLS ============

export async function getPrograms(): Promise<ScholarshipProgram[]> {
  const res = await fetchApi<ApiResponse<ScholarshipProgram[]>>('/programs')
  return res.data
}

export async function getProgramById(id: string): Promise<ScholarshipProgram> {
  const res = await fetchApi<ApiResponse<ScholarshipProgram>>(`/programs/${id}`)
  return res.data
}

export async function getUserApplications(): Promise<Application[]> {
  const res = await fetchApi<ApiResponse<Application[]>>('/applications/my')
  return res.data
}

export async function getApplicationById(id: string): Promise<Application> {
  const res = await fetchApi<ApiResponse<Application>>(`/applications/${id}`)
  return res.data
}

export async function createApplication(payload: CreateApplicationPayload): Promise<Application> {
  const res = await fetchApi<ApiResponse<Application>>('/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data!
}

export async function submitApplication(applicationId: string): Promise<Application> {
  const res = await fetchApi<ApiResponse<Application>>(`/applications/${applicationId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ confirmation: true }),
  })
  return res.data!
}

export async function createProgramAdmin(payload: CreateProgramPayload): Promise<ScholarshipProgram> {
  const res = await fetchApi<ApiResponse<ScholarshipProgram>>('/programs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data!
}

export async function updateProgramAdmin(id: string, payload: Partial<CreateProgramPayload>): Promise<ScholarshipProgram> {
  const res = await fetchApi<ApiResponse<ScholarshipProgram>>(`/programs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return res.data!
}

export async function updateProgramStatusAdmin(id: string, status: 'aktif' | 'ditutup'): Promise<ScholarshipProgram> {
  const res = await fetchApi<ApiResponse<ScholarshipProgram>>(`/programs/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  return res.data!
}

export interface SelectionWeights {
  bobot_akademik: number
  bobot_ekonomi: number
  bobot_prestasi: number
  bobot_dokumen: number
}

export async function updateSelectionWeights(programId: string, weights: SelectionWeights): Promise<any> {
  const res = await fetchApi<ApiResponse<any>>(`/selections/${programId}/weights`, {
    method: 'PATCH',
    body: JSON.stringify(weights),
  })
  return res.data!
}

export async function runSelection(programId: string, weights: SelectionWeights): Promise<any> {
  const res = await fetchApi<ApiResponse<any>>(`/selections/${programId}/run`, {
    method: 'POST',
    body: JSON.stringify(weights),
  })
  return res.data!
}

export async function getSelectionResults(programId: string): Promise<any> {
  const res = await fetchApi<ApiResponse<any>>(`/selections/${programId}/results`)
  return res.data!
}

export async function finalizeSelection(programId: string): Promise<any> {
  const res = await fetchApi<ApiResponse<any>>(`/selections/${programId}/finalize`, {
    method: 'POST',
  })
  return res.data!
}

export async function rollbackSelection(programId: string): Promise<any> {
  const res = await fetchApi<ApiResponse<any>>(`/selections/${programId}/rollback`, {
    method: 'POST',
  })
  return res.data!
}

