import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  Play,
  Table,
  RefreshCw,
  HardDrive,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Trash2
} from 'lucide-react';
import {
  getSqliteDb,
  executeSqlQuery,
  exportSqliteBinaryFile,
  importSqliteBinaryFile,
  exportTableToCsv,
  loadScenariosFromSqlite,
  resetDatabaseToIndustryDefaults
} from '../services/sqliteService';
import { DEFAULT_SCENARIOS, DEFAULT_ASSETS, DEFAULT_THREATS } from '../data/defaultScenarios';
import { SqlQueryResult, FairScenario } from '../types/fair';

interface SqliteManagerProps {
  onDatabaseReloaded: () => void;
}

export const SqliteManager: React.FC<SqliteManagerProps> = ({ onDatabaseReloaded }) => {
  const [queryInput, setQueryInput] = useState<string>('SELECT id, name, asset, threat_community, category, updated_at FROM scenarios;');
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [tablesList, setTablesList] = useState<string[]>([
    'scenarios',
    'scenario_snapshots',
    'simulation_history',
    'asset_register',
    'threat_register',
    'ai_logs'
  ]);
  const [activeTable, setActiveTable] = useState<string>('scenarios');
  const [tablePreviewData, setTablePreviewData] = useState<SqlQueryResult | null>(null);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Load preview of selected table
  const fetchTablePreview = async (tableName: string) => {
    setActiveTable(tableName);
    const res = await executeSqlQuery(`SELECT * FROM ${tableName} LIMIT 25;`);
    setTablePreviewData(res);
  };

  useEffect(() => {
    fetchTablePreview('scenarios');
  }, []);

  const handleResetToDefaults = async () => {
    if (window.confirm('Reset and re-seed all 4 Industry benchmark scenarios (Bank, Trade, Retail, AI Company) and Registers?')) {
      await resetDatabaseToIndustryDefaults(DEFAULT_SCENARIOS, DEFAULT_ASSETS, DEFAULT_THREATS);
      setImportStatus({ success: true, message: 'Successfully seeded Bank, Trade, Retail, and AI Company benchmark scenarios!' });
      fetchTablePreview('scenarios');
      onDatabaseReloaded();
    }
  };

  const handleRunQuery = async () => {
    if (!queryInput.trim()) return;
    setIsExecuting(true);
    try {
      const res = await executeSqlQuery(queryInput);
      setQueryResult(res);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDownloadBinary = async () => {
    const blob = await exportSqliteBinaryFile();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `open_fair_database_${new Date().toISOString().slice(0, 10)}.sqlite`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = async (tableName: string) => {
    const csv = await exportTableToCsv(tableName);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      await importSqliteBinaryFile(arrayBuffer);
      setImportStatus({ success: true, message: `Successfully imported SQLite database: "${file.name}"` });
      fetchTablePreview('scenarios');
      onDatabaseReloaded();
    } catch (err: any) {
      setImportStatus({ success: false, message: `Failed to import SQLite DB: ${err.message}` });
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5 font-mono">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-zinc-800 text-cyan-400 border border-zinc-700 uppercase tracking-widest">
              Self-Contained &amp; Air-Gapped
            </span>
            <span className="text-xs text-zinc-400 font-mono uppercase">WebAssembly SQLite 3 Engine</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-black text-white font-display uppercase tracking-tight">Portable SQLite Database Hub</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Export standalone binary <code className="text-cyan-300 font-mono font-bold">.sqlite</code> files for air-gapped transport, run custom SQL queries, or import external risk databases.
          </p>
        </div>

        {/* Database Export & Import Actions */}
        <div className="flex flex-wrap items-center gap-3 font-mono">
          <button
            onClick={handleResetToDefaults}
            className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-cyan-500/50 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-colors shadow-sm"
            title="Reset to 4 Standard Industry Scenarios (Bank, Trade, Retail, AI Company)"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Reset Industry Templates (Bank/Trade/Retail/AI)</span>
          </button>

          <button
            onClick={handleDownloadBinary}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-black font-display text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Raw .sqlite DB</span>
          </button>

          <label className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Import .sqlite File</span>
            <input
              type="file"
              accept=".sqlite,.db,.sqlite3"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importStatus && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-2 border font-mono ${
            importStatus.success
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
              : 'bg-red-950/40 text-red-300 border-red-800/60'
          }`}
        >
          {importStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* SQL Query Console */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-cyan-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">Interactive SQL Console</h3>
              <p className="text-[11px] text-zinc-400 font-mono">Execute ad-hoc SELECT, JOIN, or aggregate risk queries directly against in-memory SQLite tables.</p>
            </div>
          </div>

          <button
            onClick={handleRunQuery}
            disabled={isExecuting}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-black font-display text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow transition-all active:scale-98"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Execute SQL</span>
          </button>
        </div>

        <div>
          <textarea
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            rows={3}
            className="w-full bg-[#050505] border border-zinc-700 rounded-lg p-3 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none leading-relaxed"
            placeholder="SELECT * FROM scenarios WHERE category = 'Ransomware';"
          />
        </div>

        {/* Query Result Grid */}
        {queryResult && (
          <div className="space-y-2 border-t border-zinc-800 pt-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono uppercase tracking-wider">
              <span>{queryResult.rowCount} rows returned</span>
              <span>Execution Time: <strong className="text-cyan-400">{queryResult.executionTimeMs} ms</strong></span>
            </div>

            <div className="overflow-x-auto max-h-[280px] overflow-y-auto border border-zinc-800 rounded-lg bg-[#050505]">
              <table className="w-full text-xs text-left">
                <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
                  <tr>
                    {queryResult.columns.map((col, idx) => (
                      <th key={idx} className="py-2.5 px-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-200">
                  {queryResult.values.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-zinc-800/40">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 whitespace-nowrap max-w-[280px] truncate text-[11px]">
                          {cell === null ? <span className="text-zinc-600">NULL</span> : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Database Schema Table Inspector */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 font-mono">
          <div className="flex items-center space-x-2">
            <Table className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">Table Schema Inspector</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tablesList.map(t => (
              <button
                key={t}
                onClick={() => fetchTablePreview(t)}
                className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                  activeTable === t
                    ? 'bg-cyan-600 text-black font-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                }`}
              >
                {t}
              </button>
            ))}

            <button
              onClick={() => handleDownloadCsv(activeTable)}
              className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-mono uppercase tracking-wider flex items-center space-x-1 transition-colors"
              title="Export active table to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content Preview */}
        {tablePreviewData && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono uppercase tracking-wider">
              <span>Previewing table <strong className="text-cyan-400 font-bold">{activeTable}</strong> (limit 25)</span>
              <span>{tablePreviewData.rowCount} records</span>
            </div>

            <div className="overflow-x-auto max-h-[320px] overflow-y-auto border border-zinc-800 rounded-lg bg-[#050505]">
              <table className="w-full text-xs text-left">
                <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
                  <tr>
                    {tablePreviewData.columns.map((col, idx) => (
                      <th key={idx} className="py-2.5 px-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-200">
                  {tablePreviewData.values.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-zinc-800/40">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 whitespace-nowrap max-w-[300px] truncate text-[11px]">
                          {cell === null ? <span className="text-zinc-600">NULL</span> : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
