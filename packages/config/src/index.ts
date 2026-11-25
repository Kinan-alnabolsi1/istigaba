// Explicit .ts extensions: this entry is also loaded by Node's native type stripping
// (e.g. from apps' vite.config.ts via @istigaba/web-ui/vite), which requires them.
export * from './tokens.ts';
export { LANGUAGE_STORAGE_KEY } from './storage-keys.ts';
