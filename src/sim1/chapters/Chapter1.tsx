import { useState, useEffect, useMemo, useCallback } from 'react'
import NarrativePanel from '../../components/NarrativePanel'
import ModelSelector from '../../components/ModelSelector'
import { solve } from '../../engine/ode-solver'
import { sirModel, MODELS, getInitialConditions } from '../../engine/models'
import { solutionToSeries } from '../../engine/metrics'
import type { ModelType } from '../../engine/models'
import { CHAPTERS } from '../data/story'

interface ChapterProps {
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
}

const PARAMS = { beta: 200, gamma: 365 / 7, sigma: 365 / 5, mu: 0.02, omega: 365 / 30 }
const DT = 0.0001
const T_END = 0.12 // ~44 days — enough to see early rise

export default function Chapter1(_props: ChapterProps) {
  const [selectedModel, setSelectedModel] = useState<ModelType>('SIR')
  const [revealedDays, setRevealedDays] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // "Observed" data: pre-generated from SIR with noise
  const observedData = useMemo(() => {
    const y0 = getInitialConditions('SIR', 0.001)
    const sol = solve(sirModel, y0, [0, T_END], DT, PARAMS)
    // Sample every ~1 day (1/365 year)
    const dayStep = Math.max(1, Math.floor((1 / 365) / DT))
    const points: Array<{ day: number; cases: number }> = []
    for (let i = 0; i < sol.t.length; i += dayStep) {
      points.push({
        day: Math.round(sol.t[i] * 365),
        cases: sol.y[i][1], // I compartment
      })
    }
    return points
  }, [])

  // Player's chosen model curve
  const modelData = useMemo(() => {
    const y0 = getInitialConditions(selectedModel, 0.001)
    const derivs = MODELS[selectedModel]
    const sol = solve(derivs, y0, [0, T_END], DT, PARAMS)
    return solutionToSeries(sol, selectedModel)
  }, [selectedModel])

  // Animate reveal
  useEffect(() => {
    if (!isPlaying) return
    if (revealedDays >= observedData.length - 1) {
      setIsPlaying(false)
      return
    }
    const timer = setTimeout(() => setRevealedDays((d) => d + 1), 200)
    return () => clearTimeout(timer)
  }, [isPlaying, revealedDays, observedData.length])

  const startAnimation = useCallback(() => {
    setRevealedDays(0)
    setIsPlaying(true)
  }, [])

  // Build chart data: observed (revealed) + model overlay
  const chartData = useMemo(() => {
    // Sample model data at same day intervals
    const dayStep = Math.max(1, Math.floor((1 / 365) / DT))
    return observedData.slice(0, revealedDays + 1).map((obs, i) => ({
      t: obs.day,
      Observed: obs.cases,
      Model: modelData[i * dayStep]?.I ?? 0,
    }))
  }, [observedData, modelData, revealedDays])

  const chapter = CHAPTERS[0]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Narrative */}
      <div className="space-y-4">
        <NarrativePanel title="Mission Briefing" variant="briefing">
          <p>{chapter.narrative}</p>
        </NarrativePanel>

        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300">Select a model:</label>
          <ModelSelector selected={selectedModel} onChange={setSelectedModel} />
        </div>

        <button
          onClick={startAnimation}
          className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white
            hover:bg-blue-500 transition-all"
        >
          {revealedDays === 0 ? 'Start Day-by-Day Reveal' : 'Restart Animation'}
        </button>

        {revealedDays >= observedData.length - 1 && (
          <NarrativePanel title="Key Insight" variant="insight">
            <p>{chapter.teachingPoint}</p>
          </NarrativePanel>
        )}
      </div>

      {/* Right: Chart */}
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">
              Epidemic Curve — Day {observedData[revealedDays]?.day ?? 0}
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {selectedModel} model overlay
            </span>
          </div>
          <div className="h-[350px]">
            {chartData.length > 0 && (
              <EpidemicChartCustom data={chartData} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom chart for Chapter 1 (observed dots + model line)
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

function EpidemicChartCustom({ data }: { data: Array<Record<string, number>> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="t"
          stroke="#64748b"
          fontSize={12}
          label={{ value: 'Day', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 11 }}
        />
        <YAxis
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(v: number) => v.toFixed(3)}
          label={{ value: 'Infected (proportion)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            fontSize: 12,
          }}
          formatter={(value) => [Number(value).toFixed(5), undefined]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="Observed"
          stroke="#ef4444"
          strokeWidth={0}
          dot={{ fill: '#ef4444', r: 3 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="Model"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          strokeDasharray="6 3"
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
