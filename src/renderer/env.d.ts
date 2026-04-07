/// <reference types="vite/client" />

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

interface StreamSyncAPI {
  getVersion: () => Promise<string>
  getPlatform: () => Promise<string>
  getProducts: () => Promise<Product[]>
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>
  removeProduct: (id: string) => Promise<void>
  updateProduct: (id: string, data: Partial<Product>) => Promise<Product>
  getStreamState: () => Promise<StreamState>
  updateStreamState: (state: Partial<StreamState>) => Promise<StreamState>
  getSettings: () => Promise<AppSettings>
  updateSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>
  onNavigate: (callback: (page: string) => void) => void
  onEndStream: (callback: () => void) => void
  onAddProduct: (callback: () => void) => void
  onProductsUpdated: (callback: () => void) => void

  // Billing
  createCheckoutSession: (params: { priceId: string; email: string; customerId?: string }) => Promise<void>
  createBillingPortal: (customerId: string) => Promise<void>

  // Platform selection
  getSelectedPlatforms: () => Promise<string[]>
  setSelectedPlatforms: (platforms: string[]) => Promise<void>

  // Shopify
  shopifyConnect: (domain: string) => Promise<void>
  shopifyDisconnect: () => Promise<void>
  shopifyGetConnection: () => Promise<ShopifyConnection | null>
  shopifySaveConnection: (conn: ShopifyConnection) => Promise<void>
  shopifyFetchProducts: () => Promise<ShopifyProduct[]>
  shopifyFetchOrders: (since?: string) => Promise<ShopifyOrder[]>
  onShopifyCallback?: (callback: (event: unknown, url: string) => void) => void

  // Audit Log
  getAuditLog: (filter?: { action?: string; from?: number; to?: number }) => Promise<AuditEntry[]>

  // Branding
  getBranding: () => Promise<BrandingConfig>
  updateBranding: (branding: BrandingConfig) => Promise<BrandingConfig>

  // SSO
  getSSOConfig: () => Promise<SSOConfigData>
  updateSSOConfig: (config: SSOConfigData) => Promise<SSOConfigData>

  // Sessions & Revenue (Analytics)
  getSessions: () => Promise<StreamSession[]>
  saveSession: (session: StreamSession) => Promise<StreamSession>
  getRevenue: () => Promise<RevenueEntry[]>
  saveRevenue: (entry: RevenueEntry) => Promise<RevenueEntry>

  // File Dialog
  openCsvDialog: () => Promise<string | null>

  // Replay
  replayGetFrameBase64: (framePath: string) => Promise<string>

  // RTMP Streaming
  rtmpGetStreamKeys: () => Promise<RTMPStreamKey[]>
  rtmpSaveStreamKeys: (keys: RTMPStreamKey[]) => Promise<RTMPStreamKey[]>
  rtmpStartStream: (platform: string, serverUrl: string, streamKey: string) => Promise<boolean>
  rtmpStopStream: (platform: string) => Promise<void>
  rtmpStopAll: () => Promise<void>
  rtmpGetStatuses: () => Promise<RTMPStatus[]>
  rtmpCheckFFmpeg: () => Promise<boolean>
  onRTMPStatusUpdate: (callback: (statuses: RTMPStatus[]) => void) => void
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

interface Comment {
  id: string
  user: string
  text: string
  platform: 'tiktok' | 'youtube' | 'instagram' | 'facebook'
  timestamp: number
  isBuyingSignal: boolean
}

interface BuyingSignalAlert {
  id: string
  comment: Comment
  suggestedReply: string
  confidence: number
  matchedPatterns: string[]
  sent: boolean
  sendStatus?: 'idle' | 'sending' | 'success' | 'failed'
}

// Auth and plan types
type PlanTier = 'starter' | 'pro' | 'enterprise'

interface UserProfile {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  bio?: string
  plan: PlanTier
  team_id: string | null
}

interface UpgradeModalState {
  isOpen: boolean
  feature: string
  currentPlan: PlanTier
  requiredPlan: PlanTier
}

// Vite env vars
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    streamSync: StreamSyncAPI
  }
}
