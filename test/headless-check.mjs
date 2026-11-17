// Playwright is resolved portably: repo node_modules first, then any npx
// cache install, then the legacy /tmp path. (A live Kiro session found the
// old hardcoded /tmp path broken; the npx-cache hash path it first used
// was machine-specific, so this resolver tries candidates in order.)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

async function loadPlaywright() {
  const candidates = [path.join(ROOT, 'node_modules', 'playwright', 'index.mjs')];
  try {
    const npxRoot = path.join(os.homedir(), '.npm', '_npx');
    for (const d of fs.readdirSync(npxRoot))
      candidates.push(path.join(npxRoot, d, 'node_modules', 'playwright', 'index.mjs'));
  } catch {}
  candidates.push('/tmp/shot/node_modules/playwright/index.mjs');
  const tried = [];
  for (const c of candidates) {
    try {
      if (!fs.existsSync(c)) continue;
      const mod = await import(c);
      // Probe: an install is only usable if its browser binary is present.
      const browser = await mod.chromium.launch({ headless: true });
      await browser.close();
      return mod;
    } catch (e) {
      tried.push(c + ' (' + String(e.message || e).split('\n')[0] + ')');
    }
  }
  throw new Error('No working Playwright found. Tried:\n' + tried.join('\n') + '\nFix: npx playwright@1.49.1 install chromium, then retry.');
}

const { chromium } = await loadPlaywright();
const SHOTS = path.join(ROOT, 'test', 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const PORT = 8931;
const BASE = `http://127.0.0.1:${PORT}`;
let failures = 0;
const check = (name, ok, extra = '') => {
  console.log(ok ? 'ok  -' : 'FAIL -', name, extra);
  if (!ok) failures += 1;
};

const server = spawn('node', ['server.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: 'pipe' });
let serverLog = '';
server.stdout.on('data', (d) => { serverLog += d; });
server.stderr.on('data', (d) => { serverLog += d; });

async function waitForServer(tries = 30) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(BASE + '/api/gallery');
      if (r.ok) return true;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

try {
  check('server starts', await waitForServer(), serverLog.slice(0, 200));

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  check('portal loads', await page.locator('h1').first().textContent().then((t) => t.includes('GeoCities')));
  await page.waitForTimeout(800);
  const cards = await page.locator('#gallery-cards .card').count();
  check('gallery shows 3 sample pages', cards === 3, `got ${cards}`);
  await page.screenshot({ path: path.join(SHOTS, '01-portal.png') });

  // Empty prompt => inline error, no generation.
  await page.click('#build-btn');
  check('empty prompt shows error', await page.locator('#error').isVisible());

  // Full generate flow.
  await page.fill('#prompt', "I'm Mimi, a cat who rules the house and worships sunbeams");
  await page.click('#build-btn');
  await page.waitForSelector('#preview:not([hidden])', { timeout: 15000 });
  const frame = page.frameLocator('#preview');
  await frame.locator('marquee').waitFor({ timeout: 5000 });
  const marquee = await frame.locator('marquee').textContent();
  check('generated page has marquee title', marquee.includes("MIMI'S HOMEPAGE"), marquee);
  check('generated page has guestbook', await frame.locator('#guestbook').count() === 1);
  check('generated page has visitor counter', await frame.locator('#counter').count() === 1);
  const counterText = await frame.locator('#count-num').textContent();
  check('counter shows a number', /^\d{6}$/.test(counterText || ''), counterText);
  await page.screenshot({ path: path.join(SHOTS, '02-generated.png') });

  // Guestbook sign + persistence across iframe reload.
  await frame.locator('#gb-name').fill('Time Traveler');
  await frame.locator('#gb-msg').fill('Greetings from the future — the web is still weird. Love it.');
  await frame.locator('#gb-sign').click();
  await page.waitForTimeout(400);
  const entry = await frame.locator('#entries').textContent();
  check('guestbook entry appears', entry.includes('Time Traveler') && entry.includes('Greetings from the future'));
  // Reload the same page HTML into the iframe (simulates reopening the page).
  const html = await page.evaluate(() => document.querySelector('#preview').srcdoc);
  await page.evaluate((h) => { document.querySelector('#preview').srcdoc = h; }, html);
  await frame.locator('#entries').waitFor({ timeout: 5000 });
  const entry2 = await frame.locator('#entries').textContent();
  check('guestbook entry persists after reload', entry2.includes('Time Traveler'));

  // Download produces a standalone file.
  const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
  await page.click('#download-btn');
  const dl = await downloadPromise;
  const dlPath = path.join(SHOTS, 'downloaded-homepage.html');
  await dl.saveAs(dlPath);
  const dlHtml = fs.readFileSync(dlPath, 'utf8');
  check('download is a standalone page', dlHtml.includes('<!DOCTYPE html>') && dlHtml.includes('MIMI') && !/https?:\/\//.test(dlHtml));

  // Regenerate produces a different page (new seed).
  const before = await page.evaluate(() => document.querySelector('#preview').srcdoc.length);
  await page.click('#regen-btn');
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => document.querySelector('#preview').srcdoc.length);
  check('regenerate runs', typeof after === 'number' && after > 1000, `${before} -> ${after}`);

  // A sample page loads standalone with no console errors.
  await page.goto(BASE + '/samples/dj-nova.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  check('sample page renders', await page.locator('marquee').count() === 1);
  await page.screenshot({ path: path.join(SHOTS, '03-sample.png') });

  // Theme picker: choosing Hollywood changes the generated theme.
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.fill('#prompt', 'I love movies and stargazing');
  await page.locator('.theme-card', { hasText: 'Hollywood' }).click();
  await page.click('#build-btn');
  await page.waitForSelector('#preview:not([hidden])', { timeout: 15000 });
  const f2 = page.frameLocator('#preview');
  await f2.locator('marquee').waitFor({ timeout: 5000 });
  const t2 = await f2.locator('#shrine h2').textContent();
  check('theme picker forces Hollywood', (t2 || '').includes('Walk of Fame'), t2);

  check('zero console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
} finally {
  server.kill();
}

console.log(failures === 0 ? '\nAll headless checks passed.' : `\n${failures} headless check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
