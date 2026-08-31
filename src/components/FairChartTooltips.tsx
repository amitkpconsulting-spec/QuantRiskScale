import React from 'react';
import { formatAmount } from '../utils/distributions';
import { PercentileStats } from '../types/fair';
import { Info, AlertTriangle, ShieldCheck, TrendingDown, Target, Activity } from 'lucide-react';

interface HistogramTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  currency: string;
  unitScale: number;
  totalTrials: number;
  stats: PercentileStats;
  proposedStats?: PercentileStats;
}

export const HistogramCustomTooltip: React.FC<HistogramTooltipProps> = ({
  active,
  payload,
  label,
  currency,
  unitScale,
  totalTrials,
  stats,
  proposedStats
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const count = data.count || 0;
  const countPct = totalTrials > 0 ? (count / totalTrials) * 100 : 0;
  const cumFreq = data.cumulativeFrequency !== undefined ? data.cumulativeFrequency : 0;
  const binMin = data.binMin || 0;
  const binMax = data.binMax || 0;
  const midPoint = (binMin + binMax) / 2;

  // Determine Open FAIR quantile zone
  let zoneTitle = '';
  let zoneBadge = '';
  let zoneColor = '';
  let zoneExplanation = '';
  let isVarThreshold = false;

  if (midPoint <= stats.p10) {
    zoneTitle = 'P10 Zone (Low Loss Floor)';
    zoneBadge = '≤ 10th Percentile';
    zoneColor = 'text-cyan-400 bg-cyan-950/80 border-cyan-700/60';
    zoneExplanation = 'In Open FAIR, 90% of simulated years result in losses greater than this. Represents favorable baseline containment or low-frequency operational periods.';
  } else if (midPoint <= stats.p50) {
    zoneTitle = 'P10–P50 Sub-Median Range';
    zoneBadge = '10th–50th Percentile';
    zoneColor = 'text-blue-400 bg-blue-950/80 border-blue-700/60';
    zoneExplanation = 'Routine operational loss outcomes below the statistical median (P50). Represents minor security incidents with limited secondary stakeholder impact.';
  } else if (midPoint <= stats.p90) {
    zoneTitle = 'P50–P90 Range (Median to VaR)';
    zoneBadge = '50th–90th Percentile';
    zoneColor = 'text-amber-400 bg-amber-950/80 border-amber-700/60';
    zoneExplanation = 'Realistic adverse loss envelope. P50 is the 50/50 expected midpoint; losses here involve confirmed secondary loss cascades (forensics, response, customer notifications).';
  } else if (midPoint <= stats.p95) {
    zoneTitle = 'P90–P95 Range (Value at Risk - VaR)';
    zoneBadge = '90th–95th Percentile';
    zoneColor = 'text-rose-400 bg-rose-950/80 border-rose-700/60';
    zoneExplanation = 'Open FAIR Value at Risk (VaR 90th). Only a 10% annual probability of losses reaching or exceeding this tier. Primary governance benchmark for setting cyber capital reserves.';
    isVarThreshold = true;
  } else {
    zoneTitle = 'P95+ Severe Tail & Catastrophe';
    zoneBadge = '95th–99th+ Percentile';
    zoneColor = 'text-red-400 bg-red-950/90 border-red-700/80';
    zoneExplanation = 'Severe tail loss envelope (1-in-20 to 1-in-100 year event). Represents multi-factor compounding catastrophic loss with heavy regulatory fines, lawsuits, and brand erosion.';
  }

  return (
    <div className="bg-[#09090b]/95 backdrop-blur-md border border-zinc-700/90 rounded-xl p-4 shadow-2xl font-mono text-xs max-w-sm pointer-events-none z-50 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2.5">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">Simulated Annual Loss Bin</span>
          <span className="text-sm font-black text-white">{label || formatAmount(midPoint, currency, unitScale)}</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${zoneColor}`}>
          {zoneBadge}
        </span>
      </div>

      {/* Trial Count and Cumulative Stats */}
      <div className="grid grid-cols-2 gap-2 bg-[#050505] p-2.5 rounded-lg border border-zinc-800/80 mb-2.5">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Trial Frequency</span>
          <span className="text-cyan-300 font-bold text-xs">{count.toLocaleString()} trials</span>
          <span className="text-[10px] text-zinc-400 ml-1">({countPct.toFixed(1)}%)</span>
        </div>
        <div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Cumulative Prob.</span>
          <span className="text-rose-400 font-bold text-xs">{cumFreq.toFixed(1)}% ≤ Bin</span>
        </div>
      </div>

      {/* Open FAIR Percentile Interpretation Box */}
      <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-700/80 space-y-1.5">
        <div className="flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-[11px] font-bold text-zinc-200 font-display uppercase tracking-wider">{zoneTitle}</span>
        </div>
        <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
          {zoneExplanation}
        </p>
      </div>

      {/* Key Percentiles Quick Reference Anchor Bar */}
      <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
        <div>
          <span className="text-zinc-400">P10: </span>
          <span className="text-zinc-200 font-bold">{formatAmount(stats.p10, currency, unitScale)}</span>
        </div>
        <div>
          <span className="text-zinc-400">P50: </span>
          <span className="text-cyan-300 font-bold">{formatAmount(stats.p50, currency, unitScale)}</span>
        </div>
        <div>
          <span className="text-zinc-400">P90: </span>
          <span className="text-amber-300 font-bold">{formatAmount(stats.p90, currency, unitScale)}</span>
        </div>
        <div>
          <span className="text-zinc-400">P95: </span>
          <span className="text-rose-300 font-bold">{formatAmount(stats.p95, currency, unitScale)}</span>
        </div>
      </div>
    </div>
  );
};

interface LecTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  currency: string;
  unitScale: number;
  stats: PercentileStats;
  proposedStats?: PercentileStats;
  targetPercentile?: number;
}

export const LecCustomTooltip: React.FC<LecTooltipProps> = ({
  active,
  payload,
  label,
  currency,
  unitScale,
  stats,
  proposedStats,
  targetPercentile = 90
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const lossAmount = data.lossAmount || 0;
  const currentProb = data.probabilityExceeding !== undefined ? data.probabilityExceeding : 0;
  const proposedProb = data.proposedProbabilityExceeding !== undefined ? data.proposedProbabilityExceeding : null;
  const cumPct = data.cumulativePercentage || ((1 - currentProb) * 100);

  // Return return period: 1 / prob
  const returnPeriodYears = currentProb > 0 ? (1 / currentProb).toFixed(1) : '> 1,000';

  // Open FAIR Milestone categorization
  let milestoneBadge = '';
  let milestoneTitle = '';
  let milestoneColor = 'text-cyan-400 bg-cyan-950 border-cyan-800';
  let milestoneDesc = '';

  if (currentProb >= 0.85) {
    milestoneTitle = 'P10 Baseline Floor (~90% Exceedance)';
    milestoneBadge = 'P10 Region';
    milestoneColor = 'text-cyan-400 bg-cyan-950 border-cyan-700';
    milestoneDesc = `In Open FAIR, ${(currentProb * 100).toFixed(0)}% of simulated operational years will exceed this loss. Represents routine, low-impact baseline operational noise.`;
  } else if (currentProb >= 0.45 && currentProb <= 0.55) {
    milestoneTitle = 'P50 True Median (50% Exceedance)';
    milestoneBadge = 'P50 (Median)';
    milestoneColor = 'text-blue-400 bg-blue-950 border-blue-700';
    milestoneDesc = 'True midpoint expected outcome: exactly 50% chance annual losses will exceed this threshold in any given operational year.';
  } else if (currentProb >= 0.08 && currentProb <= 0.12) {
    milestoneTitle = 'P90 Value at Risk (~10% Exceedance)';
    milestoneBadge = 'P90 (VaR)';
    milestoneColor = 'text-amber-400 bg-amber-950 border-amber-700';
    milestoneDesc = 'Open FAIR VaR benchmark: 90% confidence that annual losses will NOT exceed this level. Represents a 1-in-10 year event envelope.';
  } else if (currentProb >= 0.03 && currentProb <= 0.07) {
    milestoneTitle = 'P95 Tail Risk (~5% Exceedance)';
    milestoneBadge = 'P95 (Tail Risk)';
    milestoneColor = 'text-rose-400 bg-rose-950 border-rose-700';
    milestoneDesc = 'Severe 1-in-20 year loss event. Primary and secondary controls fail, causing compounded customer and regulatory fallout.';
  } else if (currentProb <= 0.02) {
    milestoneTitle = 'P99 Extreme Tail (< 2% Exceedance)';
    milestoneBadge = 'P99 (Extreme Tail)';
    milestoneColor = 'text-red-400 bg-red-950 border-red-700';
    milestoneDesc = 'Extreme tail risk (< 1-in-50 year event) used for capital solvency modeling and stress-testing cyber catastrophe response.';
  } else if (currentProb > 0.5) {
    milestoneTitle = `${cumPct.toFixed(0)}th Percentile Loss Level`;
    milestoneBadge = `P${cumPct.toFixed(0)}`;
    milestoneColor = 'text-zinc-300 bg-zinc-900 border-zinc-700';
    milestoneDesc = `There is a ${(currentProb * 100).toFixed(1)}% annual probability that losses will surpass ${formatAmount(lossAmount, currency, unitScale)}.`;
  } else {
    milestoneTitle = `${cumPct.toFixed(0)}th Percentile Loss Level`;
    milestoneBadge = `P${cumPct.toFixed(0)}`;
    milestoneColor = 'text-amber-300 bg-amber-950/60 border-amber-700/60';
    milestoneDesc = `There is a ${(currentProb * 100).toFixed(1)}% probability per year (approx 1 in ${returnPeriodYears} years) of surpassing this loss.`;
  }

  return (
    <div className="bg-[#09090b]/95 backdrop-blur-md border border-zinc-700/90 rounded-xl p-4 shadow-2xl font-mono text-xs max-w-sm pointer-events-none z-50 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2.5">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">Annual Loss Exceedance Point</span>
          <span className="text-sm font-black text-white">{data.formattedLoss || formatAmount(lossAmount, currency, unitScale)}</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${milestoneColor}`}>
          {milestoneBadge}
        </span>
      </div>

      {/* Probabilities & Return Period */}
      <div className="grid grid-cols-2 gap-2 bg-[#050505] p-2.5 rounded-lg border border-zinc-800/80 mb-2.5">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Exceedance Likelihood</span>
          <span className="text-rose-400 font-bold text-xs">{(currentProb * 100).toFixed(1)}%</span>
          <span className="text-[10px] text-zinc-400 block font-sans">1-in-{returnPeriodYears} yrs</span>
        </div>
        <div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Percentile Equivalent</span>
          <span className="text-cyan-300 font-bold text-xs">{cumPct.toFixed(1)}%</span>
          <span className="text-[10px] text-zinc-400 block font-sans">P(Loss ≤ x)</span>
        </div>
      </div>

      {/* What-If Comparative Comparison if proposed exists */}
      {proposedProb !== null && (
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-2 mb-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
              <span>Mitigated Proposed Exceedance:</span>
            </span>
            <span className="text-emerald-300 font-bold text-xs">{(proposedProb * 100).toFixed(1)}% probability</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-400 font-bold">
              -{((currentProb - proposedProb) * 100).toFixed(1)}%
            </span>
            <span className="text-[9px] text-zinc-400 block">Prob. Drop</span>
          </div>
        </div>
      )}

      {/* Open FAIR Interpretive Box */}
      <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-700/80 space-y-1.5">
        <div className="flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-[11px] font-bold text-zinc-200 font-display uppercase tracking-wider">{milestoneTitle}</span>
        </div>
        <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
          {milestoneDesc}
        </p>
      </div>

      {/* Open FAIR Percentile Benchmarks */}
      <div className="mt-2.5 pt-2 border-t border-zinc-800/80 grid grid-cols-3 gap-1 text-[10px] text-zinc-400 text-center">
        <div className="bg-zinc-950 p-1 rounded border border-zinc-800">
          <span className="text-zinc-500 block">P10 (90% Ex.)</span>
          <span className="text-zinc-300 font-bold">{formatAmount(stats.p10, currency, unitScale)}</span>
        </div>
        <div className="bg-zinc-950 p-1 rounded border border-zinc-800">
          <span className="text-zinc-500 block">P50 (Median)</span>
          <span className="text-cyan-300 font-bold">{formatAmount(stats.p50, currency, unitScale)}</span>
        </div>
        <div className="bg-zinc-950 p-1 rounded border border-zinc-800">
          <span className="text-zinc-500 block">P90 (VaR)</span>
          <span className="text-amber-300 font-bold">{formatAmount(stats.p90, currency, unitScale)}</span>
        </div>
      </div>
    </div>
  );
};

