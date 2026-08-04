import React, { useState } from 'react';
import { 
  Building2, 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  ShieldCheck,
  Search as SearchIcon
} from 'lucide-react';

interface AdminHeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigateTab: (tab: string) => void;
  onLogout: () => void;
  unreadNotificationsCount: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  onNavigateTab,
  onLogout,
  unreadNotificationsCount
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const notificationsList = [
    { id: '1', title: 'New Plot Booking', desc: 'Customer Rajesh Sharma deposited ₹10,000 for Plot A-12', time: '10 mins ago', type: 'success' },
    { id: '2', title: 'EMI Due Overdue Alert', desc: 'Plot P-08 EMI of ₹14,500 is overdue by 5 days', time: '1 hour ago', type: 'warning' },
    { id: '3', title: 'Agent Commission Disbursed', desc: '₹22,400 payout released to Channel Partner Amit V.', time: '3 hours ago', type: 'info' },
    { id: '4', title: 'New Document Uploaded', desc: 'Phase 1 Registry Paper uploaded by Legal Dept', time: 'Yesterday', type: 'info' },
  ];

  return (
    <header className={`sticky top-0 z-40 px-4 sm:px-6 py-3 border-b transition-colors ${
      isDarkMode 
        ? 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-md' 
        : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left Branding: Logo + Company Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Building2 className="w-6 h-6 text-slate-950" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                ENTERPRISE ADMIN
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                SYSTEM LIVE
              </span>
            </div>
            <h1 className="text-sm font-black tracking-tight leading-tight uppercase font-sans">
              VIGYA PAURUSH MILESTONE PRIVATE LIMITED
            </h1>
          </div>
        </div>

        {/* Middle Search Bar */}
        <div className="flex-1 max-w-md mx-2 relative">
          <div className="relative">
            <SearchIcon className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Customers, Agents, Investors, Plots, EMI, Receipts..."
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                  : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: Dark/Light Mode + Notifications + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotificationsDropdown(!showNotificationsDropdown);
                setShowProfileDropdown(false);
              }}
              className={`p-2 rounded-xl border transition-all relative cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {showNotificationsDropdown && (
              <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl p-4 z-50 text-xs ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm">System Alerts & Notifications</span>
                  </div>
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {notificationsList.length} New
                  </span>
                </div>

                <div className="divide-y divide-slate-800/60 my-2 max-h-64 overflow-y-auto">
                  {notificationsList.map((notif) => (
                    <div key={notif.id} className="py-2.5 flex gap-3 hover:bg-slate-800/30 p-2 rounded-xl transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        notif.type === 'success' ? 'bg-emerald-400' : notif.type === 'warning' ? 'bg-amber-400' : 'bg-sky-400'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs">{notif.title}</h5>
                          <span className="text-[10px] text-slate-400">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{notif.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab('notifications');
                    setShowNotificationsDropdown(false);
                  }}
                  className="w-full mt-2 text-center text-xs font-bold text-amber-400 hover:text-amber-300 py-2 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition-colors"
                >
                  View All Activity Notifications →
                </button>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotificationsDropdown(false);
              }}
              className={`flex items-center gap-2 p-1.5 pr-3 rounded-2xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' 
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm">
                PG
              </div>
              <div className="hidden lg:block text-left">
                <span className="font-extrabold text-xs block leading-none">Prabhat Gautam</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Managing Director</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileDropdown && (
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-2 z-50 text-xs ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="p-3 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-extrabold text-xs">Director Access</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">prabhat@vigyapaurush.com</span>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab('settings');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800/50 text-left font-medium transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-amber-400" />
                    <span>System Settings & RBAC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab('reports');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800/50 text-left font-medium transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>Executive Audit Logs</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-left font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout Admin Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
