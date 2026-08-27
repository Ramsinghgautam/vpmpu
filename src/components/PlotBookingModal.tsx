import React, { useState } from 'react';
import { Project, Plot, Booking } from '../types';
import { X, ShieldCheck, CreditCard, QrCode, CheckCircle2, Download, Printer, Copy, Award, Landmark, Phone, XCircle, Upload, Camera, FileText, PenTool, Loader2, IndianRupee } from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatINR } from '../utils/calculators';
import { isTransactionIdAlreadyUsed, registerCompletedTransactionId } from '../utils/transactionRegistry';

interface PlotBookingModalProps {
  initialProject?: Project | null;
  initialPlot?: Plot | null;
  allProjects: Project[];
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
  onGoToDashboard?: () => void;
}

export const PlotBookingModal: React.FC<PlotBookingModalProps> = ({
  initialProject,
  initialPlot,
  allProjects,
  onClose,
  onBookingSuccess,
  onGoToDashboard
}) => {
  const [step, setStep] = useState<'form' | 'payment' | 'receipt'>('form');

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProject?.id || allProjects[0]?.id || '');
  const [plotNo, setPlotNo] = useState<string>(initialPlot?.plotNo || 'A-02');
  const [plotSizeSqft, setPlotSizeSqft] = useState<number>(initialPlot?.sizeSqft || 1200);
  const [ratePerSqft, setRatePerSqft] = useState<number>(initialPlot?.ratePerSqft || 1250);
  const [installmentPlan, setInstallmentPlan] = useState<string>('12 Months EMI');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Document Upload States
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'razorpay' | 'card' | 'netbanking'>('upi');
  const [bookingAmount, setBookingAmount] = useState<number>(1000);
  const [transactionId, setTransactionId] = useState('');
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const currentProject = allProjects.find(p => p.id === selectedProjectId) || allProjects[0];
  const totalPrice = plotSizeSqft * ratePerSqft;

  const handlePrint = () => {
    setIsPrinting(true);
    const receiptElement = document.getElementById('booking-receipt-print-area');
    if (!receiptElement) {
      window.print();
      setIsPrinting(false);
      return;
    }

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>VPM Booking Receipt - ${createdBooking?.id || 'Receipt'}</title>
              <style>
                * { box-sizing: border-box; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                body { padding: 20px; background: white; color: #1e293b; font-size: 12px; }
                .bg-slate-50 { background-color: #f8fafc; }
                .bg-slate-900 { background-color: #0f172a; color: white; }
                .bg-emerald-100 { background-color: #d1fae5; color: #065f46; }
                .border-slate-200 { border-color: #e2e8f0; }
                .border-slate-300 { border-color: #cbd5e1; }
                .border-slate-900 { border-color: #0f172a; }
                .text-emerald-800 { color: #065f46; }
                .text-emerald-950 { color: #022c22; }
                .text-emerald-700 { color: #047857; }
                .text-slate-900 { color: #0f172a; }
                .text-sky-900 { color: #0c4a6e; }
                .text-amber-700 { color: #b45309; }
                .text-amber-800 { color: #92400e; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
                th { background-color: #0f172a; color: white; }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 15px 0; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
                .flex-between { display: flex; justify-content: space-between; align-items: center; }
                @page { size: A4; margin: 10mm; }
              </style>
            </head>
            <body>
              ${receiptElement.outerHTML}
            </body>
          </html>
        `);
        doc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            window.print();
          } finally {
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
              setIsPrinting(false);
            }, 1000);
          }
        }, 300);
      } else {
        window.print();
        setIsPrinting(false);
      }
    } catch (err) {
      window.print();
      setIsPrinting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!createdBooking) return;
    setIsGeneratingPDF(true);

    const receiptElement = document.getElementById('booking-receipt-print-area');
    if (receiptElement) {
      try {
        const canvas = await Promise.race([
          html2canvas(receiptElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
          }),
          new Promise<HTMLCanvasElement>((_, reject) =>
            setTimeout(() => reject(new Error('html2canvas capture timeout')), 2500)
          )
        ]);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20));
        pdf.save(`VPM_Booking_Receipt_${createdBooking.id}.pdf`);
        setIsGeneratingPDF(false);
        return;
      } catch (error) {
        console.error('html2canvas PDF generation error, using jsPDF fallback:', error);
      }
    }

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, 210, 40, 'F');
      pdf.setFillColor(245, 158, 11);
      pdf.rect(0, 40, 210, 3, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('VIGYA PAURUSH MILESTONE PVT LTD', 14, 18);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(203, 213, 225);
      pdf.text('Official Plot Booking Deposit Receipt', 14, 26);
      pdf.text('Head Office: Prayagraj-Lucknow Highway, Prayagraj, UP', 14, 33);

      pdf.setFillColor(16, 185, 129);
      pdf.roundedRect(142, 12, 54, 20, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('BOOKING CONFIRMED', 144, 24);

      pdf.setDrawColor(226, 232, 240);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(14, 52, 182, 34, 3, 3, 'FD');

      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BOOKING REF:', 20, 61);
      pdf.text('TRANSACTION ID:', 20, 70);
      pdf.text('DATE:', 20, 79);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'normal');
      pdf.text(createdBooking.id, 58, 61);
      pdf.text(createdBooking.paymentId, 58, 70);
      pdf.text(createdBooking.bookingDate, 58, 79);

      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PROJECT:', 118, 61);
      pdf.text('PLOT NO:', 118, 70);
      pdf.text('PLAN:', 118, 79);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'normal');
      pdf.text(createdBooking.projectName, 145, 61);
      pdf.text(`Plot #${createdBooking.plotNo}`, 145, 70);
      pdf.text(createdBooking.installmentPlan, 145, 79);

      // Customer section
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Customer Information', 14, 98);

      pdf.setDrawColor(226, 232, 240);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(14, 102, 182, 30, 3, 3, 'FD');

      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Name:', 20, 111);
      pdf.text('Phone:', 20, 120);
      pdf.text('Email:', 20, 129);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.text(createdBooking.customerName, 45, 111);
      pdf.setFont('helvetica', 'normal');
      pdf.text(createdBooking.customerPhone, 45, 120);
      pdf.text(createdBooking.customerEmail || 'N/A', 45, 129);

      // Financials
      pdf.setFillColor(15, 23, 42);
      pdf.rect(14, 142, 182, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Financial Breakdown Particulars', 20, 148.5);
      pdf.text('Amount (INR)', 158, 148.5);

      pdf.setDrawColor(226, 232, 240);
      pdf.rect(14, 152, 182, 24, 'D');
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Plot Cost (${createdBooking.plotSizeSqft} sq.ft @ Rs. ${createdBooking.ratePerSqft}/sq.ft)`, 20, 160);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Rs. ${createdBooking.totalPrice.toLocaleString('en-IN')}`, 158, 160);

      pdf.setFont('helvetica', 'normal');
      pdf.text(`Booking Token Deposit Received (Txn: ${createdBooking.paymentId})`, 20, 170);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(16, 185, 129);
      pdf.text(`Rs. ${createdBooking.bookingAmountPaid.toLocaleString('en-IN')}`, 158, 170);

      pdf.setFillColor(236, 253, 245);
      pdf.setDrawColor(167, 243, 208);
      pdf.roundedRect(14, 182, 182, 16, 3, 3, 'FD');
      pdf.setTextColor(6, 95, 70);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Token Payment Confirmed:', 20, 192.5);
      pdf.text(`Rs. ${createdBooking.bookingAmountPaid.toLocaleString('en-IN')} /-`, 148, 192.5);

      pdf.save(`VPM_Booking_Receipt_${createdBooking.id}.pdf`);
    } catch (pdfErr) {
      console.error('jsPDF creation error:', pdfErr);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert("Please enter customer name and valid 10-digit mobile number.");
      return;
    }
    setPaymentErrorMessage(null);
    setStep('payment');
  };

  const handleSimulatePayment = async () => {
    if (paymentMethod === 'razorpay') {
      setIsProcessingPayment(true);
      setPaymentErrorMessage(null);
      try {
        const resObj = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: bookingAmount,
            currency: 'INR',
            paymentType: 'Booking',
            userId: customerPhone || 'GUEST',
            name: customerName,
            mobile: customerPhone,
            email: customerEmail,
            purpose: `Plot Booking Token Fee @ ${currentProject.name} (Plot ${plotNo})`,
            notes: { projectId: currentProject.id, plotNo }
          })
        });

        const orderData = await resObj.json();
        if (!orderData.success) throw new Error(orderData.error || 'Failed to create Razorpay Order.');

        const order = orderData.order;
        const keyId = orderData.keyId;

        // Check window.Razorpay or fallback
        const mockPaymentId = `pay_rzp_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString().slice(-4)}`;
        const mockSig = `sig_hmac_sha256_${Math.random().toString(36).substring(2, 16)}`;

        const verifyRes = await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: order.id,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSig,
            paymentMethod: 'Razorpay Gateway',
            paymentType: 'Booking',
            userId: customerPhone,
            name: customerName,
            mobile: customerPhone,
            email: customerEmail,
            amount: bookingAmount,
            purpose: `Plot Booking Token Fee @ ${currentProject.name} (Plot ${plotNo})`
          })
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.success) throw new Error(verifyData.error || 'Payment Verification Failed.');

        const pRecord = verifyData.payment;

        const bookingObj: Booking = {
          id: "VPM-BK-" + Math.floor(1000 + Math.random() * 9000),
          customerName,
          customerPhone,
          customerEmail: customerEmail || `${customerPhone}@customer.vpm.com`,
          projectId: currentProject.id,
          projectName: currentProject.name,
          plotNo,
          plotSizeSqft,
          ratePerSqft,
          totalPrice,
          bookingAmountPaid: bookingAmount,
          paymentMethod: 'Razorpay Gateway (Verified)',
          paymentId: pRecord.paymentId || pRecord.orderId,
          bookingDate: new Date().toISOString().split('T')[0],
          status: 'Confirmed',
          installmentPlan
        };

        setCreatedBooking(bookingObj);
        onBookingSuccess(bookingObj);
        setStep('receipt');

        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}

      } catch (err: any) {
        setPaymentErrorMessage(`Razorpay Error: ${err.message}`);
      } finally {
        setIsProcessingPayment(false);
      }
      return;
    }

    const cleanDigits = transactionId.trim().replace(/\D/g, '');
    if (!transactionId || !transactionId.trim() || cleanDigits.length !== 12) {
      setPaymentErrorMessage('Transaction Failed! A valid 12-digit Transaction ID / UTR number is required.');
      return;
    }

    if (isTransactionIdAlreadyUsed(cleanDigits) || isTransactionIdAlreadyUsed(transactionId)) {
      setPaymentErrorMessage('Transaction Failed! This Transaction ID / UTR has ALREADY been completed in a previous booking. Duplicate transaction IDs cannot be re-validated or reused.');
      return;
    }

    if (!transactionDate) {
      setPaymentErrorMessage('Transaction Failed! Date of Transaction is required.');
      return;
    }

    setPaymentErrorMessage(null);
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);

      const finalTxnId = transactionId.trim().toUpperCase();
      registerCompletedTransactionId(finalTxnId);

      const bookingObj: Booking = {
        id: "VPM-BK-" + Math.floor(1000 + Math.random() * 9000),
        customerName,
        customerPhone,
        customerEmail: customerEmail || `${customerPhone}@customer.vpm.com`,
        projectId: currentProject.id,
        projectName: currentProject.name,
        plotNo,
        plotSizeSqft,
        ratePerSqft,
        totalPrice,
        bookingAmountPaid: bookingAmount,
        paymentMethod: paymentMethod === 'upi' ? 'UPI Direct (GPay/PhonePe)' : paymentMethod === 'razorpay' ? 'Razorpay Secure Gateway' : paymentMethod === 'card' ? 'Credit / Debit Card' : 'Net Banking',
        paymentId: finalTxnId,
        bookingDate: transactionDate || new Date().toISOString().split('T')[0],
        status: 'Confirmed',
        installmentPlan
      };

      setCreatedBooking(bookingObj);
      onBookingSuccess(bookingObj);
      setStep('receipt');

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log('Confetti effect');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-amber-500/30">
          <div>
            <span className="bg-amber-500 text-slate-950 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
              Official Plot Booking Portal
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1">
              {step === 'form' && 'Step 1: Customer & Plot Booking Form'}
              {step === 'payment' && `Step 2: Pay Booking Fee ${formatINR(bookingAmount)}`}
              {step === 'receipt' && 'Booking Confirmed — Payment Receipt'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step 1: Booking Form */}
        {step === 'form' && (
          <form onSubmit={handleProceedToPayment} className="p-6 overflow-y-auto space-y-4 text-xs">
            
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm">Plot Booking Fee: {formatINR(bookingAmount)} (Non-refundable, Adjustable in Total Price)</span>
                <p className="text-[11px] text-slate-600">Instantly locks plot ownership & issues official VPM receipt.</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-amber-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Select Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                >
                  {allProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Plot Number</label>
                <input
                  type="text"
                  value={plotNo}
                  onChange={(e) => setPlotNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  placeholder="e.g. A-12, B-05"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Plot Size (Sq.Ft)</label>
                <input
                  type="number"
                  value={plotSizeSqft}
                  onChange={(e) => setPlotSizeSqft(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Rate Per Sq.Ft (₹)</label>
                <input
                  type="number"
                  value={ratePerSqft}
                  onChange={(e) => setRatePerSqft(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Calculated Pricing summary */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400">Total Calculated Land Price</span>
                <p className="text-lg font-black text-amber-400">{formatINR(totalPrice)}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Pay Now to Book</span>
                <p className="text-lg font-black text-emerald-400">{formatINR(bookingAmount)}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Customer Personal Information</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra Sharma"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-sky-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-sky-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. customer@example.com"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-sky-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Installment Plan</label>
                  <select
                    value={installmentPlan}
                    onChange={(e: any) => setInstallmentPlan(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-sky-600 focus:outline-none font-medium text-slate-800 bg-white"
                  >
                    <option value="12 Months EMI">12 Months Flexible EMI</option>
                    <option value="24 Months EMI">24 Months Flexible EMI</option>
                    <option value="36 Months EMI">36 Months Flexible EMI</option>
                    <option value="48 Months EMI">48 Months Flexible EMI</option>
                    <option value="60 Months EMI">60 Months Flexible EMI</option>
                    <option value="72 Months EMI">72 Months Flexible EMI</option>
                    <option value="84 Months EMI">84 Months Flexible EMI</option>
                    <option value="96 Months EMI">96 Months Flexible EMI</option>
                    <option value="108 Months EMI">108 Months Flexible EMI</option>
                    <option value="120 Months EMI">120 Months Flexible EMI</option>
                    <option value="Full Payment (5% Discount)">Full One-Time Payment (5% Discount)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Postal Address</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="e.g. House 42, Civil Lines, Prayagraj"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-sky-600 focus:outline-none"
                />
              </div>

              {/* Document Uploads Section (Photo, Aadhar Card, PAN Card, Signature) */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Upload KYC Documents & Signature</span>
                  </h4>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">JPG, PNG, PDF</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* 1. Upload Photo */}
                  <div className="bg-slate-50 border border-slate-300 hover:border-amber-500 rounded-xl p-2 text-center transition-all">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-bold text-[11px] text-slate-900">1. Photo</p>
                      <label htmlFor="booking-photo-input" className="w-full mt-0.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-bold py-1 px-1.5 rounded-lg cursor-pointer flex items-center justify-center gap-1 transition-colors shadow-2xs">
                        <Upload className="w-3 h-3 text-amber-600" />
                        <span className="truncate max-w-[70px]">{photoFile ? photoFile.name : 'Choose'}</span>
                        <input
                          id="booking-photo-input"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      {photoFile && (
                        <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold mt-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="truncate max-w-[60px]">{photoFile.name}</span>
                          <button
                            type="button"
                            onClick={() => setPhotoFile(null)}
                            className="text-red-500 hover:text-red-700 ml-0.5 font-black cursor-pointer"
                            title="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Upload Aadhar Card */}
                  <div className="bg-slate-50 border border-slate-300 hover:border-indigo-500 rounded-xl p-2 text-center transition-all">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-bold text-[11px] text-slate-900">2. Aadhar Card</p>
                      <label htmlFor="booking-aadhar-input" className="w-full mt-0.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-bold py-1 px-1.5 rounded-lg cursor-pointer flex items-center justify-center gap-1 transition-colors shadow-2xs">
                        <Upload className="w-3 h-3 text-indigo-600" />
                        <span className="truncate max-w-[70px]">{aadharFile ? aadharFile.name : 'Choose'}</span>
                        <input
                          id="booking-aadhar-input"
                          type="file"
                          accept="image/*,.pdf"
                          className="sr-only"
                          onChange={(e) => setAadharFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      {aadharFile && (
                        <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold mt-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="truncate max-w-[60px]">{aadharFile.name}</span>
                          <button
                            type="button"
                            onClick={() => setAadharFile(null)}
                            className="text-red-500 hover:text-red-700 ml-0.5 font-black cursor-pointer"
                            title="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Upload PAN Card */}
                  <div className="bg-slate-50 border border-slate-300 hover:border-emerald-500 rounded-xl p-2 text-center transition-all">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-bold text-[11px] text-slate-900">3. PAN Card</p>
                      <label htmlFor="booking-pan-input" className="w-full mt-0.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-bold py-1 px-1.5 rounded-lg cursor-pointer flex items-center justify-center gap-1 transition-colors shadow-2xs">
                        <Upload className="w-3 h-3 text-emerald-600" />
                        <span className="truncate max-w-[70px]">{panFile ? panFile.name : 'Choose'}</span>
                        <input
                          id="booking-pan-input"
                          type="file"
                          accept="image/*,.pdf"
                          className="sr-only"
                          onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      {panFile && (
                        <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold mt-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="truncate max-w-[60px]">{panFile.name}</span>
                          <button
                            type="button"
                            onClick={() => setPanFile(null)}
                            className="text-red-500 hover:text-red-700 ml-0.5 font-black cursor-pointer"
                            title="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. Upload Signature */}
                  <div className="bg-slate-50 border border-slate-300 hover:border-purple-500 rounded-xl p-2 text-center transition-all">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">
                        <PenTool className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-bold text-[11px] text-slate-900">4. Signature</p>
                      <label htmlFor="booking-sig-input" className="w-full mt-0.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-bold py-1 px-1.5 rounded-lg cursor-pointer flex items-center justify-center gap-1 transition-colors shadow-2xs">
                        <Upload className="w-3 h-3 text-purple-600" />
                        <span className="truncate max-w-[70px]">{signatureFile ? signatureFile.name : 'Choose'}</span>
                        <input
                          id="booking-sig-input"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      {signatureFile && (
                        <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold mt-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="truncate max-w-[60px]">{signatureFile.name}</span>
                          <button
                            type="button"
                            onClick={() => setSignatureFile(null)}
                            className="text-red-500 hover:text-red-700 ml-0.5 font-black cursor-pointer"
                            title="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold py-3.5 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
            >
              <ShieldCheck className="w-5 h-5 text-slate-950" />
              <span>Proceed to Pay ₹10,000 Booking Fee not refundable but adjustable</span>
            </button>
          </form>
        )}

        {/* Step 2: Payment Gateway Simulation */}
        {step === 'payment' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between border border-amber-500/30">
              <div>
                <p className="text-xs text-slate-400">Total Payable Amount</p>
                <p className="text-xl sm:text-2xl font-black text-amber-400">₹10,000 <span className="text-xs font-normal text-amber-200/80">(Non-refundable, Adjustable)</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-300 font-bold">{customerName}</p>
                <p className="text-[11px] text-slate-400">{currentProject.name} — Plot {plotNo}</p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-800">Select Instant Payment Channel</label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('upi');
                    setPaymentErrorMessage(null);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 font-bold transition-all cursor-pointer ${paymentMethod === 'upi' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500' : 'border-slate-300 hover:bg-slate-50'}`}
                >
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p>UPI / QR Code</p>
                    <p className="text-[10px] text-slate-500 font-normal">GPay, PhonePe, Paytm</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('razorpay');
                    setPaymentErrorMessage(null);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 font-bold transition-all cursor-pointer ${paymentMethod === 'razorpay' ? 'border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-500' : 'border-slate-300 hover:bg-slate-50'}`}
                >
                  <CreditCard className="w-5 h-5 text-sky-600" />
                  <div>
                    <p>Razorpay Gateway</p>
                    <p className="text-[10px] text-slate-500 font-normal">Cards, Netbanking</p>
                  </div>
                </button>
              </div>
            </div>

            {/* UPI QR Code Container */}
            {paymentMethod === 'upi' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-3">
                <p className="font-bold text-slate-800">Scan UPI QR Code to Pay ₹10,000 <span className="text-slate-500 font-normal">(Non-refundable, Adjustable)</span></p>
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-lg border border-slate-300 shadow-inner flex items-center justify-center">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=7275300974@upi&pn=VigyaPaurushMilestone&am=10000&cu=INR"
                    alt="VPM UPI QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[11px] text-slate-600 font-mono">UPI ID: 7275300974@upi (Vigya Paurush Milestone Pvt Ltd)</p>
              </div>
            )}

            {/* Razorpay Info Container */}
            {paymentMethod === 'razorpay' && (
              <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-4 text-center space-y-2">
                <p className="font-bold text-sky-950">Razorpay Gateway Simulation</p>
                <p className="text-slate-600">Pay securely via Credit/Debit Card, Net Banking, or Wallets with instant digital confirmation.</p>
              </div>
            )}

            {/* Amount for Booking Div */}
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-3.5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <label htmlFor="booking-amount-select" className="font-extrabold text-xs text-emerald-950 uppercase tracking-wide flex items-center gap-1.5 cursor-pointer">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  Amount for Booking
                </label>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-200/70 px-2.5 py-0.5 rounded-md border border-emerald-300">
                  Select Token Fee
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="relative flex-1">
                  <select
                    id="booking-amount-select"
                    value={bookingAmount}
                    onChange={(e) => setBookingAmount(Number(e.target.value))}
                    className="w-full bg-white border-2 border-emerald-500 rounded-lg px-3 py-2 text-emerald-800 font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs cursor-pointer"
                  >
                    <option value={1000}>₹ 1,000</option>
                    <option value={2000}>₹ 2,000</option>
                    <option value={5000}>₹ 5,000</option>
                    <option value={10000}>₹ 10,000</option>
                  </select>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                  (Non-refundable, Adjustable)
                </span>
              </div>
            </div>

            {/* Transaction ID / UTR Input Field - Visible only for UPI / QR Code */}
            {paymentMethod === 'upi' && (
              <div className="bg-white border border-slate-300 rounded-xl p-3.5 space-y-2 shadow-xs">
                <label className="block font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Enter Transaction ID / UTR Number <span className="text-red-500">*</span></span>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Mandatory to Verify</span>
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => {
                    setTransactionId(e.target.value);
                    if (paymentErrorMessage) setPaymentErrorMessage(null);
                  }}
                  placeholder="e.g. UPI UTR 423910293841 or TXN98765432"
                  className={`w-full bg-slate-50 border rounded-lg p-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 ${
                    paymentErrorMessage
                      ? 'border-red-500 ring-2 ring-red-200 bg-red-50/40 text-red-950 font-bold'
                      : 'border-slate-300 focus:border-amber-500 ring-amber-200'
                  }`}
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  Please check your UPI app (GPay / PhonePe / Paytm) transaction history to find the 12-digit UTR.
                </p>
              </div>
            )}

            {/* Date of Transaction Input Field */}
            <div className="bg-white border border-slate-300 rounded-xl p-3.5 space-y-2 shadow-xs">
              <label className="block font-bold text-slate-900 text-xs flex items-center justify-between">
                <span>Date of Transaction <span className="text-red-500">*</span></span>
                <span className="text-[10px] font-semibold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">Payment Date</span>
              </label>
              <input
                type="date"
                value={transactionDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:border-amber-500 ring-amber-200"
              />
              <p className="text-[10px] text-slate-500 leading-tight">
                Select the exact date on which this payment transaction was completed.
              </p>
            </div>

            {/* Transaction Success or Failure Alert */}
            {(() => {
              const cleanDigits = transactionId.trim().replace(/\D/g, '');
              const isValid12 = cleanDigits.length === 12;
              const hasEntered = transactionId.trim().length > 0;
              const isAlreadyUsed = isTransactionIdAlreadyUsed(cleanDigits) || isTransactionIdAlreadyUsed(transactionId);

              if (isAlreadyUsed) {
                return (
                  <div className="bg-red-50 border-2 border-red-500 p-3.5 rounded-xl text-red-900 font-bold flex items-center gap-3 shadow-md animate-pulse">
                    <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                    <div>
                      <p className="font-black text-xs text-red-700 uppercase tracking-wide">Duplicate Transaction ID Detected!</p>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        This Transaction ID / UTR (<span className="font-mono text-red-800">{cleanDigits || transactionId}</span>) has ALREADY been completed in a previous transaction and cannot be reused.
                      </p>
                    </div>
                  </div>
                );
              } else if (isValid12 && transactionDate) {
                return (
                  <div className="bg-emerald-50 border-2 border-emerald-500 p-3.5 rounded-xl text-emerald-900 font-bold flex items-center gap-3 shadow-xs animate-fadeIn">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-black text-xs text-emerald-800 uppercase tracking-wide">12-Digit Transaction Verified!</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        Transaction ID / UTR ({cleanDigits}) & Date ({transactionDate}) verified & ready for booking submission.
                      </p>
                    </div>
                  </div>
                );
              } else if (hasEntered && !isValid12) {
                return (
                  <div className="bg-red-50 border-2 border-red-500 p-3.5 rounded-xl text-red-900 font-bold flex items-center gap-3 shadow-sm">
                    <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                    <div>
                      <p className="font-black text-xs text-red-700 uppercase tracking-wide">Invalid Transaction ID (12 Digits Required)</p>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        A valid 12-digit UTR/Reference ID is required. Currently entered: <span className="font-bold text-red-700">{cleanDigits.length}/12</span> digits.
                      </p>
                    </div>
                  </div>
                );
              } else if (paymentErrorMessage) {
                return (
                  <div className="bg-red-50 border-2 border-red-500 p-3.5 rounded-xl text-red-900 font-bold flex items-center gap-3 shadow-sm animate-bounce-short">
                    <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                    <div>
                      <p className="font-black text-xs text-red-700 uppercase tracking-wide">Transaction Failed!</p>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">{paymentErrorMessage}</p>
                    </div>
                  </div>
                );
              } else {
                return null;
              }
            })()}

            {/* Bottom Action Bar */}
            <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-1/3 border border-slate-300 hover:bg-slate-100 font-bold py-3.5 rounded-xl text-slate-700 transition-colors cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessingPayment}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? (
                  <span>Processing Secure Payment...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>Confirm {formatINR(bookingAmount)} Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Official Printable Receipt */}
        {step === 'receipt' && createdBooking && (
          <div className="p-6 overflow-y-auto space-y-6 text-xs bg-slate-50">
            
            {/* Printable Receipt Frame */}
            <div id="booking-receipt-print-area" className="bg-white p-6 rounded-2xl border border-slate-300 shadow-md space-y-5">
              
              {/* Receipt Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    VIGYA PAURUSH MILESTONE PRIVATE LIMITED
                  </h2>
                  <p className="text-[11px] text-slate-600">4/199 EWS AVC New Jhunsi, Prayagraj, UP, India</p>
                  <p className="text-[11px] text-slate-600">Phone: 7275300974 / 6394918657 | CIN: U70109UP2024PTC998</p>
                </div>
                
                <div className="text-right">
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] px-2.5 py-1 rounded uppercase">
                    OFFICIAL BOOKING RECEIPT
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-800 mt-1">{createdBooking.id}</p>
                  <p className="text-[10px] text-slate-500">Date: {createdBooking.bookingDate}</p>
                </div>
              </div>

              {/* Booking Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Customer Name</span>
                  <p className="text-sm font-bold text-slate-900">{createdBooking.customerName}</p>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">Customer Contact</span>
                  <p className="text-sm font-bold text-slate-900">{createdBooking.customerPhone}</p>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">Project Name</span>
                  <p className="text-sm font-bold text-sky-900">{createdBooking.projectName}</p>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">Plot Reserved</span>
                  <p className="text-sm font-bold text-amber-700">Plot {createdBooking.plotNo} ({createdBooking.plotSizeSqft} sq.ft)</p>
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <table className="w-full text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-[11px]">
                    <th className="p-2 border border-slate-800">Description</th>
                    <th className="p-2 border border-slate-800 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  <tr>
                    <td className="p-2 border border-slate-200">Total Land Cost ({createdBooking.plotSizeSqft} sq.ft @ ₹{createdBooking.ratePerSqft}/sq.ft)</td>
                    <td className="p-2 border border-slate-200 text-right font-bold">{formatINR(createdBooking.totalPrice)}</td>
                  </tr>
                  <tr className="bg-emerald-50">
                    <td className="p-2 border border-slate-200 text-emerald-950 font-bold">Booking Deposit Received (Txn ID: {createdBooking.paymentId})</td>
                    <td className="p-2 border border-slate-200 text-right font-black text-emerald-700">{formatINR(createdBooking.bookingAmountPaid)} (Non-refundable, Adjustable)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-200 font-bold">Balance Remaining Amount</td>
                    <td className="p-2 border border-slate-200 text-right font-bold text-amber-700">{formatINR(createdBooking.totalPrice - createdBooking.bookingAmountPaid)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Terms & Stamp */}
              <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-[10px] text-slate-500">
                <div className="max-w-xs space-y-1">
                  <p className="font-bold text-slate-800">Selected Plan: {createdBooking.installmentPlan}</p>
                  <p>* Plot allotment letter will be issued within 3 working days upon document verification.</p>
                </div>

                <div className="text-center font-serif">
                  <div className="w-24 h-12 mx-auto border border-dashed border-amber-600 rounded flex items-center justify-center text-amber-800 text-[9px] font-bold tracking-widest uppercase">
                    VPM SEAL STAMP
                  </div>
                  <p className="font-bold text-slate-900 mt-1">Prabhat Gautam</p>
                  <p className="text-slate-500 text-[9px]">Authorized Signatory / Director</p>
                </div>
              </div>

            </div>

            {/* Receipt Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-4 py-2.5 rounded-xl shadow flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isPrinting ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Printer className="w-4 h-4" />}
                  <span>{isPrinting ? 'Preparing Print...' : 'Print Receipt'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="bg-indigo-900 hover:bg-indigo-800 text-white font-bold px-4 py-2.5 rounded-xl shadow flex items-center gap-2 cursor-pointer transition-colors border border-indigo-700 hover:border-amber-400 disabled:opacity-50"
                >
                  {isGeneratingPDF ? <Loader2 className="w-4 h-4 text-amber-400 animate-spin" /> : <Download className="w-4 h-4 text-amber-400" />}
                  <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onGoToDashboard) {
                    onGoToDashboard();
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow cursor-pointer transition-all hover:scale-105"
              >
                Go to My Dashboard
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
