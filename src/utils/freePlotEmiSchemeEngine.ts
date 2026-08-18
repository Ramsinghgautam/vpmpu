import {
  EmiFreePlotSchemePlan,
  EmiInvestorRecord,
  EmiPaymentRecord,
  EmiSoldPlotRecord,
  EmiMasterConfigAuditLog,
  EmiSchemeAnalytics,
} from '../types';

// =============================================================================
// 24.5% फ्री प्लॉट स्कीम (किस्तों में प्लॉट) – MASTER CONFIGURATION MATRIX
// All figures are configurable via Master Config Manager and not hard-coded in UI.
// =============================================================================

export const DEFAULT_EMI_SCHEME_PLANS: EmiFreePlotSchemePlan[] = [
  // 32% Free Plot Scheme Plans (Required Plot Sales = 5)
  {
    id: 'PLAN-320-12M',
    schemeName: '32% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (12 Months)',
    tenureMonths: 12,
    monthlyInstallment: 161250,
    monthlyReturn: 212850,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 50678,
    plotSizeSqft: 900,
    interestRatePercent: 32.0,
    totalTenureInvestment: 1935000,
    totalTenureReturn: 2554200,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 32% scheme',
  },
  {
    id: 'PLAN-320-24M',
    schemeName: '32% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (24 Months)',
    tenureMonths: 24,
    monthlyInstallment: 80625,
    monthlyReturn: 106425,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 25339,
    plotSizeSqft: 900,
    interestRatePercent: 32.0,
    totalTenureInvestment: 1935000,
    totalTenureReturn: 2554200,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 32% scheme',
  },
  {
    id: 'PLAN-320-36M',
    schemeName: '32% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (36 Months)',
    tenureMonths: 36,
    monthlyInstallment: 55750,
    monthlyReturn: 70950,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 16892,
    plotSizeSqft: 900,
    interestRatePercent: 32.0,
    totalTenureInvestment: 2007000,
    totalTenureReturn: 2554200,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 32% scheme',
  },
  {
    id: 'PLAN-320-48M',
    schemeName: '32% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (48 Months)',
    tenureMonths: 48,
    monthlyInstallment: 40313,
    monthlyReturn: 53212,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 12669,
    plotSizeSqft: 900,
    interestRatePercent: 32.0,
    totalTenureInvestment: 1935024,
    totalTenureReturn: 2554176,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 32% scheme',
  },
  {
    id: 'PLAN-320-60M',
    schemeName: '32% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (60 Months)',
    tenureMonths: 60,
    monthlyInstallment: 32250,
    monthlyReturn: 42570,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 10135,
    plotSizeSqft: 900,
    interestRatePercent: 32.0,
    totalTenureInvestment: 1935000,
    totalTenureReturn: 2554200,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 32% scheme',
  },
  {
    id: 'PLAN-320-72M',
    schemeName: '32% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (72 Months)',
    tenureMonths: 72,
    monthlyInstallment: 26875,
    monthlyReturn: 35475,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 8446,
    plotSizeSqft: 900,
    interestRatePercent: 32.0,
    totalTenureInvestment: 1935000,
    totalTenureReturn: 2554200,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 32% scheme',
  },
  {
    id: 'PLAN-320-84M',
    schemeName: '32% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (84 Months)',
    tenureMonths: 84,
    monthlyInstallment: 23036,
    monthlyReturn: 30407,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 7239,
    plotSizeSqft: 900,
    interestRatePercent: 32.0,
    totalTenureInvestment: 1935024,
    totalTenureReturn: 2554188,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 32% scheme',
  },
  {
    id: 'PLAN-320-96M',
    schemeName: '32% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (96 Months)',
    tenureMonths: 96,
    monthlyInstallment: 20157,
    monthlyReturn: 26606,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 6334,
    plotSizeSqft: 900,
    interestRatePercent: 32.0,
    totalTenureInvestment: 1935072,
    totalTenureReturn: 2554176,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 32% scheme',
  },
  {
    id: 'PLAN-320-108M',
    schemeName: '32% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (108 Months)',
    tenureMonths: 108,
    monthlyInstallment: 17917,
    monthlyReturn: 23650,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 5630,
    plotSizeSqft: 900,
    interestRatePercent: 32.0,
    totalTenureInvestment: 1935036,
    totalTenureReturn: 2554200,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 32% scheme',
  },
  {
    id: 'PLAN-320-120M',
    schemeName: '32% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (120 Months)',
    tenureMonths: 120,
    monthlyInstallment: 16125,
    monthlyReturn: 21285,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 5067,
    plotSizeSqft: 900,
    interestRatePercent: 32.0,
    totalTenureInvestment: 1935000,
    totalTenureReturn: 2554200,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 32% scheme',
  },
  // 27% Free Plot Scheme Plans
  {
    id: 'PLAN-270-12M',
    schemeName: '27% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (12 Months)',
    tenureMonths: 12,
    monthlyInstallment: 132750,
    monthlyReturn: 168592,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 31870,
    plotSizeSqft: 900,
    interestRatePercent: 27.0,
    totalTenureInvestment: 1593000,
    totalTenureReturn: 2023104,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 27% scheme',
  },
  {
    id: 'PLAN-270-24M',
    schemeName: '27% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (24 Months)',
    tenureMonths: 24,
    monthlyInstallment: 66375,
    monthlyReturn: 84296,
    requiredPlotSales: 6,
    bonusReturnPerPlot: 17935,
    plotSizeSqft: 900,
    interestRatePercent: 27.0,
    totalTenureInvestment: 1593000,
    totalTenureReturn: 2023104,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '6 verified plot sales required for eligibility under 27% scheme',
  },
  {
    id: 'PLAN-270-36M',
    schemeName: '27% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (36 Months)',
    tenureMonths: 36,
    monthlyInstallment: 44250,
    monthlyReturn: 56197,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 11956,
    plotSizeSqft: 900,
    interestRatePercent: 27.0,
    totalTenureInvestment: 1593000,
    totalTenureReturn: 2023092,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 27% scheme',
  },
  {
    id: 'PLAN-270-48M',
    schemeName: '27% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (48 Months)',
    tenureMonths: 48,
    monthlyInstallment: 33188,
    monthlyReturn: 42148,
    requiredPlotSales: 6,
    bonusReturnPerPlot: 8964,
    plotSizeSqft: 900,
    interestRatePercent: 27.0,
    totalTenureInvestment: 1593024,
    totalTenureReturn: 2023104,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '6 verified plot sales required for eligibility under 27% scheme',
  },
  {
    id: 'PLAN-270-60M',
    schemeName: '27% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (60 Months)',
    tenureMonths: 60,
    monthlyInstallment: 26550,
    monthlyReturn: 33718,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 7046,
    plotSizeSqft: 900,
    interestRatePercent: 27.0,
    totalTenureInvestment: 1593000,
    totalTenureReturn: 2023080,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 27% scheme',
  },
  {
    id: 'PLAN-270-72M',
    schemeName: '27% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (72 Months)',
    tenureMonths: 72,
    monthlyInstallment: 22125,
    monthlyReturn: 28098,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 5978,
    plotSizeSqft: 900,
    interestRatePercent: 27.0,
    totalTenureInvestment: 1593000,
    totalTenureReturn: 2023056,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 27% scheme',
  },
  {
    id: 'PLAN-270-84M',
    schemeName: '27% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (84 Months)',
    tenureMonths: 84,
    monthlyInstallment: 18965,
    monthlyReturn: 24084,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 5124,
    plotSizeSqft: 900,
    interestRatePercent: 27.0,
    totalTenureInvestment: 1593060,
    totalTenureReturn: 2023056,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 27% scheme',
  },
  {
    id: 'PLAN-270-96M',
    schemeName: '27% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (96 Months)',
    tenureMonths: 96,
    monthlyInstallment: 16594,
    monthlyReturn: 21074,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 4483,
    plotSizeSqft: 900,
    interestRatePercent: 27.0,
    totalTenureInvestment: 1593024,
    totalTenureReturn: 2023104,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 27% scheme',
  },
  {
    id: 'PLAN-270-108M',
    schemeName: '27% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (108 Months)',
    tenureMonths: 108,
    monthlyInstallment: 14750,
    monthlyReturn: 18732,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 3985,
    plotSizeSqft: 900,
    interestRatePercent: 27.0,
    totalTenureInvestment: 1593000,
    totalTenureReturn: 2023056,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 27% scheme',
  },
  {
    id: 'PLAN-270-120M',
    schemeName: '27% फ्री प्लॉट स्कीम – किस्तों में प्लॉट (120 Months)',
    tenureMonths: 120,
    monthlyInstallment: 13275,
    monthlyReturn: 16859,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 3587,
    plotSizeSqft: 900,
    interestRatePercent: 27.0,
    totalTenureInvestment: 1593000,
    totalTenureReturn: 2023080,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility under 27% scheme',
  },
  // 24.5% Free Plot Scheme Plans
  {
    id: 'PLAN-245-12M',
    schemeName: '24.5% Free Plot Scheme (12 Months)',
    tenureMonths: 12,
    monthlyInstallment: 120000,
    monthlyReturn: 149400,
    requiredPlotSales: 6,
    bonusReturnPerPlot: 29294,
    plotSizeSqft: 900,
    interestRatePercent: 24.5,
    totalTenureInvestment: 1440000,
    totalTenureReturn: 1792800,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '6 verified plot sales required for eligibility',
  },
  {
    id: 'PLAN-245-24M',
    schemeName: '24.5% Free Plot Scheme (24 Months)',
    tenureMonths: 24,
    monthlyInstallment: 60000,
    monthlyReturn: 74700,
    requiredPlotSales: 6,
    bonusReturnPerPlot: 29294,
    plotSizeSqft: 900,
    interestRatePercent: 24.5,
    totalTenureInvestment: 1440000,
    totalTenureReturn: 1792800,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '6 verified plot sales required for eligibility',
  },
  {
    id: 'PLAN-245-60M',
    schemeName: '24.5% Free Plot Scheme (60 Months)',
    tenureMonths: 60,
    monthlyInstallment: 24000,
    monthlyReturn: 29880,
    requiredPlotSales: 6,
    bonusReturnPerPlot: 5858,
    plotSizeSqft: 900,
    interestRatePercent: 24.5,
    totalTenureInvestment: 1440000,
    totalTenureReturn: 1792800,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '6 verified plot sales required for eligibility',
  },
  {
    id: 'PLAN-245-120M',
    schemeName: '24.5% Free Plot Scheme (120 Months)',
    tenureMonths: 120,
    monthlyInstallment: 12000,
    monthlyReturn: 14940,
    requiredPlotSales: 5,
    bonusReturnPerPlot: 2929,
    plotSizeSqft: 900,
    interestRatePercent: 24.5,
    totalTenureInvestment: 1440000,
    totalTenureReturn: 1792800,
    isActive: true,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    notes: '5 verified plot sales required for eligibility',
  },
];

