import {
  LumpSumSchemeSlab,
  LumpSumInvestorRecord,
  LumpSumSchemeSummary,
  LumpSumEligibilityStatus,
  LumpSumSoldPlotRecord,
} from '../types';
import { formatINR } from './calculators';

// =============================================================================
// OFFICIAL 9-SLAB SCHEME MATRIX SPECIFICATION
// All calculations are based on standard 900 Sq. Ft. residential plot base
// =============================================================================
export const LUMPSUM_SCHEME_SLABS: LumpSumSchemeSlab[] = [
  {
    slNo: 1,
    purchaseRate: 1050,
    plotAreaSqft: 900,
    totalInvestmentAmount: 945000,
    interestRatePercent: 16.5,
    totalPayableAmount: 1100925,
    label: 'Slab 1 (₹1,050/sqft - 16.5% Return)',
    conditionATenureYears: 12,
    conditionBTargetPlots: 7,
  },
  {
    slNo: 2,
    purchaseRate: 1120,
    plotAreaSqft: 900,
    totalInvestmentAmount: 1008000,
    interestRatePercent: 17.5,
    totalPayableAmount: 1184400,
    label: 'Slab 2 (₹1,120/sqft - 17.5% Return)',
    conditionATenureYears: 12,
    conditionBTargetPlots: 7,
  },
  {
    slNo: 3,
    purchaseRate: 1210,
    plotAreaSqft: 900,
    totalInvestmentAmount: 1089000,
    interestRatePercent: 19.0,
    totalPayableAmount: 1295910,
    label: 'Slab 3 (₹1,210/sqft - 19.0% Return)',
    conditionATenureYears: 12,
    conditionBTargetPlots: 7,
  },
  {
    slNo: 4,
    purchaseRate: 1320,
    plotAreaSqft: 900,
    totalInvestmentAmount: 1188000,
    interestRatePercent: 20.5,
    totalPayableAmount: 1431540,
    label: 'Slab 4 (₹1,320/sqft - 20.5% Return)',
    conditionATenureYears: 12,
    conditionBTargetPlots: 7,
  },
  {
    slNo: 5,
    purchaseRate: 1450,
    plotAreaSqft: 900,
    totalInvestmentAmount: 1305000,
    interestRatePercent: 22.5,
    totalPayableAmount: 1598625,
    label: 'Slab 5 (₹1,450/sqft - 22.5% Return)',
    conditionATenureYears: 12,
    conditionBTargetPlots: 7,
  },
  {
    slNo: 6,
    purchaseRate: 1600,
    plotAreaSqft: 900,
    totalInvestmentAmount: 1440000,
    interestRatePercent: 24.5,
    totalPayableAmount: 1792800,
    label: 'Slab 6 (₹1,600/sqft - 24.5% Return)',
    conditionATenureYears: 12,
    conditionBTargetPlots: 7,
  },
  {
    slNo: 7,
    purchaseRate: 1770,
    plotAreaSqft: 900,
    totalInvestmentAmount: 1593000,
    interestRatePercent: 27.0,
    totalPayableAmount: 2023110,
    label: 'Slab 7 (₹1,770/sqft - 27.0% Return)',
    conditionATenureYears: 12,
    conditionBTargetPlots: 7,
  },
  {
    slNo: 8,
    purchaseRate: 1950,
    plotAreaSqft: 900,
    totalInvestmentAmount: 1755000,
    interestRatePercent: 29.5,
    totalPayableAmount: 2272725,
    label: 'Slab 8 (₹1,950/sqft - 29.5% Return)',
    conditionATenureYears: 12,
    conditionBTargetPlots: 7,
  },
  {
    slNo: 9,
    purchaseRate: 2150,
    plotAreaSqft: 900,
    totalInvestmentAmount: 1935000,
    interestRatePercent: 32.0,
    totalPayableAmount: 2554200,
    label: 'Slab 9 (₹2,150/sqft - 32.0% Return)',
    conditionATenureYears: 12,
    conditionBTargetPlots: 7,
  },
];

