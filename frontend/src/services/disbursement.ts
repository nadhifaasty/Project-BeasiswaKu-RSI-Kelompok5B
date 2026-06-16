import { fetchApi } from './api'

export interface DisbursementData {
  disbursement_id: string
  bank_name: string
  account_no_masked: string
  account_holder?: string
  cabang_bank?: string
  is_verified: boolean
  verified_at?: string | null
  status_pencairan?: string
}

export interface CreateDisbursementPayload {
  bank_name: string
  account_no: string
  account_holder: string
  cabang_bank?: string
  receipt_book_file?: string
  ktp_file?: string
}

export interface UpdateDisbursementPayload {
  bank_name?: string
  account_no?: string
  account_holder?: string
  cabang_bank?: string
  receipt_book_file?: string
  ktp_file?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function createDisbursement(payload: CreateDisbursementPayload): Promise<DisbursementData> {
  const res = await fetchApi<ApiResponse<DisbursementData>>('/disbursements', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function getMyDisbursement(): Promise<DisbursementData | null> {
  const res = await fetchApi<ApiResponse<DisbursementData | null>>('/disbursements/my')
  return res.data
}

export async function updateDisbursement(id: string, payload: UpdateDisbursementPayload): Promise<DisbursementData> {
  const res = await fetchApi<ApiResponse<DisbursementData>>(`/disbursements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return res.data
}

export interface VerifyDisbursementResponse {
  disbursement_id: string
  is_verified: boolean
  verified_at?: string | null
  verified_by?: string
  catatan?: string
}

export async function verifyDisbursement(id: string, is_verified: boolean, catatan?: string): Promise<VerifyDisbursementResponse> {
  const res = await fetchApi<ApiResponse<VerifyDisbursementResponse>>(`/disbursements/${id}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ is_verified, catatan }),
  })
  return res.data
}

export async function getBankAccountByUserId(userId: string): Promise<DisbursementData | null> {
  const res = await fetchApi<ApiResponse<DisbursementData | null>>(`/system/users/${userId}/bank-account`)
  return res.data
}

export interface DisbursementVerificationItem extends DisbursementData {
  user_id: string
  catatan?: string
  user: {
    id: string
    nama_lengkap: string
    nim_nisn: string
    email: string
  }
}

export async function getAllDisbursements(search?: string): Promise<DisbursementVerificationItem[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  const res = await fetchApi<ApiResponse<DisbursementVerificationItem[]>>(`/disbursements${query}`)
  return res.data
}
