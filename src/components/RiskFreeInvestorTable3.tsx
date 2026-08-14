import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Calculator,
  Download,
  Printer,
  Search,
  Filter,
  Plus,
  Eye,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  IndianRupee,
  Lock,
  AlertCircle,
  X,
  Building2,
  Calendar,
  User,
  Percent,
  Check,
  Info,
  DollarSign,
  Trash2
} from 'lucide-react';
import { formatINR } from '../utils/calculators';

// Slab Definition according to official spec
export interface CommissionSlabTable3 {
  slNo: number;
  basePlotValue: number; // ₹1,000
  purchaseRate: number;  // ₹/sqft
  commissionRate: number; // %
  maxEligibleSales: string;
  badgeLabel: string;
}

export const SLABS_TABLE_3: CommissionSlabTable3[] = [
  { slNo: 1, basePlotValue: 1000, purchaseRate: 1050, commissionRate: 16.5, maxEligibleSales: "Up to Investor's Invested Amount", badgeLabel: 'Slab 1 (16.5%)' },
  { slNo: 2, basePlotValue: 1000, purchaseRate: 1120, commissionRate: 17.5, maxEligibleSales: "Up to Investor's Invested Amount", badgeLabel: 'Slab 2 (17.5%)' },
  { slNo: 3, basePlotValue: 1000, purchaseRate: 1210, commissionRate: 19.0, maxEligibleSales: "Up to Investor's Invested Amount", badgeLabel: 'Slab 3 (19.0%)' },
  { slNo: 4, basePlotValue: 1000, purchaseRate: 1320, commissionRate: 20.5, maxEligibleSales: "Up to Investor's Invested Amount", badgeLabel: 'Slab 4 (20.5%)' },
  { slNo: 5, basePlotValue: 1000, purchaseRate: 1450, commissionRate: 22.5, maxEligibleSales: "Up to Investor's Invested Amount", badgeLabel: 'Slab 5 (22.5%)' },
  { slNo: 6, basePlotValue: 1000, purchaseRate: 1600, commissionRate: 24.5, maxEligibleSales: "Up to Investor's Invested Amount", badgeLabel: 'Slab 6 (24.5%)' },
  { slNo: 7, basePlotValue: 1000, purchaseRate: 1770, commissionRate: 27.0, maxEligibleSales: "Up to Investor's Invested Amount", badgeLabel: 'Slab 7 (27.0%)' },
  { slNo: 8, basePlotValue: 1000, purchaseRate: 1950, commissionRate: 29.5, maxEligibleSales: "Up to Investor's Invested Amount", badgeLabel: 'Slab 8 (29.5%)' },
  { slNo: 9, basePlotValue: 1000, purchaseRate: 2150, commissionRate: 32.0, maxEligibleSales: "Up to Investor's Invested Amount", badgeLabel: 'Slab 9 (32.0%)' },
];

export interface AuditTrailLog {
  id: string;
  dateTime: string;
  user: string;
  actionType: 'Record Creation' | 'Sale Recorded' | 'Payment Processed' | 'Status Update';
  amount: number;
  referenceId: string;
  description: string;
}

export interface InvestorTable3Record {
  investorId: string;
  investorName: string;
  phone: string;
  email: string;
  plotId: string;
  plotAreaSqft: number;
  purchaseRateSqft: number;
  commissionRate: number;
  totalInvestmentAmount: number;
  totalSalesCompleted: number;
  eligibleSalesValue: number;
  remainingEligibleSalesValue: number;
  commissionEarned: number;
  commissionPaid: number;
  commissionPending: number;
  status: 'Active' | 'Target Reached' | 'Fully Settled';
  createdAt: string;
  auditLogs: AuditTrailLog[];
}

// Helper to compute calculated fields accurately based on logic formula
export function recalculateInvestorFields(
  record: Omit<
    InvestorTable3Record,
    'totalInvestmentAmount' | 'eligibleSalesValue' | 'remainingEligibleSalesValue' | 'commissionEarned' | 'commissionPending'
  >
): InvestorTable3Record {
  const totalInvestmentAmount = record.plotAreaSqft * record.purchaseRateSqft;
  // Eligible Sales Value = MIN(Total Sales Value, Investment Amount)
  const eligibleSalesValue = Math.min(record.totalSalesCompleted, totalInvestmentAmount);
  // Remaining Eligible Sales Value = Investment Amount - Eligible Sales Value
  const remainingEligibleSalesValue = Math.max(0, totalInvestmentAmount - eligibleSalesValue);
  // Commission Earned = Eligible Sales Value * Commission Rate / 100
  const commissionEarned = Math.round((eligibleSalesValue * record.commissionRate) / 100);
  // Pending Commission = Commission Earned - Commission Paid
  const commissionPending = Math.max(0, commissionEarned - record.commissionPaid);

  let status: 'Active' | 'Target Reached' | 'Fully Settled' = 'Active';
  if (eligibleSalesValue >= totalInvestmentAmount) {
    status = commissionPending <= 0 ? 'Fully Settled' : 'Target Reached';
  }

  return {
    ...record,
    totalInvestmentAmount,
    eligibleSalesValue,
    remainingEligibleSalesValue,
    commissionEarned,
    commissionPending,
    status,
  };
}

