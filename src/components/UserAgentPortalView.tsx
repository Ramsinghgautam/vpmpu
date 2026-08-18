import React, { useState, useEffect } from 'react';
import {
  User,
  AgentRecord,
  AgentSaleRecord,
  AgentWithdrawalRequest
} from '../types';
import {
  ShieldCheck,
  TrendingUp,
  Wallet,
  Building2,
  CheckCircle2,
  PlusCircle,
  ArrowUpRight,
  Calculator,
  Download,
  Clock,
  Layers,
  Award,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Send,
  Calendar,
  X
} from 'lucide-react';
import {
  loadAgentRecordsFromStorage,
  saveAgentRecordsToStorage,
  MANDATORY_BUSINESS_RULE_HINDI,
  MANDATORY_BUSINESS_RULE_ENG,
  RISK_FREE_INVESTOR_RATES,
  BASE_PLOT_VALUE,
  STANDARD_PLOT_SIZE_SQFT,
  getSlabForSaleNumber,
  calculateAgentSaleCommission
} from '../data/agentCommissionEngine';
import {
  loadEmiInvestorsFromStorage,
  loadEmiPlansFromStorage
} from '../utils/freePlotEmiSchemeEngine';
import { formatINR } from '../utils/calculators';
import { AgentCommissionCalculatorView } from './AgentCommissionCalculatorView';

interface UserAgentPortalViewProps {
  currentUser: User | null;
}

