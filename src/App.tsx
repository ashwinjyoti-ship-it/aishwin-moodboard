import { AppProvider, useApp } from './context/AppContext';
import FlowIndicator from './components/FlowIndicator';
import BriefScreen from './screens/BriefScreen';
import MoodsScreen from './screens/MoodsScreen';
import TypographyScreen from './screens/TypographyScreen';
import BrandKitScreen from './screens/BrandKitScreen';
import PathsScreen from './screens/PathsScreen';
import ImagesScreen from './screens/ImagesScreen';
import MockupsScreen from './screens/MockupsScreen';
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
        {step === 'typography' && <TypographyScreen />}
        {step === 'brand-kit' && <BrandKitScreen />}
        {step === 'paths' && FEATURE_FLAGS.FLUX_MOCKUPS && <PathsScreen />}
        {step === 'paths' && !FEATURE_FLAGS.FLUX_MOCKUPS && <ExportScreen />}
        {step === 'images' && <ImagesScreen />}
        {step === 'mockups' && FEATURE_FLAGS.FLUX_MOCKUPS && <MockupsScreen />}
        {step === 'mockups' && !FEATURE_FLAGS.FLUX_MOCKUPS && <ExportScreen />}
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
