import { WizardState } from '../../types';
import StepNav from '../StepNav';
import TeachingTooltip from '../TeachingTooltip';

interface Props {
  state: WizardState;
  onUpdate: (patch: Partial<WizardState>) => void;
  onNext: () => void;
}

const CATEGORIES = [
  'Yoga Studio',
  'Personal Training',
  'Physiotherapy',
  'Nutrition & Dietetics',
  'Mental Wellness',
  'Spa & Beauty',
  'Sports Performance',
  'Chiropractic',
  'Pilates',
  'Dance Studio',
  'Holistic Health',
  'Corporate Wellness',
];

export default function Step1ProjectName({ state, onUpdate, onNext }: Props) {
  const canContinue = state.projectName.trim().length > 0;

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 1 of 9</span>
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
          <label className="form-label">Business category</label>
          <div className="category-grid">
            {CATEGORIES.map((cat) => {
              const selected = state.businessType === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`category-chip${selected ? ' selected' : ''}`}
                  onClick={() => onUpdate({ businessType: selected ? '' : cat })}
                  aria-pressed={selected}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          {state.businessType && (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
              Selected: <strong style={{ color: 'var(--color-text)' }}>{state.businessType}</strong>
            </p>
          )}
        </div>

        <TeachingTooltip
          variant="warm"
          title="Design Principle: Know Your Audience"
          body="Your category shapes every visual choice. A yoga studio needs serenity; a sports performance clinic needs energy. Start here."
        />
      </div>

      <StepNav
        onNext={onNext}
        nextDisabled={!canContinue}
        isFirst
      />
    </div>
  );
}
