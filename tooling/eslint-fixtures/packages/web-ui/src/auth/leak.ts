// VIOLATION (S1): web-ui code outside auth/token-storage.ts must not touch sessionStorage
export const leak = (token: string) => window.sessionStorage.setItem('istigaba-refresh', token);
