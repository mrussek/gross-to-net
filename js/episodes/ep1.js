// Episode 1 — Gross to Net. Halvorsen Brands: trade-promotion embezzlement.
// Maps, cast, workpapers, story, hints and the audit committee hearing.
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

  const { makeMap } = G.mapkit;
  const { mc, num, rowPick, setupCanvas, benfordChart, lineChart } = G.puzzles.kit;
  const $ = id => document.getElementById(id);
  const fmt = U.fmt, acct = U.acct, money = U.money;

  // ================================================================ cast
  const cast = {
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


  // ================================================================ maps
  // ---------------------------------------------------------------- 14th floor
  function buildFloor() {
    const m = makeMap('floor', 46, 32);

    // Upper band
    m.room(1, 1, 9, 8, '_');    // Victor Kessane — VP Revenue Management
    m.room(11, 1, 19, 8, '.');  // Revenue Management open area
    m.room(21, 1, 32, 8, '_');  // Boardroom
    m.room(34, 1, 44, 8, '_');  // Celeste Marr — Controller
    for (let x = 1; x <= 44; x++) if (m.floor[1][x] !== '#') m.floor[0][x] = 'W';
    m.door(5, 9); m.door(15, 9); m.door(26, 9); m.door(27, 9); m.door(39, 9);

    // Main corridor
    m.room(1, 10, 44, 11, '.');

    // Middle band
    m.room(1, 13, 14, 21, ':');  // Accounts Payable
    m.room(16, 13, 27, 21, ','); // Lobby
    m.room(18, 12, 25, 12, ','); // lobby opens onto corridor
    m.room(29, 13, 35, 19, '.'); // Your office
    m.room(37, 13, 44, 21, '.'); // IT / ERP security
    m.room(41, 13, 44, 21, '='); // server floor
    m.door(7, 12); m.door(32, 12); m.door(40, 12);

    // Dale's glass office inside AP
    for (let y = 13; y <= 16; y++) m.floor[y][6] = 'g';
    for (let x = 1; x <= 6; x++) m.floor[17][x] = 'g';
    m.door(3, 17);

    // Lower corridor
    m.room(1, 23, 44, 24, '.');
    m.door(7, 22); m.door(17, 22);

    // Bottom band
    m.room(1, 26, 9, 30, '.');    // Records
    m.room(11, 26, 19, 30, ',');  // Break room
    m.room(21, 26, 27, 30, ',');  // Print & mail
    m.room(29, 26, 44, 30, '.');  // Close team
    m.door(5, 25); m.door(15, 25); m.door(24, 25); m.door(36, 25);

    // --- Victor's office
    m.row(1, 3, 1, 'B', 'v_shelf');
    m.put(9, 1, 'P');
    m.put(4, 3, 'D', 'v_desk'); m.put(5, 3, 'C', 'v_pc'); m.put(6, 3, 'D', 'v_desk');
    m.put(5, 2, 'h'); m.put(4, 5, 'h'); m.put(6, 5, 'h');
    m.put(9, 6, 'c', 'v_couch'); m.put(9, 7, 'c', 'v_couch');
    m.put(1, 8, 'P');
    m.put(8, 0, 'A', 'v_art');

    // --- Revenue Management
    m.put(12, 3, 'C', 'rm_pc'); m.put(13, 3, 'D'); m.put(14, 3, 'C', 'rm_pc2');
    m.put(16, 3, 'C', 'rm_pc2'); m.put(17, 3, 'D'); m.put(18, 3, 'C', 'rm_pc2');
    m.put(12, 6, 'C', 'rm_pc2'); m.put(13, 6, 'D'); m.put(14, 6, 'C', 'rm_pc2');
    m.put(16, 6, 'C', 'rm_pc2'); m.put(17, 6, 'D'); m.put(18, 6, 'C', 'rm_pc2');
    m.put(12, 4, 'h'); m.put(14, 4, 'h'); m.put(16, 4, 'h'); m.put(18, 4, 'h');
    m.put(19, 1, 'P'); m.put(11, 8, 'P');
    m.put(13, 0, 'Z', 'rm_board'); m.put(14, 0, 'Z', 'rm_board');

    // --- Boardroom
    for (let x = 23; x <= 30; x++) for (let y = 3; y <= 5; y++) m.put(x, y, 'T', 'b_table');
    for (let x = 23; x <= 30; x++) { m.put(x, 2, 'h'); m.put(x, 6, 'h'); }
    m.put(22, 4, 'h'); m.put(31, 4, 'h');
    m.put(21, 1, 'P'); m.put(32, 1, 'P'); m.put(21, 8, 'P'); m.put(32, 8, 'P');
    m.put(26, 0, 'L', 'b_screen'); m.put(27, 0, 'L', 'b_screen');

    // --- Celeste's office
    m.row(34, 36, 1, 'B', 'c_shelf');
    m.put(44, 1, 'F', 'c_files'); m.put(44, 2, 'F', 'c_files');
    m.put(38, 3, 'D', 'c_desk'); m.put(39, 3, 'C', 'c_pc'); m.put(40, 3, 'D', 'c_desk');
    m.put(39, 2, 'h'); m.put(38, 5, 'h'); m.put(40, 5, 'h');
    m.put(34, 8, 'P'); m.put(44, 8, 'P');
    m.put(41, 0, 'A', 'c_art');

    // --- Corridor
    m.put(1, 10, 'P'); m.put(44, 10, 'P'); m.put(33, 10, 'w', 'cooler'); m.put(10, 11, 'P');

    // --- AP
    m.put(1, 13, 'F', 'd_files'); m.put(5, 13, 'P');
    m.put(2, 15, 'D', 'd_desk'); m.put(3, 15, 'C', 'd_pc'); m.put(4, 15, 'D', 'd_desk');
    m.put(3, 14, 'h');
    m.put(8, 14, 'C', 'ap_pc'); m.put(9, 14, 'D'); m.put(10, 14, 'C', 'ap_pc');
    m.put(12, 14, 'C', 'ap_pc'); m.put(13, 14, 'D');
    m.put(8, 17, 'C', 't_pc'); m.put(9, 17, 'D'); m.put(10, 17, 'C', 'ap_pc');
    m.put(2, 20, 'C', 'ap_pc'); m.put(3, 20, 'D'); m.put(4, 20, 'C', 'ap_pc');
    m.put(10, 20, 'C', 'ap_pc'); m.put(11, 20, 'D'); m.put(12, 20, 'C', 'ap_pc');
    m.put(14, 13, 'F', 'ap_files'); m.put(14, 21, 'F', 'ap_files'); m.put(14, 17, 'Y', 'ap_copier');
    m.put(8, 18, 'h'); m.put(12, 15, 'h'); m.put(10, 21, 'h');

    // --- Lobby
    m.row(18, 21, 15, 'r', 'reception');
    m.put(20, 14, 'h');
    m.put(16, 13, 'P'); m.put(27, 13, 'P'); m.put(16, 21, 'P'); m.put(27, 21, 'P');
    m.put(25, 18, 'c', 'lobby_couch'); m.put(26, 18, 'c', 'lobby_couch');
    m.put(17, 12, 'A', 'logo'); m.put(26, 12, 'A', 'logo');
    for (let x = 20; x <= 23; x++) m.put(x, 22, 'E', 'elevator');

    // --- Your office
    m.put(29, 13, 'B', 'y_shelf'); m.put(30, 13, 'B', 'y_shelf');
    m.put(35, 13, 'P'); m.put(35, 19, 'P'); m.put(29, 19, 'F', 'y_files');
    m.put(31, 16, 'D', 'y_desk'); m.put(32, 16, 'C', 'y_pc'); m.put(33, 16, 'D', 'y_desk');
    m.put(32, 17, 'h'); m.put(31, 14, 'h'); m.put(33, 14, 'h');
    m.put(34, 12, 'A', 'y_window');

    // --- IT
    m.put(37, 13, 'F', 'it_files');
    m.put(38, 15, 'C', 'n_pc'); m.put(39, 15, 'D');
    m.put(38, 16, 'h');
    for (let y = 14; y <= 19; y++) { m.put(42, y, 'S', 'servers'); m.put(44, y, 'S', 'servers'); }
    m.put(37, 21, 'P');

    // --- Records
    m.row(1, 3, 26, 'F', 'rec_files'); m.row(7, 9, 26, 'F', 'rec_files');
    m.row(2, 4, 28, 'F', 'rec_files'); m.row(6, 8, 28, 'F', 'rec_files');
    m.put(7, 28, 'F', 'cabinet7');
    m.put(9, 30, 'X', 'rec_shredder');
    m.put(2, 30, 'T', 'rec_table'); m.put(3, 30, 'T', 'rec_table');

    // --- Break room
    m.row(11, 14, 26, 'K', 'counter'); m.put(13, 26, 'M', 'coffee');
    m.put(18, 26, 'R', 'fridge'); m.put(19, 26, 'w', 'cooler');
    m.put(19, 28, 'Q', 'vending');
    m.put(13, 28, 'T', 'break_table'); m.put(14, 28, 'T', 'break_table');
    m.put(12, 28, 'h'); m.put(15, 28, 'h');
    m.put(17, 30, 'c', 'break_couch'); m.put(18, 30, 'c', 'break_couch');

    // --- Print & mail
    m.put(21, 26, 'Y', 'copier'); m.put(22, 26, 'Y', 'copier');
    m.put(26, 26, 'B', 'mail'); m.put(27, 26, 'B', 'mail');
    m.row(23, 25, 28, 'T', 'mail_table');
    m.put(27, 30, 'X', 'mail_shredder');

    // --- Close team
    const closeDesks = [[30, 27], [38, 27], [42, 27], [30, 29], [38, 29], [42, 29]];
    for (const [x, y] of closeDesks) { m.put(x, y, 'C', 'close_pc'); m.put(x + 1, y, 'D'); m.put(x + 2, y, 'C', 'close_pc'); }
    m.put(33, 27, 'P'); m.put(44, 30, 'P'); m.put(29, 26, 'F', 'close_files');
    m.put(31, 25, 'Z', 'close_board'); m.put(32, 25, 'Z', 'close_board');

    return m;
  }

  // ---------------------------------------------------------------- Garage P2
  function buildGarage() {
    const m = makeMap('garage', 30, 18);
    m.room(1, 1, 28, 16, '=');
    m.dark = true;
    m.put(14, 0, 'E', 'g_elevator'); m.put(15, 0, 'E', 'g_elevator');
    // Pillars, lettered
    m.parking = true;
    const pillars = [[6, 8, 'A'], [13, 8, 'B'], [20, 8, 'C'], [26, 8, 'D']];
    for (const [x, y, l] of pillars) { m.put(x, y, 'O', 'pillar_' + l); m.label(x, y, l); }
    // Parked cars (north row and south row), 2 wide x 3 tall
    const north = [[2, '#6b7a8f'], [5, '#8a2a2a'], [8, '#2f4f3f'], [17, '#c8c2b0'], [23, '#2a2d38'], [26, '#5a5f66']];
    const south = [[3, '#a08040'], [9, '#3b4b6b'], [12, '#7a7a7a'], [18, '#264036'], [24, '#9a3b2a']];
    for (const [x, c] of north) m.props.push({ kind: 'car', x, y: 1, w: 2, h: 3, color: c, facing: 'down', solid: true });
    for (const [x, c] of south) m.props.push({ kind: 'car', x, y: 14, w: 2, h: 3, color: c, facing: 'up', solid: true });
    m.lights = [{ x: 14.5, y: 2, r: 70 }, { x: 6.5, y: 10, r: 60 }, { x: 20.5, y: 10, r: 46, flicker: true }, { x: 26, y: 13, r: 54 }];
    m.put(10, 0, 'A', 'g_sign'); m.label(10, 0, 'P2');
    m.darkness = 0.86; m.darkTint = '4,6,12';
    return m;
  }


  // ================================================================ workpapers
  const defs = {};
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

  defs.wp2410 = {
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
  defs.wpAP = {
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

  defs.wpVM = {
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
  defs.wpPOP = {
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
  defs.wpJE = {
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
  defs.wpLOSS = {
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


  // ================================================================ hearing claims
  const ROUNDS = [
    {
      who: 'celeste', key: 'r1', evidence: ['ev_rf'],
      claim: 'The trade accrual is an estimate. It’s reconciled every quarter, and I’m comfortable it’s supported.',
      press: 'Revenue Management provides the top-side adjustments. Those are judgment calls — that’s what we pay Victor for. I signed the Q2 rec myself.',
      wrong: 'Celeste: "I don’t see how that bears on whether the accrual is supported."',
      after: [
        ['you', 'The roll-forward doesn’t roll. $30.55 million of "Other — per Rev Mgmt" top-sides over five quarters. No TPM support. Martin refused to sign Q2. You overrode him.'],
        ['celeste', '...Thirty million. I thought they were timing differences. Victor said—'],
        ['beck', 'Ms. Marr, we’ll come back to what you thought. Mr. Kessane, you’re up.'],
      ],
    },
    {
      who: 'victor', key: 'r2', evidence: ['ev_je'],
      claim: 'The Q3 true-up was a routine change in estimate. It went through normal close procedures, like every entry I’ve ever made.',
      press: 'Every entry in our ERP has an approver. That’s what SOX is for. I don’t even have posting rights — how would I post an unapproved entry?',
      wrong: 'Victor: "Interesting document. It says nothing about my estimate."',
      after: [
        ['you', 'You’re right — you don’t have posting rights. So you checked out the firefighter ID at 11:41 PM on October 2nd, reopened a locked period, posted $8,450,000 with no approver, and locked it again at 12:06.'],
        ['lena', 'Back-dated, post-close, unapproved. Harold, my firm will need to reassess our reliance on management representations. All of them.'],
        ['victor', 'There was an interface problem. I fixed it.'],
        ['you', 'The interface posts at 11:15 every night. It posted fine. Yours was the only manual entry in that session.'],
      ],
    },
    {
      who: 'victor', key: 'r3', evidence: ['ev_vm', 'ev_dale'],
      claim: 'Fine — the accrual was aggressive. But Meridian Retail Solutions is an independent broker. I have no personal relationship with them whatsoever.',
      press: 'They came recommended by a retail contact. I couldn’t tell you who owns them. I’ve never been to their offices.',
      wrong: 'Victor: "That’s about a vendor’s billing. Not about me."',
      after: [
        ['you', 'You’ve never been to their offices? Meridian’s remit-to address is 8812 Larkspur Court, Mason. That’s the address you gave HR for your emergency contact. Your sister, Elise Moore.'],
        ['victor', '...'],
        ['beck', 'Mr. Kessane. Is that your sister’s address?'],
        ['victor', 'My sister runs a small consulting business. That isn’t a crime.'],
      ],
    },
    {
      who: 'victor', key: 'r4', evidence: ['ev_pop'],
      claim: 'And Meridian *performed*. The promotions ran. Look at MegaMart in July — Kettle chips nearly doubled. That’s execution.',
      press: 'You want to second-guess retail execution from a spreadsheet? Ask any of our customers. Those events happened.',
      wrong: 'Victor: "That doesn’t tell you anything about whether promotions ran."',
      after: [
        ['you', 'MegaMart in July was a retailer-run event — MegaMart’s own TPR. Meridian billed for it anyway. But four of six invoices I sampled billed for events with zero lift in scan data. FreshCo dish pods, weeks 29 through 34: flat. Grandway, flat. A second MegaMart display in September: flat.'],
        ['you', 'And the TPM calendar that says they were "executed" was edited under your ID on October 1st at 10:14 PM.'],
        ['stokes', 'Jesus, Victor.'],
      ],
    },
    {
      who: 'victor', key: 'r5', evidence: ['ev_benford'],
      claim: 'Every Meridian invoice was under fifty thousand and approved within the delegation of authority. The controls worked exactly as designed.',
      press: 'Small invoices, small events. That’s how retail execution is billed across this industry. If AP processed something wrong, talk to Dale.',
      wrong: 'Victor: "And that has what to do with the DoA?"',
      after: [
        ['you', '548 Meridian invoices this year. Average: $48,372. Ninety-four percent land within five thousand of the Controller’s threshold. Leading digit 4 shows up at more than twice Benford’s expectation. That isn’t how retail execution is billed. That’s how you keep a Controller from ever seeing an invoice.'],
        ['dale', 'He told me to keep them under fifty. Every one. He paid me four thousand a month to set up the vendor and approve them. I’m sorry. I’m so sorry.'],
        ['victor', 'Dale. Shut up.'],
      ],
    },
    {
      who: 'beck', key: 'r6', evidence: ['ev_loss'],
      claim: '{last}, this committee needs a number. Before we call the SEC, the auditors, and the US Attorney — what has this cost Halvorsen’s shareholders?',
      press: 'Not invoices. Not estimates. Cash that left this company and isn’t coming back.',
      wrong: 'Beck: "That’s not a number, {last}."',
      after: [
        ['you', 'Forty-two million, five hundred six thousand, eight hundred dollars. Net cash, vendor inception through September 30th. Q3 has to be corrected before the 10-Q, and prior periods evaluated under SAB 108.'],
        ['lena', 'We’ll be issuing a request to delay the filing. NT 10-Q.'],
      ],
    },
  ];

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
  story.location = () => (S().map === 'garage' ? 'Halvorsen Brands HQ, Garage P2' : 'Halvorsen Brands HQ, Floor 14');

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
    s.night = n === 3;  // the shredder chapter happens after dark
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
    const r = await G.hearing.start(HEARING);
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
    await G.kit.ending({
      headline: '$42.5M', headlineLabel: 'Fraud uncovered',
      epilogue: [
        'Victor Kessane was terminated for cause that afternoon. Halvorsen referred the matter to the U.S. Attorney for the Southern District of Ohio. Meridian Retail Solutions\u2019 accounts at First Coastal were frozen the following Tuesday; Elise Moore retained counsel.',
        'Halvorsen filed an NT 10-Q and reversed JE 30917 before issuing Q3. Under SAB 108, prior-period misstatements were judged qualitatively material \u2014 they concealed an officer\u2019s theft \u2014 and the company restated FY25. Q3 EPS came in at $0.83. The Street was unforgiving for about a week.',
        'Management concluded that ICFR was not effective: material weaknesses in vendor master segregation of duties, privileged access monitoring, and the review of top-side journal entries. Whitford & Lowe expanded its procedures. Celeste Marr resigned in November.',
        'Dale Prentiss cooperated fully and pleaded guilty to a single count. His statement \u2014 and the records he didn\u2019t finish shredding \u2014 anchored the government\u2019s case.',
        'Martin Oyelaran received a letter from Halvorsen\u2019s new General Counsel confirming that nothing in his separation agreement prevented him from communicating with the SEC. Rule 21F-17 had said so all along.',
        'Priya Raman was promoted to Director of Revenue Management analytics. Her SEC whistleblower award, when it came eighteen months later, was protected by the anti-retaliation provisions of SOX \u00a7806 and Dodd-Frank. She still keeps the burner phone in her desk drawer.',
        'Two weeks later, Lena Strand resigned from Whitford & Lowe to open her own forensic practice. Her first call was to you.',
        'You signed the 2410 reconciliation on Thursday of the following week. Every line tied.',
      ],
    });
  }

  // ================================================================ talk

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
      await narrate(G.touch ? '(Tap *Phone* at the top of the screen to read messages, and *Case File* to review your evidence.)' : '(Press *P* to read the phone. Press *J* to open your case file.)');
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



  // ================================================================ register
  const HEARING = {
    title: 'Special Session of the Audit Committee',
    place: 'BOARDROOM, FLOOR 14 \u00b7 FRI 10/09 9:04 AM',
    objection: 'EXCEPTION NOTED!',
    credLabel: 'Credibility with the committee',
    reaction: 'The committee exchanges glances.',
    rounds: ROUNDS,
    async lose() {
      await say('beck', 'I\u2019ve heard enough. {last}, you came into this room with accusations against a twenty-year officer of this company and you can\u2019t keep your own exhibits straight.');
      await say('victor', 'Thank you, Harold. I\u2019m sure {first} meant well.');
      await say('beck', 'This session is adjourned. We\u2019ll reconvene when management has had a chance to respond in writing.');
    },
    async finale() {
      await say('beck', 'Mr. Kessane, you are suspended effective immediately. Security will escort you from the building. Do not access any company system. Counsel will be in touch.');
      await say('victor', '...');
      await narrate('Victor stands. On his way past, he stops beside you and lowers his voice.');
      for (;;) {
        const c = await choose('victor', 'You know what Martin got? Eighteen months\u2019 salary and a non-disparagement agreement. It\u2019s not too late to be reasonable, {first}. Whatever they pay you, I can\u2014', [
          'Martin\u2019s NDA can\u2019t stop him from talking to the SEC. Rule 21F-17. And I\u2019m not for sale.',
          '...How much are we talking about?',
          'Say nothing. Let security do their job.',
        ]);
        if (c === 0) { await say('victor', '...'); await say('beck', 'Get him out of here.'); break; }
        if (c === 1) { G.hints.fail('hearing.r7'); await say('beck', 'I\u2019m going to pretend I didn\u2019t hear that, {last}. Try again.'); }
        else { await narrate('Victor smiles thinly, as if your silence were a negotiation.'); await say('victor', 'Think about it. Martin did.'); }
      }
    },
  };

  const built = G.makeStory({
    chapters: CHAPTERS,
    evidence: EV,
    clock: () => story.clock(),
    location: () => story.location(),
    objective: () => story.objective(),
    npcPos: id => story.npcPos(id),
    nightLights: mapName => (mapName === 'floor' ? story.nightLights() : []),
    newGame: story.newGame,
    beats: story.beats,
    talk: TALK,
    use: async id => { await story.use(id); return true; },
    flavor: {},
    onStep: (x, y) => story.onStep(x, y),
    onResume: s => { if (s.flags.dale_scene_started && !s.flags.dale_confronted) s.flags.dale_scene_started = false; },
    ending,
  });
  // keep internal references (story.beats etc.) pointing at the same functions
  Object.assign(story, { chapterInfo: built.chapterInfo });

  G.registerEpisode({
    id: 'ep1', num: 1,
    title: 'Gross to Net',
    subtitle: 'Halvorsen Brands \u00b7 $6.2B CPG \u00b7 Trade-promotion embezzlement hidden in gross-to-net.',
    chapters: CHAPTERS,
    contact: { name: 'LEDGER', avatar: 'L', sub: 'unknown number \u00b7 end-to-end encrypted' },
    frustrated: 'You\u2019re making this harder than it has to be. Slow down. Read the workpaper notes \u2014 Martin left you more than you think.',
    ranks: ['Partner Track', 'Forensic Director', 'Senior Investigator', 'LEDGER Did Most of the Work'],
    start: { map: 'floor', x: 21, y: 23, dir: 'down' },
    buildMaps: () => ({ floor: buildFloor(), garage: buildGarage() }),
    cast, hints: HINTS, puzzles: defs, story: built,
    puzzleEvidence: { wp2410: 'ev_rf', wpAP: 'ev_benford', wpVM: 'ev_vm', wpPOP: 'ev_pop', wpJE: 'ev_je', wpLOSS: 'ev_loss' },
  });
})();
