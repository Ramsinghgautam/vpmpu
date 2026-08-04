import React from 'react';
import { Landmark, Phone, MapPin, Mail, Award, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface FooterProps {
  currentLang: Language;
  onNavigate: (section: string) => void;
  onOpenLegal: (type: 'privacy' | 'terms' | 'refund' | 'disclaimer') => void;
}

export const Footer: React.FC<FooterProps> = ({ currentLang, onNavigate, onOpenLegal }) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  return (
    <footer className="bg-indigo-950 text-slate-300 font-sans border-t border-indigo-900 text-xs">
      
      {/* Upper Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Company Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Landmark className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-black text-white tracking-tight">VIGYA PAURUSH MILESTONE</h3>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">PRIVATE LIMITED</p>
            </div>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            Your trusted real estate & risk-free investment milestone provider in Prayagraj. Clear Dakhil Kharij title deeds, ₹10,000 instant bookings, up to 32% ROI, and transparent agent commissions.
          </p>

          <div className="pt-2 text-[10px] text-amber-300 font-bold uppercase tracking-widest space-y-1">
            <p>CIN: U70109UP2024PTC998</p>
            <p>RERA Approved Township Developer</p>
          </div>
        </div>

        {/* Quick Navigation Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-serif font-bold text-white border-b border-indigo-900 pb-2 uppercase tracking-widest text-amber-400">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-slate-300 font-medium">
            <li><button onClick={() => onNavigate('home')} className="hover:text-amber-300 transition-colors">Home Page</button></li>
            <li><button onClick={() => onNavigate('about')} className="hover:text-amber-300 transition-colors">About Company & Vision</button></li>
            <li><button onClick={() => onNavigate('projects')} className="hover:text-amber-300 transition-colors">Township Projects</button></li>
            <li><button onClick={() => onNavigate('plot-booking')} className="hover:text-amber-300 transition-colors">Plot Booking @ ₹10,000</button></li>
            <li><button onClick={() => onNavigate('investment')} className="hover:text-amber-300 transition-colors">Risk-Free Investment Slabs</button></li>
            <li><button onClick={() => onNavigate('commission')} className="hover:text-amber-300 transition-colors">Commission & Bonus Calculator</button></li>
            <li><button onClick={() => onNavigate('career')} className="hover:text-amber-300 transition-colors">Career & Agent Registration</button></li>
          </ul>
        </div>

        {/* Legal & Policies */}
        <div className="space-y-3">
          <h4 className="text-sm font-serif font-bold text-white border-b border-indigo-900 pb-2 uppercase tracking-widest text-amber-400">
            Legal & Compliance
          </h4>
          <ul className="space-y-2 text-slate-300 font-medium">
            <li><button onClick={() => onOpenLegal('privacy')} className="hover:text-amber-300 transition-colors">Privacy Policy</button></li>
            <li><button onClick={() => onOpenLegal('terms')} className="hover:text-amber-300 transition-colors">Terms & Conditions</button></li>
            <li><button onClick={() => onOpenLegal('refund')} className="hover:text-amber-300 transition-colors">Refund & Cancellation Policy</button></li>
            <li><button onClick={() => onOpenLegal('disclaimer')} className="hover:text-amber-300 transition-colors">Legal Disclaimer</button></li>
            <li><button onClick={() => onNavigate('faq')} className="hover:text-amber-300 transition-colors">FAQ</button></li>
          </ul>
        </div>

        {/* Direct Contact Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-serif font-bold text-white border-b border-indigo-900 pb-2 uppercase tracking-widest text-amber-400">
            Corporate Office
          </h4>

          <div className="space-y-2 text-slate-300 text-xs">
            <p className="font-serif font-bold text-white">Prabhat Gautam (Director)</p>
            
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="font-mono">
                <a href="tel:7275300974" className="hover:text-amber-300 block">7275300974</a>
                <a href="tel:6394918657" className="hover:text-amber-300 block">6394918657</a>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">
                4/199 EWS AVC New Jhunsi, Prayagraj, Uttar Pradesh, India - 211019
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="bg-indigo-950 py-4 border-t border-indigo-900 text-center text-slate-400 text-[11px] font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} VIGYA PAURUSH MILESTONE PRIVATE LIMITED. All Rights Reserved.</p>
          <p className="text-slate-400 font-medium">Designed with Editorial Excellence</p>
        </div>
      </div>

    </footer>
  );
};
