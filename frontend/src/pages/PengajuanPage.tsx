import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input } from '../components'
import {
  getPrograms,
  createApplication,
  submitApplication,
  type ScholarshipProgram,
} from '../services/scholarship'
import { getBiodataAkademik, getBiodataStatus } from '../services/biodata'
import { fetchApi } from '../services/api'

// ============ TYPES ============
type DocumentType = 'foto' | 'ktp' | 'kartu_keluarga' | 'transkrip' | 'sktm' | 'sertifikat_prestasi'

interface DocTypeConfig {
  jenis: DocumentType
  label: string
  desc: string
  required: boolean
}

const DOCUMENT_TYPES: DocTypeConfig[] = [
  { jenis: 'foto', label: 'Foto 3x4 Terbaru', desc: 'PNG • Maks 2MB', required: true },
  { jenis: 'ktp', label: 'KTP / Kartu Pelajar', desc: 'PDF/PNG • Maks 5MB', required: true },
  { jenis: 'kartu_keluarga', label: 'Kartu Keluarga', desc: 'PDF/PNG • Maks 5MB', required: true },
  { jenis: 'transkrip', label: 'Transkrip Nilai / Rapor', desc: 'PDF • Maks 10MB', required: true },
  { jenis: 'sktm', label: 'SKTM (Surat Ket. Tidak Mampu)', desc: 'PDF/PNG • Maks 5MB', required: true },
  { jenis: 'sertifikat_prestasi', label: 'Sertifikat Prestasi', desc: 'PDF/PNG • Maks 5MB', required: false },
]

interface DocumentState {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'failed'
  path?: string
  error?: string
}

