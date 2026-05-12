import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Phase01 from '../components/phases/Phase01'
import Phase02 from '../components/phases/Phase02'
import Phase03 from '../components/phases/Phase03'
import Phase04 from '../components/phases/Phase04'
import Phase05 from '../components/phases/Phase05'
import SessionSummary from '../components/phases/SessionSummary'
import { useSessionStore } from '../stores/sessionStore'

const phases = [
  { id: 1, label: 'Fase 01', subtitle: 'System Requirements Analysis' },
  { id: 2, label: 'Fase 02', subtitle: 'Variable & Constraint Definition' },
  { id: 3, label: 'Fase 03', subtitle: 'Logic Debugging & Sanitization' },
  { id: 4, label: 'Fase 04', subtitle: 'Computation & Execution' },
  { id: 5, label: 'Fase 05', subtitle: 'Output Validation & Monitoring' },
  { id: 6, label: 'Ringkasan', subtitle: 'Dokumen Keputusan Akhir' },
]

const phaseComponents = { 1: Phase01, 2: Phase02, 3: Phase03, 4: Phase04, 5: Phase05, 6: SessionSummary }

export default function SessionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const sessions = useSessionStore(s => s.sessions)
  const session = sessions.find(s => s.id === id)

  // Local state to track which phase is currently being viewed
  const [activePhase, setActivePhase] = useState(1)
  
  // Local state to simulate progression (so if they click Selesaikan, it unlocks the next)
  const [maxUnlockedPhase, setMaxUnlockedPhase] = useState(1)

  useEffect(() => {
    if (session) {
      const maxPhase = session.status === 'done' ? 6 : session.currentPhase
      setMaxUnlockedPhase(maxPhase)
      setActivePhase(maxPhase)
    }
  }, [session])

  const phaseStates = phases.reduce((acc, p) => {
    if (session?.status === 'done' || maxUnlockedPhase === 6) {
      acc[p.id] = 'completed'
      // Keep Phase 6 active if we are viewing it
      if (p.id === 6 && activePhase === 6) acc[p.id] = 'active'
      else if (p.id === activePhase) acc[p.id] = 'active'
    } else {
      if (p.id < maxUnlockedPhase) {
        acc[p.id] = activePhase === p.id ? 'active' : 'completed'
      } else if (p.id === maxUnlockedPhase) {
        acc[p.id] = activePhase === p.id ? 'active' : 'active' // It's the current frontier
      } else {
        acc[p.id] = 'locked'
      }
    }
    return acc
  }, {})

  const handlePhaseClick = (phase) => {
    if (phaseStates[phase.id] === 'locked') return
    setActivePhase(phase.id)
  }

  const handleNext = () => {
    if (activePhase === maxUnlockedPhase && activePhase < 6) {
      setMaxUnlockedPhase(prev => prev + 1)
    }
    setActivePhase(prev => Math.min(prev + 1, 6))
  }

  const handlePrev = () => {
    setActivePhase(prev => Math.max(prev - 1, 1))
  }

  const PhaseComponent = phaseComponents[activePhase]

  if (!session) {
    return <div style={{padding: 40}}>Sesi tidak ditemukan.</div>
  }

  return (
    <div className="session-layout">
      <div className="phase-nav">
        <div className="phase-nav-back">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← Kembali ke Dashboard</button>
        </div>
        <div style={{padding:'0 16px', marginBottom:16}}>
          <h4 style={{fontSize:14}}>{session.title}</h4>
          <p style={{fontSize:12, color:'#64748B'}}>Fase {activePhase} dari 5</p>
          <div className="progress-bar" style={{marginTop:6}}><div className="progress-fill" style={{width:`${(activePhase/5)*100}%`}} /></div>
        </div>
        <ul className="phase-nav-list">
          {phases.map(phase => {
            const state = phaseStates[phase.id]
            const isActive = phase.id === activePhase
            return (
              <li key={phase.id}
                className={`phase-item ${isActive ? 'active' : ''} ${state === 'locked' ? 'locked' : ''} ${state === 'completed' && !isActive ? 'completed' : ''}`}
                onClick={() => handlePhaseClick(phase)}
              >
                <div className={`phase-icon ${isActive ? 'active' : state}`}>
                  {state === 'completed' ? '✓' : state === 'locked' ? '🔒' : phase.id}
                </div>
                <div className="phase-label">
                  <div>{phase.label}</div>
                  <div className="phase-subtitle">{phase.subtitle}</div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="phase-content">
        <PhaseComponent onNext={handleNext} onPrev={handlePrev} />
      </div>
    </div>
  )
}
