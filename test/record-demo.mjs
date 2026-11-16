// Demo video recorder for GeoCities Reborn (Kiroween 2026).
// Run: node test/record-demo.mjs
// Follows the shot list in SUBMISSION.md. Records one continuous
// 1280x720 Playwright video (no audio), then prints the raw .webm path
// and a JSON of beat timestamps (video seconds) for captioning with ffmpeg.
import { chromium } from '/tmp/shot/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'demo-video');
const DL = path.join(OUT, 'downloads');
fs.mkdirSync(DL, { recursive: true });

const PORT = 8931;
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn('node', ['server.mjs'], {
  cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: 'pipe',
});
let serverLog = '';
server.stdout.on('data', (d) => { serverLog += d; });
server.stderr.on('data', (d) => { serverLog += d; });

async function waitForServer(tries = 30) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(BASE + '/api/gallery'); if (r.ok) return true; } catch { /* retry */ }
    await sleep(300);
  }
  return false;
}

const beats = {};
const t0 = Date.now();
const mark = (name) => { beats[name] = +((Date.now() - t0) / 1000).toFixed(1); console.log(`beat ${name} @ ${beats[name]}s`); };

let browser;
try {
  if (!(await waitForServer())) throw new Error('server did not start: ' + serverLog.slice(0, 500));
  console.log('server up');

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: OUT, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log('PAGE ERROR:', String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text().slice(0, 200)); });

  // 0:00 — portal hero
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.card', { timeout: 15000 }); // gallery loaded
  mark('hero_start');
  await sleep(16000);

  // 0:15 — type the prompt, pick Enchanted Forest
  mark('type_start');
  await page.locator('#prompt').click();
  await page.locator('#prompt').pressSequentially(
    "I'm Mimi, a cat who rules the house and worships sunbeams", { delay: 70 });
  await sleep(2000);
  await page.locator('.theme-card', { hasText: 'Enchanted Forest' }).click();
  await sleep(7000);

  // 0:45 — build, watch Webby's plan tick, page appears
  mark('build_start');
  await page.locator('#build-btn').click();
  await page.waitForSelector('#preview:not([hidden])', { timeout: 15000 });
  await sleep(6000);
  await page.locator('#preview-section').scrollIntoViewIfNeeded();
  await sleep(9000);

  // 1:15 — guestbook + chiptune
  mark('guestbook_start');
  const frame = page.frameLocator('#preview');
  await frame.locator('#gb-name').fill("Webby's first fan");
  await frame.locator('#gb-msg').fill('Greetings from the future — your page still slaps in 2026!');
  await frame.locator('#gb-sign').click();
  await sleep(5000);
  await page.locator('#music-btn').click();
  await sleep(4000);
  await page.locator('#music-btn').click();

  // 1:45 — gallery sample
  mark('gallery_start');
  await page.locator('#gallery').scrollIntoViewIfNeeded();
  await sleep(3000);
  await page.locator('.card', { hasText: 'DJ Nova' }).click();
  await sleep(2000);
  await page.locator('#preview-section').scrollIntoViewIfNeeded();
  await sleep(8000);

  // Download the page, then open the downloaded file offline
  mark('download_start');
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 10000 }),
    page.locator('#download-btn').click(),
  ]);
  const dlPath = path.join(DL, 'my-geocities-homepage.html');
  await download.saveAs(dlPath);
  await sleep(2000);

  mark('offline_start');
  await page.goto('file://' + dlPath, { waitUntil: 'load' });
  await sleep(11000);

  // Close on the Kiro specs card
  mark('endcard_start');
  await page.goto('file://' + path.join(OUT, 'end-card.html'), { waitUntil: 'load' });
  await sleep(9000);

  const videoPath = await page.video().path();
  await context.close();
  mark('done');
  console.log('RAW VIDEO:', videoPath);
  console.log('BEATS:', JSON.stringify(beats));
  console.log('DOWNLOAD:', dlPath, fs.existsSync(dlPath) ? fs.statSync(dlPath).size + ' bytes' : 'MISSING');
} finally {
  if (browser) await browser.close();
  server.kill();
}
