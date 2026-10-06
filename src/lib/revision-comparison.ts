type Snapshot = { title?: unknown; excerpt?: unknown; body?: unknown; status?: unknown; type_data?: unknown };
export function documentText(value: unknown): string {
  if (typeof value === 'string') {
    try { return documentText(JSON.parse(value)); } catch { return value; }
  }
  if (!value || typeof value !== 'object') return '';
  const node = value as {type?: unknown; text?: unknown; content?: unknown};
  if (typeof node.text === 'string') return node.text;
  return Array.isArray(node.content) ? node.content.map(documentText).filter(Boolean).join(['paragraph','heading'].includes(String(node.type))?'':'\n') : '';
}
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
  if (value && typeof value==='object') return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>JSON.stringify(key)+':'+canonical(item)).join(',')+'}';
  return JSON.stringify(value)??'null';
};
export function compareRevision(previous: Snapshot, current: Snapshot) {
  const bodyValue=(value:unknown)=>{if(typeof value==='string'){try{return JSON.parse(value);}catch{return value;}}return value;};
  return [
    {label:'Başlık',before:String(previous.title??''),after:String(current.title??'')},
    {label:'Kısa açıklama',before:String(previous.excerpt??''),after:String(current.excerpt??'')},
    {label:'Metin',before:documentText(previous.body),after:documentText(current.body),changed:canonical(bodyValue(previous.body))!==canonical(bodyValue(current.body))},
    {label:'Yayın durumu',before:String(previous.status??''),after:String(current.status??'')},
    {label:'Görsel ve türe özel ayarlar',before:canonical(previous.type_data??{}),after:canonical(current.type_data??{})},
  ].map(item=>({...item,changed:item.changed??item.before!==item.after}));
}
