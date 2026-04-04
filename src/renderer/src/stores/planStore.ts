import { create } from 'zustand'
import { canAccess, getRequiredPlan, PLAN_FEATURES } from '../lib/planConfig'
import type { PlanTier } from '../lib/planConfig'
import { useAuthStore } from './authStore'

interface PlanState {
  plan: PlanTier
  canAccess: (feature: string) => boolean
  setPlan: (plan: PlanTier) => void
  getPlanLabel: () => string
  getRequiredPlanForFeature: (feature: string) => PlanTier | null
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plan: 'starter',

  canAccess: (feature: string): boolean => {
    return canAccess(get().plan, feature)
  },

  setPlan: (plan: PlanTier): void => {
    set({ plan })
  },

  getPlanLabel: (): string => {
    return PLAN_FEATURES[get().plan].label
  },

  getRequiredPlanForFeature: (feature: string): PlanTier | null => {
    return getRequiredPlan(feature)
  }
}))

// Subscribe to auth store changes to auto-update plan from profile
useAuthStore.subscribe((state) => {
  if (state.profile?.plan) {
    usePlanStore.getState().setPlan(state.profile.plan)
  }
})
