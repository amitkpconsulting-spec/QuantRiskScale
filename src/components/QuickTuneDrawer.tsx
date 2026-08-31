import React, { useState } from 'react';
import {
  X,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Activity,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { FairScenario, ThreePointEstimate } from '../types/fair';
import { formatAmount } from '../utils/distributions';

interface QuickTuneDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: FairScenario;
  onSaveAndRun: (updated: FairScenario) => void;
  onOpenFullBuilder: () => void;
  onOpenAiCopilot?: () => void;
  isSimulating: boolean;
}

export const QuickTuneDrawer: React.FC<QuickTuneDrawerProps> = ({
  isOpen,
  onClose,
  scenario,
  onSaveAndRun,
  onOpenFullBuilder,
  onOpenAiCopilot,
  isSimulating
}) => {
  if (!isOpen) return null;

  const [formState, setFormState] = useState<FairScenario>(JSON.parse(JSON.stringify(scenario)));
  const [activeSection, setActiveSection] = useState<'frequency' | 'magnitude' | 'mitigation'>('frequency');

  const updateTef = (field: keyof ThreePointEstimate, value: number) => {
    setFormState(prev => ({
      ...prev,
      current: {
        ...prev.current,
        lef: {
          ...prev.current.lef,
          directTef: {
            ...prev.current.lef.directTef,
            [field]: value
          }
        }
      }
    }));
  };

  const updateVuln = (field: keyof ThreePointEstimate, value: number) => {
    setFormState(prev => ({
      ...prev,
      current: {
        ...prev.current,
        lef: {
          ...prev.current.lef,
          directVuln: {
            ...prev.current.lef.directVuln,
            [field]: value
          }
        }
      }
    }));
  };

  const updatePrimaryLoss = (field: keyof ThreePointEstimate, value: number) => {
    setFormState(prev => ({
      ...prev,
      current: {
        ...prev.current,
        primaryLoss: {
          ...prev.current.primaryLoss,
          productivity: {
            ...prev.current.primaryLoss.productivity,
            [field]: value
          }
        }
      }
    }));
  };

  const updateSecondaryLoss = (field: keyof ThreePointEstimate, value: number) => {
    setFormState(prev => ({
      ...prev,
      current: {
        ...prev.current,
        secondaryLoss: {
          ...prev.current.secondaryLoss,
          finesAndJudgements: {
            ...prev.current.secondaryLoss.finesAndJudgements,
            [field]: value
          }
        }
      }
    }));
  };

  const handleApplyChanges = () => {
    onSaveAndRun(formState);
  };

  const curTef = formState.current.lef.directTef;
  const curVuln = formState.current.lef.directVuln;
  const curPlm = formState.current.primaryLoss.productivity;
  const curSlm = formState.current.secondaryLoss.finesAndJudgements;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-[#09090b] border-l border-zinc-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#050505]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Quick Parameter Tuning
              </h3>
              <p className="text-[11px] text-zinc-400 font-sans truncate max-w-xs">
                {scenario.name.split(':')[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenFullBuilder}
              className="px-2.5 py-1 rounded text-xs font-mono text-zinc-400 hover:text-cyan-400 hover:bg-zinc-900 border border-zinc-800 transition-colors flex items-center space-x-1"
              title="Open full parametric builder"
            >
              <span>Full Lab</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside Drawer */}
        <div className="px-4 py-2 bg-[#050505]/60 border-b border-zinc-800/80 flex items-center space-x-1 font-mono text-xs overflow-x-auto no-scrollbar">
          {[
            { id: 'frequency', label: '1. Frequency (TEF/VULN)', icon: Activity },
            { id: 'magnitude', label: '2. Loss (PLM/SLM)', icon: DollarSign },
            { id: 'mitigation', label: '3. Controls & Mitigation', icon: ShieldCheck }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-1.5 rounded-md font-bold uppercase text-[11px] tracking-wider transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
                activeSection === tab.id
                  ? 'bg-zinc-800 text-cyan-400 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 font-mono text-xs custom-scrollbar">
          {/* SECTION 1: FREQUENCY PARAMETERS */}
          {activeSection === 'frequency' && (
            <div className="space-y-4">
              {/* TEF Card */}
              <div className="p-4 rounded-xl bg-[#050505] border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="font-bold text-white uppercase text-xs">
                    Threat Event Frequency (TEF / year)
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    Mode: {curTef.mode} /yr
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Low (Min)</label>
                    <input
                      type="number"
                      step="any"
                      value={curTef.low}
                      onChange={(e) => updateTef('low', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-cyan-400 font-bold uppercase">Mode</label>
                    <input
                      type="number"
                      step="any"
                      value={curTef.mode}
                      onChange={(e) => updateTef('mode', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-cyan-800/60 rounded px-2 py-1.5 text-cyan-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">High (Max)</label>
                    <input
                      type="number"
                      step="any"
                      value={curTef.high}
                      onChange={(e) => updateTef('high', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Vulnerability Card */}
              <div className="p-4 rounded-xl bg-[#050505] border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="font-bold text-white uppercase text-xs">
                    Vulnerability (VULN / Probability 0–1)
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    {(curVuln.mode * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Low</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={curVuln.low}
                      onChange={(e) => updateVuln('low', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-cyan-400 font-bold uppercase">Mode</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={curVuln.mode}
                      onChange={(e) => updateVuln('mode', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-cyan-800/60 rounded px-2 py-1.5 text-cyan-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">High</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={curVuln.high}
                      onChange={(e) => updateVuln('high', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: LOSS MAGNITUDE */}
          {activeSection === 'magnitude' && (
            <div className="space-y-4">
              {/* Primary Loss Card */}
              <div className="p-4 rounded-xl bg-[#050505] border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="font-bold text-white uppercase text-xs">
                    Primary Loss (Direct Productivity Impact)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Mode: {formatAmount(curPlm.mode, formState.currency, formState.unitScale)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Low ($)</label>
                    <input
                      type="number"
                      step="10000"
                      value={curPlm.low}
                      onChange={(e) => updatePrimaryLoss('low', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-emerald-400 font-bold uppercase">Mode ($)</label>
                    <input
                      type="number"
                      step="10000"
                      value={curPlm.mode}
                      onChange={(e) => updatePrimaryLoss('mode', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-emerald-800/60 rounded px-2 py-1.5 text-emerald-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">High ($)</label>
                    <input
                      type="number"
                      step="10000"
                      value={curPlm.high}
                      onChange={(e) => updatePrimaryLoss('high', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Loss Card */}
              <div className="p-4 rounded-xl bg-[#050505] border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="font-bold text-white uppercase text-xs">
                    Secondary Loss (Fines / Legal Judgements)
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                    Mode: {formatAmount(curSlm.mode, formState.currency, formState.unitScale)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Low ($)</label>
                    <input
                      type="number"
                      step="10000"
                      value={curSlm.low}
                      onChange={(e) => updateSecondaryLoss('low', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-amber-400 font-bold uppercase">Mode ($)</label>
                    <input
                      type="number"
                      step="10000"
                      value={curSlm.mode}
                      onChange={(e) => updateSecondaryLoss('mode', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-amber-800/60 rounded px-2 py-1.5 text-amber-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">High ($)</label>
                    <input
                      type="number"
                      step="10000"
                      value={curSlm.high}
                      onChange={(e) => updateSecondaryLoss('high', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: MITIGATION & PROPOSED STATE */}
          {activeSection === 'mitigation' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#050505] border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase text-xs">
                    Enable Proposed Mitigated State
                  </span>
                  <input
                    type="checkbox"
                    checked={formState.hasProposed}
                    onChange={(e) => setFormState(prev => ({ ...prev, hasProposed: e.target.checked }))}
                    className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 w-4 h-4 focus:ring-0 cursor-pointer"
                  />
                </div>

                {formState.hasProposed && (
                  <div className="space-y-3 pt-3 border-t border-zinc-800">
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Mitigation controls active (e.g. MFA, Micro-segmentation, AI defense).
                    </p>

                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                        Mitigated Vulnerability Mode (0–1)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={formState.proposed.lef.directVuln.mode}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value) || 0;
                          setFormState(prev => ({
                            ...prev,
                            proposed: {
                              ...prev.proposed,
                              lef: {
                                ...prev.proposed.lef,
                                directVuln: {
                                  ...prev.proposed.lef.directVuln,
                                  mode: v
                                }
                              }
                            }
                          }));
                        }}
                        className="w-full bg-zinc-900 border border-emerald-800/80 rounded px-2.5 py-1.5 text-emerald-300 font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {onOpenAiCopilot && (
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/50 flex items-center justify-between">
                  <div>
                    <span className="text-cyan-300 font-bold text-xs flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Calibration Assistant</span>
                    </span>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Need industry benchmark distributions?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAiCopilot}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Ask AI
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Sticky Footer with Run Button */}
        <div className="px-5 py-4 border-t border-zinc-800 bg-[#050505] flex items-center justify-between">
          <button
            onClick={() => setFormState(JSON.parse(JSON.stringify(scenario)))}
            className="px-3 py-2 rounded-lg text-zinc-400 hover:text-white text-xs font-mono transition-colors flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleApplyChanges}
            disabled={isSimulating}
            className="px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold font-mono text-xs uppercase tracking-wider shadow-lg flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-black ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Apply & Run Simulation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
