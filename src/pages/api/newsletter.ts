import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { localTestRequest, supabase } from '../../lib/supabase';
import { sameOrigin, errorResponse } from '../../lib/security';
import { localAuthAllowed } from '../../lib/local-adapter';
import { runtimeSecret } from '../../lib/runtime-secrets';
const inputSchema=z.object({email:z.email().max(254),locale:z.enum(['tr','en']),consent:z.literal('on')});

async function hashRateKey(pepper:string, identity:string) {
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${pepper}:${identity}`));
  return Array.from(new Uint8Array(digest)).map((byte)=>byte.toString(16).padStart(2,'0')).join('');
}

export const POST: APIRoute=async({request,cookies})=>{
  if(!sameOrigin(request))return errorResponse('Invalid origin',403);
  const form=await request.formData();
  const locale=form.get('locale') === 'en' ? 'en' : 'tr';
  const done=()=>Response.redirect(new URL(`/${locale==='en'?'en/':''}?newsletter=1`,request.url),303);
  // Silently accept bot traps without ever storing their submitted address.
  if(form.get('website')) return done();
  const input=inputSchema.safeParse({email:String(form.get('email')??'').trim().toLowerCase(),locale,consent:form.get('consent')});
  if(!input.success)return errorResponse('Invalid email',400);
  const ip=request.headers.get('cf-connecting-ip') ?? 'unknown';
  if(localTestRequest(request)) {
    const db=supabase(cookies,request);if(!db)return errorResponse('Service unavailable',503);
    if(!localAuthAllowed(`${ip}:newsletter`,5)) return errorResponse('Rate limit exceeded',429);
    const {error}=await db.rpc('subscribe_newsletter',{p_email:input.data.email,p_locale:input.data.locale,p_source:'site'});
    if(error)return errorResponse('Subscription unavailable',503);
    return done();
  }
  const url=import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey=runtimeSecret('SUPABASE_SERVICE_ROLE_KEY');
  const pepper=runtimeSecret('CONTACT_RATE_PEPPER');
  if(!url || !serviceKey || !pepper)return errorResponse('Service unavailable',503);
  const service=createClient(url,serviceKey,{auth:{persistSession:false}});
  const p_key_hash=await hashRateKey(pepper,`${ip}:newsletter`);
  const {data:allowed,error:rateError}=await service.rpc('allow_auth_attempt',{p_key_hash,p_max:5,p_window_seconds:900});
  if(rateError)return errorResponse('Service unavailable',503);
  if(!allowed)return errorResponse('Rate limit exceeded',429);
  const {error}=await service.rpc('subscribe_newsletter',{p_email:input.data.email,p_locale:input.data.locale,p_source:'site'});
  if(error)return errorResponse('Subscription unavailable',503);
  return done();
};
