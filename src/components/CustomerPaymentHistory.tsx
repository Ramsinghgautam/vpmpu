import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Receipt, 
  Download, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PlusCircle, 
  ShieldCheck, 
  Eye, 
  ArrowUpRight,
  Smartphone
} from 'lucide-react';
import { PaymentRecord, User, PaymentType } from '../types';
import { RazorpayCheckoutModal } from './RazorpayCheckoutModal';
import jsPDF from 'jspdf';

interface CustomerPaymentHistoryProps {
  currentUser: User | null;
  onOpenBookingModal?: () => void;
}

export const CustomerPaymentHistory: React.FC<CustomerPaymentHistoryProps> = ({
  currentUser,
  onOpenBookingModal
}) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  // Trigger Pay Now Modal State
  const [payNowModal, setPayNowModal] = useState<{
    isOpen: boolean;
    amount: number;
    purpose: string;
    type: PaymentType;
  }>({
    isOpen: false,
    amount: 10000,
    purpose: 'Plot Booking Deposit',
    type: 'Booking'
  });

  const fetchUserPayments = async () => {
    setIsLoading(true);
    try {
      const uId = currentUser?.id || 'USR-901';
      const res = await fetch(`/api/payments?userId=${uId}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error('Error fetching customer payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPayments();
  }, [currentUser]);

  const handleDownloadReceipt = (payment: PaymentRecord) => {
    const doc = new jsPDF();

    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(245, 158, 11); // amber-500
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('VIGYA PAURUSH MILESTONE PVT LTD', 14, 22);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('RAZORPAY OFFICIAL PAYMENT RECEIPT', 14, 32);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(`Receipt Ref: ${payment.receipt}`, 14, 52);
    doc.text(`Transaction Date: ${new Date(payment.dateTime).toLocaleString('en-IN')}`, 14, 60);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 66, 196, 66);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer Name: ${payment.name}`, 14, 76);
    doc.text(`Mobile: ${payment.mobile}`, 14, 84);
    doc.text(`Email: ${payment.email}`, 14, 92);

    doc.text(`Razorpay Order ID: ${payment.orderId}`, 14, 104);
    doc.text(`Razorpay Payment ID: ${payment.paymentId || 'N/A'}`, 14, 112);
    doc.text(`Method: ${payment.paymentMethod}`, 14, 120);

    doc.setFillColor(241, 245, 249);
    doc.rect(14, 130, 182, 28, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Amount Paid: ₹${payment.amount.toLocaleString('en-IN')}`, 20, 144);
    doc.setFontSize(10);
    doc.text(`Purpose: ${payment.purpose}`, 20, 152);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Verified digitally via Razorpay HMAC-SHA256 signature.', 14, 180);

    doc.save(`VPM_Receipt_${payment.receipt}.pdf`);
  };

  const handleDownloadInvoice = (payment: PaymentRecord) => {
    const doc = new jsPDF();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', 14, 22);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('VIGYA PAURUSH MILESTONE PVT LTD • GSTIN: 09AAACV1234F1Z1', 14, 34);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice No: INV-VPM-${payment.id}`, 14, 55);
    doc.text(`Invoice Date: ${new Date(payment.dateTime).toLocaleDateString('en-IN')}`, 14, 62);

    doc.setFont('helvetica', 'normal');
    doc.text(`Billed To: ${payment.name}`, 14, 75);
    doc.text(`Contact: ${payment.mobile} | ${payment.email}`, 14, 82);

    doc.setFillColor(248, 250, 252);
    doc.rect(14, 92, 182, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Description / Real Estate Service', 18, 98);
    doc.text('Amount (INR)', 150, 98);

    doc.setFont('helvetica', 'normal');
    doc.text(payment.purpose, 18, 110);
    doc.text(`₹${payment.amount.toLocaleString('en-IN')}`, 150, 110);

    doc.line(14, 120, 196, 120);

    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount Paid:', 100, 130);
    doc.text(`₹${payment.amount.toLocaleString('en-IN')}`, 150, 130);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Thank you for choosing Vigya Paurush Milestone Pvt Ltd.', 14, 160);

    doc.save(`VPM_Tax_Invoice_${payment.id}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Banner */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            Payment History & Receipts
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Razorpay Secured
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            View past plot bookings, EMI payments, and download official GST invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPayNowModal({
              isOpen: true,
              amount: 25000,
              purpose: 'Monthly EMI Installment Payment',
              type: 'EMI'
            })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Pay EMI / Advance</span>
          </button>
        </div>
      </div>

      {/* Customer Payments Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Payment Purpose</th>
                <th className="p-3.5">Payment ID / Order ID</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Amount Paid</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Actions & Downloads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No payment history found. Make a plot booking or pay an EMI installment to view receipts here.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 max-w-xs">
                      <div className="font-bold text-white truncate">{p.purpose}</div>
                      <div className="text-[10px] text-amber-400 font-extrabold uppercase">{p.paymentType}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <div className="text-slate-200 font-bold">{p.paymentId || 'Pending'}</div>
                      <div className="text-slate-500 text-[10px]">{p.orderId}</div>
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
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(p.dateTime).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownloadReceipt(p)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all border border-slate-700 cursor-pointer"
                          title="Download Receipt"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          <span>Receipt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(p)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all border border-slate-700 cursor-pointer"
                          title="Download Invoice"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Invoice</span>
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

      {/* Razorpay Pay Now Trigger Modal */}
      {payNowModal.isOpen && (
        <RazorpayCheckoutModal
          amount={payNowModal.amount}
          purpose={payNowModal.purpose}
          paymentType={payNowModal.type}
          prefillName={currentUser?.name || 'Rajesh Sharma'}
          prefillEmail={currentUser?.email || 'rajesh@example.com'}
          prefillMobile={currentUser?.phone || '9876543210'}
          userId={currentUser?.id || 'USR-901'}
          onClose={() => setPayNowModal(prev => ({ ...prev, isOpen: false }))}
          onPaymentSuccess={(pRecord) => {
            fetchUserPayments();
          }}
        />
      )}

    </div>
  );
};
