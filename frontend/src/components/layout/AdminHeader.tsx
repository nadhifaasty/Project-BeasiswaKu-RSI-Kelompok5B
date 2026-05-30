import { useLocation, useNavigate } from 'react-router-dom'

interface UserInfo {
  /** Display name of the logged-in user */
  name: string
  /** Role of the user */
  role: 'Admin' | 'Super Admin'
}

interface AdminHeaderProps {
  /** Currently logged-in user information */
  user: UserInfo
  /** Callback when logout button is clicked */
  onLogout: () => void
}

/** Map route segments to readable breadcrumb labels */
const breadcrumbLabels: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  pengajuan: 'Pengajuan',
  'parameter-seleksi': 'Parameter Seleksi',
  'audit-log': 'Audit Log',
  evaluasi: 'Evaluasi',
}

function AdminHeader({ user, onLogout }: AdminHeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()

  /** Generate breadcrumb items from current pathname */
  const getBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean)
    const crumbs: { label: string; path: string }[] = []

    segments.forEach((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/')
      const label = breadcrumbLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      crumbs.push({ label, path })
    })

    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3"
    >
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.path} className="flex items-center gap-1.5">
              {index > 0 && (
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-gray-800">{crumb.label}</span>
              ) : (
                <button
                  onClick={() => navigate(crumb.path)}
                  className="text-gray-500 hover:text-[#2E75B6] transition"
                >
                  {crumb.label}
                </button>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* User Info & Logout */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
        </div>

        {/* Avatar placeholder */}
        <div className="w-9 h-9 rounded-full bg-[#1F4E79] flex items-center justify-center text-white text-sm font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition"
          aria-label="Logout"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  )
}

export default AdminHeader
export type { AdminHeaderProps, UserInfo }
