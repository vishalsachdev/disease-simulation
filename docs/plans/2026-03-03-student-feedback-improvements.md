# Student & Teacher Feedback Improvements Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement remaining improvements from 4-persona review (3 students + instructor), prioritized by pedagogical impact.

**Architecture:** All changes are additive UI/UX improvements to existing Sim 1 chapters and Sim 3 scenarios. No engine changes needed. Vaccination chapter reuses existing unused `sirVacNewborn`/`sirVacContinuous` models from `src/engine/models.ts:79-105`.

**Tech Stack:** React + TypeScript + Recharts + Tailwind CSS. Deploy via `npm run deploy`.

---

## Completed (prior session)

- [x] Fix Ch4 I* formula mismatch in teaching text
- [x] Fix Ch5 quiz explanation (SIRS has no E)
- [x] Harmonize SARS R0 to 2.5
- [x] Rename gamma label in Scenario 3
- [x] Percentages instead of raw decimals
- [x] Hide R0 spoiler in Ch2 quiz
- [x] Collapsible math in Ch4
- [x] Plain-English slider labels
- [x] Landing page text size increase
- [x] Mobile testing at 375px

---

### Task 1: Add Sim 3 Comprehension Quizzes

Dr. Chen's #2 priority — "Without assessment, there is no way to know whether students are learning or just clicking."

**Files:**
- Create: `src/sim3/data/quizzes.ts`
- Modify: `src/sim3/scenarios/Scenario1.tsx`
- Modify: `src/sim3/scenarios/Scenario2.tsx`
- Modify: `src/sim3/scenarios/Scenario4.tsx`

**Step 1: Create quiz data file**

```typescript
// src/sim3/data/quizzes.ts
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
```

**Step 2: Add quiz component to each scenario**

Add a simple quiz section after the Key Insight panel in each scenario. Reuse the same quiz pattern from Chapter 2/5 — radio buttons, Check Answer, colored feedback.

Pattern for each scenario (insert after the `<NarrativePanel title="Key Insight">` block):

```tsx
{/* Quiz */}
<div className="rounded-xl border border-slate-700/50 p-4 space-y-3"
  style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
  <h3 className="text-sm font-semibold text-slate-300">Check Understanding</h3>
  <p className="text-sm text-slate-400">{quiz.question}</p>
  {quiz.options.map((opt, i) => (
    <label key={i} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
      <input type="radio" name={quiz.id} value={i}
        checked={selectedAnswer === i}
        onChange={() => setSelectedAnswer(i)}
        className="accent-blue-500" />
      {opt}
    </label>
  ))}
  <button onClick={() => setShowAnswer(true)}
    disabled={selectedAnswer === null}
    className="w-full px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white
      hover:bg-blue-500 disabled:opacity-30 transition-all">
    Check Answer
  </button>
  {showAnswer && (
    <div className={`text-sm p-3 rounded-lg ${
      selectedAnswer === quiz.correctIndex
        ? 'bg-green-500/10 text-green-300'
        : 'bg-red-500/10 text-red-300'
    }`}>
      {selectedAnswer === quiz.correctIndex ? 'Correct! ' : 'Not quite. '}
      {quiz.explanation}
    </div>
  )}
</div>
```

Each scenario needs `useState` for `selectedAnswer` and `showAnswer`.

**Step 3: Verify and commit**

Run: `npx tsc --noEmit`
Commit: `feat: add comprehension quizzes to Sim 3 scenarios`

---

### Task 2: Add Colorblind-Safe Line Patterns

Dr. Chen's #4 — "8% of male students cannot distinguish red (I) and green (R) curves."

**Files:**
- Modify: `src/components/EpidemicChart.tsx`

**Step 1: Add strokeDasharray patterns to distinguish compartment lines**

In `EpidemicChart.tsx`, add a `PATTERNS` map alongside `COLORS`:

```typescript
const PATTERNS: Record<string, string> = {
  S: '0',       // solid
  E: '8 4',     // long dash
  I: '4 2',     // short dash
  R: '2 2 8 2', // dash-dot
}
```

Apply in the `<Line>` elements:

```tsx
{compartments.map((comp) => (
  <Line
    key={comp}
    type="monotone"
    dataKey={comp}
    stroke={COLORS[comp]}
    strokeDasharray={PATTERNS[comp]}
    strokeWidth={2}
    dot={false}
    isAnimationActive={false}
  />
))}
```

