
import { WizardState, SectionId } from '../../types';
import StepNav from '../StepNav';
import TeachingTooltip from '../TeachingTooltip';

interface Props {
  state: WizardState;
  onUpdate: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ALL_SECTIONS: { id: SectionId; label: string; hint: string }[] = [
  { id: 'hero', label: 'Hero', hint: 'Opening statement' },
  { id: 'about', label: 'About', hint: 'Your story' },
  { id: 'services', label: 'Services', hint: 'What you offer' },
  { id: 'testimonials', label: 'Testimonials', hint: 'Social proof' },
  { id: 'gallery', label: 'Gallery', hint: 'Visual portfolio' },
  { id: 'team', label: 'Team', hint: 'The people' },
  { id: 'contact', label: 'Contact', hint: 'Get in touch' },
  { id: 'pricing', label: 'Pricing', hint: 'Packages & rates' },
];

export default function Step5Sections({ state, onUpdate, onNext, onBack }: Props) {
  function toggle(id: SectionId) {
    const has = state.sections.includes(id);
    onUpdate({
      sections: has
        ? state.sections.filter((s) => s !== id)
        : [...state.sections, id],
    });
  }

  const canContinue = state.sections.length >= 1;

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 5 of 8</span>
        <h1 className="step-title">Choose your sections</h1>
        <p className="step-subtitle">
          Select the pages sections you want to include in your mood board.
        </p>
      </div>

      <div className="step-body">
        <div className="sections-grid">
          {ALL_SECTIONS.map(({ id, label, hint }) => {
            const checked = state.sections.includes(id);
            return (
              <label
                key={id}
                className={`section-checkbox-card${checked ? ' section-checkbox-card--checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(id)}
                />
                <div>
                  <div className="section-checkbox-card__label">{label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>{hint}</div>
                </div>
              </label>
            );
          })}
        </div>

        <TeachingTooltip
          variant="cool"
          title="UX Principle: Progressive Disclosure"
          body="Less is more on first impressions. A focused single-page site often converts better than one with too many sections. Start with Hero, About, Services, Contact — add more once you know it's needed."
        />
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!canContinue} />
    </div>
  );
}
