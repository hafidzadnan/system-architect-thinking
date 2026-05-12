import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../stores/sessionStore'

const statusLabels = { draft: 'Draft', progress: 'Berlangsung', done: 'Selesai' }
const statusClass = { draft: 'badge-draft', progress: 'badge-progress', done: 'badge-done' }

export default function DashboardPage() {
  const { sessions, setActiveSession } = useSessionStore()
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.status === filter)

  const openSession = (id) => {
    setActiveSession(id)
    navigate(`/session/${id}`)
  }

  return (
    <div className="page-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Kelola sesi pengambilan keputusan Anda</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Buat Sesi Baru</button>
      </div>

      <div className="filter-bar">
        {['all', 'draft', 'progress', 'done'].map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Semua' : statusLabels[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Belum ada sesi keputusan</h3>
          <p>Buat sesi baru untuk memulai proses pengambilan keputusan terstruktur.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Buat Sesi Baru</button>
        </div>
      ) : (
        <div className="session-grid">
          {filtered.map(session => (
            <div key={session.id} className="card card-clickable" onClick={() => openSession(session.id)}>
              <div className="card-header">
                <span className="card-title">{session.title}</span>
                <span className={`badge ${statusClass[session.status]}`}>{statusLabels[session.status]}</span>
              </div>
              <div className="card-body">
                <p>{session.description}</p>
              </div>
              <div className="card-footer" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>📅 Target: {session.targetDate}</span>
                <span style={{ fontSize: 13, color: '#64748B' }}>Fase {session.currentPhase} dari 5</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${(session.currentPhase / 5) * 100}%` }} /></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Buat Sesi Keputusan Baru</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Judul Sesi *</label>
              <input className="input" placeholder="Contoh: Migrasi Supervisi KPPN ke Platform Digital" maxLength={100} />
              <span className="form-hint">Maksimal 100 karakter</span>
            </div>
            <div className="form-group">
              <label>Deskripsi</label>
              <textarea className="textarea" placeholder="Deskripsi singkat tentang keputusan yang akan dianalisis..." />
            </div>
            <div className="form-group">
              <label>Tanggal Target Keputusan</label>
              <input className="input" type="date" />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" /> Gunakan template studi kasus (Migrasi Supervisi KPPN)
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={() => { setShowModal(false); openSession('1') }}>Buat Sesi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
