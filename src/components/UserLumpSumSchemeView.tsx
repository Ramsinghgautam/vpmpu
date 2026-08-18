import React, { useState } from 'react';
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
  Users
} from 'lucide-react';
import {
  LumpSumInvestorRecord,
  LumpSumSchemeSlab,
} from '../types';
import {
  LUMPSUM_SCHEME_SLABS,
  INITIAL_LUMPSUM_INVESTORS,
  evaluateInvestorEligibility,
  calculateLumpSumPayout,
} from '../utils/lumpSumSchemeEngine';
import { formatINR } from '../utils/calculators';

interface UserLumpSumSchemeViewProps {
  currentInvestorId?: string;
  isDarkMode?: boolean;
}

export const UserLumpSumSchemeView: React.FC<UserLumpSumSchemeViewProps> = ({
  currentInvestorId = 'LFPS-2026-001',
  isDarkMode = false,
}) => {
  // Current active investor selector (for demo/switching)
  const [selectedInvestorId, setSelectedInvestorId] = useState<string>(currentInvestorId);
  const [allInvestors, setAllInvestors] = useState<LumpSumInvestorRecord[]>(INITIAL_LUMPSUM_INVESTORS);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  // Live Simulator state inside user view
  const [simArea, setSimArea] = useState<number>(900);
  const [simRate, setSimRate] = useState<number>(2150);
  const simCalc = calculateLumpSumPayout({ plotAreaSqft: simArea, purchaseRateSqft: simRate });

  // Active investor record
  const currentInvestor =
    allInvestors.find((i) => i.id === selectedInvestorId) || allInvestors[0];

  const evalResult = evaluateInvestorEligibility(currentInvestor);

  return (
    <div className="space-y-8 font-sans text-slate-900" id="user-lumpsum-scheme-portal">
      
      {/* ------------------ SWITCH INVESTOR BAR (For Multi-account/Agent demo) ------------------ */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold">
          <Users className="w-4 h-4 text-amber-400" />
          <span>Active Investor Passbook Profile:</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedInvestorId}
            onChange={(e) => {
              setSelectedInvestorId(e.target.value);
              setClaimSubmitted(false);
            }}
            className="bg-slate-800 border border-slate-700 text-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-amber-400"
          >
            {allInvestors.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.investorName} ({inv.id}) — {inv.plotsSoldCount}/7 Plots Sold
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ------------------ WELCOME & MATURITY STATUS HERO ------------------ */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800/80 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              एकमुश्त फ्री प्लॉट स्कीम निवेशक पासबुक (Investor Passbook)
            </span>
            <span className="text-xs font-mono font-bold bg-slate-800/80 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
              Passbook ID: {currentInvestor.id}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                नमस्ते, {currentInvestor.investorName}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium">
                Registered Plot: <strong className="text-amber-300">{currentInvestor.plotSizeSqft} Sq. Ft.</strong> ({currentInvestor.plotNo}) @ <strong className="text-white">₹{formatINR(currentInvestor.purchaseRateSqft)}/sqft</strong> with guaranteed <strong className="text-emerald-400">{currentInvestor.interestRatePercent}% Return</strong>.
              </p>
            </div>

            {/* Payout Status Pill & Action */}
            <div className="shrink-0 flex items-center gap-3">
              {currentInvestor.isPayoutDisbursed ? (
                <div className="bg-emerald-950/90 border-2 border-emerald-500 text-emerald-300 px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-[10px] uppercase font-black text-emerald-400">Payout Disbursed</div>
                    <div className="text-sm font-bold font-mono">₹{formatINR(currentInvestor.totalPayableAmount)}</div>
                  </div>
                </div>
              ) : currentInvestor.isPayoutEligible ? (
                <button
                  onClick={() => setShowClaimModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-xl animate-pulse cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Claim Unlocked Payout (₹{formatINR(currentInvestor.totalPayableAmount)})</span>
                </button>
              ) : (
                <div className="bg-indigo-900/60 border border-indigo-700 text-indigo-200 px-4 py-2.5 rounded-2xl text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                  <span className="font-bold text-amber-300">In Progress ({7 - currentInvestor.plotsSoldCount} plots to condition B)</span>
                </div>
              )}
            </div>
          </div>

          {/* 4 Financial Highlight Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-indigo-900/50 p-3.5 rounded-2xl border border-indigo-800/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Invested Capital</span>
              <p className="text-base sm:text-lg font-serif font-black text-white mt-0.5">₹{formatINR(currentInvestor.totalInvestmentAmount)}</p>
              <span className="text-[9px] text-slate-400">{currentInvestor.plotSizeSqft} Sqft @ ₹{currentInvestor.purchaseRateSqft}/sqft</span>
            </div>

            <div className="bg-indigo-900/50 p-3.5 rounded-2xl border border-indigo-800/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Return Percentage</span>
              <p className="text-base sm:text-lg font-serif font-black text-amber-300 mt-0.5">{currentInvestor.interestRatePercent}% ROI</p>
              <span className="text-[9px] text-slate-400">Fixed Scheme Return</span>
            </div>

            <div className="bg-indigo-900/50 p-3.5 rounded-2xl border border-indigo-800/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Profit Amount</span>
              <p className="text-base sm:text-lg font-serif font-black text-emerald-400 mt-0.5">+₹{formatINR(currentInvestor.totalReturnAmount)}</p>
              <span className="text-[9px] text-emerald-300 font-medium">Over Principal</span>
            </div>

            <div className="bg-emerald-950/80 p-3.5 rounded-2xl border-2 border-emerald-600/80">
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider block">देय कुल परिपक्वता राशि</span>
              <p className="text-base sm:text-xl font-serif font-black text-white mt-0.5">₹{formatINR(currentInvestor.totalPayableAmount)}</p>
              <span className="text-[9px] text-emerald-300 font-bold">Total Maturity Receivable</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------ DUAL TRACK PROGRESS: CONDITION A vs CONDITION B ------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Track 1: Condition B (7 Plots Fast-Track Milestone) */}
        <div className="bg-white rounded-3xl p-6 border border-purple-200 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-900">
                <Award className="w-5 h-5 text-purple-800" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-base">
                  शर्त-B : 7 प्लॉट विक्रय फास्ट-ट्रैक माइलस्टोन
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  7 प्लॉट बिकते ही तत्काल परिपक्वता राशि प्राप्त करें
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-black px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
              {currentInvestor.plotsSoldCount} / 7 Plots ({Math.round((currentInvestor.plotsSoldCount / 7) * 100)}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-500 ${
                  currentInvestor.plotsSoldCount >= 7 ? 'bg-emerald-500' : 'bg-purple-600'
                }`}
                style={{ width: `${Math.min(100, (currentInvestor.plotsSoldCount / 7) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>0 Plots</span>
              <span>Target: 7 Plots</span>
            </div>
          </div>

          {/* 7 Visual Plot Slots */}
          <div className="grid grid-cols-7 gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => {
              const isCompleted = num <= currentInvestor.plotsSoldCount;
              const plotData = currentInvestor.soldPlotsList[num - 1];
              return (
                <div
                  key={num}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    isCompleted
                      ? 'bg-purple-950 text-purple-200 border-purple-800'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <span className="text-[9px] font-bold block">Plot {num}</span>
                  <span className="text-xs font-black block my-0.5">
                    {isCompleted ? '✓ Sold' : 'Open'}
                  </span>
                  {plotData && (
                    <span className="text-[8px] text-amber-300 block truncate" title={plotData.buyerName}>
                      {plotData.buyerName}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Milestone Status Message */}
          <div className={`p-3.5 rounded-2xl text-xs font-medium ${
            currentInvestor.isConditionBMet
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-purple-50 text-purple-900 border border-purple-200'
          }`}>
            {currentInvestor.isConditionBMet ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>बधाई!</strong> आपने 7 प्लॉट विक्रय का लक्ष्य पूर्ण कर लिया है। आपकी देय राशि <strong>₹{formatINR(currentInvestor.totalPayableAmount)}</strong> तत्काल रिलीज हेतु पात्र है!
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-700 shrink-0" />
                <span>
                  देय राशि तत्काल प्राप्त करने के लिए मात्र <strong>{7 - currentInvestor.plotsSoldCount} प्लॉट</strong> की बिक्री शेष है।
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Track 2: Condition A (12-Year Maturity Tenure) */}
        <div className="bg-white rounded-3xl p-6 border border-indigo-200 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-900">
                <Clock className="w-5 h-5 text-indigo-900" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-base">
                  शर्त-A : 12 वर्ष पूर्ण परिपक्वता गारंटी
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  यदि कोई प्लॉट विक्रय नहीं भी होता है, तो 12 वर्ष बाद स्वतः भुगतान
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-950 border border-indigo-200">
              144 Months
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600">नामांकन तिथि (Joining Date):</span>
              <strong className="text-slate-900 font-mono">{currentInvestor.joiningDate}</strong>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600">परिपक्वता तिथि (12-Yr Maturity Date):</span>
              <strong className="text-indigo-950 font-mono">{currentInvestor.maturityDateConditionA}</strong>
            </div>

            <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-xl border border-indigo-200">
              <span className="text-indigo-950 font-bold">शेष परिपक्वता समय (Time Remaining):</span>
              <strong className="text-indigo-900 font-bold">{evalResult.timeRemainingText}</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
            <p className="leading-relaxed">
              <strong>नोट:</strong> यदि 12 वर्ष के दौरान कभी भी 7 प्लॉट विक्रय पूर्ण हो जाते हैं (शर्त-B), तो 12 वर्ष की प्रतीक्षा करने की आवश्यकता नहीं होगी — भुगतान तुरंत प्राप्त होगा!
            </p>
          </div>
        </div>

      </div>

      {/* ------------------ DETAILED FINANCIAL PASSBOOK & NOMINEE ------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Passbook Ledger (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif font-bold text-indigo-950 text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                प्लॉट बिक्री विवरण बहीखाता (Sold Plots Ledger under Scheme)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Records of all buyers attributed to your 7-plot fast-track milestone
              </p>
            </div>
            <button
              onClick={() => setShowCertificateModal(true)}
              className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Official Certificate</span>
            </button>
          </div>

          {currentInvestor.soldPlotsList.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
              <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-700">No plots credited yet towards Condition B.</p>
              <p className="text-slate-400 max-w-sm mx-auto">
                Sell plots directly or refer buyers through your sponsor agent to complete 7 plots and unlock your maturity payout immediately!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="p-2.5">Plot No. & Project</th>
                    <th className="p-2.5">Buyer Name</th>
                    <th className="p-2.5 text-right">Sale Amount</th>
                    <th className="p-2.5 text-center">Date</th>
                    <th className="p-2.5 text-center">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {currentInvestor.soldPlotsList.map((sp) => (
                    <tr key={sp.id} className="hover:bg-slate-50">
                      <td className="p-2.5">
                        <div className="font-bold text-indigo-950">{sp.plotNo}</div>
                        <div className="text-[10px] text-slate-500">{sp.projectName}</div>
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-800">{sp.buyerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{sp.buyerPhone}</div>
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        ₹{formatINR(sp.saleAmount)}
                      </td>
                      <td className="p-2.5 text-center font-mono text-slate-600">
                        {sp.saleDate}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="bg-emerald-100 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-300">
                          {sp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Nominee & Senior Agent Info (1 Col) */}
        <div className="space-y-4">
          
          {/* Nominee Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              वारिस विवरण (Nominee Information)
            </span>
            <div className="space-y-1">
              <h4 className="font-serif font-black text-slate-900 text-base">
                {currentInvestor.nominee.nomineeName}
              </h4>
              <p className="text-xs text-slate-600">
                Relation: <strong className="text-slate-900">{currentInvestor.nominee.nomineeRelation}</strong> (Age: {currentInvestor.nominee.nomineeAge} Yrs)
              </p>
              <p className="text-xs text-slate-600 font-mono">
                Phone: <strong className="text-slate-900">{currentInvestor.nominee.nomineePhone}</strong>
              </p>
            </div>
          </div>

          {/* Sponsor / Senior Agent Card */}
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-3xl p-5 border border-indigo-800 shadow-sm space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              Sponsor / Senior Agent
            </span>
            <div className="space-y-1">
              <h4 className="font-serif font-black text-white text-base">
                {currentInvestor.seniorName}
              </h4>
              <p className="text-xs text-slate-300 font-mono">
                Senior ID: <strong className="text-amber-300">{currentInvestor.seniorId}</strong>
              </p>
              <p className="text-xs text-slate-300">
                Assigned Branch: Civil Lines, Prayagraj Desk
              </p>
            </div>
            <div className="pt-2 border-t border-indigo-800/80">
              <button
                onClick={() => alert(`Connecting with Senior ${currentInvestor.seniorName}...`)}
                className="w-full py-2 bg-indigo-800/80 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Contact Sponsor Desk
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ------------------ SCHEME 9-SLAB EXPLORER FOR INVESTORS ------------------ */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-serif font-bold text-indigo-950 text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-600" />
              एकमुश्त फ्री प्लॉट स्कीम आधिकारिक 9 स्लैब मैट्रिक्स (Scheme Slab Matrix)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Explore return percentages across all purchase rate slabs for 900 Sq. Ft. plots
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-3 text-center">
          {LUMPSUM_SCHEME_SLABS.map((slab) => {
            const isCurrentInvestorSlab = slab.purchaseRate === currentInvestor.purchaseRateSqft;
            return (
              <div
                key={slab.slNo}
                className={`p-3 rounded-2xl border transition-all ${
                  isCurrentInvestorSlab
                    ? 'bg-amber-50 border-2 border-amber-500 text-slate-900 shadow-md scale-105'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase">Slab {slab.slNo}</div>
                <div className="text-xs font-black text-indigo-950 my-1 font-mono">₹{slab.purchaseRate}/sqft</div>
                <div className="text-sm font-black text-amber-600 font-mono">{slab.interestRatePercent}%</div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">Invest: ₹{formatINR(slab.totalInvestmentAmount)}</div>
                <div className="text-[10px] font-black text-emerald-700 font-mono mt-0.5">देय: ₹{formatINR(slab.totalPayableAmount)}</div>
                {isCurrentInvestorSlab && (
                  <span className="mt-2 block bg-amber-500 text-slate-950 font-black text-[8px] uppercase tracking-wider py-0.5 rounded">
                    Your Slab
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CLAIM PAYOUT                                                       */}
      {/* ========================================================================= */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-black text-indigo-950 text-lg">
                परिपक्वता भुगतान दावा (Claim Payout)
              </h3>
              <button onClick={() => setShowClaimModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                &times;
              </button>
            </div>

            {claimSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">Claim Request Submitted Successfully!</h4>
                <p className="text-xs text-slate-500">
                  Your settlement request for <strong>₹{formatINR(currentInvestor.totalPayableAmount)}</strong> has been routed to the Finance Desk for RTGS/NEFT disbursement.
                </p>
                <button
                  onClick={() => {
                    setShowClaimModal(false);
                    setClaimSubmitted(false);
                  }}
                  className="px-5 py-2 bg-indigo-950 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="bg-emerald-950 text-emerald-300 p-4 rounded-2xl border border-emerald-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Eligible Settlement Amount</span>
                  <p className="text-2xl font-serif font-black text-white">₹{formatINR(currentInvestor.totalPayableAmount)}</p>
                  <p className="text-[10px] text-slate-300">Unlocked via Condition B (7 Plots Sold Milestone Reached!)</p>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">Bank Account / IFSC for Direct Credit</label>
                  <input
                    type="text"
                    placeholder="Bank Name, A/C Number & IFSC Code"
                    defaultValue="State Bank of India, A/C: 38921049281, IFSC: SBIN0001234"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-xs focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setShowClaimModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setClaimSubmitted(true)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md cursor-pointer"
                  >
                    Submit Claim Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL CERTIFICATE                                               */}
      {/* ========================================================================= */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-xs uppercase text-indigo-950 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600" />
                एकमुश्त फ्री प्लॉट स्कीम आधिकारिक प्रमाण पत्र
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-indigo-950 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button onClick={() => setShowCertificateModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  &times;
                </button>
              </div>
            </div>

            <div className="border-4 border-double border-amber-600/40 p-6 rounded-2xl bg-amber-50/20 space-y-4 text-center">
              <h4 className="font-serif font-black text-xl text-indigo-950">
                VIGYA PAURUSH MILESTONE PVT. LTD.
              </h4>
              <p className="text-[10px] text-slate-500 font-mono">
                CIN: U70109UP2026PTC123456 • Civil Lines, Prayagraj, UP
              </p>
              <div className="inline-block bg-amber-500/20 text-amber-900 font-black px-4 py-1 rounded-full text-xs uppercase">
                एकमुश्त फ्री प्लॉट स्कीम प्रमाण पत्र
              </div>

              <p className="text-xs text-slate-700 text-left pt-2 leading-relaxed">
                This is to certify that <strong>{currentInvestor.investorName}</strong> (ID: <span className="font-mono font-bold">{currentInvestor.id}</span>) is an enrolled investor with a standard <strong>{currentInvestor.plotSizeSqft} Sq. Ft.</strong> residential plot @ <strong>₹{formatINR(currentInvestor.purchaseRateSqft)}/sqft</strong> ({currentInvestor.interestRatePercent}% Return Guarantee).
              </p>

              <div className="grid grid-cols-2 gap-3 text-left font-mono text-xs bg-white p-3.5 rounded-xl border border-amber-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">Invested Capital</span>
                  <strong className="text-slate-900">₹{formatINR(currentInvestor.totalInvestmentAmount)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">देय कुल राशि (Payable)</span>
                  <strong className="text-emerald-800 text-sm">₹{formatINR(currentInvestor.totalPayableAmount)}</strong>
                </div>
              </div>

              <div className="text-left text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p>• शर्त-A: 12 वर्ष परिपक्वता (Maturity Date: {currentInvestor.maturityDateConditionA})</p>
                <p>• शर्त-B: 7 प्लॉट विक्रय होने पर तत्काल देय (Current: {currentInvestor.plotsSoldCount}/7 Plots)</p>
                <p>• वारिस (Nominee): {currentInvestor.nominee.nomineeName} ({currentInvestor.nominee.nomineeRelation})</p>
              </div>

              <div className="grid grid-cols-2 pt-6 text-xs text-slate-600">
                <div>
                  <p className="font-bold text-slate-900">{currentInvestor.investorName}</p>
                  <p className="text-[10px]">Investor Signature</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Authorized Signatory</p>
                  <p className="text-[10px]">Vigya Paurush Milestone Pvt. Ltd.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
