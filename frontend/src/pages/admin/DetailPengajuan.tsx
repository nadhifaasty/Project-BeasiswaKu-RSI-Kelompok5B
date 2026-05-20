import { Link } from 'react-router-dom'

function DetailPengajuan() {
  return (
    <div>
      <Link to="/admin/pengajuan" className="text-blue-600 text-sm hover:underline mb-4 inline-block">&larr; Kembali</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Detail Pengajuan</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl space-y-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Nama:</span> <span className="font-medium text-gray-900 ml-2">Ahmad Fauzi</span></div>
          <div><span className="text-gray-500">NIM/NISN:</span> <span className="font-medium text-gray-900 ml-2">L0224001</span></div>
          <div><span className="text-gray-500">Program:</span> <span className="font-medium text-gray-900 ml-2">Beasiswa PT</span></div>
          <div><span className="text-gray-500">Tanggal:</span> <span className="font-medium text-gray-900 ml-2">20 Mei 2026</span></div>
          <div><span className="text-gray-500">IPK:</span> <span className="font-medium text-gray-900 ml-2">3.75</span></div>
          <div><span className="text-gray-500">Status:</span> <span className="text-yellow-800 bg-yellow-100 text-xs font-medium px-2.5 py-1 rounded-full ml-2">PENDING</span></div>
        </div>
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Esai Motivasi</h3>
          <p className="text-sm text-gray-600">Saya sangat termotivasi untuk melanjutkan pendidikan tinggi karena...</p>
        </div>
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Dokumen</h3>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between"><span>KTP</span><span className="text-green-600">Tervalidasi</span></li>
            <li className="flex justify-between"><span>Kartu Keluarga</span><span className="text-yellow-600">Perlu dicek</span></li>
            <li className="flex justify-between"><span>Transkrip Nilai</span><span className="text-green-600">Tervalidasi</span></li>
          </ul>
        </div>
        <div className="flex gap-3 pt-4 border-t">
          <button className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">Setujui</button>
          <button className="bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition">Revisi</button>
          <button className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">Tolak</button>
        </div>
      </div>
    </div>
  )
}

export default DetailPengajuan
