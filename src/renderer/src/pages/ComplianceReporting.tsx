import { useState, useEffect, useMemo } from 'react'

interface AuditEntry {
  id: string
  timestamp: number
  userId: string
  action: string
  resource: string
  details: string
  metadata?: Record<string, unknown>
}

const ACTION_TYPES = [
  'product_created',
  'product_deleted',
  'product_updated',
  'stream_started',
  'stream_ended',
  'reply_sent',
  'settings_changed',
  'user_invited',
  'csv_imported',
  'store_created',
  'store_deleted',
  'branding_updated',
  'api_key_generated',
  'api_key_revoked',
  'audit_cleared'
]

export default function ComplianceReporting(): JSX.Element {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [actionFilter, setActionFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchEntries = async (): Promise<void> => {
    setLoading(true)
    const filter: { action?: string; from?: number; to?: number } = {}
    if (actionFilter) filter.action = actionFilter
    if (dateFrom) filter.from = new Date(dateFrom).getTime()
    if (dateTo) filter.to = new Date(dateTo + 'T23:59:59').getTime()
    const result = await window.streamSync.getAuditLog(filter)
    setEntries(result)
    setLoading(false)
  }

  useEffect(() => {
    fetchEntries()
  }, [actionFilter, dateFrom, dateTo])

  const stats = useMemo(() => {
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const thisWeek = entries.filter((e) => e.timestamp >= weekAgo)
    const userCounts: Record<string, number> = {}
    entries.forEach((e) => {
      userCounts[e.userId] = (userCounts[e.userId] || 0) + 1
    })
    const mostActive = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0]
    return {
      total: entries.length,
      thisWeek: thisWeek.length,
      mostActiveUser: mostActive ? mostActive[0] : '-'
    }
  }, [entries])

  const handleExport = (): void => {
    const header = 'Timestamp,User,Action,Resource,Details\n'
    const rows = entries
      .map((e) => {
        const ts = new Date(e.timestamp).toISOString()
        const details = e.details.replace(/"/g, '""')
        return `"${ts}","${e.userId}","${e.action}","${e.resource}","${details}"`
      })
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Compliance Reporting</h1>
          <p className="text-sm text-slate-400 mt-1">Audit log and compliance event viewer</p>
        </div>
        <button
          onClick={handleExport}
          disabled={entries.length === 0}
          className="px-4 py-2 bg-[#f97316] text-white rounded-lg text-sm font-medium hover:bg-[#ea580c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Audit Log
          </span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1a1f35] rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Total Events</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a1f35] rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider">This Week</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">
            {stats.thisWeek.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#1a1f35] rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Most Active User</p>
          <p className="text-2xl font-bold text-slate-100 mt-1 truncate">{stats.mostActiveUser}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Action Type</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#111827] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#f97316] min-w-[180px]"
          >
            <option value="">All Actions</option>
            {ACTION_TYPES.map((a) => (
              <option key={a} value={a}>
                {a.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-[#111827] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#f97316]"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-[#111827] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#f97316]"
          />
        </div>
        {(actionFilter || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setActionFilter('')
              setDateFrom('')
              setDateTo('')
            }}
            className="self-end px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#1a1f35] rounded-xl overflow-hidden border border-slate-800">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading audit log...</div>
        ) : entries.length === 0 ? (
          <div className="p-10 text-center">
            <svg
              className="w-10 h-10 mx-auto mb-3 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-slate-400 text-sm">No audit events recorded yet.</p>
            <p className="text-slate-500 text-xs mt-1">Events will appear here as actions occur.</p>
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#111827] sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Timestamp</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Action</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Resource</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={entry.id}
                    className={`border-t border-slate-800 ${
                      i % 2 === 0 ? 'bg-[#1a1f35]' : 'bg-[#161b2e]'
                    }`}
                  >
                    <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-slate-300">{entry.userId}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#f97316]/10 text-[#f97316]">
                        {entry.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-300">{entry.resource}</td>
                    <td className="px-4 py-2.5 text-slate-400 truncate max-w-[250px]">
                      {entry.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
