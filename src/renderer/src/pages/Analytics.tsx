const stats = [
  { label: 'Total Views', value: '0', icon: '👁️', change: '' },
  { label: 'Total Revenue', value: '$0', icon: '💰', change: '' },
  { label: 'Avg Engagement', value: '0%', icon: '📊', change: '' },
  { label: 'Products Sold', value: '0', icon: '🛍️', change: '' }
]

function Analytics(): JSX.Element {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Analytics</h1>
        <p className="text-text-secondary mb-6">Track your live stream performance</p>

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

        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">No Data Yet</h2>
            <p className="text-text-secondary">
              Analytics will populate after your first live stream
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
