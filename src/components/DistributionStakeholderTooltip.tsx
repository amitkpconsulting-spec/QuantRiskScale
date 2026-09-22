import React, { useState, useRef, useEffect } from 'react';
import {
  HelpCircle,
  TrendingUp,
  Info,
  Check,
  Zap,
  Sliders,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { DistributionType } from '../types/fair';

export type ParameterContextType =
  | 'threat-frequency'
  | 'vulnerability'
  | 'financial-primary'
  | 'financial-secondary'
  | 'operational';

interface DistributionStakeholderTooltipProps {
  currentDistribution?: DistributionType;
  onSelectDistribution?: (dist: DistributionType) => void;
  parameterName: string;
  contextType?: ParameterContextType;
  unit?: string;
  compact?: boolean;
}

interface DistributionInfo {
  id: DistributionType;
  title: string;
  stakeholderLabel: string;
  tagline: string;
  analogy: string;
  explanation: string;
  whenToUse: string;
  curveColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  svgShape: (accentColor: string) => React.ReactNode;
}

export const DISTRIBUTION_CATALOG: Record<DistributionType, DistributionInfo> = {
  pert: {
    id: 'pert',
    title: 'PERT (Beta-PERT)',
    stakeholderLabel: 'Expert Consensus (3-Point Bounded)',
    tagline: 'Best when experts know realistic minimum and maximum boundaries',
    analogy: 'Like asking 5 senior engineers for their best-case, expected, and worst-case timeline for a project launch.',
    explanation:
      'You provide your Minimum, Most Likely, and Maximum. PERT forms a smooth, realistic hill centered on your most likely scenario without letting numbers spike into unrealistic fantasy territory.',
    whenToUse:
      'Recommended default across Open FAIR. Ideal when quantitative historical data is scarce but domain experts can bound best/worst cases.',
    curveColor: '#06b6d4', // Cyan
    badgeBg: 'bg-cyan-950/80',
    badgeText: 'text-cyan-300',
    borderColor: 'border-cyan-500/40',
    svgShape: (color) => (
      <svg viewBox="0 0 100 40" className="w-full h-8 overflow-visible">
        {/* Baseline */}
        <line x1="2" y1="36" x2="98" y2="36" stroke="#3f3f46" strokeWidth="1.5" />
        {/* Bounded PERT Curve */}
        <path
          d="M 5,36 Q 30,36 42,8 Q 52,36 95,36"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Fill underneath */}
        <path
          d="M 5,36 Q 30,36 42,8 Q 52,36 95,36 Z"
          fill={color}
          fillOpacity="0.15"
        />
        {/* Mode marker */}
        <line x1="42" y1="8" x2="42" y2="36" stroke={color} strokeWidth="1" strokeDasharray="2,2" />
        <circle cx="42" cy="8" r="2.5" fill={color} />
      </svg>
    )
  },
  lognormal: {
    id: 'lognormal',
    title: 'LogNormal',
    stakeholderLabel: 'Catastrophic Runway (Long-Tail / Black Swan)',
    tagline: 'Best for financial losses where catastrophic runaway costs are possible',
    analogy: 'Like commercial insurance claims—minor routine incidents happen frequently, but rare superstorms create massive multi-million dollar payouts.',
    explanation:
      'Most incidents cost modest, routine sums, but there is always a realistic risk of a runaway, multi-million dollar event (e.g. major data breaches or class-action lawsuits). Values cannot drop below zero, but the high end stretches far to the right.',
    whenToUse:
      'The industry standard for financial loss magnitude, incident response costs, regulatory penalties, and legal defense fees.',
    curveColor: '#f59e0b', // Amber
    badgeBg: 'bg-amber-950/80',
    badgeText: 'text-amber-300',
    borderColor: 'border-amber-500/40',
    svgShape: (color) => (
      <svg viewBox="0 0 100 40" className="w-full h-8 overflow-visible">
        {/* Baseline */}
        <line x1="2" y1="36" x2="98" y2="36" stroke="#3f3f46" strokeWidth="1.5" />
        {/* LogNormal Right-Skewed Curve */}
        <path
          d="M 5,36 C 15,36 20,4 28,10 C 40,20 65,34 95,35.5"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Fill underneath */}
        <path
          d="M 5,36 C 15,36 20,4 28,10 C 40,20 65,34 95,35.5 L 95,36 Z"
          fill={color}
          fillOpacity="0.15"
        />
        {/* Mode marker */}
        <line x1="24" y1="6" x2="24" y2="36" stroke={color} strokeWidth="1" strokeDasharray="2,2" />
        <circle cx="24" cy="6" r="2.5" fill={color} />
      </svg>
    )
  },
  normal: {
    id: 'normal',
    title: 'Normal (Bell Curve)',
    stakeholderLabel: 'Balanced Symmetrical (Predictable Average)',
    tagline: 'Best for routine, predictable operational processes without extreme surprises',
    analogy: 'Like the daily commuting time to the office or the delivery arrival time of standard replacement parts.',
    explanation:
      'The classical symmetrical bell curve. The outcome is equally likely to be $10k above average as it is to be $10k below average. Balanced on both sides with zero bias toward surprise catastrophe.',
    whenToUse:
      'Use when you have stable, predictable operational metrics or mature historical telemetry that naturally clusters symmetrically around an average.',
    curveColor: '#a855f7', // Purple
    badgeBg: 'bg-purple-950/80',
    badgeText: 'text-purple-300',
    borderColor: 'border-purple-500/40',
    svgShape: (color) => (
      <svg viewBox="0 0 100 40" className="w-full h-8 overflow-visible">
        {/* Baseline */}
        <line x1="2" y1="36" x2="98" y2="36" stroke="#3f3f46" strokeWidth="1.5" />
        {/* Symmetrical Normal Curve */}
        <path
          d="M 5,36 C 25,36 35,6 50,6 C 65,6 75,36 95,36"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Fill underneath */}
        <path
          d="M 5,36 C 25,36 35,6 50,6 C 65,6 75,36 95,36 Z"
          fill={color}
          fillOpacity="0.15"
        />
        {/* Mean/Mode marker */}
        <line x1="50" y1="6" x2="50" y2="36" stroke={color} strokeWidth="1" strokeDasharray="2,2" />
        <circle cx="50" cy="6" r="2.5" fill={color} />
      </svg>
    )
  }
};

