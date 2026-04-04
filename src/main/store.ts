import Store from 'electron-store'

interface StoreSchema {
  products: Product[]
  streamState: StreamState
  settings: AppSettings
  selectedPlatforms: string[]
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

const store = new Store<StoreSchema>({
  defaults: {
    products: [],
    streamState: {
      isLive: false,
      startTime: null,
      viewerCount: 0,
      platforms: {
        tiktok: false,
        youtube: false,
        instagram: false,
        facebook: false
      }
    },
    settings: {
      autoStartAllPlatforms: true,
      hdQuality: true,
      showProductOverlay: true,
      enableAI: true,
      buyingSignalAlerts: true,
      autoReplyFAQs: false,
      desktopNotifications: true,
      soundAlerts: true
    }
  }
})

export { store }
export type { Product, StreamState, AppSettings }
