import {describe,it,expect} from 'vitest';
import {coverFraming,coverStyle} from './cover-framing';
describe('cover framing',()=>{
 it('retains safe crop metadata',()=>expect(coverStyle({cover_framing:{x:40,y:18,ratio:'16/9'}},true)).toBe('object-position:40% 18%;aspect-ratio:16/9;object-fit:cover;'));
 it('rejects unsafe CSS and invalid coordinates',()=>expect(coverFraming({x:Infinity,y:-1,ratio:'1;display:none'})).toEqual({x:50,y:50,ratio:'original'}));
 it('keeps existing covers unchanged and card proportions fixed',()=>{expect(coverStyle({})).toBeUndefined();expect(coverStyle({cover_framing:{x:20,y:30,ratio:'1/1'}})).toBe('object-position:20% 30%;');});
});
