import React, { useState, useRef } from 'react';
import { WizardState } from '../../types';
import StepNav from '../StepNav';
import TeachingTooltip from '../TeachingTooltip';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = state.inspirationImages;
  const maxReached = images.length >= 6;

  function addFileImages(files: FileList | null) {
    if (!files) return;
    const remaining = 6 - images.length;
    const newImages: WizardState['inspirationImages'] = [];
    Array.from(files).slice(0, remaining).forEach((file) => {
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

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 3 of 9</span>
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

        <TeachingTooltip
          variant="cool"
          title="Design Principle: Reference Before You Create"
          body="Designers always gather visual references before they start. These images train your eye and align your team on the aesthetic. No reference = no shared vision."
        />
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
