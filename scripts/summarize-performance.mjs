import { readFile, writeFile } from 'node:fs/promises';

const names = ['home-mobile', 'home-mobile-after', 'home-desktop', 'article-mobile', 'home-mobile-final', 'article-mobile-final'];
const results = [];
for (const name of names) {
  const report = JSON.parse(await readFile(`test-results/performance/${name}-20261002.json`, 'utf8'));
  results.push({
    name, lighthouseVersion: report.lighthouseVersion, fetchTime: report.fetchTime,
    url: report.finalDisplayedUrl, settings: report.configSettings,
    scores: Object.fromEntries(Object.entries(report.categories).map(([key, value]) => [key, value.score])),
    metrics: Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'total-byte-weight', 'server-response-time'].map(key => [key, report.audits[key]?.numericValue])),
    imageSavings: report.audits['image-delivery-insight']?.details?.debugData?.wastedBytes,
    categoryRequests: report.audits['network-requests'].details.items.filter(item => /editorial-(ai|gaming|fm|lab)/.test(item.url)).map(item => ({ url: item.url, transferSize: item.transferSize })),
  });
}
await writeFile('docs/performance-lab-2026-10-02.json', `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results.map(({ name, scores, metrics }) => ({ name, scores, metrics })), null, 2));
