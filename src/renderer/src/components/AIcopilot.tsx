interface AICopilotProps {
  isLive: boolean
  alerts: BuyingSignalAlert[]
  onSendReply: (alertId: string) => void
}

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#ff0050',
  youtube: '#ff0000',
  instagram: '#e1306c',
  facebook: '#1877f2'
}

function AICopilot({ isLive, alerts, onSendReply }: AICopilotProps): JSX.Element {
  if (!isLive) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-[220px]">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a3.375 3.375 0 01-4.76.04l-.04-.04L9.22 14.5m9.78 0l.28-.28a2.25 2.25 0 000-3.182L15 7m-6 0L4.94 11.038a2.25 2.25 0 000 3.182l.28.28" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-4">AI Copilot</h3>
          <div className="text-left space-y-3">
            {[
              'Buying signal detection',
              'Smart reply suggestions',
              'Sentiment analysis',
              'Multi-language support'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5 text-sm text-text-secondary">
                <svg className="w-4 h-4 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </div>
            ))}
          </div>
          <p className="text-xs text-text-secondary mt-5">Go live to activate AI features</p>
        </div>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-secondary">Scanning comments for buying signals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-lg border p-3 transition-all ${
            alert.sent
              ? 'bg-white/[0.02] border-white/5 opacity-60'
              : 'bg-accent/[0.03] border-l-2 border-l-accent border-accent/10'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-semibold flex items-center gap-1">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              BUYING SIGNAL
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{
                backgroundColor: PLATFORM_COLORS[alert.comment.platform] + '15',
                color: PLATFORM_COLORS[alert.comment.platform]
              }}
            >
              {alert.comment.platform}
            </span>
          </div>

          <div className="mb-2">
            <span className="text-xs font-semibold text-text-primary">{alert.comment.user}: </span>
            <span className="text-xs text-text-primary/80">{alert.comment.text}</span>
          </div>

          <div className="bg-bg-primary/50 rounded-md p-2 mb-2">
            <p className="text-[10px] text-text-secondary mb-1">Suggested reply:</p>
            <p className="text-xs text-text-primary">{alert.suggestedReply}</p>
          </div>

          <button
            onClick={() => !alert.sent && onSendReply(alert.id)}
            disabled={alert.sent}
            className={`w-full py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              alert.sent
                ? 'bg-success/15 text-success cursor-default'
                : 'bg-accent text-white hover:bg-accent/80'
            }`}
          >
            {alert.sent ? (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Reply Sent
              </>
            ) : (
              'Send Reply'
            )}
          </button>
        </div>
      ))}
    </div>
  )
}

export default AICopilot
