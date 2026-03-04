import type { DerivsFn } from './ode-solver'

// ── Default parameter values (from course materials) ──
export const DEFAULT_PARAMS = {
  beta: 200,        // Transmission rate
  gamma: 365 / 7,   // Recovery rate (7-day infectious period) ≈ 52.14
  sigma: 365 / 5,   // Latent rate (5-day latent period) = 73
  mu: 0.02,         // Birth/death rate per year
  omega: 365 / 30,  // Waning immunity rate (30-day duration) ≈ 12.17
} as const

// ── Model types ──
export type ModelType = 'SI' | 'SIR' | 'SEIR' | 'SIRS'

// ── Compartment indices per model ──
export const COMPARTMENTS: Record<ModelType, string[]> = {
  SI: ['S', 'I'],
  SIR: ['S', 'I', 'R'],
  SEIR: ['S', 'E', 'I', 'R'],
  SIRS: ['S', 'I', 'R'],
}

// ── SI with demography ──
// dS/dt = μ - βSI - μS
// dI/dt = βSI - μI
export const siModel: DerivsFn = (y, _t, p) => {
  const [S, I] = y
  const { beta, mu } = p
  return [
    mu - beta * S * I - mu * S,
    beta * S * I - mu * I,
  ]
}

// ── SIR with demography ──
// dS/dt = μ - βSI - μS
// dI/dt = βSI - γI - μI
// dR/dt = γI - μR
export const sirModel: DerivsFn = (y, _t, p) => {
  const [S, I, R] = y
  const { beta, gamma, mu } = p
  return [
    mu - beta * S * I - mu * S,
    beta * S * I - gamma * I - mu * I,
    gamma * I - mu * R,
  ]
}

// ── SEIR with demography ──
// dS/dt = μ - βSI - μS
// dE/dt = βSI - σE - μE
// dI/dt = σE - γI - μI
// dR/dt = γI - μR
export const seirModel: DerivsFn = (y, _t, p) => {
  const [S, E, I, R] = y
  const { beta, gamma, sigma, mu } = p
  return [
    mu - beta * S * I - mu * S,
    beta * S * I - sigma * E - mu * E,
    sigma * E - gamma * I - mu * I,
    gamma * I - mu * R,
  ]
}

// ── SIRS with demography ──
// dS/dt = μ - βSI + ωR - μS
// dI/dt = βSI - γI - μI
// dR/dt = γI - ωR - μR
export const sirsModel: DerivsFn = (y, _t, p) => {
  const [S, I, R] = y
  const { beta, gamma, mu, omega } = p
  return [
    mu - beta * S * I + omega * R - mu * S,
    beta * S * I - gamma * I - mu * I,
    gamma * I - omega * R - mu * R,
  ]
}

// ── SIR with newborn vaccination ──
// dS/dt = (1-p)μ - βSI - μS
// dI/dt = βSI - γI - μI
// dR/dt = γI + pμ - μR
export const sirVacNewborn: DerivsFn = (y, _t, p) => {
  const [S, I, R] = y
  const { beta, gamma, mu, p: vacP } = p
  return [
    (1 - vacP) * mu - beta * S * I - mu * S,
    beta * S * I - gamma * I - mu * I,
    gamma * I + vacP * mu - mu * R,
  ]
}

// ── SIR with continuous vaccination of susceptibles ──
// dS/dt = μ - βSI - νS - μS
// dI/dt = βSI - γI - μI
// dR/dt = γI + νS - μR
export const sirVacContinuous: DerivsFn = (y, _t, p) => {
  const [S, I, R] = y
  const { beta, gamma, mu, nu } = p
  return [
    mu - beta * S * I - nu * S - mu * S,
    beta * S * I - gamma * I - mu * I,
    gamma * I + nu * S - mu * R,
  ]
}

// ── Model registry ──
export const MODELS: Record<ModelType, DerivsFn> = {
  SI: siModel,
  SIR: sirModel,
  SEIR: seirModel,
  SIRS: sirsModel,
}

// ── Initial conditions helpers ──
export function getInitialConditions(model: ModelType, I0 = 0.001): number[] {
  const S0 = 1 - I0
  switch (model) {
    case 'SI':
      return [S0, I0]
    case 'SIR':
    case 'SIRS':
      return [S0, I0, 0]
    case 'SEIR':
      return [S0, 0, I0, 0]
  }
}
