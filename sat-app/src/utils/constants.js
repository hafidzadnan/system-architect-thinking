// Konstanta bersama untuk Fase 02 s.d. Fase 05.

// Urutan array ini menentukan urutan kolom matriks validasi di Fase 03.
export const BIAS_TYPES = [
  { key: 'samplingError', label: 'Sampling Error' },
  { key: 'overfitting', label: 'Overfitting' },
  { key: 'exceptionSuppression', label: 'Exception Suppression' },
  { key: 'spuriousLink', label: 'Spurious Link' },
]

export const BIAS_KEYS = BIAS_TYPES.map((b) => b.key)

export const BIAS_LABELS = Object.fromEntries(
  BIAS_TYPES.map((b) => [b.key, b.label]),
)

export const TAG_OPTIONS = ['Variable Parameter', 'Hardcoded Data']
export const TAG_HARDCODED = 'Hardcoded Data'

export const THRESHOLD_TYPES = ['Dynamic (Skala)', 'Static (Boolean)']

// Ambang batas Matriks Eisenhower: U = Time Criticality, I = System Impact.
export const U_THRESHOLD = 0.7
export const I_THRESHOLD = 70

// ===== FASE 04 =====

export const CRITERIA_TYPES = ['Benefit', 'Cost']
export const CRITERIA_BENEFIT = 'Benefit'
export const CRITERIA_COST = 'Cost'

// Batas jumlah opsi kebijakan yang dibandingkan (README keputusan #12).
export const MIN_OPTIONS = 2
export const MAX_OPTIONS = 5

// ===== FASE 05 =====

export const MONITORING_INTERVALS = ['Mingguan', 'Bulanan', 'Triwulanan']

// Adaptasi Cipolla Matrix. Urutan array menentukan urutan sel di grid 2x2.
export const STAKEHOLDER_QUADRANTS = [
  {
    key: 'intelligent',
    title: '🟢 Intelligent (Win-Win)',
    axes: 'Internal (+) & Eksternal (+)',
    example: 'Contoh: Digitalisasi yang cepat dan mudah bagi semua pihak',
    className: 'sq-intelligent',
  },
  {
    key: 'bandit',
    title: '🟡 Bandit (Win-Lose)',
    axes: 'Internal (+) & Eksternal (−)',
    example: 'Contoh: DJPb untung tapi Satker terbebani laporan berlapis',
    className: 'sq-bandit',
  },
  {
    key: 'helpless',
    title: '🔵 Helpless (Lose-Win)',
    axes: 'Internal (−) & Eksternal (+)',
    example: 'Contoh: Pegawai KPPN kelelahan mengerjakan tugas entry Satker',
    className: 'sq-helpless',
  },
  {
    key: 'stupid',
    title: '🔴 Stupid (Lose-Lose)',
    axes: 'Internal (−) & Eksternal (−)',
    example: 'Contoh: Aturan yang membingungkan semua pihak',
    className: 'sq-stupid',
  },
]

export const STAKEHOLDER_LABELS = Object.fromEntries(
  STAKEHOLDER_QUADRANTS.map((q) => [q.key, q.title]),
)
