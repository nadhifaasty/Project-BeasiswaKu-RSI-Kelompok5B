import { Link } from 'react-router-dom'

function StatusPengajuan() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dokumen Saya</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl">
        <h2 className="font-semibold text-gray-900 mb-4">Status Pengajuan</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-1">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Pengajuan Dikirim</p>
              <p className="text-sm text-gray-500">20 Mei 2026</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0 mt-1">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Verifikasi Dokumen</p>
              <p className="text-sm text-gray-500">Menunggu verifikasi</p>
            </div>
          </div>
          <div className="flex items-start gap-4 opacity-40">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-400">Seleksi</p>
              <p className="text-sm text-gray-400">-</p>
            </div>
          </div>
          <div className="flex items-start gap-4 opacity-40">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-400">Hasil Akhir</p>
              <p className="text-sm text-gray-400">-</p>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t text-sm">
          <span className="text-gray-500">No. Referensi: </span>
          <span className="font-medium text-gray-900">BEA-2026-000001</span>
        </div>
        <div className="mt-4">
          <Link to="/siswa/dokumen/pencairan-dana" className="text-blue-600 text-sm font-medium hover:underline">Isi Data Pencairan Dana &rarr;</Link>
        </div>
      </div>
    </div>
  )
}

export default StatusPengajuan
