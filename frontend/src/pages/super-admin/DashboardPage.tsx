import { Link } from 'react-router-dom'

function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Super Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Total Pengguna</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">156</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Total Pengajuan</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">87</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Penerima Aktif</p>
          <p className="text-3xl font-bold text-green-600 mt-1">32</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Link to="/super-admin/audit-log" className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
          <h2 className="font-semibold text-gray-900 mb-2">Audit Log</h2>
          <p className="text-sm text-gray-500">Lihat seluruh aktivitas penting dalam sistem.</p>
        </Link>
        <Link to="/super-admin/evaluasi-program" className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
          <h2 className="font-semibold text-gray-900 mb-2">Evaluasi Program</h2>
          <p className="text-sm text-gray-500">Evaluasi dan analisis program beasiswa.</p>
        </Link>
      </div>
    </div>
  )
}

export default DashboardPage
