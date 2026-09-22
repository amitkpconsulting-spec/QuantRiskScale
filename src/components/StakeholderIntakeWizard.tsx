import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Clock,
  Play,
  Copy,
  Check,
  Code2,
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  OPEN_FAIR_STAKEHOLDER_INTAKE_SYSTEM_PROMPT,
  FREQUENCY_PRESETS,
  StakeholderIntakeJsonOutput,
  createScenarioFromStakeholderJson
} from '../services/stakeholderIntakeService';
import { FairScenario } from '../types/fair';
import { formatAmount } from '../utils/distributions';

interface StakeholderIntakeWizardProps {
  onApplyScenario: (scenario: FairScenario) => void;
  onCancel?: () => void;
  currency?: string;
  initialAsset?: string;
  initialThreat?: string;
}

const ASSET_SUGGESTIONS = [
  'Customer PII & Payment Card Database',
  'Cloud Kubernetes Production Cluster',
  'Core Banking SWIFT Wire Gateway',
  'Corporate Active Directory & IAM Server',
  'Proprietary AI Model Weights & Training Data',
  'ERP & Supply Chain Inventory Database'
];

const THREAT_SUGGESTIONS = [
  'Organized Cybercrime Syndicate & Ransomware Crew',
  'Rogue / Disgruntled Internal Employee',
  'Nation-State Advanced Persistent Threat (APT)',
  'Third-Party SaaS Vendor / Supply Chain Adversary',
  'Opportunistic External Botnet / Script Kiddies'
];

