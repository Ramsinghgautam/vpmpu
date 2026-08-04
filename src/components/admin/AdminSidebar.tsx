import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Award, 
  TrendingUp, 
  UserCheck, 
  Grid, 
  FileSpreadsheet, 
  Building2, 
  CreditCard, 
  ArrowDownLeft, 
  Receipt, 
  Wallet, 
  BarChart3, 
  Image, 
  Bell, 
  Settings, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Globe,
  Database
} from 'lucide-react';

export type AdminTabType = 
  | 'dashboard'
  | 'customers'
  | 'agents'
  | 'investors'
  | 'employees'
  | 'plots'
  | 'bookings'
  | 'loans'
  | 'emi'
  | 'income'
  | 'expenses'
  | 'payments'
  | 'cashflow'
  | 'reports'
  | 'gallery'
  | 'notifications'
  | 'settings'
  | 'otp'
  | 'translations'
  | 'hostinger_sql';

interface AdminSidebarProps {
  activeTab: AdminTabType;
  onSelectTab: (tab: AdminTabType) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  counts: {
    customersCount: number;
    agentsCount: number;
    investorsCount: number;
    employeesCount: number;
    pendingBookingsCount: number;
    defaultersCount: number;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  onLogout,
  isDarkMode,
  counts
}) => {
  const menuSections = [
    {
      title: 'CORE MANAGEMENT',
      items: [
        { id: 'dashboard' as AdminTabType, label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'customers' as AdminTabType, label: 'Customers', icon: Users, badge: `${counts.customersCount}` },
        { id: 'agents' as AdminTabType, label: 'Agents', icon: Award, badge: `${counts.agentsCount}` },
        { id: 'investors' as AdminTabType, label: 'Investors', icon: TrendingUp, badge: `${counts.investorsCount}` },
        { id: 'employees' as AdminTabType, label: 'Employees', icon: UserCheck, badge: `${counts.employeesCount}` },
      ]
    },
    {
      title: 'REAL ESTATE & SALES',
      items: [
        { id: 'plots' as AdminTabType, label: 'Plots (Inventory)', icon: Grid, badge: 'Phase 1 & 2' },
        { id: 'bookings' as AdminTabType, label: 'Bookings', icon: FileSpreadsheet, badge: counts.pendingBookingsCount ? `${counts.pendingBookingsCount} New` : null },
        { id: 'loans' as AdminTabType, label: 'Loans', icon: Building2, badge: null },
        { id: 'emi' as AdminTabType, label: 'EMI Management', icon: CreditCard, badge: counts.defaultersCount ? `${counts.defaultersCount} Due` : null, isAlert: true },
      ]
    },
    {
      title: 'FINANCE & AUDIT',
      items: [
        { id: 'payments' as AdminTabType, label: 'Razorpay Payments', icon: CreditCard, badge: 'Gateway' },
        { id: 'income' as AdminTabType, label: 'Income & Inflow', icon: ArrowDownLeft, badge: null },
        { id: 'expenses' as AdminTabType, label: 'Expenses & Outflow', icon: Receipt, badge: null },
        { id: 'cashflow' as AdminTabType, label: 'Cash Flow', icon: Wallet, badge: 'Live' },
        { id: 'reports' as AdminTabType, label: 'Reports', icon: BarChart3, badge: 'PDF/Excel' },
      ]
    },
    {
      title: 'SYSTEM & SECURITY',
      items: [
        { id: 'hostinger_sql' as AdminTabType, label: 'Hostinger MySQL Database', icon: Database, badge: '.SQL' },
        { id: 'translations' as AdminTabType, label: 'i18n Multi-Language', icon: Globe, badge: '5 Langs' },
        { id: 'otp' as AdminTabType, label: 'Mobile OTP Verification', icon: ShieldCheck, badge: 'SMS Gateway' },
        { id: 'gallery' as AdminTabType, label: 'Gallery', icon: Image, badge: 'Media' },
        { id: 'notifications' as AdminTabType, label: 'Notifications', icon: Bell, badge: 'Alerts' },
        { id: 'settings' as AdminTabType, label: 'Settings & Security', icon: Settings, badge: 'RBAC' },
      ]
    }
  ];

  return (
    <aside className={`w-full lg:w-64 shrink-0 p-4 border-r transition-colors flex flex-col justify-between ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className="space-y-6">
        
        {/* User Info Capsule */}
        <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
          isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md shrink-0">
            MD
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-extrabold text-xs block truncate text-amber-400">Prabhat Gautam</span>
            <span className="text-[10px] text-slate-400 block truncate">VPM Master Admin</span>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        </div>

        {/* Navigation Section Loops */}
        <nav className="space-y-5 text-xs font-medium">
          {menuSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1">
                {sec.title}
              </span>
              {sec.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : isDarkMode
                          ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-slate-950 text-amber-400'
                          : item.isAlert
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                            : isDarkMode
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Logout Button */}
      <div className="pt-4 mt-6 border-t border-slate-800">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold transition-all text-xs cursor-pointer border border-rose-500/20"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            <span>Logout Session</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
