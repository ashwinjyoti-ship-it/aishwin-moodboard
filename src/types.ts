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
  id: string;          // uuid or slugified name
  name: string;
  query: string;
  count: number;       // 3–5
  images: UnsplashPhoto[];
  approved: boolean;
}

export interface WizardState {
  projectName: string;
  businessType: string;
  presetId: string;
  accentColor: string;
  primaryColor: string;
  secondaryColor: string;
  keywords: string[];
  inspirationImages: Array<{ type: 'file'; url: string; name: string } | { type: 'url'; url: string }>;
  sections: Section[];
  imageSelections: Record<string, number>; // kept for backwards compat
}
