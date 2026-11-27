// OK (S1): the one owner of the refresh token
export const keep = (token: string) => window.sessionStorage.setItem('istigaba-refresh', token);
