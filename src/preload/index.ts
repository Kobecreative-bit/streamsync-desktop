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
    ipcRenderer.invoke('set-selected-platforms', platforms),

  // Shopify
  shopifyConnect: (domain: string): Promise<void> =>
    ipcRenderer.invoke('shopify-connect', domain),
  shopifyDisconnect: (): Promise<void> =>
    ipcRenderer.invoke('shopify-disconnect'),
  shopifyGetConnection: (): Promise<ShopifyConnection | null> =>
    ipcRenderer.invoke('shopify-get-connection'),
  shopifySaveConnection: (conn: ShopifyConnection): Promise<void> =>
    ipcRenderer.invoke('shopify-save-connection', conn),
  shopifyFetchProducts: (): Promise<ShopifyProduct[]> =>
    ipcRenderer.invoke('shopify-fetch-products'),
  shopifyFetchOrders: (since?: string): Promise<ShopifyOrder[]> =>
    ipcRenderer.invoke('shopify-fetch-orders', since),
  onShopifyCallback: (callback: (event: unknown, url: string) => void): void => {
    ipcRenderer.on('shopify-connected', (event, data) => callback(event, data))
  },

  // Audit User
  setAuditUser: (userId: string): Promise<void> =>
    ipcRenderer.invoke('set-audit-user', userId),

  // Audit Log
  getAuditLog: (filter?: { action?: string; from?: number; to?: number }): Promise<AuditEntry[]> =>
    ipcRenderer.invoke('get-audit-log', filter),

  // Branding
  getBranding: (): Promise<BrandingConfig> =>
    ipcRenderer.invoke('get-branding'),
  updateBranding: (branding: BrandingConfig): Promise<BrandingConfig> =>
    ipcRenderer.invoke('update-branding', branding),

  // SSO
  getSSOConfig: (): Promise<SSOConfigData> =>
    ipcRenderer.invoke('get-sso-config'),
  updateSSOConfig: (config: SSOConfigData): Promise<SSOConfigData> =>
    ipcRenderer.invoke('update-sso-config', config),

  // Sessions & Revenue (Analytics)
  getSessions: (): Promise<StreamSession[]> =>
    ipcRenderer.invoke('get-sessions'),
  saveSession: (session: StreamSession): Promise<StreamSession> =>
    ipcRenderer.invoke('save-session', session),
  getRevenue: (): Promise<RevenueEntry[]> =>
    ipcRenderer.invoke('get-revenue'),
  saveRevenue: (entry: RevenueEntry): Promise<RevenueEntry> =>
    ipcRenderer.invoke('save-revenue', entry),

  // File Dialog
  openCsvDialog: (): Promise<string | null> =>
    ipcRenderer.invoke('open-csv-dialog'),

  // Image File Dialog
  openImageDialog: (): Promise<string | null> =>
    ipcRenderer.invoke('open-image-dialog'),

  // Replay
  replayGetFrameBase64: (framePath: string): Promise<string> =>
    ipcRenderer.invoke('replay-get-frame-base64', framePath),

  // RTMP Streaming
  rtmpGetStreamKeys: (): Promise<RTMPStreamKey[]> =>
    ipcRenderer.invoke('rtmp-get-stream-keys'),
  rtmpSaveStreamKeys: (keys: RTMPStreamKey[]): Promise<RTMPStreamKey[]> =>
    ipcRenderer.invoke('rtmp-save-stream-keys', keys),
  rtmpGetConfig: (): Promise<RTMPConfig> =>
    ipcRenderer.invoke('rtmp-get-config'),
  rtmpSaveConfig: (config: RTMPConfig): Promise<RTMPConfig> =>
    ipcRenderer.invoke('rtmp-save-config', config),
  rtmpListDevices: (): Promise<MediaDeviceInfo[]> =>
    ipcRenderer.invoke('rtmp-list-devices'),
  rtmpStartMultiStream: (keys: RTMPStreamKey[]): Promise<boolean> =>
    ipcRenderer.invoke('rtmp-start-multistream', keys),
  rtmpStopStream: (platform: string): Promise<void> =>
    ipcRenderer.invoke('rtmp-stop-stream', platform),
  rtmpStopAll: (): Promise<void> =>
    ipcRenderer.invoke('rtmp-stop-all'),
  rtmpGetStatuses: (): Promise<RTMPStatus[]> =>
    ipcRenderer.invoke('rtmp-get-statuses'),
  rtmpCheckFFmpeg: (): Promise<boolean> =>
    ipcRenderer.invoke('rtmp-check-ffmpeg'),
  rtmpIsStreaming: (): Promise<boolean> =>
    ipcRenderer.invoke('rtmp-is-streaming'),
  onRTMPStatusUpdate: (callback: (statuses: RTMPStatus[]) => void): void => {
    ipcRenderer.on('rtmp-status-update', (_event, statuses) => callback(statuses))
  }
}

interface ShopifyConnection {
  shop: string
  accessToken: string
  shopName: string
  connectedAt: number
}

interface ShopifyProduct {
  id: string
  title: string
  price: number
  description: string
  image: string
  handle: string
  url: string
  variants: { id: string; title: string; price: number; sku: string }[]
}

interface ShopifyOrder {
  id: string
  orderNumber: number
  totalPrice: number
  currency: string
  createdAt: string
  lineItems: { title: string; quantity: number; price: number }[]
}

interface AuditEntry {
  id: string
  timestamp: number
  userId: string
  action: string
  resource: string
  details: string
  metadata?: Record<string, unknown>
}

interface BrandingConfig {
  appName: string
  accentColor: string
  logoPath: string
}

interface SSOConfigData {
  provider: 'okta' | 'azure_ad' | 'google_workspace' | 'custom_saml'
  entityId: string
  ssoUrl: string
  certificate: string
  status: 'not_configured' | 'configured' | 'active'
}

interface StreamSession {
  id: string
  startTime: number
  endTime: number | null
  duration: number
  platforms: string[]
  peakViewers: number
  totalComments: number
  buyingSignals: number
  revenue: number
}

interface RevenueEntry {
  date: string
  amount: number
}

interface RTMPStreamKey {
  platform: 'tiktok' | 'youtube' | 'instagram' | 'facebook'
  serverUrl: string
  streamKey: string
  enabled: boolean
}

interface RTMPStatus {
  platform: string
  status: 'idle' | 'connecting' | 'live' | 'error'
  error?: string
  bitrate?: string
  fps?: string
  droppedFrames?: number
}

interface RTMPConfig {
  videoDevice: string
  audioDevice: string
  resolution: '1920x1080' | '1280x720' | '854x480'
  framerate: number
  videoBitrate: number
  audioBitrate: number
}

interface MediaDeviceInfo {
  id: string
  name: string
  type: 'video' | 'audio'
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
