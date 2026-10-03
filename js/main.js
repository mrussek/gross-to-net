// Boot, title screen, save/load, and global keyboard routing.
(function () {
  const $ = id => document.getElementById(id);
  const SAVE_KEY = 'gtn_save';

  function newState(first, last) {
    return {
      v: 1,
      firstName: first, lastName: last, playerName: first + ' ' + last,
      map: 'floor', px: 21, py: 23, dir: 'down',
      chapter: 0, night: false,
      flags: {}, evidence: [], messages: [], unread: 0,
      fails: {}, totalFails: 0, hintsSent: 0,
      puzzles: {}, hearing: null,
      startedAt: Date.now(),
    };
  }

  G.save = function () {
    if (!G.state || !G.started) return;
    G.state.px = G.engine.player.x; G.state.py = G.engine.player.y; G.state.dir = G.engine.player.dir;
    G.util.store.set(SAVE_KEY, G.state);
  };

  function begin() {
    G.started = true;
    $('title').classList.add('hidden');
    $('hud').classList.remove('hidden');
    G.audio.init();
  }

  $('btn-new').addEventListener('click', async () => {
    const first = ($('name-first').value || 'Alex').trim().slice(0, 14) || 'Alex';
    const last = ($('name-last').value || 'Reyes').trim().slice(0, 16) || 'Reyes';
    G.state = newState(first, last);
    G.engine.placePlayer('floor', 21, 23, 'down');
    begin();
    G.ui.renderPhone();
    G.ui.updateHud();
    G.save();
    await G.story.newGame();
  });

  $('btn-continue').addEventListener('click', async () => {
    const s = G.util.store.get(SAVE_KEY);
    if (!s) return;
    G.state = Object.assign(newState(s.firstName, s.lastName), s);
    G.engine.placePlayer(G.state.map, G.state.px, G.state.py, G.state.dir);
    begin();
    G.ui.renderPhone();
    G.ui.updateHud();
    await G.story.resume();
  });

  const saved = G.util.store.get(SAVE_KEY);
  if (saved && saved.firstName) {
    $('btn-continue').classList.remove('hidden');
    $('btn-continue').textContent = 'Continue — ' + saved.firstName + ' ' + saved.lastName;
  }

  $('btn-phone').addEventListener('click', () => G.ui.togglePhone());
  $('btn-journal').addEventListener('click', () => G.ui.toggleJournal());
  $('btn-sound').addEventListener('click', toggleSound);
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

  G.engine.init();
})();
