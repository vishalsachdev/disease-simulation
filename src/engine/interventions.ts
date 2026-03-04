/**
 * Fraser framework: determine if outbreak is controllable.
 *
 * @param R0       - basic reproduction number
 * @param theta    - proportion presymptomatic/asymptomatic transmission
 * @param epsilon_i - isolation effectiveness (0–1)
 * @param epsilon_t - contact tracing effectiveness (0–1)
 */
export function isControllable(
  R0: number,
  theta: number,
  epsilon_i: number,
  epsilon_t: number
): boolean {
  const rEff = computeREffective(R0, theta, epsilon_i, epsilon_t)
  return rEff < 1
}

/**
 * Compute R_effective after isolation and contact tracing.
 */
export function computeREffective(
  R0: number,
  theta: number,
  epsilon_i: number,
  epsilon_t: number
): number {
  // Transmission after isolation of symptomatic cases
  // Symptomatic fraction (1-θ) reduced by εᵢ, presymptomatic fraction θ unaffected
  const R_after_isolation = R0 * (theta + (1 - theta) * (1 - epsilon_i))
  // Further reduction from contact tracing on presymptomatic fraction
  const R_after_tracing = R_after_isolation * (1 - epsilon_t * theta)
  return R_after_tracing
}

/**
 * Critical vaccination proportion for herd immunity.
 * p_c = 1 - 1/R₀
 */
export function criticalVaccinationProportion(R0: number): number {
  return 1 - 1 / R0
}

/**
 * Critical continuous vaccination rate.
 * ν_c = μ(R₀ - 1)
 */
export function criticalVaccinationRate(R0: number, mu: number): number {
  return mu * (R0 - 1)
}

// ── Infectiousness profile ──

/**
 * Gamma PDF for infectiousness profile β(τ).
 */
function gammaPDF(x: number, shape: number, scale: number): number {
  if (x <= 0) return 0
  const logResult =
    (shape - 1) * Math.log(x) -
    x / scale -
    shape * Math.log(scale) -
    logGamma(shape)
  return Math.exp(logResult)
}

/** Stirling approximation of log(Gamma(x)) for x > 0. */
function logGamma(x: number): number {
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x)
  }
  x -= 1
  const coeffs = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.001208650973866179, -0.000005395239384953,
  ]
  let sum = 1.000000000190015
  for (let i = 0; i < coeffs.length; i++) {
    sum += coeffs[i] / (x + i + 1)
  }
  const t = x + coeffs.length - 0.5
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(sum)
}

/**
 * Generate infectiousness profile over time.
 * @param peakDay - day when infectiousness peaks
 * @param shape   - gamma distribution shape parameter
 * @param maxDays - duration to simulate
 */
export function infectiousnessProfile(
  peakDay: number,
  shape: number,
  maxDays: number
): Array<{ tau: number; beta: number }> {
  const scale = peakDay / shape
  const points: Array<{ tau: number; beta: number }> = []
  for (let tau = 0; tau <= maxDays; tau += 0.1) {
    points.push({ tau, beta: gammaPDF(tau, shape, scale) })
  }
  return points
}

// ── Branching process (for Peak et al. scenarios) ──

/**
 * Simulate a generation-based branching process.
 * Returns array of generation sizes.
 */
export function simulateBranchingProcess(
  initialCases: number,
  R_eff: number,
  generations: number
): number[] {
  const result = [initialCases]
  let current = initialCases
  for (let g = 0; g < generations; g++) {
    // Deterministic branching for predictable teaching tool
    const next = Math.round(current * R_eff)
    result.push(next)
    current = next
    if (current === 0 || current > 1e7) break
  }
  return result
}

// ── Disease presets for Sim 3 ──

export interface DiseaseProfile {
  name: string
  R0: number
  theta: number
  incubation: number
  infectiousPeriod: number
  latentPeriod: number
  tOffset: number
  description: string
}

export const DISEASE_PRESETS: DiseaseProfile[] = [
  {
    name: 'Ebola',
    R0: 1.8,
    theta: 0.05,
    incubation: 9.4,
    infectiousPeriod: 7.4,
    latentPeriod: 7.4,
    tOffset: 2.0,
    description: 'Long incubation, symptoms well before peak infectiousness',
  },
  {
    name: 'SARS',
    R0: 2.4,
    theta: 0.10,
    incubation: 4.6,
    infectiousPeriod: 7.5,
    latentPeriod: 4.1,
    tOffset: 0.5,
    description: 'Symptoms appear around same time as infectiousness',
  },
  {
    name: 'Influenza A',
    R0: 1.5,
    theta: 0.40,
    incubation: 1.6,
    infectiousPeriod: 4.5,
    latentPeriod: 2.1,
    tOffset: -0.5,
    description: 'Very fast course, some presymptomatic transmission',
  },
  {
    name: 'Smallpox',
    R0: 5.5,
    theta: 0.05,
    incubation: 12.5,
    infectiousPeriod: 14.5,
    latentPeriod: 11.5,
    tOffset: 1.0,
    description: 'High R₀, long course, symptoms before infectiousness',
  },
  {
    name: 'MERS',
    R0: 1.1,
    theta: 0.10,
    incubation: 5.5,
    infectiousPeriod: 7.6,
    latentPeriod: 4.5,
    tOffset: 1.0,
    description: 'Low R₀, mostly symptomatic transmission',
  },
  {
    name: 'COVID-19',
    R0: 2.0,
    theta: 0.62,
    incubation: 5.0,
    infectiousPeriod: 10.0,
    latentPeriod: 3.0,
    tOffset: -2.0,
    description: 'High presymptomatic transmission, difficult to control by isolation alone',
  },
]
