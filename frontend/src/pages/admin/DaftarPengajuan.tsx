import { Link } from 'react-router-dom'

const submissions = [
  { id: 1, nama: 'Ahmad Fauzi', program: 'Beasiswa PT', tgl: '20 Mei 2026', status: 'PENDING' },
  { id: 2, nama: 'Siti Nurhaliza', program: 'Beasiswa PT', tgl: '19 Mei 2026', status: 'TERVERIFIKASI' },
  { id: 3, nama: 'Budi Santoso', program: 'Beasiswa SMA', tgl: '18 Mei 2026', status: 'REVISI' },
  { id: 4, nama: 'Dewi Lestari', program: 'Beasiswa PT', tgl: '17 Mei 2026', status: 'DITOLAK' },
]

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  TERVERIFIKASI: 'bg-green-100 text-green-800',
  REVISI: 'bg-orange-100 text-orange-800',
  DITOLAK: 'bg-red-100 text-red-800',
}

function DaftarPengajuan() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Daftar Pengajuan</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">No</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nama</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Program</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tanggal</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">{s.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.nama}</td>
                  <td className="px-4 py-3">{s.program}</td>
                  <td className="px-4 py-3 text-gray-500">{s.tgl}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[s.status] || ''}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/pengajuan/${s.id}`} className="text-blue-600 hover:underline text-sm">Detail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DaftarPengajuan
