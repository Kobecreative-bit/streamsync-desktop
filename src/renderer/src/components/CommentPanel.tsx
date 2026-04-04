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
          <div className="text-4xl mb-3">💬</div>
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
            comment.isBuyingSignal ? 'bg-accent/10 border border-accent/20' : 'bg-white/3 hover:bg-white/5'
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
                backgroundColor: PLATFORM_COLORS[comment.platform] + '20',
                color: PLATFORM_COLORS[comment.platform]
              }}
            >
              {comment.platform}
            </span>
            {comment.isBuyingSignal && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent font-bold shrink-0">
                🔥 BUYING
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
