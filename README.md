# QUANTRISKSCALE

> **Enterprise-Grade Open FAIR™ Quantitative Cyber Risk Modeling & Monte Carlo Simulation Platform**

---

## 📌 Overview

**QUANTRISKSCALE** is an air-gapped, local-first quantitative cyber and operational risk analytics platform built on the **Open Group Risk Taxonomy (O-RT)** and **Open Group Risk Analysis (O-RA)** standards. It transforms subjective risk matrices (e.g., "High/Medium/Low" heatmaps) into rigorous financial risk distributions, Annualized Loss Expectancy (ALE), Value at Risk (VaR), Loss Exceedance Curves (LEC), and Return on Security Investment (ROSI) metrics.

### 💡 Why QUANTRISKSCALE?
Traditional risk management frequently relies on subjective color-coded matrices and ordinal scores that cannot be aggregated, mathematically compared, or tied to financial balance sheets. 

**QUANTRISKSCALE** provides an executive-ready, mathematically sound bridge between cybersecurity engineering and board-level fiduciary risk oversight. By combining Beta-PERT 3-point calibration, high-throughput Monte Carlo sampling (up to 100,000 iterations), and local-first SQLite persistence, security leaders can quantify risk exposure directly in currency values.

### 🎯 What It Solves
- **Eliminates Subjective Risk Scoring**: Replaces ambiguous "5x5 heatmaps" with probabilistic ranges (Low, Most Likely, High) calibrated across Loss Event Frequency (LEF) and Loss Magnitude (LM).
- **Justifies Security Budgets (ROSI)**: Quantifies the exact dollar reduction in Annualized Loss Expectancy against proposed security control investments.
- **Identifies Tail Risk & Black Swan Events**: Models catastrophic 95th and 99th percentile Value at Risk (VaR) exposures using custom fat-tailed distribution engines.
- **Ensures Data Privacy & Air-Gapped Operation**: Runs 100% in-browser and on private local infrastructure with local SQLite databases and offline AI endpoint support.

### ✨ Key Highlights
- **Mathematical Rigor**: Full implementation of Open FAIR™ ontology, Beta-PERT probability density sampling, and Loss Exceedance Curves.
- **What-If Comparative Analysis**: Side-by-side simulation of Inherent Risk vs. Proposed Mitigated Risk with automated control effectiveness calculations.
- **Embedded Local SQLite Engine**: Portable in-memory WebAssembly SQLite (`sql.js`) database for scenarios, asset catalogues, threat registers, and historical runs.
- **Executive PDF Export**: Generates publication-ready, multi-page audit and board reports with dynamic charts and governance sign-off fields.
- **Air-Gapped AI Advisory**: Integrates with local AI endpoints (Ollama / LocalAI / LM Studio) or server-side Gemini models for automated control recommendations.
- **Dual Visual Themes**: Deep Space Dark UI and High-Contrast Report Light mode for boardroom presentations and printing.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: Version `18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **Package Manager**: `npm` (comes bundled with Node.js) or `yarn` / `pnpm`
- **Web Browser**: Modern Chromium, Firefox, or Safari browser with WebAssembly support

### Installation

#### Option 1: Automated Launch (Windows)
Double-click `launch.bat` in the root directory. It automatically checks dependencies, sets up `.env`, runs `npm install` if required, starts the server on port 3000, and opens your browser.

#### Option 2: Manual Terminal Setup
```bash
# 1. Clone or extract the repository
git clone https://github.com/technoscope-in/quantriskscale.git
cd quantriskscale

# 2. Install dependencies
npm install

# 3. Initialize environment variables
cp .env.example .env

# 4. Start the development server
npm run dev
```

Once running, navigate to **`http://localhost:3000`** in your browser.

---

## 🛠️ Architecture & Core Features

```
QUANTRISKSCALE
├── Presentation Layer (React 18 + Tailwind CSS + Lucide Icons)
│   ├── Risk Cockpit (Interactive Gauges, Loss Exceedance Curves, Fat-Tail D3 Visualizer)
│   ├── Scenario Lab (Beta-PERT Calibration, FAIR Ontology Tree, Quick-Tune Sliders)
│   ├── AI Defense Studio (Threat Modeling, Asset Register, AI Copilot)
│   └── SQLite Manager (SQL Console, Database Schema Inspector, CSV/Binary Export)
├── Computational Core (TypeScript + WebAssembly)
│   ├── Vectorized Monte Carlo Simulation Engine (10k - 100k Trials)
│   ├── Beta-PERT Sampling Engine (alpha/beta parameter transformation)
│   └── Return on Security Investment (ROSI) Calculator
└── Persistence & Storage (Air-Gapped)
    ├── In-Memory WebAssembly SQLite (sql.js)
    ├── LocalStorage State Synchronization
    └── Executive PDF Generator (jspdf + autotable)
```

