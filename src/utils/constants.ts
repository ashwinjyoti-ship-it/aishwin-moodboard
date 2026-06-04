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
  'AI & Machine Learning',
  'Web Design & Agencies',
  'Mobile Apps & Product',
  'Finance & Fintech',
  'Real Estate & Property',
  'Legal Services',
  'Sustainability & Green',
  'Gaming & Esports',
  'Beauty & Cosmetics',
  'Entertainment & Media',
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
    'SaaS Platform', 'Developer Tools', 'Web3/Crypto', 'Cybersecurity',
    'Data Analytics', 'DevOps', 'Cloud Infrastructure', 'No-Code Platform',
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
    'Bootcamp', 'Workshop Provider', 'K-12 School', 'Corporate Training',
  ],
  'AI & Machine Learning': [
    'AI Startup', 'Chatbot / Conversational AI', 'Machine Learning Tools', 'Data Science Platform',
    'Computer Vision', 'NLP / LLM Product', 'AI-Powered SaaS', 'Robotics & Automation',
  ],
  'Web Design & Agencies': [
    'UI/UX Agency', 'Branding Studio', 'Digital Agency', 'Web Development Studio',
    'CMS / Website Builder', 'SEO Agency', 'Conversion Rate Agency', 'Motion & Animation Studio',
  ],
  'Mobile Apps & Product': [
    'Consumer App', 'B2B Mobile App', 'Health & Wellness App', 'Productivity App',
    'Social / Community App', 'AR/VR Experience', 'Gaming App', 'Fintech App',
  ],
  'Finance & Fintech': [
    'Neobank / Digital Bank', 'Crypto / Web3 Finance', 'Robo-Advisor / WealthTech',
    'InsurTech', 'Payments Platform', 'Lending Platform', 'RegTech', 'Personal Finance App',
  ],
  'Real Estate & Property': [
    'Luxury Residential', 'Commercial Real Estate', 'Property Management',
    'Interior Design Studio', 'Smart Homes / PropTech', 'Co-working Space',
    'Vacation Rentals', 'Sustainable Architecture',
  ],
  'Legal Services': [
    'Personal Injury Law', 'Family Law', 'Corporate & Business Law',
    'Intellectual Property', 'Immigration Law', 'Criminal Defense',
    'Estate Planning', 'Environmental Law',
  ],
  'Sustainability & Green': [
    'Renewable Energy', 'Eco-Friendly Products', 'Sustainable Fashion',
    'Green Building / Architecture', 'Climate Tech', 'Zero-Waste Brand',
    'Organic Food & Farming', 'Environmental Consulting',
  ],
  'Gaming & Esports': [
    'Esports Team / Organisation', 'Game Development Studio', 'Streaming & Content',
    'Gaming Hardware & Peripherals', 'VR / AR Gaming', 'Gaming Events & Tournaments',
    'Gaming Community / Platform', 'Indie Game Studio',
  ],
  'Beauty & Cosmetics': [
    'Clean Beauty Brand', 'Skincare', 'Haircare', 'Fragrance & Perfume',
    'Nail Art & Nail Care', 'Professional Makeup', 'Vegan & Cruelty-Free Cosmetics',
    'Men\'s Grooming',
  ],
  'Entertainment & Media': [
    'Film & Video Production', 'Music Studio / Label', 'Event Planning & Production',
    'Podcast Studio', 'Photography Studio', 'Theater & Performing Arts',
    'Content Agency', 'Magazine / Media Brand',
  ],
};

export const TOTAL_STEPS = 9;
