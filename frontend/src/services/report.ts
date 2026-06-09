import { fetchApi } from './api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface MonthlyReportPayload {
  application_id: string
  bulan: string
  kategori: string
  jumlah: number
  keterangan: string
  bukti_url?: string
}

export async function exportReportExcel(params?: Record<string, string>): Promise<Blob> {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value)
    })
  }

  const query = searchParams.toString()
  const url = query ? `/reports/export?${query}` : '/reports/export'

  // Because the backend returns a file stream, we can't use the standard fetchApi wrapper
  // We need to do a raw fetch to get the blob
  const token = sessionStorage.getItem('accessToken')
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  
  const response = await fetch(`${baseUrl}${url}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })

  if (!response.ok) {
    let errorMsg = 'Gagal mengunduh file'
    try {
      const errData = await response.json()
      errorMsg = errData.message || errorMsg
    } catch (e) {
      // Ignore
    }
    throw new Error(errorMsg)
  }

  return response.blob()
}

export async function getMonthlyReports(userId: string): Promise<any> {
  const res = await fetchApi<ApiResponse<any>>(`/reports/monthly/${userId}`)
  return res.data
}

export async function submitMonthlyReport(payload: MonthlyReportPayload): Promise<any> {
  const res = await fetchApi<ApiResponse<any>>('/reports/monthly', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return res.data
}

export async function verifyMonthlyReport(id: string, payload: { status: 'terverifikasi' | 'ditolak', catatan_admin?: string }): Promise<any> {
  const res = await fetchApi<ApiResponse<any>>(`/reports/monthly/${id}/verify`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
  return res.data
}

export async function getProgramReports(id?: string): Promise<any> {
  const url = id ? `/admin/reports/programs/${id}` : '/admin/evaluations'
  const res = await fetchApi<ApiResponse<any>>(url)
  return res.data || res
}
