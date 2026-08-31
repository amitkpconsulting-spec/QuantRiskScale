import { FairScenario, AssetRegisterItem, ThreatRegisterItem } from '../types/fair';

export const DEFAULT_ASSETS: AssetRegisterItem[] = [
  {
    id: 'asset-ai-copilot',
    name: 'Enterprise Copilot & Tool Integration Gateway (MCP / Mail / CRM)',
    category: 'AI Models & IP',
    estimatedValue: 45000000,
    criticality: 'Mission Critical',
    owner: 'Chief Information Officer & Head of Workplace AI',
    description: 'Enterprise generative AI assistant integrated with Outlook, Salesforce CRM, corporate Google Drive, and internal Model Context Protocol (MCP) tool execution APIs.'
  },
  {
    id: 'asset-ai-agentic-workflow',
    name: 'Autonomous Multi-Agent Workflow Engine & Entra Agent IDs',
    category: 'AI Models & IP',
    estimatedValue: 60000000,
    criticality: 'Mission Critical',
    owner: 'Head of Enterprise Automation & CISO',
    description: 'Multi-agent orchestration cluster (CrewAI/LangGraph) running autonomous agents with Microsoft Entra Non-Human Identities (NHI) executing automated payments and code deploys.'
  },
  {
    id: 'asset-ai-1',
    name: 'Proprietary Frontier Model Weights & GPU Cluster Infrastructure',
    category: 'AI Models & IP',
    estimatedValue: 120000000,
    criticality: 'Mission Critical',
    owner: 'Chief Technology Officer & Head of AI Safety',
    description: 'Proprietary 70B+ parameter foundational model weights, specialized multi-modal training checkpoints, and a 2,048 H100 GPU high-performance compute training cluster.'
  },
  {
    id: 'asset-ai-rag-store',
    name: 'Enterprise Vector Database & Knowledge Retrieval Index (RAG)',
    category: 'Critical Database',
    estimatedValue: 35000000,
    criticality: 'Mission Critical',
    owner: 'Chief Data Officer & VP Knowledge Systems',
    description: 'Pinecone/Milvus vector index embedding 4.5M confidential documents, intellectual property, board minutes, and customer contracts for retrieval-augmented generation.'
  },
  {
    id: 'asset-bank-1',
    name: 'Core Banking Ledger & SWIFT Payment Terminal',
    category: 'Financial Infrastructure',
    estimatedValue: 85000000,
    criticality: 'Mission Critical',
    owner: 'Chief Information Security Officer & VP Treasury',
    description: 'Real-time gross settlement (RTGS) core transactional database and SWIFT Alliance gateway handling $45M/day in domestic and cross-border wire transfers.'
  },
  {
    id: 'asset-trade-1',
    name: 'Ultra-Low Latency Trading Gateway & Algo Engine (FIX/ITCH)',
    category: 'Trading Engine',
    estimatedValue: 50000000,
    criticality: 'Mission Critical',
    owner: 'Head of Quantitative Technology',
    description: 'Sub-millisecond order execution gateway, FIX protocol connectors, and automated market-making algorithms managing proprietary capital and institutional liquidity.'
  },
  {
    id: 'asset-retail-1',
    name: 'Omnichannel Checkout Platform & Store POS Terminal Fleet',
    category: 'Retail POS & E-Commerce',
    estimatedValue: 35000000,
    criticality: 'Mission Critical',
    owner: 'VP of Digital Commerce & Store Ops',
    description: 'High-volume web checkout storefront processing 1.8M transactions/month alongside 1,200 physical in-store payment terminals across 450 retail locations.'
  },
  {
    id: 'asset-5',
    name: 'Customer PII & Health Records Store',
    category: 'Critical Database',
    estimatedValue: 25000000,
    criticality: 'High',
    owner: 'Chief Data Officer',
    description: 'PostgreSQL cluster housing 1.2M customer health records, payment tokens, and identity credentials.'
  },
  {
    id: 'asset-6',
    name: 'Cloud Kubernetes Cluster (Production)',
    category: 'Internal Infrastructure',
    estimatedValue: 15000000,
    criticality: 'High',
    owner: 'Head of Infrastructure',
    description: 'Production container microservices running customer checkout, inventory, and fulfillment.'
  }
];

export const DEFAULT_THREATS: ThreatRegisterItem[] = [
  {
    id: 'threat-ai-prompt-injector',
    name: 'Adversarial Prompt Engineer & Jailbreak Syndicate (IPI Exploiter)',
    category: 'Cybercriminal (Prompt Injection)',
    capabilityLevel: 'High (70-90)',
    motivation: 'Data Exfiltration & Financial Fraud',
    typicalContactFrequency: '25 - 100 injection attempts/year'
  },
  {
    id: 'threat-ai-agentic-rogue',
    name: 'Rogue Autonomous Agent & Multi-Agent Swarm Infiltrator',
    category: 'Agentic AI Threat',
    capabilityLevel: 'Elite (80-95)',
    motivation: 'Workflow Subversion & Privilege Escalation',
    typicalContactFrequency: '10 - 40 events/year'
  },
  {
    id: 'threat-ai-supply-chain',
    name: 'Upstream Poisoned Agentic Artifact & Prompt Template Maintainer',
    category: 'AI Supply Chain',
    capabilityLevel: 'High (65-88)',
    motivation: 'Persistent Backdoor & RCE',
    typicalContactFrequency: '5 - 20 supply-chain attempts/year'
  },
  {
    id: 'threat-ai-1',
    name: 'Nation-State Advanced Persistent Threat (APT) / AI Espionage',
    category: 'Nation State / Industrial Espionage',
    capabilityLevel: 'Elite (90-100)',
    motivation: 'IP Theft & Strategic Advantage',
    typicalContactFrequency: '5 - 25 targeted intrusions/year'
  },
  {
    id: 'threat-bank-1',
    name: 'Organized Cybercrime Syndicate & Wire Fraudsters',
    category: 'Cybercriminal (Banking)',
    capabilityLevel: 'High (70-90)',
    motivation: 'Financial',
    typicalContactFrequency: '20 - 80 campaigns/year'
  },
  {
    id: 'threat-trade-1',
    name: 'State-Sponsored / Market Manipulation Adversary',
    category: 'Nation State / Market Manipulation',
    capabilityLevel: 'Elite (85-100)',
    motivation: 'Market Disruption & Financial',
    typicalContactFrequency: '10 - 40 campaigns/year'
  },
  {
    id: 'threat-retail-1',
    name: 'Magecart & POS Skimming Cybercrime Syndicate',
    category: 'Cybercriminal (Retail Card Fraud)',
    capabilityLevel: 'Medium-High (55-80)',
    motivation: 'Financial (Card Resale)',
    typicalContactFrequency: '30 - 120 attempts/year'
  },
  {
    id: 'threat-insider',
    name: 'Privileged Malicious / Compromised Insider',
    category: 'Malicious Insider',
    capabilityLevel: 'Medium (30-65)',
    motivation: 'Financial / Revenge',
    typicalContactFrequency: '0.2 - 2 incidents/year'
  },
  {
    id: 'threat-vendor',
    name: 'Upstream SaaS / Third-Party Vendor Supply Chain Breach',
    category: 'Third-Party Vendor',
    capabilityLevel: 'High (60-85)',
    motivation: 'Data Theft & Ransom',
    typicalContactFrequency: '2 - 10 events/year'
  }
];

