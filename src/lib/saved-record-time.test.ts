import {describe,it,expect,vi,afterEach} from 'vitest';
import {savedRecordTime} from './saved-record-time';
afterEach(()=>vi.useRealTimers());
describe('persisted save timestamp',()=>{
 it.each([undefined,null,'','not a date','2026-10-07','<script>','2040-99-99T99:99:99Z'])('never invents a timestamp for missing or malformed metadata %s',value=>expect(savedRecordTime(value)).toBeNull());
 it('normalizes actual Postgres timezone/microsecond metadata and identifies Turkey time',()=>{const result=savedRecordTime('2026-10-07T06:15:53.138564+00:00');expect(result?.iso).toBe('2026-10-07T06:15:53.138Z');expect(result?.text).toContain('07.10.2026');expect(result?.text).toContain('09:15:53');});
 it('represents the same persisted instant consistently across timestamp offsets',()=>expect(savedRecordTime('2026-10-07T09:15:53+03:00')).toEqual(savedRecordTime('2026-10-07T06:15:53Z')));
 it('does not replace the persisted time when the current clock is wrong',()=>{vi.useFakeTimers();vi.setSystemTime(new Date('2040-01-01T00:00:00Z'));expect(savedRecordTime('2026-10-07T06:15:53Z')?.text).toContain('2026');expect(savedRecordTime(undefined)).toBeNull();});
});
