import { useState, useMemo } from 'react'
import NarrativePanel from '../../components/NarrativePanel'
import EpidemicChart from '../../components/EpidemicChart'
import ParameterSlider from '../../components/ParameterSlider'
import MetricsDashboard from '../../components/MetricsDashboard'
import { solve } from '../../engine/ode-solver'
import { sirModel } from '../../engine/models'
import { computeR0, findPeak, solutionToSeries, getIIndex } from '../../engine/metrics'
import { CHAPTERS } from '../data/story'

interface ChapterProps {
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
}

const GAMMA = 365 / 7
const MU = 0.02
const DT = 0.0001
const T_END = 0.25 // ~91 days

export default function Chapter2(_props: ChapterProps) {
  const [beta, setBeta] = useState(200)
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [showQuizResult, setShowQuizResult] = useState(false)

  const params = useMemo(() => ({ beta, gamma: GAMMA, mu: MU }), [beta])
  const r0 = useMemo(() => computeR0('SIR', params), [params])

  const solution = useMemo(() => {
    const y0 = [1 - 0.001, 0.001, 0]
    return solve(sirModel, y0, [0, T_END], DT, params)
  }, [params])

  const chartData = useMemo(() => solutionToSeries(solution, 'SIR'), [solution])
  const peak = useMemo(() => findPeak(solution, getIIndex('SIR')), [solution])

  const thresholdS = 1 / r0

  const checkQuiz = () => {
    setShowQuizResult(true)
  }

  const chapter = CHAPTERS[1]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Narrative + Controls */}
      <div className="space-y-4">
        <NarrativePanel title="Mission Update" variant="briefing">
          <p>{chapter.narrative}</p>
        </NarrativePanel>

        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 space-y-4">
          <h3 className="text-sm font-medium text-slate-300">Parameters</h3>
          <ParameterSlider
            label="How fast it spreads (β)"
            value={beta}
            min={50}
            max={400}
            step={5}
            onChange={setBeta}
            displayValue={beta.toFixed(0)}
          />
          <div className="text-xs text-slate-500">
            Recovery rate (γ) = {GAMMA.toFixed(1)}/yr (7-day infectious period) · Birth/death rate (μ) = {MU}/yr
          </div>
        </div>

        <MetricsDashboard
          metrics={[
            { label: 'R₀', value: showQuizResult ? r0.toFixed(2) : '???', color: r0 > 1 ? '#ef4444' : '#22c55e' },
            { label: '1/R₀', value: showQuizResult ? thresholdS.toFixed(3) : '???', color: '#fbbf24' },
            { label: 'Peak I', value: `${(peak.peakValue * 100).toFixed(1)}%`, color: '#ef4444' },
            { label: 'Peak Day', value: `~${(peak.peakTime * 365).toFixed(0)}`, color: '#8b5cf6' },
          ]}
        />

        {/* Quiz */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 space-y-3">
          <h3 className="text-sm font-medium text-slate-300">Quiz: What is R₀?</h3>
          <p className="text-xs text-slate-400">
            Use the slider to estimate R₀ for this pathogen.
          </p>
          <ParameterSlider
            label="Your answer"
            value={quizAnswer ?? 1}
            min={0.5}
            max={8}
            step={0.1}
            onChange={setQuizAnswer}
            displayValue={(quizAnswer ?? 1).toFixed(1)}
          />
          <button
            onClick={checkQuiz}
            disabled={quizAnswer === null}
            className="w-full px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white
              hover:bg-blue-500 disabled:opacity-30 transition-all"
          >
            Check Answer
          </button>
          {showQuizResult && quizAnswer !== null && (
            <div
              className={`text-sm p-2 rounded-lg ${
                Math.abs(quizAnswer - r0) < 0.5
                  ? 'bg-green-500/10 text-green-300'
                  : 'bg-red-500/10 text-red-300'
              }`}
            >
              {Math.abs(quizAnswer - r0) < 0.5
                ? `Correct! R₀ = ${r0.toFixed(2)}. The epidemic peak occurs when S drops below 1/R₀ = ${thresholdS.toFixed(3)}.`
                : `Not quite. R₀ = β/(γ+μ) = ${beta}/${(GAMMA + MU).toFixed(1)} = ${r0.toFixed(2)}. Try adjusting your estimate.`}
            </div>
          )}
        </div>

        <NarrativePanel title="Key Insight" variant="insight">
          <p>{chapter.teachingPoint}</p>
        </NarrativePanel>
      </div>

      {/* Right: Chart */}
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <EpidemicChart
            data={chartData}
            model="SIR"
            title="SIR Epidemic Curve"
            thresholdS={thresholdS}
          />
        </div>
      </div>
    </div>
  )
}
