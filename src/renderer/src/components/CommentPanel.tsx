import { useRef, useEffect, useState } from 'react'

interface CommentPanelProps {
  comments: Comment[]
}

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#ff0050',
  youtube: '#ff0000',
  instagram: '#e1306c',
  facebook: '#1877f2'
}

const PLATFORM_NAMES: Record<string, string> = {
  tiktok: 'TT',
  youtube: 'YT',
  instagram: 'IG',
  facebook: 'FB'
}

function CommentPanel({ comments }: CommentPanelProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAutoScroll, setIsAutoScroll] = useState(true)

  useEffect(() => {
    if (scrollRef.current && isAutoScroll) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [comments, isAutoScroll])

  const handleScroll = (): void => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80
    setIsAutoScroll(isNearBottom)
  }

  if (comments.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-text-secondary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary/60">Comments will appear here when you go live</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Auto-scroll paused indicator */}
      {!isAutoScroll && (
        <button
          onClick={() => {
            setIsAutoScroll(true)
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight
            }
          }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 bg-accent/90 text-white text-[10px] font-semibold rounded-full shadow-lg shadow-accent/20 hover:bg-accent transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          New comments
        </button>
      )}

      <div
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`group px-3 py-2.5 rounded-xl transition-all animate-fadeIn ${
              comment.isBuyingSignal
                ? 'bg-accent/[0.06] border-l-[3px] border-l-accent'
                : 'hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {/* Avatar with platform color */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                style={{ backgroundColor: PLATFORM_COLORS[comment.platform] }}
              >
                {comment.user[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                {/* Name row */}
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-semibold text-text-primary truncate">
                    {comment.user}
                  </span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 uppercase tracking-wider"
                    style={{
                      backgroundColor: PLATFORM_COLORS[comment.platform] + '18',
                      color: PLATFORM_COLORS[comment.platform]
                    }}
                  >
                    {PLATFORM_NAMES[comment.platform]}
                  </span>
                  {comment.isBuyingSignal && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-accent/15 text-accent font-bold shrink-0 flex items-center gap-1 tracking-wider">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                      SIGNAL
                    </span>
                  )}
                </div>
                {/* Comment text — larger and more readable */}
                <p className="text-[13px] leading-relaxed text-text-primary/85">{comment.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CommentPanel
