import React, { useState } from 'react';
import {
  UserCheck,
  Award,
  TrendingUp,
  Building2,
  Home,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Plus,
  Layers,
  Sparkles,
  DollarSign,
  FileText,
  Clock,
  ChevronRight,
  ShieldCheck,
  Send,
  Printer,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  PROMOTION_TIERS_HIERARCHY,
  evaluateEmployeePromotionStatus,
  EmployeeRecord
} from '../utils/employeePromotionEngine';
import { formatINR } from '../utils/calculators';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface UserEmployeePortalViewProps {
  employee?: EmployeeRecord;
}

export const UserEmployeePortalView: React.FC<UserEmployeePortalViewProps> = ({
  employee: customEmployee
}) => {
  // Default Sample Logged-In Employee if none passed
  const [employee, setEmployee] = useState<EmployeeRecord>(
    customEmployee || {
      id: 'EMP-101',
      name: 'Ramesh Chandra Verma',
      phone: '+91 98391 12345',
      joiningDate: '2025-01-15',
      agentJoinings: 45,
      customerJoinings: 80,
      investorJoinings: 35,
      riskFreeInvestorJoinings: 25,
      monthlyHonorariumReceived: 18000,
      pendingHonorarium: 6000,
      honorariumStatus: 'Approved',
      bankAccount: '382901928371',
      ifscCode: 'SBIN0001234',
      kycVerified: true
    }
  );

  // Active Tab inside Employee Portal
  const [activeTab, setActiveTab] = useState<'dashboard' | 'promotion' | 'honorarium' | 'joinings_request' | 'hierarchy_matrix' | 'tax_statement'>('dashboard');

  // Submit Joining Request Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [joiningCategory, setJoiningCategory] = useState<'Agent' | 'Customer' | 'Investor' | 'Risk-Free Investor'>('Customer');
  const [clientNameInput, setClientNameInput] = useState('');
  const [clientPhoneInput, setClientPhoneInput] = useState('');
  const [refDetailsInput, setRefDetailsInput] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculated Status
  const evalStatus = evaluateEmployeePromotionStatus(
    employee.agentJoinings,
    employee.customerJoinings,
    employee.investorJoinings,
    employee.riskFreeInvestorJoinings
  );

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
      triggerToast(`✓ PDF Downloaded (${filename}.pdf)`);
    });
  };

  const handleSubmitNewJoining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNameInput.trim() || !clientPhoneInput.trim()) {
      alert('Please fill in Client Name and Mobile Number.');
      return;
    }

    triggerToast(`✓ Joining Verification Request for '${clientNameInput}' (${joiningCategory}) submitted to Admin!`);
    setShowSubmitModal(false);
    setClientNameInput('');
    setClientPhoneInput('');
    setRefDetailsInput('');
  };

  return (
    <div className="space-y-8 text-white">
      {/* TOAST */}
      {toastMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce shadow-xl">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER HERO PROFILE CAPSULE */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-slate-950 shadow-xl shrink-0">
              {employee.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-sky-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-md">
                  Employee ID: {employee.id}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
                  KYC Verified
                </span>
              </div>
              <h1 className="text-2xl font-black text-white mt-1">{employee.name}</h1>
              <div className="text-xs text-sky-300 font-extrabold flex items-center gap-2 mt-0.5">
                <span>{evalStatus.designationHindi}</span>
                <span>•</span>
                <span>{evalStatus.designationEnglish}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Capsule */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Points</span>
              <strong className="text-xl font-black text-amber-400 font-mono">{evalStatus.totalPoints}</strong>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Honorarium</span>
              <strong className="text-xl font-black text-emerald-400 font-mono">{formatINR(evalStatus.monthlyHonorarium)}/mo</strong>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Work Location</span>
              <strong className={evalStatus.isWfhEligible ? 'text-emerald-400 text-xs' : 'text-amber-400 text-xs'}>
                {evalStatus.isWfhEligible ? 'WFH Eligible' : 'Office Assigned'}
              </strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-sky-500 text-slate-950 shadow-lg'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Employee Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('promotion')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'promotion'
                ? 'bg-sky-500 text-slate-950 shadow-lg'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Promotion Progress</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('honorarium')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'honorarium'
                ? 'bg-sky-500 text-slate-950 shadow-lg'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Honorarium Records & Slips</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hierarchy_matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'hierarchy_matrix'
                ? 'bg-sky-500 text-slate-950 shadow-lg'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>16 Promotion Tiers Table</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tax_statement')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tax_statement'
                ? 'bg-sky-500 text-slate-950 shadow-lg'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Form 16 Tax Statement</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-2 shadow ml-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Request New Joining Points</span>
          </button>
        </div>
      </div>

      {/* TAB 1: EMPLOYEE DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 4 STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Points */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
                <span>Total Accumulated Points</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400 font-mono">{evalStatus.totalPoints} Pts</div>
              <div className="text-[11px] text-slate-400 font-medium">
                Monthly Pts: {evalStatus.pointBreakdown.monthlyPoints} • Yearly: {evalStatus.pointBreakdown.yearlyPoints}
              </div>
            </div>

            {/* Card 2: Current Designation */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
                <span>Current Designation</span>
                <Sparkles className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-lg font-black text-white truncate">{evalStatus.designationHindi}</div>
              <div className="text-[11px] text-sky-300 font-medium truncate">{evalStatus.designationEnglish}</div>
            </div>

            {/* Card 3: Monthly Honorarium */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
                <span>Monthly Honorarium</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono">{formatINR(evalStatus.monthlyHonorarium)}</div>
              <div className="text-[11px] text-slate-400 font-bold flex justify-between">
                <span>Status: {employee.honorariumStatus}</span>
                <span className="text-rose-400">Pending: {formatINR(employee.pendingHonorarium)}</span>
              </div>
            </div>

            {/* Card 4: Work Location Category */}
            <div className={`p-5 rounded-2xl border space-y-2 ${
              evalStatus.isWfhEligible
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : 'bg-amber-950/40 border-amber-500/40'
            }`}>
              <div className="flex justify-between items-center text-xs font-bold uppercase">
                <span className={evalStatus.isWfhEligible ? 'text-emerald-300' : 'text-amber-300'}>
                  Work Location Policy
                </span>
                {evalStatus.isWfhEligible ? <Home className="w-4 h-4 text-emerald-400" /> : <Building2 className="w-4 h-4 text-amber-400" />}
              </div>
              <div className="text-lg font-black text-white">{evalStatus.workStatusCategory}</div>
              <div className="text-[11px] text-slate-300 font-mono">
                {evalStatus.isWfhEligible ? 'Residence Work Eligible (<600 Pts)' : 'Department Headquarters (601+ Pts)'}
              </div>
            </div>
          </div>

          {/* VERIFIED JOINING POINT BREAKDOWN MATRIX */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-sm text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Verified Joinings Point Calculation Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              {/* Agent Joinings */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Agent Joining (1 Pt)</span>
                <div className="text-xl font-black text-white">{employee.agentJoinings} Agents</div>
                <span className="text-xs text-amber-400 font-bold block">Points Credited = {evalStatus.pointBreakdown.agentPoints} Pts</span>
              </div>

              {/* Customer Joinings */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer Joining (2 Pts)</span>
                <div className="text-xl font-black text-white">{employee.customerJoinings} Customers</div>
                <span className="text-xs text-amber-400 font-bold block">Points Credited = {evalStatus.pointBreakdown.customerPoints} Pts</span>
              </div>

              {/* Investor Joinings */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Investor Joining (3 Pts)</span>
                <div className="text-xl font-black text-white">{employee.investorJoinings} Investors</div>
                <span className="text-xs text-amber-400 font-bold block">Points Credited = {evalStatus.pointBreakdown.investorPoints} Pts</span>
              </div>

              {/* Free Plot Scheme Joinings */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Free Plot Scheme (4 Pts)</span>
                <div className="text-xl font-black text-white">{employee.riskFreeInvestorJoinings} FPS</div>
                <span className="text-xs text-amber-400 font-bold block">Points Credited = {evalStatus.pointBreakdown.riskFreeInvestorPoints} Pts</span>
              </div>
            </div>
          </div>

          {/* EMPLOYEE PROFILE & REPORTING MANAGER DETAILS */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-sm text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span>Employee Official Profile & Department Assignment</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Assigned Department</span>
                <strong className="text-base text-indigo-300 font-black block mt-1">{evalStatus.department}</strong>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Reporting Executive Manager</span>
                <strong className="text-base text-white font-black block mt-1">{evalStatus.reportingManager}</strong>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Bank A/C for Honorarium</span>
                <strong className="text-sm font-mono text-emerald-400 block mt-1">{employee.bankAccount} ({employee.ifscCode})</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROMOTION MILESTONE PROGRESS */}
      {activeTab === 'promotion' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div>
              <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Next Promotion Level Milestone Tracker</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Track required verified points to unlock the next designation tier and higher monthly honorarium.
              </p>
            </div>

            {evalStatus.nextTier ? (
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs text-slate-400 font-bold block uppercase">Target Promotion Level</span>
                    <h4 className="text-xl font-black text-amber-400">{evalStatus.nextTier.designationHindi}</h4>
                    <span className="text-xs text-sky-300">{evalStatus.nextTier.designationEnglish}</span>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xs text-slate-400 block font-bold">Monthly Honorarium Upgrade</span>
                    <span className="text-2xl font-black text-emerald-400">{formatINR(evalStatus.nextTier.monthlyHonorarium)} / mo</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-bold font-mono">
                    <span className="text-slate-300">Current Points: {evalStatus.totalPoints} Pts</span>
                    <span className="text-amber-400">Target: {evalStatus.nextTier.minPoints} Pts ({evalStatus.pointsToNextPromotion} Pts Remaining)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${evalStatus.progressPercentToNextLevel}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 text-right font-mono font-bold">
                    {evalStatus.progressPercentToNextLevel}% Complete towards Next Promotion
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-purple-950/40 border border-purple-500/40 p-6 rounded-2xl text-center space-y-2">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="font-black text-lg text-white">★ Peak Promotion Tier Achieved!</h4>
                <p className="text-xs text-purple-200">
                  You have reached the highest designation in the company hierarchy: <strong>{evalStatus.designationHindi}</strong> with ₹70,000 / month honorarium.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: HONORARIUM RECORDS & PRINT SLIPS */}
      {activeTab === 'honorarium' && (
        <div className="space-y-6" id="employee-honorarium-statement-box">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>My Monthly Honorarium Ledger & Bank Payslip</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Monthly eligible honorarium based on verified designation level.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleExportPdf('employee-honorarium-statement-box', `Honorarium_Statement_${employee.id}`)}
                className="bg-sky-600 hover:bg-sky-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Download Honorarium PDF</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Monthly Honorarium</span>
                <strong className="text-2xl font-black text-emerald-400 block mt-1">{formatINR(evalStatus.monthlyHonorarium)} / mo</strong>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Honorarium Received</span>
                <strong className="text-2xl font-black text-white block mt-1">{formatINR(employee.monthlyHonorariumReceived)}</strong>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Pending Amount</span>
                <strong className="text-2xl font-black text-rose-400 block mt-1">{formatINR(employee.pendingHonorarium)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 16 PROMOTION TIERS MATRIX */}
      {activeTab === 'hierarchy_matrix' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Full 16-Tier Promotion & Honorarium Structure</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-black uppercase text-[10px]">
                    <th className="p-3">Level</th>
                    <th className="p-3">Minimum Points</th>
                    <th className="p-3">Designation (Hindi & English)</th>
                    <th className="p-3">Monthly Honorarium (₹)</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Work Location Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {PROMOTION_TIERS_HIERARCHY.map((tier) => {
                    const isCurrentLevel = evalStatus.currentTier?.level === tier.level;

                    return (
                      <tr
                        key={tier.level}
                        className={`transition-colors ${
                          isCurrentLevel ? 'bg-amber-500/10 border-l-4 border-amber-500' : 'hover:bg-slate-950/60'
                        }`}
                      >
                        <td className="p-3 font-mono font-black text-amber-400">
                          L-{tier.level} {isCurrentLevel && '★ (YOU)'}
                        </td>
                        <td className="p-3 font-mono font-black text-white">{tier.minPoints.toLocaleString()} Pts</td>
                        <td className="p-3">
                          <div className="font-extrabold text-white text-sm">{tier.designationHindi}</div>
                          <div className="text-[10px] text-slate-400">{tier.designationEnglish}</div>
                        </td>
                        <td className="p-3 font-mono font-black text-emerald-400">
                          {formatINR(tier.monthlyHonorarium)}
                        </td>
                        <td className="p-3 text-slate-300 font-bold">{tier.department}</td>
                        <td className="p-3">
                          {tier.minPoints >= 601 ? (
                            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                              Office Assigned (601+ Pts)
                            </span>
                          ) : (
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                              Work From Home (&lt;601 Pts)
                            </span>
                          )}
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

      {/* TAB 5: FORM 16 ANNUAL TAX STATEMENT */}
      {activeTab === 'tax_statement' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <span>Personal Form 16 & Annual Earning Statement (FY 2025-26)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Official salary & honorarium earnings certificate with TDS deduction breakdown.</p>
            </div>
            <button
              type="button"
              onClick={() => handleExportPdf('personal-form16-statement', `Form16_${employee.id}`)}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Form 16 PDF</span>
            </button>
          </div>

          <div id="personal-form16-statement" className="bg-white text-slate-950 p-6 md:p-8 rounded-2xl space-y-6 text-xs font-sans border-4 border-slate-900 shadow-xl">
            <div className="text-center border-b pb-4 space-y-1">
              <h2 className="text-base font-extrabold uppercase">FORM NO. 16 - CERTIFICATE UNDER SECTION 203</h2>
              <p className="text-[10px] text-slate-600">For tax deducted at source from income chargeable under the head "Salaries & Honorarium"</p>
              <p className="text-xs font-bold text-sky-800">FINANCIAL YEAR: 2025-26 | ASSESSMENT YEAR: 2026-27</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border p-4 rounded-xl bg-slate-50">
              <div><strong>Employer Name:</strong> Greenfield Realty & Fintech Pvt Ltd</div>
              <div><strong>Employer TAN:</strong> DELG12345E</div>
              <div><strong>Employee Name:</strong> {employee.name}</div>
              <div><strong>Employee ID:</strong> {employee.id}</div>
              <div><strong>Designation:</strong> {evalStatus.designationEnglish}</div>
              <div><strong>PAN:</strong> ABCPS****A</div>
            </div>

            <table className="w-full border-collapse border text-left">
              <thead>
                <tr className="bg-slate-100 font-bold border-b">
                  <th className="p-3">Earning Category / Deduction</th>
                  <th className="p-3 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium">
                <tr><td className="p-3">1. Gross Salary & Honorarium Received</td><td className="p-3 text-right font-bold">₹{formatINR(employee.monthlyHonorariumReceived * 12)}</td></tr>
                <tr><td className="p-3">2. Performance Bonuses & Joining Incentives</td><td className="p-3 text-right font-bold">₹{formatINR(40000)}</td></tr>
                <tr className="bg-slate-50 font-bold"><td className="p-3">3. Gross Total Earning</td><td className="p-3 text-right text-emerald-700">₹{formatINR(employee.monthlyHonorariumReceived * 12 + 40000)}</td></tr>
                <tr><td className="p-3 text-rose-700">4. Less: TDS Deducted @ 10% (Section 192)</td><td className="p-3 text-right font-bold text-rose-700">-₹{formatINR(Math.round((employee.monthlyHonorariumReceived * 12 + 40000) * 0.10))}</td></tr>
                <tr className="bg-slate-100 font-black text-sm"><td className="p-3">5. Net Disbursed Salary</td><td className="p-3 text-right text-sky-800">₹{formatINR(Math.round((employee.monthlyHonorariumReceived * 12 + 40000) * 0.90))}</td></tr>
              </tbody>
            </table>

            <div className="pt-4 border-t flex justify-between items-end text-[11px]">
              <div>
                <p><strong>Verification:</strong> Certified that ₹{formatINR(Math.round((employee.monthlyHonorariumReceived * 12 + 40000) * 0.10))} has been deposited to Govt Account.</p>
                <p className="text-slate-500 text-[10px]">Verified via Form 26AS Portal</p>
              </div>
              <div className="text-center font-bold">
                <p>Rajesh Kumar Gautam</p>
                <p className="text-[10px] text-slate-500">Managing Director (Authorized Signatory)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST NEW JOINING POINTS */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitNewJoining}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl text-white animate-in fade-in zoom-in-95"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-base text-amber-400 flex items-center gap-2">
                <Send className="w-5 h-5" />
                <span>Submit Joining Verification for Points</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Joining Category:</label>
              <select
                value={joiningCategory}
                onChange={(e) => setJoiningCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="Agent">Agent Joining (+1 Point)</option>
                <option value="Customer">Customer Joining (+2 Points)</option>
                <option value="Investor">Investor Joining (+3 Points)</option>
                <option value="Risk-Free Investor">Free Plot Scheme Joining (+4 Points)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Client / Agent Full Name:</label>
              <input
                type="text"
                required
                placeholder="e.g., Rajesh Kumar"
                value={clientNameInput}
                onChange={(e) => setClientNameInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Mobile Number:</label>
              <input
                type="text"
                required
                placeholder="+91 98390 XXXXX"
                value={clientPhoneInput}
                onChange={(e) => setClientPhoneInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Plot / Investment Ref Details:</label>
              <input
                type="text"
                placeholder="e.g., Plot A-12 or ROI Bond Certificate #"
                value={refDetailsInput}
                onChange={(e) => setRefDetailsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-400 shadow"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
