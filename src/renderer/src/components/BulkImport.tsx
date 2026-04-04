import { useState } from 'react'
import { parseCsvProducts, type CsvProduct, type CsvInvalidRow } from '../lib/csvImporter'

interface BulkImportProps {
  onImport: (products: CsvProduct[]) => void
  requireEnterprise?: boolean
}

export default function BulkImport({ onImport, requireEnterprise }: BulkImportProps): JSX.Element {
  const [csvText, setCsvText] = useState<string | null>(null)
  const [validRows, setValidRows] = useState<CsvProduct[]>([])
  const [invalidRows, setInvalidRows] = useState<CsvInvalidRow[]>([])
  const [total, setTotal] = useState(0)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [summary, setSummary] = useState<string | null>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')

  if (requireEnterprise) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-slate-400 text-sm">Bulk CSV Import requires an Enterprise plan.</p>
        </div>
      </div>
    )
  }

  const handleUpload = async (): Promise<void> => {
    const content = await window.streamSync.openCsvDialog()
    if (!content) return
    setCsvText(content)
    const result = parseCsvProducts(content)
    setValidRows(result.valid)
    setInvalidRows(result.invalid)
    setTotal(result.total)
    setStep('preview')
    setSummary(null)
  }

  const doImport = async (products: CsvProduct[]): Promise<void> => {
    setImporting(true)
    setProgress(0)
    const count = products.length
    for (let i = 0; i < count; i++) {
      onImport([products[i]])
      setProgress(Math.round(((i + 1) / count) * 100))
      // Small delay so progress bar is visible
      await new Promise((r) => setTimeout(r, 15))
    }
    setImporting(false)
    setSummary(
      `Imported ${count} of ${total} products. ${total - count} skipped due to errors.`
    )
    setStep('done')
  }

  const handleImportAll = (): void => {
    doImport([...validRows, ...invalidRows.map((r) => r.data as unknown as CsvProduct)])
  }

  const handleImportValid = (): void => {
    doImport(validRows)
  }

  const handleReset = (): void => {
    setCsvText(null)
    setValidRows([])
    setInvalidRows([])
    setTotal(0)
    setSummary(null)
    setStep('upload')
    setProgress(0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Bulk CSV Import</h2>
          <p className="text-sm text-slate-400 mt-1">
            Import products from a CSV file. Required columns: name, price. Optional: description,
            buyLink, category.
          </p>
        </div>
        {step !== 'upload' && (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm rounded-lg bg-[#1a1f35] text-slate-300 hover:bg-[#252b45] transition-colors"
          >
            Start Over
          </button>
        )}
      </div>

      {/* Upload step */}
      {step === 'upload' && (
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-slate-300 mb-4">Select a CSV file to import products</p>
          <button
            onClick={handleUpload}
            className="px-6 py-2.5 bg-[#f97316] text-white rounded-lg font-medium hover:bg-[#ea580c] transition-colors"
          >
            Upload CSV
          </button>
        </div>
      )}

      {/* Preview step */}
      {step === 'preview' && !importing && (
        <>
          {/* Stats */}
          <div className="flex gap-4">
            <div className="bg-[#1a1f35] rounded-lg px-4 py-3 flex-1">
              <p className="text-xs text-slate-400">Total Rows</p>
              <p className="text-lg font-semibold text-slate-100">{total}</p>
            </div>
            <div className="bg-[#1a1f35] rounded-lg px-4 py-3 flex-1">
              <p className="text-xs text-[#22c55e]">Valid</p>
              <p className="text-lg font-semibold text-[#22c55e]">{validRows.length}</p>
            </div>
            <div className="bg-[#1a1f35] rounded-lg px-4 py-3 flex-1">
              <p className="text-xs text-[#ef4444]">Errors</p>
              <p className="text-lg font-semibold text-[#ef4444]">{invalidRows.length}</p>
            </div>
          </div>

          {/* Preview table */}
          <div className="bg-[#1a1f35] rounded-xl overflow-hidden">
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#111827] sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Row</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Price</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Description</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Buy Link</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {validRows.map((row, i) => (
                    <tr
                      key={`v-${i}`}
                      className={i % 2 === 0 ? 'bg-[#1a1f35]' : 'bg-[#161b2e]'}
                    >
                      <td className="px-4 py-2.5 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-2.5 text-slate-200">{row.name}</td>
                      <td className="px-4 py-2.5 text-slate-200">${row.price}</td>
                      <td className="px-4 py-2.5 text-slate-400 truncate max-w-[200px]">
                        {row.description || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 truncate max-w-[150px]">
                        {row.buyLink || '-'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e]">
                          Valid
                        </span>
                      </td>
                    </tr>
                  ))}
                  {invalidRows.map((row, i) => (
                    <tr key={`i-${i}`} className="bg-[#ef4444]/5">
                      <td className="px-4 py-2.5 text-slate-400">{row.row}</td>
                      <td className="px-4 py-2.5 text-slate-200">
                        {row.data.name || <span className="text-[#ef4444] italic">missing</span>}
                      </td>
                      <td className="px-4 py-2.5 text-slate-200">
                        {row.data.price || <span className="text-[#ef4444] italic">invalid</span>}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 truncate max-w-[200px]">
                        {row.data.description || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 truncate max-w-[150px]">
                        {row.data.buyLink || '-'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#ef4444]/10 text-[#ef4444]">
                          {row.error}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleImportValid}
              disabled={validRows.length === 0}
              className="px-5 py-2.5 bg-[#f97316] text-white rounded-lg font-medium hover:bg-[#ea580c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Import Valid Only ({validRows.length})
            </button>
            <button
              onClick={handleImportAll}
              disabled={total === 0}
              className="px-5 py-2.5 bg-[#1a1f35] text-slate-200 rounded-lg font-medium hover:bg-[#252b45] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Import All ({total})
            </button>
          </div>
        </>
      )}

      {/* Progress bar */}
      {importing && (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">Importing products...</p>
          <div className="h-3 bg-[#111827] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#f97316] rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 text-right">{progress}%</p>
        </div>
      )}

      {/* Summary */}
      {step === 'done' && summary && (
        <div className="bg-[#1a1f35] border border-[#22c55e]/20 rounded-xl p-6 text-center">
          <svg
            className="w-10 h-10 mx-auto mb-3 text-[#22c55e]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p className="text-slate-200 font-medium">{summary}</p>
          <button
            onClick={handleReset}
            className="mt-4 px-5 py-2 text-sm rounded-lg bg-[#f97316] text-white hover:bg-[#ea580c] transition-colors"
          >
            Import More
          </button>
        </div>
      )}
    </div>
  )
}
