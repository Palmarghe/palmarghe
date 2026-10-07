export const RENDITION_WIDTHS = [320,640,960] as const;
export type MediaRendition = {media_id:string;width:number;height:number;bytes:number;path:string};
const uuid='[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const mediaUrl = new RegExp(`^/api/media/(${uuid})/$`,'i');
export function renditionWidths(sourceWidth:number):number[] {
 return RENDITION_WIDTHS.filter(width=>Number.isSafeInteger(sourceWidth)&&width<sourceWidth);
}
export function validRendition(row:unknown):row is MediaRendition {
 if(!row||typeof row!=='object')return false;
 const value=row as MediaRendition;
 return typeof value.media_id==='string'&&new RegExp(`^${uuid}$`,'i').test(value.media_id)
  && RENDITION_WIDTHS.includes(value.width as 320|640|960)&&Number.isSafeInteger(value.height)&&value.height>0&&value.height<=4096
  &&Number.isSafeInteger(value.bytes)&&value.bytes>0&&value.bytes<=2097152
  &&typeof value.path==='string'&&new RegExp(`^renditions/${value.media_id}/${uuid}/${value.width}\\.webp$`,'i').test(value.path);
}
/** Only advertise a committed original-bound descriptor, never guessed Storage URLs. */
export function mediaRenditionSrcSet(value:string|null|undefined,rows:unknown[],source?:{width?:unknown}):string|undefined {
 if(!value)return undefined;
 let url:URL;try{url=new URL(value,'https://palmarghe.com');}catch{return undefined;}
 if(url.origin!=='https://palmarghe.com'||url.search||url.hash)return undefined;
 const id=url.pathname.match(mediaUrl)?.[1];if(!id)return undefined;
 const candidates=rows.filter(validRendition).filter(row=>row.media_id===id
  &&(typeof source?.width!=='number'||row.width<source.width)).sort((a,b)=>a.width-b.width);
 if(!candidates.length)return undefined;
 const set=[...new Map(candidates.map(row=>[row.width,`${url.pathname}?w=${row.width} ${row.width}w`])).values()];
 if(typeof source?.width==='number'&&Number.isSafeInteger(source.width)&&source.width>candidates.at(-1)!.width)
  set.push(`${url.pathname} ${source.width}w`);
 // Without source dimensions the original remains src fallback, but do not invent its width.
 return set.join(', ');
}
/** Authorization of the parent media row must precede this selection in the route. */
export function requestedRendition(value:string|null):number|null {
 if(value===null)return null;
 const width=Number(value);
 return /^\d+$/.test(value)&&RENDITION_WIDTHS.includes(width as 320|640|960)?width:NaN;
}
