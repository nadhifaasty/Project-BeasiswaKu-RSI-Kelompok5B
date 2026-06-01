import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getProfile,
  updateProfile,
  type ProfilePribadi as BiodataPribadi,
  type ProfileAlamat as BiodataAlamat,
  type ProfileOrangTua as BiodataOrangTua,
  type ProfileAkademik as BiodataAkademik,
} from '../services/biodata'

// ============ TAB DEFINITIONS ============

type TabId = 'pribadi' | 'alamat' | 'orang-tua' | 'akademik'

interface TabDef {
  id: TabId
  label: string
  accent: string // accent bar color for form card
  icon: React.ReactNode
}

const tabs: TabDef[] = [
  {
    id: 'pribadi',
    label: 'Data Pribadi',
    accent: 'bg-teal-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: 'alamat',
    label: 'Alamat',
    accent: 'bg-red-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    id: 'orang-tua',
    label: 'Orang Tua / Wali',
    accent: 'bg-pink-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    id: 'akademik',
    label: 'Akademik',
    accent: 'bg-green-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
]

// ============ SHARED FIELD COMPONENTS ============

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  ...rest
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        {...rest}
      />
    </div>
  )
}

function ToggleGroup({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex bg-secondary rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
            value === opt
              ? 'bg-primary text-secondary shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ============ MAIN PAGE ============

function BiodataPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('pribadi')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [pribadi, setPribadi] = useState<BiodataPribadi>({
    nama_lengkap: '', nim_nisn: '', email: '', nomor_hp: '',
    tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki', agama: '',
  })
  const [alamat, setAlamat] = useState<BiodataAlamat>({
    alamat: '', rt_rw: '', kelurahan: '', provinsi: '', kota: '', kecamatan: '', kode_pos: '',
  })
  const [orangTua, setOrangTua] = useState<BiodataOrangTua>({
    ayah_nama: '', ayah_pekerjaan: '', ayah_penghasilan: 0,
    ibu_nama: '', ibu_pekerjaan: '', ibu_penghasilan: 0,
  })
  const [akademik, setAkademik] = useState<BiodataAkademik>({
    jenjang: 'SMA/SMK/MA', asal_institusi: '', program_studi: '', ipk_nilai: 0,
  })

  const [filled, setFilled] = useState({
    pribadi: false, alamat: false, 'orang-tua': false, akademik: false,
  })

  useEffect(() => {
    loadBiodata()
  }, [])

  async function loadBiodata() {
    try {
      setLoading(true)
      const profile = await getProfile()
      const data = profile.profile_data || {}

      if (data.pribadi) {
        setPribadi({ jenis_kelamin: 'Laki-laki', ...data.pribadi })
        setFilled((f) => ({ ...f, pribadi: true }))
      } else if (user) {
        setPribadi((p) => ({
          ...p,
          nama_lengkap: user.nama_lengkap || '',
          nim_nisn: user.nim_nisn || '',
          email: user.email || '',
        }))
      }
      if (data.alamat) { setAlamat(data.alamat); setFilled((f) => ({ ...f, alamat: true })) }
      if (data.orang_tua) { setOrangTua(data.orang_tua); setFilled((f) => ({ ...f, 'orang-tua': true })) }
      if (data.akademik) { setAkademik({ ...data.akademik, jenjang: data.akademik.jenjang || 'SMA/SMK/MA' }); setFilled((f) => ({ ...f, akademik: true })) }
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat biodata.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const payload: any = {}
      if (activeTab === 'pribadi') payload.pribadi = pribadi
      if (activeTab === 'alamat') payload.alamat = alamat
      if (activeTab === 'orang-tua') payload.orang_tua = orangTua
      if (activeTab === 'akademik') payload.akademik = akademik
      
      await updateProfile(payload)
      
      setFilled((f) => ({ ...f, [activeTab]: true }))
      setMessage({ type: 'success', text: 'Data berhasil disimpan!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan data.' })
    } finally {
      setSaving(false)
    }
  }

  const filledCount = Object.values(filled).filter(Boolean).length
  const progress = filledCount * 25
  const activeTabDef = tabs.find((t) => t.id === activeTab)!

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-1/3" />
        <div className="h-16 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-3 gap-6">
          <div className="h-80 bg-gray-200 rounded-xl" />
          <div className="col-span-2 h-80 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <span className="inline-block bg-secondary text-primary text-xs font-medium px-3 py-1 rounded-full mb-2">
          Profil Saya
        </span>
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-primary">Lengkapi Biodata</h1>
            <p className="text-gray-500 text-sm mt-1">
              Isi data diri kamu dengan lengkap dan benar untuk mempermudah proses seleksi.
            </p>
          </div>
          <div className="text-right min-w-[200px]">
            <div className="flex items-center justify-end gap-2 mb-1.5">
              <span className="text-sm font-semibold text-primary">Biodata {progress}% lengkap</span>
              <span className="text-sm text-gray-400">{filledCount} / 4 Selesai</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Alert */}
      {progress < 100 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-sm text-red-700">Lengkapi biodata sebelum dapat mengajukan beasiswa.</p>
        </div>
      )}

      {/* Toast message */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Content: vertical tabs + form */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Vertical Tabs */}
        <div className="space-y-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const isDone = filled[tab.id]
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMessage(null) }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition ${
                  isActive
                    ? 'bg-white shadow-md'
                    : 'hover:bg-white/60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-primary text-secondary' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tab.icon}
                </div>
                <span className={`flex-1 text-sm font-semibold ${isActive ? 'text-primary' : 'text-gray-600'}`}>
                  {tab.label}
                </span>
                {isDone && <span className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            )
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md p-7 flex flex-col">
          <div className="flex-1">
            {/* Title with accent bar */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`w-1.5 h-7 rounded-full ${activeTabDef.accent}`} />
              <h2 className="text-xl font-bold text-primary">
                {activeTab === 'pribadi' && 'Informasi Pribadi'}
                {activeTab === 'alamat' && 'Alamat Domisili'}
                {activeTab === 'orang-tua' && 'Data Orang Tua / Wali'}
                {activeTab === 'akademik' && 'Data Pendidikan'}
              </h2>
            </div>

            {activeTab === 'pribadi' && <FormPribadi data={pribadi} onChange={setPribadi} />}
            {activeTab === 'alamat' && <FormAlamat data={alamat} onChange={setAlamat} />}
            {activeTab === 'orang-tua' && <FormOrangTua data={orangTua} onChange={setOrangTua} />}
            {activeTab === 'akademik' && <FormAkademik data={akademik} onChange={setAkademik} />}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-sm font-medium text-gray-600 hover:text-gray-800 transition"
            >
              Batal
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Simpan Draft
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-secondary px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-light transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ FORM SECTIONS ============

