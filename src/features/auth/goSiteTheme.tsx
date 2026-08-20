import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import '@/styles/go-site.css';

type GoSiteTheme = 'light' | 'dark' | 'system';

interface GoSiteThemeContextValue {
  theme: GoSiteTheme;
  setTheme: (theme: GoSiteTheme) => void;
}

const THEME_STORAGE_KEY = 'theme-preference';
const GoSiteThemeContext = createContext<GoSiteThemeContextValue | null>(null);

function readTheme(): GoSiteTheme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // localStorage 不可用时跟随系统。
  }
  return 'system';
}

function resolveTheme(theme: GoSiteTheme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.toggle('light', theme === 'light');
  root.classList.toggle('dark', theme === 'dark');
}

export function GoSiteThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<GoSiteTheme>(readTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const syncTheme = () => applyTheme(resolveTheme(theme));

    syncTheme();
    mediaQuery.addEventListener('change', syncTheme);
    return () => mediaQuery.removeEventListener('change', syncTheme);
  }, [theme]);

  const setTheme = (nextTheme: GoSiteTheme) => {
    setThemeState(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // 当前页面仍然可以切换，刷新后回到系统主题。
    }
  };

  return (
    <GoSiteThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </GoSiteThemeContext.Provider>
  );
}

const THEME_OPTIONS = [
  { id: 'light', label: '浅色', Icon: Sun },
  { id: 'dark', label: '深色', Icon: Moon },
  { id: 'system', label: '跟随系统', Icon: Monitor },
] as const;

export function GoSiteThemeSelector({ className }: { className?: string }) {
  const context = useContext(GoSiteThemeContext);
  if (!context) throw new Error('GoSiteThemeSelector 必须在 GoSiteThemeProvider 内使用');

  return (
    <div
      role="group"
      aria-label="页面主题"
      className={`inline-flex h-9 items-center rounded-lg bg-secondary/50 p-1 ${className ?? ''}`}
    >
      {THEME_OPTIONS.map(({ id, label, Icon }) => {
        const active = context.theme === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={() => context.setTheme(id)}
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border transition-colors duration-200 ${
              active
                ? 'border-border bg-background text-foreground'
                : 'border-transparent text-muted-foreground hover:border-border/50 hover:bg-background/50 hover:text-foreground'
            }`}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}
