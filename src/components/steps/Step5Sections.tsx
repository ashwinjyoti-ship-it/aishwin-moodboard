import { useState, useEffect } from 'react';
import { WizardState, Section } from '../../types';
import StepNav from '../StepNav';
import TeachingTooltip from '../TeachingTooltip';

interface Props {
  state: WizardState;
  onUpdate: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function Step5Sections({ state, onUpdate, onNext, onBack }: Props) {
  const [sections, setSections] = useState<Section[]>(
    state.sections.length > 0 ? state.sections : []
  );
  const [loading, setLoading] = useState(state.sections.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.sections.length > 0) return;
    setLoading(true);
    fetch(`${API_BASE}/api/suggest-sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: state.businessType, presetId: state.presetId }),
    })
      .then(r => r.json())
      .then((data: Section[]) => {
        setSections(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load suggestions. Add sections manually.');
        setLoading(false);
      });
  }, []);

  function update(idx: number, patch: Partial<Section>) {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  }

  function remove(idx: number) {
    setSections(prev => prev.filter((_, i) => i !== idx));
  }

  function addCustom() {
    setSections(prev => [...prev, {
      id: `custom-${Date.now()}`,
      name: '',
      query: '',
      count: 3,
      images: [],
      approved: false,
    }]);
  }

  function handleNext() {
    onUpdate({ sections });
    onNext();
  }

  const canContinue = sections.length > 0 && sections.every(s => s.name.trim() && s.query.trim());

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 6 of 9</span>
        <h1 className="step-title">Define your sections</h1>
        <p className="step-subtitle">
          We've suggested sections based on your category and preset. Edit names, refine search queries, or add your own.
        </p>
      </div>

      <div className="step-body">
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
            Loading suggestions…
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', background: '#fff3f3', borderRadius: '8px', color: '#c0392b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {!loading && sections.map((section, idx) => (
          <div key={section.id} className="section-edit-card">
            <div className="section-edit-card__row">
              <input
                type="text"
                className="section-edit-card__input"
                placeholder="Section name (e.g. Personal Training)"
                value={section.name}
                onChange={e => update(idx, { name: e.target.value })}
              />
              <button
                type="button"
                className="section-edit-card__remove"
                onClick={() => remove(idx)}
                title="Remove section"
              >
                ✕
              </button>
            </div>
            <textarea
              className="section-edit-card__textarea"
              placeholder="Unsplash search query (e.g. yoga studio calm natural light)"
              value={section.query}
              onChange={e => update(idx, { query: e.target.value })}
              rows={2}
            />
            <div className="section-edit-card__count">
              <label>
                Images: <strong>{section.count}</strong>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={section.count}
                  onChange={e => update(idx, { count: parseInt(e.target.value) })}
                  style={{ marginLeft: '0.75rem', verticalAlign: 'middle', accentColor: 'var(--color-accent)' }}
                />
              </label>
            </div>
          </div>
        ))}

        {!loading && (
          <button type="button" className="btn btn-secondary" onClick={addCustom} style={{ marginBottom: '2rem' }}>
            + Add custom section
          </button>
        )}

        <TeachingTooltip
          variant="warm"
          title="Design Principle: Coherence"
          body="Every section and image should reinforce ONE emotional direction. Your search queries are the brief for your visual story — be specific. 'yoga studio calm natural light' beats just 'yoga'."
        />
      </div>

      <StepNav onBack={onBack} onNext={handleNext} nextDisabled={!canContinue} />
    </div>
  );
}
