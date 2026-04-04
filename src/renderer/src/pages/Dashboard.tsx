interface DashboardProps {
  onNavigate: (page: string) => void
}

const platformCards = [
  { name: 'TikTok', color: '#ff0050', icon: '🎵' },
  { name: 'YouTube', color: '#ff0000', icon: '▶️' },
  { name: 'Instagram', color: '#e1306c', icon: '📸' },
  { name: 'Facebook', color: '#1877f2', icon: '👤' }
]

const stats = [
  { label: 'Total Viewers', value: '0', icon: '👁️' },
  { label: 'Revenue', value: '$0', icon: '💰' },
  { label: 'Comments', value: '0', icon: '💬' },
  { label: 'Streams', value: '0', icon: '📡' }
]

function Dashboard({ onNavigate }: DashboardProps): JSX.Element {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Dashboard</h1>
        <p className="text-text-secondary mb-6">Welcome back, Kobe. Ready to go live?</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-bg-card rounded-xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-text-secondary text-sm">{stat.label}</span>
                <span className="text-2xl">{stat.icon}</span>
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
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: platform.color + '20' }}
                >
                  {platform.icon}
                </div>
                <span className="font-semibold text-text-primary">{platform.name}</span>
              </div>
              <p className="text-sm text-text-secondary">Sign in to connect</p>
              <div className="mt-3 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-text-secondary" />
                <span className="text-xs text-text-secondary">Not connected</span>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('golive')}
            className="bg-gradient-to-br from-accent/20 to-orange-600/10 rounded-xl p-6 border border-accent/20 hover:border-accent/40 transition-all text-left"
          >
            <div className="text-3xl mb-3">🔴</div>
            <h3 className="font-semibold text-text-primary mb-1">Start Streaming</h3>
            <p className="text-sm text-text-secondary">Go live on all platforms at once</p>
          </button>
          <button
            onClick={() => onNavigate('products')}
            className="bg-bg-card rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all text-left"
          >
            <div className="text-3xl mb-3">🏷️</div>
            <h3 className="font-semibold text-text-primary mb-1">Add Products</h3>
            <p className="text-sm text-text-secondary">Set up products to sell live</p>
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className="bg-bg-card rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all text-left"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-text-primary mb-1">View Analytics</h3>
            <p className="text-sm text-text-secondary">Track your stream performance</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
