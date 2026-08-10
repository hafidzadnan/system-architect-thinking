import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  useSessionStore,
  selectPhase02Variables,
} from '../../stores/sessionStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { analyzeBias } from '../../services/biasAnalyzer'
import { AnalysisError } from '../../services/openrouter'
import { BIAS_TYPES, BIAS_LABELS } from '../../utils/constants'

export default function Phase03({ onNext, onPrev }) {
  const phase01 = useSessionStore((s) => s.phase01)
  const phase02 = useSessionStore((s) => s.phase02)
  const phase03 = useSessionStore((s) => s.phase03)
  const setPhase02Variable = useSessionStore((s) => s.setPhase02Variable)
  const startPhase03Analysis = useSessionStore((s) => s.startPhase03Analysis)
  const setPhase03Result = useSessionStore((s) => s.setPhase03Result)
  const setPhase03Error = useSessionStore((s) => s.setPhase03Error)
  const cancelPhase03Analysis = useSessionStore((s) => s.cancelPhase03Analysis)
  const selectPhase03Cell = useSessionStore((s) => s.selectPhase03Cell)

  const apiKey = useSettingsStore((s) => s.apiKey)
  const model = useSettingsStore((s) => s.model)

  const abortRef = useRef(null)
  const runIdRef = useRef(0)

  const state = useMemo(() => ({ phase01, phase02 }), [phase01, phase02])
  const variables = useMemo(() => selectPhase02Variables(state), [state])

  const { status, error, validations, analyzedAt, staleVariableIds, selected } =
    phase03

  // Validasi lama bisa menunjuk variabel yang sudah dihapus di Fase 01, dan
  // variabel baru bisa muncul setelah analisis terakhir — keduanya dihitung
  // ulang tiap render agar matriks tidak pernah menampilkan baris hantu.
  const variableById = useMemo(
    () => new Map(variables.map((v) => [v.id, v])),
    [variables],
  )
  const rows = useMemo(
    () => validations.filter((v) => variableById.has(v.variableId)),
    [validations, variableById],
  )
  const analyzedIds = useMemo(
    () => new Set(validations.map((v) => v.variableId)),
    [validations],
  )
  const newVariables = variables.filter((v) => !analyzedIds.has(v.id))

  const hasWarnings = rows.some((v) =>
    Object.values(v.biases).some((b) => b.status === 'warning'),
  )
  const staleCount = staleVariableIds.filter((id) =>
    variableById.has(id),
  ).length
  const isRunning = status === 'running'
  const canAnalyze = Boolean(apiKey) && variables.length > 0 && !isRunning
  const canFinish =
    status === 'done' &&
    rows.length > 0 &&
    !hasWarnings &&
    staleCount === 0 &&
    newVariables.length === 0

  const runAnalysis = useCallback(async () => {
    if (isRunning || !apiKey || variables.length === 0) return

    // Batalkan request sebelumnya agar hasil lama tidak menimpa yang baru.
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const runId = ++runIdRef.current

    startPhase03Analysis()

    try {
      const result = await analyzeBias({
        apiKey,
        model,
        rootObjective: phase01.rootObjective,
        functionTag: phase01.functionTag,
        variables,
        signal: controller.signal,
      })
      if (runId !== runIdRef.current) return
      setPhase03Result(result)
    } catch (err) {
      if (err.name === 'AbortError' || runId !== runIdRef.current) return
      const analysisError =
        err instanceof AnalysisError
          ? err
          : new AnalysisError('network', 'Terjadi kesalahan tak terduga.')
      setPhase03Error({
        kind: analysisError.kind,
        message: analysisError.message,
      })
    }
  }, [
    isRunning,
    apiKey,
    model,
    variables,
    phase01.rootObjective,
    phase01.functionTag,
    startPhase03Analysis,
    setPhase03Result,
    setPhase03Error,
  ])

  // Pindah fase = unmount komponen ini, jadi request yang masih jalan harus
  // dibatalkan supaya tidak menulis hasil ke store setelah user pergi —
  // sekaligus melepas status 'running' agar fase ini tidak stuck loading
  // saat user kembali.
  useEffect(
    () => () => {
      abortRef.current?.abort()
      cancelPhase03Analysis()
    },
    [cancelPhase03Analysis],
  )

  const selectedVariable = selected
    ? variableById.get(selected.variableId)
    : null
  const selectedBias = selected
    ? rows.find((v) => v.variableId === selected.variableId)?.biases[
        selected.biasType
      ]
    : null

  if (variables.length === 0) {
    return (
      <div>
        <PhaseHeader />
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Belum ada variabel untuk divalidasi</h3>
          <p>
            Deteksi bias dijalankan terhadap variabel yang didefinisikan pada
            Fase 02. Lengkapi dulu variabel di sana.
          </p>
          <button className="btn btn-primary" onClick={onPrev}>
            ← Kembali ke Fase 02
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PhaseHeader />

      {!apiKey && (
        <div className="alert alert-warning">
          <span className="alert-icon">⚠️</span>
          <span>
            API key OpenRouter belum diatur. Buka <strong>Pengaturan</strong>{' '}
            untuk menambahkannya sebelum menjalankan deteksi bias.
          </span>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <button
          className="btn btn-ai"
          disabled={!canAnalyze}
          onClick={runAnalysis}
        >
          {isRunning
            ? 'Menganalisis...'
            : validations.length > 0
              ? '🔄 Analisis Ulang'
              : '🤖 Analisis Bias dengan AI'}
        </button>
        <span style={{ fontSize: 12, color: '#64748B' }}>
          {analyzedAt
            ? `Analisis terakhir: ${new Date(analyzedAt).toLocaleString('id-ID')} · model ${model}`
            : `${variables.length} variabel siap dianalisis · model ${model}`}
        </span>
      </div>

      {isRunning && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
          <p>Menganalisis bias dengan AI...</p>
          <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
            Proses ini bisa memakan waktu beberapa detik.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="alert alert-error">
          <span className="alert-icon">❌</span>
          <span>
            {error?.message || 'Terjadi kesalahan.'}{' '}
            <button
              className="btn btn-sm btn-secondary"
              style={{ marginLeft: 8 }}
              onClick={runAnalysis}
            >
              Coba Lagi
            </button>
          </span>
        </div>
      )}

      {status === 'idle' && (
        <div className="alert alert-info">
          <span className="alert-icon">ℹ️</span>
          <span>
            Jalankan analisis untuk memeriksa {variables.length} variabel Fase
            02 terhadap 4 jenis bias kognitif: Sampling Error, Overfitting,
            Exception Suppression, dan Spurious Link.
          </span>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="alert alert-info">
            <span className="alert-icon">ℹ️</span>
            <span>
              Tabel di bawah ini memvisualisasikan hasil validasi bias untuk
              setiap variabel. Klik sel tabel untuk melihat detail alasannya
              (baik peringatan ⚠️ maupun lolos validasi ✅).
            </span>
          </div>

          <div className="table-responsive">
            <table className="var-table" style={{ marginTop: 16 }}>
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Nama Variabel</th>
                  {BIAS_TYPES.map((bias) => (
                    <th
                      key={bias.key}
                      style={{ width: '18%', textAlign: 'center' }}
                    >
                      {bias.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((v) => {
                  const isStale = staleVariableIds.includes(v.variableId)
                  return (
                    <tr key={v.variableId}>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>
                        {variableById.get(v.variableId)?.name ?? v.variableName}
                        {isStale && (
                          <span
                            className="badge badge-warning"
                            style={{ marginLeft: 8 }}
                          >
                            Perlu analisis ulang
                          </span>
                        )}
                      </td>
                      {BIAS_TYPES.map((bias) => {
                        const cell = v.biases[bias.key]
                        const isWarning = cell?.status === 'warning'
                        const isSelected =
                          selected?.variableId === v.variableId &&
                          selected?.biasType === bias.key

                        return (
                          <td
                            key={bias.key}
                            style={{
                              textAlign: 'center',
                              cursor: 'pointer',
                              background: isSelected
                                ? isWarning
                                  ? 'var(--warning-bg)'
                                  : 'var(--success-bg)'
                                : 'transparent',
                              transition: 'background 0.2s',
                            }}
                            onClick={() =>
                              selectPhase03Cell(v.variableId, bias.key)
                            }
                          >
                            <span
                              style={{ fontSize: 18 }}
                              title={
                                isWarning
                                  ? 'Lihat warning'
                                  : 'Lihat alasan lolos'
                              }
                            >
                              {isWarning ? '⚠️' : '✅'}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selected && selectedBias && selectedVariable && (
        <div className="bias-card" style={{ marginTop: 20 }}>
          <div className="bias-card-header">
            <h4>
              {selectedBias.status === 'warning' ? '⚠️' : '✅'}{' '}
              {selectedVariable.name} — {BIAS_LABELS[selected.biasType]}
            </h4>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() =>
                selectPhase03Cell(selected.variableId, selected.biasType)
              }
            >
              Tutup ✕
            </button>
          </div>
          <div className="bias-card-body">
            <div
              className={`bias-item ${selectedBias.status === 'warning' ? 'warning' : 'validated'}`}
            >
              <div className="bias-item-title">Alasan AI</div>
              <div className="bias-item-desc">{selectedBias.reason || '—'}</div>
            </div>

            {selectedBias.status === 'warning' && (
              <>
                <div className="bias-item" style={{ marginTop: 12 }}>
                  <div className="bias-item-title">🔧 Rekomendasi Sanitasi</div>
                  <div className="bias-item-desc">
                    {selectedBias.recommendation ||
                      'AI tidak memberikan rekomendasi spesifik.'}
                  </div>
                </div>

                {/* Revisi inline: hanya variabel berstatus warning yang dapat
                    diedit di sini, sesuai keputusan README #16. Menulis ke
                    slice Fase 02 sekaligus menandai variabel perlu re-run. */}
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ fontSize: 14, marginBottom: 8 }}>
                    Revisi Variabel
                  </h4>
                  <div className="form-group">
                    <label>Deskripsi</label>
                    <input
                      className="input"
                      value={selectedVariable.description}
                      placeholder="Perbaiki deskripsi agar bebas dari bias di atas..."
                      onChange={(e) =>
                        setPhase02Variable(
                          selectedVariable.id,
                          'description',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Sumber/Bukti</label>
                    <input
                      className="input"
                      value={selectedVariable.source}
                      placeholder="Tambahkan data/bukti pendukung..."
                      onChange={(e) =>
                        setPhase02Variable(
                          selectedVariable.id,
                          'source',
                          e.target.value,
                        )
                      }
                    />
                    <span className="form-hint">
                      Perubahan di sini otomatis tersimpan ke Fase 02.
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {status === 'done' && !canFinish && (
        <div className="alert alert-warning" style={{ marginTop: 24 }}>
          <span className="alert-icon">⚠️</span>
          <span>
            {newVariables.length > 0 ? (
              <>
                Ada {newVariables.length} variabel baru dari Fase 01/02 yang
                belum pernah divalidasi. Jalankan{' '}
                <strong>Analisis Ulang</strong> agar seluruh variabel tercakup.
              </>
            ) : staleCount > 0 ? (
              <>
                {staleCount} variabel telah direvisi setelah analisis terakhir.
                Jalankan <strong>Analisis Ulang</strong> untuk memverifikasi
                perbaikannya sebelum melanjutkan ke Fase 04.
              </>
            ) : (
              <>
                Terdapat peringatan (warning) pada validasi logika. Klik sel ⚠️
                untuk membaca rekomendasi sanitasi, revisi variabelnya, lalu
                jalankan <strong>Analisis Ulang</strong>.
              </>
            )}
          </span>
        </div>
      )}

      <div className="phase-actions" style={{ marginTop: 32 }}>
        <button className="btn btn-secondary" onClick={onPrev}>
          ← Kembali ke Fase 02
        </button>
        <button
          className="btn btn-primary btn-lg"
          disabled={!canFinish}
          onClick={onNext}
        >
          Selesaikan Fase 03 →
        </button>
      </div>
    </div>
  )
}

function PhaseHeader() {
  return (
    <div className="phase-header">
      <h2>Fase 03 — Logic Debugging &amp; Sanitization</h2>
      <p>
        Debugging Logika &amp; Sanitasi: Validasi variabel Fase 02 dari 4 jenis
        bias kognitif menggunakan AI
      </p>
    </div>
  )
}
