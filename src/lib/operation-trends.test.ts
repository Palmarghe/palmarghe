import {describe,it,expect} from 'vitest';
import {operationTrends,type OperationObservation} from './operation-trends';
const now=Date.parse('2026-10-07T12:00:00Z'),hour=3600000;
const row=(duration_ms:number,hours:number,status=303):OperationObservation=>({duration_ms,time:new Date(now-hours*hour).toISOString(),status,failed:status>=400});
describe('bounded sampled operation trends',()=>{
 it('does not invent zero latency, uptime or comparison for missing measurements',()=>{const data=operationTrends([],now);expect(data.current_24h).toEqual({count:0,failures:0,failure_percent:null,median_ms:null,p95_ms:null});expect(data.comparison).toBeNull();expect(data.from).toBeNull();expect(data.buckets).toHaveLength(7);});
 it('uses exact rolling boundaries, median and nearest-rank p95',()=>{const data=operationTrends([row(100,1),row(300,2,400),row(500,24),row(900,48),row(2000,168)],now);expect(data.current_24h).toEqual({count:2,failures:1,failure_percent:50,median_ms:200,p95_ms:300});expect(data.previous_24h.count).toBe(1);expect(data.last_7d.count).toBe(4);expect(data.buckets.reduce((n,b)=>n+b.count,0)).toBe(4);expect(data.comparison).toBeNull();});
 it('filters malformed/future measurements and exposes possible capacity truncation',()=>{const data=operationTrends([...Array.from({length:50},(_,i)=>row(i,1)),row(NaN,1),row(-1,1),row(1,-1),{...row(1,1),time:'invalid'},row(1,1,199)],now);expect(data.sample_count).toBe(50);expect(data.possibly_truncated).toBe(true);expect(data.current_24h.median_ms).toBe(25);expect(data.current_24h.p95_ms).toBe(47);});
 it('reports signed sample deltas only with enough observations in both windows',()=>{const data=operationTrends([...Array.from({length:5},()=>row(100,1)),...Array.from({length:5},()=>row(200,25,400))],now);expect(data.comparison).toEqual({median_delta_ms:-100,failure_delta_points:-100});});
 it('keeps the capacity warning when malformed persisted rows were discarded before aggregation',()=>{const data=operationTrends([row(100,1)],now,50);expect(data.sample_count).toBe(1);expect(data.possibly_truncated).toBe(true);});
});
