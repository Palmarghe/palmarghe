import {describe,it,expect} from 'vitest';
import {siteClock} from './site-clock';
describe('site clock',()=>{
 it('uses Istanbul midnight rather than server timezone',()=>{
  expect(siteClock(new Date('2026-10-09T21:00:00Z'),'tr')).toEqual({date:'10 Ekim 2026',time:'00:00',iso:'2026-10-09T21:00:00.000Z'});
 });
 it('localizes the date and keeps a 24 hour clock',()=>{
  expect(siteClock(new Date('2026-10-09T12:05:00Z'),'en')).toEqual({date:'9 October 2026',time:'15:05',iso:'2026-10-09T12:05:00.000Z'});
 });
});
