import {
  MlmLevelConfig,
  TeamMemberRecord,
  GenealogyTreeNode,
  BonusTransactionRecord,
  MlmSystemSummary,
  BonusWithdrawalRequest
} from '../types';

export const STANDARD_MLM_PLOT_VALUE = 900000; // ₹9,00,000 standard plot

export const MANDATORY_MLM_DEDUCTION_RULE_HINDI =
  "डाउनलाइन के बोनस में से निर्धारित प्रतिशत की कटौती करके ही अपलाइन को मल्टी-लेवल बोनस प्रदान किया जाएगा।";

export const MANDATORY_MLM_DEDUCTION_RULE_ENG =
  "The multi-level bonus is paid to the upline strictly after deducting the specified percentage bonus amount from the downline's commission allocation.";

export const MANDATORY_MLM_QUALIFICATION_RULE_HINDI =
  "मल्टी-लेवल बोनस केवल योग्य डाउनलाइन के प्लॉट विक्रय पर देय होगा। प्रत्येक स्तर का बोनस निर्धारित प्रतिशत के अनुसार गणना किया जाएगा तथा डाउनलाइन बोनस कटौती नियम लागू रहेगा।";

export const MANDATORY_MLM_QUALIFICATION_RULE_ENG =
  "Multi-level bonus is payable exclusively on qualifying downline plot sales. Each level bonus is calculated according to the predefined percentage, and downline bonus deduction rules apply.";

export const MLM_LEVEL_CONFIGS: MlmLevelConfig[] = [
  {
    level: 1,
    designation: 'Free Plot Scheme',
    qualificationRule: 'First Downline sells 1 Plot',
    requiredPlotsSold: 1,
    bonusPercentage: 2.0,
    exampleBonusForStandardPlot: 18000
  },
  {
    level: 2,
    designation: 'Agentship',
    qualificationRule: 'Second Downline sells 2 Plots',
    requiredPlotsSold: 2,
    bonusPercentage: 3.0,
    exampleBonusForStandardPlot: 27000
  },
  {
    level: 3,
    designation: 'Salesman',
    qualificationRule: 'Third Downline sells 3 Plots',
    requiredPlotsSold: 3,
    bonusPercentage: 3.5,
    exampleBonusForStandardPlot: 31500
  },
  {
    level: 4,
    designation: 'Leadership',
    qualificationRule: 'Fourth Downline sells 4 Plots',
    requiredPlotsSold: 4,
    bonusPercentage: 4.0,
    exampleBonusForStandardPlot: 36000
  },
  {
    level: 5,
    designation: 'Mentorship',
    qualificationRule: 'Fifth Downline sells 5 Plots',
    requiredPlotsSold: 5,
    bonusPercentage: 4.20,
    exampleBonusForStandardPlot: 37800
  },
  {
    level: 6,
    designation: 'Distributership',
    qualificationRule: 'Sixth Downline sells 6 Plots',
    requiredPlotsSold: 6,
    bonusPercentage: 4.40,
    exampleBonusForStandardPlot: 39600
  },
  {
    level: 7,
    designation: 'Dealership',
    qualificationRule: 'Seventh Downline sells 7 Plots',
    requiredPlotsSold: 7,
    bonusPercentage: 4.60,
    exampleBonusForStandardPlot: 41400
  },
  {
    level: 8,
    designation: 'Councelership',
    qualificationRule: 'Eighth Downline sells 8 Plots',
    requiredPlotsSold: 8,
    bonusPercentage: 4.80,
    exampleBonusForStandardPlot: 43200
  },
  {
    level: 9,
    designation: 'Co-Partnership',
    qualificationRule: 'Ninth Downline sells 9 Plots',
    requiredPlotsSold: 9,
    bonusPercentage: 5.00,
    exampleBonusForStandardPlot: 45000
  }
];

