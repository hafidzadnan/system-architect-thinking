import { AnalysisError, requestJson } from './openrouter'
import { BIAS_KEYS } from '../utils/constants'

export const BIAS_SYSTEM_PROMPT = `Anda adalah sistem pakar untuk validasi logika arsitektur pengambilan keputusan. Tugas Anda mendeteksi 4 jenis bias kognitif pada setiap variabel yang diberikan pengguna:

1. samplingError — kesimpulan ditarik dari sampel yang tidak representatif atau observasi sebagian.
2. overfitting — generalisasi berlebihan dari kasus kasuistik/anekdotal menjadi aturan umum.
3. exceptionSuppression — data atau kasus yang bertentangan diabaikan/disembunyikan agar kesimpulan tetap rapi.
4. spuriousLink — klaim sebab-akibat yang sebenarnya hanya korelasi atau kebetulan.

Aturan penilaian:
- Jika variabel aman terhadap suatu bias, set "status": "validated" dan isi "reason" dengan alasan logis mengapa lolos. Biarkan "recommendation" berupa string kosong.
- Jika ada potensi bias, set "status": "warning", isi "reason" dengan penjelasan bugnya, dan "recommendation" dengan prosedur sanitasi yang konkret dan bisa dieksekusi.
- Variabel bertag "Hardcoded Data" tanpa sumber/bukti yang jelas hampir selalu berpotensi samplingError.
- Evaluasi SETIAP variabel terhadap KEEMPAT bias. Gunakan "variableName" persis seperti yang diberikan pengguna.
- Seluruh "reason" dan "recommendation" ditulis dalam Bahasa Indonesia.

Hasilkan JSON murni (tanpa markdown, tanpa penjelasan tambahan) dengan struktur persis berikut:
{
  "validations": [
    {
      "variableName": "Nama Variabel",
      "biases": {
        "samplingError": { "status": "warning", "reason": "...", "recommendation": "..." },
        "overfitting": { "status": "validated", "reason": "...", "recommendation": "" },
        "exceptionSuppression": { "status": "validated", "reason": "...", "recommendation": "" },
        "spuriousLink": { "status": "validated", "reason": "...", "recommendation": "" }
      }
    }
  ]
}`

const FUNCTION_TAG_LABELS = {
  hygienic: 'Hygienic Function (mencegah ketidakpuasan)',
  motivational: 'Motivational Function (mendorong peningkatan)',
}

/**
 * Susun konteks dinamis dari data Fase 01 + Fase 02 sebagai user message.
 * Inilah "prompt template dinamis yang memuat semua variabel Fase 02".
 */
export function buildBiasUserContent({
  rootObjective,
  functionTag,
  variables,
}) {
  const header = [
    `Root Objective: ${rootObjective?.trim() || '(belum diisi)'}`,
    `Tag Fungsi: ${FUNCTION_TAG_LABELS[functionTag] || '(belum diisi)'}`,
    '',
    `Daftar variabel yang harus divalidasi (${variables.length}):`,
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

function normalizeBias(raw) {
  const status =
    String(raw?.status ?? '')
      .trim()
      .toLowerCase() === 'warning'
      ? 'warning'
      : 'validated'

  return {
    status,
    reason: String(raw?.reason ?? '').trim(),
    recommendation: String(raw?.recommendation ?? '').trim(),
  }
}

const DEFAULT_BIAS = {
  status: 'validated',
  reason: 'AI tidak mengembalikan temuan untuk bias ini.',
  recommendation: '',
}

/**
 * Normalisasi respons AI ke satu entri per variabel input, bukan per entri
 * yang kebetulan dikembalikan model. Konsekuensinya matriks Fase 03 selalu
 * berisi persis baris variabel Fase 02: variabel yang dilewatkan model diisi
 * default 'validated' alih-alih menggagalkan seluruh analisis — sejalan
 * dengan validateAnalysis di openrouter.js yang memilih default yang bisa
 * dikoreksi manusia daripada membuang hasil yang sebagian sudah benar.
 */
export function validateBiasAnalysis(obj, variables) {
  const list = obj?.validations
  if (!Array.isArray(list)) {
    throw new AnalysisError(
      'invalid_shape',
      'Field validations tidak ditemukan pada respons AI.',
    )
  }

  const byName = new Map()
  for (const entry of list) {
    const name = String(entry?.variableName ?? '')
      .trim()
      .toLowerCase()
    if (name && !byName.has(name)) byName.set(name, entry)
  }

  let matched = 0
  const validations = variables.map((variable) => {
    const entry = byName.get(variable.name.trim().toLowerCase())
    if (entry) matched += 1

    const biases = {}
    for (const key of BIAS_KEYS) {
      biases[key] = entry?.biases?.[key]
        ? normalizeBias(entry.biases[key])
        : { ...DEFAULT_BIAS }
    }

    return { variableId: variable.id, variableName: variable.name, biases }
  })

  if (matched === 0) {
    throw new AnalysisError(
      'invalid_shape',
      'Respons AI tidak memuat satu pun variabel yang diminta. Coba lagi.',
    )
  }

  return validations
}

/**
 * Jalankan deteksi bias untuk seluruh variabel Fase 02 dan kembalikan hasil
 * yang sudah dinormalisasi ke bentuk matriks Fase 03.
 */
export async function analyzeBias({
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
    systemPrompt: BIAS_SYSTEM_PROMPT,
    userContent: buildBiasUserContent({
      rootObjective,
      functionTag,
      variables,
    }),
    signal,
  })
  return validateBiasAnalysis(parsed, variables)
}
