const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function nanoid() {
  return crypto.randomUUID();
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const sessionId = request.headers.get('x-session-id') || 'anonymous';

    try {
      // POST /api/projects
      if (path === '/api/projects' && request.method === 'POST') {
        const body = await request.json();
        const id = nanoid();
        const now = new Date().toISOString();
        await env.DB.prepare(
          `INSERT INTO projects (id, name, category, preset_name, custom_description, created_at, updated_at, user_session_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(id, body.name, body.category || null, body.presetName || null, body.customDescription || null, now, now, sessionId).run();

        if (body.projectData) {
          await env.DB.prepare(
            `INSERT OR REPLACE INTO project_data (project_id, inspiration_url, inspiration_analysis, palette_colors, sections, generated_html, metadata)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            id,
            body.projectData.inspirationUrl || null,
            body.projectData.inspirationAnalysis || null,
            JSON.stringify(body.projectData.paletteColors || {}),
            JSON.stringify(body.projectData.sections || []),
            body.projectData.generatedHtml || null,
            JSON.stringify(body.projectData.metadata || {})
          ).run();
        }
        return json({ id, created_at: now });
      }

      // GET /api/projects
      if (path === '/api/projects' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          `SELECT p.*, pd.palette_colors, pd.sections, pd.metadata
           FROM projects p
           LEFT JOIN project_data pd ON p.id = pd.project_id
           WHERE p.user_session_id = ?
           ORDER BY p.updated_at DESC`
        ).bind(sessionId).all();
        return json(results);
      }

      // GET /api/projects/:id
      const projectMatch = path.match(/^\/api\/projects\/([^/]+)$/);
      if (projectMatch && request.method === 'GET') {
        const id = projectMatch[1];
        const project = await env.DB.prepare(
          `SELECT p.*, pd.inspiration_url, pd.inspiration_analysis, pd.palette_colors, pd.sections, pd.generated_html, pd.metadata
           FROM projects p
           LEFT JOIN project_data pd ON p.id = pd.project_id
           WHERE p.id = ? AND p.user_session_id = ?`
        ).bind(id, sessionId).first();
        if (!project) return json({ error: 'Not found' }, 404);
        return json(project);
      }

      // DELETE /api/projects/:id
      if (projectMatch && request.method === 'DELETE') {
        const id = projectMatch[1];
        await env.DB.prepare(`DELETE FROM project_data WHERE project_id = ?`).bind(id).run();
        await env.DB.prepare(`DELETE FROM projects WHERE id = ? AND user_session_id = ?`).bind(id, sessionId).run();
        return json({ ok: true });
      }

      // POST /api/analyze-image — TODO Phase 3: call Claude Vision
      if (path === '/api/analyze-image' && request.method === 'POST') {
        return json({
          mood: ['serene', 'professional', 'natural light'],
          colors: ['#F5F3F0', '#5DADE2', '#D4A574'],
          placeholder: true,
        });
      }

      // GET /api/search-unsplash — TODO Phase 3: call Unsplash API
      if (path === '/api/search-unsplash' && request.method === 'GET') {
        const q = url.searchParams.get('q') || 'wellness';
        const count = parseInt(url.searchParams.get('count') || '5', 10);
        const placeholders = Array.from({ length: count }, (_, i) => ({
          id: `placeholder-${i}`,
          url: null,
          thumb: null,
          alt: q,
          photographer: 'Unsplash',
          placeholder: true,
        }));
        return json({ results: placeholders, query: q });
      }

      // POST /api/generate-moodboard
      if (path === '/api/generate-moodboard' && request.method === 'POST') {
        const body = await request.json();
        const html = buildMoodBoardHTML(body);
        return json({ html });
      }

      return json({ error: 'Not found' }, 404);
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  },
};

