# Open Group Standard: Risk Taxonomy (O-RT)

> **Document Reference**: The Open Group Technical Standard — Risk Taxonomy (O-RT), Version 2.0 / Version 3.0.1  
> **Published by**: The Open Group  
> **Key Objective**: Establish a precise, logically consistent taxonomy and vocabulary for quantitative information security risk and loss factors.

---

## 1. Executive Summary & Philosophy

Fundamental to risk assessment is the principle:
> *"You can't effectively and consistently manage what you can't measure, and you can't measure what you haven't defined."*

The **Risk Taxonomy (O-RT)** defines the problem space that organizations must manage: the **probable frequency and magnitude of future loss** (pure risk, as opposed to speculative risk).

```
              ┌───────────────────────────┐
              │    Effective Management   │
              └─────────────▲─────────────┘
                            │
              ┌─────────────┴─────────────┐
              │   Well-informed Decisions │
              └─────────────▲─────────────┘
                            │
              ┌─────────────┴─────────────┐
              │   Effective Comparisons   │
              └─────────────▲─────────────┘
                            │
              ┌─────────────┴─────────────┐
              │   Meaningful Measurements │
              └─────────────▲─────────────┘
                            │
              ┌─────────────┴─────────────┐
              │    Accurate Risk Model    │
              └───────────────────────────┘
```

---

## 2. High-Level Risk Taxonomy Structure

Risk decomposes into two fundamental branches:
1. **Loss Event Frequency (LEF)**: How often loss events occur over a specified timeframe.
2. **Loss Magnitude (LM)**: The economic magnitude of loss when an event occurs.

```
                                    ┌──────────────┐
                                    │     RISK     │
                                    └──────┬───────┘
                     ┌─────────────────────┴─────────────────────┐
                     ▼                                           ▼
          ┌─────────────────────┐                     ┌─────────────────────┐
          │ Loss Event Frequency│                     │    Loss Magnitude   │
          │       (LEF)         │                     │        (LM)         │
          └──────────┬──────────┘                     └──────────┬──────────┘
           ┌─────────┴─────────┐                       ┌─────────┴─────────┐
           ▼                   ▼                       ▼                   ▼
    ┌──────────────┐    ┌──────────────┐        ┌──────────────┐    ┌──────────────┐
    │ Threat Event │    │Vulnerability │        │ Primary Loss │    │Secondary Loss│
    │Frequency(TEF)│    │    (Vuln)    │        │  Magnitude   │    │  Magnitude   │
    └──────┬───────┘    └──────┬───────┘        └──────────────┘    └──────┬───────┘
     ┌─────┴─────┐       ┌─────┴─────┐                               ┌─────┴─────┐
     ▼           ▼       ▼           ▼                               ▼           ▼
┌─────────┐ ┌─────────┐┌─────────┐┌─────────┐                  ┌───────────┐┌───────────┐
│ Contact │ │ Prob. of││ Threat  ││Resistance│                  │ Secondary ││ Secondary │
│Frequency│ │ Action  ││Capab.   ││Strength  │                  │Loss Event ││   Loss    │
│  (CF)   │ │  (PoA)  ││ (TCap)  ││  (RS)    │                  │ Freq(SLEF)││ Magn.(SLM)│
└─────────┘ └─────────┘└─────────┘└─────────┘                  └───────────┘└───────────┘
```

---

## 3. Loss Event Frequency (LEF) Branch

### 3.1 Definitions & Mathematical Relationships
- **Loss Event Frequency (LEF)**: The probable frequency, within a given timeframe, that a threat agent will inflict harm upon an asset.
- **Threat Event Frequency (TEF)**: The probable frequency, within a given timeframe, that a threat agent will act against an asset (whether successful or not).
- **Vulnerability (Vuln)**: The conditional probability that a threat event becomes a loss event:
  $$\text{LEF} = \text{TEF} \times \text{Vuln}$$
  $$\text{LEF} \le \text{TEF} \le \text{CF}$$

