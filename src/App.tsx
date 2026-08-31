import React, { useState, useEffect } from 'react';
import { SidebarNav, WorkspaceId } from './components/SidebarNav';
import { UnifiedTopBar } from './components/UnifiedTopBar';
import { FairDashboard } from './components/FairDashboard';
import { FairScenarioBuilder } from './components/FairScenarioBuilder';
import { ComparativeAnalysis } from './components/ComparativeAnalysis';
import { LossExceedanceViewer } from './components/LossExceedanceViewer';
import { FairTreeDiagram } from './components/FairTreeDiagram';
import { SqliteManager } from './components/SqliteManager';
import { AiRiskAssistant } from './components/AiRiskAssistant';
import { AssetThreatRegister } from './components/AssetThreatRegister';
import { AiRiskRegisterHub } from './components/AiRiskRegisterHub';
import { RiskHeatmapViewer } from './components/RiskHeatmapViewer';
import { QuickTuneDrawer } from './components/QuickTuneDrawer';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { PdfExportModal } from './components/PdfExportModal';
import { NewSimulationModal } from './components/NewSimulationModal';
import { GlossaryModal } from './components/GlossaryModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { useTheme } from './context/ThemeContext';

import {
  DEFAULT_SCENARIOS,
  DEFAULT_ASSETS,
  DEFAULT_THREATS
} from './data/defaultScenarios';
import {
  FairScenario,
  SimulationResult,
  LocalAiEndpointConfig,
  AssetRegisterItem,
  ThreatRegisterItem
} from './types/fair';
import { runFairSimulation } from './services/fairEngine';
import {
  getSqliteDb,
  saveScenarioToSqlite,
  loadScenariosFromSqlite,
  logSimulationRun,
  saveScenarioSnapshot,
  seedRegistersIfEmpty
} from './services/sqliteService';
import { DEFAULT_AI_CONFIG } from './services/aiEndpointService';

