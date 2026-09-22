# Open FAIR™ Risk Quantification Glossary & Mathematical Reference

This document provides a comprehensive, rigorous reference guide for all abbreviations, acronyms, mathematical formulas, probability distributions, and risk rating mechanics implemented throughout the **Open FAIR™ Risk Quantification & Simulation Engine**.

---

## Table of Contents
1. [Core Open FAIR™ Ontology Acronyms & Taxonomy](#1-core-open-fair-ontology-acronyms--taxonomy)
2. [Risk Appetite & Tolerance Rating Scale (VL to SV)](#2-risk-appetite--tolerance-rating-scale-vl-to-sv)
3. [Statistical Distributions & Sampling Functions](#3-statistical-distributions--sampling-functions)
4. [Mathematical Cause & Step-by-Step Simulation Workflow](#4-mathematical-cause--step-by-step-simulation-workflow)
5. [Financial & Return on Investment (ROI) Metrics](#5-financial--return-on-investment-roi-metrics)
6. [Statistical Summary Metrics](#6-statistical-summary-metrics)

---

## 1. Core Open FAIR™ Ontology Acronyms & Taxonomy

The Open Group Standard for Risk Taxonomy (O-RT) and Risk Analysis (O-RA) decomposes risk into two primary pillars: **Loss Event Frequency (LEF)** and **Loss Magnitude (LM)**.

```
                            ┌──────────────────────────────────┐
                            │            RISK (ALE)            │
                            └────────────────┬─────────────────┘
                                             │
                     ┌───────────────────────┴───────────────────────┐
                     │                                               │
         ┌───────────┴───────────┐                       ┌───────────┴───────────┐
         │ Loss Event Freq (LEF) │                       │  Loss Magnitude (LM)  │
         └───────────┬───────────┘                       └───────────┬───────────┘
                     │                                               │
           ┌─────────┴─────────┐                           ┌─────────┴─────────┐
           │                   │                           │                   │
     ┌─────┴─────┐       ┌─────┴─────┐               ┌─────┴─────┐       ┌─────┴─────┐
     │ TEF (CF × │       │   Vuln    │               │  Primary  │       │ Secondary │
     │   PoA)    │       │ (TC > RS) │               │   Loss    │       │   Loss    │
     └───────────┘       └───────────┘               └───────────┘       └───────────┘
```

| Short Form | Full Name | Formal Definition | Mathematical Formulation / Units |
| :--- | :--- | :--- | :--- |
| **ALE** | **Annualized Loss Expectancy** | The total expected financial loss incurred by an organization over a one-year time window from a specific risk scenario. | $\text{ALE} = \sum_{i=1}^{N_{\text{events}}} \text{LM}_i$ (Currency / Year) |
| **LEF** | **Loss Event Frequency** | The anticipated number of times a threat agent will successfully breach controls and inflict loss on an asset within a given year. | $\text{LEF} = \text{TEF} \times \text{Vulnerability}$ (Events / Year) |
| **TEF** | **Threat Event Frequency** | The rate at which threat agents actively initiate actions against an asset during a one-year window. | $\text{TEF} = \text{CF} \times \text{PoA}$ (Attempts / Year) |
| **CF** | **Contact Frequency** | The frequency with which a threat agent comes into contact with the asset or its defensive perimeter. | Real number $\ge 0$ (Contacts / Year) |
| **PoA** | **Probability of Action** | The likelihood that a threat agent, once in contact with an asset, will choose to perform an attack or unauthorized action. | Percentage / Probability $p \in [0, 1]$ |
| **Vuln** / **V** | **Vulnerability** | The probability that a threat event results in a loss event. Measured by whether the Threat Capability exceeds Resistance Strength. | $P(\text{TC} > \text{RS}) \in [0.0, 1.0]$ |
| **TC** | **Threat Capability** | The level of force, skill, technical tooling, and resources a threat agent can bring to bear against a defensive control. | Calibrated Percentile / Scale $[0, 100]$ |
| **RS** | **Resistance Strength** | The effectiveness and robustness of defensive controls, security configurations, or mitigations against threat actions. | Calibrated Percentile / Scale $[0, 100]$ |
| **LM** | **Loss Magnitude** | The total financial cost incurred when a loss event occurs, combining primary and secondary loss forms. | $\text{LM} = \text{PLM} + \text{SLM}$ (Currency / Event) |
| **PLM** | **Primary Loss Magnitude** | Direct costs incurred immediately by the asset owner as a direct result of the event (e.g., productivity downtime, response costs, physical replacement). | $\text{PLM} = \sum (\text{Productivity} + \text{Response} + \text{Replacement})$ |
| **SLM** | **Secondary Loss Magnitude** | Indirect, downstream financial impacts inflicted by secondary stakeholders (e.g., regulatory fines, litigation judgments, reputational churn). | $\text{SLM} = \sum (\text{Fines} + \text{Judgments} + \text{Reputation} + \text{Competitive})$ |
| **SLEF** | **Secondary Loss Event Frequency** | The percentage likelihood that a primary loss event will trigger secondary stakeholder reactions (e.g., probability that a breach triggers regulatory investigation). | Percentage / Probability $p \in [0, 1]$ |

---

## 2. Risk Appetite & Tolerance Rating Scale (VL to SV)

The application evaluates simulated **Value-at-Risk ($P_{90}$ or $P_{95}$)** against the organization's calibrated Risk Appetite / Tolerance Thresholds.

| Short Form | Full Name | Standard Threshold Meaning | Visual Color Code |
| :---: | :--- | :--- | :---: |
| **VL** | **Very Low** | Value at Risk is strictly below the minimum risk tolerance bound ($\text{Loss} \le \text{veryLowMax}$). Well within organizational risk appetite. | Emerald Green (`#16a34a`) |
| **L** | **Low** | Value at Risk is between the Very Low and Low thresholds ($\text{veryLowMax} < \text{Loss} \le \text{lowMax}$). Acceptable operational risk. | Lime Green (`#84cc16`) |
| **M** | **Moderate** | Value at Risk is between the Low and Moderate thresholds ($\text{lowMax} < \text{Loss} \le \text{moderateMax}$). Requires periodic monitoring. | Yellow (`#eab308`) |
| **SG** | **Significant** | Value at Risk is between Moderate and Significant thresholds ($\text{moderateMax} < \text{Loss} \le \text{significantMax}$). Exceeds preferred operating tolerance; proactive control planning required. | Orange (`#f97316`) |
| **H** | **High** | Value at Risk is between Significant and High tolerance boundaries ($\text{significantMax} < \text{Loss} \le \text{highMax}$). High executive visibility; active treatment required. | Red (`#ef4444`) |
| **SV** | **Severe** | Value at Risk exceeds the Maximum Risk Tolerance threshold ($\text{Loss} > \text{highMax}$). Threat scenarios in this category present catastrophic insolvency or severe regulatory consequences if left untreated. | Rose / Dark Crimson (`#991b1b`) |

---

## 3. Statistical Distributions & Sampling Functions

The Open FAIR Monte Carlo engine uses specialized probability distributions to represent expert calibration and natural variance.

### 3.1 Modified Beta-PERT Distribution (`samplePert`)
Used for parameter estimation with Low ($L$), Mode ($M$), High ($H$), and Confidence weighting ($\gamma$):

$$\mu = \frac{L + \gamma \cdot M + H}{\gamma + 2}, \quad \sigma^2 = \frac{(H - L)^2}{(\gamma + 2)^2}$$

$$\alpha = \left( \frac{\mu - L}{H - L} \right) \cdot \left[ \frac{(H - \mu)(\mu - L)}{\sigma^2} - 1 \right], \quad \beta = \alpha \cdot \left( \frac{H - \mu}{\mu - L} \right)$$

$$X = L + \text{Beta}(\alpha, \beta) \cdot (H - L)$$

### 3.2 Poisson Distribution (`samplePoisson`)
Models the discrete count of annual loss events occurring independently in continuous time:

$$P(k \text{ events}) = \frac{\lambda^k e^{-\lambda}}{k!}, \quad \text{where } \lambda = \text{LEF}$$

### 3.3 Binomial Distribution (`sampleBinomial`)
Models secondary reactions triggered across $n$ primary loss events with probability $p = \text{SLEF}$:

$$P(k \text{ secondary events}) = \binom{n}{k} p^k (1 - p)^{n - k}$$

---

## 4. Mathematical Cause & Step-by-Step Simulation Workflow

### Why is an Unmitigated Scenario Rated "SV" (Severe)?
In Open FAIR risk quantification, mission-critical assets (such as core SWIFT banking wires, AI foundational model weights, or enterprise transaction databases) represent tens to hundreds of millions in potential business impact. 

When analyzing an **inherent** (unmitigated) state:
1. Threat Capability ($TC \approx 80\%$) heavily exceeds baseline controls ($RS \approx 40\%$).
2. Vulnerability evaluates to $1.0$ (100% breach rate on contact).
3. Primary Loss ($PLM \approx \$5\text{M}$) and Secondary Fines ($SLM \approx \$10\text{M}$) compound across annual occurrences.
4. The 90th percentile Value at Risk ($P_{90}$) reaches $\$50\text{M}-\$100\text{M}$, which exceeds the organizational High Risk Tolerance bound ($\$15\text{M}$).
5. Consequently, the mathematical rating evaluates to **Severe (SV)**.

### Step-by-Step Monte Carlo Trial Algorithm ($T = 10,000$ iterations)

```
For each trial t in 1..T:
  1. Sample Contact Frequency:      CF_t   ~ BetaPERT(CF_low, CF_mode, CF_high)
  2. Sample Probability of Action:  PoA_t  ~ BetaPERT(PoA_low, PoA_mode, PoA_high)
  3. Calculate Threat Events:       TEF_t  = CF_t * PoA_t
  4. Sample Capabilities:           TC_t   ~ BetaPERT(TC_low, TC_mode, TC_high)
                                    RS_t   ~ BetaPERT(RS_low, RS_mode, RS_high)
  5. Compute Vulnerability:         Vuln_t = 1.0 if (TC_t > RS_t) else 0.0
  6. Calculate Loss Frequency:      LEF_t  = TEF_t * Vuln_t
  7. Generate Discrete Events:      N_t    ~ Poisson(LEF_t)
  8. If N_t == 0:
       ALE_t = 0
     Else:
       Sample Primary Loss/Event:   PLM_t  ~ BetaPERT(PLM_low, PLM_mode, PLM_high)
       Sample Secondary Rate:       SLEF_t ~ BetaPERT(SLEF_low, SLEF_mode, SLEF_high)
       Count Secondary Events:      SecN_t ~ Binomial(N_t, SLEF_t)
       Sample Secondary Loss/Event: SLM_t  ~ BetaPERT(SLM_low, SLM_mode, SLM_high)
       Calculate Total Loss:        ALE_t  = (N_t * PLM_t) + (SecN_t * SLM_t)
```

---

## 5. Financial & Return on Investment (ROI) Metrics

When evaluating proposed security controls against current baseline controls:

| Metric Short Form | Full Name | Mathematical Formula | Business Purpose |
| :--- | :--- | :--- | :--- |
| **ARR** | **Annual Risk Reduction** | $\text{ARR} = \text{ALE}_{\text{current}} - \text{ALE}_{\text{proposed}}$ | Measures total expected financial loss prevented each year by implementing the control. |
| **RoSI** | **Return on Security Investment** | $\text{RoSI} = \frac{\text{ARR} - \text{Control Cost}}{\text{Control Cost}} \times 100\%$ | Demonstrates whether security spending produces positive net economic value. |
| **NPV** | **Net Present Value** | $\text{NPV} = \sum_{t=1}^T \frac{\text{ARR}_t}{(1 + r)^t} - \text{CapEx}_0$ | Evaluates the multi-year capital expenditure justification of security programs. |
| **BCR** | **Benefit-Cost Ratio** | $\text{BCR} = \frac{\text{ARR}}{\text{Annualized Control Cost}}$ | Ratio of dollars saved per dollar invested (BCR $> 1.0$ indicates positive return). |

---

## 6. Statistical Summary Metrics

| Metric | Full Name | Calculation / Mathematical Definition |
| :--- | :--- | :--- |
| **$P_{10}$** | 10th Percentile (Optimistic) | Value below which 10% of simulation outcomes fall (Best-case loss year). |
| **$P_{50}$** | 50th Percentile (Median) | Median simulated annual loss. Half of all years experience losses below this figure. |
| **$P_{90}$** | 90th Percentile (Value at Risk) | Standard Open FAIR Value-at-Risk metric; 90% of simulated years experience loss $\le P_{90}$. |
| **$P_{95}$** | 95th Percentile (Conservative VaR) | Conservative enterprise threshold; 95% of simulated years experience loss $\le P_{95}$. |
| **$P_{99}$** | 99th Percentile (Extreme Tail Risk) | 1-in-100-year catastrophic tail loss event (Black Swan / extreme stress test). |
| **LEC** | Loss Exceedance Curve | Complementary Cumulative Distribution Function: $P(\text{Annual Loss} \ge X)$. |
| **IQR** | Interquartile Range | Spread of the middle 50% of simulation results ($P_{75} - P_{25}$). |
| **SEM** | Standard Error of the Mean | $\text{SEM} = \frac{\sigma}{\sqrt{N_{\text{trials}}}}$, quantifies Monte Carlo convergence precision. |
| **CVaR / TVaR** | Conditional / Tail Value at Risk | Expected loss given that loss exceeds VaR ($E[\text{Loss} \mid \text{Loss} \ge P_{90}]$). |

---

## 7. Sensitivity Analysis & Loss Exceedance Variance Drivers

Sensitivity analysis identifies which input variables contribute most significantly to uncertainty and tail risk in the Loss Exceedance Curve (LEC).

| Metric Short Form | Full Name | Mathematical Formula | Analytical Significance |
| :--- | :--- | :--- | :--- |
| **Tornado $\Delta\text{ALE}$** | **Tornado Impact Swing** | $\Delta \text{ALE}_i = \text{ALE}(x_{i, P90}) - \text{ALE}(x_{i, P10})$ | Measures the swing in expected loss when input $i$ varies from 10th to 90th percentile, holding others constant. |
| **Variance Share (% $\sigma^2$)** | **Variance Decomposition Ratio** | $\frac{\text{Var}(E[\text{ALE} \mid X_i])}{\text{Var}(\text{ALE})} \times 100\%$ | Quantifies the fraction of total output variance attributable to parameter $X_i$ via first-order sensitivity indexing. |
| **$r_{\text{tail}}$** | **Tail Correlation Coefficient** | $\text{Corr}(X_i, \text{ALE} \mid \text{ALE} \ge P_{90})$ | Measures parameter impact specifically on catastrophic tail loss trials exceeding Value-at-Risk ($P_{90}$). |
| **$E_i$** | **Parameter Elasticity** | $\frac{\% \Delta \text{ALE}}{\% \Delta X_i} = \frac{\partial \text{ALE}}{\partial X_i} \cdot \frac{X_i}{\text{ALE}}$ | Percentage change in ALE resulting from a 1% shift in input parameter $X_i$. |
| **Domain Ratio** | **Frequency vs. Magnitude Share** | $\frac{\sum \text{Var}_{\text{Freq}}}{\text{Var}_{\text{Total}}} \text{ vs } \frac{\sum \text{Var}_{\text{Mag}}}{\text{Var}_{\text{Total}}}$ | Determines whether risk treatment should prioritize attack deterrence (frequency) vs. blast-radius mitigation (magnitude). |

---

## 8. Specific Loss Forms (Primary vs. Secondary)

| Short Form | Full Name | Loss Category | Mathematical Formulation |
| :--- | :--- | :--- | :--- |
| **PRD** | **Productivity Loss** | Primary | $\text{PRD} = \text{Downtime Hours} \times \text{Revenue/Hour} + \text{Idle Payroll Cost}$ |
| **RSP** | **Response Cost** | Primary | $\text{RSP} = \sum (\text{Forensic Retainers} + \text{Legal Triage} + \text{Staff Overtime})$ |
| **RPL** | **Replacement Cost** | Primary | $\text{RPL} = \sum (\text{Hardware Procured} + \text{Data Restoration Fees})$ |
| **FIN / REG** | **Fines & Regulatory Penalties** | Secondary | $\text{FIN} = \text{Statutory Fine Formula} \times \text{Breach Scale}$ |
| **CMP** | **Competitive Advantage Loss** | Secondary | $\text{CMP} = \text{Discounted Value of Lost Market Exclusivity}$ |
| **REP** | **Reputation Loss & Churn** | Secondary | $\text{REP} = \Delta\text{Churn Rate} \times \text{Customer Lifetime Value (LTV)}$ |

