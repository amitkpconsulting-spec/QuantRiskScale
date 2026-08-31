import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FairScenario, SimulationResult } from '../types/fair';
import { formatAmount } from './distributions';

export interface PdfExportOptions {
  scenario: FairScenario;
  result: SimulationResult | null;
  author?: string;
  organization?: string;
  customNotes?: string;
}

/**
 * Generates an executive and technical Open FAIR Risk Assessment Report in PDF format.
 */
export function generateRiskScenarioPdf({
  scenario,
  result,
  author = 'Certified Open FAIR Analyst',
  organization = 'Enterprise Information Security & Risk',
  customNotes
}: PdfExportOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  // Refined Color Palette
  const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const secondaryColor: [number, number, number] = [8, 145, 178]; // Cyan 600
  const darkGray: [number, number, number] = [51, 65, 85]; // Slate 700
  const lightGray: [number, number, number] = [248, 250, 252]; // Slate 50
  const borderGray: [number, number, number] = [226, 232, 240]; // Slate 200
  const emeraldColor: [number, number, number] = [16, 185, 129];
  const amberColor: [number, number, number] = [217, 119, 6];
  const roseColor: [number, number, number] = [225, 29, 72];

  let currentY = 32;

  // ----------------------------------------------------
  // 1. TOP HEADER BANNER
  // ----------------------------------------------------
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, contentWidth, 50, 'F');

  // Decorative Cyan Accent Strip
  doc.setFillColor(...secondaryColor);
  doc.rect(margin, currentY, 6, 50, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('OPEN FAIR™ QUANTITATIVE RISK ASSESSMENT REPORT', margin + 16, currentY + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(
    `Standardized Quantitative Risk Modeling • ${scenario.simulationsCount.toLocaleString()} Trial Monte Carlo • Open FAIR (O-FAIR Standard v2.0)`,
    margin + 16,
    currentY + 38
  );

  // Status Badge in Header Top Right
  const statusX = pageWidth - margin - 80;
  const statusY = currentY + 14;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(statusX, statusY, 70, 20, 3, 3, 'F');
  doc.setTextColor(56, 189, 248); // Sky 400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(scenario.status.toUpperCase(), statusX + 35, statusY + 13, { align: 'center' });

  currentY += 60;

  // ----------------------------------------------------
  // 2. SCENARIO TITLE & METADATA CARD
  // ----------------------------------------------------
  doc.setFillColor(...lightGray);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(margin, currentY, contentWidth, 74, 4, 4, 'FD');

  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(scenario.name, margin + 12, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...darkGray);
  const descLines = doc.splitTextToSize(scenario.description, contentWidth - 24);
  doc.text(descLines.slice(0, 2), margin + 12, currentY + 29);

  // Metadata Row
  const nowStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const metaText = [
    `Category: ${scenario.category}`,
    `Threat Impact: ${scenario.threatEffect}`,
    `Unit Scale: ${scenario.unitLabel} (${scenario.currency})`,
    `Date: ${nowStr}`
  ].join('   •   ');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(metaText, margin + 12, currentY + 62);

  currentY += 82;

  // ----------------------------------------------------
  // 3. ASSET & THREAT PROFILE BREAKDOWN
  // ----------------------------------------------------
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 3.5,
      textColor: [15, 23, 42]
    },
    head: [['Asset Under Evaluation', 'Threat Community Profile', 'Risk Tolerance Calibration']],
    body: [
      [
        `Asset: ${scenario.asset}\nStatus: ${scenario.status}\nUnit Scaling: 1 Unit = ${scenario.currency}${scenario.unitScale.toLocaleString()}`,
        `Threat Community: ${scenario.threatCommunity}\nImpact Vector: ${scenario.threatEffect}\nSimulations: ${scenario.simulationsCount.toLocaleString()} Trials (Seed: ${scenario.randomSeed || 'Deterministic/Auto'})`,
        `Target Percentile: ${scenario.riskTolerance.targetPercentile || 90}th Percentile (VaR)\nModerate Limit: ${formatAmount(scenario.riskTolerance.moderateMax, scenario.currency, scenario.unitScale)}\nHigh Risk Cap: ${formatAmount(scenario.riskTolerance.highMax, scenario.currency, scenario.unitScale)}`
      ]
    ]
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // ----------------------------------------------------
  // 4. EXECUTIVE RISK QUANTIFICATION & MONTE CARLO RESULTS
  // ----------------------------------------------------
  if (result) {
    const cur = result.currentStats;
    const prop = result.proposedStats;
    const targetPct = scenario.riskTolerance.targetPercentile || 90;
    const curTargetVaR = targetPct === 95 ? cur.p95 : cur.p90;
    const propTargetVaR = prop ? (targetPct === 95 ? prop.p95 : prop.p90) : 0;

    const aleReduction = prop ? Math.max(0, ((cur.mean - prop.mean) / (cur.mean || 1)) * 100) : 0;
    const netSavings = prop && scenario.proposedControlCost
      ? (cur.mean - prop.mean) - scenario.proposedControlCost
      : 0;
    const rosi = prop && scenario.proposedControlCost && scenario.proposedControlCost > 0
      ? (((cur.mean - prop.mean) - scenario.proposedControlCost) / scenario.proposedControlCost) * 100
      : 0;

    // Section Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...primaryColor);
    doc.text('EXECUTIVE RISK QUANTIFICATION & COMPARATIVE MONTE CARLO RESULTS', margin, currentY);
    currentY += 5;

    const metricsBody = [
      [
        'Annualized Loss Exposure (ALE Mean)',
        formatAmount(cur.mean, scenario.currency, scenario.unitScale),
        prop ? formatAmount(prop.mean, scenario.currency, scenario.unitScale) : 'N/A',
        prop ? `-${aleReduction.toFixed(1)}%` : 'Baseline'
      ],
      [
        'Median Annual Loss (P50)',
        formatAmount(cur.p50, scenario.currency, scenario.unitScale),
        prop ? formatAmount(prop.p50, scenario.currency, scenario.unitScale) : 'N/A',
        prop ? `-${Math.max(0, ((cur.p50 - prop.p50) / (cur.p50 || 1)) * 100).toFixed(1)}%` : 'Baseline'
      ],
      [
        `Value at Risk (${targetPct}th Percentile VaR)`,
        formatAmount(curTargetVaR, scenario.currency, scenario.unitScale),
        prop ? formatAmount(propTargetVaR, scenario.currency, scenario.unitScale) : 'N/A',
        prop ? `-${Math.max(0, ((curTargetVaR - propTargetVaR) / (curTargetVaR || 1)) * 100).toFixed(1)}%` : 'Baseline'
      ],
      [
        'Extreme Tail Loss (99th Percentile VaR99)',
        formatAmount(cur.p99, scenario.currency, scenario.unitScale),
        prop ? formatAmount(prop.p99, scenario.currency, scenario.unitScale) : 'N/A',
        prop ? `-${Math.max(0, ((cur.p99 - prop.p99) / (cur.p99 || 1)) * 100).toFixed(1)}%` : 'Baseline'
      ],
      [
        'Maximum Single Trial Loss Simulated',
        formatAmount(cur.max, scenario.currency, scenario.unitScale),
        prop ? formatAmount(prop.max, scenario.currency, scenario.unitScale) : 'N/A',
        prop ? `-${Math.max(0, ((cur.max - prop.max) / (cur.max || 1)) * 100).toFixed(1)}%` : 'Baseline'
      ],
      [
        'Standard Deviation (Loss Volatility)',
        formatAmount(cur.stdDev, scenario.currency, scenario.unitScale),
        prop ? formatAmount(prop.stdDev, scenario.currency, scenario.unitScale) : 'N/A',
        prop ? `-${Math.max(0, ((cur.stdDev - prop.stdDev) / (cur.stdDev || 1)) * 100).toFixed(1)}%` : 'Baseline'
      ]
    ];

    if (scenario.hasProposed && scenario.proposedControlCost) {
      metricsBody.push([
        'Proposed Safeguard Annualized Cost',
        '—',
        formatAmount(scenario.proposedControlCost, scenario.currency, scenario.unitScale),
        'Security Investment'
      ]);
      metricsBody.push([
        'Net Expected Benefit (ALE Reduction - Cost)',
        '—',
        formatAmount(netSavings, scenario.currency, scenario.unitScale),
        netSavings >= 0 ? 'Cost Effective' : 'Cost Exceeds Savings'
      ]);
      metricsBody.push([
        'Return on Security Investment (ROSI)',
        '—',
        `${rosi >= 0 ? '+' : ''}${rosi.toFixed(1)}%`,
        rosi > 0 ? 'Positive Yield' : 'Negative Yield'
      ]);
    }

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'striped',
      headStyles: {
        fillColor: secondaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 3.5
      },
      bodyStyles: {
        fontSize: 7.5,
        cellPadding: 3,
        textColor: [15, 23, 42]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 180 },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'center', fontStyle: 'bold' }
      },
      head: [['Quantified Metric', 'Current (Inherent Risk)', 'Proposed (Residual Risk)', 'Variance / Delta']],
      body: metricsBody
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;
  }

  // ----------------------------------------------------
  // 5. FAIR ONTOLOGY 3-POINT BETA-PERT INPUT PARAMETERS
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text('FAIR ONTOLOGY 3-POINT ESTIMATES & LOSS FORMS', margin, currentY);
  currentY += 5;

  const curB = scenario.current;
  const propB = scenario.proposed;

  const paramRows = [
    [
      'Loss Event Frequency (LEF)',
      curB.lef.useDirectLef
        ? `Direct: [${curB.lef.directLef.low}, ${curB.lef.directLef.mode}, ${curB.lef.directLef.high}]/yr`
        : `TEF: [${curB.lef.contactFrequency.low}-${curB.lef.contactFrequency.high}] * Vuln: [${(curB.lef.resistanceStrength.low)}%]`,
      propB?.lef.useDirectLef
        ? `Direct: [${propB.lef.directLef.low}, ${propB.lef.directLef.mode}, ${propB.lef.directLef.high}]/yr`
        : `TEF: [${propB?.lef.contactFrequency.low}-${propB?.lef.contactFrequency.high}] * Vuln: [${propB?.lef.resistanceStrength.low}%]`,
      'Events / Year'
    ],
    [
      'Primary Loss: Productivity',
      `[${curB.primaryLoss.productivity.low}, ${curB.primaryLoss.productivity.mode}, ${curB.primaryLoss.productivity.high}]`,
      propB ? `[${propB.primaryLoss.productivity.low}, ${propB.primaryLoss.productivity.mode}, ${propB.primaryLoss.productivity.high}]` : 'N/A',
      `${scenario.unitLabel} / event`
    ],
    [
      'Primary Loss: Response & Forensics',
      `[${curB.primaryLoss.response.low}, ${curB.primaryLoss.response.mode}, ${curB.primaryLoss.response.high}]`,
      propB ? `[${propB.primaryLoss.response.low}, ${propB.primaryLoss.response.mode}, ${propB.primaryLoss.response.high}]` : 'N/A',
      `${scenario.unitLabel} / event`
    ],
    [
      'Secondary Loss: Fines & Legal',
      `[${curB.secondaryLoss.finesAndJudgements.low}, ${curB.secondaryLoss.finesAndJudgements.mode}, ${curB.secondaryLoss.finesAndJudgements.high}]`,
      propB ? `[${propB.secondaryLoss.finesAndJudgements.low}, ${propB.secondaryLoss.finesAndJudgements.mode}, ${propB.secondaryLoss.finesAndJudgements.high}]` : 'N/A',
      `${scenario.unitLabel} (SLEF: ${curB.secondaryLossEventFreq.mode}%)`
    ],
    [
      'Secondary Loss: Reputational Loss',
      `[${curB.secondaryLoss.reputation.low}, ${curB.secondaryLoss.reputation.mode}, ${curB.secondaryLoss.reputation.high}]`,
      propB ? `[${propB.secondaryLoss.reputation.low}, ${propB.secondaryLoss.reputation.mode}, ${propB.secondaryLoss.reputation.high}]` : 'N/A',
      `${scenario.unitLabel} / secondary event`
    ],
    [
      'Operational Downtime Impact',
      `[${curB.operationalLoss.serviceDowntimeHours.low}, ${curB.operationalLoss.serviceDowntimeHours.mode}, ${curB.operationalLoss.serviceDowntimeHours.high}] hrs`,
      propB ? `[${propB.operationalLoss.serviceDowntimeHours.low}, ${propB.operationalLoss.serviceDowntimeHours.mode}, ${propB.operationalLoss.serviceDowntimeHours.high}] hrs` : 'N/A',
      'System Outage Hours'
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: darkGray,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3.5
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 3,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 160 },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center', textColor: [100, 116, 139] }
    },
    head: [['Ontology Factor', 'Current 3-Point Estimate [Low, Mode, High]', 'Proposed 3-Point Estimate [Low, Mode, High]', 'Unit / Metric']],
    body: paramRows
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // ----------------------------------------------------
  // 6. LOSS EXCEEDANCE PROBABILITIES TABLE (LEC)
  // ----------------------------------------------------
  if (result && result.lossExceedanceCurve && result.lossExceedanceCurve.length > 0) {
    const lecPoints = result.lossExceedanceCurve;
    const sampleStep = Math.max(1, Math.floor(lecPoints.length / 6));
    const sampledLec = [];
    for (let i = 0; i < lecPoints.length; i += sampleStep) {
      sampledLec.push(lecPoints[i]);
    }
    if (sampledLec.length > 0 && sampledLec[sampledLec.length - 1] !== lecPoints[lecPoints.length - 1]) {
      sampledLec.push(lecPoints[lecPoints.length - 1]);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...primaryColor);
    doc.text('LOSS EXCEEDANCE PROBABILITIES (ANNUAL EXCEEDANCE CHANCE)', margin, currentY);
    currentY += 5;

    const lecBody = sampledLec.slice(0, 6).map(pt => [
      pt.formattedLoss,
      `${(pt.probabilityExceeding * 100).toFixed(1)}%`,
      pt.proposedProbabilityExceeding !== undefined ? `${(pt.proposedProbabilityExceeding * 100).toFixed(1)}%` : 'N/A',
      pt.proposedProbabilityExceeding !== undefined
        ? `-${Math.max(0, (pt.probabilityExceeding - pt.proposedProbabilityExceeding) * 100).toFixed(1)}% pts`
        : 'Baseline'
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 3.5
      },
      bodyStyles: {
        fontSize: 7.5,
        cellPadding: 3,
        textColor: [15, 23, 42]
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'center', fontStyle: 'bold', textColor: [13, 148, 136] }
      },
      head: [['Financial Loss Threshold', 'Current Exceedance Prob (%)', 'Proposed Exceedance Prob (%)', 'Risk Reduction Delta']],
      body: lecBody
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;
  }

  // ----------------------------------------------------
  // 7. OPTIONAL EXECUTIVE NOTES OR RECOMMENDATIONS
  // ----------------------------------------------------
  if (customNotes && customNotes.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text('EXECUTIVE RISK MANAGEMENT OBSERVATIONS & DIRECTIVES', margin, currentY);
    currentY += 4;

    doc.setFillColor(...lightGray);
    doc.setDrawColor(...borderGray);
    const noteLines = doc.splitTextToSize(customNotes, contentWidth - 16);
    const noteHeight = Math.max(30, noteLines.length * 10 + 12);
    doc.roundedRect(margin, currentY, contentWidth, noteHeight, 3, 3, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkGray);
    doc.text(noteLines, margin + 8, currentY + 12);
    currentY += noteHeight + 10;
  }

  // ----------------------------------------------------
  // 8. STAMP FOOTERS ACROSS ALL GENERATED PAGES
  // ----------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 24;
    doc.setDrawColor(...borderGray);
    doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      'CONFIDENTIAL • Prepared in accordance with Open Group Standard (O-FAIR Risk Taxonomy & Risk Analysis Technical Standard v2.0)',
      margin,
      footerY
    );
    doc.text(
      `Evaluated by: ${author} • ${organization} • Page ${i} of ${totalPages}`,
      pageWidth - margin,
      footerY,
      { align: 'right' }
    );
  }

  return doc;
}

/**
 * Automatically triggers browser download of the generated Open FAIR PDF.
 */
export function downloadRiskScenarioPdf(options: PdfExportOptions): void {
  const doc = generateRiskScenarioPdf(options);
  const sanitizedName = options.scenario.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  doc.save(`OpenFAIR_Risk_Report_${sanitizedName}.pdf`);
}
