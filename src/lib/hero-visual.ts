import {z} from 'zod';

export const heroVisualSchema=z.object({
 ratio:z.enum(['auto','wide','balanced']).default('auto'),
 depth:z.coerce.number().int().min(0).max(20).default(0),
 light:z.coerce.number().int().min(0).max(60).default(0),
 intensity:z.coerce.number().int().min(0).max(150).default(100),
 motion:z.enum(['none','ambient']).default('none'),
});
export type HeroVisual=z.infer<typeof heroVisualSchema>;
export function heroVisual(value:unknown):HeroVisual {
 const result=heroVisualSchema.safeParse(value??{});
 return result.success?result.data:heroVisualSchema.parse({});
}
export function heroVisualStyle(value:unknown):string {
 const visual=heroVisual(value);
 return `--hero-intensity:${visual.intensity/100};--hero-light:${visual.light/100};--hero-depth:${visual.depth}px;--hero-scale:${1+visual.depth/500}`;
}
