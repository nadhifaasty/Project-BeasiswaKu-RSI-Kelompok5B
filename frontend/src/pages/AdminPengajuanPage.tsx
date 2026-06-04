import { useState, useEffect } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/shared/Badge'
import { fetchApi, type ApiResponse } from '../services/api'
import VerifyModal from '../components/VerifyModal'
import type { ActionType } from '../components/VerifyModal'

// ============ TYPES ============

interface AdminApplication {
  id: string
  nomor_referensi: string
  ipk: number
  esai_motivasi: string
  prestasi_non_akademik: string | null
  status: string
  catatan_admin: string | null
  created_at: string
  updated_at: string
  profiles: {
    nama_lengkap: string
    nim_nisn: string
    email: string
  }
  scholarship_programs: {
    nama: string
    monthly_amount: number
  }
}

type StatusFilter = '' | 'PENDING' | 'TERVERIFIKASI' | 'REVISI' | 'DITOLAK' | 'DITERIMA' | 'CADANGAN'

// ============ PAGE ============

function AdminPengajuanPage() {
  const [applications, setApplications] = useState<AdminApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('')
  const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null)
  const [verifyAction, setVerifyAction] = useState<ActionType | null>(null)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadApplications()
  }, [filter])

  async function loadApplications() {
    try {
      setLoading(true)
      const query = filter ? `?status=${filter}` : ''
      const res = await fetchApi<ApiResponse<AdminApplication[]>>(
        `/applications${query}`
      )
      setApplications(res.data || [])
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat data pengajuan.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitVerify(action: ActionType, catatan: string) {
    if (!selectedApp || !action) return

    setUpdating(true)
    setMessage(null)

    try {
      await fetchApi(`/applications/${selectedApp.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: action, 
          catatan_admin: catatan || undefined,
          updated_at: selectedApp.updated_at
        }),
      })

      let successMsg = ''
      if (action === 'TERVERIFIKASI') successMsg = `Pengajuan ${selectedApp.nomor_referensi} berhasil disetujui. Email notifikasi telah dikirim ke siswa.`
      else if (action === 'REVISI') successMsg = 'Permintaan revisi telah dikirim ke siswa dengan catatan perbaikan.'
      else if (action === 'DITOLAK') successMsg = 'Pengajuan telah ditolak. Siswa akan menerima notifikasi email.'
      
      setMessage({ type: 'success', text: successMsg })
      setIsVerifyModalOpen(false)
      setSelectedApp(null)
      await loadApplications()
    } catch (err: any) {
      if (err.message.includes('Admin lain') || err.message.includes('ERR-CONC-01')) {
         setMessage({ type: 'error', text: 'Data telah diperbarui oleh admin lain. Halaman akan dimuat ulang otomatis.' })
         setIsVerifyModalOpen(false)
         setSelectedApp(null)
         await loadApplications()
      } else {
         setMessage({ type: 'error', text: err.message || 'Gagal memperbarui status pengajuan. Periksa koneksi internet Anda atau silakan coba lagi.' })
      }
    } finally {
      setUpdating(false)
    }
  }

  const openVerifyModal = (action: ActionType) => {
    setVerifyAction(action)
    setIsVerifyModalOpen(true)
  }

  function mapStatusToBadge(status: string) {
    switch (status) {
      case 'PENDING': return 'PENDING'
      case 'TERVERIFIKASI': return 'VERIFIED'
      case 'DITERIMA': return 'ACCEPTED'
      case 'DITOLAK': return 'REJECTED'
      default: return 'DRAFT'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Kelola Pengajuan</h1>
          <p className="text-gray-500 text-sm">Review dan update status pengajuan beasiswa.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as StatusFilter)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Semua</option>
            <option value="PENDING">Pending</option>
            <option value="TERVERIFIKASI">Terverifikasi</option>
            <option value="REVISI">Revisi</option>
            <option value="DITERIMA">Diterima</option>
            <option value="DITOLAK">Ditolak</option>
            <option value="CADANGAN">Cadangan</option>
          </select>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-primary">Detail Pengajuan</h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-500">Nama</p>
                  <p className="font-medium">{selectedApp.profiles.nama_lengkap}</p>
                </div>
                <div>
                  <p className="text-gray-500">NIM/NISN</p>
                  <p className="font-medium">{selectedApp.profiles.nim_nisn}</p>
                </div>
                <div>
                  <p className="text-gray-500">Program</p>
                  <p className="font-medium">{selectedApp.scholarship_programs.nama}</p>
                </div>
                <div>
                  <p className="text-gray-500">IPK</p>
                  <p className="font-medium">{selectedApp.ipk}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500">Esai Motivasi</p>
                <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedApp.esai_motivasi}</p>
              </div>

              {selectedApp.prestasi_non_akademik && (
                <div>
                  <p className="text-gray-500">Prestasi Non-Akademik</p>
                  <p className="mt-1 text-gray-700">{selectedApp.prestasi_non_akademik}</p>
                </div>
              )}

              <hr />

              <div className="flex flex-col gap-3 pt-4 border-t mt-4">
                <p className="text-sm font-medium text-gray-700">Keputusan Verifikasi</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => openVerifyModal('TERVERIFIKASI')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Setujui Pengajuan
                  </button>
                  <button
                    onClick={() => openVerifyModal('REVISI')}
                    className="w-full bg-white hover:bg-red-50 border border-red-500 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Minta Revisi
                  </button>
                  <button
                    onClick={() => openVerifyModal('DITOLAK')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Tolak Pengajuan
                  </button>
                </div>
                <Button variant="outline" onClick={() => setSelectedApp(null)} className="w-full mt-2">
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      <VerifyModal 
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        action={verifyAction}
        loading={updating}
        onSubmit={handleSubmitVerify}
      />

      {/* Applications Table */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <p>Belum ada pengajuan{filter ? ` dengan status "${filter}"` : ''}.</p>
          </div>
        </Card>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">No. Ref</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Pemohon</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Program</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">IPK</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tanggal</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{app.nomor_referensi}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{app.profiles.nama_lengkap}</p>
                    <p className="text-xs text-gray-500">{app.profiles.nim_nisn}</p>
                  </td>
                  <td className="px-4 py-3">{app.scholarship_programs.nama}</td>
                  <td className="px-4 py-3">{app.ipk}</td>
                  <td className="px-4 py-3">
                    <Badge status={mapStatusToBadge(app.status) as any} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(app.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="text-accent hover:underline text-sm font-medium"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminPengajuanPage
