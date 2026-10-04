// Episode 5 — Hearthstone. The series finale: a private-equity roll-up of the earlier companies tries to IPO on a
// foundation of related parties, round-trips, adjusted EBITDA, stale goodwill, cookie-jar reserves and fee stripping.
(function () {
  const U = G.util, K = G.kit;
  const { makeMap } = G.mapkit;
  const { mc, num, rowPick, multiPick } = G.puzzles.kit;
  const fmt = U.fmt;
  const say = K.say, narrate = K.narrate, choose = K.choose, text = K.text;
  const S = K.S, F = K.F, E = K.E, done = K.done;
  const M = v => (Math.abs(v) >= 1e5 ? v / 1e6 : v);

  // ================================================================ maps
  function buildTower() {
    const m = makeMap('tower', 48, 24);
    m.room(1, 1, 9, 8, '_');    // Asher
    m.room(11, 1, 22, 8, '_');  // boardroom
    m.room(24, 1, 29, 8, '.');  // CEO
    m.room(31, 1, 36, 8, '.');  // CFO
    m.room(38, 1, 46, 8, '.');  // Calder fund CFO
    for (let x = 1; x <= 46; x++) if (m.floor[1][x] !== '#') m.floor[0][x] = 'W';
    for (let x = 11; x <= 22; x++) m.floor[9][x] = 'g';
    [5, 26, 33, 42].forEach(x => m.door(x, 9)); m.door(16, 9); m.door(17, 9);
    m.room(1, 10, 46, 11, '^');
    m.room(1, 13, 14, 21, '-');   // data room
    m.room(16, 12, 30, 21, '^');  // lobby (open to corridor)
    m.room(32, 13, 38, 21, '.');  // war room
    m.room(40, 13, 46, 21, ',');  // kitchen
    m.door(7, 12); m.door(35, 12); m.door(43, 12);
    for (let y = 13; y <= 21; y++) m.floor[y][15] = 'g';
    m.door(15, 17);

    // Asher's corner office
    m.put(4, 3, 'D', 'a_desk'); m.put(5, 3, 'C', 'a_pc'); m.put(6, 3, 'D', 'a_desk'); m.put(5, 2, 'h');
    m.put(1, 1, 'B', 'a_shelf'); m.put(2, 1, 'B', 'a_shelf'); m.put(8, 0, 'A', 'a_art'); m.put(9, 1, 'P');
    m.put(1, 6, 'c', 'a_couch'); m.put(1, 7, 'c', 'a_couch'); m.put(9, 7, 'Q', 'a_bar');
    // boardroom
    for (let x = 13; x <= 20; x++) for (let y = 3; y <= 5; y++) m.put(x, y, 'T', 'b_table');
    for (let x = 13; x <= 20; x++) { m.put(x, 2, 'h'); m.put(x, 6, 'h'); }
    m.put(12, 4, 'h'); m.put(21, 4, 'h');
    m.put(16, 0, 'L', 'b_screen'); m.put(17, 0, 'L', 'b_screen'); m.put(11, 1, 'P'); m.put(22, 1, 'P');
    // CEO
    m.put(25, 3, 'D', 'p_desk'); m.put(26, 3, 'C', 'p_pc'); m.put(27, 3, 'D', 'p_desk'); m.put(26, 2, 'h'); m.put(29, 1, 'P');
    // CFO
    m.put(32, 3, 'D', 'd_desk'); m.put(33, 3, 'C', 'd_pc'); m.put(34, 3, 'D', 'd_desk'); m.put(33, 2, 'h'); m.put(36, 1, 'F', 'd_files');
    // Calder CFO
    m.put(41, 3, 'D', 'c_desk'); m.put(42, 3, 'C', 'c_pc'); m.put(43, 3, 'D', 'c_desk'); m.put(42, 2, 'h');
    m.put(46, 1, 'F', 'c_files'); m.put(38, 1, 'B', 'c_shelf'); m.put(40, 0, 's', 'calder_sign'); m.label(40, 0, 'CALDER RIDGE');
    // corridor
    m.put(1, 10, 'P'); m.put(46, 10, 'P'); m.put(30, 10, 'w', 'cooler');
    // data room
    for (let y = 14; y <= 20; y++) m.put(1, y, 'S', 'servers');
    m.put(5, 15, 'C', 'vdr'); m.put(6, 15, 'D'); m.put(9, 15, 'C', 'vdr'); m.put(10, 15, 'D');
    m.put(5, 18, 'C', 'vdr'); m.put(6, 18, 'D'); m.put(9, 18, 'C', 'vdr'); m.put(10, 18, 'D');
    m.put(14, 13, 'F', 'dr_files'); m.put(14, 21, 'F', 'dr_files');
    // lobby
    m.row(20, 24, 15, 'r', 'reception'); m.put(22, 14, 'h');
    m.put(16, 13, 'P'); m.put(30, 13, 'P'); m.put(16, 21, 'P'); m.put(30, 21, 'P');
    m.put(18, 19, 'c', 'lobby_couch'); m.put(19, 19, 'c', 'lobby_couch'); m.put(27, 19, 'c', 'lobby_couch'); m.put(28, 19, 'c', 'lobby_couch');
    // war room
    m.put(34, 15, 'D', 'war_desk'); m.put(35, 15, 'C', 'war_pc'); m.put(36, 15, 'D', 'war_desk'); m.put(35, 16, 'h');
    m.put(32, 13, 'B', 'war_shelf'); m.put(38, 21, 'P'); m.put(37, 12, 'Z', 'war_board');
    // kitchen
    m.put(40, 13, 'R', 'fridge'); m.row(44, 45, 13, 'K', 'counter'); m.put(46, 13, 'M', 'coffee');
    m.put(42, 17, 'T', 'k_table'); m.put(43, 17, 'T', 'k_table');
    return m;
  }

  function buildMCC() {
    const m = makeMap('mcc', 24, 14, { darkness: 0.5 });
    m.room(1, 1, 22, 12, '=');
    for (const [x, y] of [[5, 5], [11, 5], [17, 5], [5, 9], [11, 9], [17, 9]]) {
      m.put(x, y, 'q', 'v_table'); m.put(x, y - 1, 'h'); m.put(x, y + 1, 'h');
    }
    m.put(20, 2, 'D', 'co_desk'); m.put(21, 2, 'C', 'co_pc');
    m.put(1, 2, 'Q', 'vending'); m.put(2, 2, 'Q', 'vending');
    m.put(11, 0, 's', 'visit_sign'); m.label(11, 0, 'VISITING');
    m.put(6, 0, 'Z', 'rules');
    return m;
  }

  function buildRiverwalk() {
    const m = makeMap('riverwalk', 34, 18, { dark: true, darkness: 0.74, darkTint: '8,10,26' });
    m.room(1, 1, 32, 11, '=');
    m.room(1, 12, 32, 16, '&');
    for (let x = 1; x <= 32; x++) m.put(x, 11, 'u', 'railing');
    for (let x = 0; x <= 33; x++) m.floor[0][x] = '#';
    for (const [x, y] of [[6, 8], [14, 8], [22, 8], [28, 8]]) { m.put(x, y, 'T', 'bench'); m.put(x + 1, y, 'T', 'bench'); }
    for (const [x, y] of [[3, 3], [10, 2], [18, 3], [26, 2], [31, 4]]) m.put(x, y, 'e');
    m.put(16, 0, 's', 'rw_sign'); m.label(16, 0, 'CHICAGO RIVERWALK');
    m.lights = [{ x: 4, y: 6, r: 36 }, { x: 12, y: 6, r: 36 }, { x: 20, y: 6, r: 36 }, { x: 28, y: 6, r: 36 }, { x: 24, y: 9, r: 28 }];
    for (let i = 0; i < 20; i++) m.lights.push({ x: 1 + ((i * 29) % 32), y: 12 + ((i * 7) % 5), r: 5 });
    return m;
  }

  // ================================================================ cast
  const cast = {
    lena: { name: 'Lena Strand', title: 'Founder, Strand Forensic Advisory', look: { skin: '#f3d6c0', hair: '#e2c27a', hairStyle: 'bun', shirt: '#e8e8e8', jacket: '#1f2f4a', pants: '#1f2f4a' } },
    olivia: { name: 'Olivia Grant', title: 'MD, Equity Capital Markets, Whitmore Lane Securities', look: { skin: '#a8754f', hair: '#1a1210', hairStyle: 'bun', shirt: '#f4f4f4', jacket: '#2a2a40', pants: '#2a2a40' } },
    ellis: { name: 'Jonathan Ellis', title: 'Partner, Pell & Marsh LLP (underwriters’ counsel)', look: { skin: '#f0c8a8', hair: '#5a4a3a', hairStyle: 'short', shirt: '#f0f0f0', jacket: '#3a3a42', tie: '#7a1f2b', pants: '#3a3a42', glasses: '#333' } },
    pryce: { name: 'Daniel Pryce', title: 'CEO, Hearthstone Brands', look: { skin: '#f0c8a8', hair: '#c8a878', hairStyle: 'short', shirt: '#e8f0ff', jacket: '#3a4a6a', pants: '#3a4a6a' } },
    doyle: { name: 'Catherine Doyle', title: 'CFO, Hearthstone Brands', look: { skin: '#f3d6c0', hair: '#a04a2a', hairStyle: 'long', shirt: '#f0f0f0', jacket: '#4a2a4a', pants: '#2a2a30' } },
    chu: { name: 'Raymond Chu', title: 'CFO, Calder Ridge Partners', look: { skin: '#e8c4a0', hair: '#222', hairStyle: 'short', shirt: '#f0f0f0', jacket: '#2a2a30', tie: '#8a2a2a', pants: '#2a2a30', glasses: '#222' } },
    asher: { name: 'Simon Asher', title: 'Executive Chairman, Hearthstone · Operating Partner, Calder Ridge', look: { skin: '#e2c0a4', hair: '#d8d8d8', hairStyle: 'slick', hair2: '#f4f4f4', shirt: '#1a1a1a', jacket: '#3a3a42', pants: '#2a2a30' } },
    avery: { name: 'Avery Kim', title: 'Reception, Hearthstone', look: { skin: '#ecc9a2', hair: '#1a1a1a', hairStyle: 'bob', shirt: '#d9d4c8', jacket: '#2a2a30', pants: '#2a2a30' } },
    rosa: { name: 'Rosa Delgado', title: 'Director of Inventory Control, Northfield Foods', look: { skin: '#b07850', hair: '#1a1210', hairStyle: 'long', shirt: '#2a4a6a', jacket: '#d04a2a', pants: '#2a2a3a' } },
    victor: { name: 'Victor Kessane', title: 'Inmate, MCC Chicago (awaiting sentencing)', look: { skin: '#d9a982', hair: '#777', hairStyle: 'short', shirt: '#e07020', pants: '#e07020' } },
    ken: { name: 'Officer Ken Abara', title: 'Correctional Officer, MCC Chicago', look: { skin: '#6b4429', hair: '#1a1a2a', hairStyle: 'cap', shirt: '#3a4a5a', pants: '#2a2a30' } },
    martin: { name: 'Martin Oyelaran', title: 'Controller, Larch Fund Services', look: { skin: '#6b4429', hair: '#1a1410', hairStyle: 'short', shirt: '#e8e4d8', jacket: '#5a4a3a', pants: '#3a3a44', glasses: '#c9a24a' } },
  };

  // ================================================================ evidence
  const EV = {
    ev_courier: { title: 'Courier envelope', ref: 'ITEM 0', short: '"I owe you one. Ask who the customers are. — M"', body: '<p>Delivered to Hearthstone reception, addressed to you by name: a prepaid phone and a card.</p><p><i>"I owe you one. Ask Hearthstone who its customers are. — M"</i></p>' },
    ev_rp: { title: 'Related-party map', ref: 'WP H-1', short: '17.0% of revenue from Calder-controlled customers; none disclosed.', body: '<ul><li>Lone Star Beverage (Calder Fund IV, controlled) and Summit Club Stores (Fund IV, 38% + board seat) are related parties under common control by Calder Ridge’s GP.</li><li>Keystone Logistics (Asher Family Trust) and Calder Ridge Management (monitoring fees) are related-party vendors.</li><li>Related-party customers: <b>$312M, 17.0%</b> of LTM revenue. The S-1 says "no transactions with affiliates other than the monitoring agreement."</li></ul>' },
    ev_trailers: { title: 'Rosa’s trailer log', ref: 'NORTHFIELD 6/28–7/9', short: '60 trailers to Lone Star at quarter-end; 41 came back in July as "rework."', body: '<p>Northfield shipped 60 trailers to Lone Star June 28–30. Forty-one returned July 6–9 to Northfield’s Green Bay 3PL, booked as "Lone Star — rework inventory transfer," not as sales returns. Seals unbroken on 33 of them.</p>' },
    ev_round: { title: 'Lone Star round-trip', ref: 'WP H-2', short: '$96M of quarter-end sales funded by Hearthstone’s own "services" payments.', body: '<ul><li>Three sales to Lone Star June 28–30: <b>$96.0M</b>.</li><li>Three "logistics/merchandising services" payments to Lone Star June 30–July 2: $88.0M, no statements of work, no deliverables.</li><li>41 of 60 trailers came back sealed. No contract under ASC 606-10-25-1: reverse the revenue.</li></ul>' },
    ev_ebitda: { title: 'Adjusted EBITDA bridge', ref: 'WP H-3', short: '$61M of improper add-backs; $306.5M → $245.5M.', body: '<ul><li>Run-rate synergies not achieved ($31.0M), "normalized" trade spend ($18.0M), and integration costs recurring every year ($12.0M) are not adjustable under Item 10(e) / C&DI 100.01.</li><li>Adjusted EBITDA <b>$245.5M</b>, not $306.5M.</li></ul>' },
    ev_goodwill: { title: 'Northfield goodwill impairment', ref: 'WP H-4', short: '$115.2M impairment never recorded after the January default.', body: '<ul><li>Management’s test used pre-restatement EBITDA ($46.5M) at 11.0x. Restated EBITDA $41.2M at the peer multiple of 9.0x = <b>$370.8M</b> fair value.</li><li>Carrying amount $486.0M: impairment <b>$115.2M</b>, within $190.0M of goodwill. Triggering event: the January 2027 covenant default.</li></ul>' },
    ev_victor: { title: 'Statement of Victor Kessane', ref: 'MCC 9/15', short: 'Simon designed Meridian and took 20% through a Keystone SPV.', body: '<p>Victor Kessane, MCC Chicago, 9/15/2027, with his counsel’s consent: Simon Asher designed the Meridian structure ("the gross-to-net trick"), introduced Keystone Registered Agents, and received 20% of Meridian’s receipts through <b>KRA Holdings 9 LLC</b>. Victor has agreed to repeat this to the U.S. Attorney.</p>' },
    ev_martin: { title: 'Keystone wire records', ref: 'FROM MARTIN OYELARAN', short: 'Thursday’s IPO waterfall routes the termination fee to the Asher Family Trust.', body: '<p>From Martin Oyelaran, controller at Larch Fund Services (Calder’s fund administrator): the IPO-day funds-flow memo and three years of wires showing Calder Ridge Management LLC payments forwarded through Keystone SPVs (KRA Holdings 9, 12 and 14 LLC) to the <b>Asher Family Trust (Cayman)</b>. Martin provided them through counsel under SEC Rule 21F.</p>' },
    ev_reserves: { title: 'Acquisition reserve releases', ref: 'WP H-5', short: '$21M of improper reserves released to hit three quarterly targets.', body: '<ul><li>"Restructuring" reserves recorded in purchase accounting for costs Hearthstone wasn’t obligated to incur (ASC 805-20-25-2).</li><li><b>$21.0M</b> released to income over the LTM; without the releases, Q3 FY26, Q4 FY26 and Q1 FY27 would each have missed target.</li></ul>' },
    ev_fees: { title: 'Fee stripping & valuation', ref: 'WP H-6', short: '$34.48M fee to Asher’s trust; S-1 overstates value by $1.52B.', body: '<ul><li>IPO accelerates the monitoring fee: present value of 8 years of $6.0M at 8% = <b>$34.48M</b>, routed through KRA Holdings 14 LLC to the Asher Family Trust.</li><li>Corrected Adjusted EBITDA $197.6M vs. $306.5M. At 14.0x, implied enterprise value is overstated by <b>$1,524.6M</b>.</li></ul>' },
  };

  // ================================================================ hints (M)
  const HINTS = {
    'wpH1.rp': ['Same sponsor, different fund. Does that make them strangers?', 'Common control by Calder’s GP. Significant influence counts too. And don’t forget who owns Keystone.', 'Lone Star, Summit Club, Keystone Logistics, Calder Ridge Management.'],
    'wpH1.pct': ['Only the customers count for revenue.', '(212 + 100) ÷ 1,840.', '17.0%.'],
    'wpH1.disc': ['Two sets of rules: GAAP and Regulation S-K.', 'ASC 850 and Item 404.', 'The ASC 850 / Item 404 answer.'],
    'wpH2.legs': ['A round trip has two legs. Select both.', 'The three Lone Star sales and the three "services" payments to Lone Star.', 'H-7781, H-7790, H-7802, and the three payments to Lone Star.'],
    'wpH2.rev': ['Sum the quarter-end sales to Lone Star.', '32 + 34 + 30.', '96.0.'],
    'wpH2.acct': ['If you pay the customer to buy, and they send it back sealed, was there ever a contract?', 'ASC 606-10-25-1: commercial substance, collectability.', 'The "no contract" answer.'],
    'wpH3.addbacks': ['Which add-backs remove costs the business actually incurs every year — or add earnings that never happened?', 'Synergies not achieved, normal trade spend, "one-time" costs that happen every year.', 'Run-rate synergies, normalized trade spend, integration costs.'],
    'wpH3.adj': ['Start from reported Adjusted EBITDA, remove the bad add-backs.', '306.5 − 31.0 − 18.0 − 12.0.', '245.5.'],
    'wpH3.rule': ['The SEC has a C&DI about normal, recurring cash operating expenses.', 'Item 10(e) and C&DI 100.01.', 'The Item 10(e) answer.'],
    'wpH4.fv': ['Restated EBITDA times a real multiple.', '41.2 × 9.0.', '370.8.'],
    'wpH4.imp': ['Carrying amount minus fair value, capped at goodwill.', '486.0 − 370.8.', '115.2.'],
    'wpH4.rule': ['Since 2017 it’s one step. And January was a triggering event.', 'ASU 2017-04, interim test.', 'The one-step / triggering event answer.'],
    'wpH5.rel': ['How much was released into income?', 'Add the four quarterly releases.', '21.0.'],
    'wpH5.rule': ['Could Hearthstone record a liability for restructuring it hadn’t committed to?', 'ASC 805-20-25-2.', 'The "not a liability at the acquisition date" answer.'],
    'wpH5.qtrs': ['Take out each quarter’s release. Did they still hit the target?', 'Three quarters miss without the release. One doesn’t.', 'Q3 FY26, Q4 FY26, Q1 FY27.'],
    'wpH6.pv': ['Present value of an 8-year annuity of 6.0 at 8%.', '6.0 × (1 − 1.08^−8) ÷ 0.08.', '34.48.'],
    'wpH6.wire': ['Follow it to the last hop.', 'Who receives the money at the end?', 'The wire to the Asher Family Trust.'],
    'wpH6.value': ['Fix Adjusted EBITDA, multiply by 14, compare to the S-1.', '(306.5 − 197.6) × 14.', '1,524.6.'],
    'dlg.doyle': ['Catherine signs the S-1 too. Remind her what that means.', 'Section 11. Personal liability.', 'The Section 11 option.'],
    'dlg.olivia': ['She needs confidence, not bravado.', 'Every number ties to a document.', 'The first option.'],
    'dlg.victor': ['Victor responds to leverage, not insults.', 'His sentencing. Cooperation. No promises.', 'The sentencing option.'],
    'hearing.r1': ['"Independent customers." Whose customers?', 'The related-party map.', 'Present the related-party map.'],
    'hearing.r2': ['Arm’s-length doesn’t come back sealed.', 'The round-trip, or Rosa’s trailers.', 'Present the Lone Star round-trip.'],
    'hearing.r3': ['Industry standard isn’t the standard.', 'The Adjusted EBITDA bridge.', 'Present the Adjusted EBITDA bridge.'],
    'hearing.r4': ['Supported by a test run on numbers you restated.', 'Goodwill workpaper.', 'Present the Northfield goodwill impairment.'],
    'hearing.r5': ['Favorable outcomes that arrive exactly when a target’s at risk.', 'The reserve releases.', 'Present the acquisition reserve releases.'],
    'hearing.r6': ['"Never personally benefited." Martin has the wires.', 'Keystone wires, or Victor.', 'Present the Keystone wire records.'],
    'hearing.r7': ['Olivia needs one number.', 'Fee stripping & valuation.', 'Present fee stripping & valuation.'],
    'hearing.r8': ['End it. Clean.', 'Section 11.', 'The Section 11 option.'],
  };

  // ================================================================ chapters
  const CHAPTERS = [
    { title: 'Day 1 — Quiet Period', day: 'MON 9/13' },
    { title: 'Day 2 — Circular', day: 'TUE 9/14' },
    { title: 'Day 3 — Adjusted', day: 'WED 9/15' },
    { title: 'Night — Visiting Hours', day: 'WED 9/15' },
    { title: 'Day 4 — Pricing Eve', day: 'THU 9/16' },
    { title: 'Day 4 — The Pricing Call', day: 'THU 9/16' },
    { title: 'Epilogue', day: '' },
  ];
  function clock(s) {
    const f = s.flags, ch = s.chapter;
    let t = '9:00 AM';
    if (ch === 0) t = !f.met_olivia ? '8:30 AM' : !done('wpH1') ? '11:00 AM' : '5:40 PM';
    if (ch === 1) t = !done('wpH2') ? '9:20 AM' : '6:15 PM';
    if (ch === 2) t = !done('wpH3') ? '8:50 AM' : !done('wpH4') ? '1:30 PM' : '5:55 PM';
    if (ch === 3) t = s.map === 'mcc' ? '7:10 PM' : '10:04 PM';
    if (ch === 4) t = !done('wpH5') ? '7:30 AM' : '11:20 AM';
    if (ch === 5) t = '3:40 PM';
    return (CHAPTERS[ch] || CHAPTERS[0]).day + ' · ' + t;
  }
  function location(s) { return { tower: 'Hearthstone Brands — 51st Floor, Chicago', mcc: 'Metropolitan Correctional Center — Visiting', riverwalk: 'Chicago Riverwalk' }[s.map]; }

  const PC = { map: 'tower', x: 35, y: 15 };
  const VDR = { map: 'tower', x: 5, y: 15 };
  const at = id => { const p = def.npcPos(id, S()); return p ? { map: p.map, x: p.x, y: p.y } : null; };

  function objective(s) {
    const f = s.flags;
    switch (s.chapter) {
      case 0:
        if (!f.phone_found) return { text: 'Check in at *reception*.', target: at('avery') };
        if (!f.met_olivia) return { text: 'Meet *Olivia Grant* (Whitmore Lane) in your war room.', target: at('olivia') };
        if (!f.got_vdr) return { text: 'Pull customer, vendor and ownership data from the *virtual data room*.', target: VDR };
        return { text: 'Map related parties on the *war room computer*.', target: PC };
      case 1:
        if (!f.got_trailers) return { text: '*Rosa Delgado* is in town for integration meetings. Find her in the kitchen.', target: at('rosa') };
        if (!f.got_services) return { text: 'Ask *Catherine Doyle*, CFO, for the Lone Star services agreements.', target: at('doyle') };
        return { text: 'Trace the Lone Star quarter-end on the *war room computer*.', target: PC };
      case 2:
        if (!done('wpH3')) return { text: 'Test the S-1’s Adjusted EBITDA on the *war room computer*.', target: PC };
        if (!f.olivia_steady) return { text: '*Olivia* needs to talk. Now.', target: at('olivia') };
        return { text: 'Retest Northfield’s goodwill on the *war room computer*.', target: PC };
      case 3:
        if (s.map === 'mcc') return { text: f.victor_done ? '' : '*Victor Kessane* is waiting at a visiting table.', target: f.victor_done ? null : at('victor') };
        return { text: f.martin_met ? '' : 'Find *M* on the Riverwalk.', target: f.martin_met ? null : at('martin') };
      case 4:
        if (!done('wpH5')) return { text: 'Analyze the acquisition reserves on the *war room computer*.', target: PC };
        return { text: 'Follow the fees and value the company on the *war room computer*.', target: PC };
      case 5: return { text: 'The pricing committee meets in the *boardroom*.', target: at('olivia') };
      default: return { text: '', target: null };
    }
  }

  function npcPos(id, s) {
    const f = s.flags, ch = s.chapter;
    const p = (x, y, dir, extra = {}) => Object.assign({ map: 'tower', x, y, dir }, extra);
    const day = ch !== 3;
    switch (id) {
      case 'avery': return day ? p(22, 14, 'down') : null;
      case 'olivia': return ch === 5 ? p(12, 4, 'right') : day ? p(33, 17, 'right') : null;
      case 'lena': return ch === 5 ? p(13, 6, 'up') : ch === 4 ? p(37, 17, 'left') : null;
      case 'ellis': return ch === 5 ? p(14, 6, 'up') : null;
      case 'pryce': return ch === 5 ? p(15, 2, 'down') : day ? p(26, 2, 'down') : null;
      case 'doyle': return ch === 5 ? p(17, 2, 'down', { sweat: true }) : day ? p(33, 2, 'down', { sweat: ch >= 1 }) : null;
      case 'chu': return ch === 5 ? p(19, 2, 'down') : day ? p(42, 2, 'down') : null;
      case 'asher': return ch === 5 ? p(21, 4, 'left') : day ? p(5, 2, 'down') : null;
      case 'rosa': return ch === 1 ? p(42, 16, 'up') : ch === 5 ? p(24, 12, 'down') : null;
      case 'victor': return ch === 3 ? { map: 'mcc', x: 11, y: 4, dir: 'down' } : null;
      case 'ken': return ch === 3 ? { map: 'mcc', x: 20, y: 1, dir: 'down' } : null;
      case 'martin': return ch === 3 ? { map: 'riverwalk', x: 24, y: 10, dir: 'down' } : ch === 5 ? p(26, 12, 'down') : null;
    }
    return null;
  }

  // ================================================================ beats
  async function newGame() {
    await G.ui.card({
      day: 'EPISODE 5 · MONDAY, SEPTEMBER 13, 2027 · 8:30 AM',
      title: 'HEARTHSTONE',
      text: 'Meridian Retail Solutions. Polar Cold Storage. Lone Star’s side letter. Grupo Logístico Sierra.\n\nFour schemes, four companies. Three of them used the same Delaware registered agent. One name kept turning up.\n\nOn Thursday afternoon, Hearthstone Brands Holdings — Calder Ridge’s $4 billion roll-up of Northfield, Brightwell and four other food companies — prices its IPO on the New York Stock Exchange. Last week the lead underwriter received a one-line letter: *"Ask Hearthstone who its customers are."*\n\nThe underwriters’ counsel has hired Strand Forensic. You have four days.',
    });
    E().placePlayer('tower', 23, 20, 'up');
    await G.ui.reveal();
    await E().script(async () => {
      await narrate('Fifty-one floors above the Chicago River. Marble, glass, and a reception desk carved from a single block of something expensive. The quiet period has made everyone very quiet.');
      await narrate('Lena, by text: *"Underwriters sign the registration statement too. Section 11 makes them liable for it. Olivia Grant wants to know what she’s signing."*');
    });
  }

  async function beats() {
    const s = S(), f = s.flags;
    if (done('wpH1') && !f.asher_visit) { f.asher_visit = true; await asherVisit(); }
    if (s.chapter === 0 && done('wpH1') && f.asher_visit) await toCircular();
    if (s.chapter === 1 && done('wpH2')) await toAdjusted();
    if (s.chapter === 2 && done('wpH3') && !f.h3_followup) { f.h3_followup = true; await text('Olivia just got a call from Calder’s lawyers. She’s rattled. Go steady her before you do anything else.'); }
    if (s.chapter === 2 && done('wpH4')) await toVisiting();
    if (s.chapter === 4 && done('wpH5') && !f.h5_followup) { f.h5_followup = true; await text('Last one. Follow the fee. Then give Olivia the number.'); }
    if (s.chapter === 4 && done('wpH6')) await toPricing();
    if (s.chapter === 5 && f.hearing_done) await ending();
    K.refresh();
  }

  async function asherVisit() {
    const e = E();
    G.audio.door();
    e.spawnActor('asher', 35, 12, 'down');
    await e.walkActor('asher', [['down', 1]]);
    e.faceToward('you', 35, 13);
    await say('asher', '{first}. Welcome to Hearthstone. Fourth time’s the charm.');
    await say('asher', 'Northfield, Voltline, Monterrey. You’ve cost my funds a great deal of money this year. I want you to know I don’t take it personally. I take it professionally, which is worse.');
    const c = await choose('you', null, ['Then you know I’ll be thorough.', 'Who owns Keystone Registered Agents, Simon?', 'Good to see you too.']);
    if (c === 0) await say('asher', 'I’m counting on it. Thoroughness takes time. You have until Thursday.');
    else if (c === 1) { await narrate('He smiles with exactly half his face.'); await say('asher', 'A company in Wilmington with ten thousand clients. Ask them.'); }
    else await say('asher', 'Is it? I’m never sure.');
    await say('asher', 'A reminder: we’re in registration. The quiet period means nobody talks to the press. Not me. Not you.');
    await e.walkActor('asher', [['up', 1]]);
    e.removeActor('asher');
    await K.sleep(700);
    await text('He’s scared. He has never been scared before. It looks strange on him.');
    await text('Quarter-end. Lone Star. Rosa Delgado is in town tomorrow for integration meetings. She’s seen the trailers.');
    K.refresh();
  }

  async function toCircular() {
    await K.toChapter(1, { day: 'TUESDAY, SEPTEMBER 14, 2027 · 9:20 AM', title: 'Circular', text: 'The roadshow is in Boston today. Daniel Pryce tells a ballroom of fund managers that Hearthstone has "seventeen consecutive quarters of organic growth."\n\nThe order book is eleven times covered.' }, { map: 'tower', x: 35, y: 18, dir: 'up' });
  }
  async function toAdjusted() {
    await text('Lone Star again. Of course it’s Lone Star.');
    await K.sleep(700);
    await K.toChapter(2, { day: 'WEDNESDAY, SEPTEMBER 15, 2027 · 8:50 AM', title: 'Adjusted', text: 'The S-1 says Hearthstone earned $306.5 million of Adjusted EBITDA. It says "Adjusted" forty-one times.\n\nAt fourteen times that number, Calder Ridge walks away with four billion dollars.' }, { map: 'tower', x: 35, y: 18, dir: 'up' });
  }
  async function toVisiting() {
    await text('Two visits tonight. First: MCC Chicago, 7 PM. Victor Kessane asked to see you. His lawyer agreed.');
    await text('Then the Riverwalk, 10 PM, by the Wells Street bridge. I’ll be there. You’ll recognize me.');
    await K.sleep(700);
    await K.toChapter(3, { day: 'WEDNESDAY, SEPTEMBER 15, 2027 · 7:10 PM', title: 'Visiting Hours', text: 'The Metropolitan Correctional Center is a triangular concrete tower in the Loop, with windows five inches wide.\n\nVictor Kessane has been here since January, awaiting sentencing. He asked for you by name.' }, { map: 'mcc', x: 11, y: 11, dir: 'up' });
  }

  async function victorScene() {
    const e = E(), f = F();
    e.faceToward('victor', e.player.x, e.player.y);
    await say('victor', 'Well. {first} {last}. You look good. Prison doesn’t, I’m told.');
    await say('victor', 'I read about Northfield. And Voltline. Monterrey made the Journal. You’re working your way up a family tree, and you don’t even know whose it is yet.');
    await K.gate('you', null, [
      'You deserve to be in here, Victor.',
      'Your sentencing is in November. The U.S. Attorney will hear about real cooperation. I can’t promise anything.',
      'Simon says hi.',
    ], 1, 'dlg.victor', async c => {
      if (c === 0) await say('victor', 'Probably. Is that what you came to say? The guard’s very patient, but I’m not.');
      else { await narrate('Something cold crosses Victor’s face.'); await say('victor', 'Don’t joke about that man in here. Try again.'); }
    });
    await say('victor', 'No promises. Honest. Martin was honest too. Look where it got him. Look where it got me.');
    await say('victor', 'Meridian wasn’t my idea. Simon Asher sat in my office in 2024 and drew it on a napkin. A vendor nobody checks, invoices under the approval line, the accrual as a piggy bank. He called it "the gross-to-net trick." He said he’d done it at three companies.');
    await say('victor', 'He introduced Keystone Registered Agents. And every month, twenty percent of what Meridian received went to an LLC called KRA Holdings 9. Not mine. His.');
    await say('victor', 'My lawyer has the bank records. I’ll say all of it to the U.S. Attorney. Tell them.');
    await say('victor', 'And {first}? Whoever’s texting you this time. Tell Martin I’m sorry.');
    f.victor_done = true;
    K.addEvidence('ev_victor');
    G.save();
    await K.travel('riverwalk', 4, 6, 'right', { night: true });
    await narrate('10:04 PM. The river is black and gold. Tour boats are done for the night. Someone is sitting alone on a bench near the Wells Street bridge.');
    K.refresh();
  }

  async function martinScene() {
    const e = E(), f = F();
    e.faceToward('martin', e.player.x, e.player.y);
    await say('martin', 'Hello, {first}. We’ve never met. I used to sit at your desk.');
    await say('martin', 'Martin Oyelaran. Halvorsen, two years ago. I’m M.');
    const c = await choose('you', null, ['Victor says he’s sorry.', 'How did you end up inside Calder Ridge?', 'Martin. I’ve read your notes a hundred times.']);
    if (c === 0) await say('martin', 'Victor’s sorry he got caught. But… I’ll take it.');
    else if (c === 1) await say('martin', 'After Halvorsen, the only job I could get with an NDA hanging over me was fund accounting. Larch Fund Services. Turns out Larch administers every Calder fund. I’m the controller. I see every wire.');
    else await say('martin', '"Did not sign." I was proud of that line. Then I was unemployed. You finished what I started.');
    await say('martin', 'When Hearthstone filed, I read the funds-flow memo for Thursday. The monitoring agreement accelerates on the IPO. Thirty-four and a half million. It doesn’t go to the fund. It goes to Calder Ridge Management, then to KRA Holdings 14 — a Keystone SPV — then to a trust in the Cayman Islands. The Asher Family Trust.');
    await say('martin', 'It’s been happening for years. Every fee, every "consulting" payment. The LPs — pension funds, teachers, firefighters — never see it.');
    await narrate('He hands you a thumb drive. His hand is steady.');
    await say('martin', 'My lawyer filed it with the SEC this afternoon under Rule 21F. You’re getting a copy through underwriters’ counsel, properly. It’ll be in your inbox in the morning.');
    K.addEvidence('ev_martin');
    await narrate('Two men in dark coats have stopped at the railing forty yards away, looking at nothing.');
    await say('martin', 'They’ve been there since I sat down. Calder hires a lot of "security." Walk with me toward the bridge. Lots of cameras on the bridge.');
    E().shakeScreen(2);
    await say('martin', 'Thursday, {first}. Don’t let them price it.');
    f.martin_met = true;
    G.save();
    await toPricingEve();
  }

  async function toPricingEve() {
    await K.toChapter(4, { day: 'THURSDAY, SEPTEMBER 16, 2027 · 7:30 AM', title: 'Pricing Eve', text: 'Martin’s files arrive at 6:12 AM through Pell & Marsh, with a chain-of-custody letter.\n\nThe order book closes at 2:00 PM. The pricing committee meets at 3:40. Trading opens tomorrow at 9:30 under the ticker HRTH.\n\nLena brings coffee. Neither of you mentions sleep.' }, { map: 'tower', x: 35, y: 18, dir: 'up' });
  }
  async function toPricing() {
    await text('Olivia moved the pricing committee into the boardroom and asked Simon to attend. Rosa’s here. I’m in the lobby. This is it.');
    await K.sleep(700);
    await K.toChapter(5, { day: 'THURSDAY, SEPTEMBER 16, 2027 · 3:40 PM', title: 'The Pricing Call', text: 'Whitmore Lane’s syndicate desk is on an open line, waiting to print the deal at $24 a share.\n\nAround the boardroom table: the underwriters, their counsel, Hearthstone’s management, Calder Ridge, and Simon Asher, who has asked to speak last.\n\nHe won’t get to.' }, { map: 'tower', x: 16, y: 10, dir: 'up' });
  }

  async function hearing() {
    const f = F();
    if (!f.olivia_intro) {
      f.olivia_intro = true;
      await say('olivia', 'Thank you all. Before Whitmore Lane signs anything, our forensic team has findings. {first}, go.');
      await say('asher', 'By all means. We have twenty minutes before the syndicate desk prints.');
      await narrate('Rebut each claim by presenting the exhibit that contradicts it. Wrong exhibits cost credibility with the underwriters.');
    } else await say('olivia', 'Again, {first}. The desk is holding.');
    const r = await G.hearing.start(HEARING);
    if (r === 'win') { f.hearing_done = true; G.save(); await ending(); }
    else { await text('Breathe. Olivia called a five-minute hold. Press when you’re unsure. You know every one of these numbers.'); K.refresh(); }
  }

  async function ending() {
    await K.ending({
      headline: '$1.52B', headlineLabel: 'IPO overvaluation stopped',
      title: 'Hearthstone',
      epilogue: [
        'At 4:02 PM, Whitmore Lane withdrew as lead underwriter. By 4:30 the rest of the syndicate had followed. Hearthstone Brands Holdings postponed its IPO "due to market conditions." It never priced.',
        'The SEC’s Division of Enforcement opened a formal investigation the next morning, armed with Martin Oyelaran’s Rule 21F submission. In February, Simon Asher was arrested at O’Hare boarding a flight to Grand Cayman. He was charged with investment adviser fraud, wire fraud, and conspiracy, including counts tied to Meridian Retail Solutions.',
        'Calder Ridge Partners’ limited partners voted to remove the general partner. A court-appointed monitor wound down the funds. The pension plans recovered most of what they’d lost. Raymond Chu cooperated. Catherine Doyle settled.',
        'Victor Kessane’s sentence was reduced for substantial assistance. He wrote Martin a letter. Martin hasn’t opened it yet.',
        'Northfield, Voltline, Brightwell and Botanas del Norte were sold to new owners. All four plants are still running. Rosa still runs inventory control in Ashby. Mari’s kolache truck has a second location. Lucía Ferrer testified in two countries. Priya Raman sent you a burner phone for your birthday, as a joke. You keep it in your desk drawer.',
        'Martin Oyelaran received the largest SEC whistleblower award of the year. He used part of it to start a nonprofit that pays legal fees for accountants who refuse to sign.',
        'Lena Strand changed the sign on the door. It now reads STRAND & ' + G.state.lastName.toUpperCase() + ' FORENSIC ADVISORY.',
        'Five cases. Five whistleblowers. One trail of money that never quite added up — until you footed it.',
      ],
    });
  }

  // ================================================================ hearing
  const HEARING = {
    title: 'Pricing Committee — Hearthstone Brands IPO',
    place: 'BOARDROOM, 51ST FLOOR · THU 9/16 3:44 PM · DESK HOLDING',
    objection: 'DOESN’T FOOT!',
    credLabel: 'Credibility with the underwriters',
    reaction: 'Olivia Grant mutes the syndicate line.',
    rounds: [
      { who: 'pryce', key: 'r1', evidence: ['ev_rp'], claim: 'Our customers are independent retailers and distributors. Seventeen straight quarters of organic growth. That’s the Hearthstone story.', press: 'Our top customers are household names in their regions.', wrong: 'Pryce: "I don’t see what that has to do with our customers."',
        after: [['you', 'Your largest customer is Lone Star Beverage, controlled by Calder Ridge Fund IV. Your fourth largest is Summit Club Stores — Fund IV owns 38% and has a board seat. Same general partner as Hearthstone’s owner. That’s $312 million, seventeen percent of revenue, from related parties.'], ['you', 'The S-1 says there are no transactions with affiliates other than the monitoring agreement.'], ['ellis', 'That’s a disclosure problem in the registration statement. Section 11.']] },
      { who: 'doyle', key: 'r2', evidence: ['ev_round', 'ev_trailers'], claim: 'Lone Star’s purchases are arm’s-length, on standard terms, and paid in full.', press: 'They paid us $96 million in the first week of July. Cash.', wrong: 'Doyle: "That doesn’t speak to Lone Star."',
        after: [['you', 'With $88 million Hearthstone paid them for "logistics and merchandising services" between June 30th and July 2nd. No statements of work. No deliverables.'], ['you', 'Sixty trailers went to Lone Star at quarter-end. Forty-one came back in July as "rework." Thirty-three of them still had the seals on.'], ['rosa', 'I broke the seals myself. Same pizzas. Same lot codes.']] },
      { who: 'asher', key: 'r3', evidence: ['ev_ebitda'], claim: 'Our Adjusted EBITDA presentation is industry standard. Every sponsor-backed S-1 includes these add-backs. Investors understand them.', press: 'Synergies are real. Integration costs are real. We simply present them transparently.', wrong: 'Asher: "That isn’t responsive."',
        after: [['you', 'Thirty-one million of "run-rate synergies" that haven’t happened. Eighteen million of your own trade spend, "normalized" away. Twelve million of "one-time" integration costs you’ve incurred every single year for three years.'], ['you', 'Item 10(e) doesn’t let you exclude normal, recurring cash operating expenses or add earnings that don’t exist. Adjusted EBITDA is $245.5 million, not $306.5.']] },
      { who: 'doyle', key: 'r4', evidence: ['ev_goodwill'], claim: 'Northfield’s goodwill is fully supported by our annual impairment test. Our auditors agreed.', press: 'October test, eleven times EBITDA, comfortable headroom.', wrong: 'Doyle: "That isn’t our impairment test."',
        after: [['you', 'Your October test used Northfield’s EBITDA before the restatement. I know, because I restated it. Restated EBITDA is $41.2 million. At the peer multiple of nine times, fair value is $370.8 million against a carrying amount of $486.'], ['you', 'The January covenant default was a triggering event. There should have been a $115.2 million impairment in the first quarter.'], ['doyle', '…Simon said the test was "current enough."']] },
      { who: 'chu', key: 'r5', evidence: ['ev_reserves'], claim: 'The reserve releases reflect favorable outcomes on integration. Our estimates simply proved conservative.', press: 'Conservatism is a virtue in accounting, I’m told.', wrong: 'Chu: "I fail to see the relevance."',
        after: [['you', 'Those reserves were for restructuring Hearthstone wasn’t obligated to do. Under ASC 805 they were never liabilities at the acquisition dates. You put them into goodwill, and then released twenty-one million into income.'], ['you', 'And each release landed in a quarter you would otherwise have missed: Q3, Q4 and Q1. Favorable outcomes don’t usually arrive on schedule.']] },
      { who: 'asher', key: 'r6', evidence: ['ev_martin', 'ev_victor'], claim: 'The monitoring fee is disclosed and entirely customary. And I have never personally benefited from any Hearthstone transaction. Not one dollar.', press: 'I’m a fiduciary. My interests are perfectly aligned with our investors.', wrong: 'Asher: "I’m afraid I don’t follow."',
        after: [['you', 'Tomorrow’s funds flow pays $34.48 million to Calder Ridge Management, which forwards it to KRA Holdings 14 LLC, a Keystone shell, which forwards it to the Asher Family Trust in the Cayman Islands. Your fund administrator’s controller filed it with the SEC yesterday.'], ['you', 'And KRA Holdings 9 took twenty percent of everything Meridian Retail Solutions stole from Halvorsen. Victor Kessane will testify that you drew it on a napkin.'], ['asher', '…Martin.'], ['you', 'Martin.']] },
      { who: 'olivia', key: 'r7', evidence: ['ev_fees'], claim: '{last}, the desk wants to price at fourteen times Adjusted EBITDA. What is this company actually worth compared to the S-1?', press: 'One number. I have to say it out loud to the syndicate.', wrong: 'Olivia: "That isn’t a valuation."',
        after: [['you', 'Take the $245.5 million, remove $26.9 million of gross profit from the Lone Star round-trip and $21 million of reserve releases. Corrected Adjusted EBITDA is $197.6 million.'], ['you', 'At fourteen times, the S-1 overstates Hearthstone’s enterprise value by one-point-five-two billion dollars.'], ['olivia', 'Thank you.'], ['olivia', 'Desk, this is Olivia. Whitmore Lane is not pricing. We’re withdrawing.']] },
    ],
    async lose() {
      await say('olivia', 'I’m putting the desk on hold. {first}, I need exhibits that match the claims. Take five minutes.');
      await say('asher', 'Take ten. We’ll wait. We’re very patient.');
    },
    async finale() {
      await narrate('The syndicate line goes silent. Daniel Pryce stares at the table. Catherine Doyle quietly asks Jonathan Ellis for the name of a good lawyer. Raymond Chu is already on his phone.');
      await narrate('Simon Asher stands, straightens his cuffs, and looks at you for a long moment.');
      await K.gate('asher', 'You could have had a partnership, {first}. Instead, you’ll have a story. Stories don’t pay very well.', [
        'Is that an offer?',
        'I’ll think about it.',
        'Section 11 makes everyone who signs a materially false registration statement liable. Nobody’s signing. And the SEC already has the Keystone wires.',
      ], 2, 'hearing.r8', async c => {
        if (c === 0) await say('asher', 'It was. For about four years. Try again.');
        else await say('lena', '{first}. No.');
      });
      await say('asher', 'Then I suppose we’re done.');
      await narrate('He walks out. Nobody stops him. Nobody needs to. In the lobby, a man in a corduroy jacket watches him go, then looks up at the boardroom glass and raises a coffee cup.');
    },
  };

  // ================================================================ talk
  const TALK = {
    async avery(ch, f) {
      if (!f.phone_found) {
        await say('avery', 'Good morning — you must be with the underwriters’ forensic team. Here’s your badge. Your war room is on the east side.');
        await say('avery', 'Oh — and a courier left this for you at seven. Hand-delivered, addressed to you by name. That’s unusual.');
        await narrate('A padded envelope. Inside: a prepaid phone and a card in neat handwriting. *"I owe you one. Ask Hearthstone who its customers are. — M"*');
        f.phone_found = true;
        K.addEvidence('ev_courier');
        G.ui.updateHud();
        await K.sleep(600);
        await text('Hello, {first}. You don’t know me. I know you. I read your work at Halvorsen.'.replace('{first}', S().firstName));
        await text('I can’t tell you who I am yet. I can tell you where to look. Start with who buys from Hearthstone. Then ask who owns them.');
        await text('If you get stuck, I’ll help. If you get very stuck, I’ll stop being careful.');
        await narrate(G.touch ? '(Tap *Phone* at the top of the screen to read messages, and *Case File* to review your evidence.)' : '(Press *P* to read the phone. Press *J* to open your case file.)');
        return;
      }
      await say('avery', ['Coffee is in the kitchen. It’s very good. Everything here is very good.', 'Mr. Asher asked me which room you’re in. I said I wasn’t sure.', 'Big day Thursday!'][ch % 3]);
    },
    async olivia(ch, f) {
      if (ch === 0 && !f.met_olivia) {
        if (!f.phone_found) return say('olivia', 'Badge first — Avery at reception.');
        await say('olivia', 'Olivia Grant. I run equity capital markets at Whitmore Lane. We’re lead left on Hearthstone, which means my name is on the cover and my firm is liable for what’s inside.');
        await say('olivia', 'Somebody sent me a letter. Seven words. Our counsel thinks it’s a crank. I think a crank would use more words.');
        await say('olivia', 'You have data room access. Pricing is Thursday at 3:40. Tell me if there’s anything I shouldn’t sign.');
        f.met_olivia = true; return;
      }
      if (ch === 2 && done('wpH3') && !f.olivia_steady) {
        await say('olivia', 'Calder’s general counsel just called our general counsel. They’re threatening to sue Whitmore Lane and Strand for "tortious interference" if this deal slips.');
        await say('olivia', 'I’ve priced two hundred IPOs. I’ve never had a sponsor threaten me. Tell me honestly: are you sure?');
        await K.gate('you', null, [
          'Every number ties to a source document in the data room or a record obtained through counsel. I’ll walk Pell & Marsh through all of it tonight, line by line.',
          'Trust me.',
          'If you’re scared, pull the deal now and we’ll sort it out later.',
        ], 0, 'dlg.olivia', async c => {
          if (c === 1) await say('olivia', 'I don’t trust anyone this week. Give me something better.');
          else await say('olivia', 'Pulling a $4 billion deal without a basis is how I get fired. I need a basis.');
        });
        await say('olivia', '…Okay. Line by line, tonight. Then I’ll tell Calder’s lawyers to put it in writing.');
        f.olivia_steady = true; G.save(); return;
      }
      if (ch === 5) return say('olivia', 'Ready when you are.');
      await say('olivia', ['Talk to me.', 'The order book is eleven times covered. That’s not reassuring. That’s a lot of people to disappoint.', 'Lena says you don’t sleep during engagements. Please sleep.'][ch % 3]);
    },
    async doyle(ch, f) {
      if (ch === 1 && f.got_trailers && !f.got_services) {
        await say('doyle', 'If you’re here about Lone Star, the contracts are in the data room.');
        await narrate('They’re not. You checked. The "services agreements" folder is empty.');
        await K.gate('you', null, [
          'Simon will protect you, Catherine.',
          'You’re going to jail.',
          'You sign the S-1 too, Catherine. Section 11 doesn’t care who designed it — only who signed it. I need the Lone Star services agreements.',
        ], 2, 'dlg.doyle', async c => {
          if (c === 0) await say('doyle', 'That’s what he says. He says it a lot lately.');
          else await say('doyle', 'Get out of my office.');
        });
        await narrate('She’s quiet for a long time. Then she opens a drawer and hands you a folder that was never uploaded.');
        await say('doyle', 'Three "services agreements" with Lone Star. One page each. No scope. Simon signed them on June 29th. I booked them as prepaid logistics.');
        f.got_services = true; K.obtain('Lone Star "services agreements" (from C. Doyle)'); return;
      }
      if (ch === 0) return say('doyle', 'Catherine Doyle, CFO. The data room has everything. If it isn’t in the data room, it doesn’t exist.');
      await say('doyle', ch === 5 ? '…' : 'I have a roadshow call in five minutes.');
    },
    async pryce(ch, f) {
      await say('pryce', ch === 0 ? 'Daniel Pryce, CEO. Welcome! Hearthstone is a platform for great American food brands. Has anyone shown you the brand video?' : 'Seventeen quarters. Organic. Remember that number.');
    },
    async chu(ch, f) {
      await say('chu', ch === 0 ? 'Raymond Chu, Calder Ridge. I’m the fund’s CFO, not Hearthstone’s. I’m only here to support the transaction.' : 'I have nothing to add.');
    },
    async asher(ch, f) {
      await say('asher', ch === 5 ? 'Good afternoon.' : ['Busy, {first}?', 'You look tired. Tired people make mistakes.', 'Thursday.'][ch % 3]);
    },
    async rosa(ch, f) {
      if (ch === 1 && !f.got_trailers) {
        await say('rosa', '{first}! Look at you. Downtown. Fancy.');
        await say('rosa', 'I’m here for "integration meetings." Mostly they show me slides. But I brought you something. I keep logs. You know I keep logs.');
        await say('rosa', 'June 28 to 30, Northfield shipped sixty trailers to Lone Star Beverage in Fort Worth. Pizza, to a beverage distributor. Then July 6 to 9, forty-one trailers came back to our Green Bay 3PL as "Lone Star — rework inventory transfer."');
        await say('rosa', 'Thirty-three came back with the original seals. I broke them myself. Same pizzas. Same lot codes. Nobody reworked anything.');
        f.got_trailers = true; K.addEvidence('ev_trailers'); return;
      }
      await say('rosa', ch === 5 ? 'Walt says go get ’em. He made me promise to say it exactly like that.' : 'Count it yourself.');
    },
    async victor(ch, f) { if (!f.victor_done) return victorScene(); await say('victor', 'Go.'); },
    async ken(ch, f) { await say('ken', 'Forty minutes. Hands on the table. No passing anything.'); },
    async martin(ch, f) {
      if (ch === 3 && !f.martin_met) return martinScene();
      await say('martin', 'I’m just here to watch. Two years I’ve wanted to watch this.');
    },
    async lena(ch, f) { await say('lena', ch === 5 ? 'Seven claims. You know all seven answers. Go.' : 'The acquisition reserves first. Then the fee. Then we walk Olivia through the valuation.'); },
    async ellis(ch, f) { await say('ellis', 'Jonathan Ellis, Pell & Marsh. My job is to keep the underwriters out of court. Please make my job easier.'); },
  };

  // ================================================================ objects
  const FLAVOR = {
    a_desk: 'A desk with nothing on it except a fountain pen and a single sheet of paper: tomorrow’s funds-flow memo, face down.',
    a_pc: 'Locked. A biometric reader blinks red.',
    a_shelf: 'First editions. A framed tombstone for every Calder Ridge deal since 2009.',
    a_art: 'A large abstract painting. The brass plate says it was "acquired at auction, 2024." The year Meridian was created.',
    a_couch: 'White leather. Nobody has ever sat on it.',
    a_bar: 'A bar cart with a forty-year-old Scotch.',
    b_table: 'A walnut table long enough to land a plane on. Printed S-1s at every seat.',
    b_screen: 'A slide titled "HRTH — PRICING RANGE $22–$24."',
    p_desk: 'Roadshow notes: "Say ‘organic’ at least twice per meeting."',
    p_pc: 'The brand video, paused on a slow-motion pizza.',
    d_desk: 'A sticky note in Catherine’s handwriting: "Ask S. re: Lone Star SOWs??"',
    d_pc: 'Locked.',
    d_files: 'Quarterly close binders. Q2 FY27 has three tabs labeled "LS."',
    c_desk: 'A Calder Ridge fund performance report. Net IRR 31%. Footnote 14 is about fees.',
    c_pc: 'Locked.',
    c_files: 'Limited partnership agreements for Fund III and Fund IV.',
    c_shelf: 'Books on private equity. One is titled "Barbarians at the Gate." It has been read many times.',
    calder_sign: 'CALDER RIDGE PARTNERS.',
    cooler: 'Sparkling water with cucumber slices. Of course.',
    servers: 'The data room’s servers. Every document Hearthstone chose to share.',
    dr_files: 'Printed data room indices. "Related parties" is a folder with one document in it.',
    reception: 'A reception desk carved from one block of white marble, with a bowl of Northfield-branded mints.',
    lobby_couch: 'Lobby furniture that costs more than your car.',
    war_desk: 'Your war room desk: printouts, highlighters, four days of coffee.',
    war_shelf: 'S-1 drafts, numbered one through nine.',
    war_board: 'Your whiteboard: CUSTOMERS? → LONE STAR → ADJ. EBITDA → GOODWILL → RESERVES → FEES.',
    counter: 'An espresso bar. A barista comes in at ten.',
    coffee: 'A machine with more buttons than the syndicate desk.',
    fridge: 'Sparkling water and Voltline. You grimace.',
    k_table: 'A kitchen table with a view of Lake Michigan.',
    v_table: 'A steel table bolted to the floor.',
    co_desk: 'The officer’s desk. A visitor log.',
    co_pc: 'Visitor management system.',
    vending: 'Vending machine. Visitors only.',
    visit_sign: 'VISITING ROOM.',
    rules: 'Visiting rules: no physical contact beyond a brief embrace; no items passed; 40 minutes.',
    railing: 'The river below, black and gold.',
    bench: 'A bench on the Riverwalk.',
    rw_sign: 'CHICAGO RIVERWALK.',
  };

  async function use(id, ch, f) {
    if (id === 'war_pc') { await usePC(); return true; }
    if (id === 'vdr') {
      if (ch === 0 && f.met_olivia && !f.got_vdr) {
        await narrate('The virtual data room: 14,000 documents. You pull the customer and vendor lists, the capitalization table, and the organizational chart for every Calder Ridge fund.');
        await narrate('The "Related Parties" folder contains one document: the monitoring agreement.');
        f.got_vdr = true; K.obtain('Customer/vendor lists, cap table & Calder org chart (VDR)'); return true;
      }
      await narrate('The virtual data room. Every document Hearthstone decided you should see.');
      return true;
    }
    return false;
  }

  async function usePC() {
    const f = F(), ch = S().chapter;
    if (ch === 0) { if (!f.got_vdr) return narrate('Pull the data room materials first.'); return K.runPuzzle('wpH1'); }
    if (ch === 1) { if (!f.got_trailers || !f.got_services) return narrate('You need Rosa’s trailer log and the Lone Star services agreements.'); return K.runPuzzle('wpH2'); }
    if (ch === 2) { if (!done('wpH3')) return K.runPuzzle('wpH3'); if (!f.olivia_steady) return narrate('Olivia needs you first.'); return K.runPuzzle('wpH4'); }
    if (ch === 4) { if (!done('wpH5')) return K.runPuzzle('wpH5'); return K.runPuzzle('wpH6'); }
    return narrate('Everything is in the case file.');
  }

  function onStep(x, y, s) {
    const f = s.flags;
    if (s.map === 'tower' && s.chapter === 5 && !f.hearing_done && !f.olivia_intro && x >= 11 && x <= 22 && y <= 8) E().script(hearing);
  }

  function nightLights(mapName) { return []; }

  // ================================================================ workpapers
  const defs = {};
  const PARTIES = [
    ['Lone Star Beverage Distributors', 'Customer', '212.0', 'Calder Ridge Fund IV, 100% (Fund IV and Fund III share Calder Ridge GP LLC)', true],
    ['Prairie Grocers Cooperative', 'Customer', '188.0', 'Member-owned cooperative', false, 'An independent cooperative. No common ownership or control.'],
    ['Harbor Foods', 'Customer', '164.0', 'Publicly traded, widely held', false, 'Widely held public company. No relationship.'],
    ['Summit Club Stores', 'Customer', '100.0', 'Calder Ridge Fund IV, 38% + one board seat', true],
    ['Keystone Logistics LLC', 'Vendor', '9.4', 'Asher Family Trust (Cayman), 100%', true],
    ['Larch Fund Services', 'Vendor', '1.1', 'Independent fund administrator', false, 'Larch administers Calder’s funds but has no ownership link. A service provider isn’t a related party by itself.'],
    ['Great Lakes Commercial Bank', 'Lender', '—', 'Publicly traded bank', false, 'A lender, not a related party.'],
    ['Calder Ridge Management LLC', 'Vendor (monitoring fees)', '6.0', 'Affiliate of Calder Ridge GP', true],
  ];
  defs.wpH1 = {
    ref: 'WP H-1 · RELATED PARTIES (ASC 850 / REG S-K ITEM 404)',
    title: 'Who Are Hearthstone’s Customers?',
    intro: 'Same sponsor, different fund. Calder Ridge counts on you thinking those are strangers.',
    header() {
      return '<div class="wp-meta"><span>Source: <b>VDR customer/vendor lists, cap table, Calder Ridge org chart</b></span><span>LTM 6/30/2027 revenue: <b>$1,840.0M</b></span><span>Hearthstone is 100% owned by Calder Ridge Fund III LP; general partner: Calder Ridge GP LLC (S. Asher, managing member)</span></div>' +
        '<div class="wp-note">S-1, "Certain Relationships and Related Party Transactions": "Other than the Monitoring Agreement with Calder Ridge Management LLC, we have no transactions with affiliates."</div>';
    },
    steps: [
      multiPick('rp', 'Select every counterparty that is a related party of Hearthstone.', [
        { t: 'Counterparty' }, { t: 'Relationship' }, { t: 'LTM $M', num: 1 }, { t: 'Ownership', wrap: 1 },
      ], PARTIES.map(r => ({ ok: r[4], why: r[5], cells: [r[0], r[1], r[2], r[3]] })), { okMsg: 'Lone Star and Summit (common control / significant influence through the same GP), Keystone Logistics (controlled by the chairman’s family trust), and Calder Ridge Management. Only one of the four is disclosed.' }),
      num('pct', 'What percentage of LTM revenue comes from related-party customers?', {
        answerText: '17.0%', placeholder: '%', suffix: '%',
        check(v) { if (Math.abs(v - 16.96) <= 0.06 || Math.abs(v - 0.1696) <= 0.0006) return true; if (Math.abs(v - 11.5) <= 0.1) return 'Summit Club counts too.'; return 'Doesn’t tie. Related-party customer revenue ÷ $1,840M.'; },
      }, { okMsg: '$312M ÷ $1,840M = <b>17.0%</b> of revenue from customers controlled or influenced by Hearthstone’s own sponsor.' }),
      mc('disc', 'What does the S-1 need to say about this?', [
        { t: 'Nothing — Lone Star and Summit are owned by a different fund, so they’re unrelated.', ok: false, why: 'Funds under a common general partner are under common control. That’s the point of the definition in ASC 850-10-20.' },
        { t: 'ASC 850 requires disclosure of material related-party transactions (nature of the relationship, amounts, balances), and Reg S-K Item 404 requires related-person transactions over $120,000 in the registration statement. Common control by the same sponsor GP — and the chairman’s family trust — make these related.', ok: true, why: 'Investors buying an IPO are entitled to know that 17% of revenue comes from customers the seller controls.' },
        { t: 'Only the dollar amounts above 10% of revenue, as major customers.', ok: false, why: 'Major-customer disclosure (ASC 280) is separate. Related-party disclosure has no 10% floor.' },
        { t: 'Disclose only after the IPO, in the first 10-Q.', ok: false, why: 'Section 11 liability attaches to the registration statement at effectiveness. Too late after.' },
      ]),
    ],
    conclusion: 'Seventeen percent of Hearthstone’s revenue comes from customers its own sponsor controls. The S-1 says there are none.',
  };

  const LEGS = [
    ['06/28', 'Sale', 'INV H-7781 — Northfield product to Lone Star (20 trailers)', '32.0', true],
    ['06/29', 'Sale', 'INV H-7790 — Northfield product to Lone Star (21 trailers)', '34.0', true],
    ['06/30', 'Sale', 'INV H-7802 — Northfield product to Lone Star (19 trailers)', '30.0', true],
    ['06/30', 'Payment out', '"Logistics services — Q3 prepay" to Lone Star (1-page agreement, signed S. Asher 6/29)', '30.0', true],
    ['07/01', 'Payment out', '"Merchandising services" to Lone Star (1-page agreement, no scope)', '31.5', true],
    ['07/02', 'Payment out', '"Logistics services" to Lone Star (1-page agreement, no scope)', '26.5', true],
    ['06/27', 'Sale', 'INV H-7770 — Brightwell pretzels to Prairie Grocers', '8.4', false, 'Prairie Grocers is an independent co-op that paid on normal terms.'],
    ['07/01', 'Payment out', 'Freight — Midwest Reefer Lines (per BOL, rate card)', '1.2', false, 'Real freight with bills of lading at contracted rates.'],
  ];
  defs.wpH2 = {
    ref: 'WP H-2 · ROUND-TRIP TRANSACTIONS (ASC 606-10-25-1)',
    title: 'Lone Star — Quarter-End, June 2027',
    intro: 'Hearthstone sold Lone Star $96 million of pizza. Then paid Lone Star $88 million to do nothing. Then the pizza came home.',
    header() {
      return '<div class="wp-meta"><span>Sources: <b>Sales register, treasury wires (VDR); Lone Star services agreements (C. Doyle); trailer log (R. Delgado)</b></span><span>$ in millions</span></div>' +
        '<div class="wp-note">Lone Star paid Hearthstone $32.0M on 7/2, $34.0M on 7/3, $30.0M on 7/6. Forty-one of sixty trailers returned 7/6–7/9 to Northfield’s Green Bay 3PL, recorded as "rework inventory transfer" (not sales returns); 33 with original seals intact. Northfield gross margin: 28%.</div>';
    },
    steps: [
      multiPick('legs', 'Select every transaction that is part of the Lone Star round trip (both legs).', [
        { t: 'Date' }, { t: 'Type' }, { t: 'Description', wrap: 1 }, { t: '$M', num: 1 },
      ], LEGS.map(r => ({ ok: r[4], why: r[5], cells: [r[0], r[1], r[2], r[3]] })), { okMsg: 'Three quarter-end sales and three "services" payments that funded them. Hearthstone paid Lone Star $88M so Lone Star could pay Hearthstone $96M for product it sent back.' }),
      num('rev', 'How much Q2 FY27 revenue must be reversed? ($M)', {
        answerText: '96.0', placeholder: '$M', suffix: '$M',
        check(v) { v = M(v); if (Math.abs(v - 96) <= 0.05) return true; if (Math.abs(v - 8) <= 0.05) return 'Netting the legs understates the problem: the revenue never existed at all.'; if (Math.abs(v - 65.6) <= 0.05) return 'All sixty trailers were part of the arrangement, not just the forty-one that came back.'; return 'Doesn’t tie. Sum the three quarter-end sales to Lone Star.'; },
      }, { okMsg: '<b>$96.0M</b>. At a 28% margin that’s $26.9M of gross profit that never happened.' }),
      mc('acct', 'Why does the revenue fail?', [
        { t: 'It doesn’t; Lone Star paid in full. The services payments are SG&A.', ok: false, why: 'The "payment in full" was Hearthstone’s own cash returning. And there were no services to expense.' },
        { t: 'No contract exists under ASC 606-10-25-1: the arrangement lacks commercial substance and the customer’s ability to pay depended on Hearthstone’s own payments. The product came back. Reverse the revenue and restore the inventory.', ok: true, why: 'A contract needs commercial substance and probable collection of consideration the customer is actually obligated to pay. A circle of cash and pizza has neither.' },
        { t: 'Recognize the revenue but record a returns reserve for 41 trailers.', ok: false, why: 'A returns reserve assumes a real sale with some returns. This was a staged sale.' },
        { t: 'Net the services payments against revenue and recognize $8.0M.', ok: false, why: 'Netting makes a fake sale look like a small real one.' },
      ]),
    ],
    conclusion: '$96M of quarter-end revenue was a round trip with a Calder-controlled distributor. It reverses entirely.',
  };

  const ADDBACKS = [
    ['Sponsor monitoring fees (terminate at IPO)', '9.0', false, 'Monitoring fees that end at the IPO are a common, disclosed adjustment.'],
    ['Non-cash stock-based compensation', '6.0', false, 'A common, accepted non-cash adjustment when clearly labeled.'],
    ['Run-rate synergies not yet realized', '31.0', true],
    ['"Normalized" trade promotion spend ("investment in growth")', '18.0', true],
    ['Acquisition integration costs ("one-time") — FY25 $11.2M, FY26 $12.8M, LTM $12.0M', '12.0', true],
    ['Botanas del Norte customs matter (ASC 450 accrual)', '7.5', false, 'An unusual regulatory accrual, adjustable if clearly described. (It’s also disclosed.)'],
    ['Restructuring — closure of the Toledo bakery', '4.0', false, 'A genuine, discrete restructuring.'],
  ];
  defs.wpH3 = {
    ref: 'WP H-3 · NON-GAAP MEASURES (REG G / S-K ITEM 10(e))',
    title: 'S-1 Adjusted EBITDA Reconciliation — LTM 6/30/2027',
    intro: 'They say "Adjusted" forty-one times. Find out what they adjusted away.',
    header() {
      return '<div class="wp-meta"><span>Source: <b>S-1 Amendment No. 3, "Non-GAAP Financial Measures"</b></span><span>$ in millions</span></div>' +
        '<div class="tbl-wrap"><table class="ledger"><tr><th></th><th class="num">LTM</th></tr><tr><td>Net income</td><td class="num">41.0</td></tr><tr><td>+ Interest, taxes, D&A</td><td class="num">178.0</td></tr><tr class="total"><td>EBITDA</td><td class="num">219.0</td></tr><tr><td>+ Adjustments (below)</td><td class="num">87.5</td></tr><tr class="total"><td>Adjusted EBITDA (S-1)</td><td class="num">306.5</td></tr></table></div>';
    },
    steps: [
      multiPick('addbacks', 'Select every adjustment that is improper under Item 10(e) and SEC staff guidance.', [
        { t: 'Adjustment', wrap: 1 }, { t: '$M', num: 1 },
      ], ADDBACKS.map(r => ({ ok: r[2], why: r[3], cells: [r[0], r[1]] })), { okMsg: 'Synergies that haven’t happened aren’t earnings. Trade spend is how a food company sells food. And "one-time" costs that recur every year at a serial acquirer are normal operating expenses.' }),
      num('adj', 'Corrected Adjusted EBITDA? ($M)', {
        answerText: '245.5', placeholder: '$M', suffix: '$M',
        check(v) { v = M(v); if (Math.abs(v - 245.5) <= 0.05) return true; if (Math.abs(v - 219) <= 0.05) return 'Some adjustments are legitimate. Only remove the improper ones.'; return 'Doesn’t tie. 306.5 minus the improper adjustments.'; },
      }, { okMsg: '$306.5M − $61.0M = <b>$245.5M</b>.' }),
      mc('rule', 'Which SEC principle do the improper adjustments violate?', [
        { t: 'Non-GAAP measures are prohibited in registration statements.', ok: false, why: 'They’re permitted with a reconciliation and equal prominence for GAAP.' },
        { t: 'Item 10(e) of Reg S-K and the staff’s C&DIs (100.01, 100.04): a non-GAAP measure can be misleading if it excludes normal, recurring cash operating expenses or uses individually tailored recognition. Unrealized "run-rate" synergies aren’t results.', ok: true, why: 'The staff has repeatedly objected to adding back normal operating costs and to presenting hypothetical earnings as adjustments.' },
        { t: 'Non-GAAP measures may not exceed GAAP net income.', ok: false, why: 'No such rule. EBITDA always exceeds net income.' },
        { t: 'Adjustments are fine if the auditor reviews them.', ok: false, why: 'Non-GAAP measures are management’s responsibility and aren’t audited.' },
      ]),
    ],
    conclusion: '$61M of Hearthstone’s "Adjusted" EBITDA is normal costs removed and earnings imagined.',
  };

  defs.wpH4 = {
    ref: 'WP H-4 · GOODWILL IMPAIRMENT (ASC 350-20)',
    title: 'Northfield Foods Reporting Unit',
    intro: 'You restated Northfield in January. Hearthstone’s goodwill test didn’t notice.',
    header() {
      return '<div class="wp-meta"><span>Source: <b>October 2026 annual impairment test (VDR); Northfield restatement (your Ep. 2 report)</b></span><span>$ in millions</span></div>' +
        '<div class="tbl-wrap"><table class="ledger"><tr><th></th><th class="num">Management (Oct 2026)</th><th class="num">Corrected</th></tr>' +
        '<tr><td>Northfield EBITDA used</td><td class="num">46.5 (pre-restatement)</td><td class="num">41.2 (restated)</td></tr>' +
        '<tr><td>EV / EBITDA multiple</td><td class="num">11.0x</td><td class="num">9.0x (peer median, frozen foods)</td></tr>' +
        '<tr><td>Fair value of reporting unit</td><td class="num">512.0</td><td class="num"><b style="color:#b8312f">?</b></td></tr>' +
        '<tr><td>Carrying amount (incl. goodwill)</td><td class="num">486.0</td><td class="num">486.0</td></tr>' +
        '<tr><td>Goodwill allocated</td><td class="num">190.0</td><td class="num">190.0</td></tr></table></div>' +
        '<div class="wp-note">January 2027: Northfield event of default, notice of default, FY26 restatement. No interim impairment test performed in Q1 or Q2 FY27.</div>';
    },
    steps: [
      num('fv', 'Corrected fair value of the Northfield reporting unit? ($M)', {
        answerText: '370.8', placeholder: '$M', suffix: '$M',
        check(v) { v = M(v); if (Math.abs(v - 370.8) <= 0.05) return true; if (Math.abs(v - 453.2) <= 0.05) return 'Right EBITDA, wrong multiple.'; if (Math.abs(v - 418.5) <= 0.05) return 'Right multiple, but use the restated EBITDA.'; return 'Doesn’t tie. Restated EBITDA × peer multiple.'; },
      }, { okMsg: '$41.2M × 9.0 = <b>$370.8M</b>.' }),
      num('imp', 'Goodwill impairment? ($M)', {
        answerText: '115.2', placeholder: '$M', suffix: '$M',
        check(v) { v = M(v); if (Math.abs(v - 115.2) <= 0.05) return true; if (Math.abs(v - 190) <= 0.05) return 'The impairment is limited to goodwill — but here it’s less than goodwill. Carrying amount minus fair value.'; return 'Doesn’t tie. Carrying amount − fair value, not to exceed goodwill.'; },
      }, { okMsg: '$486.0M − $370.8M = <b>$115.2M</b>, within the $190.0M of goodwill.' }),
      mc('rule', 'Which statement is correct?', [
        { t: 'Hearthstone should first measure the implied fair value of goodwill (Step 2) before recording anything.', ok: false, why: 'Step 2 was eliminated by ASU 2017-04.' },
        { t: 'Under ASU 2017-04 the test is one step: impairment equals the carrying amount over fair value, limited to the goodwill allocated. The January default and restatement were triggering events requiring an interim test — the impairment belonged in Q1 FY27.', ok: true, why: 'One step, capped at goodwill, and triggering events can’t wait for October.' },
        { t: 'No impairment is needed until the next annual test in October 2027.', ok: false, why: 'Triggering events require an interim test when it’s more likely than not that fair value is below carrying amount.' },
        { t: 'Impairment can be reversed if Northfield recovers, so it’s optional.', ok: false, why: 'US GAAP prohibits reversing goodwill impairment.' },
      ]),
    ],
    conclusion: 'Northfield’s goodwill was tested on numbers you’d already proven false. $115.2M of impairment is missing.',
  };

  const RES = [
    ['Q3 FY26', '54.0', '51.0', '4.0', true],
    ['Q4 FY26', '57.5', '53.0', '5.5', true],
    ['Q1 FY27', '55.0', '50.0', '6.0', true],
    ['Q2 FY27', '59.5', '52.0', '5.5', false, 'Without the release, Q2 is $54.0M — still above the $52.0M target. The release wasn’t needed that quarter.'],
  ];
  defs.wpH5 = {
    ref: 'WP H-5 · BUSINESS COMBINATIONS (ASC 805) & EARNINGS MANAGEMENT',
    title: 'Acquisition "Restructuring" Reserves',
    intro: 'Favorable outcomes that arrive exactly when a target is in danger aren’t outcomes. They’re decisions.',
    header() {
      return '<div class="wp-meta"><span>Source: <b>Purchase price allocations (VDR); reserve roll-forward; board EBITDA targets</b></span><span>$ in millions</span></div>' +
        '<div class="tbl-wrap"><table class="ledger"><tr><th>Acquisition</th><th>Date</th><th class="num">"Restructuring reserve" recorded in purchase accounting</th><th>Basis</th></tr>' +
        '<tr><td>Northfield Foods</td><td>2023</td><td class="num">14.0</td><td class="wrap">"Anticipated plant consolidation" — no plan approved or communicated at acquisition</td></tr>' +
        '<tr><td>Sierra Salsa Co.</td><td>2024</td><td class="num">6.0</td><td class="wrap">"Expected headcount actions" — none identified</td></tr>' +
        '<tr><td>Kettle & Crumb Bakeries</td><td>2025</td><td class="num">11.0</td><td class="wrap">"Integration contingency"</td></tr></table></div>' +
        '<div class="wp-note">LTM releases credited to "Other operating income": Q3 FY26 $4.0M, Q4 FY26 $5.5M, Q1 FY27 $6.0M, Q2 FY27 $5.5M. Amounts actually used for exit costs: $3.0M (FY25).</div>';
    },
    steps: [
      num('rel', 'Total reserve releases credited to income in the LTM period? ($M)', {
        answerText: '21.0', placeholder: '$M', suffix: '$M',
        check(v) { v = M(v); if (Math.abs(v - 21) <= 0.05) return true; if (Math.abs(v - 31) <= 0.05) return 'That’s what was originally recorded. How much went to income?'; return 'Doesn’t tie. Sum the four quarterly releases.'; },
      }, { okMsg: '<b>$21.0M</b> of income from reversing liabilities that should never have existed.' }),
      mc('rule', 'Why were these reserves improper from the start?', [
        { t: 'They were too small.', ok: false, why: 'Size isn’t the issue. Existence is.' },
        { t: 'Under ASC 805-20-25-2, costs the acquirer expects but isn’t obligated to incur (like future restructuring it hasn’t committed to) aren’t liabilities at the acquisition date. They shouldn’t have been recorded in purchase accounting at all — and releasing them manufactures income.', ok: true, why: 'ASC 805 eliminated the old practice of booking "restructuring reserves" in purchase accounting precisely because they became cookie jars.' },
        { t: 'Restructuring reserves must be recorded in the acquiree’s books, not the acquirer’s.', ok: false, why: 'The point is they shouldn’t be anyone’s liability yet.' },
        { t: 'They should have been released to goodwill, not income.', ok: false, why: 'Outside the measurement period, adjustments don’t go to goodwill — and these never belonged in the PPA anyway.' },
      ]),
      multiPick('qtrs', 'Board EBITDA targets vs. reported results. Select every quarter that would have missed its target without the reserve release.', [
        { t: 'Quarter' }, { t: 'Reported EBITDA', num: 1 }, { t: 'Board target', num: 1 }, { t: 'Release included', num: 1 },
      ], RES.map(r => ({ ok: r[4], why: r[5], cells: [r[0], r[1], r[2], r[3]] })), { okMsg: 'Three of four quarters hit target only because of a release. That isn’t estimation. That’s earnings management.' }),
    ],
    conclusion: '$21M of "favorable outcomes" landed in exactly the quarters that needed them.',
  };

  defs.wpH6 = {
    ref: 'WP H-6 · FEES, FUNDS FLOW & VALUATION',
    title: 'Monitoring Fee Acceleration, Keystone, and What Hearthstone Is Worth',
    intro: 'Follow the fee to the last hop. Then give Olivia the number.',
    header() {
      return '<div class="wp-meta"><span>Sources: <b>Monitoring agreement (VDR); IPO funds-flow memo & wires (M. Oyelaran via counsel)</b></span><span>$ in millions</span></div>' +
        '<div class="wp-exhibit"><b>Monitoring Agreement §4.3:</b> Annual fee $6.0M through 12/31/2035. Upon an IPO, the Company shall pay the present value of all remaining annual fees (2028–2035: eight payments), discounted at 8%, as a termination fee.</div>' +
        '<div class="wp-exhibit"><b>Valuation inputs:</b> S-1 Adjusted EBITDA $306.5M; offering implies 14.0x. Your corrections: improper add-backs (H-3) → $245.5M; less Lone Star round-trip gross profit $26.9M (H-2); less reserve releases $21.0M (H-5).</div>';
    },
    steps: [
      num('pv', 'Termination fee due on the IPO (present value of eight annual $6.0M payments at 8%)? ($M)', {
        answerText: '34.48', placeholder: '$M', suffix: '$M',
        check(v) { v = M(v); if (Math.abs(v - 34.48) <= 0.02) return true; if (Math.abs(v - 48) <= 0.05) return 'That’s undiscounted. Discount at 8%.'; if (Math.abs(v - 37.24) <= 0.03) return 'That treats the payments as due at the start of each year (an annuity due). The agreement pays at year-end.'; return 'Doesn’t tie. 6.0 × (1 − 1.08^−8) ÷ 0.08.'; },
      }, { okMsg: '6.0 × 5.7466 = <b>$34.48M</b>, paid out of IPO proceeds — investors’ money.' }),
      rowPick('wire', 'Funds-flow memo for Friday, and prior-year wires. Which transfer identifies who ultimately receives the fee?', [
        { t: 'Date' }, { t: 'From' }, { t: 'To' }, { t: '$M', num: 1 }, { t: 'Memo', wrap: 1 },
      ], [
        { cells: ['9/17 (sched.)', 'Hearthstone Brands', 'Calder Ridge Management LLC', '34.48', 'Monitoring termination fee'], why: 'The first hop — the disclosed one. Keep following.' },
        { cells: ['9/17 (sched.)', 'Calder Ridge Management LLC', 'KRA Holdings 14 LLC (Keystone Registered Agents, DE)', '34.48', '"Per side letter 2019-07"'], why: 'A Keystone shell. Who owns it?' },
        { ok: true, cells: ['9/17 (sched.)', 'KRA Holdings 14 LLC', 'Asher Family Trust (Grand Cayman)', '34.48', '"Distribution"'], why: 'The last hop: the termination fee — paid with IPO investors’ money — ends up in Simon Asher’s family trust, not with Calder’s limited partners. The same route KRA Holdings 9 used for Meridian’s money.' },
        { cells: ['9/17 (sched.)', 'Calder Ridge Management LLC', 'Calder Ridge Fund III LP', '0.00', 'Fee offset to LPs'], why: 'The fee offset the LPs were promised. It’s zero.' },
      ]),
      num('value', 'At 14.0x, by how much does the S-1 overstate Hearthstone’s implied enterprise value? ($M)', {
        answerText: '1,524.6', placeholder: '$M', suffix: '$M',
        check(v) { v = M(v); if (Math.abs(v - 1524.6) <= 1) return true; if (Math.abs(v - 854) <= 1) return 'You’ve only removed the H-3 add-backs. Also remove the round-trip gross profit and the reserve releases.'; if (Math.abs(v - 108.9) <= 0.1) return 'That’s the EBITDA difference. Multiply by 14.'; return 'Doesn’t tie. (306.5 − corrected Adjusted EBITDA) × 14.'; },
      }, { okMsg: 'Corrected Adjusted EBITDA: 245.5 − 26.9 − 21.0 = $197.6M. (306.5 − 197.6) × 14 = <b>$1,524.6M</b>. A billion and a half dollars of investors’ money for earnings that don’t exist.' }),
    ],
    conclusion: 'A $34.48M fee routed to Simon Asher’s trust, and an IPO priced $1.52 billion above what the numbers support.',
  };

  // ================================================================ register
  const def = {
    chapters: CHAPTERS, evidence: EV, clock, location, objective, npcPos, nightLights,
    newGame, beats, talk: TALK, use, flavor: FLAVOR, onStep, ending,
  };
  G.registerEpisode({
    id: 'ep5', num: 5,
    title: 'Hearthstone',
    subtitle: 'Hearthstone Brands IPO · Chicago · Related parties, round-trips, adjusted EBITDA and the man behind all of it. Series finale.',
    chapters: CHAPTERS,
    contact: { name: 'M', avatar: 'M', sub: 'unknown number · signal', color: '#d8b04a' },
    frustrated: 'Slow down. You’ve done this four times. Every answer is in a source document — read the notes the way I used to write them.',
    ranks: ['Name Partner', 'Forensic Director', 'Senior Investigator', 'M Saw This Coming'],
    start: { map: 'tower', x: 23, y: 20, dir: 'up' },
    buildMaps: () => ({ tower: buildTower(), mcc: buildMCC(), riverwalk: buildRiverwalk() }),
    cast, hints: HINTS, puzzles: defs, story: G.makeStory(def),
    puzzleEvidence: { wpH1: 'ev_rp', wpH2: 'ev_round', wpH3: 'ev_ebitda', wpH4: 'ev_goodwill', wpH5: 'ev_reserves', wpH6: 'ev_fees' },
  });
})();
