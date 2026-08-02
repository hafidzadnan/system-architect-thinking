import { useMemo, useState } from 'react'
import {
  useSessionStore,
  selectPhase02Variables,
  selectPhase02UnplottedTasks,
} from '../../stores/sessionStore'
import { QUADRANTS } from '../../utils/eisenhowerLogic'
import { TAG_OPTIONS, THRESHOLD_TYPES } from '../../utils/constants'

const emptyManualTask = { name: '', u: '', i: '' }

export default function Phase02({ onNext, onPrev }) {
  const phase01 = useSessionStore((s) => s.phase01)
  const phase02 = useSessionStore((s) => s.phase02)
  const setPhase02Variable = useSessionStore((s) => s.setPhase02Variable)
  const setPhase02TaskInput = useSessionStore((s) => s.setPhase02TaskInput)
  const plotPhase02Task = useSessionStore((s) => s.plotPhase02Task)
  const addPhase02ManualTask = useSessionStore((s) => s.addPhase02ManualTask)
  const unplotPhase02Task = useSessionStore((s) => s.unplotPhase02Task)
  const removePhase02Task = useSessionStore((s) => s.removePhase02Task)

  // Baris input manual bersifat sementara (belum jadi task), jadi cukup
  // state lokal — begitu di-plot, datanya pindah ke store.
  const [manualTask, setManualTask] = useState(emptyManualTask)

  // Selector mengembalikan array baru tiap panggilan, jadi dihitung lewat
  // useMemo di sini alih-alih dipakai langsung sebagai selector zustand.
  const state = useMemo(() => ({ phase01, phase02 }), [phase01, phase02])
  const variables = useMemo(() => selectPhase02Variables(state), [state])
  const unplottedTasks = useMemo(
    () => selectPhase02UnplottedTasks(state),
    [state],
  )

  const missingSourceCount = variables.filter((v) => v.needsSource).length

  const isPlottable = (task) =>
    Boolean(task.name.trim()) && task.u !== '' && task.i !== ''

  const handlePlotManual = () => {
    if (!isPlottable(manualTask)) return
    addPhase02ManualTask({ ...manualTask, name: manualTask.name.trim() })
    setManualTask(emptyManualTask)
  }

  if (variables.length === 0) {
    return (
      <div>
        <div className="phase-header">
          <h2>Fase 02 — Variable &amp; Constraint Definition</h2>
          <p>
            Definisi Variabel &amp; Batasan: Konversi data lingkungan menjadi
            variabel teknis yang terukur
          </p>
        </div>

        <div className="empty-state">
          <div className="empty-icon">🧩</div>
          <h3>Belum ada variabel untuk didefinisikan</h3>
          <p>
            Variabel di fase ini diambil otomatis dari Environmental Variable
            Mapping (EVM) pada Fase 01. Lengkapi dulu Parameter Internal atau
            Constraint Eksternal di sana.
          </p>
          <button className="btn btn-primary" onClick={onPrev}>
            ← Kembali ke Fase 01
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="phase-header">
        <h2>Fase 02 — Variable &amp; Constraint Definition</h2>
        <p>
          Definisi Variabel &amp; Batasan: Konversi data lingkungan menjadi
          variabel teknis yang terukur
        </p>
      </div>

      <div className="alert alert-info">
        <span className="alert-icon">ℹ️</span>
        <span>
          Variabel di bawah ini diambil secara otomatis dari Environmental
          Variable Mapping (EVM) pada Fase 01. Anda tidak dapat menambah atau
          menghapus variabel di fase ini.
        </span>
      </div>

      {/* DATA TAGGING */}
      <div className="phase-section">
        <h3>
          A. Data Tagging{' '}
          <span className="tooltip-wrap">
            <span className="tooltip-icon">?</span>
            <span className="tooltip-content">
              Pisahkan antara fakta empiris (Hardcoded Data) dan
              asumsi/preferensi manajerial (Variable Parameter) secara tegas.
            </span>
          </span>
        </h3>
        <div className="table-responsive">
          <table className="var-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Nama Variabel</th>
                <th style={{ width: '30%' }}>Deskripsi</th>
                <th style={{ width: '25%' }}>Sumber/Bukti</th>
                <th style={{ width: '23%' }}>Tag</th>
              </tr>
            </thead>
            <tbody>
              {variables.map((v) => (
                <tr key={v.id} className={v.needsSource ? 'warning-row' : ''}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>
                      {v.name}
                    </div>
                    <div
                      style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}
                    >
                      {v.origin === 'internal'
                        ? 'Parameter Internal'
                        : 'Constraint Eksternal'}
                    </div>
                  </td>
                  <td>
                    <input
                      className="input"
                      placeholder="Deskripsi variabel..."
                      value={v.description}
                      onChange={(e) =>
                        setPhase02Variable(v.id, 'description', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      placeholder="Wajib diisi untuk Hardcoded"
                      value={v.source}
                      onChange={(e) =>
                        setPhase02Variable(v.id, 'source', e.target.value)
                      }
                    />
                    {v.needsSource && (
                      <span
                        className="form-hint"
                        style={{ color: 'var(--error)' }}
                      >
                        Hardcoded Data wajib menyertakan sumber/bukti.
                      </span>
                    )}
                  </td>
                  <td>
                    <select
                      className="select"
                      value={v.tag}
                      onChange={(e) =>
                        setPhase02Variable(v.id, 'tag', e.target.value)
                      }
                    >
                      <option value="">— Pilih tag —</option>
                      {TAG_OPTIONS.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* THRESHOLD */}
      <div className="phase-section">
        <h3>
          B. Threshold (Ambang Batas){' '}
          <span className="tooltip-wrap">
            <span className="tooltip-icon">?</span>
            <span className="tooltip-content">
              <strong>Static Threshold:</strong> Harga mati, jika tidak
              terpenuhi = fatal error. <strong>Dynamic Threshold:</strong>{' '}
              Korelasi positif/negatif, semakin tinggi/rendah semakin baik.
            </span>
          </span>
        </h3>
        <div className="table-responsive">
          <table className="var-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Variabel</th>
                <th style={{ width: '25%' }}>Jenis Threshold</th>
                <th style={{ width: '45%' }}>Nilai/Kondisi</th>
              </tr>
            </thead>
            <tbody>
              {variables.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>
                      {v.name}
                    </div>
                  </td>
                  <td>
                    <select
                      className="select"
                      value={v.thresholdType}
                      onChange={(e) =>
                        setPhase02Variable(
                          v.id,
                          'thresholdType',
                          e.target.value,
                        )
                      }
                    >
                      <option value="">— Pilih jenis —</option>
                      {THRESHOLD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="input"
                      placeholder="Contoh: Semakin tinggi skor adopsi, semakin baik"
                      value={v.thresholdValue}
                      onChange={(e) =>
                        setPhase02Variable(
                          v.id,
                          'thresholdValue',
                          e.target.value,
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRIORITY QUEUE */}
      <div className="phase-section">
        <h3>
          C. Priority Queue — Matriks Eisenhower{' '}
          <span className="tooltip-wrap">
            <span className="tooltip-icon">?</span>
            <span className="tooltip-content">
              Kategorisasi prioritas berdasarkan Time Criticality Index (U) dan
              System Impact Index (I). U ≥ 0.7 = Mendesak, I ≥ 70 = Penting.
            </span>
          </span>
        </h3>

        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 14, marginBottom: 12, color: '#475569' }}>
            Daftar tugas (tasks) di bawah ini diambil dari Rekomendasi Tasks di
            Fase 01. Tentukan nilai U dan I untuk masing-masing task, lalu klik{' '}
            <strong>Plot</strong> untuk memasukkannya ke Matriks Eisenhower.
          </p>
          <div className="table-responsive">
            <table className="var-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Nama Task / Opsi</th>
                  <th style={{ width: '20%' }}>Mendesak? (U: 0-1)</th>
                  <th style={{ width: '20%' }}>Penting? (I: 0-100)</th>
                  <th style={{ width: '15%' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {unplottedTasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>
                        {task.name}
                      </div>
                    </td>
                    <td>
                      <input
                        className="input"
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        placeholder="0.0 - 1.0"
                        value={task.u}
                        onChange={(e) =>
                          setPhase02TaskInput(task.id, 'u', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0 - 100"
                        value={task.i}
                        onChange={(e) =>
                          setPhase02TaskInput(task.id, 'i', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        disabled={!isPlottable(task)}
                        onClick={() => plotPhase02Task(task)}
                      >
                        + Plot
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Baris input manual */}
                <tr style={{ background: '#F8FAFC' }}>
                  <td>
                    <input
                      className="input"
                      placeholder="Ketik nama task baru (manual)..."
                      value={manualTask.name}
                      onChange={(e) =>
                        setManualTask({ ...manualTask, name: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      placeholder="0.0 - 1.0"
                      value={manualTask.u}
                      onChange={(e) =>
                        setManualTask({ ...manualTask, u: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0 - 100"
                      value={manualTask.i}
                      onChange={(e) =>
                        setManualTask({ ...manualTask, i: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      disabled={!isPlottable(manualTask)}
                      onClick={handlePlotManual}
                    >
                      + Plot Manual
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Visualisasi Matriks */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 1fr',
            gridTemplateRows: 'auto auto auto',
            gap: 0,
          }}
        >
          <div></div>
          <div style={axisLabelStyle}>⏰ Mendesak (U ≥ 0.7)</div>
          <div style={axisLabelStyle}>📅 Tidak Mendesak (U &lt; 0.7)</div>

          <div style={verticalAxisLabelStyle}>⚡ Penting (I ≥ 70)</div>
          <QuadrantCell
            quadrant={QUADRANTS[0]}
            tasks={phase02.plotted}
            onEdit={unplotPhase02Task}
            onRemove={removePhase02Task}
          />
          <QuadrantCell
            quadrant={QUADRANTS[1]}
            tasks={phase02.plotted}
            onEdit={unplotPhase02Task}
            onRemove={removePhase02Task}
          />

          <div style={verticalAxisLabelStyle}>📋 Tidak Penting (I &lt; 70)</div>
          <QuadrantCell
            quadrant={QUADRANTS[2]}
            tasks={phase02.plotted}
            onEdit={unplotPhase02Task}
            onRemove={removePhase02Task}
          />
          <QuadrantCell
            quadrant={QUADRANTS[3]}
            tasks={phase02.plotted}
            onEdit={unplotPhase02Task}
            onRemove={removePhase02Task}
          />
        </div>
      </div>

      {missingSourceCount > 0 && (
        <div className="alert alert-warning">
          <span className="alert-icon">⚠️</span>
          <span>
            {missingSourceCount} variabel ditandai sebagai{' '}
            <strong>Hardcoded Data</strong> tetapi belum memiliki sumber/bukti.
            Fakta empiris tanpa bukti berisiko terdeteksi sebagai bias pada Fase
            03.
          </span>
        </div>
      )}

      <div className="phase-actions">
        <button className="btn btn-secondary" onClick={onPrev}>
          ← Kembali ke Fase 01
        </button>
        <button className="btn btn-primary btn-lg" onClick={onNext}>
          Selesaikan Fase 02 →
        </button>
      </div>
    </div>
  )
}

const axisLabelStyle = {
  textAlign: 'center',
  padding: '8px 0',
  fontSize: 13,
  fontWeight: 600,
  color: '#64748B',
}

const verticalAxisLabelStyle = {
  writingMode: 'vertical-rl',
  transform: 'rotate(180deg)',
  textAlign: 'center',
  fontSize: 13,
  fontWeight: 600,
  color: '#64748B',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const iconButtonStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: 12,
}

function QuadrantCell({ quadrant, tasks, onEdit, onRemove }) {
  const items = tasks.filter((t) => t.quadrant === quadrant.id)

  return (
    <div className={`eq-cell ${quadrant.className}`}>
      <h4>{quadrant.title}</h4>
      <div className="eq-subtitle">{quadrant.subtitle}</div>
      {items.map((t) => (
        <div
          key={t.id}
          className="eq-task"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div className="eq-task-name">{t.name}</div>
            <div className="eq-task-meta">
              U: {t.u} | I: {t.i}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              style={iconButtonStyle}
              onClick={() => onEdit(t.id)}
              title="Edit / Re-plot"
            >
              ✏️
            </button>
            <button
              style={{ ...iconButtonStyle, color: '#991B1B' }}
              onClick={() => onRemove(t.id)}
              title="Hapus"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div
          style={{
            fontSize: 12,
            color: '#94A3B8',
            marginTop: 8,
            fontStyle: 'italic',
          }}
        >
          Kosong
        </div>
      )}
    </div>
  )
}
