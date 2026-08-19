import { CherryStudio } from './components/CherryStudio';
import { BranchPreviewSwitcher } from './components/shared/BranchPreviewSwitcher';
import { AccountDemoSwitcher } from './components/shared/AccountDemoSwitcher';
import { AuthProvider } from './context/AuthContext';
import { isGoCheckoutRoute, isGoDocsRoute, isGoRoute, isGoSubscriptionRoute, isLoginRoute } from './lib/authStorage';
import { LoginPage } from '@/features/auth/LoginPage';
import { GoWorkspacePage, GoSubscriptionPage } from '@/features/auth/GoWorkspacePage';
import { GoDocsPage } from '@/features/auth/GoDocsPage';
import { GoCheckoutPage } from '@/features/auth/GoCheckoutPage';
import { OnboardingOverlay } from '@/features/onboarding/OnboardingOverlay';

// Main App entry
export default function App() {
  // 「网页端」路由 —— 独立网页，不套客户端外壳
  if (isLoginRoute()) return <LoginPage />;         // ?login=1        浏览器登录页
  if (isGoRoute()) return <GoWorkspacePage />;      // ?go=1           官网 Go 介绍页（公开）
  if (isGoSubscriptionRoute()) return <GoSubscriptionPage />; // ?subscription=1 我的订阅
  if (isGoDocsRoute()) return <GoDocsPage />;       // ?docs=go        文档：Go 订阅模式介绍
  if (isGoCheckoutRoute()) return <GoCheckoutPage />; // ?checkout=go  模拟 Stripe 支付页

  return (
    <AuthProvider>
      <CherryStudio />
      <OnboardingOverlay />
      <BranchPreviewSwitcher />
      <AccountDemoSwitcher />
    </AuthProvider>
  );
}
