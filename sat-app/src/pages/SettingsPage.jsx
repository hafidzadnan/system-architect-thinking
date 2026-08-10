import { useEffect, useState } from 'react'
import { useSettingsStore } from '../stores/settingsStore'

const FALLBACK_MODELS = [
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'openai/gpt-4o', name: 'GPT-4o' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B Instruct' },
]

export default function SettingsPage() {
  const { apiKey, model, setApiKey, setModel } = useSettingsStore()
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [models, setModels] = useState(FALLBACK_MODELS)
  const [modelsError, setModelsError] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch('https://openrouter.ai/api/v1/models')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load models')
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        const fetched = (data?.data ?? [])
          .map((m) => ({ id: m.id, name: m.name ?? m.id }))
          .sort((a, b) => a.name.localeCompare(b.name))
        if (fetched.length > 0) setModels(fetched)
      })
      .catch(() => {
        if (!cancelled) setModelsError(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      setTestResult(res.ok ? 'success' : 'error')
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Pengaturan</h1>
        <p>Konfigurasi API key dan preferensi aplikasi</p>
      </div>

      <div className="settings-section">
        <h3>🤖 Integrasi AI — OpenRouter</h3>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
          API key digunakan untuk fitur analisis bias (Fase 03) dan mapping
          kriteria (Fase 04).
        </p>
        <div className="form-group">
          <label>OpenRouter API Key</label>
          <div className="api-key-input">
            <input
              className="input"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              className="btn btn-secondary"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? '🙈' : '👁️'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleTestConnection}
              disabled={testing || !apiKey}
            >
              {testing ? 'Menguji...' : 'Test Koneksi'}
            </button>
          </div>
          <span className="form-hint">
            Default key diambil dari <code>VITE_OPENROUTER_API_KEY</code> di
            file <code>.env</code> (lihat <code>.env.example</code>). Perubahan
            pada field ini hanya berlaku selama sesi browser dan akan kembali ke
            default <code>.env</code> setelah refresh halaman.
          </span>
        </div>
        <div className="form-group">
          <label>Model</label>
          <select
            className="select"
            style={{ maxWidth: 400 }}
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.id})
              </option>
            ))}
          </select>
          {modelsError && (
            <span className="form-hint">
              Gagal memuat daftar model, menampilkan pilihan default.
            </span>
          )}
        </div>
        {testResult === 'success' && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <span>Koneksi berhasil! API key valid dan siap digunakan.</span>
          </div>
        )}
        {testResult === 'error' && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            <span>Koneksi gagal. Periksa kembali API key Anda.</span>
          </div>
        )}
        <p style={{ fontSize: 13, marginTop: 12 }}>
          Belum punya API key?{' '}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dapatkan di OpenRouter →
          </a>
        </p>
      </div>

      <div className="settings-section">
        <h3>ℹ️ Tentang Aplikasi</h3>
        <div className="summary-item">
          <span className="summary-label">Versi</span>
          <span className="summary-value">1.0.0 (MVP)</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Penyimpanan Data</span>
          <span className="summary-value">localStorage (browser)</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Framework</span>
          <span className="summary-value">System Architect Thinking</span>
        </div>
      </div>
    </div>
  )
}
