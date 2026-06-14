import { useState, useEffect } from 'react'
import { Card, Button, Input } from '../components'
import { fetchApi } from '../services/api'
import { getUserApplications, type Application } from '../services/scholarship'
import { getMonthlyReports, submitMonthlyReport } from '../services/report'
import { useAuth } from '../context/AuthContext'

interface FundReportItem {
  id: string
  user_id: string
  application_id: string
  bulan: string
  kategori: string
  jumlah: number
  keterangan: string
  bukti_url: string | null
  status: 'draft' | 'dikirim' | 'terverifikasi' | 'ditolak'
  created_at: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function SiswaLaporanDanaPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [reports, setReports] = useState<FundReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form states
  const [bulan, setBulan] = useState('')
  const [kategori, setKategori] = useState('')
  const [jumlah, setJumlah] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  // Find accepted application
  const acceptedApp = applications.find((a) => a.status === 'DITERIMA')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setErrorMessage(null)
    try {
      const apps = await getUserApplications()
      setApplications(apps)
      
      const activeAccepted = apps.find((a) => a.status === 'DITERIMA')
      if (activeAccepted && user) {
        // Fetch existing reports
        const reportsData = await getMonthlyReports(user.id)
        setReports(reportsData)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat data laporan dana.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!acceptedApp) return
    if (!bulan || !kategori || !jumlah || !keterangan) {
      setErrorMessage('Semua field laporan wajib diisi.')
      return
    }

    setSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      // Simulate file upload if exist
      const dummyUrl = receiptFile ? `https://storage.beasiswaku.com/receipts/${Date.now()}_${receiptFile.name}` : ''

      await submitMonthlyReport({
        application_id: acceptedApp.id,
        bulan,
        kategori,
        jumlah: Number(jumlah),
        keterangan,
        bukti_url: dummyUrl || undefined,
      })

      setSuccessMessage('Laporan penggunaan dana berhasil dikirim!')
      // Reset form
      setBulan('')
      setKategori('')
      setJumlah('')
      setKeterangan('')
      setReceiptFile(null)
      await loadData()
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengirimkan laporan dana.')
    } finally {
      setSubmitting(false)
    }
  }

  function getStatusStyle(status: FundReportItem['status']) {
    switch (status) {
      case 'dikirim': return 'bg-blue-100 text-blue-800'
      case 'terverifikasi': return 'bg-green-100 text-green-800'
      case 'ditolak': return 'bg-orange-100 text-orange-800 font-semibold'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function getStatusLabel(status: FundReportItem['status']) {
    switch (status) {
      case 'dikirim': return 'Menunggu Verifikasi'
      case 'terverifikasi': return 'Valid (Disetujui)'
      case 'ditolak': return 'Butuh Revisi'
      default: return status
    }
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  if (!acceptedApp) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 text-red-500">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-primary mb-2">Akses Ditolak</h1>
        <p className="text-gray-500">
          Halaman Laporan Penggunaan Dana bulanan hanya dapat diakses oleh siswa penerima beasiswa aktif (Status: **DITERIMA**).
        </p>
      </section>
    )
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2 border border-emerald-200">
          Penerima Beasiswa Aktif
        </span>
        <h1 className="text-2xl font-bold text-primary">Laporan Penggunaan Dana</h1>
        <p className="text-gray-500">
          Laporkan secara berkala rincian pengeluaran dana beasiswa Anda sebelum tanggal 25 setiap bulannya.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm">
          ⚠ {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 text-sm font-semibold">
          ✓ {successMessage}
        </div>
      )}

      {/* Grid: Form Input + Reports list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form Card */}
        <Card className="md:col-span-1 p-5 h-fit">
          <h2 className="text-base font-bold text-primary border-b border-gray-100 pb-3 mb-4">
            Kirim Laporan Bulanan
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Bulan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pilih Bulan</label>
              <select
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary font-medium focus:ring-2 focus:ring-accent bg-white"
                required
              >
                <option value="">Pilih Bulan</option>
                <option value="Januari">Januari</option>
                <option value="Februari">Februari</option>
                <option value="Maret">Maret</option>
                <option value="April">April</option>
                <option value="Mei">Mei</option>
                <option value="Juni">Juni</option>
                <option value="Juli">Juli</option>
                <option value="Agustus">Agustus</option>
                <option value="September">September</option>
                <option value="Oktber">Oktober</option>
                <option value="November">November</option>
                <option value="Desember">Desember</option>
              </select>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori Belanja</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary font-medium focus:ring-2 focus:ring-accent bg-white"
                required
              >
                <option value="">Pilih Kategori</option>
                <option value="Peralatan Akademik">Peralatan Akademik (Buku/Laptop)</option>
                <option value="SPP / UKT">Biaya SPP / UKT Kuliah</option>
                <option value="Akomodasi & Kos">Biaya Kos / Tempat Tinggal</option>
                <option value="Transportasi">Biaya Transportasi Harian</option>
                <option value="Kebutuhan Hidup">Kebutuhan Hidup Sehari-hari</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Jumlah */}
            <Input
              label="Nominal Pengeluaran (Rp)"
              type="number"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="Contoh: 750000"
              required
            />

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keterangan / Rincian Belanja</label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Tulis rincian pembelian barang/jasa..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent resize-none text-primary"
                required
              />
            </div>

            {/* Foto Bukti */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unggah Kuitansi / Bukti Pembelian</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/5 file:text-primary hover:file:bg-primary/10 file:cursor-pointer"
                required
              />
            </div>

            <Button type="submit" loading={submitting} className="w-full justify-center mt-2">
              Kirim Laporan
            </Button>
          </form>
        </Card>

        {/* History list */}
        <div className="md:col-span-2 space-y-4">
          <Card className="p-6">
            <h2 className="text-base font-bold text-primary border-b border-gray-100 pb-3 mb-4">
              Riwayat Pengiriman Laporan
            </h2>

            <div className="space-y-3" data-testid="history-list">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <div key={report.id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shadow-sm">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="font-semibold text-gray-900">{report.bulan}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusStyle(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </div>
                      <p className="text-sm text-primary font-semibold">{formatRupiah(report.jumlah)} &bull; <span className="text-gray-500 font-normal">{report.kategori}</span></p>
                      <p className="text-xs text-gray-500 mt-1 italic">"{report.keterangan}"</p>
                    </div>

                    {report.status === 'ditolak' && (
                      <div className="sm:text-right">
                        <span className="inline-block bg-orange-50 text-orange-700 text-xs border border-orange-200 px-3 py-1.5 rounded-lg max-w-[200px] leading-relaxed">
                          Revisi diperlukan. Ubah laporan ini untuk mengunggah ulang.
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Belum ada riwayat laporan yang dikirim.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default SiswaLaporanDanaPage
