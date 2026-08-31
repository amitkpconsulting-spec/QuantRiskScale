export interface GlossaryEntry {
  id: string;
  shortForm: string;
  fullName: string;
  category: 'Core Taxonomy' | 'Risk Ratings' | 'Distributions' | 'Mathematical Cause' | 'Financial & RoSI' | 'Statistical Metrics';
  definition: string;
  mathematicalFormulation?: string;
  units?: string;
  exampleOrContext?: string;
  relatedTerms?: string[];
  tierColor?: string;
  tierBg?: string;
}

export const GLOSSARY_CATEGORIES = [
  'All',
  'Core Taxonomy',
  'Risk Ratings',
  'Distributions',
  'Mathematical Cause',
  'Financial & RoSI',
  'Statistical Metrics'
] as const;

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  // 1. Core Taxonomy
  {
    id: 'ale',
    shortForm: 'ALE',
    fullName: 'Annualized Loss Expectancy',
    category: 'Core Taxonomy',
    definition: 'The total expected financial loss incurred by an organization over a one-year time window from a specific risk scenario or aggregated risk portfolio.',
    mathematicalFormulation: 'ALE = \\sum_{i=1}^{N_{\\text{events}}} \\text{LM}_i = \\text{LEF} \\times \\overline{\\text{LM}}',
    units: 'Currency / Year (e.g., USD / Year)',
    exampleOrContext: 'If a bank experiences an average of 0.5 SWIFT wire fraud events per year with an average loss of $10,000,000, the mean ALE is $5,000,000/year.',
    relatedTerms: ['LEF', 'LM', 'PLM', 'SLM', 'ARR']
  },
  {
    id: 'lef',
    shortForm: 'LEF',
    fullName: 'Loss Event Frequency',
    category: 'Core Taxonomy',
    definition: 'The anticipated number of times a threat agent will successfully breach controls and inflict financial loss on an asset within a one-year window.',
    mathematicalFormulation: '\\text{LEF} = \\text{TEF} \\times \\text{Vulnerability}',
    units: 'Events / Year',
    exampleOrContext: 'If an e-commerce platform faces 10 attack attempts/year (TEF) and controls fail 20% of the time (Vuln = 0.2), LEF = 2.0 loss events/year.',
    relatedTerms: ['TEF', 'Vuln', 'CF', 'PoA']
  },
  {
    id: 'tef',
    shortForm: 'TEF',
    fullName: 'Threat Event Frequency',
    category: 'Core Taxonomy',
    definition: 'The rate at which threat agents actively initiate actions or attacks against an asset during a given time period (typically one year).',
    mathematicalFormulation: '\\text{TEF} = \\text{CF} \\times \\text{PoA}',
    units: 'Action Attempts / Year',
    exampleOrContext: 'A database has 100 encounters with malicious external port scans per year (CF), and scanners attempt an exploit payload 10% of the time (PoA), yielding TEF = 10 attempts/year.',
    relatedTerms: ['CF', 'PoA', 'LEF']
  },
  {
    id: 'cf',
    shortForm: 'CF',
    fullName: 'Contact Frequency',
    category: 'Core Taxonomy',
    definition: 'The frequency with which a threat agent comes into contact with the asset, its perimeter, or its network interface.',
    mathematicalFormulation: '\\text{CF} \\ge 0 \\text{ (Contacts per year)}',
    units: 'Contacts / Year',
    exampleOrContext: 'Can represent random opportunistic encounters (e.g., bots scanning IP ranges) or targeted persistent surveillance by an Advanced Persistent Threat (APT).',
    relatedTerms: ['PoA', 'TEF']
  },
  {
    id: 'poa',
    shortForm: 'PoA',
    fullName: 'Probability of Action',
    category: 'Core Taxonomy',
    definition: 'The probability that a threat agent, once in contact with an asset, will choose to perform an attack, unauthorized action, or exploit attempt.',
    mathematicalFormulation: 'p \\in [0.0, 1.0] \\text{ or } 0\\% - 100\\%',
    units: 'Probability / Percentage',
    exampleOrContext: 'Influenced by the threat agent\'s perceived payoff, asset value, likelihood of attribution/punishment, and required effort.',
    relatedTerms: ['CF', 'TEF']
  },
  {
    id: 'vuln',
    shortForm: 'Vuln / V',
    fullName: 'Vulnerability',
    category: 'Core Taxonomy',
    definition: 'The probability that a threat event results in a loss event. In Open FAIR, vulnerability is the conditional probability that Threat Capability (TC) exceeds Control Resistance Strength (RS).',
    mathematicalFormulation: '\\text{Vulnerability} = P(\\text{TC} > \\text{RS}) \\in [0.0, 1.0]',
    units: 'Conditional Probability (0.0 to 1.0)',
    exampleOrContext: 'If an adversary brings 80th-percentile offensive capabilities against a 50th-percentile resistance control, TC > RS holds true, leading to control failure.',
    relatedTerms: ['TC', 'RS', 'LEF']
  },
  {
    id: 'tc',
    shortForm: 'TC',
    fullName: 'Threat Capability',
    category: 'Core Taxonomy',
    definition: 'The level of force, technical skill, customized tooling, time, and financial resources a threat agent can bring to bear against a target asset.',
    mathematicalFormulation: '\\text{Percentile Scale } [0, 100] \\text{ (Relative to overall threat population)}',
    units: 'Percentile (0 to 100)',
    exampleOrContext: 'Nation-state APTs typically sit at TC 90-99, organized cybercrime cartels at TC 70-85, and script kiddies at TC 10-35.',
    relatedTerms: ['RS', 'Vuln']
  },
  {
    id: 'rs',
    shortForm: 'RS',
    fullName: 'Resistance Strength',
    category: 'Core Taxonomy',
    definition: 'The cumulative effectiveness, hardening, configuration rigor, and robustness of defensive controls protecting an asset against malicious actions.',
    mathematicalFormulation: '\\text{Percentile Scale } [0, 100] \\text{ (Capability needed to bypass)}',
    units: 'Percentile (0 to 100)',
    exampleOrContext: 'Basic password auth might be RS 25, Hardware MFA with strict segmentation can raise RS to 85-95.',
    relatedTerms: ['TC', 'Vuln']
  },
  {
    id: 'lm',
    shortForm: 'LM',
    fullName: 'Loss Magnitude',
    category: 'Core Taxonomy',
    definition: 'The total monetary loss resulting from a single loss event, combining all primary direct impacts and secondary stakeholder consequences.',
    mathematicalFormulation: '\\text{LM} = \\text{PLM} + \\text{SLM}',
    units: 'Currency / Loss Event',
    exampleOrContext: 'A ransomware event causes $1.5M in direct incident response/downtime (PLM) and $4M in regulatory fines/customer churn (SLM), total LM = $5.5M.',
    relatedTerms: ['PLM', 'SLM', 'ALE']
  },
  {
    id: 'plm',
    shortForm: 'PLM',
    fullName: 'Primary Loss Magnitude',
    category: 'Core Taxonomy',
    definition: 'Direct financial costs incurred immediately by the asset owner as a direct result of the security compromise.',
    mathematicalFormulation: '\\text{PLM} = \\text{Productivity Loss} + \\text{Response Cost} + \\text{Replacement Cost}',
    units: 'Currency / Loss Event',
    exampleOrContext: 'Includes system offline revenue downtime, digital forensics retainer costs, incident response contractor fees, and hardware re-imaging.',
    relatedTerms: ['SLM', 'LM']
  },
  {
    id: 'slm',
    shortForm: 'SLM',
    fullName: 'Secondary Loss Magnitude',
    category: 'Core Taxonomy',
    definition: 'Indirect, downstream financial impacts inflicted by external secondary stakeholders (regulators, customers, partners, credit card brands) following an event.',
    mathematicalFormulation: '\\text{SLM} = \\text{Fines/Penalties} + \\text{Judgments/Settlements} + \\text{Reputation Loss} + \\text{Competitive Advantage Loss}',
    units: 'Currency / Loss Event',
    exampleOrContext: 'GDPR/CCPA privacy fines, class-action lawsuit payouts, customer subscription churn, and credit monitoring expenses.',
    relatedTerms: ['SLEF', 'PLM', 'LM']
  },
  {
    id: 'slef',
    shortForm: 'SLEF',
    fullName: 'Secondary Loss Event Frequency',
    category: 'Core Taxonomy',
    definition: 'The probability (0% to 100%) that a primary loss event will trigger secondary stakeholder reactions (e.g., regulatory audits, public disclosures, lawsuits).',
    mathematicalFormulation: 'p \\in [0.0, 1.0] \\text{ or } 0\\% - 100\\%',
    units: 'Percentage / Conditional Probability',
    exampleOrContext: 'A minor internal phishing test has SLEF ~ 0%, whereas a massive unencrypted PII database leak has SLEF ~ 90-95% for triggering regulatory investigations.',
    relatedTerms: ['SLM', 'LM']
  },

  // 2. Risk Ratings & Appetite
  {
    id: 'rating-vl',
    shortForm: 'VL',
    fullName: 'Very Low Risk',
    category: 'Risk Ratings',
    definition: 'Simulated Value-at-Risk (P90) is strictly below the organization\'s minimum threshold. The scenario is well within risk appetite and presents negligible exposure.',
    mathematicalFormulation: '\\text{Loss}_{P90} \\le \\text{Threshold}_{\\text{veryLowMax}}',
    units: 'Tier 1 / 6 Rating',
    tierColor: '#16a34a',
    tierBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    exampleOrContext: 'Example: Annualized 90th percentile loss < $250,000 against a $500,000 threshold.',
    relatedTerms: ['L', 'M', 'SG', 'H', 'SV']
  },
  {
    id: 'rating-l',
    shortForm: 'L',
    fullName: 'Low Risk',
    category: 'Risk Ratings',
    definition: 'Value at Risk sits between the Very Low and Low thresholds. Acceptable operational risk that standard baseline procedures can manage.',
    mathematicalFormulation: '\\text{Threshold}_{\\text{veryLowMax}} < \\text{Loss}_{P90} \\le \\text{Threshold}_{\\text{lowMax}}',
    units: 'Tier 2 / 6 Rating',
    tierColor: '#84cc16',
    tierBg: 'bg-lime-500/20 text-lime-400 border-lime-500/40',
    exampleOrContext: 'Standard low-level perimeter scans with robust automated blocking.',
    relatedTerms: ['VL', 'M', 'SG', 'H', 'SV']
  },
  {
    id: 'rating-m',
    shortForm: 'M',
    fullName: 'Moderate Risk',
    category: 'Risk Ratings',
    definition: 'Value at Risk sits between Low and Moderate thresholds. Normal business risk that warrants periodic review and ongoing control maintenance.',
    mathematicalFormulation: '\\text{Threshold}_{\\text{lowMax}} < \\text{Loss}_{P90} \\le \\text{Threshold}_{\\text{moderateMax}}',
    units: 'Tier 3 / 6 Rating',
    tierColor: '#eab308',
    tierBg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    exampleOrContext: 'Internal workstation malware infections without privilege escalation.',
    relatedTerms: ['VL', 'L', 'SG', 'H', 'SV']
  },
  {
    id: 'rating-sg',
    shortForm: 'SG',
    fullName: 'Significant Risk',
    category: 'Risk Ratings',
    definition: 'Value at Risk exceeds normal tolerance bounds and approaches high executive visibility. Proactive mitigation planning is recommended.',
    mathematicalFormulation: '\\text{Threshold}_{\\text{moderateMax}} < \\text{Loss}_{P90} \\le \\text{Threshold}_{\\text{significantMax}}',
    units: 'Tier 4 / 6 Rating',
    tierColor: '#f97316',
    tierBg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    exampleOrContext: 'E-commerce shopping cart skimming risk during peak holiday retail seasons.',
    relatedTerms: ['M', 'H', 'SV']
  },
  {
    id: 'rating-h',
    shortForm: 'H',
    fullName: 'High Risk',
    category: 'Risk Ratings',
    definition: 'Value at Risk is between the Significant and High tolerance boundaries. Material financial impact requiring immediate executive reporting and budgeted control treatment.',
    mathematicalFormulation: '\\text{Threshold}_{\\text{significantMax}} < \\text{Loss}_{P90} \\le \\text{Threshold}_{\\text{highMax}}',
    units: 'Tier 5 / 6 Rating',
    tierColor: '#ef4444',
    tierBg: 'bg-red-500/20 text-red-400 border-red-500/40',
    exampleOrContext: 'Unauthenticated prompt injection vulnerabilities in enterprise customer-facing agents.',
    relatedTerms: ['SG', 'SV']
  },
  {
    id: 'rating-sv',
    shortForm: 'SV',
    fullName: 'Severe Risk',
    category: 'Risk Ratings',
    definition: 'Value at Risk strictly exceeds the organization\'s Maximum Risk Tolerance threshold. Presents existential, insolvency, or catastrophic regulatory risk.',
    mathematicalFormulation: '\\text{Loss}_{P90} > \\text{Threshold}_{\\text{highMax}}',
    units: 'Tier 6 / 6 Rating',
    tierColor: '#991b1b',
    tierBg: 'bg-rose-950 text-rose-300 border-rose-600/50',
    exampleOrContext: 'Unmitigated SWIFT banking transaction interception or foundational AI model weights exfiltration.',
    relatedTerms: ['H', 'ALE', 'P90']
  },

  // 3. Statistical Distributions
  {
    id: 'dist-pert',
    shortForm: 'Beta-PERT',
    fullName: 'Modified Beta-PERT Distribution',
    category: 'Distributions',
    definition: 'A smooth probability distribution specifically designed for expert elicitation using Low, Mode (most likely), High, and Confidence weighting parameters.',
    mathematicalFormulation: '\\mu = \\frac{L + \\gamma M + H}{\\gamma + 2}, \\quad \\alpha = \\left(\\frac{\\mu - L}{H - L}\\right) \\cdot \\left[\\frac{(H - \\mu)(\\mu - L)}{\\sigma^2} - 1\\right]',
    units: 'Continuous Probability Distribution',
    exampleOrContext: 'Used across all Open FAIR parameters (CF, PoA, TC, RS, PLM, SLM) to avoid unrealistic step functions while respecting expert uncertainty.',
    relatedTerms: ['Poisson', 'Binomial']
  },
  {
    id: 'dist-poisson',
    shortForm: 'Poisson',
    fullName: 'Poisson Distribution',
    category: 'Distributions',
    definition: 'Models the discrete count of events occurring randomly and independently in a fixed interval with a known average rate $\\lambda = \\text{LEF}$.',
    mathematicalFormulation: 'P(k \\text{ events}) = \\frac{\\lambda^k e^{-\\lambda}}{k!}, \\quad \\lambda = \\text{LEF}',
    units: 'Discrete Probability Distribution (k = 0, 1, 2, ...)',
    exampleOrContext: 'If LEF = 0.4 events/year, Poisson generates 0 events in ~67% of simulated years, 1 event in ~27%, and 2+ events in ~6%.',
    relatedTerms: ['LEF', 'Binomial']
  },
  {
    id: 'dist-binomial',
    shortForm: 'Binomial',
    fullName: 'Binomial Distribution',
    category: 'Distributions',
    definition: 'Models the number of secondary loss events triggered out of $n$ primary loss events, each with independent probability $p = \\text{SLEF}$.',
    mathematicalFormulation: 'P(k \\text{ secondary}) = \\binom{n}{k} p^k (1 - p)^{n - k}',
    units: 'Discrete Distribution (k \\le n)',
    exampleOrContext: 'Given 3 primary breach events with a 60% regulatory inquiry rate (SLEF = 0.60), determines the exact count of secondary investigations in each trial.',
    relatedTerms: ['SLEF', 'SLM', 'Poisson']
  },

  // 4. Mathematical Cause & Simulation
  {
    id: 'math-sv-cause',
    shortForm: 'Math: SV Cause',
    fullName: 'Mathematical Cause of "SV" (Severe) Ratings',
    category: 'Mathematical Cause',
    definition: 'Why unmitigated scenarios evaluate to SV: When Threat Capability (TC ~80) exceeds current baseline controls (RS ~40), Vulnerability equals 1.0 (100% breach rate on contact). Multiplied by primary downtime and secondary fines, 90th percentile loss ($50M+) exceeds the organization\'s $15M tolerance ceiling, mathematically resulting in "Severe".',
    mathematicalFormulation: '\\text{TC} > \\text{RS} \\implies \\text{Vuln} = 1.0 \\implies \\text{ALE}_{P90} > \\text{Tolerance}_{\\text{highMax}} \\implies \\text{Rating} = \\text{SV}',
    units: 'Ontological Decision Flow',
    exampleOrContext: 'Applying proposed controls (e.g. RS 90, MFA, Hardware Enclaves) drops vulnerability to near zero, shifting the residual rating from SV down to VL.',
    relatedTerms: ['SV', 'RS', 'TC', 'Vuln', 'ALE']
  },
  {
    id: 'math-mc-loop',
    shortForm: 'MC Simulation',
    fullName: 'Monte Carlo Iteration Algorithm',
    category: 'Mathematical Cause',
    definition: 'The 10,000-trial simulation loop that samples parameters from Beta-PERT distributions, calculates vulnerability and loss event frequencies, draws discrete Poisson events, and tallies annualized financial impact.',
    mathematicalFormulation: '\\text{Trial Loss}_t = N_t \\cdot \\text{PLM}_t + \\text{SecN}_t \\cdot \\text{SLM}_t',
    units: '10,000 - 100,000 Trials / Scenario',
    exampleOrContext: 'Enables computing full empirical Loss Exceedance Curves and high-confidence Value-at-Risk estimates.',
    relatedTerms: ['Beta-PERT', 'Poisson', 'ALE', 'P90']
  },

  // 5. Financial & RoSI
  {
    id: 'arr',
    shortForm: 'ARR',
    fullName: 'Annual Risk Reduction',
    category: 'Financial & RoSI',
    definition: 'The expected reduction in annualized financial loss achieved by implementing a proposed security control or architecture.',
    mathematicalFormulation: '\\text{ARR} = \\text{ALE}_{\\text{Current}} - \\text{ALE}_{\\text{Proposed}}',
    units: 'Currency / Year (e.g., $ / Year)',
    exampleOrContext: 'If current expected loss is $5M/year and proposed controls lower it to $800k/year, ARR is $4.2M/year.',
    relatedTerms: ['ALE', 'RoSI', 'NPV', 'BCR']
  },
  {
    id: 'rosi',
    shortForm: 'RoSI',
    fullName: 'Return on Security Investment',
    category: 'Financial & RoSI',
    definition: 'Percentage return generated by a security initiative relative to its annualized cost (CapEx amortized + OpEx).',
    mathematicalFormulation: '\\text{RoSI} = \\frac{\\text{ARR} - \\text{Annual Control Cost}}{\\text{Annual Control Cost}} \\times 100\\%',
    units: 'Percentage (%)',
    exampleOrContext: 'An ARR of $1,000,000 with annual tool cost of $200,000 yields RoSI = (($1M - $200k) / $200k) * 100% = 400%.',
    relatedTerms: ['ARR', 'NPV', 'BCR']
  },
  {
    id: 'npv',
    shortForm: 'NPV',
    fullName: 'Net Present Value',
    category: 'Financial & RoSI',
    definition: 'The discounted cash-flow valuation of multi-year risk reduction benefits minus initial capital expenditures (CapEx) and annual maintenance costs.',
    mathematicalFormulation: '\\text{NPV} = \\sum_{t=1}^T \\frac{\\text{ARR}_t - \\text{OpEx}_t}{(1 + r)^t} - \\text{CapEx}_0',
    units: 'Discounted Currency',
    exampleOrContext: 'A 3-year security initiative with positive NPV indicates capital is better invested here than standard hurdle rate benchmarks.',
    relatedTerms: ['RoSI', 'BCR', 'ARR']
  },
  {
    id: 'bcr',
    shortForm: 'BCR',
    fullName: 'Benefit-Cost Ratio',
    category: 'Financial & RoSI',
    definition: 'The ratio of total expected risk dollars saved per dollar invested in security controls. Any value > 1.0 indicates a net positive economic payoff.',
    mathematicalFormulation: '\\text{BCR} = \\frac{\\text{ARR}}{\\text{Annual Control Cost}}',
    units: 'Dimensionless Ratio (x : 1)',
    exampleOrContext: 'BCR = 3.5x means every $1 invested in cybersecurity controls prevents $3.50 in expected loss.',
    relatedTerms: ['RoSI', 'ARR']
  },

  // 6. Statistical Summary Metrics
  {
    id: 'p10',
    shortForm: 'P10',
    fullName: '10th Percentile (Optimistic Year)',
    category: 'Statistical Metrics',
    definition: 'The dollar amount below which 10% of simulation outcomes fall. Represents a favorable, low-loss year.',
    mathematicalFormulation: 'P(\\text{Loss} \\le P_{10}) = 0.10',
    units: 'Currency',
    exampleOrContext: 'In 9 out of 10 years, annual losses will exceed P10.',
    relatedTerms: ['P50', 'P90', 'P95', 'P99']
  },
  {
    id: 'p50',
    shortForm: 'P50',
    fullName: '50th Percentile (Median Loss)',
    category: 'Statistical Metrics',
    definition: 'The median annual loss outcome. Exactly half of all simulated years suffer less loss, and half suffer more.',
    mathematicalFormulation: 'P(\\text{Loss} \\le P_{50}) = 0.50',
    units: 'Currency',
    exampleOrContext: 'More robust against extreme skewness and fat-tailed outliers than the arithmetic mean.',
    relatedTerms: ['P10', 'P90', 'Mean']
  },
  {
    id: 'p90',
    shortForm: 'P90',
    fullName: '90th Percentile (Value at Risk / VaR)',
    category: 'Statistical Metrics',
    definition: 'The standard Open FAIR Value-at-Risk metric. 90% of simulated years experience losses at or below this amount; only 1 in 10 years exceeds it.',
    mathematicalFormulation: 'P(\\text{Loss} \\le P_{90}) = 0.90',
    units: 'Currency (Standard VaR)',
    exampleOrContext: 'The primary metric used by boards and cyber insurance underwriters to establish capital reserve requirements.',
    relatedTerms: ['P95', 'P99', 'ALE', 'LEC']
  },
  {
    id: 'p95',
    shortForm: 'P95',
    fullName: '95th Percentile (Conservative VaR)',
    category: 'Statistical Metrics',
    definition: 'A conservative Value-at-Risk metric representing a 1-in-20-year severe risk exposure.',
    mathematicalFormulation: 'P(\\text{Loss} \\le P_{95}) = 0.95',
    units: 'Currency',
    exampleOrContext: 'Recommended for heavily regulated banking and healthcare environments requiring higher capital buffers.',
    relatedTerms: ['P90', 'P99']
  },
  {
    id: 'p99',
    shortForm: 'P99',
    fullName: '99th Percentile (Tail Risk / Black Swan)',
    category: 'Statistical Metrics',
    definition: 'The extreme 1-in-100-year catastrophic loss outcome. Measures severe tail exposure and potential insolvency triggers.',
    mathematicalFormulation: 'P(\\text{Loss} \\le P_{99}) = 0.99',
    units: 'Currency (Tail Stress Metric)',
    exampleOrContext: 'Used for enterprise stress testing and catastrophic stop-loss reinsurance sizing.',
    relatedTerms: ['P90', 'P95', 'LEC']
  },
  {
    id: 'lec',
    shortForm: 'LEC',
    fullName: 'Loss Exceedance Curve',
    category: 'Statistical Metrics',
    definition: 'The Complementary Cumulative Distribution Function (CCDF) graphing the probability of annual losses exceeding any specific dollar amount.',
    mathematicalFormulation: 'P(\\text{Annual Loss} \\ge X) = 1 - F(X)',
    units: 'Probability Curve vs Loss Magnitude',
    exampleOrContext: 'The visual cornerstone of FAIR quantitative risk reporting, directly demonstrating risk reduction shifts.',
    relatedTerms: ['ALE', 'P90', 'P95']
  },
  {
    id: 'iqr',
    shortForm: 'IQR',
    fullName: 'Interquartile Range',
    category: 'Statistical Metrics',
    definition: 'The difference between the 75th and 25th percentiles ($P_{75} - P_{25}$), measuring the spread of the middle 50% of simulation outcomes.',
    mathematicalFormulation: '\\text{IQR} = P_{75} - P_{25}',
    units: 'Currency',
    exampleOrContext: 'Quantifies scenario uncertainty independent of extreme tail outliers.',
    relatedTerms: ['SEM', 'P50']
  },
  {
    id: 'sem',
    shortForm: 'SEM',
    fullName: 'Standard Error of the Mean',
    category: 'Statistical Metrics',
    definition: 'Quantifies the statistical precision and convergence accuracy of the Monte Carlo simulation trials.',
    mathematicalFormulation: '\\text{SEM} = \\frac{\\sigma}{\\sqrt{N_{\\text{trials}}}}',
    units: 'Currency',
    exampleOrContext: 'With 10,000 trials, SEM is reduced by a factor of 100 relative to standard deviation $\\sigma$, ensuring rock-solid numerical stability.',
    relatedTerms: ['Beta-PERT', 'MC Simulation']
  },
  {
    id: 'tornado_swing',
    shortForm: 'Tornado Swing / ΔALE',
    fullName: 'Tornado Impact Swing (P10 to P90)',
    category: 'Statistical Metrics',
    definition: 'Measures the difference in expected ALE when an individual input parameter is varied from its 10th percentile (low state) to its 90th percentile (high state), while all other parameters are held at their expected values.',
    mathematicalFormulation: '\\Delta \\text{ALE}_{i} = \\text{ALE}(x_{i, P90}) - \\text{ALE}(x_{i, P10})',
    units: 'Currency (Impact Delta)',
    exampleOrContext: 'A Contact Frequency swing of ±$3.2M indicates CF accounts for wide variance in final simulated loss outcomes.',
    relatedTerms: ['Variance Share', 'LEC', 'Elasticity', 'ALE']
  },
  {
    id: 'variance_decomposition',
    shortForm: 'Variance Share (% σ²)',
    fullName: 'Variance Contribution / Sobol Decomposition',
    category: 'Statistical Metrics',
    definition: 'The percentage of total annualized loss variance accounted for by a specific parameter, computed via Monte Carlo regression and first-order sensitivity indices.',
    mathematicalFormulation: '\\% \\text{Variance}_i = \\frac{\\text{Var}(E[\\text{ALE} | X_i])}{\\text{Var}(\\text{ALE})} \\times 100\\%',
    units: 'Percentage (%)',
    exampleOrContext: 'If Threat Capability accounts for 48% of variance and Primary Loss accounts for 32%, security hardening on TC will yield the greatest reduction in uncertainty.',
    relatedTerms: ['Tornado Swing', 'Tail Correlation', 'ALE']
  },
  {
    id: 'tail_correlation',
    shortForm: 'Tail Corr / r_tail',
    fullName: 'Tail Correlation with Extreme Loss (VaR P90+)',
    category: 'Statistical Metrics',
    definition: 'The correlation between an input parameter and the worst-case tail loss events (trials exceeding the 90th percentile Value at Risk). Identifies parameters that drive catastrophic black swan losses.',
    mathematicalFormulation: 'r_{\\text{tail}, i} = \\text{Corr}(X_i, \\text{ALE} \\mid \\text{ALE} \\ge P_{90})',
    units: 'Correlation Coefficient (-1.0 to +1.0)',
    exampleOrContext: 'Secondary Loss Magnitude often exhibits high tail correlation (e.g. +0.82), showing it dominates catastrophic annual outcomes.',
    relatedTerms: ['P90', 'P99', 'LEC', 'Variance Share']
  },
  {
    id: 'elasticity',
    shortForm: 'Elasticity (E)',
    fullName: 'Risk Parameter Elasticity',
    category: 'Statistical Metrics',
    definition: 'The normalized percentage change in expected ALE resulting from a 1% change in a specific input parameter.',
    mathematicalFormulation: 'E_i = \\frac{\\% \\Delta \\text{ALE}}{\\% \\Delta X_i} = \\frac{\\partial \\text{ALE}}{\\partial X_i} \\cdot \\frac{X_i}{\\text{ALE}}',
    units: 'Dimensionless Elasticity Ratio',
    exampleOrContext: 'An elasticity of 1.2 on Threat Event Frequency indicates a 10% reduction in attacks reduces overall ALE by 12%.',
    relatedTerms: ['ARR', 'Tornado Swing', 'ALE']
  },
  {
    id: 'prd',
    shortForm: 'PRD',
    fullName: 'Productivity Loss',
    category: 'Core Taxonomy',
    definition: 'Primary loss resulting from the inability of an organization to deliver its core services, products, or operational workflows due to asset disruption.',
    mathematicalFormulation: '\\text{Loss} = \\text{Downtime Hours} \\times \\text{Hourly Value} + \\text{Idle Staff Cost}',
    units: 'Currency / Event',
    exampleOrContext: 'Plant shutdown costing $250,000/hour during an ICS malware incident.',
    relatedTerms: ['PLM', 'RSP', 'RPL']
  },
  {
    id: 'rsp',
    shortForm: 'RSP',
    fullName: 'Response Cost',
    category: 'Core Taxonomy',
    definition: 'Direct expenses incurred while actively detecting, triaging, mitigating, and containing a loss event.',
    mathematicalFormulation: '\\text{Loss} = \\text{External DFIR Hours} + \\text{Overtime} + \\text{Crisis PR retainers}',
    units: 'Currency / Event',
    exampleOrContext: 'Engaging external forensic specialists and legal counsel following a ransomware event.',
    relatedTerms: ['PLM', 'PRD', 'RPL']
  },
  {
    id: 'rpl',
    shortForm: 'RPL',
    fullName: 'Replacement Cost',
    category: 'Core Taxonomy',
    definition: 'The capital expense required to repair, rebuild, or replace damaged physical or digital assets.',
    mathematicalFormulation: '\\text{Loss} = \\text{Hardware Cost} + \\text{Data Restoration} + \\text{Reconfiguration}',
    units: 'Currency / Event',
    exampleOrContext: 'Procuring new sanitized server nodes following permanent firmware compromise.',
    relatedTerms: ['PLM', 'PRD', 'RSP']
  },
  {
    id: 'fin',
    shortForm: 'FIN / REG',
    fullName: 'Fines & Regulatory Penalties',
    category: 'Core Taxonomy',
    definition: 'Secondary losses levied by government agencies, industry regulators (e.g. GDPR, HIPAA, PCI-DSS, SEC), or judiciary bodies for compliance failure.',
    mathematicalFormulation: '\\text{Statutory Penalty Schedule} \\times \\text{Record Count / Turnover %}',
    units: 'Currency / Event',
    exampleOrContext: 'GDPR Article 83 fine up to 4% of annual global turnover or €20M.',
    relatedTerms: ['SLM', 'CMP', 'REP']
  },
  {
    id: 'cmp',
    shortForm: 'CMP',
    fullName: 'Competitive Advantage Loss',
    category: 'Core Taxonomy',
    definition: 'Secondary economic harm caused by theft of trade secrets, intellectual property, unreleased roadmaps, or bidding strategies.',
    mathematicalFormulation: '\\text{Discounted Future Cash Flow Loss from Market Exclusivity Erosion}',
    units: 'Currency / Event',
    exampleOrContext: 'Exfiltration of semiconductor lithography designs resulting in competitor market entry 2 years early.',
    relatedTerms: ['SLM', 'REP', 'FIN / REG']
  },
  {
    id: 'rep',
    shortForm: 'REP',
    fullName: 'Reputation Loss & Churn',
    category: 'Core Taxonomy',
    definition: 'Secondary loss caused by customer attrition, stock price multiple compression, and increased cost of capital following public breach disclosure.',
    mathematicalFormulation: '\\text{Increased Churn Rate (Δ%)} \\times \\text{Customer Lifetime Value (LTV)}',
    units: 'Currency / Event',
    exampleOrContext: '3% customer account cancellation within 6 months of a high-profile customer data leak.',
    relatedTerms: ['SLM', 'CMP', 'FIN / REG']
  }
];
