import { useState } from 'react'

interface OverlaySettings {
  position: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-right'
  theme: 'dark' | 'light' | 'glass' | 'accent'
  size: 'compact' | 'standard' | 'large'
  showImage: boolean
  showDescription: boolean
  showPrice: boolean
  showBuyButton: boolean
}

interface OverlayCustomizerProps {
  settings: OverlaySettings
  onChange: (settings: OverlaySettings) => void
}

const POSITIONS: { value: OverlaySettings['position']; label: string; row: number; col: number }[] =
  [
    { value: 'top-left', label: 'TL', row: 0, col: 0 },
    { value: 'top-right', label: 'TR', row: 0, col: 2 },
    { value: 'bottom-left', label: 'BL', row: 1, col: 0 },
    { value: 'bottom-center', label: 'BC', row: 1, col: 1 },
    { value: 'bottom-right', label: 'BR', row: 1, col: 2 }
  ]

const THEMES: { value: OverlaySettings['theme']; label: string; desc: string }[] = [
  { value: 'dark', label: 'Dark', desc: 'Dark background' },
  { value: 'light', label: 'Light', desc: 'Light background' },
  { value: 'glass', label: 'Glass', desc: 'Blur effect' },
  { value: 'accent', label: 'Accent', desc: 'Orange background' }
]

const SIZES: { value: OverlaySettings['size']; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'standard', label: 'Standard' },
  { value: 'large', label: 'Large' }
]

function getThemeClasses(theme: OverlaySettings['theme']): string {
  switch (theme) {
    case 'dark':
      return 'bg-[#1a1f35]/95 text-white border-white/10'
    case 'light':
      return 'bg-white/95 text-gray-900 border-gray-200'
    case 'glass':
      return 'bg-white/10 backdrop-blur-xl text-white border-white/20'
    case 'accent':
      return 'bg-[#f97316]/95 text-white border-orange-400/30'
  }
}

function getSizeClasses(size: OverlaySettings['size']): { container: string; text: string; price: string } {
  switch (size) {
    case 'compact':
      return { container: 'px-3 py-2 gap-2 rounded-lg', text: 'text-xs', price: 'text-sm font-bold' }
    case 'standard':
      return { container: 'px-4 py-3 gap-3 rounded-xl', text: 'text-sm', price: 'text-base font-bold' }
    case 'large':
      return { container: 'px-5 py-4 gap-4 rounded-2xl', text: 'text-base', price: 'text-lg font-bold' }
  }
}

function getPositionClasses(position: OverlaySettings['position']): string {
  switch (position) {
    case 'top-left':
      return 'top-2 left-2'
    case 'top-right':
      return 'top-2 right-2'
    case 'bottom-left':
      return 'bottom-2 left-2'
    case 'bottom-center':
      return 'bottom-2 left-1/2 -translate-x-1/2'
    case 'bottom-right':
      return 'bottom-2 right-2'
  }
}

function OverlayCustomizer({ settings, onChange }: OverlayCustomizerProps): JSX.Element {
  const update = <K extends keyof OverlaySettings>(key: K, value: OverlaySettings[K]): void => {
    onChange({ ...settings, [key]: value })
  }

  const themeClasses = getThemeClasses(settings.theme)
  const sizeClasses = getSizeClasses(settings.size)
  const positionClasses = getPositionClasses(settings.position)
  const priceColor =
    settings.theme === 'light' ? 'text-[#f97316]' : settings.theme === 'accent' ? 'text-white' : 'text-[#f97316]'

  return (
    <div className="space-y-6">
      {/* Section: Position */}
      <div>
        <h3 className="text-text-primary font-medium text-sm mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          Position
        </h3>
        <div className="grid grid-cols-3 gap-2 w-44">
          {[0, 1].map((row) =>
            [0, 1, 2].map((col) => {
              const pos = POSITIONS.find((p) => p.row === row && p.col === col)
              if (!pos) {
                return <div key={`${row}-${col}`} className="h-10" />
              }
              return (
                <button
                  key={pos.value}
                  onClick={() => update('position', pos.value)}
                  className={`h-10 rounded-lg border text-xs font-medium transition-all ${
                    settings.position === pos.value
                      ? 'bg-accent/20 border-accent text-accent'
                      : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'
                  }`}
                >
                  {pos.label}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Section: Theme */}
      <div>
        <h3 className="text-text-primary font-medium text-sm mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
          </svg>
          Theme
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => update('theme', t.value)}
              className={`px-3 py-2.5 rounded-lg border text-left transition-all ${
                settings.theme === t.value
                  ? 'bg-accent/20 border-accent'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <span className={`text-sm font-medium ${settings.theme === t.value ? 'text-accent' : 'text-text-primary'}`}>
                {t.label}
              </span>
              <p className="text-xs text-text-secondary mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Section: Size */}
      <div>
        <h3 className="text-text-primary font-medium text-sm mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
          Size
        </h3>
        <div className="flex gap-2">
          {SIZES.map((s) => (
            <button
              key={s.value}
              onClick={() => update('size', s.value)}
              className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                settings.size === s.value
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section: Visibility Toggles */}
      <div>
        <h3 className="text-text-primary font-medium text-sm mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Visibility
        </h3>
        <div className="space-y-2">
          {([
            { key: 'showImage' as const, label: 'Product Image' },
            { key: 'showDescription' as const, label: 'Description' },
            { key: 'showPrice' as const, label: 'Price' },
            { key: 'showBuyButton' as const, label: 'Buy Button' }
          ]).map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/[0.07] transition-colors cursor-pointer"
            >
              <span className="text-sm text-text-primary">{label}</span>
              <button
                onClick={() => update(key, !settings[key])}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  settings[key] ? 'bg-accent' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    settings[key] ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div>
        <h3 className="text-text-primary font-medium text-sm mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
          Preview
        </h3>
        <div className="relative w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/10 overflow-hidden">
          {/* Simulated stream content */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>

          {/* Product overlay preview */}
          <div className={`absolute ${positionClasses} max-w-[70%]`}>
            <div className={`flex items-center border ${themeClasses} ${sizeClasses.container}`}>
              {settings.showImage && (
                <div className={`${settings.size === 'compact' ? 'w-8 h-8' : settings.size === 'large' ? 'w-14 h-14' : 'w-10 h-10'} rounded-lg bg-white/10 flex-shrink-0 flex items-center justify-center`}>
                  <svg className={`${settings.size === 'compact' ? 'w-4 h-4' : 'w-6 h-6'} opacity-50`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </div>
              )}
              <div className="min-w-0">
                <p className={`${sizeClasses.text} font-medium truncate`}>Sample Product</p>
                {settings.showDescription && (
                  <p className={`${sizeClasses.text} opacity-60 truncate`}>Product description</p>
                )}
                {settings.showPrice && <p className={`${sizeClasses.price} ${priceColor}`}>$29.99</p>}
              </div>
              {settings.showBuyButton && (
                <div
                  className={`${
                    settings.theme === 'accent' ? 'bg-white/20' : 'bg-[#f97316]/20'
                  } ${settings.size === 'compact' ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} rounded-lg font-medium flex-shrink-0 ${
                    settings.theme === 'accent' ? 'text-white' : 'text-[#f97316]'
                  }`}
                >
                  Buy Now
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverlayCustomizer
export type { OverlaySettings }
