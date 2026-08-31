import React, { useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Download,
  Filter,
  Flame,
  HelpCircle,
  Info,
  Layers,
  Scale,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap
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
  Cell,
  ReferenceLine
} from 'recharts';
import {
  FairScenario,
  SimulationResult,
  VariableSensitivity,
  SensitivityAnalysisReport
} from '../types/fair';
import { formatAmount } from '../utils/distributions';

interface SensitivityTornadoViewerProps {
  scenario: FairScenario;
  result: SimulationResult;
  onOpenAiAssistant?: () => void;
  compact?: boolean;
}

export const SensitivityTornadoViewer: React.FC<SensitivityTornadoViewerProps> = ({
  scenario,
  result,
  onOpenAiAssistant,
  compact = false
}) => {
  const [activeSubView, setActiveSubView] = useState<'tornado' | 'variance' | 'tail_lec' | 'table'>('tornado');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredVar, setHoveredVar] = useState<VariableSensitivity | null>(null);
  const [simulatedFreqReduction, setSimulatedFreqReduction] = useState<number>(20);
  const [simulatedMagReduction, setSimulatedMagReduction] = useState<number>(20);

  const report = result.sensitivityReport;
  const sensitivities = result.sensitivities || [];
  const meanAle = result.currentStats.mean;

  // Filter sensitivities by category if selected
  const filteredSensitivities = sensitivities.filter(s => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'frequency') return s.domain === 'Frequency';
    if (selectedCategory === 'magnitude') return s.domain === 'Magnitude';
    if (selectedCategory === 'operational') return s.domain === 'Operational';
    return true;
  });

  // Prepare Tornado Data centered around Mean ALE
  // For each variable: Low swing (P10 input) vs High swing (P90 input)
  const tornadoData = filteredSensitivities.slice(0, 10).map(s => {
    const lowDiff = s.swingLow - meanAle;
    const highDiff = s.swingHigh - meanAle;
    return {
      name: s.displayName,
      key: s.variableName,
      category: s.category,
      domain: s.domain,
      swingLow: s.swingLow,
      swingHigh: s.swingHigh,
      swingDelta: s.swingDelta,
      lowDiff,
      highDiff,
      importanceRank: s.importanceRank,
      lecTailRank: s.lecTailRank,
      variancePct: s.varianceContributionPct,
      correlation: s.correlationWithALE,
      tailRatio: s.tailMeanRatio,
      description: s.description || ''
    };
  });

  // Sort tornado data by swing delta for clean visual hierarchy
  tornadoData.sort((a, b) => b.swingDelta - a.swingDelta);

  // Prepare Variance Share Data
  const varianceData = filteredSensitivities.slice(0, 10).map(s => ({
    name: s.displayName,
    key: s.variableName,
    variancePct: s.varianceContributionPct,
    correlation: Math.abs(s.correlationWithALE),
    domain: s.domain,
    category: s.category
  }));

  // Prepare Tail LEC vs Overall Correlation Data
  const tailLecData = filteredSensitivities.slice(0, 10).map(s => ({
    name: s.displayName,
    key: s.variableName,
    overallCorr: Math.max(0, s.correlationWithALE),
    tailCorr: Math.max(0, s.tailCorrelationWithVaR),
    tailMeanRatio: s.tailMeanRatio,
    lecTailRank: s.lecTailRank,
    domain: s.domain
  }));

  // Category Color Mapper
  const getCategoryBadgeClass = (domain: string, category: string) => {
    if (domain === 'Frequency') {
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    }
    if (domain === 'Magnitude') {
      if (category.includes('Secondary')) {
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      }
      return 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60';
    }
    return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
  };

  // Export Sensitivity Matrix to CSV
  const handleExportCsv = () => {
    let csv = 'Rank,LEC Tail Rank,Variable Name,Category,Domain,Correlation (r),Variance Contribution (%),P10 Swing ALE,P90 Swing ALE,Dollar Swing Range,Tail Mean Ratio (Top 10% / All),Elasticity (+10% input to % ALE),Description\n';
    sensitivities.forEach(s => {
      csv += `"${s.importanceRank}","${s.lecTailRank}","${s.displayName}","${s.category}","${s.domain}","${s.correlationWithALE}","${s.varianceContributionPct}%","${s.swingLow}","${s.swingHigh}","${s.swingDelta}","${s.tailMeanRatio}x","${s.elasticity}%","${(s.description || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.name.replace(/\s+/g, '_')}_Sensitivity_Analysis.csv`;
    a.click();
  };

  // What-If Estimation based on Sensitivity Elasticity
  const freqShare = report ? report.domainBreakdown.frequencyContributionPct / 100 : 0.5;
  const magShare = report ? report.domainBreakdown.magnitudeContributionPct / 100 : 0.5;
  const estimatedFreqReductionDollar = meanAle * (simulatedFreqReduction / 100) * freqShare;
  const estimatedMagReductionDollar = meanAle * (simulatedMagReduction / 100) * magShare;

  return (
    <div className="space-y-5 font-sans">
      {/* Top Hero: Domain Variance Breakdown & Synthesis */}
      {report && (
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                  Open FAIR Simulation Engine • Variance Decomposition
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {scenario.simulationsCount.toLocaleString()} Monte Carlo Iterations
                </span>
              </div>
              <h3 className="text-lg lg:text-xl font-black text-white font-display uppercase tracking-tight flex items-center space-x-2">
                <Scale className="w-5 h-5 text-cyan-400" />
                <span>Loss Exceedance &amp; Risk Variance Sensitivity</span>
              </h3>
              <p className="text-xs text-zinc-300 font-mono mt-1 leading-relaxed max-w-4xl">
                {report.summaryNarrative}
              </p>
            </div>

            <div className="flex items-center space-x-2 self-start lg:self-auto">
              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm active:scale-98"
                title="Export Sensitivity Matrix to CSV"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export CSV</span>
              </button>
              {onOpenAiAssistant && (
                <button
                  onClick={onOpenAiAssistant}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-700/80 text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Explain Drivers</span>
                </button>
              )}
            </div>
          </div>

          {/* Domain Breakdown Visual Meter: Frequency vs Magnitude */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-1">
            {/* 1. Frequency Domain Card */}
            <div className="bg-[#050505] p-3.5 rounded-lg border border-emerald-900/40 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider mb-1 text-emerald-400">
                <span>Threat Event Frequency (TEF/LEF)</span>
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {report.domainBreakdown.frequencyContributionPct}%
                <span className="text-xs font-normal text-zinc-400 ml-1.5 font-sans">of Total ALE Variance</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${report.domainBreakdown.frequencyContributionPct}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-2 leading-tight">
                Controls probability of breach occurrences and baseline curve onset.
              </p>
            </div>

            {/* 2. Loss Magnitude Domain Card */}
            <div className="bg-[#050505] p-3.5 rounded-lg border border-cyan-900/40 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider mb-1 text-cyan-400">
                <span>Loss Magnitude (PLM/SLM)</span>
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {report.domainBreakdown.magnitudeContributionPct}%
                <span className="text-xs font-normal text-zinc-400 ml-1.5 font-sans">of Total ALE Variance</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${report.domainBreakdown.magnitudeContributionPct}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-2 leading-tight">
                Governs single-event dollar severity and right-tail Loss Exceedance.
              </p>
            </div>

            {/* 3. Operational & Recommendation Summary */}
            <div className="bg-[#050505] p-3.5 rounded-lg border border-amber-900/40 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider mb-1 text-amber-400">
                  <span>Mitigation Strategic Focus</span>
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-zinc-200 font-mono">
                  {report.domainBreakdown.dominantDomain === 'Frequency' ? (
                    <span className="text-emerald-400 font-black">PREVENTATIVE CONTROLS PRIORITY</span>
                  ) : report.domainBreakdown.dominantDomain === 'Loss Magnitude' ? (
                    <span className="text-cyan-400 font-black">IMPACT CONTAINMENT &amp; TRANSFER</span>
                  ) : (
                    <span className="text-amber-400 font-black">BALANCED HYBRID DEFENSE</span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 font-mono mt-1.5 leading-snug">
                  {report.mitigationRecommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Loss Exceedance Curve Variance Callout */}
          <div className="mt-4 p-3 rounded-lg bg-zinc-900/90 border border-zinc-700/80 font-mono text-xs flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-zinc-300 leading-relaxed">
              <strong className="text-white">Loss Exceedance Curve (LEC) Variance Dynamic: </strong>
              {report.lecVarianceExplanation}
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Sensitivity Dashboard */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        {/* Navigation Tabs and Category Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800 font-mono text-xs">
          <div className="flex items-center space-x-1.5 bg-[#050505] p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setActiveSubView('tornado')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                activeSubView === 'tornado'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tornado Chart (P10 vs P90 Swing)
            </button>
            <button
              onClick={() => setActiveSubView('variance')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                activeSubView === 'variance'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Variance Decomposition (%)
            </button>
            <button
              onClick={() => setActiveSubView('tail_lec')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                activeSubView === 'tail_lec'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              LEC Tail Drivers (P90+ VaR)
            </button>
            <button
              onClick={() => setActiveSubView('table')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                activeSubView === 'table'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sensitivity Matrix Table
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-zinc-500 font-bold uppercase flex items-center space-x-1">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded px-2.5 py-1 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="all">All Variables ({sensitivities.length})</option>
              <option value="frequency">Frequency Domain (TEF / Vuln / LEF)</option>
              <option value="magnitude">Magnitude Domain (PLM / SLM Forms)</option>
              <option value="operational">Operational Metrics</option>
            </select>
          </div>
        </div>

        {/* View 1: Tornado Impact Chart */}
        {activeSubView === 'tornado' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-zinc-400 gap-2">
              <div>
                <span className="text-white font-bold uppercase tracking-wider">Monte Carlo Empirical Tornado Chart: </span>
                <span>Swinging each parameter between its 10th percentile (P10) and 90th percentile (P90).</span>
              </div>
              <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/60">
                Baseline Mean ALE: {formatAmount(meanAle, scenario.currency, scenario.unitScale)}
              </span>
            </div>

            {/* Custom Tornado Visualizer */}
            <div className="space-y-3 pt-2 font-mono text-xs">
              {tornadoData.map((item, idx) => {
                const maxDelta = tornadoData[0]?.swingDelta || 1;
                const lowRatio = Math.max(0, Math.min(100, ((meanAle - item.swingLow) / meanAle) * 100));
                const highRatio = Math.max(0, Math.min(100, ((item.swingHigh - meanAle) / meanAle) * 100));
                const swingDeltaFormatted = formatAmount(item.swingDelta, scenario.currency, scenario.unitScale);

                return (
                  <div
                    key={item.key}
                    className="bg-[#050505] p-3 rounded-lg border border-zinc-800/90 hover:border-zinc-700 transition-all space-y-2"
                    onMouseEnter={() => setHoveredVar(sensitivities.find(s => s.variableName === item.key) || null)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-zinc-500 font-bold w-5">#{idx + 1}</span>
                        <span className="font-bold text-white text-xs sm:text-sm">{item.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(item.domain, item.category)}`}>
                          {item.domain}
                        </span>
                        {item.lecTailRank <= 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-950/90 text-rose-300 border border-rose-800/80 uppercase">
                            Tail Rank #{item.lecTailRank}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="text-zinc-400">
                          Variance Share: <strong className="text-cyan-400">{item.variancePct}%</strong>
                        </span>
                        <span className="text-zinc-400">
                          Swing Span: <strong className="text-amber-300">±{swingDeltaFormatted}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Dual Horizontal Diverging Bar for Low vs High */}
                    <div className="grid grid-cols-12 items-center gap-2 text-[11px]">
                      {/* Left: Low P10 Result */}
                      <div className="col-span-5 flex items-center justify-end space-x-2">
                        <span className="text-emerald-400 font-bold text-[10px] truncate">
                          P10: {formatAmount(item.swingLow, scenario.currency, scenario.unitScale)}
                        </span>
                        <div className="w-24 sm:w-48 bg-zinc-900 h-3 rounded-l flex justify-end overflow-hidden">
                          <div
                            className="bg-gradient-to-l from-emerald-500 to-emerald-700 h-full rounded-l transition-all duration-300"
                            style={{ width: `${Math.min(100, (Math.abs(item.lowDiff) / (maxDelta / 2)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Center Baseline Mean Marker */}
                      <div className="col-span-2 flex flex-col items-center">
                        <div className="w-0.5 h-6 bg-zinc-600"></div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Mean</span>
                      </div>

                      {/* Right: High P90 Result */}
                      <div className="col-span-5 flex items-center justify-start space-x-2">
                        <div className="w-24 sm:w-48 bg-zinc-900 h-3 rounded-r flex justify-start overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-rose-500 to-rose-700 h-full rounded-r transition-all duration-300"
                            style={{ width: `${Math.min(100, (Math.abs(item.highDiff) / (maxDelta / 2)) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-rose-400 font-bold text-[10px] truncate">
                          P90: {formatAmount(item.swingHigh, scenario.currency, scenario.unitScale)}
                        </span>
                      </div>
                    </div>

                    {item.description && (
                      <div className="text-[10px] text-zinc-500 font-mono pt-1 border-t border-zinc-900">
                        {item.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View 2: Variance Contribution Breakdown */}
        {activeSubView === 'variance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Normalized Contribution to Overall Annual Loss Variance (% Share of $R^2$)</span>
              <span className="text-cyan-400 font-bold">Sum = 100% Decomposition</span>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={varianceData} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#71717a"
                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    unit="%"
                    label={{ value: 'Variance Contribution (%)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#09090b] border border-zinc-700 p-3 rounded-lg font-mono text-xs text-white shadow-xl">
                          <div className="font-bold text-sm text-cyan-300">{d.name}</div>
                          <div className="mt-1 text-zinc-300">
                            Variance Contribution: <strong className="text-white">{d.variancePct}%</strong>
                          </div>
                          <div className="text-zinc-400 text-[11px]">
                            Correlation with ALE ($r$): <strong>{d.correlation.toFixed(3)}</strong>
                          </div>
                          <div className="text-zinc-500 text-[10px] mt-1 uppercase font-bold">
                            Domain: {d.domain} • Category: {d.category}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="variancePct" radius={[4, 4, 0, 0]}>
                    {varianceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.domain === 'Frequency' ? '#10b981' : entry.domain === 'Magnitude' ? '#06b6d4' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-2.5 rounded bg-[#050505] border border-emerald-900/60 flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></div>
                <div>
                  <span className="font-bold text-white">Frequency Domain: </span>
                  <span className="text-emerald-400 font-bold">{report?.domainBreakdown.frequencyContributionPct}%</span>
                </div>
              </div>
              <div className="p-2.5 rounded bg-[#050505] border border-cyan-900/60 flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500 shrink-0"></div>
                <div>
                  <span className="font-bold text-white">Magnitude Domain: </span>
                  <span className="text-cyan-400 font-bold">{report?.domainBreakdown.magnitudeContributionPct}%</span>
                </div>
              </div>
              <div className="p-2.5 rounded bg-[#050505] border border-amber-900/60 flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></div>
                <div>
                  <span className="font-bold text-white">Operational Domain: </span>
                  <span className="text-amber-400 font-bold">{report?.domainBreakdown.operationalContributionPct}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 3: Loss Exceedance Tail Sensitivity (P90+ VaR Drivers) */}
        {activeSubView === 'tail_lec' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <div>
                <span className="text-rose-400 font-bold uppercase tracking-wider">LEC Tail Sensitivity Analysis: </span>
                <span>Comparing how variables behave in the top 10% severe loss years ($ALE \ge P_{90}$) vs overall mean.</span>
              </div>
              <span className="text-rose-400 font-bold bg-rose-950/60 px-2.5 py-1 rounded border border-rose-800/60">
                P90 VaR Tail Threshold
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tailLecData.slice(0, 6).map((item, idx) => (
                <div
                  key={item.key}
                  className="bg-[#050505] p-3.5 rounded-lg border border-zinc-800 space-y-2 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-800/80">
                        Tail Rank #{item.lecTailRank}
                      </span>
                      <span className="font-bold text-white text-xs">{item.name}</span>
                    </div>
                    <span className="text-rose-400 font-black text-xs">
                      {item.tailMeanRatio}x Tail Elevation
                    </span>
                  </div>

                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, item.tailMeanRatio * 35)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[11px] text-zinc-400 pt-1">
                    <span>Tail Correlation with VaR: <strong className="text-white">+{(item.tailCorr).toFixed(2)}</strong></span>
                    <span>Overall Correlation: <strong className="text-zinc-300">+{(item.overallCorr).toFixed(2)}</strong></span>
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-tight">
                    {item.tailMeanRatio > 1.4
                      ? `Critical tail driver: When a catastrophic loss occurs, ${item.name} is ${item.tailMeanRatio}x higher than normal.`
                      : `Moderate tail factor with steady contribution across both median and tail iterations.`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 4: Full Matrix Table */}
        {activeSubView === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Variable Name</th>
                  <th className="py-2.5 px-3">Domain</th>
                  <th className="py-2.5 px-3">Correlation ($r$)</th>
                  <th className="py-2.5 px-3 text-cyan-400">Variance %</th>
                  <th className="py-2.5 px-3 text-amber-300">P10–P90 Swing</th>
                  <th className="py-2.5 px-3 text-rose-400">Tail Rank</th>
                  <th className="py-2.5 px-3">Elasticity (+10%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
                {filteredSensitivities.map((s) => (
                  <tr key={s.variableName} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-zinc-500">#{s.importanceRank}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      <div>{s.displayName}</div>
                      <div className="text-[10px] text-zinc-500 truncate max-w-xs">{s.description}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(s.domain, s.category)}`}>
                        {s.domain}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-cyan-300">
                      {s.correlationWithALE > 0 ? `+${s.correlationWithALE.toFixed(3)}` : s.correlationWithALE.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 font-black text-cyan-400">{s.varianceContributionPct}%</td>
                    <td className="py-2.5 px-3 text-amber-300 font-bold">
                      ±{formatAmount(s.swingDelta, scenario.currency, scenario.unitScale)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-rose-400">
                      #{s.lecTailRank} ({s.tailMeanRatio}x)
                    </td>
                    <td className="py-2.5 px-3 text-zinc-300">
                      {s.elasticity > 0 ? `+${s.elasticity.toFixed(2)}%` : `${s.elasticity.toFixed(2)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Interactive What-If Sensitivity Simulator */}
        <div className="mt-5 p-4 rounded-xl bg-[#050505] border border-zinc-800/90 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Sensitivity-Driven What-If Control Simulator</span>
            </span>
            <span className="text-zinc-400 text-[11px]">Compare risk reduction by domain</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Threat Frequency Reduction Slider */}
            <div className="bg-[#09090b] p-3.5 rounded-lg border border-emerald-900/50 space-y-2">
              <div className="flex justify-between items-center text-emerald-400 font-bold">
                <span>Reduce Threat Frequency (TEF/LEF)</span>
                <span>-{simulatedFreqReduction}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={simulatedFreqReduction}
                onChange={(e) => setSimulatedFreqReduction(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between items-baseline pt-1 text-[11px]">
                <span className="text-zinc-400">Estimated Annual Loss Reduction:</span>
                <span className="text-emerald-300 font-black text-sm">
                  -{formatAmount(estimatedFreqReductionDollar, scenario.currency, scenario.unitScale)}
                </span>
              </div>
            </div>

            {/* Loss Magnitude Reduction Slider */}
            <div className="bg-[#09090b] p-3.5 rounded-lg border border-cyan-900/50 space-y-2">
              <div className="flex justify-between items-center text-cyan-400 font-bold">
                <span>Reduce Loss Magnitude (PLM/SLM)</span>
                <span>-{simulatedMagReduction}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={simulatedMagReduction}
                onChange={(e) => setSimulatedMagReduction(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between items-baseline pt-1 text-[11px]">
                <span className="text-zinc-400">Estimated Annual Loss Reduction:</span>
                <span className="text-cyan-300 font-black text-sm">
                  -{formatAmount(estimatedMagReductionDollar, scenario.currency, scenario.unitScale)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
