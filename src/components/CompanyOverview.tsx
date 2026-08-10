import React from 'react';
import { ShieldCheck, Users, TrendingUp, Landmark, Eye, Compass, Award, CheckCircle } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface CompanyOverviewProps {
  currentLang: Language;
  onNavigate: (section: string) => void;
}

export const CompanyOverview: React.FC<CompanyOverviewProps> = ({ currentLang, onNavigate }) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const isHi = currentLang === 'hi';

  return (
    <section id="about-section" className="py-20 bg-slate-50 text-slate-800 font-sans border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-900/10 text-indigo-950 text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-indigo-200">
            <Landmark className="w-3.5 h-3.5 text-indigo-900" />
            <span>{t.aboutCompany || "ABOUT VIGYA PAURUSH MILESTONE PRIVATE LIMITED"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-black text-indigo-950 tracking-tight">
            {t.buildingWealthHeading || "Building Wealth & Security Through Transparent Real Estate"}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {t.companyDesc || '"VIGYA PAURUSH MILESTONE PRIVATE LIMITED" was founded to eliminate ambiguity in plot purchases, empower local agents with structured commissions, and provide investors with asset-backed, risk-free returns.'}
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-200 hover:border-indigo-900 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-950 text-amber-400 flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-indigo-950">{t.ourMission || "Our Mission"}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t.missionDesc || "To deliver premium quality residential & commercial plots in Prayagraj with 100% legal clearance, immediate possession, clear registry (Dakhil Kharij), and accessible booking terms starting at just ₹10,000."}
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-200 hover:border-amber-500 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-indigo-950">{t.ourVision || "Our Vision"}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t.visionDesc || "To create India's most trusted real estate ecosystem where buyers receive cash back commissions, agents grow into team co-partners, and investors enjoy up to 32% guaranteed returns backed by land collateral."}
            </p>
          </div>
        </div>

        {/* Triple Pillar Benefits Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-indigo-950">{t.whyChooseUs}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Tailored advantages for every stakeholder</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Buyer Benefits */}
            <div className="bg-white rounded-2xl p-6 border-t-4 border-t-indigo-950 border-x border-b border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-950 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg text-indigo-950">{t.buyerBenefits}</h4>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Plot Buyer Cash Back:</strong> Earn 15.5% commission on 1st plot down to 4.5% on 45th plot.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Low Booking Amount:</strong> Lock your dream plot with flat ₹10,000 fee.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Legal Peace of Mind:</strong> 100% Freehold land with RERA compliance and quick registry.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Easy EMI Plans:</strong> Flexible installment tenure over 12 or 24 or 36 or 48 or 60 months.</span>
                </li>
              </ul>
              <button
                onClick={() => onNavigate('plot-booking')}
                className="mt-6 w-full text-center py-2.5 text-[11px] font-bold uppercase tracking-widest text-indigo-950 border border-indigo-950/20 rounded-lg hover:bg-indigo-950 hover:text-amber-400 transition-colors"
              >
                Book Your Plot
              </button>
            </div>

            {/* Agent Benefits */}
            <div className="bg-white rounded-2xl p-6 border-t-4 border-t-amber-500 border-x border-b border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg text-indigo-950">{t.agentBenefits}</h4>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Direct Sales Commission:</strong> Starts at 8% on 1st plot down to 2% on 45th plot.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>MLM Team Bonus Pool:</strong> Earn up to 5% bonus across 9 levels (Buyer to Co-Partner).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Instant Agent ID & Portal:</strong> Track referrals, downlines & monthly payouts in real-time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Setup Cost:</strong> Free agent onboarding & marketing brochure support.</span>
                </li>
              </ul>
              <button
                onClick={() => onNavigate('career')}
                className="mt-6 w-full text-center py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
              >
                Register as Agent
              </button>
            </div>

            {/* Investor Benefits */}
            <div className="bg-white rounded-2xl p-6 border-t-4 border-t-emerald-600 border-x border-b border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg text-indigo-950">{t.investorBenefits}</h4>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>High ROI Slabs:</strong> Guaranteed 16.5% to 32% return based on land rate slabs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Assigned Base Rate:</strong> Calculated under base plot rate of ₹1,000 per sq.ft.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>100% Capped Safety:</strong> Investor payout cannot exceed total invested capital.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Asset Collateral:</strong> Plots are registered/allotted against your investment.</span>
                </li>
              </ul>
              <button
                onClick={() => onNavigate('investment')}
                className="mt-6 w-full text-center py-2.5 text-[11px] font-bold uppercase tracking-widest text-emerald-900 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                View Investor Plans
              </button>
            </div>

          </div>
        </div>

        {/* Director Note Banner */}
        <div className="bg-indigo-950 text-white rounded-2xl p-8 border border-indigo-900 shadow-xl flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl border-4 border-indigo-900 shrink-0">
            PG
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl font-serif font-bold text-amber-400">Prabhat Gautam — Director's Statement</h4>
            <p className="text-slate-300 text-xs sm:text-sm italic leading-relaxed font-serif">
              "Our promise at Vigya Paurush Milestone Private Limited is simple: Absolute transparency, timely possession of plots, and unwavering commitment to financial growth for our buyers, partners, and investors across Uttar Pradesh."
            </p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider pt-1">
              Contact Director Office: +91 7275300974 / 6394918657 | Address: 4/199 EWS AVC New Jhunsi, Prayagraj
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
