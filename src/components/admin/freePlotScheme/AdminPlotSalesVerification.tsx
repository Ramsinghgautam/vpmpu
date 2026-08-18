import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  User,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  Send,
  FileText,
} from 'lucide-react';
import { EmiInvestorRecord, EmiSoldPlotRecord } from '../../../types';
import { formatINR } from '../../../utils/calculators';
import { sendSchemeNotification } from '../../../utils/freePlotEmiSchemeEngine';

interface AdminPlotSalesVerificationProps {
  investors: EmiInvestorRecord[];
  onUpdateInvestor: (updatedInvestor: EmiInvestorRecord) => void;
  isDarkMode?: boolean;
}

export const AdminPlotSalesVerification: React.FC<AdminPlotSalesVerificationProps> = ({
  investors,
  onUpdateInvestor,
  isDarkMode = false,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlotSale, setSelectedPlotSale] = useState<{
    investor: EmiInvestorRecord;
    plotSale: EmiSoldPlotRecord;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [verifierName, setVerifierName] = useState<string>('Super Admin');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Flatten all plot sales from all investors
  const allSales = investors.flatMap((inv) =>
    inv.soldPlotsList.map((sale) => ({
      investor: inv,
      plotSale: sale,
    }))
  );

  const filteredSales = allSales.filter((item) => {
    const matchesStatus =
      filterStatus === 'ALL' || item.plotSale.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.plotSale.plotNo.toLowerCase().includes(q) ||
      item.plotSale.buyerName.toLowerCase().includes(q) ||
      item.investor.investorName.toLowerCase().includes(q) ||
      item.investor.id.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleVerify = (investor: EmiInvestorRecord, plotSale: EmiSoldPlotRecord) => {
    // Check if plot number already verified in another investor
    const duplicate = investors.some(
      (inv) =>
        inv.id !== investor.id &&
        inv.soldPlotsList.some((s) => s.plotNo === plotSale.plotNo && s.status === 'Verified')
    );

    if (duplicate) {
      if (
        !window.confirm(
          `Warning: Plot ${plotSale.plotNo} is already marked as verified for another record. Do you still want to proceed?`
        )
      ) {
        return;
      }
    }

    const updatedList = investor.soldPlotsList.map((s) =>
      s.id === plotSale.id
        ? {
            ...s,
            status: 'Verified' as const,
            verifiedBy: verifierName,
            verificationDate: new Date().toISOString().split('T')[0],
          }
        : s
    );

    const updatedInvestor: EmiInvestorRecord = {
      ...investor,
      soldPlotsList: updatedList,
      auditLogs: [
        {
          id: `AUD-VER-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: verifierName,
          action: 'Plot Sale Verified',
          details: `Verified Plot ${plotSale.plotNo} (Buyer: ${plotSale.buyerName}) for ${investor.investorName}`,
        },
        ...investor.auditLogs,
      ],
    };

    onUpdateInvestor(updatedInvestor);

    // Send Multi-channel notification
    sendSchemeNotification({
      investorId: investor.id,
      investorName: investor.investorName,
      phone: investor.phone,
      email: investor.email,
      type: 'plot_verified',
      title: 'Plot Sale Verified Successfully',
      message: `Your plot sale record (${plotSale.plotNo} - Buyer: ${plotSale.buyerName}) has been officially verified. Your monthly return bonus is now active.`,
      channels: ['SMS', 'WhatsApp', 'Email', 'In-App'],
    });

    setActionMessage(`Plot ${plotSale.plotNo} marked as VERIFIED for ${investor.investorName}.`);
    setSelectedPlotSale(null);
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlotSale) return;

    const { investor, plotSale } = selectedPlotSale;

    const updatedList = investor.soldPlotsList.map((s) =>
      s.id === plotSale.id
        ? {
            ...s,
            status: 'Rejected' as const,
            verifiedBy: verifierName,
            verificationDate: new Date().toISOString().split('T')[0],
            rejectionReason: rejectionReason || 'Documentation incomplete',
          }
        : s
    );

    const updatedInvestor: EmiInvestorRecord = {
      ...investor,
      soldPlotsList: updatedList,
      auditLogs: [
        {
          id: `AUD-REJ-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: verifierName,
          action: 'Plot Sale Rejected',
          details: `Rejected Plot ${plotSale.plotNo} for ${investor.investorName}. Reason: ${rejectionReason}`,
        },
        ...investor.auditLogs,
      ],
    };

    onUpdateInvestor(updatedInvestor);

    // Send Notification
    sendSchemeNotification({
      investorId: investor.id,
      investorName: investor.investorName,
      phone: investor.phone,
      email: investor.email,
      type: 'plot_rejected',
      title: 'Plot Sale Verification Rejected',
      message: `Your submitted plot sale (${plotSale.plotNo}) was rejected. Reason: ${rejectionReason || 'Please contact administration.'}`,
      channels: ['SMS', 'WhatsApp', 'In-App'],
    });

    setActionMessage(`Plot ${plotSale.plotNo} has been marked as REJECTED.`);
    setSelectedPlotSale(null);
    setRejectionReason('');
  };

  const pendingCount = allSales.filter((s) => s.plotSale.status === 'Pending Verification').length;
  const verifiedCount = allSales.filter((s) => s.plotSale.status === 'Verified').length;

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
              Verification & Audit Engine
            </span>
            <h2 className={`text-xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Plot Sales Verification & Eligibility Approvals
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Only Verified plot sales count towards the investor's payout eligibility and monthly return bonus.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center min-w-[110px]">
              <span className="text-[11px] text-amber-500 font-bold block">Pending Review</span>
              <span className="text-lg font-black text-amber-400">{pendingCount}</span>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center min-w-[110px]">
              <span className="text-[11px] text-emerald-500 font-bold block">Verified Active</span>
              <span className="text-lg font-black text-emerald-400">{verifiedCount}</span>
            </div>
          </div>
        </div>

        {actionMessage && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {actionMessage}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Plot No, Buyer Name, Investor ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`py-2 px-3 rounded-xl text-xs border font-semibold ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <option value="ALL">All Statuses ({allSales.length})</option>
              <option value="Pending Verification">Pending Verification ({pendingCount})</option>
              <option value="Verified">Verified Active ({verifiedCount})</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-3 px-3">Plot Details</th>
                <th className="py-3 px-3">Investor (Seller)</th>
                <th className="py-3 px-3">Buyer Name & Phone</th>
                <th className="py-3 px-3">Sale Date & Value</th>
                <th className="py-3 px-3">Monthly Bonus Rate</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No plot sales found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredSales.map(({ investor, plotSale }) => (
                  <tr
                    key={plotSale.id}
                    className={`hover:bg-amber-500/5 transition-colors ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-amber-500">
                      <div>{plotSale.plotNo}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{plotSale.projectName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold">{investor.investorName}</div>
                      <span className="text-[10px] text-slate-400">{investor.id} ({investor.tenureMonths}M Plan)</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium">{plotSale.buyerName}</div>
                      <span className="text-[10px] text-slate-400">{plotSale.buyerPhone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div>{plotSale.saleDate}</div>
                      <span className="text-[10px] font-bold text-emerald-400">{formatINR(plotSale.saleAmount)}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-purple-400">
                      +{formatINR(plotSale.monthlyBonusRate)}/mo
                    </td>
                    <td className="py-3 px-3">
                      {plotSale.status === 'Verified' ? (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold text-[11px] flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : plotSale.status === 'Pending Verification' ? (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-semibold text-[11px] flex items-center gap-1 w-fit animate-pulse">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-semibold text-[11px] flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                      {plotSale.verifiedBy && (
                        <div className="text-[10px] text-slate-400 mt-0.5">By: {plotSale.verifiedBy}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {plotSale.status === 'Pending Verification' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleVerify(investor, plotSale)}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => setSelectedPlotSale({ investor, plotSale })}
                            className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-lg text-xs flex items-center gap-1 border border-rose-500/30 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleVerify(investor, plotSale)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs border border-slate-700"
                        >
                          Re-Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {selectedPlotSale && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-2xl border p-6 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-2xl space-y-4`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-700">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Reject Plot Sale Submission
              </h3>
              <button
                onClick={() => setSelectedPlotSale(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2 p-3 bg-slate-950/50 rounded-xl border border-slate-800">
              <div><span className="text-slate-400">Plot No:</span> <span className="font-bold text-amber-400">{selectedPlotSale.plotSale.plotNo}</span></div>
              <div><span className="text-slate-400">Investor:</span> <span className="font-semibold">{selectedPlotSale.investor.investorName}</span></div>
              <div><span className="text-slate-400">Buyer:</span> {selectedPlotSale.plotSale.buyerName} ({selectedPlotSale.plotSale.buyerPhone})</div>
            </div>

            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Rejection Reason</label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Sale agreement copy not attached or duplicate registry entry"
                  className={`w-full mt-1 p-2.5 rounded-xl border text-xs ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectedPlotSale(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
