import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer
} from 'recharts'
import { infectiousnessProfile } from '../../engine/interventions'

interface InfectiousnessProfileProps {
  peakDay: number
  shape?: number
  maxDays?: number
  symptomOnsetDay: number
  title?: string
}

export default function InfectiousnessProfileChart({
  peakDay,
  shape = 3,
  maxDays = 20,
  symptomOnsetDay,
  title,
}: InfectiousnessProfileProps) {
  const data = infectiousnessProfile(peakDay, shape, maxDays)

  return (
    <div>
      {title && (
        <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
          <XAxis
            dataKey="tau"
            stroke="#64748b"
            fontSize={11}
            tickFormatter={(v: number) => `${v.toFixed(0)}d`}
          />
          <YAxis stroke="#64748b" fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f1d32',
              border: '1px solid #1e3a5f',
              borderRadius: '8px',
              fontSize: 12,
            }}
            formatter={(value) => [Number(value).toFixed(4), 'β(τ)']}
            labelFormatter={(v) => `Day ${Number(v).toFixed(1)}`}
          />
          <Area
            type="monotone"
            dataKey="beta"
            stroke="#ef4444"
            fill="#ef444420"
            strokeWidth={2}
            isAnimationActive={false}
          />
          <ReferenceLine
            x={symptomOnsetDay}
            stroke="#f59e0b"
            strokeDasharray="6 3"
            label={{
              value: 'Symptoms',
              fill: '#f59e0b',
              fontSize: 10,
              position: 'top',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
