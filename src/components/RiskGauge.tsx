import React, { useState } from 'react';
import { RiskToleranceScale } from '../types/fair';
import { formatAmount } from '../utils/distributions';
import { Info, HelpCircle, CheckCircle2, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface RiskGaugeProps {
  value: number;
  scale: RiskToleranceScale;
  currency: string;
  unitScale: number;
  rating: 'VL' | 'L' | 'M' | 'SG' | 'H' | 'SV';
  proposedValue?: number;
  proposedRating?: 'VL' | 'L' | 'M' | 'SG' | 'H' | 'SV';
  hasProposed?: boolean;
  title?: string;
  subtitle?: string;
  onOpenGlossaryModal?: (term?: string) => void;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  value,
  scale,
  currency,
  unitScale,
  rating,
  proposedValue,
  proposedRating,
  hasProposed = false,
  title = 'Open FAIR Risk Appetite Dial',
  subtitle = `Value at Risk (${scale.targetPercentile || 90}th Percentile)`,
  onOpenGlossaryModal
}) => {
  // State for toggling between Inherent (Current), Residual (Mitigated), or Probe Test Mode
  const [viewMode, setViewMode] = useState<'inherent' | 'residual' | 'probe'>(
    'inherent'
  );
  const [probeRating, setProbeRating] = useState<'VL' | 'L' | 'M' | 'SG' | 'H' | 'SV'>('M');
  const [showFormulaExplanation, setShowFormulaExplanation] = useState(false);

  // Compute test probe value based on appetite bounds
  const getProbeValue = (tier: 'VL' | 'L' | 'M' | 'SG' | 'H' | 'SV') => {
    switch (tier) {
      case 'VL':
        return scale.veryLowMax * 0.6;
      case 'L':
        return scale.veryLowMax + (scale.lowMax - scale.veryLowMax) * 0.5;
      case 'M':
        return scale.lowMax + (scale.moderateMax - scale.lowMax) * 0.5;
      case 'SG':
        return scale.moderateMax + (scale.significantMax - scale.moderateMax) * 0.5;
      case 'H':
        return scale.significantMax + (scale.highMax - scale.significantMax) * 0.5;
      case 'SV':
        return scale.highMax * 1.4;
    }
  };

  // Determine active displayed value and rating
  let activeValue = value;
  let activeRating = rating;
  let activeLabel = 'Inherent State (Current)';

  if (viewMode === 'residual' && hasProposed && proposedValue !== undefined && proposedRating !== undefined) {
    activeValue = proposedValue;
    activeRating = proposedRating;
    activeLabel = 'Residual State (Mitigated)';
  } else if (viewMode === 'probe') {
    activeValue = getProbeValue(probeRating);
    activeRating = probeRating;
    activeLabel = `Interactive Calibration Test (${probeRating})`;
  }

  // Determine normalized position 0 to 100 for needle
  let pos = 50;
  if (activeValue <= scale.veryLowMax) {
    pos = (activeValue / Math.max(1, scale.veryLowMax)) * 16.7;
  } else if (activeValue <= scale.lowMax) {
    pos = 16.7 + ((activeValue - scale.veryLowMax) / Math.max(1, scale.lowMax - scale.veryLowMax)) * 16.7;
  } else if (activeValue <= scale.moderateMax) {
    pos = 33.4 + ((activeValue - scale.lowMax) / Math.max(1, scale.moderateMax - scale.lowMax)) * 16.7;
  } else if (activeValue <= scale.significantMax) {
    pos = 50.1 + ((activeValue - scale.moderateMax) / Math.max(1, scale.significantMax - scale.moderateMax)) * 16.7;
  } else if (activeValue <= scale.highMax) {
    pos = 66.8 + ((activeValue - scale.significantMax) / Math.max(1, scale.highMax - scale.significantMax)) * 16.7;
  } else {
    const excess = Math.min(1, (activeValue - scale.highMax) / (scale.highMax * 0.5));
    pos = 83.5 + excess * 16.5;
  }
  pos = Math.max(2, Math.min(98, pos));

  // Map 0 - 100 to angle: -90 deg (left) to +90 deg (right)
  const angle = (pos / 100) * 180 - 90;

  // Segment colors and labels
  const segments = [
    { label: 'VL', name: 'Very Low', color: '#16a34a', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', desc: `< ${formatAmount(scale.veryLowMax, currency, unitScale)}` },
    { label: 'L', name: 'Low', color: '#84cc16', bg: 'bg-lime-500/20 text-lime-400 border-lime-500/40', desc: `${formatAmount(scale.veryLowMax, currency, unitScale)} - ${formatAmount(scale.lowMax, currency, unitScale)}` },
    { label: 'M', name: 'Moderate', color: '#eab308', bg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', desc: `${formatAmount(scale.lowMax, currency, unitScale)} - ${formatAmount(scale.moderateMax, currency, unitScale)}` },
    { label: 'SG', name: 'Significant', color: '#f97316', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/40', desc: `${formatAmount(scale.moderateMax, currency, unitScale)} - ${formatAmount(scale.significantMax, currency, unitScale)}` },
    { label: 'H', name: 'High', color: '#ef4444', bg: 'bg-red-500/20 text-red-400 border-red-500/40', desc: `${formatAmount(scale.significantMax, currency, unitScale)} - ${formatAmount(scale.highMax, currency, unitScale)}` },
    { label: 'SV', name: 'Severe', color: '#991b1b', bg: 'bg-rose-950 text-rose-300 border-rose-600/50', desc: `> ${formatAmount(scale.highMax, currency, unitScale)}` }
  ];

  const currentSegment = segments.find(s => s.label === activeRating) || segments[2];

  return (
    <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between relative shadow-xl space-y-4">
      {/* Header with Title and Mode Switcher */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-white font-display flex items-center gap-1.5">
            <span>{title}</span>
            <button
              onClick={() => setShowFormulaExplanation(!showFormulaExplanation)}
              title="View Open FAIR Risk Rating Math & Scale Logic"
              className="text-zinc-400 hover:text-cyan-400 transition-colors p-0.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </h4>
          <p className="text-[10px] text-zinc-400 font-mono uppercase mt-0.5">{subtitle}</p>
        </div>

        {/* View Mode Toggle: Current vs Proposed vs Test Probe */}
        <div className="flex items-center gap-1 bg-[#050505] p-1 rounded-lg border border-zinc-800 font-mono text-[10px]">
          <button
            onClick={() => setViewMode('inherent')}
            className={`px-2 py-1 rounded font-bold transition-all ${
              viewMode === 'inherent'
                ? 'bg-zinc-700 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Inherent ({rating})
          </button>
          {hasProposed && proposedRating && (
            <button
              onClick={() => setViewMode('residual')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                viewMode === 'residual'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-cyan-400 hover:text-cyan-200'
              }`}
            >
              Residual ({proposedRating})
            </button>
          )}
          <button
            onClick={() => setViewMode(viewMode === 'probe' ? 'inherent' : 'probe')}
            title="Interactive Gauge Probe Tester"
            className={`px-2 py-1 rounded font-bold transition-all flex items-center gap-1 ${
              viewMode === 'probe'
                ? 'bg-amber-600 text-white shadow'
                : 'text-zinc-400 hover:text-amber-300'
            }`}
          >
            <SlidersHorizontal className="w-2.5 h-2.5" />
            <span>Test Probe</span>
          </button>
        </div>
      </div>

      {/* Interactive Level Tester Pills (Visible when Probe is active) */}
      {viewMode === 'probe' && (
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-2.5 space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] text-amber-300 font-mono font-bold">
            <span>Interactive Level Probe (Test Low / Med / High):</span>
            <button
              onClick={() => setViewMode('inherent')}
              className="text-zinc-400 hover:text-white text-[10px] flex items-center gap-1 underline"
            >
              <RefreshCw className="w-3 h-3" /> Reset to Sim
            </button>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {(['VL', 'L', 'M', 'SG', 'H', 'SV'] as const).map(tier => {
              const seg = segments.find(s => s.label === tier)!;
              const isSelected = probeRating === tier;
              return (
                <button
                  key={tier}
                  onClick={() => setProbeRating(tier)}
                  className={`py-1 px-1 rounded text-[10px] font-mono font-bold uppercase transition-all text-center border ${
                    isSelected
                      ? `${seg.bg} ring-1 ring-white/50 scale-105`
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active State Badge */}
      <div className="flex items-center justify-between font-mono">
        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse inline-block"></span>
          {activeLabel}
        </span>
        <div className={`px-2.5 py-1 rounded text-xs font-bold font-mono uppercase tracking-wider border ${currentSegment.bg}`}>
          {currentSegment.label} • {currentSegment.name}
        </div>
      </div>

      {/* SVG Arc Gauge */}
      <div className="relative w-full max-w-[260px] h-[140px] flex items-center justify-center my-1 mx-auto">
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="needleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#18181b"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* 6 Gauge Segments */}
          {/* 1. Very Low (0 - 16.7%) -> -90deg to -60deg */}
          <path d="M 20 100 A 80 80 0 0 1 30.7 60" fill="none" stroke="#10b981" strokeWidth="14" />
          {/* 2. Low (16.7 - 33.4%) -> -60deg to -30deg */}
          <path d="M 30.7 60 A 80 80 0 0 1 60 30.7" fill="none" stroke="#84cc16" strokeWidth="14" />
          {/* 3. Moderate (33.4 - 50%) -> -30deg to 0deg */}
          <path d="M 60 30.7 A 80 80 0 0 1 100 20" fill="none" stroke="#eab308" strokeWidth="14" />
          {/* 4. Significant (50 - 66.8%) -> 0deg to 30deg */}
          <path d="M 100 20 A 80 80 0 0 1 140 30.7" fill="none" stroke="#f97316" strokeWidth="14" />
          {/* 5. High (66.8 - 83.5%) -> 30deg to 60deg */}
          <path d="M 140 30.7 A 80 80 0 0 1 169.3 60" fill="none" stroke="#ef4444" strokeWidth="14" />
          {/* 6. Severe (83.5 - 100%) -> 60deg to 90deg */}
          <path d="M 169.3 60 A 80 80 0 0 1 180 100" fill="none" stroke="#991b1b" strokeWidth="14" />

          {/* Center Pivot Circle */}
          <circle cx="100" cy="100" r="10" fill="#09090b" stroke="#52525b" strokeWidth="3" />

          {/* Needle Pointer */}
          <g transform={`rotate(${angle} 100 100)`} className="transition-transform duration-500 ease-out">
            <polygon points="97,100 103,100 100,24" fill={viewMode === 'residual' ? '#38bdf8' : '#f59e0b'} />
            <circle cx="100" cy="100" r="5" fill={viewMode === 'residual' ? '#38bdf8' : '#f59e0b'} />
          </g>

          {/* Rating Text Inside Arc */}
          <text
            x="100"
            y="85"
            textAnchor="middle"
            className="text-base font-black fill-white font-mono"
            style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'JetBrains Mono' }}
          >
            {activeRating}
          </text>
          <text
            x="100"
            y="98"
            textAnchor="middle"
            className="text-[10px] fill-zinc-400 font-mono font-bold"
            style={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }}
          >
            {formatAmount(activeValue, currency, unitScale)}
          </text>
        </svg>
      </div>

      {/* Threshold Legend Bar */}
      <div className="w-full grid grid-cols-6 gap-1 text-[10px] text-center text-zinc-400 mt-1 border-t border-zinc-800 pt-2.5 font-mono">
        <div>
          <span className="text-emerald-400 block font-bold">VL (V.Low)</span>
          <span className="text-[9px]">&lt;{formatAmount(scale.veryLowMax, currency, unitScale)}</span>
        </div>
        <div>
          <span className="text-lime-400 block font-bold">L (Low)</span>
          <span className="text-[9px]">{formatAmount(scale.lowMax, currency, unitScale)}</span>
        </div>
        <div>
          <span className="text-yellow-400 block font-bold">M (Mod)</span>
          <span className="text-[9px]">{formatAmount(scale.moderateMax, currency, unitScale)}</span>
        </div>
        <div>
          <span className="text-orange-400 block font-bold">SG (Signif)</span>
          <span className="text-[9px]">{formatAmount(scale.significantMax, currency, unitScale)}</span>
        </div>
        <div>
          <span className="text-red-400 block font-bold">H (High)</span>
          <span className="text-[9px]">{formatAmount(scale.highMax, currency, unitScale)}</span>
        </div>
        <div>
          <span className="text-rose-400 block font-bold">SV (Severe)</span>
          <span className="text-[9px]">&gt;{formatAmount(scale.highMax, currency, unitScale)}</span>
        </div>
      </div>

      {/* Math & Rating Explanation Box */}
      {showFormulaExplanation && (
        <div className="bg-[#050505] p-3 rounded-lg border border-zinc-800 text-[11px] text-zinc-300 font-mono space-y-2 mt-2">
          <div className="flex items-center justify-between text-white font-bold pb-1 border-b border-zinc-800">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Info className="w-3.5 h-3.5" />
              Open FAIR Rating Logic & Thresholds
            </span>
            <button
              onClick={() => setShowFormulaExplanation(false)}
              className="text-zinc-500 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1 text-zinc-400 leading-relaxed text-[10px]">
            <p>
              • <strong className="text-white">Why &quot;SV&quot;?</strong> &quot;SV&quot; stands for <strong className="text-rose-400">Severe</strong> in the standard 6-tier Open FAIR Risk Appetite Scale (VL &rarr; L &rarr; M &rarr; SG &rarr; H &rarr; SV).
            </p>
            <p>
              • <strong className="text-white">Calculation:</strong> The simulation evaluates the {scale.targetPercentile || 90}th Percentile Value-at-Risk (<span className="text-amber-300">{formatAmount(activeValue, currency, unitScale)}</span>) against the organization&apos;s Risk Tolerance bounds.
            </p>
            <p>
              • When Value-at-Risk exceeds the High Bound (<span className="text-zinc-200">{formatAmount(scale.highMax, currency, unitScale)}</span>), it is correctly categorized as <strong className="text-rose-400">Severe (SV)</strong>.
            </p>
            {onOpenGlossaryModal && (
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">Need more ontology details?</span>
                <button
                  onClick={() => onOpenGlossaryModal('SV')}
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline decoration-dotted text-[10px] flex items-center gap-1"
                >
                  <span>Open Full FAIR Lexicon & Formulas</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

