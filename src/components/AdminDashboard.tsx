import React, { useState } from 'react';
import { Project, Booking, InvestmentRecord, GalleryItem } from '../types';
import { 
  Users, 
  Award, 
  TrendingUp, 
  UserCheck, 
  Receipt, 
  Building2, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Grid, 
  FileSpreadsheet, 
  CreditCard, 
  BarChart3, 
  Image as ImageIcon, 
  Bell, 
  Settings, 
  LogOut, 
  Plus, 
  Download, 
  FileText, 
  Search, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Upload, 
  Trash2, 
  Share2, 
  Calculator, 
  PieChart as PieIcon, 
  FileCheck, 
  Lock, 
  Database, 
  Key, 
  Activity,
  UserPlus
} from 'lucide-react';
import { formatINR } from '../utils/calculators';
import { AdminHeader } from './admin/AdminHeader';
import { AdminSidebar, AdminTabType } from './admin/AdminSidebar';
import { InflowOutflowAnalytics } from './admin/InflowOutflowAnalytics';
import { MediaUploadManager } from './MediaUploadManager';
import { AdminModals } from './admin/AdminModals';
import { AdminTranslationManager } from './admin/AdminTranslationManager';
import { AdminPaymentManager } from './admin/AdminPaymentManager';
import { AdminHostingerSqlManager } from './admin/AdminHostingerSqlManager';
import { AdminRiskFreeInvestorManager } from './admin/AdminRiskFreeInvestorManager';
import { AdminAgentManager } from './admin/AdminAgentManager';
import { AdminCustomerManager } from './admin/AdminCustomerManager';
import { AdminMlmTeamManager } from './admin/AdminMlmTeamManager';
import { AdminPermissionManager } from './admin/AdminPermissionManager';
import { AdminEmiManager } from './admin/AdminEmiManager';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

