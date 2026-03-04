interface ProgressBarProps {
  current: number
  total: number
  labels?: string[]
}

export default function ProgressBar({ current, total, labels }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const isComplete = i < current
        const isCurrent = i === current
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                  ${
                    isComplete
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                        ? 'bg-blue-500/30 text-blue-300 ring-2 ring-blue-500'
                        : 'bg-slate-700 text-slate-500'
                  }`}
              >
                {i + 1}
              </div>
              {labels && labels[i] && (
                <span className={`text-[10px] mt-1 max-w-16 text-center leading-tight
                  ${isCurrent ? 'text-blue-300' : 'text-slate-500'}`}>
                  {labels[i]}
                </span>
              )}
            </div>
            {i < total - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  isComplete ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
