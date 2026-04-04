import { useState, useEffect, useRef } from 'react'

interface StreamControlsProps {
  isLive: boolean
  onGoLive: () => void
  onEndStream: () => void
  viewerCount: number
}

function StreamControls({ isLive, onGoLive, onEndStream, viewerCount }: StreamControlsProps): JSX.Element {
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isLive) {
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setElapsed(0)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isLive])

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-14 bg-bg-secondary/80 border-t border-white/5 flex items-center justify-between px-4 shrink-0">
      {/* Left: Live indicator + timer */}
      <div className="flex items-center gap-3">
        {isLive && (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
            <span className="text-xs font-bold text-danger">LIVE</span>
          </div>
        )}
        <span className="text-sm font-mono text-text-secondary">
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Center: Go Live / End Stream */}
      <div>
        {isLive ? (
          <button
            onClick={onEndStream}
            className="px-6 py-2 bg-danger rounded-lg text-white text-sm font-bold hover:bg-danger/80 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            End Stream
          </button>
        ) : (
          <button
            onClick={onGoLive}
            className="px-6 py-2 bg-accent rounded-lg text-white text-sm font-bold hover:bg-accent/80 transition-all flex items-center gap-2 shadow-lg shadow-accent/25"
          >
            <div className="w-3 h-3 rounded-full bg-white" />
            Go Live
          </button>
        )}
      </div>

      {/* Right: Viewer count */}
      <div className="flex items-center gap-2 text-text-secondary">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="text-sm font-medium">{viewerCount.toLocaleString()}</span>
      </div>
    </div>
  )
}

export default StreamControls
