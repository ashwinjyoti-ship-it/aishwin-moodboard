import { useState } from 'react';
import { useApp } from '../context/AppContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export interface ImageAnalysis {
  mood: string[];
  colors: string[];
  placeholder: boolean;
}

export function useClaude() {
  const { sessionId } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);

  async function analyzeImage(file: File | string): Promise<ImageAnalysis | null> {
    setLoading(true);
    setError(null);
    try {
      let body: BodyInit;
      let headers: Record<string, string>;

      if (typeof file === 'string') {
        body = JSON.stringify({ url: file });
        headers = { 'Content-Type': 'application/json', 'x-session-id': sessionId };
      } else {
        const fd = new FormData();
        fd.append('file', file);
        body = fd;
        headers = { 'x-session-id': sessionId };
      }

      const res = await fetch(`${API_BASE}/api/analyze-image`, { method: 'POST', headers, body });
      if (!res.ok) throw new Error('Analysis request failed');
      const result: ImageAnalysis = await res.json();
      setAnalysis(result);
      return result;
    } catch {
      setError('Analysis failed');
      const fallback: ImageAnalysis = { mood: [], colors: [], placeholder: true };
      setAnalysis(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }

  return { analyzeImage, analysis, loading, error };
}
