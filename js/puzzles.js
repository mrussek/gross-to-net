// Forensic workpapers: each is a multi-step analysis with real numbers that must tie.
(function () {
  const U = G.util;
  const $ = id => document.getElementById(id);
  const fmt = U.fmt, acct = U.acct, money = U.money;

  const P = { defs: {}, cur: null };
  P.isOpen = () => !!P.cur;

  // ================================================================ framework
  P.open = function (id) {
    return new Promise(resolve => {
      const def = P.defs[id];
      const S = G.state;
      S.puzzles[id] = S.puzzles[id] || { step: 0, done: false, intro: false };
      P.cur = { id, def, resolve, prog: S.puzzles[id] };
      $('wp-ref').textContent = def.ref;
      $('wp-title').textContent = def.title;
      $('modal').classList.remove('hidden');
      P.render();
      if (!P.cur.prog.intro && def.intro) {
        P.cur.prog.intro = true;
        setTimeout(() => G.ui.text(def.intro), 900);
      }
    });
  };

  P.close = function () {
    if (!P.cur) return;
    const { resolve, prog } = P.cur;
    $('modal').classList.add('hidden');
    P.cur = null;
    G.save();
    resolve(prog.done);
  };
  $('wp-close').addEventListener('click', P.close);
  $('wp-phone').addEventListener('click', () => G.ui.openPhone());

  P.render = function () {
    const { def, prog } = P.cur;
    const body = $('wp-body');
    body.innerHTML = '';
    body.appendChild(U.el('div', {}, def.header()));
    if (def.afterHeader) def.afterHeader(body);
    for (let i = 0; i <= Math.min(prog.step, def.steps.length - 1); i++) appendStep(i, i < prog.step || prog.done);
    if (prog.done) appendDone();
    body.scrollTop = 0;
  };

  function appendStep(i, done) {
    const { def, id } = P.cur;
    const st = def.steps[i];
    const body = $('wp-body');
    if (st.pre) {
      const pre = U.el('div', { class: 'step-pre' });
      pre.innerHTML = typeof st.pre === 'function' ? st.pre() : st.pre;
      body.appendChild(pre);
      if (st.afterPre) st.afterPre(pre);
    }
    const box = U.el('div', { class: 'qbox' + (done ? ' done' : '') });
    box.appendChild(U.el('div', { class: 'qnum' }, 'PROCEDURE ' + (i + 1) + ' OF ' + def.steps.length + (done ? ' &nbsp;&#10003; CLEARED' : '')));
    box.appendChild(U.el('div', { class: 'qtext' }, st.q));
    const fb = U.el('div', { class: 'feedback hidden' });
    const api = {
      done,
      fail(msg) {
        G.audio.fail();
        fb.className = 'feedback bad'; fb.innerHTML = msg || 'That doesn’t hold up.';
        G.hints.fail(id + '.' + st.key);
      },
      pass(msg) {
        G.audio.success();
        fb.className = 'feedback good'; fb.innerHTML = msg || 'Ties out.';
        box.classList.add('done');
        box.querySelector('.qnum').innerHTML = 'PROCEDURE ' + (i + 1) + ' OF ' + def.steps.length + ' &nbsp;&#10003; CLEARED';
        P.advance(i);
      },
    };
    const inner = U.el('div');
    box.appendChild(inner);
    box.appendChild(fb);
    body.appendChild(box);
    st.render(inner, api, box);
    if (done && st.doneNote) { fb.className = 'feedback good'; fb.innerHTML = st.doneNote; }
    if (!done) setTimeout(() => box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }

  P.advance = function (i) {
    const cur = P.cur;
    if (!cur || cur.prog.step !== i) return;
    cur.prog.step = i + 1;
    if (cur.prog.step >= cur.def.steps.length) {
      cur.prog.done = true;
      appendDone();
    } else {
      setTimeout(() => P.cur === cur && appendStep(i + 1, false), 450);
    }
    G.save();
  };

  function appendDone() {
    const { def } = P.cur;
    const d = U.el('div', { class: 'wp-done' }, '<p><span class="stamp">REVIEWED &mdash; EXCEPTION NOTED</span></p><p>' + (def.conclusion || '') + '</p>');
    const b = U.el('button', {}, 'File workpaper to case file &rarr;');
    b.addEventListener('click', P.close);
    d.appendChild(b);
    $('wp-body').appendChild(d);
    setTimeout(() => d.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 500);
  }

  // ---------------------------------------------------------------- step helpers
  // Multiple choice. options: [{t, ok, why}]
  function mc(key, q, options, extra = {}) {
    return Object.assign({
      key, q,
      render(el, api) {
        const wrap = U.el('div', { class: 'opts' });
        options.forEach((o, idx) => {
          const b = U.el('button', { class: 'opt' }, '<b>' + 'ABCDEF'[idx] + '.</b> ' + o.t);
          if (api.done) {
            if (o.ok) b.classList.add('right'); else b.classList.add('hidden');
          } else {
            b.addEventListener('click', () => {
              if (b.classList.contains('wrong') || el.dataset.solved) return;
              if (o.ok) { el.dataset.solved = 1; b.classList.add('right'); wrap.querySelectorAll('.opt:not(.right)').forEach(x => x.classList.add('hidden')); api.pass(o.why); }
              else { b.classList.add('wrong'); api.fail(o.why); }
            });
          }
          wrap.appendChild(b);
        });
        el.appendChild(wrap);
        if (api.done) { const ok = options.find(o => o.ok); el.appendChild(U.el('div', { class: 'feedback good' }, ok.why)); }
      },
    }, extra);
  }

  // Numeric entry. check(v) -> true | string (failure reason)
  function num(key, q, { check, answerText, placeholder = '', suffix = '' }, extra = {}) {
    return Object.assign({
      key, q,
      render(el, api) {
        const row = U.el('div');
        const inp = U.el('input', { type: 'text', inputmode: 'decimal', placeholder, autocomplete: 'off', spellcheck: 'false' });
        const btn = U.el('button', { class: 'submit' }, 'Tie out');
        row.appendChild(inp);
        if (suffix) row.appendChild(U.el('span', { style: 'margin-left:6px;font-family:var(--mono)' }, suffix));
        row.appendChild(btn);
        el.appendChild(row);
        if (api.done) { inp.value = answerText; inp.disabled = true; btn.disabled = true; return; }
        const go = () => {
          const v = U.parseNum(inp.value);
          if (isNaN(v)) { api.fail('Enter a number. Formats like <code>8,450</code>, <code>$8.45m</code>, or <code>(1,200)</code> are fine.'); return; }
          const r = check(v);
          if (r === true) { inp.disabled = true; btn.disabled = true; api.pass(extra.okMsg); }
          else api.fail(r);
        };
        btn.addEventListener('click', go);
        inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') go(); });
        if (!G.touch) setTimeout(() => inp.focus(), 100);
      },
    }, extra);
  }

  // Pick a row in a table rendered inside the question. rows: [{id, cells:[], why, ok}]
  function rowPick(key, q, head, rows, extra = {}) {
    return Object.assign({
      key, q,
      render(el, api) {
        const t = U.el('table', { class: 'ledger' });
        t.innerHTML = '<tr>' + head.map(h => '<th' + (h.num ? ' class="num"' : '') + '>' + (h.t || h) + '</th>').join('') + '</tr>';
        rows.forEach(r => {
          const tr = U.el('tr', { class: api.done ? (r.ok ? 'picked' : '') : 'clickable' });
          tr.innerHTML = r.cells.map((c, j) => '<td class="' + (head[j].num ? 'num' : '') + (head[j].wrap ? ' wrap' : '') + '">' + c + '</td>').join('');
          if (!api.done) tr.addEventListener('click', () => {
            if (el.dataset.solved) return;
            t.querySelectorAll('tr').forEach(x => x.classList.remove('picked'));
            tr.classList.add('picked');
            if (r.ok) { el.dataset.solved = 1; t.querySelectorAll('tr.clickable').forEach(x => x.classList.remove('clickable')); api.pass(r.why); }
            else api.fail(r.why);
          });
          t.appendChild(tr);
        });
        const w = U.el('div', { class: 'tbl-wrap' }); w.appendChild(t); el.appendChild(w);
        if (api.done) { const ok = rows.find(r => r.ok); el.appendChild(U.el('div', { class: 'feedback good' }, ok.why)); }
      },
    }, extra);
  }

  // ---------------------------------------------------------------- charts
  function setupCanvas(cv, w, h) {
    const dpr = window.devicePixelRatio || 1;
    cv.width = w * dpr; cv.height = h * dpr;
    cv.style.aspectRatio = w + ' / ' + h;
    const c = cv.getContext('2d'); c.scale(dpr, dpr);
    return c;
  }
  function benfordChart(cv, obs, exp) {
    const W = 640, H = 230, c = setupCanvas(cv, W, H);
    const L = 44, R = 10, Tp = 14, B = 34;
    const max = 35;
    const y = v => Tp + (H - Tp - B) * (1 - v / max);
    c.font = '11px IBM Plex Mono, monospace'; c.fillStyle = '#555';
    c.strokeStyle = '#e5e0d0';
    for (let v = 0; v <= max; v += 5) { c.beginPath(); c.moveTo(L, y(v)); c.lineTo(W - R, y(v)); c.stroke(); c.fillText(v + '%', 6, y(v) + 4); }
    const bw = (W - L - R) / 9;
    for (let i = 0; i < 9; i++) {
      const x = L + i * bw + bw * 0.18;
      c.fillStyle = '#5b8a72'; c.fillRect(x, y(obs[i]), bw * 0.64, y(0) - y(obs[i]));
      c.fillStyle = '#1f2328'; c.fillText(obs[i].toFixed(1), x + 2, y(obs[i]) - 4);
      c.fillStyle = '#333'; c.font = '13px IBM Plex Mono, monospace'; c.fillText(String(i + 1), L + i * bw + bw / 2 - 4, H - 14); c.font = '11px IBM Plex Mono, monospace';
    }
    c.strokeStyle = '#b8312f'; c.lineWidth = 2; c.setLineDash([5, 4]); c.beginPath();
    for (let i = 0; i < 9; i++) { const x = L + i * bw + bw / 2; i ? c.lineTo(x, y(exp[i])) : c.moveTo(x, y(exp[i])); }
    c.stroke(); c.setLineDash([]);
    for (let i = 0; i < 9; i++) { c.fillStyle = '#b8312f'; c.beginPath(); c.arc(L + i * bw + bw / 2, y(exp[i]), 3, 0, 7); c.fill(); }
    c.fillStyle = '#555'; c.fillText('Leading digit', W / 2 - 40, H - 1);
    c.fillStyle = '#5b8a72'; c.fillRect(W - 230, 4, 10, 10); c.fillStyle = '#333'; c.fillText('Observed', W - 216, 13);
    c.strokeStyle = '#b8312f'; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(W - 140, 9); c.lineTo(W - 120, 9); c.stroke(); c.setLineDash([]);
    c.fillText('Benford expected', W - 114, 13);
  }
  function lineChart(cv, weeks, data, base) {
    const W = 420, H = 170, c = setupCanvas(cv, W, H);
    const L = 46, R = 8, Tp = 10, B = 26;
    const max = Math.max(...data) * 1.12;
    const x = i => L + (W - L - R) * i / (weeks.length - 1);
    const y = v => Tp + (H - Tp - B) * (1 - v / max);
    c.font = '10px IBM Plex Mono, monospace';
    c.strokeStyle = '#eee8d8';
    for (let k = 0; k <= 4; k++) { const v = max * k / 4; c.beginPath(); c.moveTo(L, y(v)); c.lineTo(W - R, y(v)); c.stroke(); c.fillStyle = '#777'; c.fillText(fmt(Math.round(v / 100) * 100), 2, y(v) + 3); }
    // Q3 shading
    const q3s = weeks.indexOf(27);
    c.fillStyle = 'rgba(216,176,74,.10)'; c.fillRect(x(q3s), Tp, x(weeks.length - 1) - x(q3s), H - Tp - B);
    c.fillStyle = '#8a6a1a'; c.fillText('fiscal Q3', x(q3s) + 4, Tp + 10);
    c.strokeStyle = '#999'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(L, y(base)); c.lineTo(W - R, y(base)); c.stroke(); c.setLineDash([]);
    c.strokeStyle = '#1f3a2e'; c.lineWidth = 2; c.beginPath();
    data.forEach((v, i) => (i ? c.lineTo(x(i), y(v)) : c.moveTo(x(i), y(v)))); c.stroke(); c.lineWidth = 1;
    c.fillStyle = '#1f3a2e'; data.forEach((v, i) => { c.beginPath(); c.arc(x(i), y(v), 2, 0, 7); c.fill(); });
    c.fillStyle = '#555';
    weeks.forEach((w, i) => { if (w % 2 === 1) c.fillText('' + w, x(i) - 6, H - 10); });
    c.fillText('wk', W - 22, H - 1);
  }


  // Multi-select rows with checkboxes. rows: [{cells, ok (should be selected), why}]
  function multiPick(key, q, head, rows, opts = {}) {
    return {
      key, q,
      render(el, api) {
        const t = U.el('table', { class: 'ledger' });
        t.innerHTML = '<tr><th></th>' + head.map(h => '<th' + (h.num ? ' class="num"' : '') + '>' + (h.t || h) + '</th>').join('') + '</tr>';
        const boxes = [];
        rows.forEach((r, i) => {
          const tr = U.el('tr');
          const cb = U.el('input', { type: 'checkbox' });
          boxes.push(cb);
          if (api.done) { cb.checked = !!r.ok; cb.disabled = true; if (r.ok) tr.className = 'hl'; }
          const td0 = U.el('td'); td0.appendChild(cb); tr.appendChild(td0);
          tr.insertAdjacentHTML('beforeend', r.cells.map((c, j) => '<td class="' + (head[j].num ? 'num' : '') + (head[j].wrap ? ' wrap' : '') + '">' + c + '</td>').join(''));
          tr.style.cursor = 'pointer';
          tr.addEventListener('click', e => { if (e.target !== cb && !cb.disabled) cb.checked = !cb.checked; });
          t.appendChild(tr);
        });
        const w = U.el('div', { class: 'tbl-wrap' }); w.appendChild(t); el.appendChild(w);
        if (api.done) { if (opts.okMsg) el.appendChild(U.el('div', { class: 'feedback good' }, opts.okMsg)); return; }
        const btn = U.el('button', { class: 'submit', style: 'margin-top:10px;margin-left:0' }, opts.button || 'Conclude');
        el.appendChild(btn);
        btn.addEventListener('click', () => {
          if (el.dataset.solved) return;
          const picked = rows.filter((r, i) => boxes[i].checked);
          if (!picked.length) { api.fail('Select at least one row.'); return; }
          const falsePos = picked.filter(r => !r.ok);
          if (falsePos.length) { api.fail(falsePos[0].why || 'At least one selection doesn’t belong.'); return; }
          const missed = rows.filter((r, i) => r.ok && !boxes[i].checked);
          if (missed.length) { api.fail(opts.missMsg ? opts.missMsg(missed.length) : 'Everything you selected is right — but you’ve missed ' + (missed.length === 1 ? 'one' : missed.length) + '.'); return; }
          el.dataset.solved = 1; boxes.forEach(b => (b.disabled = true)); btn.disabled = true;
          api.pass(opts.okMsg);
        });
      },
    };
  }

  // Evaluate each criterion as met / not met. items: [{t, met, why}]
  function criteria(key, q, items, opts = {}) {
    return {
      key, q,
      render(el, api) {
        const state = items.map(() => null);
        const wrap = U.el('div', { class: 'crit' });
        items.forEach((it, i) => {
          const row = U.el('div', { class: 'crit-row' });
          row.appendChild(U.el('div', { class: 'crit-t' }, '<b>' + 'abcdefgh'[i] + '.</b> ' + it.t));
          const btns = U.el('div', { class: 'crit-btns' });
          const yes = U.el('button', { class: 'opt crit-b' }, 'Met'), no = U.el('button', { class: 'opt crit-b' }, 'Not met');
          if (api.done) { (it.met ? yes : no).classList.add('right'); yes.disabled = no.disabled = true; }
          else {
            yes.addEventListener('click', () => { state[i] = true; yes.classList.add('sel'); no.classList.remove('sel'); });
            no.addEventListener('click', () => { state[i] = false; no.classList.add('sel'); yes.classList.remove('sel'); });
          }
          btns.appendChild(yes); btns.appendChild(no); row.appendChild(btns); wrap.appendChild(row);
        });
        el.appendChild(wrap);
        if (api.done) { if (opts.okMsg) el.appendChild(U.el('div', { class: 'feedback good' }, opts.okMsg)); return; }
        const btn = U.el('button', { class: 'submit', style: 'margin-top:10px;margin-left:0' }, opts.button || 'Conclude');
        el.appendChild(btn);
        btn.addEventListener('click', () => {
          if (el.dataset.solved) return;
          if (state.some(v => v === null)) { api.fail('Evaluate every criterion before concluding.'); return; }
          const wrong = items.findIndex((it, i) => it.met !== state[i]);
          if (wrong >= 0) { api.fail('Criterion (' + 'abcdefgh'[wrong] + ') doesn’t hold up: ' + items[wrong].why); return; }
          el.dataset.solved = 1; btn.disabled = true;
          api.pass(opts.okMsg);
        });
      },
    };
  }

  // Simple multi-series line chart for weekly/monthly data. series: [{data, color, label, dash}]
  function multiLine(cv, labels, series, opts = {}) {
    const W = opts.w || 640, H = opts.h || 220, c = setupCanvas(cv, W, H);
    const L = 52, R = 10, Tp = 14, B = 30;
    const all = series.flatMap(s => s.data);
    const max = (opts.max || Math.max(...all)) * 1.1;
    const x = i => L + (W - L - R) * i / (labels.length - 1);
    const y = v => Tp + (H - Tp - B) * (1 - v / max);
    c.font = '10px IBM Plex Mono, monospace';
    c.strokeStyle = '#eee8d8';
    for (let k = 0; k <= 4; k++) { const v = max * k / 4; c.beginPath(); c.moveTo(L, y(v)); c.lineTo(W - R, y(v)); c.stroke(); c.fillStyle = '#777'; c.fillText((opts.fmt || (v => fmt(Math.round(v))))(v), 2, y(v) + 3); }
    if (opts.shade) { c.fillStyle = 'rgba(216,176,74,.13)'; c.fillRect(x(opts.shade[0]) - 4, Tp, x(opts.shade[1]) - x(opts.shade[0]) + 8, H - Tp - B); }
    series.forEach(s => {
      c.strokeStyle = s.color; c.lineWidth = 2; c.setLineDash(s.dash ? [5, 4] : []);
      c.beginPath(); s.data.forEach((v, i) => (i ? c.lineTo(x(i), y(v)) : c.moveTo(x(i), y(v)))); c.stroke();
      c.setLineDash([]); c.fillStyle = s.color; s.data.forEach((v, i) => { c.beginPath(); c.arc(x(i), y(v), 2, 0, 7); c.fill(); });
    });
    c.lineWidth = 1; c.fillStyle = '#555';
    labels.forEach((l, i) => { if (labels.length < 16 || i % 2 === 0) c.fillText('' + l, x(i) - 6, H - 12); });
    let lx = L + 6;
    series.forEach(s => { c.fillStyle = s.color; c.fillRect(lx, 2, 10, 3); c.fillStyle = '#333'; c.fillText(s.label, lx + 14, 7); lx += 24 + c.measureText(s.label).width; });
  }

  P.kit = { mc, num, rowPick, multiPick, criteria, setupCanvas, benfordChart, lineChart, multiLine };
  P.defs = {};
  G.puzzles = P;
})();
