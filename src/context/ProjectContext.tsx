import { createContext, useContext, useState, ReactNode } from 'react';
import { WizardState } from '../types';

const SESSION_KEY = 'mb_session_id';

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

interface ProjectContextValue {
  step: number;
  state: WizardState;
  sessionId: string;
  onUpdate: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
  onRestart: () => void;
  goToStep: (n: number) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

const DEFAULT_STATE: WizardState = {
  projectName: '',
  industry: '',
  businessTypes: [],
  presetId: '',
  accentColor: '#D4A574',
  primaryColor: '#FAFAF8',
  secondaryColor: '#1a1a18',
  keywords: [],
  inspirationImages: [],
  sections: [],
  imageSelections: {},
};

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(DEFAULT_STATE);
  const [sessionId] = useState(getOrCreateSessionId);

  function onUpdate(patch: Partial<WizardState>) {
    setState(prev => ({ ...prev, ...patch }));
  }

  function onNext() { setStep(s => Math.min(s + 1, 9)); }
  function onBack() { setStep(s => Math.max(s - 1, 1)); }
  function goToStep(n: number) { setStep(n); }
  function onRestart() { setState(DEFAULT_STATE); setStep(1); }

  return (
    <ProjectContext.Provider value={{ step, state, sessionId, onUpdate, onNext, onBack, onRestart, goToStep }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
