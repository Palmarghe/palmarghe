import {describe,it,expect} from 'vitest';
import {mediaRenditionSrcSet,renditionWidths,requestedRendition,validRendition} from './media-renditions';
const id='11111111-1111-4111-8111-111111111111',job='22222222-2222-4222-8222-222222222222';
const row={media_id:id,width:320,height:489,bytes:12000,path:`renditions/${id}/${job}/320.webp`};
describe('original-bound responsive descriptors',()=>{
 it('only downsizes and validates exact protected paths',()=>{
  expect(renditionWidths(655)).toEqual([320,640]);expect(renditionWidths(300)).toEqual([]);
  expect(validRendition(row)).toBe(true);expect(validRendition({...row,path:'original.png'})).toBe(false);
  expect(validRendition({...row,path:`renditions/${job}/${job}/320.webp`})).toBe(false);
 });
 it('does not advertise missing, foreign or unmeasured files',()=>{
  const original=`/api/media/${id}/`;
  expect(mediaRenditionSrcSet(original,[row],{width:655})).toBe(`${original}?w=320 320w, ${original} 655w`);
  expect(mediaRenditionSrcSet(original,[])).toBeUndefined();
  expect(mediaRenditionSrcSet(`https://evil.test${original}`,[row])).toBeUndefined();
  expect(mediaRenditionSrcSet(original+'?private=1',[row])).toBeUndefined();
  expect(mediaRenditionSrcSet(original,[{...row,media_id:job}])).toBeUndefined();
  expect(mediaRenditionSrcSet(original,[row],{width:200})).toBeUndefined();
 });
 it('rejects unbounded transform parameters instead of decoding or allocating on reads',()=>{
  expect(requestedRendition(null)).toBeNull();expect(requestedRendition('640')).toBe(640);
  for(const value of ['4096','-320','320px','Infinity','640.0',''])expect(requestedRendition(value)).toBeNaN();
 });
});
