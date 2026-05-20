import { Link } from 'react-router-dom'
import { useState } from 'react'

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <section className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-primary mb-2 text-center">Pendaftaran Akun</h1>
      <p className="text-gray-500 text-center mb-8 text-sm">Buat akun BeasiswaKu untuk mulai mendaftar beasiswa.</p>
      <form className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
          <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Nama lengkap" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIM / NISN</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="NIM atau NISN" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="08xxxxxxxxxx" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="contoh@email.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Minimal 8 karakter" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {showPassword ? 'Sembunyi' : 'Lihat'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Kata Sandi</label>
          <div className="relative">
            <input type={showConfirm ? 'text' : 'password'} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Ulangi kata sandi" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {showConfirm ? 'Sembunyi' : 'Lihat'}
            </button>
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1 rounded border-gray-300" />
          <span className="text-gray-600">Saya menyetujui <a href="#" className="text-accent hover:underline">syarat dan ketentuan</a> yang berlaku.</span>
        </label>
        <button type="submit" className="w-full bg-primary text-secondary py-2.5 rounded-lg font-semibold hover:bg-primary-light transition">
          Daftar Sekarang
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Sudah punya akun? <Link to="/login" className="text-accent hover:underline">Masuk di sini</Link>
      </p>
    </section>
  )
}

export default RegisterPage
