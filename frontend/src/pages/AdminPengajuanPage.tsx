import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card } from '../components'
import { fetchApi } from '../services/api'
import { exportReportExcel } from '../services/report'

// ============ TYPES ============

interface AdminApplication {
  id: string
  user_id: string
  nomor_referensi: string
  ipk: number
  esai_motivasi: string
  prestasi_non_akademik: string | null
  data_akademik: any | null
  status: string
  catatan_admin: string | null
  skor_kelayakan: number | null
  created_at: string
  profiles: {
    nama_lengkap: string
    nim_nisn: string
    email: string
    no_hp?: string
  }
  scholarship_programs: {
    nama: string
    nominal: string
  }
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

type StatusFilter = '' | 'PENDING' | 'TERVERIFIKASI' | 'REVISI' | 'DITOLAK' | 'DITERIMA' | 'CADANGAN'
type DetailTab = 'biodata' | 'akademik' | 'ekonomi' | 'dokumen' | 'riwayat'

// ============ HELPERS ============

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
    'bg-rose-500', 'bg-amber-500', 'bg-cyan-500',
    'bg-fuchsia-500', 'bg-indigo-500'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING:      { label: 'Pending',      cls: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
    TERVERIFIKASI:{ label: 'Verified',     cls: 'bg-blue-100 text-blue-800 border border-blue-200' },
    REVISI:       { label: 'Revision',     cls: 'bg-orange-100 text-orange-800 border border-orange-200' },
    DITERIMA:     { label: 'Accepted',     cls: 'bg-green-100 text-green-800 border border-green-200' },
    DITOLAK:      { label: 'Rejected',     cls: 'bg-red-100 text-red-800 border border-red-200' },
    CADANGAN:     { label: 'Cadangan',     cls: 'bg-purple-100 text-purple-800 border border-purple-200' },
  }
  const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700 border border-gray-200' }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  )
}

