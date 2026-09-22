import { LocalAiEndpointConfig, FairScenario, SimulationResult } from '../types/fair';
import { formatAmount } from '../utils/distributions';

export interface AiPromptRequest {
  type: 'debias_calibration' | 'bias_audit' | 'scenario_decomposition' | 'executive_summary' | 'control_evaluation' | 'custom_chat';
  scenario: FairScenario;
  simResult?: SimulationResult;
  userCustomPrompt?: string;
}

export interface AiResponseResult {
  text: string;
  source: 'local_endpoint' | 'gemini_cloud' | 'heuristic_engine';
  modelUsed: string;
  latencyMs: number;
}

export const DEFAULT_AI_CONFIG: LocalAiEndpointConfig = {
  endpoint: 'http://localhost:11434/v1', // Ollama default OpenAI-compatible endpoint
  model: 'llama3.2',
  apiKey: '',
  mode: 'local_endpoint',
  temperature: 0.2,
  maxTokens: 1500,
  isConnected: false,
  latencyMs: 0,
  availableModels: ['llama3.2', 'llama3', 'mistral', 'qwen2.5', 'deepseek-r1', 'phi3', 'gemma2']
};

/**
 * Ping Local AI Endpoint
 */
export async function pingLocalAiEndpoint(endpointUrl: string): Promise<{
  online: boolean;
  models: string[];
  latencyMs: number;
  error?: string;
}> {
  const startTime = performance.now();
  try {
    const res = await fetch('/api/ai/ping-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: endpointUrl })
    });
    const data = await res.json();
    return {
      online: data.online === true,
      models: data.models || [],
      latencyMs: data.latencyMs || Math.round(performance.now() - startTime),
      error: data.error
    };
  } catch (err: any) {
    return {
      online: false,
      models: [],
      latencyMs: 0,
      error: err.message || 'Failed to connect to local server proxy'
    };
  }
}

/**
 * Air-gapped Rule-Based Expert FAIR Heuristic Engine
 * Works 100% locally with zero internet / zero external server dependencies
 */
