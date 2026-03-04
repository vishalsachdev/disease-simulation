import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import NarrativePanel from '../../components/NarrativePanel'
import EpidemicChart from '../../components/EpidemicChart'
import ParameterSlider from '../../components/ParameterSlider'
import MetricsDashboard from '../../components/MetricsDashboard'
import { solve } from '../../engine/ode-solver'
import { sirModel, sirsModel } from '../../engine/models'
import { computeR0, findEquilibrium, solutionToSeries } from '../../engine/metrics'
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

export default function Chapter4(_props: ChapterProps) {
  const [omega, setOmega] = useState(365 / 30)
  const [showSIRS, setShowSIRS] = useState<'sir' | 'sirs' | 'both'>('sirs')
  const [tEnd, setTEnd] = useState(10)

  const sirParams = useMemo(() => ({ beta: BETA, gamma: GAMMA, mu: MU }), [])
  const sirsParams = useMemo(
    () => ({ beta: BETA, gamma: GAMMA, mu: MU, omega }),
    [omega]
  )

  const sirSol = useMemo(() => {
    const y0 = [0.999, 0.001, 0]
    return solve(sirModel, y0, [0, tEnd], DT, sirParams)
  }, [sirParams, tEnd])

  const sirsSol = useMemo(() => {
    const y0 = [0.999, 0.001, 0]
    return solve(sirsModel, y0, [0, tEnd], DT, sirsParams)
  }, [sirsParams, tEnd])

  // Downsample for display
  const downsample = (data: Array<Record<string, number>>, maxPoints = 2000) => {
    if (data.length <= maxPoints) return data
    const step = Math.ceil(data.length / maxPoints)
    return data.filter((_, i) => i % step === 0)
  }

  const sirData = useMemo(() => downsample(solutionToSeries(sirSol, 'SIR')), [sirSol])
  const sirsData = useMemo(() => downsample(solutionToSeries(sirsSol, 'SIRS')), [sirsSol])

  const r0 = computeR0('SIR', sirParams)
  const eq = useMemo(() => findEquilibrium(sirsSol), [sirsSol])

  // Theoretical endemic equilibrium
  const S_star_theory = (GAMMA + MU) / BETA
  // SIRS equilibrium: I* = (1-S*)(ω+μ)/(ω+μ+γ), SIR: I* = μ(R₀-1)/β
  const I_star_theory = showSIRS !== 'sir'
    ? (1 - S_star_theory) * (omega + MU) / (omega + MU + GAMMA)
    : MU * (r0 - 1) / BETA

  const waneDays = (365 / omega).toFixed(0)
  const chapter = CHAPTERS[3]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <NarrativePanel title="Alert: Reinfections Detected" variant="briefing">
          <p>{chapter.narrative}</p>
        </NarrativePanel>

        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 space-y-4">
          <h3 className="text-sm font-medium text-slate-300">Controls</h3>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSIRS('sir')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                showSIRS === 'sir'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              SIR
            </button>
            <button
              onClick={() => setShowSIRS('sirs')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                showSIRS === 'sirs'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              SIRS
            </button>
            <button
              onClick={() => setShowSIRS('both')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                showSIRS === 'both'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Both
            </button>
          </div>

          {showSIRS !== 'sir' && (
            <ParameterSlider
              label="How fast immunity fades (ω)"
              value={omega}
              min={1}
              max={52}
              step={0.5}
              onChange={setOmega}
              displayValue={`${omega.toFixed(1)} (${waneDays}d)`}
              unit="/yr"
            />
          )}

          <ParameterSlider
            label="Simulation length"
            value={tEnd}
            min={1}
            max={30}
            step={1}
            onChange={setTEnd}
            displayValue={`${tEnd}`}
            unit="years"
          />
        </div>

        <MetricsDashboard
          metrics={[
            { label: 'R₀', value: r0.toFixed(2), color: '#ef4444' },
            { label: 'S* (theory)', value: `${(S_star_theory * 100).toFixed(1)}%`, color: '#3b82f6' },
            { label: 'I* (theory)', value: `${(I_star_theory * 100).toFixed(2)}%`, color: '#ef4444' },
            { label: 'I* (sim)', value: `${(eq.I_star * 100).toFixed(2)}%`, color: '#f97316' },
          ]}
        />

        <NarrativePanel title="Key Insight" variant="insight">
          <p>{chapter.teachingPoint}</p>
        </NarrativePanel>

        {showSIRS !== 'sir' && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
            <p className="text-sm text-slate-300">
              At steady state, about <span className="text-blue-400 font-semibold">{(S_star_theory * 100).toFixed(0)}%</span> of the population remains susceptible and about <span className="text-red-400 font-semibold">{(I_star_theory * 100).toFixed(1)}%</span> is infected at any given time.
            </p>
            <details className="mt-2">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">
                Show the math
              </summary>
              <div className="text-xs text-slate-400 space-y-1 font-mono mt-2 pl-2 border-l border-slate-700">
                <p>S* = (γ+μ)/β = {S_star_theory.toFixed(4)}</p>
                <p>I* = (1−S*)(ω+μ)/(ω+μ+γ) = {I_star_theory.toFixed(4)}</p>
                <p>Simulated S* = {eq.S_star.toFixed(4)}</p>
                <p>Simulated I* = {eq.I_star.toFixed(6)}</p>
              </div>
            </details>
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          {showSIRS === 'both' ? (
            <>
              <h3 className="text-sm font-medium text-slate-400 mb-2">SIR vs SIRS — Infected (I) Overlay ({tEnd}yr)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={sirData.map((d, i) => ({
                    t: d.t,
                    'SIR I': d.I,
                    'SIRS I': sirsData[Math.min(i, sirsData.length - 1)]?.I ?? 0,
                  }))}
                  margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="t"
                    type="number"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v: number) => v.toFixed(1)}
                    label={{ value: 'Time (years)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                    label={{ value: 'Infected (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: 12 }}
                    labelFormatter={(v) => `t = ${Number(v).toFixed(2)} yr`}
                    formatter={(value) => [`${(Number(value) * 100).toFixed(2)}%`]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="SIR I" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="SIRS I" stroke="#a855f7" strokeWidth={2} strokeDasharray="6 3" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <EpidemicChart
              data={showSIRS === 'sirs' ? sirsData : sirData}
              model={showSIRS === 'sirs' ? 'SIRS' : 'SIR'}
              title={showSIRS === 'sirs' ? `SIRS Model (${tEnd}yr, immunity wanes in ${waneDays}d)` : `SIR Model (${tEnd}yr)`}
              thresholdS={S_star_theory}
            />
          )}
        </div>
      </div>
    </div>
  )
}
