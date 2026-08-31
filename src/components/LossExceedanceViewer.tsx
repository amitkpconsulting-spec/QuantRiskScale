import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Search,
  Scale,
  TrendingDown,
  Info,
  Layers,
  ArrowRight,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { FairScenario, SimulationResult } from '../types/fair';
import { formatAmount } from '../utils/distributions';
import { LecCustomTooltip } from './FairChartTooltips';
import { SensitivityTornadoViewer } from './SensitivityTornadoViewer';
import { ThemeToggle } from './ThemeToggle';


interface LossExceedanceViewerProps {
  scenario: FairScenario;
  result: SimulationResult | null;
  onOpenPdfModal?: () => void;
  onOpenAiAssistant?: () => void;
}

export const LossExceedanceViewer: React.FC<LossExceedanceViewerProps> = ({
  scenario,
  result,
  onOpenPdfModal,
  onOpenAiAssistant
}) => {
  const [customThreshold, setCustomThreshold] = useState<number>(scenario.riskTolerance.significantMax);
  const [useLogScale, setUseLogScale] = useState<boolean>(false);

  if (!result) {
    return (
      <div className="p-8 text-center text-slate-400">
        Run a simulation first to view Loss Exceedance Curves.
      </div>
    );
  }

  const lecData = result.lossExceedanceCurve;

  // Find probability of exceeding custom threshold
  let customExceedanceProb = 0;
  if (result.sampledPointsCur.length > 0) {
    const totalSamples = result.sampledPointsCur.length;
    const countAbove = result.sampledPointsCur.filter(p => p.totalAle >= customThreshold).length;
    customExceedanceProb = (countAbove / totalSamples) * 100;
  }

  const exportLecCsv = () => {
    let csv = 'Loss Amount,Formatted Loss,Exceedance Probability (Current),Cumulative %,Exceedance Probability (Proposed)\n';
    for (const p of lecData) {
      csv += `"${p.lossAmount}","${p.formattedLoss}","${p.probabilityExceeding}","${p.cumulativePercentage}%","${p.proposedProbabilityExceeding ?? ''}"\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.name.replace(/\s+/g, '_')}_LEC_Curve.csv`;
    a.click();
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5 font-mono">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-zinc-800 text-cyan-400 border border-zinc-700 uppercase tracking-widest">
              Loss Exceedance Analysis
            </span>
            <span className="text-xs text-zinc-400 font-mono uppercase">P(Loss &gt; x) Curve</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-black text-white font-display uppercase tracking-tight">Loss Exceedance Curve (LEC) &amp; Quantiles</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            The fundamental quantitative decision curve in Open FAIR, showing the probability that annual loss exceeds any given threshold.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {onOpenPdfModal && (
            <button
              onClick={onOpenPdfModal}
              className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 border border-zinc-700 hover:border-cyan-500/50 text-xs font-bold font-mono uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm active:scale-98"
              title="Export Professional PDF Summary Report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF Report</span>
            </button>
          )}

          <button
            onClick={exportLecCsv}
            className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold font-mono uppercase tracking-wider flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export LEC CSV</span>
          </button>

          <ThemeToggle />
        </div>
      </div>

      {/* Interactive Threshold Query Bar */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-cyan-400">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <label className="text-xs font-black text-white font-display uppercase tracking-wider block">Exceedance Probability Query</label>
            <span className="text-[11px] text-zinc-400 font-mono">Calculate probability that annual loss exceeds a specified threshold:</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-zinc-400 uppercase text-[11px]">Threshold ({scenario.currency}):</span>
            <input
              type="number"
              value={customThreshold}
              onChange={(e) => setCustomThreshold(parseFloat(e.target.value) || 0)}
              className="w-32 bg-[#050505] border border-zinc-700 rounded-lg px-3 py-1.5 text-white font-bold font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="px-3.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-cyan-400 font-mono text-xs font-black uppercase">
            P(Loss &gt; {formatAmount(customThreshold, scenario.currency, scenario.unitScale)}) = {customExceedanceProb.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Primary LEC Chart */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-black text-white font-display uppercase tracking-wider flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>Loss Exceedance Probability Distribution</span>
          </h3>

          <div className="flex items-center space-x-2 text-xs text-zinc-400 font-mono">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={useLogScale}
                onChange={(e) => setUseLogScale(e.target.checked)}
                className="rounded bg-zinc-900 border-zinc-700 text-cyan-500 focus:ring-0"
              />
              <span className="uppercase text-[11px]">Smooth Log Scale</span>
            </label>
          </div>
        </div>

        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lecData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
              <defs>
                <linearGradient id="currentLecFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="proposedLecFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="formattedLoss"
                stroke="#71717a"
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                interval={2}
                angle={-25}
                textAnchor="end"
              />
              <YAxis
                stroke="#71717a"
                domain={[0, 1]}
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                label={{ value: 'Exceedance Probability P(Loss > x)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <Tooltip
                content={(props: any) => (
                  <LecCustomTooltip
                    {...props}
                    currency={scenario.currency}
                    unitScale={scenario.unitScale}
                    stats={result.currentStats}
                    proposedStats={result.proposedStats}
                    targetPercentile={scenario.riskTolerance.targetPercentile || 90}
                  />
                )}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
              <Area
                type="monotone"
                dataKey="probabilityExceeding"
                name="Current Baseline LEC"
                stroke="#ef4444"
                strokeWidth={2.5}
                fill="url(#currentLecFull)"
              />
              {scenario.hasProposed && (
                <Area
                  type="monotone"
                  dataKey="proposedProbabilityExceeding"
                  name="Proposed Mitigated LEC"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#proposedLecFull)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sensitivity Analysis & LEC Variance Drivers */}
      <div className="pt-2">
        <SensitivityTornadoViewer
          scenario={scenario}
          result={result}
          onOpenAiAssistant={onOpenAiAssistant}
        />
      </div>

      {/* Full Quantiles Table (SIPmath & Open FAIR Reference) */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
            Table of Quantiles (CDF &amp; Exceedance Distribution)
          </h3>
          <span className="text-[11px] text-zinc-400 font-mono uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{lecData.length} Evaluated Steps</span>
        </div>

        <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-[#09090b] border-b border-zinc-800 text-zinc-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Cumulative Prob. (CDF)</th>
                <th className="py-2.5 px-3">Loss Amount</th>
                <th className="py-2.5 px-3 text-red-400">Current P(Loss &gt; x)</th>
                {scenario.hasProposed && <th className="py-2.5 px-3 text-emerald-400">Proposed P(Loss &gt; x)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-mono text-zinc-200">
              {lecData.map((row, idx) => (
                <tr key={idx} className={row.cumulativePercentage === 90 || row.cumulativePercentage === 95 ? 'bg-cyan-950/20 font-bold text-white' : ''}>
                  <td className="py-2 px-3 text-zinc-400">{row.cumulativePercentage}%</td>
                  <td className="py-2 px-3 font-bold text-white">{row.formattedLoss}</td>
                  <td className="py-2 px-3 text-red-400 font-bold">{(row.probabilityExceeding * 100).toFixed(1)}%</td>
                  {scenario.hasProposed && (
                    <td className="py-2 px-3 text-emerald-400 font-bold">
                      {row.proposedProbabilityExceeding !== undefined ? `${(row.proposedProbabilityExceeding * 100).toFixed(1)}%` : '-'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
