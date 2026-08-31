import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Brain,
  Cpu,
  Layers,
  FileText,
  Search,
  Filter,
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Database,
  ExternalLink,
  BookOpen,
  Code2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import {
  AONA_AI_RISK_REGISTER,
  OWASP_AGENTIC_THREATS,
  AonaRiskItem,
  OwaspAgenticThreat,
  convertAonaRiskToFairScenario,
  convertOwaspThreatToFairScenario
} from '../data/aiRiskData';
import { FairScenario } from '../types/fair';

interface AiRiskRegisterHubProps {
  onLoadScenario: (scenario: FairScenario) => void;
  onNavigateToBuilder?: () => void;
  activeScenarioId?: string;
}

export const AiRiskRegisterHub: React.FC<AiRiskRegisterHubProps> = ({
  onLoadScenario,
  onNavigateToBuilder,
  activeScenarioId
}) => {
  const [activeView, setActiveView] = useState<'aona' | 'owasp' | 'md-simulator' | 'playbooks'>('aona');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [expandedOwaspTid, setExpandedOwaspTid] = useState<string | null>('T1');

  // Markdown Simulator State
  const defaultMarkdownSample = `| Risk ID | Category | Risk description | Affected AI systems | Likelihood (1-5) | Impact (1-5) | Inherent score | Key controls | Control owner | Residual likelihood | Residual impact | Residual score | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AI-DL-01 | Data leakage | Employees paste customer records or confidential content into public chatbots. | Public chatbots (ChatGPT, Gemini, Claude) | 4 | 4 | 16 | DLP rules; enterprise AI workspace with zero-retention; data classification training | Head of Security Operations | 2 | 4 | 8 | Mitigating |
| AI-AG-01 | Agentic AI | Autonomous agent performs actions beyond intended scope: modifying records, deploying unverified code. | AI agents with write access to business systems | 3 | 5 | 15 | Least-privilege permission scoping; human approval gate; action logging; kill switch | CISO / Platform Owner | 2 | 5 | 10 | Mitigating |
| AI-MB-04 | Model behaviour | Malicious prompt injection hidden in emails/PDFs causes agent to exfiltrate data via tool calls. | AI assistants that read external content; RAG; browser agents | 4 | 4 | 16 | Input sanitisation; output filtering; least-privilege tool access; red-team testing | Head of Security Operations | 3 | 4 | 12 | Mitigating |
| AI-SA-01 | Shadow AI | Staff adopt unvetted AI tools without IT knowledge, bypassing data privacy and governance. | Unknown unsanctioned AI tools | 5 | 3 | 15 | Continuous AI usage discovery; fast approval pathway; sanctioned catalogue | CISO | 3 | 3 | 9 | Mitigating |
| AI-IP-03 | Intellectual property | AI coding assistant reproduces copyleft/GPL code into proprietary repo, creating licence contamination. | AI coding assistants (GitHub Copilot, Cursor) | 3 | 3 | 9 | Automated licence scanning in CI; assistant settings blocking verbatim code | Head of Engineering | 2 | 3 | 6 | Open |`;

  const [customMarkdownText, setCustomMarkdownText] = useState<string>(defaultMarkdownSample);
  const [simulatedParsedCount, setSimulatedParsedCount] = useState<number>(0);
  const [simulationStatusMsg, setSimulationStatusMsg] = useState<string | null>(null);

  // Filter Aona register
  const filteredAonaRisks = useMemo(() => {
    return AONA_AI_RISK_REGISTER.filter(risk => {
      const matchesSearch =
        risk.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.affectedAiSystems.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.keyControls.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.controlOwner.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || risk.category === selectedCategory;
      const matchesStat = selectedStatus === 'all' || risk.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStat;
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  // Filter OWASP Agentic Threats
  const filteredOwaspThreats = useMemo(() => {
    return OWASP_AGENTIC_THREATS.filter(threat => {
      const matchesSearch =
        threat.tid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.playbook.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

  // Categories list for Aona
  const aonaCategories = useMemo(() => {
    const cats = new Set(AONA_AI_RISK_REGISTER.map(r => r.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const handleSimulateAonaRisk = (risk: AonaRiskItem) => {
    const sc = convertAonaRiskToFairScenario(risk);
    onLoadScenario(sc);
    setSimulationStatusMsg(`Loaded & Simulated: ${sc.name}`);
    setTimeout(() => setSimulationStatusMsg(null), 4000);
  };

  const handleSimulateOwaspThreat = (threat: OwaspAgenticThreat) => {
    const sc = convertOwaspThreatToFairScenario(threat);
    onLoadScenario(sc);
    setSimulationStatusMsg(`Loaded & Simulated: ${sc.name}`);
    setTimeout(() => setSimulationStatusMsg(null), 4000);
  };

  // Parse custom Markdown table into Open FAIR scenarios
  const handleParseAndSimulateMarkdown = () => {
    const lines = customMarkdownText.split('\n').filter(l => l.trim().startsWith('|'));
    if (lines.length < 3) {
      setSimulationStatusMsg('Error: Please provide a valid Markdown table with a header and at least one data row.');
      setTimeout(() => setSimulationStatusMsg(null), 4000);
      return;
    }

    // Skip header and separator
    const dataRows = lines.slice(2);
    let convertedCount = 0;

    const parsedRisks: AonaRiskItem[] = [];

    dataRows.forEach((row, idx) => {
      const cells = row.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
      if (cells.length >= 5) {
        const id = cells[0] || `MD-AI-${idx + 1}`;
        const category = (cells[1] || 'Agentic AI') as any;
        const description = cells[2] || 'Custom parsed AI risk scenario';
        const affectedAiSystems = cells[3] || 'Enterprise AI Systems';
        const likelihood = parseInt(cells[4], 10) || 3;
        const impact = parseInt(cells[5], 10) || 4;
        const keyControls = cells[7] || 'Standard enterprise AI controls and monitoring';
        const controlOwner = cells[8] || 'AI Risk Officer';
        const residualLikelihood = parseInt(cells[9], 10) || Math.max(1, likelihood - 1);
        const residualImpact = parseInt(cells[10], 10) || impact;
        const status = (cells[12] || 'Mitigating') as any;

        const riskItem: AonaRiskItem = {
          id,
          category,
          description,
          affectedAiSystems,
          likelihood,
          impact,
          inherentScore: likelihood * impact,
          keyControls,
          controlOwner,
          residualLikelihood,
          residualImpact,
          residualScore: residualLikelihood * residualImpact,
          status: status === 'Open' || status === 'Mitigating' || status === 'Accepted' || status === 'Closed' ? status : 'Mitigating'
        };

        parsedRisks.push(riskItem);
      }
    });

    if (parsedRisks.length > 0) {
      // Load first scenario into engine
      const firstSc = convertAonaRiskToFairScenario(parsedRisks[0]);
      onLoadScenario(firstSc);
      setSimulatedParsedCount(parsedRisks.length);
      setSimulationStatusMsg(`Successfully parsed ${parsedRisks.length} AI risk scenarios from Markdown! Simulated active model: ${firstSc.name}`);
      setTimeout(() => setSimulationStatusMsg(null), 5000);
    } else {
      setSimulationStatusMsg('Could not parse valid rows. Please check table formatting.');
      setTimeout(() => setSimulationStatusMsg(null), 4000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / USP */}
      <div className="bg-gradient-to-r from-zinc-950 via-[#0a0f18] to-zinc-950 border border-cyan-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2 font-mono">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 uppercase tracking-widest flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Next-Gen Risk Quantification</span>
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-xs text-zinc-400 font-mono">Model Race &amp; Autonomous Agent Security</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-white font-display tracking-tight uppercase">
              AI Risk Register &amp; OWASP Agentic Threat Navigator
            </h2>
            <p className="text-xs text-zinc-300 font-mono mt-1 max-w-3xl leading-relaxed">
              Traditional cyber risks are shifting as enterprises adopt Generative AI, Tool-Chaining, Model Context Protocols (MCP), and Autonomous Multi-Agent Swarms.
              Quantify financial exposure using Open FAIR Beta-PERT Monte Carlo simulations directly from structured Markdown registers.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start lg:self-auto">
            <div className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-center font-mono">
              <div className="text-[10px] uppercase text-zinc-400 font-bold">Aona Risks</div>
              <div className="text-lg font-black text-cyan-400">30</div>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-center font-mono">
              <div className="text-[10px] uppercase text-zinc-400 font-bold">OWASP Threats</div>
              <div className="text-lg font-black text-purple-400">17 (T1-T17)</div>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-center font-mono">
              <div className="text-[10px] uppercase text-zinc-400 font-bold">Playbooks</div>
              <div className="text-lg font-black text-emerald-400">6</div>
            </div>
          </div>
        </div>

        {/* Live Status Toast Banner */}
        {simulationStatusMsg && (
          <div className="mt-4 p-3 bg-cyan-950/90 border border-cyan-500 rounded-lg text-cyan-200 text-xs font-mono flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>{simulationStatusMsg}</span>
            </div>
            <span className="text-[10px] uppercase bg-cyan-900/60 px-2 py-0.5 rounded text-cyan-300 font-bold">Monte Carlo Active</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center space-x-2 font-mono">
          <button
            onClick={() => setActiveView('aona')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
              activeView === 'aona'
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/50'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Aona AI Risk Register (30)</span>
          </button>

          <button
            onClick={() => setActiveView('owasp')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
              activeView === 'owasp'
                ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-md shadow-purple-950/50'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>OWASP Agentic Threats (T1-T17)</span>
          </button>

          <button
            onClick={() => setActiveView('md-simulator')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
              activeView === 'md-simulator'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Markdown Simulator &amp; Importer</span>
          </button>

          <button
            onClick={() => setActiveView('playbooks')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
              activeView === 'playbooks'
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-md shadow-amber-950/50'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mitigation Playbooks (6)</span>
          </button>
        </div>

        {/* Global Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search risks, systems, controls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs font-mono rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-3" />
        </div>
      </div>

      {/* VIEW 1: AONA AI RISK REGISTER */}
      {activeView === 'aona' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#09090b] border border-zinc-800 rounded-lg p-3 text-xs font-mono">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <span className="text-zinc-400 font-bold uppercase flex items-center space-x-1">
                <Filter className="w-3 h-3 text-cyan-400" />
                <span>Category:</span>
              </span>
              {aonaCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-zinc-400 font-bold uppercase">Status:</span>
              {['all', 'Mitigating', 'Open', 'Accepted'].map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                    selectedStatus === st
                      ? 'bg-zinc-800 text-white border border-zinc-600'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#09090b] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900/90 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-3">Risk ID</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-4 min-w-[280px]">Risk Description</th>
                    <th className="py-3 px-3 min-w-[180px]">Affected AI Systems</th>
                    <th className="py-3 px-2 text-center">Inherent (L×I)</th>
                    <th className="py-3 px-4 min-w-[240px]">Key Controls &amp; Owner</th>
                    <th className="py-3 px-2 text-center">Residual (L×I)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">FAIR Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredAonaRisks.map(risk => {
                    const isInherentHigh = risk.inherentScore >= 15;
                    const isInherentMed = risk.inherentScore >= 6 && risk.inherentScore < 15;
                    const isResHigh = risk.residualScore >= 15;
                    const isResMed = risk.residualScore >= 6 && risk.residualScore < 15;

                    return (
                      <tr key={risk.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-cyan-400 whitespace-nowrap">
                          {risk.id}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-300 border border-zinc-800">
                            {risk.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-200 leading-relaxed font-sans text-xs">
                          {risk.description}
                          {risk.owaspMapping && (
                            <div className="mt-1 flex items-center space-x-1 font-mono text-[10px] text-purple-400">
                              <span>OWASP ASI:</span>
                              {risk.owaspMapping.map(m => (
                                <span key={m} className="px-1 py-0.2 rounded bg-purple-950/60 border border-purple-800/40 font-bold">
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-zinc-300 text-[11px]">
                          {risk.affectedAiSystems}
                        </td>
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              isInherentHigh
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-600/60'
                                : isInherentMed
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-600/60'
                                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60'
                            }`}
                            title={`Likelihood: ${risk.likelihood} × Impact: ${risk.impact}`}
                          >
                            {risk.inherentScore} <span className="text-[10px] opacity-75">({risk.likelihood}×{risk.impact})</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-300 text-[11px] leading-relaxed">
                          <div className="font-sans text-xs text-zinc-200">{risk.keyControls}</div>
                          <div className="mt-1 text-[10px] text-cyan-400 font-mono font-bold">Owner: {risk.controlOwner}</div>
                        </td>
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              isResHigh
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-600/60'
                                : isResMed
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-600/60'
                                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60'
                            }`}
                            title={`Residual Likelihood: ${risk.residualLikelihood} × Residual Impact: ${risk.residualImpact}`}
                          >
                            {risk.residualScore} <span className="text-[10px] opacity-75">({risk.residualLikelihood}×{risk.residualImpact})</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              risk.status === 'Mitigating'
                                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                                : risk.status === 'Open'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {risk.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleSimulateAonaRisk(risk)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/70 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ml-auto transition-all shadow-sm active:scale-98"
                            title="Convert qualitative risk to Open FAIR Beta-PERT distributions and simulate"
                          >
                            <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                            <span>Simulate FAIR</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: OWASP AGENTIC THREATS (ASI V1.1) */}
      {activeView === 'owasp' && (
        <div className="space-y-4">
          <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs text-zinc-400">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span className="text-zinc-200 font-bold uppercase">OWASP Top 10 for LLM Apps &amp; Gen AI — Agentic Security Initiative (ASI v1.1)</span>
            </div>
            <div className="text-[11px] text-zinc-400">
              17 Distinct Threat IDs (T1 to T17) covering Single-Agent, Multi-Agent, MCP Protocols &amp; Memory Poisoning.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredOwaspThreats.map(threat => {
              const isExpanded = expandedOwaspTid === threat.tid;
              return (
                <div
                  key={threat.tid}
                  className="bg-[#09090b] border border-zinc-800 hover:border-purple-500/40 rounded-xl p-5 shadow-xl transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-600/50 flex items-center justify-center font-mono font-black text-purple-300 text-sm shadow-md shrink-0">
                        {threat.tid}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-display font-black text-white text-base tracking-tight uppercase">
                            {threat.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-purple-400 border border-zinc-700">
                            {threat.playbook.split(':')[0]}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 font-sans mt-1 leading-relaxed max-w-4xl">
                          {threat.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start md:self-auto font-mono shrink-0">
                      <button
                        onClick={() => handleSimulateOwaspThreat(threat)}
                        className="px-3.5 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/60 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm active:scale-98"
                        title="Simulate this Agentic Threat in the Open FAIR Quantitative Engine"
                      >
                        <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                        <span>Quantify in FAIR</span>
                      </button>

                      <button
                        onClick={() => setExpandedOwaspTid(isExpanded ? null : threat.tid)}
                        className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                        title="Toggle Incident Case Studies and Mitigations"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Section with Real-World Scenarios and Mitigations */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs animate-fadeIn">
                      {/* Real World Attack Scenarios */}
                      <div className="bg-zinc-950/70 border border-zinc-800 rounded-lg p-4 space-y-2.5">
                        <div className="flex items-center space-x-1.5 text-amber-400 font-bold uppercase text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Documented Attack Scenarios (ASI v1.1)</span>
                        </div>
                        {threat.realWorldScenarios.map((sc, idx) => (
                          <div key={idx} className="bg-zinc-900/60 border border-zinc-800/80 rounded p-2.5">
                            <div className="font-bold text-white text-xs font-sans">{sc.title}</div>
                            <div className="text-zinc-400 text-[11px] font-sans mt-0.5 leading-relaxed">{sc.description}</div>
                          </div>
                        ))}
                      </div>

                      {/* Mitigations & Mappings */}
                      <div className="bg-zinc-950/70 border border-zinc-800 rounded-lg p-4 space-y-2.5">
                        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Prescribed Mitigations &amp; Framework Mappings</span>
                        </div>
                        <ul className="space-y-1.5 list-disc list-inside text-zinc-300 font-sans text-xs">
                          {threat.mitigations.map((m, idx) => (
                            <li key={idx} className="leading-relaxed">{m}</li>
                          ))}
                        </ul>

                        <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center gap-2 text-[10px]">
                          {threat.mitreAtlasMapping && (
                            <span className="px-2 py-0.5 rounded bg-zinc-900 text-cyan-400 border border-zinc-700">
                              MITRE ATLAS: {threat.mitreAtlasMapping}
                            </span>
                          )}
                          {threat.llmTop10Mapping && (
                            <span className="px-2 py-0.5 rounded bg-zinc-900 text-purple-400 border border-zinc-700">
                              {threat.llmTop10Mapping}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: MARKDOWN SIMULATOR & IMPORTER */}
      {activeView === 'md-simulator' && (
        <div className="space-y-4">
          <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-black text-white text-lg tracking-tight uppercase flex items-center space-x-2">
                  <Code2 className="w-5 h-5 text-emerald-400" />
                  <span>Markdown Risk Register Parser &amp; FAIR Simulator</span>
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Paste any Markdown risk register table or threat document (Aona format, OWASP table, or internal register).
                  The engine will automatically parse Likelihood, Impact, Affected Systems, and Controls, converting them into Beta-PERT Monte Carlo parameters.
                </p>
              </div>

              <div className="flex items-center space-x-2 font-mono">
                <button
                  onClick={() => setCustomMarkdownText(defaultMarkdownSample)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold uppercase transition-colors"
                >
                  Load Sample MD
                </button>
                <button
                  onClick={handleParseAndSimulateMarkdown}
                  className="px-4 py-2 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/70 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md active:scale-98"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span>Parse &amp; Run Monte Carlo</span>
                </button>
              </div>
            </div>

            {/* Markdown Textarea */}
            <div className="relative">
              <textarea
                value={customMarkdownText}
                onChange={(e) => setCustomMarkdownText(e.target.value)}
                rows={12}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-emerald-300/90 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-y selection:bg-emerald-900 selection:text-white"
                placeholder="| Risk ID | Category | Risk description | Affected AI systems | Likelihood (1-5) | Impact (1-5) | ..."
              />
              <button
                onClick={() => copyToClipboard(customMarkdownText, 'custom-md')}
                className="absolute top-3 right-3 p-1.5 rounded bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700 text-xs"
                title="Copy Markdown to Clipboard"
              >
                {copiedIndex === 'custom-md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Parsing Guide Note */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-400 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-zinc-300 uppercase">Automated FAIR Mapping Formula:</span>
                <span className="ml-1">
                  Likelihood 1-5 maps to Threat Event Frequency (0.1 to 24/yr). Impact 1-5 maps to Primary &amp; Secondary Loss ($25k to $5M+).
                  Residual Likelihood &amp; Impact automatically establish the What-If proposed branch with calculated control ROI.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: MITIGATION PLAYBOOKS */}
      {activeView === 'playbooks' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'pb-1',
                num: '01',
                title: 'Preventing Reasoning Manipulation',
                threats: 'Intent Breaking (T6), Repudiation (T8), Deceptive Behaviors (T7)',
                color: 'cyan',
                proactive: 'Restrict tool access, apply agent behavior profiling, enforce prompt control/data separation',
                reactive: 'Goal consistency validation, detect behavioral drift loops, rate-limit goal revisions',
                detective: 'Cryptographic immutable decision logging, audit human overrides, monitor high-risk reversals'
              },
              {
                id: 'pb-2',
                num: '02',
                title: 'Preventing Memory Poisoning & Drift',
                threats: 'Memory Poisoning (T1), Cascading Hallucinations (T5)',
                color: 'purple',
                proactive: 'Automated candidate memory scanning, session memory isolation, pre-commit truth-checking',
                reactive: 'Anomaly detection on memory logs, automated snapshot rollback, rate-limit memory modifications',
                detective: 'Knowledge lineage tracking, memory version control, drift re-evaluation against fixed ground-truth'
              },
              {
                id: 'pb-3',
                num: '03',
                title: 'Securing Tool Execution & Supply Chains',
                threats: 'Tool Misuse (T2), Privilege Escalation (T3), Unexpected RCE (T11), Resource DoS (T4), MCP Abuse (T16), Supply Chain (T17)',
                color: 'emerald',
                proactive: 'MicroVM execution sandboxes (gVisor), signed AIBOMs/Agent-Cards, AST-based static command checks',
                reactive: 'Enforce user confirmation for financial/code tools, flag tool execution loops, circuit breakers',
                detective: 'Forensic tool trace logging, track cumulative multi-agent token quotas, red-team simulated supply attacks'
              },
              {
                id: 'pb-4',
                num: '04',
                title: 'Strengthening Identity & Non-Human Auth',
                threats: 'Privilege Compromise (T3), Identity Spoofing (T9), MCP Abuse (T16)',
                color: 'rose',
                proactive: 'Cryptographic identity verification, ephemeral short-lived tokens, granular RBAC/ABAC per agent',
                reactive: 'AI-driven behavioral profiling on role changes, two-agent validation for auth changes, JIT credentials',
                detective: 'Identity deviation monitoring, flag cross-agent privilege delegation, correlate auth logs with historical baselines'
              },
              {
                id: 'pb-5',
                num: '05',
                title: 'Protecting Human-in-the-Loop (HITL)',
                threats: 'Overwhelming HITL (T10), Human Manipulation (T15)',
                color: 'amber',
                proactive: 'Risk-based trust scoring queue prioritization, automated low-risk approvals, rate-limit alert notifications',
                reactive: 'Mechanistic explainability summaries for reviewers, dual-agent verification for high-risk goals',
                detective: 'Monitor reviewer rubber-stamping patterns, detect decision fatigue anomalies, log human override telemetry'
              },
              {
                id: 'pb-6',
                num: '06',
                title: 'Securing Multi-Agent Swarms & Protocols',
                threats: 'Agent Communication Poisoning (T12), Human Attacks on MAS (T14), Rogue Agents (T13)',
                color: 'blue',
                proactive: 'End-to-end mTLS message encryption, distributed multi-agent consensus quorum, network topology isolation',
                reactive: 'Automated quarantine kill-switch for anomalous agents, revoke compromised agent tokens, halt delegation loops',
                detective: 'Inter-agent communication anomaly detection, monitor trust-score sudden drops, track cross-agent approval discrepancies'
              }
            ].map(pb => (
              <div key={pb.id} className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-3 font-mono text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-zinc-900 text-zinc-300 border border-zinc-800">
                      PLAYBOOK {pb.num}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold">OWASP ASI v1.1</span>
                  </div>
                  <h4 className="font-display font-black text-white text-sm uppercase tracking-tight">
                    {pb.title}
                  </h4>
                  <div className="text-[10px] text-purple-400 mt-1 font-sans">
                    <span className="font-bold">Threats:</span> {pb.threats}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-zinc-800/80 font-sans text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-cyan-400 font-mono block">🛡 Proactive Controls:</span>
                    <span className="text-zinc-300 text-[11px] leading-relaxed">{pb.proactive}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-400 font-mono block">🚨 Reactive Defense:</span>
                    <span className="text-zinc-300 text-[11px] leading-relaxed">{pb.reactive}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-400 font-mono block">🕵 Detective Auditing:</span>
                    <span className="text-zinc-300 text-[11px] leading-relaxed">{pb.detective}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
