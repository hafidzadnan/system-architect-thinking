import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const chartData = {
  labels: ['Opsi A: Supervisi Konvensional', 'Opsi B: Migrasi Digital'],
  datasets: [{
    label: 'Expected Value',
    data: [7.7, 57.6],
    backgroundColor: ['#94A3B8', '#1B2A4A'],
    borderRadius: 6,
    barThickness: 48,
  }],
}
const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  plugins: { legend: { display: false }, title: { display: true, text: 'Perbandingan Expected Value Antar Opsi', font: { size: 14, family: 'Inter' } } },
  scales: { x: { beginAtZero: true, grid: { color: '#F1F5F9' } }, y: { grid: { display: false } } },
}

export default function Phase04({ onNext, onPrev }) {
  return (
    <div>
      <div className="phase-header">
        <h2>Fase 04 — Computation & Execution</h2>
        <p>Komputasi & Eksekusi: Hitung Expected Value setiap opsi kebijakan secara terstruktur</p>
      </div>

      {/* OPSI */}
      <div className="phase-section">
        <h3>A. Opsi Kebijakan</h3>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <div className="card" style={{padding:12}}>
            <div style={{display:'flex', gap:12, alignItems:'center'}}>
              <span className="badge badge-draft">Opsi A</span>
              <input className="input" defaultValue="Supervisi Konvensional (Kunjungan Fisik / Status Quo)" style={{flex:1}} />
            </div>
          </div>
          <div className="card" style={{padding:12}}>
            <div style={{display:'flex', gap:12, alignItems:'center'}}>
              <span className="badge badge-progress">Opsi B</span>
              <input className="input" defaultValue="Migrasi ke Platform Digital Terintegrasi" style={{flex:1}} />
            </div>
          </div>
        </div>
        <button className="btn btn-sm btn-ghost" style={{marginTop:8}}>+ Tambah Opsi (maks. 5)</button>
      </div>

      {/* MAPPING KRITERIA */}
      <div className="phase-section">
        <h3>B. Mapping Kriteria
          <button className="btn btn-sm btn-ai" style={{marginLeft:12}}>🤖 Mapping Kriteria dengan AI</button>
        </h3>
        <table className="var-table">
          <thead>
            <tr><th>Sumber EVM</th><th>Nama Kriteria</th><th>Tipe</th><th>Bobot</th><th>Justifikasi</th></tr>
          </thead>
          <tbody>
            <tr>
              <td style={{fontSize:12, color:'#64748B'}}>Internal Requirement</td>
              <td><input className="input" defaultValue="Akurasi & Kepatuhan Bukti" /></td>
              <td><span className="badge badge-benefit">Benefit</span></td>
              <td><input className="input" type="number" step="0.1" defaultValue="0.6" style={{width:70, textAlign:'center'}} /></td>
              <td><input className="input" defaultValue="Tanpa bukti dukung valid, organisasi gagal (Hygienic)" /></td>
            </tr>
            <tr>
              <td style={{fontSize:12, color:'#64748B'}}>External Constraint</td>
              <td><input className="input" defaultValue="Kecepatan Konsolidasi Laporan" /></td>
              <td><span className="badge badge-benefit">Benefit</span></td>
              <td><input className="input" type="number" step="0.1" defaultValue="0.4" style={{width:70, textAlign:'center'}} /></td>
              <td><input className="input" defaultValue="Laporan lambat mengurangi poin IKPA Kanwil" /></td>
            </tr>
            <tr>
              <td style={{fontSize:12, color:'#64748B'}}>Internal Constraint</td>
              <td><input className="input" defaultValue="Beban Anggaran DIPA" /></td>
              <td><span className="badge badge-cost">Cost</span></td>
              <td><input className="input" type="number" step="0.1" defaultValue="0.7" style={{width:70, textAlign:'center'}} /></td>
              <td><input className="input" defaultValue="Kehabisan pagu = fatal error seluruh unit" /></td>
            </tr>
            <tr>
              <td style={{fontSize:12, color:'#64748B'}}>Internal Parameter</td>
              <td><input className="input" defaultValue="Beban Waktu & Training" /></td>
              <td><span className="badge badge-cost">Cost</span></td>
              <td><input className="input" type="number" step="0.1" defaultValue="0.3" style={{width:70, textAlign:'center'}} /></td>
              <td><input className="input" defaultValue="Learning curve sistem baru mengganggu jam kerja" /></td>
            </tr>
          </tbody>
        </table>
        <div style={{display:'flex', gap:16, marginTop:8}}>
          <span className="weight-indicator weight-valid">✅ Total Bobot Benefit: 1.0 / 1.0</span>
          <span className="weight-indicator weight-valid">✅ Total Bobot Cost: 1.0 / 1.0</span>
        </div>
      </div>

      {/* SCORING */}
      <div className="phase-section">
        <h3>C. Scoring & Kalkulasi EV</h3>
        <p style={{fontSize:13, color:'#64748B', marginBottom:12}}>Formula: EV = Σ(Benefit × Bobot × P_success) − Σ(Cost × Bobot × P_risk)</p>
        <div style={{overflowX:'auto'}}>
          <table className="ev-table">
            <thead>
              <tr>
                <th>Variabel</th><th>Tipe</th><th>Bobot</th>
                <th colSpan="3" style={{background:'#475569'}}>Opsi A: Konvensional</th>
                <th colSpan="3" style={{background:'#1B2A4A'}}>Opsi B: Digital</th>
              </tr>
              <tr>
                <th></th><th></th><th></th>
                <th style={{background:'#64748B', fontSize:11}}>Nilai</th><th style={{background:'#64748B', fontSize:11}}>Prob.</th><th style={{background:'#64748B', fontSize:11}}>EV</th>
                <th style={{background:'#2D4A7A', fontSize:11}}>Nilai</th><th style={{background:'#2D4A7A', fontSize:11}}>Prob.</th><th style={{background:'#2D4A7A', fontSize:11}}>EV</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{textAlign:'left'}}>Akurasi & Kepatuhan</td>
                <td><span className="badge badge-benefit">Benefit</span></td>
                <td>0.60</td>
                <td><input className="input" defaultValue="80" /></td><td><input className="input" defaultValue="0.8" /></td><td><strong>38.4</strong></td>
                <td><input className="input" defaultValue="100" /></td><td><input className="input" defaultValue="0.7" /></td><td><strong>42.0</strong></td>
              </tr>
              <tr>
                <td style={{textAlign:'left'}}>Kecepatan Konsolidasi</td>
                <td><span className="badge badge-benefit">Benefit</span></td>
                <td>0.40</td>
                <td><input className="input" defaultValue="40" /></td><td><input className="input" defaultValue="0.8" /></td><td><strong>12.8</strong></td>
                <td><input className="input" defaultValue="90" /></td><td><input className="input" defaultValue="0.7" /></td><td><strong>25.2</strong></td>
              </tr>
              <tr>
                <td style={{textAlign:'left'}}>Beban Anggaran DIPA</td>
                <td><span className="badge badge-cost">Cost</span></td>
                <td>0.70</td>
                <td><input className="input" defaultValue="90" /></td><td><input className="input" defaultValue="0.5" /></td><td style={{color:'#991B1B'}}><strong>31.5</strong></td>
                <td><input className="input" defaultValue="20" /></td><td><input className="input" defaultValue="0.3" /></td><td style={{color:'#991B1B'}}><strong>4.2</strong></td>
              </tr>
              <tr>
                <td style={{textAlign:'left'}}>Beban Waktu & Training</td>
                <td><span className="badge badge-cost">Cost</span></td>
                <td>0.30</td>
                <td><input className="input" defaultValue="80" /></td><td><input className="input" defaultValue="0.5" /></td><td style={{color:'#991B1B'}}><strong>12.0</strong></td>
                <td><input className="input" defaultValue="60" /></td><td><input className="input" defaultValue="0.3" /></td><td style={{color:'#991B1B'}}><strong>5.4</strong></td>
              </tr>
              <tr style={{background:'#F8FAFC', fontWeight:700}}>
                <td colSpan="3" style={{textAlign:'right'}}>Expected Value (EV)</td>
                <td colSpan="3" style={{fontSize:18}}>7.7</td>
                <td colSpan="3" className="ev-highlight" style={{fontSize:18}}>57.6 🏆</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CHART */}
      <div className="phase-section">
        <h3>D. Visualisasi Perbandingan EV</h3>
        <div className="chart-container" style={{maxWidth:700}}>
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="alert alert-success" style={{marginTop:16, maxWidth:700}}>
          <span className="alert-icon">🏆</span>
          <div>
            <strong>Rekomendasi: Opsi B — Migrasi ke Platform Digital Terintegrasi</strong>
            <p style={{fontSize:13, marginTop:4}}>EV = 57.6, jauh melampaui Opsi A (7.7). Opsi ini mendemonstrasikan kelayakan sistemik yang lebih tinggi.</p>
          </div>
        </div>
      </div>

      <div className="phase-actions">
        <button className="btn btn-secondary" onClick={onPrev}>← Kembali ke Fase 03</button>
        <button className="btn btn-primary btn-lg" onClick={onNext}>Selesaikan Fase 04 →</button>
      </div>
    </div>
  )
}
