import { usePlanStore } from '../stores/planStore'
import UpgradeModal from './UpgradeModal'
import { useState } from 'react'

interface AICopilotProps {
  isLive: boolean
  alerts: BuyingSignalAlert[]
  onSendReply: (alertId: string) => void
  isDemoMode?: boolean
}

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#ff0050',
  youtube: '#ff0000',
  instagram: '#e1306c',
  facebook: '#1877f2'
}

function AICopilot({ isLive, alerts, onSendReply, isDemoMode }: AICopilotProps): JSX.Element {
  const { canAccess, plan, getRequiredPlanForFeature } = usePlanStore()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const hasAI = canAccess('ai_copilot')

  // Plan gate: if user doesn't have AI copilot access, show upgrade prompt
  if (!hasAI) {
    const requiredPlan = getRequiredPlanForFeature('ai_copilot')
    return (
      <>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-[240px]">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-2">AI Copilot</h3>
            <p className="text-xs text-text-secondary mb-5 leading-relaxed">
              Automatically detect buying signals in comments and generate smart replies to convert viewers into buyers.
            </p>
            <div className="text-left space-y-2.5 mb-6">
              {[
                'Buying signal detection',
                'Smart reply suggestions',
                'Sentiment analysis',
                'Multi-language support'
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-xs text-text-secondary/60">
                  <svg className="w-3.5 h-3.5 text-text-secondary/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full py-2.5 bg-accent rounded-lg text-white text-xs font-bold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
        {showUpgrade && requiredPlan && (
          <UpgradeModal
            feature="ai_copilot"
            currentPlan={plan}
            requiredPlan={requiredPlan}
            onClose={() => setShowUpgrade(false)}
          />
        )}
      </>
    )
  }

  if (!isLive) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-[240px]">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-text-secondary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a3.375 3.375 0 01-4.76.04l-.04-.04L9.22 14.5m9.78 0l.28-.28a2.25 2.25 0 000-3.182L15 7m-6 0L4.94 11.038a2.25 2.25 0 000 3.182l.28.28" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-3">AI Copilot Ready</h3>
          <div className="text-left space-y-2.5 mb-5">
            {[
              'Buying signal detection',
              'Smart reply suggestions',
              'Sentiment analysis',
              'Multi-language support'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5 text-xs text-text-secondary">
                <svg className="w-3.5 h-3.5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-text-secondary/50">Go live to activate AI scanning</p>
        </div>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-text-primary mb-1">Scanning comments</p>
          <p className="text-xs text-text-secondary/60">Buying signals will appear here</p>
        </div>
      </div>
    )
  }

  const pendingCount = alerts.filter((a) => !a.sent).length

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Summary bar */}
      {pendingCount > 0 && (
        <div className="px-4 py-2.5 border-b border-white/[0.04] bg-accent/[0.03] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-scanPulse" />
            <span className="text-xs font-semibold text-accent">
              {pendingCount} buying signal{pendingCount !== 1 ? 's' : ''} detected
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-xl border transition-all animate-fadeIn ${
              alert.sent
                ? 'bg-white/[0.01] border-white/[0.04] opacity-50'
                : 'bg-accent/[0.03] border-l-[3px] border-l-accent border-t border-r border-b border-accent/10'
            }`}
          >
            <div className="p-3.5">
              {/* Header badges */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[9px] px-2 py-0.5 rounded-sm bg-accent/15 text-accent font-bold flex items-center gap-1 uppercase tracking-wider">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  Signal
                </span>
                <span
                  className="text-[9px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: PLATFORM_COLORS[alert.comment.platform] + '18',
                    color: PLATFORM_COLORS[alert.comment.platform]
                  }}
                >
                  {alert.comment.platform}
                </span>
                {alert.confidence >= 0.8 && (
                  <span className="text-[9px] px-2 py-0.5 rounded-sm bg-success/10 text-success font-bold uppercase tracking-wider">
                    High
                  </span>
                )}
              </div>

              {/* Comment */}
              <div className="mb-3">
                <span className="text-[13px] font-semibold text-text-primary">{alert.comment.user}: </span>
                <span className="text-[13px] text-text-primary/80 leading-relaxed">{alert.comment.text}</span>
              </div>

              {/* Suggested reply */}
              <div className="bg-bg-primary/60 rounded-lg p-3 mb-3 border border-white/[0.03]">
                <p className="text-[10px] text-text-secondary/50 mb-1.5 font-semibold uppercase tracking-wider">Suggested Reply</p>
                <p className="text-[12px] text-text-primary/90 leading-relaxed">{alert.suggestedReply}</p>
              </div>

              {/* Send button */}
              <button
                onClick={() => !alert.sent && onSendReply(alert.id)}
                disabled={alert.sent}
                className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  alert.sendStatus === 'sending'
                    ? 'bg-accent/50 text-white cursor-wait'
                    : alert.sent
                      ? 'bg-success/10 text-success cursor-default'
                      : alert.sendStatus === 'failed'
                        ? 'bg-danger/15 text-danger hover:bg-danger/25'
                        : 'bg-accent text-white hover:bg-accent/80 shadow-sm shadow-accent/20'
                }`}
              >
                {alert.sendStatus === 'sending' ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : alert.sent ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Reply Sent
                  </>
                ) : alert.sendStatus === 'failed' ? (
                  'Retry Send'
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AICopilot
