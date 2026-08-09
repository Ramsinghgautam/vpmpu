import {
  AgentRecord,
  AgentSlab,
  AgentSaleRecord,
  AgentWithdrawalRequest,
  AgentSystemSummary
} from '../types';

export const MANDATORY_BUSINESS_RULE_HINDI =
  "एजेंट के लिए कमीशन कटौती की शर्तें तब तक लागू रहेंगी जब तक प्लॉट की शेष देनदारी पूर्ण रूप से समाप्त नहीं हो जाती। देनदारी समाप्त होने के बाद प्राप्त होने वाला सम्पूर्ण कमीशन एजेंट के वॉलेट में जमा किया जाएगा।";

export const MANDATORY_BUSINESS_RULE_ENG =
  "Commission split terms for Agents remain active until the plot liability is fully cleared (50% Wallet / 50% EMI Offset). Once the plot liability reaches zero, 100% of all future commissions are credited directly to the Agent Wallet.";

// Standard plot parameters
export const STANDARD_PLOT_SIZE_SQFT = 900;
export const BASE_PLOT_RATE_PER_SQFT = 1000;
export const BASE_PLOT_VALUE = 900000; // ₹9,00,000
export const STANDARD_EMI_PERIOD_MONTHS = 60;
export const STANDARD_MONTHLY_EMI_AMOUNT = 15000; // ₹15,000

// Dynamic Commission Slabs according to prompt specification
export const AGENT_COMMISSION_SLABS: AgentSlab[] = [
  { slabIndex: 1, label: '1st Plot Sale', minSales: 1, maxSales: 1, percentage: 8.0 },
  { slabIndex: 2, label: 'Next 2 Plot Sales (2 - 3)', minSales: 2, maxSales: 3, percentage: 7.5 },
  { slabIndex: 3, label: 'Next 3 Plot Sales (4 - 6)', minSales: 4, maxSales: 6, percentage: 7.0 },
  { slabIndex: 4, label: 'Next 4 Plot Sales (7 - 10)', minSales: 7, maxSales: 10, percentage: 6.25 },
  { slabIndex: 5, label: 'Next 5 Plot Sales (11 - 15)', minSales: 11, maxSales: 15, percentage: 5.5 },
  { slabIndex: 6, label: 'Next 6 Plot Sales (16 - 21)', minSales: 16, maxSales: 21, percentage: 4.75 },
  { slabIndex: 7, label: 'Next 7 Plot Sales (22 - 28)', minSales: 22, maxSales: 28, percentage: 4.0 },
  { slabIndex: 8, label: 'Next 8 Plot Sales (29 - 36)', minSales: 29, maxSales: 36, percentage: 3.0 },
  { slabIndex: 9, label: 'Next 9+ Plot Sales (37+)', minSales: 37, maxSales: null, percentage: 2.0 },
];

export const RISK_FREE_INVESTOR_RATES = [
  { plan: 'Plan 1', rateSqft: 1050, plotValue: 945000, label: '₹1,050 / Sqft (₹9,45,000)' },
  { plan: 'Plan 2', rateSqft: 1120, plotValue: 1008000, label: '₹1,120 / Sqft (₹10,08,000)' },
  { plan: 'Plan 3', rateSqft: 1210, plotValue: 1089000, label: '₹1,210 / Sqft (₹10,89,000)' },
  { plan: 'Plan 4', rateSqft: 1320, plotValue: 1188000, label: '₹1,320 / Sqft (₹11,88,000)' },
  { plan: 'Plan 5', rateSqft: 1450, plotValue: 1305000, label: '₹1,450 / Sqft (₹13,05,000)' },
  { plan: 'Plan 6', rateSqft: 1600, plotValue: 1440000, label: '₹1,600 / Sqft (₹14,40,000)' },
  { plan: 'Plan 7', rateSqft: 1770, plotValue: 1593000, label: '₹1,770 / Sqft (₹15,93,000)' },
  { plan: 'Plan 8', rateSqft: 1950, plotValue: 1755000, label: '₹1,950 / Sqft (₹17,55,000)' },
  { plan: 'Plan 9', rateSqft: 2150, plotValue: 1935000, label: '₹2,150 / Sqft (₹19,35,000)' },
];

// Helper to determine slab percentage based on upcoming sale number (1-based index)
export function getSlabForSaleNumber(saleNumber: number): AgentSlab {
  const targetSale = Math.max(1, saleNumber);
  for (const slab of AGENT_COMMISSION_SLABS) {
    if (slab.maxSales === null) {
      if (targetSale >= slab.minSales) return slab;
    } else {
      if (targetSale >= slab.minSales && targetSale <= slab.maxSales) return slab;
    }
  }
  return AGENT_COMMISSION_SLABS[AGENT_COMMISSION_SLABS.length - 1];
}