export const INITIAL_TEAM_MEMBERS_SEED: TeamMemberRecord[] = [
  {
    id: 'TMB-1001',
    name: 'Shri Vikramaditya Singh',
    phone: '9839011223',
    email: 'vikramaditya@vigyapaurush.com',
    role: 'Agent',
    sponsorId: null,
    sponsorName: null,
    parentId: null,
    parentName: null,
    joiningDate: '2024-01-10',
    status: 'Active',
    currentLevel: 9,
    currentDesignation: 'Co-Partnership',
    nextLevelRequirement: 'Maximum Tier Attained (Top Level 9)',
    remainingPlotsToNextLevel: 0,
    personalPlotsSold: 12,
    teamSize: 34,
    activeMembers: 30,
    inactiveMembers: 4,
    directReferralsCount: 8,
    qualifiedDownlinesCount: 28,
    salesMetrics: {
      dailySalesVolume: 1800000,
      weeklySalesVolume: 9000000,
      monthlySalesVolume: 27000000,
      quarterlySalesVolume: 81000000,
      annualSalesVolume: 243000000,
      totalTeamSalesVolume: 306000000,
      totalPlotsSoldByTeam: 340
    },
    wallet: {
      memberId: 'TMB-1001',
      memberName: 'Shri Vikramaditya Singh',
      availableBonus: 385000,
      paidBonus: 1250000,
      pendingWithdrawalsBonus: 150000,
      totalBonusEarned: 1785000,
      lastUpdated: '2026-08-08'
    },
    bonusLedger: [
      {
        id: 'TXN-MLM-9001',
        date: '2026-08-05',
        downlineMemberId: 'TMB-1002',
        downlineName: 'Rajesh Sharma',
        uplineMemberId: 'TMB-1001',
        uplineName: 'Shri Vikramaditya Singh',
        levelTriggered: 1,
        designation: 'Free Plot Scheme',
        plotNo: 'PLT-C104',
        saleValue: 900000,
        grossCommission: 139500,
        bonusPercentage: 2.0,
        bonusAmountEarned: 18000,
        downlineDeductionAmount: 18000,
        netBonusCredited: 18000,
        status: 'Credited',
        auditNotes: 'Level 1 Team Building Bonus credited after 2% downline commission deduction.'
      },
      {
        id: 'TXN-MLM-9002',
        date: '2026-08-02',
        downlineMemberId: 'TMB-1003',
        downlineName: 'Amitabh Verma',
        uplineMemberId: 'TMB-1001',
        uplineName: 'Shri Vikramaditya Singh',
        levelTriggered: 2,
        designation: 'Agentship',
        plotNo: 'PLT-D208',
        saleValue: 900000,
        grossCommission: 135000,
        bonusPercentage: 3.0,
        bonusAmountEarned: 27000,
        downlineDeductionAmount: 27000,
        netBonusCredited: 27000,
        status: 'Credited',
        auditNotes: 'Level 2 Team Building Bonus credited after 3% downline deduction.'
      }
    ],
    withdrawalHistory: [
      {
        id: 'PWR-7001',
        memberId: 'TMB-1001',
        memberName: 'Shri Vikramaditya Singh',
        requestDate: '2026-08-07',
        amount: 150000,
        paymentMethod: 'Bank Transfer',
        accountDetails: 'HDFC Bank A/C ****8829 - IFSC: HDFC0001024',
        status: 'Pending'
      },
      {
        id: 'PWR-7002',
        memberId: 'TMB-1001',
        memberName: 'Shri Vikramaditya Singh',
        requestDate: '2026-07-25',
        amount: 250000,
        paymentMethod: 'Bank Transfer',
        accountDetails: 'HDFC Bank A/C ****8829 - IFSC: HDFC0001024',
        status: 'Approved',
        processedDate: '2026-07-26',
        transactionId: 'TXN-MLM-BANK-88201'
      }
    ]
  },
  {
    id: 'TMB-1002',
    name: 'Rajesh Sharma',
    phone: '9876543210',
    email: 'rajesh.sharma@vigyapaurush.com',
    role: 'Customer',
    sponsorId: 'TMB-1001',
    sponsorName: 'Shri Vikramaditya Singh',
    parentId: 'TMB-1001',
    parentName: 'Shri Vikramaditya Singh',
    joiningDate: '2024-03-15',
    status: 'Active',
    currentLevel: 4,
    currentDesignation: 'Leadership',
    nextLevelRequirement: 'Mentorship (Fifth Downline sells 5 Plots)',
    remainingPlotsToNextLevel: 1,
    personalPlotsSold: 4,
    teamSize: 12,
    activeMembers: 11,
    inactiveMembers: 1,
    directReferralsCount: 4,
    qualifiedDownlinesCount: 9,
    salesMetrics: {
      dailySalesVolume: 900000,
      weeklySalesVolume: 2700000,
      monthlySalesVolume: 8100000,
      quarterlySalesVolume: 24300000,
      annualSalesVolume: 72900000,
      totalTeamSalesVolume: 98100000,
      totalPlotsSoldByTeam: 109
    },
    wallet: {
      memberId: 'TMB-1002',
      memberName: 'Rajesh Sharma',
      availableBonus: 142000,
      paidBonus: 320000,
      pendingWithdrawalsBonus: 0,
      totalBonusEarned: 462000,
      lastUpdated: '2026-08-08'
    },
    bonusLedger: [
      {
        id: 'TXN-MLM-8001',
        date: '2026-08-01',
        downlineMemberId: 'TMB-1004',
        downlineName: 'Meena Gupta',
        uplineMemberId: 'TMB-1002',
        uplineName: 'Rajesh Sharma',
        levelTriggered: 1,
        designation: 'Free Plot Scheme',
        plotNo: 'PLT-A101',
        saleValue: 900000,
        grossCommission: 139500,
        bonusPercentage: 2.0,
        bonusAmountEarned: 18000,
        downlineDeductionAmount: 18000,
        netBonusCredited: 18000,
        status: 'Credited',
        auditNotes: 'Level 1 Team Bonus credited with 2% deduction.'
      }
    ],
    withdrawalHistory: []
  },
  {
    id: 'TMB-1003',
    name: 'Amitabh Verma',
    phone: '9988776655',
    email: 'averma@vigyapaurush.com',
    role: 'Agent',
    sponsorId: 'TMB-1001',
    sponsorName: 'Shri Vikramaditya Singh',
    parentId: 'TMB-1001',
    parentName: 'Shri Vikramaditya Singh',
    joiningDate: '2024-04-10',
    status: 'Active',
    currentLevel: 5,
    currentDesignation: 'Mentorship',
    nextLevelRequirement: 'Distributership (Sixth Downline sells 6 Plots)',
    remainingPlotsToNextLevel: 1,
    personalPlotsSold: 6,
    teamSize: 15,
    activeMembers: 14,
    inactiveMembers: 1,
    directReferralsCount: 5,
    qualifiedDownlinesCount: 12,
    salesMetrics: {
      dailySalesVolume: 900000,
      weeklySalesVolume: 3600000,
      monthlySalesVolume: 10800000,
      quarterlySalesVolume: 32400000,
      annualSalesVolume: 97200000,
      totalTeamSalesVolume: 125000000,
      totalPlotsSoldByTeam: 138
    },
    wallet: {
      memberId: 'TMB-1003',
      memberName: 'Amitabh Verma',
      availableBonus: 215000,
      paidBonus: 450000,
      pendingWithdrawalsBonus: 50000,
      totalBonusEarned: 715000,
      lastUpdated: '2026-08-08'
    },
    bonusLedger: [],
    withdrawalHistory: [
      {
        id: 'PWR-7003',
        memberId: 'TMB-1003',
        memberName: 'Amitabh Verma',
        requestDate: '2026-08-08',
        amount: 50000,
        paymentMethod: 'UPI',
        accountDetails: 'averma@upi',
        status: 'Pending'
      }
    ]
  },
  {
    id: 'TMB-1004',
    name: 'Meena Gupta',
    phone: '9812345678',
    email: 'meenaguptaprayag@gmail.com',
    role: 'Customer',
    sponsorId: 'TMB-1002',
    sponsorName: 'Rajesh Sharma',
    parentId: 'TMB-1002',
    parentName: 'Rajesh Sharma',
    joiningDate: '2024-06-20',
    status: 'Active',
    currentLevel: 2,
    currentDesignation: 'Agentship',
    nextLevelRequirement: 'Salesman (Third Downline sells 3 Plots)',
    remainingPlotsToNextLevel: 1,
    personalPlotsSold: 2,
    teamSize: 5,
    activeMembers: 5,
    inactiveMembers: 0,
    directReferralsCount: 2,
    qualifiedDownlinesCount: 4,
    salesMetrics: {
      dailySalesVolume: 0,
      weeklySalesVolume: 1800000,
      monthlySalesVolume: 5400000,
      quarterlySalesVolume: 16200000,
      annualSalesVolume: 48600000,
      totalTeamSalesVolume: 48600000,
      totalPlotsSoldByTeam: 54
    },
    wallet: {
      memberId: 'TMB-1004',
      memberName: 'Meena Gupta',
      availableBonus: 65000,
      paidBonus: 110000,
      pendingWithdrawalsBonus: 0,
      totalBonusEarned: 175000,
      lastUpdated: '2026-08-08'
    },
    bonusLedger: [],
    withdrawalHistory: []
  },
  {
    id: 'TMB-1005',
    name: 'Ramesh Chander',
    phone: '9911223344',
    email: 'rchander@gmail.com',
    role: 'RiskFreeInvestor',
    sponsorId: 'TMB-1003',
    sponsorName: 'Amitabh Verma',
    parentId: 'TMB-1003',
    parentName: 'Amitabh Verma',
    joiningDate: '2024-07-01',
    status: 'Active',
    currentLevel: 3,
    currentDesignation: 'Salesman',
    nextLevelRequirement: 'Leadership (Fourth Downline sells 4 Plots)',
    remainingPlotsToNextLevel: 1,
    personalPlotsSold: 3,
    teamSize: 6,
    activeMembers: 5,
    inactiveMembers: 1,
    directReferralsCount: 3,
    qualifiedDownlinesCount: 4,
    salesMetrics: {
      dailySalesVolume: 900000,
      weeklySalesVolume: 2700000,
      monthlySalesVolume: 8100000,
      quarterlySalesVolume: 24300000,
      annualSalesVolume: 54000000,
      totalTeamSalesVolume: 54000000,
      totalPlotsSoldByTeam: 60
    },
    wallet: {
      memberId: 'TMB-1005',
      memberName: 'Ramesh Chander',
      availableBonus: 82000,
      paidBonus: 140000,
      pendingWithdrawalsBonus: 0,
      totalBonusEarned: 222000,
      lastUpdated: '2026-08-08'
    },
    bonusLedger: [],
    withdrawalHistory: []
  }
];

