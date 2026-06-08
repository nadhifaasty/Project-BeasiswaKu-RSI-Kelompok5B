import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import { getPrograms, updateProgramStatusAdmin, type ScholarshipProgram } from '../../services/scholarship'
import { ProgramFormModal } from '../../components/admin/ProgramFormModal'

export default function AdminKelolaProgramPage() {
  const [programs, setPrograms] = useState<ScholarshipProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<ScholarshipProgram | null>(null)

  const loadPrograms = async () => {
    try {
      setLoading(true)
      const data = await getPrograms()
      setPrograms(data)
    } catch (err: any) {
      setError('Gagal memuat daftar program beasiswa.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrograms()
  }, [])

  const handleSuccess = (programName: string, isEdit: boolean) => {
    setIsModalOpen(false)
    setSelectedProgram(null)
    setSuccessMsg(`Program beasiswa "${programName}" berhasil ${isEdit ? 'diperbarui' : 'dibuat'}.`)
    loadPrograms()
    setTimeout(() => setSuccessMsg(null), 5000)
  }

  const handleEdit = (prog: ScholarshipProgram) => {
    setSelectedProgram(prog)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProgram(null)
  }

  const handleToggleStatus = async (prog: ScholarshipProgram) => {
    if (!window.confirm(`Apakah Anda yakin ingin ${prog.status === 'aktif' || prog.status === 'OPEN' ? 'menonaktifkan' : 'mengaktifkan'} program ini?`)) return
    
    try {
      const newStatus = (prog.status === 'aktif' || prog.status === 'OPEN') ? 'ditutup' : 'aktif'
      await updateProgramStatusAdmin(prog.id, newStatus)
      setSuccessMsg(`Status program berhasil diubah menjadi ${newStatus}.`)
      loadPrograms()
      setTimeout(() => setSuccessMsg(null), 5000)
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah status program.')
    }
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Program Beasiswa</h1>
          <p className="text-slate-500 mt-1">Buat, lihat, dan kelola program beasiswa yang tersedia.</p>
        </div>
        <button
          onClick={() => {
            setSelectedProgram(null)
            setIsModalOpen(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Program Baru
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>Belum ada program beasiswa yang dibuat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                  <th className="px-6 py-4 font-medium">Nama Program</th>
                  <th className="px-6 py-4 font-medium">Nominal (Bulan)</th>
                  <th className="px-6 py-4 font-medium">Kuota</th>
                  <th className="px-6 py-4 font-medium">Deadline</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {programs.map((prog) => (
                  <tr key={prog.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{prog.nama}</div>
                      <div className="text-sm text-slate-500 truncate max-w-xs" title={prog.deskripsi}>
                        {prog.deskripsi}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">
                      {formatRupiah(Number(prog.nominal))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 font-medium">{prog.sisa_kuota}</span>
                        <span className="text-slate-400 text-sm">/ {prog.kuota}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(prog.deadline).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        prog.status === 'aktif' || prog.status === 'OPEN' 
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : prog.status === 'DRAFT'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {prog.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                      <button 
                        onClick={() => handleToggleStatus(prog)} 
                        className={`${prog.status === 'aktif' || prog.status === 'OPEN' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} text-sm font-medium`}
                      >
                        {prog.status === 'aktif' || prog.status === 'OPEN' ? 'Tutup' : 'Aktifkan'}
                      </button>
                      <button onClick={() => handleEdit(prog)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {isModalOpen && (
        <ProgramFormModal
          initialData={selectedProgram}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