interface LossFormsTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  currency: string;
  unitScale: number;
}

const LOSS_FORM_DEFINITIONS: Record<string, { title: string; category: string; description: string; primaryExample: string; secondaryExample: string }> = {
  Productivity: {
    title: 'Productivity Loss',
    category: 'Operational Impact',
    description: 'Losses resulting from organizational inability to deliver its normal products or services.',
    primaryExample: 'Factory downtime, offline e-commerce servers, employee idle hours.',
    secondaryExample: 'Customer SLA breach refund penalties, downstream partner stoppage.'
  },
  Response: {
    title: 'Response Loss',
    category: 'Incident Management',
    description: 'Direct expenditures to contain, investigate, remediate, and recover from the security event.',
    primaryExample: 'External incident response team, digital forensics, breach notification vendors.',
    secondaryExample: 'Specialized legal crisis counsel, crisis PR advisors, credit monitoring services.'
  },
  Replacement: {
    title: 'Replacement Loss',
    category: 'Capital Expense',
    description: 'Capital costs required to repair, replace, or re-architect damaged or destroyed physical and digital assets.',
    primaryExample: 'Replacing wiped disk drives, re-imaging compromised servers, rebuilding databases.',
    secondaryExample: 'Accelerated replacement of exposed cryptographic keys, HSM re-provisioning.'
  },
  'Fines & Judg.': {
    title: 'Fines and Judgements',
    category: 'Legal & Regulatory',
    description: 'Monetary penalties levied by regulatory authorities, courts, and contract counterparties.',
    primaryExample: 'Contractual liquidated damages directly stemming from the incident.',
    secondaryExample: 'GDPR/CCPA privacy fines, SEC penalties, class-action consumer litigation settlements.'
  },
  'Comp. Adv.': {
    title: 'Competitive Advantage Loss',
    category: 'Strategic Impact',
    description: 'Erosion of competitive market position due to stolen trade secrets or exposed intellectual property.',
    primaryExample: 'Source code exfiltration, proprietary manufacturing formula leaks.',
    secondaryExample: 'Competitors winning public procurement bids using stolen pricing models.'
  },
  Reputation: {
    title: 'Reputation Loss',
    category: 'Market Perception',
    description: 'Diminished brand value and stakeholder trust leading to customer defection and financial friction.',
    primaryExample: 'Direct cancellation of active customer subscriptions upon disclosure.',
    secondaryExample: 'Elevated customer acquisition costs, stock price degradation, higher debt financing costs.'
  }
};

