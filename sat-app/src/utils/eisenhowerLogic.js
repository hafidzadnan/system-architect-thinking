import { U_THRESHOLD, I_THRESHOLD } from './constants'

export const QUADRANTS = [
  {
    id: 1,
    title: 'Kuadran 1 — Interrupt Routine',
    subtitle: 'Penting & Mendesak → Eksekusi Langsung',
    className: 'eq-q1',
  },
  {
    id: 2,
    title: 'Kuadran 2 — Cron Job',
    subtitle: 'Penting & Tidak Mendesak → Jadwalkan',
    className: 'eq-q2',
  },
  {
    id: 3,
    title: 'Kuadran 3 — Daemon Process',
    subtitle: 'Tidak Penting & Mendesak → Delegasikan',
    className: 'eq-q3',
  },
  {
    id: 4,
    title: 'Kuadran 4 — Garbage Collection',
    subtitle: 'Tidak Penting & Tidak Mendesak → Hapus',
    className: 'eq-q4',
  },
]

/**
 * Tentukan kuadran Eisenhower dari nilai U (0-1) dan I (0-100).
 * Nilai non-numerik jatuh ke kuadran 4 agar tidak pernah melempar error.
 */
export function getQuadrant(u, i) {
  const uVal = parseFloat(u)
  const iVal = parseFloat(i)
  const urgent = Number.isFinite(uVal) && uVal >= U_THRESHOLD
  const important = Number.isFinite(iVal) && iVal >= I_THRESHOLD

  if (urgent && important) return 1
  if (!urgent && important) return 2
  if (urgent && !important) return 3
  return 4
}
