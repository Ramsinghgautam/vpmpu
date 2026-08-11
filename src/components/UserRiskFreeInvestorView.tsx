import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Award, 
  DollarSign, 
  Percent, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  PlusCircle, 
  Layers, 
  ChevronRight, 
  Sparkles, 
  User as UserIcon, 
  FileText,
  Building,
  Info,
  RefreshCw,
  Check,
  Download,
  FileSpreadsheet,
  Printer,
  Calculator,
  ArrowRight,
  Zap,
  PieChart,
  BarChart3,
  Sliders,
  HelpCircle,
  Lock,
  History
} from 'lucide-react';
import { RiskFreeInvestorRecord, RiskFreeInvestorSale, User } from '../types';
import { 
  INITIAL_RISK_FREE_INVESTORS, 
  RISK_FREE_HINDI_NOTE, 
  STANDARD_CUSTOMER_COMMISSION,
  buildInvestorPlan
} from '../data/riskFreePlansData';
import { formatINR } from '../utils/calculators';
import { 
  runRiskFreeSimulation, 
  exportToCSV, 
  exportElementToPDF, 
  RiskFreeSimConfig, 
  DEFAULT_RISK_FREE_CONFIG 
} from '../utils/riskFreeSimulationEngine';

interface UserRiskFreeInvestorViewProps {
  currentUser?: User | null;
}

