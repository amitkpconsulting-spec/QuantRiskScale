export type DistributionType = 'pert' | 'lognormal' | 'normal';

export interface ThreePointEstimate {
  low: number;
  mode: number; // most likely
  high: number;
  confidence: number; // Shape parameter gamma, default 4 (typical PERT)
  distributionType?: DistributionType;
  enabled?: boolean;
}

export interface RiskToleranceScale {
  veryLowMax: number; // VL: 0 - VLMax
  lowMax: number;     // L: VLMax - LowMax
  moderateMax: number;// M: LowMax - ModMax
  significantMax: number; // SG: ModMax - SigMax
  highMax: number;    // H: SigMax - HighMax
  // Severe SV is > HighMax
  targetPercentile: number; // e.g. 90th or 95th percentile
}

export interface PrimaryLossForms {
  productivity: ThreePointEstimate;
  response: ThreePointEstimate;
  replacement: ThreePointEstimate;
  finesAndJudgements: ThreePointEstimate;
  competitiveAdvantage: ThreePointEstimate;
  reputation: ThreePointEstimate;
}

export interface SecondaryLossForms {
  productivity: ThreePointEstimate;
  response: ThreePointEstimate;
  replacement: ThreePointEstimate;
  finesAndJudgements: ThreePointEstimate;
  competitiveAdvantage: ThreePointEstimate;
  reputation: ThreePointEstimate;
}

export interface OperationalLossForms {
  serviceDowntimeHours: ThreePointEstimate;
  dataRecordsLoss: ThreePointEstimate; // in thousands (k) or count
}

export interface LefDecomposition {
  useDirectLef: boolean;
  directLef: ThreePointEstimate;

  // Decomposed TEF
  useDirectTef: boolean;
  directTef: ThreePointEstimate;
  contactFrequency: ThreePointEstimate;
  probabilityOfAction: ThreePointEstimate; // 0 to 1 (or 0% to 100%)

  // Decomposed Vulnerability
  useDirectVuln: boolean;
  directVuln: ThreePointEstimate; // 0 to 1 (or 0% to 100%)
  threatCapability: ThreePointEstimate; // 0 to 100
  resistanceStrength: ThreePointEstimate; // 0 to 100 (Control strength)
}

export interface FairModelBranch {
  lef: LefDecomposition;
  primaryLoss: PrimaryLossForms;
  secondaryLossEventFreq: ThreePointEstimate; // % of primary events (0 - 100)
  secondaryLoss: SecondaryLossForms;
  operationalLoss: OperationalLossForms;
}

export interface FairScenario {
  id: string;
  name: string;
  description: string;
  asset: string;
  threatCommunity: string;
  threatEffect: 'Confidentiality' | 'Integrity' | 'Availability' | 'All';
  status: 'Draft' | 'Approved' | 'Archived';
  category: string;
  currency: string; // '$', '£', '€', '¥'
  unitScale: number; // 1 (Exact), 1000 ($k), 1000000 ($M)
  unitLabel: string; // '$', '$k', '$M'
  simulationsCount: number; // e.g. 10000
  randomSeed?: number;

  current: FairModelBranch;
  proposed: FairModelBranch; // What-If proposed mitigation scenario
  hasProposed: boolean;
  proposedControlCost?: number; // Annualized cost of proposed controls

  riskTolerance: RiskToleranceScale;

  createdAt: string;
  updatedAt: string;
}

export interface ScenarioSnapshot {
  id: string;
  scenarioId: string;
  versionNumber: number;
  note?: string;
  createdAt: string;
  simulationsCount: number;
  currency: string;
  unitScale: number;
  summary: {
    tefMode: number;
    vulnModePct: number;
    primaryLossMode: number;
    secondaryLossMode: number;
    hasProposed: boolean;
    threatCapabilityMode: number;
    resistanceStrengthMode: number;
  };
  scenarioData: FairScenario;
}

export interface SimulationSamplePoint {
  trial: number;
  totalAle: number;
  primaryAle: number;
  secondaryAle: number;
  lef: number;
  lossMagnitude: number;
  serviceDowntimeHours: number;
  dataRecordsLoss: number;
  threatCapability?: number;
  resistanceStrength?: number;
  vulnerability?: number;
}

export interface PercentileStats {
  min: number;
  p05: number; // 5th Percentile (90% CI Lower Bound)
  p10: number;
  p25: number;
  p50: number; // Median
  mean: number;
  p75: number;
  p90: number;
  p95: number; // 95th Percentile (90% CI Upper Bound)
  p99: number;
  max: number;
  stdDev: number;
}

export interface HistogramBin {
  binMin: number;
  binMax: number;
  binLabel: string;
  count: number;
  frequency: number; // 0 to 1
  cumulativeFrequency: number; // 0 to 100%
}

export interface LossExceedancePoint {
  lossAmount: number;
  formattedLoss: string;
  probabilityExceeding: number; // e.g. 0.95 (95% chance loss exceeds this)
  cumulativePercentage: number;
  proposedProbabilityExceeding?: number;
}

