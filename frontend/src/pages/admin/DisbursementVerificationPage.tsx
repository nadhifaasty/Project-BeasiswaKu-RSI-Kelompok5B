import { useState } from 'react'
import { Card, Button, Input } from '../../components'
import { getBankAccountByUserId, verifyDisbursement, type DisbursementData } from '../../services/disbursement'

function DisbursementVerificationPage() {
  const [userId, setUserId] = useState('')
  const [disbursement, setDisbursement] = useState<DisbursementData | null>(null)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [catatan, setCatatan] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!userId.trim()) return

    setLoading(true)
    setMessage(null)
    setDisbursement(null)

    try {
      const data = await getBankAccountByUserId(userId.trim())
      if (!data) {
        setMessage({ type: 'error', text: 'Data rekening tidak ditemukan untuk user tersebut.' })
        return
      }
      setDisbursement(data)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mencari data rekening.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(isVerified: boolean) {
    if (!disbursement) return

    setVerifying(true)
    setMessage(null)

    try {
      const result = await verifyDisbursement(disbursement.disbursement_id, isVerified, catatan || undefined)
      setDisbursement((prev) => prev ? { ...prev, is_verified: result.is_verified, verified_at: result.verified_at } : null)
      setMessage({
        type: 'success',
        text: isVerified
          ? 'Data rekening berhasil diverifikasi dan dikunci.'
          : 'Data rekening ditolak. Siswa diminta melengkapi ulang.',
      })
      setCatatan('')
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memverifikasi data rekening.' })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-primary">Verifikasi Pencairan Dana</h1>
        <p className="text-gray-500 text-sm mt-1">Cari dan verifikasi data rekening penerima beasiswa.</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSearch} className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              label="Cari User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Masukkan user ID penerima"
              required
            />
          </div>
          <Button type="submit" loading={loading} className="bg-primary text-secondary px-5 py-2.5">
            Cari
          </Button>
        </form>
      </Card>

      {disbursement && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Detail Rekening</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${disbursement.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {disbursement.is_verified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 font-medium">Bank</p>
              <p className="font-semibold text-primary">{disbursement.bank_name}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Nomor Rekening</p>
              <p className="font-semibold text-primary">{disbursement.account_no_masked}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Pemegang Rekening</p>
              <p className="font-semibold text-primary">{disbursement.account_holder || '-'}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Cabang Bank</p>
              <p className="font-semibold text-primary">{disbursement.cabang_bank || '-'}</p>
            </div>
          </div>

          {!disbursement.is_verified && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  placeholder="Tambahkan catatan jika diperlukan..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => handleVerify(false)}
                  loading={verifying}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  Tolak
                </Button>
                <Button
                  onClick={() => handleVerify(true)}
                  loading={verifying}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Verifikasi & Setujui
                </Button>
              </div>
            </>
          )}

          {disbursement.verified_at && (
            <p className="text-xs text-gray-400">
              Diverifikasi pada: {new Date(disbursement.verified_at).toLocaleString('id-ID')}
            </p>
          )}
        </Card>
      )}
    </div>
  )
}

export default DisbursementVerificationPage
