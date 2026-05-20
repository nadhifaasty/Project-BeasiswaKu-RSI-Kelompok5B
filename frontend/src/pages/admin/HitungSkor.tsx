import { Link } from 'react-router-dom'

function HitungSkor() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Hitung Skor Kelayakan</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl space-y-5">
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">Bobot Penilaian Default</p>
          <div className="flex justify-between py-2 border-b text-sm">
            <span>Akademik / IPK</span>
            <span className="font-medium">40%</span>
          </div>
          <div className="flex justify-between py-2 border-b text-sm">
            <span>Kondisi Ekonomi</span>
            <span className="font-medium">35%</span>
          </div>
          <div className="flex justify-between py-2 border-b text-sm">
            <span>Prestasi Non-Akademik</span>
            <span className="font-medium">15%</span>
          </div>
          <div className="flex justify-between py-2 text-sm">
            <span>Kelengkapan Dokumen</span>
            <span className="font-medium">10%</span>
          </div>
          <div className="flex justify-between py-2 border-t text-sm font-bold text-gray-900">
            <span>Total</span>
            <span>100%</span>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          Skor otomatis dihitung berdasarkan bobot dan data kandidat.
        </div>
        <Link to="/admin/seleksi/sahkan" className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition">Hitung & Lanjut ke Pengesahan</Link>
      </div>
    </div>
  )
}

export default HitungSkor
