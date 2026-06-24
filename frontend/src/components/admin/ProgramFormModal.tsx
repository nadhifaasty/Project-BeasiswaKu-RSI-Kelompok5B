import { useState, type FormEvent } from 'react'
import {
  createProgramAdmin,
  updateProgramAdmin,
  saveProgramAsDraft,
  updateProgramStatusAdmin,
  type ScholarshipProgram,
} from '../../services/scholarship'

interface ProgramFormModalProps {
  initialData: ScholarshipProgram | null
  onClose: () => void
  onSuccess: (programName: string, isEdit: boolean, isDraft?: boolean) => void
}

export function ProgramFormModal({ initialData, onClose, onSuccess }: ProgramFormModalProps) {
  const isDraftEdit = initialData?.status === 'DRAFT'
  const isClosedEdit = initialData?.status === 'ditutup' || initialData?.status === 'CLOSED'

  const [form, setForm] = useState({
    name: initialData?.nama || '',
    target_level: initialData?.target_level || '',
    nominal: initialData?.nominal?.toString() || '',
    quota: initialData?.kuota?.toString() || '',
    deadline: initialData?.deadline ? initialData.deadline.split('T')[0] : '',
    description: initialData?.deskripsi || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Normal save: create new active program, or update closed program data
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = {
        name: form.name,
        target_level: form.target_level as 'SMA' | 'PERGURUAN_TINGGI',
        nominal: Number(form.nominal),
        quota: Number(form.quota),
        deadline: form.deadline,
        description: form.description,
      }

      if (initialData) {
        await updateProgramAdmin(initialData.id, payload)
      } else {
        await createProgramAdmin(payload)
      }
      onSuccess(form.name, !!initialData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setSaving(false)
    }
  }

  // Save as draft: allow partial data, send all values including empty strings
  const handleSaveDraft = async () => {
    setSaving(true)
    setError(null)

    try {
      if (initialData) {
        // Send all field values so clearing a field persists.
        // Empty nominal/quota → 0 (allowed for draft), empty deadline → undefined (no update)
        await updateProgramAdmin(initialData.id, {
          name: form.name,
          target_level: form.target_level ? (form.target_level as 'SMA' | 'PERGURUAN_TINGGI') : undefined,
          nominal: form.nominal !== '' ? Number(form.nominal) : 0,
          quota: form.quota !== '' ? Number(form.quota) : 0,
          deadline: form.deadline || undefined,
          description: form.description,
        })
      } else {
        await saveProgramAsDraft({
          name: form.name || undefined,
          target_level: form.target_level ? (form.target_level as 'SMA' | 'PERGURUAN_TINGGI') : undefined,
          nominal: form.nominal ? Number(form.nominal) : undefined,
          quota: form.quota ? Number(form.quota) : undefined,
          deadline: form.deadline || undefined,
          description: form.description || undefined,
          status: 'DRAFT',
        })
      }
      onSuccess(form.name || 'Draf Program', !!initialData, true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setSaving(false)
    }
  }

  // Activate: validate ALL fields required, save, then set status aktif (only for DRAFT)
  const handleActivate = async () => {
    if (!form.name) { setError('Nama program wajib diisi.'); return }
    if (!form.target_level) { setError('Level target wajib diisi.'); return }
    if (!form.nominal || Number(form.nominal) <= 0) { setError('Nominal beasiswa wajib diisi.'); return }
    if (!form.quota || Number(form.quota) <= 0) { setError('Jumlah lolos wajib diisi.'); return }
    if (!form.deadline) { setError('Deadline wajib diisi.'); return }
    if (new Date(form.deadline) <= new Date()) { setError('Deadline harus setelah hari ini.'); return }
    if (!form.description.trim()) { setError('Deskripsi wajib diisi.'); return }
    if (!initialData) return

    setSaving(true)
    setError(null)

    try {
      await updateProgramAdmin(initialData.id, {
        name: form.name,
        target_level: form.target_level ? (form.target_level as 'SMA' | 'PERGURUAN_TINGGI') : undefined,
        nominal: Number(form.nominal),
        quota: Number(form.quota),
        deadline: form.deadline,
        description: form.description || undefined,
      })
      await updateProgramStatusAdmin(initialData.id, 'aktif')
      onSuccess(form.name, true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Program Beasiswa' : 'Tambah Program Baru'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isDraftEdit && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-3 py-2 rounded-lg">
              Program ini masih berstatus draf. Lengkapi informasi untuk mengaktifkannya.
            </div>
          )}
          {isClosedEdit && (
            <div className="bg-slate-50 border border-slate-200 text-slate-700 text-sm px-3 py-2 rounded-lg">
              Program ini sudah ditutup. Data masih bisa diedit namun program tidak dapat diaktifkan kembali.
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Program {!isDraftEdit && '*'}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!isDraftEdit}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level Target {!isDraftEdit && '*'}
              </label>
              <select
                value={form.target_level}
                onChange={(e) => setForm({ ...form, target_level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!isDraftEdit}
              >
                <option value="">Pilih Level</option>
                <option value="SMA">SMA</option>
                <option value="PERGURUAN_TINGGI">Perguruan Tinggi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nominal / Bulan (Rp) {!isDraftEdit && '*'}
              </label>
              <input
                type="number"
                value={form.nominal}
                onChange={(e) => setForm({ ...form, nominal: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!isDraftEdit}
                min="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kuota {!isDraftEdit && '*'}
              </label>
              <input
                type="number"
                value={form.quota}
                onChange={(e) => setForm({ ...form, quota: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!isDraftEdit}
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline {!isDraftEdit && '*'}
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!isDraftEdit}
              />
              {!form.deadline && (
                <p className="text-xs text-gray-400 mt-1">Format: dd/mm/yyyy</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>

            {isDraftEdit ? (
              // Editing a DRAFT: Simpan sebagai Draf + Aktifkan Program
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan sebagai Draf'}
                </button>
                <button
                  type="button"
                  onClick={handleActivate}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Memproses...' : 'Aktifkan Program'}
                </button>
              </>
            ) : isClosedEdit ? (
              // Editing a CLOSED program: only Simpan Perubahan (no reactivation)
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            ) : (
              // Creating a NEW program: Simpan sebagai Draf + Buat Program
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan sebagai Draf'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Buat Program'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}