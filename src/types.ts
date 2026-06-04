// ---- Shared types (used by both old and new flows) ----

export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  audience: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export type SectionId =
  | 'hero' | 'about' | 'services' | 'testimonials'
  | 'gallery' | 'team' | 'contact' | 'pricing';

export interface UnsplashPhoto {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  unsplashUrl: string;
  placeholder?: boolean;
}

export interface Section {
  id: string;
  name: string;
  query: string;
  count: number;
  images: UnsplashPhoto[];
  approved: boolean;
}

// ---- New direct-flow types ----

export interface MoodOption {
  id: string;
  name: string;
  description: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  keywords: string[];
  sections: string[];
  presetId?: string;
}

export interface ColorSystem {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface TypographySystem {
  headingFont: string;
  bodyFont: string;
  headingWeight: number;
  bodyWeight: number;
  scaleRatio: number;
  baseSizePx: number;
  lineHeightBody: number;
  lineHeightHeading: number;
  letterSpacingHeading: string;
}

export interface SpacingSystem {
  baseUnit: number;
  scale: number[];
  containerMaxWidth: number;
  cardPadding: string;
  sectionGap: string;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

export interface ComponentGuidance {
  name: string;
  description: string;
  cssExample: string;
}

export interface BrandKit {
  colors: ColorSystem;
  typography: TypographySystem;
  spacing: SpacingSystem;
  components: ComponentGuidance[];
  layoutRules: string[];
  moodName: string;
  brief: string;
  generatedAt: string;
}

export type FlowStep = 'brief' | 'moods' | 'brand-kit' | 'images' | 'mockups' | 'export';

export interface AppState {
  step: FlowStep;
  brief: string;
  projectName: string;
  moods: MoodOption[];
  selectedMood: MoodOption | null;
  brandKit: BrandKit | null;
  images: UnsplashPhoto[];
  projectId: string | null;
  loading: boolean;
  loadingStep: string | null;
  error: string | null;
}

export type AppAction =
  | { type: 'SET_BRIEF'; brief: string }
  | { type: 'SET_PROJECT_NAME'; name: string }
  | { type: 'SET_MOODS'; moods: MoodOption[] }
  | { type: 'SELECT_MOOD'; mood: MoodOption }
  | { type: 'SET_BRAND_KIT'; brandKit: BrandKit }
  | { type: 'PATCH_BRAND_KIT'; patch: Partial<BrandKit> }
  | { type: 'SET_IMAGES'; images: UnsplashPhoto[] }
  | { type: 'SET_PROJECT_ID'; projectId: string }
  | { type: 'SET_FLOW_STEP'; step: FlowStep }
  | { type: 'SET_LOADING'; loading: boolean; loadingStep?: string }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET' };

// ---- @deprecated: kept for rollback safety ----
export interface WizardState {
  projectName: string;
  industry: string;
  businessTypes: string[];
  presetId: string;
  accentColor: string;
  primaryColor: string;
  secondaryColor: string;
  keywords: string[];
  inspirationImages: Array<{ type: 'file'; url: string; name: string } | { type: 'url'; url: string }>;
  sections: Section[];
  imageSelections: Record<string, number>;
}