### 1. Open FAIR™ Factor Decomposition
- **Loss Event Frequency (LEF)**:
  $$\text{LEF} = \text{Threat Event Frequency (TEF)} \times \text{Vulnerability (Vuln)}$$
  $$\text{TEF} = \text{Contact Frequency (CF)} \times \text{Probability of Action (PoA)}$$
  $$\text{Vuln} = \Pr(\text{Threat Capability (TCap)} > \text{Resistance Strength (RS)})$$
- **Loss Magnitude (LM)**:
  $$\text{LM} = \text{Primary Loss Magnitude (PLM)} + \text{Secondary Loss Magnitude (SLM)}$$
  $$\text{Primary Forms: Productivity, Response, Replacement}$$
  $$\text{Secondary Forms: Fines & Judgments, Competitive Advantage, Reputation, Response}$$

### 2. Economic Justification & ROSI
$$\text{ALE Reduction} = \text{ALE}_{\text{Inherent}} - \text{ALE}_{\text{Residual}}$$
$$\text{Net Benefit} = \text{ALE Reduction} - \text{Annualized Control Cost}$$
$$\text{ROSI} = \left(\frac{\text{Net Benefit}}{\text{Annualized Control Cost}}\right) \times 100\%$$

---

## ⚙️ Configuration

Environment parameters are configured in the `.env` file:

```env
# Optional Gemini API Key for server-side AI advisory capabilities
GEMINI_API_KEY=

# Local / Private AI Endpoint URL (e.g., Ollama, LocalAI, vLLM)
LOCAL_AI_ENDPOINT=http://localhost:11434

# Application Host URL
APP_URL=http://localhost:3000
```

---

## 📖 Usage & Examples

### Preloaded Benchmark Scenarios
1. **Financial Services**: Core Banking Deposit Ledger Ransomware & Wire Fraud Exposure.
2. **Capital Markets**: High-Frequency Trading Ultra-Low Latency Gateway DDoS.
3. **Retail & E-Commerce**: Omnichannel POS Fleet Breach & Digital Skimming (Magecart).
4. **Frontier AI & Tech**: Proprietary 70B+ Model Weights Exfiltration & Poisoning.

### Performing a FAIR Risk Simulation:
1. **Stakeholder Guided Intake (Non-Math)**:
   - Click **Guided Intake** on the top bar or inside the **New Scenario Modal** / **AI Advisory Drawer**.
   - Walk through the **3-step non-mathematical interview**:
     - *Step 1: Asset & Threat Context* (What system is at risk? Who is the threat actor?)
     - *Step 2: Frequency & Likelihood* (Choose natural-language options like "Once every 2 years" or "3 to 5 times per year")
     - *Step 3: Financial Impact & Mitigation* (Select executive loss tiers like "$100k - $500k" and mitigation posture)
   - Click **Generate Calibrated Scenario & Launch Simulation**. The platform automatically converts human answers into Open FAIR™ Beta-PERT distribution parameters, saves to SQLite, and renders the Monte Carlo dashboard in real-time.
2. **Power-User Parametric Mode**:
   - In the **Scenario Lab**, directly edit Low, Mode, and High bounds for Loss Event Frequency (LEF) and Loss Magnitude (PLM/SLM).
3. **Run Monte Carlo Analysis**: Select trial count (e.g., 10,000 to 50,000 iterations) and review the resulting ALE, 95th% VaR, and Loss Exceedance Curve.
4. **Model Mitigations**: Enable Proposed Mitigations to calculate dollar savings and Return on Security Investment (ROSI).
5. **Export Report**: Click **Export PDF** to generate an executive-ready board report.

---

## 🗺️ Roadmap

- [x] Full Open FAIR™ (O-RT / O-RA) taxonomy & Monte Carlo engine
- [x] Stakeholder Guided Intake (3-step non-mathematical wizard with automated Beta-PERT mapping)
- [x] In-browser WebAssembly SQLite persistence & database import/export
- [x] Side-by-side What-If ROSI & residual risk comparison
- [x] Executive PDF report generation with signature/sign-off blocks
- [ ] Multi-scenario enterprise portfolio aggregation & correlation modeling
- [ ] Integration with GRC platforms (Archer, ServiceNow, Jira Service Management)
- [ ] Custom distribution fittings (Log-Normal, Weibull, Triangular)
- [ ] Automated NIST CSF 2.0 & ISO 27001 maturity weighting import

---

## 🤝 Contributing

Contributions, feature requests, and issue reports are welcome!

1. Fork the Project repository
2. Create your Feature Branch (`git checkout -b feature/QuantitativeEnhancement`)
3. Commit your Changes (`git commit -m 'Add new distribution model'`)
4. Push to the Branch (`git push origin feature/QuantitativeEnhancement`)
5. Open a Pull Request

Please ensure all TypeScript checks pass before submitting:
```bash
npm run lint
npm run build
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

Developed and maintained in alignment with Open FAIR™ standards by [Technoscope](https://www.technoscope.co.in).
