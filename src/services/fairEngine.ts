import {
  FairScenario,
  FairModelBranch,
  SimulationResult,
  SimulationSamplePoint,
  LossExceedancePoint,
  VariableSensitivity,
  SensitivityAnalysisReport,
  SensitivityDomainBreakdown,
  BranchCalculationSummary,
  RiskToleranceScale
} from '../types/fair';
import {
  samplePert,
  samplePoisson,
  sampleBinomial,
  calculatePercentiles,
  generateHistogram,
  formatAmount,
  SeededRandom
} from '../utils/distributions';

/**
 * Determine Open FAIR Risk Rating based on custom or standard tolerance thresholds
 * Ratings: Very Low (VL), Low (L), Moderate (M), Significant (SG), High (H), Severe (SV)
 */
export function determineRiskRating(
  varLoss: number,
  scale: RiskToleranceScale
): 'VL' | 'L' | 'M' | 'SG' | 'H' | 'SV' {
  if (varLoss <= scale.veryLowMax) return 'VL';
  if (varLoss <= scale.lowMax) return 'L';
  if (varLoss <= scale.moderateMax) return 'M';
  if (varLoss <= scale.significantMax) return 'SG';
  if (varLoss <= scale.highMax) return 'H';
  return 'SV';
}

interface VariableSampleMeta {
  key: string;
  displayName: string;
  category: 'Frequency' | 'Vulnerability' | 'Primary Magnitude' | 'Secondary Magnitude' | 'Operational';
  domain: 'Frequency' | 'Magnitude' | 'Operational';
  description: string;
  samples: Float64Array;
  enabled: boolean;
  isAggregate?: boolean; // e.g. Total PLM or Total SLM
}

/**
 * Execute Open FAIR Quantitative Simulation for a given model branch
 */
