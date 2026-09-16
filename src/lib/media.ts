export const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
export type ImageMime = 'image/png' | 'image/jpeg' | 'image/webp';
export function detectImage(bytes: Uint8Array): ImageMime | null {
  if (bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((value,index) => bytes[index] === value)) return 'image/png';
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP') return 'image/webp';
  return null;
}
export function validMediaSize(size: number): boolean { return size > 0 && size <= MAX_MEDIA_BYTES; }
