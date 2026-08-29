import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Printer,
  Share2,
  AlertCircle,
  Building2,
  Check,
  Sparkles,
  ArrowRight,
  Calculator,
  Percent,
  Download,
  DollarSign,
  Send,
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  Eye,
  CreditCard,
  Layers,
  BarChart3,
  RefreshCw,
  Sliders,
  FileSpreadsheet,
  CheckSquare,
} from 'lucide-react';
import {
  EmiFreePlotSchemePlan,
  EmiInvestorRecord,
  EmiPaymentRecord,
  EmiSoldPlotRecord,
  EmiInvestorStatus,
} from '../../types';
import {
  DEFAULT_EMI_SCHEME_PLANS,
  evaluateEmiInvestor,
  calculateEmiSchemeAnalytics,
  generateEmiSchedule,
  sendSchemeNotification,
  loadNotificationLogs,
  loadEmiInvestorsFromStorage,
  saveEmiInvestorsToStorage,
  loadEmiPlansFromStorage,
  SchemeNotificationPayload,
} from '../../utils/freePlotEmiSchemeEngine';
import { formatINR } from '../../utils/calculators';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

import { AdminMasterConfigManager } from './freePlotScheme/AdminMasterConfigManager';
import { AdminPlotSalesVerification } from './freePlotScheme/AdminPlotSalesVerification';
import { AdminEmiLedgersView } from './freePlotScheme/AdminEmiLedgersView';
import { AdminReportsExportView } from './freePlotScheme/AdminReportsExportView';

interface AdminEmiFreePlotSchemeManagerProps {
  isDarkMode?: boolean;
}

