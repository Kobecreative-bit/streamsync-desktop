import { useState, useEffect } from 'react'

interface ShopifyConnection {
  shop: string
  accessToken: string
  shopName: string
  connectedAt: number
}

interface ShopifyProduct {
  id: string
  title: string
  price: number
  description: string
  image: string
  handle: string
  url: string
  variants: { id: string; title: string; price: number; sku: string }[]
}

function ShopifyIcon(): JSX.Element {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.337 3.415c-.03-.025-.065-.035-.1-.03-.035.005-1.155.175-1.155.175s-.77-.77-.85-.85c-.08-.08-.235-.055-.295-.04-.01 0-.11.035-.28.085a4.81 4.81 0 00-.35-.855C11.907 1.175 11.31.84 10.6.84c-.055 0-.11 0-.165.005a1.397 1.397 0 00-.115-.14C10 .355 9.6.185 9.26.2c-1.17.04-2.335.88-3.275 2.37-.66 1.045-1.16 2.36-1.305 3.375-1.335.415-2.265.7-2.285.71-.675.21-.695.23-.78.87C1.555 8.07 0 20.095 0 20.095l12.555 2.155.01-.005 5.59-1.21S15.367 3.44 15.337 3.415zM11.13 2.9l-.94.29c0-.235-.025-.57-.085-.955.52.1.78.685.93 1.06L11.13 2.9zm-1.58.49l-2.01.62c.195-.75.56-1.5 1.01-1.99.165-.18.4-.38.67-.495.26.545.335 1.315.33 1.865zm-1.29-2.36c.22 0 .4.045.555.14-.25.12-.495.31-.73.555-.615.655-1.085 1.67-1.275 2.65l-1.68.52c.33-1.555 1.64-3.82 3.13-3.865z" />
      <path d="M15.237 3.385c-.035.005-1.155.175-1.155.175s-.77-.77-.85-.85a.218.218 0 00-.135-.065v21.61l5.59-1.21S15.897 3.42 15.867 3.395a.097.097 0 00-.1-.03l-.53.02z" opacity="0.6" />
      <path d="M10.6 7.785l-.55 2.04s-.605-.325-1.34-.27c-1.07.075-1.08.74-1.07.91.06.965 2.595 1.175 2.74 3.44.11 1.78-1.14 3-2.975 3.095-2.205.115-3.42-1.16-3.42-1.16l.47-1.975s1.225.925 2.2.865c.64-.04.87-.56.845-.925-.075-1.26-2.14-1.185-2.275-3.255-.115-1.74 1.035-3.505 3.555-3.665.975-.06 1.47.185 1.47.185l.35-.285z" />
    </svg>
  )
}

function BackIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}

function CheckIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function RefreshIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function DownloadIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

interface ShopifyConnectProps {
  onBack?: () => void
}

