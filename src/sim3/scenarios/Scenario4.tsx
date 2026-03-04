import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts'
import NarrativePanel from '../../components/NarrativePanel'
import ParameterSlider from '../../components/ParameterSlider'
import MetricsDashboard from '../../components/MetricsDashboard'
import { solve } from '../../engine/ode-solver'
import { SCENARIOS } from '../data/diseases'

// 1918 Influenza-like parameters
const BASE_BETA = 120
const GAMMA = 365 / 7
const MU = 0.02
const DT = 0.0001
const T_END = 0.5 // ~6 months
const HOSPITAL_CAPACITY = 0.05 // 5% of population

/**
 * SIR model where beta drops at NPI start time.
 */
function sirWithNPI(npiStartDay: number, betaReduction: number) {
  const npiStartYear = npiStartDay / 365
  const derivs = (y: number[], t: number, p: Record<string, number>) => {
    const beta = t >= npiStartYear ? p.beta * (1 - betaReduction) : p.beta
    const [S, I, R] = y
    return [
      p.mu - beta * S * I - p.mu * S,
      beta * S * I - p.gamma * I - p.mu * I,
      p.gamma * I - p.mu * R,
    ]
  }
  const y0 = [0.999, 0.001, 0]
  return solve(derivs, y0, [0, T_END], DT, { beta: BASE_BETA, gamma: GAMMA, mu: MU })
}

export default function Scenario4() {
  const [phillyNPIDay, setPhillyNPIDay] = useState(30)
  const [stLouisNPIDay, setStLouisNPIDay] = useState(7)
  const [betaReduction, setBetaReduction] = useState(0.5)

  const scenario = SCENARIOS[3]

  const phillySol = useMemo(() => sirWithNPI(phillyNPIDay, betaReduction), [phillyNPIDay, betaReduction])
  const stLouisSol = useMemo(() => sirWithNPI(stLouisNPIDay, betaReduction), [stLouisNPIDay, betaReduction])

  // Downsample and merge
  const chartData = useMemo(() => {
    const step = Math.max(1, Math.floor(phillySol.t.length / 1500))
    const data: Array<Record<string, number>> = []
    for (let i = 0; i < phillySol.t.length; i += step) {
      data.push({
        day: Math.round(phillySol.t[i] * 365),
        Philadelphia: phillySol.y[i][1],
        'St. Louis': stLouisSol.y[i]?.[1] ?? 0,
      })
    }
    return data
  }, [phillySol, stLouisSol])

  // Metrics
  const phillyPeak = useMemo(() => {
    let max = 0, maxDay = 0
    phillySol.y.forEach((y, i) => { if (y[1] > max) { max = y[1]; maxDay = phillySol.t[i] * 365 } })
    return { value: max, day: maxDay }
  }, [phillySol])

  const stLouisPeak = useMemo(() => {
    let max = 0, maxDay = 0
    stLouisSol.y.forEach((y, i) => { if (y[1] > max) { max = y[1]; maxDay = stLouisSol.t[i] * 365 } })
    return { value: max, day: maxDay }
  }, [stLouisSol])

  // Total infected (1 - S_final - I_final for simple SIR)
  const phillyTotal = 1 - phillySol.y[phillySol.y.length - 1][0]
  const stLouisTotal = 1 - stLouisSol.y[stLouisSol.y.length - 1][0]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <NarrativePanel title="Historical Briefing" variant="briefing">
          <p>{scenario.narrative}</p>
        </NarrativePanel>

        <div className="rounded-xl border border-slate-700/50 p-4 space-y-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            NPI Timing
          </h3>
          <ParameterSlider
            label="Philadelphia: Start NPIs"
            value={phillyNPIDay}
            min={1}
            max={60}
            step={1}
            onChange={setPhillyNPIDay}
            displayValue={`Day ${phillyNPIDay}`}
          />
          <ParameterSlider
            label="St. Louis: Start NPIs"
            value={stLouisNPIDay}
            min={1}
            max={60}
            step={1}
            onChange={setStLouisNPIDay}
            displayValue={`Day ${stLouisNPIDay}`}
          />
          <ParameterSlider
            label="NPI β reduction"
            value={betaReduction}
            min={0.1}
            max={0.8}
            step={0.05}
            onChange={setBetaReduction}
            displayValue={`${(betaReduction * 100).toFixed(0)}%`}
          />
        </div>

        <MetricsDashboard
          metrics={[
            { label: 'Philly Peak', value: `${(phillyPeak.value * 100).toFixed(1)}%`, color: '#ef4444' },
            { label: 'StL Peak', value: `${(stLouisPeak.value * 100).toFixed(1)}%`, color: '#22c55e' },
            { label: 'Philly Total', value: `${(phillyTotal * 100).toFixed(0)}%`, color: '#ef4444' },
            { label: 'StL Total', value: `${(stLouisTotal * 100).toFixed(0)}%`, color: '#22c55e' },
          ]}
        />

        <div className="rounded-xl border border-slate-700/50 p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 className="text-sm font-medium text-slate-300 mb-2">Impact of Delay</h3>
          <div className="text-2xl font-bold font-mono text-center"
            style={{ color: '#ef4444' }}>
            +{((phillyTotal - stLouisTotal) * 100).toFixed(0)}%
          </div>
          <p className="text-xs text-slate-500 text-center mt-1">
            additional population infected due to {phillyNPIDay - stLouisNPIDay} day delay
          </p>
        </div>

        <NarrativePanel title="Key Insight" variant="insight">
          <p>{scenario.teachingPoint}</p>
        </NarrativePanel>
      </div>

      {/* Right: Side-by-side epidemic curves */}
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-slate-700/50 p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            Epidemic Curves: Philadelphia vs St. Louis
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis
                dataKey="day"
                stroke="#64748b"
                fontSize={11}
                label={{ value: 'Day', position: 'insideBottom', offset: -10, fill: '#64748b' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                label={{ value: 'Infected (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f1d32',
                  border: '1px solid #1e3a5f',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
                formatter={(value) => [`${(Number(value) * 100).toFixed(2)}%`, undefined]}
                labelFormatter={(v) => `Day ${v}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="Philadelphia"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="St. Louis"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              {/* Hospital capacity line */}
              <ReferenceLine
                y={HOSPITAL_CAPACITY}
                stroke="#f59e0b"
                strokeDasharray="6 3"
                label={{
                  value: 'Hospital capacity',
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'right',
                }}
              />

              {/* NPI start markers */}
              <ReferenceLine
                x={phillyNPIDay}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: 'Philly NPIs', fill: '#ef4444', fontSize: 9, position: 'top' }}
              />
              <ReferenceLine
                x={stLouisNPIDay}
                stroke="#22c55e"
                strokeDasharray="4 4"
                label={{ value: 'StL NPIs', fill: '#22c55e', fontSize: 9, position: 'top' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
