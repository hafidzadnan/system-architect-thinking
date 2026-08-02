import { CRITERIA_BENEFIT } from './constants'

/**
 * Semua fungsi di sini murni dan tidak pernah melempar untuk input non-numerik
 * — input berasal langsung dari <input> yang bisa kosong/setengah diketik,
 * jadi nilai tak valid diperlakukan sebagai 0 (gaya yang sama dengan
 * getQuadrant di eisenhowerLogic.js).
 */
function toNumber(value) {
  const num = parseFloat(value)
  return Number.isFinite(num) ? num : 0
}

// Bulatkan ke 2 desimal supaya penjumlahan float (0.1 + 0.2 = 0.30000000000000004)
// tidak membuat total bobot gagal dibandingkan dengan 1.
function round2(value) {
  return Math.round(value * 100) / 100
}

/**
 * EV satu baris = Nilai × Bobot × Probabilitas.
 * Berlaku untuk Benefit (P_success) maupun Cost (P_risk); tandanya baru
 * ditentukan saat penjumlahan di computeOptionEv.
 */
export function computeRowEv({ value, probability, weight }) {
  return round2(toNumber(value) * toNumber(weight) * toNumber(probability))
}

/**
 * Total bobot dihitung terpisah per tipe — README keputusan #9 mensyaratkan
 * Benefit = 1.0 dan Cost = 1.0 masing-masing, bukan gabungannya (total
 * gabungan studi kasus KPPN memang 2.0).
 */
export function computeWeightTotals(criteria) {
  let benefit = 0
  let cost = 0
  for (const criterion of criteria) {
    const weight = toNumber(criterion.weight)
    if (criterion.type === CRITERIA_BENEFIT) benefit += weight
    else cost += weight
  }
  return { benefit: round2(benefit), cost: round2(cost) }
}

export function isWeightValid(totals) {
  return totals.benefit === 1 && totals.cost === 1
}

/**
 * EV satu opsi = Σ(Benefit × Bobot × P_success) − Σ(Cost × Bobot × P_risk).
 */
export function computeOptionEv(criteria, scores, optionId) {
  let benefitTotal = 0
  let costTotal = 0

  for (const criterion of criteria) {
    const score = scores[criterion.id]?.[optionId] || {}
    const rowEv = computeRowEv({
      value: score.value,
      probability: score.probability,
      weight: criterion.weight,
    })
    if (criterion.type === CRITERIA_BENEFIT) benefitTotal += rowEv
    else costTotal += rowEv
  }

  return {
    benefitTotal: round2(benefitTotal),
    costTotal: round2(costTotal),
    ev: round2(benefitTotal - costTotal),
  }
}

export function computeEvComparison({ options, criteria, scores }) {
  return options.map((option) => ({
    optionId: option.id,
    name: option.name,
    ...computeOptionEv(criteria, scores, option.id),
  }))
}

/**
 * Opsi dengan EV tertinggi. Mengembalikan null bila tidak ada opsi atau
 * seluruh EV negatif — PRD meminta sistem TIDAK memilih pemenang dalam
 * kondisi itu, melainkan menyarankan peninjauan ulang Root Objective.
 */
export function findBestOption(results) {
  if (results.length === 0) return null
  const best = results.reduce((a, b) => (b.ev > a.ev ? b : a))
  return best.ev > 0 ? best : null
}
