import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { sameOrigin, errorResponse } from '../../lib/security';
import { localAuthAllowed } from '../../lib/local-adapter';
import { localTestRequest } from '../../lib/supabase';
const inputSchema=z.object({email:z.email().max(254),locale:z.enum(['tr','en']),consent:z.literal('on')});
export const POST: APIRoute=async({request,cookies})=>{
  if(!sameOrigin(request))return errorResponse('Invalid origin',403);
  const form=await request.formData();
  const locale=form.get('locale') === 'en' ? 'en' : 'tr';
  const done=()=>Response.redirect(new URL(`/${locale==='en'?'en/':''}?newsletter=1`,request.url),303);
  // Silently accept bot traps without ever storing their submitted address.
  if(form.get('website')) return done();
  const input=inputSchema.safeParse({email:String(form.get('email')??'').trim().toLowerCase(),locale,consent:form.get('consent')});
  if(!input.success)return errorResponse('Invalid email',400);
  const db=supabase(cookies,request);if(!db)return errorResponse('Service unavailable',503);
  const ip=request.headers.get('cf-connecting-ip') ?? 'unknown';
  if(localTestRequest(request) && !localAuthAllowed(`${ip}:newsletter`,5)) return errorResponse('Rate limit exceeded',429);
  const {error}=await db.rpc('subscribe_newsletter',{p_email:input.data.email,p_locale:input.data.locale,p_source:'site'});
  if(error)return errorResponse('Subscription unavailable',503);
  return done();
};
