import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode
} from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
}

type ToastInput = Omit<Toast, 'id'>

interface ToastContextValue {
  toasts: Toast[]
  showToast: (toast: ToastInput) => void
  dismissToast: (id: string) => void
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue | null>(null)

/* ------------------------------------------------------------------ */
/*  Global imperative API (usable outside React tree)                  */
/* ------------------------------------------------------------------ */

let globalShowToast: ((toast: ToastInput) => void) | null = null

/**
 * Imperative toast function. Works anywhere after `<ToastProvider>` mounts.
 * Usage: `toast({ type: 'success', title: 'Product added' })`
 */
export function toast(input: ToastInput): void {
  if (globalShowToast) {
    globalShowToast(input)
  } else {
    console.warn('[Toaster] toast() called before ToastProvider mounted')
  }
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>')
  }
  return ctx
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

const MAX_VISIBLE = 3
const DEFAULT_DURATION = 4000

let idCounter = 0
function nextId(): string {
  idCounter += 1
  return `toast-${idCounter}-${Date.now()}`
}

export function ToastProvider({ children }: { children: ReactNode }): JSX.Element {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (input: ToastInput) => {
      const id = nextId()
      const duration = input.duration ?? DEFAULT_DURATION

      setToasts((prev) => {
        const updated = [...prev, { ...input, id }]
        // If exceeding max, auto-dismiss the oldest
        if (updated.length > MAX_VISIBLE) {
          const oldest = updated[0]
          setTimeout(() => dismissToast(oldest.id), 0)
        }
        return updated
      })

      const timer = setTimeout(() => dismissToast(id), duration)
      timersRef.current.set(id, timer)
    },
    [dismissToast]
  )

  // Register global imperative API
  useEffect(() => {
    globalShowToast = showToast
    return () => {
      globalShowToast = null
    }
  }, [showToast])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/*  Toast Container (renders in top-right corner)                      */
/* ------------------------------------------------------------------ */

const borderColors: Record<Toast['type'], string> = {
  success: '#22c55e',
  error: '#ef4444',
  info: '#3b82f6',
  warning: '#f97316'
}

function ToastContainer({
  toasts,
  onDismiss
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}): JSX.Element {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Single Toast Item                                                  */
/* ------------------------------------------------------------------ */

function ToastItem({
  toast: t,
  onDismiss
}: {
  toast: Toast
  onDismiss: (id: string) => void
}): JSX.Element {
  const [isExiting, setIsExiting] = useState(false)

  function handleDismiss(): void {
    setIsExiting(true)
    setTimeout(() => onDismiss(t.id), 200)
  }

  return (
    <div
      className="pointer-events-auto w-80 bg-[#1a1f35] border border-white/10 rounded-lg shadow-xl overflow-hidden"
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: borderColors[t.type],
        animation: isExiting ? 'toastSlideOut 0.2s ease-in forwards' : 'toastSlideIn 0.3s ease-out'
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="mt-0.5 shrink-0">
          <TypeIcon type={t.type} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#f1f5f9]">{t.title}</p>
          {t.message && (
            <p className="text-xs text-[#94a3b8] mt-0.5 leading-relaxed">{t.message}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/5 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastSlideOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Type-based Icons                                                   */
/* ------------------------------------------------------------------ */

function TypeIcon({ type }: { type: Toast['type'] }): JSX.Element {
  const color = borderColors[type]
  switch (type) {
    case 'success':
      return (
        <svg className="w-4.5 h-4.5" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )
    case 'error':
      return (
        <svg className="w-4.5 h-4.5" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
        </svg>
      )
    case 'warning':
      return (
        <svg className="w-4.5 h-4.5" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.9A1 1 0 002.56 20h16.88a1 1 0 00.87-1.24l-8.6-14.9a1 1 0 00-1.72 0z" />
        </svg>
      )
    case 'info':
    default:
      return (
        <svg className="w-4.5 h-4.5" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
        </svg>
      )
  }
}

export default ToastProvider
