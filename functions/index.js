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

// ---- Presets data (mirrors src/data/presets.ts) ----
const PRESETS_DATA = [
  { id: 'serene-minimalist', name: 'Serene Minimalist', description: 'Clean, calm, breathing white space with soft blue accents', audience: 'Yoga, wellness, meditation', colors: { primary: '#FFFFFF', secondary: '#5DADE2', accent: '#D4A574' } },
  { id: 'modern-elevated', name: 'Modern Elevated', description: 'Sophisticated warm neutrals with dark typography', audience: 'Premium, luxury, boutique', colors: { primary: '#F5F3F0', secondary: '#1a1a18', accent: '#D4A574' } },
  { id: 'bold-energetic', name: 'Bold Energetic', description: 'High contrast navy and orange for maximum impact', audience: 'Fitness, sports, tech', colors: { primary: '#0B3D91', secondary: '#FFFFFF', accent: '#FF6B35' } },
  { id: 'soft-sage', name: 'Soft Sage', description: 'Natural green tones, earthy and grounding', audience: 'Holistic health, nutrition', colors: { primary: '#F2F5F0', secondary: '#3D5A47', accent: '#A8C5A0' } },
  { id: 'rose-warmth', name: 'Rose Warmth', description: 'Warm blush palette, inviting and feminine', audience: 'Spa, beauty, pilates', colors: { primary: '#FDF4F0', secondary: '#C4746A', accent: '#E8A598' } },
  { id: 'deep-navy', name: 'Deep Navy', description: 'Dark, authoritative, clinical trust', audience: 'Physiotherapy, chiropractic', colors: { primary: '#0A1628', secondary: '#FFFFFF', accent: '#4A9EDE' } },
  { id: 'warm-terracotta', name: 'Warm Terracotta', description: 'Mediterranean warmth, community feel', audience: 'Dance studio, community wellness', colors: { primary: '#FFF8F3', secondary: '#8B4513', accent: '#E07848' } },
  { id: 'pure-white', name: 'Pure White', description: 'Medical-grade clarity, clean clinical', audience: 'Corporate wellness, medical', colors: { primary: '#FFFFFF', secondary: '#2C2C2C', accent: '#0066CC' } },
  { id: 'forest-dark', name: 'Forest Dark', description: 'Deep greens, nature immersive', audience: 'Outdoor training, retreats', colors: { primary: '#1A2E1A', secondary: '#FFFFFF', accent: '#6BCB77' } },
  { id: 'lavender-calm', name: 'Lavender Calm', description: 'Soft purple, tranquil and restorative', audience: 'Mental wellness, meditation', colors: { primary: '#F7F4FF', secondary: '#5B4B8A', accent: '#9B84D9' } },
  { id: 'golden-vitality', name: 'Golden Vitality', description: 'Warm gold energy, premium performance', audience: 'Sports performance, elite training', colors: { primary: '#1A1A18', secondary: '#FFFFFF', accent: '#F5C842' } },
  { id: 'coral-energy', name: 'Coral Energy', description: 'Vibrant and motivating, modern feel', audience: 'HIIT, group fitness', colors: { primary: '#FFF5F3', secondary: '#1A1A18', accent: '#FF6B6B' } },
];

// Fallback: pick 3 presets deterministically by rough keyword match
function getFallbackMoods(brief) {
  const b = brief.toLowerCase();
  const scored = PRESETS_DATA.map(p => {
    let score = 0;
    const words = `${p.name} ${p.description} ${p.audience}`.toLowerCase();
    b.split(/\W+/).forEach(w => { if (w.length > 3 && words.includes(w)) score++; });
    return { p, score };
  }).sort((a, b) => b.score - a.score);

  const chosen = scored.slice(0, 3).map(({ p }) => p);
  // Ensure 3 distinct choices (fill from remaining if needed)
  while (chosen.length < 3) {
    const extra = PRESETS_DATA.find(p => !chosen.some(c => c.id === p.id));
    if (extra) chosen.push(extra);
    else break;
  }

  return chosen.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    palette: p.colors,
    keywords: p.audience.split(',').map(s => s.trim()).slice(0, 4),
    sections: ['Hero', 'About', 'Services', 'Contact'],
    presetId: p.id,
  }));
}

async function callClaude(apiKey, model, prompt, maxTokens = 1024) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