// Generate standard EMI schedule for given tenure & monthly amount
export function generateEmiSchedule(
  tenureMonths: number,
  monthlyAmount: number,
  startDateStr: string = '2026-01-10',
  paidCount: number = 0
): EmiPaymentRecord[] {
  const schedule: EmiPaymentRecord[] = [];
  const baseDate = new Date(startDateStr);

  for (let i = 1; i <= tenureMonths; i++) {
    const dueDate = new Date(baseDate);
    dueDate.setMonth(baseDate.getMonth() + (i - 1));

    const isPaid = i <= paidCount;
    const isCurrent = i === paidCount + 1;

    schedule.push({
      installmentNo: i,
      dueDate: dueDate.toISOString().split('T')[0],
      paidDate: isPaid ? dueDate.toISOString().split('T')[0] : undefined,
      amount: monthlyAmount,
      status: isPaid ? 'Paid' : isCurrent ? 'Due' : 'Upcoming',
      paymentMode: isPaid ? 'UPI' : undefined,
      txnRef: isPaid ? `UPI-245-${100000 + i * 4321}` : undefined,
      receiptNumber: isPaid ? `REC-245-${new Date().getFullYear()}-${1000 + i}` : undefined,
    });
  }

  return schedule;
}

// Seed Enrolled Investors for 24.5% Scheme
export const INITIAL_EMI_INVESTORS: EmiInvestorRecord[] = [
  {
    id: 'INV-245-2026-001',
    investorName: 'सुरेश नारायण चतुर्वेदी (Suresh N. Chaturvedi)',
    phone: '+91 98390 12345',
    email: 'suresh.chaturvedi@example.com',
    seniorName: 'राजेश कुमार मिश्रा (VP)',
    seniorId: 'VP-AGT-101',
    address: '24/B, टैगोर टाउन, प्रयागराज (UP)',
    plotNo: 'PLOT-FPS-201',
    plotSizeSqft: 900,
    tenureMonths: 12,
    monthlyEmi: 120000,
    monthlyReturn: 149400,
    bonusReturnPerPlot: 29294,
    requiredPlotSales: 6,
    interestRatePercent: 24.5,
    totalInvestment: 1440000,
    totalExpectedReturn: 1792800,
    joiningDate: '2026-01-10',
    maturityDate: '2027-01-10',
    nominee: {
      nomineeName: 'सुनीता चतुर्वेदी',
      nomineeRelation: 'पत्नी (Wife)',
      nomineeAge: 42,
      nomineePhone: '+91 98390 99887',
    },
    status: 'Active',
    paidInstallmentsCount: 4,
    totalPaidAmount: 480000,
    remainingInstallmentsCount: 8,
    remainingAmount: 960000,
    nextEmiDueDate: '2026-05-10',
    plotsSoldCount: 4,
    soldPlotsList: [
      {
        id: 'SP-2026-101',
        plotNo: 'PLOT-FPS-302',
        projectName: 'Vigya City Phase 2',
        buyerName: 'आनंद प्रकाश सिंह',
        buyerPhone: '+91 94150 11223',
        saleAmount: 1188000,
        saleDate: '2026-02-14',
        monthlyBonusRate: 29294,
        registeredBy: 'सुरेश नारायण चतुर्वेदी',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2026-02-15',
      },
      {
        id: 'SP-2026-102',
        plotNo: 'PLOT-FPS-305',
        projectName: 'Vigya City Phase 2',
        buyerName: 'रमेश कुमार गुप्ता',
        buyerPhone: '+91 94150 22334',
        saleAmount: 1188000,
        saleDate: '2026-03-01',
        monthlyBonusRate: 29294,
        registeredBy: 'सुरेश नारायण चतुर्वेदी',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2026-03-02',
      },
      {
        id: 'SP-2026-103',
        plotNo: 'PLOT-FPS-310',
        projectName: 'Vigya Green Meadows',
        buyerName: 'अमित कुमार यादव',
        buyerPhone: '+91 94150 33445',
        saleAmount: 1188000,
        saleDate: '2026-03-20',
        monthlyBonusRate: 29294,
        registeredBy: 'सुरेश नारायण चतुर्वेदी',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2026-03-21',
      },
      {
        id: 'SP-2026-104',
        plotNo: 'PLOT-FPS-314',
        projectName: 'Vigya City Phase 2',
        buyerName: 'संजय कुमार त्रिपाठी',
        buyerPhone: '+91 94150 44556',
        saleAmount: 1188000,
        saleDate: '2026-04-05',
        monthlyBonusRate: 29294,
        registeredBy: 'सुरेश नारायण चतुर्वेदी',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2026-04-06',
      },
    ],
    monthlyBonusAmount: 117176, // 4 * 29294
    totalCurrentMonthlyReturn: 266576, // 149400 + 117176
    isPlotTargetMet: false, // 4/6
    isTenureCompleted: false,
    isPayoutEligible: false,
    isPayoutDisbursed: false,
    bankName: 'State Bank of India',
    accountNumber: '38920192831',
    ifscCode: 'SBIN0001234',
    panNumber: 'ABCDE1234F',
    aadharNumber: '8920 1928 3102',
    emiLedger: generateEmiSchedule(12, 120000, '2026-01-10', 4),
    auditLogs: [
      {
        id: 'LOG-001',
        timestamp: '2026-01-10 11:30',
        actor: 'Admin (Manoj Tiwari)',
        action: 'Investor Registration',
        details: 'Enrolled in 24.5% Free Plot Scheme (12M Plan, ₹1,20,000/mo)',
      },
    ],
    createdAt: '2026-01-10T11:30:00Z',
    updatedAt: '2026-04-06T14:20:00Z',
  },
  {
    id: 'INV-245-2026-002',
    investorName: 'मीनाक्षी देवी शुक्ला (Meenakshi Devi Shukla)',
    phone: '+91 97930 56789',
    email: 'meenakshi.shukla@example.com',
    seniorName: 'विपिन बिहारी लाल (Senior Director)',
    seniorId: 'SD-AGT-204',
    address: '112, लूकरगंज, प्रयागराज (UP)',
    plotNo: 'PLOT-FPS-202',
    plotSizeSqft: 900,
    tenureMonths: 24,
    monthlyEmi: 60000,
    monthlyReturn: 74700,
    bonusReturnPerPlot: 29294,
    requiredPlotSales: 6,
    interestRatePercent: 24.5,
    totalInvestment: 1440000,
    totalExpectedReturn: 1792800,
    joiningDate: '2025-10-15',
    maturityDate: '2027-10-15',
    nominee: {
      nomineeName: 'अभिषेक शुक्ला',
      nomineeRelation: 'पुत्र (Son)',
      nomineeAge: 21,
      nomineePhone: '+91 97930 11223',
    },
    status: 'Eligible',
    paidInstallmentsCount: 6,
    totalPaidAmount: 360000,
    remainingInstallmentsCount: 18,
    remainingAmount: 1080000,
    nextEmiDueDate: '2026-05-15',
    plotsSoldCount: 6,
    soldPlotsList: [
      {
        id: 'SP-2026-201',
        plotNo: 'PLOT-FPS-401',
        projectName: 'Vigya City Phase 2',
        buyerName: 'राजकुमार शर्मा',
        buyerPhone: '+91 98111 22334',
        saleAmount: 1188000,
        saleDate: '2025-11-10',
        monthlyBonusRate: 29294,
        registeredBy: 'मीनाक्षी देवी शुक्ला',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2025-11-11',
      },
      {
        id: 'SP-2026-202',
        plotNo: 'PLOT-FPS-402',
        projectName: 'Vigya City Phase 2',
        buyerName: 'सुधांशु श्रीवास्तव',
        buyerPhone: '+91 98111 33445',
        saleAmount: 1188000,
        saleDate: '2025-12-05',
        monthlyBonusRate: 29294,
        registeredBy: 'मीनाक्षी देवी शुक्ला',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2025-12-06',
      },
      {
        id: 'SP-2026-203',
        plotNo: 'PLOT-FPS-403',
        projectName: 'Vigya Green Meadows',
        buyerName: 'पवन कुमार पाठक',
        buyerPhone: '+91 98111 44556',
        saleAmount: 1188000,
        saleDate: '2026-01-18',
        monthlyBonusRate: 29294,
        registeredBy: 'मीनाक्षी देवी शुक्ला',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2026-01-19',
      },
      {
        id: 'SP-2026-204',
        plotNo: 'PLOT-FPS-404',
        projectName: 'Vigya City Phase 2',
        buyerName: 'प्रमोद कुमार दुबे',
        buyerPhone: '+91 98111 55667',
        saleAmount: 1188000,
        saleDate: '2026-02-22',
        monthlyBonusRate: 29294,
        registeredBy: 'मीनाक्षी देवी शुक्ला',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2026-02-23',
      },
      {
        id: 'SP-2026-205',
        plotNo: 'PLOT-FPS-405',
        projectName: 'Vigya City Phase 2',
        buyerName: 'दीपक कुमार सिंह',
        buyerPhone: '+91 98111 66778',
        saleAmount: 1188000,
        saleDate: '2026-03-12',
        monthlyBonusRate: 29294,
        registeredBy: 'मीनाक्षी देवी शुक्ला',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2026-03-13',
      },
      {
        id: 'SP-2026-206',
        plotNo: 'PLOT-FPS-406',
        projectName: 'Vigya City Phase 2',
        buyerName: 'हरीश चन्द्र पाण्डेय',
        buyerPhone: '+91 98111 77889',
        saleAmount: 1188000,
        saleDate: '2026-04-01',
        monthlyBonusRate: 29294,
        registeredBy: 'मीनाक्षी देवी शुक्ला',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2026-04-02',
      },
    ],
    monthlyBonusAmount: 175764, // 6 * 29294
    totalCurrentMonthlyReturn: 250464, // 74700 + 175764
    isPlotTargetMet: true, // 6/6
    isTenureCompleted: false,
    isPayoutEligible: true,
    isPayoutDisbursed: false,
    bankName: 'Bank of Baroda',
    accountNumber: '40910291823',
    ifscCode: 'BARB0ALLAHA',
    panNumber: 'PQRS5678G',
    aadharNumber: '7829 1029 4819',
    emiLedger: generateEmiSchedule(24, 60000, '2025-10-15', 6),
    auditLogs: [
      {
        id: 'LOG-002',
        timestamp: '2026-04-02 16:45',
        actor: 'Super Admin',
        action: 'Fast-Track Eligibility Achieved',
        details: 'Investor achieved 6 verified plot sales. Ready for full return payout release.',
      },
    ],
    createdAt: '2025-10-15T09:00:00Z',
    updatedAt: '2026-04-02T16:45:00Z',
  },
  {
    id: 'INV-245-2026-003',
    investorName: 'डॉ. आलोक रंजन त्रिपाठी (Dr. Alok Ranjan Tripathi)',
    phone: '+91 94500 89012',
    email: 'dr.aloktripathi@example.com',
    seniorName: 'राजेश कुमार मिश्रा (VP)',
    seniorId: 'VP-AGT-101',
    address: '45, जॉर्ज टाउन, प्रयागराज (UP)',
    plotNo: 'PLOT-FPS-203',
    plotSizeSqft: 900,
    tenureMonths: 60,
    monthlyEmi: 24000,
    monthlyReturn: 29880,
    bonusReturnPerPlot: 5858,
    requiredPlotSales: 6,
    interestRatePercent: 24.5,
    totalInvestment: 1440000,
    totalExpectedReturn: 1792800,
    joiningDate: '2024-04-01',
    maturityDate: '2029-04-01',
    nominee: {
      nomineeName: 'डॉ. वंदना त्रिपाठी',
      nomineeRelation: 'पत्नी (Wife)',
      nomineeAge: 48,
      nomineePhone: '+91 94500 11990',
    },
    status: 'Active',
    paidInstallmentsCount: 28,
    totalPaidAmount: 672000,
    remainingInstallmentsCount: 32,
    remainingAmount: 768000,
    nextEmiDueDate: '2026-05-01',
    plotsSoldCount: 3,
    soldPlotsList: [
      {
        id: 'SP-2026-301',
        plotNo: 'PLOT-FPS-501',
        projectName: 'Vigya City Phase 2',
        buyerName: 'अनिल कुमार सिंह',
        buyerPhone: '+91 94500 77112',
        saleAmount: 1188000,
        saleDate: '2024-08-15',
        monthlyBonusRate: 5858,
        registeredBy: 'डॉ. आलोक रंजन त्रिपाठी',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2024-08-16',
      },
      {
        id: 'SP-2026-302',
        plotNo: 'PLOT-FPS-502',
        projectName: 'Vigya City Phase 2',
        buyerName: 'मनोज कुमार मिश्र',
        buyerPhone: '+91 94500 77223',
        saleAmount: 1188000,
        saleDate: '2025-01-20',
        monthlyBonusRate: 5858,
        registeredBy: 'डॉ. आलोक रंजन त्रिपाठी',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2025-01-21',
      },
      {
        id: 'SP-2026-303',
        plotNo: 'PLOT-FPS-503',
        projectName: 'Vigya City Phase 2',
        buyerName: 'विवेक कुमार श्रीवास्तव',
        buyerPhone: '+91 94500 77334',
        saleAmount: 1188000,
        saleDate: '2025-09-10',
        monthlyBonusRate: 5858,
        registeredBy: 'डॉ. आलोक रंजन त्रिपाठी',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2025-09-11',
      },
    ],
    monthlyBonusAmount: 17574, // 3 * 5858
    totalCurrentMonthlyReturn: 47454, // 29880 + 17574
    isPlotTargetMet: false, // 3/6
    isTenureCompleted: false,
    isPayoutEligible: false,
    isPayoutDisbursed: false,
    bankName: 'Punjab National Bank',
    accountNumber: '091820192831',
    ifscCode: 'PUNB0012345',
    panNumber: 'LMNOP9012K',
    aadharNumber: '9012 3456 7890',
    emiLedger: generateEmiSchedule(60, 24000, '2024-04-01', 28),
    auditLogs: [
      {
        id: 'LOG-003',
        timestamp: '2024-04-01 10:00',
        actor: 'Admin',
        action: 'Registration',
        details: 'Enrolled in 24.5% Free Plot Scheme (60M Plan)',
      },
    ],
    createdAt: '2024-04-01T10:00:00Z',
    updatedAt: '2026-04-01T12:00:00Z',
  },
  {
    id: 'INV-245-2026-004',
    investorName: 'श्रीमती कान्ता देवी मौर्य (Kanta Devi Maurya)',
    phone: '+91 93350 45678',
    email: 'kanta.maurya@example.com',
    seniorName: 'राजेश कुमार मिश्रा (VP)',
    seniorId: 'VP-AGT-101',
    address: '15/C, अल्लापुर, प्रयागराज (UP)',
    plotNo: 'PLOT-FPS-204',
    plotSizeSqft: 900,
    tenureMonths: 120,
    monthlyEmi: 12000,
    monthlyReturn: 14940,
    bonusReturnPerPlot: 2929,
    requiredPlotSales: 5,
    interestRatePercent: 24.5,
    totalInvestment: 1440000,
    totalExpectedReturn: 1792800,
    joiningDate: '2023-01-01',
    maturityDate: '2033-01-01',
    nominee: {
      nomineeName: 'अशोक मौर्य',
      nomineeRelation: 'पति (Husband)',
      nomineeAge: 55,
      nomineePhone: '+91 93350 11998',
    },
    status: 'Eligible',
    paidInstallmentsCount: 38,
    totalPaidAmount: 456000,
    remainingInstallmentsCount: 82,
    remainingAmount: 984000,
    nextEmiDueDate: '2026-05-01',
    plotsSoldCount: 5,
    soldPlotsList: [
      {
        id: 'SP-2026-401',
        plotNo: 'PLOT-FPS-601',
        projectName: 'Vigya City Phase 2',
        buyerName: 'संजय कुमार गुप्ता',
        buyerPhone: '+91 93350 88112',
        saleAmount: 1188000,
        saleDate: '2023-06-15',
        monthlyBonusRate: 2929,
        registeredBy: 'श्रीमती कान्ता देवी मौर्य',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2023-06-16',
      },
      {
        id: 'SP-2026-402',
        plotNo: 'PLOT-FPS-602',
        projectName: 'Vigya City Phase 2',
        buyerName: 'संतोष कुमार यादव',
        buyerPhone: '+91 93350 88223',
        saleAmount: 1188000,
        saleDate: '2023-11-20',
        monthlyBonusRate: 2929,
        registeredBy: 'श्रीमती कान्ता देवी मौर्य',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2023-11-21',
      },
      {
        id: 'SP-2026-403',
        plotNo: 'PLOT-FPS-603',
        projectName: 'Vigya City Phase 2',
        buyerName: 'धर्मेन्द्र कुमार वर्मा',
        buyerPhone: '+91 93350 88334',
        saleAmount: 1188000,
        saleDate: '2024-05-10',
        monthlyBonusRate: 2929,
        registeredBy: 'श्रीमती कान्ता देवी मौर्य',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2024-05-11',
      },
      {
        id: 'SP-2026-404',
        plotNo: 'PLOT-FPS-604',
        projectName: 'Vigya City Phase 2',
        buyerName: 'विकास कुमार पाण्डेय',
        buyerPhone: '+91 93350 88445',
        saleAmount: 1188000,
        saleDate: '2024-12-01',
        monthlyBonusRate: 2929,
        registeredBy: 'श्रीमती कान्ता देवी मौर्य',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2024-12-02',
      },
      {
        id: 'SP-2026-405',
        plotNo: 'PLOT-FPS-605',
        projectName: 'Vigya Green Meadows',
        buyerName: 'राजेन्द्र कुमार श्रीवास्तव',
        buyerPhone: '+91 93350 88556',
        saleAmount: 1188000,
        saleDate: '2025-08-15',
        monthlyBonusRate: 2929,
        registeredBy: 'श्रीमती कान्ता देवी मौर्य',
        status: 'Verified',
        verifiedBy: 'Super Admin',
        verificationDate: '2025-08-16',
      },
    ],
    monthlyBonusAmount: 14645, // 5 * 2929
    totalCurrentMonthlyReturn: 29585, // 14940 + 14645
    isPlotTargetMet: true, // 5/5
    isTenureCompleted: false,
    isPayoutEligible: true,
    isPayoutDisbursed: false,
    bankName: 'HDFC Bank',
    accountNumber: '5010029182381',
    ifscCode: 'HDFC0001234',
    panNumber: 'KLMNO4567J',
    aadharNumber: '6719 2819 4019',
    emiLedger: generateEmiSchedule(120, 12000, '2023-01-01', 38),
    auditLogs: [
      {
        id: 'LOG-004',
        timestamp: '2025-08-16 11:15',
        actor: 'Super Admin',
        action: 'Fast-Track Eligibility Achieved',
        details: 'Achieved 5/5 verified plot sales for 120M plan.',
      },
    ],
    createdAt: '2023-01-01T09:00:00Z',
    updatedAt: '2025-08-16T11:15:00Z',
  },
];

