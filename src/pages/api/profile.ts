import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { errorResponse, sameOrigin } from '../../lib/security';

export const GET: APIRoute = async ({ request,cookies }) => {
  const db=supabase(cookies,request); if(!db) return errorResponse('Service unavailable',503);
  const { data:{user} }=await db.auth.getUser(); if(!user) return errorResponse('Unauthorized',401);
  const { data,error }=await db.from('profiles').select('display_name,bio,avatar_key,author_slug,public_profile').eq('id',user.id).single();
  if(error || !data) return errorResponse('Profile unavailable',503);
  return new Response(JSON.stringify({ viewer_id:user.id,email:user.email,...data,bio:data.bio ?? user.user_metadata?.bio ?? '',avatar_key:data.avatar_key ?? user.user_metadata?.avatar_key ?? 'avatar-01',author_slug:data.author_slug ?? '',public_profile:data.public_profile ?? false }),{ headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'} });
};

export const POST: APIRoute = async ({ request,cookies }) => {
  if(!sameOrigin(request)) return errorResponse('Invalid origin',403);
  const db=supabase(cookies,request); if(!db) return errorResponse('Service unavailable',503);
  const { data:{user} }=await db.auth.getUser(); if(!user) return errorResponse('Unauthorized',401);
  const form=await request.formData();
  const expectedViewer=form.get('viewer_id');
  if(expectedViewer!==null && expectedViewer!==user.id)return Response.json({error:'profile_session_changed'},{status:401});
  const input=z.object({ display_name:z.string().trim().min(2).max(100),bio:z.string().trim().max(500),avatar_key:z.string().regex(/^avatar-(0[1-9]|1[0-9]|20)$/),author_slug:z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80).or(z.literal('')),public_profile:z.enum(['true','false']).transform((value)=>value==='true') }).safeParse({display_name:form.get('display_name'),bio:form.get('bio')??'',avatar_key:form.get('avatar_key'),author_slug:form.get('author_slug') ?? '',public_profile:form.get('public_profile') === 'on' ? 'true' : 'false'});
  if(!input.success) return Response.json({error:'invalid_profile',field:String(input.error.issues[0]?.path[0] ?? '')},{status:400});
  if(input.data.public_profile && !input.data.author_slug) return Response.json({error:'author_slug_required',field:'author_slug'},{status:400});
  // The migrated profile row is authoritative. One update is atomic; never
  // claim a partial legacy fallback or Auth metadata write saved every field.
  const extended=await db.from('profiles').update({...input.data,author_slug:input.data.author_slug || null}).eq('id',user.id).select('id').single();
  if(extended.error){
    if(extended.error.code==='23505') return Response.json({error:'author_slug_taken',field:'author_slug'},{status:409});
    if(extended.error.code==='42501') return Response.json({error:'profile_forbidden'},{status:403});
    return Response.json({error:'profile_unavailable'},{status:503});
  }
  if(!extended.data) return Response.json({error:'profile_unavailable'},{status:503});
  return new Response(JSON.stringify({ok:true,viewer_id:user.id}),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
};
