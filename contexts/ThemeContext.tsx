'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'blue' | 'pink';

interface Theme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryHover: string;
  background: string;
  sidebar: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
}

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  toggleTheme: () => void;
}

const themes: Record<ThemeName, Theme> = {
  blue: {
    primary: '#79BBE3',
    primaryLight: '#A8D4F0',
    primaryDark: '#5A9BC8',
    primaryHover: '#8CC8E8',
    background: '#E8F4FA',
    sidebar: '#E8F4FA',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#D1E7F5',
  },
  pink: {
    primary: '#F8BBD0',
    primaryLight: '#FCE7F3',
    primaryDark: '#EC9BB8',
    primaryHover: '#F8BBD0',
    background: '#FCE7F3',
    sidebar: '#FCE7F3',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#F8BBD0',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize with 'blue' to avoid hydration mismatch
  // Theme will be loaded from localStorage after mount
  const [themeName, setThemeName] = useState<ThemeName>('blue');
  const [mounted, setMounted] = useState(false);
  const theme = themes[themeName];

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage if available (only on client)
    const savedTheme = localStorage.getItem('theme') as ThemeName;
    if (savedTheme && (savedTheme === 'blue' || savedTheme === 'pink')) {
      setThemeName(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-primary-light', theme.primaryLight);
    root.style.setProperty('--theme-primary-dark', theme.primaryDark);
    root.style.setProperty('--theme-primary-hover', theme.primaryHover);
    root.style.setProperty('--theme-background', theme.background);
    root.style.setProperty('--theme-sidebar', theme.sidebar);
    root.style.setProperty('--theme-card', theme.card);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-text-secondary', theme.textSecondary);
    root.style.setProperty('--theme-border', theme.border);
    
    // Save to localStorage
    localStorage.setItem('theme', themeName);
  }, [theme, themeName]);

  const setTheme = (name: ThemeName) => {
    setThemeName(name);
  };

  const toggleTheme = () => {
    setThemeName(prev => prev === 'blue' ? 'pink' : 'blue');
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