// =============================================================================
// STORAGE KEYS FOR 24.5% SCHEME
// =============================================================================
export const STORAGE_KEYS = {
  PLANS: 'vpm_245_emi_master_plans',
  INVESTORS: 'vpm_245_emi_investors_v1',
  AUDIT_LOGS: 'vpm_245_master_config_audit_logs',
  NOTIFICATIONS: 'vpm_245_scheme_notifications_log',
};

// =============================================================================
// HELPER LOADER & PERSISTENCE
// =============================================================================

export function loadEmiPlansFromStorage(): EmiFreePlotSchemePlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load EMI plans from storage:', e);
  }
  return DEFAULT_EMI_SCHEME_PLANS;
}

export function saveEmiPlansToStorage(plans: EmiFreePlotSchemePlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save EMI plans to storage:', e);
  }
}

export function loadEmiInvestorsFromStorage(): EmiInvestorRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVESTORS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load EMI investors from storage:', e);
  }
  return INITIAL_EMI_INVESTORS;
}

export function saveEmiInvestorsToStorage(investors: EmiInvestorRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVESTORS, JSON.stringify(investors));
  } catch (e) {
    console.error('Failed to save EMI investors to storage:', e);
  }
}

export function loadAuditLogsFromStorage(): EmiMasterConfigAuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load audit logs:', e);
  }
  return [
    {
      id: 'AUD-INIT-01',
      changedBy: 'Super Admin',
      tenureMonths: 12,
      parameterName: 'Initial 24.5% Rate Table Seeded',
      oldValue: 'N/A',
      newValue: '₹1,20,000/mo (ROI 24.5%)',
      timestamp: '2026-01-01 00:00',
      reason: 'Official 24.5% Free Plot Scheme launch initialization',
    },
  ];
}

