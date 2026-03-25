// ===========================
// Global API Error Handler
// ===========================
// Connects the API client's error hook to sonner toast notifications.
// Call `initGlobalErrorHandler()` once at app startup.

import { toast } from 'sonner';
import { onApiError, type ApiError } from './apiClient';

/**
 * Initialize the global API error handler.
 * Should be called once (e.g. in App.tsx useEffect).
 */
export function initGlobalErrorHandler() {
  onApiError((error: ApiError) => {
    // Skip showing toast for aborted requests
    if (error.code === 'TIMEOUT' || error.code === 'NETWORK_ERROR') {
      toast.error(error.message, {
        description: '\u8bf7\u68c0\u67e5\u7f51\u7edc\u8fde\u63a5\u540e\u91cd\u8bd5',
        duration: 5000,
      });
      return;
    }

    // Auth errors - special handling
    if (error.status === 401) {
      toast.error('\u767b\u5f55\u5df2\u8fc7\u671f', {
        description: '\u8bf7\u91cd\u65b0\u767b\u5f55\u4ee5\u7ee7\u7eed\u64cd\u4f5c',
        duration: 5000,
      });
      return;
    }

    // Rate limiting
    if (error.status === 429) {
      toast.warning('\u8bf7\u6c42\u8fc7\u4e8e\u9891\u7e41', {
        description: '\u8bf7\u7a0d\u540e\u91cd\u8bd5',
        duration: 3000,
      });
      return;
    }

    // General errors
    toast.error(error.message, {
      duration: 4000,
    });
  });
}
