const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const API_BASE = import.meta.env.VITE_API_BASE || (isLocalhost ? 'http://localhost:8787' : 'https://mood-board.ashwinjyoti.workers.dev');

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  sessionId?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (sessionId) headers['x-session-id'] = sessionId;
  if (!(options.body instanceof FormData) && options.method && options.method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}
