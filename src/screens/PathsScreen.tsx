import { useApp } from '../context/AppContext';
import { DesignPath } from '../types';

const PATH_OPTIONS: { id: DesignPath; label: string; description: string; icon: string; sections: string[] }[] = [
  {
    id: 'website',
    label: 'Website',
    description: 'Landing page or multi-section site — Hero, About, Services, Contact',
    icon: '🌐',
    sections: ['Hero', 'About', 'Services', 'Testimonials', 'Contact'],
  },
  {
    id: 'app',
    label: 'Mobile App',
    description: 'App UI screens — Onboarding, Dashboard, Profile, Settings',
    icon: '📱',
    sections: ['Onboarding', 'Dashboard', 'Profile', 'Settings'],
  },
  {
    id: 'logo',
    label: 'Logo',
    description: 'Logo mark, wordmark and brand badge variations',
    icon: '✦',
    sections: ['Logo Mark', 'Wordmark', 'Brand Badge'],
  },
  {
    id: 'logo-kit',
    label: 'Full Brand Kit',
    description: 'Logo + brand collateral — business card, letterhead, social banners',
    icon: '🎨',
    sections: ['Logo Mark', 'Business Card', 'Letterhead', 'Social Banner'],
  },
  {
    id: 'desktop',
    label: 'Desktop App',
    description: 'Desktop UI — Sidebar, Main view, Settings, Onboarding',
    icon: '🖥️',
    sections: ['Sidebar', 'Main View', 'Settings', 'Onboarding'],
  },
];

export default function PathsScreen() {
  const { state, setSelectedPaths, goTo, dispatch } = useApp();
  const selected = state.selectedPaths;

  function toggle(id: DesignPath) {
    const next = selected.includes(id)
      ? selected.filter(p => p !== id)
      : [...selected, id];
    if (next.length > 0) setSelectedPaths(next);
  }

  function handleContinue() {
    // Merge sections from all selected paths into selectedMood for mockup generation
    if (state.selectedMood) {
      const mergedSections = Array.from(new Set(
        PATH_OPTIONS.filter(p => selected.includes(p.id)).flatMap(p => p.sections)
      ));
      dispatch({ type: 'SELECT_MOOD', mood: { ...state.selectedMood, sections: mergedSections } });
    }
    goTo('mockups');
  }

  return (
    <div className="paths-screen">
      <div className="step-header">
        <div className="step-number">Optional</div>
        <h2 className="step-title">What are you designing?</h2>
        <p className="step-subtitle">
          Select everything you want mockups for — your brand kit will be applied to each.
        </p>
      </div>

      <div className="paths-grid">
        {PATH_OPTIONS.map(opt => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              className={`path-card${isSelected ? ' path-card--selected' : ''}`}
              onClick={() => toggle(opt.id)}
            >
              <div className="path-card__icon">{opt.icon}</div>
              <div className="path-card__body">
                <div className="path-card__label">{opt.label}</div>
                <div className="path-card__desc">{opt.description}</div>
                <div className="path-card__sections">
                  {opt.sections.slice(0, 3).join(' · ')}{opt.sections.length > 3 ? ' · …' : ''}
                </div>
              </div>
              {isSelected && <div className="path-card__check">✓</div>}
            </button>
          );
        })}
      </div>

      <div className="step-nav">
        <button type="button" className="btn btn-ghost" onClick={() => goTo('brand-kit')}>
          ← Back
        </button>
        <div className="step-nav__actions">
          <button type="button" className="btn btn-secondary" onClick={() => goTo('export')}>
            Skip mockups
          </button>
          <button type="button" className="btn btn-primary" onClick={handleContinue} disabled={selected.length === 0}>
            {selected.length > 0
            ? `Continue → (${Array.from(new Set(PATH_OPTIONS.filter(p => selected.includes(p.id)).flatMap(p => p.sections))).length} mockups)`
            : 'Continue →'
          }
          </button>
        </div>
      </div>
    </div>
  );
}
