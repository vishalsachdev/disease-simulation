import { useState, useMemo } from 'react'
import NarrativePanel from '../../components/NarrativePanel'
import MetricsDashboard from '../../components/MetricsDashboard'
import InterventionPanel from '../components/InterventionPanel'
import REffectiveGauge from '../components/REffectiveGauge'
import FraserPlot from '../components/FraserPlot'
import InfectiousnessProfileChart from '../components/InfectiousnessProfile'
import { computeREffective, DISEASE_PRESETS } from '../../engine/interventions'
import { SCENARIOS } from '../data/diseases'
import { SCENARIO_QUIZZES } from '../data/quizzes'

export default function Scenario1() {
  const [isolationOn, setIsolationOn] = useState(false)
  const [isolationEff, setIsolationEff] = useState(0.8)
  const [tracingOn, setTracingOn] = useState(false)
  const [tracingEff, setTracingEff] = useState(0.5)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const R0 = 2.5
  const theta = 0.10

  const rEff = useMemo(() => {
    const ei = isolationOn ? isolationEff : 0
    const et = tracingOn ? tracingEff : 0
    return computeREffective(R0, theta, ei, et)
  }, [isolationOn, isolationEff, tracingOn, tracingEff])

  const scenario = SCENARIOS[0]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel */}
      <div className="space-y-4">
        <NarrativePanel title="Intelligence Briefing" variant="briefing">
          <p>{scenario.narrative}</p>
        </NarrativePanel>

        <MetricsDashboard
          metrics={[
            { label: 'R₀', value: R0.toFixed(1), color: '#ef4444' },
            { label: 'θ', value: theta.toFixed(2), color: '#22c55e' },
            { label: '1/R₀', value: (1 / R0).toFixed(2), color: '#fbbf24' },
            { label: 'θ < 1/R₀?', value: theta < 1 / R0 ? 'YES' : 'NO', color: theta < 1 / R0 ? '#22c55e' : '#ef4444' },
          ]}
        />

        <InterventionPanel
          isolationOn={isolationOn}
          onIsolationToggle={setIsolationOn}
          isolationEff={isolationEff}
          onIsolationEff={setIsolationEff}
          tracingOn={tracingOn}
          onTracingToggle={setTracingOn}
          tracingEff={tracingEff}
          onTracingEff={setTracingEff}
        />

        <REffectiveGauge value={rEff} />

        {rEff < 1 && (
          <NarrativePanel title="Outbreak Contained" variant="insight">
            <p>{scenario.teachingPoint}</p>
          </NarrativePanel>
        )}

        {/* Quiz */}
        {SCENARIO_QUIZZES.scenario1.map((quiz) => (
          <div key={quiz.id} className="rounded-xl border border-slate-700/50 p-4 space-y-3"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
            <h3 className="text-sm font-semibold text-slate-300">Check Understanding</h3>
            <p className="text-sm text-slate-400">{quiz.question}</p>
            {quiz.options.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="radio" name={quiz.id} value={i}
                  checked={selectedAnswer === i}
                  onChange={() => { setSelectedAnswer(i); setShowAnswer(false) }}
                  className="accent-blue-500" />
                {opt}
              </label>
            ))}
            <button onClick={() => setShowAnswer(true)}
              disabled={selectedAnswer === null}
              className="w-full px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white
                hover:bg-blue-500 disabled:opacity-30 transition-all">
              Check Answer
            </button>
            {showAnswer && (
              <div className={`text-sm p-3 rounded-lg ${
                selectedAnswer === quiz.correctIndex
                  ? 'bg-green-500/10 text-green-300'
                  : 'bg-red-500/10 text-red-300'
              }`}>
                {selectedAnswer === quiz.correctIndex ? 'Correct! ' : 'Not quite. '}
                {quiz.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-xl border border-slate-700/50 p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <InfectiousnessProfileChart
            peakDay={7}
            symptomOnsetDay={5}
            shape={3}
            maxDays={18}
            title="SARS-like Infectiousness Profile — β(τ)"
          />
          <p className="text-xs text-slate-500 mt-2">
            Peak infectiousness occurs AFTER symptom onset (day 5). Only {(theta * 100).toFixed(0)}% of
            transmission happens before symptoms — isolation is effective.
          </p>
        </div>

        <div className="rounded-xl border border-slate-700/50 p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <FraserPlot
            diseases={DISEASE_PRESETS}
            highlightName="SARS"
            epsilon_i={isolationOn ? isolationEff : 0}
            epsilon_t={tracingOn ? tracingEff : 0}
          />
        </div>
      </div>
    </div>
  )
}
