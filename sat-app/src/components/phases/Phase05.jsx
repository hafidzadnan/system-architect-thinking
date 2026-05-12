import { useState } from 'react'

export default function Phase05({ onNext, onPrev }) {
  const [selectedQuadrant, setSelectedQuadrant] = useState('intelligent')

  return (
    <div>
      <div className="phase-header">
        <h2>Fase 05 — Output Validation & System Monitoring</h2>
        <p>Validasi Output & Pemantauan: Protokol mitigasi risiko pasca-keputusan</p>
      </div>

      {/* ZOMBIE PROCESS */}
      <div className="phase-section">
        <h3>A. Zombie Process Check <span style={{fontSize:13, fontWeight:400, color:'#64748B'}}>(Mitigasi Sunk-Cost Fallacy)</span>
          <span className="tooltip-wrap"><span className="tooltip-icon">?</span><span className="tooltip-content">Zombie Process: program yang sudah gagal tapi enggan dihentikan karena sudah banyak investasi. Keputusan dilanjutkan/dihentikan berdasarkan EV ke depan, bukan investasi masa lalu.</span></span>
        </h3>
        <div className="card" style={{maxWidth:700}}>
          <p style={{fontWeight:500, marginBottom:12}}>Apakah Expected Value ke depan masih positif jika keputusan ini dijalankan selama 3–6 bulan?</p>
          <div style={{display:'flex', gap:16, marginBottom:12}}>
            <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer'}}><input type="radio" name="zombie" defaultChecked /> Ya, EV masih positif</label>
            <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer'}}><input type="radio" name="zombie" /> Tidak, perlu rollback</label>
          </div>
          <div className="form-group">
            <label>Justifikasi:</label>
            <textarea className="textarea" defaultValue="Berdasarkan kalkulasi Fase 04, Opsi B menunjukkan EV 57.6 yang jauh lebih tinggi. Dengan biaya cloud hanya Rp 2 Juta/tahun dan potensi penghematan pagu perjalanan dinas, EV ke depan diprediksi tetap positif." />
          </div>
        </div>
      </div>

      {/* COBRA EFFECT */}
      <div className="phase-section">
        <h3>B. Cobra Effect Monitoring Plan <span style={{fontSize:13, fontWeight:400, color:'#64748B'}}>(Deteksi Recursive Loop Error)</span>
          <span className="tooltip-wrap"><span className="tooltip-icon">?</span><span className="tooltip-content">Cobra Effect: keputusan yang dirancang untuk menyelesaikan masalah justru memperparah masalah karena salah mendefinisikan parameter insentif.</span></span>
        </h3>
        <div className="card" style={{maxWidth:700}}>
          <div className="form-group">
            <label>Metrik yang Dipantau</label>
            <div className="dynamic-list">
              <div className="dynamic-list-item"><input className="input" defaultValue="Persentase KPPN yang mengisi dashboard tepat waktu" /><button className="btn-remove">✕</button></div>
              <div className="dynamic-list-item"><input className="input" defaultValue="Jumlah laporan yang diisi dengan data kosong/dummy" /><button className="btn-remove">✕</button></div>
              <div className="dynamic-list-item"><input className="input" defaultValue="Durasi konsolidasi laporan (sebelum vs sesudah)" /><button className="btn-remove">✕</button></div>
            </div>
            <button className="btn btn-sm btn-ghost" style={{marginTop:4}}>+ Tambah Metrik</button>
          </div>
          <div className="form-group">
            <label>Interval Pemantauan</label>
            <select className="select" style={{maxWidth:300}}>
              <option>Mingguan</option>
              <option selected>Bulanan</option>
              <option>Triwulanan</option>
            </select>
          </div>
          <div className="form-group">
            <label>Trigger Rollback</label>
            <textarea className="textarea" defaultValue="Jika dalam 3 bulan penggunaan dashboard tidak mengurangi durasi konsolidasi laporan secara signifikan (>20%), atau jika terdeteksi >30% data yang diisi bersifat dummy, maka dilakukan rollback ke sistem supervisi fisik." />
          </div>
        </div>
      </div>

      {/* STAKEHOLDER IMPACT MATRIX */}
      <div className="phase-section">
        <h3>C. Stakeholder Impact Matrix <span style={{fontSize:13, fontWeight:400, color:'#64748B'}}>(Adaptasi Cipolla Matrix)</span></h3>
        <p style={{fontSize:13, color:'#64748B', marginBottom:16}}>Pilih kuadran yang menggambarkan dampak keputusan terhadap pihak internal dan eksternal:</p>
        <div className="stakeholder-grid">
          <div className={`stakeholder-cell sq-intelligent ${selectedQuadrant==='intelligent'?'selected':''}`} onClick={()=>setSelectedQuadrant('intelligent')}>
            <h4>🟢 Intelligent (Win-Win)</h4>
            <p>Internal (+) & Eksternal (+)</p>
            <p style={{fontSize:11, marginTop:4, color:'#64748B'}}>Contoh: Digitalisasi yang cepat dan mudah bagi semua pihak</p>
          </div>
          <div className={`stakeholder-cell sq-bandit ${selectedQuadrant==='bandit'?'selected':''}`} onClick={()=>setSelectedQuadrant('bandit')}>
            <h4>🟡 Bandit (Win-Lose)</h4>
            <p>Internal (+) & Eksternal (−)</p>
            <p style={{fontSize:11, marginTop:4, color:'#64748B'}}>Contoh: DJPb untung tapi Satker terbebani laporan berlapis</p>
          </div>
          <div className={`stakeholder-cell sq-helpless ${selectedQuadrant==='helpless'?'selected':''}`} onClick={()=>setSelectedQuadrant('helpless')}>
            <h4>🔵 Helpless (Lose-Win)</h4>
            <p>Internal (−) & Eksternal (+)</p>
            <p style={{fontSize:11, marginTop:4, color:'#64748B'}}>Contoh: Pegawai KPPN kelelahan mengerjakan tugas entry Satker</p>
          </div>
          <div className={`stakeholder-cell sq-stupid ${selectedQuadrant==='stupid'?'selected':''}`} onClick={()=>setSelectedQuadrant('stupid')}>
            <h4>🔴 Stupid (Lose-Lose)</h4>
            <p>Internal (−) & Eksternal (−)</p>
            <p style={{fontSize:11, marginTop:4, color:'#64748B'}}>Contoh: Aturan yang membingungkan semua pihak</p>
          </div>
        </div>
        <div className="form-group" style={{marginTop:16, maxWidth:700}}>
          <label>Justifikasi Pemilihan Kuadran:</label>
          <textarea className="textarea" defaultValue="Kanwil mendapatkan data kinerja KPPN secara real-time (Internal Benefit +), sementara KPPN tidak perlu sering menerima tamu dinas sehingga bisa lebih fokus bekerja (External Benefit +). Status: Intelligent (Win-Win)." />
        </div>
      </div>

      <div className="phase-actions">
        <button className="btn btn-secondary" onClick={onPrev}>← Kembali ke Fase 04</button>
        <button className="btn btn-success btn-lg" onClick={onNext}>✅ Selesaikan Sesi Keputusan</button>
      </div>
    </div>
  )
}