function ProgramIcon({ nama }: { nama: string }) {
  const isSMA = !nama.toLowerCase().includes('perguruan') && !nama.toLowerCase().includes('tinggi') && !nama.toLowerCase().includes('mahasiswa')
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${isSMA ? 'text-rose-600' : 'text-sky-600'}`}>
      {isSMA ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
        </svg>
      )}
      {nama}
    </span>
  )
}

// ============ PAGE ============

function AdminPengajuanPage() {
  const [applications, setApplications] = useState<AdminApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('')
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null)
  const [catatan, setCatatan] = useState('')
  const [updating, setUpdating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Detail Page States
  const [activeTab, setActiveTab] = useState<DetailTab>('biodata')
  const [studentProfile, setStudentProfile] = useState<any | null>(null)
  const [studentDocuments, setStudentDocuments] = useState<any[] | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [updatingDocId, setUpdatingDocId] = useState<string | null>(null)

  // Weight states (initialized from localStorage with fallback defaults)
  const [wAkademik, setWAkademik] = useState(() => Number(localStorage.getItem('wAkademik') || 40))
  const [wEkonomi, setWEkonomi] = useState(() => Number(localStorage.getItem('wEkonomi') || 35))
  const [wPrestasi, setWPrestasi] = useState(() => Number(localStorage.getItem('wPrestasi') || 15))
  const [wDokumen, setWDokumen] = useState(() => Number(localStorage.getItem('wDokumen') || 10))

  useEffect(() => {
    localStorage.setItem('wAkademik', String(wAkademik))
    localStorage.setItem('wEkonomi', String(wEkonomi))
    localStorage.setItem('wPrestasi', String(wPrestasi))
    localStorage.setItem('wDokumen', String(wDokumen))
  }, [wAkademik, wEkonomi, wPrestasi, wDokumen])

  const totalWeight = wAkademik + wEkonomi + wPrestasi + wDokumen
  const isWeightValid = totalWeight === 100

  function renderWeightsCard() {
    return (
      <Card className="p-6 mb-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-primary">Konfigurasi Parameter Bobot Penilaian</h2>
            <p className="text-xs text-gray-400 mt-0.5">Sesuaikan bobot kriteria untuk kalkulasi skor kelayakan dinamis</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 self-start sm:self-auto">
            <span className="text-sm font-medium text-gray-600">Akumulasi Bobot:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isWeightValid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {totalWeight}% {isWeightValid ? '✓ Valid' : '⚠ Harus 100%'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Academic Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Akademik (IPK/Nilai)</span>
              <span className="font-extrabold text-primary">{wAkademik}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={wAkademik}
              onChange={(e) => setWAkademik(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Economic Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Kondisi Ekonomi</span>
              <span className="font-extrabold text-primary">{wEkonomi}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={wEkonomi}
              onChange={(e) => setWEkonomi(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Achievement Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Prestasi Non-Akademik</span>
              <span className="font-extrabold text-primary">{wPrestasi}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={wPrestasi}
              onChange={(e) => setWPrestasi(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Document Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Kelengkapan Dokumen</span>
              <span className="font-extrabold text-primary">{wDokumen}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={wDokumen}
              onChange={(e) => setWDokumen(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </Card>
    )
  }

  useEffect(() => {
    loadApplications()
  }, [filter])

  async function loadApplications() {
    try {
      setLoading(true)
      const query = filter ? `?status=${filter}` : ''
      const res = await fetchApi<ApiResponse<AdminApplication[]>>(
        `/applications${query}`
      )
      setApplications(res.data)
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat data pengajuan.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    setExporting(true)
    setMessage(null)
    try {
      const blob = await exportReportExcel(filter ? { status: filter } : undefined)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Data_Pengajuan_${filter || 'Semua'}_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengekspor data.' })
    } finally {
      setExporting(false)
    }
  }

  async function handleUpdateStatusDirect(status: string) {
    if (!selectedApp) return
    setUpdating(true)
    setMessage(null)
    try {
      await fetchApi(`/applications/${selectedApp.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, catatan_admin: catatan || undefined }),
      })
      setMessage({ type: 'success', text: `Status pengajuan berhasil diubah menjadi ${status}.` })
      setSelectedApp(null)
      setCatatan('')
      await loadApplications()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui status.' })
    } finally {
      setUpdating(false)
    }
  }

  async function openDetail(app: AdminApplication) {
    setSelectedApp(app)
    setCatatan(app.catatan_admin || '')
    setMessage(null)
    setActiveTab('biodata')
    setStudentProfile(null)
    setStudentDocuments(null)

    try {
      setLoadingDetail(true)
      const profileRes = await fetchApi<ApiResponse<any>>(`/users/${app.user_id}/profile`)
      setStudentProfile(profileRes.data)

      const docsRes = await fetchApi<ApiResponse<any[]>>(`/documents/${app.id}`)
      setStudentDocuments(docsRes.data)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat detail data siswa.' })
    } finally {
      setLoadingDetail(false)
    }
  }

  async function handleUpdateDocumentStatus(docId: string, status: 'tervalidasi' | 'ditolak') {
    setUpdatingDocId(docId)
    setMessage(null)
    try {
      await fetchApi(`/documents/${docId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      // Reload documents to update status
      if (selectedApp) {
        const docsRes = await fetchApi<ApiResponse<any[]>>(`/documents/${selectedApp.id}`)
        setStudentDocuments(docsRes.data)
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengubah status dokumen.' })
    } finally {
      setUpdatingDocId(null)
    }
  }

  const filteredApps = applications.filter((app) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      app.profiles.nama_lengkap.toLowerCase().includes(q) ||
      app.profiles.nim_nisn.toLowerCase().includes(q) ||
      app.nomor_referensi.toLowerCase().includes(q)
    )
  })

  // Parse prestasi non akademik
  function parsePrestasi(raw: string | null): Array<{ nama: string; tingkat: string; tahun: string }> {
    if (!raw) return []
    try { return JSON.parse(raw) } catch { return [] }
  }

  // Parse data akademik
  function parseDataAkademik(raw: any): { peringkat_kelas?: string; riwayat_prestasi_akademik?: string } {
    if (!raw) return {}
    if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return {} } }
    return raw
  }

  // On-the-fly score calculations
  const calculatedScores = (() => {
    if (!selectedApp) return null

    // 1. Academic Score (40% weight)
    const ipk = studentProfile?.akademik?.ipk_nilai !== undefined 
      ? Number(studentProfile.akademik.ipk_nilai) 
      : Number(selectedApp.ipk || 0)
    
    const programName = selectedApp.scholarship_programs?.nama || ''
    const isCollege = programName.toLowerCase().includes('perguruan') || 
                      programName.toLowerCase().includes('mahasiswa') || 
                      programName.toLowerCase().includes('tinggi')
    
    const skorAkademik = isCollege 
      ? Math.min(Math.max((ipk / 4.0) * 100, 0), 100)
      : Math.min(Math.max(ipk, 0), 100)

    // 2. Economic Score (35% weight)
    const ortu = studentProfile?.orang_tua
    const totalPenghasilan = Number(ortu?.ayah_penghasilan || 0) + Number(ortu?.ibu_penghasilan || 0)
    let skorEkonomi = 20
    if (totalPenghasilan > 0) {
      if (totalPenghasilan <= 1500000) {
        skorEkonomi = 100
      } else if (totalPenghasilan <= 3000000) {
        skorEkonomi = 80
      } else if (totalPenghasilan <= 5000000) {
        skorEkonomi = 60
      } else if (totalPenghasilan <= 7500000) {
        skorEkonomi = 40
      }
    } else if (ortu) {
      skorEkonomi = 100
    }

    // 3. Achievement Score (15% weight)
    const prestasiText = selectedApp.prestasi_non_akademik || ''
    let skorPrestasi = 0
    if (prestasiText.trim().length > 0) {
      const textLower = prestasiText.toLowerCase()
      if (textLower.includes('nasional')) {
        skorPrestasi = 100
      } else if (textLower.includes('provinsi')) {
        skorPrestasi = 90
      } else if (textLower.includes('kota') || textLower.includes('kabupaten')) {
        skorPrestasi = 80
      } else {
        skorPrestasi = 70
      }
    }

    // 4. Document Score (10% weight)
    const validCount = studentDocuments 
      ? studentDocuments.filter(d => d.status === 'tervalidasi').length 
      : 0
    const skorDokumen = Math.min((validCount / 5.0) * 100, 100)

    // 5. Total Score
    const skorTotal = Math.round(
      (skorAkademik * (wAkademik / 100)) + 
      (skorEkonomi * (wEkonomi / 100)) + 
      (skorPrestasi * (wPrestasi / 100)) + 
      (skorDokumen * (wDokumen / 100))
    )

    let kelayakanLabel = 'TIDAK LAYAK'
    let kelayakanColor = 'text-red-700 bg-red-50 border-red-200'
    if (skorTotal >= 85) {
      kelayakanLabel = 'SANGAT LAYAK'
      kelayakanColor = 'text-green-700 bg-green-50 border-green-200'
    } else if (skorTotal >= 70) {
      kelayakanLabel = 'LAYAK'
      kelayakanColor = 'text-yellow-700 bg-yellow-50 border-yellow-200'
    }

    return {
      skorAkademik: Math.round(skorAkademik),
      skorEkonomi: Math.round(skorEkonomi),
      skorPrestasi: Math.round(skorPrestasi),
      skorDokumen: Math.round(skorDokumen),
      skorTotal,
      kelayakanLabel,
      kelayakanColor
    }
  })()

  // Find doc helper
  function getDocByCategory(jenis: string) {
    return studentDocuments?.find(d => d.jenis === jenis)
  }

  // Handle Detail Screen Rendering
  if (selectedApp) {
    const docLabels: Record<string, string> = {
      foto: 'Pas Foto Resmi (FOTO)',
      ktp: 'Kartu Tanda Penduduk (KTP)',
      kartu_keluarga: 'Kartu Keluarga (KK)',
      transkrip: 'Transkrip Nilai / Rapor',
      sktm: 'Surat Keterangan Tidak Mampu (SKTM)',
      sertifikat_prestasi: 'Sertifikat Prestasi Pendukung',
    }

    return (
      <div className="animate-fade-in pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <Link to="/admin/dashboard" className="hover:text-primary transition">Dashboard</Link>
          <span>&gt;</span>
          <button onClick={() => setSelectedApp(null)} className="hover:text-primary transition">Daftar Pengajuan</button>
          <span>&gt;</span>
          <span className="text-gray-600 font-semibold">{selectedApp.nomor_referensi}</span>
        </div>

        {/* Header Title with Back Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedApp(null)}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 text-gray-500 transition shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800">Detail Pengajuan: {selectedApp.profiles.nama_lengkap}</h1>
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border">
                  {selectedApp.nomor_referensi}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Diajukan pada {new Date(selectedApp.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Detail Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Info Tabs (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex gap-1 overflow-x-auto">
              {(['biodata', 'akademik', 'ekonomi', 'dokumen', 'riwayat'] as DetailTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition uppercase tracking-wider ${
                    activeTab === tab 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-gray-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content Box */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[350px]">
              {loadingDetail ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <svg className="w-10 h-10 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  <p className="text-sm text-gray-400">Memuat profil dan dokumen siswa...</p>
                </div>
              ) : (
                <>
                  {/* TAB: BIODATA */}
                  {activeTab === 'biodata' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-4">Data Pribadi</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <p className="text-xs text-gray-400 mb-1">Nama Lengkap</p>
                            <p className="text-sm font-bold text-slate-800">{studentProfile?.pribadi?.nama_lengkap || selectedApp.profiles.nama_lengkap}</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <p className="text-xs text-gray-400 mb-1">NIM / NISN</p>
                            <p className="text-sm font-bold text-slate-800">{studentProfile?.pribadi?.nim_nisn || selectedApp.profiles.nim_nisn}</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <p className="text-xs text-gray-400 mb-1">Tempat, Tanggal Lahir</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {studentProfile?.pribadi?.tempat_lahir || '—'}, {studentProfile?.pribadi?.tanggal_lahir ? new Date(studentProfile.pribadi.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                            </p>
                          </div>
                          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <p className="text-xs text-gray-400 mb-1">Jenis Kelamin</p>
                            <p className="text-sm font-semibold text-slate-800">{studentProfile?.pribadi?.jenis_kelamin || '—'}</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <p className="text-xs text-gray-400 mb-1">Agama</p>
                            <p className="text-sm font-semibold text-slate-800">{studentProfile?.pribadi?.agama || '—'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-4">Kontak</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <p className="text-xs text-gray-400 mb-1">Alamat Email</p>
                            <p className="text-sm font-semibold text-slate-800">{selectedApp.profiles.email}</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <p className="text-xs text-gray-400 mb-1">Nomor HP</p>
                            <p className="text-sm font-semibold text-slate-800">{studentProfile?.pribadi?.nomor_hp || '—'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-3">Alamat Domisili</h3>
                        <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 leading-relaxed text-sm text-slate-700">
                          {studentProfile?.alamat ? (
                            <>
                              {studentProfile.alamat.alamat}
                              {studentProfile.alamat.rt_rw && `, RT/RW ${studentProfile.alamat.rt_rw}`}
                              {studentProfile.alamat.kelurahan && `, Kel. ${studentProfile.alamat.kelurahan}`}
                              {studentProfile.alamat.kecamatan && `, Kec. ${studentProfile.alamat.kecamatan}`}
                              {studentProfile.alamat.kota && `, ${studentProfile.alamat.kota}`}
                              {studentProfile.alamat.provinsi && `, ${studentProfile.alamat.provinsi}`}
                              {studentProfile.alamat.kode_pos && ` - ${studentProfile.alamat.kode_pos}`}
                            </>
                          ) : '—'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: AKADEMIK */}
                  {activeTab === 'akademik' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-4">Pendidikan Terakhir</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <p className="text-xs text-gray-400 mb-1">Jenjang Pendidikan</p>
                            <p className="text-sm font-semibold text-slate-800">{studentProfile?.akademik?.jenjang || '—'}</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <p className="text-xs text-gray-400 mb-1">Asal Institusi</p>
                            <p className="text-sm font-semibold text-slate-800">{studentProfile?.akademik?.asal_institusi || '—'}</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <p className="text-xs text-gray-400 mb-1">Program Studi / Jurusan</p>
                            <p className="text-sm font-semibold text-slate-800">{studentProfile?.akademik?.program_studi || '—'}</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <p className="text-xs text-gray-400 mb-1">IPK / Nilai Rata-rata</p>
                            <p className="text-sm font-bold text-slate-800">{studentProfile?.akademik?.ipk_nilai !== undefined ? studentProfile.akademik.ipk_nilai : selectedApp.ipk}</p>
                          </div>
                        </div>
                      </div>

                      {/* Data Akademik Tambahan */}
                      {(() => {
                        const da = parseDataAkademik(selectedApp.data_akademik)
                        return (da.peringkat_kelas || da.riwayat_prestasi_akademik) ? (
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-4">Prestasi Akademik Pendukung</h3>
                            <div className="grid grid-cols-1 gap-3">
                              {da.peringkat_kelas && (
                                <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                                  <p className="text-xs text-gray-400 mb-1">Peringkat Kelas</p>
                                  <p className="text-sm font-semibold text-slate-800">{da.peringkat_kelas}</p>
                                </div>
                              )}
                              {da.riwayat_prestasi_akademik && (
                                <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                                  <p className="text-xs text-gray-400 mb-1">Riwayat Prestasi Akademik</p>
                                  <p className="text-sm text-slate-700 leading-relaxed">{da.riwayat_prestasi_akademik}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null
                      })()}

                      {/* Prestasi Non Akademik */}
                      {(() => {
                        const prestasi = parsePrestasi(selectedApp.prestasi_non_akademik)
                        return prestasi.length > 0 ? (
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-4">Prestasi Non-Akademik</h3>
                            <div className="overflow-hidden rounded-xl border border-gray-150 shadow-sm">
                              <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                  <tr>
                                    <th className="text-left px-4 py-3">Nama Prestasi</th>
                                    <th className="text-left px-4 py-3">Tingkat</th>
                                    <th className="text-left px-4 py-3">Tahun</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                  {prestasi.map((p, i) => (
                                    <tr key={i} className="hover:bg-slate-55/40">
                                      <td className="px-4 py-3 font-semibold text-slate-800">{p.nama}</td>
                                      <td className="px-4 py-3 text-slate-600">{p.tingkat}</td>
                                      <td className="px-4 py-3 text-slate-600">{p.tahun}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : null
                      })()}

                      {/* Esai Motivasi */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-3">Esai Motivasi</h3>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto font-serif">
                          {selectedApp.esai_motivasi}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: EKONOMI */}
                  {activeTab === 'ekonomi' && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 flex gap-3 text-sm mb-4">
                        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-semibold">Informasi Keuangan</p>
                          <p className="text-xs text-blue-700/95 mt-0.5">Data berikut digunakan sebagai dasar pengitungan nilai kelayakan ekonomi.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Ayah */}
                        <div className="border border-slate-150 rounded-2xl p-4 bg-white shadow-sm">
                          <h4 className="font-bold text-slate-850 border-b pb-2 mb-3 flex items-center gap-2">
                            <span className="w-2 h-4 bg-sky-500 rounded-sm inline-block" />
                            Data Ayah
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="text-xs text-gray-400">Nama Ayah</p>
                              <p className="font-semibold text-slate-800">{studentProfile?.orang_tua?.ayah_nama || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Pekerjaan</p>
                              <p className="font-semibold text-slate-800">{studentProfile?.orang_tua?.ayah_pekerjaan || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Penghasilan Bulanan</p>
                              <p className="font-bold text-slate-800">
                                {studentProfile?.orang_tua?.ayah_penghasilan !== undefined ? `Rp ${Number(studentProfile.orang_tua.ayah_penghasilan).toLocaleString('id-ID')}` : '—'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Ibu */}
                        <div className="border border-slate-150 rounded-2xl p-4 bg-white shadow-sm">
                          <h4 className="font-bold text-slate-850 border-b pb-2 mb-3 flex items-center gap-2">
                            <span className="w-2 h-4 bg-rose-500 rounded-sm inline-block" />
                            Data Ibu
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="text-xs text-gray-400">Nama Ibu</p>
                              <p className="font-semibold text-slate-800">{studentProfile?.orang_tua?.ibu_nama || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Pekerjaan</p>
                              <p className="font-semibold text-slate-800">{studentProfile?.orang_tua?.ibu_pekerjaan || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Penghasilan Bulanan</p>
                              <p className="font-bold text-slate-800">
                                {studentProfile?.orang_tua?.ibu_penghasilan !== undefined ? `Rp ${Number(studentProfile.orang_tua.ibu_penghasilan).toLocaleString('id-ID')}` : '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: DOKUMEN */}
                  {activeTab === 'dokumen' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-sm font-bold text-slate-800">Review Dokumen Siswa</h3>
                        <span className="text-xs text-gray-400 font-medium">Wajib memeriksa seluruh berkas untuk validasi</span>
                      </div>

                      <div className="space-y-3">
                        {Object.entries(docLabels).map(([jenis, label]) => {
                          const doc = getDocByCategory(jenis)
                          return (
                            <div key={jenis} className="border border-slate-155 rounded-2xl p-4 bg-white hover:bg-slate-50/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  doc ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-800 leading-snug">{label}</p>
                                  <div className="mt-1 flex items-center gap-2">
                                    {doc ? (
                                      <>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                                          doc.status === 'tervalidasi' ? 'bg-green-50 text-green-700 border-green-200' :
                                          doc.status === 'ditolak' ? 'bg-red-50 text-red-700 border-red-200' :
                                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        }`}>
                                          {doc.status}
                                        </span>
                                        <span className="text-[10px] text-gray-400">Diunggah pada {new Date(doc.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                                      </>
                                    ) : (
                                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200">
                                        Belum diunggah
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Document Action Controls */}
                              <div className="flex items-center gap-2 self-end md:self-center">
                                {doc ? (
                                  <>
                                    <a
                                      href={doc.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition"
                                    >
                                      Buka Berkas
                                    </a>
                                    {/* Validasi Button */}
                                    <button
                                      onClick={() => handleUpdateDocumentStatus(doc.id, 'tervalidasi')}
                                      disabled={updatingDocId === doc.id || doc.status === 'tervalidasi'}
                                      className="px-3.5 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 shadow-sm"
                                    >
                                      {updatingDocId === doc.id ? '...' : '✓ Validasi'}
                                    </button>
                                    {/* Tolak Button */}
                                    <button
                                      onClick={() => handleUpdateDocumentStatus(doc.id, 'ditolak')}
                                      disabled={updatingDocId === doc.id || doc.status === 'ditolak'}
                                      className="px-3.5 py-2 rounded-xl border border-red-200 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                      {updatingDocId === doc.id ? '...' : '✗ Tolak'}
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-xs text-gray-300 italic">No document file</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB: RIWAYAT */}
                  {activeTab === 'riwayat' && (
                    <div className="space-y-6">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-4">Riwayat Pengajuan</h3>
                      <div className="relative pl-6 border-l-2 border-slate-100 space-y-8 ml-3 py-2">
                        {/* Timeline Item 1 */}
                        <div className="relative">
                          <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm ring-1 ring-green-500/20" />
                          <p className="text-xs font-bold text-slate-800">Pendaftaran Dibuat</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(selectedApp.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            Siswa atas nama {selectedApp.profiles.nama_lengkap} berhasil mendaftarkan akun dan membuat draf pengajuan.
                          </p>
                        </div>

                        {/* Timeline Item 2 */}
                        <div className="relative">
                          <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm ring-1 ring-blue-500/20" />
                          <p className="text-xs font-bold text-slate-800">Berkas Permohonan Dikirim</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(selectedApp.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            Siswa telah melengkapi biodata 100% dan menyerahkan aplikasi beasiswa untuk proses peninjauan berkas.
                          </p>
                        </div>

                        {/* Timeline Item 3 (Current Status) */}
                        <div className="relative">
                          <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                            selectedApp.status === 'PENDING' ? 'bg-yellow-500 ring-yellow-500/20' :
                            selectedApp.status === 'TERVERIFIKASI' ? 'bg-blue-500 ring-blue-500/20' :
                            selectedApp.status === 'REVISI' ? 'bg-orange-500 ring-orange-500/20' :
                            selectedApp.status === 'DITOLAK' ? 'bg-red-500 ring-red-500/20' : 'bg-green-500 ring-green-500/20'
                          } ring-1`} />
                          <p className="text-xs font-bold text-slate-800">
                            Status Saat Ini: <span className="underline">{selectedApp.status}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {selectedApp.status === 'PENDING' && 'Menunggu verifikasi berkas oleh admin.'}
                            {selectedApp.status === 'TERVERIFIKASI' && 'Berkas lolos verifikasi tahap administrasi.'}
                            {selectedApp.status === 'REVISI' && `Admin meminta revisi berkas siswa. Catatan: "${selectedApp.catatan_admin || '—'}"`}
                            {selectedApp.status === 'DITOLAK' && `Pengajuan ditolak. Catatan: "${selectedApp.catatan_admin || '—'}"`}
                            {selectedApp.status === 'DITERIMA' && 'Selamat! Siswa ini resmi diterima sebagai penerima program beasiswa.'}
                            {selectedApp.status === 'CADANGAN' && 'Pengajuan masuk dalam posisi cadangan penerima beasiswa.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Side Control Panel (1/3 width) */}
          <div className="space-y-6">
            {/* Card: Keputusan Verifikasi */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                <span className="w-2 h-4 bg-emerald-500 rounded-sm inline-block" />
                Keputusan Verifikasi
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Catatan Verifikasi</label>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Tambahkan alasan persetujuan, tolak, atau revisi dokumen..."
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none bg-slate-50 transition"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  {/* Approve */}
                  <button
                    onClick={() => handleUpdateStatusDirect('TERVERIFIKASI')}
                    disabled={updating}
                    className="w-full py-3 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    {updating ? 'Sedang Memproses...' : '✓ Setujui Pengajuan'}
                  </button>

                  {/* Request Revision */}
                  <button
                    onClick={() => handleUpdateStatusDirect('REVISI')}
                    disabled={updating}
                    className="w-full py-3 rounded-xl border border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 transition font-bold text-sm flex items-center justify-center gap-2"
                  >
                    ⚠️ Minta Revisi Berkas
                  </button>

                  {/* Reject */}
                  <button
                    onClick={() => handleUpdateStatusDirect('DITOLAK')}
                    disabled={updating}
                    className="w-full py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    ✗ Tolak Pengajuan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Kelola Pengajuan</p>
          <h1 className="text-2xl font-bold text-slate-800">Daftar Pengajuan Beasiswa</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Terdapat <span className="font-semibold text-slate-700">{applications.length}</span> pengajuan masuk yang perlu diperiksa dan diverifikasi.
          </p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* ── Search + Filter ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama atau NIM/NISN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-gray-50"
          />
        </div>
        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Filter Status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as StatusFilter)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Semua</option>
            <option value="PENDING">Pending</option>
            <option value="TERVERIFIKASI">Verified</option>
            <option value="REVISI">Revision</option>
            <option value="DITERIMA">Accepted</option>
            <option value="DITOLAK">Rejected</option>
            <option value="CADANGAN">Cadangan</option>
          </select>
          <Button 
            variant="outline" 
            onClick={handleExport} 
            loading={exporting}
            className="ml-2 px-3 py-1.5 text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Excel
          </Button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-150 rounded-xl" />)}
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium">Belum ada pengajuan{filter ? ` dengan status "${filter}"` : ''}.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Siswa</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Program</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tgl Daftar</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Skor Kelayakan</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/60 transition-colors group">
                  {/* Siswa */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${getAvatarColor(app.profiles.nama_lengkap)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                        {getInitials(app.profiles.nama_lengkap)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{app.profiles.nama_lengkap}</p>
                        <p className="text-xs text-gray-400">{app.profiles.nim_nisn}</p>
                      </div>
                    </div>
                  </td>
                  {/* Program */}
                  <td className="px-6 py-4">
                    <ProgramIcon nama={app.scholarship_programs.nama} />
                  </td>
                  {/* Tgl Daftar */}
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">
                        {new Date(app.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  {/* Skor Kelayakan */}
                  <td className="px-6 py-4 text-center">
                    {app.skor_kelayakan !== null ? (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        app.skor_kelayakan >= 85 ? 'bg-green-50 text-green-700 border-green-200' :
                        app.skor_kelayakan >= 70 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {app.skor_kelayakan}/100
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} />
                  </td>
                  {/* Aksi */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openDetail(app)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition group-hover:shadow"
                    >
                      Detail
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredApps.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Menampilkan <span className="font-semibold text-slate-700">{filteredApps.length}</span> dari <span className="font-semibold text-slate-700">{applications.length}</span> pengajuan
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPengajuanPage
