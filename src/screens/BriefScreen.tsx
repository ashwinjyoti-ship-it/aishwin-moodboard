import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAppApi } from '../hooks/useAppApi';

const MIN_CHARS = 10;
const MAX_CHARS = 200;

export default function BriefScreen() {
  const { state, dispatch, setLoading, setError, setMoods, goTo } = useApp();
  const { generateMoods } = useAppApi();
  const [brief, setBrief] = useState(state.brief || '');

  const isValid = brief.trim().length >= MIN_CHARS && brief.trim().length <= MAX_CHARS;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    dispatch({ type: 'SET_BRIEF', brief: brief.trim() });
    setLoading(true, 'Generating mood options...');
    setError(null);

    try {
      const moods = await generateMoods(brief.trim());
      setMoods(moods);
      goTo('moods');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate moods. Please try again.');
    }
  }

  return (
    <div className="brief-screen">
      <div className="brief-screen__header">
        <h1 className="brief-screen__title">What are you building?</h1>
        <p className="brief-screen__subtitle">
          Describe your project in a sentence and we'll generate three design directions for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="brief-screen__form">
        <textarea
          className={`brief-screen__textarea form-input${brief.length > MAX_CHARS ? ' form-input--error' : ''}`}
          placeholder="e.g. A boutique yoga studio for women over 40 in coastal Sydney..."
          value={brief}
          onChange={e => setBrief(e.target.value)}
          rows={4}
          maxLength={MAX_CHARS + 10}
          disabled={state.loading}
          autoFocus
        />
        <div className="brief-screen__meta">
          <span className={`brief-screen__char-count${brief.length > MAX_CHARS ? ' brief-screen__char-count--error' : ''}`}>
            {brief.length}/{MAX_CHARS}
          </span>
          {brief.length > 0 && brief.length < MIN_CHARS && (
            <span className="form-error">At least {MIN_CHARS} characters needed</span>
          )}
        </div>

        {state.error && (
          <div className="brief-screen__error">
            <span>{state.error}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary brief-screen__submit"
          disabled={!isValid || state.loading}
        >
          {state.loading ? (
            <>
              <span className="spinner" />
              {state.loadingStep || 'Generating...'}
            </>
          ) : 'Generate Moods'}
        </button>
      </form>

      <div className="brief-screen__examples">
        <p className="brief-screen__examples-label">Try one of these:</p>
        <div className="brief-screen__example-list">
          {[
            'A meditation app for busy professionals',
            'High-performance CrossFit gym in Melbourne',
            'Holistic nutrition coaching for new mothers',
          ].map(ex => (
            <button
              key={ex}
              type="button"
              className="brief-screen__example-chip"
              onClick={() => setBrief(ex)}
              disabled={state.loading}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
