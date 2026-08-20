import { CherryStudio } from './components/CherryStudio';
import { BranchPreviewSwitcher } from './components/shared/BranchPreviewSwitcher';
import { AccountDemoSwitcher } from './components/shared/AccountDemoSwitcher';
import { AuthProvider } from './context/AuthContext';
import { isGoCheckoutRoute, isGoDocsRoute, isGoRoute, isGoSubscriptionRoute, isLoginRoute } from './lib/authStorage';
import { LoginPage } from '@/features/auth/LoginPage';
import { GoWorkspacePage, GoSubscriptionPage } from '@/features/auth/GoWorkspacePage';
import { GoDocsPage } from '@/features/auth/GoDocsPage';
import { GoCheckoutPage } from '@/features/auth/GoCheckoutPage';
import { GoSiteThemeProvider } from '@/features/auth/goSiteTheme';
import { OnboardingOverlay } from '@/features/onboarding/OnboardingOverlay';

// Main App entry
export default function App() {
  // 「网页端」路由 —— 独立网页，不套客户端外壳。Go 相关网页页套 AuthProvider：
  // 订阅页左下角的演示状态切换器（AccountDemoSwitcher）依赖账号上下文。
  if (isLoginRoute()) {
    return (
      <GoSiteThemeProvider>
        <LoginPage />
      </GoSiteThemeProvider>
    );
  }

  const goSitePage = isGoRoute() ? (
    <GoWorkspacePage />
  ) : isGoSubscriptionRoute() ? (
    <GoSubscriptionPage />
  ) : isGoDocsRoute() ? (
    <GoDocsPage />
  ) : isGoCheckoutRoute() ? (
    <GoCheckoutPage />
  ) : null;

  if (goSitePage) {
    return (
      <GoSiteThemeProvider>
        <AuthProvider>{goSitePage}</AuthProvider>
      </GoSiteThemeProvider>
    );
  }

  return (
    <AuthProvider>
      <CherryStudio />
      <OnboardingOverlay />
      <BranchPreviewSwitcher />
      <AccountDemoSwitcher />
    </AuthProvider>
  );
}
