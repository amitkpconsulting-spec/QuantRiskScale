import React from 'react';
import {
  TrendingDown,
  Scale,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers,
  PieChart as PieIcon,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ComposedChart,
  Area,
  Line
} from 'recharts';
import { FairScenario, SimulationResult } from '../types/fair';
import { formatAmount } from '../utils/distributions';
import { ThemeToggle } from './ThemeToggle';


interface ComparativeAnalysisProps {
  scenario: FairScenario;
  result: SimulationResult | null;
  onOpenAiAssistant: () => void;
  onNavigateToBuilder: () => void;
  onOpenPdfModal: () => void;
}

export const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({
  scenario,
  result,
  onOpenAiAssistant,
  onNavigateToBuilder,
  onOpenPdfModal
}) => {
  if (!result || !result.proposedStats) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center bg-[#09090b] border border-zinc-800 rounded-2xl my-8 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto mb-4 text-cyan-400">
          <Scale className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black text-white font-display uppercase tracking-tight mb-2">No Proposed Mitigation Model Defined</h3>
        <p className="text-xs text-zinc-400 font-mono max-w-md mx-auto mb-6">
          To perform What-If comparative risk analysis and compute Return on Security Investment (ROSI), enable the Proposed State branch in the Scenario Builder.
        </p>
        <button
          onClick={onNavigateToBuilder}
          className="px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-black font-display text-xs uppercase tracking-wider transition-all shadow-md inline-flex items-center space-x-2"
        >
          <span>Enable Proposed What-If Controls</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const cur = result.currentStats;
  const prop = result.proposedStats;

  // Comparison Metrics Table Data
  const comparisonMetrics = [
    {
      metric: 'Expected Annual Loss (Mean ALE)',
      current: cur.mean,
      proposed: prop.mean,
      diff: cur.mean - prop.mean,
      diffPct: cur.mean > 0 ? ((cur.mean - prop.mean) / cur.mean) * 100 : 0
    },
    {
      metric: 'Median Loss (50th Percentile)',
      current: cur.p50,
      proposed: prop.p50,
      diff: cur.p50 - prop.p50,
      diffPct: cur.p50 > 0 ? ((cur.p50 - prop.p50) / cur.p50) * 100 : 0
    },
    {
      metric: 'Value at Risk (90th Percentile)',
      current: cur.p90,
      proposed: prop.p90,
      diff: cur.p90 - prop.p90,
      diffPct: cur.p90 > 0 ? ((cur.p90 - prop.p90) / cur.p90) * 100 : 0
    },
    {
      metric: 'Tail Risk Exposure (95th Percentile)',
      current: cur.p95,
      proposed: prop.p95,
      diff: cur.p95 - prop.p95,
      diffPct: cur.p95 > 0 ? ((cur.p95 - prop.p95) / cur.p95) * 100 : 0
    },
    {
      metric: 'Loss Event Frequency (LEF)',
      current: result.currentLefStats.mean,
      proposed: result.proposedLefStats ? result.proposedLefStats.mean : 0,
      diff: result.currentLefStats.mean - (result.proposedLefStats?.mean || 0),
      diffPct: result.currentLefStats.mean > 0 ? ((result.currentLefStats.mean - (result.proposedLefStats?.mean || 0)) / result.currentLefStats.mean) * 100 : 0,
      isFreq: true
    },
    {
      metric: 'Service Outage (Hours / Year p90)',
      current: result.currentDowntimeStats.p90,
      proposed: result.proposedDowntimeStats?.p90 || 0,
      diff: result.currentDowntimeStats.p90 - (result.proposedDowntimeStats?.p90 || 0),
      diffPct: result.currentDowntimeStats.p90 > 0 ? ((result.currentDowntimeStats.p90 - (result.proposedDowntimeStats?.p90 || 0)) / result.currentDowntimeStats.p90) * 100 : 0,
      isTime: true
    }
  ];

  // Bar Chart comparison
  const barComparisonData = [
    { name: 'Min', Baseline_Current: cur.min, Proposed_Mitigated: prop.min },
    { name: '10th', Baseline_Current: cur.p10, Proposed_Mitigated: prop.p10 },
    { name: 'Median (50th)', Baseline_Current: cur.p50, Proposed_Mitigated: prop.p50 },
    { name: 'Mean (ALE)', Baseline_Current: cur.mean, Proposed_Mitigated: prop.mean },
    { name: 'VaR 90th', Baseline_Current: cur.p90, Proposed_Mitigated: prop.p90 },
    { name: 'Tail 95th', Baseline_Current: cur.p95, Proposed_Mitigated: prop.p95 }
  ];

  // Threat Capability vs Resistance Strength Comparison Data
  const tcRsData = [
    {
      state: 'Baseline Current',
      TC_Low: scenario.current.lef.threatCapability.low,
      TC_Mode: scenario.current.lef.threatCapability.mode,
      TC_High: scenario.current.lef.threatCapability.high,
      RS_Low: scenario.current.lef.resistanceStrength.low,
      RS_Mode: scenario.current.lef.resistanceStrength.mode,
      RS_High: scenario.current.lef.resistanceStrength.high
    },
    {
      state: 'Proposed Mitigation',
      TC_Low: scenario.proposed.lef.threatCapability.low,
      TC_Mode: scenario.proposed.lef.threatCapability.mode,
      TC_High: scenario.proposed.lef.threatCapability.high,
      RS_Low: scenario.proposed.lef.resistanceStrength.low,
      RS_Mode: scenario.proposed.lef.resistanceStrength.mode,
      RS_High: scenario.proposed.lef.resistanceStrength.high
    }
  ];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner: Delta Summary */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1.5 font-mono">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-zinc-800 text-cyan-400 border border-zinc-700 uppercase tracking-widest">
                Comparative What-If Analysis
              </span>
              <span className="text-xs text-zinc-400 uppercase font-mono">Current vs Proposed Mitigation</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white font-display tracking-tight uppercase">Risk Reduction &amp; Return on Investment</h2>
            <p className="text-xs text-zinc-400 font-mono max-w-2xl mt-1">
              Evaluating quantitative financial impact and residual exposure of proposed security controls.
            </p>
            <div className="mt-3 flex items-center space-x-2">
              <button
                onClick={onOpenPdfModal}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 border border-zinc-700 hover:border-cyan-500/50 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm active:scale-98"
                title="Export Comparative PDF Report"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export PDF Report</span>
              </button>
              <button
                onClick={onOpenAiAssistant}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 border border-zinc-700 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Insights</span>
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* Key ROI Cards */}
          <div className="flex flex-wrap items-center gap-4 font-mono">
            <div className="bg-[#050505] border border-zinc-800 rounded-xl p-4 min-w-[150px] text-center">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-0.5">ALE Reduction</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                -{result.riskReductionPct}%
              </span>
              <span className="text-[10px] text-zinc-400 block font-mono">
                {formatAmount(result.riskReductionDollar || 0, scenario.currency, scenario.unitScale)}
              </span>
            </div>

            <div className="bg-[#050505] border border-zinc-800 rounded-xl p-4 min-w-[150px] text-center">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-0.5">Return on Security (ROSI)</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {result.returnOnControlInvestment !== undefined ? `${result.returnOnControlInvestment.toFixed(0)}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-zinc-400 block font-mono">
                Cost: {formatAmount(scenario.proposedControlCost || 0, scenario.currency, scenario.unitScale)}/yr
              </span>
            </div>

            <div className="bg-[#050505] border border-zinc-800 rounded-xl p-4 min-w-[150px] text-center">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-0.5">Risk Rating Shift</span>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 font-mono">
                  {result.currentRiskRating}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                  {result.proposedRiskRating}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side by Side Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Percentile Comparison Bar Chart */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
              Statistical Percentile Comparison
            </h3>
            <span className="text-[11px] text-zinc-400 font-mono uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{scenario.unitLabel}</span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mb-4">Direct baseline vs mitigated exposure across key quantile markers.</p>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barComparisonData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => formatAmount(v, scenario.currency, scenario.unitScale)} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-[#09090b] border border-zinc-800 rounded-lg p-3 shadow-xl font-mono text-xs space-y-1.5 pointer-events-none">
                        <div className="font-bold text-white border-b border-zinc-800 pb-1">{label}</div>
                        {payload.map((entry: any, index: number) => (
                          <div key={index} className="flex justify-between items-center space-x-3">
                            <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
                            <span className="text-white font-bold">{formatAmount(Number(entry.value), scenario.currency, scenario.unitScale)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
                <Bar dataKey="Baseline_Current" name="Baseline Current ALE" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Proposed_Mitigated" name="Proposed Mitigated ALE" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Threat Capability vs Control Strength (Vulnerability Gap) */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
              Threat Capability (TC) vs Control Strength (RS)
            </h3>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-zinc-400 font-mono mb-4">Vulnerability decreases when Resistance Strength (RS) surpasses Threat Capability (TC).</p>

          <div className="space-y-4 my-auto font-mono">
            {/* Baseline TC vs RS */}
            <div className="bg-[#050505] p-4 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold font-mono">
                <span className="text-zinc-300 uppercase">Baseline Current State</span>
                <span className="text-red-400 font-mono">Vulnerability: {result.currentBranchCalculations.vulnMeanPct.toFixed(1)}%</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Threat Capability (TC Mode): {scenario.current.lef.threatCapability.mode}/100</span>
                  <span>Resistance Strength (RS Mode): {scenario.current.lef.resistanceStrength.mode}/100</span>
                </div>
                <div className="w-full bg-zinc-900 h-3 rounded overflow-hidden relative flex border border-zinc-800">
                  <div
                    className="bg-red-500 h-full opacity-80"
                    style={{ width: `${scenario.current.lef.threatCapability.mode}%` }}
                    title={`Threat Capability: ${scenario.current.lef.threatCapability.mode}`}
                  ></div>
                  <div
                    className="bg-emerald-500 h-full opacity-80 absolute top-0"
                    style={{ width: `${scenario.current.lef.resistanceStrength.mode}%` }}
                    title={`Resistance Strength: ${scenario.current.lef.resistanceStrength.mode}`}
                  ></div>
                </div>
              </div>
            </div>

            {/* Proposed TC vs RS */}
            <div className="bg-[#050505] p-4 rounded-xl border border-emerald-900/40 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold font-mono">
                <span className="text-emerald-400 uppercase">Proposed Mitigated State</span>
                <span className="text-emerald-400 font-mono">
                  Vulnerability: {result.proposedBranchCalculations ? `${result.proposedBranchCalculations.vulnMeanPct.toFixed(1)}%` : 'Reduced'}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Threat Capability (TC Mode): {scenario.proposed.lef.threatCapability.mode}/100</span>
                  <span className="text-emerald-400 font-bold">Resistance Strength (RS Mode): {scenario.proposed.lef.resistanceStrength.mode}/100</span>
                </div>
                <div className="w-full bg-zinc-900 h-3 rounded overflow-hidden relative flex border border-zinc-800">
                  <div
                    className="bg-red-500 h-full opacity-70"
                    style={{ width: `${scenario.proposed.lef.threatCapability.mode}%` }}
                  ></div>
                  <div
                    className="bg-emerald-500 h-full opacity-90 absolute top-0"
                    style={{ width: `${scenario.proposed.lef.resistanceStrength.mode}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 mt-2 font-mono flex items-center justify-between border-t border-zinc-800 pt-2 uppercase">
            <span>Red: Threat Capability (TC)</span>
            <span>Green: Resistance Strength (RS)</span>
          </div>
        </div>
      </div>

      {/* Comprehensive Quantitative Comparison Table */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
            Comparative Metrics &amp; Delta Table
          </h3>
          <button
            onClick={onOpenAiAssistant}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold font-mono flex items-center space-x-1.5 uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Executive Report</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase tracking-wider">
                <th className="py-2.5 px-3">Quantitative Metric</th>
                <th className="py-2.5 px-3">Current State</th>
                <th className="py-2.5 px-3 text-emerald-400">Proposed State</th>
                <th className="py-2.5 px-3">Delta ($ Savings)</th>
                <th className="py-2.5 px-3 text-right">Risk Reduction %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-mono text-zinc-200">
              {comparisonMetrics.map((row, idx) => (
                <tr key={idx} className={idx === 0 ? 'bg-cyan-950/20 font-bold text-white' : ''}>
                  <td className="py-2.5 px-3 font-semibold">{row.metric}</td>
                  <td className="py-2.5 px-3">
                    {row.isFreq
                      ? `${row.current.toFixed(2)} events/yr`
                      : row.isTime
                      ? `${row.current.toFixed(1)} hrs`
                      : formatAmount(row.current, scenario.currency, scenario.unitScale)}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">
                    {row.isFreq
                      ? `${row.proposed.toFixed(2)} events/yr`
                      : row.isTime
                      ? `${row.proposed.toFixed(1)} hrs`
                      : formatAmount(row.proposed, scenario.currency, scenario.unitScale)}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-400">
                    {row.isFreq
                      ? `-${row.diff.toFixed(2)} events`
                      : row.isTime
                      ? `-${row.diff.toFixed(1)} hrs`
                      : formatAmount(row.diff, scenario.currency, scenario.unitScale)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                    -{row.diffPct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