const MLM_TEAM_STORAGE_KEY = 'vigya_paurush_mlm_team_records_v1';

export function loadMlmTeamDataFromStorage(): TeamMemberRecord[] {
  try {
    const raw = localStorage.getItem(MLM_TEAM_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MLM_TEAM_STORAGE_KEY, JSON.stringify(INITIAL_TEAM_MEMBERS_SEED));
      return INITIAL_TEAM_MEMBERS_SEED;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load MLM team records from storage:', err);
    return INITIAL_TEAM_MEMBERS_SEED;
  }
}

export function saveMlmTeamDataToStorage(records: TeamMemberRecord[]): void {
  try {
    localStorage.setItem(MLM_TEAM_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save MLM team records to storage:', err);
  }
}

export function computeMlmSystemSummary(records: TeamMemberRecord[]): MlmSystemSummary {
  let totalTeamMembers = records.length;
  let activeTeamMembers = 0;
  let inactiveTeamMembers = 0;
  let totalTeamSalesVolume = 0;
  let totalPlotsSold = 0;
  let totalBonusEarned = 0;
  let totalBonusPaid = 0;
  let totalBonusPending = 0;
  let pendingWithdrawalsCount = 0;
  let pendingWithdrawalsAmount = 0;

  records.forEach(rec => {
    if (rec.status === 'Active') activeTeamMembers++;
    else inactiveTeamMembers++;

    totalTeamSalesVolume += rec.salesMetrics.totalTeamSalesVolume;
    totalPlotsSold += rec.salesMetrics.totalPlotsSoldByTeam;
    totalBonusEarned += rec.wallet.totalBonusEarned;
    totalBonusPaid += rec.wallet.paidBonus;
    totalBonusPending += rec.wallet.availableBonus;

    rec.withdrawalHistory.forEach(w => {
      if (w.status === 'Pending') {
        pendingWithdrawalsCount++;
        pendingWithdrawalsAmount += w.amount;
      }
    });
  });

  return {
    totalTeamMembers,
    activeTeamMembers,
    inactiveTeamMembers,
    totalTeamSalesVolume,
    totalPlotsSold,
    totalBonusEarned,
    totalBonusPaid,
    totalBonusPending,
    pendingWithdrawalsCount,
    pendingWithdrawalsAmount
  };
}

// Build MLM Genealogy Tree hierarchy recursively
export function buildGenealogyTree(records: TeamMemberRecord[]): GenealogyTreeNode[] {
  const nodeMap = new Map<string, GenealogyTreeNode>();

  // Map each record to a node
  records.forEach(rec => {
    nodeMap.set(rec.id, {
      id: rec.id,
      name: rec.name,
      phone: rec.phone,
      role: rec.role,
      designation: rec.currentDesignation,
      currentLevel: rec.currentLevel,
      sponsorId: rec.sponsorId,
      parentId: rec.parentId,
      joiningDate: rec.joiningDate,
      status: rec.status,
      personalPlotsSold: rec.personalPlotsSold,
      teamSalesVolume: rec.salesMetrics.totalTeamSalesVolume,
      totalTeamMembers: rec.teamSize,
      activeTeamMembers: rec.activeMembers,
      inactiveTeamMembers: rec.inactiveMembers,
      directReferralsCount: rec.directReferralsCount,
      children: []
    });
  });

  const roots: GenealogyTreeNode[] = [];

  nodeMap.forEach(node => {
    if (!node.parentId || !nodeMap.has(node.parentId)) {
      roots.push(node);
    } else {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      }
    }
  });

  return roots;
}

// Helper to calculate bonus for a specific level & sale value
export function calculateLevelBonus(saleValue: number, level: number) {
  const levelConfig = MLM_LEVEL_CONFIGS.find(l => l.level === level) || MLM_LEVEL_CONFIGS[0];
  const bonusPercentage = levelConfig.bonusPercentage;
  const bonusAmountEarned = (saleValue * bonusPercentage) / 100;
  return {
    level,
    designation: levelConfig.designation,
    bonusPercentage,
    bonusAmountEarned,
    downlineDeductionAmount: bonusAmountEarned
  };
}
