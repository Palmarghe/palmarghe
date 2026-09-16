import { spawn } from 'node:child_process';
const astro = 'node_modules/astro/bin/astro.mjs';
const args = ['dev','--host','127.0.0.1','--port','4322','--ignore-lock'];
const child = spawn(process.execPath, [astro,...args], { stdio: 'inherit', env: { ...process.env, LOCAL_TEST_MODE: 'true', ASTRO_DEV_BACKGROUND: '0' } });
child.on('exit', (code) => { if (code && code !== 0) process.exit(code); });
const keepAlive = setInterval(() => {}, 1000);
async function stop() {
  clearInterval(keepAlive);
  child.kill();
  const stopper = spawn(process.execPath, [astro,'dev','stop'], { stdio: 'ignore' });
  stopper.on('exit', () => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
