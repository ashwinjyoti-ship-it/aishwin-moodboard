/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_UNSPLASH_API_KEY: string;
  readonly VITE_CLAUDE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
