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

      // POST /api/analyze-image — Claude Vision
      if (path === '/api/analyze-image' && request.method === 'POST') {
        try {
          const apiKey = env.CLAUDE_API_KEY;
          if (!apiKey) {
            return json({ mood: ['serene', 'professional', 'natural'], colors: ['#F5F3F0', '#5DADE2', '#D4A574'], placeholder: true });
          }

          let imageBase64;
          let mediaType = 'image/jpeg';
          const contentType = request.headers.get('content-type') || '';

          if (contentType.includes('application/json')) {
            const body = await request.json();
            const imageUrl = body.url;
            const imageRes = await fetch(imageUrl);
            if (!imageRes.ok) throw new Error('Failed to fetch image URL');
            const respContentType = imageRes.headers.get('content-type') || 'image/jpeg';
            mediaType = respContentType.split(';')[0].trim();
            const buffer = await imageRes.arrayBuffer();
            imageBase64 = bufferToBase64(buffer);
          } else {
            const formData = await request.formData();
            const file = formData.get('file');
            if (!file) throw new Error('No file provided');
            mediaType = file.type || 'image/jpeg';
            const buffer = await file.arrayBuffer();
            imageBase64 = bufferToBase64(buffer);
          }

          // Normalise media type to Claude-supported values
          const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
          if (!supportedTypes.includes(mediaType)) mediaType = 'image/jpeg';

          const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 256,
              messages: [{
                role: 'user',
                content: [
                  {
                    type: 'image',
                    source: { type: 'base64', media_type: mediaType, data: imageBase64 },
                  },
                  {
                    type: 'text',
                    text: 'Analyse this image for design mood boarding. Return ONLY valid JSON with two fields: "mood" (array of 3-5 single descriptive words capturing the emotional tone, e.g. serene, minimal, warm) and "colors" (array of 3-5 dominant hex colour codes). No explanation, just JSON.',
                  },
                ],
              }],
            }),
          });

          if (!claudeRes.ok) throw new Error(`Claude API error: ${claudeRes.status}`);
          const claudeData = await claudeRes.json();
          const text = claudeData.content?.[0]?.text || '';

          // Extract JSON from response (strip any markdown code fences if present)
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error('No JSON in Claude response');
          const parsed = JSON.parse(jsonMatch[0]);

          return json({
            mood: Array.isArray(parsed.mood) ? parsed.mood.slice(0, 5) : [],
            colors: Array.isArray(parsed.colors) ? parsed.colors.slice(0, 5) : [],
            placeholder: false,
          });
        } catch (analysisErr) {
          // Graceful fallback — don't block the user
          return json({ mood: ['natural', 'calm', 'balanced'], colors: ['#F5F3F0', '#5DADE2', '#D4A574'], placeholder: true });
        }
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

      // POST /api/suggest-sections
      if (path === '/api/suggest-sections' && request.method === 'POST') {
        const body = await request.json();
        // Accept either categories[] (new) or category string (legacy)
        const categories = Array.isArray(body.categories)
          ? body.categories
          : body.category ? [body.category] : [];
        const suggestions = getSectionSuggestions(categories, body.presetId);
        return json(suggestions);
      }

      // POST /api/fetch-images
      if (path === '/api/fetch-images' && request.method === 'POST') {
        const { sections } = await request.json();
        const apiKey = env.UNSPLASH_API_KEY;

        if (!apiKey) {
          const results = {};
          for (const section of sections) {
            results[section.id] = {
              success: true,
              images: Array.from({ length: section.count }, (_, i) => ({
                id: `placeholder-${section.id}-${i}`,
                url: null,
                thumb: null,
                alt: section.query,
                photographer: 'Unsplash',
                photographerUrl: 'https://unsplash.com',
                unsplashUrl: 'https://unsplash.com',
                placeholder: true,
              })),
            };
          }
          return json(results);
        }

        const { createApi } = await import('unsplash-js');
        const unsplash = createApi({ accessKey: apiKey, fetch: globalThis.fetch });
        const results = {};

        for (const section of sections) {
          try {
            const response = await unsplash.search.getPhotos({
              query: section.query,
              page: section.page ?? 1,
              perPage: section.count,
              orderBy: 'relevant',
            });

            if (response.errors || !response.response) {
              results[section.id] = {
                success: false,
                message: 'Failed to fetch images',
                images: [],
              };
            } else {
              results[section.id] = {
                success: true,
                images: response.response.results.map(photo => ({
                  id: photo.id,
                  url: photo.urls.regular,
                  thumb: photo.urls.small,
                  alt: photo.alt_description || section.name,
                  photographer: photo.user.name,
                  photographerUrl: `https://unsplash.com/@${photo.user.username}`,
                  unsplashUrl: `https://unsplash.com/photos/${photo.id}`,
                  placeholder: false,
                })),
              };
            }
          } catch (err) {
            results[section.id] = { success: false, message: err.message, images: [] };
          }
        }

        return json(results);
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

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function getSectionSuggestions(categories, presetId) {
  // categories is string[] (may be empty or contain a single freetext entry for "Other")
  const preset = (presetId || '').toLowerCase();

  const isCalm = preset.includes('serene') || preset.includes('sage') || preset.includes('lavender') || preset.includes('rose');
  const isBold = preset.includes('bold') || preset.includes('golden') || preset.includes('coral') || preset.includes('forest');
  const isDark = preset.includes('navy') || preset.includes('dark') || preset.includes('forest');

  const modifier = isCalm ? 'calm serene natural light' : isBold ? 'dynamic energetic vibrant' : isDark ? 'dramatic moody professional' : 'professional clean modern';

  const maps = {
    yoga: [
      { name: 'Yoga Studio', query: `yoga studio spacious natural light ${modifier}`, count: 3 },
      { name: 'Meditation', query: `meditation mindfulness peaceful ${modifier}`, count: 3 },
      { name: 'Classes', query: `yoga class group studio instructor ${modifier}`, count: 3 },
      { name: 'Wellness', query: `wellness spa retreat ${modifier}`, count: 3 },
    ],
    personaltraining: [
      { name: 'Personal Training', query: `personal trainer gym workout ${modifier}`, count: 3 },
      { name: 'Strength & Conditioning', query: `strength training weights fitness ${modifier}`, count: 3 },
      { name: 'Transformation', query: `fitness transformation body health ${modifier}`, count: 3 },
      { name: 'Nutrition', query: `healthy food nutrition meal prep ${modifier}`, count: 3 },
    ],
    physiotherapy: [
      { name: 'Rehabilitation', query: `physiotherapy rehabilitation clinic ${modifier}`, count: 3 },
      { name: 'Manual Therapy', query: `physical therapy hands treatment ${modifier}`, count: 3 },
      { name: 'Recovery', query: `recovery stretch mobility healing ${modifier}`, count: 3 },
      { name: 'Clinical Space', query: `modern clinic clean medical space ${modifier}`, count: 3 },
    ],
    spabeauty: [
      { name: 'Spa Experience', query: `spa luxury relaxation treatment ${modifier}`, count: 3 },
      { name: 'Facials', query: `facial skin care beauty treatment ${modifier}`, count: 3 },
      { name: 'Massage', query: `massage therapy relaxing ${modifier}`, count: 3 },
      { name: 'Ambience', query: `spa interior candles calm luxury ${modifier}`, count: 3 },
    ],
    pilates: [
      { name: 'Pilates Studio', query: `pilates studio reformer equipment ${modifier}`, count: 3 },
      { name: 'Mat Classes', query: `pilates mat class core workout ${modifier}`, count: 3 },
      { name: 'Body & Mind', query: `body awareness balance flexibility ${modifier}`, count: 3 },
    ],
    mentalwellness: [
      { name: 'Therapy Space', query: `therapy counselling calm office ${modifier}`, count: 3 },
      { name: 'Mindfulness', query: `mindfulness meditation breathing ${modifier}`, count: 3 },
      { name: 'Support', query: `mental health wellbeing care ${modifier}`, count: 3 },
    ],
    sportsperformance: [
      { name: 'Athletic Training', query: `athlete performance training sport ${modifier}`, count: 3 },
      { name: 'Strength', query: `strength power weights elite sport ${modifier}`, count: 3 },
      { name: 'Recovery', query: `sports recovery ice bath compression ${modifier}`, count: 3 },
    ],
    dancestudio: [
      { name: 'Dance Classes', query: `dance studio class movement ${modifier}`, count: 3 },
      { name: 'Performance', query: `dance performance stage artistic ${modifier}`, count: 3 },
      { name: 'Community', query: `dance community group joy ${modifier}`, count: 3 },
    ],
    chiropractice: [
      { name: 'Chiropractic Care', query: `chiropractic clinic spine treatment ${modifier}`, count: 3 },
      { name: 'Pain Relief', query: `back pain relief treatment professional ${modifier}`, count: 3 },
      { name: 'Posture & Wellness', query: `posture wellness spinal health ${modifier}`, count: 3 },
    ],
    holistichealth: [
      { name: 'Holistic Studio', query: `holistic health natural wellness studio ${modifier}`, count: 3 },
      { name: 'Treatments', query: `holistic treatment acupuncture natural ${modifier}`, count: 3 },
      { name: 'Community', query: `wellness community retreat health ${modifier}`, count: 3 },
    ],
    corporatewellness: [
      { name: 'Workplace Wellness', query: `corporate wellness office health programme ${modifier}`, count: 3 },
      { name: 'Team Health', query: `team fitness corporate gym health ${modifier}`, count: 3 },
      { name: 'Mindfulness at Work', query: `office mindfulness stress relief workspace ${modifier}`, count: 3 },
    ],
    nutritiondietetics: [
      { name: 'Nutrition Consultation', query: `nutritionist dietitian consultation ${modifier}`, count: 3 },
      { name: 'Healthy Food', query: `healthy meal prep nutrition food ${modifier}`, count: 3 },
      { name: 'Wellness Plan', query: `diet plan healthy lifestyle wellness ${modifier}`, count: 3 },
    ],
  };

  const defaultSections = [
    { name: 'Hero', query: `wellness health professional ${modifier}`, count: 3 },
    { name: 'Services', query: `health services professional clinic ${modifier}`, count: 3 },
    { name: 'Team', query: `professional team healthcare ${modifier}`, count: 3 },
    { name: 'Environment', query: `modern studio space interior ${modifier}`, count: 3 },
  ];

  // For each selected category, fuzzy-match to a map key and take top 2 sections.
  // Deduplicate by section name, cap at 8 total.
  const seen = new Set();
  const result = [];

  const cats = (categories || []).filter(Boolean);

  for (const category of cats) {
    const cat = category.toLowerCase().replace(/[^a-z]/g, '');
    const key = Object.keys(maps).find(k => cat.includes(k) || k.includes(cat));
    const pool = key ? maps[key] : defaultSections;

    for (const s of pool.slice(0, 2)) {
      const nameKey = s.name.toLowerCase();
      if (!seen.has(nameKey)) {
        seen.add(nameKey);
        result.push(s);
      }
      if (result.length >= 8) break;
    }
    if (result.length >= 8) break;
  }

  // Fallback: no categories matched at all
  if (result.length === 0) {
    return defaultSections.map((s, i) => ({ ...s, id: `section-${i}`, images: [], approved: false }));
  }

  return result.map((s, i) => ({ ...s, id: `section-${i}`, images: [], approved: false }));
}
