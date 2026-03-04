import type { ModelType } from '../engine/models'

interface ModelSelectorProps {
  selected: ModelType
  onChange: (model: ModelType) => void
  available?: ModelType[]
}

const MODEL_LABELS: Record<ModelType, string> = {
  SI: 'SI',
  SIR: 'SIR',
  SEIR: 'SEIR',
  SIRS: 'SIRS',
}

export default function ModelSelector({
  selected,
  onChange,
  available = ['SI', 'SIR', 'SEIR', 'SIRS'],
}: ModelSelectorProps) {
  return (
    <div className="flex gap-2">
      {available.map((model) => (
        <button
          key={model}
          onClick={() => onChange(model)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
            ${
              selected === model
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
        >
          {MODEL_LABELS[model]}
        </button>
      ))}
    </div>
  )
}
