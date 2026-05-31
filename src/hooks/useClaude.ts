import { useState } from 'react';
import { useProject } from '../context/ProjectContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export interface ImageAnalysis {
  mood: string[];
  colors: string[];
  placeholder: boolean;
}

export function useClaude() {
  const { sessionId } = useProject();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyzeImage(file: File | string): Promise<ImageAnalysis | null> {
    setLoading(true);
    setError(null);
    try {
      const body = typeof file === 'string'
        ? JSON.stringify({ url: file })
        : await (async () => {
            const fd = new FormData();
            fd.append('file', file);
            return fd;
          })();

      const res = await fetch(`${API_BASE}/api/analyze-image`, {
        method: 'POST',
        headers: typeof file === 'string'
          ? { 'Content-Type': 'application/json', 'x-session-id': sessionId }
          : { 'x-session-id': sessionId },
        body,
      });
      return await res.json();
    } catch (e) {
      setError('Analysis failed');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { analyzeImage, loading, error };
}
