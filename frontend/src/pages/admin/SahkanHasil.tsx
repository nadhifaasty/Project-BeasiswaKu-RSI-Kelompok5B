function SahkanHasil() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sahkan Hasil Seleksi</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">Ahmad Fauzi</p>
              <p className="text-xs text-gray-500">Skor: 85.5</p>
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">DITERIMA</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">Siti Nurhaliza</p>
              <p className="text-xs text-gray-500">Skor: 82.0</p>
            </div>
            <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">CADANGAN</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Budi Santoso</p>
              <p className="text-xs text-gray-500">Skor: 45.0</p>
            </div>
            <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">DITOLAK</span>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">Sahkan Hasil Seleksi</button>
        <p className="text-xs text-gray-400">Hasil yang sudah disahkan bersifat final dan hanya dapat diubah oleh Super Admin.</p>
      </div>
    </div>
  )
}

export default SahkanHasil
