export const ACCEPTED_EXTENSIONS = [
  '.md',
  '.txt',
  '.json',
  '.csv',
  '.xlsx',
  '.pdf',
]
export const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

function getExtension(fileName) {
  return fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
}

/**
 * Validasi berdasarkan ekstensi nama file, bukan MIME type — browser
 * melaporkan MIME untuk .md/.csv secara tidak konsisten antar OS (sering
 * kosong), jadi sniffing MIME menghasilkan penolakan palsu.
 */
export function validateFile(file) {
  const ext = getExtension(file.name)
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return `Format ${ext || 'file'} tidak didukung. Gunakan: ${ACCEPTED_EXTENSIONS.join(', ')}.`
  }
  if (file.size > MAX_FILE_BYTES) {
    return 'Ukuran file melebihi 10 MB.'
  }
  return ''
}

/**
 * Ekstrak teks dari file berdasarkan ekstensi. .pdf dan .xlsx di-dispatch ke
 * modul terpisah lewat import dinamis supaya library beratnya (pdfjs-dist,
 * xlsx) tidak ikut initial bundle — hanya diunduh saat formatnya benar-benar
 * dipakai. .md/.txt/.json/.csv tidak butuh dependency sama sekali.
 */
export async function extractText(file, { signal } = {}) {
  const ext = getExtension(file.name)

  if (ext === '.pdf') {
    const { extractPdfText } = await import('./pdfExtractor')
    return extractPdfText(file, { signal })
  }
  if (ext === '.xlsx') {
    const { extractXlsxText } = await import('./xlsxExtractor')
    return extractXlsxText(file)
  }
  return file.text()
}
