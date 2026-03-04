# Disease Simulation Lab — Implementation Notes

These notes explain how each simulation works under the hood, what mathematical models power them, and how to use the interactive features. Intended for instructors explaining the simulations to students.

---

## Architecture Overview

The app is a single React application with two independent simulations sharing a common math engine:

```
Landing Page (/)
├── Sim 1: Patient Zero (/sim1)  — 5 chapters
└── Sim 3: Outbreak Command (/sim3) — 4 scenarios + epilogue
```

All computation runs client-side in the browser — no server needed. The ODE solver runs in real-time as students adjust sliders, so epidemic curves update instantly.

---

## The Math Engine

### ODE Solver (src/engine/ode-solver.ts)

The solver uses the **4th-order Runge-Kutta (RK4)** method, a standard numerical integration technique that balances accuracy and speed.

**How it works:**
1. Start with initial conditions (e.g., S=0.999, I=0.001)
2. At each tiny time step (dt = 0.0001 years ≈ 53 minutes), compute four slope estimates (k1–k4)
3. Average them with specific weights to get the next state
4. Repeat until the end time

**Why RK4?** Euler's method (simplest) accumulates errors quickly. RK4 is accurate to O(dt⁵) per step, meaning with dt=0.0001, errors are negligible. Students see curves that match the textbook R code output.

**Key function:** `solve(derivs, y0, tSpan, dt, params)` takes a derivative function (the model equations), initial conditions, time range, step size, and parameters. Returns arrays of time points and state vectors.

### Compartmental Models (src/engine/models.ts)

Each model is defined as a derivative function that computes rates of change. All models use **frequency-dependent transmission** (βSI, where S and I are proportions) and include **demography** (birth rate μ into S, death rate μ from all compartments).

#### SI Model (2 compartments)
```
dS/dt = μ − βSI − μS     (births in, infection out, deaths out)
dI/dt = βSI − μI          (infection in, deaths out)
```
No recovery — once infected, always infected. Used to show pure exponential growth.

#### SIR Model (3 compartments)
```
dS/dt = μ − βSI − μS
dI/dt = βSI − γI − μI     (γI = recovery)
dR/dt = γI − μR
```
The workhorse model. Recovery at rate γ means infectious period = 1/γ.

**R₀ = β/(γ+μ)** — the average number of secondary infections from one case in a fully susceptible population. With course defaults: R₀ = 200/(52.14+0.02) ≈ 3.83.

#### SEIR Model (4 compartments)
```
dS/dt = μ − βSI − μS
dE/dt = βSI − σE − μE     (σ = latent rate, 1/σ = latent period)
dI/dt = σE − γI − μI
dR/dt = γI − μR
```
Adds an Exposed class — infected but not yet infectious. The latent period delays the epidemic peak but doesn't significantly change the final size.

**R₀ = βσ/[(σ+μ)(γ+μ)]** — derived via the Next Generation Matrix (Lecture 4).

#### SIRS Model (3 compartments + waning)
```
dS/dt = μ − βSI + ωR − μS    (ωR = recovered losing immunity)
dI/dt = βSI − γI − μI
dR/dt = γI − ωR − μR
```
Recovered individuals lose immunity at rate ω (duration = 1/ω). Combined with births (μ), this prevents burnout and produces **endemic equilibrium**:
- S* = (γ+μ)/β = 1/R₀
- I* = (1−S*)(ω+μ)/(ω+μ+γ)

**Note:** The SIRS I* formula differs from SIR's `I* = μ(R₀−1)/β` because waning immunity (ω >> μ) contributes far more susceptibles than births alone. With default parameters, SIRS I* ≈ 14% vs SIR I* ≈ 0.03%.

### Default Parameters (from course materials)

