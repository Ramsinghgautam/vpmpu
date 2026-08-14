import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Percent, 
  PlusCircle, 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Building, 
  FileText, 
  RefreshCw, 
  ExternalLink,
  Award,
  Download,
  Check
} from 'lucide-react';
import { RiskFreeInvestorRecord, RiskFreeInvestorSale, RiskFreeSystemSummary } from '../../types';
import { 
  INITIAL_RISK_FREE_INVESTORS, 
  RISK_FREE_INVESTOR_PLANS,
  computeSystemSummary, 
  buildInvestorPlan,
  STANDARD_CUSTOMER_COMMISSION,
  RISK_FREE_HINDI_NOTE
} from '../../data/riskFreePlansData';

export const AdminRiskFreeInvestorManager: React.FC = () => {
  const [investors, setInvestors] = useState<RiskFreeInvestorRecord[]>(() => {
    return INITIAL_RISK_FREE_INVESTORS;
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedInvestorId, setExpandedInvestorId] = useState<string | null>('RFI-1001');

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showSaleModal, setShowSaleModal] = useState<boolean>(false);
  const [selectedInvestorForSale, setSelectedInvestorForSale] = useState<RiskFreeInvestorRecord | null>(null);

  // Add Investor Form State
  const [newInvestorName, setNewInvestorName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [selectedPurchaseRate, setSelectedPurchaseRate] = useState<number>(1450);
  const [selectedPlotSize, setSelectedPlotSize] = useState<number>(900);
  const [selectedCommissionRate, setSelectedCommissionRate] = useState<number>(22.5);

  // Add Sale Form State
  const [saleProject, setSaleProject] = useState<string>('Greenfield Heights Township');
  const [salePlotNo, setSalePlotNo] = useState<string>('');
  const [saleValue, setSaleValue] = useState<number>(1800000);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');

  // Update commission when rate option changes in Add Modal
  const handleRateChange = (rate: number) => {
    setSelectedPurchaseRate(rate);
    const matched = RISK_FREE_INVESTOR_PLANS.find(p => p.purchaseRate === rate);
    if (matched) {
      setSelectedCommissionRate(matched.commissionRate);
    }
  };

  // Financial summary
  const summary: RiskFreeSystemSummary = computeSystemSummary(investors);

  // Filtered Investors
  const filteredInvestors = investors.filter(inv => {
    const matchesSearch = 
      inv.investorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.phone.includes(searchTerm);
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && !inv.isRecovered;
    if (statusFilter === 'recovered') return matchesSearch && inv.isRecovered;
    return matchesSearch;
  });

  // Handle Create Investor
  const handleCreateInvestor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvestorName || !newPhone) return;

    const plan = buildInvestorPlan(selectedPurchaseRate, selectedCommissionRate, selectedPlotSize);

    const newRecord: RiskFreeInvestorRecord = {
      id: `RFI-${(1001 + investors.length).toString()}`,
      userId: `USR-INVESTOR-${(101 + investors.length).toString()}`,
      investorName: newInvestorName,
      phone: newPhone,
      email: newEmail || 'investor@vpmrealestate.com',
      kycStatus: 'Verified',
      purchaseRate: selectedPurchaseRate,
      plotSizeSqft: selectedPlotSize,
      commissionRate: selectedCommissionRate,
      interestRate: selectedCommissionRate,
      principalAmount: plan.principalAmount,
      interestAmount: plan.interestAmount,
      recoveryTarget: plan.recoveryTarget,
      totalSalesValue: 0,
      totalCommissionEarned: 0,
      remainingRecoveryBalance: plan.recoveryTarget,
      recoveryPercentage: 0,
      isRecovered: false,
      convertedToStandardCustomer: false,
      status: 'Active',
      enrolledDate: new Date().toISOString().split('T')[0],
      salesLedger: []
    };

    setInvestors([newRecord, ...investors]);
    setShowAddModal(false);
    setNewInvestorName('');
    setNewPhone('');
    setNewEmail('');
  };

  // Handle Add Plot Sale
  const handleAddSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestorForSale || !salePlotNo || !saleValue) return;

    const inv = selectedInvestorForSale;
    const rateUsed = inv.isRecovered ? STANDARD_CUSTOMER_COMMISSION : inv.commissionRate;
    const commEarned = Math.round(saleValue * (rateUsed / 100));

    const newTotalSales = inv.totalSalesValue + saleValue;
    const newTotalComm = inv.totalCommissionEarned + commEarned;
    const newRemainingBalance = Math.max(0, inv.recoveryTarget - newTotalComm);
    const newIsRecovered = newTotalComm >= inv.recoveryTarget;

    const newSaleItem: RiskFreeInvestorSale = {
      id: `SALE-${Date.now().toString().slice(-4)}`,
      investorId: inv.id,
      date: new Date().toISOString().split('T')[0],
      plotNo: salePlotNo,
      projectName: saleProject,
      saleValue: saleValue,
      commissionRateUsed: rateUsed,
      commissionEarned: commEarned,
      remainingRecoveryBalanceAfter: newRemainingBalance,
      buyerName: buyerName || 'Direct Customer',
      buyerPhone: buyerPhone || 'N/A',
      notes: newIsRecovered 
        ? 'Target achieved! Auto-converted to standard customer terms (15.5%)' 
        : `Sale logged by Admin at ${rateUsed}% comm`
    };

    const updatedList = investors.map(item => {
      if (item.id === inv.id) {
        return {
          ...item,
          totalSalesValue: newTotalSales,
          totalCommissionEarned: newTotalComm,
          remainingRecoveryBalance: newRemainingBalance,
          recoveryPercentage: Math.min(100, Math.round((newTotalComm / item.recoveryTarget) * 10000) / 100),
          isRecovered: newIsRecovered,
          convertedToStandardCustomer: newIsRecovered,
          status: newIsRecovered ? ('Recovered' as const) : ('Active' as const),
          salesLedger: [newSaleItem, ...item.salesLedger]
        };
      }
      return item;
    });

    setInvestors(updatedList);
    setShowSaleModal(false);
    setSalePlotNo('');
    setBuyerName('');
    setBuyerPhone('');
  };

  // Export CSV
  const handleExportCSV = () => {
    let csv = 'Investor ID,Name,Phone,Email,Purchase Rate,Plot SqFt,Principal Amount,Interest Amount,Recovery Target,Total Sales,Comm Earned,Remaining Balance,Recovery Pct,Status\n';
    
    investors.forEach(inv => {
      csv += `"${inv.id}","${inv.investorName}","${inv.phone}","${inv.email}",${inv.purchaseRate},${inv.plotSizeSqft},${inv.principalAmount},${inv.interestAmount},${inv.recoveryTarget},${inv.totalSalesValue},${inv.totalCommissionEarned},${inv.remainingRecoveryBalance},${inv.recoveryPercentage}%,"${inv.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Risk_Free_Investors_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Top Banner & Header Actions */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Free Plot Scheme Control Center</h2>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Fintech Ledger Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Manage investor tiers (16.5% - 32%), track real-time commission recovery deductions, log plot sales, and view liability reports.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-400/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Investor</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Investors</span>
          <div className="text-xl font-black text-white">{summary.totalInvestors}</div>
          <span className="text-[10px] text-emerald-400 font-bold">{summary.activeInvestors} Active / {summary.completedInvestors} Recovered</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Principal Invested</span>
          <div className="text-lg font-black text-white">₹{(summary.totalPrincipalInvested / 100000).toFixed(2)} Lac</div>
          <span className="text-[10px] text-slate-500">Equity Principal Capital</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Interest Liability</span>
          <div className="text-lg font-black text-amber-400">₹{(summary.totalInterestLiability / 100000).toFixed(2)} Lac</div>
          <span className="text-[10px] text-slate-500">Guaranteed Return Liability</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Recovery Target</span>
          <div className="text-lg font-black text-amber-300">₹{(summary.totalRecoveryTargetLiability / 100000).toFixed(2)} Lac</div>
          <span className="text-[10px] text-slate-500">Principal + Interest</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Comm. Paid</span>
          <div className="text-lg font-black text-emerald-400">₹{(summary.totalCommissionPaid / 100000).toFixed(2)} Lac</div>
          <span className="text-[10px] text-emerald-400 font-bold">Deducted from target</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Remaining Liability</span>
          <div className="text-lg font-black text-sky-400">₹{(summary.remainingLiability / 100000).toFixed(2)} Lac</div>
          <span className="text-[10px] text-slate-500">Pending recovery</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search investor name, ID, phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Investors ({investors.length})</option>
            <option value="active">Active Recovery ({summary.activeInvestors})</option>
            <option value="recovered">Recovered / Completed ({summary.completedInvestors})</option>
          </select>
        </div>
      </div>

      {/* Investor Records List */}
      <div className="space-y-4">
        {filteredInvestors.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs bg-slate-900 rounded-3xl border border-slate-800">
            No investors match the current search or status filter.
          </div>
        ) : (
          filteredInvestors.map((inv) => {
            const isExpanded = expandedInvestorId === inv.id;

            return (
              <div 
                key={inv.id} 
                className={`rounded-3xl border transition-all overflow-hidden ${
                  inv.isRecovered 
                    ? 'bg-slate-900/90 border-emerald-500/40' 
                    : 'bg-slate-900 border-slate-800 hover:border-amber-500/30'
                }`}
              >
                {/* Main Card Header Row */}
                <div 
                  onClick={() => setExpandedInvestorId(isExpanded ? null : inv.id)}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 ${
                      inv.isRecovered ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {inv.isRecovered ? <CheckCircle2 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-white">{inv.investorName}</h3>
                        <span className="font-mono text-xs text-amber-400 font-bold">({inv.id})</span>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          inv.isRecovered 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {inv.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span>Phone: <strong className="text-slate-200">{inv.phone}</strong></span>
                        <span>Plan: <strong className="text-amber-300">₹{inv.purchaseRate}/sqft ({inv.commissionRate}% Comm.)</strong></span>
                        <span>Size: <strong className="text-slate-200">{inv.plotSizeSqft} SqFt</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Quick Metrics */}
                  <div className="flex items-center gap-4 lg:gap-6 text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Recovery Target</span>
                      <span className="font-black text-amber-400 text-sm">₹{inv.recoveryTarget.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Comm. Paid</span>
                      <span className="font-black text-emerald-400 text-sm">₹{inv.totalCommissionEarned.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Remaining</span>
                      <span className="font-black text-sky-400 text-sm">₹{inv.remainingRecoveryBalance.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvestorForSale(inv);
                          setShowSaleModal(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Log Sale</span>
                      </button>

                      <div className="p-2 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar Row */}
                <div className="px-5 pb-4">
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-700 ${
                        inv.isRecovered ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, inv.recoveryPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Expanded Ledger & Details Drawer */}
                {isExpanded && (
                  <div className="p-6 bg-slate-950 border-t border-slate-800 space-y-5 text-xs">
                    
                    {/* Status Alert */}
                    {inv.isRecovered && (
                      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>
                          <strong>Recovery Target Met!</strong> This investor has successfully recovered their full principal + interest target of ₹{inv.recoveryTarget.toLocaleString('en-IN')}. Standard customer terms ({STANDARD_CUSTOMER_COMMISSION}%) apply to subsequent sales.
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Principal Amount</span>
                        <span className="font-extrabold text-white text-sm">₹{inv.principalAmount.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Interest Amount ({inv.interestRate}%)</span>
                        <span className="font-extrabold text-amber-400 text-sm">+₹{inv.interestAmount.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Plot Sales Value</span>
                        <span className="font-extrabold text-white text-sm">₹{inv.totalSalesValue.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Recovery Progress</span>
                        <span className="font-extrabold text-emerald-400 text-sm">{inv.recoveryPercentage}% Complete</span>
                      </div>
                    </div>

                    {/* Sales Ledger Table */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-300 uppercase text-[11px] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>Sales Ledger & Deduction Audit Trail</span>
                      </h4>

                      {inv.salesLedger.length === 0 ? (
                        <div className="py-6 text-center text-slate-500 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
                          No plot sales recorded for this investor yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                                <th className="p-3">Sale ID</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Project / Plot</th>
                                <th className="p-3">Buyer Details</th>
                                <th className="p-3 text-right">Sale Amount</th>
                                <th className="p-3 text-right">Comm. Rate</th>
                                <th className="p-3 text-right">Comm. Earned</th>
                                <th className="p-3 text-right">Remaining Liability</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                              {inv.salesLedger.map((sale) => (
                                <tr key={sale.id} className="hover:bg-slate-800/40">
                                  <td className="p-3 font-mono text-[11px] text-slate-400">{sale.id}</td>
                                  <td className="p-3 text-slate-400">{sale.date}</td>
                                  <td className="p-3">
                                    <div className="font-bold text-white">{sale.plotNo}</div>
                                    <div className="text-[10px] text-slate-400">{sale.projectName}</div>
                                  </td>
                                  <td className="p-3">
                                    <div>{sale.buyerName}</div>
                                    <div className="text-[10px] text-slate-500">{sale.buyerPhone}</div>
                                  </td>
                                  <td className="p-3 text-right font-bold text-white">₹{sale.saleValue.toLocaleString('en-IN')}</td>
                                  <td className="p-3 text-right font-bold text-emerald-400">{sale.commissionRateUsed}%</td>
                                  <td className="p-3 text-right font-black text-emerald-400">+₹{sale.commissionEarned.toLocaleString('en-IN')}</td>
                                  <td className="p-3 text-right font-bold text-amber-300">₹{sale.remainingRecoveryBalanceAfter.toLocaleString('en-IN')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal 1: Add New Investor */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Add New Free Plot Scheme Investor</h3>
                  <p className="text-xs text-slate-400">Assign investor plan tier & calculate liability targets</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvestor} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Investor Full Name *</label>
                <input
                  type="text"
                  required
                  value={newInvestorName}
                  onChange={(e) => setNewInvestorName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="10 digit phone"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Select Purchase Rate Slab (₹/sqft) *</label>
                <select
                  value={selectedPurchaseRate}
                  onChange={(e) => handleRateChange(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-bold"
                >
                  {RISK_FREE_INVESTOR_PLANS.map(p => (
                    <option key={p.purchaseRate} value={p.purchaseRate}>
                      ₹{p.purchaseRate}/sqft — Comm Rate: {p.commissionRate}% ({p.badgeLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Plot Size (SqFt)</label>
                  <input
                    type="number"
                    value={selectedPlotSize}
                    onChange={(e) => setSelectedPlotSize(parseInt(e.target.value) || 900)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={selectedCommissionRate}
                    onChange={(e) => setSelectedCommissionRate(parseFloat(e.target.value) || 16.5)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-bold text-emerald-400"
                  />
                </div>
              </div>

              {/* Calculated Summary Preview */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-300">
                  <span>Principal Investment:</span>
                  <span className="font-bold text-white">₹{(selectedPurchaseRate * selectedPlotSize).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-amber-400 font-bold">
                  <span>Guaranteed Interest ({selectedCommissionRate}%):</span>
                  <span>+₹{Math.round((selectedPurchaseRate * selectedPlotSize) * (selectedCommissionRate / 100)).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-amber-300 font-black pt-1 border-t border-slate-800 text-xs">
                  <span>Recovery Target Liability:</span>
                  <span>₹{Math.round((selectedPurchaseRate * selectedPlotSize) * (1 + selectedCommissionRate / 100)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-400 text-slate-950 font-black hover:bg-amber-300 shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Investor Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Admin Log Plot Sale */}
      {showSaleModal && selectedInvestorForSale && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Log Sale for {selectedInvestorForSale.investorName}</h3>
                  <p className="text-xs text-amber-400 font-bold">ID: {selectedInvestorForSale.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSaleModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSaleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Project Layout Name *</label>
                <select
                  value={saleProject}
                  onChange={(e) => setSaleProject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Greenfield Heights Township">Greenfield Heights Township</option>
                  <option value="Ayodhya Divine Residency">Ayodhya Divine Residency</option>
                  <option value="Phaphamau Prime Enclave">Phaphamau Prime Enclave</option>
                  <option value="Naini Eco City Layout">Naini Eco City Layout</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Plot Number *</label>
                <input
                  type="text"
                  required
                  value={salePlotNo}
                  onChange={(e) => setSalePlotNo(e.target.value)}
                  placeholder="e.g. A-105"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Plot Sale Total Amount (₹) *</label>
                <input
                  type="number"
                  required
                  step="50000"
                  value={saleValue}
                  onChange={(e) => setSaleValue(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Buyer Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Buyer Mobile</label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="10 digit phone"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSaleModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-400 text-slate-950 font-black hover:bg-amber-300 shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Deduct Comm. & Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
