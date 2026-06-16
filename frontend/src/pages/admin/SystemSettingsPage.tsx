import { useState } from 'react'
import { Card, Button } from '../../components'
import { useAuth } from '../../context/AuthContext'
import { fetchApi } from '../../services/api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function SystemSettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleResetPassword() {
    if (!user?.email) return

    setLoading(true)
    setMessage(null)

    try {
      await fetchApi<ApiResponse<null>>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: user.email }),
      })

      setMessage({
        type: 'success',
        text: 'Email pemulihan kata sandi telah dikirim! Silakan periksa kotak masuk email Anda.',
      })
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Gagal mengirim email pemulihan kata sandi.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <span className="inline-block bg-secondary text-primary text-xs font-medium px-3 py-1 rounded-full mb-2">
          Pengaturan Akun
        </span>
        <h1 className="text-3xl font-bold text-primary">Pengaturan</h1>
        <p className="text-gray-500 text-sm mt-1">
          Kelola informasi profil dan keamanan akun BeasiswaKu Anda.
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? '✓ ' : '⚠ '}
          {message.text}
        </div>
      )}

      {/* Profile Info */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {user?.nama_lengkap?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">{user?.nama_lengkap || 'Super Admin'}</h2>
            <p className="text-sm text-gray-500 capitalize">Role: {user?.role || 'Super Admin'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="block text-gray-400 font-medium mb-1">NIM / NISN / ID</span>
            <span className="font-semibold text-primary">{user?.nim_nisn || '-'}</span>
          </div>
          <div>
            <span className="block text-gray-400 font-medium mb-1">Alamat Email</span>
            <span className="font-semibold text-primary">{user?.email || '-'}</span>
          </div>
        </div>
      </Card>

      {/* Security & Password */}
      <Card className="p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-primary">Keamanan Akun</h3>
          <p className="text-sm text-gray-500 mt-1">
            Untuk memperbarui kata sandi, kami akan mengirimkan tautan pemulihan kata sandi yang aman ke alamat email terdaftar Anda.
          </p>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleResetPassword}
            loading={loading}
            className="bg-primary text-secondary text-xs px-5 py-2.5 font-bold hover:bg-primary-light"
          >
            Minta Reset Kata Sandi
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default SystemSettingsPage

