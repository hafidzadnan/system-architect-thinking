/**
 * Ekstraksi teks dari PDF via pdfjs-dist. Kedua import di bawah dinamis
 * (bukan di top-level modul) agar pdf.min.mjs (~444 KB) dan worker
 * pdf.worker.min.mjs (~1.2 MB) masuk chunk/asset terpisah, hanya diunduh
 * saat user benar-benar mengunggah file PDF — bukan bagian initial bundle.
 *
 * Catatan: `?url` pada file .mjs tidak terdokumentasi resmi di Vite (yang
 * terdokumentasi adalah suffix `?worker`), tapi ini pola yang umum dipakai
 * untuk pdf.js karena worker-nya sudah ter-minify. Wajib diverifikasi lewat
 * `npm run build && npm run preview`, bukan hanya `npm run dev` — inilah
 * titik di mana keduanya bisa berbeda perilaku.
 */
export async function extractPdfText(file, { signal } = {}) {
  const [pdfjs, workerModule] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ])

  pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default

  const data = new Uint8Array(await file.arrayBuffer())
  const task = pdfjs.getDocument({ data })
  signal?.addEventListener('abort', () => task.destroy(), { once: true })

  const doc = await task.promise
  try {
    const pages = []
    for (let i = 1; i <= doc.numPages; i++) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      pages.push(content.items.map((item) => item.str).join(' '))
      page.cleanup()
    }
    return pages.join('\n\n')
  } finally {
    await doc.destroy()
  }
}
