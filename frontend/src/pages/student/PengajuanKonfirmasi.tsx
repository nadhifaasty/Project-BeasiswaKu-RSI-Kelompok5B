import { Link } from 'react-router-dom'
import { useState } from 'react'

function PengajuanKonfirmasi() {
  const [agreed, setAgreed] = useState(false)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pengajuan Beasiswa</h1>
      <p className="text-sm text-gray-500 mb-6">Konfirmasi Pengajuan</p>
      <div className="flex gap-2 mb-6 text-sm">
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Pilih Program</span>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Isi Formulir</span>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Upload Dokumen</span>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full">Konfirmasi</span>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl space-y-5">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Program</span>
            <span className="font-medium text-gray-900">Beasiswa Perguruan Tinggi</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">IPK</span>
            <span className="font-medium text-gray-900">3.75</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Esai Motivasi</span>
            <span className="font-medium text-gray-900">1.240 karakter</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Dokumen</span>
            <span className="font-medium text-green-600">6 dokumen</span>
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 rounded border-gray-300" />
          <span className="text-gray-600">Saya menyatakan bahwa data yang saya isi adalah benar dan dapat dipertanggungjawabkan.</span>
        </label>
        <div className="flex gap-3 pt-2">
          <Link to="/siswa/pengajuan/upload-dokumen" className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition">Kembali</Link>
          <Link to={agreed ? '/siswa/pengajuan/berhasil' : '#'} className={`px-6 py-2.5 rounded-lg font-medium transition ${agreed ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
            Kirim Pengajuan
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PengajuanKonfirmasi
