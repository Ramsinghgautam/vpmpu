import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  RefreshCw, 
  Search, 
  Filter, 
  ShieldCheck, 
  Receipt, 
  Eye, 
  RotateCcw, 
  AlertTriangle, 
  Check, 
  DollarSign, 
  ExternalLink,
  Shield,
  Key,
  Layers
} from 'lucide-react';
import { PaymentRecord, PaymentStatus, PaymentType } from '../../types';
import jsPDF from 'jspdf';

export const AdminPaymentManager: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [metrics, setMetrics] = useState({
    totalPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    annualRevenue: 0
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Selected payment for detail modal
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  // Refund Modal State
  const [refundTarget, setRefundTarget] = useState<PaymentRecord | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>('Customer Cancellation');
  const [isRefunding, setIsRefunding] = useState<boolean>(false);
  const [refundAlert, setRefundAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Security Audit Logs Modal
  const [showAuditLogs, setShowAuditLogs] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Gateway Config Info
  const [gatewayInfo, setGatewayInfo] = useState<{ keyId: string; mode: string; companyName: string } | null>(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== 'all') query.append('status', statusFilter);
      if (typeFilter !== 'all') query.append('paymentType', typeFilter);
      if (searchTerm) query.append('search', searchTerm);

      const res = await fetch(`/api/payments?${query.toString()}`);
      const data = await res.json();

      if (data.success) {
        setPayments(data.payments);
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGatewayConfig = async () => {
    try {
      const res = await fetch('/api/razorpay/config');
      const data = await res.json();
      if (data.success) {
        setGatewayInfo({
          keyId: data.keyId,
          mode: data.mode,
          companyName: data.companyName
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/payments/audit-logs');
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchGatewayConfig();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments();
  };

  const handleProcessRefund = async () => {
    if (!refundTarget) return;
    setIsRefunding(true);
    setRefundAlert(null);

    try {
      const res = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: refundTarget.paymentId || refundTarget.id,
          refundAmount: refundAmount || refundTarget.amount,
          reason: refundReason
        })
      });

      const data = await res.json();

      if (data.success) {
        setRefundAlert({ type: 'success', msg: data.message });
        setTimeout(() => {
          setRefundTarget(null);
          setRefundAlert(null);
          fetchPayments();
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to process refund.');
      }
    } catch (err: any) {
      setRefundAlert({ type: 'error', msg: err.message });
    } finally {
      setIsRefunding(false);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/payments/export/csv', '_blank');
  };

  const handleExportPDFReport = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('VPM REAL ESTATE - RAZORPAY PAYMENT AUDIT REPORT', 14, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | Total Records: ${payments.length}`, 14, 28);

    let y = 45;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment ID', 14, y);
    doc.text('Customer Name', 60, y);
    doc.text('Amount (₹)', 120, y);
    doc.text('Type', 155, y);
    doc.text('Status', 180, y);

    doc.line(14, y + 2, 196, y + 2);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    payments.slice(0, 25).forEach((p) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(p.paymentId || p.orderId.substring(0, 15), 14, y);
      doc.text(p.name.substring(0, 22), 60, y);
      doc.text(`₹${p.amount.toLocaleString('en-IN')}`, 120, y);
      doc.text(p.paymentType, 155, y);
      doc.text(p.status.toUpperCase(), 180, y);
      y += 8;
    });

    doc.save(`VPM_Razorpay_Transactions_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Gateway Credentials & Environment */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-slate-200 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">Razorpay Payment Gateway Hub</h2>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                gatewayInfo?.mode === 'LIVE_PRODUCTION'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {gatewayInfo?.mode || 'TEST SANDBOX'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official Razorpay API v1 • Key ID: <span className="font-mono text-amber-400">{gatewayInfo?.keyId || 'rzp_test_sample_key_id'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              fetchAuditLogs();
              setShowAuditLogs(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Audit Logs</span>
          </button>
          <button
            type="button"
            onClick={fetchPayments}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md shadow-amber-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Gateway</span>
          </button>
        </div>
      </div>

      {/* 6 Required Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Card 1: Total Payments */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Payments</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-black text-white block">{metrics.totalPayments}</span>
          <span className="text-[10px] text-slate-500">All Gateway Handshakes</span>
        </div>

        {/* Card 2: Successful Payments */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Successful</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400 block">{metrics.successfulPayments}</span>
          <span className="text-[10px] text-emerald-500/80">HMAC Signature Verified</span>
        </div>

        {/* Card 3: Failed Payments */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Failed</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-black text-rose-400 block">{metrics.failedPayments}</span>
          <span className="text-[10px] text-rose-500/80">Declined / Timeout</span>
        </div>

        {/* Card 4: Pending Payments */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-400 block">{metrics.pendingPayments}</span>
          <span className="text-[10px] text-amber-500/80">Order Created / Waiting</span>
        </div>

        {/* Card 5: Monthly Revenue */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">Monthly Revenue</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-xl font-black text-sky-400 block truncate">₹{metrics.monthlyRevenue.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-500">Current Month Inflow</span>
        </div>

        {/* Card 6: Annual Revenue */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Annual Revenue</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl font-black text-amber-400 block truncate">₹{metrics.annualRevenue.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-500">YTD Gross Inflow</span>
        </div>

      </div>

      {/* Control Bar: Filters & Export Action Buttons */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, mobile, payment ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by payment status"
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="created">Created / Pending</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            aria-label="Filter by payment category"
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            <option value="Booking">Plot Booking</option>
            <option value="EMI">EMI Installment</option>
            <option value="Advance">Advance Capital</option>
            <option value="Subscription">Subscription</option>
            <option value="Partial">Partial Payment</option>
          </select>
        </div>

        {/* Required Export & Report Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportPDFReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>Export PDF Report</span>
          </button>
        </div>

      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            Razorpay Live Transactions
            <span className="text-xs text-slate-400 font-medium">({payments.length} Records)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Customer / Contact</th>
                <th className="p-3.5">Razorpay Order & Payment ID</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Amount (₹)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No Razorpay transactions matching the criteria.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-200">{p.name}</div>
                      <div className="text-[11px] text-slate-400">{p.mobile} • {p.email}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <div className="text-amber-400 font-bold">{p.paymentId || 'Pending Payment'}</div>
                      <div className="text-slate-500">{p.orderId}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-[10px]">
                        {p.paymentType}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 font-bold">
                      {p.paymentMethod}
                    </td>
                    <td className="p-3.5 font-black text-amber-400 text-sm">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase border ${
                        p.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : p.status === 'failed'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : p.status === 'refunded'
                              ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(p.dateTime).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedPayment(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {p.status === 'paid' && (
                          <button
                            type="button"
                            onClick={() => {
                              setRefundTarget(p);
                              setRefundAmount(p.amount);
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-colors border border-rose-500/30"
                            title="Initiate Refund"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">Transaction Details</h3>
              <button onClick={() => setSelectedPayment(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Customer Name:</span>
                <span className="font-bold text-white">{selectedPayment.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Mobile & Email:</span>
                <span className="font-medium text-slate-300">{selectedPayment.mobile} | {selectedPayment.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-black text-amber-400 text-sm">₹{selectedPayment.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Razorpay Order ID:</span>
                <span className="font-mono text-slate-300">{selectedPayment.orderId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Razorpay Payment ID:</span>
                <span className="font-mono text-slate-300">{selectedPayment.paymentId || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Payment Purpose:</span>
                <span className="font-medium text-slate-200">{selectedPayment.purpose}</span>
              </div>
              {selectedPayment.failureReason && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px]">
                  <strong>Failure Reason:</strong> {selectedPayment.failureReason}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedPayment(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-rose-400 text-base flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span>Process Razorpay Refund</span>
              </h3>
              <button onClick={() => setRefundTarget(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {refundAlert && (
              <div className={`p-3 rounded-xl text-xs ${
                refundAlert.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {refundAlert.msg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Refunding payment for <strong className="text-white">{refundTarget.name}</strong> (Payment ID: <code className="text-amber-400">{refundTarget.paymentId}</code>).
              </p>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={e => setRefundAmount(Number(e.target.value))}
                  max={refundTarget.amount}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Reason for Refund</label>
                <textarea
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleProcessRefund}
                disabled={isRefunding}
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
              >
                {isRefunding ? 'Processing...' : 'Confirm Refund'}
              </button>
              <button
                type="button"
                onClick={() => setRefundTarget(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {showAuditLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 text-slate-200 space-y-4 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Security Audit & Handshake Logs</span>
              </h3>
              <button onClick={() => setShowAuditLogs(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span className="text-amber-400 font-bold">{log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-slate-200">{log.details}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAuditLogs(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs"
            >
              Close Audit Logs
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
