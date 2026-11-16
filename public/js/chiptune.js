// GeoCities Reborn — portal chiptune player (WebAudio, no audio files).
// Melodies live in generator.js so portal and generated pages agree.
import { THEMES } from './generator.js';

const FREQS = { C3:131,D3:147,E3:165,F3:175,G3:196,A3:220,B3:247,C4:262,D4:294,E4:330,F4:349,G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,F5:698,G5:784 };

let ctx = null, timer = null, step = 0, currentTheme = null;

export function playTheme(themeId) {
  stop();
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  currentTheme = theme;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  step = 0;
  const playStep = () => {
    const [note] = theme.melody[step % theme.melody.length];
    step += 1;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = FREQS[note] || 440;
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.43);
  };
  playStep();
  timer = setInterval(playStep, 430);
  return theme;
}

export function stop() {
  if (timer) { clearInterval(timer); timer = null; }
  if (ctx) { ctx.close().catch(() => {}); ctx = null; }
}

export function isPlaying() { return timer !== null; }
export function playingTheme() { return currentTheme; }
