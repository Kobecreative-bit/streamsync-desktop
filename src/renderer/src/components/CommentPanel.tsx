import { useRef, useEffect } from 'react'

interface CommentPanelProps {
  comments: Comment[]
}

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#ff0050',
  youtube: '#ff0000',
  instagram: '#e1306c',
  facebook: '#1877f2'
}

function CommentPanel({ comments }: CommentPanelProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [comments])

  if (comments.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-6">
        <div>
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-text-secondary text-sm">Comments will appear here when you go live</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2" ref={scrollRef}>
      {comments.map((comment) => (
        <div
          key={comment.id}
          className={`p-2.5 rounded-lg transition-all ${
            comment.isBuyingSignal
              ? 'bg-accent/5 border-l-2 border-l-accent border border-accent/10'
              : 'bg-white/[0.02] hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ backgroundColor: PLATFORM_COLORS[comment.platform] }}
            >
              {comment.user[0].toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-text-primary truncate">{comment.user}</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
              style={{
                backgroundColor: PLATFORM_COLORS[comment.platform] + '15',
                color: PLATFORM_COLORS[comment.platform]
              }}
            >
              {comment.platform}
            </span>
            {comment.isBuyingSignal && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-semibold shrink-0 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                SIGNAL
              </span>
            )}
          </div>
          <p className="text-sm text-text-primary/90 pl-8">{comment.text}</p>
        </div>
      ))}
    </div>
  )
}

export default CommentPanel
