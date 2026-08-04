import { BuyerCommissionSlab, AgentCommissionSlab, TeamBonusLevel, InvestmentPlanSlab } from '../types';

export const BUYER_COMMISSION_SLABS: BuyerCommissionSlab[] = [
  { plotNumber: 1, label: '1st Plot', commissionPercent: 15.5 },
  { plotNumber: 2, label: 'Next 2nd Plot', commissionPercent: 15.0 },
  { plotNumber: 3, label: 'Next 3rd Plot', commissionPercent: 14.25 },
  { plotNumber: 4, label: 'Next 4th Plot', commissionPercent: 13.25 },
  { plotNumber: 5, label: 'Next 5th Plot', commissionPercent: 12.0 },
  { plotNumber: 6, label: 'Next 6th Plot', commissionPercent: 10.5 },
  { plotNumber: 7, label: 'Next 7th Plot', commissionPercent: 8.75 },
  { plotNumber: 8, label: 'Next 8th Plot', commissionPercent: 6.75 },
  { plotNumber: 9, label: 'Next 9th Plot', commissionPercent: 4.5 }
];

export const AGENT_COMMISSION_SLABS: AgentCommissionSlab[] = [
  { plotNumber: 1, label: '1st Plot', commissionPercent: 8.0 },
  { plotNumber: 2, label: 'Next 2nd Plot', commissionPercent: 7.5 },
  { plotNumber: 3, label: 'Next 3rd Plot', commissionPercent: 7.0 },
  { plotNumber: 4, label: 'Next 4th Plot', commissionPercent: 6.25 },
  { plotNumber: 5, label: 'Next 5th Plot', commissionPercent: 5.5 },
  { plotNumber: 6, label: 'Next 6th Plot', commissionPercent: 4.75 },
  { plotNumber: 7, label: 'Next 7th Plot', commissionPercent: 4.0 },
  { plotNumber: 8, label: 'Next 8th Plot', commissionPercent: 3.0 },
  { plotNumber: 9, label: 'Next 9th Plot', commissionPercent: 2.0 }
];

export const TEAM_BONUS_LEVELS: TeamBonusLevel[] = [
  { levelName: 'Buyer Level', bonusPercent: 2.0, description: 'Direct referral bonus for active buyers', minPlotsTarget: 1 },
  { levelName: 'Agent Level', bonusPercent: 3.0, description: 'Tier 1 active agent bonus pool', minPlotsTarget: 3 },
  { levelName: 'Salesman Level', bonusPercent: 3.5, description: 'Direct sales achievement bonus', minPlotsTarget: 6 },
  { levelName: 'Leader Level', bonusPercent: 4.0, description: 'Team team performance reward', minPlotsTarget: 10 },
  { levelName: 'Mentor Level', bonusPercent: 4.2, description: 'Regional leadership team bonus', minPlotsTarget: 15 },
  { levelName: 'Distributor Level', bonusPercent: 4.4, description: 'District level distribution share', minPlotsTarget: 25 },
  { levelName: 'Dealer Level', bonusPercent: 4.6, description: 'Authorized dealership payout', minPlotsTarget: 40 },
  { levelName: 'Counselor Level', bonusPercent: 4.8, description: 'Advisory leadership incentive', minPlotsTarget: 60 },
  { levelName: 'Co-Partner Level', bonusPercent: 5.0, description: 'Top corporate equity partner sharing', minPlotsTarget: 100 }
];

