import { FairScenario } from '../types/fair';

export type ThreatDomain = 'ai-owasp' | 'infosec' | 'tech' | 'sans' | 'regulatory';

export interface ThreatCatalogItem {
  id: string;
  domain: ThreatDomain;
  category: string;
  name: string;
  description: string;
  asset: string;
  threatCommunity: string;
  likelihood: number; // 1-5 scale
  impact: number; // 1-5 scale
  inherentScore: number;
  residualLikelihood: number;
  residualImpact: number;
  residualScore: number;
  keyControls: string;
  controlOwner: string;
  standardReference: string; // e.g. "ISO 27001:2022 A.8.7", "SANS CWE-89", "NIST CSF PR.AC"
  status: 'Open' | 'Mitigating' | 'Accepted' | 'Closed';
  // Financial estimate baseline ($k)
  typicalLossRange: {
    low: number;
    mode: number;
    high: number;
  };
  contactFreqAnnual: {
    low: number;
    mode: number;
    high: number;
  };
}

// 1. INFORMATION SECURITY THREATS
export const INFOSEC_THREAT_CATALOG: ThreatCatalogItem[] = [
  {
    id: 'SEC-RN-01',
    domain: 'infosec',
    category: 'Ransomware & Malware Extortion',
    name: 'Multi-Stage Double-Extortion Ransomware Attack',
    description: 'Threat actors gain foothold via compromised VPN credentials, execute privilege escalation, exfiltrate confidential customer databases, and encrypt hypervisor storage cluster with double extortion demands.',
    asset: 'Enterprise SAN Storage & Critical ERP Database',
    threatCommunity: 'Organised Cybercriminal Syndicate (Ransomware-as-a-Service)',
    likelihood: 4,
    impact: 5,
    inherentScore: 20,
    residualLikelihood: 2,
    residualImpact: 4,
    residualScore: 8,
    keyControls: 'Immutable cloud backups (WORM), EDR/XDR with behavioral heuristic isolation, network micro-segmentation, continuous MFA verification',
    controlOwner: 'CISO / Head of SecOps',
    standardReference: 'NIST CSF PR.IP-4 / ISO 27001 A.8.7',
    status: 'Mitigating',
    typicalLossRange: { low: 800, mode: 3500, high: 14000 },
    contactFreqAnnual: { low: 4, mode: 18, high: 45 }
  },
  {
    id: 'SEC-PH-02',
    domain: 'infosec',
    category: 'Social Engineering & Phishing',
    name: 'Executive AI-Voice Cloned Wire Fraud (BEC)',
    description: 'Adversaries utilize generative deepfake voice synthesis impersonating the Chief Financial Officer on Microsoft Teams to instruct junior treasury analysts to authorize an urgent offshore supplier invoice settlement.',
    asset: 'Corporate Treasury Operational Accounts & Wire Rail',
    threatCommunity: 'Financially-Motivated Business Email Compromise Gang',
    likelihood: 4,
    impact: 4,
    inherentScore: 16,
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    keyControls: 'Dual-authorized out-of-band cryptographic verification on wires >$50k, mandatory vendor account bank callback verification, anti-spoofing gateway',
    controlOwner: 'Head of Treasury & Financial Crimes',
    standardReference: 'ACFE BEC Framework / ISO 27001 A.8.5',
    status: 'Mitigating',
    typicalLossRange: { low: 350, mode: 1200, high: 4800 },
    contactFreqAnnual: { low: 12, mode: 45, high: 120 }
  },
  {
    id: 'SEC-IN-03',
    domain: 'infosec',
    category: 'Insider Threat & Data Exfiltration',
    name: 'Disgruntled Senior Engineer IP & Credential Exfiltration',
    description: 'A departing senior site reliability engineer downloads production credentials, source repositories, and customer tokens to personal cloud storage prior to resignation.',
    asset: 'Proprietary Core Algorithm & Production Secret Vault',
    threatCommunity: 'Privileged Malicious Insider',
    likelihood: 3,
    impact: 5,
    inherentScore: 15,
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    keyControls: 'Automated offboarding credential revocation, User & Entity Behavior Analytics (UEBA), endpoint DLP blocking USB and unsanctioned cloud drives',
    controlOwner: 'Director of Information Security',
    standardReference: 'NIST SP 800-53 PS-4 / ISO 27001 A.6.5',
    status: 'Mitigating',
    typicalLossRange: { low: 500, mode: 2200, high: 8500 },
    contactFreqAnnual: { low: 1, mode: 5, high: 15 }
  },
  {
    id: 'SEC-SC-04',
    domain: 'infosec',
    category: 'Supply Chain Compromise',
    name: 'Third-Party SaaS Vendor Credential Vault Breach',
    description: 'A major enterprise ticketing and customer service vendor suffers an intrusion where OAuth refresh tokens and API secret keys granting read/write access to internal systems are leaked.',
    asset: 'Enterprise API Gateway & Customer Support Data',
    threatCommunity: 'Nation-State Advanced Persistent Threat (APT)',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    keyControls: 'Continuous vendor security posture assessment, OAuth token lifetime rotation (max 12 hours), zero-trust egress IP filtering',
    controlOwner: 'Third-Party Risk Management Lead',
    standardReference: 'ISO 27001 A.5.19 / NIST SP 800-161',
    status: 'Open',
    typicalLossRange: { low: 400, mode: 1800, high: 7000 },
    contactFreqAnnual: { low: 2, mode: 8, high: 25 }
  },
  {
    id: 'SEC-CS-05',
    domain: 'infosec',
    category: 'Credential Stuffing & Account Takeover',
    name: 'Distributed Botnet Credential Stuffing on Consumer Portal',
    description: 'Automated adversary botnet utilizes 50 million credentials leaked from third-party breaches to attempt account takeovers against customer banking and e-commerce portal, bypassing legacy rate limits via residential proxies.',
    asset: 'Customer Facing Portal & Loyalty Point Ledger',
    threatCommunity: 'Automated Account Takeover (ATO) Broker',
    likelihood: 5,
    impact: 3,
    inherentScore: 15,
    residualLikelihood: 2,
    residualImpact: 2,
    residualScore: 4,
    keyControls: 'FIDO2 / WebAuthn passkey authentication, bot behavioral biometrics, automated compromised credential check against HaveIBeenPwned API',
    controlOwner: 'Identity & Access Management Architect',
    standardReference: 'OWASP Automated Threats OAT-008',
    status: 'Mitigating',
    typicalLossRange: { low: 200, mode: 850, high: 3200 },
    contactFreqAnnual: { low: 50, mode: 250, high: 1000 }
  }
];

