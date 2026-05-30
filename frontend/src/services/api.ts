const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

interface ApiErrorResponse {
  success: false
  message: string
  error?: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Generic fetch wrapper with proper error handling.
 * Automatically attaches Content-Type and Bearer token if available.
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = sessionStorage.getItem('accessToken')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await res.json()

  if (!res.ok) {
    const errorData = data as ApiErrorResponse
    throw new ApiError(
      errorData.message || `Request failed with status ${res.status}`,
      res.status
    )
  }

  return data as T
}
