import JSZip from 'jszip';
import { WizardState } from '../types';
import { getPresetById } from '../data/presets';
import { slugify } from './helpers';

export function generateHTML(state: WizardState, includeTint = false): string {
  const preset = getPresetById(state.presetId);
  const primary = preset?.colors.primary ?? '#FAFAF8';
  const secondary = preset?.colors.secondary ?? '#1a1a18';
  const accent = state.accentColor;

  const tintOverlay = includeTint
    ? `<div style="position:absolute;inset:0;background:${accent};mix-blend-mode:multiply;opacity:0.28;pointer-events:none;"></div>`
    : '';

  const sectionsHTML = state.sections.map((s) => {
    const label = s.name;
    const imgs = s.images.length > 0
      ? s.images.map(img => img.url
          ? `<div class="mb-image" style="position:relative;border-radius:8px;overflow:hidden;">
               <img src="${img.url}" alt="${img.alt || label}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
               ${tintOverlay}
             </div>`
          : `<div class="mb-image" style="background:linear-gradient(135deg,${primary},${accent}22)"></div>`
        ).join('')
      : `
        <div class="mb-image" style="background: linear-gradient(135deg, ${primary}, ${accent}22)"></div>
        <div class="mb-image" style="background: linear-gradient(135deg, ${accent}22, ${secondary}22)"></div>
        <div class="mb-image" style="background: linear-gradient(135deg, ${secondary}11, ${primary})"></div>
      `;
    return `
    <div class="mb-section">
      <h3 class="mb-section-label">${label}</h3>
      <div class="mb-images">${imgs}</div>
    </div>
  `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mood Board — ${state.projectName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #FAFAF8; color: #1a1a18; padding: 3rem 2rem; }
    .container { max-width: 960px; margin: 0 auto; }
    h1 { font-size: 2.5rem; font-weight: 300; margin-bottom: 0.25rem; }
    .subtitle { color: #8B8B86; margin-bottom: 3rem; font-size: 1rem; }
    .section-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #8B8B86; font-weight: 600; margin-bottom: 1rem; }
    .palette { display: flex; gap: 1rem; margin-bottom: 3rem; }
    .swatch { flex: 1; height: 80px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.06); }
    .swatch-label { font-size: 0.8rem; text-align: center; margin-top: 0.5rem; color: #8B8B86; }
    .swatch-hex { font-size: 0.75rem; text-align: center; font-family: monospace; }
    .swatch-group { flex: 1; }
    .typography { background: white; border-radius: 12px; padding: 2rem; margin-bottom: 3rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .type-heading { font-size: 2rem; font-weight: 400; margin-bottom: 0.75rem; color: ${secondary}; }
    .type-body { font-size: 1rem; line-height: 1.8; color: #8B8B86; margin-bottom: 0.75rem; }
    .type-caption { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: #8B8B86; }
    .keywords { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 3rem; }
    .keyword { padding: 0.3rem 0.9rem; border-radius: 100px; border: 1px solid ${accent}; color: ${accent}; font-size: 0.85rem; }
    .mb-section { margin-bottom: 2.5rem; }
    .mb-section-label { font-size: 1rem; font-weight: 500; margin-bottom: 1rem; text-transform: capitalize; }
    .mb-images { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
    .mb-image { height: 120px; border-radius: 8px; overflow: hidden; }
    .cta { display: inline-block; padding: 0.875rem 2rem; background: ${accent}; color: white; border-radius: 8px; font-weight: 500; text-decoration: none; margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${state.projectName || 'Your Project'}</h1>
    <p class="subtitle">${state.businessTypes.length > 0 ? state.businessTypes.join(' · ') + ' — ' : ''}Mood Board &amp; Design Direction</p>

    <p class="section-title">Colour Palette — ${preset?.name ?? ''}</p>
    <div class="palette">
      <div class="swatch-group">
        <div class="swatch" style="background: ${primary}; border: 1px solid rgba(0,0,0,0.1);"></div>
        <p class="swatch-label">Primary</p>
        <p class="swatch-hex">${primary}</p>
      </div>
      <div class="swatch-group">
        <div class="swatch" style="background: ${secondary};"></div>
        <p class="swatch-label">Secondary</p>
        <p class="swatch-hex">${secondary}</p>
      </div>
      <div class="swatch-group">
        <div class="swatch" style="background: ${accent};"></div>
        <p class="swatch-label">Accent</p>
        <p class="swatch-hex">${accent}</p>
      </div>
    </div>

    <p class="section-title">Typography</p>
    <div class="typography">
      <div class="type-heading">${state.projectName || 'Premium Wellness Studio'}</div>
      <p class="type-body">Expert guidance, compassionate care, real results. We help you achieve balance — from peak performance to deep restoration.</p>
      <span class="type-caption">Certified · Professional · Trusted</span>
    </div>

    ${state.keywords.length > 0 ? `
    <p class="section-title">Keywords</p>
    <div class="keywords">
      ${state.keywords.map((k) => `<span class="keyword">${k}</span>`).join('')}
    </div>
    ` : ''}

    <p class="section-title">Sections</p>
    ${sectionsHTML}

    <a class="cta" href="#">Get Started</a>
  </div>
</body>
</html>`;
}

export async function downloadZIP(state: WizardState, includeTint = false) {
  const zip = new JSZip();
  const slug = slugify(state.projectName || 'moodboard');
  const html = generateHTML(state, includeTint);

  zip.file(`${slug}-moodboard.html`, html);

  const meta = {
    projectName: state.projectName,
    businessTypes: state.businessTypes,
    presetId: state.presetId,
    accentColor: state.accentColor,
    primaryColor: state.primaryColor,
    secondaryColor: state.secondaryColor,
    keywords: state.keywords,
    sections: state.sections.map(s => ({
      name: s.name,
      query: s.query,
      count: s.count,
      images: s.images.map(img => ({
        url: img.url,
        photographer: img.photographer,
        photographerUrl: img.photographerUrl,
        unsplashUrl: img.unsplashUrl,
      })),
    })),
    exportedAt: new Date().toISOString(),
  };
  zip.file('metadata.json', JSON.stringify(meta, null, 2));
  zip.file('README.md', `# ${state.projectName || 'Mood Board'}\n\nGenerated by Mood Board Generator.\n\n## Files\n- \`${slug}-moodboard.html\` — Open in browser to view\n- \`metadata.json\` — All project data\n\n## Images\nImages are linked from Unsplash. Credits in metadata.json.\n`);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}-moodboard.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadHTML(state: WizardState, includeTint = false) {
  const html = generateHTML(state, includeTint);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(state.projectName || 'moodboard').replace(/\s+/g, '-').toLowerCase()}-moodboard.html`;
  a.click();
  URL.revokeObjectURL(url);
}
