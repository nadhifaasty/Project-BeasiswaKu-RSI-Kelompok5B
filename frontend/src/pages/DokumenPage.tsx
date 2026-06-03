import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button } from '../components'
import { fetchApi } from '../services/api'
import { getUserApplications, type Application } from '../services/scholarship'

interface DocumentItem {
  id: string
  application_id: string
  jenis: string
  file_url: string
  status: 'menunggu' | 'tervalidasi' | 'ditolak'
  created_at: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface UploadUrlResponse {
  signedUrl: string
  path: string
  token: string
  publicUrl: string
}

interface DocTypeConfig {
  jenis: string
  label: string
  desc: string
  required: boolean
}

const DOCUMENT_TYPES: DocTypeConfig[] = [
  { jenis: 'foto', label: 'Pas Foto Terbaru', desc: 'Foto formal background merah/biru, format JPG/PNG, maks 2MB.', required: true },
  { jenis: 'ktp', label: 'KTP / Kartu Pelajar', desc: 'Scan KTP asli atau Kartu Pelajar yang masih aktif, format PDF/JPG, maks 2MB.', required: true },
  { jenis: 'kartu_keluarga', label: 'Kartu Keluarga (KK)', desc: 'Scan Kartu Keluarga asli atau terlegalisir terbaru, format PDF/JPG, maks 2MB.', required: true },
  { jenis: 'transkrip', label: 'Transkrip Nilai / Rapor', desc: 'Scan transkrip nilai akademik terakhir atau rapor semester terakhir, format PDF, maks 5MB.', required: true },
  { jenis: 'sktm', label: 'Surat Keterangan Tidak Mampu (SKTM)', desc: 'Surat keterangan dari kelurahan/desa setempat yang masih berlaku, format PDF, maks 2MB.', required: true },
  { jenis: 'sertifikat_prestasi', label: 'Sertifikat Prestasi (Opsional)', desc: 'Piagam/sertifikat kejuaraan atau organisasi tingkat nasional/provinsi/kota, format PDF/JPG, maks 5MB.', required: false },
]

function DokumenPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Get active application (usually PENDING or REVISI, or any latest application)
  const activeApp = applications.length > 0 ? applications[0] : null

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setErrorMessage(null)
    try {
      const apps = await getUserApplications()
      setApplications(apps)

      if (apps.length > 0) {
        const docsRes = await fetchApi<ApiResponse<DocumentItem[]>>(`/documents/${apps[0].id}`)
        setDocuments(docsRes.data)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat data dokumen.')
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(jenis: string, file: File) {
    if (!activeApp) return

    setUploadingDocType(jenis)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      // 1. Get signed upload URL and public URL from backend
      const uploadUrlRes = await fetchApi<ApiResponse<UploadUrlResponse>>('/documents/upload-url', {
        method: 'POST',
        body: JSON.stringify({
          application_id: activeApp.id,
          jenis,
          file_name: file.name,
        }),
      })

      const { signedUrl, publicUrl } = uploadUrlRes.data

      // 2. Upload the file directly to Supabase Storage
      const storageRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!storageRes.ok) {
        throw new Error('Gagal mengunggah file ke server penyimpanan.')
      }

      // 3. Save the document record in backend database
      await fetchApi<ApiResponse<DocumentItem>>('/documents', {
        method: 'POST',
        body: JSON.stringify({
          application_id: activeApp.id,
          jenis,
          file_url: publicUrl,
        }),
      })

      setSuccessMessage(`Dokumen ${DOCUMENT_TYPES.find(d => d.jenis === jenis)?.label} berhasil diunggah!`)
      // Refresh documents
      const docsRes = await fetchApi<ApiResponse<DocumentItem[]>>(`/documents/${activeApp.id}`)
      setDocuments(docsRes.data)
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengunggah dokumen.')
    } finally {
      setUploadingDocType(null)
    }
  }

  function getDocStatus(jenis: string) {
    return documents.find((d) => d.jenis === jenis)
  }

  function renderStatusBadge(status: DocumentItem['status'] | undefined) {
    if (!status) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          Belum Diunggah
        </span>
      )
    }

    switch (status) {
      case 'tervalidasi':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Tervalidasi
          </span>
        )
      case 'menunggu':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Menunggu Verifikasi
          </span>
        )
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Ditolak / Butuh Revisi
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-1/3" />
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-gray-200 rounded-2xl" />
          <div className="h-40 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!activeApp) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-5">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary">Belum Ada Pengajuan Aktif</h2>
          <p className="text-gray-500 text-sm mt-1.5 max-w-md mx-auto">
            Anda harus mengajukan salah satu program beasiswa yang tersedia terlebih dahulu sebelum dapat mengunggah berkas administrasi dokumen.
          </p>
        </div>
        <Link to="/pengajuan" className="inline-block">
          <Button variant="primary">Ajukan Beasiswa Sekarang</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="inline-block bg-secondary text-primary text-xs font-medium px-3 py-1 rounded-full mb-2">
          Berkas Administrasi
        </span>
        <h1 className="text-3xl font-bold text-primary">Dokumen Saya</h1>
        <p className="text-gray-500 text-sm mt-1">
          Kirimkan file persyaratan dokumen Anda untuk verifikasi program: <span className="font-semibold text-primary">{activeApp.scholarship_programs?.nama}</span> (No. Ref: {activeApp.nomor_referensi})
        </p>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm">
          ⚠ {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 text-sm font-semibold">
          ✓ {successMessage}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-primary to-primary-light text-secondary p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold">Ketentuan Pengunggahan Dokumen</h3>
          <p className="text-xs text-white/80 mt-1">
            Harap unggah dokumen dengan data yang valid dan format yang sesuai ketentuan. Status pendaftaran Anda hanya akan beralih menjadi <strong>TERVERIFIKASI</strong> setelah admin menyatakan kelima dokumen wajib Anda adalah <strong>VALID</strong>.
          </p>
        </div>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DOCUMENT_TYPES.map((docType) => {
          const doc = getDocStatus(docType.jenis)
          const isUploading = uploadingDocType === docType.jenis
          const isVerified = doc?.status === 'tervalidasi'

          return (
            <Card key={docType.jenis} className="flex flex-col justify-between border-t-2 border-primary/20 hover:shadow-lg transition duration-200">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-primary flex items-center gap-1.5">
                      {docType.label}
                      {docType.required && (
                        <span className="text-red-500 font-normal text-xs" title="Wajib">* Wajib</span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{docType.desc}</p>
                  </div>
                  {renderStatusBadge(doc?.status)}
                </div>

                {doc && (
                  <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between text-xs">
                    <span className="text-gray-500 truncate max-w-[200px]">
                      File: {doc.file_url.split('/').pop()}
                    </span>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold"
                    >
                      Lihat File ↗
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-end">
                <label className={`relative cursor-pointer ${isVerified ? 'pointer-events-none opacity-50' : ''}`}>
                  <input
                    type="file"
                    className="hidden"
                    disabled={isVerified || isUploading}
                    accept={docType.jenis === 'foto' ? 'image/*' : '.pdf,image/*'}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(docType.jenis, file)
                    }}
                  />
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm ${
                    isVerified
                      ? 'bg-gray-100 text-gray-400 border border-gray-200'
                      : 'bg-primary text-secondary hover:bg-primary-light'
                  }`}>
                    {isUploading ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-secondary" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Mengunggah...
                      </>
                    ) : doc ? (
                      'Unggah Ulang Berkas'
                    ) : (
                      'Unggah Berkas Baru'
                    )}
                  </span>
                </label>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default DokumenPage
