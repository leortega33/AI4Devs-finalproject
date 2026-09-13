import type { TFunction } from 'i18next';

/** Maps a backend error `code` (or axios error) to a localized message. */
export function localizeApiError(error: unknown, t: TFunction): string {
  const code = (error as { response?: { data?: { error?: { code?: string } } } }).response?.data
    ?.error?.code;
  const key = code ? `errors.${code}` : 'errors.GENERIC';
  const message = t(key);
  // If the key is unknown, i18next returns the key itself -> fall back to generic.
  return message === key ? t('errors.GENERIC') : message;
}
