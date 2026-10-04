// Episode 2 — Cold Storage. Northfield Foods: inventory overstatement to inflate an asset-based borrowing base.
(function () {
  const U = G.util, K = G.kit;
  const { makeMap } = G.mapkit;
  const { mc, num, rowPick, multiPick, multiLine } = G.puzzles.kit;
  const fmt = U.fmt;
  const say = K.say, narrate = K.narrate, choose = K.choose, text = K.text;
  const S = K.S, F = K.F, E = K.E, done = K.done;
  // Accept either $ millions ("7.8") or whole dollars ("7,800,000").
  const M = v => (Math.abs(v) >= 1e4 ? v / 1e6 : v);

  // ================================================================ maps
  function buildPlant() {
    const m = makeMap('plant', 50, 34);
    m.boxColors = ['#c9a24a', '#b8452f', '#3a6aa0', '#e0d6c0', '#d07a2a'];
    // office wing
    m.room(1, 1, 9, 8, ',');    // lobby
    m.room(11, 1, 18, 8, '_');  // CFO
    m.room(20, 1, 25, 8, '.');  // plant controller
    m.room(27, 1, 33, 8, '.');  // cost accounting
    m.room(35, 1, 41, 8, '.');  // war room
    m.room(43, 1, 48, 8, ',');  // QA lab
    for (let x = 1; x <= 48; x++) if (m.floor[1][x] !== '#') m.floor[0][x] = 'W';
    [5, 14, 22, 30, 38, 45].forEach(x => m.door(x, 9));
    m.room(1, 10, 48, 11, ',');
    // plant
    m.room(1, 13, 8, 21, ',');   // locker room
    m.door(4, 12);
    m.room(10, 13, 48, 24, '-'); // production
    m.door(20, 12); m.door(36, 12);
    m.room(1, 26, 20, 31, '-');  // inventory control anteroom
    m.door(14, 25);
    m.room(22, 26, 48, 31, '-'); // shipping dock
    m.room(30, 25, 34, 25, '-');
    for (let y = 26; y <= 28; y++) m.floor[y][41] = 'g';
    for (let x = 41; x <= 48; x++) m.floor[29][x] = 'g';
    m.door(44, 29);
    m.door(6, 32);   // freezer W2
    m.door(49, 30);  // man door to trailer yard
    m.lanes = new Set();
    for (let x = 10; x <= 48; x++) { m.lanes.add(x + ',17'); m.lanes.add(x + ',24'); }

    // lobby
    m.row(3, 6, 4, 'r', 'reception'); m.put(5, 3, 'h');
    m.put(1, 1, 'P'); m.put(9, 1, 'P'); m.put(9, 6, 'c', 'lobby_couch'); m.put(9, 7, 'c', 'lobby_couch');
    m.put(4, 0, 's', 'logo'); m.label(4, 0, 'NORTHFIELD');
    // CFO
    m.put(11, 1, 'B', 'h_shelf'); m.put(12, 1, 'B', 'h_shelf');
    m.put(13, 3, 'D', 'h_desk'); m.put(14, 3, 'C', 'h_pc'); m.put(15, 3, 'D', 'h_desk'); m.put(14, 2, 'h');
    m.put(17, 0, 'A', 'h_art'); m.put(18, 6, 'c', 'h_couch'); m.put(18, 7, 'c', 'h_couch'); m.put(11, 8, 'P');
    // plant controller
    m.put(21, 3, 'D', 'k_desk'); m.put(22, 3, 'C', 'k_pc'); m.put(23, 3, 'D', 'k_desk'); m.put(22, 2, 'h');
    m.put(25, 1, 'F', 'k_files'); m.put(20, 8, 'P'); m.put(23, 0, 'Z', 'k_board');
    // cost accounting
    m.put(29, 3, 'D'); m.put(30, 3, 'C', 'm_pc'); m.put(31, 3, 'D'); m.put(30, 2, 'h');
    m.put(28, 6, 'C', 'cost_pc'); m.put(29, 6, 'D'); m.put(31, 6, 'C', 'cost_pc'); m.put(32, 6, 'D');
    m.put(33, 1, 'F', 'm_files'); m.put(33, 2, 'F', 'm_files'); m.put(27, 8, 'P');
    // war room
    for (let x = 37; x <= 39; x++) for (let y = 3; y <= 5; y++) m.put(x, y, 'T', 'war_table');
    m.put(40, 1, 'C', 'war_pc'); m.put(41, 1, 'D');
    m.put(36, 0, 'Z', 'war_board'); m.put(35, 8, 'P'); m.put(41, 8, 'P');
    // QA lab
    m.row(44, 47, 3, 'K', 'qa_bench'); m.put(48, 1, 'R', 'qa_freezer'); m.put(43, 1, 'F', 'qa_files'); m.put(46, 0, 'Z', 'qa_board');
    // corridor
    m.put(26, 10, 'w', 'cooler'); m.put(1, 10, 'P'); m.put(48, 10, 'P');
    m.put(28, 12, 's', 'safety_sign'); m.label(28, 12, '212 DAYS SAFE');
    // locker room
    m.row(1, 3, 13, 'l', 'lockers'); m.row(5, 7, 13, 'l', 'lockers'); m.put(3, 13, 'l', 'my_locker');
    m.row(3, 5, 16, 'T', 'locker_bench'); m.put(8, 18, 'Q', 'vending'); m.put(1, 21, 'P');
    // production lines
    const line = (y, down) => {
      m.put(12, y, 'n', 'mixer'); m.put(13, y, 'n', 'mixer');
      m.row(14, 29, y, 'v', 'conveyor');
      m.row(30, 32, y, 'n', down ? 'line3' : 'oven');
      m.row(33, 39, y, 'v', 'conveyor');
      m.row(40, 42, y, 'n', 'spiral');
    };
    line(15); line(19); line(22, true);
    m.running = true;
    m.put(44, 20, 'f', 'forklift'); m.put(46, 14, 'j'); m.put(47, 14, 'j'); m.put(46, 21, 'j');
    // anteroom / inventory control
    m.put(11, 27, 'C', 'ic_desk'); m.put(12, 27, 'D', 'ic_desk2'); m.put(12, 26, 'h');
    m.put(16, 27, 'q', 'tag_table'); m.put(17, 27, 'q', 'tag_table');
    m.put(19, 26, 'l', 'freezer_suits'); m.put(20, 26, 'l', 'freezer_suits');
    m.put(3, 28, 'j'); m.put(3, 29, 'j');
    m.put(6, 25, 's', 'freezer_sign'); m.label(6, 25, 'FREEZER W2');
    // dock
    for (let x = 24; x <= 27; x++) { m.put(x, 27, 'j'); m.put(x, 28, 'j'); }
    m.tags = new Set(['24,27', '26,28']);
    m.put(35, 29, 'f', 'forklift');
    m.put(44, 27, 'D', 'ship_phone'); m.put(45, 27, 'C', 'ship_pc'); m.put(45, 26, 'h'); m.put(48, 26, 'F', 'ship_files');
    [24, 28, 32, 36].forEach((x, i) => { m.put(x, 32, 'k', 'dock_door'); m.label(x, 32, 'D' + (i + 1)); });
    return m;
  }

  function buildFreezer() {
    const m = makeMap('freezer', 28, 16, { weather: 'frost' });
    m.boxColors = ['#c94a3a', '#e0b040', '#3a6aa0', '#e8e2d2'];
    m.room(1, 1, 26, 14, '~');
    m.door(4, 0);
    const racks = [3, 6, 9, 12];
    for (const y of racks) for (let x = 2; x <= 25; x++) if (x !== 8 && x !== 17) m.put(x, y, 'H', 'rack');
    m.emptyRack = new Set(['15,9', '24,3', '3,12']);
    const tcs = { tc1: [4, 3, 'F04'], tc2: [11, 3, 'F09'], tc3: [13, 6, 'F12'], tc4: [20, 6, 'F15'], tc5: [5, 9, 'F21'], tc6: [23, 12, 'F27'] };
    for (const id in tcs) { const [x, y, l] = tcs[id]; m.put(x, y, 'H', id); m.label(x, y, l); }
    m.put(6, 1, 'q', 'count_desk'); m.put(7, 1, 'q', 'count_desk');
    m.put(10, 0, 's', 'aisle_sign'); m.label(10, 0, 'AISLE F');
    m.put(20, 0, 's', 'temp_sign'); m.label(20, 0, '-10 F');
    m.put(24, 1, 'f', 'freezer_forklift'); m.put(25, 14, 'j'); m.put(14, 14, 'j');
    m.lights = [{ x: 4.5, y: 1.2, r: 34, flicker: true }];
    m.darkness = 0.9; m.darkTint = '4,8,18';
    return m;
  }

  function buildYard() {
    const m = makeMap('yard', 42, 26, { dark: true, weather: 'snow', darkness: 0.8, darkTint: '8,12,28', fenceGround: '*' });
    m.room(1, 2, 40, 24, '*');
    m.door(3, 1);
    [8, 12, 16, 20, 24].forEach((x, i) => { m.put(x, 1, 'k', 'yard_dock'); m.label(x, 1, 'D' + (i + 1)); });
    m.put(30, 1, 's', 'yard_sign'); m.label(30, 1, 'NORTHFIELD FOODS');
    for (let x = 0; x <= 41; x++) m.floor[25][x] = '!';
    for (let y = 2; y <= 25; y++) { m.floor[y][0] = '!'; m.floor[y][41] = '!'; }
    m.ruts = new Set();
    for (let x = 1; x <= 40; x++) { m.ruts.add(x + ',10'); }
    for (let y = 2; y <= 24; y++) m.ruts.add('31,' + y);
    const trailer = (x, y, label, id, color) => {
      m.props.push({ kind: 'trailer', x, y, w: 2, h: 5, facing: 'up', color: color || '#dfe3e8', stripe: '#2f5d9a', label, solid: true, snowy: true });
      for (let yy = y; yy < y + 5; yy++) for (let xx = x; xx < x + 2; xx++) m.tag(xx, yy, id);
    };
    trailer(8, 3, 'NF2201', 'tr_2201'); trailer(16, 3, 'NF2224', 'tr_2224');
    trailer(5, 13, 'NF2231', 'tr_2231'); trailer(9, 13, 'NF2236', 'tr_2236'); trailer(13, 13, 'NF2240', 'tr_2240');
    trailer(19, 13, 'NF2207', 'tr_2207'); trailer(23, 13, 'GL5590', 'tr_gl', '#c9ced6');
    // guard shack
    for (let y = 18; y <= 22; y++) for (let x = 33; x <= 38; x++) m.floor[y][x] = '#';
    m.room(34, 19, 37, 21, ',');
    m.door(35, 18);
    m.put(35, 21, 'C', 'gate_log'); m.put(34, 21, 'D', 'gate_desk');
    [[2, 22], [3, 22], [39, 4], [39, 5], [27, 23], [28, 23], [2, 8]].forEach(([x, y]) => m.put(x, y, 'o'));
    m.lights = [{ x: 6, y: 9, r: 56 }, { x: 20, y: 9, r: 56 }, { x: 33, y: 9, r: 50, flicker: true }, { x: 35.5, y: 20, r: 44 }, { x: 3.5, y: 2.5, r: 34 }];
    return m;
  }

  // ================================================================ cast
  const cast = {
    lena: { name: 'Lena Strand', title: 'Founder, Strand Forensic Advisory', look: { skin: '#f3d6c0', hair: '#e2c27a', hairStyle: 'bun', shirt: '#e8e8e8', jacket: '#1f2f4a', pants: '#1f2f4a' } },
    hargrove: { name: 'Dennis Hargrove', title: 'CFO, Northfield Foods', look: { skin: '#eab89a', hair: '#9a8a7a', hairStyle: 'short', shirt: '#f0f0f0', jacket: '#203a2a', tie: '#e0b040', pants: '#2a2a30' } },
    kyle: { name: 'Kyle Brandt', title: 'Plant Controller', look: { skin: '#f0cfae', hair: '#8a5a2a', hairStyle: 'short', shirt: '#7a9ac0', pants: '#3a3a44', glasses: '#333' } },
    mei: { name: 'Mei Chen', title: 'Cost Accounting Manager', look: { skin: '#ecc9a2', hair: '#141414', hairStyle: 'bob', shirt: '#2f6a6a', jacket: '#d9d4c8', pants: '#2a2a3a', glasses: '#555' } },
    rosa: { name: 'Rosa Delgado', title: 'Inventory Control Supervisor (nights)', look: { skin: '#b07850', hair: '#1a1210', hairStyle: 'hardhat', hat: '#f4f4f4', shirt: '#2a4a6a', jacket: '#d04a2a', pants: '#2a2a3a' } },
    walt: { name: 'Walt Kowalczyk', title: 'Forklift Operator, 31 years', look: { skin: '#e8b898', hair: '#cccccc', hairStyle: 'hardhat', hat: '#f0c020', shirt: '#5a4a3a', jacket: '#c06a2a', pants: '#3a3a44' } },
    tom: { name: 'Tom Becker', title: 'Quality Assurance Manager', look: { skin: '#f0c8a8', hair: '#6a4a2a', hairStyle: 'short', shirt: '#f4f4f4', jacket: '#f4f4f4', pants: '#3a3a44', glasses: '#333' } },
    luis: { name: 'Luis Ortega', title: 'Shipping & Yard Supervisor', look: { skin: '#b98560', hair: '#1a1a1a', hairStyle: 'beanie', hat: '#2a4a8a', shirt: '#3a5a3a', jacket: '#2a2a30', pants: '#2a2a30' } },
    deb: { name: 'Deb Lindqvist', title: 'Reception & HR', look: { skin: '#f2d0b5', hair: '#d0b070', hairStyle: 'bob', shirt: '#7a3a6a', pants: '#2a2a3a' } },
    nate: { name: 'Nate Pruitt', title: 'Audit Senior, Kessler Ostrom LLP', look: { skin: '#f0cfae', hair: '#3a2a1e', hairStyle: 'beanie', hat: '#b03030', shirt: '#e8e8e8', jacket: '#2a3a5a', pants: '#2a2a30' } },
    jo: { name: 'Jo Arneson', title: 'Count Team 4', look: { skin: '#f0d0b8', hair: '#d0a050', hairStyle: 'hardhat', hat: '#30a050', shirt: '#2a2a3a', jacket: '#d0d8e0', pants: '#2a2a3a' } },
    earl: { name: 'Earl Haugen', title: 'Gate Security', look: { skin: '#e8b898', hair: '#2c3e66', hairStyle: 'cap', shirt: '#2c3e66', jacket: '#1a2236', pants: '#1a2236' } },
    janet: { name: 'Janet Kowalski', title: 'SVP Asset-Based Lending, Great Lakes Commercial Bank', look: { skin: '#f0c8b0', hair: '#5a3a2a', hairStyle: 'bob', shirt: '#e8e8e8', jacket: '#5a1f2a', pants: '#2a2a30', glasses: '#333' } },
    asher: { name: 'Simon Asher', title: 'Operating Partner, Calder Ridge Partners', look: { skin: '#e2c0a4', hair: '#d8d8d8', hairStyle: 'slick', hair2: '#f4f4f4', shirt: '#1a1a1a', jacket: '#3a3a42', pants: '#2a2a30' } },
  };

  // ================================================================ evidence
  const EV = {
    ev_note: { title: 'Note in locker V-3', ref: 'ITEM 0', short: '"Bring a coat. Count it yourself."', body: '<p>Taped inside your visitor PPE locker, wrapped around a prepaid phone:</p><p><i>"Bring a coat. Count it yourself. — N"</i></p>' },
    ev_margin: { title: 'Margin & DIO analytics', ref: 'WP N-1', short: 'GM +5.3 pts while cheese +18%; DIO 27.6 → 42.7 days.', body: '<ul><li>Q4 FY26 gross margin <b>29.3%</b> vs. 24.0% a year earlier, while the cheese block index rose 18% and case volume was flat.</li><li>Days inventory on hand rose from <b>27.6 to 42.7 days</b>; inventory grew 51% on flat COGS.</li><li>Q4 gross profit exceeds FY25-margin expectation by <b>$14.9M</b>.</li><li>Conclusion: costs are being parked in inventory instead of flowing to COGS.</li></ul>' },
    ev_var: { title: 'Capitalized variances & overhead rate', ref: 'WP N-2', short: '$7.8M of GL 1395 should have been expensed.', body: '<ul><li>GL 1395 "Capitalized manufacturing variances" grew from $0 to <b>$9.6M</b> in FY26 — 100% of unfavorable variances deferred.</li><li>Includes <b>$2.4M</b> of Line 3 spoilage (Aug 14 freezer failure) — an abnormal cost to expense immediately (ASC 330-10-30-7).</li><li>Only 25% of normal variances belong in ending inventory: proper balance $1.8M; overstatement <b>$7.8M</b>.</li><li>Fixed overhead rate raised $38 → $52/DLH on 7/1 when volume fell below normal capacity — contrary to ASC 330-10-30-3. Approved: D. Hargrove.</li></ul>' },
    ev_count: { title: 'Freezer W2 test counts', ref: 'WP N-3', short: '15% shortfall in aisle F; $8.46M projected; unissued tags in final count.', body: '<ul><li>Your test counts in aisle F: 3 of 6 locations short (hollow pallets, empty cartons). Sample overstatement $3,600 on $24,000 book (<b>15.0%</b>).</li><li>Projected over the $56.4M freezer population: <b>$8.46M</b>.</li><li>Tags 4561–4570 appear in the final compilation but were never issued; void tags 4540–4549 were retained by K. Brandt.</li><li>The external auditor observed three counts in aisle B and left at 10:30 PM.</li></ul>' },
    ev_gatelog: { title: 'Gate log — New Year’s Eve', ref: 'YARD 12/31', short: 'Hargrove badged in 22:52, out 23:31 — during your lock-in.', body: '<ul><li>Badge 1007 <b>D. HARGROVE</b>: IN 12/31 22:52, OUT 12/31 23:31.</li><li>You were locked in Freezer W2 at approximately 23:05. The interior release knob had been removed.</li><li>Trailers NF-2231 and NF-2240 show no gate-out since 12/28 — they never left for Green Bay.</li></ul>' },
    ev_3pl: { title: 'Polar Cold Storage — offsite inventory', ref: 'WP N-4', short: 'Forged confirmation; $7.4M of 3PL inventory doesn’t exist.', body: '<ul><li>Management’s confirmation came from <b>polarcoldstorage-wi.com</b>, sent and received by K. Brandt. Polar’s real domain is polarcold.com; no "K. Lund" works there.</li><li>Polar’s direct report: <b>$6.1M</b> of Northfield product on hand vs. $11.4M on the books.</li><li>4 of 6 "in-transit" BOLs are fake: two trailers never left the yard and two reuse BOL numbers Polar received in November.</li><li>3PL inventory overstated by <b>$7.4M</b>.</li></ul>' },
    ev_cutoff: { title: 'Cutoff & short-dated reserve', ref: 'WP N-5', short: '$1.24M of January shipments booked in December; $3.0M reserve shortfall.', body: '<ul><li>Three 12/31 invoices ($1,239,500) shipped on or after 1/2. Terms FOB shipping point; no bill-and-hold request. Revenue belongs in FY27.</li><li>Short-dated reserve required by policy: <b>$3.4M</b>; recorded: $0.4M; shortfall <b>$3.0M</b>.</li></ul>' },
    ev_kyle: { title: 'Statement of Kyle Brandt', ref: 'INTERVIEW 1/2', short: 'Hargrove ordered the rate change, the tags, and the Polar confirmation.', body: '<p>Plant Controller’s office, 1/2/2027. Kyle Brandt, CPA.</p><ul><li>Hargrove directed the July overhead rate change and the deferral of all variances "until the refinancing closes."</li><li>Hargrove gave him tags 4561–4570 and a list of quantities to add after the count.</li><li>The Polar confirmation was emailed to Kyle from an address Hargrove set up. Kyle forwarded it to the bank anyway.</li><li>Hargrove keeps a second spreadsheet, "BBC_actual.xlsx," with the true borrowing base. Kyle provided a copy.</li></ul>' },
    ev_bbc: { title: 'Borrowing base & covenant recalculation', ref: 'WP N-6', short: '$26.66M inventory overstatement; $9.96M over-advance; leverage ~5.1x.', body: '<ul><li>Total inventory overstatement: <b>$26.66M</b> (variances $7.80M + freezer $8.46M + 3PL $7.40M + reserve $3.00M).</li><li>Corrected borrowing base $121.04M vs. $131.0M drawn: <b>$9.96M over-advance</b>.</li><li>Corrected leverage ≈ 5.1x vs. 4.0x covenant: event of default; debt classified current (ASC 470-10-45-11); going-concern evaluation (ASC 205-40).</li></ul>' },
  };

  // ================================================================ hints (NIGHTSHIFT)
  const HINTS = {
    'wpGM.dio': ['DIO is inventory over cost of sales, times the days in the period. Q4 has 92.', 'Use Q4 FY26: inventory 92.4, COGS 199.0. Times 92.', '92.4 ÷ 199.0 × 92 = 42.7 days.'],
    'wpGM.excess': ['What would gross profit be at last year’s 24% margin? Compare to what they reported.', 'Reported GP = 281.4 − 199.0. Expected GP = 24% of 281.4.', '82.4 − 67.5 = 14.9. Million.'],
    'wpGM.why': ['Cheese went up, volume stayed flat, margin went UP and inventory piled up. Where did the cost go?', 'If cost doesn’t hit COGS, it sits on the balance sheet.', 'C. Costs capitalized into inventory.'],
    'wpVAR.abnormal': ['ASC 330 lists the costs you never put in inventory: idle facility, excessive spoilage, double freight, rehandling.', 'Tom’s August report. What happened to Line 3?', 'A. The Line 3 spoilage.'],
    'wpVAR.over': ['First pull out the abnormal piece. Then only a quarter of what’s left belongs in inventory.', '9.6 total, minus 2.4 spoilage = 7.2 normal. 25% of 7.2 stays. The rest is overstatement.', '9.6 − 1.8 = 7.8 million.'],
    'wpVAR.rate': ['Fixed overhead gets spread over NORMAL capacity. What happens when you make less?', 'Low volume doesn’t make each pizza cost more. The unabsorbed overhead gets expensed.', 'It’s the ASC 330-10-30-3 answer about normal capacity.'],
    'wpCOUNT.exceptions': ['Compare your count to the tag, line by line.', 'Three of them don’t match what you counted with your own hands.', 'F12, F21, F27.'],
    'wpCOUNT.project': ['Error rate in the sample, times the whole freezer.', 'Shortfall dollars ÷ sample book dollars = 15%. Freezer book is 56.4 million.', '15% × 56.4M = 8.46 million.'],
    'wpCOUNT.tags': ['Tags are numbered so nobody can add any after the count. Look at the numbers in the final list.', 'Tags 4561–4570 were never handed out. But they’re in the totals.', 'The answer about tags added after the count.'],
    'wp3PL.conf': ['Who sent the confirmation? Who got the answer back? What’s the email address?', 'Kyle sent it, Kyle got it back, and the domain isn’t Polar’s.', 'The answer about management controlling the confirmation.'],
    'wp3PL.bols': ['Check each BOL against what Polar actually received, and against what you saw in the yard.', 'Two trailers never left. Two BOL numbers were already used in November.', 'Select 88127, 88130, 87764, 87790.'],
    'wp3PL.total': ['Book at Polar, minus what Polar really has, minus the in-transit that’s real.', '14.6 − 6.1 − 1.1.', '7.4 million.'],
    'wpCUT.cutoff': ['Invoice date doesn’t matter. When did the truck leave the gate?', 'FOB shipping point. Anything that left on January 2nd is January revenue.', '610460, 610461, 610462.'],
    'wpCUT.fix': ['Control didn’t transfer. So no sale. What do you undo?', 'Reverse revenue and AR, put the product back in inventory.', 'A.'],
    'wpCUT.eo': ['Apply the policy to each age bucket.', 'Expired 100%, under 30 days 100%, 30–60 days 50%. Then subtract what’s booked.', '1.2 + 0.9 + 1.3 = 3.4 required, 0.4 booked. 3.0 short.'],
    'wpBBC.total': ['Add up what you found: variances, freezer, Polar, reserve.', '7.80 + 8.46 + 7.40 + 3.00.', '26.66 million.'],
    'wpBBC.over': ['Fix the inventory, recompute availability, compare to what they drew.', 'AR availability 81.6 + 60% of (92.4 − 26.66). Then 131.0 minus that.', '131.0 − 121.04 = 9.96 million over-advanced.'],
    'wpBBC.cov': ['Debt over EBITDA. Fix EBITDA. Then think about what a breach does to the balance sheet.', 'About 5.1x against a 4.0x covenant. A callable loan isn’t long-term anymore.', 'The answer with ASC 470-10-45-11 and going concern.'],
    'dlg.mei': ['Mei doesn’t scare and she doesn’t lie. Give her a reason that’s real.', 'The bank’s your client. The credit agreement gives the bank the right to look at the books.', 'Pick the credit agreement option.'],
    'dlg.freezer1': ['Freezers have to open from the inside. It’s the law.', 'Look for the inside release.', 'Find the interior safety release.'],
    'dlg.freezer2': ['No cell signal in a steel box. But you’ve got Wi-Fi and a friend.', 'Text me.', 'Pick "Text NIGHTSHIFT."'],
    'dlg.polar': ['Don’t call the number they gave you. Find the number yourself.', 'Polar’s own website, or the state business registry.', 'The second option.'],
    'dlg.kyle1': ['Kyle’s a good kid in a bad spot. Start with what he’s carrying, not what he did.', 'Tell him you know he didn’t design this.', 'The first option.'],
    'dlg.kyle2': ['He thinks loyalty protects him. Show him what the paper says about HIS name.', 'He signed the borrowing base certificates.', 'Pick the option about the certificates.'],
    'dlg.kyle3': ['Don’t promise what the bank decides.', 'Be honest with him.', 'Pick "I can’t promise anything."'],
    'dlg.asher': ['Simon’s fishing. Don’t give him anything.', 'Who’s your client?', 'Tell him your report goes to the bank.'],
    'hearing.r1': ['He says margins are pricing and efficiency. What did the numbers say?', 'Margin and DIO analytics.', 'Present the margin & DIO analytics.'],
    'hearing.r2': ['"Normal course." Who approved the rate change? What’s sitting in 1395?', 'Variances workpaper. Or Kyle.', 'Present the capitalized variances workpaper.'],
    'hearing.r3': ['The auditor counted aisle B. You counted aisle F.', 'Your test counts.', 'Present the freezer test counts.'],
    'hearing.r4': ['"Home with family." Earl’s log says different.', 'The gate log.', 'Present the gate log.'],
    'hearing.r5': ['Ask Simon who sent that confirmation.', 'Polar workpaper.', 'Present Polar Cold Storage.'],
    'hearing.r6': ['A decade of the same methodology doesn’t make it right this year.', 'Cutoff and reserve.', 'Present cutoff & short-dated reserve.'],
    'hearing.r7': ['She wants one number.', 'Borrowing base recalculation.', 'Present the borrowing base workpaper.'],
    'hearing.r8': ['Don’t let him think you scare.'],
  };

  // ================================================================ chapters & clock
  const CHAPTERS = [
    { title: 'Day 1 — The Book', day: 'WED 12/30' },
    { title: 'Day 2 — The Count', day: 'THU 12/31' },
    { title: 'Day 3 — Offsite', day: 'FRI 1/1' },
    { title: 'Day 4 — Cutoff', day: 'SAT 1/2' },
    { title: 'Day 5 — Borrowing Base', day: 'SUN 1/3' },
    { title: 'Day 6 — The Bank', day: 'MON 1/4' },
    { title: 'Epilogue', day: '' },
  ];

  function clock(s) {
    const f = s.flags, ch = s.chapter;
    let t = '9:00 AM';
    if (ch === 0) t = !f.met_hargrove ? '8:05 AM' : !done('wpGM') ? '9:40 AM' : !done('wpVAR') ? '1:15 PM' : '4:45 PM';
    if (ch === 1) t = !f.locked_in ? '9:40 PM' : '11:58 PM';
    if (ch === 2) t = s.map === 'yard' || f.seen_2231 ? '6:20 PM' : '1:15 PM';
    if (ch === 3) t = f.night3 ? '11:10 PM' : !done('wpCUT') ? '9:00 AM' : '2:30 PM';
    if (ch === 4) t = '10:30 AM';
    if (ch === 5) t = '9:00 AM';
    return (CHAPTERS[ch] || CHAPTERS[0]).day + ' · ' + t;
  }
  function location(s) {
    return { plant: 'Northfield Foods — Ashby, WI', freezer: 'Northfield Foods — Freezer W2 (−10°F)', yard: 'Northfield Foods — Trailer Yard' }[s.map];
  }

  const PC = { map: 'plant', x: 40, y: 1 };
  const at = id => { const p = def.npcPos(id, S()); return p ? { map: p.map, x: p.x, y: p.y } : null; };
  const TC = { tc1: [4, 3], tc2: [11, 3], tc3: [13, 6], tc4: [20, 6], tc5: [5, 9], tc6: [23, 12] };
  const tcDone = () => Object.keys(TC).filter(k => F()[k]).length;

  function objective(s) {
    const f = s.flags;
    switch (s.chapter) {
      case 0:
        if (!f.badge) return { text: 'Check in at *reception*.', target: at('deb') };
        if (!f.met_hargrove) return { text: 'Meet the CFO, *Dennis Hargrove*.', target: at('hargrove') };
        if (!f.phone_found) return { text: 'Get your PPE from *visitor locker V-3* in the locker room.', target: { map: 'plant', x: 3, y: 13 } };
        if (!f.got_pkg) return { text: 'Get the year-end financial package from *Kyle Brandt*, plant controller.', target: at('kyle') };
        if (!done('wpGM')) return { text: 'Analyze margins and inventory on the *war room computer*.', target: PC };
        if (!f.got_cost) return { text: 'Get the standard cost history from *Mei Chen* in cost accounting.', target: at('mei') };
        if (!f.got_qa) return { text: 'Ask *Tom Becker* in the QA lab what happened to Line 3.', target: at('tom') };
        return { text: 'Analyze capitalized variances on the *war room computer*.', target: PC };
      case 1:
        if (!f.got_tags) return { text: 'Find *Rosa Delgado* at the inventory control desk.', target: at('rosa') };
        if (tcDone() < 6) {
          const next = Object.keys(TC).find(k => !f[k]);
          return { text: 'Test count aisle F in *Freezer W2*: ' + tcDone() + ' of 6 locations.', target: s.map === 'freezer' ? { map: 'freezer', x: TC[next][0], y: TC[next][1] } : { map: 'plant', x: 6, y: 32 } };
        }
        return { text: 'Evaluate the count at the *inventory control desk*.', target: { map: 'plant', x: 11, y: 27 } };
      case 2:
        if (!f.got_conf) return { text: 'Get the Polar Cold Storage confirmation from *Kyle*.', target: at('kyle') };
        if (!f.got_polar) return { text: 'Call Polar Cold Storage yourself from the *shipping office phone*.', target: { map: 'plant', x: 44, y: 27 } };
        if (!f.got_bols) return { text: 'Get the in-transit BOL log from *Luis Ortega*.', target: at('luis') };
        if (!f.seen_2231 || !f.seen_2240 || !f.gate_log) {
          if (s.map !== 'yard') return { text: 'Check the *trailer yard* for NF-2231 and NF-2240. Earl keeps the gate log.', target: { map: 'plant', x: 49, y: 30 } };
          if (!f.seen_2231) return { text: 'Find trailer *NF-2231*.', target: { map: 'yard', x: 6, y: 18 } };
          if (!f.seen_2240) return { text: 'Find trailer *NF-2240*.', target: { map: 'yard', x: 14, y: 18 } };
          return { text: 'Check the *gate log* in the guard shack.', target: { map: 'yard', x: 35, y: 21 } };
        }
        return { text: 'Test the offsite inventory on the *war room computer*.', target: s.map === 'yard' ? { map: 'yard', x: 3, y: 1 } : PC };
      case 3:
        if (f.night3) {
          if (!f.asher_met && s.map === 'plant') return { text: 'Head down to the anteroom at 11 PM.', target: { map: 'plant', x: 14, y: 25 } };
          return { text: 'NIGHTSHIFT is waiting at the *inventory control desk*.', target: at('rosa') };
        }
        if (!f.got_ship) return { text: 'Get the final shipments and gate times from *Luis*.', target: at('luis') };
        if (!f.got_aging) return { text: 'Get the inventory aging report from *Mei*.', target: at('mei') };
        if (!done('wpCUT')) return { text: 'Test cutoff and the short-dated reserve on the *war room computer*.', target: PC };
        return { text: '*Kyle Brandt* has been carrying this alone. Talk to him.', target: at('kyle') };
      case 4:
        return { text: 'Recalculate the borrowing base on the *war room computer*.', target: PC };
      case 5:
        return { text: 'The bank meeting is in the *war room*.', target: at('janet') };
      default: return { text: '', target: null };
    }
  }

  function npcPos(id, s) {
    const f = s.flags, ch = s.chapter;
    const p = (x, y, dir, extra = {}) => Object.assign({ map: 'plant', x, y, dir }, extra);
    switch (id) {
      case 'deb': return ch === 0 ? p(5, 3, 'down') : null;
      case 'hargrove':
        if (ch === 5) return p(40, 3, 'left');
        if (ch === 0 || (ch === 3 && !f.night3)) return p(14, 2, 'down');
        return null;
      case 'kyle':
        if (ch === 5) return p(38, 7, 'up', { sweat: true });
        if (ch === 1) return p(17, 29, 'up', { sweat: true });
        if (ch === 3 && f.night3) return null;
        if (ch <= 3) return p(22, 2, 'down', { sweat: ch >= 2 });
        return null;
      case 'mei': return ch === 0 || (ch === 3 && !f.night3) ? p(30, 2, 'down') : null;
      case 'tom': return ch === 0 ? p(45, 4, 'up') : null;
      case 'luis': return (ch === 0 || ch === 2 || (ch === 3 && !f.night3)) ? p(45, 26, 'down') : null;
      case 'walt':
        if (ch === 0) return p(25, 20, 'right');
        if (ch === 1) return f.locked_in ? p(10, 29, 'up') : p(34, 28, 'left');
        if (ch === 2 || ch === 3) return p(33, 28, 'left');
        return null;
      case 'rosa':
        if (ch === 1) return p(12, 26, 'down');
        if (ch === 3 && f.night3) return p(12, 26, 'down');
        return null;
      case 'nate': return ch === 1 && !f.nate_left ? p(8, 28, 'right') : null;
      case 'jo': return ch === 1 ? { map: 'freezer', x: 16, y: 4, dir: 'left' } : null;
      case 'earl': return ch === 2 ? { map: 'yard', x: 37, y: 20, dir: 'left' } : null;
      case 'lena': return ch === 4 ? p(36, 4, 'right') : ch === 5 ? p(36, 5, 'right') : null;
      case 'janet': return ch === 5 ? p(36, 3, 'right') : null;
      case 'asher':
        if (ch === 5) return p(40, 5, 'left');
        if (ch === 3 && f.night3 && !f.asher_met) return p(33, 11, 'right');
        return null;
    }
    return null;
  }

  function nightLights(mapName, s) {
    if (mapName !== 'plant') return [];
    return [{ x: 12, y: 27, r: 60 }, { x: 40, y: 2, r: 46 }, { x: 22, y: 10.5, r: 40 }, { x: 14, y: 24, r: 30 }, { x: 45, y: 27, r: 40 }];
  }

  // ================================================================ beats
  function wearHardhat() { G.cast.you.look.hairStyle = 'hardhat'; G.cast.you.look.hat = '#f4f4f4'; }

  async function newGame() {
    await G.ui.card({
      day: 'EPISODE 2 · WEDNESDAY, DECEMBER 30, 2026 · 8:05 AM',
      title: 'COLD STORAGE',
      text: 'Ten weeks after Halvorsen, you’re a senior manager at Strand Forensic Advisory, Lena Strand’s new shop.\n\nGreat Lakes Commercial Bank lends $412 million to Northfield Foods, a frozen pizza maker in Ashby, Wisconsin, owned by private equity firm Calder Ridge Partners. The bank’s revolver is secured by Northfield’s inventory. Last week someone mailed the bank an anonymous note: *"Count the freezer yourself."*\n\nThe year-end physical count is tomorrow night. A blizzard is coming.',
    });
    E().placePlayer('plant', 5, 7, 'up');
    await G.ui.reveal();
    await E().script(async () => {
      await narrate('The lobby smells like baking dough and floor wax. Through the windows, snow is coming sideways off the lake.');
      await narrate('Your phone buzzes: Lena. *"Bank wants a full exam: margins, variances, count, offsite, cutoff, borrowing base. Be polite. Be thorough. Don’t let them rush you."*');
    });
  }

  async function beats() {
    const s = S(), f = s.flags;
    if (done('wpGM') && !f.hargrove_visit) { f.hargrove_visit = true; await hargroveVisit(); }
    if (s.chapter === 0 && done('wpVAR')) await toCount();
    if (s.chapter === 1 && done('wpCOUNT')) await toOffsite();
    if (s.chapter === 2 && done('wp3PL')) await toCutoff();
    if (s.chapter === 3 && done('wpCUT') && !f.cut_followup) { f.cut_followup = true; await text('Kyle’s been sweating since Christmas. He signs the borrowing base certificates. Go talk to him. Gently.'); }
    if (s.chapter === 4 && done('wpBBC')) await toBank();
    if (s.chapter === 5 && f.hearing_done) await ending();
    K.refresh();
  }

  async function hargroveVisit() {
    const e = E();
    G.audio.door();
    e.spawnActor('hargrove', 38, 9, 'up');
    await e.walkActor('hargrove', [['up', 1]]);
    e.faceToward('you', 38, 8);
    await say('hargrove', 'Settling in? Good, good. Deb get you coffee? Our coffee’s terrible. Our pizza’s excellent.');
    await say('hargrove', 'I saw you pulled the margin bridge. Let me save you some time: we took price twice this year, and Line 1 is running at ninety-four percent efficiency. That’s the story.');
    const c = await choose('you', null, ['Then the inventory build will be easy to explain.', 'Cheese went up eighteen percent.', 'Thanks, Dennis. Very helpful.']);
    if (c === 0) await say('hargrove', 'Strategic build ahead of a spring promotion. Kyle can walk you through it. Kyle can walk you through anything.');
    else if (c === 1) { await say('hargrove', 'And we’re hedged. Mostly.'); await narrate('He says "mostly" the way people say "allegedly."'); }
    else await say('hargrove', 'That’s what we’re here for.');
    await say('hargrove', 'Count’s tomorrow night. New Year’s Eve. Wear layers.');
    await e.walkActor('hargrove', [['down', 1]]);
    e.removeActor('hargrove');
    await K.sleep(700);
    await text('He’ll tell you it’s pricing. It isn’t.');
    await text('Ask Mei for the standard cost history. Then ask Tom in QA what happened to Line 3 in August.');
    K.refresh();
  }

  async function toCount() {
    await text('Count starts at ten tomorrow night. Aisle F is where the problems live. Count it yourself. Don’t trust the tags.');
    await K.sleep(900);
    await K.toChapter(1, { day: 'THURSDAY, DECEMBER 31, 2026 · 9:40 PM', title: 'The Count', text: 'New Year’s Eve. The plant is down for the count. Lines silent, spiral freezers ticking as they cool.\n\nFourteen count teams in parkas. One auditor who has a party to get to.\n\nAnd a freezer held at ten below zero.' }, { map: 'plant', x: 12, y: 29, dir: 'up' });
    G.maps.plant.running = false;
  }

  async function lockIn() {
    const e = E(), f = F();
    f.locked_in = true;
    G.save();
    G.audio.sting();
    e.shakeScreen(5);
    await narrate('Behind you, the freezer door swings shut with a heavy *thunk*. Then the lights go out.');
    G.maps.freezer.dark = true;
    await narrate('Emergency light only. Your breath hangs in front of you. Ten below zero, and you’re wearing a borrowed parka.');
    await K.gate('you', 'What do you do?', [
      'Pound on the door and shout.',
      'Find the interior safety release. Walk-in freezers have to open from the inside.',
      'Sit down and conserve body heat.',
    ], 1, 'dlg.freezer1', async c => {
      if (c === 0) await narrate('You pound until your hands ache. Outside, someone’s already setting off fireworks in the parking lot. Nobody hears you.');
      else await narrate('Sitting still at ten below is how people die in freezers. Your fingers are already going numb.');
    });
    await narrate('You find the release plunger by the emergency light: a red knob on a steel shaft at waist height.');
    await narrate('Except the knob is gone. Someone unscrewed it. The bare threads are cold enough to burn.');
    await K.gate('you', null, [
      'Pry the door open with a pallet board.',
      'Call 911.',
      'Text NIGHTSHIFT.',
    ], 2, 'dlg.freezer2', async c => {
      if (c === 0) await narrate('The door is a four-inch insulated slab on a magnetic gasket. The board snaps.');
      else await narrate('No cellular signal inside a steel box. The phone shows one bar of plant Wi-Fi.');
    });
    await text('LOCKED IN FREEZER W2. RELEASE KNOB REMOVED.', { me: true });
    await K.sleep(1500);
    await text('Hang on. Sending Walt. Keep moving.');
    await narrate('Four minutes. It feels like forty. Then the beep of a reversing forklift, and the door hauls open.');
    G.maps.freezer.dark = false;
    await K.travel('plant', 10, 30, 'up', { sound: () => G.audio.door() });
    K.refresh();
    e.faceToward('walt', 10, 30);
    await say('walt', 'Jesus, Mary and Joseph. You okay? Your lips are blue.');
    await say('walt', 'Somebody wedged the door and took the knob off the release. That’s not an accident. That’s a twenty-year OSHA violation and maybe a crime.');
    await say('walt', 'I saw a big fella in a Northfield parka going toward the office side about ten minutes ago. Didn’t see his face.');
    await say('walt', 'Rosa’s got your count sheets. Go warm up and finish your work. I’ll stand at that door the rest of the night.');
    await text('Earl at the gate keeps a badge log. Whoever that was came in through the gate. Remember that.');
    K.refresh();
  }

  async function toOffsite() {
    await text('You did good tonight. Happy New Year.');
    await K.sleep(900);
    await K.toChapter(2, { day: 'FRIDAY, JANUARY 1, 2027 · 1:15 PM', title: 'Offsite', text: 'New Year’s Day. Fourteen inches overnight and still coming. The plant runs a skeleton crew.\n\nThe books say $14.6 million of Northfield pizza is sitting in a third-party warehouse in Green Bay.\n\nThe books have been wrong before.' }, { map: 'plant', x: 38, y: 7, dir: 'up' });
    G.maps.plant.running = true;
    await E().script(async () => {
      await text('Book says $14.6M sits at Polar Cold Storage in Green Bay. Kyle has a confirmation. Ask yourself who mailed it.');
    });
  }

  async function toCutoff() {
    await text('Two trailers that "left for Green Bay" are sitting in our yard under a foot of snow. I’ve been looking at them for a week.');
    await K.sleep(900);
    await K.toChapter(3, { day: 'SATURDAY, JANUARY 2, 2027 · 9:00 AM', title: 'Cutoff', text: 'The plows come through at dawn. Trucks start moving again.\n\nSome of them should have moved three days ago.' }, { map: 'plant', x: 38, y: 7, dir: 'up' });
    await E().script(async () => {
      await text('Look at what got invoiced on the 31st. Then look at what’s been rotting in that freezer since summer.');
    });
  }

  async function kyleScene() {
    const f = F();
    await narrate('Kyle Brandt hasn’t slept. There are four empty energy drinks on his desk and a borrowing base certificate in his printer tray.');
    await say('kyle', 'If you’re here to ask about the cutoff, I already know. I booked those. Dennis said December needed to "close strong."');
    await K.gate('kyle', null, [
      'Kyle, I don’t think you designed any of this. I think you’ve been carrying it.',
      'You’re looking at prison time, Kyle.',
      'Did you lock me in the freezer?',
    ], 0, 'dlg.kyle1', async c => {
      if (c === 1) await say('kyle', 'Then I should probably stop talking. I’m going to stop talking.');
      else await say('kyle', 'What? No! God, no. I was in the anteroom the whole time. Ask Rosa. I’d never— no.');
    });
    await say('kyle', '…Every month I sign a certificate that says the inventory’s real. I tell myself Dennis knows what he’s doing. He’s been a CFO for twenty years.');
    await K.gate('kyle', null, [
      'Dennis is a good boss. I’m sure he’ll take care of you.',
      'Who signs the borrowing base certificates the bank relies on, Kyle? Whose name is on them?',
      'Let’s talk about the weather.',
    ], 1, 'dlg.kyle2', async c => {
      if (c === 0) await say('kyle', 'Yeah. He keeps saying that.');
      else await narrate('Kyle stares at you like you’ve lost your mind. Outside, a plow scrapes past.');
    });
    await narrate('He looks at the printer tray for a long time.');
    await say('kyle', 'Mine. My name. Every month since the refinancing.');
    await say('kyle', 'The overhead rate in July — Dennis’s idea. "Capitalize everything until the refi closes." The tags — he handed me ten blank tags and a list of quantities after the count. And the Polar confirmation came back to my inbox from an address he set up. I forwarded it to the bank anyway.');
    await K.gate('kyle', 'What happens to me?', [
      'I can’t promise you anything. But the bank will see who told the truth first.',
      'Nothing, if you give me Dennis.',
      'You’ll be fine.',
    ], 0, 'dlg.kyle3', async c => {
      if (c === 1) await say('kyle', 'You work for the bank. You can’t promise me anything. Don’t pretend you can.');
      else await say('kyle', 'Don’t. That’s what Dennis says.');
    });
    await say('kyle', 'Okay.');
    await narrate('He opens a file on his laptop: BBC_actual.xlsx. Two tabs. "Bank." And "Real."');
    await say('kyle', 'Dennis keeps both. He doesn’t know I have a copy. Take it.');
    f.kyle_flipped = true;
    K.addEvidence('ev_kyle');
    await K.sleep(500);
    await text('Kyle called me. He’s crying in his truck. You did right by him.');
    await text('Meet me tonight. Inventory control desk, 11 PM. And watch the corridor — Calder Ridge flew someone in this afternoon.');
    await G.ui.blackout();
    f.night3 = true;
    S().night = true;
    E().placePlayer('plant', 38, 7, 'down');
    K.refresh();
    await G.ui.reveal();
    await narrate('11:02 PM. The office wing is dark except for the war room and one light in the corridor.');
  }

  async function asherScene() {
    const e = E(), f = F();
    f.asher_met = true;
    e.faceToward('asher', e.player.x, e.player.y);
    await narrate('A tall man in a charcoal overcoat stands in the corridor as if he’s been waiting there a while. He has.');
    await say('asher', 'You must be {first}. Simon Asher. Calder Ridge. I sit on Northfield’s board.');
    await say('asher', 'I read your file on the plane. Halvorsen. Very impressive. A lesser examiner would have signed off on that trade accrual.');
    await say('asher', 'I wanted to meet you before Monday, because I suspect you’re about to make some people very uncomfortable, and I’d like to understand what you want.');
    await K.gate('asher', null, [
      'What would Calder Ridge pay someone like me?',
      'I work for the bank, Mr. Asher. My report goes to the bank.',
      'Tell me about Polar Cold Storage, Simon.',
    ], 1, 'dlg.asher', async c => {
      if (c === 0) await say('asher', 'More than Lena does. But I don’t think you’re asking seriously. Ask me again when you are.');
      else { await narrate('Something flickers behind his eyes, and is gone.'); await say('asher', 'I don’t know what that is. Should I?'); }
    });
    await say('asher', 'Loyal. That’s rare.');
    await say('asher', 'Here’s a free observation, from someone who’s owned thirty companies: the truth is a very expensive product. Make sure your client actually wants to buy it.');
    await e.walkActor('asher', [['left', 8]]);
    e.removeActor('asher');
    K.refresh();
  }

  async function rosaScene() {
    const f = F();
    E().faceToward('rosa', E().player.x, E().player.y);
    await say('rosa', 'You made it. Sit. You want coffee? It’s bad.');
    await say('rosa', 'Yeah. I’m NIGHTSHIFT. Nineteen years on nights. Eight of them running inventory control.');
    await say('rosa', 'Last March I started finding hollow pallets in aisle F. Cartons stacked around nothing. I reported it to Kyle. Kyle went white and told me to recount. Next week, more hollow pallets.');
    await say('rosa', 'Then I saw tags in the final count I never handed out. My tags. Numbered by me. I’ve kept every tag log since 2019.');
    const c = await choose('you', null, ['Why not go to the bank yourself?', 'Did you write the anonymous note?', 'Thank you, Rosa.']);
    if (c === 0) await say('rosa', 'I’m a single mom in a town with one plant. If Northfield closes, Ashby closes. I didn’t want to burn it down. I wanted someone to fix it.');
    else if (c === 1) await say('rosa', '"Count the freezer yourself." Yeah. Mailed it from Green Bay so the postmark wouldn’t say Ashby.');
    else await say('rosa', 'Thank Walt. He’s the one who pulled you out of my freezer.');
    await say('rosa', 'One more thing. The fake Polar website. I looked it up — the domain was registered through a company called Keystone Registered Agents in Delaware. Means nothing to me.');
    await narrate('It means something to you. Keystone Registered Agents was the Delaware agent for Meridian Retail Solutions LLC.');
    await say('rosa', 'Go finish it, {first}. The bank meets Monday.');
    f.rosa_met = true;
    G.save();
    await toBBC();
  }

  async function toBBC() {
    await K.toChapter(4, { day: 'SUNDAY, JANUARY 3, 2027 · 10:30 AM', title: 'Borrowing Base', text: 'Lena drives up from Chicago through the snow with two coffees and a printed copy of the credit agreement.\n\nThe bank meets tomorrow at nine. Janet Kowalski wants one number.' }, { map: 'plant', x: 38, y: 7, dir: 'up' });
  }

  async function toBank() {
    await text('Rosa here. Walt and I will be in the lot tomorrow. Whatever happens.');
    await K.sleep(700);
    await K.toChapter(5, { day: 'MONDAY, JANUARY 4, 2027 · 9:00 AM', title: 'The Bank', text: 'Janet Kowalski drove up from Milwaukee at five this morning. Simon Asher took the Calder Ridge jet.\n\nDennis Hargrove has brought a binder, a lawyer on speakerphone, and a smile.' }, { map: 'plant', x: 38, y: 8, dir: 'up' });
  }

  async function hearing() {
    const f = F();
    if (!f.janet_intro) {
      f.janet_intro = true;
      await say('janet', 'Morning, {first}. I’ve got Great Lakes’ credit committee at two o’clock and a $412 million exposure. Walk us through it.');
      await say('hargrove', 'Janet, with respect, we’ve banked with you for nine years. I’m happy to address whatever the examiner thinks they found.');
      await narrate('Rebut each claim by presenting the exhibit that contradicts it. Wrong exhibits cost credibility with the bank.');
    } else await say('janet', 'Let’s go again, {first}. Carefully this time.');
    const r = await G.hearing.start(HEARING);
    if (r === 'win') { f.hearing_done = true; G.save(); await ending(); }
    else {
      await text('Breathe. Janet called a recess, not a verdict. Every claim has one exhibit that breaks it.');
      K.refresh();
    }
  }

  async function ending() {
    await K.ending({
      headline: '$26.7M', headlineLabel: 'Phantom inventory',
      epilogue: [
        'Great Lakes Commercial Bank issued a notice of default and reservation of rights that afternoon, swept Northfield’s cash accounts, and demanded the $9.96 million over-advance be repaid within five business days. Calder Ridge wired it on day four.',
        'Dennis Hargrove was terminated for cause. The U.S. Attorney for the Eastern District of Wisconsin charged him with bank fraud in March. The gate log, the missing release knob, and a pair of fingerprints on the freezer door added a charge of reckless endangerment in state court.',
        'Kyle Brandt surrendered his CPA license voluntarily and testified for the government. He now teaches intermediate accounting at a community college, and starts every semester with inventory tag control.',
        'Northfield restated FY26. Gross margin came in at 24.4%. The bank granted a forbearance, Calder Ridge injected $40 million of equity, and the plant in Ashby stayed open.',
        'Rosa Delgado became Northfield’s Director of Inventory Control. Walt Kowalczyk retired in June. The freezer W2 release knob is now welded on.',
        'The domain polarcoldstorage-wi.com was registered through Keystone Registered Agents, Wilmington, Delaware — the same registered agent as Meridian Retail Solutions LLC. When you mentioned this to Lena, she went quiet for a long time.',
        '"Calder Ridge," she said finally. "Let’s keep an eye on them."',
      ],
    });
  }

  // ================================================================ hearing
  const HEARING = {
    title: 'Lender Meeting — Great Lakes Commercial Bank',
    place: 'WAR ROOM, NORTHFIELD FOODS · MON 1/4 9:04 AM',
    objection: 'COUNT IT AGAIN!',
    credLabel: 'Credibility with the bank',
    reaction: 'Janet makes a note and doesn’t look up.',
    rounds: [
      { who: 'hargrove', key: 'r1', evidence: ['ev_margin'], claim: 'Our margin expansion is pricing and efficiency. We took price twice this year. That’s what good operators do.', press: 'You want to second-guess a 94% line efficiency from a spreadsheet? Come walk the floor.', wrong: 'Hargrove: "I don’t see what that has to do with our pricing."',
        after: [['you', 'Price explains about two points of margin. You expanded five-point-three while cheese rose eighteen percent and volume was flat. Meanwhile inventory days went from twenty-eight to forty-three. That isn’t efficiency. That’s cost sitting on the balance sheet.'], ['janet', 'Forty-three days. On frozen pizza.']] },
      { who: 'hargrove', key: 'r2', evidence: ['ev_var', 'ev_kyle'], claim: 'Standard costs were updated in the normal course, and our variances are capitalized in accordance with GAAP.', press: 'Overhead rates change. Plants change. Our auditors reviewed it.', wrong: 'Hargrove: "That’s not about standard costing."',
        after: [['you', 'On July 1st you raised the fixed overhead rate from $38 to $52 an hour because Line 3 was down. ASC 330 says the opposite: you allocate on normal capacity and expense the idle cost. Then you deferred every unfavorable variance — including $2.4 million of pizza Tom Becker personally watched go into a dumpster.'], ['you', 'Seven-point-eight million of GL 1395 should have been expensed.'], ['hargrove', 'That spoilage was reworkable.'], ['you', 'Tom’s disposition form says "destroyed." Finance changed it to "rework."']] },
      { who: 'hargrove', key: 'r3', evidence: ['ev_count', 'ev_kyle'], claim: 'Our year-end count was observed by our independent auditors. Book-to-physical adjustments were immaterial.', press: 'Kessler Ostrom was on site New Year’s Eve. Ask them.', wrong: 'Hargrove: "That has nothing to do with the count."',
        after: [['you', 'Your auditor test-counted three locations in aisle B and left at ten-thirty for a party. I counted aisle F. Three of six pallets were hollow — cartons stacked around empty space. Fifteen percent short. Projected across the freezer: eight-point-four-six million.'], ['you', 'And ten tags in your final count were never issued. Rosa Delgado numbered every one of them.']] },
      { who: 'hargrove', key: 'r4', evidence: ['ev_gatelog'], claim: 'Frankly, Janet, this story about being "locked in a freezer" is theatrics. I was home with my family on New Year’s Eve.', press: 'I’m a fifty-eight-year-old man. I was asleep by eleven.', wrong: 'Hargrove: "And that proves what, exactly?"',
        after: [['you', 'Badge 1007. D. Hargrove. In at the gate at 10:52 PM on New Year’s Eve. Out at 11:31. I was locked in at 11:05.'], ['janet', 'Dennis?'], ['hargrove', '…I forgot my reading glasses.'], ['you', 'Dale Prentiss said that once too.']] },
      { who: 'asher', key: 'r5', evidence: ['ev_3pl', 'ev_kyle'], claim: 'Polar Cold Storage confirmed the offsite inventory in writing, directly to the company. The bank has a copy of that confirmation.', press: 'Third-party confirmations are the gold standard, I’m told. I’m just a board member.', wrong: 'Asher: "I’m afraid I don’t follow."',
        after: [['you', 'That confirmation came from polarcoldstorage-wi.com. Polar’s real domain is polarcold.com. Nobody named K. Lund works there. I called Polar myself from a number on their own website: they hold $6.1 million of your product, not $11.4.'], ['you', 'And two trailers that were supposedly in transit to Green Bay are sitting in your yard under a foot of snow. Seven-point-four million of offsite inventory doesn’t exist.'], ['asher', 'How disappointing.']] },
      { who: 'hargrove', key: 'r6', evidence: ['ev_cutoff'], claim: 'Our cutoff procedures and our reserve methodology haven’t changed in a decade.', press: 'Same policy, same people, same plant.', wrong: 'Hargrove: "That’s not about cutoff or reserves."',
        after: [['you', 'Same policy — just not applied. Three invoices dated December 31st left the gate on January 2nd. One trailer is still in your yard. And your own short-dated policy requires a $3.4 million reserve. You booked $400,000.']] },
      { who: 'janet', key: 'r7', evidence: ['ev_bbc'], claim: '{last}, I need one number for my credit committee. How far over the borrowing base are we, really?', press: 'Not the inventory number. The over-advance. What does Great Lakes need back?', wrong: 'Janet: "That isn’t the number I asked for."',
        after: [['you', 'Inventory is overstated by $26.66 million. At a sixty percent advance rate, corrected availability is $121.04 million. You’ve drawn $131 million. The over-advance is $9.96 million.'], ['you', 'And leverage on corrected EBITDA is about five-point-one times against a four-times covenant. That’s an event of default at December 31st.'], ['janet', 'Thank you. That’s what I needed.']] },
    ],
    async lose() {
      await say('janet', 'I’m going to stop us here. {first}, I can’t walk into credit committee with exhibits that don’t match the claims.');
      await say('hargrove', 'I appreciate that, Janet. We’ll put our responses in writing.');
      await say('janet', 'We’ll reconvene in fifteen minutes.');
    },
    async finale() {
      await say('janet', 'Great Lakes is issuing a notice of default and reservation of rights today. We’re sweeping the cash accounts. Dennis, our counsel will be speaking with the U.S. Attorney’s office.');
      await say('hargrove', '…');
      await narrate('Hargrove leaves with his lawyer still on speakerphone. Simon Asher stays seated, buttoning his coat slowly.');
      await K.gate('asher', 'Calder Ridge has a long memory, {first}.', [
        'Then you’ll remember this was a lending exam, not a vendetta. I’ll be glad to talk to Calder’s auditors.',
        'Is that a threat?',
        'So do federal prosecutors. Bank fraud has a ten-year statute of limitations.',
      ], 2, 'hearing.r8', async c => {
        if (c === 0) await say('asher', 'How generous. You’ll forgive me if I decline.');
        else await say('asher', 'It’s an observation. I make a lot of them.');
      });
      await narrate('Asher smiles as if you’ve told him something he already knew, and leaves without another word.');
    },
  };

  // ================================================================ talk
  const TALK = {
    async deb(ch, f) {
      if (!f.badge) {
        await say('deb', 'You must be the bank’s examiner! Welcome to Northfield. Sign here, here, and initial here. That’s the food safety one.');
        await say('deb', 'Here’s your visitor badge. Mr. Hargrove’s expecting you, corner office down the hall. And you’ll need PPE for the plant floor — visitor locker V-3 in the locker room.');
        f.badge = true; K.obtain('Visitor badge #V-3'); return;
      }
      await say('deb', ['Coffee’s in the break room. It’s terrible.', 'Mr. Hargrove brought donuts today. He never brings donuts.'][f.met_hargrove ? 1 : 0]);
    },
    async hargrove(ch, f) {
      if (ch === 0 && !f.met_hargrove) {
        if (!f.badge) return say('hargrove', 'Badge first, friend. Deb’s strict. Food safety.');
        await say('hargrove', 'There they are! Dennis Hargrove. CFO. Welcome to God’s country.');
        await say('hargrove', 'Janet tells me you’re thorough. Good. We’re an open book. Whatever you need, Kyle will get it for you. Kyle’s our plant controller. Very bright kid.');
        const c = await choose('you', null, ['Why do you think the bank sent me?', 'I’ll need the year-end financial package and the count instructions.', 'Nice office.']);
        if (c === 0) await say('hargrove', 'Somebody mailed them a crank note. Disgruntled employee, probably. We let six people go in October. People get bitter.');
        else if (c === 1) await say('hargrove', 'Kyle has it all. Count’s tomorrow night. Wear layers.');
        else await say('hargrove', 'Thank you. That’s a signed Brett Favre jersey. I don’t forgive him, but I keep it.');
        await say('hargrove', 'Grab your PPE from the locker room before you go out on the floor. Hard hats are mandatory. Even for bankers.');
        f.met_hargrove = true; return;
      }
      if (ch === 3) return say('hargrove', 'Kyle tells me you’re looking at cutoff now. On a Saturday. You really don’t take holidays, do you?');
      await say('hargrove', 'Door’s always open.');
    },
    async kyle(ch, f) {
      if (ch === 0) {
        if (!f.phone_found) return say('kyle', 'Hi— sorry, you’ll want your PPE first. Locker room. Then I can walk you through the package.');
        if (!f.got_pkg) {
          await say('kyle', 'Hey. Kyle. Sorry, it’s been a month. Here — year-end package: quarterly P&L, balance sheet, inventory by location, and the cheese index we track for hedging.');
          await say('kyle', 'Margins are… great. This year. Dennis says it’s pricing.');
          f.got_pkg = true; K.obtain('Northfield FY26 financial package'); return;
        }
        return say('kyle', 'If you need anything else, I’m here until… honestly, I’m always here.');
      }
      if (ch === 1) {
        await say('kyle', 'Aisle F is… it’s complicated to count. Product’s stacked tight back there. The teams already did it.');
        return say('kyle', 'You don’t have to go in. It’s ten below.');
      }
      if (ch === 2 && !f.got_conf) {
        await say('kyle', 'Polar? Sure. We confirm the offsite inventory every year-end. Came back clean on the second.');
        await narrate('He hands you a PDF on a thumb drive: a confirmation on Polar Cold Storage letterhead, $14.6 million, signed "K. Lund, Warehouse Manager."');
        await say('kyle', 'See? Clean.');
        f.got_conf = true; K.obtain('Polar Cold Storage confirmation (via K. Brandt)'); return;
      }
      if (ch === 3 && done('wpCUT') && !f.kyle_flipped) return kyleScene();
      await say('kyle', ['I need to finish the certificate.', 'I haven’t slept.', 'Please don’t— sorry. What do you need?'][ch % 3]);
    },
    async mei(ch, f) {
      if (ch === 0 && done('wpGM') && !f.got_cost) {
        await say('mei', 'Mei Chen. Cost accounting. You want something.');
        await K.gate('you', null, [
          'Dennis already approved this. I need the standard cost revision history and the GL 1395 roll-forward.',
          'Under Section 5.07 of the credit agreement, the bank — my client — has inspection rights over the books and records. I’m requesting the standard cost revision history and the 1395 roll-forward.',
          'I know you’re hiding something, Mei.',
        ], 1, 'dlg.mei', async c => {
          if (c === 0) await say('mei', 'He didn’t. I just asked him about something else and he’d have mentioned it. Please don’t lie to me in my own office.');
          else await say('mei', 'I hide nothing. Everything is in the system. Whether anyone reads it is another question.');
        });
        await say('mei', '…Section 5.07. Good. A real reason.');
        await say('mei', 'Here is every standard cost revision since 2024, with who approved it. And the 1395 roll-forward. Read the July entry. Read my note.');
        f.got_cost = true; K.obtain('Standard cost revision log + GL 1395 roll-forward'); return;
      }
      if (ch === 3 && !f.got_aging) {
        await say('mei', 'You asked properly the first time. So I made this for you already.');
        await narrate('An aging of finished goods by days to best-by date, with the reserve policy stapled to the front.');
        await say('mei', 'The policy is in the binder. The binder has dust on it.');
        f.got_aging = true; K.obtain('Finished goods aging by best-by date'); return;
      }
      await say('mei', ch === 0 ? 'Standard costs are a promise about the future. Variances are what actually happened.' : 'I am working on a Saturday. That should tell you everything.');
    },
    async tom(ch, f) {
      if (ch === 0 && done('wpGM') && !f.got_qa) {
        await say('tom', 'Tom Becker, QA. Line 3? Yeah. August 14th. Compressor on the spiral freezer failed during a run. Product sat at forty-five degrees for six hours.');
        await say('tom', 'Under our food safety plan, that’s a hold and destroy. I watched two-point-four million dollars of pizza go into a dumpster myself.');
        await say('tom', 'Then finance sent back my disposition form with "destroyed" crossed out and "rework" written in. Initialed D.H. I kept a copy of the original.');
        f.got_qa = true; K.obtain('QA incident report — Line 3, Aug 14'); return;
      }
      await say('tom', 'If it touches food, it’s my problem. If it touches the ledger, it’s apparently also my problem.');
    },
    async luis(ch, f) {
      if (ch === 2 && !f.got_bols) {
        await say('luis', 'Luis. Shipping and yard. In-transit to Polar? Here’s the log. Six trailers the last three days of the year. Three-point-two million at standard.');
        await say('luis', 'Thing is, I wasn’t here for two of ’em. And two of those BOL numbers look familiar. We use a printed BOL book. Numbers don’t repeat. Unless somebody makes them.');
        f.got_bols = true; K.obtain('In-transit BOL log — Polar Cold Storage'); return;
      }
      if (ch === 3 && !f.got_ship) {
        await say('luis', 'Last shipments of the year and first of the new one, with gate-out times from Earl’s log. You’ll notice some trucks were invoiced on the 31st and didn’t leave till the 2nd.');
        await say('luis', 'Customers didn’t ask us to hold anything. We just… didn’t send them. Blizzard. Also, Kyle told me to print the invoices anyway.');
        f.got_ship = true; K.obtain('Shipping log with gate-out times'); return;
      }
      await say('luis', ['Every truck that leaves goes past Earl. Every one.', 'Snow’s backing up the whole yard.', 'You need a trailer number, I’m your guy.'][ch % 3]);
    },
    async walt(ch, f) {
      if (ch === 0) return say('walt', 'Walt. Thirty-one years on a forklift. I’ve moved every pallet in this building twice. If you ever want to know where something really is, ask me, not the computer.');
      if (ch === 1 && !f.locked_in) return say('walt', 'Freezer’s ten below. Wear the parka from the suit lockers. And don’t let anybody hurry you back there.');
      if (ch === 1) return say('walt', 'I’m staying right here. Nobody touches that door.');
      await say('walt', ch === 2 ? 'Those two trailers by the fence? Been there since the 28th. I plugged in their reefers myself.' : 'Rosa says you’re all right. Rosa doesn’t say that about anybody.');
    },
    async rosa(ch, f) {
      if (ch === 1 && !f.got_tags) {
        await say('rosa', 'Rosa Delgado. Inventory control. You’re the bank’s person.');
        await say('rosa', 'Here. Tag issuance log, the count instructions, and blank sheets for your test counts. Tags 4401 through 4560 issued tonight. I sign every one out and I sign every one back.');
        await say('rosa', 'Aisle F is in the back. Bring a coat.');
        f.got_tags = true; K.obtain('Tag issuance log & test count sheets'); return;
      }
      if (ch === 1 && tcDone() < 6) return say('rosa', 'Aisle F. Six locations. Count the back rows too.');
      if (ch === 1) return say('rosa', 'Sit at my desk. Write it up while it’s fresh. I’ll get you something hot.');
      if (ch === 3 && f.night3 && !f.rosa_met) return rosaScene();
    },
    async nate(ch, f) {
      await say('nate', 'Nate Pruitt, Kessler Ostrom. Audit senior. I’m observing for the audit. Well — observed. I did my three test counts in aisle B.');
      await say('nate', 'They all tied! So. It’s New Year’s Eve and my girlfriend’s at a party in Milwaukee. Happy New Year!');
      f.nate_left = true;
      await E().walkActor('nate', [['right', 6], ['up', 3]]);
      E().removeActor('nate');
    },
    async jo(ch, f) {
      await say('jo', 'Count team four. We did aisle F at nine-thirty. Kyle gave us the quantities to save time. Said the tags were already filled out.');
      await say('jo', 'We just… checked the front faces. You can’t see the back rows without pulling the pallet.');
    },
    async earl(ch, f) {
      await say('earl', 'Earl. Gate security. Twenty-two years. I see every truck and every badge.');
      if (!f.gate_log) return say('earl', 'The log’s on the computer there. Help yourself. Bank people can see it, Luis said.');
      await say('earl', 'Mr. Hargrove came in New Year’s Eve. Late. Said he forgot something. He didn’t say hello.');
    },
    async lena(ch, f) {
      await say('lena', 'Coffee. Black. Don’t thank me.');
      await say('lena', 'Janet will want the over-advance, not the inventory number. A borrowing base is a formula: advance rate times eligible collateral. Fix the collateral, run the formula, compare to what they’ve drawn.');
      await say('lena', 'And {first}? Keystone Registered Agents. Rosa’s right to flag it. Write it down. Don’t put it in the report yet.');
    },
    async janet(ch, f) { if (ch === 5 && !f.hearing_done) return hearing(); },
    async asher(ch, f) {
      if (ch === 5) return say('asher', 'Good morning, {first}.');
      if (ch === 3 && f.night3 && !f.asher_met) return asherScene();
    },
  };

  // ================================================================ objects
  const FLAVOR = {
    reception: 'A sign-in sheet, a bowl of Badger Bake pizza-flavored crackers, and a snow globe of the plant.',
    logo: 'NORTHFIELD FOODS — "Baked in Wisconsin since 1961." Under new ownership since 2023.',
    lobby_couch: 'Plaid couch. Very Wisconsin.',
    h_shelf: 'Hardcovers on leadership and a framed photo of Hargrove shaking hands with a silver-haired man on a golf course. Engraved plate: "Calder Ridge Partners — Fund III Closing."',
    h_desk: 'A Packers mug, a stack of lender presentations, and a sticky note: "BBC due 1/15 — KEEP >$6M availability."',
    h_pc: 'Locked. The wallpaper is Lambeau Field.',
    h_art: 'A framed Brett Favre jersey. Signed.',
    h_couch: 'Leather. Cold.',
    k_desk: 'A borrowing base certificate in the printer tray, signed "K. Brandt, Plant Controller." Below it, eleven more.',
    k_pc: 'Kyle’s screen: two Excel windows, side by side. He minimizes one when anyone walks in.',
    k_files: 'Monthly close binders. The December binder is twice as thick as the others.',
    k_board: 'Whiteboard: "AVAILABILITY > $6M" circled twice.',
    m_pc: 'Mei’s screen: the standard cost master. Two thousand SKUs. Every one documented.',
    cost_pc: 'A cost accounting workstation. A variance report is printing.',
    m_files: 'Labeled: STANDARD COST REVISIONS 2019–2026. Perfectly indexed.',
    war_table: 'Your war room. Credit agreement, count instructions, a highlighter, cold coffee.',
    war_board: 'Your whiteboard. You’ve written: MARGIN → VARIANCES → COUNT → OFFSITE → CUTOFF → BBC.',
    qa_bench: 'Lab bench: a pH meter, swab kits, a thermometer probe, and a box of hairnets.',
    qa_freezer: 'QA retention freezer. Every lot keeps two retained samples.',
    qa_files: 'Food safety plan, HACCP logs, and incident reports. August is flagged.',
    qa_board: 'Whiteboard: "LINE 3 — COMPRESSOR FAILURE 8/14 — HOLD & DESTROY."',
    cooler: 'Water. Very cold. Of course it is.',
    safety_sign: '212 DAYS WITHOUT A LOST-TIME INJURY. Someone has penciled "+1 freezer?" underneath.',
    lockers: 'Employee lockers. Most have padlocks and stickers: Packers, Brewers, a Bucks logo.',
    locker_bench: 'A bench. Someone left a pair of wool socks.',
    vending: 'Badger Bake Pizza Bites, $1.50. Frozen, somehow, in a non-refrigerated machine.',
    mixer: 'Dough mixers the size of hot tubs.',
    conveyor: 'Conveyor belt. Pizzas ride by, get topped, get frozen, get boxed.',
    oven: 'Impingement ovens, 500°F. You can feel the heat from here.',
    line3: 'Line 3. A red tag on the panel: "SPIRAL FREEZER COMPRESSOR — REPLACED 9/2."',
    spiral: 'A spiral freezer: a tower of belt that takes pizzas from 180°F to −10°F in twenty minutes.',
    forklift: 'A forklift, plugged in to charge.',
    ic_desk2: 'Rosa’s desk: tag logs back to 2019, in labeled binders. A photo of two kids in Packers jerseys.',
    tag_table: 'Count tags, numbered, in rubber-banded stacks. Every stack has a sign-out sheet.',
    freezer_suits: 'Freezer suits and parkas. Name tapes on most of them.',
    freezer_sign: 'FREEZER W2 — −10°F — NEVER ENTER ALONE.',
    ship_files: 'BOL books. Pre-numbered. Each page has three carbon copies.',
    dock_door: 'Dock door. Snow is drifting in under the seal.',
    rack: 'Pizza boxes stacked to the top beam, frosted white.',
    count_desk: 'The count team’s clipboard station. Pens freeze here. Pencils don’t.',
    aisle_sign: 'AISLE F.',
    temp_sign: '−10°F.',
    freezer_forklift: 'A freezer-rated forklift, idling.',
    yard_dock: 'Dock door, closed. A trailer is backed in.',
    yard_sign: 'NORTHFIELD FOODS — SHIPPING — DRIVERS CHECK IN AT GATE.',
    gate_desk: 'Earl’s desk: a thermos, a crossword, and a police scanner turned low.',
    tr_2201: 'NF-2201, backed into dock 1. Reefer humming. Loading for Monday.',
    tr_2224: 'NF-2224, docked. Empty.',
    tr_2207: 'NF-2207. Empty, doors open, drifted full of snow.',
    tr_gl: 'GL-5590, Great Lakes Reefer. Waiting on a load to Minneapolis.',
  };

  async function use(id, ch, f) {
    if (id === 'war_pc') { await usePC(); return true; }
    if (id === 'my_locker') {
      if (!f.met_hargrove) { await narrate('Locker V-3. Visitor PPE. Check in with Hargrove first.'); return true; }
      if (f.phone_found) { await narrate('Your locker. Empty except for a spare hairnet.'); return true; }
      await narrate('Locker V-3: a white visitor hard hat, safety glasses, a hairnet… and a cheap prepaid phone, taped to the inside of the door.');
      await narrate('A strip of masking tape on the phone, in block capitals: *BRING A COAT. COUNT IT YOURSELF. — N*');
      f.phone_found = true; f.hardhat = true; wearHardhat();
      K.addEvidence('ev_note');
      G.ui.updateHud();
      await K.sleep(600);
      await text('You found it. Good. I work nights, so this is how we talk.');
      await text('The bank’s been lied to for a year. I can’t prove all of it. You can. Start with the numbers. They don’t add up and nobody upstairs wants to know why.');
      await text('When you’re stuck I’ll help. When you’re really stuck I’ll just tell you.');
      await narrate(G.touch ? '(Tap *Phone* at the top of the screen to read messages, and *Case File* to review your evidence.)' : '(Press *P* to read the phone. Press *J* to open your case file.)');
      return true;
    }
    if (id === 'ic_desk') {
      if (ch === 1 && tcDone() === 6) { await K.runPuzzle('wpCOUNT'); return true; }
      await narrate('Rosa’s inventory control terminal. The count compilation is open.');
      return true;
    }
    if (TC[id]) {
      if (ch !== 1) { await narrate('A frosted pallet rack.'); return true; }
      if (f[id]) { await narrate('Already counted. It’s on your sheet.'); return true; }
      const obs = {
        tc1: 'Location F04, tag 4402: Northfield Supreme 12". Tag says 96 cases. You pull the pallet and count every layer. *96.* It ties.',
        tc2: 'Location F09, tag 4418: Badger Bake Pepperoni 4-pack. Tag says 120. You count front and back rows. *120.* It ties.',
        tc3: 'Location F12, tag 4471: Northfield Four Cheese 12". Tag says 112. The front faces are full… but the back two rows are empty cartons, taped shut. You count *72.*',
        tc4: 'Location F15, tag 4479: Badger Bake Cheese 4-pack. Tag says 140. *140.* It ties.',
        tc5: 'Location F21, tag 4502: Northfield Thin Margherita. Tag says 108. The pallet is a hollow square — cartons stacked around an empty core you could sit in. You count *72.*',
        tc6: 'Location F27, tag 4533: Skillet Meals Chicken Alfredo. Tag says 160. The bottom layer is different, older cases with the labels peeled. You count *135* that are what the tag says they are.',
      };
      await narrate(obs[id]);
      f[id] = true;
      G.audio.select();
      K.refresh();
      if (tcDone() === 6 && !f.locked_in) await lockIn();
      return true;
    }
    if (id === 'ship_phone') {
      if (ch === 2 && f.got_conf && !f.got_polar) {
        await narrate('The shipping office desk phone. The Polar Cold Storage confirmation lists a number on its letterhead.');
        await K.gate('you', 'Which number do you call?', [
          'The number on the confirmation letterhead.',
          'The number on Polar’s own website and its Wisconsin business registration.',
          'Ask Kyle for his contact there.',
        ], 1, 'dlg.polar', async c => {
          if (c === 0) await narrate('Voicemail. A generic greeting: "You’ve reached Polar. Leave a message." No name, no department. You hang up.');
          else await narrate('Kyle’s contact is "K. Lund." Whose email came back to Kyle. You put the phone back down.');
        });
        await narrate('polarcold.com. Green Bay. A weekend supervisor picks up on the second ring.');
        await say(null, '"Polar Cold Storage, this is Gina Marchetti. Northfield? Sure, I can pull that… We show a hundred fifty-one pallets of Northfield product on hand at 12/31. About six-point-one million at your standard cost."');
        await say(null, '"K. Lund? No, nobody here by that name. Our domain is polarcold.com — no \'w-i\' anything. I’ll email the report straight to you."');
        f.got_polar = true; K.obtain('Direct report from Polar Cold Storage (G. Marchetti)');
        return true;
      }
      await narrate('The shipping office phone. A list of carrier numbers is taped to the receiver.');
      return true;
    }
    if (id === 'ship_pc') { await narrate('Luis’s screen: the yard management system. Thirty-one trailers on site.'); return true; }
    if (id === 'tr_2231' || id === 'tr_2240' || id === 'tr_2236') {
      const n = id.slice(3);
      const lines = {
        '2231': 'Trailer NF-2231. A foot of snow on the roof. The seal on the doors: #0448812, intact. The reefer unit is running — plugged into a yard post. The in-transit log says this trailer left for Green Bay on 12/30.',
        '2240': 'Trailer NF-2240. Seal #0448830, intact, snow-crusted. Reefer running. Supposedly on the road to Polar since 12/31.',
        '2236': 'Trailer NF-2236. Sealed, loaded. The paperwork in the door pocket: Harbor Foods, invoice 610462, dated 12/31. It never left the yard.',
      };
      await narrate(lines[n]);
      if (ch === 2) { f['seen_' + n] = true; K.refresh(); }
      return true;
    }
    if (id === 'gate_log') {
      await narrate('Earl’s gate log terminal. You search badge swipes for 12/31 and trailer movements since 12/28.');
      await narrate('*Badge 1007 — D. HARGROVE — IN 22:52 — OUT 23:31.* New Year’s Eve. Trailers NF-2231 and NF-2240: last gate movement 12/28, inbound. No outbound since.');
      if (!f.gate_log) { f.gate_log = true; K.addEvidence('ev_gatelog'); }
      K.refresh();
      return true;
    }
    if (id.startsWith('tr_')) return false;
    return false;
  }

  async function usePC() {
    const f = F(), ch = S().chapter;
    if (ch === 0) {
      if (!f.got_pkg) return narrate('The war room laptop. You need Kyle’s financial package before there’s anything to analyze.');
      if (!done('wpGM')) return K.runPuzzle('wpGM');
      if (!f.got_cost || !f.got_qa) return narrate('You need Mei’s standard cost history and Tom’s QA report before you can test the variances.');
      return K.runPuzzle('wpVAR');
    }
    if (ch === 1) return narrate('Not now. The count is happening in the freezer.');
    if (ch === 2) {
      if (!f.got_conf || !f.got_polar || !f.got_bols || !f.seen_2231 || !f.seen_2240 || !f.gate_log) return narrate('You need the confirmation, Polar’s direct report, the BOL log, and your own eyes on those trailers before you conclude.');
      return K.runPuzzle('wp3PL');
    }
    if (ch === 3) {
      if (f.night3) return narrate('11 PM. NIGHTSHIFT is waiting downstairs.');
      if (!f.got_ship || !f.got_aging) return narrate('You need Luis’s shipping log and Mei’s aging report.');
      if (!done('wpCUT')) return K.runPuzzle('wpCUT');
      return narrate('Cutoff is done. Kyle is next.');
    }
    if (ch === 4) return K.runPuzzle('wpBBC');
    return narrate('Everything you need is in the case file.');
  }

  function onStep(x, y, s) {
    const f = s.flags;
    if (s.map === 'plant' && x === 6 && y === 32) {
      if (s.chapter === 1 && f.got_tags && !f.locked_in) { E().script(async () => { await K.travel('freezer', 4, 1, 'down', { sound: () => G.audio.door() }); await narrate('The cold hits like a slap. Your eyelashes start to stiffen within seconds.'); }); }
      else E().script(async () => { await narrate(s.chapter === 1 && f.locked_in ? 'Walt is guarding the door. You’re not going back in there tonight.' : 'Freezer W2. Ten below zero. You have no reason to go in right now.'); E().placePlayer('plant', 6, 31, 'up'); });
    }
    if (s.map === 'freezer' && y === 0) E().script(() => K.travel('plant', 6, 31, 'up', { sound: () => G.audio.door() }));
    if (s.map === 'plant' && x === 49 && y === 30) {
      if (s.chapter === 2 && f.got_bols) E().script(async () => { await K.travel('yard', 3, 2, 'down', { sound: () => G.audio.door() }); await narrate('Snow, wind off the lake, and rows of trailers humming in the dark.'); });
      else E().script(async () => { await narrate('The yard door. A blizzard is blowing outside. No reason to go out there yet.'); E().placePlayer('plant', 48, 30, 'left'); });
    }
    if (s.map === 'yard' && x === 3 && y === 1) E().script(() => K.travel('plant', 48, 30, 'left', { sound: () => G.audio.door() }));
    if (s.map === 'plant' && s.chapter === 3 && f.night3 && !f.asher_met && y >= 10 && y <= 11) E().script(asherScene);
    if (s.map === 'plant' && s.chapter === 5 && !f.hearing_done && !f.janet_intro && x >= 35 && x <= 41 && y <= 8) E().script(hearing);
  }

  // ================================================================ workpapers
  const QTRS = ['Q1 FY25', 'Q2 FY25', 'Q3 FY25', 'Q4 FY25', 'Q1 FY26', 'Q2 FY26', 'Q3 FY26', 'Q4 FY26'];
  const SALES = [251.2, 258.9, 262.4, 268.0, 259.7, 266.1, 272.8, 281.4];
  const COGS = [191.4, 197.0, 199.5, 203.7, 194.8, 195.9, 196.1, 199.0];
  const INV = [58.8, 60.1, 59.6, 61.2, 66.9, 74.3, 83.5, 92.4];
  const CHEESE = [1.72, 1.75, 1.78, 1.80, 1.92, 2.01, 2.08, 2.12];
  const CASES = [9.62, 9.74, 9.79, 9.81, 9.55, 9.68, 9.70, 9.74];

  const defs = {};
  defs.wpGM = {
    ref: 'WP N-1 · ANALYTICAL PROCEDURES',
    title: 'Gross Margin, Input Costs & Days Inventory on Hand',
    intro: 'Pizza is cheese, flour and labor. Cheese went up. Margins went up too. That doesn’t happen.',
    header() {
      let h = '<div class="wp-meta"><span>Entity: <b>Northfield Foods, Inc.</b></span><span>Source: <b>FY26 financial package (K. Brandt)</b></span><span>$ in millions; cheese index $/lb; cases in millions</span></div>';
      h += '<div class="tbl-wrap"><table class="ledger"><tr><th></th>' + QTRS.map(q => '<th class="num">' + q + '</th>').join('') + '</tr>';
      const row = (l, a, d = 1, cls = '') => '<tr class="' + cls + '"><td>' + l + '</td>' + a.map(v => '<td class="num">' + (v == null ? '<b style="color:#b8312f">?</b>' : v.toFixed(d)) + '</td>').join('') + '</tr>';
      h += row('Net sales', SALES) + row('Cost of goods sold', COGS);
      h += row('Gross margin %', SALES.map((s, i) => (s - COGS[i]) / s * 100), 1, 'total');
      h += row('Inventory, end of quarter', INV);
      h += row('Cases shipped (M)', CASES, 2);
      h += row('Cheese block index ($/lb)', CHEESE, 2);
      h += '</table></div>';
      h += '<h4>Gross margin vs. cheese cost</h4><div class="chart-card"><canvas id="gmchart"></canvas></div>';
      h += '<div class="wp-note">Management commentary (D. Hargrove, Q3 lender call): "Margin expansion reflects two pricing actions and Line 1 efficiency of 94%." Pricing actions: +2.0% (Feb), +1.5% (Aug). Cheese is ~31% of COGS.</div>';
      return h;
    },
    afterHeader(body) {
      multiLine(body.querySelector('#gmchart'), QTRS, [
        { label: 'Gross margin %', color: '#1f3a2e', data: SALES.map((s, i) => (s - COGS[i]) / s * 100) },
        { label: 'Cheese index × 10', color: '#c94a3a', data: CHEESE.map(v => v * 10), dash: true },
      ], { h: 200, fmt: v => v.toFixed(0) });
    },
    steps: [
      num('dio', 'Compute days inventory on hand (DIO) for Q4 FY26, using ending inventory and the quarter’s COGS over 92 days.', {
        answerText: '42.7', placeholder: 'days', suffix: 'days',
        check(v) {
          if (Math.abs(v - 42.7) <= 0.1) return true;
          if (Math.abs(v - 27.6) <= 0.1) return 'That’s Q4 FY25. You want Q4 FY26.';
          if (Math.abs(v - 0.46) <= 0.02 || Math.abs(v - 46.4) <= 0.2) return 'Close the ratio first: inventory ÷ COGS. Then multiply by the days in the quarter.';
          return 'Doesn’t tie. DIO = ending inventory ÷ COGS × days in period.';
        },
      }, { okMsg: '92.4 ÷ 199.0 × 92 = <b>42.7 days</b>, up from 27.6 a year ago. Inventory grew 51% while COGS fell.' }),
      num('excess', 'If Q4 FY26 had earned FY25’s 24.0% gross margin, how much lower would gross profit be? ($M)', {
        answerText: '14.9', placeholder: '$M', suffix: '$M',
        check(v) {
          v = M(v);
          if (Math.abs(v - 14.86) <= 0.1) return true;
          if (Math.abs(v - 82.4) <= 0.1) return 'That’s reported gross profit. Compare it to gross profit at a 24.0% margin.';
          if (Math.abs(v - 67.5) <= 0.1) return 'That’s gross profit at 24.0%. Now the difference.';
          return 'Doesn’t tie. Reported GP (sales − COGS) minus 24.0% × sales.';
        },
      }, { okMsg: '$82.4M reported vs. $67.5M at a 24.0% margin: <b>$14.9M</b> of gross profit in one quarter that pricing doesn’t explain.' }),
      mc('why', 'Margin up 5.3 points, cheese up 18%, volume flat, inventory up 51%. What best explains the pattern?', [
        { t: 'Pricing power — two price increases flowed to the bottom line.', ok: false, why: 'Two price increases total ~3.5%. With cheese at 31% of COGS up 18%, pricing roughly offsets input inflation — it can’t add five points of margin, and it doesn’t make inventory pile up.' },
        { t: 'Favorable mix shift toward premium SKUs.', ok: false, why: 'Mix can nudge margin a point, but it doesn’t build 51% more inventory on flat case volume.' },
        { t: 'Costs are being capitalized into inventory instead of flowing to COGS — inventory is overstated and COGS understated.', ok: true, why: 'Every dollar of cost that stays on the balance sheet is a dollar of COGS that never hits the P&L. Rising DIO plus impossible margin is the classic signature of inventory overstatement.' },
        { t: 'A LIFO liquidation released older, cheaper layers into COGS.', ok: false, why: 'Northfield uses FIFO standard cost. And a LIFO liquidation <i>shrinks</i> inventory; this one grew by half.' },
      ]),
    ],
    conclusion: 'Northfield’s margin expansion is coming from the balance sheet, not the plant floor.',
  };

  defs.wpVAR = {
    ref: 'WP N-2 · INVENTORY COSTING (ASC 330)',
    title: 'Standard Cost Revisions & Capitalized Variances (GL 1395)',
    intro: 'Mei writes everything down. Read the July entry. Then read Tom’s August report.',
    header() {
      let h = '<div class="wp-meta"><span>Sources: <b>Standard cost revision log & GL 1395 (M. Chen); QA incident report 8/14 (T. Becker)</b></span><span>$ in millions</span></div>';
      h += '<h4>Standard cost revision log — fixed overhead</h4><div class="tbl-wrap"><table class="ledger"><tr><th>Effective</th><th>Item</th><th class="num">Old</th><th class="num">New</th><th>Reason given</th><th>Approved</th></tr>' +
        '<tr><td>01/01/2026</td><td>Fixed OH rate / DLH</td><td class="num">$37.40</td><td class="num">$38.00</td><td class="wrap">Annual update</td><td>M. Chen / D. Hargrove</td></tr>' +
        '<tr class="hl"><td>07/01/2026</td><td>Fixed OH rate / DLH</td><td class="num">$38.00</td><td class="num">$52.00</td><td class="wrap">"Updated for current capacity" (Line 3 down)</td><td>D. Hargrove</td></tr></table></div>';
      h += '<div class="wp-note">M. Chen note, 7/2: Normal capacity is 412,000 DLH per half-year. H2 actual will be ~301,000 due to Line 3. Raising the rate allocates idle-capacity cost to inventory. I objected in writing. Overruled.</div>';
      h += '<h4>GL 1395 — Capitalized manufacturing variances, FY26</h4><div class="tbl-wrap"><table class="ledger"><tr><th></th><th class="num">Q1</th><th class="num">Q2</th><th class="num">Q3</th><th class="num">Q4</th><th class="num">FY26</th></tr>' +
        '<tr><td>Unfavorable variances deferred</td><td class="num">1.2</td><td class="num">1.3</td><td class="num">3.6</td><td class="num">3.5</td><td class="num">9.6</td></tr>' +
        '<tr><td>&nbsp;&nbsp;of which: Line 3 product loss 8/14</td><td class="num">—</td><td class="num">—</td><td class="num">2.4</td><td class="num">—</td><td class="num">2.4</td></tr>' +
        '<tr><td>Expensed to COGS</td><td class="num">0.0</td><td class="num">0.0</td><td class="num">0.0</td><td class="num">0.0</td><td class="num">0.0</td></tr>' +
        '<tr class="total"><td>Ending balance (in inventory)</td><td class="num">1.2</td><td class="num">2.5</td><td class="num">6.1</td><td class="num">9.6</td><td class="num">9.6</td></tr></table></div>';
      h += '<div class="wp-note">Prior policy (FY25): variances allocated between inventory and COGS based on turnover. FY26: 100% deferred "pending standard cost true-up." Turnover analysis: <b>25%</b> of FY26 H2 production remains in ending inventory.</div>';
      h += '<div class="wp-exhibit"><b>QA Incident Report 8/14 (T. Becker):</b> Line 3 spiral freezer compressor failure. 6 hrs at 45°F. Disposition: <s>DESTROYED</s> <i>rework</i> (changed by D.H.). Product value $2.4M. QA original: destroyed per food safety plan.</div>';
      return h;
    },
    steps: [
      mc('abnormal', 'Which deferred variance is an abnormal cost that ASC 330-10-30-7 requires to be expensed as incurred, not capitalized?', [
        { t: 'The $2.4M Line 3 product loss from the August freezer failure.', ok: true, why: 'Excessive spoilage is listed in ASC 330-10-30-7 alongside idle facility expense, double freight and rehandling. Destroyed pizza has no future benefit; it can’t sit in inventory.' },
        { t: 'Cheese purchase price variance from the commodity spike.', ok: false, why: 'A purchase price variance is a normal cost of production — it gets allocated between inventory and COGS, not expensed in full.' },
        { t: 'Labor efficiency variance on Line 1.', ok: false, why: 'Normal operating variance. Allocate it; don’t expense it wholesale.' },
        { t: 'Freight-in variance on flour deliveries.', ok: false, why: 'Normal freight-in is an inventoriable cost. Only <i>double</i> freight or rehandling is abnormal.' },
      ]),
      num('over', 'Remove the abnormal item, then allow only the portion of normal variances that belongs in ending inventory (25%). By how much is GL 1395 overstated? ($M)', {
        answerText: '7.8', placeholder: '$M', suffix: '$M',
        check(v) {
          v = M(v);
          if (Math.abs(v - 7.8) <= 0.05) return true;
          if (Math.abs(v - 1.8) <= 0.05) return '$1.8M is what <i>should</i> be in 1395. You want the overstatement.';
          if (Math.abs(v - 7.2) <= 0.05) return '$7.2M is the normal variance. Only 75% of it should have been expensed — and the spoilage needs to come out entirely.';
          if (Math.abs(v - 5.4) <= 0.05) return 'You expensed 75% of normal variances but forgot to expense the $2.4M spoilage.';
          if (Math.abs(v - 9.6) <= 0.05) return 'Not all of it is wrong. A quarter of the normal variances legitimately belongs in inventory.';
          return 'Doesn’t tie. Normal = 9.6 − 2.4. Proper balance = 25% of normal. Overstatement = 9.6 − proper balance.';
        },
      }, { okMsg: 'Proper balance: 25% × $7.2M = $1.8M. GL 1395 is overstated by <b>$7.8M</b>.' }),
      mc('rate', 'On 7/1 the fixed overhead rate rose from $38 to $52 per direct labor hour because Line 3 downtime cut production below normal capacity. What’s wrong with that?', [
        { t: 'Nothing — standard costs should reflect current actual capacity so inventory carries full cost.', ok: false, why: 'That’s exactly what ASC 330 prohibits. Allocating fixed overhead over a smaller base loads idle-capacity cost into every unit.' },
        { t: 'ASC 330-10-30-3: fixed overhead is allocated based on normal capacity. Low production doesn’t increase the per-unit amount; unallocated overhead is expensed in the period incurred.', ok: true, why: 'Right. The ~111,000 idle DLH are a period cost. Raising the rate moved that cost onto the balance sheet. (Mei is recalculating the effect; it’s excluded from your totals for now — conservative.)' },
        { t: 'The change required retrospective application as a change in accounting principle under ASC 250.', ok: false, why: 'Updating a standard isn’t a change in principle. The problem is the GAAP violation, not the transition method.' },
        { t: 'Overhead rates may only change at fiscal year-end.', ok: false, why: 'Standards can be revised any time. The issue is <i>why</i> this one was revised.' },
      ]),
    ],
    conclusion: '$7.8M of costs that belonged in the P&L were parked in GL 1395, on the CFO’s instruction and over the cost accountant’s written objection.',
  };

  const COUNT = [
    ['F04', 'Northfield Supreme 12"', 4402, 96, 96, 96, 41.25],
    ['F09', 'Badger Bake Pepperoni 4pk', 4418, 120, 120, 120, 28.50],
    ['F12', 'Northfield Four Cheese 12"', 4471, 112, 112, 72, 39.75],
    ['F15', 'Badger Bake Cheese 4pk', 4479, 140, 140, 140, 30.00],
    ['F21', 'Northfield Thin Margherita', 4502, 108, 108, 72, 40.00],
    ['F27', 'Skillet Meals Chicken Alfredo', 4533, 160, 160, 135, 22.80],
  ];
  defs.wpCOUNT = {
    ref: 'WP N-3 · PHYSICAL INVENTORY OBSERVATION (AU-C 501)',
    title: 'Freezer W2 — Test Counts, Projection & Tag Control',
    intro: 'You counted with your own hands. Now make it a number the bank can use.',
    header() {
      return '<div class="wp-meta"><span>Location: <b>Freezer W2, aisle F</b></span><span>Counted: <b>12/31/2026, 22:10–23:00</b></span><span>Freezer population at book: <b>$56,400,000</b></span><span>Observer: <b>you (bank examiner)</b></span></div>' +
        '<div class="wp-note">External auditor (Kessler Ostrom) test-counted 3 locations in aisle B, all agreed, and departed 22:30. Count team 4 reported aisle F "per tags."</div>';
    },
    steps: [
      multiPick('exceptions', 'Select every location where your test count does not support the tag and book quantity.', [
        { t: 'Loc' }, { t: 'SKU' }, { t: 'Tag #' }, { t: 'Book cases', num: 1 }, { t: 'Tag qty', num: 1 }, { t: 'Your count', num: 1 }, { t: 'Std cost / case', num: 1 },
      ], COUNT.map(r => ({ ok: r[5] !== r[4], why: 'Location ' + r[0] + ': your count agrees to the tag and book. No exception.', cells: [r[0], r[1], r[2], r[3], r[4], r[5], '$' + r[6].toFixed(2)] })), { okMsg: 'F12 short 40 ($1,590), F21 short 36 ($1,440), F27 short 25 ($570). Sample overstatement: <b>$3,600</b> on $24,000 of book value.' }),
      num('project', 'Project the sample error rate to the entire freezer population. What is the projected overstatement?', {
        answerText: '$8,460,000', placeholder: '$', suffix: 'USD',
        check(v) {
          v = M(v);
          if (Math.abs(v - 8.46) <= 0.01) return true;
          if (Math.abs(v - 0.0036) < 0.001 || Math.abs(v - 3600) < 1) return 'That’s the sample shortfall. Turn it into a rate and apply it to $56.4M.';
          if (Math.abs(v - 15) < 0.1) return '15% is the rate. Apply it to the $56.4M population.';
          return 'Doesn’t tie. Ratio estimate: (sample overstatement ÷ sample book value) × population book value.';
        },
      }, { okMsg: '$3,600 ÷ $24,000 = 15.0%. × $56.4M = <b>$8.46M</b> projected overstatement.' }),
      mc('tags', 'Rosa’s tag log: tags 4401–4560 issued; 4540–4549 marked "VOID — damaged" and retained by K. Brandt rather than returned. The final count compilation includes tags 4561–4570, totaling $1.9M. What does this indicate?', [
        { t: 'Clerical error — the compilation pulled tags from next year’s sequence.', ok: false, why: 'Tags aren’t pre-assigned to years. Ten consecutive unissued tags with quantities on them didn’t appear by accident.' },
        { t: 'Tags outside the issued sequence were added after the count — fictitious inventory inserted into the compilation. The unreturned "void" tags create the same risk. That’s exactly what tag control exists to prevent.', ok: true, why: 'Pre-numbered tags, issued and accounted for in sequence, are how an observer knows the compilation contains only what was counted. 4561–4570 were never in anyone’s hands on count night.' },
        { t: 'Nothing, provided the auditor’s three test counts agreed.', ok: false, why: 'The auditor counted aisle B. Tag control covers the whole population; three agreed counts don’t validate ten tags nobody issued.' },
        { t: 'A cutoff issue — the tags represent goods received after year-end.', ok: false, why: 'Receiving after year-end would be documented on receiving reports, not on count tags nobody issued.' },
      ]),
    ],
    conclusion: 'Hollow pallets in aisle F and tags nobody issued. The freezer is overstated by about $8.46 million.',
  };

  const BOLS = [
    ['88121', 'NF-2218', '12/29', 14, 560000, 'Received 01/02 — signed POD', false],
    ['88127', 'NF-2231', '12/30', 13, 520000, 'No receipt', true, 'Your yard check: trailer in Northfield’s yard, seal #0448812 intact'],
    ['88130', 'NF-2240', '12/31', 15, 600000, 'No receipt', true, 'Your yard check: in yard, seal intact, no gate-out since 12/28'],
    ['88131', 'GL-5512 (Great Lakes Reefer)', '12/31', 12, 540000, 'Received 01/02 — signed POD', false],
    ['87764', 'NF-2209', '12/30', 12, 480000, 'BOL # already received 11/18', true],
    ['87790', 'NF-2213', '12/31', 12, 500000, 'BOL # already received 11/24', true],
  ];
  defs.wp3PL = {
    ref: 'WP N-4 · INVENTORY HELD BY THIRD PARTIES (AU-C 501.A41 / AS 2510)',
    title: 'Polar Cold Storage, Green Bay — Confirmation & In-Transit',
    intro: 'A confirmation is only as good as who controls the envelope.',
    header() {
      let h = '<div class="wp-meta"><span>Book: location <b>WH-PCS</b> (includes in-transit at BOL creation)</span><span>Book balance 12/31: <b>$14,600,000</b> (on hand $11.4M + in transit $3.2M)</span></div>';
      h += '<div class="wp-exhibit"><b>Exhibit A — Confirmation obtained by management.</b> Request sent by K. Brandt 12/28; reply received by K. Brandt 1/2 from <b>k.lund@polarcoldstorage-wi.com</b>. Letterhead: Polar Cold Storage, LLC. Confirms 361 pallets / $14,600,000. Signed "K. Lund, Warehouse Manager."</div>';
      h += '<div class="wp-exhibit"><b>Exhibit B — Report obtained directly by examiner.</b> Called Polar via number on polarcold.com and WI DFI registration; report emailed by G. Marchetti, Inventory Supervisor, from <b>@polarcold.com</b>: Northfield-owned pallets on hand 12/31 = <b>151 pallets / $6,100,000</b> at Northfield standard. "No employee named K. Lund."</div>';
      return h;
    },
    steps: [
      mc('conf', 'What most undermines the reliability of Exhibit A?', [
        { t: 'It was signed by a warehouse manager rather than an officer of Polar.', ok: false, why: 'A knowledgeable warehouse manager is an appropriate respondent. The problem is that nobody can show this one exists.' },
        { t: 'The pallet count in the confirmation differs from the book.', ok: false, why: 'It agrees perfectly with the book — which is exactly what you’d expect from a document written by the people keeping the book.' },
        { t: 'Management controlled the request and the response, and the reply came from a look-alike domain. The confirmer must control the process end to end (AU-C 505 / AS 2310); this "confirmation" is management’s own representation.', ok: true, why: 'A confirmation that passes through the client’s hands is not external evidence. Combined with a domain that isn’t Polar’s and a signer who doesn’t exist, Exhibit A is a fabrication.' },
        { t: 'It’s dated January 2nd, after year-end.', ok: false, why: 'Confirmations as of the balance sheet date are routinely returned afterward.' },
      ]),
      multiPick('bols', 'Select every in-transit BOL that is <i>not</i> supported as genuine inventory in transit to Polar at 12/31.', [
        { t: 'BOL' }, { t: 'Trailer' }, { t: 'BOL date' }, { t: 'Pallets', num: 1 }, { t: 'Standard cost', num: 1 }, { t: 'Polar receiving', wrap: 1 }, { t: 'Other evidence', wrap: 1 },
      ], BOLS.map(b => ({ ok: b[6], why: 'BOL ' + b[0] + ' was received by Polar on 1/2 with a signed proof of delivery. That’s genuine in-transit inventory.', cells: [b[0], b[1], b[2], b[3], fmt(b[4]), b[5], b[7] || ''] })), { okMsg: '88127 and 88130: the trailers never left the yard. 87764 and 87790: BOL numbers Polar already received in November — recycled to manufacture in-transit. $2.1M of the $3.2M is fiction.' }),
      num('total', 'Total overstatement of inventory at location WH-PCS? ($M)', {
        answerText: '7.4', placeholder: '$M', suffix: '$M',
        check(v) {
          v = M(v);
          if (Math.abs(v - 7.4) <= 0.01) return true;
          if (Math.abs(v - 8.5) <= 0.01) return 'You haven’t given credit for the $1.1M of in-transit inventory that really was on its way to Polar.';
          if (Math.abs(v - 5.3) <= 0.01) return 'That’s only the on-hand difference ($11.4M vs $6.1M). Add the fake in-transit.';
          if (Math.abs(v - 2.1) <= 0.01) return 'That’s only the fake in-transit. Polar’s on-hand is also short.';
          return 'Doesn’t tie. Book $14.6M − what Polar really holds − genuine in-transit.';
        },
      }, { okMsg: '$14.6M − $6.1M − $1.1M = <b>$7.4M</b> of offsite inventory that doesn’t exist.' }),
    ],
    conclusion: 'Polar Cold Storage holds $6.1M of Northfield product, not $14.6M. The confirmation the bank relied on was forged.',
  };

  const SHIP = [
    ['610441', 'Harbor Foods', '12/30', '12/30 16:12', 412000, false],
    ['610455', 'MidWest Grocers Co-op', '12/31', '12/31 11:40', 388500, false],
    ['610460', 'Harbor Foods', '12/31', '01/02 06:15', 455200, true],
    ['610461', 'Great Plains Market', '12/31', '01/02 07:02', 398000, true],
    ['610462', 'Harbor Foods', '12/31', 'Not gated out (NF-2236 in yard)', 386300, true],
    ['700001', 'MidWest Grocers Co-op', '01/02', '01/02 09:30', 402100, false],
  ];
  defs.wpCUT = {
    ref: 'WP N-5 · CUTOFF & VALUATION',
    title: 'Year-End Shipping Cutoff & Short-Dated Inventory Reserve',
    intro: 'Paper says it shipped. The gate says it didn’t. And some of what’s in that freezer expired in October.',
    header() {
      return '<div class="wp-meta"><span>Terms: <b>FOB shipping point</b> — control transfers when the carrier departs</span><span>Sources: <b>invoice register, BOL book, gate log (L. Ortega); FG aging (M. Chen)</b></span></div>' +
        '<div class="wp-note">No customer requested a bill-and-hold arrangement. Plant closed 12/31 at 14:00 for the holiday; blizzard closed roads 12/31 18:00 – 1/2 05:00.</div>';
    },
    steps: [
      multiPick('cutoff', 'Select every shipment improperly recognized as FY26 revenue.', [
        { t: 'Invoice' }, { t: 'Customer' }, { t: 'Invoice date' }, { t: 'Gate-out (Earl’s log)', wrap: 1 }, { t: 'Sales $', num: 1 },
      ], SHIP.map(r => ({ ok: r[5], why: 'Invoice ' + r[0] + ' is properly recorded — it left the gate in the period it was invoiced.', cells: [r[0], r[1], r[2], r[3], fmt(r[4])] })), { okMsg: '610460, 610461 and 610462: <b>$1,239,500</b> of revenue recorded in FY26 for product that was still in Ashby on New Year’s Day.' }),
      mc('fix', 'What’s the correct treatment of those three invoices at 12/31?', [
        { t: 'Reverse the sales and receivables into FY27 and restore the product to inventory at cost (Dr Inventory / Cr COGS): control hadn’t transferred (ASC 606-10-25-30) and the bill-and-hold criteria aren’t met.', ok: true, why: 'Under FOB shipping point, control passes when the carrier takes the goods. These didn’t move. Without a customer-requested bill-and-hold, there’s no sale yet.' },
        { t: 'No adjustment — the invoices and BOLs are dated 12/31.', ok: false, why: 'Paper dates don’t transfer control. The gate log shows where the pizza was.' },
        { t: 'Leave revenue, but record the shipping cost in FY27.', ok: false, why: 'The problem is the revenue, not the freight.' },
        { t: 'Record as consignment sales.', ok: false, why: 'There’s no consignment arrangement, and consignment wouldn’t accelerate revenue anyway — it defers it.' },
      ]),
      num('eo', 'Finished goods by days to best-by: expired $1.2M; 0–30 days $0.9M; 30–60 days $2.6M; 60–90 days $3.1M; 90+ days $38.7M. Policy reserves 100% for expired and 0–30 days, 50% for 30–60 days, and none beyond 60. The recorded reserve is $0.4M. What is the reserve shortfall? ($M)', {
        answerText: '3.0', placeholder: '$M', suffix: '$M',
        check(v) {
          v = M(v);
          if (Math.abs(v - 3.0) <= 0.01) return true;
          if (Math.abs(v - 3.4) <= 0.01) return '$3.4M is the required reserve. Subtract what’s already booked.';
          if (Math.abs(v - 4.3) <= 0.01) return 'Apply 50% to the 30–60 day bucket, not 100%.';
          return 'Doesn’t tie. Required = 1.2 + 0.9 + 50% × 2.6. Shortfall = required − 0.4.';
        },
      }, { okMsg: 'Required $3.4M vs. $0.4M recorded: a <b>$3.0M</b> shortfall. Short-dated frozen pizza is worth what a liquidator pays for it.' }),
    ],
    conclusion: '$1.24M of January revenue booked in December and a $3.0M hole in the short-dated reserve.',
  };

  defs.wpBBC = {
    ref: 'WP N-6 · BORROWING BASE & COVENANT RECALCULATION',
    title: 'Great Lakes ABL — Borrowing Base Certificate as of 12/31/2026',
    intro: 'The bank doesn’t lend against pizza. It lends against a formula. Fix the inputs, run the formula.',
    header() {
      let h = '<div class="wp-meta"><span>Credit agreement §2.01: availability = <b>85%</b> eligible AR + <b>60%</b> eligible inventory</span><span>Revolver drawn 12/31: <b>$131.0M</b></span><span>$ in millions</span></div>';
      h += '<h4>Borrowing base certificate as submitted (signed K. Brandt)</h4><div class="tbl-wrap"><table class="ledger"><tr><th></th><th class="num">Collateral</th><th class="num">Advance rate</th><th class="num">Availability</th></tr>' +
        '<tr><td>Eligible receivables</td><td class="num">96.00</td><td class="num">85%</td><td class="num">81.60</td></tr>' +
        '<tr><td>Eligible inventory</td><td class="num">92.40</td><td class="num">60%</td><td class="num">55.44</td></tr>' +
        '<tr class="total"><td>Total availability</td><td></td><td></td><td class="num">137.04</td></tr>' +
        '<tr><td>Revolver outstanding</td><td></td><td></td><td class="num">(131.00)</td></tr>' +
        '<tr class="total"><td>Excess availability (reported)</td><td></td><td></td><td class="num">6.04</td></tr></table></div>';
      h += '<h4>Your findings</h4><div class="tbl-wrap"><table class="ledger"><tr><th>Workpaper</th><th>Finding</th><th class="num">Inventory overstatement</th></tr>' +
        '<tr><td>N-2</td><td>GL 1395 capitalized variances</td><td class="num">7.80</td></tr>' +
        '<tr><td>N-3</td><td>Freezer W2 projected shortfall</td><td class="num">8.46</td></tr>' +
        '<tr><td>N-4</td><td>Polar Cold Storage (3PL) phantom inventory</td><td class="num">7.40</td></tr>' +
        '<tr><td>N-5</td><td>Short-dated reserve shortfall</td><td class="num">3.00</td></tr>' +
        '<tr><td>N-5</td><td>Cutoff (revenue/AR; inventory understated at cost, not counted)</td><td class="num">—</td></tr></table></div>';
      h += '<div class="wp-note">Covenant §6.12: Total Debt / LTM EBITDA ≤ 4.00x, tested quarterly. Total debt $412.0M. Reported LTM EBITDA $108.4M (3.80x). Inventory overstatement flows through COGS; cutoff overstated FY26 gross profit by ~$0.31M.</div>';
      return h;
    },
    steps: [
      num('total', 'Total inventory overstatement at 12/31? ($M)', {
        answerText: '26.66', placeholder: '$M', suffix: '$M',
        check(v) { v = M(v); if (Math.abs(v - 26.66) <= 0.01) return true; if (Math.abs(v - 23.66) <= 0.01) return 'Don’t forget the reserve shortfall — it reduces net inventory too.'; return 'Doesn’t tie. Sum the inventory overstatement column.'; },
      }, { okMsg: '<b>$26.66M</b> — 29% of reported inventory doesn’t exist or isn’t worth what the books say.' }),
      num('over', 'Recompute availability with corrected inventory. By how much does the $131.0M drawn exceed the corrected borrowing base (the over-advance)? ($M)', {
        answerText: '9.96', placeholder: '$M', suffix: '$M',
        check(v) {
          v = M(v);
          if (Math.abs(v - 9.956) <= 0.011) return true;
          if (Math.abs(v - 16.0) <= 0.01) return 'That’s the drop in availability (60% × 26.66). Compare corrected availability to what’s drawn.';
          if (Math.abs(v - 121.04) <= 0.01) return 'That’s corrected availability. How far over it is the revolver?';
          if (Math.abs(v - 20.62) <= 0.02) return 'Apply the 60% advance rate to the inventory correction, not 100%.';
          return 'Doesn’t tie. Corrected = 81.60 + 60% × (92.40 − 26.66). Over-advance = 131.00 − corrected.';
        },
      }, { okMsg: '81.60 + 39.44 = $121.04M available vs. $131.0M drawn: a <b>$9.96M over-advance</b>. The bank has been lending against pizza that isn’t there.' }),
      mc('cov', 'Corrected LTM EBITDA ≈ $108.4M − $26.66M − $0.31M = $81.4M, so leverage ≈ 5.1x vs. the 4.00x covenant at 12/31. What follows for Northfield’s FY26 financial statements?', [
        { t: 'Nothing — lenders usually waive.', ok: false, why: 'A waiver may come, but the accounting depends on what exists at issuance, not what’s likely.' },
        { t: 'An event of default makes the debt callable: unless the lender waives for more than a year before issuance, classify it as current (ASC 470-10-45-11), and evaluate whether there is substantial doubt about going concern (ASC 205-40).', ok: true, why: 'A covenant breach at the balance sheet date that makes long-term debt callable requires current classification unless the creditor has waived or lost the right to demand repayment for more than one year. With $412M suddenly current, ASC 205-40 is unavoidable.' },
        { t: 'Reclassify the inventory overstatement to goodwill.', ok: false, why: 'Phantom pizza is not an intangible asset.' },
        { t: 'Correct the borrowing base prospectively, starting with the January certificate.', ok: false, why: 'The December certificate was materially false when submitted. Prospective correction doesn’t cure that — and it doesn’t fix the financial statements.' },
      ]),
    ],
    conclusion: '$26.66M of phantom inventory, a $9.96M over-advance, and a covenant breach at year-end.',
  };

  // ================================================================ register
  const def = {
    chapters: CHAPTERS, evidence: EV, clock, location, objective, npcPos, nightLights,
    newGame, beats, talk: TALK, use, flavor: FLAVOR, onStep, ending,
    onResume(s) { if (s.flags.hardhat) wearHardhat(); if (s.chapter === 1) G.maps.plant.running = false; if (s.flags.locked_in) G.maps.freezer.dark = false; },
  };
  G.registerEpisode({
    id: 'ep2', num: 2,
    title: 'Cold Storage',
    subtitle: 'Northfield Foods · frozen pizza, Wisconsin · Phantom inventory, a New Year’s Eve count, and a lender’s borrowing base.',
    chapters: CHAPTERS,
    contact: { name: 'NIGHTSHIFT', avatar: 'N', sub: 'unknown number · plant Wi-Fi', color: '#7fc8ff' },
    frustrated: 'Slow down. You’re rushing like it’s the end of a shift. Read the notes on each workpaper — Mei and Rosa write everything down for a reason.',
    ranks: ['Partner Track', 'Lead Examiner', 'Field Examiner', 'NIGHTSHIFT Carried You Home'],
    start: { map: 'plant', x: 5, y: 7, dir: 'up' },
    buildMaps: () => ({ plant: buildPlant(), freezer: buildFreezer(), yard: buildYard() }),
    cast, hints: HINTS, puzzles: defs, story: G.makeStory(def),
    puzzleEvidence: { wpGM: 'ev_margin', wpVAR: 'ev_var', wpCOUNT: 'ev_count', wp3PL: 'ev_3pl', wpCUT: 'ev_cutoff', wpBBC: 'ev_bbc' },
  });
})();
