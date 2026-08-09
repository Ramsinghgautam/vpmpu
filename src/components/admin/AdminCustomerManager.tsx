import React, { useState, useEffect } from 'react';
import {
  CustomerRecord,
  CustomerSaleRecord,
  CustomerWithdrawalRequest,
  CustomerSystemSummary
} from '../../types';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Building2,
  PlusCircle,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  BarChart3,
  RefreshCw,
  FileText,
  DollarSign,
  ChevronRight,
  X
} from 'lucide-react';
import {
  loadCustomerRecordsFromStorage,
  saveCustomerRecordsToStorage,
  computeCustomerSystemSummary,
  getCustomerSlabDetails,
  calculateCustomerSaleCommission,
  STANDARD_CUSTOMER_PLOT_VALUE,
  STANDARD_CUSTOMER_PLOT_SIZE,
  MANDATORY_CUSTOMER_RULE_HINDI,
  MANDATORY_CUSTOMER_RULE_ENG
} from '../../data/customerCommissionEngine';
import { formatINR } from '../../utils/calculators';

export const AdminCustomerManager: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [summary, setSummary] = useState<CustomerSystemSummary>({
    totalCustomers: 0,
    activeCustomers: 0,
    totalPlotsSoldByCustomers: 0,
    totalSalesVolume: 0,
    totalCommissionEarned: 0,
    totalCommissionPaid: 0,
    totalPendingCommission: 0,
    totalPendingWithdrawals: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'customers' | 'withdrawals' | 'reports'>('customers');

  // Selected Customer for Viewing / Actions
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  // Modals
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showRecordSaleModal, setShowRecordSaleModal] = useState(false);

  // Add Customer Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [purchasedPlotNo, setPurchasedPlotNo] = useState('');

  // Record Sale Form State
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [salePlotNo, setSalePlotNo] = useState('');

  // Load Data
  useEffect(() => {
    const loaded = loadCustomerRecordsFromStorage();
    setCustomers(loaded);
    setSummary(computeCustomerSystemSummary(loaded));
  }, []);

  const refreshData = (newRecords: CustomerRecord[]) => {
    setCustomers(newRecords);
    setSummary(computeCustomerSystemSummary(newRecords));
    saveCustomerRecordsToStorage(newRecords);
  };

  // Add New Customer Record
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: CustomerRecord = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newCustomerName,
      phone: newCustomerPhone,
      email: newCustomerEmail || `${newCustomerPhone}@vigyapaurush.com`,
      kycStatus: 'Verified',
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      purchasedPlot: {
        plotNo: purchasedPlotNo || `C-${Math.floor(100 + Math.random() * 900)}`,
        plotSizeSqft: STANDARD_CUSTOMER_PLOT_SIZE,
        ratePerSqft: 1000,
        totalPlotValue: STANDARD_CUSTOMER_PLOT_VALUE,
        purchaseDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'Fully Paid'
      },
      totalPlotsSold: 0,
      currentSlabPercentage: 15.5,
      nextSlabPercentage: 15.5,
      remainingPlotsInCurrentSlab: 1,
      wallet: {
        availableBalance: 0,
        pendingCommission: 0,
        paidCommission: 0,
        totalCommissionEarned: 0
      },
      salesLedger: [],
      withdrawalHistory: []
    };

    const updated = [newRecord, ...customers];
    refreshData(updated);

    setShowAddCustomerModal(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerEmail('');
    setPurchasedPlotNo('');
  };

  // Record Sale for Customer
  const handleRecordSaleForCustomer = (e: React.FormEvent) => {
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
      plotNo: salePlotNo || `PLT-${Math.floor(100 + Math.random() * 900)}`,
      plotSizeSqft: STANDARD_CUSTOMER_PLOT_SIZE,
      saleRatePerSqft: 1000,
      saleValue: STANDARD_CUSTOMER_PLOT_VALUE,
      saleNumber: nextSaleNum,
      slabPercentage: calc.slabPercentage,
      commissionEarned: calc.commissionEarned,
      paymentStatus: 'Credited',
      notes: 'Recorded by Admin ERP'
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

    const updatedList = customers.map(c => c.id === selectedCustomer.id ? updatedCustomer : c);
    refreshData(updatedList);
    setSelectedCustomer(updatedCustomer);

    setShowRecordSaleModal(false);
    setBuyerName('');
    setBuyerPhone('');
    setSalePlotNo('');
  };

  // Approve Customer Withdrawal Request
  const handleApproveWithdrawal = (customerId: string, reqId: string) => {
    const updatedList = customers.map(cust => {
      if (cust.id !== customerId) return cust;

      const targetReq = cust.withdrawalHistory.find(r => r.id === reqId);
      if (!targetReq) return cust;

      const updatedHistory = cust.withdrawalHistory.map(r => {
        if (r.id === reqId) {
          return {
            ...r,
            status: 'Approved' as const,
            processedDate: new Date().toISOString().split('T')[0],
            transactionId: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`
          };
        }
        return r;
      });

      return {
        ...cust,
        wallet: {
          ...cust.wallet,
          pendingCommission: Math.max(0, cust.wallet.pendingCommission - targetReq.amount),
          paidCommission: cust.wallet.paidCommission + targetReq.amount
        },
        withdrawalHistory: updatedHistory
      };
    });

    refreshData(updatedList);
  };

  // Export CSV
  const handleExportCSV = () => {
    window.open('/api/customers/export/csv', '_blank');
  };

  // Filter customers
  const filteredCustomers = customers.filter(c =>
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8 text-slate-100">
      {/* Title Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-amber-500/30 p-6 sm:p-8 rounded-2xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            Customer Progressive Sales ERP Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-100">
            Customer Plot Sales & Progressive Commission Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Standard Rate ₹1,000/Sqft. Progressive Commission Slabs from 15.5% down to permanent 4.5% fixed after 45 plot sales.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase px-5 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add Customer
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Mandatory Customer Business Rule Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500/60 rounded-xl p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
              ग्राहक कमीशन नीति (Mandatory Policy Disclaimer)
            </h3>
            <p className="text-sm font-bold text-amber-100 leading-relaxed">
              "{MANDATORY_CUSTOMER_RULE_HINDI}"
            </p>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Customers</span>
          <span className="text-xl font-black text-white">{summary.totalCustomers}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Active Customers</span>
          <span className="text-xl font-black text-emerald-400">{summary.activeCustomers}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Plots Sold</span>
          <span className="text-xl font-black text-amber-400">{summary.totalPlotsSoldByCustomers}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Sales Volume</span>
          <span className="text-lg font-black text-amber-200">{formatINR(summary.totalSalesVolume)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Comm</span>
          <span className="text-lg font-black text-amber-300">{formatINR(summary.totalCommissionEarned)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Paid</span>
          <span className="text-lg font-black text-emerald-400">{formatINR(summary.totalCommissionPaid)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Pending Comm</span>
          <span className="text-lg font-black text-amber-400">{formatINR(summary.totalPendingCommission)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Pending WD</span>
          <span className="text-lg font-black text-rose-400">{formatINR(summary.totalPendingWithdrawals)}</span>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'customers'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Customers Roster ({customers.length})
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'withdrawals'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Withdrawal Requests Queue ({summary.totalPendingWithdrawals > 0 ? 'Active' : '0'})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Sales & Commission Analytics
        </button>
      </div>

      {/* Tab 1: Customers Directory */}
      {activeTab === 'customers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Customer by Name, Phone, or ID..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                  <th className="p-3">Customer ID</th>
                  <th className="p-3">Name & Mobile</th>
                  <th className="p-3">Purchased Plot</th>
                  <th className="p-3">Plots Sold</th>
                  <th className="p-3">Active Slab</th>
                  <th className="p-3">Wallet Available</th>
                  <th className="p-3">Total Earned</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-amber-300">{cust.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{cust.customerName}</div>
                      <div className="text-[10px] text-slate-400">{cust.phone}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      {cust.purchasedPlot.plotNo} ({cust.purchasedPlot.plotSizeSqft} Sqft)
                    </td>
                    <td className="p-3 font-black text-amber-400">{cust.totalPlotsSold} Plots</td>
                    <td className="p-3">
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {cust.currentSlabPercentage}% Slab
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">{formatINR(cust.wallet.availableBalance)}</td>
                    <td className="p-3 font-bold text-amber-300">{formatINR(cust.wallet.totalCommissionEarned)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setShowRecordSaleModal(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] px-3 py-1.5 rounded-lg"
                      >
                        Record Sale
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Withdrawals Queue */}
      {activeTab === 'withdrawals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Customer Payout Requests Queue
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                  <th className="p-3">Request ID</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Account Details</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {customers.flatMap(c => c.withdrawalHistory.map(w => ({ ...w, customerPhone: c.phone }))).map((wd) => (
                  <tr key={wd.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-amber-300">{wd.id}</td>
                    <td className="p-3 font-bold text-white">{wd.customerName}</td>
                    <td className="p-3 text-slate-400">{wd.requestDate}</td>
                    <td className="p-3 font-black text-emerald-400">{formatINR(wd.amount)}</td>
                    <td className="p-3 text-slate-300">{wd.paymentMethod}</td>
                    <td className="p-3 text-slate-400">{wd.accountDetails}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        wd.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {wd.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {wd.status === 'Pending' && (
                        <button
                          onClick={() => handleApproveWithdrawal(wd.customerId, wd.id)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] px-3 py-1 rounded-lg"
                        >
                          Approve Payout
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Reports & Analytics */}
      {activeTab === 'reports' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <h2 className="text-xl font-black text-white flex items-center justify-between">
            <span>Customer Progressive Commission System Summary</span>
            <button
              onClick={handleExportCSV}
              className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold"
            >
              Export CSV Report
            </button>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-slate-400 text-xs uppercase font-bold block">1st Sale High Volume</span>
              <div className="text-2xl font-black text-amber-300">15.5% Slab</div>
              <p className="text-[10px] text-slate-400">First sale incentives maximum customer referrals.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-slate-400 text-xs uppercase font-bold block">45-Plot Progressive Coverage</span>
              <div className="text-2xl font-black text-amber-200">9 Tier Slabs</div>
              <p className="text-[10px] text-slate-400">Step down rate across 45 completed plot sales.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
              <span className="text-slate-400 text-xs uppercase font-bold block">46th+ Plot Sales</span>
              <div className="text-2xl font-black text-emerald-400">4.5% Fixed Rate</div>
              <p className="text-[10px] text-slate-400">Permanent commission rate for all subsequent sales.</p>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-lg text-amber-300">Add New Customer Record</h3>
              <button onClick={() => setShowAddCustomerModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Customer Full Name"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="tel"
                required
                placeholder="Mobile Number"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Purchased Plot No (e.g. C-101)"
                value={purchasedPlotNo}
                onChange={(e) => setPurchasedPlotNo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />

              <button
                type="submit"
                className="w-full bg-amber-500 text-slate-950 font-black text-xs uppercase py-3 rounded-xl shadow-lg"
              >
                Create Customer Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Sale Modal */}
      {showRecordSaleModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-lg text-amber-300">
                Record Sale for {selectedCustomer.customerName}
              </h3>
              <button onClick={() => setShowRecordSaleModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400">
                Next Plot Sale Number: <strong className="text-amber-400 font-mono">#{selectedCustomer.totalPlotsSold + 1}</strong>
              </div>
              <div className="text-slate-400">
                Applicable Slab Rate: <strong className="text-amber-300 font-mono">{getCustomerSlabDetails(selectedCustomer.totalPlotsSold).nextSlabPercentage}%</strong>
              </div>
            </div>

            <form onSubmit={handleRecordSaleForCustomer} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Buyer Full Name"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="tel"
                required
                placeholder="Buyer Phone"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="text"
                required
                placeholder="Plot Number (e.g. D-302)"
                value={salePlotNo}
                onChange={(e) => setSalePlotNo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />

              <button
                type="submit"
                className="w-full bg-amber-500 text-slate-950 font-black text-xs uppercase py-3 rounded-xl shadow-lg"
              >
                Process Sale & Credit Commission
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
