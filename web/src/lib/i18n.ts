export const LOCALE_COOKIE = 'cooldown_locale';

export type Locale = 'es' | 'en';

export const DEFAULT_LOCALE: Locale = 'es';

export function isLocale(value: unknown): value is Locale {
  return value === 'es' || value === 'en';
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function localeToOpenGraph(locale: Locale): string {
  return locale === 'en' ? 'en_US' : 'es_ES';
}

export function localeName(locale: Locale): string {
  return locale === 'en' ? 'English' : 'Español';
}
