// FLUX_MOCKUPS: enabled by default since REPLICATE_API_TOKEN is configured in CF Workers secrets.
// Set VITE_ENABLE_FLUX_MOCKUPS=false to disable in specific environments.
export const FEATURE_FLAGS = {
  FLUX_MOCKUPS: import.meta.env.VITE_ENABLE_FLUX_MOCKUPS !== 'false',
} as const;
