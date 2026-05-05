import React, { createContext, useContext, useMemo, useState } from 'react';
import { defaultLanguage, Language, translations } from '../i18n/translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof translations['fr']) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language') as Language | null;
    return stored || defaultLanguage;
  });

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    localStorage.setItem('language', next);
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key: keyof typeof translations['fr']) => translations[language][key] || key,
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