export function saveAuditLogsToStorage(logs: EmiMasterConfigAuditLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save audit logs:', e);
  }
}

// =============================================================================
// EVALUATE INVESTOR (Recalculates eligibility based strictly on Verified sales)
// =============================================================================

export function evaluateEmiInvestor(
  investor: EmiInvestorRecord,
  plans: EmiFreePlotSchemePlan[] = loadEmiPlansFromStorage()
): EmiInvestorRecord {
  const plan =
    plans.find((p) => p.tenureMonths === investor.tenureMonths) || DEFAULT_EMI_SCHEME_PLANS[0];

  // Count strictly VERIFIED plot sales
  const verifiedPlots = (investor.soldPlotsList || []).filter((p) => p.status === 'Verified');
  const plotsSoldCount = verifiedPlots.length;

  const paidCount = (investor.emiLedger || []).filter((e) => e.status === 'Paid').length;
  const totalPaidAmount = paidCount * investor.monthlyEmi;
  const remainingCount = Math.max(0, investor.tenureMonths - paidCount);
  const remainingAmount = remainingCount * investor.monthlyEmi;

  // Monthly bonus calculation
  const bonusPerPlot = plan.bonusReturnPerPlot || investor.bonusReturnPerPlot;
  const monthlyBonusAmount = plotsSoldCount * bonusPerPlot;
  const baseMonthlyReturn = plan.monthlyReturn || investor.monthlyReturn;
  const totalCurrentMonthlyReturn = baseMonthlyReturn + monthlyBonusAmount;

  // Eligibility rules: 6 plots for 12-72m, 5 plots for 84-120m
  const requiredPlotSales = plan.requiredPlotSales || (investor.tenureMonths <= 72 ? 6 : 5);
  const isPlotTargetMet = plotsSoldCount >= requiredPlotSales;
  const isTenureCompleted = paidCount >= investor.tenureMonths;
  const isPayoutEligible = isPlotTargetMet || isTenureCompleted;

  let status = investor.status;
  if (investor.isPayoutDisbursed) {
    status = 'Disbursed';
  } else if (isPayoutEligible) {
    status = 'Eligible';
  } else {
    status = 'Active';
  }

  // Find next unpaid installment
  const nextUnpaid = (investor.emiLedger || []).find((e) => e.status !== 'Paid');

  return {
    ...investor,
    monthlyEmi: plan.monthlyInstallment || investor.monthlyEmi,
    monthlyReturn: baseMonthlyReturn,
    bonusReturnPerPlot: bonusPerPlot,
    requiredPlotSales,
    interestRatePercent: plan.interestRatePercent || 24.5,
    totalInvestment: plan.totalTenureInvestment || investor.monthlyEmi * investor.tenureMonths,
    totalExpectedReturn: plan.totalTenureReturn || baseMonthlyReturn * investor.tenureMonths,
    paidInstallmentsCount: paidCount,
    totalPaidAmount,
    remainingInstallmentsCount: remainingCount,
    remainingAmount,
    nextEmiDueDate: nextUnpaid ? nextUnpaid.dueDate : 'All Paid',
    plotsSoldCount,
    monthlyBonusAmount,
    totalCurrentMonthlyReturn,
    isPlotTargetMet,
    isTenureCompleted,
    isPayoutEligible,
    status,
    updatedAt: new Date().toISOString(),
  };
}

