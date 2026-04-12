import { useAuthStore } from '../stores/authStore'
import { usePlanStore } from '../stores/planStore'
import { PLAN_FEATURES } from '../lib/planConfig'

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  isLive: boolean
}

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ active: boolean }>
}

interface NavSection {
  label?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
      { id: 'golive', label: 'Go Live', icon: LiveIcon },
      { id: 'products', label: 'Products', icon: ProductsIcon },
      { id: 'analytics', label: 'Analytics', icon: AnalyticsIcon },
      { id: 'replays', label: 'Replays', icon: ReplaysIcon }
    ]
  },
  {
    label: 'Account',
    items: [
      { id: 'billing', label: 'Billing', icon: BillingIcon },
      { id: 'team', label: 'Team', icon: TeamIcon },
      { id: 'shopify', label: 'Shopify', icon: ShopifyIcon }
    ]
  },
  {
    label: 'Enterprise',
    items: [
      { id: 'whitelabel', label: 'White Label', icon: WhiteLabelIcon },
      { id: 'compliance', label: 'Compliance', icon: ComplianceIcon }
    ]
  },
  {
    items: [
      { id: 'settings', label: 'Settings', icon: SettingsIcon }
    ]
  }
]

const planBadgeColors: Record<string, string> = {
  starter: 'bg-white/8 text-text-secondary',
  pro: 'bg-accent/12 text-accent',
  enterprise: 'bg-accent2/12 text-accent2'
}

function Sidebar({ currentPage, onNavigate, isLive }: SidebarProps): JSX.Element {
  const { profile } = useAuthStore()
  const { plan } = usePlanStore()

  const displayName = profile?.display_name || 'User'
  const displayEmail = profile?.email || ''
  const initial = displayName.charAt(0).toUpperCase()
  const planLabel = PLAN_FEATURES[plan].label
  const badgeClass = planBadgeColors[plan] || planBadgeColors.starter

  return (
    <div
      className="w-60 bg-bg-secondary flex flex-col border-r border-white/5"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-5 gap-3 mt-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center glow-accent">
          <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
        <span className="font-bold text-lg tracking-tight gradient-text">StreamSync</span>
      </div>

      {/* Nav */}
      <nav
        className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {navSections.map((section, sectionIdx) => (
          <div key={section.label || `section-${sectionIdx}`}>
            {sectionIdx > 0 && (
              <div className="my-2 border-t border-white/5" />
            )}
            {section.label && (
              <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary/60">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const active = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${active ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'}`}
                >
                  <item.icon active={active} />
                  <span>{item.label}</span>
                  {item.id === 'golive' && isLive && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-danger rounded text-white animate-pulse">
                      LIVE
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Upgrade banner for non-enterprise users */}
      {plan !== 'enterprise' && (
        <div
          className="mx-3 mb-3"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors group"
          >
            <svg
              className="w-4 h-4 text-accent shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-xs font-medium text-accent">
              Upgrade to {plan === 'starter' ? 'Pro' : 'Enterprise'}
            </span>
          </button>
        </div>
      )}

      {/* User */}
      <div
        className="p-4 border-t border-white/5"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white font-bold text-sm">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-primary truncate">{displayName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded ${badgeClass}`}>
                {planLabel}
              </span>
              {displayEmail && (
                <p className="text-[10px] text-text-secondary truncate">{displayEmail}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardIcon({ active }: { active: boolean }): JSX.Element {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function LiveIcon({ active }: { active: boolean }): JSX.Element {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function ProductsIcon({ active }: { active: boolean }): JSX.Element {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

function AnalyticsIcon({ active }: { active: boolean }): JSX.Element {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function ReplaysIcon({ active }: { active: boolean }): JSX.Element {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function BillingIcon({ active }: { active: boolean }): JSX.Element {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H5a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}

function TeamIcon({ active }: { active: boolean }): JSX.Element {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function ShopifyIcon({ active }: { active: boolean }): JSX.Element {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  )
}

function WhiteLabelIcon({ active }: { active: boolean }): JSX.Element {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  )
}

function ComplianceIcon({ active }: { active: boolean }): JSX.Element {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

function SettingsIcon({ active }: { active: boolean }): JSX.Element {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export default Sidebar
