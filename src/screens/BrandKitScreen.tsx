import { useApp } from '../context/AppContext';
import { useAppApi } from '../hooks/useAppApi';

export default function BrandKitScreen() {
  const { state, goTo, setLoading, setError, setBrandKit } = useApp();
  const { generateBrandKit } = useAppApi();
  const { brandKit, selectedMood, loading, loadingStep, error } = state;

  async function handleRegenerate() {
    if (!selectedMood) return;
    setLoading(true, 'Regenerating brand kit...');
    setError(null);
    try {
      const kit = await generateBrandKit(selectedMood, state.brief, selectedMood.name);
      setBrandKit(kit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate brand kit.');
    }
  }

  if (loading) {
    return (
      <div className="brand-kit-screen brand-kit-screen--loading">
        <div className="loading-block">
          <div className="spinner spinner--large" />
          <p className="loading-block__label">{loadingStep || 'Building brand kit...'}</p>
          <p className="loading-block__sublabel">Claude is generating your colour system, typography, and component specs</p>
        </div>
      </div>
    );
  }

  if (error && !brandKit) {
    return (
      <div className="brand-kit-screen brand-kit-screen--error">
        <div className="step-header">
          <h2 className="step-title">Something went wrong</h2>
          <p className="step-subtitle">{error}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleRegenerate}>
          Try Again
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => goTo('moods')}>
          ← Back to Moods
        </button>
      </div>
    );
  }

  if (!brandKit) return null;

  const { colors, typography, spacing, components, layoutRules } = brandKit;

  const colorEntries: [string, string][] = [
    ['Primary', colors.primary],
    ['Secondary', colors.secondary],
    ['Accent', colors.accent],
    ['Background', colors.background],
    ['Text', colors.text],
    ['Success', colors.success],
    ['Warning', colors.warning],
    ['Error', colors.error],
  ];

  return (
    <div className="brand-kit-screen">
      <div className="step-header">
        <div className="step-number">Step 2 of 3</div>
        <h2 className="step-title">{brandKit.moodName}</h2>
        <p className="step-subtitle">Your brand kit — ready to use in any project</p>
      </div>

      {/* Colour Palette */}
      <section className="brand-kit-section">
        <h3 className="brand-kit-section__title">Colour Palette</h3>
        <div className="brand-kit-colors">
          {colorEntries.map(([label, hex]) => (
            <div key={label} className="brand-kit-color-item">
              <div className="brand-kit-color-swatch" style={{ backgroundColor: hex }} />
              <div className="brand-kit-color-info">
                <span className="brand-kit-color-label">{label}</span>
                <span className="brand-kit-color-hex">{hex}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="brand-kit-section">
        <h3 className="brand-kit-section__title">Typography</h3>
        <div className="brand-kit-type-specimen">
          <div className="brand-kit-type-heading" style={{ fontFamily: typography.headingFont, fontWeight: typography.headingWeight }}>
            The quick brown fox
          </div>
          <div className="brand-kit-type-body" style={{ fontFamily: typography.bodyFont, fontWeight: typography.bodyWeight }}>
            Body text — clear, readable, and balanced. Line height {typography.lineHeightBody}.
          </div>
          <div className="brand-kit-type-meta">
            <span>Heading: {typography.headingFont.split(',')[0]}</span>
            <span>Body: {typography.bodyFont.split(',')[0]}</span>
            <span>Base: {typography.baseSizePx}px</span>
            <span>Scale ratio: {typography.scaleRatio}</span>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <section className="brand-kit-section">
        <h3 className="brand-kit-section__title">Spacing Scale ({spacing.baseUnit}px base)</h3>
        <div className="brand-kit-spacing-scale">
          {spacing.scale.map(val => (
            <div key={val} className="brand-kit-spacing-item">
              <div className="brand-kit-spacing-bar" style={{ width: `${Math.min(val, 96)}px`, height: '20px', backgroundColor: 'var(--color-accent)', borderRadius: '3px', opacity: 0.7 }} />
              <span className="brand-kit-spacing-val">{val}px</span>
            </div>
          ))}
        </div>
      </section>

      {/* Layout Rules */}
      {layoutRules.length > 0 && (
        <section className="brand-kit-section">
          <h3 className="brand-kit-section__title">Layout Rules</h3>
          <ul className="brand-kit-rules">
            {layoutRules.map((rule, i) => (
              <li key={i} className="brand-kit-rule">{rule}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Component Guidance */}
      {components.length > 0 && (
        <section className="brand-kit-section">
          <h3 className="brand-kit-section__title">Component Guidance</h3>
          <div className="brand-kit-components">
            {components.map(c => (
              <div key={c.name} className="brand-kit-component-card">
                <div className="brand-kit-component-name">{c.name}</div>
                <div className="brand-kit-component-desc">{c.description}</div>
                {c.cssExample && (
                  <pre className="brand-kit-component-css">{c.cssExample}</pre>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="step-nav">
        <button type="button" className="btn btn-ghost" onClick={() => goTo('typography')}>
          ← Back
        </button>
        <div className="step-nav__actions">
          <button type="button" className="btn btn-secondary" onClick={handleRegenerate}>
            Regenerate
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => goTo('images')}>
            Add Images
          </button>
          <button type="button" className="btn btn-accent" onClick={() => goTo('paths')}>
            Generate Mockups →
          </button>
          <button type="button" className="btn btn-primary" onClick={() => goTo('export')}>
            Export →
          </button>
        </div>
      </div>
    </div>
  );
}
