import React, { useState } from 'react';
import {
  CreditCard,
  Calculator,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Send,
  RefreshCw,
  Zap,
  TrendingUp,
  ShieldAlert,
  Percent,
  Sparkles,
  PieChart,
  UserCheck,
  FileText,
  DollarSign,
  ArrowRight,
  Filter
} from 'lucide-react';
import {
  SUPPORTED_EMI_TENURES,
  calculateFullEmiEngine,
  calculateLatePenalty,
  calculateForeclosureAndPrepayment,
  runAiSalesPrediction,
  evaluateCustomerRisk,
  generateAiRecommendations,
  EmiScheduleRow
} from '../../utils/emiEngine';
import { formatINR } from '../../utils/calculators';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface AdminEmiManagerProps {
  isDarkMode?: boolean;
}

export const AdminEmiManager: React.FC<AdminEmiManagerProps> = ({ isDarkMode = true }) => {
  // Calculator Form State
  const [plotCost, setPlotCost] = useState<number>(2500000);
  const [downPayment, setDownPayment] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(10.5);
  const [selectedTenureMonths, setSelectedTenureMonths] = useState<number>(36); // default 3 years
  const [processingFeePercent, setProcessingFeePercent] = useState<number>(1.0);

  // Active View Tabs inside EMI Module
  const [activeTab, setActiveTab] = useState<'schedules' | 'defaulters' | 'foreclosure' | 'ai_predictive'>('schedules');

  // Foreclosure State
  const [foreclosurePrincipal, setForeclosurePrincipal] = useState<number>(1200000);
  const [completedMonths, setCompletedMonths] = useState<number>(14);

  // Partial Payment Modal State
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<any | null>(null);
  const [paymentInputAmount, setPaymentInputAmount] = useState<string>('');
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  // Sample Customer EMI Records
  const [customerEmiRecords, setCustomerEmiRecords] = useState([
    {
      id: 'EMI-1001',
      customerName: 'Rajesh Sharma',
      phone: '+91 98765 43210',
      plotNo: 'A-12',
      projectName: 'Milestone City Prayagraj',
      totalCost: 2500000,
      monthlyEmi: 42500,
      dueDate: '2026-08-15',
      overdueDays: 0,
      tenureMonths: 36,
      paidInstallments: 12,
      status: 'Paid',
      kycCompleted: true,
      creditScore: 780,
      missingEmis: 0,
      onTimeRatio: 1.0
    },
    {
      id: 'EMI-1002',
      customerName: 'Sunita Mishra',
      phone: '+91 99351 23456',
      plotNo: 'B-04',
      projectName: 'Prayag Royal Enclave',
      totalCost: 3200000,
      monthlyEmi: 54000,
      dueDate: '2026-08-05',
      overdueDays: 5,
      tenureMonths: 48,
      paidInstallments: 18,
      status: 'Overdue',
      kycCompleted: true,
      creditScore: 680,
      missingEmis: 1,
      onTimeRatio: 0.85
    },
    {
      id: 'EMI-1003',
      customerName: 'Vikram Singh',
      phone: '+91 94159 87654',
      plotNo: 'C-09',
      projectName: 'Milestone City Prayagraj',
      totalCost: 1800000,
      monthlyEmi: 31000,
      dueDate: '2026-07-28',
      overdueDays: 13,
      tenureMonths: 24,
      paidInstallments: 6,
      status: 'Critical Overdue',
      kycCompleted: false,
      creditScore: 620,
      missingEmis: 2,
      onTimeRatio: 0.6
    },
    {
      id: 'EMI-1004',
      customerName: 'Anil Agarwal',
      phone: '+91 98390 00111',
      plotNo: 'P-15',
      projectName: 'Sangam Vista Naini',
      totalCost: 2800000,
      monthlyEmi: 48000,
      dueDate: '2026-08-20',
      overdueDays: 0,
      tenureMonths: 60,
      paidInstallments: 24,
      status: 'Due',
      kycCompleted: true,
      creditScore: 750,
      missingEmis: 0,
      onTimeRatio: 0.95
    }
  ]);

  // Compute Active EMI Schedule
  const emiCalculation = calculateFullEmiEngine(
    plotCost,
    downPayment,
    interestRate,
    selectedTenureMonths,
    processingFeePercent
  );

  // Compute AI Predictive Data
  const aiSalesPrediction = runAiSalesPrediction();
  const aiRecommendations = generateAiRecommendations(150000, plotCost);

  // Export PDF
  const handleExportPdf = (elementId: string, filename: string) => {
    const input = document.getElementById(elementId);
    if (!input) return;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${filename}.pdf`);
    });
  };

  // Export CSV
  const handleExportCsv = (data: any[], filename: string) => {
    if (!data || !data.length) return;
    const keys = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(keys.join(','));
    for (const row of data) {
      const values = keys.map((key) => {
        const val = row[key];
        return `"${val !== undefined ? val : ''}"`;
      });
      csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    a.click();
  };

  // Send Reminder Notification
  const triggerReminderNotification = (customer: any, type: 'whatsapp' | 'sms' | 'email') => {
    setNotificationStatus(`Sending ${type.toUpperCase()} alert to ${customer.customerName} (${customer.phone})...`);
    setTimeout(() => {
      setNotificationStatus(`✓ ${type.toUpperCase()} Legal Reminder Sent Successfully to ${customer.customerName}!`);
      setTimeout(() => setNotificationStatus(null), 4000);
    }, 1200);
  };

  return (
    <div className={`rounded-3xl p-6 md:p-8 border shadow-2xl space-y-8 ${
      isDarkMode ? 'bg-slate-900 border-rose-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-md tracking-wider">
              Smart Engine v4.2
            </span>
            <span className="bg-amber-500/20 text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-md">
              1, 2, 3, 4, 5 Year Plans
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-rose-400" />
            <span>Smart EMI Engine, Schedule Generator & AI Analytics</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Automated EMI calculation formula <code className="text-amber-300 font-mono">EMI = P×R×(1+R)^N / ((1+R)^N - 1)</code>, late penalty enforcement, prepayment & foreclosure, and predictive AI risk scoring.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('schedules')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'schedules'
                ? 'bg-rose-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>EMI Calculator</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('defaulters')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'defaulters'
                ? 'bg-rose-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>Overdue & Penalty ({customerEmiRecords.filter(c => c.overdueDays > 0).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('foreclosure')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'foreclosure'
                ? 'bg-rose-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Foreclosure & Prepay</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai_predictive')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ai_predictive'
                ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-slate-950 shadow-lg font-black'
                : 'bg-indigo-950 hover:bg-indigo-900 text-amber-300 border border-indigo-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Risk & Sales Prediction</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notificationStatus && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{notificationStatus}</span>
        </div>
      )}

      {/* TAB 1: SMART EMI CALCULATOR & TENURE SELECTOR */}
      {activeTab === 'schedules' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* CALCULATOR FORM CONTROLS */}
            <div className="lg:col-span-5 bg-slate-950/90 p-6 rounded-2xl border border-slate-800 space-y-5">
              <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <Calculator className="w-4 h-4" />
                <span>EMI Input Parameters</span>
              </h3>

              {/* TENURE SELECTOR BUTTONS */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-300 block">
                  Select EMI Tenure Plan (1 to 5 Years):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {SUPPORTED_EMI_TENURES.map((ten) => (
                    <button
                      key={ten.months}
                      type="button"
                      onClick={() => setSelectedTenureMonths(ten.months)}
                      className={`p-2 rounded-xl text-center cursor-pointer transition-all ${
                        selectedTenureMonths === ten.months
                          ? 'bg-rose-500 text-slate-950 font-black shadow-md ring-2 ring-rose-400'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold'
                      }`}
                    >
                      <div className="text-xs font-black">{ten.years} Yr</div>
                      <div className="text-[10px] opacity-80">{ten.months} Mo</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plot Cost */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Plot Total Cost:</span>
                  <strong className="text-amber-400 font-mono">{formatINR(plotCost)}</strong>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="10000000"
                  step="50000"
                  value={plotCost}
                  onChange={(e) => setPlotCost(Number(e.target.value))}
                  className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Down Payment */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Booking / Down Payment (Min 10%):</span>
                  <strong className="text-emerald-400 font-mono">{formatINR(downPayment)}</strong>
                </div>
                <input
                  type="range"
                  min={Math.round(plotCost * 0.1)}
                  max={Math.round(plotCost * 0.5)}
                  step="25000"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Annual Interest Rate (% p.a.):</span>
                  <strong className="text-sky-400 font-mono">{interestRate}% p.a.</strong>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="18.0"
                  step="0.25"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-sky-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Processing Fee */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">Processing Fee (1.0%):</span>
                <span className="text-amber-300 font-black">{formatINR(emiCalculation.processingFee)}</span>
              </div>
            </div>

            {/* EMI SUMMARY & KEY METRICS */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-rose-950/80 to-slate-950 p-5 rounded-2xl border border-rose-500/40 space-y-1">
                  <span className="text-[10px] font-black uppercase text-rose-300 tracking-wider">Monthly Installment (EMI)</span>
                  <div className="text-2xl font-black text-rose-400 font-mono">{formatINR(emiCalculation.monthlyEmi)}</div>
                  <span className="text-[10px] text-slate-400 block font-medium">For {emiCalculation.tenureMonths} Months ({emiCalculation.tenureYears} Years)</span>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Principal Financed Amount</span>
                  <div className="text-xl font-extrabold text-white font-mono">{formatINR(emiCalculation.principalAmount)}</div>
                  <span className="text-[10px] text-emerald-400 block font-medium">After {formatINR(emiCalculation.downPayment)} Down Payment</span>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Payable Interest</span>
                  <div className="text-xl font-extrabold text-amber-400 font-mono">{formatINR(emiCalculation.totalInterestPayable)}</div>
                  <span className="text-[10px] text-slate-400 block font-medium">Total Outflow: {formatINR(emiCalculation.totalAmountPayable)}</span>
                </div>
              </div>

              {/* ACTION TOOLBAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">Generated Schedule:</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {emiCalculation.schedule.length} Installments
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportCsv(emiCalculation.schedule, `EMI_Schedule_${selectedTenureMonths}_Months`)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportPdf('emi-schedule-table', `EMI_Schedule_${selectedTenureMonths}_Months`)}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Schedule PDF</span>
                  </button>
                </div>
              </div>

              {/* MONTHLY SCHEDULE TABLE */}
              <div id="emi-schedule-table" className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-black uppercase text-[10px]">
                      <th className="p-2.5">Inst. #</th>
                      <th className="p-2.5">Due Date</th>
                      <th className="p-2.5">EMI Amount</th>
                      <th className="p-2.5">Principal</th>
                      <th className="p-2.5">Interest</th>
                      <th className="p-2.5">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                    {emiCalculation.schedule.map((row) => (
                      <tr key={row.installmentNo} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-2.5 font-bold text-amber-400">#{row.installmentNo}</td>
                        <td className="p-2.5 text-slate-300 font-sans">{row.dueDate}</td>
                        <td className="p-2.5 font-black text-white">{formatINR(row.emiAmount)}</td>
                        <td className="p-2.5 text-emerald-400 font-bold">{formatINR(row.principalComponent)}</td>
                        <td className="p-2.5 text-rose-400 font-bold">{formatINR(row.interestComponent)}</td>
                        <td className="p-2.5 text-slate-300">{formatINR(row.remainingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OVERDUE DEFAULTERS & LATE PENALTY SYSTEM */}
      {activeTab === 'defaulters' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Customer Overdue EMI Ledger & Legal Action System</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Automated late fee calculation (0.1% daily penalty rate) and multi-channel notice dispatch.</p>
            </div>
            <button
              type="button"
              onClick={() => handleExportCsv(customerEmiRecords, 'Overdue_EMI_Defaulters_List')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3 py-2 rounded-xl flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Defaulters CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-bold uppercase">
                  <th className="p-3">Customer & Plot</th>
                  <th className="p-3">Monthly EMI</th>
                  <th className="p-3">Due Date & Overdue</th>
                  <th className="p-3">Calculated Penalty</th>
                  <th className="p-3">Risk Category</th>
                  <th className="p-3 text-right">Legal Reminder Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {customerEmiRecords.map((cust) => {
                  const penalty = calculateLatePenalty(cust.monthlyEmi, cust.overdueDays);
                  const riskEval = evaluateCustomerRisk(cust.kycCompleted, cust.missingEmis, cust.onTimeRatio, cust.creditScore);

                  return (
                    <tr key={cust.id} className="hover:bg-slate-900/80 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{cust.customerName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-amber-400 font-mono">{cust.plotNo}</span>
                          <span>•</span>
                          <span>{cust.projectName}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-black text-white">{formatINR(cust.monthlyEmi)}</td>
                      <td className="p-3">
                        <div className="font-sans text-slate-200">{cust.dueDate}</div>
                        {cust.overdueDays > 0 ? (
                          <span className="bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded text-[10px] inline-block mt-0.5">
                            {cust.overdueDays} Days Late
                          </span>
                        ) : (
                          <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] inline-block mt-0.5">
                            On Track
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        <div className="text-rose-400 font-black">{formatINR(penalty.penaltyAmount)}</div>
                        <div className="text-[10px] text-slate-400">Total: {formatINR(penalty.totalDueWithPenalty)}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          riskEval.riskCategory === 'Critical Default Risk'
                            ? 'bg-rose-600 text-white'
                            : riskEval.riskCategory === 'High Risk'
                            ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {riskEval.riskCategory} ({riskEval.riskScore}/100)
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => triggerReminderNotification(cust, 'whatsapp')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold"
                          >
                            WhatsApp Notice
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerReminderNotification(cust, 'sms')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold"
                          >
                            SMS Alert
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FORECLOSURE & PREPAYMENT CALCULATOR */}
      {activeTab === 'foreclosure' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
            <h3 className="font-extrabold text-sm text-amber-400 flex items-center gap-2 uppercase tracking-wider">
              <RefreshCw className="w-4 h-4" />
              <span>Plot EMI Early Foreclosure & Partial Prepayment Simulator</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Current Principal Balance Outstanding (₹):
                  </label>
                  <input
                    type="number"
                    value={foreclosurePrincipal}
                    onChange={(e) => setForeclosurePrincipal(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Installments Already Completed (Months):
                  </label>
                  <input
                    type="number"
                    value={completedMonths}
                    onChange={(e) => setCompletedMonths(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {(() => {
                const fore = calculateForeclosureAndPrepayment(foreclosurePrincipal, completedMonths, 36, interestRate, 2.0);
                return (
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Foreclosure Settlement Summary</h4>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Principal Outstanding:</span>
                      <strong className="text-white font-mono font-bold">{formatINR(fore.outstandingPrincipal)}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Foreclosure Service Charge (2%):</span>
                      <strong className="text-amber-400 font-mono font-bold">{formatINR(fore.foreclosureFee)}</strong>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-sm">
                      <span className="text-slate-200 font-extrabold">Final Settlement Amount:</span>
                      <strong className="text-emerald-400 font-mono font-black">{formatINR(fore.totalForeclosurePayout)}</strong>
                    </div>
                    <div className="bg-emerald-500/20 text-emerald-300 p-3 rounded-xl text-xs font-bold flex items-center justify-between">
                      <span>Total Future Interest Saved:</span>
                      <span className="text-sm font-black font-mono">{formatINR(fore.interestSaved)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI PREDICTIVE RISK & SALES ENGINE */}
      {activeTab === 'ai_predictive' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 rounded-2xl border border-indigo-500/40 space-y-2">
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                AI Sales Forecast (Next Mo)
              </span>
              <div className="text-2xl font-black text-white font-mono">{formatINR(aiSalesPrediction.nextMonthSalesForecast)}</div>
              <span className="text-xs text-emerald-400 font-bold block">+24.5% Projected Growth Trajectory</span>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">AI Quarterly Revenue Estimate</span>
              <div className="text-2xl font-black text-amber-400 font-mono">{formatINR(aiSalesPrediction.nextQuarterRevenueForecast)}</div>
              <span className="text-xs text-slate-400 font-medium block">Confidence Rating: {aiSalesPrediction.marketTrendConfidence}%</span>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Smart Plan Recommendation</span>
              <div className="text-sm font-extrabold text-white">{aiRecommendations.recommendedEmiPlanLabel}</div>
              <span className="text-xs text-indigo-300 font-medium block">{aiRecommendations.upsellOpportunity}</span>
            </div>
          </div>

          {/* AI MONTHLY TRAJECTORY GRAPH/TABLE */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>AI Revenue & Inflow Forecast Table (2026-2027)</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-bold uppercase">
                    <th className="p-3">Forecast Period</th>
                    <th className="p-3">Predicted Plot Revenue</th>
                    <th className="p-3">Projected Total Inflow</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-xs">
                  {aiSalesPrediction.investmentGrowthTrajectory.map((t) => (
                    <tr key={t.month} className="hover:bg-slate-900/80">
                      <td className="p-3 font-sans font-bold text-white">{t.month}</td>
                      <td className="p-3 font-bold text-emerald-400">{formatINR(t.predictedRevenue)}</td>
                      <td className="p-3 font-black text-amber-300">{formatINR(t.projectedInflow)}</td>
                      <td className="p-3">
                        <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded">
                          AI Projected
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
