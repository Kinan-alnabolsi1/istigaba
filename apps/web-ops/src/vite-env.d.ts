/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_MAP_TILE_URL?: string;
  readonly VITE_MAP_TILE_URL_DARK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