// =============================================================================
// SCHEME ANALYTICS CALCULATOR
// =============================================================================

export function calculateEmiSchemeAnalytics(investors: EmiInvestorRecord[]): EmiSchemeAnalytics {
  const totalInvestors = investors.length;
  const activeInvestors = investors.filter((i) => i.status === 'Active').length;
  const eligibleInvestors = investors.filter((i) => i.status === 'Eligible').length;
  const completedInvestors = investors.filter((i) => i.status === 'Disbursed' || i.status === 'Completed').length;

  const totalInvestmentAmount = investors.reduce((sum, i) => sum + (i.totalInvestment || 0), 0);
  const totalEmiCollection = investors.reduce((sum, i) => sum + (i.totalPaidAmount || 0), 0);
  const totalOutstandingEmi = investors.reduce((sum, i) => sum + (i.remainingAmount || 0), 0);

  const totalSoldPlots = investors.reduce(
    (sum, i) => sum + (i.soldPlotsList || []).filter((p) => p.status === 'Verified').length,
    0
  );

  const monthlyCashflow = investors
    .filter((i) => i.status === 'Active' || i.status === 'Eligible')
    .reduce((sum, i) => sum + (i.monthlyEmi || 0), 0);

  const yearlyCashflow = monthlyCashflow * 12;

  const totalExpectedLiability = investors.reduce((sum, i) => sum + (i.totalExpectedReturn || 0), 0);
  const totalPayoutAmount = investors.filter((i) => i.isPayoutDisbursed).reduce((sum, i) => sum + (i.totalExpectedReturn || 0), 0);

  return {
    totalInvestors,
    activeInvestors,
    eligibleInvestors,
    completedInvestors,
    totalInvestmentAmount,
    totalEmiCollection,
    totalOutstandingEmi,
    totalSoldPlots,
    monthlyCashflow,
    yearlyCashflow,
    totalExpectedLiability,
    totalPayoutAmount,
  };
}

