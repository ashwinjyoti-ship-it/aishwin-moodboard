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

export const INDUSTRIES = [
  'Healthcare & Wellness',
  'Tech & SaaS',
  'E-commerce',
  'Creative Services',
  'Hospitality & Travel',
  'Fitness & Sports',
  'Education',
  'Other',
] as const;

export type Industry = typeof INDUSTRIES[number];

export const INDUSTRY_CATEGORIES: Record<string, string[]> = {
  'Healthcare & Wellness': [
    'Yoga Studio', 'Personal Training', 'Physiotherapy', 'Spa & Beauty',
    'Sports Performance', 'Chiropractic', 'Pilates', 'Dance Studio',
    'Holistic Health', 'Corporate Wellness', 'Nutrition & Dietetics', 'Mental Wellness',
  ],
  'Tech & SaaS': [
    'SaaS Platform', 'AI/ML', 'Developer Tools', 'Mobile App',
    'Web3/Crypto', 'Cybersecurity', 'Data Analytics', 'DevOps',
  ],
  'E-commerce': [
    'Fashion', 'Electronics', 'Home & Garden', 'Beauty & Cosmetics',
    'Books & Media', 'Sports & Outdoors', 'Jewelry', 'Food & Beverage',
  ],
  'Creative Services': [
    'Design Agency', 'Marketing Agency', 'Content Creator', 'Photography',
    'Videography', 'Music Production', 'Writing/Publishing', 'Consulting',
  ],
  'Hospitality & Travel': [
    'Hotel/Resort', 'Restaurant', 'Cafe/Bakery', 'Tour Company',
    'Airbnb/Vacation Rental', 'Event Venue', 'Bar/Lounge',
  ],
  'Fitness & Sports': [
    'Gym', 'CrossFit', 'Boxing', 'Swimming',
    'Martial Arts', 'Soccer/Football Club', 'Tennis Court', 'Climbing Gym',
  ],
  'Education': [
    'Online Course', 'Tutoring', 'University', 'Language School',
    'Bootcamp', 'Workshop Provider',
  ],
};

export const TOTAL_STEPS = 9;
