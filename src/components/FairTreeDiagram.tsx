import React from 'react';
import {
  Layers,
  ArrowDown,
  ArrowRight,
  Shield,
  Clock,
  DollarSign,
  Activity,
  CheckCircle2,
  Info
} from 'lucide-react';
import { FairScenario, SimulationResult } from '../types/fair';
import { formatAmount } from '../utils/distributions';

interface FairTreeDiagramProps {
  scenario: FairScenario;
  result: SimulationResult | null;
  onNavigateToBuilder: () => void;
}

export const FairTreeDiagram: React.FC<FairTreeDiagramProps> = ({
  scenario,
  result,
  onNavigateToBuilder
}) => {
  const calc = result?.currentBranchCalculations;
  const curr = scenario.current;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5 font-mono">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-zinc-800 text-cyan-400 border border-zinc-700 uppercase tracking-widest">
              Open FAIR Standard Taxonomy
            </span>
            <span className="text-xs text-zinc-400 font-mono uppercase">Interactive Hierarchy Model</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-black text-white font-display uppercase tracking-tight">Factor Analysis of Information Risk Ontology</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Visual breakdown of how threat frequencies, vulnerability factors, and primary/secondary loss forms compound into Annualized Loss Exposure.
          </p>
        </div>

        <button
          onClick={onNavigateToBuilder}
          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-bold font-mono uppercase tracking-wider flex items-center space-x-2 transition-colors self-start md:self-auto"
        >
          <span>Modify Ontology Estimates</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>

      {/* Interactive Visual Hierarchy Diagram */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-8 overflow-x-auto">
        {/* Level 0: Top Node - RISK / ALE */}
        <div className="flex justify-center">
          <div className="bg-[#050505] border-2 border-cyan-500/80 rounded-xl p-5 shadow-2xl text-center min-w-[300px] max-w-md">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-1 font-mono">Top-Level Objective</span>
            <h3 className="text-lg lg:text-xl font-black text-white font-display uppercase tracking-tight">Annualized Loss Exposure (ALE)</h3>
            <div className="text-2xl lg:text-3xl font-black text-cyan-300 font-mono my-2">
              {calc ? formatAmount(calc.totalAleMean, scenario.currency, scenario.unitScale) : '—'}
              <span className="text-xs font-normal text-zinc-400 ml-1">/ year</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider">Risk = LEF × Loss Magnitude</p>
          </div>
        </div>

        {/* Level 1: LEF and Loss Magnitude Branches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Left Branch: Loss Event Frequency */}
          <div className="bg-[#050505] border border-zinc-800 rounded-xl p-5 space-y-6 shadow-md">
            <div className="text-center border-b border-zinc-800 pb-3">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-2 font-mono uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Loss Event Frequency (LEF)</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {calc ? `${calc.lefMean.toFixed(2)} events/yr` : `${curr.lef.directLef.mode} mode`}
              </div>
              <p className="text-[11px] text-zinc-400 font-mono uppercase mt-1">LEF = Threat Event Frequency (TEF) × Vulnerability</p>
            </div>

            {/* Level 2: TEF & Vulnerability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* TEF */}
              <div className="bg-[#09090b] p-4 rounded-lg border border-zinc-800 space-y-2">
                <span className="text-xs font-black text-white font-display uppercase tracking-wider block">Threat Event Freq (TEF)</span>
                <div className="text-lg font-black text-white font-mono">
                  {calc ? `${calc.tefMean.toFixed(2)}/yr` : `${curr.lef.directTef.mode}/yr`}
                </div>
                <div className="text-[10px] text-zinc-400 space-y-1 font-mono border-t border-zinc-800 pt-2 uppercase">
                  <div className="flex justify-between">
                    <span>Contact Freq (CF):</span>
                    <span className="text-zinc-200 font-bold">{curr.lef.contactFrequency.mode}/yr</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prob. of Action (PoA):</span>
                    <span className="text-zinc-200 font-bold">{(curr.lef.probabilityOfAction.mode * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Vulnerability */}
              <div className="bg-[#09090b] p-4 rounded-lg border border-zinc-800 space-y-2">
                <span className="text-xs font-black text-white font-display uppercase tracking-wider block">Vulnerability (Vuln)</span>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {calc ? `${calc.vulnMeanPct.toFixed(1)}%` : `${(curr.lef.directVuln.mode * 100).toFixed(0)}%`}
                </div>
                <div className="text-[10px] text-zinc-400 space-y-1 font-mono border-t border-zinc-800 pt-2 uppercase">
                  <div className="flex justify-between">
                    <span>Threat Cap (TC):</span>
                    <span className="text-red-400 font-bold">{curr.lef.threatCapability.mode}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Control Str (RS):</span>
                    <span className="text-emerald-400 font-bold">{curr.lef.resistanceStrength.mode}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Branch: Loss Magnitude (LM) */}
          <div className="bg-[#050505] border border-zinc-800 rounded-xl p-5 space-y-6 shadow-md">
            <div className="text-center border-b border-zinc-800 pb-3">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/30 mb-2 font-mono uppercase tracking-wider">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Loss Magnitude (LM)</span>
              </div>
              <div className="text-2xl font-black text-cyan-400 font-mono">
                {calc ? formatAmount(calc.plmMean + (calc.slefMeanPct / 100 * calc.slmMean), scenario.currency, scenario.unitScale) : '—'}
              </div>
              <p className="text-[11px] text-zinc-400 font-mono uppercase mt-1">LM = Primary Loss (PLM) + Secondary Loss (SLM × SLEF)</p>
            </div>

            {/* Level 2: Primary vs Secondary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Loss */}
              <div className="bg-[#09090b] p-4 rounded-lg border border-zinc-800 space-y-2">
                <span className="text-xs font-black text-white font-display uppercase tracking-wider block">Primary Loss (PLM)</span>
                <div className="text-lg font-black text-cyan-300 font-mono">
                  {calc ? formatAmount(calc.plmMean, scenario.currency, scenario.unitScale) : '—'}
                </div>
                <div className="text-[10px] text-zinc-400 space-y-1 font-mono border-t border-zinc-800 pt-2 uppercase">
                  <div className="flex justify-between">
                    <span>Productivity:</span>
                    <span className="text-zinc-200 font-bold">{formatAmount(curr.primaryLoss.productivity.mode, scenario.currency, scenario.unitScale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response:</span>
                    <span className="text-zinc-200 font-bold">{formatAmount(curr.primaryLoss.response.mode, scenario.currency, scenario.unitScale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Replacement:</span>
                    <span className="text-zinc-200 font-bold">{formatAmount(curr.primaryLoss.replacement.mode, scenario.currency, scenario.unitScale)}</span>
                  </div>
                </div>
              </div>

              {/* Secondary Loss */}
              <div className="bg-[#09090b] p-4 rounded-lg border border-zinc-800 space-y-2">
                <span className="text-xs font-black text-white font-display uppercase tracking-wider block">Secondary Loss (SLM)</span>
                <div className="text-lg font-black text-rose-400 font-mono">
                  {calc ? formatAmount(calc.slmMean, scenario.currency, scenario.unitScale) : '—'}
                </div>
                <div className="text-[10px] text-zinc-400 space-y-1 font-mono border-t border-zinc-800 pt-2 uppercase">
                  <div className="flex justify-between">
                    <span>SLEF Prob:</span>
                    <span className="text-rose-400 font-bold">{calc ? `${calc.slefMeanPct.toFixed(1)}%` : `${curr.secondaryLossEventFreq.mode}%`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fines &amp; Legal:</span>
                    <span className="text-zinc-200 font-bold">{formatAmount(curr.secondaryLoss.finesAndJudgements.mode, scenario.currency, scenario.unitScale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Brand / Churn:</span>
                    <span className="text-zinc-200 font-bold">{formatAmount(curr.secondaryLoss.reputation.mode, scenario.currency, scenario.unitScale)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
