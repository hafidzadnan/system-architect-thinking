import { create } from 'zustand'
import { getQuadrant } from '../utils/eisenhowerLogic'
import {
  TAG_HARDCODED,
  CRITERIA_BENEFIT,
  MIN_OPTIONS,
  MAX_OPTIONS,
} from '../utils/constants'
import { computeEvComparison } from '../utils/evCalculator'

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

const initialPhase02 = {
  // Detail variabel di-key oleh id baris EVM Fase 01, bukan disalin jadi
  // daftar tersendiri. Daftar variabelnya diturunkan saat baca (lihat
  // selectPhase02Variables) sehingga edit/hapus di Fase 01 langsung
  // terpropagasi ke Fase 02 tanpa kode sinkronisasi.
  variables: {}, // { [evmRowId]: { description, source, tag, thresholdType, thresholdValue } }
  taskInputs: {}, // { [taskId]: { u, i } } — nilai sementara sebelum di-plot
  extraTasks: [], // { id, name } — task yang diketik manual di Fase 02
  plotted: [], // { id, name, u, i, quadrant }
  dismissed: [], // id task yang dihapus permanen dari priority queue
}

const initialPhase03 = {
  status: 'idle', // idle | running | error | done
  error: null, // { kind, message }
  validations: [], // [{ variableId, variableName, biases: {...} }]
  analyzedAt: null,
  staleVariableIds: [], // variabel yang direvisi setelah analisis terakhir
  selected: null, // { variableId, biasType }
}

const emptyVariableDetail = {
  description: '',
  source: '',
  tag: '',
  thresholdType: '',
  thresholdValue: '',
}

const emptyOption = () => ({ id: crypto.randomUUID(), name: '' })

const initialPhase04 = {
  options: [emptyOption(), emptyOption()], // minimal 2 opsi (README #12)
  // Kriteria disimpan sebagai list tersendiri (bukan diturunkan 1:1 dari
  // variabel) karena README #19 mengizinkan AI memecah satu variabel jadi
  // dua kriteria Benefit + Cost. Tautan ke asalnya lewat sourceVariableId.
  criteria: [], // { id, sourceVariableId, name, type, weight, justification }
  scores: {}, // { [criteriaId]: { [optionId]: { value, probability } } }
  mapStatus: 'idle', // idle | running | error | done
  mapError: null, // { kind, message }
  mappedAt: null,
}

const initialPhase05 = {
  zombieStatus: 'positive', // positive | rollback
  zombieJustification: '',
  metrics: [emptyRow()],
  interval: 'Bulanan',
  rollbackTrigger: '',
  stakeholderQuadrant: '',
  stakeholderJustification: '',
}

/**
 * Daftar variabel Fase 02 = seluruh baris EVM Fase 01 yang tidak kosong,
 * digabung dengan detail yang diisi user di Fase 02.
 */
export function selectPhase02Variables(state) {
  const { internalParameters, externalConstraints } = state.phase01
  const rows = [
    ...internalParameters.map((row) => ({ row, origin: 'internal' })),
    ...externalConstraints.map((row) => ({ row, origin: 'external' })),
  ]

  return rows
    .filter(({ row }) => row.value.trim())
    .map(({ row, origin }) => {
      const detail = {
        ...emptyVariableDetail,
        ...(state.phase02.variables[row.id] || {}),
      }
      return {
        id: row.id,
        name: row.value.trim(),
        origin,
        ...detail,
        // Sumber/bukti wajib untuk fakta empiris (Hardcoded Data).
        needsSource: detail.tag === TAG_HARDCODED && !detail.source.trim(),
      }
    })
}

/**
 * Task yang belum masuk matriks: rekomendasi Fase 01 + task manual Fase 02,
 * dikurangi yang sudah di-plot atau dihapus permanen.
 */
export function selectPhase02UnplottedTasks(state) {
  const fromPhase01 = state.phase01.recommendedTasks
    .filter((row) => row.value.trim())
    .map((row) => ({ id: row.id, name: row.value.trim() }))

  const plottedIds = new Set(state.phase02.plotted.map((t) => t.id))
  const dismissedIds = new Set(state.phase02.dismissed)

  return [...fromPhase01, ...state.phase02.extraTasks]
    .filter((t) => !plottedIds.has(t.id) && !dismissedIds.has(t.id))
    .map((t) => ({
      ...t,
      u: '',
      i: '',
      ...(state.phase02.taskInputs[t.id] || {}),
    }))
}

/**
 * Kriteria Fase 04 yang sumbernya masih ada di Fase 02. Kriteria yang
 * variabel asalnya sudah dihapus di Fase 01 dibuang di sini agar tabel EV
 * tidak pernah menampilkan baris hantu.
 */
export function selectPhase04Criteria(state) {
  const variableById = new Map(
    selectPhase02Variables(state).map((v) => [v.id, v]),
  )

  return state.phase04.criteria
    .filter((c) => variableById.has(c.sourceVariableId))
    .map((c) => {
      const source = variableById.get(c.sourceVariableId)
      return {
        ...c,
        sourceName: source.name,
        sourceOrigin:
          source.origin === 'internal'
            ? 'Parameter Internal'
            : 'Constraint Eksternal',
      }
    })
}

