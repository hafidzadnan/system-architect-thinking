import { useMemo } from 'react'
import {
  useSessionStore,
  selectPhase04Results,
} from '../../stores/sessionStore'
import {
  MONITORING_INTERVALS,
  STAKEHOLDER_QUADRANTS,
} from '../../utils/constants'
import { findBestOption } from '../../utils/evCalculator'

export default function Phase05({ onNext, onPrev }) {
  const phase01 = useSessionStore((s) => s.phase01)
  const phase02 = useSessionStore((s) => s.phase02)
  const phase04 = useSessionStore((s) => s.phase04)
  const phase05 = useSessionStore((s) => s.phase05)
  const setPhase05Field = useSessionStore((s) => s.setPhase05Field)
  const addPhase05Metric = useSessionStore((s) => s.addPhase05Metric)
  const updatePhase05Metric = useSessionStore((s) => s.updatePhase05Metric)
  const removePhase05Metric = useSessionStore((s) => s.removePhase05Metric)

  const state = useMemo(
    () => ({ phase01, phase02, phase04 }),
    [phase01, phase02, phase04],
  )
  const results = useMemo(() => selectPhase04Results(state), [state])
  const bestOption = findBestOption(results)

  const canFinish =
    Boolean(phase05.stakeholderQuadrant) &&
    Boolean(phase05.stakeholderJustification.trim())

  return (
    <div>
      <div className="phase-header">
        <h2>Fase 05 — Output Validation &amp; System Monitoring</h2>
        <p>
          Validasi Output &amp; Pemantauan: Protokol mitigasi risiko
          pasca-keputusan
        </p>
      </div>

      {/* ZOMBIE PROCESS */}
      <div className="phase-section">
        <h3>
          A. Zombie Process Check{' '}
          <span style={{ fontSize: 13, fontWeight: 400, color: '#64748B' }}>
            (Mitigasi Sunk-Cost Fallacy)
          </span>
          <span className="tooltip-wrap">
            <span className="tooltip-icon">?</span>
            <span className="tooltip-content">
              Zombie Process: program yang sudah gagal tapi enggan dihentikan
              karena sudah banyak investasi. Keputusan dilanjutkan/dihentikan
              berdasarkan EV ke depan, bukan investasi masa lalu.
            </span>
          </span>
        </h3>
        <div className="card" style={{ maxWidth: 700 }}>
          <div className="alert alert-info" style={{ marginBottom: 12 }}>
            <span className="alert-icon">📊</span>
            <span>
              {bestOption ? (
                <>
                  Hasil Fase 04:{' '}
                  <strong>{bestOption.name.trim() || 'Opsi terbaik'}</strong>{' '}
                  dengan EV = <strong>{bestOption.ev.toFixed(1)}</strong>.
                </>
              ) : (
                <>
                  Fase 04 belum menghasilkan opsi dengan EV positif —
                  pertimbangkan rollback atau tinjau ulang Root Objective.
                </>
              )}
            </span>
          </div>

          <p style={{ fontWeight: 500, marginBottom: 12 }}>
            Apakah Expected Value ke depan masih positif jika keputusan ini
            dijalankan selama 3–6 bulan?
          </p>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <label style={radioLabelStyle}>
              <input
                type="radio"
                name="zombie"
                value="positive"
                checked={phase05.zombieStatus === 'positive'}
                onChange={(e) =>
                  setPhase05Field('zombieStatus', e.target.value)
                }
              />{' '}
              Ya, EV masih positif
            </label>
            <label style={radioLabelStyle}>
              <input
                type="radio"
                name="zombie"
                value="rollback"
                checked={phase05.zombieStatus === 'rollback'}
                onChange={(e) =>
                  setPhase05Field('zombieStatus', e.target.value)
                }
              />{' '}
              Tidak, perlu rollback
            </label>
          </div>
          <div className="form-group">
            <label>Justifikasi:</label>
            <textarea
              className="textarea"
              placeholder="Jelaskan dasar penilaian EV ke depan..."
              value={phase05.zombieJustification}
              onChange={(e) =>
                setPhase05Field('zombieJustification', e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* COBRA EFFECT */}
      <div className="phase-section">
        <h3>
          B. Cobra Effect Monitoring Plan{' '}
          <span style={{ fontSize: 13, fontWeight: 400, color: '#64748B' }}>
            (Deteksi Recursive Loop Error)
          </span>
          <span className="tooltip-wrap">
            <span className="tooltip-icon">?</span>
            <span className="tooltip-content">
              Cobra Effect: keputusan yang dirancang untuk menyelesaikan masalah
              justru memperparah masalah karena salah mendefinisikan parameter
              insentif.
            </span>
          </span>
        </h3>
        <div className="card" style={{ maxWidth: 700 }}>
          <div className="form-group">
            <label>Metrik yang Dipantau</label>
            <div className="dynamic-list">
              {phase05.metrics.map((row) => (
                <div key={row.id} className="dynamic-list-item">
                  <input
                    className="input"
                    placeholder="Contoh: Jumlah laporan yang diisi dengan data dummy"
                    value={row.value}
                    onChange={(e) =>
                      updatePhase05Metric(row.id, e.target.value)
                    }
                  />
                  <button
                    className="btn-remove"
                    onClick={() => removePhase05Metric(row.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              className="btn btn-sm btn-ghost"
              style={{ marginTop: 4 }}
              onClick={addPhase05Metric}
            >
              + Tambah Metrik
            </button>
          </div>
          <div className="form-group">
            <label>Interval Pemantauan</label>
            <select
              className="select"
              style={{ maxWidth: 300 }}
              value={phase05.interval}
              onChange={(e) => setPhase05Field('interval', e.target.value)}
            >
              {MONITORING_INTERVALS.map((interval) => (
                <option key={interval} value={interval}>
                  {interval}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Trigger Rollback</label>
            <textarea
              className="textarea"
              placeholder="Kondisi terukur yang memicu rollback..."
              value={phase05.rollbackTrigger}
              onChange={(e) =>
                setPhase05Field('rollbackTrigger', e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* STAKEHOLDER IMPACT MATRIX */}
      <div className="phase-section">
        <h3>
          C. Stakeholder Impact Matrix{' '}
          <span style={{ fontSize: 13, fontWeight: 400, color: '#64748B' }}>
            (Adaptasi Cipolla Matrix)
          </span>
        </h3>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
          Pilih kuadran yang menggambarkan dampak keputusan terhadap pihak
          internal dan eksternal:
        </p>
        <div className="stakeholder-grid">
          {STAKEHOLDER_QUADRANTS.map((quadrant) => (
            <div
              key={quadrant.key}
              className={`stakeholder-cell ${quadrant.className} ${
                phase05.stakeholderQuadrant === quadrant.key ? 'selected' : ''
              }`}
              onClick={() =>
                setPhase05Field('stakeholderQuadrant', quadrant.key)
              }
            >
              <h4>{quadrant.title}</h4>
              <p>{quadrant.axes}</p>
              <p style={{ fontSize: 11, marginTop: 4, color: '#64748B' }}>
                {quadrant.example}
              </p>
            </div>
          ))}
        </div>
        <div className="form-group" style={{ marginTop: 16, maxWidth: 700 }}>
          <label>Justifikasi Pemilihan Kuadran:</label>
          <textarea
            className="textarea"
            placeholder="Jelaskan dampak ke pihak internal dan eksternal..."
            value={phase05.stakeholderJustification}
            onChange={(e) =>
              setPhase05Field('stakeholderJustification', e.target.value)
            }
          />
        </div>
      </div>

      {!canFinish && (
        <div className="alert alert-warning">
          <span className="alert-icon">⚠️</span>
          <span>
            Pilih satu kuadran Stakeholder Impact Matrix dan isi justifikasinya
            sebelum menyelesaikan sesi.
          </span>
        </div>
      )}

      <div className="phase-actions">
        <button className="btn btn-secondary" onClick={onPrev}>
          ← Kembali ke Fase 04
        </button>
        <button
          className="btn btn-success btn-lg"
          disabled={!canFinish}
          onClick={onNext}
        >
          ✅ Selesaikan Sesi Keputusan
        </button>
      </div>
    </div>
  )
}

const radioLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
}
