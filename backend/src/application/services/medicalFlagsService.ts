import { RegionCode } from '../../domain/models/bodyRegions';
import { MedicalRecordRepository } from '../../domain/repositories/MedicalRecordRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ClientNotFoundError } from './clientService';
import { scanRegions } from './medicalRegionDictionary';

/** A scanned free-text field of the medical record that flagged a region. */
export interface MedicalFlagDetail {
  region: RegionCode;
  field: string;
  snippet: string;
}

export interface MedicalFlags {
  regions: RegionCode[];
  details: MedicalFlagDetail[];
}

/** The free-text medical fields scanned for region keywords (US-022). */
const SCANNED_FIELDS = [
  'preexistingConditions',
  'injuries',
  'surgeriesOrProsthetics',
  'physicalRestrictions',
] as const;

/**
 * Derives the body regions flagged by a client's current medical record by
 * matching its free-text fields against the curated keyword dictionary. Advisory
 * only — it makes no clinical judgement (US-022).
 */
export class MedicalFlagsService {
  constructor(
    private readonly medicalRecordRepository: MedicalRecordRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  async getFlags(clientId: number): Promise<MedicalFlags> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundError();
    }

    const record = await this.medicalRecordRepository.findByClientId(clientId);
    if (!record) {
      return { regions: [], details: [] };
    }

    const details: MedicalFlagDetail[] = [];
    const regions = new Set<RegionCode>();
    for (const field of SCANNED_FIELDS) {
      const value = record[field];
      if (!value) continue;
      for (const match of scanRegions(value)) {
        regions.add(match.region);
        details.push({ region: match.region, field, snippet: match.keyword });
      }
    }

    return { regions: [...regions], details };
  }
}
