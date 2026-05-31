import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchApi, ApiError } from '../services/api'

// ============ TYPES ============

type UserRole = 'siswa' | 'admin' | 'super_admin'

interface AuthUser {
  id: string
  nama_lengkap: string
  email: string
  role: UserRole
  nim_nisn: string
}

interface LoginResponse {
  success: boolean
  message: string
  data: {
    accessToken: string
    refreshToken: string
    user: AuthUser
  }
}

interface AuthContextState {
  user: AuthUser | null
  token: string | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// ============ CONTEXT ============

const AuthContext = createContext<AuthContextState | undefined>(undefined)

// ============ PROVIDER ============

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Derived state
  const isAuthenticated = !!token && !!user
  const role = user?.role ?? null

  /**
   * On mount: restore session from sessionStorage
   */
  useEffect(() => {
    const storedToken = sessionStorage.getItem('accessToken')
    const storedUser = sessionStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        const parsedUser: AuthUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
      } catch {
        // Corrupted data, clear it
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('refreshToken')
        sessionStorage.removeItem('user')
      }
    }

    setIsLoading(false)
  }, [])

  /**
   * Login: hit API, store tokens, redirect based on role
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const response = await fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    const { accessToken, refreshToken, user: userData } = response.data

    // Persist to sessionStorage
    sessionStorage.setItem('accessToken', accessToken)
    sessionStorage.setItem('refreshToken', refreshToken)
    sessionStorage.setItem('user', JSON.stringify(userData))

    // Update state
    setToken(accessToken)
    setUser(userData)

    // Redirect based on role
    switch (userData.role) {
      case 'super_admin':
        navigate('/superadmin/dashboard', { replace: true })
        break
      case 'admin':
        navigate('/admin/dashboard', { replace: true })
        break
      case 'siswa':
      default:
        navigate('/dashboard', { replace: true })
        break
    }
  }, [navigate])

  /**
   * Logout: clear everything and redirect to login
   */
  const logout = useCallback(() => {
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
    sessionStorage.removeItem('user')
    setToken(null)
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value: AuthContextState = {
    user,
    token,
    role,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ============ HOOK ============

function useAuth(): AuthContextState {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthProvider, useAuth, ApiError }
export type { AuthUser, UserRole, AuthContextState }