export const AdminEmiFreePlotSchemeManager: React.FC<AdminEmiFreePlotSchemeManagerProps> = ({
  isDarkMode = false,
}) => {
  // State
  const [plans, setPlans] = useState<EmiFreePlotSchemePlan[]>(() => loadEmiPlansFromStorage());
  const [investors, setInvestors] = useState<EmiInvestorRecord[]>(() => loadEmiInvestorsFromStorage());
  const [activeSubTab, setActiveSubTab] = useState<
    'investors' | 'verification' | 'ledgers' | 'plans' | 'reports' | 'notifications' | 'analytics'
  >('investors');
  const [notificationLogs, setNotificationLogs] = useState<SchemeNotificationPayload[]>(() => loadNotificationLogs());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tenureFilter, setTenureFilter] = useState<string>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayEmiModal, setShowPayEmiModal] = useState(false);
  const [showAddPlotSaleModal, setShowAddPlotSaleModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [showViewStatementModal, setShowViewStatementModal] = useState(false);

  const [selectedInvestor, setSelectedInvestor] = useState<EmiInvestorRecord | null>(null);

  // Form states for Add Investor
  const [formData, setFormData] = useState({
    investorName: '',
    phone: '',
    email: '',
    seniorName: 'राजेश कुमार मिश्रा (VP)',
    seniorId: 'VP-AGT-101',
    address: 'सिविल लाइन्स, प्रयागराज (UP)',
    plotNo: '',
    tenureMonths: 12,
    joiningDate: new Date().toISOString().split('T')[0],
    nomineeName: '',
    nomineeRelation: 'पत्नी (Wife)',
    nomineeAge: 32,
    nomineePhone: '',
    bankName: 'State Bank of India',
    accountNumber: '',
    ifscCode: 'SBIN0001234',
    panNumber: '',
    aadharNumber: '',
  });

  // Form states for Record EMI
  const [emiPaymentForm, setEmiPaymentForm] = useState({
    installmentNo: 1,
    paymentMode: 'UPI' as const,
    txnRef: '',
    notes: '',
  });

  // Form states for Record Plot Sale
  const [plotSaleForm, setPlotSaleForm] = useState({
    plotNo: '',
    projectName: 'Vigya City Phase 2',
    buyerName: '',
    buyerPhone: '',
    saleAmount: 1188000,
  });

  // Form states for Disburse
  const [disburseForm, setDisburseForm] = useState({
    payoutMode: 'Bank Transfer (RTGS/NEFT)' as const,
    txnReference: '',
    notes: '',
  });

  // Analytics computation
  const analytics = useMemo(() => calculateEmiSchemeAnalytics(investors), [investors]);

  // Persist helper
  const handleUpdateInvestors = (newInvestors: EmiInvestorRecord[]) => {
    setInvestors(newInvestors);
    saveEmiInvestorsToStorage(newInvestors);
  };

  const handleUpdateSingleInvestor = (updated: EmiInvestorRecord) => {
    const evaluated = evaluateEmiInvestor(updated, plans);
    const updatedList = investors.map((inv) => (inv.id === evaluated.id ? evaluated : inv));
    handleUpdateInvestors(updatedList);
    setSelectedInvestor(evaluated);
  };

  const handlePlansUpdated = (updatedPlans: EmiFreePlotSchemePlan[]) => {
    setPlans(updatedPlans);
    // Recalculate all investors with new plans
    const recalculated = investors.map((inv) => evaluateEmiInvestor(inv, updatedPlans));
    handleUpdateInvestors(recalculated);
  };

  // Filtered Investors
  const filteredInvestors = useMemo(() => {
    return investors.filter((inv) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        inv.investorName.toLowerCase().includes(q) ||
        inv.id.toLowerCase().includes(q) ||
        inv.phone.toLowerCase().includes(q) ||
        inv.seniorName.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const matchesTenure = tenureFilter === 'ALL' || String(inv.tenureMonths) === tenureFilter;

      return matchesSearch && matchesStatus && matchesTenure;
    });
  }, [investors, searchQuery, statusFilter, tenureFilter]);

  // Handle Add Investor
  const handleAddInvestor = (e: React.FormEvent) => {
    e.preventDefault();
    const plan =
      plans.find((p) => p.tenureMonths === Number(formData.tenureMonths)) ||
      DEFAULT_EMI_SCHEME_PLANS[0];

    const newId = `INV-205-${new Date().getFullYear()}-${String(investors.length + 1).padStart(3, '0')}`;
    const initialSchedule = generateEmiSchedule(
      plan.tenureMonths,
      plan.monthlyInstallment,
      formData.joiningDate,
      0
    );

    const newInvestor: EmiInvestorRecord = {
      id: newId,
      investorName: formData.investorName,
      phone: formData.phone,
      email: formData.email,
      seniorName: formData.seniorName,
      seniorId: formData.seniorId,
      address: formData.address,
      plotNo: formData.plotNo || `PLOT-FPS-${100 + investors.length + 1}`,
      plotSizeSqft: 900,
      tenureMonths: plan.tenureMonths,
      monthlyEmi: plan.monthlyInstallment,
      monthlyReturn: plan.monthlyReturn,
      bonusReturnPerPlot: plan.bonusReturnPerPlot,
      requiredPlotSales: plan.requiredPlotSales,
      interestRatePercent: plan.interestRatePercent || 24.5,
      totalInvestment: plan.totalTenureInvestment || plan.monthlyInstallment * plan.tenureMonths,
      totalExpectedReturn: plan.totalTenureReturn || plan.monthlyReturn * plan.tenureMonths,
      joiningDate: formData.joiningDate,
      maturityDate: new Date(
        new Date(formData.joiningDate).setMonth(
          new Date(formData.joiningDate).getMonth() + plan.tenureMonths
        )
      )
        .toISOString()
        .split('T')[0],
      nominee: {
        nomineeName: formData.nomineeName,
        nomineeRelation: formData.nomineeRelation,
        nomineeAge: Number(formData.nomineeAge) || 30,
        nomineePhone: formData.nomineePhone,
      },
      status: 'Active',
      paidInstallmentsCount: 0,
      totalPaidAmount: 0,
      remainingInstallmentsCount: plan.tenureMonths,
      remainingAmount: plan.totalTenureInvestment || plan.monthlyInstallment * plan.tenureMonths,
      nextEmiDueDate: initialSchedule[0]?.dueDate || 'N/A',
      plotsSoldCount: 0,
      soldPlotsList: [],
      monthlyBonusAmount: 0,
      totalCurrentMonthlyReturn: plan.monthlyReturn,
      isPlotTargetMet: false,
      isTenureCompleted: false,
      isPayoutEligible: false,
      isPayoutDisbursed: false,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      panNumber: formData.panNumber,
      aadharNumber: formData.aadharNumber,
      emiLedger: initialSchedule,
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Super Admin',
          action: 'Investor Registration',
          details: `Registered in 24.5% Free Plot Scheme (${plan.tenureMonths} Months, EMI: ₹${plan.monthlyInstallment}/mo)`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const evaluated = evaluateEmiInvestor(newInvestor, plans);
    handleUpdateInvestors([evaluated, ...investors]);

    // Dispatch Registration Notification
    sendSchemeNotification({
      investorId: evaluated.id,
      investorName: evaluated.investorName,
      phone: evaluated.phone,
      email: evaluated.email,
      type: 'registration_success',
      title: 'Welcome to 24.5% Free Plot Scheme',
      message: `Dear ${evaluated.investorName}, your registration under 24.5% Free Plot Scheme (${evaluated.tenureMonths}M EMI: ₹${formatINR(evaluated.monthlyEmi)}) is confirmed. Plot ID: ${evaluated.plotNo}.`,
      channels: ['SMS', 'WhatsApp', 'Email', 'In-App'],
    });
    setNotificationLogs(loadNotificationLogs());

    setShowAddModal(false);
  };

  // Handle Pay EMI
  const handlePayEmi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestor) return;

    const installmentNum = Number(emiPaymentForm.installmentNo);
    const updatedLedger = selectedInvestor.emiLedger.map((item) => {
      if (item.installmentNo === installmentNum) {
        return {
          ...item,
          status: 'Paid' as const,
          paidDate: new Date().toISOString().split('T')[0],
          paymentMode: emiPaymentForm.paymentMode,
          txnRef: emiPaymentForm.txnRef || `TXN-225-${Date.now().toString().slice(-6)}`,
          receiptNumber: `REC-225-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
          notes: emiPaymentForm.notes,
        };
      }
      return item;
    });

    const updatedInvestor: EmiInvestorRecord = {
      ...selectedInvestor,
      emiLedger: updatedLedger,
      auditLogs: [
        {
          id: `AUD-PAY-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Finance Admin',
          action: 'EMI Payment Recorded',
          details: `Recorded installment #${installmentNum} of ₹${formatINR(selectedInvestor.monthlyEmi)} via ${emiPaymentForm.paymentMode}`,
        },
        ...selectedInvestor.auditLogs,
      ],
    };

    handleUpdateSingleInvestor(updatedInvestor);

    // Send EMI Received Notification
    sendSchemeNotification({
      investorId: selectedInvestor.id,
      investorName: selectedInvestor.investorName,
      phone: selectedInvestor.phone,
      email: selectedInvestor.email,
      type: 'emi_received',
      title: 'EMI Payment Receipt Acknowledged',
      message: `Dear ${selectedInvestor.investorName}, your EMI installment #${installmentNum} of ₹${formatINR(selectedInvestor.monthlyEmi)} has been received via ${emiPaymentForm.paymentMode}. Txn: ${emiPaymentForm.txnRef || 'SUCCESS'}.`,
      channels: ['SMS', 'WhatsApp', 'Email', 'In-App'],
    });
    setNotificationLogs(loadNotificationLogs());

    setShowPayEmiModal(false);
  };

  // Handle Add Plot Sale
  const handleAddPlotSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestor) return;

    const plan =
      plans.find((p) => p.tenureMonths === selectedInvestor.tenureMonths) || DEFAULT_EMI_SCHEME_PLANS[0];

    const newPlotSale: EmiSoldPlotRecord = {
      id: `SP-${Date.now().toString().slice(-6)}`,
      investorId: selectedInvestor.id,
      plotNo: plotSaleForm.plotNo,
      projectName: plotSaleForm.projectName,
      buyerName: plotSaleForm.buyerName,
      buyerPhone: plotSaleForm.buyerPhone,
      saleAmount: Number(plotSaleForm.saleAmount) || 1188000,
      saleDate: new Date().toISOString().split('T')[0],
      monthlyBonusRate: plan.bonusReturnPerPlot,
      registeredBy: selectedInvestor.investorName,
      status: 'Verified',
      verifiedBy: 'Super Admin',
      verificationDate: new Date().toISOString().split('T')[0],
    };

    const updatedInvestor: EmiInvestorRecord = {
      ...selectedInvestor,
      soldPlotsList: [newPlotSale, ...selectedInvestor.soldPlotsList],
      auditLogs: [
        {
          id: `AUD-SALE-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Super Admin',
          action: 'Plot Sale Verified & Recorded',
          details: `Direct sale registered & verified: Plot ${plotSaleForm.plotNo} (Buyer: ${plotSaleForm.buyerName}). +₹${formatINR(plan.bonusReturnPerPlot)}/mo bonus activated.`,
        },
        ...selectedInvestor.auditLogs,
      ],
    };

    handleUpdateSingleInvestor(updatedInvestor);

    // Send Notification
    sendSchemeNotification({
      investorId: selectedInvestor.id,
      investorName: selectedInvestor.investorName,
      phone: selectedInvestor.phone,
      email: selectedInvestor.email,
      type: 'plot_verified',
      title: 'Plot Sale Verified',
      message: `Your plot sale (${plotSaleForm.plotNo} - Buyer: ${plotSaleForm.buyerName}) is verified. Monthly return bonus increased by ₹${formatINR(plan.bonusReturnPerPlot)}/mo.`,
      channels: ['SMS', 'WhatsApp', 'Email', 'In-App'],
    });
    setNotificationLogs(loadNotificationLogs());

    setShowAddPlotSaleModal(false);
  };

  // Handle Disburse Payout
  const handleDisbursePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestor) return;

    const updatedInvestor: EmiInvestorRecord = {
      ...selectedInvestor,
      isPayoutDisbursed: true,
      payoutDisbursedDate: new Date().toISOString().split('T')[0],
      payoutTxnReference: disburseForm.txnReference || `RTGS-205-${Date.now().toString().slice(-8)}`,
      payoutDisbursedAmount: selectedInvestor.totalExpectedReturn,
      payoutMode: disburseForm.payoutMode,
      status: 'Disbursed',
      auditLogs: [
        {
          id: `AUD-DISB-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Super Admin',
          action: 'Maturity Payout Disbursed',
          details: `Disbursed total maturity sum of ₹${formatINR(selectedInvestor.totalExpectedReturn)} via ${disburseForm.payoutMode}. Txn Ref: ${disburseForm.txnReference || 'RTGS'}`,
        },
        ...selectedInvestor.auditLogs,
      ],
    };

    handleUpdateSingleInvestor(updatedInvestor);

    // Send Disbursed Notification
    sendSchemeNotification({
      investorId: selectedInvestor.id,
      investorName: selectedInvestor.investorName,
      phone: selectedInvestor.phone,
      email: selectedInvestor.email,
      type: 'payout_disbursed',
      title: 'Maturity Payout Disbursed Successfully',
      message: `Dear ${selectedInvestor.investorName}, your 24.5% Free Plot Scheme maturity amount ₹${formatINR(selectedInvestor.totalExpectedReturn)} has been disbursed to your bank account via ${disburseForm.payoutMode}. Ref: ${disburseForm.txnReference}.`,
      channels: ['SMS', 'WhatsApp', 'Email', 'In-App'],
    });
    setNotificationLogs(loadNotificationLogs());

    setShowDisburseModal(false);
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 space-y-6 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen`}>
      {/* Top Banner & KPI Row */}
      <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-black rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" /> 24.5% Free Plot Scheme Master Suite
              </span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Full-Stack Production System
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              24.5% फ्री प्लॉट स्कीम (किस्तों में प्लॉट) – Admin Console
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Complete automated lifecycle: 10 EMI tenures (12 to 120 months), real-time 6/5 plot sales eligibility tracking, plot verification workflow, collection & payout ledgers, multi-channel notification dispatches, and printable audit statements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" /> Enroll New Investor
            </button>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Investors</span>
            <span className="text-xl font-black text-white">{analytics.totalInvestors}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block">Total EMI Inflow</span>
            <span className="text-xl font-black text-emerald-400">{formatINR(analytics.totalEmiCollection)}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block">Monthly Cashflow</span>
            <span className="text-xl font-black text-amber-400">{formatINR(analytics.monthlyCashflow)}/mo</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block">Verified Plot Sales</span>
            <span className="text-xl font-black text-blue-400">{analytics.totalSoldPlots} Plots</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block">Eligible Investors</span>
            <span className="text-xl font-black text-purple-400">{analytics.eligibleInvestors}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Scheme Liability</span>
            <span className="text-xl font-black text-amber-300">{formatINR(analytics.totalExpectedLiability)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'investors', label: 'Investor Directory', icon: Users, count: investors.length },
          { id: 'verification', label: 'Plot Sales Verification', icon: CheckSquare, count: investors.flatMap((i) => i.soldPlotsList).length },
          { id: 'ledgers', label: 'Accounting Ledgers', icon: CreditCard },
          { id: 'plans', label: '24.5% Master Config Matrix', icon: Sliders },
          { id: 'reports', label: 'Reports & Statements', icon: FileSpreadsheet },
          { id: 'notifications', label: 'Multi-Channel Alert Logs', icon: Send, count: notificationLogs.length },
          { id: 'analytics', label: 'Financial Analytics & Charts', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : isDarkMode
                  ? 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: INVESTOR DIRECTORY */}
      {activeSubTab === 'investors' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} flex flex-col sm:flex-row items-center gap-3`}>
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Investor Name, ID, Mobile, or Senior Associate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`py-2.5 px-3 rounded-xl text-xs border font-semibold ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Eligible">Eligible for Payout</option>
                <option value="Disbursed">Disbursed</option>
              </select>

              <select
                value={tenureFilter}
                onChange={(e) => setTenureFilter(e.target.value)}
                className={`py-2.5 px-3 rounded-xl text-xs border font-semibold ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="ALL">All Tenures</option>
                <option value="12">12 Months (6 Plots)</option>
                <option value="24">24 Months (6 Plots)</option>
                <option value="36">36 Months (6 Plots)</option>
                <option value="48">48 Months (6 Plots)</option>
                <option value="60">60 Months (6 Plots)</option>
                <option value="72">72 Months (6 Plots)</option>
                <option value="84">84 Months (5 Plots)</option>
                <option value="96">96 Months (5 Plots)</option>
                <option value="108">108 Months (5 Plots)</option>
                <option value="120">120 Months (5 Plots)</option>
              </select>
            </div>
          </div>

          {/* Investors Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredInvestors.map((inv) => {
              const remainingPlotTarget = Math.max(0, inv.requiredPlotSales - inv.plotsSoldCount);
              return (
                <div
                  key={inv.id}
                  className={`p-6 rounded-3xl border transition-all hover:border-amber-500/50 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  } shadow-md space-y-5 flex flex-col justify-between`}
                >
                  <div>
                    {/* Top ID & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-[11px] font-bold text-amber-400">{inv.id}</span>
                        <h3 className="text-base font-black mt-0.5">{inv.investorName}</h3>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3" /> {inv.phone}
                        </div>
                      </div>

                      <div>
                        {inv.status === 'Disbursed' ? (
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-xs">
                            Disbursed
                          </span>
                        ) : inv.status === 'Eligible' ? (
                          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold text-xs animate-pulse">
                            Eligible
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold text-xs">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 gap-2 mt-4 p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Scheme Tenure</span>
                        <span className="font-bold text-amber-400">
                          {inv.tenureMonths} Months ({inv.interestRatePercent}% ROI)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Monthly Installment</span>
                        <span className="font-bold text-white">{formatINR(inv.monthlyEmi)}/mo</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Monthly Base Return</span>
                        <span className="font-bold text-emerald-400">{formatINR(inv.monthlyReturn)}/mo</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Bonus per Plot</span>
                        <span className="font-bold text-purple-400">+{formatINR(inv.bonusReturnPerPlot)}/mo</span>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-3 mt-4 text-xs">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-400">EMI Paid Progress</span>
                          <span className="font-bold text-white">
                            {inv.paidInstallmentsCount} / {inv.tenureMonths} EMIs ({formatINR(inv.totalPaidAmount)})
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{
                              width: `${(inv.paidInstallmentsCount / inv.tenureMonths) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-400">Verified Plot Sales</span>
                          <span className="font-bold text-blue-400">
                            {inv.plotsSoldCount} / {inv.requiredPlotSales} Verified Plots (Remaining: {remainingPlotTarget})
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (inv.plotsSoldCount / inv.requiredPlotSales) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedInvestor(inv);
                        setEmiPaymentForm({
                          installmentNo: inv.paidInstallmentsCount + 1,
                          paymentMode: 'UPI',
                          txnRef: '',
                          notes: '',
                        });
                        setShowPayEmiModal(true);
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pay EMI
                    </button>
                    <button
                      onClick={() => {
                        setSelectedInvestor(inv);
                        setPlotSaleForm({
                          plotNo: `PLOT-FPS-${Math.floor(Math.random() * 800 + 100)}`,
                          projectName: 'Vigya City Phase 2',
                          buyerName: '',
                          buyerPhone: '',
                          saleAmount: 1188000,
                        });
                        setShowAddPlotSaleModal(true);
                      }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Plot Sale
                    </button>

                    {inv.isPayoutEligible && !inv.isPayoutDisbursed && (
                      <button
                        onClick={() => {
                          setSelectedInvestor(inv);
                          setDisburseForm({
                            payoutMode: 'Bank Transfer (RTGS/NEFT)',
                            txnReference: '',
                            notes: '',
                          });
                          setShowDisburseModal(true);
                        }}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-md shadow-amber-500/20"
                      >
                        <Award className="w-3.5 h-3.5" /> Disburse Payout
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedInvestor(inv);
                        setShowViewStatementModal(true);
                      }}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" /> Passbook
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PLOT SALES VERIFICATION */}
      {activeSubTab === 'verification' && (
        <AdminPlotSalesVerification
          investors={investors}
          onUpdateInvestor={handleUpdateSingleInvestor}
          isDarkMode={isDarkMode}
        />
      )}

      {/* SUB-TAB 3: LEDGERS */}
      {activeSubTab === 'ledgers' && (
        <AdminEmiLedgersView investors={investors} isDarkMode={isDarkMode} />
      )}

      {/* SUB-TAB 4: MASTER CONFIG */}
      {activeSubTab === 'plans' && (
        <AdminMasterConfigManager
          plans={plans}
          onPlansUpdated={handlePlansUpdated}
          isDarkMode={isDarkMode}
        />
      )}

      {/* SUB-TAB 5: REPORTS & STATEMENTS */}
      {activeSubTab === 'reports' && (
        <AdminReportsExportView
          investors={investors}
          analytics={analytics}
          isDarkMode={isDarkMode}
        />
      )}

      {/* SUB-TAB 6: NOTIFICATIONS */}
      {activeSubTab === 'notifications' && (
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-500" /> Multi-Channel Alert & Notification Logs
            </h3>
            <span className="text-xs text-slate-400">{notificationLogs.length} Events Dispatched</span>
          </div>

          <div className="space-y-3">
            {notificationLogs.map((log, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-amber-400">{log.title}</span>
                  <span className="text-[11px] text-slate-400">{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-slate-300">{log.message}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-slate-500 text-[10px]">Delivered Channels:</span>
                  {log.channels.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-semibold">
                      {c}
                    </span>
                  ))}
                  <span className="text-slate-500 text-[10px] ml-auto">To: {log.investorName} ({log.phone})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 7: ANALYTICS & CHARTS */}
      {activeSubTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" /> Tenure Distribution & Plot Sales Target
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={plans}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="tenureMonths" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="monthlyInstallment" name="Monthly EMI (₹)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="monthlyReturn" name="Monthly Return (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Plot Sales Eligibility Matrix
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">12 to 72 Months Tenures</span>
                <span className="font-bold text-amber-400">6 Plot Sales Required</span>
              </div>
              <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">84 to 120 Months Tenures</span>
                <span className="font-bold text-emerald-400">5 Plot Sales Required</span>
              </div>
              <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">ROI Return Rate</span>
                <span className="font-bold text-purple-400">20.5% Guaranteed Return</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ENROLL INVESTOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-2xl w-full rounded-3xl border p-6 sm:p-8 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-2xl max-h-[90vh] overflow-y-auto space-y-6`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-700">
              <div>
                <h3 className="text-lg font-black text-amber-400">Enroll New 20.5% Free Plot Scheme Investor</h3>
                <p className="text-xs text-slate-400 mt-0.5">Automated registration with 10 EMI tenure matrix and KYC fields</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleAddInvestor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-400">Investor Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.investorName}
                    onChange={(e) => setFormData({ ...formData, investorName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar Verma"
                    className="w-full mt-1 p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400">Mobile Number (SMS/WhatsApp Alerts)</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full mt-1 p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="investor@gmail.com"
                    className="w-full mt-1 p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400">Senior Associate / Agent Sponsor</label>
                  <input
                    type="text"
                    value={formData.seniorName}
                    onChange={(e) => setFormData({ ...formData, seniorName: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-400">Selected EMI Tenure (20.5% Scheme)</label>
                  <select
                    value={formData.tenureMonths}
                    onChange={(e) => setFormData({ ...formData, tenureMonths: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-amber-400 font-bold"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.tenureMonths}>
                        {p.tenureMonths} Months — EMI: {formatINR(p.monthlyInstallment)}/mo (Req: {p.requiredPlotSales} Plots)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-400">Assigned Plot Number</label>
                  <input
                    type="text"
                    value={formData.plotNo}
                    onChange={(e) => setFormData({ ...formData, plotNo: e.target.value })}
                    placeholder="PLOT-FPS-201 (900 Sq. Ft.)"
                    className="w-full mt-1 p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Nominee Details */}
              <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3">
                <span className="font-bold text-amber-400 block">Nominee Details & Guarantee</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400">Nominee Name</label>
                    <input
                      type="text"
                      required
                      value={formData.nomineeName}
                      onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                      placeholder="e.g. Geeta Verma"
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border-slate-700 border text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400">Relationship</label>
                    <input
                      type="text"
                      value={formData.nomineeRelation}
                      onChange={(e) => setFormData({ ...formData, nomineeRelation: e.target.value })}
                      placeholder="Wife / Son / Mother"
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border-slate-700 border text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400">Nominee Phone</label>
                    <input
                      type="tel"
                      value={formData.nomineePhone}
                      onChange={(e) => setFormData({ ...formData, nomineePhone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full mt-1 p-2 rounded-lg bg-slate-800 border-slate-700 border text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold border border-slate-600 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-black bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Enroll Investor & Dispatch Alerts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD EMI MODAL */}
      {showPayEmiModal && selectedInvestor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl border p-6 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-2xl space-y-4`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-700">
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Record EMI Installment Payment
              </h3>
              <button onClick={() => setShowPayEmiModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-xs">
              <div><span className="text-slate-400">Investor:</span> <span className="font-bold text-white">{selectedInvestor.investorName}</span></div>
              <div><span className="text-slate-400">Installment Amount:</span> <span className="font-bold text-emerald-400">{formatINR(selectedInvestor.monthlyEmi)}</span></div>
            </div>

            <form onSubmit={handlePayEmi} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold">Installment Number (1 to {selectedInvestor.tenureMonths})</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedInvestor.tenureMonths}
                  value={emiPaymentForm.installmentNo}
                  onChange={(e) => setEmiPaymentForm({ ...emiPaymentForm, installmentNo: Number(e.target.value) })}
                  className="w-full mt-1 p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Payment Mode</label>
                <select
                  value={emiPaymentForm.paymentMode}
                  onChange={(e) => setEmiPaymentForm({ ...emiPaymentForm, paymentMode: e.target.value as any })}
                  className="w-full mt-1 p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-white font-bold"
                >
                  <option value="UPI">UPI (PhonePe, GPay, Paytm)</option>
                  <option value="Net Banking">Net Banking / IMPS</option>
                  <option value="RTGS/NEFT">RTGS / NEFT Direct Transfer</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="Cash">Cash Deposit</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Transaction Reference UTR</label>
                <input
                  type="text"
                  required
                  value={emiPaymentForm.txnRef}
                  onChange={(e) => setEmiPaymentForm({ ...emiPaymentForm, txnRef: e.target.value })}
                  placeholder="e.g. UTR123456789012"
                  className="w-full mt-1 p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowPayEmiModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold border border-slate-600 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Confirm Payment & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PLOT SALE MODAL */}
      {showAddPlotSaleModal && selectedInvestor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl border p-6 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-2xl space-y-4`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-700">
              <h3 className="text-base font-bold text-blue-400 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add & Verify Self Plot Sale
              </h3>
              <button onClick={() => setShowAddPlotSaleModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-xs">
              <div><span className="text-slate-400">Investor:</span> <span className="font-bold text-white">{selectedInvestor.investorName}</span></div>
              <div><span className="text-slate-400">Bonus Added:</span> <span className="font-bold text-purple-400">+{formatINR(selectedInvestor.bonusReturnPerPlot)}/mo</span></div>
            </div>

            <form onSubmit={handleAddPlotSale} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold">Plot Number</label>
                <input
                  type="text"
                  required
                  value={plotSaleForm.plotNo}
                  onChange={(e) => setPlotSaleForm({ ...plotSaleForm, plotNo: e.target.value })}
                  placeholder="PLOT-FPS-302"
                  className="w-full mt-1 p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Buyer Full Name</label>
                <input
                  type="text"
                  required
                  value={plotSaleForm.buyerName}
                  onChange={(e) => setPlotSaleForm({ ...plotSaleForm, buyerName: e.target.value })}
                  placeholder="e.g. Anand Prakash"
                  className="w-full mt-1 p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Buyer Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={plotSaleForm.buyerPhone}
                  onChange={(e) => setPlotSaleForm({ ...plotSaleForm, buyerPhone: e.target.value })}
                  placeholder="+91 98765 11111"
                  className="w-full mt-1 p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddPlotSaleModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold border border-slate-600 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save & Activate Bonus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISBURSE PAYOUT MODAL */}
      {showDisburseModal && selectedInvestor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl border p-6 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-2xl space-y-4`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-700">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Award className="w-4 h-4" /> Disburse 20.5% Maturity Payout
              </h3>
              <button onClick={() => setShowDisburseModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-xs space-y-1">
              <div><span className="text-slate-400">Investor:</span> <span className="font-bold text-white">{selectedInvestor.investorName}</span></div>
              <div><span className="text-slate-400">Total Maturity Return:</span> <span className="font-black text-amber-400 text-sm">{formatINR(selectedInvestor.totalExpectedReturn)}</span></div>
              <div><span className="text-slate-400">Status:</span> <span className="font-bold text-emerald-400">Fast-Track Target Met ({selectedInvestor.plotsSoldCount}/{selectedInvestor.requiredPlotSales} Plots)</span></div>
            </div>

            <form onSubmit={handleDisbursePayout} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold">Payment Disbursal Mode</label>
                <select
                  value={disburseForm.payoutMode}
                  onChange={(e) => setDisburseForm({ ...disburseForm, payoutMode: e.target.value as any })}
                  className="w-full mt-1 p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-white font-bold"
                >
                  <option value="Bank Transfer (RTGS/NEFT)">Bank Transfer (RTGS/NEFT)</option>
                  <option value="Direct Deposit">Direct Bank Deposit</option>
                  <option value="Cheque">Demand Draft / Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Bank Transaction UTR / Ref</label>
                <input
                  type="text"
                  required
                  value={disburseForm.txnReference}
                  onChange={(e) => setDisburseForm({ ...disburseForm, txnReference: e.target.value })}
                  placeholder="RTGS205987654321"
                  className="w-full mt-1 p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold border border-slate-600 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2"
                >
                  <Award className="w-4 h-4" /> Confirm Disbursal & Send Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PASSBOOK MODAL */}
      {showViewStatementModal && selectedInvestor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-3xl w-full rounded-3xl border p-6 sm:p-8 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-2xl max-h-[90vh] overflow-y-auto space-y-6`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-700">
              <div>
                <span className="text-[11px] font-mono text-amber-400">{selectedInvestor.id}</span>
                <h3 className="text-lg font-black">{selectedInvestor.investorName} — Digital Passbook</h3>
              </div>
              <button onClick={() => setShowViewStatementModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Paid Date</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Mode</th>
                    <th className="py-2.5 px-3">Receipt / Txn Ref</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedInvestor.emiLedger.map((e) => (
                    <tr key={e.installmentNo}>
                      <td className="py-2 px-3 font-bold text-amber-400">EMI {e.installmentNo}</td>
                      <td className="py-2 px-3 text-slate-400">{e.dueDate}</td>
                      <td className="py-2 px-3 text-emerald-400">{e.paidDate || '—'}</td>
                      <td className="py-2 px-3 font-semibold">{formatINR(e.amount)}</td>
                      <td className="py-2 px-3 text-slate-300">{e.paymentMode || '—'}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400">{e.txnRef || '—'}</td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            e.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