| Parameter | Symbol | Value | Meaning |
|-----------|--------|-------|---------|
| Transmission rate | β | 200 | Contacts × probability of transmission per year |
| Recovery rate | γ | 365/7 ≈ 52.14 | Recover in ~7 days |
| Latent rate | σ | 365/5 = 73 | Become infectious after ~5 days |
| Birth/death rate | μ | 0.02 | 2% per year (50-year lifespan) |
| Waning rate | ω | 365/30 ≈ 12.17 | Lose immunity after ~30 days |

These exact values come from Lecture 2, Lecture 3, and Lab 1. The simulations use the same numbers so students can cross-validate with their R code homework.

---

## Simulation 1: Patient Zero

### Pedagogical Design

The simulation tells a detective story where the student arrives in "Millbrook City" to investigate an outbreak. Each chapter reveals new information that requires upgrading the model, teaching the concept of **model selection** — you don't start with the most complex model, you build up as evidence demands it.

### Chapter 1: "The First Cases" — Early Ambiguity

**What students see:** An animated epidemic curve revealed day-by-day (200ms per day). They pick a model (SI/SIR/SEIR/SIRS) and see it overlaid on the "observed" data.

**What it teaches:** In early exponential growth, ALL models produce nearly identical curves. You cannot tell which model is correct just from the rising phase. This is a core lesson about model identifiability — early data constrains the growth rate (βS₀ − γ) but not the model structure.

**How it works internally:**
- "Observed" data = pre-computed SIR simulation with default parameters, sampled at daily intervals
- Student's model runs the same ODE solver with whatever model they picked
- Both are plotted, and during exponential growth they overlap almost perfectly
- The animation uses `useEffect` with a timer that increments `revealedDays` state

### Chapter 2: "The Recovery Ward" — R₀ and the Peak

**What students see:** Full SIR epidemic curve. A β slider (50–400) that updates the curve in real-time. R₀ = β/(γ+μ) displayed. A horizontal dashed line at S = 1/R₀. A quiz asking them to estimate R₀.

**What it teaches:**
1. **Force of infection** (βSI) — transmission depends on BOTH β and the susceptible fraction
2. **R₀ as a threshold** — if R₀ > 1, the epidemic grows; if R₀ < 1, it fades
3. **Peak occurs when S = 1/R₀** — this is the equilibrium condition dI/dt = 0, which gives S = (γ+μ)/β = 1/R₀
4. **Epidemic burnout** — after the peak, S < 1/R₀ so each case produces <1 secondary cases

**Quiz mechanics:** Student adjusts a slider from 0.5 to 8.0. Answer checked within ±0.5 of the true R₀. Correct answer shows the formula; wrong answer shows the calculation.

### Chapter 3: "A Latent Threat" — SEIR vs SIR

**What students see:** Toggle between SIR and SEIR curves. σ slider to adjust latent period. Side-by-side comparison table showing peak timing and final size for both models.

**What it teaches:** The E (Exposed) compartment delays the epidemic peak because newly infected individuals must wait through the latent period before becoming infectious. However, the **final epidemic size S(∞) is nearly the same** — the latent period affects *when* things happen, not *how much* happens.

**Why this matters:** Students often think more compartments = better model. This shows that added complexity must be justified by the question being asked. If you care about timing (e.g., when to deploy resources), SEIR matters. If you only care about total cases, SIR suffices.

### Chapter 4: "It's Not Over" — Endemic Dynamics

**What students see:** SIRS model with demography running for up to 30 years. ω slider for waning immunity rate. Oscillations that dampen into a steady-state endemic equilibrium. Theoretical S* and I* compared to simulation values.

**What it teaches:**
1. **Waning immunity** (ω) returns recovered individuals to S, replenishing the susceptible pool
2. **Demography** (μ) adds new susceptibles through births
3. Together, these prevent epidemic burnout → the disease becomes **endemic**
4. **Endemic equilibrium**: S* = 1/R₀ (same threshold!), I* = μ(R₀−1)/β
5. The oscillations are **damped** — they get smaller over time as the system approaches equilibrium

