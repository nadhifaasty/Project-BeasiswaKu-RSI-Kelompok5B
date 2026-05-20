import { Link } from 'react-router-dom'
import { useState } from 'react'

function VerifikasiEmailPage() {
  const [cooldown, setCooldown] = useState(0)

  const handleResend = () => {
    setCooldown(60)
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <section className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="bg-white border rounded-xl p-8 shadow-sm">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi Email</h1>
        <p className="text-gray-500 text-sm mb-6">
          Kami telah mengirimkan email verifikasi ke <strong>contoh@email.com</strong>.
          Silakan klik tautan di email untuk mengaktifkan akun Anda.
        </p>
        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Kirim Ulang (${cooldown}s)` : 'Kirim Ulang Email'}
        </button>
        <p className="text-xs text-gray-400 mt-4">Tautan verifikasi berlaku selama 24 jam.</p>
        <div className="mt-6 pt-4 border-t">
          <Link to="/login" className="text-blue-600 text-sm hover:underline">Kembali ke Login</Link>
        </div>
      </div>
    </section>
  )
}

export default VerifikasiEmailPage
