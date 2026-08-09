import React, { useState } from 'react';
import { Calculator, Award, ArrowRight, ShieldCheck, TrendingUp, CheckCircle2 } from 'lucide-react';
import {
  CUSTOMER_COMMISSION_SLABS,
  calculateCustomerSaleCommission,
  STANDARD_CUSTOMER_PLOT_VALUE,
  MANDATORY_CUSTOMER_RULE_HINDI,
  MANDATORY_CUSTOMER_RULE_ENG
} from '../data/customerCommissionEngine';
import { formatINR } from '../utils/calculators';

export const CustomerCommissionCalculatorView: React.FC = () => {
  const [saleNumberInput, setSaleNumberInput] = useState<number>(1);
  const [customPlotValue, setCustomPlotValue] = useState<number>(STANDARD_CUSTOMER_PLOT_VALUE);

  const currentCalc = calculateCustomerSaleCommission(customPlotValue, saleNumberInput);

  // Cumulative total calculation for up to N plot sales
  const calculateCumulativeTotal = (plotsCount: number) => {
    let totalComm = 0;
    for (let i = 1; i <= plotsCount; i++) {
      const res = calculateCustomerSaleCommission(customPlotValue, i);
      totalComm += res.commissionEarned;
    }
    return totalComm;
  };

  const cumulativeEarned = calculateCumulativeTotal(saleNumberInput);

  return (
    <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 space-y-8 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            Customer Progressive Sales Calculator
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-amber-100">
            Customer Plot Sales & Progressive Commission Calculator
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Standard Company Plot Rate: ₹1,000 / Sqft (900 Sqft Plot = ₹9,00,000). Progressive 15.5% down to 4.5% fixed slab engine.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 rounded-2xl text-right shrink-0">
          <span className="text-[10px] font-bold text-amber-400 uppercase block">First Sale Rate</span>
          <span className="text-2xl font-black text-amber-300">15.5% Commission</span>
        </div>
      </div>

      {/* Mandatory Customer Disclaimer Rule Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/50 rounded-2xl p-5 shadow-inner">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">
              ग्राहक कमीशन नीति निर्देश (Mandatory Company Policy)
            </h4>
            <p className="text-sm font-semibold text-amber-100 leading-relaxed">
              "{MANDATORY_CUSTOMER_RULE_HINDI}"
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Form & Live Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-6">
          <h3 className="font-bold text-sm text-amber-300 uppercase tracking-wide border-b border-slate-800 pb-2">
            Simulate Plot Sales
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex justify-between">
              <span>Plot Sale Number</span>
              <span className="text-amber-400 font-mono">Sale #{saleNumberInput}</span>
            </label>
            <input
              type="range"
              min={1}
              max={50}
              value={saleNumberInput}
              onChange={(e) => setSaleNumberInput(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1st Plot (15.5%)</span>
              <span>25th Plot (8.75%)</span>
              <span>45th Plot (4.5%)</span>
              <span>50th+ (4.5% Fixed)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">
              Select or Enter Plot Value
            </label>
            <input
              type="number"
              value={customPlotValue}
              onChange={(e) => setCustomPlotValue(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400">
              Default Standard Plot (900 Sqft @ ₹1,000/sqft = ₹9,00,000)
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 block">Quick Presets</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSaleNumberInput(1)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                  saleNumberInput === 1
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                1st Sale (15.5%)
              </button>

              <button
                type="button"
                onClick={() => setSaleNumberInput(10)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                  saleNumberInput === 10
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                10th Sale (13.25%)
              </button>

              <button
                type="button"
                onClick={() => setSaleNumberInput(46)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                  saleNumberInput === 46
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                46th+ (4.5% Fixed)
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Active Sale Calculation */}
            <div className="bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-5 space-y-3 shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Commission for Sale #{currentCalc.saleNumber}
              </span>
              <div className="text-3xl font-black text-amber-300">
                {formatINR(currentCalc.commissionEarned)}
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">Applicable Slab Rate:</span>
                <span className="font-bold text-amber-400 font-mono text-sm">
                  {currentCalc.slabPercentage}%
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Slab Range: {currentCalc.slabLabel}
              </div>
            </div>

            {/* Cumulative Earnings */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 space-y-3 shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Cumulative Earnings ({saleNumberInput} Plots)
              </span>
              <div className="text-3xl font-black text-emerald-300">
                {formatINR(cumulativeEarned)}
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">Total Plot Sales Value:</span>
                <span className="font-bold text-slate-200 font-mono text-sm">
                  {formatINR(customPlotValue * saleNumberInput)}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Average Rate: {((cumulativeEarned / (customPlotValue * saleNumberInput)) * 100).toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Full Slab Table Preview */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
              <span>Customer Commission Slab Schedule (45 Plots + Fixed 4.5%)</span>
              <span className="text-amber-400 text-[10px]">Standard ₹9 Lakh Plot Basis</span>
            </h4>

            <div className="overflow-x-auto max-h-60 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Slab Range</th>
                    <th className="p-2.5">Plot Count</th>
                    <th className="p-2.5">Commission %</th>
                    <th className="p-2.5 text-right">Payout / Plot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {CUSTOMER_COMMISSION_SLABS.map((s) => {
                    const isActive =
                      (s.maxSales === null && saleNumberInput >= s.minSales) ||
                      (s.maxSales !== null &&
                        saleNumberInput >= s.minSales &&
                        saleNumberInput <= s.maxSales);

                    return (
                      <tr
                        key={s.slabIndex}
                        className={isActive ? 'bg-amber-500/20 text-amber-300 font-bold' : 'hover:bg-slate-900/60 text-slate-300'}
                      >
                        <td className="p-2.5">{s.label}</td>
                        <td className="p-2.5 text-slate-400">{s.plotsInSlab === 99999 ? 'Unlimited' : `${s.plotsInSlab} Plots`}</td>
                        <td className="p-2.5 text-amber-400">{s.percentage}%</td>
                        <td className="p-2.5 text-right font-black">{formatINR(s.commissionPerPlot)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
