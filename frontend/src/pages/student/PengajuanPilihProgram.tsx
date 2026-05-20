import { Link } from 'react-router-dom'

function PengajuanPilihProgram() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pengajuan Beasiswa</h1>
      <p className="text-sm text-gray-500 mb-6">Pilih Program Beasiswa</p>
      <div className="flex gap-2 mb-6 text-sm">
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full">Pilih Program</span>
        <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full">Isi Formulir</span>
        <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full">Upload Dokumen</span>
        <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full">Konfirmasi</span>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Beasiswa SMA</h3>
          <p className="text-sm text-gray-600 mb-4">Untuk siswa SMA/SMK sederajat berprestasi dari keluarga kurang mampu.</p>
          <p className="text-xs text-gray-400 mb-4">Kuota: 50 penerima</p>
          <Link to="/siswa/pengajuan/isi-formulir" className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Pilih</Link>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Beasiswa Perguruan Tinggi</h3>
          <p className="text-sm text-gray-600 mb-4">Untuk mahasiswa D3/D4/S1 dengan IPK minimal 3.00.</p>
          <p className="text-xs text-gray-400 mb-4">Kuota: 100 penerima</p>
          <Link to="/siswa/pengajuan/isi-formulir" className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Pilih</Link>
        </div>
      </div>
    </div>
  )
}

export default PengajuanPilihProgram
