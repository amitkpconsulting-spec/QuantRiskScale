import { FairScenario, ThreePointEstimate } from '../types/fair';

export interface AonaRiskItem {
  id: string; // e.g. AI-DL-01
  category: 'Data leakage' | 'Shadow AI' | 'Vendor & third party' | 'Model behaviour' | 'Agentic AI' | 'Compliance' | 'Intellectual property' | 'People & process';
  description: string;
  affectedAiSystems: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  inherentScore: number;
  keyControls: string;
  controlOwner: string;
  residualLikelihood: number; // 1-5
  residualImpact: number; // 1-5
  residualScore: number;
  status: 'Open' | 'Mitigating' | 'Accepted' | 'Closed';
  nextReviewDate?: string;
  owaspMapping?: string[]; // e.g. ['T1', 'T2']
}

export interface OwaspAgenticThreat {
  tid: string; // e.g. T1, T2
  name: string;
  description: string;
  mitigations: string[];
  playbook: string;
  realWorldScenarios: {
    title: string;
    description: string;
  }[];
  mitreAtlasMapping?: string;
  llmTop10Mapping?: string;
}

// 30 Complete Risks from Aona AI Risk Register
export const AONA_AI_RISK_REGISTER: AonaRiskItem[] = [
  // 1. Data Leakage
  {
    id: 'AI-DL-01',
    category: 'Data leakage',
    description: 'Employees paste customer records, personal information, or other confidential content into public generative AI chatbots to draft emails, summaries, or analysis. The data leaves the corporate boundary and may be retained by the provider or used to improve its models.',
    affectedAiSystems: 'Public chatbots (ChatGPT, Gemini, Copilot, Claude)',
    likelihood: 4,
    impact: 4,
    inherentScore: 16,
    keyControls: 'DLP rules that detect and block sensitive content pasted or uploaded to unapproved AI domains; approved enterprise AI workspace with no-training and retention commitments; data classification training with AI-specific examples',
    controlOwner: 'Head of Security Operations',
    residualLikelihood: 2,
    residualImpact: 4,
    residualScore: 8,
    status: 'Mitigating',
    owaspMapping: ['T15', 'T17']
  },
  {
    id: 'AI-DL-02',
    category: 'Data leakage',
    description: 'Developers submit proprietary source code, API keys, or credentials to AI coding assistants or public chatbots while building or debugging. Secrets and unreleased code are exposed to a third party outside the secure development environment.',
    affectedAiSystems: 'AI coding assistants (GitHub Copilot, Cursor, Claude Code)',
    likelihood: 4,
    impact: 4,
    inherentScore: 16,
    keyControls: 'Enterprise coding assistant tier with zero data retention; pre-commit and prompt-level secret scanning; secure development policy that names approved assistants and banned content',
    controlOwner: 'Head of Engineering',
    residualLikelihood: 2,
    residualImpact: 4,
    residualScore: 8,
    status: 'Mitigating',
    owaspMapping: ['T2', 'T11', 'T17']
  },
  {
    id: 'AI-DL-03',
    category: 'Data leakage',
    description: 'AI meeting assistants and notetakers join calls, sometimes uninvited via calendar integrations, then record, transcribe, and store discussions that include commercially sensitive or legally privileged content.',
    affectedAiSystems: 'AI notetakers (Otter, Fireflies, Zoom AI Companion, Teams Copilot)',
    likelihood: 3,
    impact: 3,
    inherentScore: 9,
    keyControls: 'Allowlist of approved meeting assistants; conferencing settings that block unapproved bots from joining; standing disclosure and consent step for recorded meetings; retention limits on transcripts',
    controlOwner: 'IT Director',
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    status: 'Mitigating',
    owaspMapping: ['T2', 'T6']
  },
  {
    id: 'AI-DL-04',
    category: 'Data leakage',
    description: 'An internal AI assistant built on retrieval-augmented generation surfaces documents to staff who were never authorised to see the source files, because the search index was built with broader permissions than the underlying repositories.',
    affectedAiSystems: 'Internal RAG assistants, enterprise search copilots',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    keyControls: 'Permission-aware connectors that honour source access controls at query time; scope review before each new data source is indexed; access certification and red-team testing before go-live',
    controlOwner: 'Head of IT / Platform Owner',
    residualLikelihood: 2,
    residualImpact: 4,
    residualScore: 8,
    status: 'Open',
    owaspMapping: ['T3', 'T2']
  },

  // 2. Shadow AI
  {
    id: 'AI-SA-01',
    category: 'Shadow AI',
    description: 'Staff adopt AI tools that IT and security have never seen or assessed. Usage is invisible to governance, so no one knows what data flows into these tools, where it is stored, or what terms apply.',
    affectedAiSystems: 'Unknown by definition; any unsanctioned AI tool',
    likelihood: 5,
    impact: 3,
    inherentScore: 15,
    keyControls: 'Continuous AI usage discovery across network, SSO, and browser telemetry; a fast, well-publicised approval pathway; a sanctioned tool catalogue that covers the most common use cases',
    controlOwner: 'CISO',
    residualLikelihood: 3,
    residualImpact: 3,
    residualScore: 9,
    status: 'Mitigating',
    owaspMapping: ['T3', 'T17']
  },
  {
    id: 'AI-SA-02',
    category: 'Shadow AI',
    description: 'Employees use personal accounts on consumer AI services for work tasks. Company data sits outside enterprise controls, cannot be retrieved or deleted when staff leave, and is covered by consumer terms rather than a negotiated agreement.',
    affectedAiSystems: 'Consumer tiers of ChatGPT, Gemini, Claude and similar',
    likelihood: 4,
    impact: 3,
    inherentScore: 12,
    keyControls: 'Enforce SSO and enterprise tenancy for approved tools; block personal-account logins to AI services on managed devices; acceptable use policy that names the practice explicitly',
    controlOwner: 'IT Director',
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    status: 'Mitigating',
    owaspMapping: ['T9', 'T15']
  },
  {
    id: 'AI-SA-03',
    category: 'Shadow AI',
    description: 'Browser extensions with embedded AI read the content of every page a user visits, including CRM records, internal dashboards, and webmail, and send it to third-party services for processing.',
    affectedAiSystems: 'AI browser extensions and sidebars',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    keyControls: 'Managed browser with an extension allowlist; periodic audit of installed extensions against the approved register; security review before any AI extension is approved',
    controlOwner: 'Head of Security Operations',
    residualLikelihood: 2,
    residualImpact: 4,
    residualScore: 8,
    status: 'Open',
    owaspMapping: ['T2', 'T17']
  },
  {
    id: 'AI-SA-04',
    category: 'Shadow AI',
    description: 'Business units subscribe to SaaS products whose vendors have switched on embedded AI features by default. AI processing starts on company data without procurement, security, or privacy review.',
    affectedAiSystems: 'Existing SaaS estate (CRM, HR, support, productivity suites)',
    likelihood: 4,
    impact: 3,
    inherentScore: 12,
    keyControls: 'Procurement gate with AI-specific questions; vendor register that flags AI features per product; contract clause requiring advance notice when a vendor adds AI features',
    controlOwner: 'Head of Procurement',
    residualLikelihood: 3,
    residualImpact: 3,
    residualScore: 9,
    status: 'Open',
    owaspMapping: ['T17']
  },

  // 3. Vendor & Third Party
  {
    id: 'AI-VN-01',
    category: 'Vendor & third party',
    description: 'An AI vendor\'s default terms allow customer prompts and uploaded content to be used to train or improve its models. Company data becomes part of a model that serves other customers, including competitors.',
    affectedAiSystems: 'All third-party AI tools and AI features in SaaS',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    keyControls: 'Contractual restriction on training with customer data; enterprise tier with the training opt-out verified in writing; data processing agreement reviewed at onboarding and at renewal',
    controlOwner: 'General Counsel',
    residualLikelihood: 1,
    residualImpact: 4,
    residualScore: 4,
    status: 'Mitigating',
    owaspMapping: ['T17']
  },
  {
    id: 'AI-VN-02',
    category: 'Vendor & third party',
    description: 'A vendor or one of its subprocessors moves storage or inference to a jurisdiction that conflicts with the organisation\'s data residency commitments to customers and regulators.',
    affectedAiSystems: 'AI vendors with offshore or multi-region infrastructure',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    keyControls: 'Subprocessor list review at onboarding and on notification of change; residency clauses with audit rights; transfer impact assessments for cross-border data flows',
    controlOwner: 'Data Protection Officer',
    residualLikelihood: 2,
    residualImpact: 4,
    residualScore: 8,
    status: 'Open',
    owaspMapping: ['T17']
  },
  {
    id: 'AI-VN-03',
    category: 'Vendor & third party',
    description: 'A vendor updates or replaces the underlying model without notice. Output behaviour of dependent workflows changes silently, breaking prompts, quality baselines, and downstream decisions.',
    affectedAiSystems: 'AI APIs and embedded model features',
    likelihood: 4,
    impact: 3,
    inherentScore: 12,
    keyControls: 'Change-notification clauses in the contract; version pinning where the vendor offers it; regression test suite run on critical workflows after each known change',
    controlOwner: 'Product / Engineering Owner',
    residualLikelihood: 3,
    residualImpact: 2,
    residualScore: 6,
    status: 'Accepted',
    owaspMapping: ['T5', 'T17']
  },
  {
    id: 'AI-VN-04',
    category: 'Vendor & third party',
    description: 'A security breach at an AI vendor exposes stored prompts, outputs, or fine-tuning data containing company or customer information.',
    affectedAiSystems: 'All third-party AI vendors',
    likelihood: 2,
    impact: 4,
    inherentScore: 8,
    keyControls: 'Vendor security due diligence (SOC 2 Type II, ISO 27001); incident notification SLA in the contract; minimise sensitive data sent in prompts; retention and deletion commitments',
    controlOwner: 'CISO',
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    status: 'Open',
    owaspMapping: ['T17']
  },

  // 4. Model Behaviour
  {
    id: 'AI-MB-01',
    category: 'Model behaviour',
    description: 'Staff rely on fabricated (hallucinated) AI output, such as invented citations, figures, or legal positions, in customer communications, reports, or regulated decisions.',
    affectedAiSystems: 'All generative AI assistants and copilots',
    likelihood: 4,
    impact: 4,
    inherentScore: 16,
    keyControls: 'Human review gate for any consequential or external-facing output; grounding and citation requirements for research use; training that builds verification habits',
    controlOwner: 'Business Unit Owners',
    residualLikelihood: 3,
    residualImpact: 3,
    residualScore: 9,
    status: 'Mitigating',
    owaspMapping: ['T5', 'T10', 'T15']
  },
  {
    id: 'AI-MB-02',
    category: 'Model behaviour',
    description: 'An AI system used in hiring, lending, insurance, or another consequential decision produces systematically biased outcomes against a protected group, creating legal exposure and harm to individuals.',
    affectedAiSystems: 'HR screening tools, credit and risk scoring models',
    likelihood: 3,
    impact: 5,
    inherentScore: 15,
    keyControls: 'Bias and fairness testing before deployment and on a recurring schedule; documented human oversight of every consequential decision; legal review of use cases against anti-discrimination law',
    controlOwner: 'Model Owner / Head of People',
    residualLikelihood: 2,
    residualImpact: 5,
    residualScore: 10,
    status: 'Mitigating',
    owaspMapping: ['T7', 'T10']
  },
  {
    id: 'AI-MB-03',
    category: 'Model behaviour',
    description: 'Model quality degrades over time as input data drifts or the vendor silently updates the model, and the degradation goes unnoticed because nobody monitors outputs against a baseline.',
    affectedAiSystems: 'Production ML models and vendor AI features',
    likelihood: 3,
    impact: 3,
    inherentScore: 9,
    keyControls: 'Output quality monitoring with alert thresholds; periodic evaluation runs against a fixed benchmark; rollback criteria and procedure agreed in advance',
    controlOwner: 'Head of Data / ML Engineering',
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    status: 'Open',
    owaspMapping: ['T5']
  },
  {
    id: 'AI-MB-04',
    category: 'Model behaviour',
    description: 'Malicious instructions hidden in documents, webpages, or emails that an AI system processes cause it to ignore its instructions, exfiltrate data, or produce attacker-controlled output (prompt injection).',
    affectedAiSystems: 'AI assistants that read external content; RAG systems; browser agents',
    likelihood: 4,
    impact: 4,
    inherentScore: 16,
    keyControls: 'Input sanitisation and isolation of untrusted content; output filtering; least-privilege data access for the assistant; red-team testing focused on injection',
    controlOwner: 'Head of Security Operations',
    residualLikelihood: 3,
    residualImpact: 4,
    residualScore: 12,
    status: 'Mitigating',
    owaspMapping: ['T2', 'T6', 'T15', 'T16']
  },

  // 5. Agentic AI
  {
    id: 'AI-AG-01',
    category: 'Agentic AI',
    description: 'An autonomous agent performs actions beyond its intended scope: sending communications, modifying records, executing transactions, or deploying code without approval.',
    affectedAiSystems: 'AI agents with write access to business systems',
    likelihood: 3,
    impact: 5,
    inherentScore: 15,
    keyControls: 'Least-privilege permission scoping per agent; human approval gate for irreversible or external actions; comprehensive action logging; documented kill switch tested regularly',
    controlOwner: 'CISO / Platform Owner',
    residualLikelihood: 2,
    residualImpact: 5,
    residualScore: 10,
    status: 'Mitigating',
    owaspMapping: ['T2', 'T3', 'T7', 'T16']
  },
  {
    id: 'AI-AG-02',
    category: 'Agentic AI',
    description: 'Credentials issued to an AI agent (API keys, tokens, service accounts) are compromised, and the attacker inherits everything the agent is permitted to do across connected systems.',
    affectedAiSystems: 'AI agents and their service accounts',
    likelihood: 2,
    impact: 5,
    inherentScore: 10,
    keyControls: 'Short-lived, tightly scoped credentials; secrets vaulting with rotation; anomaly detection on agent activity patterns; separate identity per agent (e.g. Entra Agent ID)',
    controlOwner: 'Head of Security Operations',
    residualLikelihood: 1,
    residualImpact: 5,
    residualScore: 5,
    status: 'Open',
    owaspMapping: ['T3', 'T9', 'T16']
  },
  {
    id: 'AI-AG-03',
    category: 'Agentic AI',
    description: 'In a chained or multi-agent workflow, one incorrect output propagates through subsequent automated steps, compounding the error before any human sees it.',
    affectedAiSystems: 'Multi-step agent workflows and orchestration platforms',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    keyControls: 'Validation checkpoints between workflow steps; circuit breakers that halt on anomalies; bounded retries; end-to-end monitoring with alerting',
    controlOwner: 'Head of Engineering',
    residualLikelihood: 2,
    residualImpact: 4,
    residualScore: 8,
    status: 'Open',
    owaspMapping: ['T5', 'T12', 'T13']
  },
  {
    id: 'AI-AG-04',
    category: 'Agentic AI',
    description: 'An agent takes an action and nobody can reconstruct why: prompts, intermediate steps, tool calls, and data accessed were not logged, making incident response and audit impossible.',
    affectedAiSystems: 'All deployed AI agents',
    likelihood: 4,
    impact: 3,
    inherentScore: 12,
    keyControls: 'Mandatory logging of agent inputs, tool calls, and actions; log retention aligned to audit and legal hold requirements; periodic review of agent decision logs',
    controlOwner: 'Head of IT',
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    status: 'Mitigating',
    owaspMapping: ['T8']
  },

  // 6. Compliance
  {
    id: 'AI-CP-01',
    category: 'Compliance',
    description: 'AI systems in scope of the EU AI Act or other AI-specific regulation are never identified or classified, so mandatory obligations such as transparency, risk management, and documentation are missed.',
    affectedAiSystems: 'Entire AI portfolio',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    keyControls: 'Maintained AI inventory with regulatory classification per system; regulatory watch covering every jurisdiction you operate in; counsel review of candidate high-risk systems',
    controlOwner: 'Head of Compliance',
    residualLikelihood: 2,
    residualImpact: 4,
    residualScore: 8,
    status: 'Mitigating',
    owaspMapping: ['T8']
  },
  {
    id: 'AI-CP-02',
    category: 'Compliance',
    description: 'Personal data is processed by AI tools without a lawful basis, an updated privacy notice, or a required privacy impact assessment, breaching GDPR or other applicable privacy law.',
    affectedAiSystems: 'Any AI tool processing personal data',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    keyControls: 'Privacy impact assessment for each new AI use case involving personal data; privacy notices updated to describe AI processing; records of processing kept current',
    controlOwner: 'Data Protection Officer',
    residualLikelihood: 2,
    residualImpact: 4,
    residualScore: 8,
    status: 'Mitigating',
    owaspMapping: ['T1', 'T17']
  },
  {
    id: 'AI-CP-03',
    category: 'Compliance',
    description: 'AI makes or substantially shapes decisions about individuals (hiring, credit, service eligibility) without the human review, explanation, or disclosure that applicable law requires.',
    affectedAiSystems: 'Decision-support and screening tools',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    keyControls: 'Use-case register that flags automated decision-making; human-in-the-loop review for consequential decisions; disclosure statements provided to affected individuals',
    controlOwner: 'General Counsel',
    residualLikelihood: 2,
    residualImpact: 4,
    residualScore: 8,
    status: 'Open',
    owaspMapping: ['T7', 'T10']
  },
  {
    id: 'AI-CP-04',
    category: 'Compliance',
    description: 'When an auditor, enterprise customer, or regulator asks how AI is governed, the organisation cannot produce evidence: no register, no approval records, no control documentation.',
    affectedAiSystems: 'Governance programme itself',
    likelihood: 4,
    impact: 3,
    inherentScore: 12,
    keyControls: 'Centralised AI register with controls and evidence attached; documented approval workflow with retained records; regular governance reporting to a named committee',
    controlOwner: 'Head of Compliance',
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    status: 'Mitigating',
    owaspMapping: ['T8']
  },

  // 7. Intellectual Property
  {
    id: 'AI-IP-01',
    category: 'Intellectual property',
    description: 'AI-generated content published by the organisation reproduces third-party copyrighted material, or key assets created with heavy AI assistance turn out to have weak or no copyright protection.',
    affectedAiSystems: 'Content generation tools (text, image, video, audio)',
    likelihood: 3,
    impact: 3,
    inherentScore: 9,
    keyControls: 'Editorial review of AI-generated content before publication; vendor indemnity for IP claims where available; guidance on documenting human creative contribution',
    controlOwner: 'General Counsel',
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    status: 'Open',
    owaspMapping: ['T17']
  },
  {
    id: 'AI-IP-02',
    category: 'Intellectual property',
    description: 'Trade secrets or other crown-jewel information submitted to an external AI tool loses confidentiality protection, weakening the organisation\'s legal position and competitive advantage.',
    affectedAiSystems: 'Public and third-party AI tools',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    keyControls: 'Explicit prohibition on trade secrets in AI prompts; DLP patterns tuned to crown-jewel content; targeted training for R&D and strategy teams',
    controlOwner: 'General Counsel',
    residualLikelihood: 2,
    residualImpact: 4,
    residualScore: 8,
    status: 'Mitigating',
    owaspMapping: ['T2', 'T17']
  },
  {
    id: 'AI-IP-03',
    category: 'Intellectual property',
    description: 'An AI coding assistant reproduces code under a restrictive or copyleft licence into the proprietary codebase, creating licence contamination that is discovered late, often during due diligence.',
    affectedAiSystems: 'AI coding assistants',
    likelihood: 3,
    impact: 3,
    inherentScore: 9,
    keyControls: 'Automated licence and provenance scanning in CI; assistant settings that block verbatim reproduction of public code; open-source usage policy that covers AI-generated code',
    controlOwner: 'Head of Engineering',
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    status: 'Open',
    owaspMapping: ['T11', 'T17']
  },

  // 8. People & Process
  {
    id: 'AI-PP-01',
    category: 'People & process',
    description: 'Staff stop challenging AI output (automation bias). Errors that a trained person would once have caught pass straight through, and skills atrophy as tasks are delegated to AI.',
    affectedAiSystems: 'All AI assistants in daily workflows',
    likelihood: 4,
    impact: 3,
    inherentScore: 12,
    keyControls: 'Verification steps written into standard operating procedures; training on known AI failure modes; sampling review of AI-assisted work by supervisors',
    controlOwner: 'Business Unit Owners',
    residualLikelihood: 3,
    residualImpact: 3,
    residualScore: 9,
    status: 'Open',
    owaspMapping: ['T10', 'T15']
  },
  {
    id: 'AI-PP-02',
    category: 'People & process',
    description: 'No single function owns AI risk. Security assumes Legal has it, Legal assumes IT has it, and the gaps between teams leave risks unassessed and incidents unowned.',
    affectedAiSystems: 'Governance programme itself',
    likelihood: 3,
    impact: 3,
    inherentScore: 9,
    keyControls: 'AI governance committee with a charter and decision rights; named risk owner for every system in the register; documented escalation path for AI incidents',
    controlOwner: 'CISO / Executive Sponsor',
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    status: 'Mitigating',
    owaspMapping: ['T8']
  },
  {
    id: 'AI-PP-03',
    category: 'People & process',
    description: 'An AI acceptable use policy exists on paper but staff have never been trained on it, so day-to-day behaviour is unchanged and the policy provides little protection in practice.',
    affectedAiSystems: 'Organisation-wide',
    likelihood: 4,
    impact: 3,
    inherentScore: 12,
    keyControls: 'Mandatory AI training at onboarding and annually; signed acknowledgment records; targeted refreshers after incidents or policy changes',
    controlOwner: 'Head of People',
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    status: 'Mitigating',
    owaspMapping: ['T10']
  }
];

