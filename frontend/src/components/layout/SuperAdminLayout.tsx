import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SuperAdminSidebar from './SuperAdminSidebar'
import { useAuth } from '../../context/AuthContext'

const breadcrumbLabels: Record<string, string> = {
  superadmin: 'Super Admin',
  dashboard: 'Dashboard',
  'audit-log': 'Audit Log',
  evaluasi: 'Evaluasi Program',
  pengaturan: 'Pengaturan',
}

function SuperAdminLayout() {
  const { user } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  const segments = location.pathname.split('/').filter(Boolean)
  const lastLabel = breadcrumbLabels[segments[segments.length - 1]] || 'Dashboard'

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <SuperAdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        }`}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Dashboard</span>
            <span className="text-gray-300">&gt;</span>
            <span className="text-primary font-medium">{lastLabel === 'Dashboard' ? 'Super Admin' : lastLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition" aria-label="Notifikasi">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {user?.nama_lengkap?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {user?.nama_lengkap || 'superadmin'}
                </p>
                <p className="text-xs text-green-600">Online</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SuperAdminLayout
