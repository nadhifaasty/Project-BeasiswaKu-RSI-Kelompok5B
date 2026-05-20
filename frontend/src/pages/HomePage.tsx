function HomePage() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Selamat Datang di BeasiswaKu
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Temukan dan daftar beasiswa impianmu dengan mudah.
      </p>
      <a
        href="/beasiswa"
        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Lihat Beasiswa
      </a>
    </section>
  )
}

export default HomePage
