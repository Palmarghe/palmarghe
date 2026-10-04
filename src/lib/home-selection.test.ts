import {test,expect} from 'vitest';
import {homeSelection} from './home-selection';
test('preserves editorial order, excludes hero and spotlight and balances original projects/music',()=>{
 const items=[{id:'a',type:'article'},{id:'b',type:'project'},{id:'c',type:'project'},{id:'d',type:'lab_entry'},{id:'e',type:'article'}];
 const result=homeSelection(items,[items[1],items[4],items[4]],'b','a');
 expect(result.featured.map(e=>e.id)).toEqual(['e','c','d']);expect([...result.reserved]).toEqual(['b','a','e','c','d']);
});
test('small catalog does not introduce duplicate or fake content',()=>{expect(homeSelection([{id:'a',type:'project'}],[],'a').featured).toEqual([]);});
