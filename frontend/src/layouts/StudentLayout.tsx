import { Outlet, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/siswa', label: 'Dashboard', end: true },
  { to: '/siswa/biodata/pribadi', label: 'Biodata' },
  { to: '/siswa/pengajuan/pilih-program', label: 'Pengajuan Beasiswa' },
  { to: '/siswa/dokumen/status', label: 'Dokumen Saya' },
  { to: '/siswa/laporan-dana', label: 'Laporan Dana' },
]

function StudentLayout() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col shrink-0">
        <div className="p-4 border-b">
          <NavLink to="/siswa" className="text-xl font-bold text-blue-600">BeasiswaKu</NavLink>
          <p className="text-xs text-gray-500 mt-1">Siswa</p>
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

export default StudentLayout