### 3.2 Threat Event Frequency (TEF) Sub-Factors
1. **Contact Frequency (CF)**: The probable frequency that a threat agent comes into contact with an asset.
   - *Random Contact*: Threat agent stumbles upon the asset during undirected activity.
   - *Regular Contact*: Contact happens due to routine activities (e.g., maintenance crew, scheduled batches).
   - *Intentional Contact*: Threat agent intentionally targets specific assets.
2. **Probability of Action (PoA)**: The probability that a threat agent acts against an asset once contact occurs. Driven by:
   - *Value*: Threat agent's perceived value proposition.
   - *Level of Effort*: Expected difficulty to accomplish the act.
   - *Risk of Detection / Capture*: Probability of negative consequences to the threat agent.

### 3.3 Vulnerability (Vuln) Sub-Factors
- **Threat Capability (TCap)**: The probable level of force that a threat agent is capable of applying against an asset (expressed as a percentile against the general threat population, e.g., Top 2% = Elite, Top 16% = High).
- **Resistance Strength (RS)**: The strength of a control as compared to a baseline measure of force (expressed as the percentile of threat capability it can resist).
- **Mathematical Relationship**:
  $$\text{Vuln} = \Pr(\text{TCap} > \text{RS})$$

---

## 4. Loss Magnitude (LM) & Loss Flow

### 4.1 The Concept of Loss Flow
Loss flow separates direct consequences to the asset owner (**Primary Loss**) from the cascading reactions of external stakeholders (**Secondary Loss**).

### 4.2 The Six Standard Forms of Loss

| Form of Loss | Description | Typical Loss Flow Phase |
| :--- | :--- | :--- |
| **Productivity** | Reduction in the organization's ability to generate its primary value proposition (outages, downtime, idle staff payroll). | Primary |
| **Response** | Expenses incurred to investigate, contain, remediate, defend, and manage an incident (forensics, crisis PR, legal counsel). | Primary & Secondary |
| **Replacement** | Intrinsic capital expense to replace, rebuild, or restore lost or damaged assets. | Primary (rarely Secondary) |
| **Fines & Judgments** | Legal, statutory, or regulatory penalties levied by governing bodies or courts (GDPR, CCPA, SEC, PCI DSS). | Secondary |
| **Competitive Advantage** | Loss associated with diminished market differentiation (stolen trade secrets, proprietary algorithm theft). | Secondary / Primary |
| **Reputation** | Losses stemming from external stakeholder perception (customer churn, drop in stock price, increased cost of capital). | Secondary |

### 4.3 Secondary Loss Dynamics
- **Secondary Loss Event Frequency (SLEF)**: The conditional probability that a primary event triggers external stakeholder reaction:
  $$\text{SLEF} = \Pr(\text{Secondary Loss} \mid \text{Primary Loss})$$
- **Secondary Loss Magnitude (SLM)**: The cumulative loss across secondary forms:
  $$\text{SLM} = \sum \text{Secondary Loss Forms}$$
- **Total Loss Magnitude**:
  $$\text{LM} = \text{PLM} + \text{SLM}$$

---

## 5. Loss Factors (Asset, Threat, Organization, External)

1. **Asset Loss Factors**:
   - *Criticality*: Impact on organizational productivity and revenue generation.
   - *Cost*: Intrinsic asset replacement value.
   - *Sensitivity*: Embarrassment/Reputation, Competitive Advantage, Legal/Regulatory, General.
   - *Volume*: Number of records or assets exposed.
2. **Threat Loss Factors**:
   - *Action*: Access, Misuse, Disclose, Modify, Deny Access.
   - *Competence*: Skill to inflict damage post-compromise.
   - *Internal vs. External*: Insiders vs. external threat actors.
3. **Organization Loss Factors**:
   - *Timing*, *Due Diligence*, *Detection*, *Response (Containment, Remediation, Recovery)*.
4. **External Loss Factors**:
   - *Detection*, *Legal & Regulatory landscape*, *Competitors*, *Media coverage*, *Stakeholders*.
