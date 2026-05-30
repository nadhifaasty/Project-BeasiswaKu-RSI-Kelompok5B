import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../context/AuthContext'

interface ProtectedRouteProps {
  /** Roles allowed to access this route. If empty/undefined, any authenticated user can access. */
  allowedRoles?: UserRole[]
  /** Optional custom redirect path for unauthenticated users */
  loginPath?: string
  /** Optional custom redirect path for unauthorized users (wrong role) */
  unauthorizedPath?: string
}

/**
 * ProtectedRoute - Route guard component
 *
 * Usage in router:
 *   <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
 *     <Route path="/admin/dashboard" element={<AdminDashboard />} />
 *   </Route>
 */
function ProtectedRoute({
  allowedRoles,
  loginPath = '/login',
  unauthorizedPath = '/unauthorized',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth()
  const location = useLocation()

  // Show nothing while checking session (prevents flash)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#2E75B6] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    )
  }

  // Not authenticated → redirect to login (preserve intended destination)
  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  // Authenticated but role not allowed → redirect to unauthorized
  if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return <Navigate to={unauthorizedPath} replace />
  }

  // All checks passed → render child routes
  return <Outlet />
}

export default ProtectedRoute
export type { ProtectedRouteProps }
