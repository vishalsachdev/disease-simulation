# Simulation 1: "Patient Zero" — The Mystery Pathogen Detective Story

## Overview

An interactive narrative simulation where the player is an epidemiologist called to investigate a mystery outbreak in a city. Through progressive chapters, they must identify the correct compartmental model (SI, SIR, SEIR, SIRS), estimate parameters, compute R₀, determine equilibrium behavior, and ultimately advise the city on whether the disease will burn out or become endemic.

**Tech stack:** React (Vite + Tailwind), with an ODE solver running client-side (e.g., Euler or RK4 in JS). Single-page app with chapter-based progression.

---

## Storyline & Chapter Structure

### Chapter 1: "The First Cases"
**Narrative:** You arrive in Millbrook City. The hospital reports a cluster of 10 patients with a new respiratory illness. Population: 100,000. You have limited data — just a rising case count over the first 2 weeks.

**Player task:**
- View an animated epidemic curve (cases over time) that's being "revealed" day by day
- The curve shows a classic exponential rise in infections
- Player is asked: "Based on what you see, what kind of model might describe this disease?"
- Player selects from: SI, SIR, SEIR, SIRS
- At this stage, any model with infection dynamics could fit — the point is to observe that infection is growing

**Concepts tested:** Basic model structure, what an epidemic curve looks like in early stages

**Feedback:** The simulation overlays the player's chosen model on the observed data. All models look similar in early exponential growth — this teaches that early data is ambiguous.

---

### Chapter 2: "The Recovery Ward"
**Narrative:** Week 3 — good news. Patients are recovering. The infectious period appears to be about 7 days (γ = 365/7 per year). You now see the epidemic curve bending.

**Player task:**
- Updated epidemic curve now shows the peak and decline
- Player adjusts β (transmission rate) using a slider to fit the observed curve
- The simulation computes and displays R₀ = β/(γ+μ) in real time
- Player is asked: "What is R₀ for this pathogen?" and must get it within a reasonable range
- Player sees S cross below 1/R₀ and observes the peak — "Why did cases start declining even though there are still susceptibles?"

**Concepts tested:**
- Force of infection (βSI)
- R₀ as invasion threshold
- Epidemic peak occurs when S = 1/R₀
- Epidemic burnout (susceptible depletion)

**Key formulas:**
```
dS/dt = -βSI
dI/dt = βSI - γI
dR/dt = γI
R₀ = β/γ (without demography)
Peak when S = 1/R₀
```

---

### Chapter 3: "A Latent Threat"
**Narrative:** Week 5 — Lab results reveal that the pathogen has a latent/incubation period of about 5 days before infected individuals become infectious. Your SIR model's timing was slightly off — the observed peak came later than your SIR predicted.

