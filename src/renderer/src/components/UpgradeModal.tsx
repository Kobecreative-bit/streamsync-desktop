import { PLAN_FEATURES } from '../lib/planConfig'
import type { PlanTier } from '../lib/planConfig'

interface UpgradeModalProps {
  feature: string
  currentPlan: PlanTier
  requiredPlan: PlanTier
  onClose: () => void
}

const featureLabels: Record<string, string> = {
  max_platforms: 'More streaming platforms',
  max_products: 'Unlimited products',
  basic_analytics: 'Basic analytics',
  advanced_analytics: 'Advanced analytics',
  ai_copilot: 'AI Copilot',
  custom_overlays: 'Custom overlays',
  max_seats: 'Additional team seats',
  export_reports: 'Export reports',
  revenue_tracking: 'Revenue tracking',
  white_label: 'White-label branding',
  api_access: 'API access',
  bulk_import: 'Bulk import',
  multi_store: 'Multi-store support',
  compliance: 'Compliance tools',
  sso: 'Single sign-on (SSO)'
}

function UpgradeModal({ feature, currentPlan, requiredPlan, onClose }: UpgradeModalProps): JSX.Element {
  const requiredConfig = PLAN_FEATURES[requiredPlan]
  const featureLabel = featureLabels[feature] || feature

  const handleUpgrade = (): void => {
    // Will integrate with Stripe billing in a future phase
    window.open('https://streamsync.dev/pricing', '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-bg-card rounded-2xl border border-white/10 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <svg
            className="w-4 h-4 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Lock icon */}
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-7 h-7 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-text-primary text-center mb-2">
            Upgrade to {requiredConfig.label}
          </h3>

          <p className="text-sm text-text-secondary text-center mb-6">
            <span className="text-text-primary font-medium">{featureLabel}</span> requires the{' '}
            {requiredConfig.label} plan. You are currently on the{' '}
            {PLAN_FEATURES[currentPlan].label} plan.
          </p>

          {/* Plan comparison mini */}
          <div className="bg-bg-primary rounded-xl border border-white/5 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-primary">{requiredConfig.label}</span>
              <span className="text-sm font-bold text-accent">
                ${requiredConfig.price}/mo
              </span>
            </div>
            <ul className="space-y-2">
              {requiredPlan === 'pro' && (
                <>
                  <PlanFeatureItem text="4 streaming platforms" />
                  <PlanFeatureItem text="Unlimited products" />
                  <PlanFeatureItem text="AI Copilot" />
                  <PlanFeatureItem text="Advanced analytics" />
                  <PlanFeatureItem text="Custom overlays" />
                </>
              )}
              {requiredPlan === 'enterprise' && (
                <>
                  <PlanFeatureItem text="Everything in Pro" />
                  <PlanFeatureItem text="White-label branding" />
                  <PlanFeatureItem text="API access" />
                  <PlanFeatureItem text="Unlimited seats" />
                  <PlanFeatureItem text="SSO and compliance" />
                </>
              )}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-text-primary font-medium text-sm rounded-lg transition-colors"
            >
              Not now
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-accent to-accent2 hover:opacity-90 text-white font-semibold text-sm rounded-lg transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlanFeatureItem({ text }: { text: string }): JSX.Element {
  return (
    <li className="flex items-center gap-2 text-xs text-text-secondary">
      <svg
        className="w-3.5 h-3.5 text-success shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {text}
    </li>
  )
}

export default UpgradeModal
