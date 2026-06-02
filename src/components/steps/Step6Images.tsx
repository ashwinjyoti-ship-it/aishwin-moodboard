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
  // lock: Record<sectionId, Set<photoId>>
  const [lockedImages, setLockedImages] = useState<Record<string, Set<string>>>({});
  // colour tint toggle
  const [tintEnabled, setTintEnabled] = useState(true);

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

  function toggleLock(sectionId: string, photoId: string) {
    setLockedImages(prev => {
      const locked = new Set(prev[sectionId] ?? []);
      if (locked.has(photoId)) {
        locked.delete(photoId);
      } else {
        locked.add(photoId);
      }
      return { ...prev, [sectionId]: locked };
    });
  }

  async function handleSwap(section: Section) {
    const locked = lockedImages[section.id] ?? new Set<string>();
    const currentImages = imageMap[section.id]?.images ?? [];
    const lockedImgs = currentImages.filter(img => locked.has(img.id));
    const unlockedCount = Math.max(section.count - lockedImgs.length, 0);
    if (unlockedCount === 0) return;

    setSwapping(section.id);
    const nextPage = (swapPages[section.id] ?? 1) + 1;
    setSwapPages(prev => ({ ...prev, [section.id]: nextPage }));

    try {
      const res = await fetch(`${API_BASE}/api/fetch-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: [{ ...section, count: unlockedCount, page: nextPage }] }),
      });
      const data: SectionImages = await res.json();
      const newImages = (data[section.id]?.images ?? []).slice(0, unlockedCount);
      const merged = [...lockedImgs, ...newImages];
      setImageMap(prev => ({
        ...prev,
        [section.id]: { success: true, images: merged },
      }));
    } finally {
      setSwapping(null);
    }
  }

  function handleNext() {
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
  const accentColor = state.accentColor;

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 7 of 9</span>
        <h1 className="step-title">Review &amp; approve images</h1>
        <p className="step-subtitle">
          Lock images you love, then swap the rest. Hit Swap ↻ to fetch fresh alternatives for unlocked slots.
        </p>
      </div>

      <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', marginBottom: '0.5rem' }}>
        <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--color-accent)', borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '1.5rem', textAlign: 'right' }}>{progressPct}% complete</p>

      {/* Tint toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          type="button"
          className={`tint-toggle ${tintEnabled ? 'tint-toggle--on' : ''}`}
          onClick={() => setTintEnabled(t => !t)}
          title="Apply your palette colour as a tint over images"
        >
          <span className="tint-toggle__dot" />
          <span>Colour Tint</span>
          <span className="tint-toggle__label">{tintEnabled ? 'ON' : 'OFF'}</span>
        </button>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
          Previews images in your accent colour — {accentColor}
        </span>
      </div>

      <div className="step-body">
        {loading && !hasAnyImages && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
            Fetching images from Unsplash…
          </div>
        )}

        {state.sections.map(section => {
          const result = imageMap[section.id];
          const isSwapping = swapping === section.id;
          const sectionLocked = lockedImages[section.id] ?? new Set<string>();
          const lockedCount = sectionLocked.size;

          return (
            <div key={section.id} className="image-section-group">
              <div className="image-section-header">
                <div className="image-section-title">{section.name}</div>
                {lockedCount > 0 && (
                  <span className="image-section-lock-badge">
                    🔒 {lockedCount} locked
                  </span>
                )}
              </div>

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
                  {result.images.map((img, i) => {
                    const isLocked = sectionLocked.has(img.id);
                    return (
                      <div
                        key={img.id || i}
                        className={`image-card ${isLocked ? 'image-card--locked' : ''}`}
                      >
                        {img.placeholder || !img.url ? (
                          <div
                            className="image-card__placeholder"
                            style={{ background: `linear-gradient(135deg, ${state.primaryColor}cc, ${accentColor}44)` }}
                          >
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>No API key</span>
                          </div>
                        ) : (
                          <div className="image-card__photo-wrap">
                            <img
                              src={img.thumb}
                              alt={img.alt}
                              className="image-card__photo"
                              loading="lazy"
                            />
                            {tintEnabled && (
                              <div
                                className="image-card__tint"
                                style={{ background: accentColor }}
                              />
                            )}
                            <button
                              type="button"
                              className={`image-card__lock-btn ${isLocked ? 'image-card__lock-btn--locked' : ''}`}
                              onClick={() => toggleLock(section.id, img.id)}
                              title={isLocked ? 'Locked — click to unlock' : 'Click to lock this image'}
                            >
                              {isLocked ? '🔒' : '🔓'}
                            </button>
                          </div>
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
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: '0.75rem', fontSize: '0.85rem', padding: '0.4rem 1rem' }}
                onClick={() => handleSwap(section)}
                disabled={isSwapping || (lockedImages[section.id]?.size ?? 0) >= section.count}
              >
                {isSwapping ? 'Fetching…' : lockedImages[section.id]?.size === section.count ? 'All locked' : 'Swap unlocked ↻'}
              </button>
            </div>
          );
        })}

        <TeachingTooltip
          variant="cool"
          title="Principle 4: Reference Images Build Trust"
          body="Lock images you love — only unlocked slots get refreshed on swap. The colour tint previews how your images look in your palette hue before you commit."
        />
      </div>

      <StepNav onBack={onBack} onNext={handleNext} nextLabel="Generate Mood Board →" />
    </div>
  );
}