export const CONTEXT_RECOMMENDATIONS: Record<
  ParameterContextType,
  {
    recommended: DistributionType;
    rationale: string;
    stakeholderTip: string;
  }
> = {
  'threat-frequency': {
    recommended: 'pert',
    rationale:
      'Cyber threat events occur with calibrated minimum and maximum boundaries based on annual telemetry. PERT prevents unbounded infinite attack estimates.',
    stakeholderTip:
      'Executives and board auditors prefer PERT here because it grounds attack likelihood in demonstrable historical limits.'
  },
  'vulnerability': {
    recommended: 'pert',
    rationale:
      'Control resistance and threat capability operate on 0–100% scales. PERT or Normal honors these physical boundaries without negative probabilities.',
    stakeholderTip:
      'Keep bounded to prevent illogical simulation outputs like "110% control failure probability".'
  },
  'financial-primary': {
    recommended: 'lognormal',
    rationale:
      'Financial costs (productivity loss, response fees) have a low baseline with potential for severe, runaway escalations during prolonged incidents.',
    stakeholderTip:
      'LogNormal is the CFO gold standard: it captures true "tail risk" where one catastrophic incident could exceed routine budgets by 5x.'
  },
  'financial-secondary': {
    recommended: 'lognormal',
    rationale:
      'Litigation, class-action settlements, and SEC/GDPR fines are notoriously right-skewed with extreme catastrophe ceilings.',
    stakeholderTip:
      'Regulatory penalties often have statutory maximums but severe headline risk. LogNormal reflects empirical enforcement trends.'
  },
  'operational': {
    recommended: 'pert',
    rationale:
      'Outage hours cannot exceed 8,760 hours/year. PERT provides realistic engineering SLAs without allowing impossible numbers.',
    stakeholderTip:
      'Use PERT to mirror your disaster recovery MTTR (Mean Time to Recover) SLAs.'
  }
};

