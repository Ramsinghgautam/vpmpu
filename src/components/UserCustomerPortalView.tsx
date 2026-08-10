import React, { useState, useEffect } from 'react';
import { User, CustomerRecord, CustomerWithdrawalRequest, CustomerSaleRecord } from '../types';
import {
  Users,
  Award,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PlusCircle,
  FileText,
  DollarSign,
  Search,
  PieChart,
  ChevronRight,
  AlertCircle,
  X
} from 'lucide-react';
import {
  loadCustomerRecordsFromStorage,
  saveCustomerRecordsToStorage,
  getCustomerSlabDetails,
  calculateCustomerSaleCommission,
  STANDARD_CUSTOMER_PLOT_VALUE,
  STANDARD_CUSTOMER_PLOT_SIZE,
  MANDATORY_CUSTOMER_RULE_HINDI,
  MANDATORY_CUSTOMER_RULE_ENG
} from '../data/customerCommissionEngine';
import { formatINR } from '../utils/calculators';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface UserCustomerPortalViewProps {
  currentUser: User | null;
}

export const UserCustomerPortalView: React.FC<UserCustomerPortalViewProps> = ({ currentUser }) => {
  const [customerRecords, setCustomerRecords] = useState<CustomerRecord[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  // Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showRecordSaleModal, setShowRecordSaleModal] = useState(false);

  // Form State - Withdrawal Request
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50000);
  const [withdrawMethod, setWithdrawMethod] = useState<'Bank Transfer' | 'UPI' | 'Cheque'>('Bank Transfer');
  const [accountDetails, setAccountDetails] = useState('');

  // Form State - Record Customer Sale
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [salePlotNo, setSalePlotNo] = useState('');

  // Load Data
  useEffect(() => {
    const loaded = loadCustomerRecordsFromStorage();
    setCustomerRecords(loaded);

    if (loaded.length > 0) {
      // Find matching user or pick first
      const match = loaded.find(c => c.phone === currentUser?.phone) || loaded[0];
      setSelectedCustomer(match);
    }
  }, [currentUser]);

  const updateCustomerData = (updatedRecords: CustomerRecord[]) => {
    setCustomerRecords(updatedRecords);
    saveCustomerRecordsToStorage(updatedRecords);

    if (selectedCustomer) {
      const refreshed = updatedRecords.find(c => c.id === selectedCustomer.id);
      if (refreshed) setSelectedCustomer(refreshed);
    }
  };

  if (!selectedCustomer) {
    return (
      <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 text-center space-y-4">
        <Users className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
        <h3 className="text-xl font-bold">Loading Customer Portal Data...</h3>
      </div>
    );
  }

  // Calculate current slab details
  const slabDetails = getCustomerSlabDetails(selectedCustomer.totalPlotsSold);

  // Submit Withdrawal Request
  const handleWithdrawalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    if (withdrawAmount > selectedCustomer.wallet.availableBalance) {
      alert("Withdrawal amount cannot exceed available wallet balance.");
      return;
    }

    const newReq: CustomerWithdrawalRequest = {
      id: `WD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.customerName,
      requestDate: new Date().toISOString().split('T')[0],
      amount: withdrawAmount,
      paymentMethod: withdrawMethod,
      accountDetails: accountDetails || 'Bank Transfer Account Specified',
      status: 'Pending'
    };

    const updatedCustomer: CustomerRecord = {
      ...selectedCustomer,
      wallet: {
        ...selectedCustomer.wallet,
        availableBalance: selectedCustomer.wallet.availableBalance - withdrawAmount,
        pendingCommission: selectedCustomer.wallet.pendingCommission + withdrawAmount
      },
      withdrawalHistory: [newReq, ...selectedCustomer.withdrawalHistory]
    };

    const updatedList = customerRecords.map(c => c.id === selectedCustomer.id ? updatedCustomer : c);
    updateCustomerData(updatedList);

    setShowWithdrawModal(false);
    setAccountDetails('');
    alert("Withdrawal request submitted successfully! Awaiting Admin approval.");
  };

  // Submit New Plot Sale
  const handleRecordNewSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const nextSaleNum = selectedCustomer.totalPlotsSold + 1;
    const calc = calculateCustomerSaleCommission(STANDARD_CUSTOMER_PLOT_VALUE, nextSaleNum);

    const newSale: CustomerSaleRecord = {
      id: `CSALE-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: selectedCustomer.id,
      date: new Date().toISOString().split('T')[0],
      buyerName: buyerName || 'Valued Client',
      buyerPhone: buyerPhone || '9999999999',
      plotNo: salePlotNo || `CPLT-${Math.floor(100 + Math.random() * 900)}`,
      plotSizeSqft: STANDARD_CUSTOMER_PLOT_SIZE,
      saleRatePerSqft: 1000,
      saleValue: STANDARD_CUSTOMER_PLOT_VALUE,
      saleNumber: nextSaleNum,
      slabPercentage: calc.slabPercentage,
      commissionEarned: calc.commissionEarned,
      paymentStatus: 'Credited'
    };

    const updatedCustomer: CustomerRecord = {
      ...selectedCustomer,
      totalPlotsSold: selectedCustomer.totalPlotsSold + 1,
      currentSlabPercentage: calc.slabPercentage,
      wallet: {
        ...selectedCustomer.wallet,
        availableBalance: selectedCustomer.wallet.availableBalance + calc.commissionEarned,
        totalCommissionEarned: selectedCustomer.wallet.totalCommissionEarned + calc.commissionEarned
      },
      salesLedger: [newSale, ...selectedCustomer.salesLedger]
    };

    const updatedList = customerRecords.map(c => c.id === selectedCustomer.id ? updatedCustomer : c);
    updateCustomerData(updatedList);

    setShowRecordSaleModal(false);
    setBuyerName('');
    setBuyerPhone('');
    setSalePlotNo('');
    alert(`Plot Sale #${nextSaleNum} recorded! Commission of ${formatINR(calc.commissionEarned)} credited to wallet.`);
  };

  // Recharts Chart Data
  const chartData = [
    { name: 'Jan', earnings: 40000 },
    { name: 'Feb', earnings: 139500 },
    { name: 'Mar', earnings: 270000 },
    { name: 'Apr', earnings: 128250 },
    { name: 'May', earnings: selectedCustomer.wallet.totalCommissionEarned },
  ];

  return (
    <div className="space-y-8 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4" />
              Customer Progressive Commission Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-amber-100">
              Welcome, {selectedCustomer.customerName}
            </h1>
            <p className="text-slate-300 text-sm">
              Customer ID: <span className="font-mono text-amber-400 font-bold">{selectedCustomer.id}</span> | Purchased Plot: <span className="font-mono text-white font-bold">{selectedCustomer.purchasedPlot.plotNo} ({selectedCustomer.purchasedPlot.plotSizeSqft} Sqft @ ₹1,000/sqft)</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowRecordSaleModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Record Plot Sale
            </button>

            <button
              type="button"
              onClick={() => setShowWithdrawModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              Request Withdrawal
            </button>
          </div>
        </div>

        {/* Account Selection Dropdown if multiple customers exist */}
        {customerRecords.length > 1 && (
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-3">
            <span className="text-xs text-slate-400">Switch Customer Account:</span>
            <select
              value={selectedCustomer.id}
              onChange={(e) => {
                const found = customerRecords.find(c => c.id === e.target.value);
                if (found) setSelectedCustomer(found);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-xs text-amber-300 font-bold"
            >
              {customerRecords.map(c => (
                <option key={c.id} value={c.id}>
                  {c.customerName} ({c.id} - {c.phone})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mandatory Customer Rule Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/50 rounded-2xl p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">
              ग्राहक कमीशन नीति निर्देश (Mandatory Customer Policy)
            </h4>
            <p className="text-sm font-semibold text-amber-100 leading-relaxed">
              "{MANDATORY_CUSTOMER_RULE_HINDI}"
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase">
            <span>Available Wallet</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {formatINR(selectedCustomer.wallet.availableBalance)}
          </div>
          <div className="text-[10px] text-slate-400">
            Pending Approval: <span className="text-amber-300 font-bold">{formatINR(selectedCustomer.wallet.pendingCommission)}</span>
          </div>
        </div>

        {/* Total Sales Count */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase">
            <span>Plots Sold</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">
            {selectedCustomer.totalPlotsSold} Plots
          </div>
          <div className="text-[10px] text-slate-400">
            Current Slab Rate: <span className="text-amber-400 font-bold">{slabDetails.currentSlabPercentage}%</span>
          </div>
        </div>

        {/* Total Lifetime Earnings */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase">
            <span>Lifetime Earnings</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-200">
            {formatINR(selectedCustomer.wallet.totalCommissionEarned)}
          </div>
          <div className="text-[10px] text-slate-400">
            Total Withdrawn: <span className="text-emerald-400 font-bold">{formatINR(selectedCustomer.wallet.paidCommission)}</span>
          </div>
        </div>

        {/* Next Slab Progress */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase">
            <span>Next Slab Target</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300">
            {slabDetails.nextSlabPercentage}%
          </div>
          <div className="text-[10px] text-slate-400">
            {slabDetails.isPermanentSlab
              ? '45+ Sales Completed (Permanent 4.5% Fixed)'
              : `${slabDetails.remainingPlotsInCurrentSlab} Plots left in current slab`}
          </div>
        </div>
      </div>

      {/* Customer Progressive Slab Progress Tracker Bar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="font-bold text-sm text-amber-300 uppercase tracking-wide flex items-center gap-2">
            <Award className="w-4 h-4" />
            Customer Progressive Commission Slab Tracker (45 Plots Milestones)
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Completed: <strong className="text-amber-400">{selectedCustomer.totalPlotsSold} / 45 Plots</strong>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full transition-all duration-500"
            style={{ width: `${Math.min(100, (selectedCustomer.totalPlotsSold / 45) * 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 text-[10px] text-center font-mono pt-2">
          <div className={`p-1.5 rounded-lg border ${selectedCustomer.totalPlotsSold >= 1 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
            1st (15.5%)
          </div>
          <div className={`p-1.5 rounded-lg border ${selectedCustomer.totalPlotsSold >= 3 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
            2-3 (15%)
          </div>
          <div className={`p-1.5 rounded-lg border ${selectedCustomer.totalPlotsSold >= 6 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
            4-6 (14.25%)
          </div>
          <div className={`p-1.5 rounded-lg border ${selectedCustomer.totalPlotsSold >= 10 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
            7-10 (13.25%)
          </div>
          <div className={`p-1.5 rounded-lg border ${selectedCustomer.totalPlotsSold >= 15 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
            11-15 (12%)
          </div>
          <div className={`p-1.5 rounded-lg border ${selectedCustomer.totalPlotsSold >= 21 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
            16-21 (10.5%)
          </div>
          <div className={`p-1.5 rounded-lg border ${selectedCustomer.totalPlotsSold >= 28 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
            22-28 (8.75%)
          </div>
          <div className={`p-1.5 rounded-lg border ${selectedCustomer.totalPlotsSold >= 36 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
            29-36 (6.75%)
          </div>
          <div className={`p-1.5 rounded-lg border ${selectedCustomer.totalPlotsSold >= 45 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
            37-45+ (4.5%)
          </div>
        </div>
      </div>

      {/* CUSTOMER PLOT EMI SCHEDULE & ONLINE PAYMENTS MODULE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-rose-400" />
              <span>My Active Plot EMI Schedule & Online Razorpay Payment</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Select tenure plan (12, 24, 36, 48, 60 Months) and pay monthly installment online via UPI, Credit Card, or NetBanking.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-bold">Tenure Plan:</span>
            <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-lg">
              36 Months (3 Years) @ 10.5% p.a.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Plot Allotted</span>
            <div className="text-lg font-black text-amber-400">Plot A-12</div>
            <span className="text-[10px] text-slate-400 block">Milestone City Prayagraj</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Monthly Installment</span>
            <div className="text-lg font-black text-rose-400 font-mono">₹42,500 / mo</div>
            <span className="text-[10px] text-slate-400 block">Due Date: 15th of Every Month</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Installments Completed</span>
            <div className="text-lg font-black text-emerald-400 font-mono">12 / 36 Months</div>
            <span className="text-[10px] text-slate-400 block">Remaining: ₹10,20,000</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-center gap-2">
            <button
              type="button"
              onClick={() => alert('Launching Razorpay Secure Gateway for ₹42,500 EMI Payment...')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase py-2.5 rounded-xl shadow-lg transition-all"
            >
              Pay Current EMI Online
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Customer Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Earnings Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-amber-300 uppercase tracking-wide flex items-center justify-between">
            <span>Commission Earnings Analytics</span>
            <span className="text-[10px] text-slate-400">Monthly Growth Curve</span>
          </h3>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#f59e0b', borderRadius: '0.75rem' }}
                  formatter={(val: number) => [formatINR(val), 'Earnings']}
                />
                <Area type="monotone" dataKey="earnings" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#customerGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Profile Summary (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-amber-300 uppercase tracking-wide border-b border-slate-800 pb-2">
            Purchased Plot Credentials
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Customer Name:</span>
              <span className="font-bold text-white">{selectedCustomer.customerName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Phone / Email:</span>
              <span className="font-bold text-slate-300">{selectedCustomer.phone}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">KYC Status:</span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold text-[10px]">
                {selectedCustomer.kycStatus}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Plot No & Size:</span>
              <span className="font-bold text-amber-300 font-mono">
                {selectedCustomer.purchasedPlot.plotNo} ({selectedCustomer.purchasedPlot.plotSizeSqft} Sqft)
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Plot Purchase Rate:</span>
              <span className="font-bold text-white font-mono">₹1,000 / Sqft</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Total Plot Value:</span>
              <span className="font-black text-amber-200 font-mono text-sm">
                {formatINR(selectedCustomer.purchasedPlot.totalPlotValue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Sales Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
        <h3 className="text-lg font-black text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            Plot Sales History Ledger ({selectedCustomer.salesLedger.length} Sales)
          </span>
          <span className="text-xs text-amber-400 font-normal">Progressive Slab Applied Automatically</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                <th className="p-3">Sale ID</th>
                <th className="p-3">Date</th>
                <th className="p-3">Buyer Details</th>
                <th className="p-3">Plot No</th>
                <th className="p-3">Sale Value</th>
                <th className="p-3">Slab Rate</th>
                <th className="p-3">Commission</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {selectedCustomer.salesLedger.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                    No plot sales recorded yet. Click "+ Record Plot Sale" above to register your first sale!
                  </td>
                </tr>
              ) : (
                selectedCustomer.salesLedger.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-amber-300">{s.id}</td>
                    <td className="p-3 text-slate-400">{s.date}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{s.buyerName}</div>
                      <div className="text-[10px] text-slate-400">{s.buyerPhone}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{s.plotNo}</td>
                    <td className="p-3 font-mono font-bold text-slate-200">{formatINR(s.saleValue)}</td>
                    <td className="p-3">
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {s.slabPercentage}%
                      </span>
                    </td>
                    <td className="p-3 font-black text-emerald-400">{formatINR(s.commissionEarned)}</td>
                    <td className="p-3">
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {s.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Requests History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
        <h3 className="text-lg font-black text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Wallet Withdrawal History
          </span>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg"
          >
            + Request Payout
          </button>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                <th className="p-3">Request ID</th>
                <th className="p-3">Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Method</th>
                <th className="p-3">Account Details</th>
                <th className="p-3">Status</th>
                <th className="p-3">Transaction ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {selectedCustomer.withdrawalHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                    No withdrawal requests submitted yet.
                  </td>
                </tr>
              ) : (
                selectedCustomer.withdrawalHistory.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-amber-300">{w.id}</td>
                    <td className="p-3 text-slate-400">{w.requestDate}</td>
                    <td className="p-3 font-black text-emerald-400">{formatINR(w.amount)}</td>
                    <td className="p-3 text-slate-300">{w.paymentMethod}</td>
                    <td className="p-3 text-slate-400">{w.accountDetails}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        w.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{w.transactionId || 'Pending Approval'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New Sale Modal */}
      {showRecordSaleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-lg text-amber-300">
                Record New Customer Plot Sale
              </h3>
              <button onClick={() => setShowRecordSaleModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs space-y-1">
              <div className="font-bold text-amber-300">Sale #{selectedCustomer.totalPlotsSold + 1} Progression</div>
              <div className="text-slate-300">
                Applicable Slab Rate: <strong className="text-amber-400 font-mono">{getCustomerSlabDetails(selectedCustomer.totalPlotsSold).nextSlabPercentage}%</strong>
              </div>
              <div className="text-slate-400">
                Calculated Commission: <strong className="text-emerald-400 font-mono">{formatINR(calculateCustomerSaleCommission(STANDARD_CUSTOMER_PLOT_VALUE, selectedCustomer.totalPlotsSold + 1).commissionEarned)}</strong>
              </div>
            </div>

            <form onSubmit={handleRecordNewSale} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Buyer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Buyer Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Plot Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C-108"
                  value={salePlotNo}
                  onChange={(e) => setSalePlotNo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase py-3 rounded-xl shadow-lg mt-2"
              >
                Submit Sale & Credit Commission
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Request Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-lg text-emerald-400">
                Request Wallet Payout
              </h3>
              <button onClick={() => setShowWithdrawModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between">
              <span className="text-slate-400">Available Wallet Balance:</span>
              <span className="font-black text-emerald-400 font-mono">{formatINR(selectedCustomer.wallet.availableBalance)}</span>
            </div>

            <form onSubmit={handleWithdrawalRequest} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  max={selectedCustomer.wallet.availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Payment Method</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS)</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="Cheque">Account Payee Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Account / UPI Details</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter Bank Name, Account No, IFSC Code or UPI ID"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase py-3 rounded-xl shadow-lg mt-2"
              >
                Submit Withdrawal Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
