import { describe, expect, it } from 'vitest';
import { slugFromTitle } from './slug';

describe('slugFromTitle', () => {
  it('transliterates Turkish letters and collapses punctuation', () => {
    expect(slugFromTitle('İçerik: Çığ, ŞÜPHE ve Öykü!')).toBe('icerik-cig-suphe-ve-oyku');
  });
  it('keeps a valid ASCII slug', () => {
    expect(slugFromTitle('FM26 Tactics / v2')).toBe('fm26-tactics-v2');
  });
});
