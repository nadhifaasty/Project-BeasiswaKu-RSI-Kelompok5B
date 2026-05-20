import { Link } from 'react-router-dom'

function BiodataPribadi() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Biodata</h1>
      <p className="text-sm text-gray-500 mb-6">Data Pribadi</p>
      <div className="flex gap-2 mb-6 text-sm">
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full">Data Pribadi</span>
        <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full">Alamat</span>
        <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full">Orang Tua/Wali</span>
        <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full">Akademik</span>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama lengkap" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NIM / NISN</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="NIM atau NISN" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="08xxxxxxxxxx" />
        </div>
        <div className="flex gap-3 pt-2">
          <Link to="/siswa/biodata/alamat" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">Simpan & Lanjut</Link>
        </div>
      </div>
    </div>
  )
}

export default BiodataPribadi