// Calculate commission and 50/50 split for a sale
export function calculateAgentSaleCommission(
  saleValue: number,
  currentPlotsSold: number,
  currentRemainingEmiLiability: number
) {
  const nextSaleNumber = currentPlotsSold + 1;
  const activeSlab = getSlabForSaleNumber(nextSaleNumber);
  const slabPercentage = activeSlab.percentage;

  const grossCommission = (saleValue * slabPercentage) / 100;

  let emiDeductionAmount = 0;
  let netWalletAmount = grossCommission;

  if (currentRemainingEmiLiability > 0) {
    const potentialSplit = grossCommission * 0.50;
    // Deduct at most the remaining liability
    emiDeductionAmount = Math.min(potentialSplit, currentRemainingEmiLiability);
    netWalletAmount = grossCommission - emiDeductionAmount;
  }

  return {
    nextSaleNumber,
    activeSlab,
    slabPercentage,
    grossCommission,
    emiDeductionAmount,
    netWalletAmount,
    newRemainingLiability: Math.max(0, currentRemainingEmiLiability - emiDeductionAmount)
  };
}

// Initial Seed Data for Agents
export const INITIAL_SEED_AGENTS: AgentRecord[] = [
  {
    id: 'AGENT-1001',
    agentName: 'Rajesh Sharma',
    phone: '9876543210',
    email: 'rajesh.agent@vigyapaurush.com',
    kycStatus: 'Verified',
    joiningDate: '2025-01-15',
    status: 'Active',
    assignedPlot: {
      plotNo: 'A-101',
      plotSizeSqft: 900,
      totalPlotValue: 900000,
      emiDurationMonths: 60,
      monthlyEmiAmount: 15000,
      totalEmiPaidDirectly: 120000, // 8 months direct EMI
      emiAdjustedFromCommission: 88500, // Adjusted from sales
      remainingEmiLiability: 691500, // 900000 - (120000 + 88500)
      emiCompletionPercentage: 23.16
    },
    totalPlotsSold: 2,
    currentSlabPercentage: 7.5,
    wallet: {
      availableBalance: 45000,
      pendingBalance: 12000,
      totalEmiAdjustedBalance: 88500,
      totalWithdrawn: 30000,
      totalEarned: 163500
    },
    salesLedger: [
      {
        id: 'SALE-101',
        agentId: 'AGENT-1001',
        date: '2025-02-10',
        customerName: 'Amit Verma',
        customerPhone: '9812345678',
        plotNo: 'B-204',
        plotSizeSqft: 900,
        saleType: 'Standard Plot',
        saleValue: 900000,
        slabPercentageUsed: 8.0, // 1st Sale -> 8%
        grossCommissionEarned: 72000,
        emiDeductionAmount: 36000, // 50% EMI split
        netWalletAmount: 36000, // 50% Wallet split
        notes: 'Standard plot sale with 50/50 EMI offset applied'
      },
      {
        id: 'SALE-102',
        agentId: 'AGENT-1001',
        date: '2025-03-22',
        customerName: 'Sanjay Gupta (Risk Free)',
        customerPhone: '9823456789',
        plotNo: 'RF-105',
        plotSizeSqft: 900,
        saleType: 'Risk Free Investor Plot',
        saleValue: 1450 * 900, // Plan 6: ₹13,05,000
        slabPercentageUsed: 7.5, // 2nd Sale -> 7.5%
        grossCommissionEarned: 97875, // 7.5% of 1305000
        emiDeductionAmount: 48937.5,
        netWalletAmount: 48937.5,
        investorPlanRate: 1450,
        notes: 'Risk Free Investor Plan 5 sale at active 7.5% slab'
      }
    ],
    withdrawalHistory: [
      {
        id: 'WD-501',
        agentId: 'AGENT-1001',
        agentName: 'Rajesh Sharma',
        requestDate: '2025-03-01',
        amount: 30000,
        paymentMethod: 'Bank Transfer',
        accountDetails: 'HDFC Bank A/C ****4821',
        status: 'Approved',
        processedDate: '2025-03-02',
        transactionId: 'TXN-8829104'
      }
    ]
  },
  {
    id: 'AGENT-1002',
    agentName: 'Vikram Singh',
    phone: '9811223344',
    email: 'vikram.singh@vigyapaurush.com',
    kycStatus: 'Verified',
    joiningDate: '2024-11-01',
    status: 'Active',
    assignedPlot: {
      plotNo: 'C-305',
      plotSizeSqft: 900,
      totalPlotValue: 900000,
      emiDurationMonths: 60,
      monthlyEmiAmount: 15000,
      totalEmiPaidDirectly: 450000,
      emiAdjustedFromCommission: 450000, // Entire liability cleared!
      remainingEmiLiability: 0, // Fully cleared!
      emiCompletionPercentage: 100
    },
    totalPlotsSold: 12,
    currentSlabPercentage: 5.5,
    wallet: {
      availableBalance: 285000,
      pendingBalance: 0,
      totalEmiAdjustedBalance: 450000,
      totalWithdrawn: 150000,
      totalEarned: 885000
    },
    salesLedger: [
      {
        id: 'SALE-201',
        agentId: 'AGENT-1002',
        date: '2025-01-18',
        customerName: 'Sunil Mehta',
        customerPhone: '9712341234',
        plotNo: 'D-102',
        plotSizeSqft: 900,
        saleType: 'Standard Plot',
        saleValue: 900000,
        slabPercentageUsed: 5.5,
        grossCommissionEarned: 49500,
        emiDeductionAmount: 0, // Liability is 0!
        netWalletAmount: 49500, // 100% to wallet
        notes: 'Liability cleared - 100% credited to wallet'
      }
    ],
    withdrawalHistory: [
      {
        id: 'WD-502',
        agentId: 'AGENT-1002',
        agentName: 'Vikram Singh',
        requestDate: '2025-02-15',
        amount: 150000,
        paymentMethod: 'UPI',
        accountDetails: 'vikram@okaxis',
        status: 'Approved',
        processedDate: '2025-02-16',
        transactionId: 'TXN-9912034'
      }
    ]
  },
  {
    id: 'AGENT-1003',
    agentName: 'Priya Verma',
    phone: '9899887766',
    email: 'priya.v@vigyapaurush.com',
    kycStatus: 'Pending',
    joiningDate: '2025-03-01',
    status: 'Active',
    assignedPlot: {
      plotNo: 'E-402',
      plotSizeSqft: 900,
      totalPlotValue: 900000,
      emiDurationMonths: 60,
      monthlyEmiAmount: 15000,
      totalEmiPaidDirectly: 30000,
      emiAdjustedFromCommission: 0,
      remainingEmiLiability: 870000,
      emiCompletionPercentage: 3.33
    },
    totalPlotsSold: 0,
    currentSlabPercentage: 8.0,
    wallet: {
      availableBalance: 0,
      pendingBalance: 0,
      totalEmiAdjustedBalance: 0,
      totalWithdrawn: 0,
      totalEarned: 0
    },
    salesLedger: [],
    withdrawalHistory: []
  }
];

