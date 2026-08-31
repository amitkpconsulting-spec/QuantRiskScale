import React from 'react';
import {
  ShieldCheck,
  Database,
  Cpu,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Settings2,
  HardDriveDownload,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Server,
  FileText,
  Plus,
  BookOpen,
  Grid
} from 'lucide-react';
import { FairScenario, LocalAiEndpointConfig } from '../types/fair';
import { ThemeToggle } from './ThemeToggle';


interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  scenarios: FairScenario[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
  aiConfig: LocalAiEndpointConfig;
  onOpenAiModal: () => void;
  onOpenSqliteModal: () => void;
  onOpenPdfModal: () => void;
  onOpenNewSimulationModal: () => void;
  onOpenGlossaryModal: (term?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onRunSimulation,
  isSimulating,
  aiConfig,
  onOpenAiModal,
  onOpenSqliteModal,
  onOpenPdfModal,
  onOpenNewSimulationModal,
  onOpenGlossaryModal
}) => {
  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  return (
    <header className="border-b border-zinc-800/80 bg-[#09090b]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner: Air Gapped & System Status */}
      <div className="bg-[#050505] px-4 py-2 border-b border-zinc-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/30 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Air-Gapped / Offline</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded border border-cyan-500/40 bg-cyan-950/30 text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
            <Database className="w-3.5 h-3.5" />
            <span>SQLite Engine</span>
          </div>
          <button
            onClick={() => onOpenGlossaryModal()}
            className="hidden sm:flex items-center space-x-1 text-zinc-400 hover:text-cyan-300 transition-colors font-semibold tracking-wider uppercase text-[10px]"
            title="Open Interactive Open FAIR Terminology & Math Glossary"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open FAIR Standard (O-FAIR Lexicon)</span>
          </button>
        </div>

        <div className="flex items-center space-x-3 font-mono">
          {/* Glossary Quick Lookup Button */}
          <button
            onClick={() => onOpenGlossaryModal()}
            className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 border border-zinc-700 text-[11px] font-bold uppercase tracking-wider transition-colors"
            title="Search Open FAIR Acronyms, Definitions, and Math Formulas"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Glossary / Lexicon</span>
          </button>

          {/* Local AI Status */}
          <button
            onClick={onOpenAiModal}
            className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wider transition-all ${
              aiConfig.isConnected
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/40'
                : aiConfig.mode === 'heuristic_engine'
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-400 hover:bg-amber-900/40'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Configure Local AI Endpoint (Ollama, LM Studio, etc.)"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>
              {aiConfig.isConnected
                ? `AI: ${aiConfig.model}`
                : aiConfig.mode === 'heuristic_engine'
                ? 'AI: Offline Heuristics'
                : 'AI: Local Endpoint'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${aiConfig.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          </button>

          {/* SQLite DB Manager Button */}
          <button
            onClick={onOpenSqliteModal}
            className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-[11px] font-bold uppercase tracking-wider transition-colors"
            title="Manage SQLite Database & Export/Import .sqlite files"
          >
            <HardDriveDownload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Portable DB</span>
          </button>

          {/* Theme Toggle (Deep Space / Report Light Mode) */}
          <ThemeToggle />
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="px-4 lg:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Scenario Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-950/30 text-cyan-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-display font-black text-white text-lg tracking-tight uppercase">QUANTRISKSCALE</h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-cyan-400 border border-zinc-700 font-mono font-bold">v2.5</span>
              </div>
              <p className="text-xs text-zinc-400 font-mono font-medium tracking-tight">Quantitative Risk & Monte Carlo Modeling</p>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-zinc-800 hidden md:block"></div>

          {/* Scenario Selector Dropdown & Quick Industry Pills */}
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center">
              <select
                value={activeScenarioId}
                onChange={(e) => onSelectScenario(e.target.value)}
                className="bg-zinc-900 text-zinc-100 text-xs font-mono font-semibold rounded-lg border border-zinc-700 px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors max-w-[220px] sm:max-w-[280px] lg:max-w-[320px] truncate uppercase tracking-tight"
              >
                {scenarios.map(sc => (
                  <option key={sc.id} value={sc.id} className="bg-zinc-950 text-zinc-100 font-mono">
                    {sc.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 pointer-events-none text-zinc-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            {/* Add New Simulation Quick Button */}
            <button
              onClick={onOpenNewSimulationModal}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/70 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-98"
              title="Add New Simulation Scenario (Open FAIR Model)"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">New Simulation</span>
            </button>

            {/* Quick Sector Tags */}
            <div className="hidden xl:flex items-center space-x-1.5 font-mono">
              {[
                { id: 'scenario-bank-wire-fraud-ransomware', label: 'Bank', prefix: 'Bank' },
                { id: 'scenario-trade-algo-execution-ddos', label: 'Trade', prefix: 'Trade' },
                { id: 'scenario-retail-pos-magecart-breach', label: 'Retail', prefix: 'Retail' },
                { id: 'scenario-ai-weights-exfiltration-poisoning', label: 'AI Co', prefix: 'AI' }
              ].map(preset => {
                const isSelected = activeScenarioId === preset.id || (activeScenario?.name.toLowerCase().includes(preset.prefix.toLowerCase()));
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      const matched = scenarios.find(s => s.id === preset.id) || scenarios.find(s => s.name.toLowerCase().includes(preset.prefix.toLowerCase()));
                      if (matched) onSelectScenario(matched.id);
                    }}
                    className={`px-2.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all border ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-950/50'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onRunSimulation}
            disabled={isSimulating}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
              isSimulating
                ? 'bg-cyan-900 text-cyan-200 cursor-wait border border-cyan-700'
                : 'bg-white hover:bg-zinc-200 text-black border border-white font-extrabold shadow-cyan-950/30 hover:scale-[1.02] active:scale-98'
            }`}
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-cyan-200" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black text-black" />
                <span>Run Monte Carlo</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenPdfModal}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 border border-zinc-700 hover:border-cyan-500/50 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98"
            title="Export Professional PDF Summary Report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-display font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">AI Risk Assistant</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 lg:px-6 flex items-center space-x-1 overflow-x-auto no-scrollbar border-t border-zinc-800/80 bg-[#070708]">
        {[
          { id: 'dashboard', label: 'Risk Dashboard', icon: Layers },
          { id: 'heatmap', label: 'Risk Heatmap', icon: Grid, highlight: true },
          { id: 'builder', label: 'FAIR Scenario Builder', icon: Settings2 },
          { id: 'ai-register', label: 'AI Risks & MD Simulator', icon: Sparkles, highlight: true },
          { id: 'comparative', label: 'What-If Comparative', icon: RotateCcw },
          { id: 'lec', label: 'Loss Exceedance Curve', icon: FileSpreadsheet },
          { id: 'tree', label: 'FAIR Ontology Tree', icon: Layers },
          { id: 'registers', label: 'Asset & Threat Register', icon: Server },
          { id: 'sqlite', label: 'SQLite Database', icon: Database },
          { id: 'ai', label: 'Local AI Endpoint', icon: Cpu }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap font-display ${
                isActive
                  ? 'border-white text-white bg-zinc-900/60'
                  : tab.highlight
                  ? 'border-transparent text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/40 bg-cyan-950/20'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.highlight ? 'text-cyan-400' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>
              {tab.highlight && !isActive && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  NEW
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