function PengajuanPage() {
  const navigate = useNavigate()
  
  // Step State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)

  // Step 1: Program
  const [programs, setPrograms] = useState<ScholarshipProgram[]>([])
  const [selectedProgram, setSelectedProgram] = useState<ScholarshipProgram | null>(null)
  
  // Profile Data
  const [ipk, setIpk] = useState('')
  const [jenjang, setJenjang] = useState('')

  // Step 2: Form Data
  const [peringkatKelas, setPeringkatKelas] = useState('')
  const [riwayatPrestasiAkademik, setRiwayatPrestasiAkademik] = useState('')
  const [essay1, setEssay1] = useState('')
  const [essay2, setEssay2] = useState('')
  
  const [prestasiNonAkademik, setPrestasiNonAkademik] = useState<Array<{nama: string; tingkat: string; tahun: string}>>([])
  const [newPrestasi, setNewPrestasi] = useState({ nama: '', tingkat: 'Nasional', tahun: new Date().getFullYear().toString() })

  // Step 3: Documents
  const [documents, setDocuments] = useState<Partial<Record<DocumentType, DocumentState>>>({})

  // Step 4: Confirmation
  const [agreementChecked, setAgreementChecked] = useState(false)

  const studentIsCollege = jenjang?.toLowerCase().includes('perguruan') || jenjang?.toUpperCase() === 'PERGURUAN_TINGGI'

  useEffect(() => {
    loadInitialData()
  }, [])

  async function loadInitialData() {
    try {
      setLoading(true)
      const [progs, akad] = await Promise.all([
        getPrograms(),
        getBiodataAkademik().catch(() => null)
      ])
      setPrograms(progs)
      if (akad) {
        setIpk(String(akad.ipk_nilai))
        setJenjang(akad.jenjang)
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat data.' })
    } finally {
      setLoading(false)
    }
  }

  // ============ STEP 1 ============
  async function handleSelectProgram(program: ScholarshipProgram) {
    setMessage(null)
    try {
      const statusRes = await getBiodataStatus()
      if (statusRes.completion_pct < 100) {
        setMessage({ type: 'error', text: 'ERR-PROF-01: Profil belum 100% lengkap. Harap lengkapi semua data biodata sebelum mengajukan beasiswa.' })
        return
      }

      if (program.sisa_kuota <= 0) {
        setMessage({ type: 'error', text: 'ERR-APP-02: Kuota program ini telah habis.' })
        return
      }

      setSelectedProgram(program)
      setCurrentStep(2)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengecek status profil.' })
    }
  }

  // ============ STEP 2 ============
  function addPrestasi() {
    if (!newPrestasi.nama) return
    setPrestasiNonAkademik([...prestasiNonAkademik, newPrestasi])
    setNewPrestasi({ nama: '', tingkat: 'Nasional', tahun: new Date().getFullYear().toString() })
  }

  function removePrestasi(idx: number) {
    setPrestasiNonAkademik(prestasiNonAkademik.filter((_, i) => i !== idx))
  }

  function handleLanjutKeDokumen() {
    if (essay1.length < 1000) {
      setMessage({ type: 'error', text: `ERR-APP-04: Esai motivasi minimal 1.000 karakter. Saat ini: ${essay1.length} karakter.` })
      return
    }
    setMessage(null)
    setCurrentStep(3)
  }

  // ============ STEP 3 ============
  function validateFile(file: File, type: DocumentType): { valid: boolean; error?: string } {
    const rules: Record<DocumentType, { maxSize: number, allowedTypes: string[] }> = {
      foto: { maxSize: 2 * 1024 * 1024, allowedTypes: ['image/png'] },
      ktp: { maxSize: 5 * 1024 * 1024, allowedTypes: ['application/pdf', 'image/png'] },
      kartu_keluarga: { maxSize: 5 * 1024 * 1024, allowedTypes: ['application/pdf', 'image/png'] },
      transkrip: { maxSize: 10 * 1024 * 1024, allowedTypes: ['application/pdf'] },
      sktm: { maxSize: 5 * 1024 * 1024, allowedTypes: ['application/pdf', 'image/png'] },
      sertifikat_prestasi: { maxSize: 5 * 1024 * 1024, allowedTypes: ['application/pdf', 'image/png'] }
    }
    const rule = rules[type]

    if (file.size > rule.maxSize) {
      return { valid: false, error: `ERR-DOC-02: Ukuran file melebihi batas ${rule.maxSize / 1024 / 1024} MB.` }
    }

    if (!rule.allowedTypes.includes(file.type)) {
      const friendlyTypes = rule.allowedTypes.map(t => t === 'application/pdf' ? 'PDF' : t === 'image/jpeg' ? 'JPG' : 'PNG').join('/')
      return { valid: false, error: `ERR-DOC-01: Format file tidak didukung. Hanya format ${friendlyTypes} yang diizinkan.` }
    }

    return { valid: true }
  }

  function handleFileSelect(file: File, type: DocumentType) {
    const validation = validateFile(file, type)
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error! })
      return
    }
    setMessage(null)
    setDocuments(prev => ({ ...prev, [type]: { file, status: 'pending' } }))
  }

  async function uploadSingleDocument(appId: string, type: DocumentType, file: File) {
    setDocuments(prev => ({ ...prev, [type]: { ...prev[type]!, status: 'uploading' } }))
    try {
      const uploadUrlRes = await fetchApi<any>('/documents/upload-url', {
        method: 'POST',
        body: JSON.stringify({ application_id: appId, jenis: type, file_name: file.name }),
      })
      const { signedUrl, publicUrl } = uploadUrlRes.data

      const storageRes = await fetch(signedUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
      if (!storageRes.ok) throw new Error('ERR-DOC-05: Upload gagal karena koneksi terputus.')

      await fetchApi<any>('/documents', {
        method: 'POST',
        body: JSON.stringify({ application_id: appId, jenis: type, file_url: publicUrl }),
      })

      setDocuments(prev => ({ ...prev, [type]: { file, status: 'success', path: publicUrl } }))
      return true
    } catch (err: any) {
      setDocuments(prev => ({ ...prev, [type]: { file, status: 'failed', error: err.message } }))
      return false
    }
  }

  async function handleUploadAndLanjut() {
    setMessage(null)
    
    // Check required docs
    const missing = DOCUMENT_TYPES.filter(d => d.required && !documents[d.jenis])
    if (missing.length > 0) {
      setMessage({ type: 'error', text: `ERR-DOC-04: Dokumen ${missing.map(m => m.label).join(', ')} belum diunggah.` })
      return
    }

    setIsSubmitting(true)
    try {
      let currentAppId = applicationId

      if (!currentAppId) {
        const dataAkademik = {
          peringkat_kelas: peringkatKelas,
          riwayat_prestasi_akademik: riwayatPrestasiAkademik
        }

        const draft = await createApplication({
          program_id: selectedProgram!.id,
          ipk: Number(ipk),
          status: 'DRAFT',
          data_akademik: JSON.stringify(dataAkademik),
          prestasi_non_akademik: JSON.stringify(prestasiNonAkademik),
          esai_motivasi: `ESAI MOTIVASI:\n${essay1}\n\nRENCANA PASCA PENERIMAAN:\n${essay2}`
        })
        currentAppId = draft.id
        setApplicationId(currentAppId)
      }

      // Upload all pending docs
      const uploadPromises = Object.entries(documents).map(async ([type, doc]) => {
        if (doc.status === 'pending' || doc.status === 'failed') {
          return uploadSingleDocument(currentAppId as string, type as DocumentType, doc.file)
        }
        return true
      })

      const results = await Promise.all(uploadPromises)
      if (results.every(r => r === true)) {
        setCurrentStep(4)
      } else {
        setMessage({ type: 'error', text: 'ERR-DOC-05: Beberapa file gagal diunggah. Silakan coba unggah ulang.' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal membuat DRAFT pengajuan.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============ STEP 4 ============
  async function handleFinalSubmit() {
    if (!agreementChecked) {
      setMessage({ type: 'error', text: 'ERR-APP-06: Anda harus menyetujui pernyataan keabsahan data.' })
      return
    }
    
    setIsSubmitting(true)
    setMessage(null)
    try {
      const result = await submitApplication(applicationId!)
      setMessage({ type: 'success', text: `Pengajuan ${result.nomor_referensi} berhasil dikirim!` })
      // Navigate to success or status (using Step 5 as success indicator for now)
      setCurrentStep(5 as any)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengirim pengajuan akhir.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============ RENDER ============
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>
    )
  }

  // Success Step (5)
  if (currentStep === 5 as any) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-500">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-primary">Pengajuan Berhasil Dikirim!</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Terima kasih telah mendaftar. Pengajuan kamu sedang dalam proses verifikasi oleh tim administrator.
        </p>
        <div className="mt-8">
          <Button onClick={() => navigate('/dashboard')}>Kembali ke Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Pengajuan Beasiswa Baru</h1>
        <p className="text-gray-500 mt-2">Ikuti langkah-langkah di bawah untuk mengajukan beasiswa.</p>
        
        {/* Stepper Header */}
        <div className="flex items-center justify-center mt-8 space-x-4">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= step ? 'bg-primary text-secondary' : 'bg-gray-200 text-gray-500'}`}>
                {currentStep > step ? '✓' : step}
              </div>
              {step < 4 && <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-primary' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {currentStep === 1 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map((program) => {
              const isMatch = studentIsCollege === (program.nama.toLowerCase().includes('perguruan') || program.nama.toLowerCase().includes('tinggi') || program.nama.toLowerCase().includes('mahasiswa'))
              
              return (
                <Card key={program.id} className="flex flex-col justify-between">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-primary">
                      {program.nama.includes('SMA') ? '🏫' : '🎓'}
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-1">{program.nama}</h3>
                    <p className="text-sm text-gray-500 mb-6">{program.deskripsi}</p>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Nominal Beasiswa</span>
                        <span className="font-semibold">{program.nominal}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Sisa Kuota</span>
                        <span className="font-semibold">{program.sisa_kuota} Penerima</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Batas Pendaftaran</span>
                        <span className="font-semibold text-red-600">
                          {new Date(program.deadline).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-b-xl flex justify-end">
                    <Button 
                      variant="primary" 
                      onClick={() => handleSelectProgram(program)}
                      disabled={!isMatch || program.sisa_kuota <= 0 || program.status !== 'aktif'}
                    >
                      {program.sisa_kuota <= 0 ? 'Kuota Habis' : !isMatch ? 'Tidak Sesuai Jenjang' : 'Pilih Program →'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
              📄 Data Kelayakan Akademik
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Nilai Rata-rata / IPK Terakhir *"
                value={ipk}
                disabled
              />
              <Input
                label="Peringkat Kelas (Opsional)"
                placeholder="Contoh: 1 dari 40"
                value={peringkatKelas}
                onChange={e => setPeringkatKelas(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Riwayat Prestasi Akademik</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-accent"
                rows={3}
                placeholder="Tuliskan prestasi yang pernah diraih..."
                value={riwayatPrestasiAkademik}
                onChange={e => setRiwayatPrestasiAkademik(e.target.value)}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
              🏆 Esai Motivasi
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mengapa kamu layak menerima beasiswa ini? *</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-accent"
                  rows={6}
                  placeholder="Minimal 1000 karakter..."
                  value={essay1}
                  onChange={e => setEssay1(e.target.value)}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  Karakter: <span className={essay1.length < 1000 ? 'text-red-500' : 'text-green-600 font-bold'}>{essay1.length}</span> / 1000 min
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apa rencana kamu setelah menerima beasiswa ini?</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-accent"
                  rows={4}
                  placeholder="Ceritakan rencanamu ke depannya..."
                  value={essay2}
                  onChange={e => setEssay2(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">🎯 Prestasi Non-Akademik</h3>
            </div>
            {prestasiNonAkademik.length > 0 && (
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-3">Nama Prestasi</th>
                      <th className="p-3">Tingkat</th>
                      <th className="p-3">Tahun</th>
                      <th className="p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prestasiNonAkademik.map((p, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3">{p.nama}</td>
                        <td className="p-3">{p.tingkat}</td>
                        <td className="p-3">{p.tahun}</td>
                        <td className="p-3">
                          <button onClick={() => removePrestasi(i)} className="text-red-500 hover:text-red-700">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex gap-2 items-end bg-gray-50 p-4 rounded-lg">
              <div className="flex-1">
                <Input label="Nama Prestasi" value={newPrestasi.nama} onChange={e => setNewPrestasi({...newPrestasi, nama: e.target.value})} placeholder="Juara 1 Lomba Catur" />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tingkat</label>
                <select className="w-full border border-gray-300 rounded-lg p-2" value={newPrestasi.tingkat} onChange={e => setNewPrestasi({...newPrestasi, tingkat: e.target.value})}>
                  <option>Nasional</option>
                  <option>Provinsi</option>
                  <option>Kota/Kab</option>
                  <option>Sekolah</option>
                </select>
              </div>
              <div className="w-24">
                <Input label="Tahun" value={newPrestasi.tahun} onChange={e => setNewPrestasi({...newPrestasi, tahun: e.target.value})} type="number" />
              </div>
              <Button type="button" variant="outline" onClick={addPrestasi}>+ Tambah</Button>
            </div>
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setCurrentStep(1)}>← Kembali</Button>
            <Button variant="primary" onClick={handleLanjutKeDokumen}>Lanjut ke Dokumen →</Button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCUMENT_TYPES.map(docType => {
              const docState = documents[docType.jenis]
              return (
                <Card key={docType.jenis} className="p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 hover:border-primary transition">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                    {docState?.status === 'success' ? '✅' : docState?.status === 'uploading' ? '⏳' : '📄'}
                  </div>
                  <h4 className="font-bold text-gray-800">
                    {docType.label} {docType.required && <span className="text-red-500">*</span>}
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">{docType.desc}</p>
                  
                  {docState?.status === 'failed' && <p className="text-xs text-red-500 mb-2">{docState.error}</p>}
                  
                  {docState?.status === 'success' ? (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">Tersimpan</span>
                  ) : docState?.status === 'uploading' ? (
                    <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold animate-pulse">Mengunggah...</span>
                  ) : (
                    <label className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                      Pilih File
                      <input type="file" className="hidden" accept={docType.jenis === 'foto' ? 'image/png' : docType.jenis === 'transkrip' ? 'application/pdf' : 'application/pdf,image/png'} onChange={e => {
                        if (e.target.files?.[0]) handleFileSelect(e.target.files[0], docType.jenis)
                      }} />
                    </label>
                  )}
                  {docState?.file && docState.status === 'pending' && <p className="text-xs text-blue-600 mt-2 font-medium">{docState.file.name}</p>}
                </Card>
              )
            })}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setCurrentStep(2)}>← Kembali</Button>
            <Button variant="primary" onClick={handleUploadAndLanjut} loading={isSubmitting}>
              Review Pengajuan →
            </Button>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-primary">Ringkasan Pengajuan</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">Siap Dikirim</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informasi Dasar</h4>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-3"><span className="text-blue-400">Program</span><span className="col-span-2 font-bold text-gray-800 text-right">{selectedProgram?.nama}</span></div>
                  <div className="grid grid-cols-3"><span className="text-blue-400">Jenjang</span><span className="col-span-2 font-bold text-gray-800 text-right">{jenjang}</span></div>
                  <div className="grid grid-cols-3"><span className="text-blue-400">IPK / Nilai</span><span className="col-span-2 font-bold text-gray-800 text-right">{ipk}</span></div>
                  {peringkatKelas && <div className="grid grid-cols-3"><span className="text-blue-400">Peringkat</span><span className="col-span-2 font-bold text-gray-800 text-right">{peringkatKelas}</span></div>}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Status Dokumen</h4>
                <div className="space-y-2 text-sm">
                  {DOCUMENT_TYPES.map(doc => (
                    <div key={doc.jenis} className="flex items-center gap-2">
                      <span className={documents[doc.jenis]?.status === 'success' ? 'text-green-500' : doc.required ? 'text-red-500' : 'text-gray-300'}>
                        {documents[doc.jenis]?.status === 'success' ? '✅' : doc.required ? '❌' : '⚪'}
                      </span>
                      <span className="text-gray-600">{doc.label} {documents[doc.jenis]?.status === 'success' ? 'Berhasil diunggah' : doc.required ? 'Belum diunggah' : '(Opsional)'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-4 h-4 text-primary rounded" checked={agreementChecked} onChange={e => setAgreementChecked(e.target.checked)} />
                <span className="text-sm text-orange-800">
                  Saya menyatakan bahwa semua data dan dokumen yang saya berikan adalah benar dan sah. Saya bersedia menerima sanksi apabila di kemudian hari ditemukan ketidaksesuaian data.
                </span>
              </label>
            </div>
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setCurrentStep(3)}>← Revisi Dokumen</Button>
            <Button variant="primary" onClick={handleFinalSubmit} loading={isSubmitting} disabled={!agreementChecked}>
              Kirim Pengajuan
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

export default PengajuanPage
