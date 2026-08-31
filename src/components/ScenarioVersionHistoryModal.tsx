import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  Clock,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Plus
} from 'lucide-react';
import { FairScenario, ScenarioSnapshot } from '../types/fair';
import { formatAmount } from '../utils/distributions';

interface ScenarioVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: FairScenario;
  currentWorkingScenario: FairScenario;
  snapshots: ScenarioSnapshot[];
  onRevertToSnapshot: (snapshot: ScenarioSnapshot) => void;
  onCreateManualSnapshot: (note: string) => Promise<void>;
  onDeleteSnapshot: (snapshotId: string) => Promise<void>;
  onUpdateSnapshotNote: (snapshotId: string, note: string) => Promise<void>;
}

export const ScenarioVersionHistoryModal: React.FC<ScenarioVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  scenario,
  currentWorkingScenario,
  snapshots,
  onRevertToSnapshot,
  onCreateManualSnapshot,
  onDeleteSnapshot,
  onUpdateSnapshotNote
}) => {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(
    snapshots.length > 0 ? snapshots[0].id : null
  );
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');
  const [isCreatingManual, setIsCreatingManual] = useState<boolean>(false);
  const [manualNote, setManualNote] = useState<string>('');
  const [revertConfirmId, setRevertConfirmId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedSnapshot = snapshots.find(s => s.id === selectedSnapshotId) || snapshots[0];

  const handleSaveNote = async (id: string) => {
    if (!editingNoteText.trim()) return;
    await onUpdateSnapshotNote(id, editingNoteText.trim());
    setEditingNoteId(null);
  };

  const handleCreateSnapshot = async () => {
    await onCreateManualSnapshot(manualNote.trim() || 'Manual configuration checkpoint');
    setManualNote('');
    setIsCreatingManual(false);
  };

  const calculateDiff = (snap: ScenarioSnapshot) => {
    const curTef = currentWorkingScenario.current.lef.useDirectTef
      ? currentWorkingScenario.current.lef.directTef.mode
      : currentWorkingScenario.current.lef.contactFrequency.mode * (currentWorkingScenario.current.lef.probabilityOfAction.mode / 100);
    const snapTef = snap.summary.tefMode;

    const curVuln = currentWorkingScenario.current.lef.useDirectVuln
      ? (currentWorkingScenario.current.lef.directVuln.mode || 0) * 100
      : currentWorkingScenario.current.lef.threatCapability.mode > currentWorkingScenario.current.lef.resistanceStrength.mode ? 100 : 0;
    const snapVuln = snap.summary.vulnModePct;

    const curPrimary =
      currentWorkingScenario.current.primaryLoss.productivity.mode +
      currentWorkingScenario.current.primaryLoss.response.mode +
      currentWorkingScenario.current.primaryLoss.replacement.mode +
      currentWorkingScenario.current.primaryLoss.finesAndJudgements.mode +
      currentWorkingScenario.current.primaryLoss.competitiveAdvantage.mode +
      currentWorkingScenario.current.primaryLoss.reputation.mode;
    const snapPrimary = snap.summary.primaryLossMode;

    const curSecondary =
      currentWorkingScenario.current.secondaryLoss.productivity.mode +
      currentWorkingScenario.current.secondaryLoss.response.mode +
      currentWorkingScenario.current.secondaryLoss.replacement.mode +
      currentWorkingScenario.current.secondaryLoss.finesAndJudgements.mode +
      currentWorkingScenario.current.secondaryLoss.competitiveAdvantage.mode +
      currentWorkingScenario.current.secondaryLoss.reputation.mode;
    const snapSecondary = snap.summary.secondaryLossMode;

    return {
      tefDiff: snapTef - curTef,
      vulnDiff: snapVuln - curVuln,
      primaryDiff: snapPrimary - curPrimary,
      secondaryDiff: snapSecondary - curSecondary
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#09090b] border border-zinc-700/80 rounded-2xl w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-zinc-100 font-mono">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-[#050505]/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white font-display uppercase tracking-wider">
                  Scenario Version History &amp; Snapshots
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-cyan-400 border border-zinc-700">
                  {snapshots.length} {snapshots.length === 1 ? 'Snapshot' : 'Snapshots'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Target: <strong className="text-zinc-200">{scenario.name}</strong> • Automatic snapshots are saved on every simulation run.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isCreatingManual ? (
              <button
                onClick={() => setIsCreatingManual(true)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-400 hover:text-cyan-300 border border-zinc-700 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Checkpoint</span>
              </button>
            ) : null}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Manual Checkpoint Creator Inline */}
        {isCreatingManual && (
          <div className="bg-zinc-900/90 border-b border-zinc-800 p-3.5 px-5 flex items-center space-x-3 animate-in slide-in-from-top duration-150">
            <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider whitespace-nowrap">Checkpoint Note:</span>
            <input
              type="text"
              placeholder="e.g. Baseline before increasing Threat Capability"
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSnapshot()}
            />
            <button
              onClick={handleCreateSnapshot}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold uppercase tracking-wider flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              onClick={() => { setIsCreatingManual(false); setManualNote(''); }}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Main Content: Left Snapshot List + Right Snapshot Inspector */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[420px]">
          {/* Left Column: Chronological Snapshots List */}
          <div className="md:col-span-5 border-r border-zinc-800/90 overflow-y-auto p-4 space-y-2.5 bg-[#050505]/40">
            {snapshots.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 space-y-2">
                <Clock className="w-8 h-8 mx-auto text-zinc-600" />
                <p className="text-xs">No saved snapshots yet.</p>
                <p className="text-[11px] text-zinc-600">
                  Snapshots are automatically created each time you click "Save &amp; Re-Run Monte Carlo Simulation", or when you save a manual checkpoint.
                </p>
              </div>
            ) : (
              snapshots.map((snap, idx) => {
                const isSelected = selectedSnapshot?.id === snap.id;
                const isLatest = idx === 0;
                const dateObj = new Date(snap.createdAt);

                return (
                  <div
                    key={snap.id}
                    onClick={() => setSelectedSnapshotId(snap.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-zinc-900 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-[#050505] border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          isLatest
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}>
                          v{snap.versionNumber} {isLatest && '• Latest'}
                        </span>
                        <span className="text-[11px] text-zinc-400 flex items-center space-x-1 font-mono">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>

                      <span className="text-[10px] text-zinc-500">{dateObj.toLocaleDateString()}</span>
                    </div>

                    {/* Snapshot Note */}
                    <div className="mb-2 text-xs text-zinc-200 font-sans line-clamp-2">
                      {snap.note || 'Monte Carlo Run Checkpoint'}
                    </div>

                    {/* Key parameter badges */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-black/60 p-2 rounded-lg border border-zinc-800/60 font-mono">
                      <div>
                        <span className="text-zinc-500 block">TEF Mode:</span>
                        <span className="text-cyan-400 font-bold">{snap.summary.tefMode}/yr</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Vuln Mode:</span>
                        <span className="text-rose-400 font-bold">{snap.summary.vulnModePct.toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Primary Loss:</span>
                        <span className="text-zinc-200 font-bold">{formatAmount(snap.summary.primaryLossMode, snap.currency, snap.unitScale)}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Secondary:</span>
                        <span className="text-zinc-200 font-bold">{formatAmount(snap.summary.secondaryLossMode, snap.currency, snap.unitScale)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Snapshot Deep Inspection & Revert Controls */}
          <div className="md:col-span-7 p-5 overflow-y-auto flex flex-col justify-between bg-[#09090b]">
            {selectedSnapshot ? (
              <div className="space-y-4">
                {/* Snapshot Header */}
                <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded text-xs font-black bg-cyan-950 text-cyan-300 border border-cyan-700 uppercase tracking-wider">
                        Version {selectedSnapshot.versionNumber}
                      </span>
                      <span className="text-xs text-zinc-400">
                        Recorded on {new Date(selectedSnapshot.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {editingNoteId === selectedSnapshot.id ? (
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="text"
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          className="bg-black border border-zinc-700 rounded px-2.5 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none flex-1"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(selectedSnapshot.id)}
                        />
                        <button
                          onClick={() => handleSaveNote(selectedSnapshot.id)}
                          className="p-1 rounded bg-cyan-600 hover:bg-cyan-500 text-black"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="p-1 rounded bg-zinc-800 text-zinc-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm font-sans text-zinc-300">
                          {selectedSnapshot.note || 'Monte Carlo Run Checkpoint'}
                        </p>
                        <button
                          onClick={() => {
                            setEditingNoteId(selectedSnapshot.id);
                            setEditingNoteText(selectedSnapshot.note || '');
                          }}
                          className="text-zinc-500 hover:text-cyan-400 transition-colors p-1"
                          title="Edit Note"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Delete button */}
                  <div>
                    {deleteConfirmId === selectedSnapshot.id ? (
                      <div className="flex items-center space-x-1.5 bg-red-950/80 border border-red-800 p-1 rounded-lg">
                        <span className="text-[10px] text-red-300 px-1 font-bold">Delete?</span>
                        <button
                          onClick={async () => {
                            await onDeleteSnapshot(selectedSnapshot.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(selectedSnapshot.id)}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/60 hover:text-red-400 text-zinc-500 border border-zinc-800 transition-colors"
                        title="Delete snapshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Diff against Current Active Configuration */}
                {(() => {
                  const diff = calculateDiff(selectedSnapshot);
                  const hasDiff =
                    diff.tefDiff !== 0 ||
                    diff.vulnDiff !== 0 ||
                    diff.primaryDiff !== 0 ||
                    diff.secondaryDiff !== 0;

                  return (
                    <div className="bg-[#050505] p-3.5 rounded-xl border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-1.5">
                          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Delta vs Current Working Config:</span>
                        </span>
                        {!hasDiff ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Identical to Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                            Parameters Differ
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                        <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 block">TEF (Events/Yr)</span>
                          <span className="text-zinc-200 font-bold">{selectedSnapshot.summary.tefMode}</span>
                          {diff.tefDiff !== 0 && (
                            <span className={`text-[10px] ml-1.5 font-bold ${diff.tefDiff > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              ({diff.tefDiff > 0 ? `+${diff.tefDiff}` : diff.tefDiff})
                            </span>
                          )}
                        </div>

                        <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 block">Vulnerability</span>
                          <span className="text-zinc-200 font-bold">{selectedSnapshot.summary.vulnModePct.toFixed(0)}%</span>
                          {diff.vulnDiff !== 0 && (
                            <span className={`text-[10px] ml-1.5 font-bold ${diff.vulnDiff > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              ({diff.vulnDiff > 0 ? `+${diff.vulnDiff.toFixed(0)}%` : `${diff.vulnDiff.toFixed(0)}%`})
                            </span>
                          )}
                        </div>

                        <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 block">Primary Loss</span>
                          <span className="text-zinc-200 font-bold">
                            {formatAmount(selectedSnapshot.summary.primaryLossMode, selectedSnapshot.currency, selectedSnapshot.unitScale)}
                          </span>
                        </div>

                        <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 block">Secondary Loss</span>
                          <span className="text-zinc-200 font-bold">
                            {formatAmount(selectedSnapshot.summary.secondaryLossMode, selectedSnapshot.currency, selectedSnapshot.unitScale)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Parameter Table Breakdown */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Detailed 3-Point Estimates in this Snapshot:
                  </span>
                  <div className="bg-[#050505] rounded-xl border border-zinc-800 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-zinc-900/90 text-[10px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                        <tr>
                          <th className="py-2 px-3">FAIR Variable</th>
                          <th className="py-2 px-3">Min</th>
                          <th className="py-2 px-3 font-bold text-cyan-400">Mode</th>
                          <th className="py-2 px-3">Max</th>
                          <th className="py-2 px-3 text-right">Conf (γ)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                        <tr>
                          <td className="py-1.5 px-3 font-medium text-white">Threat Event Frequency (TEF)</td>
                          <td className="py-1.5 px-3 text-zinc-400">{selectedSnapshot.scenarioData.current.lef.directTef?.low ?? selectedSnapshot.scenarioData.current.lef.contactFrequency?.low ?? 0}</td>
                          <td className="py-1.5 px-3 font-bold text-cyan-300">{selectedSnapshot.summary.tefMode}</td>
                          <td className="py-1.5 px-3 text-zinc-400">{selectedSnapshot.scenarioData.current.lef.directTef?.high ?? selectedSnapshot.scenarioData.current.lef.contactFrequency?.high ?? 0}</td>
                          <td className="py-1.5 px-3 text-right text-zinc-400">{selectedSnapshot.scenarioData.current.lef.directTef?.confidence || 4}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 font-medium text-white">Threat Capability (T-Cap)</td>
                          <td className="py-1.5 px-3 text-zinc-400">{selectedSnapshot.scenarioData.current.lef.threatCapability.low}</td>
                          <td className="py-1.5 px-3 font-bold text-cyan-300">{selectedSnapshot.scenarioData.current.lef.threatCapability.mode}</td>
                          <td className="py-1.5 px-3 text-zinc-400">{selectedSnapshot.scenarioData.current.lef.threatCapability.high}</td>
                          <td className="py-1.5 px-3 text-right text-zinc-400">{selectedSnapshot.scenarioData.current.lef.threatCapability.confidence || 4}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 font-medium text-white">Control Resistance Strength (RS)</td>
                          <td className="py-1.5 px-3 text-zinc-400">{selectedSnapshot.scenarioData.current.lef.resistanceStrength.low}</td>
                          <td className="py-1.5 px-3 font-bold text-cyan-300">{selectedSnapshot.scenarioData.current.lef.resistanceStrength.mode}</td>
                          <td className="py-1.5 px-3 text-zinc-400">{selectedSnapshot.scenarioData.current.lef.resistanceStrength.high}</td>
                          <td className="py-1.5 px-3 text-right text-zinc-400">{selectedSnapshot.scenarioData.current.lef.resistanceStrength.confidence || 4}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 font-medium text-white">Productivity Loss (Direct)</td>
                          <td className="py-1.5 px-3 text-zinc-400">{formatAmount(selectedSnapshot.scenarioData.current.primaryLoss.productivity.low, selectedSnapshot.currency, selectedSnapshot.unitScale)}</td>
                          <td className="py-1.5 px-3 font-bold text-cyan-300">{formatAmount(selectedSnapshot.scenarioData.current.primaryLoss.productivity.mode, selectedSnapshot.currency, selectedSnapshot.unitScale)}</td>
                          <td className="py-1.5 px-3 text-zinc-400">{formatAmount(selectedSnapshot.scenarioData.current.primaryLoss.productivity.high, selectedSnapshot.currency, selectedSnapshot.unitScale)}</td>
                          <td className="py-1.5 px-3 text-right text-zinc-400">{selectedSnapshot.scenarioData.current.primaryLoss.productivity.confidence || 4}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 font-medium text-white">Response Loss (Direct)</td>
                          <td className="py-1.5 px-3 text-zinc-400">{formatAmount(selectedSnapshot.scenarioData.current.primaryLoss.response.low, selectedSnapshot.currency, selectedSnapshot.unitScale)}</td>
                          <td className="py-1.5 px-3 font-bold text-cyan-300">{formatAmount(selectedSnapshot.scenarioData.current.primaryLoss.response.mode, selectedSnapshot.currency, selectedSnapshot.unitScale)}</td>
                          <td className="py-1.5 px-3 text-zinc-400">{formatAmount(selectedSnapshot.scenarioData.current.primaryLoss.response.high, selectedSnapshot.currency, selectedSnapshot.unitScale)}</td>
                          <td className="py-1.5 px-3 text-right text-zinc-400">{selectedSnapshot.scenarioData.current.primaryLoss.response.confidence || 4}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-3 font-medium text-white">Secondary Loss Frequency (SLEF)</td>
                          <td className="py-1.5 px-3 text-zinc-400">{selectedSnapshot.scenarioData.current.secondaryLossEventFreq.low}%</td>
                          <td className="py-1.5 px-3 font-bold text-cyan-300">{selectedSnapshot.scenarioData.current.secondaryLossEventFreq.mode}%</td>
                          <td className="py-1.5 px-3 text-zinc-400">{selectedSnapshot.scenarioData.current.secondaryLossEventFreq.high}%</td>
                          <td className="py-1.5 px-3 text-right text-zinc-400">{selectedSnapshot.scenarioData.current.secondaryLossEventFreq.confidence || 4}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* What-if Proposed Status in Snapshot */}
                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>What-If Proposed Mitigation Branch:</span>
                  </div>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    selectedSnapshot.summary.hasProposed
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {selectedSnapshot.summary.hasProposed ? 'Enabled in Snapshot' : 'Disabled'}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Revert Action Footer */}
            {selectedSnapshot && (
              <div className="pt-4 border-t border-zinc-800 mt-4 flex items-center justify-between">
                <div className="text-xs text-zinc-400">
                  <span>Reverting will replace active builder parameters with <strong>v{selectedSnapshot.versionNumber}</strong>.</span>
                </div>

                {revertConfirmId === selectedSnapshot.id ? (
                  <div className="flex items-center space-x-2 bg-amber-950/80 border border-amber-700 p-1.5 rounded-xl animate-in zoom-in-95">
                    <span className="text-xs text-amber-200 font-bold px-2">Confirm Revert to v{selectedSnapshot.versionNumber}?</span>
                    <button
                      onClick={() => {
                        onRevertToSnapshot(selectedSnapshot);
                        setRevertConfirmId(null);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black font-display uppercase tracking-wider flex items-center space-x-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Yes, Revert</span>
                    </button>
                    <button
                      onClick={() => setRevertConfirmId(null)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setRevertConfirmId(selectedSnapshot.id)}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-black font-display text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg transition-all active:scale-98"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Revert to Version {selectedSnapshot.versionNumber}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