export const DistributionStakeholderTooltip: React.FC<DistributionStakeholderTooltipProps> = ({
  currentDistribution = 'pert',
  onSelectDistribution,
  parameterName,
  contextType = 'financial-primary',
  unit = '',
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<DistributionType>(currentDistribution);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep selectedTab in sync if external prop changes
  useEffect(() => {
    setSelectedTab(currentDistribution);
  }, [currentDistribution]);

  // Handle outside click to dismiss
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeInfo = DISTRIBUTION_CATALOG[selectedTab];
  const contextGuidance = CONTEXT_RECOMMENDATIONS[contextType];

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase transition-all duration-150 border ${
          currentDistribution === 'pert'
            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/90'
            : currentDistribution === 'lognormal'
            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-900/90'
            : 'bg-purple-950/80 text-purple-300 border-purple-500/40 hover:bg-purple-900/90'
        }`}
        title={`Distribution: ${DISTRIBUTION_CATALOG[currentDistribution].title}. Click to view Stakeholder Guide & switch distributions.`}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: DISTRIBUTION_CATALOG[currentDistribution].curveColor }} />
        <span>{currentDistribution.toUpperCase()}</span>
        <HelpCircle className="w-3 h-3 opacity-70 hover:opacity-100" />
      </button>

      {/* Popover Tooltip Dialog */}
      {isOpen && (
        <div
          className="absolute z-50 right-0 sm:left-0 sm:right-auto mt-2 w-80 sm:w-96 rounded-2xl bg-[#09090b] border border-zinc-700 shadow-2xl p-4 font-mono text-xs text-zinc-300 animate-in fade-in zoom-in-95 duration-150"
          style={{ maxWidth: '90vw' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
            <div>
              <div className="flex items-center space-x-1.5 text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Stakeholder Distribution Guide</span>
              </div>
              <h4 className="text-sm font-bold text-white font-display mt-0.5">
                {parameterName} {unit ? `(${unit})` : ''}
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white px-1.5 py-0.5 rounded text-xs"
            >
              ✕
            </button>
          </div>

          {/* Context-Aware Stakeholder Recommendation Alert */}
          {contextGuidance && (
            <div className="my-3 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-cyan-400">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Context-Aware Recommendation:</span>
                <span className="uppercase text-white underline decoration-cyan-400 decoration-2 underline-offset-2">
                  {contextGuidance.recommended}
                </span>
              </div>
              <p className="text-zinc-300 font-sans leading-snug">
                {contextGuidance.rationale}
              </p>
            </div>
          )}

          {/* 3-Way Distribution Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#050505] rounded-xl border border-zinc-800 text-[11px]">
            {(['pert', 'lognormal', 'normal'] as DistributionType[]).map((dist) => {
              const item = DISTRIBUTION_CATALOG[dist];
              const isSelected = selectedTab === dist;
              const isCurrent = currentDistribution === dist;

              return (
                <button
                  key={dist}
                  type="button"
                  onClick={() => {
                    setSelectedTab(dist);
                    if (onSelectDistribution) {
                      onSelectDistribution(dist);
                    }
                  }}
                  className={`py-1.5 px-2 rounded-lg text-center font-bold transition-all flex flex-col items-center justify-center relative ${
                    isSelected
                      ? `${item.badgeBg} ${item.badgeText} border ${item.borderColor} shadow-sm`
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{dist.toUpperCase()}</span>
                    {isCurrent && <Check className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <span className="text-[9px] font-normal opacity-80 truncate max-w-full">
                    {dist === 'pert' ? 'Bounded' : dist === 'lognormal' ? 'Fat-Tail' : 'Bell Curve'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Distribution Breakdown for Stakeholders */}
          <div className="mt-3.5 space-y-3">
            {/* Visual Curve Graphic */}
            <div className="p-3 rounded-xl bg-[#050505] border border-zinc-800/80">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-bold mb-1">
                <span>Curve Shape Simulation</span>
                <span style={{ color: activeInfo.curveColor }}>{activeInfo.title}</span>
              </div>
              {activeInfo.svgShape(activeInfo.curveColor)}
              <div className="text-[10px] text-zinc-400 font-sans text-center mt-1">
                {activeInfo.stakeholderLabel}
              </div>
            </div>

            {/* Non-Technical Stakeholder Explanation */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Simple Stakeholder Explanation
              </div>
              <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                {activeInfo.explanation}
              </p>
            </div>

            {/* Business Analogy */}
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] font-sans">
              <span className="font-bold text-amber-400 font-mono text-[10px] uppercase block mb-0.5">
                💡 Boardroom Analogy:
              </span>
              <span className="text-zinc-300 italic">"{activeInfo.analogy}"</span>
            </div>

            {/* When to Use */}
            <div className="text-[11px] font-sans text-zinc-400">
              <strong className="text-zinc-300 font-mono text-[10px] uppercase block mb-0.5">
                When to use this model:
              </strong>
              {activeInfo.whenToUse}
            </div>
          </div>

          {/* Action Footer */}
          {onSelectDistribution && (
            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">
                Applied in Monte Carlo trials
              </span>
              <button
                type="button"
                onClick={() => {
                  onSelectDistribution(selectedTab);
                  setIsOpen(false);
                }}
                className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-xs"
              >
                Apply {selectedTab.toUpperCase()}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
