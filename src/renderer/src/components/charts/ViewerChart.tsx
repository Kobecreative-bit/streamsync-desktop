import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import type { StreamSession } from '../../stores/analyticsStore'

interface ViewerChartProps {
  sessions: StreamSession[]
}

function ViewerChart({ sessions }: ViewerChartProps): JSX.Element {
  const data = sessions.slice(-20).map((s) => ({
    date: new Date(s.startTime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
    viewers: s.peakViewers,
    duration: Math.round(s.duration / 60)
  }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary text-sm">
        No session data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1f35',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#f1f5f9',
            fontSize: '13px'
          }}
          labelStyle={{ color: '#94a3b8' }}
        />
        <Line
          type="monotone"
          dataKey="viewers"
          stroke="#f97316"
          strokeWidth={2}
          dot={{ fill: '#f97316', r: 4 }}
          activeDot={{ fill: '#fb923c', r: 6 }}
          name="Peak Viewers"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default ViewerChart