export const UserAgentPortalView: React.FC<UserAgentPortalViewProps> = ({ currentUser }) => {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [currentAgent, setCurrentAgent] = useState<AgentRecord | null>(null);

  // Modals state
  const [showRecordSaleModal, setShowRecordSaleModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);

  // New Sale Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [salePlotNo, setSalePlotNo] = useState('');
  const [saleCategory, setSaleCategory] = useState<'Standard Plot' | 'Risk Free Investor Plot'>('Standard Plot');
  const [selectedInvestorRate, setSelectedInvestorRate] = useState<number>(1450);
  const [saleNotes, setSaleNotes] = useState('');

  // Withdrawal Request Form State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'UPI' | 'Cheque'>('Bank Transfer');
  const [accountDetails, setAccountDetails] = useState('');

  // Timeframe for earnings graph
  const [earningsTimeframe, setEarningsTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Load agent data
  useEffect(() => {
    const loaded = loadAgentRecordsFromStorage();
    setAgents(loaded);

    // Find agent corresponding to user or default to first agent
    const found = loaded.find(a => a.phone === currentUser?.phone || a.email === currentUser?.email) || loaded[0];
    if (found) {
      setCurrentAgent(found);
    }
  }, [currentUser]);

  // Handle Recording New Sale
  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAgent) return;

    let finalSaleVal = BASE_PLOT_VALUE;
    if (saleCategory === 'Risk Free Investor Plot') {
      finalSaleVal = selectedInvestorRate * STANDARD_PLOT_SIZE_SQFT;
    }

    const currentLiability = currentAgent.assignedPlot ? currentAgent.assignedPlot.remainingEmiLiability : 0;
    const calc = calculateAgentSaleCommission(finalSaleVal, currentAgent.totalPlotsSold, currentLiability);

    const newSale: AgentSaleRecord = {
      id: `SALE-${Math.floor(1000 + Math.random() * 9000)}`,
      agentId: currentAgent.id,
      date: new Date().toISOString().split('T')[0],
      customerName: customerName || 'Valued Customer',
      customerPhone: customerPhone || '9999999999',
      plotNo: salePlotNo || `PLT-${Math.floor(100 + Math.random() * 900)}`,
      plotSizeSqft: STANDARD_PLOT_SIZE_SQFT,
      saleType: saleCategory,
      saleValue: finalSaleVal,
      slabPercentageUsed: calc.slabPercentage,
      grossCommissionEarned: calc.grossCommission,
      emiDeductionAmount: calc.emiDeductionAmount,
      netWalletAmount: calc.netWalletAmount,
      investorPlanRate: saleCategory === 'Risk Free Investor Plot' ? selectedInvestorRate : undefined,
      notes: saleNotes || 'Direct Agent Sale Entry'
    };

    // Clone agent & update metrics
    const updatedAgent: AgentRecord = {
      ...currentAgent,
      totalPlotsSold: currentAgent.totalPlotsSold + 1,
      currentSlabPercentage: getSlabForSaleNumber(currentAgent.totalPlotsSold + 2).percentage,
      wallet: {
        ...currentAgent.wallet,
        availableBalance: currentAgent.wallet.availableBalance + calc.netWalletAmount,
        totalEmiAdjustedBalance: currentAgent.wallet.totalEmiAdjustedBalance + calc.emiDeductionAmount,
        totalEarned: currentAgent.wallet.totalEarned + calc.grossCommission
      },
      assignedPlot: currentAgent.assignedPlot ? {
        ...currentAgent.assignedPlot,
        emiAdjustedFromCommission: currentAgent.assignedPlot.emiAdjustedFromCommission + calc.emiDeductionAmount,
        remainingEmiLiability: calc.newRemainingLiability,
        emiCompletionPercentage: Number(
          (((currentAgent.assignedPlot.totalEmiPaidDirectly + currentAgent.assignedPlot.emiAdjustedFromCommission + calc.emiDeductionAmount) / currentAgent.assignedPlot.totalPlotValue) * 100).toFixed(2)
        )
      } : undefined,
      salesLedger: [newSale, ...currentAgent.salesLedger]
    };

    const newAgentsList = agents.map(a => a.id === currentAgent.id ? updatedAgent : a);
    setAgents(newAgentsList);
    setCurrentAgent(updatedAgent);
    saveAgentRecordsToStorage(newAgentsList);

    // Reset Form
    setShowRecordSaleModal(false);
    setCustomerName('');
    setCustomerPhone('');
    setSalePlotNo('');
    setSaleNotes('');
  };

  // Handle Withdrawal Request Submission
  const handleWithdrawalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAgent) return;

    if (withdrawAmount > currentAgent.wallet.availableBalance) {
      alert('Withdrawal amount exceeds available wallet balance!');
      return;
    }

    const newReq: AgentWithdrawalRequest = {
      id: `WD-${Math.floor(100 + Math.random() * 900)}`,
      agentId: currentAgent.id,
      agentName: currentAgent.agentName,
      requestDate: new Date().toISOString().split('T')[0],
      amount: withdrawAmount,
      paymentMethod,
      accountDetails: accountDetails || 'Bank Details Provided',
      status: 'Pending'
    };

    const updatedAgent: AgentRecord = {
      ...currentAgent,
      wallet: {
        ...currentAgent.wallet,
        availableBalance: currentAgent.wallet.availableBalance - withdrawAmount,
        pendingBalance: currentAgent.wallet.pendingBalance + withdrawAmount
      },
      withdrawalHistory: [newReq, ...currentAgent.withdrawalHistory]
    };

    const newAgentsList = agents.map(a => a.id === currentAgent.id ? updatedAgent : a);
    setAgents(newAgentsList);
    setCurrentAgent(updatedAgent);
    saveAgentRecordsToStorage(newAgentsList);

    setShowWithdrawModal(false);
    setAccountDetails('');
  };

  if (!currentAgent) {
    return (
      <div className="bg-slate-900 text-white p-8 rounded-2xl text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
        <p className="text-slate-300 font-semibold">Loading Agent Portal Profile...</p>
      </div>
    );
  }

  const assigned = currentAgent.assignedPlot;

  return (
    <div className="space-y-8 text-slate-100">
      {/* Top Banner / Agent Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/80 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg shadow-amber-500/20 shrink-0">
              {currentAgent.agentName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-amber-100">{currentAgent.agentName}</h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  KYC {currentAgent.kycStatus}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                <span>Agent ID: <strong className="text-amber-300">{currentAgent.id}</strong></span>
                <span>Mobile: <strong className="text-slate-200">{currentAgent.phone}</strong></span>
                <span>Email: <strong className="text-slate-200">{currentAgent.email}</strong></span>
                <span>Joined: <strong className="text-slate-300">{currentAgent.joiningDate}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowRecordSaleModal(true)}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Record New Plot Sale
            </button>

            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              Request Withdrawal
            </button>

            <button
              onClick={() => setShowCalculatorModal(!showCalculatorModal)}
              className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3.5 py-3 rounded-xl flex items-center justify-center gap-1.5 font-semibold"
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              Calculator
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Hindi Business Rule Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500/60 rounded-xl p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
              अनिवार्य नियम: एजेंट कमीशन कटौती नीति (Mandatory Rule)
            </h3>
            <p className="text-sm sm:text-base font-bold text-amber-100 leading-relaxed">
              "{MANDATORY_BUSINESS_RULE_HINDI}"
            </p>
            <p className="text-xs text-slate-400 italic pt-1 border-t border-amber-500/20">
              {MANDATORY_BUSINESS_RULE_ENG}
            </p>
          </div>
        </div>
      </div>

      {/* Optional Interactive Simulator Component */}
      {showCalculatorModal && (
        <div className="relative">
          <button
            onClick={() => setShowCalculatorModal(false)}
            className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-full z-20"
          >
            <X className="w-5 h-5" />
          </button>
          <AgentCommissionCalculatorView />
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Slab */}
        <div className="bg-slate-900 border border-amber-500/30 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Current Commission Slab</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">
            {currentAgent.currentSlabPercentage}%
          </div>
          <p className="text-[11px] text-slate-400">
            Total Plots Sold: <strong className="text-white">{currentAgent.totalPlotsSold}</strong>
          </p>
        </div>

        {/* Card 2: Wallet Available */}
        <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Available Wallet Balance</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {formatINR(currentAgent.wallet.availableBalance)}
          </div>
          <p className="text-[11px] text-slate-400">
            Pending Approval: <strong className="text-amber-300">{formatINR(currentAgent.wallet.pendingBalance)}</strong>
          </p>
        </div>

        {/* Card 3: EMI Offset Earned */}
        <div className="bg-slate-900 border border-indigo-500/30 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>EMI Offset Applied</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-400">
            {formatINR(currentAgent.wallet.totalEmiAdjustedBalance)}
          </div>
          <p className="text-[11px] text-slate-400">
            Saved Plot Liability Payments
          </p>
        </div>

        {/* Card 4: Total Commission Earned */}
        <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Total Gross Earned</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-200">
            {formatINR(currentAgent.wallet.totalEarned)}
          </div>
          <p className="text-[11px] text-slate-400">
            Withdrawn: <strong className="text-slate-300">{formatINR(currentAgent.wallet.totalWithdrawn)}</strong>
          </p>
        </div>
      </div>

      {/* Assigned Plot & EMI Recovery Section */}
      {assigned && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                Agent Plot EMI Obligations & Recovery Dashboard
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Assigned Plot: {assigned.plotNo} ({assigned.plotSizeSqft} Sqft)
              </h2>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2 text-right">
              <span className="text-[10px] text-amber-300 font-bold uppercase block">Plot Value</span>
              <span className="text-lg font-black text-amber-400">{formatINR(assigned.totalPlotValue)}</span>
            </div>
          </div>

          {/* EMI Progress Bar */}
          <div className="space-y-2 bg-slate-950 p-5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-300">Plot Liability Recovery Progress</span>
              <span className="text-amber-400 font-mono">{assigned.emiCompletionPercentage}% Complete</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-400 h-full rounded-full transition-all duration-1000 shadow-md"
                style={{ width: `${Math.min(100, assigned.emiCompletionPercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Paid/Recovered: {formatINR(assigned.totalEmiPaidDirectly + assigned.emiAdjustedFromCommission)}</span>
              <span>Remaining Liability: <strong className="text-amber-300">{formatINR(assigned.remainingEmiLiability)}</strong></span>
            </div>
          </div>

          {/* EMI Grid Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
              <span className="text-[11px] text-slate-400 block font-semibold">Monthly EMI</span>
              <span className="text-lg font-black text-white">{formatINR(assigned.monthlyEmiAmount)} / Mo</span>
              <span className="text-[10px] text-slate-400 block">{assigned.emiDurationMonths} Months Tenure</span>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
              <span className="text-[11px] text-slate-400 block font-semibold">Direct Cash EMI Paid</span>
              <span className="text-lg font-black text-emerald-400">{formatINR(assigned.totalEmiPaidDirectly)}</span>
              <span className="text-[10px] text-slate-400 block">Out of Pocket</span>
            </div>

            <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/30">
              <span className="text-[11px] text-indigo-300 block font-semibold">Commission EMI Offset</span>
              <span className="text-lg font-black text-indigo-400">{formatINR(assigned.emiAdjustedFromCommission)}</span>
              <span className="text-[10px] text-indigo-200/70 block">50% Sales Commission Split</span>
            </div>

            <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-500/30">
              <span className="text-[11px] text-amber-300 block font-semibold">Remaining Plot Liability</span>
              <span className="text-lg font-black text-amber-400">{formatINR(assigned.remainingEmiLiability)}</span>
              <span className="text-[10px] text-amber-200/70 block">Until 100% Wallet Payout</span>
            </div>
          </div>
        </div>
      )}

      {/* Sales Ledger & Commission History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Agent Plot Sales Ledger & Commission Records
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              History of customer plot sales and Free Plot Scheme sales processed under your Agent ID.
            </p>
          </div>

          <button
            onClick={() => setShowRecordSaleModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            Add Plot Sale Entry
          </button>
        </div>

        {currentAgent.salesLedger.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500/60 mx-auto" />
            <p className="text-slate-300 font-semibold text-sm">No plot sales recorded yet.</p>
            <p className="text-xs text-slate-500">Record your first plot sale to start earning commissions!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                  <th className="p-3">Sale ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Plot No</th>
                  <th className="p-3">Sale Type</th>
                  <th className="p-3">Sale Value</th>
                  <th className="p-3">Slab %</th>
                  <th className="p-3">Gross Comm</th>
                  <th className="p-3">50% EMI Offset</th>
                  <th className="p-3 text-right">Net Cash Wallet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {currentAgent.salesLedger.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-300">{sale.id}</td>
                    <td className="p-3 text-slate-400">{sale.date}</td>
                    <td className="p-3 font-semibold text-white">
                      {sale.customerName}
                      <span className="block text-[10px] text-slate-400">{sale.customerPhone}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{sale.plotNo}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sale.saleType === 'Risk Free Investor Plot'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {sale.saleType}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{formatINR(sale.saleValue)}</td>
                    <td className="p-3 font-black text-amber-400">{sale.slabPercentageUsed}%</td>
                    <td className="p-3 font-bold text-amber-300">{formatINR(sale.grossCommissionEarned)}</td>
                    <td className="p-3 font-bold text-indigo-400">{formatINR(sale.emiDeductionAmount)}</td>
                    <td className="p-3 text-right font-black text-emerald-400">{formatINR(sale.netWalletAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Wallet Withdrawals History Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Wallet Withdrawal Requests
          </h2>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            Request Payout
          </button>
        </div>

        {currentAgent.withdrawalHistory.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No withdrawal requests placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                  <th className="p-3">Request ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Account Details</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {currentAgent.withdrawalHistory.map((wd) => (
                  <tr key={wd.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-amber-300">{wd.id}</td>
                    <td className="p-3 text-slate-400">{wd.requestDate}</td>
                    <td className="p-3 font-black text-emerald-400">{formatINR(wd.amount)}</td>
                    <td className="p-3 font-semibold text-slate-300">{wd.paymentMethod}</td>
                    <td className="p-3 text-slate-400">{wd.accountDetails}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        wd.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : wd.status === 'Rejected'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {wd.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{wd.transactionId || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 24.5% Free Plot Scheme Portfolio Network */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                24.5% Scheme Network
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 6/5 Plot Target Tracking
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              24.5% फ्री प्लॉट स्कीम – Enrolled Investors Portfolio
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active investors enrolled under 24.5% Scheme, tenure completion, verified plot sales progress, and maturity status.
            </p>
          </div>

          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Managed Volume</span>
            <span className="text-lg font-black text-amber-400">
              {formatINR(
                loadEmiInvestorsFromStorage().reduce((acc, inv) => acc + inv.totalInvestment, 0)
              )}
            </span>
          </div>
        </div>

        {loadEmiInvestorsFromStorage().length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No 24.5% scheme investors enrolled yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                  <th className="p-3">Investor ID</th>
                  <th className="p-3">Name & Phone</th>
                  <th className="p-3">Tenure / EMI</th>
                  <th className="p-3">Total Investment</th>
                  <th className="p-3">EMI Paid Status</th>
                  <th className="p-3">Plot Sales (Target)</th>
                  <th className="p-3">Monthly Return</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loadEmiInvestorsFromStorage().map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-300">{inv.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{inv.investorName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inv.phone}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-200">{inv.tenureMonths} Months</div>
                      <div className="text-[10px] text-amber-400 font-mono">₹{formatINR(inv.monthlyEmi)}/mo</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-white">
                      ₹{formatINR(inv.totalInvestment)}
                    </td>
                    <td className="p-3">
                      <div className="text-emerald-400 font-mono font-bold">
                        {inv.paidInstallmentsCount} / {inv.tenureMonths} Paid
                      </div>
                      <div className="w-24 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (inv.paidInstallmentsCount / inv.tenureMonths) * 100)}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-black font-mono px-2 py-0.5 rounded text-[11px] ${
                            inv.plotsSoldCount >= inv.requiredPlotSales
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          }`}
                        >
                          {inv.plotsSoldCount} / {inv.requiredPlotSales} Plots
                        </span>
                        {inv.plotsSoldCount >= inv.requiredPlotSales && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-purple-300">
                      ₹{formatINR(inv.totalCurrentMonthlyReturn)}/mo
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'Disbursed'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : inv.status === 'Completed' || inv.status === 'Eligible'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record New Sale Modal */}
      {showRecordSaleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-black text-amber-300 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                Record Plot Sale Entry
              </h3>
              <button
                onClick={() => setShowRecordSaleModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSale} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Customer Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Customer Phone</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Plot Number</label>
                  <input
                    type="text"
                    required
                    value={salePlotNo}
                    onChange={(e) => setSalePlotNo(e.target.value)}
                    placeholder="e.g. B-108"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Sale Category</label>
                <select
                  value={saleCategory}
                  onChange={(e) => setSaleCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Standard Plot">Standard Plot (₹9,00,000 Base)</option>
                  <option value="Risk Free Investor Plot">Free Plot Scheme Sale (Tiered Rates)</option>
                </select>
              </div>

              {saleCategory === 'Risk Free Investor Plot' && (
                <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-amber-500/30">
                  <label className="text-xs font-semibold text-amber-300">Select Free Plot Scheme Rate Plan</label>
                  <select
                    value={selectedInvestorRate}
                    onChange={(e) => setSelectedInvestorRate(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {RISK_FREE_INVESTOR_RATES.map((p) => (
                      <option key={p.plan} value={p.rateSqft}>
                        {p.plan}: {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Notes / Details</label>
                <textarea
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="Additional sale remarks..."
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase py-3 rounded-xl shadow-lg shadow-amber-500/20"
              >
                Submit Plot Sale Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Request Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-8 max-w-md w-full text-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-black text-emerald-300 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                Wallet Withdrawal Request
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdrawalRequest} className="space-y-4">
              <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 text-xs">
                <span className="text-slate-300 block">Available Balance:</span>
                <span className="text-2xl font-black text-emerald-400">{formatINR(currentAgent.wallet.availableBalance)}</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  min={500}
                  max={currentAgent.wallet.availableBalance}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Payout Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="UPI">UPI ID (PhonePe/GooglePay/Paytm)</option>
                  <option value="Cheque">Account Payee Cheque</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Bank / Account Details</label>
                <input
                  type="text"
                  required
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder="e.g. HDFC A/C: 501001234567, IFSC: HDFC0001234"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase py-3 rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Submit Withdrawal Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
