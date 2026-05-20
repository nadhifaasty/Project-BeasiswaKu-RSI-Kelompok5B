import { Link } from 'react-router-dom'

function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Total Pengajuan</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">24</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Menunggu Verifikasi</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">8</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Terverifikasi</p>
          <p className="text-3xl font-bold text-green-600 mt-1">12</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Ditolak</p>
          <p className="text-3xl font-bold text-red-600 mt-1">4</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="flex gap-4">
          <Link to="/admin/pengajuan" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Daftar Pengajuan</Link>
          <Link to="/admin/seleksi" className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">Seleksi Penerima</Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
