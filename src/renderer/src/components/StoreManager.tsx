import { useState } from 'react'

interface StoreConfig {
  id: string
  name: string
  platform: 'shopify' | 'woocommerce' | 'manual'
  productCount: number
  connectedAt: number
  isActive: boolean
}

interface StoreManagerProps {
  stores: StoreConfig[]
  activeStore: string
  onSwitch: (id: string) => void
  onAdd: (store: Omit<StoreConfig, 'id' | 'productCount' | 'connectedAt' | 'isActive'>) => void
  onDelete: (id: string) => void
  requireEnterprise?: boolean
}

const platformLabels: Record<StoreConfig['platform'], string> = {
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  manual: 'Manual'
}

const platformColors: Record<StoreConfig['platform'], string> = {
  shopify: '#96bf48',
  woocommerce: '#7f54b3',
  manual: '#f97316'
}

export default function StoreManager({
  stores,
  activeStore,
  onSwitch,
  onAdd,
  onDelete,
  requireEnterprise
}: StoreManagerProps): JSX.Element {
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formPlatform, setFormPlatform] = useState<StoreConfig['platform']>('manual')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  if (requireEnterprise) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-slate-400 text-sm">Multi-Store requires an Enterprise plan.</p>
        </div>
      </div>
    )
  }

  const handleAdd = (): void => {
    if (!formName.trim()) return
    onAdd({ name: formName.trim(), platform: formPlatform })
    setFormName('')
    setFormPlatform('manual')
    setShowForm(false)
  }

  const handleDelete = (id: string): void => {
    if (deleteConfirm === id) {
      onDelete(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Store Manager</h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage multiple product catalogs across different platforms.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#f97316] text-white rounded-lg text-sm font-medium hover:bg-[#ea580c] transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Store'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#1a1f35] rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Store Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="My Shopify Store"
              className="w-full bg-[#111827] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f97316]"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Platform</label>
            <select
              value={formPlatform}
              onChange={(e) => setFormPlatform(e.target.value as StoreConfig['platform'])}
              className="w-full bg-[#111827] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[#f97316]"
            >
              <option value="manual">Manual</option>
              <option value="shopify">Shopify</option>
              <option value="woocommerce">WooCommerce</option>
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={!formName.trim()}
            className="px-5 py-2 bg-[#f97316] text-white rounded-lg text-sm font-medium hover:bg-[#ea580c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Store
          </button>
        </div>
      )}

      {/* Store list */}
      {stores.length === 0 ? (
        <div className="bg-[#1a1f35] rounded-xl p-10 text-center">
          <svg
            className="w-10 h-10 mx-auto mb-3 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p className="text-slate-400 text-sm">No stores configured yet. Add your first store.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stores.map((s) => (
            <div
              key={s.id}
              className={`bg-[#1a1f35] rounded-xl p-4 flex items-center justify-between border ${
                s.id === activeStore ? 'border-[#f97316]/40' : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Active indicator */}
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    s.id === activeStore ? 'bg-[#22c55e]' : 'bg-slate-600'
                  }`}
                />
                <div>
                  <p className="text-slate-200 font-medium">{s.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${platformColors[s.platform]}15`,
                        color: platformColors[s.platform]
                      }}
                    >
                      {platformLabels[s.platform]}
                    </span>
                    <span className="text-xs text-slate-500">
                      {s.productCount} products
                    </span>
                    <span className="text-xs text-slate-500">
                      Connected {new Date(s.connectedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {s.id !== activeStore && (
                  <button
                    onClick={() => onSwitch(s.id)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-[#111827] text-slate-300 hover:bg-[#252b45] transition-colors"
                  >
                    Switch
                  </button>
                )}
                <button
                  onClick={() => handleDelete(s.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    deleteConfirm === s.id
                      ? 'bg-[#ef4444] text-white'
                      : 'bg-[#111827] text-slate-400 hover:text-[#ef4444]'
                  }`}
                >
                  {deleteConfirm === s.id ? 'Confirm Delete' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
