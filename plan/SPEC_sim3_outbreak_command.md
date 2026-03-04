# Simulation 3: "Outbreak Command" — The Intervention Strategy Simulator

## Overview

An interactive narrative simulation where the player is the chief epidemiologist at a national health agency. A novel pathogen has emerged and is spreading. The player must choose and combine intervention strategies — vaccination (newborn vs. susceptible), case isolation, contact tracing with quarantine, and symptom monitoring — to bring R below 1 and control the outbreak. The twist: the pathogen's characteristics (R₀, θ, incubation period, infectious period) are gradually revealed, and different diseases respond very differently to different interventions.

**Tech stack:** React (Vite + Tailwind), client-side ODE solver + branching process simulation. Single-page app with scenario-based progression.

---

## Storyline & Scenario Structure

### Prologue: "The Alert"
**Narrative:** Your phone buzzes at 2 AM. The WHO has flagged a cluster of severe respiratory illness in a coastal city. Early reports suggest human-to-human transmission. You're activated as lead epidemiologist. Your job: figure out what works before it's too late.

**Setup:** Player sees a world map with the outbreak location pulsing. A dossier appears with early (uncertain) estimates. The player's "command center" dashboard loads.

---

### Scenario 1: "The SARS Playbook" (Low θ, Moderate R₀)
**Narrative:** Intelligence briefing — this pathogen looks SARS-like. Symptoms appear BEFORE peak infectiousness. R₀ estimated at 2–3. Most transmission happens after symptom onset.

**Disease parameters (from Fraser et al. / Article 1):**
```
R₀ = 2.5 (adjustable 2-3)
θ = 0.10 (low — only 10% presymptomatic transmission)
Incubation period: ~5 days
Infectious period: ~10 days
Latent period ≈ incubation period (symptoms ≈ onset of infectiousness)
```

**Player task — Phase A: Understanding the disease**
- View the infectiousness profile over time (β(τ) curve showing when transmission peaks)
- See θ highlighted — "What fraction of transmission happens before symptoms?"
- Interactive: drag a vertical line on the infectiousness curve to see how θ changes

**Player task — Phase B: Choose interventions**
- Toggle ON/OFF:
  - Case isolation (εᵢ = isolation effectiveness, slider 0–100%)
  - Contact tracing + quarantine (εₜ = tracing effectiveness, slider 0–100%)
  - Symptom monitoring (alternative to quarantine — less invasive)
- See R_effective update in real time as interventions are applied
- Key insight: For SARS-like diseases (low θ), **isolation alone is sufficient** to bring R < 1
- Fraser framework visualization: show the R₀ vs θ plot with the controllability region

**Feedback:** "SARS was controllable because most transmission was symptomatic. Effective isolation of cases was enough to stop the epidemic. This is exactly what happened in 2003."

**Concepts tested:**
- θ (proportion of presymptomatic/asymptomatic transmission) from Fraser (2004)
- Why low θ makes isolation effective
- R_effective with interventions

---

### Scenario 2: "The COVID Challenge" (High θ, Moderate R₀)
**Narrative:** New intelligence — a different pathogen emerges. This one is trickier. People are spreading it BEFORE they know they're sick. Early estimates suggest significant presymptomatic transmission.

**Disease parameters (from Ferretti et al. / Article 1 in course):**
```
R₀ = 2.0–2.5
θ = 0.62 (high — ~62% of transmission is presymptomatic/asymptomatic)
  - Presymptomatic: R_P = 0.9 (fraction 0.47)
  - Symptomatic: R_S = 0.8 (fraction 0.38)
  - Environmental: R_E = 0.2 (fraction 0.10)
  - Asymptomatic: R_A = 0.1 (fraction 0.06)
Incubation period: ~5 days
Infectious period: ~10 days
Infectiousness starts ~2 days before symptoms
```

**Player task — Phase A:**
- Compare the infectiousness profile to Scenario 1 — see how the curve is shifted LEFT (transmission starts before symptoms)
- See the R₀ decomposition: stacked bar showing R_P + R_S + R_E + R_A = R₀
- Answer: "Can isolation alone control this?" → No (θ > 1/R₀)

**Player task — Phase B: Layer interventions**
- Start with isolation only → R_effective still > 1
- Add contact tracing + quarantine → getting closer
- Show that you need BOTH isolation AND contact tracing at high effectiveness
- Digital contact tracing option: reduces delay (D_CT) from days to near-instant
- Fraser framework: show that COVID sits in the "difficult to control" region of the R₀ vs θ plot