// 2. TECHNOLOGY & INFRASTRUCTURE THREATS
export const TECH_THREAT_CATALOG: ThreatCatalogItem[] = [
  {
    id: 'TECH-CL-01',
    domain: 'tech',
    category: 'Cloud Infrastructure Outage',
    name: 'Primary Cloud Provider Multi-AZ Availability Outage',
    description: 'Severe DNS and control-plane cascading failure in primary AWS/GCP region knocks out core transaction processing, API gateways, and distributed cache for 11 continuous business hours.',
    asset: 'High-Availability Multi-Region Kubernetes Cluster',
    threatCommunity: 'Cloud Hyperscaler Infrastructure Anomaly / Environmental Failure',
    likelihood: 3,
    impact: 5,
    inherentScore: 15,
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    keyControls: 'Active-Active multi-region architectural failover, global Anycast DNS routing, automated RTO/RPO health probes with circuit breaker',
    controlOwner: 'VP of Infrastructure & Site Reliability',
    standardReference: 'ISO 22301 / DORA Article 11',
    status: 'Mitigating',
    typicalLossRange: { low: 1200, mode: 4500, high: 18000 },
    contactFreqAnnual: { low: 0.5, mode: 2, high: 6 }
  },
  {
    id: 'TECH-AP-02',
    domain: 'tech',
    category: 'API & Dependency Failure',
    name: 'Critical Payment Gateway & Clearinghouse API Partition',
    description: 'Global payment gateway partner API encounters a cascading deadlock timeout, rejecting 88% of real-time point-of-sale and online checkout transactions during peak seasonal shopping period.',
    asset: 'Omnichannel Payment Clearing Bus',
    threatCommunity: 'Third-Party Financial Service Provider System Fault',
    likelihood: 4,
    impact: 4,
    inherentScore: 16,
    residualLikelihood: 2,
    residualImpact: 3,
    residualScore: 6,
    keyControls: 'Multi-provider payment fallback routing (Stripe/Adyen/Worldpay auto-switch), idempotent queue buffering with offline transaction capture',
    controlOwner: 'Principal Payments Architect',
    standardReference: 'PCI-DSS v4.0 Requirement 6.4',
    status: 'Mitigating',
    typicalLossRange: { low: 600, mode: 2800, high: 9500 },
    contactFreqAnnual: { low: 3, mode: 12, high: 35 }
  },
  {
    id: 'TECH-DD-03',
    domain: 'tech',
    category: 'DDoS & Network Saturation',
    name: 'Multi-Terabit Volumetric & Layer-7 HTTPS Flood',
    description: 'State-sponsored adversary botnet launches a 3.2 Tbps volumetric UDP reflection attack coupled with 800,000 requests/sec Layer-7 SSL handshakes targeting public DNS and ingress edge load balancers.',
    asset: 'Edge Content Delivery Network & Ingress Gateways',
    threatCommunity: 'Extortionist DDoS Botnet Consortium',
    likelihood: 4,
    impact: 4,
    inherentScore: 16,
    residualLikelihood: 2,
    residualImpact: 2,
    residualScore: 4,
    keyControls: 'Cloudflare / AWS Shield Advanced DDoS mitigation, upstream ISP BGP Flowspec rate limiting, web application firewall rate limiting rules',
    controlOwner: 'Network Security Operations Manager',
    standardReference: 'NIST SP 800-189 / ISO 27001 A.8.20',
    status: 'Mitigating',
    typicalLossRange: { low: 300, mode: 1400, high: 5500 },
    contactFreqAnnual: { low: 5, mode: 24, high: 80 }
  },
  {
    id: 'TECH-DB-04',
    domain: 'tech',
    category: 'Data Corruption & Storage Failure',
    name: 'Silent Distributed Database Replication Ledger Desynchronization',
    description: 'A firmware bug in distributed SSD storage controllers produces non-replicated bit rot across active read replicas, causing inconsistent financial balances and transactional data divergence.',
    asset: 'Transactional Financial Ledger Cluster',
    threatCommunity: 'Hardware Firmware Anomaly / Media Degradation',
    likelihood: 2,
    impact: 5,
    inherentScore: 10,
    residualLikelihood: 1,
    residualImpact: 3,
    residualScore: 3,
    keyControls: 'End-to-end cryptographic checksumming, hourly automated reconciliation auditing between master and replica logs, point-in-time recovery testing',
    controlOwner: 'Lead Database Administrator',
    standardReference: 'COBIT BAI09 / ISO 27001 A.8.14',
    status: 'Mitigating',
    typicalLossRange: { low: 900, mode: 3800, high: 15000 },
    contactFreqAnnual: { low: 0.2, mode: 1, high: 3 }
  }
];

