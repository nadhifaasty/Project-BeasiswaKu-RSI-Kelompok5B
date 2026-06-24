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
    <div className="flex h-screen overflow-hidden bg-secondary">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader
          user={currentUser}
          onLogout={logout}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
