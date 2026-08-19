// ===========================
// Cherry Studio 账号 — 本地演示态存储
// ===========================
// 原型没有后端：登录态、内测资格、额度是否耗尽，全部落在 localStorage 上。
// 这个模块是唯一的读写入口，客户端外壳（AuthProvider）和浏览器登录页
// （LoginPage，跑在另一个标签页里）都从这里进出，两边靠 storage 事件同步。

export type AccountTier = 'beta' | 'standard';
export type LoginChannel = 'phone' | 'email';

/**
 * Cherry Go 订阅的演示态。
 * - none        未订阅（默认）—— 模型列表里 Go 组只有一行「旗舰开源模型 · 订阅」
 * - active      已订阅，额度充足
 * - limit-5h    已订阅，5 小时窗口额度打满（模型置灰，到点自动恢复）
 * - limit-month 已订阅，本月额度打满（先不做加购，锁到下月重置）
 * - expired     订阅已过期 —— Go 模型停用，「我的订阅」页引导续费
 */
export type GoState = 'none' | 'active' | 'limit-5h' | 'limit-month' | 'expired';

const GO_STATES: GoState[] = ['none', 'active', 'limit-5h', 'limit-month', 'expired'];

export interface AuthUser {
  name: string;
  /** beta = 内测白名单，能看到 CherryAI 的免费模型；standard = 普通登录用户 */
  tier: AccountTier;
  phone?: string;
  email?: string;
}

export interface AuthSnapshot {
  user: AuthUser | null;
  /** 只对 beta 账号有意义：本月免费额度是否已用完 */
  quotaExhausted: boolean;
  /** Cherry Go 订阅态 —— 跟账号走（网页端订阅后写回，客户端靠 storage 事件同步） */
  go: GoState;
}

export const AUTH_STORAGE_KEY = 'cherry-ui-auth';
export const ONBOARDING_STORAGE_KEY = 'cherry-ui-onboarding-seen';
export const LOGIN_MESSAGE_TYPE = 'cherry-ui-login-success';
/** 网页端 Go 工作台改了订阅态之后，用它通知打开它的客户端标签页 */
export const GO_MESSAGE_TYPE = 'cherry-ui-go-updated';
/** 浏览器登录页的入口参数 —— 原型是静态站，没有 SPA 路由重写，走 query 最稳 */
export const LOGIN_QUERY_FLAG = 'login';
/** 网页端 Go 工作台（订阅 / 管理 / 用量）的入口参数 */
export const GO_QUERY_FLAG = 'go';
/** 官方文档「Go 订阅模式介绍」页的入口参数 */
export const GO_DOCS_QUERY_FLAG = 'docs';
/** 模拟 Stripe Checkout 支付页的入口参数（?checkout=go） */
export const GO_CHECKOUT_QUERY_FLAG = 'checkout';
/** 「我的订阅」页（账号菜单进入的 Go 套餐管理页）的入口参数 */
export const GO_SUBSCRIPTION_QUERY_FLAG = 'subscription';

export const EMPTY_AUTH: AuthSnapshot = { user: null, quotaExhausted: false, go: 'none' };

// ===========================
// 读写
// ===========================

/** 本地是否存过账号态 —— 用来区分"没存过"（首次打开演示）和"存过未登录态" */
export function hasStoredAuth(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function readAuth(): AuthSnapshot {
  if (typeof window === 'undefined') return EMPTY_AUTH;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return EMPTY_AUTH;
    return parseAuth(raw);
  } catch {
    // 隐私模式等 localStorage 不可用的场景 —— 当作未登录
    return EMPTY_AUTH;
  }
}

/** 解析 storage 事件里的新值；解析不出来就按未登录处理 */
export function parseAuth(raw: string | null): AuthSnapshot {
  if (!raw) return EMPTY_AUTH;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthSnapshot>;
    const user = parsed.user;
    if (!user || typeof user.name !== 'string') return EMPTY_AUTH;
    return {
      user: {
        name: user.name,
        tier: user.tier === 'beta' ? 'beta' : 'standard',
        phone: user.phone,
        email: user.email,
      },
      quotaExhausted: parsed.quotaExhausted === true,
      go: GO_STATES.includes(parsed.go as GoState) ? (parsed.go as GoState) : 'none',
    };
  } catch {
    return EMPTY_AUTH;
  }
}

export function writeAuth(next: AuthSnapshot): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 写不进去就只在当前标签页内存里生效，刷新后回到未登录
  }
}

