import { Link } from 'react-router-dom'

const programs = [
  {
    title: 'Beasiswa SMA',
    desc: 'Diperuntukkan bagi siswa aktif SMA/SMK/MA sederajat. Berbasis kelayakan akademik dan kondisi ekonomi keluarga.',
    monthly_amount: 750000,
    deadline: '25 Jan 2026',
    kuota: 50,
  },
  {
    title: 'Beasiswa Perguruan Tinggi',
    desc: 'Diperuntukkan bagi mahasiswa aktif S1/D3/D4 di PTN maupun PTS. Berbasis IPK dan kondisi ekonomi.',
    monthly_amount: 1000000,
    deadline: '25 Jan 2026',
    kuota: 100,
  },
]

const berita = [
  {
    date: '10 Jan 2026',
    tag: 'Pendaftaran',
    title: 'Pembukaan Pendaftaran Beasiswa 2026',
    excerpt: 'Pemerintah resmi membuka pendaftaran program beasiswa terintegrasi untuk periode tahun 2026.',
  },
  {
    date: '28 Des 2025',
    tag: 'Pengumuman',
    title: 'Pengumuman Hasil Seleksi Periode 2025',
    excerpt: 'Berikut adalah daftar nama penerima beasiswa yang lolos seleksi tahap akhir periode Desember 2025.',
  },
  {
    date: '5 Jan 2026',
    tag: 'Berita',
    title: 'Kuota Beasiswa SMA Diperluas',
    excerpt: 'Kabar gembira! Kuota penerima beasiswa kategori SMA resmi ditambah menjadi 150 penerima.',
  },
]

function HomePage() {
  return (
    <>
      <section className="bg-primary text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-3 leading-tight">
            Wujudkan Impianmu <br /> Bersama Beasiswa Kami
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Program beasiswa terintegrasi berbasis kelayakan akademik dan ekonomi. Membantu talenta muda Indonesia mendapatkan pendidikan yang layak.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/daftar" className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent-light transition">
              Daftar Sekarang
            </Link>
            <a href="#program" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              Lihat Program
            </a>
          </div>
        </div>
      </section>

      <section id="program" className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase">Program Unggulan</p>
            <h2 className="text-3xl font-bold text-primary mt-2">Pilih Program Beasiswa</h2>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">Kami menawarkan berbagai program beasiswa yang disesuaikan dengan jenjang pendidikan dan kebutuhanmu.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {programs.map((p, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition border border-gray-100">
                <div className="p-6">
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">TERBUKA</span>
                  <h3 className="text-xl font-bold text-primary mt-3 mb-2">{p.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{p.desc}</p>
                  <p className="text-accent font-bold text-lg mb-3">Rp{p.monthly_amount.toLocaleString('id-ID')} / bulan</p>
                  <div className="flex justify-between text-sm text-gray-500 border-t pt-3">
                    <span>Deadline: {p.deadline}</span>
                    <span>Sisa Kuota: {p.kuota}</span>
                  </div>
                </div>
                <div className="px-6 pb-5">
                  <Link to="/daftar" className="block w-full text-center bg-primary text-secondary px-4 py-2.5 rounded-lg font-medium hover:bg-primary-light transition">
                    Lihat Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="berita" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase">Kabar Terbaru</p>
            <h2 className="text-3xl font-bold text-primary mt-2">Berita & Pengumuman</h2>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">Dapatkan informasi terkini seputar dunia pendidikan dan update program beasiswa.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {berita.map((b, i) => (
              <div key={i} className="bg-secondary rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-xs text-accent font-medium mb-1">{b.date} &bull; {b.tag}</p>
                <h3 className="font-bold text-primary mb-2">{b.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{b.excerpt}</p>
                <a href="#" className="text-accent font-medium text-sm hover:underline">Baca selengkapnya &rarr;</a>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="#" className="inline-block border-2 border-primary text-primary px-6 py-2.5 rounded-lg font-medium hover:bg-primary hover:text-secondary transition">
              Lihat Semua Berita &rarr;
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
