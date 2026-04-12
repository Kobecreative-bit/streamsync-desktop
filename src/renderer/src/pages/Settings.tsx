import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { usePlanStore } from '../stores/planStore'
import { PLAN_FEATURES } from '../lib/planConfig'

function Settings(): JSX.Element {
  const { profile, signOut, updateProfile } = useAuthStore()
  const { plan } = usePlanStore()
  const planConfig = PLAN_FEATURES[plan]

  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    avatar_url: '',
    bio: ''
  })
  const [profileSaving, setProfileSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setProfileForm({
        display_name: profile.display_name || '',
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || ''
      })
    }
  }, [profile])

  const handleSaveProfile = async (): Promise<void> => {
    setProfileSaving(true)
    await updateProfile(profileForm)
    setProfileSaving(false)
    setEditingProfile(false)
  }

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
    window.open('https://streamsync.dev/billing', '_blank')
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
            {/* User info + Edit Profile */}
            <div className="py-4 px-5 border-b border-white/5">
              {!editingProfile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white font-bold text-sm">
                        {(profile?.display_name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {profile?.display_name || 'User'}
                      </p>
                      <p className="text-xs text-text-secondary">{profile?.email || ''}</p>
                      {profile?.bio && (
                        <p className="text-xs text-text-secondary/60 mt-0.5">{profile.bio}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/15 rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-4">
                    {profileForm.avatar_url ? (
                      <img
                        src={profileForm.avatar_url}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white font-bold text-lg">
                        {(profileForm.display_name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs text-text-secondary mb-1">Avatar URL</p>
                      <input
                        type="url"
                        value={profileForm.avatar_url}
                        onChange={(e) => setProfileForm((f) => ({ ...f, avatar_url: e.target.value }))}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-text-primary placeholder-text-secondary/30 focus:outline-none focus:border-accent/50"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Display Name</p>
                    <input
                      type="text"
                      value={profileForm.display_name}
                      onChange={(e) => setProfileForm((f) => ({ ...f, display_name: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Bio</p>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))}
                      placeholder="Tell viewers about yourself..."
                      rows={2}
                      className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-text-primary placeholder-text-secondary/30 focus:outline-none focus:border-accent/50 resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-accent to-accent2 hover:opacity-90 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {profileSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingProfile(false)
                        if (profile) {
                          setProfileForm({
                            display_name: profile.display_name || '',
                            avatar_url: profile.avatar_url || '',
                            bio: profile.bio || ''
                          })
                        }
                      }}
                      className="px-4 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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

        {/* RTMP Stream Keys */}
        <RTMPSettings />

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

const PLATFORM_LABELS: Record<string, { name: string; color: string }> = {
  tiktok: { name: 'TikTok', color: '#ff0050' },
  youtube: { name: 'YouTube', color: '#ff0000' },
  instagram: { name: 'Instagram', color: '#e1306c' },
  facebook: { name: 'Facebook', color: '#1877f2' }
}

function RTMPSettings(): JSX.Element {
  const [keys, setKeys] = useState<RTMPStreamKey[]>([])
  const [config, setConfig] = useState<RTMPConfig>({
    videoDevice: '0',
    audioDevice: '0',
    resolution: '1280x720',
    framerate: 30,
    videoBitrate: 4500,
    audioBitrate: 160
  })
  const [devices, setDevices] = useState<RTMPMediaDevice[]>([])
  const [ffmpegOk, setFfmpegOk] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  useEffect(() => {
    window.streamSync.rtmpGetStreamKeys().then(setKeys)
    window.streamSync.rtmpGetConfig().then(setConfig)
    window.streamSync.rtmpCheckFFmpeg().then((ok) => {
      setFfmpegOk(ok)
      if (ok) {
        window.streamSync.rtmpListDevices().then(setDevices)
      }
    })
  }, [])

  const videoDevices = devices.filter((d) => d.type === 'video')
  const audioDevices = devices.filter((d) => d.type === 'audio')

  const handleKeyUpdate = (platform: string, field: string, value: string | boolean): void => {
    setKeys((prev) =>
      prev.map((k) => (k.platform === platform ? { ...k, [field]: value } : k))
    )
  }

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    await Promise.all([
      window.streamSync.rtmpSaveStreamKeys(keys),
      window.streamSync.rtmpSaveConfig(config)
    ])
    setSaving(false)
  }

  const refreshDevices = async (): Promise<void> => {
    const d = await window.streamSync.rtmpListDevices()
    setDevices(d)
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Camera & Streaming
        </h2>
        {ffmpegOk === false && (
          <span className="ml-auto text-[10px] text-danger bg-danger/10 px-2 py-0.5 rounded-full font-medium">
            Streaming engine not found
          </span>
        )}
        {ffmpegOk === true && (
          <span className="ml-auto text-[10px] text-success bg-success/10 px-2 py-0.5 rounded-full font-medium">
            Ready
          </span>
        )}
      </div>

      {ffmpegOk === false && (
        <div className="mb-3 p-3 rounded-lg bg-danger/5 border border-danger/10">
          <p className="text-xs text-danger/80">
            The streaming engine is missing. Please reinstall StreamSync or contact{' '}
            <span className="text-accent">support@streamsync.dev</span>.
          </p>
        </div>
      )}

      {/* Camera & Mic Selection */}
      <div className="bg-bg-card rounded-xl border border-white/5 divide-y divide-white/5 mb-4">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-text-primary">Camera & Microphone</p>
            <button
              onClick={refreshDevices}
              className="text-[10px] text-accent hover:text-accent/80 font-medium transition-colors"
            >
              Refresh Devices
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-text-secondary/60 uppercase tracking-wider mb-1 block">Camera</label>
              <select
                value={config.videoDevice}
                onChange={(e) => setConfig((c) => ({ ...c, videoDevice: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent/50 appearance-none"
              >
                {videoDevices.length === 0 && <option value="0">Default Camera (0)</option>}
                {videoDevices.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-secondary/60 uppercase tracking-wider mb-1 block">Microphone</label>
              <select
                value={config.audioDevice}
                onChange={(e) => setConfig((c) => ({ ...c, audioDevice: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent/50 appearance-none"
              >
                {audioDevices.length === 0 && <option value="0">Default Microphone (0)</option>}
                {audioDevices.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quality Settings */}
        <div className="px-5 py-4">
          <p className="text-sm font-medium text-text-primary mb-3">Stream Quality</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-text-secondary/60 uppercase tracking-wider mb-1 block">Resolution</label>
              <select
                value={config.resolution}
                onChange={(e) => setConfig((c) => ({ ...c, resolution: e.target.value as RTMPConfig['resolution'] }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent/50 appearance-none"
              >
                <option value="1920x1080">1080p (1920x1080)</option>
                <option value="1280x720">720p (1280x720)</option>
                <option value="854x480">480p (854x480)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-secondary/60 uppercase tracking-wider mb-1 block">Framerate</label>
              <select
                value={config.framerate}
                onChange={(e) => setConfig((c) => ({ ...c, framerate: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent/50 appearance-none"
              >
                <option value="30">30 fps</option>
                <option value="24">24 fps</option>
                <option value="60">60 fps</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-secondary/60 uppercase tracking-wider mb-1 block">
                Video Bitrate ({config.videoBitrate} kbps)
              </label>
              <input
                type="range"
                min="1000"
                max="8000"
                step="500"
                value={config.videoBitrate}
                onChange={(e) => setConfig((c) => ({ ...c, videoBitrate: parseInt(e.target.value) }))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-[9px] text-text-secondary/40 mt-0.5">
                <span>1000</span>
                <span>8000</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-text-secondary/60 uppercase tracking-wider mb-1 block">
                Audio Bitrate ({config.audioBitrate} kbps)
              </label>
              <input
                type="range"
                min="64"
                max="320"
                step="32"
                value={config.audioBitrate}
                onChange={(e) => setConfig((c) => ({ ...c, audioBitrate: parseInt(e.target.value) }))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-[9px] text-text-secondary/40 mt-0.5">
                <span>64</span>
                <span>320</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Stream Keys */}
      <p className="text-xs text-text-secondary/60 mb-2 px-1">
        Enable each platform and paste the stream key from your account's live settings.
      </p>
      <div className="bg-bg-card rounded-xl border border-white/5 divide-y divide-white/5">
        {keys.map((key) => {
          const plat = PLATFORM_LABELS[key.platform]
          const isVisible = showKeys[key.platform] ?? false
          return (
            <div key={key.platform} className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: plat.color }} />
                  <span className="text-sm font-medium text-text-primary">{plat.name}</span>
                </div>
                <button
                  onClick={() => handleKeyUpdate(key.platform, 'enabled', !key.enabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                    key.enabled ? 'bg-accent' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      key.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {key.enabled && (
                <div className="space-y-2 animate-fadeIn">
                  <div>
                    <label className="text-[10px] text-text-secondary/60 uppercase tracking-wider mb-1 block">Server URL</label>
                    <input
                      type="text"
                      value={key.serverUrl}
                      onChange={(e) => handleKeyUpdate(key.platform, 'serverUrl', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-text-primary font-mono focus:outline-none focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-secondary/60 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Stream Key</span>
                      <button
                        onClick={() => setShowKeys((prev) => ({ ...prev, [key.platform]: !isVisible }))}
                        className="text-text-secondary/40 hover:text-text-secondary transition-colors"
                      >
                        {isVisible ? 'Hide' : 'Show'}
                      </button>
                    </label>
                    <input
                      type={isVisible ? 'text' : 'password'}
                      value={key.streamKey}
                      onChange={(e) => handleKeyUpdate(key.platform, 'streamKey', e.target.value)}
                      placeholder="Paste your stream key here"
                      className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-text-primary font-mono focus:outline-none focus:border-accent/50 placeholder-text-secondary/20"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-3 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-accent to-accent2 hover:opacity-90 rounded-lg transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </section>
  )
}

export default Settings
