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
        const inp = U.el('input', { type: 'text', placeholder, autocomplete: 'off', spellcheck: 'false' });
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
        setTimeout(() => inp.focus(), 100);
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

  // ================================================================ P1 — GL 2410 roll-forward
  const RF = {
    q: ['Q3 FY25', 'Q4 FY25', 'Q1 FY26', 'Q2 FY26', 'Q3 FY26'],
    rows: [
      ['Beginning balance', [150210, 151480, 155230, 155420, 160370], 'sub'],
      ['(+) Accruals — per TPM system', [118400, 131950, 126300, 135880, 141320]],
      ['(−) Customer deductions cleared', [-101250, -112730, -109400, -114360, -118905]],
      ['(−) Check payments to customers', [-8940, -9410, -8720, -9150, -9870]],
      ['(−) Payments — third-party service providers', [-5840, -7310, -9880, -12640, -14215]],
      ['(−) Releases / true-ups — per TPM', [-3600, -2950, -4410, -3880, -4100]],
      ['(+) Other adj. — per Rev Mgmt (top-side)', [2500, 4200, 6300, 9100, null]],
      ['Ending balance per GL', [151480, 155230, 155420, 160370, 163050], 'total'],
    ],
  };

  P.defs.wp2410 = {
    ref: 'WP C-2410 · BALANCE SHEET RECONCILIATION',
    title: 'Accrued Trade Promotion (GL 2410) — Five-Quarter Roll-Forward',
    intro: 'Account 2410. Your predecessor stopped trusting the "Other" line. So should you. Make it roll. Then ask what the money was *for*.',
    header() {
      let h = '<div class="wp-meta"><span>Entity: <b>Halvorsen Brands, Inc. (US01)</b></span><span>Period: <b>Q3 FY26 (09/30/2026)</b></span><span>Preparer: <b>M. Oyelaran</b> <span class="stamp">INCOMPLETE</span></span><span>Reviewer: <b>—</b></span><span>$ in thousands</span></div>';
      h += '<h4>Roll-forward</h4><div class="tbl-wrap"><table class="ledger"><tr><th></th>' + RF.q.map(q => '<th class="num">' + q + '</th>').join('') + '</tr>';
      for (const [label, vals, cls] of RF.rows) {
        h += '<tr class="' + (cls === 'total' ? 'total' : '') + '"><td>' + label + '</td>' + vals.map((v, i) => '<td class="num">' + (v == null ? '<b style="color:#b8312f">?</b>' : acct(v)) + (cls === 'total' && i < 4 ? '<span class="tick">✓</span>' : '') + '</td>').join('') + '</tr>';
      }
      h += '</table></div>';
      h += '<div style="font-family:var(--mono);font-size:11px;color:#666">✓ Agreed to GL trial balance. Q3 FY26 GL balance per system pull 10/05/2026 07:02.</div>';
      h += '<h4>Preparer notes (M. Oyelaran)</h4>';
      h += '<div class="wp-note handwritten">Q2 "other adj" $9,100 — support = 1-line email from V.K.: "per RM estimate." Not sufficient. Asked 3x for TPM detail. Escalated to C.M. 7/28 — told to sign. Did not sign.<br><br>3P provider payments up ~2.4x in a year. Volume of promotions in TPM is FLAT. Why are we paying more people to run the same number of events??<br><br>Q3: support never received. — MO 9/11</div>';
      return h;
    },
    steps: [
      num('plug', 'Solve for the Q3 FY26 "Other adj. — per Rev Mgmt" required for the roll-forward to agree to the GL balance. Enter in $000s.', {
        answerText: '8,450', placeholder: 'e.g. 1,234', suffix: '$000s',
        check(v) {
          if (Math.abs(v) >= 1e6) v = v / 1000;
          if (Math.abs(v - 8450) < 1) return true;
          if (Math.abs(v + 8450) < 1) return 'Right magnitude, wrong sign. GL (163,050) is <i>higher</i> than the activity supports, so the top-side <i>increased</i> the liability — a credit to 2410. Present it the way the row is presented: as an addition.';
          if (Math.abs(v - 154600) < 1) return '154,600 is the roll-forward <i>before</i> the top-side. You need the gap between that and the GL.';
          if (Math.abs(v - 163050) < 1) return 'That’s the GL ending balance itself. What has to be added to the activity to get there?';
          return 'Doesn’t tie. Foot Q3 FY26 from the beginning balance through releases, then compare to the GL ending balance.';
        },
      }, { okMsg: '154,600 per TPM-supported activity vs. 163,050 per GL. <b>$8.45M of the Q3 balance has no support in the promotion system.</b>' }),
      num('cum', 'Over the five quarters, what is the cumulative amount of unsupported "Other adj." top-sides credited to 2410? ($000s)', {
        answerText: '30,550', placeholder: 'e.g. 1,234', suffix: '$000s',
        check(v) {
          if (Math.abs(v) >= 1e6) v = v / 1000;
          if (Math.abs(v - 30550) < 1) return true;
          if (Math.abs(v - 22100) < 1) return 'That’s Q3 FY25 through Q2 FY26 — you left out the Q3 FY26 amount you just solved for.';
          return 'Sum the "Other adj." row across all five quarters, including the Q3 FY26 figure you derived.';
        },
      }, { okMsg: '$30.55M of trade spend over five quarters, booked on nothing but "per RM."' }),
      mc('why', 'An unsupported credit to an accrued liability <i>reduces</i> earnings when booked (Dr 4100 Trade Promotion, a contra-revenue account). Given the trend in the roll-forward, what is the most likely purpose of these top-sides?', [
        { t: 'A cookie-jar reserve: depress earnings now so the excess can be released in a future quarter to hit EPS targets.', ok: false, why: 'Classic pattern, wrong fit. A cookie jar gets <i>released</i> later — but the "Releases" row is flat (~$3–4M a quarter) and the balance keeps climbing. Something is <i>consuming</i> the headroom.' },
        { t: 'To create headroom in the liability that absorbs growing third-party payments debited directly to 2410 — burying their cost inside gross-to-net trade spend instead of operating expense, where it would be budgeted and scrutinized.', ok: true, why: 'Exactly. Third-party payments grew $5.8M → $14.2M a quarter while TPM accruals barely moved. Somebody is paying invoices against the trade accrual and refilling it with top-sides. In a $6B CPG company, gross-to-net is a haystack nobody searches.' },
        { t: 'A conservative estimate of variable consideration under ASC 606-10-32-11 (the constraint), anticipating late retailer deductions.', ok: false, why: 'The constraint limits revenue to amounts not probable of significant reversal — but it still requires an <i>estimate grounded in data</i>. TPM shows no open promotions to support it, and management couldn’t produce any. "Per RM" is not a methodology.' },
        { t: 'Translation adjustments on Canadian trade programs reported in US dollars.', ok: false, why: 'FX translation runs through OCI via the CTA, not as a manual top-side to a US entity’s trade accrual. And it wouldn’t grow in one direction for five straight quarters.' },
      ]),
    ],
    conclusion: 'The trade accrual is being used as a funding source. Someone is paying third parties out of 2410 and refilling it with unsupported top-sides.',
  };

  // ================================================================ P2 — digit analysis / split invoices
  const BENF = [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6];
  const OBS = [24.8, 14.9, 10.7, 22.6, 6.1, 5.4, 5.2, 5.6, 4.7];
  P.defs.wpAP = {
    ref: 'WP F-AP-01 · DATA ANALYTICS',
    title: 'Third-Party Trade Service Payments — First-Digit & Threshold Analysis',
    intro: 'Who gets paid out of 2410, and how much at a time? Nature has a distribution. People don’t follow it.',
    header() {
      return '<div class="wp-meta"><span>Population: <b>3,830 disbursements</b></span><span>Vendor class: <b>Third-party trade services (GL 2410 debits)</b></span><span>Period: <b>FY26 YTD</b></span><span>Source: <b>AP payment register (T. Nguyen, 10/05)</b></span></div>' +
        '<h4>Delegation of Authority — excerpt (Policy FIN-104, rev. 2022)</h4>' +
        '<div class="wp-exhibit">§4.2 Non-PO invoices for trade services may be approved by the <b>AP Manager</b> up to <b>$49,999.99</b> per invoice. Invoices of <b>$50,000.00 or more</b> require approval of the <b>Corporate Controller</b>. Invoices exceeding $250,000 require CFO approval.</div>' +
        '<h4>First-digit distribution vs. Benford’s Law</h4>' +
        '<div class="chart-card"><canvas id="benf"></canvas></div>';
    },
    afterHeader(body) { benfordChart(body.querySelector('#benf'), OBS, BENF); },
    steps: [
      {
        key: 'digit', q: 'Which leading digit shows the most significant deviation from the Benford expectation?',
        render(el, api) {
          const wrap = U.el('div', { class: 'digit-pick' });
          const whys = {
            1: 'Digit 1 is <i>under</i>-represented (24.8% vs 30.1%). That’s a symptom: something else is crowding the distribution. Find the digit that’s over.',
            2: 'Slightly low, within what you’d expect when another digit is inflated.', 3: 'Slightly low — a symptom, not the cause.',
            5: 'Within tolerance.', 6: 'Within tolerance.', 7: 'Within tolerance.', 8: 'Within tolerance.', 9: 'Within tolerance.',
          };
          for (let d = 1; d <= 9; d++) {
            const b = U.el('button', {}, '' + d);
            if (api.done) { if (d === 4) b.classList.add('right'); }
            else b.addEventListener('click', () => {
              if (el.dataset.solved || b.classList.contains('wrong')) return;
              if (d === 4) { el.dataset.solved = 1; b.classList.add('right'); api.pass('22.6% observed vs. 9.7% expected — more than double. ~490 more payments starting with "4" than chance predicts. Something is being priced to land just under a number.'); }
              else { b.classList.add('wrong'); api.fail(whys[d]); }
            });
            wrap.appendChild(b);
          }
          el.appendChild(wrap);
        },
        doneNote: '22.6% observed vs. 9.7% expected for leading digit 4.',
      },
      rowPick('vendor', 'Drill-down: payments with leading digit 4 ($40,000–$49,999.99) by vendor. Which vendor’s pattern indicates invoice splitting?', [
        { t: 'Vendor' }, { t: '# pmts in range', num: 1 }, { t: 'Avg amount', num: 1 }, { t: '% in $45K–$49,999', num: 1 }, { t: 'Same-day multi-invoice clusters', num: 1 }, { t: 'Invoice #s', wrap: 1 }, { t: 'Contract on file', wrap: 1 },
      ], [
        { id: 'atlas', cells: ['Atlas Merchandising Group', '9', '45,000.00', '100%', '0', 'Monthly, non-sequential', 'MSA — fixed retainer $45,000/mo'], why: 'Atlas bills a <i>fixed $45,000 monthly retainer</i> under a signed MSA. It clusters on "4" by design, and it’s documented. Explained variance.' },
        { id: 'bright', cells: ['BrightPath Field Marketing', '41', '43,180.55', '27%', '0', 'Non-sequential', 'MSA — variable SOWs'], why: 'Ordinary spread of amounts with a signed MSA and no clustering. Nothing here.' },
        { id: 'cross', cells: ['Crossroads Demo Services', '63', '42,906.10', '31%', '2', 'Non-sequential', 'Per-event SOWs'], why: 'Two same-day clusters out of 63 is consistent with multi-store demo events. Distribution is unremarkable.' },
        { id: 'meridian', ok: true, cells: ['Meridian Retail Solutions LLC', '548', '48,371.92', '94%', '161', '<b>Sequential</b> (M-28204 → M-30451)', '<i>"Pending"</i> — none on file'], why: '548 payments averaging $48,372, 94% within $5K of the $50K threshold, 161 days with multiple invoices, and sequential invoice numbers — meaning Halvorsen is effectively its only customer. No contract on file.' },
        { id: 'north', cells: ['Northstar Shelf Analytics', '12', '44,900.00', '58%', '0', 'Quarterly', 'Subscription agreement'], why: 'A quarterly subscription. Low volume, contracted, explained.' },
      ]),
      mc('control', 'Which control is being circumvented, and what is the best corroborating procedure?', [
        { t: 'Three-way match — reperform PO / receiving / invoice matching on a sample.', ok: false, why: 'These are non-PO invoices for "services" — there’s no PO or receiving report to match. The bypass is about <i>who approves</i>, not matching.' },
        { t: 'The $50,000 single-approver limit in the DoA — aggregate Meridian invoices by vendor, date and service description to identify split transactions that should have gone to the Controller.', ok: true, why: 'Split invoices keep every Meridian payment inside the AP Manager’s approval authority. The Controller never sees a single one of them.' },
        { t: 'Positive pay — compare the issued-check file to bank clearing records.', ok: false, why: 'Positive pay stops altered or counterfeit checks. These payments were legitimately issued — to the wrong people.' },
        { t: 'Duplicate-payment detection — search for identical invoice numbers and amounts.', ok: false, why: 'Every invoice number here is unique and sequential. Duplicate-payment tests would come up clean — which is exactly the point of splitting.' },
      ]),
    ],
    conclusion: 'Meridian Retail Solutions LLC: 548 invoices engineered to sit under the AP Manager’s $50,000 approval limit. The Controller never saw one.',
  };

  // ================================================================ P3 — vendor master vs HR
  const VM = [
    { id: 'V-20831', name: 'Atlas Merchandising Group', created: '03/11/2022', by: 'JLEE', appr: 'CMARR', addr: '400 Commerce Pkwy, Columbus OH 43215', bank: '044000024 / ••7731', phone: '614-555-0142' },
    { id: 'V-21907', name: 'BrightPath Field Marketing', created: '08/02/2023', by: 'TNGUYEN', appr: 'DPRENTISS', addr: '1550 Vine St, Cincinnati OH 45202', bank: '042000314 / ••2290', phone: '513-555-0177' },
    { id: 'V-22415', name: 'Crossroads Demo Services', created: '01/19/2024', by: 'TNGUYEN', appr: 'DPRENTISS', addr: '77 Harbor Rd, Dayton OH 45402', bank: '042000013 / ••5108', phone: '937-555-0105' },
    { id: 'V-22688', name: 'Meridian Retail Solutions LLC', created: '06/28/2024', by: 'DPRENTISS', appr: 'DPRENTISS', addr: '8812 Larkspur Ct, Mason OH 45040', bank: '042100175 / ••6604', phone: '513-555-0199' },
    { id: 'V-22702', name: 'Northstar Shelf Analytics', created: '07/09/2024', by: 'JLEE', appr: 'CMARR', addr: '2100 Lakeside Ave, Cleveland OH 44114', bank: '041000124 / ••3391', phone: '216-555-0160' },
    { id: 'V-23050', name: 'Greenfield Display Co.', created: '11/04/2025', by: 'TNGUYEN', appr: 'DPRENTISS', addr: '615 Elm St, Mason OH 45040', bank: '042000314 / ••9917', phone: '513-555-0123' },
  ];
  const HR = [
    { id: 'E-1044', name: 'Victor Kessane', title: 'VP Revenue Mgmt', addr: '41 Indian Hill Rd, Cincinnati OH 45243', bank: '042000314 / ••1180', ec: 'Elise Moore (sister)', ecaddr: '8812 Larkspur Ct, Mason OH 45040' },
    { id: 'E-1102', name: 'Dale Prentiss', title: 'AP Manager', addr: '2207 Maple Ave, Norwood OH 45212', bank: '042000013 / ••4471', ec: 'Karen Prentiss (spouse)', ecaddr: '2207 Maple Ave, Norwood OH 45212' },
    { id: 'E-1187', name: 'Celeste Marr', title: 'Corporate Controller', addr: '18 Observatory Pl, Cincinnati OH 45208', bank: '044000024 / ••8820', ec: 'Thomas Marr (spouse)', ecaddr: '18 Observatory Pl, Cincinnati OH 45208' },
    { id: 'E-1215', name: 'Priya Raman', title: 'Sr. Trade Analyst', addr: '930 Elm St #4, Cincinnati OH 45202', bank: '042000314 / ••3391', ec: 'Arun Raman (father)', ecaddr: '12 Oak Tree Rd, Edison NJ 08820' },
    { id: 'E-1230', name: 'Tomas Nguyen', title: 'AP Specialist', addr: '615 Elm St, Cincinnati OH 45202', bank: '042000314 / ••0076', ec: 'Linh Nguyen (mother)', ecaddr: '615 Elm St, Cincinnati OH 45202' },
    { id: 'E-1251', name: 'Jin Lee', title: 'AP Specialist', addr: '3301 Reading Rd, Cincinnati OH 45229', bank: '044000024 / ••5512', ec: 'Grace Lee (spouse)', ecaddr: '3301 Reading Rd, Cincinnati OH 45229' },
  ];

  P.defs.wpVM = {
    ref: 'WP F-VM-02 · DATA ANALYTICS',
    title: 'Vendor Master ↔ Employee Data Cross-Match',
    intro: 'A vendor is just a name and a bank account. Find where Meridian’s money sleeps at night. HR keeps more than home addresses.',
    header() {
      let h = '<div class="wp-meta"><span>Source A: <b>ERP vendor master (N. Okafor, 10/06)</b></span><span>Source B: <b>HR extract — provenance: anonymous</b></span><span>Scope: <b>Trade-service vendors; Finance & Rev Mgmt personnel</b></span></div>';
      h += '<div class="wp-note">Method: click a field in the vendor master and a field in the employee file you believe match, then <b>Flag match</b>. Bank fields show ABA routing / last four of account.</div>';
      return h;
    },
    steps: [
      {
        key: 'match', q: 'Identify the link between a vendor and an employee.',
        render(el, api) {
          let pickV = null, pickE = null;
          const vt = U.el('table', { class: 'ledger' });
          vt.innerHTML = '<tr><th>Vendor</th><th>Name</th><th>Created</th><th>Created by</th><th>Approved by</th><th>Remit-to address</th><th>Bank (RTN / acct)</th><th>Phone</th></tr>';
          VM.forEach(v => {
            const tr = U.el('tr');
            tr.innerHTML = `<td>${v.id}</td><td>${v.name}</td><td>${v.created}</td><td>${v.by}</td><td>${v.appr}</td>`;
            for (const f of ['addr', 'bank', 'phone']) {
              const td = U.el('td', { class: 'cell-pick' }, v[f]);
              td.dataset.k = v.id + '.' + f;
              td.addEventListener('click', () => { if (api.done || el.dataset.solved) return; vt.querySelectorAll('.cell-picked').forEach(x => x.classList.remove('cell-picked')); td.classList.add('cell-picked'); pickV = td.dataset.k; });
              tr.appendChild(td);
            }
            vt.appendChild(tr);
          });
          const et = U.el('table', { class: 'ledger' });
          et.innerHTML = '<tr><th>Emp</th><th>Name / title</th><th>Home address</th><th>Direct deposit (RTN / acct)</th><th>Emergency contact</th><th>Emergency contact address</th></tr>';
          HR.forEach(e => {
            const tr = U.el('tr');
            tr.innerHTML = `<td>${e.id}</td><td>${e.name}<br><small>${e.title}</small></td>`;
            for (const f of ['addr', 'bank', 'ec', 'ecaddr']) {
              const td = U.el('td', { class: f === 'ec' ? '' : 'cell-pick' }, e[f]);
              if (f !== 'ec') {
                td.dataset.k = e.id + '.' + f;
                td.addEventListener('click', () => { if (api.done || el.dataset.solved) return; et.querySelectorAll('.cell-picked').forEach(x => x.classList.remove('cell-picked')); td.classList.add('cell-picked'); pickE = td.dataset.k; });
              }
              tr.appendChild(td);
            }
            et.appendChild(tr);
          });
          el.appendChild(U.el('h4', {}, 'A. Vendor master — trade-service vendors'));
          const w1 = U.el('div', { class: 'tbl-wrap' }); w1.appendChild(vt); el.appendChild(w1);
          el.appendChild(U.el('h4', {}, 'B. Employee master — HR extract'));
          const w2 = U.el('div', { class: 'tbl-wrap' }); w2.appendChild(et); el.appendChild(w2);
          const btn = U.el('button', { class: 'submit', style: 'margin:10px 0 0' }, '⚑ Flag match');
          el.appendChild(btn);
          const mark = () => {
            el.querySelectorAll('[data-k="V-22688.addr"],[data-k="E-1044.ecaddr"]').forEach(x => x.classList.add('cell-ok'));
          };
          if (api.done) { btn.disabled = true; mark(); return; }
          btn.addEventListener('click', () => {
            if (el.dataset.solved) return;
            if (!pickV || !pickE) { api.fail('Select one field in table A <i>and</i> one in table B.'); return; }
            const pair = pickV + '|' + pickE;
            if (pair === 'V-22688.addr|E-1044.ecaddr') {
              el.dataset.solved = 1; btn.disabled = true; mark();
              api.pass('<b>8812 Larkspur Ct, Mason OH 45040.</b> Meridian’s remit-to address is the home of Elise Moore — Victor Kessane’s sister and emergency contact. Not his own address, which is why a standard vendor-to-employee address match never fired.');
              return;
            }
            const msgs = {
              'V-22702.bank|E-1215.bank': 'Same last four (3391) — but different routing numbers (041000124 vs 042000314). Different banks, different accounts. Coincidence; with 10,000 possible last-fours, you’ll find these.',
              'V-23050.addr|E-1230.addr': '"615 Elm St" in both — but Mason 45040 vs Cincinnati 45202. Different cities. Fuzzy matching would flag it; a human should clear it.',
              'V-23050.addr|E-1230.ecaddr': '"615 Elm St" in both — but Mason 45040 vs Cincinnati 45202. Different cities.',
            };
            if (msgs[pair]) { api.fail(msgs[pair]); return; }
            const [vf, ef] = [pickV.split('.')[1], pickE.split('.')[1]];
            if (vf === 'bank' && ef === 'bank' && VM.find(v => v.id === pickV.split('.')[0]).bank.slice(0, 9) === HR.find(e => e.id === pickE.split('.')[0]).bank.slice(0, 9))
              api.fail('Same routing number just means the same bank — 042000314 is one of the largest banks in Ohio. Account numbers differ.');
            else api.fail('Those fields don’t match. Compare more carefully — including the columns HR doesn’t usually look at.');
          });
        },
      },
      mc('sod', 'Beyond the address match, what in Meridian’s vendor master record is itself a control failure?', [
        { t: 'It was created and approved by the same user (DPRENTISS) — no segregation of duties over vendor master changes.', ok: true, why: 'One person created the vendor, approved the vendor, and approves its invoices up to $49,999.99. That’s the whole payment cycle in a single pair of hands. Note every other vendor has a different creator and approver.' },
        { t: 'The remit-to address is residential rather than commercial.', ok: false, why: 'A red flag worth noting — but it’s a <i>fraud indicator</i>, not a control failure. Plenty of small legitimate vendors operate from home.' },
        { t: 'The vendor is a limited liability company.', ok: false, why: 'Most vendors are LLCs. Entity form isn’t a control.' },
        { t: 'The routing number belongs to a different bank than Halvorsen’s operating account.', ok: false, why: 'Vendors bank wherever they like. That’s not a control failure.' },
      ]),
    ],
    conclusion: 'Meridian Retail Solutions remits to Victor Kessane’s sister’s house. Dale Prentiss created and approved the vendor himself.',
  };

  // ================================================================ P4 — proof of performance
  const WEEKS = []; for (let w = 22; w <= 39; w++) WEEKS.push(w);
  function series(seed, base, lifts) {
    const r = U.rng(seed);
    return WEEKS.map(w => Math.round(base * (lifts[w] || 1) * (0.96 + r() * 0.08)));
  }
  const SCAN = [
    { key: 'A', t: 'MegaMart — Crisp Valley Kettle Chips 8oz', base: 12000, data: series(11, 12000, { 27: 1.82, 28: 1.74, 29: 0.88 }) },
    { key: 'B', t: 'FreshCo — BrightHome Dish Pods 32ct', base: 4200, data: series(22, 4200, {}) },
    { key: 'C', t: 'Valumart — Tidal Sparkling 12pk', base: 8800, data: series(33, 8800, { 31: 1.66, 32: 1.58, 33: 0.91 }) },
    { key: 'D', t: 'Grandway — Crisp Valley Tortilla 11oz', base: 6500, data: series(44, 6500, {}) },
  ];
  const INV = [
    { id: 'M-30412', ret: 'MegaMart', item: 'Crisp Valley Kettle 8oz', wk: '27–28', desc: 'In-store display execution & scan-down admin', amt: 48750, chart: 'A', phantom: false },
    { id: 'M-30419', ret: 'FreshCo', item: 'BrightHome Dish Pods 32ct', wk: '29–30', desc: 'TPR execution & shelf compliance audit', amt: 49200, chart: 'B', phantom: true },
    { id: 'M-30420', ret: 'FreshCo', item: 'BrightHome Dish Pods 32ct', wk: '33–34', desc: 'Endcap build & merchandising', amt: 46850, chart: 'B', phantom: true },
    { id: 'M-30425', ret: 'Valumart', item: 'Tidal Sparkling 12pk', wk: '31–32', desc: 'Feature ad coordination & retail execution', amt: 48300, chart: 'C', phantom: false },
    { id: 'M-30431', ret: 'Grandway', item: 'Crisp Valley Tortilla 11oz', wk: '35–36', desc: 'BOGO execution & scan-back administration', amt: 49950, chart: 'D', phantom: true },
    { id: 'M-30433', ret: 'MegaMart', item: 'Crisp Valley Kettle 8oz', wk: '35–36', desc: 'Secondary display placement', amt: 47400, chart: 'A', phantom: true },
  ];
  P.defs.wpPOP = {
    ref: 'WP F-TP-03 · PROOF OF PERFORMANCE',
    title: 'Meridian Invoices vs. Syndicated Retail Scan Data (Fiscal Q3)',
    intro: 'Promotions leave footprints. A real display moves product. A fake one moves money.',
    header() {
      let h = '<div class="wp-meta"><span>Invoices: <b>Records Room, Cabinet 7 (paper backup)</b></span><span>Scan data: <b>Syndicated POS, weekly units (P. Raman)</b></span><span>Sample: <b>6 of 211 Q3 Meridian invoices</b></span></div>';
      h += '<div class="wp-note">TPM promotion calendar lists all six events below as "Executed". Calendar entries last modified by <b>VKESSANE</b> on 10/01/2026 22:14. Do not rely on it.</div>';
      h += '<h4>Weekly unit sales (dashed = trailing 8-week baseline)</h4><div class="chart-row">' + SCAN.map(s => '<div class="chart-card"><div class="ct">[' + s.key + '] ' + s.t + '</div><canvas data-chart="' + s.key + '"></canvas></div>').join('') + '</div>';
      return h;
    },
    afterHeader(body) { SCAN.forEach(s => lineChart(body.querySelector('[data-chart="' + s.key + '"]'), WEEKS, s.data, s.base)); },
    steps: [
      {
        key: 'phantom', q: 'Select every invoice for which the scan data shows <i>no evidence</i> that the billed event happened.',
        render(el, api) {
          const t = U.el('table', { class: 'ledger' });
          t.innerHTML = '<tr><th></th><th>Invoice</th><th>Retailer</th><th>Item</th><th>Weeks</th><th>Service billed</th><th class="num">Amount</th><th>Chart</th></tr>';
          const boxes = {};
          INV.forEach(v => {
            const tr = U.el('tr');
            const cb = U.el('input', { type: 'checkbox' });
            boxes[v.id] = cb;
            if (api.done) { cb.checked = v.phantom; cb.disabled = true; if (v.phantom) tr.className = 'hl'; }
            const td0 = U.el('td'); td0.appendChild(cb); tr.appendChild(td0);
            tr.insertAdjacentHTML('beforeend', `<td>${v.id}</td><td>${v.ret}</td><td>${v.item}</td><td>${v.wk}</td><td class="wrap">${v.desc}</td><td class="num">${fmt(v.amt, 2)}</td><td>[${v.chart}]</td>`);
            tr.style.cursor = 'pointer';
            tr.addEventListener('click', e => { if (e.target !== cb && !cb.disabled) cb.checked = !cb.checked; });
            t.appendChild(tr);
          });
          const w = U.el('div', { class: 'tbl-wrap' }); w.appendChild(t); el.appendChild(w);
          if (api.done) return;
          const btn = U.el('button', { class: 'submit', style: 'margin-top:10px;margin-left:0' }, 'Conclude on sample');
          el.appendChild(btn);
          btn.addEventListener('click', () => {
            if (el.dataset.solved) return;
            const sel = INV.filter(v => boxes[v.id].checked);
            const falsePos = sel.filter(v => !v.phantom);
            const missed = INV.filter(v => v.phantom && !boxes[v.id].checked);
            if (!sel.length) { api.fail('Select at least one invoice.'); return; }
            if (falsePos.length) { api.fail(falsePos.map(v => v.id).join(', ') + ': the scan data shows a clear, time-matched lift for ' + (falsePos.length > 1 ? 'those weeks' : 'that week') + ' — something <i>did</i> happen in-store. Whether Meridian did it is a separate question. Remove it from the "no evidence" population.'); return; }
            if (missed.length) { api.fail('Everything you selected is right — but you’ve missed ' + (missed.length === 1 ? 'one more invoice' : missed.length + ' more invoices') + ' with no measurable lift. Check every invoice against its own chart and weeks.'); return; }
            el.dataset.solved = 1;
            Object.values(boxes).forEach(b => (b.disabled = true));
            btn.disabled = true;
            api.pass('Four of six — <b>$193,400</b> — billed for "events" that left no trace in point-of-sale data. Volume in those weeks is indistinguishable from baseline. The other two piggyback on real retailer-run promotions to look legitimate. Extrapolated across 211 Q3 invoices, this isn’t sloppiness. It’s a template.');
          });
        },
        doneNote: 'M-30419, M-30420, M-30431, M-30433 — $193,400 with zero lift.',
      },
      mc('asc606', 'Management’s fallback: "Even the two real events justify the program." But Meridian isn’t a customer. Under ASC 606-10-32-25 and 32-26, how should payments to a third party for distinct in-store execution services be accounted for?', [
        { t: 'As a reduction of the transaction price (contra-revenue), charged against the trade accrual — it’s promotional spend.', ok: false, why: 'Consideration payable to a <i>customer</i> (or to parties purchasing from the customer) reduces revenue. Meridian buys nothing from Halvorsen or its retailers. Running vendor services through 2410 is precisely how the cost was hidden.' },
        { t: 'As an operating expense (selling/SG&A) for a distinct service received from a vendor, at the service’s fair value — not through the trade accrual.', ok: true, why: 'A payment to a non-customer for a distinct service is just a purchase of services: an expense, budgeted and approved like any other. Booking it in gross-to-net was a classification choice designed to avoid scrutiny.' },
        { t: 'As a prepaid asset amortized over the promotion period.', ok: false, why: 'The "service period" is two weeks and already over. There’s no future benefit to capitalize.' },
        { t: 'As an incremental cost of obtaining a contract, capitalized under ASC 340-40.', ok: false, why: 'Costs to obtain a contract are things like sales commissions — incurred only because a customer contract was won. Retail execution isn’t that.' },
      ]),
    ],
    conclusion: 'Meridian bills for promotions that never happened, and hides even the "real" ones in contra-revenue where no one budgets them.',
  };

  // ================================================================ P5 — JE testing & firefighter log
  const JE = [
    { id: '30871', post: '09/28 10:14', eff: '09/30', user: 'JLEE', src: 'Manual', dr: '6110 Payroll exp.', cr: '2310 Accrued payroll', amt: '3,412,880.17', desc: 'Sept payroll accrual — 8 days', appr: 'CMARR', why: 'Recurring payroll accrual, odd cents, prepared by staff, approved, posted in business hours before cutoff. Low risk.' },
    { id: '30884', post: '09/29 15:42', eff: '09/29', user: 'SYS_BATCH', src: 'Interface', dr: '1310 Trade AR', cr: '4000 Gross sales', amt: '48,221,904.55', desc: 'OTC interface batch 0929', appr: 'auto', why: 'Automated order-to-cash interface. Covered by ITGC testing; not a manual entry.' },
    { id: '30890', post: '09/30 18:05', eff: '09/30', user: 'RKHAN', src: 'Manual', dr: '1810 IC recv. — Canada', cr: '4900 IC royalty rev.', amt: '12,000,000.00', desc: 'Q3 IC royalty per TP study', appr: 'CMARR', why: 'Large and round — worth a look — but posted before cutoff by GL staff, approved by the Controller, tied to the transfer-pricing study, and eliminates in consolidation. Not your top-side.' },
    { id: '30902', post: '09/30 23:15', eff: '09/30', user: 'SYS_BATCH', src: 'Interface', dr: '4100 Trade promotion', cr: '2410 Accrued trade promo', amt: '11,846,215.40', desc: 'TPM accrual interface wk 39', appr: 'auto', why: 'The automated TPM accrual feed — this is the <i>supported</i> part of the accrual, and it runs nightly at 23:15.' },
    { id: '30911', post: '10/01 09:30', eff: '10/01', user: 'JLEE', src: 'Manual', dr: '2310 Accrued payroll', cr: '6110 Payroll exp.', amt: '3,412,880.17', desc: 'Reverse Sept payroll accrual', appr: 'CMARR', why: 'Auto-reversal of JE 30871 on day one of the new period. Routine.' },
    { id: '30914', post: '10/02 14:10', eff: '09/30', user: 'RKHAN', src: 'Manual', dr: '1420 Prepaid insurance', cr: '6400 Insurance exp.', amt: '250,000.00', desc: 'Q3 prepaid reclass per broker stmt', appr: 'CMARR', why: 'Post-cutoff and back-dated — but small, approved, and supported by a broker statement. A normal late adjustment.' },
    { id: '30917', post: '10/02 23:52', eff: '09/30', user: 'FF_FIN03', src: 'Manual', dr: '4100 Trade promotion', cr: '2410 Accrued trade promo', amt: '8,450,000.00', desc: 'Q3 true-up per RM', appr: '—', ok: true, why: '<b>Every risk criterion at once:</b> posted near midnight two days after period-end, back-dated to 9/30, round-dollar, vague description, no approver, posted with an emergency "firefighter" ID — and it’s exactly the $8,450K plug from the 2410 roll-forward.' },
    { id: '30920', post: '10/03 08:02', eff: '10/03', user: 'SYS_BATCH', src: 'Interface', dr: '2010 AP trade', cr: '1010 Cash — operating', amt: '22,917,446.08', desc: 'AP payment run 1003', appr: 'auto', why: 'Automated payment run. Not a journal entry risk.' },
    { id: '30922', post: '10/03 11:47', eff: '09/30', user: 'CMARR', src: 'Manual', dr: '6900 Legal exp.', cr: '2390 Accrued legal', amt: '1,500,000.00', desc: 'Q3 lit. reserve — Halvorsen v. Packright per GC', appr: 'BSTOKES (CFO)', why: 'Late, back-dated and round — but an ASC 450 loss contingency, approved by the CFO and supported by a General Counsel memo. Judgmental, but documented.' },
  ];
  const FF = [
    { id: 'FF-0412', who: 'NOKAFOR', reason: 'ERP patch validation', out: '09/14 19:00', back: '09/14 20:12', act: 'Config only', rev: 'CMARR 09/16', why: 'IT admin, config only, reviewed. Normal.' },
    { id: 'FF-0419', who: 'RKHAN', reason: 'Reopen P09 for IC posting', out: '09/30 17:40', back: '09/30 18:20', act: '1 JE (30890)', rev: 'CMARR 10/01', why: 'Legitimate, documented, reviewed the next morning. This one supports JE 30890.' },
    { id: 'FF-0423', who: 'VKESSANE', reason: '"Urgent — TPM interface fix"', out: '10/02 23:41', back: '10/03 00:06', act: 'Reopen P09; 1 JE; close P09', rev: '— (pending)', ok: true, why: '<b>Victor Kessane</b> checked out FF_FIN03 at 23:41, reopened the closed September period, posted one JE at 23:52, and locked the period again at 00:06. The stated reason — an interface fix — involved no interface work at all. The log was never reviewed.' },
    { id: 'FF-0424', who: 'NOKAFOR', reason: 'Period close lock verification', out: '10/03 07:30', back: '10/03 07:41', act: 'Config only', rev: '—', why: 'Nadia verifying the period lock the next morning — after the damage was done. Config only.' },
  ];
  P.defs.wpJE = {
    ref: 'WP F-JE-07 · JOURNAL ENTRY TESTING (AU-C 240 / AS 2401)',
    title: 'Q3 Close: Manual & Late Entries — GL Period 09',
    intro: 'Someone made that $8.45 million appear. Entries have authors. Authors have logins. Logins have logs.',
    header() {
      return '<div class="wp-meta"><span>Population: <b>All entries posted 09/28–10/03 to P09 or P10</b></span><span>Close cutoff: <b>10/01 17:00 (P09 locked)</b></span><span>Source: <b>ERP JE header table + GRC firefighter log (N. Okafor)</b></span></div>' +
        '<div class="wp-note">High-risk criteria per AS 2401 ¶.61 / AU-C 240.A47: entries made at unusual times, by unexpected users, to unrelated or seldom-used accounts, round amounts, little or no description, post-closing entries, entries without approval.</div>';
    },
    steps: [
      rowPick('je', 'Select the entry that meets the high-risk criteria and explains the 2410 variance.', [
        { t: 'JE #' }, { t: 'Posted' }, { t: 'Eff.' }, { t: 'User' }, { t: 'Source' }, { t: 'Debit' }, { t: 'Credit' }, { t: 'Amount', num: 1 }, { t: 'Description', wrap: 1 }, { t: 'Approver' },
      ], JE.map(j => ({ id: j.id, ok: j.ok, why: j.why, cells: [j.id, j.post, j.eff, j.user, j.src, j.dr, j.cr, j.amt, j.desc, j.appr] }))),
      rowPick('ff', 'GRC emergency-access log for <b>FF_FIN03</b> (a "firefighter" ID with superuser posting rights). Which session posted JE 30917?', [
        { t: 'Session' }, { t: 'Requested by' }, { t: 'Reason', wrap: 1 }, { t: 'Checked out' }, { t: 'Returned' }, { t: 'Activity' }, { t: 'Log reviewed by' },
      ], FF.map(f => ({ id: f.id, ok: f.ok, why: f.why, cells: [f.id, f.who, f.reason, f.out, f.back, f.act, f.rev] }))),
      mc('itgc', 'Victor has no JE posting rights under his own ID. Which ITGC deficiency allowed this entry to post undetected?', [
        { t: 'Ineffective monitoring of privileged (emergency) access — firefighter sessions were not reviewed timely, so the reason given was never compared to the activity performed.', ok: true, why: 'Firefighter IDs are a compensated risk: you grant superuser access in emergencies, and you <i>review every session</i>. Nobody reviewed FF-0423, so a business user reopening a closed period to post an unapproved top-side went unnoticed.' },
        { t: 'Inadequate change management over the TPM interface code.', ok: false, why: 'Nothing about the interface changed — that was the cover story. The session posted a manual JE.' },
        { t: 'Lack of a three-way match in the procure-to-pay cycle.', ok: false, why: 'That’s a business process control in P2P, not an ITGC, and it isn’t what let this JE post.' },
        { t: 'Missing bank reconciliation review.', ok: false, why: 'No cash moved in JE 30917. It’s a pure accrual entry.' },
      ]),
    ],
    conclusion: 'JE 30917 ($8,450,000) was posted by Victor Kessane through firefighter session FF-0423, after the period was locked, with no approval and no review.',
  };

  // ================================================================ P6 — quantification & accounting consequences
  const LOSS = [
    ['Q3 FY24', 1240000, 0, 0, 1240000, 0],
    ['Q4 FY24', 1875000, 0, 0, 1875000, 0],
    ['Q1 FY25', 2310000, 0, 0, 2310000, 0],
    ['Q2 FY25', 2685000, 0, 0, 2685000, 0],
    ['Q3 FY25', 2780000, 0, 0, 2780000, 0],
    ['Q4 FY25', 4380000, -150000, 0, 4230000, 0],
    ['Q1 FY26', 6820000, 0, 0, 6820000, 0],
    ['Q2 FY26', 10560000, -1000000, 0, 9560000, -98200],
    ['Q3 FY26', 11446750, 0, -341750, 11105000, 0],
  ];
  P.defs.wpLOSS = {
    ref: 'WP F-Q-01 · LOSS QUANTIFICATION & ACCOUNTING CONSEQUENCES',
    title: 'Meridian Retail Solutions LLC — Vendor V-22688, Inception to Date',
    intro: 'They will ask "how much." Answer with cash, not with invoices. Then tell them how to fix the books.',
    header() {
      let h = '<div class="wp-meta"><span>Source: <b>AP subledger, vendor V-22688 (T. Nguyen)</b></span><span>Period: <b>06/28/2024 (vendor creation) – 09/30/2026</b></span><span>$ whole dollars</span></div>';
      h += '<div class="tbl-wrap"><table class="ledger"><tr><th>Fiscal qtr</th><th class="num">Invoiced</th><th class="num">Credit memos applied</th><th class="num">Unpaid (open AP 9/30/26)</th><th class="num">Cash disbursed</th><th class="num">Returned by bank</th></tr>';
      for (const r of LOSS) h += '<tr><td>' + r[0] + '</td>' + r.slice(1).map(v => '<td class="num">' + (v ? acct(v) : '—') + '</td>').join('') + '</tr>';
      h += '</table></div>';
      h += '<div class="wp-note">Credit memos: issued by Meridian to clear invoices T. Nguyen flagged as duplicates — non-cash, applied against open invoices.<br>Returned by bank (Q2 FY26): two wires rejected by beneficiary bank, reason "account name mismatch"; funds returned to Halvorsen’s operating account 05/14/2026. Meridian re-invoiced; re-sent amounts are within Q3 FY26 disbursements.<br>Open AP: payment hold placed 10/06/2026 by Treasury at your request.</div>';
      return h;
    },
    steps: [
      num('loss', 'What is Halvorsen’s net cash loss to Meridian from inception through 9/30/2026?', {
        answerText: '$42,506,800', placeholder: 'e.g. 1,234,567', suffix: 'USD',
        check(v) {
          if (Math.abs(v - 42506800) < 1.5) return true;
          if (Math.abs(v * 1000 - 42506800) < 1000) return true;
          if (Math.abs(v - 44096750) < 2) return 'That’s what Meridian <i>billed</i>. Credit memos and unpaid invoices never cost Halvorsen a dollar.';
          if (Math.abs(v - 42605000) < 2) return 'Close. That’s gross cash out the door. Did all of it stay gone?';
          if (Math.abs(v - 42946750) < 2) return 'You netted credit memos but not open AP. Those invoices are on hold — they’ll never be paid.';
          if (Math.abs(v - 42703200) < 2) return 'Check the sign on the bank returns — returned wires <i>reduce</i> the loss.';
          return 'Doesn’t tie. Loss = cash that left and didn’t come back.';
        },
      }, { okMsg: '$42,605,000 disbursed less $98,200 returned = <b>$42,506,800</b>.' }),
      mc('fix', 'JE 30917 is still in the Q3 ledger, and the 10-Q hasn’t been filed. What is the appropriate correction?', [
        { t: 'Dr 2410 Accrued Trade Promotion / Cr 4100 Trade Promotion $8,450,000 — reverse it in Q3, before issuance.', ok: true, why: 'It’s an error, not an estimate: there was never any basis for it. Remove it from the period it was booked in, before the financial statements are issued.' },
        { t: 'Leave it; reverse in Q4 prospectively as a change in accounting estimate under ASC 250.', ok: false, why: 'ASC 250 change-in-estimate treatment requires a good-faith estimate that new information later revised. An entry with no support and a fabricated purpose is an <i>error</i>. You can’t launder it into an estimate.' },
        { t: 'Dr Retained Earnings / Cr 2410 — it relates to prior-period fraud.', ok: false, why: 'JE 30917 was booked in the current period. It gets corrected in the current period. Retained earnings is for correcting errors in previously <i>issued</i> statements.' },
        { t: 'Dr 4100 / Cr 2410 an additional $8,450,000 to reflect the stolen cash.', ok: false, why: 'That doubles down on hiding the theft in contra-revenue. The cash loss is a separate matter — and it isn’t trade promotion.' },
      ]),
      mc('sab108', 'Earlier Meridian payments were absorbed in gross-to-net trade spend in periods already reported. To evaluate whether prior financial statements must be restated, management should quantify the misstatements using:', [
        { t: 'The rollover approach only — income-statement effect of the current-year misstatement.', ok: false, why: 'Rollover alone lets errors accumulate on the balance sheet indefinitely. SAB 108 closed that loophole.' },
        { t: 'The iron curtain approach only — the cumulative balance sheet misstatement at period-end.', ok: false, why: 'Iron curtain alone ignores how the error distorted each period’s income statement.' },
        { t: 'Both the rollover and iron curtain approaches (SAB 108’s "dual approach"), evaluating materiality quantitatively and qualitatively under SAB 99 — including that the misstatement conceals an unlawful transaction by an officer.', ok: true, why: 'Dual approach, with SAB 99 qualitative factors. Even if each quarter’s amount is small relative to $6.2B of sales, a misstatement that conceals an executive’s theft is qualitatively material.' },
        { t: 'ASC 250 change in accounting estimate — prospective application only.', ok: false, why: 'There’s no estimate here. There’s theft disguised as one.' },
      ]),
    ],
    conclusion: '$42,506,800 in net cash diverted to Meridian. Q3 must be corrected before the 10-Q, and prior periods evaluated under SAB 108.',
  };

  G.puzzles = P;
})();
