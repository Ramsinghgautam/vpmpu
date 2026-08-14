import React, { useState, useMemo } from 'react';
import {
  FileText,
  Calculator,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Plus,
  Eye,
  FileSpreadsheet,
  Lock,
  History,
  QrCode,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  UserCheck,
  Award,
  Wallet,
  Building,
  Info
} from 'lucide-react';
import {
  INITIAL_COMPANY_PROFILE,
  INITIAL_FINANCIAL_YEARS,
  INITIAL_REVENUE_BREAKDOWN,
  INITIAL_EXPENSE_BREAKDOWN,
  INITIAL_STAKEHOLDER_TAX_RECORDS,
  INITIAL_BALANCE_SHEET,
  INITIAL_CASH_FLOW,
  INITIAL_ITR_HISTORY,
  INITIAL_AUDIT_LOGS,
  CompanyTaxProfile,
  FinancialYearRecord,
  StakeholderTaxRecord,
  RevenueSourceCategory,
  ExpenseSourceCategory,
  ItrHistoryRecord,
  AuditLogEntry,
  maskPAN,
  maskAadhaar
} from '../../data/itrTaxData';
import { formatINR } from '../../utils/calculators';
import { exportToCSV, exportElementToPDF } from '../../utils/riskFreeSimulationEngine';

interface AdminItrManagerProps {
  isDarkMode?: boolean;
}

