import { resolve } from 'node:path';

const files = {
  jpeg: resolve('node_modules/@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm'),
  png: resolve('node_modules/@jsquash/png/codec/pkg/squoosh_png_bg.wasm'),
  webp: resolve('node_modules/@jsquash/webp/codec/dec/webp_dec.wasm'),
};
const id = 'virtual:palmarghe-image-codecs';

export function imageCodecsPlugin() {
  let testing = false;
  return {
    name: 'palmarghe-image-codecs',
    configResolved(config) { testing = config.mode === 'test'; },
    resolveId(source) {
      if (source === id) return `\0${id}`;
    },
    load(source) {
      if (source !== `\0${id}`) return;
      if (testing) return Object.entries(files).map(([name, path]) =>
        `import { readFileSync as read_${name} } from 'node:fs'; export const ${name} = new WebAssembly.Module(read_${name}(${JSON.stringify(path)}));`
      ).join('\n');
      // The existing Cloudflare Vite plugin packages these as CompiledWasm,
      // both in Astro dev and production. No runtime compilation or fetch.
      return Object.entries(files).map(([name,path]) => `export { default as ${name} } from ${JSON.stringify(path.replaceAll('\\','/')+'?module')};`).join('\n');
    },
  };
}
