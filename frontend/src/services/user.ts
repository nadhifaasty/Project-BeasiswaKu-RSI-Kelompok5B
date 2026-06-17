import { fetchApi } from './api'

export interface UserProfile {
  id: string
  nama_lengkap: string
  nim_nisn: string
  nomor_hp: string
  email: string
  role: 'siswa' | 'admin' | 'super_admin'
  biodata_progress: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface UsersResponse {
  users: UserProfile[]
  meta: PaginationMeta
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function getUsers(params?: Record<string, string>): Promise<UsersResponse> {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value)
      }
    })
  }

  const query = searchParams.toString()
  const url = query ? `/users?${query}` : '/users'
  const res = await fetchApi<ApiResponse<UsersResponse>>(url)
  return res.data
}

export async function getUserById(id: string): Promise<UserProfile> {
  const res = await fetchApi<ApiResponse<UserProfile>>(`/users/${id}`)
  return res.data
}

export async function updateUserProfile(
  id: string,
  payload: { nama_lengkap?: string; nim_nisn?: string; nomor_hp?: string }
): Promise<UserProfile> {
  const res = await fetchApi<ApiResponse<UserProfile>>(`/users/${id}/profile`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function updateUserRole(id: string, role: 'siswa' | 'admin' | 'super_admin'): Promise<UserProfile> {
  const res = await fetchApi<ApiResponse<UserProfile>>(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
  return res.data
}

export async function updateUserStatus(id: string, is_active: boolean): Promise<UserProfile> {
  const res = await fetchApi<ApiResponse<UserProfile>>(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active }),
  })
  return res.data
}
