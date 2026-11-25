// VIOLATION: localStorage outside the theme/language stores
export const save = (token: string) => localStorage.setItem('token', token);
