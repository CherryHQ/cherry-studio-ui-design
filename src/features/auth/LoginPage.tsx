import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import {
  Button, Checkbox, Input,
  Popover, PopoverTrigger, PopoverContent,
} from '@cherry-studio/ui';
import cherryLogoImg from '@/assets/cherry-icon.png';
import { completeBrowserLogin } from '@/app/lib/authStorage';
import { GoSiteThemeSelector } from './goSiteTheme';

// ===========================
// 浏览器登录页（?login=1）
// ===========================
// 客户端点「登录 Cherry Studio」后新开标签页打开的**网页**，不套客户端外壳。
// 登录成功后写本地态、通知打开它的那个标签页，然后自己关掉 —— 对应真实产品
// 里"跳浏览器授权 → 回跳客户端"的那一段。
//
// 版式参考千问办公的登录卡：左对齐的品牌区 + 大标题、两个"一体式"输入框
// （区号 / 获取验证码用竖分隔线并进同一个框），协议勾选沉到卡片底部。
// 这是独立网页，不是应用内表单，所以控件比应用里大一号（h-11、text-sm/2xl）。
//
// 只做手机号登录：不做「扫码登录」分段，也不做单点登录（SSO）。
// authStorage 里仍保留 email 通道（账号页按绑定的那一个展示），以后要加邮箱登录
// 不用动数据结构。

const COUNTDOWN_SECONDS = 60;
const AREA_CODES = ['+86', '+852', '+886', '+1'];
const PHONE_RE = /^1\d{10}$/;

type Stage = 'form' | 'success';

