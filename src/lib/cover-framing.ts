export function coverFraming(value: unknown) {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const coordinate = (key: string, fallback: number) => typeof input[key] === 'number' && Number.isFinite(input[key]) && input[key] >= 0 && input[key] <= 100 ? input[key] : fallback;
  return { x: coordinate('x',50), y: coordinate('y',50), ratio: ['original','16/9','4/3','1/1'].includes(String(input.ratio)) ? String(input.ratio) : 'original' };
}
export function coverStyle(data: Record<string, unknown> | undefined, detail = false) {
  if (!data?.cover_framing) return undefined;
  const framing=coverFraming(data.cover_framing);
  return `object-position:${framing.x}% ${framing.y}%;${detail && framing.ratio !== 'original' ? `aspect-ratio:${framing.ratio};object-fit:cover;` : ''}`;
}
