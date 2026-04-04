import { useState, useEffect, useCallback } from 'react'
import ProductModal from '../components/ProductModal'

function getCategoryIcon(iconId: string): JSX.Element {
  switch (iconId) {
    case 'shirt':
      return (
        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 0012 12a6 6 0 005.566-4.897l.319-1.913M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
        </svg>
      )
    case 'tech':
      return (
        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    case 'beauty':
      return (
        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      )
    case 'bag':
      return (
        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    case 'jewelry':
      return (
        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        </svg>
      )
    case 'watch':
      return (
        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    default:
      return (
        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
  }
}

function Products(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([])
  const [showModal, setShowModal] = useState(false)

  const loadProducts = useCallback(async () => {
    const prods = await window.streamSync.getProducts()
    setProducts(prods)
  }, [])

  useEffect(() => {
    loadProducts()
    window.streamSync.onProductsUpdated(() => loadProducts())
  }, [loadProducts])

  const handleAddProduct = async (product: Omit<Product, 'id' | 'pinned'>): Promise<void> => {
    await window.streamSync.addProduct({ ...product, pinned: false })
    setShowModal(false)
    loadProducts()
  }

  const handleRemove = async (id: string): Promise<void> => {
    await window.streamSync.removeProduct(id)
    loadProducts()
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">Products</h1>
            <p className="text-text-secondary">Manage products to showcase during live streams</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-accent rounded-lg text-sm font-bold text-white hover:bg-accent/80 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Add Product Card */}
          <button
            onClick={() => setShowModal(true)}
            className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-accent/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
              <svg className="w-6 h-6 text-text-secondary group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Add Product</span>
          </button>

          {products.map((product) => (
            <div key={product.id} className="bg-bg-card rounded-xl border border-white/5 p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  {getCategoryIcon(product.emoji)}
                </div>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-danger transition-all p-1.5 rounded-lg hover:bg-danger/10"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <h3 className="font-semibold text-text-primary mb-1">{product.name}</h3>
              <p className="text-accent text-lg font-bold mb-2">${product.price.toFixed(2)}</p>
              {product.description && (
                <p className="text-sm text-text-secondary line-clamp-2">{product.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <ProductModal onSave={handleAddProduct} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}

export default Products
