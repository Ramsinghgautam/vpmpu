import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Printer,
  Share2,
  AlertCircle,
  HelpCircle,
  Building2,
  Check,
  Sparkles,
  ArrowRight,
  Calculator,
  Percent,
  Download,
  DollarSign,
  Send,
  CreditCard,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
  Gift,
  Users,
} from 'lucide-react';
import {
  EmiFreePlotSchemePlan,
  EmiInvestorRecord,
  EmiPaymentRecord,
  EmiSoldPlotRecord,
} from '../types';
import {
  DEFAULT_EMI_SCHEME_PLANS,
  INITIAL_EMI_INVESTORS,
  evaluateEmiInvestor,
  sendSchemeNotification,
  loadEmiInvestorsFromStorage,
  saveEmiInvestorsToStorage,
  loadEmiPlansFromStorage,
} from '../utils/freePlotEmiSchemeEngine';
import { formatINR } from '../utils/calculators';

interface UserEmiFreePlotSchemeViewProps {
  isDarkMode?: boolean;
}

export const UserEmiFreePlotSchemeView: React.FC<UserEmiFreePlotSchemeViewProps> = ({
  isDarkMode = false,
}) => {
  // Investors list loaded from storage
  const [allInvestors, setAllInvestors] = useState<EmiInvestorRecord[]>(() => loadEmiInvestorsFromStorage());
  const [selectedInvestorId, setSelectedInvestorId] = useState<string>(
    () => loadEmiInvestorsFromStorage()[0]?.id || 'INV-205-2026-001'
  );
  const [plans, setPlans] = useState<EmiFreePlotSchemePlan[]>(() => loadEmiPlansFromStorage());

  // Active tab inside Investor View
  const [activeTab, setActiveTab] = useState<'passbook' | 'calculator' | 'bonus_tracker' | 'certificate'>('passbook');

  // Interactive Calculator State
  const [calcTenure, setCalcTenure] = useState<number>(12);
  const [calcSimulatedSoldPlots, setCalcSimulatedSoldPlots] = useState<number>(3);

  // Modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [showSubmitPlotModal, setShowSubmitPlotModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Payment Form
  const [payForm, setPayForm] = useState({
    installmentNo: 1,
    paymentMode: 'UPI',
    upiApp: 'Google Pay',
    txnRef: '',
  });

  // Plot Submission Form
  const [submitPlotForm, setSubmitPlotForm] = useState({
    buyerName: '',
    buyerPhone: '',
    plotNo: '',
    projectName: 'Vigya City Phase 2',
    saleAmount: 1188000,
  });

  // Current selected investor
  const currentInvestor = useMemo(() => {
    return allInvestors.find((inv) => inv.id === selectedInvestorId) || allInvestors[0] || INITIAL_EMI_INVESTORS[0];
  }, [allInvestors, selectedInvestorId]);

  // Selected calculator plan
  const selectedCalcPlan = useMemo(() => {
    return plans.find((p) => p.tenureMonths === calcTenure) || plans[0];
  }, [plans, calcTenure]);

  // Save updated investor back to storage
  const handleUpdateCurrentInvestor = (updatedInvestor: EmiInvestorRecord) => {
    const evaluated = evaluateEmiInvestor(updatedInvestor, plans);
    const updatedList = allInvestors.map((inv) => (inv.id === evaluated.id ? evaluated : inv));
    setAllInvestors(updatedList);
    saveEmiInvestorsToStorage(updatedList);
  };

  // Handle Pay EMI
  const handlePayEmiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...currentInvestor };
    const nextUnpaid = updated.emiLedger.find((e) => e.status !== 'Paid');
    if (nextUnpaid) {
      nextUnpaid.status = 'Paid';
      nextUnpaid.paidDate = new Date().toISOString().split('T')[0];
      nextUnpaid.paymentMode = payForm.paymentMode as any;
      nextUnpaid.txnRef = payForm.txnRef || `UPI-${Date.now().toString().slice(-8)}`;
      nextUnpaid.receiptNumber = `REC-205-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
    }

    const reevaluated = evaluateEmiInvestor(updated, plans);
    reevaluated.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Investor Portal (Self-Pay)',
      action: 'Online EMI Payment Recorded',
      details: `Paid installment via ${payForm.upiApp} (${payForm.paymentMode}). Receipt generated.`,
    });

    sendSchemeNotification({
      investorId: reevaluated.id,
      investorName: reevaluated.investorName,
      phone: reevaluated.phone,
      email: reevaluated.email,
      type: 'emi_received',
      title: `20.5% EMI किस्त भुगतान पुष्टि (₹${formatINR(reevaluated.monthlyEmi)})`,
      message: `प्रिय ${reevaluated.investorName}, आपकी 20.5% फ्री प्लॉट स्कीम EMI किस्त (₹${formatINR(reevaluated.monthlyEmi)}) सफलतापूर्वक प्राप्त हुई। रसीद आपके पासबुक में उपलब्ध है।`,
      channels: ['SMS', 'WhatsApp', 'Email', 'In-App'],
    });

    handleUpdateCurrentInvestor(reevaluated);
    setShowPayModal(false);
  };

  // Handle Submit Plot Sale
  const handleSubmitPlotSale = (e: React.FormEvent) => {
    e.preventDefault();
    const newSale: EmiSoldPlotRecord = {
      id: `SP-${Date.now().toString().slice(-4)}`,
      investorId: currentInvestor.id,
      plotNo: submitPlotForm.plotNo || `P-${100 + currentInvestor.soldPlotsList.length + 1}`,
      projectName: submitPlotForm.projectName,
      buyerName: submitPlotForm.buyerName,
      buyerPhone: submitPlotForm.buyerPhone,
      saleAmount: Number(submitPlotForm.saleAmount),
      saleDate: new Date().toISOString().split('T')[0],
      monthlyBonusRate: currentInvestor.bonusReturnPerPlot,
      registeredBy: currentInvestor.investorName,
      status: 'Pending Verification',
    };

    const updated = {
      ...currentInvestor,
      soldPlotsList: [...currentInvestor.soldPlotsList, newSale],
    };

    const reevaluated = evaluateEmiInvestor(updated, plans);
    reevaluated.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentInvestor.investorName,
      action: 'Plot Sale Submitted for Verification',
      details: `Self-sold Plot ${newSale.plotNo} for buyer ${newSale.buyerName} submitted. Pending admin verification.`,
    });

    sendSchemeNotification({
      investorId: reevaluated.id,
      investorName: reevaluated.investorName,
      phone: reevaluated.phone,
      email: reevaluated.email,
      type: 'plot_sold',
      title: `प्लॉट विक्रय सबमिट हुआ (जांच प्रक्रियाधीन)`,
      message: `प्लॉट संख्या ${newSale.plotNo} सत्यापन के लिए सबमिट हो गया है। एडमिन सत्यापन के पश्चात +₹${formatINR(reevaluated.bonusReturnPerPlot)}/माह बोनस सक्रिय होगा।`,
      channels: ['SMS', 'WhatsApp', 'Email', 'In-App'],
    });

    handleUpdateCurrentInvestor(reevaluated);
    setShowSubmitPlotModal(false);
    setSubmitPlotForm({
      buyerName: '',
      buyerPhone: '',
      plotNo: '',
      projectName: 'Vigya City Phase 2',
      saleAmount: 1188000,
    });
  };

  const remainingPlotsNeeded = Math.max(0, currentInvestor.requiredPlotSales - currentInvestor.plotsSoldCount);

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`} id="user-emi-free-plot-scheme-view">
      
      {/* ------------------ TOP HERO & STATUS BANNER ------------------ */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl relative overflow-hidden ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white border-indigo-900/60'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3.5 py-1 rounded-full text-xs font-black tracking-wide uppercase">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                24.5% फ्री प्लॉट स्कीम (किस्तों में प्लॉट) पासबुक
              </span>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 px-3 py-1 rounded-full text-xs font-mono font-bold">
                24.5% Scheme ROI Rate
              </span>

              {/* Investor Switcher */}
              <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
                <span className="text-[11px] text-slate-400">Switch Profile:</span>
                <select
                  value={selectedInvestorId}
                  onChange={(e) => setSelectedInvestorId(e.target.value)}
                  className="bg-slate-800 text-amber-300 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold"
                >
                  {allInvestors.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.investorName} ({inv.tenureMonths}M Plan)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
              {currentInvestor.investorName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
              <span>ID: <strong className="text-amber-300">{currentInvestor.id}</strong></span>
              <span>•</span>
              <span>Allotted Plot: <strong className="text-white">{currentInvestor.plotNo} ({currentInvestor.plotSizeSqft} Sq. Ft.)</strong></span>
              <span>•</span>
              <span>Plan: <strong className="text-amber-300">{currentInvestor.tenureMonths} Months EMI</strong></span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {currentInvestor.status !== 'Disbursed' && currentInvestor.paidInstallmentsCount < currentInvestor.tenureMonths && (
              <button
                onClick={() => {
                  const nextUnpaid = currentInvestor.emiLedger.find((e) => e.status !== 'Paid');
                  setPayForm({
                    installmentNo: nextUnpaid ? nextUnpaid.installmentNo : currentInvestor.paidInstallmentsCount + 1,
                    paymentMode: 'UPI',
                    upiApp: 'Google Pay',
                    txnRef: `UPI-REF-${Date.now().toString().slice(-6)}`,
                  });
                  setShowPayModal(true);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay EMI (₹{formatINR(currentInvestor.monthlyEmi)})</span>
              </button>
            )}

            <button
              onClick={() => setShowSubmitPlotModal(true)}
              className="bg-purple-900/90 hover:bg-purple-900 text-purple-200 border border-purple-700 font-bold px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-purple-400" />
              <span>Submit Plot Sale (+₹{formatINR(currentInvestor.bonusReturnPerPlot)}/mo)</span>
            </button>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="bg-slate-800/90 hover:bg-slate-800 text-white border border-slate-700 font-bold px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Investment Bond</span>
            </button>
          </div>
        </div>

        {/* 4 Financial Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Investment</span>
            <p className="text-xl sm:text-2xl font-serif font-black text-white mt-1">
              ₹{formatINR(currentInvestor.totalInvestment)}
            </p>
            <div className="text-[10px] text-slate-400 mt-1">
              ₹{formatINR(currentInvestor.monthlyEmi)} × {currentInvestor.tenureMonths} Months
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Paid EMIs</span>
            <p className="text-xl sm:text-2xl font-serif font-black text-emerald-400 mt-1 font-mono">
              ₹{formatINR(currentInvestor.totalPaidAmount)}
            </p>
            <div className="text-[10px] text-slate-300 mt-1 flex justify-between font-mono">
              <span>{currentInvestor.paidInstallmentsCount}/{currentInvestor.tenureMonths} Paid</span>
              <span className="text-amber-400">Rem: ₹{formatINR(currentInvestor.remainingAmount)}</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Return</span>
            <p className="text-xl sm:text-2xl font-serif font-black text-amber-300 mt-1 font-mono">
              ₹{formatINR(currentInvestor.totalCurrentMonthlyReturn)}/mo
            </p>
            <div className="text-[10px] text-purple-300 mt-1">
              Base: ₹{formatINR(currentInvestor.monthlyReturn)} + Bonus: ₹{formatINR(currentInvestor.monthlyBonusAmount)}
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Maturity Return</span>
            <p className="text-xl sm:text-2xl font-serif font-black text-white mt-1">
              ₹{formatINR(currentInvestor.totalExpectedReturn)}
            </p>
            <div className="text-[10px] text-emerald-400 mt-1 font-bold">
              Status: {currentInvestor.status}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------ PLOT SALE FAST-TRACK PROGRESS BAR ------------------ */}
      <div className={`rounded-3xl p-6 border shadow-md space-y-4 ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white border-purple-800/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif font-black text-base text-white">
                Plot Sales Fast-Track Target & Bonus Tracker
              </h3>
            </div>
            <p className="text-xs text-purple-200">
              Requirement: <strong>{currentInvestor.requiredPlotSales} Verified Plots</strong> • Each Verified Plot yields <strong>+₹{formatINR(currentInvestor.bonusReturnPerPlot)}/mo</strong> return!
            </p>
          </div>

          <div className="text-right font-mono">
            <span className="text-2xl font-black text-amber-300">
              {currentInvestor.plotsSoldCount} / {currentInvestor.requiredPlotSales}
            </span>
            <span className="text-xs text-purple-300 block">Verified Plots</span>
          </div>
        </div>

        {/* Multi-step progress bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden p-0.5 border border-purple-500/40">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                currentInvestor.plotsSoldCount >= currentInvestor.requiredPlotSales
                  ? 'bg-gradient-to-r from-amber-400 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                  : 'bg-gradient-to-r from-purple-500 to-amber-400'
              }`}
              style={{
                width: `${Math.min(100, (currentInvestor.plotsSoldCount / currentInvestor.requiredPlotSales) * 100)}%`,
              }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-purple-300">
            <span>0 Plots Sold</span>
            <span className="font-bold text-amber-300">
              {currentInvestor.isPlotTargetMet
                ? '🎉 Full Fast-Track Target Achieved!'
                : `${remainingPlotsNeeded} Plots Remaining for Full Release`}
            </span>
            <span>Target: {currentInvestor.requiredPlotSales} Plots</span>
          </div>
        </div>
      </div>

      {/* ------------------ NAVIGATION SUB-TABS ------------------ */}
      <div className={`flex flex-wrap items-center gap-2 p-2 rounded-2xl border shadow-sm ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <button
          onClick={() => setActiveTab('passbook')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'passbook'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Digital EMI Passbook ({currentInvestor.paidInstallmentsCount}/{currentInvestor.tenureMonths})</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>10-Tenure 20.5% EMI Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('bonus_tracker')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'bonus_tracker'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Plot Sales Bonus Ledger ({currentInvestor.soldPlotsList.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DIGITAL EMI PASSBOOK & LEDGER                                      */}
      {/* ========================================================================= */}
      {activeTab === 'passbook' && (
        <div className={`rounded-3xl border shadow-sm overflow-hidden space-y-4 p-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className={`font-serif font-black text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <FileText className="w-5 h-5 text-amber-500" />
                EMI Payment Schedule & Passbook Ledger
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Total {currentInvestor.tenureMonths} installments • Monthly Due: ₹{formatINR(currentInvestor.monthlyEmi)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Passbook</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Inst. #</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Paid Date & Mode</th>
                  <th className="p-3">Receipt #</th>
                  <th className="p-3">Transaction UTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium font-mono text-[11px]">
                {currentInvestor.emiLedger.map((item) => (
                  <tr
                    key={item.installmentNo}
                    className={`hover:bg-amber-500/5 transition-colors ${
                      item.status === 'Paid' ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    <td className="p-3 font-bold text-amber-400">
                      EMI #{item.installmentNo}
                    </td>
                    <td className="p-3 text-slate-400">{item.dueDate}</td>
                    <td className="p-3 text-right font-bold text-white">
                      ₹{formatINR(item.amount)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          item.status === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.status === 'Due'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">
                      {item.paidDate ? `${item.paidDate} (${item.paymentMode})` : '—'}
                    </td>
                    <td className="p-3 text-amber-400 font-bold">
                      {item.receiptNumber || '—'}
                    </td>
                    <td className="p-3 text-[10px] text-slate-400 font-mono">
                      {item.txnRef || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTERACTIVE 10-TENURE EMI CALCULATOR & SIMULATOR                   */}
      {/* ========================================================================= */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <h3 className={`font-serif font-black text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Calculator className="w-5 h-5 text-amber-500" />
                20.5% Free Plot Scheme 10-Tenure Matrix Simulator
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Select different EMI tenures (12 to 120 Months) to view monthly installment, return, and fast-track sales rules.
              </p>
            </div>

            {/* Tenure Selector Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Select EMI Tenure:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setCalcTenure(p.tenureMonths)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      calcTenure === p.tenureMonths
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-bold'
                        : isDarkMode
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-sm font-black block font-mono">{p.tenureMonths} Months</span>
                    <span className={`text-[10px] font-bold block mt-0.5 ${calcTenure === p.tenureMonths ? 'text-slate-950' : 'text-amber-400'}`}>
                      ₹{formatINR(p.monthlyInstallment)}/mo
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Slider for Plot Sales */}
            <div className="p-5 bg-purple-950/40 border border-purple-800/60 rounded-3xl space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-400" />
                  Simulated Plot Sales:
                </label>
                <span className="text-lg font-black font-mono text-amber-300 bg-slate-900 px-3 py-1 rounded-xl border border-purple-500/40">
                  {calcSimulatedSoldPlots} Plots
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={calcSimulatedSoldPlots}
                onChange={(e) => setCalcSimulatedSoldPlots(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-purple-300 font-bold">
                <span>0 Plots (Base Only)</span>
                <span>Target: {selectedCalcPlan.requiredPlotSales} Plots</span>
                <span>10+ Plots (Max Bonus)</span>
              </div>
            </div>

            {/* Calculated Output Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly EMI</span>
                <p className="text-2xl font-serif font-black text-white">
                  ₹{formatINR(selectedCalcPlan.monthlyInstallment)}
                </p>
                <span className="text-[10px] text-slate-400">
                  Total Investment: ₹{formatINR(selectedCalcPlan.totalTenureInvestment)}
                </span>
              </div>

              <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-800/60 space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Total Monthly Return</span>
                <p className="text-2xl font-serif font-black text-emerald-300 font-mono">
                  ₹{formatINR(selectedCalcPlan.monthlyReturn + calcSimulatedSoldPlots * selectedCalcPlan.bonusReturnPerPlot)}
                </p>
                <span className="text-[10px] text-emerald-400 font-bold">
                  Base: ₹{formatINR(selectedCalcPlan.monthlyReturn)} + Bonus: ₹{formatINR(calcSimulatedSoldPlots * selectedCalcPlan.bonusReturnPerPlot)}
                </span>
              </div>

              <div className="p-4 bg-indigo-950/40 rounded-2xl border border-indigo-800/60 space-y-1">
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Maturity Return</span>
                <p className="text-2xl font-serif font-black text-amber-400">
                  ₹{formatINR(selectedCalcPlan.totalTenureReturn)}
                </p>
                <span className="text-[10px] text-indigo-300 font-bold">
                  {selectedCalcPlan.interestRatePercent || 24.5}% ROI • Target: {selectedCalcPlan.requiredPlotSales} Plots
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PLOT SALES BONUS TRACKER                                           */}
      {/* ========================================================================= */}
      {activeTab === 'bonus_tracker' && (
        <div className={`rounded-3xl p-6 border shadow-sm space-y-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className={`font-serif font-black text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Award className="w-5 h-5 text-purple-400" />
                Plot Sales & Monthly Bonus Ledger
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Verified Sales: {currentInvestor.plotsSoldCount} • Total Bonus: +₹{formatINR(currentInvestor.monthlyBonusAmount)}/month
              </p>
            </div>

            <button
              onClick={() => setShowSubmitPlotModal(true)}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Submit Plot Sale</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Plot No</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Buyer</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3 text-right">Sale Amount (₹)</th>
                  <th className="p-3 text-right">Bonus Return (₹)</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                {currentInvestor.soldPlotsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      No plot sales recorded yet. Submit plot sales to earn bonus returns!
                    </td>
                  </tr>
                ) : (
                  currentInvestor.soldPlotsList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-amber-400 font-mono">{p.plotNo}</td>
                      <td className="p-3 text-slate-400">{p.projectName}</td>
                      <td className="p-3 font-bold text-white">{p.buyerName}</td>
                      <td className="p-3 text-slate-400 font-mono">{p.buyerPhone}</td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        ₹{formatINR(p.saleAmount)}
                      </td>
                      <td className="p-3 text-right font-mono font-black text-purple-400">
                        +₹{formatINR(p.monthlyBonusRate)}/mo
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          p.status === 'Verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PAY NEXT EMI                                                     */}
      {/* ========================================================================= */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-serif font-black text-amber-400 text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                Pay Online EMI Installment
              </h3>
              <button
                onClick={() => setShowPayModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 text-indigo-200 rounded-2xl space-y-1 text-xs border border-slate-800">
              <span className="text-[10px] text-amber-400 font-bold uppercase">Installment Due Amount</span>
              <p className="text-2xl font-serif font-black text-white">₹{formatINR(currentInvestor.monthlyEmi)}</p>
              <p className="text-[10px] text-slate-300">
                Plan: <strong>{currentInvestor.tenureMonths} Months</strong> • Plot: <strong>{currentInvestor.plotNo}</strong>
              </p>
            </div>

            <form onSubmit={handlePayEmiSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Payment Mode / Gateway</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Google Pay', 'PhonePe', 'Paytm / UPI'].map((app) => (
                    <button
                      type="button"
                      key={app}
                      onClick={() => setPayForm({ ...payForm, upiApp: app })}
                      className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition-colors cursor-pointer ${
                        payForm.upiApp === app
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">UPI Transaction UTR / Ref Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI/102938472901"
                  value={payForm.txnRef}
                  onChange={(e) => setPayForm({ ...payForm, txnRef: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-medium font-mono text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md cursor-pointer"
                >
                  Pay ₹{formatINR(currentInvestor.monthlyEmi)} Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SUBMIT PLOT SALE                                                 */}
      {/* ========================================================================= */}
      {showSubmitPlotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-serif font-black text-purple-400 text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Submit Plot Sale for Verification
              </h3>
              <button
                onClick={() => setShowSubmitPlotModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Each verified plot sale increases your monthly return by <strong>+₹{formatINR(currentInvestor.bonusReturnPerPlot)}/mo</strong>!
            </p>

            <form onSubmit={handleSubmitPlotSale} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Sold Plot Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PLOT-FPS-302"
                  value={submitPlotForm.plotNo}
                  onChange={(e) => setSubmitPlotForm({ ...submitPlotForm, plotNo: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-medium text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Buyer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Patel"
                  value={submitPlotForm.buyerName}
                  onChange={(e) => setSubmitPlotForm({ ...submitPlotForm, buyerName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-medium text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Buyer Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={submitPlotForm.buyerPhone}
                  onChange={(e) => setSubmitPlotForm({ ...submitPlotForm, buyerPhone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-medium text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowSubmitPlotModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Submit Plot for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: OFFICIAL CERTIFICATE & BOND                                      */}
      {/* ========================================================================= */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border-4 border-amber-500 shadow-2xl p-8 space-y-6 my-8 text-slate-900 relative">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">
                  विज्ञ पौरुष माइलस्टोन इन्फ्राटेक प्राइवेट लिमिटेड
                </span>
                <h3 className="font-serif font-black text-xl text-slate-900 mt-1">
                  24.5% फ्री प्लॉट स्कीम (किस्तों में प्लॉट) निवेश बॉण्ड व प्रमाण पत्र
                </h3>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <p>
                यह प्रमाणित किया जाता है कि श्री/श्रीमती <strong>{currentInvestor.investorName}</strong>, पहचान संख्या <strong>{currentInvestor.id}</strong>, विज्ञ पौरुष माइलस्टोन की {currentInvestor.interestRatePercent || 24.5}% दर वाली <strong>{currentInvestor.tenureMonths}-माह फ्री प्लॉट EMI योजना</strong> के अंतर्गत <strong>{currentInvestor.plotSizeSqft} वर्गफुट</strong> प्लॉट संख्या <strong>{currentInvestor.plotNo}</strong> के लिए अधिकृत निवेशक हैं।
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-amber-50/60 rounded-2xl border border-amber-200 font-mono text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">मासिक किस्त</span>
                  <strong>₹{formatINR(currentInvestor.monthlyEmi)}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">कुल योजना निवेश</span>
                  <strong>₹{formatINR(currentInvestor.totalInvestment)}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">मासिक वापसी</span>
                  <strong className="text-emerald-700">₹{formatINR(currentInvestor.monthlyReturn)}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">नामांकित (Nominee)</span>
                  <strong>{currentInvestor.nominee.nomineeName} ({currentInvestor.nominee.nomineeRelation})</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">प्लॉट बिक्री लक्ष्य</span>
                  <strong className="text-purple-700">{currentInvestor.requiredPlotSales} Plots</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">परिपक्वता तिथि</span>
                  <strong>{currentInvestor.maturityDate}</strong>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                <div>
                  <span className="block font-bold text-slate-700">अधिकृत हस्ताक्षरकर्ता</span>
                  <span>प्रबंध निदेशक (Managing Director)</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-slate-700">सील एवं मुहर</span>
                  <span>Vigya Paurush Milestone Infratech</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-950 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>प्रमाण पत्र प्रिंट करें (Print Certificate)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
