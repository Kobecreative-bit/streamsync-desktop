import { useEffect, useMemo } from 'react'
import { useAnalyticsStore } from '../stores/analyticsStore'
import ViewerChart from '../components/charts/ViewerChart'
import RevenueChart from '../components/charts/RevenueChart'
import PlatformBreakdown from '../components/charts/PlatformBreakdown'
import { exportToCsv } from '../lib/exportCsv'

function ViewsIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function RevenueIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function CommentsIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function StreamsIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function ExportIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

function EmptyChartIcon(): JSX.Element {
  return (
    <svg className="w-8 h-8 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l4-4 4 4 5-5" />
    </svg>
  )
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function Analytics(): JSX.Element {
  const {
    sessions,
    revenue,
    loaded,
    loadFromStore,
    getTotalViews,
    getTotalRevenue,
    getTotalComments,
    getSessionCount
  } = useAnalyticsStore()

  useEffect(() => {
    loadFromStore()
  }, [loadFromStore])

  const platformData = useMemo(() => {
    const platforms = ['tiktok', 'youtube', 'instagram', 'facebook']
    return platforms.map((p) => {
      const relevantSessions = sessions.filter((s) => s.platforms.includes(p))
      return {
        platform: p,
        comments: relevantSessions.reduce((sum, s) => sum + s.totalComments, 0),
        signals: relevantSessions.reduce((sum, s) => sum + s.buyingSignals, 0)
      }
    })
  }, [sessions])

  const handleExportCsv = (): void => {
    const data = sessions.map((s) => ({
      'Session ID': s.id,
      Date: new Date(s.startTime).toLocaleDateString(),
      'Start Time': new Date(s.startTime).toLocaleTimeString(),
      'Duration (min)': Math.round(s.duration / 60),
      Platforms: s.platforms.join(', '),
      'Peak Viewers': s.peakViewers,
      Comments: s.totalComments,
      'Buying Signals': s.buyingSignals,
      Revenue: `$${s.revenue.toFixed(2)}`
    }))
    exportToCsv(`streamsync-analytics-${new Date().toISOString().split('T')[0]}.csv`, data)
  }

  const totalViews = getTotalViews()
  const totalRevenue = getTotalRevenue()
  const totalComments = getTotalComments()
  const sessionCount = getSessionCount()
  const hasData = sessions.length > 0

  const stats = [
    {
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: ViewsIcon
    },
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: RevenueIcon
    },
    {
      label: 'Total Comments',
      value: totalComments.toLocaleString(),
      icon: CommentsIcon
    },
    {
      label: 'Streams',
      value: sessionCount.toLocaleString(),
      icon: StreamsIcon
    }
  ]

  if (!loaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">Analytics</h1>
            <p className="text-text-secondary">Track your live stream performance</p>
          </div>
          {hasData && (
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-text-primary hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <ExportIcon />
              Export CSV
            </button>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-bg-card rounded-xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-text-secondary text-sm">{stat.label}</span>
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary">
                  <stat.icon />
                </div>
              </div>
              <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
            </div>
          ))}
        </div>

        {!hasData ? (
          /* Empty State */
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <EmptyChartIcon />
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">No Data Yet</h2>
              <p className="text-text-secondary">
                Complete your first stream to see analytics
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-bg-card rounded-xl border border-white/5 p-5">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                  Viewers Over Time
                </h3>
                <div className="h-[240px]">
                  <ViewerChart sessions={sessions} />
                </div>
              </div>
              <div className="bg-bg-card rounded-xl border border-white/5 p-5">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                  Revenue
                </h3>
                <div className="h-[240px]">
                  <RevenueChart revenue={revenue} />
                </div>
              </div>
            </div>

            {/* Platform Breakdown */}
            <div className="bg-bg-card rounded-xl border border-white/5 p-5 mb-6">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Platform Breakdown
              </h3>
              <div className="h-[200px]">
                <PlatformBreakdown data={platformData} />
              </div>
            </div>

            {/* Recent Sessions Table */}
            <div className="bg-bg-card rounded-xl border border-white/5 p-5">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Recent Sessions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-3 px-3 text-text-secondary font-medium">Date</th>
                      <th className="text-left py-3 px-3 text-text-secondary font-medium">Duration</th>
                      <th className="text-left py-3 px-3 text-text-secondary font-medium">Platforms</th>
                      <th className="text-right py-3 px-3 text-text-secondary font-medium">Peak Viewers</th>
                      <th className="text-right py-3 px-3 text-text-secondary font-medium">Comments</th>
                      <th className="text-right py-3 px-3 text-text-secondary font-medium">Signals</th>
                      <th className="text-right py-3 px-3 text-text-secondary font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...sessions]
                      .sort((a, b) => b.startTime - a.startTime)
                      .slice(0, 20)
                      .map((session) => (
                        <tr
                          key={session.id}
                          className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 px-3 text-text-primary">
                            {new Date(session.startTime).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 text-text-primary">
                            {formatDuration(session.duration)}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex gap-1.5">
                              {session.platforms.map((p) => (
                                <PlatformBadge key={p} platform={p} />
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right text-text-primary">
                            {session.peakViewers.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-text-primary">
                            {session.totalComments.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-accent font-medium">
                            {session.buyingSignals}
                          </td>
                          <td className="py-3 px-3 text-right text-text-primary font-medium">
                            ${session.revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const PLATFORM_COLOR_MAP: Record<string, string> = {
  tiktok: 'bg-[#ff0050]/20 text-[#ff0050]',
  youtube: 'bg-[#ff0000]/20 text-[#ff0000]',
  instagram: 'bg-[#e1306c]/20 text-[#e1306c]',
  facebook: 'bg-[#1877f2]/20 text-[#1877f2]'
}

function PlatformBadge({ platform }: { platform: string }): JSX.Element {
  const colors = PLATFORM_COLOR_MAP[platform] || 'bg-white/10 text-text-secondary'
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${colors}`}>
      {platform}
    </span>
  )
}

export default Analytics
