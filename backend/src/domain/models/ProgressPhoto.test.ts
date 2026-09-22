import { ProgressPhoto } from './ProgressPhoto';

describe('ProgressPhoto', () => {
  it('builds from props', () => {
    const now = new Date();
    const photo = new ProgressPhoto({
      id: 1,
      progressEntryId: 7,
      storageKey: 'abc.webp',
      contentType: 'image/webp',
      createdAt: now,
    });
    expect(photo.id).toBe(1);
    expect(photo.progressEntryId).toBe(7);
    expect(photo.storageKey).toBe('abc.webp');
    expect(photo.contentType).toBe('image/webp');
    expect(photo.createdAt).toBe(now);
  });

  it('allows an unsaved photo without id/createdAt', () => {
    const photo = new ProgressPhoto({
      progressEntryId: 3,
      storageKey: 'x.webp',
      contentType: 'image/webp',
    });
    expect(photo.id).toBeUndefined();
    expect(photo.createdAt).toBeUndefined();
  });
});
