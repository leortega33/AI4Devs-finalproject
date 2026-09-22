export interface ProgressPhotoProps {
  id?: number;
  progressEntryId: number;
  storageKey: string;
  contentType: string;
  createdAt?: Date;
}

/** A single photo attached to a progress entry (see US-026b). */
export class ProgressPhoto {
  readonly id?: number;
  readonly progressEntryId: number;
  readonly storageKey: string;
  readonly contentType: string;
  readonly createdAt?: Date;

  constructor(props: ProgressPhotoProps) {
    this.id = props.id;
    this.progressEntryId = props.progressEntryId;
    this.storageKey = props.storageKey;
    this.contentType = props.contentType;
    this.createdAt = props.createdAt;
  }
}
