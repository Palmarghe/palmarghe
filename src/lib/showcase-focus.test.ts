import {test,expect} from 'vitest';
import {showcaseFocus} from './showcase-focus';
test('legacy directions and precise focus are compatible',()=>{expect(showcaseFocus({position:'right'})).toEqual({x:100,y:50});expect(showcaseFocus({position:'top',x:24,y:73})).toEqual({x:24,y:73});});
test('unsafe or malformed focus cannot enter inline style',()=>{expect(showcaseFocus({x:NaN,y:'0; color:red'})).toEqual({x:50,y:50});expect(showcaseFocus({x:101,y:-1,position:'bottom'})).toEqual({x:50,y:100});});
