import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { fetchApi, ApiError } from '../services/api'

interface RegisterForm {
  nama_lengkap: string
  nim_nisn: string
  nomor_hp: string
  email: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
}

function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<RegisterForm>({
    nama_lengkap: '',
    nim_nisn: '',
    nomor_hp: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })

  const updateField = (field: keyof RegisterForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Client-side validation
    if (!form.nama_lengkap || !form.nim_nisn || !form.nomor_hp || !form.email || !form.password) {
      setError('Semua field wajib diisi.')
      return
    }

    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi password tidak cocok.')
      return
    }

    if (!form.agreeTerms) {
      setError('Kamu harus menyetujui syarat dan ketentuan.')
      return
    }

    setIsSubmitting(true)

    try {
      await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nama_lengkap: form.nama_lengkap,
          nim_nisn: form.nim_nisn,
          nomor_hp: form.nomor_hp,
          email: form.email,
          password: form.password,
        }),
      })

      // Redirect ke halaman verifikasi email dengan membawa email
      navigate('/verifikasi-email', {
        state: { email: form.email },
        replace: true,
      })
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
            Gabung Bersama Ribuan Talenta Hebat Lainnya
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Dapatkan kesempatan pendidikan terbaik dengan mendaftarkan dirimu sekarang juga. Proses cepat dan transparan.
          </p>
          <div className="mt-8 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border w-full max-w-lg">
          <h1 className="text-2xl font-bold text-primary mb-1 text-center">Buat Akun</h1>
          <p className="text-gray-500 text-center mb-4 text-sm">Lengkapi data di bawah untuk memulai pendaftaran.</p>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Nama Lengkap & NIM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={form.nama_lengkap}
                  onChange={(e) => updateField('nama_lengkap', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent transition"
                  placeholder="Nama sesuai KTP"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIM / NISN *</label>
                <input
                  type="text"
                  value={form.nim_nisn}
                  onChange={(e) => updateField('nim_nisn', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent transition"
                  placeholder="Nomor Induk"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent transition"
                placeholder="nama@email.com"
                disabled={isSubmitting}
              />
            </div>

            {/* Nomor HP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP *</label>
              <input
                type="text"
                value={form.nomor_hp}
                onChange={(e) => updateField('nomor_hp', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent transition"
                placeholder="0812xxxxxxxx"
                disabled={isSubmitting}
              />
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-accent transition"
                    placeholder="Min 8 karakter"
                    disabled={isSubmitting}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" tabIndex={-1}>
                    {showPassword ? 'Sembunyi' : 'Lihat'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Sandi *</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-accent transition"
                    placeholder="Ulangi kata sandi"
                    disabled={isSubmitting}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" tabIndex={-1}>
                    {showConfirm ? 'Sembunyi' : 'Lihat'}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.agreeTerms}
                onChange={(e) => updateField('agreeTerms', e.target.checked)}
                className="mt-0.5 rounded border-gray-300"
                disabled={isSubmitting}
              />
              <span className="text-gray-600">
                Saya menyetujui <a href="#" className="text-accent hover:underline">syarat & ketentuan</a> serta kebijakan privasi BeasiswaKu.
              </span>
            </label>

            {/* Submit */}
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
              {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-3">
            Sudah punya akun? <Link to="/login" className="text-accent font-medium hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default RegisterPage
