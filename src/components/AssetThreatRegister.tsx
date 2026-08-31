import React, { useState } from 'react';
import {
  Server,
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  DollarSign,
  AlertOctagon,
  Layers
} from 'lucide-react';
import { AssetRegisterItem, ThreatRegisterItem } from '../types/fair';
import { formatAmount } from '../utils/distributions';

interface AssetThreatRegisterProps {
  assets: AssetRegisterItem[];
  threats: ThreatRegisterItem[];
  currency: string;
  onAddAsset: (item: AssetRegisterItem) => void;
  onAddThreat: (item: ThreatRegisterItem) => void;
  onOpenNewSimulationModal?: () => void;
}

export const AssetThreatRegister: React.FC<AssetThreatRegisterProps> = ({
  assets,
  threats,
  currency,
  onAddAsset,
  onAddThreat,
  onOpenNewSimulationModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'assets' | 'threats'>('assets');
  const [newAsset, setNewAsset] = useState<Partial<AssetRegisterItem>>({
    category: 'Critical Database',
    criticality: 'High',
    estimatedValue: 1000000
  });
  const [newThreat, setNewThreat] = useState<Partial<ThreatRegisterItem>>({
    category: 'Cybercriminal (Ransomware)',
    capabilityLevel: 'High (60-85)',
    motivation: 'Financial'
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name) return;
    onAddAsset({
      id: 'asset-' + Date.now(),
      name: newAsset.name,
      category: (newAsset.category as any) || 'Critical Database',
      estimatedValue: newAsset.estimatedValue || 1000000,
      criticality: (newAsset.criticality as any) || 'High',
      owner: newAsset.owner || 'Security Team',
      description: newAsset.description || ''
    });
    setNewAsset({ name: '', description: '', estimatedValue: 1000000, criticality: 'High', category: 'Critical Database' });
  };

  const handleCreateThreat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreat.name) return;
    onAddThreat({
      id: 'threat-' + Date.now(),
      name: newThreat.name,
      category: (newThreat.category as any) || 'Cybercriminal (Ransomware)',
      capabilityLevel: (newThreat.capabilityLevel as any) || 'High (60-85)',
      motivation: (newThreat.motivation as any) || 'Financial',
      typicalContactFrequency: newThreat.typicalContactFrequency || '5-20 attempts/year'
    });
    setNewThreat({ name: '', typicalContactFrequency: '', category: 'Cybercriminal (Ransomware)', capabilityLevel: 'High (60-85)' });
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5 font-mono">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-zinc-800 text-cyan-400 border border-zinc-700 uppercase tracking-widest">
              Risk Scoping Registers
            </span>
            <span className="text-xs text-zinc-400 font-mono uppercase">FAIR Taxonomy Elements</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-black text-white font-display uppercase tracking-tight">Asset &amp; Threat Community Inventory</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Maintain organizational asset inventories and threat actor profiles with estimated capability distributions.
          </p>
        </div>

        {/* Sub-tab toggle & Action */}
        <div className="flex items-center space-x-2 self-start md:self-auto font-mono">
          {onOpenNewSimulationModal && (
            <button
              onClick={onOpenNewSimulationModal}
              className="px-3.5 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-600/70 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm"
              title="Add New Risk Scenario Simulation"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>New Simulation</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 bg-[#050505] p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setActiveSubTab('assets')}
              className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                activeSubTab === 'assets'
                  ? 'bg-cyan-600 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Asset Register ({assets.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('threats')}
              className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                activeSubTab === 'threats'
                  ? 'bg-cyan-600 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Threat Actors ({threats.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'assets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asset List */}
          <div className="lg:col-span-2 space-y-3">
            {assets.map(asset => (
              <div key={asset.id} className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-2.5">
                <div className="flex items-center justify-between font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-cyan-400 border border-zinc-700 uppercase">
                      {asset.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      asset.criticality === 'Mission Critical'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {asset.criticality}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Est. Value: {formatAmount(asset.estimatedValue, currency, 1)}
                  </span>
                </div>

                <h4 className="text-base font-black text-white font-display uppercase tracking-tight">{asset.name}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-mono">{asset.description}</p>
                <div className="text-[11px] text-zinc-500 font-mono pt-1 uppercase">
                  Owner: <strong className="text-zinc-300">{asset.owner}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Asset Form */}
          <form onSubmit={handleCreateAsset} className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4 h-fit">
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider flex items-center space-x-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Register New Asset</span>
            </h3>

            <div>
              <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Asset Name</label>
              <input
                type="text"
                required
                value={newAsset.name || ''}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                placeholder="e.g. Active Directory Domain Controller"
                className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Asset Category</label>
              <select
                value={newAsset.category}
                onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as any })}
                className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              >
                <option value="AI Models & IP">AI Models &amp; IP (Weights, Prompts, GPU Cluster)</option>
                <option value="Critical Database">Critical Database / Vector Store</option>
                <option value="Financial Infrastructure">Financial Infrastructure</option>
                <option value="Trading Engine">Trading Engine</option>
                <option value="Web Application">Web Application</option>
                <option value="Customer PII">Customer PII / Health Records</option>
                <option value="Payment Gateway">Payment Gateway / POS</option>
                <option value="Internal Infrastructure">Internal Infrastructure (Kubernetes/Cloud)</option>
                <option value="IP / Source Code">IP / Source Code</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Criticality</label>
                <select
                  value={newAsset.criticality}
                  onChange={(e) => setNewAsset({ ...newAsset, criticality: e.target.value as any })}
                  className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Mission Critical">Mission Critical</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Est. Value ({currency})</label>
                <input
                  type="number"
                  value={newAsset.estimatedValue}
                  onChange={(e) => setNewAsset({ ...newAsset, estimatedValue: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Description</label>
              <textarea
                rows={2}
                value={newAsset.description || ''}
                onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-black font-display text-xs uppercase tracking-wider shadow-md transition-colors"
            >
              Add to Asset Register
            </button>
          </form>
        </div>
      )}

      {activeSubTab === 'threats' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threat List */}
          <div className="lg:col-span-2 space-y-3">
            {threats.map(threat => (
              <div key={threat.id} className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-2.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-rose-400 border border-zinc-700 uppercase">
                    {threat.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase">
                    TC: {threat.capabilityLevel}
                  </span>
                </div>

                <h4 className="text-base font-black text-white font-display uppercase tracking-tight">{threat.name}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-400 pt-1.5 border-t border-zinc-800 uppercase">
                  <span>Motivation: <strong className="text-zinc-200">{threat.motivation}</strong></span>
                  <span>Contact Freq: <strong className="text-zinc-200">{threat.typicalContactFrequency}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Threat Form */}
          <form onSubmit={handleCreateThreat} className="bg-[#09090b] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4 h-fit">
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider flex items-center space-x-2">
              <Plus className="w-4 h-4 text-rose-400" />
              <span>Register Threat Community</span>
            </h3>

            <div>
              <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Threat Actor Community</label>
              <input
                type="text"
                required
                value={newThreat.name || ''}
                onChange={(e) => setNewThreat({ ...newThreat, name: e.target.value })}
                placeholder="e.g. FIN7 Financial Crime Syndicate"
                className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Threat Category</label>
              <select
                value={newThreat.category}
                onChange={(e) => setNewThreat({ ...newThreat, category: e.target.value as any })}
                className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-rose-500 focus:outline-none"
              >
                <option value="Agentic AI Threat">Agentic AI Threat (Autonomous Subversion &amp; Rogue Swarms)</option>
                <option value="Cybercriminal (Prompt Injection)">Cybercriminal (Prompt Injection / IPI Exploits)</option>
                <option value="AI Supply Chain">AI Supply Chain (Poisoned Weights / MCP Tools)</option>
                <option value="Nation State / Industrial Espionage">Nation State / AI Espionage</option>
                <option value="Cybercriminal (Ransomware)">Cybercriminal (Ransomware)</option>
                <option value="Cybercriminal (Banking)">Cybercriminal (Banking / Wire Fraud)</option>
                <option value="Malicious Insider">Malicious Insider (Data / Weights Theft)</option>
                <option value="Third-Party Vendor">Third-Party Vendor</option>
                <option value="Script Kiddie / Botnet">Script Kiddie / Botnet</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Capability Level (TC)</label>
              <select
                value={newThreat.capabilityLevel}
                onChange={(e) => setNewThreat({ ...newThreat, capabilityLevel: e.target.value as any })}
                className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-rose-500 focus:outline-none"
              >
                <option value="Low (10-30)">Low (10-30)</option>
                <option value="Medium (30-60)">Medium (30-60)</option>
                <option value="High (60-85)">High (60-85)</option>
                <option value="Elite (85-100)">Elite (85-100)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1">Typical Contact Frequency</label>
              <input
                type="text"
                value={newThreat.typicalContactFrequency || ''}
                onChange={(e) => setNewThreat({ ...newThreat, typicalContactFrequency: e.target.value })}
                placeholder="e.g. 10 - 40 attempts/year"
                className="w-full bg-[#050505] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black font-display text-xs uppercase tracking-wider shadow-md transition-colors"
            >
              Add Threat Community
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