interface AdminDashboardProps {
  projects: Project[];
  bookings: Booking[];
  investments: InvestmentRecord[];
  onUpdateProject?: (updatedProjects: Project[]) => void;
  onNavigate?: (section: string) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  projects,
  bookings,
  investments,
  onUpdateProject,
  onNavigate,
  onLogout
}) => {
  // Theme & Search State
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTabType>('dashboard');

  // Modal State
  const [activeModal, setActiveModal] = useState<'addCustomer' | 'addAgent' | 'addInvestor' | 'addEmployee' | 'addExpense' | 'addLoan' | 'uploadGallery' | 'defaultersList' | null>(null);

  // Dynamic Data Lists (seeded with mock data & expandable)
  const [customersList, setCustomersList] = useState([
    { id: 'CUST-101', name: 'Rajesh Sharma', phone: '9876543210', email: 'rajesh@example.com', plotNo: 'A-12', projectName: 'Milestone City Prayagraj', totalPaid: 1500000, payoutReceived: 120000, growthPercent: 18.4, status: 'Active' },
    { id: 'CUST-102', name: 'Sunita Mishra', phone: '9935123456', email: 'sunita@example.com', plotNo: 'B-04', projectName: 'Prayag Royal Enclave', totalPaid: 2100000, payoutReceived: 180000, growthPercent: 22.1, status: 'Active' },
    { id: 'CUST-103', name: 'Vikram Singh', phone: '9415987654', email: 'vikram@example.com', plotNo: 'C-09', projectName: 'Milestone City Prayagraj', totalPaid: 1250000, payoutReceived: 95000, growthPercent: 15.0, status: 'Active' },
    { id: 'CUST-104', name: 'Anil Agarwal', phone: '9839000111', email: 'anil@example.com', plotNo: 'P-15', projectName: 'Sangam Vista Naini', totalPaid: 1800000, payoutReceived: 140000, growthPercent: 19.2, status: 'Active' },
  ]);

  const [agentsList, setAgentsList] = useState([
    { id: 'AGT-201', name: 'Amit Verma', phone: '9889001122', region: 'Jhunsi Sector A', activeBookings: 8, commissionPayout: 840000, status: 'Active' },
    { id: 'AGT-202', name: 'Pooja Tiwari', phone: '9450112233', region: 'Naini Bypass', activeBookings: 6, commissionPayout: 620000, status: 'Active' },
    { id: 'AGT-203', name: 'Sanjay Yadav', phone: '9838776655', region: 'Phaphamau Extension', activeBookings: 5, commissionPayout: 480000, status: 'Active' },
    { id: 'AGT-204', name: 'Rajendra Prasad', phone: '9918223344', region: 'Civil Lines Office', activeBookings: 0, commissionPayout: 0, status: 'Inactive' },
  ]);

  const [investorsList, setInvestorsList] = useState([
    { id: 'INV-301', name: 'Sanjay Gupta', phone: '9988776655', capital: 2900000, roiPercent: 22.5, totalPayout: 652500, tenure: '24 Months', status: 'Active' },
    { id: 'INV-302', name: 'Dr. Ramesh Chandra', phone: '9415223344', capital: 5000000, roiPercent: 32.0, totalPayout: 1600000, tenure: '36 Months', status: 'Active' },
    { id: 'INV-303', name: 'Sunil Malhotra', phone: '9839445566', capital: 1500000, roiPercent: 28.0, totalPayout: 420000, tenure: '12 Months', status: 'Active' },
  ]);

  const [employeesList, setEmployeesList] = useState([
    { id: 'EMP-401', name: 'Suresh Kumar', role: 'Chief Site Engineer', dept: 'Engineering', salary: 65000, attendance: '96%', status: 'Present' },
    { id: 'EMP-402', name: 'Meena Saxena', role: 'Head Accounts Officer', dept: 'Finance', salary: 55000, attendance: '98%', status: 'Present' },
    { id: 'EMP-403', name: 'Rohan Srivastava', role: 'Senior RERA Legal Counsel', dept: 'Legal', salary: 70000, attendance: '94%', status: 'Present' },
    { id: 'EMP-404', name: 'Deepak Maurya', role: 'Site Surveyor & Plot Manager', dept: 'Operations', salary: 40000, attendance: '92%', status: 'Present' },
  ]);

  const [expensesList, setExpensesList] = useState([
    { id: 'EXP-501', title: 'Roads & Drainage Layout Construction', category: 'Property Development', amount: 3240000, date: '2026-07-25', vendor: 'Jhunsi Infra Contractors' },
    { id: 'EXP-502', title: 'Hoarding Banners & Newspaper Ads', category: 'Marketing', amount: 1480000, date: '2026-07-20', vendor: 'Prayag Media Corp' },
    { id: 'EXP-503', title: 'Staff Monthly Payroll Salaries', category: 'Salary', amount: 1860000, date: '2026-07-31', vendor: 'Internal Bank Transfer' },
    { id: 'EXP-504', title: 'RERA Registration & Legal Filings', category: 'Property Development', amount: 1200000, date: '2026-07-15', vendor: 'UP RERA Authority' },
    { id: 'EXP-505', title: 'Civil Lines Head Office Rent & Ops', category: 'Office', amount: 600000, date: '2026-07-05', vendor: 'Civil Lines Complex' },
  ]);

  const [loansList, setLoansList] = useState([
    { id: 'LOAN-601', bank: 'SBI Commercial Bank Prayagraj', principal: 12000000, outstanding: 8820000, emi: 345000, interestRate: 9.25, status: 'Active' },
    { id: 'LOAN-602', bank: 'HDFC Land Infrastructure Loan', principal: 8000000, outstanding: 4500000, emi: 210000, interestRate: 9.50, status: 'Active' },
  ]);

  const [defaultersList, setDefaultersList] = useState([
    { name: 'Karan Mehra', phone: '9792001122', plotNo: 'B-14', projectName: 'Milestone City', emiAmount: 14500, dueDate: '2026-07-15', overdueDays: 20 },
    { name: 'Pankaj Dubey', phone: '9451889900', plotNo: 'C-02', projectName: 'Sangam Vista', emiAmount: 18000, dueDate: '2026-07-20', overdueDays: 15 },
  ]);

  const [galleryItems, setGalleryItems] = useState([
    { id: 'GAL-1', title: 'Milestone City Main Entrance Gate Construction', type: 'photo', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80', date: '2026-07-28' },
    { id: 'GAL-2', title: 'Phase 1 Plot Laying Aerial Drone Survey Video', type: 'video', url: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=800&q=80', date: '2026-07-22' },
    { id: 'GAL-3', title: 'Approved Section 143 Non-Agricultural Registry Doc', type: 'document', url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', date: '2026-07-18' },
  ]);

  // Handle PDF Export helper
  const handleExportPDF = (title: string, docId = 'VPM-REP-9021') => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("VIGYA PAURUSH MILESTONE PRIVATE LIMITED", 15, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Official Executive Statement: ${title}`, 15, 30);
    doc.text(`Document Reference ID: ${docId}`, 15, 38);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 15, 46);

    doc.setFont("helvetica", "bold");
    doc.text("Financial Ledger Highlights:", 15, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`1. Total Customer Payouts Disbursed: Rs. 12,50,000`, 20, 70);
    doc.text(`2. Total Agent Commissions Disbursed: Rs. 28,40,000`, 20, 80);
    doc.text(`3. Total Investor ROI Capital Disbursed: Rs. 42,80,000`, 20, 90);
    doc.text(`4. Total Employee Salary Outlay: Rs. 18,60,000`, 20, 100);
    doc.text(`5. Total Infrastructure Expenditures: Rs. 65,20,000`, 20, 110);
    doc.text(`6. Total Net Liquid Reserve Cashflow: Rs. 84,50,000`, 20, 120);

    doc.setFont("helvetica", "bold");
    doc.text("Verified by Director: Prabhat Gautam", 15, 140);
    doc.save(`${title.replace(/\s+/g, '_')}_${docId}.pdf`);
  };

  // Handle Excel/CSV Export helper
  const handleExportExcel = (title: string) => {
    const headers = "Category,Metric Title,Amount (INR),Status,Reference Date\n";
    const dataRows = [
      `Customers,Total Customer Payout,1250000,Verified,2026-07-31`,
      `Agents,Total Agent Commission,2840000,Verified,2026-07-31`,
      `Investors,Total Investor ROI,4280000,Verified,2026-07-31`,
      `Employees,Total Salary Payroll,1860000,Verified,2026-07-31`,
      `Expenditures,Total Company Outflow,6520000,Verified,2026-07-31`,
      `Loans & EMI,Total Bank Loan Principal,12000000,Active,2026-07-31`,
      `Cashflow,Net Liquid Operating Cash,8450000,Positive,2026-07-31`
    ].join("\n");

    const blob = new Blob([headers + dataRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `VPM_${title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations
  const totalCustomerPayout = customersList.reduce((acc, c) => acc + c.payoutReceived, 0);
  const totalAgentCommission = agentsList.reduce((acc, a) => acc + a.commissionPayout, 0);
  const totalInvestorPayout = investorsList.reduce((acc, i) => acc + i.totalPayout, 0);
  const totalInvestedCapital = investments.reduce((acc, i) => acc + i.totalInvestedAmount, 0) || 13400000;
  const totalEmployeeSalary = employeesList.reduce((acc, e) => acc + e.salary, 0) * 12;
  const totalExpensesAmount = expensesList.reduce((acc, e) => acc + e.amount, 0);
  const totalLoanAmount = loansList.reduce((acc, l) => acc + l.principal, 0);
  const activeLoansCount = loansList.filter(l => l.status === 'Active').length;
  const totalEmiCollection = loansList.reduce((acc, l) => acc + l.emi, 0);

  // Cashflow Trend Data for Recharts
  const cashflowTrendData = [
    { month: 'Apr', incoming: 4800000, outgoing: 3200000, cashAvailable: 6500000 },
    { month: 'May', incoming: 5900000, outgoing: 3800000, cashAvailable: 7200000 },
    { month: 'Jun', incoming: 6400000, outgoing: 4100000, cashAvailable: 7800000 },
    { month: 'Jul', incoming: 7800000, outgoing: 4500000, cashAvailable: 8450000 },
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 1. DASHBOARD HEADER */}
      <AdminHeader
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigateTab={(tab) => setActiveTab(tab as AdminTabType)}
        onLogout={() => onLogout ? onLogout() : (onNavigate && onNavigate('home'))}
        unreadNotificationsCount={4}
      />

      {/* BODY LAYOUT: LEFT SIDEBAR + MAIN CONTENT AREA */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto min-h-[calc(100vh-65px)]">
        
        {/* 3. LEFT SIDEBAR MENU */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onLogout={() => onLogout ? onLogout() : (onNavigate && onNavigate('home'))}
          isDarkMode={isDarkMode}
          counts={{
            customersCount: customersList.length,
            agentsCount: agentsList.length,
            investorsCount: investorsList.length,
            employeesCount: employeesList.length,
            pendingBookingsCount: bookings.filter(b => b.status === 'Pending').length,
            defaultersCount: defaultersList.length
          }}
        />

        {/* MAIN DISPLAY AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-x-hidden">
          
          {/* ========================================================================= */}
          {/* TAB 1: MAIN DASHBOARD CARDS & SUMMARY */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Executive Welcome Banner */}
              <div className={`rounded-3xl p-6 md:p-8 border shadow-xl relative overflow-hidden ${
                isDarkMode ? 'bg-slate-900 border-amber-500/40' : 'bg-white border-slate-200'
              }`}>
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                        Master Director Command Center
                      </span>
                      <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        RERA & Section 143 Compliant
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-amber-400">
                      VIGYA PAURUSH MILESTONE — Executive Admin Dashboard
                    </h2>
                    <p className="text-slate-400 text-xs mt-1 max-w-2xl">
                      Real-time enterprise overview across Prayagraj Site Projects (Milestone City Jhunsi & Prayag Royal Enclave Naini).
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleExportPDF('VPM Executive Master Financial Audit')}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Audit PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportExcel('VPM Master Financial Audit')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-95"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Export Excel</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. MAIN DASHBOARD CARDS (GRID OF 7 CORE METRIC CARDS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* CARD 1: TOTAL CUSTOMERS */}
                <div className={`rounded-3xl p-6 border transition-all space-y-4 shadow-lg ${
                  isDarkMode ? 'bg-slate-900 border-amber-500/40 hover:border-amber-400' : 'bg-white border-slate-200 hover:shadow-xl'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm">Total Customers</h3>
                        <span className="text-[10px] text-slate-400">Plot Buyers & Registry Clients</span>
                      </div>
                    </div>
                    <span className="bg-amber-500/20 text-amber-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      +18.4% MoM
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-black text-white">{customersList.length} Clients</div>
                    <div className="text-xs text-slate-400 flex justify-between">
                      <span>Total Customer Payout:</span>
                      <strong className="text-amber-400 font-extrabold">{formatINR(totalCustomerPayout)}</strong>
                    </div>
                    <div className="text-xs text-slate-400 flex justify-between">
                      <span>Monthly Growth Rate:</span>
                      <strong className="text-emerald-400 font-extrabold">+18.4% Increase</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('customers')}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      View Customers
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal('addCustomer')}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2 rounded-xl font-bold text-xs transition-transform active:scale-95 cursor-pointer"
                      title="Add Customer"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportPDF('Customer Payout Report')}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 p-2 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      title="Customer Reports"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CARD 2: TOTAL AGENTS */}
                <div className={`rounded-3xl p-6 border transition-all space-y-4 shadow-lg ${
                  isDarkMode ? 'bg-slate-900 border-indigo-500/40 hover:border-indigo-400' : 'bg-white border-slate-200 hover:shadow-xl'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm">Total Agents</h3>
                        <span className="text-[10px] text-slate-400">Channel Partners & Field Team</span>
                      </div>
                    </div>
                    <span className="bg-indigo-500/20 text-indigo-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                      38 Partners
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-black text-white">{agentsList.length} Agents</div>
                    <div className="text-xs text-slate-400 flex justify-between">
                      <span>Agent Commission Payout:</span>
                      <strong className="text-indigo-400 font-extrabold">{formatINR(totalAgentCommission)}</strong>
                    </div>
                    <div className="text-xs text-slate-400 flex justify-between">
                      <span>Active / Inactive Agents:</span>
                      <strong className="text-emerald-400 font-extrabold">3 Active / 1 Inactive</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('agents')}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      View Agents
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal('addAgent')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl font-bold text-xs transition-transform active:scale-95 cursor-pointer"
                      title="Add Agent"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportPDF('Agent Commission Report')}
                      className="bg-slate-800 hover:bg-slate-700 text-indigo-400 p-2 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      title="Agent Commission Report"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CARD 3: TOTAL INVESTORS */}
                <div className={`rounded-3xl p-6 border transition-all space-y-4 shadow-lg ${
                  isDarkMode ? 'bg-slate-900 border-emerald-500/40 hover:border-emerald-400' : 'bg-white border-slate-200 hover:shadow-xl'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm">Total Investors</h3>
                        <span className="text-[10px] text-slate-400">Fixed ROI Capital Partners</span>
                      </div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Up to 32% ROI
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-black text-white">{investorsList.length} Investors</div>
                    <div className="text-xs text-slate-400 flex justify-between">
                      <span>Total Investor Payout:</span>
                      <strong className="text-emerald-400 font-extrabold">{formatINR(totalInvestorPayout)}</strong>
                    </div>
                    <div className="text-xs text-slate-400 flex justify-between">
                      <span>Total Invested Capital:</span>
                      <strong className="text-sky-400 font-extrabold">{formatINR(totalInvestedCapital)}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('investors')}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      View Investors
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal('addInvestor')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl font-bold text-xs transition-transform active:scale-95 cursor-pointer"
                      title="Add Investor"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportPDF('Investment ROI Report')}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-400 p-2 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      title="Investment Reports"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CARD 4: TOTAL EMPLOYEES */}
                <div className={`rounded-3xl p-6 border transition-all space-y-4 shadow-lg ${
                  isDarkMode ? 'bg-slate-900 border-sky-500/40 hover:border-sky-400' : 'bg-white border-slate-200 hover:shadow-xl'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-2xl">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm">Total Employees</h3>
                        <span className="text-[10px] text-slate-400">Payroll Staff & Engineers</span>
                      </div>
                    </div>
                    <span className="bg-sky-500/20 text-sky-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-sky-500/30">
                      95.8% Attendance
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-black text-white">{employeesList.length} Employees</div>
                    <div className="text-xs text-slate-400 flex justify-between">
                      <span>Annual Salary Payout:</span>
                      <strong className="text-sky-400 font-extrabold">{formatINR(totalEmployeeSalary)}</strong>
                    </div>
                    <div className="text-xs text-slate-400 flex justify-between">
                      <span>Attendance Summary:</span>
                      <strong className="text-emerald-400 font-extrabold">95.8% Staff Present</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('employees')}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      View Employees
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal('addEmployee')}
                      className="bg-sky-600 hover:bg-sky-500 text-white p-2 rounded-xl font-bold text-xs transition-transform active:scale-95 cursor-pointer"
                      title="Add Employee"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportPDF('Payroll Summary Report')}
                      className="bg-slate-800 hover:bg-slate-700 text-sky-400 p-2 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      title="Payroll Report"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CARD 5: TOTAL EXPENDITURES */}
                <div className={`rounded-3xl p-6 border transition-all space-y-4 shadow-lg ${
                  isDarkMode ? 'bg-slate-900 border-rose-500/40 hover:border-rose-400' : 'bg-white border-slate-200 hover:shadow-xl'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm">Total Expenditures</h3>
                        <span className="text-[10px] text-slate-400">Development & Ops Cost</span>
                      </div>
                    </div>
                    <span className="bg-rose-500/20 text-rose-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-rose-500/30">
                      5 Categories
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-black text-rose-400">{formatINR(totalExpensesAmount)}</div>
                    <div className="text-[10px] text-slate-400 space-y-0.5 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                      <div className="flex justify-between"><span>Property Dev:</span><strong className="text-slate-200">₹32.4L</strong></div>
                      <div className="flex justify-between"><span>Salary:</span><strong className="text-slate-200">₹18.6L</strong></div>
                      <div className="flex justify-between"><span>Marketing:</span><strong className="text-slate-200">₹14.8L</strong></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal('addExpense')}
                      className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      + Add Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('expenses')}
                      className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      title="Expense Reports"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportExcel('Expense Data')}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-400 p-2 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      title="Export Expense Data"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CARD 6: TOTAL LOANS & EMI */}
                <div className={`rounded-3xl p-6 border transition-all space-y-4 shadow-lg ${
                  isDarkMode ? 'bg-slate-900 border-purple-500/40 hover:border-purple-400' : 'bg-white border-slate-200 hover:shadow-xl'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-2xl">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm">Total Loans & EMI</h3>
                        <span className="text-[10px] text-slate-400">Bank Project Liabilities</span>
                      </div>
                    </div>
                    <span className="bg-rose-500/20 text-rose-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
                      {defaultersList.length} Overdue
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-black text-purple-400">{formatINR(totalLoanAmount)}</div>
                    <div className="text-xs text-slate-400 flex justify-between">
                      <span>Active Facilities:</span>
                      <strong className="text-white font-extrabold">{activeLoansCount} Bank Loans</strong>
                    </div>
                    <div className="text-xs text-slate-400 flex justify-between">
                      <span>Monthly EMI Servicing:</span>
                      <strong className="text-amber-400 font-extrabold">{formatINR(totalEmiCollection)} / mo</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal('addLoan')}
                      className="bg-purple-600 hover:bg-purple-500 text-white py-2 px-3 rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0"
                    >
                      + Add Loan
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('emi')}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      EMI Collection
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal('defaultersList')}
                      className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 p-2 rounded-xl font-bold text-xs transition-colors cursor-pointer border border-rose-500/30"
                      title="Defaulters List"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

              {/* CARD 7: TOTAL CASH FLOW WITH RECHARTS AREA CHART */}
              <div className={`rounded-3xl p-6 md:p-8 border shadow-xl transition-all space-y-6 ${
                isDarkMode ? 'bg-slate-900 border-emerald-500/40' : 'bg-white border-slate-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        7. Total Cash Flow
                      </span>
                      <span className="text-slate-400 text-xs font-mono">Real-time Liquidity</span>
                    </div>
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-emerald-400" />
                      <span>Liquid Operating Cash Reserves & Net Liquidity</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportPDF('Cash Flow Report')}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Cash Flow Report</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportExcel('Cash Flow Summary')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Excel</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 font-bold">Total Cash Available</span>
                    <div className="text-2xl font-black text-emerald-400 mt-1">+₹84,50,000</div>
                    <span className="text-[10px] text-emerald-300">Reserve Ratio: 1.62x</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 font-bold">Incoming Cash (This Month)</span>
                    <div className="text-2xl font-black text-sky-400 mt-1">₹32,50,000</div>
                    <span className="text-[10px] text-sky-300">Plots + Investor Capital</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 font-bold">Outgoing Cash (This Month)</span>
                    <div className="text-2xl font-black text-rose-400 mt-1">₹18,20,000</div>
                    <span className="text-[10px] text-rose-300">Payroll + Site Construction</span>
                  </div>
                </div>

                {/* Cash Flow Area Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashflowTrendData}>
                      <defs>
                        <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v / 100000}L`} />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }} formatter={(v: any) => formatINR(Number(v))} />
                      <Area type="monotone" dataKey="incoming" name="Incoming Cash" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorIncoming)" strokeWidth={2} />
                      <Area type="monotone" dataKey="outgoing" name="Outgoing Cash" stroke="#f43f5e" fillOpacity={1} fill="url(#colorOutgoing)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CARDS 8 & 9: TOTAL INFLOW & TOTAL OUTFLOW ANALYTICS WITH MULTI-PERIODS & CHART TOGGLES */}
              <InflowOutflowAnalytics
                isDarkMode={isDarkMode}
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
              />

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CUSTOMERS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'customers' && (
            <AdminCustomerManager />
          )}

          {/* ========================================================================= */}
          {/* TAB: MULTI-LEVEL TEAM BONUS MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'mlm_team' && (
            <AdminMlmTeamManager />
          )}

          {/* ========================================================================= */}
          {/* TAB 3: AGENTS & COMMISSION MANAGEMENT TAB */}
          {/* ========================================================================= */}
          {activeTab === 'agents' && (
            <AdminAgentManager />
          )}

          {/* ========================================================================= */}
          {/* TAB 4: INVESTOR MANAGEMENT TAB */}
          {/* ========================================================================= */}
          {activeTab === 'investors' && (
            <div className={`rounded-3xl p-6 md:p-8 border shadow-xl space-y-6 ${
              isDarkMode ? 'bg-slate-900 border-emerald-500/40' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span>Fixed ROI Investor Capital & Yield Statements</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Manage Guaranteed 22.5% - 32% ROI Slabs and Profit Sharing Certificates.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('addInvestor')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Investor</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase">
                      <th className="p-3">Investor ID</th>
                      <th className="p-3">Investor Name</th>
                      <th className="p-3">Invested Capital</th>
                      <th className="p-3">Guaranteed ROI %</th>
                      <th className="p-3">Calculated ROI Payout</th>
                      <th className="p-3">Lock-in Tenure</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {investorsList.map((i) => (
                      <tr key={i.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-emerald-400 font-bold">{i.id}</td>
                        <td className="p-3 font-bold text-white">{i.name}<br/><span className="text-[10px] text-slate-400">{i.phone}</span></td>
                        <td className="p-3 font-black text-white">{formatINR(i.capital)}</td>
                        <td className="p-3 font-bold text-amber-400">{i.roiPercent}% p.a.</td>
                        <td className="p-3 font-black text-emerald-400">{formatINR(i.totalPayout)}</td>
                        <td className="p-3 text-slate-300">{i.tenure}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleExportPDF(`Investor ROI Bond Certificate - ${i.name}`, i.id)}
                            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                          >
                            ROI Certificate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: EMPLOYEES & PAYROLL TAB */}
          {/* ========================================================================= */}
          {activeTab === 'employees' && (
            <div className={`rounded-3xl p-6 md:p-8 border shadow-xl space-y-6 ${
              isDarkMode ? 'bg-slate-900 border-sky-500/40' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-sky-400" />
                    <span>Employee Directory, Attendance Logs & Monthly Payroll</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">24 Full-Time Engineers, Surveyors & Account Officers on Company Payroll.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('addEmployee')}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Employee</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase">
                      <th className="p-3">Staff ID</th>
                      <th className="p-3">Employee Name</th>
                      <th className="p-3">Designation & Dept</th>
                      <th className="p-3">Monthly Base Salary</th>
                      <th className="p-3">Attendance Ratio</th>
                      <th className="p-3 text-right">Salary Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {employeesList.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-sky-400 font-bold">{e.id}</td>
                        <td className="p-3 font-bold text-white">{e.name}</td>
                        <td className="p-3 text-slate-300">{e.role}<br/><span className="text-[10px] text-slate-500">{e.dept}</span></td>
                        <td className="p-3 font-black text-white">{formatINR(e.salary)}</td>
                        <td className="p-3 font-bold text-emerald-400">{e.attendance} Present</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleExportPDF(`Employee Salary Slip - ${e.name}`, e.id)}
                            className="bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                          >
                            Payslip PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: PLOTS INVENTORY & REAL ESTATE MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'plots' && (
            <div className={`rounded-3xl p-6 md:p-8 border shadow-xl space-y-6 ${
              isDarkMode ? 'bg-slate-900 border-amber-500/40' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Grid className="w-5 h-5 text-amber-400" />
                    <span>Real Estate Plot Inventory & Section 143 Status</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Live Plot Grid Allocation Matrix for Milestone City Jhunsi and Prayag Royal Enclave Naini.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <div key={proj.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{proj.name}</h4>
                        <span className="text-[10px] text-slate-400 block">{proj.location}</span>
                      </div>
                      <span className="bg-amber-500/20 text-amber-400 font-bold text-[10px] px-2 py-0.5 rounded">
                        {proj.availablePlots} Plots Left
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      {proj.plotsGrid.map((plot) => (
                        <div
                          key={plot.id}
                          className={`p-1.5 rounded-lg text-[10px] font-bold border ${
                            plot.status === 'available'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : plot.status === 'booked'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {plot.plotNo}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
                      <span>Rate: ₹{proj.ratePerSqft}/sq.ft</span>
                      <strong className="text-amber-400">Section 143 Approved</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: BOOKINGS APPROVAL LEDGER */}
          {/* ========================================================================= */}
          {activeTab === 'bookings' && (
            <div className={`rounded-3xl p-6 md:p-8 border shadow-xl space-y-6 ${
              isDarkMode ? 'bg-slate-900 border-amber-500/40' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                    <span>Customer Plot Booking Verification Ledger</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Review Razorpay/UPI Payment Receipts and Issue Plot Allotment Letters.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase">
                      <th className="p-3">Booking ID</th>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Project & Plot</th>
                      <th className="p-3">Total Land Price</th>
                      <th className="p-3">Deposit Paid</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Allotment Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-amber-400 font-bold">{b.id}</td>
                        <td className="p-3 font-bold text-white">{b.customerName}<br/><span className="text-[10px] text-slate-400">{b.customerPhone}</span></td>
                        <td className="p-3 text-emerald-400 font-bold">{b.plotNo} ({b.projectName})</td>
                        <td className="p-3 font-black text-white">{formatINR(b.totalPrice)}</td>
                        <td className="p-3 font-bold text-sky-400">{formatINR(b.bookingAmountPaid)}</td>
                        <td className="p-3">
                          <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleExportPDF(`Plot Allotment Certificate - ${b.customerName}`, b.id)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg text-[11px] font-black"
                          >
                            Allotment PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: LOANS & BANK LIABILITIES */}
          {/* ========================================================================= */}
          {activeTab === 'loans' && (
            <div className={`rounded-3xl p-6 md:p-8 border shadow-xl space-y-6 ${
              isDarkMode ? 'bg-slate-900 border-purple-500/40' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    <span>Bank Infrastructure Loans & EMI Obligations</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Commercial Bank Credit Facilities for Site Land Acquisition & Development.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('addLoan')}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Loan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loansList.map((l) => (
                  <div key={l.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{l.bank}</h4>
                        <span className="text-[10px] text-slate-400">Sanctioned Principal: {formatINR(l.principal)}</span>
                      </div>
                      <span className="bg-purple-500/20 text-purple-300 font-bold text-[10px] px-2.5 py-0.5 rounded">
                        {l.interestRate}% Interest p.a.
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monthly EMI Servicing:</span>
                        <strong className="text-purple-400 font-black">{formatINR(l.emi)} / mo</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Principal Outstanding:</span>
                        <strong className="text-white font-extrabold">{formatINR(l.outstanding)}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleExportPDF(`Loan Statement - ${l.bank}`, l.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-purple-400 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                      >
                        Loan Audit PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: ENTERPRISE SMART EMI ENGINE & DEFAULTERS */}
          {/* ========================================================================= */}
          {activeTab === 'emi' && (
            <AdminEmiManager isDarkMode={isDarkMode} />
          )}

          {/* ========================================================================= */}
          {/* TAB: RAZORPAY PAYMENT GATEWAY MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'payments' && (
            <AdminPaymentManager />
          )}

          {/* ========================================================================= */}
          {/* TAB: HOSTINGER MYSQL DATABASE MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'hostinger_sql' && (
            <AdminHostingerSqlManager />
          )}

          {/* ========================================================================= */}
          {/* TAB 10 & 11: INCOME, EXPENSES & CASH FLOW */}
          {/* ========================================================================= */}
          {(activeTab === 'income' || activeTab === 'expenses' || activeTab === 'cashflow') && (
            <div className={`rounded-3xl p-6 md:p-8 border shadow-xl space-y-6 ${
              isDarkMode ? 'bg-slate-900 border-amber-500/40' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-amber-400" />
                    <span>Company Financial Expenditures & Expense Log</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Categorized outlays across Site Development, Marketing, Salary & Admin Office.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal('addExpense')}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Expense</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportExcel('Company Expenses Data')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Excel</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase">
                      <th className="p-3">Expense ID</th>
                      <th className="p-3">Expense Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Vendor / Recipient</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium">
                    {expensesList.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-rose-400 font-bold">{exp.id}</td>
                        <td className="p-3 font-bold text-white">{exp.title}</td>
                        <td className="p-3">
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{exp.vendor}</td>
                        <td className="p-3 text-slate-400">{exp.date}</td>
                        <td className="p-3 font-black text-rose-400">{formatINR(exp.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 12: REPORTS SECTION */}
          {/* ========================================================================= */}
          {activeTab === 'reports' && (
            <div className={`rounded-3xl p-6 md:p-8 border shadow-xl space-y-6 ${
              isDarkMode ? 'bg-slate-900 border-amber-500/40' : 'bg-white border-slate-200'
            }`}>
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  <span>Automated Financial & Operations Report Generator</span>
                </h3>
                <p className="text-slate-400 text-xs mt-1">Export instantly formatted audit statements in PDF, Excel, and CSV formats.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Customer Report', desc: 'Complete 142 plot buyers ledger & allotment history' },
                  { name: 'Agent Report', desc: 'Channel partner commissions, sales & downline payouts' },
                  { name: 'Investor Report', desc: 'Guaranteed ROI yields & capital lock-in bonds' },
                  { name: 'Employee Report', desc: 'Staff attendance summaries & monthly payroll receipts' },
                  { name: 'Loan & EMI Report', desc: 'Commercial bank facilities & overdue EMI alerts' },
                  { name: 'Cash Flow & Income Report', desc: 'Live liquidity reserves, inflows & project costs' },
                ].map((rep, idx) => (
                  <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="font-extrabold text-white text-sm">{rep.name}</h4>
                    <p className="text-slate-400 text-[11px]">{rep.desc}</p>
                    <div className="pt-2 border-t border-slate-800 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleExportPDF(rep.name)}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-center"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportExcel(rep.name)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-center"
                      >
                        Excel / CSV
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 13: GALLERY MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'gallery' && (
            <MediaUploadManager currentUserRole="admin" isDarkMode={isDarkMode} />
          )}

          {/* ========================================================================= */}
          {/* TAB 14: NOTIFICATIONS & AUDIT TRAIL */}
          {/* ========================================================================= */}
          {activeTab === 'notifications' && (
            <div className={`rounded-3xl p-6 md:p-8 border shadow-xl space-y-6 ${
              isDarkMode ? 'bg-slate-900 border-amber-500/40' : 'bg-white border-slate-200'
            }`}>
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <span>Real-Time Audit Trail & System Alerts Log</span>
                </h3>
                <p className="text-slate-400 text-xs mt-1">Live tracking of plot reservations, payouts, legal filings, and EMI reminders.</p>
              </div>

              <div className="space-y-3">
                {[
                  { title: 'Customer Booking Verified', desc: 'Rajesh Sharma deposited ₹10,000 for Plot A-12', time: '10 mins ago', type: 'success' },
                  { title: 'EMI Overdue Notice Dispatched', desc: 'Plot P-08 EMI of ₹14,500 overdue notice sent', time: '1 hour ago', type: 'warning' },
                  { title: 'Agent Commission Released', desc: '₹22,400 released to Channel Partner Amit V.', time: '3 hours ago', type: 'info' },
                  { title: 'Section 143 Document Uploaded', desc: 'Phase 1 Registry Paper uploaded by Legal Dept', time: 'Yesterday', type: 'info' },
                ].map((n, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{n.title}</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">{n.desc}</p>
                    </div>
                    <span className="text-slate-500 text-[10px] font-mono">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: MOBILE OTP VERIFICATION & SMS GATEWAY AUDIT */}
          {/* ========================================================================= */}
          {activeTab === 'otp' && (
            <div className={`rounded-3xl p-6 md:p-8 border shadow-xl space-y-6 ${
              isDarkMode ? 'bg-slate-900 border-amber-500/40' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded">
                      Fast2SMS / MSG91 / Twilio SMS Gateway
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      DLT Gateway Active
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2.5">
                    <ShieldCheck className="w-6 h-6 text-amber-400" />
                    <span>Mobile Number Verification & OTP Management Center</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Live tracking of 6-digit verification codes, SMS delivery statuses, rate-limiting, and registration security.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportPDF('OTP_Verification_Audit_Report')}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PDF Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportExcel('OTP_Activity_Logs')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export Excel</span>
                  </button>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Total OTP Sent</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">148</span>
                  <span className="text-[9px] text-emerald-400 font-medium block">100% Unique 6-Digit</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Verified Users</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">132</span>
                  <span className="text-[9px] text-slate-400 block">89.2% Conversion</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Failed Attempts</span>
                  <span className="text-2xl font-black text-rose-400 font-mono">9</span>
                  <span className="text-[9px] text-rose-400 block">Max 5 Tries Lock</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Expired OTPs</span>
                  <span className="text-2xl font-black text-amber-500 font-mono">7</span>
                  <span className="text-[9px] text-slate-400 block">5 Min Validity</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Resend Requests</span>
                  <span className="text-2xl font-black text-sky-400 font-mono">31</span>
                  <span className="text-[9px] text-sky-400 block">30s Cooldown</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">SMS Gateway</span>
                  <span className="text-xs font-black text-emerald-400 block mt-1">Fast2SMS</span>
                  <span className="text-[9px] text-slate-400 block">Backup: MSG91</span>
                </div>
              </div>

              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search User Mobile History, Name, OTP Code..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Verification History Report generated!")}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Reports</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert("Simulating Test SMS dispatch via Fast2SMS DLT Gateway...")}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Test Gateway</span>
                  </button>
                </div>
              </div>

              {/* OTP Audit Logs Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase">
                      <th className="p-3">Log ID</th>
                      <th className="p-3">Mobile Number</th>
                      <th className="p-3">User Role / Purpose</th>
                      <th className="p-3">SMS Gateway</th>
                      <th className="p-3 text-center">6-Digit OTP</th>
                      <th className="p-3 text-center">Attempts</th>
                      <th className="p-3">Verification Status</th>
                      <th className="p-3 text-right">Time Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium bg-slate-900">
                    {[
                      { id: 'OTP-LOG-9001', phone: '+91 9876543210', role: 'Buyer (Rajesh Sharma)', gateway: 'Fast2SMS', otp: '482761', attempts: '1/5', status: 'VERIFIED', time: '5 mins ago' },
                      { id: 'OTP-LOG-9002', phone: '+91 9812345678', role: 'Agent (Amit Verma)', gateway: 'MSG91', otp: '157394', attempts: '1/5', status: 'VERIFIED', time: '12 mins ago' },
                      { id: 'OTP-LOG-9003', phone: '+91 9988776655', role: 'Investor Portal Login', gateway: 'Fast2SMS', otp: '839251', attempts: '2/5', status: 'VERIFIED', time: '35 mins ago' },
                      { id: 'OTP-LOG-9004', phone: '+91 9415000001', role: 'Registration Signup', gateway: 'Twilio', otp: '610293', attempts: '0/5', status: 'EXPIRED', time: '1 hour ago' },
                      { id: 'OTP-LOG-9005', phone: '+91 9988112233', role: 'Customer Portal Login', gateway: 'Fast2SMS', otp: '204918', attempts: '5/5 (Max)', status: 'FAILED', time: '2 hours ago' },
                    ]
                    .filter(log => !searchQuery || log.phone.includes(searchQuery) || log.role.toLowerCase().includes(searchQuery.toLowerCase()) || log.otp.includes(searchQuery))
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-mono text-slate-400 font-bold">{log.id}</td>
                        <td className="p-3 font-bold text-white font-mono">{log.phone}</td>
                        <td className="p-3 text-slate-300 font-medium">{log.role}</td>
                        <td className="p-3">
                          <span className="bg-slate-800 text-sky-300 px-2 py-0.5 rounded text-[10px] font-bold border border-sky-500/20">
                            {log.gateway}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-amber-400/10 text-amber-400 font-mono font-black px-2 py-1 rounded text-xs tracking-widest border border-amber-400/20">
                            {log.otp}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono text-slate-300 font-bold">{log.attempts}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                            log.status === 'VERIFIED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : log.status === 'EXPIRED'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {log.status === 'VERIFIED' ? '✓ Verified' : log.status === 'EXPIRED' ? '⏱ Expired (5m)' : '✕ Failed (Max Tries)'}
                          </span>
                        </td>
                        <td className="p-3 text-right text-slate-400 font-mono text-[11px]">{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 15: MULTI-LANGUAGE TRANSLATION MANAGER (i18n) */}
          {/* ========================================================================= */}
          {activeTab === 'translations' && (
            <AdminTranslationManager />
          )}

          {/* ========================================================================= */}
          {/* TAB 17: RISK FREE INVESTOR SYSTEM */}
          {/* ========================================================================= */}
          {activeTab === 'risk_free_investors' && (
            <AdminRiskFreeInvestorManager />
          )}

          {/* ========================================================================= */}
          {/* TAB 18: ENTERPRISE PERMISSION MANAGER SYSTEM (RBAC) */}
          {/* ========================================================================= */}
          {activeTab === 'permissions' && (
            <AdminPermissionManager isDarkMode={isDarkMode} />
          )}

          {/* ========================================================================= */}
          {/* TAB 16: SETTINGS, DATABASE & SECURITY */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className={`rounded-3xl p-6 md:p-8 border shadow-xl space-y-6 ${
              isDarkMode ? 'bg-slate-900 border-amber-500/40' : 'bg-white border-slate-200'
            }`}>
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-400" />
                  <span>System Security, Role-Based Access (RBAC) & MongoDB Overview</span>
                </h3>
                <p className="text-slate-400 text-xs mt-1">Configure JWT Authentication, Encryption & MongoDB Collections Schema.</p>
              </div>

              <div className="bg-gradient-to-r from-amber-500/20 via-indigo-950/80 to-slate-900 border-2 border-amber-500/40 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Enterprise Permission Manager System (19 Roles)</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Super Admin controls for assigning, editing, suspending, and revoking granular permissions across all 19 manager types.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('permissions')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shrink-0 shadow-lg"
                >
                  Launch Permission Manager
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Security & Authentication Engines</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2 bg-slate-900 rounded-xl"><span>JWT Token Auth:</span><strong className="text-emerald-400">Active (HS256)</strong></div>
                    <div className="flex justify-between p-2 bg-slate-900 rounded-xl"><span>Role-Based Access (RBAC):</span><strong className="text-amber-400">Master Admin Level</strong></div>
                    <div className="flex justify-between p-2 bg-slate-900 rounded-xl"><span>Password Encryption:</span><strong className="text-sky-400">BCrypt (Salt 12)</strong></div>
                    <div className="flex justify-between p-2 bg-slate-900 rounded-xl"><span>OTP Verification:</span><strong className="text-emerald-400">SMS / WhatsApp Gateway</strong></div>
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-sky-400" />
                    <span>MongoDB Database Collections</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {['Customers', 'Agents', 'Investors', 'Employees', 'Plots', 'Bookings', 'Loans', 'EMI', 'Income', 'Expenses', 'Gallery'].map((col, i) => (
                      <div key={i} className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300 font-bold">{col}</span>
                        <span className="text-emerald-400 font-mono text-[10px]">Connected</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* POPUP MODALS ENGINE */}
      <AdminModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSaveCustomer={(data) => setCustomersList(prev => [{ id: `CUST-${Math.floor(100+Math.random()*900)}`, payoutReceived: 0, growthPercent: 12.0, status: 'Active', ...data }, ...prev])}
        onSaveAgent={(data) => setAgentsList(prev => [{ id: `AGT-${Math.floor(100+Math.random()*900)}`, activeBookings: 1, commissionPayout: 45000, status: 'Active', ...data }, ...prev])}
        onSaveInvestor={(data) => setInvestorsList(prev => [{ id: `INV-${Math.floor(100+Math.random()*900)}`, totalPayout: (data.amount * (data.roi || 22.5)) / 100, status: 'Active', ...data }, ...prev])}
        onSaveEmployee={(data) => setEmployeesList(prev => [{ id: `EMP-${Math.floor(100+Math.random()*900)}`, attendance: '100%', status: 'Present', ...data }, ...prev])}
        onSaveExpense={(data) => setExpensesList(prev => [{ id: `EXP-${Math.floor(100+Math.random()*900)}`, date: new Date().toISOString().split('T')[0], ...data }, ...prev])}
        onSaveLoan={(data) => setLoansList(prev => [{ id: `LOAN-${Math.floor(100+Math.random()*900)}`, outstanding: data.principal, status: 'Active', ...data }, ...prev])}
        onUploadMedia={(data) => setGalleryItems(prev => [{ id: `GAL-${Math.floor(100+Math.random()*900)}`, date: new Date().toISOString().split('T')[0], url: data.url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80', ...data }, ...prev])}
        defaultersList={defaultersList}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};
