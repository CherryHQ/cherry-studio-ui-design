import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';

// ===========================
// 免费额度用完的统一提示
// ===========================
// 「额度用完」会在三个地方冒出来：模型卡的说明行、选中这个模型时、以及额度用完
// 还去发消息时。三处必须是同一句话，否则用户会以为是三件事。所以文案只在这里
// 写一次，UI 也只有这一个组件。
//
// 不写倒计时（「N 小时 M 分钟后重置」）：重置周期由服务端说了算，界面上给出
// 精确到分钟的时间就是一句承诺，对不上就是 bug。只说「待重置」。

/** 全站唯一的那句话 —— 模型卡说明行、选中提示都用它 */
export const QUOTA_EXHAUSTED_MESSAGE = '免费额度已用完，待重置';

/** 错误块里用的标题 —— 不要走 HTTP 状态码那套（429 会被写成「请求过于频繁」，
 *  额度用完不是被限流）。 */
export const QUOTA_ERROR_TITLE = '免费额度已用完';

/** 错误块里用的说明行 —— 标题已经说了「已用完」，这里只给出路，不提重置时间 */
export const QUOTA_ERROR_DETAIL = '可继续使用其他模型';

/**
 * 额度状态 + 提示。`notify()` 用于「用户刚做了一个被额度挡住的动作」
 * （选中该模型、发消息）。
 */
export function useQuotaNotice() {
  const { quotaExhausted } = useAuth();

  const notify = useCallback(() => {
    toast.info(QUOTA_EXHAUSTED_MESSAGE, {
      description: '可继续使用其他模型',
    });
  }, []);

  return {
    quotaExhausted,
    message: QUOTA_EXHAUSTED_MESSAGE,
    detail: QUOTA_ERROR_DETAIL,
    title: QUOTA_ERROR_TITLE,
    notify,
  };
}
