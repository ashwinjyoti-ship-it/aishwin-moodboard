
import { WizardState, SectionId } from '../../types';

import StepNav from '../StepNav';
import TeachingTooltip from '../TeachingTooltip';

interface Props {
  state: WizardState;
  onUpdate: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const IMAGE_VARIANTS = 3;

const SECTION_GRADIENTS: Record<string, string[]> = {
  hero:         ['linear-gradient(135deg,#e8f4fd,#bdd7ee)', 'linear-gradient(135deg,#fde8e8,#f0b8b8)', 'linear-gradient(135deg,#e8fde8,#b8e8b8)'],
  about:        ['linear-gradient(135deg,#fdf5e8,#e8d5b0)', 'linear-gradient(135deg,#f0e8fd,#d5b8f0)', 'linear-gradient(135deg,#e8fdf5,#b0e8d5)'],
  services:     ['linear-gradient(135deg,#fde8f5,#f0b8d5)', 'linear-gradient(135deg,#e8f0fd,#b8cdf0)', 'linear-gradient(135deg,#fdf0e8,#f0d0b8)'],
  testimonials: ['linear-gradient(135deg,#f5fde8,#d5f0b0)', 'linear-gradient(135deg,#fde8e8,#f0b8b8)', 'linear-gradient(135deg,#e8e8fd,#b8b8f0)'],
  gallery:      ['linear-gradient(135deg,#fde8f0,#f0b8c8)', 'linear-gradient(135deg,#e8fde8,#b8f0b8)', 'linear-gradient(135deg,#fde8e8,#f0c8b8)'],
  team:         ['linear-gradient(135deg,#e8f5fd,#b8d5f0)', 'linear-gradient(135deg,#fdf0e8,#f0d5b8)', 'linear-gradient(135deg,#f0fde8,#d5f0b8)'],
  contact:      ['linear-gradient(135deg,#fde8fd,#f0b8f0)', 'linear-gradient(135deg,#e8fdf5,#b8f0d5)', 'linear-gradient(135deg,#fdf5e8,#f0e0b8)'],
  pricing:      ['linear-gradient(135deg,#e8e8e8,#c8c8c8)', 'linear-gradient(135deg,#fde8e8,#f0c8b8)', 'linear-gradient(135deg,#e8f0fd,#b8cce8)'],
};

export default function Step6Images({ state, onUpdate, onNext, onBack }: Props) {
  function swap(sectionId: SectionId) {
    const current = state.imageSelections[sectionId] ?? 0;
    onUpdate({
      imageSelections: {
        ...state.imageSelections,
        [sectionId]: (current + 1) % IMAGE_VARIANTS,
      },
    });
  }

  const progressPct = Math.round((7 / 9) * 100);

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 7 of 9</span>
        <h1 className="step-title">Review &amp; refine images</h1>
        <p className="step-subtitle">
          Choose the image direction for each section. Swap to cycle through alternatives.
        </p>
      </div>

      <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', marginBottom: '0.5rem' }}>
        <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--color-accent)', borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '2rem', textAlign: 'right' }}>{progressPct}% complete</p>

      <div className="step-body">
        {state.sections.map((sectionId) => {
          const selected = state.imageSelections[sectionId] ?? 0;
          const gradients = SECTION_GRADIENTS[sectionId] ?? ['linear-gradient(135deg,#eee,#ccc)', 'linear-gradient(135deg,#dde,#bbc)', 'linear-gradient(135deg,#ded,#bcb)'];

          return (
            <div key={sectionId} className="image-section-group">
              <div className="image-section-title">{sectionId}</div>
              <div className="image-cards-row">
                {Array.from({ length: IMAGE_VARIANTS }).map((_, i) => {
                  const isSelected = selected === i;
                  return (
                    <div
                      key={i}
                      className={`image-card${isSelected ? ' image-card--selected' : ''}`}
                      onClick={() => onUpdate({ imageSelections: { ...state.imageSelections, [sectionId]: i } })}
                    >
                      <div
                        className="image-card__placeholder"
                        style={{ background: gradients[i] }}
                      />
                      <div className="image-card__label">
                        <span className="image-card__name">Option {i + 1}</span>
                        <button
                          type="button"
                          className="image-card__swap"
                          onClick={(e) => { e.stopPropagation(); swap(sectionId); }}
                        >
                          Swap ↻
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <TeachingTooltip
          variant="cool"
          title="Principle: Reference Images Build Trust"
          body="Real people, real spaces — even as placeholders — communicate credibility. Every image should reinforce your preset's mood. Cohesion here is what separates intentional design from random assemblage."
        />
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel="Generate Mood Board →" />
    </div>
  );
}
