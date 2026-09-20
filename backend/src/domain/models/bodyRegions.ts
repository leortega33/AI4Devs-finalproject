/**
 * Controlled vocabulary of body-region codes an exercise can load (US-022).
 * Codes are stable and stored as-is; labels are localized in the frontend.
 */
export const REGION_CODES = [
  'neck',
  'shoulder',
  'elbow',
  'wrist',
  'upper_back',
  'lower_back',
  'hip',
  'knee',
  'ankle',
  'core',
  'cardio_respiratory',
] as const;

export type RegionCode = (typeof REGION_CODES)[number];

export function isRegionCode(value: unknown): value is RegionCode {
  return typeof value === 'string' && (REGION_CODES as readonly string[]).includes(value);
}
