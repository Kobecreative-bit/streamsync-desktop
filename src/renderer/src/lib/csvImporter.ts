import Papa from 'papaparse'

export interface CsvProduct {
  name: string
  price: string
  description?: string
  buyLink?: string
  category?: string
}

export interface CsvInvalidRow {
  row: number
  data: Record<string, string>
  error: string
}

export interface ParseResult {
  valid: CsvProduct[]
  invalid: CsvInvalidRow[]
  total: number
}

export function parseCsvProducts(csvText: string): ParseResult {
  const parsed = Papa.parse<CsvProduct>(csvText, {
    header: true,
    skipEmptyLines: true
  })
  const valid: CsvProduct[] = []
  const invalid: CsvInvalidRow[] = []

  parsed.data.forEach((row, i) => {
    if (!row.name || !row.price || isNaN(parseFloat(row.price))) {
      invalid.push({
        row: i + 1,
        data: row as unknown as Record<string, string>,
        error: !row.name ? 'Missing name' : 'Invalid price'
      })
    } else {
      valid.push(row)
    }
  })

  return { valid, invalid, total: parsed.data.length }
}
