import { CherryStudio } from './components/CherryStudio';
import { BranchPreviewSwitcher } from './components/shared/BranchPreviewSwitcher';

// Main App entry
export default function App() {
  return (
    <>
      <CherryStudio />
      <BranchPreviewSwitcher />
    </>
  );
}
