import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '../theme';

const ThemeContext = createContext(null);
const THEME_KEY = '@ala_light_mode';

export function ThemeProvider({ children }) {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((value) => {
      if (value === 'true') setIsLightMode(true);
    });
  }, []);

  const setLightMode = (value) => {
    setIsLightMode(value);
    AsyncStorage.setItem(THEME_KEY, value ? 'true' : 'false');
  };

  const value = useMemo(
    () => ({
      ...getTheme(!isLightMode),
      isLightMode,
      setLightMode,
      toggleLightMode: () => setLightMode(!isLightMode),
    }),
    [isLightMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
