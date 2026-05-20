function LaporanDana() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Laporan Penggunaan Dana</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          Dana yang diterima: <strong>Rp5.000.000</strong> (Beasiswa Perguruan Tinggi)
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Pengeluaran</label>
          <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Pilih kategori</option>
            <option>Biaya Pendidikan</option>
            <option>Biaya Hidup</option>
            <option>Biaya Transportasi</option>
            <option>Biaya Buku/Alat</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Pengeluaran</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Rp" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Deskripsi penggunaan dana" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Pengeluaran</label>
          <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">Pilih File</button>
          <p className="text-xs text-gray-400 mt-1">Format: PDF/PNG, maksimal 5 MB</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">Kirim Laporan</button>
      </div>
    </div>
  )
}

export default LaporanDana
