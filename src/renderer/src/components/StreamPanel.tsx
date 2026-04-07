import { useEffect, useRef, useState } from 'react'
import type { Platform } from '../lib/scrapers'

interface StreamPanelProps {
  platform: Platform
  pinnedProduct: Product | null
  isLive: boolean
  onWebviewReady?: (webview: Electron.WebviewTag, platform: Platform) => void
}

const PLATFORM_CONFIG = {
  tiktok: { name: 'TikTok', color: '#ff0050', url: 'https://www.tiktok.com' },
  youtube: { name: 'YouTube', color: '#ff0000', url: 'https://studio.youtube.com' },
  instagram: { name: 'Instagram', color: '#e1306c', url: 'https://www.instagram.com' },
  facebook: { name: 'Facebook', color: '#1877f2', url: 'https://www.facebook.com/live/producer' }
}

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'

function getCategoryIcon(iconId: string): JSX.Element {
  switch (iconId) {
    case 'shirt':
      return (
        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 0012 12a6 6 0 005.566-4.897l.319-1.913M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
        </svg>
      )
    case 'tech':
      return (
        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    case 'beauty':
      return (
        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      )
    default:
      return (
        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
  }
}

function StreamPanel({ platform, pinnedProduct, isLive, onWebviewReady }: StreamPanelProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const webviewRef = useRef<Electron.WebviewTag | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const config = PLATFORM_CONFIG[platform]

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const existing = container.querySelector('webview')
    if (existing) {
      container.removeChild(existing)
    }

    const webview = document.createElement('webview') as Electron.WebviewTag
    webview.setAttribute('src', config.url)
    webview.setAttribute('partition', `persist:${platform}`)
    webview.setAttribute('allowpopups', '')
    webview.setAttribute('useragent', USER_AGENT)
    webview.style.width = '100%'
    webview.style.height = '100%'
    webview.style.borderRadius = '0 0 12px 12px'

    webview.addEventListener('did-start-loading', () => {
      setLoading(true)
      setError(null)
    })

    webview.addEventListener('did-stop-loading', () => {
      setLoading(false)
      if (onWebviewReady) {
        onWebviewReady(webview, platform)
      }
    })

    webview.addEventListener('did-fail-load', () => {
      setLoading(false)
      setError('Failed to load. Check your connection.')
    })

    webview.addEventListener('crashed', () => {
      setError('Page crashed. Click retry to reload.')
    })

    webview.addEventListener('unresponsive', () => {
      setError('Page is not responding.')
    })

    webview.addEventListener('responsive', () => {
      setError(null)
    })

    container.appendChild(webview)
    webviewRef.current = webview

    return () => {
      if (container.contains(webview)) {
        container.removeChild(webview)
      }
    }
  }, [platform, config.url, onWebviewReady])

  const handleRetry = (): void => {
    setError(null)
    setLoading(true)
    webviewRef.current?.reload()
  }

  const handleRefresh = (): void => {
    setLoading(true)
    webviewRef.current?.reload()
  }

  return (
    <div className="stream-panel flex flex-col bg-bg-card rounded-2xl border border-white/[0.06] overflow-hidden flex-1 min-w-[280px] shadow-lg shadow-black/20">
      {/* Header — colored top border + platform info */}
      <div className="relative shrink-0">
        {/* Colored top accent line */}
        <div
          className="h-[2px] w-full"
          style={{ backgroundColor: config.color }}
        />
        <div className="h-11 flex items-center justify-between px-3.5 bg-bg-secondary/40">
          <div className="flex items-center gap-2.5">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: isLive ? '#22c55e' : config.color + '60' }}
            />
            <span className="text-xs font-bold text-text-primary tracking-wide">{config.name}</span>
            {isLive && (
              <span className="text-[9px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded">
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-text-secondary/20 border-t-text-secondary rounded-full animate-spin" />
            )}
            {/* Hover-to-reveal controls */}
            <div className="stream-panel-controls flex items-center gap-0.5">
              <button
                onClick={handleRefresh}
                className="text-text-secondary hover:text-text-primary transition-colors p-1.5 rounded-md hover:bg-white/5"
                title="Refresh"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Webview Container */}
      <div className="flex-1 relative min-h-0" ref={containerRef}>
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-primary/95 z-10 p-6">
            <svg className="w-10 h-10 text-text-secondary/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-text-secondary text-xs text-center mb-4 max-w-[200px]">{error}</p>
            <button
              onClick={handleRetry}
              className="px-5 py-2 bg-accent rounded-lg text-white text-xs font-semibold hover:bg-accent/80 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Product Overlay — slide-up card */}
        {pinnedProduct && isLive && (
          <div className="absolute bottom-3 left-3 right-3 z-20 animate-slideUp">
            <div className="bg-bg-card/95 backdrop-blur-md rounded-xl border border-white/10 p-3 shadow-xl shadow-black/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  {getCategoryIcon(pinnedProduct.emoji)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{pinnedProduct.name}</p>
                  <p className="text-accent text-sm font-bold">${pinnedProduct.price.toFixed(2)}</p>
                </div>
              </div>
              <button className="w-full mt-2.5 py-2 bg-accent rounded-lg text-white text-[11px] font-bold hover:bg-accent/80 transition-colors shadow-sm shadow-accent/20">
                Buy Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="h-8 flex items-center justify-center shrink-0 border-t border-white/[0.04] bg-bg-secondary/20">
        {isLive ? (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-semibold text-success">Connected</span>
          </div>
        ) : (
          <span className="text-[10px] text-text-secondary/60">Ready to stream</span>
        )}
      </div>
    </div>
  )
}

export default StreamPanel
