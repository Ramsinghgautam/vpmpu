import { formatINR } from '../utils/calculators';

export interface FinancialYearRecord {
  id: string; // 'FY2025-26'
  label: string; // 'FY 2025-26 (AY 2026-27)'
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  openingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  taxableIncome: number;
  corporateTaxRatePct: number;
  grossTaxLiability: number;
  advanceTaxPaid: number;
  tdsCollected: number;
  tdsPaid: number;
  netTaxDue: number;
  closingBalance: number;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Filed';
  filedDate?: string;
  ackNumber?: string;
}

export interface CompanyTaxProfile {
  companyName: string;
  cinNumber: string;
  panNumber: string;
  tanNumber: string;
  gstin: string;
  registeredAddress: string;
  authorizedSignatoryName: string;
  authorizedSignatoryDesignation: string;
  dinNumber: string;
  corporateEmail: string;
}

export interface StakeholderTaxRecord {
  id: string;
  name: string;
  stakeholderType: 'Employee' | 'Agent' | 'Investor' | 'Risk-Free Investor';
  panNumber: string;
  aadhaarNumber: string;
  mobileNumber: string;
  email: string;
  address: string;
  financialYear: string;
  grossIncomeEarned: number;
  salaryOrHonorariumEarned: number;
  commissionsEarned: number;
  investorReturnsEarned: number;
  tdsRatePct: number;
  tdsDeducted: number;
  netAmountPaid: number;
  formType: 'Form 16' | 'Form 16A' | 'Form 26AS';
}

export interface RevenueSourceCategory {
  category: string;
  amount: number;
  taxablePercentage: number;
  notes: string;
}

export interface ExpenseSourceCategory {
  category: string;
  amount: number;
  allowableDeduction: boolean;
  notes: string;
}

export interface BalanceSheetSummary {
  shareCapital: number;
  reservesAndSurplus: number;
  securedLoans: number;
  unsecuredLoans: number;
  currentLiabilities: number;
  totalLiabilities: number;
  fixedAssets: number;
  plotInventoryValue: number;
  cashAndBankBalances: number;
  tradeReceivables: number;
  loansAndAdvances: number;
  totalAssets: number;
}

export interface CashFlowSummary {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
}

export interface ItrHistoryRecord {
  reportId: string;
  financialYear: string;
  assessmentYear: string;
  generatedDate: string;
  generatedBy: string;
  grossRevenue: number;
  netProfit: number;
  taxLiability: number;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Filed';
  version: string;
  ackNumber?: string;
  ipAddress: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  date: string;
  time: string;
  ipAddress: string;
  remarks: string;
}

export const INITIAL_COMPANY_PROFILE: CompanyTaxProfile = {
  companyName: 'Greenfield Realty & Fintech Private Limited',
  cinNumber: 'U70109DL2021PTC384910',
  panNumber: 'AAACG1234F',
  tanNumber: 'DELG12345E',
  gstin: '07AAACG1234F1Z8',
  registeredAddress: 'Corporate Tower 4, Greenfield Park Estate, Outer Ring Road, New Delhi - 110001',
  authorizedSignatoryName: 'Rajesh Kumar Gautam',
  authorizedSignatoryDesignation: 'Managing Director & CEO',
  dinNumber: '08945120',
  corporateEmail: 'tax.compliance@greenfieldrealty.in'
};

