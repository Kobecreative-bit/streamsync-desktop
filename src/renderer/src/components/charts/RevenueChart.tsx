import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface RevenueChartProps {
  revenue: { date: string; amount: number }[]
}

function RevenueChart({ revenue }: RevenueChartProps): JSX.Element {
  // Aggregate revenue by date
  const aggregated = revenue.reduce<Record<string, number>>((acc, r) => {
    acc[r.date] = (acc[r.date] || 0) + r.amount
    return acc
  }, {})

  const data = Object.entries(aggregated)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, amount]) => ({
      date: new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      amount: Math.round(amount * 100) / 100
    }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary text-sm">
        No revenue data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
          width={50}
          tickFormatter={(v) => `$${v}`}
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
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
        />
        <Bar dataKey="amount" fill="#f97316" radius={[4, 4, 0, 0]} name="Revenue" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default RevenueChart
