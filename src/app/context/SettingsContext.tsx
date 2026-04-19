import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// ===========================
// Types
// ===========================
export interface AppSettings {
  language: string;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  transparency: boolean;
  zoom: number;
  globalFont: string;
  codeFont: string;
  // System
  launchAtLogin: boolean;
  minimizeToTray: boolean;
  closeToTray: boolean;
  showTrayIcon: boolean;
  proxyMode: string;
  hwAccel: boolean;
  spellCheck: boolean;
  // Privacy
  anonymousData: boolean;
  devMode: boolean;
  // Custom CSS
  customCSS: string;
}

type UpdateSettingFn = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;

const defaultSettings: AppSettings = {
  language: 'zh-CN',
  theme: 'dark',
  accentColor: 'neutral',
  transparency: true,
  zoom: 100,
  globalFont: 'system',
  codeFont: 'jetbrains',
  launchAtLogin: false,
  minimizeToTray: false,
  closeToTray: true,
  showTrayIcon: true,
  proxyMode: 'system',
  hwAccel: false,
  spellCheck: true,
  anonymousData: true,
  devMode: false,
  customCSS: "/* 在这里写自定义 CSS */\nbody { font-family: 'Inter', sans-serif; }",
};

// ===========================
// Split Contexts for performance
// ===========================
// SettingsStateContext: triggers re-render when any setting changes
// SettingsDispatchContext: stable reference, never triggers re-render
// ResolvedThemeContext: only re-renders when resolved theme changes

const SettingsStateContext = createContext<AppSettings>(defaultSettings);
const SettingsDispatchContext = createContext<UpdateSettingFn>(() => {});
const ResolvedThemeContext = createContext<'light' | 'dark'>('dark');

/**
 * Combined hook — backward compatible.
 * Returns settings, updateSetting, and resolvedTheme.
 */
export function useSettings() {
  return {
    settings: useContext(SettingsStateContext),
    updateSetting: useContext(SettingsDispatchContext),
    resolvedTheme: useContext(ResolvedThemeContext),
  };
}

/**
 * Hook for reading settings state only.
 * Use when you only need to read settings values.
 */
export function useSettingsState(): AppSettings {
  return useContext(SettingsStateContext);
}

/**
 * Hook for dispatching setting updates only.
 * Components that only change settings (never read them) should use this
 * to avoid unnecessary re-renders.
 */
export function useUpdateSetting(): UpdateSettingFn {
  return useContext(SettingsDispatchContext);
}

/**
 * Hook for resolved theme only.
 * Use when component only cares about light/dark.
 */
export function useResolvedTheme(): 'light' | 'dark' {
  return useContext(ResolvedThemeContext);
}

// ===========================
// Accent color mappings
// ===========================
const ACCENT_MAP: Record<string, { main: string; light: string; dark: string; ring: string }> = {
  neutral: { main: '#323232', light: '#9ca3af', dark: '#4b5563', ring: 'rgba(107,114,128,0.2)' },
  green:   { main: '#00b96b', light: '#6ee7b7', dark: '#059669', ring: 'rgba(0,185,107,0.2)' },
  coral:   { main: '#FF5470', light: '#fca5b5', dark: '#e0394f', ring: 'rgba(255,84,112,0.2)' },
  teal:    { main: '#14B8A6', light: '#5eead4', dark: '#0d9488', ring: 'rgba(20,184,166,0.2)' },
  indigo:  { main: '#6366F1', light: '#a5b4fc', dark: '#4f46e5', ring: 'rgba(99,102,241,0.2)' },
  purple:  { main: '#8B5CF6', light: '#c4b5fd', dark: '#7c3aed', ring: 'rgba(139,92,246,0.2)' },
  pink:    { main: '#EC4899', light: '#f9a8d4', dark: '#db2777', ring: 'rgba(236,72,153,0.2)' },
  blue:    { main: '#3B82F6', light: '#93c5fd', dark: '#2563eb', ring: 'rgba(59,130,246,0.2)' },
  amber:   { main: '#F59E0B', light: '#fcd34d', dark: '#d97706', ring: 'rgba(245,158,11,0.2)' },
  violet:  { main: '#6D28D9', light: '#a78bfa', dark: '#5b21b6', ring: 'rgba(109,40,217,0.2)' },
  sky:     { main: '#0EA5E9', light: '#7dd3fc', dark: '#0284c7', ring: 'rgba(14,165,233,0.2)' },
  marine:  { main: '#0284C7', light: '#38bdf8', dark: '#0369a1', ring: 'rgba(2,132,199,0.2)' },
};

// ===========================
// Font family mappings
// ===========================
const FONT_MAP: Record<string, string> = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  inter: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  'noto-sans': '"Noto Sans SC", "Noto Sans", sans-serif',
  pingfang: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
};

const CODE_FONT_MAP: Record<string, string> = {
  jetbrains: '"JetBrains Mono", monospace',
  fira: '"Fira Code", monospace',
  cascadia: '"Cascadia Code", monospace',
  'source-code': '"Source Code Pro", monospace',
};

// ===========================
// Provider
// ===========================
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Resolve theme (handle 'system')
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    settings.theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : settings.theme;

  // Apply dark class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  // Apply zoom
  useEffect(() => {
    const el = document.getElementById('cherry-app-root');
    if (el) {
      el.style.zoom = settings.zoom === 100 ? '' : `${settings.zoom / 100}`;
    }
  }, [settings.zoom]);

  // Apply global font
  useEffect(() => {
    const el = document.getElementById('cherry-app-root');
    if (el) {
      el.style.fontFamily = FONT_MAP[settings.globalFont] || '';
    }
  }, [settings.globalFont]);

  // Apply code font via CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--cherry-code-font',
      CODE_FONT_MAP[settings.codeFont] || '"JetBrains Mono", monospace'
    );
  }, [settings.codeFont]);

  // Apply accent color CSS custom properties
  useEffect(() => {
    const accent = ACCENT_MAP[settings.accentColor] || ACCENT_MAP.neutral;
    const root = document.documentElement;
    root.style.setProperty('--cherry-accent', accent.main);
    root.style.setProperty('--cherry-accent-light', accent.light);
    root.style.setProperty('--cherry-accent-dark', accent.dark);
    root.style.setProperty('--cherry-accent-ring', accent.ring);
    // --primary 和 --primary-foreground 由 theme.css 定义，不在 JS 中覆盖
  }, [settings.accentColor]);

  // Apply custom CSS
  useEffect(() => {
    let styleEl = document.getElementById('cherry-custom-css') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'cherry-custom-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = settings.customCSS;
    return () => {
      // Don't remove on cleanup - keep it persistent
    };
  }, [settings.customCSS]);

  return (
    <SettingsDispatchContext.Provider value={updateSetting}>
      <SettingsStateContext.Provider value={settings}>
        <ResolvedThemeContext.Provider value={resolvedTheme}>
          {children}
        </ResolvedThemeContext.Provider>
      </SettingsStateContext.Provider>
    </SettingsDispatchContext.Provider>
  );
}
