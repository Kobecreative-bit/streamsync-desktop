import { useState, useEffect, useCallback } from 'react'
import ProductModal from '../components/ProductModal'

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
            className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-accent/30 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm text-text-secondary">Add Product</span>
          </button>

          {products.map((product) => (
            <div key={product.id} className="bg-bg-card rounded-xl border border-white/5 p-5 group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{product.emoji || '🛍️'}</span>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="opacity-0 group-hover:opacity-100 text-danger/60 hover:text-danger transition-all p-1"
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
