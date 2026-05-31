import React from 'react';

const STEPS = [
  'Project name',
  'Design direction',
  'Inspiration',
  'Colors',
  'Sections',
  'Images',
  'Generate',
  'Export',
];

interface ProgressBarProps {
  currentStep: number; // 1-based
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <nav className="progress-bar" aria-label="Wizard progress">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const filled = stepNum < currentStep;
        const active = stepNum === currentStep;

        return (
          <React.Fragment key={label}>
            {i > 0 && (
              <div
                className={`progress-connector${filled ? ' progress-connector--filled' : ''}`}
                aria-hidden="true"
              />
            )}
            <div className="progress-step">
              <div
                className={`progress-step__dot${
                  filled
                    ? ' progress-step__dot--filled'
                    : active
                    ? ' progress-step__dot--active'
                    : ''
                }`}
                aria-hidden="true"
              />
              <span
                className={`progress-step__label${
                  active
                    ? ' progress-step__label--active'
                    : filled
                    ? ' progress-step__label--filled'
                    : ''
                }`}
              >
                {label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