// 3. SANS TOP 25 / CWE SOFTWARE SECURITY THREATS
export const SANS_THREAT_CATALOG: ThreatCatalogItem[] = [
  {
    id: 'SANS-CWE-89',
    domain: 'sans',
    category: 'CWE-89: SQL Injection',
    name: 'Blind SQL Injection in Core Customer Billing Reporting Engine',
    description: 'An unauthenticated parameter injection in export billing endpoints allows malicious actors to execute second-order SQL injection, dumping full customer PII, credit card tokens, and cryptographic password salts.',
    asset: 'Customer Account & Billing Data Warehouse',
    threatCommunity: 'External Cybercriminal / Opportunistic Web Attacker',
    likelihood: 4,
    impact: 5,
    inherentScore: 20,
    residualLikelihood: 1,
    residualImpact: 3,
    residualScore: 3,
    keyControls: 'Strict parameterized queries (PreparedStatements) enforced by linter and SAST, input typing and validation, database least-privilege service account',
    controlOwner: 'Application Security Lead',
    standardReference: 'SANS Top 25 #2 / CWE-89 / OWASP Top 10 A03:2021',
    status: 'Mitigating',
    typicalLossRange: { low: 700, mode: 3200, high: 12500 },
    contactFreqAnnual: { low: 15, mode: 60, high: 200 }
  },
  {
    id: 'SANS-CWE-78',
    domain: 'sans',
    category: 'CWE-78: OS Command Injection',
    name: 'Remote Code Execution via Image Conversion Parser (RCE)',
    description: 'An image transformation and file upload microservice improperly concatenates unsanitized user-supplied filenames into a shell execution utility, granting root container escape and reverse shell execution.',
    asset: 'Production Media Processing Container Pod',
    threatCommunity: 'Targeted External Exploit Developer',
    likelihood: 3,
    impact: 5,
    inherentScore: 15,
    residualLikelihood: 1,
    residualImpact: 3,
    residualScore: 3,
    keyControls: 'No shell invocation wrappers, container rootless read-only filesystems, seccomp/AppArmor syscall filtering, container runtime intrusion detection (Falco)',
    controlOwner: 'DevSecOps Manager',
    standardReference: 'SANS Top 25 #5 / CWE-78',
    status: 'Mitigating',
    typicalLossRange: { low: 850, mode: 3900, high: 16000 },
    contactFreqAnnual: { low: 6, mode: 22, high: 65 }
  },
  {
    id: 'SANS-CWE-287',
    domain: 'sans',
    category: 'CWE-287: Improper Authentication',
    name: 'JWT Algorithm Confusion and Key-Injection Auth Bypass',
    description: 'Microservice authentication middleware accepts "none" or asymmetric RSA keys converted to symmetric HMAC without signature validation, enabling adversary to forge administrator identity tokens at will.',
    asset: 'Internal Microservice Service Mesh Gateway',
    threatCommunity: 'Adversarial API Intruder',
    likelihood: 3,
    impact: 5,
    inherentScore: 15,
    residualLikelihood: 1,
    residualImpact: 2,
    residualScore: 2,
    keyControls: 'Hardened cryptographic verification library with strict algorithm whitelisting, JWKS public key rotation, central Identity Provider validation',
    controlOwner: 'Principal Security Architect',
    standardReference: 'SANS Top 25 #7 / CWE-287 / OWASP A07:2021',
    status: 'Mitigating',
    typicalLossRange: { low: 500, mode: 2400, high: 9500 },
    contactFreqAnnual: { low: 8, mode: 30, high: 90 }
  },
  {
    id: 'SANS-CWE-918',
    domain: 'sans',
    category: 'CWE-918: Server-Side Request Forgery',
    name: 'SSRF Cloud Metadata Exfiltration via Webhook Dispatcher',
    description: 'A webhook test invocation endpoint allows user-controlled destination URLs, enabling attackers to query AWS IMDSv1 (169.254.169.254) and retrieve IAM node instance credentials.',
    asset: 'Cloud Metadata Service & IAM Instance Roles',
    threatCommunity: 'Cloud Security Pentester / External Intruder',
    likelihood: 4,
    impact: 4,
    inherentScore: 16,
    residualLikelihood: 1,
    residualImpact: 2,
    residualScore: 2,
    keyControls: 'Mandatory IMDSv2 with token hop limit 1, egress proxy blocking private RFC 1918 and link-local ranges, strict URL scheme and domain whitelist',
    controlOwner: 'Cloud Security Lead',
    standardReference: 'SANS Top 25 #19 / CWE-918 / OWASP A10:2021',
    status: 'Mitigating',
    typicalLossRange: { low: 450, mode: 1900, high: 7500 },
    contactFreqAnnual: { low: 10, mode: 40, high: 110 }
  }
];

