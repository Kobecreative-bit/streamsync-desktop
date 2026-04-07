import { useState } from 'react'

type BillingInterval = 'monthly' | 'annual'

interface PlanTier {
  name: string
  monthlyPrice: number
  annualPrice: number
  monthlyPriceId: string
  annualPriceId: string
  features: string[]
  platforms: number
  seats: string
  highlighted?: boolean
}

const plans: PlanTier[] = [
  {
    name: 'Starter',
    monthlyPrice: 29,
    annualPrice: 23,
    monthlyPriceId: 'price_1TIiWCARUnydmSgWShLWNzCo',
    annualPriceId: 'price_1TIiWEARUnydmSgW0RzPA5xQ',
    features: [
      '2 simultaneous platforms',
      '10 products',
      'Basic comment scraping',
      'Email support',
      '1 team seat'
    ],
    platforms: 2,
    seats: '1'
  },
  {
    name: 'Pro',
    monthlyPrice: 79,
    annualPrice: 63,
    monthlyPriceId: 'price_1TIiWFARUnydmSgWwougM5qb',
    annualPriceId: 'price_1TIiWHARUnydmSgWg9fK5bYN',
    features: [
      'All 4 platforms',
      'Unlimited products',
      'AI Copilot with buying signals',
      'Priority support',
      '2 team seats',
      'Product overlays'
    ],
    platforms: 4,
    seats: '2',
    highlighted: true
  },
  {
    name: 'Enterprise',
    monthlyPrice: 199,
    annualPrice: 159,
    monthlyPriceId: 'price_1TIiWIARUnydmSgWjwTpdQ95',
    annualPriceId: 'price_1TIiWKARUnydmSgWwXANk60q',
    features: [
      'All 4 platforms',
      'Unlimited products',
      'AI Copilot + auto-reply',
      'Dedicated account manager',
      'Unlimited team seats',
      'Custom integrations',
      'Analytics export'
    ],
    platforms: 4,
    seats: 'Unlimited'
  }
]

interface BillingProps {
  currentPlan?: string
  userEmail?: string
  stripeCustomerId?: string
}

function Billing({
  currentPlan = 'starter',
  userEmail = '',
  stripeCustomerId
}: BillingProps): JSX.Element {
  const [interval, setInterval] = useState<BillingInterval>('annual')
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (plan: PlanTier): Promise<void> => {
    if (loading) return
    const priceId = interval === 'annual' ? plan.annualPriceId : plan.monthlyPriceId
    setLoading(plan.name)
    try {
      await window.streamSync.createCheckoutSession({
        priceId,
        email: userEmail
      })
    } catch {
      // Checkout opens in external browser
    } finally {
      setLoading(null)
    }
  }

  const handleManageBilling = async (): Promise<void> => {
    if (!stripeCustomerId || loading) return
    setLoading('portal')
    try {
      await window.streamSync.createBillingPortal(stripeCustomerId)
    } catch {
      // Portal opens in external browser
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-1">Billing & Plans</h1>
          <p className="text-text-secondary">
            Manage your subscription and billing details
          </p>
        </div>

        {/* Current Plan Banner */}
        <div className="bg-bg-card rounded-xl border border-white/5 p-5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Current Plan</p>
              <p className="text-lg font-semibold text-text-primary capitalize">{currentPlan}</p>
            </div>
          </div>
          {stripeCustomerId && (
            <button
              onClick={handleManageBilling}
              disabled={loading === 'portal'}
              className="px-4 py-2 text-sm font-medium text-text-primary bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors disabled:opacity-50"
            >
              {loading === 'portal' ? 'Opening...' : 'Manage Subscription'}
            </button>
          )}
        </div>

        {/* Interval Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-bg-card rounded-lg p-1 border border-white/5 flex">
            <button
              onClick={() => setInterval('monthly')}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${
                interval === 'monthly'
                  ? 'bg-white/10 text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval('annual')}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                interval === 'annual'
                  ? 'bg-white/10 text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Annual
              <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const isCurrent = plan.name.toLowerCase() === currentPlan.toLowerCase()
            const isEnterprise = plan.name === 'Enterprise'
            const price = interval === 'annual' ? plan.annualPrice : plan.monthlyPrice

            return (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 flex flex-col ${
                  plan.highlighted
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-white/5 bg-bg-card'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-text-primary">${price}</span>
                    <span className="text-text-secondary text-sm">/mo</span>
                  </div>
                  {interval === 'annual' && (
                    <p className="text-xs text-text-secondary mt-1">
                      Billed annually (${price * 12}/yr)
                    </p>
                  )}
                </div>

                <ul className="flex-1 space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {isCurrent ? (
                    <div className="w-full py-2.5 text-center text-sm font-medium text-accent bg-accent/10 rounded-lg border border-accent/20">
                      Current Plan
                    </div>
                  ) : isEnterprise ? (
                    <button
                      onClick={() => {
                        window.open('mailto:hello@streamsync.dev?subject=Enterprise%20Plan%20Inquiry', '_blank')
                      }}
                      className="w-full py-2.5 text-sm font-medium text-text-primary bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                    >
                      Contact Sales
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={loading === plan.name}
                      className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                        plan.highlighted
                          ? 'bg-accent hover:bg-accent/90 text-white'
                          : 'bg-white/5 hover:bg-white/10 text-text-primary border border-white/10'
                      }`}
                    >
                      {loading === plan.name ? 'Opening checkout...' : 'Upgrade'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ / Info */}
        <div className="bg-bg-card rounded-xl border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Billing FAQ
          </h3>
          <div className="space-y-4">
            <FaqItem
              question="Can I change plans anytime?"
              answer="Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we prorate the difference."
            />
            <FaqItem
              question="How does the free trial work?"
              answer="All new accounts start with a 14-day free trial of the Pro plan. No credit card required."
            />
            <FaqItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards through our secure payment processor, Stripe."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }): JSX.Element {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-white/5 last:border-0 pb-3 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-medium text-text-primary">{question}</span>
        <svg
          className={`w-4 h-4 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="text-sm text-text-secondary mt-2">{answer}</p>
      )}
    </div>
  )
}

export default Billing
