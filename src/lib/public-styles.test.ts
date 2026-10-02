import { describe, expect, it } from 'vitest';
import { publicStyles } from '../../scripts/public-styles.mjs';

describe('public stylesheet isolation', () => {
  it('preserves shared rules, mixed groups and their original cascade order', () => {
    const source = '.button{color:red}.admin-main{padding:1rem}.public,.editor-toolbar{color:blue}.button{color:green}';
    expect(publicStyles(source)).toBe('.button{color:red}.public,.editor-toolbar{color:blue}.button{color:green}');
  });
  it('does not confuse negative or alternative pseudo selectors with Studio scope', () => {
    const source = '.page:not(.admin-main){color:red}:is(.studio-panel,.public){color:blue}.page:has(.editor-toolbar){margin:0}';
    expect(publicStyles(source)).toBe(source);
  });
  it('keeps nested CSS, keyframes and font declarations while filtering media rules', () => {
    const source = '@font-face{font-family:test;src:url(a)}@keyframes fade{from{opacity:0}to{opacity:1}}.public{@media(width>1px){.studio-panel{color:red}}}@media(width<600px){.admin-main{padding:0}.public{padding:1rem}}';
    expect(publicStyles(source)).toBe(source.replace('.admin-main{padding:0}', ''));
  });
  it('removes only top-level positive Studio selectors and leaves unknown selectors', () => {
    expect(publicStyles('body[data-theme="light"] .editor-toolbar button{color:red}#block-editor{padding:0}.new-component{margin:0}')).toBe('.new-component{margin:0}');
  });
});