function buildMoodBoardHTML(project) {
  const accent = project.accentColor || '#D4A574';
  const primary = project.primaryColor || '#FAFAF8';
  const secondary = project.secondaryColor || '#1a1a18';
  const sections = project.sections || [];
  const keywords = project.keywords || [];
  const projectName = project.projectName || 'Your Project';

  const sectionsHTML = sections.map(s => `
    <div class="mb-section">
      <h3 class="mb-section-label">${s.charAt(0).toUpperCase() + s.slice(1)}</h3>
      <div class="mb-images">
        <div class="mb-image" style="background:linear-gradient(135deg,${primary},${accent}22)"></div>
        <div class="mb-image" style="background:linear-gradient(135deg,${accent}22,${secondary}22)"></div>
        <div class="mb-image" style="background:linear-gradient(135deg,${secondary}11,${primary})"></div>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Mood Board — ${projectName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FAFAF8;color:#1a1a18;padding:3rem 2rem}
.container{max-width:960px;margin:0 auto}
h1{font-size:2.5rem;font-weight:300;margin-bottom:.25rem}
.subtitle{color:#8B8B86;margin-bottom:3rem}
.section-title{font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;color:#8B8B86;font-weight:600;margin-bottom:1rem}
.palette{display:flex;gap:1rem;margin-bottom:3rem}
.swatch{flex:1;height:80px;border-radius:8px}
.swatch-label{font-size:.8rem;text-align:center;margin-top:.5rem;color:#8B8B86}
.swatch-hex{font-size:.75rem;text-align:center;font-family:monospace}
.swatch-group{flex:1}
.typography{background:white;border-radius:12px;padding:2rem;margin-bottom:3rem;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.type-heading{font-size:2rem;font-weight:400;margin-bottom:.75rem;color:${secondary}}
.type-body{font-size:1rem;line-height:1.8;color:#8B8B86;margin-bottom:.75rem}
.type-caption{font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;color:#8B8B86}
.keywords{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:3rem}
.keyword{padding:.3rem .9rem;border-radius:100px;border:1px solid ${accent};color:${accent};font-size:.85rem}
.mb-section{margin-bottom:2.5rem}
.mb-section-label{font-size:1rem;font-weight:500;margin-bottom:1rem;text-transform:capitalize}
.mb-images{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem}
.mb-image{height:120px;border-radius:8px}
.cta{display:inline-block;padding:.875rem 2rem;background:${accent};color:white;border-radius:8px;font-weight:500;text-decoration:none;margin-top:2rem}
</style>
</head>
<body>
<div class="container">
<h1>${projectName}</h1>
<p class="subtitle">${project.businessType ? project.businessType + ' — ' : ''}Mood Board &amp; Design Direction</p>
<p class="section-title">Colour Palette</p>
<div class="palette">
  <div class="swatch-group"><div class="swatch" style="background:${primary};border:1px solid rgba(0,0,0,.1)"></div><p class="swatch-label">Primary</p><p class="swatch-hex">${primary}</p></div>
  <div class="swatch-group"><div class="swatch" style="background:${secondary}"></div><p class="swatch-label">Secondary</p><p class="swatch-hex">${secondary}</p></div>
  <div class="swatch-group"><div class="swatch" style="background:${accent}"></div><p class="swatch-label">Accent</p><p class="swatch-hex">${accent}</p></div>
</div>
<p class="section-title">Typography</p>
<div class="typography">
  <div class="type-heading">${projectName}</div>
  <p class="type-body">Expert guidance, compassionate care, real results. We help you achieve balance — from peak performance to deep restoration.</p>
  <span class="type-caption">Certified · Professional · Trusted</span>
</div>
${keywords.length > 0 ? `<p class="section-title">Keywords</p><div class="keywords">${keywords.map(k => `<span class="keyword">${k}</span>`).join('')}</div>` : ''}
<p class="section-title">Sections</p>
${sectionsHTML}
<a class="cta" href="#">Get Started</a>
</div>
</body>
</html>`;
}
