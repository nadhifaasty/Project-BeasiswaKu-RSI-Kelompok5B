import { Link } from 'react-router-dom'

function BiodataOrtu() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Biodata</h1>
      <p className="text-sm text-gray-500 mb-6">Orang Tua / Wali</p>
      <div className="flex gap-2 mb-6 text-sm">
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Data Pribadi</span>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Alamat</span>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full">Orang Tua/Wali</span>
        <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full">Akademik</span>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl space-y-5">
        <h3 className="font-semibold text-gray-900">Data Ayah</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ayah</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Penghasilan Bulanan</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Rp" />
        </div>
        <hr />
        <h3 className="font-semibold text-gray-900">Data Ibu</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ibu</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Penghasilan Bulanan</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Rp" />
        </div>
        <div className="flex gap-3 pt-2">
          <Link to="/siswa/biodata/alamat" className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition">Kembali</Link>
          <Link to="/siswa/biodata/akademik" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">Simpan & Lanjut</Link>
        </div>
      </div>
    </div>
  )
}

export default BiodataOrtu
