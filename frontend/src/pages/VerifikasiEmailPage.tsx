import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { fetchApi, ApiError } from '../services/api'

function VerifikasiEmailPage() {
  const location = useLocation()
  const emailFromState = (location.state as { email?: string })?.email || ''

  const [cooldown, setCooldown] = useState(0)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (emailFromState) {
      setCooldown(60)
    }
  }, [emailFromState])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleResend = async () => {
    if (!emailFromState) {
      setErrorMessage('Email tidak ditemukan. Silakan daftar ulang.')
      return
    }
    setResendStatus('sending')
    setErrorMessage(null)
    try {
      await fetchApi('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: emailFromState }),
      })
      setResendStatus('success')
      setCooldown(60)
    } catch (err) {
      setResendStatus('error')
      if (err instanceof ApiError) setErrorMessage(err.message)
      else setErrorMessage('Gagal mengirim ulang email. Coba lagi nanti.')
    }
  }

  const formatCooldown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <section className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      {/* Success Toast */}
      {resendStatus === 'success' && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2 shadow-lg">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-green-700 font-medium">Pendaftaran berhasil! Silakan cek email kamu.</span>
        </div>
      )}

      <div className="bg-white rounded-2xl p-10 shadow-xl max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-primary mb-3">Cek Email Kamu!</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Kami telah mengirimkan link verifikasi ke email kamu.
          <br />
          Klik link tersebut untuk mengaktifkan akun BeasiswaKu.
        </p>

        {/* Error */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={cooldown > 0 || resendStatus === 'sending'}
          className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {resendStatus === 'sending' ? 'Mengirim...' : 'Kirim Ulang Email'}
        </button>

        {/* Cooldown */}
        {cooldown > 0 && (
          <p className="text-sm text-accent mt-3">
            Kirim ulang dalam {formatCooldown(cooldown)}
          </p>
        )}

        {/* Divider + Back */}
        <div className="mt-8 pt-6 border-t">
          <Link to="/login" className="text-accent text-sm font-medium hover:underline">
            Kembali ke Login
          </Link>
        </div>
      </div>
    </section>
  )
}

export default VerifikasiEmailPage