const LOCAL_STORAGE_KEY_AGENTS = 'vigya_agent_records_v1';

// Synchronize state with LocalStorage
export function loadAgentRecordsFromStorage(): AgentRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_AGENTS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_AGENTS, JSON.stringify(INITIAL_SEED_AGENTS));
      return INITIAL_SEED_AGENTS;
    }
    return JSON.parse(raw) as AgentRecord[];
  } catch (err) {
    console.error('Failed to load agents from storage:', err);
    return INITIAL_SEED_AGENTS;
  }
}

export function saveAgentRecordsToStorage(agents: AgentRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_AGENTS, JSON.stringify(agents));
  } catch (err) {
    console.error('Failed to save agents to storage:', err);
  }
}

// Compute Global Summary Metrics for Admin Panel
export function computeAgentSystemSummary(agents: AgentRecord[]): AgentSystemSummary {
  let totalPlotSalesCount = 0;
  let totalSalesVolume = 0;
  let totalCommissionDistributed = 0;
  let totalEmiRecovered = 0;
  let outstandingEmiLiability = 0;
  let pendingWithdrawalsAmount = 0;
  let paidWithdrawalsAmount = 0;

  agents.forEach(agent => {
    totalPlotSalesCount += agent.totalPlotsSold;

    if (agent.assignedPlot) {
      totalEmiRecovered += (agent.assignedPlot.totalEmiPaidDirectly + agent.assignedPlot.emiAdjustedFromCommission);
      outstandingEmiLiability += agent.assignedPlot.remainingEmiLiability;
    }

    agent.salesLedger.forEach(sale => {
      totalSalesVolume += sale.saleValue;
      totalCommissionDistributed += sale.grossCommissionEarned;
    });

    agent.withdrawalHistory.forEach(wd => {
      if (wd.status === 'Pending') {
        pendingWithdrawalsAmount += wd.amount;
      } else if (wd.status === 'Approved') {
        paidWithdrawalsAmount += wd.amount;
      }
    });
  });

  const totalExpencesVolume = totalCommissionDistributed + paidWithdrawalsAmount;

  return {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'Active').length,
    totalPlotSalesCount,
    totalSalesVolume,
    totalCommissionDistributed,
    totalEmiRecovered,
    outstandingEmiLiability,
    totalExpencesVolume,
    pendingWithdrawalsAmount
  };
}
