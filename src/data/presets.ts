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
  // Expanded presets — diverse aesthetics
  { id: 'cyberpunk-neon', name: 'Cyberpunk Neon', description: 'High-contrast sci-fi with electric neon on near-black; futuristic and tech-forward', audience: 'Tech startups, gaming, AI, digital agencies', colors: { primary: '#0D0D0D', secondary: '#00FF9F', accent: '#FF006E' } },
  { id: 'dark-academia', name: 'Dark Academia', description: 'Scholarly jewel tones with warm parchment; intellectual, timeless, heritage', audience: 'Law firms, education, publishing, luxury brands', colors: { primary: '#2A2118', secondary: '#C9B99A', accent: '#D4AF37' } },
  { id: 'retro-70s', name: 'Retro 70s Groovy', description: 'Earthy warm tones with harvest gold; nostalgic, vibrant, full of character', audience: 'Vintage brands, lifestyle, music venues, food & beverage', colors: { primary: '#FFF3E0', secondary: '#CC5500', accent: '#DA9100' } },
  { id: 'brutalist-minimal', name: 'Brutalist Minimal', description: 'Stark monochrome with raw contrast; bold, industrial, uncompromising', audience: 'Architecture firms, design studios, contemporary art', colors: { primary: '#F5F5F5', secondary: '#1A1A1A', accent: '#808080' } },
  { id: 'pastel-dream', name: 'Pastel Dream', description: 'Soft dreamy pastels with gentle playfulness; approachable, whimsical, joyful', audience: 'Wellness brands, beauty, kids/family, lifestyle apps', colors: { primary: '#FEF0F5', secondary: '#C084B0', accent: '#A8D8EA' } },
  { id: 'coastal-ocean', name: 'Coastal Ocean', description: 'Serene blues and teals with sandy warmth; calm, refreshing, escape-focused', audience: 'Hospitality, travel, luxury resorts, beachwear', colors: { primary: '#F0F8FF', secondary: '#186690', accent: '#F29F5A' } },
  { id: 'midnight-luxury', name: 'Midnight Luxury', description: 'Deep midnight tones with rose-gold accents; exclusive, opulent, premium', audience: 'Luxury fashion, wealth management, fine dining, exclusive clubs', colors: { primary: '#0F1419', secondary: '#C0A080', accent: '#8B6914' } },
  { id: 'arctic-frost', name: 'Arctic Frost', description: 'Cool icy whites with clear blue and silver; fresh, clean, precise', audience: 'Healthcare, fintech, modern tech, digital platforms', colors: { primary: '#F0F8FF', secondary: '#2E6DA4', accent: '#C0C0C0' } },
  { id: 'desert-sand', name: 'Desert Sand', description: 'Warm earth tones and terracotta neutrals; organic, grounded, timeless', audience: 'Real estate, architecture, sustainable brands, wellness retreats', colors: { primary: '#FAF0E6', secondary: '#8B6F47', accent: '#C4932A' } },
  { id: 'urban-concrete', name: 'Urban Concrete', description: 'Industrial greys with a bold red flash; edgy, contemporary, street-smart', audience: 'Design agencies, urban real estate, creative studios', colors: { primary: '#EBEBEB', secondary: '#36454F', accent: '#E63946' } },
  { id: 'botanical-garden', name: 'Botanical Garden', description: 'Rich forest greens with earthy tan; organic, growth-focused, sustainable', audience: 'Eco brands, organic products, sustainable fashion, green tech', colors: { primary: '#F1F8E9', secondary: '#2D5016', accent: '#8BC34A' } },
  { id: 'electric-pop', name: 'Electric Pop', description: 'Deep dark base with neon hot-pink and electric cyan; bold, youthful, loud', audience: 'Gaming, entertainment, youth brands, music, festivals', colors: { primary: '#1A0A2E', secondary: '#FF0099', accent: '#00D4FF' } },
];

export function getPresetById(id: string): ColorPreset | undefined {
  return presets.find((p) => p.id === id);
}
