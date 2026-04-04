export type PlanTier = 'starter' | 'pro' | 'enterprise'

export type PlanFeature =
  | 'max_platforms'
  | 'max_products'
  | 'basic_analytics'
  | 'advanced_analytics'
  | 'ai_copilot'
  | 'custom_overlays'
  | 'max_seats'
  | 'export_reports'
  | 'revenue_tracking'
  | 'white_label'
  | 'api_access'
  | 'bulk_import'
  | 'multi_store'
  | 'compliance'
  | 'sso'

interface PlanConfig {
  label: string
  price: number
  features: Record<string, boolean | number>
}

export const PLAN_FEATURES: Record<PlanTier, PlanConfig> = {
  starter: {
    label: 'Starter',
    price: 0,
    features: {
      max_platforms: 2,
      max_products: 10,
      basic_analytics: true,
      advanced_analytics: false,
      ai_copilot: false,
      custom_overlays: false,
      max_seats: 1,
      export_reports: false,
      revenue_tracking: false,
      white_label: false,
      api_access: false,
      bulk_import: false,
      multi_store: false,
      compliance: false,
      sso: false
    }
  },
  pro: {
    label: 'Pro',
    price: 49,
    features: {
      max_platforms: 4,
      max_products: Infinity,
      basic_analytics: true,
      advanced_analytics: true,
      ai_copilot: true,
      custom_overlays: true,
      max_seats: 2,
      export_reports: true,
      revenue_tracking: true,
      white_label: false,
      api_access: false,
      bulk_import: false,
      multi_store: false,
      compliance: false,
      sso: false
    }
  },
  enterprise: {
    label: 'Enterprise',
    price: 199,
    features: {
      max_platforms: 4,
      max_products: Infinity,
      basic_analytics: true,
      advanced_analytics: true,
      ai_copilot: true,
      custom_overlays: true,
      max_seats: Infinity,
      export_reports: true,
      revenue_tracking: true,
      white_label: true,
      api_access: true,
      bulk_import: true,
      multi_store: true,
      compliance: true,
      sso: true
    }
  }
}

export function canAccess(plan: PlanTier, feature: string): boolean {
  const config = PLAN_FEATURES[plan]
  if (!config) return false
  const value = config.features[feature]
  if (value === undefined) return false
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  return false
}

export function getFeatureLimit(plan: PlanTier, feature: string): number {
  const config = PLAN_FEATURES[plan]
  if (!config) return 0
  const value = config.features[feature]
  if (typeof value === 'number') return value
  return value ? 1 : 0
}

export function getRequiredPlan(feature: string): PlanTier | null {
  const tiers: PlanTier[] = ['starter', 'pro', 'enterprise']
  for (const tier of tiers) {
    if (canAccess(tier, feature)) return tier
  }
  return null
}
