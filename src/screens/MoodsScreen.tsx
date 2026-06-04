import { useApp } from '../context/AppContext';
import { useAppApi } from '../hooks/useAppApi';
import MoodCard from '../components/MoodCard';
import { MoodOption } from '../types';

export default function MoodsScreen() {
  const { state, selectMood, goTo, setLoading, setError, setBrandKit } = useApp();
  const { generateBrandKit } = useAppApi();

  async function handleSelectMood(mood: MoodOption) {
    selectMood(mood);
    goTo('brand-kit');
    setLoading(true, 'Building your brand kit...');

    try {
      const brandKit = await generateBrandKit(mood, state.brief, mood.name);
      setBrandKit(brandKit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate brand kit. Please try again.');
    }
  }

  return (
    <div className="moods-screen">
      <div className="step-header">
        <div className="step-number">Step 1 of 3</div>
        <h2 className="step-title">Choose your direction</h2>
        <p className="step-subtitle">
          Three moods generated for: <em>"{state.brief}"</em>
        </p>
      </div>

      <div className="moods-grid">
        {state.moods.map(mood => (
          <MoodCard
            key={mood.id}
            mood={mood}
            selected={state.selectedMood?.id === mood.id}
            onSelect={handleSelectMood}
          />
        ))}
      </div>

      <div className="step-nav">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => goTo('brief')}
        >
          ← Back
        </button>
        <p className="step-subtitle" style={{ fontSize: '0.85rem' }}>
          Pick the mood that feels right — you can refine later
        </p>
      </div>
    </div>
  );
}
