import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth, ApiError } from '../context/AuthContext'

function LoginPage() {
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Client-side validation
    if (!email || !password) {
      setError('Email dan password wajib diisi.')
      return
    }

    setIsSubmitting(true)

    try {
      await login(email, password)
      // Redirect handled by AuthContext
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.')
      }
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <span className="text-xl font-bold">BeasiswaKu</span>
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Selamat Datang Kembali di BeasiswaKu!
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Masuk untuk memantau status pengajuan beasiswamu atau kelola program sebagai administrator.
          </p>
          <div className="mt-8 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-primary mb-2">Masuk Akun</h1>
          <p className="text-gray-500 mb-8 text-sm">Silakan masukkan detail akun kamu.</p>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent transition"
                placeholder="nama@email.com"
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Kata Sandi
                </label>
                <a href="#" className="text-xs text-accent hover:underline">Lupa sandi?</a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-accent transition"
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Demo Accounts Info */}
            <div className="p-3 rounded-lg bg-secondary/60 border border-accent/20">
              <p className="text-xs font-semibold text-primary mb-1">AKUN DEMO (SIMULASI):</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                <li>siswa@simba.com <span className="text-accent">(Akses Siswa)</span></li>
                <li>admin@simba.com <span className="text-accent">(Akses Admin)</span></li>
                <li>superadmin@simba.com <span className="text-accent">(Akses Super Admin)</span></li>
              </ul>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-gray-600">Ingat saya</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-secondary py-2.5 rounded-lg font-semibold hover:bg-primary-light transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isSubmitting ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Belum punya akun? <Link to="/daftar" className="text-accent font-medium hover:underline">Daftar di sini</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
