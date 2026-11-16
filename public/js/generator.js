// GeoCities Reborn — deterministic retro homepage generator.
// Pure ES module: no DOM, no network, no clock in the output path.
// Same prompt + theme + seed => byte-identical page.
// Used by the browser app AND by Node (tests + gallery samples).

// ---------------------------------------------------------------- PRNG
export function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
export function pickN(rng, arr, n) {
  const copy = arr.slice();
  const out = [];
  while (copy.length && out.length < n) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  }
  return out;
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------------------------------------------------------------- Themes
// Original chiptune melodies: [note, beats] — square-wave, ~140 BPM.
export const THEMES = [
  {
    id: 'area51', name: 'Area 51', tagline: 'They are among us... and they have homepages.',
    emoji: '👽', bg: '#001a00', bgPattern: 'radial-gradient(circle at 20% 30%, #0f3d0f 0, transparent 12%), radial-gradient(circle at 80% 70%, #0f3d0f 0, transparent 12%)',
    ink: '#7CFC00', accent: '#00ff41', accent2: '#c0ff00',
    divider: '🛸 ✦ ─── ✦ 🛸 ✦ ─── ✦ 🛸',
    shrineLabel: 'The UFO Shrine', greeting: 'Greetings, Earthling',
    melody: [['C4',1],['E4',1],['G4',1],['B4',2],['A4',1],['G4',1],['E4',2],['D4',2],['C4',2],['G3',2]],
  },
  {
    id: 'hollywood', name: 'Hollywood', tagline: 'Lights, camera, homepage!',
    emoji: '🎬', bg: '#2b0000', bgPattern: 'radial-gradient(circle at 50% 0%, #6b1d1d 0, transparent 45%), repeating-linear-gradient(45deg, transparent 0 18px, rgba(255,215,0,.06) 18px 20px)',
    ink: '#ffe9b0', accent: '#ffd700', accent2: '#ff4d6d',
    divider: '★ ── ★ ── ★ ── ★ ── ★ ── ★ ── ★',
    shrineLabel: 'The Walk of Fame', greeting: 'Welcome to the show',
    melody: [['C4',1],['C4',1],['E4',1],['G4',1],['A4',2],['G4',1],['E4',1],['D4',1],['C4',2],['C4',2]],
  },
  {
    id: 'sunsetstrip', name: 'Sunset Strip', tagline: 'Turn it up to 11. The neighbors love it.',
    emoji: '🎸', bg: '#1a0033', bgPattern: 'linear-gradient(180deg, rgba(255,0,128,.14), transparent 40%), repeating-linear-gradient(90deg, transparent 0 26px, rgba(0,255,255,.07) 26px 28px)',
    ink: '#ffd6ff', accent: '#ff00aa', accent2: '#00ffff',
    divider: '♪ ♫ ── ♪ ── ♫ ── ♪ ── ♫ ── ♪',
    shrineLabel: 'The Backstage Shrine', greeting: 'Rock on',
    melody: [['E4',1],['G4',1],['A4',1],['B4',1],['A4',1],['G4',1],['E4',1],['D4',1],['E4',2],['E4',2]],
  },
  {
    id: 'heartland', name: 'Heartland', tagline: 'Fresh-baked pages, straight from the oven.',
    emoji: '🌻', bg: '#3a2400', bgPattern: 'radial-gradient(circle at 15% 20%, rgba(255,220,90,.16) 0, transparent 14%), radial-gradient(circle at 85% 80%, rgba(255,220,90,.12) 0, transparent 14%)',
    ink: '#fff3c4', accent: '#ffc93c', accent2: '#ff8c42',
    divider: '🌻 ── 🌻 ── 🌻 ── 🌻 ── 🌻 ── 🌻',
    shrineLabel: 'The Front Porch', greeting: 'Howdy, neighbor',
    melody: [['G4',1],['A4',1],['B4',1],['D5',2],['B4',1],['A4',1],['G4',1],['E4',1],['D4',2],['G4',2]],
  },
  {
    id: 'enchantedforest', name: 'Enchanted Forest', tagline: 'Enter, traveler. The unicorns approve.',
    emoji: '🦄', bg: '#0d1f0d', bgPattern: 'radial-gradient(circle at 70% 15%, rgba(180,120,255,.16) 0, transparent 16%), radial-gradient(circle at 25% 85%, rgba(120,255,180,.12) 0, transparent 16%)',
    ink: '#e6ffe6', accent: '#b57edc', accent2: '#7dffb2',
    divider: '🦄 ✦ ── 🌲 ── ✦ 🦄 ✦ ── 🌲 ── ✦',
    shrineLabel: 'The Crystal Glade', greeting: 'Blessings upon thee',
    melody: [['A4',1],['C5',1],['E5',1],['D5',1],['C5',1],['A4',1],['G4',1],['E4',1],['D4',2],['A4',2]],
  },
  {
    id: 'siliconvalley', name: 'Silicon Valley', tagline: 'Now with 28.8k of pure innovation.',
    emoji: '💾', bg: '#001122', bgPattern: 'repeating-linear-gradient(0deg, transparent 0 22px, rgba(0,255,255,.05) 22px 23px), repeating-linear-gradient(90deg, transparent 0 22px, rgba(0,255,255,.05) 22px 23px)',
    ink: '#cfefff', accent: '#00d4ff', accent2: '#7dff00',
    divider: '░ ▒ ▓ ── ░ ▒ ▓ ── ░ ▒ ▓ ── ░ ▒',
    shrineLabel: 'The Server Room', greeting: 'Hello, World',
    melody: [['C4',1],['D4',1],['E4',1],['F4',1],['G4',1],['A4',1],['G4',1],['F4',1],['E4',2],['C4',2]],
  },
];

