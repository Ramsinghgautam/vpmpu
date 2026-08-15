import React, { useState } from 'react';
import {
  PayoutUserCategory,
  PAYOUT_TENURE_OPTIONS,
  calculateDistributedPayout,
} from '../../utils/payoutEngine';
import { formatINR } from '../../utils/calculators';
import { Calendar, CheckCircle2, ChevronDown, ChevronUp, Clock, Info, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';

export interface PayoutDivProps {
  id?: string;
  totalPayout: number;
  selectedTenureMonths?: number;
  onTenureChange?: (tenureMonths: number) => void;
  userCategory: PayoutUserCategory;
  showTenureSelector?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  allowSchedulePreview?: boolean;
  compact?: boolean;
}

export const PayoutDiv: React.FC<PayoutDivProps> = ({
  id = 'payout-distribution-card',
  totalPayout,
  selectedTenureMonths = 0,
  onTenureChange,
  userCategory,
  showTenureSelector = true,
  title,
  subtitle,
  className = '',
  allowSchedulePreview = true,
  compact = false,
}) => {
  const [internalTenure, setInternalTenure] = useState<number>(selectedTenureMonths);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);

  // Active tenure is controlled by parent if provided, otherwise internal
  const activeTenure = onTenureChange ? selectedTenureMonths : internalTenure;

  const handleTenureSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setInternalTenure(val);
    if (onTenureChange) {
      onTenureChange(val);
    }
  };

  const payoutResult = calculateDistributedPayout({
    totalPayout,
    emiTenureMonths: activeTenure,
    userCategory,
  });

  // Dynamic Theme Colors based on user category
  const getThemeStyles = () => {
    switch (userCategory) {
      case 'Customer':
        return {
          cardBg: 'bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-amber-900/20',
          borderColor: 'border-amber-500/40',
          accentText: 'text-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          highlightBg: 'bg-amber-950/60 border-amber-500/30',
          glowRing: 'ring-amber-500/20',
        };
      case 'Agent':
        return {
          cardBg: 'bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-indigo-900/20',
          borderColor: 'border-indigo-500/40',
          accentText: 'text-indigo-400',
          badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          highlightBg: 'bg-indigo-950/60 border-indigo-500/30',
          glowRing: 'ring-indigo-500/20',
        };
      case 'Investor':
        return {
          cardBg: 'bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-emerald-900/20',
          borderColor: 'border-emerald-500/40',
          accentText: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          highlightBg: 'bg-emerald-950/60 border-emerald-500/30',
          glowRing: 'ring-emerald-500/20',
        };
      case 'Risk-Free Investor':
      default:
        return {
          cardBg: 'bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-teal-900/20',
          borderColor: 'border-cyan-500/40',
          accentText: 'text-cyan-400',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          highlightBg: 'bg-cyan-950/60 border-cyan-500/30',
          glowRing: 'ring-cyan-500/20',
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div
      id={id}
      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-xl backdrop-blur-sm ${theme.cardBg} ${theme.borderColor} ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${theme.accentText}`} />
              {title || `${userCategory} Payout Distribution`}
            </h4>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${theme.badgeBg}`}
            >
              {userCategory}
            </span>
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Payout
          </span>
          <span className="text-base sm:text-lg font-black text-white font-serif">
            {formatINR(Math.max(0, totalPayout))}
          </span>
        </div>
      </div>

      {/* EMI Tenure Selector */}
      {showTenureSelector && (
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 ${theme.accentText}`} />
              Select EMI Tenure (Distribution Period):
            </span>
            <span className="text-[10px] text-slate-400 normal-case">
              {activeTenure > 0 ? `${activeTenure} Months Selected` : 'No Tenure'}
            </span>
          </label>

          <select
            id={`${id}-tenure-select`}
            value={activeTenure}
            onChange={handleTenureSelect}
            className="w-full bg-slate-900/90 border border-slate-700 hover:border-slate-500 focus:border-amber-400 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer transition-all"
          >
            <option value={0}>-- Select EMI Tenure (Payout is Hidden Until Selected) --</option>
            {PAYOUT_TENURE_OPTIONS.map((opt) => (
              <option key={opt.months} value={opt.months}>
                {opt.label} • ({opt.months} Monthly Equal Installments)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* CONDITIONAL PAYOUT DIV: Only displayed when EMI tenure is valid & selected */}
      {payoutResult.isValid && activeTenure > 0 ? (
        <div
          id={`${id}-calculated-display`}
          className={`rounded-xl border p-4 transition-all animate-fadeIn ${theme.highlightBg}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldCheck className={`w-4 h-4 ${theme.accentText}`} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Monthly Distributed Payout
                </span>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${theme.badgeBg}`}
                >
                  {payoutResult.emiTenureMonths} Months
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-black font-serif ${theme.accentText}`}>
                  {payoutResult.formattedMonthlyPayout}
                </span>
                <span className="text-xs text-slate-300 font-semibold">/ month</span>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-[11px] space-y-1 sm:min-w-[200px]">
              <div className="flex justify-between text-slate-400">
                <span>Total Payout:</span>
                <strong className="text-white font-bold">{payoutResult.formattedTotalPayout}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>EMI Tenure:</span>
                <strong className="text-slate-200 font-semibold">{payoutResult.tenureLabel}</strong>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                <span>Distribution:</span>
                <strong className={theme.accentText}>Equal Monthly Split</strong>
              </div>
            </div>
          </div>

          {/* Schedule Breakdown Toggle */}
          {allowSchedulePreview && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowScheduleModal(!showScheduleModal)}
                className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                {showScheduleModal ? 'Hide' : 'View'} Complete {activeTenure}-Month Distribution Schedule
                {showScheduleModal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <span className="text-[10px] text-slate-400">
                Formula: ₹{totalPayout.toLocaleString('en-IN')} ÷ {activeTenure}M = ₹
                {payoutResult.monthlyPayout.toLocaleString('en-IN')}/mo
              </span>
            </div>
          )}

          {/* Interactive Schedule Table Preview */}
          {allowSchedulePreview && showScheduleModal && (
            <div className="mt-3 bg-slate-950/90 rounded-xl border border-slate-800 p-3 max-h-60 overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-300 mb-2 flex justify-between items-center">
                <span>Month-by-Month Disbursement Ledger</span>
                <span className="text-[10px] text-emerald-400 font-normal">
                  Guaranteed Equal Monthly Schedule
                </span>
              </div>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-1.5 font-semibold">Installment</th>
                    <th className="pb-1.5 font-semibold">Due Date</th>
                    <th className="pb-1.5 font-semibold text-right">Monthly Payout</th>
                    <th className="pb-1.5 font-semibold text-right">Cumulative Disbursed</th>
                    <th className="pb-1.5 font-semibold text-right">Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {payoutResult.schedule.map((row) => (
                    <tr key={row.monthIndex} className="hover:bg-slate-900/40">
                      <td className="py-1.5 text-slate-300 font-medium">{row.monthLabel}</td>
                      <td className="py-1.5 text-slate-400">{row.dueDate}</td>
                      <td className={`py-1.5 text-right font-bold ${theme.accentText}`}>
                        {formatINR(row.monthlyPayout)}
                      </td>
                      <td className="py-1.5 text-right text-slate-300 font-medium">
                        {formatINR(row.cumulativePaid)}
                      </td>
                      <td className="py-1.5 text-right text-slate-400">
                        {formatINR(row.remainingBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* VALIDATION FALLBACK: When no tenure is selected */
        <div
          id={`${id}-hidden-placeholder`}
          className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-center text-slate-400 text-xs space-y-1.5"
        >
          <div className="flex items-center justify-center gap-2 text-amber-400 font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>Please select an EMI tenure to view payout distribution.</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Payout is calculated and displayed only after selecting the distribution tenure (12 to 120 Months).
          </p>
        </div>
      )}
    </div>
  );
};
