import React, { useState } from 'react';
import {
  Users,
  Award,
  TrendingUp,
  Building2,
  Home,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  DollarSign,
  FileText,
  UserCheck,
  Calendar,
  XCircle,
  Clock,
  Printer,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import {
  PROMOTION_TIERS_HIERARCHY,
  evaluateEmployeePromotionStatus,
  EmployeeRecord,
  PointLedgerEntry,
  HonorariumSlip,
  PromotionTier
} from '../../utils/employeePromotionEngine';
import { formatINR } from '../../utils/calculators';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface AdminEmployeePromotionManagerProps {
  isDarkMode?: boolean;
}

export const AdminEmployeePromotionManager: React.FC<AdminEmployeePromotionManagerProps> = ({ isDarkMode = true }) => {
  // Active Internal View
  const [activeTab, setActiveTab] = useState<'employees' | 'hierarchy' | 'ledger' | 'honorarium' | 'wfh_policy'>('employees');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [wfhFilter, setWfhFilter] = useState<'all' | 'wfh' | 'office'>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected Employee Modal State for Point Editing / Reversal
  const [selectedEmployeeForPoints, setSelectedEmployeeForPoints] = useState<EmployeeRecord | null>(null);
  const [pointCreditModal, setPointCreditModal] = useState<{
    joiningCategory: 'Agent' | 'Customer' | 'Investor' | 'Risk-Free Investor' | 'Point Reversal';
    countInput: number;
    notesInput: string;
  }>({
    joiningCategory: 'Customer',
    countInput: 1,
    notesInput: 'Verified Joining Approved by Admin'
  });

  // Selected Honorarium Slip Modal
  const [activeSlipModal, setActiveSlipModal] = useState<{ employee: EmployeeRecord; calculation: any } | null>(null);

  // Sample Employees Data
  const [employees, setEmployees] = useState<EmployeeRecord[]>([
    {
      id: 'EMP-101',
      name: 'Ramesh Chandra Verma',
      phone: '+91 98391 12345',
      joiningDate: '2025-01-15',
      agentJoinings: 45,
      customerJoinings: 80,
      investorJoinings: 35,
      riskFreeInvestorJoinings: 25, // Total Pts: 45*1 + 80*2 + 35*3 + 25*4 = 45 + 160 + 105 + 100 = 410 Pts (WFH Eligible)
      monthlyHonorariumReceived: 18000,
      pendingHonorarium: 6000,
      honorariumStatus: 'Approved',
      bankAccount: '382901928371',
      ifscCode: 'SBIN0001234',
      kycVerified: true
    },
    {
      id: 'EMP-102',
      name: 'Pooja Srivastava',
      phone: '+91 94152 98765',
      joiningDate: '2024-11-01',
      agentJoinings: 120,
      customerJoinings: 180,
      investorJoinings: 50,
      riskFreeInvestorJoinings: 40, // Total Pts: 120 + 360 + 150 + 160 = 790 Pts (Office Assigned >= 601)
      monthlyHonorariumReceived: 40000,
      pendingHonorarium: 10000,
      honorariumStatus: 'Paid',
      bankAccount: '501002938475',
      ifscCode: 'HDFC0000567',
      kycVerified: true
    },
    {
      id: 'EMP-103',
      name: 'Amit Kumar Pandey',
      phone: '+91 99350 44556',
      joiningDate: '2025-03-10',
      agentJoinings: 15,
      customerJoinings: 20,
      investorJoinings: 10,
      riskFreeInvestorJoinings: 5, // Total Pts: 15 + 40 + 30 + 20 = 105 Pts (WFH Eligible)
      monthlyHonorariumReceived: 9000,
      pendingHonorarium: 4500,
      honorariumStatus: 'Pending',
      bankAccount: '109283746501',
      ifscCode: 'PUNB0109200',
      kycVerified: true
    },
    {
      id: 'EMP-104',
      name: 'Deepak Raj Vishwakarma',
      phone: '+91 98380 77889',
      joiningDate: '2024-06-20',
      agentJoinings: 250,
      customerJoinings: 400,
      investorJoinings: 150,
      riskFreeInvestorJoinings: 100, // Total Pts: 250 + 800 + 450 + 400 = 1900 Pts (Office Assigned)
      monthlyHonorariumReceived: 100000,
      pendingHonorarium: 20000,
      honorariumStatus: 'Approved',
      bankAccount: '918273645012',
      ifscCode: 'ICIC0001092',
      kycVerified: true
    },
    {
      id: 'EMP-105',
      name: 'Sangeeta Maurya',
      phone: '+91 91250 33445',
      joiningDate: '2025-05-01',
      agentJoinings: 5,
      customerJoinings: 7,
      investorJoinings: 2,
      riskFreeInvestorJoinings: 1, // Total Pts: 5 + 14 + 6 + 4 = 29 Pts (3rd Grade Sales)
      monthlyHonorariumReceived: 3000,
      pendingHonorarium: 3000,
      honorariumStatus: 'Processing',
      bankAccount: '409182736451',
      ifscCode: 'BARB0PREYAG',
      kycVerified: true
    }
  ]);

  // Point Ledger Entries
  const [pointLedger, setPointLedger] = useState<PointLedgerEntry[]>([
    {
      id: 'LEDGER-801',
      employeeId: 'EMP-101',
      employeeName: 'Ramesh Chandra Verma',
      category: 'Risk-Free Investor',
      points: 4,
      referenceName: 'Investor Vijay Laxmi (RFI-902)',
      date: '2026-08-08',
      status: 'Approved',
      notes: '₹5,00,000 Fixed Return Investment Verified'
    },
    {
      id: 'LEDGER-802',
      employeeId: 'EMP-102',
      employeeName: 'Pooja Srivastava',
      category: 'Customer',
      points: 2,
      referenceName: 'Plot Booking A-14 (Cust Sunita Mishra)',
      date: '2026-08-09',
      status: 'Approved',
      notes: '36 Month EMI Booking Approved'
    },
    {
      id: 'LEDGER-803',
      employeeId: 'EMP-103',
      employeeName: 'Amit Kumar Pandey',
      category: 'Agent',
      points: 1,
      referenceName: 'New Agent ID AGT-309',
      date: '2026-08-10',
      status: 'Approved',
      notes: 'Agent Registration Completed'
    }
  ]);

  // Show Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Export PDF Report
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
      triggerToast(`✓ PDF Report (${filename}.pdf) generated successfully!`);
    });
  };

  // Export CSV
  const handleExportCsv = (data: any[], filename: string) => {
    if (!data || !data.length) return;
    const keys = Object.keys(data[0]);
    const csvRows = [keys.join(',')];
    for (const row of data) {
      const values = keys.map((key) => `"${row[key] !== undefined ? row[key] : ''}"`);
      csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    a.click();
    triggerToast(`✓ CSV Export (${filename}.csv) downloaded!`);
  };

  // Add Point Credit / Reversal to Employee
  const handleApplyPointAdjustment = () => {
    if (!selectedEmployeeForPoints) return;

    let pointsToAdd = 0;
    if (pointCreditModal.joiningCategory === 'Agent') pointsToAdd = pointCreditModal.countInput * 1;
    else if (pointCreditModal.joiningCategory === 'Customer') pointsToAdd = pointCreditModal.countInput * 2;
    else if (pointCreditModal.joiningCategory === 'Investor') pointsToAdd = pointCreditModal.countInput * 3;
    else if (pointCreditModal.joiningCategory === 'Risk-Free Investor') pointsToAdd = pointCreditModal.countInput * 4;
    else if (pointCreditModal.joiningCategory === 'Point Reversal') pointsToAdd = -Math.abs(pointCreditModal.countInput);

    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === selectedEmployeeForPoints.id) {
          let updatedAgent = e.agentJoinings;
          let updatedCustomer = e.customerJoinings;
          let updatedInvestor = e.investorJoinings;
          let updatedRiskFree = e.riskFreeInvestorJoinings;

          if (pointCreditModal.joiningCategory === 'Agent') updatedAgent += pointCreditModal.countInput;
          else if (pointCreditModal.joiningCategory === 'Customer') updatedCustomer += pointCreditModal.countInput;
          else if (pointCreditModal.joiningCategory === 'Investor') updatedInvestor += pointCreditModal.countInput;
          else if (pointCreditModal.joiningCategory === 'Risk-Free Investor') updatedRiskFree += pointCreditModal.countInput;

          return {
            ...e,
            agentJoinings: Math.max(0, updatedAgent),
            customerJoinings: Math.max(0, updatedCustomer),
            investorJoinings: Math.max(0, updatedInvestor),
            riskFreeInvestorJoinings: Math.max(0, updatedRiskFree)
          };
        }
        return e;
      })
    );

    // Record in ledger
    const newEntry: PointLedgerEntry = {
      id: `LEDGER-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: selectedEmployeeForPoints.id,
      employeeName: selectedEmployeeForPoints.name,
      category: pointCreditModal.joiningCategory,
      points: pointsToAdd,
      referenceName: pointCreditModal.notesInput || 'Admin Verified Manual Adjustment',
      date: new Date().toISOString().split('T')[0],
      status: pointsToAdd >= 0 ? 'Approved' : 'Reversed',
      notes: pointCreditModal.notesInput
    };

    setPointLedger((prev) => [newEntry, ...prev]);
    triggerToast(`✓ Points updated for ${selectedEmployeeForPoints.name} (${pointsToAdd >= 0 ? '+' : ''}${pointsToAdd} Points).`);
    setSelectedEmployeeForPoints(null);
  };

  // Change Honorarium Status
  const handleChangeHonorariumStatus = (empId: string, newStatus: EmployeeRecord['honorariumStatus']) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, honorariumStatus: newStatus } : e))
    );
    triggerToast(`✓ Honorarium Status updated to '${newStatus}' for ${empId}`);
  };

  // Global Computed Metrics
  const calculatedList = employees.map((emp) => ({
    emp,
    eval: evaluateEmployeePromotionStatus(
      emp.agentJoinings,
      emp.customerJoinings,
      emp.investorJoinings,
      emp.riskFreeInvestorJoinings
    )
  }));

  const totalEmployeesCount = employees.length;
  const wfhEligibleCount = calculatedList.filter((item) => item.eval.isWfhEligible).length; // < 601 Pts
  const officeAssignedCount = calculatedList.filter((item) => !item.eval.isWfhEligible).length; // >= 601 Pts

  const totalPointsGenerated = calculatedList.reduce((sum, item) => sum + item.eval.totalPoints, 0);
  const totalMonthlyHonorariumLiability = calculatedList.reduce((sum, item) => sum + item.eval.monthlyHonorarium, 0);
  const totalHonorariumPaid = employees.reduce((sum, item) => sum + item.monthlyHonorariumReceived, 0);
  const totalHonorariumPending = employees.reduce((sum, item) => sum + item.pendingHonorarium, 0);

  // Filtered List
  const filteredEmployees = calculatedList.filter(({ emp, eval: evalRes }) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evalRes.designationHindi.includes(searchQuery) ||
      evalRes.designationEnglish.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWfh =
      wfhFilter === 'all'
        ? true
        : wfhFilter === 'wfh'
        ? evalRes.isWfhEligible
        : !evalRes.isWfhEligible;

    const matchesDept = selectedDeptFilter === 'all' ? true : evalRes.department === selectedDeptFilter;

    return matchesSearch && matchesWfh && matchesDept;
  });

  return (
    <div className={`rounded-3xl p-6 md:p-8 border shadow-2xl space-y-8 ${
      isDarkMode ? 'bg-slate-900 border-sky-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* HEADER TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-sky-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-md tracking-wider">
              Workforce Intelligence Engine
            </span>
            <span className="bg-amber-500/20 text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-md">
              16 Hierarchy Tiers
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-md">
              WFH Threshold: 600 Pts
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-sky-400" />
            <span>Employee Point, Promotion, Honorarium & WFH Management</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Automated Point Allocation Formula: <code className="text-amber-300 font-mono">(Agent×1) + (Cust×2) + (Inv×3) + (RiskFree×4)</code>. Automatic designation, department assignment, monthly honorarium, and Work-From-Home policy enforcement.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('employees')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'employees'
                ? 'bg-sky-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Directory ({totalEmployeesCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hierarchy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'hierarchy'
                ? 'bg-sky-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Promotion Hierarchy (16 Tiers)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('honorarium')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'honorarium'
                ? 'bg-sky-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Monthly Honorarium Payroll</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wfh_policy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'wfh_policy'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>WFH vs Office Allocations</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-sky-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Point Ledger & Reversals</span>
          </button>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce shadow-xl">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP SUMMARY STATISTICAL CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Employees & WFH Breakdown */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
            <span>Workforce Volume</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalEmployeesCount} Active Staff</div>
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
              <Home className="w-3 h-3" /> {wfhEligibleCount} WFH (0-600 Pts)
            </span>
            <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {officeAssignedCount} Office (601+ Pts)
            </span>
          </div>
        </div>

        {/* Card 2: Total Point Generation */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
            <span>Total Points Generated</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{totalPointsGenerated.toLocaleString()} Pts</div>
          <div className="text-[11px] text-slate-400 font-medium">
            Agent(1), Customer(2), Investor(3), RiskFree(4)
          </div>
        </div>

        {/* Card 3: Monthly Honorarium Liability */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
            <span>Monthly Honorarium Liability</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{formatINR(totalMonthlyHonorariumLiability)} / mo</div>
          <div className="text-[11px] text-slate-400 flex justify-between font-bold">
            <span>Paid: {formatINR(totalHonorariumPaid)}</span>
            <span className="text-rose-400">Pending: {formatINR(totalHonorariumPending)}</span>
          </div>
        </div>

        {/* Card 4: Top Level Milestone Reach */}
        <div className="bg-gradient-to-br from-sky-950 to-slate-950 p-5 rounded-2xl border border-sky-500/30 space-y-2">
          <div className="flex justify-between items-center text-xs text-sky-300 font-bold uppercase">
            <span>Highest Designation Tier</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-extrabold text-white truncate">
            {calculatedList.length > 0 ? calculatedList.sort((a, b) => b.eval.totalPoints - a.eval.totalPoints)[0].eval.designationHindi : 'N/A'}
          </div>
          <div className="text-[11px] text-amber-300 font-mono font-bold">
            Top: {calculatedList.length > 0 ? calculatedList.sort((a, b) => b.eval.totalPoints - a.eval.totalPoints)[0].eval.totalPoints : 0} Points
          </div>
        </div>
      </div>

      {/* TAB 1: EMPLOYEE POINT & PROMOTION DIRECTORY */}
      {activeTab === 'employees' && (
        <div className="space-y-6" id="employee-directory-table-container">
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search staff, designation ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* WFH Filter */}
              <select
                value={wfhFilter}
                onChange={(e) => setWfhFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:outline-none"
              >
                <option value="all">All Work Categories</option>
                <option value="wfh">Work From Home Eligible (&lt; 601 Pts)</option>
                <option value="office">Office / Dept Assigned (601+ Pts)</option>
              </select>
            </div>

            {/* EXPORT BUTTONS */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleExportCsv(
                    calculatedList.map((item) => ({
                      Staff_ID: item.emp.id,
                      Name: item.emp.name,
                      Phone: item.emp.phone,
                      Total_Points: item.eval.totalPoints,
                      Designation_Hindi: item.eval.designationHindi,
                      Designation_English: item.eval.designationEnglish,
                      Department: item.eval.department,
                      Monthly_Honorarium: item.eval.monthlyHonorarium,
                      Work_Status: item.eval.workStatusCategory,
                      Work_Location: item.eval.workLocationType
                    })),
                    'Employee_Promotion_Master_Report'
                  )
                }
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportPdf('employee-directory-table-container', 'Employee_Promotion_Report')}
                className="bg-sky-600 hover:bg-sky-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* MAIN EMPLOYEE TABLE */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-black uppercase text-[10px]">
                  <th className="p-3">Staff ID & Profile</th>
                  <th className="p-3">Verified Points Breakdown</th>
                  <th className="p-3">Achieved Designation & Dept</th>
                  <th className="p-3">Work Location Category</th>
                  <th className="p-3">Monthly Honorarium</th>
                  <th className="p-3">Next Promotion Target</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {filteredEmployees.map(({ emp, eval: evalRes }) => (
                  <tr key={emp.id} className="hover:bg-slate-900/80 transition-colors">
                    <td className="p-3">
                      <div className="font-mono text-sky-400 font-black text-xs">{emp.id}</div>
                      <div className="font-extrabold text-white text-sm">{emp.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{emp.phone}</span>
                        <span>•</span>
                        <span>Joined: {emp.joiningDate}</span>
                      </div>
                    </td>

                    {/* Point Breakdown */}
                    <td className="p-3 font-mono">
                      <div className="text-base font-black text-amber-400">{evalRes.totalPoints} Pts</div>
                      <div className="text-[10px] text-slate-400 flex flex-wrap gap-1 mt-1">
                        <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">Agt: {evalRes.pointBreakdown.agentJoinings} ({evalRes.pointBreakdown.agentPoints}pt)</span>
                        <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">Cust: {evalRes.pointBreakdown.customerJoinings} ({evalRes.pointBreakdown.customerPoints}pt)</span>
                        <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">Inv: {evalRes.pointBreakdown.investorJoinings} ({evalRes.pointBreakdown.investorPoints}pt)</span>
                        <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">RFI: {evalRes.pointBreakdown.riskFreeInvestorJoinings} ({evalRes.pointBreakdown.riskFreeInvestorPoints}pt)</span>
                      </div>
                    </td>

                    {/* Designation & Department */}
                    <td className="p-3">
                      <div className="font-black text-white text-xs">{evalRes.designationHindi}</div>
                      <div className="text-[10px] text-slate-300 font-medium">{evalRes.designationEnglish}</div>
                      <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold px-2 py-0.5 rounded inline-block mt-1">
                        Dept: {evalRes.department}
                      </span>
                    </td>

                    {/* Work Location Category Formula */}
                    <td className="p-3">
                      {evalRes.isWfhEligible ? (
                        <div className="space-y-1">
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                            <Home className="w-3 h-3" />
                            <span>Work From Home Eligible</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">(&lt; 600 Pts Rule)</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                            <Building2 className="w-3 h-3" />
                            <span>Office / Dept Assigned</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">(≥ 601 Pts Rule)</span>
                        </div>
                      )}
                    </td>

                    {/* Monthly Honorarium */}
                    <td className="p-3 font-mono">
                      <div className="text-sm font-black text-emerald-400">{formatINR(evalRes.monthlyHonorarium)} / mo</div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded inline-block mt-0.5 ${
                        emp.honorariumStatus === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : emp.honorariumStatus === 'Approved'
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        Status: {emp.honorariumStatus}
                      </span>
                    </td>

                    {/* Next Target & Progress */}
                    <td className="p-3 min-w-44">
                      {evalRes.nextTier ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400">Next: {evalRes.nextTier.designationHindi}</span>
                            <span className="text-amber-400 font-mono">Needs {evalRes.pointsToNextPromotion} Pts</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
                              style={{ width: `${evalRes.progressPercentToNextLevel}%` }}
                            />
                          </div>
                          <div className="text-[9px] text-slate-400 text-right font-mono">Target: {evalRes.nextTier.minPoints} Pts ({evalRes.progressPercentToNextLevel}%)</div>
                        </div>
                      ) : (
                        <span className="bg-purple-500/20 text-purple-300 font-bold text-[10px] px-2 py-0.5 rounded">
                          ★ Max Level Achieved
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployeeForPoints(emp)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adjust Pts</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSlipModal({ employee: emp, calculation: evalRes })}
                          className="bg-sky-600 hover:bg-sky-500 text-white px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Slip</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PROMOTION & HONORARIUM HIERARCHY MATRIX (16 TIERS) */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Official Company Promotion & Honorarium Hierarchy Table</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Designations, Minimum Points Thresholds, Monthly Honorarium Structure, and Work Location Rules across all 16 levels.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExportCsv(PROMOTION_TIERS_HIERARCHY, 'Company_Promotion_Hierarchy_Matrix')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Hierarchy Matrix</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-black uppercase text-[10px]">
                    <th className="p-3">Tier #</th>
                    <th className="p-3">Required Minimum Points</th>
                    <th className="p-3">Designation (Hindi & English)</th>
                    <th className="p-3">Monthly Honorarium (₹)</th>
                    <th className="p-3">Assigned Department</th>
                    <th className="p-3">Work Location Rule</th>
                    <th className="p-3 text-right">Qualified Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {PROMOTION_TIERS_HIERARCHY.map((tier) => {
                    const countInTier = calculatedList.filter((c) => c.eval.currentTier?.level === tier.level).length;
                    const isOfficeTier = tier.minPoints >= 601;

                    return (
                      <tr key={tier.level} className="hover:bg-slate-900/80 transition-colors">
                        <td className="p-3 font-mono font-black text-amber-400">Level {tier.level}</td>
                        <td className="p-3 font-mono font-black text-white">{tier.minPoints.toLocaleString()} Points</td>
                        <td className="p-3">
                          <div className="font-extrabold text-white text-sm">{tier.designationHindi}</div>
                          <div className="text-[10px] text-slate-400">{tier.designationEnglish}</div>
                        </td>
                        <td className="p-3 font-mono font-black text-emerald-400 text-sm">
                          {formatINR(tier.monthlyHonorarium)} / mo
                        </td>
                        <td className="p-3">
                          <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            {tier.department}
                          </span>
                        </td>
                        <td className="p-3">
                          {isOfficeTier ? (
                            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded border border-amber-500/40">
                              Office Assigned (601+ Pts)
                            </span>
                          ) : (
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded border border-emerald-500/40">
                              Work From Home Eligible (&lt;601 Pts)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-sky-400">
                          {countInTier} Employees
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

      {/* TAB 3: MONTHLY HONORARIUM PAYROLL & SLIPS */}
      {activeTab === 'honorarium' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Monthly Honorarium Disbursement & Status Workflow</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Manage Monthly Honorarium Payouts (Pending, Approved, Processing, Paid, Hold, Cancelled).
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleExportCsv(
                      employees.map((e) => ({
                        Emp_ID: e.id,
                        Name: e.name,
                        BankAccount: e.bankAccount,
                        IFSC: e.ifscCode,
                        PendingHonorarium: e.pendingHonorarium,
                        Received: e.monthlyHonorariumReceived,
                        Status: e.honorariumStatus
                      })),
                      'Honorarium_Disbursement_Bank_Ledger'
                    )
                  }
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export Bank Ledger CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-black uppercase text-[10px]">
                    <th className="p-3">Staff ID & Name</th>
                    <th className="p-3">Bank Details</th>
                    <th className="p-3">Eligible Honorarium</th>
                    <th className="p-3">Total Paid Till Date</th>
                    <th className="p-3">Pending Amount</th>
                    <th className="p-3">Payment Workflow Status</th>
                    <th className="p-3 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {calculatedList.map(({ emp, eval: evalRes }) => (
                    <tr key={emp.id} className="hover:bg-slate-900/80 transition-colors">
                      <td className="p-3">
                        <div className="font-mono text-sky-400 font-bold">{emp.id}</div>
                        <div className="font-extrabold text-white">{emp.name}</div>
                        <div className="text-[10px] text-slate-400">{evalRes.designationHindi}</div>
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        <div className="text-slate-200">A/C: {emp.bankAccount}</div>
                        <div className="text-[10px] text-amber-400">IFSC: {emp.ifscCode}</div>
                      </td>
                      <td className="p-3 font-mono font-black text-emerald-400 text-sm">
                        {formatINR(evalRes.monthlyHonorarium)}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-200">
                        {formatINR(emp.monthlyHonorariumReceived)}
                      </td>
                      <td className="p-3 font-mono font-black text-rose-400">
                        {formatINR(emp.pendingHonorarium)}
                      </td>
                      <td className="p-3">
                        <select
                          value={emp.honorariumStatus}
                          onChange={(e) => handleChangeHonorariumStatus(emp.id, e.target.value as any)}
                          className="bg-slate-900 border border-slate-700 text-xs font-bold px-2 py-1 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Processing">Processing</option>
                          <option value="Paid">Paid</option>
                          <option value="Hold">Hold</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveSlipModal({ employee: emp, calculation: evalRes })}
                          className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 justify-end ml-auto"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Generate Slip PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WORK FROM HOME (WFH) & DEPARTMENT ALLOCATION POLICY */}
      {activeTab === 'wfh_policy' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div>
              <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>Work-From-Home & Department Assignment Policy Engine</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Strict Rule: Employees with <strong>0 to 600 Points</strong> are categorized as <strong>"Work From Home Eligible"</strong>. Once points reach <strong>601 or more</strong>, they automatically transition to <strong>"Office / Department Assigned Employee"</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category 1: Work From Home Eligible (< 601 Pts) */}
              <div className="bg-emerald-950/40 border-2 border-emerald-500/40 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-emerald-500/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-extrabold text-white text-sm">Work From Home Category (&lt; 601 Points)</h4>
                  </div>
                  <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full">
                    {wfhEligibleCount} Staff
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Eligible to perform official company tasks from residence. Requires monthly remote reporting and digital verified joinings submission.
                </p>

                <div className="space-y-2">
                  {calculatedList
                    .filter((item) => item.eval.isWfhEligible)
                    .map(({ emp, eval: evalRes }) => (
                      <div key={emp.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-white">{emp.name}</div>
                          <div className="text-[10px] text-slate-400">{evalRes.designationHindi}</div>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-amber-400 font-bold">{evalRes.totalPoints} Pts</span>
                          <span className="text-[10px] text-slate-500 block">Needs {601 - evalRes.totalPoints} for Office</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Category 2: Office Assigned (>= 601 Pts) */}
              <div className="bg-amber-950/40 border-2 border-amber-500/40 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-amber-500/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <h4 className="font-extrabold text-white text-sm">Office / Department Assigned Category (601+ Points)</h4>
                  </div>
                  <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full">
                    {officeAssignedCount} Staff
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Assigned mandatory office presence & departmental leadership responsibilities according to promotion designation level.
                </p>

                <div className="space-y-2">
                  {calculatedList
                    .filter((item) => !item.eval.isWfhEligible)
                    .map(({ emp, eval: evalRes }) => (
                      <div key={emp.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-white">{emp.name}</div>
                          <div className="text-[10px] text-amber-300">Dept: {evalRes.department}</div>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-emerald-400 font-black">{evalRes.totalPoints} Pts</span>
                          <span className="text-[10px] text-slate-400 block">{formatINR(evalRes.monthlyHonorarium)}/mo</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: POINT LEDGER & REVERSALS */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Verified Point Allocation Ledger & Reversal Records</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Complete audit log of Agent (1pt), Customer (2pt), Investor (3pt), Risk-Free Investor (4pt) credits and point reversals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExportCsv(pointLedger, 'Employee_Point_Audit_Ledger')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Point Audit CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-black uppercase text-[10px]">
                    <th className="p-3">Entry ID & Date</th>
                    <th className="p-3">Employee Name</th>
                    <th className="p-3">Joining Category</th>
                    <th className="p-3">Points Credited / Debited</th>
                    <th className="p-3">Reference / Verification Notes</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {pointLedger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-900/80 transition-colors">
                      <td className="p-3 font-mono">
                        <div className="text-sky-400 font-bold">{entry.id}</div>
                        <div className="text-[10px] text-slate-400">{entry.date}</div>
                      </td>
                      <td className="p-3 font-extrabold text-white">{entry.employeeName}</td>
                      <td className="p-3">
                        <span className="bg-slate-900 border border-slate-800 text-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          {entry.category}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-black text-sm">
                        {entry.points >= 0 ? (
                          <span className="text-emerald-400">+{entry.points} Pts</span>
                        ) : (
                          <span className="text-rose-400">{entry.points} Pts</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300">
                        <div className="font-bold">{entry.referenceName}</div>
                        <div className="text-[10px] text-slate-400">{entry.notes}</div>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                          entry.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {entry.status}
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

      {/* MODAL 1: POINT CREDIT & REVERSAL ADJUSTMENT */}
      {selectedEmployeeForPoints && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-5 shadow-2xl text-white animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-amber-400">Adjust Employee Points & Joinings</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedEmployeeForPoints.name} ({selectedEmployeeForPoints.id})</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployeeForPoints(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Select Joining Type / Reversal:</label>
                <select
                  value={pointCreditModal.joiningCategory}
                  onChange={(e) =>
                    setPointCreditModal({ ...pointCreditModal, joiningCategory: e.target.value as any })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Agent">Agent Joining (+1 Point / unit)</option>
                  <option value="Customer">Customer Joining (+2 Points / unit)</option>
                  <option value="Investor">Investor Joining (+3 Points / unit)</option>
                  <option value="Risk-Free Investor">Risk-Free Investor Joining (+4 Points / unit)</option>
                  <option value="Point Reversal">Point Reversal (Deduct Points for Cancelled Joining)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {pointCreditModal.joiningCategory === 'Point Reversal' ? 'Number of Points to Deduct:' : 'Count / Quantity of Approved Joinings:'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={pointCreditModal.countInput}
                  onChange={(e) =>
                    setPointCreditModal({ ...pointCreditModal, countInput: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Reference ID / Approval Notes:</label>
                <input
                  type="text"
                  placeholder="e.g., Plot Booking A-12, Verified by Admin"
                  value={pointCreditModal.notesInput}
                  onChange={(e) => setPointCreditModal({ ...pointCreditModal, notesInput: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedEmployeeForPoints(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyPointAdjustment}
                className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-400 shadow"
              >
                Apply Points Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: HONORARIUM SLIP PRINT PREVIEW */}
      {activeSlipModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl space-y-6 text-white shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-sky-400 flex items-center gap-2">
                <Printer className="w-5 h-5" />
                <span>Monthly Honorarium Slip Statement</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveSlipModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* PRINTABLE AREA */}
            <div id="honorarium-slip-printable" className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <div className="font-black text-lg text-amber-400 uppercase tracking-wide">
                    VPM Real Estate & Financial Services Pvt Ltd
                  </div>
                  <div className="text-xs text-slate-400">Official Monthly Honorarium Slip • Prayagraj, UP</div>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-sky-400 font-bold block">SLIP #: HONOR-2026-08</span>
                  <span className="text-slate-400">Date: {new Date().toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee Name & ID</span>
                  <strong className="text-white text-sm block">{activeSlipModal.employee.name}</strong>
                  <span className="text-sky-400 font-mono font-bold">{activeSlipModal.employee.id}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Designation (Hindi)</span>
                  <strong className="text-amber-300 text-sm block">{activeSlipModal.calculation.designationHindi}</strong>
                  <span className="text-slate-400">{activeSlipModal.calculation.designationEnglish}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Department</span>
                  <strong className="text-indigo-300">{activeSlipModal.calculation.department}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Work Location Category</span>
                  <strong className={activeSlipModal.calculation.isWfhEligible ? 'text-emerald-400' : 'text-amber-400'}>
                    {activeSlipModal.calculation.workStatusCategory}
                  </strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 bg-slate-900 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Verified Points:</span>
                  <strong className="text-amber-400 font-mono font-black">{activeSlipModal.calculation.totalPoints} Pts</strong>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-200 font-extrabold">Eligible Monthly Honorarium:</span>
                  <strong className="text-emerald-400 font-mono font-black text-base">
                    {formatINR(activeSlipModal.calculation.monthlyHonorarium)} / mo
                  </strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Disbursement Status:</span>
                  <span className="text-sky-400 font-bold">{activeSlipModal.employee.honorariumStatus}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveSlipModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleExportPdf('honorarium-slip-printable', `Honorarium_Slip_${activeSlipModal.employee.id}`)}
                className="px-5 py-2 rounded-xl text-xs font-black bg-sky-500 text-slate-950 hover:bg-sky-400 flex items-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4" />
                <span>Download Slip PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
