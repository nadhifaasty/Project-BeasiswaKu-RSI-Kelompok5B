import { Outlet, Link } from 'react-router-dom'

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">BeasiswaKu</Link>
          <ul className="flex items-center gap-6 text-sm font-medium">
            <li><Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link></li>
            <li><a href="#program" className="text-gray-700 hover:text-blue-600">Program Beasiswa</a></li>
            <li><a href="#berita" className="text-gray-700 hover:text-blue-600">Berita</a></li>
            <li><Link to="/login" className="text-gray-700 hover:text-blue-600">Masuk</Link></li>
            <li><Link to="/daftar" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">Daftar</Link></li>
          </ul>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">BeasiswaKu</h3>
            <p className="text-sm">Platform manajemen beasiswa terintegrasi untuk siswa dan mahasiswa Indonesia.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><a href="#program" className="hover:text-white">Program Beasiswa</a></li>
              <li><a href="#berita" className="hover:text-white">Berita</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Kontak</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: support@beasiswaku.ac.id</li>
              <li>Telp: (0271) 123456</li>
              <li>Universitas Sebelas Maret</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs">
          &copy; 2026 BeasiswaKu. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
