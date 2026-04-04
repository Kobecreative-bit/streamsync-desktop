import { useEffect, useRef, useState } from 'react'

interface StreamPanelProps {
  platform: 'tiktok' | 'youtube' | 'instagram' | 'facebook'
  pinnedProduct: Product | null
  isLive: boolean
}

const PLATFORM_CONFIG = {
  tiktok: { name: 'TikTok', color: '#ff0050', url: 'https://www.tiktok.com' },
  youtube: { name: 'YouTube', color: '#ff0000', url: 'https://studio.youtube.com' },
  instagram: { name: 'Instagram', color: '#e1306c', url: 'https://www.instagram.com' },
  facebook: { name: 'Facebook', color: '#1877f2', url: 'https://www.facebook.com/live/producer' }
}

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'

function StreamPanel({ platform, pinnedProduct, isLive }: StreamPanelProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const webviewRef = useRef<Electron.WebviewTag | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const config = PLATFORM_CONFIG[platform]

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear any existing webview
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
    webview.style.borderRadius = '0 0 8px 8px'

    webview.addEventListener('did-start-loading', () => {
      setLoading(true)
      setError(null)
    })

    webview.addEventListener('did-stop-loading', () => {
      setLoading(false)
    })

    webview.addEventListener('did-fail-load', (_e) => {
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
  }, [platform, config.url])

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
    <div className="flex flex-col bg-bg-card rounded-2xl border border-white/5 overflow-hidden flex-1 min-w-[220px] max-w-[320px]">
      {/* Phone notch header */}
      <div className="h-10 flex items-center justify-between px-3 shrink-0" style={{ backgroundColor: config.color + '15' }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
          <span className="text-xs font-bold text-text-primary">{config.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {loading && (
            <div className="w-3 h-3 border-2 border-text-secondary/30 border-t-text-secondary rounded-full animate-spin" />
          )}
          <button
            onClick={handleRefresh}
            className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-white/5"
            title="Refresh"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Webview Container — tall vertical phone shape */}
      <div className="flex-1 relative min-h-0" ref={containerRef}>
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-primary/90 z-10 p-4">
            <p className="text-text-secondary text-xs text-center mb-3">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-1.5 bg-accent rounded-lg text-white text-xs font-medium hover:bg-accent/80 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Product Overlay */}
        {pinnedProduct && isLive && (
          <div className="absolute bottom-2 left-2 right-2 z-20 bg-bg-card/95 backdrop-blur-sm rounded-lg border border-white/10 p-2 animate-slideUp">
            <div className="flex items-center gap-2">
              <span className="text-lg">{pinnedProduct.emoji || '🛍️'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{pinnedProduct.name}</p>
                <p className="text-accent text-xs font-bold">${pinnedProduct.price.toFixed(2)}</p>
              </div>
            </div>
            <button className="w-full mt-1.5 py-1 bg-accent rounded-md text-white text-[10px] font-bold hover:bg-accent/80 transition-colors">
              Buy Now
            </button>
          </div>
        )}
      </div>

      {/* Bottom bar — platform status */}
      <div className="h-8 flex items-center justify-center shrink-0 border-t border-white/5">
        {isLive ? (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-semibold text-success">LIVE</span>
          </div>
        ) : (
          <span className="text-[10px] text-text-secondary">Ready</span>
        )}
      </div>
    </div>
  )
}

export default StreamPanel
