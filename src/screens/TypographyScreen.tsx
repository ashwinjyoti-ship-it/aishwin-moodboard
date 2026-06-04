import { useApp } from '../context/AppContext';
import { useAppApi } from '../hooks/useAppApi';
import { TypographyDirection } from '../types';

function TypographyCard({
  direction,
  selected,
  onSelect,
}: {
  direction: TypographyDirection;
  selected: boolean;
  onSelect: (d: TypographyDirection) => void;
}) {
  const headingStyle: React.CSSProperties = {
    fontFamily: direction.displayFont,
    fontWeight: direction.headingWeight,
    fontSize: '1.6rem',
    lineHeight: 1.2,
    margin: '0 0 0.4rem',
    letterSpacing: '-0.02em',
  };
  const bodyStyle: React.CSSProperties = {
    fontFamily: direction.bodyFont,
    fontWeight: direction.bodyWeight,
    fontSize: '0.88rem',
    lineHeight: 1.7,
    color: 'var(--color-muted)',
    margin: 0,
  };

  return (
    <button
      type="button"
      className={`typography-card${selected ? ' typography-card--selected' : ''}`}
      onClick={() => onSelect(direction)}
    >
      <div className="typography-card__specimen">
        <p style={headingStyle}>{direction.specimen}</p>
        <p style={bodyStyle}>Aa Bb Cc — {direction.personality}</p>
      </div>
      <div className="typography-card__meta">
        <span className="typography-card__category">{direction.category}</span>
        <span className="typography-card__heading-font">{direction.displayFont.split(',')[0].replace(/['"]/g, '')}</span>
        <span className="typography-card__industry">{direction.industryFit}</span>
      </div>
      {selected && <div className="typography-card__check">✓</div>}
    </button>
  );
}

export default function TypographyScreen() {
  const { state, selectTypography, goTo, setLoading, setError, setBrandKit } = useApp();
  const { generateBrandKit } = useAppApi();
  const { typographyDirections, selectedMood, selectedTypography, loading, loadingStep, error } = state;

  async function handleSelect(direction: TypographyDirection) {
    if (!selectedMood) return;
    selectTypography(direction);
    goTo('brand-kit');
    setLoading(true, 'Building your brand kit...');
    try {
      const brandKit = await generateBrandKit(selectedMood, state.brief, selectedMood.name, direction);
      setBrandKit(brandKit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate brand kit. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner--large" />
        <p className="loading-screen__label">{loadingStep || 'Generating typography options...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <p>{error}</p>
        <button type="button" className="btn btn-ghost" onClick={() => goTo('moods')}>← Back</button>
      </div>
    );
  }

  return (
    <div className="typography-screen">
      <div className="step-header">
        <div className="step-number">Step 1.5 of 3</div>
        <h2 className="step-title">Pick a type direction</h2>
        <p className="step-subtitle">
          Choose the typography that matches your brand's voice — this shapes your entire brand kit.
        </p>
      </div>

      <div className="typography-grid">
        {typographyDirections.map(direction => (
          <TypographyCard
            key={direction.id}
            direction={direction}
            selected={selectedTypography?.id === direction.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <div className="step-nav">
        <button type="button" className="btn btn-ghost" onClick={() => goTo('moods')}>
          ← Back
        </button>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
          Selecting a style generates your brand kit
        </p>
      </div>
    </div>
  );
}
