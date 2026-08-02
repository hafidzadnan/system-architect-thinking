import { useMemo } from 'react'
import {
  useSessionStore,
  selectPhase02Variables,
  selectPhase04Results,
} from '../../stores/sessionStore'
import { QUADRANTS } from '../../utils/eisenhowerLogic'
import { STAKEHOLDER_LABELS } from '../../utils/constants'
import { findBestOption } from '../../utils/evCalculator'

const FUNCTION_TAG_LABELS = {
  hygienic: 'Hygienic Function',
  motivational: 'Motivational Function',
}

const EMPTY = '(belum diisi)'

export default function SessionSummary({ onPrev }) {
  const phase01 = useSessionStore((s) => s.phase01)
  const phase02 = useSessionStore((s) => s.phase02)
  const phase03 = useSessionStore((s) => s.phase03)
  const phase04 = useSessionStore((s) => s.phase04)
  const phase05 = useSessionStore((s) => s.phase05)

  const state = useMemo(
    () => ({ phase01, phase02, phase04 }),
    [phase01, phase02, phase04],
  )
  const variables = useMemo(() => selectPhase02Variables(state), [state])
  const results = useMemo(() => selectPhase04Results(state), [state])
  const bestOption = findBestOption(results)

  // Kuadran Eisenhower per variabel dicocokkan lewat task yang sudah di-plot.
  const quadrantByTaskId = useMemo(
    () => new Map(phase02.plotted.map((t) => [t.id, t.quadrant])),
    [phase02.plotted],
  )

  const warningCount = phase03.validations.reduce(
    (count, v) =>
      count +
      Object.values(v.biases).filter((b) => b.status === 'warning').length,
    0,
  )

  const filledMetrics = phase05.metrics.filter((m) => m.value.trim())

  return (
    <div>
      <div className="phase-header">
        <h2>Ringkasan Keputusan</h2>
        <p>Dokumen akhir hasil analisis System Architect Thinking</p>
      </div>

      <div className="alert alert-success" style={{ marginBottom: 24 }}>
        <span className="alert-icon">✅</span>
        <span>
          Sesi keputusan telah diselesaikan. Ringkasan di bawah dibangun
          otomatis dari data yang Anda isi pada Fase 01–05.
        </span>
      </div>

      {/* FASE 01 */}
      <div className="summary-section">
        <h3>1. System Requirements (Fase 01)</h3>
        <div className="summary-item">
          <span className="summary-label">Root Objective</span>
          <span className="summary-value">
            {phase01.rootObjective.trim() || EMPTY}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Function Tag</span>
          <span className="summary-value">
            {phase01.functionTag ? (
              <span className="badge badge-draft">
                {FUNCTION_TAG_LABELS[phase01.functionTag]}
              </span>
            ) : (
              EMPTY
            )}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Justifikasi Tag</span>
          <span className="summary-value">
            {phase01.functionJustification.trim() || EMPTY}
          </span>
        </div>
      </div>

      {/* FASE 02 */}
      <div className="summary-section">
        <h3>2. Variables &amp; Constraints (Fase 02)</h3>
        {variables.length === 0 ? (
          <p style={{ fontSize: 14, color: '#94A3B8' }}>{EMPTY}</p>
        ) : (
          <div className="table-responsive">
            <table className="var-table">
              <thead>
                <tr>
                  <th>Nama Variabel</th>
                  <th>Tag</th>
                  <th>Threshold</th>
                </tr>
              </thead>
              <tbody>
                {variables.map((v) => (
                  <tr key={v.id}>
                    <td>{v.name}</td>
                    <td>
                      {v.tag ? (
                        <span
                          className={`badge ${
                            v.tag === 'Hardcoded Data'
                              ? 'badge-draft'
                              : 'badge-warning'
                          }`}
                        >
                          {v.tag}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>{EMPTY}</span>
                      )}
                    </td>
                    <td>
                      {v.thresholdValue.trim() || (
                        <span style={{ color: '#94A3B8' }}>{EMPTY}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {phase02.plotted.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <span
              className="summary-label"
              style={{ display: 'block', marginBottom: 8 }}
            >
              Priority Queue (Matriks Eisenhower):
            </span>
            <div className="table-responsive">
              <table className="var-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>U / I</th>
                    <th>Kuadran</th>
                  </tr>
                </thead>
                <tbody>
                  {phase02.plotted.map((task) => {
                    const quadrant = QUADRANTS.find(
                      (q) => q.id === quadrantByTaskId.get(task.id),
                    )
                    return (
                      <tr key={task.id}>
                        <td>{task.name}</td>
                        <td>
                          {task.u} / {task.i}
                        </td>
                        <td>
                          <span className="badge badge-progress">
                            {quadrant?.title ?? '—'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* FASE 03 */}
      <div className="summary-section">
        <h3>3. Logic Sanitization (Fase 03)</h3>
        <div className="summary-item">
          <span className="summary-label">Total Variabel Dianalisis</span>
          <span className="summary-value">
            {phase03.validations.length > 0
              ? `${phase03.validations.length} Variabel`
              : EMPTY}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Status Sanitasi</span>
          <span className="summary-value">
            {phase03.validations.length === 0 ? (
              EMPTY
            ) : warningCount > 0 ? (
              <span className="badge badge-warning">
                {warningCount} Warning Tersisa
              </span>
            ) : (
              <span className="badge badge-done">Semua Lolos Validasi</span>
            )}
          </span>
        </div>
        {phase03.analyzedAt && (
          <div className="summary-item">
            <span className="summary-label">Analisis Terakhir</span>
            <span className="summary-value">
              {new Date(phase03.analyzedAt).toLocaleString('id-ID')}
            </span>
          </div>
        )}
      </div>

      {/* FASE 04 */}
      <div className="summary-section">
        <h3>4. Computation &amp; Expected Value (Fase 04)</h3>
        {phase04.criteria.length === 0 ? (
          <p style={{ fontSize: 14, color: '#94A3B8' }}>{EMPTY}</p>
        ) : (
          <>
            {results.map((r, idx) => (
              <div className="summary-item" key={r.optionId}>
                <span className="summary-label">
                  {r.name.trim() || `Opsi ${String.fromCharCode(65 + idx)}`}
                </span>
                <span
                  className="summary-value"
                  style={
                    bestOption?.optionId === r.optionId
                      ? { color: '#166534', fontWeight: 700 }
                      : undefined
                  }
                >
                  EV = {r.ev.toFixed(1)}
                  {bestOption?.optionId === r.optionId ? ' 🏆' : ''}
                </span>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <span
                className="summary-label"
                style={{ display: 'block', marginBottom: 4 }}
              >
                Keputusan Rekomendasi:
              </span>
              {bestOption ? (
                <div
                  style={{
                    padding: 12,
                    background: 'var(--success-bg)',
                    borderRadius: 8,
                    border: '1px solid var(--success-border)',
                    color: 'var(--success)',
                    fontWeight: 600,
                  }}
                >
                  {bestOption.name.trim() || 'Opsi terbaik'} — EV{' '}
                  {bestOption.ev.toFixed(1)}
                </div>
              ) : (
                <div
                  style={{
                    padding: 12,
                    background: 'var(--warning-bg)',
                    borderRadius: 8,
                    border: '1px solid var(--warning-border)',
                    color: 'var(--warning)',
                    fontWeight: 600,
                  }}
                >
                  Tidak ada opsi dengan EV positif — tinjau ulang Root
                  Objective.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* FASE 05 */}
      <div className="summary-section">
        <h3>5. Output Validation (Fase 05)</h3>
        <div className="summary-item">
          <span className="summary-label">Zombie Process Check</span>
          <span className="summary-value">
            {phase05.zombieStatus === 'positive' ? (
              <span className="badge badge-done">
                Aman (EV Ke Depan Positif)
              </span>
            ) : (
              <span className="badge badge-error">Perlu Rollback</span>
            )}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Cobra Effect Monitoring</span>
          <span className="summary-value">
            {filledMetrics.length > 0
              ? `Pemantauan ${phase05.interval} (${filledMetrics.length} Metrik)`
              : EMPTY}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Trigger Rollback</span>
          <span className="summary-value">
            {phase05.rollbackTrigger.trim() || EMPTY}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Stakeholder Matrix</span>
          <span className="summary-value">
            {phase05.stakeholderQuadrant ? (
              <span className="badge badge-benefit">
                {STAKEHOLDER_LABELS[phase05.stakeholderQuadrant]}
              </span>
            ) : (
              EMPTY
            )}
          </span>
        </div>
      </div>

      <div
        className="phase-actions"
        style={{ justifyContent: 'space-between', marginTop: 40 }}
      >
        <button className="btn btn-secondary" onClick={onPrev}>
          ← Kembali ke Fase 05
        </button>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => window.print()}
        >
          🖨️ Cetak / Simpan PDF
        </button>
      </div>
    </div>
  )
}
