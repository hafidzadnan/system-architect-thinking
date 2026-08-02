import { create } from 'zustand'

// Mock sessions for UI demo
const mockSessions = [
  {
    id: '1',
    title: 'Migrasi Supervisi KPPN ke Platform Digital',
    description:
      'Evaluasi kelayakan migrasi supervisi fisik ke platform digital terintegrasi untuk KPPN di wilayah Sulawesi Tengah.',
    targetDate: '2026-06-15',
    status: 'progress',
    currentPhase: 3,
    createdAt: '2026-05-01',
  },
  {
    id: '2',
    title: 'Optimalisasi Proses Pencairan Dana BLUD',
    description:
      'Analisis opsi percepatan pencairan dana BLUD melalui simplifikasi prosedur atau digitalisasi dokumen.',
    targetDate: '2026-07-01',
    status: 'draft',
    currentPhase: 1,
    createdAt: '2026-05-10',
  },
  {
    id: '3',
    title: 'Strategi Peningkatan IKPA Triwulan III',
    description:
      'Keputusan strategis untuk meningkatkan skor IKPA Kanwil pada triwulan III tahun anggaran berjalan.',
    targetDate: '2026-05-20',
    status: 'done',
    currentPhase: 5,
    createdAt: '2026-04-15',
  },
]

const emptyRow = () => ({ id: crypto.randomUUID(), value: '' })

const initialPhase01 = {
  rootObjective: '',
  functionTag: '',
  functionJustification: '',
  internalParameters: [emptyRow()],
  externalConstraints: [emptyRow()],
  recommendedTasks: [emptyRow()],
}

export const useSessionStore = create((set, get) => ({
  sessions: mockSessions,
  activeSession: null,
  activePhase: 1,

  // Data form Fase 01. Disimpan di sini (bukan useState lokal di Phase01)
  // agar bertahan saat user pindah ke fase lain lalu kembali; hilang saat
  // refresh halaman penuh, konsisten dengan store lain di app ini.
  phase01: initialPhase01,

  setActiveSession: (id) => {
    const session = get().sessions.find((s) => s.id === id)
    set({ activeSession: session, activePhase: session?.currentPhase || 1 })
  },
  setActivePhase: (phase) => set({ activePhase: phase }),
  clearActiveSession: () => set({ activeSession: null, activePhase: 1 }),

  setPhase01Field: (field, value) =>
    set((state) => ({ phase01: { ...state.phase01, [field]: value } })),

  addPhase01Row: (listField) =>
    set((state) => ({
      phase01: {
        ...state.phase01,
        [listField]: [...state.phase01[listField], emptyRow()],
      },
    })),

  updatePhase01Row: (listField, id, value) =>
    set((state) => ({
      phase01: {
        ...state.phase01,
        [listField]: state.phase01[listField].map((row) =>
          row.id === id ? { ...row, value } : row,
        ),
      },
    })),

  removePhase01Row: (listField, id) =>
    set((state) => ({
      phase01: {
        ...state.phase01,
        [listField]: state.phase01[listField].filter((row) => row.id !== id),
      },
    })),

  // Terapkan hasil analisis AI (bentuk tervalidasi dari services/openrouter)
  // ke form manual Fase 01. List kosong dijaga tetap punya 1 baris agar UI
  // dynamic-list-nya tidak kosong melompong.
  applyPhase01Import: (analysis) =>
    set(() => {
      const toRows = (list) =>
        list.length > 0
          ? list.map((value) => ({ id: crypto.randomUUID(), value }))
          : [emptyRow()]

      return {
        phase01: {
          rootObjective: analysis.rootObjective,
          functionTag: analysis.functionTag,
          functionJustification: analysis.functionJustification,
          internalParameters: toRows(analysis.internalParameters),
          externalConstraints: toRows(analysis.externalConstraints),
          recommendedTasks: toRows(analysis.recommendedTasks),
        },
      }
    }),
}))
