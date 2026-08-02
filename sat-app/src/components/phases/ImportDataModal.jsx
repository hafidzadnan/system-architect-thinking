import { useCallback, useEffect, useRef, useState } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import {
  ACCEPTED_EXTENSIONS,
  extractText,
  validateFile,
} from '../../services/fileExtractor'
import { AnalysisError, analyzeDocument } from '../../services/openrouter'

const INITIAL_STATE = {
  step: 1,
  file: null,
  pastedText: '',
  sourceError: '',
  status: 'idle', // idle | running | error | done
  error: null,
  result: null,
}

/**
 * Wizard 3 langkah: Sumber Data → Analisis → Review. Menerima file/teks,
 * mengekstrak isinya, mengirim ke OpenRouter, lalu menampilkan hasil untuk
 * di-review sebelum diterapkan ke form manual (via prop onApply).
 */
export default function ImportDataModal({ show, onClose, onApply }) {
  const apiKey = useSettingsStore((s) => s.apiKey)
  const model = useSettingsStore((s) => s.model)
  const [state, setState] = useState(INITIAL_STATE)
  const [dragActive, setDragActive] = useState(false)
  const dragDepthRef = useRef(0)
  const abortRef = useRef(null)
  const runIdRef = useRef(0)

  // Reset saat modal dibuka (bukan saat ditutup) — reset-on-close berlomba
  // dengan animasi penutupan dan bisa memunculkan kedipan konten Step 1.
  // Dihitung saat render (bukan efek) agar tidak memicu render tambahan.
  const [prevShow, setPrevShow] = useState(show)
  if (show !== prevShow) {
    setPrevShow(show)
    if (show) setState(INITIAL_STATE)
  }

  // Batalkan request yang masih berjalan jika modal ditutup/unmount.
  useEffect(() => {
    if (!show) return
    return () => {
      abortRef.current?.abort()
      abortRef.current = null
    }
  }, [show])

  const handleClose = useCallback(() => {
    abortRef.current?.abort()
    onClose()
  }, [onClose])

  const handleFileSelect = (file) => {
    const sourceError = validateFile(file)
    setState((s) => ({
      ...s,
      file: sourceError ? null : file,
      pastedText: '',
      sourceError,
    }))
  }

  const handlePasteChange = (value) => {
    setState((s) => ({ ...s, pastedText: value, file: null, sourceError: '' }))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    dragDepthRef.current = 0
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const runAnalysis = useCallback(async () => {
    if (state.status === 'running') return // guard double-submit
    if (!state.file && !state.pastedText.trim()) return

    abortRef.current?.abort() // supersede request lama bila ada (retry)
    const controller = new AbortController()
    abortRef.current = controller
    const runId = ++runIdRef.current

    setState((s) => ({ ...s, step: 2, status: 'running', error: null }))

    try {
      const text = state.file
        ? await extractText(state.file, { signal: controller.signal })
        : state.pastedText
      const result = await analyzeDocument({
        apiKey,
        model,
        text,
        signal: controller.signal,
      })
      if (runId !== runIdRef.current) return // respons basi, buang
      setState((s) => ({ ...s, status: 'done', step: 3, result }))
    } catch (err) {
      if (err.name === 'AbortError' || runId !== runIdRef.current) return
      const analysisError =
        err instanceof AnalysisError
          ? err
          : new AnalysisError('network', 'Terjadi kesalahan tak terduga.')
      setState((s) => ({ ...s, status: 'error', error: analysisError }))
    }
  }, [state.status, state.file, state.pastedText, apiKey, model])

  const handleApply = () => {
    if (state.result) onApply(state.result)
    handleClose()
  }

  if (!show) return null

  const canProceed =
    Boolean(apiKey) &&
    (Boolean(state.file) || Boolean(state.pastedText.trim())) &&
    !state.sourceError

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📥 Import Data — Langkah {state.step} dari 3</h3>
          <button className="modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        {state.step === 1 && (
          <StepSource
            state={state}
            apiKey={apiKey}
            dragActive={dragActive}
            onDragActiveChange={setDragActive}
            dragDepthRef={dragDepthRef}
            onFileSelect={handleFileSelect}
            onPasteChange={handlePasteChange}
            onDrop={handleDrop}
          />
        )}
        {state.step === 2 && (
          <StepAnalysis
            status={state.status}
            error={state.error}
            onRetry={runAnalysis}
          />
        )}
        {state.step === 3 && state.result && (
          <StepReview result={state.result} />
        )}

        <div className="modal-footer">
          {state.step === 1 && (
            <>
              <button className="btn btn-secondary" onClick={handleClose}>
                Batal
              </button>
              <button
                className="btn btn-ai"
                onClick={runAnalysis}
                disabled={!canProceed}
              >
                Analisis dengan AI →
              </button>
            </>
          )}
          {state.step === 2 && (
            <button className="btn btn-secondary" onClick={handleClose}>
              Batal
            </button>
          )}
          {state.step === 3 && (
            <>
              <button className="btn btn-secondary" onClick={handleClose}>
                Batal
              </button>
              <button className="btn btn-primary" onClick={handleApply}>
                Gunakan Hasil Analisis
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StepSource({
  state,
  apiKey,
  dragActive,
  onDragActiveChange,
  dragDepthRef,
  onFileSelect,
  onPasteChange,
  onDrop,
}) {
  const inputRef = useRef(null)

  const handleDragEnter = (e) => {
    e.preventDefault()
    dragDepthRef.current += 1
    onDragActiveChange(true)
  }
  const handleDragOver = (e) => e.preventDefault() // wajib, atau browser membuka file-nya
  const handleDragLeave = (e) => {
    e.preventDefault()
    dragDepthRef.current -= 1
    if (dragDepthRef.current <= 0) onDragActiveChange(false)
  }

  return (
    <div>
      {!apiKey && (
        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          <span className="alert-icon">⚠️</span>
          <span>
            API key OpenRouter belum diatur. Buka menu Pengaturan untuk
            menambahkannya sebelum menganalisis data.
          </span>
        </div>
      )}

      <div className="form-group">
        <label>Unggah File</label>
        <div
          className={`dropzone${dragActive ? ' dropzone-active' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFileSelect(file)
              e.target.value = ''
            }}
          />
          {state.file ? (
            <p>
              📄 <strong>{state.file.name}</strong>{' '}
              <span style={{ fontSize: 12, color: '#64748B' }}>
                ({(state.file.size / 1024).toFixed(0)} KB)
              </span>
            </p>
          ) : (
            <p>
              Seret file ke sini atau klik untuk memilih
              <br />
              <span style={{ fontSize: 12, color: '#64748B' }}>
                Format: {ACCEPTED_EXTENSIONS.join(', ')} · Maks. 10 MB
              </span>
            </p>
          )}
        </div>
        {state.sourceError && (
          <span className="form-hint" style={{ color: 'var(--error)' }}>
            {state.sourceError}
          </span>
        )}
      </div>

      <div
        style={{
          textAlign: 'center',
          color: '#94A3B8',
          fontSize: 12,
          margin: '12px 0',
        }}
      >
        — atau —
      </div>

      <div className="form-group">
        <label>Tempel Teks Langsung</label>
        <textarea
          className="textarea"
          style={{ minHeight: 140 }}
          placeholder="Tempel konten dokumen, catatan rapat, atau konteks lain di sini..."
          value={state.pastedText}
          onChange={(e) => onPasteChange(e.target.value)}
        />
      </div>
    </div>
  )
}

function StepAnalysis({ status, error, onRetry }) {
  if (status === 'error') {
    return (
      <div className="alert alert-error">
        <span className="alert-icon">❌</span>
        <span>
          {error?.message || 'Terjadi kesalahan.'}{' '}
          <button
            className="btn btn-sm btn-secondary"
            style={{ marginLeft: 8 }}
            onClick={onRetry}
          >
            Coba Lagi
          </button>
        </span>
      </div>
    )
  }
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
      <p>Menganalisis data dengan AI...</p>
      <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
        Proses ini bisa memakan waktu beberapa detik.
      </p>
    </div>
  )
}

function StepReview({ result }) {
  return (
    <div className="import-recommendations">
      <div className="import-rec-item">
        <p>
          <strong>Root Objective:</strong> {result.rootObjective}
        </p>
      </div>
      <div className="import-rec-item">
        <p>
          <strong>Function Tag:</strong>{' '}
          {result.functionTag === 'motivational'
            ? 'Motivational Function'
            : 'Hygienic Function'}
        </p>
      </div>
      <div className="import-rec-item">
        <p>
          <strong>Function Justification:</strong>{' '}
          {result.functionJustification || '—'}
        </p>
      </div>
      {result.internalParameters.map((param, i) => (
        <div className="import-rec-item" key={i}>
          <p>
            <strong>Internal Parameter:</strong> {param}
          </p>
        </div>
      ))}
      {result.externalConstraints.map((constraint, i) => (
        <div className="import-rec-item" key={i}>
          <p>
            <strong>External Constraint:</strong> {constraint}
          </p>
        </div>
      ))}
      {result.recommendedTasks.length > 0 && (
        <>
          <h4 style={{ marginTop: 16 }}>📋 Rekomendasi Tasks</h4>
          {result.recommendedTasks.map((task, i) => (
            <div className="import-rec-item" key={i}>
              <p>
                <strong>Task:</strong> {task}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
