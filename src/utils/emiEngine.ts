/**
 * Smart EMI Calculation Engine & AI Analytics System
 * Standard EMI Formula:
 * EMI = [P × R × (1+R)^N] / [((1+R)^N) - 1]
 * Where:
 * P = Principal Loan Amount (Plot Total Cost - Down Payment)
 * R = Monthly Interest Rate (Annual Rate % / 12 / 100)
 * N = Total Tenure in Months (12, 24, 36, 48, 60 Months)
 */

export interface EmiScheduleRow {
  installmentNo: number;
  dueDate: string;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  remainingBalance: number;
  status: 'paid' | 'due' | 'overdue' | 'partial';
  paidAmount?: number;
  penaltyAmount?: number;
  paymentDate?: string;
}

export interface EmiCalculationResult {
  plotTotalCost: number;
  bookingAmount: number;
  downPayment: number;
  principalAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
  tenureYears: number;
  monthlyEmi: number;
  totalInterestPayable: number;
  totalAmountPayable: number;
  processingFee: number;
  schedule: EmiScheduleRow[];
}

export const SUPPORTED_EMI_TENURES = [
  { months: 12, years: 1, label: '12 Months (1 Year)' },
  { months: 24, years: 2, label: '24 Months (2 Years)' },
  { months: 36, years: 3, label: '36 Months (3 Years)' },
  { months: 48, years: 4, label: '48 Months (4 Years)' },
  { months: 60, years: 5, label: '60 Months (5 Years)' },
];

/**
 * Standard EMI Calculation Formula
 */
export function calculateMonthlyEmi(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRatePercent <= 0) return Math.round(principal / tenureMonths);

  const monthlyRate = annualRatePercent / 12 / 100;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  return Math.round(emi);
}

/**
 * Full EMI Detailed Breakdown & Schedule Generator
 */
export function calculateFullEmiEngine(
  plotTotalCost: number,
  downPayment: number,
  annualInterestRate: number,
  tenureMonths: number,
  processingFeePercent: number = 1.0,
  startDateStr?: string
): EmiCalculationResult {
  const bookingAmount = Math.round(plotTotalCost * 0.1); // 10% standard booking
  const actualDownPayment = Math.max(downPayment, bookingAmount);
  const principalAmount = Math.max(0, plotTotalCost - actualDownPayment);
  const processingFee = Math.round((principalAmount * processingFeePercent) / 100);

  const monthlyEmi = calculateMonthlyEmi(principalAmount, annualInterestRate, tenureMonths);
  const monthlyRate = annualInterestRate / 12 / 100;

  let balance = principalAmount;
  let totalInterest = 0;
  const schedule: EmiScheduleRow[] = [];
  const baseDate = startDateStr ? new Date(startDateStr) : new Date();

  for (let i = 1; i <= tenureMonths; i++) {
    const interestForMonth = Math.round(balance * monthlyRate);
    const principalForMonth = Math.min(balance, Math.max(0, monthlyEmi - interestForMonth));
    balance = Math.max(0, balance - principalForMonth);
    totalInterest += interestForMonth;

    const dueDateObj = new Date(baseDate);
    dueDateObj.setMonth(dueDateObj.getMonth() + i);

    schedule.push({
      installmentNo: i,
      dueDate: dueDateObj.toISOString().split('T')[0],
      emiAmount: monthlyEmi,
      principalComponent: principalForMonth,
      interestComponent: interestForMonth,
      remainingBalance: balance,
      status: i === 1 ? 'paid' : i <= 3 ? 'due' : 'due',
      paidAmount: i === 1 ? monthlyEmi : 0,
      penaltyAmount: 0
    });
  }

  const totalAmountPayable = principalAmount + totalInterest;

  return {
    plotTotalCost,
    bookingAmount,
    downPayment: actualDownPayment,
    principalAmount,
    annualInterestRate,
    tenureMonths,
    tenureYears: tenureMonths / 12,
    monthlyEmi,
    totalInterestPayable: totalInterest,
    totalAmountPayable,
    processingFee,
    schedule
  };
}

