import React, { useState } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Calculator, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  DollarSign, 
  Percent, 
  Award,
  Clock,
  Send,
  Building,
  Info
} from 'lucide-react';
import { 
  RISK_FREE_INVESTOR_PLANS, 
  RISK_FREE_HINDI_NOTE, 
  RISK_FREE_ENGLISH_NOTE,
  BASE_PLOT_RATE,
  STANDARD_PLOT_SIZE,
  STANDARD_CUSTOMER_COMMISSION,
  buildInvestorPlan
} from '../data/riskFreePlansData';
import { RiskFreeInvestorPlan } from '../types';

interface RiskFreeInvestorPublicViewProps {
  onSelectPlanForEnrollment?: (plan: RiskFreeInvestorPlan) => void;
  onClose?: () => void;
}

export const RiskFreeInvestorPublicView: React.FC<RiskFreeInvestorPublicViewProps> = ({
  onSelectPlanForEnrollment,
  onClose
}) => {
  const [selectedRate, setSelectedRate] = useState<number>(1450);
  const [customSqft, setCustomSqft] = useState<number>(STANDARD_PLOT_SIZE);
  const [customSalePrice, setCustomSalePrice] = useState<number>(1500000);
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantPhone, setApplicantPhone] = useState<string>('');
  const [applicantEmail, setApplicantEmail] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);

  const currentPlanConfig = RISK_FREE_INVESTOR_PLANS.find(p => p.purchaseRate === selectedRate) || RISK_FREE_INVESTOR_PLANS[4];
  const activePlan = buildInvestorPlan(currentPlanConfig.purchaseRate, currentPlanConfig.commissionRate, customSqft, currentPlanConfig.badgeLabel);

  // Math calculations for live simulation
  const simulatedCommissionPerSale = Math.round(customSalePrice * (activePlan.commissionRate / 100));
  const estimatedSalesToRecover = Math.ceil(activePlan.recoveryTarget / Math.max(simulatedCommissionPerSale, 1));

  const handleSubmitEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone) return;

    // Call API or callback
    fetch('/api/risk-free-investors/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investorName: applicantName,
        phone: applicantPhone,
        email: applicantEmail,
        purchaseRate: activePlan.purchaseRate,
        plotSizeSqft: activePlan.plotSizeSqft,
        commissionRate: activePlan.commissionRate
      })
    }).catch(err => console.log('Enrollment log:', err));

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setShowApplyModal(false);
      if (onSelectPlanForEnrollment) {
        onSelectPlanForEnrollment(activePlan);
      }
    }, 2000);
  };

  return (
    <div className="space-y-8 bg-slate-950 text-slate-100 p-4 md:p-8 rounded-3xl border border-amber-500/20 shadow-2xl">
      
      {/* Header Banner - Gold & Dark Theme */}
      <div className="relative overflow-hidden p-6 md:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>VPM Real Estate High-ROI Guarantee</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
            VGM Risk Free Investor System
          </h1>

          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Purchase plot equity at tiered rates (₹1,050 - ₹2,150/sqft) and unlock enhanced commission payouts (16.5% to 32.0%) until your total principal investment + guaranteed interest liability is 100% recovered!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/20">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Base Plot Rate</span>
              <span className="text-sm md:text-base font-black text-amber-400">₹{BASE_PLOT_RATE} / sqft</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/20">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Standard Plot Size</span>
              <span className="text-sm md:text-base font-black text-white">{STANDARD_PLOT_SIZE} sqft</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/20">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Max Investor Comm.</span>
              <span className="text-sm md:text-base font-black text-emerald-400">Up to 32.0%</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/20">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Standard Base Comm.</span>
              <span className="text-sm md:text-base font-black text-sky-400">{STANDARD_CUSTOMER_COMMISSION}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Hindi & English Warning Note */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-black text-amber-400 uppercase tracking-wide">
            अनिवार्य नियम एवं सूचना / Statutory Terms & Policy
          </h4>
          <p className="text-xs md:text-sm font-semibold text-amber-200 leading-relaxed font-sans">
            "{RISK_FREE_HINDI_NOTE}"
          </p>
          <p className="text-[11px] text-amber-300/80 leading-relaxed pt-1">
            ({RISK_FREE_ENGLISH_NOTE})
          </p>
        </div>
      </div>

      {/* 9 Risk-Free Investor Plans Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Select Risk Free Investor Plan Slab</span>
            </h2>
            <p className="text-xs text-slate-400">Choose a purchase rate slab to inspect principal, interest, and recovery targets.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {RISK_FREE_INVESTOR_PLANS.map((plan) => {
            const isSelected = selectedRate === plan.purchaseRate;

            return (
              <div 
                key={plan.purchaseRate}
                onClick={() => setSelectedRate(plan.purchaseRate)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                  isSelected 
                    ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/10 scale-[1.02]' 
                    : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Selected</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-slate-800 text-amber-400 border border-slate-700">
                      {plan.badgeLabel}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Rate: ₹{plan.purchaseRate}/sqft</span>
                  </div>

                  <div className="pt-1">
                    <div className="text-2xl font-black text-white">
                      ₹{plan.investmentAmount.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-slate-400">Principal Investment ({plan.plotSizeSqft} sqft)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Commission Rate:</span>
                    <span className="font-extrabold text-emerald-400">{plan.commissionRate}%</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span>Interest Liability:</span>
                    <span className="font-extrabold text-amber-400">+₹{plan.interestAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">Total Recovery Target:</span>
                    <span className="font-black text-amber-300 text-sm">₹{plan.recoveryTarget.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRate(plan.purchaseRate);
                    setShowApplyModal(true);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-lg shadow-amber-400/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <span>Enrol Plan ₹{plan.purchaseRate}/sqft</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Financial Calculator Section */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <span>Interactive Investor Recovery Simulator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Test custom plot sqft sizes and simulated plot sale values to calculate exact recovery timeline.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Selected Plan Slab:</span>
            <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              ₹{activePlan.purchaseRate}/sqft ({activePlan.commissionRate}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4 md:col-span-1">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Plot Size (SqFt):
              </label>
              <input
                type="number"
                value={customSqft}
                onChange={(e) => setCustomSqft(Math.max(100, parseInt(e.target.value) || 900))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Estimated Average Plot Sale Value (₹):
              </label>
              <input
                type="number"
                step="50000"
                value={customSalePrice}
                onChange={(e) => setCustomSalePrice(Math.max(100000, parseInt(e.target.value) || 1500000))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2">
              <span className="font-bold text-amber-400 block">Payout Formula:</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Commission per sale = Sale Value × {activePlan.commissionRate}%
              </p>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Each earned commission directly reduces your remaining Recovery Target liability until ₹0 balance.
              </p>
            </div>
          </div>

          {/* Results Display */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Principal Investment</span>
              <div className="text-xl font-black text-white">₹{activePlan.principalAmount.toLocaleString('en-IN')}</div>
              <span className="text-[11px] text-slate-500">{activePlan.purchaseRate} Rate × {activePlan.plotSizeSqft} SqFt</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Guaranteed Interest ({activePlan.interestRate}%)</span>
              <div className="text-xl font-black text-amber-400">+₹{activePlan.interestAmount.toLocaleString('en-IN')}</div>
              <span className="text-[11px] text-slate-500">Fixed return liability</span>
            </div>

            <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 sm:col-span-2 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-300 uppercase">Total Recovery Target Liability</span>
                <span className="text-2xl font-black text-amber-400">₹{activePlan.recoveryTarget.toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-amber-500/20 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Earned Comm. Per Plot Sale:</span>
                  <span className="font-extrabold text-emerald-400 text-sm">₹{simulatedCommissionPerSale.toLocaleString('en-IN')}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Est. Sales To Full Recovery:</span>
                  <span className="font-extrabold text-sky-400 text-sm">~{estimatedSalesToRecover} Plot Sales</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply / Enrol Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Enroll in Risk Free Investor Plan</h3>
                  <p className="text-xs text-amber-400 font-bold">Plan: ₹{activePlan.purchaseRate}/sqft ({activePlan.commissionRate}% Comm.)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {isSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-black text-white">Enrollment Request Submitted!</h4>
                <p className="text-xs text-slate-400">Our director team will review your KYC and activate your Risk Free Investor dashboard within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnrollment} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Investor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Vikramaditya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Mobile Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="10 digit mobile number"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="investor@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Principal Amount ({activePlan.plotSizeSqft} sqft):</span>
                    <span className="font-bold text-white">₹{activePlan.principalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>Recovery Target Liability:</span>
                    <span>₹{activePlan.recoveryTarget.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-amber-400 text-slate-950 font-black hover:bg-amber-300 shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit & Proceed</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
