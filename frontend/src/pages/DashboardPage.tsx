import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchApi } from '../services/api'
import { getPrograms, getUserApplications, type Application, type ScholarshipProgram } from '../services/scholarship'
import { getAllBiodata } from '../services/biodata'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function DashboardPage() {
  useAuth()
  const [progress, setProgress] = useState(0)
  const [applications, setApplications] = useState<Application[]>([])
  const [programs, setPrograms] = useState<ScholarshipProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      const [biodataData, apps, progs] = await Promise.all([
        getAllBiodata(),
        getUserApplications(),
        getPrograms(),
      ])

      let p = 0
      if (biodataData.pribadi) p += 25
      if (biodataData.alamat) p += 25
      if (biodataData.orang_tua) p += 25
      if (biodataData.akademik) p += 25
      setProgress(p)
      setApplications(apps)
      setPrograms(progs)
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }

  const activeApps = applications.filter((a) => !['DITOLAK'].includes(a.status))
  const latestStatus = applications.length > 0 ? applications[0].status : '-'
  const nearestDeadline = programs.length > 0
    ? new Date(programs[0].deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-'

  const today = new Date()
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const dateStr = `${dayNames[today.getDay()]}, ${today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-primary rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Selamat datang! 👋</h1>
          <p className="text-white/70 text-sm mb-4">
            {dateStr} — Pantau perkembangan pengajuan beasiswamu dan lengkapi data yang diperlukan.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-xs">
              <div className="w-full bg-white/20 rounded-full h-2.5">
                <div
                  className="bg-accent h-2.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="text-sm text-white/80">Biodata {progress}% Lengkap</span>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full" />
      </div>

      {/* Alert: Biodata belum lengkap */}
      {progress < 100 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">Lengkapi Biodata Kamu!</p>
              <p className="text-xs text-red-600">Kamu harus melengkapi biodata 100% sebelum dapat mengajukan program beasiswa.</p>
            </div>
          </div>
          <Link
            to="/biodata"
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition whitespace-nowrap"
          >
            Lengkapi Sekarang
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/lacak-status" className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3 hover:shadow-lg transition cursor-pointer group">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium group-hover:text-accent transition">Pengajuan Aktif</p>
            <p className="text-xl font-bold text-primary">{activeApps.length}</p>
          </div>
        </Link>

        <Link to="/lacak-status" className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3 hover:shadow-lg transition cursor-pointer group">
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium group-hover:text-accent transition">Status Terakhir</p>
            <p className="text-xl font-bold text-primary">{latestStatus}</p>
          </div>
        </Link>

        <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Notifikasi Baru</p>
            <p className="text-xl font-bold text-primary">0</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Deadline Terdekat</p>
            <p className="text-lg font-bold text-primary">{nearestDeadline}</p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Programs + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Programs */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              🎓 Program Beasiswa Tersedia
            </h2>
            <Link to="/pengajuan" className="text-sm text-accent hover:underline">Lihat Semua</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {programs.slice(0, 2).map((program) => (
              <div key={program.id} className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                    </svg>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    program.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {program.status === 'aktif' ? 'TERBUKA' : 'DITUTUP'}
                  </span>
                </div>
                <h3 className="font-semibold text-primary mb-1">{program.nama}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{program.deskripsi}</p>
                <p className="text-xs text-gray-400 mb-4">
                  ⏰ Deadline: {new Date(program.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {progress === 100 ? (
                  <Link
                    to="/pengajuan"
                    className="flex items-center justify-between bg-primary text-secondary px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition"
                  >
                    <span>Daftar Sekarang</span>
                    <span>→</span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-between bg-gray-300 text-gray-500 px-4 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed"
                    title="Lengkapi biodata 100% terlebih dahulu"
                  >
                    <span>Daftar Sekarang</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
            🔔 Notifikasi
          </h2>
          <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
            {applications.length > 0 ? (
              applications.slice(0, 3).map((app) => (
                <div key={app.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Pengajuan {app.scholarship_programs?.nama} - {app.status}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(app.updated_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada notifikasi.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
