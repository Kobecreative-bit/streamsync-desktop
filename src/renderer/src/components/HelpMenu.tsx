import { useState, useRef, useEffect } from 'react'

interface HelpMenuProps {
  isOpen: boolean
  onClose: () => void
  plan: 'starter' | 'pro' | 'enterprise'
}

interface HelpArticle {
  id: string
  title: string
  content: string
}

const helpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content:
      'StreamSync lets you go live on TikTok, YouTube, Instagram, and Facebook simultaneously from one desktop app. Sign in to each platform on the Go Live page, add your products, and start streaming.'
  },
  {
    id: 'going-live',
    title: 'Going Live',
    content:
      'Navigate to the Go Live page to see all four platform panels. Log into each account directly in the embedded browser, then click "Go Live" on each platform you want to stream on. StreamSync keeps all sessions running side by side.'
  },
  {
    id: 'adding-products',
    title: 'Adding Products',
    content:
      'Go to the Products page to add items you want to showcase during your stream. Each product can have a name, price, description, and buy link. Pin a product to display it as an overlay on all active streams.'
  },
  {
    id: 'ai-copilot',
    title: 'AI Copilot',
    content:
      'The AI Copilot monitors your live chat across all platforms for buying signals like "how much" or "where to buy." It highlights these comments and suggests quick replies so you never miss a potential sale.'
  },
  {
    id: 'billing',
    title: 'Billing',
    content:
      'Manage your subscription from the Settings page. StreamSync offers Starter, Pro, and Enterprise plans. Upgrade anytime to unlock more platforms, AI features, and priority support.'
  }
]

const supportTiers: Record<
  'starter' | 'pro' | 'enterprise',
  { label: string; detail: string }
> = {
  starter: {
    label: 'Email Support',
    detail: 'hello@streamsync.live'
  },
  pro: {
    label: 'Priority Support',
    detail: 'priority@streamsync.live'
  },
  enterprise: {
    label: '24/7 Phone Support',
    detail: '+1 (888) 555-0123'
  }
}

function HelpMenu({ isOpen, onClose, plan }: HelpMenuProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setExpandedId(null)
      setShowFeedback(false)
    }
  }, [isOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const filteredArticles = helpArticles.filter(
    (a) =>
      !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const support = supportTiers[plan]

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-out panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 z-50 h-full w-[380px] max-w-full bg-[#0a0e1a] border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <HelpCircleIcon />
            <h2 className="text-base font-semibold text-[#f1f5f9]">Help Center</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/5 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#1a1f35] border border-white/10 rounded-lg text-sm text-[#f1f5f9] placeholder-[#94a3b8] focus:outline-none focus:border-[#f97316]/50 transition-colors"
            />
          </div>
        </div>

        {/* Articles */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
            Quick Links
          </p>
          <div className="space-y-1.5">
            {filteredArticles.length === 0 && (
              <p className="text-sm text-[#94a3b8] py-4 text-center">
                No articles match your search.
              </p>
            )}
            {filteredArticles.map((article) => {
              const expanded = expandedId === article.id
              return (
                <div key={article.id}>
                  <button
                    onClick={() => setExpandedId(expanded ? null : article.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#f1f5f9] hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ArticleIcon />
                      <span>{article.title}</span>
                    </div>
                    <ChevronIcon expanded={expanded} />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="px-3 pb-3 pl-10 text-sm text-[#94a3b8] leading-relaxed">
                      {article.content}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contact Support */}
        <div className="border-t border-white/10 px-5 py-4 space-y-3">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
            Contact Support
          </p>
          <div className="flex items-center gap-3 px-3 py-2.5 bg-[#1a1f35] rounded-lg">
            <SupportIcon />
            <div>
              <p className="text-sm font-medium text-[#f1f5f9]">{support.label}</p>
              <p className="text-xs text-[#94a3b8]">{support.detail}</p>
            </div>
          </div>

          <button
            onClick={() => setShowFeedback(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f97316] hover:bg-[#f97316]/90 rounded-lg text-sm font-semibold text-white transition-colors"
          >
            <FeedbackIcon />
            <span>Send Feedback</span>
          </button>
        </div>
      </div>

      {/* Inline FeedbackModal trigger — imported by parent, here we just expose the state */}
      {showFeedback && (
        <FeedbackTrigger onClose={() => setShowFeedback(false)} />
      )}
    </>
  )
}

// Minimal placeholder: the real FeedbackModal is a separate component.
// When integrating, replace this with `<FeedbackModal isOpen={showFeedback} onClose=... />`
function FeedbackTrigger({ onClose }: { onClose: () => void }): JSX.Element {
  // This renders a quick portal to the FeedbackModal. In a real integration,
  // the parent would manage state and render FeedbackModal directly.
  // For standalone usage we import it lazily.
  const [FeedbackModal, setFeedbackModal] = useState<React.ComponentType<{
    isOpen: boolean
    onClose: () => void
    userEmail?: string
  }> | null>(null)

  useEffect(() => {
    import('./FeedbackModal').then((mod) => {
      setFeedbackModal(() => mod.default)
    })
  }, [])

  if (!FeedbackModal) return <></>
  return <FeedbackModal isOpen onClose={onClose} />
}

/* ---- SVG Icons ---- */

function HelpCircleIcon(): JSX.Element {
  return (
    <svg
      className="w-5 h-5 text-[#f97316]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <circle cx="12" cy="12" r="10" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
      />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function CloseIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={`w-4 h-4 ${className || ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function ArticleIcon(): JSX.Element {
  return (
    <svg
      className="w-4 h-4 text-[#94a3b8] shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }): JSX.Element {
  return (
    <svg
      className={`w-4 h-4 text-[#94a3b8] transition-transform duration-200 ${
        expanded ? 'rotate-180' : ''
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function SupportIcon(): JSX.Element {
  return (
    <svg
      className="w-5 h-5 text-[#f97316] shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.364 5.636a9 9 0 11-12.728 0M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v3m0 0h.01" />
    </svg>
  )
}

function FeedbackIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  )
}

export default HelpMenu
