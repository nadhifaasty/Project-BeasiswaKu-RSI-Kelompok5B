import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function UnauthorizedPage() {
  const { role } = useAuth()

  const dashboardPath = role === 'admin' || role === 'super_admin'
    ? '/admin/dashboard'
    : '/dashboard'

  return (
    <section className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="bg-white rounded-xl p-8 shadow-sm border text-center max-w-md w-full">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-primary mb-2">Akses Ditolak</h1>
        <p className="text-gray-500 text-sm mb-6">
          Kamu tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika kamu merasa ini adalah kesalahan.
        </p>
        <Link
          to={dashboardPath}
          className="inline-block bg-primary text-secondary px-6 py-2.5 rounded-lg font-medium hover:bg-primary-light transition"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </section>
  )
}

export default UnauthorizedPage