export function themeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

// ---------------------------------------------------------------- Prompt parsing
const TOPICS = [
  { key: 'cat', words: ['cat', 'kitten', 'kitty', 'mimi', 'meow', 'feline'], label: 'cats',
    shrine: ['a shrine to the one true ruler of the house', 'photos of naps in sunbeams', 'a tribute to the sacred red dot'],
    faves: ['sunbeams', 'cardboard boxes', 'tuna', 'knocking things off tables', '3 AM zoomies', 'the forbidden plant'] },
  { key: 'dog', words: ['dog', 'puppy', 'pup', 'doggo'], label: 'dogs',
    shrine: ['a shrine to the goodest boy/girl', 'a hall of favorite sticks', 'treats, ranked by crunch'],
    faves: ['belly rubs', 'car windows', 'squeaky toys', 'the mailman (enemy)', 'long walks', 'stealing socks'] },
  { key: 'music', words: ['music', 'band', 'dj', 'guitar', 'song', 'rock', 'metal', 'piano'], label: 'music',
    shrine: ['a shrine to the greatest riffs ever recorded', 'the setlist of dreams', 'a wall of ticket stubs'],
    faves: ['vinyl crackle', 'air guitar solos', 'mixtapes', 'encores', 'bass drops', 'singing in the shower'] },
  { key: 'space', words: ['space', 'alien', 'ufo', 'star', 'galaxy', 'astronaut', 'nasa'], label: 'space',
    shrine: ['a shrine to the great beyond', 'a log of UFO sightings', 'a map of the stars'],
    faves: ['shooting stars', 'zero gravity', 'moonlight', 'telescopes', 'the final frontier', 'area 51'] },
  { key: 'game', words: ['game', 'gaming', 'gamer', 'rpg', 'chess', 'arcade', 'nintendo'], label: 'games',
    shrine: ['a shrine to the high score', 'a hall of legendary bosses', 'cheat codes, written in pencil'],
    faves: ['speedruns', 'easter eggs', 'boss fights', 'save points', '8-bit soundtracks', 'one more turn'] },
  { key: 'food', words: ['food', 'cook', 'baking', 'pizza', 'cake', 'recipe', 'chef'], label: 'food',
    shrine: ['a shrine to the perfect slice', 'the recipe vault', 'a gallery of glorious leftovers'],
    faves: ['midnight snacks', 'extra cheese', 'secret spices', 'fresh bread', 'taste tests', 'second helpings'] },
  { key: 'book', words: ['book', 'read', 'novel', 'poetry', 'library', 'author'], label: 'books',
    shrine: ['a shrine to the unread pile', 'a shelf of dog-eared favorites', 'quotes worth stealing'],
    faves: ['rainy reading days', 'plot twists', 'marginalia', 'used bookstores', 'one more chapter', 'the smell of old paper'] },
  { key: 'movie', words: ['movie', 'film', 'cinema', 'actor', 'star wars', 'horror'], label: 'movies',
    shrine: ['a shrine to the greatest scenes ever filmed', 'a poster wall', 'the popcorn canon'],
    faves: ['plot twists', 'director’s cuts', 'midnight premieres', 'quotable lines', 'popcorn', 'end credits songs'] },
];

