import { useState, useEffect } from 'react'
import { createProgramAdmin, updateProgramAdmin, type CreateProgramPayload, type ScholarshipProgram } from '../../services/scholarship'

interface ProgramFormModalProps {
  initialData?: ScholarshipProgram | null
  onClose: () => void
  onSuccess: (programName: string, isEdit: boolean) => void
}

export function ProgramFormModal({ initialData, onClose, onSuccess }: ProgramFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const isEdit = !!initialData

  const [formData, setFormData] = useState<CreateProgramPayload>({
    name: initialData?.nama || '',
    target_level: (initialData?.nama.includes('SMA') ? 'SMA' : 'PERGURUAN_TINGGI') as any, // Simple inference since backend target_level isn't fully exposed
    nominal: initialData ? Number(initialData.nominal) : 0,
    quota: initialData?.kuota || 0,
    deadline: initialData ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
    description: initialData?.deskripsi || '',
    requirements: ''
  })

  // Better inference for target_level if possible
  useEffect(() => {
    if (initialData) {
      const level = initialData.nama.toLowerCase().includes('sma') ? 'SMA' : 'PERGURUAN_TINGGI'
      setFormData(prev => ({ ...prev, target_level: level }))
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nominal' || name === 'quota' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validasi frontend
    if (!formData.name) return setError('Nama program wajib diisi.')
    if (formData.nominal <= 0) return setError('Nominal harus lebih dari 0.')
    if (formData.quota <= 0) return setError('Kuota harus lebih dari 0.')
    if (!formData.deadline) return setError('Deadline wajib diisi.')
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineDate = new Date(formData.deadline)
    if (deadlineDate <= today) return setError('Deadline harus setelah hari ini.')

    try {
      setLoading(true)
      if (isEdit && initialData) {
        // Prepare payload, omitting name/quota/target_level if we don't want to change them (but backend update allows partial)
        const payload: Partial<CreateProgramPayload> = { ...formData }
        // We might want to selectively send fields, but sending all is fine as long as validation passes
        await updateProgramAdmin(initialData.id, payload)
        onSuccess(formData.name, true)
      } else {
        await createProgramAdmin(formData)
        onSuccess(formData.name, false)
      }
    } catch (err: any) {
      setError(err.message || 'Data tidak valid. Gagal menyimpan program.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">{isEdit ? 'Edit Program Beasiswa' : 'Tambah Program Beasiswa Baru'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nama Program <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Misal: Beasiswa Juara"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Target Level <span className="text-red-500">*</span></label>
              <select
                name="target_level"
                value={formData.target_level}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="SMA">SMA / Sederajat</option>
                <option value="PERGURUAN_TINGGI">Perguruan Tinggi</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nominal per Bulan (Rp) <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="nominal"
                value={formData.nominal || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Misal: 500000"
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Kuota Penerima <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="quota"
                value={formData.quota || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Misal: 50"
                required
                min="1"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Deadline Pendaftaran <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Deskripsi Program</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Penjelasan umum tentang beasiswa ini..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Persyaratan Khusus (JSON Opsional)</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder='["FC KTP", "Surat Miskin"]'
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                'Simpan Program'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
