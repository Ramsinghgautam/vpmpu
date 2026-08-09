import React, { useState } from 'react';
import {
  Calculator,
  Percent,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Building2,
  CheckCircle2,
  Info,
  DollarSign,
  ArrowRight,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  AGENT_COMMISSION_SLABS,
  RISK_FREE_INVESTOR_RATES,
  BASE_PLOT_VALUE,
  STANDARD_PLOT_SIZE_SQFT,
  STANDARD_MONTHLY_EMI_AMOUNT,
  STANDARD_EMI_PERIOD_MONTHS,
  MANDATORY_BUSINESS_RULE_HINDI,
  MANDATORY_BUSINESS_RULE_ENG,
  getSlabForSaleNumber,
  calculateAgentSaleCommission
} from '../data/agentCommissionEngine';
import { formatINR } from '../utils/calculators';

export const AgentCommissionCalculatorView: React.FC = () => {
  const [saleNumberInput, setSaleNumberInput] = useState<number>(1);
  const [saleType, setSaleType] = useState<'Standard Plot' | 'Risk Free Investor Plot'>('Standard Plot');
  const [selectedInvestorRate, setSelectedInvestorRate] = useState<number>(1450); // Plan 5 default
  const [currentRemainingLiability, setCurrentRemainingLiability] = useState<number>(900000);

  // Compute values dynamically
  const activeSlab = getSlabForSaleNumber(saleNumberInput);
  
  let targetSaleValue = BASE_PLOT_VALUE;
  if (saleType === 'Risk Free Investor Plot') {
    targetSaleValue = selectedInvestorRate * STANDARD_PLOT_SIZE_SQFT;
  }

  const calculationResult = calculateAgentSaleCommission(
    targetSaleValue,
    saleNumberInput - 1, // plots sold before this target sale
    currentRemainingLiability
  );

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 text-white shadow-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm tracking-wider uppercase mb-1">
            <Calculator className="w-4 h-4" />
            Dynamic Agent Commission & EMI Simulator
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-100">
            Real Estate Agent Plot Sales Calculator
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Simulate plot sales commissions, dynamic slab progressions, and 50/50 EMI liability offsets.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl px-4 py-3 text-right">
          <span className="text-xs text-amber-300 font-semibold uppercase block">Standard Plot Base</span>
          <span className="text-xl font-black text-amber-400">{formatINR(BASE_PLOT_VALUE)}</span>
          <span className="text-xs text-slate-400 block">{STANDARD_PLOT_SIZE_SQFT} Sqft @ ₹1,000/Sqft</span>
        </div>
      </div>

      {/* Mandatory Hindi Disclaimer Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-500/60 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">
              महत्वपूर्ण व्यावसायिक नियम (Mandatory Business Rule)
            </h4>
            <p className="text-sm font-semibold text-amber-100 leading-relaxed">
              "{MANDATORY_BUSINESS_RULE_HINDI}"
            </p>
            <p className="text-xs text-slate-300 italic pt-1 border-t border-amber-500/20">
              {MANDATORY_BUSINESS_RULE_ENG}
            </p>
          </div>
        </div>
      </div>

      {/* Slabs Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          Dynamic Commission Slab Structure
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {AGENT_COMMISSION_SLABS.map((slab) => {
            const isActive = activeSlab.slabIndex === slab.slabIndex;
            return (
              <div
                key={slab.slabIndex}
                className={`p-3 rounded-xl border transition-all text-center ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/10 scale-105'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-bold uppercase truncate">{slab.label}</div>
                <div className={`text-xl font-black my-0.5 ${isActive ? 'text-amber-400' : 'text-slate-200'}`}>
                  {slab.percentage}%
                </div>
                <div className="text-[10px] text-slate-400">
                  {slab.maxSales ? `Sales ${slab.minSales}-${slab.maxSales}` : `Sales ${slab.minSales}+`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calculator Interactive Form & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-6 bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-5">
          <h3 className="text-base font-bold text-amber-300 flex items-center gap-2 border-b border-slate-700 pb-3">
            <Calculator className="w-4 h-4 text-amber-400" />
            Sale Inputs & Parameters
          </h3>

          {/* Sale Number / Position */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex justify-between">
              <span>Sale Plot Number Position</span>
              <span className="text-amber-400 font-bold">Sale #{saleNumberInput}</span>
            </label>
            <input
              type="range"
              min={1}
              max={40}
              value={saleNumberInput}
              onChange={(e) => setSaleNumberInput(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-700 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>1st Sale (8.0%)</span>
              <span>10th Sale (6.25%)</span>
              <span>25th Sale (4.0%)</span>
              <span>40th Sale (2.0%)</span>
            </div>
          </div>

          {/* Sale Type Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Sale Category</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSaleType('Standard Plot')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                  saleType === 'Standard Plot'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                Standard Plot (₹9,00,000)
              </button>
              <button
                type="button"
                onClick={() => setSaleType('Risk Free Investor Plot')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                  saleType === 'Risk Free Investor Plot'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                Risk Free Investor Sale
              </button>
            </div>
          </div>

          {/* If Risk Free Investor Sale - Select Rate Plan */}
          {saleType === 'Risk Free Investor Plot' && (
            <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-amber-500/30">
              <label className="text-xs font-semibold text-amber-300 flex justify-between">
                <span>Risk Free Investor Purchase Rate Plan</span>
                <span className="font-bold text-amber-400">₹{selectedInvestorRate}/Sqft</span>
              </label>
              <select
                value={selectedInvestorRate}
                onChange={(e) => setSelectedInvestorRate(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {RISK_FREE_INVESTOR_RATES.map((plan) => (
                  <option key={plan.plan} value={plan.rateSqft}>
                    {plan.plan}: {plan.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 italic">
                Note: Commission is calculated on actual investor purchase value using active slab % ({activeSlab.percentage}%).
              </p>
            </div>
          )}

          {/* Current Remaining EMI Liability Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex justify-between">
              <span>Agent's Outstanding Plot EMI Liability</span>
              <span className="text-amber-400 font-bold">{formatINR(currentRemainingLiability)}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={900000}
                step={5000}
                value={currentRemainingLiability}
                onChange={(e) => setCurrentRemainingLiability(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCurrentRemainingLiability(0)}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-2 rounded-lg shrink-0"
              >
                Set Liability = ₹0
              </button>
              <button
                type="button"
                onClick={() => setCurrentRemainingLiability(900000)}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2.5 py-2 rounded-lg shrink-0"
              >
                Reset Full (₹9L)
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Calculations */}
        <div className="lg:col-span-6 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-amber-500/40 rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Calculated Breakdown
            </span>
            <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase">
              Active Slab: {activeSlab.percentage}%
            </span>
          </div>

          {/* Sale Value & Gross Comm */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 block">Total Sale Plot Value</span>
              <span className="text-lg font-black text-white">{formatINR(targetSaleValue)}</span>
            </div>
            <div className="bg-amber-950/40 p-3 rounded-lg border border-amber-500/30">
              <span className="text-[11px] text-amber-300 block font-semibold">Gross Commission ({activeSlab.percentage}%)</span>
              <span className="text-xl font-black text-amber-400">{formatINR(calculationResult.grossCommission)}</span>
            </div>
          </div>

          {/* 50/50 Split Box */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              Commission Split Distribution Strategy
            </h4>

            {currentRemainingLiability > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-xs text-emerald-300 font-bold mb-1">
                    <span>50% Agent Cash Wallet</span>
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-lg font-black text-emerald-400">
                    {formatINR(calculationResult.netWalletAmount)}
                  </div>
                  <p className="text-[10px] text-emerald-200/70 mt-1">Directly withdrawable cash payout</p>
                </div>

                <div className="bg-indigo-950/40 border border-indigo-500/40 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-xs text-indigo-300 font-bold mb-1">
                    <span>50% EMI Offset</span>
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-lg font-black text-indigo-400">
                    {formatINR(calculationResult.emiDeductionAmount)}
                  </div>
                  <p className="text-[10px] text-indigo-200/70 mt-1">Deducted to reduce plot EMI liability</p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-950/60 border-2 border-emerald-500 p-4 rounded-lg text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 text-emerald-400 font-black text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Plot Liability Fully Cleared (₹0)
                </div>
                <div className="text-2xl font-black text-emerald-300">
                  {formatINR(calculationResult.netWalletAmount)} (100% Wallet Credit)
                </div>
                <p className="text-xs text-emerald-200/80">
                  Since plot liability is zero, entire commission goes directly to your Cash Wallet!
                </p>
              </div>
            )}
          </div>

          {/* Updated Liability Projection */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Remaining EMI Liability After Sale:</span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {formatINR(calculationResult.newRemainingLiability)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
