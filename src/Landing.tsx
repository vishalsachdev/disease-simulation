import { Link } from 'react-router-dom'
import { Microscope, Shield } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8">
      <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-slate-100 text-center">
        Disease Simulation Lab
      </h1>
      <p className="text-base sm:text-lg text-slate-400 mb-12 text-center max-w-2xl leading-relaxed">
        Interactive epidemiological simulations for exploring compartmental models,
        intervention strategies, and outbreak dynamics.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        <Link
          to="/sim1"
          className="group block rounded-xl border border-slate-700 bg-slate-800/50 p-6 sm:p-8 hover:border-blue-500 hover:bg-slate-800 transition-all"
        >
          <Microscope className="w-12 h-12 text-blue-400 mb-4 group-hover:text-blue-300" />
          <h2 className="text-2xl font-semibold mb-2 text-slate-100">Patient Zero</h2>
          <p className="text-base text-slate-400 leading-relaxed">
            Mystery pathogen detective story. Progress through SI, SIR, SEIR, and SIRS
            models to identify and characterize an unknown outbreak.
          </p>
          <div className="mt-4 text-sm text-slate-500">5 chapters</div>
        </Link>

        <Link
          to="/sim3"
          className="group block rounded-xl border border-slate-700 bg-slate-800/50 p-6 sm:p-8 hover:border-purple-500 hover:bg-slate-800 transition-all"
        >
          <Shield className="w-12 h-12 text-purple-400 mb-4 group-hover:text-purple-300" />
          <h2 className="text-2xl font-semibold mb-2 text-slate-100">Outbreak Command</h2>
          <p className="text-base text-slate-400 leading-relaxed">
            Intervention strategy simulator. Deploy isolation, contact tracing,
            quarantine, and vaccination to control outbreaks using the Fraser framework.
          </p>
          <div className="mt-4 text-sm text-slate-500">4 scenarios + epilogue</div>
        </Link>
      </div>
    </div>
  )
}
