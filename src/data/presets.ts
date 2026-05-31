import { ColorPreset } from '../types';

export const presets: ColorPreset[] = [
  {
    id: 'serene-minimalist',
    name: 'Serene Minimalist',
    description: 'Clean, calm, and breathing. Lots of white space with soft blue accents.',
    audience: 'Yoga, wellness, meditation',
    colors: {
      primary: '#FFFFFF',
      secondary: '#5DADE2',
      accent: '#D4A574',
    },
  },
  {
    id: 'modern-elevated',
    name: 'Modern Elevated',
    description: 'Sophisticated and premium. Warm neutrals with dark typography.',
    audience: 'Premium, luxury, boutique',
    colors: {
      primary: '#F5F3F0',
      secondary: '#1a1a18',
      accent: '#D4A574',
    },
  },
  {
    id: 'bold-energetic',
    name: 'Bold Energetic',
    description: 'High contrast and dynamic. Navy and orange for maximum impact.',
    audience: 'Fitness, sports, tech',
    colors: {
      primary: '#0B3D91',
      secondary: '#FFFFFF',
      accent: '#FF6B35',
    },
  },
];

export function getPresetById(id: string): ColorPreset | undefined {
  return presets.find((p) => p.id === id);
}
