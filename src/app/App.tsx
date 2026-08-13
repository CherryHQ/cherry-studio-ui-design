import { CherryStudio } from './components/CherryStudio';
import { BranchPreviewSwitcher } from './components/shared/BranchPreviewSwitcher';
import { AccountDemoSwitcher } from './components/shared/AccountDemoSwitcher';
import { AuthProvider } from './context/AuthContext';
import { isLoginRoute } from './lib/authStorage';
import { LoginPage } from '@/features/auth/LoginPage';
import { OnboardingOverlay } from '@/features/onboarding/OnboardingOverlay';

// Main App entry
export default function App() {
  // ?login=1 是浏览器登录页 —— 独立网页，不套客户端外壳
  if (isLoginRoute()) return <LoginPage />;

  return (
    <AuthProvider>
      <CherryStudio />
      <OnboardingOverlay />
      <BranchPreviewSwitcher />
      <AccountDemoSwitcher />
    </AuthProvider>
  );
}
