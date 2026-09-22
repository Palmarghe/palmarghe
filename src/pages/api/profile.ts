import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { errorResponse, sameOrigin } from '../../lib/security';

export const GET: APIRoute = async ({ request,cookies }) => {
  const db=supabase(cookies,request); if(!db) return errorResponse('Service unavailable',503);
  const { data:{user} }=await db.auth.getUser(); if(!user) return errorResponse('Unauthorized',401);
  const { data,error }=await db.from('profiles').select('display_name,bio,avatar_key').eq('id',user.id).single();
  if(!error) return new Response(JSON.stringify({ email:user.email,...data,bio:data.bio ?? user.user_metadata?.bio ?? '',avatar_key:data.avatar_key ?? user.user_metadata?.avatar_key ?? 'avatar-01' }),{ headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'} });
  // Keep profiles usable while an older production schema is being upgraded.
  const fallback=await db.from('profiles').select('display_name').eq('id',user.id).single();
  if(fallback.error) return errorResponse('Profile unavailable',503);
  return new Response(JSON.stringify({ email:user.email,display_name:fallback.data.display_name,bio:user.user_metadata?.bio ?? '',avatar_key:user.user_metadata?.avatar_key ?? 'avatar-01' }),{ headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'} });
};

export const POST: APIRoute = async ({ request,cookies }) => {
  if(!sameOrigin(request)) return errorResponse('Invalid origin',403);
  const db=supabase(cookies,request); if(!db) return errorResponse('Service unavailable',503);
  const { data:{user} }=await db.auth.getUser(); if(!user) return errorResponse('Unauthorized',401);
  const form=await request.formData();
  const input=z.object({ display_name:z.string().trim().min(2).max(100),bio:z.string().trim().max(500),avatar_key:z.string().regex(/^avatar-(0[1-9]|1[0-9]|20)$/) }).safeParse({display_name:form.get('display_name'),bio:form.get('bio')??'',avatar_key:form.get('avatar_key')});
  if(!input.success) return errorResponse('Invalid profile',400);
  const metadata=await db.auth.updateUser({data:{bio:input.data.bio,avatar_key:input.data.avatar_key}});
  if(metadata.error) return errorResponse('Update failed',400);
  const extended=await db.from('profiles').update(input.data).eq('id',user.id);
  if(extended.error){
    const fallback=await db.from('profiles').update({display_name:input.data.display_name}).eq('id',user.id);
    if(fallback.error) return errorResponse('Update failed',400);
  }
  return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
};
