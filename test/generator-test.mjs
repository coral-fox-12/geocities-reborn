// Node unit checks for the generator (no dependencies).
// Run: node test/generator-test.mjs
import assert from 'node:assert';
import { buildPage, parsePrompt, themeById, THEMES } from '../public/js/generator.js';

const REQUIRED = [
  '<marquee', 'About Me', 'Favorite Things', 'Guestbook',
  'Webring', 'Visitor Counter', 'UNDER CONSTRUCTION', 'Best viewed',
  'counter', 'gb-sign',
];

let n = 0;
const check = (name, fn) => { fn(); n += 1; console.log('ok', n, '-', name); };

// 1. Determinism: same input => byte-identical page.
check('deterministic output', () => {
  const a = buildPage({ prompt: "I'm Mimi, a cat who rules the house" });
  const b = buildPage({ prompt: "I'm Mimi, a cat who rules the house" });
  assert.strictEqual(a.html, b.html);
});

// 2. Every theme produces all required sections, no external URLs.
for (const theme of THEMES) {
  check(`theme ${theme.id} has all sections + no external URLs`, () => {
    const { html } = buildPage({ prompt: 'Hello world, I love music and space', themeId: theme.id });
    for (const frag of REQUIRED) assert.ok(html.includes(frag), `missing ${frag}`);
    assert.ok(html.includes(theme.shrineLabel), 'shrine section label missing');
    assert.ok(!/https?:\/\//.test(html), 'external URL leaked into output');
    assert.ok(html.includes(theme.name), 'theme name missing');
    // Accessibility: guestbook fields are labelled (not placeholder-only),
    // and keyboard focus is visible on the generated page.
    assert.ok(html.includes('aria-label="Your name"'), 'guestbook name input has no accessible label');
    assert.ok(html.includes('aria-label="Your guestbook message"'), 'guestbook message input has no accessible label');
    assert.ok(html.includes(':focus-visible'), 'generated page has no focus-visible style');
  });
}

// 3. Prompt parsing.
check('parses name + topic (cat)', () => {
  const p = parsePrompt("I'm Mimi, a cat who rules the house and worships sunbeams");
  assert.strictEqual(p.name, 'Mimi');
  assert.strictEqual(p.topic.key, 'cat');
});
check('parses name + topic (music)', () => {
  const p = parsePrompt('DJ Nova mixes retro synthwave');
  assert.strictEqual(p.name, 'DJ Nova');
  assert.strictEqual(p.topic.key, 'music');
});
check('falls back to Friend/default', () => {
  const p = parsePrompt('hello there');
  assert.strictEqual(p.name, 'Friend');
  assert.strictEqual(p.topic.key, 'default');
});

// 4. HTML escaping: a hostile prompt cannot break out of the page.
check('escapes prompt HTML', () => {
  const { html } = buildPage({ prompt: 'Evil <script>alert(1)</script> hacker' });
  assert.ok(!html.includes('<script>alert(1)</script>'), 'unescaped script in output');
});

// 5. Plan steps always 5, theme named.
check('plan has 5 steps naming the theme', () => {
  const { plan, theme } = buildPage({ prompt: 'I love space' });
  assert.strictEqual(plan.length, 5);
  assert.ok(plan[1].includes(theme.name));
});

// 6. themeById fallback.
check('unknown theme falls back', () => {
  assert.strictEqual(themeById('nope').id, 'area51');
});

console.log(`\nAll ${n} generator checks passed.`);
