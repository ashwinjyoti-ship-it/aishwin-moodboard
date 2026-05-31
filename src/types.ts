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
  | 'hero'
  | 'about'
  | 'services'
  | 'testimonials'
  | 'gallery'
  | 'team'
  | 'contact'
  | 'pricing';

export interface WizardState {
  projectName: string;
  businessType: string;
  presetId: string;
  accentColor: string;
  keywords: string[];
  sections: SectionId[];
  imageSelections: Record<SectionId, number>;
}
