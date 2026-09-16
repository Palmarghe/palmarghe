import { describe, expect, it } from 'vitest';
import { detectImage, validMediaSize } from './media';
describe('media validation', () => {
  it('accepts PNG signature', () => expect(detectImage(new Uint8Array([137,80,78,71,13,10,26,10]))).toBe('image/png'));
  it('rejects extension spoofing bytes', () => expect(detectImage(new TextEncoder().encode('<svg onload="alert(1)">'))).toBeNull());
  it('limits upload size', () => { expect(validMediaSize(0)).toBe(false); expect(validMediaSize(10*1024*1024+1)).toBe(false); });
});
