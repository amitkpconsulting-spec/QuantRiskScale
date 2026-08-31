import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sliders,
  Sparkles,
  Play,
  FileText,
  BookOpen,
  Database,
  Shield,
  Layers,
  ArrowRight,
  Command,
  X
} from 'lucide-react';
import { FairScenario } from '../types/fair';
import { WorkspaceId } from './SidebarNav';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: FairScenario[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  onSelectWorkspace: (ws: WorkspaceId) => void;
  onRunSimulation: () => void;
  onOpenQuickTune: () => void;
  onOpenAiAdvisory: () => void;
  onOpenPdfModal: () => void;
  onOpenGlossaryModal: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onSelectWorkspace,
  onRunSimulation,
  onOpenQuickTune,
  onOpenAiAdvisory,
  onOpenPdfModal,
  onOpenGlossaryModal,
  isSidebarCollapsed,
  onToggleSidebar
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter actions & scenarios
  const staticActions = [
    {
      id: 'action-toggle-sidebar',
      title: isSidebarCollapsed ? 'Maximize Sidebar (Expand)' : 'Minimize Sidebar (Collapse)',
      subtitle: `Toggle left navigation panel [Shortcut: [ or Cmd+B]`,
      category: 'View',
      icon: Shield,
      action: () => {
        if (onToggleSidebar) onToggleSidebar();
        onClose();
      }
    },
    {
      id: 'action-run-sim',
      title: 'Run Monte Carlo Simulation',
      subtitle: 'Execute 10,000 statistical trials on active scenario',
      category: 'Simulate',
      icon: Play,
      action: () => {
        onRunSimulation();
        onClose();
      }
    },
    {
      id: 'action-tune',
      title: 'Tune Scenario Parameters',
      subtitle: 'Adjust TEF, VULN, PLM, and SLM in slide-out drawer',
      category: 'Model',
      icon: Sliders,
      action: () => {
        onOpenQuickTune();
        onClose();
      }
    },
    {
      id: 'action-ai',
      title: 'Open AI Risk Advisory',
      subtitle: 'Get quantitative calibrations and executive summaries',
      category: 'AI',
      icon: Sparkles,
      action: () => {
        onOpenAiAdvisory();
        onClose();
      }
    },
    {
      id: 'action-ws-cockpit',
      title: 'Go to Risk Cockpit',
      subtitle: 'Primary quantitative risk dashboard, LEC, and Iso-ALE heatmap',
      category: 'Navigate',
      icon: Shield,
      action: () => {
        onSelectWorkspace('cockpit');
        onClose();
      }
    },
    {
      id: 'action-ws-lab',
      title: 'Go to Scenario & Model Lab',
      subtitle: 'Full parametric distribution builder & asset registers',
      category: 'Navigate',
      icon: Layers,
      action: () => {
        onSelectWorkspace('lab');
        onClose();
      }
    },
    {
      id: 'action-ws-ai',
      title: 'Go to AI Threat & Defense Hub',
      subtitle: 'Explore AI threat registers and defense modeling',
      category: 'Navigate',
      icon: Sparkles,
      action: () => {
        onSelectWorkspace('ai-defense');
        onClose();
      }
    },
    {
      id: 'action-ws-sqlite',
      title: 'Go to SQLite Database & Snapshots',
      subtitle: 'Manage local database snapshots, schema, and queries',
      category: 'Navigate',
      icon: Database,
      action: () => {
        onSelectWorkspace('sqlite');
        onClose();
      }
    },
    {
      id: 'action-export-pdf',
      title: 'Export Executive PDF Report',
      subtitle: 'Generate board-level FAIR risk report with charts',
      category: 'Export',
      icon: FileText,
      action: () => {
        onOpenPdfModal();
        onClose();
      }
    },
    {
      id: 'action-glossary',
      title: 'Search Risk Lexicon & Glossary',
      subtitle: 'O-FAIR standard terminology, math formulas, and definitions',
      category: 'Reference',
      icon: BookOpen,
      action: () => {
        onOpenGlossaryModal();
        onClose();
      }
    }
  ];

  const scenarioActions = scenarios.map(s => ({
    id: `scenario-${s.id}`,
    title: s.name,
    subtitle: `${s.category} • Asset: ${s.assetName} • Threat: ${s.threatName}`,
    category: 'Scenarios',
    icon: Shield,
    isCurrent: s.id === activeScenarioId,
    action: () => {
      onSelectScenario(s.id);
      onClose();
    }
  }));

  const allItems = [
    ...staticActions.filter(a =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
    ),
    ...scenarioActions.filter(s =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase())
    )
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex items-start justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 font-sans">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-zinc-800 bg-[#050505] flex items-center space-x-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, scenario name, or action (e.g. 'simulate', 'tune', 'ransomware')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
          />
          <div className="flex items-center space-x-1.5 shrink-0">
            <kbd className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 font-bold">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 font-mono text-xs custom-scrollbar">
          {allItems.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-sans text-xs">
              No matching commands or risk scenarios found for "{query}".
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl transition-colors flex items-center justify-between space-x-3 ${
                    isSelected
                      ? 'bg-cyan-950/40 text-white border border-cyan-800/80 shadow-xs'
                      : 'hover:bg-zinc-900 text-zinc-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div
                      className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-white truncate font-sans">
                          {item.title}
                        </span>
                        {item.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-bold uppercase tracking-wider">
                            {item.category}
                          </span>
                        )}
                        {(item as any).isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-sans truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 text-zinc-500">
                    <span className="text-[10px] font-mono uppercase">Select</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-zinc-600'}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer with key hints */}
        <div className="px-4 py-2.5 bg-[#050505] border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px]">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px]">↵</kbd>
              <span>Execute</span>
            </span>
          </div>
          <div className="flex items-center space-x-1 text-zinc-500">
            <Command className="w-3 h-3" />
            <span>Open FAIR Quick Navigator</span>
          </div>
        </div>
      </div>
    </div>
  );
};
