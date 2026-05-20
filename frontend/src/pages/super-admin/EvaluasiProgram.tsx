function EvaluasiProgram() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Evaluasi Program</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-semibold text-gray-900 mb-4">Beasiswa SMA</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Pendaftar</span><span className="font-medium">45</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Terverifikasi</span><span className="font-medium">30</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Diterima</span><span className="font-medium">12</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Kuota</span><span className="font-medium">50</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-semibold text-gray-900 mb-4">Beasiswa Perguruan Tinggi</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Pendaftar</span><span className="font-medium">42</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Terverifikasi</span><span className="font-medium">35</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Diterima</span><span className="font-medium">20</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Kuota</span><span className="font-medium">100</span></div>
          </div>
        </div>
        <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-semibold text-gray-900 mb-4">Ringkasan</h2>
          <p className="text-sm text-gray-600">
            Total pendaftar: <strong>87</strong> | Total diterima: <strong>32</strong> | Total dana tersalurkan: <strong>Rp160.000.000</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default EvaluasiProgram
