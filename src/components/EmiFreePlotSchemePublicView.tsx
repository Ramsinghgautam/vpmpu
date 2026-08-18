import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Calculator,
  Percent,
  Download,
  Info,
  DollarSign,
  Sparkles,
  ChevronRight,
  Building2,
  Gift,
} from 'lucide-react';
import { loadEmiPlansFromStorage } from '../utils/freePlotEmiSchemeEngine';
import { formatINR } from '../utils/calculators';

export const EmiFreePlotSchemePublicView: React.FC = () => {
  const [plans] = useState(() => loadEmiPlansFromStorage());
  const [selectedTenure, setSelectedTenure] = useState<number>(12);
  const [simulatedPlotsSold, setSimulatedPlotsSold] = useState<number>(2);

  const selectedPlan = plans.find((p) => p.tenureMonths === selectedTenure) || plans[0];

  return (
    <div className="bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white border border-amber-500/30 shadow-2xl space-y-10 font-sans" id="free-plot-emi-scheme-showcase">
      
      {/* ----------------- SECTION HEADER ----------------- */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>20.5% फ्री प्लॉट स्कीम – किस्तों में प्लॉट • 20.5% ROI</span>
        </div>

        <h3 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-tight">
          900 वर्गफुट प्लॉट — आसान मासिक किस्तों में निवेश एवं 20.5% वार्षिक प्रतिफल
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          विज्ञ पौरुष माइलस्टोन की विशेष EMI योजना: 12 से 120 माह की विभिन्न किस्तों में 900 Sq.Ft. प्लॉट बुक करें। समय पूर्व 6/5 प्लॉट बिक्री पर <strong>फास्ट-ट्रैक भुगतान</strong> तथा प्रत्येक प्लॉट बिक्री पर <strong>अतिरिक्त मासिक बोनस</strong> प्राप्त करें!
        </p>
      </div>

      {/* ----------------- 10-TENURE MATRIX CARDS ----------------- */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/80 pb-3">
          <div>
            <h4 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              10-अवधि EMI योजना मैट्रिक्स (12 से 120 माह) • 20.5% दर
            </h4>
            <p className="text-xs text-slate-400">अपनी सुविधानुसार EMI अवधि चुनें और तुरंत रिटर्न देखें</p>
          </div>

          <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-full">
            Standard Plot Size: 900 Sq. Ft.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {plans.map((plan) => {
            const isSelected = selectedTenure === plan.tenureMonths;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedTenure(plan.tenureMonths)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-900 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                    : 'bg-slate-900/70 border-slate-800 hover:border-indigo-600 hover:bg-slate-900'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                    Active
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-xs font-mono font-black text-amber-300 block">
                    {plan.tenureMonths} Months EMI
                  </span>
                  <div className="text-lg font-serif font-black text-white">
                    ₹{formatINR(plan.monthlyInstallment)}<span className="text-[10px] text-slate-400 font-sans">/mo</span>
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-800 space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>कुल निवेश:</span>
                    <strong className="text-white">₹{formatINR(plan.totalTenureInvestment)}</strong>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>मासिक वापसी:</span>
                    <strong>₹{formatINR(plan.monthlyReturn)}</strong>
                  </div>
                  <div className="flex justify-between text-purple-300 font-bold">
                    <span>बोनस/प्लॉट:</span>
                    <strong>+₹{formatINR(plan.bonusReturnPerPlot)}</strong>
                  </div>
                  <div className="flex justify-between text-amber-400 font-bold pt-1 border-t border-slate-800/60">
                    <span>लक्ष्य प्लॉट:</span>
                    <strong>{plan.requiredPlotSales} Plots</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ----------------- INTERACTIVE SCHEME SIMULATOR ----------------- */}
      <div className="bg-slate-950/80 rounded-3xl p-6 sm:p-8 border border-indigo-900/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-serif font-black text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              चयनित {selectedPlan.tenureMonths}-माह EMI योजना सिमुलेशन
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              मासिक किस्त: <strong>₹{formatINR(selectedPlan.monthlyInstallment)}</strong> • मासिक मूल वापसी: <strong>₹{formatINR(selectedPlan.monthlyReturn)}</strong> • फास्ट-ट्रैक लक्ष्य: <strong>{selectedPlan.requiredPlotSales} प्लॉट</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">कुल परिपक्वता प्रतिफल (Maturity Return)</span>
            <span className="text-2xl font-black text-amber-400 font-serif">₹{formatINR(selectedPlan.totalTenureReturn)}</span>
          </div>
        </div>

        {/* Plot Sales Simulation Slider */}
        <div className="p-4 bg-purple-950/40 rounded-2xl border border-purple-800/60 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-purple-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-400" /> अनुमानित प्लॉट विक्रय सिमुलेशन (Plot Sales Bonus):
            </span>
            <span className="font-black text-amber-300 bg-slate-900 px-3 py-1 rounded-xl border border-purple-500/40 font-mono">
              {simulatedPlotsSold} Plot(s) Sold
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={simulatedPlotsSold}
            onChange={(e) => setSimulatedPlotsSold(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-purple-300">
            <span>0 Plots (+₹0/mo)</span>
            <span className="text-amber-400 font-bold">Fast-Track Goal: {selectedPlan.requiredPlotSales} Plots</span>
            <span>10 Plots (+₹{formatINR(10 * selectedPlan.bonusReturnPerPlot)}/mo)</span>
          </div>
        </div>

        {/* Simulated Monthly Return Output */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">मासिक मूल वापसी (Base)</span>
            <span className="text-xl font-black text-white font-serif mt-1 block">₹{formatINR(selectedPlan.monthlyReturn)}/mo</span>
          </div>

          <div className="p-4 bg-purple-950/50 rounded-2xl border border-purple-800/60">
            <span className="text-[10px] text-purple-300 block uppercase font-bold">प्लॉट विक्रय बोनस (+{simulatedPlotsSold} Plots)</span>
            <span className="text-xl font-black text-purple-300 font-mono mt-1 block">+₹{formatINR(simulatedPlotsSold * selectedPlan.bonusReturnPerPlot)}/mo</span>
          </div>

          <div className="p-4 bg-emerald-950/50 rounded-2xl border border-emerald-800/60">
            <span className="text-[10px] text-emerald-400 block uppercase font-bold">कुल प्रभावी मासिक वापसी</span>
            <span className="text-xl font-black text-emerald-300 font-mono mt-1 block">
              ₹{formatINR(selectedPlan.monthlyReturn + simulatedPlotsSold * selectedPlan.bonusReturnPerPlot)}/mo
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
