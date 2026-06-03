import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button } from '../components'
import {
  getUserApplications,
  getApplicationHistory,
  type Application,
  type ApplicationHistory,
  type ApplicationStatus,
} from '../services/scholarship'
import { formatDate } from '../utils'

const STAGES = [
  { id: 1, label: 'Pengajuan Dikirim' },
  { id: 2, label: 'Verifikasi Berkas' },
  { id: 3, label: 'Revisi Berkas' },
  { id: 4, label: 'Seleksi' },
  { id: 5, label: 'Peninjauan Akhir' },
  { id: 6, label: 'Pencairan Dana' },
] as const

function getActiveStageCount(status: ApplicationStatus): number {
  switch (status) {
    case 'PENDING': return 1
    case 'TERVERIFIKASI': return 2
    case 'REVISI': return 2
    case 'DITERIMA': return 5
    case 'CADANGAN': return 5
    case 'DITOLAK': return 5
    default: return 1
  }
}

function getStatusColor(status: ApplicationStatus): string {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800'
    case 'TERVERIFIKASI': return 'bg-blue-100 text-blue-800'
    case 'DITERIMA': return 'bg-green-100 text-green-800'
    case 'DITOLAK': return 'bg-red-100 text-red-800'
    case 'REVISI': return 'bg-orange-100 text-orange-800'
    case 'CADANGAN': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function StatusPengajuanPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [history, setHistory] = useState<ApplicationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadApplications()
  }, [])

  useEffect(() => {
    if (id) {
      const found = applications.find((a) => a.id === id)
      if (found) {
        setSelectedApp(found)
        loadHistory(id)
      }
    }
  }, [id, applications])

  async function loadApplications() {
    try {
      setLoading(true)
      setError(null)
      const apps = await getUserApplications()

      if (apps.length === 0) {
        setApplications([])
        return
      }

      setApplications(apps)

      if (!id && apps.length > 0) {
        setSelectedApp(apps[0])
        await loadHistory(apps[0].id)
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data pengajuan.')
    } finally {
      setLoading(false)
    }
  }

  async function loadHistory(appId: string) {
    try {
      setHistoryLoading(true)
      const data = await getApplicationHistory(appId)
      setHistory(data)
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  function selectApplication(app: Application) {
    setSelectedApp(app)
    navigate(`/dokumen/status/${app.id}`, { replace: true })
    loadHistory(app.id)
  }

  function getStageTimestamp(stageIndex: number): string | null {
    if (!selectedApp) return null

    if (stageIndex === 1) {
      return formatDate(new Date(selectedApp.created_at))
    }

    const historyEntry = history.find((h) => {
      const stageForStatus = getActiveStageCount(h.new_status as ApplicationStatus)
      return stageForStatus === stageIndex
    })

    if (historyEntry) {
      return formatDate(new Date(historyEntry.created_at))
    }

    if (stageIndex === getActiveStageCount(selectedApp.status) && selectedApp.updated_at) {
      return formatDate(new Date(selectedApp.updated_at))
    }

    return null
  }

  if (loading) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadApplications}>Coba Lagi</Button>
        </div>
      </section>
    )
  }

  if (applications.length === 0) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-primary mb-2">Status Pengajuan</h1>
        <p className="text-gray-500 mb-6">Pantau perkembangan pengajuan beasiswa kamu.</p>
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg text-gray-600 mb-2">Belum ada data pengajuan</p>
          <p className="text-sm text-gray-400">Ajukan beasiswa terlebih dahulu untuk melihat status.</p>
        </Card>
      </section>
    )
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary mb-2">Status Pengajuan</h1>
      <p className="text-gray-500 mb-6">Pantau perkembangan pengajuan beasiswa kamu secara real-time.</p>

      {/* Application List */}
      {applications.length > 1 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-2">Pilih Pengajuan</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {applications.map((app) => (
              <button
                key={app.id}
                onClick={() => selectApplication(app)}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition border ${
                  selectedApp?.id === app.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                }`}
              >
                {app.scholarship_programs?.nama || 'Program'} — {app.nomor_referensi}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedApp && (
        <>
          {/* Info Panel */}
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-primary">
                  {selectedApp.scholarship_programs?.nama || 'Program Beasiswa'}
                </h2>
                <div className="text-sm text-gray-500 space-y-1 mt-1">
                  <p>No. Referensi: {selectedApp.nomor_referensi}</p>
                  <p>IPK: {selectedApp.ipk}</p>
                  <p>Diajukan: {formatDate(new Date(selectedApp.created_at))}</p>
                </div>
              </div>
              <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold self-start ${getStatusColor(selectedApp.status)}`}>
                {selectedApp.status}
              </span>
            </div>
          </Card>

          {/* Conditional Banners */}
          {selectedApp.status === 'DITERIMA' && (
            <Card className="mb-6 border-green-300 bg-green-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Selamat! Pengajuan Diterima</h3>
                  <p className="text-sm text-green-700">Pengajuan beasiswa kamu telah diterima. Silakan unduh surat penerimaan.</p>
                </div>
                <Button variant="secondary">
                  Unduh Surat Penerimaan
                </Button>
              </div>
            </Card>
          )}

          {selectedApp.status === 'REVISI' && selectedApp.catatan_admin && (
            <Card className="mb-6 border-orange-300 bg-orange-50">
              <div>
                <h3 className="text-base font-semibold text-orange-800 mb-1">Perbaikan Diperlukan</h3>
                <p className="text-sm text-orange-700">{selectedApp.catatan_admin}</p>
              </div>
            </Card>
          )}

          {selectedApp.status === 'DITOLAK' && selectedApp.catatan_admin && (
            <Card className="mb-6 border-red-300 bg-red-50">
              <div>
                <h3 className="text-base font-semibold text-red-800 mb-1">Pengajuan Ditolak</h3>
                <p className="text-sm text-red-700">{selectedApp.catatan_admin}</p>
              </div>
            </Card>
          )}

          {/* Timeline Visual 6 Tahap */}
          <Card>
            <h3 className="text-base font-semibold text-gray-800 mb-6">Tahapan Pengajuan</h3>
            <div className="relative">
              {historyLoading ? (
                <div className="animate-pulse space-y-6 py-4">
                  {STAGES.map((s) => (
                    <div key={s.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-0">
                  {STAGES.map((stage, idx) => {
                    const activeStages = getActiveStageCount(selectedApp.status)
                    const isCompleted = stage.id <= activeStages
                    const isCurrent = stage.id === activeStages
                    const timestamp = getStageTimestamp(stage.id)

                    return (
                      <div key={stage.id} className="relative flex items-start gap-4 pb-8 last:pb-0">
                        {/* Connecting Line */}
                        {idx < STAGES.length - 1 && (
                          <div
                            className={`absolute left-[15px] top-8 w-0.5 h-full -translate-x-1/2 ${
                              isCompleted && stage.id < activeStages ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          />
                        )}

                        {/* Circle Indicator */}
                        <div className="relative z-10 shrink-0">
                          {isCompleted ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCurrent ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-green-500'
                            }`}>
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">{stage.id}</span>
                            </div>
                          )}
                        </div>

                        {/* Stage Info */}
                        <div className="pt-1">
                          <p className={`text-sm font-medium ${
                            isCompleted ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {stage.label}
                          </p>
                          {timestamp && (
                            <p className="text-xs text-gray-500 mt-0.5">{timestamp}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* History Log */}
              {history.length > 0 && (
                <details className="mt-6 border-t border-gray-100 pt-4">
                  <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-primary transition">
                    Riwayat Perubahan Status
                  </summary>
                  <div className="mt-3 space-y-2">
                    {history.map((h) => (
                      <div key={h.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                        <div>
                          <span className="font-medium text-gray-700">{h.old_status || '-'}</span>
                          <span className="text-gray-400 mx-1">→</span>
                          <span className={`font-medium ${getStatusColor(h.new_status as ApplicationStatus)}`}>
                            {h.new_status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(new Date(h.created_at))}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </Card>
        </>
      )}
    </section>
  )
}

export default StatusPengajuanPage
