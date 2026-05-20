import { Link } from 'react-router-dom'

function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Status Biodata</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">0%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }} />
          </div>
          <Link to="/siswa/biodata/pribadi" className="text-sm text-blue-600 hover:underline mt-3 inline-block">Lengkapi &rarr;</Link>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Pengajuan Aktif</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
          <Link to="/siswa/pengajuan/pilih-program" className="text-sm text-blue-600 hover:underline mt-3 inline-block">Ajukan &rarr;</Link>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Status Pengajuan</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
          <Link to="/siswa/dokumen/status" className="text-sm text-blue-600 hover:underline mt-3 inline-block">Lihat &rarr;</Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
