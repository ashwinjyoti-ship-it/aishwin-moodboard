import { useState } from 'react';
import { WizardState } from '../../types';
import { getPresetById } from '../../data/presets';
import { useProjectApi } from '../../hooks/useProjectApi';
import { downloadZIP, downloadHTML } from '../../utils/exportUtils';
import StepNav from '../StepNav';
import TeachingTooltip from '../TeachingTooltip';

interface Props {
  state: WizardState;
  onNext: () => void;
  onBack: () => void;
}

export default function Step7Generate({ state, onNext, onBack }: Props) {
  const preset = getPresetById(state.presetId);
  const primary = preset?.colors.primary ?? '#FAFAF8';
  const secondary = preset?.colors.secondary ?? '#1a1a18';
  const accent = state.accentColor;

  const { saveProject } = useProjectApi();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await saveProject({
        name: state.projectName || 'Untitled',
        category: state.businessTypes.join(', '),
        presetName: state.presetId,
        projectData: {
          paletteColors: {
            primary: state.primaryColor,
            secondary: state.secondaryColor,
            accent: state.accentColor,
          },
          sections: state.sections,
          metadata: {
            keywords: state.keywords,
            presetId: state.presetId,
          },
        },
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 8 of 9</span>
        <h1 className="step-title">Your mood board is ready</h1>
        <p className="step-subtitle">
          Here's your design direction at a glance. Download it or continue to finish.
        </p>
      </div>

      <div className="step-body">
        <div className="moodboard-preview">
          <div className="moodboard-preview__header">
            <span className="moodboard-preview__title">
              {state.projectName || 'Your Project'}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
              {preset?.name}
            </span>
          </div>

          <div className="moodboard-preview__body">
            <div>
              <div className="moodboard-section-title">Colour Palette</div>
              <div className="moodboard-palette-row">
                {[primary, secondary, accent].map((color, i) => (
                  <div
                    key={i}
                    className="moodboard-palette-swatch"
                    style={{ background: color, border: '1px solid rgba(0,0,0,0.06)' }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="moodboard-section-title">Typography</div>
              <div className="moodboard-typography">
                <div className="moodboard-type-heading" style={{ color: secondary }}>
                  {state.projectName || 'Your Project Name'}
                </div>
                <p className="moodboard-type-body">
                  Expert guidance, compassionate care, real results. We help you achieve balance — from peak performance to deep restoration.
                </p>
                <span className="moodboard-type-caption">Certified · Professional · Trusted</span>
              </div>
            </div>

            {state.keywords.length > 0 && (
              <div>
                <div className="moodboard-section-title">Keywords</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {state.keywords.map((k) => (
                    <span key={k} style={{ padding: '0.2rem 0.75rem', borderRadius: '100px', border: `1px solid ${accent}`, color: accent, fontSize: '0.85rem' }}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="moodboard-section-title">Sections</div>
              <div className="moodboard-images-grid">
                {state.sections.map((s) => (
                  <div key={s.id} className="moodboard-image-card">
                    {s.images.length > 0 && s.images[0].url ? (
                      <img
                        src={s.images[0].thumb || s.images[0].url}
                        alt={s.name}
                        className="moodboard-image-placeholder"
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    ) : (
                      <div
                        className="moodboard-image-placeholder"
                        style={{ background: `linear-gradient(135deg, ${primary}, ${accent}33)` }}
                      />
                    )}
                    <div className="moodboard-image-caption">{s.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="export-options">
          <div className="export-option export-option--primary">
            <div className="export-option__icon">↓</div>
            <div>
              <div className="export-option__title">Download HTML</div>
              <div className="export-option__desc">Shareable standalone file. No login needed to view.</div>
            </div>
            <button type="button" className="btn btn-accent" onClick={() => downloadHTML(state)}>Download</button>
          </div>

          <div className="export-option">
            <div className="export-option__icon">⎁</div>
            <div>
              <div className="export-option__title">Download ZIP</div>
              <div className="export-option__desc">HTML + JSON metadata + README. For developers &amp; designers.</div>
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => downloadZIP(state)}>Download</button>
          </div>

          <div className="export-option">
            <div className="export-option__icon">💾</div>
            <div>
              <div className="export-option__title">Save to Projects</div>
              <div className="export-option__desc">Edit &amp; regenerate anytime. Stored in your session.</div>
            </div>
            <button
              type="button"
              className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleSave}
              disabled={saving || saved}
            >
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        </div>

        <TeachingTooltip
          variant="warm"
          title="Principle 5: Iteration Refines Vision"
          body="Save this. Change one color tomorrow. See how it shifts the feeling? Regenerate with different images. This is design thinking — not a one-shot output, but a living reference that evolves."
        />
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel="Finish →" />
    </div>
  );
}
