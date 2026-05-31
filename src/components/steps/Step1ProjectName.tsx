import { WizardState } from '../../types';
import StepNav from '../StepNav';

interface Props {
  state: WizardState;
  onUpdate: (patch: Partial<WizardState>) => void;
  onNext: () => void;
}

export default function Step1ProjectName({ state, onUpdate, onNext }: Props) {
  const canContinue = state.projectName.trim().length > 0;

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 1 of 8</span>
        <h1 className="step-title">Tell us about your project</h1>
        <p className="step-subtitle">
          We'll use this to personalise your mood board and design recommendations.
        </p>
      </div>

      <div className="step-body">
        <div className="form-group">
          <label className="form-label" htmlFor="project-name">Business or project name</label>
          <input
            id="project-name"
            className="form-input"
            type="text"
            placeholder="e.g. Solstice Wellness Studio"
            value={state.projectName}
            onChange={(e) => onUpdate({ projectName: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter' && canContinue) onNext(); }}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="business-type">Business type or category</label>
          <input
            id="business-type"
            className="form-input"
            type="text"
            placeholder="e.g. yoga studio, personal trainer, nutritionist"
            value={state.businessType}
            onChange={(e) => onUpdate({ businessType: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter' && canContinue) onNext(); }}
          />
        </div>
      </div>

      <StepNav
        onNext={onNext}
        nextDisabled={!canContinue}
        isFirst
      />
    </div>
  );
}
