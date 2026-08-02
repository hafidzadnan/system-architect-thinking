// Konstanta bersama untuk Fase 02 & Fase 03.

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
