
import { WizardState } from '../../types';
import { getPresetById } from '../../data/presets';
import StepNav from '../StepNav';
import TeachingTooltip from '../TeachingTooltip';

interface Props {
  state: WizardState;
  onUpdate: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Colors({ state, onUpdate, onNext, onBack }: Props) {
  const preset = getPresetById(state.presetId);

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 4 of 8</span>
        <h1 className="step-title">Refine your palette</h1>
        <p className="step-subtitle">
          Your preset's colours are shown below. Tweak the accent colour to make it yours.
        </p>
      </div>

      <div className="step-body">
        {preset && (
          <div>
            <p className="moodboard-section-title">Preset palette — {preset.name}</p>
            <div className="palette-display">
              {[
                { label: 'Primary', hex: preset.colors.primary },
                { label: 'Secondary', hex: preset.colors.secondary },
                { label: 'Accent', hex: state.accentColor },
              ].map(({ label, hex }) => (
                <div key={label} className="palette-swatch-group">
                  <div
                    className="palette-swatch"
                    style={{ background: hex, border: label === 'Accent' ? '2px solid var(--color-accent)' : undefined }}
                  />
                  <div className="palette-swatch-label">{label}</div>
                  <div className="palette-swatch-hex">{hex}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="color-picker-row">
          <label htmlFor="accent-picker">Customize accent colour</label>
          <div className="color-picker-preview" style={{ background: state.accentColor }} />
          <input
            id="accent-picker"
            type="color"
            value={state.accentColor}
            onChange={(e) => onUpdate({ accentColor: e.target.value })}
          />
        </div>

        <TeachingTooltip
          variant="warm"
          title="Design Principle: One Accent"
          body="A single accent colour gives your design personality without creating noise. Use it for calls-to-action, highlights, and key moments — sparingly, so it pops when it matters."
        />
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
