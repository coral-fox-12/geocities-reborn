// Screenshot helper for the GeoCities redesign audit/verify.
// Usage: node shot.cjs <url> <out-prefix> [width height]
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME = path.join(process.env.HOME, '.cache/ms-playwright/chromium-1148/chrome-linux/chrome');

(async () => {
  const url = process.argv[2];
  const prefix = process.argv[3];
  const width = Number(process.argv[4] || 1440);
  const height = Number(process.argv[5] || 900);
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--proxy-server=http://127.0.0.1:18080', '--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  page.on('requestfailed', r => errors.push('REQFAIL ' + r.url()));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  const out = prefix + '.png';
  await page.screenshot({ path: out, fullPage: true });
  console.log('saved', out, 'console errors:', errors.length ? errors.join(' | ') : 'none');
  await browser.close();
})().catch(e => { console.error('SHOT FAILED:', e.message); process.exit(1); });
