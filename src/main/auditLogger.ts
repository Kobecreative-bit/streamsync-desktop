import { store } from './store'

export interface AuditEntry {
  id: string
  timestamp: number
  userId: string
  action: string
  resource: string
  details: string
  metadata?: Record<string, unknown>
}

class AuditLogger {
  log(
    action: string,
    resource: string,
    details: string,
    metadata?: Record<string, unknown>
  ): void {
    const entries = store.get('auditLog', []) as AuditEntry[]
    entries.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      timestamp: Date.now(),
      userId: 'local-user',
      action,
      resource,
      details,
      metadata
    })
    // Keep last 10000 entries
    if (entries.length > 10000) entries.splice(0, entries.length - 10000)
    store.set('auditLog', entries)
  }

  getEntries(filter?: {
    action?: string
    from?: number
    to?: number
  }): AuditEntry[] {
    let entries = store.get('auditLog', []) as AuditEntry[]
    if (filter?.action) entries = entries.filter((e) => e.action === filter.action)
    if (filter?.from) entries = entries.filter((e) => e.timestamp >= filter.from!)
    if (filter?.to) entries = entries.filter((e) => e.timestamp <= filter.to!)
    return entries.sort((a, b) => b.timestamp - a.timestamp)
  }

  clear(): void {
    store.set('auditLog', [])
  }
}

export const auditLogger = new AuditLogger()
