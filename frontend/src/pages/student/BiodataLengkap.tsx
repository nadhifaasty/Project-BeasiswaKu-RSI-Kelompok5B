import { Link } from 'react-router-dom'

function BiodataLengkap() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Biodata</h1>
      <p className="text-sm text-gray-500 mb-6">Biodata Lengkap</p>
      <div className="flex gap-2 mb-6 text-sm">
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Data Pribadi</span>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Alamat</span>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Orang Tua/Wali</span>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Akademik</span>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Kelengkapan Biodata</span>
            <span className="text-sm font-bold text-green-600">100%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Data Pribadi</span>
            <span className="text-green-600 font-medium">Lengkap</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Alamat Domisili</span>
            <span className="text-green-600 font-medium">Lengkap</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Orang Tua/Wali</span>
            <span className="text-green-600 font-medium">Lengkap</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Data Akademik</span>
            <span className="text-green-600 font-medium">Lengkap</span>
          </div>
        </div>
        <div className="flex gap-3 pt-6">
          <Link to="/siswa/biodata/akademik" className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition">Kembali</Link>
          <Link to="/siswa/pengajuan/pilih-program" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">Ajukan Beasiswa</Link>
        </div>
      </div>
    </div>
  )
}

export default BiodataLengkap
