# Mood Board Generator v2.0 — Project Context

## Overview

An AI-powered brand kit generator. Enter a one-sentence brief → get 3 AI mood options → pick a typography direction → auto-generate a full brand kit → optionally generate AI mockups via Flux → export as Markdown / CSS / JSON / image ZIP.

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
| AI — Moods | Claude Haiku (`claude-haiku-4-5-20251001`) |
| AI — Brand Kit | Claude Sonnet (`claude-sonnet-4-6`) |
| AI — Mockups | Replicate `flux-schnell` via Replicate API |
| Image API | Unsplash JS SDK (`unsplash-js`) |
| Export | JSZip (client-side ZIP), client-side Markdown/CSS/JSON formatters |

---

## App Flow

```
Brief (10–200 chars)
  └─ POST /api/generate-moods  →  3 MoodOption cards
       └─ Select mood
            └─ POST /api/generate-typography-options  →  5 TypographyDirection cards
                 └─ Select typography
                      └─ POST /api/generate-brand-kit  →  BrandKit (colors, type, spacing, components)
                           ├─ Export (Markdown / CSS / JSON)
                           └─ PathsScreen (Website / App / Logo / Desktop)
                                └─ POST /api/start-mockup × N  →  Flux images
                                     └─ Export + ZIP download
```

---

## Architecture

```
aishwin-moodboard/
├── src/
│   ├── App.tsx                          # Direct-flow router
│   ├── App.css                          # All styles (CSS variables + component styles)
│   ├── types.ts                         # AppState, AppAction, FlowStep, MoodOption,
│   │                                    #   BrandKit, TypographyDirection, DesignPath,
│   │                                    #   MockupImage, UnsplashPhoto, Section
│   ├── context/
│   │   └── AppContext.tsx               # useReducer global state + helpers
│   ├── data/
│   │   └── presets.ts                   # 12 design presets (used for fallbacks)
│   ├── components/
│   │   ├── FlowIndicator.tsx            # 5-step progress indicator
│   │   └── MoodCard.tsx                 # Mood selection card with swatches + keywords
│   ├── screens/
│   │   ├── BriefScreen.tsx              # Brief textarea + example chips
│   │   ├── MoodsScreen.tsx              # 3 AI mood cards — select to proceed
│   │   ├── TypographyScreen.tsx         # 5 typography direction cards (font specimens)
│   │   ├── BrandKitScreen.tsx           # Full brand kit display — colors, type, spacing
│   │   ├── PathsScreen.tsx              # Multi-select: Website / App / Logo / Desktop
│   │   ├── ImagesScreen.tsx             # Optional Unsplash reference images per section
│   │   ├── MockupsScreen.tsx            # Per-section Flux image generation + polling
│   │   └── ExportScreen.tsx             # Download Markdown / CSS / JSON / mockup ZIP
│   ├── hooks/
│   │   ├── useAppApi.ts                 # generateMoods, generateTypographyDirections,
│   │   │                               #   generateBrandKit, saveProject
│   │   ├── useProjectApi.ts             # D1 CRUD (list, load, delete)
│   │   ├── useUnsplash.ts               # Unsplash image search via Workers proxy
│   │   └── useClaude.ts                 # Claude Vision analysis (optional enrichment)
│   └── utils/
│       ├── api.ts                       # apiFetch wrapper with x-session-id header
│       ├── exportFormatters.ts          # toMarkdown, toJSON, toCSSTokens
│       ├── featureFlags.ts              # FEATURE_FLAGS.FLUX_MOCKUPS
│       ├── constants.ts                 # Design tokens
│       └── helpers.ts                   # slugify, capitalize, downloadBlob,
│                                        #   downloadBlobObject
├── functions/
│   └── index.js                         # Cloudflare Workers API router
├── migrations/
│   ├── 001_create_projects.sql          # projects + project_data tables
│   └── 002_add_brand_kit.sql            # brand_kit, brief, mood_id columns
├── wrangler.toml                        # Worker name: mood-board, D1 binding
└── .env.local.example                   # Template for local dev secrets
```

---

## Flow Steps

| Step ID | Screen | Description |
|---|---|---|
| `brief` | `BriefScreen` | Enter a 10–200 char project brief |
| `moods` | `MoodsScreen` | 3 Claude-generated mood cards — pick one |
| `typography` | `TypographyScreen` | 5 typography direction cards — pick one |
| `brand-kit` | `BrandKitScreen` | Full brand kit: colors, type, spacing, components |
| `paths` | `PathsScreen` | Multi-select design paths for mockup generation |
| `images` | `ImagesScreen` | Optional Unsplash reference images |
| `mockups` | `MockupsScreen` | Per-section Flux AI image generation |
| `export` | `ExportScreen` | Download Markdown / CSS / JSON / mockup ZIP |

---

