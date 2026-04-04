import { useState, useRef, useEffect } from 'react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
}

type FeedbackCategory = 'bug' | 'feature' | 'general' | 'other'

interface FeedbackData {
  category: FeedbackCategory
  subject: string
  description: string
  email: string
  attachScreenshot: boolean
  timestamp: number
}

const categories: { id: FeedbackCategory; label: string; icon: () => JSX.Element }[] = [
  { id: 'bug', label: 'Bug Report', icon: BugIcon },
  { id: 'feature', label: 'Feature Request', icon: LightbulbIcon },
  { id: 'general', label: 'General Feedback', icon: ChatIcon },
  { id: 'other', label: 'Other', icon: DotsIcon }
]

function FeedbackModal({ isOpen, onClose, userEmail }: FeedbackModalProps): JSX.Element {
  const [category, setCategory] = useState<FeedbackCategory>('general')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState(userEmail || '')
  const [attachScreenshot, setAttachScreenshot] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      // Reset on close after a short delay so the closing animation plays with current content
      const timer = setTimeout(() => {
        setCategory('general')
        setSubject('')
        setDescription('')
        setEmail(userEmail || '')
        setAttachScreenshot(false)
        setSubmitted(false)
        setSubmitting(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, userEmail])

  function handleBackdropClick(e: React.MouseEvent): void {
    if (e.target === backdropRef.current) {
      onClose()
    }
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) return

    setSubmitting(true)

    const feedback: FeedbackData = {
      category,
      subject: subject.trim(),
      description: description.trim(),
      email: email.trim(),
      attachScreenshot,
      timestamp: Date.now()
    }

    // MVP: log to console and store locally
    console.log('[StreamSync Feedback]', feedback)

    try {
      const existing = JSON.parse(localStorage.getItem('streamsync_feedback') || '[]') as FeedbackData[]
      existing.push(feedback)
      localStorage.setItem('streamsync_feedback', JSON.stringify(existing))
    } catch {
      // Storage might be unavailable; non-critical
    }

    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 600)
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`w-full max-w-lg bg-[#0a0e1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-base font-semibold text-[#f1f5f9]">
            {submitted ? 'Feedback Sent' : 'Send Feedback'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/5 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="px-6 py-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#22c55e]/10 flex items-center justify-center mb-4">
              <CheckIcon />
            </div>
            <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">Thank you!</h3>
            <p className="text-sm text-[#94a3b8] max-w-xs">
              We&apos;ll get back to you within 24 hours. Your feedback helps us make StreamSync better for everyone.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-[#f97316] hover:bg-[#f97316]/90 rounded-lg text-sm font-semibold text-white transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const selected = category === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                        selected
                          ? 'border-[#f97316]/50 bg-[#f97316]/10 text-[#f97316]'
                          : 'border-white/10 bg-[#1a1f35] text-[#94a3b8] hover:border-white/20 hover:text-[#f1f5f9]'
                      }`}
                    >
                      <cat.icon />
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your feedback"
                required
                className="w-full px-3 py-2.5 bg-[#1a1f35] border border-white/10 rounded-lg text-sm text-[#f1f5f9] placeholder-[#94a3b8]/60 focus:outline-none focus:border-[#f97316]/50 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us more details..."
                required
                className="w-full px-3 py-2.5 bg-[#1a1f35] border border-white/10 rounded-lg text-sm text-[#f1f5f9] placeholder-[#94a3b8]/60 focus:outline-none focus:border-[#f97316]/50 transition-colors resize-none"
              />
            </div>

            {/* Screenshot toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAttachScreenshot(!attachScreenshot)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  attachScreenshot ? 'bg-[#f97316]' : 'bg-white/10'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    attachScreenshot ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm text-[#94a3b8]">Attach screenshot</span>
              <CameraIcon />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 bg-[#1a1f35] border border-white/10 rounded-lg text-sm text-[#f1f5f9] placeholder-[#94a3b8]/60 focus:outline-none focus:border-[#f97316]/50 transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !subject.trim() || !description.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f97316] hover:bg-[#f97316]/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white transition-colors"
            >
              {submitting ? (
                <SpinnerIcon />
              ) : (
                <SendIcon />
              )}
              <span>{submitting ? 'Sending...' : 'Send Feedback'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

/* ---- SVG Icons ---- */

function CloseIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function CheckIcon(): JSX.Element {
  return (
    <svg className="w-7 h-7 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function BugIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function LightbulbIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
}

function ChatIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function DotsIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01" />
    </svg>
  )
}

function CameraIcon(): JSX.Element {
  return (
    <svg className="w-3.5 h-3.5 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

function SendIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )
}

function SpinnerIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default FeedbackModal
