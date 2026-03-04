import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import NarrativePanel from '../../components/NarrativePanel'
import EpidemicChart from '../../components/EpidemicChart'
import ParameterSlider from '../../components/ParameterSlider'
import MetricsDashboard from '../../components/MetricsDashboard'
import { solve } from '../../engine/ode-solver'
import { sirModel, seirModel } from '../../engine/models'
import { computeR0, findPeak, solutionToSeries, finalSize, getIIndex } from '../../engine/metrics'
import { CHAPTERS } from '../data/story'

interface ChapterProps {
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
}

const BETA = 200
const GAMMA = 365 / 7
const MU = 0.02
const DT = 0.0001
const T_END = 0.25

export default function Chapter3(_props: ChapterProps) {
  const [sigma, setSigma] = useState(365 / 5)
  const [showSEIR, setShowSEIR] = useState<'sir' | 'seir' | 'both'>('seir')

  const sirParams = useMemo(() => ({ beta: BETA, gamma: GAMMA, mu: MU }), [])
  const seirParams = useMemo(
    () => ({ beta: BETA, gamma: GAMMA, sigma, mu: MU }),
    [sigma]
  )

  // SIR solution
  const sirSol = useMemo(() => {
    const y0 = [0.999, 0.001, 0]
    return solve(sirModel, y0, [0, T_END], DT, sirParams)
  }, [sirParams])

  // SEIR solution
  const seirSol = useMemo(() => {
    const y0 = [0.999, 0, 0.001, 0]
    return solve(seirModel, y0, [0, T_END], DT, seirParams)
  }, [seirParams])

  const sirData = useMemo(() => solutionToSeries(sirSol, 'SIR'), [sirSol])
  const seirData = useMemo(() => solutionToSeries(seirSol, 'SEIR'), [seirSol])

  const sirPeak = useMemo(() => findPeak(sirSol, getIIndex('SIR')), [sirSol])
  const seirPeak = useMemo(() => findPeak(seirSol, getIIndex('SEIR')), [seirSol])

  const r0_sir = computeR0('SIR', sirParams)
  const r0_seir = computeR0('SEIR', seirParams)

  const sirFinal = finalSize(sirSol)
  const seirFinal = finalSize(seirSol)

  const latentDays = (365 / sigma).toFixed(1)
  const chapter = CHAPTERS[2]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Narrative + Controls */}
      <div className="space-y-4">
        <NarrativePanel title="Lab Report" variant="briefing">
          <p>{chapter.narrative}</p>
        </NarrativePanel>

        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 space-y-4">
          <h3 className="text-sm font-medium text-slate-300">Controls</h3>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSEIR('sir')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                showSEIR === 'sir'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              SIR
            </button>
            <button
              onClick={() => setShowSEIR('seir')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                showSEIR === 'seir'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              SEIR
            </button>
            <button
              onClick={() => setShowSEIR('both')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                showSEIR === 'both'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Both
            </button>
          </div>

          {showSEIR !== 'sir' && (
            <ParameterSlider
              label="Time before contagious (σ)"
              value={sigma}
              min={12}
              max={365}
              step={5}
              onChange={setSigma}
              displayValue={`${sigma.toFixed(0)} (${latentDays}d)`}
              unit="/yr"
            />
          )}
        </div>

        <MetricsDashboard
          metrics={[
            {
              label: showSEIR === 'sir' ? 'SIR R₀' : 'SEIR R₀',
              value: (showSEIR === 'sir' ? r0_sir : r0_seir).toFixed(2),
              color: '#ef4444',
            },
            {
              label: 'Peak Day',
              value: `~${((showSEIR === 'sir' ? sirPeak : seirPeak).peakTime * 365).toFixed(0)}`,
              color: '#8b5cf6',
            },
            {
              label: 'Peak I',
              value: `${((showSEIR === 'sir' ? sirPeak : seirPeak).peakValue * 100).toFixed(1)}%`,
              color: '#ef4444',
            },
            {
              label: 'Final S',
              value: `${((showSEIR === 'sir' ? sirFinal : seirFinal) * 100).toFixed(1)}%`,
              color: '#3b82f6',
            },
          ]}
        />

        {/* Comparison table */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-2">SIR vs SEIR Comparison</h3>
          <table className="w-full text-xs text-slate-400">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-1">Metric</th>
                <th className="text-right py-1 text-blue-400">SIR</th>
                <th className="text-right py-1 text-orange-400">SEIR</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1">R₀</td>
                <td className="text-right font-mono">{r0_sir.toFixed(2)}</td>
                <td className="text-right font-mono">{r0_seir.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-1">Peak day</td>
                <td className="text-right font-mono">~{(sirPeak.peakTime * 365).toFixed(0)}</td>
                <td className="text-right font-mono">~{(seirPeak.peakTime * 365).toFixed(0)}</td>
              </tr>
              <tr>
                <td className="py-1">Peak I</td>
                <td className="text-right font-mono">{(sirPeak.peakValue * 100).toFixed(1)}%</td>
                <td className="text-right font-mono">{(seirPeak.peakValue * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="py-1">Final S</td>
                <td className="text-right font-mono">{(sirFinal * 100).toFixed(1)}%</td>
                <td className="text-right font-mono">{(seirFinal * 100).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <NarrativePanel title="Key Insight" variant="insight">
          <p>{chapter.teachingPoint}</p>
        </NarrativePanel>
      </div>

      {/* Right: Chart */}
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          {showSEIR === 'both' ? (
            <>
              <h3 className="text-sm font-medium text-slate-400 mb-2">SIR vs SEIR — Infected (I) Overlay</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={sirData.map((d, i) => ({
                    t: d.t,
                    'SIR I': d.I,
                    'SEIR I': seirData[Math.min(i, seirData.length - 1)]?.I ?? 0,
                  }))}
                  margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="t"
                    type="number"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v: number) => `${Math.round(v * 365)}`}
                    label={{ value: 'Day', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                    label={{ value: 'Infected (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: 12 }}
                    labelFormatter={(v) => `Day ${Math.round(Number(v) * 365)}`}
                    formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="SIR I" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="SEIR I" stroke="#f97316" strokeWidth={2} strokeDasharray="6 3" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <EpidemicChart
              data={showSEIR === 'seir' ? seirData : sirData}
              model={showSEIR === 'seir' ? 'SEIR' : 'SIR'}
              title={showSEIR === 'seir' ? 'SEIR Model' : 'SIR Model'}
              thresholdS={1 / (showSEIR === 'seir' ? r0_seir : r0_sir)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
