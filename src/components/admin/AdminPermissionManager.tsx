import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Key,
  Clock,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  Download,
  Building2,
  Activity,
  ChevronRight,
  ChevronDown,
  Layers,
  Database,
  Smartphone,
  Globe,
  Settings,
  X,
  Award,
  TrendingUp,
  Grid,
  Wallet,
  BarChart3,
  Image as ImageIcon,
  Bell,
  Check,
  Zap,
  Sliders,
  Share2,
  Cpu,
  Server
} from 'lucide-react';
import {
  ManagerRole,
  ManagerStatus,
  PermissionCategoryKey,
  PermissionManager,
  PermissionAuditLog,
  RoleTemplate
} from '../../types/permissions';
import {
  PERMISSION_CATEGORIES_CATALOG,
  ALL_19_ROLE_TEMPLATES,
  SEED_PERMISSION_MANAGERS,
  SEED_AUDIT_LOGS
} from '../../data/permissionManagerData';
import jsPDF from 'jspdf';

interface AdminPermissionManagerProps {
  isDarkMode?: boolean;
}

export const AdminPermissionManager: React.FC<AdminPermissionManagerProps> = ({
  isDarkMode = true
}) => {
  // Master State
  const [managers, setManagers] = useState<PermissionManager[]>(SEED_PERMISSION_MANAGERS);
  const [auditLogs, setAuditLogs] = useState<PermissionAuditLog[]>(SEED_AUDIT_LOGS);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>(ALL_19_ROLE_TEMPLATES);

  // Active View Tabs: 'directory' | 'matrix' | 'templates' | 'audit'
  const [activeTab, setActiveTab] = useState<'directory' | 'matrix' | 'templates' | 'audit'>('directory');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  // Modals State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Selected Manager for Detail / Edit Permission Modal
  const [editingManager, setEditingManager] = useState<PermissionManager | null>(null);
  const [securityModalManager, setSecurityModalManager] = useState<PermissionManager | null>(null);
  const [selectedManagerAudit, setSelectedManagerAudit] = useState<PermissionManager | null>(null);
  const [isSystemSpecOpen, setIsSystemSpecOpen] = useState(false);

  // Wizard Form State
  const [wizardData, setWizardData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Sales & Distribution',
    role: 'Sales Manager' as ManagerRole,
    permissions: { ...ALL_19_ROLE_TEMPLATES[3].recommendedPermissions },
    is2FAEnabled: true,
    sessionTimeoutMinutes: 30,
    allowedIpRanges: '103.21.124.0/24',
    expiryDate: '',
    sendInviteSms: true
  });

  // KPI Calculations
  const totalManagers = managers.length;
  const activeCount = managers.filter(m => m.status === 'Active').length;
  const inactiveCount = managers.filter(m => m.status === 'Inactive').length;
  const pendingCount = managers.filter(m => m.status === 'Pending Approval').length;
  const suspendedCount = managers.filter(m => m.status === 'Suspended').length;
  const twoFaSecuredCount = managers.filter(m => m.is2FAEnabled).length;

  // Filtered Managers List
  const filteredManagers = managers.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.managerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDeptFilter === 'All' || m.department === selectedDeptFilter;
    const matchesRole = selectedRoleFilter === 'All' || m.role === selectedRoleFilter;
    const matchesStatus = selectedStatusFilter === 'All' || m.status === selectedStatusFilter;

    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  // Unique Departments
  const departmentsList = Array.from(new Set(roleTemplates.map(r => r.department)));

  // Helper: Count total active permissions for a manager
  const getActivePermissionCount = (perms: Record<PermissionCategoryKey, string[]>) => {
    return Object.values(perms).reduce((sum, list) => sum + (list ? list.length : 0), 0);
  };

  // Helper: Handle toggling a specific permission key for a manager being edited
  const handleTogglePermissionKey = (
    managerId: string,
    category: PermissionCategoryKey,
    key: string
  ) => {
    setManagers(prev =>
      prev.map(m => {
        if (m.id !== managerId) return m;

        const currentCategoryKeys = m.permissions[category] || [];
        const isPresent = currentCategoryKeys.includes(key);
        const updatedCategoryKeys = isPresent
          ? currentCategoryKeys.filter(k => k !== key)
          : [...currentCategoryKeys, key];

        const updatedPermissions = {
          ...m.permissions,
          [category]: updatedCategoryKeys
        };

        return {
          ...m,
          permissions: updatedPermissions
        };
      })
    );

    // If currently editing manager in modal
    if (editingManager && editingManager.id === managerId) {
      const currentCategoryKeys = editingManager.permissions[category] || [];
      const isPresent = currentCategoryKeys.includes(key);
      const updatedCategoryKeys = isPresent
        ? currentCategoryKeys.filter(k => k !== key)
        : [...currentCategoryKeys, key];

      setEditingManager({
        ...editingManager,
        permissions: {
          ...editingManager.permissions,
          [category]: updatedCategoryKeys
        }
      });
    }

    // Add Audit Log
    const managerObj = managers.find(m => m.id === managerId);
    if (managerObj) {
      const newLog: PermissionAuditLog = {
        id: `LOG-${Math.floor(8000 + Math.random() * 1000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        assignedBy: 'Prabhat Gautam (Super Admin)',
        assignedToName: managerObj.name,
        assignedToRole: managerObj.role,
        actionType: 'Modify Permission',
        category: category,
        changesDescription: `Toggled permission '${key}' in category '${category}' by Super Admin.`,
        ipAddress: '103.21.124.89',
        deviceInfo: 'Super Admin Control Panel',
        status: 'Success'
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
  };

  // Helper: Toggle Status (Activate, Suspend, Inactive)
  const handleStatusChange = (managerId: string, newStatus: ManagerStatus) => {
    setManagers(prev =>
      prev.map(m => (m.id === managerId ? { ...m, status: newStatus } : m))
    );

    const mObj = managers.find(m => m.id === managerId);
    if (mObj) {
      const newLog: PermissionAuditLog = {
        id: `LOG-${Math.floor(8000 + Math.random() * 1000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        assignedBy: 'Prabhat Gautam (Super Admin)',
        assignedToName: mObj.name,
        assignedToRole: mObj.role,
        actionType: newStatus === 'Suspended' ? 'Suspend Manager' : 'Reactivate Manager',
        category: 'Status Lifecycle',
        changesDescription: `Super Admin changed manager status to '${newStatus}'.`,
        ipAddress: '103.21.124.89',
        deviceInfo: 'Super Admin Control Panel',
        status: newStatus === 'Suspended' ? 'Warning' : 'Success'
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
  };

  // Helper: Delete Manager
  const handleDeleteManager = (managerId: string) => {
    const target = managers.find(m => m.id === managerId);
    if (!target) return;
    if (target.role === 'Super Admin') {
      alert('Action Restricted: Super Admin accounts cannot be deleted!');
      return;
    }

    if (window.confirm(`SUPER ADMIN SECURITY CONFIRMATION:\nAre you sure you want to permanently delete Manager '${target.name}' (${target.managerId})?\nAll permissions and access keys will be revoked immediately.`)) {
      setManagers(prev => prev.filter(m => m.id !== managerId));

      const newLog: PermissionAuditLog = {
        id: `LOG-${Math.floor(8000 + Math.random() * 1000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        assignedBy: 'Prabhat Gautam (Super Admin)',
        assignedToName: target.name,
        assignedToRole: target.role,
        actionType: 'Delete Manager',
        category: 'Account Purge',
        changesDescription: `Super Admin permanently deleted manager profile ${target.managerId}.`,
        ipAddress: '103.21.124.89',
        deviceInfo: 'Super Admin Control Panel',
        status: 'Revoked'
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
  };

  // Wizard Step Handler
  const handleSelectRoleTemplateInWizard = (tpl: RoleTemplate) => {
    setWizardData({
      ...wizardData,
      role: tpl.role,
      department: tpl.department,
      permissions: { ...tpl.recommendedPermissions }
    });
  };

  const handleFinishWizard = () => {
    const newId = `PM-${Math.floor(100 + Math.random() * 900)}`;
    const newManagerId = `VPM-PM-2026-0${managers.length + 1}`;

    const newManagerObj: PermissionManager = {
      id: newId,
      managerId: newManagerId,
      name: wizardData.name || 'New Manager',
      email: wizardData.email || 'manager@vpmp.in',
      phone: wizardData.phone || '+91 9800000000',
      role: wizardData.role,
      department: wizardData.department,
      status: 'Active',
      permissions: wizardData.permissions,
      lastLogin: 'Never',
      createdBy: 'Prabhat Gautam (Super Admin)',
      createdAt: new Date().toISOString().split('T')[0],
      is2FAEnabled: wizardData.is2FAEnabled,
      sessionTimeoutMinutes: wizardData.sessionTimeoutMinutes,
      allowedIpRanges: wizardData.allowedIpRanges ? wizardData.allowedIpRanges.split(',').map(s => s.trim()) : [],
      expiryDate: wizardData.expiryDate || undefined
    };

    setManagers(prev => [newManagerObj, ...prev]);

    // Audit Log
    const newLog: PermissionAuditLog = {
      id: `LOG-${Math.floor(8000 + Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      assignedBy: 'Prabhat Gautam (Super Admin)',
      assignedToName: newManagerObj.name,
      assignedToRole: newManagerObj.role,
      actionType: 'Create Manager',
      category: 'RBAC Onboarding',
      changesDescription: `Super Admin created Permission Manager ${newManagerId} with role ${newManagerObj.role} & 2FA = ${wizardData.is2FAEnabled}`,
      ipAddress: '103.21.124.89',
      deviceInfo: 'Super Admin Control Panel',
      status: 'Success'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    setIsWizardOpen(false);
    setWizardStep(1);
    alert(`PERMISSION MANAGER CREATED SUCCESSFUL!\n\nManager ID: ${newManagerId}\nName: ${newManagerObj.name}\nRole: ${newManagerObj.role}\nDepartment: ${newManagerObj.department}\n\nLogin credentials and 2FA setup instructions have been dispatched.`);
  };

  // Helper: Export Audit Log PDF
  const handleExportAuditPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('VIGYA PAURUSH MILESTONE PRIVATE LIMITED', 15, 20);
    doc.setFontSize(12);
    doc.text('Official Security & Permission Audit Log Statement', 15, 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Super Admin Governance Authority: Prabhat Gautam`, 15, 36);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 15, 42);

    let y = 54;
    doc.setFont('helvetica', 'bold');
    doc.text('Date / Time', 15, y);
    doc.text('Assigned By', 55, y);
    doc.text('Manager / Role', 105, y);
    doc.text('Action Type', 155, y);

    y += 6;
    doc.setFont('helvetica', 'normal');

    auditLogs.slice(0, 20).forEach(log => {
      doc.text(log.timestamp.substring(0, 16), 15, y);
      doc.text(log.assignedBy.substring(0, 22), 55, y);
      doc.text(`${log.assignedToName} (${log.assignedToRole.substring(0, 12)})`, 105, y);
      doc.text(log.actionType, 155, y);
      y += 8;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save('VPM_Permission_Audit_Logs.pdf');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Super Admin Governance Authority */}
      <div className="bg-gradient-to-r from-amber-500/20 via-indigo-950/80 to-slate-900 border-2 border-amber-500/40 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/30 text-amber-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/40 uppercase tracking-widest">
                SUPER ADMIN AUTHORITY ENFORCED
              </span>
              <span className="text-xs text-slate-400 font-mono">RBAC v4.2</span>
            </div>
            <h1 className="text-xl font-black text-white mt-1">
              Enterprise Permission Manager System
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Only <strong className="text-amber-400">Prabhat Gautam (VPM Master Admin)</strong> has legal authority to create, assign, modify, suspend, or revoke Permission Managers & granular privileges.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsSystemSpecOpen(true)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span>DB & API Specs</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsWizardOpen(true);
              setWizardStep(1);
            }}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Permission Manager</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Managers</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-white">{totalManagers}</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Across 19 Departments</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">Active Managers</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-400">{activeCount}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-emerald-300/70 block mt-1">Fully Operational</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Inactive Managers</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-300">{inactiveCount}</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Dormant Credentials</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">Pending Approval</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-400">{pendingCount}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[10px] text-amber-300/70 block mt-1">Awaiting Super Admin</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block">Suspended</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-rose-400">{suspendedCount}</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-[10px] text-rose-300/70 block mt-1">Revoked Tokens</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block">2FA Enforced</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-cyan-400">{twoFaSecuredCount}/{totalManagers}</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-[10px] text-cyan-300/70 block mt-1">MFA Security Rate</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-800 flex items-center justify-between gap-4 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'directory'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Managers Directory ({filteredManagers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Interactive Permission Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'templates'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>19 Role Templates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Trail & Security Logs ({auditLogs.length})</span>
          </button>
        </div>

        {activeTab === 'audit' && (
          <button
            type="button"
            onClick={handleExportAuditPDF}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export PDF Audit</span>
          </button>
        )}
      </div>

      {/* TAB 1: MANAGERS DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, ID, email or dept..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Department Filter */}
              <select
                value={selectedDeptFilter}
                onChange={e => setSelectedDeptFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Departments</option>
                {departmentsList.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>

              {/* Role Filter */}
              <select
                value={selectedRoleFilter}
                onChange={e => setSelectedRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="All">All 19 Roles</option>
                {ALL_19_ROLE_TEMPLATES.map((r, i) => (
                  <option key={i} value={r.role}>{r.role}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Managers Data Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="p-3.5">Manager Profile & ID</th>
                    <th className="p-3.5">Assigned Role & Dept</th>
                    <th className="p-3.5">Active Granular Perms</th>
                    <th className="p-3.5">Security & 2FA</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Super Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
                  {filteredManagers.map(mgr => {
                    const activePermCount = getActivePermissionCount(mgr.permissions);
                    return (
                      <tr key={mgr.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-indigo-900 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-xs shrink-0 shadow-md">
                              {mgr.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-extrabold text-white flex items-center gap-1.5">
                                {mgr.name}
                                {mgr.role === 'Super Admin' && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-amber-400/90">{mgr.managerId}</div>
                              <div className="text-[10px] text-slate-400">{mgr.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-extrabold text-slate-200 block">{mgr.role}</span>
                          <span className="text-[10px] text-slate-400 block">{mgr.department}</span>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 font-extrabold text-xs border border-amber-500/30">
                              {activePermCount} Grants
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingManager(mgr)}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                            >
                              Inspect Matrix
                            </button>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                              mgr.is2FAEnabled
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              <Lock className="w-3 h-3" />
                              {mgr.is2FAEnabled ? '2FA Enabled' : '2FA Off'}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              Timeout: {mgr.sessionTimeoutMinutes}m
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            mgr.status === 'Active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : mgr.status === 'Pending Approval'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : mgr.status === 'Suspended'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-slate-800 text-slate-400'
                          }`}>
                            {mgr.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingManager(mgr)}
                              title="Edit Permissions"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setSecurityModalManager(mgr)}
                              title="Security & 2FA Settings"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors cursor-pointer"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>

                            {mgr.status === 'Suspended' ? (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(mgr.id, 'Active')}
                                title="Reactivate Manager"
                                className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30 transition-colors cursor-pointer"
                              >
                                Reactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(mgr.id, 'Suspended')}
                                title="Suspend Manager"
                                className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-extrabold text-[10px] border border-rose-500/30 transition-colors cursor-pointer"
                              >
                                Suspend
                              </button>
                            )}

                            {mgr.role !== 'Super Admin' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteManager(mgr.id)}
                                title="Delete Manager"
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE PERMISSION MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Grid className="w-4 h-4 text-amber-400" />
                Global Permission Grid & Live Override Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Super Admin can toggle individual category permissions across active managers in real-time.
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              14 Categories x 50+ Privileges
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-950/90 border-b border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="p-3.5 sticky left-0 bg-slate-950 z-10 w-56">Manager Profile</th>
                    {PERMISSION_CATEGORIES_CATALOG.map(cat => (
                      <th key={cat.category} className="p-3.5 text-center min-w-[110px] border-l border-slate-800/60">
                        <span className="text-amber-400 block">{cat.category.replace(' Management', '')}</span>
                        <span className="text-[9px] text-slate-500 font-normal">{cat.permissions.length} Keys</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {managers.map(mgr => (
                    <tr key={mgr.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 sticky left-0 bg-slate-900/95 z-10 border-r border-slate-800">
                        <div className="font-black text-white">{mgr.name}</div>
                        <div className="text-[10px] text-amber-400 font-mono">{mgr.role}</div>
                      </td>

                      {PERMISSION_CATEGORIES_CATALOG.map(cat => {
                        const grantedKeys = mgr.permissions[cat.category] || [];
                        const isFullyGranted = grantedKeys.length === cat.permissions.length;
                        const isPartiallyGranted = grantedKeys.length > 0 && !isFullyGranted;

                        return (
                          <td key={cat.category} className="p-3.5 text-center border-l border-slate-800/40">
                            <button
                              type="button"
                              onClick={() => {
                                // Toggle all in category for this manager
                                const nextKeys = isFullyGranted ? [] : cat.permissions.map(p => p.key);
                                setManagers(prev =>
                                  prev.map(m =>
                                    m.id === mgr.id
                                      ? {
                                          ...m,
                                          permissions: {
                                            ...m.permissions,
                                            [cat.category]: nextKeys
                                          }
                                        }
                                      : m
                                  )
                                );
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                                isFullyGranted
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                                  : isPartiallyGranted
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-slate-950 text-slate-600 border border-slate-800 hover:text-slate-400'
                              }`}
                            >
                              {grantedKeys.length}/{cat.permissions.length}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 19 ROLE TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                19 Complete Manager Role Templates
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Preset default permission configurations for all organizational branches.
              </p>
            </div>
            <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">
              Standardized Blueprint
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roleTemplates.map(tpl => {
              const permCount = getActivePermissionCount(tpl.recommendedPermissions);
              return (
                <div
                  key={tpl.id}
                  className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full text-slate-950 bg-gradient-to-r ${tpl.badgeColor}`}>
                        {tpl.department}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{tpl.id}</span>
                    </div>

                    <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                      {tpl.role}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      {tpl.description}
                    </p>

                    <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Default Privileges:</span>
                      <span className="font-extrabold text-amber-400">{permCount} Grants</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsWizardOpen(true);
                        setWizardStep(3);
                        handleSelectRoleTemplateInWizard(tpl);
                      }}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Assign Profile via Template</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL & LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Immutable RBAC Audit Trail & Security Event Ledger
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every permission grant, revocation, status update, and 2FA policy change is cryptographically logged.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportAuditPDF}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export PDF Statement</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/90 border-b border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="p-3.5">Log ID & Timestamp</th>
                    <th className="p-3.5">Assigned By (Super Admin)</th>
                    <th className="p-3.5">Target Manager / Role</th>
                    <th className="p-3.5">Action & Category</th>
                    <th className="p-3.5">Changes Summary</th>
                    <th className="p-3.5">IP Address & Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-amber-400 block text-[11px]">{log.id}</span>
                        <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-extrabold text-slate-200 block">{log.assignedBy}</span>
                        <span className="text-[10px] text-emerald-400">Root Governance</span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-extrabold text-white block">{log.assignedToName}</span>
                        <span className="text-[10px] text-slate-400">{log.assignedToRole}</span>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          log.status === 'Success'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : log.status === 'Warning'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {log.actionType}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{log.category}</span>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <p className="text-slate-300 text-xs leading-relaxed truncate" title={log.changesDescription}>
                          {log.changesDescription}
                        </p>
                      </td>

                      <td className="p-3.5 font-mono text-[10px] text-slate-400">
                        <div>{log.ipAddress}</div>
                        <div className="text-[9px] text-slate-500 truncate max-w-[120px]">{log.deviceInfo}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* GUIDED 8-STEP MANAGER CREATION WIZARD MODAL */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-0 my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Super Admin Workflow: Create Permission Manager
                  </h3>
                  <p className="text-xs text-amber-400/90 font-mono">
                    Step {wizardStep} of 6 — Guided Role Assignment Engine
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Header Bar */}
            <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold">
              {[
                '1. Profile Details',
                '2. Department',
                '3. Role Template',
                '4. Granular Perms',
                '5. Security & 2FA',
                '6. Confirm & Issue'
              ].map((stepLabel, idx) => {
                const stepNum = idx + 1;
                const isActive = wizardStep === stepNum;
                const isPassed = wizardStep > stepNum;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setWizardStep(stepNum)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : isPassed
                          ? 'bg-slate-800 text-emerald-400'
                          : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {isPassed && <Check className="w-3.5 h-3.5" />}
                    <span>{stepLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Wizard Body Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* STEP 1: Profile Details */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                    Step 1: Manager Personal & Contact Profile
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Full Legal Name *</label>
                      <input
                        type="text"
                        value={wizardData.name}
                        onChange={e => setWizardData({ ...wizardData, name: e.target.value })}
                        placeholder="e.g. Vikramaditya Singh"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Corporate Email Address *</label>
                      <input
                        type="email"
                        value={wizardData.email}
                        onChange={e => setWizardData({ ...wizardData, email: e.target.value })}
                        placeholder="e.g. vikram.singh@vpmp.in"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Mobile Phone Number *</label>
                      <input
                        type="text"
                        value={wizardData.phone}
                        onChange={e => setWizardData({ ...wizardData, phone: e.target.value })}
                        placeholder="e.g. +91 9839123456"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Assigned Department</label>
                      <select
                        value={wizardData.department}
                        onChange={e => setWizardData({ ...wizardData, department: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        {departmentsList.map((d, i) => (
                          <option key={i} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Department Selection */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                    Step 2: Select Operational Department Branch
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {departmentsList.map((dept, idx) => {
                      const isSelected = wizardData.department === dept;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setWizardData({ ...wizardData, department: dept })}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Building2 className={`w-5 h-5 mb-2 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                          <div className="font-extrabold text-xs">{dept}</div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Corporate Division</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Role Template Selection */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                    Step 3: Select from 19 Standard Manager Role Templates
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                    {roleTemplates.map(tpl => {
                      const isSelected = wizardData.role === tpl.role;
                      return (
                        <div
                          key={tpl.id}
                          onClick={() => handleSelectRoleTemplateInWizard(tpl)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg ring-2 ring-amber-500/20'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-amber-300">{tpl.role}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{tpl.department}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{tpl.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: Granular Customization */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                    Step 4: Granular Privilege Customization ({getActivePermissionCount(wizardData.permissions)} Active Grants)
                  </h4>

                  <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                    {PERMISSION_CATEGORIES_CATALOG.map(cat => {
                      const currentCategoryKeys = wizardData.permissions[cat.category] || [];
                      return (
                        <div key={cat.category} className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-extrabold text-xs text-white">{cat.category}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const allKeys = cat.permissions.map(p => p.key);
                                const isAll = currentCategoryKeys.length === allKeys.length;
                                setWizardData({
                                  ...wizardData,
                                  permissions: {
                                    ...wizardData.permissions,
                                    [cat.category]: isAll ? [] : allKeys
                                  }
                                });
                              }}
                              className="text-[10px] font-bold text-amber-400 underline cursor-pointer"
                            >
                              {currentCategoryKeys.length === cat.permissions.length ? 'Clear All' : 'Grant All'}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {cat.permissions.map(perm => {
                              const isChecked = currentCategoryKeys.includes(perm.key);
                              return (
                                <label
                                  key={perm.key}
                                  className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                                    isChecked
                                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                                      : 'bg-slate-900 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      const updatedKeys = isChecked
                                        ? currentCategoryKeys.filter(k => k !== perm.key)
                                        : [...currentCategoryKeys, perm.key];

                                      setWizardData({
                                        ...wizardData,
                                        permissions: {
                                          ...wizardData.permissions,
                                          [cat.category]: updatedKeys
                                        }
                                      });
                                    }}
                                    className="accent-amber-500 w-4 h-4 rounded"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-extrabold text-xs flex items-center gap-1">
                                      <span>{perm.label}</span>
                                      {perm.isHighRisk && (
                                        <span className="text-[9px] font-extrabold text-rose-400 bg-rose-500/20 px-1.5 py-0.2 rounded border border-rose-500/30">
                                          HIGH RISK
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate">{perm.description}</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: Security & 2FA */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                    Step 5: Security Mandates, 2FA & Session Limits
                  </h4>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer">
                      <div>
                        <span className="font-extrabold text-xs text-white block">Mandatory Multi-Factor Authentication (2FA)</span>
                        <span className="text-[10px] text-slate-400">Require TOTP or SMS OTP upon manager portal login</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={wizardData.is2FAEnabled}
                        onChange={e => setWizardData({ ...wizardData, is2FAEnabled: e.target.checked })}
                        className="accent-amber-500 w-5 h-5 rounded"
                      />
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Session Inactivity Timeout (Minutes)</label>
                        <select
                          value={wizardData.sessionTimeoutMinutes}
                          onChange={e => setWizardData({ ...wizardData, sessionTimeoutMinutes: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value={15}>15 Minutes (Strict)</option>
                          <option value={30}>30 Minutes (Standard)</option>
                          <option value={60}>60 Minutes (Extended)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Allowed IP Address Range (CIDR)</label>
                        <input
                          type="text"
                          value={wizardData.allowedIpRanges}
                          onChange={e => setWizardData({ ...wizardData, allowedIpRanges: e.target.value })}
                          placeholder="e.g. 103.21.124.0/24"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Confirm & Issue */}
              {wizardStep === 6 && (
                <div className="space-y-4">
                  <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-2xl flex items-center gap-3 text-emerald-300">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <h5 className="font-extrabold text-xs">Super Admin Verification Complete</h5>
                      <p className="text-[11px] text-emerald-200">
                        Review assignment details below. Clicking 'Confirm & Dispatch' will generate the unique Manager ID & log the transaction in the audit trail.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Name:</span>
                      <strong className="text-white">{wizardData.name || 'N/A'}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Email:</span>
                      <strong className="text-amber-400">{wizardData.email || 'N/A'}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Assigned Role:</span>
                      <strong className="text-white">{wizardData.role}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Department:</span>
                      <strong className="text-white">{wizardData.department}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Total Active Privileges:</span>
                      <strong className="text-emerald-400">{getActivePermissionCount(wizardData.permissions)} Grants</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Governance Authority:</span>
                      <strong className="text-amber-400">Prabhat Gautam (Super Admin)</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between gap-3">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs transition-colors cursor-pointer"
                >
                  Previous Step
                </button>
              ) : <div />}

              {wizardStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md"
                >
                  Continue to Step {wizardStep + 1}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishWizard}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg"
                >
                  Confirm & Dispatch Credentials
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT PERMISSIONS MODAL FOR A SINGLE MANAGER */}
      {editingManager && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-0 my-8">
            <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold block">{editingManager.managerId}</span>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Manage Permissions for {editingManager.name}</span>
                  <span className="text-xs text-slate-400 font-normal">({editingManager.role})</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingManager(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-200">
                Super Admin Notice: Changes apply immediately. Click any privilege toggle to update access level.
              </div>

              {PERMISSION_CATEGORIES_CATALOG.map(cat => {
                const grantedKeys = editingManager.permissions[cat.category] || [];
                return (
                  <div key={cat.category} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <h4 className="font-extrabold text-xs text-white mb-2.5 flex items-center justify-between">
                      <span>{cat.category}</span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        {grantedKeys.length}/{cat.permissions.length} Active
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {cat.permissions.map(perm => {
                        const isGranted = grantedKeys.includes(perm.key);
                        return (
                          <div
                            key={perm.key}
                            onClick={() => handleTogglePermissionKey(editingManager.id, cat.category, perm.key)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isGranted
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-xs flex items-center gap-1.5">
                                <span>{perm.label}</span>
                                {perm.isHighRisk && (
                                  <span className="text-[9px] font-extrabold text-rose-400 bg-rose-500/20 px-1 py-0.2 rounded">
                                    HIGH RISK
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 block">{perm.description}</span>
                            </div>

                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isGranted ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isGranted ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-950 p-4 border-t border-slate-800 text-right">
              <button
                type="button"
                onClick={() => setEditingManager(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all cursor-pointer"
              >
                Done Editing Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY & 2FA MODAL */}
      {securityModalManager && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-sm text-white">
                  Security & 2FA Policy: {securityModalManager.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSecurityModalManager(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Two-Factor Authentication (2FA)</span>
                  <span className="text-[10px] text-slate-400">Enforce TOTP authenticator on login</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !securityModalManager.is2FAEnabled;
                    setManagers(prev => prev.map(m => m.id === securityModalManager.id ? { ...m, is2FAEnabled: nextVal } : m));
                    setSecurityModalManager({ ...securityModalManager, is2FAEnabled: nextVal });
                  }}
                  className={`px-3 py-1 rounded-lg font-black text-xs transition-colors ${
                    securityModalManager.is2FAEnabled
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {securityModalManager.is2FAEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-white block mb-1">Session Inactivity Timeout</span>
                <select
                  value={securityModalManager.sessionTimeoutMinutes}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setManagers(prev => prev.map(m => m.id === securityModalManager.id ? { ...m, sessionTimeoutMinutes: val } : m));
                    setSecurityModalManager({ ...securityModalManager, sessionTimeoutMinutes: val });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                >
                  <option value={15}>15 Minutes (High Security)</option>
                  <option value={30}>30 Minutes (Standard)</option>
                  <option value={60}>60 Minutes (Extended)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setSecurityModalManager(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-extrabold text-xs"
              >
                Close Security Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM ARCHITECTURE & DATABASE SPEC MODAL */}
      {isSystemSpecOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    Permission System Architecture & Database Schema
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    MongoDB Collections + Django REST / Node.js API Endpoints Spec
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSystemSpecOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[65vh] overflow-y-auto text-xs pr-1">
              {/* Database Schema Section */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Server className="w-4 h-4" />
                  1. MongoDB Database Schemas & Collections
                </h4>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2">
                  <p><span className="text-emerald-400 font-bold">Collection 1: Users</span> — Stores master authentication credentials, password hashes, 2FA secrets & user roles.</p>
                  <p><span className="text-emerald-400 font-bold">Collection 2: Roles</span> — 19 role definitions, department mappings & default permission templates.</p>
                  <p><span className="text-emerald-400 font-bold">Collection 3: Permissions</span> — Granular permission catalog with risk levels & category tags.</p>
                  <p><span className="text-emerald-400 font-bold">Collection 4: PermissionManagers</span> — Assigned manager profiles, manager IDs, status & custom permission overrides.</p>
                  <p><span className="text-emerald-400 font-bold">Collection 5: Departments</span> — Organizational hierarchy tree for Prayagraj real estate operations.</p>
                  <p><span className="text-emerald-400 font-bold">Collection 6: AuditLogs</span> — Immutable audit trail capturing Super Admin assignments, IP ranges & devices.</p>
                  <p><span className="text-emerald-400 font-bold">Collection 7: Notifications</span> — Dispatched credentials, SMS alerts & email invitation tokens.</p>
                  <p><span className="text-emerald-400 font-bold">Collection 8: LoginHistory</span> — Device fingerprinting, JWT session validity & MFA logs.</p>
                </div>
              </div>

              {/* API Endpoints */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-indigo-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  2. Backend API Endpoint Architecture (Django REST / Node Express)
                </h4>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 font-mono text-[11px] text-amber-300 space-y-1.5">
                  <div><span className="text-indigo-400">GET /api/v1/permissions/managers/</span> — Fetch all permission managers with filters</div>
                  <div><span className="text-emerald-400">POST /api/v1/permissions/managers/create/</span> — Super Admin creates manager profile</div>
                  <div><span className="text-amber-400">PUT /api/v1/permissions/managers/:id/permissions/</span> — Super Admin updates granular perms</div>
                  <div><span className="text-rose-400">DELETE /api/v1/permissions/managers/:id/</span> — Super Admin revokes & deletes profile</div>
                  <div><span className="text-cyan-400">GET /api/v1/permissions/audit-logs/</span> — Super Admin retrieves audit log stream</div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setIsSystemSpecOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all cursor-pointer"
              >
                Close Architecture Spec
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
