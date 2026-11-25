import type { ar } from './locales/ar';

/** Same nested keys as the Arabic source, with string values. */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type LocaleShape = Widen<typeof ar>;
