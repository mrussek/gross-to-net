// The finale confrontation: rebut each claim by presenting the right evidence.
// Each episode supplies a config: { title, place, objection, credLabel, rounds, lose(), finale() }.
(function () {
  const U = G.util;
  const root = document.getElementById('hearing');
  const H = { open: false };
  H.isOpen = () => H.open;

  let st, cfg;

  H.start = function (config) {
    cfg = config;
    return new Promise(resolve => {
      H.open = true;
      root.classList.remove('hidden');
      const saved = G.state.hearing || {};
      st = { round: saved.round || 0, cred: saved.cred != null ? saved.cred : 5, pressed: false, mode: 'claim', flash: null, resolve };
      render();
    });
  };

  function persist() { G.state.hearing = { round: st.round, cred: st.cred }; G.save(); }

  function hearts() {
    let s = '';
    for (let i = 0; i < 5; i++) s += i < st.cred ? '♥' : '<span class="lost">♥</span>';
    return s;
  }

  const sub = t => t.replace(/\{last\}/g, G.state.lastName).replace(/\{first\}/g, G.state.firstName);

  function render() {
    if (st.round >= cfg.rounds.length) return finish();
    const R = cfg.rounds[st.round];
    const who = G.cast[R.who];
    root.innerHTML = '';
    const shell = U.el('div', { class: 'hr-shell' });
    shell.innerHTML = `<div class="hr-top"><div><div class="hr-title">${U.esc(cfg.title)}</div><div class="hr-round">CLAIM ${st.round + 1} OF ${cfg.rounds.length} · ${U.esc(cfg.place)}</div></div><div class="hr-cred" title="${U.esc(cfg.credLabel || 'Credibility')}">${hearts()}</div></div>`;
    const stmt = U.el('div', { class: 'hr-statement' });
    const pc = U.el('canvas', { width: 32, height: 32 });
    G.render.drawPortrait(pc, who.look);
    stmt.appendChild(pc);
    stmt.appendChild(U.el('div', {}, `<div class="hr-who">${U.esc(who.name)}<small>${U.esc(who.title)}</small></div><div class="hr-quote">“${U.rich(sub(R.claim))}”</div>` + (st.pressed ? `<div class="hr-press">${U.rich(sub(R.press))}</div>` : '')));
    shell.appendChild(stmt);

    const actions = U.el('div', { class: 'hr-actions' });
    if (!st.pressed) {
      const bPress = U.el('button', {}, '“Press” — ask a follow-up');
      bPress.addEventListener('click', () => { st.pressed = true; G.audio.select(); render(); });
      actions.appendChild(bPress);
    }
    const bPresent = U.el('button', { class: 'primary' }, '⚑ Present evidence');
    bPresent.addEventListener('click', () => { st.mode = st.mode === 'present' ? 'claim' : 'present'; G.audio.select(); render(); });
    actions.appendChild(bPresent);
    const bPhone = U.el('button', {}, '\u{1F4F1} Check phone');
    bPhone.addEventListener('click', () => G.ui.openPhone());
    actions.appendChild(bPhone);
    shell.appendChild(actions);

    if (st.flash) shell.appendChild(U.el('div', { class: 'hr-flash ' + st.flash.kind }, U.rich(sub(st.flash.text))));

    if (st.mode === 'present') {
      const grid = U.el('div', { class: 'hr-evidence' });
      for (const id of G.state.evidence) {
        const d = G.story.evidence[id];
        const b = U.el('button', {}, '<b>' + U.esc(d.title) + '</b>' + U.esc(d.short));
        b.addEventListener('click', () => present(id));
        grid.appendChild(b);
      }
      shell.appendChild(grid);
    }
    root.appendChild(shell);
  }

  async function present(id) {
    const R = cfg.rounds[st.round];
    if (R.evidence.includes(id)) {
      st.flash = null;
      root.innerHTML = '<div class="objection">' + U.esc(cfg.objection || 'EXCEPTION NOTED!') + '</div>';
      G.audio.objection();
      G.engine.shakeScreen(6);
      await U.sleep(1100);
      root.classList.add('hidden');
      for (const [who, line] of R.after) await (who ? G.ui.say(who, sub(line)) : G.ui.narrate(sub(line)));
      root.classList.remove('hidden');
      st.round++; st.pressed = false; st.mode = 'claim';
      persist();
      render();
    } else {
      st.cred--;
      G.audio.fail();
      G.engine.shakeScreen(3);
      st.flash = { kind: 'bad', text: (R.wrongs && R.wrongs[id] || R.wrong) + ' — ' + (cfg.reaction || 'The room goes quiet.') + ' (−1 credibility)' };
      st.mode = 'claim';
      persist();
      G.hints.fail('hearing.' + R.key);
      if (st.cred <= 0) {
        render();
        await U.sleep(900);
        root.classList.add('hidden');
        await cfg.lose();
        G.state.hearing = { round: st.round, cred: 5 };
        G.save();
        H.open = false; root.innerHTML = '';
        st.resolve('lose');
        return;
      }
      render();
    }
  }

  async function finish() {
    root.classList.add('hidden');
    await cfg.finale();
    G.state.hearing = null;
    H.open = false;
    root.innerHTML = '';
    st.resolve('win');
  }

  G.hearing = H;
})();
