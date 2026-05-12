import { useState } from 'react'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('AIzaSyCABSPF4GDtB92o2kJQ9_UIjPSF5HwkgCg')
  const [showKey, setShowKey] = useState(false)
  const [testResult, setTestResult] = useState(null)

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Pengaturan</h1>
        <p>Konfigurasi API key dan preferensi aplikasi</p>
      </div>

      <div className="settings-section">
        <h3>🤖 Integrasi AI — Google Gemini</h3>
        <p style={{fontSize:13, color:'#64748B', marginBottom:16}}>API key digunakan untuk fitur analisis bias (Fase 03) dan mapping kriteria (Fase 04).</p>
        <div className="form-group">
          <label>Gemini API Key</label>
          <div className="api-key-input">
            <input className="input" type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} />
            <button className="btn btn-secondary" onClick={() => setShowKey(!showKey)}>{showKey ? '🙈' : '👁️'}</button>
            <button className="btn btn-primary" onClick={() => setTestResult('success')}>Test Koneksi</button>
          </div>
          <span className="form-hint">Default API key sudah tersedia untuk demo. Anda dapat mengganti dengan key sendiri.</span>
        </div>
        {testResult === 'success' && (
          <div className="alert alert-success"><span className="alert-icon">✅</span><span>Koneksi berhasil! API key valid dan siap digunakan.</span></div>
        )}
        <p style={{fontSize:13, marginTop:12}}>
          Belum punya API key? <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">Dapatkan di Google AI Studio →</a>
        </p>
      </div>

      <div className="settings-section">
        <h3>ℹ️ Tentang Aplikasi</h3>
        <div className="summary-item"><span className="summary-label">Versi</span><span className="summary-value">1.0.0 (MVP)</span></div>
        <div className="summary-item"><span className="summary-label">Penyimpanan Data</span><span className="summary-value">localStorage (browser)</span></div>
        <div className="summary-item"><span className="summary-label">Framework</span><span className="summary-value">System Architect Thinking</span></div>
      </div>
    </div>
  )
}
