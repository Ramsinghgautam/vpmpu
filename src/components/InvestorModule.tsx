import React, { useState } from 'react';
import { INVESTOR_SLABS, calculateInvestorRoi, formatINR } from '../utils/calculators';
import { InvestmentRecord, Language } from '../types';
import { TrendingUp, ShieldAlert, CheckCircle2, Calculator, Landmark, ShieldCheck, ArrowRight, DollarSign } from 'lucide-react';
import { TRANSLATIONS } from '../utils/translations';

interface InvestorModuleProps {
  currentLang: Language;
  onNavigate: (section: string) => void;
  onSubmitInvestment: (record: Partial<InvestmentRecord>) => void;
}

export const InvestorModule: React.FC<InvestorModuleProps> = ({
  currentLang,
  onNavigate,
  onSubmitInvestment
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const isHi = currentLang === 'hi';

  // Interactive Calculator State
  const [selectedRate, setSelectedRate] = useState<number>(1450); // Default 22.5%
  const [sqftArea, setSqftArea] = useState<number>(2000); // 2000 sq.ft default

  const [investorName, setInvestorName] = useState('');
  const [investorPhone, setInvestorPhone] = useState('');
  const [investorEmail, setInvestorEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const roiCalc = calculateInvestorRoi(selectedRate, sqftArea);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorName || !investorPhone) {
      alert(isHi ? "कृपया निवेशक का नाम और मोबाइल नंबर दर्ज करें।" : "Please enter investor name and phone number.");
      return;
    }

    onSubmitInvestment({
      investorName,
      phone: investorPhone,
      email: investorEmail,
      ratePerSqft: selectedRate,
      roiPercentage: roiCalc.roiPercentage,
      sqftInvested: sqftArea,
      totalInvestedAmount: roiCalc.totalInvestedAmount,
      basePlotCost: roiCalc.baseCost,
      estimatedRoiPayout: roiCalc.cappedRoiPayout,
      investmentDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    });

    setSubmitted(true);
  };

  return (
    <section className="py-20 bg-indigo-950 text-white font-sans border-b border-indigo-900" id="investment-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-900 border border-indigo-800 text-amber-300 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>{t.investmentSlabsHeading || "RISK-FREE INVESTOR ROI MODULE"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight">
            {t.investorTitle || "Asset-Backed Real Estate Investment with Up to 32% ROI"}
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            {t.investorSub || "All investor return slabs operate under a standard base plot valuation of ₹1,000 per sq.ft. Your investment is backed by real plot land collateral with 100% capital safety rule."}
          </p>
        </div>

        {/* Investment Slabs Grid Table */}
        <div className="bg-indigo-900/60 rounded-2xl p-6 border border-indigo-800 shadow-xl mb-16">
          <div className="flex items-center justify-between mb-6 border-b border-indigo-800 pb-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Guaranteed Investor ROI Rates Table
              </h3>
              <p className="text-xs text-slate-300">Select any rate slab to simulate your estimated return payout</p>
            </div>

            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Base Price: ₹1,000 / sq.ft
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INVESTOR_SLABS.map((slab) => {
              const isSelected = selectedRate === slab.ratePerSqft;
              return (
                <div
                  key={slab.ratePerSqft}
                  onClick={() => setSelectedRate(slab.ratePerSqft)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg ring-1 ring-amber-400'
                      : 'bg-indigo-950 border-indigo-800 hover:border-indigo-700 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-extrabold text-amber-400 text-base">₹{slab.ratePerSqft} / sq.ft</span>
                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                      {slab.roiPercentage}% ROI
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1">
                    Base land cost ₹1,000/sqft + ₹{slab.ratePerSqft - 1000} investment premium
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Investor ROI Calculator & Submission Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Calculator Output Display */}
          <div className="lg:col-span-7 bg-indigo-900/80 p-6 sm:p-8 rounded-2xl border border-indigo-800 shadow-xl space-y-6">
            <div className="border-b border-indigo-800 pb-4 flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                Automated ROI Calculator
              </h3>
              <span className="text-[10px] text-amber-300 font-mono font-bold uppercase tracking-widest">Formula: ROI % = Slab Rate</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                  <span>Investment Area Size (Sq.Ft)</span>
                  <span className="text-amber-400 font-mono text-sm">{sqftArea} sq.ft</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={sqftArea}
                  onChange={(e) => setSqftArea(Number(e.target.value))}
                  className="w-full h-2 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">
                  <span>500 sq.ft</span>
                  <span>5,000 sq.ft</span>
                  <span>10,000 sq.ft</span>
                </div>
              </div>

              {/* Live Calculation Results Breakdown */}
              <div className="bg-indigo-950 p-5 rounded-xl border border-indigo-800 space-y-3 text-xs">
                <div className="flex justify-between border-b border-indigo-900 pb-2">
                  <span className="text-slate-300">Selected Rate Slab</span>
                  <span className="font-bold text-amber-300">₹{selectedRate} / sq.ft ({roiCalc.roiPercentage}% ROI)</span>
                </div>

                <div className="flex justify-between border-b border-indigo-900 pb-2">
                  <span className="text-slate-300">Total Invested Amount</span>
                  <span className="font-extrabold text-white text-sm">{formatINR(roiCalc.totalInvestedAmount)}</span>
                </div>

                <div className="flex justify-between border-b border-indigo-900 pb-2">
                  <span className="text-slate-300">Base Land Collateral Cost (₹1000/sqft)</span>
                  <span className="font-bold text-slate-300">{formatINR(roiCalc.baseCost)}</span>
                </div>

                <div className="flex justify-between border-b border-indigo-900 pb-2">
                  <span className="text-slate-300">Calculated ROI Payout</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{formatINR(roiCalc.cappedRoiPayout)}</span>
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">Total Maturity Return</span>
                  <span className="font-black font-serif text-amber-400 text-xl">{formatINR(roiCalc.totalReturn)}</span>
                </div>
              </div>

              {/* Rules Notice */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-xs space-y-1 text-amber-200">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Capping Rule & Investor Safety</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Investor commission cannot exceed total invested capital. Calculated payout is 100% backed by land allotment rights.
                </p>
              </div>
            </div>
          </div>

          {/* Investor Registration Form */}
          <div className="lg:col-span-5 bg-indigo-900/80 p-6 rounded-2xl border border-indigo-800 shadow-xl">
            <h3 className="text-base font-serif font-bold text-white mb-4 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-400" />
              Apply for Investor Plan
            </h3>

            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-emerald-300 font-serif text-lg">Application Submitted!</h4>
                <p className="text-xs text-slate-300">
                  Our director Mr. Prabhat Gautam will review your investment request and contact you within 2 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-amber-400 hover:underline font-bold uppercase tracking-wider"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Investor Full Name *</label>
                  <input
                    type="text"
                    value={investorName}
                    onChange={(e) => setInvestorName(e.target.value)}
                    placeholder="e.g. Sanjay Gupta"
                    className="w-full bg-indigo-950 border border-indigo-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={investorPhone}
                    onChange={(e) => setInvestorPhone(e.target.value)}
                    placeholder="e.g. 9988776655"
                    className="w-full bg-indigo-950 border border-indigo-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={investorEmail}
                    onChange={(e) => setInvestorEmail(e.target.value)}
                    placeholder="e.g. investor@example.com"
                    className="w-full bg-indigo-950 border border-indigo-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>

                <div className="bg-indigo-950 p-3 rounded-lg border border-indigo-800 text-[11px] text-slate-300">
                  <span>Target Investment: <strong>{formatINR(roiCalc.totalInvestedAmount)}</strong> @ {roiCalc.roiPercentage}% ROI</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-widest py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <span>Submit Investor Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
