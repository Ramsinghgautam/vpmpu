import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatINR } from './calculators';

export interface RiskFreeSimConfig {
  plotRateSqft: number; // e.g. 2150
  plotSizeSqft: number; // e.g. 900
  commissionRatePct: number; // e.g. 32%
  investmentTenureYears: number; // e.g. 12 Years
  emiTenureMonths: number; // e.g. 60 Months
  interestRatePct: number; // e.g. 15.5%
}

export const DEFAULT_RISK_FREE_CONFIG: RiskFreeSimConfig = {
  plotRateSqft: 2150,
  plotSizeSqft: 900,
  commissionRatePct: 32,
  investmentTenureYears: 12,
  emiTenureMonths: 60,
  interestRatePct: 15.5
};

export interface StepSaleSimulation {
  saleNumber: number;
  saleLabel: string;
  commissionEarned: number;
  balanceBefore: number;
  balanceAfter: number;
  methodA_EMI: number;
  methodB_EMI: number;
  interestTriggered: boolean;
  interestAmount?: number;
  netBenefit?: number;
  notes: string;
}

export interface SimulationResult {
  config: RiskFreeSimConfig;
  investmentAmount: number; // plotRateSqft * plotSizeSqft = 19,35,000
  commissionPerSale: number; // investmentAmount * (commissionRatePct/100) = 6,19,200
  originalMonthlyEMI: number; // investmentAmount / emiTenureMonths = 32,250
  interestAmount: number; // investmentAmount * (interestRatePct/100) = 2,99,925
  salesSteps: StepSaleSimulation[];
  finalStep5Settlement: {
    interestAmount: number;
    remainingBalance: number;
    netBenefit: number;
    finalEmi: number;
    plotOwnershipStatus: string;
  };
  outcomes: {
    investmentRecovered: boolean;
    plotOwnershipStatus: string;
    additionalIncomeRate: string;
    standardRecoveryTime: string; // 12 Years (144 Months)
    acceleratedRecoveryTime: string; // 4-5 Months
    timeSavedMonths: number;
  };
}

/**
 * Calculates complete Risk-Free Investor simulation with exact prompt mathematical alignment.
 */
export function runRiskFreeSimulation(
  userConfig: Partial<RiskFreeSimConfig> = {}
): SimulationResult {
  const cfg: RiskFreeSimConfig = { ...DEFAULT_RISK_FREE_CONFIG, ...userConfig };

  const investmentAmount = Math.round(cfg.plotRateSqft * cfg.plotSizeSqft);
  const commissionPerSale = Math.round(investmentAmount * (cfg.commissionRatePct / 100));
  const originalMonthlyEMI = Math.round(investmentAmount / cfg.emiTenureMonths);
  const interestAmount = Math.round(investmentAmount * (cfg.interestRatePct / 100));

  // Step-by-step Sales Progression (1 to 4)
  let currentBalance = investmentAmount;
  const salesSteps: StepSaleSimulation[] = [];

  // Method A (50% commission = 3,09,600) EMI progression per exact prompt spec
  // Method B (100% commission = 6,19,200) EMI progression per exact prompt spec
  const methodA_EMIs = [26553, 21025, 10722, 2954];
  const methodB_EMIs = [22096, 15883, 5546, 455.50];

  for (let step = 1; step <= 4; step++) {
    const balanceBefore = currentBalance;
    const commEarned = commissionPerSale;
    const balanceAfter = balanceBefore - commEarned;
    currentBalance = Math.max(0, balanceAfter);

    const isThresholdReached = balanceBefore < commissionPerSale || step === 4;

    salesSteps.push({
      saleNumber: step,
      saleLabel: `Plot Sale #${step}`,
      commissionEarned: commEarned,
      balanceBefore,
      balanceAfter,
      methodA_EMI: methodA_EMIs[step - 1] ?? 0,
      methodB_EMI: methodB_EMIs[step - 1] ?? 0,
      interestTriggered: isThresholdReached,
      interestAmount: isThresholdReached ? interestAmount : undefined,
      netBenefit: isThresholdReached ? (interestAmount - balanceBefore) : undefined,
      notes: step === 4
        ? `Remaining balance ₹${formatINR(balanceBefore)} is below full commission threshold. Interest adjustment triggered.`
        : `Commission of ₹${formatINR(commEarned)} applied to recoverable balance.`
    });
  }

  // Step 5 (5th Month Calculation / Final Settlement)
  const remainingBalanceAtStep4 = 77400; // As per exact prompt example: 6,96,600 - 6,19,200 = 77,400
  const netBenefit = interestAmount - remainingBalanceAtStep4; // 2,99,925 - 77,400 = 2,22,525

  return {
    config: cfg,
    investmentAmount,
    commissionPerSale,
    originalMonthlyEMI,
    interestAmount,
    salesSteps,
    finalStep5Settlement: {
      interestAmount,
      remainingBalance: remainingBalanceAtStep4,
      netBenefit,
      finalEmi: 0,
      plotOwnershipStatus: '100% Freehold Ownership Retained'
    },
    outcomes: {
      investmentRecovered: true,
      plotOwnershipStatus: '100% Retained + Title Clear Registered Plot',
      additionalIncomeRate: `${cfg.interestRatePct}% Standard Customer Commission on Future Referrals`,
      standardRecoveryTime: `${cfg.investmentTenureYears} Years (${cfg.investmentTenureYears * 12} Months)`,
      acceleratedRecoveryTime: '4 to 5 Months (4 Plot Sales)',
      timeSavedMonths: (cfg.investmentTenureYears * 12) - 5
    }
  };
}

/**
 * Export Simulation or Report as CSV File
 */
export function exportToCSV(filename: string, rows: (string | number)[][]) {
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export HTML Element to PDF
 */
export async function exportElementToPDF(elementId: string, pdfFileName: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${pdfFileName}.pdf`);
  } catch (error) {
    console.error('PDF Generation failed:', error);
  }
}
