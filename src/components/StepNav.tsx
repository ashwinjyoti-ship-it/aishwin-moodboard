

interface StepNavProps {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isFirst?: boolean;
}

export default function StepNav({
  onBack,
  onNext,
  nextLabel = 'Continue →',
  nextDisabled = false,
  isFirst = false,
}: StepNavProps) {
  return (
    <div className="step-nav">
      {!isFirst && onBack ? (
        <button className="btn btn-ghost" onClick={onBack} type="button">
          ← Back
        </button>
      ) : (
        <div />
      )}
      <button
        className="btn btn-primary"
        onClick={onNext}
        type="button"
        disabled={nextDisabled}
      >
        {nextLabel}
      </button>
    </div>
  );
}