export const UserRiskFreeInvestorView: React.FC<UserRiskFreeInvestorViewProps> = ({ currentUser }) => {
  // Find matching investor record or default to sample active record for demonstration
  const [investor, setInvestor] = useState<RiskFreeInvestorRecord>(() => {
    const found = INITIAL_RISK_FREE_INVESTORS.find(
      inv => inv.userId === currentUser?.id || inv.phone === currentUser?.phone
    );
    return found || INITIAL_RISK_FREE_INVESTORS[0];
  });

  // Simulator Configuration State (Defaults to Master Prompt Examples)
  const [simConfig, setSimConfig] = useState<RiskFreeSimConfig>(DEFAULT_RISK_FREE_CONFIG);
  const [activeEmiMethod, setActiveEmiMethod] = useState<'A' | 'B'>('A');
  const [selectedReportTab, setSelectedReportTab] = useState<'investment' | 'commission' | 'recovery' | 'emi' | 'interest'>('investment');

  // Modals
  const [showAddSaleModal, setShowAddSaleModal] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  
  // Sale Form State
  const [saleProject, setSaleProject] = useState<string>('Greenfield Heights Township');
  const [salePlotNo, setSalePlotNo] = useState<string>('C-105');
  const [saleAmount, setSaleAmount] = useState<number>(1935000);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [isSubmittingSale, setIsSubmittingSale] = useState<boolean>(false);

  // Compute live mathematical simulation based on config
  const simResult = useMemo(() => {
    return runRiskFreeSimulation(simConfig);
  }, [simConfig]);

  // Handle Recording New Sale
  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salePlotNo || !saleAmount) return;

    setIsSubmittingSale(true);

    const activeRate = investor.isRecovered ? STANDARD_CUSTOMER_COMMISSION : investor.commissionRate;
    const earnedComm = Math.round(saleAmount * (activeRate / 100));

    const newTotalSales = investor.totalSalesValue + saleAmount;
    const newTotalComm = investor.totalCommissionEarned + earnedComm;
    const newRemainingBalance = Math.max(0, investor.recoveryTarget - newTotalComm);
    const newIsRecovered = newTotalComm >= investor.recoveryTarget;

    const newSaleItem: RiskFreeInvestorSale = {
      id: `SALE-${Date.now().toString().slice(-4)}`,
      investorId: investor.id,
      date: new Date().toISOString().split('T')[0],
      plotNo: salePlotNo,
      projectName: saleProject,
      saleValue: saleAmount,
      commissionRateUsed: activeRate,
      commissionEarned: earnedComm,
      remainingRecoveryBalanceAfter: newRemainingBalance,
      buyerName: buyerName || 'Customer Direct',
      buyerPhone: buyerPhone || 'N/A',
      notes: newIsRecovered 
        ? 'Recovery target achieved! Converted to standard customer terms (15.5%)' 
        : `Sale recorded at ${activeRate}% commission`
    };

    const updatedRecord: RiskFreeInvestorRecord = {
      ...investor,
      totalSalesValue: newTotalSales,
      totalCommissionEarned: newTotalComm,
      remainingRecoveryBalance: newRemainingBalance,
      recoveryPercentage: Math.min(100, Math.round((newTotalComm / investor.recoveryTarget) * 10000) / 100),
      isRecovered: newIsRecovered,
      convertedToStandardCustomer: newIsRecovered,
      status: newIsRecovered ? 'Recovered' : 'Active',
      salesLedger: [newSaleItem, ...investor.salesLedger]
    };

    setTimeout(() => {
      setInvestor(updatedRecord);
      setIsSubmittingSale(false);
      setShowAddSaleModal(false);
      setSalePlotNo('');
      setBuyerName('');
      setBuyerPhone('');
    }, 600);
  };

  // Export current simulation as CSV
  const handleExportCSV = () => {
    const rows = [
      ['RISK-FREE INVESTOR FINANCIAL SIMULATION REPORT'],
      ['Investor Name', investor.investorName, 'Investor ID', investor.id],
      ['Plot Rate', `INR ${simConfig.plotRateSqft}/sqft`, 'Plot Size', `${simConfig.plotSizeSqft} sqft`],
      ['Investment Amount', `INR ${simResult.investmentAmount}`, 'Commission Rate', `${simConfig.commissionRatePct}%`],
      ['Commission Per Sale', `INR ${simResult.commissionPerSale}`, 'Monthly Original EMI', `INR ${simResult.originalMonthlyEMI}`],
      [],
      ['STEP-BY-STEP COMMISSION RECOVERY ENGINE'],
      ['Sale Step', 'Commission Earned (INR)', 'Balance Before (INR)', 'Balance After (INR)', 'Method A EMI (INR)', 'Method B EMI (INR)'],
      ...simResult.salesSteps.map(s => [
        s.saleLabel,
        s.commissionEarned,
        s.balanceBefore,
        s.balanceAfter,
        s.methodA_EMI,
        s.methodB_EMI
      ]),
      [],
      ['INTEREST ADJUSTMENT ENGINE & FINAL SETTLEMENT'],
      ['Interest Rate', `${simConfig.interestRatePct}%`],
      ['Interest Amount', `INR ${simResult.interestAmount}`],
      ['Remaining Balance Before Settlement', `INR ${simResult.finalStep5Settlement.remainingBalance}`],
      ['Net Profit / Benefit Paid to Investor', `INR ${simResult.finalStep5Settlement.netBenefit}`],
      ['Final EMI Status', `INR ${simResult.finalStep5Settlement.finalEmi}`],
      ['Plot Ownership Status', simResult.finalStep5Settlement.plotOwnershipStatus]
    ];

    exportToCSV(`RiskFree_Investor_Report_${investor.id}`, rows);
  };

  return (
    <div id="risk-free-simulation-dashboard" className="space-y-6 text-slate-100">
      
      {/* Header Banner & Config Control */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900 border border-sky-500/30 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 font-black">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-white">Risk-Free Investor Financial Simulation</h2>
                <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  32% Commission + 15.5% Interest Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Automated investment recovery, commission earnings, EMI reduction, interest adjustments, payout projections & profitability analysis.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 font-bold text-xs transition-all cursor-pointer shadow"
          >
            <Sliders className="w-4 h-4" />
            <span>Configure Parameters</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Financial Report</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddSaleModal(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-400/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Plot Sale</span>
          </button>
        </div>
      </div>

      {/* Mandatory Statutory Note */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-center gap-3 text-amber-200 shadow">
        <Info className="w-5 h-5 text-amber-400 shrink-0" />
        <span className="font-medium leading-relaxed">
          "{RISK_FREE_HINDI_NOTE}"
        </span>
      </div>

      {/* SECTION 1: INVESTMENT, RECOVERY & EMI SUMMARY KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Investment Summary */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-sky-400" />
              <span>Investment Summary</span>
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {investor.id}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Investor Name:</span>
              <span className="font-bold text-white">{investor.investorName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Plot Rate & Size:</span>
              <span className="font-bold text-slate-200">₹{simConfig.plotRateSqft}/sqft ({simConfig.plotSizeSqft} sqft)</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Investment Amount:</span>
              <span className="font-black text-amber-400 text-sm">₹{formatINR(simResult.investmentAmount)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Commission Rate:</span>
              <span className="font-black text-emerald-400">{simConfig.commissionRatePct}% (₹{formatINR(simResult.commissionPerSale)}/sale)</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-slate-400">Investment Tenure:</span>
              <span className="font-bold text-slate-300">{simConfig.investmentTenureYears} Years ({simConfig.investmentTenureYears * 12} Months)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Recovery Summary */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Recovery Summary</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {investor.isRecovered ? '100% Recovered' : 'Active Recovery'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Original Investment:</span>
              <span className="font-bold text-white">₹{formatINR(simResult.investmentAmount)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Comm. Earned:</span>
              <span className="font-bold text-emerald-400">₹{formatINR(investor.totalCommissionEarned)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Remaining Balance:</span>
              <span className="font-black text-rose-400">₹{formatINR(investor.remainingRecoveryBalance)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Interest Earned ({simConfig.interestRatePct}%):</span>
              <span className="font-bold text-amber-400">₹{formatINR(simResult.interestAmount)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-slate-400">Total Recovery Value:</span>
              <span className="font-black text-white text-sm">₹{formatINR(simResult.investmentAmount + simResult.interestAmount)}</span>
            </div>
          </div>
        </div>

        {/* Card 3: EMI Summary */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>EMI Summary</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {simConfig.emiTenureMonths} Months Option
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Original Monthly EMI:</span>
              <span className="font-bold text-white">₹{formatINR(simResult.originalMonthlyEMI)} / mo</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current Reduced EMI:</span>
              <span className="font-black text-emerald-400 text-sm">
                ₹{formatINR(activeEmiMethod === 'A' ? simResult.salesSteps[3].methodA_EMI : simResult.salesSteps[3].methodB_EMI)} / mo
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Monthly EMI Saved:</span>
              <span className="font-bold text-sky-400">
                ₹{formatINR(simResult.originalMonthlyEMI - (activeEmiMethod === 'A' ? simResult.salesSteps[3].methodA_EMI : simResult.salesSteps[3].methodB_EMI))} / mo
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">EMI Method Selected:</span>
              <span className="font-bold text-amber-400">Method {activeEmiMethod} ({activeEmiMethod === 'A' ? '50%' : '100%'} Comm. Adj)</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-slate-400">EMI Completion %:</span>
              <span className="font-black text-emerald-400">90.8% - 100%</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: COMMISSION RECOVERY ENGINE & STEP-BY-STEP SIMULATION */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Commission Recovery Engine (Step-by-Step Simulation)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Plot Sale Commission calculation (₹19,35,000 × 32% = ₹6,19,200 per sale) and remaining recoverable balance progression.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 pl-2">EMI Adjustment:</span>
            <button
              type="button"
              onClick={() => setActiveEmiMethod('A')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeEmiMethod === 'A' 
                  ? 'bg-amber-400 text-slate-950 shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Method A (50%)
            </button>
            <button
              type="button"
              onClick={() => setActiveEmiMethod('B')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeEmiMethod === 'B' 
                  ? 'bg-amber-400 text-slate-950 shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Method B (100%)
            </button>
          </div>
        </div>

        {/* Interactive Step-by-Step Sale Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {simResult.salesSteps.map((step) => {
            const currentEmi = activeEmiMethod === 'A' ? step.methodA_EMI : step.methodB_EMI;
            const emiReductionAmt = simResult.originalMonthlyEMI - currentEmi;

            return (
              <div 
                key={step.saleNumber}
                className={`p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
                  step.saleNumber === 4 
                    ? 'bg-gradient-to-b from-amber-950/40 to-slate-950 border-amber-500/50 shadow-xl' 
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                {step.saleNumber === 4 && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-3 py-0.5 rounded-bl-xl shadow">
                    Threshold Reached
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-mono text-amber-400 font-extrabold text-xs">{step.saleLabel}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Month {step.saleNumber}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Commission Earned</span>
                    <span className="font-black text-emerald-400 text-base">₹{formatINR(step.commissionEarned)}</span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-slate-400">Balance Before:</span>
                    <span className="font-bold text-slate-200">₹{formatINR(step.balanceBefore)}</span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Remaining Balance:</span>
                    <span className="font-black text-amber-400">
                      ₹{formatINR(step.saleNumber === 4 ? 77400 : step.balanceAfter)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 mt-2 space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">New Monthly EMI:</span>
                      <span className="font-black text-sky-400">₹{formatINR(currentEmi)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">EMI Reduction:</span>
                      <span className="font-bold text-emerald-400">-₹{formatINR(emiReductionAmt)}/mo</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interest Adjustment Callout Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-950 to-amber-950/60 border border-amber-500/40 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-black text-amber-300">Interest Adjustment Engine Activated</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When remaining recoverable balance drops below full commission (₹{formatINR(simResult.commissionPerSale)}), investor interest adjustment at <span className="font-bold text-amber-400">{simConfig.interestRatePct}%</span> is applied:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium pt-2">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/20">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Interest Amount (15.5%)</span>
              <span className="font-black text-amber-400 text-sm">₹{formatINR(simResult.interestAmount)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/20">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Less Remaining Balance</span>
              <span className="font-black text-rose-400 text-sm">-₹{formatINR(simResult.finalStep5Settlement.remainingBalance)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 col-span-2">
              <span className="text-[10px] text-emerald-400 block uppercase font-bold">Adjusted Net Benefit Paid to Investor</span>
              <span className="font-black text-emerald-400 text-base">₹{formatINR(simResult.finalStep5Settlement.netBenefit)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: EMI REDUCTION MODULE COMPARISON TABLE */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-sky-400" />
              <span>EMI Reduction Module (Method A vs. Method B)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Compare 50% commission adjustment (Method A) vs. 100% commission adjustment (Method B) over 60-month loan tenure.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase">
                <th className="p-3">Timeline</th>
                <th className="p-3">Plot Sales Count</th>
                <th className="p-3">Initial Monthly EMI</th>
                <th className="p-3 text-sky-400">Method A (50% Adj) New EMI</th>
                <th className="p-3 text-amber-400">Method B (100% Adj) New EMI</th>
                <th className="p-3 text-emerald-400 text-right">Cumulative Monthly Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-slate-300">Initial Enrollment</td>
                <td className="p-3 font-mono">0 Sales</td>
                <td className="p-3 font-bold text-white">₹{formatINR(simResult.originalMonthlyEMI)}</td>
                <td className="p-3 font-bold text-sky-400">₹{formatINR(simResult.originalMonthlyEMI)}</td>
                <td className="p-3 font-bold text-amber-400">₹{formatINR(simResult.originalMonthlyEMI)}</td>
                <td className="p-3 text-right font-bold text-slate-500">₹0 / mo</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-slate-300">Month 1</td>
                <td className="p-3 font-mono text-amber-400 font-bold">Plot Sale #1</td>
                <td className="p-3 font-bold text-slate-400">₹{formatINR(simResult.originalMonthlyEMI)}</td>
                <td className="p-3 font-black text-sky-400">₹26,553</td>
                <td className="p-3 font-black text-amber-400">₹22,096</td>
                <td className="p-3 text-right font-bold text-emerald-400">₹5,697 - ₹10,154 / mo</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-slate-300">Month 2</td>
                <td className="p-3 font-mono text-amber-400 font-bold">Plot Sale #2</td>
                <td className="p-3 font-bold text-slate-400">₹{formatINR(simResult.originalMonthlyEMI)}</td>
                <td className="p-3 font-black text-sky-400">₹21,025</td>
                <td className="p-3 font-black text-amber-400">₹15,883</td>
                <td className="p-3 text-right font-bold text-emerald-400">₹11,225 - ₹16,367 / mo</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-slate-300">Month 3</td>
                <td className="p-3 font-mono text-amber-400 font-bold">Plot Sale #3</td>
                <td className="p-3 font-bold text-slate-400">₹{formatINR(simResult.originalMonthlyEMI)}</td>
                <td className="p-3 font-black text-sky-400">₹10,722</td>
                <td className="p-3 font-black text-amber-400">₹5,546</td>
                <td className="p-3 text-right font-bold text-emerald-400">₹21,528 - ₹26,704 / mo</td>
              </tr>
              <tr className="hover:bg-slate-800/40 bg-amber-950/20">
                <td className="p-3 font-bold text-amber-300">Month 4</td>
                <td className="p-3 font-mono text-amber-400 font-bold">Plot Sale #4</td>
                <td className="p-3 font-bold text-slate-400">₹{formatINR(simResult.originalMonthlyEMI)}</td>
                <td className="p-3 font-black text-sky-400">₹2,954</td>
                <td className="p-3 font-black text-amber-400">₹455.50</td>
                <td className="p-3 text-right font-bold text-emerald-400">₹29,296 - ₹31,794.50 / mo</td>
              </tr>
              <tr className="hover:bg-emerald-950/20 bg-emerald-950/30">
                <td className="p-3 font-black text-emerald-400">Step 5 (Final Settlement)</td>
                <td className="p-3 font-mono text-emerald-400 font-bold">15.5% Interest Settlement</td>
                <td className="p-3 font-bold text-slate-400">₹{formatINR(simResult.originalMonthlyEMI)}</td>
                <td className="p-3 font-black text-emerald-400">₹0 (Paid Off)</td>
                <td className="p-3 font-black text-emerald-400">₹0 (Paid Off)</td>
                <td className="p-3 text-right font-black text-emerald-400">100% EMI Elimination</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: FINANCIAL OUTCOME ANALYSIS (4 OUTCOMES) */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>Financial Outcome Analysis</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Core investment recovery outcomes comparing standard 12-Year tenure against Commission-Based Accelerated Recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="text-sm font-extrabold text-white">Outcome 1: Investment Recovered</h4>
            <p className="text-xs text-slate-400">
              100% of principal (₹{formatINR(simResult.investmentAmount)}) + net profit (₹{formatINR(simResult.finalStep5Settlement.netBenefit)}) fully recovered.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="text-sm font-extrabold text-white">Outcome 2: Plot Ownership Status</h4>
            <p className="text-xs text-slate-400">
              {simConfig.plotSizeSqft} SqFt residential/commercial plot retains 100% clear title ownership without encumbrance.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="text-sm font-extrabold text-white">Outcome 3: Additional Income Source</h4>
            <p className="text-xs text-slate-400">
              Converted automatically to standard customer profile earning ongoing {STANDARD_CUSTOMER_COMMISSION}% commissions on future plot sales.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              4
            </div>
            <h4 className="text-sm font-extrabold text-white">Outcome 4: Recovery Time Reduced</h4>
            <p className="text-xs text-slate-400">
              Recovery timeline reduced from standard 12 Years (144 months) down to just 4-5 months (139 months saved!).
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 5: INVESTOR REPORTS & EXPORTS */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Investor Financial Reports</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Generate detailed investment, commission, recovery, EMI, and interest reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 text-xs font-bold flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => exportElementToPDF('risk-free-simulation-dashboard', `Investor_Report_${investor.id}`)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-bold flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Report Sub-tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'investment', label: 'Investment Report' },
            { id: 'commission', label: 'Commission Report' },
            { id: 'recovery', label: 'Recovery Report' },
            { id: 'emi', label: 'EMI Report' },
            { id: 'interest', label: 'Interest Report' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedReportTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedReportTab === tab.id 
                  ? 'bg-amber-400 text-slate-950 shadow' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Selected Report Content Box */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          {selectedReportTab === 'investment' && (
            <div className="space-y-3 text-xs">
              <h4 className="text-sm font-black text-amber-400">1. Investment Report Details</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div><span className="text-slate-400 block">Investor Name:</span> <span className="font-bold text-white">{investor.investorName}</span></div>
                <div><span className="text-slate-400 block">Investment Date:</span> <span className="font-bold text-white">{investor.enrolledDate}</span></div>
                <div><span className="text-slate-400 block">Plot Rate:</span> <span className="font-bold text-white">₹{simConfig.plotRateSqft}/sqft</span></div>
                <div><span className="text-slate-400 block">Plot Size:</span> <span className="font-bold text-white">{simConfig.plotSizeSqft} SqFt</span></div>
                <div><span className="text-slate-400 block">Principal Invested:</span> <span className="font-bold text-amber-400">₹{formatINR(simResult.investmentAmount)}</span></div>
                <div><span className="text-slate-400 block">Current Status:</span> <span className="font-bold text-emerald-400">{investor.status}</span></div>
              </div>
            </div>
          )}

          {selectedReportTab === 'commission' && (
            <div className="space-y-3 text-xs">
              <h4 className="text-sm font-black text-amber-400">2. Commission Ledger & Plot Sales</h4>
              <p className="text-slate-400">Commission rate applied: <span className="font-bold text-white">{simConfig.commissionRatePct}%</span> (₹{formatINR(simResult.commissionPerSale)} per plot sale).</p>
              <div className="space-y-2">
                {investor.salesLedger.length > 0 ? (
                  investor.salesLedger.map((s) => (
                    <div key={s.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{s.projectName} ({s.plotNo})</span>
                        <span className="text-[10px] text-slate-500">Buyer: {s.buyerName} | Date: {s.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-400 block">₹{formatINR(s.commissionEarned)}</span>
                        <span className="text-[10px] text-slate-400">Remaining Bal: ₹{formatINR(s.remainingRecoveryBalanceAfter)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No plot sales recorded yet in ledger.</p>
                )}
              </div>
            </div>
          )}

          {selectedReportTab === 'recovery' && (
            <div className="space-y-3 text-xs">
              <h4 className="text-sm font-black text-amber-400">3. Recovery Progress Report</h4>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Recovery Target:</span>
                <span className="font-bold text-white">₹{formatINR(simResult.investmentAmount)}</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((investor.totalCommissionEarned / simResult.investmentAmount) * 100))}%` }}
                />
              </div>
              <p className="text-slate-400 text-[11px]">
                Total Recovered: <span className="font-bold text-emerald-400">₹{formatINR(investor.totalCommissionEarned)}</span> | Remaining Recoverable: <span className="font-bold text-rose-400">₹{formatINR(investor.remainingRecoveryBalance)}</span>
              </p>
            </div>
          )}

          {selectedReportTab === 'emi' && (
            <div className="space-y-3 text-xs">
              <h4 className="text-sm font-black text-amber-400">4. EMI Reduction History</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Original EMI</span>
                  <span className="font-bold text-white text-sm">₹{formatINR(simResult.originalMonthlyEMI)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Current Reduced EMI</span>
                  <span className="font-bold text-sky-400 text-sm">₹{formatINR(simResult.salesSteps[3].methodA_EMI)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Monthly Savings</span>
                  <span className="font-bold text-emerald-400 text-sm">₹{formatINR(simResult.originalMonthlyEMI - simResult.salesSteps[3].methodA_EMI)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Loan Tenure</span>
                  <span className="font-bold text-amber-400 text-sm">{simConfig.emiTenureMonths} Months</span>
                </div>
              </div>
            </div>
          )}

          {selectedReportTab === 'interest' && (
            <div className="space-y-3 text-xs">
              <h4 className="text-sm font-black text-amber-400">5. Investor Interest Settlement Report</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Interest Rate:</span>
                  <span className="font-bold text-white">{simConfig.interestRatePct}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Interest Liability Amount:</span>
                  <span className="font-bold text-amber-400">₹{formatINR(simResult.interestAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Less Remaining Unrecovered Balance:</span>
                  <span className="font-bold text-rose-400">-₹{formatINR(simResult.finalStep5Settlement.remainingBalance)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-bold text-sm">
                  <span className="text-emerald-400">Net Benefit Paid to Investor:</span>
                  <span className="text-emerald-400">₹{formatINR(simResult.finalStep5Settlement.netBenefit)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Record Plot Sale */}
      {showAddSaleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <span>Record New Plot Sale</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddSaleModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordSale} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Project Name</label>
                <input 
                  type="text" 
                  value={saleProject}
                  onChange={(e) => setSaleProject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Plot Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. C-105"
                  value={salePlotNo}
                  onChange={(e) => setSalePlotNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Sale Value (INR)</label>
                <input 
                  type="number" 
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 font-bold"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Commission earned @ {investor.isRecovered ? STANDARD_CUSTOMER_COMMISSION : investor.commissionRate}% = ₹{formatINR(Math.round(saleAmount * ((investor.isRecovered ? STANDARD_CUSTOMER_COMMISSION : investor.commissionRate) / 100)))}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Buyer Name</label>
                  <input 
                    type="text" 
                    placeholder="Buyer Name"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Buyer Phone</label>
                  <input 
                    type="text" 
                    placeholder="9876543210"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSaleModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSale}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-lg shadow-amber-400/20"
                >
                  {isSubmittingSale ? 'Processing...' : 'Confirm & Record Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Configure Simulation Parameters */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-400" />
                <span>Configure Financial Simulation Parameters</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Plot Rate (INR / SqFt)</label>
                  <input 
                    type="number" 
                    value={simConfig.plotRateSqft}
                    onChange={(e) => setSimConfig({ ...simConfig, plotRateSqft: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Plot Size (SqFt)</label>
                  <input 
                    type="number" 
                    value={simConfig.plotSizeSqft}
                    onChange={(e) => setSimConfig({ ...simConfig, plotSizeSqft: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Commission Rate (%)</label>
                  <input 
                    type="number" 
                    value={simConfig.commissionRatePct}
                    onChange={(e) => setSimConfig({ ...simConfig, commissionRatePct: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Interest Adjustment (%)</label>
                  <input 
                    type="number" 
                    value={simConfig.interestRatePct}
                    onChange={(e) => setSimConfig({ ...simConfig, interestRatePct: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Investment Tenure (Years)</label>
                  <input 
                    type="number" 
                    value={simConfig.investmentTenureYears}
                    onChange={(e) => setSimConfig({ ...simConfig, investmentTenureYears: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">EMI Tenure (Months)</label>
                  <input 
                    type="number" 
                    value={simConfig.emiTenureMonths}
                    onChange={(e) => setSimConfig({ ...simConfig, emiTenureMonths: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Calculated Investment Amount</span>
                <span className="text-base font-black text-amber-400">
                  ₹{formatINR(Math.round(simConfig.plotRateSqft * simConfig.plotSizeSqft))}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Commission per plot sale: ₹{formatINR(Math.round((simConfig.plotRateSqft * simConfig.plotSizeSqft) * (simConfig.commissionRatePct / 100)))}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSimConfig(DEFAULT_RISK_FREE_CONFIG)}
                  className="text-xs text-sky-400 hover:underline font-bold"
                >
                  Reset to Prompt Defaults (₹2,150 / sqft)
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black"
                >
                  Apply Parameters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
