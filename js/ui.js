// DOM overlays: dialog, phone, case file, toasts, chapter cards, HUD.
(function () {
  const $ = id => document.getElementById(id);
  const U = G.util;

  const ui = {
    dialogOpen: false,
    phoneOpen: false,
    journalOpen: false,
    cardOpen: false,
    _advance: null,
    _choice: null,
    _typing: null,
  };

  ui.blocking = () => ui.dialogOpen || ui.phoneOpen || ui.journalOpen || ui.cardOpen || G.puzzles.isOpen() || G.hearing.isOpen();

  // ---------------------------------------------------------------- dialog
  function speaker(who) {
    if (!who) return null;
    if (who === 'you') return { name: G.state.playerName, title: 'You', look: G.cast.you.look };
    const c = G.cast[who];
    if (c) return c;
    return { name: who, title: '' };
  }

  ui.say = function (who, text, opts = {}) {
    return new Promise(resolve => {
      const box = $('dialog');
      const sp = speaker(who);
      box.classList.remove('hidden');
      box.classList.toggle('narration', !sp);
      ui.dialogOpen = true;
      const pc = $('portrait');
      if (sp && sp.look) { pc.classList.remove('none'); G.render.drawPortrait(pc, sp.look); }
      else pc.classList.add('none');
      $('dialog-name').innerHTML = sp ? U.esc(sp.name) + (sp.title ? '<small>' + U.esc(sp.title) + '</small>' : '') : '';
      $('dialog-choices').innerHTML = '';
      $('dialog-next').classList.add('hidden');
      const target = $('dialog-text');
      const full = U.rich(text.replace(/\{name\}/g, G.state.playerName).replace(/\{last\}/g, G.state.lastName).replace(/\{first\}/g, G.state.firstName));
      // Typewriter over plain text, then swap in rich HTML.
      const plain = full.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      let i = 0;
      target.textContent = '';
      const finish = () => {
        clearInterval(ui._typing); ui._typing = null;
        target.innerHTML = full;
        $('dialog-next').classList.remove('hidden');
        ui._advance = () => {
          ui._advance = null;
          if (!opts.keepOpen) closeDialog();
          resolve();
        };
      };
      ui._advance = finish;
      ui._typing = setInterval(() => {
        i += 2;
        target.textContent = plain.slice(0, i);
        if (i % 6 === 0 && sp) G.audio.blip();
        if (i >= plain.length) finish();
      }, 16);
    });
  };

  ui.narrate = (text) => ui.say(null, text);

  // Show a prompt line (optional) then choices. Resolves to chosen index.
  ui.choose = function (who, prompt, options) {
    return new Promise(async resolve => {
      if (prompt) await ui.say(who, prompt, { keepOpen: true });
      const box = $('dialog');
      box.classList.remove('hidden');
      ui.dialogOpen = true;
      if (!prompt) {
        const sp = speaker(who);
        $('dialog-name').innerHTML = sp ? U.esc(sp.name) : '';
        $('dialog-text').innerHTML = '';
        const pc = $('portrait');
        if (sp && sp.look) { pc.classList.remove('none'); G.render.drawPortrait(pc, sp.look); } else pc.classList.add('none');
      }
      $('dialog-next').classList.add('hidden');
      const wrap = $('dialog-choices');
      wrap.innerHTML = '';
      let sel = 0;
      const btns = options.map((o, idx) => {
        const b = U.el('button', {}, '<span class="k">' + (idx + 1) + '</span>' + U.rich(o));
        b.addEventListener('click', () => pick(idx));
        b.addEventListener('mouseenter', () => { sel = idx; mark(); });
        wrap.appendChild(b);
        return b;
      });
      const mark = () => btns.forEach((b, j) => b.classList.toggle('sel', j === sel));
      mark();
      function pick(idx) {
        ui._choice = null; ui._advance = null;
        G.audio.select();
        closeDialog();
        resolve(idx);
      }
      ui._choice = {
        move(d) { sel = (sel + d + btns.length) % btns.length; mark(); },
        pick(idx) { if (idx == null) idx = sel; if (idx >= 0 && idx < btns.length) pick(idx); },
      };
      ui._advance = null;
    });
  };

  function closeDialog() {
    $('dialog').classList.add('hidden');
    $('dialog-choices').innerHTML = '';
    ui.dialogOpen = false;
  }

  ui.dialogKey = function (key) {
    if (ui._choice) {
      if (key === 'ArrowUp' || key === 'w') ui._choice.move(-1);
      else if (key === 'ArrowDown' || key === 's') ui._choice.move(1);
      else if (key === 'Enter' || key === ' ' || key === 'e') ui._choice.pick();
      else if (/^[1-9]$/.test(key)) ui._choice.pick(+key - 1);
      return;
    }
    if ((key === 'Enter' || key === ' ' || key === 'e') && ui._advance) ui._advance();
  };
  $('dialog').addEventListener('click', e => { if (!ui._choice && ui._advance && e.target.tagName !== 'BUTTON') ui._advance(); });

  // ---------------------------------------------------------------- phone
  ui.text = function (text, opts = {}) {
    const S = G.state;
    text = text.replace(/\{first\}/g, G.state.firstName).replace(/\{last\}/g, G.state.lastName);
    const msg = { text, tier: opts.tier || 0, time: G.story.clock(), me: !!opts.me };
    S.messages.push(msg);
    if (!opts.me) {
      G.audio.buzz();
      // already reading the thread: no badge, no duplicate pop-up
      if (!ui.phoneOpen) S.unread = (S.unread || 0) + 1;
      if (!ui.phoneOpen) ui.toast(G.ep.contact.name, text.length > 140 ? text.slice(0, 137) + '…' : text, opts.tier ? 'hint' : '', () => ui.openPhone());
    }
    ui.renderPhone();
    ui.updateHud();
    G.save();
    return U.sleep(500);
  };

  ui.renderPhone = function () {
    const S = G.state;
    const th = $('phone-thread');
    th.innerHTML = '';
    let lastTime = null;
    for (const m of S.messages) {
      if (m.time !== lastTime) { th.appendChild(U.el('div', { class: 'msg-time' }, U.esc(m.time))); lastTime = m.time; }
      th.appendChild(U.el('div', { class: 'msg' + (m.me ? ' me' : '') + (m.tier ? ' hint' + m.tier : '') }, U.rich(m.text)));
    }
    th.scrollTop = th.scrollHeight;
    $('phone-clock').textContent = G.story.clock();
  };

  // Phone header shows the current episode's whistleblower.
  ui.setContact = function (c) {
    document.querySelector('.phone-avatar').textContent = c.avatar;
    document.querySelector('.phone-header b').textContent = c.name;
    document.querySelector('.phone-header small').textContent = c.sub;
    document.querySelector('.phone-avatar').style.borderColor = c.color || '';
    document.querySelector('.phone-avatar').style.color = c.color || '';
  };

  ui.openPhone = function () {
    if (!G.state.flags.phone_found) return;
    ui.phoneOpen = true;
    G.state.unread = 0;
    ui.renderPhone();
    $('phone').classList.remove('hidden');
    ui.updateHud();
  };
  ui.closePhone = function () { ui.phoneOpen = false; $('phone').classList.add('hidden'); };
  ui.togglePhone = () => (ui.phoneOpen ? ui.closePhone() : ui.openPhone());
  $('phone').addEventListener('click', e => { if (e.target.id === 'phone') ui.closePhone(); });
  $('phone-close').addEventListener('click', () => ui.closePhone());

  // ---------------------------------------------------------------- toasts
  ui.toast = function (title, text, kind = '', onClick) {
    const t = U.el('div', { class: 'toast ' + (kind === 'hint' ? '' : kind) }, '<b>' + U.esc(title) + '</b>' + U.rich(text));
    if (onClick) t.addEventListener('click', onClick);
    const box = $('toasts');
    box.appendChild(t);
    while (box.children.length > 3) box.firstElementChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 5500);
  };
  ui.notice = (text, kind = 'info') => ui.toast(kind === 'bad' ? 'NOTE' : 'CASE FILE', text, kind);

  // ---------------------------------------------------------------- journal
  let journalSel = null;
  ui.openJournal = function () {
    ui.journalOpen = true;
    $('journal').classList.remove('hidden');
    ui.renderJournal();
  };
  ui.closeJournal = function () { ui.journalOpen = false; $('journal').classList.add('hidden'); };
  ui.toggleJournal = () => (ui.journalOpen ? ui.closeJournal() : ui.openJournal());
  ui.renderJournal = function () {
    const list = $('journal-list'), det = $('journal-detail');
    list.innerHTML = '';
    const ev = G.state.evidence;
    if (!ev.length) {
      list.appendChild(U.el('li', { class: 'empty' }, 'No evidence yet. Every fraud leaves a trail through the ledger.'));
      det.innerHTML = '<p><i>Workpapers you complete and statements you obtain will be filed here. You will need them.</i></p>';
      return;
    }
    if (!journalSel || !ev.includes(journalSel)) journalSel = ev[ev.length - 1];
    for (const id of ev) {
      const d = G.story.evidence[id];
      const li = U.el('li', { class: id === journalSel ? 'sel' : '' }, U.esc(d.title) + '<small>' + U.esc(d.ref) + '</small>');
      li.addEventListener('click', () => { journalSel = id; ui.renderJournal(); });
      list.appendChild(li);
    }
    const d = G.story.evidence[journalSel];
    det.innerHTML = '<span class="tag">' + U.esc(d.ref) + '</span><h3>' + U.esc(d.title) + '</h3>' + d.body;
  };
  document.querySelectorAll('[data-close="journal"]').forEach(b => b.addEventListener('click', ui.closeJournal));

  // ---------------------------------------------------------------- chapter cards / fades
  ui.card = function ({ day = '', title = '', text = '', html = null, wait = true }) {
    return new Promise(resolve => {
      const f = $('fade');
      ui.cardOpen = true;
      f.classList.remove('hidden');
      f.classList.remove('clear');
      $('fade-inner').innerHTML = html || (
        (day ? '<div class="card-day">' + U.esc(day) + '</div>' : '') +
        (title ? '<div class="card-title">' + U.esc(title) + '</div>' : '') +
        (text ? '<div class="card-text">' + U.rich(text) + '</div>' : '') +
        (wait ? '<div class="card-hint">' + (G.touch ? 'tap to continue' : 'press space to continue') + '</div>' : ''));
      G.audio.sting();
      if (!wait) { resolve(); return; }
      const go = () => {
        document.removeEventListener('keydown', onKey, true);
        f.removeEventListener('click', go);
        resolve();
      };
      const onKey = e => { if (e.key === ' ' || e.key === 'Enter' || e.key === 'e') { e.preventDefault(); e.stopPropagation(); go(); } };
      setTimeout(() => { document.addEventListener('keydown', onKey, true); f.addEventListener('click', go); }, 400);
    });
  };
  ui.blackout = function () {
    const f = $('fade');
    ui.cardOpen = true;
    $('fade-inner').innerHTML = '';
    f.classList.remove('hidden'); f.classList.add('clear');
    void f.offsetWidth;
    f.classList.remove('clear');
    return U.sleep(650);
  };
  ui.reveal = async function () {
    const f = $('fade');
    f.classList.add('clear');
    await U.sleep(650);
    f.classList.add('hidden');
    ui.cardOpen = false;
  };

  // ---------------------------------------------------------------- HUD
  ui.updateHud = function () {
    if (!G.story || !G.state) return;
    const S = G.state;
    const ch = G.story.chapterInfo();
    $('hud-chapter').textContent = ch.title;
    $('hud-time').textContent = G.story.clock() + '  ·  ' + G.story.location();
    const obj = G.story.objective();
    $('hud-objective').innerHTML = U.rich(obj.text);
    $('btn-phone').classList.toggle('hidden', !S.flags.phone_found);
    const badge = $('phone-badge');
    badge.textContent = S.unread || 0;
    badge.classList.toggle('hidden', !S.unread);
    $('btn-sound').classList.toggle('muted', G.audio.muted);
  };

  G.ui = ui;
})();