export default function App() {
  const { isReportLight } = useTheme();
  const [scenarios, setScenarios] = useState<FairScenario[]>(DEFAULT_SCENARIOS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>(DEFAULT_SCENARIOS[0].id);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>('cockpit');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Sub-view selection within Scenario Lab (Builder vs Registers)
  const [labSubTab, setLabSubTab] = useState<'builder' | 'registers'>('builder');

  const [simulationResults, setSimulationResults] = useState<Record<string, SimulationResult>>({});
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [aiConfig, setAiConfig] = useState<LocalAiEndpointConfig>(DEFAULT_AI_CONFIG);
  const [assets, setAssets] = useState<AssetRegisterItem[]>(DEFAULT_ASSETS);
  const [threats, setThreats] = useState<ThreatRegisterItem[]>(DEFAULT_THREATS);

  // Drawers & Modals State
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [showQuickTuneDrawer, setShowQuickTuneDrawer] = useState<boolean>(false);
  const [showAiCopilotDrawer, setShowAiCopilotDrawer] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [showNewSimulationModal, setShowNewSimulationModal] = useState<boolean>(false);
  const [showGlossaryModal, setShowGlossaryModal] = useState<boolean>(false);
  const [glossarySearchQuery, setGlossarySearchQuery] = useState<string>('');

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
  const activeResult = simulationResults[activeScenarioId] || null;

  // Global Keyboard Shortcuts (Cmd+K, Ctrl+K, Cmd+B, Ctrl+B, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      } else if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') || (!isInput && e.key === '[')) {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize SQLite and run baseline simulation on first mount
  useEffect(() => {
    async function initApp() {
      try {
        await getSqliteDb();
        await seedRegistersIfEmpty(DEFAULT_ASSETS, DEFAULT_THREATS);

        const loaded = await loadScenariosFromSqlite();
        const loadedIds = new Set(loaded.map(s => s.id));
        let finalScenarios = [...loaded];

        for (const defaultSc of DEFAULT_SCENARIOS) {
          if (!loadedIds.has(defaultSc.id)) {
            await saveScenarioToSqlite(defaultSc);
            finalScenarios.push(defaultSc);
          }
        }

        if (finalScenarios.length > 0) {
          setScenarios(finalScenarios);
          const initialId = finalScenarios.find(s => s.id === 'scenario-bank-wire-fraud-ransomware')?.id || finalScenarios[0].id;
          setActiveScenarioId(initialId);
          const initialSc = finalScenarios.find(s => s.id === initialId) || finalScenarios[0];
          executeSimulationForScenario(initialSc);
        } else {
          for (const sc of DEFAULT_SCENARIOS) {
            await saveScenarioToSqlite(sc);
          }
          setScenarios(DEFAULT_SCENARIOS);
          setActiveScenarioId(DEFAULT_SCENARIOS[0].id);
          executeSimulationForScenario(DEFAULT_SCENARIOS[0]);
        }
      } catch (err) {
        console.error('App init error, using defaults in-memory:', err);
        setScenarios(DEFAULT_SCENARIOS);
        setActiveScenarioId(DEFAULT_SCENARIOS[0].id);
        executeSimulationForScenario(DEFAULT_SCENARIOS[0]);
      }
    }
    initApp();
  }, []);

  // Run simulation function
  const executeSimulationForScenario = (sc = activeScenario) => {
    setIsSimulating(true);
    setTimeout(() => {
      try {
        const res = runFairSimulation(sc, sc.simulationsCount || 10000);
        setSimulationResults(prev => ({ ...prev, [sc.id]: res }));

        // Log run in SQLite history asynchronously
        logSimulationRun(
          sc.id,
          res.trialsCount,
          res.currentStats.mean,
          res.currentStats.p90,
          res.currentStats.p95,
          res.proposedStats?.mean,
          res.proposedStats?.p90,
          res.proposedStats?.p95,
          res.riskReductionPct,
          res.currentRiskRating
        ).catch(e => console.warn('SQLite history log warning:', e));

        // Automatically save snapshot of scenario parameters
        saveScenarioSnapshot(
          sc,
          `Simulation Run (${(sc.simulationsCount || 10000).toLocaleString()} trials) • ALE: ${res.currentRiskRating}`
        ).catch(e => console.warn('SQLite snapshot save warning:', e));
      } finally {
        setIsSimulating(false);
      }
    }, 50);
  };

  const handleSelectScenario = (id: string) => {
    setActiveScenarioId(id);
    const target = scenarios.find(s => s.id === id);
    if (target && !simulationResults[id]) {
      executeSimulationForScenario(target);
    }
  };

  const handleSaveScenario = async (updated: FairScenario) => {
    setScenarios(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    await saveScenarioToSqlite(updated);
    executeSimulationForScenario(updated);
  };

  const handleCreateNewScenario = async (newScenario: FairScenario) => {
    setScenarios(prev => [newScenario, ...prev]);
    setActiveScenarioId(newScenario.id);
    await saveScenarioToSqlite(newScenario);
    executeSimulationForScenario(newScenario);
    setActiveWorkspace('cockpit');
  };

  const handleLoadAiScenario = async (aiScenario: FairScenario) => {
    setScenarios(prev => {
      const existingIdx = prev.findIndex(s => s.id === aiScenario.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = aiScenario;
        return copy;
      }
      return [aiScenario, ...prev];
    });
    setActiveScenarioId(aiScenario.id);
    await saveScenarioToSqlite(aiScenario);
    executeSimulationForScenario(aiScenario);
  };

  const handleDatabaseReloaded = async () => {
    const loaded = await loadScenariosFromSqlite();
    if (loaded.length > 0) {
      setScenarios(loaded);
      setActiveScenarioId(loaded[0].id);
      executeSimulationForScenario(loaded[0]);
    }
  };

  return (
    <div
      className={`h-screen h-[100dvh] w-screen overflow-hidden flex font-sans transition-colors duration-150 ${
        isReportLight
          ? 'bg-slate-50 text-slate-900 selection:bg-cyan-500 selection:text-white'
          : 'bg-[#050505] text-[#FAFAFA] selection:bg-cyan-500 selection:text-black'
      }`}
    >
      {/* Left Collapsible Vertical Navigation */}
      <SidebarNav
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={setActiveWorkspace}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeScenario={activeScenario}
        activeResult={activeResult}
        onOpenQuickTune={() => setShowQuickTuneDrawer(true)}
        onOpenAiCopilot={() => setShowAiCopilotDrawer(true)}
        onOpenGlossary={() => {
          setGlossarySearchQuery('');
          setShowGlossaryModal(true);
        }}
        onOpenPdfModal={() => setShowPdfModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Streamlined Top Action Bar */}
        <UnifiedTopBar
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onSelectScenario={handleSelectScenario}
          onRunSimulation={() => executeSimulationForScenario(activeScenario)}
          isSimulating={isSimulating}
          activeResult={activeResult}
          onOpenQuickTune={() => setShowQuickTuneDrawer(true)}
          onOpenAiCopilot={() => setShowAiCopilotDrawer(true)}
          onOpenPdfModal={() => setShowPdfModal(true)}
          onOpenNewSimulationModal={() => setShowNewSimulationModal(true)}
          onOpenGlossaryModal={() => {
            setGlossarySearchQuery('');
            setShowGlossaryModal(true);
          }}
          onOpenSqlite={() => setActiveWorkspace('sqlite')}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
        />

        {/* Workspace Display */}
        <main
          className={`flex-1 overflow-y-auto custom-scrollbar transition-colors ${
            isReportLight ? 'bg-slate-100/60' : 'bg-[#050505]'
          }`}
        >
          {/* WORKSPACE 1: RISK COCKPIT (The Primary Golden Path) */}
          {activeWorkspace === 'cockpit' && (
            <FairDashboard
              scenario={activeScenario}
              result={activeResult}
              onRunSimulation={() => executeSimulationForScenario(activeScenario)}
              isSimulating={isSimulating}
              onOpenAiAssistant={() => setShowAiCopilotDrawer(true)}
              onOpenQuickTune={() => setShowQuickTuneDrawer(true)}
              onNavigateToBuilder={() => setActiveWorkspace('lab')}
              onOpenPdfModal={() => setShowPdfModal(true)}
              onOpenNewSimulationModal={() => setShowNewSimulationModal(true)}
              onOpenGlossaryModal={(term?: string) => {
                setGlossarySearchQuery(term || '');
                setShowGlossaryModal(true);
              }}
            />
          )}

          {/* WORKSPACE 2: SCENARIO & MODEL LAB */}
          {activeWorkspace === 'lab' && (
            <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
              {/* Lab Sub-navigation Switcher */}
              <div className="flex items-center justify-between bg-[#09090b] border border-zinc-800 rounded-xl p-2 font-mono text-xs">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setLabSubTab('builder')}
                    className={`px-3.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors ${
                      labSubTab === 'builder'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    FAIR Parametric Builder
                  </button>
                  <button
                    onClick={() => setLabSubTab('registers')}
                    className={`px-3.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors ${
                      labSubTab === 'registers'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Asset &amp; Threat Registers
                  </button>
                </div>

                <button
                  onClick={() => setShowQuickTuneDrawer(true)}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-700 font-semibold"
                >
                  <span>Quick Tune Drawer</span>
                </button>
              </div>

              {labSubTab === 'builder' ? (
                <FairScenarioBuilder
                  scenario={activeScenario}
                  onSaveScenario={handleSaveScenario}
                  onRunSimulation={() => executeSimulationForScenario(activeScenario)}
                  onOpenAiAssistant={() => setShowAiCopilotDrawer(true)}
                  onOpenNewSimulationModal={() => setShowNewSimulationModal(true)}
                />
              ) : (
                <AssetThreatRegister
                  assets={assets}
                  threats={threats}
                  currency={activeScenario.currency}
                  onAddAsset={(a) => setAssets(prev => [...prev, a])}
                  onAddThreat={(t) => setThreats(prev => [...prev, t])}
                  onOpenNewSimulationModal={() => setShowNewSimulationModal(true)}
                />
              )}
            </div>
          )}

          {/* WORKSPACE 3: AI & THREAT DEFENSE */}
          {activeWorkspace === 'ai-defense' && (
            <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
              <AiRiskRegisterHub
                onLoadScenario={(sc) => handleLoadAiScenario(sc)}
                onNavigateToBuilder={() => setActiveWorkspace('lab')}
                activeScenarioId={activeScenarioId}
              />
            </div>
          )}

          {/* WORKSPACE 4: DATABASE & SNAPSHOTS */}
          {activeWorkspace === 'sqlite' && (
            <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
              <SqliteManager
                onDatabaseReloaded={handleDatabaseReloaded}
              />
            </div>
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-zinc-800/80 bg-[#070709] px-6 py-3 text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-3 font-mono uppercase tracking-wider select-none">
          <div className="flex flex-wrap items-center space-x-2.5">
            <span className="font-bold text-zinc-300">Open FAIR Quantitative Risk Engine</span>
            <span className="text-zinc-600">•</span>
            <a
              href="https://www.technoscope.co.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors lowercase font-semibold"
            >
              www.technoscope.co.in
            </a>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
              MIT License
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline">O-FAIR / ISO 27005 / NIST CSF</span>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <span className="text-cyan-400 font-bold">Simulations: {activeScenario.simulationsCount.toLocaleString()} Trials</span>
          </div>
        </footer>
      </div>

      {/* Slide-out Quick Parameter Tuning Drawer */}
      <QuickTuneDrawer
        isOpen={showQuickTuneDrawer}
        onClose={() => setShowQuickTuneDrawer(false)}
        scenario={activeScenario}
        onSaveAndRun={(updated) => {
          handleSaveScenario(updated);
          setShowQuickTuneDrawer(false);
        }}
        onOpenFullBuilder={() => {
          setShowQuickTuneDrawer(false);
          setActiveWorkspace('lab');
        }}
        onOpenAiCopilot={() => {
          setShowQuickTuneDrawer(false);
          setShowAiCopilotDrawer(true);
        }}
        isSimulating={isSimulating}
      />

      {/* Slide-out AI Copilot Drawer */}
      <AiCopilotDrawer
        isOpen={showAiCopilotDrawer}
        onClose={() => setShowAiCopilotDrawer(false)}
        scenario={activeScenario}
        simResult={activeResult}
        aiConfig={aiConfig}
        onUpdateAiConfig={setAiConfig}
        onNavigateToBuilder={() => {
          setShowAiCopilotDrawer(false);
          setActiveWorkspace('lab');
        }}
      />

      {/* Executive PDF Report Modal */}
      <PdfExportModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        scenario={activeScenario}
        result={activeResult}
      />

      {/* New Simulation Modal */}
      <NewSimulationModal
        isOpen={showNewSimulationModal}
        onClose={() => setShowNewSimulationModal(false)}
        onCreated={handleCreateNewScenario}
        assets={assets}
        threats={threats}
        currentActiveScenario={activeScenario}
      />

      {/* Risk Lexicon / Glossary Modal */}
      <GlossaryModal
        isOpen={showGlossaryModal}
        onClose={() => setShowGlossaryModal(false)}
        initialSearch={glossarySearchQuery}
      />

      {/* Global Command Palette Modal (Cmd+K / Ctrl+K) */}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
        onSelectWorkspace={setActiveWorkspace}
        onRunSimulation={() => executeSimulationForScenario(activeScenario)}
        onOpenQuickTune={() => setShowQuickTuneDrawer(true)}
        onOpenAiAdvisory={() => setShowAiCopilotDrawer(true)}
        onOpenPdfModal={() => setShowPdfModal(true)}
        onOpenGlossaryModal={() => {
          setGlossarySearchQuery('');
          setShowGlossaryModal(true);
        }}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
      />
    </div>
  );
}
