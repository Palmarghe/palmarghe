import type {APIRoute} from 'astro';
import {supabase} from '../../lib/supabase';
export const GET:APIRoute=async({request,cookies})=>{
 const headers={'cache-control':'private, no-store'};
 const db=supabase(cookies,request);if(!db)return Response.json({error:'unavailable'},{status:503,headers});
 const {data:{user}}=await db.auth.getUser();if(!user)return Response.json({error:'unauthorized'},{status:401,headers});
 const {data:profile,error}=await db.from('profiles').select('role,permission_group_id').eq('id',user.id).single();
 if(error||!['admin','editor'].includes(profile?.role))return Response.json({error:'forbidden'},{status:403,headers});
 const {data:group}=profile.permission_group_id?await db.from('permission_groups').select('permissions').eq('id',profile.permission_group_id).single():{data:null};
 const can=(permission:string)=>profile.role==='admin'||group?.permissions?.[permission]===true;
 const query=(new URL(request.url).searchParams.get('q')??'').replace(/[^\p{L}\p{N}\s-]/gu,'').trim().slice(0,80);
 if(query.length<2)return Response.json({results:[]},{headers});
 const panel=profile.role==='editor'?'&panel=editor':'';
 const results:{title:string;kind:string;href:string}[]=[];
 if(can('content')){const {data,error}=await db.from('content_items').select('id,title,status').or(`title.ilike.%${query}%`).order('updated_at',{ascending:false}).limit(8);if(error)return Response.json({error:'unavailable'},{status:503,headers});for(const row of data??[])results.push({title:row.title,kind:'İçerik · '+row.status,href:`/studio/?section=content&edit=${row.id}${panel}`});}
 if(can('media')){const {data,error}=await db.from('media').select('id,alt_tr,path').or(`alt_tr.ilike.%${query}%,path.ilike.%${query}%`).order('created_at',{ascending:false}).limit(5);if(error)return Response.json({error:'unavailable'},{status:503,headers});for(const row of data??[])results.push({title:row.alt_tr||row.path,kind:'Medya',href:`/studio/?section=media&media_q=${encodeURIComponent(query)}${panel}`});}
 return Response.json({results},{headers});
};
