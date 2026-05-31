
import { WizardState } from '../../types';
import { getPresetById } from '../../data/presets';
import StepNav from '../StepNav';

interface Props {
  state: WizardState;
  onNext: () => void;
  onBack: () => void;
}

function generateHTML(state: WizardState): string {
  const preset = getPresetById(state.presetId);
  const primary = preset?.colors.primary ?? '#FAFAF8';
  const secondary = preset?.colors.secondary ?? '#1a1a18';
  const accent = state.accentColor;

  const sectionsHTML = state.sections.map((s) => `
    <div class="mb-section">
      <h3 class="mb-section-label">${s.charAt(0).toUpperCase() + s.slice(1)}</h3>
      <div class="mb-images">
        <div class="mb-image" style="background: linear-gradient(135deg, ${primary}, ${accent}22)"></div>
        <div class="mb-image" style="background: linear-gradient(135deg, ${accent}22, ${secondary}22)"></div>
        <div class="mb-image" style="background: linear-gradient(135deg, ${secondary}11, ${primary})"></div>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mood Board — ${state.projectName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #FAFAF8; color: #1a1a18; padding: 3rem 2rem; }
    .container { max-width: 960px; margin: 0 auto; }
    h1 { font-size: 2.5rem; font-weight: 300; margin-bottom: 0.25rem; }
    .subtitle { color: #8B8B86; margin-bottom: 3rem; font-size: 1rem; }
    .section-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #8B8B86; font-weight: 600; margin-bottom: 1rem; }
    .palette { display: flex; gap: 1rem; margin-bottom: 3rem; }
    .swatch { flex: 1; height: 80px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.06); }
    .swatch-label { font-size: 0.8rem; text-align: center; margin-top: 0.5rem; color: #8B8B86; }
    .swatch-hex { font-size: 0.75rem; text-align: center; font-family: monospace; }
    .swatch-group { flex: 1; }
    .typography { background: white; border-radius: 12px; padding: 2rem; margin-bottom: 3rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .type-heading { font-size: 2rem; font-weight: 400; margin-bottom: 0.75rem; color: ${secondary}; }
    .type-body { font-size: 1rem; line-height: 1.8; color: #8B8B86; margin-bottom: 0.75rem; }
    .type-caption { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: #8B8B86; }
    .keywords { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 3rem; }
    .keyword { padding: 0.3rem 0.9rem; border-radius: 100px; border: 1px solid ${accent}; color: ${accent}; font-size: 0.85rem; }
    .mb-section { margin-bottom: 2.5rem; }
    .mb-section-label { font-size: 1rem; font-weight: 500; margin-bottom: 1rem; text-transform: capitalize; }
    .mb-images { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
    .mb-image { height: 120px; border-radius: 8px; }
    .cta { display: inline-block; padding: 0.875rem 2rem; background: ${accent}; color: white; border-radius: 8px; font-weight: 500; text-decoration: none; margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${state.projectName || 'Your Project'}</h1>
    <p class="subtitle">${state.businessType ? state.businessType + ' — ' : ''}Mood Board &amp; Design Direction</p>

    <p class="section-title">Colour Palette — ${preset?.name ?? ''}</p>
    <div class="palette">
      <div class="swatch-group">
        <div class="swatch" style="background: ${primary}; border: 1px solid rgba(0,0,0,0.1);"></div>
        <p class="swatch-label">Primary</p>
        <p class="swatch-hex">${primary}</p>
      </div>
      <div class="swatch-group">
        <div class="swatch" style="background: ${secondary};"></div>
        <p class="swatch-label">Secondary</p>
        <p class="swatch-hex">${secondary}</p>
      </div>
      <div class="swatch-group">
        <div class="swatch" style="background: ${accent};"></div>
        <p class="swatch-label">Accent</p>
        <p class="swatch-hex">${accent}</p>
      </div>
    </div>

    <p class="section-title">Typography</p>
    <div class="typography">
      <div class="type-heading">${state.projectName || 'Premium Wellness Studio'}</div>
      <p class="type-body">Expert guidance, compassionate care, real results. We help you achieve balance — from peak performance to deep restoration.</p>
      <span class="type-caption">Certified · Professional · Trusted</span>
    </div>

    ${state.keywords.length > 0 ? `
    <p class="section-title">Keywords</p>
    <div class="keywords">
      ${state.keywords.map((k) => `<span class="keyword">${k}</span>`).join('')}
    </div>
    ` : ''}

    <p class="section-title">Sections</p>
    ${sectionsHTML}

    <a class="cta" href="#">Get Started</a>
  </div>
</body>
</html>`;
}

export default function Step7Generate({ state, onNext, onBack }: Props) {
  const preset = getPresetById(state.presetId);
  const primary = preset?.colors.primary ?? '#FAFAF8';
  const secondary = preset?.colors.secondary ?? '#1a1a18';
  const accent = state.accentColor;

  function downloadHTML() {
    const html = generateHTML(state);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(state.projectName || 'moodboard').replace(/\s+/g, '-').toLowerCase()}-moodboard.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 7 of 8</span>
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
                  <div key={s} className="moodboard-image-card">
                    <div
                      className="moodboard-image-placeholder"
                      style={{ background: `linear-gradient(135deg, ${primary}, ${accent}33)` }}
                    />
                    <div className="moodboard-image-caption">{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="export-row" style={{ gap: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={downloadHTML}>
            ↓ Download HTML
          </button>
          <button type="button" className="btn btn-accent" onClick={onNext}>
            Finish →
          </button>
        </div>
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel="Finish →" />
    </div>
  );
}
