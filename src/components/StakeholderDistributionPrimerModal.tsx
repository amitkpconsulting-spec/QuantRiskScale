import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  Activity,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { DISTRIBUTION_CATALOG } from './DistributionStakeholderTooltip';
import { DistributionType } from '../types/fair';

interface StakeholderDistributionPrimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StakeholderDistributionPrimerModal: React.FC<StakeholderDistributionPrimerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedDist, setSelectedDist] = useState<DistributionType>('pert');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
      <div
        className="bg-[#09090b] border border-zinc-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-zinc-950 via-[#0d0e14] to-zinc-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                <span>Executive &amp; Board Guide</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">Open FAIR™ Parametric Modeling</span>
              </div>
              <h2 className="text-lg font-bold text-white font-display">
                Understanding Distribution Types: PERT, LogNormal, &amp; Normal
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-300">
          {/* Executive Summary Card */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase text-[11px]">
              <Sparkles className="w-4 h-4" />
              <span>Non-Technical Stakeholder Takeaway</span>
            </div>
            <p className="text-zinc-300 font-sans leading-relaxed text-xs sm:text-sm">
              In traditional risk matrices, teams assign arbitrary "1 to 5" scores that obscure actual financial risk.
              In quantitative FAIR modeling, we replace guesswork with <strong>probability distributions</strong>.
              A distribution simply represents <em>how uncertainty is shaped</em>: is the risk bounded by realistic limits, balanced symmetrically like a coin toss, or prone to rare multi-million dollar runaway catastrophes?
            </p>
          </div>

          {/* 3-Column Comparative Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['pert', 'lognormal', 'normal'] as DistributionType[]).map((type) => {
              const info = DISTRIBUTION_CATALOG[type];
              const isSelected = selectedDist === type;

              return (
                <div
                  key={type}
                  onClick={() => setSelectedDist(type)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${info.badgeBg} ${info.borderColor} ring-1 ${info.borderColor} shadow-lg`
                      : 'bg-[#050505] border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${info.badgeBg} ${info.badgeText} ${info.borderColor}`}>
                        {type.toUpperCase()}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>

                    <div className="py-1">
                      {info.svgShape(info.curveColor)}
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm font-display">{info.title}</h4>
                      <div className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-tight">{info.stakeholderLabel}</div>
                    </div>

                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      {info.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[10px] text-zinc-400 font-mono">
                    <span className="font-bold text-zinc-300 uppercase block mb-0.5">Boardroom Analogy:</span>
                    <span className="italic font-sans text-zinc-300">"{info.analogy}"</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Selected Distribution Deep Dive */}
          <div className="p-5 rounded-xl bg-[#050505] border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DISTRIBUTION_CATALOG[selectedDist].curveColor }} />
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                  Deep Dive: {DISTRIBUTION_CATALOG[selectedDist].title}
                </h3>
              </div>
              <span className="text-[10px] text-zinc-400 uppercase font-mono">
                {DISTRIBUTION_CATALOG[selectedDist].stakeholderLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-2">
                <h5 className="text-[10px] font-mono uppercase font-bold text-zinc-400">
                  How It Behaves in Monte Carlo Simulations
                </h5>
                <p className="text-zinc-300 leading-relaxed">
                  {DISTRIBUTION_CATALOG[selectedDist].explanation}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-[10px] font-mono uppercase font-bold text-zinc-400">
                  When Risk Managers Choose This Model
                </h5>
                <p className="text-zinc-300 leading-relaxed">
                  {DISTRIBUTION_CATALOG[selectedDist].whenToUse}
                </p>
              </div>
            </div>

            {/* Questions to ask subject matter experts */}
            <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] font-sans space-y-1">
              <span className="text-cyan-400 font-bold font-mono text-[10px] uppercase block">
                🎯 Elicitation Question for Business Owners:
              </span>
              <p className="text-zinc-300">
                {selectedDist === 'pert' &&
                  '"If you consider your experience over the last 5 years, what is the absolute best case, the most typical outcome, and the realistic worst case without assuming impossible Hollywood scenarios?"'}
                {selectedDist === 'lognormal' &&
                  '"Most incidents stay manageable, but if this crisis spirals—involving national regulators, forensic law firms, and customer lawsuits—how far could the loss ceiling stretch before stabilization?"'}
                {selectedDist === 'normal' &&
                  '"Is this a routine operational workflow where fluctuations above and below standard operating costs are naturally balanced without extreme outliers?"'}
              </p>
            </div>
          </div>

          {/* Quick Reference Decision Table */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="p-2.5">Parameter Category</th>
                  <th className="p-2.5">Recommended Distribution</th>
                  <th className="p-2.5">Stakeholder Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                <tr>
                  <td className="p-2.5 text-white font-bold">Threat Frequency (TEF, CF, PoA)</td>
                  <td className="p-2.5 text-cyan-400 font-bold">PERT</td>
                  <td className="p-2.5 text-zinc-400 font-sans">Bounded by realistic annual security logs; prevents unphysical infinite attacks.</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-white font-bold">Vulnerability &amp; Control Strength</td>
                  <td className="p-2.5 text-cyan-400 font-bold">PERT / Normal</td>
                  <td className="p-2.5 text-zinc-400 font-sans">Restricted to 0–100% probabilities; aligns with SOC2 and NIST CSF control scores.</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-white font-bold">Primary Loss (Response, Productivity)</td>
                  <td className="p-2.5 text-amber-400 font-bold">LogNormal</td>
                  <td className="p-2.5 text-zinc-400 font-sans">Captures right-side long tails where prolonged outages trigger escalating forensic costs.</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-white font-bold">Secondary Loss (Fines, Litigation, Brand)</td>
                  <td className="p-2.5 text-amber-400 font-bold">LogNormal</td>
                  <td className="p-2.5 text-zinc-400 font-sans">Boardroom gold standard for modeling catastrophic class-action settlements and GDPR/SEC fines.</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-white font-bold">Operational Outage Hours</td>
                  <td className="p-2.5 text-cyan-400 font-bold">PERT</td>
                  <td className="p-2.5 text-zinc-400 font-sans">Strictly bound by contractual uptime SLAs (cannot exceed 8,760 hours in a year).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Open FAIR™ Beta-PERT &amp; Quantitative Risk Standards
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-colors"
          >
            Got it, return to Builder
          </button>
        </div>
      </div>
    </div>
  );
};
