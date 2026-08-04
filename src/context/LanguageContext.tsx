import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';
import { INITIAL_TRANSLATIONS, SUPPORTED_LANGUAGES, TranslationDictionary } from '../data/translationsData';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  translations: Record<Language, TranslationDictionary>;
  updateKey: (key: string, langValues: Record<Language, string>) => void;
  addKey: (key: string, langValues: Record<Language, string>) => void;
  deleteKey: (key: string) => void;
  importTranslations: (importedData: Record<Language, TranslationDictionary>) => boolean;
  exportTranslations: () => Record<Language, TranslationDictionary>;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'vpm_app_language';
const LOCAL_STORAGE_TRANSLATIONS_KEY = 'vpm_app_custom_translations';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Auto-detect language or retrieve from localStorage
  const detectLanguage = (): Language => {
    try {
      const savedLang = localStorage.getItem(LOCAL_STORAGE_KEY) as Language;
      if (savedLang && SUPPORTED_LANGUAGES.some(l => l.code === savedLang)) {
        return savedLang;
      }

      // Browser preferred language detection
      const browserLang = (navigator.language || '').toLowerCase();
      if (browserLang.startsWith('hi')) return 'hi';
      if (browserLang.startsWith('mr')) return 'mr';
      if (browserLang.startsWith('bn')) return 'bn';
      if (browserLang.startsWith('gu')) return 'gu';
    } catch (e) {
      console.warn('LocalStorage / Browser lang detection fallback:', e);
    }
    return 'en';
  };

  const [language, setLanguageState] = useState<Language>(detectLanguage);

  // 2. Custom or merged translations state
  const [translations, setTranslations] = useState<Record<Language, TranslationDictionary>>(() => {
    try {
      const savedTranslations = localStorage.getItem(LOCAL_STORAGE_TRANSLATIONS_KEY);
      if (savedTranslations) {
        const parsed = JSON.parse(savedTranslations);
        return {
          en: { ...INITIAL_TRANSLATIONS.en, ...parsed.en },
          hi: { ...INITIAL_TRANSLATIONS.hi, ...parsed.hi },
          mr: { ...INITIAL_TRANSLATIONS.mr, ...parsed.mr },
          bn: { ...INITIAL_TRANSLATIONS.bn, ...parsed.bn },
          gu: { ...INITIAL_TRANSLATIONS.gu, ...parsed.gu },
        };
      }
    } catch (e) {
      console.warn('Error loading custom translations:', e);
    }
    return INITIAL_TRANSLATIONS;
  });

  // Handle language switching
  const setLanguage = (newLang: Language) => {
    if (!SUPPORTED_LANGUAGES.some(l => l.code === newLang)) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;

      // Update meta title and description according to language
      const titleText = translations[newLang]?.heroTitle || INITIAL_TRANSLATIONS[newLang]?.heroTitle || "VIGYA PAURUSH MILESTONE PVT LTD";
      document.title = `${titleText} | Vigya Paurush Milestone`;

      // Localized URL push state simulation
      const currentPath = window.location.pathname.replace(/^\/(en|hi|mr|bn|gu)/, '');
      const localizedPath = `/${newLang}${currentPath || '/home'}`;
      window.history.replaceState(null, '', localizedPath);
    } catch (e) {
      console.error('Error changing language:', e);
    }
  };

  // Sync html lang attribute on mount
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Translation lookup function
  const t = (key: string, fallback?: string): string => {
    const activeDict = translations[language];
    if (activeDict && activeDict[key] !== undefined && activeDict[key] !== '') {
      return activeDict[key];
    }
    // Fallback to English
    if (translations.en && translations.en[key] !== undefined && translations.en[key] !== '') {
      return translations.en[key];
    }
    return fallback || key;
  };

  // Update specific translation key across languages
  const updateKey = (key: string, langValues: Record<Language, string>) => {
    setTranslations(prev => {
      const updated = {
        en: { ...prev.en, [key]: langValues.en || prev.en[key] || '' },
        hi: { ...prev.hi, [key]: langValues.hi || prev.hi[key] || '' },
        mr: { ...prev.mr, [key]: langValues.mr || prev.mr[key] || '' },
        bn: { ...prev.bn, [key]: langValues.bn || prev.bn[key] || '' },
        gu: { ...prev.gu, [key]: langValues.gu || prev.gu[key] || '' },
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_TRANSLATIONS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save updated translations to localStorage:', e);
      }
      return updated;
    });
  };

  // Add new translation key
  const addKey = (key: string, langValues: Record<Language, string>) => {
    updateKey(key, langValues);
  };

  // Delete translation key
  const deleteKey = (key: string) => {
    setTranslations(prev => {
      const updated = { ...prev };
      (Object.keys(updated) as Language[]).forEach(lang => {
        delete updated[lang][key];
      });
      try {
        localStorage.setItem(LOCAL_STORAGE_TRANSLATIONS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save deleted key to localStorage:', e);
      }
      return updated;
    });
  };

  // Import JSON file
  const importTranslations = (importedData: Record<Language, TranslationDictionary>): boolean => {
    try {
      if (!importedData || typeof importedData !== 'object') return false;
      setTranslations(prev => {
        const merged = {
          en: { ...prev.en, ...(importedData.en || {}) },
          hi: { ...prev.hi, ...(importedData.hi || {}) },
          mr: { ...prev.mr, ...(importedData.mr || {}) },
          bn: { ...prev.bn, ...(importedData.bn || {}) },
          gu: { ...prev.gu, ...(importedData.gu || {}) },
        };
        localStorage.setItem(LOCAL_STORAGE_TRANSLATIONS_KEY, JSON.stringify(merged));
        return merged;
      });
      return true;
    } catch (e) {
      console.error('Import translation error:', e);
      return false;
    }
  };

  // Export JSON file
  const exportTranslations = (): Record<Language, TranslationDictionary> => {
    return translations;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translations,
        updateKey,
        addKey,
        deleteKey,
        importTranslations,
        exportTranslations,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
