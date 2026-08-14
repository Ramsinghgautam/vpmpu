import React, { useState, useEffect } from 'react';
import {
  TeamMemberRecord,
  MlmLevelConfig,
  GenealogyTreeNode,
  BonusTransactionRecord,
  BonusWithdrawalRequest,
  MlmSystemSummary
} from '../../types';
import {
  Users,
  Award,
  TrendingUp,
  Wallet,
  ShieldCheck,
  PlusCircle,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  RefreshCw,
  GitMerge,
  GitBranch,
  Layers,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Lock,
  Unlock,
  DollarSign,
  AlertTriangle,
  X,
  FileText,
  Filter,
  Sparkles
} from 'lucide-react';
import {
  MLM_LEVEL_CONFIGS,
  STANDARD_MLM_PLOT_VALUE,
  MANDATORY_MLM_DEDUCTION_RULE_HINDI,
  MANDATORY_MLM_DEDUCTION_RULE_ENG,
  MANDATORY_MLM_QUALIFICATION_RULE_HINDI,
  MANDATORY_MLM_QUALIFICATION_RULE_ENG,
  loadMlmTeamDataFromStorage,
  saveMlmTeamDataToStorage,
  computeMlmSystemSummary,
  buildGenealogyTree,
  calculateLevelBonus
} from '../../data/mlmBonusEngine';
import { formatINR } from '../../utils/calculators';

