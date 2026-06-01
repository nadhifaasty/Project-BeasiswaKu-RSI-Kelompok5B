import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getPrograms,
  getUserApplications,
  createApplication,
  type ScholarshipProgram,
  type Application,
} from '../services/scholarship'
import { fetchApi, type ApiResponse } from '../services/api'

// ============ TYPES ============

type Step = 1 | 2 | 3 | 4

interface WizardStep {
  id: Step
  label: string
}

const steps: WizardStep[] = [
  { id: 1, label: 'Program' },
  { id: 2, label: 'Formulir' },
  { id: 3, label: 'Berkas' },
  { id: 4, label: 'Review' },
]

type DocumentType = 'foto' | 'ktp' | 'kartu_keluarga' | 'transkrip' | 'sktm' | 'sertifikat_prestasi'

interface DocumentFile {
  jenis: DocumentType
  file: File | null
  label: string
}

const requiredDocs: DocumentFile[] = [
  { jenis: 'foto', file: null, label: 'Foto 3x4' },
  { jenis: 'ktp', file: null, label: 'KTP' },
  { jenis: 'kartu_keluarga', file: null, label: 'Kartu Keluarga' },
  { jenis: 'transkrip', file: null, label: 'Transkrip / Raport' },
  { jenis: 'sktm', file: null, label: 'Surat Keterangan Tidak Mampu' },
  { jenis: 'sertifikat_prestasi', file: null, label: 'Sertifikat Prestasi' },
]

// ============ MAIN PAGE ============