function FormPribadi({ data, onChange }: { data: BiodataPribadi; onChange: (d: BiodataPribadi) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Field label="Nama Lengkap" value={data.nama_lengkap} onChange={(v) => onChange({ ...data, nama_lengkap: v })} placeholder="Budi Santoso" />
      <Field label="NIM / NISN" value={data.nim_nisn} onChange={(v) => onChange({ ...data, nim_nisn: v })} placeholder="12345678" />
      <Field label="Tempat Lahir" value={data.tempat_lahir || ''} onChange={(v) => onChange({ ...data, tempat_lahir: v })} placeholder="Contoh: Jakarta" />
      <Field label="Tanggal Lahir" type="date" value={data.tanggal_lahir || ''} onChange={(v) => onChange({ ...data, tanggal_lahir: v })} />
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenis Kelamin</label>
        <ToggleGroup
          options={['Laki-laki', 'Perempuan']}
          value={data.jenis_kelamin || 'Laki-laki'}
          onChange={(v) => onChange({ ...data, jenis_kelamin: v })}
        />
      </div>
      <Field label="Agama" value={data.agama || ''} onChange={(v) => onChange({ ...data, agama: v })} placeholder="Contoh: Islam" />
    </div>
  )
}

function FormAlamat({ data, onChange }: { data: BiodataAlamat; onChange: (d: BiodataAlamat) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Lengkap</label>
        <textarea
          value={data.alamat}
          onChange={(e) => onChange({ ...data, alamat: e.target.value })}
          placeholder="Jl. Raya No. 123..."
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Field label="RT / RW" value={data.rt_rw || ''} onChange={(v) => onChange({ ...data, rt_rw: v })} placeholder="001 / 002" />
        <Field label="Kelurahan" value={data.kelurahan || ''} onChange={(v) => onChange({ ...data, kelurahan: v })} placeholder="Kelurahan" />
        <Field label="Kecamatan" value={data.kecamatan} onChange={(v) => onChange({ ...data, kecamatan: v })} placeholder="Kecamatan" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Field label="Kota / Kabupaten" value={data.kota} onChange={(v) => onChange({ ...data, kota: v })} placeholder="Surakarta" />
        <Field label="Provinsi" value={data.provinsi} onChange={(v) => onChange({ ...data, provinsi: v })} placeholder="Jawa Tengah" />
        <Field label="Kode Pos" value={data.kode_pos} onChange={(v) => onChange({ ...data, kode_pos: v })} placeholder="57126" />
      </div>
    </div>
  )
}

