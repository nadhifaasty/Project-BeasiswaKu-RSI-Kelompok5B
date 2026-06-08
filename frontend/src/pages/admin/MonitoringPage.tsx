import { useState, useEffect } from 'react'
import { Card } from '../../components'
import { fetchApi } from '../../services/api'

interface MonitoringKpi {
  total_pendaftar: number
  total_penerima: number
  akumulasi_dana_cair: number
  success_rate: number
}

interface TopInstitusi {
  nama: string
  jumlah: number
}

interface TrendSemester {
  semester: string
  total: number
}

interface MonitoringData {
  kpi: MonitoringKpi
  top_institusi: TopInstitusi[]
  trend_semesteran: TrendSemester[]
}

interface ApiResponse {
  success: boolean
  message: string
  data: MonitoringData
}

function MonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetchApi<ApiResponse>('/admin/monitoring')
      if (res.success) {
        setData(res.data)
      } else {
        setError(res.message || 'Gagal memuat data monitoring.')
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-12 text-center bg-red-50 border border-red-200 rounded-2xl p-8">
        <h2 className="text-lg font-bold text-primary mb-2">Gagal Memuat Monitoring</h2>
        <p className="text-sm text-gray-500 mb-6">{error || 'Data tidak tersedia'}</p>
        <button onClick={loadData} className="bg-primary text-secondary px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-light transition-all shadow-sm">
          Coba Lagi
        </button>
      </div>
    )
  }

  const { kpi, top_institusi, trend_semesteran } = data

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Monitoring Strategis</h1>
        <p className="text-gray-500 mt-1">Ikhtisar performansi program beasiswa secara keseluruhan.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Pendaftar</p>
          <h3 className="text-3xl font-extrabold text-primary">{kpi.total_pendaftar}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Penerima</p>
          <h3 className="text-3xl font-extrabold text-primary">{kpi.total_penerima}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Akumulasi Dana Cair</p>
          <h3 className="text-2xl font-extrabold text-primary tracking-tight">{formatRupiah(kpi.akumulasi_dana_cair)}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tingkat Keberhasilan</p>
          <h3 className="text-3xl font-extrabold text-primary">{kpi.success_rate}%</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-primary mb-4">Top 5 Institusi</h2>
          {top_institusi.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada data institusi.</p>
          ) : (
            <div className="space-y-3">
              {top_institusi.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{item.nama}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{item.jumlah} pendaftar</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-primary mb-4">Tren Semester</h2>
          {trend_semesteran.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada data tren.</p>
          ) : (
            <div className="space-y-3">
              {trend_semesteran.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm font-medium text-gray-800">{item.semester}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${Math.min((item.total / Math.max(...trend_semesteran.map(t => t.total), 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-primary w-8 text-right">{item.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default MonitoringPage