const BIO_LINES = [
  '{name} here. Welcome to my little corner of the World Wide Web. Make yourself at home — the guestbook is open and the music is free.',
  'This page is all about {topic}. I built it with my own two hands (and a little help from a ghost in the machine).',
  'If you came here from the webring, you are officially cool. If you came here by accident, you are cool too. Stay a while.',
  'Everything on this page was made with love, a 28.8k modem, and far too much free time. Please sign the guestbook before you go.',
  'Best viewed at 800x600 with the lights low and the volume up. Netscape Navigator 4.0 recommended. Your mileage may vary.',
];

const NAME_PATTERNS = [
  /(?:my name is|i['’]m|i am|call me)\s+([A-Z][a-zA-Z]{1,15}(?:\s+[A-Z][a-zA-Z]{1,15})?)/i,
  /^([A-Z][a-zA-Z]{1,15}(?:\s+[A-Z][a-zA-Z]{1,15})?)\b/,
];

export function parsePrompt(prompt) {
  const text = (prompt || '').trim();
  let name = 'Friend';
  for (const re of NAME_PATTERNS) {
    const m = text.match(re);
    if (m) { name = m[1]; break; }
  }
  const lower = text.toLowerCase();
  let topic = TOPICS.find((t) => t.words.some((w) => lower.includes(w)));
  if (!topic) topic = { key: 'default', label: 'the good life',
    shrine: ['a shrine to the little things', 'a collection of favorite moments', 'a wall of tiny victories'],
    faves: ['long walks', 'good coffee', 'old songs', 'rainy days', 'inside jokes', 'golden hour'] };
  let vibe = 'sparkly';
  if (/cozy|calm|quiet|home|warm/.test(lower)) vibe = 'cozy';
  else if (/loud|party|rock|wild|fun/.test(lower)) vibe = 'loud';
  else if (/mystery|dark|ghost|magic|secret/.test(lower)) vibe = 'mysterious';
  return { name, topic, vibe, text };
}

export function themeForPrompt(parsed, rng) {
  const byTopic = { cat: 'enchantedforest', dog: 'heartland', music: 'sunsetstrip', space: 'area51', game: 'siliconvalley', food: 'heartland', book: 'enchantedforest', movie: 'hollywood' };
  const id = byTopic[parsed.topic.key];
  if (id) return themeById(id);
  return pick(rng, THEMES);
}

// ---------------------------------------------------------------- Page builder
export function planSteps(parsed, theme) {
  return [
    `Parsing your story… found ${parsed.name}, a fan of ${parsed.topic.label}.`,
    `Choosing a neighborhood… ${theme.name} it is. ${theme.tagline}`,
    `Drafting sections… about, favorites, the ${theme.shrineLabel.toLowerCase()}, guestbook, webring.`,
    `Rendering the page… tiling the background, polishing the counter.`,
    `Verifying… 0 broken links, 0 missing GIFs, 100% pure 1998.`,
  ];
}

function sectionCss(theme) {
  return `
    body{background:${theme.bg};background-image:${theme.bgPattern};color:${theme.ink};font-family:"Comic Sans MS","Chalkboard SE","Comic Neue",cursive,sans-serif;margin:0;padding:0 12px 40px}
    a{color:${theme.accent}} a:visited{color:${theme.accent2}}
    h1,h2,h3{color:${theme.accent};text-shadow:2px 2px 0 #000}
    .wrap{max-width:760px;margin:0 auto}
    .banner{text-align:center;border:3px ridge ${theme.accent};padding:10px;margin:14px 0;background:rgba(0,0,0,.45)}
    .nav{text-align:center;font-weight:bold;letter-spacing:1px;margin:8px 0}
    .nav a{margin:0 8px}
    .box{border:3px groove ${theme.accent};background:rgba(0,0,0,.5);padding:12px 16px;margin:16px 0}
    .divider{text-align:center;color:${theme.accent2};letter-spacing:2px;margin:18px 0;white-space:nowrap;overflow:hidden}
    marquee{font-size:28px;font-weight:bold;color:${theme.accent}}
    ul{line-height:1.9}
    .badge{display:inline-block;border:2px solid ${theme.accent2};padding:4px 10px;margin:4px;font-weight:bold;background:#000;color:${theme.accent2}}
    .blink{animation:blink 1s steps(2) infinite}
    @keyframes blink{50%{opacity:0}}
    .ufo{animation:bob 2.4s ease-in-out infinite;display:inline-block}
    @keyframes bob{50%{transform:translateY(-8px)}}
    input,textarea{font-family:inherit;background:#000;color:${theme.ink};border:2px inset ${theme.accent};padding:6px;width:92%}
    button{font-family:inherit;background:${theme.accent};color:#000;border:3px outset #fff;padding:6px 14px;font-weight:bold;cursor:pointer}
    input:focus-visible,textarea:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid ${theme.accent2};outline-offset:2px}
    .counter{font-size:26px;letter-spacing:4px;color:${theme.accent2};font-family:"Courier New",monospace}
    .counter b{background:#000;border:2px solid ${theme.accent2};padding:2px 6px;margin:0 1px}
    .guest{border-bottom:1px dashed ${theme.accent2};padding:6px 0}
    .sparkle{position:fixed;pointer-events:none;color:${theme.accent2};font-size:14px;z-index:9999}
    .music{position:fixed;right:10px;bottom:10px;z-index:9999}
    .tiny{font-size:12px;text-align:center;opacity:.85}
  `;
}

function noteFreq(note) {
  const map = { C3: 131, D3: 147, E3: 165, F3: 175, G3: 196, A3: 220, B3: 247, C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784 };
  return map[note] || 440;
}

export function buildPage({ prompt, themeId = null, seed = null, llmBio = null } = {}) {
  const parsed = parsePrompt(prompt);
  const seedNum = seed == null ? hashSeed(prompt + '|' + (themeId || 'auto')) : seed;
  const rng = mulberry32(seedNum);
  const theme = themeId ? themeById(themeId) : themeForPrompt(parsed, rng);
  const plan = planSteps(parsed, theme);

  const bio = llmBio && llmBio.trim()
    ? llmBio.trim().split(/\n+/).slice(0, 3)
    : pickN(rng, BIO_LINES, 3).map((l) => l.replace('{name}', parsed.name).replace('{topic}', parsed.topic.label));
  const faves = pickN(rng, parsed.topic.faves, 5);
  const shrineLine = pick(rng, parsed.topic.shrine);
  const pageId = 'gc-' + hashSeed(prompt + '|' + theme.id).toString(36);
  const melodyJson = JSON.stringify(theme.melody);
  const freqMap = JSON.stringify(Object.fromEntries(
    ['C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5']
      .map((n) => [n, noteFreq(n)])));

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="geocities" content="${esc(theme.id)}|${esc(parsed.name)}">
<title>${esc(parsed.name)}'s Homepage ${esc(theme.emoji)} ${esc(theme.name)}</title>
<style>${sectionCss(theme)}</style></head>
<body><div class="wrap">
<div class="banner"><span class="ufo">${theme.emoji}</span>
<marquee behavior="alternate" scrollamount="6">✦ ${esc(parsed.name.toUpperCase())}'S HOMEPAGE ✦</marquee>
<div>${esc(theme.greeting)}! Welcome to my corner of ${esc(theme.name)}.</div></div>
<div class="nav"><a href="#about">ABOUT ME</a> | <a href="#faves">FAVORITES</a> | <a href="#shrine">${esc(theme.shrineLabel.toUpperCase())}</a> | <a href="#guestbook">GUESTBOOK</a></div>
<div class="divider">${esc(theme.divider)}</div>
<div class="box" id="about"><h2>👋 About Me</h2>
${bio.map((b) => `<p>${esc(b)}</p>`).join('\n')}
<p><span class="badge blink">UNDER CONSTRUCTION</span> <span class="badge">EST. 1998</span> <span class="badge">100% HANDMADE HTML</span></p></div>
<div class="box" id="faves"><h2>⭐ My Favorite Things</h2>
<ul>${faves.map((f) => `<li>${esc(f)}</li>`).join('\n')}</ul></div>
<div class="box" id="shrine"><h2>${theme.emoji} ${esc(theme.shrineLabel)}</h2>
<p>${esc(shrineLine)} — lovingly maintained since 1998.</p>
<p style="font-size:34px;text-align:center;letter-spacing:8px">${theme.emoji} ✦ ${theme.emoji} ✦ ${theme.emoji}</p></div>
<div class="divider">${esc(theme.divider)}</div>
<div class="box" id="guestbook"><h2>📖 Sign My Guestbook</h2>
<div id="entries"></div>
<p><input id="gb-name" aria-label="Your name" placeholder="Your name" maxlength="40"></p>
<p><textarea id="gb-msg" aria-label="Your guestbook message" rows="3" placeholder="Leave a message from the future..." maxlength="280"></textarea></p>
<p><button id="gb-sign">✍ Sign the guestbook</button></p></div>
<div class="box" id="webring" style="text-align:center"><h2>🕸️ The Webring</h2>
<p>You are visitor of the <b>${esc(theme.name)} Webring</b>.</p>
<p><button data-ring="prev">⬅ Previous site</button> <button data-ring="random">🎲 Random site</button> <button data-ring="next">Next site ➡</button></p>
<p id="ring-msg" class="tiny">Travel the ring. Every stop is another homepage, frozen in time.</p></div>
<div class="box" style="text-align:center"><h2>👀 Visitor Counter</h2>
<div class="counter" id="counter"></div>
<p class="tiny">You are visitor number <span id="count-num">000001</span> since 1998.</p></div>
<p class="tiny">Best viewed with Netscape Navigator 4.0 at 800x600 • Made with GeoCities Reborn • ${esc(theme.name)} • No cookies were harmed (or used) in the making of this page.</p>
</div>
<button class="music" id="music-btn">♪ Play the ${esc(theme.name)} chiptune</button>
<script>
(function(){
var KEY='${pageId}';
var entries=JSON.parse(localStorage.getItem(KEY+'-gb')||'[]');
var count=parseInt(localStorage.getItem(KEY+'-n')||'0',10)+1;
localStorage.setItem(KEY+'-n',String(count));
document.getElementById('count-num').textContent=String(count).padStart(6,'0');
document.getElementById('counter').innerHTML=String(count).padStart(6,'0').split('').map(function(d){return '<b>'+d+'</b>'}).join('');
function renderGb(){
  document.getElementById('entries').innerHTML=entries.slice(-5).reverse().map(function(e){
    return '<div class="guest"><b>'+e.name.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})+'</b> wrote: '+e.msg.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})+'</div>';
  }).join('')||'<p class="tiny">No entries yet. Be the first soul to sign!</p>';
}
renderGb();
document.getElementById('gb-sign').addEventListener('click',function(){
  var n=document.getElementById('gb-name').value.trim()||'Anonymous Traveler';
  var m=document.getElementById('gb-msg').value.trim();
  if(!m){document.getElementById('gb-msg').focus();return;}
  entries.push({name:n,msg:m}); localStorage.setItem(KEY+'-gb',JSON.stringify(entries));
  document.getElementById('gb-msg').value=''; renderGb();
});
var ringNames=['The Haunted Homestead','Pixel Palace','The Dial-Up Diner','Modem Manor','The Floppy Disk Museum','Cyber Cottage'];
document.querySelectorAll('[data-ring]').forEach(function(b){
  b.addEventListener('click',function(){
    var name=ringNames[Math.floor(Math.random()*ringNames.length)];
    document.getElementById('ring-msg').textContent='Warping to "'+name+'"… just kidding — this ring lives in your imagination (and in 1998).';
  });
});
document.addEventListener('mousemove',function(e){
  if(Math.random()<0.35){
    var s=document.createElement('span'); s.className='sparkle'; s.textContent='✦';
    s.style.left=(e.clientX+6)+'px'; s.style.top=(e.clientY+6)+'px';
    document.body.appendChild(s);
    setTimeout(function(){s.style.transition='opacity .8s'; s.style.opacity='0'; setTimeout(function(){s.remove()},800)},60);
  }
});
var melody=${melodyJson}, freqs=${freqMap}, ctx=null, timer=null, step=0;
document.getElementById('music-btn').addEventListener('click',function(){
  if(timer){clearInterval(timer); timer=null; if(ctx) ctx.close(); ctx=null; this.textContent='♪ Play the chiptune'; return;}
  ctx=new (window.AudioContext||window.webkitAudioContext)();
  var btn=this; btn.textContent='■ Stop the music';
  function playStep(){
    var n=melody[step%melody.length]; step++;
    var o=ctx.createOscillator(), g=ctx.createGain();
    o.type='square'; o.frequency.value=freqs[n[0]]||440;
    g.gain.setValueAtTime(0.05,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.42);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.43);
  }
  playStep(); timer=setInterval(playStep,430);
});
})();
</script>
</body></html>`;
  return { html, theme, plan, parsed, pageId };
}
