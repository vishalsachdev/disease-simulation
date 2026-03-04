import { useState } from 'react'
import ProgressBar from '../components/ProgressBar'
import { CHAPTERS } from './data/story'
import Chapter1 from './chapters/Chapter1'
import Chapter2 from './chapters/Chapter2'
import Chapter3 from './chapters/Chapter3'
import Chapter4 from './chapters/Chapter4'
import Chapter5 from './chapters/Chapter5'

const CHAPTER_COMPONENTS = [Chapter1, Chapter2, Chapter3, Chapter4, Chapter5]

export default function Sim1App() {
  const [currentChapter, setCurrentChapter] = useState(0)

  const ChapterComponent = CHAPTER_COMPONENTS[currentChapter]
  const chapter = CHAPTERS[currentChapter]

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-100">Patient Zero</h1>
            <p className="text-xs text-slate-500">Mystery Pathogen Investigation</p>
          </div>
          <ProgressBar
            current={currentChapter}
            total={5}
            labels={['Cases', 'Recovery', 'Latent', 'Endemic', 'Trade-off']}
          />
        </div>
      </header>

      {/* Chapter title banner */}
      <div className="bg-gradient-to-r from-blue-950/40 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
              CH {chapter.id}
            </span>
            <h2 className="text-xl font-semibold text-slate-100">{chapter.title}</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">{chapter.subtitle}</p>
        </div>
      </div>

      {/* Chapter content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <ChapterComponent
          onNext={() => setCurrentChapter((c) => Math.min(c + 1, 4))}
          onPrev={() => setCurrentChapter((c) => Math.max(c - 1, 0))}
          isFirst={currentChapter === 0}
          isLast={currentChapter === 4}
        />
      </main>

      {/* Navigation */}
      <footer className="border-t border-slate-800 bg-slate-950/80 backdrop-blur sticky bottom-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between">
          <button
            onClick={() => setCurrentChapter((c) => Math.max(c - 1, 0))}
            disabled={currentChapter === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300
              hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Previous Chapter
          </button>
          <button
            onClick={() => setCurrentChapter((c) => Math.min(c + 1, 4))}
            disabled={currentChapter === 4}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white
              hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next Chapter
          </button>
        </div>
      </footer>
    </div>
  )
}
