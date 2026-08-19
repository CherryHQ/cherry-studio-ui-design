import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, Gift, Loader2 } from 'lucide-react';
import { Button, Checkbox, BrandLogo, Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';
import { ModelPickerPanel } from '@/app/components/shared/ModelPickerPanel';
import { AGENT_PROVIDER_COLORS } from '@/app/config/agentTools';
import cherryLogoImg from '@/assets/cherry-icon.png';
import { useAuth } from '@/app/context/AuthContext';
import { useAgentModels } from '@/app/hooks/useAgentModels';
import { CHERRY_AI_FREE_MODEL } from '@/app/config/models';

// ===========================
// 首启引导（欢迎 → 选择默认模型）
// ===========================
// 复刻真实客户端的 onboarding 两步流程（WelcomePage / SelectModelPage /
// SkipButton）：主按钮「登录 CherryIN」点击后新开标签页打开浏览器登录页，
// 本页进入等待态，登录成功自动进第二步。
//
// 原副标题（"使用 CherryIN 服务商可畅享顶级 AI 服务"）去掉了；免费额度也不在
// 这里宣传 —— 首批额度是邀请制内测，不是每个登录用户都有，引导页上承诺不了。
//
// 原型是常驻网页，没有"首次启动"，所以：首次访问自动展示，看过一次就不再出现
// （localStorage 记标记），右下角「账号演示」切换器里可以一键重放。

type Step = 'welcome' | 'select-model';

export function OnboardingOverlay() {
  const { onboardingSeen, completeOnboarding, isLoggedIn, loginPending } = useAuth();
  const [step, setStep] = useState<Step>('welcome');
  const [dataCollection, setDataCollection] = useState(true); // 真实客户端默认勾选
  const awaitingLogin = useRef(false);

  // 浏览器那边登录成功 → 自动进第二步（真实代码里就是 setStep('select-model')）。
  // 认的是"这一轮登录完成了"，不是"当前已登录" —— 演示的默认状态本来就是已登录，
  // 按后者判断会一进来就跳过欢迎页。
  useEffect(() => {
    if (loginPending) {
      awaitingLogin.current = true;
      return;
    }
    if (awaitingLogin.current && isLoggedIn) {
      awaitingLogin.current = false;
      setStep('select-model');
    }
  }, [loginPending, isLoggedIn]);

  // 重放时回到第一步
  useEffect(() => {
    if (!onboardingSeen) setStep('welcome');
  }, [onboardingSeen]);

  if (onboardingSeen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-sidebar">
      {/* 顶部拖拽区（对应真实窗口的 navbar 高度） */}
      <div className="h-[38px] flex-shrink-0" />
      <div className="flex flex-1 min-h-0 px-2 pb-2">
        <div className="relative flex flex-1 overflow-hidden rounded-xl bg-content-bg border border-content-border">
          <Button
            variant="ghost"
            onClick={completeOnboarding}
            className="absolute top-4 right-4 z-10 h-8 px-3 text-xs text-muted-foreground/60 hover:text-foreground"
          >
            跳过引导
          </Button>

          {step === 'welcome' ? (
            <WelcomeStep />
          ) : (
            <SelectModelStep onBack={isLoggedIn ? null : () => setStep('welcome')} onComplete={completeOnboarding} />
          )}

          {/* 数据收集勾选 —— 真实引导页底部就是这一项，默认勾选 */}
          <div className="absolute bottom-5 left-0 z-10 flex w-full justify-center px-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={dataCollection}
                onCheckedChange={v => setDataCollection(v === true)}
                className="size-3.5 rounded-[3px] data-[state=checked]:border-cherry-primary data-[state=checked]:bg-cherry-primary"
              />
              <span className="text-xs text-muted-foreground/60">
                匿名发送错误报告和数据统计，帮助我们改进
                <a href="#" onClick={e => e.preventDefault()} className="ml-1 text-cherry-primary hover:underline">隐私政策</a>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================
// 第一步：欢迎 + 登录
// ===========================
function WelcomeStep() {
  const { loginPending, beginBrowserLogin, reopenLoginTab, cancelBrowserLogin } = useAuth();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <img src={cherryLogoImg} alt="Cherry Studio" className="w-16 h-16 rounded-xl" />

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold text-foreground">欢迎使用 Cherry Studio</h1>
        </div>

        <div className="mt-2 flex w-[400px] flex-col gap-3">
          <Button
            size="lg"
            onClick={beginBrowserLogin}
            disabled={loginPending}
            className="w-full h-12 rounded-lg gap-2"
          >
            {loginPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                正在浏览器中完成登录…
              </>
            ) : (
              '登录 CherryIN'
            )}
          </Button>

          {loginPending ? (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>没有自动跳转？</span>
              <button onClick={reopenLoginTab} className="text-cherry-primary hover:underline">重新打开</button>
              <span className="text-muted-foreground/30">·</span>
              <button onClick={cancelBrowserLogin} className="hover:text-foreground transition-colors">取消</button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border/60" />
                <span className="text-xs text-muted-foreground/50">或使用其他方式</span>
                <span className="h-px flex-1 bg-border/60" />
              </div>

              <Button variant="outline" size="lg" className="w-full h-12 rounded-lg">
                选择其他服务商
              </Button>
            </>
          )}
        </div>

        <p className="mt-1 text-xs text-muted-foreground/60">请您先至少配置一个服务商，以获得最佳使用体验</p>
      </div>
    </div>
  );
}

// ===========================
// 第二步：选择默认模型
// ===========================
const SCENARIOS = [
  { id: 'chat', label: '默认对话模型' },
  { id: 'topic', label: '话题命名模型' },
  { id: 'translate', label: '翻译模型' },
];

function SelectModelStep({ onBack, onComplete }: { onBack: (() => void) | null; onComplete: () => void }) {
  const { showFreeModels } = useAuth();
  const { models } = useAgentModels();

  // 内测账号默认落在免费模型上 —— 登录后第一件事就能免费用起来。
  // 列表里可能混着引导行（Go 未订阅的「旗舰开源模型 · 订阅」），不是真模型，跳过。
  const defaultModelId = showFreeModels ? CHERRY_AI_FREE_MODEL.id : models.find(m => !m.cta)?.id ?? '';
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(SCENARIOS.map(s => [s.id, defaultModelId])),
  );
  const [openPicker, setOpenPicker] = useState<string | null>(null);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      {onBack && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          className="absolute top-4 left-4 text-muted-foreground/60 hover:text-foreground"
          aria-label="上一步"
        >
          <ArrowLeft size={18} />
        </Button>
      )}

      <div className="flex w-[400px] flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-foreground">选择你的默认模型</h1>
          <p className="text-sm text-muted-foreground">为每个场景选择默认模型</p>
        </div>

        {/* 模型选择用应用里那个统一的 ModelPickerPanel，和工作模块的选择器同一个组件 */}
        <div className="flex flex-col border border-section-border rounded-[var(--radius-button)] px-3.5">
          {SCENARIOS.map((s, i) => {
            const model = models.find(m => m.id === selection[s.id]);
            const isFree = selection[s.id] === CHERRY_AI_FREE_MODEL.id;
            return (
              <div
                key={s.id}
                className={`flex items-center justify-between gap-4 py-2.5 ${i > 0 ? 'border-t border-section-border/50' : ''}`}
              >
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <Popover open={openPicker === s.id} onOpenChange={o => setOpenPicker(o ? s.id : null)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-7 gap-1.5 px-2 text-xs font-normal text-foreground hover:bg-accent/40"
                    >
                      {model && <BrandLogo id={model.logoId ?? model.provider.toLowerCase()} fallbackLetter={model.provider[0]} size={14} />}
                      <span>{model?.name ?? '选择模型'}</span>
                      {isFree && <Gift size={11} className="text-success" />}
                      <ChevronDown size={11} className="text-muted-foreground/50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="p-0 w-[420px]">
                    <ModelPickerPanel
                      models={models}
                      selectedModels={[selection[s.id]]}
                      onSelectModel={id => setSelection(prev => ({ ...prev, [s.id]: id }))}
                      multiModel={false}
                      onToggleMultiModel={() => {}}
                      showMultiModelToggle={false}
                      providerColors={AGENT_PROVIDER_COLORS}
                      onConnectProvider={null}
                      // 首启引导里不做付费引导：Go 的「订阅」行在这里不渲染
                      onCtaClick={null}
                      onClose={() => setOpenPicker(null)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            );
          })}
        </div>

        <Button size="lg" onClick={onComplete} className="w-full h-12 rounded-lg">
          开始使用
        </Button>

        <p className="text-center text-xs text-muted-foreground/60">您可以随时在设置中更改</p>
      </div>
    </div>
  );
}
