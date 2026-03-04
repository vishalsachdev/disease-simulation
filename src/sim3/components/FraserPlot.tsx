import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Cell, Label
} from 'recharts'
import type { DiseaseProfile } from '../../engine/interventions'

interface FraserPlotProps {
  diseases: DiseaseProfile[]
  highlightName?: string
  epsilon_i?: number
  epsilon_t?: number
}

export default function FraserPlot({
  diseases,
  highlightName,
  epsilon_i: _epsilon_i = 1.0,
  epsilon_t = 0,
}: FraserPlotProps) {
  const data = diseases.map((d) => ({
    name: d.name,
    R0: d.R0,
    theta: d.theta,
    highlighted: d.name === highlightName,
  }))

  // Controllability boundary: θ = 1/R₀ for isolation alone
  // With tracing: θ(1 - εₜ) < 1/R₀ → θ < 1/(R₀(1 - εₜ))
  const boundaryPoints = []
  for (let r0 = 0.5; r0 <= 7; r0 += 0.1) {
    const thetaBound = epsilon_t > 0
      ? Math.min(1, 1 / (r0 * (1 - epsilon_t)))
      : Math.min(1, 1 / r0)
    boundaryPoints.push({ R0: r0, theta: thetaBound })
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-400 mb-2">
        Fraser Controllability Plot (R₀ vs θ)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
          <XAxis
            type="number"
            dataKey="R0"
            domain={[0, 7]}
            stroke="#64748b"
            fontSize={11}
          >
            <Label value="R₀" position="insideBottom" offset={-10} fill="#64748b" fontSize={12} />
          </XAxis>
          <YAxis
            type="number"
            dataKey="theta"
            domain={[0, 1]}
            stroke="#64748b"
            fontSize={11}
          >
            <Label value="θ (presymptomatic fraction)" angle={-90} position="insideLeft" fill="#64748b" fontSize={11} />
          </YAxis>

          {/* Controllable region (below boundary) */}
          <ReferenceArea
            x1={0} x2={7} y1={0} y2={0.15}
            fill="#22c55e" fillOpacity={0.05}
            stroke="none"
          />

          {/* Uncontrollable region hint */}
          <ReferenceArea
            x1={0} x2={7} y1={0.6} y2={1}
            fill="#ef4444" fillOpacity={0.05}
            stroke="none"
          />

          {/* Boundary line approximation */}
          <Scatter
            data={boundaryPoints}
            line={{ stroke: '#fbbf24', strokeWidth: 2, strokeDasharray: '6 3' }}
            shape={() => null}
          />

          {/* Disease points */}
          <Scatter data={data} shape="circle">
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.highlighted ? '#f59e0b' : '#3b82f6'}
                r={entry.highlighted ? 8 : 5}
                stroke={entry.highlighted ? '#fbbf24' : '#60a5fa'}
                strokeWidth={entry.highlighted ? 2 : 1}
              />
            ))}
          </Scatter>

          <ReferenceLine y={0.5} stroke="#334155" strokeDasharray="3 3" />

          <Tooltip
            contentStyle={{
              backgroundColor: '#0f1d32',
              border: '1px solid #1e3a5f',
              borderRadius: '8px',
              fontSize: 12,
            }}
            formatter={(value, name) => {
              if (name === 'theta') return [Number(value).toFixed(2), 'θ']
              if (name === 'R0') return [Number(value).toFixed(1), 'R₀']
              return [String(value), String(name)]
            }}
            labelFormatter={(_, payload) => {
              if (payload?.[0]?.payload?.name) return payload[0].payload.name
              return ''
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-1 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500/30 inline-block" /> Controllable
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500/30 inline-block" /> Difficult
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-amber-400 inline-block" /> Boundary (θ = 1/R₀)
        </span>
      </div>
    </div>
  )
}