// Initial Seed Data
const INITIAL_TABLE_3_RECORDS: InvestorTable3Record[] = [
  recalculateInvestorFields({
    investorId: 'RFI-3001',
    investorName: 'Amitabh Verma',
    phone: '9812345670',
    email: 'amitabh.verma@example.com',
    plotId: 'PLT-IMP-901',
    plotAreaSqft: 900,
    purchaseRateSqft: 2150,
    commissionRate: 32.0,
    totalSalesCompleted: 1935000,
    commissionPaid: 400000,
    createdAt: '2026-01-15',
    status: 'Target Reached',
    auditLogs: [
      {
        id: 'LOG-101',
        dateTime: '2026-01-15 10:30 AM',
        user: 'Super Admin (System)',
        actionType: 'Record Creation',
        amount: 1935000,
        referenceId: 'REF-INIT-3001',
        description: 'Account initialized with Slab 9 (32.0% Commission) for 900 sq. ft. @ ₹2,150/sq. ft.',
      },
      {
        id: 'LOG-102',
        dateTime: '2026-02-10 02:15 PM',
        user: 'VPM Accounts Desk',
        actionType: 'Sale Recorded',
        amount: 1935000,
        referenceId: 'SALE-PLT-C104',
        description: 'Plot sale recorded ₹19,35,000. Reached max eligible investment amount.',
      },
      {
        id: 'LOG-103',
        dateTime: '2026-02-15 04:00 PM',
        user: 'Finance Manager',
        actionType: 'Payment Processed',
        amount: 400000,
        referenceId: 'TXN-BANK-88219',
        description: 'Interim commission payout of ₹4,00,000 processed via NEFT.',
      },
    ],
  }),
  recalculateInvestorFields({
    investorId: 'RFI-3002',
    investorName: 'Dr. S. K. Rastogi',
    phone: '9822223345',
    email: 'dr.rastogi@example.com',
    plotId: 'PLT-PLT-102',
    plotAreaSqft: 1200,
    purchaseRateSqft: 1450,
    commissionRate: 22.5,
    totalSalesCompleted: 1000000,
    commissionPaid: 150000,
    createdAt: '2026-02-01',
    status: 'Active',
    auditLogs: [
      {
        id: 'LOG-201',
        dateTime: '2026-02-01 11:00 AM',
        user: 'Super Admin',
        actionType: 'Record Creation',
        amount: 1740000,
        referenceId: 'REF-INIT-3002',
        description: 'Account created with Slab 5 (22.5%) for 1,200 sq. ft. @ ₹1,450/sq. ft.',
      },
      {
        id: 'LOG-202',
        dateTime: '2026-02-20 01:45 PM',
        user: 'Sales Desk',
        actionType: 'Sale Recorded',
        amount: 1000000,
        referenceId: 'SALE-PLT-A201',
        description: 'Plot sale of ₹10,00,000 credited to eligible sales value.',
      },
      {
        id: 'LOG-203',
        dateTime: '2026-02-25 03:20 PM',
        user: 'Accounts Exec',
        actionType: 'Payment Processed',
        amount: 150000,
        referenceId: 'TXN-UPI-99201',
        description: 'Partial commission payment of ₹1,50,000 disbursed.',
      },
    ],
  }),
  recalculateInvestorFields({
    investorId: 'RFI-3003',
    investorName: 'Rameshwar Tripathi',
    phone: '9812345671',
    email: 'rtripathi@example.com',
    plotId: 'PLT-ROY-505',
    plotAreaSqft: 1500,
    purchaseRateSqft: 1950,
    commissionRate: 29.5,
    totalSalesCompleted: 2925000,
    commissionPaid: 862875,
    createdAt: '2026-01-05',
    status: 'Fully Settled',
    auditLogs: [
      {
        id: 'LOG-301',
        dateTime: '2026-01-05 09:15 AM',
        user: 'Super Admin',
        actionType: 'Record Creation',
        amount: 2925000,
        referenceId: 'REF-INIT-3003',
        description: 'Account created with Slab 8 (29.5%) for 1,500 sq. ft. @ ₹1,950/sq. ft.',
      },
      {
        id: 'LOG-302',
        dateTime: '2026-01-28 05:00 PM',
        user: 'Accounts Lead',
        actionType: 'Sale Recorded',
        amount: 2925000,
        referenceId: 'SALE-PLT-B101',
        description: 'Full sales credit of ₹29,25,000 recorded.',
      },
      {
        id: 'LOG-303',
        dateTime: '2026-02-05 11:30 AM',
        user: 'Chief Accountant',
        actionType: 'Payment Processed',
        amount: 862875,
        referenceId: 'TXN-RTGS-55102',
        description: 'Final commission settlement ₹8,62,875 completed.',
      },
    ],
  }),
  recalculateInvestorFields({
    investorId: 'RFI-3004',
    investorName: 'Gaurav Dubey',
    phone: '9822223344',
    email: 'gaurav.dubey@example.com',
    plotId: 'PLT-GLD-204',
    plotAreaSqft: 900,
    purchaseRateSqft: 1320,
    commissionRate: 20.5,
    totalSalesCompleted: 600000,
    commissionPaid: 50000,
    createdAt: '2026-02-12',
    status: 'Active',
    auditLogs: [
      {
        id: 'LOG-401',
        dateTime: '2026-02-12 02:00 PM',
        user: 'Super Admin',
        actionType: 'Record Creation',
        amount: 1188000,
        referenceId: 'REF-INIT-3004',
        description: 'Account initialized with Slab 4 (20.5%) for 900 sq. ft. @ ₹1,320/sq. ft.',
      },
    ],
  }),
  recalculateInvestorFields({
    investorId: 'RFI-3005',
    investorName: 'Mrs. Sunita Saxena',
    phone: '9833334455',
    email: 'sunita.saxena@example.com',
    plotId: 'PLT-CRN-708',
    plotAreaSqft: 1000,
    purchaseRateSqft: 1770,
    commissionRate: 27.0,
    totalSalesCompleted: 1200000,
    commissionPaid: 200000,
    createdAt: '2026-02-18',
    status: 'Active',
    auditLogs: [
      {
        id: 'LOG-501',
        dateTime: '2026-02-18 04:30 PM',
        user: 'Super Admin',
        actionType: 'Record Creation',
        amount: 1770000,
        referenceId: 'REF-INIT-3005',
        description: 'Account created with Slab 7 (27.0%) for 1,000 sq. ft. @ ₹1,770/sq. ft.',
      },
    ],
  }),
];

