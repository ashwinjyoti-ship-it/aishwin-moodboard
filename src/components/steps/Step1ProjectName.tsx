import { useState } from 'react';
import { WizardState } from '../../types';
import { INDUSTRIES, INDUSTRY_CATEGORIES } from '../../utils/constants';
import StepNav from '../StepNav';
import TeachingTooltip from '../TeachingTooltip';

interface Props {
  state: WizardState;
  onUpdate: (patch: Partial<WizardState>) => void;
  onNext: () => void;
}

interface Errors {
  projectName?: string;
  industry?: string;
  businessType?: string;
}

export default function Step1ProjectName({ state, onUpdate, onNext }: Props) {
  const [errors, setErrors] = useState<Errors>({});

  const availableCategories = state.industry && state.industry !== 'Other'
    ? INDUSTRY_CATEGORIES[state.industry] ?? []
    : [];

  function handleIndustryChange(industry: string) {
    // Reset category when industry changes
    onUpdate({ industry, businessType: '' });
    setErrors(e => ({ ...e, industry: undefined, businessType: undefined }));
  }

  function handleNext() {
    const newErrors: Errors = {};
    if (!state.projectName.trim()) newErrors.projectName = 'Project name is required';
    if (!state.industry) newErrors.industry = 'Please select an industry';
    if (state.industry !== 'Other' && !state.businessType)
      newErrors.businessType = 'Please select a category';
    if (state.industry === 'Other' && !state.businessType.trim())
      newErrors.businessType = 'Please enter your category';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onNext();
  }

  const canContinue =
    state.projectName.trim().length > 0 &&
    state.industry.length > 0 &&
    state.businessType.trim().length > 0;

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 1 of 9</span>
        <h1 className="step-title">Tell us about your project</h1>
        <p className="step-subtitle">
          We'll use this to personalise your mood board and design recommendations.
        </p>
      </div>

      <div className="step-body">
        {/* Field 1: Project Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="project-name">
            Business or project name
          </label>
          <input
            id="project-name"
            className={`form-input${errors.projectName ? ' form-input--error' : ''}`}
            type="text"
            placeholder="e.g. Solstice Wellness Studio"
            value={state.projectName}
            onChange={e => {
              onUpdate({ projectName: e.target.value });
              setErrors(er => ({ ...er, projectName: undefined }));
            }}
            onKeyDown={e => { if (e.key === 'Enter' && canContinue) handleNext(); }}
            autoFocus
          />
          {errors.projectName && (
            <span className="form-error">{errors.projectName}</span>
          )}
        </div>

        {/* Field 2: Industry */}
        <div className="form-group">
          <label className="form-label" htmlFor="industry">
            What industry? <span style={{ color: '#e74c3c' }}>*</span>
          </label>
          <select
            id="industry"
            className={`form-input${errors.industry ? ' form-input--error' : ''}`}
            value={state.industry}
            onChange={e => handleIndustryChange(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="">Select an industry…</option>
            {INDUSTRIES.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
          {errors.industry && (
            <span className="form-error">{errors.industry}</span>
          )}
        </div>

        {/* Field 3: Category — dynamic based on industry */}
        {state.industry && (
          <div className="form-group">
            <label className="form-label">
              Business category <span style={{ color: '#e74c3c' }}>*</span>
            </label>

            {state.industry === 'Other' ? (
              <input
                className={`form-input${errors.businessType ? ' form-input--error' : ''}`}
                type="text"
                placeholder="Enter your business category"
                value={state.businessType}
                onChange={e => {
                  onUpdate({ businessType: e.target.value });
                  setErrors(er => ({ ...er, businessType: undefined }));
                }}
              />
            ) : (
              <div className="category-grid">
                {availableCategories.map(cat => {
                  const selected = state.businessType === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`category-chip${selected ? ' selected' : ''}`}
                      onClick={() => {
                        onUpdate({ businessType: selected ? '' : cat });
                        setErrors(er => ({ ...er, businessType: undefined }));
                      }}
                      aria-pressed={selected}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

            {errors.businessType && (
              <span className="form-error">{errors.businessType}</span>
            )}

            {state.businessType && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
                Selected: <strong style={{ color: 'var(--color-text)' }}>{state.businessType}</strong>
              </p>
            )}
          </div>
        )}

        <TeachingTooltip
          variant="warm"
          title="Design Principle: Know Your Audience"
          body="Your industry and category shape every visual choice. A SaaS platform needs rational precision; a yoga studio needs serenity. Starting here means every preset, colour, and image we suggest is relevant to you."
        />
      </div>

      <StepNav
        onNext={handleNext}
        nextDisabled={!canContinue}
        isFirst
      />
    </div>
  );
}
