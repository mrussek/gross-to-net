// Boot, episode select, save/load, and global keyboard routing.
(function () {
  const $ = id => document.getElementById(id);
  const U = G.util;

  function newState(ep, first, last) {
    return {
      v: 2, epId: ep.id,
      firstName: first, lastName: last, playerName: first + ' ' + last,
      map: ep.start.map, px: ep.start.x, py: ep.start.y, dir: ep.start.dir || 'down',
      chapter: 0, night: false,
      flags: {}, evidence: [], messages: [], unread: 0,
      fails: {}, totalFails: 0, hintsSent: 0,
      puzzles: {}, hearing: null,
      startedAt: Date.now(),
    };
  }

  G.save = function () {
    if (!G.state || !G.started || !G.ep) return;
    G.state.px = G.engine.player.x; G.state.py = G.engine.player.y; G.state.dir = G.engine.player.dir;
    U.store.set(G.saveKey(G.ep), G.state);
  };

  function names() {
    const first = ($('name-first').value || 'Alex').trim().slice(0, 14) || 'Alex';
    const last = ($('name-last').value || 'Reyes').trim().slice(0, 16) || 'Reyes';
    const p = G.profile(); p.first = first; p.last = last; G.setProfile(p);
    return [first, last];
  }

  // Close anything left open from a previous episode or ending card.
  function resetOverlays() {
    const ui = G.ui;
    ui.closePhone(); ui.closeJournal();
    if (G.puzzles.isOpen()) G.puzzles.close();
    $('dialog').classList.add('hidden'); ui.dialogOpen = false; ui._advance = null; ui._choice = null;
    $('hearing').classList.add('hidden'); $('hearing').innerHTML = ''; G.hearing.open = false;
    $('fade').classList.add('hidden'); ui.cardOpen = false;
    $('toasts').innerHTML = '';
    G.engine.scripted = 0; G.engine.held = []; G.engine.autoPath = null;
  }

  G.startEpisode = async function (ep, fresh) {
    const [first, last] = names();
    G.started = false;
    resetOverlays();
    G.loadEpisode(ep);
    const saved = U.store.get(G.saveKey(ep));
    $('title').classList.add('hidden');
    $('hud').classList.remove('hidden');
    G.audio.init();
    if (saved && !fresh) {
      G.state = Object.assign(newState(ep, saved.firstName, saved.lastName), saved);
      G.engine.placePlayer(G.state.map, G.state.px, G.state.py, G.state.dir);
      G.started = true;
      G.ui.renderPhone(); G.ui.updateHud();
      await G.story.resume();
    } else {
      G.state = newState(ep, first, last);
      G.engine.placePlayer(ep.start.map, ep.start.x, ep.start.y, ep.start.dir || 'down');
      G.started = true;
      G.ui.renderPhone(); G.ui.updateHud();
      G.save();
      await G.story.newGame();
    }
  };

  G.showTitle = function () {
    G.save();
    G.started = false;
    resetOverlays();
    $('hud').classList.add('hidden');
    $('title').classList.remove('hidden');
    renderEpisodes();
  };

  function renderEpisodes() {
    const prof = G.profile();
    if (prof.first) { $('name-first').value = prof.first; $('name-last').value = prof.last; }
    const list = $('episode-list');
    list.innerHTML = '';
    for (const ep of G.episodes) {
      const saved = U.store.get(G.saveKey(ep));
      const done = prof.done[ep.id];
      const inProgress = saved && saved.chapter < ep.story.epilogueChapter;
      const card = U.el('div', { class: 'ep-card' + (done ? ' solved' : '') });
      let status = '';
      if (inProgress) status = 'In progress — ' + ((ep.chapters[saved.chapter] || {}).title || '');
      else if (done) status = '★ Solved — ' + done.rank;
      card.innerHTML = `<div class="ep-num">EPISODE ${ep.num}</div><div class="ep-title">${U.esc(ep.title)}</div><div class="ep-sub">${U.esc(ep.subtitle)}</div>` + (status ? `<div class="ep-status">${U.esc(status)}</div>` : '');
      const btns = U.el('div', { class: 'ep-btns' });
      const play = U.el('button', { class: 'big-btn' }, inProgress ? 'Continue' : done ? 'Replay' : 'Play');
      play.addEventListener('click', () => G.startEpisode(ep, !inProgress));
      btns.appendChild(play);
      if (inProgress) {
        const restart = U.el('button', { class: 'big-btn ghost', title: 'Start this episode over' }, 'Restart');
        restart.addEventListener('click', () => { if (confirm('Restart Episode ' + ep.num + '? Your progress in it will be lost.')) G.startEpisode(ep, true); });
        btns.appendChild(restart);
      }
      card.appendChild(btns);
      list.appendChild(card);
    }
  }

  $('btn-phone').addEventListener('click', () => G.ui.togglePhone());
  $('btn-journal').addEventListener('click', () => G.ui.toggleJournal());
  $('btn-sound').addEventListener('click', toggleSound);
  $('btn-menu').addEventListener('click', () => {
    if (G.engine.scripted || G.ui.blocking()) { G.ui.notice('Finish the current scene first — progress saves automatically.', 'bad'); return; }
    G.showTitle();
  });
  function toggleSound() { G.audio.muted = !G.audio.muted; G.ui.updateHud(); }

  document.addEventListener('keydown', e => {
    if (!G.started) return;
    if (e.target && e.target.tagName === 'INPUT') return;
    G.audio.init();
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const ui = G.ui;

    if (k === 'p') { e.preventDefault(); ui.togglePhone(); return; }
    if (ui.phoneOpen) { if (k === 'Escape') ui.closePhone(); return; }
    if (k === 'm') { toggleSound(); return; }
    if (k === 'j' && !G.puzzles.isOpen() && !G.hearing.isOpen() && !ui.cardOpen) { e.preventDefault(); ui.toggleJournal(); return; }
    if (ui.journalOpen) { if (k === 'Escape') ui.closeJournal(); return; }
    if (ui.dialogOpen) { e.preventDefault(); ui.dialogKey(k); return; }
    if (G.puzzles.isOpen()) { if (k === 'Escape') G.puzzles.close(); return; }
    if (G.hearing.isOpen() || ui.cardOpen) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    if (e.repeat && (k === 'e' || k === ' ' || k === 'Enter')) return;
    G.engine.keyDown(e);
  });
  document.addEventListener('keyup', e => G.engine.keyUp(e));
  window.addEventListener('touchstart', () => {
    if (G.touch) return;
    G.touch = true;
    document.documentElement.classList.add('touch');
    G.engine.resize();
  }, { passive: true });

  G.engine.init();
  renderEpisodes();
})();