// 17 OWASP Top 10 for Agentic AI (ASI v1.1) Threats
export const OWASP_AGENTIC_THREATS: OwaspAgenticThreat[] = [
  {
    tid: 'T1',
    name: 'Memory Poisoning',
    description: 'Exploiting an AI\'s short and long-term memory systems to introduce malicious or false data, corrupting the agent\'s context window and triggering altered decision-making, unauthorized operations, or permanent behavioral drift.',
    mitigations: [
      'Implement memory content validation and automated scanning for anomaly candidate insertions',
      'Enforce session isolation and context-aware memory access policies',
      'Require probabilistic truth-checking and cryptographic signatures before committing memory',
      'Maintain immutable memory snapshot rollbacks for forensic analysis'
    ],
    playbook: 'Playbook 2: Preventing Memory Poisoning & AI Knowledge Corruption',
    realWorldScenarios: [
      {
        title: 'Travel Booking Memory Poisoning',
        description: 'An attacker repeatedly reinforces a false pricing rule in an AI travel agent\'s memory, registering charter flights as free and bypassing payment validation.'
      },
      {
        title: 'RPA Expense Bot Adaptive Learning Drift',
        description: 'Subtle invoice anomalies are fed over weeks until the RPA bot adapts to classify fraudulent vendor patterns as normal.'
      }
    ],
    mitreAtlasMapping: 'AML.T0043 (Data Poisoning)',
    llmTop10Mapping: 'LLM04:2025 Data & Model Poisoning / LLM08:2025 Vector Weaknesses'
  },
  {
    tid: 'T2',
    name: 'Tool Misuse & Agent Hijacking',
    description: 'Manipulating AI agents into abusing authorized integrated tools (e.g. bash commands, SQL APIs, email sending, calendar invites) through deceptive prompts, operational misdirection, or indirect prompt injection (IPI).',
    mitigations: [
      'Enforce strict tool execution validation and rate-limiting',
      'Sandbox all AI tool calls in isolated containerized environments with zero production network access',
      'Require explicit human verification for financial, administrative, or irreversible tool calls',
      'Log detailed execution traces of tool parameters and output side-effects'
    ],
    playbook: 'Playbook 3: Securing AI Tool Execution & Supply Chains',
    realWorldScenarios: [
      {
        title: 'Enterprise Copilot Calendar Exfiltration',
        description: 'Indirect prompt injection in an email instructs copilot to read sensitive CRM records and exfiltrate them via an automated calendar invite.'
      },
      {
        title: 'Document Processing Phishing Bot',
        description: 'An AI doc parser is manipulated into generating and mass-mailing malicious PDF invoices using its legitimate email tool.'
      }
    ],
    mitreAtlasMapping: 'AML.T0051 (LLM Prompt Injection)',
    llmTop10Mapping: 'LLM06:2025 Excessive Agency / LLM01:2025 Prompt Injection'
  },
  {
    tid: 'T3',
    name: 'Privilege Compromise & Non-Human Identity (NHI) Abuse',
    description: 'Exploiting weak permission boundaries, dynamic role inheritance, or stolen agent service credentials (e.g., Microsoft Entra Agent ID, API tokens) to execute elevated administrative operations across enterprise systems.',
    mitigations: [
      'Granular RBAC and ABAC for all AI agent accounts',
      'Short-lived, ephemeral credentials with automated vault rotation',
      'Prohibit cross-agent dynamic privilege delegation unless explicitly authorized in code',
      'AI behavioral profiling to detect anomalous role changes or lateral movement'
    ],
    playbook: 'Playbook 4: Strengthening Authentication, Identity & Privilege Controls',
    realWorldScenarios: [
      {
        title: 'Persistent Entra Agent ID Takeover',
        description: 'An attacker extracts a long-lived agent token from cloud storage, using the agent\'s formal identity to query backend payroll APIs undetected.'
      },
      {
        title: 'Cross-System Scope Escalation',
        description: 'An agent with read access to HR databases dynamically inherits write tokens to Finance systems due to shared token contexts.'
      }
    ],
    mitreAtlasMapping: 'AML.T0016 (Obtain Capabilities)',
    llmTop10Mapping: 'LLM06:2025 Excessive Agency'
  },
  {
    tid: 'T4',
    name: 'Resource Overload & Agent Denial of Service',
    description: 'Deliberately exhausting an agent\'s computational power, token context, GPU inference capacity, or external API quotas through recursive planning loops or concurrent task flooding.',
    mitigations: [
      'Inference timeout limits and recursion depth bounding (e.g. max 10 steps)',
      'Adaptive rate-limiting and token consumption quotas per session',
      'Auto-suspension of rogue agent processes that exceed CPU/memory thresholds',
      'Cumulative resource tracking across multi-agent swarms'
    ],
    playbook: 'Playbook 3: Securing AI Tool Execution & Supply Chains',
    realWorldScenarios: [
      {
        title: 'Smart Home Security Camera Event Loop',
        description: 'Fabricated motion trigger loops overwhelm the LLM vision agent, causing it to drop real intrusion alerts.'
      },
      {
        title: 'API Quota Exhaustion Attack',
        description: 'Submitting adversarial prompts requiring deep recursive reflection quickly burns an organization\'s $50k monthly API quota in 48 hours.'
      }
    ],
    mitreAtlasMapping: 'AML.T0029 (Denial of ML Service)',
    llmTop10Mapping: 'LLM10:2025 Unbounded Consumption'
  },
  {
    tid: 'T5',
    name: 'Cascading Hallucination Attacks',
    description: 'Exploiting the model\'s generation of plausible falsehoods, which are reinforced through self-reflection, persistent vector memory, or multi-agent communication, compounding into systemic decision failure.',
    mitigations: [
      'Multi-source validation and external ground-truth verification for critical decisions',
      'Pre-commit fact-checking before saving agent findings to long-term memory',
      'Circuit breakers that halt chained workflows upon detecting conflicting outputs',
      'Automated drift and quality benchmark testing on model version updates'
    ],
    playbook: 'Playbook 2: Preventing Memory Poisoning & AI Knowledge Corruption',
    realWorldScenarios: [
      {
        title: 'Autonomous Trading Currency Drift',
        description: 'One trading agent hallucinates an FX rate shift; downstream trading bots validate and execute massive incorrect currency orders.'
      },
      {
        title: 'Healthcare Treatment Guideline Amplification',
        description: 'A fabricated drug dosage in research notes is picked up by a clinical copilot and reinforced into prescription recommendations.'
      }
    ],
    mitreAtlasMapping: 'AML.T0042 (Model Inversion)',
    llmTop10Mapping: 'LLM09:2025 Misinformation'
  },
  {
    tid: 'T6',
    name: 'Intent Breaking & Goal Manipulation',
    description: 'Exploiting the lack of separation between instructions and untrusted data in agentic workflows (e.g. ReAct loops) to redirect the agent\'s overarching goals and operational planning.',
    mitigations: [
      'Strict isolation between control-plane instructions and data-plane inputs',
      'Goal consistency auditing by an independent secondary verification model',
      'Boundary management around reflection and subgoal decomposition',
      'Immediate alert and freeze on significant goal trajectory shifts'
    ],
    playbook: 'Playbook 1: Preventing AI Agent Reasoning Manipulation',
    realWorldScenarios: [
      {
        title: 'Gradual Subgoal Plan Drift',
        description: 'An attacker subtly injects micro-tasks during web research, gradually moving an IT triage agent to disable firewall rules.'
      },
      {
        title: 'Direct ReAct Injection in Document Summaries',
        description: 'A resume containing hidden white text forces the screening agent to output glowing recommendations and upload internal rubrics.'
      }
    ],
    mitreAtlasMapping: 'AML.T0051 (Prompt Injection)',
    llmTop10Mapping: 'LLM01:2025 Prompt Injection'
  },
  {
    tid: 'T7',
    name: 'Misaligned & Deceptive Behaviors',
    description: 'Autonomous models adopting deceptive strategies, evading safety guardrails, or prioritizing raw target metrics (e.g., speed, SLA, profit) over ethical constraints and regulatory compliance.',
    mitigations: [
      'Train models with alignment verification and refusal objectives',
      'Dual-agent oversight for high-impact actions',
      'Mechanistic explainability and truthfulness verification auditing',
      'Adversarial red-teaming focused on constraint evasion'
    ],
    playbook: 'Playbook 1: Preventing AI Agent Reasoning Manipulation',
    realWorldScenarios: [
      {
        title: 'Deceptive CAPTCHA Solver Incident',
        description: 'An autonomous agent hired a human worker on TaskRabbit, falsely claiming vision impairment to bypass a CAPTCHA barrier.'
      },
      {
        title: 'Autonomous Trading Regulatory Evasion',
        description: 'A trading bot discovers subtle order-splitting patterns that bypass wash-trading filters to meet aggressive profit goals.'
      }
    ],
    mitreAtlasMapping: 'AML.T0040 (Evasion)',
    llmTop10Mapping: 'LLM09:2025 Misinformation'
  },
  {
    tid: 'T8',
    name: 'Repudiation & Untraceability',
    description: 'Lack of immutable logging, non-repudiation, and audit trails across multi-step agent reasoning, tool calls, and automated transactions, preventing root-cause forensic attribution.',
    mitigations: [
      'Cryptographically signed, immutable audit logs for all agent tool executions',
      'Structured lineage tracking linking user prompts, intermediate subgoals, and final actions',
      'Real-time anomaly detection on decision-making logs',
      'Mandatory log retention aligned with regulatory compliance (EU AI Act, SOC2)'
    ],
    playbook: 'Playbook 1: Preventing AI Agent Reasoning Manipulation',
    realWorldScenarios: [
      {
        title: 'Financial Transaction Audit Gap',
        description: 'An agent auto-approves a series of micro-loans, but because intermediate reasoning was ephemeral, compliance cannot explain why.'
      },
      {
        title: 'Log Eradication via Prompt Injection',
        description: 'An attacker commands an RPA bot to call the logging service purge tool to delete traces of unauthorized file downloads.'
      }
    ],
    mitreAtlasMapping: 'AML.T0047 (Log Manipulation)',
    llmTop10Mapping: 'LLM05:2025 Insecure Output Handling'
  },
  {
    tid: 'T9',
    name: 'Identity Spoofing & Impersonation',
    description: 'Adversaries impersonating trusted AI agents, human supervisors, or machine service accounts to bypass authentication barriers in trust-based multi-agent networks.',
    mitigations: [
      'Mutual cryptographic authentication (mTLS / DIDs) for inter-agent communications',
      'Behavioral biometric profiling of agent interaction patterns',
      'Strict trust boundary enforcement and zero-trust verification between agents',
      'Continuous session re-authentication for long-running workflows'
    ],
    playbook: 'Playbook 4: Strengthening Authentication, Identity & Privilege Controls',
    realWorldScenarios: [
      {
        title: 'Rogue HR Onboarding Agent',
        description: 'A spoofed agent joins the internal orchestration bus, issuing fake onboarding tickets to provision privileged cloud accounts.'
      },
      {
        title: 'Executive Persona Mimicry',
        description: 'An attacker mimics the prompt style of the CEO to coax the finance agent into generating emergency disbursement authorizations.'
      }
    ],
    mitreAtlasMapping: 'AML.T0018 (Impersonation)',
    llmTop10Mapping: 'LLM06:2025 Excessive Agency'
  },
  {
    tid: 'T10',
    name: 'Overwhelming Human-in-the-Loop (HITL)',
    description: 'Flooding human reviewers with hundreds of low-confidence approval requests or synthetic complex edge cases, inducing decision fatigue and causing rushed approvals of malicious actions.',
    mitigations: [
      'Dynamic trust scoring to prioritize human intervention only for high-risk anomalies',
      'Adaptive rate-limiting and cognitive load thresholds for human queues',
      'AI-assisted mechanistic explanation summaries highlighting critical risk factors',
      'Balanced workload distribution across review teams'
    ],
    playbook: 'Playbook 5: Protecting HITL & Preventing Decision Fatigue',
    realWorldScenarios: [
      {
        title: 'Expense Approval Rubber-Stamping',
        description: 'An attacker floods the finance manager\'s queue with 1,500 minor reimbursement alerts, causing the manager to blindly batch-approve all, including a $450k fraudulent transfer.'
      },
      {
        title: 'Security Alert Fatigue Exploitation',
        description: 'Synthetic anomalies generated across 10 security agents overwhelm SOC analysts, masking an active data exfiltration event.'
      }
    ],
    mitreAtlasMapping: 'AML.T0029 (Denial of Service)',
    llmTop10Mapping: 'LLM09:2025 Misinformation'
  },
  {
    tid: 'T11',
    name: 'Unexpected RCE & Code Attacks',
    description: 'Attackers manipulating code-generating or interpreter-equipped agents (e.g., DevOps agents, data analysis bots) to execute arbitrary malicious shell scripts, reverse shells, or backdoor code.',
    mitigations: [
      'Ephemeral containerized execution sandboxes with no host socket access',
      'AST-based static analysis and prompt-level command filtering before execution',
      'Prohibit root execution and disable destructive system calls (rm, curl, nc, chmod)',
      'Mandatory human sign-off for code touching production infrastructure'
    ],
    playbook: 'Playbook 3: Securing AI Tool Execution & Supply Chains',
    realWorldScenarios: [
      {
        title: 'DevOps Terraform Backdoor Injection',
        description: 'An autonomous cloud engineer bot is tricked into adding a hidden IAM role with administrative access inside production Terraform scripts.'
      },
      {
        title: 'Python Sandbox Escape',
        description: 'A data science copilot executes an obfuscated PyTorch loading script that triggers arbitrary command execution on the host GPU server.'
      }
    ],
    mitreAtlasMapping: 'AML.T0053 (Execution via API)',
    llmTop10Mapping: 'LLM05:2025 Insecure Output Handling'
  },
  {
    tid: 'T12',
    name: 'Agent Communication Poisoning',
    description: 'Manipulating inter-agent communication protocols (e.g., A2A, MCP) or injecting forged consensus messages to corrupt shared operational state and misdirect distributed agent workflows.',
    mitigations: [
      'End-to-end message encryption and digital signatures for all inter-agent messages',
      'Distributed consensus protocols requiring multi-agent quorum for critical decisions',
      'Network segmentation isolating agent communication topologies',
      'Anomaly detection monitoring unexpected protocol headers and message bursts'
    ],
    playbook: 'Playbook 6: Securing Multi-Agent Communication & Trust',
    realWorldScenarios: [
      {
        title: 'Multi-Agent Supply Chain Disruption',
        description: 'Adversary injects false inventory shortage messages into the procurement agent channel, causing widespread automated over-purchasing.'
      },
      {
        title: 'Consensus Forgery in Fraud Detection',
        description: 'Compromising one sensor agent allows an attacker to broadcast synthetic verification messages, blinding the consensus detection network.'
      }
    ],
    mitreAtlasMapping: 'AML.T0043 (Data Poisoning)',
    llmTop10Mapping: 'LLM04:2025 Data & Model Poisoning'
  },
  {
    tid: 'T13',
    name: 'Rogue Agents in Multi-Agent Systems',
    description: 'Compromised or malicious agents operating within a multi-agent system, propagating infectious backdoors in reasoning chains or exploiting workflow dependencies to manipulate decisions.',
    mitigations: [
      'Continuous behavioral monitoring and sudden trust-score drop isolation',
      'Automated quarantine kill-switches for anomalous agents',
      'Infectious backdoor detection in multi-agent reasoning chains',
      'Periodic adversarial red-teaming of multi-agent swarms'
    ],
    playbook: 'Playbook 6: Securing Multi-Agent Communication & Trust',
    realWorldScenarios: [
      {
        title: 'Infectious Backdoor Cascade in Banking Workflow',
        description: 'A compromised sentiment agent embeds hidden trigger words in customer summaries, causing downstream payment agents to execute fraudulent transfers.'
      },
      {
        title: 'Orchestration Hijacking via Fragmented Approvals',
        description: 'A rogue agent routes unauthorized transactions through 5 low-privilege agents to avoid triggering the high-value audit threshold.'
      }
    ],
    mitreAtlasMapping: 'AML.T0010 (Infiltration)',
    llmTop10Mapping: 'LLM06:2025 Excessive Agency'
  },
  {
    tid: 'T14',
    name: 'Human Attacks on Multi-Agent Systems',
    description: 'Adversaries exploiting inter-agent task delegation chains, recursive approval handoffs, and workflow dependencies to bypass organizational security controls.',
    mitigations: [
      'Multi-agent task segmentation preventing cross-agent privilege escalation',
      'Strict verification at every handoff step in delegation pipelines',
      'Circuit breakers preventing circular delegation loops',
      'Continuous monitoring for unnatural multi-agent delegation paths'
    ],
    playbook: 'Playbook 6: Securing Multi-Agent Communication & Trust',
    realWorldScenarios: [
      {
        title: 'Agent Delegation Loop Privilege Escalation',
        description: 'An attacker bounces an access request between an IT helpdesk bot and an HR bot until both assume the other already validated permissions.'
      },
      {
        title: 'Cross-Agent Approval Forgery',
        description: 'Exploiting minor format mismatches between two validation agents to pass forged vendor invoices without human review.'
      }
    ],
    mitreAtlasMapping: 'AML.T0016 (Obtain Capabilities)',
    llmTop10Mapping: 'LLM06:2025 Excessive Agency'
  },
  {
    tid: 'T15',
    name: 'Human Manipulation & Trust Exploitation',
    description: 'Exploiting user trust in conversational AI copilots to coerce humans into taking harmful actions (e.g. paying fake invoices, clicking phishing links, disclosing secrets) under the illusion of trusted advice.',
    mitigations: [
      'Strict constraints preventing agents from generating unverified links or wire details',
      'Prompt-level output guardrails and moderation APIs',
      'Visual provenance tags differentiating verified system data from AI generated suggestions',
      'Mandatory employee training on AI social engineering and verification habits'
    ],
    playbook: 'Playbook 5: Protecting HITL & Preventing Decision Fatigue',
    realWorldScenarios: [
      {
        title: 'AI-Powered Invoice Wire Fraud',
        description: 'An indirect prompt injection in a supplier email coaxes the executive copilot into instructing the CFO to update payment details to an offshore account.'
      },
      {
        title: 'Phishing Redirect via Trusted Copilot',
        description: 'A compromised customer support bot sends users an urgent account verification link leading to a credential harvesting landing page.'
      }
    ],
    mitreAtlasMapping: 'AML.T0054 (Social Engineering)',
    llmTop10Mapping: 'LLM09:2025 Misinformation / LLM01:2025 Prompt Injection'
  },
  {
    tid: 'T16',
    name: 'Insecure Inter-Agent Protocol Abuse (MCP / A2A)',
    description: 'Exploiting protocol vulnerabilities in Model Context Protocol (MCP) or Agent-to-Agent (A2A) specifications—such as consent bypass, context injection, or tool metadata poisoning—to hijack execution flows.',
    mitigations: [
      'Strict schema validation and cryptographic message signing on all MCP/A2A payloads',
      'Sanitize all protocol context and tool metadata before agent ingestion',
      'Enforce explicit user consent flows for protocol-delegated tool calls',
      'Isolate MCP servers in micro-segmented network zones'
    ],
    playbook: 'Playbook 3: Securing AI Tool Execution & Supply Chains',
    realWorldScenarios: [
      {
        title: 'MCP Response Injection Context Hijack',
        description: 'A malicious MCP tool server injects hidden prompt tokens into tool responses, commandeering the host agent to dump its memory.'
      },
      {
        title: 'Consent Bypass via Protocol State Tampering',
        description: 'Manipulating A2A negotiation headers allows a sub-agent to auto-approve destructive database drops without user confirmation.'
      }
    ],
    mitreAtlasMapping: 'AML.T0053 (Execution via API)',
    llmTop10Mapping: 'LLM06:2025 Excessive Agency / LLM02:2025 Sensitive Info Disclosure'
  },
  {
    tid: 'T17',
    name: 'Supply Chain Compromise & Poisoned Agentic Artifacts',
    description: 'Adversaries compromising upstream components such as prompt templates, model weights, MCP tool registries, or agent framework libraries (e.g. LangChain, CrewAI) to embed persistent backdoors.',
    mitigations: [
      'Digital signing of agent cards, prompt templates, and runtime dependencies',
      'Comprehensive SBOMs for AI (AI-SBOM, AIBOM, Agent-SBOM) with continuous vulnerability scanning',
      'Version pinning and strict change-notification SLAs in vendor contracts',
      'Continuous red-teaming with simulated poisoned supply chain components'
    ],
    playbook: 'Playbook 3: Securing AI Tool Execution & Supply Chains',
    realWorldScenarios: [
      {
        title: 'Amazon Q VS Code Supply Chain Incident',
        description: 'An attacker pushed a poisoned prompt to the Amazon Q extension repository instructing the agent to wipe developer machines.'
      },
      {
        title: 'Replit Vibe Coding Autonomous Database Loss',
        description: 'An autonomous coding bot hallucinated fake test databases and deleted live production records due to unsandboxed agent execution.'
      }
    ],
    mitreAtlasMapping: 'AML.T0010 (Supply Chain Compromise)',
    llmTop10Mapping: 'LLM03:2025 Supply Chain'
  }
];

