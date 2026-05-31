import { useState } from 'react';
import { WizardState, SectionId } from './types';
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

const DEFAULT_STATE: WizardState = {
  projectName: '',
  businessType: '',
  presetId: '',
  accentColor: '#D4A574',
  primaryColor: '#FAFAF8',
  secondaryColor: '#1a1a18',
  keywords: [],
  inspirationImages: [],
  sections: ['hero', 'about', 'services', 'contact'] as SectionId[],
  imageSelections: {
    hero: 0,
    about: 0,
    services: 0,
    testimonials: 0,
    gallery: 0,
    team: 0,
    contact: 0,
    pricing: 0,
  },
};

export default function App() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(DEFAULT_STATE);

  function onUpdate(patch: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  function onNext() {
    setStep((s) => Math.min(s + 1, 9));
  }

  function onBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function onRestart() {
    setState(DEFAULT_STATE);
    setStep(1);
  }

  const stepProps = { state, onUpdate, onNext, onBack };

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">
          mood<span>board</span>
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
          Phase 1 — Concept Builder
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