function simulateBranch(
  branch: FairModelBranch,
  numTrials: number,
  random: SeededRandom,
  unitScale: number
): {
  totalAleSamples: Float64Array;
  primaryAleSamples: Float64Array;
  secondaryAleSamples: Float64Array;
  lefSamples: Float64Array;
  downtimeSamples: Float64Array;
  dataLossSamples: Float64Array;
  samplePoints: SimulationSamplePoint[];
  branchSummary: BranchCalculationSummary;
  variableMatrix: Record<string, VariableSampleMeta>;
} {
  const totalAle = new Float64Array(numTrials);
  const primaryAle = new Float64Array(numTrials);
  const secondaryAle = new Float64Array(numTrials);
  const lefSamples = new Float64Array(numTrials);
  const downtimeSamples = new Float64Array(numTrials);
  const dataLossSamples = new Float64Array(numTrials);

  // Keep track of input variates for sensitivity analysis
  const varTEF = new Float64Array(numTrials);
  const varCF = new Float64Array(numTrials);
  const varPoA = new Float64Array(numTrials);
  const varVuln = new Float64Array(numTrials);
  const varTC = new Float64Array(numTrials);
  const varRS = new Float64Array(numTrials);

  const varPLM = new Float64Array(numTrials);
  const varPLM_prod = new Float64Array(numTrials);
  const varPLM_resp = new Float64Array(numTrials);
  const varPLM_repl = new Float64Array(numTrials);
  const varPLM_fine = new Float64Array(numTrials);
  const varPLM_comp = new Float64Array(numTrials);
  const varPLM_repu = new Float64Array(numTrials);

  const varSLEF = new Float64Array(numTrials);
  const varSLM = new Float64Array(numTrials);
  const varSLM_prod = new Float64Array(numTrials);
  const varSLM_resp = new Float64Array(numTrials);
  const varSLM_repl = new Float64Array(numTrials);
  const varSLM_fine = new Float64Array(numTrials);
  const varSLM_comp = new Float64Array(numTrials);
  const varSLM_repu = new Float64Array(numTrials);

  const randFn = () => random.next();
  const sampleSubset: SimulationSamplePoint[] = [];
  const sampleSubstepInterval = Math.max(1, Math.floor(numTrials / 1000)); // Sample ~1000 points

  let sumLef = 0;
  let sumTef = 0;
  let sumVuln = 0;
  let sumPlm = 0;
  let sumSlm = 0;
  let sumSlef = 0;
  let sumPrimAle = 0;
  let sumSecAle = 0;
  let sumTotAle = 0;

  for (let t = 0; t < numTrials; t++) {
    // 1. Calculate Loss Event Frequency (LEF)
    let trialLef = 0;
    let trialTef = 0;
    let trialCf = 0;
    let trialPoa = 0;
    let trialVuln = 0;
    let trialTc = 0;
    let trialRs = 0;

    if (branch.lef.useDirectLef) {
      trialLef = samplePert(branch.lef.directLef, randFn);
      trialTef = trialLef;
      trialVuln = 1.0;
    } else {
      // Decomposed TEF
      if (branch.lef.useDirectTef) {
        trialTef = samplePert(branch.lef.directTef, randFn);
      } else {
        trialCf = samplePert(branch.lef.contactFrequency, randFn);
        trialPoa = samplePert(branch.lef.probabilityOfAction, randFn);
        trialTef = trialCf * trialPoa;
      }

      // Decomposed Vulnerability
      if (branch.lef.useDirectVuln) {
        trialVuln = samplePert(branch.lef.directVuln, randFn);
      } else {
        trialTc = samplePert(branch.lef.threatCapability, randFn);
        trialRs = samplePert(branch.lef.resistanceStrength, randFn);
        // In Open FAIR Monte Carlo simulation:
        // If Threat Capability (TC) exceeds Control Resistance Strength (RS), Vulnerability = 1.0
        trialVuln = trialTc > trialRs ? 1.0 : 0.0;
      }

      trialLef = trialTef * trialVuln;
    }

    trialLef = Math.max(0, trialLef);
    lefSamples[t] = trialLef;
    varTEF[t] = trialTef;
    varCF[t] = trialCf;
    varPoA[t] = trialPoa;
    varVuln[t] = trialVuln;
    varTC[t] = trialTc;
    varRS[t] = trialRs;

    // 2. Primary Loss Magnitude (PLM)
    let trialPlm = 0;
    let pProd = 0, pResp = 0, pRepl = 0, pFine = 0, pComp = 0, pRepu = 0;

    if (branch.primaryLoss.productivity.enabled !== false) {
      pProd = samplePert(branch.primaryLoss.productivity, randFn);
      trialPlm += pProd;
    }
    if (branch.primaryLoss.response.enabled !== false) {
      pResp = samplePert(branch.primaryLoss.response, randFn);
      trialPlm += pResp;
    }
    if (branch.primaryLoss.replacement.enabled !== false) {
      pRepl = samplePert(branch.primaryLoss.replacement, randFn);
      trialPlm += pRepl;
    }
    if (branch.primaryLoss.finesAndJudgements.enabled !== false) {
      pFine = samplePert(branch.primaryLoss.finesAndJudgements, randFn);
      trialPlm += pFine;
    }
    if (branch.primaryLoss.competitiveAdvantage.enabled !== false) {
      pComp = samplePert(branch.primaryLoss.competitiveAdvantage, randFn);
      trialPlm += pComp;
    }
    if (branch.primaryLoss.reputation.enabled !== false) {
      pRepu = samplePert(branch.primaryLoss.reputation, randFn);
      trialPlm += pRepu;
    }

    varPLM[t] = trialPlm;
    varPLM_prod[t] = pProd;
    varPLM_resp[t] = pResp;
    varPLM_repl[t] = pRepl;
    varPLM_fine[t] = pFine;
    varPLM_comp[t] = pComp;
    varPLM_repu[t] = pRepu;

    // 3. Secondary Loss Magnitude (SLM) & SLEF
    let trialSlm = 0;
    let sProd = 0, sResp = 0, sRepl = 0, sFine = 0, sComp = 0, sRepu = 0;

    if (branch.secondaryLoss.productivity.enabled !== false) {
      sProd = samplePert(branch.secondaryLoss.productivity, randFn);
      trialSlm += sProd;
    }
    if (branch.secondaryLoss.response.enabled !== false) {
      sResp = samplePert(branch.secondaryLoss.response, randFn);
      trialSlm += sResp;
    }
    if (branch.secondaryLoss.replacement.enabled !== false) {
      sRepl = samplePert(branch.secondaryLoss.replacement, randFn);
      trialSlm += sRepl;
    }
    if (branch.secondaryLoss.finesAndJudgements.enabled !== false) {
      sFine = samplePert(branch.secondaryLoss.finesAndJudgements, randFn);
      trialSlm += sFine;
    }
    if (branch.secondaryLoss.competitiveAdvantage.enabled !== false) {
      sComp = samplePert(branch.secondaryLoss.competitiveAdvantage, randFn);
      trialSlm += sComp;
    }
    if (branch.secondaryLoss.reputation.enabled !== false) {
      sRepu = samplePert(branch.secondaryLoss.reputation, randFn);
      trialSlm += sRepu;
    }

    // SLEF: percentage of primary events that trigger secondary loss (0 - 1)
    const slefRaw = samplePert(branch.secondaryLossEventFreq, randFn);
    const slefPct = Math.max(0, Math.min(1, slefRaw > 1 ? slefRaw / 100 : slefRaw));
    varSLEF[t] = slefPct;
    varSLM[t] = trialSlm;
    varSLM_prod[t] = sProd;
    varSLM_resp[t] = sResp;
    varSLM_repl[t] = sRepl;
    varSLM_fine[t] = sFine;
    varSLM_comp[t] = sComp;
    varSLM_repu[t] = sRepu;

    // 4. Annual Loss Event Calculation (Poisson/Compound Process)
    const primaryEventsCount = samplePoisson(trialLef, randFn);
    const trialPrimaryAle = primaryEventsCount * trialPlm;

    // Secondary events triggered:
    const secondaryEventsCount = sampleBinomial(primaryEventsCount, slefPct, randFn);
    const trialSecondaryAle = secondaryEventsCount * trialSlm;

    const trialTotalAle = trialPrimaryAle + trialSecondaryAle;

    primaryAle[t] = trialPrimaryAle;
    secondaryAle[t] = trialSecondaryAle;
    totalAle[t] = trialTotalAle;

    // Operational non-financial metrics:
    const downtimePerEvent = samplePert(branch.operationalLoss.serviceDowntimeHours, randFn);
    const dataLossPerEvent = samplePert(branch.operationalLoss.dataRecordsLoss, randFn);
    downtimeSamples[t] = primaryEventsCount * downtimePerEvent;
    dataLossSamples[t] = primaryEventsCount * dataLossPerEvent;

    // Accumulate sums for summary means
    sumLef += trialLef;
    sumTef += trialTef;
    sumVuln += trialVuln;
    sumPlm += trialPlm;
    sumSlm += trialSlm;
    sumSlef += slefPct;
    sumPrimAle += trialPrimaryAle;
    sumSecAle += trialSecondaryAle;
    sumTotAle += trialTotalAle;

    // Store subset for scatter plot
    if (t % sampleSubstepInterval === 0 && sampleSubset.length < 1000) {
      sampleSubset.push({
        trial: t + 1,
        totalAle: trialTotalAle,
        primaryAle: trialPrimaryAle,
        secondaryAle: trialSecondaryAle,
        lef: trialLef,
        lossMagnitude: trialPlm + (slefPct * trialSlm),
        serviceDowntimeHours: downtimeSamples[t],
        dataRecordsLoss: dataLossSamples[t],
        threatCapability: trialTc,
        resistanceStrength: trialRs,
        vulnerability: trialVuln
      });
    }
  }

  const plmPercentiles = calculatePercentiles(varPLM);
  const slmPercentiles = calculatePercentiles(varSLM);
  const lefPercentiles = calculatePercentiles(lefSamples);

  const branchSummary: BranchCalculationSummary = {
    lefMean: sumLef / numTrials,
    lefP05: lefPercentiles.p05,
    lefP95: lefPercentiles.p95,
    tefMean: sumTef / numTrials,
    vulnMeanPct: (sumVuln / numTrials) * 100,
    plmMean: sumPlm / numTrials,
    plmP05: plmPercentiles.p05,
    plmP95: plmPercentiles.p95,
    slmMean: sumSlm / numTrials,
    slmP05: slmPercentiles.p05,
    slmP95: slmPercentiles.p95,
    slefMeanPct: (sumSlef / numTrials) * 100,
    primaryAleMean: sumPrimAle / numTrials,
    secondaryAleMean: sumSecAle / numTrials,
    totalAleMean: sumTotAle / numTrials
  };

  const variableMatrix: Record<string, VariableSampleMeta> = {
    LEF: {
      key: 'LEF',
      displayName: 'Loss Event Frequency (LEF)',
      category: 'Frequency',
      domain: 'Frequency',
      description: 'Annual rate of loss events (TEF × Vulnerability). Primary driver of whether loss occurs in a given year.',
      samples: lefSamples,
      enabled: true,
      isAggregate: true
    },
    TEF: {
      key: 'TEF',
      displayName: 'Threat Event Frequency (TEF)',
      category: 'Frequency',
      domain: 'Frequency',
      description: 'Frequency with which threat actors attempt unauthorized actions against the target asset.',
      samples: varTEF,
      enabled: !branch.lef.useDirectLef,
      isAggregate: false
    },
    CF: {
      key: 'CF',
      displayName: 'Contact Frequency (CF)',
      category: 'Frequency',
      domain: 'Frequency',
      description: 'Frequency with which threat agents encounter or probe the asset boundary.',
      samples: varCF,
      enabled: !branch.lef.useDirectLef && !branch.lef.useDirectTef,
      isAggregate: false
    },
    PoA: {
      key: 'PoA',
      displayName: 'Probability of Action (PoA)',
      category: 'Frequency',
      domain: 'Frequency',
      description: 'Likelihood that a threat agent will act upon contact based on perceived reward vs risk.',
      samples: varPoA,
      enabled: !branch.lef.useDirectLef && !branch.lef.useDirectTef,
      isAggregate: false
    },
    Vulnerability: {
      key: 'Vulnerability',
      displayName: 'Vulnerability (Vuln / P[TC > RS])',
      category: 'Vulnerability',
      domain: 'Frequency',
      description: 'Probability that threat capability exceeds control resistance strength, causing breach.',
      samples: varVuln,
      enabled: !branch.lef.useDirectLef,
      isAggregate: false
    },
    TC: {
      key: 'TC',
      displayName: 'Threat Capability (TC)',
      category: 'Vulnerability',
      domain: 'Frequency',
      description: 'Relative capability score (0-100) of the external threat community attacking the asset.',
      samples: varTC,
      enabled: !branch.lef.useDirectLef && !branch.lef.useDirectVuln,
      isAggregate: false
    },
    RS: {
      key: 'RS',
      displayName: 'Resistance Strength (RS)',
      category: 'Vulnerability',
      domain: 'Frequency',
      description: 'Control effectiveness score (0-100) opposing threat capabilities.',
      samples: varRS,
      enabled: !branch.lef.useDirectLef && !branch.lef.useDirectVuln,
      isAggregate: false
    },
    PLM: {
      key: 'PLM',
      displayName: 'Primary Loss Magnitude (PLM)',
      category: 'Primary Magnitude',
      domain: 'Magnitude',
      description: 'Total direct financial losses borne by the primary organization per event.',
      samples: varPLM,
      enabled: true,
      isAggregate: true
    },
    PLM_Prod: {
      key: 'PLM_Prod',
      displayName: 'Primary Productivity Loss',
      category: 'Primary Magnitude',
      domain: 'Magnitude',
      description: 'Operational downtime and labor disruption directly halting revenue-generating work.',
      samples: varPLM_prod,
      enabled: branch.primaryLoss.productivity.enabled !== false,
      isAggregate: false
    },
    PLM_Resp: {
      key: 'PLM_Resp',
      displayName: 'Primary Response Costs',
      category: 'Primary Magnitude',
      domain: 'Magnitude',
      description: 'Incident response, forensics, legal counsel, and crisis PR remediation fees.',
      samples: varPLM_resp,
      enabled: branch.primaryLoss.response.enabled !== false,
      isAggregate: false
    },
    PLM_Repl: {
      key: 'PLM_Repl',
      displayName: 'Primary Replacement Costs',
      category: 'Primary Magnitude',
      domain: 'Magnitude',
      description: 'Capital cost to rebuild, patch, or replace compromised hardware, databases, and code.',
      samples: varPLM_repl,
      enabled: branch.primaryLoss.replacement.enabled !== false,
      isAggregate: false
    },
    PLM_Fine: {
      key: 'PLM_Fine',
      displayName: 'Primary Fines & Judgements',
      category: 'Primary Magnitude',
      domain: 'Magnitude',
      description: 'Direct regulatory fines (e.g. GDPR, HIPAA, SEC) and immediate contractual penalties.',
      samples: varPLM_fine,
      enabled: branch.primaryLoss.finesAndJudgements.enabled !== false,
      isAggregate: false
    },
    PLM_Comp: {
      key: 'PLM_Comp',
      displayName: 'Primary Competitive Advantage',
      category: 'Primary Magnitude',
      domain: 'Magnitude',
      description: 'Loss of trade secrets, intellectual property, or strategic market differentiation.',
      samples: varPLM_comp,
      enabled: branch.primaryLoss.competitiveAdvantage.enabled !== false,
      isAggregate: false
    },
    PLM_Repu: {
      key: 'PLM_Repu',
      displayName: 'Primary Reputation Damage',
      category: 'Primary Magnitude',
      domain: 'Magnitude',
      description: 'Immediate loss of market capitalization and client contract cancellations.',
      samples: varPLM_repu,
      enabled: branch.primaryLoss.reputation.enabled !== false,
      isAggregate: false
    },
    SLEF: {
      key: 'SLEF',
      displayName: 'Secondary Loss Event Freq (SLEF)',
      category: 'Secondary Magnitude',
      domain: 'Magnitude',
      description: 'Probability that a primary breach cascades into secondary stakeholder losses.',
      samples: varSLEF,
      enabled: true,
      isAggregate: false
    },
    SLM: {
      key: 'SLM',
      displayName: 'Secondary Loss Magnitude (SLM)',
      category: 'Secondary Magnitude',
      domain: 'Magnitude',
      description: 'Total downstream losses triggered by external stakeholders (customers, regulators, lawsuits).',
      samples: varSLM,
      enabled: true,
      isAggregate: true
    },
    SLM_Fine: {
      key: 'SLM_Fine',
      displayName: 'Secondary Fines & Lawsuits',
      category: 'Secondary Magnitude',
      domain: 'Magnitude',
      description: 'Secondary class-action civil lawsuits and multi-jurisdiction regulator enforcement.',
      samples: varSLM_fine,
      enabled: branch.secondaryLoss.finesAndJudgements.enabled !== false,
      isAggregate: false
    },
    SLM_Repu: {
      key: 'SLM_Repu',
      displayName: 'Secondary Brand & Churn',
      category: 'Secondary Magnitude',
      domain: 'Magnitude',
      description: 'Long-term client churn and increased cost of capital over multi-year periods.',
      samples: varSLM_repu,
      enabled: branch.secondaryLoss.reputation.enabled !== false,
      isAggregate: false
    },
    Downtime: {
      key: 'Downtime',
      displayName: 'Service Downtime Outage',
      category: 'Operational',
      domain: 'Operational',
      description: 'Cumulative annual outage duration across critical infrastructure components.',
      samples: downtimeSamples,
      enabled: true,
      isAggregate: false
    },
    DataLoss: {
      key: 'DataLoss',
      displayName: 'Data Records Compromised',
      category: 'Operational',
      domain: 'Operational',
      description: 'Cumulative volume of sensitive customer or proprietary records exfiltrated.',
      samples: dataLossSamples,
      enabled: true,
      isAggregate: false
    }
  };

  return {
    totalAleSamples: totalAle,
    primaryAleSamples: primaryAle,
    secondaryAleSamples: secondaryAle,
    lefSamples,
    downtimeSamples,
    dataLossSamples,
    samplePoints: sampleSubset,
    branchSummary,
    variableMatrix
  };
}

