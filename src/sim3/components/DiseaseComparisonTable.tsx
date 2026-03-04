import type { DiseaseProfile } from '../../engine/interventions'

interface DiseaseComparisonTableProps {
  diseases: DiseaseProfile[]
  highlightName?: string
}

export default function DiseaseComparisonTable({
  diseases,
  highlightName,
}: DiseaseComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400">
            <th className="text-left py-2 px-2">Disease</th>
            <th className="text-right py-2 px-2">R₀</th>
            <th className="text-right py-2 px-2">θ</th>
            <th className="text-right py-2 px-2">Incubation</th>
            <th className="text-right py-2 px-2">Infectious</th>
            <th className="text-right py-2 px-2">T_OFFSET</th>
            <th className="text-left py-2 px-2">Key Feature</th>
          </tr>
        </thead>
        <tbody>
          {diseases.map((d) => (
            <tr
              key={d.name}
              className={`border-b border-slate-800 ${
                d.name === highlightName
                  ? 'bg-amber-500/5 text-amber-200'
                  : 'text-slate-300'
              }`}
            >
              <td className="py-2 px-2 font-medium">{d.name}</td>
              <td className="py-2 px-2 text-right font-mono">{d.R0}</td>
              <td className="py-2 px-2 text-right font-mono">{d.theta.toFixed(2)}</td>
              <td className="py-2 px-2 text-right font-mono">{d.incubation}d</td>
              <td className="py-2 px-2 text-right font-mono">{d.infectiousPeriod}d</td>
              <td className="py-2 px-2 text-right font-mono"
                style={{ color: d.tOffset < 0 ? '#ef4444' : '#22c55e' }}>
                {d.tOffset > 0 ? '+' : ''}{d.tOffset}d
              </td>
              <td className="py-2 px-2 text-xs text-slate-400">{d.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
