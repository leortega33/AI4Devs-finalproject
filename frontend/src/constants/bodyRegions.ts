/** Controlled vocabulary of exercise body-region codes (US-022), mirrored from the backend. */
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
