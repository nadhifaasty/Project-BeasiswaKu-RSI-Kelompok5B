import { useState } from 'react'

// ============ STAT CARD DEFINITIONS (struktur saja, data belum tersedia) ============

const stats = [
  {
    label: 'Total Pendaftar',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    label: 'Total Diterima',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
  },
  {
    label: 'Dana Tersalurkan',
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  },
  {
    label: 'Tingkat Keberhasilan',
    bg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
]

const lineLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul']

const statusDist = [
  { label: 'Diterima', color: '#84cc16' },
  { label: 'Ditolak', color: '#ef4444' },
  { label: 'Cadangan', color: '#a855f7' },
  { label: 'Proses', color: '#38bdf8' },
]

const topInstitusiSlots = 5
const wilayahLabels = ['Jawa Barat', 'DKI Jakarta', 'Jawa Tengah', 'Jawa Timur', 'Sumatera Utara', 'Lainnya']

// ============ EMPTY CHART PLACEHOLDERS ============

function EmptyLineChart({ labels }: { labels: string[] }) {
  const width = 520
  const height = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const max = 1000
  const yTicks = [0, 250, 500, 750, 1000]

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {yTicks.map((tick) => {
          const y = padding.top + chartH - (tick / max) * chartH
          return (
            <g key={tick}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f1f5f9" strokeWidth={1} />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-gray-300" fontSize={10}>
                {tick}
              </text>
            </g>
          )
        })}
        {labels.map((label, i) => {
          const x = padding.left + (i / (labels.length - 1)) * chartW
          return (
            <text key={label} x={x} y={height - 8} textAnchor="middle" className="fill-gray-300" fontSize={10}>
              {label}
            </text>
          )
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm text-gray-400">Belum ada data</span>
      </div>
    </div>
  )
}

function EmptyDonut() {
  const radius = 70
  const stroke = 22

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
        <circle cx={90} cy={90} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-300">—</span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Total Pendaftar</span>
      </div>
    </div>
  )
}

// ============ PAGE ============

function SuperAdminDashboardPage() {
  const [trendRange, setTrendRange] = useState<'Tahunan' | 'Semester'>('Tahunan')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Monitoring Evaluasi</h1>
        <p className="text-sm text-gray-500">Monitoring performa program beasiswa secara real-time di seluruh wilayah.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-md">
            <div className={`w-12 h-12 ${s.bg} rounded-full flex items-center justify-center mb-3 ${s.iconColor}`}>
              {s.icon}
            </div>
            <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold text-gray-300 mt-1">—</p>
          </div>
        ))}
      </div>

      {/* Chart + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              📈 Tren Pendaftaran Beasiswa
            </h2>
            <div className="flex bg-secondary rounded-full p-0.5 text-xs">
              {(['Tahunan', 'Semester'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTrendRange(r)}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    trendRange === r ? 'bg-red-300 text-white' : 'text-gray-500'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <EmptyLineChart labels={lineLabels} />
          <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Beasiswa SMA
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Perguruan Tinggi
            </span>
          </div>
        </div>

        {/* Donut */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Distribusi Status</h2>
          <EmptyDonut />
          <div className="grid grid-cols-2 gap-3 mt-6">
            {statusDist.map((d) => (
              <div key={d.label} className="bg-secondary/50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide">{d.label}</span>
                </div>
                <p className="text-lg font-bold text-gray-300">—</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Institusi + Distribusi Wilayah */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Institusi */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-primary mb-5 flex items-center gap-2">
            📍 Top 5 Institusi Pendaftar Terbanyak
          </h2>
          <div className="space-y-4">
            {Array.from({ length: topInstitusiSlots }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-400">—</span>
                  <span className="text-sm font-semibold text-gray-300">0 Siswa</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div className="bg-gray-200 h-2.5 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribusi Wilayah (dark card) */}
        <div className="bg-primary rounded-2xl shadow-md p-6 text-white">
          <h2 className="text-lg font-semibold mb-5">Distribusi Wilayah</h2>
          <div className="grid grid-cols-2 gap-3">
            {wilayahLabels.map((name) => (
              <div key={name} className="bg-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-white/80">{name}</span>
                <span className="text-sm font-bold text-white/30">—</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboardPage
