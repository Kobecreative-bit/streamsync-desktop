import { useState, useEffect } from 'react'

function Settings(): JSX.Element {
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

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Settings</h1>
        <p className="text-text-secondary mb-8">Configure your StreamSync experience</p>

        {/* Stream Settings */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Stream Settings
          </h2>
          <div className="space-y-1">
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
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            AI Copilot
          </h2>
          <div className="space-y-1">
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
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Notifications
          </h2>
          <div className="space-y-1">
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
    <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-white/3 transition-colors">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-accent' : 'bg-white/10'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default Settings
