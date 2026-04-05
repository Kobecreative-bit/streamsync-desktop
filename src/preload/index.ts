import { contextBridge, ipcRenderer } from 'electron'

const api = {
  getVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),
  getPlatform: (): Promise<string> => ipcRenderer.invoke('get-platform'),
  getProducts: (): Promise<Product[]> => ipcRenderer.invoke('get-products'),
  addProduct: (product: Omit<Product, 'id'>): Promise<Product> =>
    ipcRenderer.invoke('add-product', product),
  removeProduct: (id: string): Promise<void> => ipcRenderer.invoke('remove-product', id),
  updateProduct: (id: string, data: Partial<Product>): Promise<Product> =>
    ipcRenderer.invoke('update-product', id, data),
  getStreamState: (): Promise<StreamState> => ipcRenderer.invoke('get-stream-state'),
  updateStreamState: (state: Partial<StreamState>): Promise<StreamState> =>
    ipcRenderer.invoke('update-stream-state', state),
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('update-settings', settings),
  onNavigate: (callback: (page: string) => void): void => {
    ipcRenderer.on('navigate', (_event, page) => callback(page))
  },
  onEndStream: (callback: () => void): void => {
    ipcRenderer.on('end-stream', () => callback())
  },
  onAddProduct: (callback: () => void): void => {
    ipcRenderer.on('add-product', () => callback())
  },
  onProductsUpdated: (callback: () => void): void => {
    ipcRenderer.on('products-updated', () => callback())
  },
  createCheckoutSession: (params: { priceId: string; email: string; customerId?: string }): Promise<void> =>
    ipcRenderer.invoke('create-checkout-session', params),
  createBillingPortal: (customerId: string): Promise<void> =>
    ipcRenderer.invoke('create-billing-portal', customerId),
  getSelectedPlatforms: (): Promise<string[]> =>
    ipcRenderer.invoke('get-selected-platforms'),
  setSelectedPlatforms: (platforms: string[]): Promise<void> =>
    ipcRenderer.invoke('set-selected-platforms', platforms)
}

interface Product {
  id: string
  name: string
  price: number
  description: string
  buyLink: string
  emoji: string
  pinned: boolean
}

interface StreamState {
  isLive: boolean
  startTime: number | null
  viewerCount: number
  platforms: {
    tiktok: boolean
    youtube: boolean
    instagram: boolean
    facebook: boolean
  }
}

interface AppSettings {
  autoStartAllPlatforms: boolean
  hdQuality: boolean
  showProductOverlay: boolean
  enableAI: boolean
  buyingSignalAlerts: boolean
  autoReplyFAQs: boolean
  desktopNotifications: boolean
  soundAlerts: boolean
}

contextBridge.exposeInMainWorld('streamSync', api)