**Technical note:** With dt=0.0001 and 30 years of simulation, that's 300,000 RK4 steps. The chart downsamples to ~2000 points for rendering performance.

### Chapter 5: "The Model Trade-Off" — Synthesis

**What students see:** All 4 models (SI/SIR/SEIR/SIRS) running simultaneously in a 2×2 grid, each over 5 years. Three multiple-choice quiz questions about accuracy, transparency, and flexibility.

**What it teaches:** The Lecture 1 framework of model trade-offs:
- **Accuracy**: SIRS + demography captures the most biology (waning immunity, endemic state)
- **Transparency**: SIR is easiest to explain (3 compartments, intuitive flow)
- **Flexibility**: SIRS + demography supports the most what-if scenarios (vaccination, long-term planning)

No single model is "best" — the right choice depends on the question.

---

## Simulation 3: Outbreak Command

### Pedagogical Design

Students play the role of chief epidemiologist at a national health agency. Each scenario presents a different disease with different characteristics, forcing students to learn that **intervention strategy depends on disease biology**.

### The Fraser Framework (Core Concept)

The key parameter is **θ (theta)** — the proportion of transmission that occurs before or without symptoms.

- **Low θ** (e.g., SARS, θ=0.10): Most transmission is symptomatic → isolation of cases after symptom onset can work
- **High θ** (e.g., COVID-19, θ=0.62): Most transmission is presymptomatic → isolation alone fails, need contact tracing/quarantine

**Controllability condition:** Isolation alone works when θ < 1/R₀. For SARS: 0.10 < 1/2.5 = 0.40 ✓. For COVID: 0.62 < 1/2.0 = 0.50 ✗.

The **Fraser Plot** (R₀ vs θ scatter) is the visual centerpiece — diseases below the θ = 1/R₀ boundary curve are controllable by isolation; those above need additional measures.

### R_effective Calculation

When interventions are active:
```
R_eff = R₀ × [θ + (1−θ)(1−εᵢ)] × [1 − εₜ × θ]
```
Where:
- εᵢ = isolation effectiveness (how well you isolate symptomatic cases)
- εₜ = contact tracing effectiveness (how well you find and quarantine contacts)

The first bracket handles symptomatic transmission reduction (isolation).
The second bracket handles presymptomatic transmission reduction (tracing).

With vaccination (proportion p), multiply by (1−p).

### Scenario 1: "The SARS Playbook"

**Disease:** SARS (R₀=2.5, θ=0.10, incubation ~5 days, infectious ~10 days)

**Infectiousness profile:** Peak infectiousness at day 7 (AFTER symptom onset at day 5). This means symptoms are a reliable early warning — you see sick people before they're maximally infectious.

**Key interaction:** Students toggle isolation ON, see R_eff drop from 2.5 to below 1. Contact tracing is optional but not needed. This matches the real-world SARS experience in 2003.

### Scenario 2: "The COVID Challenge"

**Disease:** COVID-19 (R₀=2.0, θ=0.62)

**R₀ decomposition** (Ferretti et al. 2020): Stacked bar chart showing:
- Presymptomatic (R_P=0.9, 47%) — the biggest single contributor
- Symptomatic (R_S=0.8, 38%)
- Environmental (R_E=0.2, 10%) — fomites
- Asymptomatic (R_A=0.1, 6%)

**Infectiousness profile:** Peak at day 3.5, BEFORE symptom onset at day 5. Students see the curve shifted left compared to SARS.

**Three-phase interaction:**
1. Turn on isolation → R_eff still >1 (θ too high)
2. Add contact tracing → getting closer to 1
3. Add vaccination → R_eff finally drops below 1

**Vaccination thresholds:**
- p_c = 1 − 1/R₀ = 1 − 1/2.0 = 50% (critical proportion for herd immunity)
- ν_c = μ(R₀−1) = 0.02(2.0−1) = 0.02/yr (critical continuous vaccination rate)

