import { Link } from 'react-router-dom'

function PencairanDana() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dokumen Saya</h1>
      <p className="text-sm text-gray-500 mb-6">Data Pencairan Dana</p>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Bank Mandiri" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nomor rekening" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemegang Rekening</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama sesuai rekening" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cabang Bank</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cabang bank" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Foto Buku Tabungan</label>
          <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">Pilih File</button>
          <p className="text-xs text-gray-400 mt-1">Format: PDF/PNG, maksimal 5 MB</p>
        </div>
        <Link to="/siswa/dokumen/pencairan-dana/berhasil" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">Simpan</Link>
      </div>
    </div>
  )
}

export default PencairanDana
