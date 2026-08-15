import React, { useState, useEffect } from 'react';
import {
  PayoutEntity,
  PayoutUserCategory,
  PAYOUT_TENURE_OPTIONS,
  calculateDistributedPayout,
  generatePayoutsCsv,
} from '../../utils/payoutEngine';
import { formatINR } from '../../utils/calculators';
import { jsPDF } from 'jspdf';
import {
  DollarSign,
  Calendar,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Send,
  Sliders,
  TrendingUp,
  Building2,
  Users,
  Check,
  AlertCircle
} from 'lucide-react';

interface PayoutSummary {
  totalPayoutLiability: number;
  totalDisbursed: number;
  totalRemainingLiability: number;
  totalMonthlyOutflow: number;
  activeTenuresCount: number;
  pendingTenuresCount: number;
}

export const AdminPayoutManager: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutEntity[]>([]);
  const [summary, setSummary] = useState<PayoutSummary>({
    totalPayoutLiability: 10620000,
    totalDisbursed: 2326334,
    totalRemainingLiability: 8293666,
    totalMonthlyOutflow: 273889,
    activeTenuresCount: 4,
    pendingTenuresCount: 1,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUserType, setSelectedUserType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'table' | 'audit'>('table');

  // Modal / Selected Item for deep inspection
  const [selectedPayout, setSelectedPayout] = useState<PayoutEntity | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Fetch payouts from server
  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payouts');
      if (res.ok) {
        const data = await res.json();
        if (data.payouts) {
          setPayouts(data.payouts);
        }
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.warn('Using client-side state for Payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  // Update Tenure in Real-Time
  const handleUpdateTenure = async (payoutId: string, newTenure: number) => {
    try {
      const res = await fetch(`/api/payouts/${payoutId}/tenure`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emiTenureMonths: newTenure, adminUser: 'Director Desk (Admin)' }),
      });

      if (res.ok) {
        const data = await res.json();
        setActionSuccessMsg(`Updated tenure to ${newTenure} Months for ${data.payout.userName}`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        fetchPayouts();
      } else {
        // Fallback local update
        setPayouts((prev) =>
          prev.map((p) => {
            if (p.id === payoutId) {
              const monthly = newTenure > 0 ? Math.round(p.totalPayout / newTenure) : 0;
              return {
                ...p,
                emiTenureMonths: newTenure,
                monthlyPayout: monthly,
                status: newTenure > 0 ? 'Active Distribution' : 'Pending Tenure Selection',
              };
            }
            return p;
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Disburse Monthly Payout
  const handleDisburseMonthly = async (payoutId: string) => {
    try {
      const res = await fetch(`/api/payouts/${payoutId}/disburse-monthly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUser: 'Director Desk (Admin)' }),
      });

      if (res.ok) {
        const data = await res.json();
        setActionSuccessMsg(`Monthly installment disbursed for ${data.payout.userName}!`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        fetchPayouts();
      } else {
        // Fallback local update
        setPayouts((prev) =>
          prev.map((p) => {
            if (p.id === payoutId && p.remainingBalance > 0) {
              const disburseAmt = Math.min(p.monthlyPayout, p.remainingBalance);
              const newDisbursed = p.totalDisbursed + disburseAmt;
              const newMonths = p.monthsDisbursed + 1;
              const newBal = Math.max(0, p.totalPayout - newDisbursed);
              return {
                ...p,
                monthsDisbursed: newMonths,
                totalDisbursed: newDisbursed,
                remainingBalance: newBal,
                status: newBal === 0 ? 'Fully Disbursed' : 'Active Distribution',
                lastDisbursedDate: new Date().toISOString().split('T')[0],
              };
            }
            return p;
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const csvData = generatePayoutsCsv(payouts);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `VPM_EMI_Tenure_Payout_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF Report
  const handleExportPdf = () => {
    const doc = new jsPDF('landscape');

    doc.setFontSize(16);
    doc.setTextColor(26, 35, 126);
    doc.text('VIGYA PAURUSH MILESTONE PVT LTD', 14, 15);

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('EMI Tenure-Based Payout Distribution & Financial Audit Ledger', 14, 22);
    doc.text(`Generated On: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);

    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);

    let startY = 38;
    // Table Header
    doc.setFillColor(30, 41, 59);
    doc.setTextColor(255, 255, 255);
    doc.rect(14, startY, 268, 8, 'F');
    doc.text('ID', 16, startY + 5.5);
    doc.text('User Name', 38, startY + 5.5);
    doc.text('Category', 85, startY + 5.5);
    doc.text('Total Payout', 125, startY + 5.5);
    doc.text('Tenure', 160, startY + 5.5);
    doc.text('Monthly Payout', 185, startY + 5.5);
    doc.text('Disbursed', 220, startY + 5.5);
    doc.text('Remaining Bal', 250, startY + 5.5);

    startY += 8;
    doc.setTextColor(15, 23, 42);

    payouts.forEach((p, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, startY, 268, 7, 'F');
      }
      doc.text(p.id, 16, startY + 5);
      doc.text(p.userName.substring(0, 22), 38, startY + 5);
      doc.text(p.userType, 85, startY + 5);
      doc.text(`Rs. ${p.totalPayout.toLocaleString('en-IN')}`, 125, startY + 5);
      doc.text(p.emiTenureMonths > 0 ? `${p.emiTenureMonths} Months` : 'None', 160, startY + 5);
      doc.text(p.emiTenureMonths > 0 ? `Rs. ${p.monthlyPayout.toLocaleString('en-IN')}/mo` : 'Hidden', 185, startY + 5);
      doc.text(`Rs. ${p.totalDisbursed.toLocaleString('en-IN')}`, 220, startY + 5);
      doc.text(`Rs. ${p.remainingBalance.toLocaleString('en-IN')}`, 250, startY + 5);

      startY += 7;
      if (startY > 185) {
        doc.addPage();
        startY = 20;
      }
    });

    doc.save(`VPM_Payout_Distribution_Report_${Date.now()}.pdf`);
  };

  // Filtered list
  const filteredPayouts = payouts.filter((p) => {
    const matchesType = selectedUserType === 'all' || p.userType.toLowerCase() === selectedUserType.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userPhone.includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.plotNo && p.plotNo.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6" id="admin-payout-manager-container">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <DollarSign className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                EMI Tenure-Based Payout Distribution Management
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Calculate, disburse, and track distributed monthly payouts across Customers, Agents, Investors & Risk-Free Investors based on selected EMI tenure (12 to 120 Months).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchPayouts}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export Excel (CSV)
            </button>
            <button
              onClick={handleExportPdf}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-950 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Export PDF
            </button>
          </div>
        </div>

        {actionSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {actionSuccessMsg}
          </div>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Payout Liability
          </span>
          <p className="text-xl sm:text-2xl font-black text-white font-serif">
            {formatINR(summary.totalPayoutLiability)}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Across all 4 stakeholder categories
          </span>
        </div>

        <div className="bg-slate-900/90 border border-indigo-800/40 rounded-2xl p-4 shadow-md bg-gradient-to-br from-slate-900 to-indigo-950/30">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">
            Monthly Distributed Outflow
          </span>
          <p className="text-xl sm:text-2xl font-black text-indigo-400 font-serif">
            {formatINR(summary.totalMonthlyOutflow)}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">/ mo</span>
          </p>
          <span className="text-[10px] text-indigo-300/80 mt-1 block">
            Sum of all active EMI tenure splits
          </span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-800/40 rounded-2xl p-4 shadow-md bg-gradient-to-br from-slate-900 to-emerald-950/30">
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block mb-1">
            Total Disbursed to Date
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-serif">
            {formatINR(summary.totalDisbursed)}
          </p>
          <span className="text-[10px] text-emerald-300/80 mt-1 block">
            Completed monthly installment credits
          </span>
        </div>

        <div className="bg-slate-900/90 border border-amber-800/40 rounded-2xl p-4 shadow-md bg-gradient-to-br from-slate-900 to-amber-950/30">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
            Remaining Payout Balance
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-serif">
            {formatINR(summary.totalRemainingLiability)}
          </p>
          <span className="text-[10px] text-amber-300/80 mt-1 block">
            Pending distribution liability
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, phone, plot, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* User Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Category:</span>
            <select
              value={selectedUserType}
              onChange={(e) => setSelectedUserType(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="all">All Stakeholders</option>
              <option value="customer">Customers</option>
              <option value="agent">Agents</option>
              <option value="investor">Investors</option>
              <option value="risk-free investor">Risk-Free Investors</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Active Distribution">Active Distribution</option>
              <option value="Pending Tenure Selection">Pending Tenure</option>
              <option value="Fully Disbursed">Fully Disbursed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-extrabold text-white">
              Stakeholder Payout Ledger & Dynamic Tenure Configurator
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Showing {filteredPayouts.length} of {payouts.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-800 tracking-wider">
              <tr>
                <th className="py-3 px-4">User / Stakeholder</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Total Payout</th>
                <th className="py-3 px-4">EMI Tenure Selection</th>
                <th className="py-3 px-3 text-right">Monthly Distributed Payout</th>
                <th className="py-3 px-3 text-center">Progress (Disbursed)</th>
                <th className="py-3 px-3 text-right">Remaining Bal</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Disburse Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayouts.length > 0 ? (
                filteredPayouts.map((p) => {
                  const percentDone =
                    p.totalPayout > 0 ? Math.min(100, Math.round((p.totalDisbursed / p.totalPayout) * 100)) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Stakeholder Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{p.userName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>+91 {p.userPhone}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 font-mono text-[10px]">{p.id}</span>
                        </div>
                        {p.plotNo && (
                          <div className="text-[10px] text-indigo-300 mt-0.5">
                            Plot: {p.plotNo} ({p.projectName})
                          </div>
                        )}
                      </td>

                      {/* User Type Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                            p.userType === 'Customer'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : p.userType === 'Agent'
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : p.userType === 'Investor'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          }`}
                        >
                          {p.userType}
                        </span>
                      </td>

                      {/* Total Payout */}
                      <td className="py-3.5 px-3 text-right">
                        <strong className="text-white font-black font-serif text-sm">
                          {formatINR(p.totalPayout)}
                        </strong>
                      </td>

                      {/* EMI Tenure Selector (Inline Interactive) */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <select
                          value={p.emiTenureMonths}
                          onChange={(e) => handleUpdateTenure(p.id, Number(e.target.value))}
                          className={`w-full bg-slate-950 border text-xs font-bold rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-none transition-all ${
                            p.emiTenureMonths > 0
                              ? 'border-indigo-500/50 text-white focus:border-indigo-400'
                              : 'border-amber-500/60 text-amber-400 bg-amber-950/20'
                          }`}
                        >
                          <option value={0}>-- No Tenure (Hide Payout) --</option>
                          {PAYOUT_TENURE_OPTIONS.map((opt) => (
                            <option key={opt.months} value={opt.months}>
                              {opt.label} ({opt.months}M)
                            </option>
                          ))}
                        </select>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {p.emiTenureMonths > 0 ? `${p.emiTenureMonths} Equal Monthly Splits` : 'Payout currently hidden'}
                        </span>
                      </td>

                      {/* Monthly Distributed Payout */}
                      <td className="py-3.5 px-3 text-right">
                        {p.emiTenureMonths > 0 ? (
                          <div>
                            <span className="font-black text-emerald-400 font-serif text-sm">
                              {formatINR(p.monthlyPayout)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">/ month</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">
                            Hidden (Select Tenure)
                          </span>
                        )}
                      </td>

                      {/* Progress Bar & Disbursed Months */}
                      <td className="py-3.5 px-3 text-center min-w-[140px]">
                        <div className="text-[11px] font-bold text-slate-200 mb-1">
                          {p.monthsDisbursed} / {p.emiTenureMonths > 0 ? p.emiTenureMonths : '—'} Months
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${percentDone}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {formatINR(p.totalDisbursed)} ({percentDone}%)
                        </span>
                      </td>

                      {/* Remaining Balance */}
                      <td className="py-3.5 px-3 text-right">
                        <strong className="text-amber-400 font-bold font-serif">
                          {formatINR(p.remainingBalance)}
                        </strong>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.status === 'Active Distribution'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : p.status === 'Fully Disbursed'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Disburse Next Month Button & Schedule Preview */}
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedPayout(p);
                            setShowScheduleModal(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
                          title="View Schedule"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>

                        {p.emiTenureMonths > 0 && p.remainingBalance > 0 && (
                          <button
                            onClick={() => handleDisburseMonthly(p.id)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-md shadow-emerald-950 transition-all cursor-pointer"
                            title="Disburse Next Month"
                          >
                            <Send className="w-3 h-3" />
                            Disburse
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No payout records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Detail Modal */}
      {showScheduleModal && selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Payout Distribution Schedule: {selectedPayout.userName}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Category: {selectedPayout.userType} • Payout ID: {selectedPayout.id}
                </p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Total Payout</span>
                  <strong className="text-white text-base font-serif font-black">
                    {formatINR(selectedPayout.totalPayout)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">EMI Tenure</span>
                  <strong className="text-indigo-400 text-base font-black">
                    {selectedPayout.emiTenureMonths > 0
                      ? `${selectedPayout.emiTenureMonths} Months (${(selectedPayout.emiTenureMonths / 12).toFixed(1)} Yrs)`
                      : 'No Tenure Selected'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Monthly Payout</span>
                  <strong className="text-emerald-400 text-base font-serif font-black">
                    {selectedPayout.emiTenureMonths > 0 ? formatINR(selectedPayout.monthlyPayout) : '—'}
                  </strong>
                </div>
              </div>

              {selectedPayout.emiTenureMonths > 0 ? (
                <div>
                  <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Month-by-Month Installment Disbursement Plan
                  </h5>
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                        <tr>
                          <th className="py-2 px-3">Month</th>
                          <th className="py-2 px-3 text-right">Disbursement (INR)</th>
                          <th className="py-2 px-3 text-right">Cumulative</th>
                          <th className="py-2 px-3 text-right">Remaining Balance</th>
                          <th className="py-2 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
                        {calculateDistributedPayout({
                          totalPayout: selectedPayout.totalPayout,
                          emiTenureMonths: selectedPayout.emiTenureMonths,
                          userCategory: selectedPayout.userType,
                        }).schedule.map((sch) => {
                          const isAlreadyDisbursed = sch.monthIndex <= selectedPayout.monthsDisbursed;
                          return (
                            <tr
                              key={sch.monthIndex}
                              className={isAlreadyDisbursed ? 'bg-emerald-950/20' : 'hover:bg-slate-800/30'}
                            >
                              <td className="py-2 px-3 font-semibold text-white">Month {sch.monthIndex}</td>
                              <td className="py-2 px-3 text-right text-emerald-400 font-bold">
                                {formatINR(sch.monthlyPayout)}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-300">{formatINR(sch.cumulativePaid)}</td>
                              <td className="py-2 px-3 text-right text-slate-400">{formatINR(sch.remainingBalance)}</td>
                              <td className="py-2 px-3 text-center">
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                    isAlreadyDisbursed
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {isAlreadyDisbursed ? 'Disbursed ✓' : 'Upcoming'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-300 text-center">
                  Please assign an EMI tenure to this user above to generate the full distribution schedule.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