S stays solid (most important line), I gets short dashes, R gets dash-dot. This ensures every line is distinguishable by pattern alone.

**Step 2: Verify and commit**

Run: `npx tsc --noEmit`
Visually verify Ch2 and Ch4 charts have distinguishable line patterns.
Commit: `feat: add colorblind-safe line patterns to epidemic charts`

---

### Task 3: Overlay Mode for Chapters 3 & 4

Priya: "I had to mentally remember what the SIR curve looked like when I toggled to SEIR."

**Files:**
- Modify: `src/sim1/chapters/Chapter3.tsx`
- Modify: `src/sim1/chapters/Chapter4.tsx`

**Step 1: Chapter 3 — Add "Overlay both" toggle**

Add a third button to the SIR/SEIR toggle group:

```tsx
<button
  onClick={() => setShowSEIR('both')}
  className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
    showSEIR === 'both'
      ? 'bg-purple-600 text-white'
      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
  }`}
>
  Both
</button>
```

Change `showSEIR` from `boolean` to `'sir' | 'seir' | 'both'` (default `'seir'`).

When `'both'`, render a custom chart that shows I(t) from both models on the same axes:

```tsx
{showSEIR === 'both' ? (
  <OverlayChart
    sirData={sirData}
    seirData={seirData}
    title="SIR vs SEIR — Infected (I) Overlay"
  />
) : (
  <EpidemicChart ... />
)}
```

The `OverlayChart` is a local component showing only the I curves from both models — SIR I in blue solid, SEIR I in orange dashed. This keeps it clean (not 7 overlapping lines).

**Step 2: Chapter 4 — Same pattern**

Add "Both" toggle. When active, show SIR I(t) and SIRS I(t) on same chart. SIR burns out (I→0), SIRS oscillates to endemic equilibrium. This is the visual punchline.

**Step 3: Verify and commit**

Run: `npx tsc --noEmit`
Commit: `feat: add overlay mode to compare models in Ch3 and Ch4`

---

### Task 4: NPI End Day Slider in Scenario 4

Dr. Chen's #7 — "The single biggest lesson of COVID-19 is that premature NPI relaxation causes rebounds."

**Files:**
- Modify: `src/sim3/scenarios/Scenario4.tsx`

**Step 1: Add NPI end day sliders**

Add two new state variables and sliders:

```typescript
const [phillyNPIEnd, setPhillyNPIEnd] = useState(182) // default: never lifts (end of sim)
const [stLouisNPIEnd, setStLouisNPIEnd] = useState(182)
```

**Step 2: Modify `sirWithNPI` to support end day**

```typescript
function sirWithNPI(npiStartDay: number, npiEndDay: number, betaReduction: number) {
  const npiStartYear = npiStartDay / 365
  const npiEndYear = npiEndDay / 365
  const derivs = (y: number[], t: number, p: Record<string, number>) => {
    const inNPI = t >= npiStartYear && t < npiEndYear
    const beta = inNPI ? p.beta * (1 - betaReduction) : p.beta
    // ... rest unchanged
  }
}
```

**Step 3: Add slider UI**

Add under the existing NPI timing section:

```tsx
<ParameterSlider
  label="Philadelphia: Lift NPIs"
  value={phillyNPIEnd}
  min={phillyNPIDay + 7}
  max={182}
  step={7}
  onChange={setPhillyNPIEnd}
  displayValue={phillyNPIEnd >= 180 ? 'Never' : `Day ${phillyNPIEnd}`}
