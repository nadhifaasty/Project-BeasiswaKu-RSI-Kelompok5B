import { useState, useEffect } from 'react'
import { Card, Button, Modal } from '../../components'
import { getAuditLogs } from '../../services/system'

interface AuditLog {
  id: string
  user_id: string
  aksi: string
  resource_type: string | null
  resource_id: string | null
  created_at: string
  ip_address?: string | null
  user_email?: string | null
  user_role?: string | null
  user_agent?: string | null
  profiles?: {
    nama_lengkap: string
    role: string
  } | null
}

interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  })
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Filters State
  const [actionType, setActionType] = useState('')
  const [userIdFilter, setUserIdFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isTodayOnly, setIsTodayOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [showDetailedFilters, setShowDetailedFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  useEffect(() => {
    loadAuditLogs()
  }, [page, actionType, startDate, endDate, searchQuery])

  async function loadAuditLogs() {
    setLoading(true)
    setErrorMessage(null)
    try {
      const paramsObj: Record<string, string> = {
        page: String(page),
        per_page: '15'
      }
      if (actionType) paramsObj.action_type = actionType
      if (userIdFilter) paramsObj.user_id = userIdFilter
      if (startDate) paramsObj.start_date = new Date(startDate).toISOString()
      if (endDate) paramsObj.end_date = new Date(endDate).toISOString()
      if (searchQuery) paramsObj.search = searchQuery

      const res = await getAuditLogs(paramsObj)
      
      const responseData = res.data
      if (responseData && Array.isArray(responseData.data)) {
        setLogs(responseData.data)
        if (responseData.meta) {
          setMeta(responseData.meta)
        }
      } else if (Array.isArray(res.data)) {
        setLogs(res.data)
        if (res.meta) {
          setMeta(res.meta)
        }
      } else {
        setLogs([])
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat log audit.')
    } finally {
      setLoading(false)
    }
  }

  function handleResetFilters() {
    setActionType('')
    setUserIdFilter('')
    setStartDate('')
    setEndDate('')
    setSearchQuery('')
    setIsTodayOnly(false)
    setPage(1)
  }

  function toggleTodayFilter() {
    if (isTodayOnly) {
      setIsTodayOnly(false)
      setStartDate('')
      setEndDate('')
    } else {
      setIsTodayOnly(true)
      const today = new Date()
      today.setHours(0,0,0,0)
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      setStartDate(today.toISOString())
      setEndDate(tomorrow.toISOString())
    }
    setPage(1)
  }

  function handleExportPDF() {
    window.print()
  }

  function getActionBadgeStyle(action: string) {
    const act = action.toUpperCase()
    if (act.includes('LOGIN') || act.includes('LOGOUT') || act.includes('REVISI') || act.includes('UPDATE')) {
      return 'bg-blue-50 text-blue-700 border-blue-200'
    }
    if (act.includes('APPROVE') || act.includes('SAHKAN') || act.includes('TERIMA') || act.includes('SUBMIT')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
    if (act.includes('TOLAK') || act.includes('BATAL') || act.includes('DELETE') || act.includes('ERROR')) {
      return 'bg-red-50 text-red-700 border-red-200'
    }
    if (act.includes('HITUNG') || act.includes('PROSES')) {
      return 'bg-amber-50 text-amber-700 border-amber-200'
    }
    return 'bg-gray-50 text-gray-700 border-gray-200'
  }

  function getAvatarStyle(name?: string) {
    if (!name) return 'bg-gray-100 text-gray-600'
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    const colors = [
      'bg-red-100 text-red-700',
      'bg-orange-100 text-orange-700',
      'bg-amber-100 text-amber-700',
      'bg-emerald-100 text-emerald-700',
      'bg-teal-100 text-teal-700',
      'bg-blue-100 text-blue-700',
      'bg-indigo-100 text-indigo-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
    ]
    return colors[charCodeSum % colors.length]
  }

  function getInitials(name?: string) {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  function formatRole(role?: string) {
    if (!role) return 'SYSTEM'
    const roleLower = role.toLowerCase()
    if (roleLower === 'super_admin' || roleLower === 'superadmin') return 'SUPERADMIN'
    return role.toUpperCase()
  }

  function formatDateTime(dateStr: string) {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    
    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`
    }
  }

  return (
    <div className="bg-[#faf5e8] -m-6 p-6 min-h-[calc(100vh-4rem)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="inline-block bg-[#e8e2d2] text-[#5c5440] text-[10px] font-bold px-3 py-1 rounded-full mb-2 border border-[#d6cfbe] tracking-wider uppercase">
            Log Keamanan & Aktivitas
          </span>
          <h1 className="text-2xl font-bold text-primary">Audit Log Sistem</h1>
          <p className="text-sm text-gray-500">
            Rekam jejak seluruh aktivitas krusial yang dilakukan oleh administrator dan super administrator.
          </p>
        </div>
        <div>
          <Button
            onClick={handleExportPDF}
            className="flex items-center gap-2 text-xs font-bold bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm px-4 py-2 rounded-lg transition"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm">
          ⚠ {errorMessage}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari aktivitas atau aktor..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={toggleTodayFilter}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold shadow-sm transition ${
              isTodayOnly
                ? 'bg-primary text-secondary border-primary'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hari Ini
          </button>

          <button
            onClick={() => {
              setUserIdFilter('')
              setSearchQuery('')
              setPage(1)
            }}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold shadow-sm transition bg-white text-gray-700 border-gray-200 hover:bg-gray-50`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Semua Aktor
          </button>

          <button
            onClick={() => setShowDetailedFilters(!showDetailedFilters)}
            className={`p-2.5 border rounded-xl shadow-sm transition ${
              showDetailedFilters
                ? 'bg-primary text-secondary border-primary'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Collapsible Detailed Filters */}
      {showDetailedFilters && (
        <Card className="p-5">
          <h2 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
            🔍 Filter Lanjutan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Action type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Aksi</label>
              <select
                value={actionType}
                onChange={(e) => {
                  setActionType(e.target.value)
                  setPage(1)
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary bg-white focus:ring-2 focus:ring-accent"
              >
                <option value="">Semua Aksi</option>
                <option value="LOGIN">LOGIN</option>
                <option value="REGISTER">REGISTER</option>
                <option value="SUBMIT_APPLICATION">SUBMIT_APPLICATION</option>
                <option value="HITUNG_SKOR">HITUNG_SKOR</option>
                <option value="SAHKAN_SELEKSI">SAHKAN_SELEKSI</option>
                <option value="BATAL_SAH_SELEKSI">BATAL_SAH_SELEKSI</option>
              </select>
            </div>

            {/* User ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">User ID</label>
              <input
                type="text"
                value={userIdFilter}
                onChange={(e) => {
                  setUserIdFilter(e.target.value)
                  setPage(1)
                }}
                placeholder="Cari ID pengguna..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Mulai Tanggal</label>
              <input
                type="date"
                value={startDate ? startDate.substring(0, 10) : ''}
                onChange={(e) => {
                  setStartDate(e.target.value ? new Date(e.target.value).toISOString() : '')
                  setPage(1)
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary focus:ring-2 focus:ring-accent bg-white"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Hingga Tanggal</label>
              <input
                type="date"
                value={endDate ? endDate.substring(0, 10) : ''}
                onChange={(e) => {
                  setEndDate(e.target.value ? new Date(e.target.value).toISOString() : '')
                  setPage(1)
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary focus:ring-2 focus:ring-accent bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={handleResetFilters} className="text-xs font-bold px-4">
              Reset Filter
            </Button>
            <Button onClick={loadAuditLogs} className="text-xs font-bold px-5 bg-primary text-secondary">
              Terapkan Pencarian
            </Button>
          </div>
        </Card>
      )}

      {/* Logs Table Card */}
      <Card className="p-0 overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-4 animate-pulse p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : logs.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#faf5e8] border-b border-gray-200 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  <th className="py-3.5 px-6">Waktu</th>
                  <th className="py-3.5 px-6">Aktor</th>
                  <th className="py-3.5 px-6">Aksi</th>
                  <th className="py-3.5 px-6">Target</th>
                  <th className="py-3.5 px-6">IP Address</th>
                  <th className="py-3.5 px-6 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm bg-white">
                {logs.map((log) => {
                  const { date, time } = formatDateTime(log.created_at)
                  const actorName = log.profiles?.nama_lengkap || log.user_email || 'System'
                  const actorRole = log.profiles?.role || log.user_role || 'system'
                  
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition group">
                      {/* Waktu */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-700">{date}</div>
                        <div className="text-xs text-gray-400 font-medium mt-0.5">{time}</div>
                      </td>

                      {/* Aktor */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${getAvatarStyle(actorName)}`}>
                            {getInitials(actorName)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{actorName}</div>
                            <div className="text-[10px] font-bold text-teal-600 mt-0.5 tracking-wider uppercase">
                              {formatRole(actorRole)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border tracking-wider ${getActionBadgeStyle(log.aksi)}`}>
                          {log.aksi}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-gray-700 font-mono text-xs font-semibold">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
                          </svg>
                          <span>{log.resource_id || log.resource_type || '-'}</span>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-gray-500 font-mono text-xs">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
                          </svg>
                          <span>{log.ip_address || '-'}</span>
                        </div>
                      </td>

                      {/* Detail Button */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
                          title="Detail Log"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-400 bg-white">
              Belum ada log audit yang sesuai filter.
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-gray-150 p-5 bg-white">
            <span className="text-xs font-semibold text-gray-500">
              Menampilkan {logs.length} dari {meta.total} log
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="px-3.5 py-1.5 text-xs font-semibold"
              >
                Sebelumnya
              </Button>
              <span className="flex items-center px-3 text-xs font-bold text-primary">
                Halaman {meta.current_page} dari {meta.last_page}
              </span>
              <Button
                variant="outline"
                disabled={page >= meta.last_page || loading}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-1.5 text-xs font-semibold"
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Detail Audit Log"
      >
        {selectedLog && (
          <div className="space-y-4 text-sm text-primary">
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Aksi</span>
              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border mt-1 ${getActionBadgeStyle(selectedLog.aksi)}`}>
                {selectedLog.aksi}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Waktu Kejadian</span>
              <span className="font-mono text-gray-700 block mt-1">
                {new Date(selectedLog.created_at).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Aktor</span>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${getAvatarStyle(selectedLog.profiles?.nama_lengkap || selectedLog.user_email || 'System')}`}>
                  {getInitials(selectedLog.profiles?.nama_lengkap || selectedLog.user_email || 'System')}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{selectedLog.profiles?.nama_lengkap || selectedLog.user_email || 'System'}</div>
                  <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mt-0.5">
                    {formatRole(selectedLog.profiles?.role || selectedLog.user_role || 'system')}
                  </div>
                </div>
              </div>
            </div>

            {selectedLog.resource_type && (
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipe Target</span>
                <span className="font-medium text-gray-700 block mt-1">{selectedLog.resource_type}</span>
              </div>
            )}

            {selectedLog.resource_id && (
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Target ID</span>
                <span className="font-mono text-gray-700 block mt-1">{selectedLog.resource_id}</span>
              </div>
            )}

            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">IP Address</span>
              <span className="font-mono text-gray-700 block mt-1">{selectedLog.ip_address || '-'}</span>
            </div>

            {selectedLog.user_agent && (
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">User Agent</span>
                <span className="text-xs text-gray-600 break-all block mt-1">{selectedLog.user_agent}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AuditLogPage
