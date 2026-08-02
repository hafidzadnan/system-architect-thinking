const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'
const MAX_INPUT_CHARS = 100000

export const SYSTEM_PROMPT = `Anda adalah asisten AI untuk arsitektur sistem pengambilan keputusan. Analisis dokumen/konteks yang diberikan pengguna dan hasilkan output berupa JSON murni (tanpa markdown, tanpa penjelasan tambahan) dengan struktur persis berikut:
{
  "rootObjective": "Tujuan utama (string)",
  "functionTag": "hygienic|motivational",
  "functionJustification": "Alasan logis pemilihan tag fungsi (string)",
  "internalParameters": ["Kondisi internal, kekuatan/kelemahan", "..."],
  "externalConstraints": ["Kondisi eksternal, peluang/ancaman", "..."],
  "recommendedTasks": ["Action item 1", "Action item 2"]
}`

export class AnalysisError extends Error {
  constructor(kind, message) {
    super(message)
    this.name = 'AnalysisError'
    this.kind = kind
  }
}

const MESSAGES = {
  missing_key: 'API key belum diatur. Buka Pengaturan untuk menambahkannya.',
  invalid_key: 'API key tidak valid atau dinonaktifkan. Periksa di Pengaturan.',
  no_credits: 'Kredit OpenRouter tidak mencukupi. Isi ulang untuk melanjutkan.',
  forbidden: 'Permintaan ditolak oleh moderasi penyedia model.',
  rate_limited: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.',
  timeout: 'Permintaan melebihi batas waktu. Coba lagi.',
  model_unavailable: 'Model tidak tersedia. Pilih model lain di Pengaturan.',
  bad_request: 'Permintaan ditolak. Coba model lain di Pengaturan.',
  network: 'Gagal terhubung ke OpenRouter. Periksa koneksi internet.',
  unparseable: 'Respons AI tidak dapat dibaca. Coba lagi.',
  invalid_shape: 'Respons AI tidak sesuai format yang diharapkan. Coba lagi.',
  provider_error: 'Penyedia model mengembalikan error. Coba lagi.',
}

const STATUS_TO_KIND = {
  400: 'bad_request',
  401: 'invalid_key',
  402: 'no_credits',
  403: 'forbidden',
  404: 'model_unavailable',
  408: 'timeout',
  429: 'rate_limited',
  502: 'model_unavailable',
  503: 'model_unavailable',
}

async function toApiError(res) {
  let detail = ''
  try {
    const body = await res.json()
    detail = body?.error?.message ?? ''
  } catch {
    // non-JSON error body, ignore
  }
  const kind = STATUS_TO_KIND[res.status] ?? 'network'
  return new AnalysisError(kind, detail || MESSAGES[kind])
}

function postChat(body, apiKey, signal) {
  return fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  })
}

async function safePostChat(body, apiKey, signal) {
  try {
    return await postChat(body, apiKey, signal)
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new AnalysisError('network', MESSAGES.network)
  }
}

/**
 * Cari objek JSON di dalam teks respons AI. Mencoba berurutan: isi dalam
 * fence ```json, seluruh string mentah, lalu span {...} terluar — model
 * kadang tetap membungkus JSON dengan markdown walau diminta JSON murni.
 */
export function extractJson(raw) {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new AnalysisError('unparseable', MESSAGES.unparseable)
  }

  const candidates = []
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) candidates.push(fence[1])
  candidates.push(raw)

  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start !== -1 && end > start) candidates.push(raw.slice(start, end + 1))

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate.trim())
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      // try next candidate
    }
  }
  throw new AnalysisError('unparseable', MESSAGES.unparseable)
}

const FUNCTION_TAGS = ['hygienic', 'motivational']

function toStringList(value) {
  const arr = Array.isArray(value) ? value : value == null ? [] : [value]
  return arr
    .map((item) =>
      typeof item === 'string' ? item.trim() : String(item ?? '').trim(),
    )
    .filter(Boolean)
}

/**
 * Normalisasi hasil parse JSON ke bentuk 6 field yang dipakai form Fase 01.
 * functionTag yang tidak dikenali di-default ke 'hygienic' alih-alih
 * menggagalkan seluruh analisis — Step 3 wizard tetap layar review manusia,
 * jadi default yang bisa dikoreksi lebih baik daripada membuang analisis
 * yang mungkin sudah benar di 5 field lainnya.
 */
export function validateAnalysis(obj) {
  const rootObjective = String(obj?.rootObjective ?? '').trim()
  if (!rootObjective) {
    throw new AnalysisError(
      'invalid_shape',
      'Field rootObjective tidak ditemukan pada respons AI.',
    )
  }

  const rawTag = String(obj?.functionTag ?? '')
    .trim()
    .toLowerCase()
  const functionTag = FUNCTION_TAGS.includes(rawTag) ? rawTag : 'hygienic'

  return {
    rootObjective,
    functionTag,
    functionJustification: String(obj?.functionJustification ?? '').trim(),
    internalParameters: toStringList(obj?.internalParameters),
    externalConstraints: toStringList(obj?.externalConstraints),
    recommendedTasks: toStringList(obj?.recommendedTasks),
  }
}

/**
 * Kirim teks sumber ke OpenRouter dan kembalikan hasil analisis yang sudah
 * divalidasi. response_format dikirim dulu untuk model yang mendukung JSON
 * mode; ~16% model di katalog OpenRouter menolaknya dengan 400, jadi bila
 * itu terjadi field-nya dilepas dan request diulang sekali tanpa itu.
 */
export async function analyzeDocument({ apiKey, model, text, signal }) {
  if (!apiKey) {
    throw new AnalysisError('missing_key', MESSAGES.missing_key)
  }

  const trimmedText =
    text.length > MAX_INPUT_CHARS
      ? text.slice(0, MAX_INPUT_CHARS) +
        '\n\n[...teks dipotong karena terlalu panjang...]'
      : text

  const body = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: trimmedText },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  }

  let res = await safePostChat(body, apiKey, signal)

  if (res.status === 400 && body.response_format) {
    delete body.response_format
    res = await safePostChat(body, apiKey, signal)
  }

  if (!res.ok) {
    throw await toApiError(res)
  }

  const json = await res.json()
  const choice = json?.choices?.[0]
  if (choice?.finish_reason === 'error') {
    throw new AnalysisError(
      'provider_error',
      choice?.error?.message || MESSAGES.provider_error,
    )
  }

  const content = choice?.message?.content ?? ''
  return validateAnalysis(extractJson(content))
}
