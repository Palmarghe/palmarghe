import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { sameOrigin, errorResponse } from '../../lib/security';
const inputSchema=z.object({email:z.email().max(254),locale:z.enum(['tr','en'])});
export const POST: APIRoute=async({request,cookies})=>{
  if(!sameOrigin(request))return errorResponse('Invalid origin',403);
  const form=await request.formData();
  const input=inputSchema.safeParse({email:String(form.get('email')??'').trim().toLowerCase(),locale:form.get('locale')});
  if(!input.success)return errorResponse('Invalid email',400);
  const db=supabase(cookies,request);if(!db)return errorResponse('Service unavailable',503);
  const {error}=await db.from('newsletter_subscribers').insert({email:input.data.email,locale:input.data.locale,source:'site'});
  if(error && error.code!=='23505')return errorResponse('Subscription unavailable',503);
  return Response.redirect(new URL(`/${input.data.locale==='en'?'en/':''}?newsletter=1`,request.url),303);
};