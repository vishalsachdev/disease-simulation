export interface ScenarioInfo {
  id: number
  title: string
  subtitle: string
  narrative: string
  teachingPoint: string
}

export const SCENARIOS: ScenarioInfo[] = [
  {
    id: 1,
    title: 'The SARS Playbook',
    subtitle: 'Low θ, Moderate R₀',
    narrative:
      'Intelligence briefing — this pathogen looks SARS-like. Symptoms appear BEFORE peak infectiousness. R₀ estimated at 2–3. Most transmission happens after symptom onset. Can isolation alone stop this?',
    teachingPoint:
      'SARS was controllable because most transmission was symptomatic (θ = 0.10). Effective isolation of cases was enough to bring R below 1. This is exactly what happened in 2003.',
  },
  {
    id: 2,
    title: 'The COVID Challenge',
    subtitle: 'High θ, Moderate R₀',
    narrative:
      'A different pathogen emerges. This one is trickier — people are spreading it BEFORE they know they\'re sick. Early estimates suggest ~62% of transmission is presymptomatic or asymptomatic. Isolation alone won\'t cut it.',
    teachingPoint:
      'COVID-19 sits in the "difficult to control" region of the Fraser plot (θ = 0.62). Isolation alone is insufficient — you need layered interventions: contact tracing, quarantine, and eventually vaccination.',
  },
  {
    id: 3,
    title: 'The Quarantine Debate',
    subtitle: 'Peak et al. Framework',
    narrative:
      'Your team is split. Your deputy argues for strict quarantine of all contacts. Your field officer says symptom monitoring is sufficient and less costly. Who\'s right? It depends on the disease.',
    teachingPoint:
      'Quarantine outperforms symptom monitoring most for fast-course diseases where infectiousness starts before symptoms (negative T_OFFSET). The benefit depends on BOTH disease biology AND implementation quality.',
  },
  {
    id: 4,
    title: 'The Philadelphia Lesson',
    subtitle: 'NPI Timing Matters',
    narrative:
      'Historical flashback — 1918 influenza pandemic. Philadelphia held a massive parade and delayed NPIs. St. Louis implemented early school closures and gathering bans. The outcomes were dramatically different.',
    teachingPoint:
      'The timing of NPI implementation matters enormously. Early action flattens the curve, keeps peak below hospital capacity, and reduces total cases. A delay of even 1-2 weeks can be catastrophic.',
  },
]

// COVID R₀ decomposition (from Ferretti et al. 2020)
export const COVID_R0_DECOMPOSITION = {
  R_P: { value: 0.9, fraction: 0.47, label: 'Presymptomatic' },
  R_S: { value: 0.8, fraction: 0.38, label: 'Symptomatic' },
  R_E: { value: 0.2, fraction: 0.10, label: 'Environmental' },
  R_A: { value: 0.1, fraction: 0.06, label: 'Asymptomatic' },
  total: 2.0,
}

// Intervention performance parameters (Peak et al.)
export interface InterventionParams {
  isolationEffectiveness: number  // γ: 0-1
  fractionContactsTraced: number  // P_CT: 0-1
  delayTracing: number            // D_CT: days
  delaySymptomIsolation: number   // D_SM: days
}

export const OPTIMAL_PARAMS: InterventionParams = {
  isolationEffectiveness: 1.0,
  fractionContactsTraced: 1.0,
  delayTracing: 0.25,
  delaySymptomIsolation: 0.25,
}

export const REALISTIC_PARAMS: InterventionParams = {
  isolationEffectiveness: 0.9,
  fractionContactsTraced: 0.9,
  delayTracing: 0.5,
  delaySymptomIsolation: 0.5,
}
