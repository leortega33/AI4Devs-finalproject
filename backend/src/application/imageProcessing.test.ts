import sharp from 'sharp';
import { processProgressPhoto } from './imageProcessing';
import { ValidationError } from './validator';

async function makePng(): Promise<Buffer> {
  return sharp({ create: { width: 8, height: 8, channels: 3, background: { r: 10, g: 20, b: 30 } } })
    .png()
    .toBuffer();
}

describe('processProgressPhoto', () => {
  it('re-encodes an allowed image to webp', async () => {
    const png = await makePng();
    const result = await processProgressPhoto({ mimetype: 'image/png', buffer: png });
    expect(result.contentType).toBe('image/webp');
    const meta = await sharp(result.bytes).metadata();
    expect(meta.format).toBe('webp');
  });

  it('rejects an unsupported type', async () => {
    await expect(
      processProgressPhoto({ mimetype: 'image/gif', buffer: Buffer.from('x') }),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects bytes that are not a decodable image', async () => {
    await expect(
      processProgressPhoto({ mimetype: 'image/png', buffer: Buffer.from('not-an-image') }),
    ).rejects.toThrow(ValidationError);
  });
});
