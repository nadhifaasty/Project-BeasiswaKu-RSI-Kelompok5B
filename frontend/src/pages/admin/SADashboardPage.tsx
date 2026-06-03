import { useState, useEffect } from 'react'
import { Card } from '../../components'
import { fetchApi } from '../../services/api'

interface DashboardData {
  kpis: {
    total_applications: number
    total_accepted: number
    total_verified: number
    total_programs: number
    total_funds_disbursed: number
    acceptance_rate: number
  }
  trends: Array<{
    month: string
    count: number
  }>
}

interface ApiResponse {
  success: boolean
  message: string
  data: DashboardData
}

function SADashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activePoint, setActivePoint] = useState<{ month: string; count: number; x: number; y: number } | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetchApi<ApiResponse>('/admin/dashboard')
      if (res.success) {
        setData(res.data)
      } else {
        setError(res.message || 'Gagal memuat data dashboard.')
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat data dashboard.')
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
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-2/5" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-80 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-12 text-center bg-red-50 border border-red-200 rounded-2xl p-8">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <span className="text-xl">⚠</span>
        </div>
        <h2 className="text-lg font-bold text-primary mb-2">Gagal Memuat Dashboard</h2>
        <p className="text-sm text-gray-500 mb-6">{error || 'Data tidak tersedia'}</p>
        <button
          onClick={loadDashboardData}
          className="bg-primary text-secondary px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-light transition-all shadow-sm"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  const { kpis, trends } = data

  // SVG Chart Calculations
  const chartHeight = 220
  const chartWidth = 700
  const paddingLeft = 40
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 30
  
  const graphWidth = chartWidth - paddingLeft - paddingRight
  const graphHeight = chartHeight - paddingTop - paddingBottom

  const maxCount = Math.max(...trends.map((t) => t.count), 5) // Min y scale = 5

  const points = trends.map((t, idx) => {
    const x = paddingLeft + (idx / (trends.length - 1)) * graphWidth
    const ratio = maxCount > 0 ? t.count / maxCount : 0
    const y = chartHeight - paddingBottom - (ratio * graphHeight)
    return { ...t, x, y }
  })

  // Build SVG Path
  let linePath = ''
  let fillPath = ''
  
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} `
    fillPath = `M ${points[0].x} ${chartHeight - paddingBottom} L ${points[0].x} ${points[0].y} `
    
    for (let i = 1; i < points.length; i++) {
      linePath += `L ${points[i].x} ${points[i].y} `
      fillPath += `L ${points[i].x} ${points[i].y} `
    }
    
    fillPath += `L ${points[points.length - 1].x} ${chartHeight - paddingBottom} Z`
  }

  // Y-axis grid counts
  const yTicks = [0, Math.floor(maxCount * 0.25), Math.floor(maxCount * 0.5), Math.floor(maxCount * 0.75), maxCount]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-2 border border-primary/20 tracking-wide uppercase">
          Super Admin Console
        </span>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Super Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Ikhtisar metrik performansi program beasiswa, penyaluran dana, dan tren pendaftaran sistem.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI: Total Applications */}
        <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-150 hover:shadow-lg transition-all duration-300 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Total Pendaftar
              </p>
              <h3 className="text-3xl font-extrabold text-primary">{kpis.total_applications}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
            <span>{kpis.total_verified} Terverifikasi</span>
          </div>
        </Card>

        {/* KPI: Total Accepted */}
        <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-150 hover:shadow-lg transition-all duration-300 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Penerima Beasiswa
              </p>
              <h3 className="text-3xl font-extrabold text-primary">{kpis.total_accepted}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-purple-600 bg-purple-50 w-fit px-2 py-0.5 rounded-md">
            <span>Rasio Kelulusan: {kpis.acceptance_rate}%</span>
          </div>
        </Card>

        {/* KPI: Active Programs */}
        <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-150 hover:shadow-lg transition-all duration-300 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Program Aktif
              </p>
              <h3 className="text-3xl font-extrabold text-primary">{kpis.total_programs}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
            <span>Status: OPEN</span>
          </div>
        </Card>

        {/* KPI: Total Funds Disbursed */}
        <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-150 hover:shadow-lg transition-all duration-300 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Dana Disalurkan
              </p>
              <h3 className="text-2xl font-extrabold text-primary tracking-tight">
                {formatRupiah(kpis.total_funds_disbursed)}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded-md">
            <span>Pencairan Disetujui</span>
          </div>
        </Card>
      </div>

      {/* SVG Applications Trend Chart */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-primary">Tren Registrasi Pengajuan</h2>
            <p className="text-xs text-gray-400 mt-0.5">Statistik volume pendaftar beasiswa per bulan berjalan (Sentuh titik untuk detail)</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-150">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Tahun 2026</span>
          </div>
        </div>

        {/* SVG Wrapper */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[650px] relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto select-none"
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {yTicks.map((tick, idx) => {
                const ratio = maxCount > 0 ? tick / maxCount : 0
                const y = chartHeight - paddingBottom - (ratio * graphHeight)
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1.5"
                    />
                    <text
                      x={paddingLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize="10"
                      className="font-semibold font-mono"
                    >
                      {tick}
                    </text>
                  </g>
                )
              })}

              {/* Filled Area */}
              {fillPath && (
                <path
                  d={fillPath}
                  fill="url(#chartGrad)"
                  className="transition-all duration-500"
                />
              )}

              {/* Graph Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#1e3a8a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500"
                />
              )}

              {/* X Axis Labels */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <text
                    x={p.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                    className="font-bold"
                  >
                    {p.month}
                  </text>
                </g>
              ))}

              {/* Interactive Data Points */}
              {points.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={activePoint?.month === p.month ? '6.5' : '4.5'}
                  fill={activePoint?.month === p.month ? '#1e3a8a' : '#ffffff'}
                  stroke="#1e3a8a"
                  strokeWidth="3"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setActivePoint({ month: p.month, count: p.count, x: p.x, y: p.y })}
                  onMouseLeave={() => setActivePoint(null)}
                />
              ))}
            </svg>

            {/* Custom Tooltip Container */}
            {activePoint && (
              <div
                className="absolute bg-white border border-gray-150 rounded-xl p-3 shadow-lg pointer-events-none z-10 animate-fade-in text-xs font-semibold"
                style={{
                  left: `${(activePoint.x / chartWidth) * 100}%`,
                  top: `${(activePoint.y / chartHeight) * 100 - 30}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="text-primary font-bold mb-0.5">{activePoint.month}</div>
                <div className="text-gray-500">Pendaftar: <span className="text-indigo-600 font-bold">{activePoint.count} siswa</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SADashboardPage
