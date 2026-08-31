import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { SimulationResult, FairScenario, HistogramBin, SimulationSamplePoint } from '../types/fair';
import { formatAmount } from '../utils/distributions';
import {
  AlertTriangle,
  Flame,
  TrendingDown,
  Layers,
  Activity,
  Maximize2,
  Info,
  Sparkles,
  ShieldAlert,
  Sliders,
  Eye,
  BarChart2
} from 'lucide-react';

interface D3FatTailHistogramProps {
  scenario: FairScenario;
  result: SimulationResult;
  onOpenGlossaryModal?: (term?: string) => void;
  embedded?: boolean;
}

type ViewMode = 'combined' | 'density' | 'bins' | 'cdf';
type TailThreshold = 'p90' | 'p95' | 'p99';

export const D3FatTailHistogram: React.FC<D3FatTailHistogramProps> = ({
  scenario,
  result,
  onOpenGlossaryModal,
  embedded = false
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // User Interactive State
  const [viewMode, setViewMode] = useState<ViewMode>('combined');
  const [tailThreshold, setTailThreshold] = useState<TailThreshold>('p90');
  const [isLogScale, setIsLogScale] = useState<boolean>(false);
  const [showProposed, setShowProposed] = useState<boolean>(scenario.hasProposed && !!result.proposedStats);
  const [hoveredData, setHoveredData] = useState<{
    loss: number;
    density: number;
    count: number;
    cumPct: number;
    isTail: boolean;
    xPos: number;
    yPos: number;
  } | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 700,
    height: 340
  });

  const curStats = result.currentStats;
  const propStats = result.proposedStats;

  // Selected Tail Cutoff Value
  const tailCutoffValue = useMemo(() => {
    if (tailThreshold === 'p90') return curStats.p90;
    if (tailThreshold === 'p95') return curStats.p95;
    return curStats.p99;
  }, [tailThreshold, curStats]);

  // Compute Tail Risk Metrics (Expected Shortfall / CVaR, Tail Severity Ratio)
  const tailAnalytics = useMemo(() => {
    // Calculate Conditional VaR (Expected Shortfall) from sampled points
    const curSamples = result.sampledPointsCur?.map(s => s.totalAle) || [];
    const tailLosses = curSamples.filter(v => v >= tailCutoffValue);
    const expectedShortfall = tailLosses.length > 0
      ? d3.mean(tailLosses) || tailCutoffValue
      : (curStats.p99 + tailCutoffValue) / 2;

    const medianLoss = curStats.p50 > 0 ? curStats.p50 : 1;
    const tailMultiplier = (expectedShortfall / medianLoss).toFixed(1);

    // Proposed Expected Shortfall
    let propExpectedShortfall: number | null = null;
    let tailRiskReductionPct: number | null = null;

    if (scenario.hasProposed && result.proposedStats) {
      const propCutoff = tailThreshold === 'p90' ? result.proposedStats.p90 : (tailThreshold === 'p95' ? result.proposedStats.p95 : result.proposedStats.p99);
      const propSamples = result.sampledPointsProp?.map(s => s.totalAle) || [];
      const propTailLosses = propSamples.filter(v => v >= propCutoff);
      propExpectedShortfall = propTailLosses.length > 0
        ? d3.mean(propTailLosses) || propCutoff
        : (result.proposedStats.p99 + propCutoff) / 2;

      if (expectedShortfall > 0 && propExpectedShortfall !== null) {
        tailRiskReductionPct = Math.max(0, Math.round(((expectedShortfall - propExpectedShortfall) / expectedShortfall) * 100));
      }
    }

    const tailPctLabel = tailThreshold === 'p90' ? 'Top 10%' : (tailThreshold === 'p95' ? 'Top 5%' : 'Top 1%');

    return {
      tailCutoffValue,
      expectedShortfall,
      tailMultiplier,
      tailPctLabel,
      propExpectedShortfall,
      tailRiskReductionPct,
      tailCount: tailLosses.length
    };
  }, [result, tailCutoffValue, tailThreshold, curStats, scenario.hasProposed]);

  // Track Container Size with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 200) {
        setDimensions({
          width,
          height: Math.max(340, Math.min(420, width * 0.48))
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Main D3 Rendering Effect
  useEffect(() => {
    if (!svgRef.current || dimensions.width <= 0 || dimensions.height <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const margin = { top: 30, right: 35, bottom: 45, left: 55 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    if (innerWidth <= 50 || innerHeight <= 50) return;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Definitions (Gradients, Patterns, Filters)
    const defs = svg.append('defs');

    // Current Histogram Gradient
    const currentGrad = defs
      .append('linearGradient')
      .attr('id', 'd3CurrentBarGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    currentGrad.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.9);
    currentGrad.append('stop').attr('offset', '100%').attr('stop-color', '#0891b2').attr('stop-opacity', 0.3);

    // Fat Tail Bar Gradient (Warning Rose / Amber)
    const tailGrad = defs
      .append('linearGradient')
      .attr('id', 'd3TailBarGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    tailGrad.append('stop').attr('offset', '0%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0.95);
    tailGrad.append('stop').attr('offset', '100%').attr('stop-color', '#be123c').attr('stop-opacity', 0.4);

    // Proposed Bar Gradient (Emerald)
    const propGrad = defs
      .append('linearGradient')
      .attr('id', 'd3PropBarGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    propGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.85);
    propGrad.append('stop').attr('offset', '100%').attr('stop-color', '#047857').attr('stop-opacity', 0.25);

    // Fat Tail Shading Area Gradient
    const tailAreaGrad = defs
      .append('linearGradient')
      .attr('id', 'd3TailAreaGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    tailAreaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#e11d48').attr('stop-opacity', 0.22);
    tailAreaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#e11d48').attr('stop-opacity', 0.03);

    // Density Current Area Gradient
    const densityCurGrad = defs
      .append('linearGradient')
      .attr('id', 'd3DensityCurGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    densityCurGrad.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.35);
    densityCurGrad.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.0);

    // Hazard Stripes Pattern for Fat Tail Risk Zone
    const pattern = defs
      .append('pattern')
      .attr('id', 'd3HazardPattern')
      .attr('width', 12)
      .attr('height', 12)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('patternTransform', 'rotate(45)');
    pattern
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 12)
      .attr('stroke', 'rgba(244, 63, 94, 0.15)')
      .attr('stroke-width', 3);

    // Extract Histogram Bins & Prepare Ranges
    const curBins = result.currentHistogram || [];
    const propBins = result.proposedHistogram || [];

    const minX = Math.max(0, curStats.min || 0);
    const maxX = Math.max(curStats.max * 1.05, 100);

    // X Scale (Linear vs Log)
    let xScale: d3.ScaleContinuousNumeric<number, number>;
    if (isLogScale) {
      const safeMin = Math.max(1, minX > 0 ? minX : (curBins[0]?.binMin || 1));
      xScale = d3.scaleLog().domain([safeMin, maxX]).range([0, innerWidth]).nice();
    } else {
      xScale = d3.scaleLinear().domain([minX, maxX]).range([0, innerWidth]).nice();
    }

    // Y Scale (Max trial count or frequency)
    const maxCurCount = d3.max(curBins, (d: HistogramBin) => d.count) ?? 100;
    const maxPropCount = showProposed && propBins.length > 0 ? (d3.max(propBins, (d: HistogramBin) => d.count) ?? 0) : 0;
    const maxCount = Math.max(Number(maxCurCount), Number(maxPropCount)) * 1.15;

    const yScale = d3.scaleLinear().domain([0, maxCount]).range([innerHeight, 0]).nice();

    // Gridlines
    const yGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => '').ticks(5);
    g.append('g')
      .attr('class', 'grid-lines')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#1f2937')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-opacity', 0.6);
    g.select('.grid-lines .domain').remove();

    // Draw Tail Risk Zone Shaded Background
    const tailX = Math.max(0, xScale(tailCutoffValue));
    const tailWidth = Math.max(0, innerWidth - tailX);

    if (tailWidth > 0) {
      // Solid/Gradient warning background
      g.append('rect')
        .attr('x', tailX)
        .attr('y', 0)
        .attr('width', tailWidth)
        .attr('height', innerHeight)
        .attr('fill', 'url(#d3TailAreaGrad)')
        .attr('pointer-events', 'none');

      // Hazard Stripes Pattern overlay
      g.append('rect')
        .attr('x', tailX)
        .attr('y', 0)
        .attr('width', tailWidth)
        .attr('height', innerHeight)
        .attr('fill', 'url(#d3HazardPattern)')
        .attr('pointer-events', 'none');

      // Top Tail Banner Label
      g.append('text')
        .attr('x', tailX + 8)
        .attr('y', 14)
        .attr('fill', '#fb7185')
        .attr('font-size', '10px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', '700')
        .text(`FAT TAIL RISK ZONE (≥ ${tailThreshold.toUpperCase()}: ${formatAmount(tailCutoffValue, scenario.currency, scenario.unitScale)})`);
    }

    // Draw Histogram Bars (if viewMode is 'combined' or 'bins')
    if (viewMode === 'combined' || viewMode === 'bins') {
      // Proposed Bars (if enabled)
      if (showProposed && propBins.length > 0) {
        g.selectAll('.bar-prop')
          .data(propBins)
          .enter()
          .append('rect')
          .attr('class', 'bar-prop')
          .attr('x', (d: HistogramBin) => {
            const x = isLogScale ? Math.max(1, d.binMin) : d.binMin;
            return xScale(x);
          })
          .attr('y', (d: HistogramBin) => yScale(d.count))
          .attr('width', (d: HistogramBin) => {
            const x1 = isLogScale ? Math.max(1, d.binMin) : d.binMin;
            const x2 = isLogScale ? Math.max(1.1, d.binMax) : d.binMax;
            return Math.max(1, xScale(x2) - xScale(x1) - 1);
          })
          .attr('height', (d: HistogramBin) => Math.max(0, innerHeight - yScale(d.count)))
          .attr('fill', 'url(#d3PropBarGrad)')
          .attr('stroke', '#10b981')
          .attr('stroke-width', 1)
          .attr('opacity', 0.5);
      }

      // Current Bars
      g.selectAll('.bar-cur')
        .data(curBins)
        .enter()
        .append('rect')
        .attr('class', 'bar-cur')
        .attr('x', (d: HistogramBin) => {
          const x = isLogScale ? Math.max(1, d.binMin) : d.binMin;
          return xScale(x);
        })
        .attr('y', (d: HistogramBin) => yScale(d.count))
        .attr('width', (d: HistogramBin) => {
          const x1 = isLogScale ? Math.max(1, d.binMin) : d.binMin;
          const x2 = isLogScale ? Math.max(1.1, d.binMax) : d.binMax;
          return Math.max(1, xScale(x2) - xScale(x1) - 1);
        })
        .attr('height', (d: HistogramBin) => Math.max(0, innerHeight - yScale(d.count)))
        .attr('fill', (d: HistogramBin) => (d.binMax >= tailCutoffValue ? 'url(#d3TailBarGrad)' : 'url(#d3CurrentBarGrad)'))
        .attr('stroke', (d: HistogramBin) => (d.binMax >= tailCutoffValue ? '#f43f5e' : '#0891b2'))
        .attr('stroke-width', 1)
        .attr('rx', 1.5)
        .attr('opacity', viewMode === 'combined' ? 0.75 : 0.95);
    }

    // Build Continuous Density Curve (KDE approximation from histogram data / samples)
    const points = curBins.map(b => ({
      x: (b.binMin + b.binMax) / 2,
      count: b.count,
      cumPct: b.cumulativeFrequency
    }));

    // Area & Line Generator for Density Curve
    const areaGenerator = d3.area<{ x: number; count: number }>()
      .x(d => xScale(isLogScale ? Math.max(1, d.x) : d.x))
      .y0(innerHeight)
      .y1(d => yScale(d.count))
      .curve(d3.curveMonotoneX);

    const lineGenerator = d3.line<{ x: number; count: number }>()
      .x(d => xScale(isLogScale ? Math.max(1, d.x) : d.x))
      .y(d => yScale(d.count))
      .curve(d3.curveMonotoneX);

    // Draw Smooth Density Curve (if 'combined' or 'density')
    if (viewMode === 'combined' || viewMode === 'density') {
      // Area Fill
      g.append('path')
        .datum(points)
        .attr('fill', 'url(#d3DensityCurGrad)')
        .attr('d', areaGenerator);

      // Line Stroke
      g.append('path')
        .datum(points)
        .attr('fill', 'none')
        .attr('stroke', '#22d3ee')
        .attr('stroke-width', 2.5)
        .attr('d', lineGenerator);

      // Proposed Density Line (if enabled)
      if (showProposed && propBins.length > 0) {
        const propPoints = propBins.map(b => ({
          x: (b.binMin + b.binMax) / 2,
          count: b.count
        }));

        const propLineGenerator = d3.line<{ x: number; count: number }>()
          .x(d => xScale(isLogScale ? Math.max(1, d.x) : d.x))
          .y(d => yScale(d.count))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(propPoints)
          .attr('fill', 'none')
          .attr('stroke', '#34d399')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '4,3')
          .attr('d', propLineGenerator);
      }
    }

    // Cumulative CDF Line (if 'cdf' mode)
    if (viewMode === 'cdf') {
      const cdfYScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

      const cdfLine = d3.line<{ x: number; cumPct: number }>()
        .x(d => xScale(isLogScale ? Math.max(1, d.x) : d.x))
        .y(d => cdfYScale(d.cumPct))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(points)
        .attr('fill', 'none')
        .attr('stroke', '#f43f5e')
        .attr('stroke-width', 2.5)
        .attr('d', cdfLine);

      // Right Axis for CDF %
      const rightAxis = d3.axisRight(cdfYScale).ticks(5).tickFormat(d => `${d}%`);
      g.append('g')
        .attr('transform', `translate(${innerWidth}, 0)`)
        .call(rightAxis)
        .selectAll('text')
        .attr('fill', '#f43f5e')
        .attr('font-size', '10px')
        .attr('font-family', 'JetBrains Mono');
    }

    // Percentile Marker Reference Lines (Median, Mean, P90, P95, P99)
    const percentileMarkers = [
      { label: 'P50 (Median)', value: curStats.p50, color: '#38bdf8', dash: '3,3', textAnchor: 'middle' },
      { label: 'Mean (ALE)', value: curStats.mean, color: '#34d399', dash: '4,2', textAnchor: 'middle' },
      { label: `P90 (${formatAmount(curStats.p90, scenario.currency, scenario.unitScale)})`, value: curStats.p90, color: '#fbbf24', dash: '4,4', textAnchor: 'start' },
      { label: `P95 (${formatAmount(curStats.p95, scenario.currency, scenario.unitScale)})`, value: curStats.p95, color: '#f87171', dash: '2,2', textAnchor: 'start' }
    ];

    percentileMarkers.forEach(m => {
      const xVal = isLogScale ? Math.max(1, m.value) : m.value;
      const xPos = xScale(xVal);
      if (xPos >= 0 && xPos <= innerWidth) {
        // Vertical dashed line
        g.append('line')
          .attr('x1', xPos)
          .attr('y1', 0)
          .attr('x2', xPos)
          .attr('y2', innerHeight)
          .attr('stroke', m.color)
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', m.dash)
          .attr('opacity', 0.85);

        // Top tag pill
        const tagG = g.append('g').attr('transform', `translate(${xPos}, ${innerHeight - 6})`);
        tagG.append('circle').attr('r', 3).attr('fill', m.color);
      }
    });

    // Bottom X-Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(isLogScale ? 6 : Math.min(8, Math.floor(innerWidth / 90)))
      .tickFormat(d => formatAmount(Number(d), scenario.currency, scenario.unitScale));

    const gx = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    gx.selectAll('text')
      .attr('fill', '#9ca3af')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('transform', 'rotate(-15)')
      .attr('text-anchor', 'end')
      .attr('dy', '0.5em');

    gx.select('.domain').attr('stroke', '#374151');
    gx.selectAll('line').attr('stroke', '#374151');

    // Left Y-Axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => Number(d).toLocaleString());

    const gy = g.append('g').call(yAxis);
    gy.selectAll('text')
      .attr('fill', '#9ca3af')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace');
    gy.select('.domain').attr('stroke', '#374151');
    gy.selectAll('line').attr('stroke', '#374151');

    // Y Axis Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -42)
      .attr('x', -innerHeight / 2)
      .attr('fill', '#9ca3af')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text(viewMode === 'cdf' ? 'Cumulative %' : 'Monte Carlo Trials Count');

    // Interactive Invisible Overlay for Mousemove / Crosshair
    const crosshairLine = g.append('line')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0)
      .attr('y1', 0)
      .attr('y2', innerHeight);

    const crosshairCircle = g.append('circle')
      .attr('r', 4)
      .attr('fill', '#06b6d4')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('opacity', 0);

    const overlay = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    overlay.on('mousemove', (event: MouseEvent) => {
      const [mx, my] = d3.pointer(event);
      const lossVal = xScale.invert(mx);

      // Find nearest histogram bin
      let nearestBin = curBins[0];
      let minDiff = Infinity;
      curBins.forEach(b => {
        const mid = (b.binMin + b.binMax) / 2;
        const diff = Math.abs(mid - lossVal);
        if (diff < minDiff) {
          minDiff = diff;
          nearestBin = b;
        }
      });

      if (nearestBin) {
        const isTail = nearestBin.binMax >= tailCutoffValue;
        const binMidX = xScale((nearestBin.binMin + nearestBin.binMax) / 2);
        const binY = yScale(nearestBin.count);

        crosshairLine.attr('x1', binMidX).attr('x2', binMidX).attr('opacity', 0.8);
        crosshairCircle
          .attr('cx', binMidX)
          .attr('cy', binY)
          .attr('fill', isTail ? '#f43f5e' : '#06b6d4')
          .attr('opacity', 1);

        setHoveredData({
          loss: (nearestBin.binMin + nearestBin.binMax) / 2,
          density: nearestBin.frequency * 100,
          count: nearestBin.count,
          cumPct: nearestBin.cumulativeFrequency,
          isTail,
          xPos: mx + margin.left,
          yPos: my + margin.top
        });
      }
    });

    overlay.on('mouseleave', () => {
      crosshairLine.attr('opacity', 0);
      crosshairCircle.attr('opacity', 0);
      setHoveredData(null);
    });

  }, [dimensions, result, viewMode, tailCutoffValue, tailThreshold, isLogScale, showProposed, curStats, scenario.currency, scenario.unitScale]);

  return (
    <div className={`${embedded ? 'space-y-3.5 pt-1' : 'bg-[#09090b] border border-zinc-800 rounded-xl p-4 lg:p-5 shadow-2xl space-y-4'} font-sans relative`}>
      {/* Top Header & Interactive Visual Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2.5 border-b border-zinc-800/90 font-mono">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
              <span>Kernel Density &amp; Fat-Tail Risk Model</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-mono font-bold">
                Extreme Tail Analyzer
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
            Empirical probability density visualizing severe right-skewed cyber catastrophes beyond standard averages.
          </p>
        </div>

        {/* View Mode & Threshold Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Modes */}
          <div className="flex items-center space-x-1 bg-[#050505] p-1 rounded-lg border border-zinc-800 text-[11px]">
            <button
              onClick={() => setViewMode('combined')}
              className={`px-2.5 py-1 rounded font-bold uppercase transition-all ${
                viewMode === 'combined' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
              title="Overlay Bins with Continuous Density Curve"
            >
              Density + Bins
            </button>
            <button
              onClick={() => setViewMode('density')}
              className={`px-2.5 py-1 rounded font-bold uppercase transition-all ${
                viewMode === 'density' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
              title="Continuous Kernel Density Estimate Curve"
            >
              KDE Curve
            </button>
            <button
              onClick={() => setViewMode('bins')}
              className={`px-2.5 py-1 rounded font-bold uppercase transition-all ${
                viewMode === 'bins' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
              title="Discrete Histogram Frequency Bars"
            >
              Bars
            </button>
            <button
              onClick={() => setViewMode('cdf')}
              className={`px-2.5 py-1 rounded font-bold uppercase transition-all ${
                viewMode === 'cdf' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
              title="Cumulative Distribution Function (CDF)"
            >
              CDF
            </button>
          </div>

          {/* Tail Threshold Toggle */}
          <div className="flex items-center space-x-1 bg-[#050505] p-1 rounded-lg border border-zinc-800 text-[11px]">
            <span className="text-[10px] text-zinc-500 font-bold px-1 uppercase">Tail:</span>
            <button
              onClick={() => setTailThreshold('p90')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                tailThreshold === 'p90' ? 'bg-amber-500 text-black' : 'text-amber-400/70 hover:text-amber-300'
              }`}
              title="Highlight Top 10% Fat Tail (P90 VaR)"
            >
              P90
            </button>
            <button
              onClick={() => setTailThreshold('p95')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                tailThreshold === 'p95' ? 'bg-rose-500 text-white' : 'text-rose-400/70 hover:text-rose-300'
              }`}
              title="Highlight Top 5% Fat Tail (P95 Extreme)"
            >
              P95
            </button>
            <button
              onClick={() => setTailThreshold('p99')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                tailThreshold === 'p99' ? 'bg-red-600 text-white' : 'text-red-400/70 hover:text-red-300'
              }`}
              title="Highlight Top 1% Black-Swan Catastrophe (P99)"
            >
              P99
            </button>
          </div>

          {/* Log Scale & Proposed Toggles */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1.5 text-[11px] text-zinc-300 bg-zinc-900/90 px-2.5 py-1.5 rounded-lg border border-zinc-800 cursor-pointer hover:border-zinc-700">
              <input
                type="checkbox"
                checked={isLogScale}
                onChange={e => setIsLogScale(e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
              />
              <span className="font-bold">Log Scale</span>
            </label>

            {scenario.hasProposed && result.proposedStats && (
              <label className="flex items-center space-x-1.5 text-[11px] text-emerald-300 bg-emerald-950/40 px-2.5 py-1.5 rounded-lg border border-emerald-800/80 cursor-pointer hover:border-emerald-700">
                <input
                  type="checkbox"
                  checked={showProposed}
                  onChange={e => setShowProposed(e.target.checked)}
                  className="rounded bg-zinc-800 border-emerald-700 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="font-bold">Proposed Residual</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Fat-Tail Quantitative Executive Analytics KPI Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        {/* 1. Tail Cutoff VaR */}
        <div className="bg-[#050505] p-3 rounded-lg border border-zinc-800/90 flex flex-col justify-between">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Tail Cutoff ({tailThreshold.toUpperCase()})</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-black text-amber-400 mt-1">
            {formatAmount(tailAnalytics.tailCutoffValue, scenario.currency, scenario.unitScale)}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            {tailAnalytics.tailPctLabel} loss exceedance threshold
          </div>
        </div>

        {/* 2. Expected Shortfall / Conditional VaR */}
        <div className="bg-[#050505] p-3 rounded-lg border border-rose-950/70 bg-rose-950/10 flex flex-col justify-between">
          <div className="text-[10px] text-rose-300 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Expected Shortfall (CVaR)</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-lg font-black text-rose-400 mt-1">
            {formatAmount(tailAnalytics.expectedShortfall, scenario.currency, scenario.unitScale)}
          </div>
          <div className="text-[10px] text-rose-300/80 mt-0.5">
            Average loss when in tail event
          </div>
        </div>

        {/* 3. Fat-Tail Multiplier */}
        <div className="bg-[#050505] p-3 rounded-lg border border-zinc-800/90 flex flex-col justify-between">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Tail Multiplier (vs P50)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-black text-cyan-400 mt-1">
            {tailAnalytics.tailMultiplier}x Median
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            Severe tail multiple over typical year
          </div>
        </div>

        {/* 4. Residual Tail Reduction or Max Loss */}
        {scenario.hasProposed && tailAnalytics.tailRiskReductionPct !== null ? (
          <div className="bg-[#050505] p-3 rounded-lg border border-emerald-900/60 bg-emerald-950/20 flex flex-col justify-between">
            <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Tail Risk Reduction</span>
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-emerald-400 mt-1">
              -{tailAnalytics.tailRiskReductionPct}%
            </div>
            <div className="text-[10px] text-emerald-300/80 mt-0.5">
              Residual CVaR: {formatAmount(tailAnalytics.propExpectedShortfall || 0, scenario.currency, scenario.unitScale)}
            </div>
          </div>
        ) : (
          <div className="bg-[#050505] p-3 rounded-lg border border-zinc-800/90 flex flex-col justify-between">
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Maximum Simulated Loss</span>
              <Activity className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-lg font-black text-white mt-1">
              {formatAmount(curStats.max, scenario.currency, scenario.unitScale)}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              Worst single-year breach scenario
            </div>
          </div>
        )}
      </div>

      {/* D3 Canvas Container */}
      <div ref={containerRef} className="w-full relative bg-[#060608] rounded-xl border border-zinc-800/80 overflow-hidden">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto select-none block"
        />

        {/* Interactive Floating Hover Tooltip */}
        {hoveredData && (
          <div
            className="absolute pointer-events-none z-30 px-3 py-2.5 rounded-lg bg-zinc-900/95 border border-zinc-700 shadow-2xl backdrop-blur-md font-mono text-xs transform -translate-x-1/2 -translate-y-full -mt-2 transition-transform duration-75"
            style={{
              left: `${Math.max(100, Math.min(dimensions.width - 100, hoveredData.xPos))}px`,
              top: `${Math.max(60, hoveredData.yPos)}px`
            }}
          >
            <div className="flex items-center justify-between gap-3 pb-1 border-b border-zinc-800 mb-1.5">
              <span className="font-bold text-white text-[11px]">
                Loss: {formatAmount(hoveredData.loss, scenario.currency, scenario.unitScale)}
              </span>
              {hoveredData.isTail && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  FAT TAIL
                </span>
              )}
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between gap-4 text-zinc-400">
                <span>Empirical Trials:</span>
                <strong className="text-cyan-300">{hoveredData.count.toLocaleString()} years</strong>
              </div>
              <div className="flex justify-between gap-4 text-zinc-400">
                <span>Probability Density:</span>
                <strong className="text-white">{hoveredData.density.toFixed(2)}%</strong>
              </div>
              <div className="flex justify-between gap-4 text-zinc-400">
                <span>Cumulative Percentile:</span>
                <strong className="text-rose-400">{hoveredData.cumPct.toFixed(1)}th %ile</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Percentile Marker Guide */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pt-2 border-t border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500 border border-cyan-400"></span>
            <span className="text-zinc-300 text-[11px]">Inherent Distribution</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 border border-rose-400"></span>
            <span className="text-rose-300 text-[11px]">Fat-Tail Catastrophe Zone (≥{tailThreshold.toUpperCase()})</span>
          </div>

          {showProposed && (
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400"></span>
              <span className="text-emerald-300 text-[11px]">Proposed Residual Distribution</span>
            </div>
          )}
        </div>

        {/* Informative Ontology Explainer */}
        <div className="text-[11px] text-zinc-400 flex items-center space-x-1">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Fat-tail demonstrates why averages underestimate high-severity breaches.</span>
        </div>
      </div>
    </div>
  );
};