## Workers API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/generate-moods` | Brief → 3 MoodOption objects (Claude Haiku + fallback) |
| `POST` | `/api/generate-typography-options` | Mood → 5 TypographyDirection objects (Claude Haiku + fallback) |
| `POST` | `/api/generate-brand-kit` | Mood + typography → BrandKit (Claude Sonnet + fallback) |
| `POST` | `/api/start-mockup` | Section + brand kit → Flux image via Replicate (sync Prefer:wait) |
| `GET` | `/api/mockup-status/:id` | Poll Replicate prediction status |
| `POST` | `/api/analyze-image` | Claude Vision image analysis (used by useClaude hook) |
| `POST` | `/api/projects` | Save project to D1 |
| `GET` | `/api/projects` | List projects by session ID |
| `GET` | `/api/projects/:id` | Load single project |
| `DELETE` | `/api/projects/:id` | Delete project |

All endpoints read `x-session-id` header to scope data per anonymous session.

All AI endpoints have deterministic fallbacks — the app works without any API keys.

---

## State Shape

```typescript
type FlowStep = 'brief' | 'moods' | 'typography' | 'brand-kit' | 'paths' | 'images' | 'mockups' | 'export';

interface AppState {
  step: FlowStep;
  brief: string;
  projectName: string;
  moods: MoodOption[];
  selectedMood: MoodOption | null;
  typographyDirections: TypographyDirection[];
  selectedTypography: TypographyDirection | null;
  brandKit: BrandKit | null;
  selectedPaths: DesignPath[];      // 'website' | 'app' | 'logo' | 'logo-kit' | 'desktop'
  mockupImages: MockupImage[];
  images: UnsplashPhoto[];
  projectId: string | null;
  loading: boolean;
  loadingStep: string | null;
  error: string | null;
}
```

---

## D1 Database Schema

```sql
-- migration 001
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
  palette_colors TEXT,   -- JSON: { primary, secondary, accent }
  sections TEXT,         -- JSON: Section[]
  generated_html TEXT,
  metadata TEXT,         -- JSON: { keywords, presetId, moodName, ... }
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- migration 002
ALTER TABLE project_data ADD COLUMN brand_kit TEXT;   -- JSON: BrandKit
ALTER TABLE project_data ADD COLUMN brief TEXT;
ALTER TABLE project_data ADD COLUMN mood_id TEXT;
```

- Database name: `mood-projects`
- Database ID: `97075942-c155-4a21-a11f-433dbda9d1aa`

---

## Environment Variables & Secrets

### Cloudflare Workers secrets
| Name | Purpose |
|---|---|
| `CLAUDE_API_KEY` | Claude API for mood/typography/brand-kit generation |
| `UNSPLASH_API_KEY` | Unsplash image search (50 req/hr free tier) |
| `REPLICATE_API_TOKEN` | Replicate API for Flux mockup generation |

### Cloudflare Pages environment variables
| Name | Value |
|---|---|
| `VITE_API_BASE` | `https://mood-board.ashwinjyoti.workers.dev` |
| `VITE_ENABLE_FLUX_MOCKUPS` | `true` (omit to disable Flux feature) |

### Local development (`.env.local` — never committed)
```
VITE_API_BASE=http://localhost:8787
```

---

## Design System (App Shell)

### Colours
| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#FAFAF8` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, panels |
| `--color-text` | `#1a1a18` | Body text |
| `--color-muted` | `#8B8B86` | Captions, hints |
| `--color-accent` | `#D4A574` | CTAs, highlights |
| `--color-success` | `#27AE60` | Success states |
| `--color-border` | `#E8E8E5` | Dividers, card borders |

### Typography
- Font: system stack (`system-ui, -apple-system, sans-serif`)
- Display: 2.2rem, weight 300
- Heading: 1.8rem, weight 400
- Body: 1rem, line-height 1.8

### Spacing
- 8px base grid
- Card padding: `2rem`
- Section gap: `3–4rem`
- Border radius: `8px` (sm), `12px` (md)

---

## Session Management

No authentication. Each browser session gets a random UUID stored in `localStorage` under `mb_session_id`. Every API request sends it as `x-session-id`. The Worker scopes all D1 queries to this session ID.

---

## Deployment

- **Frontend**: Cloudflare Pages auto-deploys from `main` — runs `npm run build`, deploys `dist/`
- **Worker**: Cloudflare Workers CI auto-deploys from `main`

### Manual commands
```bash
# Local dev
npm run dev              # Vite frontend at localhost:5173
npm run workers:dev      # Worker at localhost:8787

# Deploy
npm run workers:deploy   # Push Worker to Cloudflare
npm run build            # Build frontend (tsc && vite build)

# Database
wrangler d1 execute mood-projects --file migrations/001_create_projects.sql
wrangler d1 execute mood-projects --file migrations/002_add_brand_kit.sql
```

---

## 12 Design Presets (Fallback Data)

Used as deterministic fallbacks when `CLAUDE_API_KEY` is unavailable.

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

## Remaining Work (Phase 2E)

| Item | Description |
|---|---|
| Flux Kontext Max refinement | Edit individual mockups with text instructions |
| Variation comparison | Generate 3 variants side-by-side for a section |
| Color propagation | Recolor all mockups when palette changes |
