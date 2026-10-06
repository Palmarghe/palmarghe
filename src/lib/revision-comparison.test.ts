import {describe,it,expect} from 'vitest';
import {compareRevision,documentText} from './revision-comparison';
describe('revision comparison',()=>{
 it('extracts nested document text without treating markup as trusted HTML',()=>{
  expect(documentText(JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{text:'<script>alert(1)</script>'}]}]}))).toBe('<script>alert(1)</script>');
 });
 it('detects formatting and status changes even when text stays equal',()=>{
  const body={type:'doc',content:[{text:'same'}]};
  const result=compareRevision({body,status:'draft'},{body:{type:'doc',content:[{text:'same',marks:[{type:'bold'}]}]},status:'published'});
  expect(result.filter(item=>item.changed).map(item=>item.label)).toEqual(['Metin','Yayın durumu']);
 });
 it('ignores object key order but preserves gallery ordering',()=>{
  expect(compareRevision({type_data:{a:1,b:2}},{type_data:{b:2,a:1}}).some(item=>item.changed)).toBe(false);
  expect(compareRevision({type_data:{gallery:['a','b']}},{type_data:{gallery:['b','a']}}).at(-1)?.changed).toBe(true);
 });
});