function FormOrangTua({ data, onChange }: { data: BiodataOrangTua; onChange: (d: BiodataOrangTua) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-4">AYAH</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Nama Ayah" value={data.ayah_nama} onChange={(v) => onChange({ ...data, ayah_nama: v })} placeholder="Nama lengkap ayah" />
          <Field label="Pekerjaan" value={data.ayah_pekerjaan} onChange={(v) => onChange({ ...data, ayah_pekerjaan: v })} placeholder="Wiraswasta" />
        </div>
        <div className="mt-5">
          <Field
            label="Penghasilan Bulanan"
            type="number"
            value={data.ayah_penghasilan ? String(data.ayah_penghasilan) : ''}
            onChange={(v) => onChange({ ...data, ayah_penghasilan: Number(v) })}
            placeholder="3000000"
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-4">IBU</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Nama Ibu" value={data.ibu_nama} onChange={(v) => onChange({ ...data, ibu_nama: v })} placeholder="Nama lengkap ibu" />
          <Field label="Pekerjaan" value={data.ibu_pekerjaan} onChange={(v) => onChange({ ...data, ibu_pekerjaan: v })} placeholder="Ibu Rumah Tangga" />
        </div>
        <div className="mt-5">
          <Field
            label="Penghasilan Bulanan"
            type="number"
            value={data.ibu_penghasilan ? String(data.ibu_penghasilan) : ''}
            onChange={(v) => onChange({ ...data, ibu_penghasilan: Number(v) })}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  )
}

function FormAkademik({ data, onChange }: { data: BiodataAkademik; onChange: (d: BiodataAkademik) => void }) {
  const isSMA = data.jenjang !== 'Perguruan Tinggi'

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenjang Pendidikan</label>
        <ToggleGroup
          options={['SMA/SMK/MA', 'Perguruan Tinggi']}
          value={isSMA ? 'SMA/SMK/MA' : 'Perguruan Tinggi'}
          onChange={(v) => onChange({ ...data, jenjang: v })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field
          label={isSMA ? 'Nama Sekolah' : 'Nama Universitas'}
          value={data.asal_institusi}
          onChange={(v) => onChange({ ...data, asal_institusi: v })}
          placeholder={isSMA ? 'SMA Negeri 1 Surakarta' : 'Universitas Sebelas Maret'}
        />
        <Field
          label={isSMA ? 'Jurusan' : 'Program Studi'}
          value={data.program_studi}
          onChange={(v) => onChange({ ...data, program_studi: v })}
          placeholder={isSMA ? 'IPA / IPS / Bahasa' : 'Informatika'}
        />
      </div>
      <div className="md:w-1/2">
        <Field
          label={isSMA ? 'Nilai Rata-rata Rapor' : 'IPK'}
          type="number"
          step="0.01"
          min="0"
          max={isSMA ? '100' : '4'}
          value={data.ipk_nilai ? String(data.ipk_nilai) : ''}
          onChange={(v) => onChange({ ...data, ipk_nilai: Number(v) })}
          placeholder={isSMA ? '85.50' : '3.75'}
        />
        <p className="text-xs text-gray-400 mt-1">
          {isSMA ? 'Skala 0 - 100 (nilai rata-rata rapor)' : 'Skala 0 - 4.00 (IPK)'}
        </p>
      </div>
    </div>
  )
}

export default BiodataPage
