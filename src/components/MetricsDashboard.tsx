interface Metric {
  label: string
  value: string
  color?: string
}

interface MetricsDashboardProps {
  metrics: Metric[]
}

export default function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-lg bg-slate-800/60 border border-slate-700 p-3"
        >
          <div className="text-xs text-slate-400 mb-1">{m.label}</div>
          <div
            className="text-lg font-mono font-semibold"
            style={{ color: m.color || '#f8fafc' }}
          >
            {m.value}
          </div>
        </div>
      ))}
    </div>
  )
}
