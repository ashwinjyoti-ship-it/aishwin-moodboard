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
  businessTypes?: string;
}

export default function Step1ProjectName({ state, onUpdate, onNext }: Props) {
  const [errors, setErrors] = useState<Errors>({});
  // Local text state for "Other" industry free-text
  const [otherText, setOtherText] = useState(
    state.industry === 'Other' ? (state.businessTypes[0] ?? '') : ''
  );

  const availableCategories = state.industry && state.industry !== 'Other'
    ? INDUSTRY_CATEGORIES[state.industry] ?? []
    : [];

  function handleIndustryChange(industry: string) {
    onUpdate({ industry, businessTypes: [] });
    setOtherText('');
    setErrors(e => ({ ...e, industry: undefined, businessTypes: undefined }));
  }

  function toggleCategory(cat: string) {
    const already = state.businessTypes.includes(cat);
    const updated = already
      ? state.businessTypes.filter(c => c !== cat)
      : [...state.businessTypes, cat];
    onUpdate({ businessTypes: updated });
    setErrors(er => ({ ...er, businessTypes: undefined }));
  }

  function handleOtherTextChange(text: string) {
    setOtherText(text);
    onUpdate({ businessTypes: text.trim() ? [text.trim()] : [] });
    setErrors(er => ({ ...er, businessTypes: undefined }));
  }

  function handleNext() {
    const newErrors: Errors = {};
    if (!state.projectName.trim()) newErrors.projectName = 'Project name is required';
    if (!state.industry) newErrors.industry = 'Please select an industry';
    if (state.industry !== 'Other' && state.businessTypes.length === 0)
      newErrors.businessTypes = 'Please select at least one category';
    if (state.industry === 'Other' && !otherText.trim())
      newErrors.businessTypes = 'Please enter your category';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onNext();
  }

  const hasCategories = state.industry === 'Other'
    ? otherText.trim().length > 0
    : state.businessTypes.length > 0;

  const canContinue =
    state.projectName.trim().length > 0 &&
    state.industry.length > 0 &&
    hasCategories;

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

        {/* Field 3: Category — multi-select chips */}
        {state.industry && (
          <div className="form-group">
            <label className="form-label">
              Business category <span style={{ color: '#e74c3c' }}>*</span>
              {availableCategories.length > 0 && (
                <span style={{ fontWeight: 400, color: 'var(--color-muted)', marginLeft: '0.5rem' }}>
                  — select all that apply
                </span>
              )}
            </label>

            {state.industry === 'Other' ? (
              <input
                className={`form-input${errors.businessTypes ? ' form-input--error' : ''}`}
                type="text"
                placeholder="Enter your business category"
                value={otherText}
                onChange={e => handleOtherTextChange(e.target.value)}
              />
            ) : (
              <div className="category-grid">
                {availableCategories.map(cat => {
                  const selected = state.businessTypes.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`category-chip${selected ? ' selected' : ''}`}
                      onClick={() => toggleCategory(cat)}
                      aria-pressed={selected}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

            {errors.businessTypes && (
              <span className="form-error">{errors.businessTypes}</span>
            )}

            {state.businessTypes.length > 0 && state.industry !== 'Other' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
                {state.businessTypes.length === 1 ? '1 category selected' : `${state.businessTypes.length} categories selected`}:{' '}
                <strong style={{ color: 'var(--color-text)' }}>{state.businessTypes.join(', ')}</strong>
              </p>
            )}
          </div>
        )}

        <TeachingTooltip
          variant="warm"
          title="Design Principle: Know Your Audience"
          body="Your industry and categories shape every visual choice. Select all the services you offer — each one adds relevant sections, images, and Unsplash queries to your mood board."
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
