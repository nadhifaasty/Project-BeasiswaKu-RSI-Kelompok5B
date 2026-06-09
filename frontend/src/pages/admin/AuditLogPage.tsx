import { useState, useEffect } from 'react'
import { Card, Button } from '../../components'
import { getAuditLogs } from '../../services/system'

interface AuditLog {
  id: string
  user_id: string
  aksi: string
  resource_type: string | null
  resource_id: string | null
  created_at: string
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
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadAuditLogs()
  }, [page, actionType, startDate, endDate])

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

      const res = await getAuditLogs(paramsObj)
      
      // The API return is wrapped in sendSuccess envelope
      // Which means it is { success: true, message: "...", data: { data: [...], meta: {...} } }
      // Let's handle both nested envelope and flat layout
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
    setPage(1)
  }

  function getActionBadgeStyle(action: string) {
    switch (action) {
      case 'LOGIN':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'REGISTER':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'SUBMIT_APPLICATION':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'HITUNG_SKOR':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'SAHKAN_SELEKSI':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'BATAL_SAH_SELEKSI':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <span className="inline-block bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-red-200 tracking-wide uppercase">
          Audit Trail Log
        </span>
        <h1 className="text-2xl font-bold text-primary">Log Audit Sistem</h1>
        <p className="text-gray-500">
          Catatan aktivitas transaksional sistem untuk kepatuhan keamanan dan penelusuran aksi.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm">
          ⚠ {errorMessage}
        </div>
      )}

      {/* Filters Card */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
          🔍 Filter & Pencarian Log
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
              onChange={(e) => setUserIdFilter(e.target.value)}
              placeholder="Cari ID pengguna..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Mulai Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
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
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
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

      {/* Logs Table Card */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-4 animate-pulse py-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : logs.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                  <th className="py-3 px-4">Waktu Kejadian</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Aktor (User ID)</th>
                  <th className="py-3 px-4">Tipe Berkas</th>
                  <th className="py-3 px-4">Target ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${getActionBadgeStyle(log.aksi)}`}>
                        {log.aksi}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-primary truncate max-w-[150px]" title={log.user_id}>
                      {log.user_id}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-600">
                      {log.resource_type || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-400 truncate max-w-[150px]" title={log.resource_id || ''}>
                      {log.resource_id || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Belum ada log audit yang sesuai filter.
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-gray-150 pt-5 mt-5">
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
    </section>
  )
}

export default AuditLogPage