// =============================================================================
// MULTI-CHANNEL NOTIFICATION SYSTEM (SMS, WhatsApp, Email, In-App)
// =============================================================================

export interface SchemeNotificationPayload {
  investorId: string;
  investorName: string;
  phone: string;
  email: string;
  type:
    | 'registration_success'
    | 'emi_received'
    | 'emi_due_reminder'
    | 'plot_sold'
    | 'plot_verified'
    | 'plot_rejected'
    | 'eligibility_achieved'
    | 'payout_disbursed';
  title: string;
  message: string;
  channels: ('SMS' | 'WhatsApp' | 'Email' | 'In-App')[];
  timestamp?: string;
}

export function loadNotificationLogs(): SchemeNotificationPayload[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load notifications:', e);
  }
  return [
    {
      investorId: 'INV-245-2026-001',
      investorName: 'सुरेश नारायण चतुर्वेदी',
      phone: '+91 98390 12345',
      email: 'suresh.chaturvedi@example.com',
      type: 'registration_success',
      title: '24.5% फ्री प्लॉट स्कीम में सफल पंजीकरण',
      message: 'प्रिय सुरेश जी, 24.5% फ्री प्लॉट स्कीम (12 माह, किस्त: ₹1,20,000) में आपका स्वागत है। प्लॉट संख्या: PLOT-FPS-201.',
      channels: ['SMS', 'WhatsApp', 'Email', 'In-App'],
      timestamp: '2026-01-10T11:30:00Z',
    },
    {
      investorId: 'INV-245-2026-002',
      investorName: 'मीनाक्षी देवी शुक्ला',
      phone: '+91 97930 56789',
      email: 'meenakshi.shukla@example.com',
      type: 'eligibility_achieved',
      title: 'बधाई! 6 प्लॉट बिक्री लक्ष्य पूर्ण – पात्रता स्वीकृत',
      message: 'आपने 6 सत्यापित प्लॉट बिक्री का लक्ष्य पूरा कर लिया है। आपका पूर्ण परिपक्वता प्रतिफल भुगतान के लिए स्वीकृत हो गया है।',
      channels: ['SMS', 'WhatsApp', 'Email', 'In-App'],
      timestamp: '2026-04-02T16:45:00Z',
    },
  ];
}

export function sendSchemeNotification(payload: SchemeNotificationPayload): void {
  const existing = loadNotificationLogs();
  const entry: SchemeNotificationPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
  };
  const updated = [entry, ...existing].slice(0, 100);
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save notification:', e);
  }
}
