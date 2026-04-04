import { useState } from 'react'

interface ProductModalProps {
  onSave: (product: Omit<Product, 'id' | 'pinned'>) => void
  onClose: () => void
  editProduct?: Product | null
}

const CATEGORY_ICONS: { id: string; label: string; icon: (active: boolean) => JSX.Element }[] = [
  {
    id: 'shopping',
    label: 'General',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )
  },
  {
    id: 'shirt',
    label: 'Clothing',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 0012 12a6 6 0 005.566-4.897l.319-1.913M6.115 5.19A8.965 8.965 0 0112 3c2.09 0 4.028.713 5.566 1.908M3 7l3.115-1.81M21 7l-3.115-1.81M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
      </svg>
    )
  },
  {
    id: 'shoe',
    label: 'Footwear',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 'bag',
    label: 'Bags',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  },
  {
    id: 'tech',
    label: 'Tech',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 'beauty',
    label: 'Beauty',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    )
  },
  {
    id: 'jewelry',
    label: 'Jewelry',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </svg>
    )
  },
  {
    id: 'watch',
    label: 'Watches',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'headphones',
    label: 'Audio',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
      </svg>
    )
  },
  {
    id: 'skincare',
    label: 'Skincare',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  },
  {
    id: 'glasses',
    label: 'Eyewear',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  },
  {
    id: 'home',
    label: 'Home',
    icon: (active) => (
      <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  }
]

function ProductModal({ onSave, onClose, editProduct }: ProductModalProps): JSX.Element {
  const [name, setName] = useState(editProduct?.name || '')
  const [price, setPrice] = useState(editProduct?.price?.toString() || '')
  const [description, setDescription] = useState(editProduct?.description || '')
  const [buyLink, setBuyLink] = useState(editProduct?.buyLink || '')
  const [selectedIcon, setSelectedIcon] = useState(editProduct?.emoji || 'shopping')

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!name || !price) return
    onSave({
      name,
      price: parseFloat(price),
      description,
      buyLink,
      emoji: selectedIcon
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-bg-card rounded-2xl border border-white/10 w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-text-primary">
            {editProduct ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Icon Picker */}
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-2">Category</label>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORY_ICONS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedIcon(cat.id)}
                  title={cat.label}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    selectedIcon === cat.id
                      ? 'bg-accent/15 ring-1.5 ring-accent'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {cat.icon(selectedIcon === cat.id)}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1.5">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Dress"
              className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent/50 transition-colors"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1.5">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="29.99"
              step="0.01"
              min="0"
              className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent/50 transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief product description..."
              rows={2}
              className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent/50 resize-none transition-colors"
            />
          </div>

          {/* Buy Link */}
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1.5">Buy Link</label>
            <input
              type="url"
              value={buyLink}
              onChange={(e) => setBuyLink(e.target.value)}
              placeholder="https://..."
              className="w-full bg-bg-primary border border-white/10 rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent/50 transition-colors"
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
