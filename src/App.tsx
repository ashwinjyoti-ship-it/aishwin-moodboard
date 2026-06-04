import { AppProvider, useApp } from './context/AppContext';
import FlowIndicator from './components/FlowIndicator';
import BriefScreen from './screens/BriefScreen';
import MoodsScreen from './screens/MoodsScreen';
import BrandKitScreen from './screens/BrandKitScreen';
import ExportScreen from './screens/ExportScreen';
import { FEATURE_FLAGS } from './utils/featureFlags';

function DirectFlowApp() {
  const { state } = useApp();
  const { step } = state;

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">mood<span>board</span></span>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
          Brand Kit Generator
        </span>
      </header>
      <main className="app-main">
        <FlowIndicator currentStep={step} />
        {step === 'brief' && <BriefScreen />}
        {step === 'moods' && <MoodsScreen />}
        {(step === 'brand-kit' || step === 'images') && <BrandKitScreen />}
        {step === 'mockups' && FEATURE_FLAGS.FLUX_MOCKUPS && <div>Mockups coming soon</div>}
        {step === 'export' && <ExportScreen />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DirectFlowApp />
    </AppProvider>
  );
}
