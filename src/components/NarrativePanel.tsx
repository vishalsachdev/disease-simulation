import type { ReactNode } from 'react'

interface NarrativePanelProps {
  title: string
  children: ReactNode
  variant?: 'briefing' | 'insight' | 'default'
}

export default function NarrativePanel({
  title,
  children,
  variant = 'default',
}: NarrativePanelProps) {
  const borderColor =
    variant === 'briefing' ? 'border-blue-500/40' :
    variant === 'insight' ? 'border-amber-500/40' :
    'border-slate-700'

  const bgColor =
    variant === 'briefing' ? 'bg-blue-950/30' :
    variant === 'insight' ? 'bg-amber-950/20' :
    'bg-slate-800/40'

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-5`}>
      <h3 className="text-base font-semibold text-slate-200 mb-3">{title}</h3>
      <div className="text-sm text-slate-300 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  )
}
