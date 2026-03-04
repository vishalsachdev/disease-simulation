import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { ModelType } from '../engine/models'

interface EpidemicChartProps {
  data: Array<Record<string, number>>
  model: ModelType
  title?: string
  thresholdS?: number  // S = 1/R₀ line
  maxTime?: number
  height?: number
}

const COLORS: Record<string, string> = {
  S: '#3b82f6',
  E: '#f97316',
  I: '#ef4444',
  R: '#22c55e',
}

const LABELS: Record<string, string> = {
  S: 'Susceptible',
  E: 'Exposed',
  I: 'Infected',
  R: 'Recovered',
}

export default function EpidemicChart({
  data,
  model,
  title,
  thresholdS,
  height = 350,
}: EpidemicChartProps) {
  const compartments =
    model === 'SI' ? ['S', 'I'] :
    model === 'SEIR' ? ['S', 'E', 'I', 'R'] :
    ['S', 'I', 'R']

  return (
    <div>
      {title && (
        <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="t"
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(v: number) => v.toFixed(1)}
            label={{ value: 'Time (years)', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            domain={[0, 1]}
            tickFormatter={(v: number) => v.toFixed(2)}
            label={{ value: 'Proportion', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: 12,
            }}
            labelFormatter={(v) => `t = ${Number(v).toFixed(3)} yr`}
            formatter={(value, name) => [
              Number(value).toFixed(4),
              LABELS[String(name)] || name,
            ]}
          />
          <Legend
            formatter={(value: string) => LABELS[value] || value}
            wrapperStyle={{ fontSize: 12 }}
          />
          {compartments.map((comp) => (
            <Line
              key={comp}
              type="monotone"
              dataKey={comp}
              stroke={COLORS[comp]}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
          {thresholdS !== undefined && (
            <ReferenceLine
              y={thresholdS}
              stroke="#fbbf24"
              strokeDasharray="6 3"
              label={{
                value: `S = 1/R₀ = ${thresholdS.toFixed(3)}`,
                fill: '#fbbf24',
                fontSize: 11,
                position: 'right',
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