export const AdminMlmTeamManager: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMemberRecord[]>([]);
  const [summary, setSummary] = useState<MlmSystemSummary>({
    totalTeamMembers: 0,
    activeTeamMembers: 0,
    inactiveTeamMembers: 0,
    totalTeamSalesVolume: 0,
    totalPlotsSold: 0,
    totalBonusEarned: 0,
    totalBonusPaid: 0,
    totalBonusPending: 0,
    pendingWithdrawalsCount: 0,
    pendingWithdrawalsAmount: 0
  });

  const [levelConfigs, setLevelConfigs] = useState<MlmLevelConfig[]>(MLM_LEVEL_CONFIGS);

  // Tabs
  const [activeTab, setActiveTab] = useState<
    'tree' | 'roster' | 'dashboard' | 'wallet' | 'leaderboards' | 'config'
  >('tree');

  // Tree Mode
  const [treeMode, setTreeMode] = useState<'unilevel' | 'binary'>('unilevel');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'TMB-1001': true,
    'TMB-1002': true,
    'TMB-1003': true
  });

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  // Selected Member Modal / Action
  const [selectedMember, setSelectedMember] = useState<TeamMemberRecord | null>(null);

  // Modals
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showRecordSaleModal, setShowRecordSaleModal] = useState(false);

  // Add Member Form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Customer' | 'Agent' | 'Investor' | 'RiskFreeInvestor'>('Agent');
  const [newSponsorId, setNewSponsorId] = useState('TMB-1001');

  // Record Downline Sale Form
  const [saleDownlineId, setSaleDownlineId] = useState('');
  const [salePlotNo, setSalePlotNo] = useState('');
  const [saleValue, setSaleValue] = useState(STANDARD_MLM_PLOT_VALUE);

  // Load Data
  useEffect(() => {
    const loaded = loadMlmTeamDataFromStorage();
    setTeamMembers(loaded);
    setSummary(computeMlmSystemSummary(loaded));
  }, []);

  const refreshData = (updatedRecords: TeamMemberRecord[]) => {
    setTeamMembers(updatedRecords);
    setSummary(computeMlmSystemSummary(updatedRecords));
    saveMlmTeamDataToStorage(updatedRecords);
  };

  const toggleNodeExpand = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const sponsor = teamMembers.find(m => m.id === newSponsorId);

    const newId = `TMB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMember: TeamMemberRecord = {
      id: newId,
      name: newMemberName,
      phone: newMemberPhone,
      email: newMemberEmail || `${newMemberPhone}@vigyapaurush.com`,
      role: newMemberRole,
      sponsorId: sponsor ? sponsor.id : null,
      sponsorName: sponsor ? sponsor.name : null,
      parentId: sponsor ? sponsor.id : null,
      parentName: sponsor ? sponsor.name : null,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      currentLevel: 1,
      currentDesignation: 'Buyer',
      nextLevelRequirement: 'Agentship (Second Downline sells 2 Plots)',
      remainingPlotsToNextLevel: 1,
      personalPlotsSold: 0,
      teamSize: 0,
      activeMembers: 0,
      inactiveMembers: 0,
      directReferralsCount: 0,
      qualifiedDownlinesCount: 0,
      salesMetrics: {
        dailySalesVolume: 0,
        weeklySalesVolume: 0,
        monthlySalesVolume: 0,
        quarterlySalesVolume: 0,
        annualSalesVolume: 0,
        totalTeamSalesVolume: 0,
        totalPlotsSoldByTeam: 0
      },
      wallet: {
        memberId: newId,
        memberName: newMemberName,
        availableBonus: 0,
        paidBonus: 0,
        pendingWithdrawalsBonus: 0,
        totalBonusEarned: 0,
        lastUpdated: new Date().toISOString().split('T')[0]
      },
      bonusLedger: [],
      withdrawalHistory: []
    };

    // Also update sponsor direct count & team size
    const updatedList = teamMembers.map(m => {
      if (m.id === newSponsorId) {
        return {
          ...m,
          directReferralsCount: m.directReferralsCount + 1,
          teamSize: m.teamSize + 1,
          activeMembers: m.activeMembers + 1
        };
      }
      return m;
    });

    const newList = [newMember, ...updatedList];
    refreshData(newList);

    setShowAddMemberModal(false);
    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberEmail('');
  };

  // Record Downline Sale & Distribute Level Bonus to Upline
  const handleRecordDownlineSale = (e: React.FormEvent) => {
    e.preventDefault();
    const downline = teamMembers.find(m => m.id === saleDownlineId);
    if (!downline) return;

    // Check if downline has sponsor/upline
    if (!downline.sponsorId) {
      alert('Selected member has no upline sponsor. Multi-level bonus requires an upline.');
      return;
    }

    const upline = teamMembers.find(m => m.id === downline.sponsorId);
    if (!upline) return;

    // Determine level trigger
    const levelToTrigger = Math.min(9, upline.currentLevel);
    const calc = calculateLevelBonus(saleValue, levelToTrigger);

    const newTxn: BonusTransactionRecord = {
      id: `TXN-MLM-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      downlineMemberId: downline.id,
      downlineName: downline.name,
      uplineMemberId: upline.id,
      uplineName: upline.name,
      levelTriggered: calc.level,
      designation: calc.designation,
      plotNo: salePlotNo || `PLT-${Math.floor(100 + Math.random() * 900)}`,
      saleValue,
      grossCommission: Math.round(saleValue * 0.155),
      bonusPercentage: calc.bonusPercentage,
      bonusAmountEarned: calc.bonusAmountEarned,
      downlineDeductionAmount: calc.downlineDeductionAmount,
      netBonusCredited: calc.bonusAmountEarned,
      status: 'Credited',
      auditNotes: `Level ${calc.level} (${calc.designation}) Bonus credited to ${upline.name} after ${calc.bonusPercentage}% deduction from downline ${downline.name}.`
    };

    // Update Upline Wallet & Ledger
    const updatedList = teamMembers.map(m => {
      if (m.id === upline.id) {
        return {
          ...m,
          salesMetrics: {
            ...m.salesMetrics,
            dailySalesVolume: m.salesMetrics.dailySalesVolume + saleValue,
            totalTeamSalesVolume: m.salesMetrics.totalTeamSalesVolume + saleValue,
            totalPlotsSoldByTeam: m.salesMetrics.totalPlotsSoldByTeam + 1
          },
          wallet: {
            ...m.wallet,
            availableBonus: m.wallet.availableBonus + calc.bonusAmountEarned,
            totalBonusEarned: m.wallet.totalBonusEarned + calc.bonusAmountEarned
          },
          bonusLedger: [newTxn, ...m.bonusLedger]
        };
      }
      if (m.id === downline.id) {
        return {
          ...m,
          personalPlotsSold: m.personalPlotsSold + 1
        };
      }
      return m;
    });

    refreshData(updatedList);
    setShowRecordSaleModal(false);
    setSalePlotNo('');
  };

  // Approve Payout Withdrawal
  const handleApprovePayout = (memberId: string, reqId: string) => {
    const updatedList = teamMembers.map(m => {
      if (m.id !== memberId) return m;

      const targetReq = m.withdrawalHistory.find(w => w.id === reqId);
      if (!targetReq) return m;

      const updatedHistory = m.withdrawalHistory.map(w => {
        if (w.id === reqId) {
          return {
            ...w,
            status: 'Approved' as const,
            processedDate: new Date().toISOString().split('T')[0],
            transactionId: `TXN-BANK-${Math.floor(100000 + Math.random() * 900000)}`
          };
        }
        return w;
      });

      return {
        ...m,
        wallet: {
          ...m.wallet,
          pendingWithdrawalsBonus: Math.max(0, m.wallet.pendingWithdrawalsBonus - targetReq.amount),
          paidBonus: m.wallet.paidBonus + targetReq.amount
        },
        withdrawalHistory: updatedHistory
      };
    });

    refreshData(updatedList);
  };

  // Toggle Account Freeze
  const handleToggleFreeze = (memberId: string) => {
    const updatedList = teamMembers.map(m => {
      if (m.id === memberId) {
        const nextStatus = m.status === 'Frozen' ? 'Active' : 'Frozen';
        return { ...m, status: nextStatus as any };
      }
      return m;
    });

    refreshData(updatedList);
  };

  // Update Bonus Config Percentage
  const handleUpdateConfigPercentage = (level: number, newPct: number) => {
    const updated = levelConfigs.map(cfg => {
      if (cfg.level === level) {
        const exampleBonus = Math.round((STANDARD_MLM_PLOT_VALUE * newPct) / 100);
        return { ...cfg, bonusPercentage: newPct, exampleBonusForStandardPlot: exampleBonus };
      }
      return cfg;
    });
    setLevelConfigs(updated);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = "Member_ID,Name,Phone,Role,Sponsor_ID,Designation,Level,Team_Size,Sales_Volume_INR,Available_Bonus_INR,Total_Earned_INR,Status\n";
    const rows = teamMembers.map(m =>
      `${m.id},"${m.name}",${m.phone},${m.role},${m.sponsorId || 'None'},${m.currentDesignation},Level ${m.currentLevel},${m.teamSize},${m.salesMetrics.totalTeamSalesVolume},${m.wallet.availableBonus},${m.wallet.totalBonusEarned},${m.status}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VigyaPaurush_MultiLevelBonus_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Filtered Roster
  const filteredMembers = teamMembers.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: GenealogyTreeNode, depth = 0) => {
    const isExpanded = expandedNodes[node.id] ?? false;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="relative pl-4 sm:pl-6 my-2 border-l-2 border-amber-500/30">
        <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/60 transition-all rounded-xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {hasChildren && (
              <button
                onClick={() => toggleNodeExpand(node.id)}
                className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 p-1.5 rounded-lg transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{node.name}</span>
                <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  {node.id}
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {node.designation} (L{node.currentLevel})
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                <span>Role: <strong className="text-slate-200">{node.role}</strong></span>
                <span>Mobile: <strong className="text-slate-200">{node.phone}</strong></span>
                <span>Sponsor: <strong className="text-amber-300">{node.sponsorId || 'Top Master'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Team Size</span>
              <span className="font-black text-amber-300">{node.totalTeamMembers} Members</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Team Volume</span>
              <span className="font-black text-emerald-400">{formatINR(node.teamSalesVolume)}</span>
            </div>

            <button
              onClick={() => {
                const full = teamMembers.find(m => m.id === node.id);
                if (full) setSelectedMember(full);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-700"
            >
              Inspect
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-2 sm:ml-4 mt-2 space-y-2">
            {node.children!.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const treeRoots = buildGenealogyTree(teamMembers);

  return (
    <div className="space-y-8 text-slate-100">
      {/* Title Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-amber-500/40 p-6 sm:p-8 rounded-2xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Vigya Paurush Team Building Bonus Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-100">
            Multi-Level Bonus & Team Building Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            9-Level Downline Performance Hierarchy. Complete Genealogy Tree, Level Achievements & Bonus Wallets.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase px-5 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Register Team Sponsor
          </button>

          <button
            onClick={() => setShowRecordSaleModal(true)}
            className="bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 shadow"
          >
            <DollarSign className="w-4 h-4" />
            Record Downline Sale
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs px-3.5 py-3 rounded-xl flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mandatory Multi-Level Business Rules Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500/60 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
              मल्टी-लेवल बोनस कटौती एवं पात्रता नियम (Mandatory Bonus Audit Policy)
            </h3>
            <p className="text-xs sm:text-sm font-bold text-amber-100 leading-relaxed">
              "{MANDATORY_MLM_DEDUCTION_RULE_HINDI}"
            </p>
            <p className="text-xs font-medium text-amber-300/80">
              "{MANDATORY_MLM_QUALIFICATION_RULE_HINDI}"
            </p>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Members</span>
          <span className="text-xl font-black text-white">{summary.totalTeamMembers}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Active Team</span>
          <span className="text-xl font-black text-emerald-400">{summary.activeTeamMembers}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Team Sales Vol</span>
          <span className="text-lg font-black text-amber-300">{formatINR(summary.totalTeamSalesVolume)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Plots Sold</span>
          <span className="text-xl font-black text-amber-400">{summary.totalPlotsSold}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Bonus Earned</span>
          <span className="text-lg font-black text-amber-200">{formatINR(summary.totalBonusEarned)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Paid Bonus</span>
          <span className="text-lg font-black text-emerald-400">{formatINR(summary.totalBonusPaid)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Available Bonus</span>
          <span className="text-lg font-black text-amber-400">{formatINR(summary.totalBonusPending)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Pending Payouts</span>
          <span className="text-lg font-black text-rose-400">{formatINR(summary.pendingWithdrawalsAmount)}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('tree')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'tree'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <GitMerge className="w-4 h-4" />
          Genealogy Tree
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'roster'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Team Members Directory ({teamMembers.length})
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'dashboard'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Team Building Dashboard
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'wallet'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Bonus Payout Queue ({summary.pendingWithdrawalsCount})
        </button>

        <button
          onClick={() => setActiveTab('leaderboards')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'leaderboards'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          Top Performers Leaderboards
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'config'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          9-Level Rule Config
        </button>
      </div>

      {/* TAB 1: GENEALOGY TREE */}
      {activeTab === 'tree' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-amber-400" />
                MLM Genealogy Structure & Sponsor Hierarchy
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Expand or collapse nodes to inspect downline teams, designations, and sales volumes.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setTreeMode('unilevel')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  treeMode === 'unilevel'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Unilevel View
              </button>
              <button
                onClick={() => setTreeMode('binary')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  treeMode === 'binary'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Binary Tree View
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {treeRoots.map(rootNode => renderTreeNode(rootNode))}
          </div>
        </div>
      )}

      {/* TAB 2: ROSTER */}
      {activeTab === 'roster' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Name, Mobile, or Member ID..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-bold">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="All">All Roles</option>
                <option value="Customer">Customer</option>
                <option value="Agent">Agent</option>
                <option value="Investor">Investor</option>
                <option value="RiskFreeInvestor">Free Plot Scheme</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700 font-bold uppercase">
                  <th className="p-3">Member ID</th>
                  <th className="p-3">Name & Role</th>
                  <th className="p-3">Sponsor Upline</th>
                  <th className="p-3">Level & Designation</th>
                  <th className="p-3">Team Size</th>
                  <th className="p-3">Team Volume</th>
                  <th className="p-3">Available Bonus</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-amber-300">{m.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{m.name}</div>
                      <div className="text-[10px] text-slate-400">{m.phone} ({m.role})</div>
                    </td>
                    <td className="p-3 text-slate-300 font-medium">
                      {m.sponsorName ? `${m.sponsorName} (${m.sponsorId})` : 'Top Master'}
                    </td>
                    <td className="p-3">
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        Level {m.currentLevel} - {m.currentDesignation}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{m.teamSize} Members</td>
                    <td className="p-3 font-bold text-emerald-400">{formatINR(m.salesMetrics.totalTeamSalesVolume)}</td>
                    <td className="p-3 font-bold text-amber-300">{formatINR(m.wallet.availableBonus)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedMember(m)}
                        className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[10px] px-2.5 py-1.5 rounded-lg border border-slate-700"
                      >
                        Inspect
                      </button>

                      <button
                        onClick={() => handleToggleFreeze(m.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          m.status === 'Frozen'
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                        }`}
                      >
                        {m.status === 'Frozen' ? 'Unfreeze' : 'Freeze'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TEAM DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Level Achievement */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-black text-amber-300 text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Level Achievement Slabs
              </h3>
              <div className="space-y-3">
                {levelConfigs.map((cfg) => (
                  <div key={cfg.level} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-amber-400">Level {cfg.level} - {cfg.designation}</span>
                      <p className="text-[10px] text-slate-400">{cfg.qualificationRule}</p>
                    </div>
                    <span className="bg-amber-500/20 text-amber-300 font-black text-xs px-2.5 py-1 rounded-lg border border-amber-500/30">
                      {cfg.bonusPercentage}% Bonus
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Volume breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 md:col-span-2">
              <h3 className="font-black text-white text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Team Sales Volume Metrics
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Daily Sales Volume</span>
                  <span className="text-lg font-black text-amber-300">{formatINR(3600000)}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Weekly Sales Volume</span>
                  <span className="text-lg font-black text-amber-300">{formatINR(18000000)}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Monthly Sales Volume</span>
                  <span className="text-lg font-black text-emerald-400">{formatINR(54000000)}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Quarterly Sales Volume</span>
                  <span className="text-lg font-black text-emerald-400">{formatINR(162000000)}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Annual Sales Volume</span>
                  <span className="text-lg font-black text-amber-200">{formatINR(486000000)}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Total System Volume</span>
                  <span className="text-lg font-black text-amber-400">{formatINR(summary.totalTeamSalesVolume)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BONUS WALLET & PAYOUT QUEUE */}
      {activeTab === 'wallet' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <h2 className="text-xl font-black text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              Bonus Wallet Payout Requests Queue
            </span>
            <span className="text-xs text-amber-300 font-mono">
              Admin Approval Required for all Withdrawals
            </span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700 font-bold uppercase">
                  <th className="p-3">Request ID</th>
                  <th className="p-3">Member Name</th>
                  <th className="p-3">Request Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Account Details</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {teamMembers
                  .flatMap(m => m.withdrawalHistory.map(w => ({ ...w, memberId: m.id })))
                  .map((wd) => (
                    <tr key={wd.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-amber-300">{wd.id}</td>
                      <td className="p-3 font-bold text-white">{wd.memberName}</td>
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
                            onClick={() => handleApprovePayout(wd.memberId, wd.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] px-3 py-1.5 rounded-lg"
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

      {/* TAB 5: LEADERBOARDS */}
      {activeTab === 'leaderboards' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <h2 className="text-xl font-black text-amber-300 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            Top Performers & Designation Leaderboards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Team Builders */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm uppercase text-amber-400">Top 10 Team Builders</h3>
              <div className="space-y-2">
                {teamMembers
                  .sort((a, b) => b.teamSize - a.teamSize)
                  .slice(0, 10)
                  .map((m, idx) => (
                    <div key={m.id} className="flex items-center justify-between text-xs p-2 bg-slate-900 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-400 w-5">#{idx + 1}</span>
                        <span className="font-bold text-white">{m.name}</span>
                        <span className="text-[10px] text-slate-400">({m.currentDesignation})</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">{m.teamSize} Members</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Bonus Earners */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm uppercase text-amber-400">Top Bonus Earners</h3>
              <div className="space-y-2">
                {teamMembers
                  .sort((a, b) => b.wallet.totalBonusEarned - a.wallet.totalBonusEarned)
                  .slice(0, 10)
                  .map((m, idx) => (
                    <div key={m.id} className="flex items-center justify-between text-xs p-2 bg-slate-900 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-400 w-5">#{idx + 1}</span>
                        <span className="font-bold text-white">{m.name}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-300">{formatINR(m.wallet.totalBonusEarned)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: 9-LEVEL CONFIG */}
      {activeTab === 'config' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <h2 className="text-xl font-black text-white flex items-center justify-between">
            <span>9-Level Multi-Level Bonus Rules & Percentage Configuration</span>
            <button
              onClick={() => alert('Bonus percentage rule parameters saved!')}
              className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold"
            >
              Save Parameters
            </button>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {levelConfigs.map((cfg) => (
              <div key={cfg.level} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-400 text-sm">Level {cfg.level}: {cfg.designation}</span>
                  <span className="text-[10px] text-slate-400">Req: {cfg.requiredPlotsSold} Plots</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold block">Bonus Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cfg.bonusPercentage}
                    onChange={(e) => handleUpdateConfigPercentage(cfg.level, parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-amber-300"
                  />
                </div>

                <div className="text-[10px] text-slate-400">
                  Example Bonus on ₹9,00,000 Plot:{' '}
                  <strong className="text-emerald-400">{formatINR(cfg.exampleBonusForStandardPlot)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-lg text-amber-300">Register New Team Sponsor</h3>
              <button onClick={() => setShowAddMemberModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Member Full Name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="tel"
                required
                placeholder="Mobile Number"
                value={newMemberPhone}
                onChange={(e) => setNewMemberPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold block">Select Sponsor Upline</label>
                <select
                  value={newSponsorId}
                  onChange={(e) => setNewSponsorId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                >
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id}) - {m.currentDesignation}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 text-slate-950 font-black text-xs uppercase py-3 rounded-xl shadow-lg"
              >
                Register & Bind Downline
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Downline Sale Modal */}
      {showRecordSaleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-lg text-amber-300">Record Downline Sale & Calculate Bonus</h3>
              <button onClick={() => setShowRecordSaleModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleRecordDownlineSale} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold block">Select Downline Selling Member</label>
                <select
                  value={saleDownlineId}
                  onChange={(e) => setSaleDownlineId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="">-- Choose Downline Member --</option>
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id}) - Sponsor: {m.sponsorName || 'None'}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                required
                placeholder="Plot Number (e.g. C-204)"
                value={salePlotNo}
                onChange={(e) => setSalePlotNo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold block">Plot Sale Value (INR)</label>
                <input
                  type="number"
                  value={saleValue}
                  onChange={(e) => setSaleValue(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-500/40 text-[10px] text-amber-200">
                "{MANDATORY_MLM_DEDUCTION_RULE_HINDI}"
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 text-slate-950 font-black text-xs uppercase py-3 rounded-xl shadow-lg"
              >
                Process Sale & Credit Upline Bonus
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Member Drawer / Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 max-w-2xl w-full text-white shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-xl text-amber-300">{selectedMember.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedMember.id} • {selectedMember.role}</p>
              </div>
              <button onClick={() => setSelectedMember(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Designation</span>
                <span className="font-bold text-amber-300">Level {selectedMember.currentLevel} - {selectedMember.currentDesignation}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Team Size</span>
                <span className="font-bold text-white">{selectedMember.teamSize} Members</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Available Bonus</span>
                <span className="font-bold text-emerald-400">{formatINR(selectedMember.wallet.availableBonus)}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Total Earned</span>
                <span className="font-bold text-amber-200">{formatINR(selectedMember.wallet.totalBonusEarned)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase text-slate-300">Bonus Ledger History</h4>
              <div className="space-y-2">
                {selectedMember.bonusLedger.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No bonus transactions recorded yet.</p>
                ) : (
                  selectedMember.bonusLedger.map(tx => (
                    <div key={tx.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white">{tx.auditNotes}</div>
                        <div className="text-[10px] text-slate-400">{tx.date} • Plot: {tx.plotNo}</div>
                      </div>
                      <span className="font-bold font-mono text-emerald-400">+{formatINR(tx.netBonusCredited)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