**Player task — Phase C: Add vaccination**
- Time skip: "6 months later, a vaccine is available"
- Choose vaccination strategy:
  - Newborn vaccination (proportion p)
  - Continuous vaccination of susceptibles (rate ν)
- Compute p_c = 1 - 1/R₀ and ν_c = μ(R₀ - 1)
- Show that vaccination COMBINED with NPIs can achieve control
- Interactive: see how the endemic equilibrium shifts as vaccination increases

**Concepts tested:**
- High θ makes isolation insufficient (Fraser framework core insight)
- Layering interventions
- Vaccine strategies: p_c and ν_c
- Efficacy vs effectiveness distinction
- Digital contact tracing as a speed advantage

**Key formulas:**
```
θ = 1 - R_S/R₀ (proportion non-symptomatic transmission)
Control condition: θ < 1/R₀ (for isolation alone)
p_c = 1 - 1/R₀ (critical vaccination proportion)
ν_c = μ(R₀ - 1) (critical continuous vaccination rate)
R_effective = R₀ × (1-p) × (reduction from NPIs)
```

---

### Scenario 3: "The Quarantine Debate" (Peak et al. Framework)
**Narrative:** A third pathogen appears — and your team is split. Your deputy argues for strict quarantine of all contacts. Your field officer says symptom monitoring is sufficient and quarantine is too costly. Who's right? It depends on the disease.

**Player task: Compare diseases side by side**

Present 4–5 disease profiles (from Peak et al. / Article 3):
| Disease | R₀ | Incubation | Infectious Period | T_OFFSET | Key Feature |
|---------|-----|-----------|-------------------|----------|-------------|
| Ebola | 1.8 | 9.4d | 7.4d | +2d (symptoms first) | Long, severe |
| SARS | 2.4 | 4.6d | 7.5d | +0.5d | Symptoms ≈ infectiousness |
| Influenza A | 1.5 | 1.6d | 4.5d | -0.5d | Very fast, presymptomatic |
| Smallpox | 5.5 | 12.5d | 14.5d | +1d | High R₀, long course |
| MERS | 1.1 | 5.5d | 7.6d | +1d | Low R₀ |

**For each disease, the player:**
1. Reviews the natural history timeline (visual: latent period → incubation → infectious period → symptoms)
2. Sees T_OFFSET (gap between infectiousness onset and symptom onset)
3. Predicts: "Will quarantine significantly outperform symptom monitoring?"
4. Runs the simulation to verify
5. Sees R_S (symptom monitoring) vs R_Q (quarantine) for that disease

**Key interactive element: The Intervention Performance Panel**
Player adjusts setting-dependent parameters:
| Parameter | Variable | Optimal | Realistic |
|-----------|----------|---------|-----------|
| Isolation effectiveness | γ | 100% | 90% |
| Fraction contacts traced | P_CT | 100% | 90% |
| Delay: tracing a contact | D_CT | 0.25d | 0.5d |
| Delay: symptom onset → isolation | D_SM | 0.25d | 0.5d |

**Key insight from Peak et al.:** Quarantine outperforms symptom monitoring most for:
- Fast-course diseases (short infectious period)
- Diseases where infectiousness starts before symptoms (negative T_OFFSET)
- Settings where isolation is very effective
- Settings where there's a long delay between symptom onset and isolation

**Concepts tested:**
- Peak et al. framework: quarantine vs symptom monitoring
- T_OFFSET and its role
- Intervention performance depends on BOTH biology and setting
- When is the cost of quarantine justified?

---

### Scenario 4: "The Philadelphia Lesson" (NPI Timing)
**Narrative:** Historical flashback — 1918 influenza pandemic. You're advising two cities: Philadelphia and St. Louis. Philadelphia is planning a massive parade. St. Louis is considering early school closures and gathering bans. The decisions happen at different times relative to the epidemic curve.

**Player task:**
- Control the TIMING of NPI implementation via a timeline slider
- See how early vs late intervention changes the epidemic curve dramatically
- Philadelphia scenario: NPIs delayed → massive peak, overwhelmed hospitals
- St. Louis scenario: NPIs early → flattened curve, manageable peak
- Quantify: "How many excess deaths did the delay cause?"