export const DEFAULT_SCENARIOS: FairScenario[] = [
  // 1. BANK SCENARIO
  {
    id: 'scenario-bank-wire-fraud-ransomware',
    name: 'Bank: SWIFT Wire Interception & Core Banking Ransomware',
    description: 'An organized financial cybercrime syndicate launches targeted spear-phishing campaigns against treasury workstations, attempting to tamper with SWIFT payment messages and simultaneously detonate double-extortion ransomware across the core banking ledger database.',
    asset: 'Core Banking Ledger & SWIFT Payment Terminal',
    threatCommunity: 'Organized Cybercrime Syndicate & Wire Fraudsters',
    threatEffect: 'All',
    status: 'Approved',
    category: 'Banking & Financial Services',
    currency: '$',
    unitScale: 1000, // $k (Thousands)
    unitLabel: '$k (Thousands)',
    simulationsCount: 10000,
    randomSeed: 101,
    proposedControlCost: 650, // $650k/year for Hardware Security Modules + FIDO2 + Immutable Ledger Vaults

    riskTolerance: {
      veryLowMax: 200,     // < $200k
      lowMax: 1000,        // $200k - $1M
      moderateMax: 3500,   // $1M - $3.5M
      significantMax: 8000,// $3.5M - $8.0M
      highMax: 15000,      // $8.0M - $15.0M (Severe is > $15M)
      targetPercentile: 90
    },

    current: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.5, mode: 1.8, high: 4.5, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 15, mode: 40, high: 90, confidence: 4 },
        contactFrequency: { low: 2, mode: 5, high: 12, confidence: 4 },
        probabilityOfAction: { low: 0.35, mode: 0.65, high: 0.9, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.25, mode: 0.45, high: 0.7, confidence: 4 },
        threatCapability: { low: 65, mode: 80, high: 92, confidence: 4 },
        resistanceStrength: { low: 30, mode: 50, high: 68, confidence: 4 }
      },
      primaryLoss: {
        productivity: { low: 250, mode: 750, high: 2200, confidence: 4, enabled: true },
        response: { low: 300, mode: 850, high: 2500, confidence: 4, enabled: true },
        replacement: { low: 80, mode: 250, high: 800, confidence: 4, enabled: true },
        finesAndJudgements: { low: 100, mode: 400, high: 1500, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 50, mode: 200, high: 800, confidence: 4, enabled: true },
        reputation: { low: 200, mode: 600, high: 2000, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 40, mode: 75, high: 95, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 50, mode: 150, high: 500, confidence: 4, enabled: true },
        response: { low: 150, mode: 500, high: 1400, confidence: 4, enabled: true },
        replacement: { low: 0, mode: 50, high: 200, confidence: 4, enabled: true },
        finesAndJudgements: { low: 800, mode: 2800, high: 8500, confidence: 4, enabled: true }, // OCC, Fed, FinCEN & GDPR regulatory sanctions
        competitiveAdvantage: { low: 300, mode: 1100, high: 3500, confidence: 4, enabled: true }, // Liquidity deposit churn
        reputation: { low: 500, mode: 1800, high: 5000, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 8, mode: 36, high: 120, confidence: 4 },
        dataRecordsLoss: { low: 20, mode: 120, high: 600, confidence: 4 }
      }
    },

    hasProposed: true,
    proposed: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.02, mode: 0.15, high: 0.6, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 5, mode: 15, high: 35, confidence: 4 },
        contactFrequency: { low: 10, mode: 25, high: 50, confidence: 4 },
        probabilityOfAction: { low: 0.15, mode: 0.35, high: 0.6, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.02, mode: 0.08, high: 0.2, confidence: 4 },
        threatCapability: { low: 65, mode: 80, high: 92, confidence: 4 },
        resistanceStrength: { low: 78, mode: 90, high: 98, confidence: 4 } // Hardware Security Modules, FIDO2, Out-of-band wire authorization
      },
      primaryLoss: {
        productivity: { low: 40, mode: 120, high: 350, confidence: 4, enabled: true },
        response: { low: 80, mode: 200, high: 550, confidence: 4, enabled: true },
        replacement: { low: 15, mode: 50, high: 150, confidence: 4, enabled: true },
        finesAndJudgements: { low: 0, mode: 50, high: 200, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 0, mode: 20, high: 80, confidence: 4, enabled: true },
        reputation: { low: 25, mode: 80, high: 250, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 5, mode: 15, high: 30, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 0, mode: 20, high: 80, confidence: 4, enabled: true },
        response: { low: 25, mode: 80, high: 250, confidence: 4, enabled: true },
        replacement: { low: 0, mode: 10, high: 40, confidence: 4, enabled: true },
        finesAndJudgements: { low: 100, mode: 350, high: 1200, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 50, mode: 180, high: 600, confidence: 4, enabled: true },
        reputation: { low: 80, mode: 250, high: 900, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 0.5, mode: 2, high: 8, confidence: 4 },
        dataRecordsLoss: { low: 0, mode: 2, high: 25, confidence: 4 }
      }
    },

    createdAt: '2026-08-20T10:00:00.000Z',
    updatedAt: '2026-08-30T09:30:00.000Z'
  },

  // 2. TRADE SCENARIO
  {
    id: 'scenario-trade-algo-execution-ddos',
    name: 'Trade: Brokerage Gateway DDoS & Algo Execution Slippage',
    description: 'A sophisticated market-manipulation adversary unleashes a volumetric BGP and protocol-state exhaustion DDoS targeting low-latency FIX protocol trade execution gateways during high-volatility market opening bell, causing dropped limit orders, market-making inventory de-hedging, and massive trade execution slippage.',
    asset: 'Ultra-Low Latency Trading Gateway & Algo Engine (FIX/ITCH)',
    threatCommunity: 'State-Sponsored / Market Manipulation Adversary',
    threatEffect: 'Availability',
    status: 'Approved',
    category: 'Capital Markets & Trading',
    currency: '$',
    unitScale: 1000,
    unitLabel: '$k (Thousands)',
    simulationsCount: 10000,
    randomSeed: 202,
    proposedControlCost: 400, // $400k/year for Multi-Region Anycast Scrubbing + FPGA Circuit Breakers

    riskTolerance: {
      veryLowMax: 150,
      lowMax: 800,
      moderateMax: 2500,
      significantMax: 6000,
      highMax: 12000,
      targetPercentile: 90
    },

    current: {
      lef: {
        useDirectLef: false,
        directLef: { low: 1.0, mode: 3.2, high: 7.0, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 10, mode: 28, high: 65, confidence: 4 },
        contactFrequency: { low: 0.6, mode: 1.8, high: 4.5, confidence: 4 },
        probabilityOfAction: { low: 0.3, mode: 0.55, high: 0.8, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.35, mode: 0.6, high: 0.85, confidence: 4 },
        threatCapability: { low: 70, mode: 85, high: 96, confidence: 4 },
        resistanceStrength: { low: 25, mode: 45, high: 62, confidence: 4 }
      },
      primaryLoss: {
        productivity: { low: 400, mode: 1200, high: 3800, confidence: 4, enabled: true }, // Order book slippage & missed arbitrage
        response: { low: 150, mode: 450, high: 1400, confidence: 4, enabled: true },
        replacement: { low: 50, mode: 150, high: 450, confidence: 4, enabled: true },
        finesAndJudgements: { low: 150, mode: 500, high: 1800, confidence: 4, enabled: true }, // SEC / FINRA trade reporting & best-execution violations
        competitiveAdvantage: { low: 200, mode: 700, high: 2200, confidence: 4, enabled: true },
        reputation: { low: 300, mode: 900, high: 2800, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 30, mode: 60, high: 85, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 0, mode: 100, high: 400, confidence: 4, enabled: true },
        response: { low: 100, mode: 350, high: 1100, confidence: 4, enabled: true },
        replacement: { low: 0, mode: 50, high: 150, confidence: 4, enabled: true },
        finesAndJudgements: { low: 500, mode: 1800, high: 5500, confidence: 4, enabled: true }, // Client arbitration claims & CFTC fines
        competitiveAdvantage: { low: 400, mode: 1400, high: 4200, confidence: 4, enabled: true }, // Institutional LP order flow departure
        reputation: { low: 450, mode: 1500, high: 4800, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 0.5, mode: 3.5, high: 18, confidence: 4 },
        dataRecordsLoss: { low: 0, mode: 0, high: 10, confidence: 4 }
      }
    },

    hasProposed: true,
    proposed: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.05, mode: 0.3, high: 0.9, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 2, mode: 8, high: 20, confidence: 4 },
        contactFrequency: { low: 5, mode: 15, high: 30, confidence: 4 },
        probabilityOfAction: { low: 0.15, mode: 0.3, high: 0.5, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.04, mode: 0.12, high: 0.25, confidence: 4 },
        threatCapability: { low: 70, mode: 85, high: 96, confidence: 4 },
        resistanceStrength: { low: 75, mode: 88, high: 97, confidence: 4 } // BGP Anycast scrubbing, FPGA hardware kill-switch, multi-exchange cross-connect
      },
      primaryLoss: {
        productivity: { low: 50, mode: 150, high: 450, confidence: 4, enabled: true },
        response: { low: 30, mode: 90, high: 280, confidence: 4, enabled: true },
        replacement: { low: 10, mode: 30, high: 90, confidence: 4, enabled: true },
        finesAndJudgements: { low: 0, mode: 40, high: 150, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 20, mode: 60, high: 200, confidence: 4, enabled: true },
        reputation: { low: 30, mode: 90, high: 300, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 5, mode: 12, high: 25, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 0, mode: 15, high: 60, confidence: 4, enabled: true },
        response: { low: 20, mode: 60, high: 180, confidence: 4, enabled: true },
        replacement: { low: 0, mode: 10, high: 30, confidence: 4, enabled: true },
        finesAndJudgements: { low: 50, mode: 200, high: 700, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 40, mode: 150, high: 500, confidence: 4, enabled: true },
        reputation: { low: 50, mode: 180, high: 600, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 0.05, mode: 0.2, high: 1.0, confidence: 4 },
        dataRecordsLoss: { low: 0, mode: 0, high: 2, confidence: 4 }
      }
    },

    createdAt: '2026-08-22T12:00:00.000Z',
    updatedAt: '2026-08-30T09:35:00.000Z'
  },

  // 3. RETAIL SCENARIO
  {
    id: 'scenario-retail-pos-magecart-breach',
    name: 'Retail: E-Commerce Checkout Skimming & POS Fleet Breach',
    description: 'A cybercrime cartel executes a dual Magecart and Point-of-Sale (POS) campaign: injecting malicious JavaScript scrapers via compromised third-party web analytics tags on the e-commerce checkout page, while pivoting into physical store controller networks to harvest payment card track-2 data across 1,200 store POS pin-pads.',
    asset: 'Omnichannel Checkout Platform & Store POS Terminal Fleet',
    threatCommunity: 'Magecart & POS Skimming Cybercrime Syndicate',
    threatEffect: 'Confidentiality',
    status: 'Approved',
    category: 'Retail & E-Commerce',
    currency: '$',
    unitScale: 1000,
    unitLabel: '$k (Thousands)',
    simulationsCount: 10000,
    randomSeed: 303,
    proposedControlCost: 320, // $320k/year for CSP/SRI automation + P2PE hardware pin-pads + FIM

    riskTolerance: {
      veryLowMax: 100,
      lowMax: 600,
      moderateMax: 2000,
      significantMax: 5000,
      highMax: 10000,
      targetPercentile: 90
    },

    current: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.8, mode: 2.5, high: 5.5, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 20, mode: 55, high: 120, confidence: 4 },
        contactFrequency: { low: 0.4, mode: 1.2, high: 3.2, confidence: 4 },
        probabilityOfAction: { low: 0.25, mode: 0.5, high: 0.75, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.25, mode: 0.5, high: 0.75, confidence: 4 },
        threatCapability: { low: 50, mode: 72, high: 88, confidence: 4 },
        resistanceStrength: { low: 20, mode: 42, high: 58, confidence: 4 }
      },
      primaryLoss: {
        productivity: { low: 120, mode: 380, high: 1100, confidence: 4, enabled: true },
        response: { low: 200, mode: 650, high: 1900, confidence: 4, enabled: true }, // Forensic PFI audit & breach notification
        replacement: { low: 150, mode: 450, high: 1300, confidence: 4, enabled: true }, // POS hardware re-imaging & card reissuance subsidy
        finesAndJudgements: { low: 80, mode: 300, high: 1000, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 30, mode: 120, high: 450, confidence: 4, enabled: true },
        reputation: { low: 180, mode: 550, high: 1600, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 50, mode: 80, high: 98, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 20, mode: 80, high: 250, confidence: 4, enabled: true },
        response: { low: 120, mode: 400, high: 1200, confidence: 4, enabled: true },
        replacement: { low: 50, mode: 180, high: 600, confidence: 4, enabled: true },
        finesAndJudgements: { low: 600, mode: 2200, high: 6500, confidence: 4, enabled: true }, // Visa/Mastercard Card Brand assessments & CCPA/GDPR penalties
        competitiveAdvantage: { low: 150, mode: 600, high: 1900, confidence: 4, enabled: true },
        reputation: { low: 350, mode: 1200, high: 3800, confidence: 4, enabled: true } // Shopper trust deficit & loyalty card drop
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 2, mode: 12, high: 48, confidence: 4 },
        dataRecordsLoss: { low: 80, mode: 450, high: 1800, confidence: 4 } // in thousands of cards
      }
    },

    hasProposed: true,
    proposed: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.05, mode: 0.2, high: 0.7, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 5, mode: 15, high: 35, confidence: 4 },
        contactFrequency: { low: 10, mode: 25, high: 50, confidence: 4 },
        probabilityOfAction: { low: 0.15, mode: 0.3, high: 0.5, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.03, mode: 0.1, high: 0.22, confidence: 4 },
        threatCapability: { low: 50, mode: 72, high: 88, confidence: 4 },
        resistanceStrength: { low: 72, mode: 88, high: 96, confidence: 4 } // Subresource Integrity, CSP headers, P2PE hardware tokenization
      },
      primaryLoss: {
        productivity: { low: 20, mode: 60, high: 180, confidence: 4, enabled: true },
        response: { low: 40, mode: 120, high: 350, confidence: 4, enabled: true },
        replacement: { low: 20, mode: 60, high: 180, confidence: 4, enabled: true },
        finesAndJudgements: { low: 0, mode: 30, high: 120, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 0, mode: 15, high: 60, confidence: 4, enabled: true },
        reputation: { low: 20, mode: 70, high: 220, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 8, mode: 20, high: 40, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 0, mode: 10, high: 40, confidence: 4, enabled: true },
        response: { low: 20, mode: 70, high: 220, confidence: 4, enabled: true },
        replacement: { low: 5, mode: 20, high: 80, confidence: 4, enabled: true },
        finesAndJudgements: { low: 60, mode: 250, high: 850, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 20, mode: 90, high: 300, confidence: 4, enabled: true },
        reputation: { low: 40, mode: 160, high: 550, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 0.2, mode: 1.0, high: 4.0, confidence: 4 },
        dataRecordsLoss: { low: 0, mode: 5, high: 40, confidence: 4 }
      }
    },

    createdAt: '2026-08-25T14:00:00.000Z',
    updatedAt: '2026-08-30T09:40:00.000Z'
  },

  // 4. AI COMPANY SCENARIO
  {
    id: 'scenario-ai-weights-exfiltration-poisoning',
    name: 'AI Company: Model Weights Exfiltration & Dataset Poisoning',
    description: 'A nation-state advanced persistent threat (APT) or malicious internal researcher targets a frontier AI laboratory: compromising orchestration cluster service accounts to download unencrypted 70B parameter foundational model weights and subtly poisoning RLHF fine-tuning datasets to introduce undetectable backdoor trigger behaviors.',
    asset: 'Proprietary Frontier Model Weights & GPU Cluster Infrastructure',
    threatCommunity: 'Nation-State Advanced Persistent Threat (APT) / AI Espionage',
    threatEffect: 'Integrity',
    status: 'Approved',
    category: 'AI & Frontier Technology',
    currency: '$',
    unitScale: 1000,
    unitLabel: '$k (Thousands)',
    simulationsCount: 10000,
    randomSeed: 404,
    proposedControlCost: 850, // $850k/year for Nitro Enclaves + Confidential GPUs + Cryptographic Dataset Provenance

    riskTolerance: {
      veryLowMax: 250,
      lowMax: 1200,
      moderateMax: 4000,
      significantMax: 10000,
      highMax: 20000,
      targetPercentile: 90
    },

    current: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.4, mode: 1.5, high: 3.8, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 8, mode: 22, high: 50, confidence: 4 },
        contactFrequency: { low: 1.2, mode: 3.5, high: 8, confidence: 4 },
        probabilityOfAction: { low: 0.4, mode: 0.7, high: 0.9, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.3, mode: 0.55, high: 0.8, confidence: 4 },
        threatCapability: { low: 78, mode: 92, high: 99, confidence: 4 },
        resistanceStrength: { low: 25, mode: 48, high: 65, confidence: 4 }
      },
      primaryLoss: {
        productivity: { low: 500, mode: 1800, high: 5500, confidence: 4, enabled: true }, // GPU compute retraining sunk cost ($20M+ cluster time)
        response: { low: 350, mode: 1100, high: 3200, confidence: 4, enabled: true }, // Forensic model sanitization & red-teaming
        replacement: { low: 200, mode: 800, high: 2500, confidence: 4, enabled: true },
        finesAndJudgements: { low: 100, mode: 500, high: 2000, confidence: 4, enabled: true }, // AI Act & safety audit compliance fines
        competitiveAdvantage: { low: 800, mode: 3200, high: 9500, confidence: 4, enabled: true }, // Catastrophic IP loss to state/rival lab
        reputation: { low: 400, mode: 1500, high: 4500, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 45, mode: 78, high: 95, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 100, mode: 400, high: 1200, confidence: 4, enabled: true },
        response: { low: 250, mode: 850, high: 2600, confidence: 4, enabled: true },
        replacement: { low: 100, mode: 350, high: 1100, confidence: 4, enabled: true },
        finesAndJudgements: { low: 1000, mode: 3800, high: 11000, confidence: 4, enabled: true }, // FTC & EU AI Safety Directive penalties
        competitiveAdvantage: { low: 1200, mode: 4500, high: 14000, confidence: 4, enabled: true }, // Enterprise customer contract cancellations
        reputation: { low: 800, mode: 2900, high: 8800, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 12, mode: 72, high: 240, confidence: 4 },
        dataRecordsLoss: { low: 50, mode: 300, high: 1500, confidence: 4 } // training dataset shards
      }
    },

    hasProposed: true,
    proposed: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.02, mode: 0.12, high: 0.45, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 2, mode: 6, high: 15, confidence: 4 },
        contactFrequency: { low: 4, mode: 10, high: 22, confidence: 4 },
        probabilityOfAction: { low: 0.15, mode: 0.3, high: 0.5, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.02, mode: 0.07, high: 0.18, confidence: 4 },
        threatCapability: { low: 78, mode: 92, high: 99, confidence: 4 },
        resistanceStrength: { low: 82, mode: 94, high: 99, confidence: 4 } // AWS Nitro Enclaves, Confidential GPUs, Cryptographic dataset provenance
      },
      primaryLoss: {
        productivity: { low: 80, mode: 250, high: 750, confidence: 4, enabled: true },
        response: { low: 60, mode: 180, high: 550, confidence: 4, enabled: true },
        replacement: { low: 30, mode: 90, high: 280, confidence: 4, enabled: true },
        finesAndJudgements: { low: 0, mode: 50, high: 200, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 50, mode: 200, high: 700, confidence: 4, enabled: true },
        reputation: { low: 40, mode: 150, high: 500, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 5, mode: 15, high: 32, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 0, mode: 30, high: 120, confidence: 4, enabled: true },
        response: { low: 30, mode: 100, high: 350, confidence: 4, enabled: true },
        replacement: { low: 0, mode: 20, high: 80, confidence: 4, enabled: true },
        finesAndJudgements: { low: 100, mode: 450, high: 1500, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 150, mode: 550, high: 1800, confidence: 4, enabled: true },
        reputation: { low: 100, mode: 380, high: 1200, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 0.5, mode: 3.0, high: 12.0, confidence: 4 },
        dataRecordsLoss: { low: 0, mode: 2, high: 20, confidence: 4 }
      }
    },

    createdAt: '2026-08-28T16:00:00.000Z',
    updatedAt: '2026-08-30T09:45:00.000Z'
  },

  // 5. ENTERPRISE COPILOT: INDIRECT PROMPT INJECTION & TOOL CHAINING EXFILTRATION
  {
    id: 'scenario-ai-copilot-prompt-injection-exfil',
    name: 'Enterprise Copilot: Indirect Prompt Injection & Tool Chaining Exfiltration',
    description: 'An external attacker embeds adversarial indirect prompt injection (IPI) payload inside a vendor email or shared PDF. When the corporate executive copilot summarizes the document, it executes unauthorized tool calls: extracting customer CRM records and sending an automated calendar invitation containing exfiltrated tokens to an attacker-controlled endpoint.',
    asset: 'Enterprise Copilot & Tool Integration Gateway (MCP / Mail / CRM)',
    threatCommunity: 'Adversarial Prompt Engineer & Jailbreak Syndicate (IPI Exploiter)',
    threatEffect: 'Confidentiality',
    status: 'Approved',
    category: 'Agentic AI & LLM Systems',
    currency: '$',
    unitScale: 1000,
    unitLabel: '$k (Thousands)',
    simulationsCount: 10000,
    randomSeed: 501,
    proposedControlCost: 350, // $350k/year for Prompt Guardrails + Tool Parameter Validation & Isolated Egress

    riskTolerance: {
      veryLowMax: 150,
      lowMax: 600,
      moderateMax: 2000,
      significantMax: 5000,
      highMax: 10000,
      targetPercentile: 90
    },

    current: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.6, mode: 2.8, high: 6.5, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 15, mode: 45, high: 110, confidence: 4 },
        contactFrequency: { low: 0.2, mode: 0.6, high: 1.5, confidence: 4 },
        probabilityOfAction: { low: 0.2, mode: 0.4, high: 0.65, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.35, mode: 0.6, high: 0.85, confidence: 4 },
        threatCapability: { low: 65, mode: 80, high: 92, confidence: 4 },
        resistanceStrength: { low: 20, mode: 38, high: 55, confidence: 4 } // Baseline LLM without prompt guardrails
      },
      primaryLoss: {
        productivity: { low: 80, mode: 280, high: 850, confidence: 4, enabled: true },
        response: { low: 180, mode: 620, high: 1900, confidence: 4, enabled: true }, // Forensic prompt reconstruction & email audit
        replacement: { low: 40, mode: 150, high: 500, confidence: 4, enabled: true },
        finesAndJudgements: { low: 100, mode: 450, high: 1600, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 120, mode: 500, high: 1800, confidence: 4, enabled: true },
        reputation: { low: 150, mode: 580, high: 2000, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 50, mode: 82, high: 98, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 20, mode: 90, high: 300, confidence: 4, enabled: true },
        response: { low: 100, mode: 350, high: 1100, confidence: 4, enabled: true },
        replacement: { low: 30, mode: 120, high: 400, confidence: 4, enabled: true },
        finesAndJudgements: { low: 400, mode: 1600, high: 5500, confidence: 4, enabled: true }, // GDPR / CCPA privacy notification penalties
        competitiveAdvantage: { low: 250, mode: 900, high: 3200, confidence: 4, enabled: true },
        reputation: { low: 300, mode: 1100, high: 3800, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 1, mode: 8, high: 36, confidence: 4 },
        dataRecordsLoss: { low: 15, mode: 120, high: 650, confidence: 4 } // in thousands of customer records
      }
    },

    hasProposed: true,
    proposed: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.04, mode: 0.18, high: 0.55, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 4, mode: 12, high: 28, confidence: 4 },
        contactFrequency: { low: 10, mode: 25, high: 55, confidence: 4 },
        probabilityOfAction: { low: 0.2, mode: 0.4, high: 0.65, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.03, mode: 0.1, high: 0.22, confidence: 4 },
        threatCapability: { low: 65, mode: 80, high: 92, confidence: 4 },
        resistanceStrength: { low: 78, mode: 90, high: 97, confidence: 4 } // Dual LLM sanitizer, tool sandboxing, MCP token binding
      },
      primaryLoss: {
        productivity: { low: 15, mode: 50, high: 160, confidence: 4, enabled: true },
        response: { low: 30, mode: 110, high: 320, confidence: 4, enabled: true },
        replacement: { low: 10, mode: 35, high: 110, confidence: 4, enabled: true },
        finesAndJudgements: { low: 0, mode: 30, high: 120, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 0, mode: 25, high: 90, confidence: 4, enabled: true },
        reputation: { low: 15, mode: 60, high: 200, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 8, mode: 20, high: 40, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 0, mode: 15, high: 50, confidence: 4, enabled: true },
        response: { low: 15, mode: 60, high: 190, confidence: 4, enabled: true },
        replacement: { low: 0, mode: 20, high: 70, confidence: 4, enabled: true },
        finesAndJudgements: { low: 40, mode: 180, high: 600, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 20, mode: 80, high: 280, confidence: 4, enabled: true },
        reputation: { low: 30, mode: 120, high: 420, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 0.1, mode: 0.8, high: 3.0, confidence: 4 },
        dataRecordsLoss: { low: 0, mode: 2, high: 15, confidence: 4 }
      }
    },

    createdAt: '2026-08-29T10:00:00.000Z',
    updatedAt: '2026-08-30T10:15:00.000Z'
  },

  // 6. AUTONOMOUS MULTI-AGENT WORKFLOW: MCP PROTOCOL HIJACK & ROGUE SWARM
  {
    id: 'scenario-ai-agentic-mcp-protocol-hijack',
    name: 'Agentic Workflow: Autonomous Agent Hijacking & MCP Protocol Abuse',
    description: 'Adversaries exploit Model Context Protocol (MCP) tool description poisoning and consent bypass flaws in a multi-agent orchestration pipeline. A rogue coordinator agent injects deceptive subgoals across specialized sub-agents, inheriting high-privilege Microsoft Entra Non-Human Identity (NHI) tokens to authorize fraudulent financial transactions and modify production code.',
    asset: 'Autonomous Multi-Agent Workflow Engine & Entra Agent IDs',
    threatCommunity: 'Rogue Autonomous Agent & Multi-Agent Swarm Infiltrator',
    threatEffect: 'All',
    status: 'Approved',
    category: 'Agentic AI & Multi-Agent Systems',
    currency: '$',
    unitScale: 1000,
    unitLabel: '$k (Thousands)',
    simulationsCount: 10000,
    randomSeed: 602,
    proposedControlCost: 520, // $520k/year for Inter-Agent Cryptographic Signing + Multi-Agent Consensus Quorum + Agent Kill Switch

    riskTolerance: {
      veryLowMax: 200,
      lowMax: 900,
      moderateMax: 3000,
      significantMax: 7500,
      highMax: 15000,
      targetPercentile: 90
    },

    current: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.4, mode: 1.8, high: 4.8, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 8, mode: 26, high: 65, confidence: 4 },
        contactFrequency: { low: 0.5, mode: 1.5, high: 3.8, confidence: 4 },
        probabilityOfAction: { low: 0.3, mode: 0.55, high: 0.8, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.28, mode: 0.52, high: 0.78, confidence: 4 },
        threatCapability: { low: 72, mode: 88, high: 98, confidence: 4 },
        resistanceStrength: { low: 22, mode: 42, high: 60, confidence: 4 }
      },
      primaryLoss: {
        productivity: { low: 200, mode: 750, high: 2400, confidence: 4, enabled: true },
        response: { low: 250, mode: 900, high: 2800, confidence: 4, enabled: true },
        replacement: { low: 80, mode: 300, high: 1000, confidence: 4, enabled: true },
        finesAndJudgements: { low: 150, mode: 600, high: 2200, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 300, mode: 1200, high: 4000, confidence: 4, enabled: true },
        reputation: { low: 250, mode: 950, high: 3100, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 48, mode: 80, high: 96, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 60, mode: 220, high: 750, confidence: 4, enabled: true },
        response: { low: 150, mode: 520, high: 1700, confidence: 4, enabled: true },
        replacement: { low: 50, mode: 180, high: 600, confidence: 4, enabled: true },
        finesAndJudgements: { low: 600, mode: 2400, high: 7800, confidence: 4, enabled: true }, // SEC / OCC regulatory enforcement
        competitiveAdvantage: { low: 500, mode: 1900, high: 6200, confidence: 4, enabled: true },
        reputation: { low: 450, mode: 1600, high: 5400, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 4, mode: 24, high: 96, confidence: 4 },
        dataRecordsLoss: { low: 30, mode: 250, high: 1100, confidence: 4 }
      }
    },

    hasProposed: true,
    proposed: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.03, mode: 0.14, high: 0.42, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 2, mode: 7, high: 18, confidence: 4 },
        contactFrequency: { low: 4, mode: 12, high: 28, confidence: 4 },
        probabilityOfAction: { low: 0.18, mode: 0.35, high: 0.58, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.02, mode: 0.08, high: 0.2, confidence: 4 },
        threatCapability: { low: 72, mode: 88, high: 98, confidence: 4 },
        resistanceStrength: { low: 80, mode: 92, high: 98, confidence: 4 } // A2A cryptographic mTLS, MCP schema enforcement, HITL high-value gates
      },
      primaryLoss: {
        productivity: { low: 30, mode: 110, high: 360, confidence: 4, enabled: true },
        response: { low: 40, mode: 140, high: 450, confidence: 4, enabled: true },
        replacement: { low: 15, mode: 55, high: 180, confidence: 4, enabled: true },
        finesAndJudgements: { low: 0, mode: 40, high: 160, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 20, mode: 80, high: 280, confidence: 4, enabled: true },
        reputation: { low: 25, mode: 90, high: 310, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 6, mode: 18, high: 38, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 0, mode: 25, high: 90, confidence: 4, enabled: true },
        response: { low: 20, mode: 80, high: 260, confidence: 4, enabled: true },
        replacement: { low: 0, mode: 25, high: 95, confidence: 4, enabled: true },
        finesAndJudgements: { low: 50, mode: 220, high: 800, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 40, mode: 160, high: 550, confidence: 4, enabled: true },
        reputation: { low: 35, mode: 140, high: 490, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 0.2, mode: 1.5, high: 6.0, confidence: 4 },
        dataRecordsLoss: { low: 0, mode: 5, high: 35, confidence: 4 }
      }
    },

    createdAt: '2026-08-29T14:00:00.000Z',
    updatedAt: '2026-08-30T10:30:00.000Z'
  },

  // 7. RPA EXPENSE BOT: ADAPTIVE MEMORY POISONING & RECONCILIATION FRAUD
  {
    id: 'scenario-ai-rpa-expense-memory-poisoning',
    name: 'RPA Financial Agent: Adaptive Memory Poisoning & Invoice Approval Fraud',
    description: 'An attacker incrementally feeds slightly altered fraudulent expense claims and vendor reconciliation records over multiple quarters. Leveraging context persistence, the RPA agent\'s adaptive learning memory shifts its internal baseline, permanently classifying fraudulent vendor patterns and shell accounts as routine, auto-approving over $3.2M in wire transfers.',
    asset: 'Autonomous Multi-Agent Workflow Engine & Entra Agent IDs',
    threatCommunity: 'Organized Cybercrime Syndicate & Wire Fraudsters',
    threatEffect: 'Integrity',
    status: 'Approved',
    category: 'AI & Robotic Process Automation (RPA)',
    currency: '$',
    unitScale: 1000,
    unitLabel: '$k (Thousands)',
    simulationsCount: 10000,
    randomSeed: 703,
    proposedControlCost: 280, // $280k/year for Immutable Memory Snapshots + Dual-Signoff HITL for Threshold Anomaly + Continuous Baseline Audits

    riskTolerance: {
      veryLowMax: 100,
      lowMax: 500,
      moderateMax: 1800,
      significantMax: 4500,
      highMax: 9000,
      targetPercentile: 90
    },

    current: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.5, mode: 2.0, high: 5.0, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 10, mode: 30, high: 75, confidence: 4 },
        contactFrequency: { low: 0.3, mode: 0.9, high: 2.2, confidence: 4 },
        probabilityOfAction: { low: 0.2, mode: 0.4, high: 0.65, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.3, mode: 0.58, high: 0.82, confidence: 4 },
        threatCapability: { low: 62, mode: 76, high: 88, confidence: 4 },
        resistanceStrength: { low: 18, mode: 35, high: 52, confidence: 4 }
      },
      primaryLoss: {
        productivity: { low: 60, mode: 220, high: 700, confidence: 4, enabled: true },
        response: { low: 150, mode: 500, high: 1600, confidence: 4, enabled: true }, // Accounting audit & forensic ledger reconciliation
        replacement: { low: 50, mode: 180, high: 600, confidence: 4, enabled: true },
        finesAndJudgements: { low: 80, mode: 320, high: 1100, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 50, mode: 200, high: 750, confidence: 4, enabled: true },
        reputation: { low: 120, mode: 450, high: 1500, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 42, mode: 72, high: 92, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 20, mode: 80, high: 260, confidence: 4, enabled: true },
        response: { low: 80, mode: 280, high: 900, confidence: 4, enabled: true },
        replacement: { low: 25, mode: 90, high: 320, confidence: 4, enabled: true },
        finesAndJudgements: { low: 350, mode: 1400, high: 4600, confidence: 4, enabled: true }, // SOX compliance deficiency penalties
        competitiveAdvantage: { low: 150, mode: 600, high: 2100, confidence: 4, enabled: true },
        reputation: { low: 200, mode: 750, high: 2600, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 1, mode: 12, high: 48, confidence: 4 },
        dataRecordsLoss: { low: 5, mode: 45, high: 200, confidence: 4 }
      }
    },

    hasProposed: true,
    proposed: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.03, mode: 0.15, high: 0.45, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 3, mode: 9, high: 22, confidence: 4 },
        contactFrequency: { low: 6, mode: 16, high: 36, confidence: 4 },
        probabilityOfAction: { low: 0.15, mode: 0.32, high: 0.55, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.03, mode: 0.09, high: 0.22, confidence: 4 },
        threatCapability: { low: 62, mode: 76, high: 88, confidence: 4 },
        resistanceStrength: { low: 76, mode: 88, high: 96, confidence: 4 } // Memory cryptographic sealing, probabilistic anomaly checks, multi-agent verification
      },
      primaryLoss: {
        productivity: { low: 10, mode: 40, high: 130, confidence: 4, enabled: true },
        response: { low: 25, mode: 90, high: 270, confidence: 4, enabled: true },
        replacement: { low: 5, mode: 25, high: 90, confidence: 4, enabled: true },
        finesAndJudgements: { low: 0, mode: 20, high: 90, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 0, mode: 20, high: 75, confidence: 4, enabled: true },
        reputation: { low: 10, mode: 45, high: 150, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 5, mode: 15, high: 35, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 0, mode: 10, high: 40, confidence: 4, enabled: true },
        response: { low: 10, mode: 45, high: 150, confidence: 4, enabled: true },
        replacement: { low: 0, mode: 15, high: 55, confidence: 4, enabled: true },
        finesAndJudgements: { low: 30, mode: 140, high: 500, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 15, mode: 60, high: 220, confidence: 4, enabled: true },
        reputation: { low: 20, mode: 80, high: 290, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 0.1, mode: 0.5, high: 2.0, confidence: 4 },
        dataRecordsLoss: { low: 0, mode: 1, high: 8, confidence: 4 }
      }
    },

    createdAt: '2026-08-29T18:00:00.000Z',
    updatedAt: '2026-08-30T10:45:00.000Z'
  },

  // 8. ENTERPRISE RAG: PERMISSION INVERSION & VECTOR EMBEDDING POISONING
  {
    id: 'scenario-ai-rag-permission-inversion',
    name: 'Enterprise RAG: Document Permission Inversion & Vector Poisoning',
    description: 'An internal enterprise knowledge search copilot indexes cross-departmental repositories with broader permissions than underlying ACLs. Employees use natural language queries to retrieve confidential executive compensation, pending acquisition targets, and pre-release patent filings without authorization.',
    asset: 'Enterprise Vector Database & Knowledge Retrieval Index (RAG)',
    threatCommunity: 'Privileged Malicious / Compromised Insider',
    threatEffect: 'Confidentiality',
    status: 'Approved',
    category: 'Generative AI & Enterprise Search',
    currency: '$',
    unitScale: 1000,
    unitLabel: '$k (Thousands)',
    simulationsCount: 10000,
    randomSeed: 804,
    proposedControlCost: 310, // $310k/year for Permission-Aware Vector Connectors + Query-Time ACL Enforcement + Embedding Red-Teaming

    riskTolerance: {
      veryLowMax: 120,
      lowMax: 550,
      moderateMax: 2200,
      significantMax: 5500,
      highMax: 11000,
      targetPercentile: 90
    },

    current: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.8, mode: 3.2, high: 7.5, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 20, mode: 55, high: 130, confidence: 4 },
        contactFrequency: { low: 0.15, mode: 0.5, high: 1.2, confidence: 4 },
        probabilityOfAction: { low: 0.15, mode: 0.35, high: 0.6, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.4, mode: 0.65, high: 0.9, confidence: 4 },
        threatCapability: { low: 45, mode: 65, high: 80, confidence: 4 },
        resistanceStrength: { low: 15, mode: 30, high: 45, confidence: 4 } // Flat vector index with no query ACL checking
      },
      primaryLoss: {
        productivity: { low: 50, mode: 180, high: 550, confidence: 4, enabled: true },
        response: { low: 120, mode: 420, high: 1300, confidence: 4, enabled: true },
        replacement: { low: 30, mode: 110, high: 360, confidence: 4, enabled: true },
        finesAndJudgements: { low: 100, mode: 400, high: 1400, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 250, mode: 950, high: 3200, confidence: 4, enabled: true }, // Trade secrets leaked before patent filing
        reputation: { low: 120, mode: 480, high: 1600, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 40, mode: 70, high: 90, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 15, mode: 60, high: 200, confidence: 4, enabled: true },
        response: { low: 60, mode: 220, high: 700, confidence: 4, enabled: true },
        replacement: { low: 20, mode: 75, high: 250, confidence: 4, enabled: true },
        finesAndJudgements: { low: 300, mode: 1200, high: 4000, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 400, mode: 1500, high: 5000, confidence: 4, enabled: true },
        reputation: { low: 200, mode: 800, high: 2800, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 0.5, mode: 4, high: 16, confidence: 4 },
        dataRecordsLoss: { low: 25, mode: 180, high: 800, confidence: 4 }
      }
    },

    hasProposed: true,
    proposed: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.05, mode: 0.22, high: 0.65, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 4, mode: 14, high: 32, confidence: 4 },
        contactFrequency: { low: 10, mode: 28, high: 60, confidence: 4 },
        probabilityOfAction: { low: 0.2, mode: 0.4, high: 0.65, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.03, mode: 0.12, high: 0.28, confidence: 4 },
        threatCapability: { low: 45, mode: 65, high: 80, confidence: 4 },
        resistanceStrength: { low: 78, mode: 90, high: 97, confidence: 4 } // Query-time ACL filtering, document-level security labels
      },
      primaryLoss: {
        productivity: { low: 10, mode: 35, high: 110, confidence: 4, enabled: true },
        response: { low: 20, mode: 75, high: 230, confidence: 4, enabled: true },
        replacement: { low: 5, mode: 20, high: 70, confidence: 4, enabled: true },
        finesAndJudgements: { low: 0, mode: 25, high: 100, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 15, mode: 65, high: 240, confidence: 4, enabled: true },
        reputation: { low: 10, mode: 40, high: 140, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 6, mode: 16, high: 35, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 0, mode: 10, high: 35, confidence: 4, enabled: true },
        response: { low: 10, mode: 35, high: 120, confidence: 4, enabled: true },
        replacement: { low: 0, mode: 10, high: 40, confidence: 4, enabled: true },
        finesAndJudgements: { low: 25, mode: 110, high: 400, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 30, mode: 130, high: 480, confidence: 4, enabled: true },
        reputation: { low: 15, mode: 65, high: 240, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 0.1, mode: 0.4, high: 2.0, confidence: 4 },
        dataRecordsLoss: { low: 0, mode: 2, high: 12, confidence: 4 }
      }
    },

    createdAt: '2026-08-30T08:00:00.000Z',
    updatedAt: '2026-08-30T11:00:00.000Z'
  },

  // 9. AUTONOMOUS DEVOPS CODING AGENT: SUPPLY CHAIN PROMPT POISONING & RCE
  {
    id: 'scenario-ai-devops-supply-chain-rce',
    name: 'Autonomous DevOps Assistant: Prompt Supply Chain Poisoning & RCE',
    description: 'An attacker compromises an upstream prompt repository or IDE plugin extension (analogous to the Amazon Q VS Code supply chain incident). The poisoned prompt instructs the autonomous coding agent during CI/CD execution to drop production database tables, disable security audit trails, and plant persistent reverse shells inside container images.',
    asset: 'Cloud Kubernetes Cluster (Production)',
    threatCommunity: 'Upstream Poisoned Agentic Artifact & Prompt Template Maintainer',
    threatEffect: 'All',
    status: 'Approved',
    category: 'AI Supply Chain & Autonomous Coding',
    currency: '$',
    unitScale: 1000,
    unitLabel: '$k (Thousands)',
    simulationsCount: 10000,
    randomSeed: 905,
    proposedControlCost: 420, // $420k/year for Signed AIBOMs + MicroVM Execution Sandboxing + AST Code Verification

    riskTolerance: {
      veryLowMax: 200,
      lowMax: 1000,
      moderateMax: 3500,
      significantMax: 8500,
      highMax: 18000,
      targetPercentile: 90
    },

    current: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.3, mode: 1.4, high: 3.8, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 6, mode: 18, high: 45, confidence: 4 },
        contactFrequency: { low: 0.05, mode: 0.2, high: 0.6, confidence: 4 },
        probabilityOfAction: { low: 0.1, mode: 0.25, high: 0.45, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.35, mode: 0.62, high: 0.88, confidence: 4 },
        threatCapability: { low: 75, mode: 90, high: 98, confidence: 4 },
        resistanceStrength: { low: 20, mode: 40, high: 58, confidence: 4 } // Unsandboxed agent tool runner in CI
      },
      primaryLoss: {
        productivity: { low: 300, mode: 1200, high: 3800, confidence: 4, enabled: true }, // Production database restoration & pipeline rebuild
        response: { low: 200, mode: 800, high: 2600, confidence: 4, enabled: true },
        replacement: { low: 100, mode: 450, high: 1500, confidence: 4, enabled: true },
        finesAndJudgements: { low: 150, mode: 600, high: 2200, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 200, mode: 850, high: 2900, confidence: 4, enabled: true },
        reputation: { low: 250, mode: 1000, high: 3400, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 52, mode: 82, high: 98, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 80, mode: 300, high: 1000, confidence: 4, enabled: true },
        response: { low: 120, mode: 480, high: 1600, confidence: 4, enabled: true },
        replacement: { low: 60, mode: 240, high: 800, confidence: 4, enabled: true },
        finesAndJudgements: { low: 500, mode: 2200, high: 7200, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 400, mode: 1600, high: 5500, confidence: 4, enabled: true },
        reputation: { low: 500, mode: 2000, high: 6800, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 6, mode: 36, high: 120, confidence: 4 },
        dataRecordsLoss: { low: 40, mode: 350, high: 1500, confidence: 4 }
      }
    },

    hasProposed: true,
    proposed: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.02, mode: 0.1, high: 0.32, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 1.5, mode: 5, high: 14, confidence: 4 },
        contactFrequency: { low: 3, mode: 9, high: 22, confidence: 4 },
        probabilityOfAction: { low: 0.15, mode: 0.3, high: 0.52, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.02, mode: 0.06, high: 0.16, confidence: 4 },
        threatCapability: { low: 75, mode: 90, high: 98, confidence: 4 },
        resistanceStrength: { low: 84, mode: 95, high: 99, confidence: 4 } // gVisor MicroVM sandboxing, signed AIBOM, human prod deploy gate
      },
      primaryLoss: {
        productivity: { low: 40, mode: 150, high: 480, confidence: 4, enabled: true },
        response: { low: 30, mode: 110, high: 360, confidence: 4, enabled: true },
        replacement: { low: 15, mode: 55, high: 180, confidence: 4, enabled: true },
        finesAndJudgements: { low: 0, mode: 35, high: 140, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 15, mode: 60, high: 200, confidence: 4, enabled: true },
        reputation: { low: 25, mode: 90, high: 300, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 5, mode: 15, high: 32, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 0, mode: 25, high: 90, confidence: 4, enabled: true },
        response: { low: 15, mode: 60, high: 200, confidence: 4, enabled: true },
        replacement: { low: 0, mode: 20, high: 75, confidence: 4, enabled: true },
        finesAndJudgements: { low: 40, mode: 180, high: 650, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 30, mode: 120, high: 420, confidence: 4, enabled: true },
        reputation: { low: 35, mode: 140, high: 500, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 0.2, mode: 1.2, high: 5.0, confidence: 4 },
        dataRecordsLoss: { low: 0, mode: 3, high: 25, confidence: 4 }
      }
    },

    createdAt: '2026-08-30T09:00:00.000Z',
    updatedAt: '2026-08-30T11:15:00.000Z'
  }
];

