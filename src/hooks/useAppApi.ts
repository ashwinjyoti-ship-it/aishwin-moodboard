import { apiFetch } from '../utils/api';
import { useApp } from '../context/AppContext';
import { MoodOption, BrandKit } from '../types';

export function useAppApi() {
  const { sessionId } = useApp();

  async function generateMoods(brief: string): Promise<MoodOption[]> {
    const res = await apiFetch('/api/generate-moods', {
      method: 'POST',
      body: JSON.stringify({ brief }),
    }, sessionId);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
    }
    const data = await res.json() as { moods: MoodOption[] };
    return data.moods;
  }

  async function generateBrandKit(mood: MoodOption, brief: string, projectName: string): Promise<BrandKit> {
    const res = await apiFetch('/api/generate-brand-kit', {
      method: 'POST',
      body: JSON.stringify({ mood, brief, projectName }),
    }, sessionId);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
    }
    const data = await res.json() as { brandKit: BrandKit };
    return data.brandKit;
  }

  async function saveProject(state: { brief: string; projectName: string; mood: MoodOption; brandKit: BrandKit }): Promise<string> {
    const res = await apiFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: state.projectName,
        category: 'mood-board',
        projectData: {
          brief: state.brief,
          moodId: state.mood.id,
          paletteColors: state.mood.palette,
          brandKit: state.brandKit,
          sections: state.mood.sections,
          metadata: { moodName: state.mood.name },
        },
      }),
    }, sessionId);
    if (!res.ok) throw new Error(`Save failed: HTTP ${res.status}`);
    const data = await res.json() as { id: string };
    return data.id;
  }

  return { generateMoods, generateBrandKit, saveProject };
}
