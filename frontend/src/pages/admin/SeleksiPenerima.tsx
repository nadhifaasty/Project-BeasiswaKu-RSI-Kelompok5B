import { Link } from 'react-router-dom'

function SeleksiPenerima() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Seleksi Penerima</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl space-y-5">
        <p className="text-sm text-gray-600">Berikut adalah kandidat yang siap untuk diseleksi:</p>
        <div className="space-y-3">
          {['Ahmad Fauzi', 'Siti Nurhaliza', 'Budi Santoso'].map((nama, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <p className="font-medium text-gray-900">{nama}</p>
                <p className="text-xs text-gray-500">Beasiswa Perguruan Tinggi</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">TERVERIFIKASI</span>
            </div>
          ))}
        </div>
        <Link to="/admin/seleksi/hitung-skor" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">Hitung Skor Kelayakan</Link>
      </div>
    </div>
  )
}

export default SeleksiPenerima
