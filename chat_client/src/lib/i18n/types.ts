import type { Translations } from './translations/en';

export type Language = 'en' | 'ru';

// Dotted paths to every string in the dictionary, e.g. 'auth.login.title'
type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = Leaves<Translations>;

export type TranslationParams = Record<string, string | number>;

export type TranslateFn = (key: TranslationKey, params?: TranslationParams) => string;