// =============================================================================
// CALCULATION & EVALUATION ENGINE
// =============================================================================

export interface LumpSumCalculationParams {
  plotAreaSqft: number;
  purchaseRateSqft: number;
  customInterestRate?: number;
}

export interface LumpSumCalculationResult {
  plotAreaSqft: number;
  purchaseRateSqft: number;
  totalInvestmentAmount: number;
  interestRatePercent: number;
  totalReturnAmount: number;
  totalPayableAmount: number;
  matchedSlab: LumpSumSchemeSlab | null;
}

/**
 * Calculates investment, interest return, and total payable amount
 */
export function calculateLumpSumPayout({
  plotAreaSqft,
  purchaseRateSqft,
  customInterestRate,
}: LumpSumCalculationParams): LumpSumCalculationResult {
  const safeArea = Math.max(1, plotAreaSqft || 900);
  const safeRate = Math.max(1, purchaseRateSqft || 1050);

  // Find matching or closest slab
  const matchedSlab =
    LUMPSUM_SCHEME_SLABS.find((s) => s.purchaseRate === safeRate) || null;

  const interestRatePercent =
    customInterestRate !== undefined
      ? customInterestRate
      : matchedSlab
      ? matchedSlab.interestRatePercent
      : 16.5;

  const totalInvestmentAmount = Math.round(safeArea * safeRate);
  const totalReturnAmount = Math.round(
    (totalInvestmentAmount * interestRatePercent) / 100
  );
  const totalPayableAmount = totalInvestmentAmount + totalReturnAmount;

  return {
    plotAreaSqft: safeArea,
    purchaseRateSqft: safeRate,
    totalInvestmentAmount,
    interestRatePercent,
    totalReturnAmount,
    totalPayableAmount,
    matchedSlab,
  };
}

/**
 * Evaluates Condition A (12 Years) & Condition B (7 Plots Sold) for an investor
 */
export function evaluateInvestorEligibility(
  record: LumpSumInvestorRecord
): {
  isConditionAMet: boolean;
  isConditionBMet: boolean;
  isPayoutEligible: boolean;
  status: LumpSumEligibilityStatus;
  plotsRemaining: number;
  plotsProgressPercent: number;
  yearsRemaining: number;
  timeRemainingText: string;
} {
  const targetPlots = record.plotsSoldTarget || 7;
  const soldCount = record.plotsSoldCount || (record.soldPlotsList ? record.soldPlotsList.length : 0);
  const plotsRemaining = Math.max(0, targetPlots - soldCount);
  const plotsProgressPercent = Math.min(100, Math.round((soldCount / targetPlots) * 100));

  // Condition B check
  const isConditionBMet = soldCount >= targetPlots;

  // Condition A check (12 years = 144 months)
  const joiningDate = new Date(record.joiningDate || new Date());
  const now = new Date();
  const diffMs = now.getTime() - joiningDate.getTime();
  const yearsElapsed = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  const isConditionAMet = yearsElapsed >= 12;

  const yearsRemaining = Math.max(0, 12 - yearsElapsed);
  const monthsRemaining = Math.max(0, Math.round(yearsRemaining * 12));
  
  let timeRemainingText = '';
  if (isConditionAMet) {
    timeRemainingText = '12 Years Completed (Matured)';
  } else {
    const yrs = Math.floor(yearsRemaining);
    const mos = Math.round((yearsRemaining - yrs) * 12);
    timeRemainingText = `${yrs} Yrs ${mos} Mos Remaining`;
  }

  const isPayoutEligible = isConditionAMet || isConditionBMet;

  let status: LumpSumEligibilityStatus = record.status;
  if (record.isPayoutDisbursed) {
    status = 'Disbursed / Completed';
  } else if (isConditionBMet) {
    status = 'Eligible - Condition B (7 Plots Sold!)';
  } else if (isConditionAMet) {
    status = 'Eligible - Condition A (12 Years Matured)';
  } else {
    status = 'In Progress (Condition A / B)';
  }

  return {
    isConditionAMet,
    isConditionBMet,
    isPayoutEligible,
    status,
    plotsRemaining,
    plotsProgressPercent,
    yearsRemaining,
    timeRemainingText,
  };
}

