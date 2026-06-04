import { FlowStep } from '../types';

const STEPS: { id: FlowStep; label: string }[] = [
  { id: 'brief', label: 'Brief' },
  { id: 'moods', label: 'Mood' },
  { id: 'brand-kit', label: 'Brand Kit' },
  { id: 'export', label: 'Export' },
];

const STEP_ORDER: FlowStep[] = ['brief', 'moods', 'brand-kit', 'images', 'mockups', 'export'];

interface Props {
  currentStep: FlowStep;
}

export default function FlowIndicator({ currentStep }: Props) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="flow-indicator">
      {STEPS.map((s, i) => {
        const stepIndex = STEP_ORDER.indexOf(s.id);
        const isDone = stepIndex < currentIndex;
        const isActive = stepIndex === currentIndex ||
          (currentStep === 'images' && s.id === 'brand-kit') ||
          (currentStep === 'mockups' && s.id === 'brand-kit');

        return (
          <div key={s.id} className="flow-indicator__step-wrapper">
            {i > 0 && (
              <div className={`flow-indicator__connector${isDone ? ' flow-indicator__connector--done' : ''}`} />
            )}
            <div className={`flow-indicator__step${isActive ? ' flow-indicator__step--active' : ''}${isDone ? ' flow-indicator__step--done' : ''}`}>
              <div className="flow-indicator__dot">
                {isDone && <span>✓</span>}
              </div>
              <span className="flow-indicator__label">{s.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
