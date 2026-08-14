import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  BarChart2, 
  LineChart as LineIcon, 
  PieChart as PieIcon, 
  Download, 
  TrendingUp, 
  TrendingDown,
  FileSpreadsheet,
  FileText,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { formatINR } from '../../utils/calculators';

interface InflowOutflowAnalyticsProps {
  isDarkMode: boolean;
  onExportPDF: (title: string) => void;
  onExportExcel: (title: string) => void;
}

export const InflowOutflowAnalytics: React.FC<InflowOutflowAnalyticsProps> = ({
  isDarkMode,
  onExportPDF,
  onExportExcel
}) => {
  const [inflowPeriod, setInflowPeriod] = useState<'monthly' | 'quarterly' | 'sixMonthly' | 'annually'>('monthly');
  const [inflowChartType, setInflowChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  const [outflowPeriod, setOutflowPeriod] = useState<'monthly' | 'quarterly' | 'sixMonthly' | 'annually'>('monthly');
  const [outflowChartType, setOutflowChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  // Sample data datasets for Inflow
  const initialInflowDataSets = {
    monthly: [
      { id: 'inf-m-1', name: 'Week 1', bookingFees: 450000, plotRegistry: 820000, investorCapital: 600000 },
      { id: 'inf-m-2', name: 'Week 2', bookingFees: 620000, plotRegistry: 1150000, investorCapital: 850000 },
      { id: 'inf-m-3', name: 'Week 3', bookingFees: 510000, plotRegistry: 940000, investorCapital: 400000 },
      { id: 'inf-m-4', name: 'Week 4', bookingFees: 780000, plotRegistry: 1420000, investorCapital: 950000 },
    ],
    quarterly: [
      { id: 'inf-q-1', name: 'Q1 (Apr-Jun)', bookingFees: 1800000, plotRegistry: 4200000, investorCapital: 2500000 },
      { id: 'inf-q-2', name: 'Q2 (Jul-Sep)', bookingFees: 2400000, plotRegistry: 5800000, investorCapital: 3400000 },
      { id: 'inf-q-3', name: 'Q3 (Oct-Dec)', bookingFees: 3100000, plotRegistry: 6900000, investorCapital: 4100000 },
      { id: 'inf-q-4', name: 'Q4 (Jan-Mar)', bookingFees: 2900000, plotRegistry: 6400000, investorCapital: 3900000 },
    ],
    sixMonthly: [
      { id: 'inf-s-1', name: 'H1 (Apr - Sep)', bookingFees: 4200000, plotRegistry: 10000000, investorCapital: 5900000 },
      { id: 'inf-s-2', name: 'H2 (Oct - Mar)', bookingFees: 6000000, plotRegistry: 13300000, investorCapital: 8000000 },
    ],
    annually: [
      { id: 'inf-a-1', name: 'FY 2023-24', bookingFees: 6500000, plotRegistry: 16000000, investorCapital: 9000000 },
      { id: 'inf-a-2', name: 'FY 2024-25', bookingFees: 8200000, plotRegistry: 21000000, investorCapital: 12500000 },
      { id: 'inf-a-3', name: 'FY 2025-26 (Projected)', bookingFees: 10200000, plotRegistry: 23300000, investorCapital: 13900000 },
    ]
  };

  const initialInflowPieData = [
    { id: 'pie-in-1', name: 'Plot Registrations', value: 23300000, color: '#10b981' },
    { id: 'pie-in-2', name: 'Investor Capital', value: 13900000, color: '#0ea5e9' },
    { id: 'pie-in-3', name: 'Booking Advance Fees', value: 10200000, color: '#f59e0b' },
    { id: 'pie-in-4', name: 'EMI Installment Receipts', value: 5400000, color: '#6366f1' },
  ];

  // Sample data datasets for Outflow
  const initialOutflowDataSets = {
    monthly: [
      { id: 'out-m-1', name: 'Week 1', landDev: 320000, agentCommissions: 280000, salaries: 410000, bankEmi: 110000 },
      { id: 'out-m-2', name: 'Week 2', landDev: 480000, agentCommissions: 350000, salaries: 0, bankEmi: 0 },
      { id: 'out-m-3', name: 'Week 3', landDev: 390000, agentCommissions: 220000, salaries: 0, bankEmi: 0 },
      { id: 'out-m-4', name: 'Week 4', landDev: 610000, agentCommissions: 410000, salaries: 1450000, bankEmi: 345000 },
    ],
    quarterly: [
      { id: 'out-q-1', name: 'Q1 (Apr-Jun)', landDev: 1800000, agentCommissions: 1260000, salaries: 5580000, bankEmi: 1035000 },
      { id: 'out-q-2', name: 'Q2 (Jul-Sep)', landDev: 2400000, agentCommissions: 1720000, salaries: 5580000, bankEmi: 1035000 },
      { id: 'out-q-3', name: 'Q3 (Oct-Dec)', landDev: 2900000, agentCommissions: 2100000, salaries: 5580000, bankEmi: 1035000 },
      { id: 'out-q-4', name: 'Q4 (Jan-Mar)', landDev: 3100000, agentCommissions: 2400000, salaries: 5580000, bankEmi: 1035000 },
    ],
    sixMonthly: [
      { id: 'out-s-1', name: 'H1 (Apr - Sep)', landDev: 4200000, agentCommissions: 2980000, salaries: 11160000, bankEmi: 2070000 },
      { id: 'out-s-2', name: 'H2 (Oct - Mar)', landDev: 6000000, agentCommissions: 4500000, salaries: 11160000, bankEmi: 2070000 },
    ],
    annually: [
      { id: 'out-a-1', name: 'FY 2023-24', landDev: 7500000, agentCommissions: 5200000, salaries: 18000000, bankEmi: 4140000 },
      { id: 'out-a-2', name: 'FY 2024-25', landDev: 9800000, agentCommissions: 6900000, salaries: 21000000, bankEmi: 4140000 },
      { id: 'out-a-3', name: 'FY 2025-26', landDev: 10200000, agentCommissions: 7480000, salaries: 22320000, bankEmi: 4140000 },
    ]
  };

  const initialOutflowPieData = [
    { id: 'pie-out-1', name: 'Employee Payroll Salaries', value: 22320000, color: '#f43f5e' },
    { id: 'pie-out-2', name: 'Land & Site Development', value: 10200000, color: '#8b5cf6' },
    { id: 'pie-out-3', name: 'Agent Payout Commissions', value: 7480000, color: '#f59e0b' },
    { id: 'pie-out-4', name: 'Bank Loan EMI Servicing', value: 4140000, color: '#0ea5e9' },
  ];

  const [inflowDataSets, setInflowDataSets] = useState(initialInflowDataSets);
  const [inflowPieData, setInflowPieData] = useState(initialInflowPieData);

  const [outflowDataSets, setOutflowDataSets] = useState(initialOutflowDataSets);
  const [outflowPieData, setOutflowPieData] = useState(initialOutflowPieData);

  const handleDeleteInflowRow = (idToDelete: string) => {
    setInflowDataSets(prev => ({
      ...prev,
      [inflowPeriod]: prev[inflowPeriod].filter(item => item.id !== idToDelete)
    }));
  };

  const handleDeleteInflowPieRow = (idToDelete: string) => {
    setInflowPieData(prev => prev.filter(item => item.id !== idToDelete));
  };

  const handleClearInflowPeriod = () => {
    setInflowDataSets(prev => ({
      ...prev,
      [inflowPeriod]: []
    }));
  };

  const handleResetInflowData = () => {
    setInflowDataSets(initialInflowDataSets);
    setInflowPieData(initialInflowPieData);
  };

  const handleDeleteOutflowRow = (idToDelete: string) => {
    setOutflowDataSets(prev => ({
      ...prev,
      [outflowPeriod]: prev[outflowPeriod].filter(item => item.id !== idToDelete)
    }));
  };

  const handleDeleteOutflowPieRow = (idToDelete: string) => {
    setOutflowPieData(prev => prev.filter(item => item.id !== idToDelete));
  };

  const handleClearOutflowPeriod = () => {
    setOutflowDataSets(prev => ({
      ...prev,
      [outflowPeriod]: []
    }));
  };

  const handleResetOutflowData = () => {
    setOutflowDataSets(initialOutflowDataSets);
    setOutflowPieData(initialOutflowPieData);
  };

  return (
    <div className="space-y-8">
      
      {/* 8. TOTAL INFLOW ANALYTICS CARD */}
      <div className={`rounded-3xl p-6 md:p-8 border shadow-xl transition-colors space-y-6 ${
        isDarkMode ? 'bg-slate-900 border-sky-500/40 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-sky-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                8. Total Inflow Analytics
              </span>
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +24.5% Growth Y-o-Y
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <ArrowDownLeft className="w-6 h-6 text-sky-400" />
              <span>Revenue Inflow Performance & Collection Visualizer</span>
            </h3>
          </div>

          {/* Timeframe Selectors */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
            {(['monthly', 'quarterly', 'sixMonthly', 'annually'] as const).map((pd) => (
              <button
                key={pd}
                type="button"
                onClick={() => setInflowPeriod(pd)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                  inflowPeriod === pd
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {pd === 'monthly' ? 'Monthly' : pd === 'quarterly' ? 'Quarterly' : pd === 'sixMonthly' ? 'Six-Month' : 'Annual'}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View Mode Controls + Export Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setInflowChartType('bar')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                inflowChartType === 'bar' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Bar Chart</span>
            </button>
            <button
              type="button"
              onClick={() => setInflowChartType('line')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                inflowChartType === 'line' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineIcon className="w-3.5 h-3.5" />
              <span>Line Chart</span>
            </button>
            <button
              type="button"
              onClick={() => setInflowChartType('pie')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                inflowChartType === 'pie' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Pie Breakdown</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onExportPDF('Total Inflow Analytics Report')}
              className="bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button
              type="button"
              onClick={() => onExportExcel('Total Inflow Analytics Report')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              type="button"
              onClick={handleClearInflowPeriod}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Delete all data for current period"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Data</span>
            </button>
            <button
              type="button"
              onClick={handleResetInflowData}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset Inflow Dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Recharts & Record Table Container (div 3) */}
        <div className="space-y-4 pt-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {inflowChartType === 'bar' ? (
                <BarChart data={inflowDataSets[inflowPeriod]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v / 100000}L`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    formatter={(value: any) => [formatINR(Number(value)), 'Amount']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="bookingFees" name="Booking Advances" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="plotRegistry" name="Plot Registrations" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="investorCapital" name="Investor Capital" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : inflowChartType === 'line' ? (
                <LineChart data={inflowDataSets[inflowPeriod]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v / 100000}L`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    formatter={(value: any) => [formatINR(Number(value)), 'Amount']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="bookingFees" name="Booking Advances" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="plotRegistry" name="Plot Registrations" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="investorCapital" name="Investor Capital" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              ) : (
                <RechartsPie>
                  <Pie data={inflowPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => `${e.name}: ${(e.percent * 100).toFixed(0)}%`}>
                    {inflowPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }} formatter={(v: any) => formatINR(Number(v))} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </RechartsPie>
              )}
            </ResponsiveContainer>
          </div>

          {/* Detailed Inflow Rows Table with Delete Column */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-slate-300">Inflow Data Breakdown ({inflowPeriod.toUpperCase()})</span>
              <span className="text-[10px] text-slate-400">Click Delete to remove individual period records</span>
            </div>
            {inflowChartType !== 'pie' ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px]">
                    <th className="p-2">Period / Interval</th>
                    <th className="p-2">Booking Advances</th>
                    <th className="p-2">Plot Registrations</th>
                    <th className="p-2">Investor Capital</th>
                    <th className="p-2 text-center text-rose-400 bg-rose-950/30">Delete Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {inflowDataSets[inflowPeriod].length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 italic">No inflow records present for this timeframe. Click "Reset" above to restore default data.</td>
                    </tr>
                  ) : (
                    inflowDataSets[inflowPeriod].map((row) => (
                      <tr key={row.id} className="hover:bg-slate-900/60">
                        <td className="p-2 font-bold text-white">{row.name}</td>
                        <td className="p-2 text-amber-400">{formatINR(row.bookingFees)}</td>
                        <td className="p-2 text-emerald-400">{formatINR(row.plotRegistry)}</td>
                        <td className="p-2 text-sky-400">{formatINR(row.investorCapital)}</td>
                        <td className="p-2 text-center bg-rose-950/10">
                          <button
                            type="button"
                            onClick={() => handleDeleteInflowRow(row.id)}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg inline-flex items-center gap-1 shadow cursor-pointer transition-transform active:scale-95"
                            title="Delete this record"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px]">
                    <th className="p-2">Category Name</th>
                    <th className="p-2">Amount Collected</th>
                    <th className="p-2 text-center text-rose-400 bg-rose-950/30">Delete Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {inflowPieData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-500 italic">No breakdown records. Click "Reset" to restore.</td>
                    </tr>
                  ) : (
                    inflowPieData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-900/60">
                        <td className="p-2 font-bold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color }}></span>
                          <span>{row.name}</span>
                        </td>
                        <td className="p-2 text-emerald-400 font-mono font-bold">{formatINR(row.value)}</td>
                        <td className="p-2 text-center bg-rose-950/10">
                          <button
                            type="button"
                            onClick={() => handleDeleteInflowPieRow(row.id)}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg inline-flex items-center gap-1 shadow cursor-pointer transition-transform active:scale-95"
                            title="Delete this category"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* 9. TOTAL OUTFLOW ANALYTICS CARD */}
      <div className={`rounded-3xl p-6 md:p-8 border shadow-xl transition-colors space-y-6 ${
        isDarkMode ? 'bg-slate-900 border-rose-500/40 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-rose-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                9. Total Outflow Analytics
              </span>
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                -4.2% Cost Optimized
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <ArrowUpRight className="w-6 h-6 text-rose-400" />
              <span>Capital Outflow & Disbursal Cost Visualizer</span>
            </h3>
          </div>

          {/* Timeframe Selectors */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
            {(['monthly', 'quarterly', 'sixMonthly', 'annually'] as const).map((pd) => (
              <button
                key={pd}
                type="button"
                onClick={() => setOutflowPeriod(pd)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                  outflowPeriod === pd
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {pd === 'monthly' ? 'Monthly' : pd === 'quarterly' ? 'Quarterly' : pd === 'sixMonthly' ? 'Six-Month' : 'Annual'}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View Mode Controls + Export Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setOutflowChartType('bar')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                outflowChartType === 'bar' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Bar Chart</span>
            </button>
            <button
              type="button"
              onClick={() => setOutflowChartType('line')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                outflowChartType === 'line' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineIcon className="w-3.5 h-3.5" />
              <span>Line Chart</span>
            </button>
            <button
              type="button"
              onClick={() => setOutflowChartType('pie')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                outflowChartType === 'pie' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Pie Breakdown</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onExportPDF('Total Outflow Analytics Report')}
              className="bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button
              type="button"
              onClick={() => onExportExcel('Total Outflow Analytics Report')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              type="button"
              onClick={handleClearOutflowPeriod}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Delete all data for current period"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Data</span>
            </button>
            <button
              type="button"
              onClick={handleResetOutflowData}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset Outflow Dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Recharts & Record Table Container (div 3) */}
        <div className="space-y-4 pt-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {outflowChartType === 'bar' ? (
                <BarChart data={outflowDataSets[outflowPeriod]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v / 100000}L`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    formatter={(value: any) => [formatINR(Number(value)), 'Amount']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="landDev" name="Land Development" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="agentCommissions" name="Agent Commissions" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="salaries" name="Employee Salaries" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bankEmi" name="Bank Loan EMI" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : outflowChartType === 'line' ? (
                <LineChart data={outflowDataSets[outflowPeriod]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v / 100000}L`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    formatter={(value: any) => [formatINR(Number(value)), 'Amount']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="landDev" name="Land Development" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="agentCommissions" name="Agent Commissions" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="salaries" name="Employee Salaries" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="bankEmi" name="Bank Loan EMI" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              ) : (
                <RechartsPie>
                  <Pie data={outflowPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => `${e.name}: ${(e.percent * 100).toFixed(0)}%`}>
                    {outflowPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }} formatter={(v: any) => formatINR(Number(v))} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </RechartsPie>
              )}
            </ResponsiveContainer>
          </div>

          {/* Detailed Outflow Rows Table with Delete Column */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-slate-300">Outflow Data Breakdown ({outflowPeriod.toUpperCase()})</span>
              <span className="text-[10px] text-slate-400">Click Delete to remove individual period records</span>
            </div>
            {outflowChartType !== 'pie' ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px]">
                    <th className="p-2">Period / Interval</th>
                    <th className="p-2">Land Dev</th>
                    <th className="p-2">Commissions</th>
                    <th className="p-2">Salaries</th>
                    <th className="p-2">Bank EMI</th>
                    <th className="p-2 text-center text-rose-400 bg-rose-950/30">Delete Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {outflowDataSets[outflowPeriod].length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500 italic">No outflow records present for this timeframe. Click "Reset" above to restore default data.</td>
                    </tr>
                  ) : (
                    outflowDataSets[outflowPeriod].map((row) => (
                      <tr key={row.id} className="hover:bg-slate-900/60">
                        <td className="p-2 font-bold text-white">{row.name}</td>
                        <td className="p-2 text-purple-400">{formatINR(row.landDev)}</td>
                        <td className="p-2 text-amber-400">{formatINR(row.agentCommissions)}</td>
                        <td className="p-2 text-rose-400">{formatINR(row.salaries)}</td>
                        <td className="p-2 text-sky-400">{formatINR(row.bankEmi)}</td>
                        <td className="p-2 text-center bg-rose-950/10">
                          <button
                            type="button"
                            onClick={() => handleDeleteOutflowRow(row.id)}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg inline-flex items-center gap-1 shadow cursor-pointer transition-transform active:scale-95"
                            title="Delete this record"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px]">
                    <th className="p-2">Category Name</th>
                    <th className="p-2">Amount Disbursed</th>
                    <th className="p-2 text-center text-rose-400 bg-rose-950/30">Delete Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {outflowPieData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-500 italic">No breakdown records. Click "Reset" to restore.</td>
                    </tr>
                  ) : (
                    outflowPieData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-900/60">
                        <td className="p-2 font-bold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color }}></span>
                          <span>{row.name}</span>
                        </td>
                        <td className="p-2 text-rose-400 font-mono font-bold">{formatINR(row.value)}</td>
                        <td className="p-2 text-center bg-rose-950/10">
                          <button
                            type="button"
                            onClick={() => handleDeleteOutflowPieRow(row.id)}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg inline-flex items-center gap-1 shadow cursor-pointer transition-transform active:scale-95"
                            title="Delete this category"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
