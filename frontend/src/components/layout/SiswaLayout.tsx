import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SiswaSidebar from './SiswaSidebar'

function SiswaLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  // Breadcrumb from path
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const breadcrumb = pathSegments.map((seg) =>
    seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
  )

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      {/* Sidebar */}
      <SiswaSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Area */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        }`}
      >
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Dashboard</span>
            {breadcrumb.length > 1 && (
              <>
                <span className="text-gray-300">&gt;</span>
                <span className="text-primary font-medium">{breadcrumb[breadcrumb.length - 1]}</span>
              </>
            )}
            {breadcrumb.length <= 1 && (
              <>
                <span className="text-gray-300">&gt;</span>
                <span className="text-primary font-medium">Siswa</span>
              </>
            )}
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

export default SiswaLayout
