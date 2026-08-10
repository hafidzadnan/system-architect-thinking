/**
 * Ekstraksi teks dari Excel via SheetJS (dependency dari CDN vendor sendiri,
 * lihat package.json — paket `xlsx` di npm registry sudah tidak diperbarui
 * sejak 2022). Import dinamis agar ~952 KB library ini hanya diunduh saat
 * user benar-benar mengunggah file .xlsx.
 */
export async function extractXlsxText(file) {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })

  return workbook.SheetNames.map((name) => {
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[name], {
      blankrows: false,
    })
    return `## Sheet: ${name}\n${csv}`
  }).join('\n\n')
}
