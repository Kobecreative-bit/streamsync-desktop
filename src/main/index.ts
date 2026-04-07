import { app, BrowserWindow, dialog, ipcMain, Menu, session, shell } from 'electron'
import { join } from 'path'
import { readFileSync } from 'fs'
import { is } from '@electron-toolkit/utils'
import { store } from './store'
import type { Product } from './store'
import { createCheckoutSession, createBillingPortalSession } from './stripe'
import {
  exchangeCodeForToken,
  saveShopifyConnection,
  getShopifyConnection,
  disconnectShopify,
  openShopifyAuth,
  fetchShopifyProducts,
  fetchShopifyOrders
} from './shopify'
import {
  getStreamKeys,
  saveStreamKeys,
  startRTMPStream,
  stopRTMPStream,
  stopAllRTMPStreams,
  getRTMPStatuses,
  setStatusCallback,
  isFFmpegAvailable,
  type StreamKey
} from './rtmp'

let mainWindow: BrowserWindow | null = null

// Register custom protocol for Shopify OAuth callback
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('streamsync', process.execPath, [process.argv[1]])
  }
} else {
  app.setAsDefaultProtocolClient('streamsync')
}

// Handle custom protocol on macOS
app.on('open-url', async (_event, url) => {
  if (url.startsWith('streamsync://shopify/callback')) {
    const params = new URL(url)
    const code = params.searchParams.get('code')
    const shop = params.searchParams.get('shop')
    if (code && shop) {
      const token = await exchangeCodeForToken(shop, code)
      if (token) {
        saveShopifyConnection({
          shop,
          accessToken: token,
          shopName: shop.replace('.myshopify.com', ''),
          connectedAt: Date.now()
        })
        mainWindow?.webContents.send('shopify-connected', { shop, shopName: shop.replace('.myshopify.com', '') })
      }
    }
  }
  mainWindow?.focus()
})

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0a0e1a',
    titleBarStyle: 'hiddenInset',
    show: false,
    webPreferences: {
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: join(__dirname, '../preload/index.js')
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function setupCSP(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http:; img-src 'self' data: blob: https: http:; media-src 'self' blob: https: http:; connect-src 'self' ws: wss: https: http:; font-src 'self' data: https:; frame-src 'self' https: http:;"
        ]
      }
    })
  })
}

function setupMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'StreamSync',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Stream',
      submenu: [
        {
          label: 'Go Live',
          accelerator: 'CmdOrCtrl+Shift+L',
          click: (): void => {
            mainWindow?.webContents.send('navigate', 'golive')
          }
        },
        {
          label: 'Add Product',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: (): void => {
            mainWindow?.webContents.send('add-product')
          }
        },
        { type: 'separator' },
        {
          label: 'End Stream',
          click: (): void => {
            mainWindow?.webContents.send('end-stream')
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: (): void => {
            shell.openExternal('https://streamsync.dev')
          }
        }
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function setupIPC(): void {
  ipcMain.handle('get-app-version', () => app.getVersion())
  ipcMain.handle('get-platform', () => process.platform)

  ipcMain.handle('get-products', () => {
    return store.get('products', [])
  })

  ipcMain.handle('add-product', (_event, product: Omit<Product, 'id'>) => {
    const products = store.get('products', [])
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
    }
    products.push(newProduct)
    store.set('products', products)
    mainWindow?.webContents.send('products-updated')
    return newProduct
  })

  ipcMain.handle('remove-product', (_event, id: string) => {
    const products = store.get('products', [])
    store.set('products', products.filter((p: Product) => p.id !== id))
    mainWindow?.webContents.send('products-updated')
  })

  ipcMain.handle('update-product', (_event, id: string, data: Partial<Product>) => {
    const products = store.get('products', [])
    const index = products.findIndex((p: Product) => p.id === id)
    if (index !== -1) {
      products[index] = { ...products[index], ...data }
      store.set('products', products)
      mainWindow?.webContents.send('products-updated')
      return products[index]
    }
    return null
  })

  ipcMain.handle('get-stream-state', () => {
    return store.get('streamState')
  })

  ipcMain.handle('update-stream-state', (_event, state) => {
    const current = store.get('streamState')
    const updated = { ...current, ...state }
    store.set('streamState', updated)
    return updated
  })

  ipcMain.handle('get-settings', () => {
    return store.get('settings')
  })

  ipcMain.handle('update-settings', (_event, settings) => {
    const current = store.get('settings')
    const updated = { ...current, ...settings }
    store.set('settings', updated)
    return updated
  })

  ipcMain.handle('create-checkout-session', async (_event, params: { priceId: string; customerId?: string; email: string; successUrl?: string; cancelUrl?: string }) => {
    const url = await createCheckoutSession(params)
    if (url) shell.openExternal(url)
    return url
  })

  ipcMain.handle('create-billing-portal', async (_event, customerId: string) => {
    const url = await createBillingPortalSession(customerId)
    if (url) shell.openExternal(url)
    return url
  })

  ipcMain.handle('get-selected-platforms', () => {
    return store.get('selectedPlatforms', ['tiktok', 'youtube', 'instagram', 'facebook'])
  })

  ipcMain.handle('set-selected-platforms', (_event, platforms: string[]) => {
    store.set('selectedPlatforms', platforms)
    return platforms
  })

  // --- Shopify ---
  ipcMain.handle('shopify-connect', (_event, domain: string) => {
    openShopifyAuth(domain)
  })

  ipcMain.handle('shopify-disconnect', () => {
    disconnectShopify()
  })

  ipcMain.handle('shopify-get-connection', () => {
    return getShopifyConnection()
  })

  ipcMain.handle('shopify-save-connection', (_event, conn) => {
    saveShopifyConnection(conn)
  })

  ipcMain.handle('shopify-fetch-products', async () => {
    const conn = getShopifyConnection()
    if (!conn) return []
    return fetchShopifyProducts(conn)
  })

  ipcMain.handle('shopify-fetch-orders', async (_event, since?: string) => {
    const conn = getShopifyConnection()
    if (!conn) return []
    return fetchShopifyOrders(conn, since)
  })

  // --- Audit Log ---
  ipcMain.handle('get-audit-log', (_event, filter?: { action?: string; from?: number; to?: number }) => {
    const entries: Array<{
      id: string
      timestamp: number
      userId: string
      action: string
      resource: string
      details: string
      metadata?: Record<string, unknown>
    }> = store.get('auditLog' as never) || []
    let filtered = entries
    if (filter?.action) {
      filtered = filtered.filter((e) => e.action === filter.action)
    }
    if (filter?.from) {
      const from = filter.from
      filtered = filtered.filter((e) => e.timestamp >= from)
    }
    if (filter?.to) {
      const to = filter.to
      filtered = filtered.filter((e) => e.timestamp <= to)
    }
    return filtered
  })

  // --- Branding ---
  ipcMain.handle('get-branding', () => {
    return store.get('branding' as never) || {
      appName: 'StreamSync',
      accentColor: '#f97316',
      logoPath: ''
    }
  })

  ipcMain.handle('update-branding', (_event, branding) => {
    store.set('branding' as never, branding)
    return branding
  })

  // --- SSO Config ---
  ipcMain.handle('get-sso-config', () => {
    return store.get('ssoConfig' as never) || {
      provider: 'okta',
      entityId: '',
      ssoUrl: '',
      certificate: '',
      status: 'not_configured'
    }
  })

  ipcMain.handle('update-sso-config', (_event, config) => {
    store.set('ssoConfig' as never, config)
    return config
  })

  // --- Sessions (Analytics) ---
  ipcMain.handle('get-sessions', () => {
    return store.get('sessions' as never) || []
  })

  ipcMain.handle('save-session', (_event, sessionData) => {
    const sessions: unknown[] = (store.get('sessions' as never) as unknown[]) || []
    sessions.push(sessionData)
    store.set('sessions' as never, sessions)
    return sessionData
  })

  // --- Revenue ---
  ipcMain.handle('get-revenue', () => {
    return store.get('revenue' as never) || []
  })

  ipcMain.handle('save-revenue', (_event, entry) => {
    const revenue: unknown[] = (store.get('revenue' as never) as unknown[]) || []
    revenue.push(entry)
    store.set('revenue' as never, revenue)
    return entry
  })

  // --- CSV Dialog ---
  ipcMain.handle('open-csv-dialog', async () => {
    if (!mainWindow) return null
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select CSV File',
      filters: [
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    try {
      return readFileSync(result.filePaths[0], 'utf-8')
    } catch {
      return null
    }
  })

  // --- Replay Frame ---
  ipcMain.handle('replay-get-frame-base64', (_event, framePath: string) => {
    try {
      const buffer = readFileSync(framePath)
      return buffer.toString('base64')
    } catch {
      return ''
    }
  })

  // --- RTMP Streaming ---
  ipcMain.handle('rtmp-get-stream-keys', () => {
    return getStreamKeys()
  })

  ipcMain.handle('rtmp-save-stream-keys', (_event, keys: StreamKey[]) => {
    saveStreamKeys(keys)
    return keys
  })

  ipcMain.handle('rtmp-start-stream', (_event, platform: string, serverUrl: string, streamKey: string) => {
    return startRTMPStream(platform, serverUrl, streamKey)
  })

  ipcMain.handle('rtmp-stop-stream', (_event, platform: string) => {
    stopRTMPStream(platform)
  })

  ipcMain.handle('rtmp-stop-all', () => {
    stopAllRTMPStreams()
  })

  ipcMain.handle('rtmp-get-statuses', () => {
    return getRTMPStatuses()
  })

  ipcMain.handle('rtmp-check-ffmpeg', async () => {
    return isFFmpegAvailable()
  })

  // Forward RTMP status updates to renderer
  setStatusCallback((statuses) => {
    mainWindow?.webContents.send('rtmp-status-update', statuses)
  })
}

app.whenReady().then(() => {
  setupCSP()
  setupMenu()
  setupIPC()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  stopAllRTMPStreams()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  stopAllRTMPStreams()
})