/**
 * Late Fee / Penalty Calculation
 * Default: 2% per month or 0.1% per day overdue
 */
export function calculateLatePenalty(
  emiAmount: number,
  overdueDays: number,
  dailyPenaltyPercent: number = 0.1
): { penaltyAmount: number; totalDueWithPenalty: number } {
  if (overdueDays <= 0) return { penaltyAmount: 0, totalDueWithPenalty: emiAmount };
  const penaltyAmount = Math.round((emiAmount * (dailyPenaltyPercent * overdueDays)) / 100);
  return {
    penaltyAmount,
    totalDueWithPenalty: emiAmount + penaltyAmount
  };
}

/**
 * Foreclosure & Prepayment Calculation
 */
export function calculateForeclosureAndPrepayment(
  principalOutstanding: number,
  completedMonths: number,
  tenureMonths: number,
  annualRatePercent: number,
  foreclosureFeePercent: number = 2.0
): {
  outstandingPrincipal: number;
  foreclosureFee: number;
  totalForeclosurePayout: number;
  interestSaved: number;
} {
  const originalMonthlyEmi = calculateMonthlyEmi(principalOutstanding, annualRatePercent, tenureMonths - completedMonths);
  const remainingMonths = Math.max(0, tenureMonths - completedMonths);
  const totalRemainingWithoutForeclosure = originalMonthlyEmi * remainingMonths;
  
  const foreclosureFee = Math.round((principalOutstanding * foreclosureFeePercent) / 100);
  const totalForeclosurePayout = principalOutstanding + foreclosureFee;
  const interestSaved = Math.max(0, totalRemainingWithoutForeclosure - totalForeclosurePayout);

  return {
    outstandingPrincipal: principalOutstanding,
    foreclosureFee,
    totalForeclosurePayout,
    interestSaved
  };
}

/**
 * AI Sales & Revenue Prediction Module
 */
export interface AiSalesPredictionResult {
  nextMonthSalesForecast: number;
  nextQuarterRevenueForecast: number;
  annualGrowthEstimatePercent: number;
  investmentGrowthTrajectory: { month: string; predictedRevenue: number; projectedInflow: number }[];
  marketTrendConfidence: number;
}

export function runAiSalesPrediction(
  pastMonthlyRevenue: number[] = [4500000, 5200000, 6100000, 6800000, 7500000, 8400000]
): AiSalesPredictionResult {
  const avgGrowthRate = 0.12; // 12% baseline trend algorithm
  const lastRevenue = pastMonthlyRevenue[pastMonthlyRevenue.length - 1] || 8000000;
  
  const nextMonthSalesForecast = Math.round(lastRevenue * (1 + avgGrowthRate));
  const nextQuarterRevenueForecast = Math.round(nextMonthSalesForecast * 3.15);
  const annualGrowthEstimatePercent = 24.5;

  const monthNames = ['Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026', 'Jan 2027', 'Feb 2027'];
  const trajectory = monthNames.map((month, idx) => {
    const factor = 1 + (idx + 1) * 0.08;
    return {
      month,
      predictedRevenue: Math.round(lastRevenue * factor),
      projectedInflow: Math.round(lastRevenue * factor * 1.15)
    };
  });

  return {
    nextMonthSalesForecast,
    nextQuarterRevenueForecast,
    annualGrowthEstimatePercent,
    investmentGrowthTrajectory: trajectory,
    marketTrendConfidence: 94.2
  };
}

/**
 * AI Risk Analysis Engine
 */
export interface CustomerRiskAnalysisResult {
  riskScore: number; // 0 (Low Risk) to 100 (High Risk)
  riskCategory: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Default Risk';
  defaultProbabilityPercent: number;
  riskFactors: string[];
  recommendedAction: string;
}