// 4. REGULATORY & COMPLIANCE MANDATES
export const REGULATORY_THREAT_CATALOG: ThreatCatalogItem[] = [
  {
    id: 'REG-DPDPA-01',
    domain: 'regulatory',
    category: 'India DPDPA 2023 Enforcement',
    name: 'DPDPA Section 8(5) Failure to Prevent Breach of Personal Data (₹250 Crore Fine)',
    description: 'Data Fiduciary suffers an unauthorized breach or exfiltration of citizen personal digital records due to failure to implement reasonable security safeguards under Section 8(5) of the Digital Personal Data Protection Act (DPDPA) 2023. Data Protection Board of India (DPBI) adjudicates statutory maximum fine under Schedule 1 up to ₹250 Crore ($30M USD equivalent) plus mandatory customer notifications and remediation directives.',
    asset: 'Citizen Digital PII Repository & DPBI Compliance Charter',
    threatCommunity: 'Data Protection Board of India (DPBI) & Ministry of Electronics and IT (MeitY)',
    likelihood: 3,
    impact: 5,
    inherentScore: 15,
    residualLikelihood: 1,
    residualImpact: 3,
    residualScore: 3,
    keyControls: 'End-to-end data encryption at rest and in transit, automated Data Protection Impact Assessments (DPIA), data residency compliance, privileged access management (PAM), continuous penetration testing, and DPBI 72-hr escalation workflow',
    controlOwner: 'Data Protection Officer (DPO - India) & Chief Legal Counsel',
    standardReference: 'India DPDPA 2023 Section 8(5) & Schedule 1 (₹250 Cr Penalty)',
    status: 'Mitigating',
    typicalLossRange: { low: 5000, mode: 18000, high: 32000 },
    contactFreqAnnual: { low: 0.5, mode: 1.5, high: 4 }
  },
  {
    id: 'REG-DPDPA-02',
    domain: 'regulatory',
    category: 'India DPDPA 2023 Enforcement',
    name: 'DPDPA Section 9 Breach of Children Data Obligations & Behavioral Tracking (₹200 Crore Fine)',
    description: 'Processing personal data of children or persons with disability without verifiable parental consent, or conducting behavioral tracking and targeted advertising directed at children in violation of Section 9 of DPDPA 2023. Subject to statutory fines under Schedule 1 up to ₹200 Crore ($24M USD equivalent), regulatory audit orders, and marketing campaign injunctions.',
    asset: 'Consumer Onboarding Portal & Customer Analytics Platform',
    threatCommunity: 'Data Protection Board of India (DPBI) & Child Rights Advocates',
    likelihood: 2,
    impact: 5,
    inherentScore: 10,
    residualLikelihood: 1,
    residualImpact: 2,
    residualScore: 2,
    keyControls: 'Age-gate verification mechanisms, parental consent workflow, strict zero-tracking algorithms on minor accounts, data classification gates on user profiling engines',
    controlOwner: 'Chief Privacy Officer & VP of Product Compliance',
    standardReference: 'India DPDPA 2023 Section 9 & Schedule 1 (₹200 Cr Penalty)',
    status: 'Mitigating',
    typicalLossRange: { low: 3000, mode: 12000, high: 26000 },
    contactFreqAnnual: { low: 0.3, mode: 1.0, high: 3 }
  },
  {
    id: 'REG-DPDPA-03',
    domain: 'regulatory',
    category: 'India DPDPA 2023 Enforcement',
    name: 'DPDPA Section 8(6) Failure to Notify Data Protection Board and Affected Principals of Breach (₹200 Crore Fine)',
    description: 'Following a confirmed digital personal data breach, Data Fiduciary fails to intimate the Data Protection Board of India and each affected Data Principal in the prescribed form and manner. Failure to notify constitutes a distinct statutory offense carrying up to ₹200 Crore ($24M USD equivalent) penalties independent of underlying breach causes.',
    asset: 'Incident Response Governance & Executive Communications',
    threatCommunity: 'Data Protection Board of India (DPBI) Enforcement Bench',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    residualLikelihood: 1,
    residualImpact: 2,
    residualScore: 2,
    keyControls: 'Automated breach detection correlation, integrated legal escalation runbooks with sub-48-hour DPBI notification trigger, multi-channel customer advisory dispatch platform',
    controlOwner: 'Head of Incident Response & General Counsel',
    standardReference: 'India DPDPA 2023 Section 8(6) & Schedule 1 (₹200 Cr Penalty)',
    status: 'Mitigating',
    typicalLossRange: { low: 2500, mode: 10000, high: 24000 },
    contactFreqAnnual: { low: 0.5, mode: 1.8, high: 5 }
  },
  {
    id: 'REG-GDPR-01',
    domain: 'regulatory',
    category: 'EU GDPR Enforcement (Tier 2 Fines)',
    name: 'GDPR Article 83(5) Core Privacy Principles & Legal Basis Violation (Up to €20M or 4% Global Turnover)',
    description: 'Systemic failure to obtain valid GDPR consent or establish legitimate interest for large-scale customer data processing, profiling, or cross-border transfers to third countries without adequate safeguards (Articles 5, 6, 9, 44-49). European Data Protection Board (EDPB) and Lead Supervisory Authorities levy statutory maximum Tier-2 administrative fines of up to €20,000,000 or 4% of total worldwide annual turnover (exemplified by landmark Meta €1.2B and Amazon €746M fines).',
    asset: 'Global Customer Identity, CRM & Cross-Border Data Pipelines',
    threatCommunity: 'European Data Protection Authorities (Irish DPC, CNIL France, BfDI Germany, EDPB)',
    likelihood: 3,
    impact: 5,
    inherentScore: 15,
    residualLikelihood: 1,
    residualImpact: 4,
    residualScore: 4,
    keyControls: 'Standard Contractual Clauses (SCCs), Transfer Impact Assessments (TIA), granular Cookie/Consent management platform, purpose-limitation data tagging, annual regulatory audits',
    controlOwner: 'Data Protection Officer (DPO) & VP Regulatory Affairs',
    standardReference: 'EU GDPR Regulation 2016/679 Articles 5, 6, 44, 83(5) (Max 4% Global Turnover)',
    status: 'Mitigating',
    typicalLossRange: { low: 15000, mode: 45000, high: 180000 },
    contactFreqAnnual: { low: 0.2, mode: 0.8, high: 2.5 }
  },
  {
    id: 'REG-GDPR-02',
    domain: 'regulatory',
    category: 'EU GDPR Enforcement (Tier 1 Fines)',
    name: 'GDPR Article 83(4) Technical & Organizational Security Breach (Article 32) & Delayed 72h Notification (Article 33)',
    description: 'Failure to implement state-of-the-art technical and organizational security measures appropriate to the risk (Article 32) or failure to notify the supervisory authority within 72 hours of becoming aware of a personal data breach (Article 33). Subject to Tier-1 fines up to €10,000,000 or 2% of total worldwide annual turnover (exemplified by British Airways €22M and Marriott €20.4M breach sanctions).',
    asset: 'Enterprise Production Databases & Customer Payment Store',
    threatCommunity: 'National Data Protection Supervisory Authorities (ICO, CNIL, DPC)',
    likelihood: 4,
    impact: 4,
    inherentScore: 16,
    residualLikelihood: 1,
    residualImpact: 3,
    residualScore: 3,
    keyControls: 'Mandatory end-to-end encryption, automated credential leakage monitoring, 72-hour regulatory notification playbooks, quarterly red-team resilience testing',
    controlOwner: 'Chief Information Security Officer (CISO) & Data Protection Officer',
    standardReference: 'EU GDPR Regulation 2016/679 Articles 32, 33, 83(4) (Max 2% Global Turnover)',
    status: 'Mitigating',
    typicalLossRange: { low: 4000, mode: 16000, high: 55000 },
    contactFreqAnnual: { low: 0.5, mode: 2.0, high: 5 }
  },
  {
    id: 'REG-SEC-01',
    domain: 'regulatory',
    category: 'SEC Cyber Disclosure Rules',
    name: 'Failure to Disclose Material Cybersecurity Incident within 4 Business Days (Item 1.05 Form 8-K)',
    description: 'An undetected data compromise is assessed as non-material by technical teams; subsequent investigation reveals material customer breach, triggering SEC enforcement action, shareholder class action lawsuits, and trading sanctions.',
    asset: 'Executive Board Governance & Public Shareholder Value',
    threatCommunity: 'SEC Enforcement Division & Securities Litigation Bar',
    likelihood: 3,
    impact: 5,
    inherentScore: 15,
    residualLikelihood: 1,
    residualImpact: 3,
    residualScore: 3,
    keyControls: 'Quantitative FAIR financial materiality thresholds established with Legal Counsel, 24-hour escalation protocol for incidents >$1M exposure',
    controlOwner: 'General Counsel & Chief Compliance Officer',
    standardReference: 'SEC Final Rule 33-11216 / Item 1.05 Form 8-K',
    status: 'Mitigating',
    typicalLossRange: { low: 1500, mode: 6500, high: 25000 },
    contactFreqAnnual: { low: 0.5, mode: 2, high: 5 }
  },
  {
    id: 'REG-DORA-02',
    domain: 'regulatory',
    category: 'EU Digital Operational Resilience Act (DORA)',
    name: 'DORA Article 28 Critical ICT Third-Party Concentration Violation',
    description: 'Financial supervisory authority audits single cloud provider concentration risk without tested exit strategies, issuing formal sanctions and requiring mandatory capital reserve surcharges.',
    asset: 'EU Banking License & Operational Resilience Charter',
    threatCommunity: 'European Banking Authority (EBA) / National Competent Authority',
    likelihood: 4,
    impact: 4,
    inherentScore: 16,
    residualLikelihood: 2,
    residualImpact: 2,
    residualScore: 4,
    keyControls: 'Documented multi-vendor disaster recovery drills, formal exit strategies with 48-hour data portability tests, third-party ICT registry maintenance',
    controlOwner: 'Operational Risk & Regulatory Affairs Officer',
    standardReference: 'EU Regulation 2022/2554 (DORA) Articles 28-30',
    status: 'Mitigating',
    typicalLossRange: { low: 800, mode: 3200, high: 11000 },
    contactFreqAnnual: { low: 1, mode: 3, high: 8 }
  }
];

