import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'deep-space' | 'report-light';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isReportLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_STORAGE_KEY = 'openfair_app_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'report-light' || saved === 'deep-space') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'deep-space';
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }

    const root = document.documentElement;
    if (theme === 'report-light') {
      root.classList.remove('dark', 'theme-deep-space');
      root.classList.add('light', 'theme-report-light');
      root.setAttribute('data-theme', 'report-light');
      root.style.colorScheme = 'light';
    } else {
      root.classList.remove('light', 'theme-report-light');
      root.classList.add('dark', 'theme-deep-space');
      root.setAttribute('data-theme', 'deep-space');
      root.style.colorScheme = 'dark';
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'deep-space' ? 'report-light' : 'deep-space'));
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isReportLight: theme === 'report-light'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
