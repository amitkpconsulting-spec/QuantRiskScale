# Open Group Standard: Risk Analysis (O-RA)

> **Document Reference**: The Open Group Technical Standard — Risk Analysis (O-RA), Version 2.0.1  
> **Published by**: The Open Group  
> **Key Objective**: Define the quantitative processes, modeling techniques, calibration standards, and control evaluation frameworks for Open FAIR™ risk analysis.

---

## 1. Introduction & Foundational Concepts

### 1.1 Assessment versus Analysis
- **Risk Assessment**: Encompasses the broad organizational lifecycle including risk identification, governance, control frameworks, and reporting.
- **Risk Analysis**: Specifically calculates the **probable frequency and probable magnitude of future loss** using statistical modeling and calibration.

### 1.2 Key Measurement Principles
- **Accuracy versus Precision**:
  - *Accuracy* is binary (the actual future event falls within the estimated range).
  - *Precision* is the narrowness of the range.
  - When modeling under uncertainty, **always prioritize accuracy over precision**.
  - A standardized 90% confidence interval (5% chance below minimum, 5% chance above maximum) provides an optimal tradeoff.
- **Subjectivity versus Objectivity**:
  - Unstated biases and gut feelings degrade analysis.
  - Objective logs, incident history, and empirical ranges should inform 3-point estimates.

---

## 2. Calibration Techniques & 3-Point Estimation

### 2.1 Calibration Methodology
1. **Starting with the Absurd**: Begin with wildly wide boundaries (e.g., $1 to $1B) to eliminate cognitive anchoring bias and narrow inward.
2. **Decomposing the Problem (Fermi Decomposition)**: Break difficult variables into accessible sub-factors (e.g., *Records Lost $\times$ Cost per Record*).
3. **The Equivalent Bet (Wheel of Confidence)**: Test if the analyst is as confident in their 90% range as spinning a wheel with a 90% winning sector.
4. **Challenging Assumptions**: Document and validate baseline conditions with domain subject matter experts.

### 2.2 Standard 3-Point Beta-PERT Distribution
To capture uncertainty without assuming false precision, Open FAIR utilizes the Beta-PERT distribution:
- **Low ($a$)**: 5th percentile minimum realistic value.
- **Mode ($m$)**: Most likely peak value.
- **High ($b$)**: 95th percentile maximum realistic value.

$$\mu = \frac{a + 4m + b}{6}, \quad \sigma = \frac{b - a}{6}$$

---

## 3. The 5-Stage Open FAIR™ Risk Analysis Process

```
┌─────────────────────────────────────────────────────────────┐
│ Stage 1: Identify the Loss Scenario (Scope the Analysis)   │
│ • Primary Stakeholder  • Asset                             │
│ • Threat Agent/Community • Threat Event • Loss Event       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Stage 2: Evaluate Loss Event Frequency (LEF)                │
│ • Direct LEF or Decompose: TEF (CF × PoA) & Vuln (TCap>RS) │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Stage 3: Evaluate Loss Magnitude (LM)                       │
│ • Primary Loss Magnitude (Productivity, Response, Replace) │
│ • Secondary Loss: SLEF (prob) × SLM (Fines, Rep, Legal)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Stage 4: Derive and Articulate Risk                         │
│ • Monte Carlo Simulation (e.g. 10,000 to 50,000 trials)    │
│ • Single-Number Metrics (Mean ALE, P50, 90th% VaR, P99)    │
│ • Loss Exceedance Curve (LEC) & Loss Distributions         │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Stage 5: Model the Effect of Controls & Treatment Options   │
│ • Apply 4 Open FAIR Control Categories                     │
│ • Map to NIST Cybersecurity Framework (Protect/Detect/etc.)│
│ • Evaluate Residual Risk, ALE Delta, and ROSI %            │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Modeling the Effect of Controls

### 4.1 The Four Open FAIR™ Control Categories

| Control Category | Mechanism in Taxonomy | Effect on Risk | NIST CSF Mapping |
| :--- | :--- | :--- | :--- |
| **Avoidance Controls** | Reduces **Contact Frequency (CF)** | Prevents threat agents from reaching the asset (e.g., firewall filters, asset isolation). | **Protect (PR)** |
| **Deterrent Controls** | Reduces **Probability of Action (PoA)** | Decreases threat motivation/intent post-contact (e.g., warning banners, visible auditing). | **Protect (PR)** |
| **Vulnerability Controls** | Increases **Resistance Strength (RS)** | Enhances asset defense against force (e.g., MFA, encryption, patching, hardening). | **Protect (PR)** |
| **Responsive Controls** | Mitigates **Loss Magnitude (LM)** | Decreases outage duration and secondary fallout (e.g., EDR, backups, PR playbooks). | **Detect (DE), Respond (RS), Recover (RC)** |

### 4.2 Economic Return on Security Investment (ROSI)
$$\text{Annual Risk Reduction} = \text{ALE}_{\text{Inherent}} - \text{ALE}_{\text{Residual}}$$
$$\text{Net Benefit} = \text{Annual Risk Reduction} - \text{Annualized Control Cost}$$
$$\text{ROSI (\%)} = \left(\frac{\text{Net Benefit}}{\text{Annualized Control Cost}}\right) \times 100$$

---

## 5. Advanced Risk Qualifiers & Analysis Quality

### 5.1 Open FAIR Risk Qualifiers
When numeric averages could create a false sense of security, analysts apply standardized qualifiers:
- **Fragile Qualifier**: Used when Loss Event Frequency is low in spite of high Threat Event Frequency, but *only* because of a single point of failure preventative control.
- **Unstable Qualifier**: Used when Loss Event Frequency is low *solely* because Threat Event Frequency is currently low (no effective preventative controls exist if threat contact escalates).

### 5.2 Loss Exceedance Curve (LEC) Interpretation
The LEC displays the probability ($Y$-axis, 0% to 100%) that total losses in a given year will exceed a specified financial threshold ($X$-axis). This allows executive boards to evaluate Value at Risk against defined Risk Tolerance capacities.
