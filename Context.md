# Mood Board Generator — Project Context

## Overview

A 9-step wizard that helps non-designers create visual design direction guides (mood boards) for health and wellness websites. The tool teaches 5 mood boarding principles inline as users build.

**Live URLs**
- App: https://mood-board.pages.dev
- Worker API: https://mood-board.ashwinjyoti.workers.dev

**Repo:** https://github.com/ashwinjyoti-ship-it/aishwin-moodboard

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Cloudflare Workers (single file: `functions/index.js`) |
| Database | Cloudflare D1 (SQLite) — `mood-projects` |
| Deployment | Cloudflare Pages (frontend) + Workers CI (backend) |
| Image API | Unsplash JS SDK (`unsplash-js`) |
| AI API | Claude Vision (wired, stub — ready for Phase 6) |
| Export | JSZip (client-side ZIP generation) |

---

## Architecture

```
aishwin-moodboard/
├── src/
│   ├── App.tsx                         # Wizard router — renders step by step
│   ├── App.css                         # All styles (CSS variables + component styles)
│   ├── main.tsx
│   ├── types.ts                        # WizardState, Section, UnsplashPhoto, ColorPreset
│   ├── context/
│   │   └── ProjectContext.tsx          # Global state + localStorage session ID
│   ├── data/
│   │   └── presets.ts                  # 12 design presets with colour palettes
│   ├── components/
│   │   ├── ProgressBar.tsx             # 9-step breadcrumb
│   │   ├── StepNav.tsx                 # Back / Continue buttons
│   │   ├── TeachingTooltip.tsx         # Warm (yellow) or cool (blue) principle callout
│   │   └── steps/
│   │       ├── Step1ProjectName.tsx    # Project name + 12-category chip grid
│   │       ├── Step2DesignDirection.tsx # 12 presets grid with colour swatches
│   │       ├── Step3Inspiration.tsx    # Drag-drop upload + URL paste (6 images max)
│   │       ├── Step3Keywords.tsx       # Keyword tag chip input
│   │       ├── Step4Colors.tsx         # Editable palette swatches + live preview
│   │       ├── Step5Sections.tsx       # Auto-suggest + editable section cards
│   │       ├── Step6Images.tsx         # Unsplash image grid + per-section Swap
│   │       ├── Step7Generate.tsx       # Mood board preview + HTML/ZIP/D1 export
│   │       └── Step8Done.tsx           # Project dashboard (list, delete, new)
│   ├── hooks/
│   │   ├── useProjectApi.ts            # D1 CRUD via Workers API
│   │   ├── useUnsplash.ts              # Unsplash image search via Workers proxy
│   │   └── useClaude.ts               # Claude Vision analysis stub (Phase 6)
│   └── utils/
│       ├── api.ts                      # Base fetch wrapper with x-session-id header
│       ├── constants.ts               # Design tokens, CATEGORIES, TOTAL_STEPS
│       └── helpers.ts                 # slugify, capitalize, downloadBlob
├── functions/
│   └── index.js                       # Cloudflare Workers API router
├── migrations/
│   └── 001_create_projects.sql        # D1 schema: projects + project_data tables
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GH Actions: deploys Worker on push to main
├── wrangler.toml                      # Worker name: mood-board, D1 binding
└── .env.local.example                 # Template for local dev secrets
```

---

## Wizard Flow (9 Steps)

| Step | File | What it does |
|---|---|---|
| 1 | `Step1ProjectName` | Project name + business category chip picker (12 categories) |
| 2 | `Step2DesignDirection` | Pick from 12 design presets in a 3-col responsive grid |
| 3 | `Step3Inspiration` | Upload inspiration images (drag-drop / URL paste, max 6) |
| 4 | `Step3Keywords` | Add vibe keywords as chips |
| 5 | `Step4Colors` | Edit primary / secondary / accent colours with live preview |
| 6 | `Step5Sections` | Auto-suggested editable sections (name, Unsplash query, count slider) |
| 7 | `Step6Images` | Real Unsplash photo grid per section, Swap ↻ to refresh |
| 8 | `Step7Generate` | Mood board preview + Download HTML / ZIP / Save to D1 |
| 9 | `Step8Done` | Project dashboard: saved boards with palette strips, delete |

---

## 5 Design Principles Taught

| # | Principle | Shown in |
|---|---|---|
| 1 | Know Your Audience | Step 1 |
| 2 | Coherence | Step 2 + Step 6 |
| 3 | 60–30–10 Colour Rule | Step 5 |
| 4 | Reference Images Build Trust | Step 7 |
| 5 | Iteration Refines Vision | Step 8 + Step 9 |

---

## 12 Design Presets

