import { useState } from 'react';
import { useApp } from '../context/AppContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export interface UnsplashPhoto {
  id: string;
  url: string | null;
  thumb: string | null;
  alt: string;
  photographer: string;
  placeholder: boolean;
}

export function useUnsplash() {
  const { sessionId } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(query: string, count = 5): Promise<UnsplashPhoto[]> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/search-unsplash?q=${encodeURIComponent(query)}&count=${count}`,
        { headers: { 'x-session-id': sessionId } }
      );
      const data = await res.json();
      return data.results as UnsplashPhoto[];
    } catch (e) {
      setError('Failed to fetch images');
      return [];
    } finally {
      setLoading(false);
    }
  }

  return { search, loading, error };
}
