import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getProfile,
  updateProfile,
  type ProfilePribadi,
  type ProfileAlamat,
  type ProfileOrangTua,
  type ProfileAkademik,
} from '../services/biodata'

// ============ SHARED FIELD ============

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
} & React.InputHTMLAttributes<HTMLInputElement>) {
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

// ============ SECTION CARDS ============

function SectionCard({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-7">
      <div className="flex items-center gap-3 mb-6">
        <span className={`w-1.5 h-7 rounded-full ${accent}`} />
        <h2 className="text-xl font-bold text-primary">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ============ FORM PRIBADI ============

function FormPribadi({ data, onChange }: { data: ProfilePribadi; onChange: (d: ProfilePribadi) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Field label="Nama Lengkap" value={data.nama_lengkap} onChange={(v) => onChange({ ...data, nama_lengkap: v })} placeholder="Budi Santoso" />
      <Field label="NIM / NISN" value={data.nim_nisn} onChange={(v) => onChange({ ...data, nim_nisn: v })} placeholder="12345678" />
      <Field label="Email" type="email" value={data.email} onChange={(v) => onChange({ ...data, email: v })} placeholder="budi@email.com" />
      <Field label="Nomor HP" value={data.nomor_hp} onChange={(v) => onChange({ ...data, nomor_hp: v })} placeholder="08123456789" />
      <Field label="Tempat Lahir" value={data.tempat_lahir || ''} onChange={(v) => onChange({ ...data, tempat_lahir: v })} placeholder="Jakarta" />
      <Field label="Tanggal Lahir" type="date" value={data.tanggal_lahir || ''} onChange={(v) => onChange({ ...data, tanggal_lahir: v })} />
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenis Kelamin</label>
        <ToggleGroup
          options={['Laki-laki', 'Perempuan']}
          value={data.jenis_kelamin || 'Laki-laki'}
          onChange={(v) => onChange({ ...data, jenis_kelamin: v })}
        />
      </div>
      <Field label="Agama" value={data.agama || ''} onChange={(v) => onChange({ ...data, agama: v })} placeholder="Islam" />
    </div>
  )
}

// ============ FORM ALAMAT ============

function FormAlamat({ data, onChange }: { data: ProfileAlamat; onChange: (d: ProfileAlamat) => void }) {
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
        <Field label="RT / RW" value={data.rt_rw || ''} onChange={(v) => onChange({ ...data, rt_rw: v })} placeholder="001/002" />
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

// ============ FORM ORANG TUA ============

function FormOrangTua({ data, onChange }: { data: ProfileOrangTua; onChange: (d: ProfileOrangTua) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-4">AYAH</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Nama Ayah" value={data.ayah_nama} onChange={(v) => onChange({ ...data, ayah_nama: v })} placeholder="Nama lengkap ayah" />
          <Field label="Pekerjaan" value={data.ayah_pekerjaan} onChange={(v) => onChange({ ...data, ayah_pekerjaan: v })} placeholder="Wiraswasta" />
        </div>
        <div className="mt-5">
          <Field label="Penghasilan Bulanan" type="number" value={data.ayah_penghasilan ? String(data.ayah_penghasilan) : ''} onChange={(v) => onChange({ ...data, ayah_penghasilan: Number(v) })} placeholder="3000000" />
        </div>
      </div>
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-4">IBU</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Nama Ibu" value={data.ibu_nama} onChange={(v) => onChange({ ...data, ibu_nama: v })} placeholder="Nama lengkap ibu" />
          <Field label="Pekerjaan" value={data.ibu_pekerjaan} onChange={(v) => onChange({ ...data, ibu_pekerjaan: v })} placeholder="Ibu Rumah Tangga" />
        </div>
        <div className="mt-5">
          <Field label="Penghasilan Bulanan" type="number" value={data.ibu_penghasilan ? String(data.ibu_penghasilan) : ''} onChange={(v) => onChange({ ...data, ibu_penghasilan: Number(v) })} placeholder="0" />
        </div>
      </div>
    </div>
  )
}

// ============ FORM AKADEMIK ============

function FormAkademik({ data, onChange }: { data: ProfileAkademik; onChange: (d: ProfileAkademik) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenjang Pendidikan</label>
        <ToggleGroup
          options={['SMA/SMK/MA', 'Perguruan Tinggi']}
          value={data.jenjang === 'Perguruan Tinggi' ? 'Perguruan Tinggi' : 'SMA/SMK/MA'}
          onChange={(v) => onChange({ ...data, jenjang: v })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Nama Sekolah / Universitas" value={data.asal_institusi} onChange={(v) => onChange({ ...data, asal_institusi: v })} placeholder="Universitas Sebelas Maret" />
        <Field label="Jurusan / Program Studi" value={data.program_studi} onChange={(v) => onChange({ ...data, program_studi: v })} placeholder="Informatika" />
      </div>
      <div className="md:w-1/2">
        <Field label="Nilai Rata-rata / IPK" type="number" step="0.01" min="0" max="4" value={data.ipk_nilai ? String(data.ipk_nilai) : ''} onChange={(v) => onChange({ ...data, ipk_nilai: Number(v) })} placeholder="3.75" />
      </div>
    </div>
  )
}

// ============ MAIN PAGE ============

function BiodataPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [pribadi, setPribadi] = useState<ProfilePribadi>({
    nama_lengkap: '', nim_nisn: '', email: '', nomor_hp: '',
    tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki', agama: '',
  })
  const [alamat, setAlamat] = useState<ProfileAlamat>({
    alamat: '', rt_rw: '', kelurahan: '', provinsi: '', kota: '', kecamatan: '', kode_pos: '',
  })
  const [orangTua, setOrangTua] = useState<ProfileOrangTua>({
    ayah_nama: '', ayah_pekerjaan: '', ayah_penghasilan: 0,
    ibu_nama: '', ibu_pekerjaan: '', ibu_penghasilan: 0,
  })
  const [akademik, setAkademik] = useState<ProfileAkademik>({
    jenjang: 'SMA/SMK/MA', asal_institusi: '', program_studi: '', ipk_nilai: 0,
  })

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      const profile = await getProfile()
      const pd = profile.profile_data

      if (pd?.pribadi) {
        setPribadi({ jenis_kelamin: 'Laki-laki', ...pd.pribadi })
      } else if (user) {
        setPribadi((p) => ({ ...p, nama_lengkap: user.nama_lengkap || '', nim_nisn: user.nim_nisn || '', email: user.email || '' }))
      }
      if (pd?.alamat) setAlamat(pd.alamat)
      if (pd?.orang_tua) setOrangTua(pd.orang_tua)
      if (pd?.akademik) setAkademik({ jenjang: 'SMA/SMK/MA', ...pd.akademik })

      setProgress(profile.biodata_progress)
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat profil.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const result = await updateProfile({ pribadi, alamat, orang_tua: orangTua, akademik })
      setProgress(result.biodata_progress)
      setMessage({ type: 'success', text: 'Profil berhasil disimpan!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan profil.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-1/3" />
        <div className="h-80 bg-gray-200 rounded-2xl" />
        <div className="h-80 bg-gray-200 rounded-2xl" />
        <div className="h-80 bg-gray-200 rounded-2xl" />
        <div className="h-80 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <span className="inline-block bg-secondary text-primary text-xs font-medium px-3 py-1 rounded-full mb-2">
          Profil Saya
        </span>
        <h1 className="text-3xl font-bold text-primary">Lengkapi Biodata</h1>
        <p className="text-gray-500 text-sm mt-1">
          Isi data diri kamu dengan lengkap dan benar untuk mempermudah proses seleksi.
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-primary">Kelengkapan Biodata</span>
          <span className="text-sm text-gray-500">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        {progress < 100 && (
          <p className="text-xs text-red-500 mt-2">Lengkapi semua bagian sebelum mengajukan beasiswa.</p>
        )}
      </div>

      {/* Toast */}
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Forms */}
      <SectionCard title="Informasi Pribadi" accent="bg-teal-500">
        <FormPribadi data={pribadi} onChange={setPribadi} />
      </SectionCard>

      <SectionCard title="Alamat Domisili" accent="bg-red-500">
        <FormAlamat data={alamat} onChange={setAlamat} />
      </SectionCard>

      <SectionCard title="Data Orang Tua / Wali" accent="bg-pink-500">
        <FormOrangTua data={orangTua} onChange={setOrangTua} />
      </SectionCard>

      <SectionCard title="Data Pendidikan" accent="bg-green-500">
        <FormAkademik data={akademik} onChange={setAkademik} />
      </SectionCard>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8 pb-8">
        <button type="button" onClick={() => navigate('/dashboard')} className="text-sm font-medium text-gray-600 hover:text-gray-800 transition">
          Batal
        </button>
        <button type="button" onClick={handleSave} disabled={saving} className="bg-primary text-secondary px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-light transition disabled:opacity-50 flex items-center gap-2">
          {saving && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
          Simpan Biodata
        </button>
      </div>
    </div>
  )
}

export default BiodataPage