/**
 * Generate Loss Exceedance Curve (LEC) with Current vs Proposed points
 */
function computeLossExceedanceCurve(
  currentAle: Float64Array,
  proposedAle: Float64Array | null,
  currency: string,
  unitScale: number
): LossExceedancePoint[] {
  const sortedCur = currentAle.slice().sort();
  const sortedProp = proposedAle ? proposedAle.slice().sort() : null;
  const n = sortedCur.length;

  const points: LossExceedancePoint[] = [];
  const percentiles = [
    0.001, 0.005, 0.01, 0.02, 0.03, 0.05, 0.07, 0.10, 0.15, 0.20,
    0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70,
    0.75, 0.80, 0.85, 0.90, 0.92, 0.95, 0.97, 0.98, 0.99, 0.995, 0.999
  ];

  for (const p of percentiles) {
    const idxCur = Math.min(n - 1, Math.floor(p * n));
    const lossAmount = sortedCur[idxCur];
    const probExceeding = 1 - p; // P(Loss > x)

    let propProbExceeding: number | undefined = undefined;
    if (sortedProp) {
      let countExceeding = 0;
      for (let i = 0; i < sortedProp.length; i++) {
        if (sortedProp[i] >= lossAmount) {
          countExceeding = sortedProp.length - i;
          break;
        }
      }
      propProbExceeding = countExceeding / sortedProp.length;
    }

    points.push({
      lossAmount,
      formattedLoss: formatAmount(lossAmount, currency, unitScale),
      probabilityExceeding: Math.round(probExceeding * 1000) / 1000,
      cumulativePercentage: Math.round(p * 1000) / 10,
      proposedProbabilityExceeding: propProbExceeding !== undefined ? Math.round(propProbExceeding * 1000) / 1000 : undefined
    });
  }

  return points;
}