export const RiskFreeInvestorTable3: React.FC = () => {
  // Main Records State
  const [records, setRecords] = useState<InvestorTable3Record[]>(INITIAL_TABLE_3_RECORDS);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [slabFilter, setSlabFilter] = useState<string>('ALL');

  // Active Highlighted Slab for Table 1 reference
  const [selectedSlabNo, setSelectedSlabNo] = useState<number>(9);

  // Example Calculator State
  const [exampleArea, setExampleArea] = useState<number>(900);
  const [exampleRate, setExampleRate] = useState<number>(2150);
  const [exampleSales, setExampleSales] = useState<number>(1935000);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecordSaleModal, setShowRecordSaleModal] = useState<InvestorTable3Record | null>(null);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState<InvestorTable3Record | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<InvestorTable3Record | null>(null);
  const [showStatementModal, setShowStatementModal] = useState<InvestorTable3Record | null>(null);
  const [investorToDelete, setInvestorToDelete] = useState<InvestorTable3Record | null>(null);

  // New Investor Form State
  const [newInvestorName, setNewInvestorName] = useState('');
  const [newInvestorPhone, setNewInvestorPhone] = useState('');
  const [newInvestorEmail, setNewInvestorEmail] = useState('');
  const [newPlotId, setNewPlotId] = useState('PLT-C' + Math.floor(100 + Math.random() * 900));
  const [newPlotArea, setNewPlotArea] = useState<number>(900);
  const [selectedPurchaseRate, setSelectedPurchaseRate] = useState<number>(2150);

  // New Sale Form State
  const [saleAmountInput, setSaleAmountInput] = useState<number>(500000);
  const [saleRefIdInput, setSaleRefIdInput] = useState('SALE-' + Math.floor(1000 + Math.random() * 9000));

  // New Payment Form State
  const [payAmountInput, setPayAmountInput] = useState<number>(100000);
  const [payRefIdInput, setPayRefIdInput] = useState('TXN-BANK-' + Math.floor(10000 + Math.random() * 90000));

  // Find slab metadata by rate
  const currentExampleSlab = SLABS_TABLE_3.find(s => s.purchaseRate === exampleRate) || SLABS_TABLE_3[8];

  // Calculated values for example card
  const exampleInvestment = exampleArea * exampleRate;
  const exampleEligibleSales = Math.min(exampleSales, exampleInvestment);
  const exampleCommissionEarned = Math.round((exampleEligibleSales * currentExampleSlab.commissionRate) / 100);
  const exampleRemainingEligible = Math.max(0, exampleInvestment - exampleEligibleSales);

  // Aggregate KPI metrics across all records
  const totalInvestmentSum = records.reduce((acc, r) => acc + r.totalInvestmentAmount, 0);
  const totalEligibleSalesSum = records.reduce((acc, r) => acc + r.eligibleSalesValue, 0);
  const totalCommissionEarnedSum = records.reduce((acc, r) => acc + r.commissionEarned, 0);
  const totalCommissionPaidSum = records.reduce((acc, r) => acc + r.commissionPaid, 0);
  const totalCommissionPendingSum = records.reduce((acc, r) => acc + r.commissionPending, 0);

  // Filtering records
  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.investorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.investorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.plotId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSlab = slabFilter === 'ALL' || r.purchaseRateSqft === Number(slabFilter);

    return matchesSearch && matchesStatus && matchesSlab;
  });

  // Handle Adding New Investor
  const handleAddInvestorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slabObj = SLABS_TABLE_3.find(s => s.purchaseRate === selectedPurchaseRate) || SLABS_TABLE_3[0];
    const newId = `RFI-${Math.floor(3000 + Math.random() * 900)}`;

    const raw: Omit<InvestorTable3Record, 'totalInvestmentAmount' | 'eligibleSalesValue' | 'remainingEligibleSalesValue' | 'commissionEarned' | 'commissionPending'> = {
      investorId: newId,
      investorName: newInvestorName || 'Valued Investor',
      phone: newInvestorPhone || '9999999999',
      email: newInvestorEmail || 'investor@example.com',
      plotId: newPlotId,
      plotAreaSqft: newPlotArea,
      purchaseRateSqft: slabObj.purchaseRate,
      commissionRate: slabObj.commissionRate,
      totalSalesCompleted: 0,
      commissionPaid: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Active',
      auditLogs: [
        {
          id: `LOG-${Date.now()}`,
          dateTime: new Date().toLocaleString(),
          user: 'Super Admin',
          actionType: 'Record Creation',
          amount: newPlotArea * slabObj.purchaseRate,
          referenceId: `REF-ADD-${newId}`,
          description: `Created account with Slab ${slabObj.slNo} (${slabObj.commissionRate}%) for ${newPlotArea} sq ft @ ₹${slabObj.purchaseRate}/sq ft`,
        },
      ],
    };

    const newRecord = recalculateInvestorFields(raw);
    setRecords([newRecord, ...records]);
    setShowAddModal(false);

    // Reset Form
    setNewInvestorName('');
    setNewInvestorPhone('');
    setNewInvestorEmail('');
  };

  // Handle Recording Plot Sale
  const handleRecordSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRecordSaleModal || saleAmountInput <= 0) return;

    const target = showRecordSaleModal;
    const newTotalSales = target.totalSalesCompleted + Number(saleAmountInput);

    const newLog: AuditTrailLog = {
      id: `LOG-${Date.now()}`,
      dateTime: new Date().toLocaleString(),
      user: 'Super Admin / Accounts',
      actionType: 'Sale Recorded',
      amount: Number(saleAmountInput),
      referenceId: saleRefIdInput,
      description: `Plot sale worth ₹${formatINR(saleAmountInput)} recorded under Ref: ${saleRefIdInput}`,
    };

    const updatedRaw: Omit<InvestorTable3Record, 'totalInvestmentAmount' | 'eligibleSalesValue' | 'remainingEligibleSalesValue' | 'commissionEarned' | 'commissionPending'> = {
      ...target,
      totalSalesCompleted: newTotalSales,
      auditLogs: [newLog, ...target.auditLogs],
    };

    const updatedRecord = recalculateInvestorFields(updatedRaw);

    setRecords(prev => prev.map(r => r.investorId === target.investorId ? updatedRecord : r));
    setShowRecordSaleModal(null);
    setSaleAmountInput(500000);
  };

  // Handle Recording Payment
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRecordPaymentModal || payAmountInput <= 0) return;

    const target = showRecordPaymentModal;
    const newPaid = target.commissionPaid + Number(payAmountInput);

    const newLog: AuditTrailLog = {
      id: `LOG-${Date.now()}`,
      dateTime: new Date().toLocaleString(),
      user: 'Finance Officer',
      actionType: 'Payment Processed',
      amount: Number(payAmountInput),
      referenceId: payRefIdInput,
      description: `Commission payout of ₹${formatINR(payAmountInput)} processed under Ref: ${payRefIdInput}`,
    };

    const updatedRaw: Omit<InvestorTable3Record, 'totalInvestmentAmount' | 'eligibleSalesValue' | 'remainingEligibleSalesValue' | 'commissionEarned' | 'commissionPending'> = {
      ...target,
      commissionPaid: newPaid,
      auditLogs: [newLog, ...target.auditLogs],
    };

    const updatedRecord = recalculateInvestorFields(updatedRaw);

    setRecords(prev => prev.map(r => r.investorId === target.investorId ? updatedRecord : r));
    setShowRecordPaymentModal(null);
    setPayAmountInput(100000);
  };

  // Handle Deleting Investor
  const handleConfirmDeleteInvestor = () => {
    if (!investorToDelete) return;
    setRecords(prev => prev.filter(r => r.investorId !== investorToDelete.investorId));
    setInvestorToDelete(null);
  };

  // CSV Export Helper
  const exportToCSV = () => {
    const headers = [
      'Investor ID',
      'Investor Name',
      'Plot ID',
      'Area (Sq Ft)',
      'Purchase Rate (₹/sqft)',
      'Investment Amount (₹)',
      'Commission Rate (%)',
      'Total Sales Completed (₹)',
      'Eligible Sales Value (₹)',
      'Remaining Eligible Sales (₹)',
      'Commission Earned (₹)',
      'Commission Paid (₹)',
      'Commission Pending (₹)',
      'Status',
    ];

    const rows = filteredRecords.map(r => [
      r.investorId,
      `"${r.investorName}"`,
      r.plotId,
      r.plotAreaSqft,
      r.purchaseRateSqft,
      r.totalInvestmentAmount,
      `${r.commissionRate}%`,
      r.totalSalesCompleted,
      r.eligibleSalesValue,
      r.remainingEligibleSalesValue,
      r.commissionEarned,
      r.commissionPaid,
      r.commissionPending,
      r.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Risk_Free_Investor_Commission_Table3_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-10 my-10 font-sans text-slate-900" id="risk-free-investor-table-3-container">
      
      {/* ------------------ MAIN HEADER & TITLE ------------------ */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-10 -translate-y-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Official Real Estate Investment Matrix
            </div>
            <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
              VPM / RFI / TABLE-03 / 2026
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-white tracking-tight">
              Free Plot Scheme Commission Table – 3
            </h2>
            <p className="text-sm text-slate-300 mt-1.5 max-w-3xl font-medium leading-relaxed">
              Guaranteed high-yield investment return mechanism for clear-title residential plot investors in Prayagraj.
            </p>
          </div>

          {/* Important Commission Rule Banner */}
          <div className="bg-indigo-900/80 border-2 border-amber-400/60 rounded-2xl p-4 sm:p-5 text-xs text-slate-100 space-y-2 shadow-inner">
            <div className="flex items-center gap-2 text-amber-300 font-extrabold uppercase tracking-wider text-xs">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Important Commission Rule & Operational Ceiling</span>
            </div>
            <p className="text-slate-200 leading-relaxed font-normal">
              For each investment slab, when a <strong>Free Plot Scheme Investor</strong> purchases a plot at the specified <strong>Purchase Rate per Sq. Ft.</strong>, the investor will be eligible to receive the specified commission percentage on the value of plots sold by the investor, <strong>up to the total amount of their invested plot amount</strong>.
            </p>
            <p className="text-amber-200/90 font-semibold italic border-t border-indigo-800/80 pt-2 text-[11px]">
              * Mandatory Constraint: The commission should be calculated ONLY until the investor has sold plots whose total eligible sales value reaches the investor's original invested amount.
            </p>
          </div>
        </div>
      </div>

      {/* ------------------ 9-SLAB COMMISSION REFERENCE TABLE & EXAMPLE SIMULATOR ------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: 9-Slab Official Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif font-bold text-indigo-950 text-base flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-600" />
                Slab Matrix (9 Official Purchase Rates)
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold">
                Base Plot Value: <strong className="text-slate-900">₹1,000 / Sq. Ft.</strong>
              </p>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-900 font-black px-2.5 py-1 rounded-full border border-indigo-200">
              SLABS 1 TO 9
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="p-2.5 text-center">Sl. No.</th>
                  <th className="p-2.5">Base Rate</th>
                  <th className="p-2.5">Purchase Rate</th>
                  <th className="p-2.5 text-center">Commission %</th>
                  <th className="p-2.5 text-right">Maximum Eligible Sales Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {SLABS_TABLE_3.map((s) => {
                  const isSelected = selectedSlabNo === s.slNo;
                  return (
                    <tr
                      key={s.slNo}
                      onClick={() => {
                        setSelectedSlabNo(s.slNo);
                        setExampleRate(s.purchaseRate);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-100/80 font-bold border-l-4 border-l-amber-500' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-2.5 text-center font-mono font-bold text-slate-600">{s.slNo}</td>
                      <td className="p-2.5 font-mono text-slate-600">₹{formatINR(s.basePlotValue)}</td>
                      <td className="p-2.5 font-mono font-bold text-indigo-950">
                        ₹{formatINR(s.purchaseRate)} <span className="text-[10px] font-normal text-slate-500">/ sq.ft.</span>
                      </td>
                      <td className="p-2.5 text-center font-mono font-extrabold text-amber-600 text-sm">
                        {s.commissionRate}%
                      </td>
                      <td className="p-2.5 text-right font-semibold text-slate-600 text-[11px]">
                        {s.maxEligibleSales}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-400 italic text-right">
            * Click any row above to auto-load rate slab into the calculation example simulator.
          </p>
        </div>

        {/* Right: Automatic Calculation Example Card (Required Example Display) */}
        <div className="lg:col-span-5 bg-indigo-950 text-white rounded-2xl p-6 border border-indigo-800 shadow-xl space-y-5">
          <div className="border-b border-indigo-800 pb-3">
            <span className="text-[10px] bg-amber-400/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider border border-amber-400/30">
              Interactive Verified Example
            </span>
            <h3 className="text-lg font-serif font-black text-white mt-1 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              Automatic Calculation Example
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Testing Imperial Slab 9 (900 sq. ft. @ ₹2,150 / sq. ft.)
            </p>
          </div>

          {/* Interactive Input Test */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-indigo-900/60 p-3 rounded-xl border border-indigo-800">
            <div>
              <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">
                Plot Area (Sq. Ft.)
              </label>
              <input
                type="number"
                value={exampleArea}
                onChange={(e) => setExampleArea(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-900 border border-indigo-700 rounded-lg p-2 font-mono text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">
                Rate (₹/Sq. Ft.)
              </label>
              <select
                value={exampleRate}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setExampleRate(val);
                  const matched = SLABS_TABLE_3.find(s => s.purchaseRate === val);
                  if (matched) setSelectedSlabNo(matched.slNo);
                }}
                className="w-full bg-slate-900 border border-indigo-700 rounded-lg p-2 font-mono text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400"
              >
                {SLABS_TABLE_3.map(s => (
                  <option key={s.slNo} value={s.purchaseRate}>
                    ₹{s.purchaseRate} ({s.commissionRate}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Calculation Steps Display */}
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center p-2.5 bg-indigo-900/80 rounded-lg border border-indigo-800">
              <span className="text-slate-300 font-sans">Investment Amount ({exampleArea} × ₹{formatINR(exampleRate)}) =</span>
              <span className="font-extrabold text-amber-300 text-sm">{formatINR(exampleInvestment)}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-indigo-900/80 rounded-lg border border-indigo-800">
              <span className="text-slate-300 font-sans">Applicable Commission Rate =</span>
              <span className="font-extrabold text-emerald-400 text-sm">{currentExampleSlab.commissionRate}%</span>
            </div>

            <div className="p-3 bg-indigo-900 rounded-xl border border-indigo-700 space-y-1.5 font-sans">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-200">Total Plot Sales Achieved =</span>
                <input
                  type="number"
                  step="50000"
                  value={exampleSales}
                  onChange={(e) => setExampleSales(Number(e.target.value))}
                  className="w-32 bg-slate-950 border border-indigo-600 rounded px-2 py-0.5 text-right font-mono text-amber-300 font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Eligible Sales Value = MIN(₹{formatINR(exampleSales)}, ₹{formatINR(exampleInvestment)}) = <strong>{formatINR(exampleEligibleSales)}</strong>
              </p>
            </div>

            <div className="flex justify-between items-center p-3 bg-emerald-950 border border-emerald-600/80 rounded-xl text-emerald-300 font-sans">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">Commission Earned</span>
                <span className="text-[10px] text-slate-300">({formatINR(exampleEligibleSales)} × {currentExampleSlab.commissionRate}%)</span>
              </div>
              <span className="text-2xl font-serif font-black text-emerald-400">
                {formatINR(exampleCommissionEarned)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ------------------ SUMMARY KPI CARDS (Required 5 Cards) ------------------ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Investment */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1 border-t-4 border-t-indigo-900">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Investment</span>
          <p className="text-lg sm:text-xl font-serif font-black text-indigo-950">
            {formatINR(totalInvestmentSum)}
          </p>
          <span className="text-[10px] text-slate-400 block font-medium">Across {records.length} Active Investors</span>
        </div>

        {/* Card 2: Eligible Sales */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1 border-t-4 border-t-sky-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Eligible Sales</span>
          <p className="text-lg sm:text-xl font-serif font-black text-sky-900">
            {formatINR(totalEligibleSalesSum)}
          </p>
          <span className="text-[10px] text-slate-400 block font-medium">Capped at Investment Ceilings</span>
        </div>

        {/* Card 3: Commission Earned */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1 border-t-4 border-t-emerald-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Commission Earned</span>
          <p className="text-lg sm:text-xl font-serif font-black text-emerald-700">
            {formatINR(totalCommissionEarnedSum)}
          </p>
          <span className="text-[10px] text-slate-400 block font-medium">Calculated per Slabs</span>
        </div>

        {/* Card 4: Commission Paid */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1 border-t-4 border-t-amber-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Commission Paid</span>
          <p className="text-lg sm:text-xl font-serif font-black text-amber-800">
            {formatINR(totalCommissionPaidSum)}
          </p>
          <span className="text-[10px] text-slate-400 block font-medium">Disbursed via Banking</span>
        </div>

        {/* Card 5: Commission Pending */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1 border-t-4 border-t-rose-600 col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Commission Pending</span>
          <p className="text-lg sm:text-xl font-serif font-black text-rose-700">
            {formatINR(totalCommissionPendingSum)}
          </p>
          <span className="text-[10px] text-slate-400 block font-medium">Awaiting Settlement</span>
        </div>

      </div>

      {/* ------------------ ADMIN CONTROLS & INVESTOR LEDGER TABLE ------------------ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        
        {/* Table Top Controls Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="font-serif font-bold text-indigo-950 text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-900" />
              Free Plot Scheme Commission Ledger
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Manage accounts, record plot sales, calculate commission ceilings, and issue payouts with audit log.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search investor, ID, plot..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-900 font-medium"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Target Reached">Target Reached</option>
              <option value="Fully Settled">Fully Settled</option>
            </select>

            {/* Slab Rate Filter */}
            <select
              value={slabFilter}
              onChange={(e) => setSlabFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Rate Slabs</option>
              {SLABS_TABLE_3.map(s => (
                <option key={s.slNo} value={s.purchaseRate}>
                  ₹{s.purchaseRate}/sqft ({s.commissionRate}%)
                </option>
              ))}
            </select>

            {/* Export CSV Button */}
            <button
              onClick={exportToCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
              title="Export Table to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
              title="Print Current Table"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>

            {/* Add Investor Button (Admin Feature) */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Free Plot Scheme Investor</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="p-3">Investor Info</th>
                <th className="p-3">Plot & Area</th>
                <th className="p-3 text-right">Slab Rate & %</th>
                <th className="p-3 text-right">Investment Amount</th>
                <th className="p-3 text-right">Eligible Sales / Rem.</th>
                <th className="p-3 text-right">Earned / Paid / Pending</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-slate-400 italic">
                    No free plot scheme investor records match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.investorId} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Investor Info */}
                    <td className="p-3">
                      <div className="font-bold text-indigo-950">{r.investorName}</div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <span>{r.investorId}</span> • <span>{r.phone}</span>
                      </div>
                    </td>

                    {/* Plot ID & Area */}
                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-900">{r.plotId}</div>
                      <div className="text-[10px] text-slate-500">{r.plotAreaSqft} Sq. Ft.</div>
                    </td>

                    {/* Slab Rate & Percentage */}
                    <td className="p-3 text-right font-mono">
                      <div className="font-bold text-indigo-900">₹{formatINR(r.purchaseRateSqft)} / sqft</div>
                      <div className="text-[11px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded inline-block">
                        {r.commissionRate}%
                      </div>
                    </td>

                    {/* Investment Amount */}
                    <td className="p-3 text-right font-mono font-black text-slate-900">
                      ₹{formatINR(r.totalInvestmentAmount)}
                    </td>

                    {/* Eligible Sales Value & Remaining */}
                    <td className="p-3 text-right font-mono">
                      <div className="font-bold text-sky-900">₹{formatINR(r.eligibleSalesValue)}</div>
                      <div className="text-[10px] text-slate-500">
                        Rem: <strong className="text-amber-700">₹{formatINR(r.remainingEligibleSalesValue)}</strong>
                      </div>
                    </td>

                    {/* Commission Earned / Paid / Pending */}
                    <td className="p-3 text-right font-mono">
                      <div className="font-extrabold text-emerald-700">₹{formatINR(r.commissionEarned)}</div>
                      <div className="text-[10px] text-slate-500">
                        Paid: ₹{formatINR(r.commissionPaid)} | <strong className="text-rose-700">Pend: ₹{formatINR(r.commissionPending)}</strong>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          r.status === 'Fully Settled'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : r.status === 'Target Reached'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-sky-100 text-sky-900 border-sky-300'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* View Details */}
                        <button
                          onClick={() => setShowDetailsModal(r)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors border border-slate-200 cursor-pointer"
                          title="View Details & Audit Trail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Statement */}
                        <button
                          onClick={() => setShowStatementModal(r)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-lg text-[10px] font-bold transition-colors border border-indigo-200 cursor-pointer flex items-center gap-1"
                          title="Generate Commission Statement"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-700" />
                        </button>

                        {/* Record Sale */}
                        <button
                          onClick={() => setShowRecordSaleModal(r)}
                          className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-[10px] font-bold transition-colors border border-sky-200 cursor-pointer"
                          title="Record Plot Sale"
                        >
                          + Sale
                        </button>

                        {/* Record Payment */}
                        <button
                          onClick={() => setShowRecordPaymentModal(r)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold transition-colors border border-emerald-200 cursor-pointer"
                          title="Record Commission Payment"
                        >
                          + Pay
                        </button>

                        {/* Delete Investor */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInvestorToDelete(r);
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold transition-colors border border-rose-200 cursor-pointer flex items-center gap-1"
                          title="Delete Investor Record"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD RISK-FREE INVESTOR MODAL                                      */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-serif font-black text-indigo-950 text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Add Free Plot Scheme Investor (Table 3)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInvestorSubmit} className="space-y-3 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">Investor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={newInvestorName}
                  onChange={(e) => setNewInvestorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:border-indigo-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={newInvestorPhone}
                    onChange={(e) => setNewInvestorPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:border-indigo-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="investor@example.com"
                    value={newInvestorEmail}
                    onChange={(e) => setNewInvestorEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:border-indigo-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plot ID</label>
                  <input
                    type="text"
                    required
                    value={newPlotId}
                    onChange={(e) => setNewPlotId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plot Area (Sq. Ft.)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={newPlotArea}
                    onChange={(e) => setNewPlotArea(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-900"
                  />
                </div>
              </div>

              {/* Purchase Rate Slab Dropdown */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Purchase Rate Slab</label>
                <select
                  value={selectedPurchaseRate}
                  onChange={(e) => setSelectedPurchaseRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-900"
                >
                  {SLABS_TABLE_3.map(s => (
                    <option key={s.slNo} value={s.purchaseRate}>
                      Slab {s.slNo}: ₹{s.purchaseRate} / Sq. Ft. → Commission Rate {s.commissionRate}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Automatic Calculations Preview Box */}
              {(() => {
                const activeSlab = SLABS_TABLE_3.find(s => s.purchaseRate === selectedPurchaseRate) || SLABS_TABLE_3[0];
                const calcInv = newPlotArea * activeSlab.purchaseRate;
                return (
                  <div className="bg-indigo-950 text-white p-3.5 rounded-xl space-y-1.5 font-mono">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300">Base Plot Value:</span>
                      <span className="text-amber-300 font-bold">₹1,000 / Sq. Ft.</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300">Assigned Commission Rate:</span>
                      <span className="text-emerald-400 font-extrabold">{activeSlab.commissionRate}%</span>
                    </div>
                    <div className="flex justify-between text-[11px] border-t border-indigo-800 pt-1.5">
                      <span className="text-slate-200 font-sans font-bold">Total Investment Amount:</span>
                      <span className="text-amber-400 font-serif font-black text-sm">₹{formatINR(calcInv)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Investor
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RECORD PLOT SALE MODAL                                            */}
      {/* ========================================================================= */}
      {showRecordSaleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-black text-indigo-950 text-base">Record Plot Sale</h3>
                <p className="text-[11px] text-slate-500 font-mono">{showRecordSaleModal.investorName} ({showRecordSaleModal.investorId})</p>
              </div>
              <button onClick={() => setShowRecordSaleModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSaleSubmit} className="space-y-3 text-xs">
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Investment Amount:</span>
                  <strong className="text-slate-900">₹{formatINR(showRecordSaleModal.totalInvestmentAmount)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Current Eligible Sales:</span>
                  <strong className="text-sky-800">₹{formatINR(showRecordSaleModal.eligibleSalesValue)}</strong>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span>Remaining Eligible Sales Ceiling:</span>
                  <strong className="text-amber-700">₹{formatINR(showRecordSaleModal.remainingEligibleSalesValue)}</strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Plot Sale Amount (₹)</label>
                <input
                  type="number"
                  required
                  step="10000"
                  min="1000"
                  value={saleAmountInput}
                  onChange={(e) => setSaleAmountInput(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-indigo-950 text-sm focus:outline-none focus:border-indigo-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sale Transaction Ref / Plot ID</label>
                <input
                  type="text"
                  required
                  value={saleRefIdInput}
                  onChange={(e) => setSaleRefIdInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-800 focus:outline-none focus:border-indigo-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRecordSaleModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl shadow-xs cursor-pointer"
                >
                  Calculate & Record Sale
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RECORD PAYMENT MODAL                                              */}
      {/* ========================================================================= */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-black text-indigo-950 text-base">Record Commission Payout</h3>
                <p className="text-[11px] text-slate-500 font-mono">{showRecordPaymentModal.investorName} ({showRecordPaymentModal.investorId})</p>
              </div>
              <button onClick={() => setShowRecordPaymentModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3 text-xs">
              
              <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Total Commission Earned:</span>
                  <strong className="text-emerald-800">₹{formatINR(showRecordPaymentModal.commissionEarned)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Already Paid:</span>
                  <strong className="text-amber-800">₹{formatINR(showRecordPaymentModal.commissionPaid)}</strong>
                </div>
                <div className="flex justify-between border-t border-emerald-200 pt-1">
                  <span>Currently Pending Balance:</span>
                  <strong className="text-rose-700 font-black">₹{formatINR(showRecordPaymentModal.commissionPending)}</strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Disbursement Amount (₹)</label>
                <input
                  type="number"
                  required
                  step="5000"
                  min="1000"
                  max={showRecordPaymentModal.commissionPending || 9999999}
                  value={payAmountInput}
                  onChange={(e) => setPayAmountInput(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-emerald-950 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bank Reference / UTR Number</label>
                <input
                  type="text"
                  required
                  value={payRefIdInput}
                  onChange={(e) => setPayRefIdInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRecordPaymentModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs cursor-pointer"
                >
                  Disburse Payment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: INVESTOR DETAILS & AUDIT TRAIL MODAL                               */}
      {/* ========================================================================= */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded">AUDIT TRAIL & LEDGER</span>
                <h3 className="font-serif font-black text-indigo-950 text-lg">{showDetailsModal.investorName}</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {showDetailsModal.investorId} • Phone: {showDetailsModal.phone}</p>
              </div>
              <button onClick={() => setShowDetailsModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">
                <span className="text-[10px] text-slate-500 block">Investment</span>
                <strong className="text-indigo-950">₹{formatINR(showDetailsModal.totalInvestmentAmount)}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">
                <span className="text-[10px] text-slate-500 block">Eligible Sales</span>
                <strong className="text-sky-900">₹{formatINR(showDetailsModal.eligibleSalesValue)}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">
                <span className="text-[10px] text-slate-500 block">Commission ({showDetailsModal.commissionRate}%)</span>
                <strong className="text-emerald-700">₹{formatINR(showDetailsModal.commissionEarned)}</strong>
              </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">
                <span className="text-[10px] text-slate-500 block">Pending Payout</span>
                <strong className="text-rose-700">₹{formatINR(showDetailsModal.commissionPending)}</strong>
              </div>
            </div>

            {/* Audit Log Timeline */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                Immutable Audit Logs ({showDetailsModal.auditLogs.length})
              </h4>

              <div className="space-y-2 font-sans text-xs">
                {showDetailsModal.auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>{log.dateTime} • User: <strong>{log.user}</strong></span>
                      <span className="bg-slate-200 text-slate-800 font-bold px-1.5 py-0.5 rounded">{log.actionType}</span>
                    </div>
                    <p className="text-slate-800 font-medium leading-snug">{log.description}</p>
                    <div className="text-[10px] font-mono text-indigo-900">
                      Ref ID: <strong>{log.referenceId}</strong> | Value: ₹{formatINR(log.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailsModal(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PRINTABLE COMMISSION STATEMENT MODAL                              */}
      {/* ========================================================================= */}
      {showStatementModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl p-8 space-y-6 max-h-[92vh] overflow-y-auto font-sans">
            
            {/* Modal Header Controls */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 print:hidden">
              <span className="text-xs font-bold text-slate-500">Individual Investor Statement Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print Official Statement</span>
                </button>
                <button onClick={() => setShowStatementModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Document Content */}
            <div className="space-y-6 text-slate-900">
              
              {/* Document Letterhead Header */}
              <div className="border-b-2 border-indigo-950 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-serif font-black text-indigo-950 tracking-tight">
                    VIGYA PAURUSH MILESTONE PRIVATE LIMITED
                  </h1>
                  <p className="text-[11px] text-slate-600">
                    Corporate Office: Civil Lines & Jhalwa Desk, Prayagraj, UP
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">CIN: U70109UP2026PTC18201 • Official Statement</p>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="font-extrabold text-amber-600 block">STATEMENT-TABLE-03</span>
                  <span className="text-slate-500 text-[10px]">Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Title Banner */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
                <h2 className="text-sm font-serif font-bold text-indigo-950 uppercase tracking-wider">
                  Free Plot Scheme Commission Statement (Table 3)
                </h2>
              </div>

              {/* Investor Details Block */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Investor Profile</span>
                  <p className="font-extrabold text-indigo-950 text-sm">{showStatementModal.investorName}</p>
                  <p className="font-mono text-slate-600">ID: {showStatementModal.investorId}</p>
                  <p className="text-slate-600">Phone: {showStatementModal.phone}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Investment Plot Details</span>
                  <p className="font-extrabold text-slate-900 text-sm">Plot ID: {showStatementModal.plotId}</p>
                  <p className="font-mono text-slate-600">Plot Area: {showStatementModal.plotAreaSqft} Sq. Ft.</p>
                  <p className="font-mono text-indigo-900 font-bold">Purchase Rate: ₹{formatINR(showStatementModal.purchaseRateSqft)} / Sq. Ft.</p>
                </div>
              </div>

              {/* Calculation Summary Box */}
              <div className="border border-slate-300 rounded-xl p-4 space-y-2.5 font-mono text-xs bg-slate-50">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-600 font-sans">Total Investment Amount:</span>
                  <span className="font-extrabold text-slate-900">₹{formatINR(showStatementModal.totalInvestmentAmount)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-600 font-sans">Assigned Commission Rate Slab:</span>
                  <span className="font-extrabold text-amber-600">{showStatementModal.commissionRate}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-600 font-sans">Eligible Sales Value (MIN(Total Sales, Investment)):</span>
                  <span className="font-extrabold text-sky-900">₹{formatINR(showStatementModal.eligibleSalesValue)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-600 font-sans">Remaining Eligible Sales Ceiling:</span>
                  <span className="font-bold text-amber-700">₹{formatINR(showStatementModal.remainingEligibleSalesValue)}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm bg-emerald-100 p-2 rounded-lg text-emerald-950">
                  <span className="font-sans font-extrabold">Commission Earned:</span>
                  <span className="font-extrabold font-serif">₹{formatINR(showStatementModal.commissionEarned)}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 text-slate-700">
                  <span>Commission Paid: ₹{formatINR(showStatementModal.commissionPaid)}</span>
                  <span className="font-bold text-rose-700">Pending Balance: ₹{formatINR(showStatementModal.commissionPending)}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 border-t border-slate-300 grid grid-cols-2 text-center text-xs text-slate-600">
                <div>
                  <div className="h-10" />
                  <p className="font-bold text-slate-900">{showStatementModal.investorName}</p>
                  <p className="text-[10px]">Investor Signature</p>
                </div>
                <div>
                  <div className="h-10" />
                  <p className="font-bold text-slate-900">Authorized Signatory / Managing Director</p>
                  <p className="text-[10px]">Vigya Paurush Milestone Pvt. Ltd.</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {investorToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-rose-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="font-serif font-black text-slate-900 text-lg">Delete Investor Record</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete investor <strong className="text-slate-900">{investorToDelete.investorName}</strong> (<span className="font-mono text-indigo-900">{investorToDelete.investorId}</span>)? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInvestorToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteInvestor}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