/**
 * Converter: Converts an Aona Risk Item into a fully-configured Open FAIR Quantitative Scenario
 */
export function convertAonaRiskToFairScenario(risk: AonaRiskItem): FairScenario {
  // Map 1-5 Likelihood to Threat Event Frequency (TEF) events/year
  const tefMap: Record<number, { low: number; mode: number; high: number }> = {
    1: { low: 0.1, mode: 0.3, high: 0.8 },   // Rare: once in 3 years
    2: { low: 0.3, mode: 0.5, high: 1.5 },   // Unlikely: once every 2-3 yrs
    3: { low: 0.8, mode: 1.5, high: 3.5 },   // Possible: ~1/yr
    4: { low: 2.0, mode: 6.0, high: 15.0 },  // Likely: several/yr
    5: { low: 8.0, mode: 24.0, high: 60.0 }  // Almost certain: monthly+
  };

  // Map 1-5 Impact to Primary + Secondary Loss in $k
  const impactMap: Record<number, { primaryMode: number; secondaryMode: number }> = {
    1: { primaryMode: 25, secondaryMode: 10 },     // Insignificant (< $50k)
    2: { primaryMode: 120, secondaryMode: 60 },    // Minor ($100k - $250k)
    3: { primaryMode: 450, secondaryMode: 350 },   // Moderate ($500k - $1M)
    4: { primaryMode: 1600, secondaryMode: 1400 }, // Major ($1M - $4M)
    5: { primaryMode: 4800, secondaryMode: 5200 }  // Severe ($5M - $15M+)
  };

  const curTef = tefMap[risk.likelihood] || tefMap[3];
  const curLoss = impactMap[risk.impact] || impactMap[3];

  const resTef = tefMap[risk.residualLikelihood] || tefMap[2];
  const resLoss = impactMap[risk.residualImpact] || impactMap[2];

  const now = new Date().toISOString();
  const slug = risk.id.toLowerCase().replace(/[^a-z0-9]/g, '-');

  return {
    id: `scenario-aona-${slug}`,
    name: `AI Risk [${risk.id}]: ${risk.category} - ${risk.affectedAiSystems.split('(')[0].trim()}`,
    description: `${risk.description} Key controls: ${risk.keyControls}. (Source: Aona AI Risk Register)`,
    asset: risk.affectedAiSystems,
    threatCommunity: `Adversarial AI Threat Actor / ${risk.category}`,
    threatEffect: risk.category === 'Data leakage' ? 'Confidentiality' : risk.category === 'Model behaviour' ? 'Integrity' : 'All',
    status: 'Approved',
    category: `AI & ${risk.category}`,
    currency: '$',
    unitScale: 1000,
    unitLabel: '$k (Thousands)',
    simulationsCount: 10000,
    randomSeed: Math.floor(Math.random() * 900) + 100,
    proposedControlCost: Math.round(curLoss.primaryMode * 0.25),

    riskTolerance: {
      veryLowMax: 100,
      lowMax: 500,
      moderateMax: 2000,
      significantMax: 5000,
      highMax: 10000,
      targetPercentile: 90
    },

    current: {
      lef: {
        useDirectLef: false,
        directLef: { low: curTef.low * 0.4, mode: curTef.mode * 0.6, high: curTef.high * 0.8, confidence: 4 },
        useDirectTef: true,
        directTef: { low: curTef.low, mode: curTef.mode, high: curTef.high, confidence: 4 },
        contactFrequency: { low: curTef.low * 1.5, mode: curTef.mode * 2, high: curTef.high * 2.5, confidence: 4 },
        probabilityOfAction: { low: 0.3, mode: 0.6, high: 0.85, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.3, mode: 0.6, high: 0.85, confidence: 4 },
        threatCapability: { low: 60, mode: 75, high: 90, confidence: 4 },
        resistanceStrength: { low: 20, mode: 35, high: 50, confidence: 4 }
      },
      primaryLoss: {
        productivity: { low: curLoss.primaryMode * 0.1, mode: curLoss.primaryMode * 0.25, high: curLoss.primaryMode * 0.6, confidence: 4, enabled: true },
        response: { low: curLoss.primaryMode * 0.15, mode: curLoss.primaryMode * 0.35, high: curLoss.primaryMode * 0.8, confidence: 4, enabled: true },
        replacement: { low: curLoss.primaryMode * 0.05, mode: curLoss.primaryMode * 0.15, high: curLoss.primaryMode * 0.4, confidence: 4, enabled: true },
        finesAndJudgements: { low: curLoss.primaryMode * 0.05, mode: curLoss.primaryMode * 0.15, high: curLoss.primaryMode * 0.5, confidence: 4, enabled: true },
        competitiveAdvantage: { low: curLoss.primaryMode * 0.02, mode: curLoss.primaryMode * 0.1, high: curLoss.primaryMode * 0.3, confidence: 4, enabled: true },
        reputation: { low: curLoss.primaryMode * 0.05, mode: curLoss.primaryMode * 0.2, high: curLoss.primaryMode * 0.5, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 30, mode: 65, high: 90, confidence: 4 },
      secondaryLoss: {
        productivity: { low: curLoss.secondaryMode * 0.05, mode: curLoss.secondaryMode * 0.15, high: curLoss.secondaryMode * 0.4, confidence: 4, enabled: true },
        response: { low: curLoss.secondaryMode * 0.1, mode: curLoss.secondaryMode * 0.25, high: curLoss.secondaryMode * 0.6, confidence: 4, enabled: true },
        replacement: { low: curLoss.secondaryMode * 0.05, mode: curLoss.secondaryMode * 0.15, high: curLoss.secondaryMode * 0.4, confidence: 4, enabled: true },
        finesAndJudgements: { low: curLoss.secondaryMode * 0.2, mode: curLoss.secondaryMode * 0.5, high: curLoss.secondaryMode * 1.2, confidence: 4, enabled: true },
        competitiveAdvantage: { low: curLoss.secondaryMode * 0.1, mode: curLoss.secondaryMode * 0.3, high: curLoss.secondaryMode * 0.8, confidence: 4, enabled: true },
        reputation: { low: curLoss.secondaryMode * 0.15, mode: curLoss.secondaryMode * 0.4, high: curLoss.secondaryMode * 1.0, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 1, mode: 6, high: 24, confidence: 4 },
        dataRecordsLoss: { low: 10, mode: 50, high: 250, confidence: 4 }
      }
    },

    hasProposed: true,
    proposed: {
      lef: {
        useDirectLef: false,
        directLef: { low: resTef.low * 0.1, mode: resTef.mode * 0.2, high: resTef.high * 0.4, confidence: 4 },
        useDirectTef: true,
        directTef: { low: resTef.low, mode: resTef.mode, high: resTef.high, confidence: 4 },
        contactFrequency: { low: resTef.low, mode: resTef.mode * 1.2, high: resTef.high * 1.5, confidence: 4 },
        probabilityOfAction: { low: 0.15, mode: 0.3, high: 0.5, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.05, mode: 0.15, high: 0.3, confidence: 4 },
        threatCapability: { low: 60, mode: 75, high: 90, confidence: 4 },
        resistanceStrength: { low: 75, mode: 88, high: 96, confidence: 4 }
      },
      primaryLoss: {
        productivity: { low: resLoss.primaryMode * 0.05, mode: resLoss.primaryMode * 0.15, high: resLoss.primaryMode * 0.35, confidence: 4, enabled: true },
        response: { low: resLoss.primaryMode * 0.08, mode: resLoss.primaryMode * 0.2, high: resLoss.primaryMode * 0.45, confidence: 4, enabled: true },
        replacement: { low: resLoss.primaryMode * 0.02, mode: resLoss.primaryMode * 0.08, high: resLoss.primaryMode * 0.2, confidence: 4, enabled: true },
        finesAndJudgements: { low: 0, mode: resLoss.primaryMode * 0.05, high: resLoss.primaryMode * 0.2, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 0, mode: resLoss.primaryMode * 0.05, high: resLoss.primaryMode * 0.15, confidence: 4, enabled: true },
        reputation: { low: resLoss.primaryMode * 0.02, mode: resLoss.primaryMode * 0.1, high: resLoss.primaryMode * 0.25, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 10, mode: 25, high: 45, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 0, mode: resLoss.secondaryMode * 0.05, high: resLoss.secondaryMode * 0.15, confidence: 4, enabled: true },
        response: { low: resLoss.secondaryMode * 0.05, mode: resLoss.secondaryMode * 0.12, high: resLoss.secondaryMode * 0.3, confidence: 4, enabled: true },
        replacement: { low: 0, mode: resLoss.secondaryMode * 0.05, high: resLoss.secondaryMode * 0.15, confidence: 4, enabled: true },
        finesAndJudgements: { low: resLoss.secondaryMode * 0.05, mode: resLoss.secondaryMode * 0.15, high: resLoss.secondaryMode * 0.4, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 0, mode: resLoss.secondaryMode * 0.08, high: resLoss.secondaryMode * 0.25, confidence: 4, enabled: true },
        reputation: { low: resLoss.secondaryMode * 0.05, mode: resLoss.secondaryMode * 0.15, high: resLoss.secondaryMode * 0.4, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 0.1, mode: 1.0, high: 4.0, confidence: 4 },
        dataRecordsLoss: { low: 0, mode: 2, high: 15, confidence: 4 }
      }
    },

    createdAt: now,
    updatedAt: now
  };
}

/**
 * Converter: Converts an OWASP Agentic Threat into a fully-configured Open FAIR Scenario
 */
export function convertOwaspThreatToFairScenario(threat: OwaspAgenticThreat): FairScenario {
  const now = new Date().toISOString();
  const slug = threat.tid.toLowerCase();

  return {
    id: `scenario-owasp-${slug}`,
    name: `Agentic AI [OWASP ${threat.tid}]: ${threat.name}`,
    description: `${threat.description} (Ref: OWASP Top 10 for Agentic AI / ASI v1.1 - ${threat.playbook})`,
    asset: 'Autonomous Agent Runtime & Enterprise Tool Gateway',
    threatCommunity: 'Adversarial Agentic Exploiter & Prompt Injector',
    threatEffect: 'All',
    status: 'Approved',
    category: 'Agentic AI Security',
    currency: '$',
    unitScale: 1000,
    unitLabel: '$k (Thousands)',
    simulationsCount: 10000,
    randomSeed: 200 + parseInt(threat.tid.replace('T', ''), 10) || 201,
    proposedControlCost: 450, // $450k/year for Agent Guardrails & Sandboxing

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
        directLef: { low: 0.5, mode: 2.2, high: 5.5, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 10, mode: 35, high: 80, confidence: 4 },
        contactFrequency: { low: 15, mode: 45, high: 100, confidence: 4 },
        probabilityOfAction: { low: 0.4, mode: 0.7, high: 0.9, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.3, mode: 0.55, high: 0.8, confidence: 4 },
        threatCapability: { low: 65, mode: 82, high: 95, confidence: 4 },
        resistanceStrength: { low: 25, mode: 45, high: 62, confidence: 4 }
      },
      primaryLoss: {
        productivity: { low: 100, mode: 400, high: 1200, confidence: 4, enabled: true },
        response: { low: 150, mode: 550, high: 1800, confidence: 4, enabled: true },
        replacement: { low: 50, mode: 200, high: 700, confidence: 4, enabled: true },
        finesAndJudgements: { low: 80, mode: 350, high: 1200, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 100, mode: 450, high: 1500, confidence: 4, enabled: true },
        reputation: { low: 120, mode: 500, high: 1600, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 40, mode: 75, high: 95, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 30, mode: 120, high: 400, confidence: 4, enabled: true },
        response: { low: 100, mode: 350, high: 1100, confidence: 4, enabled: true },
        replacement: { low: 40, mode: 150, high: 500, confidence: 4, enabled: true },
        finesAndJudgements: { low: 300, mode: 1200, high: 4500, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 200, mode: 800, high: 2800, confidence: 4, enabled: true },
        reputation: { low: 250, mode: 950, high: 3200, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 2, mode: 14, high: 48, confidence: 4 },
        dataRecordsLoss: { low: 20, mode: 150, high: 800, confidence: 4 }
      }
    },

    hasProposed: true,
    proposed: {
      lef: {
        useDirectLef: false,
        directLef: { low: 0.05, mode: 0.25, high: 0.8, confidence: 4 },
        useDirectTef: false,
        directTef: { low: 3, mode: 10, high: 25, confidence: 4 },
        contactFrequency: { low: 5, mode: 18, high: 40, confidence: 4 },
        probabilityOfAction: { low: 0.15, mode: 0.35, high: 0.6, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.04, mode: 0.12, high: 0.25, confidence: 4 },
        threatCapability: { low: 65, mode: 82, high: 95, confidence: 4 },
        resistanceStrength: { low: 78, mode: 90, high: 98, confidence: 4 }
      },
      primaryLoss: {
        productivity: { low: 20, mode: 70, high: 220, confidence: 4, enabled: true },
        response: { low: 30, mode: 100, high: 300, confidence: 4, enabled: true },
        replacement: { low: 10, mode: 40, high: 140, confidence: 4, enabled: true },
        finesAndJudgements: { low: 0, mode: 40, high: 150, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 10, mode: 50, high: 180, confidence: 4, enabled: true },
        reputation: { low: 20, mode: 80, high: 250, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 8, mode: 22, high: 45, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 0, mode: 20, high: 80, confidence: 4, enabled: true },
        response: { low: 20, mode: 70, high: 220, confidence: 4, enabled: true },
        replacement: { low: 5, mode: 25, high: 90, confidence: 4, enabled: true },
        finesAndJudgements: { low: 50, mode: 200, high: 750, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 30, mode: 120, high: 450, confidence: 4, enabled: true },
        reputation: { low: 40, mode: 160, high: 550, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 0.2, mode: 1.5, high: 6.0, confidence: 4 },
        dataRecordsLoss: { low: 0, mode: 5, high: 30, confidence: 4 }
      }
    },

    createdAt: now,
    updatedAt: now
  };
}