| ID | Name | Audience |
|---|---|---|
| `serene-minimalist` | Serene Minimalist | Yoga, wellness, meditation |
| `modern-elevated` | Modern Elevated | Premium, luxury, boutique |
| `bold-energetic` | Bold Energetic | Fitness, sports, tech |
| `soft-sage` | Soft Sage | Holistic health, nutrition |
| `rose-warmth` | Rose Warmth | Spa, beauty, pilates |
| `deep-navy` | Deep Navy | Physiotherapy, chiropractic |
| `warm-terracotta` | Warm Terracotta | Dance studio, community |
| `pure-white` | Pure White | Corporate wellness, medical |
| `forest-dark` | Forest Dark | Outdoor training, retreats |
| `lavender-calm` | Lavender Calm | Mental wellness, meditation |
| `golden-vitality` | Golden Vitality | Sports performance, elite |
| `coral-energy` | Coral Energy | HIIT, group fitness |

---

## Workers API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/projects` | Save project to D1 |
| `GET` | `/api/projects` | List projects by session ID |
| `GET` | `/api/projects/:id` | Load single project |
| `DELETE` | `/api/projects/:id` | Delete project |
| `POST` | `/api/suggest-sections` | Auto-suggest sections for category + preset |
| `POST` | `/api/fetch-images` | Fetch Unsplash photos for sections |
| `POST` | `/api/analyze-image` | Claude Vision analysis (stub — ready for Phase 6) |
| `POST` | `/api/generate-moodboard` | Generate mood board HTML server-side |

All endpoints read `x-session-id` header to scope data per anonymous user session.

---

## D1 Database Schema

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  preset_name TEXT,
  custom_description TEXT,
  created_at TEXT,
  updated_at TEXT,
  user_session_id TEXT
);

CREATE TABLE project_data (
  project_id TEXT PRIMARY KEY,
  inspiration_url TEXT,
  inspiration_analysis TEXT,
  palette_colors TEXT,     -- JSON: { primary, secondary, accent }
  sections TEXT,           -- JSON: Section[]
  generated_html TEXT,
  metadata TEXT,           -- JSON: { keywords, presetId, ... }
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

- Database name: `mood-projects`
- Database ID: `97075942-c155-4a21-a11f-433dbda9d1aa`
- Region: ENAM

---

## Environment Variables & Secrets

### Cloudflare Workers secrets (set via wrangler)
| Name | Purpose |
|---|---|
| `UNSPLASH_API_KEY` | Unsplash image search (50 req/hr free tier) |
| `CLAUDE_API_KEY` | Claude Vision for inspiration analysis (Phase 6) |

### Cloudflare Pages environment variables
| Name | Value |
|---|---|
| `VITE_API_BASE` | `https://mood-board.ashwinjyoti.workers.dev` |

### GitHub repository secrets (for Actions)
| Name | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Wrangler auth for Worker deploys |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account scoping |

### Local development (`.env.local` — never committed)
```
VITE_API_BASE=http://localhost:8787
```

---

## Design System

### Colours
| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#FAFAF8` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, panels |
| `--color-text` | `#1a1a18` | Body text |
| `--color-muted` | `#8B8B86` | Captions, hints |
| `--color-accent` | `#D4A574` | CTAs, highlights (use sparingly) |
| `--color-support` | `#5DADE2` | Cool tooltips, info |
| `--color-success` | `#27AE60` | Success states |
| `--color-border` | `#E8E8E5` | Dividers, card borders |

### Typography
- Font: system stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue'`)
- Display: 3rem, weight 300
- Heading: 1.8rem, weight 400
- Body: 1rem, line-height 1.8
- Caption: 0.8rem, muted

### Spacing
- Card padding: `2rem`
- Section gap: `3–4rem`
- 8px grid throughout
- Border radius: `8px` (sm), `12px` (md)

---

## Deployment

### Auto-deploy on push to `main`
- **Frontend**: Cloudflare Pages (connected to GitHub) — runs `npm run build`, deploys `dist/`
- **Worker**: GitHub Actions (`.github/workflows/deploy.yml`) — runs `wrangler deploy`

### Manual commands
```bash
# Local dev
npm run dev              # Vite frontend at localhost:5173
npm run workers:dev      # Worker at localhost:8787

# Deploy
npm run workers:deploy   # Push Worker to Cloudflare
npm run build            # Build frontend

# Database
npm run db:init          # Run migration on mood-projects (dev)
```

---

## Session Management

No authentication. Each browser session gets a random UUID stored in `localStorage` under `mb_session_id`. Every API request sends it as `x-session-id` header. The Worker scopes all D1 queries to this session ID.

---

## What's Next (Future Phases)

| Phase | Scope |
|---|---|
| Phase 6 | Wire Claude Vision API in Step 3 — analyse uploaded inspiration images, extract mood + colours |
| Phase 7 | AI copy generation in Step 8 — Claude writes hero taglines, service descriptions keyed to preset + keywords |
| Phase 8 | Duplicate project, rename, version history in dashboard |
| Phase 9 | Shareable public URL for each mood board (read-only view) |
