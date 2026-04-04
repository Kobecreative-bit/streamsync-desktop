import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { usePlanStore } from '../stores/planStore'
import { PLAN_FEATURES } from '../lib/planConfig'

function Settings(): JSX.Element {
  const { profile, signOut } = useAuthStore()
  const { plan } = usePlanStore()
  const planConfig = PLAN_FEATURES[plan]

  const [settings, setSettings] = useState<AppSettings>({
    autoStartAllPlatforms: true,
    hdQuality: true,
    showProductOverlay: true,
    enableAI: true,
    buyingSignalAlerts: true,
    autoReplyFAQs: false,
    desktopNotifications: true,
    soundAlerts: true
  })

  useEffect(() => {
    window.streamSync.getSettings().then(setSettings)
  }, [])

  const toggle = async (key: keyof AppSettings): Promise<void> => {
    const updated = { ...settings, [key]: !settings[key] }
    setSettings(updated)
    await window.streamSync.updateSettings({ [key]: updated[key] })
  }

  const handleSignOut = async (): Promise<void> => {
    await signOut()
  }

  const handleManageBilling = (): void => {
    window.open('https://streamsync.live/billing', '_blank')
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Settings</h1>
        <p className="text-text-secondary mb-8">Configure your StreamSync experience</p>

        {/* Account Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Account
            </h2>
          </div>
          <div className="bg-bg-card rounded-xl border border-white/5">
            {/* User info */}
            <div className="flex items-center justify-between py-4 px-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                  {(profile?.display_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {profile?.display_name || 'User'}
                  </p>
                  <p className="text-xs text-text-secondary">{profile?.email || ''}</p>
                </div>
              </div>
            </div>

            {/* Current plan */}
            <div className="flex items-center justify-between py-4 px-5 border-b border-white/5">
              <div>
                <p className="text-sm font-medium text-text-primary">Current plan</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {planConfig.price === 0
                    ? 'Free tier'
                    : `$${planConfig.price}/month`}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                  plan === 'enterprise'
                    ? 'bg-purple-500/15 text-purple-400'
                    : plan === 'pro'
                      ? 'bg-accent/15 text-accent'
                      : 'bg-white/10 text-text-secondary'
                }`}
              >
                {planConfig.label}
              </span>
            </div>

            {/* Manage billing */}
            <div className="flex items-center justify-between py-4 px-5 border-b border-white/5">
              <div>
                <p className="text-sm font-medium text-text-primary">Billing</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Manage your subscription and payment method
                </p>
              </div>
              <button
                onClick={handleManageBilling}
                className="px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/15 rounded-lg transition-colors"
              >
                Manage Billing
              </button>
            </div>

            {/* Sign out */}
            <div className="flex items-center justify-between py-4 px-5">
              <div>
                <p className="text-sm font-medium text-text-primary">Sign out</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Sign out of your StreamSync account
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-xs font-medium text-danger bg-danger/10 hover:bg-danger/15 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </section>

        {/* Stream Settings */}
        <section className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Stream Settings
            </h2>
          </div>
          <div className="bg-bg-card rounded-xl border border-white/5 divide-y divide-white/5">
            <ToggleRow
              label="Auto-start all platforms"
              description="Start streaming on all connected platforms at once"
              checked={settings.autoStartAllPlatforms}
              onChange={() => toggle('autoStartAllPlatforms')}
            />
            <ToggleRow
              label="HD Quality"
              description="Stream in high definition quality"
              checked={settings.hdQuality}
              onChange={() => toggle('hdQuality')}
            />
            <ToggleRow
              label="Show product overlay"
              description="Display pinned products on stream panels"
              checked={settings.showProductOverlay}
              onChange={() => toggle('showProductOverlay')}
            />
          </div>
        </section>

        {/* AI Copilot Settings */}
        <section className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              AI Copilot
            </h2>
          </div>
          <div className="bg-bg-card rounded-xl border border-white/5 divide-y divide-white/5">
            <ToggleRow
              label="Enable AI Copilot"
              description="Use AI to detect buying signals and suggest replies"
              checked={settings.enableAI}
              onChange={() => toggle('enableAI')}
            />
            <ToggleRow
              label="Buying signal alerts"
              description="Get notified when viewers show purchase intent"
              checked={settings.buyingSignalAlerts}
              onChange={() => toggle('buyingSignalAlerts')}
            />
            <ToggleRow
              label="Auto-reply FAQs"
              description="Automatically respond to common questions"
              checked={settings.autoReplyFAQs}
              onChange={() => toggle('autoReplyFAQs')}
            />
          </div>
        </section>

        {/* Notification Settings */}
        <section className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Notifications
            </h2>
          </div>
          <div className="bg-bg-card rounded-xl border border-white/5 divide-y divide-white/5">
            <ToggleRow
              label="Desktop notifications"
              description="Show system notifications for important events"
              checked={settings.desktopNotifications}
              onChange={() => toggle('desktopNotifications')}
            />
            <ToggleRow
              label="Sound alerts"
              description="Play sounds for buying signals and alerts"
              checked={settings.soundAlerts}
              onChange={() => toggle('soundAlerts')}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps): JSX.Element {
  return (
    <div className="flex items-center justify-between py-4 px-5">
      <div className="pr-4">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
          checked ? 'bg-accent' : 'bg-white/10'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default Settings
