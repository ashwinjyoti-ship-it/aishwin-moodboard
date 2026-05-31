import React, { useState } from 'react';
import { WizardState } from '../../types';
import StepNav from '../StepNav';
import TeachingTooltip from '../TeachingTooltip';

interface Props {
  state: WizardState;
  onUpdate: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SUGGESTIONS = ['calm', 'airy', 'professional', 'warm', 'energetic', 'minimal', 'bold', 'trustworthy', 'luxurious', 'natural'];

export default function Step3Keywords({ state, onUpdate, onNext, onBack }: Props) {
  const [input, setInput] = useState('');

  function addKeyword(word: string) {
    const trimmed = word.trim().toLowerCase();
    if (trimmed && !state.keywords.includes(trimmed) && state.keywords.length < 8) {
      onUpdate({ keywords: [...state.keywords, trimmed] });
    }
    setInput('');
  }

  function removeKeyword(word: string) {
    onUpdate({ keywords: state.keywords.filter((k) => k !== word) });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword(input);
    } else if (e.key === 'Backspace' && input === '' && state.keywords.length > 0) {
      removeKeyword(state.keywords[state.keywords.length - 1]);
    }
  }

  const canContinue = state.keywords.length >= 1;

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 3 of 8</span>
        <h1 className="step-title">Describe the vibe</h1>
        <p className="step-subtitle">
          Add 3–5 keywords that capture the feeling you want. Press Enter or comma to add each one.
        </p>
      </div>

      <div className="step-body">
        <div className="form-group">
          <label className="form-label">Keywords</label>
          <div className="tag-input-area" onClick={() => document.getElementById('keyword-input')?.focus()}>
            {state.keywords.map((kw) => (
              <span key={kw} className="tag-chip">
                {kw}
                <button
                  type="button"
                  className="tag-chip__remove"
                  onClick={() => removeKeyword(kw)}
                  aria-label={`Remove ${kw}`}
                >
                  ×
                </button>
              </span>
            ))}
            {state.keywords.length < 8 && (
              <input
                id="keyword-input"
                className="tag-inline-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={state.keywords.length === 0 ? 'e.g. calm, airy, professional…' : 'Add more…'}
              />
            )}
          </div>
          <p className="tag-hint">{state.keywords.length}/8 keywords added</p>
        </div>

        <div>
          <p className="form-label" style={{ marginBottom: '0.75rem' }}>Suggestions</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {SUGGESTIONS.filter((s) => !state.keywords.includes(s)).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addKeyword(s)}
                style={{
                  padding: '0.3rem 0.9rem',
                  borderRadius: '100px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-system)',
                  transition: 'all 0.15s',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <TeachingTooltip
          variant="cool"
          title="UX Insight: Words Before Pixels"
          body="Keywords become your creative brief. When you name the feeling first, every visual decision that follows has a north star. Ambiguity is the enemy of good design."
        />
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!canContinue} />
    </div>
  );
}
