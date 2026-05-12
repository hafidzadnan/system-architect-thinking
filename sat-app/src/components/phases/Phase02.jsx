import { useState } from 'react'

export default function Phase02({ onNext, onPrev }) {
  const [unplottedTasks, setUnplottedTasks] = useState([
    { id: 1, name: 'Sosialisasi platform digital ke seluruh KPPN', u: '', i: '' },
    { id: 2, name: 'Penyusunan modul pelatihan teknis', u: '', i: '' },
  ])
  const [plottedTasks, setPlottedTasks] = useState([])
  
  const [manualTask, setManualTask] = useState({ name: '', u: '', i: '' })

  const getQuadrant = (q) => plottedTasks.filter(t => t.quadrant === q)

  const handlePlot = (task, isManual = false) => {
    if (!task.name || task.u === '' || task.i === '') return
    
    const uVal = parseFloat(task.u)
    const iVal = parseInt(task.i)
    
    let q = 4
    if (uVal >= 0.7 && iVal >= 70) q = 1
    else if (uVal < 0.7 && iVal >= 70) q = 2
    else if (uVal >= 0.7 && iVal < 70) q = 3
    
    setPlottedTasks([...plottedTasks, { ...task, id: isManual ? Date.now() : task.id, u: uVal, i: iVal, quadrant: q }])
    
    if (isManual) {
      setManualTask({ name: '', u: '', i: '' })
    } else {
      setUnplottedTasks(unplottedTasks.filter(t => t.id !== task.id))
    }
  }

  const handleEditPlotted = (task) => {
    setPlottedTasks(plottedTasks.filter(t => t.id !== task.id))
    setUnplottedTasks([...unplottedTasks, task])
  }

  const handleRemovePlotted = (id) => {
    setPlottedTasks(plottedTasks.filter(t => t.id !== id))
  }

  const updateUnplotted = (id, field, value) => {
    setUnplottedTasks(unplottedTasks.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  return (
    <div>
      <div className="phase-header">
        <h2>Fase 02 — Variable & Constraint Definition</h2>
        <p>Definisi Variabel & Batasan: Konversi data lingkungan menjadi variabel teknis yang terukur</p>
      </div>

      <div className="alert alert-info">
        <span className="alert-icon">ℹ️</span>
        <span>Variabel di bawah ini diambil secara otomatis dari Environmental Variable Mapping (EVM) pada Fase 01. Anda tidak dapat menambah atau menghapus variabel di fase ini.</span>
      </div>

      {/* DATA TAGGING */}
      <div className="phase-section">
        <h3>A. Data Tagging <span className="tooltip-wrap"><span className="tooltip-icon">?</span><span className="tooltip-content">Pisahkan antara fakta empiris (Hardcoded Data) dan asumsi/preferensi manajerial (Variable Parameter) secara tegas.</span></span></h3>
        <table className="var-table">
          <thead>
            <tr>
              <th style={{width:'22%'}}>Nama Variabel</th>
              <th style={{width:'30%'}}>Deskripsi</th>
              <th style={{width:'25%'}}>Sumber/Bukti</th>
              <th style={{width:'23%'}}>Tag</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><div style={{fontWeight: 500, fontSize: 13}}>Kapasitas SDM KPPN</div></td>
              <td><input className="input" defaultValue="Kapasitas bervariasi dalam mengadopsi teknologi baru" /></td>
              <td><input className="input" placeholder="Wajib diisi untuk Hardcoded" /></td>
              <td><select className="select"><option>Variable Parameter</option><option>Hardcoded Data</option></select></td>
            </tr>
            <tr>
              <td><div style={{fontWeight: 500, fontSize: 13}}>Luas Demografi Wilayah</div></td>
              <td><input className="input" defaultValue="Demografi luas dan kondisi jaringan internet bervariasi" /></td>
              <td><input className="input" defaultValue="Data geografis daerah" /></td>
              <td><select className="select"><option>Hardcoded Data</option><option>Variable Parameter</option></select></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* THRESHOLD */}
      <div className="phase-section">
        <h3>B. Threshold (Ambang Batas) <span className="tooltip-wrap"><span className="tooltip-icon">?</span><span className="tooltip-content"><strong>Static Threshold:</strong> Harga mati, jika tidak terpenuhi = fatal error. <strong>Dynamic Threshold:</strong> Korelasi positif/negatif, semakin tinggi/rendah semakin baik.</span></span></h3>
        <table className="var-table">
          <thead>
            <tr>
              <th style={{width:'30%'}}>Variabel</th>
              <th style={{width:'25%'}}>Jenis Threshold</th>
              <th style={{width:'45%'}}>Nilai/Kondisi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><div style={{fontWeight: 500, fontSize: 13}}>Kapasitas SDM KPPN</div></td>
              <td><select className="select"><option selected>Dynamic (Skala)</option><option>Static (Boolean)</option></select></td>
              <td><input className="input" defaultValue="Semakin tinggi skor adopsi teknologi, semakin baik" /></td>
            </tr>
            <tr>
              <td><div style={{fontWeight: 500, fontSize: 13}}>Luas Demografi Wilayah</div></td>
              <td><select className="select"><option>Static (Boolean)</option><option>Dynamic (Skala)</option></select></td>
              <td><input className="input" defaultValue="Aksesibilitas minimal jaringan 3G di setiap KPPN" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PRIORITY QUEUE */}
      <div className="phase-section">
        <h3>C. Priority Queue — Matriks Eisenhower <span className="tooltip-wrap"><span className="tooltip-icon">?</span><span className="tooltip-content">Kategorisasi prioritas berdasarkan Time Criticality Index (U) dan System Impact Index (I). U ≥ 0.7 = Mendesak, I ≥ 70 = Penting.</span></span></h3>
        
        {/* Table of Tasks to Plot */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 14, marginBottom: 12, color: '#475569' }}>Daftar tugas (tasks) di bawah ini diambil dari rekomendasi AI di Fase 01. Tentukan nilai U dan I untuk masing-masing task, lalu klik <strong>Plot</strong> untuk memasukkannya ke Matriks Eisenhower.</p>
          <table className="var-table">
            <thead>
              <tr>
                <th style={{width:'45%'}}>Nama Task / Opsi</th>
                <th style={{width:'20%'}}>Mendesak? (U: 0-1)</th>
                <th style={{width:'20%'}}>Penting? (I: 0-100)</th>
                <th style={{width:'15%'}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {unplottedTasks.map(task => (
                <tr key={task.id}>
                  <td><div style={{fontWeight: 500, fontSize: 13}}>{task.name}</div></td>
                  <td><input className="input" type="number" step="0.1" min="0" max="1" placeholder="0.0 - 1.0" value={task.u} onChange={e => updateUnplotted(task.id, 'u', e.target.value)} /></td>
                  <td><input className="input" type="number" min="0" max="100" placeholder="0 - 100" value={task.i} onChange={e => updateUnplotted(task.id, 'i', e.target.value)} /></td>
                  <td><button className="btn btn-sm btn-primary" onClick={() => handlePlot(task, false)}>+ Plot</button></td>
                </tr>
              ))}
              {/* Manual Input Row */}
              <tr style={{ background: '#F8FAFC' }}>
                <td><input className="input" placeholder="Ketik nama task baru (manual)..." value={manualTask.name} onChange={e => setManualTask({...manualTask, name: e.target.value})} /></td>
                <td><input className="input" type="number" step="0.1" min="0" max="1" placeholder="0.0 - 1.0" value={manualTask.u} onChange={e => setManualTask({...manualTask, u: e.target.value})} /></td>
                <td><input className="input" type="number" min="0" max="100" placeholder="0 - 100" value={manualTask.i} onChange={e => setManualTask({...manualTask, i: e.target.value})} /></td>
                <td><button className="btn btn-sm btn-secondary" onClick={() => handlePlot(manualTask, true)}>+ Plot Manual</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Matrix Visualization */}
        <div style={{display:'grid', gridTemplateColumns:'80px 1fr 1fr', gridTemplateRows:'auto auto auto', gap:0}}>
          {/* Y-axis labels */}
          <div></div>
          <div style={{textAlign:'center', padding:'8px 0', fontSize:13, fontWeight:600, color:'#64748B'}}>⏰ Mendesak (U ≥ 0.7)</div>
          <div style={{textAlign:'center', padding:'8px 0', fontSize:13, fontWeight:600, color:'#64748B'}}>📅 Tidak Mendesak (U &lt; 0.7)</div>

          {/* Row 1 - Penting */}
          <div style={{writingMode:'vertical-rl', transform:'rotate(180deg)', textAlign:'center', fontSize:13, fontWeight:600, color:'#64748B', display:'flex', alignItems:'center', justifyContent:'center'}}>⚡ Penting (I ≥ 70)</div>
          <div className="eq-cell eq-q1">
            <h4>Kuadran 1 — Interrupt Routine</h4>
            <div className="eq-subtitle">Penting & Mendesak → Eksekusi Langsung</div>
            {getQuadrant(1).map(t => (
              <div key={t.id} className="eq-task" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><div className="eq-task-name">{t.name}</div><div className="eq-task-meta">U: {t.u} | I: {t.i}</div></div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12 }} onClick={() => handleEditPlotted(t)} title="Edit / Re-plot">✏️</button>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#991B1B' }} onClick={() => handleRemovePlotted(t.id)} title="Hapus">✕</button>
                </div>
              </div>
            ))}
            {getQuadrant(1).length === 0 && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, fontStyle: 'italic' }}>Kosong</div>}
          </div>
          <div className="eq-cell eq-q2">
            <h4>Kuadran 2 — Cron Job</h4>
            <div className="eq-subtitle">Penting & Tidak Mendesak → Jadwalkan</div>
            {getQuadrant(2).map(t => (
              <div key={t.id} className="eq-task" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><div className="eq-task-name">{t.name}</div><div className="eq-task-meta">U: {t.u} | I: {t.i}</div></div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12 }} onClick={() => handleEditPlotted(t)} title="Edit / Re-plot">✏️</button>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#991B1B' }} onClick={() => handleRemovePlotted(t.id)} title="Hapus">✕</button>
                </div>
              </div>
            ))}
            {getQuadrant(2).length === 0 && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, fontStyle: 'italic' }}>Kosong</div>}
          </div>

          {/* Row 2 - Tidak Penting */}
          <div style={{writingMode:'vertical-rl', transform:'rotate(180deg)', textAlign:'center', fontSize:13, fontWeight:600, color:'#64748B', display:'flex', alignItems:'center', justifyContent:'center'}}>📋 Tidak Penting (I &lt; 70)</div>
          <div className="eq-cell eq-q3">
            <h4>Kuadran 3 — Daemon Process</h4>
            <div className="eq-subtitle">Tidak Penting & Mendesak → Delegasikan</div>
            {getQuadrant(3).map(t => (
              <div key={t.id} className="eq-task" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><div className="eq-task-name">{t.name}</div><div className="eq-task-meta">U: {t.u} | I: {t.i}</div></div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12 }} onClick={() => handleEditPlotted(t)} title="Edit / Re-plot">✏️</button>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#991B1B' }} onClick={() => handleRemovePlotted(t.id)} title="Hapus">✕</button>
                </div>
              </div>
            ))}
            {getQuadrant(3).length === 0 && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, fontStyle: 'italic' }}>Kosong</div>}
          </div>
          <div className="eq-cell eq-q4">
            <h4>Kuadran 4 — Garbage Collection</h4>
            <div className="eq-subtitle">Tidak Penting & Tidak Mendesak → Hapus</div>
            {getQuadrant(4).map(t => (
              <div key={t.id} className="eq-task" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><div className="eq-task-name">{t.name}</div><div className="eq-task-meta">U: {t.u} | I: {t.i}</div></div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12 }} onClick={() => handleEditPlotted(t)} title="Edit / Re-plot">✏️</button>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#991B1B' }} onClick={() => handleRemovePlotted(t.id)} title="Hapus">✕</button>
                </div>
              </div>
            ))}
            {getQuadrant(4).length === 0 && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, fontStyle: 'italic' }}>Kosong</div>}
          </div>
        </div>
      </div>

      <div className="phase-actions">
        <button className="btn btn-secondary" onClick={onPrev}>← Kembali ke Fase 01</button>
        <button className="btn btn-primary btn-lg" onClick={onNext}>Selesaikan Fase 02 →</button>
      </div>
    </div>
  )
}
