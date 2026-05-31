import { ColorPreset } from '../types';

export const presets: ColorPreset[] = [
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

export function getPresetById(id: string): ColorPreset | undefined {
  return presets.find((p) => p.id === id);
}
