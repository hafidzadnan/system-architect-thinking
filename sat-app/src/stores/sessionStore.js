import { create } from 'zustand'

// Mock sessions for UI demo
const mockSessions = [
  {
    id: '1',
    title: 'Migrasi Supervisi KPPN ke Platform Digital',
    description: 'Evaluasi kelayakan migrasi supervisi fisik ke platform digital terintegrasi untuk KPPN di wilayah Sulawesi Tengah.',
    targetDate: '2026-06-15',
    status: 'progress',
    currentPhase: 3,
    createdAt: '2026-05-01',
  },
  {
    id: '2',
    title: 'Optimalisasi Proses Pencairan Dana BLUD',
    description: 'Analisis opsi percepatan pencairan dana BLUD melalui simplifikasi prosedur atau digitalisasi dokumen.',
    targetDate: '2026-07-01',
    status: 'draft',
    currentPhase: 1,
    createdAt: '2026-05-10',
  },
  {
    id: '3',
    title: 'Strategi Peningkatan IKPA Triwulan III',
    description: 'Keputusan strategis untuk meningkatkan skor IKPA Kanwil pada triwulan III tahun anggaran berjalan.',
    targetDate: '2026-05-20',
    status: 'done',
    currentPhase: 5,
    createdAt: '2026-04-15',
  },
]

export const useSessionStore = create((set, get) => ({
  sessions: mockSessions,
  activeSession: null,
  activePhase: 1,

  setActiveSession: (id) => {
    const session = get().sessions.find(s => s.id === id)
    set({ activeSession: session, activePhase: session?.currentPhase || 1 })
  },
  setActivePhase: (phase) => set({ activePhase: phase }),
  clearActiveSession: () => set({ activeSession: null, activePhase: 1 }),
}))
