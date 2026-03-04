import { useState, useMemo } from 'react'
import NarrativePanel from '../../components/NarrativePanel'
import EpidemicChart from '../../components/EpidemicChart'
import MetricsDashboard from '../../components/MetricsDashboard'
import { solve } from '../../engine/ode-solver'
import { siModel, sirModel, seirModel, sirsModel, getInitialConditions } from '../../engine/models'
import { computeR0, solutionToSeries } from '../../engine/metrics'
import type { ModelType } from '../../engine/models'
import { CHAPTERS, CHAPTER_5_QUIZ } from '../data/story'

interface ChapterProps {
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
}

const PARAMS = { beta: 200, gamma: 365 / 7, sigma: 365 / 5, mu: 0.02, omega: 365 / 30 }
const DT = 0.0001
const T_END = 5

const MODEL_CONFIGS: Array<{ type: ModelType; derivs: typeof siModel; color: string }> = [
  { type: 'SI', derivs: siModel, color: '#64748b' },
  { type: 'SIR', derivs: sirModel, color: '#3b82f6' },
  { type: 'SEIR', derivs: seirModel, color: '#f97316' },
  { type: 'SIRS', derivs: sirsModel, color: '#8b5cf6' },
]

export default function Chapter5(_props: ChapterProps) {
  const [answers, setAnswers] = useState<Record<string, number | null>>({})
  const [submitted, setSubmitted] = useState(false)

  // Compute all 4 model solutions
  const modelSolutions = useMemo(() => {
    // Downsample for performance
    const downsample = (data: Array<Record<string, number>>, maxPoints = 1500) => {
      if (data.length <= maxPoints) return data
      const step = Math.ceil(data.length / maxPoints)
      return data.filter((_, i) => i % step === 0)
    }

    return MODEL_CONFIGS.map(({ type, derivs }) => {
      const y0 = getInitialConditions(type, 0.001)
      const sol = solve(derivs, y0, [0, T_END], DT, PARAMS)
      return {
        type,
        data: downsample(solutionToSeries(sol, type)),
        r0: computeR0(type, PARAMS),
      }
    })
  }, [])

  const score = useMemo(() => {
    if (!submitted) return 0
    return CHAPTER_5_QUIZ.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correctIndex ? 1 : 0)
    }, 0)
  }, [submitted, answers])

  const chapter = CHAPTERS[4]

  return (
    <div className="space-y-6">
      <NarrativePanel title="Council Presentation" variant="briefing">
        <p>{chapter.narrative}</p>
      </NarrativePanel>

      {/* 4-model comparison grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modelSolutions.map(({ type, data, r0 }) => (
          <div
            key={type}
            className="rounded-xl border border-slate-700 bg-slate-800/30 p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-slate-200">{type}</span>
              <span className="text-xs font-mono text-slate-400">R₀ = {r0.toFixed(2)}</span>
            </div>
            <EpidemicChart
              data={data}
              model={type}
              height={220}
              thresholdS={1 / r0}
            />
          </div>
        ))}
      </div>

      <MetricsDashboard
        metrics={modelSolutions.map(({ type, r0 }) => ({
          label: `${type} R₀`,
          value: r0.toFixed(2),
          color: MODEL_CONFIGS.find((m) => m.type === type)?.color,
        }))}
      />

      {/* Quiz */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-6 space-y-6">
        <h3 className="text-lg font-semibold text-slate-200">Reflection Questions</h3>

        {CHAPTER_5_QUIZ.map((q) => (
          <div key={q.id} className="space-y-2">
            <p className="text-sm text-slate-300">{q.question}</p>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, i) => {
                const isSelected = answers[q.id] === i
                const isCorrect = submitted && i === q.correctIndex
                const isWrong = submitted && isSelected && i !== q.correctIndex

                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (!submitted) {
                        setAnswers((a) => ({ ...a, [q.id]: i }))
                      }
                    }}
                    className={`px-3 py-2 rounded-lg text-sm text-left transition-all border ${
                      isCorrect
                        ? 'border-green-500 bg-green-500/10 text-green-300'
                        : isWrong
                          ? 'border-red-500 bg-red-500/10 text-red-300'
                          : isSelected
                            ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
            {submitted && (
              <p className="text-xs text-slate-400 italic">{q.explanation}</p>
            )}
          </div>
        ))}

        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < CHAPTER_5_QUIZ.length}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white
              hover:bg-blue-500 disabled:opacity-30 transition-all"
          >
            Submit Answers
          </button>
        ) : (
          <div className="rounded-lg bg-slate-700/50 p-4">
            <p className="text-lg font-semibold text-slate-200">
              Score: {score}/{CHAPTER_5_QUIZ.length}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {score === CHAPTER_5_QUIZ.length
                ? 'Excellent detective work! You\'ve mastered the model trade-offs.'
                : 'Review the explanations above to strengthen your understanding.'}
            </p>
          </div>
        )}
      </div>

      <NarrativePanel title="Key Insight" variant="insight">
        <p>{chapter.teachingPoint}</p>
      </NarrativePanel>
    </div>
  )
}
