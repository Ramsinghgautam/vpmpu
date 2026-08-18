import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  FileText,
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { EmiInvestorRecord, EmiSchemeAnalytics } from '../../../types';
import { formatINR } from '../../../utils/calculators';

interface AdminReportsExportViewProps {
  investors: EmiInvestorRecord[];
  analytics: EmiSchemeAnalytics;
  isDarkMode?: boolean;
}

export const AdminReportsExportView: React.FC<AdminReportsExportViewProps> = ({
  investors,
  analytics,
  isDarkMode = false,
}) => {
  const [selectedReport, setSelectedReport] = useState<
    'investor_statement' | 'emi_collection' | 'plot_sales' | 'eligibility' | 'payout_liability' | 'cashflow'
  >('investor_statement');

  const [selectedInvestorId, setSelectedInvestorId] = useState<string>(
    investors[0]?.id || ''
  );

  const selectedInvestor = investors.find((inv) => inv.id === selectedInvestorId) || investors[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `Report_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;

    if (selectedReport === 'investor_statement') {
      if (!selectedInvestor) return;
      headers = ['Installment #', 'Due Date', 'Paid Date', 'Amount (INR)', 'Payment Mode', 'Transaction Ref', 'Receipt #', 'Status'];
      rows = selectedInvestor.emiLedger.map((e) => [
        e.installmentNo,
        e.dueDate,
        e.paidDate || 'N/A',
        e.amount,
        e.paymentMode || 'N/A',
        e.txnRef || 'N/A',
        e.receiptNumber || 'N/A',
        e.status,
      ]);
      filename = `Investor_Statement_${selectedInvestor.id}.csv`;
    } else if (selectedReport === 'emi_collection') {
      headers = ['Investor ID', 'Investor Name', 'Installment #', 'Due Date', 'Paid Date', 'Amount', 'Payment Mode', 'Status'];
      rows = investors.flatMap((inv) =>
        inv.emiLedger.map((e) => [
          inv.id,
          inv.investorName,
          e.installmentNo,
          e.dueDate,
          e.paidDate || 'N/A',
          e.amount,
          e.paymentMode || 'N/A',
          e.status,
        ])
      );
    } else if (selectedReport === 'plot_sales') {
      headers = ['Investor ID', 'Investor Name', 'Plot No', 'Project', 'Buyer Name', 'Buyer Phone', 'Sale Amount', 'Monthly Bonus Rate', 'Verification Status', 'Verified By'];
      rows = investors.flatMap((inv) =>
        inv.soldPlotsList.map((s) => [
          inv.id,
          inv.investorName,
          s.plotNo,
          s.projectName,
          s.buyerName,
          s.buyerPhone,
          s.saleAmount,
          s.monthlyBonusRate,
          s.status,
          s.verifiedBy || 'Pending',
        ])
      );
    } else if (selectedReport === 'eligibility') {
      headers = ['Investor ID', 'Investor Name', 'Tenure', 'Required Plot Target', 'Verified Plot Sales', 'Remaining Plots', 'Paid EMIs', 'Status', 'Eligibility Status'];
      rows = investors.map((inv) => [
        inv.id,
        inv.investorName,
        `${inv.tenureMonths} Months`,
        inv.requiredPlotSales,
        inv.plotsSoldCount,
        Math.max(0, inv.requiredPlotSales - inv.plotsSoldCount),
        `${inv.paidInstallmentsCount}/${inv.tenureMonths}`,
        inv.status,
        inv.isPayoutEligible ? 'ELIGIBLE' : 'PENDING TARGET',
      ]);
    } else if (selectedReport === 'payout_liability') {
      headers = ['Investor ID', 'Investor Name', 'Total Investment', 'Monthly Base Return', 'Monthly Bonus', 'Total Monthly Return', 'Total Expected Return', 'Disbursed Amount', 'Outstanding Liability', 'Payout Status'];
      rows = investors.map((inv) => {
        const outstanding = inv.isPayoutDisbursed ? 0 : inv.totalExpectedReturn;
        return [
          inv.id,
          inv.investorName,
          inv.totalInvestment,
          inv.monthlyReturn,
          inv.monthlyBonusAmount,
          inv.totalCurrentMonthlyReturn,
          inv.totalExpectedReturn,
          inv.payoutDisbursedAmount || 0,
          outstanding,
          inv.isPayoutDisbursed ? 'Disbursed' : inv.isPayoutEligible ? 'Ready for Payout' : 'Pending',
        ];
      });
    } else if (selectedReport === 'cashflow') {
      headers = ['Metric', 'Amount (INR)', 'Frequency'];
      rows = [
        ['Total Cumulative EMI Collection', analytics.totalEmiCollection, 'To-Date'],
        ['Current Monthly EMI Cashflow', analytics.monthlyCashflow, 'Monthly'],
        ['Projected Annual EMI Cashflow', analytics.yearlyCashflow, 'Annual'],
        ['Total Expected Payout Liability', analytics.totalExpectedLiability, 'Total Scheme'],
        ['Disbursed Payouts', analytics.totalPayoutAmount, 'To-Date'],
        ['Outstanding Payout Liability', analytics.totalExpectedLiability - analytics.totalPayoutAmount, 'Remaining'],
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
              Financial Reporting & Tax Center
            </span>
            <h2 className={`text-xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Executive Reports, Audit Statements & Exports
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Generate official printable PDF statements and download detailed CSV data sheets for audit, tax filing, and investor reporting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Download Excel / CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print PDF Report
            </button>
          </div>
        </div>

        {/* Report Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800">
          {[
            { id: 'investor_statement', label: 'Investor Statement' },
            { id: 'emi_collection', label: 'EMI Collection Report' },
            { id: 'plot_sales', label: 'Plot Sales Audit Report' },
            { id: 'eligibility', label: 'Eligibility Status Report' },
            { id: 'payout_liability', label: 'Payout Liability Report' },
            { id: 'cashflow', label: 'Monthly/Annual Cashflow' },
          ].map((rep) => (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedReport === rep.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {rep.label}
            </button>
          ))}
        </div>

        {selectedReport === 'investor_statement' && (
          <div className="mt-4 flex items-center gap-3">
            <label className="text-xs text-slate-400 font-semibold">Select Investor:</label>
            <select
              value={selectedInvestorId}
              onChange={(e) => setSelectedInvestorId(e.target.value)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold border ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {investors.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.investorName} ({inv.id}) - {inv.tenureMonths}M Plan
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Report Preview Surface (Print Ready) */}
      <div
        id="printable-report-surface"
        className={`p-8 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        } shadow-lg print:p-0 print:border-none print:shadow-none`}
      >
        {/* Printable Header */}
        <div className="border-b pb-6 mb-6 border-slate-700/60 flex items-start justify-between">
          <div>
            <div className="text-lg font-black tracking-tight text-amber-400">
              VIGYA GROUP REAL ESTATE & INFRASTRUCTURE
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              20.5% Free Plot Scheme (EMI / किस्तों में प्लॉट) • Registered Office: Civil Lines, Prayagraj, UP
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold text-slate-300">REPORT CODE: FPS-205-{Date.now().toString().slice(-6)}</div>
            <div className="text-slate-400 mt-0.5">Generated: {new Date().toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Selected Report Content */}
        {selectedReport === 'investor_statement' && selectedInvestor && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Investor Name</span>
                <span className="font-bold text-sm text-white">{selectedInvestor.investorName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Investor ID</span>
                <span className="font-mono font-bold text-amber-400">{selectedInvestor.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Scheme & Tenure</span>
                <span className="font-semibold text-white">20.5% Rate ({selectedInvestor.tenureMonths} Months)</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Investment</span>
                <span className="font-bold text-emerald-400">{formatINR(selectedInvestor.totalInvestment)}</span>
              </div>
            </div>

            {/* Passbook Schedule */}
            <div>
              <h4 className="text-sm font-bold mb-3 text-slate-200">Installment Schedule & Payment Ledger</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3">Paid Date</th>
                      <th className="py-2.5 px-3">Installment</th>
                      <th className="py-2.5 px-3">Mode</th>
                      <th className="py-2.5 px-3">Txn UTR / Ref</th>
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
                              e.status === 'Paid'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'
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

        {selectedReport === 'cashflow' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Total EMI Collections</span>
                <span className="text-xl font-black text-emerald-400">{formatINR(analytics.totalEmiCollection)}</span>
              </div>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Monthly Inflow</span>
                <span className="text-xl font-black text-amber-400">{formatINR(analytics.monthlyCashflow)}/mo</span>
              </div>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Total Expected Liability</span>
                <span className="text-xl font-black text-purple-400">{formatINR(analytics.totalExpectedLiability)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Printable Footer */}
        <div className="border-t pt-6 mt-8 border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
          <div>Authorized Signatory • Vigya Group Finance</div>
          <div>Computer Generated Official Document • Valid Without Physical Signature</div>
        </div>
      </div>
    </div>
  );
};
