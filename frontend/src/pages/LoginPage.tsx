import { Link } from 'react-router-dom'
import { useState } from 'react'

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <section className="min-h-[calc(100vh-64px)] flex">
      <div className="hidden md:flex w-1/2 bg-primary flex-col justify-center items-center px-12 text-white">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold mb-4">Selamat Datang Kembali</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Akses beasiswa impianmu dan wujudkan masa depan cerah bersama BeasiswaKu.
          </p>
          <div className="mt-8 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-xl p-8 shadow-sm border w-full max-w-md">
          <h1 className="text-3xl font-bold text-primary mb-2 text-center">Masuk Akun</h1>
          <p className="text-gray-500 text-center mb-8 text-sm">Masuk ke akun BeasiswaKu kamu.</p>
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
              <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="contoh@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Masukkan kata sandi" />
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
              <a href="#" className="text-accent hover:underline">Lupa Sandi?</a>
            </div>
            <button type="submit" className="w-full bg-primary text-secondary py-2.5 rounded-lg font-semibold hover:bg-primary-light transition">
              Masuk Sekarang
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Belum punya akun? <Link to="/daftar" className="text-accent hover:underline">Daftar di sini</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
