import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Calculator,
  Download,
  Printer,
  Search,
  Plus,
  Eye,
  FileText,
  CheckCircle2,
  Clock,
  IndianRupee,
  AlertCircle,
  X,
  Building2,
  Calendar,
  User,
  Percent,
  Check,
  DollarSign,
  Share2,
  Phone,
  Mail,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle,
  HelpCircle,
  Landmark,
  FileCheck,
  Send,
  Edit,
  Trash2
} from 'lucide-react';
import {
  LumpSumSchemeSlab,
  LumpSumInvestorRecord,
  LumpSumSchemeSummary,
  LumpSumEligibilityStatus,
} from '../../types';
import {
  LUMPSUM_SCHEME_SLABS,
  calculateLumpSumPayout,
  evaluateInvestorEligibility,
  recalculateLumpSumInvestorFields,
  calculateLumpSumSummary,
  generateLumpSumCsv,
  INITIAL_LUMPSUM_INVESTORS,
} from '../../utils/lumpSumSchemeEngine';
import { formatINR } from '../../utils/calculators';

interface AdminLumpSumSchemeManagerProps {
  isDarkMode?: boolean;
}

export const AdminLumpSumSchemeManager: React.FC<AdminLumpSumSchemeManagerProps> = ({
  isDarkMode = false,
}) => {
  // State
  const [investors, setInvestors] = useState<LumpSumInvestorRecord[]>(INITIAL_LUMPSUM_INVESTORS);
  const [slabs, setSlabs] = useState<LumpSumSchemeSlab[]>(LUMPSUM_SCHEME_SLABS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [slabFilter, setSlabFilter] = useState<string>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecordSaleModal, setShowRecordSaleModal] = useState<LumpSumInvestorRecord | null>(null);
  const [showDisburseModal, setShowDisburseModal] = useState<LumpSumInvestorRecord | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<LumpSumInvestorRecord | null>(null);
  const [showStatementModal, setShowStatementModal] = useState<LumpSumInvestorRecord | null>(null);
  const [showSlabManagerModal, setShowSlabManagerModal] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // New Investor Form State
  const [newInvestorName, setNewInvestorName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSeniorName, setNewSeniorName] = useState('Vikram Singh (Director)');
  const [newSeniorId, setNewSeniorId] = useState('DIR-001');
  const [newAddress, setNewAddress] = useState('Civil Lines, Prayagraj');
  const [newPlotSize, setNewPlotSize] = useState<number>(900);
  const [newPurchaseRate, setNewPurchaseRate] = useState<number>(2150);
  const [newCustomInterest, setNewCustomInterest] = useState<number | undefined>(undefined);
  const [newJoiningDate, setNewJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNomineeName, setNewNomineeName] = useState('');
  const [newNomineeRelation, setNewNomineeRelation] = useState('Spouse');
  const [newNomineeAge, setNewNomineeAge] = useState(38);
  const [newNomineePhone, setNewNomineePhone] = useState('');

  // Record Sale Form State
  const [salePlotNo, setSalePlotNo] = useState('');
  const [saleProjectName, setSaleProjectName] = useState('Milestone City Prayagraj');
  const [saleBuyerName, setSaleBuyerName] = useState('');
  const [saleBuyerPhone, setSaleBuyerPhone] = useState('');
  const [saleAmount, setSaleAmount] = useState<number>(1250000);

  // Disburse Form State
  const [disburseTxnRef, setDisburseTxnRef] = useState('');
  const [disburseMode, setDisburseMode] = useState<'Bank Transfer (RTGS/NEFT)' | 'Cheque' | 'Direct Deposit'>('Bank Transfer (RTGS/NEFT)');

  // Simulator State
  const [simArea, setSimArea] = useState<number>(900);
  const [simRate, setSimRate] = useState<number>(2150);
  const simCalc = calculateLumpSumPayout({ plotAreaSqft: simArea, purchaseRateSqft: simRate });

  // Summary Metrics
  const summary: LumpSumSchemeSummary = calculateLumpSumSummary(investors);

  // Filtered list
  const filteredInvestors = investors.filter((inv) => {
    const matchesSearch =
      inv.investorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.phone.includes(searchQuery) ||
      inv.seniorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CONDITION_B' && inv.isConditionBMet) ||
      (statusFilter === 'CONDITION_A' && inv.isConditionAMet) ||
      (statusFilter === 'ELIGIBLE' && inv.isPayoutEligible && !inv.isPayoutDisbursed) ||
      (statusFilter === 'DISBURSED' && inv.isPayoutDisbursed) ||
      (statusFilter === 'IN_PROGRESS' && !inv.isPayoutEligible && !inv.isPayoutDisbursed);

    const matchesSlab = slabFilter === 'ALL' || inv.purchaseRateSqft === Number(slabFilter);

    return matchesSearch && matchesStatus && matchesSlab;
  });

  // Notification Toast Helper
  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setShowNotificationToast({ message, type });
    setTimeout(() => setShowNotificationToast(null), 4000);
  };

  // Add Investor Submit
  const handleAddInvestor = (e: React.FormEvent) => {
    e.preventDefault();
    const slabObj = slabs.find((s) => s.purchaseRate === newPurchaseRate) || slabs[0];
    const interest = newCustomInterest !== undefined ? newCustomInterest : slabObj.interestRatePercent;

    const raw: Partial<LumpSumInvestorRecord> = {
      investorName: newInvestorName || 'Valued Investor',
      phone: newPhone || '9876543210',
      email: newEmail || 'investor@example.com',
      seniorName: newSeniorName,
      seniorId: newSeniorId,
      address: newAddress,
      plotNo: `PLT-FPS-${Math.floor(100 + Math.random() * 900)}`,
      plotSizeSqft: newPlotSize,
      purchaseRateSqft: newPurchaseRate,
      interestRatePercent: interest,
      joiningDate: newJoiningDate,
      nominee: {
        nomineeName: newNomineeName || 'Family Nominee',
        nomineeRelation: newNomineeRelation,
        nomineeAge: newNomineeAge,
        nomineePhone: newNomineePhone || newPhone,
      },
      plotsSoldTarget: 7,
      plotsSoldCount: 0,
      soldPlotsList: [],
    };

    const newRecord = recalculateLumpSumInvestorFields(raw);
    setInvestors([newRecord, ...investors]);
    setShowAddModal(false);
    triggerToast(`Investor ${newRecord.investorName} registered with ${newRecord.id}!`);

    // Reset fields
    setNewInvestorName('');
    setNewPhone('');
    setNewEmail('');
    setNewNomineeName('');
  };

  // Record Plot Sale Submit
  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRecordSaleModal) return;

    const target = showRecordSaleModal;
    const newSaleItem = {
      id: `SOLD-${Date.now()}`,
      plotNo: salePlotNo || `PLT-${Math.floor(100 + Math.random() * 900)}`,
      projectName: saleProjectName,
      buyerName: saleBuyerName || 'Direct Buyer',
      buyerPhone: saleBuyerPhone || '9876543210',
      saleAmount: Number(saleAmount),
      saleDate: new Date().toISOString().split('T')[0],
      registeredBy: target.investorName,
      status: 'Verified' as const,
    };

    const updatedSoldList = [newSaleItem, ...target.soldPlotsList];
    const updatedCount = updatedSoldList.length;
    const reachedConditionB = updatedCount >= target.plotsSoldTarget;

    const updatedRaw: Partial<LumpSumInvestorRecord> = {
      ...target,
      soldPlotsList: updatedSoldList,
      plotsSoldCount: updatedCount,
      isConditionBMet: reachedConditionB,
      isPayoutEligible: reachedConditionB || target.isConditionAMet,
      status: reachedConditionB
        ? target.isPayoutDisbursed
          ? 'Disbursed / Completed'
          : 'Eligible - Condition B (7 Plots Sold!)'
        : target.status,
      auditLogs: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleString('en-IN'),
          actor: 'Admin / Sales Desk',
          action: 'Plot Sale Credited',
          details: `Plot ${newSaleItem.plotNo} (${newSaleItem.projectName}) sold to ${newSaleItem.buyerName}. Milestone progress: ${updatedCount}/7 plots.`,
        },
        ...target.auditLogs,
      ],
    };

    const updatedRecord = recalculateLumpSumInvestorFields(updatedRaw);
    setInvestors((prev) => prev.map((inv) => (inv.id === target.id ? updatedRecord : inv)));
    setShowRecordSaleModal(null);

    if (reachedConditionB) {
      triggerToast(`🎉 7-Plot Milestone Reached for ${target.investorName}! Condition B Payout of ${formatINR(target.totalPayableAmount)} is now UNLOCKED!`);
    } else {
      triggerToast(`Plot sale recorded for ${target.investorName}! Progress: ${updatedCount}/7 plots.`);
    }

    // Reset sale form
    setSalePlotNo('');
    setSaleBuyerName('');
    setSaleBuyerPhone('');
  };

  // Disburse Payout Submit
  const handleDisbursePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDisburseModal) return;

    const target = showDisburseModal;
    const txnRef = disburseTxnRef || `RTGS-VPM-${Date.now()}`;

    const updatedRaw: Partial<LumpSumInvestorRecord> = {
      ...target,
      isPayoutDisbursed: true,
      status: 'Disbursed / Completed',
      payoutDisbursedDate: new Date().toISOString().split('T')[0],
      payoutTxnReference: txnRef,
      payoutDisbursedAmount: target.totalPayableAmount,
      payoutMode: disburseMode,
      auditLogs: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleString('en-IN'),
          actor: 'Super Admin / Finance Desk',
          action: 'Lump-Sum Payout Disbursed',
          details: `Settled full payout of ${formatINR(target.totalPayableAmount)} via ${disburseMode}. Reference: ${txnRef}`,
        },
        ...target.auditLogs,
      ],
    };

    const updatedRecord = recalculateLumpSumInvestorFields(updatedRaw);
    setInvestors((prev) => prev.map((inv) => (inv.id === target.id ? updatedRecord : inv)));
    setShowDisburseModal(null);
    triggerToast(`Payout of ${formatINR(target.totalPayableAmount)} successfully disbursed to ${target.investorName}!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvData = generateLumpSumCsv(filteredInvestors);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `VPM_Ek_Musht_Free_Plot_Scheme_Ledger_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-sans text-slate-900" id="admin-lumpsum-scheme-container">
      
      {/* Toast Notification */}
      {showNotificationToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-950 border-2 border-emerald-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{showNotificationToast.message}</span>
        </div>
      )}

      {/* ------------------ HEADER BANNER ------------------ */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              एकमुश्त फ्री प्लॉट स्कीम (Lump-Sum Free Plot Scheme) Module
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-700">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Base: 900 Sq. Ft. Standard Plot</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-white tracking-tight">
              एकमुश्त फ्री प्लॉट स्कीम प्रबंधन व वित्तीय गणना इंजन
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl font-medium leading-relaxed">
              Automated maturity evaluation across <strong>Condition A (12-Year Horizon)</strong> and <strong>Condition B (7-Plot Fast-Track Milestone)</strong> with real-time payout disbursement controls.
            </p>
          </div>

          {/* Dual Business Rules Highlights Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Condition A Card */}
            <div className="bg-indigo-900/60 border border-indigo-700/80 rounded-2xl p-4 space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between text-amber-300 font-extrabold text-xs">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  शर्त-A : 12 वर्ष परिपक्वता (12-Year Tenure Rule)
                </span>
                <span className="bg-amber-400/20 px-2 py-0.5 rounded text-[10px] font-mono">144 Months</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                यदि निवेशक कोई प्लॉट विक्रय नहीं करता है, तो देय कुल राशि <strong>12 वर्ष पूर्ण होने पर</strong> स्वतः प्राप्त होगी।
              </p>
            </div>

            {/* Condition B Card */}
            <div className="bg-emerald-950/60 border border-emerald-600/80 rounded-2xl p-4 space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between text-emerald-300 font-extrabold text-xs">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  शर्त-B : 7 प्लॉट विक्रय मील का पत्थर (Fast-Track 7 Plots)
                </span>
                <span className="bg-emerald-400/20 px-2 py-0.5 rounded text-[10px] font-mono">Immediate Payout</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                यदि निवेशक स्वयं <strong>7 प्लॉट विक्रय</strong> कर देता है, तो देय राशि <strong>7वें प्लॉट की बिक्री पूर्ण होते ही</strong> तत्काल प्राप्त करने का पात्र होगा।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------ KPI METRICS DASHBOARD (Required 8 Widgets) ------------------ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        
        {/* Total Investors */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-1 border-t-4 border-t-indigo-900">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Investors</span>
          <p className="text-xl font-serif font-black text-indigo-950">{summary.totalInvestors}</p>
          <span className="text-[9px] text-slate-400 block font-medium">Registered Active</span>
        </div>

        {/* Total Investment */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-1 border-t-4 border-t-sky-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Invested Capital</span>
          <p className="text-lg font-serif font-black text-sky-950">{formatINR(summary.totalInvestmentAmount)}</p>
          <span className="text-[9px] text-slate-400 block font-medium">900 Sqft Base</span>
        </div>

        {/* Total Payable Amount */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-1 border-t-4 border-t-emerald-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Payable</span>
          <p className="text-lg font-serif font-black text-emerald-800">{formatINR(summary.totalPayableAmount)}</p>
          <span className="text-[9px] text-slate-400 block font-medium">Gross Liability</span>
        </div>

        {/* Total Return Liability */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-1 border-t-4 border-t-amber-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Net Interest ROI</span>
          <p className="text-lg font-serif font-black text-amber-700">{formatINR(summary.totalReturnLiability)}</p>
          <span className="text-[9px] text-slate-400 block font-medium">16.5% - 32% ROI</span>
        </div>

        {/* Condition B Achievers */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-1 border-t-4 border-t-purple-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">7 Plots Achieved</span>
          <p className="text-xl font-serif font-black text-purple-950">{summary.conditionBAchieversCount}</p>
          <span className="text-[9px] text-purple-600 block font-bold">Fast-Track Condition B</span>
        </div>

        {/* Total Plots Sold */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-1 border-t-4 border-t-teal-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Sold Plots</span>
          <p className="text-xl font-serif font-black text-teal-950">{summary.totalPlotsSold}</p>
          <span className="text-[9px] text-teal-600 block font-medium">By Scheme Investors</span>
        </div>

        {/* Eligible for Payout */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-1 border-t-4 border-t-rose-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Eligible Unpaid</span>
          <p className="text-xl font-serif font-black text-rose-950">{summary.eligibleInvestorsCount}</p>
          <span className="text-[9px] text-rose-600 block font-bold">{formatINR(summary.eligiblePayableAmount)}</span>
        </div>

        {/* Disbursed Completed */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-1 border-t-4 border-t-green-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 block">Disbursed</span>
          <p className="text-xl font-serif font-black text-green-950">{summary.completedPayoutsCount}</p>
          <span className="text-[9px] text-green-700 block font-bold">{formatINR(summary.completedDisbursedAmount)}</span>
        </div>

      </div>

      {/* ------------------ 9-SLAB OFFICIAL COMPARISON TABLE & SIMULATOR ------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: 9-Slab Matrix Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif font-bold text-indigo-950 text-base flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-600" />
                एकमुश्त फ्री प्लॉट स्कीम आधिकारिक स्लैब चार्ट (9 Slabs)
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold">
                गणना आधार: <strong className="text-slate-900">900 वर्गफुट प्लॉट</strong> (Clear Title Residential Plots)
              </p>
            </div>
            <button
              onClick={() => setShowSlabManagerModal(true)}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Manage Slabs</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="p-2.5 text-center">क्र.</th>
                  <th className="p-2.5">खरीद मूल्य (₹/वर्गफुट)</th>
                  <th className="p-2.5 text-right">कुल निवेश राशि (₹)</th>
                  <th className="p-2.5 text-center">ब्याज दर %</th>
                  <th className="p-2.5 text-right">देय कुल राशि (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {slabs.map((s) => {
                  const isCurrentSim = simRate === s.purchaseRate;
                  return (
                    <tr
                      key={s.slNo}
                      onClick={() => {
                        setSimRate(s.purchaseRate);
                        setSimArea(900);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isCurrentSim
                          ? 'bg-amber-100/90 font-bold border-l-4 border-l-amber-500'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-2.5 text-center font-mono font-bold text-slate-600">{s.slNo}</td>
                      <td className="p-2.5 font-mono font-bold text-indigo-950">
                        ₹{formatINR(s.purchaseRate)} <span className="text-[10px] font-normal text-slate-500">/ sqft</span>
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-800 font-bold">
                        ₹{formatINR(s.totalInvestmentAmount)}
                      </td>
                      <td className="p-2.5 text-center font-mono font-extrabold text-amber-600 text-sm">
                        {s.interestRatePercent}%
                      </td>
                      <td className="p-2.5 text-right font-mono font-black text-emerald-700 text-sm">
                        ₹{formatINR(s.totalPayableAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-400 italic text-right">
            * किसी भी पंक्ति पर क्लिक करके सिमुलेटर में तुरंत लोड करें।
          </p>
        </div>

        {/* Right: Real-Time Calculator Simulator */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-6 border border-indigo-800 shadow-xl space-y-4">
          <div className="border-b border-indigo-800 pb-3">
            <span className="text-[10px] bg-amber-400/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider border border-amber-400/30">
              Interactive Financial Calculator
            </span>
            <h3 className="text-lg font-serif font-black text-white mt-1 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              एकमुश्त वित्तीय गणना सिमुलेटर
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              स्वतः गणना: कुल निवेश, ब्याज प्रतिशत एवं देय कुल राशि
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-indigo-900/60 p-3 rounded-xl border border-indigo-800">
            <div>
              <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">
                Plot Size (वर्गफुट)
              </label>
              <input
                type="number"
                value={simArea}
                onChange={(e) => setSimArea(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-900 border border-indigo-700 rounded-lg p-2 font-mono text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">
                Purchase Rate (₹/वर्गफुट)
              </label>
              <select
                value={simRate}
                onChange={(e) => setSimRate(Number(e.target.value))}
                className="w-full bg-slate-900 border border-indigo-700 rounded-lg p-2 font-mono text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400"
              >
                {slabs.map((s) => (
                  <option key={s.slNo} value={s.purchaseRate}>
                    ₹{s.purchaseRate} ({s.interestRatePercent}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Display */}
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center p-2.5 bg-indigo-900/80 rounded-lg border border-indigo-800">
              <span className="text-slate-300 font-sans">कुल निवेश राशि (₹):</span>
              <span className="font-extrabold text-white text-sm">₹{formatINR(simCalc.totalInvestmentAmount)}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-indigo-900/80 rounded-lg border border-indigo-800">
              <span className="text-slate-300 font-sans">ब्याज प्रतिशत / ROI:</span>
              <span className="font-extrabold text-amber-300 text-sm">{simCalc.interestRatePercent}%</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-indigo-900/80 rounded-lg border border-indigo-800">
              <span className="text-slate-300 font-sans">कुल लाभ राशि (Interest Amount):</span>
              <span className="font-extrabold text-emerald-400 text-sm">+₹{formatINR(simCalc.totalReturnAmount)}</span>
            </div>

            <div className="flex justify-between items-center p-3.5 bg-emerald-950 border-2 border-emerald-500/80 rounded-xl text-emerald-300 font-sans shadow-lg">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block">
                  देय कुल राशि (Total Payable Amount)
                </span>
                <span className="text-[10px] text-slate-300">
                  (निवेश + {simCalc.interestRatePercent}% ब्याज)
                </span>
              </div>
              <span className="text-2xl font-serif font-black text-emerald-400">
                ₹{formatINR(simCalc.totalPayableAmount)}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setNewPlotSize(simArea);
                setNewPurchaseRate(simRate);
                setShowAddModal(true);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>इस दर पर नया निवेशक नामांकित करें</span>
            </button>
          </div>
        </div>

      </div>

      {/* ------------------ INVESTOR LEDGER TABLE & CONTROLS ------------------ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        
        {/* Top Action Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="font-serif font-bold text-indigo-950 text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              एकमुश्त फ्री प्लॉट स्कीम निवेशक बहीखाता (Investor Ledger)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Manage accounts, track 7 plots sale milestones, check 12-year maturity countdowns, and execute payouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search investor, ID, phone, senior..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-900 font-medium"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONDITION_B">Condition B (7 Plots Sold)</option>
              <option value="CONDITION_A">Condition A (12 Yrs Matured)</option>
              <option value="ELIGIBLE">Eligible (Unpaid)</option>
              <option value="DISBURSED">Disbursed (Settled)</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>

            {/* Slab Rate Filter */}
            <select
              value={slabFilter}
              onChange={(e) => setSlabFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Slabs</option>
              {slabs.map((s) => (
                <option key={s.slNo} value={s.purchaseRate}>
                  ₹{s.purchaseRate}/sqft ({s.interestRatePercent}%)
                </option>
              ))}
            </select>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            {/* Print */}
            <button
              onClick={() => window.print()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
              title="Print Table"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>

            {/* Add Investor Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Scheme Investor</span>
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="p-3">Investor Info & Senior</th>
                <th className="p-3">Plot & Slab</th>
                <th className="p-3 text-right">Investment Amount</th>
                <th className="p-3 text-right">देय कुल राशि (Payable)</th>
                <th className="p-3 text-center">शर्त-B: 7 Plots Sold</th>
                <th className="p-3 text-center">शर्त-A: 12 Yrs Tenure</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredInvestors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-slate-400 italic">
                    No lump-sum free plot scheme investor records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInvestors.map((r) => {
                  const evalRes = evaluateInvestorEligibility(r);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/90 transition-colors">
                      
                      {/* Investor Info */}
                      <td className="p-3">
                        <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <span>{r.investorName}</span>
                          {r.isConditionBMet && (
                            <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                              7 Plots ★
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <span className="font-bold text-slate-700">{r.id}</span> • <span>{r.phone}</span>
                        </div>
                        <div className="text-[10px] text-indigo-900 font-semibold mt-0.5 flex items-center gap-1">
                          <span className="text-slate-400">Senior:</span> {r.seniorName} ({r.seniorId})
                        </div>
                      </td>

                      {/* Plot & Slab */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-slate-900">{r.plotSizeSqft} Sq. Ft.</div>
                        <div className="text-[10px] font-bold text-indigo-900 font-mono">
                          ₹{formatINR(r.purchaseRateSqft)}/sqft • <span className="text-amber-700 font-extrabold">{r.interestRatePercent}% ROI</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Joined: {r.joiningDate}</div>
                      </td>

                      {/* Investment Amount */}
                      <td className="p-3 text-right font-mono">
                        <div className="font-extrabold text-slate-900">₹{formatINR(r.totalInvestmentAmount)}</div>
                        <div className="text-[10px] text-slate-400 font-normal">Base Capital</div>
                      </td>

                      {/* Total Payable Amount */}
                      <td className="p-3 text-right font-mono">
                        <div className="font-black text-emerald-700 text-sm">₹{formatINR(r.totalPayableAmount)}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold">+₹{formatINR(r.totalReturnAmount)} ROI</div>
                      </td>

                      {/* Condition B (7 Plots Milestone) */}
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                            <div
                              className={`h-full ${r.plotsSoldCount >= 7 ? 'bg-purple-600' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(100, (r.plotsSoldCount / 7) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-black text-slate-800">
                            {r.plotsSoldCount} / 7 Plots Sold
                          </span>
                          {r.isConditionBMet ? (
                            <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded border border-purple-200">
                              Unlocked ✓
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400">
                              {7 - r.plotsSoldCount} plots remaining
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Condition A (12 Years Countdown) */}
                      <td className="p-3 text-center">
                        <div className="text-[10px] font-medium text-slate-700">
                          {r.isConditionAMet ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              12 Yrs Matured ✓
                            </span>
                          ) : (
                            <div>
                              <span className="font-bold text-slate-800">{evalRes.timeRemainingText}</span>
                              <div className="text-[9px] text-slate-400">Till {r.maturityDateConditionA}</div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            r.isPayoutDisbursed
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : r.isPayoutEligible
                              ? 'bg-purple-100 text-purple-900 border-purple-400 animate-pulse'
                              : 'bg-sky-100 text-sky-900 border-sky-300'
                          }`}
                        >
                          {r.isPayoutDisbursed
                            ? 'Disbursed ✓'
                            : r.isConditionBMet
                            ? 'Eligible (7 Plots)'
                            : r.isConditionAMet
                            ? 'Eligible (12 Yrs)'
                            : 'In Progress'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* View Details */}
                          <button
                            onClick={() => setShowDetailsModal(r)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors border border-slate-200 cursor-pointer"
                            title="View Full Profile & Plots Roadmap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Certificate / Statement */}
                          <button
                            onClick={() => setShowStatementModal(r)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-lg text-[10px] font-bold transition-colors border border-indigo-200 cursor-pointer"
                            title="Generate Certificate & Statement"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-700" />
                          </button>

                          {/* Record Plot Sale */}
                          <button
                            onClick={() => {
                              setShowRecordSaleModal(r);
                              setSaleBuyerName('');
                              setSalePlotNo(`PLT-${Math.floor(100 + Math.random() * 900)}`);
                            }}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold transition-colors border border-amber-300 cursor-pointer flex items-center gap-1"
                            title="Record Plot Sold by Investor"
                          >
                            <Plus className="w-3 h-3 text-amber-700" />
                            <span>Sale</span>
                          </button>

                          {/* Disburse Payout */}
                          {r.isPayoutEligible && !r.isPayoutDisbursed && (
                            <button
                              onClick={() => setShowDisburseModal(r)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                              title="Authorize & Disburse Lump-Sum Payout"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Disburse</span>
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW LUMP-SUM SCHEME INVESTOR                                  */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider border border-amber-300">
                  Investor Registration Desk
                </span>
                <h3 className="font-serif font-black text-indigo-950 text-xl mt-1 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-900" />
                  एकमुश्त फ्री प्लॉट स्कीम नया निवेशक नामांकन
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInvestor} className="space-y-4">
              
              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Investor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rameshwar Tiwari"
                    value={newInvestorName}
                    onChange={(e) => setNewInvestorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="investor@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={newJoiningDate}
                    onChange={(e) => setNewJoiningDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-900"
                  />
                </div>
              </div>

              {/* Senior / Agent Linking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100">
                <div>
                  <label className="text-xs font-bold text-indigo-950 block mb-1">
                    Senior / Sponsor Agent Name
                  </label>
                  <input
                    type="text"
                    value={newSeniorName}
                    onChange={(e) => setNewSeniorName(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl p-2 text-xs font-medium focus:outline-none focus:border-indigo-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-indigo-950 block mb-1">
                    Senior Agent ID
                  </label>
                  <input
                    type="text"
                    value={newSeniorId}
                    onChange={(e) => setNewSeniorId(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl p-2 text-xs font-medium focus:outline-none focus:border-indigo-900"
                  />
                </div>
              </div>

              {/* Plot & Slab Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Plot Size (Sq. Ft.) - Standard: 900
                  </label>
                  <input
                    type="number"
                    value={newPlotSize}
                    onChange={(e) => setNewPlotSize(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-indigo-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Purchase Rate Slab (₹/sqft)
                  </label>
                  <select
                    value={newPurchaseRate}
                    onChange={(e) => setNewPurchaseRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-indigo-950 focus:outline-none focus:border-indigo-900"
                  >
                    {slabs.map((s) => (
                      <option key={s.slNo} value={s.purchaseRate}>
                        ₹{s.purchaseRate}/sqft — {s.interestRatePercent}% Return (देय: ₹{formatINR(s.totalPayableAmount)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nominee Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Nominee Information (वारिस विवरण)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Nominee Full Name"
                      value={newNomineeName}
                      onChange={(e) => setNewNomineeName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-medium focus:outline-none focus:border-indigo-900"
                    />
                  </div>
                  <div>
                    <select
                      value={newNomineeRelation}
                      onChange={(e) => setNewNomineeRelation(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-medium focus:outline-none focus:border-indigo-900"
                    >
                      <option value="Spouse">Spouse (पति/पत्नी)</option>
                      <option value="Son">Son (पुत्र)</option>
                      <option value="Daughter">Daughter (पुत्री)</option>
                      <option value="Father">Father (पिता)</option>
                      <option value="Mother">Mother (माता)</option>
                      <option value="Brother">Brother (भाई)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Nominee Phone"
                      value={newNomineePhone}
                      onChange={(e) => setNewNomineePhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-medium focus:outline-none focus:border-indigo-900"
                    />
                  </div>
                </div>
              </div>

              {/* Real-Time Live Preview Calculation */}
              {(() => {
                const previewCalc = calculateLumpSumPayout({
                  plotAreaSqft: newPlotSize,
                  purchaseRateSqft: newPurchaseRate,
                });
                return (
                  <div className="bg-emerald-950 text-emerald-300 p-4 rounded-2xl border border-emerald-700/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span>Total Investment: <strong>₹{formatINR(previewCalc.totalInvestmentAmount)}</strong></span>
                      <span>ROI Slab: <strong>{previewCalc.interestRatePercent}%</strong></span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-black border-t border-emerald-800/80 pt-2 text-white">
                      <span>देय कुल राशि (Maturity Amount):</span>
                      <span className="text-lg text-emerald-400 font-serif">₹{formatINR(previewCalc.totalPayableAmount)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Enroll Investor</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RECORD PLOT SALE (CONDITION B TRACKER)                             */}
      {/* ========================================================================= */}
      {showRecordSaleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] bg-purple-100 text-purple-900 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider border border-purple-300">
                  Condition B Sale Tracking
                </span>
                <h3 className="font-serif font-black text-indigo-950 text-lg mt-1">
                  प्लॉट विक्रय दर्ज करें (Record Plot Sale)
                </h3>
              </div>
              <button onClick={() => setShowRecordSaleModal(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
              <p>Investor: <strong>{showRecordSaleModal.investorName}</strong> ({showRecordSaleModal.id})</p>
              <p>Current Milestone: <strong>{showRecordSaleModal.plotsSoldCount} of 7 Plots Sold</strong></p>
              <p className="text-[11px] text-slate-500">Upon reaching 7 plots sold, full payout of <strong>₹{formatINR(showRecordSaleModal.totalPayableAmount)}</strong> is unlocked immediately under Condition B!</p>
            </div>

            <form onSubmit={handleRecordSale} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Plot Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PLT-A108"
                  value={salePlotNo}
                  onChange={(e) => setSalePlotNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Project Name</label>
                <select
                  value={saleProjectName}
                  onChange={(e) => setSaleProjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-900"
                >
                  <option value="Milestone City Prayagraj">Milestone City Prayagraj</option>
                  <option value="Prayag Vihar">Prayag Vihar</option>
                  <option value="Ganga Enclave">Ganga Enclave</option>
                  <option value="Sangam Greens">Sangam Greens</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Buyer Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Buyer Name"
                    value={saleBuyerName}
                    onChange={(e) => setSaleBuyerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Buyer Phone</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={saleBuyerPhone}
                    onChange={(e) => setSaleBuyerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-indigo-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Plot Sale Value (₹)</label>
                <input
                  type="number"
                  step="50000"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-indigo-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecordSaleModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify & Credit Sale ({showRecordSaleModal.plotsSoldCount + 1}/7)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: AUTHORIZE & DISBURSE LUMP-SUM PAYOUT                              */}
      {/* ========================================================================= */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider border border-emerald-300">
                  Financial Settlement
                </span>
                <h3 className="font-serif font-black text-indigo-950 text-lg mt-1">
                  एकमुश्त भुगतान निष्पादित करें
                </h3>
              </div>
              <button onClick={() => setShowDisburseModal(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-950 text-white p-4 rounded-2xl space-y-2 border border-emerald-700">
              <div className="flex justify-between text-xs text-emerald-300">
                <span>Beneficiary:</span>
                <span className="font-bold text-white">{showDisburseModal.investorName}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-300">
                <span>Scheme ID:</span>
                <span className="font-mono text-white">{showDisburseModal.id}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-2 border-t border-emerald-800 text-emerald-400">
                <span>Total Payout Amount:</span>
                <span className="text-xl font-serif">₹{formatINR(showDisburseModal.totalPayableAmount)}</span>
              </div>
            </div>

            <form onSubmit={handleDisbursePayout} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Disbursement Mode</label>
                <select
                  value={disburseMode}
                  onChange={(e: any) => setDisburseMode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-900"
                >
                  <option value="Bank Transfer (RTGS/NEFT)">Bank Transfer (RTGS/NEFT)</option>
                  <option value="Cheque">Account Payee Cheque</option>
                  <option value="Direct Deposit">Direct Bank Deposit</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Bank Transaction Reference / Cheque No. *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RTGS-VPM-20260310-9941"
                  value={disburseTxnRef}
                  onChange={(e) => setDisburseTxnRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-indigo-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Authorize & Complete Payout</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: INVESTOR PROFILE, PASSBOOK & 7-PLOT ROADMAP                        */}
      {/* ========================================================================= */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-white font-serif font-black flex items-center justify-center text-lg border border-indigo-800">
                  {showDetailsModal.investorName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif font-black text-indigo-950 text-xl">
                    {showDetailsModal.investorName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: <strong className="text-indigo-900">{showDetailsModal.id}</strong> • Joined: {showDetailsModal.joiningDate}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scheme Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block text-[10px] uppercase">Plot Size & Rate</span>
                <strong className="text-slate-900 text-sm font-mono">{showDetailsModal.plotSizeSqft} Sq. Ft.</strong>
                <p className="text-[10px] text-slate-500">@ ₹{formatINR(showDetailsModal.purchaseRateSqft)} / sqft</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block text-[10px] uppercase">Invested Amount</span>
                <strong className="text-slate-900 text-sm font-mono">₹{formatINR(showDetailsModal.totalInvestmentAmount)}</strong>
                <p className="text-[10px] text-slate-500">ROI Slab: {showDetailsModal.interestRatePercent}%</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 font-medium block text-[10px] uppercase">देय कुल राशि</span>
                <strong className="text-emerald-950 text-sm font-mono">₹{formatINR(showDetailsModal.totalPayableAmount)}</strong>
                <p className="text-[10px] text-emerald-700 font-bold">+₹{formatINR(showDetailsModal.totalReturnAmount)} Profit</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
                <span className="text-purple-800 font-medium block text-[10px] uppercase">Eligibility Status</span>
                <strong className="text-purple-950 text-xs font-bold block mt-0.5">{showDetailsModal.status}</strong>
              </div>
            </div>

            {/* 7-Plot Milestone Roadmap (Condition B) */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-sm">शर्त-B : 7 प्लॉट विक्रय माइलस्टोन प्रगति</h4>
                </div>
                <span className="text-xs font-mono font-black text-amber-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  {showDetailsModal.plotsSoldCount} of 7 Plots Completed ({Math.round((showDetailsModal.plotsSoldCount / 7) * 100)}%)
                </span>
              </div>

              {/* Visual 7 Slots Grid */}
              <div className="grid grid-cols-7 gap-2 pt-2">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                  const isSold = num <= showDetailsModal.plotsSoldCount;
                  const soldDetail = showDetailsModal.soldPlotsList[num - 1];
                  return (
                    <div
                      key={num}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        isSold
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] font-extrabold uppercase">Plot {num}</div>
                      <div className="text-xs font-black my-1 font-mono">
                        {isSold ? '✓ SOLD' : 'Pending'}
                      </div>
                      {soldDetail && (
                        <div className="text-[8px] text-slate-300 truncate" title={soldDetail.buyerName}>
                          {soldDetail.buyerName}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nominee & Senior Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Nominee Details</span>
                <p className="font-bold text-slate-900 text-sm">{showDetailsModal.nominee.nomineeName}</p>
                <p className="text-slate-600">Relation: <strong>{showDetailsModal.nominee.nomineeRelation}</strong> (Age: {showDetailsModal.nominee.nomineeAge})</p>
                <p className="text-slate-600 font-mono">Phone: {showDetailsModal.nominee.nomineePhone}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Senior / Sponsor Agent</span>
                <p className="font-bold text-indigo-950 text-sm">{showDetailsModal.seniorName}</p>
                <p className="text-slate-600 font-mono">Senior ID: <strong>{showDetailsModal.seniorId}</strong></p>
                <p className="text-slate-600">Address: {showDetailsModal.address}</p>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Audit Log & Event History</h5>
              <div className="max-h-40 overflow-y-auto space-y-1.5 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                {showDetailsModal.auditLogs.map((log) => (
                  <div key={log.id} className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-700"><strong>[{log.timestamp}]</strong> {log.action}: {log.details}</span>
                    <span className="text-slate-400 shrink-0 ml-2">by {log.actor}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PRINTABLE OFFICIAL CERTIFICATE & STATEMENT                         */}
      {/* ========================================================================= */}
      {showStatementModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>Official Scheme Certificate & Statement</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button onClick={() => setShowStatementModal(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="border-4 border-double border-amber-600/40 p-6 rounded-2xl bg-amber-50/20 space-y-5 text-center">
              <div className="space-y-1">
                <h4 className="font-serif font-black text-xl text-indigo-950 tracking-wide">
                  VIGYA PAURUSH MILESTONE PVT. LTD.
                </h4>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                  CIN: U70109UP2026PTC123456 • Registered Office, Prayagraj, UP
                </p>
                <div className="inline-block bg-amber-500/20 text-amber-900 border border-amber-500/40 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider mt-2">
                  एकमुश्त फ्री प्लॉट स्कीम प्रमाण पत्र (Scheme Certificate)
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed text-left">
                This is to officially certify that <strong>{showStatementModal.investorName}</strong> (Investor ID: <span className="font-mono font-bold text-indigo-950">{showStatementModal.id}</span>) is duly registered under the <strong>एकमुश्त फ्री प्लॉट स्कीम</strong> with the following financial parameters:
              </p>

              <div className="grid grid-cols-2 gap-3 text-left font-mono text-xs bg-white p-4 rounded-xl border border-amber-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Plot Size</span>
                  <strong className="text-slate-900">{showStatementModal.plotSizeSqft} Sq. Ft.</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Purchase Rate</span>
                  <strong className="text-slate-900">₹{formatINR(showStatementModal.purchaseRateSqft)} / sqft</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Total Invested Amount</span>
                  <strong className="text-indigo-950">₹{formatINR(showStatementModal.totalInvestmentAmount)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Return Slab / ROI</span>
                  <strong className="text-amber-700">{showStatementModal.interestRatePercent}%</strong>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-serif">
                  <span className="text-slate-700 font-sans font-bold">देय कुल राशि (Total Payable):</span>
                  <span className="font-black text-emerald-800 text-lg">₹{formatINR(showStatementModal.totalPayableAmount)}</span>
                </div>
              </div>

              {/* Conditions Summary */}
              <div className="text-left text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p><strong>• शर्त-A:</strong> 12 वर्ष पूर्ण होने पर परिपक्वता राशि (Maturity Date: {showStatementModal.maturityDateConditionA})</p>
                <p><strong>• शर्त-B:</strong> 7 प्लॉट विक्रय पूर्ण होने पर तत्काल देय (Current: {showStatementModal.plotsSoldCount}/7 Plots)</p>
                <p><strong>• वारिस (Nominee):</strong> {showStatementModal.nominee.nomineeName} ({showStatementModal.nominee.nomineeRelation})</p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 pt-8 text-xs text-slate-600">
                <div>
                  <div className="h-10" />
                  <p className="font-bold text-slate-900">{showStatementModal.investorName}</p>
                  <p className="text-[10px]">Investor Signature</p>
                </div>
                <div>
                  <div className="h-10" />
                  <p className="font-bold text-slate-900">Authorized Signatory / Managing Director</p>
                  <p className="text-[10px]">Vigya Paurush Milestone Pvt. Ltd.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: DYNAMIC SLAB MANAGER                                              */}
      {/* ========================================================================= */}
      {showSlabManagerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] bg-indigo-100 text-indigo-900 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider border border-indigo-300">
                  Admin Configuration Desk
                </span>
                <h3 className="font-serif font-black text-indigo-950 text-lg mt-1">
                  आधिकारिक 9 स्लैब दर एवं ब्याज प्रतिशत प्रबंधन
                </h3>
              </div>
              <button onClick={() => setShowSlabManagerModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="p-2">Slab</th>
                    <th className="p-2">Purchase Rate (₹/sqft)</th>
                    <th className="p-2">Base Sqft</th>
                    <th className="p-2">Investment (₹)</th>
                    <th className="p-2">Interest %</th>
                    <th className="p-2">Total Payable (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {slabs.map((s, idx) => (
                    <tr key={s.slNo}>
                      <td className="p-2 font-mono font-bold">{s.slNo}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={s.purchaseRate}
                          onChange={(e) => {
                            const newRate = Number(e.target.value);
                            const updated = [...slabs];
                            const inv = newRate * s.plotAreaSqft;
                            const ret = (inv * s.interestRatePercent) / 100;
                            updated[idx] = {
                              ...s,
                              purchaseRate: newRate,
                              totalInvestmentAmount: inv,
                              totalPayableAmount: inv + ret,
                            };
                            setSlabs(updated);
                          }}
                          className="w-24 bg-slate-50 border border-slate-200 rounded p-1 font-mono font-bold text-xs"
                        />
                      </td>
                      <td className="p-2 font-mono">{s.plotAreaSqft}</td>
                      <td className="p-2 font-mono font-bold text-slate-800">₹{formatINR(s.totalInvestmentAmount)}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.5"
                          value={s.interestRatePercent}
                          onChange={(e) => {
                            const newPct = Number(e.target.value);
                            const updated = [...slabs];
                            const ret = (s.totalInvestmentAmount * newPct) / 100;
                            updated[idx] = {
                              ...s,
                              interestRatePercent: newPct,
                              totalPayableAmount: s.totalInvestmentAmount + ret,
                            };
                            setSlabs(updated);
                          }}
                          className="w-16 bg-slate-50 border border-slate-200 rounded p-1 font-mono font-bold text-xs text-amber-600"
                        />
                      </td>
                      <td className="p-2 font-mono font-black text-emerald-700">₹{formatINR(s.totalPayableAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSlabs(LUMPSUM_SCHEME_SLABS);
                  triggerToast('Slabs restored to default official rates.');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Reset to Default
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSlabManagerModal(false);
                  triggerToast('Slab configuration updated successfully!');
                }}
                className="px-5 py-2 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Save & Apply Slabs
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
