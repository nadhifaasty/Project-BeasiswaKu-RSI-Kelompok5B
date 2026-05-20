import { Link } from 'react-router-dom'
import { useState } from 'react'

const docs = [
  { label: 'Foto', required: true },
  { label: 'KTP / Kartu Pelajar', required: true },
  { label: 'Kartu Keluarga', required: true },
  { label: 'Transkrip Nilai / Rapor', required: true },
  { label: 'SKTM', required: true },
  { label: 'Sertifikat Prestasi', required: false },
]

function PengajuanUploadDokumen() {
  const [files, setFiles] = useState<Record<string, string>>({})

  const handleFile = (label: string) => {
    setFiles((prev) => ({ ...prev, [label]: 'uploaded' }))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pengajuan Beasiswa</h1>
      <p className="text-sm text-gray-500 mb-6">Upload Dokumen Persyaratan</p>
      <div className="flex gap-2 mb-6 text-sm">
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Pilih Program</span>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">&check; Isi Formulir</span>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full">Upload Dokumen</span>
        <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full">Konfirmasi</span>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border max-w-2xl space-y-4">
        <p className="text-xs text-gray-400 mb-2">Format: PDF/PNG, maksimal 5 MB per file</p>
        {docs.map((doc) => (
          <div key={doc.label} className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <span className="text-sm font-medium text-gray-700">{doc.label}</span>
              {doc.required && <span className="text-red-500 ml-1">*</span>}
            </div>
            <div className="flex items-center gap-3">
              {files[doc.label] ? (
                <span className="text-green-600 text-sm font-medium">Terupload</span>
              ) : (
                <button onClick={() => handleFile(doc.label)} className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition">
                  Pilih File
                </button>
              )}
            </div>
          </div>
        ))}
        <div className="flex gap-3 pt-4">
          <Link to="/siswa/pengajuan/isi-formulir" className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition">Kembali</Link>
          <Link to="/siswa/pengajuan/konfirmasi" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">Lanjut Konfirmasi</Link>
        </div>
      </div>
    </div>
  )
}

export default PengajuanUploadDokumen