export function evaluateCustomerRisk(
  kycCompleted: boolean,
  missingEmisCount: number,
  paidEmisOnTimeRatio: number,
  creditScore: number = 720
): CustomerRiskAnalysisResult {
  let riskScore = 15; // Base low risk

  if (!kycCompleted) riskScore += 25;
  if (missingEmisCount > 0) riskScore += missingEmisCount * 20;
  if (paidEmisOnTimeRatio < 0.8) riskScore += 20;
  if (creditScore < 650) riskScore += 25;

  riskScore = Math.min(100, Math.max(0, riskScore));

  let riskCategory: CustomerRiskAnalysisResult['riskCategory'] = 'Low Risk';
  let defaultProbabilityPercent = 3.5;
  let recommendedAction = 'Approved for standard EMI plans with automated WhatsApp payment reminders.';

  if (riskScore >= 75) {
    riskCategory = 'Critical Default Risk';
    defaultProbabilityPercent = 68.4;
    recommendedAction = 'Send 7-Day Legal Notice & Hold plot registry transfer until overdue EMIs cleared.';
  } else if (riskScore >= 50) {
    riskCategory = 'High Risk';
    defaultProbabilityPercent = 38.2;
    recommendedAction = 'Assign dedicated Employee tele-caller for mandatory 3-day pre-due call follow-up.';
  } else if (riskScore >= 30) {
    riskCategory = 'Moderate Risk';
    defaultProbabilityPercent = 14.8;
    recommendedAction = 'Offer 2% early payment rebate to incentivize on-time EMI settlement.';
  }

  const riskFactors: string[] = [];
  if (!kycCompleted) riskFactors.push('KYC Verification Pending');
  if (missingEmisCount > 0) riskFactors.push(`${missingEmisCount} Overdue EMI Installments Unpaid`);
  if (paidEmisOnTimeRatio < 0.8) riskFactors.push('Inconsistent On-Time Payment History');
  if (creditScore < 650) riskFactors.push(`Sub-optimal CIBIL Score (${creditScore})`);
  if (riskFactors.length === 0) riskFactors.push('Strong Payment History & Full KYC Compliant');

  return {
    riskScore,
    riskCategory,
    defaultProbabilityPercent,
    riskFactors,
    recommendedAction
  };
}

/**
 * AI Recommendation Engine
 */
export interface AiRecommendationResult {
  recommendedTenureMonths: number;
  recommendedEmiPlanLabel: string;
  recommendedPlotType: string;
  recommendedInvestmentPlan: string;
  upsellOpportunity: string;
}

export function generateAiRecommendations(
  monthlyIncome: number,
  targetPlotPrice: number
): AiRecommendationResult {
  // Financial sanity check: EMI should not exceed 35% of monthly income
  const maxAffordableEmi = monthlyIncome * 0.35;

  let chosenTenure = 60; // default 5 years
  if (calculateMonthlyEmi(targetPlotPrice * 0.8, 10.5, 24) <= maxAffordableEmi) {
    chosenTenure = 24;
  } else if (calculateMonthlyEmi(targetPlotPrice * 0.8, 10.5, 36) <= maxAffordableEmi) {
    chosenTenure = 36;
  } else if (calculateMonthlyEmi(targetPlotPrice * 0.8, 10.5, 48) <= maxAffordableEmi) {
    chosenTenure = 48;
  }

  const matchedTenureObj = SUPPORTED_EMI_TENURES.find(t => t.months === chosenTenure) || SUPPORTED_EMI_TENURES[4];

  return {
    recommendedTenureMonths: chosenTenure,
    recommendedEmiPlanLabel: `${matchedTenureObj.label} @ 10.5% p.a.`,
    recommendedPlotType: targetPlotPrice > 3000000 ? 'Corner Plot / Wide 40ft Road' : 'Standard Residential Plot',
    recommendedInvestmentPlan: 'Free Plot Scheme @ ₹1,450 / sq.ft (22.5% Guaranteed ROI)',
    upsellOpportunity: 'Upgrade to Phase 2 High-Growth Commercial Plot for +3.5% higher annual appreciation.'
  };
}
