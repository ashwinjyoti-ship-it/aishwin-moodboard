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
      primaryColor: preset ? preset.colors.primary : state.primaryColor,
      secondaryColor: preset ? preset.colors.secondary : state.secondaryColor,
    });
  }

  const canContinue = state.presetId.length > 0;

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 2 of 9</span>
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
                className={`preset-card${selected ? ' selected' : ''}`}
                onClick={() => selectPreset(preset.id)}
                aria-pressed={selected}
              >
                {selected && (
                  <div className="preset-checkmark">✓</div>
                )}
                <div className="preset-swatches">
                  <div className="preset-swatch" style={{ background: preset.colors.primary, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <div className="preset-swatch" style={{ background: preset.colors.secondary, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <div className="preset-swatch" style={{ background: preset.colors.accent, border: '1px solid rgba(0,0,0,0.1)' }} />
                </div>
                <div className="preset-name">{preset.name}</div>
                <div className="preset-desc">{preset.description}</div>
                <div className="preset-audience">{preset.audience}</div>
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
