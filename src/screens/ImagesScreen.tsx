import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUnsplash } from '../hooks/useUnsplash';
import { UnsplashPhoto } from '../types';

export default function ImagesScreen() {
  const { state, goTo, setImages } = useApp();
  const { search, loading } = useUnsplash();
  const { selectedMood, images: selectedImages } = state;

  const [sectionImages, setSectionImages] = useState<Record<string, UnsplashPhoto[]>>({});
  const [fetched, setFetched] = useState(false);

  const sections = selectedMood?.sections?.slice(0, 5) || ['Hero', 'About', 'Services'];

  useEffect(() => {
    if (fetched || !selectedMood) return;
    setFetched(true);

    Promise.all(
      sections.map(async (section) => {
        const query = `${section.toLowerCase()} ${selectedMood.keywords.slice(0, 2).join(' ')}`;
        const results = await search(query, 3);
        return [section, results] as [string, UnsplashPhoto[]];
      })
    ).then(pairs => {
      const map: Record<string, UnsplashPhoto[]> = {};
      pairs.forEach(([s, imgs]) => { map[s] = imgs; });
      setSectionImages(map);
    });
  }, [selectedMood, fetched]);

  function toggleImage(photo: UnsplashPhoto) {
    const already = selectedImages.some(i => i.id === photo.id);
    if (already) {
      setImages(selectedImages.filter(i => i.id !== photo.id));
    } else {
      setImages([...selectedImages, photo]);
    }
  }

  const isSelected = (photo: UnsplashPhoto) => selectedImages.some(i => i.id === photo.id);

  return (
    <div className="images-screen">
      <div className="step-header">
        <div className="step-number">Optional</div>
        <h2 className="step-title">Reference Images</h2>
        <p className="step-subtitle">
          Select images that capture the feel of your <em>{selectedMood?.name}</em> direction.
          {selectedImages.length > 0 && <> <strong>{selectedImages.length} selected</strong></>}
        </p>
      </div>

      {loading && (
        <div className="loading-block" style={{ padding: '2rem' }}>
          <div className="spinner spinner--large" />
          <p className="loading-block__label">Fetching reference images...</p>
        </div>
      )}

      {!loading && sections.map(section => {
        const imgs = sectionImages[section] || [];
        if (imgs.length === 0) return null;
        return (
          <div key={section} className="image-section-group">
            <div className="image-section-title">{section}</div>
            <div className="image-cards-row">
              {imgs.map(photo => (
                <button
                  key={photo.id}
                  type="button"
                  className={`image-card${isSelected(photo) ? ' image-card--selected' : ''}`}
                  onClick={() => toggleImage(photo)}
                  style={{ background: 'none', border: '2px solid transparent', cursor: 'pointer', padding: 0 }}
                >
                  {photo.url ? (
                    <img
                      src={photo.thumb || photo.url}
                      alt={photo.alt}
                      className="image-card__photo"
                      style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block', borderRadius: '6px 6px 0 0' }}
                    />
                  ) : (
                    <div
                      className="image-card__placeholder"
                      style={{ height: '120px', background: 'var(--color-border)', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{photo.alt}</span>
                    </div>
                  )}
                  <div className="image-card__label">
                    <span className="image-card__name">{photo.photographer}</span>
                    {isSelected(photo) && <span style={{ color: 'var(--color-accent)', fontSize: '0.75rem', fontWeight: 600 }}>✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="step-nav">
        <button type="button" className="btn btn-ghost" onClick={() => goTo('brand-kit')}>
          ← Back
        </button>
        <div className="step-nav__actions">
          <button type="button" className="btn btn-secondary" onClick={() => goTo('export')}>
            Skip
          </button>
          <button type="button" className="btn btn-primary" onClick={() => goTo('export')}>
            Continue to Export →
          </button>
        </div>
      </div>
    </div>
  );
}
