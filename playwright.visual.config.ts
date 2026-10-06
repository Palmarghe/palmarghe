import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./visual-e2e',outputDir:'./test-results/visual',workers:1,fullyParallel:false,retries:0,
 snapshotPathTemplate:'{testDir}/baselines/{testFilePath}/{arg}{ext}',updateSnapshots:'none',
 expect:{toHaveScreenshot:{animations:'disabled',caret:'hide',threshold:0.2,maxDiffPixels:100,stylePath:'./visual-e2e/screenshot.css'}},
 use:{...devices['Desktop Chrome'],baseURL:'http://127.0.0.1:4322',locale:'tr-TR',timezoneId:'UTC',reducedMotion:'reduce',serviceWorkers:'block',trace:'retain-on-failure'},
 webServer:{command:'node scripts/e2e-server.mjs',url:'http://127.0.0.1:4322/',reuseExistingServer:false,timeout:60000,env:{LOCAL_TEST_MODE:'true',ASTRO_TELEMETRY_DISABLED:'1'}},
});
