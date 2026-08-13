import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import {
  Button, Checkbox, Input,
  InputOTP, InputOTPGroup, InputOTPSlot,
  Popover, PopoverTrigger, PopoverContent,
} from '@cherry-studio/ui';
import cherryLogoImg from '@/assets/cherry-icon.png';
import { completeBrowserLogin, type LoginChannel } from '@/app/lib/authStorage';

// ===========================
// 浏览器登录页（?login=1）
// ===========================
// 客户端点「登录 Cherry Studio」后新开标签页打开的**网页**，不套客户端外壳。
// 登录成功后写本地态、通知打开它的那个标签页，然后自己关掉 —— 对应真实产品
// 里"跳浏览器授权 → 回跳客户端"的那一段。

const COUNTDOWN_SECONDS = 60;

const AREA_CODES = ['+86', '+852', '+886', '+1'];

const PHONE_RE = /^1\d{10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Stage = 'form' | 'success';

export function LoginPage() {
  const [channel, setChannel] = useState<LoginChannel>('phone');
  const [areaCode, setAreaCode] = useState('+86');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(true); // 预勾选
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('form');
  const [canClose, setCanClose] = useState(true);
  const timerRef = useRef<number | null>(null);

  const identifier = channel === 'phone' ? phone.replace(/\s/g, '') : email.trim();
  const identifierValid = channel === 'phone' ? PHONE_RE.test(identifier) : EMAIL_RE.test(identifier);
  const codeValid = code.length === 6;

  // 重发倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    timerRef.current = window.setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [countdown]);

  // 换登录方式时清掉上一次的输入痕迹
  const switchChannel = (next: LoginChannel) => {
    if (next === channel) return;
    setChannel(next);
    setCode('');
    setError(null);
    setSentAt(null);
    setCountdown(0);
  };

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
    completeBrowserLogin(channel, identifier);
    setStage('success');
  }, [identifierValid, codeValid, agreed, code, channel, identifier]);

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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-app-bg px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="w-11 h-11 rounded-full bg-success/10 flex items-center justify-center">
            <Check size={22} className="text-success" strokeWidth={2.4} />
          </span>
          <h1 className="text-base font-medium text-foreground">登录成功</h1>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 size={12} className="animate-spin" />
            正在返回 Cherry Studio…
          </p>
          {!canClose && (
            <p className="text-xs text-muted-foreground/60">已在客户端登录，可以关闭此页面了</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-app-bg px-4 py-10">
      <div className="w-full max-w-[400px] flex flex-col gap-6">
        {/* 品牌 */}
        <div className="flex flex-col items-center gap-3 text-center">
          <img src={cherryLogoImg} alt="Cherry Studio" className="w-12 h-12 rounded-xl" />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-foreground">登录 Cherry Studio</h1>
            <p className="text-xs text-muted-foreground">登录后自动返回客户端，继续未完成的设置</p>
          </div>
        </div>

        {/* 手机号 / 邮箱 */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50">
          {([
            { id: 'phone' as const, label: '手机号' },
            { id: 'email' as const, label: '邮箱' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => switchChannel(tab.id)}
              className={`flex-1 h-8 rounded-lg text-xs transition-colors ${
                channel === tab.id
                  ? 'bg-background text-foreground shadow-sm font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {/* 账号输入 */}
          {channel === 'phone' ? (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 px-3 gap-1 text-sm font-normal">
                    {areaCode}
                    <ChevronDown size={12} className="text-muted-foreground/60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[104px] p-1">
                  {AREA_CODES.map(c => (
                    <button
                      key={c}
                      onClick={() => setAreaCode(c)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors ${
                        c === areaCode ? 'text-cherry-primary bg-cherry-active-bg' : 'text-foreground/85 hover:bg-accent/40'
                      }`}
                    >
                      {c}
                      {c === areaCode && <Check size={12} />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
              <Input
                type="tel"
                inputMode="numeric"
                autoFocus
                placeholder="请输入手机号"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="h-10 flex-1 text-sm"
              />
            </div>
          ) : (
            <Input
              type="email"
              autoFocus
              placeholder="请输入邮箱地址"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-10 text-sm"
            />
          )}

          {/* 验证码 */}
          <div className="flex items-center gap-2">
            <InputOTP maxLength={6} value={code} onChange={setCode} containerClassName="flex-1">
              <InputOTPGroup className="w-full">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <InputOTPSlot key={i} index={i} className="h-10 flex-1" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <Button
              variant="outline"
              onClick={sendCode}
              disabled={!identifierValid || countdown > 0}
              className="h-10 px-3 text-xs font-normal whitespace-nowrap tabular-nums"
            >
              {countdown > 0 ? `重新发送 ${countdown}s` : sentAt ? '重新发送' : '获取验证码'}
            </Button>
          </div>

          {/* 提示 / 错误 */}
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : sentAt ? (
            <p className="text-xs text-muted-foreground">
              验证码已发送至 {channel === 'phone' ? `${areaCode} ${identifier}` : identifier}
            </p>
          ) : null}
        </div>

        {/* 协议 —— 默认预勾选 */}
        <label className="flex items-start gap-2 cursor-pointer">
          <Checkbox
            checked={agreed}
            onCheckedChange={v => setAgreed(v === true)}
            className="mt-[1px] size-3.5 rounded-[3px] data-[state=checked]:border-cherry-primary data-[state=checked]:bg-cherry-primary"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            我已阅读并同意
            <a href="#" onClick={e => e.preventDefault()} className="text-cherry-primary hover:underline mx-0.5">《服务条款》</a>
            和
            <a href="#" onClick={e => e.preventDefault()} className="text-cherry-primary hover:underline mx-0.5">《隐私政策》</a>
          </span>
        </label>

        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            onClick={submit}
            disabled={!identifierValid || !codeValid || !agreed}
            className="w-full h-11 rounded-lg"
          >
            登录 / 注册
          </Button>
          {!agreed && (
            <p className="text-xs text-muted-foreground/70 text-center">请先勾选同意服务条款和隐私政策</p>
          )}
          <p className="text-xs text-muted-foreground/60 text-center">
            未注册的{channel === 'phone' ? '手机号' : '邮箱'}将自动创建 Cherry Studio 账号
          </p>
        </div>
      </div>

      {/* 演示说明 —— 真实产品不会有这块 */}
      <div className="mt-10 max-w-[400px] text-center text-[11px] leading-relaxed text-muted-foreground/45">
        原型演示：验证码填任意 6 位数字即可通过，<span className="font-mono">000000</span> 走错误态；
        手机号尾号 8 或邮箱以 beta 开头 = 内测白名单账号（能看到 CherryAI 免费模型）。
      </div>
    </div>
  );
}
