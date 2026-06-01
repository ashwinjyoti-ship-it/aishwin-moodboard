import { useState, useEffect, useCallback } from 'react';
import { WizardState, Section, UnsplashPhoto } from '../../types';
import StepNav from '../StepNav';
import TeachingTooltip from '../TeachingTooltip';

interface Props {
  state: WizardState;
  onUpdate: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

type SectionImages = Record<string, { success: boolean; images: UnsplashPhoto[]; message?: string }>;

export default function Step6Images({ state, onUpdate, onNext, onBack }: Props) {
  const [imageMap, setImageMap] = useState<SectionImages>({});
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState<string | null>(null);
  const [swapPages, setSwapPages] = useState<Record<string, number>>({});

  const fetchImages = useCallback(async (sectionsToFetch: Section[], pageOverrides: Record<string, number> = {}) => {
    setLoading(true);
    try {
      const payload = sectionsToFetch.map(s => ({
        ...s,
        page: pageOverrides[s.id] ?? 1,
      }));
      const res = await fetch(`${API_BASE}/api/fetch-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: payload }),
      });
      const data: SectionImages = await res.json();
      setImageMap(prev => ({ ...prev, ...data }));
    } catch {
      // leave existing state on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (state.sections.length > 0) {
      fetchImages(state.sections);
    }
  }, []);

  async function handleSwap(section: Section) {
    setSwapping(section.id);
    const nextPage = (swapPages[section.id] ?? 1) + 1;
    setSwapPages(prev => ({ ...prev, [section.id]: nextPage }));
    try {
      const res = await fetch(`${API_BASE}/api/fetch-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: [{ ...section, page: nextPage }] }),
      });
      const data: SectionImages = await res.json();
      setImageMap(prev => ({ ...prev, ...data }));
    } finally {
      setSwapping(null);
    }
  }

  function handleNext() {
    // Merge fetched images back into sections state
    const updatedSections = state.sections.map(s => ({
      ...s,
      images: imageMap[s.id]?.images ?? s.images,
      approved: true,
    }));
    onUpdate({ sections: updatedSections });
    onNext();
  }

  const progressPct = Math.round((7 / 9) * 100);
  const hasAnyImages = Object.values(imageMap).some(v => v.images.length > 0);

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 7 of 9</span>
        <h1 className="step-title">Review &amp; approve images</h1>
        <p className="step-subtitle">
          Approve your mood board images. Hit Swap ↻ on any to fetch fresh alternatives.
        </p>
      </div>

      <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', marginBottom: '0.5rem' }}>
        <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--color-accent)', borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '2rem', textAlign: 'right' }}>{progressPct}% complete</p>

      <div className="step-body">
        {loading && !hasAnyImages && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
            Fetching images from Unsplash…
          </div>
        )}

        {state.sections.map(section => {
          const result = imageMap[section.id];
          const isSwapping = swapping === section.id;

          return (
            <div key={section.id} className="image-section-group">
              <div className="image-section-title">{section.name}</div>

              {!result && (
                <div style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Loading…</div>
              )}

              {result && !result.success && (
                <div style={{ padding: '0.75rem 1rem', background: '#fff3f3', borderRadius: '8px', color: '#c0392b', fontSize: '0.9rem' }}>
                  {result.message || 'Failed to load images'}
                </div>
              )}

              {result?.success && (
                <div className="image-cards-row">
                  {result.images.map((img, i) => (
                    <div key={img.id || i} className="image-card">
                      {img.placeholder || !img.url ? (
                        <div
                          className="image-card__placeholder"
                          style={{ background: `linear-gradient(135deg, ${state.primaryColor}cc, ${state.accentColor}44)` }}
                        >
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>No API key</span>
                        </div>
                      ) : (
                        <img
                          src={img.thumb}
                          alt={img.alt}
                          className="image-card__photo"
                          loading="lazy"
                        />
                      )}
                      <div className="image-card__label">
                        <a
                          href={img.photographerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="image-card__credit"
                          title={`Photo by ${img.photographer} on Unsplash`}
                        >
                          📸 {img.photographer}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: '0.75rem', fontSize: '0.85rem', padding: '0.4rem 1rem' }}
                onClick={() => handleSwap(section)}
                disabled={isSwapping}
              >
                {isSwapping ? 'Fetching…' : 'Swap all ↻'}
              </button>
            </div>
          );
        })}

        <TeachingTooltip
          variant="cool"
          title="Principle 4: Reference Images Build Trust"
          body="Real people, real spaces = credibility. Notice how these images feel cohesive? That's intentional selection, not random. Every image reinforces your preset's mood."
        />
      </div>

      <StepNav onBack={onBack} onNext={handleNext} nextLabel="Generate Mood Board →" />
    </div>
  );
}
