import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  Printer,
  DollarSign,
  AlertCircle,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { EmiInvestorRecord } from '../../../types';
import { formatINR } from '../../../utils/calculators';

interface AdminEmiLedgersViewProps {
  investors: EmiInvestorRecord[];
  isDarkMode?: boolean;
}

export const AdminEmiLedgersView: React.FC<AdminEmiLedgersViewProps> = ({
  investors,
  isDarkMode = false,
}) => {
  const [activeLedgerType, setActiveLedgerType] = useState<'collection' | 'payout'>('collection');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<string>('ALL');

  // Build Collection Ledger from all investors' paid/due installments
  const collectionLedger = investors.flatMap((inv) =>
    inv.emiLedger.map((item) => ({
      id: `${inv.id}-${item.installmentNo}`,
      investorId: inv.id,
      investorName: inv.investorName,
      phone: inv.phone,
      tenureMonths: inv.tenureMonths,
      installmentNo: item.installmentNo,
      dueDate: item.dueDate,
      paidDate: item.paidDate,
      amount: item.amount,
      status: item.status,
      paymentMode: item.paymentMode || 'UPI / Bank Transfer',
      txnRef: item.txnRef || 'N/A',
      receiptNumber: item.receiptNumber || 'N/A',
    }))
  );

  // Build Payout Ledger
  const payoutLedger = investors.map((inv) => ({
    id: `PAY-${inv.id}`,
    investorId: inv.id,
    investorName: inv.investorName,
    scheme: `${inv.interestRatePercent || 24.5}% Free Plot (${inv.tenureMonths}M)`,
    eligiblePlotSales: inv.plotsSoldCount,
    requiredPlotSales: inv.requiredPlotSales,
    monthlyReturn: inv.monthlyReturn,
    monthlyBonusAmount: inv.monthlyBonusAmount,
    totalCurrentMonthlyReturn: inv.totalCurrentMonthlyReturn,
    totalExpectedReturn: inv.totalExpectedReturn,
    isPayoutEligible: inv.isPayoutEligible,
    isPayoutDisbursed: inv.isPayoutDisbursed,
    payoutDisbursedAmount: inv.payoutDisbursedAmount || (inv.isPayoutDisbursed ? inv.totalExpectedReturn : 0),
    payoutDisbursedDate: inv.payoutDisbursedDate || 'Pending',
    payoutTxnReference: inv.payoutTxnReference || 'N/A',
    payoutMode: inv.payoutMode || 'Direct RTGS/NEFT',
    approvalStatus: inv.isPayoutDisbursed
      ? 'Disbursed'
      : inv.isPayoutEligible
      ? 'Approved / Ready'
      : 'In Progress (Target Pending)',
  }));

  // Filtering
  const filteredCollections = collectionLedger.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.investorName.toLowerCase().includes(q) ||
      item.investorId.toLowerCase().includes(q) ||
      item.txnRef.toLowerCase().includes(q) ||
      item.receiptNumber.toLowerCase().includes(q);
    const matchesMode = filterMode === 'ALL' || item.status === filterMode;
    return matchesSearch && matchesMode;
  });

  const filteredPayouts = payoutLedger.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.investorName.toLowerCase().includes(q) ||
      item.investorId.toLowerCase().includes(q) ||
      item.payoutTxnReference.toLowerCase().includes(q);
    const matchesMode =
      filterMode === 'ALL' ||
      (filterMode === 'Disbursed' && item.isPayoutDisbursed) ||
      (filterMode === 'Approved / Ready' && item.isPayoutEligible && !item.isPayoutDisbursed) ||
      (filterMode === 'In Progress' && !item.isPayoutEligible);
    return matchesSearch && matchesMode;
  });

  const exportCSV = () => {
    if (activeLedgerType === 'collection') {
      const headers = ['Installment ID', 'Investor ID', 'Investor Name', 'Installment #', 'Due Date', 'Paid Date', 'Amount (INR)', 'Payment Mode', 'Transaction Reference', 'Receipt #', 'Status'];
      const rows = filteredCollections.map((c) => [
        c.id,
        c.investorId,
        c.investorName,
        c.installmentNo,
        c.dueDate,
        c.paidDate || 'N/A',
        c.amount,
        c.paymentMode,
        c.txnRef,
        c.receiptNumber,
        c.status,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `EMI_Collection_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Payout ID', 'Investor ID', 'Investor Name', 'Scheme', 'Verified Plot Sales', 'Req Plots', 'Monthly Base Return', 'Monthly Bonus', 'Total Monthly Return', 'Total Scheme Return', 'Approval Status', 'Disbursed Date', 'Txn Ref'];
      const rows = filteredPayouts.map((p) => [
        p.id,
        p.investorId,
        p.investorName,
        p.scheme,
        p.eligiblePlotSales,
        p.requiredPlotSales,
        p.monthlyReturn,
        p.monthlyBonusAmount,
        p.totalCurrentMonthlyReturn,
        p.totalExpectedReturn,
        p.approvalStatus,
        p.payoutDisbursedDate,
        p.payoutTxnReference,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Payout_Disbursal_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Header */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
                Financial Accounting Ledgers
              </span>
              <span className="text-xs text-slate-400">20.5% Free Plot Scheme</span>
            </div>
            <h2 className={`text-xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              EMI Collection & Payout Disbursement Ledgers
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Complete immutable accounting trail of all incoming installment transactions and investor return payouts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export {activeLedgerType === 'collection' ? 'Collections' : 'Payouts'} CSV
            </button>
          </div>
        </div>

        {/* Ledger Toggle Buttons */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              setActiveLedgerType('collection');
              setFilterMode('ALL');
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeLedgerType === 'collection'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : isDarkMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" /> EMI Collection Ledger ({collectionLedger.length})
          </button>
          <button
            onClick={() => {
              setActiveLedgerType('payout');
              setFilterMode('ALL');
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeLedgerType === 'payout'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : isDarkMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> Investor Payout Ledger ({payoutLedger.length})
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeLedgerType === 'collection'
                  ? 'Search by Investor Name, ID, UTR Txn Ref, Receipt #...'
                  : 'Search by Investor Name, ID, Txn Ref...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            {activeLedgerType === 'collection' ? (
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className={`py-2 px-3 rounded-xl text-xs border font-semibold ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="ALL">All Installments</option>
                <option value="Paid">Paid</option>
                <option value="Due">Due</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            ) : (
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className={`py-2 px-3 rounded-xl text-xs border font-semibold ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="ALL">All Payout Statuses</option>
                <option value="Disbursed">Disbursed</option>
                <option value="Approved / Ready">Approved / Ready</option>
                <option value="In Progress">In Progress</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Table Rendering */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        {activeLedgerType === 'collection' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="py-3 px-3">Installment #</th>
                  <th className="py-3 px-3">Investor Details</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Paid Date</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Payment Mode</th>
                  <th className="py-3 px-3">Transaction UTR & Receipt</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredCollections.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-amber-500/5 transition-colors ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-amber-500">
                      EMI #{c.installmentNo} of {c.tenureMonths}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold">{c.investorName}</div>
                      <span className="text-[10px] text-slate-400">{c.investorId}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{c.dueDate}</td>
                    <td className="py-3 px-3 font-medium text-emerald-400">{c.paidDate || '—'}</td>
                    <td className="py-3 px-3 font-bold text-white">{formatINR(c.amount)}</td>
                    <td className="py-3 px-3 text-slate-300">{c.paymentMode}</td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div>{c.txnRef}</div>
                      <span className="text-[10px] text-slate-400">{c.receiptNumber}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {c.status === 'Paid' ? (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold text-[11px]">
                          Paid
                        </span>
                      ) : c.status === 'Due' ? (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-semibold text-[11px] animate-pulse">
                          Due
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[11px]">
                          Upcoming
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="py-3 px-3">Investor</th>
                  <th className="py-3 px-3">Scheme & Tenure</th>
                  <th className="py-3 px-3">Plot Sales Progress</th>
                  <th className="py-3 px-3">Monthly Base Return</th>
                  <th className="py-3 px-3">Monthly Bonus</th>
                  <th className="py-3 px-3">Total Monthly Return</th>
                  <th className="py-3 px-3">Total Scheme Return</th>
                  <th className="py-3 px-3">Disbursal Date & Txn</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredPayouts.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-amber-500/5 transition-colors ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold">{p.investorName}</div>
                      <span className="text-[10px] text-slate-400">{p.investorId}</span>
                    </td>
                    <td className="py-3 px-3 text-amber-400 font-semibold">{p.scheme}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-blue-400">{p.eligiblePlotSales}</span> / {p.requiredPlotSales} Plots
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold">{formatINR(p.monthlyReturn)}</td>
                    <td className="py-3 px-3 text-purple-400 font-semibold">+{formatINR(p.monthlyBonusAmount)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-300">{formatINR(p.totalCurrentMonthlyReturn)}/mo</td>
                    <td className="py-3 px-3 font-black text-amber-400">{formatINR(p.totalExpectedReturn)}</td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div>{p.payoutDisbursedDate}</div>
                      <span className="text-[10px] text-slate-400">{p.payoutTxnReference}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {p.approvalStatus === 'Disbursed' ? (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold text-[11px]">
                          Disbursed
                        </span>
                      ) : p.approvalStatus === 'Approved / Ready' ? (
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-semibold text-[11px]">
                          Approved / Ready
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[11px]">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
