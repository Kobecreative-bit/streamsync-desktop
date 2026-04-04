import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface PlatformBreakdownProps {
  data: { platform: string; comments: number; signals: number }[]
}

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#ff0050',
  youtube: '#ff0000',
  instagram: '#e1306c',
  facebook: '#1877f2'
}

function PlatformBreakdown({ data }: PlatformBreakdownProps): JSX.Element {
  if (data.length === 0 || data.every((d) => d.comments === 0 && d.signals === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary text-sm">
        No platform data yet
      </div>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    platform: d.platform.charAt(0).toUpperCase() + d.platform.slice(1)
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="platform"
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={80}
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
        <Legend
          wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
        />
        <Bar
          dataKey="comments"
          fill="#f97316"
          radius={[0, 4, 4, 0]}
          name="Comments"
        />
        <Bar
          dataKey="signals"
          fill="#fb923c"
          radius={[0, 4, 4, 0]}
          name="Buying Signals"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export { PLATFORM_COLORS }
export default PlatformBreakdown
