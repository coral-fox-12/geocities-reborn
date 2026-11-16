// Generate the gallery sample pages with the generator itself.
// Run: node test/make-samples.mjs  (writes public/samples/*.html)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPage } from '../public/js/generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'samples');
fs.mkdirSync(outDir, { recursive: true });

const SAMPLES = [
  { file: 'mimi-the-cat.html', prompt: "I'm Mimi, a cat who rules the house and worships sunbeams", themeId: 'enchantedforest' },
  { file: 'dj-nova.html', prompt: 'DJ Nova mixes retro synthwave and collects vinyl', themeId: 'sunsetstrip' },
  { file: 'captain-stardust.html', prompt: "I'm Captain Stardust, an amateur astronomer hunting UFOs over the desert", themeId: 'area51' },
];

for (const s of SAMPLES) {
  const { html } = buildPage({ prompt: s.prompt, themeId: s.themeId });
  fs.writeFileSync(path.join(outDir, s.file), html);
  console.log('wrote', s.file, html.length, 'bytes');
}
