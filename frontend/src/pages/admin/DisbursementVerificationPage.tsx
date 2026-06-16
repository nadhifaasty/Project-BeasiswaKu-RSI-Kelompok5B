import { useState, useEffect } from 'react'
import { Card, Button, Input } from '../../components'
import { getAllDisbursements, verifyDisbursement, type DisbursementVerificationItem } from '../../services/disbursement'

function DisbursementVerificationPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [discList, setDiscList] = useState<DisbursementVerificationItem[]>([])
  const [selectedItem, setSelectedItem] = useState<DisbursementVerificationItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [catatan, setCatatan] = useState('')

  useEffect(() => {
    loadDisbursements()
  }, [])

  async function loadDisbursements(search?: string) {
    try {
      setLoading(true)
      setMessage(null)
      const data = await getAllDisbursements(search)
      setDiscList(data)
      setSelectedItem(null)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat data pencairan.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    loadDisbursements(searchQuery.trim())
  }

  async function handleVerify(isVerified: boolean) {
    if (!selectedItem) return

    setVerifying(true)
    setMessage(null)

    try {
      const result = await verifyDisbursement(selectedItem.disbursement_id, isVerified, catatan || undefined)
      
      // Update item status locally in the list
      setDiscList((prev) =>
        prev.map((item) =>
          item.disbursement_id === selectedItem.disbursement_id
            ? { ...item, is_verified: result.is_verified, verified_at: result.verified_at, catatan: result.catatan }
            : item
        )
      )

      setSelectedItem((prev) =>
        prev ? { ...prev, is_verified: result.is_verified, verified_at: result.verified_at, catatan: result.catatan } : null
      )

      setMessage({
        type: 'success',
        text: isVerified
          ? 'Data rekening berhasil diverifikasi dan disetujui.'
          : 'Data rekening berhasil ditolak. Siswa akan diminta melengkapi ulang.',
      })
      setCatatan('')
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memverifikasi data rekening.' })
    } finally {
      setVerifying(false)
    }
  }

  // Helper for status badge styling
  function getBadgeClass(verified: boolean) {
    return verified
      ? 'bg-green-50 text-green-700 border border-green-200'
      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Verifikasi Pencairan Dana</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola, cari, dan verifikasi data rekening bank penerima beasiswa.</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Grid Layout: Left List, Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Users List & Search */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3 items-end mb-6">
              <div className="flex-1">
                <Input
                  label="Cari Berdasarkan Nama User"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Masukkan nama penerima beasiswa..."
                />
              </div>
              <Button type="submit" loading={loading} className="bg-primary text-secondary px-6 py-2.5">
                Cari
              </Button>
            </form>

            <div className="border-t border-gray-100 pt-4">
              <h2 className="text-md font-bold text-primary mb-4">Daftar Penerima & Status Rekening</h2>
              
              {loading ? (
                <div className="py-12 text-center text-gray-400 space-y-2 animate-pulse">
                  <div className="h-10 bg-slate-100 rounded-xl" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ) : discList.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 italic text-center">Belum ada data rekening ditemukan.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                        <th className="py-3 px-4">Nama Lengkap</th>
                        <th className="py-3 px-4">NIM/NISN</th>
                        <th className="py-3 px-4">Bank</th>
                        <th className="py-3 px-4">Nomor Rekening</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {discList.map((item) => (
                        <tr
                          key={item.disbursement_id}
                          className={`hover:bg-slate-50 transition-colors ${
                            selectedItem?.disbursement_id === item.disbursement_id ? 'bg-primary/5 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{item.user?.nama_lengkap || '-'}</td>
                          <td className="py-3.5 px-4 font-mono text-gray-500 text-xs">{item.user?.nim_nisn || '-'}</td>
                          <td className="py-3.5 px-4 text-slate-600">{item.bank_name}</td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">{item.account_no_masked}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getBadgeClass(item.is_verified)}`}>
                              {item.is_verified ? 'Terverifikasi' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="text-xs bg-white hover:bg-slate-100 border border-gray-200 px-3 py-1.5 rounded-xl font-bold shadow-sm transition"
                            >
                              Lihat Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: Selected Details Card */}
        <div className="space-y-6">
          {selectedItem ? (
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-primary">Detail Rekening</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedItem.user?.nama_lengkap}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getBadgeClass(selectedItem.is_verified)}`}>
                  {selectedItem.is_verified ? 'Terverifikasi' : 'Pending'}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-gray-400 font-medium text-xs mb-0.5">Nama Siswa</p>
                  <p className="font-bold text-primary">{selectedItem.user?.nama_lengkap || '-'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-gray-400 font-medium text-xs mb-0.5">NIM/NISN</p>
                  <p className="font-semibold text-primary font-mono">{selectedItem.user?.nim_nisn || '-'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-gray-400 font-medium text-xs mb-0.5">Email Kontak</p>
                  <p className="font-semibold text-primary">{selectedItem.user?.email || '-'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-gray-400 font-medium text-xs mb-0.5">Nama Bank</p>
                  <p className="font-bold text-primary">{selectedItem.bank_name}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-gray-400 font-medium text-xs mb-0.5">Nomor Rekening</p>
                  <p className="font-bold text-primary font-mono">{selectedItem.account_no_masked}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-gray-400 font-medium text-xs mb-0.5">Pemegang Rekening</p>
                  <p className="font-bold text-primary">{selectedItem.account_holder || '-'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-gray-400 font-medium text-xs mb-0.5">Cabang Bank</p>
                  <p className="font-semibold text-primary">{selectedItem.cabang_bank || '-'}</p>
                </div>
              </div>

              {!selectedItem.is_verified && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Catatan Verifikasi (opsional)</label>
                    <textarea
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none bg-slate-50 transition"
                      placeholder="Tambahkan alasan persetujuan atau penolakan jika diperlukan..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleVerify(false)}
                      loading={verifying}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold"
                    >
                      Tolak
                    </Button>
                    <Button
                      onClick={() => handleVerify(true)}
                      loading={verifying}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-sm"
                    >
                      Verifikasi & Setujui
                    </Button>
                  </div>
                </div>
              )}

              {selectedItem.verified_at && (
                <div className="pt-2 border-t border-gray-100 text-xs text-gray-450 italic space-y-1">
                  <p>Diverifikasi pada: {new Date(selectedItem.verified_at).toLocaleString('id-ID')} WIB</p>
                  {selectedItem.catatan && (
                    <p className="font-serif">Catatan: "{selectedItem.catatan}"</p>
                  )}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-6 text-center py-16 text-gray-400 border border-dashed border-gray-200">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-semibold text-sm">Pilih siswa di daftar sebelah kiri untuk melihat dan memverifikasi detail rekening bank.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default DisbursementVerificationPage