export function readOnboardingSeen(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeOnboardingSeen(seen: boolean): void {
  try {
    if (seen) localStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
    else localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // 同上，忽略
  }
}

// ===========================
// 演示规则
// ===========================
// 首批免费额度是邀请制内测，但演示里**登录进来一律按内测账号算** —— 这个原型
// 就是拿来看免费模型这条线的，用手机号尾号之类的规则区分白名单只会让人以为
// 功能坏了。要看"登录了但不在白名单"的形态，用右下角「账号演示」切换器切到
// 「已登录 · 普通账号」。

export function resolveTier(_channel: LoginChannel, _value: string): AccountTier {
  return 'beta';
}

export function deriveName(channel: LoginChannel, value: string): string {
  const v = value.trim();
  if (channel === 'phone') return `用户${v.slice(-4)}`;
  const local = v.split('@')[0] || v;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function makeUser(channel: LoginChannel, value: string): AuthUser {
  const v = value.trim();
  return {
    name: deriveName(channel, v),
    tier: resolveTier(channel, v),
    ...(channel === 'phone' ? { phone: v } : { email: v }),
  };
}

// ===========================
// 跨标签页
// ===========================

/** 当前页面是不是浏览器登录页 */
export function isLoginRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get(LOGIN_QUERY_FLAG) === '1';
}

/** 当前页面是不是网页端 Go 工作台（?go=1） */
export function isGoRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get(GO_QUERY_FLAG) === '1';
}

/** 当前页面是不是官方文档的 Go 介绍页（?docs=go） */
export function isGoDocsRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get(GO_DOCS_QUERY_FLAG) === 'go';
}

/** 当前页面是不是模拟 Stripe Checkout 支付页（?checkout=go） */
export function isGoCheckoutRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get(GO_CHECKOUT_QUERY_FLAG) === 'go';
}

/** 当前页面是不是「我的订阅」页（?subscription=1） */
export function isGoSubscriptionRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get(GO_SUBSCRIPTION_QUERY_FLAG) === '1';
}

function buildQueryUrl(key: string, value: string): string {
  const url = new URL(window.location.href);
  // 网页路由互斥，拼地址前先清掉别的 flag，避免 ?login=1&go=1 这类叠加态
  url.searchParams.delete(LOGIN_QUERY_FLAG);
  url.searchParams.delete(GO_QUERY_FLAG);
  url.searchParams.delete(GO_DOCS_QUERY_FLAG);
  url.searchParams.delete(GO_CHECKOUT_QUERY_FLAG);
  url.searchParams.delete(GO_SUBSCRIPTION_QUERY_FLAG);
  url.searchParams.set(key, value);
  url.hash = '';
  return url.toString();
}

/** 客户端点「登录 Cherry Studio」时要打开的地址 */
export function buildLoginUrl(): string {
  return buildQueryUrl(LOGIN_QUERY_FLAG, '1');
}

/** 所有「订阅 Go / 查看套餐 / 前往网页端」入口打开的地址 */
export function buildGoPageUrl(): string {
  return buildQueryUrl(GO_QUERY_FLAG, '1');
}

/** 「查看详情」打开的官方文档 Go 介绍页 */
export function buildGoDocsUrl(): string {
  return buildQueryUrl(GO_DOCS_QUERY_FLAG, 'go');
}

/** Go 介绍页点「订阅」后同标签页跳转的支付页（模拟 Stripe Checkout） */
export function buildGoCheckoutUrl(): string {
  return buildQueryUrl(GO_CHECKOUT_QUERY_FLAG, 'go');
}

/** 账号菜单「我的订阅」进入的 Go 套餐管理页 */
export function buildGoSubscriptionUrl(): string {
  return buildQueryUrl(GO_SUBSCRIPTION_QUERY_FLAG, '1');
}

/** 网页端右上角账号菜单的退出登录 —— 只清账号，订阅态跟账号走、重登后恢复 */
export function completeWebLogout(): AuthSnapshot {
  const snapshot: AuthSnapshot = { ...readAuth(), user: null, quotaExhausted: false };
  writeAuth(snapshot);
  return snapshot;
}

/**
 * 登录页调用：落盘 + 通知打开它的那个标签页。
 * 落盘会在其他标签页触发 storage 事件，所以即使 opener 丢了（比如用户是手动
 * 打开这个地址的），客户端那边也能收到。
 */
export function completeBrowserLogin(channel: LoginChannel, value: string): AuthUser {
  const user = makeUser(channel, value);
  // 重新登录不动 Go 订阅态 —— 订阅跟账号走，演示里视为同一个账号
  writeAuth({ user, quotaExhausted: false, go: readAuth().go });
  try {
    window.opener?.postMessage({ type: LOGIN_MESSAGE_TYPE, user }, window.location.origin);
  } catch {
    // 跨源或 opener 已关闭 —— storage 事件兜底
  }
  return user;
}

/**
 * 网页端 Go 工作台调用：改订阅态并通知客户端标签页。
 * 和登录一样，落盘触发 storage 事件兜底，postMessage 只是更快。
 */
export function completeGoStateChange(next: GoState): AuthSnapshot {
  const snapshot: AuthSnapshot = { ...readAuth(), go: next };
  writeAuth(snapshot);
  try {
    window.opener?.postMessage({ type: GO_MESSAGE_TYPE, go: next }, window.location.origin);
  } catch {
    // 同上
  }
  return snapshot;
}
