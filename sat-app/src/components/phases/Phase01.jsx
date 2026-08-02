import { useState } from 'react'
import { useSessionStore } from '../../stores/sessionStore'
import ImportDataModal from './ImportDataModal'

const radioLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
  padding: '12px 16px',
  border: '1px solid #E2E8F0',
  borderRadius: 8,
  flex: 1,
}

export default function Phase01({ onNext }) {
  const phase01 = useSessionStore((s) => s.phase01)
  const setPhase01Field = useSessionStore((s) => s.setPhase01Field)
  const addPhase01Row = useSessionStore((s) => s.addPhase01Row)
  const updatePhase01Row = useSessionStore((s) => s.updatePhase01Row)
  const removePhase01Row = useSessionStore((s) => s.removePhase01Row)
  const applyPhase01Import = useSessionStore((s) => s.applyPhase01Import)

  const [showImportModal, setShowImportModal] = useState(false)

  const renderDynamicList = (listField, placeholder, addLabel) => (
    <div className="dynamic-list">
      {phase01[listField].map((row) => (
        <div key={row.id} className="dynamic-list-item">
          <input
            className="input"
            placeholder={placeholder}
            value={row.value}
            onChange={(e) =>
              updatePhase01Row(listField, row.id, e.target.value)
            }
          />
          <button
            className="btn-remove"
            onClick={() => removePhase01Row(listField, row.id)}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        className="btn btn-sm btn-ghost"
        onClick={() => addPhase01Row(listField)}
      >
        + {addLabel}
      </button>
    </div>
  )

  return (
    <div>
      <div className="phase-header">
        <h2>Fase 01 — System Requirements Analysis</h2>
        <p>
          Analisis Kebutuhan Sistem: Definisikan tujuan utama dan petakan
          variabel lingkungan
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 20,
        }}
      >
        <button className="btn btn-ai" onClick={() => setShowImportModal(true)}>
          📥 Import Data
        </button>
      </div>

      <div className="phase-section">
        <h3>
          A. Root Objective (Tujuan Utama)
          <span className="tooltip-wrap">
            <span className="tooltip-icon">?</span>
            <span className="tooltip-content">
              Tujuan utama yang ingin dicapai melalui keputusan ini. Dalam
              paradigma pemrograman, ini adalah fungsi utama (main function)
              yang harus dieksekusi oleh sistem.
            </span>
          </span>
        </h3>
        <textarea
          className="textarea"
          placeholder="Contoh: Meningkatkan efisiensi dan akuntabilitas supervisi KPPN melalui migrasi ke platform digital terintegrasi"
          value={phase01.rootObjective}
          onChange={(e) => setPhase01Field('rootObjective', e.target.value)}
        />
      </div>

      <div className="phase-section">
        <h3>
          B. Tag Fungsi
          <span className="tooltip-wrap">
            <span className="tooltip-icon">?</span>
            <span className="tooltip-content">
              <strong>Hygienic Function:</strong> Menjaga stabilitas sistem
              (maintenance mode). <strong>Motivational Function:</strong>{' '}
              Meningkatkan kapasitas/inovasi (growth mode).
            </span>
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <label style={radioLabelStyle}>
            <input
              type="radio"
              name="functionTag"
              value="hygienic"
              checked={phase01.functionTag === 'hygienic'}
              onChange={() => setPhase01Field('functionTag', 'hygienic')}
            />{' '}
            <div>
              <strong>Hygienic Function</strong>
              <br />
              <span style={{ fontSize: 12, color: '#64748B' }}>
                Menjaga stabilitas / mencegah penurunan (Maintenance Mode)
              </span>
            </div>
          </label>
          <label style={radioLabelStyle}>
            <input
              type="radio"
              name="functionTag"
              value="motivational"
              checked={phase01.functionTag === 'motivational'}
              onChange={() => setPhase01Field('functionTag', 'motivational')}
            />{' '}
            <div>
              <strong>Motivational Function</strong>
              <br />
              <span style={{ fontSize: 12, color: '#64748B' }}>
                Meningkatkan kapasitas / inovasi (Growth Mode)
              </span>
            </div>
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 6,
            }}
          >
            Uraian Alasan Tag Fungsi
          </label>
          <textarea
            className="textarea"
            placeholder="Jelaskan secara logis mengapa fungsi tersebut dipilih..."
            value={phase01.functionJustification}
            onChange={(e) =>
              setPhase01Field('functionJustification', e.target.value)
            }
          />
        </div>
      </div>

      <div className="phase-section">
        <h3>
          C. Environmental Variable Mapping (EVM)
          <span className="tooltip-wrap">
            <span className="tooltip-icon">?</span>
            <span className="tooltip-content">
              Pemetaan variabel lingkungan menggunakan analisis kondisi (SWOT).
              Variabel dipecah menjadi Internal Parameters, External
              Constraints, dan Constants.
            </span>
          </span>
        </h3>

        <h4 style={{ marginBottom: 8, marginTop: 16 }}>
          Internal Parameters{' '}
          <span style={{ fontSize: 12, color: '#64748B', fontWeight: 400 }}>
            (Strengths & Weaknesses — variabel yang dapat dikendalikan)
          </span>
        </h4>
        {renderDynamicList(
          'internalParameters',
          'Contoh: Kapasitas SDM KPPN bervariasi dalam mengadopsi teknologi baru',
          'Tambah Parameter',
        )}

        <h4 style={{ marginBottom: 8, marginTop: 16 }}>
          External Constraints{' '}
          <span style={{ fontSize: 12, color: '#64748B', fontWeight: 400 }}>
            (Opportunities & Threats — variabel read-only)
          </span>
        </h4>
        {renderDynamicList(
          'externalConstraints',
          'Contoh: Luasnya demografi wilayah dan kondisi jaringan internet bervariasi',
          'Tambah Constraint',
        )}
      </div>

      <div className="phase-section">
        <h3>
          D. Rekomendasi Tasks
          <span className="tooltip-wrap">
            <span className="tooltip-icon">?</span>
            <span className="tooltip-content">
              Action item awal yang menjadi bahan Priority Queue di Fase 02.
              Bisa diisi manual atau otomatis lewat Import Data.
            </span>
          </span>
        </h3>
        {renderDynamicList(
          'recommendedTasks',
          'Contoh: Sosialisasi platform digital ke seluruh KPPN',
          'Tambah Task',
        )}
      </div>

      <div className="phase-actions">
        <button className="btn btn-primary btn-lg" onClick={onNext}>
          Selesaikan Fase 01 →
        </button>
      </div>

      <ImportDataModal
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        onApply={applyPhase01Import}
      />
    </div>
  )
}
