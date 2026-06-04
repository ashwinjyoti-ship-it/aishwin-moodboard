import { useApp } from '../context/AppContext';
import { useAppApi } from '../hooks/useAppApi';
import { toMarkdown, toJSON, toCSSTokens } from '../utils/exportFormatters';
import { downloadBlob, downloadBlobObject } from '../utils/helpers';
import { FEATURE_FLAGS } from '../utils/featureFlags';

async function downloadMockupImages(images: { sectionName: string; imageUrl: string }[], projectName: string) {
  // Dynamic import to keep the bundle lean when not used
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const folder = zip.folder('mockups')!;

  await Promise.all(images.map(async ({ sectionName, imageUrl }) => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const ext = blob.type.includes('png') ? 'png' : 'webp';
      folder.file(`${sectionName.toLowerCase().replace(/\s+/g, '-')}.${ext}`, blob);
    } catch {
      // skip failed image
    }
  }));

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlobObject(zipBlob, `${projectName.toLowerCase().replace(/\s+/g, '-')}-mockups.zip`);
}

export default function ExportScreen() {
  const { state, goTo, dispatch } = useApp();
  const { saveProject } = useAppApi();
  const { brandKit, selectedMood, brief, projectName, mockupImages } = state;

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
  const hasMockups = mockupImages.length > 0;

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

        {FEATURE_FLAGS.FLUX_MOCKUPS && hasMockups && (
          <div className="export-option export-option--primary">
            <span className="export-option__icon">🖼️</span>
            <div>
              <div className="export-option__title">Mockup Images ({mockupImages.length})</div>
              <div className="export-option__desc">Download all generated section mockups as a ZIP file</div>
            </div>
            <button type="button" className="btn btn-accent" onClick={() => downloadMockupImages(mockupImages, name)}>
              Download .zip
            </button>
          </div>
        )}

        {FEATURE_FLAGS.FLUX_MOCKUPS && !hasMockups && (
          <div className="export-option">
            <span className="export-option__icon">🖼️</span>
            <div>
              <div className="export-option__title">AI Section Mockups</div>
              <div className="export-option__desc">Generate unique mockups for each section using Flux — styled with your locked brand colours (~$0.05/image)</div>
            </div>
            <button type="button" className="btn btn-accent" onClick={() => goTo('paths')}>
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
