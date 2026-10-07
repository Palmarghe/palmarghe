import type {APIRoute} from 'astro';
import {supabase} from '../../lib/supabase';
import {operationTrends} from '../../lib/operation-trends';
export const GET:APIRoute=async({request,cookies})=>{
 const headers={'cache-control':'private, no-store'};const db=supabase(cookies,request);if(!db)return Response.json({error:'unavailable'},{status:503,headers});
 const {data:{user}}=await db.auth.getUser();if(!user)return Response.json({error:'unauthorized'},{status:401,headers});
 const {data:profile}=await db.from('profiles').select('role').eq('id',user.id).single();if(profile?.role!=='admin')return Response.json({error:'forbidden'},{status:403,headers});
 const start=performance.now();const settings=await db.from('site_settings').select('key').limit(1);const databaseMs=Math.round(performance.now()-start);
 const media=await db.from('media').select('id').order('created_at',{ascending:false}).limit(1);
 const audit=await db.from('audit_logs').select('action,entity_id,created_at').eq('entity','studio_request').order('created_at',{ascending:false}).limit(50);
 const observations=(audit.data??[]).flatMap((row: {entity_id: string | null; created_at: string; action: string})=>{try{const data=JSON.parse(row.entity_id??'');return Number.isFinite(data.duration_ms)&&data.duration_ms>=0&&Number.isInteger(data.status)&&data.status>=200&&data.status<=599?[{status:data.status,duration_ms:data.duration_ms,time:row.created_at,failed:row.action==='OPERATION_FAILED'}]:[];}catch{return [];}});
 const checked=Date.now();
 return Response.json({checked_at:new Date(checked).toISOString(),release:import.meta.env.BUILD_RELEASE??'development',built_at:import.meta.env.BUILD_TIME??null,services:{auth:'ok',database:settings.error?'unavailable':'ok',media_catalog:media.error?'unavailable':'ok'},database_ms:settings.error?null:databaseMs,observations,observations_available:!audit.error,trends:audit.error?null:operationTrends(observations,checked,audit.data?.length??0),note:'Son 50 örneklenmiş Studio isteği; en fazla kullanıcı/durum başına 30 saniyede bir. Genel ziyaretçi veya field Core Web Vitals ölçümü değildir.'},{headers});
};
