import NarrativePanel from '../../components/NarrativePanel'
import FraserPlot from '../components/FraserPlot'
import DiseaseComparisonTable from '../components/DiseaseComparisonTable'
import { DISEASE_PRESETS, criticalVaccinationProportion } from '../../engine/interventions'

export default function Epilogue() {
  return (
    <div className="space-y-6">
      <NarrativePanel title="The Debrief" variant="briefing">
        <p>
          Your tour of duty is complete. You've faced outbreaks from SARS to COVID-19,
          debated quarantine versus monitoring, and seen how NPI timing changed history.
          Here's your summary dashboard.
        </p>
      </NarrativePanel>

      {/* Fraser plot with all diseases */}
      <div className="rounded-xl border border-slate-700/50 p-4"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
        <FraserPlot diseases={DISEASE_PRESETS} />
      </div>

      {/* Full disease comparison */}
      <div className="rounded-xl border border-slate-700/50 p-4"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
        <h3 className="text-sm font-medium text-slate-400 mb-3">Complete Disease Reference</h3>
        <DiseaseComparisonTable diseases={DISEASE_PRESETS} />
      </div>

      {/* Vaccination thresholds */}
      <div className="rounded-xl border border-slate-700/50 p-4"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
        <h3 className="text-sm font-medium text-slate-400 mb-3">Vaccination Thresholds (p_c = 1 - 1/R₀)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DISEASE_PRESETS.map(d => {
            const pc = criticalVaccinationProportion(d.R0)
            return (
              <div key={d.name} className="rounded-lg bg-slate-800/50 border border-slate-700 p-3">
                <div className="text-xs text-slate-400">{d.name}</div>
                <div className="text-lg font-bold font-mono text-amber-400">
                  {(pc * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] text-slate-500">R₀ = {d.R0}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Key takeaways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NarrativePanel title="1. Low θ → Isolation Works" variant="insight">
          <p>
            When most transmission is symptomatic (low θ), isolating cases after
            symptom onset can reduce R below 1. SARS (θ=0.10) was controlled this way.
            <span className="text-slate-500 text-xs block mt-1">See Scenario 1: The SARS Playbook</span>
          </p>
        </NarrativePanel>
        <NarrativePanel title="2. High θ → Need Layered Response" variant="insight">
          <p>
            When significant transmission is presymptomatic (high θ), isolation alone
            fails. You need contact tracing, quarantine, and/or vaccination. COVID-19 (θ=0.62)
            required all of these.
            <span className="text-slate-500 text-xs block mt-1">See Scenario 2: The COVID Challenge</span>
          </p>
        </NarrativePanel>
        <NarrativePanel title="3. Quarantine vs Monitoring: It Depends" variant="insight">
          <p>
            Quarantine outperforms symptom monitoring for fast-course diseases where
            infectiousness starts before symptoms. The benefit depends on both disease
            biology and implementation quality (tracing speed, coverage).
            <span className="text-slate-500 text-xs block mt-1">See Scenario 3: The Quarantine Debate</span>
          </p>
        </NarrativePanel>
        <NarrativePanel title="4. Timing Is Everything" variant="insight">
          <p>
            The Philadelphia vs St. Louis comparison shows that early NPI implementation
            dramatically reduces peak infection and total cases. A delay of even 1-2 weeks
            can overwhelm hospital capacity.
            <span className="text-slate-500 text-xs block mt-1">See Scenario 4: The Philadelphia Lesson</span>
          </p>
        </NarrativePanel>
      </div>

      <div className="text-center py-6">
        <div className="text-2xl font-bold text-slate-200 mb-2">
          p_c = 1 - 1/R₀
        </div>
        <p className="text-sm text-slate-400">
          The critical vaccination proportion. This single equation connects
          R₀ to the fraction of the population that must be immunized for herd immunity.
        </p>
      </div>
    </div>
  )
}
