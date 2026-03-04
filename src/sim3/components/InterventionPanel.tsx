import ParameterSlider from '../../components/ParameterSlider'

interface InterventionPanelProps {
  isolationOn: boolean
  onIsolationToggle: (on: boolean) => void
  isolationEff: number
  onIsolationEff: (v: number) => void

  tracingOn: boolean
  onTracingToggle: (on: boolean) => void
  tracingEff: number
  onTracingEff: (v: number) => void

  vaccinationOn?: boolean
  onVaccinationToggle?: (on: boolean) => void
  vacProportion?: number
  onVacProportion?: (v: number) => void

  compact?: boolean
}

function Toggle({ label, on, onToggle, color }: { label: string; on: boolean; onToggle: (v: boolean) => void; color: string }) {
  return (
    <button
      onClick={() => onToggle(!on)}
      className="flex items-center gap-2 text-sm"
    >
      <div
        className="w-8 h-4 rounded-full transition-all relative"
        style={{ backgroundColor: on ? color : '#475569' }}
      >
        <div
          className="w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all"
          style={{ left: on ? '17px' : '2px' }}
        />
      </div>
      <span className={on ? 'text-slate-200' : 'text-slate-500'}>{label}</span>
    </button>
  )
}

export default function InterventionPanel({
  isolationOn, onIsolationToggle, isolationEff, onIsolationEff,
  tracingOn, onTracingToggle, tracingEff, onTracingEff,
  vaccinationOn, onVaccinationToggle, vacProportion, onVacProportion,
  compact,
}: InterventionPanelProps) {
  return (
    <div className={`rounded-xl border border-slate-700/50 p-4 space-y-4 ${compact ? 'text-sm' : ''}`}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Interventions
      </h3>

      {/* Isolation */}
      <div className="space-y-2">
        <Toggle label="Case Isolation" on={isolationOn} onToggle={onIsolationToggle} color="#3b82f6" />
        {isolationOn && (
          <ParameterSlider
            label="εᵢ (isolation effectiveness)"
            value={isolationEff}
            min={0}
            max={1}
            step={0.05}
            onChange={onIsolationEff}
            displayValue={`${(isolationEff * 100).toFixed(0)}%`}
          />
        )}
      </div>

      {/* Contact tracing */}
      <div className="space-y-2">
        <Toggle label="Contact Tracing + Quarantine" on={tracingOn} onToggle={onTracingToggle} color="#8b5cf6" />
        {tracingOn && (
          <ParameterSlider
            label="εₜ (tracing effectiveness)"
            value={tracingEff}
            min={0}
            max={1}
            step={0.05}
            onChange={onTracingEff}
            displayValue={`${(tracingEff * 100).toFixed(0)}%`}
          />
        )}
      </div>

      {/* Vaccination (optional) */}
      {onVaccinationToggle && vaccinationOn !== undefined && (
        <div className="space-y-2">
          <Toggle label="Vaccination" on={vaccinationOn} onToggle={onVaccinationToggle} color="#eab308" />
          {vaccinationOn && onVacProportion && vacProportion !== undefined && (
            <ParameterSlider
              label="p (vaccination proportion)"
              value={vacProportion}
              min={0}
              max={1}
              step={0.01}
              onChange={onVacProportion}
              displayValue={`${(vacProportion * 100).toFixed(0)}%`}
            />
          )}
        </div>
      )}
    </div>
  )
}
