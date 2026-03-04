export interface ChapterInfo {
  id: number
  title: string
  subtitle: string
  narrative: string
  teachingPoint: string
}

export const CHAPTERS: ChapterInfo[] = [
  {
    id: 1,
    title: 'The First Cases',
    subtitle: 'Millbrook City, Day 1',
    narrative:
      'You arrive in Millbrook City. The hospital reports a cluster of 10 patients with a new respiratory illness. Population: 100,000. Watch the case count unfold day by day over the first 2 weeks. Then pick a model from the selector below — can you tell which model generated this data?',
    teachingPoint:
      'In early exponential growth, cumulative case curves from different models look qualitatively similar — all show accelerating growth. With limited early data, you cannot reliably distinguish which model is generating the cases. You need more observations (recoveries, reinfections, latent periods) to choose the right model.',
  },
  {
    id: 2,
    title: 'The Recovery Ward',
    subtitle: 'Week 3 — Patients are recovering',
    narrative:
      'Good news — patients are recovering. The infectious period appears to be about 7 days. You now see the epidemic curve bending. Adjust the transmission rate β to fit the observed curve and compute R₀.',
    teachingPoint:
      'The epidemic peak occurs when the susceptible fraction S crosses below 1/R₀. After this threshold, each infected person replaces themselves with fewer than one new case, and the epidemic declines.',
  },
  {
    id: 3,
    title: 'A Latent Threat',
    subtitle: 'Week 5 — Lab results reveal a latent period',
    narrative:
      'Lab results reveal the pathogen has a latent/incubation period of about 5 days before infected individuals become infectious. Your SIR model\'s timing was slightly off — the observed peak came later than predicted. Time to try the SEIR model.',
    teachingPoint:
      'The Exposed (E) compartment delays the epidemic peak but does not significantly change the final epidemic size. SEIR and SIR converge to similar final outcomes — the latent period affects timing, not magnitude.',
  },
  {
    id: 4,
    title: "It's Not Over",
    subtitle: 'Month 6 — Reinfections emerge',
    narrative:
      'You thought the outbreak was finished, but cases are rising again. Reports of reinfection emerge — immunity appears to wane after about 30 days. Meanwhile, the city has births and deaths. The disease may become endemic.',
    teachingPoint:
      'When immunity wanes (SIRS model) and new susceptibles enter through births, the disease does not burn out. Instead, it oscillates and settles into an endemic equilibrium. At steady state, about 26% of the population remains susceptible (S* = 1/R₀) and about 14% is infected at any given time.',
  },
  {
    id: 5,
    title: 'The Model Trade-Off',
    subtitle: 'The City Council wants your recommendation',
    narrative:
      'The city council asks you to present your findings. They want to know: which model should we use going forward? You must explain the trade-offs between accuracy, transparency, and flexibility.',
    teachingPoint:
      'No single model is "best." Simple models (SI, SIR) are transparent and easy to communicate. Complex models (SEIR, SIRS) capture more biology but are harder to explain. The right choice depends on the question being asked.',
  },
]

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export const CHAPTER_5_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Which model is most accurate for this pathogen (with waning immunity and demography)?',
    options: ['SI', 'SIR', 'SEIR', 'SIRS with demography'],
    correctIndex: 3,
    explanation: 'SIRS with demography captures waning immunity and demographic turnover — the key features observed in this outbreak.',
  },
  {
    id: 'q2',
    question: 'Which model is most transparent and easiest to explain to the city council?',
    options: ['SI', 'SIR', 'SEIR', 'SIRS'],
    correctIndex: 1,
    explanation: 'SIR has just 3 compartments and clearly shows susceptible → infected → recovered. It\'s the simplest model that includes recovery.',
  },
  {
    id: 'q3',
    question: 'Which model gives the most flexibility for future what-if scenarios?',
    options: ['SI', 'SIR', 'SEIR', 'SIRS with demography'],
    correctIndex: 3,
    explanation: 'SIRS with demography can simulate endemic dynamics, vaccination impact, and long-term scenarios — the most flexible for policy planning.',
  },
]