// Helper: Convert any ThreatCatalogItem into an Open FAIR Scenario
export function convertCatalogItemToFairScenario(item: ThreatCatalogItem): FairScenario {
  const now = new Date().toISOString();
  const slug = item.id.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const primaryTotalMode = item.typicalLossRange.mode * 0.65;
  const secondaryTotalMode = item.typicalLossRange.mode * 0.35;

  return {
    id: `scenario-${slug}`,
    name: `[${item.id}] ${item.name}`,
    description: `${item.description} (Standard: ${item.standardReference} • Controls: ${item.keyControls})`,
    asset: item.asset,
    threatCommunity: item.threatCommunity,
    threatEffect: 'All',
    status: 'Approved',
    category: item.category,
    currency: '$',
    unitScale: 1000,
    unitLabel: '$k (Thousands)',
    simulationsCount: 10000,
    randomSeed: 300 + Math.floor(item.typicalLossRange.mode % 700),
    proposedControlCost: Math.round(item.typicalLossRange.mode * 0.12),

    riskTolerance: {
      veryLowMax: 150,
      lowMax: 800,
      moderateMax: 2500,
      significantMax: 6000,
      highMax: 15000,
      targetPercentile: 90
    },

    current: {
      lef: {
        useDirectLef: false,
        directLef: { low: item.contactFreqAnnual.low * 0.3, mode: item.contactFreqAnnual.mode * 0.5, high: item.contactFreqAnnual.high * 0.8, confidence: 4 },
        useDirectTef: true,
        directTef: { low: item.contactFreqAnnual.low, mode: item.contactFreqAnnual.mode, high: item.contactFreqAnnual.high, confidence: 4 },
        contactFrequency: { low: item.contactFreqAnnual.low * 1.2, mode: item.contactFreqAnnual.mode * 1.8, high: item.contactFreqAnnual.high * 2.5, confidence: 4 },
        probabilityOfAction: { low: 0.35, mode: 0.65, high: 0.85, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.25, mode: 0.55, high: 0.8, confidence: 4 },
        threatCapability: { low: 65, mode: 80, high: 95, confidence: 4 },
        resistanceStrength: { low: 25, mode: 45, high: 65, confidence: 4 }
      },
      primaryLoss: {
        productivity: { low: primaryTotalMode * 0.1, mode: primaryTotalMode * 0.3, high: primaryTotalMode * 0.6, confidence: 4, enabled: true },
        response: { low: primaryTotalMode * 0.15, mode: primaryTotalMode * 0.35, high: primaryTotalMode * 0.7, confidence: 4, enabled: true },
        replacement: { low: primaryTotalMode * 0.05, mode: primaryTotalMode * 0.15, high: primaryTotalMode * 0.4, confidence: 4, enabled: true },
        finesAndJudgements: { low: primaryTotalMode * 0.02, mode: primaryTotalMode * 0.1, high: primaryTotalMode * 0.3, confidence: 4, enabled: true },
        competitiveAdvantage: { low: primaryTotalMode * 0.02, mode: primaryTotalMode * 0.05, high: primaryTotalMode * 0.15, confidence: 4, enabled: true },
        reputation: { low: primaryTotalMode * 0.02, mode: primaryTotalMode * 0.05, high: primaryTotalMode * 0.2, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 25, mode: 60, high: 85, confidence: 4 },
      secondaryLoss: {
        productivity: { low: secondaryTotalMode * 0.05, mode: secondaryTotalMode * 0.15, high: secondaryTotalMode * 0.3, confidence: 4, enabled: true },
        response: { low: secondaryTotalMode * 0.1, mode: secondaryTotalMode * 0.25, high: secondaryTotalMode * 0.5, confidence: 4, enabled: true },
        replacement: { low: secondaryTotalMode * 0.02, mode: secondaryTotalMode * 0.1, high: secondaryTotalMode * 0.25, confidence: 4, enabled: true },
        finesAndJudgements: { low: secondaryTotalMode * 0.15, mode: secondaryTotalMode * 0.4, high: secondaryTotalMode * 0.9, confidence: 4, enabled: true },
        competitiveAdvantage: { low: secondaryTotalMode * 0.05, mode: secondaryTotalMode * 0.2, high: secondaryTotalMode * 0.5, confidence: 4, enabled: true },
        reputation: { low: secondaryTotalMode * 0.1, mode: secondaryTotalMode * 0.35, high: secondaryTotalMode * 0.8, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 1, mode: 8, high: 36, confidence: 4 },
        dataRecordsLoss: { low: 20, mode: 150, high: 750, confidence: 4 }
      }
    },

    hasProposed: true,
    proposed: {
      lef: {
        useDirectLef: false,
        directLef: { low: item.contactFreqAnnual.low * 0.05, mode: item.contactFreqAnnual.mode * 0.15, high: item.contactFreqAnnual.high * 0.35, confidence: 4 },
        useDirectTef: true,
        directTef: { low: item.contactFreqAnnual.low * 0.5, mode: item.contactFreqAnnual.mode * 0.6, high: item.contactFreqAnnual.high * 0.7, confidence: 4 },
        contactFrequency: { low: item.contactFreqAnnual.low * 0.8, mode: item.contactFreqAnnual.mode, high: item.contactFreqAnnual.high * 1.2, confidence: 4 },
        probabilityOfAction: { low: 0.15, mode: 0.35, high: 0.55, confidence: 4 },
        useDirectVuln: false,
        directVuln: { low: 0.05, mode: 0.15, high: 0.3, confidence: 4 },
        threatCapability: { low: 65, mode: 80, high: 95, confidence: 4 },
        resistanceStrength: { low: 75, mode: 88, high: 96, confidence: 4 }
      },
      primaryLoss: {
        productivity: { low: primaryTotalMode * 0.03, mode: primaryTotalMode * 0.08, high: primaryTotalMode * 0.2, confidence: 4, enabled: true },
        response: { low: primaryTotalMode * 0.04, mode: primaryTotalMode * 0.1, high: primaryTotalMode * 0.25, confidence: 4, enabled: true },
        replacement: { low: primaryTotalMode * 0.01, mode: primaryTotalMode * 0.04, high: primaryTotalMode * 0.12, confidence: 4, enabled: true },
        finesAndJudgements: { low: 0, mode: primaryTotalMode * 0.02, high: primaryTotalMode * 0.08, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 0, mode: primaryTotalMode * 0.02, high: primaryTotalMode * 0.06, confidence: 4, enabled: true },
        reputation: { low: 0, mode: primaryTotalMode * 0.02, high: primaryTotalMode * 0.06, confidence: 4, enabled: true }
      },
      secondaryLossEventFreq: { low: 8, mode: 20, high: 40, confidence: 4 },
      secondaryLoss: {
        productivity: { low: 0, mode: secondaryTotalMode * 0.03, high: secondaryTotalMode * 0.1, confidence: 4, enabled: true },
        response: { low: secondaryTotalMode * 0.02, mode: secondaryTotalMode * 0.08, high: secondaryTotalMode * 0.2, confidence: 4, enabled: true },
        replacement: { low: 0, mode: secondaryTotalMode * 0.03, high: secondaryTotalMode * 0.08, confidence: 4, enabled: true },
        finesAndJudgements: { low: secondaryTotalMode * 0.02, mode: secondaryTotalMode * 0.1, high: secondaryTotalMode * 0.3, confidence: 4, enabled: true },
        competitiveAdvantage: { low: 0, mode: secondaryTotalMode * 0.04, high: secondaryTotalMode * 0.15, confidence: 4, enabled: true },
        reputation: { low: secondaryTotalMode * 0.02, mode: secondaryTotalMode * 0.08, high: secondaryTotalMode * 0.25, confidence: 4, enabled: true }
      },
      operationalLoss: {
        serviceDowntimeHours: { low: 0.1, mode: 1.2, high: 5.0, confidence: 4 },
        dataRecordsLoss: { low: 0, mode: 5, high: 30, confidence: 4 }
      }
    },

    createdAt: now,
    updatedAt: now
  };
}
