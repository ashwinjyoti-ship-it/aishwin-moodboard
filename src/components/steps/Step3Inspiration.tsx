import React, { useState, useRef, useEffect } from 'react';
import { WizardState } from '../../types';
import StepNav from '../StepNav';
import TeachingTooltip from '../TeachingTooltip';
import { useClaude } from '../../hooks/useClaude';

interface Props {
  state: WizardState;
  onUpdate: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Inspiration({ state, onUpdate, onNext, onBack }: Props) {
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [analysedImageUrl, setAnalysedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);

  const { analyzeImage, analysis, loading: analysisLoading } = useClaude();

  const images = state.inspirationImages;
  const maxReached = images.length >= 6;

  // Trigger analysis when a new image is the first one added
  useEffect(() => {
    if (images.length === 0) return;
    const latest = images[images.length - 1];

    // Only analyse if this image hasn't been analysed yet
    if (latest.url === analysedImageUrl) return;

    setAnalysedImageUrl(latest.url);

    if (pendingFileRef.current) {
      analyzeImage(pendingFileRef.current);
      pendingFileRef.current = null;
    } else if (latest.type === 'url') {
      analyzeImage(latest.url);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  function addFileImages(files: FileList | null) {
    if (!files) return;
    const remaining = 6 - images.length;
    const newImages: WizardState['inspirationImages'] = [];
    const fileArray = Array.from(files).slice(0, remaining);

    // Store the first new file for analysis (only analyse one)
    if (fileArray.length > 0 && images.length === 0) {
      pendingFileRef.current = fileArray[0];
    } else if (fileArray.length > 0) {
      pendingFileRef.current = fileArray[0];
    }

    fileArray.forEach((file) => {
      const url = URL.createObjectURL(file);
      newImages.push({ type: 'file', url, name: file.name });
    });
    onUpdate({ inspirationImages: [...images, ...newImages] });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    addFileImages(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    addFileImages(e.dataTransfer.files);
  }

  function handleAddUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.match(/^https?:\/\/.+/i)) {
      setUrlError('URL must start with http:// or https://');
      return;
    }
    setUrlError('');
    onUpdate({ inspirationImages: [...images, { type: 'url', url: trimmed }] });
    setUrlInput('');
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);
    onUpdate({ inspirationImages: updated });
  }

  function addMoodWordToKeywords(word: string) {
    const trimmed = word.trim().toLowerCase();
    if (!trimmed || state.keywords.includes(trimmed) || state.keywords.length >= 8) return;
    onUpdate({ keywords: [...state.keywords, trimmed] });
  }

  const showAnalysis = (analysis && analysis.mood.length > 0) || analysisLoading;

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 4 of 9</span>
        <h1 className="step-title">Add inspiration images</h1>
        <p className="step-subtitle">
          Upload screenshots, Pinterest saves, or photos that capture the vibe you're going for. Max 6 images.
        </p>
      </div>

      <div className="step-body">
        {!maxReached && (
          <div
            className={`inspiration-dropzone${dragOver ? ' dragover' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
            <p style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Drop images here or click to upload</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
              {images.length}/6 images added
            </p>
          </div>
        )}

        {!maxReached && (
          <div className="form-group">
            <label className="form-label">Or paste an image URL</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                className="form-input"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setUrlError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddUrl(); }}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddUrl}
                disabled={!urlInput.trim()}
              >
                Add
              </button>
            </div>
            {urlError && <p style={{ fontSize: '0.8rem', color: '#e44', marginTop: '0.25rem' }}>{urlError}</p>}
          </div>
        )}

        {images.length > 0 && (
          <div>
            <p className="form-label" style={{ marginBottom: '0.75rem' }}>Your references ({images.length}/6)</p>
            <div className="inspiration-grid">
              {images.map((img, i) => (
                <div key={i} className="inspiration-thumb">
                  <img src={img.url} alt={'type' in img && img.type === 'file' ? img.name : 'Reference'} />
                  <button
                    type="button"
                    className="inspiration-remove"
                    onClick={() => removeImage(i)}
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis card */}
        {showAnalysis && (
          <div className="analysis-card">
            {analysisLoading ? (
              <div className="analysis-loading">
                <div className="analysis-spinner" />
                <span>Analysing your inspiration...</span>
              </div>
            ) : analysis && analysis.mood.length > 0 ? (
              <>
                <p className="analysis-card__label">Detected mood — click to add to keywords</p>
                <div className="analysis-chips">
                  {analysis.mood.map((word) => {
                    const alreadyAdded = state.keywords.includes(word.trim().toLowerCase());
                    return (
                      <button
                        key={word}
                        type="button"
                        className={`analysis-chip-btn${alreadyAdded ? ' analysis-chip-btn--added' : ''}`}
                        onClick={() => addMoodWordToKeywords(word)}
                        disabled={alreadyAdded || state.keywords.length >= 8}
                        title={alreadyAdded ? 'Already in keywords' : 'Add to keywords'}
                      >
                        {word}
                        {!alreadyAdded && <span className="analysis-chip-btn__plus">+</span>}
                        {alreadyAdded && <span className="analysis-chip-btn__check">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {analysis.colors.length > 0 && (
                  <>
                    <p className="analysis-card__label" style={{ marginTop: '1rem' }}>Dominant colours (reference only)</p>
                    <div className="analysis-swatches">
                      {analysis.colors.map((hex) => (
                        <div
                          key={hex}
                          className="analysis-swatch"
                          style={{ background: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  </>
                )}

                {analysis.placeholder && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.75rem' }}>
                    Using example values — image analysis unavailable.
                  </p>
                )}
              </>
            ) : null}
          </div>
        )}

        <TeachingTooltip
          variant="cool"
          title="Principle: Reference Before You Create"
          body="AI just read the mood of your inspiration. These extracted colours and descriptors are now your design brief — the starting point for everything else."
        />
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