/**
 * Recomputes all dynamic fields for an investor record
 */
export function recalculateLumpSumInvestorFields(
  raw: Partial<LumpSumInvestorRecord>
): LumpSumInvestorRecord {
  const plotSizeSqft = raw.plotSizeSqft || 900;
  const purchaseRateSqft = raw.purchaseRateSqft || 1050;
  
  const calc = calculateLumpSumPayout({
    plotAreaSqft: plotSizeSqft,
    purchaseRateSqft,
    customInterestRate: raw.interestRatePercent,
  });

  const joiningDate = raw.joiningDate || new Date().toISOString().split('T')[0];
  const joinObj = new Date(joiningDate);
  const maturityObj = new Date(joinObj.setFullYear(joinObj.getFullYear() + 12));
  const maturityDateConditionA = maturityObj.toISOString().split('T')[0];

  const soldList = raw.soldPlotsList || [];
  const plotsSoldCount = raw.plotsSoldCount !== undefined ? raw.plotsSoldCount : soldList.length;
  const plotsSoldTarget = raw.plotsSoldTarget || 7;

  const isConditionBMet = plotsSoldCount >= plotsSoldTarget;
  const now = new Date();
  const joinDateForA = new Date(raw.joiningDate || new Date());
  const yearsElapsed = (now.getTime() - joinDateForA.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const isConditionAMet = yearsElapsed >= 12;

  const isPayoutEligible = isConditionBMet || isConditionAMet;
  const isPayoutDisbursed = raw.isPayoutDisbursed || false;

  let status: LumpSumEligibilityStatus = 'In Progress (Condition A / B)';
  if (isPayoutDisbursed) {
    status = 'Disbursed / Completed';
  } else if (isConditionBMet) {
    status = 'Eligible - Condition B (7 Plots Sold!)';
  } else if (isConditionAMet) {
    status = 'Eligible - Condition A (12 Years Matured)';
  }

  return {
    id: raw.id || `LFPS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    investorName: raw.investorName || 'Valued Investor',
    phone: raw.phone || '9876543210',
    email: raw.email || 'investor@example.com',
    seniorName: raw.seniorName || 'Vigya Paurush Milestone Desk',
    seniorId: raw.seniorId || 'SNR-101',
    address: raw.address || 'Civil Lines, Prayagraj, UP',
    plotNo: raw.plotNo || 'PLT-FPS-101',
    plotSizeSqft,
    purchaseRateSqft,
    interestRatePercent: calc.interestRatePercent,
    totalInvestmentAmount: calc.totalInvestmentAmount,
    totalReturnAmount: calc.totalReturnAmount,
    totalPayableAmount: calc.totalPayableAmount,
    joiningDate,
    maturityDateConditionA,
    nominee: raw.nominee || {
      nomineeName: 'Family Nominee',
      nomineeRelation: 'Spouse',
      nomineeAge: 35,
      nomineePhone: '9876543210',
    },
    plotsSoldTarget,
    plotsSoldCount,
    soldPlotsList: soldList,
    status,
    isConditionAMet,
    isConditionBMet,
    isPayoutEligible,
    isPayoutDisbursed,
    payoutDisbursedDate: raw.payoutDisbursedDate,
    payoutTxnReference: raw.payoutTxnReference,
    payoutDisbursedAmount: raw.payoutDisbursedAmount,
    payoutMode: raw.payoutMode,
    auditLogs: raw.auditLogs || [
      {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-IN'),
        actor: 'Admin / System Desk',
        action: 'Account Created',
        details: `Enrolled in Lump-Sum Free Plot Scheme @ ₹${purchaseRateSqft}/sqft with ${calc.interestRatePercent}% return guarantee.`,
      },
    ],
    createdAt: raw.createdAt || new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };
}

// =============================================================================
// SEED DATA FOR LUMP-SUM SCHEME INVESTORS
// =============================================================================

export const INITIAL_LUMPSUM_INVESTORS: LumpSumInvestorRecord[] = [
  recalculateLumpSumInvestorFields({
    id: 'LFPS-2026-001',
    investorName: 'Er. Rameshwar Dayal Tiwari',
    phone: '9839123450',
    email: 'rd.tiwari@example.com',
    seniorName: 'Vikram Singh (Director Desk)',
    seniorId: 'DIR-001',
    address: '14/B, Stanley Road, Civil Lines, Prayagraj',
    plotNo: 'PLT-FPS-901',
    plotSizeSqft: 900,
    purchaseRateSqft: 2150,
    interestRatePercent: 32.0,
    joiningDate: '2026-01-10',
    nominee: {
      nomineeName: 'Mrs. Sunita Tiwari',
      nomineeRelation: 'Spouse',
      nomineeAge: 48,
      nomineePhone: '9839123451',
    },
    plotsSoldTarget: 7,
    plotsSoldCount: 7, // Reached Condition B!
    soldPlotsList: [
      { id: 'SOLD-101', plotNo: 'A-101', projectName: 'Milestone City', buyerName: 'Anil Mishra', buyerPhone: '9811122233', saleAmount: 1200000, saleDate: '2026-01-20', registeredBy: 'Er. Rameshwar', status: 'Verified' },
      { id: 'SOLD-102', plotNo: 'A-102', projectName: 'Milestone City', buyerName: 'Pooja Pandey', buyerPhone: '9822233344', saleAmount: 1150000, saleDate: '2026-01-28', registeredBy: 'Er. Rameshwar', status: 'Verified' },
      { id: 'SOLD-103', plotNo: 'B-205', projectName: 'Prayag Vihar', buyerName: 'Sanjay Srivastava', buyerPhone: '9833344455', saleAmount: 1400000, saleDate: '2026-02-05', registeredBy: 'Er. Rameshwar', status: 'Verified' },
      { id: 'SOLD-104', plotNo: 'B-206', projectName: 'Prayag Vihar', buyerName: 'Dr. R. K. Gupta', buyerPhone: '9844455566', saleAmount: 1350000, saleDate: '2026-02-14', registeredBy: 'Er. Rameshwar', status: 'Verified' },
      { id: 'SOLD-105', plotNo: 'C-301', projectName: 'Ganga Enclave', buyerName: 'Deepak Shukla', buyerPhone: '9855566677', saleAmount: 1600000, saleDate: '2026-02-22', registeredBy: 'Er. Rameshwar', status: 'Verified' },
      { id: 'SOLD-106', plotNo: 'C-302', projectName: 'Ganga Enclave', buyerName: 'Vikas Maurya', buyerPhone: '9866677788', saleAmount: 1550000, saleDate: '2026-03-01', registeredBy: 'Er. Rameshwar', status: 'Verified' },
      { id: 'SOLD-107', plotNo: 'D-401', projectName: 'Sangam Greens', buyerName: 'Mahendra Yadav', buyerPhone: '9877788899', saleAmount: 1750000, saleDate: '2026-03-10', registeredBy: 'Er. Rameshwar', status: 'Verified' },
    ],
    status: 'Eligible - Condition B (7 Plots Sold!)',
    isConditionBMet: true,
    isPayoutEligible: true,
    auditLogs: [
      { id: 'LOG-01', timestamp: '2026-01-10 10:30 AM', actor: 'Admin Desk', action: 'Enrollment', details: 'Enrolled in 32% Slab @ ₹2,150/sqft for ₹19,35,000 investment.' },
      { id: 'LOG-02', timestamp: '2026-03-10 04:15 PM', actor: 'Sales Engine', action: '7th Plot Sale Recorded', details: '7th plot D-401 verified. Milestone reached. Payout unlocked under Condition B!' },
    ],
  }),
  recalculateLumpSumInvestorFields({
    id: 'LFPS-2026-002',
    investorName: 'Dr. Anand Kumar Saxena',
    phone: '9415012345',
    email: 'dr.anand@example.com',
    seniorName: 'Manish Pandey (Sr. Manager)',
    seniorId: 'MGR-204',
    address: '52, Tagore Town, Prayagraj',
    plotNo: 'PLT-FPS-702',
    plotSizeSqft: 900,
    purchaseRateSqft: 1770,
    interestRatePercent: 27.0,
    joiningDate: '2026-01-18',
    nominee: {
      nomineeName: 'Shashank Saxena',
      nomineeRelation: 'Son',
      nomineeAge: 24,
      nomineePhone: '9415012346',
    },
    plotsSoldTarget: 7,
    plotsSoldCount: 4,
    soldPlotsList: [
      { id: 'SOLD-201', plotNo: 'A-201', projectName: 'Milestone City', buyerName: 'Sunil Jaiswal', buyerPhone: '9450011223', saleAmount: 1100000, saleDate: '2026-01-25', registeredBy: 'Dr. Anand', status: 'Verified' },
      { id: 'SOLD-202', plotNo: 'A-202', projectName: 'Milestone City', buyerName: 'Kavita Singh', buyerPhone: '9450022334', saleAmount: 1120000, saleDate: '2026-02-08', registeredBy: 'Dr. Anand', status: 'Verified' },
      { id: 'SOLD-203', plotNo: 'B-304', projectName: 'Prayag Vihar', buyerName: 'Neeraj Dubey', buyerPhone: '9450033445', saleAmount: 1250000, saleDate: '2026-02-18', registeredBy: 'Dr. Anand', status: 'Verified' },
      { id: 'SOLD-204', plotNo: 'B-305', projectName: 'Prayag Vihar', buyerName: 'Alok Tripathi', buyerPhone: '9450044556', saleAmount: 1300000, saleDate: '2026-03-02', registeredBy: 'Dr. Anand', status: 'Verified' },
    ],
    status: 'In Progress (Condition A / B)',
  }),
  recalculateLumpSumInvestorFields({
    id: 'LFPS-2026-003',
    investorName: 'Adv. Brijeshwar Nath Shukla',
    phone: '9838055667',
    email: 'bn.shukla@example.com',
    seniorName: 'Vikram Singh (Director)',
    seniorId: 'DIR-001',
    address: '88, George Town, Prayagraj',
    plotNo: 'PLT-FPS-805',
    plotSizeSqft: 900,
    purchaseRateSqft: 1950,
    interestRatePercent: 29.5,
    joiningDate: '2026-01-05',
    nominee: {
      nomineeName: 'Mrs. Vandana Shukla',
      nomineeRelation: 'Spouse',
      nomineeAge: 52,
      nomineePhone: '9838055668',
    },
    plotsSoldTarget: 7,
    plotsSoldCount: 7,
    soldPlotsList: [
      { id: 'SOLD-301', plotNo: 'P-11', projectName: 'Ganga Enclave', buyerName: 'Vivek Srivastava', buyerPhone: '9839911223', saleAmount: 1350000, saleDate: '2026-01-12', registeredBy: 'Adv. Brijeshwar', status: 'Verified' },
      { id: 'SOLD-302', plotNo: 'P-12', projectName: 'Ganga Enclave', buyerName: 'Ritu Agrawal', buyerPhone: '9839922334', saleAmount: 1400000, saleDate: '2026-01-19', registeredBy: 'Adv. Brijeshwar', status: 'Verified' },
      { id: 'SOLD-303', plotNo: 'P-13', projectName: 'Ganga Enclave', buyerName: 'Dinesh Chandra', buyerPhone: '9839933445', saleAmount: 1380000, saleDate: '2026-01-26', registeredBy: 'Adv. Brijeshwar', status: 'Verified' },
      { id: 'SOLD-304', plotNo: 'Q-01', projectName: 'Milestone City', buyerName: 'Mukesh Kumar', buyerPhone: '9839944556', saleAmount: 1450000, saleDate: '2026-02-02', registeredBy: 'Adv. Brijeshwar', status: 'Verified' },
      { id: 'SOLD-305', plotNo: 'Q-02', projectName: 'Milestone City', buyerName: 'Smt. Sarojini Devi', buyerPhone: '9839955667', saleAmount: 1420000, saleDate: '2026-02-11', registeredBy: 'Adv. Brijeshwar', status: 'Verified' },
      { id: 'SOLD-306', plotNo: 'R-05', projectName: 'Sangam Greens', buyerName: 'Gaurav Bind', buyerPhone: '9839966778', saleAmount: 1500000, saleDate: '2026-02-20', registeredBy: 'Adv. Brijeshwar', status: 'Verified' },
      { id: 'SOLD-307', plotNo: 'R-06', projectName: 'Sangam Greens', buyerName: 'Harishankar Pal', buyerPhone: '9839977889', saleAmount: 1550000, saleDate: '2026-02-28', registeredBy: 'Adv. Brijeshwar', status: 'Verified' },
    ],
    status: 'Disbursed / Completed',
    isConditionBMet: true,
    isPayoutEligible: true,
    isPayoutDisbursed: true,
    payoutDisbursedDate: '2026-03-05',
    payoutTxnReference: 'RTGS-VPM-20260305-9910',
    payoutDisbursedAmount: 2272725,
    payoutMode: 'Bank Transfer (RTGS/NEFT)',
  }),
  recalculateLumpSumInvestorFields({
    id: 'LFPS-2026-004',
    investorName: 'Smt. Shanti Devi Maurya',
    phone: '9820033445',
    email: 'shanti.maurya@example.com',
    seniorName: 'Rajesh Gautam (Leader)',
    seniorId: 'LDR-108',
    address: 'Plot 45, Naini Industrial Area, Prayagraj',
    plotNo: 'PLT-FPS-504',
    plotSizeSqft: 900,
    purchaseRateSqft: 1450,
    interestRatePercent: 22.5,
    joiningDate: '2026-02-01',
    nominee: {
      nomineeName: 'Praveen Maurya',
      nomineeRelation: 'Son',
      nomineeAge: 28,
      nomineePhone: '9820033446',
    },
    plotsSoldTarget: 7,
    plotsSoldCount: 1,
    soldPlotsList: [
      { id: 'SOLD-401', plotNo: 'M-10', projectName: 'Milestone City', buyerName: 'Vijay Bhan', buyerPhone: '9820111222', saleAmount: 1100000, saleDate: '2026-02-15', registeredBy: 'Smt. Shanti', status: 'Verified' },
    ],
    status: 'In Progress (Condition A / B)',
  }),
  recalculateLumpSumInvestorFields({
    id: 'LFPS-2026-005',
    investorName: 'Shri Kedarnath Upadhyay',
    phone: '9412033445',
    email: 'kedar.upadhyay@example.com',
    seniorName: 'Manish Pandey (Sr. Manager)',
    seniorId: 'MGR-204',
    address: 'Kareli, Prayagraj',
    plotNo: 'PLT-FPS-603',
    plotSizeSqft: 900,
    purchaseRateSqft: 1600,
    interestRatePercent: 24.5,
    joiningDate: '2026-02-10',
    nominee: {
      nomineeName: 'Amit Upadhyay',
      nomineeRelation: 'Son',
      nomineeAge: 30,
      nomineePhone: '9412033446',
    },
    plotsSoldTarget: 7,
    plotsSoldCount: 0,
    soldPlotsList: [],
    status: 'In Progress (Condition A / B)',
  }),
];

/**
 * Computes aggregate summary statistics for the Lump-Sum Scheme
 */
export function calculateLumpSumSummary(
  records: LumpSumInvestorRecord[]
): LumpSumSchemeSummary {
  let totalInvestmentAmount = 0;
  let totalPayableAmount = 0;
  let totalReturnLiability = 0;
  let eligibleInvestorsCount = 0;
  let eligiblePayableAmount = 0;
  let pendingMaturityCount = 0;
  let pendingMaturityAmount = 0;
  let completedPayoutsCount = 0;
  let completedDisbursedAmount = 0;
  let totalPlotsSold = 0;
  let conditionBAchieversCount = 0;
  let conditionAAchieversCount = 0;

  records.forEach((r) => {
    totalInvestmentAmount += r.totalInvestmentAmount;
    totalPayableAmount += r.totalPayableAmount;
    totalReturnLiability += r.totalReturnAmount;
    totalPlotsSold += r.plotsSoldCount;

    if (r.isConditionBMet) conditionBAchieversCount++;
    if (r.isConditionAMet) conditionAAchieversCount++;

    if (r.isPayoutDisbursed) {
      completedPayoutsCount++;
      completedDisbursedAmount += r.payoutDisbursedAmount || r.totalPayableAmount;
    } else if (r.isPayoutEligible) {
      eligibleInvestorsCount++;
      eligiblePayableAmount += r.totalPayableAmount;
    } else {
      pendingMaturityCount++;
      pendingMaturityAmount += r.totalPayableAmount;
    }
  });

  return {
    totalInvestors: records.length,
    totalInvestmentAmount,
    totalPayableAmount,
    totalReturnLiability,
    eligibleInvestorsCount,
    eligiblePayableAmount,
    pendingMaturityCount,
    pendingMaturityAmount,
    completedPayoutsCount,
    completedDisbursedAmount,
    totalPlotsSold,
    conditionBAchieversCount,
    conditionAAchieversCount,
  };
}

/**
 * Generates CSV content for download
 */
export function generateLumpSumCsv(records: LumpSumInvestorRecord[]): string {
  const headers = [
    'Investor ID',
    'Investor Name',
    'Phone',
    'Email',
    'Senior Name (Sponsor)',
    'Senior ID',
    'Plot No',
    'Plot Size (Sq. Ft.)',
    'Purchase Rate (₹/sqft)',
    'Total Investment (₹)',
    'Interest Rate (%)',
    'Total Return (₹)',
    'Total Payable (₹)',
    'Joining Date',
    'Maturity Date (Cond A - 12 Yrs)',
    'Plots Sold (Cond B / 7)',
    'Eligibility Status',
    'Condition B Achieved (7 Plots)',
    'Condition A Achieved (12 Yrs)',
    'Payout Status',
    'Disbursed Amount (₹)',
    'Txn Reference',
  ];

  const rows = records.map((r) => [
    `"${r.id}"`,
    `"${r.investorName}"`,
    `"${r.phone}"`,
    `"${r.email}"`,
    `"${r.seniorName}"`,
    `"${r.seniorId}"`,
    `"${r.plotNo || 'N/A'}"`,
    r.plotSizeSqft,
    r.purchaseRateSqft,
    r.totalInvestmentAmount,
    `${r.interestRatePercent}%`,
    r.totalReturnAmount,
    r.totalPayableAmount,
    `"${r.joiningDate}"`,
    `"${r.maturityDateConditionA}"`,
    `${r.plotsSoldCount} / ${r.plotsSoldTarget}`,
    `"${r.status}"`,
    r.isConditionBMet ? 'YES (7 Plots Reached)' : 'NO',
    r.isConditionAMet ? 'YES (12 Yrs Matured)' : 'NO',
    r.isPayoutDisbursed ? 'Disbursed' : r.isPayoutEligible ? 'Eligible for Payout' : 'In Progress',
    r.payoutDisbursedAmount || 0,
    `"${r.payoutTxnReference || 'Pending'}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
