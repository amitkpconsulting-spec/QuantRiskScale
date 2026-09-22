import React, { useState } from 'react';
import {
  Plus,
  Zap,
  X,
  Layers,
  Shield,
  Sliders,
  DollarSign,
  Clock,
  Sparkles,
  Database,
  Cloud,
  Lock,
  Truck,
  UserX,
  Bot,
  KeyRound,
  Copy,
  FileSpreadsheet
} from 'lucide-react';
import {
  FairScenario,
  FairModelBranch,
  RiskToleranceScale,
  AssetRegisterItem,
  ThreatRegisterItem,
  ThreePointEstimate
} from '../types/fair';
import { StakeholderIntakeWizard } from './StakeholderIntakeWizard';

interface NewSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newScenario: FairScenario) => void;
  assets: AssetRegisterItem[];
  threats: ThreatRegisterItem[];
  currentActiveScenario?: FairScenario;
}

const DEFAULT_RISK_TOLERANCE: RiskToleranceScale = {
  veryLowMax: 10000,
  lowMax: 100000,
  moderateMax: 1000000,
  significantMax: 5000000,
  highMax: 10000000,
  targetPercentile: 90
};

const createEmptyBranch = (): FairModelBranch => ({
  lef: {
    useDirectLef: true,
    directLef: { low: 0.2, mode: 1.0, high: 3.5, confidence: 4 },
    useDirectTef: false,
    directTef: { low: 5, mode: 15, high: 40, confidence: 4 },
    contactFrequency: { low: 10, mode: 25, high: 60, confidence: 4 },
    probabilityOfAction: { low: 0.1, mode: 0.3, high: 0.6, confidence: 4 },
    useDirectVuln: false,
    directVuln: { low: 0.05, mode: 0.15, high: 0.35, confidence: 4 },
    threatCapability: { low: 35, mode: 60, high: 85, confidence: 4 },
    resistanceStrength: { low: 50, mode: 70, high: 90, confidence: 4 }
  },
  primaryLoss: {
    productivity: { low: 5000, mode: 25000, high: 90000, confidence: 4, enabled: true },
    response: { low: 10000, mode: 40000, high: 120000, confidence: 4, enabled: true },
    replacement: { low: 0, mode: 5000, high: 20000, confidence: 4, enabled: false },
    finesAndJudgements: { low: 0, mode: 0, high: 0, confidence: 4, enabled: false },
    competitiveAdvantage: { low: 0, mode: 0, high: 0, confidence: 4, enabled: false },
    reputation: { low: 0, mode: 0, high: 0, confidence: 4, enabled: false }
  },
  secondaryLossEventFreq: { low: 10, mode: 35, high: 65, confidence: 4 },
  secondaryLoss: {
    productivity: { low: 0, mode: 0, high: 0, confidence: 4, enabled: false },
    response: { low: 15000, mode: 60000, high: 200000, confidence: 4, enabled: true },
    replacement: { low: 0, mode: 0, high: 0, confidence: 4, enabled: false },
    finesAndJudgements: { low: 25000, mode: 100000, high: 450000, confidence: 4, enabled: true },
    competitiveAdvantage: { low: 0, mode: 10000, high: 50000, confidence: 4, enabled: false },
    reputation: { low: 20000, mode: 80000, high: 300000, confidence: 4, enabled: true }
  },
  operationalLoss: {
    serviceDowntimeHours: { low: 2, mode: 8, high: 24, confidence: 4 },
    dataRecordsLoss: { low: 0.5, mode: 5, high: 25, confidence: 4 }
  }
});

interface TemplatePreset {
  id: string;
  name: string;
  category: string;
  icon: any;
  description: string;
  asset: string;
  threat: string;
  threatEffect: 'Confidentiality' | 'Integrity' | 'Availability' | 'All';
  currency: string;
  unitScale: number;
  unitLabel: string;
  simulationsCount: number;
  current: FairModelBranch;
  hasProposed: boolean;
  proposedCost: number;
  proposed: FairModelBranch;
}