export const LossFormsCustomTooltip: React.FC<LossFormsTooltipProps> = ({
  active,
  payload,
  label,
  currency,
  unitScale
}) => {
  if (!active || !payload || !payload.length) return null;

  const formKey = label || payload[0]?.payload?.form || 'Productivity';
  const def = LOSS_FORM_DEFINITIONS[formKey] || LOSS_FORM_DEFINITIONS['Productivity'];

  const curPrimary = Number(payload.find(p => p.dataKey === 'Current_Primary')?.value || 0);
  const curSecondary = Number(payload.find(p => p.dataKey === 'Current_Secondary')?.value || 0);
  const propPrimary = Number(payload.find(p => p.dataKey === 'Proposed_Primary')?.value || 0);
  const propSecondary = Number(payload.find(p => p.dataKey === 'Proposed_Secondary')?.value || 0);

  const totalCur = curPrimary + curSecondary;
  const totalProp = propPrimary + propSecondary;

  return (
    <div className="bg-[#09090b]/95 backdrop-blur-md border border-zinc-700/90 rounded-xl p-4 shadow-2xl font-mono text-xs max-w-sm pointer-events-none z-50 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2.5">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">Open FAIR Loss Form</span>
          <span className="text-sm font-black text-white">{def.title}</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase tracking-wider">
          {def.category}
        </span>
      </div>

      {/* Primary vs Secondary Breakdown */}
      <div className="bg-[#050505] p-2.5 rounded-lg border border-zinc-800/80 mb-2.5 space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-cyan-400 flex items-center space-x-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
            <span>Primary Loss (Direct):</span>
          </span>
          <span className="text-white font-bold">{formatAmount(curPrimary, currency, unitScale)}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-rose-400 flex items-center space-x-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
            <span>Secondary Loss (Stakeholder):</span>
          </span>
          <span className="text-white font-bold">{formatAmount(curSecondary, currency, unitScale)}</span>
        </div>
        <div className="flex justify-between items-center text-xs border-t border-zinc-800 pt-1 font-black">
          <span className="text-zinc-300">Total Form Estimate:</span>
          <span className="text-cyan-300">{formatAmount(totalCur, currency, unitScale)}</span>
        </div>
      </div>

      {/* Proposed State if available */}
      {totalProp > 0 && (
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-2 mb-2.5 flex justify-between items-center text-xs">
          <span className="text-emerald-400 font-bold flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 inline" />
            <span>Proposed Mitigated:</span>
          </span>
          <div className="text-right">
            <span className="text-emerald-200 font-bold">{formatAmount(totalProp, currency, unitScale)}</span>
            <span className="text-[10px] text-emerald-400 block">
              -{(((totalCur - totalProp) / Math.max(1, totalCur)) * 100).toFixed(0)}% reduction
            </span>
          </div>
        </div>
      )}

      {/* Definition & Concrete Open FAIR Examples */}
      <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-700/80 space-y-1.5">
        <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
          {def.description}
        </p>
        <div className="text-[10px] text-zinc-400 font-sans border-t border-zinc-800/80 pt-1.5 space-y-1">
          <div>
            <strong className="text-cyan-300 font-mono">Primary: </strong>
            <span>{def.primaryExample}</span>
          </div>
          <div>
            <strong className="text-rose-300 font-mono">Secondary: </strong>
            <span>{def.secondaryExample}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
