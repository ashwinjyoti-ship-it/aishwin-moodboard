
import { WizardState } from '../../types';
import { getPresetById } from '../../data/presets';

interface Props {
  state: WizardState;
  onRestart: () => void;
}

export default function Step8Done({ state, onRestart }: Props) {
  const preset = getPresetById(state.presetId);

  return (
    <div className="done-screen">
      <div className="done-icon">✓</div>
      <div>
        <h1 className="done-title">Mood board complete!</h1>
        <p className="done-subtitle">
          You've built a cohesive design direction for {state.projectName || 'your project'}.
        </p>
      </div>

      <div className="done-summary">
        <div className="done-summary__row">
          <span className="done-summary__key">Project</span>
          <span className="done-summary__value">{state.projectName || '—'}</span>
        </div>
        {state.businessType && (
          <div className="done-summary__row">
            <span className="done-summary__key">Type</span>
            <span className="done-summary__value">{state.businessType}</span>
          </div>
        )}
        <div className="done-summary__row">
          <span className="done-summary__key">Preset</span>
          <span className="done-summary__value">{preset?.name ?? '—'}</span>
        </div>
        <div className="done-summary__row">
          <span className="done-summary__key">Sections</span>
          <span className="done-summary__value">{state.sections.length} selected</span>
        </div>
        {state.keywords.length > 0 && (
          <div className="done-summary__row">
            <span className="done-summary__key">Keywords</span>
            <span className="done-summary__value">{state.keywords.join(', ')}</span>
          </div>
        )}
        <div className="done-summary__row">
          <span className="done-summary__key">Accent colour</span>
          <span className="done-summary__value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: state.accentColor, display: 'inline-block', border: '1px solid rgba(0,0,0,0.1)' }} />
            {state.accentColor}
          </span>
        </div>
      </div>

      <div className="done-actions">
        <button type="button" className="btn btn-secondary" onClick={onRestart}>
          ↺ Start over
        </button>
      </div>
    </div>
  );
}
