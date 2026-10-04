export function showcaseFocus(value: {position?:unknown;x?:unknown;y?:unknown}) {
  const defaults: Record<string,[number,number]>={center:[50,50],top:[50,0],bottom:[50,100],left:[0,50],right:[100,50]};
  const fallback=defaults[String(value.position)]??defaults.center;
  const coordinate=(input:unknown,defaultValue:number)=>typeof input==='number'&&Number.isFinite(input)&&input>=0&&input<=100?input:defaultValue;
  return {x:coordinate(value.x,fallback[0]),y:coordinate(value.y,fallback[1])};
}