/>
```

Same for St. Louis. Default "Never" (182 = end of simulation) so existing behavior is preserved.

**Step 4: Verify rebound dynamics**

Set St. Louis NPI end to Day 30 — should see a clear second wave rebound. This teaches the "don't lift too early" lesson.

**Step 5: Commit**

Commit: `feat: add NPI lift timing to Scenario 4 — shows rebound dynamics`

---

### Task 5: Bridging Page Between Sim 1 and Sim 3

Dr. Chen's #5 — "The conceptual framework shift between the two simulations is jarring."

**Files:**
- Modify: `src/sim3/Sim3App.tsx`

**Step 1: Add a brief intro panel to Sim3App**

Before Scenario 1 loads, show a one-time bridging message as a narrative panel at the top of Sim3App (shown when `currentScenario === 0`):

```tsx
{currentScenario === 0 && (
  <div className="max-w-3xl mx-auto mb-6">
    <NarrativePanel title="Shifting Gears" variant="briefing">
      <p>
        In Patient Zero, you learned <strong>how</strong> epidemics work — compartmental
        models, R₀, and endemic dynamics. Now you'll learn <strong>how to stop them</strong>.
      </p>
      <p className="mt-2">
        The key shift: instead of tracking compartments over time (differential equations),
        you'll compute whether interventions can push R<sub>eff</sub> below 1 (algebra).
        Your tools: isolation, contact tracing, quarantine, and vaccination.
      </p>
    </NarrativePanel>
  </div>
)}
```

This is lightweight — no new files, just a conditional render.

**Step 2: Verify and commit**

Commit: `feat: add bridging narrative between Sim 1 and Sim 3`

---

### Task 6: Fraser Plot Explanation Label

Jordan: "I see dots on a chart. The axes say R₀ and θ. I don't know what that means."

**Files:**
- Modify: `src/sim3/components/FraserPlot.tsx`

**Step 1: Add plain-English explanation above the chart**

Before the `<ResponsiveContainer>`, add:

```tsx
<p className="text-xs text-slate-400 mb-3 leading-relaxed">
  Each dot is a disease. Diseases in the <span className="text-green-400">green zone</span> can
  be stopped by isolating sick people. Diseases in the <span className="text-red-400">red zone</span> need
  more — contact tracing, quarantine, or vaccines. The dashed line is the boundary.
</p>
```

**Step 2: Verify and commit**

Commit: `feat: add plain-English explanation to Fraser Plot`

---

### Task 7: Epilogue Insight Cards Link Back to Scenarios

Marcus: "I wish the insight cards linked back to the specific scenarios."

**Files:**
- Modify: `src/sim3/scenarios/Epilogue.tsx`

**Step 1: Add "(See Scenario N)" references to each insight card**

Update the four `NarrativePanel` insight cards to include a scenario reference:

```tsx
<NarrativePanel title="1. Low θ → Isolation Works" variant="insight">
  <p>
    When most transmission is symptomatic (low θ), isolating cases after
    symptom onset can reduce R below 1. SARS (θ=0.10) was controlled this way.
    <span className="text-slate-500 text-xs block mt-1">See Scenario 1: The SARS Playbook</span>
  </p>
</NarrativePanel>
```

Same pattern for cards 2 (→ Scenario 2), 3 (→ Scenario 3), 4 (→ Scenario 4).

**Step 2: Verify and commit**

Commit: `feat: link Epilogue insight cards back to scenarios`

---

### Task 8: Chapter 3 Metrics as Percentages

Consistency fix — Ch3 still shows raw decimals in MetricsDashboard and comparison table.

**Files:**
- Modify: `src/sim1/chapters/Chapter3.tsx`

**Step 1: Fix MetricsDashboard**

```typescript
{ label: 'Peak I', value: `${((showSEIR ? seirPeak : sirPeak).peakValue * 100).toFixed(1)}%`, color: '#ef4444' },
{ label: 'Final S', value: `${((showSEIR ? seirFinal : sirFinal) * 100).toFixed(1)}%`, color: '#3b82f6' },
```

Also rename "S(∞)" to "Final S" (Jordan found the infinity symbol intimidating).

**Step 2: Fix comparison table**

Format Peak I and S(∞) values as percentages in the table body too.

**Step 3: Verify and commit**

Commit: `fix: show percentages in Ch3 metrics and rename S(∞) to Final S`

---

### Task 9: Deploy and Final Verification

**Step 1: Full build check**

Run: `npx tsc --noEmit`

**Step 2: Deploy**

Run: `npm run deploy`

**Step 3: Mobile spot-check**

Resize browser to 375px, navigate through key pages: Landing → Ch1 → Ch3 (overlay) → Ch4 (collapsible) → Sim3 S1 (quiz) → S4 (NPI end) → Epilogue.

**Step 4: Commit any final fixes**

**Step 5: Update IMPLEMENTATION_NOTES.md**

Add notes about new features: Sim 3 quizzes, overlay mode, NPI lift, colorblind patterns, Fraser Plot explanation.

Commit: `docs: update implementation notes with new features`
