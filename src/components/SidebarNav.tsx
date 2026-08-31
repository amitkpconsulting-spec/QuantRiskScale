import React from 'react';
import {
  Layers,
  FlaskConical,
  ShieldAlert,
  Database,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Activity,
  Sliders,
  FileText
} from 'lucide-react';
import { FairScenario, SimulationResult } from '../types/fair';
import { formatAmount } from '../utils/distributions';
import { useTheme } from '../context/ThemeContext';

export type WorkspaceId = 'cockpit' | 'lab' | 'ai-defense' | 'sqlite';

interface SidebarNavProps {
  activeWorkspace: WorkspaceId;
  onSelectWorkspace: (workspace: WorkspaceId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeScenario: FairScenario;
  activeResult: SimulationResult | null;
  onOpenQuickTune: () => void;
  onOpenAiCopilot: () => void;
  onOpenGlossary: () => void;
  onOpenPdfModal: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeWorkspace,
  onSelectWorkspace,
  isCollapsed,
  onToggleCollapse,
  activeScenario,
  activeResult,
  onOpenQuickTune,
  onOpenAiCopilot,
  onOpenGlossary,
  onOpenPdfModal
}) => {
  const { isReportLight } = useTheme();

  const navItems = [
    {
      id: 'cockpit' as WorkspaceId,
      label: 'Risk Cockpit',
      subtitle: 'Dashboard, LEC & Heatmap',
      icon: Layers,
      highlight: true
    },
    {
      id: 'lab' as WorkspaceId,
      label: 'Scenario & Model Lab',
      subtitle: 'FAIR Builder & Registers',
      icon: FlaskConical
    },
    {
      id: 'ai-defense' as WorkspaceId,
      label: 'AI & Threat Defense',
      subtitle: 'Model Defense & AI Register',
      icon: ShieldAlert
    },
    {
      id: 'sqlite' as WorkspaceId,
      label: 'Database & Snapshots',
      subtitle: 'Portable SQLite & History',
      icon: Database
    }
  ];

  return (
    <aside
      id="main-sidebar"
      className={`border-r flex flex-col justify-between transition-all duration-200 z-30 shrink-0 select-none ${
        isReportLight
          ? 'bg-slate-50 border-slate-200 text-slate-800'
          : 'bg-[#070709] border-zinc-800/90 text-zinc-100'
      } ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand & Logo Header */}
      <div>
        <div
          className={`h-16 px-3 flex items-center justify-between border-b transition-colors ${
            isReportLight ? 'bg-white border-slate-200' : 'bg-[#050505] border-zinc-800/80'
          }`}
        >
          {!isCollapsed ? (
            <>
              <a
                href="https://www.technoscope.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2.5 overflow-hidden group cursor-pointer hover:opacity-90 transition-opacity"
                title="Visit Technoscope (technoscope.co.in)"
              >
                <div
                  className={`p-2 rounded-lg shrink-0 transition-colors ${
                    isReportLight
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 group-hover:border-cyan-400 group-hover:bg-cyan-100'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-800 group-hover:border-cyan-600 group-hover:bg-cyan-900'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span
                    className={`font-bold text-sm tracking-wider uppercase font-display block transition-colors ${
                      isReportLight
                        ? 'text-slate-900 group-hover:text-cyan-700'
                        : 'text-white group-hover:text-cyan-300'
                    }`}
                  >
                    QUANTRISKSCALE
                  </span>
                  <span
                    className={`text-[10px] font-mono tracking-normal block transition-colors ${
                      isReportLight
                        ? 'text-slate-500 group-hover:text-slate-700'
                        : 'text-zinc-400 group-hover:text-zinc-300'
                    }`}
                  >
                    technoscope.co.in
                  </span>
                </div>
              </a>

              <button
                onClick={onToggleCollapse}
                className={`p-1.5 rounded-lg transition-colors ${
                  isReportLight
                    ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title="Minimize Sidebar (Collapse)"
                aria-label="Minimize Sidebar"
              >
                <PanelLeftClose
                  className={`w-4 h-4 ${
                    isReportLight
                      ? 'text-slate-400 hover:text-cyan-600'
                      : 'text-zinc-400 hover:text-cyan-400'
                  }`}
                />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between px-0.5">
              <a
                href="https://www.technoscope.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-1.5 rounded-lg transition-colors block cursor-pointer ${
                  isReportLight
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 hover:border-cyan-400 hover:bg-cyan-100'
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-800 hover:border-cyan-600 hover:bg-cyan-900'
                }`}
                title="Visit Technoscope (technoscope.co.in)"
              >
                <Shield className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onToggleCollapse}
                className={`p-1.5 rounded-lg transition-colors ${
                  isReportLight
                    ? 'text-cyan-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-cyan-400 hover:text-white hover:bg-zinc-800'
                }`}
                title="Maximize Sidebar (Expand)"
                aria-label="Maximize Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Primary Workspace Nav */}
        <div className="p-3 space-y-1.5">
          {!isCollapsed && (
            <div
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider ${
                isReportLight ? 'text-slate-400' : 'text-zinc-400'
              }`}
            >
              Workspaces
            </div>
          )}

          {navItems.map(item => {
            const isActive = activeWorkspace === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectWorkspace(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl transition-all font-mono text-xs text-left ${
                  isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5 space-x-3'
                } ${
                  isActive
                    ? isReportLight
                      ? 'bg-slate-900 text-white font-bold shadow-sm'
                      : 'bg-white text-black font-bold shadow-md'
                    : isReportLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <item.icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? isReportLight
                        ? 'text-cyan-400'
                        : 'text-black'
                      : isReportLight
                      ? 'text-slate-500'
                      : 'text-zinc-400'
                  }`}
                />
                {!isCollapsed && (
                  <div className="truncate">
                    <div className="truncate font-sans font-semibold text-xs">{item.label}</div>
                    <div
                      className={`text-[10px] font-mono truncate ${
                        isActive
                          ? isReportLight
                            ? 'text-slate-300'
                            : 'text-zinc-700'
                          : isReportLight
                          ? 'text-slate-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {item.subtitle}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Contextual Actions */}
        <div
          className={`px-3 py-2 border-t mt-2 space-y-1 ${
            isReportLight ? 'border-slate-200' : 'border-zinc-800/60'
          }`}
        >
          {!isCollapsed && (
            <div
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider ${
                isReportLight ? 'text-slate-400' : 'text-zinc-400'
              }`}
            >
              Quick Tools
            </div>
          )}

          <button
            onClick={onOpenQuickTune}
            title={isCollapsed ? 'Quick Tune Parameters' : undefined}
            className={`w-full flex items-center rounded-lg text-xs font-mono transition-colors ${
              isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 space-x-2.5'
            } ${
              isReportLight
                ? 'text-slate-600 hover:text-cyan-700 hover:bg-cyan-50'
                : 'text-zinc-400 hover:text-cyan-300 hover:bg-cyan-950/30'
            }`}
          >
            <Sliders className={`w-4 h-4 shrink-0 ${isReportLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
            {!isCollapsed && <span>Quick Tune</span>}
          </button>

          <button
            onClick={onOpenAiCopilot}
            title={isCollapsed ? 'AI Advisory' : undefined}
            className={`w-full flex items-center rounded-lg text-xs font-mono transition-colors ${
              isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 space-x-2.5'
            } ${
              isReportLight
                ? 'text-slate-600 hover:text-cyan-700 hover:bg-cyan-50'
                : 'text-zinc-400 hover:text-cyan-300 hover:bg-cyan-950/30'
            }`}
          >
            <Sparkles className={`w-4 h-4 shrink-0 ${isReportLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
            {!isCollapsed && <span>AI Advisory</span>}
          </button>

          <button
            onClick={onOpenPdfModal}
            title={isCollapsed ? 'Executive PDF Report' : undefined}
            className={`w-full flex items-center rounded-lg text-xs font-mono transition-colors ${
              isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 space-x-2.5'
            } ${
              isReportLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <FileText className={`w-4 h-4 shrink-0 ${isReportLight ? 'text-slate-500' : 'text-zinc-400'}`} />
            {!isCollapsed && <span>Export Report</span>}
          </button>

          <button
            onClick={onOpenGlossary}
            title={isCollapsed ? 'FAIR Glossary' : undefined}
            className={`w-full flex items-center rounded-lg text-xs font-mono transition-colors ${
              isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 space-x-2.5'
            } ${
              isReportLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <BookOpen className={`w-4 h-4 shrink-0 ${isReportLight ? 'text-slate-500' : 'text-zinc-400'}`} />
            {!isCollapsed && <span>Risk Lexicon</span>}
          </button>
        </div>
      </div>

      {/* Footer / Scenario Context Indicator */}
      {!isCollapsed && (
        <div
          className={`p-2.5 border-t transition-colors ${
            isReportLight ? 'bg-white border-slate-200' : 'bg-[#050505] border-zinc-800/80'
          }`}
        >
          <div
            className={`p-2.5 rounded-xl border text-[11px] font-mono transition-colors ${
              isReportLight
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-zinc-900/90 border-zinc-800 text-zinc-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-[9px] uppercase font-bold ${
                  isReportLight ? 'text-slate-400' : 'text-zinc-400'
                }`}
              >
                Active Scenario
              </span>
              {activeResult && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    activeResult.currentRiskRating === 'Critical'
                      ? isReportLight
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                      : activeResult.currentRiskRating === 'High'
                      ? isReportLight
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-orange-950 text-orange-300 border border-orange-800'
                      : isReportLight
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {activeResult.currentRiskRating}
                </span>
              )}
            </div>
            <p
              className={`font-semibold font-sans text-xs truncate ${
                isReportLight ? 'text-slate-900' : 'text-white'
              }`}
              title={activeScenario.name}
            >
              {activeScenario.name.split(':')[0]}
            </p>
            {activeResult && (
              <p
                className={`font-bold mt-1 text-[11px] ${
                  isReportLight ? 'text-cyan-700' : 'text-cyan-400'
                }`}
              >
                ALE: {formatAmount(activeResult.currentStats.mean, activeScenario.currency, activeScenario.unitScale)}/yr
              </p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

