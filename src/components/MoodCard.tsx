import { MoodOption } from '../types';

interface Props {
  mood: MoodOption;
  selected: boolean;
  onSelect: (mood: MoodOption) => void;
  disabled?: boolean;
}

export default function MoodCard({ mood, selected, onSelect, disabled }: Props) {
  return (
    <button
      className={`mood-card${selected ? ' mood-card--selected' : ''}`}
      onClick={() => !disabled && onSelect(mood)}
      disabled={disabled}
      type="button"
    >
      {selected && <span className="mood-card__checkmark">✓</span>}
      <div className="mood-card__swatches">
        <span className="mood-card__swatch" style={{ backgroundColor: mood.palette.primary }} title="Primary" />
        <span className="mood-card__swatch" style={{ backgroundColor: mood.palette.secondary }} title="Secondary" />
        <span className="mood-card__swatch" style={{ backgroundColor: mood.palette.accent }} title="Accent" />
      </div>
      <div className="mood-card__name">{mood.name}</div>
      <div className="mood-card__description">{mood.description}</div>
      <div className="mood-card__keywords">
        {mood.keywords.slice(0, 4).map(k => (
          <span key={k} className="mood-card__keyword">{k}</span>
        ))}
      </div>
    </button>
  );
}