export interface VariableSensitivity {
  variableName: string;
  displayName: string;
  category: 'Frequency' | 'Vulnerability' | 'Primary Magnitude' | 'Secondary Magnitude' | 'Operational';
  domain: 'Frequency' | 'Magnitude' | 'Operational';
  correlationWithALE: number; // Pearson/Spearman correlation against total ALE
  importanceRank: number;
  varianceContributionPct: number; // % of total variance in ALE
  tailCorrelationWithVaR: number; // Correlation within the top 10% tail (VaR/catastrophe driver)
  tailMeanRatio: number; // Ratio of parameter mean in top 10% tail vs overall mean
  elasticity: number; // % change in ALE per 10% change in input
  swingLow: number; // Expected ALE when parameter is in its low 10th percentile
  swingHigh: number; // Expected ALE when parameter is in its high 90th percentile
  swingDelta: number; // Dollar swing width for Tornado chart
  lecTailRank: number; // Rank in driving the extreme right tail of the Loss Exceedance Curve
  description?: string;
}

export interface SensitivityDomainBreakdown {
  frequencyContributionPct: number;
  magnitudeContributionPct: number;
  operationalContributionPct: number;
  dominantDomain: 'Frequency' | 'Loss Magnitude' | 'Balanced';
}

export interface SensitivityAnalysisReport {
  domainBreakdown: SensitivityDomainBreakdown;
  topOverallDrivers: VariableSensitivity[];
  topTailLecDrivers: VariableSensitivity[];
  allSensitivities: VariableSensitivity[];
  summaryNarrative: string;
  mitigationRecommendation: string;
  lecVarianceExplanation: string;
}

export interface BranchCalculationSummary {
  lefMean: number;
  lefP05?: number;
  lefP95?: number;
  tefMean: number;
  vulnMeanPct: number;
  plmMean: number;
  plmP05?: number;
  plmP95?: number;
  slmMean: number;
  slmP05?: number;
  slmP95?: number;
  slefMeanPct: number;
  primaryAleMean: number;
  secondaryAleMean: number;
  totalAleMean: number;
}

export interface SimulationResult {
  scenarioId: string;
  timestamp: string;
  trialsCount: number;
  durationMs: number;

  currentStats: PercentileStats;
  currentPrimaryStats: PercentileStats;
  currentSecondaryStats: PercentileStats;
  currentDowntimeStats: PercentileStats;
  currentDataLossStats: PercentileStats;
  currentLefStats: PercentileStats;
  currentBranchCalculations: BranchCalculationSummary;

  proposedStats?: PercentileStats;
  proposedPrimaryStats?: PercentileStats;
  proposedSecondaryStats?: PercentileStats;
  proposedDowntimeStats?: PercentileStats;
  proposedDataLossStats?: PercentileStats;
  proposedLefStats?: PercentileStats;
  proposedBranchCalculations?: BranchCalculationSummary;

  riskReductionDollar?: number;
  riskReductionPct?: number;
  returnOnControlInvestment?: number; // (ALE Reduction - Control Cost) / Control Cost

  currentRiskRating: 'VL' | 'L' | 'M' | 'SG' | 'H' | 'SV';
  proposedRiskRating?: 'VL' | 'L' | 'M' | 'SG' | 'H' | 'SV';

  currentHistogram: HistogramBin[];
  proposedHistogram?: HistogramBin[];

  lossExceedanceCurve: LossExceedancePoint[];
  sensitivities: VariableSensitivity[];
  sensitivityReport?: SensitivityAnalysisReport;

  sampledPointsCur: SimulationSamplePoint[]; // Sampled subset (e.g. 1000 points)
  sampledPointsProp?: SimulationSamplePoint[];
}

export interface LocalAiEndpointConfig {
  endpoint: string; // e.g. "http://localhost:11434/v1" or "http://localhost:1234/v1"
  model: string;
  apiKey?: string;
  mode: 'local_endpoint' | 'heuristic_engine' | 'gemini_cloud';
  temperature: number;
  maxTokens: number;
  isConnected: boolean;
  latencyMs: number;
  availableModels: string[];
}

export interface AssetRegisterItem {
  id: string;
  name: string;
  category:
    | 'Financial Infrastructure'
    | 'Trading Engine'
    | 'Retail POS & E-Commerce'
    | 'AI Models & IP'
    | 'Critical Database'
    | 'Web Application'
    | 'Customer PII'
    | 'Payment Gateway'
    | 'Internal Infrastructure'
    | 'IP / Source Code'
    | string;
  estimatedValue: number;
  criticality: 'Low' | 'Medium' | 'High' | 'Mission Critical';
  owner: string;
  description: string;
}

export interface ThreatRegisterItem {
  id: string;
  name: string;
  category:
    | 'Cybercriminal (Banking)'
    | 'Cybercriminal (Retail Card Fraud)'
    | 'Cybercriminal (Ransomware)'
    | 'Nation State / Market Manipulation'
    | 'Nation State / Industrial Espionage'
    | 'Nation State / APT'
    | 'Malicious Insider'
    | 'Hacktivist'
    | 'Script Kiddie / Botnet'
    | 'Third-Party Vendor'
    | string;
  capabilityLevel:
    | 'Low (10-30)'
    | 'Medium (30-60)'
    | 'High (60-85)'
    | 'Elite (85-100)'
    | string;
  motivation:
    | 'Financial'
    | 'Espionage'
    | 'Disruption'
    | 'Data Theft'
    | 'Coercion'
    | 'Market Disruption & Financial'
    | 'Financial (Card Resale)'
    | 'IP Theft & Strategic Advantage'
    | 'Financial / Revenge'
    | 'Data Theft & Ransom'
    | string;
  typicalContactFrequency: string;
}

export interface SqlQueryResult {
  columns: string[];
  values: any[][];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}
