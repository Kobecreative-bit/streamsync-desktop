import { useState, useEffect, useRef, useCallback } from 'react'
import StreamPanel from '../components/StreamPanel'
import StreamControls from '../components/StreamControls'
import CommentPanel from '../components/CommentPanel'
import AICopilot from '../components/AIcopilot'
import ProductModal from '../components/ProductModal'
import UpgradeModal from '../components/UpgradeModal'
import { generateDemoComment } from '../lib/commentScraper'
import { scrapeComments, type Platform } from '../lib/scrapers'
import { analyzeBuyingSignal, generateContextReply } from '../lib/buyingSignalEngine'
import { sendReply } from '../lib/replyInjector'
import { usePlanStore } from '../stores/planStore'
import { getFeatureLimit } from '../lib/planConfig'

interface GoLiveProps {
  isLive: boolean
  setIsLive: (live: boolean) => void
}

type RightTab = 'comments' | 'products' | 'ai'

const ALL_PLATFORMS: Platform[] = ['tiktok', 'youtube', 'instagram', 'facebook']

function GoLive({ isLive, setIsLive }: GoLiveProps): JSX.Element {
  const { plan, canAccess, getRequiredPlanForFeature } = usePlanStore()
  const maxPlatforms = getFeatureLimit(plan, 'max_platforms')

  // Selected platforms — respect plan limits
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(() => {
    // Load saved selection or default based on plan
    const saved = window.streamSync.getSelectedPlatforms?.()
    if (saved && saved.length <= maxPlatforms) return saved as Platform[]
    return ALL_PLATFORMS.slice(0, maxPlatforms)
  })

  const [comments, setComments] = useState<Comment[]>([])
  const [alerts, setAlerts] = useState<BuyingSignalAlert[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [viewerCount, setViewerCount] = useState(0)
  const [rightTab, setRightTab] = useState<RightTab>('comments')
  const [showProductModal, setShowProductModal] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [rtmpStatuses, setRtmpStatuses] = useState<RTMPStatus[]>([])
  const scrapeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const viewerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const webviewRefs = useRef<Record<Platform, Electron.WebviewTag | null>>({
    tiktok: null,
    youtube: null,
    instagram: null,
    facebook: null
  })
  const seenCommentsRef = useRef<Set<string>>(new Set())
  const emptyScrapeCyclesRef = useRef(0)
  const demoFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Enforce platform limit when plan changes
  useEffect(() => {
    if (selectedPlatforms.length > maxPlatforms) {
      setSelectedPlatforms((prev) => prev.slice(0, maxPlatforms))
    }
  }, [maxPlatforms, selectedPlatforms.length])

  // Save selected platforms
  useEffect(() => {
    window.streamSync.setSelectedPlatforms?.(selectedPlatforms)
  }, [selectedPlatforms])

  // Listen for RTMP status updates
  useEffect(() => {
    window.streamSync.onRTMPStatusUpdate?.((statuses) => {
      setRtmpStatuses(statuses)
    })
  }, [])

  const pinnedProduct = products.find((p) => p.pinned) || null

  const loadProducts = useCallback(async () => {
    const prods = await window.streamSync.getProducts()
    setProducts(prods)
  }, [])

  useEffect(() => {
    loadProducts()
    window.streamSync.onProductsUpdated(() => loadProducts())
  }, [loadProducts])

  const handleWebviewReady = useCallback((webview: Electron.WebviewTag, platform: Platform) => {
    webviewRefs.current[platform] = webview
  }, [])

  const commentKey = (user: string, text: string, platform: string): string => {
    return `${platform}:${user}:${text}`
  }

  const runScrapeCycle = useCallback(async () => {
    let totalScraped = 0

    for (const platform of selectedPlatforms) {
      const webview = webviewRefs.current[platform]
      if (!webview) continue

      try {
        const scraped = await scrapeComments(webview, platform)
        for (const raw of scraped) {
          const key = commentKey(raw.user, raw.text, platform)
          if (seenCommentsRef.current.has(key)) continue
          seenCommentsRef.current.add(key)

          const signal = analyzeBuyingSignal(raw.text)
          const comment: Comment = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            user: raw.user,
            text: raw.text,
            platform,
            timestamp: Date.now(),
            isBuyingSignal: signal.isSignal
          }

          setComments((prev) => [...prev.slice(-200), comment])
          totalScraped++

          if (signal.isSignal) {
            const primarySignal = signal.matchedPatterns[0] || 'purchase intent'
            const productForReply = pinnedProduct
              ? { name: pinnedProduct.name, price: pinnedProduct.price, buyLink: pinnedProduct.buyLink }
              : null
            const reply = generateContextReply(comment.user, productForReply, primarySignal)

            const alert: BuyingSignalAlert = {
              id: comment.id,
              comment,
              suggestedReply: reply,
              confidence: signal.confidence,
              matchedPatterns: signal.matchedPatterns,
              sent: false,
              sendStatus: 'idle'
            }
            setAlerts((prev) => [alert, ...prev.slice(0, 49)])
          }
        }
      } catch {
        // Scraping failed for this platform, continue with others
      }
    }

    return totalScraped
  }, [pinnedProduct, selectedPlatforms])

  const startDemoMode = useCallback(() => {
    if (demoIntervalRef.current) return
    setIsDemoMode(true)

    demoIntervalRef.current = setInterval(() => {
      const comment = generateDemoComment()
      const signal = analyzeBuyingSignal(comment.text)
      comment.isBuyingSignal = signal.isSignal

      setComments((prev) => [...prev.slice(-200), comment])

      if (signal.isSignal) {
        const primarySignal = signal.matchedPatterns[0] || 'purchase intent'
        const productForReply = pinnedProduct
          ? { name: pinnedProduct.name, price: pinnedProduct.price, buyLink: pinnedProduct.buyLink }
          : null
        const reply = generateContextReply(comment.user, productForReply, primarySignal)

        const alert: BuyingSignalAlert = {
          id: comment.id,
          comment,
          suggestedReply: reply,
          confidence: signal.confidence,
          matchedPatterns: signal.matchedPatterns,
          sent: false,
          sendStatus: 'idle'
        }
        setAlerts((prev) => [alert, ...prev.slice(0, 49)])
      }
    }, 2000 + Math.random() * 3000)
  }, [pinnedProduct])

  const stopDemoMode = useCallback(() => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
      demoIntervalRef.current = null
    }
    setIsDemoMode(false)
  }, [])

  const handleGoLive = async (): Promise<void> => {
    setIsLive(true)
    setComments([])
    setAlerts([])
    setViewerCount(0)
    seenCommentsRef.current.clear()
    emptyScrapeCyclesRef.current = 0

    // Start RTMP streams for enabled platforms
    try {
      const keys = await window.streamSync.rtmpGetStreamKeys()
      for (const key of keys) {
        if (key.enabled && key.streamKey && selectedPlatforms.includes(key.platform)) {
          window.streamSync.rtmpStartStream(key.platform, key.serverUrl, key.streamKey)
        }
      }
    } catch {
      // RTMP is optional — continue without it
    }

    scrapeIntervalRef.current = setInterval(async () => {
      const count = await runScrapeCycle()
      if (count === 0) {
        emptyScrapeCyclesRef.current++
      } else {
        emptyScrapeCyclesRef.current = 0
        if (isDemoMode) {
          stopDemoMode()
        }
      }
    }, 3000)

    demoFallbackTimerRef.current = setTimeout(() => {
      if (emptyScrapeCyclesRef.current >= 3) {
        startDemoMode()
      }
      const checkInterval = setInterval(() => {
        if (emptyScrapeCyclesRef.current >= 3 && !demoIntervalRef.current) {
          startDemoMode()
        }
      }, 10000)
      demoFallbackTimerRef.current = checkInterval as unknown as ReturnType<typeof setTimeout>
    }, 10000)

    viewerIntervalRef.current = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 5) + 1)
    }, 3000)
  }

  const handleEndStream = (): void => {
    setIsLive(false)
    if (scrapeIntervalRef.current) clearInterval(scrapeIntervalRef.current)
    if (viewerIntervalRef.current) clearInterval(viewerIntervalRef.current)
    if (demoFallbackTimerRef.current) clearInterval(demoFallbackTimerRef.current as unknown as ReturnType<typeof setInterval>)
    stopDemoMode()
    scrapeIntervalRef.current = null
    viewerIntervalRef.current = null
    demoFallbackTimerRef.current = null

    // Stop all RTMP streams
    window.streamSync.rtmpStopAll?.()
    setRtmpStatuses([])
  }

  useEffect(() => {
    return () => {
      if (scrapeIntervalRef.current) clearInterval(scrapeIntervalRef.current)
      if (viewerIntervalRef.current) clearInterval(viewerIntervalRef.current)
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
      if (demoFallbackTimerRef.current) clearInterval(demoFallbackTimerRef.current as unknown as ReturnType<typeof setInterval>)
    }
  }, [])

  const handleSendReply = async (alertId: string): Promise<void> => {
    const alert = alerts.find((a) => a.id === alertId)
    if (!alert || alert.sent) return

    const platform = alert.comment.platform
    const webview = webviewRefs.current[platform]

    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, sendStatus: 'sending' as const } : a))
    )

    if (webview && !isDemoMode) {
      const success = await sendReply(webview, platform, alert.suggestedReply)
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, sent: success, sendStatus: success ? 'success' as const : 'failed' as const }
            : a
        )
      )
    } else {
      setTimeout(() => {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId ? { ...a, sent: true, sendStatus: 'success' as const } : a
          )
        )
      }, 500)
    }
  }

  const handleAddProduct = async (product: Omit<Product, 'id' | 'pinned'>): Promise<void> => {
    // Check product limit
    const maxProducts = getFeatureLimit(plan, 'max_products')
    if (products.length >= maxProducts && maxProducts !== Infinity) {
      setShowUpgrade('max_products')
      return
    }
    await window.streamSync.addProduct({ ...product, pinned: false })
    setShowProductModal(false)
    loadProducts()
  }

  const handleTogglePin = async (productId: string): Promise<void> => {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    for (const p of products) {
      if (p.pinned && p.id !== productId) {
        await window.streamSync.updateProduct(p.id, { pinned: false })
      }
    }
    await window.streamSync.updateProduct(productId, { pinned: !product.pinned })
    loadProducts()
  }

  const handleRemoveProduct = async (productId: string): Promise<void> => {
    await window.streamSync.removeProduct(productId)
    loadProducts()
  }

  const handlePlatformToggle = (platform: Platform): void => {
    if (isLive) return // Don't allow platform changes during live stream
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        if (prev.length <= 1) return prev // Keep at least one
        return prev.filter((p) => p !== platform)
      }
      if (prev.length >= maxPlatforms) {
        setShowUpgrade('max_platforms')
        return prev
      }
      return [...prev, platform]
    })
  }

  const maxProducts = getFeatureLimit(plan, 'max_products')
  const isAtProductLimit = maxProducts !== Infinity && products.length >= maxProducts

  return (
    <div className="h-full flex flex-col">
      {/* Top: Controls Bar with platform pills */}
      <StreamControls
        isLive={isLive}
        onGoLive={handleGoLive}
        onEndStream={handleEndStream}
        viewerCount={viewerCount}
        activePlatforms={selectedPlatforms}
        isDemoMode={isDemoMode}
        rtmpStatuses={rtmpStatuses}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Stream Panels — take up most of the space */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Platform toggle bar (when not live) */}
          {!isLive && (
            <div className="px-4 py-2.5 border-b border-white/[0.04] bg-bg-secondary/30 flex items-center gap-3 shrink-0">
              <span className="text-[11px] text-text-secondary/60 font-medium">Platforms:</span>
              <div className="flex items-center gap-2">
                {ALL_PLATFORMS.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform)
                  const config = {
                    tiktok: { name: 'TikTok', color: '#ff0050' },
                    youtube: { name: 'YouTube', color: '#ff0000' },
                    instagram: { name: 'Instagram', color: '#e1306c' },
                    facebook: { name: 'Facebook', color: '#1877f2' }
                  }[platform]
                  return (
                    <button
                      key={platform}
                      onClick={() => handlePlatformToggle(platform)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        isSelected
                          ? 'bg-white/[0.06] border border-white/10'
                          : 'bg-transparent border border-transparent text-text-secondary/40 hover:text-text-secondary hover:bg-white/[0.02]'
                      }`}
                      style={{
                        color: isSelected ? config.color : undefined
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: isSelected ? config.color : '#374151'
                        }}
                      />
                      {config.name}
                    </button>
                  )
                })}
              </div>
              {maxPlatforms < 4 && (
                <span className="text-[10px] text-text-secondary/40 ml-auto">
                  {selectedPlatforms.length}/{maxPlatforms} platforms
                </span>
              )}
            </div>
          )}

          {/* Stream grid */}
          <div className="flex-1 flex gap-3 p-3 overflow-x-auto items-stretch">
            {selectedPlatforms.map((platform) => (
              <StreamPanel
                key={platform}
                platform={platform}
                pinnedProduct={pinnedProduct}
                isLive={isLive}
                onWebviewReady={handleWebviewReady}
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar — wider for readability */}
        <div className="w-[360px] bg-bg-secondary/50 border-l border-white/[0.05] flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-white/[0.05] shrink-0">
            {(['comments', 'products', 'ai'] as RightTab[]).map((tab) => {
              const isActive = rightTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => {
                    if (tab === 'ai' && !canAccess('ai_copilot')) {
                      setRightTab(tab) // Still show the tab but with upgrade prompt
                    } else {
                      setRightTab(tab)
                    }
                  }}
                  className={`flex-1 py-3.5 text-[11px] font-semibold transition-colors relative tracking-wide ${
                    isActive ? 'text-text-primary' : 'text-text-secondary/50 hover:text-text-secondary'
                  }`}
                >
                  {tab === 'comments' && `Comments${comments.length ? ` (${comments.length})` : ''}`}
                  {tab === 'products' && `Products${products.length ? ` (${products.length})` : ''}`}
                  {tab === 'ai' && (
                    <span className="flex items-center justify-center gap-1.5">
                      AI Copilot
                      {alerts.filter((a) => !a.sent).length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                          {alerts.filter((a) => !a.sent).length}
                        </span>
                      )}
                      {!canAccess('ai_copilot') && (
                        <svg className="w-3 h-3 text-text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-accent rounded-full" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Demo mode indicator */}
          {isLive && isDemoMode && rightTab === 'comments' && (
            <div className="px-4 py-2 bg-white/[0.01] border-b border-white/[0.04]">
              <span className="text-[10px] text-text-secondary/50">
                Simulated comments — log into platforms for real data
              </span>
            </div>
          )}

          {/* Tab Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {rightTab === 'comments' && <CommentPanel comments={comments} />}

            {rightTab === 'products' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <button
                  onClick={() => {
                    if (isAtProductLimit) {
                      setShowUpgrade('max_products')
                    } else {
                      setShowProductModal(true)
                    }
                  }}
                  className="w-full p-4 border-2 border-dashed border-white/[0.06] rounded-xl text-sm text-text-secondary/60 hover:border-accent/30 hover:text-accent transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                  {isAtProductLimit && (
                    <svg className="w-3 h-3 text-text-secondary/30 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </button>

                {/* Product limit indicator */}
                {maxProducts !== Infinity && (
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] text-text-secondary/40">
                      {products.length}/{maxProducts} products
                    </span>
                    {isAtProductLimit && (
                      <button
                        onClick={() => setShowUpgrade('max_products')}
                        className="text-[10px] text-accent font-semibold hover:text-accent/80 transition-colors"
                      >
                        Upgrade for more
                      </button>
                    )}
                  </div>
                )}

                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-bg-card/60 rounded-xl border border-white/[0.04] p-3.5 transition-all hover:border-white/[0.08]"
                  >
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-text-primary truncate">{product.name}</p>
                        <p className="text-accent text-[13px] font-bold">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                    {product.description && (
                      <p className="text-xs text-text-secondary/60 mb-2.5 line-clamp-2 leading-relaxed">{product.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePin(product.id)}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                          product.pinned
                            ? 'bg-accent text-white shadow-sm shadow-accent/20'
                            : 'bg-white/[0.04] text-text-secondary hover:bg-white/[0.08]'
                        }`}
                      >
                        {product.pinned ? (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                            </svg>
                            Pinned
                          </>
                        ) : (
                          'Pin to Stream'
                        )}
                      </button>
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="py-2 px-3.5 rounded-lg text-[11px] text-danger/70 bg-danger/5 hover:bg-danger/15 hover:text-danger transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {rightTab === 'ai' && (
              <AICopilot isLive={isLive} alerts={alerts} onSendReply={handleSendReply} isDemoMode={isDemoMode} />
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal onSave={handleAddProduct} onClose={() => setShowProductModal(false)} />
      )}

      {/* Upgrade Modal */}
      {showUpgrade && (
        <UpgradeModal
          feature={showUpgrade}
          currentPlan={plan}
          requiredPlan={getRequiredPlanForFeature(showUpgrade) || 'pro'}
          onClose={() => setShowUpgrade(null)}
        />
      )}
    </div>
  )
}

export default GoLive
