export type DerivsFn = (y: number[], t: number, params: Record<string, number>) => number[]

export interface SolveResult {
  t: number[]
  y: number[][]
}

/**
 * Single RK4 step.
 */
function rk4Step(
  derivs: DerivsFn,
  y: number[],
  t: number,
  dt: number,
  params: Record<string, number>
): number[] {
  const k1 = derivs(y, t, params)
  const k2 = derivs(
    y.map((v, i) => v + (dt / 2) * k1[i]),
    t + dt / 2,
    params
  )
  const k3 = derivs(
    y.map((v, i) => v + (dt / 2) * k2[i]),
    t + dt / 2,
    params
  )
  const k4 = derivs(
    y.map((v, i) => v + dt * k3[i]),
    t + dt,
    params
  )
  return y.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]))
}

/**
 * Solve an ODE system using RK4.
 * @param derivs  - derivative function (y, t, params) => dy
 * @param y0      - initial state vector
 * @param tSpan   - [t_start, t_end]
 * @param dt      - time step
 * @param params  - model parameters
 * @returns { t: number[], y: number[][] } where y[i] is state at t[i]
 */
export function solve(
  derivs: DerivsFn,
  y0: number[],
  tSpan: [number, number],
  dt: number,
  params: Record<string, number>
): SolveResult {
  const [tStart, tEnd] = tSpan
  const steps = Math.ceil((tEnd - tStart) / dt)
  const t: number[] = [tStart]
  const y: number[][] = [y0.slice()]

  let currentY = y0.slice()
  let currentT = tStart

  for (let i = 0; i < steps; i++) {
    const stepDt = Math.min(dt, tEnd - currentT)
    currentY = rk4Step(derivs, currentY, currentT, stepDt, params)
    currentT += stepDt
    t.push(currentT)
    y.push(currentY.slice())
  }

  return { t, y }
}
