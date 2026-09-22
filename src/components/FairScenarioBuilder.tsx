import React, { useState, useEffect } from 'react';
import {
  Settings2,
  Save,
  Plus,
  Trash2,
  Layers,
  Shield,
  Zap,
  TrendingDown,
  Info,
  CheckCircle2,
  Sliders,
  DollarSign,
  Clock,
  Sparkles,
  History,
  RotateCcw,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { FairScenario, ThreePointEstimate, FairModelBranch, ScenarioSnapshot } from '../types/fair';
import {
  getScenarioSnapshots,
  saveScenarioSnapshot,
  deleteScenarioSnapshot,
  updateScenarioSnapshotNote
} from '../services/sqliteService';
import { ScenarioVersionHistoryModal } from './ScenarioVersionHistoryModal';
import {
  DistributionStakeholderTooltip,
  ParameterContextType
} from './DistributionStakeholderTooltip';
import { StakeholderDistributionPrimerModal } from './StakeholderDistributionPrimerModal';

interface FairScenarioBuilderProps {
  scenario: FairScenario;
  onSaveScenario: (updated: FairScenario) => void;
  onRunSimulation: () => void;
  onOpenAiAssistant: () => void;
  onOpenNewSimulationModal?: () => void;
}

export const FairScenarioBuilder: React.FC<FairScenarioBuilderProps> = ({
  scenario,
  onSaveScenario,
  onRunSimulation,
  onOpenAiAssistant,
  onOpenNewSimulationModal
}) => {
  const [modelState, setModelState] = useState<FairScenario>(JSON.parse(JSON.stringify(scenario)));
  const [activeBranch, setActiveBranch] = useState<'current' | 'proposed'>('current');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [snapshots, setSnapshots] = useState<ScenarioSnapshot[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [showDistributionPrimer, setShowDistributionPrimer] = useState<boolean>(false);
  const [revertMessage, setRevertMessage] = useState<string | null>(null);

  // Load snapshots for this scenario
  const loadSnapshots = async (scenarioId: string) => {
    try {
      const loaded = await getScenarioSnapshots(scenarioId);
      setSnapshots(loaded);
    } catch (e) {
      console.warn('Failed to load scenario snapshots:', e);
    }
  };

  useEffect(() => {
    setModelState(JSON.parse(JSON.stringify(scenario)));
    loadSnapshots(scenario.id);
  }, [scenario.id, scenario.updatedAt]);

  const currentBranch = activeBranch === 'current' ? modelState.current : modelState.proposed;

  const handleUpdateBranch = (updater: (prev: FairModelBranch) => FairModelBranch) => {
    setModelState(prev => {
      const next = { ...prev };
      if (activeBranch === 'current') {
        next.current = updater(prev.current);
      } else {
        next.proposed = updater(prev.proposed);
      }
      next.updatedAt = new Date().toISOString();
      return next;
    });
  };

  const handleSave = () => {
    onSaveScenario(modelState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveAndRunSimulation = async (customNote?: string) => {
    // 1. Save scenario state
    onSaveScenario(modelState);

    // 2. Capture a version snapshot before running simulation
    try {
      const tefModeVal = modelState.current.lef.useDirectTef
        ? modelState.current.lef.directTef.mode
        : modelState.current.lef.contactFrequency.mode;
      const snapNote =
        customNote ||
        `Simulation Run (${modelState.simulationsCount.toLocaleString()} trials) • TEF: ${tefModeVal}/yr`;
      const snap = await saveScenarioSnapshot(modelState, snapNote);
      setSnapshots(prev => [snap, ...prev]);
    } catch (err) {
      console.warn('Failed to capture scenario snapshot in SQLite:', err);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);

    // 3. Trigger Monte Carlo execution
    onRunSimulation();
  };

  const handleRevertToSnapshot = (snapshot: ScenarioSnapshot) => {
    const restored = JSON.parse(JSON.stringify(snapshot.scenarioData));
    restored.updatedAt = new Date().toISOString();
    setModelState(restored);
    onSaveScenario(restored);
    setRevertMessage(`Reverted to Version ${snapshot.versionNumber} (created ${new Date(snapshot.createdAt).toLocaleTimeString()})`);
    setTimeout(() => setRevertMessage(null), 5000);
  };

  const handleCreateManualSnapshot = async (note: string) => {
    const snap = await saveScenarioSnapshot(modelState, note);
    setSnapshots(prev => [snap, ...prev]);
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
    await deleteScenarioSnapshot(snapshotId);
    setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
  };

  const handleUpdateSnapshotNote = async (snapshotId: string, note: string) => {
    await updateScenarioSnapshotNote(snapshotId, note);
    setSnapshots(prev => prev.map(s => (s.id === snapshotId ? { ...s, note } : s)));
  };

  const renderThreePointControl = (
    label: string,
    estimate: ThreePointEstimate,
    onChange: (updated: ThreePointEstimate) => void,
    unit = '',
    minBound = 0,
    maxBound = 10000,
    step = 1,
    helpText = '',
    contextType: ParameterContextType = 'financial-primary'
  ) => {
    const currentDist = estimate.distributionType || 'pert';

    return (
      <div className="bg-[#050505] border border-zinc-800 rounded-xl p-4 space-y-3 font-mono transition-all hover:border-zinc-700">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-black text-white font-display uppercase tracking-wider flex items-center space-x-1.5 truncate">
            <span className="truncate">{label}</span>
            {unit && <span className="text-[10px] text-zinc-500 font-mono shrink-0">({unit})</span>}
          </label>
          <div className="flex items-center space-x-2 shrink-0">
            {/* Context-aware Stakeholder Tooltip & Distribution Selector */}
            <DistributionStakeholderTooltip
              parameterName={label}
              unit={unit}
              contextType={contextType}
              currentDistribution={currentDist}
              onSelectDistribution={(dist) => onChange({ ...estimate, distributionType: dist })}
            />
            {estimate.enabled !== undefined && (
              <input
                type="checkbox"
                checked={estimate.enabled}
                onChange={(e) => onChange({ ...estimate, enabled: e.target.checked })}
                title="Enable / Disable this parameter in simulation"
                className="rounded bg-zinc-800 border-zinc-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
              />
            )}
          </div>
        </div>

        {helpText && <p className="text-[11px] text-zinc-400 leading-tight font-mono">{helpText}</p>}

        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Low (Min)</span>
            <input
              type="number"
              min={minBound}
              max={estimate.mode}
              step={step}
              value={estimate.low}
              onChange={(e) => onChange({ ...estimate, low: parseFloat(e.target.value) || 0 })}
              className="w-full bg-[#09090b] border border-zinc-700 rounded px-2.5 py-1.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <span className="text-[10px] text-cyan-400 uppercase tracking-wider block mb-1 font-bold">Most Likely (Mode)</span>
            <input
              type="number"
              min={estimate.low}
              max={estimate.high}
              step={step}
              value={estimate.mode}
              onChange={(e) => onChange({ ...estimate, mode: parseFloat(e.target.value) || 0 })}
              className="w-full bg-[#09090b] border border-cyan-500/80 rounded px-2.5 py-1.5 text-cyan-300 font-bold font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">High (Max)</span>
            <input
              type="number"
              min={estimate.mode}
              max={maxBound}
              step={step}
              value={estimate.high}
              onChange={(e) => onChange({ ...estimate, high: parseFloat(e.target.value) || 0 })}
              className="w-full bg-[#09090b] border border-zinc-700 rounded px-2.5 py-1.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Dynamic Model Guidance based on Distribution Type */}
        {currentDist === 'pert' ? (
          <div className="flex items-center space-x-2 pt-1.5 border-t border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-mono uppercase whitespace-nowrap">
              PERT Confidence (γ): <strong className="text-white">{estimate.confidence || 4}</strong>
            </span>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={estimate.confidence || 4}
              onChange={(e) => onChange({ ...estimate, confidence: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              title="Higher confidence concentrates probabilities tighter around the most likely mode"
            />
          </div>
        ) : currentDist === 'lognormal' ? (
          <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800 text-[10px] text-amber-400/90 font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>LogNormal Model: Right-skewed fat tail (No negative values)</span>
            </div>
            <span className="text-zinc-500 text-[9px]">90% CI: [{estimate.low} - {estimate.high}]</span>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800 text-[10px] text-purple-400/90 font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              <span>Normal Model: Balanced symmetrical bell curve</span>
            </div>
            <span className="text-zinc-500 text-[9px]">Mean: {estimate.mode}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6 w-full space-y-6">
      {/* Top Header & Save Actions */}
      <div className="w-full bg-[#09090b] bg-gradient-to-r from-[#09090b] via-[#0d0e14] to-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Ambient subtle glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.08),rgba(255,255,255,0))] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-1.5 font-mono">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-zinc-800 text-cyan-400 border border-zinc-700 uppercase tracking-widest">
              FAIR Ontology Builder
            </span>
            <span className="text-xs text-zinc-400 font-mono uppercase">ID: {modelState.id}</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-black text-white font-display uppercase tracking-tight">Scenario Parameter Modeler</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">Configure Beta-PERT 3-point estimates across the Open FAIR decomposition hierarchy.</p>
        </div>

        <div className="flex items-center space-x-3 font-mono relative z-10">
          {onOpenNewSimulationModal && (
            <button
              onClick={onOpenNewSimulationModal}
              className="px-3.5 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/70 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm"
              title="Add New Risk Scenario Simulation"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>New Simulation</span>
            </button>
          )}

          {/* Version History Button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 border border-zinc-700 hover:border-cyan-500/50 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm"
            title="Browse parameter version history and restore previous snapshots"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>History</span>
            <span className="ml-1 px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 text-[10px]">
              {snapshots.length}
            </span>
          </button>

          {/* Stakeholder Distribution Primer Guide Button */}
          <button
            onClick={() => setShowDistributionPrimer(true)}
            className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-zinc-700 hover:border-amber-500/50 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm"
            title="Open Stakeholder Guide to Distribution Types (Normal, LogNormal, PERT)"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Distribution Guide</span>
          </button>

          <button
            onClick={onOpenAiAssistant}
            className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 border border-zinc-700 hover:border-cyan-500/50 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm"
            title="Audit scenario assumptions for bias and calibrate Beta-PERT distributions"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Bias Audit</span>
          </button>

          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg font-black font-display text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-black'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Saved to SQLite</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-black" />
                <span>Save Scenario</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Revert Notification Alert Banner */}
      {revertMessage && (
        <div className="bg-cyan-950/90 border border-cyan-500/80 rounded-xl p-4 flex items-center justify-between shadow-lg text-xs font-mono animate-in slide-in-from-top duration-200">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <div>
              <span className="text-white font-bold block">{revertMessage}</span>
              <span className="text-zinc-400 text-[11px]">All 3-point estimates and loss parameters have been restored. Click 'Save & Re-Run' to simulate this configuration.</span>
            </div>
          </div>
          <button
            onClick={() => handleSaveAndRunSimulation()}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-[11px] flex items-center space-x-1"
          >
            <Zap className="w-3 h-3" />
            <span>Run Now</span>
          </button>
        </div>
      )}

      {/* Scenario Metadata & Currency Configuration */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-white font-display uppercase tracking-wider flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>General Scenario Attributes</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Scenario Name</label>
            <input
              type="text"
              value={modelState.name}
              onChange={(e) => setModelState({ ...modelState, name: e.target.value })}
              className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Asset at Risk</label>
            <input
              type="text"
              value={modelState.asset}
              onChange={(e) => setModelState({ ...modelState, asset: e.target.value })}
              className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Threat Community</label>
            <input
              type="text"
              value={modelState.threatCommunity}
              onChange={(e) => setModelState({ ...modelState, threatCommunity: e.target.value })}
              className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Currency Symbol &amp; Units</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={modelState.currency}
                onChange={(e) => setModelState({ ...modelState, currency: e.target.value })}
                className="bg-[#050505] border border-zinc-700 rounded-lg px-2.5 py-2 text-white focus:border-cyan-500 focus:outline-none font-mono"
              >
                <option value="$">$ (USD)</option>
                <option value="£">£ (GBP)</option>
                <option value="€">€ (EUR)</option>
                <option value="¥">¥ (JPY)</option>
                <option value="₹">₹ (INR)</option>
              </select>
              <select
                value={modelState.unitScale}
                onChange={(e) => {
                  const scale = parseFloat(e.target.value);
                  const label = scale === 1000 ? '$k (Thousands)' : scale === 1000000 ? '$M (Millions)' : 'Exact (Units)';
                  setModelState({ ...modelState, unitScale: scale, unitLabel: label });
                }}
                className="bg-[#050505] border border-zinc-700 rounded-lg px-2.5 py-2 text-white focus:border-cyan-500 focus:outline-none font-mono"
              >
                <option value="1">Exact Units (1x)</option>
                <option value="1000">Thousands (1k)</option>
                <option value="1000000">Millions (1M)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Simulation Trial Count</label>
            <select
              value={modelState.simulationsCount}
              onChange={(e) => setModelState({ ...modelState, simulationsCount: parseInt(e.target.value) || 10000 })}
              className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none font-mono"
            >
              <option value="1000">1,000 Trials (Fast)</option>
              <option value="5000">5,000 Trials</option>
              <option value="10000">10,000 Trials (Recommended Standard)</option>
              <option value="50000">50,000 Trials (High Precision)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Risk Tolerance 90th VaR Limit</label>
            <input
              type="number"
              value={modelState.riskTolerance.significantMax}
              onChange={(e) => setModelState({
                ...modelState,
                riskTolerance: {
                  ...modelState.riskTolerance,
                  significantMax: parseFloat(e.target.value) || 5000
                }
              })}
              className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none font-mono font-bold"
            />
          </div>
        </div>
      </div>

      {/* Branch Selector (Current State vs Proposed What-If State) */}
      <div className="flex items-center justify-between bg-[#09090b] p-2 rounded-xl border border-zinc-800 font-mono">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveBranch('current')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeBranch === 'current'
                ? 'bg-cyan-600 text-black shadow-md font-black font-display'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Baseline Current State
          </button>
          <button
            onClick={() => {
              if (!modelState.hasProposed) {
                setModelState(prev => ({
                  ...prev,
                  hasProposed: true,
                  proposed: JSON.parse(JSON.stringify(prev.current))
                }));
              }
              setActiveBranch('proposed');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
              activeBranch === 'proposed'
                ? 'bg-emerald-500 text-black shadow-md font-black font-display'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Proposed Mitigation State (What-If)</span>
          </button>
        </div>

        {activeBranch === 'proposed' && (
          <div className="flex items-center space-x-2 text-xs font-mono pr-2">
            <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Annualized Control Cost:</span>
            <div className="flex items-center space-x-1">
              <span className="text-emerald-400 font-bold">{modelState.currency}</span>
              <input
                type="number"
                value={modelState.proposedControlCost || 0}
                onChange={(e) => setModelState({ ...modelState, proposedControlCost: parseFloat(e.target.value) || 0 })}
                className="w-24 bg-[#050505] border border-zinc-700 rounded px-2 py-1 text-emerald-300 font-bold focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 1: Loss Event Frequency (LEF) Branch */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">1. Loss Event Frequency (LEF) Branch</h3>
              <p className="text-xs text-zinc-400 font-mono">Frequency of threat action overcoming control resistance (Events / Year).</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-zinc-400 font-mono">
            <span className="uppercase text-[10px] tracking-wider">Mode:</span>
            <button
              onClick={() => handleUpdateBranch(b => ({
                ...b,
                lef: { ...b.lef, useDirectLef: !b.lef.useDirectLef }
              }))}
              className="px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-wider"
            >
              {currentBranch.lef.useDirectLef ? 'Direct LEF' : 'Decomposed TEF × Vulnerability'}
            </button>
          </div>
        </div>

        {currentBranch.lef.useDirectLef ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderThreePointControl(
              'Direct Loss Event Frequency (LEF)',
              currentBranch.lef.directLef,
              (updated) => handleUpdateBranch(b => ({ ...b, lef: { ...b.lef, directLef: updated } })),
              'Events / Year',
              0,
              1000,
              0.1,
              'Estimate the annual number of successful loss events.',
              'threat-frequency'
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TEF */}
              {currentBranch.lef.useDirectTef ? (
                renderThreePointControl(
                  'Threat Event Frequency (TEF)',
                  currentBranch.lef.directTef,
                  (updated) => handleUpdateBranch(b => ({ ...b, lef: { ...b.lef, directTef: updated } })),
                  'Threat Events / Year',
                  0,
                  10000,
                  0.5,
                  'Frequency of threat agent taking action against asset.',
                  'threat-frequency'
                )
              ) : (
                <div className="space-y-3">
                  {renderThreePointControl(
                    'Contact Frequency (CF)',
                    currentBranch.lef.contactFrequency,
                    (updated) => handleUpdateBranch(b => ({ ...b, lef: { ...b.lef, contactFrequency: updated } })),
                    'Contacts / Year',
                    0,
                    10000,
                    1,
                    'Number of times threat community comes in contact with asset.',
                    'threat-frequency'
                  )}
                  {renderThreePointControl(
                    'Probability of Action (PoA)',
                    currentBranch.lef.probabilityOfAction,
                    (updated) => handleUpdateBranch(b => ({ ...b, lef: { ...b.lef, probabilityOfAction: updated } })),
                    '0 to 1.0',
                    0,
                    1,
                    0.05,
                    'Probability that contact results in an active threat attack.',
                    'threat-frequency'
                  )}
                </div>
              )}

              {/* Vulnerability */}
              {currentBranch.lef.useDirectVuln ? (
                renderThreePointControl(
                  'Direct Vulnerability (Prob. of Control Failure)',
                  currentBranch.lef.directVuln,
                  (updated) => handleUpdateBranch(b => ({ ...b, lef: { ...b.lef, directVuln: updated } })),
                  '0 to 1.0 (or %)',
                  0,
                  1,
                  0.05,
                  'Likelihood that attack overcomes defenses.',
                  'vulnerability'
                )
              ) : (
                <div className="space-y-3">
                  {renderThreePointControl(
                    'Threat Capability (TC)',
                    currentBranch.lef.threatCapability,
                    (updated) => handleUpdateBranch(b => ({ ...b, lef: { ...b.lef, threatCapability: updated } })),
                    '0 - 100 Percentile',
                    0,
                    100,
                    1,
                    'Capability level of threat actor relative to overall threat spectrum.',
                    'vulnerability'
                  )}
                  {renderThreePointControl(
                    'Resistance Strength (RS / Control Strength)',
                    currentBranch.lef.resistanceStrength,
                    (updated) => handleUpdateBranch(b => ({ ...b, lef: { ...b.lef, resistanceStrength: updated } })),
                    '0 - 100 Percentile',
                    0,
                    100,
                    1,
                    'Strength of security controls against threat capability.',
                    'vulnerability'
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Primary Loss Magnitude (PLM) */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 border-b border-zinc-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-cyan-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">2. Primary Loss Magnitude (PLM) Forms</h3>
            <p className="text-xs text-zinc-400 font-mono">Direct financial loss incurred as immediate consequence of the event ({modelState.unitLabel}).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderThreePointControl(
            'Productivity Loss',
            currentBranch.primaryLoss.productivity,
            (updated) => handleUpdateBranch(b => ({ ...b, primaryLoss: { ...b.primaryLoss, productivity: updated } })),
            modelState.currency,
            0,
            1000000,
            10,
            'Operational disruption, idle wages, lost sales velocity.',
            'financial-primary'
          )}

          {renderThreePointControl(
            'Response Loss',
            currentBranch.primaryLoss.response,
            (updated) => handleUpdateBranch(b => ({ ...b, primaryLoss: { ...b.primaryLoss, response: updated } })),
            modelState.currency,
            0,
            1000000,
            10,
            'Incident triage, forensics investigation, crisis management.',
            'financial-primary'
          )}

          {renderThreePointControl(
            'Replacement Loss',
            currentBranch.primaryLoss.replacement,
            (updated) => handleUpdateBranch(b => ({ ...b, primaryLoss: { ...b.primaryLoss, replacement: updated } })),
            modelState.currency,
            0,
            1000000,
            10,
            'Hardware re-imaging, key replacement, rebuild cost.',
            'financial-primary'
          )}

          {renderThreePointControl(
            'Fines & Judgements',
            currentBranch.primaryLoss.finesAndJudgements,
            (updated) => handleUpdateBranch(b => ({ ...b, primaryLoss: { ...b.primaryLoss, finesAndJudgements: updated } })),
            modelState.currency,
            0,
            1000000,
            10,
            'Direct statutory penalties, contractual SLA fines.',
            'financial-primary'
          )}

          {renderThreePointControl(
            'Competitive Advantage',
            currentBranch.primaryLoss.competitiveAdvantage,
            (updated) => handleUpdateBranch(b => ({ ...b, primaryLoss: { ...b.primaryLoss, competitiveAdvantage: updated } })),
            modelState.currency,
            0,
            1000000,
            10,
            'Stolen IP, bidding handicap, proprietary leakage.',
            'financial-primary'
          )}

          {renderThreePointControl(
            'Reputation Damage (Primary)',
            currentBranch.primaryLoss.reputation,
            (updated) => handleUpdateBranch(b => ({ ...b, primaryLoss: { ...b.primaryLoss, reputation: updated } })),
            modelState.currency,
            0,
            1000000,
            10,
            'Direct customer churn, marketing mitigation promotions.',
            'financial-primary'
          )}
        </div>
      </div>

      {/* Section 3: Secondary Loss Magnitude (SLM) & Probability */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 border-b border-zinc-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-rose-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">3. Secondary Loss Magnitude (SLM) &amp; SLEF</h3>
            <p className="text-xs text-zinc-400 font-mono">Losses triggered by external stakeholder reactions (Regulators, Customers, Class Action Litigants).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            {renderThreePointControl(
              'Secondary Loss Event Frequency (SLEF %)',
              currentBranch.secondaryLossEventFreq,
              (updated) => handleUpdateBranch(b => ({ ...b, secondaryLossEventFreq: updated })),
              '% of primary incidents that trigger secondary loss',
              0,
              100,
              1,
              'Likelihood (0-100%) that a primary event escalates into secondary stakeholder actions.',
              'threat-frequency'
            )}
          </div>

          {renderThreePointControl(
            'Secondary Fines & Judgements',
            currentBranch.secondaryLoss.finesAndJudgements,
            (updated) => handleUpdateBranch(b => ({ ...b, secondaryLoss: { ...b.secondaryLoss, finesAndJudgements: updated } })),
            modelState.currency,
            0,
            1000000,
            10,
            'Major GDPR, CCPA, SEC regulatory enforcement actions.',
            'financial-secondary'
          )}

          {renderThreePointControl(
            'Secondary Reputation & Brand',
            currentBranch.secondaryLoss.reputation,
            (updated) => handleUpdateBranch(b => ({ ...b, secondaryLoss: { ...b.secondaryLoss, reputation: updated } })),
            modelState.currency,
            0,
            1000000,
            10,
            'Long-term stock valuation impact, systemic enterprise customer attrition.',
            'financial-secondary'
          )}

          {renderThreePointControl(
            'Secondary Legal Response',
            currentBranch.secondaryLoss.response,
            (updated) => handleUpdateBranch(b => ({ ...b, secondaryLoss: { ...b.secondaryLoss, response: updated } })),
            modelState.currency,
            0,
            1000000,
            10,
            'External class-action defense counsel, credit monitoring for victims.',
            'financial-secondary'
          )}
        </div>
      </div>

      {/* Section 4: Operational Non-Financial Loss */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 border-b border-zinc-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">4. Operational Non-Financial Loss Metrics</h3>
            <p className="text-xs text-zinc-400 font-mono">Physical downtime and data record leakage per event.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderThreePointControl(
            'Service Outage Duration',
            currentBranch.operationalLoss.serviceDowntimeHours,
            (updated) => handleUpdateBranch(b => ({ ...b, operationalLoss: { ...b.operationalLoss, serviceDowntimeHours: updated } })),
            'Hours per event',
            0,
            8760,
            1,
            'Duration of complete or partial degradation of service.',
            'operational'
          )}

          {renderThreePointControl(
            'Data Records Compromised',
            currentBranch.operationalLoss.dataRecordsLoss,
            (updated) => handleUpdateBranch(b => ({ ...b, operationalLoss: { ...b.operationalLoss, dataRecordsLoss: updated } })),
            'Records (Thousands)',
            0,
            1000000,
            10,
            'Quantity of exposed customer/employee records.',
            'operational'
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800 font-mono">
        <div className="flex items-center space-x-3 text-xs text-zinc-400">
          <span className="uppercase tracking-wider">Last modified: {new Date(modelState.updatedAt).toLocaleString()}</span>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 flex items-center space-x-1"
          >
            <History className="w-3.5 h-3.5" />
            <span>Version History ({snapshots.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-700 hover:border-cyan-500/50 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revert / Snapshots</span>
          </button>

          <button
            onClick={() => handleSaveAndRunSimulation()}
            className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-black font-display text-xs uppercase tracking-wider shadow-lg flex items-center space-x-2 transition-all active:scale-98"
          >
            <Zap className="w-4 h-4" />
            <span>Save &amp; Re-Run Monte Carlo Simulation</span>
          </button>
        </div>
      </div>

      {/* Scenario Version History Modal */}
      <ScenarioVersionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        scenario={scenario}
        currentWorkingScenario={modelState}
        snapshots={snapshots}
        onRevertToSnapshot={handleRevertToSnapshot}
        onCreateManualSnapshot={handleCreateManualSnapshot}
        onDeleteSnapshot={handleDeleteSnapshot}
        onUpdateSnapshotNote={handleUpdateSnapshotNote}
      />

      {/* Stakeholder Distribution Primer Modal */}
      <StakeholderDistributionPrimerModal
        isOpen={showDistributionPrimer}
        onClose={() => setShowDistributionPrimer(false)}
      />
    </div>
  );
};
