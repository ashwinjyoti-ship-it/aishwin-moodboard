import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../utils/api';

interface MockupStatus {
  sectionName: string;
  status: 'idle' | 'starting' | 'processing' | 'succeeded' | 'failed';
  predictionId?: string;
  imageUrl?: string;
  error?: string;
  prompt?: string;
}

export default function MockupsScreen() {
  const { state, goTo, sessionId } = useApp();
  const { selectedMood, brandKit } = state;

  const sections = selectedMood?.sections?.slice(0, 5) || ['Hero', 'About', 'Services', 'Team', 'Contact'];

  const [mockups, setMockups] = useState<Record<string, MockupStatus>>(
    Object.fromEntries(sections.map(s => [s, { sectionName: s, status: 'idle' }]))
  );
  const [generating, setGenerating] = useState(false);

  function updateMockup(section: string, patch: Partial<MockupStatus>) {
    setMockups(prev => ({ ...prev, [section]: { ...prev[section], ...patch } }));
  }

  async function pollUntilDone(section: string, predictionId: string) {
    const maxAttempts = 20;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 3000));
      try {
        const res = await apiFetch(`/api/mockup-status/${predictionId}`, {}, sessionId);
        const data = await res.json() as { status: string; imageUrl?: string; error?: string };
        if (data.status === 'succeeded' && data.imageUrl) {
          updateMockup(section, { status: 'succeeded', imageUrl: data.imageUrl });
          return;
        }
        if (data.status === 'failed') {
          updateMockup(section, { status: 'failed', error: data.error || 'Generation failed' });
          return;
        }
        updateMockup(section, { status: 'processing' });
      } catch {
        // keep polling
      }
    }
    updateMockup(section, { status: 'failed', error: 'Timed out waiting for mockup' });
  }

  async function generateAll() {
    if (!brandKit || !selectedMood) return;
    setGenerating(true);

    await Promise.all(sections.map(async (section) => {
      updateMockup(section, { status: 'starting' });
      try {
        const res = await apiFetch('/api/start-mockup', {
          method: 'POST',
          body: JSON.stringify({
            sectionName: section,
            mood: selectedMood,
            brandKit,
            brief: state.brief,
          }),
        }, sessionId);
        const data = await res.json() as { predictionId?: string; imageUrl?: string; error?: string; status?: string };

        if (data.error) {
          updateMockup(section, { status: 'failed', error: data.error });
          return;
        }
        // Synchronous result (Prefer: wait)
        if (data.status === 'succeeded' && data.imageUrl) {
          updateMockup(section, { status: 'succeeded', imageUrl: data.imageUrl });
          return;
        }
        // Async: poll
        if (data.predictionId) {
          updateMockup(section, { status: 'processing', predictionId: data.predictionId });
          await pollUntilDone(section, data.predictionId);
        }
      } catch (err) {
        updateMockup(section, { status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }));

    setGenerating(false);
  }

  async function regenerate(section: string) {
    if (!brandKit || !selectedMood) return;
    updateMockup(section, { status: 'starting', imageUrl: undefined, error: undefined });
    try {
      const res = await apiFetch('/api/start-mockup', {
        method: 'POST',
        body: JSON.stringify({ sectionName: section, mood: selectedMood, brandKit, brief: state.brief }),
      }, sessionId);
      const data = await res.json() as { predictionId?: string; imageUrl?: string; error?: string; status?: string };
      if (data.status === 'succeeded' && data.imageUrl) {
        updateMockup(section, { status: 'succeeded', imageUrl: data.imageUrl });
        return;
      }
      if (data.predictionId) {
        updateMockup(section, { status: 'processing', predictionId: data.predictionId });
        await pollUntilDone(section, data.predictionId);
      }
    } catch (err) {
      updateMockup(section, { status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  const allDone = sections.every(s => mockups[s]?.status === 'succeeded' || mockups[s]?.status === 'failed');
  const anySucceeded = sections.some(s => mockups[s]?.status === 'succeeded');
  const notStarted = sections.every(s => mockups[s]?.status === 'idle');

  return (
    <div className="mockups-screen">
      <div className="step-header">
        <div className="step-number">Optional</div>
        <h2 className="step-title">AI Mockups</h2>
        <p className="step-subtitle">
          Generate unique section mockups using Flux — styled with your locked brand colours.
          <br />
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>~$0.05 per image · 10–20 seconds each</span>
        </p>
      </div>

      {notStarted && (
        <button
          type="button"
          className="btn btn-accent"
          onClick={generateAll}
          disabled={generating}
          style={{ alignSelf: 'flex-start' }}
        >
          Generate {sections.length} Mockups
        </button>
      )}

      <div className="mockups-grid">
        {sections.map(section => {
          const m = mockups[section];
          return (
            <div key={section} className="mockup-card">
              <div className="mockup-card__header">
                <span className="mockup-card__section">{section}</span>
                <StatusBadge status={m.status} />
              </div>
              <div className="mockup-card__image-area">
                {m.status === 'succeeded' && m.imageUrl ? (
                  <img src={m.imageUrl} alt={`${section} mockup`} className="mockup-card__image" />
                ) : m.status === 'failed' ? (
                  <div className="mockup-card__placeholder mockup-card__placeholder--error">
                    <span>{m.error || 'Failed'}</span>
                  </div>
                ) : m.status === 'idle' ? (
                  <div className="mockup-card__placeholder">
                    <span>Pending</span>
                  </div>
                ) : (
                  <div className="mockup-card__placeholder mockup-card__placeholder--loading">
                    <div className="spinner spinner--large" />
                    <span>{m.status === 'starting' ? 'Starting...' : 'Generating...'}</span>
                  </div>
                )}
              </div>
              {(m.status === 'succeeded' || m.status === 'failed') && (
                <button type="button" className="btn btn-secondary mockup-card__regen" onClick={() => regenerate(section)}>
                  Regenerate
                </button>
              )}
            </div>
          );
        })}
      </div>

      {generating && !allDone && (
        <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', textAlign: 'center' }}>
          Generating in parallel — this takes about 15–20 seconds per section
        </p>
      )}

      <div className="step-nav">
        <button type="button" className="btn btn-ghost" onClick={() => goTo('brand-kit')}>
          ← Back
        </button>
        <div className="step-nav__actions">
          <button type="button" className="btn btn-secondary" onClick={() => goTo('export')}>
            {anySucceeded ? 'Skip remaining →' : 'Skip'}
          </button>
          {allDone && anySucceeded && (
            <button type="button" className="btn btn-primary" onClick={() => goTo('export')}>
              Continue to Export →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: MockupStatus['status'] }) {
  const map: Record<MockupStatus['status'], { label: string; color: string }> = {
    idle: { label: 'Pending', color: 'var(--color-muted)' },
    starting: { label: 'Starting', color: 'var(--color-accent)' },
    processing: { label: 'Generating', color: '#F5C842' },
    succeeded: { label: 'Done', color: 'var(--color-success)' },
    failed: { label: 'Failed', color: '#e74c3c' },
  };
  const { label, color } = map[status];
  return <span style={{ fontSize: '0.72rem', color, fontWeight: 500 }}>{label}</span>;
}
