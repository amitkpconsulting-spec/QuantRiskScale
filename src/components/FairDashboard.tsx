import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  Clock,
  Database,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Scale,
  FileText,
  Plus,
  HelpCircle,
  BookOpen,
  Sliders
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { FairScenario, SimulationResult } from '../types/fair';
import { formatAmount } from '../utils/distributions';
import { RiskGauge } from './RiskGauge';
import {
  HistogramCustomTooltip,
  LecCustomTooltip,
  LossFormsCustomTooltip
} from './FairChartTooltips';
import { SensitivityTornadoViewer } from './SensitivityTornadoViewer';
import { D3FatTailHistogram } from './D3FatTailHistogram';
import { ThemeToggle } from './ThemeToggle';


interface FairDashboardProps {
  scenario: FairScenario;
  result: SimulationResult | null;
  onRunSimulation: () => void;
  isSimulating: boolean;
  onOpenAiAssistant: () => void;
  onNavigateToBuilder: () => void;
  onOpenPdfModal: () => void;
  onOpenQuickTune?: () => void;
  onOpenNewSimulationModal?: () => void;
  onOpenGlossaryModal?: (term?: string) => void;
}

export const FairDashboard: React.FC<FairDashboardProps> = ({
  scenario,
  result,
  onRunSimulation,
  isSimulating,
  onOpenAiAssistant,
  onNavigateToBuilder,
  onOpenPdfModal,
  onOpenQuickTune,
  onOpenNewSimulationModal,
  onOpenGlossaryModal
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'histogram' | 'lec' | 'forms' | 'sensitivity' | 'heatmap' | 'scatter'>('histogram');
  const [histogramEngine, setHistogramEngine] = useState<'d3' | 'classic'>('d3');
  const [logScaleLec, setLogScaleLec] = useState<boolean>(false);
  const [ciLevel, setCiLevel] = useState<'90' | '80' | '99'>('90');
  const [selectedPercentileGuide, setSelectedPercentileGuide] = useState<'P10' | 'P50' | 'MEAN' | 'P90' | 'P95' | 'P99' | 'CI' | null>('P90');
  const [showPercentileGuideBar, setShowPercentileGuideBar] = useState<boolean>(true);

  if (!result) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
          <Activity className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">No Simulation Results Generated</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Run a quantitative Monte Carlo simulation for <strong>"{scenario.name}"</strong> to compute Annualized Loss Exposure, Value at Risk, and loss distributions.
        </p>
        <button
          onClick={onRunSimulation}
          disabled={isSimulating}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-950/50 flex items-center space-x-2 transition-all active:scale-98"
        >
          <Zap className="w-4 h-4" />
          <span>Execute {scenario.simulationsCount.toLocaleString()} Trial Monte Carlo</span>
        </button>
      </div>
    );
  }

  const cur = result.currentStats;
  const prop = result.proposedStats;
  const targetPct = scenario.riskTolerance.targetPercentile || 90;
  const targetLoss = targetPct === 95 ? cur.p95 : cur.p90;
  const propTargetLoss = prop ? (targetPct === 95 ? prop.p95 : prop.p90) : undefined;

  // Helper for dynamic confidence interval bounds
  const getCiBounds = (stats: { p05?: number; p10: number; p50: number; mean: number; p90: number; p95: number; p99: number; min: number; max: number }) => {
    if (ciLevel === '80') {
      return { lower: stats.p10, upper: stats.p90, label: '80% CI (10th–90th)' };
    }
    if (ciLevel === '99') {
      return { lower: stats.min, upper: stats.p99, label: '99% CI (Min–99th)' };
    }
    // Default 90% CI (5th to 95th Percentile)
    const lower = stats.p05 !== undefined ? stats.p05 : stats.p10;
    const upper = stats.p95;
    return { lower, upper, label: '90% CI (5th–95th)' };
  };

  const aleCi = getCiBounds(cur);
  const propCi = prop ? getCiBounds(prop) : null;
  const lefCi = getCiBounds(result.currentLefStats);
  const downtimeCi = getCiBounds(result.currentDowntimeStats);
  const dataLossCi = getCiBounds(result.currentDataLossStats);

  // Primary vs Secondary breakdown for charts
  const lossFormsData = [
    {
      form: 'Productivity',
      Current_Primary: scenario.current.primaryLoss.productivity.mode,
      Current_Secondary: scenario.current.secondaryLoss.productivity.mode,
      Proposed_Primary: scenario.proposed?.primaryLoss.productivity.mode || 0,
      Proposed_Secondary: scenario.proposed?.secondaryLoss.productivity.mode || 0
    },
    {
      form: 'Response',
      Current_Primary: scenario.current.primaryLoss.response.mode,
      Current_Secondary: scenario.current.secondaryLoss.response.mode,
      Proposed_Primary: scenario.proposed?.primaryLoss.response.mode || 0,
      Proposed_Secondary: scenario.proposed?.secondaryLoss.response.mode || 0
    },
    {
      form: 'Replacement',
      Current_Primary: scenario.current.primaryLoss.replacement.mode,
      Current_Secondary: scenario.current.secondaryLoss.replacement.mode,
      Proposed_Primary: scenario.proposed?.primaryLoss.replacement.mode || 0,
      Proposed_Secondary: scenario.proposed?.secondaryLoss.replacement.mode || 0
    },
    {
      form: 'Fines & Judg.',
      Current_Primary: scenario.current.primaryLoss.finesAndJudgements.mode,
      Current_Secondary: scenario.current.secondaryLoss.finesAndJudgements.mode,
      Proposed_Primary: scenario.proposed?.primaryLoss.finesAndJudgements.mode || 0,
      Proposed_Secondary: scenario.proposed?.secondaryLoss.finesAndJudgements.mode || 0
    },
    {
      form: 'Comp. Adv.',
      Current_Primary: scenario.current.primaryLoss.competitiveAdvantage.mode,
      Current_Secondary: scenario.current.secondaryLoss.competitiveAdvantage.mode,
      Proposed_Primary: scenario.proposed?.primaryLoss.competitiveAdvantage.mode || 0,
      Proposed_Secondary: scenario.proposed?.secondaryLoss.competitiveAdvantage.mode || 0
    },
    {
      form: 'Reputation',
      Current_Primary: scenario.current.primaryLoss.reputation.mode,
      Current_Secondary: scenario.current.secondaryLoss.reputation.mode,
      Proposed_Primary: scenario.proposed?.primaryLoss.reputation.mode || 0,
      Proposed_Secondary: scenario.proposed?.secondaryLoss.reputation.mode || 0
    }
  ];

  return (
    <div className="p-3.5 sm:p-5 lg:p-6 w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-5">
      {/* Scenario Header Overview */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1.5 font-mono">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-cyan-400 border border-zinc-700">
                {scenario.category}
              </span>
              <span className="text-xs text-zinc-400 font-medium">ASSET: <strong className="text-white font-bold">{scenario.asset}</strong></span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-400 font-medium">THREAT: <strong className="text-white font-bold">{scenario.threatCommunity}</strong></span>
            </div>
            <h2 className="text-2xl font-black font-display text-white tracking-tight uppercase">{scenario.name}</h2>
            <p className="text-xs text-zinc-400 max-w-3xl mt-1 leading-relaxed font-sans">{scenario.description}</p>
          </div>

          <div className="flex items-center space-x-2.5 self-start md:self-auto shrink-0 font-mono">
            {onOpenQuickTune && (
              <button
                onClick={onOpenQuickTune}
                className="px-3 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-sm"
                title="Quick Tune Parameters in Drawer"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tune Model</span>
              </button>
            )}
            <button
              onClick={onOpenAiAssistant}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors"
              title="Open AI Risk Advisory"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Advisory</span>
            </button>
            <button
              onClick={onNavigateToBuilder}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black border border-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-sm"
              title="Open Full Modeling Lab"
            >
              <span>Full Lab</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Uncertainty & Confidence Interval Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-3 font-mono text-xs shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-700/50 text-cyan-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <span>Risk Uncertainty & Confidence Range</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                {ciLevel === '90' ? '90% CI (5th–95th)' : ciLevel === '80' ? '80% CI (10th–90th)' : '99% CI (Min–99th)'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
              Reflecting empirical Beta-PERT parameter dispersion across {result.trialsCount.toLocaleString()} Monte Carlo operational years.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#050505] p-1 rounded-lg border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setCiLevel('90')}
            className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
              ciLevel === '90'
                ? 'bg-cyan-500 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Standard Open FAIR 90% Confidence Interval (5th to 95th Percentile)"
          >
            <span>90% CI (5th–95th)</span>
          </button>
          <button
            onClick={() => setCiLevel('80')}
            className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
              ciLevel === '80'
                ? 'bg-cyan-500 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="80% Confidence Interval (10th to 90th Percentile)"
          >
            <span>80% CI (10th–90th)</span>
          </button>
          <button
            onClick={() => setCiLevel('99')}
            className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
              ciLevel === '99'
                ? 'bg-cyan-500 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="99% Extreme Tail Range (Min to 99th Percentile)"
          >
            <span>99% Extreme</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards with Confidence Interval Bounds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Expected ALE (Mean) with CI */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider font-mono mb-2">
              <span>Annualized Loss (ALE Mean)</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {formatAmount(cur.mean, scenario.currency, scenario.unitScale)}
              <span className="text-xs font-bold text-zinc-400 ml-1">/yr</span>
            </div>

            {/* Confidence Interval Range Badge */}
            <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700/60 font-mono text-xs">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex justify-between items-center">
                <span>{aleCi.label} Range</span>
                <span className="text-zinc-500">±{(( (aleCi.upper - aleCi.lower) / Math.max(1, cur.mean) ) * 50).toFixed(0)}% dispersion</span>
              </div>
              <div className="text-zinc-200 font-bold text-[11px] mt-0.5">
                [{formatAmount(aleCi.lower, scenario.currency, scenario.unitScale)} — {formatAmount(aleCi.upper, scenario.currency, scenario.unitScale)}]
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 mt-3 flex items-center justify-between border-t border-zinc-800 pt-2 font-mono uppercase tracking-wider">
            <span>Median (p50): {formatAmount(cur.p50, scenario.currency, scenario.unitScale)}</span>
            <span>Max: {formatAmount(cur.max, scenario.currency, scenario.unitScale)}</span>
          </div>
        </div>

        {/* 2. Value at Risk (VaR 90th / 95th) with CI */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider font-mono mb-2">
              <span>Value at Risk (VaR {targetPct}%)</span>
              <AlertOctagon className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
              {formatAmount(targetLoss, scenario.currency, scenario.unitScale)}
            </div>

            {/* VaR Tail Confidence Bounds */}
            <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-amber-950/30 border border-amber-800/50 font-mono text-xs">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex justify-between items-center">
                <span>Tail Loss Envelope</span>
                <span className="text-amber-500/80">95th–99th</span>
              </div>
              <div className="text-amber-200 font-bold text-[11px] mt-0.5">
                [{formatAmount(cur.p95, scenario.currency, scenario.unitScale)} — {formatAmount(cur.p99, scenario.currency, scenario.unitScale)}]
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 mt-3 flex items-center justify-between border-t border-zinc-800 pt-2 font-mono uppercase tracking-wider">
            <span>5th: {formatAmount(cur.p05, scenario.currency, scenario.unitScale)}</span>
            <span>95th: {formatAmount(cur.p95, scenario.currency, scenario.unitScale)}</span>
          </div>
        </div>

        {/* 3. Loss Event Frequency (LEF) with CI */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider font-mono mb-2">
              <span>Loss Frequency (LEF)</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {result.currentLefStats.mean.toFixed(2)}
              <span className="text-xs font-bold text-zinc-400 ml-1">events/yr</span>
            </div>

            {/* LEF Confidence Interval Range Badge */}
            <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50 font-mono text-xs">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex justify-between items-center">
                <span>{lefCi.label}</span>
                <span className="text-emerald-500/80">Frequency</span>
              </div>
              <div className="text-emerald-200 font-bold text-[11px] mt-0.5">
                [{lefCi.lower.toFixed(2)} — {lefCi.upper.toFixed(2)} events/yr]
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 mt-3 flex items-center justify-between border-t border-zinc-800 pt-2 font-mono uppercase tracking-wider">
            <span>TEF: {result.currentBranchCalculations.tefMean.toFixed(1)}/yr</span>
            <span>Vuln: {result.currentBranchCalculations.vulnMeanPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* 4. What-If Mitigation or Operational Downtime with CI */}
        {scenario.hasProposed && prop && propCi ? (
          <div className="bg-[#09090b] border border-cyan-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-cyan-300 text-xs font-bold uppercase tracking-wider font-mono mb-2">
                <span>Proposed Mitigation</span>
                <TrendingDown className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-cyan-300 font-mono tracking-tight">
                -{result.riskReductionPct}%
                <span className="text-xs font-bold text-zinc-400 ml-1">
                  ({formatAmount(result.riskReductionDollar || 0, scenario.currency, scenario.unitScale)})
                </span>
              </div>

              {/* Residual Confidence Interval Range Badge */}
              <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 font-mono text-xs">
                <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider flex justify-between items-center">
                  <span>Residual {propCi.label}</span>
                  <span className="text-cyan-400/80">Post-Control</span>
                </div>
                <div className="text-cyan-100 font-bold text-[11px] mt-0.5">
                  [{formatAmount(propCi.lower, scenario.currency, scenario.unitScale)} — {formatAmount(propCi.upper, scenario.currency, scenario.unitScale)}]
                </div>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 mt-3 flex items-center justify-between border-t border-zinc-800 pt-2 font-mono uppercase tracking-wider">
              <span>Residual ALE: {formatAmount(prop.mean, scenario.currency, scenario.unitScale)}</span>
              <span className="text-emerald-400 font-bold">ROSI: {result.returnOnControlInvestment ? `${result.returnOnControlInvestment.toFixed(0)}%` : 'N/A'}</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider font-mono mb-2">
                <span>Operational Downtime</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-cyan-400 font-mono tracking-tight">
                {result.currentDowntimeStats.mean.toFixed(1)}
                <span className="text-xs font-bold text-zinc-400 ml-1">hours/yr</span>
              </div>

              {/* Downtime Confidence Interval Range Badge */}
              <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700/60 font-mono text-xs">
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex justify-between items-center">
                  <span>{downtimeCi.label}</span>
                  <span className="text-zinc-500">Downtime</span>
                </div>
                <div className="text-zinc-200 font-bold text-[11px] mt-0.5">
                  [{downtimeCi.lower.toFixed(1)} — {downtimeCi.upper.toFixed(1)} hrs/yr]
                </div>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 mt-3 flex items-center justify-between border-t border-zinc-800 pt-2 font-mono uppercase tracking-wider">
              <span>p90: {result.currentDowntimeStats.p90.toFixed(1)} hrs</span>
              <span>Data CI: [{dataLossCi.lower.toFixed(0)}k–{dataLossCi.upper.toFixed(0)}k]</span>
            </div>
          </div>
        )}
      </div>

      {/* Uncertainty & Confidence Range Matrix Panel */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center space-x-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Multi-Variable Confidence Interval Matrix (5th–95th Percentile)</span>
            </h3>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Empirical low-probability to high-probability boundaries showing true quantitative risk dispersion.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800/80 self-start sm:self-auto">
            90% Data Confidence Band
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          {/* Row 1: Total Annualized Loss Exposure */}
          <div className="bg-[#050505] p-3.5 rounded-lg border border-zinc-800/90 space-y-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="font-bold text-white uppercase tracking-wider">Annualized Loss (ALE)</span>
              <span className="text-[10px] text-cyan-400 font-bold">Total Inherent</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500 text-[11px]">5th Percentile:</span>
              <span className="text-zinc-300 font-bold">{formatAmount(cur.p05, scenario.currency, scenario.unitScale)}</span>
            </div>
            <div className="flex justify-between items-baseline bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900/40">
              <span className="text-cyan-300 font-bold text-[11px]">Expected Mean:</span>
              <span className="text-cyan-200 font-black">{formatAmount(cur.mean, scenario.currency, scenario.unitScale)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500 text-[11px]">95th Percentile:</span>
              <span className="text-rose-400 font-bold">{formatAmount(cur.p95, scenario.currency, scenario.unitScale)}</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500 h-full rounded-full w-full"></div>
            </div>
          </div>

          {/* Row 2: Primary Loss Magnitude (PLM) */}
          <div className="bg-[#050505] p-3.5 rounded-lg border border-zinc-800/90 space-y-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="font-bold text-white uppercase tracking-wider">Primary Loss (PLM)</span>
              <span className="text-[10px] text-emerald-400 font-bold">Direct Event</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500 text-[11px]">5th Percentile:</span>
              <span className="text-zinc-300 font-bold">{formatAmount(result.currentPrimaryStats.p05, scenario.currency, scenario.unitScale)}</span>
            </div>
            <div className="flex justify-between items-baseline bg-zinc-900/70 px-2 py-1 rounded border border-zinc-700/40">
              <span className="text-zinc-300 font-bold text-[11px]">Expected Mean:</span>
              <span className="text-white font-black">{formatAmount(result.currentBranchCalculations.plmMean, scenario.currency, scenario.unitScale)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500 text-[11px]">95th Percentile:</span>
              <span className="text-rose-400 font-bold">{formatAmount(result.currentPrimaryStats.p95, scenario.currency, scenario.unitScale)}</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-cyan-500 h-full rounded-full w-4/5"></div>
            </div>
          </div>

          {/* Row 3: Secondary Loss Magnitude (SLM) */}
          <div className="bg-[#050505] p-3.5 rounded-lg border border-zinc-800/90 space-y-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="font-bold text-white uppercase tracking-wider">Secondary Loss (SLM)</span>
              <span className="text-[10px] text-rose-400 font-bold">Stakeholder Chain</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500 text-[11px]">5th Percentile:</span>
              <span className="text-zinc-300 font-bold">{formatAmount(result.currentSecondaryStats.p05, scenario.currency, scenario.unitScale)}</span>
            </div>
            <div className="flex justify-between items-baseline bg-zinc-900/70 px-2 py-1 rounded border border-zinc-700/40">
              <span className="text-zinc-300 font-bold text-[11px]">Expected Mean:</span>
              <span className="text-white font-black">{formatAmount(result.currentBranchCalculations.slmMean, scenario.currency, scenario.unitScale)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500 text-[11px]">95th Percentile:</span>
              <span className="text-rose-400 font-bold">{formatAmount(result.currentSecondaryStats.p95, scenario.currency, scenario.unitScale)}</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-rose-500 h-full rounded-full w-3/4"></div>
            </div>
          </div>

          {/* Row 4: Loss Event Frequency (LEF) */}
          <div className="bg-[#050505] p-3.5 rounded-lg border border-zinc-800/90 space-y-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="font-bold text-white uppercase tracking-wider">Loss Frequency (LEF)</span>
              <span className="text-[10px] text-emerald-400 font-bold">Annual Rate</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500 text-[11px]">5th Percentile:</span>
              <span className="text-zinc-300 font-bold">{result.currentLefStats.p05.toFixed(2)} /yr</span>
            </div>
            <div className="flex justify-between items-baseline bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/40">
              <span className="text-emerald-300 font-bold text-[11px]">Expected Mean:</span>
              <span className="text-emerald-200 font-black">{result.currentLefStats.mean.toFixed(2)} /yr</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500 text-[11px]">95th Percentile:</span>
              <span className="text-amber-400 font-bold">{result.currentLefStats.p95.toFixed(2)} /yr</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-emerald-500 h-full rounded-full w-2/3"></div>
            </div>
          </div>

          {/* Row 5: Operational Downtime */}
          <div className="bg-[#050505] p-3.5 rounded-lg border border-zinc-800/90 space-y-2">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="font-bold text-white uppercase tracking-wider">Downtime Outage</span>
              <span className="text-[10px] text-cyan-400 font-bold">Service Hours</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500 text-[11px]">5th Percentile:</span>
              <span className="text-zinc-300 font-bold">{result.currentDowntimeStats.p05.toFixed(1)} hrs</span>
            </div>
            <div className="flex justify-between items-baseline bg-zinc-900/70 px-2 py-1 rounded border border-zinc-700/40">
              <span className="text-zinc-300 font-bold text-[11px]">Expected Mean:</span>
              <span className="text-white font-black">{result.currentDowntimeStats.mean.toFixed(1)} hrs</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500 text-[11px]">95th Percentile:</span>
              <span className="text-rose-400 font-bold">{result.currentDowntimeStats.p95.toFixed(1)} hrs</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-cyan-500 h-full rounded-full w-3/5"></div>
            </div>
          </div>

          {/* Row 6: Records Compromised / Residual ALE */}
          {scenario.hasProposed && prop ? (
            <div className="bg-[#050505] p-3.5 rounded-lg border border-cyan-800/60 space-y-2">
              <div className="flex justify-between items-center text-zinc-400">
                <span className="font-bold text-white uppercase tracking-wider">Residual ALE (Mitigated)</span>
                <span className="text-[10px] text-cyan-300 font-bold">Post-Safeguard</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-zinc-500 text-[11px]">5th Percentile:</span>
                <span className="text-zinc-300 font-bold">{formatAmount(prop.p05, scenario.currency, scenario.unitScale)}</span>
              </div>
              <div className="flex justify-between items-baseline bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/50">
                <span className="text-cyan-300 font-bold text-[11px]">Residual Mean:</span>
                <span className="text-cyan-100 font-black">{formatAmount(prop.mean, scenario.currency, scenario.unitScale)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-zinc-500 text-[11px]">95th Percentile:</span>
                <span className="text-cyan-300 font-bold">{formatAmount(prop.p95, scenario.currency, scenario.unitScale)}</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-cyan-400 h-full rounded-full w-1/2"></div>
              </div>
            </div>
          ) : (
            <div className="bg-[#050505] p-3.5 rounded-lg border border-zinc-800/90 space-y-2">
              <div className="flex justify-between items-center text-zinc-400">
                <span className="font-bold text-white uppercase tracking-wider">Data Loss Volume</span>
                <span className="text-[10px] text-amber-400 font-bold">Records Exposure</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-zinc-500 text-[11px]">5th Percentile:</span>
                <span className="text-zinc-300 font-bold">{(result.currentDataLossStats.p05).toFixed(0)}k records</span>
              </div>
              <div className="flex justify-between items-baseline bg-zinc-900/70 px-2 py-1 rounded border border-zinc-700/40">
                <span className="text-zinc-300 font-bold text-[11px]">Expected Mean:</span>
                <span className="text-white font-black">{(result.currentDataLossStats.mean).toFixed(0)}k records</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-zinc-500 text-[11px]">95th Percentile:</span>
                <span className="text-rose-400 font-bold">{(result.currentDataLossStats.p95).toFixed(0)}k records</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-amber-500 h-full rounded-full w-2/3"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle Row: Risk Gauge Dial + Loss Distribution / Exceedance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Open FAIR Risk Dial */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
          <RiskGauge
            value={targetLoss}
            scale={scenario.riskTolerance}
            currency={scenario.currency}
            unitScale={scenario.unitScale}
            rating={result.currentRiskRating}
            proposedValue={propTargetLoss}
            proposedRating={result.proposedRiskRating}
            hasProposed={scenario.hasProposed && !!result.proposedStats}
            title="Open FAIR Risk Appetite Dial"
            subtitle={`Target Metric: ${targetPct}th Percentile Value-at-Risk`}
            onOpenGlossaryModal={onOpenGlossaryModal}
          />

          {/* Quick Quantitative FAIR Decomposition Summary */}
          <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-lg space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between font-mono">
              <span className="font-display font-bold text-white">Ontology Calculation</span>
              <div className="flex items-center space-x-2">
                {onOpenGlossaryModal && (
                  <button
                    onClick={() => onOpenGlossaryModal()}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold underline decoration-dotted"
                    title="Lookup FAIR Ontology Formulas & Shortforms"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Lexicon</span>
                  </button>
                )}
                <span className="text-[10px] text-zinc-500 font-mono">{result.trialsCount.toLocaleString()} trials</span>
              </div>
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-800">
                <div>
                  <span className="text-zinc-400 uppercase tracking-wider text-[11px] block">Primary Loss (PLM)</span>
                  <span className="text-[10px] text-zinc-500">CI: [{formatAmount(result.currentPrimaryStats.p05, scenario.currency, scenario.unitScale)} - {formatAmount(result.currentPrimaryStats.p95, scenario.currency, scenario.unitScale)}]</span>
                </div>
                <span className="text-white font-bold">{formatAmount(result.currentBranchCalculations.plmMean, scenario.currency, scenario.unitScale)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-800">
                <div>
                  <span className="text-zinc-400 uppercase tracking-wider text-[11px] block">Secondary Loss (SLM)</span>
                  <span className="text-[10px] text-zinc-500">CI: [{formatAmount(result.currentSecondaryStats.p05, scenario.currency, scenario.unitScale)} - {formatAmount(result.currentSecondaryStats.p95, scenario.currency, scenario.unitScale)}]</span>
                </div>
                <span className="text-white font-bold">{formatAmount(result.currentBranchCalculations.slmMean, scenario.currency, scenario.unitScale)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-800">
                <div>
                  <span className="text-zinc-400 uppercase tracking-wider text-[11px] block">Loss Frequency (LEF)</span>
                  <span className="text-[10px] text-zinc-500">CI: [{result.currentLefStats.p05.toFixed(2)} - {result.currentLefStats.p95.toFixed(2)}/yr]</span>
                </div>
                <span className="text-white font-bold">{result.currentLefStats.mean.toFixed(2)}/yr</span>
              </div>
              <div className="flex justify-between items-center py-1.5 text-cyan-300 font-bold pt-2">
                <span className="uppercase tracking-wider text-[11px]">Primary vs Sec. ALE</span>
                <span>
                  {formatAmount(result.currentBranchCalculations.primaryAleMean, scenario.currency, scenario.unitScale)} / {formatAmount(result.currentBranchCalculations.secondaryAleMean, scenario.currency, scenario.unitScale)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Charts Panel */}
        <div className="lg:col-span-2 bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
          {/* Chart Tabs & Open FAIR Percentile Guide Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center space-x-1.5 bg-[#050505] p-1 rounded-lg border border-zinc-800 font-display">
              <button
                onClick={() => setActiveChartTab('histogram')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  activeChartTab === 'histogram'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Loss Distribution
              </button>
              <button
                onClick={() => setActiveChartTab('lec')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  activeChartTab === 'lec'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Loss Exceedance (LEC)
              </button>
              <button
                onClick={() => setActiveChartTab('forms')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  activeChartTab === 'forms'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Loss Forms Breakdown
              </button>
              <button
                onClick={() => setActiveChartTab('sensitivity')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  activeChartTab === 'sensitivity'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sensitivity &amp; Tornado
              </button>
              <button
                onClick={() => setActiveChartTab('heatmap')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  activeChartTab === 'heatmap'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Risk Heatmap
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {activeChartTab === 'histogram' && (
                <div className="flex items-center space-x-1 bg-[#050505] p-1 rounded-lg border border-zinc-800 text-[11px] font-mono">
                  <button
                    onClick={() => setHistogramEngine('d3')}
                    className={`px-2.5 py-1 rounded font-bold uppercase transition-all flex items-center space-x-1.5 ${
                      histogramEngine === 'd3'
                        ? 'bg-cyan-500 text-black font-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="D3.js Interactive Kernel Density & Fat-Tail Analyzer"
                  >
                    <Activity className="w-3 h-3 text-current" />
                    <span>D3 Density &amp; Fat Tail</span>
                  </button>
                  <button
                    onClick={() => setHistogramEngine('classic')}
                    className={`px-2.5 py-1 rounded font-bold uppercase transition-all ${
                      histogramEngine === 'classic'
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Classic Recharts Histogram"
                  >
                    Classic Bins
                  </button>
                </div>
              )}

              {activeChartTab === 'lec' && (
                <label className="flex items-center space-x-2 text-xs text-zinc-400 font-mono cursor-pointer uppercase">
                  <input
                    type="checkbox"
                    checked={logScaleLec}
                    onChange={(e) => setLogScaleLec(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Log Scale</span>
                </label>
              )}

              <button
                onClick={() => setShowPercentileGuideBar(!showPercentileGuideBar)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider border flex items-center space-x-1.5 transition-all ${
                  showPercentileGuideBar
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
                title="Toggle Open FAIR Percentiles Explainer Guide"
              >
                <BookOpen className="w-3 h-3 text-cyan-400" />
                <span>FAIR Percentile Guide</span>
              </button>
            </div>
          </div>

          {/* Interactive Open FAIR Percentile Explorer Pills */}
          {showPercentileGuideBar && (
            <div className="mb-3 p-3 bg-[#050505] rounded-lg border border-zinc-800/90 text-xs font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Interactive Open FAIR Percentile Definitions:</span>
                </span>
                <span className="text-[10px] text-zinc-400">Click any percentile to inspect meaning</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedPercentileGuide(selectedPercentileGuide === 'P10' ? null : 'P10')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                    selectedPercentileGuide === 'P10'
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-sm'
                      : 'bg-zinc-900/90 text-cyan-400 border-zinc-700 hover:border-cyan-600/60'
                  }`}
                >
                  P10 ({formatAmount(cur.p10, scenario.currency, scenario.unitScale)})
                </button>
                <button
                  onClick={() => setSelectedPercentileGuide(selectedPercentileGuide === 'P50' ? null : 'P50')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                    selectedPercentileGuide === 'P50'
                      ? 'bg-blue-500 text-black border-blue-400 shadow-sm'
                      : 'bg-zinc-900/90 text-blue-400 border-zinc-700 hover:border-blue-600/60'
                  }`}
                >
                  P50 Median ({formatAmount(cur.p50, scenario.currency, scenario.unitScale)})
                </button>
                <button
                  onClick={() => setSelectedPercentileGuide(selectedPercentileGuide === 'MEAN' ? null : 'MEAN')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                    selectedPercentileGuide === 'MEAN'
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                      : 'bg-zinc-900/90 text-emerald-400 border-zinc-700 hover:border-emerald-600/60'
                  }`}
                >
                  ALE Mean ({formatAmount(cur.mean, scenario.currency, scenario.unitScale)})
                </button>
                <button
                  onClick={() => setSelectedPercentileGuide(selectedPercentileGuide === 'P90' ? null : 'P90')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                    selectedPercentileGuide === 'P90'
                      ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                      : 'bg-zinc-900/90 text-amber-400 border-zinc-700 hover:border-amber-600/60'
                  }`}
                >
                  P90 VaR ({formatAmount(cur.p90, scenario.currency, scenario.unitScale)})
                </button>
                <button
                  onClick={() => setSelectedPercentileGuide(selectedPercentileGuide === 'P95' ? null : 'P95')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                    selectedPercentileGuide === 'P95'
                      ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                      : 'bg-zinc-900/90 text-rose-400 border-zinc-700 hover:border-rose-600/60'
                  }`}
                >
                  P95 Tail ({formatAmount(cur.p95, scenario.currency, scenario.unitScale)})
                </button>
                <button
                  onClick={() => setSelectedPercentileGuide(selectedPercentileGuide === 'P99' ? null : 'P99')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                    selectedPercentileGuide === 'P99'
                      ? 'bg-red-600 text-white border-red-500 shadow-sm'
                      : 'bg-zinc-900/90 text-red-400 border-zinc-700 hover:border-red-600/60'
                  }`}
                >
                  P99 Catastrophe ({formatAmount(cur.p99, scenario.currency, scenario.unitScale)})
                </button>
                <button
                  onClick={() => setSelectedPercentileGuide(selectedPercentileGuide === 'CI' ? null : 'CI')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                    selectedPercentileGuide === 'CI'
                      ? 'bg-purple-500 text-white border-purple-400 shadow-sm'
                      : 'bg-zinc-900/90 text-purple-400 border-zinc-700 hover:border-purple-600/60'
                  }`}
                >
                  90% CI [{formatAmount(cur.p05, scenario.currency, scenario.unitScale)} – {formatAmount(cur.p95, scenario.currency, scenario.unitScale)}]
                </button>
              </div>

              {/* Explanatory Callout Content for Selected Metric */}
              {selectedPercentileGuide && (
                <div className="mt-2.5 p-2.5 rounded bg-zinc-900/95 border border-zinc-700/80 text-[11px] text-zinc-300 font-sans leading-relaxed animate-in fade-in duration-150">
                  {selectedPercentileGuide === 'P10' && (
                    <div>
                      <strong className="text-cyan-400 font-mono">P10 (10th Percentile / Low-End Floor): </strong>
                      In Open FAIR, 90% of simulation iterations will suffer losses <em>greater</em> than {formatAmount(cur.p10, scenario.currency, scenario.unitScale)}. It represents the optimistic baseline floor where threat agents rarely act or controls contain initial contact quickly.
                    </div>
                  )}
                  {selectedPercentileGuide === 'P50' && (
                    <div>
                      <strong className="text-blue-400 font-mono">P50 (Median Annual Loss): </strong>
                      The exact 50/50 midpoint in the Monte Carlo loss distribution. In half of all simulated years, losses will be below {formatAmount(cur.p50, scenario.currency, scenario.unitScale)}, and in half they will be higher. Unlike the mean, it is not skewed by extreme tail catastrophes.
                    </div>
                  )}
                  {selectedPercentileGuide === 'MEAN' && (
                    <div>
                      <strong className="text-emerald-400 font-mono">Expected Mean (ALE - Annualized Loss Exposure): </strong>
                      The mathematical expected average across all {scenario.simulationsCount.toLocaleString()} trials ({formatAmount(cur.mean, scenario.currency, scenario.unitScale)}). Used for multi-year cost-benefit analysis and comparing directly with security control budgets.
                    </div>
                  )}
                  {selectedPercentileGuide === 'P90' && (
                    <div>
                      <strong className="text-amber-400 font-mono">P90 (Value at Risk - VaR): </strong>
                      The core Open FAIR executive benchmark ({formatAmount(cur.p90, scenario.currency, scenario.unitScale)}). There is a 90% confidence that annual losses will <em>not</em> exceed this amount (i.e. only a 10% chance, or a 1-in-10 year event). Used by CISOs and Boards to set cyber capital reserves and cyber insurance coverage limits.
                    </div>
                  )}
                  {selectedPercentileGuide === 'P95' && (
                    <div>
                      <strong className="text-rose-400 font-mono">P95 (Tail Risk / 90% CI Upper Bound): </strong>
                      Represents a severe 1-in-20 year loss event ({formatAmount(cur.p95, scenario.currency, scenario.unitScale)}). In this scenario, primary controls are bypassed and compounding secondary loss forms (GDPR/regulatory fines, customer churn, forensics) take place.
                    </div>
                  )}
                  {selectedPercentileGuide === 'P99' && (
                    <div>
                      <strong className="text-red-400 font-mono">P99 (Extreme Tail Catastrophe): </strong>
                      Represents a 1-in-100 year black-swan catastrophe threshold ({formatAmount(cur.p99, scenario.currency, scenario.unitScale)}). Used by risk committees to stress-test business continuity and enterprise solvency.
                    </div>
                  )}
                  {selectedPercentileGuide === 'CI' && (
                    <div>
                      <strong className="text-purple-400 font-mono">90% Confidence Interval Range (5th to 95th Percentile): </strong>
                      Captures 90% of all simulated outcomes between {formatAmount(cur.p05, scenario.currency, scenario.unitScale)} and {formatAmount(cur.p95, scenario.currency, scenario.unitScale)}. Demonstrates calibrated uncertainty and parameter dispersion in the PERT distributions.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Chart Display Area */}
          <div className="w-full">
            {activeChartTab === 'histogram' && (
              histogramEngine === 'd3' ? (
                <D3FatTailHistogram
                  scenario={scenario}
                  result={result}
                  onOpenGlossaryModal={onOpenGlossaryModal}
                  embedded={true}
                />
              ) : (
                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={result.currentHistogram} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} yAxisId={0} />
                      <XAxis
                        dataKey="binLabel"
                        stroke="#71717a"
                        tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        interval={2}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis
                        yAxisId={0}
                        stroke="#71717a"
                        tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        label={{ value: 'Trial Count', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }}
                      />
                      <YAxis
                        yAxisId={1}
                        orientation="right"
                        stroke="#f43f5e"
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: '#f43f5e', fontFamily: 'JetBrains Mono' }}
                        label={{ value: 'Cumulative Frequency (%)', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 11 }}
                      />
                      <Tooltip
                        content={(props: any) => (
                          <HistogramCustomTooltip
                            {...props}
                            currency={scenario.currency}
                            unitScale={scenario.unitScale}
                            totalTrials={scenario.simulationsCount}
                            stats={cur}
                            proposedStats={prop}
                          />
                        )}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
                      <Bar
                        yAxisId={0}
                        dataKey="count"
                        name="Current Simulation Trials"
                        fill="#06b6d4"
                        radius={[2, 2, 0, 0]}
                      />
                      <Line
                        yAxisId={1}
                        type="monotone"
                        dataKey="cumulativeFrequency"
                        name="Cumulative Frequency (%)"
                        stroke="#f43f5e"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )
            )}

            {activeChartTab === 'lec' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.lossExceedanceCurve} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <defs>
                    <linearGradient id="currentLecGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="proposedLecGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="formattedLoss"
                    stroke="#71717a"
                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    interval={3}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#71717a"
                    domain={[0, 1]}
                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    label={{ value: 'Probability of Exceeding Loss P(Loss > x)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }}
                  />
                  <Tooltip
                    content={(props: any) => (
                      <LecCustomTooltip
                        {...props}
                        currency={scenario.currency}
                        unitScale={scenario.unitScale}
                        stats={cur}
                        proposedStats={prop}
                        targetPercentile={targetPct}
                      />
                    )}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
                  <Area
                    type="monotone"
                    dataKey="probabilityExceeding"
                    name="Current State LEC"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    fill="url(#currentLecGrad)"
                  />
                  {scenario.hasProposed && (
                    <Area
                      type="monotone"
                      dataKey="proposedProbabilityExceeding"
                      name="Proposed State LEC (Mitigated)"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#proposedLecGrad)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'forms' && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={lossFormsData} margin={{ top: 10, right: 30, left: 10, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="form" stroke="#71717a" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => formatAmount(v, scenario.currency, scenario.unitScale)} />
                  <Tooltip
                    content={(props: any) => (
                      <LossFormsCustomTooltip
                        {...props}
                        currency={scenario.currency}
                        unitScale={scenario.unitScale}
                      />
                    )}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
                  <Bar dataKey="Current_Primary" name="Primary Loss" fill="#06b6d4" stackId="cur" />
                  <Bar dataKey="Current_Secondary" name="Secondary Loss" fill="#f43f5e" stackId="cur" />
                  {scenario.hasProposed && (
                    <>
                      <Bar dataKey="Proposed_Primary" name="Proposed Primary" fill="#10b981" stackId="prop" />
                      <Bar dataKey="Proposed_Secondary" name="Proposed Secondary" fill="#84cc16" stackId="prop" />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'sensitivity' && (
              <div className="h-[340px] overflow-y-auto pr-1">
                <SensitivityTornadoViewer
                  scenario={scenario}
                  result={result}
                  onOpenAiAssistant={onOpenAiAssistant}
                  compact={true}
                />
              </div>
            )}

            {activeChartTab === 'heatmap' && (
              <div className="h-[340px] flex flex-col justify-between space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white uppercase">2D Monte Carlo Trial Density &amp; Matrix Position</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                      Rating: {result.currentRiskRating}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    Expected: {result.currentLefStats.mean.toFixed(2)}/yr × {formatAmount(result.currentPrimaryStats.mean, scenario.currency, scenario.unitScale)}
                  </span>
                </div>

                {/* Mini Heatmap Grid Canvas */}
                <div className="relative flex-1 bg-[#050505] rounded-lg border border-zinc-800/90 overflow-hidden p-4 select-none">
                  {/* 5x5 Background Matrix Tint */}
                  <div className="absolute inset-4 grid grid-cols-5 grid-rows-5 gap-1 opacity-20 pointer-events-none">
                    {/* Rows */}
                    <div className="bg-rose-500/30 rounded border border-rose-500/40"></div>
                    <div className="bg-rose-500/40 rounded border border-rose-500/40"></div>
                    <div className="bg-rose-500/50 rounded border border-rose-500/50"></div>
                    <div className="bg-rose-600/70 rounded border border-rose-600/70"></div>
                    <div className="bg-rose-700/80 rounded border border-rose-700/80"></div>

                    <div className="bg-orange-500/30 rounded border border-orange-500/40"></div>
                    <div className="bg-orange-500/40 rounded border border-orange-500/40"></div>
                    <div className="bg-rose-500/40 rounded border border-rose-500/40"></div>
                    <div className="bg-rose-500/60 rounded border border-rose-500/60"></div>
                    <div className="bg-rose-600/70 rounded border border-rose-600/70"></div>

                    <div className="bg-cyan-500/20 rounded border border-cyan-500/30"></div>
                    <div className="bg-cyan-500/30 rounded border border-cyan-500/30"></div>
                    <div className="bg-amber-500/40 rounded border border-amber-500/40"></div>
                    <div className="bg-orange-500/50 rounded border border-orange-500/50"></div>
                    <div className="bg-rose-500/60 rounded border border-rose-500/60"></div>

                    <div className="bg-emerald-500/20 rounded border border-emerald-500/30"></div>
                    <div className="bg-emerald-500/30 rounded border border-emerald-500/30"></div>
                    <div className="bg-cyan-500/30 rounded border border-cyan-500/30"></div>
                    <div className="bg-amber-500/40 rounded border border-amber-500/40"></div>
                    <div className="bg-orange-500/50 rounded border border-orange-500/50"></div>

                    <div className="bg-emerald-500/20 rounded border border-emerald-500/30"></div>
                    <div className="bg-emerald-500/20 rounded border border-emerald-500/30"></div>
                    <div className="bg-emerald-500/30 rounded border border-emerald-500/30"></div>
                    <div className="bg-cyan-500/30 rounded border border-cyan-500/30"></div>
                    <div className="bg-amber-500/40 rounded border border-amber-500/40"></div>
                  </div>

                  {/* SVG Coordinates & Markers */}
                  <svg className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Iso-ALE Curves */}
                    <path d="M 5 20 Q 30 60 90 95" fill="none" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5" />
                    <path d="M 20 10 Q 55 45 95 75" fill="none" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.5" />
                    <path d="M 40 5 Q 75 30 98 50" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />

                    {/* Current Position Marker */}
                    <g>
                      <circle cx="58" cy="42" r="5" fill="#38bdf8" opacity="0.3" className="animate-ping" />
                      <circle cx="58" cy="42" r="3.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1" />
                      <text x="64" y="44" fill="#38bdf8" fontSize="3.5" fontWeight="bold" fontFamily="ui-monospace, monospace">
                        Current: {formatAmount(cur.mean, scenario.currency, scenario.unitScale)}/yr
                      </text>
                    </g>

                    {/* Proposed Residual Marker if active */}
                    {scenario.hasProposed && prop && (
                      <g>
                        <line x1="58" y1="42" x2="32" y2="70" stroke="#10b981" strokeWidth="1.2" strokeDasharray="2,2" />
                        <rect x="30" y="68" width="4" height="4" rx="1" fill="#10b981" stroke="#ffffff" strokeWidth="0.8" />
                        <text x="36" y="72" fill="#10b981" fontSize="3.5" fontWeight="bold" fontFamily="ui-monospace, monospace">
                          Proposed: {formatAmount(prop.mean, scenario.currency, scenario.unitScale)}/yr (-{result.riskReductionPct}%)
                        </text>
                      </g>
                    )}
                  </svg>

                  {/* Y Axis Labels */}
                  <div className="absolute left-1 top-4 bottom-4 flex flex-col justify-between text-[9px] text-zinc-500 font-bold">
                    <span>Critical LEF</span>
                    <span>Mod LEF</span>
                    <span>Low LEF</span>
                  </div>

                  {/* X Axis Labels */}
                  <div className="absolute bottom-1 left-4 right-4 flex justify-between text-[9px] text-zinc-500 font-bold">
                    <span>Low Loss</span>
                    <span>Moderate Loss</span>
                    <span>Severe Loss</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <span className="text-[11px]">Loss Event Frequency × Single Event Loss Exposure</span>
                  <span className="text-cyan-400 font-bold text-[11px]">Iso-ALE Contours: $1M, $5M, $20M</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Percentiles Data Table & Sensitivity Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quantile Summary Table */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center space-x-2">
              <span>Statistical Percentiles & CI Range</span>
            </h3>
            <span className="text-xs text-zinc-400 font-mono">{scenario.unitLabel}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase tracking-wider">
                  <th className="py-2.5 px-3">Percentile / Bound</th>
                  <th className="py-2.5 px-3">Current ALE</th>
                  <th className="py-2.5 px-3">Primary ALE</th>
                  <th className="py-2.5 px-3">Secondary ALE</th>
                  {scenario.hasProposed && <th className="py-2.5 px-3 text-emerald-400">Proposed ALE</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 font-mono text-zinc-200">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-400">Minimum (0%)</td>
                  <td className="py-2.5 px-3">{formatAmount(cur.min, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentPrimaryStats.min, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentSecondaryStats.min, scenario.currency, scenario.unitScale)}</td>
                  {scenario.hasProposed && prop && <td className="py-2.5 px-3 text-emerald-400 font-bold">{formatAmount(prop.min, scenario.currency, scenario.unitScale)}</td>}
                </tr>
                <tr className="bg-cyan-950/20 text-cyan-300">
                  <td className="py-2.5 px-3 font-bold flex items-center space-x-1">
                    <span>5th Percentile (90% CI Lower)</span>
                  </td>
                  <td className="py-2.5 px-3 font-bold">{formatAmount(cur.p05, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentPrimaryStats.p05, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentSecondaryStats.p05, scenario.currency, scenario.unitScale)}</td>
                  {scenario.hasProposed && prop && <td className="py-2.5 px-3 text-emerald-400 font-bold">{formatAmount(prop.p05, scenario.currency, scenario.unitScale)}</td>}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-400">10th Percentile</td>
                  <td className="py-2.5 px-3">{formatAmount(cur.p10, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentPrimaryStats.p10, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentSecondaryStats.p10, scenario.currency, scenario.unitScale)}</td>
                  {scenario.hasProposed && prop && <td className="py-2.5 px-3 text-emerald-400 font-bold">{formatAmount(prop.p10, scenario.currency, scenario.unitScale)}</td>}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-400">25th Percentile (Q1)</td>
                  <td className="py-2.5 px-3">{formatAmount(cur.p25, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentPrimaryStats.p25, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentSecondaryStats.p25, scenario.currency, scenario.unitScale)}</td>
                  {scenario.hasProposed && prop && <td className="py-2.5 px-3 text-emerald-400 font-bold">{formatAmount(prop.p25, scenario.currency, scenario.unitScale)}</td>}
                </tr>
                <tr className="bg-zinc-900/60">
                  <td className="py-2.5 px-3 font-bold text-white">Median (50th)</td>
                  <td className="py-2.5 px-3 font-bold text-white">{formatAmount(cur.p50, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentPrimaryStats.p50, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentSecondaryStats.p50, scenario.currency, scenario.unitScale)}</td>
                  {scenario.hasProposed && prop && <td className="py-2.5 px-3 text-emerald-400 font-bold">{formatAmount(prop.p50, scenario.currency, scenario.unitScale)}</td>}
                </tr>
                <tr className="bg-cyan-950/40 text-cyan-200">
                  <td className="py-2.5 px-3 font-black">Expected Mean (ALE)</td>
                  <td className="py-2.5 px-3 font-black">{formatAmount(cur.mean, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3 font-bold">{formatAmount(result.currentPrimaryStats.mean, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3 font-bold">{formatAmount(result.currentSecondaryStats.mean, scenario.currency, scenario.unitScale)}</td>
                  {scenario.hasProposed && prop && <td className="py-2.5 px-3 text-emerald-400 font-black">{formatAmount(prop.mean, scenario.currency, scenario.unitScale)}</td>}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-400">75th Percentile (Q3)</td>
                  <td className="py-2.5 px-3">{formatAmount(cur.p75, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentPrimaryStats.p75, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentSecondaryStats.p75, scenario.currency, scenario.unitScale)}</td>
                  {scenario.hasProposed && prop && <td className="py-2.5 px-3 text-emerald-400 font-bold">{formatAmount(prop.p75, scenario.currency, scenario.unitScale)}</td>}
                </tr>
                <tr className="bg-amber-950/30 text-amber-300 font-semibold">
                  <td className="py-2.5 px-3">VaR (90th Percentile)</td>
                  <td className="py-2.5 px-3 font-bold">{formatAmount(cur.p90, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentPrimaryStats.p90, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentSecondaryStats.p90, scenario.currency, scenario.unitScale)}</td>
                  {scenario.hasProposed && prop && <td className="py-2.5 px-3 text-emerald-400 font-bold">{formatAmount(prop.p90, scenario.currency, scenario.unitScale)}</td>}
                </tr>
                <tr className="bg-rose-950/30 text-rose-300">
                  <td className="py-2.5 px-3 font-bold">95th Percentile (90% CI Upper)</td>
                  <td className="py-2.5 px-3 font-bold">{formatAmount(cur.p95, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentPrimaryStats.p95, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentSecondaryStats.p95, scenario.currency, scenario.unitScale)}</td>
                  {scenario.hasProposed && prop && <td className="py-2.5 px-3 text-emerald-400 font-bold">{formatAmount(prop.p95, scenario.currency, scenario.unitScale)}</td>}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-rose-400">99th Percentile (Extreme Tail)</td>
                  <td className="py-2.5 px-3 font-bold text-rose-400">{formatAmount(cur.p99, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentPrimaryStats.p99, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentSecondaryStats.p99, scenario.currency, scenario.unitScale)}</td>
                  {scenario.hasProposed && prop && <td className="py-2.5 px-3 text-emerald-400 font-bold">{formatAmount(prop.p99, scenario.currency, scenario.unitScale)}</td>}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-400">Maximum Simulated</td>
                  <td className="py-2.5 px-3">{formatAmount(cur.max, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentPrimaryStats.max, scenario.currency, scenario.unitScale)}</td>
                  <td className="py-2.5 px-3">{formatAmount(result.currentSecondaryStats.max, scenario.currency, scenario.unitScale)}</td>
                  {scenario.hasProposed && prop && <td className="py-2.5 px-3 text-emerald-400 font-bold">{formatAmount(prop.max, scenario.currency, scenario.unitScale)}</td>}
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-cyan-700/80 bg-cyan-950/40 text-cyan-200 font-mono text-[11px]">
                  <td className="py-2.5 px-3 font-black uppercase tracking-wider">90% CI Range (5th–95th)</td>
                  <td className="py-2.5 px-3 font-black">[{formatAmount(cur.p05, scenario.currency, scenario.unitScale)} – {formatAmount(cur.p95, scenario.currency, scenario.unitScale)}]</td>
                  <td className="py-2.5 px-3 font-bold">[{formatAmount(result.currentPrimaryStats.p05, scenario.currency, scenario.unitScale)} – {formatAmount(result.currentPrimaryStats.p95, scenario.currency, scenario.unitScale)}]</td>
                  <td className="py-2.5 px-3 font-bold">[{formatAmount(result.currentSecondaryStats.p05, scenario.currency, scenario.unitScale)} – {formatAmount(result.currentSecondaryStats.p95, scenario.currency, scenario.unitScale)}]</td>
                  {scenario.hasProposed && prop && (
                    <td className="py-2.5 px-3 font-black text-emerald-300">
                      [{formatAmount(prop.p05, scenario.currency, scenario.unitScale)} – {formatAmount(prop.p95, scenario.currency, scenario.unitScale)}]
                    </td>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Sensitivity & Key Drivers */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center space-x-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>Risk Variance Drivers (Sensitivity)</span>
              </h3>
              <button
                onClick={() => setActiveChartTab('sensitivity')}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 transition-colors"
              >
                View Full Tornado
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-3 font-mono">
              Identifying which input variables contribute most significantly to variance across the Loss Exceedance Curve.
            </p>

            {/* Frequency vs Magnitude Domain Breakdown Meter */}
            {result.sensitivityReport && (
              <div className="mb-4 p-3 rounded-lg bg-[#050505] border border-zinc-800/90 font-mono text-xs">
                <div className="flex justify-between items-center mb-1.5 text-[11px]">
                  <span className="text-emerald-400 font-bold">
                    Frequency Drivers: {result.sensitivityReport.domainBreakdown.frequencyContributionPct}%
                  </span>
                  <span className="text-cyan-400 font-bold">
                    Magnitude Drivers: {result.sensitivityReport.domainBreakdown.magnitudeContributionPct}%
                  </span>
                </div>
                <div className="w-full bg-zinc-900 h-2 rounded-full flex overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${result.sensitivityReport.domainBreakdown.frequencyContributionPct}%` }}
                  ></div>
                  <div
                    className="bg-cyan-500 h-full transition-all"
                    style={{ width: `${result.sensitivityReport.domainBreakdown.magnitudeContributionPct}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="space-y-2.5 font-mono">
              {result.sensitivities.slice(0, 5).map((s, idx) => (
                <div key={s.variableName} className="space-y-1 bg-[#050505] p-2 rounded border border-zinc-900">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-200 flex items-center space-x-1.5">
                      <span className="text-zinc-500 font-bold">#{idx + 1}</span>
                      <span className="font-semibold">{s.displayName}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">({s.domain})</span>
                    </span>
                    <span className="font-bold text-cyan-400">
                      {s.varianceContributionPct}% variance
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Correlation: <strong className="text-zinc-200">{s.correlationWithALE > 0 ? `+${s.correlationWithALE.toFixed(2)}` : s.correlationWithALE.toFixed(2)}</strong></span>
                    <span>P10–P90 Swing: <strong className="text-amber-300">±{formatAmount(s.swingDelta, scenario.currency, scenario.unitScale)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Method: Monte Carlo PERT Variance Share</span>
            <button
              onClick={() => setActiveChartTab('sensitivity')}
              className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider flex items-center space-x-1"
            >
              <span>Explore Tornado &amp; Swings</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
