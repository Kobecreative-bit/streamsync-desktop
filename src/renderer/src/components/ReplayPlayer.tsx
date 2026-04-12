import { useState, useEffect, useRef, useCallback } from 'react'

interface ReplayMeta {
  id: string
  name: string
  startTime: number
  endTime: number
  duration: number
  frameCount: number
  platforms: string[]
  thumbnailPath: string
  pinnedProduct: { name: string; price: number } | null
}

interface ReplayPlayerProps {
  replay: ReplayMeta
  frames: string[]
  onClose: () => void
}

const SPEEDS = [0.5, 1, 2, 4]
const BASE_INTERVAL = 2000

function ReplayPlayer({ replay, frames, onClose }: ReplayPlayerProps): JSX.Element {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [frameImages, setFrameImages] = useState<Record<number, string>>({})
  const [isDragging, setIsDragging] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrubberRef = useRef<HTMLDivElement>(null)

  // Load frame images as base64 via IPC
  useEffect(() => {
    let cancelled = false

    async function loadFrames(): Promise<void> {
      const loaded: Record<number, string> = {}
      for (let i = 0; i < frames.length; i++) {
        if (cancelled) break
        try {
          const base64 = await window.streamSync.replayGetFrameBase64(frames[i])
          loaded[i] = `data:image/jpeg;base64,${base64}`
          if (i % 10 === 0 || i === frames.length - 1) {
            setFrameImages({ ...loaded })
          }
        } catch {
          // Skip failed frames
        }
      }
      if (!cancelled) {
        setFrameImages({ ...loaded })
      }
    }

    loadFrames()
    return (): void => {
      cancelled = true
    }
  }, [frames])

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= frames.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, BASE_INTERVAL / speed)
    }

    return (): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, speed, frames.length])

  const togglePlay = useCallback((): void => {
    if (currentFrame >= frames.length - 1) {
      setCurrentFrame(0)
      setIsPlaying(true)
    } else {
      setIsPlaying((p) => !p)
    }
  }, [currentFrame, frames.length])

  const handleScrub = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!scrubberRef.current || frames.length === 0) return
      const rect = scrubberRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
      const ratio = x / rect.width
      const frame = Math.round(ratio * (frames.length - 1))
      setCurrentFrame(frame)
    },
    [frames.length]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      setIsDragging(true)
      setIsPlaying(false)
      handleScrub(e)
    },
    [handleScrub]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (isDragging) {
        handleScrub(e)
      }
    },
    [isDragging, handleScrub]
  )

  const handleMouseUp = useCallback((): void => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    const up = (): void => setIsDragging(false)
    window.addEventListener('mouseup', up)
    return (): void => window.removeEventListener('mouseup', up)
  }, [])

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  const progress = frames.length > 1 ? (currentFrame / (frames.length - 1)) * 100 : 0

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-bg-primary/80 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
            />
          </svg>
          <h2 className="text-text-primary font-semibold">{replay.name}</h2>
          <span className="text-text-secondary text-sm ml-2">
            {formatTime(replay.duration)}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <svg
            className="w-5 h-5 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Frame display */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {frameImages[currentFrame] ? (
          <img
            src={frameImages[currentFrame]}
            alt={`Frame ${currentFrame + 1}`}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-text-secondary">
            <svg
              className="w-12 h-12 animate-spin text-accent"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Loading frames...</span>
          </div>
        )}

        {/* Product overlay */}
        {replay.pinnedProduct && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-bg-card/90 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3 flex items-center gap-4">
            <div>
              <p className="text-text-primary font-medium text-sm">
                {replay.pinnedProduct.name}
              </p>
              <p className="text-accent font-bold">${replay.pinnedProduct.price.toFixed(2)}</p>
            </div>
            <div className="px-3 py-1.5 bg-accent/20 text-accent rounded-lg text-xs font-medium">
              Pinned Product
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-bg-primary/80 backdrop-blur-sm border-t border-white/5 px-6 py-4 space-y-3">
        {/* Scrubber */}
        <div
          ref={scrubberRef}
          className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            className="absolute top-0 left-0 h-full bg-accent rounded-full transition-[width] duration-75"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>

        {/* Buttons row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-accent to-accent2 hover:opacity-90 flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Speed selector */}
            <div className="flex items-center gap-1">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    speed === s
                      ? 'bg-accent/20 text-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Frame counter & duration */}
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>
              Frame {currentFrame + 1} / {frames.length}
            </span>
            <span>
              {formatTime((currentFrame * BASE_INTERVAL))} /{' '}
              {formatTime(frames.length * BASE_INTERVAL)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReplayPlayer
