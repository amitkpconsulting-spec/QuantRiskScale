import { FairScenario, FairModelBranch, RiskToleranceScale } from '../types/fair';

export const OPEN_FAIR_STAKEHOLDER_INTAKE_SYSTEM_PROMPT = `You are an expert Open FAIR™ Risk Quantification Analyst. Your task is to extract necessary calibration parameters from the user through a conversational, 3-step intake process to compute quantitative cyber/operational risk.

Step 1: Clarify the Risk Scenario
- Prompt the user to identify: (1) The specific Asset, (2) The Threat Community, and (3) The Harm/Impact (Confidentiality, Integrity, or Availability).
- Require a clear 1-sentence risk statement: "[Threat Actor] causes [Impact] to [Asset] resulting in financial loss."

Step 2: Calibrate Loss Event Frequency (LEF)
- Ask 3 plain-language calibration questions:
  1. In a standard year, how many times does this event realistically happen? (Most Likely)
  2. In the quietest year imaginable, what is the absolute minimum occurrences? (Min)
  3. In a catastrophic year, what is the worst-case frequency? (Max)
- Convert the user's answers into annualized frequencies (e.g., once every 5 years = 0.2).

Step 3: Calibrate Loss Magnitude (LM)
- Prompt for dollar ranges across:
  - Immediate Costs (Incident response, forensic retainers, hardware replacement, overtime).
  - Extended/Secondary Costs (Regulatory fines, customer notification, legal settlements, churn).
- Collect the Min (10th percentile), Most Likely (Mode), and Max (90th percentile) financial figures.

Output Format:
Once all steps are complete, present a structured JSON schema ready for the Monte Carlo engine:
{
  "scenario": "...",
  "lef": { "min": float, "mode": float, "max": float },
  "lm": { "min": float, "mode": float, "max": float },
  "confidence_notes": "..."
}`;

export interface StakeholderIntakeJsonOutput {
  scenario: string;
  lef: {
    min: number;
    mode: number;
    max: number;
  };
  lm: {
    min: number;
    mode: number;
    max: number;
  };
  confidence_notes?: string;
  asset?: string;
  threatCommunity?: string;
  harmType?: 'Confidentiality' | 'Integrity' | 'Availability' | 'All';
}

export interface FrequencyOption {
  label: string;
  sublabel: string;
  annualValue: number;
}

export const FREQUENCY_PRESETS: FrequencyOption[] = [
  { label: 'Once every 20 years', sublabel: '0.05 / yr (Extremely Rare)', annualValue: 0.05 },
  { label: 'Once every 10 years', sublabel: '0.10 / yr (Decade Event)', annualValue: 0.1 },
  { label: 'Once every 5 years', sublabel: '0.20 / yr (Multi-Year Cycle)', annualValue: 0.2 },
  { label: 'Once every 2 years', sublabel: '0.50 / yr (Biennial)', annualValue: 0.5 },
  { label: 'Once a year', sublabel: '1.00 / yr (Annual Regular)', annualValue: 1.0 },
  { label: '2 to 3 times a year', sublabel: '2.50 / yr (Periodic)', annualValue: 2.5 },
  { label: 'Every 2 months', sublabel: '6.00 / yr (Bi-Monthly)', annualValue: 6.0 },
  { label: 'Monthly', sublabel: '12.00 / yr (High Frequency)', annualValue: 12.0 },
  { label: 'Weekly or more', sublabel: '52.00 / yr (Continuous Barrage)', annualValue: 52.0 }
];

/**
 * Parses conversational natural text into annualized frequency value
 */
export function parsePlainLanguageFrequency(text: string): number | null {
  const clean = text.toLowerCase().trim();

  if (clean.includes('20 year') || clean.includes('twenty year')) return 0.05;
  if (clean.includes('10 year') || clean.includes('ten year')) return 0.1;
  if (clean.includes('5 year') || clean.includes('five year')) return 0.2;
  if (clean.includes('3 year') || clean.includes('three year')) return 0.33;
  if (clean.includes('2 year') || clean.includes('two year')) return 0.5;
  if (clean.includes('once a year') || clean.includes('annual') || clean.includes('1 time a year') || clean.includes('1/year')) return 1.0;
  if (clean.includes('twice a year') || clean.includes('2 times a year')) return 2.0;
  if (clean.includes('2 to 3') || clean.includes('2-3')) return 2.5;
  if (clean.includes('quarterly') || clean.includes('4 times')) return 4.0;
  if (clean.includes('monthly') || clean.includes('12 times')) return 12.0;
  if (clean.includes('weekly') || clean.includes('52 times')) return 52.0;

  // Pattern: "once every X years"
  const everyYearsMatch = clean.match(/(?:once\s+)?every\s+([0-9.]+)\s+years?/);
  if (everyYearsMatch && parseFloat(everyYearsMatch[1]) > 0) {
    return parseFloat((1 / parseFloat(everyYearsMatch[1])).toFixed(4));
  }

  // Pattern: "X times a year" or "X/yr"
  const timesYearMatch = clean.match(/([0-9.]+)\s*(?:times\s+a\s+year|per\s+year|\/yr|\/year)/);
  if (timesYearMatch && parseFloat(timesYearMatch[1]) >= 0) {
    return parseFloat(timesYearMatch[1]);
  }

  const rawNum = parseFloat(clean);
  if (!isNaN(rawNum) && rawNum >= 0) {
    return rawNum;
  }

  return null;
}

/**
 * Extracts structured JSON schema from an AI message
 */
export function extractStakeholderJson(text: string): StakeholderIntakeJsonOutput | null {
  try {
    // Try finding code block with json
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const candidateStr = jsonMatch ? jsonMatch[1] : text;

    // Look for { "scenario": ... }
    const firstBrace = candidateStr.indexOf('{');
    const lastBrace = candidateStr.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    const jsonSub = candidateStr.slice(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonSub);

    if (parsed && typeof parsed.scenario === 'string' && parsed.lef && parsed.lm) {
      return {
        scenario: parsed.scenario,
        lef: {
          min: typeof parsed.lef.min === 'number' ? parsed.lef.min : parseFloat(parsed.lef.min) || 0.1,
          mode: typeof parsed.lef.mode === 'number' ? parsed.lef.mode : parseFloat(parsed.lef.mode) || 1.0,
          max: typeof parsed.lef.max === 'number' ? parsed.lef.max : parseFloat(parsed.lef.max) || 3.0
        },
        lm: {
          min: typeof parsed.lm.min === 'number' ? parsed.lm.min : parseFloat(parsed.lm.min) || 25000,
          mode: typeof parsed.lm.mode === 'number' ? parsed.lm.mode : parseFloat(parsed.lm.mode) || 150000,
          max: typeof parsed.lm.max === 'number' ? parsed.lm.max : parseFloat(parsed.lm.max) || 800000
        },
        confidence_notes: parsed.confidence_notes || parsed.confidenceNotes || 'Extracted via Open FAIR 3-step intake',
        asset: parsed.asset,
        threatCommunity: parsed.threatCommunity || parsed.threat_community,
        harmType: parsed.harmType || parsed.harm_type || 'Confidentiality'
      };
    }
  } catch (err) {
    // Ignore JSON parsing errors
  }
  return null;
}

const DEFAULT_RISK_TOLERANCE: RiskToleranceScale = {
  veryLowMax: 10000,
  lowMax: 100000,
  moderateMax: 1000000,
  significantMax: 5000000,
  highMax: 10000000,
  targetPercentile: 90
};

/**
 * Creates a complete FairScenario from the stakeholder 3-step JSON schema
 */
export function createScenarioFromStakeholderJson(
  data: StakeholderIntakeJsonOutput,
  currency = '$'
): FairScenario {
  const now = new Date().toISOString();
  const id = `scenario-stakeholder-${Date.now()}`;

  // Parse asset and threat from scenario statement if not explicitly passed
  let asset = data.asset || 'Critical Digital Asset';
  let threatCommunity = data.threatCommunity || 'Cyber Adversary';
  let threatEffect: 'Confidentiality' | 'Integrity' | 'Availability' | 'All' = data.harmType || 'Availability';

  const lowerScenario = data.scenario.toLowerCase();
  if (lowerScenario.includes('confidentiality') || lowerScenario.includes('data breach') || lowerScenario.includes('exfiltration')) {
    threatEffect = 'Confidentiality';
  } else if (lowerScenario.includes('integrity') || lowerScenario.includes('tamper') || lowerScenario.includes('fraud')) {
    threatEffect = 'Integrity';
  } else if (lowerScenario.includes('availability') || lowerScenario.includes('outage') || lowerScenario.includes('ddos') || lowerScenario.includes('ransomware')) {
    threatEffect = 'Availability';
  }

  // Safe LEF bounds
  const lefMin = Math.max(0.001, data.lef.min);
  const lefMode = Math.max(lefMin, data.lef.mode);
  const lefHigh = Math.max(lefMode * 1.05, data.lef.max);

  // Safe LM bounds (Allocate ~50% to direct productivity/response, 50% to secondary impact)
  const totalLmMin = Math.max(1000, data.lm.min);
  const totalLmMode = Math.max(totalLmMin, data.lm.mode);
  const totalLmMax = Math.max(totalLmMode * 1.1, data.lm.max);

  const primaryMode = Math.round(totalLmMode * 0.55);
  const secondaryMode = Math.round(totalLmMode * 0.45);

  const branch: FairModelBranch = {
    lef: {
      useDirectLef: true,
      directLef: { low: lefMin, mode: lefMode, high: lefHigh, confidence: 4 },
      useDirectTef: false,
      directTef: { low: lefMin * 2, mode: lefMode * 2, high: lefHigh * 2, confidence: 4 },
      contactFrequency: { low: lefMin * 3, mode: lefMode * 3, high: lefHigh * 3, confidence: 4 },
      probabilityOfAction: { low: 0.3, mode: 0.6, high: 0.9, confidence: 4 },
      useDirectVuln: false,
      directVuln: { low: 0.15, mode: 0.35, high: 0.65, confidence: 4 },
      threatCapability: { low: 40, mode: 65, high: 85, confidence: 4 },
      resistanceStrength: { low: 45, mode: 60, high: 80, confidence: 4 }
    },
    primaryLoss: {
      productivity: {
        low: Math.round(primaryMode * 0.3),
        mode: Math.round(primaryMode * 0.6),
        high: Math.round(primaryMode * 2.2),
        confidence: 4,
        enabled: true
      },
      response: {
        low: Math.round(primaryMode * 0.2),
        mode: Math.round(primaryMode * 0.4),
        high: Math.round(primaryMode * 1.8),
        confidence: 4,
        enabled: true
      },
      replacement: { low: 0, mode: 0, high: 0, confidence: 4, enabled: false },
      finesAndJudgements: { low: 0, mode: 0, high: 0, confidence: 4, enabled: false },
      competitiveAdvantage: { low: 0, mode: 0, high: 0, confidence: 4, enabled: false },
      reputation: { low: 0, mode: 0, high: 0, confidence: 4, enabled: false }
    },
    secondaryLossEventFreq: { low: 20, mode: 50, high: 85, confidence: 4 },
    secondaryLoss: {
      productivity: { low: 0, mode: 0, high: 0, confidence: 4, enabled: false },
      response: {
        low: Math.round(secondaryMode * 0.2),
        mode: Math.round(secondaryMode * 0.3),
        high: Math.round(secondaryMode * 1.5),
        confidence: 4,
        enabled: true
      },
      replacement: { low: 0, mode: 0, high: 0, confidence: 4, enabled: false },
      finesAndJudgements: {
        low: Math.round(secondaryMode * 0.3),
        mode: Math.round(secondaryMode * 0.5),
        high: Math.round(secondaryMode * 2.5),
        confidence: 4,
        enabled: true
      },
      competitiveAdvantage: { low: 0, mode: 0, high: 0, confidence: 4, enabled: false },
      reputation: {
        low: Math.round(secondaryMode * 0.2),
        mode: Math.round(secondaryMode * 0.2),
        high: Math.round(secondaryMode * 1.8),
        confidence: 4,
        enabled: true
      }
    },
    operationalLoss: {
      serviceDowntimeHours: { low: 1, mode: 6, high: 24, confidence: 4 },
      dataRecordsLoss: { low: 0.1, mode: 2, high: 15, confidence: 4 }
    }
  };

  const proposedBranch: FairModelBranch = {
    ...branch,
    lef: {
      ...branch.lef,
      directLef: {
        low: parseFloat((lefMin * 0.25).toFixed(3)),
        mode: parseFloat((lefMode * 0.35).toFixed(3)),
        high: parseFloat((lefHigh * 0.45).toFixed(3)),
        confidence: 4
      }
    },
    primaryLoss: {
      ...branch.primaryLoss,
      productivity: {
        ...branch.primaryLoss.productivity,
        low: Math.round(branch.primaryLoss.productivity.low * 0.4),
        mode: Math.round(branch.primaryLoss.productivity.mode * 0.4),
        high: Math.round(branch.primaryLoss.productivity.high * 0.4)
      }
    }
  };

  const scenarioName = data.scenario.length > 70
    ? data.scenario.slice(0, 67) + '...'
    : data.scenario;

  return {
    id,
    name: scenarioName,
    description: `${data.scenario}\n\nConfidence Notes: ${data.confidence_notes || 'Calibrated via 3-step Open FAIR intake process.'}`,
    asset,
    threatCommunity,
    threatEffect,
    status: 'Approved',
    category: 'Stakeholder Calibrated',
    currency,
    unitScale: 1,
    unitLabel: currency,
    simulationsCount: 10000,
    current: branch,
    proposed: proposedBranch,
    hasProposed: true,
    proposedControlCost: Math.round(totalLmMode * 0.12),
    riskTolerance: DEFAULT_RISK_TOLERANCE,
    createdAt: now,
    updatedAt: now
  };
}
