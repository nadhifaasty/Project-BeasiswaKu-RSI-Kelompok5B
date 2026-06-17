import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button } from '../../components'
import { fetchApi } from '../../services/api'

import { getPrograms, runSelection, getSelectionResults, finalizeSelection, rollbackSelection, type ScholarshipProgram } from '../../services/scholarship'

interface RankingItem {
  rank: number
  application_id: string
  full_name: string
  nim_nisn: string
  skor_total: number
  skor_akademik: number
  skor_ekonomi: number
  skor_prestasi: number
  skor_dokumen: number
  status_rekomendasi: 'DITERIMA' | 'CADANGAN' | 'DITOLAK'
}

interface SelectionResultsResponse {
  program_id: string
  is_finalized: boolean
  ranking: RankingItem[]
}

interface RunSelectionResponse {
  program_id: string
  program_name: string
  total_candidates: number
  ranking: RankingItem[]
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function SelectionPage() {
  const [programs, setPrograms] = useState<ScholarshipProgram[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [rollingBack, setRollingBack] = useState(false)
  const [rankingData, setRankingData] = useState<RankingItem[]>([])
  const [isFinalized, setIsFinalized] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Weights state loaded from localStorage
  const [wAkademik, setWAkademik] = useState(() => Number(localStorage.getItem('wAkademik') || 40))
  const [wEkonomi, setWEkonomi] = useState(() => Number(localStorage.getItem('wEkonomi') || 35))
  const [wPrestasi, setWPrestasi] = useState(() => Number(localStorage.getItem('wPrestasi') || 15))
  const [wDokumen, setWDokumen] = useState(() => Number(localStorage.getItem('wDokumen') || 10))

  // Save weights to localStorage when changed
  useEffect(() => {
    localStorage.setItem('wAkademik', String(wAkademik))
    localStorage.setItem('wEkonomi', String(wEkonomi))
    localStorage.setItem('wPrestasi', String(wPrestasi))
    localStorage.setItem('wDokumen', String(wDokumen))
  }, [wAkademik, wEkonomi, wPrestasi, wDokumen])

  // Sync weights from localStorage when page is focused or mounted
  useEffect(() => {
    const handleFocus = () => {
      setWAkademik(Number(localStorage.getItem('wAkademik') || 40))
      setWEkonomi(Number(localStorage.getItem('wEkonomi') || 35))
      setWPrestasi(Number(localStorage.getItem('wPrestasi') || 15))
      setWDokumen(Number(localStorage.getItem('wDokumen') || 10))
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Finalize confirmation modal
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)

  const totalWeight = wAkademik + wEkonomi + wPrestasi + wDokumen
  const isWeightValid = totalWeight === 100

  useEffect(() => {
    loadPrograms()
  }, [])

  useEffect(() => {
    if (selectedProgramId) {
      loadResults(selectedProgramId)
    } else {
      setRankingData([])
      setIsFinalized(false)
    }
  }, [selectedProgramId])

  async function loadPrograms() {
    try {
      setLoading(true)
      const progs = await getPrograms()
      setPrograms(progs)
      if (progs.length > 0) {
        setSelectedProgramId(progs[0].id)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat data program.')
    } finally {
      setLoading(false)
    }
  }

  async function loadResults(programId: string) {
    setErrorMessage(null)
    try {
      const res = await getSelectionResults(programId)
      setRankingData(res.ranking)
      setIsFinalized(res.is_finalized)
    } catch {
      // If no results calculated yet, it's normal to have empty results
      setRankingData([])
      setIsFinalized(false)
    }
  }

  async function handleCalculate() {
    if (!selectedProgramId) return
    if (!isWeightValid) {
      setErrorMessage('Total bobot penilaian harus sama dengan 100%.')
      return
    }

    setCalculating(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const res = await runSelection(selectedProgramId, {
        bobot_akademik: wAkademik,
        bobot_ekonomi: wEkonomi,
        bobot_prestasi: wPrestasi,
        bobot_dokumen: wDokumen,
      })

      setRankingData(res.ranking)
      setSuccessMessage(`Kalkulasi selesai. Berhasil memproses ${res.total_candidates} kandidat.`)
      // Refresh finalized status
      await loadResults(selectedProgramId)
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menjalankan kalkulasi seleksi.')
    } finally {
      setCalculating(false)
    }
  }

  async function handleFinalize() {
    if (!selectedProgramId) return
    setFinalizing(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    setShowFinalizeModal(false)

    try {
      await finalizeSelection(selectedProgramId)
      setSuccessMessage('Hasil seleksi berhasil disahkan! Status pendaftar telah diperbarui secara resmi.')
      setIsFinalized(true)
      await loadResults(selectedProgramId)
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengesahkan hasil seleksi.')
    } finally {
      setFinalizing(false)
    }
  }

  async function handleRollback() {
    if (!selectedProgramId) return
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pengesahan seleksi ini? Seluruh status siswa akan dikembalikan menjadi TERVERIFIKASI.')) {
      return
    }

    setRollingBack(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await rollbackSelection(selectedProgramId)
      setSuccessMessage('Pengesahan berhasil dibatalkan! Status pendaftar telah dikembalikan menjadi TERVERIFIKASI.')
      setIsFinalized(false)
      await loadResults(selectedProgramId)
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membatalkan pengesahan seleksi.')
    } finally {
      setRollingBack(false)
    }
  }

  async function handleUpdateStudentStatusDirect(applicationId: string, status: string) {
    if (!selectedProgramId) return
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      await fetchApi(`/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setSuccessMessage(`Berhasil memperbarui status siswa secara manual.`)
      await loadResults(selectedProgramId)
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui status secara manual.')
    }
  }

  function getRecommendationBadge(recom: RankingItem['status_rekomendasi']) {
    switch (recom) {
      case 'DITERIMA':
        return 'bg-green-100 text-green-800'
      case 'CADANGAN':
        return 'bg-purple-100 text-purple-800'
      case 'DITOLAK':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="h-80 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Modul Seleksi & Penilaian</h1>
          <p className="text-gray-500">
            Jalankan kalkulasi skor kelayakan pendaftar beasiswa dan sahkan rekomendasi hasil seleksi.
          </p>
        </div>

        {/* Program Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Pilih Program:</span>
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary font-medium focus:ring-2 focus:ring-accent bg-white"
          >
            <option value="">Pilih Program Beasiswa</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alert Feedbacks */}
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

      {/* Grid: Sliders Controls + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Parameter Bobot Penilaian Aktif (Sliders) */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-primary">Parameter Bobot Penilaian Aktif</h2>
              <p className="text-xs text-gray-400 mt-0.5">Sesuaikan bobot kriteria untuk kalkulasi skor kelayakan dinamis</p>
            </div>
            <Link
              to="/admin/pengajuan"
              className="text-xs text-primary hover:underline font-bold flex items-center gap-1 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-100/80 transition"
            >
              Daftar Pengajuan ↗
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Academic Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Akademik (IPK/Nilai)</span>
                <span className="font-extrabold text-primary">{wAkademik}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wAkademik}
                disabled={isFinalized}
                onChange={(e) => setWAkademik(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
              />
            </div>

            {/* Economic Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Kondisi Ekonomi</span>
                <span className="font-extrabold text-primary">{wEkonomi}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wEkonomi}
                disabled={isFinalized}
                onChange={(e) => setWEkonomi(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
              />
            </div>

            {/* Achievement Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Prestasi Non-Akademik</span>
                <span className="font-extrabold text-primary">{wPrestasi}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wPrestasi}
                disabled={isFinalized}
                onChange={(e) => setWPrestasi(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
              />
            </div>

            {/* Document Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Kelengkapan Dokumen</span>
                <span className="font-extrabold text-primary">{wDokumen}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wDokumen}
                disabled={isFinalized}
                onChange={(e) => setWDokumen(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
              />
            </div>
          </div>

          {/* Sum Validation Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Akumulasi Bobot:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                isWeightValid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {totalWeight}% {isWeightValid ? '✓ Valid' : '⚠ Harus 100%'}
              </span>
            </div>

            <Button
              variant="primary"
              disabled={isFinalized || !isWeightValid || calculating || !selectedProgramId}
              onClick={handleCalculate}
              loading={calculating}
              className="w-full sm:w-auto px-6"
            >
              Jalankan Kalkulasi Kelayakan
            </Button>
          </div>
        </Card>

        {/* Right Column: Program Quota Details & Actions */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-primary border-b border-gray-100 pb-3">Informasi Kuota</h2>
            {selectedProgramId ? (
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Nama Program:</span>
                  <span className="font-semibold text-primary">
                    {programs.find((p) => p.id === selectedProgramId)?.nama || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Target Sasaran:</span>
                  <span className="font-semibold text-primary">SMA / PT</span>
                </div>
                <div className="flex justify-between">
                  <span>Kuota Penerima Utama:</span>
                  <span className="font-bold text-primary">
                    {programs.find((p) => p.id === selectedProgramId)?.kuota || 0} orang
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kuota Cadangan (Est. 20%):</span>
                  <span className="font-bold text-purple-700">
                    {Math.max(Math.floor((programs.find((p) => p.id === selectedProgramId)?.kuota || 0) * 0.2), 2)} orang
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Silakan pilih program beasiswa terlebih dahulu.</p>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100">
            {isFinalized ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 text-green-700 text-center py-2.5 rounded-lg text-sm font-semibold">
                  ✓ Hasil Seleksi Telah Disahkan
                </div>
                <Button
                  variant="outline"
                  onClick={handleRollback}
                  loading={rollingBack}
                  className="w-full justify-center border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold"
                >
                  Batalkan Pengesahan
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                disabled={rankingData.length === 0 || finalizing || !selectedProgramId}
                onClick={() => setShowFinalizeModal(true)}
                className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Sahkan Hasil Seleksi Final
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Section Ranking Results Table */}
      {rankingData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-primary">Tabel Hasil Perankingan Kelayakan</h2>
            <span className="text-xs text-gray-400">Total: {rankingData.length} kandidat</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                  <th className="py-3 px-4 font-bold">Rank</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">NIM/NISN</th>
                  <th className="py-3 px-4 text-center">Skor Total</th>
                  <th className="py-3 px-4 text-center">SA</th>
                  <th className="py-3 px-4 text-center">SE</th>
                  <th className="py-3 px-4 text-center">SP</th>
                  <th className="py-3 px-4 text-center">SD</th>
                  <th className="py-3 px-4">Rekomendasi</th>
                  {!isFinalized && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {rankingData.map((item) => (
                  <tr key={item.application_id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-bold text-primary">#{item.rank}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{item.full_name}</td>
                    <td className="py-3 px-4 font-mono text-gray-500">{item.nim_nisn}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">{item.skor_total.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{item.skor_akademik.toFixed(1)}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{item.skor_ekonomi.toFixed(1)}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{item.skor_prestasi.toFixed(1)}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{item.skor_dokumen.toFixed(1)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRecommendationBadge(item.status_rekomendasi)}`}>
                        {item.status_rekomendasi}
                      </span>
                    </td>
                    {!isFinalized && (
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleUpdateStudentStatusDirect(item.application_id, 'DITERIMA')}
                            disabled={item.status_rekomendasi === 'DITERIMA'}
                            title="Loloskan Utama"
                            className="px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50 text-xs font-bold transition flex items-center gap-1"
                          >
                            🏆 Lolos
                          </button>
                          <button
                            onClick={() => handleUpdateStudentStatusDirect(item.application_id, 'DITOLAK')}
                            disabled={item.status_rekomendasi === 'DITOLAK'}
                            title="Tolak"
                            className="px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50 text-xs font-bold transition flex items-center gap-1"
                          >
                            ✗ Tolak
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Confirmation Finalize Modal (Ratify Dialog - Day 3 requirement) */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 border">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary">Sahkan Hasil Seleksi?</h3>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              Tindakan ini bersifat **final dan tidak dapat dibatalkan (irreversible)**. Setelah disahkan:
              <br />
              1. Status pengajuan seluruh pendaftar akan resmi berubah menjadi **DITERIMA**, **CADANGAN**, atau **DITOLAK**.
              <br />
              2. Siswa dapat melihat pengumuman kelulusan di halaman Lacak Status masing-masing.
              <br />
              3. Pencairan dana beasiswa untuk penerima beasiswa utama akan otomatis dipersiapkan.
            </p>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setShowFinalizeModal(false)} className="flex-1">
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleFinalize}
                loading={finalizing}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Ya, Sahkan Hasil
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default SelectionPage
