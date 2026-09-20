import { RegionCode } from '../../domain/models/bodyRegions';

/**
 * Curated dictionary mapping body regions to normalized keywords (es/en) found
 * in a client's free-text medical record (US-022). Keywords are lowercased and
 * accent-stripped; matching is advisory (region overlap), never diagnostic.
 * Extend by adding keywords here.
 */
export const medicalRegionDictionary: Record<RegionCode, string[]> = {
  neck: ['cuello', 'cervical', 'cervicales', 'neck'],
  shoulder: ['hombro', 'manguito rotador', 'deltoides', 'shoulder', 'rotator cuff'],
  elbow: ['codo', 'epicondilitis', 'elbow', 'tennis elbow'],
  wrist: ['muneca', 'tunel carpiano', 'carpiano', 'wrist', 'carpal tunnel'],
  upper_back: ['espalda alta', 'dorsal', 'toracica', 'upper back', 'thoracic'],
  lower_back: [
    'lumbar',
    'espalda baja',
    'hernia de disco',
    'ciatica',
    'lumbago',
    'lower back',
    'sciatica',
    'herniated disc',
  ],
  hip: ['cadera', 'hip'],
  knee: ['rodilla', 'menisco', 'ligamento cruzado', 'lca', 'rotula', 'knee', 'meniscus', 'acl', 'patella'],
  ankle: ['tobillo', 'esguince', 'ankle', 'sprain'],
  core: ['abdominal', 'abdomen', 'core', 'diastasis'],
  cardio_respiratory: [
    'asma',
    'hipertension',
    'cardiaco',
    'corazon',
    'respiratorio',
    'asthma',
    'hypertension',
    'cardiac',
    'heart',
  ],
};

/** Lowercases and strips diacritics for accent-insensitive matching. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Escapes a keyword for safe use inside a RegExp. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface RegionMatch {
  region: RegionCode;
  keyword: string;
}

/**
 * Scans normalized `text` and returns the regions whose keywords appear, on a
 * word-boundary basis, with the matched keyword for transparency.
 */
export function scanRegions(text: string): RegionMatch[] {
  const normalized = normalize(text);
  const matches: RegionMatch[] = [];
  for (const region of Object.keys(medicalRegionDictionary) as RegionCode[]) {
    for (const keyword of medicalRegionDictionary[region]) {
      const pattern = new RegExp(`\\b${escapeRegExp(keyword)}\\b`);
      if (pattern.test(normalized)) {
        matches.push({ region, keyword });
        break; // one match per region is enough
      }
    }
  }
  return matches;
}
