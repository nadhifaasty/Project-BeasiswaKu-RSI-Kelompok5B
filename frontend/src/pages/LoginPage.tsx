import { Link } from 'react-router-dom'
import { useState } from 'react'

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <section className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Masuk Akun</h1>
      <p className="text-gray-500 text-center mb-8 text-sm">Masuk ke akun BeasiswaKu kamu.</p>
      <form className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
          <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="contoh@email.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Masukkan kata sandi" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {showPassword ? 'Sembunyi' : 'Lihat'}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300" />
            <span className="text-gray-600">Ingat Saya</span>
          </label>
          <a href="#" className="text-blue-600 hover:underline">Lupa Sandi?</a>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">
          Masuk Sekarang
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Belum punya akun? <Link to="/daftar" className="text-blue-600 hover:underline">Daftar di sini</Link>
      </p>
    </section>
  )
}

export default LoginPage
