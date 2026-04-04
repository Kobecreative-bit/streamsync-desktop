import { createServer, IncomingMessage, ServerResponse } from 'http'
import { store } from './store'
import { v4 as uuidv4 } from 'uuid'

const API_PORT = 9321

let server: ReturnType<typeof createServer> | null = null
let apiKeys: string[] = []

function jsonResponse(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
  res.end(JSON.stringify(data))
}

function authenticate(req: IncomingMessage): boolean {
  const key =
    req.headers['x-api-key'] || req.headers.authorization?.replace('Bearer ', '')
  return apiKeys.includes(key as string)
}

function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type,X-API-Key,Authorization'
    })
    res.end()
    return
  }

  if (!authenticate(req)) {
    jsonResponse(res, 401, { error: 'Invalid API key' })
    return
  }

  const url = new URL(req.url || '/', `http://localhost:${API_PORT}`)
  const path = url.pathname

  // GET /api/products
  if (req.method === 'GET' && path === '/api/products') {
    jsonResponse(res, 200, { products: store.get('products', []) })
    return
  }

  // GET /api/sessions
  if (req.method === 'GET' && path === '/api/sessions') {
    jsonResponse(res, 200, { sessions: store.get('streamSessions', []) })
    return
  }

  // GET /api/analytics
  if (req.method === 'GET' && path === '/api/analytics') {
    const sessions = store.get('streamSessions', []) as Record<string, unknown>[]
    const revenueData = store.get('revenueData', []) as Array<{ amount: number }>
    jsonResponse(res, 200, {
      totalSessions: sessions.length,
      totalRevenue: revenueData.reduce((s: number, r) => s + r.amount, 0),
      products: (store.get('products', []) as unknown[]).length
    })
    return
  }

  // GET /api/audit
  if (req.method === 'GET' && path === '/api/audit') {
    jsonResponse(res, 200, { entries: store.get('auditLog', []) })
    return
  }

  jsonResponse(res, 404, { error: 'Not found' })
}

export function startApiServer(): void {
  if (server) return
  apiKeys = store.get('apiKeys', []) as string[]
  server = createServer(handleRequest)
  server.listen(API_PORT, '127.0.0.1')
}

export function stopApiServer(): void {
  server?.close()
  server = null
}

export function generateApiKey(): string {
  const key = `sk_${uuidv4().replace(/-/g, '')}`
  apiKeys.push(key)
  store.set('apiKeys', apiKeys)
  return key
}

export function revokeApiKey(key: string): void {
  apiKeys = apiKeys.filter((k) => k !== key)
  store.set('apiKeys', apiKeys)
}

export function getApiKeys(): string[] {
  return store.get('apiKeys', []) as string[]
}
