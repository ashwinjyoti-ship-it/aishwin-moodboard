export const DESIGN_TOKENS = {
  colors: {
    bg: '#FAFAF8',
    surface: '#FFFFFF',
    text: '#1a1a18',
    muted: '#8B8B86',
    accent: '#D4A574',
    support: '#5DADE2',
    success: '#27AE60',
    border: '#E8E8E5',
  },
  spacing: {
    card: '2rem',
    section: '4rem',
    radius: '8px',
    radiusMd: '12px',
  },
} as const;

export const CATEGORIES = [
  'Yoga Studio', 'Personal Training', 'Physiotherapy',
  'Nutrition & Dietetics', 'Mental Wellness', 'Spa & Beauty',
  'Sports Performance', 'Chiropractic', 'Pilates', 'Dance Studio',
  'Holistic Health', 'Corporate Wellness',
] as const;

export const TOTAL_STEPS = 9;
