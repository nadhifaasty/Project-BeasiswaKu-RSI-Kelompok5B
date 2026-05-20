import { Link } from 'react-router-dom'

function PencairanDanaBerhasil() {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="bg-white rounded-xl p-8 shadow-sm border">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Pencairan Dana Berhasil Disimpan</h1>
        <p className="text-gray-500 text-sm mb-6">Data rekening Anda telah berhasil disimpan dan akan digunakan untuk pencairan dana beasiswa.</p>
        <Link to="/siswa" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">Kembali ke Dashboard</Link>
      </div>
    </div>
  )
}

export default PencairanDanaBerhasil
