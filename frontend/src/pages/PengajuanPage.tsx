import { useState, useEffect } from 'react'
import { Button, Card, Input } from '../components'
import {
  getPrograms,
  getUserApplications,
  createApplication,
  type ScholarshipProgram,
  type Application,
} from '../services/scholarship'
import { getBiodataAkademik, type BiodataAkademik } from '../services/biodata'

function PengajuanPage() {
  const [programs, setPrograms] = useState<ScholarshipProgram[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [akademik, setAkademik] = useState<BiodataAkademik | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<ScholarshipProgram | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [ipk, setIpk] = useState('')
  const [esai, setEsai] = useState('')
  const [prestasi, setPrestasi] = useState('')

  const studentIsCollege = akademik?.jenjang?.toLowerCase().includes('perguruan') || akademik?.jenjang?.toUpperCase() === 'PERGURUAN_TINGGI'

  function isProgramMatching(progName: string): boolean {
    if (!akademik) return true
    const programIsCollege = progName?.toLowerCase().includes('perguruan') || progName?.toLowerCase().includes('mahasiswa') || progName?.toLowerCase().includes('tinggi')
    return studentIsCollege === programIsCollege
  }

  const isCollege = selectedProgram?.nama?.toLowerCase().includes('perguruan') || selectedProgram?.nama?.toLowerCase().includes('mahasiswa') || selectedProgram?.nama?.toLowerCase().includes('tinggi')
  const maxVal = isCollege ? 4 : 100
  const placeholderVal = isCollege ? '3.75' : '85.50'

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [progs, apps, akad] = await Promise.all([
        getPrograms(),
        getUserApplications(),
        getBiodataAkademik().catch(() => null)
      ])
      setPrograms(progs)
      setApplications(apps)
      setAkademik(akad)
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat data.' })
    } finally {
      setLoading(false)
    }
  }

  function openForm(program: ScholarshipProgram) {
    setSelectedProgram(program)
    setShowForm(true)
    setMessage(null)
    setIpk(akademik?.ipk_nilai ? String(akademik.ipk_nilai) : '')
    setEsai('')
    setPrestasi('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProgram) return

    setSubmitting(true)
    setMessage(null)

    try {
      await createApplication({
        program_id: selectedProgram.id,
        ipk: Number(ipk),
        esai_motivasi: esai,
        prestasi_non_akademik: prestasi || undefined,
      })

      setMessage({ type: 'success', text: 'Pengajuan beasiswa berhasil dikirim!' })
      setShowForm(false)
      await loadData()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengirim pengajuan.' })
    } finally {
      setSubmitting(false)
    }
  }

  function hasApplied(programId: string): boolean {
    return applications.some((app) => app.program_id === programId)
  }

  function getStatusColor(status: Application['status']): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'TERVERIFIKASI': return 'bg-blue-100 text-blue-800'
      case 'DITERIMA': return 'bg-green-100 text-green-800'
      case 'DITOLAK': return 'bg-red-100 text-red-800'
      case 'REVISI': return 'bg-orange-100 text-orange-800'
      case 'CADANGAN': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary mb-2">Pengajuan Beasiswa</h1>
      <p className="text-gray-500 mb-6">Pilih program beasiswa dan ajukan lamaran kamu.</p>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* My Applications */}
      {applications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-primary mb-4">Pengajuan Saya</h2>
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="bg-white shadow-md rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {app.scholarship_programs?.nama || 'Program Beasiswa'}
                  </p>
                  <p className="text-sm text-gray-500">
                    No. Ref: {app.nomor_referensi} &bull; {
                      app.scholarship_programs?.nama?.toLowerCase().includes('perguruan') ||
                      app.scholarship_programs?.nama?.toLowerCase().includes('mahasiswa') ||
                      app.scholarship_programs?.nama?.toLowerCase().includes('tinggi')
                        ? 'IPK'
                        : 'Nilai rata-rata'
                    }: {app.ipk}
                  </p>
                  {app.catatan_admin && (
                    <p className="text-sm text-gray-600 mt-1 italic">
                      Catatan: {app.catatan_admin}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Form Modal */}
      {showForm && selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-primary">Ajukan Beasiswa</h2>
                <p className="text-sm text-gray-500">{selectedProgram.nama}</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="IPK / Nilai Rata-rata"
                type="number"
                step="0.01"
                min="0"
                max={maxVal}
                value={ipk}
                onChange={(e) => setIpk(e.target.value)}
                placeholder={placeholderVal}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Esai Motivasi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={esai}
                  onChange={(e) => setEsai(e.target.value)}
                  placeholder="Tuliskan motivasi kamu mengajukan beasiswa ini (min. 1000 karakter)..."
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  required
                  minLength={1000}
                />
                <p className="text-xs text-gray-400 mt-1">{esai.length}/1000 karakter minimum</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prestasi Non-Akademik (opsional)
                </label>
                <textarea
                  value={prestasi}
                  onChange={(e) => setPrestasi(e.target.value)}
                  placeholder="Sebutkan prestasi di luar akademik (organisasi, lomba, dll)..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              {message && message.type === 'error' && (
                <p className="text-sm text-red-600">{message.text}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Batal
                </Button>
                <Button type="submit" loading={submitting} className="flex-1">
                  Kirim Pengajuan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Available Programs */}
      <h2 className="text-lg font-semibold text-primary mb-4">Program Beasiswa Tersedia</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((program) => (
          <Card key={program.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-primary">{program.nama}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    program.status === 'aktif'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {program.status === 'aktif' ? 'Buka' : 'Ditutup'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{program.deskripsi}</p>
              <div className="text-sm space-y-1 text-gray-500">
                <p>💰 {program.nominal}</p>
                <p>📅 Deadline: {new Date(program.deadline).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                <p>👥 Sisa kuota: {program.sisa_kuota} / {program.kuota}</p>
              </div>
            </div>
            <div className="mt-4">
              {hasApplied(program.id) ? (
                <Button variant="ghost" disabled className="w-full">
                  ✓ Sudah Diajukan
                </Button>
              ) : !isProgramMatching(program.nama) ? (
                <Button variant="ghost" disabled className="w-full">
                  Tidak Sesuai Jenjang
                </Button>
              ) : applications.length > 0 ? (
                <Button variant="ghost" disabled className="w-full">
                  Tidak Tersedia (Sudah Mengajukan Beasiswa)
                </Button>
              ) : program.status === 'aktif' && program.sisa_kuota > 0 && new Date(program.deadline) >= new Date(new Date().setHours(0, 0, 0, 0)) ? (
                <Button variant="secondary" onClick={() => openForm(program)} className="w-full">
                  Ajukan Sekarang
                </Button>
              ) : (
                <Button variant="ghost" disabled className="w-full">
                  Tidak Tersedia
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {programs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Belum ada program beasiswa tersedia.</p>
        </div>
      )}
    </section>
  )
}

export default PengajuanPage
