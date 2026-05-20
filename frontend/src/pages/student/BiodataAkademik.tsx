import { Link } from 'react-router-dom'

function BiodataAkademik() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Biodata</h1>
      <p className="text-sm text-gray-500 mb-6">Data Akademik</p>
      <div className="flex gap-2 mb-6 text-sm">
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Data Pribadi</span>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Alamat</span>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Orang Tua/Wali</span>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full">Akademik</span>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenjang Pendidikan</label>
          <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Pilih Jenjang</option>
            <option>SMA/SMK</option>
            <option>D3</option>
            <option>D4/S1</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asal Institusi</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama sekolah/universitas" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi / Jurusan</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jurusan" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">IPK / Nilai Rata-rata</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: 3.50 atau 85.5" />
        </div>
        <div className="flex gap-3 pt-2">
          <Link to="/siswa/biodata/orang-tua" className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition">Kembali</Link>
          <Link to="/siswa/biodata/lengkap" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">Simpan & Lihat Lengkap</Link>
        </div>
      </div>
    </div>
  )
}

export default BiodataAkademik
