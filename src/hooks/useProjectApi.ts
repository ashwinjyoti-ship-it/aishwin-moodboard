import { useApp } from '../context/AppContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export function useProjectApi() {
  const { sessionId } = useApp();

  function headers() {
    return {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
    };
  }

  async function saveProject(data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async function listProjects() {
    const res = await fetch(`${API_BASE}/api/projects`, { headers: headers() });
    return res.json();
  }

  async function loadProject(id: string) {
    const res = await fetch(`${API_BASE}/api/projects/${id}`, { headers: headers() });
    return res.json();
  }

  async function deleteProject(id: string) {
    const res = await fetch(`${API_BASE}/api/projects/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  }

  return { saveProject, listProjects, loadProject, deleteProject };
}