const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'tpl-cloud-outage',
    name: 'Cloud Infrastructure & Kubernetes Microservices Outage',
    category: 'Cloud Infrastructure',
    icon: Cloud,
    description: 'Cascading configuration error or external DDoS attack causing high-severity customer checkout outage and database synchronization failure across multi-region clusters.',
    asset: 'Cloud Kubernetes Cluster (Production)',
    threat: 'Nation State / Market Manipulation Adversary',
    threatEffect: 'Availability',
    currency: '$',
    unitScale: 1,
    unitLabel: '$',
    simulationsCount: 10000,
    current: {
      ...createEmptyBranch(),
      lef: {
        ...createEmptyBranch().lef,
        useDirectLef: true,
        directLef: { low: 0.5, mode: 2.0, high: 5.0, confidence: 4 }
      },
      primaryLoss: {
        ...createEmptyBranch().primaryLoss,
        productivity: { low: 50000, mode: 250000, high: 800000, confidence: 4, enabled: true },
        response: { low: 20000, mode: 75000, high: 180000, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 15, mode: 40, high: 75, confidence: 4 },
      secondaryLoss: {
        ...createEmptyBranch().secondaryLoss,
        finesAndJudgements: { low: 10000, mode: 50000, high: 200000, confidence: 4, enabled: true },
        reputation: { low: 30000, mode: 150000, high: 500000, confidence: 4, enabled: true }
      }
    },
    hasProposed: true,
    proposedCost: 85000,
    proposed: {
      ...createEmptyBranch(),
      lef: {
        ...createEmptyBranch().lef,
        useDirectLef: true,
        directLef: { low: 0.1, mode: 0.4, high: 1.2, confidence: 4 }
      },
      primaryLoss: {
        ...createEmptyBranch().primaryLoss,
        productivity: { low: 10000, mode: 50000, high: 150000, confidence: 4, enabled: true },
        response: { low: 8000, mode: 25000, high: 60000, confidence: 4, enabled: true }
      }
    }
  },
  {
    id: 'tpl-ransomware-extortion',
    name: 'Enterprise Double-Extortion Ransomware & Data Exfiltration',
    category: 'Cybercrime / Ransomware',
    icon: Lock,
    description: 'Adversary gains domain admin foothold via initial access broker, steals sensitive records, and executes locker malware across corporate file shares and hypervisors.',
    asset: 'Customer PII & Health Records Store',
    threat: 'Organized Cybercrime Syndicate & Wire Fraudsters',
    threatEffect: 'All',
    currency: '$',
    unitScale: 1,
    unitLabel: '$',
    simulationsCount: 10000,
    current: {
      ...createEmptyBranch(),
      lef: {
        ...createEmptyBranch().lef,
        useDirectLef: true,
        directLef: { low: 0.1, mode: 0.8, high: 2.5, confidence: 4 }
      },
      primaryLoss: {
        ...createEmptyBranch().primaryLoss,
        productivity: { low: 100000, mode: 450000, high: 1200000, confidence: 4, enabled: true },
        response: { low: 80000, mode: 300000, high: 900000, confidence: 4, enabled: true },
        replacement: { low: 15000, mode: 60000, high: 200000, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 50, mode: 80, high: 95, confidence: 4 },
      secondaryLoss: {
        ...createEmptyBranch().secondaryLoss,
        finesAndJudgements: { low: 150000, mode: 600000, high: 2500000, confidence: 4, enabled: true },
        reputation: { low: 100000, mode: 500000, high: 1800000, confidence: 4, enabled: true },
        response: { low: 50000, mode: 200000, high: 600000, confidence: 4, enabled: true }
      }
    },
    hasProposed: true,
    proposedCost: 150000,
    proposed: {
      ...createEmptyBranch(),
      lef: {
        ...createEmptyBranch().lef,
        useDirectLef: true,
        directLef: { low: 0.02, mode: 0.15, high: 0.5, confidence: 4 }
      },
      primaryLoss: {
        ...createEmptyBranch().primaryLoss,
        productivity: { low: 20000, mode: 80000, high: 250000, confidence: 4, enabled: true },
        response: { low: 25000, mode: 90000, high: 250000, confidence: 4, enabled: true }
      }
    }
  },
  {
    id: 'tpl-supply-chain',
    name: 'Third-Party SaaS Vendor / CI-CD Supply Chain Compromise',
    category: 'Supply Chain',
    icon: Truck,
    description: 'Compromised upstream developer tool or SaaS dependency allows threat actor to inject backdoored code into production releases and exfiltrate operational keys.',
    asset: 'Cloud Kubernetes Cluster (Production)',
    threat: 'Upstream SaaS / Third-Party Vendor Supply Chain Breach',
    threatEffect: 'Integrity',
    currency: '$',
    unitScale: 1,
    unitLabel: '$',
    simulationsCount: 10000,
    current: {
      ...createEmptyBranch(),
      lef: {
        ...createEmptyBranch().lef,
        useDirectLef: true,
        directLef: { low: 0.1, mode: 0.5, high: 1.8, confidence: 4 }
      },
      primaryLoss: {
        ...createEmptyBranch().primaryLoss,
        productivity: { low: 30000, mode: 120000, high: 400000, confidence: 4, enabled: true },
        response: { low: 40000, mode: 160000, high: 500000, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 30, mode: 60, high: 85, confidence: 4 },
      secondaryLoss: {
        ...createEmptyBranch().secondaryLoss,
        finesAndJudgements: { low: 50000, mode: 200000, high: 800000, confidence: 4, enabled: true },
        reputation: { low: 40000, mode: 180000, high: 600000, confidence: 4, enabled: true }
      }
    },
    hasProposed: true,
    proposedCost: 65000,
    proposed: {
      ...createEmptyBranch(),
      lef: {
        ...createEmptyBranch().lef,
        useDirectLef: true,
        directLef: { low: 0.02, mode: 0.1, high: 0.4, confidence: 4 }
      },
      primaryLoss: {
        ...createEmptyBranch().primaryLoss,
        productivity: { low: 8000, mode: 35000, high: 100000, confidence: 4, enabled: true },
        response: { low: 10000, mode: 45000, high: 120000, confidence: 4, enabled: true }
      }
    }
  },
  {
    id: 'tpl-insider-theft',
    name: 'Privileged Insider Data Exfiltration & Intellectual Property Theft',
    category: 'Insider Threat',
    icon: UserX,
    description: 'Departing senior engineer or administrator abuses elevated database tokens to exfiltrate proprietary source code, algorithmic weights, and customer data.',
    asset: 'Proprietary Frontier Model Weights & GPU Cluster Infrastructure',
    threat: 'Privileged Malicious / Compromised Insider',
    threatEffect: 'Confidentiality',
    currency: '$',
    unitScale: 1,
    unitLabel: '$',
    simulationsCount: 10000,
    current: {
      ...createEmptyBranch(),
      lef: {
        ...createEmptyBranch().lef,
        useDirectLef: true,
        directLef: { low: 0.05, mode: 0.3, high: 1.0, confidence: 4 }
      },
      primaryLoss: {
        ...createEmptyBranch().primaryLoss,
        productivity: { low: 10000, mode: 40000, high: 100000, confidence: 4, enabled: true },
        response: { low: 50000, mode: 200000, high: 600000, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 40, mode: 75, high: 90, confidence: 4 },
      secondaryLoss: {
        ...createEmptyBranch().secondaryLoss,
        competitiveAdvantage: { low: 200000, mode: 1000000, high: 5000000, confidence: 4, enabled: true },
        finesAndJudgements: { low: 50000, mode: 250000, high: 1000000, confidence: 4, enabled: true },
        reputation: { low: 50000, mode: 300000, high: 1200000, confidence: 4, enabled: true }
      }
    },
    hasProposed: true,
    proposedCost: 95000,
    proposed: {
      ...createEmptyBranch(),
      lef: {
        ...createEmptyBranch().lef,
        useDirectLef: true,
        directLef: { low: 0.01, mode: 0.05, high: 0.2, confidence: 4 }
      },
      primaryLoss: {
        ...createEmptyBranch().primaryLoss,
        productivity: { low: 5000, mode: 15000, high: 40000, confidence: 4, enabled: true },
        response: { low: 15000, mode: 60000, high: 180000, confidence: 4, enabled: true }
      }
    }
  }
];

export const NewSimulationModal: React.FC<NewSimulationModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  assets,
  threats,
  currentActiveScenario
}) => {
  const [creationMode, setCreationMode] = useState<'guided' | 'standard'>('guided');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-cloud-outage');
  const [name, setName] = useState<string>('Cloud Infrastructure & Kubernetes Microservices Outage');
  const [description, setDescription] = useState<string>('Cascading configuration error or external DDoS attack causing high-severity customer checkout outage.');
  const [category, setCategory] = useState<string>('Cloud Infrastructure');
  const [assetName, setAssetName] = useState<string>(assets[0]?.name || 'Cloud Kubernetes Cluster (Production)');
  const [threatName, setThreatName] = useState<string>(threats[0]?.name || 'Nation State / Market Manipulation Adversary');
  const [threatEffect, setThreatEffect] = useState<'Confidentiality' | 'Integrity' | 'Availability' | 'All'>('Availability');
  const [currency, setCurrency] = useState<string>('$');
  const [unitScale, setUnitScale] = useState<number>(1);
  const [simulationsCount, setSimulationsCount] = useState<number>(10000);

  // 3-Point PERT LEF
  const [lefLow, setLefLow] = useState<number>(0.5);
  const [lefMode, setLefMode] = useState<number>(2.0);
  const [lefHigh, setLefHigh] = useState<number>(5.0);

  // Primary Loss Estimates
  const [prodLossMode, setProdLossMode] = useState<number>(250000);
  const [respLossMode, setRespLossMode] = useState<number>(75000);

  // Secondary Loss
  const [slefMode, setSlefMode] = useState<number>(40);
  const [secFinesMode, setSecFinesMode] = useState<number>(50000);
  const [secRepMode, setSecRepMode] = useState<number>(150000);

  // Proposed Safeguards
  const [hasProposed, setHasProposed] = useState<boolean>(true);
  const [proposedCost, setProposedCost] = useState<number>(85000);
  const [propLefMode, setPropLefMode] = useState<number>(0.4);
  const [propProdLossMode, setPropProdLossMode] = useState<number>(50000);

  if (!isOpen) return null;

  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    if (tplId === 'clone' && currentActiveScenario) {
      setName(`${currentActiveScenario.name} (Clone)`);
      setDescription(currentActiveScenario.description);
      setCategory(currentActiveScenario.category);
      setAssetName(currentActiveScenario.asset);
      setThreatName(currentActiveScenario.threatCommunity);
      setThreatEffect(currentActiveScenario.threatEffect);
      setCurrency(currentActiveScenario.currency);
      setUnitScale(currentActiveScenario.unitScale);
      setSimulationsCount(currentActiveScenario.simulationsCount);
      setLefLow(currentActiveScenario.current.lef.directLef.low);
      setLefMode(currentActiveScenario.current.lef.directLef.mode);
      setLefHigh(currentActiveScenario.current.lef.directLef.high);
      setProdLossMode(currentActiveScenario.current.primaryLoss.productivity.mode);
      setRespLossMode(currentActiveScenario.current.primaryLoss.response.mode);
      setSlefMode(currentActiveScenario.current.secondaryLossEventFreq.mode);
      setSecFinesMode(currentActiveScenario.current.secondaryLoss.finesAndJudgements.mode);
      setSecRepMode(currentActiveScenario.current.secondaryLoss.reputation.mode);
      setHasProposed(currentActiveScenario.hasProposed);
      setProposedCost(currentActiveScenario.proposedControlCost || 50000);
      setPropLefMode(currentActiveScenario.proposed?.lef.directLef.mode || 0.2);
      setPropProdLossMode(currentActiveScenario.proposed?.primaryLoss.productivity.mode || 20000);
      return;
    }

    if (tplId === 'blank') {
      setName('New Custom Risk Scenario');
      setDescription('Custom quantitative risk scenario modeled with Open FAIR ontology.');
      setCategory('General Security');
      setAssetName(assets[0]?.name || 'Critical Database');
      setThreatName(threats[0]?.name || 'Cybercriminal');
      setThreatEffect('Confidentiality');
      setLefLow(0.1);
      setLefMode(1.0);
      setLefHigh(3.0);
      setProdLossMode(50000);
      setRespLossMode(30000);
      setSlefMode(25);
      setSecFinesMode(20000);
      setSecRepMode(40000);
      setHasProposed(false);
      setProposedCost(30000);
      return;
    }

    const tpl = TEMPLATE_PRESETS.find(t => t.id === tplId);
    if (!tpl) return;

    setName(tpl.name);
    setDescription(tpl.description);
    setCategory(tpl.category);
    setAssetName(tpl.asset);
    setThreatName(tpl.threat);
    setThreatEffect(tpl.threatEffect);
    setCurrency(tpl.currency);
    setUnitScale(tpl.unitScale);
    setSimulationsCount(tpl.simulationsCount);
    setLefLow(tpl.current.lef.directLef.low);
    setLefMode(tpl.current.lef.directLef.mode);
    setLefHigh(tpl.current.lef.directLef.high);
    setProdLossMode(tpl.current.primaryLoss.productivity.mode);
    setRespLossMode(tpl.current.primaryLoss.response.mode);
    setSlefMode(tpl.current.secondaryLossEventFreq.mode);
    setSecFinesMode(tpl.current.secondaryLoss.finesAndJudgements.mode);
    setSecRepMode(tpl.current.secondaryLoss.reputation.mode);
    setHasProposed(tpl.hasProposed);
    setProposedCost(tpl.proposedCost);
    setPropLefMode(tpl.proposed.lef.directLef.mode);
    setPropProdLossMode(tpl.proposed.primaryLoss.productivity.mode);
  };

  const handleCreateAndSimulate = () => {
    const now = new Date().toISOString();
    const newId = `scenario-${Date.now()}`;

    const currentBranch: FairModelBranch = createEmptyBranch();
    currentBranch.lef.useDirectLef = true;
    currentBranch.lef.directLef = {
      low: Math.max(0.001, lefLow),
      mode: Math.max(lefLow, lefMode),
      high: Math.max(lefMode, lefHigh),
      confidence: 4
    };

    currentBranch.primaryLoss.productivity = {
      low: Math.round(prodLossMode * 0.2),
      mode: prodLossMode,
      high: Math.round(prodLossMode * 3.0),
      confidence: 4,
      enabled: prodLossMode > 0
    };

    currentBranch.primaryLoss.response = {
      low: Math.round(respLossMode * 0.25),
      mode: respLossMode,
      high: Math.round(respLossMode * 2.5),
      confidence: 4,
      enabled: respLossMode > 0
    };

    currentBranch.secondaryLossEventFreq = {
      low: Math.max(1, Math.round(slefMode * 0.4)),
      mode: slefMode,
      high: Math.min(100, Math.round(slefMode * 1.8)),
      confidence: 4
    };

    currentBranch.secondaryLoss.finesAndJudgements = {
      low: Math.round(secFinesMode * 0.2),
      mode: secFinesMode,
      high: Math.round(secFinesMode * 3.5),
      confidence: 4,
      enabled: secFinesMode > 0
    };

    currentBranch.secondaryLoss.reputation = {
      low: Math.round(secRepMode * 0.2),
      mode: secRepMode,
      high: Math.round(secRepMode * 3.0),
      confidence: 4,
      enabled: secRepMode > 0
    };

    const proposedBranch: FairModelBranch = createEmptyBranch();
    proposedBranch.lef.useDirectLef = true;
    proposedBranch.lef.directLef = {
      low: Math.max(0.001, propLefMode * 0.25),
      mode: propLefMode,
      high: Math.max(propLefMode * 1.1, propLefMode * 2.5),
      confidence: 4
    };

    proposedBranch.primaryLoss.productivity = {
      low: Math.round(propProdLossMode * 0.2),
      mode: propProdLossMode,
      high: Math.round(propProdLossMode * 2.5),
      confidence: 4,
      enabled: propProdLossMode > 0
    };

    const newScenario: FairScenario = {
      id: newId,
      name: name.trim() || 'New Open FAIR Simulation Scenario',
      description: description.trim() || 'Custom quantitative risk scenario modeled with Open FAIR ontology.',
      asset: assetName,
      threatCommunity: threatName,
      threatEffect,
      status: 'Approved',
      category: category.trim() || 'General Risk',
      currency,
      unitScale,
      unitLabel: unitScale === 1000000 ? `${currency}M` : unitScale === 1000 ? `${currency}k` : currency,
      simulationsCount,
      current: currentBranch,
      proposed: proposedBranch,
      hasProposed,
      proposedControlCost: hasProposed ? proposedCost : 0,
      riskTolerance: DEFAULT_RISK_TOLERANCE,
      createdAt: now,
      updatedAt: now
    };

    onCreated(newScenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="bg-[#09090b] border border-zinc-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/90 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/40">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-display tracking-tight text-white uppercase flex items-center space-x-2">
                <span>Add New Risk Scenario Simulation</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700/50 font-mono">Open FAIR™</span>
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Configure ontology parameters and execute Monte Carlo quantified analysis
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

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-zinc-800 bg-[#070709] px-6 font-mono text-xs shrink-0">
          <button
            onClick={() => setCreationMode('guided')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              creationMode === 'guided'
                ? 'border-cyan-400 text-white bg-zinc-900/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Stakeholder Guided Intake (Non-Math)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              3 Steps
            </span>
          </button>
          <button
            onClick={() => setCreationMode('standard')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              creationMode === 'standard'
                ? 'border-cyan-400 text-white bg-zinc-900/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Pre-Calibrated Archetypes &amp; Parametric Lab</span>
          </button>
        </div>

        {creationMode === 'guided' ? (
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <StakeholderIntakeWizard
              onApplyScenario={(newSc) => {
                onCreated(newSc);
                onClose();
              }}
              onCancel={onClose}
              currency={currency}
              initialAsset={assets[0]?.name}
              initialThreat={threats[0]?.name}
            />
          </div>
        ) : (
          <>
            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto font-mono text-xs custom-scrollbar">
          {/* Archetype / Template Selector */}
          <div>
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>1. Select Scenario Archetype or Clone</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-mono font-normal">Pre-calibrated industry baselines</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATE_PRESETS.map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-white ring-1 ring-cyan-500/40 shadow-md shadow-cyan-950/50'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-900/80 text-cyan-300' : 'bg-zinc-800 text-zinc-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold font-sans line-clamp-1">{tpl.name.split(':')[0] || tpl.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">{tpl.description}</span>
                  </button>
                );
              })}

              {/* Clone Active Option */}
              {currentActiveScenario && (
                <button
                  onClick={() => handleSelectTemplate('clone')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedTemplateId === 'clone'
                      ? 'bg-cyan-950/60 border-cyan-500 text-white ring-1 ring-cyan-500/40 shadow-md'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="p-1.5 rounded-lg bg-zinc-800 text-amber-400">
                      <Copy className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold font-sans line-clamp-1">Clone Active</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                    Duplicate: {currentActiveScenario.name}
                  </span>
                </button>
              )}

              {/* Blank Custom Option */}
              <button
                onClick={() => handleSelectTemplate('blank')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedTemplateId === 'blank'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white ring-1 ring-cyan-500/40 shadow-md'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold font-sans line-clamp-1">Custom Blank</span>
                </div>
                <span className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                  Start fresh with clean ontology parameters
                </span>
              </button>
            </div>
          </div>

          {/* Form Fields: Scope & Identification */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3 font-sans">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>2. Loss Scenario Scoping & Scope Boundary</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1 font-mono">Scenario Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 font-sans"
                  placeholder="e.g. Critical API Gateway DDoS & SLA Violation"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1 font-mono">Category / Sector</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 font-sans"
                  placeholder="e.g. Cloud Security / FinTech"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1 font-mono">Scenario Description & Context</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 font-sans resize-none"
                placeholder="Describe how the threat agent breaches the asset and observable loss event..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1 font-mono">Asset Under Evaluation</label>
                <select
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                  <option value="Custom Infrastructure Asset">Custom Asset...</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1 font-mono">Threat Community</label>
                <select
                  value={threatName}
                  onChange={(e) => setThreatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                >
                  {threats.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                  <option value="Custom Advanced Threat Group">Custom Threat Group...</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1 font-mono">Threat Impact Vector</label>
                <select
                  value={threatEffect}
                  onChange={(e) => setThreatEffect(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                >
                  <option value="Availability">Availability (Outage/Downtime)</option>
                  <option value="Confidentiality">Confidentiality (Data Leak)</option>
                  <option value="Integrity">Integrity (Tampering/Poisoning)</option>
                  <option value="All">All Vectors (Full Spectrum)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calibrated 3-Point Estimates Grid */}
          <div className="space-y-3 font-mono">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>3. Open FAIR Beta-PERT Parameters (3-Point Estimates)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LEF Card */}
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white font-sans">
                  <span>Loss Event Frequency (LEF)</span>
                  <span className="text-cyan-400 font-mono text-[11px]">Events / Year</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">Low (Min)</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.001"
                      value={lefLow}
                      onChange={(e) => setLefLow(parseFloat(e.target.value) || 0.01)}
                      className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">Mode (Likely)</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0.01"
                      value={lefMode}
                      onChange={(e) => setLefMode(parseFloat(e.target.value) || 0.1)}
                      className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-cyan-300 font-bold font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">High (Max)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={lefHigh}
                      onChange={(e) => setLefHigh(parseFloat(e.target.value) || 1.0)}
                      className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Primary Loss Card */}
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white font-sans">
                  <span>Primary Loss per Event ($)</span>
                  <span className="text-cyan-400 font-mono text-[11px]">Direct Impact</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">Productivity Mode ($)</span>
                    <input
                      type="number"
                      step="5000"
                      min="0"
                      value={prodLossMode}
                      onChange={(e) => setProdLossMode(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">Response Mode ($)</span>
                    <input
                      type="number"
                      step="5000"
                      min="0"
                      value={respLossMode}
                      onChange={(e) => setRespLossMode(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Probability Card */}
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white font-sans">
                  <span>Secondary Loss Probability (SLEF)</span>
                  <span className="text-amber-400 font-mono text-[11px]">Fallout Chance</span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Probability that event triggers secondary reaction:</span>
                    <span className="text-white font-bold">{slefMode}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={slefMode}
                    onChange={(e) => setSlefMode(parseInt(e.target.value) || 1)}
                    className="w-full accent-amber-400"
                  />
                </div>
              </div>

              {/* Secondary Loss Magnitude Card */}
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white font-sans">
                  <span>Secondary Loss ($ Mode)</span>
                  <span className="text-amber-400 font-mono text-[11px]">Fines &amp; Reputation</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">Fines &amp; Legal ($)</span>
                    <input
                      type="number"
                      step="10000"
                      min="0"
                      value={secFinesMode}
                      onChange={(e) => setSecFinesMode(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">Reputation Loss ($)</span>
                    <input
                      type="number"
                      step="10000"
                      min="0"
                      value={secRepMode}
                      onChange={(e) => setSecRepMode(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proposed Safeguards / What-If Options */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">4. What-If Proposed Safeguard Controls (Residual Risk)</span>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <span className="text-xs text-zinc-400 font-mono">Model Proposed Safeguards:</span>
                <input
                  type="checkbox"
                  checked={hasProposed}
                  onChange={(e) => setHasProposed(e.target.checked)}
                  className="rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0 w-4 h-4"
                />
              </label>
            </div>

            {hasProposed && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800/80 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-1">Annual Safeguard Cost ($)</span>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    value={proposedCost}
                    onChange={(e) => setProposedCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-emerald-300 font-bold font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-1">Residual LEF Mode (events/yr)</span>
                  <input
                    type="number"
                    step="0.05"
                    min="0.001"
                    value={propLefMode}
                    onChange={(e) => setPropLefMode(parseFloat(e.target.value) || 0.05)}
                    className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-1">Residual Prod. Loss ($)</span>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    value={propProdLossMode}
                    onChange={(e) => setPropProdLossMode(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Monte Carlo Simulation Settings */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300">
            <span className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Monte Carlo Trial Iterations:</span>
            </span>
            <div className="flex items-center space-x-2">
              {[10000, 25000, 50000, 100000].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => setSimulationsCount(cnt)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    simulationsCount === cnt
                      ? 'bg-cyan-500 text-black shadow'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {(cnt / 1000)}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/90 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white text-xs font-mono font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleCreateAndSimulate}
            className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-display font-black text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-lg shadow-cyan-950/40 hover:scale-[1.02] active:scale-98"
          >
            <Zap className="w-4 h-4" />
            <span>Create &amp; Run Monte Carlo Simulation</span>
          </button>
        </div>
      </>
    )}
  </div>
</div>
  );
};
