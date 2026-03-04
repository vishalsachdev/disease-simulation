import { useState, useMemo } from 'react'
import NarrativePanel from '../../components/NarrativePanel'
import ParameterSlider from '../../components/ParameterSlider'
import DiseaseComparisonTable from '../components/DiseaseComparisonTable'
import { DISEASE_PRESETS, type DiseaseProfile } from '../../engine/interventions'
import { SCENARIOS } from '../data/diseases'

// Filter to Peak et al. diseases (exclude COVID)
const PEAK_DISEASES = DISEASE_PRESETS.filter(d => d.name !== 'COVID-19')

/**
 * Simplified intervention comparison model (inspired by Peak et al.).
 * Returns R_effective under symptom monitoring vs quarantine.
 */
function computeInterventionR(
  disease: DiseaseProfile,
  isolationEff: number,
  pCT: number,
  dCT: number,
  dSM: number,
) {
  const { R0, theta, infectiousPeriod } = disease

  // Fraction of transmission prevented by symptom monitoring
  // Depends on how quickly cases are isolated after symptom onset
  const fractionPreventedSM = (1 - theta) * isolationEff * Math.max(0, 1 - dSM / infectiousPeriod)

  // Fraction prevented by quarantine (contacts traced and quarantined)
  const fractionPreventedQ = pCT * isolationEff * Math.max(0, 1 - dCT / infectiousPeriod)

  const R_SM = R0 * (1 - fractionPreventedSM)
  const R_Q = R0 * (1 - fractionPreventedQ)

  return { R_SM, R_Q }
}

export default function Scenario3() {
  const [selectedDisease, setSelectedDisease] = useState<string>('SARS')
  const [isolationEff, setIsolationEff] = useState(0.9)
  const [pCT, setPCT] = useState(0.9)
  const [dCT, setDCT] = useState(0.5)
  const [dSM, setDSM] = useState(0.5)

  const scenario = SCENARIOS[2]

  const results = useMemo(() => {
    return PEAK_DISEASES.map(d => {
      const { R_SM, R_Q } = computeInterventionR(d, isolationEff, pCT, dCT, dSM)
      return {
        disease: d,
        R_SM,
        R_Q,
        advantage: R_SM - R_Q,
        relAdvantage: R_Q > 0 ? (R_SM - R_Q) / R_Q : 0,
      }
    })
  }, [isolationEff, pCT, dCT, dSM])

  const selectedResult = results.find(r => r.disease.name === selectedDisease)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <NarrativePanel title="The Debate" variant="briefing">
          <p>{scenario.narrative}</p>
        </NarrativePanel>

        {/* Disease selector */}
        <div className="rounded-xl border border-slate-700/50 p-4 space-y-2"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 className="text-sm font-semibold text-slate-300">Select Disease</h3>
          <div className="flex flex-wrap gap-2">
            {PEAK_DISEASES.map(d => (
              <button
                key={d.name}
                onClick={() => setSelectedDisease(d.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDisease === d.name
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* Intervention parameters */}
        <div className="rounded-xl border border-slate-700/50 p-4 space-y-3"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Setting Parameters
          </h3>
          <ParameterSlider
            label="Isolation effectiveness"
            value={isolationEff}
            min={0.5}
            max={1}
            step={0.05}
            onChange={setIsolationEff}
            displayValue={`${(isolationEff * 100).toFixed(0)}%`}
          />
          <ParameterSlider
            label="P_CT (fraction contacts traced)"
            value={pCT}
            min={0.5}
            max={1}
            step={0.05}
            onChange={setPCT}
            displayValue={`${(pCT * 100).toFixed(0)}%`}
          />
          <ParameterSlider
            label="D_CT (tracing delay)"
            value={dCT}
            min={0.25}
            max={3}
            step={0.25}
            onChange={setDCT}
            displayValue={`${dCT.toFixed(2)}`}
            unit="days"
          />
          <ParameterSlider
            label="D_SM (symptom→isolation delay)"
            value={dSM}
            min={0.25}
            max={3}
            step={0.25}
            onChange={setDSM}
            displayValue={`${dSM.toFixed(2)}`}
            unit="days"
          />
        </div>

        {/* Selected disease result */}
        {selectedResult && (
          <div className="rounded-xl border border-slate-700/50 p-4"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">{selectedDisease} Results</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 p-3">
                <div className="text-xs text-teal-400">R (symptom monitoring)</div>
                <div className="text-xl font-bold font-mono"
                  style={{ color: selectedResult.R_SM < 1 ? '#22c55e' : '#ef4444' }}>
                  {selectedResult.R_SM.toFixed(2)}
                </div>
              </div>
              <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3">
                <div className="text-xs text-purple-400">R (quarantine)</div>
                <div className="text-xl font-bold font-mono"
                  style={{ color: selectedResult.R_Q < 1 ? '#22c55e' : '#ef4444' }}>
                  {selectedResult.R_Q.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400 text-center">
              Quarantine advantage: {selectedResult.advantage.toFixed(2)} ({(selectedResult.relAdvantage * 100).toFixed(0)}% relative)
            </div>
          </div>
        )}

        <NarrativePanel title="Key Insight" variant="insight">
          <p>{scenario.teachingPoint}</p>
        </NarrativePanel>
      </div>

      {/* Right panel */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-xl border border-slate-700/50 p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Disease Comparison (Peak et al.)</h3>
          <DiseaseComparisonTable diseases={PEAK_DISEASES} highlightName={selectedDisease} />
        </div>

        {/* All diseases intervention comparison */}
        <div className="rounded-xl border border-slate-700/50 p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 className="text-sm font-medium text-slate-400 mb-3">
            Intervention Comparison: R_SM vs R_Q
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left py-2">Disease</th>
                <th className="text-right py-2">R₀</th>
                <th className="text-right py-2">R (monitor)</th>
                <th className="text-right py-2">R (quarantine)</th>
                <th className="text-right py-2">Advantage</th>
                <th className="text-center py-2">Winner</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.disease.name}
                  className={`border-b border-slate-800 ${
                    r.disease.name === selectedDisease ? 'bg-amber-500/5' : ''
                  }`}>
                  <td className="py-2 font-medium text-slate-300">{r.disease.name}</td>
                  <td className="py-2 text-right font-mono text-slate-400">{r.disease.R0}</td>
                  <td className="py-2 text-right font-mono"
                    style={{ color: r.R_SM < 1 ? '#22c55e' : '#ef4444' }}>
                    {r.R_SM.toFixed(2)}
                  </td>
                  <td className="py-2 text-right font-mono"
                    style={{ color: r.R_Q < 1 ? '#22c55e' : '#ef4444' }}>
                    {r.R_Q.toFixed(2)}
                  </td>
                  <td className="py-2 text-right font-mono text-slate-400">
                    {r.advantage.toFixed(2)}
                  </td>
                  <td className="py-2 text-center text-xs">
                    {r.advantage > 0.1
                      ? <span className="text-purple-400">Quarantine</span>
                      : <span className="text-teal-400">Either</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
