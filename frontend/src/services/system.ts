import { fetchApi } from './api'

export interface SystemSettings {
  min_ipk_sma: number | null
  min_ipk_pt: number
  max_penghasilan_ortu: number
  updated_by: { id: string; full_name: string } | null
  updated_at: string
}

export interface UpdateSystemSettingsPayload {
  min_ipk_sma?: number
  min_ipk_pt?: number
  max_penghasilan_ortu?: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function getSystemSettings(): Promise<SystemSettings> {
  const res = await fetchApi<ApiResponse<SystemSettings>>('/system/settings')
  return res.data
}

export async function updateSystemSettings(payload: UpdateSystemSettingsPayload): Promise<SystemSettings> {
  const res = await fetchApi<ApiResponse<SystemSettings>>('/system/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function getAuditLogs(params?: Record<string, string>): Promise<any> {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value)
    })
  }

  const query = searchParams.toString()
  const url = query ? `/admin/audit-logs?${query}` : '/admin/audit-logs'
  const res = await fetchApi<any>(url)
  return res
}