function PengajuanPage() {
  const navigate = useNavigate()
  const [programs, setPrograms] = useState<ScholarshipProgram[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Wizard state
  const [step, setStep] = useState<Step>(1)
  const [selectedProgram, setSelectedProgram] = useState<ScholarshipProgram | null>(null)

  // Step 2: Form
  const [ipk, setIpk] = useState('')
  const [esai, setEsai] = useState('')
  const [prestasi, setPrestasi] = useState('')

  // Step 3: Documents
  const [docs, setDocs] = useState<DocumentFile[]>(requiredDocs.map((d) => ({ ...d })))

  // Step 4: result
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [progs, apps] = await Promise.all([getPrograms(), getUserApplications()])
      setPrograms(progs)
      setApplications(apps)
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat data.' })
    } finally {
      setLoading(false)
    }
  }

  function hasApplied(programId: string): boolean {
    return applications.some((app) => app.program_id === programId)
  }

  function selectProgram(program: ScholarshipProgram) {
    setSelectedProgram(program)
    setStep(2)
    setMessage(null)
  }

  function canGoNext(): boolean {
    switch (step) {
      case 1: return !!selectedProgram
      case 2: return ipk.length > 0 && Number(ipk) > 0 && esai.length >= 100
      case 3: return docs.every((d) => d.file !== null)
      case 4: return true
    }
  }

  async function handleSubmit() {
    if (!selectedProgram) return

    setSubmitting(true)
    setMessage(null)

    try {
      // Create application
      const app = await createApplication({
        program_id: selectedProgram.id,
        ipk: Number(ipk),
        esai_motivasi: esai,
        prestasi_non_akademik: prestasi || undefined,
      })

      // Upload documents
      for (const doc of docs) {
        if (!doc.file) continue

        const uploadRes = await fetchApi<ApiResponse<{ signedUrl: string; publicUrl: string }>>(
          `/applications/${app.id}/documents/upload-url`,
          {
            method: 'POST',
            body: JSON.stringify({
              application_id: app.id,
              jenis: doc.jenis,
              file_name: doc.file.name,
            }),
          }
        )

        // Upload to Supabase Storage via signed URL
        await fetch(uploadRes.data!.signedUrl, {
          method: 'PUT',
          body: doc.file,
          headers: { 'Content-Type': doc.file.type },
        })

        // Save document record
        await fetchApi(`/applications/${app.id}/documents`, {
          method: 'POST',
          body: JSON.stringify({
            application_id: app.id,
            jenis: doc.jenis,
            file_url: uploadRes.data!.publicUrl,
          }),
        })
      }

      setSubmittedApp(app)
      setStep(4)
      setMessage({ type: 'success', text: 'Pengajuan berhasil dikirim!' })
      await loadData()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengirim pengajuan.' })
    } finally {
      setSubmitting(false)
    }
  }

  function resetWizard() {
    setStep(1)
    setSelectedProgram(null)
    setIpk('')
    setEsai('')
    setPrestasi('')
    setDocs(requiredDocs.map((d) => ({ ...d })))
    setSubmittedApp(null)
    setMessage(null)
  }

  // ============ RENDER HELPERS ============

  function renderStepIndicator() {
    return (
      <div className="flex items-center justify-center gap-0 mb-8">
        {steps.map((s, i) => {
          const isActive = step === s.id
          const isDone = step > s.id || (s.id === 4 && submittedApp)
          return (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                isActive ? 'bg-primary text-secondary' : isDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive ? 'bg-white/20 text-secondary' : isDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {isDone ? '✓' : s.id}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${isDone ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  function renderProgramList() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((program) => {
          const applied = hasApplied(program.id)
          return (
            <div key={program.id} className={`bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between transition ${!applied && program.status === 'aktif' && program.sisa_kuota > 0 ? 'hover:shadow-lg cursor-pointer' : 'opacity-75'}`}>
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-primary text-lg">{program.nama}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    program.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {program.status === 'aktif' ? 'Buka' : 'Ditutup'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{program.deskripsi}</p>
                <div className="text-sm space-y-1 text-gray-500">
                  <p>💰 Rp{program.monthly_amount.toLocaleString('id-ID')} / bulan</p>
                  <p>📅 Deadline: {new Date(program.deadline).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                  <p>👥 Sisa kuota: {program.sisa_kuota} / {program.kuota}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !applied && program.status === 'aktif' && program.sisa_kuota > 0 && selectProgram(program)}
                disabled={applied || program.status !== 'aktif' || program.sisa_kuota <= 0}
                className={`mt-4 w-full py-2.5 rounded-lg text-sm font-semibold transition ${
                  applied
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : program.status === 'aktif' && program.sisa_kuota > 0
                    ? 'bg-primary text-secondary hover:bg-primary-light'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {applied ? '✓ Sudah Diajukan' : program.status === 'aktif' && program.sisa_kuota > 0 ? 'Pilih Program' : 'Tidak Tersedia'}
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  function renderForm() {
    return (
      <div className="bg-white rounded-2xl shadow-md p-7 space-y-5">
        <h2 className="text-xl font-bold text-primary">Formulir Pengajuan</h2>
        <p className="text-sm text-gray-500">Isi data akademik dan motivasi kamu untuk program <strong>{selectedProgram?.nama}</strong>.</p>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">IPK / Nilai Rata-rata <span className="text-red-500">*</span></label>
          <input type="number" step="0.01" min="0" max="4" value={ipk} onChange={(e) => setIpk(e.target.value)} placeholder="3.75" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Esai Motivasi <span className="text-red-500">*</span></label>
          <textarea value={esai} onChange={(e) => setEsai(e.target.value)} placeholder="Tuliskan motivasi kamu mengajukan beasiswa ini (min. 100 karakter)..." rows={5} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none" />
          <p className={`text-xs mt-1 ${esai.length < 100 ? 'text-red-400' : 'text-green-500'}`}>{esai.length}/100 karakter</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prestasi Non-Akademik (opsional)</label>
          <textarea value={prestasi} onChange={(e) => setPrestasi(e.target.value)} placeholder="Sebutkan prestasi di luar akademik (organisasi, lomba, dll)..." rows={3} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none" />
        </div>
      </div>
    )
  }

  function handleFileChange(index: number, file: File | null) {
    const updated = [...docs]
    updated[index] = { ...updated[index], file }
    setDocs(updated)
  }

  function renderDocuments() {
    return (
      <div className="bg-white rounded-2xl shadow-md p-7 space-y-5">
        <h2 className="text-xl font-bold text-primary">Upload Berkas</h2>
        <p className="text-sm text-gray-500">Unggah semua dokumen yang diperlukan. Format: JPG, PNG, atau PDF (max 2MB).</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc, i) => (
            <div key={doc.jenis} className={`border-2 border-dashed rounded-xl p-4 transition ${doc.file ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-primary'}`}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{doc.label}</label>
              {doc.file ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">{doc.file.name}</span>
                  <button type="button" onClick={() => handleFileChange(i, null)} className="text-xs text-red-500 hover:text-red-700">Hapus</button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <span className="text-sm text-primary font-medium">Pilih File</span>
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => handleFileChange(i, e.target.files?.[0] || null)} />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  function renderReview() {
    if (submittedApp) {
      return (
        <div className="bg-white rounded-2xl shadow-md p-7 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-primary">Pengajuan Berhasil!</h2>
          <p className="text-gray-500">Nomor Referensi: <span className="font-semibold text-primary">{submittedApp.nomor_referensi}</span></p>
          <p className="text-sm text-gray-400">Status pengajuan kamu saat ini: <span className="font-semibold text-yellow-600">PENDING</span></p>
          <div className="flex justify-center gap-3 pt-4">
            <button type="button" onClick={() => navigate('/dashboard')} className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Ke Dashboard</button>
            <button type="button" onClick={resetWizard} className="bg-primary text-secondary px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-light transition">Ajukan Lagi</button>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-2xl shadow-md p-7 space-y-6">
        <h2 className="text-xl font-bold text-primary">Review Pengajuan</h2>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">PROGRAM</h3>
          <p className="font-medium">{selectedProgram?.nama}</p>
          <p className="text-sm text-gray-500">Rp{selectedProgram?.monthly_amount.toLocaleString('id-ID')} / bulan</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">DATA AKADEMIK</h3>
          <p className="text-sm">IPK: <span className="font-medium">{ipk}</span></p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">ESAI MOTIVASI</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{esai}</p>
        </div>

        {prestasi && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">PRESTASI NON-AKADEMIK</h3>
            <p className="text-sm text-gray-700">{prestasi}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">BERKAS ({docs.filter((d) => d.file).length}/6)</h3>
          <div className="flex flex-wrap gap-2">
            {docs.map((d) => (
              <span key={d.jenis} className={`text-xs px-2 py-1 rounded-full ${d.file ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {d.label} {d.file ? '✓' : '✗'}
              </span>
            ))}
          </div>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <button type="button" onClick={handleSubmit} disabled={submitting} className="w-full bg-primary text-secondary py-3 rounded-lg text-sm font-semibold hover:bg-primary-light transition disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
          {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
        </button>
      </div>
    )
  }

  // ============ RENDER ============

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary mb-1">Pengajuan Beasiswa</h1>
      <p className="text-gray-500 mb-6">Ajukan beasiswa dengan mengikuti langkah-langkah berikut.</p>

      {/* Existing applications alert */}
      {applications.length > 0 && step === 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
          <p className="text-sm text-blue-700">Kamu memiliki {applications.length} pengajuan aktif. Kamu dapat mengajukan lebih dari satu program.</p>
        </div>
      )}

      {step < 4 || submittedApp ? renderStepIndicator() : null}

      <div className="space-y-5">
        {step === 1 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Pilih Program Beasiswa</h2>
            </div>
            {programs.length > 0 ? renderProgramList() : (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center text-gray-500">
                <p className="text-lg">Belum ada program beasiswa tersedia.</p>
              </div>
            )}
          </>
        )}

        {step === 2 && renderForm()}
        {step === 3 && renderDocuments()}
        {step === 4 && renderReview()}
      </div>

      {/* Navigation */}
      {step >= 2 && step < 4 && (
        <div className="flex items-center justify-between mt-6 pb-8">
          <button type="button" onClick={() => { setStep((step - 1) as Step); setMessage(null) }} className="text-sm font-medium text-gray-600 hover:text-gray-800 transition">← Kembali</button>
          <button type="button" onClick={() => setStep((step + 1) as Step)} disabled={!canGoNext()} className="bg-primary text-secondary px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-light transition disabled:opacity-50">
            {step === 3 ? 'Review' : 'Lanjut'}
          </button>
        </div>
      )}
    </div>
  )
}

export default PengajuanPage