function ShopifyConnect({ onBack }: ShopifyConnectProps): JSX.Element {
  const [connection, setConnection] = useState<ShopifyConnection | null>(null)
  const [shopDomain, setShopDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const [importing, setImporting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    loadConnection()

    const handleCallback = (_event: unknown, url: string): void => {
      handleShopifyCallback(url)
    }
    window.streamSync.onShopifyCallback?.(handleCallback)
  }, [])

  const loadConnection = async (): Promise<void> => {
    const conn = await window.streamSync.shopifyGetConnection()
    if (conn) {
      setConnection(conn)
    }
  }

  const handleConnect = async (): Promise<void> => {
    if (!shopDomain.trim()) {
      setError('Please enter your Shopify store domain')
      return
    }

    const domain = shopDomain.includes('.myshopify.com')
      ? shopDomain.trim()
      : `${shopDomain.trim()}.myshopify.com`

    setError('')
    setLoading(true)

    try {
      await window.streamSync.shopifyConnect(domain)
    } catch {
      setError('Failed to open Shopify authorization')
    } finally {
      setLoading(false)
    }
  }

  const handleShopifyCallback = async (url: string): Promise<void> => {
    try {
      const parsed = new URL(url)
      const code = parsed.searchParams.get('code')
      const shop = parsed.searchParams.get('shop')

      if (code && shop) {
        const conn: ShopifyConnection = {
          shop,
          accessToken: code,
          shopName: shop.replace('.myshopify.com', ''),
          connectedAt: Date.now()
        }
        await window.streamSync.shopifySaveConnection(conn)
        setConnection(conn)
      }
    } catch {
      setError('Failed to complete Shopify connection')
    }
  }

  const handleDisconnect = async (): Promise<void> => {
    await window.streamSync.shopifyDisconnect()
    setConnection(null)
    setProducts([])
    setImportedCount(0)
  }

  const handleFetchProducts = async (): Promise<void> => {
    setLoading(true)
    setError('')
    try {
      const prods = await window.streamSync.shopifyFetchProducts()
      setProducts(prods)
    } catch {
      setError('Failed to fetch products from Shopify')
    } finally {
      setLoading(false)
    }
  }

  const handleImportProducts = async (): Promise<void> => {
    setImporting(true)
    let imported = 0
    for (const product of products) {
      try {
        await window.streamSync.addProduct({
          name: product.title,
          price: product.price,
          description: product.description,
          buyLink: product.url,
          emoji: 'bag',
          pinned: false
        })
        imported++
      } catch {
        // skip failed
      }
    }
    setImportedCount(imported)
    setImporting(false)
  }

  const handleSyncOrders = async (): Promise<void> => {
    setSyncing(true)
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      await window.streamSync.shopifyFetchOrders(thirtyDaysAgo)
    } catch {
      setError('Failed to sync orders')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
          >
            <BackIcon />
            <span className="text-sm">Back to Products</span>
          </button>
        )}

        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#96bf48]/10 flex items-center justify-center text-[#96bf48]">
            <ShopifyIcon />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Shopify Integration</h1>
        </div>
        <p className="text-text-secondary mb-8 ml-[52px]">
          Connect your Shopify store to import products and sync orders
        </p>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">
            {error}
          </div>
        )}

        {!connection ? (
          <div className="bg-bg-card rounded-xl border border-white/5 p-8">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Connect Your Store</h2>
            <p className="text-text-secondary text-sm mb-6">
              Enter your Shopify store domain to get started. This will open Shopify in your browser to authorize StreamSync.
            </p>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value)}
                  placeholder="mystore"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 text-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                  .myshopify.com
                </span>
              </div>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="px-6 py-3 bg-[#96bf48] rounded-lg text-sm font-bold text-white hover:bg-[#96bf48]/80 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <ShopifyIcon />
                {loading ? 'Connecting...' : 'Connect Shopify'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Connected State */}
            <div className="bg-bg-card rounded-xl border border-white/5 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
                    <CheckIcon />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">Connected</h2>
                    <p className="text-text-secondary text-sm">
                      {connection.shopName} &middot; Connected{' '}
                      {new Date(connection.connectedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={handleFetchProducts}
                disabled={loading}
                className="bg-bg-card rounded-xl border border-white/5 p-5 text-left hover:border-accent/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                    <RefreshIcon />
                  </div>
                  <span className="font-semibold text-text-primary">
                    {loading ? 'Fetching...' : 'Fetch Products'}
                  </span>
                </div>
                <p className="text-text-secondary text-xs">
                  Pull latest products from your Shopify store
                </p>
              </button>

              <button
                onClick={handleSyncOrders}
                disabled={syncing}
                className="bg-bg-card rounded-xl border border-white/5 p-5 text-left hover:border-accent/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                    <DownloadIcon />
                  </div>
                  <span className="font-semibold text-text-primary">
                    {syncing ? 'Syncing...' : 'Sync Orders'}
                  </span>
                </div>
                <p className="text-text-secondary text-xs">
                  Import order data for revenue analytics (last 30 days)
                </p>
              </button>
            </div>

            {/* Product Preview */}
            {products.length > 0 && (
              <div className="bg-bg-card rounded-xl border border-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-text-primary">
                    {products.length} Products Found
                  </h3>
                  <button
                    onClick={handleImportProducts}
                    disabled={importing}
                    className="px-4 py-2 bg-accent rounded-lg text-sm font-bold text-white hover:bg-accent/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <DownloadIcon />
                    {importing
                      ? 'Importing...'
                      : importedCount > 0
                        ? `Imported ${importedCount}`
                        : 'Import All to StreamSync'}
                  </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-lg border border-white/5"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-text-secondary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {product.title}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {product.variants.length} variant
                          {product.variants.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="text-accent font-bold text-sm">${product.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ShopifyConnect
