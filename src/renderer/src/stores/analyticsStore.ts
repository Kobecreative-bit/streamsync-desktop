import { create } from 'zustand'

export interface StreamSession {
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

interface AnalyticsState {
  sessions: StreamSession[]
  currentSession: StreamSession | null
  revenue: { date: string; amount: number }[]
  loaded: boolean

  loadFromStore: () => Promise<void>
  startSession: (platforms: string[]) => void
  endSession: () => StreamSession | null
  recordComment: () => void
  recordBuyingSignal: () => void
  updateViewerCount: (count: number) => void
  addRevenue: (amount: number) => void
  getTotalViews: () => number
  getTotalRevenue: () => number
  getTotalComments: () => number
  getSessionCount: () => number
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  sessions: [],
  currentSession: null,
  revenue: [],
  loaded: false,

  loadFromStore: async () => {
    if (get().loaded) return
    try {
      const sessions = await window.streamSync.getSessions()
      const revenue = await window.streamSync.getRevenue()
      set({ sessions: sessions || [], revenue: revenue || [], loaded: true })
    } catch {
      set({ loaded: true })
    }
  },

  startSession: (platforms: string[]) => {
    const session: StreamSession = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      platforms,
      peakViewers: 0,
      totalComments: 0,
      buyingSignals: 0,
      revenue: 0
    }
    set({ currentSession: session })
  },

  endSession: () => {
    const { currentSession, sessions } = get()
    if (!currentSession) return null

    const ended: StreamSession = {
      ...currentSession,
      endTime: Date.now(),
      duration: Math.floor((Date.now() - currentSession.startTime) / 1000)
    }

    const updatedSessions = [...sessions, ended]
    set({ sessions: updatedSessions, currentSession: null })

    window.streamSync.saveSession(ended).catch(() => {})

    return ended
  },

  recordComment: () => {
    const { currentSession } = get()
    if (!currentSession) return
    set({
      currentSession: {
        ...currentSession,
        totalComments: currentSession.totalComments + 1
      }
    })
  },

  recordBuyingSignal: () => {
    const { currentSession } = get()
    if (!currentSession) return
    set({
      currentSession: {
        ...currentSession,
        buyingSignals: currentSession.buyingSignals + 1
      }
    })
  },

  updateViewerCount: (count: number) => {
    const { currentSession } = get()
    if (!currentSession) return
    set({
      currentSession: {
        ...currentSession,
        peakViewers: Math.max(currentSession.peakViewers, count)
      }
    })
  },

  addRevenue: (amount: number) => {
    const { currentSession, revenue } = get()
    const today = new Date().toISOString().split('T')[0]
    const entry = { date: today, amount }

    const updatedRevenue = [...revenue, entry]
    set({ revenue: updatedRevenue })

    if (currentSession) {
      set({
        currentSession: {
          ...currentSession,
          revenue: currentSession.revenue + amount
        }
      })
    }

    window.streamSync.saveRevenue(entry).catch(() => {})
  },

  getTotalViews: () => {
    return get().sessions.reduce((sum, s) => sum + s.peakViewers, 0)
  },

  getTotalRevenue: () => {
    return get().revenue.reduce((sum, r) => sum + r.amount, 0)
  },

  getTotalComments: () => {
    return get().sessions.reduce((sum, s) => sum + s.totalComments, 0)
  },

  getSessionCount: () => {
    return get().sessions.length
  }
}))
