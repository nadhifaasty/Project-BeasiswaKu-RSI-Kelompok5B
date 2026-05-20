import { Link } from 'react-router-dom'

function BiodataAlamat() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Biodata</h1>
      <p className="text-sm text-gray-500 mb-6">Alamat Domisili</p>
      <div className="flex gap-2 mb-6 text-sm">
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Data Pribadi</span>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full">Alamat</span>
        <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full">Orang Tua/Wali</span>
        <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full">Akademik</span>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Domisili</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Alamat lengkap" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Pilih Provinsi</option>
              <option>Jawa Tengah</option>
              <option>Jawa Barat</option>
              <option>Jawa Timur</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kota/Kabupaten</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Pilih Kota</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Link to="/siswa/biodata/pribadi" className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition">Kembali</Link>
          <Link to="/siswa/biodata/orang-tua" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">Simpan & Lanjut</Link>
        </div>
      </div>
    </div>
  )
}

export default BiodataAlamat
