export default function SessionSummary({ onPrev }) {
  return (
    <div>
      <div className="phase-header">
        <h2>Ringkasan Keputusan</h2>
        <p>Dokumen akhir hasil analisis System Architect Thinking</p>
      </div>

      <div className="alert alert-success" style={{ marginBottom: 24 }}>
        <span className="alert-icon">✅</span>
        <span>Sesi keputusan telah diselesaikan. Seluruh data telah dikunci dan bersifat read-only.</span>
      </div>

      <div className="summary-section">
        <h3>1. System Requirements (Fase 01)</h3>
        <div className="summary-item"><span className="summary-label">Root Objective</span><span className="summary-value">Meningkatkan efisiensi dan akuntabilitas supervisi KPPN melalui migrasi ke platform digital terintegrasi</span></div>
        <div className="summary-item"><span className="summary-label">Function Tag</span><span className="summary-value"><span className="badge badge-draft">Motivational Function</span></span></div>
      </div>

      <div className="summary-section">
        <h3>2. Variables & Constraints (Fase 02)</h3>
        <table className="var-table">
          <thead>
            <tr><th>Nama Variabel</th><th>Tag</th><th>Kategori Eisenhower</th></tr>
          </thead>
          <tbody>
            <tr><td>Sisa Pagu Perjalanan Dinas</td><td><span className="badge badge-draft">Hardcoded Data</span></td><td><span className="badge badge-progress">Kuadran 2 (Cron Job)</span></td></tr>
            <tr><td>Kesiapan SDM KPPN</td><td><span className="badge badge-warning">Variable Parameter</span></td><td><span className="badge badge-error">Kuadran 1 (Interrupt)</span></td></tr>
          </tbody>
        </table>
      </div>

      <div className="summary-section">
        <h3>3. Logic Sanitization (Fase 03)</h3>
        <div className="summary-item"><span className="summary-label">Total Variabel</span><span className="summary-value">4 Variabel</span></div>
        <div className="summary-item"><span className="summary-label">Status Sanitasi</span><span className="summary-value"><span className="badge badge-done">Semua Lolos / Diterima</span></span></div>
      </div>

      <div className="summary-section">
        <h3>4. Computation & Expected Value (Fase 04)</h3>
        <div className="summary-item"><span className="summary-label">Opsi A (Status Quo)</span><span className="summary-value">EV = 7.7</span></div>
        <div className="summary-item"><span className="summary-label">Opsi B (Migrasi Digital)</span><span className="summary-value" style={{color: '#166534', fontWeight: 700}}>EV = 57.6 🏆</span></div>
        <div style={{marginTop: 12}}>
          <span className="summary-label" style={{display: 'block', marginBottom: 4}}>Keputusan Rekomendasi:</span>
          <div style={{padding: 12, background: '#DCFCE7', borderRadius: 8, border: '1px solid #BBF7D0', color: '#166534', fontWeight: 600}}>
            Opsi B: Migrasi ke Platform Digital Terintegrasi
          </div>
        </div>
      </div>

      <div className="summary-section">
        <h3>5. Output Validation (Fase 05)</h3>
        <div className="summary-item"><span className="summary-label">Zombie Process Check</span><span className="summary-value"><span className="badge badge-done">Aman (EV Ke Depan Positif)</span></span></div>
        <div className="summary-item"><span className="summary-label">Cobra Effect Monitoring</span><span className="summary-value">Pemantauan Bulanan (3 Metrik)</span></div>
        <div className="summary-item"><span className="summary-label">Stakeholder Matrix</span><span className="summary-value"><span className="badge badge-benefit">Intelligent (Win-Win)</span></span></div>
      </div>

      <div className="phase-actions" style={{justifyContent: 'space-between', marginTop: 40}}>
        <button className="btn btn-secondary" onClick={onPrev}>← Kembali ke Fase 05</button>
        <button className="btn btn-primary btn-lg">📥 Unduh Laporan PDF</button>
      </div>
    </div>
  )
}
