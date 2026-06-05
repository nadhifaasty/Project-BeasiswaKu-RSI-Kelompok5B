import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Input } from '../components'
import { getUserApplications, type Application } from '../services/scholarship'

interface DisbursementDetails {
  nama_bank: string
  nomor_rekening: string
  nama_pemegang: string
  cabang_bank: string
}

function StatusTrackingPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Simulation state for bank account details (Fund Disbursement Step 5)
  const [disbursementData, setDisbursementData] = useState<DisbursementDetails | null>(null)
  const [showBankForm, setShowBankForm] = useState(false)
  const [bankSubmitting, setBankSubmitting] = useState(false)
  const [bankMessage, setBankMessage] = useState<string | null>(null)

  // Form fields
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [branch, setBranch] = useState('')
  const [passbookFile, setPassbookFile] = useState<File | null>(null)

  useEffect(() => {
    loadApplications()
  }, [])

  async function loadApplications() {
    try {
      setLoading(true)
      const apps = await getUserApplications()
      setApplications(apps)
      if (apps.length > 0) {
        setSelectedApp(apps[0]) // default to latest
        // Check if bank details exist in localStorage (simulation) for this application
        const savedBank = localStorage.getItem(`bank_${apps[0].id}`)
        if (savedBank) {
          setDisbursementData(JSON.parse(savedBank))
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat data pelacakan status.')
    } finally {
      setLoading(false)
    }
  }

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) return

    setBankSubmitting(true)
    setBankMessage(null)

    if (passbookFile) {
      console.log('Mengunggah berkas tabungan:', passbookFile.name)
    }

    // Simulate database write with 1s latency
    setTimeout(() => {
      const details: DisbursementDetails = {
        nama_bank: bankName,
        nomor_rekening: accountNumber,
        nama_pemegang: accountHolder,
        cabang_bank: branch,
      }
      localStorage.setItem(`bank_${selectedApp.id}`, JSON.stringify(details))
      setDisbursementData(details)
      setBankSubmitting(false)
      setShowBankForm(false)
      setBankMessage('Data rekening bank berhasil disimpan dan diverifikasi!')
    }, 1200)
  }

  function getStatusStyle(status: Application['status']) {
    switch (status) {
      case 'PENDING':
        return {
          bg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
          text: 'Menunggu Verifikasi',
          desc: 'Pengajuan Anda telah berhasil dikirim dan saat ini berada dalam antrean pemeriksaan dokumen oleh tim verifikator.',
        }
      case 'TERVERIFIKASI':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          badge: 'bg-blue-100 text-blue-800 ring-blue-600/20',
          text: 'Terverifikasi',
          desc: 'Dokumen Anda dinyatakan valid. Pengajuan Anda siap diikutkan dalam proses kalkulasi pemeringkatan seleksi.',
        }
      case 'REVISI':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          badge: 'bg-orange-100 text-orange-800 ring-orange-600/20',
          text: 'Butuh Revisi',
          desc: 'Verifikasi berkas Anda memerlukan perbaikan. Periksa catatan verifikator di bawah dan unggah ulang berkas yang diminta.',
        }
      case 'DITERIMA':
        return {
          bg: 'bg-green-50 text-green-800 border-green-200',
          badge: 'bg-green-100 text-green-800 ring-green-600/20',
          text: 'Diterima',
          desc: 'Selamat! Anda dinyatakan lolos sebagai penerima beasiswa periode ini. Silakan lengkapi data rekening untuk pencairan dana.',
        }
      case 'CADANGAN':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          badge: 'bg-purple-100 text-purple-800 ring-purple-600/20',
          text: 'Cadangan',
          desc: 'Anda ditempatkan sebagai kandidat cadangan. Jika penerima utama membatalkan atau kuota bertambah, Anda akan dihubungi.',
        }
      case 'DITOLAK':
        return {
          bg: 'bg-red-50 text-red-800 border-red-200',
          badge: 'bg-red-100 text-red-800 ring-red-600/20',
          text: 'Ditolak',
          desc: 'Mohon maaf, pengajuan Anda belum dapat disetujui pada periode ini karena keterbatasan kuota atau ketidaksesuaian kriteria.',
        }
      default:
        return {
          bg: 'bg-gray-50 text-gray-800 border-gray-200',
          badge: 'bg-gray-100 text-gray-800 ring-gray-600/20',
          text: 'Status Tidak Diketahui',
          desc: '-',
        }
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-primary mb-3">Belum Ada Pengajuan</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Kamu belum mengajukan program beasiswa apa pun. Lengkapi biodata kamu terlebih dahulu lalu kirimkan pengajuan kamu.
        </p>
        <Link to="/pengajuan">
          <Button variant="primary" className="px-6 py-2.5">
            Ajukan Beasiswa Sekarang
          </Button>
        </Link>
      </section>
    )
  }

  const app = selectedApp!
  const statusInfo = getStatusStyle(app.status)

  // Determine stage flags
  const isPending = app.status === 'PENDING'
  const isRevisi = app.status === 'REVISI'
  const isDitolak = app.status === 'DITOLAK'
  const isVerified = app.status !== 'PENDING' && app.status !== 'REVISI'
  const isFinalized = ['DITERIMA', 'CADANGAN', 'DITOLAK'].includes(app.status)
  const isAccepted = app.status === 'DITERIMA'

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold text-primary">Lacak Status Pengajuan</h1>
            <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border">
              Ref: {app.nomor_referensi}
            </span>
          </div>
          <p className="text-gray-500">
            Program: <span className="font-semibold text-primary">{app.scholarship_programs?.nama}</span> &bull; Diajukan pada {new Date(app.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
          </p>
        </div>

        {/* Dropdown Selector if user has multiple apps */}
        {applications.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Pilih Pengajuan:</span>
            <select
              value={app.id}
              onChange={(e) => {
                const selected = applications.find((a) => a.id === e.target.value) || null
                setSelectedApp(selected)
                if (selected) {
                  const savedBank = localStorage.getItem(`bank_${selected.id}`)
                  setDisbursementData(savedBank ? JSON.parse(savedBank) : null)
                }
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary font-medium focus:ring-2 focus:ring-accent bg-white"
            >
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.scholarship_programs?.nama} ({a.nomor_referensi})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm">
          {errorMessage}
        </div>
      )}

      {bankMessage && (
        <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 text-sm font-semibold">
          🎉 {bankMessage}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Timeline Stepper */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
              Timeline Proses Seleksi
            </h2>

            {/* Stepper Vertical */}
            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
              
              {/* Step 1: Pendaftaran Diajukan */}
              <div className="relative">
                <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-sm">
                  ✓
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">Pendaftaran Berhasil Dikirim</h3>
                  <p className="text-xs text-gray-500">
                    Diajukan pada {new Date(app.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Formulir beserta esai motivasi telah lengkap masuk ke database BeasiswaKu.
                  </p>
                </div>
              </div>

              {/* Step 2: Verifikasi Dokumen */}
              <div className="relative">
                {isPending ? (
                  <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white animate-pulse">
                    2
                  </span>
                ) : isRevisi ? (
                  <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white">
                    ⚠
                  </span>
                ) : isDitolak ? (
                  <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white">
                    ✕
                  </span>
                ) : (
                  <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white">
                    ✓
                  </span>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    Verifikasi Dokumen & Administrasi
                    {isPending && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Proses</span>}
                    {isRevisi && <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">Revisi</span>}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {!isVerified && isPending && 'Admin sedang memeriksa kesesuaian berkas biodata, KK, transkrip nilai, dan dokumen pendukung lainnya.'}
                    {!isVerified && isRevisi && 'Dokumen dinyatakan butuh revisi. Silakan perbaiki di halaman perbaikan.'}
                    {isVerified && 'Semua dokumen Anda dinyatakan VALID oleh Admin Verifikator.'}
                  </p>
                </div>
              </div>

              {/* Step 3: Kalkulasi Kelayakan */}
              <div className="relative">
                {isFinalized ? (
                  <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white">
                    ✓
                  </span>
                ) : isVerified ? (
                  <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white animate-pulse">
                    3
                  </span>
                ) : (
                  <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-xs ring-4 ring-white">
                    3
                  </span>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">Kalkulasi Skor Kelayakan (Selection Engine)</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {!isVerified && 'Menunggu tahap verifikasi dokumen selesai.'}
                    {isVerified && !isFinalized && 'Sistem melakukan pemeringkatan berdasarkan skor pembobotan akademik, ekonomi, prestasi, dan kelengkapan dokumen.'}
                    {isFinalized && 'Kalkulasi kelayakan telah dilakukan berdasarkan bobot kriteria seleksi.'}
                  </p>
                </div>
              </div>

              {/* Step 4: Hasil Seleksi Final */}
              <div className="relative">
                {isFinalized ? (
                  isAccepted ? (
                    <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white animate-bounce">
                      🎉
                    </span>
                  ) : app.status === 'CADANGAN' ? (
                    <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white">
                      ★
                    </span>
                  ) : (
                    <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white">
                      ✕
                    </span>
                  )
                ) : (
                  <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-xs ring-4 ring-white">
                    4
                  </span>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">Keputusan Akhir Seleksi</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {!isFinalized && 'Pengumuman akan dirilis setelah proses pemeringkatan disahkan oleh Admin.'}
                    {isFinalized && isAccepted && <span className="text-green-700 font-semibold">Anda lolos sebagai penerima beasiswa utama!</span>}
                    {isFinalized && app.status === 'CADANGAN' && <span className="text-purple-700 font-semibold">Anda lolos sebagai pendaftar cadangan.</span>}
                    {isFinalized && app.status === 'DITOLAK' && <span className="text-red-700 font-semibold">Mohon maaf, Anda belum lolos pemeringkatan kuota.</span>}
                  </p>
                </div>
              </div>

              {/* Step 5: Pengisian Rekening (Khusus Penerima) */}
              {isAccepted && (
                <div className="relative">
                  {disbursementData ? (
                    <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white">
                      ✓
                    </span>
                  ) : (
                    <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white animate-pulse">
                      5
                    </span>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">Pengisian Data Rekening Pencairan</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {disbursementData ? (
                        <span className="text-green-700 font-medium">
                          Data Rekening: {disbursementData.nama_bank} - {disbursementData.nomor_rekening} ({disbursementData.nama_pemegang})
                        </span>
                      ) : (
                        'Harap melengkapi nomor rekening bank Anda agar pencairan dana beasiswa dapat diproses.'
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Step 6: Penyaluran Dana & Laporan (Khusus Penerima) */}
              {isAccepted && (
                <div className="relative">
                  <span className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-xs ring-4 ring-white">
                    6
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Penyaluran Dana & Laporan Bulanan</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Dana dicairkan bulanan. Penerima wajib mengirim laporan pertanggungjawaban penggunaan dana sebelum tanggal 25 setiap bulannya.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </Card>
        </div>

        {/* Right Column: Status & Quick Actions */}
        <div className="space-y-6">
          
          {/* Main Status Panel */}
          <div className={`rounded-2xl border p-6 ${statusInfo.bg} shadow-md space-y-4`}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-70">Status Pengajuan</span>
              <span className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusInfo.badge}`}>
                {statusInfo.text}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium leading-relaxed">{statusInfo.desc}</p>
            </div>

            {/* Admin Note if Revisi/Rejected */}
            {app.catatan_admin && (
              <div className="border-t border-black/10 pt-3 mt-3">
                <h4 className="text-xs font-bold uppercase opacity-85 mb-1">Catatan Admin/Reviewer:</h4>
                <p className="text-sm italic font-serif">"{app.catatan_admin}"</p>
              </div>
            )}
          </div>

          {/* Contextual Action Buttons */}
          <div className="space-y-3">
            
            {/* If REVISI, provide a link to documents page */}
            {isRevisi && (
              <Link to="/dokumen" className="block w-full">
                <Button variant="primary" className="w-full justify-center bg-orange-600 hover:bg-orange-700 text-white shadow">
                  Perbaiki Dokumen Sekarang
                </Button>
              </Link>
            )}

            {/* If ACCEPTED and no bank data, show form toggle button */}
            {isAccepted && !disbursementData && (
              <Button
                variant="primary"
                onClick={() => setShowFormBankToggle(true)}
                className="w-full justify-center bg-green-600 hover:bg-green-700 text-white shadow animate-pulse"
              >
                Isi Data Rekening Bank
              </Button>
            )}

            {/* General Help Contact */}
            <a
              href="mailto:support@beasiswaku.com?subject=Bantuan%20Pengajuan"
              className="block w-full text-center py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              Hubungi Helpdesk Beasiswa
            </a>
          </div>

          {/* Quick Info Card */}
          <Card className="p-5 space-y-3">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Informasi Program</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Program:</span>
                <span className="font-semibold text-primary">{app.scholarship_programs?.nama}</span>
              </div>
              <div className="flex justify-between">
                <span>Nominal:</span>
                <span className="font-bold text-emerald-600">{app.scholarship_programs?.nominal} / bulan</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {app.scholarship_programs?.nama?.toLowerCase().includes('perguruan') ||
                   app.scholarship_programs?.nama?.toLowerCase().includes('mahasiswa') ||
                   app.scholarship_programs?.nama?.toLowerCase().includes('tinggi')
                    ? 'Nilai IPK Anda:'
                    : 'Nilai Rata-rata Anda:'}
                </span>
                <span className="font-semibold text-primary">{app.ipk}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal / Dialog Form for Bank Account details */}
      {showBankForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-primary">Lengkapi Data Rekening Tabungan</h3>
                <p className="text-xs text-gray-500">Khusus penerima beasiswa {app.scholarship_programs?.nama}</p>
              </div>
              <button
                onClick={() => setShowFormBankToggle(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary font-medium focus:ring-2 focus:ring-accent bg-white"
                  required
                >
                  <option value="">Pilih Bank</option>
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="BNI">BNI (Bank Negara Indonesia)</option>
                  <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                  <option value="BCA">BCA (Bank Central Asia)</option>
                  <option value="BTN">BTN (Bank Tabungan Negara)</option>
                  <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                </select>
              </div>

              <Input
                label="Nomor Rekening"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Masukkan nomor rekening tanpa spasi/tanda baca"
                required
              />

              <Input
                label="Nama Pemegang Rekening (Harus sesuai KTP/Biodata)"
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Contoh: AHMAD HIDAYAT"
                required
              />

              <Input
                label="Kantor Cabang Bank"
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Contoh: Cabang Surakarta Kentingan"
                required
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Foto/Scan Buku Tabungan (Halaman Depan)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setPassbookFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/5 file:text-primary hover:file:bg-primary/10 file:cursor-pointer"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Format file: JPG, PNG, atau PDF (Maks. 2MB)</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setShowFormBankToggle(false)} className="flex-1">
                  Batal
                </Button>
                <Button type="submit" loading={bankSubmitting} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  Kirim Data Rekening
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )

  function setShowFormBankToggle(val: boolean) {
    if (val) {
      // pre-fill holder name from user info
      setAccountHolder('')
      setBankName('')
      setAccountNumber('')
      setBranch('')
      setPassbookFile(null)
    }
    setShowBankForm(val)
  }
}

export default StatusTrackingPage
