// Episode 3 — Sell-In. Voltline Beverage: channel stuffing, side letters, bill-and-hold and a round-trip, days before earnings.
(function () {
  const U = G.util, K = G.kit;
  const { makeMap } = G.mapkit;
  const { mc, num, multiPick, criteria, multiLine } = G.puzzles.kit;
  const fmt = U.fmt;
  const say = K.say, narrate = K.narrate, choose = K.choose, text = K.text;
  const S = K.S, F = K.F, E = K.E, done = K.done;
  const M = v => (Math.abs(v) >= 1e4 ? v / 1e6 : v);

  // ================================================================ maps
  function buildHQ() {
    const m = makeMap('hq', 48, 30);
    m.neon = '#c6f040';
    m.canColors = ['#c6f040', '#30c0f0', '#f04070', '#f0a020', '#b070f0'];
    // top band
    m.room(1, 1, 10, 8, '=');   // lobby
    m.room(12, 1, 22, 8, '_');  // boardroom "The Reactor"
    m.room(24, 1, 29, 8, '_');  // CFO
    m.room(31, 1, 37, 8, '_');  // CRO
    m.room(39, 1, 46, 8, '_');  // General Counsel
    for (let x = 1; x <= 46; x++) if (m.floor[1][x] !== '#') m.floor[0][x] = 'W';
    for (let x = 12; x <= 22; x++) m.floor[9][x] = 'g';
    m.door(6, 9); m.door(17, 9); m.door(26, 9); m.door(34, 9); m.door(42, 9);
    m.room(1, 10, 46, 11, '=');
    // middle band
    m.room(1, 13, 14, 20, '.');   // FP&A
    m.room(16, 13, 28, 20, '.');  // AR & deductions
    m.room(30, 13, 37, 20, ',');  // kitchen
    m.room(39, 13, 46, 20, '-');  // legal ops / eDiscovery
    m.door(7, 12); m.door(22, 12); m.door(33, 12); m.door(42, 12);
    m.door(7, 21); m.door(22, 21); m.door(33, 21); m.door(42, 21);
    m.room(1, 22, 46, 22, '='); // lower corridor
    // bottom band
    m.room(1, 24, 8, 28, '_');    // treasury
    m.room(10, 24, 15, 28, '.');  // war room (yours)
    m.room(17, 24, 24, 28, '.');  // podcast studio
    m.room(26, 24, 37, 28, '=');  // lounge
    m.room(39, 24, 46, 28, '.');  // records / data room
    m.door(4, 23); m.door(12, 23); m.door(20, 23); m.door(31, 23); m.door(42, 23);
    for (let x = 10; x <= 15; x++) m.floor[23][x] = 'g';
    m.door(12, 23);

    // lobby
    m.put(3, 0, 'N', 'neon_logo'); m.label(3, 0, 'VOLTLINE');
    m.row(3, 6, 4, 'r', 'reception'); m.put(5, 3, 'h');
    m.put(1, 1, 'G', 'lobby_cooler'); m.put(1, 2, 'G', 'lobby_cooler');
    m.put(9, 5, 'c', 'lobby_couch'); m.put(9, 6, 'c', 'lobby_couch'); m.put(1, 8, 'P');
    m.put(8, 0, 'L', 'ticker'); m.put(9, 0, 'L', 'ticker');
    // boardroom
    for (let x = 14; x <= 20; x++) for (let y = 3; y <= 5; y++) m.put(x, y, 'T', 'b_table');
    for (let x = 14; x <= 20; x++) { m.put(x, 2, 'h'); m.put(x, 6, 'h'); }
    m.put(13, 4, 'h'); m.put(21, 4, 'h');
    m.put(16, 0, 'L', 'b_screen'); m.put(17, 0, 'L', 'b_screen'); m.put(12, 1, 'P'); m.put(22, 1, 'P');
    // CFO
    m.put(25, 3, 'D', 'n_desk'); m.put(26, 3, 'C', 'n_pc'); m.put(27, 3, 'D', 'n_desk'); m.put(26, 2, 'h');
    m.put(29, 1, 'F', 'n_files'); m.put(24, 8, 'P');
    // CRO
    m.put(32, 3, 'D', 'g_desk'); m.put(33, 3, 'C', 'g_pc'); m.put(34, 3, 'D', 'g_desk'); m.put(33, 2, 'h');
    m.put(36, 1, 'B', 'g_trophies'); m.put(37, 1, 'B', 'g_trophies'); m.put(35, 0, 'N', 'g_neon'); m.label(35, 0, 'CLOSE');
    m.put(37, 6, 'G', 'g_fridge');
    // GC
    m.put(41, 3, 'D', 'l_desk'); m.put(42, 3, 'C', 'l_pc'); m.put(43, 3, 'D', 'l_desk'); m.put(42, 2, 'h');
    m.put(39, 1, 'B', 'l_shelf'); m.put(40, 1, 'B', 'l_shelf'); m.put(46, 1, 'F', 'l_files');
    // corridor
    m.put(20, 10, 'w', 'cooler'); m.put(46, 10, 'P'); m.put(1, 11, 'P');
    // FP&A
    for (const [x, y] of [[2, 15], [7, 15], [2, 18], [7, 18], [11, 15]]) { m.put(x, y, 'C', 'fpa_pc'); m.put(x + 1, y, 'D'); m.put(x + 2, y, 'C', 'fpa_pc'); }
    m.put(14, 12, 'Z', 'fpa_board'); m.put(13, 20, 'P');
    // AR & deductions
    for (const [x, y] of [[17, 15], [22, 15], [17, 18], [22, 18]]) { m.put(x, y, 'C', 'ar_pc'); m.put(x + 1, y, 'D'); m.put(x + 2, y, 'C', 'ar_pc'); }
    m.put(27, 13, 'F', 'ar_files'); m.put(28, 13, 'F', 'ar_files'); m.put(18, 12, 's', 'ar_sign'); m.label(18, 12, 'DEDUCTIONS');
    // kitchen
    m.row(30, 33, 13, 'K', 'kombucha'); m.put(34, 13, 'G', 'kitchen_cooler'); m.put(35, 13, 'G', 'kitchen_cooler'); m.put(36, 13, 'G', 'kitchen_cooler');
    m.put(32, 17, 'T', 'kitchen_table'); m.put(33, 17, 'T', 'kitchen_table'); m.put(34, 17, 'T', 'kitchen_table');
    m.put(37, 20, 'Q', 'vending');
    // legal ops
    for (let y = 14; y <= 18; y++) m.put(46, y, 'S', 'servers');
    m.put(40, 15, 'C', 'sam_pc'); m.put(41, 15, 'D'); m.put(39, 20, 'F', 'hold_files');
    // treasury
    m.put(3, 26, 'D', 'ben_desk'); m.put(4, 26, 'C', 'ben_pc'); m.put(5, 26, 'D', 'ben_desk'); m.put(4, 27, 'h');
    m.put(8, 28, 'F', 'treasury_files'); m.put(1, 28, 'P');
    // war room
    m.put(12, 25, 'C', 'war_pc'); m.put(13, 25, 'D', 'war_desk'); m.put(11, 25, 'D', 'swag'); m.put(12, 26, 'h');
    m.put(15, 24, 'P');
    // studio, lounge, records
    m.put(20, 26, 'T', 'studio'); m.put(21, 26, 'T', 'studio'); m.put(24, 24, 'P');
    m.put(28, 26, 'c', 'lounge_couch'); m.put(29, 26, 'c', 'lounge_couch'); m.put(33, 26, 'T', 'pool'); m.put(34, 26, 'T', 'pool'); m.put(37, 24, 'G', 'lounge_cooler');
    m.row(40, 41, 24, 'F', 'records'); m.row(43, 45, 24, 'F', 'records'); m.row(40, 45, 27, 'F', 'records');
    return m;
  }

  function buildDC() {
    const m = makeMap('dc', 40, 30, { dark: true, darkness: 0.62, darkTint: '10,12,24' });
    m.boxColors = ['#c6f040', '#30c0f0', '#f04070', '#2a2d33', '#c6f040'];
    m.room(1, 1, 38, 6, '%');      // truck apron
    for (let x = 0; x <= 39; x++) m.floor[0][x] = '!';
    m.fenceGround = '%';
    m.room(1, 8, 38, 28, '-');     // warehouse
    [6, 12, 18, 24, 30].forEach((x, i) => { m.put(x, 7, 'k', 'dock'); m.label(x, 7, 'D' + (i + 1)); });
    m.props.push({ kind: 'truck', x: 5, y: 1, w: 2, h: 6, facing: 'up', color: '#d9dde2', cab: '#2a4a8a', label: 'VOLT', solid: true });
    m.props.push({ kind: 'truck', x: 17, y: 1, w: 2, h: 6, facing: 'up', color: '#e8e0c8', cab: '#8a2a2a', label: 'LSTAR', solid: true, lightsOn: true });
    m.props.push({ kind: 'trailer', x: 29, y: 1, w: 2, h: 6, facing: 'up', color: '#d9dde2', stripe: '#c6f040', label: 'VOLT', solid: true });
    const racks = [11, 14, 17, 20];
    for (const y of racks) for (let x = 3; x <= 27; x++) if (x !== 10 && x !== 19) m.put(x, y, 'H', 'rack');
    // pallets tagged SOLD-HOLD, mixed into general stock
    m.tags = new Set();
    const holds = { hold1: [6, 12], hold2: [15, 15], hold3: [23, 18] };
    for (const id in holds) { const [x, y] = holds[id]; m.put(x, y, 'j', id); m.tags.add(x + ',' + y); }
    // staging at dock 3 for the Lone Star truck
    for (let x = 16; x <= 20; x++) { m.put(x, 9, 'j', 'staged'); m.tags.add(x + ',9'); }
    m.put(21, 9, 'q', 'ls_bol');
    m.put(14, 9, 'f', 'forklift');
    // office
    for (let y = 22; y <= 28; y++) m.floor[y][30] = 'g';
    for (let x = 30; x <= 38; x++) m.floor[22][x] = 'g';
    m.door(33, 22);
    m.put(34, 24, 'C', 'dc_pc'); m.put(35, 24, 'D', 'dc_desk'); m.put(34, 25, 'h');
    m.put(38, 23, 'F', 'dc_files'); m.put(37, 28, 'w', 'dc_cooler');
    // guard post
    m.put(3, 26, 'D', 'guard_desk'); m.put(2, 26, 'C', 'guard_pc');
    m.put(1, 23, 'Z', 'dc_board');
    m.lights = [{ x: 18, y: 8.5, r: 70 }, { x: 34, y: 24.5, r: 50 }, { x: 3, y: 26, r: 44 }, { x: 10, y: 13, r: 40 }, { x: 25, y: 19, r: 40 }, { x: 18, y: 4, r: 50 }];
    return m;
  }

  function buildPark() {
    const m = makeMap('park', 30, 20, { dark: true, darkness: 0.72, darkTint: '12,8,24', fenceGround: '"' });
    m.room(1, 1, 28, 18, '"');
    m.room(1, 15, 28, 18, '%');
    for (let x = 0; x <= 29; x++) { m.floor[0][x] = '!'; m.floor[19][x] = '!'; }
    for (let y = 0; y <= 19; y++) { m.floor[y][0] = '!'; m.floor[y][29] = '!'; }
    m.props.push({ kind: 'foodtruck', x: 2, y: 1, w: 4, h: 3, color: '#c94a3a', awning: '#f4f1e8', label: 'BBQ', solid: true });
    m.props.push({ kind: 'foodtruck', x: 8, y: 1, w: 4, h: 3, color: '#30a0c0', awning: '#f0c850', label: 'TACOS', solid: true });
    m.props.push({ kind: 'foodtruck', x: 14, y: 1, w: 4, h: 3, color: '#b070f0', awning: '#f4f1e8', label: 'BOBA', solid: true });
    m.props.push({ kind: 'foodtruck', x: 20, y: 1, w: 4, h: 3, color: '#f0a020', awning: '#2a2a30', label: 'KOLACHE', solid: true });
    for (const [x, y] of [[4, 8], [10, 8], [16, 8], [22, 8], [7, 11], [13, 11], [19, 11]]) { m.put(x, y, 'T', 'picnic'); m.put(x + 1, y, 'T', 'picnic'); }
    m.put(26, 6, 'e'); m.put(2, 12, 'e'); m.put(27, 12, 'e');
    m.lights = [];
    for (let x = 3; x <= 25; x += 4) m.lights.push({ x, y: 5.5, r: 26 });
    for (let x = 5; x <= 23; x += 6) m.lights.push({ x, y: 9.5, r: 30 });
    m.lights.push({ x: 14, y: 12, r: 34 });
    // cars in the lot
    m.props.push({ kind: 'car', x: 4, y: 15, w: 2, h: 3, color: '#3b4b6b', facing: 'up', solid: true });
    m.props.push({ kind: 'car', x: 10, y: 15, w: 2, h: 3, color: '#8a8a8a', facing: 'up', solid: true });
    m.props.push({ kind: 'car', x: 22, y: 15, w: 2, h: 3, color: '#111317', facing: 'up', solid: true });
    m.tag(22, 15, 'black_car'); m.tag(23, 15, 'black_car');
    return m;
  }

  // ================================================================ cast
  const cast = {
    lena: { name: 'Lena Strand', title: 'Founder, Strand Forensic Advisory', look: { skin: '#f3d6c0', hair: '#e2c27a', hairStyle: 'bun', shirt: '#e8e8e8', jacket: '#1f2f4a', pants: '#1f2f4a' } },
    park: { name: 'Dr. Helen Park', title: 'Chair, Audit Committee', look: { skin: '#ecc9a2', hair: '#c8c8c8', hairStyle: 'bob', shirt: '#f0f0f0', jacket: '#a02a3a', pants: '#2a2a30', glasses: '#333' } },
    kai: { name: 'Kai Ressler', title: 'Founder & CEO', look: { skin: '#e8c4a0', hair: '#1a1a1a', hairStyle: 'beanie', hat: '#1a1a1a', shirt: '#c6f040', jacket: '#1a1a1a', pants: '#2a2a30' } },
    grant: { name: 'Grant Whitaker', title: 'Chief Revenue Officer', look: { skin: '#e9c0a0', hair: '#d0b070', hairStyle: 'short', shirt: '#e8f0ff', jacket: '#2a4a3a', pants: '#3a3a44' } },
    natalie: { name: 'Natalie Ford', title: 'Chief Financial Officer', look: { skin: '#f0d0b8', hair: '#3a2a1e', hairStyle: 'bob', shirt: '#f0f0f0', jacket: '#1f2f4a', pants: '#1f2f4a' } },
    owen: { name: 'Owen Reilly', title: 'FP&A Analyst', look: { skin: '#f0cfae', hair: '#8a4a2a', hairStyle: 'short', shirt: '#888', jacket: '#5a5a62', pants: '#2a2f3a', glasses: '#333' } },
    lam: { name: 'Richard Lam', title: 'General Counsel', look: { skin: '#e8c8a0', hair: '#555', hairStyle: 'bald', shirt: '#f0f0f0', jacket: '#4a4a52', tie: '#2a4a7a', pants: '#4a4a52', glasses: '#222' } },
    sam: { name: 'Sam Torres', title: 'Legal Operations & eDiscovery', look: { skin: '#c48a60', hair: '#1a1410', hairStyle: 'puff', shirt: '#2a2a3a', jacket: '#6a8a6a', pants: '#2a2a3a' } },
    mari: { name: 'Mari Vega', title: 'AR Deductions Analyst', look: { skin: '#c49068', hair: '#140e0a', hairStyle: 'long', shirt: '#c6f040', jacket: '#2a2a30', pants: '#2a2a3a' } },
    ben: { name: 'Ben Kaplan', title: 'Treasury Manager', look: { skin: '#f0cfae', hair: '#5a3a1e', hairStyle: 'short', shirt: '#4a7aaa', pants: '#3a3a44' } },
    jules: { name: 'Jules Park-Avery', title: 'Front Desk', look: { skin: '#f2d0b5', hair: '#e070a0', hairStyle: 'bob', shirt: '#2a2a30', pants: '#2a2a3a' } },
    darnell: { name: 'Darnell Hughes', title: 'Warehouse Manager, Round Rock DC', look: { skin: '#6b4429', hair: '#1a1410', hairStyle: 'cap', shirt: '#2a2a30', jacket: '#e0c020', pants: '#2a3a4a' } },
    rudy: { name: 'Rudy Salas', title: 'DC Night Security', look: { skin: '#c58c5c', hair: '#2c3e66', hairStyle: 'cap', shirt: '#2c3e66', pants: '#1a2236' } },
    driver: { name: 'Lone Star Driver', title: 'Lone Star Beverage Distributors', look: { skin: '#d8a070', hair: '#6a1a1a', hairStyle: 'cap', shirt: '#8a2a2a', pants: '#3a3a44' } },
    asher: { name: 'Simon Asher', title: 'Operating Partner, Calder Ridge · Chairman, Lone Star Beverage', look: { skin: '#e2c0a4', hair: '#d8d8d8', hairStyle: 'slick', hair2: '#f4f4f4', shirt: '#1a1a1a', jacket: '#3a3a42', pants: '#2a2a30' } },
  };

  // ================================================================ evidence
  const EV = {
    ev_koozie: { title: 'Note in the swag bag', ref: 'ITEM 0', short: '"Grant’s numbers are sell-in. Ask about sell-through."', body: '<p>Inside a Voltline can koozie in your welcome bag, a prepaid phone and a sticky note:</p><p><i>"Grant’s numbers are sell-in. Ask about sell-through. — S"</i></p>' },
    ev_channel: { title: 'Sell-in vs. sell-through', ref: 'WP V-1', short: 'DSO 41 → 84 days; $157M channel build; 33% shipped in week 13.', body: '<ul><li>Q1 shipments (sell-in) $655M vs. distributor depletions (sell-through) $498M: <b>$157M</b> built into the channel.</li><li>Week 13 alone: $214M — <b>32.7%</b> of the quarter.</li><li>DSO <b>84.1 days</b> vs. 41.0 a year ago. Distributor weeks of supply 3.1 → 7.2.</li></ul>' },
    ev_purge: { title: 'Mailbox purge log', ref: 'SAM TORRES 4/13', short: '3,412 items deleted from Grant’s mailbox Sat 2:14 AM; recovered.', body: '<ul><li>Saturday 4/10, 2:14–2:31 AM: <b>3,412 items</b> hard-deleted from G. Whitaker’s mailbox, two days before the short report.</li><li>Mailbox under litigation hold since February (unrelated distributor dispute); all items recovered from the hold.</li><li>Deletion performed from Grant’s laptop, VPN, home IP.</li></ul>' },
    ev_side: { title: 'Side letters', ref: 'WP V-2', short: 'Three distributors got return rights / pay-when-sold. $131M.', body: '<ul><li>Lone Star ($88M): unlimited returns through June, payment when sold, "stays between us."</li><li>Gulf Coast ($31M): 180-day terms plus storage paid by Voltline.</li><li>Panhandle ($12M): no invoice until sell-through; "call it consignment."</li><li>In substance consignment / payment contingent on resale: control hasn’t transferred (ASC 606-10-55-79/80). <b>$131.0M</b> to reverse.</li></ul>' },
    ev_darnell: { title: 'Statement of Darnell Hughes', ref: 'INTERVIEW 4/13', short: 'Grant ordered "hold" pallets moved to Lone Star before the auditors arrive.', body: '<ul><li>"Held" pallets were never segregated; Grant told him tags were "for the auditors."</li><li>4/13, 10:40 PM: Grant ordered held Texas Premier product loaded onto a Lone Star truck "before Thursday."</li><li>The bill-and-hold request letter was emailed to Darnell by Grant on 4/3 as a Word document authored by GWHITAKER.</li></ul>' },
    ev_bnh: { title: 'Bill-and-hold evaluation', ref: 'WP V-3', short: 'Fails 3 of 4 criteria in ASC 606-10-55-83. $46.2M.', body: '<ul><li>Request letter dated 4/3 (after quarter-end), authored by GWHITAKER: no substantive customer reason.</li><li>Pallets not segregated; WMS reallocated them to Lone Star on 4/2; loaded onto a Lone Star truck 4/13.</li><li>Only "ready for transfer" is met. <b>$46.2M</b> revenue to reverse.</li></ul>' },
    ev_credits: { title: 'April credit memos', ref: 'WP V-4', short: '$29.5M of April credits relate to Q1; $7.5M not already reversed.', body: '<ul><li>Recognized subsequent events (ASC 855): $29.5M of April credits for Q1 sales (stock rotation, short-dated returns, price protection).</li><li>$22.0M overlap with side-letter shipments already reversed; <b>$7.5M</b> incremental.</li><li>Hurricane credit (4/10 event) is nonrecognized — disclose if material.</li></ul>' },
    ev_mdf: { title: 'MDF round-trip', ref: 'WP V-5', short: '$38M of "marketing funds" wired to Lone Star came straight back as "collections."', body: '<ul><li>Three March MDF payments to Lone Star (<b>$38.0M</b>), no proof of performance.</li><li>Each followed within 48 hours by a Lone Star payment of ~the same amount, with remittance text referencing the MDF number.</li><li>Consideration payable to a customer: reduces revenue (ASC 606-10-32-25). The "collections" were Voltline’s own cash.</li></ul>' },
    ev_letter: { title: 'Lone Star side letter (original)', ref: 'FROM MARI VEGA', short: 'Signed by Grant; countersigned "S.A." for Lone Star.', body: '<p>The original Lone Star side letter, dated 3/24/2027: unlimited returns through 6/30, payment upon resale. Signed G. Whitaker for Voltline. Countersigned <b>"S.A., Chairman"</b> for Lone Star Beverage Distributors, a Calder Ridge Fund IV company.</p>' },
    ev_restate: { title: 'Q1 restatement waterfall', ref: 'WP V-6', short: '$222.7M overstatement; growth +37.9% → −9.0%.', body: '<ul><li>Side letters $131.0M + bill-and-hold $46.2M + incremental credits $7.5M + MDF $38.0M = <b>$222.7M</b>.</li><li>Restated Q1 revenue $432.3M vs. $475.0M a year ago: <b>−9.0%</b>, not +37.9%.</li><li>Postpone the release; evaluate prior-period non-reliance (8-K Item 4.02); no selective disclosure (Reg FD).</li></ul>' },
  };

  // ================================================================ hints (SIDELETTER)
  const HINTS = {
    'wpCH.dso': ['DSO = receivables over revenue, times the days in the quarter.', 'AR at 3/31 is 612. Revenue is 655. Ninety days.', '612 ÷ 655 × 90 = 84.1.'],
    'wpCH.build': ['What did we ship? What did distributors actually sell? The difference is sitting in their warehouses.', 'Sell-in total minus depletion total.', '655 − 498 = 157.'],
    'wpCH.why': ['Shipments spike, sell-through doesn’t, and nobody’s paying. What does that sound like?', 'Revenue pulled forward into the quarter.', 'The channel stuffing answer.'],
    'wpSL.letters': ['A side letter changes a deal with a CUSTOMER. Internal pressure isn’t a side letter.', 'Look for returns, pay-when-sold, extended terms, consignment.', 'Lone Star 3/24, Gulf Coast 3/27, Panhandle 3/29.'],
    'wpSL.acct': ['If they don’t pay until they sell, and they can send it all back… who controls the product?', 'In substance, it’s consignment.', 'The consignment / control answer.'],
    'wpSL.amount': ['Add up the shipments covered by the three side letters.', '88 + 31 + 12.', '131.0.'],
    'wpBH.crit': ['Four criteria. Read the dates, the metadata and the WMS log.', 'Only one criterion survives: the product was ready to ship.', 'Not met, not met, met, not met.'],
    'wpBH.amount': ['Sum the bill-and-hold invoices.', 'Six invoices to Texas Premier.', '46.2.'],
    'wpBH.entry': ['Undo the sale. Put the product back.', 'Revenue and AR out; inventory back at cost.', 'The entry that reverses revenue and restores inventory.'],
    'wpCM.q1': ['Which credits relate to conditions that existed on March 31st?', 'Q1 sales: stock rotation, short-dated returns, price protection. Not the hurricane, not the April promo.', '4401, 4402, 4405, 4409.'],
    'wpCM.hurricane': ['When did the flood happen?', 'After the balance sheet date — new condition.', 'Nonrecognized subsequent event; disclose if material.'],
    'wpCM.incr': ['Some of those credits are for shipments you already reversed in the side-letter workpaper.', '29.5 total, 22.0 overlap.', '7.5.'],
    'wpMDF.pairs': ['Match outbound MDF to inbound "collections." Timing, amount, remittance text.', 'Three Lone Star MDF payments came right back. Big Sky’s MDF has photos.', 'MDF-0311, MDF-0318, MDF-0322.'],
    'wpMDF.total': ['Add the round-tripped MDF.', '12 + 14 + 12.', '38.0.'],
    'wpMDF.acct': ['We paid the customer. Did we get a distinct service at fair value?', 'No service, no proof. It’s a price reduction.', 'Reduce revenue; the inflows aren’t real collections.'],
    'wpRS.total': ['Add every adjustment. Don’t double count the credits.', '131.0 + 46.2 + 7.5 + 38.0.', '222.7.'],
    'wpRS.growth': ['Restated Q1 over last year’s Q1, minus one.', '(655 − 222.7) ÷ 475 − 1.', 'About −9.0%.'],
    'wpRS.disclose': ['The release goes out at 4:05. Can it?', 'Postpone. Think about prior periods. No selective disclosure.', 'The postpone / Item 4.02 / Reg FD answer.'],
    'dlg.lam': ['Lam’s a lawyer. Speak lawyer: privilege, chain of custody, authority.', 'You work for the audit committee’s counsel. There’s already a litigation hold.', 'The forensic collection option.'],
    'dlg.darnell1': ['He’s a guy following orders at 11 PM. Start there.', 'Tell him you know who gave the order.', 'The option about who told him to load the truck.'],
    'dlg.darnell2': ['He’s scared for his job. What protects him?', 'Telling the truth to the audit committee.', 'The audit committee option.'],
    'dlg.ben': ['Ben needs cover. Give him real authority, not a story.', 'The audit committee resolution.', 'The first option.'],
    'dlg.asher': ['He’s recruiting you. Again.', 'Decline. Politely. Then let him know you’re watching.', 'The S-1 option.'],
    'hearing.r1': ['Sell-in isn’t demand.', 'Your sell-through analysis.', 'Present sell-in vs. sell-through.'],
    'hearing.r2': ['"No side deals." You have them in writing.', 'Side letters workpaper.', 'Present the side letters.'],
    'hearing.r3': ['Four criteria. He fails three.', 'Bill-and-hold workpaper, or Darnell.', 'Present the bill-and-hold evaluation.'],
    'hearing.r4': ['April credits for March shipments.', 'Credit memo workpaper.', 'Present April credit memos.'],
    'hearing.r5': ['He paid in cash — whose cash?', 'The round-trip.', 'Present the MDF round-trip.'],
    'hearing.r6': ['"Never deleted anything." Sam has a log.', 'The purge log.', 'Present the mailbox purge log.'],
    'hearing.r7': ['Helen wants one number.', 'The restatement waterfall.', 'Present the Q1 restatement waterfall.'],
    'hearing.r8': ['Kai needs to do the right thing before 4:05.', 'Postpone, disclose, cooperate.', 'The first option.'],
  };

  // ================================================================ chapters
  const CHAPTERS = [
    { title: 'Day 1 — Gray Fox', day: 'MON 4/12' },
    { title: 'Day 2 — Paper Trail', day: 'TUE 4/13' },
    { title: 'Night — Round Rock', day: 'TUE 4/13' },
    { title: 'Day 3 — Credits & Cash', day: 'WED 4/14' },
    { title: 'Night — Sideletter', day: 'WED 4/14' },
    { title: 'Day 4 — 4:05 PM', day: 'THU 4/15' },
    { title: 'Epilogue', day: '' },
  ];
  function clock(s) {
    const f = s.flags, ch = s.chapter;
    let t = '9:00 AM';
    if (ch === 0) t = !f.met_park ? '8:30 AM' : !done('wpCH') ? '10:15 AM' : '4:20 PM';
    if (ch === 1) t = !f.got_mail ? '9:10 AM' : '3:45 PM';
    if (ch === 2) t = !f.darnell_flipped ? '10:52 PM' : '11:40 PM';
    if (ch === 3) t = !done('wpCM') ? '8:45 AM' : !done('wpMDF') ? '1:30 PM' : '6:10 PM';
    if (ch === 4) t = s.map === 'park' ? '9:05 PM' : '2:10 AM';
    if (ch === 5) t = '1:00 PM';
    return (CHAPTERS[ch] || CHAPTERS[0]).day + ' · ' + t;
  }
  function location(s) { return { hq: 'Voltline HQ — Austin, TX', dc: 'Voltline Round Rock DC', park: 'Food truck park — East 6th St.' }[s.map]; }

  const PC = { map: 'hq', x: 12, y: 25 };
  const at = id => { const p = def.npcPos(id, S()); return p ? { map: p.map, x: p.x, y: p.y } : null; };

  function objective(s) {
    const f = s.flags;
    switch (s.chapter) {
      case 0:
        if (!f.badge) return { text: 'Check in at the *front desk*.', target: at('jules') };
        if (!f.met_park) return { text: 'Meet *Dr. Helen Park*, audit committee chair, in the boardroom.', target: at('park') };
        if (!f.phone_found) return { text: 'Find your *war room* (lower level, glass room).', target: { map: 'hq', x: 11, y: 25 } };
        if (!f.got_data) return { text: 'Get sell-in and sell-through data from *Owen Reilly* in FP&A.', target: at('owen') };
        return { text: 'Analyze the channel on the *war room computer*.', target: PC };
      case 1:
        if (!f.lam_ok) return { text: 'Ask *Richard Lam*, General Counsel, for a forensic email collection.', target: at('lam') };
        if (!f.got_mail) return { text: 'Pick up the collection from *Sam Torres* in legal ops.', target: at('sam') };
        return { text: 'Review Grant’s email on the *war room computer*.', target: PC };
      case 2:
        if (!f.rudy_ok) return { text: 'Check in with *security* at the Round Rock DC.', target: at('rudy') };
        if (!f.hold1 || !f.hold2 || !f.hold3) return { text: 'Inspect the pallets tagged *SOLD – HOLD* (' + ['hold1', 'hold2', 'hold3'].filter(k => f[k]).length + ' of 3).', target: (() => { const n = ['hold1', 'hold2', 'hold3'].find(k => !f[k]); return { map: 'dc', x: { hold1: 6, hold2: 15, hold3: 23 }[n], y: { hold1: 12, hold2: 15, hold3: 18 }[n] }; })() };
        if (!f.saw_bol) return { text: 'What’s being loaded at *dock 3*?', target: { map: 'dc', x: 21, y: 9 } };
        if (!f.darnell_flipped) return { text: 'Talk to *Darnell Hughes*, the warehouse manager.', target: at('darnell') };
        return { text: 'Evaluate the bill-and-hold on the *DC office computer*.', target: { map: 'dc', x: 34, y: 24 } };
      case 3:
        if (!f.got_cm) return { text: 'Get the April credit memo listing from *AR deductions*.', target: at('mari') };
        if (!done('wpCM')) return { text: 'Test the April credits on the *war room computer*.', target: PC };
        if (!f.got_bank) return { text: 'Get March bank activity from *Ben Kaplan* in treasury.', target: at('ben') };
        return { text: 'Trace the MDF payments on the *war room computer*.', target: PC };
      case 4:
        if (s.map === 'park') {
          if (!f.mari_met) return { text: 'Find *SIDELETTER* at the picnic tables.', target: at('mari') };
          return { text: '', target: null };
        }
        return { text: 'Build the restatement waterfall on the *war room computer*.', target: PC };
      case 5: return { text: 'The audit committee is in *The Reactor* (boardroom).', target: at('park') };
      default: return { text: '', target: null };
    }
  }

  function npcPos(id, s) {
    const f = s.flags, ch = s.chapter;
    const p = (x, y, dir, extra = {}) => Object.assign({ map: 'hq', x, y, dir }, extra);
    const day = ch === 0 || ch === 1 || ch === 3 || ch === 5;
    switch (id) {
      case 'jules': return day ? p(5, 3, 'down') : null;
      case 'park': return ch === 0 ? p(13, 4, 'right') : ch === 5 ? p(13, 4, 'right') : null;
      case 'kai': return ch === 5 ? p(16, 2, 'down') : ch === 1 ? p(8, 6, 'down') : null;
      case 'grant': return ch === 5 ? p(18, 6, 'up') : day ? p(33, 2, 'down') : null;
      case 'natalie': return ch === 5 ? p(20, 6, 'up') : day ? p(26, 2, 'down') : null;
      case 'owen': return day && ch !== 5 ? p(3, 16, 'up') : null;
      case 'lam': return ch === 5 ? p(21, 4, 'left') : day ? p(42, 2, 'down') : null;
      case 'sam': return day && ch !== 5 ? p(40, 16, 'up') : null;
      case 'mari':
        if (ch === 4) return f.mari_met && s.map !== 'park' ? null : { map: 'park', x: 14, y: 12, dir: 'up' };
        if (ch === 5) return p(22, 10, 'down');
        return day ? p(18, 16, 'up') : null;
      case 'ben': return day && ch !== 5 ? p(4, 27, 'up') : null;
      case 'darnell': return ch === 2 ? { map: 'dc', x: 34, y: 25, dir: 'up' } : null;
      case 'rudy': return ch === 2 ? { map: 'dc', x: 3, y: 25, dir: 'right' } : null;
      case 'driver': return ch === 2 && !f.darnell_flipped ? { map: 'dc', x: 22, y: 10, dir: 'left' } : null;
      case 'lena': return ch === 5 ? p(14, 6, 'up') : null;
      case 'asher': return ch === 5 ? p(15, 2, 'down') : null;
    }
    return null;
  }

  // ================================================================ beats
  async function newGame() {
    await G.ui.card({
      day: 'EPISODE 3 · MONDAY, APRIL 12, 2027 · 8:30 AM',
      title: 'SELL-IN',
      text: 'Voltline Beverage Co. (NASDAQ: VOLT). Energy drinks in neon cans. Eleven straight quarters of 30%+ growth.\n\nAt 6:00 this morning, short seller Gray Fox Research published a report titled *"Voltline: Charged With Stuffing."* The stock is down 22% pre-market.\n\nThe audit committee has hired Strand Forensic Advisory. Q1 earnings go out Thursday at 4:05 PM. You have three days.',
    });
    E().placePlayer('hq', 6, 7, 'up');
    await G.ui.reveal();
    await E().script(async () => {
      await narrate('The lobby is all polished concrete and neon. A stock ticker over the reception desk shows VOLT in red: −22.4%. Somebody has turned it face-down. It’s a screen, so that didn’t work.');
      await narrate('Lena, by text: *"Helen Park is sharp and scared. Grant Whitaker is neither. Start with sell-through."*');
    });
  }

  async function beats() {
    const s = S(), f = s.flags;
    if (done('wpCH') && !f.grant_visit) { f.grant_visit = true; await grantVisit(); }
    if (s.chapter === 0 && done('wpCH') && f.grant_visit) await toPaperTrail();
    if (s.chapter === 1 && done('wpSL')) await toRoundRock();
    if (s.chapter === 2 && done('wpBH')) await toCredits();
    if (s.chapter === 3 && done('wpCM') && !f.cm_followup) { f.cm_followup = true; await text('Credits are half of it. The other half is cash. Ben in treasury sees every wire. He’s scared of Natalie. Give him cover.'); }
    if (s.chapter === 3 && done('wpMDF')) await toPark();
    if (s.chapter === 4 && done('wpRS')) await toFinale();
    if (s.chapter === 5 && f.hearing_done) await ending();
    K.refresh();
  }

  async function grantVisit() {
    const e = E();
    G.audio.door();
    e.spawnActor('grant', 12, 23, 'down');
    await e.walkActor('grant', [['down', 1]]);
    e.faceToward('you', 12, 24);
    await say('grant', 'There they are! The forensic accountant. Grant Whitaker, CRO. I run revenue. Love what you’re doing here.');
    await say('grant', 'Gray Fox is a hedge fund with a blog. They’re short four million shares. You’re going to prove they’re liars, right? That’s the job?');
    const c = await choose('you', null, ['The job is to find out what happened.', 'Sell-through was $157 million short of sell-in.', 'Nice vest.']);
    if (c === 0) await say('grant', 'Same thing. Same thing!');
    else if (c === 1) { await say('grant', 'Distributors are building inventory ahead of summer. It’s called a season. You’ve heard of summer?'); await narrate('He laughs. Nobody else is in the room.'); }
    else await say('grant', 'Thanks. Company swag. We’re a family here.');
    await say('grant', 'Anyway. My door’s open. My calendar’s not. Ha!');
    await e.walkActor('grant', [['up', 1]]);
    e.removeActor('grant');
    await K.sleep(700);
    await text('Grant ships product. Distributors don’t sell it. The difference is somebody’s problem by June.');
    await text('He makes promises in email. Legal can collect it. Lam will stall.');
    K.refresh();
  }

  async function toPaperTrail() {
    await K.toChapter(1, { day: 'TUESDAY, APRIL 13, 2027 · 9:10 AM', title: 'Paper Trail', text: 'Kai Ressler holds an all-hands in the lobby. He stands on the reception desk in a hoodie and tells three hundred employees that "short sellers are just haters with Bloomberg terminals."\n\nThe applause is a little thin.' }, { map: 'hq', x: 12, y: 27, dir: 'up' });
  }

  async function toRoundRock() {
    await text('He calls them bill-and-hold. Drive to Round Rock tonight and see what "held" looks like.');
    await K.sleep(800);
    await K.toChapter(2, { day: 'TUESDAY, APRIL 13, 2027 · 10:52 PM', title: 'Round Rock', text: 'Voltline’s main distribution center: 400,000 square feet of energy drinks off I-35.\n\nThe books say $46 million of it was sold to Texas Premier Distributing on March 31st and is being held at the customer’s request.\n\nThe parking lot should be empty at this hour. It isn’t.' }, { map: 'dc', x: 5, y: 25, dir: 'right' });
  }

  async function darnellScene() {
    const f = F();
    E().faceToward('darnell', E().player.x, E().player.y);
    await say('darnell', 'Whoa — who let you in? It’s eleven at night.');
    await narrate('You show him the audit committee letter. He reads it twice.');
    await say('darnell', 'Look, I just run the building. Orders come down, product goes out.');
    await K.gate('you', null, [
      'Then let’s start with whose order put Texas Premier’s "held" pallets on a Lone Star truck tonight.',
      'You’re loading stolen goods, Darnell.',
      'Does Grant know you’re doing this?',
    ], 0, 'dlg.darnell1', async c => {
      if (c === 1) await say('darnell', 'Stolen? It’s our own warehouse! I’m not saying another word without HR.');
      else await say('darnell', 'Know? Man— never mind. I didn’t say anything.');
    });
    await narrate('Darnell looks at the forklift idling by dock 3, then back at you.');
    await say('darnell', 'Grant called me at 9:30. Said get the Texas Premier stuff on the Lone Star truck before the auditors come Thursday. Said it was "a transfer."');
    await say('darnell', 'Those pallets were never held for anybody. We stuck tags on them April 2nd and kept picking orders out of the same racks. Half of it already shipped to other customers.');
    await K.gate('darnell', 'Am I going to lose my job over this?', [
      'If you tell the audit committee the truth, you’re a witness. If you load that truck, you’re part of it.',
      'Probably. Sorry.',
      'Not if you finish loading quickly.',
    ], 0, 'dlg.darnell2', async c => {
      if (c === 1) await say('darnell', 'Then why would I help you?');
      else await say('darnell', 'Are you serious? Whose side are you on?');
    });
    await say('darnell', '…Okay. Hey! Shut it down! Nobody loads dock 3!');
    await narrate('The forklift stops. The Lone Star driver throws up his hands, climbs into his cab, and pulls away empty.');
    await say('darnell', 'The WMS report’s on my computer. And this — the "customer request" letter? Grant emailed it to me April 3rd. As a Word doc. Check who the author is.');
    f.darnell_flipped = true;
    K.addEvidence('ev_darnell');
    G.save();
  }

  async function toCredits() {
    await text('You stopped the truck. Darnell texted me a thumbs-up. Darnell doesn’t text.');
    await K.sleep(800);
    await K.toChapter(3, { day: 'WEDNESDAY, APRIL 14, 2027 · 8:45 AM', title: 'Credits & Cash', text: 'Gray Fox publishes a follow-up: a photo of the Round Rock lot at night, and the caption "Interesting place for a party."\n\nVOLT is down another 9%. The earnings release is in thirty-one hours.' }, { map: 'hq', x: 12, y: 27, dir: 'up' });
    await E().script(async () => {
      await text('April credits. AR deductions sees every one. Go ask for the listing. Don’t mention me.');
    });
  }

  async function toPark() {
    await narrate('When you come back to the war room, the whiteboard has been wiped. In neon green marker, someone has written: *GO HOME.*');
    await text('That wasn’t me. You’re rattling them.');
    await text('Food truck park on East 6th. 9 PM. Get the brisket. Come alone.');
    await K.sleep(800);
    await K.toChapter(4, { day: 'WEDNESDAY, APRIL 14, 2027 · 9:05 PM', title: 'Sideletter', text: 'String lights, smoked brisket, a kolache truck, and a hundred people who have never heard of revenue recognition.\n\nSomewhere in this crowd is the person who’s been texting you for three days.' }, { map: 'park', x: 14, y: 17, dir: 'up' });
  }

  async function mariScene() {
    const e = E(), f = F();
    e.faceToward('mari', e.player.x, e.player.y);
    await say('mari', 'You got the brisket. Good. Sit.');
    await say('mari', 'Mari Vega. AR deductions. Yeah — I’m SIDELETTER. Sorry for the name. I was proud of it at 2 AM.');
    await say('mari', 'Every April, credits come in for "stock rotation." This year it was a flood. Grant had me code everything as April activity. Lone Star’s credits came with a note: "per side agreement 3/24." I asked what side agreement. Nobody answered.');
    await say('mari', 'Then a copy of the agreement got routed to my queue by mistake. I scanned it before anyone noticed.');
    await narrate('She slides a folded page across the picnic table. The Lone Star side letter — signed by Grant. And countersigned for Lone Star: *"S.A., Chairman."*');
    K.addEvidence('ev_letter');
    const c = await choose('you', null, ['Who is S.A.?', 'Why didn’t you go to Helen Park?', 'Thank you, Mari.']);
    if (c === 0) await say('mari', 'Simon Asher. Calder Ridge bought Lone Star last year. He’s their chairman. He was in our office twice in March.');
    else if (c === 1) await say('mari', 'I’m a deductions analyst with eleven months of tenure. Grant would’ve had me walked out by lunch. I needed someone they couldn’t fire.');
    else await say('mari', 'Thank me Thursday at 4:06.');
    await narrate('Mari stiffens. Over your shoulder, a black sedan has pulled into the lot. A tall man in a charcoal coat gets out, buys brisket, and walks toward your table as if he has a reservation.');
    e.spawnActor('asher', 25, 12, 'left');
    await e.walkActor('asher', [['left', 9]]);
    await say('asher', 'Hello again, {first}. And… Ms. Vega, isn’t it? AR deductions. Lone Star knows your name. You process our credits beautifully.');
    await narrate('Mari goes pale and says nothing.');
    await say('asher', 'Calder Ridge is putting together something rather special. Lone Star, Northfield, a snack company in Mexico. Call it Hearthstone. Four billion dollars, give or take. I’d like you on the diligence team, {first}. Name your number.');
    await K.gate('you', null, [
      'Is the brisket included?',
      'No, thank you. And I’ll be reading the Hearthstone S-1 very carefully, Simon.',
      'What does the diligence team pay?',
    ], 1, 'dlg.asher', async c => {
      if (c === 0) await say('asher', 'Everything is included. That’s rather the point. Ask again seriously.');
      else await say('asher', 'More than enough. But you’re asking to see what I’ll say, not because you want it. Try again.');
    });
    await say('asher', 'Then I’ll look forward to it.');
    await e.walkActor('asher', [['right', 9]]);
    e.removeActor('asher');
    await say('mari', 'He knows my name. Oh my God. He knows my name.');
    await say('mari', 'Go. Finish it. The release is in nineteen hours.');
    f.mari_met = true;
    G.save();
    await K.travel('hq', 12, 26, 'up');
    await narrate('2:10 AM. The war room. Lena is on speaker, and there are three empty cans of Voltline on the desk. You hate that it’s working.');
    K.refresh();
  }

  async function toFinale() {
    await text('Helen moved the committee meeting to 1 PM. Grant is bringing outside counsel. Kai is bringing a hoodie.');
    await K.sleep(700);
    await K.toChapter(5, { day: 'THURSDAY, APRIL 15, 2027 · 1:00 PM', title: '4:05 PM', text: 'The press release is drafted. The webcast is booked. Four hundred analysts are dialing in at 4:30.\n\nThe audit committee meets in The Reactor at one o’clock. Simon Asher has asked to attend "on behalf of a significant customer."' }, { map: 'hq', x: 17, y: 10, dir: 'up' });
  }

  async function hearing() {
    const f = F();
    if (!f.park_intro) {
      f.park_intro = true;
      await say('park', 'Thank you, {first}. We have three hours until this release goes out. I want to know whether it should.');
      await say('kai', 'It should. Our growth is the realest thing in this building.');
      await narrate('Rebut each claim by presenting the exhibit that contradicts it. Wrong exhibits cost credibility with the committee.');
    } else await say('park', 'Again, {first}. We’re running out of time.');
    const r = await G.hearing.start(HEARING);
    if (r === 'win') { f.hearing_done = true; G.save(); await ending(); }
    else { await text('Breathe. Helen gave you ten minutes. Press when you’re unsure — it’s free.'); K.refresh(); }
  }

  async function ending() {
    await K.ending({
      headline: '$222.7M', headlineLabel: 'Revenue restated',
      epilogue: [
        'At 3:40 PM, Voltline postponed its earnings release and filed an 8-K. Nasdaq halted the stock at 3:41. When it reopened Monday, VOLT was down 61%. Gray Fox covered most of its short at the open.',
        'The audit committee concluded that Q4 FY26 also included side-letter revenue, and Voltline filed an Item 4.02 non-reliance notice for FY26. The restatement took five months. Restated Q1 FY27 revenue: $432.3 million.',
        'Grant Whitaker was terminated for cause. The SEC charged him with securities fraud and the DOJ added obstruction for the 2:14 AM mailbox purge. Natalie Ford resigned, settled with the SEC without admitting or denying, and agreed to a five-year officer-and-director bar.',
        'Kai Ressler stayed on as CEO under a new chairman. He still wears the hoodie. He now ends every all-hands with "sell-through, not sell-in."',
        'Darnell Hughes was promoted to Director of Distribution. Mari Vega’s SEC whistleblower award was the largest in Texas that year. She bought a food truck. It sells kolaches.',
        'Lone Star Beverage Distributors returned $131 million of product and quietly replaced its chairman. Calder Ridge’s statement said Mr. Asher "had no knowledge of the arrangements in question."',
        'Two weeks later, Calder Ridge filed a confidential draft registration statement with the SEC for Hearthstone Brands Holdings, Inc.',
      ],
    });
  }

  // ================================================================ hearing
  const HEARING = {
    title: 'Special Meeting of the Audit Committee',
    place: 'THE REACTOR · THU 4/15 1:04 PM · RELEASE AT 4:05',
    objection: 'SELL-THROUGH!',
    credLabel: 'Credibility with the committee',
    reaction: 'Helen Park takes off her glasses.',
    rounds: [
      { who: 'kai', key: 'r1', evidence: ['ev_channel'], claim: 'Our growth is real. Record demand. Kids are drinking Voltline in all fifty states. The short sellers can’t stand it.', press: 'Thirty-eight percent. We’ve never missed. Not once.', wrong: 'Kai: "Bro, that doesn’t even— what is that?"',
        after: [['you', 'Distributors bought $655 million from Voltline in Q1. They sold $498 million to stores. The other $157 million is sitting in their warehouses. A third of the quarter shipped in the last week, and receivables doubled to 84 days.'], ['you', 'That’s not demand. That’s inventory you’ve parked at your customers.'], ['kai', '…Grant?']] },
      { who: 'grant', key: 'r2', evidence: ['ev_side', 'ev_letter'], claim: 'Our distributor agreements are standard. There are no side deals. Read the contracts.', press: 'Every distributor signs our master agreement. Net thirty. No returns except damaged product.', wrong: 'Grant: "That’s not a contract."',
        after: [['you', '"Anything you can’t move by June, send back for full credit. Payment when sold. This stays between us." Your email to Lone Star, March 24th. Then 180-day terms for Gulf Coast. And for Panhandle: "call it consignment."'], ['you', 'Payment contingent on resale plus unlimited returns is a consignment in substance. Control never transferred. That’s $131 million.'], ['grant', 'That email is out of context.']] },
      { who: 'grant', key: 'r3', evidence: ['ev_bnh', 'ev_darnell'], claim: 'The held pallets are bill-and-hold at Texas Premier’s written request. Fully compliant with ASC 606.', press: 'We have the customer’s letter. Check the file.', wrong: 'Grant: "And that changes bill-and-hold how?"',
        after: [['you', 'The "customer letter" is dated April 3rd — after the quarter — and the Word document’s author is GWHITAKER. The pallets were never segregated; your WMS reallocated them to Lone Star on April 2nd. And on Tuesday night you ordered them loaded onto a Lone Star truck.'], ['you', 'Three of the four bill-and-hold criteria fail. $46.2 million.']] },
      { who: 'natalie', key: 'r4', evidence: ['ev_credits'], claim: 'April credit memos are normal stock rotation. They relate to April activity, not Q1.', press: 'Credits always spike after a big quarter. It’s seasonal.', wrong: 'Natalie: "I don’t see the connection."',
        after: [['you', 'The credits say otherwise: "Q1 stock rotation," "Q1 short-dated returns," "Q1 price protection." Conditions that existed at March 31st are recognized subsequent events. $29.5 million, of which $7.5 million isn’t already captured in the side letters.'], ['natalie', '…I told him not to put it in writing.'], ['park', 'Natalie.']] },
      { who: 'asher', key: 'r5', evidence: ['ev_mdf', 'ev_letter'], claim: 'Lone Star earned every dollar of that marketing development money. And we paid our Voltline invoices on time. In cash.', press: 'Cash is the best evidence of a real sale, I’m told.', wrong: 'Asher: "I’m afraid I don’t follow your logic."',
        after: [['you', 'Voltline wired Lone Star $12 million on March 3rd. Lone Star wired back $12.4 million on March 5th, remittance text "MDF-0311." Then $14 million and $14.2 million. Then $12 million and $12.5 million. No proof of performance for any of it.'], ['you', 'That cash was Voltline’s own money taking a round trip. Consideration payable to a customer: it reduces revenue by $38 million.'], ['asher', 'Fascinating.'], ['you', 'And the Lone Star side letter is countersigned "S.A., Chairman."']] },
      { who: 'grant', key: 'r6', evidence: ['ev_purge'], claim: 'And for the record, I have never deleted a single business record. I’ve got nothing to hide.', press: 'You can have my laptop. Take it.', wrong: 'Grant: "What does that have to do with my email?"',
        after: [['you', 'Saturday, April 10th, 2:14 AM. Three thousand four hundred and twelve items hard-deleted from your mailbox, from your laptop, over VPN, from your home IP. Two days before the short report.'], ['you', 'Your mailbox has been under a litigation hold since February. Sam recovered every one of them.'], ['lam', 'Grant, stop talking. Right now.']] },
      { who: 'park', key: 'r7', evidence: ['ev_restate'], claim: '{last}, the release says Q1 revenue grew 37.9%. What is the real number?', press: 'Not a range. One number. Analysts will do math with it.', wrong: 'Park: "That isn’t a growth rate."',
        after: [['you', 'Side letters $131 million, bill-and-hold $46.2 million, incremental credits $7.5 million, round-tripped MDF $38 million. Total overstatement $222.7 million. Restated Q1 revenue is $432.3 million.'], ['you', 'Against $475 million a year ago, that’s a decline of nine percent.'], ['kai', '…Down?']] },
    ],
    async lose() {
      await say('park', 'I’m pausing this. {first}, I can’t ask this board to pull a release on exhibits that don’t match the claims.');
      await say('grant', 'Thank you, Helen. Maybe we can all get back to work.');
      await say('park', 'Ten minutes. Then we resume.');
    },
    async finale() {
      await say('park', 'The committee is postponing the earnings release. Grant, you’re placed on leave effective immediately. Richard, please preserve everything.');
      await narrate('Simon Asher leaves without a word. Grant follows his lawyer out. Kai Ressler sits alone at the head of the table, staring at the ticker on his phone.');
      await K.gate('kai', '{first}. It’s 2:51. What do I do?', [
        'Tell the truth before 4:05. Postpone the release, file the 8-K, self-report and cooperate. It’s the only version of this where Voltline survives.',
        'Fire Grant, release the numbers as reported, and fix it next quarter.',
        'Sell some shares before the news gets out. Protect yourself.',
      ], 0, 'hearing.r8', async c => {
        if (c === 1) await say('park', 'Absolutely not. Releasing numbers we know are false would make all of us part of it.');
        else await say('lam', 'Kai, that is insider trading. Do not touch your shares. Please don’t listen to— {first}, why would you say that?');
      });
      await say('kai', 'Okay. Okay. Draft the 8-K, Richard.');
    },
  };

  // ================================================================ talk
  const TALK = {
    async jules(ch, f) {
      if (!f.badge) {
        await say('jules', 'Welcome to Voltline! Are you here for the— oh, you’re the forensic person. Here’s your badge. Dr. Park is in The Reactor. That’s the boardroom. We name everything.');
        await say('jules', 'Want a Voltline? Original, Zero, Blue Razz, or Mango Riot?');
        f.badge = true; K.obtain('Visitor badge'); return;
      }
      await say('jules', ['The stock ticker is broken. Please don’t look at it.', 'Kai stood on my desk this morning. I had to re-sanitize it.', 'Everyone’s being weird. Weirder than usual.'][ch % 3]);
    },
    async park(ch, f) {
      if (ch === 0 && !f.met_park) {
        if (!f.badge) return say('park', 'Get a badge from Jules first, please. We’re being careful today.');
        await say('park', 'Helen Park. I chair the audit committee. Thank you for coming on no notice.');
        await say('park', 'Gray Fox says Voltline has been stuffing its distributors. Management says Gray Fox is lying to make money on a short. One of them is right.');
        await say('park', 'Our earnings release goes out Thursday at 4:05. I need to know by Thursday at one whether we can stand behind it. You report to me, not to management.');
        const c = await choose('you', null, ['What does management say about the short report?', 'Who should I be careful around?', 'I’ll have an answer by one.']);
        if (c === 0) await say('park', 'Grant says it’s summer inventory. Natalie says nothing. Kai says "haters."');
        else if (c === 1) await say('park', 'Officially, no one. Unofficially, our CRO has never lost an argument, and he’s never been asked to show his work.');
        else await say('park', 'Good. You have a war room downstairs. The glass one.');
        f.met_park = true; return;
      }
      await say('park', 'Thursday at one, {first}.');
    },
    async kai(ch, f) {
      if (ch === 1) { await say('kai', 'Yo! You’re the auditor! We love auditors. We love transparency. Voltline is transparency in a can.'); return say('kai', 'Ask Grant anything. Grant’s the best salesman I’ve ever met.'); }
      if (ch === 5) return say('kai', 'Let’s do this.');
    },
    async grant(ch, f) {
      const l = { 0: 'Busy, busy. Q1 was a monster. You’ll see.', 1: 'Heard you were in Legal. Making friends?', 3: 'Heard you went out to Round Rock last night. Dedication! Love it.', 5: 'Let’s get this over with.' };
      await say('grant', l[ch] || 'Hey.');
    },
    async natalie(ch, f) {
      const l = { 0: 'Natalie Ford, CFO. Whatever you need, go through my team. And {first}? Q1 is closed. The numbers are the numbers.', 1: 'I’m in close meetings all day.', 3: 'I hear you’ve been asking treasury for bank statements. Ben is very busy.', 5: '…' };
      await say('natalie', l[ch] || '…');
    },
    async owen(ch, f) {
      if (ch === 0 && f.phone_found && !f.got_data) {
        await say('owen', 'Owen. FP&A. Sell-in and sell-through? Yeah, I have both. Nobody ever asks for both.');
        await say('owen', 'Weekly shipments to distributors, and weekly depletions — what distributors sold to stores, from their own reports. Plus AR and weeks-of-supply. Here.');
        await narrate('He’s on his fourth can of Voltline. It is 10:20 AM.');
        await say('owen', 'Week thirteen’s gonna look weird. Week thirteen always looks weird. This year it looks… really weird.');
        f.got_data = true; K.obtain('Weekly sell-in, depletions, AR & weeks of supply'); return;
      }
      if (!f.phone_found) return say('owen', 'You’ll want to drop your stuff in your war room first. It’s downstairs. The glass one. Everything’s glass.');
      await say('owen', ['Want a Voltline? I have six.', 'Sell-through is the only number that doesn’t lie. I put that on a mug.', 'I’ve been asked to "refresh" my forecast four times this week.'][ch % 3]);
    },
    async lam(ch, f) {
      if (ch === 1 && !f.lam_ok) {
        await say('lam', 'Richard Lam. General Counsel. Helen tells me you want email. Whose?');
        await K.gate('you', null, [
          'Just forward me Grant’s inbox.',
          'A forensic collection of Grant Whitaker’s mailbox under the existing litigation hold, at the direction of the audit committee’s counsel, with chain of custody.',
          'If you don’t give it to me, I’ll tell the SEC Legal is obstructing.',
        ], 1, 'dlg.lam', async c => {
          if (c === 0) await say('lam', '"Forward." Absolutely not. You’d break privilege and chain of custody in one keystroke.');
          else await say('lam', 'Threats are a poor substitute for process. Try again.');
        });
        await say('lam', 'That I can authorize. Grant’s mailbox has been under hold since February for an unrelated distributor dispute. Sam in legal ops will run the collection.');
        f.lam_ok = true; return;
      }
      await say('lam', ch === 5 ? '…' : 'Everything goes through Sam. Everything.');
    },
    async sam(ch, f) {
      if (ch === 1 && f.lam_ok && !f.got_mail) {
        await say('sam', 'Sam Torres, legal ops. Richard called. I’m pulling Grant’s mailbox now…');
        await say('sam', 'Huh. That’s not good. Saturday at 2:14 AM, somebody hard-deleted three thousand four hundred and twelve items. From Grant’s laptop, over VPN, from his home IP.');
        await say('sam', 'He forgot about the litigation hold. Everything’s still in the preservation copy. Every single one. I’ve loaded them for you.');
        f.got_mail = true; K.addEvidence('ev_purge'); K.obtain('Grant Whitaker mailbox (recovered from hold)'); return;
      }
      await say('sam', 'Delete all you want. The hold remembers.');
    },
    async mari(ch, f) {
      if (ch === 3 && !f.got_cm) {
        await say('mari', 'Mari. AR deductions. You want the April credits?');
        await narrate('She glances toward Natalie’s office, then prints a listing without being asked twice.');
        await say('mari', 'Credit memos issued April 1st through 14th. Read the descriptions. They’re more honest than the coding.');
        f.got_cm = true; K.obtain('April credit memo listing'); return;
      }
      if (ch === 4 && !f.mari_met) return mariScene();
      if (ch === 5) return say('mari', 'Go get them.');
      await say('mari', ['Deductions are where the truth shows up last.', 'I just process what comes in.', 'Busy month.'][ch % 3]);
    },
    async ben(ch, f) {
      if (ch === 3 && done('wpCM') && !f.got_bank) {
        await say('ben', 'Ben Kaplan. Treasury. I’m… not really supposed to share bank statements. Natalie said—');
        await K.gate('you', null, [
          'Here’s the audit committee’s resolution authorizing full access for this investigation. You’re protected. I need March wire activity with remittance details.',
          'Natalie said it’s fine.',
          'Do you want to be the guy who hid the evidence?',
        ], 0, 'dlg.ben', async c => {
          if (c === 1) await say('ben', 'She didn’t. She said the opposite twenty minutes ago.');
          else await say('ben', 'I’m not hiding anything! I just— I need to keep my job.');
        });
        await say('ben', 'A board resolution. Okay. Okay, that’s real.');
        await say('ben', 'March outgoing and incoming wires, with the remittance text the banks pass through. The Lone Star ones are… you’ll see.');
        f.got_bank = true; K.obtain('March wire activity with remittance detail'); return;
      }
      await say('ben', 'Cash is the only account nobody can estimate.');
    },
    async rudy(ch, f) {
      if (!f.rudy_ok) {
        await say('rudy', 'Building’s closed. Who are you?');
        await narrate('You show the audit committee letter.');
        await say('rudy', 'Huh. Audit committee. Okay. Go ahead. Darnell’s in the office. There’s a Lone Star truck at dock 3 — first time I’ve seen one here past ten.');
        f.rudy_ok = true; return;
      }
      await say('rudy', 'Darnell’s in the glass office. Dock 3’s that way.');
    },
    async driver(ch, f) {
      await say('driver', 'I got a pickup for Lone Star. Forty pallets. Paperwork’s on the table there. I don’t ask questions at eleven at night.');
    },
    async darnell(ch, f) {
      if (!f.darnell_flipped) {
        if (!f.saw_bol) return say('darnell', 'Can I help you? We’re closed. Kind of.');
        return darnellScene();
      }
      await say('darnell', 'My computer’s yours. Do what you need to do.');
    },
    async lena(ch, f) { await say('lena', 'Seven claims. Seven exhibits. Don’t get cute.'); },
    async asher(ch, f) { await say('asher', 'Good afternoon, {first}. I’m only here as a customer.'); },
  };

  // ================================================================ objects
  const FLAVOR = {
    neon_logo: 'VOLTLINE, in neon green, buzzing faintly.',
    reception: 'A reception desk with a bowl of Voltline cans on ice. A sticky note: "DON’T LOOK AT THE TICKER."',
    lobby_cooler: 'A glass-door cooler full of Voltline. Every flavor. Every can facing forward.',
    lobby_couch: 'A beanbag the size of a sedan.',
    ticker: 'VOLT — $41.18 — −22.4%. Someone has drawn a frowny face on a sticky note and put it on the screen.',
    b_table: 'A long table made of a single slab of reclaimed wood. Every chair is a different color.',
    b_screen: 'A slide titled "Q1: CHARGED UP." Revenue +37.9%.',
    n_desk: 'Natalie’s desk: a draft earnings release with tracked changes. One comment, in red: "Remove ‘channel inventory’ language — GW."',
    n_pc: 'Locked.',
    n_files: 'Quarterly close binders. Q1 is missing.',
    g_desk: 'Grant’s desk: a framed photo of Grant holding a giant novelty check, a signed football, and a printed email: "Q1 = 655. Find it."',
    g_pc: 'Locked. Grant’s screensaver is a slideshow of Grant.',
    g_trophies: 'Sales trophies. "PRESIDENT’S CLUB" eight years running. "CLOSER OF THE YEAR."',
    g_neon: 'A neon sign: CLOSE.',
    g_fridge: 'A personal Voltline fridge. Of course.',
    l_desk: 'Litigation hold notices, color-coded.',
    l_pc: 'Locked. Lam’s wallpaper is the Federal Rules of Civil Procedure.',
    l_shelf: 'Law books. The SOX tab is worn soft.',
    l_files: 'Locked. Labeled "HOLDS — ACTIVE."',
    cooler: 'Water. The only thing in this building that isn’t caffeinated.',
    fpa_pc: 'An FP&A workstation running a model named "Q1_bridge_v47_FINAL_final_GW.xlsx."',
    fpa_board: 'Whiteboard: "SELL-IN ≠ SELL-THROUGH." Underlined. Signed with a little lightning bolt.',
    ar_pc: 'A deductions workstation. The queue says 1,204 open items.',
    ar_files: 'Deduction backup by customer. Lone Star’s folder is fat.',
    ar_sign: 'DEDUCTIONS: Where Revenue Comes To Die.',
    kombucha: 'Four kombucha taps: Ginger, Hibiscus, Blue Razz, and "Kai’s Special." You don’t ask.',
    kitchen_cooler: 'More Voltline.',
    kitchen_table: 'Somebody’s left a Gray Fox report on the table, highlighted.',
    vending: 'A vending machine that only sells Voltline.',
    servers: 'Legal ops’ preservation servers. Nothing on them can be deleted.',
    sam_pc: 'A review platform: Grant’s mailbox, 41,000 items, sorted by date.',
    hold_files: 'Litigation hold acknowledgments. Grant’s is signed and dated February 2nd.',
    ben_desk: 'Wire confirmations in a neat stack.',
    ben_pc: 'Online banking. Two-factor tokens lined up like dominoes.',
    treasury_files: 'Bank statements, by account, by month.',
    war_desk: 'Your desk. Credit cards, sell-through charts, and a growing pile of empty cans.',
    swag: 'A Voltline welcome bag: hoodie, stickers, socks, a can koozie.',
    studio: 'The "Voltline Volts" podcast studio. Episode 112: "Why We Never Miss."',
    lounge_couch: 'A lounge couch shaped like a lightning bolt.',
    pool: 'A ping-pong table. Someone has written "GW 21 – 0" on the net.',
    lounge_cooler: 'Voltline, again.',
    records: 'Contract files. Every distributor master agreement says the same thing: net 30, no returns.',
    dock: 'A dock door, rolled up. Warm night air coming in.',
    rack: 'Voltline cases stacked to the top beam.',
    staged: 'Pallets staged at dock 3, tagged "SOLD – HOLD – TEXAS PREMIER." Being loaded onto a Lone Star truck.',
    forklift: 'A forklift, beeping as it reverses.',
    dc_desk: 'Darnell’s desk: a hard hat, a radio, and a printed WMS reallocation report dated April 2nd.',
    dc_files: 'Bills of lading, by date.',
    dc_cooler: 'Water cooler. Darnell’s mug says "WORLD’S OKAYEST DAD."',
    guard_desk: 'Rudy’s logbook. "23:02 — LONE STAR TRUCK, DOCK 3, PER G.W."',
    guard_pc: 'Camera feeds: docks 1 through 5.',
    dc_board: 'Whiteboard: "AUDITORS THURS — CLEAN UP HOLD AREA."',
    picnic: 'A picnic table, sticky with barbecue sauce.',
    black_car: 'A black sedan with Illinois plates. A private-aviation tag hangs from the mirror.',
  };

  async function use(id, ch, f) {
    if (id === 'war_pc') { await usePC(); return true; }
    if (id === 'swag') {
      if (!f.met_park) { await narrate('A Voltline welcome bag. Check in with Dr. Park first.'); return true; }
      if (f.phone_found) { await narrate('Hoodie, stickers, socks. You’re wearing the socks now. You’re not proud of it.'); return true; }
      await narrate('A Voltline welcome bag: hoodie, stickers, socks… and a can koozie with something heavy inside. A cheap prepaid phone, wrapped in a sticky note.');
      await narrate('*"Grant’s numbers are sell-in. Ask about sell-through. — S"*');
      f.phone_found = true;
      K.addEvidence('ev_koozie');
      G.ui.updateHud();
      await K.sleep(600);
      await text('Hi. You don’t know me. I work here. I can’t talk to you in the building.');
      await text('Gray Fox is right, mostly. I can’t prove it. You can. Ask Owen for sell-through. Nobody ever does.');
      await text('If you get stuck I’ll nudge. If you get really stuck I’ll just tell you.');
      await narrate(G.touch ? '(Tap *Phone* at the top of the screen to read messages, and *Case File* to review your evidence.)' : '(Press *P* to read the phone. Press *J* to open your case file.)');
      return true;
    }
    if (id === 'hold1' || id === 'hold2' || id === 'hold3') {
      const t = {
        hold1: 'A pallet in general stock, aisle 3, tagged "SOLD – HOLD – TEXAS PREMIER – 3/31." Half the cases have been picked off the top. The pick ticket stapled to it is for a Big Sky Distributors order dated April 6th.',
        hold2: 'Another "HOLD" pallet, sitting in a regular pick location between two untagged pallets of the same SKU. No fencing, no separate zone, no customer markings.',
        hold3: 'A "HOLD" tag, freshly applied — the adhesive is still tacky. The WMS label underneath reads "ALLOC: LONE STAR 4/2."',
      };
      await narrate(t[id]);
      if (ch === 2) { f[id] = true; K.refresh(); }
      return true;
    }
    if (id === 'ls_bol') {
      await narrate('A Lone Star bill of lading on a clipboard, dated tonight: *40 pallets, Texas Premier "held" product, consignee Lone Star Beverage Distributors, Fort Worth.* Authorized: "G.W. — transfer."');
      if (ch === 2) { f.saw_bol = true; K.refresh(); }
      return true;
    }
    if (id === 'dc_pc') {
      if (ch === 2 && f.darnell_flipped) { await K.runPuzzle('wpBH'); return true; }
      await narrate('Darnell’s WMS terminal. You’ll want his permission.');
      return true;
    }
    return false;
  }

  async function usePC() {
    const f = F(), ch = S().chapter;
    if (ch === 0) { if (!f.got_data) return narrate('You need Owen’s sell-in and sell-through data first.'); return K.runPuzzle('wpCH'); }
    if (ch === 1) { if (!f.got_mail) return narrate('You need Grant’s email. Legal controls that.'); return K.runPuzzle('wpSL'); }
    if (ch === 3) {
      if (!f.got_cm) return narrate('You need the April credit memo listing.');
      if (!done('wpCM')) return K.runPuzzle('wpCM');
      if (!f.got_bank) return narrate('You need treasury’s March wire activity.');
      return K.runPuzzle('wpMDF');
    }
    if (ch === 4) return K.runPuzzle('wpRS');
    return narrate('Everything is in the case file.');
  }

  function onStep(x, y, s) {
    const f = s.flags;
    if (s.map === 'hq' && s.chapter === 5 && !f.hearing_done && !f.park_intro && x >= 12 && x <= 22 && y <= 8) E().script(hearing);
  }

  // ================================================================ workpapers
  const WEEKS = Array.from({ length: 13 }, (_, i) => i + 1);
  const SELLIN = [34, 36, 35, 37, 38, 36, 35, 37, 38, 39, 38, 38, 214];
  const SELLTHRU = [37, 38, 38, 39, 38, 39, 38, 38, 39, 38, 38, 39, 39];
  const defs = {};

  defs.wpCH = {
    ref: 'WP V-1 · REVENUE ANALYTICS',
    title: 'Sell-In vs. Sell-Through, Q1 FY27',
    intro: 'Shipments are what we send. Depletions are what people buy. Watch the last week.',
    header() {
      let h = '<div class="wp-meta"><span>Entity: <b>Voltline Beverage Co.</b></span><span>Source: <b>FP&A (O. Reilly): shipments, distributor depletion reports, AR aging</b></span><span>$ in millions</span></div>';
      h += '<h4>Weekly shipments to distributors vs. distributor depletions</h4><div class="chart-card"><canvas id="sellin"></canvas></div>';
      h += '<div class="tbl-wrap"><table class="ledger"><tr><th></th><th class="num">Q1 FY26</th><th class="num">Q1 FY27</th></tr>' +
        '<tr><td>Net revenue (sell-in)</td><td class="num">475.0</td><td class="num">655.0</td></tr>' +
        '<tr><td>Distributor depletions (sell-through)</td><td class="num">471.2</td><td class="num">498.0</td></tr>' +
        '<tr><td>Accounts receivable, 3/31</td><td class="num">216.4</td><td class="num">612.0</td></tr>' +
        '<tr><td>DSO (days)</td><td class="num">41.0</td><td class="num"><b style="color:#b8312f">?</b></td></tr>' +
        '<tr><td>Distributor weeks of supply, 3/31</td><td class="num">3.1</td><td class="num">7.2</td></tr>' +
        '<tr><td>Week-13 shipments as % of quarter</td><td class="num">8.4%</td><td class="num">32.7%</td></tr></table></div>';
      h += '<div class="wp-note">Grant Whitaker, Q4 call: "Distributors are building inventory ahead of summer." Prior five years: Q1 weeks-of-supply ranged 2.8–3.4.</div>';
      return h;
    },
    afterHeader(body) {
      multiLine(body.querySelector('#sellin'), WEEKS.map(w => 'W' + w), [
        { label: 'Sell-in (shipments)', color: '#1f3a2e', data: SELLIN },
        { label: 'Sell-through (depletions)', color: '#c94a3a', data: SELLTHRU, dash: true },
      ], { h: 220 });
    },
    steps: [
      num('dso', 'Compute Q1 FY27 days sales outstanding (90-day quarter).', {
        answerText: '84.1', placeholder: 'days', suffix: 'days',
        check(v) { if (Math.abs(v - 84.1) <= 0.1) return true; if (Math.abs(v - 41.0) <= 0.1) return 'That’s last year.'; return 'Doesn’t tie. AR ÷ revenue × 90.'; },
      }, { okMsg: '612 ÷ 655 × 90 = <b>84.1 days</b>, double last year. Customers aren’t paying for what they’re "buying."' }),
      num('build', 'How much inventory did Voltline build in its distributors’ warehouses in Q1? (sell-in minus sell-through, $M)', {
        answerText: '157', placeholder: '$M', suffix: '$M',
        check(v) { v = M(v); if (Math.abs(v - 157) <= 0.5) return true; if (Math.abs(v - 175) <= 0.5) return 'Check the subtraction: 655 − 498.'; return 'Doesn’t tie. Total shipments − total depletions.'; },
      }, { okMsg: '$655M shipped, $498M sold through: <b>$157M</b> of energy drinks parked at distributors, 7.2 weeks of supply against a five-year range of 2.8–3.4.' }),
      mc('why', 'Shipments spike in week 13, sell-through stays flat, DSO doubles, and weeks of supply more than double. What’s the most likely explanation?', [
        { t: 'Seasonal pre-build ahead of summer, as management says.', ok: false, why: 'Five prior Q1s never exceeded 3.4 weeks of supply. And a genuine pre-build gets paid for on normal terms — DSO wouldn’t double.' },
        { t: 'Channel stuffing: revenue pulled forward by pushing product on distributors near quarter-end, likely with concessions (extended terms, return rights) that explain why they aren’t paying.', ok: true, why: 'The trifecta: quarter-end shipment spike, sell-through flat, receivables ballooning. Distributors don’t take 7 weeks of inventory on net-30 terms unless something else was promised.' },
        { t: 'A change in distributor reporting that understates depletions.', ok: false, why: 'Depletions tie to retailer scan data within 1%. And reporting changes don’t move DSO.' },
        { t: 'Price increases recorded in revenue before shipment.', ok: false, why: 'Prices didn’t change in Q1, and the spike is in units, not price.' },
      ]),
    ],
    conclusion: '$157M of product pushed into the channel in Q1, a third of it in the final week. Distributors aren’t paying for it. Somebody promised them something.',
  };

  const MAILS = [
    ['3/24 22:41', 'G. Whitaker → Lone Star (cc: S. Asher)', '"Take the extra 40 trucks. Anything you can’t move by June, send back for full credit. Pay us when it sells. This stays between us."', true],
    ['3/27 19:05', 'G. Whitaker → Gulf Coast Beverage', '"Do the $31M and we’ll go 180 days instead of 30. We’ll cover your outside storage too. Invoice says net 30 — ignore it."', true],
    ['3/29 23:58', 'G. Whitaker → Panhandle Distributing', '"Your $12M order is approved. We won’t chase payment until you’ve sold through. If it doesn’t move, we’ll call it consignment."', true],
    ['3/20 08:12', 'G. Whitaker → Sales team', '"Q1 number is 655. Find it. No excuses."', false, 'Pressure, not a customer agreement. It’s motive, and it’s ugly, but it doesn’t change any distributor’s terms.'],
    ['3/30 21:30', 'N. Ford → G. Whitaker', '"Make sure nothing about returns is in writing."', false, 'Damning — but it’s internal. It’s evidence of intent and concealment, not a term agreed with a customer.'],
    ['2/10 10:15', 'G. Whitaker → Lone Star', '"Attached: Q1 promotional price list, standard terms."', false, 'Standard terms on a standard price list. Nothing modified.'],
    ['3/28 14:02', 'G. Whitaker → Big Sky Distributors', '"Standard order, standard terms. Thanks for the growth."', false, 'Standard terms. Big Sky paid in 28 days.'],
  ];
  defs.wpSL = {
    ref: 'WP V-2 · CONTRACT TERMS & SIDE AGREEMENTS',
    title: 'Grant Whitaker Mailbox — Targeted Review',
    intro: 'Read what he promised. Not what the contract says.',
    header() {
      return '<div class="wp-meta"><span>Source: <b>G. Whitaker mailbox, recovered from litigation hold (S. Torres)</b></span><span>Search terms: return*, consign*, "between us", terms, 180</span></div>' +
        '<div class="wp-note">Master distributor agreement (all distributors): net 30; returns limited to damaged product; no consignment. Q1 shipments: Lone Star $88.0M, Gulf Coast $31.0M, Panhandle $12.0M, Big Sky $41.5M.</div>';
    },
    steps: [
      multiPick('letters', 'Select every email that is a side agreement modifying a customer’s contract terms.', [
        { t: 'Sent' }, { t: 'From → To' }, { t: 'Excerpt', wrap: 1 },
      ], MAILS.map(r => ({ ok: r[3], why: r[4], cells: [r[0], r[1], r[2]] })), { okMsg: 'Lone Star: unlimited returns and pay-when-sold. Gulf Coast: 180-day terms plus free storage. Panhandle: no payment until sell-through. Three side letters, all in the last week of the quarter.' }),
      mc('acct', 'Under ASC 606, what’s the effect of those side agreements on Q1 revenue for the related shipments?', [
        { t: 'Recognize revenue and record a returns reserve based on historical return rates.', ok: false, why: 'Historical rates are meaningless when the customer can send back everything it doesn’t sell and doesn’t have to pay until it does.' },
        { t: 'The arrangements are consignments in substance: payment is contingent on resale and the distributor can return unsold product, so control hasn’t transferred (ASC 606-10-55-79/80). No revenue until sell-through.', ok: true, why: 'Consignment indicators: the seller controls the product until a specified event (resale), and the dealer has no unconditional obligation to pay. Control stays with Voltline.' },
        { t: 'Recognize the revenue, but extend the receivable’s due date in the aging.', ok: false, why: 'The terms aren’t just extended — payment depends on resale. That’s about control, not aging.' },
        { t: 'No effect — the signed master agreement governs over emails.', ok: false, why: 'ASC 606 looks at the substance of the enforceable arrangement, including side agreements that create rights and obligations.' },
      ]),
      num('amount', 'How much Q1 revenue must be reversed for the side-letter shipments? ($M)', {
        answerText: '131.0', placeholder: '$M', suffix: '$M',
        check(v) { v = M(v); if (Math.abs(v - 131) <= 0.05) return true; if (Math.abs(v - 172.5) <= 0.05) return 'Big Sky got standard terms. Leave it out.'; return 'Doesn’t tie. Sum the Q1 shipments to the three side-letter distributors.'; },
      }, { okMsg: '$88.0M + $31.0M + $12.0M = <b>$131.0M</b>.' }),
    ],
    conclusion: 'Three distributors were promised return rights and pay-when-sold terms. $131M of Q1 revenue is consignment in disguise.',
  };

  const BH = [['BH-0331-1', 9.1], ['BH-0331-2', 8.4], ['BH-0331-3', 7.7], ['BH-0331-4', 6.9], ['BH-0331-5', 7.3], ['BH-0331-6', 6.8]];
  defs.wpBH = {
    ref: 'WP V-3 · BILL-AND-HOLD (ASC 606-10-55-81 TO 55-84)',
    title: 'Texas Premier Distributing — Bill-and-Hold Invoices, 3/31/2027',
    intro: 'Four criteria. You saw the pallets yourself.',
    header() {
      let h = '<div class="wp-meta"><span>Source: <b>Invoice register; WMS (D. Hughes); document metadata</b></span><span>$ in millions</span></div>';
      h += '<div class="tbl-wrap"><table class="ledger"><tr><th>Invoice</th><th>Customer</th><th>Date</th><th class="num">Amount</th><th>Status</th></tr>' + BH.map(b => '<tr><td>' + b[0] + '</td><td>Texas Premier Distributing</td><td>03/31/2027</td><td class="num">' + b[1].toFixed(1) + '</td><td>Held at Round Rock</td></tr>').join('') + '</table></div>';
      h += '<div class="wp-exhibit"><b>"Customer request" letter</b> — dated 04/03/2027, on Texas Premier letterhead, requesting Voltline hold product "until warehouse space is available." File metadata: Author <b>GWHITAKER</b>; created 04/03/2027 08:14; emailed by G. Whitaker to D. Hughes.</div>';
      h += '<div class="wp-exhibit"><b>WMS & your observation (4/13, 10:52 PM):</b> "HOLD" pallets in general pick locations, not segregated; partially picked for other customers; WMS reallocation to Lone Star dated 04/02; 40 pallets staged and being loaded onto a Lone Star truck under BOL authorized "G.W. — transfer." Product is finished goods, ready to ship.</div>';
      return h;
    },
    steps: [
      criteria('crit', 'Evaluate each ASC 606-10-55-83 criterion for these invoices.', [
        { t: 'The reason for the arrangement is substantive (for example, the customer requested it).', met: false, why: 'The "request" is dated after quarter-end and was written by Voltline’s own CRO. A request manufactured by the seller isn’t substantive.' },
        { t: 'The product has been identified separately as belonging to the customer.', met: false, why: 'The pallets sat in general pick locations, were picked for other orders, and carried tags applied after the fact.' },
        { t: 'The product is currently ready for physical transfer to the customer.', met: true, why: 'It’s finished goods sitting on pallets — this one really is met.' },
        { t: 'The entity cannot use the product or direct it to another customer.', met: false, why: 'Voltline did exactly that: reallocated to Lone Star on 4/2, picked for Big Sky on 4/6, and loading onto a Lone Star truck on 4/13.' },
      ], { okMsg: 'Three of four criteria fail. All four must be met. These aren’t bill-and-hold sales; they’re inventory with invoices attached.' }),
      num('amount', 'Q1 revenue to reverse for the Texas Premier bill-and-hold invoices? ($M)', {
        answerText: '46.2', placeholder: '$M', suffix: '$M',
        check(v) { v = M(v); if (Math.abs(v - 46.2) <= 0.05) return true; return 'Doesn’t tie. Sum the six invoices.'; },
      }, { okMsg: '<b>$46.2M</b>.' }),
      mc('entry', 'Which correcting entries are required at 3/31?', [
        { t: 'Dr Revenue / Cr Accounts receivable $46.2M; Dr Inventory / Cr Cost of sales at cost — the product never left Voltline’s control.', ok: true, why: 'Undo the sale and the receivable, and put the product back on the balance sheet at cost.' },
        { t: 'Dr Revenue / Cr Deferred revenue $46.2M; leave cost of sales as recorded.', ok: false, why: 'Deferred revenue implies a contract liability for consideration received or due. Nothing was due; and leaving COGS would understate inventory.' },
        { t: 'Dr Bad debt expense / Cr Allowance for doubtful accounts $46.2M.', ok: false, why: 'This isn’t a credit problem. The sale never happened.' },
        { t: 'No entry — disclose the arrangement in the notes.', ok: false, why: 'Disclosure doesn’t cure recognizing revenue that fails the criteria.' },
      ]),
    ],
    conclusion: 'The bill-and-hold fails three of four criteria. $46.2M of revenue reverses; the pallets go back into Voltline’s inventory — the ones that weren’t already shipped to someone else.',
  };

  const CMS = [
    ['CM-4401', 'Lone Star', '04/02', 'Q1 stock rotation return — per side agreement 3/24', 14.0, true],
    ['CM-4402', 'Gulf Coast', '04/05', 'Q1 pricing adjustment — per GW', 8.0, true],
    ['CM-4405', 'Big Sky', '04/06', 'Q1 short-dated product return (best-by 4/30)', 5.0, true],
    ['CM-4409', 'Rio Grande Dist.', '04/08', 'Q1 promotional price protection', 2.5, true],
    ['CM-4414', 'Coastal Bend Bev.', '04/12', 'Warehouse flooded 4/10 (hurricane) — product destroyed', 1.8, false, 'The flood happened on April 10th. That’s a new condition after the balance sheet date — nonrecognized.'],
    ['CM-4416', 'Big Sky', '04/13', 'April promotional allowance (new April program)', 0.9, false, 'This relates to an April program and April sales. Not a Q1 condition.'],
  ];
  defs.wpCM = {
    ref: 'WP V-4 · SUBSEQUENT EVENTS (ASC 855) & VARIABLE CONSIDERATION',
    title: 'April Credit Memos — Do They Belong to Q1?',
    intro: 'Read the descriptions. They’re more honest than the coding.',
    header() {
      return '<div class="wp-meta"><span>Source: <b>AR subledger credit memos 4/1–4/14 (AR deductions)</b></span><span>All coded to April by instruction of G. Whitaker</span><span>$ in millions</span></div>';
    },
    steps: [
      multiPick('q1', 'Select every credit memo that is a recognized subsequent event reducing Q1 revenue (the condition existed at 3/31).', [
        { t: 'Credit memo' }, { t: 'Customer' }, { t: 'Date' }, { t: 'Description', wrap: 1 }, { t: '$M', num: 1 },
      ], CMS.map(r => ({ ok: r[5], why: r[6], cells: [r[0], r[1], r[2], r[3], r[4].toFixed(1)] })), { okMsg: 'Four credits, <b>$29.5M</b>, arise from Q1 sales and Q1 promises. Coding them to April doesn’t change when the obligation arose.' }),
      mc('hurricane', 'How should the Coastal Bend hurricane credit (event 4/10) be treated?', [
        { t: 'Recognized subsequent event: adjust Q1 revenue.', ok: false, why: 'Recognized subsequent events provide evidence about conditions that existed at the balance sheet date. The flood didn’t exist on March 31st.' },
        { t: 'Nonrecognized subsequent event: no Q1 adjustment; disclose the nature and estimated effect if material (ASC 855-10-50-2).', ok: true, why: 'A new condition arising after the balance sheet date. Disclose if material; don’t adjust.' },
        { t: 'Recognize it in Q1 because the product was sold in Q1.', ok: false, why: 'The sale was fine. The loss is a new event.' },
        { t: 'Ignore it entirely.', ok: false, why: 'Nonrecognized doesn’t mean ignored — evaluate disclosure.' },
      ]),
      num('incr', '$22.0M of the Q1 credits (CM-4401 and CM-4402) relate to side-letter shipments already reversed in WP V-2. What additional Q1 revenue reduction do the credits require? ($M)', {
        answerText: '7.5', placeholder: '$M', suffix: '$M',
        check(v) { v = M(v); if (Math.abs(v - 7.5) <= 0.05) return true; if (Math.abs(v - 29.5) <= 0.05) return 'That would double count the $22.0M you already reversed with the side letters.'; if (Math.abs(v - 9.3) <= 0.05) return 'The hurricane credit doesn’t belong in Q1.'; return 'Doesn’t tie. Q1 credits minus the overlap.'; },
      }, { okMsg: '$29.5M − $22.0M = <b>$7.5M</b> incremental. Never count the same dollar twice in a restatement.' }),
    ],
    conclusion: '$29.5M of April credits belong to Q1; $7.5M is new reduction beyond the side letters.',
  };

  const WIRES = [
    ['MDF-0311', '03/03', 'Lone Star', 12.0, '"Spring Shelf Blitz" — no proof of performance', '03/05 Lone Star → Voltline $12.4M, ref "MDF-0311 / INV 88213"', true],
    ['MDF-0318', '03/17', 'Lone Star', 14.0, '"Final Four activation" — no proof of performance', '03/19 Lone Star → Voltline $14.2M, ref "MDF-0318"', true],
    ['MDF-0322', '03/27', 'Lone Star', 12.0, '"Q1 velocity program" — no proof of performance', '03/30 Lone Star → Voltline $12.5M, ref "MDF 0322 PMT"', true],
    ['MDF-0307', '03/12', 'Big Sky', 1.1, 'In-store displays — 412 store photos, retailer sign-offs', '03/08 Big Sky → Voltline $4.0M, ref "INV 88102, 88140"', false, 'Big Sky’s MDF has proof of performance at fair value, and its payment preceded the MDF and references ordinary invoices. Legitimate.'],
  ];
  defs.wpMDF = {
    ref: 'WP V-5 · CASH TRACING & CONSIDERATION PAYABLE TO A CUSTOMER',
    title: 'Marketing Development Funds — March 2027',
    intro: 'Follow the money out. Then watch it come back.',
    header() {
      return '<div class="wp-meta"><span>Source: <b>Treasury wire activity with remittance detail (B. Kaplan)</b></span><span>$ in millions</span></div>' +
        '<div class="wp-note">MDF policy: payments require a signed program agreement and proof of performance (photos, retailer confirmations) before release. All three Lone Star payments were approved by G. Whitaker under "CRO discretionary authority."</div>';
    },
    steps: [
      multiPick('pairs', 'Select every MDF payment that round-tripped back to Voltline as a customer "collection."', [
        { t: 'MDF #' }, { t: 'Paid' }, { t: 'To' }, { t: '$M', num: 1 }, { t: 'Program / support', wrap: 1 }, { t: 'Related inflow', wrap: 1 },
      ], WIRES.map(r => ({ ok: r[6], why: r[7], cells: [r[0], r[1], r[2], r[3].toFixed(1), r[4], r[5]] })), { okMsg: 'Each Lone Star MDF payment came back within 48 hours, for roughly the same amount, with remittance text naming the MDF. Lone Star "paid" its receivable with Voltline’s own money.' }),
      num('total', 'Total MDF round-tripped through Lone Star in March? ($M)', {
        answerText: '38.0', placeholder: '$M', suffix: '$M',
        check(v) {
          v = M(v);
          if (Math.abs(v - 38) <= 0.05) return true;
          if (Math.abs(v - 39.1) <= 0.05) return 'That\u2019s either the inflows or includes Big Sky\u2019s legitimate MDF. Sum the outbound Lone Star MDF payments.';
          return 'Doesn\u2019t tie. Sum the outbound MDF payments you selected.';
        },
      }, { okMsg: '$12.0M + $14.0M + $12.0M = <b>$38.0M</b>.' }),
      mc('acct', 'How should the $38.0M be accounted for?', [
        { t: 'As marketing expense (SG&A) — MDF is a promotional cost.', ok: false, why: 'Only if Voltline received a distinct good or service at fair value. No proof of performance, no distinct service.' },
        { t: 'As consideration payable to a customer: a reduction of revenue (ASC 606-10-32-25). The inflows are Voltline’s own cash returning, not evidence of collection — the related sales lack substance.', ok: true, why: 'Paying a customer with no distinct service in return is a price reduction. When the customer immediately sends the money back as "payment," the cycle manufactures both revenue and collections.' },
        { t: 'As a prepaid asset amortized over the summer selling season.', ok: false, why: 'There’s no future service to receive. The money already came back.' },
        { t: 'Net the inflows against the outflows and ignore both.', ok: false, why: 'Netting hides the problem: the revenue those "collections" supported still needs to come out.' },
      ]),
    ],
    conclusion: '$38M of Voltline cash left as "marketing" and came back as "collections." Lone Star’s chairman is Simon Asher.',
  };

  defs.wpRS = {
    ref: 'WP V-6 · RESTATEMENT & DISCLOSURE',
    title: 'Q1 FY27 Revenue — Restatement Waterfall',
    intro: 'One number for Helen. Then decide what happens at 4:05.',
    header() {
      return '<div class="wp-meta"><span>$ in millions</span><span>Reported Q1 FY27 revenue: <b>655.0</b></span><span>Q1 FY26 revenue: <b>475.0</b></span><span>Earnings release scheduled: <b>Thu 4:05 PM ET</b></span></div>' +
        '<div class="tbl-wrap"><table class="ledger"><tr><th>Workpaper</th><th>Adjustment</th><th class="num">$M</th></tr>' +
        '<tr><td>V-2</td><td>Side-letter shipments (consignment in substance)</td><td class="num">131.0</td></tr>' +
        '<tr><td>V-3</td><td>Failed bill-and-hold</td><td class="num">46.2</td></tr>' +
        '<tr><td>V-4</td><td>April credits for Q1 conditions ($29.5M, of which $22.0M overlaps V-2)</td><td class="num">?</td></tr>' +
        '<tr><td>V-5</td><td>MDF consideration payable to customer</td><td class="num">38.0</td></tr></table></div>' +
        '<div class="wp-note">Your review of Q4 FY26 shows two smaller side letters (Lone Star, Panhandle) in December 2026. FY26 10-K was filed in February.</div>';
    },
    steps: [
      num('total', 'Total Q1 FY27 revenue overstatement? ($M)', {
        answerText: '222.7', placeholder: '$M', suffix: '$M',
        check(v) { v = M(v); if (Math.abs(v - 222.7) <= 0.05) return true; if (Math.abs(v - 244.7) <= 0.05) return 'You’ve double counted the $22.0M of credits already reversed with the side letters.'; if (Math.abs(v - 215.2) <= 0.05) return 'Include the incremental $7.5M of credits.'; return 'Doesn’t tie. 131.0 + 46.2 + incremental credits + 38.0.'; },
      }, { okMsg: '<b>$222.7M</b> — 34% of reported Q1 revenue.' }),
      num('growth', 'Restated Q1 FY27 revenue growth vs. Q1 FY26, in percent?', {
        answerText: '−9.0%', placeholder: '%', suffix: '%',
        check(v) { if (Math.abs(v + 9.0) <= 0.15) return true; if (Math.abs(v - 9.0) <= 0.15) return 'Check the sign: restated revenue is below last year.'; if (Math.abs(v - 37.9) <= 0.15) return 'That’s the reported growth.'; if (Math.abs(v + 0.09) <= 0.002) return 'Express it as a percent, e.g. −9.0.'; return 'Doesn’t tie. (655.0 − 222.7) ÷ 475.0 − 1.'; },
      }, { okMsg: '$432.3M vs. $475.0M: <b>−9.0%</b>. Eleven quarters of 30% growth end in a decline.' }),
      mc('disclose', 'It’s 1:00 PM. What should the audit committee direct?', [
        { t: 'Release as scheduled with a footnote that results are "subject to ongoing review."', ok: false, why: 'Releasing numbers you know are materially false, with a hedge, is still releasing materially false numbers.' },
        { t: 'Brief the five largest institutional holders privately first, then release.', ok: false, why: 'That’s selective disclosure of material nonpublic information — a Regulation FD violation.' },
        { t: 'Postpone the release. Because Q4 FY26 shows the same pattern, evaluate whether previously issued statements can still be relied upon; if not, file an 8-K under Item 4.02 within four business days of that conclusion. Disclose publicly, not selectively.', ok: true, why: 'Stop the false release, assess non-reliance for the FY26 10-K, and make any disclosure broadly under Reg FD.' },
        { t: 'Release as scheduled and correct it in the 10-Q next month.', ok: false, why: 'Knowingly releasing false results and fixing them later is how CFOs become defendants.' },
      ]),
    ],
    conclusion: 'Q1 revenue is overstated by $222.7M. Restated growth: −9.0%. The release cannot go out.',
  };

  // ================================================================ register
  const def = {
    chapters: CHAPTERS, evidence: EV, clock, location, objective, npcPos,
    newGame, beats, talk: TALK, use, flavor: FLAVOR, onStep, ending,
  };
  G.registerEpisode({
    id: 'ep3', num: 3,
    title: 'Sell-In',
    subtitle: 'Voltline Beverage · energy drinks, Austin · Channel stuffing, side letters and a round-trip, three days before earnings.',
    chapters: CHAPTERS,
    contact: { name: 'SIDELETTER', avatar: 'S', sub: 'unknown number · disappearing messages on', color: '#c6f040' },
    frustrated: 'You’re rushing. Read the descriptions, the dates and the metadata. That’s where Grant always slips.',
    ranks: ['Partner Track', 'Forensic Director', 'Senior Investigator', 'SIDELETTER Wrote the Report'],
    start: { map: 'hq', x: 6, y: 7, dir: 'up' },
    buildMaps: () => ({ hq: buildHQ(), dc: buildDC(), park: buildPark() }),
    cast, hints: HINTS, puzzles: defs, story: G.makeStory(def),
    puzzleEvidence: { wpCH: 'ev_channel', wpSL: 'ev_side', wpBH: 'ev_bnh', wpCM: 'ev_credits', wpMDF: 'ev_mdf', wpRS: 'ev_restate' },
  });
})();
