import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Sliders,
  Sparkles,
  FileText,
  Plus,
  MoreVertical,
  BookOpen,
  Database,
  Search,
  ChevronDown,
  Shield,
  RotateCcw,
  Command,
  PanelLeftClose,
  PanelLeftOpen,
  Bot
} from 'lucide-react';
import { FairScenario, SimulationResult } from '../types/fair';
import { ThemeToggle } from './ThemeToggle';
import { formatAmount } from '../utils/distributions';

interface UnifiedTopBarProps {
  scenarios: FairScenario[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
  activeResult: SimulationResult | null;
  onOpenQuickTune: () => void;
  onOpenAiCopilot: () => void;
  onOpenPdfModal: () => void;
  onOpenNewSimulationModal: () => void;
  onOpenGlossaryModal: () => void;
  onOpenSqlite: () => void;
  onOpenCommandPalette?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const UnifiedTopBar: React.FC<UnifiedTopBarProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onRunSimulation,
  isSimulating,
  activeResult,
  onOpenQuickTune,
  onOpenAiCopilot,
  onOpenPdfModal,
  onOpenNewSimulationModal,
  onOpenGlossaryModal,
  onOpenSqlite,
  onOpenCommandPalette,
  isSidebarCollapsed,
  onToggleSidebar
}) => {
  const [showScenarioDropdown, setShowScenarioDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowScenarioDropdown(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredScenarios = scenarios.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.assetName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#070709] px-4 lg:px-6 flex items-center justify-between z-20">
      {/* Left: Scenario Selector */}
      <div className="flex items-center space-x-3 max-w-md lg:max-w-xl flex-1 relative" ref={dropdownRef}>
        <button
          onClick={() => setShowScenarioDropdown(!showScenarioDropdown)}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 transition-colors text-left max-w-full"
        >
          <div className="p-1 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-400 shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="truncate flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
                {activeScenario.category}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                {activeScenario.simulationsCount.toLocaleString()} Trials
              </span>
            </div>
            <div className="font-semibold text-xs text-white truncate font-sans">
              {activeScenario.name}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${showScenarioDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {showScenarioDropdown && (
          <div className="absolute top-full left-0 mt-2 w-96 max-w-[90vw] bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="p-2.5 border-b border-zinc-800 bg-[#050505] flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search scenarios, assets, or threats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
                autoFocus
              />
            </div>

            {/* Scenarios List */}
            <div className="max-h-72 overflow-y-auto p-1.5 space-y-1 font-mono text-xs custom-scrollbar">
              {filteredScenarios.map(s => {
                const isCurrent = s.id === activeScenario.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectScenario(s.id);
                      setShowScenarioDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-start justify-between space-x-2 ${
                      isCurrent
                        ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/80'
                        : 'hover:bg-zinc-800/70 text-zinc-300'
                    }`}
                  >
                    <div className="truncate flex-1">
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        {s.category}
                      </div>
                      <div className="font-semibold text-xs text-white truncate font-sans">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                        Asset: {s.assetName} • Threat: {s.threatGroup}
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-900 text-cyan-200 border border-cyan-700">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dropdown Bottom Action */}
            <div className="p-2 border-t border-zinc-800 bg-[#050505] flex items-center justify-between">
              <button
                onClick={() => {
                  setShowScenarioDropdown(false);
                  onOpenNewSimulationModal();
                }}
                className="w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Custom Scenario</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Center/Right: Quick Search Command Palette & Actions */}
      <div className="flex items-center space-x-2 lg:space-x-3">
        {/* Command Palette Trigger */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono transition-colors"
            title="Command Palette (Ctrl + K / Cmd + K)"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 font-sans text-xs">Search actions...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-[10px] font-bold text-zinc-300">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Quick Parameter Tuning */}
        <button
          onClick={onOpenQuickTune}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-mono font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500"
          title="Quick Tune Parameters"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tune Model</span>
        </button>

        {/* Stakeholder Guided Intake */}
        <button
          onClick={onOpenNewSimulationModal}
          className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/80 text-xs font-mono font-semibold transition-colors shadow-sm"
          title="Open FAIR™ 3-Step Stakeholder Guided Intake (Non-Math)"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Guided Intake</span>
        </button>

        {/* AI Advisory Drawer */}
        <button
          onClick={onOpenAiCopilot}
          className="hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-mono font-semibold transition-colors"
          title="AI Risk Advisory"
        >
          <Bot className="w-3.5 h-3.5 text-zinc-400" />
          <span>AI Advisory</span>
        </button>

        {/* PDF Export */}
        <button
          onClick={onOpenPdfModal}
          className="hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-mono font-semibold transition-colors"
          title="Executive PDF Report"
        >
          <FileText className="w-3.5 h-3.5 text-zinc-400" />
          <span>PDF Report</span>
        </button>

        {/* PRIMARY GOLDEN PATH BUTTON: Run Simulation (Squint Test Champion) */}
        <button
          onClick={onRunSimulation}
          disabled={isSimulating}
          className="px-4 lg:px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold font-mono text-xs uppercase tracking-wider shadow-lg flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 fill-black ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Contextual More (···) Menu */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            title="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenNewSimulationModal();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-left"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>New Simulation</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenSqlite();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-left"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>SQLite Snapshots</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenGlossaryModal();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-left"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>FAIR Risk Lexicon</span>
              </button>

              <div className="border-t border-zinc-800 my-1"></div>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenPdfModal();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-left"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Export PDF Summary</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
