import { toast } from 'sonner';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import { QuickProviderSetupDialog } from './QuickProviderSetupDialog';
import {
  useQuickProviderSetupOpen,
  closeQuickProviderSetup,
  getQuickProviderSetupOnSaved,
} from './quickProviderSetupStore';

// Mounted once inside GlobalActionProvider. Every model picker opens this
// single dialog via the store, so the "连接服务商 / 添加模型" entry works
// everywhere, and "高级配置" can route to the Model Service settings page.
export function QuickProviderSetupHost() {
  const open = useQuickProviderSetupOpen();
  const { openSettings } = useGlobalActions();
  return (
    <QuickProviderSetupDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) closeQuickProviderSetup();
      }}
      onAdvanced={() => {
        closeQuickProviderSetup();
        openSettings('models');
      }}
      onSave={(payload) => {
        getQuickProviderSetupOnSaved()?.();
        toast.success(`已连接 ${payload.providerName}`, {
          description: `启用 ${payload.enabledModels.length} 个模型`,
        });
      }}
    />
  );
}
