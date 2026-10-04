// Episode framework: registry, story builder, hint escalation, shared helpers, endings, saves.
(function () {
  const U = G.util;

  // ---------------------------------------------------------------- the player (shared across episodes)
  const YOU = { name: 'You', title: '', look: { skin: '#d8a77c', hair: '#3a2a1e', hairStyle: 'short', shirt: '#e8e4d8', jacket: '#3d5f88', pants: '#2a2f3a' } };

  // ---------------------------------------------------------------- registry
  G.episodes = [];
  G.registerEpisode = ep => { G.episodes.push(ep); G.episodes.sort((a, b) => a.num - b.num); };
  G.episodeById = id => G.episodes.find(e => e.id === id);

  G.loadEpisode = function (ep) {
    G.ep = ep;
    G.maps = ep.buildMaps();
    // fresh copy each load so per-episode costume changes (hard hats...) don't leak between episodes
    G.cast = Object.assign({ you: { name: YOU.name, title: YOU.title, look: Object.assign({}, YOU.look, ep.youLook || {}) } }, ep.cast);
    G.story = ep.story;
    G.puzzles.defs = ep.puzzles;
    G.ui.setContact(ep.contact);
    G.engine.loadMaps();
  };

  // ---------------------------------------------------------------- saves & profile
  G.saveKey = ep => 'gtn_ep_' + ep.id;
  G.profile = () => U.store.get('gtn_profile') || { done: {} };
  G.setProfile = p => U.store.set('gtn_profile', p);
  // One-time migration of the pre-episodes save into Episode 1's slot.
  (function migrate() {
    const old = U.store.get('gtn_save');
    if (old && !U.store.get('gtn_ep_ep1')) U.store.set('gtn_ep_ep1', old);
    if (old) U.store.del('gtn_save');
  })();

  // ---------------------------------------------------------------- hints
  G.hints = {
    thresholds(key) { return key.startsWith('wp') ? [2, 3, 5] : [1, 2, 3]; },
    fail(key) {
      const s = G.state;
      s.fails[key] = (s.fails[key] || 0) + 1;
      s.totalFails++;
      const tier = G.hints.thresholds(key).indexOf(s.fails[key]) + 1;
      const h = G.ep.hints[key];
      if (tier > 0 && h && h[tier - 1]) {
        s.hintsSent = (s.hintsSent || 0) + 1;
        setTimeout(() => G.ui.text(h[tier - 1], { tier }), 900);
      }
      if (s.totalFails === 10 && !s.flags.frustrated) {
        s.flags.frustrated = true;
        setTimeout(() => G.ui.text(G.ep.frustrated), 4000);
      }
      G.save();
    },
  };

  // ---------------------------------------------------------------- kit: helpers episodes share
  const K = G.kit = {};
  K.S = () => G.state;
  K.F = () => G.state.flags;
  K.E = () => G.engine;
  K.say = (w, t) => G.ui.say(w, t);
  K.narrate = t => G.ui.narrate(t);
  K.choose = (w, p, o) => G.ui.choose(w, p, o);
  K.text = (t, o) => G.ui.text(t, o);
  K.sleep = U.sleep;
  K.done = id => !!(G.state.puzzles[id] && G.state.puzzles[id].done);
  K.refresh = () => { G.engine.refreshActors(); G.ui.updateHud(); G.save(); };
  K.obtain = label => { G.ui.toast('OBTAINED', label, 'info'); G.audio.select(); };
  K.addEvidence = id => {
    const s = G.state;
    if (!s.evidence.includes(id)) { s.evidence.push(id); G.ui.notice('Filed: ' + G.story.evidence[id].title); }
  };
  // Play a list of [speaker, line] pairs; speaker null = narration.
  K.lines = async arr => { for (const [w, l] of arr) await (w ? G.ui.say(w, l) : G.ui.narrate(l)); };
  // A dialogue choice that must be answered correctly; wrong answers count as failures and escalate hints.
  K.gate = async (who, prompt, options, correct, hintKey, onWrong) => {
    for (;;) {
      const c = await G.ui.choose(who, prompt, options);
      if (c === correct) return c;
      G.hints.fail(hintKey);
      if (onWrong) await onWrong(c);
    }
  };

  K.toChapter = async (n, card, place) => {
    const s = G.state;
    await G.ui.blackout();
    s.chapter = n;
    s.night = !!(place && place.night);
    await G.ui.card(card);
    if (place) G.engine.placePlayer(place.map || s.map, place.x, place.y, place.dir || 'down');
    K.refresh();
    await G.ui.reveal();
  };
  K.travel = async (map, x, y, dir, opts = {}) => {
    if (opts.sound) opts.sound();
    await G.ui.blackout();
    if (opts.night != null) G.state.night = opts.night;
    G.engine.placePlayer(map, x, y, dir);
    await G.ui.reveal();
  };

  K.runPuzzle = async id => {
    const finished = await G.puzzles.open(id);
    if (finished) {
      K.addEvidence(G.ep.puzzleEvidence[id]);
      K.refresh();
      await U.sleep(300);
      await G.story.beats();
    }
  };

  // Shared epilogue screen + profile bookkeeping.
  K.ending = async ({ headline, headlineLabel, epilogue, title }) => {
    const s = G.state, ep = G.ep;
    s.chapter = ep.story.epilogueChapter;
    G.save();
    const mins = Math.max(1, Math.round((Date.now() - s.startedAt) / 60000));
    const f = s.totalFails;
    const ranks = ep.ranks;
    const rank = f <= 2 ? ranks[0] : f <= 6 ? ranks[1] : f <= 12 ? ranks[2] : ranks[3];
    const prof = G.profile();
    prof.done[ep.id] = { fails: f, hints: s.hintsSent || 0, rank };
    G.setProfile(prof);
    const next = G.episodes.find(e => e.num === ep.num + 1);
    const html = '<div class="ending"><div class="card-day">EPISODE ' + ep.num + ' · EPILOGUE</div><h2>' + U.esc(title || ep.title) + '</h2>' +
      '<div class="stats"><div class="stat"><b>' + U.esc(headline) + '</b><small>' + U.esc(headlineLabel) + '</small></div><div class="stat"><b>' + f + '</b><small>Missteps</small></div><div class="stat"><b>' + (s.hintsSent || 0) + '</b><small>Tips from ' + U.esc(ep.contact.name) + '</small></div></div>' +
      '<div class="rank">Rating: ' + U.esc(rank) + '</div><p style="color:#7d8794;font-size:12px">' + mins + ' minutes on the case</p>' +
      '<div class="epilogue">' + epilogue.map(p => '<p>' + U.esc(p) + '</p>').join('') + '</div>' +
      '<div style="margin-top:18px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
      (next ? '<button class="big-btn" id="btn-next-ep">Episode ' + next.num + ': ' + U.esc(next.title) + ' →</button>' : '') +
      '<button class="big-btn ghost" id="btn-ep-select">Episode select</button></div></div>';
    await G.ui.blackout();
    G.ui.card({ html, wait: false });
    if (next) document.getElementById('btn-next-ep').addEventListener('click', () => G.startEpisode(next, true));
    document.getElementById('btn-ep-select').addEventListener('click', () => G.showTitle());
  };

  // ---------------------------------------------------------------- story builder
  const GENERIC_FLAVOR = { P: 'A plant. Fake. Somebody waters it anyway.', F: 'A filing cabinet. Locked.', B: 'Binders and books. Nothing you need.', S: 'Servers, blinking.', Q: 'A vending machine.', Y: 'A copier.', R: 'A fridge.', H: 'A pallet rack, loaded to the top beam.', j: 'A shrink-wrapped pallet.', f: 'A forklift. Keys not in it.', n: 'Production equipment. Loud, hot, and expensive.', l: 'Lockers. Most have padlocks.', o: 'A snowbank, gray at the edges.', e: 'An agave plant. It looks thirstier than it is.', G: 'A glass-door cooler, fully stocked.', v: 'A conveyor.' };

  G.makeStory = function (def) {
    const story = {
      evidence: def.evidence,
      epilogueChapter: def.chapters.length - 1,
      chapterInfo: () => def.chapters[G.state.chapter] || def.chapters[0],
      clock: () => def.clock(G.state),
      location: () => def.location(G.state),
      objective: () => def.objective(G.state),
      npcPos: id => def.npcPos(id, G.state),
      nightLights: mapName => (def.nightLights ? def.nightLights(mapName, G.state) : []),
      newGame: def.newGame,
      beats: def.beats,
      async talk(id) {
        const T = def.talk[id];
        if (T) await T(G.state.chapter, G.state.flags);
        K.refresh();
      },
      async use(id, x, y) {
        if (def.use && (await def.use(id, G.state.chapter, G.state.flags, x, y))) return;
        const fl = def.flavor[id];
        if (fl) await G.ui.narrate(typeof fl === 'function' ? fl(G.state.chapter, G.state.flags) : fl);
      },
      async flavorObj(ch) {
        const t = (def.flavorObj && def.flavorObj[ch]) || GENERIC_FLAVOR[ch];
        if (t) await G.ui.narrate(t);
      },
      onStep(x, y) { if (def.onStep) def.onStep(x, y, G.state); },
      async resume() {
        await G.engine.script(async () => {
          if (G.state.chapter === story.epilogueChapter) return def.ending();
          if (def.onResume) def.onResume(G.state);
          await story.beats();
        });
      },
    };
    return story;
  };
})();