**Key interactive element:**
- Two side-by-side epidemic curves
- Player drags a "START NPIs" marker on the timeline for each city
- NPIs reduce β by some factor (e.g., 50% reduction in contact rate)
- Real-time comparison of total cases, peak height, peak timing

**Concepts tested:**
- Timing of NPIs matters enormously
- Flattening the curve (reducing peak, spreading cases over time)
- Hospital capacity threshold line
- Historical context from lecture 7/8

---

### Epilogue: "The Debrief"
**Narrative:** Summary dashboard of all scenarios. Player sees their decisions, outcomes, and a "scorecard" comparing their strategy effectiveness.

**Elements:**
- Fraser R₀ vs θ plot with all diseases plotted
- Summary: which interventions work for which disease types
- Key takeaway messages:
  1. Low θ → isolation can work alone
  2. High θ → need contact tracing, quarantine, or vaccination
  3. Quarantine vs symptom monitoring depends on disease biology AND setting
  4. Timing of NPIs is critical
  5. Vaccination thresholds: p_c = 1 - 1/R₀

---

## Technical Specifications

### Core Engine: Branching Process Model (for NPI scenarios)
For the intervention comparison scenarios, use a generation-based branching process (matching Peak et al.'s approach):

```javascript
// Each generation: infected individuals generate secondary cases
// R_effective depends on interventions applied
function simulateGeneration(currentInfected, R_eff, overdispersion) {
  let nextGen = 0;
  for (let i = 0; i < currentInfected; i++) {
    // Negative binomial offspring distribution
    nextGen += negBinomial(R_eff, overdispersion);
  }
  return nextGen;
}
```

### Core Engine: ODE Model (for vaccination scenarios)
Same RK4 solver as Simulation 1, with vaccination added:

**SIR with newborn vaccination:**
```
dS/dt = (1-p)μ - βSI - μS
dI/dt = βSI - γI - μI
dR/dt = γI + pμ - μR
```

**SIR with continuous vaccination of susceptibles:**
```
dS/dt = μ - βSI - νS - μS
dI/dt = βSI - γI - μI
dR/dt = γI + νS - μR
```

### Fraser Framework Implementation
The R₀ vs θ controllability plot:
```javascript
// Controllable region: where isolation + contact tracing can bring R < 1
// Boundary depends on εᵢ (isolation efficacy) and εₜ (tracing efficacy)
// Simplified: controllable when θ < 1/R₀ for isolation alone
// With contact tracing: controllable when θ(1 - εₜ) < 1/R₀ (approximate)

function isControllable(R0, theta, epsilon_i, epsilon_t) {
  // Effective R after isolation of symptomatic cases
  const R_after_isolation = R0 * (theta + (1 - theta) * (1 - epsilon_i));
  // Further reduction from contact tracing
  const R_after_tracing = R_after_isolation * (1 - epsilon_t * (1 - theta));
  return R_after_tracing < 1;
}
```

### Infectiousness Profile Visualization
Show β(τ) — infectiousness as a function of time since infection:
```javascript
// Gamma-distributed infectiousness profile
// For COVID-like: peaks around day 3-5 post-infection (before symptom onset ~day 5)
// For SARS-like: peaks around day 7-8 (after symptom onset ~day 5)
function infectiousnessProfile(tau, peakDay, shape) {
  // Gamma PDF shifted appropriately
  return gammaPDF(tau, shape, peakDay / shape);
}
```

### Peak et al. Comparison Engine
```javascript
// For each disease, simulate with:
// 1. No intervention (R₀)
// 2. Health-seeking behavior only
// 3. Symptom monitoring (D_SM delay to isolation)
// 4. Quarantine (immediate restriction of contacts)
// Compare R_S (symptom monitoring) vs R_Q (quarantine)
// Absolute comparative effectiveness: R_S - R_Q
// Relative comparative effectiveness: (R_S - R_Q) / R_Q
```

### UI Layout

**Command Center Dashboard:**
```
┌──────────────────────────────────────────────────────┐
│  OUTBREAK COMMAND CENTER          [Scenario 1/4]     │
├───────────────────────┬──────────────────────────────┤
│                       │                              │
│   BRIEFING PANEL      │    SIMULATION DISPLAY        │
│   (narrative text,    │    (epidemic curves,          │
│    disease dossier,   │     Fraser plot,              │
│    mission objectives)│     comparison charts)        │
│                       │                              │
├───────────────────────┴──────────────────────────────┤
│  INTERVENTION CONTROLS                               │
│  [Isolation ■] εᵢ: ████████░░ 80%                   │
│  [Quarantine □] εₜ: ░░░░░░░░░░ OFF                  │
│  [Symptom Mon □] D_SM: ░░░░░░░░░░ OFF               │
│  [Vaccination □] p: ░░░░░░░░░░ OFF                   │
│                                                      │
│  R_effective: 1.8  [▼ needs to be < 1]   STATUS: ⚠️  │
└──────────────────────────────────────────────────────┘
```

### Visual Design Notes
- Military/command center aesthetic — dark backgrounds, glowing accent colors
- Disease severity indicated by color: green (controlled) → yellow (borderline) → red (uncontrolled)
- R_effective displayed prominently with a gauge/meter (green below 1, red above 1)
- Animated epidemic curves that respond in real-time to slider changes
- Fraser R₀ vs θ plot with disease bubbles that the player can hover over
- Side-by-side comparison mode for Philadelphia vs St. Louis
- "Newspaper headline" results showing consequences of player decisions

### Color Scheme
- Background: dark navy (#0a1628)
- Controlled/success: green (#22c55e)
- Warning/borderline: amber (#f59e0b)
- Uncontrolled/failure: red (#ef4444)
- Isolation: blue (#3b82f6)
- Quarantine: purple (#8b5cf6)
- Symptom monitoring: teal (#14b8a6)
- Vaccination: gold (#eab308)

---

## Learning Objectives Mapped to Course Content

| Scenario | Course Content | Sources |
|----------|---------------|---------|
| 1 (SARS) | θ, isolation, Fraser framework | Lecture 6, Article 1 (Fraser 2004), Article 1 (Ferretti 2020) |
| 2 (COVID) | High θ, layered interventions, vaccination | Lecture 6, Lecture 3, Article 1 (Ferretti 2020) |
| 3 (Quarantine debate) | Quarantine vs symptom monitoring, disease biology | Article 3 (Peak 2017), Lecture 7 |
| 4 (Philadelphia) | NPI timing, flattening the curve | Lecture 7/8 |
| Epilogue | Synthesis of all intervention concepts | All |

---

## Key Formulas Reference

```
# Fraser Framework
θ = proportion of transmission before/without symptoms
Control by isolation alone: θ < 1/R₀
R_effective = R₀(1 - intervention reductions)

# Vaccination
p_c = 1 - 1/R₀                    (critical newborn vaccination proportion)
ν_c = μ(R₀ - 1)                   (critical continuous vaccination rate)
S* = 1/R₀                         (endemic equilibrium susceptible fraction)
I* = μ(R₀ - 1)/β                  (endemic equilibrium infected fraction)

# Peak et al.
T_OFFSET = T_INC - T_LAT          (gap: symptoms vs infectiousness)
  > 0: symptoms before infectiousness (easier to control)
  < 0: infectiousness before symptoms (harder to control)
R_S = R_effective under symptom monitoring
R_Q = R_effective under quarantine
Comparative effectiveness = R_S - R_Q
```

---

## Reference Documents Needed

For Claude Code to build this, include these files in the project folder:
1. **lecture_3_full.pdf** — R₀, vaccination strategies (p_c, ν_c), herd immunity
2. **lecture_6_full.pdf** — Frequency vs density dependent, vaccination strategies
3. **lecture_6_article1.pdf** (Ferretti et al. 2020) — COVID transmission routes, θ for SARS-CoV-2, R₀ decomposition, digital contact tracing
4. **lecture_6_article2.pdf** (Fraser et al. 2004) — Original θ framework, R₀ vs θ controllability plot, isolation + contact tracing math
5. **article_3_Feb26_1.pdf** (Peak et al. 2017) — Quarantine vs symptom monitoring, disease comparison table, intervention performance parameters
6. **lecture_7_full.pdf** — Exam review, NPI overview, heterogeneity
7. **lecture_8.pdf** — Age structure, STDs, contact matrices (for completeness)
8. **Assignment2_ex2_key.pdf** — Vaccination strategy worked examples (p_c, ν_c calculations)
9. **lab_4_key.pdf** — Lab on vaccination models (reference implementation)
