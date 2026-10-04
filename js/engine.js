// World simulation: rendering loop, input, grid movement, NPC actors, camera, lighting.
(function () {
  const T = G.render.T;
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const canvas = document.getElementById('screen');
  const ctx = canvas.getContext('2d');

  const E = {
    actors: [],
    mapCanvas: {},
    held: [],          // direction keys currently held, most recent last
    run: false,
    scripted: 0,       // >0 while a story script is executing
    player: { x: 0, y: 0, fx: 0, fy: 0, dir: 'down', moving: false, t: 0, frame: 0, sx: 0, sy: 0 },
    time: 0,
    viewW: 480, viewH: 270,
    shake: 0,
  };

  E.map = () => G.maps[G.state.map];

  E.resize = function () {
    const W = window.innerWidth, H = window.innerHeight;
    // Desktop: crisp integer zoom. Touch: fit ~17 tiles across the short side so phones aren't cramped.
    const s = G.touch
      ? Math.max(1, Math.min(W, H) / (17 * T))
      : Math.max(2, Math.floor(Math.min(W / 400, H / 240)));
    E.viewW = Math.ceil(W / s); E.viewH = Math.ceil(H / s);
    canvas.width = E.viewW; canvas.height = E.viewH;
    canvas.style.width = E.viewW * s + 'px'; canvas.style.height = E.viewH * s + 'px';
    ctx.imageSmoothingEnabled = false;
  };

  E.init = function () {
    for (const k in G.maps) E.mapCanvas[k] = G.render.prerender(G.maps[k]);
    E.resize();
    window.addEventListener('resize', E.resize);
    let last = performance.now();
    const loop = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      E.time += dt;
      if (G.state) { E.update(dt); E.draw(); }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  // ---------------------------------------------------------------- placement
  E.placePlayer = function (map, x, y, dir = 'down') {
    G.state.map = map; G.state.px = x; G.state.py = y; G.state.dir = dir;
    const p = E.player;
    Object.assign(p, { x, y, fx: x, fy: y, dir, moving: false, t: 0 });
    E.refreshActors();
    G.ui.updateHud();
  };

  E.refreshActors = function () {
    const S = G.state;
    const keep = {};
    for (const a of E.actors) keep[a.id] = a;
    E.actors = [];
    for (const id in G.cast) {
      if (id === 'you') continue;
      const pos = G.story.npcPos(id);
      if (!pos || pos.map !== S.map) continue;
      const prev = keep[id];
      const a = { id, look: G.cast[id].look, x: pos.x, y: pos.y, fx: pos.x, fy: pos.y, dir: pos.dir || 'down', homeDir: pos.dir || 'down', path: [], t: 0, frame: 0, idle: Math.random() * 4, sweat: pos.sweat };
      if (prev && prev.x === pos.x && prev.y === pos.y) a.dir = prev.dir;
      E.actors.push(a);
    }
  };

  E.actorAt = (x, y) => E.actors.find(a => a.x === x && a.y === y || (a.path.length && a.nx === x && a.ny === y));
  E.getActor = id => E.actors.find(a => a.id === id);

  E.blocked = function (x, y) {
    const m = E.map();
    if (m.solid(x, y)) return true;
    if (E.actorAt(x, y)) return true;
    return false;
  };

  // ---------------------------------------------------------------- scripted helpers
  // Run a story coroutine with player control locked.
  E.script = async function (fn) {
    E.scripted++;
    try { await fn(); }
    catch (err) { console.error(err); }
    finally { E.scripted--; G.ui.updateHud(); G.save(); }
  };

  E.walkActor = function (id, steps, speed = 4) {
    const a = E.getActor(id);
    if (!a) return Promise.resolve();
    return new Promise(res => { a.path = steps.slice(); a.speed = speed; a.onDone = res; a.t = 0; });
  };
  E.spawnActor = function (id, x, y, dir = 'down') {
    let a = E.getActor(id);
    if (!a) { a = { id, look: G.cast[id].look, path: [], t: 0, frame: 0, idle: 99 }; E.actors.push(a); }
    Object.assign(a, { x, y, fx: x, fy: y, dir, homeDir: dir, path: [] });
    return a;
  };
  E.removeActor = id => { E.actors = E.actors.filter(a => a.id !== id); };
  E.face = (id, dir) => { const a = id === 'you' ? E.player : E.getActor(id); if (a) { a.dir = dir; if (id !== 'you') a.homeDir = dir; else G.state.dir = dir; } };
  E.faceToward = function (id, x, y) {
    const a = id === 'you' ? E.player : E.getActor(id);
    if (!a) return;
    const dx = x - a.x, dy = y - a.y;
    const d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    E.face(id, d);
  };
  E.walkPlayer = function (steps, speed = 4) {
    const p = E.player;
    return new Promise(res => { p.path = steps.slice(); p.speed = speed; p.onDone = res; });
  };
  E.shakeScreen = (amt = 4) => { E.shake = amt; };

  // ---------------------------------------------------------------- update
  function stepToward(ent, dt, speed) {
    ent.t += dt * speed;
    const k = Math.min(1, ent.t);
    ent.fx = ent.x + (ent.nx - ent.x) * k;
    ent.fy = ent.y + (ent.ny - ent.y) * k;
    ent.frame = ent.t < 0.5 ? 1 : 3;
    if (ent.t >= 1) {
      ent.x = ent.nx; ent.y = ent.ny; ent.fx = ent.x; ent.fy = ent.y; ent.t = 0; ent.moving = false;
      ent.frame = 0;
      return true;
    }
    return false;
  }

  function advancePath(ent, dt) {
    if (!ent.moving) {
      const d = ent.path.shift();
      if (!d) { const cb = ent.onDone; ent.onDone = null; ent.path = []; cb && cb(); return; }
      if (d.length === 1 || typeof d === 'string') {
        // turn only, e.g. 'left'
        const dir = typeof d === 'string' ? d : d[0];
        if (!DIRS[dir]) return;
        ent.dir = dir; return;
      }
      const [dir, n] = d;
      ent.dir = dir;
      const [dx, dy] = DIRS[dir];
      ent.nx = ent.x + dx; ent.ny = ent.y + dy;
      ent.moving = true; ent.t = 0;
      if (n > 1) ent.path.unshift([dir, n - 1]);
    }
    if (stepToward(ent, dt, ent.speed || 4)) {
      if (ent === E.player) { G.state.px = ent.x; G.state.py = ent.y; }
    }
  }

  E.update = function (dt) {
    const p = E.player;
    const S = G.state;
    // Actors
    for (const a of E.actors) {
      if (a.path && (a.path.length || a.moving)) { advancePath(a, dt); continue; }
      if (a.onDone) { const cb = a.onDone; a.onDone = null; cb(); }
      // idle glance
      a.idle -= dt;
      if (a.idle <= 0 && !E.scripted && !G.ui.blocking()) {
        a.idle = 3 + Math.random() * 5;
        const opts = ['down', 'left', 'right', 'up'];
        a.dir = Math.random() < 0.6 ? a.homeDir : opts[(Math.random() * 4) | 0];
      }
    }
    // Player scripted walk
    if (p.path && (p.path.length || (p.moving && p.onDone))) { advancePath(p, dt); return; }
    if (p.onDone) { const cb = p.onDone; p.onDone = null; cb(); }

    if (p.moving) {
      if (stepToward(p, dt, E.run ? 7.5 : E.autoPath ? 6 : 4.6)) {
        S.px = p.x; S.py = p.y;
        G.story.onStep(p.x, p.y);
      }
      return;
    }
    if (E.scripted || G.ui.blocking()) { E.autoPath = null; return; }
    let dir = E.held[E.held.length - 1];
    if (dir) E.autoPath = null;
    else if (E.autoPath) {
      // tap-to-move: follow the planned route, then face and use the target
      if (!E.autoPath.length) {
        const goal = E.autoGoal;
        E.autoPath = null; E.autoGoal = null;
        if (goal && goal.face) { p.dir = goal.face; S.dir = goal.face; if (goal.interact) E.interact(); }
        return;
      }
      dir = E.autoPath[0];
      const [dx, dy] = DIRS[dir];
      if (E.blocked(p.x + dx, p.y + dy)) { E.autoPath = null; E.autoGoal = null; return; }
      E.autoPath.shift();
    }
    if (dir) {
      p.dir = dir; S.dir = dir;
      const [dx, dy] = DIRS[dir];
      if (!E.blocked(p.x + dx, p.y + dy)) {
        p.nx = p.x + dx; p.ny = p.y + dy; p.moving = true; p.t = 0;
      }
    }
  };

  // ---------------------------------------------------------------- interaction
  E.interact = function () {
    if (E.scripted || G.ui.blocking() || E.player.moving) return;
    const p = E.player, m = E.map();
    const [dx, dy] = DIRS[p.dir];
    const tx = p.x + dx, ty = p.y + dy;
    const target = E.findTarget(tx, ty, dx, dy);
    if (!target) return;
    if (target.actor) {
      const a = target.actor;
      E.faceToward(a.id, p.x, p.y);
      E.script(() => G.story.talk(a.id));
    } else if (target.id) {
      E.script(() => G.story.use(target.id, target.x, target.y));
    } else if (target.obj) {
      E.script(() => G.story.flavorObj(target.obj));
    }
  };

  E.findTarget = function (tx, ty, dx, dy) {
    const m = E.map();
    const a = E.actorAt(tx, ty);
    if (a && !a.path.length) return { actor: a };
    // talk across desks / counters
    const o = m.inside(tx, ty) ? m.obj[ty][tx] : null;
    if (o && 'DCrTK'.includes(o)) {
      const b = E.actorAt(tx + dx, ty + dy);
      if (b && !b.path.length) return { actor: b };
    }
    const id = m.interact[tx + ',' + ty];
    if (id) return { id, x: tx, y: ty };
    if (o) return { obj: o };
    return null;
  };

  // ---------------------------------------------------------------- draw
  E.draw = function () {
    const S = G.state;
    const m = E.map();
    const p = E.player;
    const W = E.viewW, H = E.viewH;
    ctx.fillStyle = '#07090d';
    ctx.fillRect(0, 0, W, H);

    // camera
    const mw = m.W * T, mh = m.H * T;
    let cx = p.fx * T + 8 - W / 2, cy = p.fy * T + 8 - H / 2;
    cx = mw <= W ? (mw - W) / 2 : Math.max(0, Math.min(mw - W, cx));
    cy = mh <= H ? (mh - H) / 2 : Math.max(0, Math.min(mh - H, cy));
    if (E.shake > 0) { cx += (Math.random() - 0.5) * E.shake; cy += (Math.random() - 0.5) * E.shake; E.shake *= 0.9; if (E.shake < 0.3) E.shake = 0; }
    cx = Math.round(cx); cy = Math.round(cy);
    E.cam = { x: cx, y: cy };

    ctx.save();
    ctx.translate(-cx, -cy);
    ctx.drawImage(E.mapCanvas[m.name], 0, 0);
    const x0 = Math.floor(cx / T) - 1, y0 = Math.floor(cy / T) - 1;
    G.render.drawDynamic(ctx, m, x0, y0, x0 + Math.ceil(W / T) + 2, y0 + Math.ceil(H / T) + 2, E.time);

    // entities sorted by y
    const ents = [];
    for (const a of E.actors) ents.push({ y: a.fy, draw: () => G.render.drawChar(ctx, a.look, Math.round(a.fx * T), Math.round(a.fy * T) - 4, a.dir, a.frame, { sweat: a.sweat && ((E.time * 2) | 0) % 2 }) });
    ents.push({ y: p.fy, draw: () => G.render.drawChar(ctx, G.cast.you.look, Math.round(p.fx * T), Math.round(p.fy * T) - 4, p.dir, p.frame) });
    for (const pr of m.props) ents.push({ y: pr.y + pr.h - 1, draw: () => G.render.drawCar(ctx, pr, E.time) });
    ents.sort((a, b) => a.y - b.y);
    for (const e of ents) e.draw();

    // objective marker + interaction prompt
    if (!E.scripted && !G.ui.blocking()) {
      const obj = G.story.objective();
      if (obj.target && obj.target.map === m.name) {
        const bx = obj.target.x * T + 8, by = obj.target.y * T - 10 + Math.sin(E.time * 4) * 2;
        ctx.fillStyle = '#1a1408';
        ctx.beginPath(); ctx.moveTo(bx - 5, by - 6); ctx.lineTo(bx + 5, by - 6); ctx.lineTo(bx, by + 1); ctx.fill();
        ctx.fillStyle = '#f0c850';
        ctx.beginPath(); ctx.moveTo(bx - 4, by - 5); ctx.lineTo(bx + 4, by - 5); ctx.lineTo(bx, by); ctx.fill();
      }
      if (!p.moving) {
        const [dx, dy] = DIRS[p.dir];
        const tgt = E.findTarget(p.x + dx, p.y + dy, dx, dy);
        if (tgt && (tgt.actor || tgt.id)) {
          const tx = tgt.actor ? tgt.actor.fx : tgt.x, ty = tgt.actor ? tgt.actor.fy : tgt.y;
          const bx = Math.round(tx * T + 8), by = Math.round(ty * T - (tgt.actor ? 14 : 6));
          ctx.fillStyle = '#f7f4ea'; ctx.fillRect(bx - 4, by - 7, 9, 7); ctx.fillRect(bx - 1, by, 3, 1);
          ctx.fillStyle = '#1f2328'; ctx.fillRect(bx, by - 6, 1, 3); ctx.fillRect(bx, by - 2, 1, 1);
        }
      }
    }
    if (E.tapMark && E.time - E.tapMark.t < 0.6) {
      const k = (E.time - E.tapMark.t) / 0.6;
      ctx.strokeStyle = E.tapMark.ok ? 'rgba(240,200,80,' + (1 - k) + ')' : 'rgba(212,87,78,' + (1 - k) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(E.tapMark.x * T + 8, E.tapMark.y * T + 8, 3 + k * 6, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();

    if (m.dark || S.night) drawDarkness(m, cx, cy);
  };

  const darkCanvas = document.createElement('canvas');
  function drawDarkness(m, cx, cy) {
    const W = E.viewW, H = E.viewH;
    if (darkCanvas.width !== W || darkCanvas.height !== H) { darkCanvas.width = W; darkCanvas.height = H; }
    const d = darkCanvas.getContext('2d');
    d.globalCompositeOperation = 'source-over';
    d.clearRect(0, 0, W, H);
    d.fillStyle = m.name === 'garage' ? 'rgba(4,6,12,0.86)' : 'rgba(6,10,26,0.80)';
    d.fillRect(0, 0, W, H);
    d.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a = 1) => {
      const g = d.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(0,0,0,' + a + ')'); g.addColorStop(0.6, 'rgba(0,0,0,' + a * 0.6 + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
      d.fillStyle = g; d.beginPath(); d.arc(x, y, r, 0, Math.PI * 2); d.fill();
    };
    const p = E.player;
    hole(p.fx * T + 8 - cx, p.fy * T + 4 - cy, 60, 0.95);
    const lights = m.name === 'garage' ? m.lights : G.story.nightLights();
    for (const l of lights) {
      let a = 0.9;
      if (l.flicker) a = (Math.sin(E.time * 23) + Math.sin(E.time * 7.3)) > 1.2 ? 0.2 : 0.85;
      hole(l.x * T - cx, l.y * T - cy, l.r, a);
    }
    for (const pr of m.props) if (pr.lightsOn) {
      const fx = pr.x * T + pr.w * T / 2 - cx;
      const fy = pr.facing === 'right' ? pr.y * T + 8 - cy : pr.y * T - cy;
      hole(fx + (pr.facing === 'right' ? 40 : 0), fy + 12, 70, 1);
    }
    ctx.drawImage(darkCanvas, 0, 0);
  }

  // ---------------------------------------------------------------- tap / click to move
  // Plan a route to the tapped tile. Tapping a person or object walks to a tile facing it and uses it.
  E.tapAt = function (tx, ty, actorTy) {
    const m = E.map(), p = E.player;
    if (!m.inside(tx, ty)) return;
    const sx = p.moving ? p.nx : p.x, sy = p.moving ? p.ny : p.y;
    const goals = new Map();
    const actor = E.actorAt(tx, actorTy) || E.actorAt(tx, ty);
    const ax = tx, ay = actor ? actor.y : ty;
    const id = m.interact[tx + ',' + ty];
    const o = m.obj[ty][tx];
    if (actor || id || (o && m.solid(tx, ty))) {
      for (const d in DIRS) {
        const [dx, dy] = DIRS[d];
        goals.set((ax - dx) + ',' + (ay - dy), { face: d, interact: true });
        // talk across a desk or counter
        const mid = m.inside(ax - dx, ay - dy) ? m.obj[ay - dy][ax - dx] : null;
        if (actor && mid && 'DCrTK'.includes(mid)) {
          const k = (ax - 2 * dx) + ',' + (ay - 2 * dy);
          if (!goals.has(k)) goals.set(k, { face: d, interact: true });
        }
      }
    } else if (!m.solid(tx, ty)) {
      goals.set(tx + ',' + ty, null);
    } else { E.tapMark = { x: tx, y: ty, t: E.time, ok: false }; return; }

    // BFS over walkable tiles
    const start = sx + ',' + sy;
    const prev = new Map([[start, null]]);
    const q = [[sx, sy]];
    let found = goals.has(start) ? start : null;
    while (q.length && !found) {
      const [x, y] = q.shift();
      for (const d in DIRS) {
        const [dx, dy] = DIRS[d];
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (prev.has(k) || E.blocked(nx, ny)) continue;
        prev.set(k, [x + ',' + y, d]);
        if (goals.has(k)) { found = k; break; }
        q.push([nx, ny]);
      }
    }
    if (!found) { E.tapMark = { x: tx, y: ty, t: E.time, ok: false }; return; }
    const path = [];
    for (let k = found; prev.get(k); k = prev.get(k)[0]) path.unshift(prev.get(k)[1]);
    E.held = [];
    E.autoPath = path;
    E.autoGoal = goals.get(found);
    E.tapMark = { x: tx, y: ty, t: E.time, ok: true };
  };

  canvas.addEventListener('pointerdown', e => {
    if (!G.started || !G.state) return;
    G.audio.init();
    if (G.ui.dialogOpen) { if (G.ui._advance && !G.ui._choice) G.ui._advance(); return; }
    if (E.scripted || G.ui.blocking() || !E.cam) return;
    const r = canvas.getBoundingClientRect();
    const gx = (e.clientX - r.left) * (canvas.width / r.width) + E.cam.x;
    const gy = (e.clientY - r.top) * (canvas.height / r.height) + E.cam.y;
    // sprites are drawn 4px above their tile, so look a little lower for people
    E.tapAt(Math.floor(gx / T), Math.floor(gy / T), Math.floor((gy + 4) / T));
  });

  // ---------------------------------------------------------------- input
  const KEYMAP = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
  E.keyDown = function (e) {
    const dir = KEYMAP[e.key];
    if (dir) { E.held = E.held.filter(d => d !== dir); E.held.push(dir); }
    if (e.key === 'Shift') E.run = true;
    if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') E.interact();
  };
  E.keyUp = function (e) {
    const dir = KEYMAP[e.key];
    if (dir) E.held = E.held.filter(d => d !== dir);
    if (e.key === 'Shift') E.run = false;
  };
  window.addEventListener('blur', () => { E.held = []; E.run = false; });

  G.engine = E;
})();
