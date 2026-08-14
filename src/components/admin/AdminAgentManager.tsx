import React, { useState, useEffect } from 'react';
import {
  AgentRecord,
  AgentSaleRecord,
  AgentWithdrawalRequest,
  AgentSystemSummary
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
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Award,
  BarChart3,
  RefreshCw,
  FileText,
  DollarSign,
  Send,
  Printer,
  ChevronRight,
  Trash2,
  X
} from 'lucide-react';
import {
  loadAgentRecordsFromStorage,
  saveAgentRecordsToStorage,
  computeAgentSystemSummary,
  MANDATORY_BUSINESS_RULE_HINDI,
  MANDATORY_BUSINESS_RULE_ENG,
  RISK_FREE_INVESTOR_RATES,
  BASE_PLOT_VALUE,
  STANDARD_PLOT_SIZE_SQFT,
  getSlabForSaleNumber,
  calculateAgentSaleCommission
} from '../../data/agentCommissionEngine';
import { formatINR } from '../../utils/calculators';

export const AdminAgentManager: React.FC = () => {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [summary, setSummary] = useState<AgentSystemSummary>({
    totalAgents: 0,
    activeAgents: 0,
    totalPlotSalesCount: 0,
    totalSalesVolume: 0,
    totalCommissionDistributed: 0,
    totalEmiRecovered: 0,
    outstandingEmiLiability: 0,
    totalExpencesVolume: 0,
    pendingWithdrawalsAmount: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'agents' | 'withdrawals' | 'sales' | 'reports'>('agents');

  // Selected agent for viewing details or actions
  const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);

  // Modals
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [showRecordSaleModal, setShowRecordSaleModal] = useState(false);

  // Add Agent Form State
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentEmail, setNewAgentEmail] = useState('');
  const [assignedPlotNo, setAssignedPlotNo] = useState('');

  // Record Sale Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [salePlotNo, setSalePlotNo] = useState('');
  const [saleCategory, setSaleCategory] = useState<'Standard Plot' | 'Risk Free Investor Plot'>('Standard Plot');
  const [selectedInvestorRate, setSelectedInvestorRate] = useState<number>(1450);

  // Load Data
  useEffect(() => {
    const loaded = loadAgentRecordsFromStorage();
    setAgents(loaded);
    setSummary(computeAgentSystemSummary(loaded));
  }, []);

  const refreshData = (newAgents: AgentRecord[]) => {
    setAgents(newAgents);
    setSummary(computeAgentSystemSummary(newAgents));
    saveAgentRecordsToStorage(newAgents);
  };

  // Add New Agent
  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: AgentRecord = {
      id: `AGENT-${Math.floor(1000 + Math.random() * 9000)}`,
      agentName: newAgentName,
      phone: newAgentPhone,
      email: newAgentEmail || `${newAgentPhone}@vigyapaurush.com`,
      kycStatus: 'Verified',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      assignedPlot: {
        plotNo: assignedPlotNo || `A-${Math.floor(100 + Math.random() * 900)}`,
        plotSizeSqft: STANDARD_PLOT_SIZE_SQFT,
        totalPlotValue: BASE_PLOT_VALUE,
        emiDurationMonths: 60,
        monthlyEmiAmount: 15000,
        totalEmiPaidDirectly: 0,
        emiAdjustedFromCommission: 0,
        remainingEmiLiability: BASE_PLOT_VALUE,
        emiCompletionPercentage: 0
      },
      totalPlotsSold: 0,
      currentSlabPercentage: 8.0,
      wallet: {
        availableBalance: 0,
        pendingBalance: 0,
        totalEmiAdjustedBalance: 0,
        totalWithdrawn: 0,
        totalEarned: 0
      },
      salesLedger: [],
      withdrawalHistory: []
    };

    const updated = [newRecord, ...agents];
    refreshData(updated);

    setShowAddAgentModal(false);
    setNewAgentName('');
    setNewAgentPhone('');
    setNewAgentEmail('');
    setAssignedPlotNo('');
  };

  // Record Sale for Selected Agent
  const handleRecordSaleForAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    let finalSaleVal = BASE_PLOT_VALUE;
    if (saleCategory === 'Risk Free Investor Plot') {
      finalSaleVal = selectedInvestorRate * STANDARD_PLOT_SIZE_SQFT;
    }

    const currentLiability = selectedAgent.assignedPlot ? selectedAgent.assignedPlot.remainingEmiLiability : 0;
    const calc = calculateAgentSaleCommission(finalSaleVal, selectedAgent.totalPlotsSold, currentLiability);

    const newSale: AgentSaleRecord = {
      id: `SALE-${Math.floor(1000 + Math.random() * 9000)}`,
      agentId: selectedAgent.id,
      date: new Date().toISOString().split('T')[0],
      customerName: customerName || 'Valued Client',
      customerPhone: customerPhone || '9999999999',
      plotNo: salePlotNo || `PLT-${Math.floor(100 + Math.random() * 900)}`,
      plotSizeSqft: STANDARD_PLOT_SIZE_SQFT,
      saleType: saleCategory,
      saleValue: finalSaleVal,
      slabPercentageUsed: calc.slabPercentage,
      grossCommissionEarned: calc.grossCommission,
      emiDeductionAmount: calc.emiDeductionAmount,
      netWalletAmount: calc.netWalletAmount,
      investorPlanRate: saleCategory === 'Risk Free Investor Plot' ? selectedInvestorRate : undefined,
      notes: 'Recorded by Admin Panel'
    };

    const updatedAgent: AgentRecord = {
      ...selectedAgent,
      totalPlotsSold: selectedAgent.totalPlotsSold + 1,
      currentSlabPercentage: getSlabForSaleNumber(selectedAgent.totalPlotsSold + 2).percentage,
      wallet: {
        ...selectedAgent.wallet,
        availableBalance: selectedAgent.wallet.availableBalance + calc.netWalletAmount,
        totalEmiAdjustedBalance: selectedAgent.wallet.totalEmiAdjustedBalance + calc.emiDeductionAmount,
        totalEarned: selectedAgent.wallet.totalEarned + calc.grossCommission
      },
      assignedPlot: selectedAgent.assignedPlot ? {
        ...selectedAgent.assignedPlot,
        emiAdjustedFromCommission: selectedAgent.assignedPlot.emiAdjustedFromCommission + calc.emiDeductionAmount,
        remainingEmiLiability: calc.newRemainingLiability,
        emiCompletionPercentage: Number(
          (((selectedAgent.assignedPlot.totalEmiPaidDirectly + selectedAgent.assignedPlot.emiAdjustedFromCommission + calc.emiDeductionAmount) / selectedAgent.assignedPlot.totalPlotValue) * 100).toFixed(2)
        )
      } : undefined,
      salesLedger: [newSale, ...selectedAgent.salesLedger]
    };

    const updatedList = agents.map(a => a.id === selectedAgent.id ? updatedAgent : a);
    refreshData(updatedList);
    setSelectedAgent(updatedAgent);

    setShowRecordSaleModal(false);
    setCustomerName('');
    setCustomerPhone('');
    setSalePlotNo('');
  };

  // Agent Delete Modal state
  const [agentToDelete, setAgentToDelete] = useState<AgentRecord | null>(null);

  // Delete Agent
  const handleDeleteAgent = (agentId: string) => {
    const updated = agents.filter(a => a.id !== agentId);
    refreshData(updated);
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null);
    }
    setAgentToDelete(null);
  };

  // Delete Withdrawal Request
  const handleDeleteWithdrawal = (agentId: string, reqId: string) => {
    const updatedList = agents.map(agent => {
      if (agent.id !== agentId) return agent;
      return {
        ...agent,
        withdrawalHistory: agent.withdrawalHistory.filter(w => w.id !== reqId)
      };
    });
    refreshData(updatedList);
  };

  // Approve Withdrawal Request
  const handleApproveWithdrawal = (agentId: string, reqId: string) => {
    const updatedList = agents.map(agent => {
      if (agent.id !== agentId) return agent;

      const targetReq = agent.withdrawalHistory.find(r => r.id === reqId);
      if (!targetReq) return agent;

      const updatedHistory = agent.withdrawalHistory.map(r => {
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
        ...agent,
        wallet: {
          ...agent.wallet,
          pendingBalance: Math.max(0, agent.wallet.pendingBalance - targetReq.amount),
          totalWithdrawn: agent.wallet.totalWithdrawn + targetReq.amount
        },
        withdrawalHistory: updatedHistory
      };
    });

    refreshData(updatedList);
  };

  // Export CSV
  const handleExportCSV = () => {
    window.open('/api/agents/export/csv', '_blank');
  };

  // Filter agents
  const filteredAgents = agents.filter(a =>
    a.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8 text-slate-100">
      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-amber-500/30 p-6 sm:p-8 rounded-2xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            Executive ERP Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-100">
            Agent Plot Sales & Commission Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage Agents, Dynamic Commission Slabs, 50/50 Plot EMI Offsets, & Wallet Withdrawals.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowAddAgentModal(true)}
            className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Agent
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

      {/* Mandatory Business Rule Disclaimer Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500/60 rounded-xl p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
              व्यवसायिक नियम: एजेंट कमीशन कटौती नीति (Executive Policy)
            </h3>
            <p className="text-sm font-bold text-amber-100 leading-relaxed">
              "{MANDATORY_BUSINESS_RULE_HINDI}"
            </p>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Agents</span>
          <span className="text-xl font-black text-white">{summary.totalAgents}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Active Agents</span>
          <span className="text-xl font-black text-emerald-400">{summary.activeAgents}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Plots Sold</span>
          <span className="text-xl font-black text-amber-400">{summary.totalPlotSalesCount}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Sales Val</span>
          <span className="text-lg font-black text-amber-200">{formatINR(summary.totalSalesVolume)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Comm</span>
          <span className="text-lg font-black text-amber-300">{formatINR(summary.totalCommissionDistributed)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">EMI Recovered</span>
          <span className="text-lg font-black text-indigo-400">{formatINR(summary.totalEmiRecovered)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Expenses Volume</span>
          <span className="text-lg font-black text-rose-400">{formatINR(summary.totalExpencesVolume)}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">EMI Liability</span>
          <span className="text-lg font-black text-rose-400">{formatINR(summary.outstandingEmiLiability)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Pending WD</span>
          <span className="text-lg font-black text-emerald-300">{formatINR(summary.pendingWithdrawalsAmount)}</span>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('agents')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'agents'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Agents Roster ({agents.length})
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
          Pending Withdrawals ({summary.pendingWithdrawalsAmount > 0 ? 'Active' : '0'})
        </button>
      </div>

      {/* Tab 1: Agents Directory */}
      {activeTab === 'agents' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Agent by Name, Phone, or ID..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                  <th className="p-3">Agent ID</th>
                  <th className="p-3">Name & Details</th>
                  <th className="p-3">Assigned Plot</th>
                  <th className="p-3">Sales Count</th>
                  <th className="p-3">Active Slab</th>
                  <th className="p-3">Wallet Available</th>
                  <th className="p-3">EMI Offset</th>
                  <th className="p-3">Remaining Liability</th>
                  <th className="p-3 text-center text-rose-400 font-bold uppercase tracking-wider bg-rose-950/30 border-x border-rose-900/40">
                    Delete Column
                  </th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-amber-300">{agent.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{agent.agentName}</div>
                      <div className="text-[10px] text-slate-400">{agent.phone} | {agent.email}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      {agent.assignedPlot ? agent.assignedPlot.plotNo : 'N/A'}
                    </td>
                    <td className="p-3 font-black text-amber-400">{agent.totalPlotsSold} Plots</td>
                    <td className="p-3">
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {agent.currentSlabPercentage}% Slab
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">{formatINR(agent.wallet.availableBalance)}</td>
                    <td className="p-3 font-bold text-indigo-400">{formatINR(agent.wallet.totalEmiAdjustedBalance)}</td>
                    <td className="p-3 font-mono font-bold text-amber-300">
                      {agent.assignedPlot ? formatINR(agent.assignedPlot.remainingEmiLiability) : '₹0'}
                    </td>
                    <td className="p-3 text-center bg-rose-950/10 border-x border-rose-900/20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAgentToDelete(agent);
                        }}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-md hover:shadow-rose-900/50 transition-all cursor-pointer inline-flex items-center gap-1.5"
                        title={`Delete agent ${agent.agentName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowRecordSaleModal(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer"
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

      {/* Tab 2: Withdrawals Approval */}
      {activeTab === 'withdrawals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Withdrawal Requests Queue
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                  <th className="p-3">Request ID</th>
                  <th className="p-3">Agent Name</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Account Details</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center text-rose-400 font-bold uppercase tracking-wider bg-rose-950/30 border-x border-rose-900/40">
                    Delete Column
                  </th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {agents.flatMap(a => a.withdrawalHistory.map(w => ({ ...w, agentPhone: a.phone }))).map((wd) => (
                  <tr key={wd.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-amber-300">{wd.id}</td>
                    <td className="p-3 font-bold text-white">{wd.agentName}</td>
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
                    <td className="p-3 text-center bg-rose-950/10 border-x border-rose-900/20">
                      <button
                        type="button"
                        onClick={() => handleDeleteWithdrawal(wd.agentId, wd.id)}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-md hover:shadow-rose-900/50 transition-all cursor-pointer inline-flex items-center gap-1.5"
                        title="Delete Withdrawal Request"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      {wd.status === 'Pending' ? (
                        <button
                          type="button"
                          onClick={() => handleApproveWithdrawal(wd.agentId, wd.id)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Approve Payout
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px] font-bold">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Agent Modal */}
      {showAddAgentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-lg text-amber-300">Add New Agent Record</h3>
              <button onClick={() => setShowAddAgentModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddAgent} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Agent Full Name"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="tel"
                required
                placeholder="Mobile Number"
                value={newAgentPhone}
                onChange={(e) => setNewAgentPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newAgentEmail}
                onChange={(e) => setNewAgentEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Assigned Plot No (e.g. A-101)"
                value={assignedPlotNo}
                onChange={(e) => setAssignedPlotNo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />

              <button
                type="submit"
                className="w-full bg-amber-500 text-slate-950 font-black text-xs uppercase py-3 rounded-xl"
              >
                Create Agent Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Sale Modal */}
      {showRecordSaleModal && selectedAgent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-lg text-amber-300">
                Record Sale for {selectedAgent.agentName}
              </h3>
              <button onClick={() => setShowRecordSaleModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleRecordSaleForAgent} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="tel"
                required
                placeholder="Customer Mobile"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="text"
                required
                placeholder="Plot Number (e.g. B-205)"
                value={salePlotNo}
                onChange={(e) => setSalePlotNo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <select
                value={saleCategory}
                onChange={(e) => setSaleCategory(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="Standard Plot">Standard Plot (₹9,00,000 Base)</option>
                <option value="Risk Free Investor Plot">Free Plot Scheme Sale (Tiered Rates)</option>
              </select>

              {saleCategory === 'Risk Free Investor Plot' && (
                <select
                  value={selectedInvestorRate}
                  onChange={(e) => setSelectedInvestorRate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                >
                  {RISK_FREE_INVESTOR_RATES.map((p) => (
                    <option key={p.plan} value={p.rateSqft}>
                      {p.plan}: {p.label}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="submit"
                className="w-full bg-amber-500 text-slate-950 font-black text-xs uppercase py-3 rounded-xl cursor-pointer"
              >
                Process Sale & Calculate Commission
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Agent Confirmation Modal */}
      {agentToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-lg text-rose-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-500" />
                <span>Confirm Agent Deletion</span>
              </h3>
              <button onClick={() => setAgentToDelete(null)} className="cursor-pointer text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="text-sm font-semibold text-slate-200">
                Are you sure you want to permanently delete agent record for <strong className="text-white font-bold">{agentToDelete.agentName}</strong>?
              </p>
              <div className="bg-rose-950/30 border border-rose-900/50 p-3 rounded-xl space-y-1 text-[11px] text-rose-200">
                <div>• Agent ID: <strong className="font-mono">{agentToDelete.id}</strong></div>
                <div>• Total Plots Sold: {agentToDelete.totalPlotsSold} Plots</div>
                <div>• Wallet Balance: {formatINR(agentToDelete.wallet.availableBalance)}</div>
              </div>
              <p className="text-slate-400 italic">This action will remove the agent from the roster and cannot be undone.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAgentToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAgent(agentToDelete.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete Agent</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
