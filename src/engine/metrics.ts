import type { SolveResult } from './ode-solver'
import type { ModelType } from './models'

/**
 * Compute R₀ for a given model and parameters.
 */
export function computeR0(
  model: ModelType,
  params: Record<string, number>
): number {
  const { beta, gamma, sigma, mu } = params
  switch (model) {
    case 'SI':
      return beta / mu
    case 'SIR':
    case 'SIRS':
      return beta / (gamma + mu)
    case 'SEIR':
      return (beta * sigma) / ((sigma + mu) * (gamma + mu))
  }
}

/**
 * Find peak infected value and timing from solved data.
 * @param solution - ODE solution
 * @param iIndex  - index of I compartment in state vector (default 1 for SI/SIR/SIRS, 2 for SEIR)
 */
export function findPeak(
  solution: SolveResult,
  iIndex = 1
): { peakValue: number; peakTime: number } {
  let peakValue = 0
  let peakTime = 0
  for (let i = 0; i < solution.t.length; i++) {
    const val = solution.y[i][iIndex]
    if (val > peakValue) {
      peakValue = val
      peakTime = solution.t[i]
    }
  }
  return { peakValue, peakTime }
}

/**
 * Find endemic equilibrium from the tail of the solution.
 * Averages the last 10% of time points for stability.
 */
export function findEquilibrium(
  solution: SolveResult
): { S_star: number; I_star: number } {
  const n = solution.t.length
  const tailStart = Math.floor(n * 0.9)
  let sumS = 0
  let sumI = 0
  let count = 0

  for (let i = tailStart; i < n; i++) {
    sumS += solution.y[i][0]
    // I is at index 1 for SI/SIR/SIRS, index 2 for SEIR
    const iIdx = solution.y[i].length === 4 ? 2 : 1
    sumI += solution.y[i][iIdx]
    count++
  }

  return {
    S_star: sumS / count,
    I_star: sumI / count,
  }
}

/**
 * Final size: S(∞) = S at end of simulation.
 */
export function finalSize(solution: SolveResult): number {
  return solution.y[solution.y.length - 1][0]
}

/**
 * Get the I compartment index for a given model type.
 */
export function getIIndex(model: ModelType): number {
  return model === 'SEIR' ? 2 : 1
}

/**
 * Convert solution to chart-friendly format.
 */
export function solutionToSeries(
  solution: SolveResult,
  model: ModelType
): Array<Record<string, number>> {
  const labels =
    model === 'SI' ? ['S', 'I'] :
    model === 'SEIR' ? ['S', 'E', 'I', 'R'] :
    ['S', 'I', 'R']

  return solution.t.map((t, i) => {
    const point: Record<string, number> = { t }
    labels.forEach((label, j) => {
      point[label] = solution.y[i][j]
    })
    return point
  })
}
