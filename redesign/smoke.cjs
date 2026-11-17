// Live smoke test for the redesigned GeoCities portal.
// Usage: node smoke.cjs <url>
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME = path.join(process.env.HOME, '.cache/ms-playwright/chromium-1148/chrome-linux/chrome');
const url = process.argv[2];
let failures = 0;
const check = (name, ok, extra = '') => { console.log(ok ? 'ok  -' : 'FAIL -', name, extra); if (!ok) failures++; };

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--proxy-server=http://127.0.0.1:18080', '--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  const extReqs = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  page.on('request', r => { const u = r.url(); if (!u.startsWith(url.replace(/\/$/, '')) && !u.startsWith('data:')) extReqs.push(u); });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);
  check('h1 contains GeoCities', (await page.locator('h1').first().textContent()).includes('GeoCities'));
  check('Archivo Black loaded', await page.evaluate(() => document.fonts.check('16px "Archivo Black"')));
  check('IBM Plex Mono loaded', await page.evaluate(() => document.fonts.check('12px "IBM Plex Mono"')));
  check('gallery shows 3 cards', (await page.locator('#gallery-cards .card').count()) === 3);
  const titles = await page.locator('#gallery-cards .card h3').allTextContents();
  check('gallery titles have no emoji', !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(titles.join(' ')), titles.join(' | '));
  check('no purple/blue gradient in computed bg', await page.evaluate(() => {
    const bg = getComputedStyle(document.body).backgroundImage;
    return bg === 'none' || (!bg.includes('gradient'));
  }));
  check('no #0000ff / Comic Sans in served CSS', await page.evaluate(async () => {
    const css = await (await fetch('/css/style.css')).text();
    return !css.includes('#0000ff') && !css.toLowerCase().includes('comic sans');
  }));
  // Build flow: fill prompt, build, preview appears with a generated page.
  await page.fill('#prompt', "I'm Mimi, a cat who rules the house and worships sunbeams");
  await page.click('#build-btn');
  await page.waitForSelector('#preview:not([hidden])', { timeout: 15000 });
  const frame = page.frameLocator('#preview');
  await frame.locator('marquee').waitFor({ timeout: 5000 });
  check('generated page has marquee', (await frame.locator('marquee').textContent()).includes("MIMI'S HOMEPAGE"));
  check('generated page has guestbook + counter', (await frame.locator('#guestbook').count()) === 1 && (await frame.locator('#counter').count()) === 1);
  check('no external requests', extReqs.length === 0, extReqs.slice(0, 3).join(', '));
  check('zero console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
  console.log(failures === 0 ? '\nLive smoke: ALL PASSED' : `\nLive smoke: ${failures} FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('SMOKE FAILED:', e.message); process.exit(1); });
