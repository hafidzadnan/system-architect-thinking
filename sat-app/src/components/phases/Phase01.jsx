import { useState } from 'react'

export default function Phase01({ onNext }) {
  const [showImport, setShowImport] = useState(false)
  const [items, setItems] = useState({ params: [''], constraints: [''] })
  const defaultPrompt = `Anda adalah asisten AI untuk arsitektur sistem pengambilan keputusan. Analisis konteks yang saya berikan dan hasilkan output berupa format JSON murni dengan struktur berikut:
{
  "rootObjective": "Tujuan utama (string)",
  "functionTag": "hygienic|motivational",
  "functionJustification": "Alasan logis pemilihan tag fungsi (string)",
  "internalParameters": ["Kondisi internal, kekuatan/kelemahan", "..."],
  "externalConstraints": ["Kondisi eksternal, peluang/ancaman", "..."],
  "recommendedTasks": ["Action item 1", "Action item 2"]
}`

  const addItem = (key) => setItems(prev => ({ ...prev, [key]: [...prev[key], ''] }))

  return (
    <div>
      <div className="phase-header">
        <h2>Fase 01 — System Requirements Analysis</h2>
        <p>Analisis Kebutuhan Sistem: Definisikan tujuan utama dan petakan variabel lingkungan</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`btn ${!showImport ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowImport(false)}>📝 Input Manual</button>
        <button className={`btn ${showImport ? 'btn-ai' : 'btn-secondary'}`} onClick={() => setShowImport(true)}>📥 Import Hasil Analisis AI</button>
      </div>

      {showImport ? (
        <div className="import-panel">
          <div>
            <div className="form-group">
              <label>Prompt Template (Salin dan jalankan pada LLM eksternal)</label>
              <div style={{ position: 'relative' }}>
                <textarea className="textarea" style={{ minHeight: 120, fontFamily: 'monospace', fontSize: 13, background: '#F8FAFC' }} defaultValue={defaultPrompt} />
                <button className="btn btn-sm btn-ghost" style={{ position: 'absolute', top: 8, right: 8, background: 'white' }} onClick={() => navigator.clipboard.writeText(defaultPrompt)}>📋 Copy</button>
              </div>
            </div>
            <div className="form-group">
              <label>Paste JSON dari AI Agent Eksternal</label>
              <textarea className="textarea" style={{ minHeight: 200, fontFamily: 'monospace', fontSize: 13 }} placeholder={`{\n  "rootObjective": "...",\n  "functionTag": "hygienic|motivational",\n  "functionJustification": "...",\n  "internalParameters": ["..."],\n  "externalConstraints": ["..."],\n  "recommendedTasks": ["..."]\n}`} />
            </div>
            <button className="btn btn-ai">🔄 Parse & Tampilkan Rekomendasi</button>
          </div>
          <div className="import-recommendations">
            <h4>📥 Rekomendasi dari AI Agent</h4>
            <p style={{ fontSize: 13, color: '#3730A3', marginBottom: 12 }}>Paste JSON di panel kiri, lalu klik "Parse" untuk menampilkan rekomendasi di sini.</p>
            <div className="import-rec-item">
              <p><strong>Root Objective:</strong> Meningkatkan efisiensi supervisi KPPN melalui migrasi ke platform digital terintegrasi</p>
              <button className="btn btn-sm btn-ai">Gunakan</button>
            </div>
            <div className="import-rec-item">
              <p><strong>Function Tag:</strong> Motivational Function</p>
              <button className="btn btn-sm btn-ai">Gunakan</button>
            </div>
            <div className="import-rec-item">
              <p><strong>Function Justification:</strong> Digitalisasi merupakan langkah inovatif untuk meningkatkan kapasitas pengawasan tanpa menambah beban kerja manual.</p>
              <button className="btn btn-sm btn-ai">Gunakan</button>
            </div>
            <div className="import-rec-item">
              <p><strong>Internal Parameter:</strong> Kapasitas SDM KPPN bervariasi dalam mengadopsi teknologi baru</p>
              <button className="btn btn-sm btn-ai">Gunakan</button>
            </div>
            <div className="import-rec-item">
              <p><strong>External Constraint:</strong> Luasnya demografi wilayah dan kondisi jaringan internet bervariasi</p>
              <button className="btn btn-sm btn-ai">Gunakan</button>
            </div>
            
            <h4 style={{ marginTop: 16 }}>📋 Rekomendasi Tasks (Opsi)</h4>
            <div className="import-rec-item">
              <p><strong>Task:</strong> Sosialisasi platform digital ke seluruh KPPN</p>
              <button className="btn btn-sm btn-ai">Gunakan</button>
            </div>
            <div className="import-rec-item">
              <p><strong>Task:</strong> Penyusunan modul pelatihan teknis</p>
              <button className="btn btn-sm btn-ai">Gunakan</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="phase-section">
            <h3>
              A. Root Objective (Tujuan Utama)
              <span className="tooltip-wrap"><span className="tooltip-icon">?</span>
                <span className="tooltip-content">Tujuan utama yang ingin dicapai melalui keputusan ini. Dalam paradigma pemrograman, ini adalah fungsi utama (main function) yang harus dieksekusi oleh sistem.</span>
              </span>
            </h3>
            <textarea className="textarea" placeholder="Contoh: Meningkatkan efisiensi dan akuntabilitas supervisi KPPN melalui migrasi ke platform digital terintegrasi" />
          </div>

          <div className="phase-section">
            <h3>B. Tag Fungsi
              <span className="tooltip-wrap"><span className="tooltip-icon">?</span>
                <span className="tooltip-content"><strong>Hygienic Function:</strong> Menjaga stabilitas sistem (maintenance mode). <strong>Motivational Function:</strong> Meningkatkan kapasitas/inovasi (growth mode).</span>
              </span>
            </h3>
            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '12px 16px', border: '1px solid #E2E8F0', borderRadius: 8, flex: 1 }}>
                <input type="radio" name="functionTag" /> <div><strong>Hygienic Function</strong><br /><span style={{ fontSize: 12, color: '#64748B' }}>Menjaga stabilitas / mencegah penurunan (Maintenance Mode)</span></div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '12px 16px', border: '1px solid #E2E8F0', borderRadius: 8, flex: 1 }}>
                <input type="radio" name="functionTag" /> <div><strong>Motivational Function</strong><br /><span style={{ fontSize: 12, color: '#64748B' }}>Meningkatkan kapasitas / inovasi (Growth Mode)</span></div>
              </label>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Uraian Alasan Tag Fungsi</label>
              <textarea className="textarea" placeholder="Jelaskan secara logis mengapa fungsi tersebut dipilih..." />
            </div>
          </div>

          <div className="phase-section">
            <h3>C. Environmental Variable Mapping (EVM)
              <span className="tooltip-wrap"><span className="tooltip-icon">?</span>
                <span className="tooltip-content">Pemetaan variabel lingkungan menggunakan analisis kondisi (SWOT). Variabel dipecah menjadi Internal Parameters, External Constraints, dan Constants.</span>
              </span>
            </h3>

            <h4 style={{ marginBottom: 8, marginTop: 16 }}>Internal Parameters <span style={{ fontSize: 12, color: '#64748B', fontWeight: 400 }}>(Strengths & Weaknesses — variabel yang dapat dikendalikan)</span></h4>
            <div className="dynamic-list">
              {items.params.map((_, i) => (
                <div key={i} className="dynamic-list-item">
                  <input className="input" placeholder="Contoh: Kapasitas SDM KPPN bervariasi dalam mengadopsi teknologi baru" />
                  <button className="btn-remove" onClick={() => setItems(prev => ({ ...prev, params: prev.params.filter((_, j) => j !== i) }))}>✕</button>
                </div>
              ))}
              <button className="btn btn-sm btn-ghost" onClick={() => addItem('params')}>+ Tambah Parameter</button>
            </div>

            <h4 style={{ marginBottom: 8, marginTop: 16 }}>External Constraints <span style={{ fontSize: 12, color: '#64748B', fontWeight: 400 }}>(Opportunities & Threats — variabel read-only)</span></h4>
            <div className="dynamic-list">
              {items.constraints.map((_, i) => (
                <div key={i} className="dynamic-list-item">
                  <input className="input" placeholder="Contoh: Luasnya demografi wilayah dan kondisi jaringan internet bervariasi" />
                  <button className="btn-remove" onClick={() => setItems(prev => ({ ...prev, constraints: prev.constraints.filter((_, j) => j !== i) }))}>✕</button>
                </div>
              ))}
              <button className="btn btn-sm btn-ghost" onClick={() => addItem('constraints')}>+ Tambah Constraint</button>
            </div>
          </div>
        </>
      )}

      <div className="phase-actions">
        <button className="btn btn-primary btn-lg" onClick={onNext}>Selesaikan Fase 01 →</button>
      </div>
    </div>
  )
}
