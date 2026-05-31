import { useState, useEffect } from 'react';
import { useProjectApi } from '../../hooks/useProjectApi';
import { getPresetById } from '../../data/presets';
import TeachingTooltip from '../TeachingTooltip';

interface Props {
  onRestart: () => void;
}

interface SavedProject {
  id: string;
  name: string;
  category: string | null;
  preset_name: string | null;
  created_at: string;
  updated_at: string;
  palette_colors: string | null;
}

export default function Step8Done({ onRestart }: Props) {
  const { listProjects, deleteProject } = useProjectApi();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    listProjects()
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setDeleting(null);
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  }

  function getPaletteColors(project: SavedProject): string[] {
    try {
      const p = JSON.parse(project.palette_colors || '{}');
      return [p.primary, p.secondary, p.accent].filter(Boolean);
    } catch {
      return [];
    }
  }

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 9 of 9</span>
        <h1 className="step-title">Your projects</h1>
        <p className="step-subtitle">
          Saved mood boards from this session. Load, review, or start fresh.
        </p>
      </div>

      <div className="step-body">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button type="button" className="btn btn-accent" onClick={onRestart}>
            + New mood board
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
            Loading your projects…
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="dashboard-empty">
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🗂️</div>
            <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
              No saved projects yet. Save your mood board from the previous step to see it here.
            </p>
            <button type="button" className="btn btn-secondary" onClick={onRestart}>
              ← Go back and save
            </button>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="dashboard-grid">
            {projects.map(project => {
              const colors = getPaletteColors(project);
              const preset = getPresetById(project.preset_name || '');
              return (
                <div key={project.id} className="dashboard-card">
                  <div className="dashboard-card__palette">
                    {colors.length > 0
                      ? colors.map((c, i) => (
                          <div key={i} className="dashboard-card__swatch" style={{ background: c }} />
                        ))
                      : (preset?.colors ? [preset.colors.primary, preset.colors.secondary, preset.colors.accent].map((c, i) => (
                          <div key={i} className="dashboard-card__swatch" style={{ background: c }} />
                        )) : <div className="dashboard-card__swatch" style={{ background: 'var(--color-border)' }} />)
                    }
                  </div>
                  <div className="dashboard-card__body">
                    <div className="dashboard-card__name">{project.name}</div>
                    {project.category && (
                      <div className="dashboard-card__meta">{project.category}</div>
                    )}
                    {project.preset_name && (
                      <div className="dashboard-card__meta" style={{ color: 'var(--color-accent)' }}>
                        {preset?.name || project.preset_name}
                      </div>
                    )}
                    <div className="dashboard-card__date">Saved {formatDate(project.created_at)}</div>
                  </div>
                  <div className="dashboard-card__actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
                      onClick={() => handleDelete(project.id)}
                      disabled={deleting === project.id}
                    >
                      {deleting === project.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <TeachingTooltip
          variant="warm"
          title="Principle 5: Iteration Refines Vision"
          body="Design is never one-shot. Come back tomorrow. Swap one color, regenerate the images, see how the mood shifts. This library of saved boards becomes your design vocabulary over time."
        />
      </div>
    </div>
  );
}
