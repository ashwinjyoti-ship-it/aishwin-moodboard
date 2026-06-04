import { useApp } from '../context/AppContext';
import { useAppApi } from '../hooks/useAppApi';
import { toMarkdown, toJSON, toCSSTokens } from '../utils/exportFormatters';
import { downloadBlob } from '../utils/helpers';
import { FEATURE_FLAGS } from '../utils/featureFlags';

export default function ExportScreen() {
  const { state, goTo, dispatch } = useApp();
  const { saveProject } = useAppApi();
  const { brandKit, selectedMood, brief, projectName } = state;

  if (!brandKit || !selectedMood) {
    return (
      <div className="export-screen">
        <div className="step-header">
          <h2 className="step-title">No brand kit yet</h2>
          <p className="step-subtitle">Go back and select a mood to generate your brand kit first.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => goTo('brief')}>
          Start Over
        </button>
      </div>
    );
  }

  const name = projectName || selectedMood.name;

  function handleDownload(format: 'markdown' | 'json' | 'css') {
    if (!brandKit) return;
    if (format === 'markdown') {
      downloadBlob(toMarkdown(brandKit, name), `${name.toLowerCase().replace(/\s+/g, '-')}-brand-kit.md`, 'text/markdown');
    } else if (format === 'json') {
      downloadBlob(toJSON(brandKit), `${name.toLowerCase().replace(/\s+/g, '-')}-brand-kit.json`, 'application/json');
    } else {
      downloadBlob(toCSSTokens(brandKit, name), `${name.toLowerCase().replace(/\s+/g, '-')}-tokens.css`, 'text/css');
    }
  }

  async function handleSave() {
    if (!brandKit || !selectedMood) return;
    try {
      const id = await saveProject({ brief, projectName: name, mood: selectedMood, brandKit });
      dispatch({ type: 'SET_PROJECT_ID', projectId: id });
    } catch {
      // fail silently on save — export still works
    }
  }

  return (
    <div className="export-screen">
      <div className="step-header">
        <div className="step-number">Step 3 of 3</div>
        <h2 className="step-title">Export your brand kit</h2>
        <p className="step-subtitle">Download in any format — ready to hand off or start building.</p>
      </div>

      {/* Quick colour preview */}
      <div className="export-palette-preview">
        {[brandKit.colors.primary, brandKit.colors.secondary, brandKit.colors.accent, brandKit.colors.background, brandKit.colors.text].map((hex, i) => (
          <div key={i} className="export-palette-swatch" style={{ backgroundColor: hex }} title={hex} />
        ))}
        <span className="export-palette-name">{brandKit.moodName}</span>
      </div>

      <div className="export-options">
        <div className="export-option export-option--primary">
          <span className="export-option__icon">📝</span>
          <div>
            <div className="export-option__title">Markdown Brand Guide</div>
            <div className="export-option__desc">Human-readable spec with colours, typography, spacing, and component guidance</div>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => handleDownload('markdown')}>
            Download .md
          </button>
        </div>

        <div className="export-option">
          <span className="export-option__icon">🎨</span>
          <div>
            <div className="export-option__title">CSS Design Tokens</div>
            <div className="export-option__desc">Drop-in CSS variables file — paste into any project and start building immediately</div>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => handleDownload('css')}>
            Download .css
          </button>
        </div>

        <div className="export-option">
          <span className="export-option__icon">{'{}'}</span>
          <div>
            <div className="export-option__title">JSON Design Tokens</div>
            <div className="export-option__desc">Machine-readable format, compatible with Style Dictionary and Figma Tokens</div>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => handleDownload('json')}>
            Download .json
          </button>
        </div>

        {FEATURE_FLAGS.FLUX_MOCKUPS && (
          <div className="export-option">
            <span className="export-option__icon">🖼️</span>
            <div>
              <div className="export-option__title">AI Mockups</div>
              <div className="export-option__desc">Generate unique section mockups using Flux — tailored to your brand colours</div>
            </div>
            <button type="button" className="btn btn-accent" onClick={() => goTo('mockups')}>
              Generate
            </button>
          </div>
        )}
      </div>

      <div className="step-nav">
        <button type="button" className="btn btn-ghost" onClick={() => goTo('brand-kit')}>
          ← Back
        </button>
        <div className="step-nav__actions">
          <button type="button" className="btn btn-secondary" onClick={handleSave} disabled={!!state.projectId}>
            {state.projectId ? 'Saved ✓' : 'Save Project'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => goTo('brief')}>
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