**Player task:**
- Toggle between SIR and SEIR model fits
- Observe that SEIR delays the peak (matching the course's Assignment 1 finding)
- Adjust σ (latent rate = 365/5) and see its effect
- Note that final epidemic size S(∞) is essentially the same between SIR and SEIR

**Concepts tested:**
- The E compartment and its role
- SEIR vs SIR: peak timing differs, final size similar
- Next generation matrix concept preview (R₀ for SEIR = βσ/[(σ+μ)(γ+μ)])

**Key formulas:**
```
dS/dt = μ - βSI - μS
dE/dt = βSI - σE - μE
dI/dt = σE - γI - μI
dR/dt = γI - μR
```

---

### Chapter 4: "It's Not Over"
**Narrative:** Month 6 — You thought the outbreak was finished. But cases are rising again. Reports of reinfection emerge — immunity appears to wane after about 30 days. Meanwhile, the city has births and deaths (μ = 0.02/year).

**Player task:**
- Switch model to SIRS (add waning immunity ω = 365/30)
- Turn on demography (μ = 0.02)
- Run simulation for several years and observe:
  - Initial large outbreak → small bump → endemic oscillations → steady state
- Compare: SIR (burns out forever) vs SIRS (oscillations, endemic)
- Player identifies the endemic equilibrium values: S* = 1/R₀, I* = μ(R₀-1)/β

**Concepts tested:**
- Waning immunity and its consequences
- Demography (births replenish susceptibles)
- Endemic equilibrium vs disease-free equilibrium
- Why herd immunity doesn't apply when immunity wanes

**Key formulas:**
```
dS/dt = μ - βSI + ωR - μS
dI/dt = βSI - γI - μI
dR/dt = γI - ωR - μR
S* = (γ+μ)/β = 1/R₀
I* = μ(R₀-1)/β
```

---

### Chapter 5: "The Model Trade-Off"
**Narrative:** The city council asks you to present your findings. They want to know: which model should we use going forward? You must explain the trade-offs.

**Player task:**
- Interactive comparison panel showing all 4 models side by side
- Player answers reflection questions:
  - "Which model is most accurate for this pathogen?" (SIRS with demography)
  - "Which is most transparent/easy to explain to the council?" (SIR)
  - "Which gives the most flexibility for future what-if scenarios?" (SEIR/SIRS)
- Scoring/summary of the player's detective work

**Concepts tested:**
- Accuracy vs transparency vs flexibility trade-off
- Model selection reasoning
- Prevalence (I at a point in time) vs incidence (new cases per time)

---

## Technical Specifications

### ODE Solver
Implement 4th-order Runge-Kutta (RK4) in JavaScript:
```javascript
function rk4Step(derivs, y, t, dt, params) {
  const k1 = derivs(y, t, params);
  const k2 = derivs(y.map((v,i) => v + dt/2*k1[i]), t + dt/2, params);
  const k3 = derivs(y.map((v,i) => v + dt/2*k2[i]), t + dt/2, params);
  const k4 = derivs(y.map((v,i) => v + dt*k3[i]), t + dt, params);
  return y.map((v,i) => v + dt/6*(k1[i] + 2*k2[i] + 2*k3[i] + k4[i]));
}
```

### Model Definitions (all frequency-dependent transmission)

**SI with demography:**
```
dS/dt = μ - βSI - μS
dI/dt = βSI - μI
```

**SIR with demography:**
```
dS/dt = μ - βSI - μS
dI/dt = βSI - γI - μI
dR/dt = γI - μR
```

**SEIR with demography:**
```
dS/dt = μ - βSI - μS
dE/dt = βSI - σE - μE
dI/dt = σE - γI - μI
dR/dt = γI - μR
```

**SIRS with demography:**
```
dS/dt = μ - βSI + ωR - μS
dI/dt = βSI - γI - μI
dR/dt = γI - ωR - μR
```

### Default Parameter Values (from course materials)
| Parameter | Value | Meaning |
|-----------|-------|---------|
| β | 200 | Transmission rate |
| γ | 365/7 ≈ 52.14 | Recovery rate (7-day infectious period) |
| σ | 365/5 = 73 | Latent rate (5-day latent period) |
| μ | 0.02 | Birth/death rate per year |
| ω | 365/30 ≈ 12.17 | Waning immunity rate (30-day duration) |
| S(0) | 0.999 | Initial susceptible proportion |
| I(0) | 0.001 | Initial infected proportion |

### UI Components Per Chapter
1. **Narrative panel** (left side): Story text, character dialogue, mission briefings
2. **Simulation panel** (right side): Real-time epidemic curves (Recharts or D3)
3. **Control panel** (bottom): Sliders for parameters, model selector toggles
4. **Metrics dashboard**: R₀, S*, I*, peak timing, final size — updating in real time
5. **Quiz/decision points**: Multiple choice or slider-based answers between chapters

### Visual Design Notes
- Dark theme with medical/epidemiological aesthetic
- Color scheme: S = blue, E = orange, I = red, R = green (consistent with course slides)
- Animated "day counter" that advances as the epidemic unfolds
- Newspaper-style "breaking news" headers for each chapter transition
- Progress bar showing Chapter 1–5 advancement

---

## Learning Objectives Mapped to Course Content

| Chapter | Course Content | Lectures | Labs/Assignments |
|---------|---------------|----------|-----------------|
| 1 | Early epidemic dynamics, model types | L1, L2 | — |
| 2 | SIR, R₀, epidemic peak, burnout | L2, L3 | Lab 1, Asgn 1 |
| 3 | SEIR, latent period, peak timing | L2, L4 | Lab 1, Asgn 1 |
| 4 | SIRS, waning immunity, endemic eq. | L3, L4 | Lab 2, Asgn 1 |
| 5 | Model trade-offs, prevalence vs incidence | L1, L7 | — |

---

## Reference Documents Needed

For Claude Code to build this, include these files in the project folder:
1. **lecture_1.pdf** — Model trade-offs (accuracy/transparency/flexibility)
2. **lecture_2_full.pdf** — SIR model, discrete vs continuous, force of infection
3. **lecture_3_full.pdf** — R₀, vaccination, equilibrium analysis, epidemic burnout
4. **lecture_4_full_2.pdf** — Long-term dynamics, next generation matrix, seasonality
5. **lab1assignment1_stat430.pdf** — Your submitted code for SIR/SEIR/SI/SIRS (reference implementation in R, translate to JS)
6. **Assignment_1_1.pdf** — Assignment prompts for model comparison
7. **lab_1_key.pdf** — Lab 1 answers (SIR implementation reference)
8. **lab_2_key.pdf** — Lab 2 answers (SEIR with seasonality reference)