export const INVESTOR_SLABS: InvestmentPlanSlab[] = [
  { ratePerSqft: 1050, roiPercentage: 16.5, displayLabel: '₹1,050 / sq.ft (16.5% ROI)' },
  { ratePerSqft: 1120, roiPercentage: 17.5, displayLabel: '₹1,120 / sq.ft (17.5% ROI)' },
  { ratePerSqft: 1210, roiPercentage: 19.0, displayLabel: '₹1,210 / sq.ft (19.0% ROI)' },
  { ratePerSqft: 1320, roiPercentage: 20.5, displayLabel: '₹1,320 / sq.ft (20.5% ROI)' },
  { ratePerSqft: 1450, roiPercentage: 22.5, displayLabel: '₹1,450 / sq.ft (22.5% ROI)' },
  { ratePerSqft: 1600, roiPercentage: 24.5, displayLabel: '₹1,600 / sq.ft (24.5% ROI)' },
  { ratePerSqft: 1770, roiPercentage: 27.0, displayLabel: '₹1,770 / sq.ft (27.0% ROI)' },
  { ratePerSqft: 1950, roiPercentage: 29.5, displayLabel: '₹1,950 / sq.ft (29.5% ROI)' },
  { ratePerSqft: 2150, roiPercentage: 32.0, displayLabel: '₹2,150 / sq.ft (32.0% ROI)' }
];

/**
 * Calculates Buyer Commission for a given plot index (1-based)
 */
export function getBuyerCommissionPercent(plotIndex: number): number {
  const slab = BUYER_COMMISSION_SLABS.find(s => s.plotNumber === Math.min(plotIndex, 9));
  return slab ? slab.commissionPercent : 4.5;
}

/**
 * Calculates Agent Commission for a given plot index (1-based)
 */
export function getAgentCommissionPercent(plotIndex: number): number {
  const slab = AGENT_COMMISSION_SLABS.find(s => s.plotNumber === Math.min(plotIndex, 9));
  return slab ? slab.commissionPercent : 2.0;
}

/**
 * Calculates Total Buyer Commission for N plots of average price
 */
export function calculateCumulativeBuyerCommission(numPlots: number, avgPlotPrice: number) {
  let totalCommission = 0;
  const breakdown: { plotNo: number; percent: number; amount: number }[] = [];

  for (let i = 1; i <= numPlots; i++) {
    const percent = getBuyerCommissionPercent(i);
    const amount = (avgPlotPrice * percent) / 100;
    totalCommission += amount;
    breakdown.push({ plotNo: i, percent, amount });
  }

  return { totalCommission, breakdown };
}

/**
 * Calculates Total Agent Commission for N plots of average price
 */
export function calculateCumulativeAgentCommission(numPlots: number, avgPlotPrice: number) {
  let totalCommission = 0;
  const breakdown: { plotNo: number; percent: number; amount: number }[] = [];

  for (let i = 1; i <= numPlots; i++) {
    const percent = getAgentCommissionPercent(i);
    const amount = (avgPlotPrice * percent) / 100;
    totalCommission += amount;
    breakdown.push({ plotNo: i, percent, amount });
  }

  return { totalCommission, breakdown };
}

/**
 * Calculates Risk-Free Investment ROI and Payout Capping Rule
 * Condition: Base Plot Rate = ₹1,000 / sq.ft
 * Rule: Commission payout cannot exceed invested amount
 */
export function calculateInvestorRoi(ratePerSqft: number, sqftArea: number) {
  const slab = INVESTOR_SLABS.find(s => s.ratePerSqft === ratePerSqft) || INVESTOR_SLABS[0];
  const totalInvestedAmount = ratePerSqft * sqftArea; // e.g. 1450 * 1000 = 14,50,000
  const baseCost = 1000 * sqftArea; // e.g. 1000 * 1000 = 10,00,000

  const rawRoiPayout = (totalInvestedAmount * slab.roiPercentage) / 100;
  
  // Rule enforcement: Investor commission cannot exceed total invested amount
  const cappedRoiPayout = Math.min(rawRoiPayout, totalInvestedAmount);
  const totalReturn = totalInvestedAmount + cappedRoiPayout;

  return {
    slab,
    totalInvestedAmount,
    baseCost,
    roiPercentage: slab.roiPercentage,
    rawRoiPayout,
    cappedRoiPayout,
    isCapped: rawRoiPayout > totalInvestedAmount,
    totalReturn
  };
}

/**
 * Format Currency in Indian Rupee format
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
