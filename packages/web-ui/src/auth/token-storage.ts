// The ONLY sessionStorage access in the web apps (CLAUDE.md §9; enforced by eslint.config.js):
// the rotating refresh token. sessionStorage is per tab and is cleared when the tab closes. The
// access token never touches any storage.
export const REFRESH_TOKEN_KEY = 'istigaba-refresh';

export function readRefreshToken(): string | null {
  try {
    return window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeRefreshToken(token: string): void {
  try {
    window.sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {
    // Storage unavailable (private mode): the session simply does not survive a reload.
  }
}

export function clearRefreshToken(): void {
  try {
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Nothing stored.
  }
}
