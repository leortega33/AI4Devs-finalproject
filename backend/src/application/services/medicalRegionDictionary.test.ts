import { scanRegions, normalize } from './medicalRegionDictionary';

describe('normalize', () => {
  it('lowercases and strips diacritics', () => {
    expect(normalize('Rodílla CERVICAL')).toBe('rodilla cervical');
  });
});

describe('scanRegions', () => {
  it('flags a single region from a keyword', () => {
    const result = scanRegions('Lesión de rodilla');
    expect(result.map((m) => m.region)).toEqual(['knee']);
  });

  it('flags multiple regions', () => {
    const result = scanRegions('Dolor lumbar y de hombro');
    const regions = result.map((m) => m.region).sort();
    expect(regions).toEqual(['lower_back', 'shoulder']);
  });

  it('matches case- and accent-insensitively', () => {
    expect(scanRegions('RODILLA').map((m) => m.region)).toEqual(['knee']);
    expect(scanRegions('rodîlla').map((m) => m.region)).toEqual(['knee']);
  });

  it('matches a multi-word keyword', () => {
    expect(scanRegions('Diagnóstico: túnel carpiano').map((m) => m.region)).toEqual(['wrist']);
  });

  it('does not match a keyword inside an unrelated word', () => {
    // "corazon" (heart) must not match inside "corazonada"
    expect(scanRegions('una corazonada')).toEqual([]);
  });

  it('returns no matches for unrelated text', () => {
    expect(scanRegions('Sin antecedentes relevantes')).toEqual([]);
  });

  it('records the matched keyword for transparency', () => {
    const result = scanRegions('menisco operado');
    expect(result[0]).toEqual({ region: 'knee', keyword: 'menisco' });
  });
});