export const INITIAL_FINANCIAL_YEARS: FinancialYearRecord[] = [
  {
    id: 'FY2025-26',
    label: 'FY 2025-26 (AY 2026-27)',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    isCurrent: true,
    openingBalance: 42500000,
    totalIncome: 185420000,
    totalExpenses: 124850000,
    netProfit: 60570000,
    taxableIncome: 58200000,
    corporateTaxRatePct: 25.0, // 25% + 4% cess = 26%
    grossTaxLiability: 15132000,
    advanceTaxPaid: 10500000,
    tdsCollected: 3250000,
    tdsPaid: 1850000,
    netTaxDue: 1382000,
    closingBalance: 87938000,
    status: 'Under Review',
    ackNumber: 'ITR6-202526-PENDING'
  },
  {
    id: 'FY2024-25',
    label: 'FY 2024-25 (AY 2025-26)',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    isCurrent: false,
    openingBalance: 28000000,
    totalIncome: 142000000,
    totalExpenses: 98000000,
    netProfit: 44000000,
    taxableIncome: 42500000,
    corporateTaxRatePct: 25.0,
    grossTaxLiability: 11050000,
    advanceTaxPaid: 8000000,
    tdsCollected: 2500000,
    tdsPaid: 1200000,
    netTaxDue: 0,
    closingBalance: 60950000,
    status: 'Filed',
    filedDate: '2025-10-28',
    ackNumber: 'ITR6-849201948201'
  },
  {
    id: 'FY2026-27',
    label: 'FY 2026-27 (AY 2027-28)',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    isCurrent: false,
    openingBalance: 87938000,
    totalIncome: 210000000,
    totalExpenses: 135000000,
    netProfit: 75000000,
    taxableIncome: 72000000,
    corporateTaxRatePct: 25.0,
    grossTaxLiability: 18720000,
    advanceTaxPaid: 12000000,
    tdsCollected: 4000000,
    tdsPaid: 2100000,
    netTaxDue: 2620000,
    closingBalance: 141618000,
    status: 'Draft',
    ackNumber: 'PROJECTION-202627'
  }
];

export const INITIAL_REVENUE_BREAKDOWN: RevenueSourceCategory[] = [
  { category: 'Plot Sales (Outright)', amount: 112500000, taxablePercentage: 100, notes: 'Direct Customer Land Acquisition' },
  { category: 'Booking Charges (Token)', amount: 18500000, taxablePercentage: 100, notes: 'Non-refundable plot booking tokens' },
  { category: 'Registration & Stamp Duty Fees', amount: 12400000, taxablePercentage: 100, notes: 'Government conveyance facilitation' },
  { category: 'EMI Collections (Interest & Principal)', amount: 24800000, taxablePercentage: 100, notes: 'Monthly installment collection' },
  { category: 'Product & Site Development Charges', amount: 8200000, taxablePercentage: 100, notes: 'Infrastructure & boundary wall charges' },
  { category: 'Service & Maintenance Charges', amount: 3500000, taxablePercentage: 100, notes: 'Township security & maintenance' },
  { category: 'Membership & Agent Franchise Fees', amount: 2800000, taxablePercentage: 100, notes: 'Career agent joining fee' },
  { category: 'Training & Seminar Fees', amount: 1200000, taxablePercentage: 100, notes: 'Real estate advisory certification' },
  { category: 'Investment Income', amount: 9500000, taxablePercentage: 100, notes: 'Commercial project appreciation' },
  { category: 'Other Financial Income', amount: 1100000, taxablePercentage: 100, notes: 'Bank interest & delayed payment charges' }
];

export const INITIAL_EXPENSE_BREAKDOWN: ExpenseSourceCategory[] = [
  { category: 'Employee Honorarium & Base Salary', amount: 32400000, allowableDeduction: true, notes: '24 Staff Engineers, Surveyors & Officers' },
  { category: 'Agent Commission Payouts (Direct & MLM)', amount: 48600000, allowableDeduction: true, notes: '32% Direct + 9-Level MLM Commission' },
  { category: 'Investor ROI & Risk-Free Returns', amount: 18200000, allowableDeduction: true, notes: '15.5% Annual Interest + Settlement' },
  { category: 'Marketing & Digital Advertising', amount: 9800000, allowableDeduction: true, notes: 'Meta Ads, Google Ads, Hoardings' },
  { category: 'Office Rent & Utilities', amount: 4500000, allowableDeduction: true, notes: 'Corporate HQ & Regional Offices' },
  { category: 'Administrative & Traveling Expenses', amount: 3800000, allowableDeduction: true, notes: 'Site visits & surveyor logistics' },
  { category: 'Software & Cloud Infrastructure', amount: 2200000, allowableDeduction: true, notes: 'AI Studio, Hostinger MySQL, AWS' },
  { category: 'Legal & RERA Audit Fees', amount: 1800000, allowableDeduction: true, notes: 'Advocate retainers & RERA filings' },
  { category: 'Site Maintenance & Civil Works', amount: 2800000, allowableDeduction: true, notes: 'Roads, drainage, electrification' },
  { category: 'Miscellaneous Operating Outflows', amount: 750000, allowableDeduction: true, notes: 'Stationery, office supplies, tea' }
];

