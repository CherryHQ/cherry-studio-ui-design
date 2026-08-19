import { ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { buildGoPageUrl } from '@/app/lib/authStorage';

// ===========================
// Cherry Go 的弱引导
// ===========================
// 用户自己的服务商余额不足时，在报错块下面放**一行灰字**引导到 Go——
// 刻意做弱（不是按钮、不是卡片）：报错本身已经够打扰了，广告只配一行。
// 只在「余额 / 配额类」错误下出现，普通网络错误不带引导。
//
// 已订阅的用户不需要被引导订阅：那一行换成提示可切换到 Go 的模型继续。

/** 是不是「服务商余额 / 配额不足」类错误 —— 只有这类错误配 Go 引导 */
export function isBillingError(error?: { code?: string; message?: string; classification?: string }): boolean {
  if (!error) return false;
  if (error.code === 'insufficient_quota' || error.code === '402') return true;
  const text = `${error.classification ?? ''} ${error.message ?? ''}`;
  return /余额不足|insufficient[_ ]quota|insufficient balance|credit/i.test(text);
}

export function BillingErrorGoHint({ className }: { className?: string }) {
  const { goSubscribed, goState } = useAuth();

  if (goSubscribed) {
    // Go 额度也打满时不能指一条走不通的路 —— 那一行退化成中性建议
    const goUsable = goState === 'active';
    return (
      <p className={`text-[11px] leading-relaxed text-muted-foreground/60 ${className ?? ''}`}>
        {goUsable
          ? '可前往服务商充值，或切换到 CherryAI Go 的模型继续'
          : '可前往服务商充值，或继续使用其他模型'}
      </p>
    );
  }

  return (
    <p className={`text-[11px] leading-relaxed text-muted-foreground/60 ${className ?? ''}`}>
      可前往服务商充值，或
      <button
        type="button"
        onClick={() => window.open(buildGoPageUrl(), '_blank')?.focus()}
        className="inline-flex items-center gap-px mx-0.5 text-[11px] text-cherry-primary/80 hover:text-cherry-primary hover:underline underline-offset-2 transition-colors"
      >
        订阅 Cherry Go
        <ArrowUpRight size={10} />
      </button>
      使用旗舰开源模型
    </p>
  );
}
