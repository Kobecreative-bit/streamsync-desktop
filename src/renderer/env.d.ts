/// <reference types="vite/client" />

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
