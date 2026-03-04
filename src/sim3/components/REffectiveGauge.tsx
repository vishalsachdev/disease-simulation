interface REffectiveGaugeProps {
  value: number
  label?: string
}

export default function REffectiveGauge({ value, label = 'R effective' }: REffectiveGaugeProps) {
  const isControlled = value < 1
  const color = value < 0.8 ? '#22c55e' : value < 1 ? '#f59e0b' : value < 1.5 ? '#f97316' : '#ef4444'
  const status = isControlled ? 'CONTROLLED' : 'UNCONTROLLED'
  const percentage = Math.min(value / 3, 1) * 100

  return (
    <div className="rounded-xl border p-4 text-center"
      style={{
        borderColor: isControlled ? '#22c55e30' : '#ef444430',
        backgroundColor: isControlled ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
      }}
    >
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-3xl font-bold font-mono" style={{ color }}>
        {value.toFixed(2)}
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-600">
        <span>0</span>
        <span className="text-amber-400">1.0</span>
        <span>3.0</span>
      </div>
      <div className="mt-2 text-xs font-semibold tracking-wider" style={{ color }}>
        {status}
      </div>
    </div>
  )
}
