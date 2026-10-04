import { describe, expect, it } from 'vitest';
import { categoryPath, categoryDescendantIds, indexableContentPath, pageDescription, sitemapXml } from './seo';

describe('public SEO boundaries', () => {
  it('includes grandchildren, excludes unrelated categories and terminates cycles', () => {
    const tree = [{id:'root',slug:'gaming',parent_id:null},{id:'child',slug:'minecraft',parent_id:'root'},{id:'nested',slug:'tools',parent_id:'child'},{id:'other',slug:'music',parent_id:null}];
    expect(categoryDescendantIds('root',tree)).toEqual(['root','child','nested']);
    expect(categoryDescendantIds('root',[...tree,{id:'root',slug:'gaming',parent_id:'nested'}])).toEqual(['root','child','nested']);
  });
  it('resolves nested categories and rejects missing ancestors and cycles', () => {
    const root = { id:'1', slug:'fm', parent_id:null };
    const child = { id:'2', slug:'fm26', parent_id:'1' };
    const leaf = { id:'3', slug:'tactics', parent_id:'2' };
    expect(categoryPath(leaf,[root,child,leaf])).toBe('fm/fm26/tactics');
    expect(categoryPath(leaf,[leaf])).toBeUndefined();
    expect(categoryPath(child,[{...root,parent_id:'2'},child])).toBeUndefined();
  });
  it('includes only the published URL when it is indexable and canonical', () => {
    const item = {locale:'tr' as const,slug:'music/test'};
    expect(indexableContentPath(item)).toBe('/music/test/');
    expect(indexableContentPath({...item,indexable:false})).toBeUndefined();
    expect(indexableContentPath({...item,canonical_override:'https://example.com/original/'})).toBeUndefined();
    expect(indexableContentPath({...item,canonical_override:'https://palmarghe.com/music/test/'})).toBe('/music/test/');
  });
  it('deduplicates and XML-escapes sitemap locations', () => {
    const xml = sitemapXml(['/music/','/music/','/example/?a=1&b=2']);
    expect(xml.match(/<loc>/g)).toHaveLength(2);
    expect(xml).toContain('a=1&amp;b=2');
  });
  it('provides localized page-specific descriptions without replacing editorial metadata', () => {
    expect(pageDescription('tr','archive')).toContain('arşivi');
    expect(pageDescription('en','archive')).toContain('archive');
    expect(pageDescription('tr','contact')).not.toBe(pageDescription('tr','archive'));
    expect(pageDescription('en','music','Music')).toContain('Music');
  });
});
