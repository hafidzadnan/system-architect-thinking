import { AnalysisError, requestJson } from './openrouter'
import { CRITERIA_BENEFIT, CRITERIA_COST } from '../utils/constants'

export const CRITERIA_SYSTEM_PROMPT = `Anda adalah sistem pakar untuk pemodelan keputusan berbasis Expected Value. Tugas Anda memetakan variabel lingkungan (EVM) menjadi kriteria penilaian bertipe Benefit atau Cost.

Aturan pemetaan:
1. Satu kriteria HANYA boleh bertipe Benefit atau Cost, tidak boleh keduanya. Ini untuk menghindari Variable Conflict.
2. Jika satu variabel mengandung dua sisi sekaligus (sisi menguntungkan dan sisi membebani), PECAH menjadi dua kriteria terpisah. Contoh: variabel "Fitur Baru" dipecah menjadi "Akurasi" (Benefit) dan "Complexity/Maintenance" (Cost).
3. Variabel bertag "Hardcoded Data" (fakta statis) biasanya menjadi Cost absolut (biaya riil, waktu riil) atau Benefit absolut (pencapaian regulasi) — nilainya pasti dan minim probabilitas gagal.
4. Variabel bertag "Variable Parameter" (kondisi dinamis/preferensi) biasanya menjadi Cost relatif (beban kerja, tingkat stres) atau Benefit relatif (kepuasan pengguna, peningkatan kompetensi) — nilainya dipengaruhi probabilitas.
5. Bobot ("weight") berada pada rentang 0.0–1.0. Total bobot seluruh kriteria Benefit HARUS 1.0, dan total bobot seluruh kriteria Cost HARUS 1.0 (dihitung terpisah per tipe).
6. Gunakan "sourceVariableName" PERSIS seperti nama variabel yang diberikan pengguna, agar dapat dicocokkan kembali.
7. Setiap variabel yang diberikan harus menghasilkan minimal satu kriteria.
8. Seluruh "name" dan "justification" ditulis dalam Bahasa Indonesia. Justifikasi menjelaskan mengapa kriteria itu penting bagi Root Objective.

Hasilkan JSON murni (tanpa markdown, tanpa penjelasan tambahan) dengan struktur persis berikut:
{
  "criteria": [
    {
      "sourceVariableName": "Nama Variabel Persis Seperti Input",
      "name": "Nama Kriteria",
      "type": "Benefit",
      "weight": 0.6,
      "justification": "..."
    }
  ]
}`

const FUNCTION_TAG_LABELS = {
  hygienic: 'Hygienic Function (mencegah ketidakpuasan)',
  motivational: 'Motivational Function (mendorong peningkatan)',
}

/**
 * Susun konteks dinamis dari data Fase 01 + Fase 02 sebagai user message.
 */
export function buildCriteriaUserContent({
  rootObjective,
  functionTag,
  variables,
}) {
  const header = [
    `Root Objective: ${rootObjective?.trim() || '(belum diisi)'}`,
    `Tag Fungsi: ${FUNCTION_TAG_LABELS[functionTag] || '(belum diisi)'}`,
    '',
    `Daftar variabel yang harus dipetakan (${variables.length}):`,
  ]

  const body = variables.map((v, idx) =>
    [
      `${idx + 1}. ${v.name}`,
      `   - Asal: ${v.origin === 'internal' ? 'Parameter Internal' : 'Constraint Eksternal'}`,
      `   - Deskripsi: ${v.description?.trim() || '(belum diisi)'}`,
      `   - Sumber/Bukti: ${v.source?.trim() || '(belum diisi)'}`,
      `   - Tag: ${v.tag?.trim() || '(belum diisi)'}`,
      `   - Jenis Threshold: ${v.thresholdType?.trim() || '(belum diisi)'}`,
      `   - Nilai/Kondisi Threshold: ${v.thresholdValue?.trim() || '(belum diisi)'}`,
    ].join('\n'),
  )

  return [...header, ...body].join('\n')
}

function normalizeType(raw) {
  return String(raw ?? '')
    .trim()
    .toLowerCase() === 'cost'
    ? CRITERIA_COST
    : CRITERIA_BENEFIT
}

