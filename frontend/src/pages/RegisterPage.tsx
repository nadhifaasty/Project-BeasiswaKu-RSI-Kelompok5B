import { Link } from 'react-router-dom'
import { useState } from 'react'

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <section className="min-h-[calc(100vh-64px)] flex">
      <div className="hidden md:flex w-1/2 bg-primary flex-col justify-center items-center px-12 text-white">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold mb-4">Wujudkan Impianmu</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Daftar sekarang dan raih kesempatan mendapatkan beasiswa pendidikan untuk masa depan yang lebih cerah.
          </p>
          <div className="mt-8 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border w-full max-w-lg">
          <h1 className="text-2xl font-bold text-primary mb-1 text-center">Pendaftaran Akun</h1>
          <p className="text-gray-500 text-center mb-4 text-sm">Buat akun BeasiswaKu untuk mulai mendaftar beasiswa.</p>
          <form className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Nama lengkap" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIM / NISN</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="NIM atau NISN" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="08xxxxxxxxxx" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="contoh@email.com" />
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Min 8 karakter" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {showPassword ? 'Sembunyi' : 'Lihat'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Kata Sandi</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Ulangi kata sandi" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {showConfirm ? 'Sembunyi' : 'Lihat'}
                </button>
              </div>
            </div>
          </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5 rounded border-gray-300" />
              <span className="text-gray-600">Saya menyetujui <a href="#" className="text-accent hover:underline">syarat dan ketentuan</a> yang berlaku.</span>
            </label>
            <button type="submit" className="w-full bg-primary text-secondary py-2 rounded-lg font-semibold hover:bg-primary-light transition">
              Daftar Sekarang
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-3">
            Sudah punya akun? <Link to="/login" className="text-accent hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default RegisterPage