/**
 * Hasil kalkulasi EV per opsi kebijakan.
 */
export function selectPhase04Results(state) {
  return computeEvComparison({
    options: state.phase04.options,
    criteria: selectPhase04Criteria(state),
    scores: state.phase04.scores,
  })
}

export const useSessionStore = create((set, get) => ({
  sessions: mockSessions,
  activeSession: null,
  activePhase: 1,

  // Data form Fase 01. Disimpan di sini (bukan useState lokal di Phase01)
  // agar bertahan saat user pindah ke fase lain lalu kembali; hilang saat
  // refresh halaman penuh, konsisten dengan store lain di app ini.
  phase01: initialPhase01,
  phase02: initialPhase02,
  phase03: initialPhase03,
  phase04: initialPhase04,
  phase05: initialPhase05,

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

  // ===== FASE 02 =====

  // Selain menyimpan detail variabel, ini juga menandai variabelnya "stale"
  // bila sudah pernah dianalisis di Fase 03 — dasar loop revisi → analisis
  // ulang (keputusan README #16/#17). Revisi dari panel warning Fase 03
  // memanggil action yang sama, jadi penandaannya otomatis ikut.
  setPhase02Variable: (varId, field, value) =>
    set((state) => {
      const wasAnalyzed = state.phase03.validations.some(
        (v) => v.variableId === varId,
      )
      const alreadyStale = state.phase03.staleVariableIds.includes(varId)

      return {
        phase02: {
          ...state.phase02,
          variables: {
            ...state.phase02.variables,
            [varId]: {
              ...emptyVariableDetail,
              ...(state.phase02.variables[varId] || {}),
              [field]: value,
            },
          },
        },
        phase03:
          wasAnalyzed && !alreadyStale
            ? {
                ...state.phase03,
                staleVariableIds: [...state.phase03.staleVariableIds, varId],
              }
            : state.phase03,
      }
    }),

  setPhase02TaskInput: (taskId, field, value) =>
    set((state) => ({
      phase02: {
        ...state.phase02,
        taskInputs: {
          ...state.phase02.taskInputs,
          [taskId]: {
            u: '',
            i: '',
            ...(state.phase02.taskInputs[taskId] || {}),
            [field]: value,
          },
        },
      },
    })),

  plotPhase02Task: (task) =>
    set((state) => ({
      phase02: {
        ...state.phase02,
        plotted: [
          ...state.phase02.plotted,
          {
            id: task.id,
            name: task.name,
            u: parseFloat(task.u),
            i: parseFloat(task.i),
            quadrant: getQuadrant(task.u, task.i),
          },
        ],
      },
    })),

  addPhase02ManualTask: ({ name, u, i }) =>
    set((state) => {
      const id = crypto.randomUUID()
      return {
        phase02: {
          ...state.phase02,
          extraTasks: [...state.phase02.extraTasks, { id, name }],
          plotted: [
            ...state.phase02.plotted,
            {
              id,
              name,
              u: parseFloat(u),
              i: parseFloat(i),
              quadrant: getQuadrant(u, i),
            },
          ],
        },
      }
    }),

  // Edit/Re-plot: kembalikan ke tabel input dengan nilai U/I sebelumnya.
  unplotPhase02Task: (taskId) =>
    set((state) => {
      const task = state.phase02.plotted.find((t) => t.id === taskId)
      return {
        phase02: {
          ...state.phase02,
          plotted: state.phase02.plotted.filter((t) => t.id !== taskId),
          taskInputs: {
            ...state.phase02.taskInputs,
            [taskId]: { u: String(task?.u ?? ''), i: String(task?.i ?? '') },
          },
        },
      }
    }),

  // Hapus permanen: masuk daftar dismissed agar tidak muncul lagi di tabel
  // input meski asalnya dari rekomendasi Fase 01.
  removePhase02Task: (taskId) =>
    set((state) => ({
      phase02: {
        ...state.phase02,
        plotted: state.phase02.plotted.filter((t) => t.id !== taskId),
        dismissed: [...state.phase02.dismissed, taskId],
      },
    })),

  // ===== FASE 03 =====

  startPhase03Analysis: () =>
    set((state) => ({
      phase03: { ...state.phase03, status: 'running', error: null },
    })),

  setPhase03Result: (validations) =>
    set((state) => ({
      phase03: {
        ...state.phase03,
        status: 'done',
        error: null,
        validations,
        analyzedAt: new Date().toISOString(),
        staleVariableIds: [],
        selected: null,
      },
    })),

  setPhase03Error: (error) =>
    set((state) => ({
      phase03: { ...state.phase03, status: 'error', error },
    })),

  // Status 'running' hanya valid selama Phase03 ter-mount, karena
  // AbortController-nya hidup di komponen. Kalau user pindah fase saat
  // analisis berjalan, request dibatalkan dan status harus dikembalikan —
  // tanpa ini Fase 03 tampil loading selamanya dengan tombol disabled.
  cancelPhase03Analysis: () =>
    set((state) => {
      if (state.phase03.status !== 'running') return state
      return {
        phase03: {
          ...state.phase03,
          status: state.phase03.validations.length > 0 ? 'done' : 'idle',
        },
      }
    }),

  selectPhase03Cell: (variableId, biasType) =>
    set((state) => {
      const current = state.phase03.selected
      const isSame =
        current?.variableId === variableId && current?.biasType === biasType
      return {
        phase03: {
          ...state.phase03,
          selected: isSame ? null : { variableId, biasType },
        },
      }
    }),

  // ===== FASE 04 =====

  addPhase04Option: () =>
    set((state) => {
      if (state.phase04.options.length >= MAX_OPTIONS) return state
      return {
        phase04: {
          ...state.phase04,
          options: [...state.phase04.options, emptyOption()],
        },
      }
    }),

  updatePhase04Option: (optionId, name) =>
    set((state) => ({
      phase04: {
        ...state.phase04,
        options: state.phase04.options.map((o) =>
          o.id === optionId ? { ...o, name } : o,
        ),
      },
    })),

  // Skor di-key oleh optionId, jadi menghapus opsi harus ikut membersihkan
  // kolom skornya agar tidak menumpuk jadi data yatim.
  removePhase04Option: (optionId) =>
    set((state) => {
      if (state.phase04.options.length <= MIN_OPTIONS) return state
      const scores = {}
      for (const [criteriaId, byOption] of Object.entries(
        state.phase04.scores,
      )) {
        scores[criteriaId] = Object.fromEntries(
          Object.entries(byOption).filter(([id]) => id !== optionId),
        )
      }
      return {
        phase04: {
          ...state.phase04,
          options: state.phase04.options.filter((o) => o.id !== optionId),
          scores,
        },
      }
    }),

  addPhase04Criterion: (sourceVariableId) =>
    set((state) => ({
      phase04: {
        ...state.phase04,
        criteria: [
          ...state.phase04.criteria,
          {
            id: crypto.randomUUID(),
            sourceVariableId,
            name: '',
            type: CRITERIA_BENEFIT,
            weight: '',
            justification: '',
          },
        ],
      },
    })),

  updatePhase04Criterion: (criteriaId, field, value) =>
    set((state) => ({
      phase04: {
        ...state.phase04,
        criteria: state.phase04.criteria.map((c) =>
          c.id === criteriaId ? { ...c, [field]: value } : c,
        ),
      },
    })),

  removePhase04Criterion: (criteriaId) =>
    set((state) => {
      const scores = Object.fromEntries(
        Object.entries(state.phase04.scores).filter(
          ([id]) => id !== criteriaId,
        ),
      )
      return {
        phase04: {
          ...state.phase04,
          criteria: state.phase04.criteria.filter((c) => c.id !== criteriaId),
          scores,
        },
      }
    }),

  setPhase04Score: (criteriaId, optionId, field, value) =>
    set((state) => ({
      phase04: {
        ...state.phase04,
        scores: {
          ...state.phase04.scores,
          [criteriaId]: {
            ...state.phase04.scores[criteriaId],
            [optionId]: {
              value: '',
              probability: '',
              ...state.phase04.scores[criteriaId]?.[optionId],
              [field]: value,
            },
          },
        },
      },
    })),

  startPhase04Mapping: () =>
    set((state) => ({
      phase04: { ...state.phase04, mapStatus: 'running', mapError: null },
    })),

  setPhase04Mapping: (criteria) =>
    set((state) => ({
      phase04: {
        ...state.phase04,
        mapStatus: 'done',
        mapError: null,
        criteria,
        scores: {}, // kriteria baru = id baru, skor lama tidak lagi relevan
        mappedAt: new Date().toISOString(),
      },
    })),

  setPhase04MapError: (mapError) =>
    set((state) => ({
      phase04: { ...state.phase04, mapStatus: 'error', mapError },
    })),

  // Alasan yang sama dengan cancelPhase03Analysis: status 'running' hanya
  // valid selama Phase04 ter-mount karena AbortController-nya di komponen.
  cancelPhase04Mapping: () =>
    set((state) => {
      if (state.phase04.mapStatus !== 'running') return state
      return {
        phase04: {
          ...state.phase04,
          mapStatus: state.phase04.criteria.length > 0 ? 'done' : 'idle',
        },
      }
    }),

  // ===== FASE 05 =====

  setPhase05Field: (field, value) =>
    set((state) => ({ phase05: { ...state.phase05, [field]: value } })),

  addPhase05Metric: () =>
    set((state) => ({
      phase05: {
        ...state.phase05,
        metrics: [...state.phase05.metrics, emptyRow()],
      },
    })),

  updatePhase05Metric: (id, value) =>
    set((state) => ({
      phase05: {
        ...state.phase05,
        metrics: state.phase05.metrics.map((row) =>
          row.id === id ? { ...row, value } : row,
        ),
      },
    })),

  removePhase05Metric: (id) =>
    set((state) => ({
      phase05: {
        ...state.phase05,
        metrics: state.phase05.metrics.filter((row) => row.id !== id),
      },
    })),
}))
