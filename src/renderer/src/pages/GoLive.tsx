import { useState, useEffect, useRef, useCallback } from 'react'
import StreamPanel from '../components/StreamPanel'
import StreamControls from '../components/StreamControls'
import CommentPanel from '../components/CommentPanel'
import AICopilot from '../components/AIcopilot'
import ProductModal from '../components/ProductModal'
import { generateFakeComment } from '../lib/commentScraper'
import { detectBuyingSignal, generateSuggestedReply } from '../lib/aiCopilot'

interface GoLiveProps {
  isLive: boolean
  setIsLive: (live: boolean) => void
}

type RightTab = 'comments' | 'products' | 'ai'

function GoLive({ isLive, setIsLive }: GoLiveProps): JSX.Element {
  const [comments, setComments] = useState<Comment[]>([])
  const [alerts, setAlerts] = useState<BuyingSignalAlert[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [viewerCount, setViewerCount] = useState(0)
  const [rightTab, setRightTab] = useState<RightTab>('comments')
  const [showProductModal, setShowProductModal] = useState(false)
  const commentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const viewerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pinnedProduct = products.find((p) => p.pinned) || null

  const loadProducts = useCallback(async () => {
    const prods = await window.streamSync.getProducts()
    setProducts(prods)
  }, [])

  useEffect(() => {
    loadProducts()
    window.streamSync.onProductsUpdated(() => loadProducts())
  }, [loadProducts])

  const handleGoLive = (): void => {
    setIsLive(true)
    setComments([])
    setAlerts([])
    setViewerCount(0)

    commentIntervalRef.current = setInterval(() => {
      const comment = generateFakeComment()
      setComments((prev) => [...prev.slice(-100), comment])

      if (detectBuyingSignal(comment.text)) {
        const alert: BuyingSignalAlert = {
          id: comment.id,
          comment,
          suggestedReply: generateSuggestedReply(comment.user),
          sent: false
        }
        setAlerts((prev) => [alert, ...prev.slice(0, 49)])
      }
    }, 2000 + Math.random() * 3000)

    viewerIntervalRef.current = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 5) + 1)
    }, 3000)
  }

  const handleEndStream = (): void => {
    setIsLive(false)
    if (commentIntervalRef.current) clearInterval(commentIntervalRef.current)
    if (viewerIntervalRef.current) clearInterval(viewerIntervalRef.current)
  }

  useEffect(() => {
    return () => {
      if (commentIntervalRef.current) clearInterval(commentIntervalRef.current)
      if (viewerIntervalRef.current) clearInterval(viewerIntervalRef.current)
    }
  }, [])

  const handleSendReply = (alertId: string): void => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, sent: true } : a))
    )
  }

  const handleAddProduct = async (product: Omit<Product, 'id' | 'pinned'>): Promise<void> => {
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

  return (
    <div className="h-full flex flex-col">
      {/* Top: Controls Bar */}
      <StreamControls
        isLive={isLive}
        onGoLive={handleGoLive}
        onEndStream={handleEndStream}
        viewerCount={viewerCount}
      />

      {/* Main Content Row */}
      <div className="flex-1 flex overflow-hidden">
        {/* Stream Panels - horizontal row of vertical phone panels */}
        <div className="flex-1 flex gap-3 p-3 overflow-x-auto items-stretch">
          <StreamPanel platform="tiktok" pinnedProduct={pinnedProduct} isLive={isLive} />
          <StreamPanel platform="youtube" pinnedProduct={pinnedProduct} isLive={isLive} />
          <StreamPanel platform="instagram" pinnedProduct={pinnedProduct} isLive={isLive} />
          <StreamPanel platform="facebook" pinnedProduct={pinnedProduct} isLive={isLive} />
        </div>

        {/* Right Sidebar Panel - 320px with tabs */}
        <div className="w-[320px] bg-bg-secondary border-l border-white/5 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-white/5 shrink-0">
            {(['comments', 'products', 'ai'] as RightTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors relative ${
                  rightTab === tab ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab === 'comments' && `Comments (${comments.length})`}
                {tab === 'products' && `Products (${products.length})`}
                {tab === 'ai' &&
                  `AI Copilot${alerts.filter((a) => !a.sent).length ? ` (${alerts.filter((a) => !a.sent).length})` : ''}`}
                {rightTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {rightTab === 'comments' && <CommentPanel comments={comments} />}

            {rightTab === 'products' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <button
                  onClick={() => setShowProductModal(true)}
                  className="w-full p-4 border-2 border-dashed border-white/10 rounded-lg text-sm text-text-secondary hover:border-accent/30 hover:text-accent transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </button>
                {products.map((product) => (
                  <div key={product.id} className="bg-bg-card rounded-lg border border-white/5 p-3">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{product.name}</p>
                        <p className="text-accent text-sm font-bold">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                    {product.description && (
                      <p className="text-xs text-text-secondary mb-2 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePin(product.id)}
                        className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          product.pinned
                            ? 'bg-accent text-white'
                            : 'bg-white/5 text-text-secondary hover:bg-white/10'
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
                        className="py-1.5 px-3 rounded-md text-xs text-danger bg-danger/10 hover:bg-danger/20 transition-colors"
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
              <AICopilot isLive={isLive} alerts={alerts} onSendReply={handleSendReply} />
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal onSave={handleAddProduct} onClose={() => setShowProductModal(false)} />
      )}
    </div>
  )
}

export default GoLive
