import { Outlet, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/super-admin', label: 'Dashboard', end: true },
  { to: '/super-admin/audit-log', label: 'Audit Log' },
  { to: '/super-admin/evaluasi-program', label: 'Evaluasi Program' },
]

function SuperAdminLayout() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col shrink-0">
        <div className="p-4 border-b">
          <span className="text-xl font-bold text-blue-600">BeasiswaKu</span>
          <p className="text-xs text-gray-500 mt-1">Super Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <NavLink to="/login" className="text-sm text-red-500 hover:underline">Keluar</NavLink>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default SuperAdminLayout
