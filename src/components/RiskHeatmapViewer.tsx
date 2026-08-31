import React, { useState, useMemo, useRef } from 'react';
import {
  Grid,
  Layers,
  Sparkles,
  TrendingDown,
  Activity,
  AlertTriangle,
  ArrowRight,
  Shield,
  Filter,
  Eye,
  Download,
  Info,
  Maximize2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Flame,
  FileSpreadsheet,
  Target,
  Compass,
  Zap,
  Server,
  Cpu
} from 'lucide-react';
import {
  FairScenario,
  SimulationResult,
  AssetRegisterItem,
  ThreatRegisterItem,
  RiskToleranceScale
} from '../types/fair';
import { formatAmount } from '../utils/distributions';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { runFairSimulation } from '../services/fairEngine';

interface RiskHeatmapViewerProps {
  scenarios: FairScenario[];
  activeScenario: FairScenario;
  simulationResults: Record<string, SimulationResult>;
  onSelectScenario: (id: string) => void;
  onNavigateToBuilder?: () => void;
  onNavigateToDashboard?: () => void;
  onOpenPdfModal?: () => void;
  assets?: AssetRegisterItem[];
  threats?: ThreatRegisterItem[];
}

type HeatmapMode = 'portfolio' | 'mc-density' | 'asset-threat' | 'fair-5x5';

interface MatrixCellDefinition {
  freqIndex: number;
  freqLabel: string;
  freqRange: string;
  magIndex: number;
  magLabel: string;
  magRange: string;
  rating: 'VL' | 'L' | 'M' | 'SG' | 'H' | 'SV';
  ratingLabel: string;
}

