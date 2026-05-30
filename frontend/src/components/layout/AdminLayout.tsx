import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import AdminHeader from './AdminHeader'
import type { UserInfo } from './AdminHeader'
import { useAuth } from '../../context/AuthContext'

function AdminLayout() {
  const { user, logout } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const currentUser: UserInfo = {
    name: user?.nama_lengkap ?? 'Admin User',
    role: user?.role === 'super_admin' ? 'Super Admin' : 'Admin',
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Fixed Left */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Area - Right Side */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Header - Sticky Top */}
        <AdminHeader
          user={currentUser}
          onLogout={logout}
        />

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
