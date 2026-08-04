import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Smartphone, 
  Building, 
  Wallet, 
  Sparkles, 
  Receipt, 
  Download, 
  Printer, 
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';
import { PaymentRecord, PaymentType, PaymentMethod } from '../types';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

interface RazorpayCheckoutModalProps {
  amount: number; // in INR
  purpose: string; // e.g., "Plot Booking Fee @ ₹10,000 for Plot A-12"
  paymentType: PaymentType;
  prefillName?: string;
  prefillEmail?: string;
  prefillMobile?: string;
  userId?: string;
  notes?: Record<string, any>;
  onClose: () => void;
  onPaymentSuccess: (payment: PaymentRecord) => void;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  amount,
  purpose,
  paymentType,
  prefillName = '',
  prefillEmail = '',
  prefillMobile = '',
  userId = 'USR-GUEST',
  notes = {},
  onClose,
  onPaymentSuccess
}) => {
  const [name, setName] = useState(prefillName || 'Rajesh Sharma');
  const [email, setEmail] = useState(prefillEmail || 'rajesh@example.com');
  const [mobile, setMobile] = useState(prefillMobile || '9876543210');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verifiedPayment, setVerifiedPayment] = useState<PaymentRecord | null>(null);
  const [gatewayConfig, setGatewayConfig] = useState<{ keyId: string; mode: string } | null>(null);

  // Load gateway config on mount
  useEffect(() => {
    fetch('/api/razorpay/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGatewayConfig({ keyId: data.keyId, mode: data.mode });
        }
      })
      .catch(() => {
        setGatewayConfig({ keyId: 'rzp_test_sample_key_id', mode: 'TEST_SANDBOX' });
      });
  }, []);

  // Dynamically load Razorpay SDK
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async () => {
    setErrorMsg(null);
    if (!name.trim() || !mobile.trim()) {
      setErrorMsg('Please enter your full name and valid 10-digit mobile number.');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Call Backend to Create Order
      const resObj = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          paymentType,
          userId,
          name,
          mobile,
          email,
          purpose,
          notes
        })
      });

      const orderData = await resObj.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize Razorpay order.');
      }

      const order = orderData.order;
      const keyId = orderData.keyId;

      // Try loading official checkout.js SDK
      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && (window as any).Razorpay && !keyId.includes('sample_key_id')) {
        // Step 2 & 3: Open Official Razorpay Modal
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'VIGYA PAURUSH MILESTONE PVT LTD',
          description: purpose,
          image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80',
          order_id: order.id,
          handler: async (response: any) => {
            // Step 5: Verify Payment Signature on Backend
            await handleVerifySignature({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentMethod: selectedMethod,
              paymentType,
              userId,
              name,
              mobile,
              email,
              amount,
              purpose,
              notes
            });
          },
          prefill: {
            name,
            email,
            contact: mobile
          },
          theme: {
            color: '#f59e0b'
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Interactive Sandbox / Fallback Handshake
        setTimeout(async () => {
          const mockPaymentId = `pay_rzp_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString().slice(-4)}`;
          const mockSignature = `sig_hmac_sha256_${Math.random().toString(36).substring(2, 16)}`;

          await handleVerifySignature({
            razorpay_order_id: order.id,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSignature,
            paymentMethod: selectedMethod,
            paymentType,
            userId,
            name,
            mobile,
            email,
            amount,
            purpose,
            notes
          });
        }, 1200);
      }
    } catch (err: any) {
      console.error('Razorpay process error:', err);
      setErrorMsg(err.message || 'An error occurred while connecting to Razorpay.');
      setIsProcessing(false);
    }
  };

  const handleVerifySignature = async (verificationPayload: any) => {
    try {
      const res = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationPayload)
      });

      const data = await res.json();

      if (data.success) {
        setVerifiedPayment(data.payment);
        setIsProcessing(false);
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        onPaymentSuccess(data.payment);
      } else {
        throw new Error(data.error || 'Payment verification failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Signature verification failed.');
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!verifiedPayment) return;
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
    doc.setFontSize(12);
    doc.text(`Receipt No: ${verifiedPayment.receipt}`, 14, 52);
    doc.text(`Date & Time: ${new Date(verifiedPayment.dateTime).toLocaleString('en-IN')}`, 14, 60);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 66, 196, 66);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer Name: ${verifiedPayment.name}`, 14, 76);
    doc.text(`Mobile: ${verifiedPayment.mobile}`, 14, 84);
    doc.text(`Email: ${verifiedPayment.email}`, 14, 92);

    doc.text(`Razorpay Order ID: ${verifiedPayment.orderId}`, 14, 104);
    doc.text(`Razorpay Payment ID: ${verifiedPayment.paymentId || 'N/A'}`, 14, 112);
    doc.text(`Payment Method: ${verifiedPayment.paymentMethod}`, 14, 120);
    doc.text(`Payment Category: ${verifiedPayment.paymentType}`, 14, 128);

    doc.setFillColor(241, 245, 249);
    doc.rect(14, 138, 182, 30, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Amount Paid: ₹${verifiedPayment.amount.toLocaleString('en-IN')}`, 20, 152);
    doc.setFontSize(10);
    doc.text(`Purpose: ${verifiedPayment.purpose}`, 20, 160);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('This is a computer-generated digital receipt backed by Razorpay HMAC-SHA256 verification.', 14, 185);

    doc.save(`VPM_Razorpay_Receipt_${verifiedPayment.receipt}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                Razorpay Secure Gateway
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {gatewayConfig?.mode === 'LIVE_PRODUCTION' ? 'LIVE SSL' : 'SANDBOX ACTIVE'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">256-bit Encrypted SSL Handshake</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {verifiedPayment ? (
            /* Successful Receipt View */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white">Payment Successful!</h4>
                <p className="text-xs text-slate-400 mt-1">Transaction verified via HMAC-SHA256 signature.</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-extrabold text-amber-400 text-sm">₹{verifiedPayment.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Razorpay Payment ID:</span>
                  <span className="font-mono text-slate-200">{verifiedPayment.paymentId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="font-mono text-slate-200">{verifiedPayment.orderId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Payment Purpose:</span>
                  <span className="font-medium text-slate-300 text-right max-w-[200px] truncate">{verifiedPayment.purpose}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Receipt Ref:</span>
                  <span className="font-bold text-emerald-400">{verifiedPayment.receipt}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer border border-slate-700"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form View */
            <div className="space-y-5">
              
              {/* Order Summary Capsule */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">{paymentType} PAYMENT</span>
                  <p className="text-xs text-slate-300 font-medium truncate max-w-[240px] mt-0.5">{purpose}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Payable</span>
                  <span className="text-xl font-black text-white">₹{amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* User Prefill Fields */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 block">Payer Contact Details</label>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Full Customer Name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="tel"
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      placeholder="10-digit Mobile"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Supported Payment Methods Grid */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-300 block">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'UPI' as PaymentMethod, label: 'GPay / PhonePe / UPI', icon: Smartphone },
                    { id: 'Credit Card' as PaymentMethod, label: 'Credit Card', icon: CreditCard },
                    { id: 'Debit Card' as PaymentMethod, label: 'Debit Card', icon: CreditCard },
                    { id: 'Net Banking' as PaymentMethod, label: 'Net Banking', icon: Building },
                    { id: 'Wallet' as PaymentMethod, label: 'Paytm / Wallets', icon: Wallet },
                    { id: 'EMI' as PaymentMethod, label: 'Easy EMI / No-Cost', icon: Lock },
                  ].map((m) => {
                    const IconComp = m.icon;
                    const isSelected = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span className="text-[10px] leading-tight">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security Banner */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Razorpay HMAC-SHA256 Verified Signature</span>
                </div>
                <span className="font-mono text-[10px] text-amber-400 font-bold">PCI-DSS Level 1</span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleInitiatePayment}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-extrabold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting Razorpay Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Pay ₹{amount.toLocaleString('en-IN')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-center text-[10px] text-slate-500">
          Vigya Paurush Milestone Pvt Ltd • Powered by Razorpay Official API v1
        </div>

      </div>
    </div>
  );
};