/**
 * Comprehensive Open FAIR Sensitivity Analysis Engine
 * Identifies variance drivers, Tornado empirical swings, and Loss Exceedance Curve tail sensitivity.
 */
function computeComprehensiveSensitivityAnalysis(
  matrix: Record<string, VariableSampleMeta>,
  ale: Float64Array,
  targetPercentile = 90
): {
  sensitivities: VariableSensitivity[];
  report: SensitivityAnalysisReport;
} {
  const n = ale.length;
  const aleMean = ale.reduce((a, b) => a + b, 0) / n;
  let aleVar = 0;
  for (let i = 0; i < n; i++) {
    aleVar += Math.pow(ale[i] - aleMean, 2);
  }
  const aleStd = Math.sqrt(aleVar / (n - 1));

  // Determine tail threshold (e.g. 90th percentile of ALE)
  const sortedAle = ale.slice().sort();
  const tailThreshold = sortedAle[Math.min(n - 1, Math.floor((targetPercentile / 100) * n))];
  const tailIndices: number[] = [];
  for (let i = 0; i < n; i++) {
    if (ale[i] >= tailThreshold) {
      tailIndices.push(i);
    }
  }
  const tailN = tailIndices.length;
  const tailAleMean = tailN > 0 ? tailIndices.reduce((acc, idx) => acc + ale[idx], 0) / tailN : aleMean;

  const rawList: (VariableSensitivity & { rawScore: number; tailScore: number })[] = [];

  for (const meta of Object.values(matrix)) {
    if (!meta.enabled) continue;
    const values = meta.samples;
    if (!values || values.length !== n) continue;

    // Check variance
    const vMean = values.reduce((a, b) => a + b, 0) / n;
    let cov = 0;
    let vVar = 0;

    for (let i = 0; i < n; i++) {
      const diff = values[i] - vMean;
      cov += diff * (ale[i] - aleMean);
      vVar += Math.pow(diff, 2);
    }

    if (vVar < 1e-12) {
      continue; // Variable has no variance (e.g. static zero)
    }

    const denom = Math.sqrt(vVar * aleVar);
    const correlation = denom > 0 ? cov / denom : 0;
    const vStd = Math.sqrt(vVar / (n - 1));

    // Tail analysis for Loss Exceedance Curve (top 10% trials)
    let tailSum = 0;
    let tailCov = 0;
    let tailVVar = 0;
    let tailAleVar = 0;

    for (const idx of tailIndices) {
      tailSum += values[idx];
    }
    const tailMean = tailN > 0 ? tailSum / tailN : vMean;
    const tailMeanRatio = vMean > 1e-6 ? tailMean / vMean : 1.0;

    for (const idx of tailIndices) {
      const vDiff = values[idx] - tailMean;
      const aleDiff = ale[idx] - tailAleMean;
      tailCov += vDiff * aleDiff;
      tailVVar += Math.pow(vDiff, 2);
      tailAleVar += Math.pow(aleDiff, 2);
    }
    const tailDenom = Math.sqrt(tailVVar * tailAleVar);
    const tailCorrelation = tailDenom > 0 ? tailCov / tailDenom : 0;

    // Empirical Tornado Swings (P10 vs P90 of input variable)
    const sortedValues = values.slice().sort();
    const p10Val = sortedValues[Math.floor(0.10 * n)];
    const p90Val = sortedValues[Math.floor(0.90 * n)];

    let lowAleSum = 0, lowCount = 0;
    let highAleSum = 0, highCount = 0;

    for (let i = 0; i < n; i++) {
      if (values[i] <= p10Val) {
        lowAleSum += ale[i];
        lowCount++;
      }
      if (values[i] >= p90Val) {
        highAleSum += ale[i];
        highCount++;
      }
    }

    const swingLow = lowCount > 0 ? lowAleSum / lowCount : aleMean;
    const swingHigh = highCount > 0 ? highAleSum / highCount : aleMean;
    const swingDelta = Math.max(0, swingHigh - swingLow);

    // Elasticity approximation: % change in ALE per 10% change in input
    const elasticity = (aleMean > 0 && vMean > 0 && vStd > 0)
      ? Math.max(-5, Math.min(5, correlation * (aleStd / aleMean) / (vStd / vMean)))
      : 0;

    // Tail driver score combining elevated tail mean ratio and correlation in tail
    const tailScore = Math.max(0, (tailMeanRatio - 1) * 60) + Math.max(0, tailCorrelation * 40);

    rawList.push({
      variableName: meta.key,
      displayName: meta.displayName,
      category: meta.category,
      domain: meta.domain,
      correlationWithALE: Math.round(correlation * 1000) / 1000,
      tailCorrelationWithVaR: Math.round(tailCorrelation * 1000) / 1000,
      tailMeanRatio: Math.round(tailMeanRatio * 100) / 100,
      importanceRank: 0,
      varianceContributionPct: 0, // Will be computed after normalization
      elasticity: Math.round(elasticity * 100) / 100,
      swingLow: Math.round(swingLow),
      swingHigh: Math.round(swingHigh),
      swingDelta: Math.round(swingDelta),
      lecTailRank: 0,
      description: meta.description,
      rawScore: Math.pow(correlation, 2),
      tailScore
    });
  }

  // Filter for primary non-redundant variance decomposition
  // We prefer decomposed granular variables or standard components
  const activeForNorm = rawList.filter(item => !['LEF', 'PLM', 'SLM'].includes(item.variableName));
  const normSource = activeForNorm.length > 0 ? activeForNorm : rawList;

  const totalRawVariance = normSource.reduce((acc, item) => acc + item.rawScore, 0);

  // Compute variance contribution percentage
  for (const item of rawList) {
    if (totalRawVariance > 0) {
      item.varianceContributionPct = Math.round((item.rawScore / totalRawVariance) * 1000) / 10;
    } else {
      item.varianceContributionPct = 0;
    }
  }

  // Sort by overall variance / correlation magnitude
  rawList.sort((a, b) => Math.abs(b.correlationWithALE) - Math.abs(a.correlationWithALE));
  rawList.forEach((s, idx) => {
    s.importanceRank = idx + 1;
  });

  // Assign LEC Tail Rank
  const tailSorted = [...rawList].sort((a, b) => b.tailScore - a.tailScore);
  tailSorted.forEach((s, idx) => {
    s.lecTailRank = idx + 1;
  });

  // Compute Domain Breakdown (Frequency vs Magnitude vs Operational)
  let freqVariance = 0;
  let magVariance = 0;
  let opVariance = 0;

  for (const item of normSource) {
    if (item.domain === 'Frequency') freqVariance += item.varianceContributionPct;
    else if (item.domain === 'Magnitude') magVariance += item.varianceContributionPct;
    else if (item.domain === 'Operational') opVariance += item.varianceContributionPct;
  }

  const domainSum = freqVariance + magVariance + opVariance || 100;
  const freqPct = Math.round((freqVariance / domainSum) * 1000) / 10;
  const magPct = Math.round((magVariance / domainSum) * 1000) / 10;
  const opPct = Math.round((opVariance / domainSum) * 1000) / 10;

  let dominantDomain: 'Frequency' | 'Loss Magnitude' | 'Balanced' = 'Balanced';
  if (freqPct >= 55) dominantDomain = 'Frequency';
  else if (magPct >= 55) dominantDomain = 'Loss Magnitude';

  const domainBreakdown: SensitivityDomainBreakdown = {
    frequencyContributionPct: freqPct,
    magnitudeContributionPct: magPct,
    operationalContributionPct: opPct,
    dominantDomain
  };

  const topOverall = rawList.slice(0, 5);
  const topTail = [...rawList].sort((a, b) => a.lecTailRank - b.lecTailRank).slice(0, 5);

  const top1 = topOverall[0] ? topOverall[0].displayName : 'Threat Event Frequency';
  const top1Pct = topOverall[0] ? topOverall[0].varianceContributionPct : 50;
  const topTail1 = topTail[0] ? topTail[0].displayName : 'Primary Fines & Judgements';

  // Construct dynamic analytical synthesis
  const summaryNarrative = dominantDomain === 'Frequency'
    ? `Frequency-dominated risk profile: ${top1} is the leading variance driver accounting for ${top1Pct}% of overall ALE dispersion. Variance in annual loss is predominantly controlled by how often attacks succeed rather than single-event dollar volatility.`
    : dominantDomain === 'Loss Magnitude'
    ? `Magnitude-dominated risk profile: Loss magnitude forms (led by ${top1}, ${top1Pct}% variance share) drive overall financial volatility. Even rare breach occurrences trigger wide dispersion in total annual financial impact.`
    : `Balanced risk profile: Annual loss variance is evenly co-driven by threat frequencies (${freqPct}%) and loss magnitude components (${magPct}%).`;

  const lecVarianceExplanation = `On the Loss Exceedance Curve (LEC), frequency factors (${top1}) determine the baseline probability threshold where losses begin, whereas high-magnitude components (led by ${topTail1}, Tail Rank #1) govern the catastrophic right tail (>P90/P95). In tail-loss iterations, ${topTail1} averages ${topTail[0]?.tailMeanRatio || 1.8}x its normal expected value.`;

  const mitigationRecommendation = dominantDomain === 'Frequency'
    ? `Prioritize preventative and detection controls (e.g., Attack Surface Hardening, MFA, Threat Containment) to compress Loss Event Frequency (LEF). This will shift the entire Loss Exceedance Curve leftward most effectively.`
    : `Prioritize impact dampening, business continuity, and cyber risk transfer (e.g., automated offline backups, cyber insurance policy sub-limits, incident legal retainers) to compress catastrophic right-tail Loss Exceedance.`;

  const cleanSensitivities: VariableSensitivity[] = rawList.map(item => {
    const { rawScore, tailScore, ...rest } = item;
    return rest;
  });

  const report: SensitivityAnalysisReport = {
    domainBreakdown,
    topOverallDrivers: topOverall.map(({ rawScore, tailScore, ...rest }) => rest),
    topTailLecDrivers: topTail.map(({ rawScore, tailScore, ...rest }) => rest),
    allSensitivities: cleanSensitivities,
    summaryNarrative,
    mitigationRecommendation,
    lecVarianceExplanation
  };

  return {
    sensitivities: cleanSensitivities,
    report
  };
}