### Scenario 3: "The Quarantine Debate" (Peak et al.)

**Concept:** Compare quarantine vs symptom monitoring across 5 diseases.

**Five diseases** (from Peak et al. 2017):
| Disease | R₀ | T_OFFSET | Key insight |
|---------|-----|----------|------------|
| Ebola | 1.8 | +2d | Symptoms well before infectiousness → monitoring works |
| SARS | 2.4 | +0.5d | Symptoms ≈ infectiousness → monitoring works |
| Influenza A | 1.5 | −0.5d | Fast, some presymptomatic → quarantine helps |
| Smallpox | 5.5 | +1d | High R₀ but symptoms first → monitoring may suffice |
| MERS | 1.1 | +1d | Low R₀ → either works |

**T_OFFSET = incubation − latent period:**
- Positive: symptoms appear before infectiousness (easier to control)
- Negative: infectiousness starts before symptoms (harder to control)

**Setting parameters** (adjustable sliders):
- γ: isolation effectiveness (default 90%)
- P_CT: fraction of contacts traced (default 90%)
- D_CT: delay from exposure to tracing (default 0.5 days)
- D_SM: delay from symptom onset to isolation (default 0.5 days)

Students adjust these and see R_SM (symptom monitoring) vs R_Q (quarantine) update for each disease. The key insight: quarantine outperforms monitoring most when diseases are fast and have negative T_OFFSET.

### Scenario 4: "The Philadelphia Lesson"

**Concept:** NPI timing matters dramatically.

**Setup:** 1918 influenza parameters (β=120, γ=365/7). Two cities run the same SIR model, but NPIs start at different times. NPIs reduce β by a configurable factor (default 50%).

**Key interactions:**
- Drag Philadelphia's NPI start day (default: day 30) and St. Louis's (default: day 7)
- See the epidemic curves diverge dramatically
- Hospital capacity threshold line at 5% shows Philadelphia overwhelming capacity
- Total infected counter shows the cost of delay

**The math:** This uses a modified SIR model where β drops to β×(1−reduction) at the NPI start time. The ODE solver handles the discontinuity naturally since it evaluates β at each time step.

### Epilogue: "The Debrief"

Synthesis dashboard showing:
1. Fraser plot with ALL 6 diseases plotted
2. Full disease comparison table
3. Vaccination thresholds (p_c) for each disease
4. Four key takeaways as insight cards

---

## Interactive Features Reference

### Slider Controls
All sliders use `<input type="range">` with React state. The ODE solver re-runs via `useMemo` whenever parameters change, so curves update instantly. There's no "run simulation" button — it's always live.

### Charts
Built with **Recharts** (React wrapper around D3). Each chart is a `<ResponsiveContainer>` that fills its parent. Lines use `isAnimationActive={false}` to avoid animation lag during slider interaction.

### Color Scheme

**Sim 1 (Medical theme):**
- S (Susceptible) = Blue (#3b82f6)
- E (Exposed) = Orange (#f97316)
- I (Infected) = Red (#ef4444)
- R (Recovered) = Green (#22c55e)
- 1/R₀ threshold = Amber (#fbbf24)

**Sim 3 (Command center theme):**
- Background = Dark navy (#0a1628)
- Controlled = Green (#22c55e)
- Warning = Amber (#f59e0b)
- Uncontrolled = Red (#ef4444)
- Isolation = Blue (#3b82f6)
- Quarantine = Purple (#8b5cf6)
- Vaccination = Gold (#eab308)

---

## Deployment

The app builds to static HTML/CSS/JS via Vite. Deployed to GitHub Pages using the `gh-pages` package:

```bash
npm run deploy    # builds + pushes to gh-pages branch
```

Live at: https://vishalsachdev.github.io/disease-simulation/

Uses HashRouter (`/#/sim1`, `/#/sim3`) for GitHub Pages compatibility (no server-side routing needed).
