import { useState, useEffect } from 'react'

interface BrandingConfig {
  appName: string
  accentColor: string
  logoPath: string
}

const PRESET_COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444', '#ec4899']

const DEFAULT_BRANDING: BrandingConfig = {
  appName: 'StreamSync',
  accentColor: '#f97316',
  logoPath: ''
}

export default function WhiteLabel(): JSX.Element {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.streamSync.getBranding().then((b) => {
      setBranding(b)
      setLoading(false)
    })
  }, [])

  const handleSave = async (): Promise<void> => {
    await window.streamSync.updateBranding(branding)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = async (): Promise<void> => {
    setBranding(DEFAULT_BRANDING)
    await window.streamSync.updateBranding(DEFAULT_BRANDING)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogoUpload = async (): Promise<void> => {
    const content = await window.streamSync.openCsvDialog() // Reuse file dialog for simplicity
    // In a real implementation, this would use a proper image file picker
    // For now, users can type a path
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm">Loading branding settings...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-[900px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">White-Label Branding</h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize the look and feel of your application for your brand.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-6">
          {/* App Name */}
          <div className="bg-[#1a1f35] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-medium text-slate-200">Application Name</h3>
            <input
              type="text"
              value={branding.appName}
              onChange={(e) => setBranding({ ...branding, appName: e.target.value })}
              placeholder="StreamSync"
              className="w-full bg-[#111827] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f97316]"
            />
            <p className="text-xs text-slate-500">
              This name replaces &ldquo;StreamSync&rdquo; throughout the app.
            </p>
          </div>

          {/* Accent Color */}
          <div className="bg-[#1a1f35] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-medium text-slate-200">Accent Color</h3>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border-2 border-slate-600 flex-shrink-0"
                style={{ backgroundColor: branding.accentColor }}
              />
              <input
                type="text"
                value={branding.accentColor}
                onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                placeholder="#f97316"
                className="flex-1 bg-[#111827] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-[#f97316]"
              />
            </div>
            <div className="flex gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setBranding({ ...branding, accentColor: color })}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    branding.accentColor === color ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Logo */}
          <div className="bg-[#1a1f35] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-medium text-slate-200">Logo Path</h3>
            <input
              type="text"
              value={branding.logoPath}
              onChange={(e) => setBranding({ ...branding, logoPath: e.target.value })}
              placeholder="/path/to/logo.png"
              className="w-full bg-[#111827] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f97316]"
            />
            <p className="text-xs text-slate-500">
              Enter the path to your logo file (PNG or SVG recommended).
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#f97316] text-white rounded-lg font-medium hover:bg-[#ea580c] transition-colors"
            >
              {saved ? 'Saved!' : 'Save Branding'}
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-[#1a1f35] text-slate-300 rounded-lg font-medium hover:bg-[#252b45] transition-colors border border-slate-700"
            >
              Reset to Default
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-200">Live Preview</h3>
          <div className="bg-[#0a0e1a] rounded-xl border border-slate-800 overflow-hidden">
            {/* Fake sidebar preview */}
            <div className="flex">
              <div className="w-16 bg-[#111827] py-4 flex flex-col items-center gap-4 min-h-[320px]">
                {/* Logo area */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: branding.accentColor }}
                >
                  {branding.appName.slice(0, 2).toUpperCase()}
                </div>
                <div className="w-6 h-6 rounded bg-slate-700" />
                <div className="w-6 h-6 rounded bg-slate-700" />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: branding.accentColor + '30' }}
                />
                <div className="w-6 h-6 rounded bg-slate-700" />
              </div>

              {/* Main content area */}
              <div className="flex-1 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <h4
                    className="text-sm font-bold"
                    style={{ color: branding.accentColor }}
                  >
                    {branding.appName}
                  </h4>
                </div>

                {/* Fake dashboard cards */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-[#1a1f35] rounded-lg p-3">
                    <div className="w-8 h-1.5 rounded bg-slate-600 mb-2" />
                    <div
                      className="w-12 h-2 rounded"
                      style={{ backgroundColor: branding.accentColor }}
                    />
                  </div>
                  <div className="bg-[#1a1f35] rounded-lg p-3">
                    <div className="w-10 h-1.5 rounded bg-slate-600 mb-2" />
                    <div className="w-8 h-2 rounded bg-[#22c55e]" />
                  </div>
                </div>

                {/* Fake button */}
                <button
                  className="px-3 py-1.5 rounded text-white text-xs font-medium"
                  style={{ backgroundColor: branding.accentColor }}
                >
                  Go Live
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center">
            This is a preview of how the sidebar and header will appear with your branding.
          </p>
        </div>
      </div>
    </div>
  )
}