export function generateHeuristicFairAnalysis(
  req: AiPromptRequest
): string {
  const s = req.scenario;
  const res = req.simResult;
  const curr = s.current;

  if (req.type === 'bias_audit') {
    const optimismFlags: string[] = [];
    const pessimismFlags: string[] = [];
    const skewFlags: string[] = [];
    const calibratedAdjustments: string[] = [];

    // 1. Analyze Threat Event Frequency (TEF) & Contact Frequency
    const tefLow = curr.lef.useDirectTef ? curr.lef.directTef.low : curr.lef.contactFrequency.low * (curr.lef.probabilityOfAction.low || 1);
    const tefHigh = curr.lef.useDirectTef ? curr.lef.directTef.high : curr.lef.contactFrequency.high * (curr.lef.probabilityOfAction.high || 1);
    const tefMode = curr.lef.useDirectTef ? curr.lef.directTef.mode : curr.lef.contactFrequency.mode * (curr.lef.probabilityOfAction.mode || 1);
    const tefRatio = tefHigh / Math.max(0.0001, tefLow);
    const tefSkew = (tefHigh - tefLow) > 0 ? (tefMode - tefLow) / (tefHigh - tefLow) : 0.5;

    // Check Threat Community profile
    const isHighActivityThreat = /cybercriminal|ransomware|prompt|botnet|fraud|apt|state|agentic/i.test(s.threatCommunity);
    const isCriticalAsset = /critical|financial|ai|model|database|trading|pos|pii|ledger/i.test(s.asset + ' ' + s.category);

    // TEF Optimism checks
    if (tefMode < 1.0 && isHighActivityThreat && isCriticalAsset) {
      optimismFlags.push(`🎯 **Threat Event Frequency Under-Estimation (Optimism Bias)**: TEF Mode is set to only ${tefMode.toFixed(2)} events/year for **${s.threatCommunity}** targeting **${s.asset}**. Industry baseline telemetry (Verizon DBIR / Cyentia IRIS) shows automated scanning and targeted reconnaissance occur at significantly higher annual frequencies (typically 5–35 attempts/year).`);
      calibratedAdjustments.push(`- **Threat Frequency (TEF)**: Increase baseline Mode from ${tefMode.toFixed(2)} to **${Math.max(3.5, tefMode * 3).toFixed(1)}/yr** with a 90% CI of [${Math.max(0.5, tefLow * 2).toFixed(1)}, ${Math.max(15, tefHigh * 2.5).toFixed(1)}].`);
    } else if (tefLow <= 0.05 && isHighActivityThreat) {
      optimismFlags.push(`🎯 **Zero-Risk Optimism in Min TEF**: TEF Minimum bound (${tefLow}/yr) assumes multi-year dormancy against active threat groups.`);
    }

    // TEF Probability of Action (PoA) check
    if (!curr.lef.useDirectTef && curr.lef.probabilityOfAction.mode < 0.35 && isHighActivityThreat) {
      optimismFlags.push(`🎯 **Suppressed Probability of Action (PoA)**: PoA Mode is ${(curr.lef.probabilityOfAction.mode * 100).toFixed(0)}%. Highly motivated adversaries act upon finding exposed assets with >60% probability.`);
    }

    // TEF Pessimism checks
    if (tefMode > 150) {
      pessimismFlags.push(`📉 **Threat Event Frequency Over-Inflation (Pessimism / Catastrophizing)**: TEF Mode is set to ${tefMode.toFixed(1)} events/year. This likely conflates routine automated port probes/firewall drops with genuine targeted attack actions.`);
      calibratedAdjustments.push(`- **Threat Frequency (TEF)**: Filter out automated scanning noise. Calibrate TEF to actual weaponized contact events (recommended Mode: **${Math.min(45, tefMode * 0.2).toFixed(1)}/yr**).`);
    } else if (tefRatio > 500) {
      pessimismFlags.push(`📉 **Excessive TEF Tail Spread**: Max-to-Min ratio is ${(tefRatio).toFixed(0)}x ([${tefLow}, ${tefHigh}]). Uncalibrated extremes blow out the 95th percentile Annual Loss Exposure.`);
    }

    // False precision check
    if (tefRatio < 2.2) {
      skewFlags.push(`📏 **False Precision / Overconfidence in TEF**: The ratio between Max (${tefHigh}) and Min (${tefLow}) is only ${(tefRatio).toFixed(1)}x. A genuine 90% confidence interval under high uncertainty should span at least 3x to 10x.`);
    }

    // TEF Skew check
    if (tefSkew < 0.12) {
      skewFlags.push(`📐 **Extreme Left-Pinned TEF Mode**: Mode (${tefMode}) is pinned against the absolute minimum (${tefLow}), creating an artificially sharp drop with an unanchored right tail.`);
    } else if (tefSkew > 0.88) {
      skewFlags.push(`📐 **Extreme Right-Pinned TEF Mode**: Mode (${tefMode}) is pinned against the maximum (${tefHigh}), representing a worst-case anchoring bias.`);
    }

    // 2. Analyze Vulnerability & Control Resistance (TC vs RS)
    if (!curr.lef.useDirectVuln) {
      const tcMode = curr.lef.threatCapability.mode;
      const rsMode = curr.lef.resistanceStrength.mode;
      const tcSpan = curr.lef.threatCapability.high - curr.lef.threatCapability.low;
      const rsSpan = curr.lef.resistanceStrength.high - curr.lef.resistanceStrength.low;

      if (rsMode >= 85 && tcMode >= 75) {
        optimismFlags.push(`🛡️ **Over-Optimistic Control Resistance (RS)**: Baseline Resistance Strength is estimated at ${rsMode}th percentile against an Elite/High Threat Capability (${tcMode}th percentile). Unless zero-trust MFA, hardware isolation, and daily red-team validation are proven, baseline controls typically degrade to 40–60th percentile over time.`);
        calibratedAdjustments.push(`- **Resistance Strength (RS)**: Lower current baseline Mode from ${rsMode} to **${Math.max(45, rsMode - 25)}** to reflect configuration drift and untested edge cases.`);
      }

      if (rsMode <= 20 && rsSpan <= 10) {
        pessimismFlags.push(`🛡️ **Undervalued Control Defenses**: Resistance Strength Mode is only ${rsMode}/100 with a narrow uncertainty span (${rsSpan} pts), effectively assuming security controls provide almost zero defensive friction.`);
      }

      if (rsSpan < 15) {
        skewFlags.push(`📏 **Control Strength False Certainty**: Resistance strength span (${rsSpan} pts) is too narrow. Control efficacy varies across asset segments and shift rotations.`);
      }
    } else {
      const vulnMode = curr.lef.directVuln.mode;
      if (vulnMode < 0.08 && isCriticalAsset) {
        optimismFlags.push(`🛡️ **Direct Vulnerability Optimism**: Vulnerability probability is set to only ${(vulnMode * 100).toFixed(1)}%. Real-world exploit success rates for targeted campaigns typically range from 20% to 55%.`);
      }
      if (vulnMode > 0.90) {
        pessimismFlags.push(`🛡️ **Direct Vulnerability Fatalism**: Direct vulnerability is estimated at ${(vulnMode * 100).toFixed(0)}%, assuming all incoming attacks will effortlessly compromise the asset.`);
      }
    }

    // 3. Analyze Loss Magnitude Assumptions
    const pl = curr.primaryLoss;
    const sl = curr.secondaryLoss;
    const totalPrimaryMode = (pl.productivity.enabled !== false ? pl.productivity.mode : 0) +
      (pl.response.enabled !== false ? pl.response.mode : 0) +
      (pl.replacement.enabled !== false ? pl.replacement.mode : 0) +
      (pl.finesAndJudgements.enabled !== false ? pl.finesAndJudgements.mode : 0) +
      (pl.reputation.enabled !== false ? pl.reputation.mode : 0);

    if (pl.response.mode === 0 || pl.response.enabled === false) {
      optimismFlags.push(`💰 **Omitted Incident Response Costs**: Direct Incident Response (forensics, legal counsel, IR retainers) is zeroed out. Every major incident incurs immediate triaging overhead.`);
    }

    if (isCriticalAsset && totalPrimaryMode < 50) {
      optimismFlags.push(`💰 **Loss Magnitude Under-Estimation**: Total Primary Loss Mode is only ${s.currency}${totalPrimaryMode}k for a mission-critical asset. Operational recovery, vendor engagement, and employee distraction usually exceed this.`);
    }

    if (sl.finesAndJudgements.mode > 50000) {
      pessimismFlags.push(`💰 **Hyper-Pessimistic Regulatory Fines**: Secondary fines/litigation mode (${s.currency}${sl.finesAndJudgements.mode}k) represents an extreme upper ceiling rather than an expected most-likely outcome.`);
    }

    // Calculate Overall Bias Index (-100 Extreme Pessimism, +100 Extreme Optimism)
    const optimismScore = optimismFlags.length * 28;
    const pessimismScore = pessimismFlags.length * 28;
    const netBiasScore = Math.min(100, Math.max(-100, optimismScore - pessimismScore));
    let biasVerdict = 'Balanced / Well-Calibrated Baseline';
    if (netBiasScore >= 35) {
      biasVerdict = 'High Optimism Bias (Under-estimating Threat Frequency / Risk Exposure)';
    } else if (netBiasScore <= -35) {
      biasVerdict = 'High Pessimism Bias (Catastrophizing Frequency & Tail Losses)';
    } else if (optimismFlags.length > 0 || pessimismFlags.length > 0) {
      biasVerdict = 'Mild Parameter Bias Detected (Specific Adjustments Recommended)';
    }

    return `### 🔍 Open FAIR Assumption & Bias Audit Report

**Scenario**: ${s.name}  
**Asset Category**: ${s.category || s.asset} | **Threat Actor**: ${s.threatCommunity}  
**Evaluator**: Local AI Assumption Auditing Engine (Air-Gapped Heuristics)  
**Overall Bias Posture**: **${biasVerdict}** (Net Bias Index: ${netBiasScore > 0 ? '+' + netBiasScore : netBiasScore}/100)

---

#### 1. 🎯 Threat Event Frequency (TEF) & Contact Audit
${optimismFlags.filter(f => f.includes('Threat Event') || f.includes('Probability of Action') || f.includes('Zero-Risk')).length > 0 
  ? optimismFlags.filter(f => f.includes('Threat Event') || f.includes('Probability of Action') || f.includes('Zero-Risk')).join('\n\n')
  : '✅ **Threat Frequency Baseline**: Threat contact frequency and action probability reflect realistic threat community activity.'}
${pessimismFlags.filter(f => f.includes('Threat Event') || f.includes('Tail Spread')).length > 0 
  ? '\n\n' + pessimismFlags.filter(f => f.includes('Threat Event') || f.includes('Tail Spread')).join('\n\n')
  : ''}

#### 2. 🛡️ Vulnerability & Control Resistance (TC vs RS) Audit
${optimismFlags.filter(f => f.includes('Control Resistance') || f.includes('Direct Vulnerability')).length > 0 
  ? optimismFlags.filter(f => f.includes('Control Resistance') || f.includes('Direct Vulnerability')).join('\n\n')
  : '✅ **Control Strength Baseline**: Resistance strength bounds align with documented defense-in-depth posture.'}
${pessimismFlags.filter(f => f.includes('Control Defenses') || f.includes('Vulnerability Fatalism')).length > 0 
  ? '\n\n' + pessimismFlags.filter(f => f.includes('Control Defenses') || f.includes('Vulnerability Fatalism')).join('\n\n')
  : ''}

#### 3. 💰 Loss Magnitude Assumptions Audit
${optimismFlags.filter(f => f.includes('Loss Magnitude') || f.includes('Incident Response')).length > 0 
  ? optimismFlags.filter(f => f.includes('Loss Magnitude') || f.includes('Incident Response')).join('\n\n')
  : '✅ **Loss Magnitude Bounds**: Primary productivity, response, and secondary impact ranges are proportional to asset valuation.'}
${pessimismFlags.filter(f => f.includes('Regulatory Fines')).length > 0 
  ? '\n\n' + pessimismFlags.filter(f => f.includes('Regulatory Fines')).join('\n\n')
  : ''}

#### 4. 📐 Distribution Shape & Beta-PERT Skewness Analysis
${skewFlags.length > 0 ? skewFlags.join('\n\n') : '✅ **Distribution Geometry**: Beta-PERT 90% confidence intervals and mode placements show proper dispersion without artificial mode pinning.'}

---

#### 5. 🔧 Calibrated Parameter Recommendations (Hubbard 5-Step Debiasing)
${calibratedAdjustments.length > 0 ? calibratedAdjustments.join('\n') : '- Current 3-point estimate distributions fall within acceptable Open FAIR empirical guidelines.'}
- **Reference Class Challenge**: Cross-check your Threat Event Frequency against public industry datasets (e.g. Advisen Cyber Loss Database, VERIS Community Database, Cyentia IRIS).
- **The Spin-Wheel Test**: Test whether you would be indifferent between a 90% probability lottery wheel vs. a bet that the true annual threat frequency falls inside your modeled [${tefLow.toFixed(1)}, ${tefHigh.toFixed(1)}] range.`;
  }

  if (req.type === 'debias_calibration') {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check TEF ratio
    const tefLow = curr.lef.useDirectTef ? curr.lef.directTef.low : curr.lef.contactFrequency.low * curr.lef.probabilityOfAction.low;
    const tefHigh = curr.lef.useDirectTef ? curr.lef.directTef.high : curr.lef.contactFrequency.high * curr.lef.probabilityOfAction.high;
    const tefMode = curr.lef.useDirectTef ? curr.lef.directTef.mode : curr.lef.contactFrequency.mode * curr.lef.probabilityOfAction.mode;

    if (tefHigh / Math.max(0.001, tefLow) < 2) {
      warnings.push(`⚠️ **Narrow TEF Range**: Threat Event Frequency ratio (Max/Min = ${(tefHigh / Math.max(0.001, tefLow)).toFixed(1)}x) is unusually narrow for a 90% confidence interval. Subject Matter Experts frequently exhibit overconfidence bias here.`);
      recommendations.push(`- Expand TEF Min to account for dormant periods and Max for concentrated campaign bursts.`);
    }

    // Check TC vs RS
    if (!curr.lef.useDirectVuln) {
      const tc = curr.lef.threatCapability;
      const rs = curr.lef.resistanceStrength;
      if (tc.mode > rs.mode) {
        warnings.push(`🚨 **Adverse Capability Gap**: Threat Capability Mode (${tc.mode}th percentile) exceeds Control Resistance Strength Mode (${rs.mode}th percentile). Vulnerability probability is expected to exceed 50%.`);
      }
      if (rs.high - rs.low < 15) {
        warnings.push(`⚠️ **Control Strength Uncertainty**: Resistance strength range is only ${(rs.high - rs.low)} points wide. Verify if controls have been empirically tested or penetration tested.`);
      }
    }

    // Check Primary Loss Spans
    const prod = curr.primaryLoss.productivity;
    if (prod.high / Math.max(1, prod.low) > 100) {
      recommendations.push(`- Productivity Loss spans over 2 orders of magnitude ($${prod.low} to $${prod.high}). Consider decomposing into hourly employee outage rate × affected FTEs.`);
    }

    // Secondary loss check
    const slef = curr.secondaryLossEventFreq;
    if (slef.mode > 50) {
      warnings.push(`ℹ️ **High Secondary Probability**: SLEF is estimated at ${slef.mode}%. Secondary stakeholders (regulators, customers, class actions) are anticipated to react in the majority of incidents.`);
    }

    return `### 🧠 Open FAIR Calibration & Debiasing Assessment

**Scenario**: ${s.name} (${s.asset} vs ${s.threatCommunity})
**Evaluator**: Local Air-Gapped Heuristic Calibration Engine

#### 1. Confidence Interval & Bias Analysis
${warnings.length > 0 ? warnings.join('\n\n') : '✅ **Parameter Dispersion**: Estimated 90% confidence intervals demonstrate adequate dispersion across threat and loss dimensions.'}

#### 2. Calibration Recommendations (Hubbard 5-Step Debiasing)
${recommendations.length > 0 ? recommendations.join('\n') : '- Confidence bounds meet Open FAIR standard criteria (10th to 90th percentile bounds).'}
- **Equivalent Bet Test**: Would you take a 90% chance spin wheel vs a bet that the true annual loss falls strictly within your [$${curr.primaryLoss.productivity.low}, $${curr.primaryLoss.productivity.high}] productivity loss bounds?
- **Anchor Debiasing**: Ensure most-likely mode values were not anchored to historical single-incident best cases.

#### 3. Control Effectiveness Feedback
- **Resistance Strength (RS)**: Current baseline mode ${curr.lef.resistanceStrength.mode}/100.
${s.hasProposed ? `- **Proposed State**: Increases RS to ${s.proposed.lef.resistanceStrength.mode}/100 and lowers annual loss probability.` : '- Recommend modeling a Proposed State branch with MFA, EDR, and offline immutable backups.'}`;
  }

  if (req.type === 'executive_summary' && res) {
    const curStats = res.currentStats;
    const propStats = res.proposedStats;

    return `### 📊 Open FAIR Executive Quantitative Risk Summary

**Asset at Risk**: ${s.asset}  
**Threat Community**: ${s.threatCommunity} (${s.threatEffect} Impact)  
**Simulation Depth**: ${res.trialsCount.toLocaleString()} Monte Carlo Iterations  
**Current Risk Appetite Level**: **${res.currentRiskRating}** (Target: ${s.riskTolerance.targetPercentile}th percentile)

---

#### 1. Annualized Loss Exposure (ALE) Overview
- **Expected Average Loss (Mean ALE)**: **${formatAmount(curStats.mean, s.currency, s.unitScale)} / year**
- **Median Loss (50th percentile)**: ${formatAmount(curStats.p50, s.currency, s.unitScale)}
- **Value at Risk (90th percentile)**: **${formatAmount(curStats.p90, s.currency, s.unitScale)}**
- **Tail Risk (95th percentile)**: **${formatAmount(curStats.p95, s.currency, s.unitScale)}**
- **Maximum Catastrophic Bound**: ${formatAmount(curStats.max, s.currency, s.unitScale)}

#### 2. Loss Form Breakdown
- **Primary Loss Exposure**: ${formatAmount(res.currentPrimaryStats.mean, s.currency, s.unitScale)}/yr (Direct Response, Productivity, Replacement)
- **Secondary Loss Exposure**: ${formatAmount(res.currentSecondaryStats.mean, s.currency, s.unitScale)}/yr (Fines, Litigation, Brand Reputation)
- **Expected Operational Downtime (90th)**: ${res.currentDowntimeStats.p90.toFixed(1)} hours/year
- **Data Records Exposure (90th)**: ${res.currentDataLossStats.p90.toLocaleString()} records/year

${propStats ? `#### 3. Proposed Mitigation What-If & ROI
- **Residual Expected Loss**: **${formatAmount(propStats.mean, s.currency, s.unitScale)} / year**
- **Net Annual Risk Reduction**: **${formatAmount(res.riskReductionDollar || 0, s.currency, s.unitScale)}** (${res.riskReductionPct}% reduction)
- **Proposed Control Investment**: ${formatAmount(s.proposedControlCost || 0, s.currency, s.unitScale)} / year
- **Return on Security Investment (ROSI)**: **${res.returnOnControlInvestment !== undefined ? res.returnOnControlInvestment.toFixed(1) + '%' : 'Positive Value Generation'}**
- **Residual Risk Rating**: Shifted from **${res.currentRiskRating}** ➔ **${res.proposedRiskRating}**.` : ''}

---
*Generated by Open FAIR Air-Gapped Intelligence Engine.*`;
  }

  return `### 🛡️ Open FAIR Scenario Advisor

**Scenario**: ${s.name}
**Asset**: ${s.asset} | **Threat Community**: ${s.threatCommunity}

The Open FAIR ontology decomposes risk into Loss Event Frequency (LEF) and Loss Magnitude (LM).
- **Current Loss Event Frequency**: ~${res ? res.currentLefStats.mean.toFixed(2) : curr.lef.directLef.mode} events/year.
- **Vulnerability**: Determined by whether Threat Capability (${curr.lef.threatCapability.mode}) exceeds Resistance Strength (${curr.lef.resistanceStrength.mode}).
- **Recommendation**: To lower total Annualized Loss Exposure, focus on reducing Threat Event Frequency (attack surface reduction) or increasing Resistance Strength via layered zero-trust controls.`;
}

