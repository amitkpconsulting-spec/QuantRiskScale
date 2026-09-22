import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  Shield,
  Lightbulb,
  Cpu,
  Layers,
  ChevronRight,
  Code2,
  Copy,
  Check,
  Play,
  ArrowRight,
  CheckCircle2,
  FileText,
  HelpCircle,
  Sliders
} from 'lucide-react';
import { FairScenario, SimulationResult, LocalAiEndpointConfig } from '../types/fair';
import { formatAmount } from '../utils/distributions';
import {
  OPEN_FAIR_STAKEHOLDER_INTAKE_SYSTEM_PROMPT,
  extractStakeholderJson,
  createScenarioFromStakeholderJson,
  parsePlainLanguageFrequency
} from '../services/stakeholderIntakeService';
import { executeAiPrompt } from '../services/aiEndpointService';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: FairScenario;
  simResult: SimulationResult | null;
  aiConfig: LocalAiEndpointConfig;
  onUpdateAiConfig: (cfg: LocalAiEndpointConfig) => void;
  onNavigateToBuilder?: () => void;
  onApplyScenario?: (newScenario: FairScenario) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  intakeStep?: 1 | 2 | 3 | 'complete';
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  scenario,
  simResult,
  aiConfig,
  onUpdateAiConfig,
  onNavigateToBuilder,
  onApplyScenario
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'intake' | 'advisor'>('intake');
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Conversational Intake state
  const [intakeStep, setIntakeStep] = useState<1 | 2 | 3 | 'complete'>(1);
  const [intakeScenarioStatement, setIntakeScenarioStatement] = useState<string>('');
  const [intakeLef, setIntakeLef] = useState<{ min: number; mode: number; max: number }>({ min: 0.1, mode: 0.5, max: 2.0 });

  const [advisorMessages, setAdvisorMessages] = useState<Message[]>([
    {
      id: 'welcome-advisor',
      sender: 'assistant',
      text: `Hello! I am your Open FAIR Quantitative Risk Advisor. I'm actively analyzing **${scenario.name}**. How can I assist you with threat calibrations, loss magnitudes, or executive board framing?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [intakeMessages, setIntakeMessages] = useState<Message[]>([
    {
      id: 'welcome-intake',
      sender: 'assistant',
      text: `Welcome! I am your Open FAIR™ Risk Quantification Analyst. I will guide you through a 3-step intake process to compute quantitative risk—**no mathematical distribution knowledge required**.\n\n### Step 1: Clarify the Risk Scenario\nPlease identify:\n1. **The specific Asset** (e.g. Customer PII Database, Cloud Cluster, SWIFT Wire Gateway)\n2. **The Threat Community** (e.g. Organized Cybercrime, Rogue Insider, Nation-State APT)\n3. **The Harm/Impact** (Confidentiality, Integrity, or Availability)\n\nOr click one of the quick scenario starters below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intakeStep: 1
    }
  ]);

  const currentMessages = activeTab === 'intake' ? intakeMessages : advisorMessages;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(OPEN_FAIR_STAKEHOLDER_INTAKE_SYSTEM_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (activeTab === 'intake') {
      setIntakeMessages(prev => [...prev, userMsg]);
    } else {
      setAdvisorMessages(prev => [...prev, userMsg]);
    }

    setInput('');
    setIsThinking(true);

    if (activeTab === 'advisor') {
      // General advisor response
      setTimeout(async () => {
        let reply = '';
        const lower = textToSend.toLowerCase();

        if (lower.includes('board') || lower.includes('executive') || lower.includes('summary')) {
          const ale = simResult ? formatAmount(simResult.currentStats.mean, scenario.currency, scenario.unitScale) : 'calculated ALE';
          const p90 = simResult ? formatAmount(simResult.currentStats.p90, scenario.currency, scenario.unitScale) : 'P90 exposure';
          reply = `### Executive Summary for Board Presentation\n\n• **Annualized Risk Exposure**: Expected Loss of **${ale}/year** with a 1-in-10 year catastrophic tail event (P90) reaching **${p90}**.\n• **Primary Driver**: ${scenario.threatCommunity} exploiting vulnerability in ${scenario.asset}.\n• **Recommended Decision**: Allocate mitigation budget up to proposed controls to reduce exposure by up to ${simResult?.riskReductionPct || 45}% with a positive ROI.`;
        } else if (lower.includes('calibrate') || lower.includes('parameter') || lower.includes('tef') || lower.includes('pert')) {
          reply = `### Calibrated Parameter Guidance\n\n• **Current Direct LEF**: Min ${scenario.current.lef.directLef.low} / Mode ${scenario.current.lef.directLef.mode} / Max ${scenario.current.lef.directLef.high} per year.\n• **Vulnerability**: ${(scenario.current.lef.directVuln.mode * 100).toFixed(0)}% exploit likelihood per attempt.\n• **Tip**: For high-confidence calibration, keep the ratio of Max to Min within 1 order of magnitude unless historical volatility justifies a wider heavy tail.`;
        } else if (lower.includes('reduction') || lower.includes('roi') || lower.includes('proposed')) {
          reply = `### Mitigation ROI Analysis\n\n${
            simResult?.riskReductionPct
              ? `• The proposed control posture reduces Annualized Loss Exposure by **${simResult.riskReductionPct}%**.\n• Mitigated Mean ALE drops to **${formatAmount(simResult.proposedStats?.mean || 0, scenario.currency, scenario.unitScale)}/year**.\n• Any security investment under this savings threshold yields positive cyber risk reduction ROI.`
              : `• Proposed controls are currently not enabled in this scenario. Enable "Proposed Mitigated State" in the Quick Tune drawer to see the delta.`
          }`;
        } else {
          // Attempt real AI query or fallback
          try {
            const aiRes = await executeAiPrompt(
              {
                type: 'custom_chat',
                scenario,
                simResult: simResult || undefined,
                userCustomPrompt: textToSend
              },
              aiConfig
            );
            reply = aiRes.text;
          } catch {
            reply = `Based on the Open FAIR standard for **${scenario.name}**:\n\n• **Loss Event Frequency (LEF)**: ${simResult ? simResult.currentLefStats.mean.toFixed(2) : scenario.current.lef.directLef.mode} events/yr.\n• **Loss Magnitude (LM)**: Direct productivity loss mode is ${formatAmount(scenario.current.primaryLoss.productivity.mode, scenario.currency, scenario.unitScale)}.\n• **Standard Reference**: Aligned with Open Group O-RT and O-RA standards.`;
          }
        }

        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setAdvisorMessages(prev => [...prev, botMsg]);
        setIsThinking(false);
      }, 500);
      return;
    }

    // ACTIVE TAB IS 'intake' (Stakeholder 3-Step Guided Intake)
    setTimeout(() => {
      let reply = '';
      let nextStep: 1 | 2 | 3 | 'complete' = intakeStep;

      const lower = textToSend.toLowerCase();

      if (intakeStep === 1) {
        // Formulate 1-sentence risk statement
        let assetName = 'Customer Financial Database';
        let threat = 'Organized Cybercrime Syndicate';
        let harm = 'Availability';

        if (lower.includes('swift') || lower.includes('wire') || lower.includes('bank')) {
          assetName = 'Core Banking SWIFT Wire Gateway';
          threat = 'Financial Fraudsters & State-Sponsored APT';
          harm = 'Integrity and Financial Theft';
        } else if (lower.includes('cloud') || lower.includes('kubernetes') || lower.includes('outage') || lower.includes('ddos')) {
          assetName = 'Cloud Kubernetes Production Cluster';
          threat = 'Distributed Botnet / Rogue Configuration';
          harm = 'Availability (Downtime)';
        } else if (lower.includes('model') || lower.includes('ai') || lower.includes('weights') || lower.includes('exfiltration')) {
          assetName = 'Proprietary AI Weights & Training Store';
          threat = 'Adversarial Corporate Espionage Unit';
          harm = 'Confidentiality (Exfiltration)';
        } else if (textToSend.includes(' causes ') && textToSend.includes(' to ')) {
          // User provided formatted statement
          assetName = 'Identified Asset';
        }

        const statement = textToSend.includes(' resulting in ')
          ? textToSend.trim()
          : `${threat} causes ${harm} harm to ${assetName} resulting in financial loss.`;

        setIntakeScenarioStatement(statement);
        nextStep = 2;
        setIntakeStep(2);

        reply = `✅ **Step 1 Complete: Risk Statement Formulated**\n> "${statement}"\n\n---\n\n### Step 2: Calibrate Loss Event Frequency (LEF)\nNow let's estimate how frequently this event happens in plain human terms:\n1. **Standard Year (Most Likely)**: In a realistic standard year, how many times does this occur? (e.g. *once every 5 years*, *once a year*, *2 to 3 times/year*)\n2. **Quietest Year (Min)**: In the quietest year imaginable with dormant threats, what is the absolute minimum? (e.g. *once in 20 years = 0.05/yr*)\n3. **Catastrophic Year (Max)**: In a catastrophic campaign burst, what is the worst-case frequency? (e.g. *2 times/year*, *5 times/year*)\n\n*Select a preset below or type your estimates in plain language!*`;
      } else if (intakeStep === 2) {
        // Parse frequency answers
        let modeFreq = 0.5;
        let minFreq = 0.1;
        let maxFreq = 2.0;

        if (lower.includes('5 year') || lower.includes('0.2')) {
          modeFreq = 0.2;
          minFreq = 0.05;
          maxFreq = 1.0;
        } else if (lower.includes('10 year') || lower.includes('0.1')) {
          modeFreq = 0.1;
          minFreq = 0.02;
          maxFreq = 0.5;
        } else if (lower.includes('once a year') || lower.includes('1/yr') || lower.includes('1 per year')) {
          modeFreq = 1.0;
          minFreq = 0.2;
          maxFreq = 3.0;
        } else if (lower.includes('2 to 3') || lower.includes('2-3') || lower.includes('twice')) {
          modeFreq = 2.5;
          minFreq = 0.5;
          maxFreq = 6.0;
        } else if (lower.includes('monthly') || lower.includes('12')) {
          modeFreq = 12.0;
          minFreq = 2.0;
          maxFreq = 24.0;
        } else {
          const parsed = parsePlainLanguageFrequency(textToSend);
          if (parsed !== null) {
            modeFreq = parsed;
            minFreq = parseFloat((parsed * 0.2).toFixed(3));
            maxFreq = parseFloat((parsed * 3.0).toFixed(3));
          }
        }

        setIntakeLef({ min: minFreq, mode: modeFreq, max: maxFreq });
        nextStep = 3;
        setIntakeStep(3);

        reply = `✅ **Step 2 Complete: Converted to Annualized LEF**\n• **Quietest Year (Min)**: **${minFreq}/yr** (1 every ${(1 / Math.max(0.001, minFreq)).toFixed(1)} years)\n• **Standard Year (Mode)**: **${modeFreq}/yr** (1 every ${(1 / Math.max(0.001, modeFreq)).toFixed(1)} years)\n• **Catastrophic Year (Max)**: **${maxFreq}/yr**\n\n---\n\n### Step 3: Calibrate Loss Magnitude (LM)\nNow let's estimate the dollar financial consequences if this event occurs:\n1. **Immediate Direct Costs**: Incident response retainers, forensic investigators, hardware replacement, staff overtime.\n2. **Extended & Secondary Costs**: Regulatory penalties, customer notification letters, legal settlements, brand churn.\n\nWhat are your **Min (best case)**, **Most Likely**, and **Max (worst case)** total dollar ranges?\n*(e.g., Immediate: $50k to $250k, Extended: $100k to $1.2M)*`;
      } else {
        // Step 3: Finalize Loss Magnitude and output JSON schema!
        let minLoss = 50000;
        let modeLoss = 250000;
        let maxLoss = 1200000;

        if (lower.includes('million') || lower.includes('m')) {
          modeLoss = 1500000;
          minLoss = 300000;
          maxLoss = 6500000;
        } else if (lower.includes('100k') || lower.includes('50k')) {
          minLoss = 35000;
          modeLoss = 180000;
          maxLoss = 750000;
        }

        const scenarioText = intakeScenarioStatement || `${scenario.threatCommunity} causes Availability harm to ${scenario.asset} resulting in financial loss.`;

        const outputData = {
          scenario: scenarioText,
          lef: {
            min: intakeLef.min,
            mode: intakeLef.mode,
            max: intakeLef.max
          },
          lm: {
            min: minLoss,
            mode: modeLoss,
            max: maxLoss
          },
          confidence_notes: "Calibrated via Open FAIR 3-step stakeholder intake interview."
        };

        nextStep = 'complete';
        setIntakeStep('complete');

        reply = `🎉 **All 3 Intake Steps Complete!**\n\nYour plain-language business inputs have been calibrated into Open FAIR parameters:\n\n\`\`\`json\n${JSON.stringify(outputData, null, 2)}\n\`\`\`\n\n**Ready to view quantified risk?** Click **"Apply to Dashboard & Run Monte Carlo"** below to calculate Annualized Loss Expectancy (ALE), Value at Risk (VaR), and Loss Exceedance Curves.`;
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intakeStep: nextStep
      };

      setIntakeMessages(prev => [...prev, botMsg]);
      setIsThinking(false);
    }, 600);
  };

  const handleApplyFromMessage = (jsonOutput: any) => {
    const sc = createScenarioFromStakeholderJson(jsonOutput, scenario.currency);
    if (onApplyScenario) {
      onApplyScenario(sc);
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 3500);
    }
  };

  const intakeQuickStarters = [
    {
      step: 1,
      options: [
        'Ransomware locks Customer Database',
        'Wire Fraud Gateway Unauthorized Transfer',
        'Production Kubernetes DDoS & Outage',
        'Proprietary AI Weights Stolen by Competitor'
      ]
    },
    {
      step: 2,
      options: [
        'Once every 5 years (0.2/yr)',
        'Once every 2 years (0.5/yr)',
        'Once a year (1.0/yr)',
        '2 to 3 times a year (2.5/yr)'
      ]
    },
    {
      step: 3,
      options: [
        'Immediate: $50k-$200k, Extended: $100k-$500k',
        'Immediate: $150k-$500k, Extended: $500k-$2.5M',
        'Immediate: $500k-$2M, Extended: $2M-$10M'
      ]
    }
  ];

  const currentStarters = intakeQuickStarters.find(s => s.step === intakeStep)?.options || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-[#09090b] border-l border-zinc-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-[#050505]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  Open FAIR AI Copilot
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  v2.5
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono truncate max-w-xs">
                Context: {scenario.name.split(':')[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-mono border border-zinc-800 flex items-center space-x-1.5 transition-colors"
              title="Inspect Stakeholder Analyst System Prompt"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">System Prompt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-[#070709] px-4 font-mono text-xs">
          <button
            onClick={() => setActiveTab('intake')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'intake'
                ? 'border-cyan-400 text-white bg-zinc-900/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Stakeholder Guided Intake (3-Step)</span>
          </button>
          <button
            onClick={() => setActiveTab('advisor')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'advisor'
                ? 'border-cyan-400 text-white bg-zinc-900/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Scenario Advisory</span>
          </button>
        </div>

        {/* System Prompt Inspection Collapsible */}
        {showSystemPrompt && (
          <div className="p-4 bg-zinc-950 border-b border-zinc-800 space-y-2.5 font-mono text-xs animate-in slide-in-from-top-2 duration-150 shrink-0">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="font-bold text-cyan-400 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Open FAIR™ Stakeholder Intake System Prompt</span>
              </span>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center space-x-1 px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] border border-zinc-800"
              >
                {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 bg-black/80 rounded-lg text-zinc-300 text-[10px] whitespace-pre-wrap max-h-36 overflow-y-auto custom-scrollbar border border-zinc-900">
              {OPEN_FAIR_STAKEHOLDER_INTAKE_SYSTEM_PROMPT}
            </pre>
          </div>
        )}

        {/* Success Toast */}
        {appliedSuccess && (
          <div className="p-3 bg-emerald-950/90 border-b border-emerald-800 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Scenario loaded into Risk Cockpit & Monte Carlo executed!</span>
            </div>
            <button
              onClick={() => {
                setAppliedSuccess(false);
                onClose();
              }}
              className="px-2 py-0.5 rounded bg-emerald-900 text-white font-bold text-[10px]"
            >
              View Dashboard
            </button>
          </div>
        )}

        {/* 3-Step Visual Tracker (in Intake mode) */}
        {activeTab === 'intake' && (
          <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center space-x-3 text-zinc-400">
              <span className={intakeStep === 1 ? 'text-cyan-400 font-bold' : intakeStep !== 1 ? 'text-emerald-400' : ''}>
                1. Scenario
              </span>
              <span>→</span>
              <span className={intakeStep === 2 ? 'text-cyan-400 font-bold' : intakeStep === 3 || intakeStep === 'complete' ? 'text-emerald-400' : ''}>
                2. Frequency
              </span>
              <span>→</span>
              <span className={intakeStep === 3 ? 'text-cyan-400 font-bold' : intakeStep === 'complete' ? 'text-emerald-400' : ''}>
                3. Loss (LM)
              </span>
            </div>
            <button
              onClick={() => {
                setIntakeStep(1);
                setIntakeMessages([
                  {
                    id: 'reset-intake',
                    sender: 'assistant',
                    text: `Intake reset! Let's start with **Step 1: Clarify the Risk Scenario**.\n\nPlease identify:\n1. The specific **Asset** at risk\n2. The **Threat Community**\n3. The **Harm/Impact** (Confidentiality, Integrity, or Availability)`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    intakeStep: 1
                  }
                ]);
              }}
              className="text-[10px] text-zinc-400 hover:text-zinc-200 underline"
            >
              Reset Intake
            </button>
          </div>
        )}

        {/* Quick Suggestions / Starters */}
        <div className="px-4 py-2 bg-[#050505] border-b border-zinc-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar font-mono text-[10px]">
          {activeTab === 'intake'
            ? currentStarters.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(starter)}
                  className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-zinc-800 whitespace-nowrap transition-colors flex items-center space-x-1"
                >
                  <span>{starter}</span>
                </button>
              ))
            : [
                'Board Executive Summary',
                'P90 vs P99 Tail Exposure',
                'Calibrate Resistance Strength',
                'Evaluate Mitigation ROI'
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 whitespace-nowrap transition-colors"
                >
                  {p}
                </button>
              ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs custom-scrollbar">
          {currentMessages.map(msg => {
            const detectedJson = msg.sender === 'assistant' ? extractStakeholderJson(msg.text) : null;

            return (
              <div
                key={msg.id}
                className={`flex flex-col space-y-2.5 ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`flex items-start space-x-2.5 max-w-[90%] ${
                    msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}
                >
                  {msg.sender === 'assistant' ? (
                    <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`rounded-xl p-3.5 space-y-1.5 ${
                      msg.sender === 'user'
                        ? 'bg-zinc-800 text-white font-sans rounded-tr-none'
                        : 'bg-[#050505] text-zinc-200 border border-zinc-800 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pb-1">
                      <span className="font-bold uppercase tracking-wider">
                        {msg.sender === 'user' ? 'You' : 'Open FAIR AI Copilot'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs">
                      {msg.text}
                    </div>
                  </div>
                </div>

                {/* DETECTED STAKEHOLDER JSON ACTION CARD */}
                {detectedJson && onApplyScenario && (
                  <div className="w-full max-w-[90%] ml-8 p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-zinc-900 border border-cyan-500 shadow-xl shadow-cyan-950/30 space-y-3 font-mono animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-cyan-800/80 pb-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Ready for Monte Carlo Simulation
                        </span>
                      </div>
                      <span className="text-[10px] text-cyan-300 font-mono">
                        LEF & LM Calibrated
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-black/50 border border-zinc-800">
                        <div className="text-zinc-400">Frequency (LEF Mode)</div>
                        <div className="text-cyan-400 font-bold">
                          {detectedJson.lef.mode}/yr (Min: {detectedJson.lef.min}, Max: {detectedJson.lef.max})
                        </div>
                      </div>
                      <div className="p-2 rounded bg-black/50 border border-zinc-800">
                        <div className="text-zinc-400">Loss Magnitude (LM Mode)</div>
                        <div className="text-emerald-400 font-bold">
                          {formatAmount(detectedJson.lm.mode, scenario.currency, 1)}
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTON: APPLY TO DASHBOARD */}
                    <button
                      onClick={() => handleApplyFromMessage(detectedJson)}
                      className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md shadow-white/10"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Apply to Dashboard & Run Monte Carlo</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="flex items-center space-x-2 text-zinc-400 text-xs italic font-sans py-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Analyzing calibrations against Open FAIR distribution models...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-3.5 border-t border-zinc-800 bg-[#050505]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeTab === 'intake'
                  ? `Step ${intakeStep === 'complete' ? '3' : intakeStep}: Enter plain-language answers...`
                  : 'Ask about calibrations, board bullet points, or tail risk...'
              }
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-white font-sans focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="p-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
