import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AUTH_STORAGE_KEY, EMPTY_AUTH, LOGIN_MESSAGE_TYPE,
  buildLoginUrl, parseAuth, readAuth, readOnboardingSeen, writeAuth, writeOnboardingSeen,
  type AuthSnapshot, type AuthUser,
} from '@/app/lib/authStorage';

// ===========================
// Cherry Studio 账号
// ===========================
// 客户端外壳这一侧的登录态。登录本身发生在**另一个标签页**（浏览器登录页），
// 这里负责：打开那个标签页、维持等待态、收到结果后落地，以及把「是否内测账号」
// 暴露给工作模块的模型选择器。

/** 评审用的四种状态，右下角「账号演示」切换器直接跳 */
export type DemoState = 'logged-out' | 'beta' | 'standard' | 'beta-exhausted';

const DEMO_USERS: Record<Exclude<DemoState, 'logged-out'>, AuthSnapshot> = {
  beta: {
    user: { name: '用户8888', tier: 'beta', phone: '138 0000 8888' },
    quotaExhausted: false,
  },
  standard: {
    user: { name: '用户1234', tier: 'standard', phone: '138 0000 1234' },
    quotaExhausted: false,
  },
  'beta-exhausted': {
    user: { name: '用户8888', tier: 'beta', phone: '138 0000 8888' },
    quotaExhausted: true,
  },
};

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  /** 内测白名单账号 —— 决定工作模块的模型选择器里有没有 CherryAI 这一组 */
  isBeta: boolean;
  /** CherryAI 免费模型分组是否出现（未登录 / 非白名单都不出现） */
  showFreeModels: boolean;
  /** 本月免费额度是否已用完（礼物标识变灰，选中时提示） */
  quotaExhausted: boolean;

  /** 正在等浏览器那边完成登录 */
  loginPending: boolean;
  beginBrowserLogin: () => void;
  reopenLoginTab: () => void;
  cancelBrowserLogin: () => void;
  logout: () => void;

  onboardingSeen: boolean;
  completeOnboarding: () => void;
  replayOnboarding: () => void;

  demoState: DemoState;
  applyDemoState: (next: DemoState) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<AuthSnapshot>(() => readAuth());
  const [onboardingSeen, setOnboardingSeen] = useState<boolean>(() => readOnboardingSeen());
  const [loginPending, setLoginPending] = useState(false);
  const loginTabRef = useRef<Window | null>(null);

  const persist = useCallback((next: AuthSnapshot) => {
    setSnapshot(next);
    writeAuth(next);
  }, []);

  // 登录页那边落盘会触发 storage 事件；postMessage 只是让它更快一点。
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== AUTH_STORAGE_KEY) return;
      const next = parseAuth(e.newValue);
      setSnapshot(next);
      if (next.user) setLoginPending(false);
    };
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if ((e.data as { type?: string })?.type !== LOGIN_MESSAGE_TYPE) return;
      setSnapshot(readAuth());
      setLoginPending(false);
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  const openLoginTab = useCallback(() => {
    loginTabRef.current = window.open(buildLoginUrl(), '_blank');
    loginTabRef.current?.focus();
  }, []);

  const beginBrowserLogin = useCallback(() => {
    setLoginPending(true);
    openLoginTab();
  }, [openLoginTab]);

  const cancelBrowserLogin = useCallback(() => {
    setLoginPending(false);
    try {
      loginTabRef.current?.close();
    } catch {
      // 用户可能已经手动关了，忽略
    }
    loginTabRef.current = null;
  }, []);

  const logout = useCallback(() => {
    persist(EMPTY_AUTH);
    setLoginPending(false);
  }, [persist]);

  const completeOnboarding = useCallback(() => {
    setOnboardingSeen(true);
    writeOnboardingSeen(true);
    setLoginPending(false);
  }, []);

  const replayOnboarding = useCallback(() => {
    setOnboardingSeen(false);
    writeOnboardingSeen(false);
    setLoginPending(false);
  }, []);

  const demoState: DemoState = useMemo(() => {
    if (!snapshot.user) return 'logged-out';
    if (snapshot.user.tier !== 'beta') return 'standard';
    return snapshot.quotaExhausted ? 'beta-exhausted' : 'beta';
  }, [snapshot]);

  const applyDemoState = useCallback((next: DemoState) => {
    persist(next === 'logged-out' ? EMPTY_AUTH : DEMO_USERS[next]);
    setLoginPending(false);
  }, [persist]);

  const value = useMemo<AuthContextValue>(() => {
    const isLoggedIn = snapshot.user !== null;
    const isBeta = snapshot.user?.tier === 'beta';
    return {
      user: snapshot.user,
      isLoggedIn,
      isBeta,
      showFreeModels: isLoggedIn && isBeta,
      quotaExhausted: snapshot.quotaExhausted,
      loginPending,
      beginBrowserLogin,
      reopenLoginTab: openLoginTab,
      cancelBrowserLogin,
      logout,
      onboardingSeen,
      completeOnboarding,
      replayOnboarding,
      demoState,
      applyDemoState,
    };
  }, [
    snapshot, loginPending, beginBrowserLogin, openLoginTab, cancelBrowserLogin,
    logout, onboardingSeen, completeOnboarding, replayOnboarding, demoState, applyDemoState,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
