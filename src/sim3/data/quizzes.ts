export interface Sim3Quiz {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export const SCENARIO_QUIZZES: Record<string, Sim3Quiz[]> = {
  scenario1: [
    {
      id: 's1q1',
      question: 'If SARS had θ = 0.50 instead of 0.10, would isolation alone still control it?',
      options: [
        'Yes — R₀ is still moderate',
        'No — too much transmission happens before symptoms',
        'It depends on hospital capacity',
      ],
      correctIndex: 1,
      explanation: 'With θ = 0.50, half of transmission occurs before symptoms. The controllability condition θ < 1/R₀ = 0.40 would fail (0.50 > 0.40), so isolation alone would not work.',
    },
  ],
  scenario2: [
    {
      id: 's2q1',
      question: 'What vaccination proportion is needed if COVID R₀ increased to 3.0?',
      options: ['33%', '50%', '67%', '75%'],
      correctIndex: 2,
      explanation: 'p_c = 1 - 1/R₀ = 1 - 1/3.0 = 0.667, so about 67% of the population would need vaccination.',
    },
  ],
  scenario4: [
    {
      id: 's4q1',
      question: 'Why did St. Louis have dramatically fewer deaths than Philadelphia in 1918?',
      options: [
        'St. Louis had a smaller population',
        'St. Louis implemented NPIs weeks earlier',
        'The virus mutated to be less deadly',
        'St. Louis had better hospitals',
      ],
      correctIndex: 1,
      explanation: 'St. Louis closed schools and banned gatherings within days of the first cases. Philadelphia waited weeks and even held a large parade. The delay allowed exponential growth to overwhelm the city.',
    },
  ],
}
