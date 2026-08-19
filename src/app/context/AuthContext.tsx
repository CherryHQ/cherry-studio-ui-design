import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AUTH_STORAGE_KEY, EMPTY_AUTH, GO_MESSAGE_TYPE, LOGIN_MESSAGE_TYPE,
  buildLoginUrl, hasStoredAuth, parseAuth, readAuth, readOnboardingSeen, writeAuth, writeOnboardingSeen,
  type AuthSnapshot, type AuthUser, type GoState,
} from '@/app/lib/authStorage';

export type { GoState };

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
    go: 'none',
  },
  standard: {
    user: { name: '用户1234', tier: 'standard', phone: '138 0000 1234' },
    quotaExhausted: false,
    go: 'none',
  },
  'beta-exhausted': {
    user: { name: '用户8888', tier: 'beta', phone: '138 0000 8888' },
    quotaExhausted: true,
    go: 'none',
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

  /** Cherry Go 订阅态（none / active / limit-5h / limit-month） */
  goState: GoState;
  /** 是否已订阅 Go（含额度打满的两种状态） */
  goSubscribed: boolean;
  /**
   * 使用限额重置 —— 客户端内直接完成，不跳网页。只对 5 小时打满有效
   * （恢复 5 小时 + 每周窗口）；月度打满不受重置影响，调了也不改状态。
   */
  resetGoQuota: () => void;
  /** 演示切换器用：直接设 Go 状态；未登录时会先落到内测账号（订阅必须先有账号） */
  applyGoDemoState: (next: GoState) => void;

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
  // 演示的默认状态就是「已登录 · 内测账号」—— 打开预览直接能看到 CherryAI 免费
  // 模型，不用先登录。首启引导页仍然从「欢迎 / 登录」第一步开始，走完整流程会
  // 覆盖成登录时填的那个账号。
  const [snapshot, setSnapshot] = useState<AuthSnapshot>(() =>
    hasStoredAuth() ? readAuth() : DEMO_USERS.beta,
  );
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
      const type = (e.data as { type?: string })?.type;
      if (type !== LOGIN_MESSAGE_TYPE && type !== GO_MESSAGE_TYPE) return;
      setSnapshot(readAuth());
      if (type === LOGIN_MESSAGE_TYPE) setLoginPending(false);
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
    // 订阅在服务端跟着账号走：退出登录不清 Go 订阅态，重新登录后自动恢复
    // （goSubscribed 要求已登录，未登录期间 Go 一律按未订阅表现）
    persist({ ...EMPTY_AUTH, go: snapshot.go });
    setLoginPending(false);
  }, [persist, snapshot.go]);

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
    // 账号维度和 Go 维度是两个开关：切账号态保留当前 Go 订阅（登出除外——订阅跟账号走）
    persist(next === 'logged-out' ? EMPTY_AUTH : { ...DEMO_USERS[next], go: snapshot.go });
    setLoginPending(false);
  }, [persist, snapshot.go]);

  const resetGoQuota = useCallback(() => {
    if (snapshot.go !== 'limit-5h') return;
    persist({ ...snapshot, go: 'active' });
  }, [persist, snapshot]);

  const applyGoDemoState = useCallback((next: GoState) => {
    // 未登录 + 切「未订阅」= 现状，别把人悄悄登录进去
    if (!snapshot.user && next === 'none') return;
    // 订阅必须先有账号：未登录时切其他 Go 状态，先落到默认的内测账号
    const base = snapshot.user ? snapshot : DEMO_USERS.beta;
    persist({ ...base, go: next });
    setLoginPending(false);
  }, [persist, snapshot]);

  const value = useMemo<AuthContextValue>(() => {
    const isLoggedIn = snapshot.user !== null;
    const isBeta = snapshot.user?.tier === 'beta';
    return {
      user: snapshot.user,
      isLoggedIn,
      isBeta,
      showFreeModels: isLoggedIn && isBeta,
      quotaExhausted: snapshot.quotaExhausted,
      goState: snapshot.go,
      // 过期不算在订阅内：客户端表现与未订阅一致（Go 组回到订阅引导行），
      // 续费入口在网页端「我的订阅」页
      goSubscribed: isLoggedIn && snapshot.go !== 'none' && snapshot.go !== 'expired',
      resetGoQuota,
      applyGoDemoState,
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
    applyGoDemoState, resetGoQuota,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
