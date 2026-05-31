
import { WizardState } from '../../types';
import { presets, getPresetById } from '../../data/presets';
import StepNav from '../StepNav';
import TeachingTooltip from '../TeachingTooltip';

interface Props {
  state: WizardState;
  onUpdate: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2DesignDirection({ state, onUpdate, onNext, onBack }: Props) {
  function selectPreset(id: string) {
    const preset = getPresetById(id);
    onUpdate({
      presetId: id,
      accentColor: preset ? preset.colors.accent : state.accentColor,
    });
  }

  const canContinue = state.presetId.length > 0;

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 2 of 8</span>
        <h1 className="step-title">Choose your design direction</h1>
        <p className="step-subtitle">
          Each preset defines a visual world — choose the one that resonates with your brand.
        </p>
      </div>

      <div className="step-body">
        <div className="preset-grid">
          {presets.map((preset) => {
            const selected = state.presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`preset-card${selected ? ' preset-card--selected' : ''}`}
                onClick={() => selectPreset(preset.id)}
                aria-pressed={selected}
              >
                <div className="preset-card__swatches">
                  <div
                    className="preset-card__swatch"
                    style={{ background: preset.colors.primary }}
                  />
                  <div
                    className="preset-card__swatch"
                    style={{ background: preset.colors.secondary }}
                  />
                  <div
                    className="preset-card__swatch"
                    style={{ background: preset.colors.accent }}
                  />
                </div>
                <div>
                  <div className="preset-card__name">{preset.name}</div>
                  <div className="preset-card__desc">{preset.description}</div>
                  <div className="preset-card__audience">{preset.audience}</div>
                </div>
                {selected && (
                  <div className="preset-card__selected-badge">✓ Selected</div>
                )}
              </button>
            );
          })}
        </div>

        <TeachingTooltip
          variant="warm"
          title="Design Principle: Coherence"
          body="Your chosen preset defines the visual direction — every colour, type choice, and spacing decision flows from this foundation. A coherent palette builds trust before a visitor reads a single word."
        />
      </div>

      <StepNav
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!canContinue}
      />
    </div>
  );
}
