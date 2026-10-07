/** Format persisted metadata only; never substitute the current browser/server clock. */
export function savedRecordTime(value:unknown):{iso:string;text:string}|null{
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(value))return null;
 const date=new Date(value);if(!Number.isFinite(date.getTime()))return null;
 return {iso:date.toISOString(),text:new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(date)};
}
