import { app, BrowserWindow, ipcMain, Menu, session, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { store } from './store'
import type { Product } from './store'
import { createCheckoutSession, createBillingPortalSession } from './stripe'
import { exchangeCodeForToken, saveShopifyConnection } from './shopify'

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
            shell.openExternal('https://streamsync.live')
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
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
