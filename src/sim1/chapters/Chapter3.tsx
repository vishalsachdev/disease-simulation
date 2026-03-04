import { useState, useMemo } from 'react'
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
  const [showSEIR, setShowSEIR] = useState(true)

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
              onClick={() => setShowSEIR(false)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !showSEIR
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              SIR
            </button>
            <button
              onClick={() => setShowSEIR(true)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                showSEIR
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              SEIR
            </button>
          </div>

          {showSEIR && (
            <ParameterSlider
              label="σ (latent rate)"
              value={sigma}
              min={30}
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
              label: showSEIR ? 'SEIR R₀' : 'SIR R₀',
              value: (showSEIR ? r0_seir : r0_sir).toFixed(2),
              color: '#ef4444',
            },
            {
              label: 'Peak Day',
              value: `~${((showSEIR ? seirPeak : sirPeak).peakTime * 365).toFixed(0)}`,
              color: '#8b5cf6',
            },
            {
              label: 'Peak I',
              value: (showSEIR ? seirPeak : sirPeak).peakValue.toFixed(4),
              color: '#ef4444',
            },
            {
              label: 'S(∞)',
              value: (showSEIR ? seirFinal : sirFinal).toFixed(4),
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
                <td className="text-right font-mono">{sirPeak.peakValue.toFixed(4)}</td>
                <td className="text-right font-mono">{seirPeak.peakValue.toFixed(4)}</td>
              </tr>
              <tr>
                <td className="py-1">S(∞)</td>
                <td className="text-right font-mono">{sirFinal.toFixed(4)}</td>
                <td className="text-right font-mono">{seirFinal.toFixed(4)}</td>
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
          <EpidemicChart
            data={showSEIR ? seirData : sirData}
            model={showSEIR ? 'SEIR' : 'SIR'}
            title={showSEIR ? 'SEIR Model' : 'SIR Model'}
            thresholdS={1 / (showSEIR ? r0_seir : r0_sir)}
          />
        </div>
      </div>
    </div>
  )
}
