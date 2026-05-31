import { ProjectProvider, useProject } from './context/ProjectContext';
import ProgressBar from './components/ProgressBar';
import Step1ProjectName from './components/steps/Step1ProjectName';
import Step2DesignDirection from './components/steps/Step2DesignDirection';
import Step3Inspiration from './components/steps/Step3Inspiration';
import Step3Keywords from './components/steps/Step3Keywords';
import Step4Colors from './components/steps/Step4Colors';
import Step5Sections from './components/steps/Step5Sections';
import Step6Images from './components/steps/Step6Images';
import Step7Generate from './components/steps/Step7Generate';
import Step8Done from './components/steps/Step8Done';

function WizardApp() {
  const { step, state, onUpdate, onNext, onBack, onRestart } = useProject();
  const stepProps = { state, onUpdate, onNext, onBack };

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">mood<span>board</span></span>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
          Concept Builder
        </span>
      </header>
      <main className="app-main">
        <ProgressBar currentStep={step} />
        {step === 1 && <Step1ProjectName {...stepProps} />}
        {step === 2 && <Step2DesignDirection {...stepProps} />}
        {step === 3 && <Step3Inspiration {...stepProps} />}
        {step === 4 && <Step3Keywords {...stepProps} />}
        {step === 5 && <Step4Colors {...stepProps} />}
        {step === 6 && <Step5Sections {...stepProps} />}
        {step === 7 && <Step6Images {...stepProps} />}
        {step === 8 && <Step7Generate {...stepProps} />}
        {step === 9 && <Step8Done state={state} onRestart={onRestart} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <WizardApp />
    </ProjectProvider>
  );
}
