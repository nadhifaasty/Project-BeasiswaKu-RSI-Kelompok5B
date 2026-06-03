import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchApi } from '../services/api'

interface AdminApplication {
  id: string
  nomor_referensi: string
  status: string
  created_at: string
  profiles: { nama_lengkap: string; nim_nisn: string }
  scholarship_programs: { nama: string }
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function AdminDashboardPage() {
  const [applications, setApplications] = useState<AdminApplication[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, accepted: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetchApi<ApiResponse<AdminApplication[]>>('/applications')
      const apps = res.data
      setApplications(apps)

      setStats({
        total: apps.length,
        pending: apps.filter((a) => a.status === 'PENDING').length,
        verified: apps.filter((a) => a.status === 'TERVERIFIKASI').length,
        accepted: apps.filter((a) => a.status === 'DITERIMA').length,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data'
      console.error('AdminDashboard loadData error:', err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'PENDING': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>
      case 'TERVERIFIKASI': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Verified</span>
      case 'DITERIMA': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Diterima</span>
      case 'DITOLAK': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Ditolak</span>
      case 'REVISI': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Revision</span>
      default: return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Selamat datang kembali!</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-primary text-secondary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Selamat datang kembali! Berikut adalah ringkasan pengelolaan beasiswa hari ini.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 border border-gray-300 bg-white px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            Filter Data
          </button>
          <button className="flex items-center gap-1.5 bg-primary text-secondary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Cari Data
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-md text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 uppercase font-medium">Pengajuan Masuk</p>
          <p className="text-2xl font-bold text-primary">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md text-center">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 uppercase font-medium">Menunggu Verifikasi</p>
          <p className="text-2xl font-bold text-primary">{stats.pending}</p>
          {stats.pending > 0 && <p className="text-xs text-orange-600 mt-1">Urgent</p>}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md text-center">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 uppercase font-medium">Terverifikasi</p>
          <p className="text-2xl font-bold text-primary">{stats.verified}</p>
          <p className="text-xs text-green-600 mt-1">Lengkap</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md text-center">
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 uppercase font-medium">Diterima</p>
          <p className="text-2xl font-bold text-primary">{stats.accepted}</p>
          <p className="text-xs text-purple-600 mt-1">Penerima</p>
        </div>
      </div>

      {/* Chart + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            📊 Tren Pengajuan Beasiswa
          </h2>
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            <p>Chart akan ditampilkan di sini (integrasi chart library diperlukan)</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Status Pengajuan</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">Terverifikasi</span>
              </div>
              <span className="text-sm font-semibold">{stats.verified}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="text-sm font-semibold">{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600">Ditolak</span>
              </div>
              <span className="text-sm font-semibold">
                {applications.filter((a) => a.status === 'DITOLAK').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm text-gray-600">Revisi</span>
              </div>
              <span className="text-sm font-semibold">
                {applications.filter((a) => a.status === 'REVISI').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            📋 Pengajuan Terbaru
          </h2>
          <Link
            to="/admin/pengajuan"
            className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-1"
          >
            Lihat Semua Pengajuan →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-500 uppercase text-xs">Siswa</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 uppercase text-xs">Program Beasiswa</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 uppercase text-xs">Tanggal Daftar</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 uppercase text-xs">Status</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 uppercase text-xs">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {applications.slice(0, 5).map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {app.profiles?.nama_lengkap?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <span className="font-medium text-gray-800">{app.profiles?.nama_lengkap || '-'}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {app.scholarship_programs?.nama || '-'}
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {new Date(app.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-3">{getStatusBadge(app.status)}</td>
                <td className="px-5 py-3">
                  <Link to="/admin/pengajuan" className="text-accent hover:underline text-sm">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  Belum ada pengajuan masuk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDashboardPage
