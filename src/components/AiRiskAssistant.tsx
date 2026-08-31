import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Send,
  Copy,
  Check,
  ShieldCheck,
  Scale,
  FileText,
  Sliders,
  Terminal,
  Zap,
  Compass,
  AlertCircle,
  Eye,
  BarChart2
} from 'lucide-react';
import { LocalAiEndpointConfig, FairScenario, SimulationResult } from '../types/fair';
import { pingLocalAiEndpoint, executeFairAiAnalysis, AiResponseResult } from '../services/aiEndpointService';

interface AiRiskAssistantProps {
  scenario: FairScenario;
  simResult: SimulationResult | null;
  aiConfig: LocalAiEndpointConfig;
  onUpdateAiConfig: (updated: LocalAiEndpointConfig) => void;
}

export const AiRiskAssistant: React.FC<AiRiskAssistantProps> = ({
  scenario,
  simResult,
  aiConfig,
  onUpdateAiConfig
}) => {
  const [config, setConfig] = useState<LocalAiEndpointConfig>(aiConfig);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingStatus, setPingStatus] = useState<{ online?: boolean; message?: string; latency?: number } | null>(null);
  const [activePromptType, setActivePromptType] = useState<'bias_audit' | 'debias_calibration' | 'executive_summary' | 'control_evaluation' | 'custom_chat'>('bias_audit');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [responseResult, setResponseResult] = useState<AiResponseResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleTestConnection = async () => {
    setIsPinging(true);
    setPingStatus(null);
    try {
      const res = await pingLocalAiEndpoint(config.endpoint);
      if (res.online) {
        setPingStatus({ online: true, message: `Connected! Found ${res.models.length} local models.`, latency: res.latencyMs });
        const updated = {
          ...config,
          isConnected: true,
          latencyMs: res.latencyMs,
          availableModels: res.models.length > 0 ? res.models : config.availableModels
        };
        setConfig(updated);
        onUpdateAiConfig(updated);
      } else {
        setPingStatus({ online: false, message: `Unreachable: ${res.error || 'Check that Ollama/LM Studio is running on ' + config.endpoint}` });
        const updated = { ...config, isConnected: false };
        setConfig(updated);
        onUpdateAiConfig(updated);
      }
    } finally {
      setIsPinging(false);
    }
  };

  const handleGenerate = async (type = activePromptType) => {
    setIsGenerating(true);
    setResponseResult(null);
    try {
      const result = await executeFairAiAnalysis(config, {
        type,
        scenario,
        simResult: simResult || undefined,
        userCustomPrompt: customPrompt
      });
      setResponseResult(result);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!responseResult?.text) return;
    navigator.clipboard.writeText(responseResult.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5 font-mono">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-zinc-800 text-cyan-400 border border-zinc-700 uppercase tracking-widest">
              Local AI &amp; LLM Integration
            </span>
            <span className="text-xs text-zinc-400 font-mono uppercase">Ollama • LM Studio • LocalAI • Heuristic Rules</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-black text-white font-display uppercase tracking-tight">AI Local Endpoint &amp; Calibration Assistant</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Connect directly to an air-gapped local LLM server running on your host machine for automated SME debiasing, PERT calibration, and executive summaries.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center space-x-2 ${
            config.isConnected
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              : config.mode === 'heuristic_engine'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
          }`}>
            <Cpu className="w-4 h-4" />
            <span>
              {config.isConnected
                ? `Online (${config.latencyMs}ms)`
                : config.mode === 'heuristic_engine'
                ? 'Offline Heuristics Active'
                : 'Local Endpoint Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Endpoint Settings & Prompt Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Local AI Endpoint Settings */}
        <div className="lg:col-span-1 bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white font-display uppercase tracking-wider flex items-center space-x-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Endpoint Configuration</span>
          </h3>

          <div className="space-y-3.5 text-xs font-mono">
            {/* Mode selection */}
            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Intelligence Provider</label>
              <select
                value={config.mode}
                onChange={(e) => {
                  const mode = e.target.value as any;
                  const updated = { ...config, mode };
                  setConfig(updated);
                  onUpdateAiConfig(updated);
                }}
                className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none text-xs"
              >
                <option value="local_endpoint">Local AI Endpoint (Ollama / LM Studio / LocalAI)</option>
                <option value="heuristic_engine">Air-Gapped Offline Expert Rules (Zero Network)</option>
                <option value="gemini_cloud">Cloud Gemini Server Proxy (Optional)</option>
              </select>
            </div>

            {config.mode === 'local_endpoint' && (
              <>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Local Endpoint URL</label>
                  <input
                    type="text"
                    value={config.endpoint}
                    onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                    placeholder="http://localhost:11434/v1"
                    className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none text-xs"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block uppercase">Default Ollama: <code className="text-cyan-400 font-bold">http://localhost:11434/v1</code></span>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Model Name / Tag</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={config.model}
                      onChange={(e) => setConfig({ ...config, model: e.target.value })}
                      placeholder="llama3.2"
                      className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <button
                  onClick={handleTestConnection}
                  disabled={isPinging}
                  className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors active:scale-98 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? 'Pinging Local Server...' : 'Test Connection & Probe Models'}</span>
                </button>

                {pingStatus && (
                  <div className={`p-3 rounded-lg text-xs font-mono border uppercase tracking-wider ${
                    pingStatus.online
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                      : 'bg-red-950/30 border-red-800/60 text-red-300'
                  }`}>
                    {pingStatus.message}
                  </div>
                )}
              </>
            )}

            {config.mode === 'heuristic_engine' && (
              <div className="p-3.5 rounded-lg bg-[#050505] border border-zinc-800 text-emerald-300 text-xs space-y-1.5">
                <div className="font-bold flex items-center space-x-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Air-Gapped Heuristics</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                  Evaluates Beta-PERT variance, TEF dispersion, and Hubbard debiasing metrics natively in JavaScript without making any network requests.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pre-Engineered FAIR Prompts & Analysis Output */}
        <div className="lg:col-span-2 bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">Open FAIR Intelligence Prompts</h3>
              <span className="text-xs text-zinc-400 font-mono uppercase">Scenario: <strong className="text-cyan-400">{scenario.name}</strong></span>
            </div>

            {/* Prompt Selector Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <button
                onClick={() => {
                  setActivePromptType('bias_audit');
                  handleGenerate('bias_audit');
                }}
                disabled={isGenerating}
                className={`p-3 rounded-xl border text-left transition-all font-mono relative overflow-hidden group ${
                  activePromptType === 'bias_audit'
                    ? 'bg-zinc-800 border-cyan-400 text-white ring-1 ring-cyan-500/30'
                    : 'bg-[#050505] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                    BIAS AUDIT
                  </span>
                </div>
                <span className="font-black font-display text-xs block uppercase tracking-wider text-white">1. Audit Bias</span>
                <span className="text-[10px] text-zinc-400 mt-1 block leading-tight">Check optimistic / pessimistic frequency &amp; loss bias</span>
              </button>

              <button
                onClick={() => {
                  setActivePromptType('debias_calibration');
                  handleGenerate('debias_calibration');
                }}
                disabled={isGenerating}
                className={`p-3 rounded-xl border text-left transition-all font-mono ${
                  activePromptType === 'debias_calibration'
                    ? 'bg-zinc-800 border-cyan-500 text-white'
                    : 'bg-[#050505] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <Scale className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="font-black font-display text-xs block uppercase tracking-wider text-white">2. 90% CI Calibration</span>
                <span className="text-[10px] text-zinc-400 mt-1 block leading-tight">Debias overconfidence &amp; check PERT spreads</span>
              </button>

              <button
                onClick={() => {
                  setActivePromptType('executive_summary');
                  handleGenerate('executive_summary');
                }}
                disabled={isGenerating}
                className={`p-3 rounded-xl border text-left transition-all font-mono ${
                  activePromptType === 'executive_summary'
                    ? 'bg-zinc-800 border-cyan-500 text-white'
                    : 'bg-[#050505] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="font-black font-display text-xs block uppercase tracking-wider text-white">3. Board Summary</span>
                <span className="text-[10px] text-zinc-400 mt-1 block leading-tight">Summarize ALE, VaR90, and business risk</span>
              </button>

              <button
                onClick={() => {
                  setActivePromptType('control_evaluation');
                  handleGenerate('control_evaluation');
                }}
                disabled={isGenerating}
                className={`p-3 rounded-xl border text-left transition-all font-mono ${
                  activePromptType === 'control_evaluation'
                    ? 'bg-zinc-800 border-cyan-500 text-white'
                    : 'bg-[#050505] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="font-black font-display text-xs block uppercase tracking-wider text-white">4. Control ROI</span>
                <span className="text-[10px] text-zinc-400 mt-1 block leading-tight">Evaluate proposed RS mitigation ROI</span>
              </button>
            </div>

            {/* Quick Prompt Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
              <span className="text-zinc-500 uppercase tracking-wider text-[9px] mr-1">Quick Bias Prompts:</span>
              {[
                "Audit the current scenario's assumptions for bias",
                "Check for overly optimistic threat frequency distributions",
                "Audit Threat Capability vs Control Resistance strength",
                "Evaluate Beta-PERT mode skewness and 90% CI spreads"
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomPrompt(suggestion);
                    setActivePromptType('bias_audit');
                    handleGenerate('bias_audit');
                  }}
                  disabled={isGenerating}
                  className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all text-left truncate max-w-[280px]"
                  title={suggestion}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Custom Query Input */}
            <div className="flex space-x-2 font-mono">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ask custom FAIR question (e.g. 'Audit the current scenario's assumptions for bias')..."
                className="flex-1 bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (/bias|audit|optimis|pessimis|assumpt/i.test(customPrompt)) {
                      handleGenerate('bias_audit');
                    } else {
                      handleGenerate('custom_chat');
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  if (/bias|audit|optimis|pessimis|assumpt/i.test(customPrompt)) {
                    handleGenerate('bias_audit');
                  } else {
                    handleGenerate('custom_chat');
                  }
                }}
                disabled={isGenerating}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-black font-display text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all active:scale-98 shadow-md"
              >
                {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Ask AI</span>
              </button>
            </div>

            {/* Analysis Output Box */}
            <div className="bg-[#050505] border border-zinc-800 rounded-xl p-4 min-h-[220px] max-h-[360px] overflow-y-auto font-mono text-xs text-zinc-200 relative">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-zinc-400 space-y-2">
                  <Sparkles className="w-6 h-6 animate-spin text-cyan-400" />
                  <span className="uppercase tracking-wider">Analyzing scenario with {config.mode === 'heuristic_engine' ? 'local heuristic engine' : config.model}...</span>
                </div>
              ) : responseResult ? (
                <div className="space-y-2 whitespace-pre-wrap leading-relaxed">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800 pb-2 mb-2 uppercase tracking-wider">
                    <span>Source: <strong className="text-cyan-400">{responseResult.modelUsed}</strong> ({responseResult.latencyMs}ms)</span>
                    <button
                      onClick={handleCopyText}
                      className="flex items-center space-x-1 text-zinc-400 hover:text-white transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-zinc-200 leading-relaxed">{responseResult.text}</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-zinc-500 text-center font-mono">
                  <Cpu className="w-8 h-8 text-zinc-700 mb-2" />
                  <span className="uppercase tracking-wider text-xs">Click one of the prompt actions above or enter a custom query.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
