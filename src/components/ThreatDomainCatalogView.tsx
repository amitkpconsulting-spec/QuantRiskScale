import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Play,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Check,
  Sliders,
  PlusCircle,
  X,
  FileCode,
  RotateCcw
} from 'lucide-react';
import {
  ThreatDomain,
  ThreatCatalogItem,
  INFOSEC_THREAT_CATALOG,
  TECH_THREAT_CATALOG,
  SANS_THREAT_CATALOG,
  REGULATORY_THREAT_CATALOG,
  convertCatalogItemToFairScenario
} from '../data/threatCatalogs';
import { FairScenario } from '../types/fair';
import { formatAmount } from '../utils/distributions';

interface ThreatDomainCatalogViewProps {
  domain: ThreatDomain;
  onLoadScenario: (scenario: FairScenario) => void;
  onNavigateToBuilder?: () => void;
  activeScenarioId?: string;
  onSimulateSuccess?: (msg: string) => void;
}

export const ThreatDomainCatalogView: React.FC<ThreatDomainCatalogViewProps> = ({
  domain,
  onLoadScenario,
  onNavigateToBuilder,
  activeScenarioId,
  onSimulateSuccess
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [simulatedItemId, setSimulatedItemId] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [customItems, setCustomItems] = useState<ThreatCatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem('quantrisk_custom_threat_scenarios');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Template Form State
  const [templateForm, setTemplateForm] = useState<Partial<ThreatCatalogItem>>({
    domain,
    id: `CUSTOM-${Date.now().toString().slice(-4)}`,
    category: domain === 'regulatory' ? 'Regulatory Compliance & Penalties' : 'Custom Threat Category',
    name: '',
    description: '',
    asset: 'Critical Digital Asset / Business Service',
    threatCommunity: 'External Threat Actor / Regulatory Authority',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    residualLikelihood: 1,
    residualImpact: 2,
    residualScore: 2,
    keyControls: 'Multi-factor authentication, regular audit logging, automated incident alerting',
    controlOwner: 'Chief Risk Officer & Compliance Team',
    standardReference: domain === 'regulatory' ? 'DPDPA 2023 / GDPR / SEC Form 8-K' : 'Custom Corporate Policy v1.0',
    status: 'Mitigating',
    typicalLossRange: { low: 500, mode: 2500, high: 10000 },
    contactFreqAnnual: { low: 0.5, mode: 2.0, high: 6.0 }
  });

  // Select appropriate dataset based on active domain
  const rawCatalog: ThreatCatalogItem[] = useMemo(() => {
    let baseList: ThreatCatalogItem[] = [];
    switch (domain) {
      case 'infosec':
        baseList = INFOSEC_THREAT_CATALOG;
        break;
      case 'tech':
        baseList = TECH_THREAT_CATALOG;
        break;
      case 'sans':
        baseList = SANS_THREAT_CATALOG;
        break;
      case 'regulatory':
        baseList = REGULATORY_THREAT_CATALOG;
        break;
      default:
        baseList = INFOSEC_THREAT_CATALOG;
    }
    const matchingCustom = customItems.filter(item => item.domain === domain);
    return [...matchingCustom, ...baseList];
  }, [domain, customItems]);

  const domainMetadata = useMemo(() => {
    switch (domain) {
      case 'infosec':
        return {
          title: 'Information Security Threat Scenarios',
          tagline: 'Ransomware, Spear-Phishing BEC, Malicious Insiders & Supply Chain Compromise',
          standards: 'NIST CSF 2.0 • ISO/IEC 27001:2022 • CIS Controls v8',
          accentColor: 'text-amber-400',
          borderColor: 'border-amber-500/30',
          badgeBg: 'bg-amber-950/70 border-amber-500/40 text-amber-300'
        };
      case 'tech':
        return {
          title: 'Technology & Infrastructure Threat Scenarios',
          tagline: 'Cloud Hyperscaler Multi-AZ Outages, API Deadlocks, Volumetric DDoS & Storage Desync',
          standards: 'ISO 22301 Business Continuity • DORA Article 11 • PCI-DSS v4.0',
          accentColor: 'text-blue-400',
          borderColor: 'border-blue-500/30',
          badgeBg: 'bg-blue-950/70 border-blue-500/40 text-blue-300'
        };
      case 'sans':
        return {
          title: 'SANS Top 25 & CWE Software Security Scenarios',
          tagline: 'SQL Injection, OS Command Execution, JWT Auth Bypass & SSRF Cloud Metadata Attacks',
          standards: 'SANS CWE Top 25 Most Dangerous Software Weaknesses • OWASP Top 10',
          accentColor: 'text-red-400',
          borderColor: 'border-red-500/30',
          badgeBg: 'bg-red-950/70 border-red-500/40 text-red-300'
        };
      case 'regulatory':
        return {
          title: 'Regulatory Risk & Compliance Mandate Scenarios',
          tagline: 'India DPDPA (₹50 Cr - ₹250 Cr Fines), EU GDPR (Up to €20M or 4% Global Turnover), SEC 4-Day Cyber Disclosure & DORA ICT Resilience',
          standards: 'India DPDPA 2023 • EU GDPR 2016/679 (Art 83) • SEC Form 8-K • EU DORA 2022/2554',
          accentColor: 'text-purple-400',
          borderColor: 'border-purple-500/30',
          badgeBg: 'bg-purple-950/70 border-purple-500/40 text-purple-300'
        };
      default:
        return {
          title: 'Threat Defence Scenarios',
          tagline: 'Quantified Cyber Threat Scenarios',
          standards: 'Open FAIR Beta-PERT Standard',
          accentColor: 'text-cyan-400',
          borderColor: 'border-cyan-500/30',
          badgeBg: 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300'
        };
    }
  }, [domain]);

  // Filter catalog by search and status
  const filteredCatalog = useMemo(() => {
    return rawCatalog.filter(item => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.threatCommunity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.standardReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keyControls.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [rawCatalog, searchQuery, selectedStatus]);

  // Handle simulation trigger
  const handleSimulateItem = (item: ThreatCatalogItem) => {
    setSimulatedItemId(item.id);
    const scenario = convertCatalogItemToFairScenario(item);
    onLoadScenario(scenario);

    const msg = `Loaded & Simulating [${item.id}]: ${item.name} in FAIR Monte Carlo Engine`;
    if (onSimulateSuccess) {
      onSimulateSuccess(msg);
    }

    setTimeout(() => {
      setSimulatedItemId(null);
    }, 2500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 16) return 'text-red-400 bg-red-950/60 border-red-500/40';
    if (score >= 10) return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
    if (score >= 6) return 'text-yellow-300 bg-yellow-950/60 border-yellow-500/40';
    return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
  };

  return (
    <div className="space-y-5 font-mono">
      {/* Domain Summary Card */}
      <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${domainMetadata.badgeBg}`}>
              {domain.toUpperCase()} DEFENSE
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">{domainMetadata.standards}</span>
          </div>
          <h3 className="text-base font-bold text-white font-display">
            {domainMetadata.title}
          </h3>
          <p className="text-xs text-zinc-400 font-sans max-w-3xl">
            {domainMetadata.tagline}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Catalog Scenarios</div>
            <div className="text-xl font-bold text-white">{filteredCatalog.length} / {rawCatalog.length}</div>
          </div>
          <div className="text-right pl-3 border-l border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Quantification</div>
            <div className="text-xs text-cyan-400 font-bold">10,000 Iterations</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#09090b]/80 border border-zinc-800/80 p-3 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by threat title, CVE/CWE, standard, controls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050505] border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-zinc-400 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#050505] border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="Mitigating">Mitigating</option>
            <option value="Open">Open</option>
            <option value="Accepted">Accepted</option>
            <option value="Closed">Closed</option>
          </select>

          <button
            onClick={() => {
              setTemplateForm({
                domain,
                id: `CUST-${domain.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
                category: domain === 'regulatory' ? 'India DPDPA / EU GDPR Compliance' : `${domain.toUpperCase()} Custom Category`,
                name: '',
                description: '',
                asset: 'Critical Digital Asset & Regulated Records',
                threatCommunity: domain === 'regulatory' ? 'Data Protection Authority / Board' : 'Adversary / Threat Community',
                likelihood: 3,
                impact: 4,
                inherentScore: 12,
                residualLikelihood: 1,
                residualImpact: 2,
                residualScore: 2,
                keyControls: 'Continuous cryptographic protection, zero-trust controls, incident escalation protocol',
                controlOwner: 'Chief Information Security Officer & DPO',
                standardReference: domain === 'regulatory' ? 'DPDPA 2023 Sec 8(5) / GDPR Art 83' : 'ISO 27001:2022 / NIST CSF',
                status: 'Mitigating',
                typicalLossRange: { low: 2000, mode: 7500, high: 25000 },
                contactFreqAnnual: { low: 0.5, mode: 2.0, high: 5.0 }
              });
              setIsTemplateModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Update / Add Threat Template</span>
          </button>
        </div>
      </div>

      {/* Threat Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCatalog.map(item => {
          const isActivelyLoaded = activeScenarioId === `scenario-${item.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          const isJustSimulated = simulatedItemId === item.id;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-xl border transition-all duration-200 relative overflow-hidden group ${
                isActivelyLoaded
                  ? 'bg-zinc-950/90 border-cyan-500/80 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/40'
                  : 'bg-[#08080a] border-zinc-800/90 hover:border-zinc-700'
              }`}
            >
              {/* Active Indicator Strip */}
              {isActivelyLoaded && (
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500" />
              )}

              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-black bg-zinc-900 border border-zinc-700 text-cyan-400">
                    {item.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-900/80 text-zinc-300 border border-zinc-800">
                    {item.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 border border-zinc-800/80">
                    {item.standardReference}
                  </span>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'Mitigating'
                      ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                      : item.status === 'Open'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {item.status}
                  </span>

                  {isActivelyLoaded && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-700 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>Loaded in Cockpit</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="py-3 space-y-1.5">
                <h4 className="text-sm md:text-base font-bold text-white font-display">
                  {item.name}
                </h4>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* FAIR Matrix & Exposure Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 py-3 border-y border-zinc-800/60 text-xs">
                <div className="p-2.5 rounded-lg bg-[#050505] border border-zinc-800/60 space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Target Asset</div>
                  <div className="text-white truncate font-sans text-xs" title={item.asset}>{item.asset}</div>
                  <div className="text-[10px] text-zinc-400 truncate" title={item.threatCommunity}>Actor: {item.threatCommunity}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#050505] border border-zinc-800/60 space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Risk Matrix (Inherent → Residual)</div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold border ${getScoreColor(item.inherentScore)}`}>
                      Inh: {item.inherentScore}
                    </span>
                    <span className="text-zinc-600">→</span>
                    <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold border ${getScoreColor(item.residualScore)}`}>
                      Res: {item.residualScore}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    L{item.residualLikelihood} × I{item.residualImpact}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#050505] border border-zinc-800/60 space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Annual Contact Frequency (TEF)</div>
                  <div className="text-cyan-400 font-bold text-xs">
                    {item.contactFreqAnnual.mode} / yr
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Range: {item.contactFreqAnnual.low} – {item.contactFreqAnnual.high} / yr
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#050505] border border-zinc-800/60 space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Financial Exposure (Mode)</div>
                  <div className="text-emerald-400 font-bold text-xs">
                    ${formatAmount(item.typicalLossRange.mode * 1000)}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Low: ${formatAmount(item.typicalLossRange.low * 1000)} • High: ${formatAmount(item.typicalLossRange.high * 1000)}
                  </div>
                </div>
              </div>

              {/* Controls & Owners */}
              <div className="pt-3 pb-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-zinc-400 font-sans">
                <div className="space-y-0.5 flex-1 min-w-0 pr-4">
                  <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">Key Controls: </span>
                  <span className="text-zinc-300 text-xs">{item.keyControls}</span>
                </div>
                <div className="shrink-0 text-right font-mono text-[11px] text-zinc-400">
                  <span className="text-zinc-500">Owner:</span> {item.controlOwner}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-end space-x-2">
                {onNavigateToBuilder && (
                  <button
                    onClick={() => {
                      const scenario = convertCatalogItemToFairScenario(item);
                      onLoadScenario(scenario);
                      onNavigateToBuilder();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors flex items-center space-x-1"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Open in FAIR Lab</span>
                  </button>
                )}

                <button
                  onClick={() => handleSimulateItem(item)}
                  disabled={isJustSimulated}
                  className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-2 shadow-sm ${
                    isJustSimulated
                      ? 'bg-emerald-600 text-white shadow-emerald-950/50'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-950/40'
                  }`}
                >
                  {isJustSimulated ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Monte Carlo Running...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Simulate Threat (Monte Carlo)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {filteredCatalog.length === 0 && (
          <div className="p-8 text-center bg-[#09090b] border border-zinc-800 rounded-xl text-zinc-400 space-y-2">
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
            <div className="text-sm font-bold text-white">No Threat Scenarios Match Criteria</div>
            <p className="text-xs text-zinc-500">Try adjusting your search query or status filter.</p>
          </div>
        )}
      </div>

      {/* Manual Threat Scenario Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0a0a0c] border border-zinc-700 rounded-2xl shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Threat Scenario Template Editor
                </h3>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 font-sans">
              Update or add custom threat scenarios into the active catalog (<span className="text-purple-400 font-bold uppercase">{domain}</span> domain). You can define regulatory mandates (such as India DPDPA ₹250 Cr or EU GDPR €20M / 4%), standard references, and Open FAIR loss distributions.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!templateForm.name) return;

                const newItem: ThreatCatalogItem = {
                  id: templateForm.id || `CUST-${domain.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
                  domain,
                  category: templateForm.category || 'Regulatory Risk',
                  name: templateForm.name,
                  description: templateForm.description || '',
                  asset: templateForm.asset || 'Digital Assets & Citizen Data',
                  threatCommunity: templateForm.threatCommunity || 'Regulatory Authority',
                  likelihood: Number(templateForm.likelihood) || 3,
                  impact: Number(templateForm.impact) || 4,
                  inherentScore: (Number(templateForm.likelihood) || 3) * (Number(templateForm.impact) || 4),
                  residualLikelihood: Number(templateForm.residualLikelihood) || 1,
                  residualImpact: Number(templateForm.residualImpact) || 2,
                  residualScore: (Number(templateForm.residualLikelihood) || 1) * (Number(templateForm.residualImpact) || 2),
                  keyControls: templateForm.keyControls || '',
                  controlOwner: templateForm.controlOwner || 'DPO / CISO',
                  standardReference: templateForm.standardReference || 'DPDPA 2023 / GDPR',
                  status: (templateForm.status as any) || 'Mitigating',
                  typicalLossRange: {
                    low: Number(templateForm.typicalLossRange?.low) || 1000,
                    mode: Number(templateForm.typicalLossRange?.mode) || 5000,
                    high: Number(templateForm.typicalLossRange?.high) || 20000
                  },
                  contactFreqAnnual: {
                    low: Number(templateForm.contactFreqAnnual?.low) || 0.5,
                    mode: Number(templateForm.contactFreqAnnual?.mode) || 2.0,
                    high: Number(templateForm.contactFreqAnnual?.high) || 5.0
                  }
                };

                const updated = [newItem, ...customItems];
                setCustomItems(updated);
                try {
                  localStorage.setItem('quantrisk_custom_threat_scenarios', JSON.stringify(updated));
                } catch (err) {
                  console.error(err);
                }

                setIsTemplateModalOpen(false);
                if (onSimulateSuccess) {
                  onSimulateSuccess(`Successfully registered scenario [${newItem.id}] via Threat Template`);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Scenario ID</label>
                  <input
                    type="text"
                    required
                    value={templateForm.id || ''}
                    onChange={(e) => setTemplateForm({ ...templateForm, id: e.target.value })}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-3 py-1.5 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="e.g. REG-DPDPA-04"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Category / Mandate</label>
                  <input
                    type="text"
                    required
                    value={templateForm.category || ''}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-3 py-1.5 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="e.g. India DPDPA 2023 Enforcement"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Threat Scenario Name</label>
                <input
                  type="text"
                  required
                  value={templateForm.name || ''}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-3 py-1.5 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g. DPDPA Section 8(5) Personal Data Breach Fine (₹250 Crore Penalty)"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Detailed Threat Scenario Description</label>
                <textarea
                  rows={3}
                  required
                  value={templateForm.description || ''}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-3 py-1.5 text-white focus:border-purple-500 focus:outline-none font-sans"
                  placeholder="Describe failure to implement safeguards, regulatory discovery, enforcement body, and statutory fine exposure..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Asset at Risk</label>
                  <input
                    type="text"
                    value={templateForm.asset || ''}
                    onChange={(e) => setTemplateForm({ ...templateForm, asset: e.target.value })}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-3 py-1.5 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="e.g. Citizen Health Records & PII Repository"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Threat Community / Enforcing Body</label>
                  <input
                    type="text"
                    value={templateForm.threatCommunity || ''}
                    onChange={(e) => setTemplateForm({ ...templateForm, threatCommunity: e.target.value })}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-3 py-1.5 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="e.g. Data Protection Board of India (DPBI)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Standard Reference / Law</label>
                  <input
                    type="text"
                    value={templateForm.standardReference || ''}
                    onChange={(e) => setTemplateForm({ ...templateForm, standardReference: e.target.value })}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-3 py-1.5 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="e.g. India DPDPA 2023 Sec 8(5) / EU GDPR Art 83"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Control Owner</label>
                  <input
                    type="text"
                    value={templateForm.controlOwner || ''}
                    onChange={(e) => setTemplateForm({ ...templateForm, controlOwner: e.target.value })}
                    className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-3 py-1.5 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="e.g. Data Protection Officer (DPO) & Legal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Key Compensating Controls</label>
                <input
                  type="text"
                  value={templateForm.keyControls || ''}
                  onChange={(e) => setTemplateForm({ ...templateForm, keyControls: e.target.value })}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-3 py-1.5 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g. Granular database encryption, 72-hour notification runbooks, consent management"
                />
              </div>

              {/* Loss & Frequency Range */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="text-[11px] font-bold uppercase text-purple-400 flex items-center justify-between">
                  <span>Open FAIR Parametric Estimates</span>
                  <span className="text-[10px] text-zinc-500 lowercase font-normal">(thousands $ / events per yr)</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-400">Min Loss ($k)</label>
                    <input
                      type="number"
                      value={templateForm.typicalLossRange?.low || 0}
                      onChange={(e) => setTemplateForm({
                        ...templateForm,
                        typicalLossRange: {
                          low: Number(e.target.value),
                          mode: templateForm.typicalLossRange?.mode || 0,
                          high: templateForm.typicalLossRange?.high || 0
                        }
                      })}
                      className="w-full bg-[#050505] border border-zinc-800 rounded px-2.5 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400">Most Likely ($k)</label>
                    <input
                      type="number"
                      value={templateForm.typicalLossRange?.mode || 0}
                      onChange={(e) => setTemplateForm({
                        ...templateForm,
                        typicalLossRange: {
                          low: templateForm.typicalLossRange?.low || 0,
                          mode: Number(e.target.value),
                          high: templateForm.typicalLossRange?.high || 0
                        }
                      })}
                      className="w-full bg-[#050505] border border-zinc-800 rounded px-2.5 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400">Max Loss ($k)</label>
                    <input
                      type="number"
                      value={templateForm.typicalLossRange?.high || 0}
                      onChange={(e) => setTemplateForm({
                        ...templateForm,
                        typicalLossRange: {
                          low: templateForm.typicalLossRange?.low || 0,
                          mode: templateForm.typicalLossRange?.mode || 0,
                          high: Number(e.target.value)
                        }
                      })}
                      className="w-full bg-[#050505] border border-zinc-800 rounded px-2.5 py-1 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('quantrisk_custom_threat_scenarios');
                    setCustomItems([]);
                  }}
                  className="text-[11px] text-zinc-500 hover:text-red-400 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Custom Scenarios</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors shadow-sm"
                  >
                    Save to Threat Catalog
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