export const INITIAL_STAKEHOLDER_TAX_RECORDS: StakeholderTaxRecord[] = [
  {
    id: 'EMP-1001',
    name: 'Amit Vikram Sharma',
    stakeholderType: 'Employee',
    panNumber: 'ABCPS1234A',
    aadhaarNumber: '849201928401',
    mobileNumber: '+91 98765 43210',
    email: 'amit.sharma@greenfieldrealty.in',
    address: 'Flat 402, Green Park Enclave, New Delhi',
    financialYear: 'FY 2025-26',
    grossIncomeEarned: 1850000,
    salaryOrHonorariumEarned: 1450000,
    commissionsEarned: 400000,
    investorReturnsEarned: 0,
    tdsRatePct: 10.0,
    tdsDeducted: 185000,
    netAmountPaid: 1665000,
    formType: 'Form 16'
  },
  {
    id: 'EMP-1002',
    name: 'Priya Mukherjee',
    stakeholderType: 'Employee',
    panNumber: 'BKMPS5678B',
    aadhaarNumber: '739102948102',
    mobileNumber: '+91 98112 34567',
    email: 'priya.m@greenfieldrealty.in',
    address: 'B-12, Vasant Kunj, New Delhi',
    financialYear: 'FY 2025-26',
    grossIncomeEarned: 1420000,
    salaryOrHonorariumEarned: 1200000,
    commissionsEarned: 220000,
    investorReturnsEarned: 0,
    tdsRatePct: 10.0,
    tdsDeducted: 142000,
    netAmountPaid: 1278000,
    formType: 'Form 16'
  },
  {
    id: 'AGT-2001',
    name: 'Rajesh Malhotra',
    stakeholderType: 'Agent',
    panNumber: 'CPRMS9012C',
    aadhaarNumber: '629103948193',
    mobileNumber: '+91 99887 76655',
    email: 'rajesh.agent@gmail.com',
    address: '105, Civil Lines, Gurgaon, Haryana',
    financialYear: 'FY 2025-26',
    grossIncomeEarned: 3240000,
    salaryOrHonorariumEarned: 0,
    commissionsEarned: 3240000,
    investorReturnsEarned: 0,
    tdsRatePct: 5.0, // Section 194H 5%
    tdsDeducted: 162000,
    netAmountPaid: 3078000,
    formType: 'Form 16A'
  },
  {
    id: 'AGT-2002',
    name: 'Sunita Verma',
    stakeholderType: 'Agent',
    panNumber: 'DVXPS3456D',
    aadhaarNumber: '519203948104',
    mobileNumber: '+91 97112 23344',
    email: 'sunita.v@gmail.com',
    address: 'Sector 62, Noida, Uttar Pradesh',
    financialYear: 'FY 2025-26',
    grossIncomeEarned: 2150000,
    salaryOrHonorariumEarned: 0,
    commissionsEarned: 2150000,
    investorReturnsEarned: 0,
    tdsRatePct: 5.0,
    tdsDeducted: 107500,
    netAmountPaid: 2042500,
    formType: 'Form 16A'
  },
  {
    id: 'INV-3001',
    name: 'Dr. Suresh Chandra Gautam',
    stakeholderType: 'Risk-Free Investor',
    panNumber: 'EKRPS7890E',
    aadhaarNumber: '409102938405',
    mobileNumber: '+91 94120 12345',
    email: 'sc.gautam@aiims.edu',
    address: 'A-4, Green Park Main, New Delhi',
    financialYear: 'FY 2025-26',
    grossIncomeEarned: 2476800, // 32% Commission ₹6,19,200 x 4 + 15.5% Interest
    salaryOrHonorariumEarned: 0,
    commissionsEarned: 2476800,
    investorReturnsEarned: 299925,
    tdsRatePct: 10.0,
    tdsDeducted: 247680,
    netAmountPaid: 2229120,
    formType: 'Form 26AS'
  },
  {
    id: 'INV-3002',
    name: 'Vikramaditya Rao',
    stakeholderType: 'Investor',
    panNumber: 'FLRPS2345F',
    aadhaarNumber: '399102938406',
    mobileNumber: '+91 98230 45678',
    email: 'vikram.rao@investors.in',
    address: 'Jubilee Hills, Hyderabad, Telangana',
    financialYear: 'FY 2025-26',
    grossIncomeEarned: 1850000,
    salaryOrHonorariumEarned: 0,
    commissionsEarned: 0,
    investorReturnsEarned: 1850000,
    tdsRatePct: 10.0,
    tdsDeducted: 185000,
    netAmountPaid: 1665000,
    formType: 'Form 26AS'
  }
];

