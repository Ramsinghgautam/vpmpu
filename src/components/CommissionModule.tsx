import React, { useState } from 'react';
import {
  BUYER_COMMISSION_SLABS,
  AGENT_COMMISSION_SLABS,
  TEAM_BONUS_LEVELS,
  calculateCumulativeBuyerCommission,
  calculateCumulativeAgentCommission,
  formatINR
} from '../utils/calculators';
import { Language } from '../types';
import { Award, Users, Calculator, Network, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { TRANSLATIONS } from '../utils/translations';

interface CommissionModuleProps {
  currentLang: Language;
  onNavigate: (section: string) => void;
}

export const CommissionModule: React.FC<CommissionModuleProps> = ({ currentLang, onNavigate }) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [calcRole, setCalcRole] = useState<'buyer' | 'agent'>('buyer');
  const [numPlots, setNumPlots] = useState<number>(3);
  const [avgPlotPrice, setAvgPlotPrice] = useState<number>(1500000); // 15 Lakhs default

  const buyerResult = calculateCumulativeBuyerCommission(numPlots, avgPlotPrice);
  const agentResult = calculateCumulativeAgentCommission(numPlots, avgPlotPrice);
  const activeResult = calcRole === 'buyer' ? buyerResult : agentResult;

  return (
    <section className="py-20 bg-slate-50 text-slate-900 font-sans border-b border-slate-200" id="commission-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-amber-200">
            <Award className="w-4 h-4 text-amber-600" />
            <span>COMMISSION MANAGEMENT & MLM TEAM BONUS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-black text-indigo-950 tracking-tight">
            Transparent Commission & <span className="text-amber-600 italic font-serif">Multi-Tier Bonus Structure</span>
          </h2>

          <p className="text-slate-600 text-sm leading-relaxed">
            VIGYA PAURUSH MILESTONE PRIVATE LIMITED rewards both direct buyers and registered sales agents through progressive plot sales commission slabs and level team bonuses.
          </p>
        </div>

        {/* Triple Column Tables: Buyer Commission, Agent Commission & Team Bonus */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Buyer Commission Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 border-t-4 border-t-emerald-600">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                1
              </span>
              <div>
                <h3 className="font-serif font-bold text-indigo-950 text-base">Buyer Commission Table</h3>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Earned directly by property buyers</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="p-2">Plot Slab</th>
                  <th className="p-2 text-right">Commission %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {BUYER_COMMISSION_SLABS.map((slab) => (
                  <tr key={slab.plotNumber} className="hover:bg-emerald-50/50">
                    <td className="p-2">{slab.label}</td>
                    <td className="p-2 text-right font-bold text-emerald-700">{slab.commissionPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Agent Commission Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 border-t-4 border-t-amber-500">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs">
                2
              </span>
              <div>
                <h3 className="font-serif font-bold text-indigo-950 text-base">Agent Commission Table</h3>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Direct agent sales earnings per plot</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="p-2">Plot Slab</th>
                  <th className="p-2 text-right">Commission %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {AGENT_COMMISSION_SLABS.map((slab) => (
                  <tr key={slab.plotNumber} className="hover:bg-amber-50/50">
                    <td className="p-2">{slab.label}</td>
                    <td className="p-2 text-right font-bold text-amber-700">{slab.commissionPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Team Bonus MLM Levels Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 border-t-4 border-t-indigo-950">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-950 font-bold flex items-center justify-center text-xs">
                3
              </span>
              <div>
                <h3 className="font-serif font-bold text-indigo-950 text-base">Team Bonus Levels (MLM)</h3>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Overrides for team leaders & mentors</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="p-2">Level Rank</th>
                  <th className="p-2 text-right">Bonus %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {TEAM_BONUS_LEVELS.map((level) => (
                  <tr key={level.levelName} className="hover:bg-indigo-50/50">
                    <td className="p-2 font-semibold text-slate-900">{level.levelName}</td>
                    <td className="p-2 text-right font-extrabold text-indigo-950">{level.bonusPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Interactive Commission Calculator */}
        <div className="bg-indigo-950 text-white rounded-2xl p-6 sm:p-8 border border-indigo-900 shadow-2xl font-sans">
          <div className="border-b border-indigo-900 pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-serif font-black text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                Interactive Commission Payout Simulator
              </h3>
              <p className="text-xs text-slate-300">Calculate cumulative earnings for multi-plot bookings</p>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center gap-1 bg-indigo-900/80 p-1 rounded-xl border border-indigo-800 text-[10px] font-bold uppercase tracking-wider">
              <button
                onClick={() => setCalcRole('buyer')}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${calcRole === 'buyer' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                Buyer Cashback
              </button>
              <button
                onClick={() => setCalcRole('agent')}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${calcRole === 'agent' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}
              >
                Agent Earnings
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Inputs */}
            <div className="md:col-span-5 space-y-5 text-xs">
              <div>
                <div className="flex justify-between text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">
                  <span>Number of Plots Booked</span>
                  <span className="text-amber-400 font-mono text-sm">{numPlots} Plot(s)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="9"
                  value={numPlots}
                  onChange={(e) => setNumPlots(Number(e.target.value))}
                  className="w-full h-2 bg-indigo-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Average Plot Price (₹)</label>
                <input
                  type="number"
                  step="50000"
                  value={avgPlotPrice}
                  onChange={(e) => setAvgPlotPrice(Number(e.target.value))}
                  className="w-full bg-indigo-900/80 border border-indigo-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400 font-mono text-sm"
                />
              </div>

              <div className="bg-indigo-900/90 p-4 rounded-xl border border-indigo-800">
                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-wider">Total Calculated Commission Payout</span>
                <p className="text-3xl font-serif font-black text-emerald-400 mt-1">
                  {formatINR(activeResult.totalCommission)}
                </p>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="md:col-span-7 bg-indigo-900/80 p-5 rounded-xl border border-indigo-800 space-y-3 text-xs">
              <h4 className="font-serif font-bold text-amber-400 border-b border-indigo-800 pb-2 text-sm">
                Plot-by-Plot Commission Breakdown
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {activeResult.breakdown.map((item) => (
                  <div key={item.plotNo} className="flex justify-between items-center bg-indigo-950 p-2.5 rounded-lg border border-indigo-800">
                    <span className="text-slate-200 font-bold">Plot #{item.plotNo}</span>
                    <span className="text-slate-300 text-[11px]">Rate: <strong className="text-amber-300">{item.percent}%</strong></span>
                    <span className="font-bold text-emerald-400">{formatINR(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
