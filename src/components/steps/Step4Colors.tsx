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

  const primary = state.primaryColor || preset?.colors.primary || '#FFFFFF';
  const secondary = state.secondaryColor || preset?.colors.secondary || '#1a1a18';
  const accent = state.accentColor;

  function resetToPreset() {
    if (preset) {
      onUpdate({
        primaryColor: preset.colors.primary,
        secondaryColor: preset.colors.secondary,
        accentColor: preset.colors.accent,
      });
    }
  }

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 5 of 9</span>
        <h1 className="step-title">Refine your palette</h1>
        <p className="step-subtitle">
          Click any swatch to customise the colour. See a live preview below.
        </p>
      </div>

      <div className="step-body">
        <div className="color-swatch-editor">
          {[
            { label: 'Primary', value: primary, key: 'primaryColor' as const },
            { label: 'Secondary', value: secondary, key: 'secondaryColor' as const },
            { label: 'Accent', value: accent, key: 'accentColor' as const },
          ].map(({ label, value, key }) => (
            <div key={label} className="color-swatch-item">
              <div
                className="color-swatch-preview"
                style={{ background: value }}
                title={`Click to edit ${label}`}
                onClick={() => document.getElementById(`picker-${key}`)?.click()}
              />
              <input
                id={`picker-${key}`}
                type="color"
                value={value}
                onChange={(e) => onUpdate({ [key]: e.target.value })}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{label}</span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-text)' }}>{value}</span>
            </div>
          ))}
        </div>

        {preset && (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: '0.85rem', textDecoration: 'underline', color: 'var(--color-muted)' }}
            onClick={resetToPreset}
          >
            Reset to preset defaults
          </button>
        )}

        <div className="color-preview-card">
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)', marginBottom: '1rem' }}>Live Preview</div>
          <div style={{ background: primary, border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ color: secondary, fontSize: '1.2rem', fontWeight: 500, margin: 0 }}>
              {state.projectName || 'Your Project Name'}
            </h3>
            <p style={{ color: secondary, fontSize: '0.9rem', opacity: 0.7, margin: 0 }}>
              Premium wellness services tailored to your lifestyle and goals.
            </p>
            <div>
              <button
                type="button"
                style={{
                  background: accent,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'default',
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        <TeachingTooltip
          variant="warm"
          title="Design Principle: The 60–30–10 Rule"
          body="Use your primary color for 60% of the space (backgrounds), secondary for 30% (text, structure), accent for 10% (CTAs, highlights). This ratio creates visual harmony."
        />
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
