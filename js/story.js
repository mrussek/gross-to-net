// Narrative: cast, chapter flow, dialogue, evidence, and LEDGER's escalating hints.
(function () {
  const U = G.util;
  const say = (w, t) => G.ui.say(w, t);
  const narrate = t => G.ui.narrate(t);
  const choose = (w, p, o) => G.ui.choose(w, p, o);
  const text = (t, o) => G.ui.text(t, o);
  const E = () => G.engine;
  const S = () => G.state;
  const F = () => G.state.flags;
  const done = id => !!(G.state.puzzles[id] && G.state.puzzles[id].done);

  // ================================================================ cast
  G.cast = {
    you: { name: 'You', title: '', look: { skin: '#d8a77c', hair: '#3a2a1e', hairStyle: 'short', shirt: '#e8e4d8', jacket: '#3d5f88', pants: '#2a2f3a' } },
    celeste: { name: 'Celeste Marr', title: 'Corporate Controller', look: { skin: '#eac6a4', hair: '#2b1d14', hairStyle: 'long', shirt: '#d9dde4', jacket: '#2f3b52', pants: '#1d2433' } },
    victor: { name: 'Victor Kessane', title: 'VP, Revenue Management', look: { skin: '#d9a982', hair: '#1a1a1a', hair2: '#777', hairStyle: 'slick', shirt: '#f0f0f0', jacket: '#2a2a30', tie: '#8a1f2b', pants: '#202024' } },
    dale: { name: 'Dale Prentiss', title: 'Accounts Payable Manager', look: { skin: '#f0c8a8', hair: '#8a7a6a', hairStyle: 'bald', shirt: '#c9d6e8', tie: '#5a6b3a', pants: '#9c8a64', glasses: '#333' } },
    tomas: { name: 'Tomas Nguyen', title: 'AP Specialist', look: { skin: '#e0b890', hair: '#111', hairStyle: 'short', shirt: '#3c8d6e', pants: '#333' } },
    jin: { name: 'Jin Lee', title: 'AP Specialist', look: { skin: '#ecc9a2', hair: '#181818', hairStyle: 'bob', shirt: '#b55a7a', pants: '#2a2a3a' } },
    nadia: { name: 'Nadia Okafor', title: 'ERP Security Administrator', look: { skin: '#6b4429', hair: '#1a1410', hairStyle: 'puff', shirt: '#2a2a3a', jacket: '#d09a30', pants: '#2a2a3a', glasses: '#c9a24a' } },
    priya: { name: 'Priya Raman', title: 'Senior Trade Analyst', look: { skin: '#a8754f', hair: '#0e0b0a', hairStyle: 'long', shirt: '#6b4c9a', pants: '#222' } },
    raj: { name: 'Raj Khan', title: 'GL Senior Accountant', look: { skin: '#b98560', hair: '#222', hairStyle: 'short', shirt: '#f4f4f4', pants: '#445' } },
    hannah: { name: 'Hannah Voss', title: 'Close Team Lead', look: { skin: '#f3d6c0', hair: '#9a4a2a', hairStyle: 'bun', shirt: '#4a7a9a', pants: '#2a2a3a' } },
    gwen: { name: 'Gwen Albright', title: 'Reception', look: { skin: '#f2d0b5', hair: '#c08040', hairStyle: 'bob', shirt: '#d24d57', pants: '#2a2a3a' } },
    lena: { name: 'Lena Strand', title: 'Engagement Manager, Whitford & Lowe LLP', look: { skin: '#f3d6c0', hair: '#e2c27a', hairStyle: 'bun', shirt: '#e8e8e8', jacket: '#1f2f4a', pants: '#1f2f4a' } },
    beck: { name: 'Harold Beck', title: 'Chair, Audit Committee', look: { skin: '#e9c3a5', hair: '#dddddd', hairStyle: 'short', shirt: '#f0f0f0', jacket: '#3a3f4a', tie: '#2a4a7a', pants: '#3a3f4a', glasses: '#555' } },
    stokes: { name: 'Brian Stokes', title: 'Chief Financial Officer', look: { skin: '#c99a76', hair: '#888', hairStyle: 'short', shirt: '#f0f0f0', jacket: '#222', tie: '#444', pants: '#222' } },
    gus: { name: 'Gus Moreno', title: 'Night Security', look: { skin: '#c58c5c', hair: '#2c3e66', hairStyle: 'cap', shirt: '#2c3e66', pants: '#1a2236' } },
  };

  // ================================================================ evidence
  const EV = {
    ev_note: { title: 'Sticky note from "L"', ref: 'ITEM 0', short: 'Martin trusted the wrong people.', body: '<p>Found wrapped around a prepaid phone in your desk drawer:</p><p><i>"Martin trusted the wrong people. Don’t. — L"</i></p>' },
    ev_rf: { title: 'GL 2410 roll-forward variance', ref: 'WP C-2410', short: '$8.45M unsupported Q3 top-side; $30.55M over 5 quarters.', body: '<ul><li>Q3 FY26 GL balance in Accrued Trade Promotion: <b>$163.05M</b>; TPM-supported roll-forward: <b>$154.60M</b>.</li><li>Unsupported Q3 top-side: <b>$8.45M</b>. Cumulative "Other — per Rev Mgmt" over five quarters: <b>$30.55M</b>, with no TPM support.</li><li>Third-party provider payments debited to 2410 grew from $5.84M to $14.22M per quarter while TPM promotion volume was flat.</li><li>Martin Oyelaran refused to sign the Q2 rec; escalated to C. Marr 7/28 and was overruled.</li></ul><p>Conclusion: the accrual is being refilled with top-sides to absorb third-party payments, burying them in gross-to-net.</p>' },
    ev_benford: { title: 'Digit analysis — invoice splitting', ref: 'WP F-AP-01', short: 'Digit "4" at 22.6% vs 9.7%; Meridian splits under $50K.', body: '<ul><li>FY26 YTD third-party trade payments (n = 3,830): leading digit 4 at <b>22.6%</b> vs. Benford 9.7%.</li><li><b>Meridian Retail Solutions LLC</b>: 548 payments in $40K–$49,999.99, average $48,372, 94% within $5K of the threshold, 161 same-day multi-invoice clusters, sequential invoice numbers, no contract on file.</li><li>DoA FIN-104 §4.2: AP Manager may approve up to $49,999.99; $50,000+ requires the Controller. The Controller never saw a Meridian invoice.</li></ul>' },
    ev_vm: { title: 'Vendor master match — Meridian ↔ Kessane', ref: 'WP F-VM-02', short: 'Meridian remits to Victor’s sister’s house; Dale created & approved it.', body: '<ul><li>Vendor V-22688 Meridian Retail Solutions LLC remit-to: <b>8812 Larkspur Ct, Mason OH 45040</b>.</li><li>HR file, E-1044 Victor Kessane, emergency contact: <b>Elise Moore (sister), 8812 Larkspur Ct, Mason OH 45040</b>.</li><li>Vendor created <b>and</b> approved by DPRENTISS on 06/28/2024 — no segregation of duties over vendor master changes.</li></ul>' },
    ev_pop: { title: 'Proof-of-performance test', ref: 'WP F-TP-03', short: '4 of 6 Meridian invoices: zero sales lift. Calendar edited by VKESSANE.', body: '<ul><li>4 of 6 sampled Q3 Meridian invoices (<b>$193,400</b>) bill for events with no measurable lift in syndicated POS data: M-30419, M-30420, M-30431, M-30433.</li><li>The other two coincide with retailer-run promotions Meridian did not perform.</li><li>TPM calendar entries marking all six "Executed" were modified by VKESSANE on 10/01/2026 at 22:14.</li><li>Even real third-party services are opex under ASC 606-10-32-25/26 — not consideration payable to a customer.</li></ul>' },
    ev_dale: { title: 'Statement of Dale Prentiss', ref: 'INTERVIEW 10/07', short: 'Victor directed Meridian setup; Dale paid $4K/month.', body: '<p>Records Room, 10/07/2026, 7:58 PM. Dale Prentiss, AP Manager, interrupted shredding Meridian vendor setup documents.</p><ul><li>Set up Meridian at Victor Kessane’s direction in June 2024; told it was "Victor’s sister’s consulting firm — totally legit."</li><li>Instructed to keep every invoice under $50,000. Received $4,000/month in "consulting fees" via Meridian.</li><li>States Victor posts the quarter-end trade "true-ups" himself, late at night, using the firefighter ID <b>FF_FIN03</b>.</li></ul>' },
    ev_je: { title: 'JE 30917 & firefighter session FF-0423', ref: 'WP F-JE-07', short: '$8.45M top-side posted by Victor via FF_FIN03 at 23:52, back-dated.', body: '<ul><li>JE 30917: Dr 4100 Trade Promotion / Cr 2410 Accrued Trade Promotion <b>$8,450,000.00</b>, "Q3 true-up per RM." Posted 10/02 23:52, effective 9/30, no approver.</li><li>Posted via emergency ID FF_FIN03, session FF-0423, checked out by <b>VKESSANE</b> 23:41–00:06. Reason given: "TPM interface fix." Activity: reopen P09, one JE, close P09.</li><li>Session log never reviewed — privileged access monitoring failure (ITGC).</li></ul>' },
    ev_loss: { title: 'Loss quantification', ref: 'WP F-Q-01', short: 'Net cash loss to Meridian: $42,506,800.', body: '<ul><li>Cash disbursed to Meridian, 06/2024–09/2026: $42,605,000. Less wires returned: $(98,200). <b>Net cash loss: $42,506,800.</b></li><li>Q3 correction before the 10-Q: Dr 2410 / Cr 4100 $8,450,000.</li><li>Prior periods: SAB 108 dual approach, SAB 99 qualitative factors (concealment of an officer’s unlawful act).</li></ul>' },
  };

  // ================================================================ hints (LEDGER escalation)
  const HINTS = {
    'wp2410.plug': ['Roll it like any account: beginning, plus accruals, minus deductions, checks, third-party payments and releases. Then compare to GL. The difference is the line nobody supported.', 'Q3 FY26 activity before "Other" foots to 154,600. The GL says 163,050. Mind the gap.', 'No more riddles: 163,050 − 154,600 = 8,450. Enter 8,450. Someone booked $8.45 million out of thin air.'],
    'wp2410.cum': ['Add the whole "Other adj." row. All five quarters.', '2,500 + 4,200 + 6,300 + 9,100 + the Q3 number you just solved for.', '30,550. Remember it — ask the auditors what their materiality is sometime.'],
    'wp2410.why': ['Look at which line is growing alongside the top-sides. It isn’t releases.', 'Third-party payments get debited straight to 2410. If you keep paying people out of a liability, you have to keep refilling it.', 'It’s B. The top-sides fund the third-party payments and hide them inside gross-to-net.'],
    'wpAP.digit': ['Benford says ones should dominate. Look for the bar standing too tall.', 'One digit is more than double its expected frequency. Compare each bar to its red dot.', 'Four. 22.6% against 9.7%. Click 4.'],
    'wpAP.vendor': ['One vendor clusters near a number for a documented reason. Another clusters for no reason at all.', 'A fixed retainer explains a cluster. Sequential invoice numbers and no contract explain nothing.', 'Meridian Retail Solutions. 548 invoices, all just under fifty grand.'],
    'wpAP.control': ['Read the Delegation of Authority again. What changes at $50,000?', 'Splitting keeps every invoice under the AP Manager’s limit, so the Controller never sees one.', 'B. The $50K approval limit — aggregate by vendor and date to find the splits.'],
    'wpVM.match': ['Fraudsters rarely use their own address. Who else is in an employee’s file?', 'Emergency contacts. Compare Meridian’s remit-to address against every address column in the HR file.', 'Click Meridian’s remit-to address, then the emergency contact address in Victor Kessane’s row. Same house.'],
    'wpVM.sod': ['Read Meridian’s "created by" and "approved by" columns.', 'The same name in both is the problem.', 'A. Dale created and approved it himself.'],
    'wpPOP.phantom': ['Match each invoice to its own chart and its own weeks. A real promotion spikes. A fake one is just baseline.', 'Two of the six line up with real lifts. The other four bill for weeks that look like every other week.', 'Check M-30419, M-30420, M-30431, M-30433. Leave M-30412 and M-30425 unchecked.'],
    'wpPOP.asc606': ['Is Meridian a customer? Does it buy anything from us, or from the retailers?', 'Consideration payable to a customer reduces revenue. A payment to a vendor for a distinct service doesn’t.', 'B. Operating expense.'],
    'wpJE.je': ['AS 2401 red flags: odd hours, after cutoff, round amounts, no approver, unexpected user. And the amount should look familiar.', 'You’re looking for $8,450,000.00 exactly.', 'JE 30917. 10/02 at 23:52, FF_FIN03, no approver.'],
    'wpJE.ff': ['Line up the timestamps. The JE posted at 23:52 on 10/02.', 'Which session was checked out at 23:52 on October 2nd?', 'FF-0423. Requested by VKESSANE.'],
    'wpJE.itgc': ['Emergency access is acceptable — if someone checks what was done with it.', 'Look at the "Log reviewed by" column for FF-0423.', 'A. Privileged-access monitoring failed.'],
    'wpLOSS.loss': ['Cash, not invoices. What left the building and stayed gone?', 'Sum the "Cash disbursed" column. Then subtract what the bank sent back.', '42,605,000 − 98,200 = 42,506,800.'],
    'wpLOSS.fix': ['Is JE 30917 an estimate or an error? And has Q3 been issued yet?', 'An error in an unissued current period gets fixed in that period.', 'A. Dr 2410 / Cr 4100, $8.45M, in Q3.'],
    'wpLOSS.sab108': ['There’s a Staff Accounting Bulletin written for exactly this: quantifying prior-period misstatements.', 'SAB 108. And it doesn’t let you pick just one method.', 'C. Both approaches, with SAB 99 qualitative factors.'],
    'dlg.celeste': ['Don’t tell Celeste what you suspect. Tell her what you’re doing. Analytics are boring. Boring gets approved.', 'Frame it as a standard SOX analytic. No names, no theories.', 'Pick the Benford / threshold testing option.'],
    'dlg.nadia': ['Nadia is a security person. Ask like a controls person: scoped, specific, auditable. No names.', 'Ask for the vendor master extract with the creation and approval audit trail.', 'First option.'],
    'dlg.victor': ['Never show them your cards. Now he knows what you know — and he’ll start cleaning up. Move faster than he does.'],
    'dlg.dale1': ['He’s frightened, not stupid. Stop the destruction first. Calmly.', 'Remind him of his obligations, not his punishment.', 'Tell him to step away — those records are under a preservation obligation.'],
    'dlg.dale2': ['He thinks he’s the victim. Show him what the evidence says about *him*.', 'His user ID created AND approved Meridian. Use that.', 'Pick the option about his user ID.'],
    'dlg.dale3': ['Never promise what you can’t deliver. He’ll know.', 'Be honest: cooperation is the only thing that helps him.', 'Pick "I can’t promise anything."'],
    'hearing.r1': ['Celeste says the accrual is supported. Which workpaper showed it wasn’t?', 'The roll-forward.', 'Present the GL 2410 roll-forward variance.'],
    'hearing.r2': ['"Normal close procedures." Who actually posted that entry, and when?', 'The JE and the firefighter session.', 'Present JE 30917 & firefighter session FF-0423.'],
    'hearing.r3': ['"No relationship." Where does Meridian get its mail?', 'The vendor master match — or Dale’s statement.', 'Present the vendor master match.'],
    'hearing.r4': ['He says the promotions ran. What did the cash registers say?', 'Scan data.', 'Present the proof-of-performance test.'],
    'hearing.r5': ['"Under fifty thousand, within authority." That isn’t his defense. It’s his method.', 'The digit analysis.', 'Present the digit analysis.'],
    'hearing.r6': ['A number. Cash.', 'Loss quantification.', 'Present the loss quantification.'],
    'hearing.r7': ['Don’t let him leave thinking you can be bought.'],
  };

  G.hints = {
    thresholds(key) { return key.startsWith('wp') ? [2, 3, 5] : [1, 2, 3]; },
    fail(key) {
      const s = S();
      s.fails[key] = (s.fails[key] || 0) + 1;
      s.totalFails++;
      const tier = G.hints.thresholds(key).indexOf(s.fails[key]) + 1;
      const h = HINTS[key];
      if (tier > 0 && h && h[tier - 1]) {
        s.hintsSent = (s.hintsSent || 0) + 1;
        setTimeout(() => text(h[tier - 1], { tier }), 900);
      }
      if (s.totalFails === 10 && !s.flags.frustrated) {
        s.flags.frustrated = true;
        setTimeout(() => text('You’re making this harder than it has to be. Slow down. Read the workpaper notes — Martin left you more than you think.'), 4000);
      }
      G.save();
    },
  };

  // ================================================================ chapters & clock
  const CHAPTERS = [
    { title: 'Day 1 — The Roll-Forward', day: 'MON 10/05' },
    { title: 'Day 2 — Who Is Meridian?', day: 'TUE 10/06' },
    { title: 'Day 3 — Footprints', day: 'WED 10/07' },
    { title: 'Day 3 — The Shredder', day: 'WED 10/07' },
    { title: 'Day 4 — Firefighter', day: 'THU 10/08' },
    { title: 'Day 5 — The Audit Committee', day: 'FRI 10/09' },
    { title: 'Epilogue', day: '' },
  ];

  const story = { evidence: EV };

  story.chapterInfo = () => CHAPTERS[S().chapter] || CHAPTERS[0];
  story.clock = function () {
    const s = S(), f = s.flags, ch = s.chapter;
    let t = '9:00 AM';
    if (ch === 0) t = !f.met_celeste ? '8:12 AM' : !done('wp2410') ? '9:20 AM' : !f.got_register ? '11:05 AM' : '2:40 PM';
    if (ch === 1) t = !f.got_hr ? '9:05 AM' : !done('wpVM') ? '1:15 PM' : '4:40 PM';
    if (ch === 2) t = !done('wpPOP') ? '8:50 AM' : '6:30 PM';
    if (ch === 3) t = !f.dale_confronted ? '7:48 PM' : '9:02 PM';
    if (ch === 4) t = !done('wpJE') ? '8:30 AM' : '3:10 PM';
    if (ch === 5) t = '8:55 AM';
    return (CHAPTERS[ch] || CHAPTERS[0]).day + ' · ' + t;
  };

  const PC = { map: 'floor', x: 32, y: 16 };
  const actorTarget = id => { const p = story.npcPos(id); return p ? { map: p.map, x: p.x, y: p.y } : null; };

  story.objective = function () {
    const s = S(), f = s.flags;
    switch (s.chapter) {
      case 0:
        if (!f.met_celeste) return { text: 'Report to *Celeste Marr*, Corporate Controller — northeast corner office.', target: actorTarget('celeste') };
        if (!f.phone_found) return { text: 'Find your new office — east side, past the lobby. Check the desk.', target: PC };
        if (!done('wp2410')) return { text: 'Open Martin’s unfinished *GL 2410 reconciliation* on your computer.', target: PC };
        if (!f.dale_refused && !f.celeste_ok_ap) return { text: 'Get the third-party payment register from *Dale Prentiss* in Accounts Payable.', target: actorTarget('dale') };
        if (!f.celeste_ok_ap) return { text: 'Dale wants Controller sign-off. Get *Celeste* to approve the AP data request.', target: actorTarget('celeste') };
        if (!f.dale_ok) return { text: 'Back to *Dale* in AP. He can’t stall you now.', target: actorTarget('dale') };
        if (!f.got_register) return { text: 'Collect the payment register from *Tomas Nguyen* in AP.', target: actorTarget('tomas') };
        return { text: 'Analyze the payment register on your computer.', target: PC };
      case 1:
        if (!f.got_vm) return { text: 'Get the vendor master extract from *Nadia Okafor* in IT.', target: actorTarget('nadia') };
        if (!f.got_hr) return { text: 'LEDGER left something in the *break room fridge*.', target: { map: 'floor', x: 18, y: 26 } };
        if (!done('wpVM')) return { text: 'Cross-match the vendor master to the HR file on your computer.', target: PC };
        return { text: 'Celeste wants you in her office. *Now.*', target: actorTarget('celeste') };
      case 2:
        if (!f.got_scan && !f.got_invoices) return { text: 'Get scan data from *Priya Raman* (Revenue Mgmt) and Meridian’s paper invoices from *Records, Cabinet 7*.', target: actorTarget('priya') };
        if (!f.got_scan) return { text: 'Get Q3 scan data from *Priya Raman* in Revenue Management.', target: actorTarget('priya') };
        if (!f.got_invoices) return { text: 'Pull Meridian’s paper invoices from the *Records Room, Cabinet 7*.', target: { map: 'floor', x: 7, y: 28 } };
        return { text: 'Test Meridian’s invoices against the scan data on your computer.', target: PC };
      case 3:
        if (!f.dale_confronted) return { text: 'Someone is in the *Records Room*. Go.', target: { map: 'floor', x: 8, y: 30 } };
        if (S().map === 'floor') return { text: 'Take the *elevator* down to garage level P2.', target: { map: 'floor', x: 21, y: 22 } };
        return { text: 'Find *Pillar C*.', target: actorTarget('priya') };
      case 4:
        if (!f.got_je) return { text: 'Ask *Nadia* for the JE detail and firefighter logs.', target: actorTarget('nadia') };
        if (!done('wpJE')) return { text: 'Test the Q3 journal entries on your computer.', target: PC };
        if (!f.got_history) return { text: 'Get Meridian’s full payment history from *Tomas* in AP.', target: actorTarget('tomas') };
        return { text: 'Quantify the loss on your computer.', target: PC };
      case 5:
        return { text: 'The audit committee is waiting in the *Boardroom*.', target: actorTarget('beck') };
      default:
        return { text: '', target: null };
    }
  };

  // ================================================================ NPC placement
  story.npcPos = function (id) {
    const s = S(), f = s.flags, ch = s.chapter;
    const day = ch !== 3;
    const at = (x, y, dir, extra = {}) => Object.assign({ map: 'floor', x, y, dir }, extra);
    switch (id) {
      case 'celeste': return ch === 5 ? at(26, 2, 'down') : day ? at(39, 2, 'down') : null;
      case 'victor':
        if (ch === 5) return at(29, 6, 'up');
        if (ch === 1 && done('wpVM') && !f.suspension_done) return at(36, 4, 'right');
        return day ? at(5, 2, 'down') : null;
      case 'dale':
        if (ch === 5) return at(30, 6, 'up', { sweat: true });
        if (ch === 3) return f.dale_confronted ? null : at(8, 30, 'right', { sweat: true });
        if (ch === 4) return null;
        return at(3, 14, 'down', { sweat: ch >= 1 });
      case 'tomas': return day && ch !== 5 ? at(8, 18, 'up') : null;
      case 'jin': return day && ch !== 5 ? at(12, 15, 'up') : null;
      case 'nadia': return day && ch !== 5 ? at(38, 16, 'up') : null;
      case 'priya':
        if (ch === 3) return { map: 'garage', x: 21, y: 8, dir: 'left' };
        if (ch === 5) return at(23, 10, 'up');
        return at(12, 4, 'up');
      case 'raj': return day ? at(31, 28, 'up') : null;
      case 'hannah': return day && ch !== 5 ? at(39, 28, 'up') : null;
      case 'gwen': return day ? at(20, 14, 'down') : null;
      case 'lena': return ch === 5 ? at(24, 2, 'down') : day ? at(23, 2, 'down') : null;
      case 'beck': return ch === 5 ? at(22, 4, 'right') : null;
      case 'stokes': return ch === 5 ? at(31, 4, 'left') : null;
      case 'gus': return ch === 3 ? at(24, 16, 'down') : null;
    }
    return null;
  };

  story.nightLights = function () {
    const f = F();
    const l = [{ x: 32.5, y: 16, r: 46 }, { x: 20.5, y: 15, r: 48 }, { x: 8, y: 10.5, r: 26 }, { x: 30, y: 10.5, r: 26 }, { x: 21.5, y: 23.5, r: 34 }, { x: 43, y: 17, r: 30 }];
    if (!f.dale_confronted) l.push({ x: 7, y: 29, r: 64, flicker: false });
    return l;
  };

  // ================================================================ evidence / flags helpers
  function addEvidence(id) {
    const s = S();
    if (!s.evidence.includes(id)) {
      s.evidence.push(id);
      G.ui.notice('Filed: ' + EV[id].title);
    }
  }
  function obtain(label) { G.ui.toast('OBTAINED', label, 'info'); G.audio.select(); }
  function refresh() { E().refreshActors(); G.ui.updateHud(); G.save(); }

  // ================================================================ chapter transitions
  async function toChapter(n, card, place) {
    const s = S();
    await G.ui.blackout();
    s.chapter = n;
    s.night = n === 3;
    await G.ui.card(card);
    if (place) E().placePlayer(place.map || 'floor', place.x, place.y, place.dir || 'down');
    refresh();
    await G.ui.reveal();
  }

  story.newGame = async function () {
    await G.ui.card({
      day: 'MONDAY, OCTOBER 5, 2026 · 8:12 AM',
      title: 'GROSS TO NET',
      text: 'Halvorsen Brands, Inc. $6.2 billion in annual net sales. Crisp Valley chips. Tidal sparkling water. BrightHome cleaning products.\n\nThree weeks ago, Martin Oyelaran — Senior Manager, Financial Controls — resigned in the middle of the quarter. No notice. No forwarding address.\n\nToday, {first} {last} takes his chair. It’s Q3 close. The audit committee meets Friday.'.replace('{first}', S().firstName).replace('{last}', S().lastName),
    });
    E().placePlayer('floor', 21, 23, 'down');
    await G.ui.reveal();
    await E().script(async () => {
      await narrate('Floor 14. Finance. The elevator doors slide shut behind you.');
      await narrate('Somewhere a printer is jammed. Somewhere else, someone is saying "it’s just timing" into a phone. Close week.');
    });
  };

  // Pending story beats (also used to resume after reload mid-sequence).
  story.beats = async function () {
    const s = S(), f = s.flags;
    if (done('wp2410') && !f.victor_visit) { f.victor_visit = true; await victorVisit(); }
    if (s.chapter === 0 && done('wpAP')) await toChapter1();
    if (s.chapter === 1 && done('wpVM') && !f.summoned) { f.summoned = true; await summoned(); }
    if (s.chapter === 1 && f.suspension_done) await toChapter2();
    if (s.chapter === 2 && done('wpPOP')) await toNight();
    if (s.chapter === 3 && f.garage_met) await toChapter4();
    if (s.chapter === 4 && done('wpJE') && !f.je_followup) { f.je_followup = true; await text('That’s the who and the how. Now the how much. Tomas has Meridian’s full payment history — and he’s on our side.'); }
    if (s.chapter === 4 && done('wpLOSS')) await toChapter5();
    if (s.chapter === 5 && f.hearing_done) await ending();
    refresh();
  };

  async function runPuzzle(id) {
    const finished = await G.puzzles.open(id);
    if (finished) {
      const evMap = { wp2410: 'ev_rf', wpAP: 'ev_benford', wpVM: 'ev_vm', wpPOP: 'ev_pop', wpJE: 'ev_je', wpLOSS: 'ev_loss' };
      addEvidence(evMap[id]);
      refresh();
      await U.sleep(300);
      await story.beats();
    }
  }

  // ---------------------------------------------------------------- Day 1 beats
  async function victorVisit() {
    const e = E();
    G.audio.door();
    e.spawnActor('victor', 32, 12, 'down');
    await e.walkActor('victor', [['down', 1]]);
    e.faceToward('you', 32, 13);
    await say('victor', 'Knock knock. You must be Martin’s replacement. Victor Kessane — Revenue Management. I run trade.');
    await say('victor', 'Saw you opened the 2410 rec already. The system tells me when people touch my accounts. Occupational hazard.');
    await say('victor', 'Martin used to stare at that rec too. Trade accruals are an *estimate*, {first}. Closer to art than accounting. Retailers deduct whatever they want, whenever they want, and my team spends all quarter cleaning it up.');
    const c = await choose('you', null, [
      'Then you won’t mind sending support for the Q3 top-side.',
      'Art? It’s a $163 million liability.',
      'Good to meet you, Victor.',
    ]);
    if (c === 0) {
      await say('victor', 'Of course. I’ll have my team pull something together. After close — we’re slammed.');
      await say('victor', 'Martin asked for a lot of things, too.');
    } else if (c === 1) {
      await say('victor', 'Ha! Celeste said you were sharp.');
      await narrate('The smile stays exactly where it is. His eyes don’t.');
      await say('victor', 'It’s a liability that pays for every end-cap and every BOGO in every store in America. Don’t lose sight of the business.');
    } else {
      await say('victor', 'Likewise. Really.');
    }
    await say('victor', 'My door’s always open. Literally — I had the hinges taken off. Culture thing.');
    await e.walkActor('victor', [['up', 1]]);
    e.removeActor('victor');
    G.audio.door();
    await U.sleep(800);
    await text('He’s already watching you. Ignore it.');
    await text('You saw the third-party payments line. Find out who gets paid out of 2410, and how much at a time. AP has the payment register. Dale Prentiss runs AP.');
    await text('Dale won’t want to help you.');
    refresh();
  }

  async function toChapter1() {
    await text('Meridian Retail Solutions. Now you have a name. Tomorrow, find out who it is.');
    await U.sleep(1200);
    await toChapter(1, { day: 'TUESDAY, OCTOBER 6, 2026', title: 'Who Is Meridian?', text: 'Meridian Retail Solutions LLC. No contract. No website. Sequential invoice numbers.\n\nA vendor is just a name, an address, and a bank account. Somebody created it. Somebody approved it.' }, { x: 32, y: 15, dir: 'down' });
    await E().script(async () => {
      await text('Vendors live in the vendor master. Nadia Okafor in IT controls extracts. She liked Martin. She might like you.');
    });
  }

  // ---------------------------------------------------------------- Day 2 beats
  async function summoned() {
    G.audio.buzz();
    await narrate('Your desk phone rings. Caller ID: C. MARR.');
    await say('celeste', 'My office. Now.');
    refresh();
  }

  async function suspensionScene() {
    const e = E();
    e.face('victor', 'right');
    await say('victor', 'There they are.');
    await say('celeste', '{first}. Victor tells me you’ve pulled AP disbursement data on his vendors, and the vendor master out of IT. Two days into the job. During close.');
    await say('victor', 'I’m all for controls. Truly. But my team’s fielding questions from AP, from IT… Retailers notice when payments slow down.');
    e.faceToward('victor', E().player.x, E().player.y);
    const c = await choose('victor', 'So help me understand. What *exactly* have you found?', [
      'Routine reconciliation questions. Nothing specific yet.',
      'Meridian Retail Solutions remits to your sister’s house, Victor.',
      'I’d rather discuss that with the audit committee.',
    ]);
    if (c === 0) {
      await say('victor', 'Routine. Great. Then routine can wait until after the 10-Q.');
    } else {
      F().tipped = true;
      G.hints.fail('dlg.victor');
      if (c === 1) {
        await narrate('For half a second, Victor Kessane goes completely still.');
        await say('victor', 'Larkspur. Huh.');
        await say('victor', 'Celeste, I think we’re done here.');
      } else {
        await say('victor', 'The audit committee. Ambitious.');
        await narrate('He glances at Celeste. Something passes between them that you can’t read.');
      }
    }
    await say('celeste', 'Effective immediately, your ERP access is suspended pending a review of your data handling. IT will restore it after we file. Finish Martin’s recs from the binders.');
    await say('celeste', 'That’s all.');
    F().suspension_done = true;
    G.save();
    await U.sleep(600);
    if (F().tipped) await text('Never show them your cards. He’ll start cleaning up now. We have less time than I thought.');
    else await text('They cut your access. That means you’re close.');
    await text('You need proof Meridian never did anything. Get some sleep.');
    await toChapter2();
  }

  async function toChapter2() {
    await toChapter(2, { day: 'WEDNESDAY, OCTOBER 7, 2026', title: 'Footprints', text: 'Your badge still works. Your ERP login doesn’t.\n\nBut paper doesn’t need a login, and cash registers don’t lie.' }, { x: 32, y: 15, dir: 'down' });
    await E().script(async () => {
      await text('Promotions leave footprints: scan data. If a display ran, product moved. Priya Raman in Rev Mgmt maintains the syndicated POS data.');
      await text('Meridian’s invoices are paper. Records Room, Cabinet 7. Your access is cut. Paper isn’t.');
    });
  }

  // ---------------------------------------------------------------- Night
  async function toNight() {
    await toChapter(3, { day: 'WEDNESDAY · 7:48 PM', title: 'The Shredder', text: 'You lose track of time. When you look up, the floor is dark. The cleaning crew has come and gone.\n\nYour phone buzzes.' }, { x: 32, y: 15, dir: 'down' });
    await E().script(async () => {
      await text('Are you still in the building?');
      await text('Someone just badged into the Records Room. Nobody goes into Records at 8 PM. Go. Now.');
    });
  }

  async function daleScene() {
    const e = E(), f = F();
    f.dale_scene_started = true;
    G.audio.sting();
    await narrate('A shredder whines in the dark. Dale Prentiss is feeding it pages, two and three at a time. A manila folder lies open beside him: MERIDIAN RETAIL SOLUTIONS — VENDOR SETUP.');
    e.face('dale', 'up');
    e.faceToward('dale', e.player.x, e.player.y);
    await say('dale', 'Oh— oh God. It’s not— this isn’t what it looks like.');
    // Round 1
    for (;;) {
      const c = await choose('dale', null, [
        'Step away from the shredder, Dale. Those are company records, and they’re under a preservation obligation.',
        'I know about Meridian. You’re going to prison.',
        'Want a hand? You’ll be here all night at this rate.',
      ]);
      if (c === 0) { await narrate('Dale’s hand hovers over the feed slot. Then he sets the pages down.'); break; }
      G.hints.fail('dlg.dale1');
      if (c === 1) { await say('dale', 'I— I want a lawyer. I’m not saying anything.'); await narrate('He grabs another handful of pages. The shredder whines.'); }
      else { await say('dale', 'That’s not funny. None of this is funny.'); await narrate('He keeps feeding pages.'); }
    }
    await say('dale', 'You don’t understand. Victor said it was a rebate program. He said it was all approved—');
    // Round 2
    for (;;) {
      const c = await choose('dale', null, [
        'How much did he pay you?',
        'Your user ID created Meridian, Dale. And approved it. Right now the evidence points at you — not Victor.',
        'I’m sure there’s an innocent explanation.',
      ]);
      if (c === 1) break;
      G.hints.fail('dlg.dale2');
      if (c === 0) await say('dale', 'I— I’m not answering that. You can’t just— no.');
      else { await say('dale', 'There is. There is an innocent explanation. Goodnight.'); await narrate('He doesn’t leave. He just stands there, shaking. You get another chance.'); }
    }
    await narrate('Dale sits down heavily on a filing box.');
    await say('dale', 'June 2024. Victor came to me. Said his sister had a consulting company — Elise — totally legit, she just needed a vendor number. Keep the invoices under fifty so they don’t clog up Celeste’s queue.');
    await say('dale', 'Then the consulting fees started. Four thousand a month. To me. Through Meridian. By the time I understood what it was, I was… in it.');
    // Round 3
    for (;;) {
      const c = await choose('dale', 'What happens to me?', [
        'I can’t promise you anything. But the audit committee will see who cooperated first.',
        'Nothing, if you give me Victor.',
        'You’ll be fine, Dale.',
      ]);
      if (c === 0) break;
      G.hints.fail('dlg.dale3');
      if (c === 1) await say('dale', 'You can’t promise that. You’re three days into the job. You don’t have that kind of authority — nobody in this building does.');
      else await say('dale', 'Don’t. Don’t lie to me. Victor says that.');
    }
    await say('dale', '…Okay.');
    await say('dale', 'The quarter-end top-sides — the trade true-ups. Victor posts them himself. Late at night, after the period’s locked. He uses the firefighter ID. FF_FIN03.');
    await say('dale', 'Nadia’s logs will show it. She logs everything.');
    await narrate('He hands you the folder. What’s left of it.');
    await say('dale', 'I’m going home. I’m going to tell Karen. Then I’m calling a lawyer.');
    f.dale_confronted = true;
    addEvidence('ev_dale');
    e.walkActor('dale', [['left', 1], ['up', 1], ['left', 2], ['up', 3]]).then(() => { e.removeActor('dale'); });
    await U.sleep(1600);
    e.removeActor('dale');
    await text('I heard about Records. Not bad.');
    await text('It’s time we met. Garage, level P2. Pillar C. Take the elevator. Come alone.');
    refresh();
  }

  async function garageScene() {
    const e = E(), f = F();
    e.faceToward('priya', e.player.x, e.player.y);
    await say('priya', 'Hi, {first}.');
    await say('priya', 'Yes. I’m LEDGER. It was the only name I could think of that Victor wouldn’t.');
    await say('priya', 'I run trade analytics. Two years ago, Victor started having me "update" the TPM calendar after quarter-end. Adding events. Retailers send late confirmations, he said.');
    await say('priya', 'Then I noticed Meridian billed for every single event I added.');
    await say('priya', 'I told Martin. Martin did what you did — he took the roll-forward to Celeste. The next week HR walked him out with a severance package and an NDA.');
    await say('priya', 'He gave me copies of everything before he left. The HR file was his. But I couldn’t take it to anyone. Victor’s my boss. Celeste signed the recs. I needed someone from outside who would see it for themselves.');
    const c = await choose('you', null, [
      'Why not go to the SEC yourself?',
      'You could have just told me everything on day one.',
      'Thank you, Priya.',
    ]);
    if (c === 0) {
      await say('priya', 'I did. I filed a tip in August — through a lawyer, anonymously. Dodd-Frank lets you do that.');
      await say('priya', 'But the SEC moves in months. Victor moves in days. If they file the 10-Q with that accrual, it’s another quarter of cover.');
    } else if (c === 1) {
      await say('priya', 'Would you have believed me? A junior analyst with a stolen HR file and a grudge?');
      await say('priya', 'You had to tie it out yourself. That’s what makes it evidence.');
    } else {
      await say('priya', 'Don’t thank me yet.');
    }
    // Drive-by
    await narrate('An engine turns over somewhere on the ramp above. Headlights sweep across the concrete.');
    await say('priya', 'Down. Behind the pillar.');
    await driveBy();
    await say('priya', 'Black Audi. That’s Victor’s car.');
    await say('priya', 'He doesn’t park on P2.');
    await narrate('For a long moment neither of you says anything.');
    await say('priya', 'Listen. The audit committee chair, Harold Beck, has agreed to a special session Friday at nine. I sent him an anonymous letter Monday. Your name was in it.');
    await say('priya', 'He’ll want three things: *who*, *how*, and *how much*.');
    await say('priya', 'Get the JE detail and firefighter logs from Nadia tomorrow. Then have Tomas pull Meridian’s full history. Then you walk into that boardroom.');
    await say('priya', 'Go home, {first}. Take the stairs.');
    f.garage_met = true;
    G.save();
    await toChapter4();
  }

  function driveBy() {
    return new Promise(res => {
      const m = G.maps.garage;
      const car = { kind: 'car', x: -4, y: 11, w: 3, h: 2, color: '#111317', facing: 'right', lightsOn: true, solid: false };
      m.props.push(car);
      let last = performance.now();
      const tick = now => {
        const dt = (now - last) / 1000; last = now;
        car.x += dt * (car.x > 10 && car.x < 18 ? 3 : 7);
        if (car.x > 32) { m.props.splice(m.props.indexOf(car), 1); res(); return; }
        requestAnimationFrame(tick);
      };
      E().shakeScreen(2);
      requestAnimationFrame(tick);
    });
  }

  async function toChapter4() {
    await toChapter(4, { day: 'THURSDAY, OCTOBER 8, 2026', title: 'Firefighter', text: 'Dale Prentiss calls in sick for the first time in eleven years.\n\nVictor Kessane arrives at 7:15 AM, earlier than anyone has ever seen him.' }, { x: 21, y: 23, dir: 'down' });
    await E().script(async () => {
      await text('Morning. Nadia first. Ask her about FF_FIN03.');
    });
  }

  async function toChapter5() {
    await text('That’s everything. Who, how, how much.');
    await text('9 AM. Boardroom. I’ll be on the dial-in. If you get stuck in there, check your phone.');
    await U.sleep(1000);
    await toChapter(5, { day: 'FRIDAY, OCTOBER 9, 2026 · 8:55 AM', title: 'The Audit Committee', text: 'The CFO flew back from New York overnight. Outside counsel is on the line. Victor Kessane has insisted on attending.\n\nYou have six exhibits and one chance to make them land.' }, { x: 21, y: 23, dir: 'down' });
  }

  // ---------------------------------------------------------------- hearing & ending
  async function hearing() {
    const f = F();
    if (!f.beck_intro) {
      f.beck_intro = true;
      await say('beck', 'You must be {last}. Harold Beck. I chair the audit committee.');
      await say('beck', 'On Monday I received an anonymous letter. It said that if I wanted to know what really happened to Martin Oyelaran, I should listen to whoever replaced him.');
      await say('beck', 'So. I’m listening. Everyone else is, too. Let’s begin.');
      await narrate('Rebut each claim by presenting the exhibit that contradicts it. Wrong exhibits cost credibility. Lose it all and the committee adjourns.');
    } else {
      await say('beck', 'Ready to try again, {last}? From the top of where we left off.');
    }
    const r = await G.hearing.start();
    if (r === 'win') {
      f.hearing_done = true;
      G.save();
      await ending();
    } else {
      await text('That went badly. Breathe. Beck agreed to reconvene in ten minutes.');
      await text('Every claim has exactly one exhibit that breaks it. Press if you’re unsure — it costs nothing.');
      refresh();
    }
  }

  async function ending() {
    const s = S();
    s.chapter = 6;
    G.save();
    const mins = Math.max(1, Math.round((Date.now() - s.startedAt) / 60000));
    const f = s.totalFails;
    const rank = f <= 2 ? 'Partner Track' : f <= 6 ? 'Forensic Director' : f <= 12 ? 'Senior Investigator' : 'LEDGER Did Most of the Work';
    const ep = [
      'Victor Kessane was terminated for cause that afternoon. Halvorsen referred the matter to the U.S. Attorney for the Southern District of Ohio. Meridian Retail Solutions’ accounts at First Coastal were frozen the following Tuesday; Elise Moore retained counsel.',
      'Halvorsen filed an NT 10-Q and reversed JE 30917 before issuing Q3. Under SAB 108, prior-period misstatements were judged qualitatively material — they concealed an officer’s theft — and the company restated FY25. Q3 EPS came in at $0.83. The Street was unforgiving for about a week.',
      'Management concluded that ICFR was not effective: material weaknesses in vendor master segregation of duties, privileged access monitoring, and the review of top-side journal entries. Whitford & Lowe expanded its procedures. Celeste Marr resigned in November.',
      'Dale Prentiss cooperated fully and pleaded guilty to a single count. His statement — and the records he didn’t finish shredding — anchored the government’s case.',
      'Martin Oyelaran received a letter from Halvorsen’s new General Counsel confirming that nothing in his separation agreement prevented him from communicating with the SEC. Rule 21F-17 had said so all along.',
      'Priya Raman was promoted to Director of Revenue Management analytics. Her SEC whistleblower award, when it came eighteen months later, was protected by the anti-retaliation provisions of SOX §806 and Dodd-Frank. She still keeps the burner phone in her desk drawer.',
      'You signed the 2410 reconciliation on Thursday of the following week. Every line tied.',
    ];
    const html = '<div class="ending"><div class="card-day">EPILOGUE</div><h2>Gross to Net</h2>' +
      '<div class="stats"><div class="stat"><b>$42.5M</b><small>Fraud uncovered</small></div><div class="stat"><b>' + f + '</b><small>Missteps</small></div><div class="stat"><b>' + (s.hintsSent || 0) + '</b><small>Tips from LEDGER</small></div></div>' +
      '<div class="rank">Rating: ' + rank + '</div><p style="color:#7d8794;font-size:12px">' + mins + ' minutes on the case</p>' +
      '<div class="epilogue">' + ep.map(p => '<p>' + U.esc(p) + '</p>').join('') + '</div>' +
      '<div style="margin-top:18px"><button class="big-btn" id="btn-again">New investigation</button></div></div>';
    await G.ui.blackout();
    G.ui.card({ html, wait: false });
    document.getElementById('btn-again').addEventListener('click', () => { G.util.store.del('gtn_save'); location.reload(); });
  }

  // ================================================================ talk
  story.talk = async function (id) {
    const s = S(), f = s.flags, ch = s.chapter;
    const T = TALK[id];
    if (T) await T(ch, f);
    refresh();
  };

  const TALK = {
    async celeste(ch, f) {
      if (ch === 0 && !f.met_celeste) {
        await say('celeste', 'You must be {first}. Celeste Marr. Welcome to Halvorsen, and welcome to close.');
        await say('celeste', 'I’ll be blunt, because I don’t have time not to be. Martin left three weeks ago in the middle of the quarter. No notice. His reconciliations are half-finished and the audit committee meets Friday.');
        await say('celeste', 'Your job this week: sign off on the balance sheet recs Martin didn’t. Thursday at the latest. Lena from Whitford & Lowe is camped in the boardroom and she wanted them yesterday.');
        for (let asked = 0; asked < 3;) {
          const c = await choose('you', null, ['Why did Martin leave?', 'Anything I should know about the recs?', 'Understood. I’ll get started.']);
          if (c === 0) { await say('celeste', '"Personal reasons." That’s what his letter said, and that’s what we’ll all say. Understood?'); asked++; }
          else if (c === 1) { await say('celeste', 'Trade is the big one. Accrued trade promotion — GL 2410 — is a hundred and sixty million dollars of judgment. Victor Kessane’s team owns the estimate. Don’t reinvent it.'); asked++; }
          else break;
        }
        await say('celeste', 'Q3 is landing at eighty-seven cents. The Street’s at eighty-six. Let’s keep it boring. Your office is past the lobby on the east side.');
        f.met_celeste = true;
        return;
      }
      if (ch === 0 && f.dale_refused && !f.celeste_ok_ap) {
        await say('celeste', 'Dale says you want a disbursement extract. For what?');
        const c = await choose('you', null, [
          'Benford and threshold analytics on third-party trade vendors. Standard SOX data analytic for a new controls lead.',
          'I think someone is stealing out of account 2410.',
          'Martin was working on something. I want to finish it.',
        ]);
        if (c === 0) {
          await say('celeste', '…Fine. Tell Dale I approved it.');
          await say('celeste', 'And {first}? Quietly. I don’t need Victor in my office complaining that Controls is auditing his vendors during close.');
          f.celeste_ok_ap = true;
        } else if (c === 1) {
          G.hints.fail('dlg.celeste');
          await say('celeste', 'That’s a serious accusation to make on your first day. Bring me evidence, not feelings. Request denied — for now.');
        } else {
          G.hints.fail('dlg.celeste');
          await narrate('Something in Celeste’s face closes like a door.');
          await say('celeste', 'Martin isn’t here. Ask me again when you have a reason that isn’t Martin.');
        }
        return;
      }
      if (ch === 1 && done('wpVM') && !f.suspension_done) return suspensionScene();
      if (ch === 5) return say('celeste', '…');
      const lines = {
        0: 'Recs, {first}. Thursday.',
        1: 'If this is about the recs, email me. I’m in close meetings until seven.',
        2: 'Binders are in the records room. Your access will come back after we file.',
        4: 'Dale called in sick. Victor’s been in since seven. I don’t like any of this, and I don’t want to talk about it.',
      };
      await say('celeste', lines[ch] || 'Not now.');
    },

    async victor(ch, f) {
      if (ch === 1 && done('wpVM') && !f.suspension_done) return suspensionScene();
      const lines = {
        0: f.victor_visit ? ['Door’s open, {first}. Hinges and all. Well — no hinges.'] : ['Victor Kessane, Revenue Management. You must be the new controls hire. Welcome. Don’t let the trade accrual scare you — it’s more art than accounting.'],
        1: ['Celeste and I go back a long way, {first}. Twelve years. That’s a lot of quarters landed.', 'Funny how the new people always think they’ve found something.'],
        2: ['Still here? Huh. I’d have thought you’d be busy with those binders.'],
        4: ['Long night? You look tired.', 'Get some rest before Friday. Big meeting. I hear Harold Beck is flying in. Should be interesting for you.'],
        5: ['Let’s get this over with.'],
      };
      for (const l of lines[ch] || ['…']) await say('victor', l);
    },

    async dale(ch, f) {
      if (ch === 0) {
        if (!done('wp2410')) return say('dale', 'Oh! Hi. You’re Martin’s— the new— right. Dale. AP. Welcome. Busy, very busy. Close!');
        if (!f.celeste_ok_ap) {
          if (!f.dale_refused) {
            await say('dale', 'A disbursement register? For trade service vendors? That’s… that’s a big pull. System’s slow during close.');
            await say('dale', 'Plus data extracts need Controller sign-off. Policy. Not my policy! Celeste’s policy.');
            f.dale_refused = true;
          } else await say('dale', 'Celeste’s sign-off. Sorry. Rules are rules.');
          return;
        }
        if (!f.dale_ok) {
          await say('dale', 'She… said yes? Okay. Okay. Sure.');
          await say('dale', 'TOMAS! — Tomas can pull it for you. FY26 to date. He’s at his desk, just there.');
          await narrate('Dale wipes his forehead with the back of his hand. It’s sixty-eight degrees in here.');
          f.dale_ok = true;
          return;
        }
        return say('dale', 'Tomas has it. Tomas has everything. I’m just… very busy.');
      }
      if (ch === 1 || ch === 2) return say('dale', ch === 1 ? 'Did— did Victor say something to you? Never mind. Never mind.' : 'I can’t talk right now. Sorry. I’m— sorry.');
      if (ch === 3 && !f.dale_confronted) return daleScene();
      if (ch === 5) return say('dale', 'I’ll tell them everything. I already told the lawyers.');
    },

    async tomas(ch, f) {
      if (ch === 0 && f.dale_ok && !f.got_register) {
        await say('tomas', 'Hey — Tomas. Dale says you need the trade vendor register. Here: FY26 to date, every disbursement coded to 2410.');
        await narrate('He lowers his voice.');
        await say('tomas', 'Honestly? Glad someone’s asking. I flagged duplicate Meridian invoices twice this year. Both times Meridian sent credit memos within a day. Like they knew.');
        f.got_register = true;
        obtain('AP payment register — FY26 YTD');
        return;
      }
      if (ch === 4 && done('wpJE') && !f.got_history) {
        await say('tomas', 'Meridian’s full history, inception to date? Already pulled it.');
        await say('tomas', 'Treasury put a payment hold on Meridian this morning. Your name’s on the request. Somebody upstairs is taking you seriously.');
        await say('tomas', 'Credit memos and bank returns are in there too. Don’t let anyone tell you the invoiced number is the loss.');
        f.got_history = true;
        obtain('Meridian AP subledger — inception to date');
        return;
      }
      const lines = {
        0: 'Tomas. AP. If it’s got an invoice number, I’ve probably keyed it.',
        1: 'Dale’s been weird all week. Weirder.',
        2: 'Records keeps the paper backup for everything over a year. Cabinet numbers are by vendor letter.',
        4: f.got_history ? 'Go get him.' : 'Dale didn’t come in. Called in sick. First time in eleven years.',
      };
      await say('tomas', lines[ch] || 'Hey.');
    },

    async jin(ch) {
      const l = {
        0: 'Jin. AP. Anything under fifty grand, Dale approves. Fifty and up goes to Celeste. Dale is very… efficient.',
        1: 'Fun fact: I’ve never once seen a Meridian invoice over fifty thousand. Not once. Weird for a broker.',
        2: 'Dale shredded a whole box Monday. Said it was "retention policy."',
        4: 'Is it true your ERP access got cut? That’s so messed up.',
      };
      await say('jin', l[ch] || 'Hi.');
    },

    async nadia(ch, f) {
      if (ch === 1 && !f.got_vm) {
        await say('nadia', 'Nadia Okafor. ERP security. You’re the new controls person. What do you need?');
        for (;;) {
          const c = await choose('you', null, [
            'A vendor master extract for trade-service vendors, with the creation and approval audit trail.',
            'Everything you have on Meridian Retail Solutions.',
            'Can you give me direct read access to the vendor master table?',
          ]);
          if (c === 0) break;
          G.hints.fail('dlg.nadia');
          if (c === 1) await say('nadia', 'That’s specific. Who gave you that name?… Never mind. I don’t pull data on a single vendor without a ticket and a reason. Try again.');
          else await say('nadia', 'Not a chance. Least privilege. You want data, you request an extract, and I log that I gave it to you.');
        }
        await say('nadia', 'Audit trail, too. You sound like Martin.');
        await narrate('She looks at you a moment longer than necessary.');
        await say('nadia', 'He asked for exactly that three weeks ago. Then he asked HR for the employee master to match against it. HR Legal shut him down. Two days later he was gone.');
        await say('nadia', 'Here’s your extract. I’m logging that I gave it to you. I log everything.');
        f.got_vm = true;
        obtain('ERP vendor master extract with audit trail');
        await U.sleep(500);
        await text('HR won’t give you the employee file. I already have Martin’s copy.');
        await text('Break room fridge. Behind the oat milk nobody drinks.');
        return;
      }
      if (ch === 4 && !f.got_je) {
        await say('nadia', 'Your access is suspended. You know that.');
        await say('nadia', '…But a man named Harold Beck called me at seven this morning. Audit committee chair. He asked me to preserve the GRC logs and the JE header table, and to give a copy to whoever was "doing Martin’s work."');
        await say('nadia', 'I assume that’s you.');
        await say('nadia', 'Every manual and late entry to September, posted through 10/03. And the emergency access log for FF_FIN03. Read the timestamps.');
        f.got_je = true;
        obtain('Q3 JE listing + FF_FIN03 firefighter log');
        return;
      }
      const l = {
        0: 'Nadia Okafor, ERP security. Unless you’re here to report a phishing email, I’m slammed.',
        1: 'Remember: I log everything.',
        2: 'I was told to disable your ERP access yesterday. The ticket came from Celeste. The request came from Victor. I log everything.',
        4: 'Go. And {first} — Martin would’ve liked you.',
      };
      await say('nadia', l[ch] || '…');
    },

    async priya(ch, f) {
      if (ch === 3 && !f.garage_met) return garageScene();
      if (ch === 2 && !f.got_scan) {
        await say('priya', 'You’re the one Victor’s been complaining about.');
        await narrate('She glances toward Victor’s office. The door is open. The door is always open.');
        for (;;) {
          const c = await choose('you', null, [
            'I need weekly POS scan data for our top retailers, fiscal Q3, by item.',
            'Are you LEDGER?',
          ]);
          if (c === 0) break;
          await say('priya', 'I don’t know what that is.');
          await narrate('She doesn’t blink.');
        }
        await say('priya', 'Which items?');
        await narrate('You read off the retailers and products on Meridian’s invoices. She types without looking at the keyboard.');
        await say('priya', 'MegaMart, FreshCo, Valumart, Grandway. Weekly units, weeks 22 through 39, so you have a baseline before the quarter.');
        await say('priya', 'If Victor asks, you found this on the shared drive.');
        f.got_scan = true;
        obtain('Syndicated POS scan data — Q3, 4 retailers');
        return;
      }
      if (ch === 5) {
        await say('priya', 'I’m not allowed in. I’ll be on the dial-in from a conference room downstairs.');
        return say('priya', 'Every claim has one exhibit that breaks it. You have all of them. Go.');
      }
      const l = {
        0: ['Hi. Priya. Trade analytics.', '…Sorry. I’m on deadline.'],
        1: ['Victor’s been in a mood since yesterday. Closed-door calls.'],
        2: ['Good luck with the binders.'],
        4: ['Morning.', 'Nadia’s in early. So is Victor.'],
      };
      for (const line of l[ch] || ['…']) await say('priya', line);
    },

    async raj(ch) {
      const l = {
        0: 'Raj. GL. I posted the IC royalty entry on the 30th. Twelve million, nice and round, and fully supported by the transfer pricing study — before you ask.',
        1: 'Someone keeps stealing my yogurt. If you’re doing forensics anyway…',
        2: 'You’re the one with no ERP access? I’d go insane. I can’t even remember my own birthday without SAP.',
        4: 'Weird thing. September was locked on the 1st. But the audit trail shows P09 reopened for twenty-five minutes around midnight on the 2nd. Nadia says she’s looking into it.',
        5: 'Good luck in there. Seriously.',
      };
      await say('raj', l[ch] || 'Hey.');
    },

    async hannah(ch) {
      const l = {
        0: 'Hannah, close team lead. If you need a tie-out, I live in Excel. Martin used to sit with us when the recs got ugly.',
        1: 'Martin left a sticky on my monitor his last day. It said "foot everything." I thought it was a joke.',
        2: 'Close calendar says recs are due tomorrow. Close calendar is a liar.',
        4: 'I heard the CFO is flying back for Friday. CFOs don’t fly back for good news.',
      };
      await say('hannah', l[ch] || 'Hi.');
    },

    async gwen(ch) {
      const l = {
        0: 'Welcome to Halvorsen! Celeste’s office is the corner one, northeast. Follow the corridor east and go up.',
        1: 'Mr. Kessane’s sister called for him again. Third time this week. Nice lady. Elise, I think?',
        2: 'Somebody from facilities asked if the records room shredder bin needed emptying again. Again! Monday it was full.',
        4: 'Mr. Beck’s assistant booked the boardroom for all of Friday morning. Even the CFO’s flying back.',
        5: 'Big meeting today, huh? Everyone’s already in there.',
      };
      await say('gwen', l[ch] || 'Hi!');
    },

    async lena(ch) {
      const l = {
        0: ['Lena Strand, Whitford & Lowe. Engagement manager. You’re Martin’s replacement?', 'We have 2410 as a significant risk. Management’s estimate is "within a reasonable range." Between us, I’d love to see their TPM support for the top-sides. I’ve asked twice.'],
        1: ['Our planning materiality this year is thirty-one million.', 'Funny — it’s a number everyone in this building seems to know.'],
        2: ['If you find something, management has to tell us. And under Section 10A, if it’s illegal and nobody acts, we have to tell the board ourselves.', 'Just… saying.'],
        4: ['I heard about your ERP access.', 'Professionally, I have no opinion. Personally, that’s a red flag the size of a billboard.'],
        5: ['Whatever happens in here, document it.'],
      };
      for (const line of l[ch] || ['…']) await say('lena', line);
    },

    async beck(ch, f) {
      if (ch === 5 && !f.hearing_done) return hearing();
    },

    async stokes() {
      await say('stokes', 'I flew back from New York at two in the morning for this. Make it worth it.');
    },

    async gus(ch, f) {
      if (!f.dale_confronted) {
        await say('gus', 'Evening. Building’s empty except for you and— well, the AP fella went into Records a few minutes ago. Said he forgot his reading glasses.');
        await say('gus', 'Took a whole box in with him for a pair of glasses.');
      } else {
        await say('gus', 'AP fella left looking like he’d seen a ghost. You heading out? Elevator’s working.');
      }
    },
  };

  // ================================================================ objects
  const FLAVOR = {
    v_shelf: 'Hardcover: *Trade Promotion Optimization: Turning Gross into Net.* The spine is uncracked.',
    v_pc: 'Locked. The screensaver is a sailboat named ACCRUED INTEREST.',
    v_couch: 'Italian leather. You don’t sit.',
    v_desk: 'A framed photo: Victor, a woman with the same jawline, and a boat. Engraved: "Elise’s 40th — Lake Cumberland."',
    v_art: 'A signed print. The brass plate says it was a gift "from your friends at Meridian." No — you read it again. "From your friends at MegaMart."',
    rm_pc: 'Priya’s monitor: a pivot table of weekly scan data, and nothing else. No photos, no stickers.',
    rm_pc2: 'A Revenue Management workstation. A TPM screen titled "Calendar — Edit Mode."',
    rm_board: 'Whiteboard: "Q3 TRADE: LAND IT." Underlined three times.',
    b_table: 'Coffee rings, a PBC list from Whitford & Lowe, and a half-eaten bagel. Item 14 on the PBC list: "Support for Q2 2410 top-side adjustments." Status: OPEN.',
    b_screen: 'Paused on slide 14: "Gross-to-Net Bridge, Q3 FY26."',
    c_shelf: 'SOX process narratives, FY23 through FY26. The FY26 binder’s "Vendor Master" tab is empty.',
    c_files: 'Locked.',
    c_desk: 'A draft email to the CFO on Celeste’s screen: "Q3 — landing at 0.87."',
    c_pc: 'A draft email to the CFO on Celeste’s screen: "Q3 — landing at 0.87."',
    c_art: 'A framed CPA certificate. Ohio, 2004.',
    cooler: 'You drink a paper cone of water. It tastes like a quarterly close.',
    d_files: 'A locked drawer labeled VENDOR SETUP FORMS.',
    d_desk: 'A photo of Dale and a smiling woman at a lake. "Karen & me, 25 years."',
    d_pc: 'Locked. A sticky on the bezel: "Password = Karen + anniv." You don’t.',
    ap_pc: 'An AP workstation, mid-batch. Invoice approval queue: 41 items, all under $50,000.',
    t_pc: 'Tomas’s screen: a duplicate-invoice report he built himself. It has a tab named "MERIDIAN?!"',
    ap_files: 'Vendor invoices, filed by number. Meridian has its own drawer. It’s full.',
    ap_copier: 'Last print job in the queue: "Meridian_W9_rev2.pdf."',
    reception: 'A sign-in sheet and a bowl of Crisp Valley Kettle Chips, single-serve.',
    logo: 'HALVORSEN BRANDS — "Feeding America’s Moments."',
    lobby_couch: 'A lobby couch. You don’t have time.',
    y_shelf: 'Martin’s binders are gone. Only dust outlines show where they stood.',
    y_files: 'Empty, except for a paperclip chain someone built during a very long close.',
    y_desk: 'Your desk. Martin’s desk.',
    y_window: 'A small window onto the corridor. Victor’s office is visible from here, if you lean.',
    it_files: 'Change tickets, printed and initialed. Nadia doesn’t trust anything she can’t sign.',
    n_pc: 'Nadia’s monitors: six panes of log tails, scrolling.',
    servers: 'The ERP lives here, blinking. Somewhere in there is every entry anyone ever posted. And who posted it.',
    rec_files: 'Decades of AP backup. Retention policy: seven years. Reality: forever.',
    rec_table: 'A table, a lamp, a box of rubber bands.',
    counter: 'Mugs. One reads WORLD’S OKAYEST ACCOUNTANT.',
    coffee: 'The coffee machine says DESCALE REQUIRED. It has said this since 2023.',
    vending: 'B4: Crisp Valley Kettle Chips, $1.75. The company’s own product, marked up.',
    break_table: 'A memo: "Reminder — the fridge is cleaned out every Friday. NO EXCEPTIONS."',
    break_couch: 'A break room couch. It has seen things.',
    copier: 'PC LOAD LETTER.',
    mail: 'Mail slots. Martin’s still has his name on it. Empty.',
    mail_table: 'Interoffice envelopes. One is addressed to "Harold Beck — PERSONAL."',
    mail_shredder: 'A small shredder, unplugged.',
    close_pc: 'A close-team workstation. Seventeen Excel windows open.',
    close_files: 'Prior-year workpapers. Tickmarks in four colors.',
    close_board: 'Close calendar. Day +3: RECS DUE. Day +5: AC MEETING. Someone drew a small skull next to Day +5.',
    g_sign: 'P2 — LEVEL 2. NO OVERNIGHT PARKING.',
  };

  story.use = async function (id, x, y) {
    const s = S(), f = s.flags, ch = s.chapter;
    if (id === 'y_pc' || id === 'y_desk') return usePC();
    if (id === 'fridge') {
      if (ch === 1 && f.got_vm && !f.got_hr) {
        await narrate('Behind a carton of oat milk (expired in August) is a manila envelope labeled LUNCH — DO NOT EAT.');
        await narrate('Inside: an HR extract. Names, home addresses, direct deposit details, emergency contacts. A sticky note in Martin’s handwriting on top: *Check the columns nobody checks.*');
        f.got_hr = true;
        obtain('HR employee extract (Martin’s copy)');
        return;
      }
      return narrate('Someone has labeled their yogurt "PROPERTY OF R. KHAN — THIS MEANS YOU."');
    }
    if (id === 'cabinet7') {
      if (ch === 2 && !f.got_invoices) {
        await narrate('Cabinet 7: AP BACKUP — FY26 Q3 — M.');
        await narrate('The Meridian folder is two inches thick. Every invoice is just under fifty thousand dollars. Every one is approved in the same blue-ink initials: DP.');
        await narrate('No proof of performance attached. No store lists, no photos, no retailer sign-offs. Just invoices.');
        f.got_invoices = true;
        obtain('Meridian paper invoices — Q3 FY26');
        return;
      }
      return narrate(f.got_invoices ? 'Cabinet 7. You’ve already pulled what you need.' : 'Cabinet 7: AP BACKUP — M. Vendor files, alphabetical.');
    }
    if (id === 'rec_shredder') {
      if (ch === 3 && f.dale_confronted) return narrate('The bin is half full of paper strips. A fragment of Meridian letterhead pokes out of the top.');
      return narrate('A cross-cut shredder. The bin is emptied by facilities.');
    }
    if (id === 'elevator') {
      if (ch === 3) {
        if (!f.dale_confronted) return narrate('Not yet. Someone’s in Records.');
        G.audio.ding();
        await G.ui.blackout();
        E().placePlayer('garage', 14, 1, 'down');
        await G.ui.reveal();
        await narrate('Garage level P2. Half the lights are out. Your footsteps echo off the concrete.');
        return;
      }
      if (ch === 5) return narrate('Not now. They’re waiting.');
      return narrate('Leaving? It’s close week. Nobody leaves during close.');
    }
    if (id === 'g_elevator') return narrate(f.garage_met ? 'Take the stairs, she said.' : 'You came here for a reason. Pillar C.');
    if (id.startsWith('pillar_')) {
      const l = id.slice(7);
      return narrate(l === 'C' ? 'Pillar C. Someone has scratched a tiny "L" into the yellow paint.' : 'Pillar ' + l + '.');
    }
    if (FLAVOR[id]) return narrate(FLAVOR[id]);
  };

  story.flavorObj = async function (ch) {
    const t = { P: 'A plant. Fake. Somebody waters it anyway.', F: 'A filing cabinet. Locked.', B: 'Binders and books. Nothing you need.', S: 'Servers, blinking.', Q: 'A vending machine.', Y: 'A copier.', R: 'A fridge.' }[ch];
    if (t) await narrate(t);
  };

  async function usePC() {
    const s = S(), f = s.flags, ch = s.chapter;
    if (!f.phone_found) {
      if (!f.met_celeste) return narrate('Your desk, apparently. You should check in with Celeste before you settle in.');
      await narrate('Martin’s things are gone, but the top drawer sticks. When you yank it open, something slides forward: a cheap prepaid phone, wrapped in a yellow sticky note.');
      await narrate('The note says: *"Martin trusted the wrong people. Don’t. — L"*');
      f.phone_found = true;
      addEvidence('ev_note');
      G.ui.updateHud();
      await U.sleep(600);
      await text('You found it. Good. I can’t talk to you in the building, so this is how we do it.');
      await text('Martin was close. He found something in the trade accrual and they made him go away. Start where he stopped: account 2410. His rec is still on your desktop.');
      await text('I’ll be watching. When you’re stuck, I’ll help. When you’re *really* stuck, I’ll stop being subtle.');
      await narrate('(Press *P* to read the phone. Press *J* to open your case file.)');
      return;
    }
    if (ch === 0) {
      if (!done('wp2410')) return runPuzzle('wp2410');
      if (!f.got_register) return narrate('Martin’s rec is filed. You need AP’s payment register before you can go further.');
      return runPuzzle('wpAP');
    }
    if (ch === 1) {
      if (!f.got_vm || !f.got_hr) return narrate(!f.got_vm ? 'You need the vendor master extract from IT first.' : 'You have the vendor master. Now you need something to match it against.');
      if (!done('wpVM')) return runPuzzle('wpVM');
      return narrate('Celeste is waiting.');
    }
    if (ch === 2) {
      if (!f.got_scan || !f.got_invoices) return narrate('ERP: *ACCESS SUSPENDED.* You need the scan data and the paper invoices to test anything offline.');
      return runPuzzle('wpPOP');
    }
    if (ch === 3) return narrate('The screen glows in the dark office. Not now — Records.');
    if (ch === 4) {
      if (!f.got_je) return narrate('ERP: *ACCESS SUSPENDED.* Nadia may be able to help.');
      if (!done('wpJE')) return runPuzzle('wpJE');
      if (!f.got_history) return narrate('You need Meridian’s full payment history from Tomas.');
      return runPuzzle('wpLOSS');
    }
    return narrate('Nothing left to analyze. It’s all in the case file.');
  }

  // ================================================================ step triggers
  story.onStep = function (x, y) {
    const s = S(), f = s.flags;
    if (s.map !== 'floor') return;
    if (s.chapter === 3 && !f.dale_confronted && !f.dale_scene_started && x <= 9 && y >= 26) {
      E().script(daleScene);
    }
    if (s.chapter === 5 && !f.hearing_done && !f.beck_intro && x >= 21 && x <= 32 && y <= 8) {
      E().script(hearing);
    }
  };

  story.resume = async function () {
    await E().script(async () => {
      if (S().chapter === 6) return ending();
      if (S().flags.dale_scene_started && !S().flags.dale_confronted) S().flags.dale_scene_started = false;
      await story.beats();
    });
  };

  G.story = story;
})();
