import { Link } from 'react-router-dom'

function PengajuanBerhasil() {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="bg-white rounded-xl p-8 shadow-sm border">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pengajuan Berhasil Dikirim</h1>
        <p className="text-gray-500 text-sm mb-4">
          Pengajuan beasiswa Anda telah berhasil dikirim. Nomor referensi: <strong className="text-gray-900">BEA-2026-000001</strong>
        </p>
        <p className="text-xs text-gray-400 mb-6">Silakan pantau status pengajuan Anda melalui menu Dokumen Saya.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/siswa/dokumen/status" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">Lihat Status</Link>
          <Link to="/siswa" className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition">Kembali ke Dashboard</Link>
        </div>
      </div>
    </div>
  )
}

export default PengajuanBerhasil
