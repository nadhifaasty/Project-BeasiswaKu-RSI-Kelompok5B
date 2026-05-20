import { Link } from 'react-router-dom'

const programs = [
  { title: 'Beasiswa SMA', desc: 'Untuk siswa SMA/SMK sederajat berprestasi dari keluarga kurang mampu.', kuota: 50 },
  { title: 'Beasiswa Perguruan Tinggi', desc: 'Untuk mahasiswa D3/D4/S1 dengan IPK minimal 3.00.', kuota: 100 },
]

const berita = [
  { title: 'Pendaftaran Beasiswa 2026 Dibuka', date: '15 Mei 2026', excerpt: 'Pendaftaran beasiswa periode 2026/2027 telah resmi dibuka.' },
  { title: 'Pengumuman Hasil Seleksi Tahap 1', date: '10 Mei 2026', excerpt: 'Hasil seleksi tahap 1 dapat dilihat melalui dashboard masing-masing.' },
  { title: 'Perpanjangan Masa Pendaftaran', date: '5 Mei 2026', excerpt: 'Masa pendaftaran diperpanjang hingga 30 Juni 2026.' },
]

function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">BeasiswaKu</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Platform informasi dan manajemen beasiswa terintegrasi berbasis kelayakan untuk siswa dan mahasiswa Indonesia.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/daftar" className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
              Daftar Sekarang
            </Link>
            <a href="#program" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              Lihat Program
            </a>
          </div>
        </div>
      </section>

      <section id="program" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Program Beasiswa</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">Pilih program beasiswa yang sesuai dengan jenjang pendidikanmu.</p>
          <div className="grid md:grid-cols-2 gap-8">
            {programs.map((p, i) => (
              <div key={i} className="border rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-gray-600 mb-4">{p.desc}</p>
                <p className="text-sm text-gray-400 mb-4">Kuota: {p.kuota} penerima</p>
                <button className="text-blue-600 font-medium hover:underline">Lihat Detail &rarr;</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="berita" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Berita & Pengumuman</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">Informasi terbaru seputar beasiswa.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {berita.map((b, i) => (
              <div key={i} className="bg-white border rounded-xl p-6 shadow-sm">
                <p className="text-xs text-gray-400 mb-2">{b.date}</p>
                <h3 className="font-semibold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-600">{b.excerpt}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="text-blue-600 font-medium hover:underline">Lihat Semua Berita &rarr;</button>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
