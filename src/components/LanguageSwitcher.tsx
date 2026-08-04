import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer' | 'inline' | 'compact';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'header',
  className = ''
}) => {
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];

  if (variant === 'footer') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Globe className="w-4 h-4 text-amber-400" />
          <span>Select Language / भाषा चुनें</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {supportedLanguages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as Language)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                language === lang.code
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300'
                  : 'bg-indigo-900/80 hover:bg-indigo-800 text-slate-200 border border-indigo-800'
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <span>{lang.flag}</span>
                <span className="truncate">{lang.nativeName}</span>
              </span>
              {language === lang.code && <Check className="w-3.5 h-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        {supportedLanguages.map(lang => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as Language)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              language === lang.code
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.nativeName}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-indigo-950 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-slate-300 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
        title="Select Language / भाषा चुनें"
      >
        <Globe className="w-4 h-4 text-indigo-900 shrink-0" />
        <span className="flex items-center gap-1.5">
          <span>{currentLangObj.flag}</span>
          <span>{currentLangObj.nativeName}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
          <div className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 flex items-center justify-between">
            <span>Select Language</span>
            <span className="text-amber-600 font-bold">5 Languages</span>
          </div>

          <div className="py-1">
            {supportedLanguages.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as Language);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-indigo-50/80 transition-colors cursor-pointer ${
                  language === lang.code
                    ? 'bg-indigo-50 font-black text-indigo-950'
                    : 'text-slate-700 font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{lang.flag}</span>
                  <div>
                    <div className="font-extrabold text-slate-900 leading-tight">{lang.nativeName}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{lang.label}</div>
                  </div>
                </div>
                {language === lang.code && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="px-3.5 pt-2 pb-1 border-t border-slate-100 text-[9px] text-slate-400 text-center font-bold">
            Saved in Browser Local Storage
          </div>
        </div>
      )}
    </div>
  );
};
