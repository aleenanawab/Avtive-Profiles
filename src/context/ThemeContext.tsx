'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type PortfolioTheme = 'editorial' | 'cyber' | 'luxe';

interface ThemeContextType {
  theme: PortfolioTheme;
  setTheme: (theme: PortfolioTheme) => void;
  cycleTheme: () => void;
  isMounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<PortfolioTheme>('editorial');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('portfolio_theme') as PortfolioTheme;
      if (saved && (saved === 'editorial' || saved === 'cyber' || saved === 'luxe')) {
        setThemeState(saved);
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        // Default to editorial
        document.documentElement.setAttribute('data-theme', 'editorial');
      }
    } catch {
      document.documentElement.setAttribute('data-theme', 'editorial');
    }
  }, []);

  const setTheme = (newTheme: PortfolioTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('portfolio_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme in localStorage', e);
    }
  };

  const cycleTheme = () => {
    const order: PortfolioTheme[] = ['editorial', 'cyber', 'luxe'];
    const nextIndex = (order.indexOf(theme) + 1) % order.length;
    setTheme(order[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, isMounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function usePortfolioTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('usePortfolioTheme must be used within a ThemeProvider');
  }
  return context;
}
