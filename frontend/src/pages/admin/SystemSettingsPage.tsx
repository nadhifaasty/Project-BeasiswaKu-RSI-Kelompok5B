import { useState, useEffect } from 'react'
import { Card, Button, Input } from '../../components'
import { getSystemSettings, updateSystemSettings, type SystemSettings } from '../../services/system'

function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [minIpkSma, setMinIpkSma] = useState('')
  const [minIpkPt, setMinIpkPt] = useState('')
  const [maxPenghasilanOrtu, setMaxPenghasilanOrtu] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      const data = await getSystemSettings()
      setSettings(data)
      setMinIpkSma(String(data.min_ipk_sma ?? ''))
      setMinIpkPt(String(data.min_ipk_pt ?? ''))
      setMaxPenghasilanOrtu(String(data.max_penghasilan_ortu ?? ''))
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat konfigurasi sistem.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const payload: Record<string, number> = {}
      if (minIpkSma !== '') payload.min_ipk_sma = Number(minIpkSma)
      if (minIpkPt !== '') payload.min_ipk_pt = Number(minIpkPt)
      if (maxPenghasilanOrtu !== '') payload.max_penghasilan_ortu = Number(maxPenghasilanOrtu)

      const result = await updateSystemSettings(payload)
      setSettings(result)
      setMessage({ type: 'success', text: 'Konfigurasi sistem berhasil diperbarui.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan konfigurasi.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-3xl">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full mb-2">
          Super Admin Console
        </span>
        <h1 className="text-3xl font-bold text-primary">Konfigurasi Sistem</h1>
        <p className="text-gray-500 text-sm mt-1">Atur aturan kelayakan dan parameter sistem beasiswa.</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-primary mb-4">Aturan Kelayakan Akademik</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Min. IPK SMA"
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={minIpkSma}
                onChange={(e) => setMinIpkSma(e.target.value)}
                placeholder="Contoh: 2.50"
              />
              <Input
                label="Min. IPK Perguruan Tinggi"
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={minIpkPt}
                onChange={(e) => setMinIpkPt(e.target.value)}
                placeholder="Contoh: 2.75"
              />
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-primary mb-4">Aturan Kelayakan Ekonomi</h3>
            <Input
              label="Maks. Penghasilan Orang Tua (Rp)"
              type="number"
              min="0"
              value={maxPenghasilanOrtu}
              onChange={(e) => setMaxPenghasilanOrtu(e.target.value)}
              placeholder="Contoh: 3000000"
            />
          </div>

          {settings?.updated_by && (
            <div className="text-xs text-gray-400 border-t border-gray-100 pt-4">
              Terakhir diperbarui oleh <span className="font-semibold">{settings.updated_by.full_name}</span> pada{' '}
              {new Date(settings.updated_at).toLocaleString('id-ID')}
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" loading={saving} className="bg-primary text-secondary px-6 py-2.5 font-bold">
              Simpan Konfigurasi
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default SystemSettingsPage
