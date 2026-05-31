

interface TeachingTooltipProps {
  variant: 'warm' | 'cool';
  title: string;
  body: string;
}

export default function TeachingTooltip({ variant, title, body }: TeachingTooltipProps) {
  const icon = variant === 'warm' ? '✦' : 'ℹ';
  return (
    <div className={`teaching-tooltip teaching-tooltip--${variant}`}>
      <span className="teaching-tooltip__icon" aria-hidden="true">{icon}</span>
      <div className="teaching-tooltip__content">
        <span className="teaching-tooltip__title">{title}</span>
        <span className="teaching-tooltip__body">{body}</span>
      </div>
    </div>
  );
}
