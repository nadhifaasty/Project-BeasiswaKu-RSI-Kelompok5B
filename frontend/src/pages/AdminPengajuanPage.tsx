import { useState, useEffect } from 'react'
import { Button } from '../components'
import { fetchApi } from '../services/api'
import { exportReportExcel } from '../services/report'

// ============ TYPES ============

interface AdminApplication {
  id: string
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
  const [newStatus, setNewStatus] = useState('')
  const [catatan, setCatatan] = useState('')
  const [updating, setUpdating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadApplications()
  }, [filter])

  async function loadApplications() {
    try {
      setLoading(true)
      const query = filter ? `?status=${filter}` : ''
      const res = await fetchApi<ApiResponse<AdminApplication[]>>(
        `/scholarship/admin/applications${query}`
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

  async function handleUpdateStatus() {
    if (!selectedApp || !newStatus) return
    setUpdating(true)
    setMessage(null)
    try {
      await fetchApi(`/scholarship/admin/applications/${selectedApp.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, catatan_admin: catatan || undefined }),
      })
      setMessage({ type: 'success', text: 'Status berhasil diperbarui.' })
      setSelectedApp(null)
      setNewStatus('')
      setCatatan('')
      await loadApplications()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui status.' })
    } finally {
      setUpdating(false)
    }
  }

  function openDetail(app: AdminApplication) {
    setSelectedApp(app)
    setNewStatus('')
    setCatatan(app.catatan_admin || '')
    setMessage(null)
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
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
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

      {/* ── Detail Modal ── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedApp(null) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full ${getAvatarColor(selectedApp.profiles.nama_lengkap)} flex items-center justify-center text-white font-bold`}>
                  {getInitials(selectedApp.profiles.nama_lengkap)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">{selectedApp.profiles.nama_lengkap}</h2>
                  <p className="text-xs text-gray-400">{selectedApp.nomor_referensi}</p>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Dasar */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informasi Pendaftar</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Nama Lengkap', value: selectedApp.profiles.nama_lengkap },
                    { label: 'NIM / NISN', value: selectedApp.profiles.nim_nisn },
                    { label: 'Email', value: selectedApp.profiles.email },
                    { label: 'Program Beasiswa', value: selectedApp.scholarship_programs.nama },
                    {
                      label: selectedApp.scholarship_programs?.nama?.toLowerCase().includes('perguruan') ||
                             selectedApp.scholarship_programs?.nama?.toLowerCase().includes('tinggi') ||
                             selectedApp.scholarship_programs?.nama?.toLowerCase().includes('mahasiswa')
                        ? 'IPK' : 'Nilai Rata-rata',
                      value: String(selectedApp.ipk)
                    },
                    { label: 'Status Saat Ini', value: <StatusBadge status={selectedApp.status} /> },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                      <div className="text-sm font-semibold text-slate-800">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skor Kelayakan */}
              {selectedApp.skor_kelayakan !== null && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Skor Kelayakan</h3>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-4">
                    <span className={`text-3xl font-black ${
                      selectedApp.skor_kelayakan >= 85 ? 'text-green-600' :
                      selectedApp.skor_kelayakan >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>{selectedApp.skor_kelayakan}</span>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            selectedApp.skor_kelayakan >= 85 ? 'bg-green-500' :
                            selectedApp.skor_kelayakan >= 70 ? 'bg-yellow-400' : 'bg-red-500'
                          }`}
                          style={{ width: `${selectedApp.skor_kelayakan}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">dari 100 poin</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Akademik */}
              {(() => {
                const da = parseDataAkademik(selectedApp.data_akademik)
                return (da.peringkat_kelas || da.riwayat_prestasi_akademik) ? (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Data Akademik</h3>
                    <div className="space-y-2">
                      {da.peringkat_kelas && (
                        <div className="bg-gray-50 rounded-xl px-4 py-3">
                          <p className="text-xs text-gray-400 mb-1">Peringkat Kelas</p>
                          <p className="text-sm font-semibold text-slate-800">{da.peringkat_kelas}</p>
                        </div>
                      )}
                      {da.riwayat_prestasi_akademik && (
                        <div className="bg-gray-50 rounded-xl px-4 py-3">
                          <p className="text-xs text-gray-400 mb-1">Riwayat Prestasi Akademik</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{da.riwayat_prestasi_akademik}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null
              })()}

              {/* Prestasi Non-Akademik */}
              {(() => {
                const prestasi = parsePrestasi(selectedApp.prestasi_non_akademik)
                return prestasi.length > 0 ? (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Prestasi Non-Akademik</h3>
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs">
                          <tr>
                            <th className="text-left px-4 py-2">Nama Prestasi</th>
                            <th className="text-left px-4 py-2">Tingkat</th>
                            <th className="text-left px-4 py-2">Tahun</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {prestasi.map((p, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2 font-medium text-slate-800">{p.nama}</td>
                              <td className="px-4 py-2 text-slate-600">{p.tingkat}</td>
                              <td className="px-4 py-2 text-slate-600">{p.tahun}</td>
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
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Esai Motivasi</h3>
                <div className="bg-gray-50 rounded-xl px-4 py-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedApp.esai_motivasi}
                </div>
              </div>

              {/* Catatan Admin Sebelumnya */}
              {selectedApp.catatan_admin && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Catatan Admin Sebelumnya</h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 italic">
                    "{selectedApp.catatan_admin}"
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Update Status Pengajuan</h3>
                <div className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  >
                    <option value="">— Pilih status baru —</option>
                    <option value="TERVERIFIKASI">Terverifikasi</option>
                    <option value="REVISI">Butuh Revisi</option>
                    <option value="DITERIMA">Diterima ✓</option>
                    <option value="DITOLAK">Ditolak ✗</option>
                    <option value="CADANGAN">Cadangan</option>
                  </select>

                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Tambahkan catatan untuk pemohon (opsional)..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50"
                  />

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setSelectedApp(null)} className="flex-1">
                      Batal
                    </Button>
                    <button
                      onClick={handleUpdateStatus}
                      disabled={!newStatus || updating}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                      {updating ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                          </svg>
                          Menyimpan...
                        </>
                      ) : 'Simpan Keputusan'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPengajuanPage
