function DashboardPage() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-primary mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Status Biodata</p>
          <p className="text-2xl font-bold text-primary mt-1">0%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-accent h-2 rounded-full" style={{ width: '0%' }} />
          </div>
          <a href="#" className="text-sm text-accent hover:underline mt-3 inline-block">Lengkapi &rarr;</a>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Pengajuan Aktif</p>
          <p className="text-2xl font-bold text-primary mt-1">0</p>
          <a href="#" className="text-sm text-accent hover:underline mt-3 inline-block">Ajukan &rarr;</a>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Status Pengajuan</p>
          <p className="text-2xl font-bold text-primary mt-1">-</p>
          <a href="#" className="text-sm text-accent hover:underline mt-3 inline-block">Lihat &rarr;</a>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
