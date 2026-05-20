import { Outlet, Link } from 'react-router-dom'

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <header className="bg-primary shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-secondary">BeasiswaKu</Link>
          <ul className="flex items-center gap-6 text-sm font-medium">
            <li><Link to="/" className="text-secondary/80 hover:text-secondary">Home</Link></li>
            <li><a href="#program" className="text-secondary/80 hover:text-secondary">Program Beasiswa</a></li>
            <li><a href="#berita" className="text-secondary/80 hover:text-secondary">Berita</a></li>
            <li><Link to="/daftar" className="bg-accent text-white px-5 py-2 rounded-lg hover:bg-accent-light transition">Pendaftaran</Link></li>
          </ul>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
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
