import { useState, useEffect, useRef } from 'react'
import type { Platform } from '../lib/scrapers'

interface StreamControlsProps {
  isLive: boolean
  onGoLive: () => void
  onEndStream: () => void
  viewerCount: number
  activePlatforms: Platform[]
  isDemoMode?: boolean
  rtmpStatuses?: RTMPStatus[]
}

const PLATFORM_CONFIG: Record<string, { name: string; color: string }> = {
  tiktok: { name: 'TikTok', color: '#ff0050' },
  youtube: { name: 'YouTube', color: '#ff0000' },
  instagram: { name: 'Instagram', color: '#e1306c' },
  facebook: { name: 'Facebook', color: '#1877f2' }
}

function StreamControls({
  isLive,
  onGoLive,
  onEndStream,
  viewerCount,
  activePlatforms,
  isDemoMode,
  rtmpStatuses = []
}: StreamControlsProps): JSX.Element {
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
    <div className="h-14 bg-bg-secondary/80 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-5 shrink-0">
      {/* Left: Platform status pills + timer */}
      <div className="flex items-center gap-4 min-w-[220px]">
        {isLive && (
          <div className="flex items-center gap-1.5 animate-pulseGlow rounded-md px-2.5 py-1 bg-danger/10">
            <div className="w-2 h-2 rounded-full bg-danger" />
            <span className="text-[11px] font-bold text-danger tracking-wider">LIVE</span>
          </div>
        )}
        <span className="text-sm font-mono text-text-secondary tabular-nums tracking-wider">
          {formatTime(elapsed)}
        </span>
        {/* Platform pills */}
        <div className="flex items-center gap-1.5">
          {activePlatforms.map((platform) => {
            const config = PLATFORM_CONFIG[platform]
            const rtmp = rtmpStatuses.find((s) => s.platform === platform)
            const rtmpLive = rtmp?.status === 'live'
            const rtmpConnecting = rtmp?.status === 'connecting'
            const rtmpError = rtmp?.status === 'error'
            return (
              <div
                key={platform}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold"
                style={{
                  backgroundColor: config.color + '12',
                  color: isLive ? config.color : '#94a3b8'
                }}
                title={rtmpError ? `RTMP Error: ${rtmp?.error}` : rtmpLive ? 'RTMP streaming' : ''}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${rtmpConnecting ? 'animate-pulse' : ''}`}
                  style={{
                    backgroundColor: rtmpError ? '#ef4444' : (isLive ? '#22c55e' : '#374151')
                  }}
                />
                {config.name}
                {rtmpLive && (
                  <svg className="w-2.5 h-2.5 text-success" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728" stroke="currentColor" fill="none" strokeWidth={3} strokeLinecap="round" />
                  </svg>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Center: Go Live / End Stream */}
      <div className="flex items-center gap-3">
        {isDemoMode && isLive && (
          <span className="text-[10px] text-text-secondary bg-white/5 px-2.5 py-1 rounded-full">
            Demo Mode
          </span>
        )}
        {isLive ? (
          <button
            onClick={onEndStream}
            className="px-7 py-2 bg-danger/90 rounded-lg text-white text-sm font-bold hover:bg-danger transition-all flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            End Stream
          </button>
        ) : (
          <button
            onClick={onGoLive}
            className="px-7 py-2 bg-accent rounded-lg text-white text-sm font-bold hover:bg-accent/90 transition-all flex items-center gap-2 shadow-lg shadow-accent/25"
          >
            <div className="w-3 h-3 rounded-full bg-white/90" />
            Go Live
          </button>
        )}
      </div>

      {/* Right: Viewer count */}
      <div className="flex items-center gap-2 text-text-secondary min-w-[220px] justify-end">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="text-sm font-semibold tabular-nums">{viewerCount.toLocaleString()}</span>
        <span className="text-xs text-text-secondary/60">viewers</span>
      </div>
    </div>
  )
}

export default StreamControls
