import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { fetchApi } from '../services/api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [tokens, setTokens] = useState<{
    accessToken: string | null;
    code: string | null;
    tokenHash: string | null;
  }>({ accessToken: null, code: null, tokenHash: null })

  const [hasValidToken, setHasValidToken] = useState<boolean | null>(null)

  useEffect(() => {
    // 1. Extract from hash (Implicit Flow)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'))
    const accessToken = hashParams.get('access_token')

    // 2. Extract from search/query params (PKCE Flow or OTP)
    const queryParams = new URLSearchParams(window.location.search)
    const code = queryParams.get('code')
    const tokenHash = queryParams.get('token_hash')

    if (accessToken || code || tokenHash) {
      setTokens({ accessToken, code, tokenHash })
      setHasValidToken(true)
    } else {
      setHasValidToken(false)
      setMessage({
        type: 'error',
        text: 'Tautan pemulihan kata sandi tidak valid atau telah kedaluwarsa. Silakan minta tautan baru.',
      })
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!hasValidToken) {
      setMessage({ type: 'error', text: 'Tautan pemulihan tidak valid.' })
      return
    }

    if (!password || !confirmPassword) {
      setMessage({ type: 'error', text: 'Semua input wajib diisi.' })
      return
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Kata sandi baru minimal harus terdiri dari 8 karakter.' })
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok.' })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetchApi<ApiResponse<null>>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: tokens.accessToken || undefined,
          code: tokens.code || undefined,
          token_hash: tokens.tokenHash || undefined,
          password,
        }),
      })

      setMessage({
        type: 'success',
        text: res.message || 'Kata sandi berhasil diperbarui! Mengarahkan Anda ke halaman masuk...',
      })
      setPassword('')
      setConfirmPassword('')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 3000)
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Gagal memperbarui kata sandi. Silakan coba lagi atau minta tautan baru.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="min-h-[calc(100vh-64px)] flex">
      {/* Left Panel - Branding */}
      <div className="hidden md:flex w-1/2 bg-primary flex-col justify-center items-center px-12 text-white">
        <div className="max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
            </div>
            <span className="text-xl font-bold">BeasiswaKu</span>
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Perbarui Kata Sandi Anda
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Buat kata sandi baru yang kuat dan aman untuk melindungi akun BeasiswaKu Anda.
          </p>
        </div>
      </div>

      {/* Right Panel - Reset Password Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-primary mb-2">Kata Sandi Baru</h1>
          <p className="text-gray-500 mb-8 text-sm">Silakan masukkan kata sandi baru untuk akun Anda.</p>

          {/* Feedback Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-2 border ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
              <p className="font-medium leading-relaxed">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Kata Sandi Baru
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent transition"
                placeholder="Minimal 8 karakter"
                disabled={isSubmitting || hasValidToken === false}
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent transition"
                placeholder="Ulangi kata sandi baru"
                disabled={isSubmitting || hasValidToken === false}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || hasValidToken === false}
              className="w-full bg-primary text-secondary py-2.5 rounded-lg font-semibold hover:bg-primary-light transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isSubmitting ? 'Memproses...' : 'Simpan Kata Sandi'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Kembali ke <Link to="/login" className="text-accent font-medium hover:underline">Halaman Masuk</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default ResetPasswordPage
