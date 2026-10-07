export interface OperationObservation {status:number;duration_ms:number;time:string;failed:boolean}
const day=86400000;
function metrics(rows:OperationObservation[]){
 const durations=rows.map(row=>row.duration_ms).sort((a,b)=>a-b);
 const count=rows.length,failures=rows.filter(row=>row.failed||row.status>=400).length;
 return {count,failures,failure_percent:count?Math.round(failures/count*1000)/10:null,
  median_ms:count?Math.round((durations[Math.floor((count-1)/2)]+durations[Math.floor(count/2)])/2):null,
  p95_ms:count?durations[Math.ceil(count*.95)-1]:null};
}
/** Aggregates only the supplied bounded sample; empty buckets never imply uptime. */
export function operationTrends(input:OperationObservation[],now=Date.now(),receivedCount=input.length){
 const rows=input.filter(row=>Number.isFinite(row.duration_ms)&&row.duration_ms>=0&&row.duration_ms<=120000&&Number.isInteger(row.status)&&row.status>=200&&row.status<=599&&Number.isFinite(Date.parse(row.time))&&Date.parse(row.time)<=now);
 const range=(from:number,to:number)=>rows.filter(row=>{const time=Date.parse(row.time);return time>from&&time<=to;});
 const current=metrics(range(now-day,now)),previous=metrics(range(now-2*day,now-day));
 const buckets=Array.from({length:7},(_,index)=>{const to=now-(6-index)*day,from=to-day;return {from:new Date(from).toISOString(),to:new Date(to).toISOString(),...metrics(range(from,to))};});
 return {sample_count:rows.length,capacity:50,possibly_truncated:receivedCount>=50,
  from:rows.length?new Date(Math.min(...rows.map(row=>Date.parse(row.time)))).toISOString():null,
  to:rows.length?new Date(Math.max(...rows.map(row=>Date.parse(row.time)))).toISOString():null,
  current_24h:current,previous_24h:previous,last_7d:metrics(range(now-7*day,now)),buckets,
  comparison:current.count>=5&&previous.count>=5?{median_delta_ms:current.median_ms!-previous.median_ms!,failure_delta_points:Math.round((current.failure_percent!-previous.failure_percent!)*10)/10}:null};
}
