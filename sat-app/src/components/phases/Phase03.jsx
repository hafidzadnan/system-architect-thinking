import { useState } from 'react'

export default function Phase03({ onNext, onPrev }) {
  const [showImport, setShowImport] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [selectedWarning, setSelectedWarning] = useState(null)

  // Default mock data to show the table if user hasn't imported JSON
  const [validations, setValidations] = useState([
    {
      variableName: "Kapasitas SDM KPPN",
      biases: {
        samplingError: { status: "warning", reason: "Klaim gaptek mungkin hanya berdasarkan observasi pada KPPN tertentu.", recommendation: "Perlu data survei dari seluruh KPPN di wilayah kerja." },
        overfitting: { status: "warning", reason: "Generalisasi bahwa pegawai gaptek berdasarkan kasus kasuistik.", recommendation: "Verifikasi apakah masalah terjadi secara sistemik." },
        exceptionSuppression: { status: "validated", reason: "Tidak ada data negatif yang sengaja disembunyikan.", recommendation: "" },
        spuriousLink: { status: "validated", reason: "Klaim sebab-akibat dapat dibuktikan secara logis.", recommendation: "" }
      }
    },
    {
      variableName: "Sisa Pagu Perjalanan Dinas",
      biases: {
        samplingError: { status: "validated", reason: "Data bersumber langsung dari database SAKTI yang bersifat empiris.", recommendation: "" },
        overfitting: { status: "validated", reason: "Angka pagu mutlak dan tidak digeneralisasi.", recommendation: "" },
        exceptionSuppression: { status: "validated", reason: "Sistem mencatat seluruh transaksi pagu tanpa terkecuali.", recommendation: "" },
        spuriousLink: { status: "validated", reason: "Variabel mandiri, tidak ada tautan kausal palsu.", recommendation: "" }
      }
    }
  ])

  const defaultPrompt = `Anda adalah sistem pakar untuk validasi logika arsitektur sistem.
Tugas Anda adalah membaca dokumen-dokumen multimodal (PDF/Word/Images) yang saya lampirkan, lalu mendeteksi potensi 4 jenis bias kognitif pada daftar variabel di bawah ini:
1. Kapasitas SDM KPPN
2. Sisa Pagu Perjalanan Dinas

Evaluasi setiap variabel terhadap bias: samplingError, overfitting, exceptionSuppression, spuriousLink.
Jika aman, set status "validated" dan berikan "reason" (alasan logis mengapa lolos). Jika ada potensi bias, set status "warning" dan sertakan "reason" serta "recommendation" prosedur sanitasi.

Hasilkan output murni berformat JSON seperti ini:
{
  "validations": [
    {
      "variableName": "Nama Variabel",
      "biases": {
        "samplingError": { "status": "warning", "reason": "...", "recommendation": "..." },
        "overfitting": { "status": "validated", "reason": "...", "recommendation": "" },
        "exceptionSuppression": { "status": "validated", "reason": "...", "recommendation": "" },
        "spuriousLink": { "status": "validated", "reason": "...", "recommendation": "" }
      }
    }
  ]
}`

  const handleParseJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      if (parsed && parsed.validations) {
        setValidations(parsed.validations)
        setShowImport(false)
        setSelectedWarning(null)
      } else {
        alert("Format JSON tidak sesuai. Harus mengandung properti 'validations'.")
      }
    } catch (e) {
      alert("Error parsing JSON: " + e.message)
    }
  }

  const handleCellClick = (variableName, biasType, biasData) => {
    setSelectedWarning({
      variableName,
      biasType,
      ...biasData
    })
  }

  const hasWarnings = validations.some(v => 
    Object.values(v.biases).some(b => b.status === 'warning')
  )

  const biasLabels = {
    samplingError: "Sampling Error",
    overfitting: "Overfitting",
    exceptionSuppression: "Exception Suppression",
    spuriousLink: "Spurious Link"
  }

  return (
    <div>
      <div className="phase-header">
        <h2>Fase 03 — Logic Debugging & Sanitization</h2>
        <p>Debugging Logika & Sanitasi: Validasi variabel dari bias kognitif menggunakan dokumen multimodal (eksternal LLM)</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`btn ${!showImport ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowImport(false)}>📊 Matriks Validasi</button>
        <button className={`btn ${showImport ? 'btn-ai' : 'btn-secondary'}`} onClick={() => setShowImport(true)}>📥 Import Hasil Validasi AI</button>
      </div>

      {showImport ? (
        <div className="import-panel">
          <div>
            <div className="form-group">
              <label>Prompt Template (Salin dan jalankan pada LLM eksternal seperti ChatGPT Plus / Gemini Advanced)</label>
              <div style={{ position: 'relative' }}>
                <textarea className="textarea" style={{ minHeight: 180, fontFamily: 'monospace', fontSize: 13, background: '#F8FAFC' }} defaultValue={defaultPrompt} />
                <button className="btn btn-sm btn-ghost" style={{ position: 'absolute', top: 8, right: 8, background: 'white' }} onClick={() => navigator.clipboard.writeText(defaultPrompt)}>📋 Copy</button>
              </div>
              <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>* Jangan lupa upload file/dokumen terkait (PDF/Image) bersama dengan prompt di atas.</p>
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label>Paste JSON hasil validasi di sini</label>
              <textarea 
                className="textarea" 
                style={{ minHeight: 200, fontFamily: 'monospace', fontSize: 13 }} 
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
                placeholder={`{\n  "validations": [\n    ...\n  ]\n}`} 
              />
            </div>
            <button className="btn btn-ai" onClick={handleParseJSON}>🔄 Parse & Tampilkan Matriks</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="alert alert-info">
            <span className="alert-icon">ℹ️</span>
            <span>Tabel di bawah ini memvisualisasikan hasil validasi bias untuk setiap variabel. Klik sel tabel untuk melihat detail alasannya (baik peringatan ⚠️ maupun lolos validasi ✅).</span>
          </div>

          <table className="var-table" style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Nama Variabel</th>
                <th style={{ width: '18%', textAlign: 'center' }}>Sampling Error</th>
                <th style={{ width: '18%', textAlign: 'center' }}>Overfitting</th>
                <th style={{ width: '18%', textAlign: 'center' }}>Exception Suppression</th>
                <th style={{ width: '18%', textAlign: 'center' }}>Spurious Link</th>
              </tr>
            </thead>
            <tbody>
              {validations.map((v, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{v.variableName}</td>
                  {Object.keys(biasLabels).map(biasKey => {
                    const bias = v.biases[biasKey] || { status: 'validated' }
                    const isWarning = bias.status === 'warning'
                    const isSelected = selectedWarning?.variableName === v.variableName && selectedWarning?.biasType === biasKey
                    const bgCol = isSelected ? (isWarning ? '#FEF3C7' : '#DCFCE7') : 'transparent'
                    
                    return (
                      <td key={biasKey} style={{ textAlign: 'center', cursor: 'pointer', background: bgCol, transition: 'background 0.2s' }} onClick={() => handleCellClick(v.variableName, biasKey, bias)}>
                        {isWarning ? <span style={{ fontSize: 18 }} title="Lihat warning">⚠️</span> : <span style={{ fontSize: 18 }} title="Lihat alasan lolos">✅</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {selectedWarning && (
            <div style={{ marginTop: 20, padding: 16, background: selectedWarning.status === 'warning' ? '#FEF3C7' : '#F0FDF4', border: '1px solid', borderColor: selectedWarning.status === 'warning' ? '#FDE68A' : '#BBF7D0', borderRadius: 8, display: 'flex', gap: 16 }}>
              <div style={{ fontSize: 24 }}>{selectedWarning.status === 'warning' ? '⚠️' : '✅'}</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: selectedWarning.status === 'warning' ? '#92400E' : '#166534', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{selectedWarning.variableName} — {biasLabels[selectedWarning.biasType]}</span>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: selectedWarning.status === 'warning' ? '#92400E' : '#166534', fontSize: 12, fontWeight: 600 }} onClick={() => setSelectedWarning(null)}>Tutup ✕</button>
                </h4>
                <p style={{ fontSize: 13, color: selectedWarning.status === 'warning' ? '#92400E' : '#166534', marginBottom: 8 }}><strong>Alasan AI:</strong> {selectedWarning.reason}</p>
                {selectedWarning.status === 'warning' && (
                  <>
                    <div style={{ padding: 12, background: 'white', borderRadius: 6, fontSize: 13, color: '#B45309' }}>
                      <strong>🔧 Rekomendasi Sanitasi:</strong><br/>
                      {selectedWarning.recommendation}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {hasWarnings && (
            <div className="alert alert-warning" style={{ marginTop: 24 }}>
              <span className="alert-icon">⚠️</span>
              <span>Terdapat peringatan (warning) pada validasi logika. Selesaikan atau revisi variabel tersebut sebelum melanjutkan ke Fase 04.</span>
            </div>
          )}

          <div className="phase-actions" style={{ marginTop: 32 }}>
            <button className="btn btn-secondary" onClick={onPrev}>← Kembali ke Fase 02</button>
            <button className="btn btn-primary btn-lg" disabled={hasWarnings} onClick={onNext}>Selesaikan Fase 03 →</button>
          </div>
        </div>
      )}
    </div>
  )
}
