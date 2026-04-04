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
        <div className="text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">AI Copilot</h3>
          <div className="text-left space-y-3">
            {[
              'Buying signal detection',
              'Smart reply suggestions',
              'Sentiment analysis',
              'Multi-language support'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                <svg className="w-4 h-4 text-success shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {feature}
              </div>
            ))}
          </div>
          <p className="text-xs text-text-secondary mt-4">Go live to activate AI features</p>
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
            alert.sent ? 'bg-white/3 border-white/5 opacity-60' : 'bg-accent/5 border-accent/20'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent font-bold">
              🔥 BUYING SIGNAL
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{
                backgroundColor: PLATFORM_COLORS[alert.comment.platform] + '20',
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
            className={`w-full py-1.5 rounded-md text-xs font-semibold transition-all ${
              alert.sent
                ? 'bg-success/20 text-success cursor-default'
                : 'bg-accent text-white hover:bg-accent/80'
            }`}
          >
            {alert.sent ? '✓ Reply Sent' : 'Send Reply'}
          </button>
        </div>
      ))}
    </div>
  )
}

export default AICopilot