/**
 * Execute AI Request via Local Endpoint, Gemini Cloud Proxy, or Heuristic Engine
 */
export async function executeFairAiAnalysis(
  config: LocalAiEndpointConfig,
  req: AiPromptRequest
): Promise<AiResponseResult> {
  const startTime = performance.now();

  // 1. If mode is heuristic or endpoint is not reachable, use Air-gapped Heuristic Engine
  if (config.mode === 'heuristic_engine') {
    const text = generateHeuristicFairAnalysis(req);
    return {
      text,
      source: 'heuristic_engine',
      modelUsed: 'Local FAIR Expert Rules (Air-Gapped)',
      latencyMs: Math.round(performance.now() - startTime)
    };
  }

  // 2. Format Prompt for LLM
  const s = req.scenario;
  const res = req.simResult;

  const scenarioContext = `
FAIR Risk Scenario: "${s.name}"
Asset: ${s.asset}
Threat Community: ${s.threatCommunity} (${s.threatEffect})
Currency: ${s.currency}
Unit Scale: ${s.unitLabel}

Current Baseline Parameters:
- Direct LEF: [Min: ${s.current.lef.directLef.low}, Mode: ${s.current.lef.directLef.mode}, Max: ${s.current.lef.directLef.high}]
- Threat Capability: [Min: ${s.current.lef.threatCapability.low}, Mode: ${s.current.lef.threatCapability.mode}, Max: ${s.current.lef.threatCapability.high}]
- Resistance Strength: [Min: ${s.current.lef.resistanceStrength.low}, Mode: ${s.current.lef.resistanceStrength.mode}, Max: ${s.current.lef.resistanceStrength.high}]
- Primary Loss Productivity: [Min: ${s.current.primaryLoss.productivity.low}, Mode: ${s.current.primaryLoss.productivity.mode}, Max: ${s.current.primaryLoss.productivity.high}]
- Primary Loss Response: [Min: ${s.current.primaryLoss.response.low}, Mode: ${s.current.primaryLoss.response.mode}, Max: ${s.current.primaryLoss.response.high}]
- Secondary Loss Fines & Reputation: [Min: ${s.current.secondaryLoss.finesAndJudgements.low + s.current.secondaryLoss.reputation.low}, Mode: ${s.current.secondaryLoss.finesAndJudgements.mode + s.current.secondaryLoss.reputation.mode}, Max: ${s.current.secondaryLoss.finesAndJudgements.high + s.current.secondaryLoss.reputation.high}]
- Secondary Event Probability (SLEF): ${s.current.secondaryLossEventFreq.mode}%

${res ? `Simulation Results (from ${res.trialsCount.toLocaleString()} trials):
- Mean ALE: ${s.currency}${res.currentStats.mean.toFixed(1)}
- 90th Percentile (VaR90): ${s.currency}${res.currentStats.p90.toFixed(1)}
- 95th Percentile (VaR95): ${s.currency}${res.currentStats.p95.toFixed(1)}
- Risk Rating: ${res.currentRiskRating}
${res.proposedStats ? `- Proposed Mean ALE: ${s.currency}${res.proposedStats.mean.toFixed(1)} (${res.riskReductionPct}% reduction)` : ''}
` : ''}
`;

  let promptInstruction = '';
  if (req.type === 'bias_audit') {
    promptInstruction = `Audit the current Open FAIR scenario's assumptions for cognitive and estimation bias.
Specifically examine the Threat Event Frequency (TEF), Contact Frequency, Probability of Action, Threat Capability vs Resistance Strength (Vulnerability), and Loss Magnitude distributions.
Identify and highlight:
1. Overly Optimistic Assumptions (e.g., artificially suppressed threat frequency, overly generous control resistance strength, or omitting realistic incident response/litigation costs).
2. Overly Pessimistic / Catastrophizing Assumptions (e.g., conflating automated scan noise with weaponized attack frequency, pinning modes to maximums, or excessive tail inflation).
3. False Precision & Distribution Skew (overly narrow 90% confidence bounds, extreme mode placement).
4. Concrete Calibrated Parameter Recommendations (provide adjusted 3-point estimate numbers: Min, Mode, Max) grounded in empirical risk benchmarks (VERIS, Verizon DBIR, Cyentia IRIS).`;
  } else if (req.type === 'debias_calibration') {
    promptInstruction = `Perform an Open FAIR 90% Confidence Interval calibration review on the provided scenario parameters.
Analyze whether the estimated bounds (Min, Most Likely, Max) reflect overconfidence bias, anchoring, or unrealistic certainty.
Provide concrete recommendations to debias the estimates according to Hubbard's calibrated estimation methods.`;
  } else if (req.type === 'executive_summary') {
    promptInstruction = `Generate an executive board-level quantitative risk brief explaining the Annualized Loss Exposure (ALE), Value at Risk (VaR90 and VaR95), and the financial business impact of the threat. Use clear, objective risk management terminology.`;
  } else if (req.type === 'control_evaluation') {
    promptInstruction = `Evaluate the proposed controls against the Threat Community capability. Discuss Resistance Strength (RS) improvement, ROI, and residual risk.`;
  } else {
    promptInstruction = req.userCustomPrompt || 'Analyze this Open FAIR risk scenario and provide recommendations.';
  }

  const fullPrompt = `${promptInstruction}\n\nScenario Data:\n${scenarioContext}\n${req.userCustomPrompt ? `User Specific Query: ${req.userCustomPrompt}` : ''}`;

  // Try Local AI Proxy first
  if (config.mode === 'local_endpoint') {
    try {
      const urlObj = new URL(config.endpoint);
      const chatUrl = `${urlObj.protocol}//${urlObj.host}/v1/chat/completions`;

      const payload = {
        model: config.model || 'llama3.2',
        messages: [
          {
            role: 'system',
            content: 'You are an elite quantitative information risk analyst specializing in the Open FAIR standard (Factor Analysis of Information Risk, ISO/IEC 27005, NIST CSF). Provide concise, mathematically grounded insights.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: config.temperature || 0.2,
        max_tokens: config.maxTokens || 1200
      };

      const customHeaders: Record<string, string> = {};
      if (config.apiKey) {
        customHeaders['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const proxyRes = await fetch('/api/ai/local-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: chatUrl,
          payload,
          headers: customHeaders
        })
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        const text = data.choices?.[0]?.message?.content || data.response || JSON.stringify(data);
        return {
          text,
          source: 'local_endpoint',
          modelUsed: config.model,
          latencyMs: Math.round(performance.now() - startTime)
        };
      }
    } catch (localErr) {
      console.warn('Local AI endpoint call failed, falling back:', localErr);
    }
  }

  // Try Server-side Gemini fallback
  if (config.mode === 'gemini_cloud') {
    try {
      const geminiRes = await fetch('/api/ai/gemini-fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          systemInstruction: 'You are an elite Open FAIR Quantitative Risk Management expert.'
        })
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        return {
          text: data.text,
          source: 'gemini_cloud',
          modelUsed: 'gemini-2.5-flash',
          latencyMs: Math.round(performance.now() - startTime)
        };
      }
    } catch (geminiErr) {
      console.warn('Gemini cloud fallback failed, reverting to local heuristic:', geminiErr);
    }
  }

  // Safe fallback to local Heuristic Engine
  const heuristicText = generateHeuristicFairAnalysis(req);
  return {
    text: heuristicText,
    source: 'heuristic_engine',
    modelUsed: 'Local FAIR Expert Rules (Air-Gapped Fallback)',
    latencyMs: Math.round(performance.now() - startTime)
  };
}

export const executeAiPrompt = (req: AiPromptRequest, config: LocalAiEndpointConfig) =>
  executeFairAiAnalysis(config, req);

