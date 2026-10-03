// Procedural pixel art: tiles, furniture, characters. 16px tiles.
(function () {
  const T = 16;
  const H = G.util.hash;

  const PAL = {
    carpet: ['#3c4a5c', '#3a475a', '#3e4d60'],
    carpetAP: ['#3d4f47', '#3b4c44', '#405349'],
    tile: ['#c9c4b6', '#c3beb0'],
    wood: ['#7a5236', '#6f4a30', '#83593b'],
    concrete: ['#4a4c50', '#46484c', '#4e5054'],
    wallCap: '#1b2029',
    wallFace: '#a49d8c',
    wallFaceDark: '#8f8877',
    baseboard: '#5a5446',
  };

  function px(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }

  // ------------------------------------------------------------ floors
  function drawFloor(c, m, tx, ty) {
    const ch = m.floor[ty][tx];
    const x = tx * T, y = ty * T;
    const v = H(tx, ty, 7);
    let base = ch;
    if (ch === 'd') base = doorFloor(m, tx, ty);
    switch (base) {
      case '.': {
        px(c, x, y, T, T, PAL.carpet[(v * 3) | 0]);
        for (let i = 0; i < 5; i++) { const a = H(tx, ty, i + 11); px(c, x + ((a * 16) | 0), y + ((H(tx, ty, i + 31) * 16) | 0), 1, 1, '#465670'); }
        break;
      }
      case ':': {
        px(c, x, y, T, T, PAL.carpetAP[(v * 3) | 0]);
        for (let i = 0; i < 5; i++) px(c, x + ((H(tx, ty, i + 2) * 16) | 0), y + ((H(tx, ty, i + 9) * 16) | 0), 1, 1, '#4b6157');
        break;
      }
      case ',': {
        px(c, x, y, T, T, PAL.tile[(tx + ty) & 1]);
        px(c, x, y + T - 1, T, 1, '#aea999'); px(c, x + T - 1, y, 1, T, '#aea999');
        break;
      }
      case '_': {
        px(c, x, y, T, T, PAL.wood[0]);
        for (let r = 0; r < 4; r++) {
          const off = ((H(tx, ty + r, 3) * 16) | 0);
          px(c, x, y + r * 4, T, 4, PAL.wood[(r + tx) % 3]);
          px(c, x, y + r * 4 + 3, T, 1, '#5e3f28');
          px(c, x + off, y + r * 4, 1, 3, '#5e3f28');
        }
        break;
      }
      case '=': {
        px(c, x, y, T, T, PAL.concrete[(v * 3) | 0]);
        for (let i = 0; i < 6; i++) px(c, x + ((H(tx, ty, i) * 16) | 0), y + ((H(tx, ty, i + 5) * 16) | 0), 1, 1, i & 1 ? '#3d3f43' : '#55575b');
        if (m.name === 'garage' && (ty === 4 || ty === 13) && tx % 3 === 1) px(c, x, y, 1, T, '#c9c27a');
        if (m.name === 'garage' && ty >= 6 && ty <= 11 && tx % 4 === 0 && (ty === 9)) px(c, x + 2, y + 7, 10, 2, '#a9a36a');
        break;
      }
      default: px(c, x, y, T, T, '#222');
    }
    if (ch === 'd') {
      // door threshold: dark strip and frame posts
      const vertical = m.isWall(tx - 1, ty) && m.isWall(tx + 1, ty);
      if (vertical) { px(c, x, y, 2, T, '#2b2b2b'); px(c, x + T - 2, y, 2, T, '#2b2b2b'); px(c, x + 2, y + 6, T - 4, 4, 'rgba(0,0,0,.18)'); }
      else { px(c, x, y, T, 2, '#2b2b2b'); px(c, x, y + T - 2, T, 2, '#2b2b2b'); }
    }
  }
  function doorFloor(m, tx, ty) {
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const f = m.inside(tx + dx, ty + dy) ? m.floor[ty + dy][tx + dx] : null;
      if (f && f !== '#' && f !== 'W' && f !== 'd' && f !== 'g') return f === ',' || f === '=' || f === '_' || f === ':' ? '.' : f;
    }
    return '.';
  }

  // ------------------------------------------------------------ walls
  function drawWall(c, m, tx, ty) {
    const x = tx * T, y = ty * T;
    const ch = m.floor[ty][tx];
    const belowOpen = m.inside(tx, ty + 1) && !m.isWall(tx, ty + 1) && m.floor[ty + 1][tx] !== 'g';
    if (ch === 'g') {
      // glass partition
      const belowFloor = m.inside(tx, ty + 1) && m.floor[ty + 1][tx] !== 'g' && m.floor[ty + 1][tx] !== '#';
      px(c, x, y, T, T, '#3d4f47');
      px(c, x, y + 2, T, T - 4, 'rgba(160,210,230,.45)');
      px(c, x, y + 2, T, 1, '#cfe6ef');
      px(c, x + 3, y + 4, 1, 6, 'rgba(255,255,255,.6)');
      px(c, x, y + T - 2, T, 2, '#6a7a80');
      if (!belowFloor) px(c, x + 7, y, 2, T, '#8fa2aa');
      return;
    }
    px(c, x, y, T, T, PAL.wallCap);
    if (belowOpen) {
      if (ch === 'W') {
        px(c, x, y + 3, T, 13, '#6f7f92');
        px(c, x + 1, y + 4, T - 2, 9, '#9fc4dd');
        px(c, x + 1, y + 4, T - 2, 3, '#c4ddeb');
        px(c, x + ((tx & 1) ? 0 : T - 1), y + 3, 1, 13, '#4d5a6a');
        px(c, x, y + 13, T, 3, '#5a5446');
      } else {
        px(c, x, y + 3, T, 13, PAL.wallFace);
        px(c, x, y + 3, T, 1, '#bdb6a4');
        if (H(tx, ty, 1) < 0.15) px(c, x + 5, y + 7, 1, 1, PAL.wallFaceDark);
        px(c, x, y + 13, T, 3, PAL.baseboard);
      }
    } else {
      px(c, x + 1, y + 1, T - 2, T - 2, '#232a35');
    }
  }

  // ------------------------------------------------------------ objects
  function drawObj(c, m, tx, ty, ch) {
    const x = tx * T, y = ty * T;
    const same = (dx, dy, set) => m.inside(tx + dx, ty + dy) && set.includes(m.obj[ty + dy][tx + dx]);
    switch (ch) {
      case 'D': case 'C': case 'r': {
        const set = ch === 'r' ? ['r'] : ['D', 'C'];
        const top = ch === 'r' ? '#d8d2c2' : '#8b6a4a';
        const edge = ch === 'r' ? '#8c8676' : '#5b432d';
        const l = same(-1, 0, set) ? 0 : 1, r = same(1, 0, set) ? 0 : 1;
        px(c, x + l, y + 3, T - l - r, 9, top);
        px(c, x + l, y + 3, T - l - r, 1, ch === 'r' ? '#efe9da' : '#a07f5c');
        px(c, x + l, y + 12, T - l - r, 3, edge);
        if (ch === 'C') {
          px(c, x + 3, y - 2, 10, 8, '#1a1d22');
          px(c, x + 4, y - 1, 8, 6, '#2e6b8f');
          px(c, x + 7, y + 6, 2, 2, '#1a1d22');
          px(c, x + 4, y + 9, 8, 2, '#ccc8bc');
        } else if (ch === 'D' && H(tx, ty, 4) < 0.5) {
          px(c, x + 3, y + 5, 5, 4, '#f2efe6'); px(c, x + 4, y + 6, 3, 1, '#9aa');
          if (H(tx, ty, 6) < 0.5) px(c, x + 10, y + 5, 3, 3, '#c94b3c');
        }
        if (ch === 'r' && tx === 19) { px(c, x + 5, y + 4, 6, 4, '#2a2a2a'); px(c, x + 6, y + 5, 4, 2, '#5fb38a'); }
        break;
      }
      case 'T': {
        const set = ['T'];
        const l = same(-1, 0, set) ? 0 : 1, r = same(1, 0, set) ? 0 : 1, t = same(0, -1, set) ? 0 : 2, b = same(0, 1, set) ? 0 : 3;
        px(c, x + l, y + t, T - l - r, T - t - b, '#5e3c26');
        px(c, x + l + (l ? 1 : 0), y + t + (t ? 1 : 0), T - l - r - (l ? 1 : 0) - (r ? 1 : 0), T - t - b - (t ? 1 : 0), '#6d4a30');
        if (!b) break;
        px(c, x + l, y + T - b, T - l - r, 2, '#3d2717');
        if (H(tx, ty, 2) < 0.3) { px(c, x + 4, y + 5, 6, 5, '#f4f1e8'); px(c, x + 5, y + 6, 4, 1, '#888'); }
        break;
      }
      case 'h': {
        px(c, x + 4, y + 4, 8, 8, '#20242b');
        px(c, x + 5, y + 5, 6, 6, '#2c323c');
        px(c, x + 4, y + 12, 1, 2, '#111'); px(c, x + 11, y + 12, 1, 2, '#111');
        break;
      }
      case 'F': {
        px(c, x + 1, y - 2, 14, 17, '#7d8590');
        px(c, x + 1, y - 2, 14, 2, '#9aa2ad');
        for (let i = 0; i < 3; i++) { px(c, x + 2, y + 1 + i * 5, 12, 4, '#6b737d'); px(c, x + 6, y + 2 + i * 5, 4, 1, '#c9ced4'); }
        break;
      }
      case 'B': {
        px(c, x, y - 4, T, 19, '#4e3524');
        for (let s = 0; s < 3; s++) {
          px(c, x + 1, y - 3 + s * 6, T - 2, 5, '#2e2016');
          for (let b = 0; b < 5; b++) {
            const hh = 3 + ((H(tx * 7 + b, ty + s, 5) * 2) | 0);
            const cols = ['#8a2a2a', '#2a4a7a', '#c9a24a', '#3a6a4a', '#e0dccf', '#5a3a6a'];
            px(c, x + 2 + b * 2.5, y + 2 - hh + s * 6, 2, hh, cols[(H(tx + b, ty, s + 2) * cols.length) | 0]);
          }
        }
        break;
      }
      case 'P': {
        px(c, x + 5, y + 10, 6, 5, '#8a4f2d'); px(c, x + 4, y + 10, 8, 2, '#a5653f');
        px(c, x + 3, y + 2, 10, 9, '#2f6b3a'); px(c, x + 5, y, 6, 4, '#3b8247'); px(c, x + 2, y + 5, 3, 4, '#3b8247'); px(c, x + 11, y + 4, 3, 4, '#28592f');
        px(c, x + 6, y + 3, 2, 2, '#55a463');
        break;
      }
      case 'S': {
        px(c, x + 1, y - 4, 14, 19, '#121418');
        px(c, x + 2, y - 3, 12, 17, '#1d2026');
        for (let i = 0; i < 6; i++) px(c, x + 3, y - 2 + i * 3, 10, 2, '#262a31');
        break;
      }
      case 'K': {
        px(c, x, y + 1, T, 14, '#b9b3a5'); px(c, x, y + 1, T, 3, '#e3ded2'); px(c, x, y + 13, T, 2, '#7f7a6e');
        px(c, x + 7, y + 6, 1, 6, '#7f7a6e');
        break;
      }
      case 'M': {
        px(c, x, y + 1, T, 14, '#b9b3a5'); px(c, x, y + 1, T, 3, '#e3ded2');
        px(c, x + 3, y - 3, 10, 12, '#2a2a2e'); px(c, x + 5, y - 1, 6, 3, '#d04a3a'); px(c, x + 6, y + 5, 4, 3, '#f0ece0');
        break;
      }
      case 'R': {
        px(c, x + 1, y - 6, 14, 21, '#e9ecef'); px(c, x + 1, y - 6, 14, 1, '#fff'); px(c, x + 1, y + 2, 14, 1, '#b8bec6');
        px(c, x + 12, y - 3, 1, 4, '#9aa3ad'); px(c, x + 12, y + 5, 1, 6, '#9aa3ad');
        px(c, x + 3, y - 4, 3, 3, '#e8b84a');
        break;
      }
      case 'w': {
        px(c, x + 4, y + 4, 8, 11, '#e9ecef'); px(c, x + 5, y - 3, 6, 8, '#7fb6d9'); px(c, x + 6, y - 2, 2, 5, '#b4d8ee');
        px(c, x + 6, y + 8, 4, 1, '#3a6aa0');
        break;
      }
      case 'c': {
        const vert = same(0, -1, ['c']) || same(0, 1, ['c']);
        if (vert) { px(c, x + 2, y, 12, T, '#4a3b5c'); px(c, x + 10, y, 4, T, '#3a2e4a'); px(c, x + 2, y + (same(0, -1, ['c']) ? 0 : 1), 12, 1, '#5d4c72'); }
        else { px(c, x, y + 2, T, 12, '#4a3b5c'); px(c, x, y + 2, T, 4, '#3a2e4a'); }
        break;
      }
      case 'X': {
        px(c, x + 3, y + 2, 10, 13, '#2a2d33'); px(c, x + 3, y + 2, 10, 3, '#4a4f58'); px(c, x + 5, y + 3, 6, 1, '#111');
        px(c, x + 4, y + 8, 8, 6, '#3a3f48'); px(c, x + 5, y + 9, 1, 4, '#ddd'); px(c, x + 8, y + 10, 1, 3, '#ddd');
        break;
      }
      case 'Y': {
        px(c, x, y - 2, T, 17, '#d9d6cf'); px(c, x, y - 2, T, 3, '#efece6'); px(c, x + 2, y + 2, 12, 2, '#4a4f58');
        px(c, x + 11, y + 6, 3, 2, '#5fb38a'); px(c, x + 2, y + 10, 12, 1, '#9a978f');
        break;
      }
      case 'E': {
        // elevator doors on wall face
        px(c, x, y + 2, T, 14, '#5d646e');
        px(c, x + 1, y + 3, T - 2, 13, '#9aa3ad');
        px(c, x + 7, y + 3, 2, 13, '#5d646e');
        px(c, x + 2, y + 4, 2, 10, '#b9c1ca');
        break;
      }
      case 'Q': {
        px(c, x + 1, y - 6, 14, 21, '#7a1f2b'); px(c, x + 3, y - 4, 8, 13, '#1b2430');
        for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) px(c, x + 4 + j * 4, y - 3 + i * 3, 2, 2, ['#e0b040', '#4aa060', '#d04a3a', '#3a7ad0'][(i + j) % 4]);
        px(c, x + 12, y - 2, 2, 4, '#d8d2c2');
        break;
      }
      case 'O': {
        px(c, x + 1, y - 10, 14, 25, '#8a8c90'); px(c, x + 1, y - 10, 14, 2, '#a9abb0'); px(c, x + 12, y - 8, 3, 23, '#6f7175');
        const l = m.pillarLabels && m.pillarLabels[tx + ',' + ty];
        if (l) {
          px(c, x + 3, y - 4, 9, 9, '#d8b04a');
          drawGlyph(c, l, x + 5, y - 3, '#1a1408');
        }
        px(c, x + 1, y + 8, 14, 3, '#d8b04a'); px(c, x + 1, y + 9, 14, 1, '#1a1408');
        break;
      }
      case 'L': {
        px(c, x, y + 4, T, 10, '#0c0f14');
        px(c, x + 1, y + 5, T - 2, 8, '#1d3a5a');
        if (tx % 2 === 0) { px(c, x + 3, y + 10, 2, 2, '#5fb38a'); px(c, x + 6, y + 8, 2, 4, '#5fb38a'); px(c, x + 9, y + 7, 2, 5, '#d8b04a'); px(c, x + 12, y + 9, 2, 3, '#5fb38a'); }
        else { px(c, x + 2, y + 7, 10, 1, '#c9d6e3'); px(c, x + 2, y + 9, 7, 1, '#c9d6e3'); }
        break;
      }
      case 'A': {
        if (m.name === 'garage') { px(c, x + 1, y + 4, 14, 8, '#d8b04a'); drawGlyph(c, 'P', x + 2, y + 5, '#1a1408'); drawGlyph(c, '2', x + 9, y + 5, '#1a1408'); break; }
        if (m.interact[tx + ',' + ty] === 'logo') {
          px(c, x + 2, y + 5, 12, 8, '#1f3a2e'); px(c, x + 4, y + 7, 8, 1, '#d8b04a'); px(c, x + 4, y + 9, 5, 1, '#eef4ea');
          break;
        }
        px(c, x + 2, y + 4, 12, 9, '#c9a24a'); px(c, x + 3, y + 5, 10, 7, '#2a3a5a'); px(c, x + 4, y + 9, 8, 3, '#3a5a4a'); px(c, x + 9, y + 6, 2, 2, '#e8d48a');
        break;
      }
      case 'Z': {
        px(c, x, y + 4, T, 10, '#eceff2'); px(c, x, y + 4, T, 1, '#9aa3ad'); px(c, x, y + 13, T, 1, '#9aa3ad');
        px(c, x + 2, y + 7, 6, 1, '#3a6ad0'); px(c, x + 3, y + 9, 9, 1, '#d04a3a'); px(c, x + 9, y + 6, 4, 3, '#5fb38a');
        break;
      }
    }
  }

  // 3x5 pixel glyphs for tiny signage
  const GLYPHS = { A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', P: '110101110100100', 2: '110001010100111' };
  function drawGlyph(c, ch, x, y, col) {
    const g = GLYPHS[ch]; if (!g) return;
    for (let i = 0; i < 15; i++) if (g[i] === '1') px(c, x + (i % 3), y + ((i / 3) | 0), 1, 1, col);
  }

  function drawCar(c, p, t) {
    const x = p.x * T, y = p.y * T, w = p.w * T, h = p.h * T;
    if (p.facing === 'right') {
      px(c, x + 3, y + 4, w - 4, h - 4, 'rgba(0,0,0,.35)');
      px(c, x + 2, y + 2, w - 4, h - 4, p.color);
      px(c, x + w - 20, y + 5, 7, h - 10, '#1c2a36');
      px(c, x + 8, y + 5, 6, h - 10, '#1c2a36');
      px(c, x + w - 4, y + 4, 2, 4, p.lightsOn ? '#fff7c0' : '#d8d2b0');
      px(c, x + w - 4, y + h - 8, 2, 4, p.lightsOn ? '#fff7c0' : '#d8d2b0');
      px(c, x + 2, y + 4, 2, 3, '#b8312f'); px(c, x + 2, y + h - 7, 2, 3, '#b8312f');
      return;
    }
    px(c, x + 3, y + 4, w - 4, h - 4, 'rgba(0,0,0,.35)');
    px(c, x + 2, y + 2, w - 4, h - 4, p.color);
    const shade = 'rgba(0,0,0,.25)';
    px(c, x + 2, y + 2, 2, h - 4, shade);
    const front = p.facing === 'down' ? y + h - 12 : y + 4;
    const windshield = p.facing === 'down' ? y + h - 20 : y + 10;
    px(c, x + 5, windshield, w - 10, 8, '#1c2a36');
    px(c, x + 5, p.facing === 'down' ? y + 8 : y + h - 16, w - 10, 6, '#1c2a36');
    px(c, x + 4, front + (p.facing === 'down' ? 6 : -2), 4, 2, p.lightsOn ? '#fff7c0' : '#d8d2b0');
    px(c, x + w - 8, front + (p.facing === 'down' ? 6 : -2), 4, 2, p.lightsOn ? '#fff7c0' : '#d8d2b0');
  }

  // ------------------------------------------------------------ static map prerender
  function prerender(m) {
    const cv = document.createElement('canvas');
    cv.width = m.W * T; cv.height = m.H * T;
    const c = cv.getContext('2d');
    for (let ty = 0; ty < m.H; ty++) for (let tx = 0; tx < m.W; tx++) {
      const f = m.floor[ty][tx];
      if (f === '#' || f === 'W' || f === 'g') drawWall(c, m, tx, ty); else drawFloor(c, m, tx, ty);
    }
    // objects drawn top-to-bottom so tall ones overlap the row above correctly
    for (let ty = 0; ty < m.H; ty++) for (let tx = 0; tx < m.W; tx++) {
      const o = m.obj[ty][tx];
      if (o) drawObj(c, m, tx, ty, o);
    }
    return cv;
  }

  // dynamic bits: server LEDs, monitor glow
  function drawDynamic(c, m, x0, y0, x1, y1, time) {
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (!m.inside(tx, ty)) continue;
      const o = m.obj[ty][tx];
      if (o === 'S') {
        for (let i = 0; i < 6; i++) {
          const on = H(tx, ty, i + ((time * 3 + H(tx, ty, i) * 10) | 0)) > 0.4;
          px(c, tx * T + 11, ty * T - 2 + i * 3, 1, 1, on ? (i % 3 ? '#5fe08a' : '#e0b040') : '#2a3a2a');
        }
      } else if (o === 'C' && ((time * 2 + H(tx, ty, 1) * 9) | 0) % 9 === 0) {
        px(c, tx * T + 5, ty * T + 0, 6, 1, 'rgba(255,255,255,.4)');
      }
    }
  }

  // ------------------------------------------------------------ characters
  // look: { skin, hair, hairStyle: 'short'|'long'|'bald'|'bun'|'puff'|'bob'|'cap', shirt, pants, tie, jacket }
  function drawChar(c, look, x, y, dir, frame, opts = {}) {
    const bob = frame % 2 === 1 ? 1 : 0;
    // shadow
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x + 8, y + 15, 5, 2, 0, 0, Math.PI * 2); c.fill();
    // legs
    const legL = frame === 1 ? -1 : frame === 3 ? 1 : 0;
    if (dir === 'left' || dir === 'right') {
      px(c, x + 6 + legL, y + 11, 2, 4, look.pants); px(c, x + 8 - legL, y + 11, 2, 4, look.pants);
      px(c, x + 6 + legL, y + 14, 2, 1, '#151515'); px(c, x + 8 - legL, y + 14, 2, 1, '#151515');
    } else {
      px(c, x + 5, y + 11, 2, 4 - (frame === 1 ? 1 : 0), look.pants); px(c, x + 9, y + 11, 2, 4 - (frame === 3 ? 1 : 0), look.pants);
      px(c, x + 5, y + 14 - (frame === 1 ? 1 : 0), 2, 1, '#151515'); px(c, x + 9, y + 14 - (frame === 3 ? 1 : 0), 2, 1, '#151515');
    }
    const by = y - bob;
    // torso
    const coat = look.jacket || look.shirt;
    px(c, x + 4, by + 6, 8, 6, coat);
    if (look.jacket && dir === 'down') { px(c, x + 7, by + 6, 2, 5, look.shirt); }
    if (look.tie && dir === 'down') px(c, x + 7, by + 7, 2, 4, look.tie);
    // arms
    const swing = frame === 1 ? 1 : frame === 3 ? -1 : 0;
    if (dir === 'left' || dir === 'right') {
      px(c, x + 7, by + 7 + swing, 2, 4, coat); px(c, x + 7, by + 11 + swing, 2, 1, look.skin);
    } else {
      px(c, x + 3, by + 7 + swing, 1, 4, coat); px(c, x + 12, by + 7 - swing, 1, 4, coat);
      px(c, x + 3, by + 11 + swing, 1, 1, look.skin); px(c, x + 12, by + 11 - swing, 1, 1, look.skin);
    }
    // head
    px(c, x + 4, by, 8, 7, look.skin);
    drawHair(c, look, x, by, dir);
    // face
    if (dir === 'down') { px(c, x + 5, by + 3, 1, 2, '#1a1a1a'); px(c, x + 10, by + 3, 1, 2, '#1a1a1a'); if (look.glasses) { px(c, x + 4, by + 3, 3, 1, look.glasses); px(c, x + 9, by + 3, 3, 1, look.glasses); } }
    else if (dir === 'left') { px(c, x + 5, by + 3, 1, 2, '#1a1a1a'); if (look.glasses) px(c, x + 4, by + 3, 3, 1, look.glasses); }
    else if (dir === 'right') { px(c, x + 10, by + 3, 1, 2, '#1a1a1a'); if (look.glasses) px(c, x + 9, by + 3, 3, 1, look.glasses); }
    if (opts.sweat) { px(c, x + 13, by + 1, 1, 2, '#9fd4ff'); }
  }

  function drawHair(c, look, x, y, dir) {
    const h = look.hair;
    switch (look.hairStyle) {
      case 'bald':
        px(c, x + 4, y + 2, 1, 3, h); px(c, x + 11, y + 2, 1, 3, h);
        if (dir === 'up') px(c, x + 4, y + 3, 8, 2, h);
        break;
      case 'long':
        px(c, x + 3, y - 1, 10, 3, h); px(c, x + 3, y, 2, 9, h); px(c, x + 11, y, 2, 9, h);
        if (dir === 'up') px(c, x + 3, y, 10, 9, h);
        if (dir === 'left') px(c, x + 9, y, 4, 9, h);
        if (dir === 'right') px(c, x + 3, y, 4, 9, h);
        break;
      case 'bob':
        px(c, x + 3, y - 1, 10, 3, h); px(c, x + 3, y, 2, 6, h); px(c, x + 11, y, 2, 6, h);
        if (dir === 'up') px(c, x + 3, y, 10, 6, h);
        break;
      case 'bun':
        px(c, x + 4, y - 1, 8, 3, h); px(c, x + 6, y - 3, 4, 2, h); px(c, x + 4, y, 1, 3, h); px(c, x + 11, y, 1, 3, h);
        if (dir === 'up') px(c, x + 4, y, 8, 5, h);
        break;
      case 'puff':
        px(c, x + 2, y - 3, 12, 5, h); px(c, x + 2, y, 2, 4, h); px(c, x + 12, y, 2, 4, h);
        if (dir === 'up') px(c, x + 2, y, 12, 6, h);
        break;
      case 'cap':
        px(c, x + 3, y - 1, 10, 3, h);
        if (dir === 'down') px(c, x + 3, y + 2, 10, 1, '#111');
        if (dir === 'left') px(c, x + 1, y + 1, 4, 1, '#111');
        if (dir === 'right') px(c, x + 11, y + 1, 4, 1, '#111');
        px(c, x + 7, y, 2, 1, '#d8b04a');
        break;
      case 'slick':
        px(c, x + 4, y - 1, 8, 3, h); px(c, x + 4, y, 1, 3, h); px(c, x + 11, y, 1, 3, h);
        px(c, x + 5, y - 1, 3, 1, look.hair2 || h);
        if (dir === 'up') px(c, x + 4, y, 8, 5, h);
        break;
      default: // short
        px(c, x + 4, y - 1, 8, 3, h); px(c, x + 4, y + 1, 1, 2, h); px(c, x + 11, y + 1, 1, 2, h);
        if (dir === 'up') px(c, x + 4, y, 8, 5, h);
        if (dir === 'left') px(c, x + 9, y, 3, 4, h);
        if (dir === 'right') px(c, x + 4, y, 3, 4, h);
    }
  }

  // Portrait: zoomed head-and-shoulders from the sprite (32x32 canvas).
  function drawPortrait(cv, look) {
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, cv.width, cv.height);
    if (!look) return;
    const tmp = document.createElement('canvas'); tmp.width = 16; tmp.height = 16;
    const tc = tmp.getContext('2d');
    drawChar(tc, look, 0, 1, 'down', 0);
    c.fillStyle = '#1a2130'; c.fillRect(0, 0, cv.width, cv.height);
    c.drawImage(tmp, 2, 0, 12, 12, 1, 4, 30, 30);
  }

  G.render = { T, prerender, drawDynamic, drawChar, drawPortrait, drawCar, px };
})();