export const StakeholderIntakeWizard: React.FC<StakeholderIntakeWizardProps> = ({
  onApplyScenario,
  onCancel,
  currency = '$',
  initialAsset = 'Customer PII & Payment Card Database',
  initialThreat = 'Organized Cybercrime Syndicate & Ransomware Crew'
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Scenario & CIA Harm
  const [asset, setAsset] = useState<string>(initialAsset);
  const [threatCommunity, setThreatCommunity] = useState<string>(initialThreat);
  const [harmType, setHarmType] = useState<'Confidentiality' | 'Integrity' | 'Availability' | 'All'>('Availability');
  const [customRiskStatement, setCustomRiskStatement] = useState<string>('');
  const [useCustomStatement, setUseCustomStatement] = useState<boolean>(false);

  // Step 2: Plain-Language LEF
  // 1. Standard year (Most Likely)
  const [standardLef, setStandardLef] = useState<number>(0.5); // once every 2 years
  // 2. Quietest year imaginable (Min)
  const [quietestLef, setQuietestLef] = useState<number>(0.1); // once every 10 years
  // 3. Catastrophic year (Max)
  const [catastrophicLef, setCatastrophicLef] = useState<number>(2.0); // twice a year

  // Step 3: Plain-Language LM
  // Immediate costs (IR, forensics, hardware, overtime)
  const [immediateMin, setImmediateMin] = useState<number>(25000);
  const [immediateMode, setImmediateMode] = useState<number>(100000);
  const [immediateMax, setImmediateMax] = useState<number>(350000);

  // Extended costs (Fines, notifications, legal, churn)
  const [extendedMin, setExtendedMin] = useState<number>(50000);
  const [extendedMode, setExtendedMode] = useState<number>(250000);
  const [extendedMax, setExtendedMax] = useState<number>(1200000);

  const [confidenceNotes, setConfidenceNotes] = useState<string>(
    'Calibrated via Open FAIR 3-step stakeholder intake interview.'
  );

  // UI helpers
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Computed 1-Sentence statement
  const generatedStatement = `${threatCommunity.trim() || 'Threat Actor'} causes ${
    harmType === 'All' ? 'Confidentiality, Integrity, and Availability harm' : `${harmType} harm`
  } to ${asset.trim() || 'the Asset'} resulting in financial loss.`;

  const finalRiskStatement = useCustomStatement && customRiskStatement.trim()
    ? customRiskStatement.trim()
    : generatedStatement;

  // Computed total LM
  const totalLmMin = immediateMin + extendedMin;
  const totalLmMode = immediateMode + extendedMode;
  const totalLmMax = immediateMax + extendedMax;

  // Output JSON schema matching user requirement
  const outputSchema: StakeholderIntakeJsonOutput = {
    scenario: finalRiskStatement,
    lef: {
      min: parseFloat(quietestLef.toFixed(3)),
      mode: parseFloat(standardLef.toFixed(3)),
      max: parseFloat(catastrophicLef.toFixed(3))
    },
    lm: {
      min: totalLmMin,
      mode: totalLmMode,
      max: totalLmMax
    },
    confidence_notes: confidenceNotes,
    asset,
    threatCommunity,
    harmType
  };

  const jsonString = JSON.stringify(
    {
      scenario: outputSchema.scenario,
      lef: outputSchema.lef,
      lm: outputSchema.lm,
      confidence_notes: outputSchema.confidence_notes
    },
    null,
    2
  );

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(OPEN_FAIR_STAKEHOLDER_INTAKE_SYSTEM_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleApplyToDashboard = () => {
    const newScenario = createScenarioFromStakeholderJson(outputSchema, currency);
    onApplyScenario(newScenario);
  };

  return (
    <div className="space-y-6 text-zinc-100 font-sans">
      {/* Header Banner with System Prompt Indicator */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-zinc-950 border border-cyan-800/60 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Open FAIR™ 3-Step Stakeholder Intake
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 font-mono">
                No Math Required
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-mono mt-0.5">
              Translates business domain realities into Beta-PERT Monte Carlo distributions automatically.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPromptModal(prev => !prev)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-mono transition-colors shrink-0"
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showPromptModal ? 'Hide System Prompt' : 'View AI System Prompt'}</span>
        </button>
      </div>

      {/* System Prompt Collapsible Card */}
      {showPromptModal && (
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 font-mono text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
            <span className="font-bold text-cyan-400 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Embedded AI Analyst System Prompt</span>
            </span>
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] border border-zinc-800 transition-colors"
            >
              {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
            </button>
          </div>
          <pre className="p-3 bg-black/60 rounded-lg text-zinc-300 overflow-x-auto whitespace-pre-wrap text-[11px] leading-relaxed max-h-48 custom-scrollbar border border-zinc-900">
            {OPEN_FAIR_STAKEHOLDER_INTAKE_SYSTEM_PROMPT}
          </pre>
          <p className="text-[11px] text-zinc-400 italic">
            This prompt powers both the guided conversational AI Copilot and this visual calibration workflow.
          </p>
        </div>
      )}

      {/* 3-Step Progress Indicator */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
            currentStep === 1
              ? 'bg-cyan-950/60 border-cyan-500 text-white ring-1 ring-cyan-500/30'
              : currentStep > 1
              ? 'bg-zinc-900 border-emerald-800 text-zinc-300'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
          }`}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
            currentStep === 1 ? 'bg-cyan-500 text-black' : currentStep > 1 ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {currentStep > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
          </div>
          <div className="truncate">
            <div className="font-bold">Step 1: Scenario</div>
            <div className="text-[10px] text-zinc-400 truncate">Asset, Threat & Harm</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
            currentStep === 2
              ? 'bg-cyan-950/60 border-cyan-500 text-white ring-1 ring-cyan-500/30'
              : currentStep > 2
              ? 'bg-zinc-900 border-emerald-800 text-zinc-300'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
          }`}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
            currentStep === 2 ? 'bg-cyan-500 text-black' : currentStep > 2 ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {currentStep > 2 ? <Check className="w-3 h-3 stroke-[3]" /> : '2'}
          </div>
          <div className="truncate">
            <div className="font-bold">Step 2: Frequency</div>
            <div className="text-[10px] text-zinc-400 truncate">Plain-Language LEF</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
            currentStep === 3
              ? 'bg-cyan-950/60 border-cyan-500 text-white ring-1 ring-cyan-500/30'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
          }`}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
            currentStep === 3 ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-400'
          }`}>
            3
          </div>
          <div className="truncate">
            <div className="font-bold">Step 3: Loss (LM)</div>
            <div className="text-[10px] text-zinc-400 truncate">Immediate & Extended</div>
          </div>
        </button>
      </div>

      {/* STEP 1: CLARIFY THE RISK SCENARIO */}
      {currentStep === 1 && (
        <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-5 animate-in fade-in duration-150">
          <div>
            <h5 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Step 1: Clarify the Risk Scenario</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                Asset • Threat Community • Harm
              </span>
            </h5>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              In Open FAIR, a risk cannot be quantified until the specific asset, threat actor, and type of harm are scoped.
            </p>
          </div>

          {/* Asset Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">
              1. What is the specific Asset at risk?
            </label>
            <input
              type="text"
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              placeholder="e.g. Customer PII Database, SWIFT Wire Gateway, E-Commerce Cluster"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ASSET_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAsset(item)}
                  className={`text-[11px] px-2 py-1 rounded-md border font-mono transition-colors ${
                    asset === item
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Threat Community */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">
              2. Who is the Threat Community / Adversary?
            </label>
            <input
              type="text"
              value={threatCommunity}
              onChange={(e) => setThreatCommunity(e.target.value)}
              placeholder="e.g. Organized Cybercrime Syndicate, Rogue Insider, Nation-State Group"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {THREAT_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setThreatCommunity(item)}
                  className={`text-[11px] px-2 py-1 rounded-md border font-mono transition-colors ${
                    threatCommunity === item
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Harm / Impact Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">
              3. What is the primary Harm or Impact?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              {[
                { id: 'Confidentiality', title: 'Confidentiality', desc: 'Data breach, theft, exfiltration' },
                { id: 'Integrity', title: 'Integrity', desc: 'Fraudulent entries, tampering, corruption' },
                { id: 'Availability', title: 'Availability', desc: 'Downtime, ransomware lock, denial of service' },
                { id: 'All', title: 'Comprehensive (All)', desc: 'Multi-vector double extortion event' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setHarmType(t.id as any)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    harmType === t.id
                      ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                  }`}
                >
                  <div className="font-bold text-xs">{t.title}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 1-Sentence Risk Statement (Mandatory FAIR requirement) */}
          <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-900/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-400 flex items-center space-x-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Standard FAIR 1-Sentence Risk Statement:</span>
              </span>
              <button
                type="button"
                onClick={() => setUseCustomStatement(prev => !prev)}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 underline font-mono"
              >
                {useCustomStatement ? 'Use Standard Form' : 'Customize Statement'}
              </button>
            </div>

            {useCustomStatement ? (
              <textarea
                value={customRiskStatement || generatedStatement}
                onChange={(e) => setCustomRiskStatement(e.target.value)}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            ) : (
              <p className="text-xs text-zinc-200 font-sans italic font-medium bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/80">
                "{generatedStatement}"
              </p>
            )}
            <p className="text-[11px] text-zinc-400 font-mono">
              Pattern: [Threat Actor] causes [Impact] to [Asset] resulting in financial loss.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs flex items-center space-x-2 transition-colors"
            >
              <span>Next: Calibrate Frequency (LEF)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CALIBRATE LOSS EVENT FREQUENCY (LEF) */}
      {currentStep === 2 && (
        <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-6 animate-in fade-in duration-150">
          <div>
            <h5 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Step 2: Calibrate Loss Event Frequency (LEF)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                3 Plain-Language Questions
              </span>
            </h5>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              No mathematical distributions needed! Select how often this event occurs in plain human terms, and the system automatically converts it into annualized Poisson / Beta-PERT parameters.
            </p>
          </div>

          {/* Question 1: Standard Year (Most Likely) */}
          <div className="space-y-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-start justify-between">
              <div>
                <label className="text-xs font-bold text-white block">
                  1. In a standard year, how many times does this event realistically happen?
                </label>
                <span className="text-[11px] text-cyan-400 font-mono">
                  Most Likely Mode (Peak of distribution)
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 font-mono font-bold text-xs border border-cyan-800">
                {standardLef >= 1 ? `${standardLef} / year` : `1 every ${(1 / standardLef).toFixed(1)} years (${standardLef}/yr)`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
              {FREQUENCY_PRESETS.slice(1, 7).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setStandardLef(p.annualValue);
                    if (p.annualValue < quietestLef) setQuietestLef(p.annualValue * 0.2);
                    if (p.annualValue > catastrophicLef) setCatastrophicLef(p.annualValue * 2.5);
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    Math.abs(standardLef - p.annualValue) < 0.01
                      ? 'bg-cyan-950 text-white border-cyan-500 ring-1 ring-cyan-500/50'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                  }`}
                >
                  <div className="font-bold text-[11px] truncate">{p.label}</div>
                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">{p.sublabel}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <span className="text-[11px] text-zinc-400 font-mono">Or custom annualized value:</span>
              <input
                type="number"
                step="0.05"
                min="0.001"
                max="365"
                value={standardLef}
                onChange={(e) => setStandardLef(Math.max(0.001, parseFloat(e.target.value) || 0.001))}
                className="w-28 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs text-white font-mono"
              />
              <span className="text-[11px] text-zinc-400 font-mono">events / year</span>
            </div>
          </div>

          {/* Question 2: Quietest Year (Min) */}
          <div className="space-y-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-start justify-between">
              <div>
                <label className="text-xs font-bold text-white block">
                  2. In the quietest year imaginable, what is the absolute minimum occurrences?
                </label>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Minimum Bound (Quiet period / dormant threats)
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-800">
                {quietestLef >= 1 ? `${quietestLef} / year` : `1 every ${(1 / quietestLef).toFixed(1)} years (${quietestLef}/yr)`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              {[
                { label: '1 in 50 years', val: 0.02 },
                { label: '1 in 20 years', val: 0.05 },
                { label: '1 in 10 years', val: 0.1 },
                { label: '1 in 5 years', val: 0.2 },
                { label: '1 in 2 years', val: 0.5 },
                { label: '1 per year', val: 1.0 },
                { label: '2 per year', val: 2.0 },
                { label: '5 per year', val: 5.0 }
              ].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuietestLef(q.val)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    Math.abs(quietestLef - q.val) < 0.01
                      ? 'bg-emerald-950 text-white border-emerald-500 ring-1 ring-emerald-500/40'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                  }`}
                >
                  <div className="font-bold text-[11px]">{q.label}</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{q.val}/yr</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Catastrophic Year (Max) */}
          <div className="space-y-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-start justify-between">
              <div>
                <label className="text-xs font-bold text-white block">
                  3. In a catastrophic year, what is the worst-case frequency?
                </label>
                <span className="text-[11px] text-rose-400 font-mono">
                  Maximum Bound (Severe campaign barrage / multi-wave attack)
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 font-mono font-bold text-xs border border-rose-800">
                {catastrophicLef} events / year
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              {[
                { label: '1 per year', val: 1.0 },
                { label: '2 per year', val: 2.0 },
                { label: '3 per year', val: 3.0 },
                { label: '5 per year', val: 5.0 },
                { label: '10 per year', val: 10.0 },
                { label: '15 per year', val: 15.0 },
                { label: '25 per year', val: 25.0 },
                { label: '50 per year', val: 50.0 }
              ].map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCatastrophicLef(c.val)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    Math.abs(catastrophicLef - c.val) < 0.01
                      ? 'bg-rose-950 text-white border-rose-500 ring-1 ring-rose-500/40'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                  }`}
                >
                  <div className="font-bold text-[11px]">{c.label}</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{c.val}/yr</div>
                </button>
              ))}
            </div>
          </div>

          {/* Calibrated Frequency Conversion Box */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/60 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-300 flex items-center space-x-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Converted Annualized Loss Event Frequency (LEF):</span>
            </span>
            <div className="space-x-3 text-cyan-300 font-bold">
              <span>Min: <span className="text-white">{quietestLef.toFixed(3)}/yr</span></span>
              <span>•</span>
              <span>Mode: <span className="text-cyan-400">{standardLef.toFixed(3)}/yr</span></span>
              <span>•</span>
              <span>Max: <span className="text-white">{catastrophicLef.toFixed(3)}/yr</span></span>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs flex items-center space-x-2 transition-colors"
            >
              <span>Next: Calibrate Dollar Loss (LM)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CALIBRATE LOSS MAGNITUDE (LM) */}
      {currentStep === 3 && (
        <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-6 animate-in fade-in duration-150">
          <div>
            <h5 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Step 3: Calibrate Loss Magnitude (LM)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                Immediate vs. Extended Dollar Costs
              </span>
            </h5>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              In Open FAIR, loss is categorized into direct primary costs (immediate response) and secondary ripple costs (regulatory fines, customer churn, legal settlements).
            </p>
          </div>

          {/* 1. Immediate Costs */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Immediate Direct Costs</span>
                </span>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  Mode: {formatAmount(immediateMode, currency, 1)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Incident response retainers, forensic investigators, hardware replacement, staff overtime, and immediate business downtime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Min (10th% - Best Case)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-500">{currency}</span>
                  <input
                    type="number"
                    step="5000"
                    value={immediateMin}
                    onChange={(e) => setImmediateMin(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-cyan-400 font-bold block mb-1">Most Likely (Mode)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-cyan-400">{currency}</span>
                  <input
                    type="number"
                    step="10000"
                    value={immediateMode}
                    onChange={(e) => setImmediateMode(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-zinc-900 border border-cyan-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Max (90th% - Severe)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-500">{currency}</span>
                  <input
                    type="number"
                    step="25000"
                    value={immediateMax}
                    onChange={(e) => setImmediateMax(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Extended / Secondary Costs */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>Extended & Secondary Ripple Costs</span>
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  Mode: {formatAmount(extendedMode, currency, 1)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Regulatory penalties (GDPR/SEC/HIPAA), customer notification mailers, credit monitoring, class-action settlements, and reputational churn.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Min (10th% - Minor Fines)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-500">{currency}</span>
                  <input
                    type="number"
                    step="10000"
                    value={extendedMin}
                    onChange={(e) => setExtendedMin(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-amber-400 font-bold block mb-1">Most Likely (Mode)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-amber-400">{currency}</span>
                  <input
                    type="number"
                    step="25000"
                    value={extendedMode}
                    onChange={(e) => setExtendedMode(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-zinc-900 border border-amber-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Max (90th% - Heavy Fines)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-500">{currency}</span>
                  <input
                    type="number"
                    step="50000"
                    value={extendedMax}
                    onChange={(e) => setExtendedMax(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Total Loss Magnitude Summary Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider block">
                Total Combined Loss Magnitude (LM):
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Immediate + Extended Costs aggregated for Monte Carlo engine
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="text-zinc-400">Min: <strong className="text-white">{formatAmount(totalLmMin, currency, 1)}</strong></span>
              <span>•</span>
              <span className="text-cyan-400">Mode: <strong className="text-cyan-300 text-sm">{formatAmount(totalLmMode, currency, 1)}</strong></span>
              <span>•</span>
              <span className="text-zinc-400">Max: <strong className="text-white">{formatAmount(totalLmMax, currency, 1)}</strong></span>
            </div>
          </div>

          {/* Structured Output Schema Preview */}
          <div className="p-4 rounded-xl bg-black/80 border border-cyan-900/60 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-cyan-400 font-bold flex items-center space-x-1.5">
                <Code2 className="w-3.5 h-3.5" />
                <span>Generated Output Schema for Monte Carlo Engine:</span>
              </span>
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex items-center space-x-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedJson ? 'Copied JSON' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3 bg-zinc-950 rounded-lg text-emerald-400 text-[11px] whitespace-pre-wrap leading-relaxed overflow-x-auto border border-zinc-900">
              {jsonString}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Frequency</span>
            </button>

            {/* GOLDEN PATH ACTION: Apply to Dashboard & Run Monte Carlo */}
            <button
              type="button"
              onClick={handleApplyToDashboard}
              className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold font-mono text-xs uppercase tracking-wider shadow-xl shadow-white/10 flex items-center space-x-2 transition-all"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Apply to Dashboard & Run Monte Carlo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
