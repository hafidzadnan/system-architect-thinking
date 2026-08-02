import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  useSessionStore,
  selectPhase02Variables,
  selectPhase04Criteria,
} from '../../stores/sessionStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { mapCriteria } from '../../services/criteriaMapper'
import { AnalysisError } from '../../services/openrouter'
import {
  CRITERIA_TYPES,
  CRITERIA_BENEFIT,
  MIN_OPTIONS,
  MAX_OPTIONS,
} from '../../utils/constants'
import {
  computeRowEv,
  computeWeightTotals,
  isWeightValid,
  computeEvComparison,
  findBestOption,
} from '../../utils/evCalculator'
import EVComparisonChart from '../charts/EVComparisonChart'

export default function Phase04({ onNext, onPrev }) {
  const phase01 = useSessionStore((s) => s.phase01)
  const phase02 = useSessionStore((s) => s.phase02)
  const phase04 = useSessionStore((s) => s.phase04)
  const addPhase04Option = useSessionStore((s) => s.addPhase04Option)
  const updatePhase04Option = useSessionStore((s) => s.updatePhase04Option)
  const removePhase04Option = useSessionStore((s) => s.removePhase04Option)
  const addPhase04Criterion = useSessionStore((s) => s.addPhase04Criterion)
  const updatePhase04Criterion = useSessionStore(
    (s) => s.updatePhase04Criterion,
  )
  const removePhase04Criterion = useSessionStore(
    (s) => s.removePhase04Criterion,
  )
  const setPhase04Score = useSessionStore((s) => s.setPhase04Score)
  const startPhase04Mapping = useSessionStore((s) => s.startPhase04Mapping)
  const setPhase04Mapping = useSessionStore((s) => s.setPhase04Mapping)
  const setPhase04MapError = useSessionStore((s) => s.setPhase04MapError)
  const cancelPhase04Mapping = useSessionStore((s) => s.cancelPhase04Mapping)

  const apiKey = useSettingsStore((s) => s.apiKey)
  const model = useSettingsStore((s) => s.model)

  const abortRef = useRef(null)
  const runIdRef = useRef(0)

  // Selector mengembalikan array baru tiap panggilan, jadi dihitung lewat
  // useMemo alih-alih dipakai langsung sebagai selector zustand.
  const state = useMemo(
    () => ({ phase01, phase02, phase04 }),
    [phase01, phase02, phase04],
  )
  const variables = useMemo(() => selectPhase02Variables(state), [state])
  const criteria = useMemo(() => selectPhase04Criteria(state), [state])

  const { options, scores, mapStatus, mapError, mappedAt } = phase04

  const weightTotals = useMemo(() => computeWeightTotals(criteria), [criteria])
  const weightsValid = isWeightValid(weightTotals)

  const results = useMemo(
    () => computeEvComparison({ options, criteria, scores }),
    [options, criteria, scores],
  )
  const bestOption = findBestOption(results)

  const isMapping = mapStatus === 'running'
  const canMap = Boolean(apiKey) && variables.length > 0 && !isMapping

  const namedOptions = options.filter((o) => o.name.trim()).length
  const missingScores = criteria.some((c) =>
    options.some((o) => {
      const score = scores[c.id]?.[o.id]
      return !score?.value || !score?.probability
    }),
  )
  const canFinish =
    namedOptions >= MIN_OPTIONS &&
    criteria.length > 0 &&
    weightsValid &&
    !missingScores

  const runMapping = useCallback(async () => {
    if (isMapping || !apiKey || variables.length === 0) return

    // Batalkan request sebelumnya agar hasil lama tidak menimpa yang baru.
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const runId = ++runIdRef.current

    startPhase04Mapping()

    try {
      const result = await mapCriteria({
        apiKey,
        model,
        rootObjective: phase01.rootObjective,
        functionTag: phase01.functionTag,
        variables,
        signal: controller.signal,
      })
      if (runId !== runIdRef.current) return
      setPhase04Mapping(result)
    } catch (err) {
      if (err.name === 'AbortError' || runId !== runIdRef.current) return
      const analysisError =
        err instanceof AnalysisError
          ? err
          : new AnalysisError('network', 'Terjadi kesalahan tak terduga.')
      setPhase04MapError({
        kind: analysisError.kind,
        message: analysisError.message,
      })
    }
  }, [
    isMapping,
    apiKey,
    model,
    variables,
    phase01.rootObjective,
    phase01.functionTag,
    startPhase04Mapping,
    setPhase04Mapping,
    setPhase04MapError,
  ])

  // Pindah fase = unmount, jadi request yang masih jalan dibatalkan sekaligus
  // status 'running' dilepas agar fase ini tidak stuck loading saat kembali.
  useEffect(
    () => () => {
      abortRef.current?.abort()
      cancelPhase04Mapping()
    },
    [cancelPhase04Mapping],
  )

  if (variables.length === 0) {
    return (
      <div>
        <PhaseHeader />
        <div className="empty-state">
          <div className="empty-icon">🧮</div>
          <h3>Belum ada variabel untuk dihitung</h3>
          <p>
            Kriteria Benefit/Cost dipetakan dari variabel yang didefinisikan
            pada Fase 02. Lengkapi dulu variabel di sana.
          </p>
          <button className="btn btn-primary" onClick={onPrev}>
            ← Kembali ke Fase 03
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PhaseHeader />

      {/* A. OPSI KEBIJAKAN */}
      <div className="phase-section">
        <h3>
          A. Opsi Kebijakan{' '}
          <span className="tooltip-wrap">
            <span className="tooltip-icon">?</span>
            <span className="tooltip-content">
              Daftar opsi yang akan dibandingkan Expected Value-nya. Minimal{' '}
              {MIN_OPTIONS}, maksimal {MAX_OPTIONS} opsi.
            </span>
          </span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.map((option, idx) => (
            <div key={option.id} className="card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span
                  className={`badge ${idx === 0 ? 'badge-draft' : 'badge-progress'}`}
                >
                  Opsi {String.fromCharCode(65 + idx)}
                </span>
                <input
                  className="input"
                  placeholder="Nama opsi kebijakan..."
                  value={option.name}
                  onChange={(e) =>
                    updatePhase04Option(option.id, e.target.value)
                  }
                  style={{ flex: 1 }}
                />
                {options.length > MIN_OPTIONS && (
                  <button
                    className="btn-remove"
                    onClick={() => removePhase04Option(option.id)}
                    title="Hapus opsi"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          className="btn btn-sm btn-ghost"
          style={{ marginTop: 8 }}
          disabled={options.length >= MAX_OPTIONS}
          onClick={addPhase04Option}
        >
          + Tambah Opsi (maks. {MAX_OPTIONS})
        </button>
      </div>

      {/* B. MAPPING KRITERIA */}
      <div className="phase-section">
        <h3>
          B. Mapping Kriteria
          <button
            className="btn btn-sm btn-ai"
            style={{ marginLeft: 12 }}
            disabled={!canMap}
            onClick={runMapping}
          >
            {isMapping
              ? 'Memetakan...'
              : criteria.length > 0
                ? '🔄 Mapping Ulang'
                : '🤖 Mapping Kriteria dengan AI'}
          </button>
        </h3>

        {!apiKey && (
          <div className="alert alert-warning">
            <span className="alert-icon">⚠️</span>
            <span>
              API key OpenRouter belum diatur. Buka <strong>Pengaturan</strong>{' '}
              untuk menambahkannya, atau isi kriteria secara manual.
            </span>
          </div>
        )}

        <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
          {mappedAt
            ? `Mapping terakhir: ${new Date(mappedAt).toLocaleString('id-ID')} · model ${model}`
            : `${variables.length} variabel Fase 02 siap dipetakan · model ${model}`}
        </p>

        {isMapping && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
            <p>Memetakan kriteria Benefit/Cost dengan AI...</p>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
              Proses ini bisa memakan waktu beberapa detik.
            </p>
          </div>
        )}

        {mapStatus === 'error' && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            <span>
              {mapError?.message || 'Terjadi kesalahan.'}{' '}
              <button
                className="btn btn-sm btn-secondary"
                style={{ marginLeft: 8 }}
                onClick={runMapping}
              >
                Coba Lagi
              </button>
            </span>
          </div>
        )}

        {!isMapping && criteria.length === 0 && (
          <div className="alert alert-info">
            <span className="alert-icon">ℹ️</span>
            <span>
              Belum ada kriteria. Jalankan mapping AI untuk mengubah{' '}
              {variables.length} variabel Fase 02 menjadi kriteria Benefit/Cost,
              atau tambahkan manual di bawah.
            </span>
          </div>
        )}

        {criteria.length > 0 && (
          <div className="table-responsive">
            <table className="var-table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Sumber EVM</th>
                  <th style={{ width: '22%' }}>Nama Kriteria</th>
                  <th style={{ width: '15%' }}>Tipe</th>
                  <th style={{ width: '10%' }}>Bobot</th>
                  <th style={{ width: '28%' }}>Justifikasi</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        {c.sourceName}
                      </div>
                      <div
                        style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}
                      >
                        {c.sourceOrigin}
                      </div>
                    </td>
                    <td>
                      <input
                        className="input"
                        placeholder="Nama kriteria..."
                        value={c.name}
                        onChange={(e) =>
                          updatePhase04Criterion(c.id, 'name', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <select
                        className="select"
                        value={c.type}
                        onChange={(e) =>
                          updatePhase04Criterion(c.id, 'type', e.target.value)
                        }
                      >
                        {CRITERIA_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className="input"
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        placeholder="0.0"
                        value={c.weight}
                        onChange={(e) =>
                          updatePhase04Criterion(c.id, 'weight', e.target.value)
                        }
                        style={{ width: 70, textAlign: 'center' }}
                      />
                    </td>
                    <td>
                      <input
                        className="input"
                        placeholder="Alasan kriteria ini penting..."
                        value={c.justification}
                        onChange={(e) =>
                          updatePhase04Criterion(
                            c.id,
                            'justification',
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="btn-remove"
                        onClick={() => removePhase04Criterion(c.id)}
                        title="Hapus kriteria"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span
            className={`weight-indicator ${weightTotals.benefit === 1 ? 'weight-valid' : 'weight-invalid'}`}
          >
            {weightTotals.benefit === 1 ? '✅' : '⚠️'} Total Bobot Benefit:{' '}
            {weightTotals.benefit.toFixed(1)} / 1.0
          </span>
          <span
            className={`weight-indicator ${weightTotals.cost === 1 ? 'weight-valid' : 'weight-invalid'}`}
          >
            {weightTotals.cost === 1 ? '✅' : '⚠️'} Total Bobot Cost:{' '}
            {weightTotals.cost.toFixed(1)} / 1.0
          </span>
          <select
            className="select"
            style={{ maxWidth: 260, marginLeft: 'auto' }}
            value=""
            onChange={(e) => {
              if (e.target.value) addPhase04Criterion(e.target.value)
            }}
          >
            <option value="">+ Tambah Kriteria dari variabel...</option>
            {variables.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* C. SCORING */}
      <div className="phase-section">
        <h3>C. Scoring &amp; Kalkulasi EV</h3>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
          Formula: EV = Σ(Benefit × Bobot × P_success) − Σ(Cost × Bobot ×
          P_risk). Nilai diisi skala 1–100, probabilitas 0.0–1.0.
        </p>

        {criteria.length === 0 ? (
          <div className="alert alert-info">
            <span className="alert-icon">ℹ️</span>
            <span>Tentukan kriteria terlebih dahulu pada bagian B.</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="ev-table">
              <thead>
                <tr>
                  <th>Variabel</th>
                  <th>Tipe</th>
                  <th>Bobot</th>
                  {options.map((option, idx) => (
                    <th
                      key={option.id}
                      colSpan="3"
                      style={{ background: idx === 0 ? '#475569' : '#1B2A4A' }}
                    >
                      {option.name.trim() ||
                        `Opsi ${String.fromCharCode(65 + idx)}`}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th></th>
                  <th></th>
                  <th></th>
                  {options.map((option, idx) => {
                    const bg = idx === 0 ? '#64748B' : '#2D4A7A'
                    return [
                      <th
                        key={`${option.id}-v`}
                        style={{ background: bg, fontSize: 11 }}
                      >
                        Nilai
                      </th>,
                      <th
                        key={`${option.id}-p`}
                        style={{ background: bg, fontSize: 11 }}
                      >
                        Prob.
                      </th>,
                      <th
                        key={`${option.id}-e`}
                        style={{ background: bg, fontSize: 11 }}
                      >
                        EV
                      </th>,
                    ]
                  })}
                </tr>
              </thead>
              <tbody>
                {criteria.map((c) => {
                  const isCost = c.type !== CRITERIA_BENEFIT
                  return (
                    <tr key={c.id}>
                      <td style={{ textAlign: 'left' }}>
                        {c.name.trim() || c.sourceName}
                      </td>
                      <td>
                        <span
                          className={`badge ${isCost ? 'badge-cost' : 'badge-benefit'}`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td>{Number(c.weight || 0).toFixed(2)}</td>
                      {options.map((option) => {
                        const score = scores[c.id]?.[option.id] || {}
                        const rowEv = computeRowEv({
                          value: score.value,
                          probability: score.probability,
                          weight: c.weight,
                        })
                        return [
                          <td key={`${option.id}-v`}>
                            <input
                              className="input"
                              type="number"
                              min="1"
                              max="100"
                              placeholder="1-100"
                              value={score.value ?? ''}
                              onChange={(e) =>
                                setPhase04Score(
                                  c.id,
                                  option.id,
                                  'value',
                                  e.target.value,
                                )
                              }
                            />
                          </td>,
                          <td key={`${option.id}-p`}>
                            <input
                              className="input"
                              type="number"
                              step="0.1"
                              min="0"
                              max="1"
                              placeholder="0-1"
                              value={score.probability ?? ''}
                              onChange={(e) =>
                                setPhase04Score(
                                  c.id,
                                  option.id,
                                  'probability',
                                  e.target.value,
                                )
                              }
                            />
                          </td>,
                          <td
                            key={`${option.id}-e`}
                            className={isCost ? 'ev-negative' : undefined}
                          >
                            <strong>{rowEv.toFixed(1)}</strong>
                          </td>,
                        ]
                      })}
                    </tr>
                  )
                })}
                <tr style={{ background: '#F8FAFC', fontWeight: 700 }}>
                  <td colSpan="3" style={{ textAlign: 'right' }}>
                    Expected Value (EV)
                  </td>
                  {results.map((r) => (
                    <td
                      key={r.optionId}
                      colSpan="3"
                      className={
                        bestOption?.optionId === r.optionId
                          ? 'ev-highlight'
                          : undefined
                      }
                      style={{ fontSize: 18 }}
                    >
                      {r.ev.toFixed(1)}
                      {bestOption?.optionId === r.optionId ? ' 🏆' : ''}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* D. VISUALISASI */}
      {criteria.length > 0 && (
        <div className="phase-section">
          <h3>D. Visualisasi Perbandingan EV</h3>
          <div className="chart-container" style={{ maxWidth: 700 }}>
            <EVComparisonChart results={results} />
          </div>

          {bestOption ? (
            <div
              className="alert alert-success"
              style={{ marginTop: 16, maxWidth: 700 }}
            >
              <span className="alert-icon">🏆</span>
              <div>
                <strong>
                  Rekomendasi: {bestOption.name.trim() || 'Opsi terbaik'}
                </strong>
                <p style={{ fontSize: 13, marginTop: 4 }}>
                  EV = {bestOption.ev.toFixed(1)}, tertinggi di antara{' '}
                  {results.length} opsi yang dibandingkan.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="alert alert-warning"
              style={{ marginTop: 16, maxWidth: 700 }}
            >
              <span className="alert-icon">⚠️</span>
              <div>
                <strong>Seluruh opsi menghasilkan EV tidak positif</strong>
                <p style={{ fontSize: 13, marginTop: 4 }}>
                  Sistem tidak merekomendasikan opsi mana pun. Tinjau ulang Root
                  Objective di Fase 01 atau periksa kembali bobot dan skor di
                  atas.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!canFinish && (
        <div className="alert alert-warning">
          <span className="alert-icon">⚠️</span>
          <span>
            {namedOptions < MIN_OPTIONS ? (
              <>
                Beri nama minimal {MIN_OPTIONS} opsi kebijakan sebelum
                melanjutkan.
              </>
            ) : criteria.length === 0 ? (
              <>Tentukan minimal satu kriteria Benefit/Cost.</>
            ) : !weightsValid ? (
              <>
                Total bobot harus <strong>1.0 untuk Benefit</strong> dan{' '}
                <strong>1.0 untuk Cost</strong> (dihitung terpisah per tipe)
                sebelum fase ini bisa diselesaikan.
              </>
            ) : (
              <>
                Masih ada sel Nilai atau Prob. yang kosong pada tabel scoring.
              </>
            )}
          </span>
        </div>
      )}

      <div className="phase-actions">
        <button className="btn btn-secondary" onClick={onPrev}>
          ← Kembali ke Fase 03
        </button>
        <button
          className="btn btn-primary btn-lg"
          disabled={!canFinish}
          onClick={onNext}
        >
          Selesaikan Fase 04 →
        </button>
      </div>
    </div>
  )
}

function PhaseHeader() {
  return (
    <div className="phase-header">
      <h2>Fase 04 — Computation &amp; Execution</h2>
      <p>
        Komputasi &amp; Eksekusi: Hitung Expected Value setiap opsi kebijakan
        secara terstruktur
      </p>
    </div>
  )
}
