import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../utils/api';
import { MockupImage } from '../types';

interface MockupStatus {
  sectionName: string;
  status: 'idle' | 'starting' | 'processing' | 'refining' | 'succeeded' | 'failed';
  predictionId?: string;
  imageUrl?: string;
  error?: string;
}

export default function MockupsScreen() {
  const { state, goTo, sessionId, addMockupImage } = useApp();
  const { selectedMood, brandKit } = state;

  const sections = selectedMood?.sections || ['Hero', 'About', 'Services', 'Team', 'Contact'];

  const [mockups, setMockups] = useState<Record<string, MockupStatus>>(
    Object.fromEntries(sections.map(s => [s, { sectionName: s, status: 'idle' }]))
  );
  const [generating, setGenerating] = useState(false);
  const [refineInputs, setRefineInputs] = useState<Record<string, string>>({});
  const [refineOpen, setRefineOpen] = useState<Record<string, boolean>>({});

  function updateMockup(section: string, patch: Partial<MockupStatus>) {
    setMockups(prev => ({ ...prev, [section]: { ...prev[section], ...patch } }));
  }

  function syncToContext(section: string, imageUrl: string) {
    addMockupImage({ sectionId: section, sectionName: section, imageUrl, prompt: '', generatedAt: new Date().toISOString() } satisfies MockupImage);
  }

  async function pollUntilDone(section: string, predictionId: string) {
    for (let i = 0; i < 24; i++) {
      await new Promise(r => setTimeout(r, 3000));
      try {
        const res = await apiFetch(`/api/mockup-status/${predictionId}`, {}, sessionId);
        const data = await res.json() as { status: string; imageUrl?: string; error?: string };
        if (data.status === 'succeeded' && data.imageUrl) {
          updateMockup(section, { status: 'succeeded', imageUrl: data.imageUrl });
          syncToContext(section, data.imageUrl);
          return;
        }
        if (data.status === 'failed') {
          updateMockup(section, { status: 'failed', error: data.error || 'Generation failed' });
          return;
        }
      } catch { /* keep polling */ }
    }
    updateMockup(section, { status: 'failed', error: 'Timed out' });
  }

  async function startMockup(section: string) {
    if (!brandKit || !selectedMood) return;
    updateMockup(section, { status: 'starting', imageUrl: undefined, error: undefined });
    // Pass any selected Unsplash reference images as guidance for Flux 2 Pro
    const referenceImages = state.images.slice(0, 8).map(img => img.url);
    try {
      const res = await apiFetch('/api/start-mockup', {
        method: 'POST',
        body: JSON.stringify({ sectionName: section, mood: selectedMood, brandKit, brief: state.brief, referenceImages }),
      }, sessionId);
      const data = await res.json() as { predictionId?: string; imageUrl?: string; error?: string; status?: string };
      if (data.error) { updateMockup(section, { status: 'failed', error: data.error }); return; }
      if (data.status === 'succeeded' && data.imageUrl) {
        updateMockup(section, { status: 'succeeded', imageUrl: data.imageUrl });
        syncToContext(section, data.imageUrl);
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

  async function generateAll() {
    setGenerating(true);
    await Promise.all(sections.map(s => startMockup(s)));
    setGenerating(false);
  }

  async function refine(section: string) {
    const instruction = refineInputs[section]?.trim();
    if (!instruction || !mockups[section]?.imageUrl) return;
    updateMockup(section, { status: 'refining' });
    setRefineOpen(prev => ({ ...prev, [section]: false }));
    try {
      const res = await apiFetch('/api/refine-mockup', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: mockups[section].imageUrl,
          instruction,
          brandKit,
          mood: selectedMood,
        }),
      }, sessionId);
      const data = await res.json() as { predictionId?: string; imageUrl?: string; error?: string; status?: string };
      if (data.error) { updateMockup(section, { status: 'failed', error: data.error }); return; }
      if (data.status === 'succeeded' && data.imageUrl) {
        updateMockup(section, { status: 'succeeded', imageUrl: data.imageUrl });
        syncToContext(section, data.imageUrl);
        setRefineInputs(prev => ({ ...prev, [section]: '' }));
        return;
      }
      if (data.predictionId) {
        updateMockup(section, { status: 'processing', predictionId: data.predictionId });
        await pollUntilDone(section, data.predictionId);
        setRefineInputs(prev => ({ ...prev, [section]: '' }));
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
          Generated with Flux 2 Pro — styled to your brand. Refine any section with Flux Kontext Max.
          <br />
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>~$0.05/image to generate · Refinements preserve context</span>
        </p>
      </div>

      {notStarted && (
        <button type="button" className="btn btn-accent" onClick={generateAll} disabled={generating} style={{ alignSelf: 'flex-start' }}>
          Generate {sections.length} Mockups
        </button>
      )}

      <div className="mockups-grid">
        {sections.map(section => {
          const m = mockups[section];
          const isRefineOpen = refineOpen[section];
          const isDone = m.status === 'succeeded';
          const isBusy = m.status === 'starting' || m.status === 'processing' || m.status === 'refining';

          return (
            <div key={section} className="mockup-card">
              <div className="mockup-card__header">
                <span className="mockup-card__section">{section}</span>
                <StatusBadge status={m.status} />
              </div>

              <div className="mockup-card__image-area">
                {isDone && m.imageUrl ? (
                  <img src={m.imageUrl} alt={`${section} mockup`} className="mockup-card__image" />
                ) : m.status === 'failed' ? (
                  <div className="mockup-card__placeholder mockup-card__placeholder--error">
                    <span>{m.error || 'Failed'}</span>
                  </div>
                ) : m.status === 'idle' ? (
                  <div className="mockup-card__placeholder"><span>Pending</span></div>
                ) : (
                  <div className="mockup-card__placeholder mockup-card__placeholder--loading">
                    <div className="spinner spinner--large" />
                    <span>
                      {m.status === 'starting' ? 'Starting...' : m.status === 'refining' ? 'Refining...' : 'Generating...'}
                    </span>
                  </div>
                )}
              </div>

              {(isDone || m.status === 'failed') && !isBusy && (
                <div className="mockup-card__actions">
                  <button type="button" className="btn btn-secondary mockup-card__action-btn" onClick={() => startMockup(section)}>
                    Regenerate
                  </button>
                  {isDone && (
                    <button
                      type="button"
                      className="btn btn-accent mockup-card__action-btn"
                      onClick={() => setRefineOpen(prev => ({ ...prev, [section]: !isRefineOpen }))}
                    >
                      {isRefineOpen ? 'Cancel' : 'Refine ✦'}
                    </button>
                  )}
                </div>
              )}

              {isRefineOpen && isDone && (
                <div className="mockup-card__refine">
                  <input
                    type="text"
                    className="form-input mockup-card__refine-input"
                    placeholder='e.g. "make the headline larger" or "change button to orange"'
                    value={refineInputs[section] || ''}
                    onChange={e => setRefineInputs(prev => ({ ...prev, [section]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && refine(section)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => refine(section)}
                    disabled={!refineInputs[section]?.trim()}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {generating && !allDone && (
        <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', textAlign: 'center' }}>
          Generating in parallel with Flux 2 Pro — ~15–30s per section
        </p>
      )}

      <div className="step-nav">
        <button type="button" className="btn btn-ghost" onClick={() => goTo('paths')}>← Back</button>
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
    refining: { label: 'Refining ✦', color: '#9B84D9' },
    succeeded: { label: 'Done', color: 'var(--color-success)' },
    failed: { label: 'Failed', color: '#e74c3c' },
  };
  const { label, color } = map[status];
  return <span style={{ fontSize: '0.72rem', color, fontWeight: 500 }}>{label}</span>;
}