export function LoginPage() {
  const [areaCode, setAreaCode] = useState('+86');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(true); // 预勾选
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('form');
  const [canClose, setCanClose] = useState(true);
  const timerRef = useRef<number | null>(null);

  const identifier = phone.replace(/\s/g, '');
  const identifierValid = PHONE_RE.test(identifier);
  const codeValid = code.length === 6;

  useEffect(() => {
    if (countdown <= 0) return;
    timerRef.current = window.setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [countdown]);

  const sendCode = useCallback(() => {
    if (!identifierValid || countdown > 0) return;
    setSentAt(Date.now());
    setCountdown(COUNTDOWN_SECONDS);
    setError(null);
  }, [identifierValid, countdown]);

  const submit = useCallback(() => {
    if (!identifierValid || !codeValid || !agreed) return;
    // 演示：任意 6 位数字都能通过，000000 走错误态
    if (code === '000000') {
      setError('验证码错误，请重新输入');
      setCode('');
      return;
    }
    completeBrowserLogin('phone', identifier);
    setStage('success');
  }, [identifierValid, codeValid, agreed, code, identifier]);

  // 成功后自己关掉标签页；不是被 window.open 打开的标签页关不掉，就提示手动关闭
  useEffect(() => {
    if (stage !== 'success') return;
    const t = window.setTimeout(() => {
      window.close();
      window.setTimeout(() => setCanClose(false), 400);
    }, 1400);
    return () => window.clearTimeout(t);
  }, [stage]);

  if (stage === 'success') {
    return (
      <Page>
        <Card>
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <span className="w-11 h-11 rounded-full bg-success/10 flex items-center justify-center">
              <Check size={22} className="text-success" strokeWidth={2.4} />
            </span>
            <p className="text-base font-medium text-foreground">登录成功</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 size={12} className="animate-spin" />
              正在返回 Cherry Studio…
            </p>
            {!canClose && (
              <p className="text-xs text-muted-foreground/50">已在客户端登录，可以关闭此页面了</p>
            )}
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <Card>
        {/* 品牌 —— 左对齐 */}
        <img src={cherryLogoImg} alt="Cherry Studio" className="w-10 h-10 rounded-xl" />
        <h1 className="mt-6 text-2xl font-semibold text-foreground">
          欢迎使用 Cherry Studio
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">你的一站式全能 AI 工作台</p>

        {/* 表单 —— 只做手机号登录 */}
        <div className="mt-8 flex flex-col gap-3">
          {/* 手机号：区号和输入框并进同一个框，中间竖分隔线 */}
          <Field>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label="选择国家/地区区号"
                  className="h-full pl-4 pr-3 flex items-center gap-1 text-base text-foreground rounded-l-[var(--radius-button)] hover:bg-accent/60 transition-colors"
                >
                  {areaCode}
                  <ChevronDown size={12} className="text-muted-foreground/60" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="go-site w-[96px] p-1"
                style={{ backgroundColor: 'var(--popover)' }}
              >
                {AREA_CODES.map(c => (
                  <button
                    key={c}
                    onClick={() => setAreaCode(c)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors ${
                      c === areaCode ? 'text-foreground bg-accent/50' : 'text-muted-foreground hover:bg-accent/30'
                    }`}
                  >
                    {c}
                    {c === areaCode && <Check size={11} />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            <Divider />
            <Input
              type="tel"
              inputMode="numeric"
              autoFocus
              aria-label="手机号码"
              placeholder="请输入手机号码"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="h-full flex-1 border-0 bg-transparent pl-3 pr-4 text-base shadow-none focus-visible:ring-0"
            />
          </Field>

          {/* 验证码：输入框 + 右侧「获取验证码」，同一个框 */}
          <Field>
            <Input
              inputMode="numeric"
              aria-label="验证码"
              placeholder="请输入验证码"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && submit()}
              className="h-full flex-1 border-0 bg-transparent pl-4 pr-3 text-base tracking-[1px] shadow-none focus-visible:ring-0"
            />
            <Divider />
            <button
              onClick={sendCode}
              disabled={!identifierValid || countdown > 0}
              className="h-full pl-3 pr-4 text-base text-cherry-primary tabular-nums rounded-r-[var(--radius-button)] transition-colors hover:bg-accent/60 disabled:text-muted-foreground disabled:hover:bg-transparent"
            >
              {countdown > 0 ? `${countdown}s 后重发` : sentAt ? '重新发送' : '获取验证码'}
            </button>
          </Field>

          {/* 提示 / 错误 */}
          <div className="min-h-4">
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : sentAt ? (
              <p className="text-xs text-muted-foreground">
                验证码已发送至 {areaCode} {identifier}
              </p>
            ) : null}
          </div>

          <Button
            size="lg"
            onClick={submit}
            disabled={!identifierValid || !codeValid || !agreed}
            className="w-full text-base disabled:opacity-40"
          >
            登录
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            未注册的手机号码将自动注册 Cherry Studio 账号并登录
          </p>
        </div>

        {/* 协议 —— 沉到卡片底部，默认预勾选。
            font-normal 不能省：theme.css 给 label 兜了 font-weight: medium，不覆盖这行会比上下
            两行同为 11px 的说明文案重一档，中文在这个字号下尤其明显。 */}
        <label className="mt-8 flex items-center justify-center gap-2 cursor-pointer">
          <Checkbox
            checked={agreed}
            onCheckedChange={v => setAgreed(v === true)}
            className="size-3.5 rounded-[var(--radius-dot)] data-[state=checked]:border-cherry-primary data-[state=checked]:bg-cherry-primary"
          />
          <span className="text-xs font-normal text-muted-foreground/60">
            阅读并同意
            <a href="#" onClick={e => e.preventDefault()} className="text-cherry-primary hover:underline">《服务协议》</a>
            和
            <a href="#" onClick={e => e.preventDefault()} className="text-cherry-primary hover:underline">《隐私政策》</a>
          </span>
        </label>
      </Card>

      {/* 演示说明 —— 真实产品不会有这块 */}
      <p className="mt-4 w-[400px] text-center text-xs leading-relaxed text-muted-foreground/40">
        原型演示：手机号随便填（11 位、1 开头），验证码填任意 6 位数字（<span className="font-mono">000000</span> 走错误态）。
      </p>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="go-site relative min-h-screen w-full flex flex-col items-center justify-center bg-app-bg px-4 py-10">
      <GoSiteThemeSelector className="absolute right-4 top-4" />
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[400px] rounded-[var(--radius-card)] border border-section-border bg-card px-8 pt-10 pb-8 shadow-sm">
      {children}
    </div>
  );
}

// 一体式输入框：内部元素自己不带边框，靠这层的边框和竖分隔线拼起来。
// 边框规格照抄 ui/input.tsx（border-[1.5px] border-input），聚焦态用 --ring；
// 聚焦底色用 input-background 而不是 card —— 深色下 card 比 muted 暗，用 card 会让
// 「聚焦」变成「输入框消失」。
function Field({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center h-11 rounded-[var(--radius-button)] border-[1.5px] border-input bg-muted/50 transition-colors focus-within:border-ring focus-within:bg-input-background">
      {children}
    </div>
  );
}

function Divider() {
  return <span className="h-5 w-px bg-border/60 shrink-0" />;
}
