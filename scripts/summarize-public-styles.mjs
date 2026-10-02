import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

const before = JSON.parse(await readFile('test-results/performance/css-home-before-serial-20261002.json', 'utf8'));
const after = JSON.parse(await readFile('test-results/performance/css-home-after-20261002.json', 'utf8'));
const article = JSON.parse(await readFile('test-results/performance/css-article-after-20261002.json', 'utf8'));
const files = await readdir('dist/client/_astro');
const publicName = files.find(name => /^Site\..*\.css$/.test(name));
const studioName = files.find(name => /^index\..*\.css$/.test(name));
if (!publicName || !studioName) throw new Error('Expected public and Studio stylesheets');
const assets = [];
for (const [kind, host, name] of [['public', 'palmarghe.com', publicName], ['studio', 'studio.palmarghe.com', studioName]]) {
  const response = await fetch(`https://${host}/_astro/${name}`);
  if (!response.ok) throw new Error(`Asset request failed: ${kind}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const built = await readFile(`dist/client/_astro/${name}`);
  assets.push({ kind, url: response.url, status: response.status, bytes: bytes.length,
    gzipEquivalentBytes: gzipSync(bytes).length, matchesBuild: bytes.equals(built),
    sha256: createHash('sha256').update(bytes).digest('hex'), cacheControl: response.headers.get('cache-control') });
}
const sample = report => ({ fetchTime: report.fetchTime, lighthouseVersion: report.lighthouseVersion,
  url: report.finalDisplayedUrl, settings: report.configSettings,
  performance: report.categories.performance.score,
  metrics: Object.fromEntries(['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'total-byte-weight', 'server-response-time'].map(key => [key, report.audits[key].numericValue])),
  stylesheets: report.audits['network-requests'].details.items.filter(item => /\.css($|\?)/.test(item.url)).map(item => ({ url: item.url, transferSize: item.transferSize, resourceSize: item.resourceSize })) });
const evidence = { measuredWorker: 'b5fd38ce-e31d-4f72-848e-e581050a4caa',
  baselineWorker: '90ef6f57-c845-4f40-aa5d-25992490019f',
  baselineStylesheetSha256: '353368eef2b474405c772d161072351e2823ac811409e7335985ad0893febf4e',
  assets, before: sample(before), after: sample(after), article: sample(article),
  limitations: 'Individual lab navigations, not field percentiles or INP. Final before/after and article samples ran without concurrent local build or browser test processes. The article has no fresh paired baseline. gzipEquivalentBytes is local compression, not a CDN wire measurement. Initial overlapping baseline is excluded.' };
await writeFile('docs/public-css-performance-2026-10-02.json', JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence, null, 2));
