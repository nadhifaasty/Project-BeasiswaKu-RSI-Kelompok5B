import { Outlet, Link } from 'react-router-dom'

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <span className="text-lg font-bold text-primary">BeasiswaKu</span>
          </Link>

          {/* Center Nav */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
            <li><Link to="/" className="text-gray-700 hover:text-primary transition">Home</Link></li>
            <li><a href="#program" className="text-gray-700 hover:text-primary transition">Program Beasiswa</a></li>
            <li><a href="#berita" className="text-gray-700 hover:text-primary transition">Berita</a></li>
          </ul>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary transition">
              Masuk
            </Link>
            <Link
              to="/daftar"
              className="bg-primary text-secondary px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition"
            >
              Daftar
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-secondary text-lg font-bold mb-3">BeasiswaKu</h3>
            <p className="text-sm leading-relaxed">
              Menciptakan masa depan yang lebih cerah dengan menyediakan akses pendidikan yang merata bagi seluruh talenta hebat Indonesia.
            </p>
          </div>
          <div>
            <h4 className="text-secondary font-semibold mb-3">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-secondary transition">Home</Link></li>
              <li><a href="#program" className="hover:text-secondary transition">Program Beasiswa</a></li>
              <li><a href="#berita" className="hover:text-secondary transition">Berita & Artikel</a></li>
              <li><Link to="/daftar" className="hover:text-secondary transition">Pendaftaran</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-secondary font-semibold mb-3">Dukungan</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-secondary transition">Pusat Bantuan</a></li>
              <li><a href="#" className="hover:text-secondary transition">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-secondary transition">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-secondary transition">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-secondary font-semibold mb-3">Kontak Kami</h4>
            <ul className="space-y-2 text-sm">
              <li>Senin - Jumat: 08.00 - 17.00 WIB</li>
              <li><a href="mailto:info@beasiswaku.id" className="hover:text-secondary transition">info@beasiswaku.id</a></li>
              <li>Surakarta, Indonesia</li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-300 hover:text-secondary transition text-sm">Instagram</a>
              <a href="#" className="text-gray-300 hover:text-secondary transition text-sm">Twitter</a>
              <a href="#" className="text-gray-300 hover:text-secondary transition text-sm">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-600 mt-8 pt-6 text-center text-xs text-gray-400">
          &copy; 2026 BeasiswaKu. Seluruh hak cipta dilindungi.
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
