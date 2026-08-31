import React, { useState } from 'react';
import {
  FileText,
  Download,
  X,
  CheckCircle2,
  ShieldCheck,
  Building,
  User,
  Sparkles,
  Layers,
  FileCheck,
  Printer,
  Sun,
  Moon
} from 'lucide-react';
import { FairScenario, SimulationResult } from '../types/fair';
import { downloadRiskScenarioPdf } from '../utils/pdfExport';
import { formatAmount } from '../utils/distributions';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: FairScenario;
  result: SimulationResult | null;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  scenario,
  result
}) => {
  const { theme, toggleTheme, isReportLight } = useTheme();
  const [author, setAuthor] = useState<string>('Certified Open FAIR Analyst');
  const [organization, setOrganization] = useState<string>('Enterprise Information Security & Risk');
  const [customNotes, setCustomNotes] = useState<string>(
    `Quantitative evaluation indicates an inherent expected loss of ${
      result ? formatAmount(result.currentStats.mean, scenario.currency, scenario.unitScale) : 'calculated'
    }/yr. Proposed technical safeguards demonstrate significant risk reduction with positive Return on Security Investment (ROSI).`
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    try {
      downloadRiskScenarioPdf({
        scenario,
        result,
        author,
        organization,
        customNotes: customNotes.trim() ? customNotes : undefined
      });
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBrowserPrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 200);
  };


  const cur = result?.currentStats;
  const prop = result?.proposedStats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-[#09090b] border border-zinc-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-display tracking-tight text-white uppercase">
                Export Executive Risk Report (PDF)
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Open FAIR Standard • Monte Carlo Quantified Summary
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs">
          {/* Active Scenario Overview Card */}
          <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Active Scenario</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold uppercase">{scenario.status}</span>
            </div>
            <div className="text-sm font-bold text-white font-sans">{scenario.name}</div>
            <div className="text-[11px] text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
              <span>Asset: <strong className="text-zinc-200">{scenario.asset}</strong></span>
              <span>Threat: <strong className="text-zinc-200">{scenario.threatCommunity}</strong></span>
              <span>Trials: <strong className="text-zinc-200">{scenario.simulationsCount.toLocaleString()}</strong></span>
            </div>

            {/* Quick Metrics Preview */}
            {cur && (
              <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                  <div className="text-zinc-400">Mean ALE</div>
                  <div className="text-white font-bold font-mono text-xs mt-0.5">
                    {formatAmount(cur.mean, scenario.currency, scenario.unitScale)}
                  </div>
                </div>
                <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                  <div className="text-zinc-400">90th% VaR</div>
                  <div className="text-amber-400 font-bold font-mono text-xs mt-0.5">
                    {formatAmount(cur.p90, scenario.currency, scenario.unitScale)}
                  </div>
                </div>
                <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                  <div className="text-zinc-400">Risk Reduction</div>
                  <div className="text-emerald-400 font-bold font-mono text-xs mt-0.5">
                    {prop ? `-${Math.max(0, ((cur.mean - prop.mean) / cur.mean) * 100).toFixed(1)}%` : 'Baseline'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Report Customization Form */}
          <div className="space-y-3 font-sans">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center space-x-1.5 font-mono">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Analyst / Evaluator Name</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 font-mono"
                placeholder="e.g. Lead Risk Officer / FAIR Analyst"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center space-x-1.5 font-mono">
                <Building className="w-3.5 h-3.5 text-cyan-400" />
                <span>Organization / Division</span>
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 font-mono"
                placeholder="e.g. Cyber Risk Management & Governance"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center space-x-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Executive Observations & Management Directives</span>
              </label>
              <textarea
                rows={3}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 font-sans resize-none"
                placeholder="Add optional notes for the executive board or audit committee..."
              />
            </div>
          </div>

          {/* Theme & Format Selector */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-zinc-200 font-bold uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
                {isReportLight ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
                <span>Active Theme: {isReportLight ? 'Report Light Mode' : 'Deep Space Dark'}</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {isReportLight
                  ? 'High-contrast light palette optimized for board review & crisp printing.'
                  : 'Deep space dark mode. Switch to Report mode for high contrast on white paper.'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center space-x-1"
              >
                {isReportLight ? <Moon className="w-3 h-3 text-cyan-400" /> : <Sun className="w-3 h-3 text-amber-400" />}
                <span>{isReportLight ? 'Use Dark' : 'Use Light'}</span>
              </button>
            </div>
          </div>

          {/* Inclusions Checklist */}
          <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
            <div className="text-zinc-300 font-bold uppercase text-[10px] tracking-wider mb-1 flex items-center space-x-1">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Report Package Contents</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <div>• Scenario Metadata & Scope</div>
              <div>• Monte Carlo Quantified Statistics</div>
              <div>• FAIR 3-Point Beta-PERT Table</div>
              <div>• Loss Exceedance Curve (LEC) Table</div>
              <div>• What-If Residual Risk & ROSI</div>
              <div>• ISO 27005 / NIST Sign-Off</div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-zinc-400 hover:text-white text-xs font-mono font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBrowserPrint}
              className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono font-semibold transition-colors flex items-center space-x-1.5"
              title="Open Browser Print Dialog directly (Ctrl+P / Cmd+P)"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Browser Print</span>
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`px-5 py-2.5 rounded-lg font-display font-black text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-lg ${
              downloadSuccess
                ? 'bg-emerald-500 text-black'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-950/40 hover:scale-[1.02] active:scale-98'
            }`}
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>PDF Downloaded!</span>
              </>
            ) : isExporting ? (
              <span>Generating PDF...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Executive PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
