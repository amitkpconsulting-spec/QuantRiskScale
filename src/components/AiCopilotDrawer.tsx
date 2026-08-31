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
  Minimize2,
  Maximize2
} from 'lucide-react';
import { FairScenario, SimulationResult, LocalAiEndpointConfig } from '../types/fair';
import { formatAmount } from '../utils/distributions';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: FairScenario;
  simResult: SimulationResult | null;
  aiConfig: LocalAiEndpointConfig;
  onUpdateAiConfig: (cfg: LocalAiEndpointConfig) => void;
  onNavigateToBuilder?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  scenario,
  simResult,
  aiConfig,
  onUpdateAiConfig,
  onNavigateToBuilder
}) => {
  if (!isOpen) return null;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your Open FAIR Quantitative Risk Advisor. I'm actively analyzing **${scenario.name}**. How can I assist you with threat calibrations, loss magnitudes, or executive board framing?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = (textToSend = input) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      let reply = '';
      const lower = textToSend.toLowerCase();

      if (lower.includes('board') || lower.includes('executive') || lower.includes('summary')) {
        const ale = simResult ? formatAmount(simResult.currentStats.mean, scenario.currency, scenario.unitScale) : 'calculated ALE';
        const p90 = simResult ? formatAmount(simResult.currentStats.p90, scenario.currency, scenario.unitScale) : 'P90 exposure';
        reply = `### Executive Summary for Board Presentation\n\n• **Annualized Risk Exposure**: Expected Loss of **${ale}/year** with a 1-in-10 year catastrophic tail event (P90) reaching **${p90}**.\n• **Primary Driver**: ${scenario.threatGroup} exploiting vulnerability in ${scenario.assetName}.\n• **Recommended Decision**: Allocate mitigation budget up to proposed controls to reduce exposure by up to ${simResult?.riskReductionPct || 45}% with a positive ROI.`;
      } else if (lower.includes('calibrate') || lower.includes('parameter') || lower.includes('tef') || lower.includes('pert')) {
        reply = `### Calibrated Parameter Guidance\n\n• **Current TEF**: Min ${scenario.tef.min} / Mode ${scenario.tef.mode} / Max ${scenario.tef.max} per year.\n• **Vulnerability**: ${(scenario.vuln.mode * 100).toFixed(0)}% exploit likelihood per attempt.\n• **Tip**: For high-confidence calibration, keep the ratio of Max to Min within 1 order of magnitude unless historical volatility justifies a wider heavy tail.`;
      } else if (lower.includes('reduction') || lower.includes('roi') || lower.includes('proposed')) {
        reply = `### Mitigation ROI Analysis\n\n${
          simResult?.riskReductionPct
            ? `• The proposed control posture reduces Annualized Loss Exposure by **${simResult.riskReductionPct}%**.\n• Mitigated Mean ALE drops to **${formatAmount(simResult.proposedStats?.mean || 0, scenario.currency, scenario.unitScale)}/year**.\n• Any security investment under this savings threshold yields positive cyber risk reduction ROI.`
            : `• Proposed controls are currently not enabled in this scenario. Enable "Proposed Mitigated State" in the Quick Tune drawer to see the delta.`
        }`;
      } else {
        reply = `Based on the Open FAIR standard for **${scenario.name}**:\n\n• **Loss Event Frequency (LEF)**: ${simResult ? simResult.currentLefStats.mean.toFixed(2) : scenario.tef.mode} events/yr.\n• **Loss Magnitude (LM)**: Mode direct loss is ${formatAmount(scenario.primaryLoss.mode, scenario.currency, scenario.unitScale)}.\n• **Standard Reference**: Aligned with ISO/IEC 27005 and NIST CSF risk quantification frameworks.`;
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsThinking(false);
    }, 600);
  };

  const quickPrompts = [
    'Generate Board 1-Pager Summary',
    'Evaluate Tail Risk (P90 vs P99)',
    'Suggest Parametric Calibrations'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-[#09090b] border-l border-zinc-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#050505]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Open FAIR AI Advisory
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono truncate max-w-xs">
                Context: {scenario.name.split(':')[0]}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2.5 bg-[#050505]/80 border-b border-zinc-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar font-mono text-[10px]">
          {quickPrompts.map((p, idx) => (
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
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3.5 space-y-1.5 ${
                  msg.sender === 'user'
                    ? 'bg-zinc-800 text-white font-sans rounded-tr-none'
                    : 'bg-[#050505] text-zinc-200 border border-zinc-800 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pb-1">
                  <span className="font-bold uppercase tracking-wider">
                    {msg.sender === 'user' ? 'You' : 'FAIR AI Advisory'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs">
                  {msg.text}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center space-x-2 text-zinc-400 text-xs italic font-sans py-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Analyzing scenario distribution metrics...</span>
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
              placeholder="Ask about calibrations, board bullet points, or tail risk..."
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