export const AdminItrManager: React.FC<AdminItrManagerProps> = ({ isDarkMode = true }) => {
  // Master State
  const [companyProfile, setCompanyProfile] = useState<CompanyTaxProfile>(INITIAL_COMPANY_PROFILE);
  const [financialYears, setFinancialYears] = useState<FinancialYearRecord[]>(INITIAL_FINANCIAL_YEARS);
  const [selectedFyId, setSelectedFyId] = useState<string>('FY2025-26');
  
  const [revenueList, setRevenueList] = useState<RevenueSourceCategory[]>(INITIAL_REVENUE_BREAKDOWN);
  const [expenseList, setExpenseList] = useState<ExpenseSourceCategory[]>(INITIAL_EXPENSE_BREAKDOWN);
  const [stakeholders, setStakeholders] = useState<StakeholderTaxRecord[]>(INITIAL_STAKEHOLDER_TAX_RECORDS);
  const [itrHistory, setItrHistory] = useState<ItrHistoryRecord[]>(INITIAL_ITR_HISTORY);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'fy_manager' | 'revenue_expenses' | 'tax_engine' | 'stakeholders' | 'company_itr' | 'history_audit'>('overview');

  // Filters & Search
  const [stakeholderSearch, setStakeholderSearch] = useState<string>('');
  const [stakeholderTypeFilter, setStakeholderTypeFilter] = useState<string>('ALL');

  // Modals State
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState<boolean>(false);
  const [showAddFyModal, setShowAddFyModal] = useState<boolean>(false);
  const [selectedStakeholderForm, setSelectedStakeholderForm] = useState<StakeholderTaxRecord | null>(null);

  // Status Notification
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Currently Selected Financial Year Object
  const currentFy = useMemo(() => {
    return financialYears.find(fy => fy.id === selectedFyId) || financialYears[0];
  }, [financialYears, selectedFyId]);

  // Calculated Live Totals from Data Breakdown
  const computedGrossRevenue = useMemo(() => {
    return revenueList.reduce((acc, item) => acc + item.amount, 0);
  }, [revenueList]);

  const computedTotalExpenses = useMemo(() => {
    return expenseList.reduce((acc, item) => acc + item.amount, 0);
  }, [expenseList]);

  const computedNetProfit = computedGrossRevenue - computedTotalExpenses;
  const computedTaxableIncome = Math.max(0, computedNetProfit - 2370000); // 23.7 Lakh allowable depreciation & capital incentives
  const computedTaxLiability = Math.round(computedTaxableIncome * 0.26); // 25% + 4% cess
  const computedAdvanceTax = currentFy.advanceTaxPaid;
  const computedTdsCollected = currentFy.tdsCollected;
  const computedNetTaxPayable = Math.max(0, computedTaxLiability - (computedAdvanceTax + computedTdsCollected));

  // Trigger Annual ITR Re-Generation & Auto Calculation
  const handleGenerateAnnualItr = () => {
    const reportId = `ITR-${currentFy.id.replace('FY', '')}-V${Date.now().toString().slice(-4)}`;
    const newHistoryItem: ItrHistoryRecord = {
      reportId,
      financialYear: currentFy.label.split(' ')[1] + ' ' + currentFy.label.split(' ')[2],
      assessmentYear: currentFy.label.split('(')[1]?.replace(')', '') || 'AY 2026-27',
      generatedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      generatedBy: 'Super Admin (Rajesh Gautam)',
      grossRevenue: computedGrossRevenue,
      netProfit: computedNetProfit,
      taxLiability: computedTaxLiability,
      status: 'Approved',
      version: '2.0.0',
      ackNumber: `ITR6-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      ipAddress: '127.0.0.1'
    };

    const newAuditLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      userId: 'SA-001',
      userName: 'Super Admin (Rajesh Gautam)',
      action: `Generated & Approved Annual ITR (${currentFy.id})`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      ipAddress: '127.0.0.1',
      remarks: `Automated financial data collection compiled. Tax Liability: ₹${formatINR(computedTaxLiability)}`
    };

    // Update Financial Year Status
    const updatedFys = financialYears.map(fy => {
      if (fy.id === currentFy.id) {
        return {
          ...fy,
          totalIncome: computedGrossRevenue,
          totalExpenses: computedTotalExpenses,
          netProfit: computedNetProfit,
          taxableIncome: computedTaxableIncome,
          grossTaxLiability: computedTaxLiability,
          netTaxDue: computedNetTaxPayable,
          status: 'Approved' as const,
          ackNumber: newHistoryItem.ackNumber
        };
      }
      return fy;
    });

    setFinancialYears(updatedFys);
    setItrHistory([newHistoryItem, ...itrHistory]);
    setAuditLogs([newAuditLog, ...auditLogs]);

    setNotificationMsg(`Annual ITR Report (${newHistoryItem.reportId}) Generated & Calculated Successfully!`);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Export Multi-Sheet CSV for Excel
  const handleExportExcel = () => {
    const rows = [
      ['COMPANY ANNUAL ITR & TAX REPORT - EXCEL SUMMARY'],
      ['Company Name', companyProfile.companyName],
      ['CIN Number', companyProfile.cinNumber, 'PAN', companyProfile.panNumber, 'GSTIN', companyProfile.gstin],
      ['Financial Year', currentFy.label, 'Assessment Year', 'AY 2026-27'],
      ['Generated On', new Date().toLocaleString(), 'Status', currentFy.status],
      [],
      ['1. FINANCIAL SUMMARY & TAX ENGINE'],
      ['Gross Revenue Inflow (INR)', computedGrossRevenue],
      ['Total Operating & Payout Expenses (INR)', computedTotalExpenses],
      ['Net Profit Before Tax (INR)', computedNetProfit],
      ['Allowable Depreciation & Deductions (INR)', 2370000],
      ['Net Taxable Corporate Income (INR)', computedTaxableIncome],
      ['Corporate Tax Liability @ 26% (INR)', computedTaxLiability],
      ['Advance Tax Paid (INR)', computedAdvanceTax],
      ['TDS Credit Available (INR)', computedTdsCollected],
      ['Net Payable / Refundable Tax (INR)', computedNetTaxPayable],
      [],
      ['2. REVENUE BREAKDOWN SOURCES'],
      ['Category', 'Amount (INR)', 'Taxable %', 'Notes'],
      ...revenueList.map(r => [r.category, r.amount, `${r.taxablePercentage}%`, r.notes]),
      [],
      ['3. EXPENSE & PAYOUT SOURCES'],
      ['Category', 'Amount (INR)', 'Allowable Deduction', 'Notes'],
      ...expenseList.map(e => [e.category, e.amount, e.allowableDeduction ? 'Yes' : 'No', e.notes]),
      [],
      ['4. STAKEHOLDER TAX & TDS RECORDS (Form 16 / Form 26AS)'],
      ['Stakeholder ID', 'Name', 'Type', 'PAN', 'Aadhaar', 'Gross Income (INR)', 'TDS Deducted (INR)', 'Net Paid (INR)'],
      ...stakeholders.map(s => [
        s.id,
        s.name,
        s.stakeholderType,
        maskPAN(s.panNumber),
        maskAadhaar(s.aadhaarNumber),
        s.grossIncomeEarned,
        s.tdsDeducted,
        s.netAmountPaid
      ])
    ];

    exportToCSV(`ITR_Company_Annual_Report_${currentFy.id}`, rows);
  };

  // Filtered Stakeholders List
  const filteredStakeholders = useMemo(() => {
    return stakeholders.filter(s => {
      const matchesSearch = 
        s.name.toLowerCase().includes(stakeholderSearch.toLowerCase()) ||
        s.panNumber.toLowerCase().includes(stakeholderSearch.toLowerCase()) ||
        s.mobileNumber.includes(stakeholderSearch) ||
        s.id.toLowerCase().includes(stakeholderSearch.toLowerCase());

      const matchesType = stakeholderTypeFilter === 'ALL' || s.stakeholderType === stakeholderTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [stakeholders, stakeholderSearch, stakeholderTypeFilter]);

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Top Banner & Header Controls */}
      <div className={`p-6 md:p-8 rounded-3xl border shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900 border-sky-500/30' 
          : 'bg-gradient-to-r from-white via-sky-50 to-white border-slate-200'
      }`}>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 font-black">
              <Calculator className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black">ITR Filing Records, Tax Management & Annual Returns</h2>
                <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Form 16 / 26AS Integrated
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Automated income aggregation, expense deductions, TDS calculations, balance sheet summaries & government-style ITR-6 generation.
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Financial Year Selector */}
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 shrink-0">
            <Calendar className="w-4 h-4 text-sky-400 pl-1" />
            <select
              value={selectedFyId}
              onChange={(e) => setSelectedFyId(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-2"
            >
              {financialYears.map(fy => (
                <option key={fy.id} value={fy.id} className="bg-slate-900 text-white">
                  {fy.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerateAnnualItr}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-400/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Annual ITR</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-lg shadow-sky-600/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print ITR (A4)</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Re-Generation Toast Notification */}
      {notificationMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-extrabold">{notificationMsg}</span>
          </div>
          <button type="button" onClick={() => setNotificationMsg(null)} className="text-emerald-400 hover:text-white font-bold">
            ✕
          </button>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'ITR Dashboard', icon: Calculator },
          { id: 'fy_manager', label: 'Financial Year Manager', icon: Calendar },
          { id: 'revenue_expenses', label: 'Revenue & Expense Sources', icon: ArrowUpRight },
          { id: 'tax_engine', label: 'Tax Calculation Engine', icon: DollarSign },
          { id: 'stakeholders', label: 'Stakeholder Tax (Form 16/26AS)', icon: Users },
          { id: 'company_itr', label: 'Company Return & P&L', icon: Building2 },
          { id: 'history_audit', label: 'ITR History & Audit Logs', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : isDarkMode
                  ? 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & EXECUTIVE TAX DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Gross Income */}
            <div className={`p-6 rounded-3xl border shadow-xl space-y-3 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-extrabold uppercase">Gross Revenue Inflow</span>
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-400">
                ₹{formatINR(computedGrossRevenue)}
              </div>
              <p className="text-[11px] text-slate-400">
                Plot Sales, Tokens, EMIs & Services ({currentFy.id})
              </p>
            </div>

            {/* Card 2: Total Expenses */}
            <div className={`p-6 rounded-3xl border shadow-xl space-y-3 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-extrabold uppercase">Total Deductible Outflows</span>
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-400">
                ₹{formatINR(computedTotalExpenses)}
              </div>
              <p className="text-[11px] text-slate-400">
                Honorarium, Commissions, ROI & Operations
              </p>
            </div>

            {/* Card 3: Net Taxable Income */}
            <div className={`p-6 rounded-3xl border shadow-xl space-y-3 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-extrabold uppercase">Net Taxable Profit</span>
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-400">
                ₹{formatINR(computedTaxableIncome)}
              </div>
              <p className="text-[11px] text-slate-400">
                Net Profit: ₹{formatINR(computedNetProfit)} (Less Incentives)
              </p>
            </div>

            {/* Card 4: Corporate Tax Liability */}
            <div className={`p-6 rounded-3xl border shadow-xl space-y-3 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-extrabold uppercase">Net Tax Payable</span>
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-sky-400">
                ₹{formatINR(computedNetTaxPayable)}
              </div>
              <p className="text-[11px] text-slate-400">
                Gross Tax: ₹{formatINR(computedTaxLiability)} (Less TDS & Adv. Tax)
              </p>
            </div>

          </div>

          {/* Company Identification & Filing Status Bar */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-400" />
                  <span>{companyProfile.companyName}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  CIN: <span className="font-mono text-sky-300 font-bold">{companyProfile.cinNumber}</span> | PAN: <span className="font-mono text-amber-400 font-bold">{companyProfile.panNumber}</span> | GSTIN: <span className="font-mono text-emerald-400 font-bold">{companyProfile.gstin}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditCompanyModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold flex items-center gap-2 border border-slate-700"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Company Tax Profile</span>
                </button>

                <div className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Filing Status: {currentFy.status}</span>
                </div>
              </div>
            </div>

            {/* Tax Reconciliation Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Advance Tax Paid</span>
                <span className="font-black text-emerald-400 text-sm">₹{formatINR(computedAdvanceTax)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">TDS Credit Collected</span>
                <span className="font-black text-sky-400 text-sm">₹{formatINR(computedTdsCollected)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">TDS Deposited to Govt</span>
                <span className="font-black text-amber-400 text-sm">₹{formatINR(currentFy.tdsPaid)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">ITR Acknowledgement No</span>
                <span className="font-mono font-black text-emerald-400 text-xs">{currentFy.ackNumber || 'PENDING'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FINANCIAL YEAR MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'fy_manager' && (
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-400" />
                <span>Financial Year & Audit Period Manager</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure opening balances, income/expense ledgers, and track tax filing status per financial year.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddFyModal(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Financial Year</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {financialYears.map((fy) => (
              <div
                key={fy.id}
                className={`p-6 rounded-3xl border transition-all space-y-4 relative ${
                  fy.id === selectedFyId
                    ? 'bg-gradient-to-b from-sky-950/40 to-slate-950 border-sky-500/50 shadow-xl'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-black text-white text-sm">{fy.label}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{fy.startDate} to {fy.endDate}</span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    fy.status === 'Filed' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : fy.status === 'Approved'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {fy.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Opening Balance:</span>
                    <span className="font-bold text-white">₹{formatINR(fy.openingBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Income:</span>
                    <span className="font-bold text-emerald-400">₹{formatINR(fy.totalIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Expenses:</span>
                    <span className="font-bold text-rose-400">₹{formatINR(fy.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Net Tax Liability:</span>
                    <span className="font-black text-amber-400">₹{formatINR(fy.grossTaxLiability)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Closing Balance:</span>
                    <span className="font-bold text-sky-400">₹{formatINR(fy.closingBalance)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFyId(fy.id)}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition-all ${
                    fy.id === selectedFyId
                      ? 'bg-sky-500 text-slate-950 font-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {fy.id === selectedFyId ? 'Currently Active FY' : 'Select FY Period'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUTOMATED REVENUE & EXPENSE COLLECTION SOURCES */}
      {/* ========================================================================= */}
      {activeTab === 'revenue_expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue Inflow Column */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                <span>Revenue & Inflow Sources ({currentFy.id})</span>
              </h3>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                Total: ₹{formatINR(computedGrossRevenue)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase">
                    <th className="p-3">Source Category</th>
                    <th className="p-3">Amount (INR)</th>
                    <th className="p-3">Taxability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium">
                  {revenueList.map((rev, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3">
                        <span className="font-bold text-white block">{rev.category}</span>
                        <span className="text-[10px] text-slate-500">{rev.notes}</span>
                      </td>
                      <td className="p-3 font-black text-emerald-400">₹{formatINR(rev.amount)}</td>
                      <td className="p-3 font-bold text-amber-400">{rev.taxablePercentage}% Taxable</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expense Outflow Column */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-rose-400" />
                <span>Deductible Expenses & Outflows ({currentFy.id})</span>
              </h3>
              <span className="text-xs font-black text-rose-400 bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30">
                Total: ₹{formatINR(computedTotalExpenses)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase">
                    <th className="p-3">Expense Head</th>
                    <th className="p-3">Amount (INR)</th>
                    <th className="p-3">ITR Deductible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium">
                  {expenseList.map((exp, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3">
                        <span className="font-bold text-white block">{exp.category}</span>
                        <span className="text-[10px] text-slate-500">{exp.notes}</span>
                      </td>
                      <td className="p-3 font-black text-rose-400">₹{formatINR(exp.amount)}</td>
                      <td className="p-3 font-bold text-emerald-400">
                        {exp.allowableDeduction ? '100% Allowable' : 'Non-deductible'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TAX CALCULATION ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'tax_engine' && (
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>Tax Calculation Engine (Corporate Income Tax ITR-6)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Step-by-step transparent tax computation with statutory 25% corporate tax rate + 4% Health & Education Cess.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs font-medium">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-300 font-bold">1. Gross Revenue & Business Inflow:</span>
              <span className="font-black text-emerald-400 text-sm">₹{formatINR(computedGrossRevenue)}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-300 font-bold">2. Less: Allowable Operating & Payout Expenses:</span>
              <span className="font-black text-rose-400 text-sm">-₹{formatINR(computedTotalExpenses)}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border-l-4 border-amber-400">
              <span className="text-white font-extrabold">3. Net Operating Profit Before Depreciation:</span>
              <span className="font-black text-amber-400 text-base">₹{formatINR(computedNetProfit)}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-300 font-bold">4. Less: Depreciation & Section 80IA Infrastructure Incentives:</span>
              <span className="font-black text-rose-400 text-sm">-₹{formatINR(2370000)}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border-l-4 border-emerald-400">
              <span className="text-white font-extrabold">5. Net Taxable Income:</span>
              <span className="font-black text-emerald-400 text-base">₹{formatINR(computedTaxableIncome)}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-300 font-bold">6. Corporate Tax Liability (25% Base + 4% Cess = 26.0%):</span>
              <span className="font-black text-amber-400 text-sm">₹{formatINR(computedTaxLiability)}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-300 font-bold">7. Less: Advance Tax Paid in Q1/Q2/Q3/Q4:</span>
              <span className="font-black text-emerald-400 text-sm">-₹{formatINR(computedAdvanceTax)}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900">
              <span className="text-slate-300 font-bold">8. Less: TDS Credit Deposited by Clients / Banks:</span>
              <span className="font-black text-sky-400 text-sm">-₹{formatINR(computedTdsCollected)}</span>
            </div>

            <div className="flex justify-between items-center p-4 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sm">
              <span className="text-sky-300 font-black">9. NET SELF-ASSESSMENT TAX DUE / PAYABLE:</span>
              <span className="font-black text-sky-400 text-lg">₹{formatINR(computedNetTaxPayable)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: STAKEHOLDER TAX RECORDS (Form 16 / Form 16A / Form 26AS) */}
      {/* ========================================================================= */}
      {activeTab === 'stakeholders' && (
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                <span>Stakeholder Yearly Tax Statements (Form 16 / 16A / 26AS)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Annual income, commission, honorarium earnings & TDS deductions with privacy PAN/Aadhaar masking.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Name, PAN, Aadhaar..."
                  value={stakeholderSearch}
                  onChange={(e) => setStakeholderSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400 w-48 font-bold"
                />
              </div>

              <select
                value={stakeholderTypeFilter}
                onChange={(e) => setStakeholderTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-bold cursor-pointer"
              >
                <option value="ALL">All Stakeholders</option>
                <option value="Employee">Employees (Form 16)</option>
                <option value="Agent">Agents (Form 16A)</option>
                <option value="Investor">Investors (Form 26AS)</option>
                <option value="Risk-Free Investor">Free Plot Scheme</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase">
                  <th className="p-3">ID & Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Masked PAN & Aadhaar</th>
                  <th className="p-3">Gross Earnings</th>
                  <th className="p-3">TDS Rate & Deducted</th>
                  <th className="p-3">Net Paid</th>
                  <th className="p-3 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {filteredStakeholders.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-3">
                      <span className="font-mono text-sky-400 font-bold block">{s.id}</span>
                      <span className="font-bold text-white">{s.name}</span>
                      <span className="text-[10px] text-slate-500 block">{s.mobileNumber}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-800 text-amber-300">
                        {s.stakeholderType}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      <div>PAN: <span className="font-bold text-amber-400">{maskPAN(s.panNumber)}</span></div>
                      <div>Aadhaar: <span className="text-slate-400">{maskAadhaar(s.aadhaarNumber)}</span></div>
                    </td>
                    <td className="p-3 font-black text-white">₹{formatINR(s.grossIncomeEarned)}</td>
                    <td className="p-3">
                      <span className="font-bold text-rose-400 block">₹{formatINR(s.tdsDeducted)}</span>
                      <span className="text-[10px] text-slate-500">@{s.tdsRatePct}% Section 192/194H</span>
                    </td>
                    <td className="p-3 font-black text-emerald-400">₹{formatINR(s.netAmountPaid)}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStakeholderForm(s)}
                        className="bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-slate-700"
                      >
                        {s.formType} Certificate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: COMPANY ITR RETURN & FINANCIAL STATEMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'company_itr' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <span>Company Annual Financial Statements & Balance Sheet ({currentFy.id})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Audited Balance Sheet, Profit & Loss Statement, and Cash Flow Statement summary for filing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Balance Sheet Liabilities */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <h4 className="text-sm font-black text-amber-400 border-b border-slate-800 pb-2">EQUITY & LIABILITIES</h4>
                <div className="flex justify-between"><span>Share Capital:</span><span className="font-bold text-white">₹{formatINR(INITIAL_BALANCE_SHEET.shareCapital)}</span></div>
                <div className="flex justify-between"><span>Reserves & Surplus:</span><span className="font-bold text-white">₹{formatINR(INITIAL_BALANCE_SHEET.reservesAndSurplus)}</span></div>
                <div className="flex justify-between"><span>Secured Loans:</span><span className="font-bold text-white">₹{formatINR(INITIAL_BALANCE_SHEET.securedLoans)}</span></div>
                <div className="flex justify-between"><span>Unsecured Loans:</span><span className="font-bold text-white">₹{formatINR(INITIAL_BALANCE_SHEET.unsecuredLoans)}</span></div>
                <div className="flex justify-between"><span>Current Liabilities & Provisions:</span><span className="font-bold text-white">₹{formatINR(INITIAL_BALANCE_SHEET.currentLiabilities)}</span></div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-black text-sm text-emerald-400">
                  <span>TOTAL LIABILITIES:</span><span>₹{formatINR(INITIAL_BALANCE_SHEET.totalLiabilities)}</span>
                </div>
              </div>

              {/* Balance Sheet Assets */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <h4 className="text-sm font-black text-sky-400 border-b border-slate-800 pb-2">ASSETS</h4>
                <div className="flex justify-between"><span>Fixed Assets & Land Assets:</span><span className="font-bold text-white">₹{formatINR(INITIAL_BALANCE_SHEET.fixedAssets)}</span></div>
                <div className="flex justify-between"><span>Plot Inventory Value:</span><span className="font-bold text-white">₹{formatINR(INITIAL_BALANCE_SHEET.plotInventoryValue)}</span></div>
                <div className="flex justify-between"><span>Cash & Bank Balances:</span><span className="font-bold text-white">₹{formatINR(INITIAL_BALANCE_SHEET.cashAndBankBalances)}</span></div>
                <div className="flex justify-between"><span>Trade Receivables:</span><span className="font-bold text-white">₹{formatINR(INITIAL_BALANCE_SHEET.tradeReceivables)}</span></div>
                <div className="flex justify-between"><span>Loans & Advances:</span><span className="font-bold text-white">₹{formatINR(INITIAL_BALANCE_SHEET.loansAndAdvances)}</span></div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-black text-sm text-sky-400">
                  <span>TOTAL ASSETS:</span><span>₹{formatINR(INITIAL_BALANCE_SHEET.totalAssets)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: ITR HISTORY & AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'history_audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Historical Returns List */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <span>ITR Filing History & Version Archives</span>
              </h3>
            </div>

            <div className="space-y-3">
              {itrHistory.map((h) => (
                <div key={h.reportId} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sky-400 font-bold">{h.reportId} ({h.version})</span>
                    <span className="px-2.5 py-0.5 rounded font-extrabold text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {h.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{h.financialYear} ({h.assessmentYear})</span>
                    <span className="font-bold text-amber-400">Tax: ₹{formatINR(h.taxLiability)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                    <span>Ack: {h.ackNumber}</span>
                    <span>By: {h.generatedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Security & Tax Audit Trail Logs</span>
              </h3>
            </div>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{log.date} {log.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{log.remarks}</p>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                    <span>User: {log.userName}</span>
                    <span className="font-mono">IP: {log.ipAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: GOVERNMENT-STYLE A4 PRINTABLE ITR FORM */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-black text-white">Government-Style A4 Corporate ITR Print Preview</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => exportElementToPDF('printable-itr-a4-document', `ITR_Return_${currentFy.id}`)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm px-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable A4 Form Container */}
            <div 
              id="printable-itr-a4-document"
              className="bg-white text-slate-950 p-8 rounded-xl shadow-2xl border-4 border-slate-900 text-xs font-serif space-y-6"
            >
              {/* Government Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <h1 className="text-lg font-bold uppercase tracking-wide">INCOME TAX DEPARTMENT - GOVERNMENT OF INDIA</h1>
                <h2 className="text-sm font-extrabold uppercase">FORM ITR-6 (INDIAN CORPORATE RETURN OF INCOME)</h2>
                <p className="text-[11px] font-sans font-medium">For Companies other than companies claiming exemption under section 11</p>
                <div className="flex justify-between items-center pt-2 text-[11px] font-sans font-bold">
                  <span>ASSESSMENT YEAR: AY 2026-27</span>
                  <span>FINANCIAL YEAR: {currentFy.label}</span>
                </div>
              </div>

              {/* Part A: Company Particulars */}
              <div className="space-y-2 font-sans text-[11px]">
                <h3 className="font-bold bg-slate-200 p-1.5 border border-slate-400 uppercase text-[10px]">PART A - GENERAL INFORMATION</h3>
                <div className="grid grid-cols-2 gap-2 border border-slate-300 p-3">
                  <div><strong>Company Name:</strong> {companyProfile.companyName}</div>
                  <div><strong>CIN:</strong> {companyProfile.cinNumber}</div>
                  <div><strong>PAN:</strong> {companyProfile.panNumber}</div>
                  <div><strong>TAN:</strong> {companyProfile.tanNumber}</div>
                  <div><strong>GSTIN:</strong> {companyProfile.gstin}</div>
                  <div><strong>Status:</strong> Resident Private Limited Company</div>
                  <div className="col-span-2"><strong>Registered Address:</strong> {companyProfile.registeredAddress}</div>
                </div>
              </div>

              {/* Part B: Computation of Income */}
              <div className="space-y-2 font-sans text-[11px]">
                <h3 className="font-bold bg-slate-200 p-1.5 border border-slate-400 uppercase text-[10px]">PART B - COMPUTATION OF TOTAL INCOME</h3>
                <table className="w-full border-collapse border border-slate-400 text-left">
                  <tbody>
                    <tr className="border-b border-slate-300"><td className="p-2">1. Gross Business Revenue / Inflow</td><td className="p-2 font-bold text-right">₹{formatINR(computedGrossRevenue)}</td></tr>
                    <tr className="border-b border-slate-300"><td className="p-2">2. Less: Deductible Operating & Payout Expenses</td><td className="p-2 font-bold text-right">-₹{formatINR(computedTotalExpenses)}</td></tr>
                    <tr className="border-b border-slate-300"><td className="p-2">3. Net Profit Before Depreciation</td><td className="p-2 font-bold text-right">₹{formatINR(computedNetProfit)}</td></tr>
                    <tr className="border-b border-slate-300"><td className="p-2">4. Less: Depreciation Allowance & Section 80IA</td><td className="p-2 font-bold text-right">-₹{formatINR(2370000)}</td></tr>
                    <tr className="border-b-2 border-slate-900 bg-slate-100 font-bold"><td className="p-2">5. TOTAL TAXABLE INCOME</td><td className="p-2 text-right">₹{formatINR(computedTaxableIncome)}</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Part C: Tax Computation */}
              <div className="space-y-2 font-sans text-[11px]">
                <h3 className="font-bold bg-slate-200 p-1.5 border border-slate-400 uppercase text-[10px]">PART C - COMPUTATION OF TAX LIABILITY</h3>
                <table className="w-full border-collapse border border-slate-400 text-left">
                  <tbody>
                    <tr className="border-b border-slate-300"><td className="p-2">Tax Payable on Taxable Income @ 25% + Cess 4%</td><td className="p-2 font-bold text-right">₹{formatINR(computedTaxLiability)}</td></tr>
                    <tr className="border-b border-slate-300"><td className="p-2">Less: Advance Tax Paid</td><td className="p-2 font-bold text-right">-₹{formatINR(computedAdvanceTax)}</td></tr>
                    <tr className="border-b border-slate-300"><td className="p-2">Less: TDS Credit Claimed</td><td className="p-2 font-bold text-right">-₹{formatINR(computedTdsCollected)}</td></tr>
                    <tr className="border-b-2 border-slate-900 bg-slate-100 font-bold"><td className="p-2">NET SELF-ASSESSMENT TAX PAYABLE</td><td className="p-2 text-right">₹{formatINR(computedNetTaxPayable)}</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Declaration & Signatory Section */}
              <div className="border-t-2 border-slate-900 pt-4 space-y-4 font-sans text-[11px]">
                <p className="italic">
                  "I, <strong>{companyProfile.authorizedSignatoryName}</strong>, in my capacity as <strong>{companyProfile.authorizedSignatoryDesignation}</strong> solemnly declare that to the best of my knowledge and belief, the information given in this return is correct, complete and truly stated."
                </p>

                <div className="flex justify-between items-end pt-4">
                  <div className="space-y-1">
                    <p><strong>Place:</strong> New Delhi</p>
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Ack No:</strong> {currentFy.ackNumber || 'PENDING'}</p>
                  </div>

                  <div className="text-center space-y-2 border-t border-slate-400 pt-2 px-6">
                    <p className="font-bold">{companyProfile.authorizedSignatoryName}</p>
                    <p className="text-[10px] text-slate-600">Authorized Signatory Seal & Signature</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: STAKEHOLDER FORM 16 / 16A / 26AS CERTIFICATE VIEW */}
      {/* ========================================================================= */}
      {selectedStakeholderForm && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>{selectedStakeholderForm.formType} Annual Tax Certificate</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setSelectedStakeholderForm(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Certificate Box */}
            <div id="stakeholder-tax-certificate" className="bg-white text-slate-950 p-6 rounded-xl space-y-4 text-xs font-sans">
              <div className="text-center border-b pb-3">
                <h2 className="font-extrabold text-sm uppercase">{selectedStakeholderForm.formType} CERTIFICATE OF DEDUCTION OF TAX AT SOURCE</h2>
                <p className="text-[10px] text-slate-600">Under Section 203 of the Income Tax Act, 1961</p>
              </div>

              <div className="grid grid-cols-2 gap-2 border p-3 rounded">
                <div><strong>Deductor:</strong> {companyProfile.companyName}</div>
                <div><strong>TAN:</strong> {companyProfile.tanNumber}</div>
                <div><strong>Deductee Name:</strong> {selectedStakeholderForm.name}</div>
                <div><strong>PAN:</strong> {maskPAN(selectedStakeholderForm.panNumber)}</div>
                <div><strong>Aadhaar:</strong> {maskAadhaar(selectedStakeholderForm.aadhaarNumber)}</div>
                <div><strong>Financial Year:</strong> {selectedStakeholderForm.financialYear}</div>
              </div>

              <table className="w-full border-collapse border text-left">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b">
                    <th className="p-2">Particulars</th>
                    <th className="p-2 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2">Gross Earnings / Honorarium / Commission</td><td className="p-2 text-right font-bold">₹{formatINR(selectedStakeholderForm.grossIncomeEarned)}</td></tr>
                  <tr className="border-b"><td className="p-2">TDS Deducted @ {selectedStakeholderForm.tdsRatePct}%</td><td className="p-2 text-right font-bold text-rose-600">₹{formatINR(selectedStakeholderForm.tdsDeducted)}</td></tr>
                  <tr className="bg-slate-50 font-bold"><td className="p-2">Net Amount Disbursed</td><td className="p-2 text-right text-emerald-600">₹{formatINR(selectedStakeholderForm.netAmountPaid)}</td></tr>
                </tbody>
              </table>

              <p className="text-[10px] text-slate-500 italic">
                Certified that a sum of ₹{formatINR(selectedStakeholderForm.tdsDeducted)} has been deducted and deposited to the credit of the Central Government via Form 26AS.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => exportElementToPDF('stakeholder-tax-certificate', `${selectedStakeholderForm.formType}_${selectedStakeholderForm.id}`)}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs"
              >
                Download Certificate PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT COMPANY TAX PROFILE */}
      {showEditCompanyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Edit Company Statutory Tax Profile</h3>
              <button type="button" onClick={() => setShowEditCompanyModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block font-bold mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyProfile.companyName}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, companyName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block font-bold mb-1">CIN Number</label>
                  <input
                    type="text"
                    value={companyProfile.cinNumber}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, cinNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block font-bold mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={companyProfile.panNumber}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, panNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block font-bold mb-1">TAN Number</label>
                  <input
                    type="text"
                    value={companyProfile.tanNumber}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, tanNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block font-bold mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={companyProfile.gstin}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, gstin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block font-bold mb-1">Authorized Signatory Name</label>
                <input
                  type="text"
                  value={companyProfile.authorizedSignatoryName}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, authorizedSignatoryName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditCompanyModal(false)}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
