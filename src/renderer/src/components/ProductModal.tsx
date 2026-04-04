import { useState } from 'react'

interface ProductModalProps {
  onSave: (product: Omit<Product, 'id' | 'pinned'>) => void
  onClose: () => void
  editProduct?: Product | null
}

const EMOJIS = ['🛍️', '👕', '👗', '👟', '💄', '🎧', '⌚', '📱', '🎒', '💍', '🧴', '🕶️']

function ProductModal({ onSave, onClose, editProduct }: ProductModalProps): JSX.Element {
  const [name, setName] = useState(editProduct?.name || '')
  const [price, setPrice] = useState(editProduct?.price?.toString() || '')
  const [description, setDescription] = useState(editProduct?.description || '')
  const [buyLink, setBuyLink] = useState(editProduct?.buyLink || '')
  const [emoji, setEmoji] = useState(editProduct?.emoji || '🛍️')

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!name || !price) return
    onSave({
      name,
      price: parseFloat(price),
      description,
      buyLink,
      emoji
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-bg-card rounded-2xl border border-white/10 w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-text-primary mb-5">
          {editProduct ? 'Edit Product' : 'Add Product'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji Picker */}
          <div>
            <label className="text-xs text-text-secondary block mb-2">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    emoji === e ? 'bg-accent/20 ring-2 ring-accent' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-text-secondary block mb-1.5">Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Dress"
              className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent/50"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-xs text-text-secondary block mb-1.5">Price *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="29.99"
              step="0.01"
              min="0"
              className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent/50"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-text-secondary block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief product description..."
              rows={2}
              className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent/50 resize-none"
            />
          </div>

          {/* Buy Link */}
          <div>
            <label className="text-xs text-text-secondary block mb-1.5">Buy Link</label>
            <input
              type="url"
              value={buyLink}
              onChange={(e) => setBuyLink(e.target.value)}
              placeholder="https://..."
              className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-white/5 rounded-lg text-sm font-medium text-text-secondary hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-accent rounded-lg text-sm font-bold text-white hover:bg-accent/80 transition-colors"
            >
              {editProduct ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductModal
