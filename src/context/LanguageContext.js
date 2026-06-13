import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import T from '../i18n/translations';

const LANG_KEY = '@invoice_creator_language';
const DEFAULT_LANG = 'fr';

const LanguageContext = createContext();

function interpolate(str, params) {
  if (!params) return str;
  return Object.entries(params).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), v != null ? String(v) : ''),
    str,
  );
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANG);

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((stored) => {
      if (stored) setLanguageState(stored);
    });
  }, []);

  const setLanguage = useCallback((code) => {
    setLanguageState(code);
    AsyncStorage.setItem(LANG_KEY, code);
  }, []);

  const t = useCallback((key, params) => {
    const entry = T[key];
    if (!entry) return key;
    const val = entry[language] || entry.fr || key;
    return interpolate(val, params);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
