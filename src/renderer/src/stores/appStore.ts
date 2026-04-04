import { create } from 'zustand'

interface AppState {
  currentPage: string
  isLive: boolean
  sidebarCollapsed: boolean
  setCurrentPage: (page: string) => void
  setIsLive: (isLive: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'dashboard',
  isLive: false,
  sidebarCollapsed: false,

  setCurrentPage: (page: string): void => {
    set({ currentPage: page })
  },

  setIsLive: (isLive: boolean): void => {
    set({ isLive })
  },

  setSidebarCollapsed: (collapsed: boolean): void => {
    set({ sidebarCollapsed: collapsed })
  }
}))
