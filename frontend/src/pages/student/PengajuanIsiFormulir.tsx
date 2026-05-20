import { Link } from 'react-router-dom'
import { useState } from 'react'

function PengajuanIsiFormulir() {
  const [charCount, setCharCount] = useState(0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pengajuan Beasiswa</h1>
      <p className="text-sm text-gray-500 mb-6">Isi Formulir Pengajuan</p>
      <div className="flex gap-2 mb-6 text-sm">
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Pilih Program</span>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full">Isi Formulir</span>
        <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full">Upload Dokumen</span>
        <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full">Konfirmasi</span>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl space-y-5">
        <p className="text-sm font-medium text-gray-700">Program: <span className="text-blue-600">Beasiswa Perguruan Tinggi</span></p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">IPK / Nilai Akademik</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: 3.50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Esai Motivasi</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={6}
            placeholder="Tuliskan alasan dan motivasi Anda mengajukan beasiswa ini (minimal 1000 karakter)"
            onChange={(e) => setCharCount(e.target.value.length)}
          />
          <p className={`text-xs mt-1 ${charCount >= 1000 ? 'text-green-600' : 'text-gray-400'}`}>
            {charCount} / 1000 karakter minimal
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prestasi Non-Akademik (opsional)</label>
          <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Sebutkan prestasi non-akademik yang dimiliki" />
        </div>
        <div className="flex gap-3 pt-2">
          <Link to="/siswa/pengajuan/pilih-program" className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition">Kembali</Link>
          <Link to="/siswa/pengajuan/upload-dokumen" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">Simpan & Lanjut</Link>
        </div>
      </div>
    </div>
  )
}

export default PengajuanIsiFormulir
