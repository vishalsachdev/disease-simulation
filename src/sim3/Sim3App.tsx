import { useState } from 'react'
import NarrativePanel from '../components/NarrativePanel'
import { SCENARIOS } from './data/diseases'
import Scenario1 from './scenarios/Scenario1'
import Scenario2 from './scenarios/Scenario2'
import Scenario3 from './scenarios/Scenario3'
import Scenario4 from './scenarios/Scenario4'
import Epilogue from './scenarios/Epilogue'

const SCENARIO_COMPONENTS = [Scenario1, Scenario2, Scenario3, Scenario4, Epilogue]
const SCENARIO_LABELS = ['SARS', 'COVID', 'Quarantine', 'Philly', 'Debrief']

export default function Sim3App() {
  const [currentScenario, setCurrentScenario] = useState(0)

  const ScenarioComponent = SCENARIO_COMPONENTS[currentScenario]
  const scenario = currentScenario < SCENARIOS.length ? SCENARIOS[currentScenario] : null

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a1628' }}>
      {/* Command center header */}
      <header className="border-b border-slate-700/50 backdrop-blur sticky top-0 z-10"
        style={{ backgroundColor: 'rgba(10, 22, 40, 0.9)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-wide">
                OUTBREAK COMMAND
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                National Health Agency — Situation Room
              </p>
            </div>
          </div>

          {/* Scenario tabs */}
          <div className="flex gap-1">
            {SCENARIO_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => setCurrentScenario(i)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  currentScenario === i
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {i < SCENARIOS.length ? `S${i + 1}` : ''} {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Scenario banner */}
      {scenario && (
        <div className="border-b border-slate-700/30"
          style={{ background: 'linear-gradient(to right, rgba(30,58,138,0.2), rgba(10,22,40,1))' }}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                SCENARIO {scenario.id}
              </span>
              <h2 className="text-lg font-semibold text-slate-100">{scenario.title}</h2>
              <span className="text-xs text-slate-500">{scenario.subtitle}</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentScenario === 0 && (
          <div className="max-w-3xl mx-auto mb-6">
            <NarrativePanel title="Shifting Gears" variant="briefing">
              <p>
                In Patient Zero, you learned <strong>how</strong> epidemics work — compartmental
                models, R₀, and endemic dynamics. Now you'll learn <strong>how to stop them</strong>.
              </p>
              <p className="mt-2">
                The key shift: instead of tracking compartments over time (differential equations),
                you'll compute whether interventions can push R<sub>eff</sub> below 1 (algebra).
                Your tools: isolation, contact tracing, quarantine, and vaccination.
              </p>
            </NarrativePanel>
          </div>
        )}
        <ScenarioComponent />
      </main>

      {/* Footer nav */}
      <footer className="border-t border-slate-700/30 backdrop-blur sticky bottom-0"
        style={{ backgroundColor: 'rgba(10, 22, 40, 0.9)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between">
          <button
            onClick={() => setCurrentScenario((c) => Math.max(c - 1, 0))}
            disabled={currentScenario === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300
              hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all
              border border-slate-700"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentScenario((c) => Math.min(c + 1, SCENARIO_COMPONENTS.length - 1))}
            disabled={currentScenario === SCENARIO_COMPONENTS.length - 1}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white
              hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next Scenario
          </button>
        </div>
      </footer>
    </div>
  )
}
