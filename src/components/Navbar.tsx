import React, { useState } from 'react';
import { Phone, MapPin, Globe, ChevronDown, User, ShieldCheck, Menu, X, Landmark, Award, Calculator, MessageSquare } from 'lucide-react';
import { Language, UserRole } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  currentUserRole: UserRole | null;
  currentUserName: string | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  activeSection,
  onNavigate,
  currentUserRole,
  currentUserName,
  onOpenAuth,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [desktopLangOpen, setDesktopLangOpen] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { code: 'bn', label: 'বাংলা (Bengali)', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी (Marathi)', flag: '🇮🇳' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  ];

  const navItems = [
    { id: 'home', label: t.home },
    { id: 'about', label: t.aboutUs },
    { id: 'projects', label: t.projects },
    { id: 'plot-booking', label: t.plotBooking },
    { id: 'investment', label: t.investmentPlans },
    { id: 'commission', label: t.commissionPlans },
    { id: 'career', label: t.careerAgent },
    { id: 'gallery', label: t.gallery || 'Media Gallery' },
    { id: 'faq', label: t.faq },
    { id: 'contact', label: t.contactUs }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs font-sans">
      {/* Top Banner - Editorial Indigo Navy & Gold Bar */}
      <div className="bg-indigo-950 text-slate-200 text-xs py-2 px-4 border-b border-indigo-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              ISO Certified & RERA Approved Township
            </span>
            <span className="hidden sm:inline text-indigo-800">|</span>
            <a href="tel:7275300974" className="flex items-center gap-1 hover:text-amber-300 transition-colors text-[11px] font-medium">
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.phone}</span>
            </a>
            <span className="hidden sm:inline text-indigo-800">|</span>
            <span className="hidden lg:flex items-center gap-1 text-slate-300 truncate max-w-xs text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{t.address}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct WhatsApp Quick Call */}
            <a
              href="https://wa.me/917275300974?text=Hello%20Vigya%20Paurush%20Milestone,%20I%20am%20interested%20in%20plotting%20details."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Main Brand & Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-950 flex items-center justify-center text-amber-400 shadow-md border border-indigo-900 group-hover:bg-indigo-900 transition-colors">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg lg:text-xl font-black text-indigo-950 tracking-tight leading-none group-hover:text-amber-600 transition-colors font-serif">
              VIGYA PAURUSH MILESTONE
            </h1>
            <p className="text-[10px] sm:text-xs text-amber-600 font-bold tracking-widest uppercase mt-0.5">
              PRIVATE LIMITED
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSection === item.id
                  ? 'bg-indigo-950 text-amber-400 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-indigo-950 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Main Navbar Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setDesktopLangOpen(!desktopLangOpen)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-indigo-950 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors border border-slate-200 cursor-pointer"
              title="Select Language / भाषा चुनिए"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-900" />
              <span>{languages.find(l => l.code === currentLang)?.flag}</span>
              <span>{currentLang.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {desktopLangOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Language / भाषा चुनें
                </div>
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setDesktopLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                      currentLang === lang.code ? 'text-indigo-950 font-black bg-indigo-50/70' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                    {currentLang === lang.code && <span className="text-amber-600 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('plot-booking')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            {t.bookPlotBtn}
          </button>

          {currentUserRole ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate(currentUserRole === 'admin' ? 'admin-dashboard' : 'dashboard')}
                className="bg-indigo-950 hover:bg-indigo-900 text-white px-3.5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-indigo-900 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentUserName || 'Account'}</span>
                <span className="bg-amber-500 text-slate-950 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">
                  {currentUserRole}
                </span>
              </button>
              <button
                onClick={onLogout}
                className="text-[11px] font-bold text-rose-600 uppercase tracking-wider hover:bg-rose-50 px-2.5 py-2 rounded cursor-pointer"
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="border border-slate-300 hover:border-indigo-900 hover:bg-slate-50 text-indigo-950 px-3.5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-indigo-900" />
              {t.loginSignup}
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 text-indigo-950 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-indigo-950 border-t border-indigo-900 text-slate-200 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          <div className="grid grid-cols-1 gap-1 font-bold text-xs uppercase tracking-wider">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3.5 py-2.5 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'hover:bg-indigo-900 text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Language Selector Grid */}
          <div className="pt-3 border-t border-indigo-900">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Select Language / भाषा चुनें</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    currentLang === lang.code
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-indigo-900/80 text-slate-200 hover:bg-indigo-800 border border-indigo-800'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="truncate">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-indigo-900 flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate('plot-booking');
                setMobileMenuOpen(false);
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 py-3 rounded-lg text-xs font-bold uppercase tracking-widest shadow flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {t.bookPlotBtn}
            </button>

            {currentUserRole ? (
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => {
                    onNavigate(currentUserRole === 'admin' ? 'admin-dashboard' : 'dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-indigo-900 text-amber-400 py-2.5 rounded-lg text-xs font-bold border border-indigo-800 flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {currentUserName} ({currentUserRole.toUpperCase()})
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-rose-950 text-rose-300 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-indigo-900 hover:bg-indigo-850 text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest border border-indigo-800 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-amber-400" />
                {t.loginSignup}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
