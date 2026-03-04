import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import NarrativePanel from '../../components/NarrativePanel'
import MetricsDashboard from '../../components/MetricsDashboard'
import ParameterSlider from '../../components/ParameterSlider'
import InterventionPanel from '../components/InterventionPanel'
import REffectiveGauge from '../components/REffectiveGauge'
import FraserPlot from '../components/FraserPlot'
import InfectiousnessProfileChart from '../components/InfectiousnessProfile'
import { computeREffective, DISEASE_PRESETS, criticalVaccinationProportion } from '../../engine/interventions'
import { SCENARIOS } from '../data/diseases'
import { COVID_R0_DECOMPOSITION } from '../data/diseases'
import { SCENARIO_QUIZZES } from '../data/quizzes'

export default function Scenario2() {
  const [isolationOn, setIsolationOn] = useState(false)
  const [isolationEff, setIsolationEff] = useState(0.8)
  const [tracingOn, setTracingOn] = useState(false)
  const [tracingEff, setTracingEff] = useState(0.5)
  const [vaccinationOn, setVaccinationOn] = useState(false)
  const [vacProportion, setVacProportion] = useState(0.3)
  const [r0Slider, setR0Slider] = useState(2.0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const theta = 0.62

  const rEffNPI = useMemo(() => {
    const ei = isolationOn ? isolationEff : 0
    const et = tracingOn ? tracingEff : 0
    return computeREffective(r0Slider, theta, ei, et)
  }, [r0Slider, isolationOn, isolationEff, tracingOn, tracingEff])

  // Vaccination reduces susceptible pool
  const rEff = vaccinationOn ? rEffNPI * (1 - vacProportion) : rEffNPI

  const pc = criticalVaccinationProportion(r0Slider)

  // R₀ decomposition bar data
  const decompositionData = [
    { name: 'Presymptomatic', value: COVID_R0_DECOMPOSITION.R_P.value, color: '#f97316' },
    { name: 'Symptomatic', value: COVID_R0_DECOMPOSITION.R_S.value, color: '#3b82f6' },
    { name: 'Environmental', value: COVID_R0_DECOMPOSITION.R_E.value, color: '#14b8a6' },
    { name: 'Asymptomatic', value: COVID_R0_DECOMPOSITION.R_A.value, color: '#8b5cf6' },
  ]

  const scenario = SCENARIOS[1]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel */}
      <div className="space-y-4">
        <NarrativePanel title="Intelligence Briefing" variant="briefing">
          <p>{scenario.narrative}</p>
        </NarrativePanel>

        <div className="rounded-xl border border-slate-700/50 p-4 space-y-3"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <ParameterSlider
            label="R₀"
            value={r0Slider}
            min={1.5}
            max={3.0}
            step={0.1}
            onChange={setR0Slider}
          />
        </div>

        <MetricsDashboard
          metrics={[
            { label: 'R₀', value: r0Slider.toFixed(1), color: '#ef4444' },
            { label: 'θ', value: theta.toFixed(2), color: '#f97316' },
            { label: 'p_c', value: `${(pc * 100).toFixed(0)}%`, color: '#eab308' },
            { label: 'θ < 1/R₀?', value: theta < 1 / r0Slider ? 'YES' : 'NO', color: '#ef4444' },
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
          vaccinationOn={vaccinationOn}
          onVaccinationToggle={setVaccinationOn}
          vacProportion={vacProportion}
          onVacProportion={setVacProportion}
        />

        <REffectiveGauge value={rEff} />

        {rEff < 1 && (
          <NarrativePanel title="Outbreak Controlled" variant="insight">
            <p>{scenario.teachingPoint}</p>
          </NarrativePanel>
        )}

        {/* Quiz */}
        {SCENARIO_QUIZZES.scenario2.map((quiz) => (
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
        {/* R₀ Decomposition */}
        <div className="rounded-xl border border-slate-700/50 p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            COVID-19 R₀ Decomposition (Ferretti et al.)
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={decompositionData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis type="number" domain={[0, 1]} stroke="#64748b" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f1d32',
                  border: '1px solid #1e3a5f',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
                formatter={(value) => [Number(value).toFixed(2), 'R contribution']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {decompositionData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-500 mt-1">
            Total R₀ = {COVID_R0_DECOMPOSITION.total}. Non-symptomatic transmission: {(theta * 100).toFixed(0)}%.
          </p>
        </div>

        {/* Infectiousness profile */}
        <div className="rounded-xl border border-slate-700/50 p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <InfectiousnessProfileChart
            peakDay={3.5}
            symptomOnsetDay={5}
            shape={3}
            maxDays={18}
            title="COVID-like Infectiousness Profile — β(τ)"
          />
          <p className="text-xs text-slate-500 mt-2">
            Peak infectiousness occurs BEFORE symptom onset — significant presymptomatic transmission.
          </p>
        </div>

        {/* Fraser plot */}
        <div className="rounded-xl border border-slate-700/50 p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <FraserPlot
            diseases={DISEASE_PRESETS}
            highlightName="COVID-19"
            epsilon_i={isolationOn ? isolationEff : 0}
            epsilon_t={tracingOn ? tracingEff : 0}
          />
        </div>
      </div>
    </div>
  )
}
