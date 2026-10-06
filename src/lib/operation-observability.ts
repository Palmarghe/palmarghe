import type {APIContext} from 'astro';
import {createClient} from '@supabase/supabase-js';
import {supabase,localTestRequest} from './supabase';
import {runtimeSecret} from './runtime-secrets';
const samples=new Map<string,number>();
/** Bounded samples contain no form values, titles, paths, tokens or exception messages. */
export async function recordStudioOperation(context:APIContext,response:Response,duration:number){
 try{
  const db=supabase(context.cookies,context.request);if(!db)return;
  const {data:{user}}=await db.auth.getUser();if(!user)return;
  const {data:profile}=await db.from('profiles').select('role').eq('id',user.id).single();if(!['admin','editor'].includes(profile?.role))return;
  const key=user.id+':'+(response.status>=400?'failed':'ok');const now=Date.now();if(now-(samples.get(key)??0)<30000)return;
  if(samples.size>200)for(const [key,time]of samples)if(now-time>60000)samples.delete(key);
  if(samples.size>200)return;samples.set(key,now);
  const client=localTestRequest(context.request)?db:(()=>{const key=runtimeSecret('SUPABASE_SERVICE_ROLE_KEY');return key?createClient(import.meta.env.PUBLIC_SUPABASE_URL,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.timeout(2000)})}}):null;})();
  if(!client)return;
  const {error}=await client.from('audit_logs').insert({actor_id:user.id,action:response.status>=400?'OPERATION_FAILED':'OPERATION_OK',entity:'studio_request',entity_id:JSON.stringify({status:response.status,duration_ms:Math.min(120000,Math.max(0,Math.round(duration))),release:import.meta.env.BUILD_RELEASE??'development'})});
  if(error)console.warn('studio_observation_unavailable');
 }catch{console.warn('studio_observation_unavailable');}
}