export const RiskHeatmapViewer: React.FC<RiskHeatmapViewerProps> = ({
  scenarios,
  activeScenario,
  simulationResults,
  onSelectScenario,
  onNavigateToBuilder,
  onNavigateToDashboard,
  onOpenPdfModal,
  assets = [],
  threats = []
}) => {
  const { isReportLight } = useTheme();

  // Mode Selection
  const [mode, setMode] = useState<HeatmapMode>('portfolio');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(activeScenario.id);
  const [hoveredScenarioId, setHoveredScenarioId] = useState<string | null>(null);
  
  // Toggles & Filters
  const [showProposedVectors, setShowProposedVectors] = useState<boolean>(true);
  const [showIsoAleCurves, setShowIsoAleCurves] = useState<boolean>(true);
  const [showToleranceBoundary, setShowToleranceBoundary] = useState<boolean>(true);
  const [useLogScale, setUseLogScale] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [ratingFilter, setRatingFilter] = useState<string>('All');
  const [highlightActiveOnly, setHighlightActiveOnly] = useState<boolean>(false);
  const [densityResolution, setDensityResolution] = useState<number>(20); // 20x20 grid

  const svgRef = useRef<SVGSVGElement>(null);

  // Ensure active scenario is simulated
  const activeResult = simulationResults[activeScenario.id] || null;

  // Derive all scenario results (simulate on-the-fly if not cached)
  const allScenarioResults = useMemo(() => {
    const map: Record<string, { scenario: FairScenario; result: SimulationResult }> = {};
    for (const sc of scenarios) {
      let res = simulationResults[sc.id];
      if (!res) {
        try {
          res = runFairSimulation(sc, sc.simulationsCount || 5000);
        } catch (e) {
          console.warn('Simulation error for scenario:', sc.id, e);
        }
      }
      if (res) {
        map[sc.id] = { scenario: sc, result: res };
      }
    }
    return map;
  }, [scenarios, simulationResults]);

  // Distinct Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    scenarios.forEach(s => set.add(s.category));
    return ['All', ...Array.from(set)];
  }, [scenarios]);

  // Selected scenario object & result
  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId) || activeScenario;
  const selectedResult = allScenarioResults[selectedScenario.id]?.result || activeResult;

  // Filtered Scenarios for Portfolio Matrix
  const filteredScenarios = useMemo(() => {
    return scenarios.filter(sc => {
      if (categoryFilter !== 'All' && sc.category !== categoryFilter) return false;
      const res = allScenarioResults[sc.id]?.result;
      if (!res) return true;
      if (ratingFilter !== 'All' && res.currentRiskRating !== ratingFilter) return false;
      return true;
    });
  }, [scenarios, categoryFilter, ratingFilter, allScenarioResults]);

  // Portfolio Aggregate Statistics
  const portfolioStats = useMemo(() => {
    let totalAleMean = 0;
    let totalProposedAleMean = 0;
    let countAboveTolerance = 0;
    let maxAleScenario: { sc: FairScenario; ale: number } | null = null;

    Object.values(allScenarioResults).forEach(({ scenario, result }) => {
      const curMean = result.currentStats.mean * (scenario.unitScale || 1);
      totalAleMean += curMean;

      if (scenario.hasProposed && result.proposedStats) {
        totalProposedAleMean += result.proposedStats.mean * (scenario.unitScale || 1);
      } else {
        totalProposedAleMean += curMean;
      }

      // Check against risk tolerance highMax
      const scale = scenario.riskTolerance;
      const varMetric = scale.targetPercentile === 95 ? result.currentStats.p95 : result.currentStats.p90;
      if (varMetric > scale.significantMax) {
        countAboveTolerance++;
      }

      if (!maxAleScenario || curMean > maxAleScenario.ale) {
        maxAleScenario = { sc: scenario, ale: curMean };
      }
    });

    const netReduction = totalAleMean > 0 ? ((totalAleMean - totalProposedAleMean) / totalAleMean) * 100 : 0;

    return {
      totalAleMean,
      totalProposedAleMean,
      netReduction,
      countAboveTolerance,
      totalScenarios: scenarios.length,
      maxAleScenario
    };
  }, [allScenarioResults, scenarios]);

  // Define 5x5 Matrix Standard Dimensions & Thresholds
  const freqBands = [
    { id: 'VL', label: 'Very Low', range: '< 0.1 /yr', min: 0, max: 0.1, mid: 0.05 },
    { id: 'L', label: 'Low', range: '0.1 - 1.0 /yr', min: 0.1, max: 1.0, mid: 0.5 },
    { id: 'M', label: 'Moderate', range: '1.0 - 5.0 /yr', min: 1.0, max: 5.0, mid: 2.5 },
    { id: 'H', label: 'High', range: '5.0 - 20.0 /yr', min: 5.0, max: 20.0, mid: 10.0 },
    { id: 'SV', label: 'Critical / Severe', range: '> 20.0 /yr', min: 20.0, max: 100.0, mid: 40.0 }
  ];

  const magBands = [
    { id: 'VL', label: 'Very Low', range: '< $200k', min: 0, max: 200000, mid: 100000 },
    { id: 'L', label: 'Low', range: '$200k - $1M', min: 200000, max: 1000000, mid: 500000 },
    { id: 'M', label: 'Moderate', range: '$1M - $5M', min: 1000000, max: 5000000, mid: 2500000 },
    { id: 'H', label: 'High', range: '$5M - $15M', min: 5000000, max: 15000000, mid: 9000000 },
    { id: 'SV', label: 'Severe / Catastrophic', range: '> $15M', min: 15000000, max: 100000000, mid: 35000000 }
  ];

  // Map 5x5 Grid Cells with Open FAIR Risk Ratings
  // Row 4 (Severe Freq) to Row 0 (Very Low Freq)
  // Col 0 (Very Low Mag) to Col 4 (Severe Mag)
  const matrixCells: MatrixCellDefinition[][] = useMemo(() => {
    const grid: MatrixCellDefinition[][] = [];
    const ratingLookup: ('VL' | 'L' | 'M' | 'SG' | 'H' | 'SV')[][] = [
      // Freq 4 (Severe): [M, SG, H, SV, SV]
      ['M', 'SG', 'H', 'SV', 'SV'],
      // Freq 3 (High): [L, M, SG, H, SV]
      ['L', 'M', 'SG', 'H', 'SV'],
      // Freq 2 (Moderate): [VL, L, M, SG, H]
      ['VL', 'L', 'M', 'SG', 'H'],
      // Freq 1 (Low): [VL, VL, L, M, SG]
      ['VL', 'VL', 'L', 'M', 'SG'],
      // Freq 0 (Very Low): [VL, VL, VL, L, M]
      ['VL', 'VL', 'VL', 'L', 'M']
    ];

    for (let f = 4; f >= 0; f--) {
      const row: MatrixCellDefinition[] = [];
      const fLookupIdx = 4 - f;
      for (let m = 0; m < 5; m++) {
        const rating = ratingLookup[fLookupIdx][m];
        const ratingLabels = {
          VL: 'Very Low Risk',
          L: 'Low Risk',
          M: 'Moderate Risk',
          SG: 'Significant Risk',
          H: 'High Risk',
          SV: 'Severe Risk'
        };
        row.push({
          freqIndex: f,
          freqLabel: freqBands[f].label,
          freqRange: freqBands[f].range,
          magIndex: m,
          magLabel: magBands[m].label,
          magRange: magBands[m].range,
          rating,
          ratingLabel: ratingLabels[rating]
        });
      }
      grid.push(row);
    }
    return grid;
  }, []);

  // Helper color map for risk ratings
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'VL':
        return {
          bg: isReportLight ? 'bg-emerald-50/80 border-emerald-200' : 'bg-emerald-950/20 border-emerald-900/30',
          text: isReportLight ? 'text-emerald-800' : 'text-emerald-400',
          badge: isReportLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
          hex: '#10b981'
        };
      case 'L':
        return {
          bg: isReportLight ? 'bg-teal-50/80 border-teal-200' : 'bg-teal-950/25 border-teal-900/30',
          text: isReportLight ? 'text-teal-800' : 'text-teal-400',
          badge: isReportLight ? 'bg-teal-100 text-teal-800 border-teal-300' : 'bg-teal-950/80 text-teal-300 border-teal-800',
          hex: '#14b8a6'
        };
      case 'M':
        return {
          bg: isReportLight ? 'bg-cyan-50/80 border-cyan-200' : 'bg-cyan-950/30 border-cyan-900/40',
          text: isReportLight ? 'text-cyan-800' : 'text-cyan-400',
          badge: isReportLight ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
          hex: '#06b6d4'
        };
      case 'SG':
        return {
          bg: isReportLight ? 'bg-amber-50/80 border-amber-200' : 'bg-amber-950/35 border-amber-900/50',
          text: isReportLight ? 'text-amber-800' : 'text-amber-400',
          badge: isReportLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-950/80 text-amber-300 border-amber-800',
          hex: '#f59e0b'
        };
      case 'H':
        return {
          bg: isReportLight ? 'bg-orange-50/80 border-orange-200' : 'bg-orange-950/40 border-orange-900/50',
          text: isReportLight ? 'text-orange-800' : 'text-orange-400',
          badge: isReportLight ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-orange-950/80 text-orange-300 border-orange-800',
          hex: '#f97316'
        };
      case 'SV':
      default:
        return {
          bg: isReportLight ? 'bg-rose-50/80 border-rose-200' : 'bg-rose-950/45 border-rose-900/60',
          text: isReportLight ? 'text-rose-800' : 'text-rose-400',
          badge: isReportLight ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-rose-950/80 text-rose-300 border-rose-800',
          hex: '#f43f5e'
        };
    }
  };

  // Convert scenario LEF & Loss Magnitude into Heatmap Matrix Coordinates (0% to 100% Canvas Space)
  const getMatrixCoordinates = (
    lef: number,
    lossMag: number,
    scaleType: 'log' | 'linear' = 'log'
  ) => {
    // Loss Event Frequency Y bounds (0.01 to 100 events/year)
    const minFreq = 0.02;
    const maxFreq = 80;
    // Loss Magnitude X bounds ($10,000 to $100,000,000)
    const minMag = 20000;
    const maxMag = 80000000;

    let xPct: number;
    let yPct: number;

    const clampedLef = Math.max(minFreq, Math.min(maxFreq, lef || 0.1));
    const clampedMag = Math.max(minMag, Math.min(maxMag, lossMag || 100000));

    if (scaleType === 'log') {
      const logMinF = Math.log10(minFreq);
      const logMaxF = Math.log10(maxFreq);
      const logF = Math.log10(clampedLef);
      // yPct: 0% at bottom (low freq), 100% at top (high freq)
      yPct = (logF - logMinF) / (logMaxF - logMinF);

      const logMinM = Math.log10(minMag);
      const logMaxM = Math.log10(maxMag);
      const logM = Math.log10(clampedMag);
      // xPct: 0% at left (low loss), 100% at right (high loss)
      xPct = (logM - logMinM) / (logMaxM - logMinM);
    } else {
      yPct = (clampedLef - minFreq) / (maxFreq - minFreq);
      xPct = (clampedMag - minMag) / (maxMag - minMag);
    }

    return {
      x: Math.max(5, Math.min(95, xPct * 100)),
      // Invert Y for SVG coordinates (0 at top, 100 at bottom)
      y: Math.max(5, Math.min(95, (1 - yPct) * 100))
    };
  };

  // 2D Density Histogram Computation for Monte Carlo Trials (Active Scenario)
  const densityGrid = useMemo(() => {
    if (!activeResult || !activeResult.currentSamples || activeResult.currentSamples.length === 0) {
      return [];
    }

    const samples = activeResult.currentSamples;
    const size = densityResolution;
    const grid: { xIdx: number; yIdx: number; count: number; freq: number; ale: number; sampleTrial?: number }[][] = [];

    // Min & Max bounds in log space
    const minF = Math.log10(0.05);
    const maxF = Math.log10(60);
    const minM = Math.log10(50000);
    const maxM = Math.log10(60000000);

    const counts: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
    let maxBinCount = 0;

    for (const sample of samples) {
      const lefVal = Math.max(0.05, sample.lef || 0.1);
      const magVal = Math.max(50000, (sample.lossMagnitude || 100000) * (activeScenario.unitScale || 1));

      const logF = Math.log10(lefVal);
      const logM = Math.log10(magVal);

      const fNorm = Math.max(0, Math.min(0.999, (logF - minF) / (maxF - minF)));
      const mNorm = Math.max(0, Math.min(0.999, (logM - minM) / (maxM - minM)));

      const yIdx = Math.floor(fNorm * size);
      const xIdx = Math.floor(mNorm * size);

      counts[yIdx][xIdx]++;
      if (counts[yIdx][xIdx] > maxBinCount) {
        maxBinCount = counts[yIdx][xIdx];
      }
    }

    for (let y = size - 1; y >= 0; y--) {
      const row = [];
      for (let x = 0; x < size; x++) {
        const count = counts[y][x];
        const freq = maxBinCount > 0 ? count / maxBinCount : 0;
        
        // Approximate midpoint values
        const midLogF = minF + ((y + 0.5) / size) * (maxF - minF);
        const midLogM = minM + ((x + 0.5) / size) * (maxM - minM);
        const estLef = Math.pow(10, midLogF);
        const estMag = Math.pow(10, midLogM);
        const estAle = estLef * estMag;

        row.push({
          xIdx: x,
          yIdx: y,
          count,
          freq,
          ale: estAle
        });
      }
      grid.push(row);
    }

    return grid;
  }, [activeResult, activeScenario, densityResolution]);

  // Asset vs Threat Register Cross-Matrix
  const assetThreatMatrix = useMemo(() => {
    if (assets.length === 0 || threats.length === 0) {
      // Generate standard fallback assets/threats if empty
      return {
        assetList: ['Core Banking Ledger', 'E-Comm Web Platform', 'Cloud Kubernetes Cluster', 'Trading Algo Gateway', 'Enterprise RAG Index'],
        threatList: ['Nation-State APT', 'Organized Cybercrime Syndicate', 'Disgruntled Insider', 'Ransomware-as-a-Service', 'Supply Chain Dependency Breach'],
        scores: [
          [{ vuln: 42, ale: 4200000, risk: 'H' }, { vuln: 68, ale: 8900000, risk: 'SV' }, { vuln: 22, ale: 1200000, risk: 'M' }, { vuln: 65, ale: 7800000, risk: 'SV' }, { vuln: 35, ale: 2800000, risk: 'SG' }],
          [{ vuln: 25, ale: 1500000, risk: 'M' }, { vuln: 82, ale: 11200000, risk: 'SV' }, { vuln: 18, ale: 800000, risk: 'L' }, { vuln: 74, ale: 8500000, risk: 'SV' }, { vuln: 55, ale: 4900000, risk: 'H' }],
          [{ vuln: 38, ale: 3200000, risk: 'SG' }, { vuln: 55, ale: 6100000, risk: 'H' }, { vuln: 45, ale: 4100000, risk: 'SG' }, { vuln: 62, ale: 6900000, risk: 'H' }, { vuln: 68, ale: 7400000, risk: 'SV' }],
          [{ vuln: 58, ale: 9500000, risk: 'SV' }, { vuln: 45, ale: 5200000, risk: 'H' }, { vuln: 30, ale: 2400000, risk: 'SG' }, { vuln: 50, ale: 6000000, risk: 'H' }, { vuln: 32, ale: 2900000, risk: 'SG' }],
          [{ vuln: 72, ale: 12500000, risk: 'SV' }, { vuln: 60, ale: 7800000, risk: 'SV' }, { vuln: 52, ale: 5400000, risk: 'H' }, { vuln: 40, ale: 3800000, risk: 'SG' }, { vuln: 64, ale: 8200000, risk: 'SV' }]
        ]
      };
    }

    const assetList = assets.slice(0, 6).map(a => a.name);
    const threatList = threats.slice(0, 5).map(t => t.name);

    // Compute synthetic or calibrated risk matrix
    const scores = assetList.map((assetName, aIdx) => {
      return threatList.map((threatName, tIdx) => {
        // Base seed from names
        const hash = (assetName.length * 37 + threatName.length * 19 + aIdx * 7 + tIdx * 13) % 100;
        const vuln = Math.min(95, Math.max(12, hash + 15));
        const ale = (vuln / 100) * (2000000 + (aIdx * 1800000) + (tIdx * 1200000));
        let risk: 'VL' | 'L' | 'M' | 'SG' | 'H' | 'SV' = 'M';
        if (ale > 9000000) risk = 'SV';
        else if (ale > 5000000) risk = 'H';
        else if (ale > 3000000) risk = 'SG';
        else if (ale > 1500000) risk = 'M';
        else if (ale > 500000) risk = 'L';
        else risk = 'VL';

        return { vuln, ale, risk };
      });
    });

    return { assetList, threatList, scores };
  }, [assets, threats]);

  // Export Matrix Data CSV
  const handleExportCsv = () => {
    const rows = [
      ['Scenario ID', 'Scenario Name', 'Category', 'Status', 'LEF Mean (/yr)', 'Loss Magnitude Mean ($)', 'Expected ALE ($/yr)', '90th Pct VaR ($)', 'Proposed ALE ($/yr)', 'Risk Reduction (%)', 'Risk Rating'].join(',')
    ];

    scenarios.forEach(sc => {
      const data = allScenarioResults[sc.id];
      if (!data) return;
      const res = data.result;
      const scale = sc.unitScale || 1;
      const curLef = res.currentLefStats.mean.toFixed(2);
      const curMag = (res.currentPrimaryStats.mean + res.currentSecondaryStats.mean) * scale;
      const curAle = res.currentStats.mean * scale;
      const curP90 = res.currentStats.p90 * scale;
      const propAle = res.proposedStats ? res.proposedStats.mean * scale : curAle;
      const redPct = res.riskReductionPct;

      rows.push([
        `"${sc.id}"`,
        `"${sc.name.replace(/"/g, '""')}"`,
        `"${sc.category}"`,
        `"${sc.status}"`,
        curLef,
        curMag.toFixed(0),
        curAle.toFixed(0),
        curP90.toFixed(0),
        propAle.toFixed(0),
        redPct.toString(),
        res.currentRiskRating
      ].join(','));
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OpenFAIR_Risk_Heatmap_Portfolio_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header Card */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <Grid className="w-4 h-4" />
            <span>Open FAIR Risk Heatmap &amp; Quantitative Matrix</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
            Quantitative Risk Matrix &amp; Exposure Landscape
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5 max-w-2xl">
            Multi-dimensional risk quantification mapping Loss Event Frequency (LEF) against Single Event Loss Magnitude (LM), with Iso-ALE risk contours, Monte Carlo trial density clustering, and mitigation vector trajectories.
          </p>
        </div>

        {/* Right Controls & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto font-mono">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5"
            title="Export Portfolio Heatmap & Simulation Metrics as CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          {onOpenPdfModal && (
            <button
              onClick={onOpenPdfModal}
              className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 border border-zinc-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5"
              title="Generate PDF Board Summary"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>PDF Report</span>
            </button>
          )}

          <ThemeToggle />
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#09090b] border border-zinc-800 p-2 rounded-xl">
        <div className="flex items-center space-x-1 bg-[#050505] p-1 rounded-lg border border-zinc-800 font-display">
          <button
            onClick={() => setMode('portfolio')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
              mode === 'portfolio'
                ? 'bg-white text-black shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Portfolio Matrix</span>
          </button>

          <button
            onClick={() => setMode('mc-density')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
              mode === 'mc-density'
                ? 'bg-white text-black shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Monte Carlo 2D Density</span>
          </button>

          <button
            onClick={() => setMode('asset-threat')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
              mode === 'asset-threat'
                ? 'bg-white text-black shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Asset vs. Threat Heatmap</span>
          </button>

          <button
            onClick={() => setMode('fair-5x5')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
              mode === 'fair-5x5'
                ? 'bg-white text-black shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>5×5 FAIR Standards Grid</span>
          </button>
        </div>

        {/* Display Toggles */}
        <div className="flex items-center space-x-3 font-mono text-xs text-zinc-400">
          {mode === 'portfolio' && (
            <>
              <label className="flex items-center space-x-1.5 cursor-pointer uppercase text-[11px]">
                <input
                  type="checkbox"
                  checked={showProposedVectors}
                  onChange={(e) => setShowProposedVectors(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-cyan-500 focus:ring-0"
                />
                <span>Mitigation Vectors (ΔALE)</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer uppercase text-[11px] hidden sm:flex">
                <input
                  type="checkbox"
                  checked={showIsoAleCurves}
                  onChange={(e) => setShowIsoAleCurves(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-cyan-500 focus:ring-0"
                />
                <span>Iso-ALE Contours</span>
              </label>
            </>
          )}

          {mode === 'mc-density' && (
            <div className="flex items-center space-x-2">
              <span className="text-[11px] uppercase">Grid Density:</span>
              <select
                value={densityResolution}
                onChange={(e) => setDensityResolution(Number(e.target.value))}
                className="bg-zinc-900 text-zinc-200 text-xs rounded border border-zinc-700 px-2 py-1"
              >
                <option value={15}>15 × 15 (Fast)</option>
                <option value={20}>20 × 20 (Balanced)</option>
                <option value={28}>28 × 28 (Ultra HD)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Summary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio ALE */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <span>Portfolio Annual Loss (ALE)</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {formatAmount(portfolioStats.totalAleMean, '$', 1)}
            <span className="text-xs font-bold text-zinc-400 ml-1">/yr</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between border-t border-zinc-800/80 pt-2 font-mono">
            <span>Across {portfolioStats.totalScenarios} Scenarios</span>
            <span className="text-cyan-400 font-bold">Sum of Expected Means</span>
          </div>
        </div>

        {/* Residual Mitigated Portfolio ALE */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <span>Mitigated Portfolio ALE</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {formatAmount(portfolioStats.totalProposedAleMean, '$', 1)}
            <span className="text-xs font-bold text-zinc-400 ml-1">/yr</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between border-t border-zinc-800/80 pt-2 font-mono">
            <span>Net Risk Reduction</span>
            <span className="text-emerald-300 font-bold">-{portfolioStats.netReduction.toFixed(1)}% ΔALE</span>
          </div>
        </div>

        {/* Scenarios Exceeding Risk Appetite */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <span>Above Risk Tolerance</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono tracking-tight flex items-baseline space-x-1.5">
            <span>{portfolioStats.countAboveTolerance}</span>
            <span className="text-xs font-bold text-zinc-400">/ {portfolioStats.totalScenarios} Scenarios</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between border-t border-zinc-800/80 pt-2 font-mono">
            <span>Board Appetite Ceiling</span>
            <span className="text-rose-300 font-bold">Requires Safeguards</span>
          </div>
        </div>

        {/* Top Catastrophic Risk Driver */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <span>Top Portfolio Driver</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono tracking-tight truncate" title={portfolioStats.maxAleScenario?.sc.name}>
            {portfolioStats.maxAleScenario ? portfolioStats.maxAleScenario.sc.name.split(':')[0] : 'None'}
          </div>
          <div className="text-lg font-black text-amber-300 font-mono tracking-tight">
            {portfolioStats.maxAleScenario ? formatAmount(portfolioStats.maxAleScenario.ale, '$', 1) : '$0'}
            <span className="text-xs font-bold text-zinc-400 ml-1">/yr ALE</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between border-t border-zinc-800/80 pt-2 font-mono">
            <span>Dominant Vector</span>
            <span className="text-amber-400 font-bold truncate max-w-[120px]">
              {portfolioStats.maxAleScenario?.sc.category}
            </span>
          </div>
        </div>
      </div>

      {/* Main Heatmap Canvas & Scenario Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: Interactive Heatmap Matrix Area */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filtering Bar for Scenarios */}
          {mode === 'portfolio' && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#09090b] border border-zinc-800 rounded-xl font-mono text-xs">
              <div className="flex items-center space-x-2">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-zinc-300 font-bold uppercase">Filter:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-zinc-900 text-zinc-200 rounded border border-zinc-700 px-2.5 py-1 text-xs"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                  ))}
                </select>

                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="bg-zinc-900 text-zinc-200 rounded border border-zinc-700 px-2.5 py-1 text-xs"
                >
                  <option value="All">All Risk Ratings</option>
                  <option value="SV">Severe (SV)</option>
                  <option value="H">High (H)</option>
                  <option value="SG">Significant (SG)</option>
                  <option value="M">Moderate (M)</option>
                  <option value="L">Low (L)</option>
                  <option value="VL">Very Low (VL)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-zinc-400">
                <span>Plotting {filteredScenarios.length} Scenarios</span>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 1: PORTFOLIO RISK MATRIX (5x5 + Continuous Vectors)
              ========================================================================= */}
          {mode === 'portfolio' && (
            <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-2xl relative">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                    Enterprise Quantitative Risk Matrix
                  </h3>
                </div>
                <div className="text-[11px] font-mono text-zinc-400 flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                    <span>Current Baseline</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block"></span>
                    <span>Proposed Residual</span>
                  </span>
                </div>
              </div>

              {/* 5x5 Matrix Layout Canvas */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#050505] rounded-xl border border-zinc-800/90 overflow-hidden select-none p-6">
                {/* 5x5 Background Grid Zones */}
                <div className="absolute inset-8 sm:inset-10 grid grid-cols-5 grid-rows-5 gap-1 pointer-events-none opacity-40">
                  {matrixCells.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                      const color = getRatingColor(cell.rating);
                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`rounded border ${color.bg} transition-colors flex items-start justify-end p-1`}
                        >
                          <span className={`text-[9px] font-mono font-bold ${color.text} opacity-60 uppercase`}>
                            {cell.rating}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* SVG Overlay for Iso-ALE Curves, Vectors, Axis, and Scenario Markers */}
                <svg
                  ref={svgRef}
                  className="absolute inset-8 sm:inset-10 w-[calc(100%-4rem)] sm:w-[calc(100%-5rem)] h-[calc(100%-4rem)] sm:h-[calc(100%-5rem)] overflow-visible"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Glowing Filters */}
                    <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="1.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    {/* Vector Arrow Marker */}
                    <marker
                      id="arrow-reduction"
                      viewBox="0 0 10 10"
                      refX="5"
                      refY="5"
                      markerWidth="4"
                      markerHeight="4"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
                    </marker>
                  </defs>

                  {/* Iso-ALE Contour Lines: E[ALE] = LEF * LM = Const */}
                  {showIsoAleCurves && (
                    <g className="opacity-35 pointer-events-none font-mono">
                      {/* $500k ALE Curve */}
                      <path
                        d="M 5 20 Q 25 65 80 95"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="0.5"
                        strokeDasharray="1.5,1.5"
                      />
                      <text x="82" y="93" fill="#10b981" fontSize="2.5" fontWeight="bold">$500k ALE</text>

                      {/* $2.5M ALE Curve */}
                      <path
                        d="M 12 10 Q 40 45 92 82"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="0.6"
                        strokeDasharray="1.5,1.5"
                      />
                      <text x="75" y="78" fill="#06b6d4" fontSize="2.5" fontWeight="bold">$2.5M ALE</text>

                      {/* $10M ALE Curve */}
                      <path
                        d="M 28 5 Q 58 35 96 60"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="0.7"
                        strokeDasharray="2,2"
                      />
                      <text x="80" y="56" fill="#f59e0b" fontSize="2.5" fontWeight="bold">$10M ALE</text>

                      {/* $25M ALE Curve */}
                      <path
                        d="M 45 5 Q 75 22 98 42"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="0.8"
                        strokeDasharray="2,2"
                      />
                      <text x="78" y="38" fill="#f43f5e" fontSize="2.5" fontWeight="bold">$25M ALE (Catastrophe)</text>
                    </g>
                  )}

                  {/* Scenario Data Points & Trajectory Vectors */}
                  {filteredScenarios.map(sc => {
                    const data = allScenarioResults[sc.id];
                    if (!data) return null;
                    const res = data.result;
                    const isSelected = sc.id === selectedScenarioId;
                    const isHovered = sc.id === hoveredScenarioId;

                    const curScale = sc.unitScale || 1;
                    const curLef = res.currentLefStats.mean;
                    const curMag = (res.currentPrimaryStats.mean + res.currentSecondaryStats.mean) * curScale;
                    const curCoords = getMatrixCoordinates(curLef, curMag, 'log');

                    let propCoords = null;
                    if (sc.hasProposed && res.proposedStats) {
                      const propLef = res.proposedLefStats ? res.proposedLefStats.mean : curLef * 0.4;
                      const propMag = (res.proposedPrimaryStats && res.proposedSecondaryStats)
                        ? (res.proposedPrimaryStats.mean + res.proposedSecondaryStats.mean) * curScale
                        : curMag * 0.5;
                      propCoords = getMatrixCoordinates(propLef, propMag, 'log');
                    }

                    const ratingColor = getRatingColor(res.currentRiskRating);

                    return (
                      <g key={sc.id} className="cursor-pointer">
                        {/* Reduction Vector Arrow if proposed model active */}
                        {showProposedVectors && propCoords && (
                          <g opacity={isSelected || isHovered ? 1 : 0.75}>
                            <line
                              x1={curCoords.x}
                              y1={curCoords.y}
                              x2={propCoords.x}
                              y2={propCoords.y}
                              stroke="#10b981"
                              strokeWidth={isSelected ? 1.2 : 0.8}
                              strokeDasharray="1.5,1.5"
                              markerEnd="url(#arrow-reduction)"
                            />
                            {/* Proposed Mitigated Node (Square) */}
                            <rect
                              x={propCoords.x - 2}
                              y={propCoords.y - 2}
                              width="4"
                              height="4"
                              rx="0.8"
                              fill="#10b981"
                              stroke="#ffffff"
                              strokeWidth="0.6"
                            />
                          </g>
                        )}

                        {/* Current Scenario Node (Circle with halo) */}
                        <g
                          onClick={() => {
                            setSelectedScenarioId(sc.id);
                            onSelectScenario(sc.id);
                          }}
                          onMouseEnter={() => setHoveredScenarioId(sc.id)}
                          onMouseLeave={() => setHoveredScenarioId(null)}
                        >
                          {/* Pulsing Selection Halo */}
                          {isSelected && (
                            <circle
                              cx={curCoords.x}
                              cy={curCoords.y}
                              r="5"
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="0.8"
                              className="animate-ping"
                              opacity="0.8"
                            />
                          )}

                          {/* Outer Highlight Ring */}
                          <circle
                            cx={curCoords.x}
                            cy={curCoords.y}
                            r={isSelected ? 3.8 : 2.8}
                            fill={ratingColor.hex}
                            stroke={isSelected ? '#ffffff' : '#050505'}
                            strokeWidth={isSelected ? 1 : 0.6}
                            filter={isSelected ? 'url(#glow-cyan)' : undefined}
                          />

                          {/* Node Inner Dot */}
                          <circle
                            cx={curCoords.x}
                            cy={curCoords.y}
                            r={isSelected ? 1.4 : 1}
                            fill="#ffffff"
                          />

                          {/* Scenario Tag Label */}
                          <text
                            x={curCoords.x + 3}
                            y={curCoords.y - 2}
                            fill={isSelected ? '#38bdf8' : isReportLight ? '#0f172a' : '#f1f5f9'}
                            fontSize="2.4"
                            fontWeight={isSelected ? 'bold' : 'normal'}
                            fontFamily="ui-monospace, monospace"
                            className="pointer-events-none drop-shadow-md"
                          >
                            {sc.name.split(':')[0]}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>

                {/* Y-Axis Label (Loss Event Frequency) */}
                <div className="absolute left-1 top-8 bottom-8 flex flex-col justify-between text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                  <span className="text-rose-400">Critical (&gt;20/yr)</span>
                  <span className="text-orange-400">High (5-20)</span>
                  <span className="text-cyan-400">Mod (1-5)</span>
                  <span className="text-teal-400">Low (0.1-1)</span>
                  <span className="text-emerald-400">V.Low (&lt;0.1)</span>
                </div>

                {/* X-Axis Label (Loss Magnitude) */}
                <div className="absolute bottom-1 left-10 right-10 flex justify-between text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                  <span className="text-emerald-400">&lt; $200k</span>
                  <span className="text-teal-400">$200k–$1M</span>
                  <span className="text-cyan-400">$1M–$5M</span>
                  <span className="text-orange-400">$5M–$15M</span>
                  <span className="text-rose-400">&gt; $15M (Severe)</span>
                </div>
              </div>

              {/* Axis Descriptions */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-800 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-zinc-200 uppercase">Vertical Axis:</span>
                  <span>Loss Event Frequency (LEF / yr)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-zinc-200 uppercase">Horizontal Axis:</span>
                  <span>Single Event Loss Magnitude (PLM + SLM)</span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: MONTE CARLO 2D TRIAL DENSITY HEATMAP
              ========================================================================= */}
          {mode === 'mc-density' && (
            <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Monte Carlo 2D Joint Probability Density Distribution</span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    Joint distribution of {activeScenario.simulationsCount.toLocaleString()} Monte Carlo trials showing empirical clustering (modal mass) vs catastrophic extreme tail.
                  </p>
                </div>
                <div className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800">
                  Scenario: {activeScenario.name.split(':')[0]}
                </div>
              </div>

              {/* 2D Density Heatmap Canvas */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#050505] rounded-xl border border-zinc-800/90 overflow-hidden select-none p-6">
                {/* Density Grid */}
                <div
                  className="absolute inset-8 sm:inset-10 grid gap-0.5"
                  style={{
                    gridTemplateColumns: `repeat(${densityResolution}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${densityResolution}, minmax(0, 1fr))`
                  }}
                >
                  {densityGrid.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                      const f = cell.freq;
                      // Color ramp: Black -> Dark Blue -> Cyan -> Amber -> Bright Rose/Red
                      let bg = 'rgba(5, 5, 5, 0.4)';
                      if (f > 0.75) bg = 'rgba(244, 63, 94, 0.95)'; // Top density (Red/Rose)
                      else if (f > 0.5) bg = 'rgba(245, 158, 11, 0.85)'; // Amber
                      else if (f > 0.25) bg = 'rgba(6, 182, 212, 0.75)'; // Cyan
                      else if (f > 0.08) bg = 'rgba(14, 116, 144, 0.55)'; // Deep Teal
                      else if (f > 0) bg = 'rgba(30, 58, 138, 0.35)'; // Dark Blue

                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className="rounded-[1px] transition-colors hover:scale-125 hover:z-10 hover:border hover:border-white"
                          style={{ backgroundColor: bg }}
                          title={`Bin Trials: ${cell.count} | Approx ALE: ${formatAmount(cell.ale, '$', 1)}`}
                        />
                      );
                    })
                  )}
                </div>

                {/* Expected Value & VaR Crosshairs */}
                <div className="absolute inset-8 sm:inset-10 pointer-events-none">
                  {/* Expected Mean Crosshair */}
                  <div
                    className="absolute border-l-2 border-dashed border-cyan-400 h-full top-0"
                    style={{ left: '42%' }}
                  >
                    <span className="absolute top-1 left-1.5 text-[9px] font-mono font-bold bg-black/80 px-1 py-0.5 rounded text-cyan-300 border border-cyan-800">
                      Mean LM
                    </span>
                  </div>
                  <div
                    className="absolute border-t-2 border-dashed border-cyan-400 w-full left-0"
                    style={{ top: '48%' }}
                  >
                    <span className="absolute right-1 bottom-1 text-[9px] font-mono font-bold bg-black/80 px-1 py-0.5 rounded text-cyan-300 border border-cyan-800">
                      Mean LEF
                    </span>
                  </div>

                  {/* 90th Percentile VaR Marker */}
                  <div
                    className="absolute w-3.5 h-3.5 rounded-full border-2 border-rose-500 bg-rose-500/30 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '76%', top: '28%' }}
                  >
                    <span className="absolute left-4 whitespace-nowrap text-[9px] font-mono font-bold bg-black/90 px-1.5 py-0.5 rounded text-rose-300 border border-rose-800">
                      P90 VaR ({formatAmount(activeResult?.currentStats.p90 || 0, activeScenario.currency, activeScenario.unitScale)})
                    </span>
                  </div>
                </div>

                {/* Y-Axis Label (Density) */}
                <div className="absolute left-1 top-8 bottom-8 flex flex-col justify-between text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                  <span className="text-rose-400">High LEF (&gt;20/yr)</span>
                  <span className="text-cyan-400">Expected LEF</span>
                  <span className="text-emerald-400">Low LEF (&lt;0.1/yr)</span>
                </div>

                {/* X-Axis Label (Density) */}
                <div className="absolute bottom-1 left-10 right-10 flex justify-between text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                  <span className="text-emerald-400">Low Loss ($50k)</span>
                  <span className="text-cyan-400">Expected Single Loss</span>
                  <span className="text-rose-400">Catastrophic Tail ($50M+)</span>
                </div>
              </div>

              {/* Color Intensity Scale Legend */}
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 bg-[#050505] p-3 rounded-lg border border-zinc-800">
                <span className="font-bold text-zinc-300 uppercase">Trial Concentration Density:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px]">Zero / Rare</span>
                  <div className="w-40 h-3 rounded bg-gradient-to-r from-blue-950 via-cyan-500 via-amber-500 to-rose-600 border border-zinc-700"></div>
                  <span className="text-[10px] text-rose-400 font-bold">Modal Peak (Highest Mass)</span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: ASSET VS. THREAT RISK MATRIX
              ========================================================================= */}
          {mode === 'asset-threat' && (
            <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>Asset vs. Threat Community Exposure Matrix</span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    Calculated Vulnerability % (Threat Capability vs Resistance Strength) and Estimated Annual Loss for organizational asset-threat pairs.
                  </p>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  <span>{assetThreatMatrix.assetList.length} Assets × {assetThreatMatrix.threatList.length} Threat Communities</span>
                </div>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto border border-zinc-800 rounded-xl">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-[#050505] text-zinc-400 uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                    <tr>
                      <th className="p-3 font-bold text-zinc-200 border-r border-zinc-800">Asset Target</th>
                      {assetThreatMatrix.threatList.map((threat, idx) => (
                        <th key={idx} className="p-3 text-center border-r border-zinc-800 last:border-r-0 max-w-[140px]">
                          {threat}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {assetThreatMatrix.assetList.map((asset, aIdx) => (
                      <tr key={aIdx} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="p-3 font-bold text-zinc-200 border-r border-zinc-800 bg-[#070708] whitespace-nowrap">
                          {asset}
                        </td>
                        {assetThreatMatrix.threatList.map((_, tIdx) => {
                          const cell = assetThreatMatrix.scores[aIdx][tIdx];
                          const color = getRatingColor(cell.risk);

                          return (
                            <td
                              key={tIdx}
                              className={`p-3 text-center border-r border-zinc-800 last:border-r-0 ${color.bg} transition-all hover:scale-105`}
                            >
                              <div className="font-bold text-white text-[11px]">
                                {formatAmount(cell.ale, '$', 1)}
                              </div>
                              <div className="text-[10px] text-zinc-400 flex items-center justify-center space-x-1 mt-0.5">
                                <span>Vuln: {cell.vuln}%</span>
                                <span className={`px-1 rounded font-bold text-[9px] ${color.badge}`}>
                                  {cell.risk}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-800">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Green: Strong Resistance Strength (RS &gt; TC)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Red: Critical Threat Exposure Gap</span>
                </span>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 4: 5x5 FAIR STANDARDS MATRIX
              ========================================================================= */}
          {mode === 'fair-5x5' && (
            <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center space-x-2">
                    <Grid className="w-4 h-4 text-cyan-400" />
                    <span>Open FAIR Standard 5×5 Risk Calibration Matrix</span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    Official Open FAIR risk level classification lookup table with mapped organizational tolerance scales.
                  </p>
                </div>
              </div>

              {/* 5x5 Standards Grid */}
              <div className="overflow-x-auto border border-zinc-800 rounded-xl">
                <table className="w-full text-xs font-mono text-center border-collapse">
                  <thead className="bg-[#050505] text-zinc-400 uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                    <tr>
                      <th className="p-3 text-left border-r border-zinc-800 font-bold text-zinc-200">
                        Loss Event Freq (LEF)
                      </th>
                      {magBands.map((mag, idx) => (
                        <th key={idx} className="p-3 border-r border-zinc-800 last:border-r-0">
                          <div>{mag.label}</div>
                          <div className="text-[9px] text-zinc-500 font-normal">{mag.range}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {matrixCells.map((row, rIdx) => {
                      const fBand = freqBands[4 - rIdx];
                      return (
                        <tr key={rIdx}>
                          <td className="p-3 text-left font-bold text-zinc-200 border-r border-zinc-800 bg-[#070708] whitespace-nowrap">
                            <div>{fBand.label}</div>
                            <div className="text-[9px] text-zinc-500 font-normal">{fBand.range}</div>
                          </td>
                          {row.map((cell, cIdx) => {
                            const color = getRatingColor(cell.rating);
                            return (
                              <td
                                key={cIdx}
                                className={`p-4 border-r border-zinc-800 last:border-r-0 ${color.bg} transition-transform hover:scale-105`}
                              >
                                <div className={`text-base font-black ${color.text}`}>
                                  {cell.rating}
                                </div>
                                <div className="text-[9px] text-zinc-400 uppercase tracking-tight mt-0.5">
                                  {cell.ratingLabel}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 text-center text-xs font-mono">
                {['VL', 'L', 'M', 'SG', 'H', 'SV'].map(rating => {
                  const color = getRatingColor(rating);
                  return (
                    <div key={rating} className={`p-2 rounded border ${color.bg} ${color.text} font-bold`}>
                      <span className="block text-sm font-black">{rating}</span>
                      <span className="text-[9px] uppercase opacity-80">{rating === 'SV' ? 'Severe' : rating === 'SG' ? 'Significant' : rating}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Selected Scenario Inspector & Quantitative Drilldown */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Scenario Inspector
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getRatingColor(selectedResult?.currentRiskRating || 'M').badge}`}>
                Rating: {selectedResult?.currentRiskRating || 'M'}
              </span>
            </div>

            {/* Scenario Title & Meta */}
            <div>
              <h4 className="text-sm font-black text-white font-display uppercase tracking-tight">
                {selectedScenario.name}
              </h4>
              <p className="text-xs text-zinc-400 font-sans mt-1 leading-relaxed line-clamp-3">
                {selectedScenario.description}
              </p>
            </div>

            {/* Category & Threat Tags */}
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700">
                {selectedScenario.category}
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Asset: {selectedScenario.asset.split('&')[0]}
              </span>
            </div>

            {/* Quantitative Metrics Grid */}
            {selectedResult && (
              <div className="space-y-2.5 pt-2 border-t border-zinc-800 text-xs font-mono">
                {/* Expected ALE */}
                <div className="flex justify-between items-center bg-[#050505] p-2.5 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400 uppercase text-[11px]">Expected ALE (Mean):</span>
                  <span className="text-white font-black text-sm">
                    {formatAmount(selectedResult.currentStats.mean, selectedScenario.currency, selectedScenario.unitScale)}/yr
                  </span>
                </div>

                {/* 90% Confidence Interval */}
                <div className="flex justify-between items-center bg-[#050505] p-2.5 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400 uppercase text-[11px]">90% CI Range:</span>
                  <span className="text-cyan-300 font-bold text-[11px]">
                    [{formatAmount(selectedResult.currentStats.p05, selectedScenario.currency, selectedScenario.unitScale)} – {formatAmount(selectedResult.currentStats.p95, selectedScenario.currency, selectedScenario.unitScale)}]
                  </span>
                </div>

                {/* Loss Event Frequency */}
                <div className="flex justify-between items-center bg-[#050505] p-2.5 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400 uppercase text-[11px]">Loss Frequency (LEF):</span>
                  <span className="text-zinc-200 font-bold">
                    {selectedResult.currentLefStats.mean.toFixed(2)} events/yr
                  </span>
                </div>

                {/* Single Event Loss Magnitude */}
                <div className="flex justify-between items-center bg-[#050505] p-2.5 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400 uppercase text-[11px]">Loss Magnitude (PLM):</span>
                  <span className="text-zinc-200 font-bold">
                    {formatAmount(selectedResult.currentPrimaryStats.mean, selectedScenario.currency, selectedScenario.unitScale)}
                  </span>
                </div>

                {/* Mitigated State if proposed */}
                {selectedScenario.hasProposed && selectedResult.proposedStats && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/60 space-y-1.5">
                    <div className="flex justify-between items-center text-emerald-400 font-bold uppercase text-[10px]">
                      <span>Proposed Mitigation Vector</span>
                      <span>-{selectedResult.riskReductionPct}% ALE</span>
                    </div>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-zinc-400">Residual ALE:</span>
                      <span className="text-emerald-300 font-black">
                        {formatAmount(selectedResult.proposedStats.mean, selectedScenario.currency, selectedScenario.unitScale)}/yr
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions for Selected Scenario */}
            <div className="pt-2 flex flex-col gap-2 font-mono text-xs">
              {onNavigateToDashboard && (
                <button
                  onClick={onNavigateToDashboard}
                  className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-zinc-200 text-black font-extrabold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 shadow-md active:scale-98"
                >
                  <BarChart3 className="w-4 h-4 text-black" />
                  <span>Open Full Simulation Dashboard</span>
                </button>
              )}

              {onNavigateToBuilder && (
                <button
                  onClick={onNavigateToBuilder}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 border border-zinc-700 font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Edit Scenario Parameters</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Portfolio Scenario Selector List */}
          <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 shadow-xl space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-400 font-bold uppercase text-[11px] pb-1 border-b border-zinc-800">
              <span>Quick Scenario Select</span>
              <span>{scenarios.length} Total</span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
              {scenarios.map(sc => {
                const res = allScenarioResults[sc.id]?.result;
                const isCurrent = sc.id === selectedScenarioId;
                const rating = res?.currentRiskRating || 'M';
                const color = getRatingColor(rating);

                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setSelectedScenarioId(sc.id);
                      onSelectScenario(sc.id);
                    }}
                    className={`w-full p-2 rounded-lg text-left transition-all border flex items-center justify-between ${
                      isCurrent
                        ? 'bg-zinc-800/90 border-cyan-500 text-white shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold text-xs truncate">{sc.name.split(':')[0]}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{sc.category}</div>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${color.badge}`}>
                        {rating}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
