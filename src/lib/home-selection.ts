/** Keep editorial choices first, then original projects and creative entries, without repeating the hero/spotlight. */
export function homeSelection<T extends {id:string;type:string}>(items:T[], selected:T[], heroId?:string,spotlightId?:string) {
  const excluded=new Set([heroId,spotlightId].filter(Boolean));
  const rank=(item:T)=>item.type==='project'?0:item.type==='lab_entry'?1:2;
  const choices=[...selected,...items.map((item,index)=>({item,index})).sort((a,b)=>rank(a.item)-rank(b.item)||a.index-b.index).map(row=>row.item)];
  const featured:T[]=[];
  for(const item of choices)if(!excluded.has(item.id)&&!featured.some(e=>e.id===item.id)&&featured.length<3)featured.push(item);
  const reserved=new Set([...excluded,...featured.map(item=>item.id)]);
  return {featured,reserved};
}
