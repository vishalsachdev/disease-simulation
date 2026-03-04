interface ParameterSliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  displayValue?: string
  unit?: string
  disabled?: boolean
}

export default function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
  unit,
  disabled = false,
}: ParameterSliderProps) {
  return (
    <div className={`flex flex-col gap-1 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-center text-sm">
        <label className="text-slate-300 font-medium">{label}</label>
        <span className="text-slate-400 font-mono text-xs">
          {displayValue ?? value.toFixed(2)}
          {unit && <span className="text-slate-500 ml-1">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
          bg-slate-600 accent-blue-500 disabled:cursor-not-allowed"
      />
    </div>
  )
}
