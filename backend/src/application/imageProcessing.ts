import sharp from 'sharp';
import { ValidationError } from './validator';

/** Content types accepted for progress-photo uploads. */
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ProcessedImage {
  bytes: Buffer;
  contentType: string;
}

/**
 * Validates an uploaded image's type, strips embedded metadata (EXIF/GPS), and
 * re-encodes it to webp so stored files are uniform and privacy-safe (US-026b).
 */
export async function processProgressPhoto(file: {
  mimetype: string;
  buffer: Buffer;
}): Promise<ProcessedImage> {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new ValidationError('Unsupported image type');
  }
  try {
    const bytes = await sharp(file.buffer).rotate().webp({ quality: 82 }).toBuffer();
    return { bytes, contentType: 'image/webp' };
  } catch {
    throw new ValidationError('Invalid image file');
  }
}

export { ALLOWED_MIME_TYPES };
