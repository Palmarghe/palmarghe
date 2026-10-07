import {expect,it} from 'vitest';
import {heroVisual,heroVisualSchema,heroVisualStyle} from './hero-visual';
it('keeps existing artwork intensity and geometry when settings are absent',()=>{
 expect(heroVisual(undefined)).toEqual({ratio:'auto',depth:0,light:0,intensity:100,motion:'none'});
 expect(heroVisualStyle(undefined)).toContain('--hero-intensity:1;--hero-light:0;--hero-depth:0px;--hero-scale:1');
});
it('rejects unbounded or injectable submitted values and safely renders damaged stored settings',()=>{
 for(const value of [{depth:21},{light:-1},{intensity:151},{depth:NaN},{ratio:'16/9;display:none'},{motion:'fast'}]){
  expect(heroVisualSchema.safeParse(value).success).toBe(false);
  expect(heroVisual(value)).toEqual(heroVisual(undefined));
 }
});
it('normalizes valid form strings into finite bounded CSS values',()=>{
 const value={ratio:'balanced',depth:'12',light:'30',intensity:'80',motion:'ambient'};
 expect(heroVisualSchema.parse(value)).toEqual({ratio:'balanced',depth:12,light:30,intensity:80,motion:'ambient'});
 expect(heroVisualStyle(value)).toBe('--hero-intensity:0.8;--hero-light:0.3;--hero-depth:12px;--hero-scale:1.024');
});
