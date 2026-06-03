import { useState, useEffect } from 'react'
import { Card, Button } from '../../components'
import { fetchApi } from '../../services/api'

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
  profiles?: {
    nama_lengkap: string
    nim_nisn: string
    email: string
  }
  applications?: {
    nomor_referensi: string
    scholarship_programs?: {
      nama: string
    }
  }
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function AdminLaporanDanaPage() {
  const [reports, setReports] = useState<FundReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Verification modal state
  const [selectedReport, setSelectedReport] = useState<FundReportItem | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadReports()
  }, [filterStatus])

  async function loadReports() {
    setLoading(true)
    setErrorMessage(null)
    try {
      const url = filterStatus ? `/fund-reports/admin?status=${filterStatus}` : '/fund-reports/admin'
      const res = await fetchApi<ApiResponse<FundReportItem[]>>(url)
      setReports(res.data)
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat laporan dana bulanan.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(status: 'terverifikasi' | 'ditolak') {
    if (!selectedReport) return
    setSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await fetchApi<ApiResponse<FundReportItem>>(`/fund-reports/admin/${selectedReport.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          catatan_admin: reviewNotes,
        }),
      })

      setSuccessMessage(`Laporan berhasil diverifikasi sebagai ${status === 'terverifikasi' ? 'VALID' : 'BUTUH REVISI'}.`)
      setSelectedReport(null)
      setReviewNotes('')
      await loadReports()
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui verifikasi laporan.')
    } finally {
      setSubmitting(false)
    }
  }

  function getStatusBadge(status: FundReportItem['status']) {
    switch (status) {
      case 'dikirim':
        return 'bg-blue-100 text-blue-800'
      case 'terverifikasi':
        return 'bg-green-100 text-green-800'
      case 'ditolak':
        return 'bg-orange-100 text-orange-800 font-medium'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function getStatusLabel(status: FundReportItem['status']) {
    switch (status) {
      case 'dikirim': return 'Menunggu Verifikasi'
      case 'terverifikasi': return 'Valid'
      case 'ditolak': return 'Butuh Revisi'
      case 'draft': return 'Draft'
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

  if (loading && reports.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="h-80 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-primary">Verifikasi Laporan Dana Bulanan</h1>
          <p className="text-gray-500">
            Tinjau laporan pengeluaran bulanan yang dikirim oleh penerima beasiswa aktif.
          </p>
        </div>

        {/* Filter status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary font-medium focus:ring-2 focus:ring-accent bg-white"
          >
            <option value="">Semua Laporan</option>
            <option value="dikirim">Menunggu Verifikasi</option>
            <option value="terverifikasi">Valid (Selesai)</option>
            <option value="ditolak">Butuh Revisi</option>
          </select>
        </div>
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

      {/* Reports Table Card */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          {reports.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                  <th className="py-3 px-4">Penerima Beasiswa</th>
                  <th className="py-3 px-4">Program / No. Ref</th>
                  <th className="py-3 px-4">Bulan</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {reports.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      <div>{item.profiles?.nama_lengkap}</div>
                      <div className="text-xs text-gray-400 font-mono">{item.profiles?.nim_nisn}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-primary font-medium">{item.applications?.scholarship_programs?.nama}</div>
                      <div className="text-xs text-gray-500 font-mono">{item.applications?.nomor_referensi}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-700">{item.bulan}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatRupiah(item.jumlah)}</td>
                    <td className="py-3 px-4 font-medium text-gray-600">{item.kategori}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant={item.status === 'terverifikasi' ? 'ghost' : 'outline'}
                        onClick={() => {
                          setSelectedReport(item)
                          setReviewNotes('')
                        }}
                        className="px-3.5 py-1 text-xs"
                      >
                        {item.status === 'terverifikasi' ? 'Detail' : 'Tinjau'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Belum ada laporan dana bulanan yang dikirim.
            </div>
          )}
        </div>
      </Card>

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5 border">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-primary">Tinjau Laporan Bulanan</h3>
                <p className="text-xs text-gray-500">Penerima: {selectedReport.profiles?.nama_lengkap}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Details Panel */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 border">
              <div className="flex justify-between">
                <span className="text-gray-500">Program Beasiswa:</span>
                <span className="font-semibold text-primary">{selectedReport.applications?.scholarship_programs?.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Periode Bulan:</span>
                <span className="font-semibold text-primary">{selectedReport.bulan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kategori Belanja:</span>
                <span className="font-semibold text-primary">{selectedReport.kategori}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nominal Laporan:</span>
                <span className="font-bold text-emerald-600">{formatRupiah(selectedReport.jumlah)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <span className="block text-gray-500 mb-1">Rincian / Keterangan:</span>
                <p className="text-gray-700 italic">"{selectedReport.keterangan}"</p>
              </div>
            </div>

            {/* Receipt Preview */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Berkas Bukti Pembayaran / Kuitansi</label>
              {selectedReport.bukti_url ? (
                <div className="border border-gray-200 rounded-lg p-3 bg-white flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600 truncate max-w-[240px]">{selectedReport.bukti_url}</span>
                  <a
                    href={selectedReport.bukti_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent font-semibold hover:underline"
                  >
                    Buka Lampiran ↗
                  </a>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Kuitansi / Bukti pembayaran tidak diunggah.</p>
              )}
            </div>

            {/* Input review notes (disabled if Valid - BR-30) */}
            {selectedReport.status !== 'terverifikasi' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Catatan Verifikasi (Khusus jika Tolak/Revisi)</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Contoh: Bukti transfer terpotong, tolong upload kuitansi lengkap..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none text-sm"
                />
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setSelectedReport(null)} className="flex-1">
                Tutup
              </Button>

              {/* Only show decision buttons if status is NOT already verified (BR-30) */}
              {selectedReport.status !== 'terverifikasi' ? (
                <>
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleVerify('ditolak')}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Minta Revisi
                  </Button>
                  <Button
                    type="button"
                    loading={submitting}
                    onClick={() => handleVerify('terverifikasi')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Setujui Laporan
                  </Button>
                </>
              ) : (
                <div className="flex-1 text-center bg-green-50 border border-green-200 text-green-700 py-2 rounded-lg text-xs font-semibold leading-relaxed shrink-0 select-none">
                  ✓ Laporan Valid & Terkunci (BR-30)
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminLaporanDanaPage
