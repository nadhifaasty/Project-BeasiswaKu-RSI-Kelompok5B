import { Link } from 'react-router-dom'

const reports = [
  { nama: 'Ahmad Fauzi', bulan: 'Mei 2026', dana: 'Rp5.000.000', status: 'Sudah Dikirim' },
  { nama: 'Siti Nurhaliza', bulan: 'Mei 2026', dana: 'Rp5.000.000', status: 'Belum Dikirim' },
]

function LaporanDana() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Laporan Penggunaan Dana</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Penerima</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Bulan</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Dana</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{r.nama}</td>
                <td className="px-4 py-3">{r.bulan}</td>
                <td className="px-4 py-3">{r.dana}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${r.status === 'Sudah Dikirim' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link to="#" className="text-blue-600 hover:underline text-sm">Detail</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LaporanDana
