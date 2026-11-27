// VIOLATION (S1): apps no longer touch sessionStorage; the refresh token lives in @istigaba/web-ui/auth
export const keep = (token: string) => sessionStorage.setItem('istigaba-refresh', token);