/**
 * Main function: Run Open FAIR Quantitative Simulation on a Scenario
 */
export function runFairSimulation(
  scenario: FairScenario,
  numTrials = 10000
): SimulationResult {
  const startTime = performance.now();
  const seed = scenario.randomSeed || (Date.now() % 1000000);
  const random = new SeededRandom(seed);

  // 1. Simulate Current State
  const currentSim = simulateBranch(scenario.current, numTrials, random, scenario.unitScale);
  const currentStats = calculatePercentiles(currentSim.totalAleSamples);
  const currentPrimaryStats = calculatePercentiles(currentSim.primaryAleSamples);
  const currentSecondaryStats = calculatePercentiles(currentSim.secondaryAleSamples);
  const currentDowntimeStats = calculatePercentiles(currentSim.downtimeSamples);
  const currentDataLossStats = calculatePercentiles(currentSim.dataLossSamples);
  const currentLefStats = calculatePercentiles(currentSim.lefSamples);
  const currentHistogram = generateHistogram(currentSim.totalAleSamples, 25, scenario.currency, scenario.unitScale);

  const targetPct = scenario.riskTolerance.targetPercentile || 90;
  const currentTargetLoss = targetPct === 95 ? currentStats.p95 : currentStats.p90;
  const currentRiskRating = determineRiskRating(currentTargetLoss, scenario.riskTolerance);

  // 2. Simulate Proposed State (if enabled)
  let proposedStats: ReturnType<typeof calculatePercentiles> | undefined = undefined;
  let proposedPrimaryStats: ReturnType<typeof calculatePercentiles> | undefined = undefined;
  let proposedSecondaryStats: ReturnType<typeof calculatePercentiles> | undefined = undefined;
  let proposedDowntimeStats: ReturnType<typeof calculatePercentiles> | undefined = undefined;
  let proposedDataLossStats: ReturnType<typeof calculatePercentiles> | undefined = undefined;
  let proposedLefStats: ReturnType<typeof calculatePercentiles> | undefined = undefined;
  let proposedHistogram: ReturnType<typeof generateHistogram> | undefined = undefined;
  let proposedRiskRating: 'VL' | 'L' | 'M' | 'SG' | 'H' | 'SV' | undefined = undefined;
  let proposedSim: ReturnType<typeof simulateBranch> | null = null;

  if (scenario.hasProposed) {
    proposedSim = simulateBranch(scenario.proposed, numTrials, random, scenario.unitScale);
    proposedStats = calculatePercentiles(proposedSim.totalAleSamples);
    proposedPrimaryStats = calculatePercentiles(proposedSim.primaryAleSamples);
    proposedSecondaryStats = calculatePercentiles(proposedSim.secondaryAleSamples);
    proposedDowntimeStats = calculatePercentiles(proposedSim.downtimeSamples);
    proposedDataLossStats = calculatePercentiles(proposedSim.dataLossSamples);
    proposedLefStats = calculatePercentiles(proposedSim.lefSamples);
    proposedHistogram = generateHistogram(proposedSim.totalAleSamples, 25, scenario.currency, scenario.unitScale);

    const propTargetLoss = targetPct === 95 ? proposedStats.p95 : proposedStats.p90;
    proposedRiskRating = determineRiskRating(propTargetLoss, scenario.riskTolerance);
  }

  // 3. Loss Exceedance Curve (LEC)
  const lossExceedanceCurve = computeLossExceedanceCurve(
    currentSim.totalAleSamples,
    proposedSim ? proposedSim.totalAleSamples : null,
    scenario.currency,
    scenario.unitScale
  );

  // 4. Comprehensive Variable Sensitivities & LEC Variance Report
  const { sensitivities, report: sensitivityReport } = computeComprehensiveSensitivityAnalysis(
    currentSim.variableMatrix,
    currentSim.totalAleSamples,
    targetPct
  );

  // 5. Delta & ROI calculations
  let riskReductionDollar: number | undefined = undefined;
  let riskReductionPct: number | undefined = undefined;
  let returnOnControlInvestment: number | undefined = undefined;

  if (proposedStats) {
    riskReductionDollar = currentStats.mean - proposedStats.mean;
    riskReductionPct = currentStats.mean > 0 ? (riskReductionDollar / currentStats.mean) * 100 : 0;

    if (scenario.proposedControlCost && scenario.proposedControlCost > 0) {
      returnOnControlInvestment = ((riskReductionDollar - scenario.proposedControlCost) / scenario.proposedControlCost) * 100;
    }
  }

  const durationMs = Math.round(performance.now() - startTime);

  return {
    scenarioId: scenario.id,
    timestamp: new Date().toISOString(),
    trialsCount: numTrials,
    durationMs,
    currentStats,
    currentPrimaryStats,
    currentSecondaryStats,
    currentDowntimeStats,
    currentDataLossStats,
    currentLefStats,
    currentBranchCalculations: currentSim.branchSummary,

    proposedStats,
    proposedPrimaryStats,
    proposedSecondaryStats,
    proposedDowntimeStats,
    proposedDataLossStats,
    proposedLefStats,
    proposedBranchCalculations: proposedSim ? proposedSim.branchSummary : undefined,

    riskReductionDollar,
    riskReductionPct: riskReductionPct !== undefined ? Math.round(riskReductionPct * 10) / 10 : undefined,
    returnOnControlInvestment: returnOnControlInvestment !== undefined ? Math.round(returnOnControlInvestment * 10) / 10 : undefined,

    currentRiskRating,
    proposedRiskRating,

    currentHistogram,
    proposedHistogram,

    lossExceedanceCurve,
    sensitivities,
    sensitivityReport,

    sampledPointsCur: currentSim.samplePoints,
    sampledPointsProp: proposedSim ? proposedSim.samplePoints : undefined
  };
}
