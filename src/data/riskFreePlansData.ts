import { RiskFreeInvestorPlan, RiskFreeInvestorRecord, RiskFreeSystemSummary } from '../types';

export const BASE_PLOT_RATE = 1000; // ₹1,000 / sqft
export const STANDARD_PLOT_SIZE = 900; // 900 sqft
export const STANDARD_CUSTOMER_COMMISSION = 15.5; // 15.5%

export const RISK_FREE_HINDI_NOTE = 
  "मूलधन एवं निर्धारित ब्याज की पूर्ण वसूली हो जाने के बाद निवेशक पर सामान्य ग्राहक की शर्तें एवं कमीशन संरचना लागू हो जाएगी।";

export const RISK_FREE_ENGLISH_NOTE = 
  "Once the recovery of principal amount and specified interest is fully completed, the standard customer terms and commission structure (15.5% base) will automatically apply to the investor.";

export interface PlanConfigRaw {
  purchaseRate: number;
  commissionRate: number;
  badgeLabel: string;
}

export const PLAN_CONFIGS_RAW: PlanConfigRaw[] = [
  { purchaseRate: 1050, commissionRate: 16.5, badgeLabel: 'Starter Tier' },
  { purchaseRate: 1120, commissionRate: 17.5, badgeLabel: 'Bronze Tier' },
  { purchaseRate: 1210, commissionRate: 19.0, badgeLabel: 'Silver Tier' },
  { purchaseRate: 1320, commissionRate: 20.5, badgeLabel: 'Gold Tier' },
  { purchaseRate: 1450, commissionRate: 22.5, badgeLabel: 'Platinum Tier' },
  { purchaseRate: 1600, commissionRate: 24.5, badgeLabel: 'Diamond Tier' },
  { purchaseRate: 1770, commissionRate: 27.0, badgeLabel: 'Crown Tier' },
  { purchaseRate: 1950, commissionRate: 29.5, badgeLabel: 'Royale Tier' },
  { purchaseRate: 2150, commissionRate: 32.0, badgeLabel: 'Imperial Ultra' },
];

export function buildInvestorPlan(
  purchaseRate: number,
  commissionRate: number,
  plotSizeSqft: number = STANDARD_PLOT_SIZE,
  badgeLabel?: string
): RiskFreeInvestorPlan {
  const principalAmount = purchaseRate * plotSizeSqft;
  const interestAmount = Math.round(principalAmount * (commissionRate / 100));
  const recoveryTarget = principalAmount + interestAmount;

  return {
    purchaseRate,
    plotSizeSqft,
    investmentAmount: principalAmount,
    commissionRate,
    interestRate: commissionRate,
    principalAmount,
    interestAmount,
    recoveryTarget,
    badgeLabel: badgeLabel || `₹${purchaseRate}/sqft Slab`,
  };
}

export const RISK_FREE_INVESTOR_PLANS: RiskFreeInvestorPlan[] = PLAN_CONFIGS_RAW.map((cfg) =>
  buildInvestorPlan(cfg.purchaseRate, cfg.commissionRate, STANDARD_PLOT_SIZE, cfg.badgeLabel)
);