export const INITIAL_BALANCE_SHEET: BalanceSheetSummary = {
  shareCapital: 20000000,
  reservesAndSurplus: 115400000,
  securedLoans: 35000000,
  unsecuredLoans: 28000000,
  currentLiabilities: 18200000,
  totalLiabilities: 216600000,

  fixedAssets: 48500000,
  plotInventoryValue: 105200000,
  cashAndBankBalances: 42500000,
  tradeReceivables: 12400000,
  loansAndAdvances: 8000000,
  totalAssets: 216600000
};

export const INITIAL_CASH_FLOW: CashFlowSummary = {
  operatingCashFlow: 48200000,
  investingCashFlow: -15400000,
  financingCashFlow: -12500000,
  netCashFlow: 20300000
};

export const INITIAL_ITR_HISTORY: ItrHistoryRecord[] = [
  {
    reportId: 'ITR-202526-V1',
    financialYear: 'FY 2025-26',
    assessmentYear: 'AY 2026-27',
    generatedDate: '2026-08-10 18:45:22',
    generatedBy: 'Super Admin (Rajesh Gautam)',
    grossRevenue: 185420000,
    netProfit: 60570000,
    taxLiability: 15132000,
    status: 'Under Review',
    version: '1.2.0',
    ackNumber: 'ITR6-DRAFT-84920',
    ipAddress: '127.0.0.1'
  },
  {
    reportId: 'ITR-202425-FINAL',
    financialYear: 'FY 2024-25',
    assessmentYear: 'AY 2025-26',
    generatedDate: '2025-10-28 14:20:10',
    generatedBy: 'Super Admin (Rajesh Gautam)',
    grossRevenue: 142000000,
    netProfit: 44000000,
    taxLiability: 11050000,
    status: 'Filed',
    version: '1.0.0',
    ackNumber: 'ITR6-849201948201',
    ipAddress: '103.42.12.98'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-9001',
    userId: 'SA-001',
    userName: 'Super Admin (Rajesh Gautam)',
    action: 'Generated Annual ITR Draft Report',
    date: '2026-08-10',
    time: '18:45:22',
    ipAddress: '127.0.0.1',
    remarks: 'Compiled FY 2025-26 plot sales, EMI, salary & commission records for tax filing.'
  },
  {
    id: 'LOG-9002',
    userId: 'FIN-002',
    userName: 'Finance Manager (Anil Mehta)',
    action: 'Updated Advance Tax & TDS Ledger',
    date: '2026-08-08',
    time: '11:20:05',
    ipAddress: '103.42.12.99',
    remarks: 'Reconciled Q1/Q2 TDS deposits on Form 26AS portal.'
  },
  {
    id: 'LOG-9003',
    userId: 'SA-001',
    userName: 'Super Admin (Rajesh Gautam)',
    action: 'Approved Form 16 / 16A Issuance',
    date: '2026-08-05',
    time: '16:10:44',
    ipAddress: '127.0.0.1',
    remarks: 'Approved annual earning statements for 24 staff members and top 50 agents.'
  }
];

/** Mask PAN for Privacy (e.g. ABCDE1234F -> ABCDE****F) */
export function maskPAN(pan: string): string {
  if (!pan || pan.length < 10) return pan;
  return `${pan.substring(0, 5)}****${pan.substring(9)}`;
}

/** Mask Aadhaar for Privacy (e.g. 123456789012 -> XXXX-XXXX-9012) */
export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar || aadhaar.length < 12) return aadhaar;
  const clean = aadhaar.replace(/\D/g, '');
  return `XXXX-XXXX-${clean.substring(clean.length - 4)}`;
}
