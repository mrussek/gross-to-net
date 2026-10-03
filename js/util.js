// Shared namespace + small helpers (no modules so index.html works from file://).
window.G = window.G || {};

G.util = {
  // Deterministic hash -> [0,1) for per-tile texture variation.
  hash(x, y, s = 0) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  },
  rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  sleep(ms) { return new Promise(r => setTimeout(r, ms)); },
  fmt(n, dp = 0) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }); },
  // Accounting-style: negatives in parentheses.
  acct(n) { return n < 0 ? '(' + G.util.fmt(-n) + ')' : G.util.fmt(n); },
  money(n, dp = 0) { return '$' + G.util.fmt(n, dp); },
  // Parse user-entered numbers: "$8,450", "(8,450)", "8.45m", "8450k".
  parseNum(s) {
    if (s == null) return NaN;
    let t = String(s).trim().toLowerCase().replace(/[$,\s]/g, '');
    let neg = false;
    if (/^\(.*\)$/.test(t)) { neg = true; t = t.slice(1, -1); }
    if (t.startsWith('-')) { neg = !neg; t = t.slice(1); }
    let mult = 1;
    if (t.endsWith('m') || t.endsWith('mm')) { mult = 1e6; t = t.replace(/m+$/, ''); }
    else if (t.endsWith('k')) { mult = 1e3; t = t.slice(0, -1); }
    if (!/^\d*\.?\d+$/.test(t)) return NaN;
    const v = parseFloat(t) * mult;
    return neg ? -v : v;
  },
  esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
  // Minimal markup for story text: *emphasis*.
  rich(s) { return G.util.esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>'); },
  el(tag, attrs = {}, html) {
    const e = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    return e;
  },
  store: {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode etc. */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  },
};

// Tiny WebAudio synth for blips, phone buzzes, stings.
G.audio = {
  ctx: null,
  muted: false,
  init() {
    if (this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
  },
  tone(freq, dur, { type = 'square', vol = 0.04, slide = 0, delay = 0 } = {}) {
    if (this.muted || !this.ctx) return;
    const c = this.ctx, t0 = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.linearRampToValueAtTime(freq + slide, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  },
  blip() { this.tone(520 + Math.random() * 80, 0.035, { vol: 0.015 }); },
  select() { this.tone(880, 0.05, { vol: 0.03 }); },
  buzz() {
    for (let i = 0; i < 2; i++) this.tone(110, 0.16, { type: 'sawtooth', vol: 0.035, delay: i * 0.24 });
  },
  success() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.12, { type: 'triangle', vol: 0.05, delay: i * 0.08 })); },
  fail() { this.tone(220, 0.25, { type: 'sawtooth', vol: 0.04, slide: -90 }); },
  sting() { [196, 185, 174].forEach((f, i) => this.tone(f, 0.4, { type: 'sawtooth', vol: 0.035, delay: i * 0.18 })); },
  objection() { this.tone(330, 0.08, { vol: 0.06 }); this.tone(660, 0.25, { vol: 0.06, delay: 0.08 }); },
  door() { this.tone(180, 0.08, { type: 'triangle', vol: 0.05 }); },
  ding() { this.tone(1318, 0.5, { type: 'sine', vol: 0.05 }); this.tone(1046, 0.6, { type: 'sine', vol: 0.05, delay: 0.25 }); },
};