// Initial Seed Data for Investors
export const INITIAL_RISK_FREE_INVESTORS: RiskFreeInvestorRecord[] = [
  {
    id: 'RFI-1001',
    userId: 'USR-INVESTOR-101',
    investorName: 'Vikramaditya Sharma',
    phone: '9876500111',
    email: 'vikram.investor@gmail.com',
    kycStatus: 'Verified',
    purchaseRate: 1450,
    plotSizeSqft: 900,
    commissionRate: 22.5,
    interestRate: 22.5,
    principalAmount: 1305000, // 1450 * 900
    interestAmount: 293625,   // 1305000 * 0.225
    recoveryTarget: 1598625,  // 1305000 + 293625
    totalSalesValue: 3600000,
    totalCommissionEarned: 810000, // 3600000 * 0.225
    remainingRecoveryBalance: 788625, // 1598625 - 810000
    recoveryPercentage: 50.67,
    isRecovered: false,
    convertedToStandardCustomer: false,
    status: 'Active',
    enrolledDate: '2026-01-15',
    salesLedger: [
      {
        id: 'SALE-801',
        investorId: 'RFI-1001',
        date: '2026-02-10',
        plotNo: 'A-102',
        projectName: 'Greenfield Heights Township',
        saleValue: 1800000,
        commissionRateUsed: 22.5,
        commissionEarned: 405000,
        remainingRecoveryBalanceAfter: 1193625,
        buyerName: 'Amitabh Verma',
        buyerPhone: '9812345670',
        notes: 'First plot sale registered under Platinum Tier 22.5% comm'
      },
      {
        id: 'SALE-802',
        investorId: 'RFI-1001',
        date: '2026-03-22',
        plotNo: 'B-205',
        projectName: 'Ayodhya Divine Residency',
        saleValue: 1800000,
        commissionRateUsed: 22.5,
        commissionEarned: 405000,
        remainingRecoveryBalanceAfter: 788625,
        buyerName: 'Rameshwar Tripathi',
        buyerPhone: '9812345671',
        notes: 'Second plot sale registered'
      }
    ]
  },
  {
    id: 'RFI-1002',
    userId: 'USR-INVESTOR-102',
    investorName: 'Sunita Aggarwal',
    phone: '9876500222',
    email: 'sunita.aggarwal@vpmrealestate.com',
    kycStatus: 'Verified',
    purchaseRate: 2150,
    plotSizeSqft: 900,
    commissionRate: 32.0,
    interestRate: 32.0,
    principalAmount: 1935000, // 2150 * 900
    interestAmount: 619200,   // 1935000 * 0.32
    recoveryTarget: 2554200,  // 1935000 + 619200
    totalSalesValue: 8000000,
    totalCommissionEarned: 2560000, // 8000000 * 0.32
    remainingRecoveryBalance: 0,
    recoveryPercentage: 100,
    isRecovered: true,
    convertedToStandardCustomer: true,
    status: 'Recovered',
    enrolledDate: '2025-11-01',
    salesLedger: [
      {
        id: 'SALE-803',
        investorId: 'RFI-1002',
        date: '2025-12-05',
        plotNo: 'C-301',
        projectName: 'Phaphamau Prime Enclave',
        saleValue: 4000000,
        commissionRateUsed: 32.0,
        commissionEarned: 1280000,
        remainingRecoveryBalanceAfter: 1274200,
        buyerName: 'Gaurav Dubey',
        buyerPhone: '9822223344',
        notes: 'Commercial plot sale 32% payout'
      },
      {
        id: 'SALE-804',
        investorId: 'RFI-1002',
        date: '2026-02-18',
        plotNo: 'C-302',
        projectName: 'Phaphamau Prime Enclave',
        saleValue: 4000000,
        commissionRateUsed: 32.0,
        commissionEarned: 1280000,
        remainingRecoveryBalanceAfter: 0,
        buyerName: 'Dr. S. K. Rastogi',
        buyerPhone: '9822223345',
        notes: 'Recovery target completed! Converted to standard customer profile (15.5% base)'
      }
    ]
  },
  {
    id: 'RFI-1003',
    userId: 'USR-INVESTOR-103',
    investorName: 'Rajesh Kumar Gupta',
    phone: '9876500333',
    email: 'rajesh.gupta@gmail.com',
    kycStatus: 'Verified',
    purchaseRate: 1120,
    plotSizeSqft: 900,
    commissionRate: 17.5,
    interestRate: 17.5,
    principalAmount: 1008000,
    interestAmount: 176400,
    recoveryTarget: 1184400,
    totalSalesValue: 1200000,
    totalCommissionEarned: 210000,
    remainingRecoveryBalance: 974400,
    recoveryPercentage: 17.73,
    isRecovered: false,
    convertedToStandardCustomer: false,
    status: 'Active',
    enrolledDate: '2026-03-01',
    salesLedger: [
      {
        id: 'SALE-805',
        investorId: 'RFI-1003',
        date: '2026-04-02',
        plotNo: 'D-108',
        projectName: 'Naini Eco City Layout',
        saleValue: 1200000,
        commissionRateUsed: 17.5,
        commissionEarned: 210000,
        remainingRecoveryBalanceAfter: 974400,
        buyerName: 'Pankaj Mishra',
        buyerPhone: '9833334455',
        notes: 'Bronze tier sale'
      }
    ]
  }
];

export function computeSystemSummary(investors: RiskFreeInvestorRecord[]): RiskFreeSystemSummary {
  let totalPrincipalInvested = 0;
  let totalInterestLiability = 0;
  let totalRecoveryTargetLiability = 0;
  let totalCommissionPaid = 0;
  let remainingLiability = 0;
  let activeInvestors = 0;
  let completedInvestors = 0;

  investors.forEach((inv) => {
    totalPrincipalInvested += inv.principalAmount;
    totalInterestLiability += inv.interestAmount;
    totalRecoveryTargetLiability += inv.recoveryTarget;
    totalCommissionPaid += inv.totalCommissionEarned;
    remainingLiability += inv.remainingRecoveryBalance;

    if (inv.isRecovered) {
      completedInvestors++;
    } else {
      activeInvestors++;
    }
  });

  return {
    totalInvestors: investors.length,
    activeInvestors,
    completedInvestors,
    totalPrincipalInvested,
    totalInterestLiability,
    totalRecoveryTargetLiability,
    totalCommissionPaid,
    remainingLiability,
  };
}