function normalizeWeight(raw) {
  const num = parseFloat(raw)
  if (!Number.isFinite(num) || num < 0) return 0
  return num > 1 ? 1 : num
}

/**
 * Normalisasi bobot per tipe agar totalnya tepat 1.0, sehingga hasil AI
 * langsung lolos validasi bobot Fase 04 dan user tidak perlu membetulkan
 * pembulatan model. User tetap bebas mengubah angkanya setelah itu.
 */
function normalizeWeightsByType(criteria, type) {
  const subset = criteria.filter((c) => c.type === type)
  if (subset.length === 0) return

  const total = subset.reduce((sum, c) => sum + c.weight, 0)
  if (total <= 0) {
    // Model tidak memberi bobot sama sekali — bagi rata.
    const even = Math.round((1 / subset.length) * 100) / 100
    subset.forEach((c) => {
      c.weight = even
    })
  } else {
    subset.forEach((c) => {
      c.weight = Math.round((c.weight / total) * 100) / 100
    })
  }

  // Sisa pembulatan dilimpahkan ke kriteria terakhir agar totalnya persis 1.0.
  const rounded = subset.reduce((sum, c) => sum + c.weight, 0)
  const drift = Math.round((1 - rounded) * 100) / 100
  if (drift !== 0) {
    const last = subset[subset.length - 1]
    last.weight = Math.round((last.weight + drift) * 100) / 100
  }
}

/**
 * Normalisasi respons AI menjadi daftar kriteria yang selalu tertaut ke
 * variabel Fase 02 yang benar-benar ada. Kriteria yang nama sumbernya tidak
 * dikenali dibuang supaya tabel Fase 04 tidak pernah punya baris hantu;
 * sebaliknya variabel yang dilewatkan model tetap dibuatkan satu kriteria
 * default agar tidak diam-diam hilang dari perhitungan EV — filosofi yang
 * sama dengan validateBiasAnalysis.
 */
export function validateCriteriaMapping(obj, variables) {
  const list = obj?.criteria
  if (!Array.isArray(list)) {
    throw new AnalysisError(
      'invalid_shape',
      'Field criteria tidak ditemukan pada respons AI.',
    )
  }

  const byName = new Map(variables.map((v) => [v.name.trim().toLowerCase(), v]))

  const criteria = []
  const coveredIds = new Set()

  for (const entry of list) {
    const key = String(entry?.sourceVariableName ?? '')
      .trim()
      .toLowerCase()
    const variable = byName.get(key)
    if (!variable) continue

    coveredIds.add(variable.id)
    criteria.push({
      id: crypto.randomUUID(),
      sourceVariableId: variable.id,
      name: String(entry?.name ?? '').trim() || variable.name,
      type: normalizeType(entry?.type),
      weight: normalizeWeight(entry?.weight),
      justification: String(entry?.justification ?? '').trim(),
    })
  }

  if (criteria.length === 0) {
    throw new AnalysisError(
      'invalid_shape',
      'Respons AI tidak memuat satu pun variabel yang diminta. Coba lagi.',
    )
  }

  for (const variable of variables) {
    if (coveredIds.has(variable.id)) continue
    criteria.push({
      id: crypto.randomUUID(),
      sourceVariableId: variable.id,
      name: variable.name,
      type: CRITERIA_BENEFIT,
      weight: 0,
      justification: 'AI tidak memetakan variabel ini — lengkapi manual.',
    })
  }

  normalizeWeightsByType(criteria, CRITERIA_BENEFIT)
  normalizeWeightsByType(criteria, CRITERIA_COST)

  return criteria
}

/**
 * Petakan seluruh variabel Fase 02 menjadi kriteria Benefit/Cost Fase 04.
 */
export async function mapCriteria({
  apiKey,
  model,
  rootObjective,
  functionTag,
  variables,
  signal,
}) {
  const parsed = await requestJson({
    apiKey,
    model,
    systemPrompt: CRITERIA_SYSTEM_PROMPT,
    userContent: buildCriteriaUserContent({
      rootObjective,
      functionTag,
      variables,
    }),
    signal,
  })
  return validateCriteriaMapping(parsed, variables)
}
