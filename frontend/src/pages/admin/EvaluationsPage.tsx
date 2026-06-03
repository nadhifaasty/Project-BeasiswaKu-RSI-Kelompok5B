import { useState, useEffect } from 'react'
import { Card } from '../../components'
import { fetchApi } from '../../services/api'

interface StatusDistribution {
  PENDING: number
  TERVERIFIKASI: number
  REVISI: number
  DITOLAK: number
  DITERIMA: number
  CADANGAN: number
}

interface EvaluationItem {
  program_id: string
  program_name: string
  total_pendaftar: number
  total_diterima: number
  acceptance_rate: number
  avg_skor_total: number
  sebaran_status: StatusDistribution
  avg_ipk: number
  avg_penghasilan_ortu: number
}

interface ApiResponse {
  success: boolean
  message: string
  data: EvaluationItem[]
}

function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    loadEvaluations()
  }, [])

  async function loadEvaluations() {
    setLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetchApi<ApiResponse>('/admin/evaluations')
      setEvaluations(res.data || [])
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat data evaluasi program.')
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-indigo-200 tracking-wide uppercase">
          KPI Evaluasi Program
        </span>
        <h1 className="text-2xl font-bold text-primary">Evaluasi & Analisis Beasiswa</h1>
        <p className="text-gray-500">
          Metrik keberhasilan, tingkat kelulusan, dan statistik profil ekonomi/akademis penerima beasiswa per program.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm">
          ⚠ {errorMessage}
        </div>
      )}

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {evaluations.length > 0 ? (
          evaluations.map((item) => (
            <Card
              key={item.program_id}
              className="p-6 border border-gray-150 rounded-2xl flex flex-col justify-between hover:shadow-lg transition duration-300"
            >
              <div>
                {/* Title */}
                <div className="border-b border-gray-100 pb-3 mb-4">
                  <h3 className="text-base font-extrabold text-primary">{item.program_name}</h3>
                  <span className="text-[10px] text-gray-400 font-mono tracking-wider">ID: {item.program_id}</span>
                </div>

                {/* KPI stats strip */}
                <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3 border text-center mb-6">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Pendaftar</span>
                    <span className="text-lg font-extrabold text-primary">{item.total_pendaftar}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Diterima</span>
                    <span className="text-lg font-extrabold text-indigo-600">{item.total_diterima}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Lolos</span>
                    <span className="text-lg font-extrabold text-emerald-600">
                      {item.acceptance_rate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Rata-rata Kriteria</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* Avg IPK */}
                    <div className="bg-white border rounded-xl p-3 shadow-sm">
                      <span className="text-xs text-gray-400">Rata-rata IPK</span>
                      <p className="text-lg font-bold text-primary mt-1">
                        {item.avg_ipk > 0 ? item.avg_ipk.toFixed(2) : '-'}
                      </p>
                    </div>
                    {/* Avg Income */}
                    <div className="bg-white border rounded-xl p-3 shadow-sm">
                      <span className="text-xs text-gray-400">Rata-rata Pendapatan Ortu</span>
                      <p className="text-sm font-bold text-primary mt-1.5 truncate">
                        {item.avg_penghasilan_ortu > 0 ? formatRupiah(item.avg_penghasilan_ortu) : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Distribution progress bars */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Sebaran Status Berkas</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="flex items-center justify-between border rounded-lg p-2 bg-white">
                      <span className="text-gray-500">Pending</span>
                      <span className="font-bold text-primary">{item.sebaran_status.PENDING || 0}</span>
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-2 bg-white">
                      <span className="text-gray-500">Terverifikasi</span>
                      <span className="font-bold text-green-700">{item.sebaran_status.TERVERIFIKASI || 0}</span>
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-2 bg-white">
                      <span className="text-gray-500">Revisi</span>
                      <span className="font-bold text-orange-600">{item.sebaran_status.REVISI || 0}</span>
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-2 bg-white">
                      <span className="text-gray-500">Ditolak</span>
                      <span className="font-bold text-red-600">{item.sebaran_status.DITOLAK || 0}</span>
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-2 bg-white">
                      <span className="text-gray-500">Diterima</span>
                      <span className="font-bold text-blue-600">{item.sebaran_status.DITERIMA || 0}</span>
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-2 bg-white">
                      <span className="text-gray-500">Cadangan</span>
                      <span className="font-bold text-purple-600">{item.sebaran_status.CADANGAN || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Average */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className="text-gray-400 font-semibold uppercase">Rata-rata Skor Kelayakan</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {item.avg_skor_total > 0 ? item.avg_skor_total.toFixed(2) : '-'} / 100
                </span>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-12 text-gray-400">
            Belum ada program beasiswa untuk dievaluasi.
          </div>
        )}
      </div>
    </section>
  )
}

export default EvaluationsPage