function extractJSON(text) {
  // Handle markdown code blocks and raw JSON
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : text;
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


      // POST /api/generate-typography-options
      if (path === '/api/generate-typography-options' && request.method === 'POST') {
        const { mood, brief } = await request.json();
        if (!mood) return json({ error: 'mood required' }, 400);

        const FALLBACK_DIRECTIONS = [
          { id: 'editorial-serif', category: 'serif', displayFont: 'Georgia, "Times New Roman", serif', bodyFont: 'Georgia, "Times New Roman", serif', headingWeight: 400, bodyWeight: 400, personality: 'Editorial & authoritative', industryFit: 'Publishing, luxury, legal', specimen: 'The Art of Brand' },
          { id: 'modern-sans', category: 'sans-serif', displayFont: '"Helvetica Neue", Arial, sans-serif', bodyFont: '"Helvetica Neue", Arial, sans-serif', headingWeight: 600, bodyWeight: 400, personality: 'Clean & functional', industryFit: 'Tech, SaaS, corporate', specimen: 'Build Something Great' },
          { id: 'warm-humanist', category: 'sans-serif', displayFont: 'system-ui, -apple-system, sans-serif', bodyFont: 'system-ui, -apple-system, sans-serif', headingWeight: 500, bodyWeight: 400, personality: 'Friendly & approachable', industryFit: 'Healthcare, wellness, community', specimen: 'Welcome to Your Space' },
          { id: 'expressive-display', category: 'display', displayFont: 'Georgia, Garamond, serif', bodyFont: '"Helvetica Neue", Arial, sans-serif', headingWeight: 300, bodyWeight: 400, personality: 'Bold & distinctive', industryFit: 'Creative, fashion, hospitality', specimen: 'Make a Statement' },
          { id: 'technical-mono', category: 'sans-serif', displayFont: '"Trebuchet MS", sans-serif', bodyFont: 'system-ui, -apple-system, sans-serif', headingWeight: 600, bodyWeight: 300, personality: 'Precise & technical', industryFit: 'Developer tools, fintech, engineering', specimen: 'Precision by Design' },
        ];

        const apiKey = env.CLAUDE_API_KEY;
        if (!apiKey) {
          return json({ directions: FALLBACK_DIRECTIONS });
        }

        const prompt = `You are a typographer. Given this brand brief and mood, generate 5 distinct typography directions.

Brief: "${(brief || '').slice(0, 200)}"
Mood: ${mood.name} — ${mood.description}
Keywords: ${(mood.keywords || []).join(', ')}

For each direction choose from this font whitelist ONLY:
- "Georgia, 'Times New Roman', serif"
- '"Helvetica Neue", Arial, sans-serif'
- "system-ui, -apple-system, sans-serif"
- "Garamond, Georgia, serif"
- '"Trebuchet MS", sans-serif'

Return ONLY valid JSON:
{
  "directions": [
    {
      "id": "unique-id",
      "category": "serif|sans-serif|mixed|display",
      "displayFont": "<from whitelist>",
      "bodyFont": "<from whitelist>",
      "headingWeight": <300|400|500|600>,
      "bodyWeight": <300|400>,
      "personality": "<3–5 word adjective phrase>",
      "industryFit": "<2–3 industries>",
      "specimen": "<4–6 word phrase that shows off this font>"
    }
  ]
}`;

        try {
          const text = await callClaude(apiKey, 'claude-haiku-4-5-20251001', prompt, 1200);
          const parsed = JSON.parse(extractJSON(text));
          if (!parsed.directions || parsed.directions.length === 0) {
            return json({ directions: FALLBACK_DIRECTIONS });
          }
          return json({ directions: parsed.directions.slice(0, 5) });
        } catch (err) {
          console.error('generate-typography-options error:', err.message);
          return json({ directions: FALLBACK_DIRECTIONS });
        }
      }

      // POST /api/generate-moods
      if (path === '/api/generate-moods' && request.method === 'POST') {
        const { brief } = await request.json();
        if (!brief || typeof brief !== 'string' || brief.trim().length < 10) {
          return json({ error: 'Brief must be at least 10 characters' }, 400);
        }
        const trimmed = brief.trim().slice(0, 200);
        const apiKey = env.CLAUDE_API_KEY;
        if (!apiKey) {
          return json({ moods: getFallbackMoods(trimmed) });
        }
        const prompt = `You are a brand design expert. Given this project brief: "${trimmed}"

From these 12 design presets, select the 3 MOST SUITABLE for this specific project:
${JSON.stringify(PRESETS_DATA, null, 2)}

For each selected preset return an object with:
- id: exact preset id (unchanged)
- name: exact preset name (unchanged)
- description: one sentence tailored specifically to this brief and project type
- palette: exact colors from the preset (do NOT invent new colors): { primary, secondary, accent }
- keywords: array of 5 specific keywords relevant to THIS brief AND this mood
- sections: array of 4-5 page/app section names appropriate for this type of business
- presetId: same as id

Return ONLY valid JSON, no preamble, no markdown:
{ "moods": [ ...3 items... ] }`;

        try {
          const text = await callClaude(apiKey, 'claude-haiku-4-5-20251001', prompt, 1200);
          const parsed = JSON.parse(extractJSON(text));
          if (!parsed.moods || !Array.isArray(parsed.moods) || parsed.moods.length === 0) {
            return json({ moods: getFallbackMoods(trimmed) });
          }
          return json({ moods: parsed.moods.slice(0, 3) });
        } catch (err) {
          console.error('generate-moods error:', err.message);
          return json({ moods: getFallbackMoods(trimmed) });
        }
      }

      // POST /api/generate-brand-kit
      if (path === '/api/generate-brand-kit' && request.method === 'POST') {
        const { mood, brief, projectName, typography } = await request.json();
        if (!mood || !brief) return json({ error: 'mood and brief required' }, 400);

        const apiKey = env.CLAUDE_API_KEY;

        function buildFallbackBrandKit(mood, brief) {
          return {
            colors: {
              primary: mood.palette?.primary || '#FFFFFF',
              secondary: mood.palette?.secondary || '#1a1a18',
              accent: mood.palette?.accent || '#D4A574',
              background: mood.palette?.primary || '#FAFAF8',
              surface: '#FFFFFF',
              text: '#1a1a18',
              muted: '#8B8B86',
              border: '#E8E8E5',
              success: '#27AE60',
              warning: '#F5C842',
              error: '#e74c3c',
            },
            typography: {
              headingFont: typography?.displayFont || 'system-ui, -apple-system, sans-serif',
              bodyFont: typography?.bodyFont || 'system-ui, -apple-system, sans-serif',
              headingWeight: typography?.headingWeight || 400,
              bodyWeight: 400,
              scaleRatio: 1.25,
              baseSizePx: 16,
              lineHeightBody: 1.8,
              lineHeightHeading: 1.2,
              letterSpacingHeading: '-0.02em',
            },
            spacing: {
              baseUnit: 8,
              scale: [4, 8, 12, 16, 24, 32, 48, 64, 96],
              containerMaxWidth: 960,
              cardPadding: '2rem',
              sectionGap: '4rem',
              borderRadius: { sm: '8px', md: '12px', lg: '16px', full: '9999px' },
            },
            components: [
              { name: 'Primary Button', description: 'Main call-to-action button', cssExample: `background: ${mood.palette?.accent || '#D4A574'}; color: #fff; padding: 0.75rem 1.5rem; border-radius: 8px;` },
              { name: 'Card', description: 'Content card with subtle shadow', cssExample: `background: #fff; border: 1px solid #E8E8E5; border-radius: 12px; padding: 1.5rem;` },
            ],
            layoutRules: [
              'Use a 12-column grid with 1200px max-width',
              'Maintain consistent 8px spacing increments throughout',
              'Primary colour for backgrounds, accent for interactive elements',
              'Ensure 4.5:1 contrast ratio for all body text (WCAG AA)',
            ],
            moodName: mood.name,
            brief,
            generatedAt: new Date().toISOString(),
          };
        }

        if (!apiKey) {
          return json({ brandKit: buildFallbackBrandKit(mood, brief) });
        }

        const typographyInstruction = typography
          ? `- Use EXACTLY these fonts: headingFont="${typography.displayFont}", bodyFont="${typography.bodyFont}", headingWeight=${typography.headingWeight}, bodyWeight=${typography.bodyWeight}`
          : '- Choose typography from this whitelist ONLY: "system-ui, -apple-system, sans-serif" | "Georgia, \'Times New Roman\', serif" | "\\"Helvetica Neue\\", Arial, sans-serif" | "Garamond, Georgia, serif" | "Trebuchet MS, sans-serif"';

        const prompt = `You are a senior brand designer. Generate a complete brand kit for this project.

Project brief: "${brief}"
Project name: "${projectName || mood.name}"
Selected mood: ${mood.name}
Mood description: ${mood.description}
Colour palette: primary=${mood.palette?.primary}, secondary=${mood.palette?.secondary}, accent=${mood.palette?.accent}
Keywords: ${(mood.keywords || []).join(', ')}
${typography ? `Typography direction: ${typography.personality} (${typography.industryFit})` : ''}

IMPORTANT:
- Use EXACTLY these hex codes for primary/secondary/accent (do not change them)
${typographyInstruction}
- All spacing values must be multiples of 8
- Components must have real, usable CSS examples

Return ONLY valid JSON matching this exact schema:
{
  "colors": {
    "primary": "${mood.palette?.primary}",
    "secondary": "${mood.palette?.secondary}",
    "accent": "${mood.palette?.accent}",
    "background": "<hex - derived from primary, suitable for page bg>",
    "surface": "<hex - white or near-white for cards>",
    "text": "<hex - dark colour for body text>",
    "muted": "<hex - for secondary text, placeholders>",
    "border": "<hex - subtle border colour>",
    "success": "<hex>",
    "warning": "<hex>",
    "error": "<hex>"
  },
  "typography": {
    "headingFont": "<from whitelist>",
    "bodyFont": "<from whitelist>",
    "headingWeight": <300|400|500|600>,
    "bodyWeight": <300|400>,
    "scaleRatio": <1.125|1.25|1.333>,
    "baseSizePx": 16,
    "lineHeightBody": 1.8,
    "lineHeightHeading": 1.2,
    "letterSpacingHeading": "-0.02em"
  },
  "spacing": {
    "baseUnit": 8,
    "scale": [4, 8, 12, 16, 24, 32, 48, 64, 96],
    "containerMaxWidth": <960|1200|1440>,
    "cardPadding": "1.5rem",
    "sectionGap": "4rem",
    "borderRadius": { "sm": "8px", "md": "12px", "lg": "16px", "full": "9999px" }
  },
  "components": [
    { "name": "Primary Button", "description": "<1 sentence>", "cssExample": "<short CSS snippet>" },
    { "name": "Card", "description": "<1 sentence>", "cssExample": "<short CSS snippet>" },
    { "name": "Input Field", "description": "<1 sentence>", "cssExample": "<short CSS snippet>" },
    { "name": "Nav Link", "description": "<1 sentence>", "cssExample": "<short CSS snippet>" },
    { "name": "Badge/Tag", "description": "<1 sentence>", "cssExample": "<short CSS snippet>" }
  ],
  "layoutRules": [
    "<rule 1>",
    "<rule 2>",
    "<rule 3>",
    "<rule 4>"
  ],
  "moodName": "${mood.name}",
  "brief": "${brief.replace(/"/g, '\\"')}",
  "generatedAt": "${new Date().toISOString()}"
}`;

        try {
          const text = await callClaude(apiKey, 'claude-sonnet-4-6', prompt, 2000);
          const parsed = JSON.parse(extractJSON(text));
          // Enforce palette colours are not overridden
          if (mood.palette?.primary) parsed.colors.primary = mood.palette.primary;
          if (mood.palette?.secondary) parsed.colors.secondary = mood.palette.secondary;
          if (mood.palette?.accent) parsed.colors.accent = mood.palette.accent;
          parsed.moodName = mood.name;
          parsed.brief = brief;
          parsed.generatedAt = new Date().toISOString();
          return json({ brandKit: parsed });
        } catch (err) {
          console.error('generate-brand-kit error:', err.message);
          return json({ brandKit: buildFallbackBrandKit(mood, brief) });
        }
      }

      // POST /api/start-mockup — initial generation via Flux 2 Pro
      if (path === '/api/start-mockup' && request.method === 'POST') {
        const replicateToken = env.REPLICATE_API_TOKEN;
        if (!replicateToken) {
          return json({ error: 'Mockup generation not configured' }, 403);
        }
        const { sectionName, mood, brandKit, brief, referenceImages } = await request.json();
        if (!sectionName || !mood) return json({ error: 'sectionName and mood required' }, 400);
        // referenceImages: string[] — Unsplash photo URLs, up to 8 (passed from ImagesScreen selections)

        // Build a Claude-powered visual prompt if CLAUDE_API_KEY is available
        let visualPrompt = `${sectionName} section design for ${brief || mood.name}. Primary color ${brandKit?.colors?.primary || mood.palette?.primary}, secondary ${brandKit?.colors?.secondary || mood.palette?.secondary}, accent ${brandKit?.colors?.accent || mood.palette?.accent}. ${mood.keywords?.slice(0, 3).join(', ')} aesthetic. Clean, professional, modern UI mockup.`;

        if (env.CLAUDE_API_KEY) {
          try {
            const claudePrompt = `Write a Flux image generation prompt (max 200 chars) for the "${sectionName}" section of a ${brief || mood.name + ' website'}.
Brand colours: primary=${brandKit?.colors?.primary || mood.palette?.primary}, accent=${brandKit?.colors?.accent || mood.palette?.accent}
Mood: ${mood.description}
Style: ${(mood.keywords || []).slice(0, 3).join(', ')}
Return ONLY the prompt text, nothing else.`;
            const text = await callClaude(env.CLAUDE_API_KEY, 'claude-haiku-4-5-20251001', claudePrompt, 256);
            if (text && text.length > 20) visualPrompt = text.trim();
          } catch {
            // use default prompt
          }
        }

        const isPortrait = sectionName.toLowerCase().includes('mobile') || sectionName.toLowerCase().includes('app');

        try {
          // Flux 2 Pro (flux-pro-1.1) — text-to-image, optionally guided by Unsplash reference images
          const fluxInput = {
            prompt: visualPrompt,
            aspect_ratio: isPortrait ? '9:16' : '16:9',
            output_format: 'webp',
            output_quality: 80,
            safety_tolerance: 2,
          };

          // If caller passed Unsplash reference images, include up to 8 as image_prompt_strength hints
          if (Array.isArray(referenceImages) && referenceImages.length > 0) {
            fluxInput.image_prompt = referenceImages.slice(0, 8)[0]; // flux-pro-1.1 takes single image_prompt
            fluxInput.image_prompt_strength = 0.3; // subtle influence — keeps prompt dominant
          }

          const replicateRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-pro-1.1/predictions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${replicateToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'wait',
            },
            body: JSON.stringify({ input: fluxInput }),
          });

          const prediction = await replicateRes.json();

          if (!replicateRes.ok) {
            return json({ error: prediction.detail || 'Replicate error' }, 500);
          }

          // Synchronous result via Prefer: wait
          if (prediction.status === 'succeeded' && prediction.output) {
            const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
            return json({ status: 'succeeded', imageUrl, predictionId: prediction.id });
          }

          // Async: return predictionId for polling
          return json({ status: prediction.status, predictionId: prediction.id });
        } catch (err) {
          return json({ error: err.message }, 500);
        }
      }

      // POST /api/refine-mockup — iterative editing via Flux Kontext Max
      if (path === '/api/refine-mockup' && request.method === 'POST') {
        const replicateToken = env.REPLICATE_API_TOKEN;
        if (!replicateToken) return json({ error: 'Mockup generation not configured' }, 403);

        const { imageUrl, instruction, brandKit, mood } = await request.json();
        if (!imageUrl || !instruction) return json({ error: 'imageUrl and instruction required' }, 400);

        // Optionally enrich the edit instruction with brand context
        let editPrompt = instruction.trim();
        if (env.CLAUDE_API_KEY && brandKit) {
          try {
            const claudePrompt = `Rewrite this image edit instruction as a precise Flux Kontext prompt (max 150 chars).
Instruction: "${instruction}"
Brand accent colour: ${brandKit.colors?.accent}
Mood: ${mood?.name || ''}
Keep only what needs to change, preserve everything else. Return ONLY the prompt.`;
            const text = await callClaude(env.CLAUDE_API_KEY, 'claude-haiku-4-5-20251001', claudePrompt, 200);
            if (text && text.length > 10) editPrompt = text.trim();
          } catch {
            // use raw instruction
          }
        }

        try {
          const replicateRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-max/predictions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${replicateToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'wait',
            },
            body: JSON.stringify({
              input: {
                input_image: imageUrl,
                prompt: editPrompt,
                output_format: 'webp',
                output_quality: 80,
                safety_tolerance: 2,
              },
            }),
          });

          const prediction = await replicateRes.json();

          if (!replicateRes.ok) {
            return json({ error: prediction.detail || 'Replicate error' }, 500);
          }

          if (prediction.status === 'succeeded' && prediction.output) {
            const refined = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
            return json({ status: 'succeeded', imageUrl: refined, predictionId: prediction.id });
          }

          return json({ status: prediction.status, predictionId: prediction.id });
        } catch (err) {
          return json({ error: err.message }, 500);
        }
      }

      // GET /api/mockup-status/:id — poll Replicate prediction status
      const mockupStatusMatch = path.match(/^\/api\/mockup-status\/([^/]+)$/);
      if (mockupStatusMatch && request.method === 'GET') {
        const replicateToken = env.REPLICATE_API_TOKEN;
        if (!replicateToken) return json({ error: 'Not configured' }, 403);

        const predictionId = mockupStatusMatch[1];
        try {
          const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: { 'Authorization': `Bearer ${replicateToken}` },
          });
          const prediction = await res.json();
          if (prediction.status === 'succeeded' && prediction.output?.[0]) {
            return json({ status: 'succeeded', imageUrl: prediction.output[0] });
          }
          if (prediction.status === 'failed') {
            return json({ status: 'failed', error: prediction.error || 'Generation failed' });
          }
          return json({ status: prediction.status });
        } catch (err) {
          return json({ error: err.message }, 500);
        }
      }

      // POST /api/analyze-image — TODO Phase 3: call Claude Vision
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

        // Append a Mood & Texture section if keywords are provided
        const keywords = Array.isArray(body.keywords) ? body.keywords : [];
        if (keywords.length > 0) {
          const presetName = body.presetName || '';
          let moodQuery = `${keywords.slice(0, 3).join(' ')} gradient texture abstract`;
          try {
            const apiKey = env.CLAUDE_API_KEY;
            if (apiKey) {
              const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'x-api-key': apiKey,
                  'anthropic-version': '2023-06-01',
                  'content-type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'claude-haiku-4-5-20251001',
                  max_tokens: 64,
                  messages: [{
                    role: 'user',
                    content: `Generate a concise Unsplash photo search query (8-12 words) for abstract, textured, or gradient imagery that evokes these design keywords: ${keywords.join(', ')}.${presetName ? ` The design direction is "${presetName}".` : ''} Focus on textures, gradients, abstract patterns, color fields, natural materials — not specific people or objects. Return ONLY the search query, no explanation.`,
                  }],
                }),
              });
              if (claudeRes.ok) {
                const d = await claudeRes.json();
                const q = (d.content?.[0]?.text || '').trim().replace(/['"]/g, '');
                if (q.length > 3) moodQuery = q;
              }
            }
          } catch { /* use fallback query */ }

          suggestions.push({
            id: 'mood-texture',
            name: 'Mood & Texture',
            query: moodQuery,
            count: 4,
            images: [],
            approved: false,
          });
        }

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

      // POST /api/rank-presets — Claude ranks presets by keywords
      if (path === '/api/rank-presets' && request.method === 'POST') {
        try {
          const body = await request.json();
          const { keywords = [], industry = '', presets: presetList = [] } = body;
          const apiKey = env.CLAUDE_API_KEY;

          if (!apiKey || presetList.length === 0) {
            // Fallback: return presets with equal scores (preserve original order)
            return json(presetList.map(p => ({ presetId: p.id, score: 5, description: p.description })));
          }

          const presetsText = presetList.map(p =>
            `{"id":"${p.id}","name":"${p.name}","description":"${p.description}","audience":"${p.audience}"}`
          ).join('\n');

          const prompt = `You are a design advisor. Score each design preset from 0-10 based on how well it matches these brand keywords and industry.

Industry: ${industry || 'not specified'}
Keywords: ${keywords.join(', ')}

For each preset, provide:
- score (integer 0-10, where 10 = perfect match, 0 = completely wrong vibe)
- description: a single sentence (max 12 words) explaining how it fits or contrasts the keywords

Presets:
${presetsText}

Return ONLY valid JSON array with no markdown: [{"presetId":"...", "score": 8, "description": "..."}]`;

          const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 2048,
              messages: [{ role: 'user', content: prompt }],
            }),
          });

          if (!claudeRes.ok) throw new Error(`Claude error: ${claudeRes.status}`);
          const claudeData = await claudeRes.json();
          const text = claudeData.content?.[0]?.text || '';
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (!jsonMatch) throw new Error('No JSON array in response');
          const parsed = JSON.parse(jsonMatch[0]);
          return json(parsed);
        } catch {
          return json([]);
        }
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
