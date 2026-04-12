import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

interface DashboardProps {
  onNavigate: (page: string) => void
}

function ViewersIcon(): JSX.Element {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
    </svg>
  )
}

const platformCards = [
  { name: 'TikTok', color: '#ff0050' },
  { name: 'YouTube', color: '#ff0000' },
  { name: 'Instagram', color: '#e1306c' },
  { name: 'Facebook', color: '#1877f2' }
]

function Dashboard({ onNavigate }: DashboardProps): JSX.Element {
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({
    totalViewers: 0,
    revenue: 0,
    comments: 0,
    streams: 0
  })

  useEffect(() => {
    // Load real session data
    Promise.all([
      window.streamSync.getSessions(),
      window.streamSync.getRevenue()
    ]).then(([sessions, revenue]) => {
      const totalViewers = sessions.reduce((sum, s) => sum + (s.peakViewers || 0), 0)
      const totalComments = sessions.reduce((sum, s) => sum + (s.totalComments || 0), 0)
      const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0)
      setStats({
        totalViewers,
        revenue: totalRevenue,
        comments: totalComments,
        streams: sessions.length
      })
    }).catch(() => {
      // First launch, no data yet
    })
  }, [])

  const displayName = profile?.display_name || 'there'

  const statCards = [
    { label: 'Total Viewers', value: stats.totalViewers.toLocaleString(), icon: ViewersIcon },
    { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: RevenueIcon },
    { label: 'Comments', value: stats.comments.toLocaleString(), icon: CommentsIcon },
    { label: 'Streams', value: stats.streams.toString(), icon: StreamsIcon }
  ]

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Welcome back, <span className="gradient-text">{displayName}</span>
        </h1>
        <p className="text-text-secondary mb-6">Your dashboard — ready when you are.</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
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

        {/* Platform Cards */}
        <h2 className="text-lg font-semibold text-text-primary mb-4">Connected Platforms</h2>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {platformCards.map((platform) => (
            <button
              key={platform.name}
              onClick={() => onNavigate('golive')}
              className="bg-bg-card rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: platform.color + '15' }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: platform.color }} />
                </div>
                <span className="font-semibold text-text-primary">{platform.name}</span>
              </div>
              <p className="text-sm text-text-secondary">Click to go live</p>
              <div className="mt-3 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-success/60" />
                <span className="text-xs text-text-secondary">Ready</span>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('golive')}
            className="bg-gradient-to-br from-accent/20 to-accent2/10 rounded-xl p-6 border border-accent/20 hover:border-accent/40 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-danger/15 flex items-center justify-center mb-3">
              <div className="w-3.5 h-3.5 rounded-full bg-danger" />
            </div>
            <h3 className="font-semibold text-text-primary mb-1">Start Streaming</h3>
            <p className="text-sm text-text-secondary">Go live on all platforms at once</p>
          </button>
          <button
            onClick={() => onNavigate('products')}
            className="bg-bg-card rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-3 text-text-secondary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="font-semibold text-text-primary mb-1">Add Products</h3>
            <p className="text-sm text-text-secondary">Set up products to sell live</p>
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className="bg-bg-card rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-3 text-text-secondary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-text-primary mb-1">View Analytics</h3>
            <p className="text-sm text-text-secondary">Track your stream performance</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
