// Episode 4 — Facilitation. Brightwell Brands' Mexican subsidiary: bribes via a sham customs "consultancy," IMMEX duty evasion,
// and a private-equity buyer who would rather not know.
(function () {
  const U = G.util, K = G.kit;
  const { makeMap } = G.mapkit;
  const { mc, num, multiPick } = G.puzzles.kit;
  const fmt = U.fmt;
  const say = K.say, narrate = K.narrate, choose = K.choose, text = K.text;
  const S = K.S, F = K.F, E = K.E, done = K.done;
  const D = v => (Math.abs(v) < 1000 ? v * 1e6 : v);   // accept $M or whole dollars
  const M = v => (Math.abs(v) >= 1e4 ? v / 1e6 : v);

  // ================================================================ maps
  function buildOficinas() {
    const m = makeMap('oficinas', 44, 28);
    m.boxColors = ['#e0a020', '#c94a3a', '#2a8a4a', '#e8d8b0'];
    m.room(1, 1, 8, 8, ';');     // recepción
    m.room(10, 1, 18, 8, '_');   // GM
    m.room(20, 1, 24, 8, ';');   // assistant
    m.room(26, 1, 32, 8, '.');   // finance
    m.room(34, 1, 42, 8, '_');   // sala de juntas (yours)
    for (let x = 1; x <= 42; x++) if (m.floor[1][x] !== '#') m.floor[0][x] = 'W';
    [5, 14, 22, 29, 38].forEach(x => m.door(x, 9));
    m.room(1, 10, 42, 11, ';');
    m.room(1, 13, 14, 19, '.');  // accounting / AP
    m.room(16, 13, 24, 19, '.'); // logistics & customs
    m.room(26, 13, 42, 19, '"'); // patio
    m.room(30, 15, 38, 17, ';');
    m.door(7, 12); m.door(20, 12);
    for (let x = 26; x <= 42; x++) m.floor[12][x] = ';';
    m.room(1, 21, 42, 26, '-');  // warehouse
    m.door(7, 20); m.door(34, 20);
    for (let x = 30; x <= 38; x++) m.floor[20][x] = '-';

    // reception
    m.row(2, 5, 4, 'r', 'reception'); m.put(4, 3, 'h');
    m.put(1, 1, 'P'); m.put(8, 1, 'P'); m.put(8, 6, 'c', 'r_couch'); m.put(8, 7, 'c', 'r_couch');
    m.put(3, 0, 's', 'logo'); m.label(3, 0, 'BOTANAS DEL NORTE');
    // GM
    m.put(13, 3, 'D', 's_desk'); m.put(14, 3, 'C', 's_pc'); m.put(15, 3, 'D', 's_desk'); m.put(14, 2, 'h');
    m.put(10, 1, 'B', 's_shelf'); m.put(11, 1, 'B', 's_shelf'); m.put(17, 0, 'A', 's_art'); m.put(18, 1, 'Q', 's_bar');
    m.put(17, 6, 'c', 's_couch'); m.put(18, 6, 'c', 's_couch'); m.put(10, 8, 'e');
    // assistant
    m.put(21, 3, 'C', 'mar_pc'); m.put(22, 3, 'D', 'mar_desk'); m.put(24, 1, 'F', 'mar_files'); m.put(21, 2, 'h');
    // finance
    m.put(28, 3, 'D', 'h_desk'); m.put(29, 3, 'C', 'h_pc'); m.put(30, 3, 'D', 'h_desk'); m.put(29, 2, 'h');
    m.put(32, 1, 'F', 'h_files'); m.put(26, 8, 'P');
    // sala de juntas
    for (let x = 36; x <= 40; x++) for (let y = 3; y <= 5; y++) m.put(x, y, 'T', 'sala_table');
    for (let x = 36; x <= 40; x++) { m.put(x, 2, 'h'); m.put(x, 6, 'h'); }
    m.put(35, 4, 'h'); m.put(41, 4, 'h');
    m.put(42, 1, 'C', 'sala_pc'); m.put(42, 2, 'D', 'chips');
    m.put(38, 0, 'L', 'sala_screen'); m.put(34, 8, 'e');
    // accounting
    for (const [x, y] of [[2, 15], [7, 15], [2, 18], [7, 18]]) { m.put(x, y, 'C', 'ap_pc'); m.put(x + 1, y, 'D'); m.put(x + 2, y, 'C', 'ap_pc'); }
    m.put(14, 13, 'F', 'ap_files'); m.put(13, 19, 'P');
    // logistics
    m.put(17, 15, 'C', 'l_pc'); m.put(18, 15, 'D', 'l_desk'); m.put(22, 15, 'C', 'pedimento_pc'); m.put(23, 15, 'D');
    m.put(24, 13, 'F', 'pedimento_files'); m.put(16, 19, 'P');
    m.put(19, 12, 's', 'aduana_sign'); m.label(19, 12, 'ADUANAS');
    // patio
    m.put(30, 15, 'w', 'fountain'); m.put(31, 15, 'T', 'patio_table'); m.put(35, 16, 'T', 'patio_table'); m.put(36, 16, 'T', 'patio_table');
    for (const [x, y] of [[27, 13], [41, 13], [27, 19], [41, 19], [33, 18], [29, 17]]) m.put(x, y, 'e');
    // warehouse
    for (const y of [22, 25]) for (let x = 3; x <= 26; x++) if (x !== 14) m.put(x, y, 'H', 'w_rack');
    for (let x = 30; x <= 33; x++) m.put(x, 23, 'j', 'w_pallet');
    m.put(37, 24, 'f', 'w_forklift');
    m.put(40, 26, 'k'); m.put(41, 26, 'k');
    return m;
  }

  function buildAduana() {
    const m = makeMap('aduana', 40, 24, { darkness: 0.6 });
    m.room(1, 1, 38, 22, '%');
    for (let x = 0; x <= 39; x++) { m.floor[0][x] = '!'; m.floor[23][x] = '!'; }
    for (let y = 0; y <= 23; y++) { m.floor[y][0] = '!'; m.floor[y][39] = '!'; }
    m.fenceGround = '%';
    m.lanes = new Set();
    for (let y = 1; y <= 22; y++) { m.lanes.add('12,' + y); m.lanes.add('20,' + y); }
    // inspection booths with semaforo
    const booth = (x, y) => { for (let yy = y; yy <= y + 2; yy++) for (let xx = x; xx <= x + 2; xx++) m.floor[yy][xx] = '#'; };
    booth(13, 8); booth(21, 8);
    m.put(14, 7, 'I', 'semaforo'); m.put(22, 7, 'I', 'semaforo2');
    m.semaforo = () => ((G.engine.time / 3) | 0) % 3 === 0;
    // inspection dock
    for (let x = 26; x <= 36; x++) m.floor[14][x] = '#';
    m.put(28, 14, 'k', 'insp_dock'); m.put(32, 14, 'k', 'insp_dock'); m.label(28, 14, 'R1'); m.label(32, 14, 'R2');
    m.put(30, 13, 's', 'insp_sign'); m.label(30, 13, 'REVISION');
    m.room(26, 15, 36, 18, '-');
    // broker office (Montes)
    for (let y = 16; y <= 22; y++) for (let x = 1; x <= 10; x++) m.floor[y][x] = '#';
    m.room(2, 17, 9, 21, ';');
    m.door(6, 16);
    m.put(3, 18, 'D', 'mo_desk'); m.put(4, 18, 'C', 'montes_pc'); m.put(5, 18, 'D', 'mo_desk'); m.put(4, 19, 'h');
    m.put(9, 17, 'F', 'mo_files'); m.put(2, 21, 'P'); m.put(8, 21, 'w', 'mo_cooler');
    m.put(4, 16, 's', 'mo_sign'); m.label(4, 16, 'AGENCIA MONTES');
    // trucks
    m.props.push({ kind: 'truck', x: 11, y: 12, w: 2, h: 6, facing: 'up', color: '#e8e0c8', cab: '#2a8a4a', label: 'BDN', solid: true });
    m.props.push({ kind: 'truck', x: 11, y: 1, w: 2, h: 6, facing: 'up', color: '#d9dde2', cab: '#8a2a2a', solid: true });
    m.props.push({ kind: 'truck', x: 19, y: 13, w: 2, h: 6, facing: 'up', color: '#d9dde2', cab: '#2a4a8a', solid: true });
    m.props.push({ kind: 'truck', x: 19, y: 2, w: 2, h: 6, facing: 'up', color: '#c9ced6', cab: '#555', solid: true });
    m.props.push({ kind: 'trailer', x: 29, y: 2, w: 2, h: 6, facing: 'up', color: '#d9dde2', stripe: '#c94a3a', solid: true });
    for (let y = 12; y <= 17; y++) for (let x = 11; x <= 12; x++) m.tag(x, y, 'bdn_truck');
    m.put(37, 4, 'e'); m.put(37, 10, 'e');
    m.lights = [{ x: 14.5, y: 7, r: 50 }, { x: 22.5, y: 7, r: 50 }, { x: 31, y: 16, r: 60 }, { x: 6, y: 19, r: 50 }];
    return m;
  }

  function buildMirador() {
    const m = makeMap('mirador', 30, 18, { dark: true, darkness: 0.7, darkTint: '10,10,28' });
    m.room(1, 1, 28, 10, ';');
    m.room(1, 11, 28, 17, '&');
    for (let x = 0; x <= 29; x++) m.floor[0][x] = '!';
    m.fenceGround = ';';
    for (let x = 1; x <= 28; x++) m.put(x, 10, 'u', 'railing');
    for (const [x, y] of [[5, 7], [12, 7], [19, 7], [25, 7]]) { m.put(x, y, 'T', 'bench'); m.put(x + 1, y, 'T', 'bench'); }
    for (const [x, y] of [[2, 2], [27, 2], [9, 3], [22, 3]]) m.put(x, y, 'e');
    m.put(15, 2, 's', 'flag'); m.label(15, 2, 'OBISPADO');
    m.props.push({ kind: 'car', x: 3, y: 2, w: 2, h: 3, color: '#e0c020', facing: 'down', solid: true });
    m.lights = [{ x: 8, y: 5, r: 40 }, { x: 22, y: 5, r: 40 }, { x: 15, y: 9, r: 30 }];
    for (let i = 0; i < 18; i++) m.lights.push({ x: 1 + ((i * 37) % 28), y: 12 + ((i * 13) % 6), r: 6 });
    return m;
  }

  // ================================================================ cast
  const cast = {
    lena: { name: 'Lena Strand', title: 'Founder, Strand Forensic Advisory', look: { skin: '#f3d6c0', hair: '#e2c27a', hairStyle: 'bun', shirt: '#e8e8e8', jacket: '#1f2f4a', pants: '#1f2f4a' } },
    garza: { name: 'Ana Lucía Garza', title: 'Partner, Garza & Treviño Abogados (Mexican counsel)', look: { skin: '#d8a070', hair: '#2a1a10', hairStyle: 'long', shirt: '#f0f0f0', jacket: '#5a2a3a', pants: '#1a1a1a' } },
    salinas: { name: 'Rodrigo Salinas', title: 'Director General, Botanas del Norte', look: { skin: '#c8956a', hair: '#1a1a1a', hair2: '#888', hairStyle: 'slick', shirt: '#f4f4f4', jacket: '#e8dcc0', pants: '#d8ccb0' } },
    ibarra: { name: 'Héctor Ibarra', title: 'Director de Finanzas, Botanas del Norte', look: { skin: '#d8a878', hair: '#3a2a1e', hairStyle: 'short', shirt: '#b8d0e8', tie: '#1f2f4a', pants: '#4a4a52', glasses: '#333' } },
    dunmore: { name: 'Craig Dunmore', title: 'VP Latin America, Brightwell Brands', look: { skin: '#f0c8a8', hair: '#c0a070', hairStyle: 'short', shirt: '#3a6a9a', pants: '#b8a070' } },
    lucia: { name: 'Lucía Ferrer', title: 'Customs & Logistics Accountant', look: { skin: '#c08a5e', hair: '#1a1010', hairStyle: 'bun', shirt: '#e0e0e0', jacket: '#2a6a6a', pants: '#2a2a3a' } },
    diego: { name: 'Diego Rangel', title: 'Cuentas por Pagar (AP)', look: { skin: '#c8956a', hair: '#111', hairStyle: 'short', shirt: '#5a8aba', pants: '#2a2a3a' } },
    marisela: { name: 'Marisela Ortiz', title: 'Executive Assistant to the GM', look: { skin: '#d8a878', hair: '#4a2a1a', hairStyle: 'long', shirt: '#c94a6a', pants: '#2a2a3a' } },
    montes: { name: 'Don Esteban Montes', title: 'Agente Aduanal, Patente 3417', look: { skin: '#b07850', hair: '#e8e8e8', hairStyle: 'short', shirt: '#e8d8b0', pants: '#6a5a4a', glasses: '#555' } },
    tito: { name: 'Tito Salinas', title: 'Grupo Logístico Sierra', look: { skin: '#c08a5e', hair: '#111', hairStyle: 'cap', shirt: '#1a1a1a', jacket: '#3a2a20', pants: '#2a2a30', glasses: '#111' } },
    liu: { name: 'Margaret Liu', title: 'Chair, Special Committee, Brightwell Board', look: { skin: '#ecc9a2', hair: '#2a2a2a', hairStyle: 'bob', shirt: '#f0f0f0', jacket: '#2a2a40', pants: '#2a2a40', glasses: '#444' } },
    asher: { name: 'Simon Asher', title: 'Operating Partner, Calder Ridge · Hearthstone deal team', look: { skin: '#e2c0a4', hair: '#d8d8d8', hairStyle: 'slick', hair2: '#f4f4f4', shirt: '#1a1a1a', jacket: '#3a3a42', pants: '#2a2a30' } },
  };

  // ================================================================ evidence
  const EV = {
    ev_chips: { title: 'A heavy bag of chips', ref: 'ITEM 0', short: '"Ask what GLS does. Then ask who it pays."', body: '<p>In a bag of Botanas del Norte chips on the conference table: a prepaid phone and a note in Spanish and English.</p><p><i>"Pregunte qué hace GLS. Luego pregunte a quién le paga. — Ask what GLS does. Then ask who it pays. — A"</i></p>' },
    ev_gls: { title: 'GLS third-party analytics', ref: 'WP M-1', short: 'GLS fees 12.0% of customs value vs. 0.45% for a licensed broker; GM’s cousin owns it.', body: '<ul><li>Grupo Logístico Sierra: $2,184,000 of "customs consulting" in FY26 — <b>12.0%</b> of declared customs value. The licensed broker charges 0.45%.</li><li>Not a licensed customs broker. Incorporated 11 days before its first invoice. Sole shareholder: Tomás "Tito" Salinas, cousin of the GM.</li><li>Invoices for "agilización de trámites" (expediting); payments directed to a third party’s account.</li></ul>' },
    ev_envelope: { title: 'Envelope at inspection lane 1', ref: 'OBSERVED 6/8', short: 'Tito Salinas handed an envelope to a customs officer; BDN truck released minutes later.', body: '<p>Nuevo Laredo customs, 6/8/2027, 11:40 AM. A Botanas del Norte truck drew a red light. Tito Salinas (GLS) handed an envelope to the officer at lane 1. The truck was released at 11:52 without unloading. Don Esteban Montes witnessed it with you.</p>' },
    ev_semaforo: { title: 'Red-light releases & IMMEX', ref: 'WP M-2', short: 'GLS paid cash the day of every red-light release; $530K of Q1 duties evaded.', body: '<ul><li>Three red-light shipments (P-2, P-5, P-7) released the same day without inspection, each coinciding with a GLS cash payment.</li><li>All IMMEX entries were consumed domestically: Q1 customs value $2.65M × 20% = <b>$530,000</b> of duties evaded.</li><li>Not a facilitating payment: paying to skip an inspection and evade duties buys a discretionary act and an improper advantage.</li></ul>' },
    ev_te: { title: 'GM expense reports', ref: 'WP M-3', short: '$20,000 of gifts, dinners and cash tied to officials, split under thresholds.', body: '<ul><li>Undisclosed dinners with "clients" on release days, four iPhones split across receipts under the $3,000 threshold, $8,000 cash advance for "trámites," tequila "for SAT/ANAM officials."</li><li>Total improper: <b>$20,000</b>. Immaterial — and still a books-and-records violation.</li></ul>' },
    ev_lucia: { title: 'GLS bank statements', ref: 'VIA COUNSEL 6/9', short: 'Provided by GLS’s former bookkeeper to Mexican counsel; chain of custody documented.', body: '<p>GLS account statements, Jan–Mar 2027, provided voluntarily to Ana Lucía Garza (counsel) by GLS’s former bookkeeper, Inés Ferrer, with a signed declaration. Received by you through counsel on 6/9 at the Obispado lookout.</p>' },
    ev_funds: { title: 'GLS funds flow', ref: 'WP M-4', short: '40.9% of GLS receipts went to officials; $130K to Craig Dunmore’s LLC.', body: '<ul><li>Of $546,000 received from BDN in Q1: $115,500 cash withdrawn on red-light release days, $60,000 to the spouse of a customs supervisor, $48,000 to a company owned by a state inspector’s brother — <b>40.9%</b> to officials.</li><li><b>$130,000</b> wired to Dunmore Advisory LLC (Houston) — Brightwell’s VP Latin America.</li><li>$80,500 to R. Salinas personally; $90,000 owner draws by T. Salinas.</li></ul>' },
    ev_exposure: { title: 'Deal exposure', ref: 'WP M-5', short: 'Mexican customs exposure $7.53M–$8.15M; accrue $7.53M; disclose to DOJ/SEC now.', body: '<ul><li>Omitted duties $3.10M (2025–2027), fines 130–150%, surcharges $0.40M: <b>$7.53M–$8.15M</b>.</li><li>No best estimate in the range: accrue the minimum and disclose the range (ASC 450-20-30-1).</li><li>Successor liability travels with a stock acquisition; the DOJ M&A Safe Harbor isn’t a substitute for disclosure and remediation.</li></ul>' },
    ev_ledger: { title: 'Books & records', ref: 'WP M-6', short: 'Bribes capitalized into inventory as "freight-in"; $310K at 6/30.', body: '<ul><li>GLS payments recorded as freight-in and capitalized into imported ingredient cost; <b>$310,000</b> still in inventory at 6/30.</li><li>Not an inventoriable cost and not deductible; expense as incurred, isolate for investigation.</li><li>GM override, missing third-party diligence and an officer’s kickbacks indicate a material weakness in ICFR.</li></ul>' },
  };

  // ================================================================ hints (ADUANA)
  const HINTS = {
    'wpG1.rate': ['Fees divided by the value of what they cleared.', 'GLS: $2,184,000 over $18,200,000.', '12.0%.'],
    'wpG1.flags': ['Which facts would make a reasonable person suspect money is being passed on? Not which facts are just ordinary.', 'Too new, unlicensed, owned by family, vague invoices, paying someone else.', 'Select the first five red flags. Leave Monterrey address, CFDI invoices and net 30.'],
    'wpG1.fcpa': ['FCPA "knowledge" includes looking away on purpose.', 'Red flags + payments to an intermediary = third-party bribery risk.', 'The high-risk intermediary answer.'],
    'wpG2.red': ['Red light means inspection. Which red lights got released the same day, with money moving?', 'P-4 waited three days for a real inspection. P-8 was green.', 'P-2, P-5, P-7.'],
    'wpG2.duty': ['IMMEX goods are duty-free only if they leave Mexico again. Ours never did.', 'Add up the customs value of every IMMEX entry, then 20%.', '2,650,000 × 20% = 530,000.'],
    'wpG2.facil': ['A facilitating payment buys something routine you’re already entitled to.', 'Skipping an inspection and paying less duty isn’t routine.', 'The "no, it’s a discretionary act and an improper advantage" answer.'],
    'wpG3.items': ['Look for officials, cash, gifts, and receipts cut in half.', 'The hotel, the taxi, and lunch with Don Esteban are fine.', 'The dinner on 1/19, the iPhones, the cash advance, the tequila.'],
    'wpG3.total': ['Add the improper items.', '1,840 + 5,960 + 8,000 + 4,200.', '20,000.'],
    'wpG3.books': ['The FCPA has two halves. One of them doesn’t care how big the number is.', 'Books and records. No materiality threshold.', 'The books-and-records answer.'],
    'wpG4.officials': ['Who in this list works for the government, or is married to or related to someone who does?', 'Cash on release days, the supervisor’s wife, the inspector’s brother.', 'Select the three cash withdrawals, Rojas, and Consultores Integrales Vega.'],
    'wpG4.rate': ['What share of GLS’s money from BDN went to officials?', '223,500 ÷ 546,000.', '40.9%.'],
    'wpG4.dunmore': ['A US executive got paid by the intermediary he approved.', 'That’s a kickback, and it means corporate DID know.', 'The answer about personal liability and corporate knowledge.'],
    'wpG5.low': ['Duties plus the low end of the fine plus surcharges.', '3.10 + 130% of 3.10 + 0.40.', '7.53 million.'],
    'wpG5.accrue': ['Probable, estimable, a range, no best estimate. What does US GAAP say?', 'Not the midpoint — that’s IFRS.', 'Accrue the minimum and disclose the range.'],
    'wpG5.deal': ['Does a stock deal leave the liabilities behind?', 'No. And an escrow is not a disclosure.', 'The disclose-now / successor liability answer.'],
    'wpG6.inv': ['How much of H1 GLS "freight-in" is still sitting in inventory?', '$820,000 × 37.8%.', 'About $310,000.'],
    'wpG6.class': ['Is a bribe a cost of getting inventory to its location and condition?', 'Expense it, isolate it, and don’t deduct it.', 'The expense / not deductible answer.'],
    'wpG6.icfr': ['A senior officer overriding controls. A VP taking kickbacks. Does the dollar amount matter?', 'Fraud by senior management is a strong indicator of a material weakness.', 'The material weakness answer.'],
    'dlg.montes': ['Don Esteban is proud of his license. Respect it.', 'Ask him, as a professional, what a real broker does.', 'The first option.'],
    'dlg.tito': ['Don’t accuse him in the middle of a customs yard.', 'Walk away and write it down.', 'Say nothing and note the time.'],
    'dlg.ibarra': ['Héctor follows procedure. Give him procedure.', 'The committee resolution, counsel’s letter, and Mexican privacy law.', 'The first option.'],
    'dlg.asher': ['Simon wants your scope, not your report.', 'Who is your client?', 'The special committee option.'],
    'hearing.r1': ['A consultant with no license and a 12% fee.', 'GLS analytics.', 'Present the GLS third-party analytics.'],
    'hearing.r2': ['You saw it with your own eyes.', 'Red-light releases — or the envelope.', 'Present red-light releases & IMMEX.'],
    'hearing.r3': ['Approved by whom? Split how?', 'The expense reports.', 'Present the GM expense reports.'],
    'hearing.r4': ['Corporate had no knowledge? Follow the money to Houston.', 'The funds flow.', 'Present the GLS funds flow.'],
    'hearing.r5': ['Immaterial to the deal? Show him the exposure.', 'Deal exposure.', 'Present the deal exposure workpaper.'],
    'hearing.r6': ['She wants the accounting.', 'Books & records.', 'Present the books & records workpaper.'],
    'hearing.r7': ['Don’t let Monterrey scare you. You have counsel and a plan.', 'Self-report to everyone.', 'The self-report option.'],
  };

  // ================================================================ chapters
  const CHAPTERS = [
    { title: 'Día 1 — Monterrey', day: 'LUN 6/7' },
    { title: 'Día 2 — Semáforo Rojo', day: 'MAR 6/8' },
    { title: 'Día 3 — Cuentas', day: 'MIÉ 6/9' },
    { title: 'Noche — El Mirador', day: 'MIÉ 6/9' },
    { title: 'Día 4 — Debida Diligencia', day: 'JUE 6/10' },
    { title: 'Día 5 — Comité Especial', day: 'VIE 6/11' },
    { title: 'Epílogo', day: '' },
  ];
  function clock(s) {
    const f = s.flags, ch = s.chapter;
    let t = '9:00 AM';
    if (ch === 0) t = !f.met_salinas ? '8:40 AM' : !done('wpG1') ? '10:30 AM' : '5:15 PM';
    if (ch === 1) t = !f.saw_envelope ? '11:30 AM' : '1:45 PM';
    if (ch === 2) t = !done('wpG3') ? '9:15 AM' : '6:30 PM';
    if (ch === 3) t = s.map === 'mirador' ? '10:02 PM' : '1:40 AM';
    if (ch === 4) t = !f.asher_met ? '10:00 AM' : '4:30 PM';
    if (ch === 5) t = '10:00 AM';
    return (CHAPTERS[ch] || CHAPTERS[0]).day + ' · ' + t;
  }
  function location(s) { return { oficinas: 'Botanas del Norte — Santa Catarina, N.L.', aduana: 'Aduana de Nuevo Laredo — Comercio Exterior', mirador: 'Mirador del Obispado — Monterrey' }[s.map]; }

  const PC = { map: 'oficinas', x: 42, y: 1 };
  const at = id => { const p = def.npcPos(id, S()); return p ? { map: p.map, x: p.x, y: p.y } : null; };

  function objective(s) {
    const f = s.flags;
    switch (s.chapter) {
      case 0:
        if (!f.met_garza) return { text: 'Meet *Ana Lucía Garza*, Mexican counsel, at reception.', target: at('garza') };
        if (!f.met_salinas) return { text: 'Meet the GM, *Rodrigo Salinas*.', target: at('salinas') };
        if (!f.phone_found) return { text: 'Settle into the *sala de juntas* (conference room).', target: { map: 'oficinas', x: 42, y: 2 } };
        if (!f.got_vendors) return { text: 'Get FY26 customs and logistics vendor payments from *Diego* in AP.', target: at('diego') };
        return { text: 'Analyze third-party payments on the *sala de juntas computer*.', target: PC };
      case 1:
        if (!f.met_montes) return { text: 'Find *Don Esteban Montes*, licensed customs broker.', target: at('montes') };
        if (!f.saw_envelope) return { text: 'Watch the *Botanas del Norte truck* at inspection lane 1.', target: { map: 'aduana', x: 13, y: 15 } };
        return { text: 'Analyze the pedimentos on *Don Esteban’s computer*.', target: { map: 'aduana', x: 4, y: 18 } };
      case 2:
        if (!f.got_te) return { text: 'Request the GM’s expense reports from *Héctor Ibarra*.', target: at('ibarra') };
        return { text: 'Review the expense reports on the *sala de juntas computer*.', target: PC };
      case 3:
        if (s.map === 'mirador') return { text: f.lucia_met ? '' : 'Find *ADUANA* by the railing.', target: f.lucia_met ? null : at('lucia') };
        return { text: 'Trace the GLS bank statements on the *sala de juntas computer*.', target: PC };
      case 4:
        if (!f.asher_met) return { text: 'The Calder Ridge deal team has arrived. *Simon Asher* is waiting in the patio.', target: at('asher') };
        if (!done('wpG5')) return { text: 'Quantify the deal exposure on the *sala de juntas computer*.', target: PC };
        return { text: 'Analyze the books & records on the *sala de juntas computer*.', target: PC };
      case 5: return { text: 'The special committee meets in the *sala de juntas*.', target: at('liu') };
      default: return { text: '', target: null };
    }
  }

  function npcPos(id, s) {
    const f = s.flags, ch = s.chapter;
    const p = (x, y, dir, extra = {}) => Object.assign({ map: 'oficinas', x, y, dir }, extra);
    switch (id) {
      case 'garza':
        if (ch === 0) return f.met_garza ? p(35, 4, 'right') : p(6, 6, 'up');
        if (ch === 1) return { map: 'aduana', x: 8, y: 20, dir: 'up' };
        if (ch === 2 || ch === 4) return p(35, 4, 'right');
        if (ch === 3) return s.map === 'mirador' ? { map: 'mirador', x: 10, y: 6, dir: 'right' } : p(35, 4, 'right');
        if (ch === 5) return p(35, 4, 'right');
        return null;
      case 'salinas':
        if (ch === 5) return p(41, 3, 'left');
        if (ch === 3) return null;
        return p(14, 2, 'down');
      case 'ibarra': return ch === 5 ? p(41, 5, 'left', { sweat: true }) : ch !== 3 ? p(29, 2, 'down', { sweat: ch >= 2 }) : null;
      case 'dunmore': return ch === 5 ? p(38, 6, 'up') : (ch === 0 || ch === 2) ? p(16, 5, 'left') : null;
      case 'lucia':
        if (ch === 3) return s.map === 'mirador' ? { map: 'mirador', x: 15, y: 9, dir: 'down' } : null;
        if (ch === 5) return p(22, 10, 'down');
        return p(17, 16, 'up');
      case 'diego': return ch !== 3 && ch !== 5 ? p(3, 16, 'up') : null;
      case 'marisela': return ch !== 3 ? p(21, 2, 'down') : null;
      case 'montes': return ch === 1 ? { map: 'aduana', x: 4, y: 19, dir: 'up' } : null;
      case 'tito': return ch === 1 && !f.tito_left ? { map: 'aduana', x: 14, y: 12, dir: 'down' } : null;
      case 'asher': return ch === 4 ? p(33, 16, 'left') : ch === 5 ? p(40, 2, 'down') : null;
      case 'liu': return ch === 5 ? p(35, 3, 'right') : null;
      case 'lena': return ch === 5 ? p(36, 2, 'down') : null;
    }
    return null;
  }

  // ================================================================ beats
  async function newGame() {
    await G.ui.card({
      day: 'EPISODE 4 · MONDAY, JUNE 7, 2027 · 8:40 AM',
      title: 'FACILITATION',
      text: 'Brightwell Brands (NYSE: BWB) makes pretzels in Ohio and, through Botanas del Norte, potato chips and salsas in Monterrey, Mexico.\n\nCalder Ridge Partners has agreed to buy Brightwell for $640 million and fold it into a new platform called Hearthstone. Signing is in two weeks.\n\nLast Thursday, Brightwell’s ethics hotline received a message from Monterrey: *"Ask what GLS does."* The board’s special committee has called Strand Forensic. And you.',
    });
    E().placePlayer('oficinas', 5, 7, 'up');
    await G.ui.reveal();
    await E().script(async () => {
      await narrate('Thirty-four degrees and climbing. The Sierra Madre stands over the parking lot like a wall. Inside, terracotta floors and the smell of frying corn from the plant next door.');
      await narrate('Lena, by text: *"Ana Lucía Garza is our Mexican counsel. Do nothing without her. Data privacy, privilege, and safety — in that order."*');
    });
  }

  async function beats() {
    const s = S(), f = s.flags;
    if (done('wpG1') && !f.salinas_visit) { f.salinas_visit = true; await salinasVisit(); }
    if (s.chapter === 0 && done('wpG1') && f.salinas_visit) await toAduana();
    if (s.chapter === 1 && done('wpG2')) await toCuentas();
    if (s.chapter === 2 && done('wpG3')) await toMirador();
    if (s.chapter === 3 && done('wpG4')) await toDiligence();
    if (s.chapter === 4 && done('wpG5') && !f.g5_followup) { f.g5_followup = true; await text('Last thing. Find where GLS lives in the books. Héctor hid it somewhere boring.'); }
    if (s.chapter === 4 && done('wpG6')) await toCommittee();
    if (s.chapter === 5 && f.hearing_done) await ending();
    K.refresh();
  }

  async function salinasVisit() {
    const e = E();
    G.audio.door();
    e.spawnActor('salinas', 38, 9, 'up');
    await e.walkActor('salinas', [['up', 1]]);
    e.faceToward('you', 38, 8);
    await say('salinas', '¿Todo bien? Everything all right in here? You’ve been working since breakfast. In Monterrey we work hard, but we also eat.');
    await say('salinas', 'Tonight, cabrito at El Rey. My treat. Craig is coming. You’ll love it.');
    const c = await choose('you', null, ['Thank you, but I can’t accept hospitality during the investigation.', 'What does Grupo Logístico Sierra do for you, Rodrigo?', 'Maybe another time.']);
    if (c === 0) { await say('salinas', 'Of course, of course. Very proper. Very American.'); await narrate('The smile stays. Something behind it rearranges.'); }
    else if (c === 1) await say('salinas', 'GLS? Paperwork. Mexican customs is a labyrinth, ¿eh? You need people who know the labyrinth.');
    else await say('salinas', 'Another time. The offer stands. Everything in Monterrey is about relationships.');
    await e.walkActor('salinas', [['down', 1]]);
    e.removeActor('salinas');
    await K.sleep(700);
    await text('Tomorrow go to Nuevo Laredo. Ask Don Esteban Montes what GLS does. He’s a real broker. Forty years. He hates them.');
    K.refresh();
  }

  async function toAduana() {
    await K.toChapter(1, { day: 'TUESDAY, JUNE 8, 2027 · 11:30 AM', title: 'Semáforo Rojo', text: 'Nuevo Laredo. Three hours north on the Monterrey–Laredo highway, the busiest land port in the Americas.\n\nEvery truck that crosses presses a button. Green light: drive on. Red light: inspection.\n\nUnless someone arranges otherwise.' }, { map: 'aduana', x: 6, y: 21, dir: 'up' });
  }

  async function envelopeScene() {
    const e = E(), f = F();
    f.saw_envelope = true;
    await narrate('The Botanas del Norte truck rolls up to lane 1 and the driver presses the button. The light above the booth turns *red*.');
    await narrate('The driver doesn’t pull into the inspection dock. He waits. A man in a leather jacket and sunglasses walks out of the booth — Tito Salinas — and hands an officer a thick envelope.');
    e.faceToward('tito', e.player.x, e.player.y);
    await say('tito', '¿Qué me ves? What are you looking at?');
    await K.gate('you', null, [
      'That was a bribe. I’m reporting you.',
      'Say nothing. Note the time: 11:40. Walk back to Don Esteban.',
      'Take a photo of the officer.',
    ], 1, 'dlg.tito', async c => {
      if (c === 0) { await say('tito', 'Report me to who, gringo? Him?'); await narrate('He nods at the officer, who is suddenly very interested in you. Don Esteban’s hand closes on your elbow. "No aquí," he says. Not here.'); }
      else { await narrate('Two officers start toward you before your phone is out of your pocket. Don Esteban steps between you, smiling, talking fast. You put the phone away.'); }
    });
    await narrate('11:52. The red-light truck rolls out of lane 1 without ever touching the inspection dock.');
    f.tito_left = true;
    await e.walkActor('tito', [['up', 4]]);
    e.removeActor('tito');
    K.addEvidence('ev_envelope');
    await text('Now you’ve seen it. Don Esteban has the pedimentos. Let him show you the pattern.');
    K.refresh();
  }

  async function toCuentas() {
    await text('Back to Monterrey. Tomorrow: Rodrigo’s expense reports. Héctor approves them without reading. Make him read them.');
    await K.sleep(700);
    await K.toChapter(2, { day: 'WEDNESDAY, JUNE 9, 2027 · 9:15 AM', title: 'Cuentas', text: 'You slept badly. When you came back to your hotel room last night, the safe was open and your laptop was on the bed instead of the desk.\n\nNothing was taken. That was the point.\n\nAna Lucía moved you to a different hotel at 2 AM and gave you her personal number.' }, { map: 'oficinas', x: 38, y: 7, dir: 'up' });
  }

  async function toMirador() {
    await text('Mirador del Obispado. 10 PM. Taxi from the hotel stand, not an app. Bring Ana Lucía.');
    await K.sleep(700);
    await K.toChapter(3, { day: 'WEDNESDAY, JUNE 9, 2027 · 10:02 PM', title: 'El Mirador', text: 'The old bishop’s palace sits on a hill above the city. From the lookout, Monterrey spreads out below like a circuit board.\n\nYour taxi driver asks twice if you’re sure this is where you want to go.' }, { map: 'mirador', x: 5, y: 5, dir: 'right', night: true });
  }

  async function luciaScene() {
    const e = E(), f = F();
    e.faceToward('lucia', e.player.x, e.player.y);
    await say('lucia', 'Buenas noches. Thank you for coming. Hola, licenciada.');
    await say('lucia', 'Soy Lucía Ferrer. Customs and logistics accounting. Yes — ADUANA.');
    await say('lucia', 'I reconcile every pedimento to every invoice. For two years, every red light cleared the same day, and every time, GLS sent an invoice for "agilización." I asked Héctor. He told me to code it as freight.');
    await say('lucia', 'My sister Inés kept the books for GLS. Tito paid her in cash and screamed at her. She quit in April. She kept copies of the bank statements.');
    await say('garza', 'Inés gave them to me this afternoon, voluntarily, with a signed declaration. They are with counsel. Chain of custody is documented. You may use them.');
    K.addEvidence('ev_lucia');
    const c = await choose('you', null, ['Why the hotline, and not the police?', 'Is your sister safe?', 'Thank you, Lucía.']);
    if (c === 0) await say('lucia', 'Because the people being paid ARE the police. Some of them. The hotline goes to Ohio. Ohio cannot be bribed by Tito.');
    else if (c === 1) await say('lucia', 'She is at my aunt’s in Saltillo. Ana Lucía has arranged things.');
    else await say('lucia', 'Don’t thank me. Finish it.');
    await narrate('Headlights swing across the plaza. A gray SUV idles at the far end of the lookout, engine running, nobody getting out.');
    await say('garza', 'We’re leaving. Now. Calmly. Lucía comes with us.');
    E().shakeScreen(3);
    await narrate('The SUV follows your taxi down the hill as far as the Avenida Constitución. Then it peels off and disappears.');
    f.lucia_met = true;
    G.save();
    await K.travel('oficinas', 41, 1, 'right', { night: true });
    await narrate('1:40 AM. The sala de juntas. Ana Lucía has arranged a security guard at the door. You open Inés’s bank statements.');
    K.refresh();
  }

  async function toDiligence() {
    await text('My sister read your workpaper notes over Ana Lucía’s shoulder. She cried. Good tears.');
    await K.sleep(700);
    await K.toChapter(4, { day: 'THURSDAY, JUNE 10, 2027 · 10:00 AM', title: 'Debida Diligencia', text: 'A Gulfstream lands at Monterrey International at 8:15. By ten, the Calder Ridge deal team has taken over the patio: three associates, two lawyers, and Simon Asher.\n\nSigning is in eleven days. They would like your report to be short.' }, { map: 'oficinas', x: 38, y: 7, dir: 'up' });
  }

  async function asherScene() {
    const f = F();
    E().faceToward('asher', E().player.x, E().player.y);
    await say('asher', '{first}. We keep meeting in the most charming places. Northfield, Austin, Monterrey. I’m starting to think you’re following me.');
    await say('asher', 'Let me be direct, because I respect you. Hearthstone is acquiring Brightwell. Our lenders need a diligence report that says "no significant findings" by Monday. A small Mexican customs irregularity is a rounding error on a $640 million deal.');
    await say('asher', 'I’m not asking you to lie. I’m asking you to scope your work as "limited procedures." Everyone does it.');
    await K.gate('you', null, [
      'If we call it limited procedures, what would we leave out?',
      'My client is Brightwell’s special committee, Simon. The scope is theirs, not Calder Ridge’s.',
      'What’s Hearthstone worth to you?',
    ], 1, 'dlg.asher', async c => {
      if (c === 0) await say('asher', 'Whatever you’d like to leave out. That’s the beauty of it. …You’re testing me. Try again.');
      else await say('asher', 'More than you’ll make in a lifetime. That’s not a bribe, it’s arithmetic. Try again.');
    });
    await say('asher', 'The special committee. Yes. Margaret Liu. She’s a stickler. Pity.');
    await say('asher', 'You do understand I’ll be at the meeting tomorrow, representing the buyer. I’ll be asking questions too.');
    f.asher_met = true;
    G.save();
    await text('He came to scare you. It isn’t working. Quantify the exposure. Make him read it.');
  }

  async function toCommittee() {
    await text('Margaret Liu lands at 9. Lena is with her. I’ll be at my desk, pretending to reconcile pedimentos.');
    await K.sleep(700);
    await K.toChapter(5, { day: 'FRIDAY, JUNE 11, 2027 · 10:00 AM', title: 'Comité Especial', text: 'The special committee convenes in the sala de juntas: Margaret Liu in person, three directors by video from Chicago.\n\nRodrigo Salinas has brought a lawyer. Craig Dunmore has brought a tan. Simon Asher has brought Calder Ridge’s general counsel.' }, { map: 'oficinas', x: 38, y: 8, dir: 'up' });
  }

  async function hearing() {
    const f = F();
    if (!f.liu_intro) {
      f.liu_intro = true;
      await say('liu', 'Margaret Liu. I chair the special committee. We have signing in ten days and an anonymous hotline report from this building. Let’s find out which one we can trust.');
      await say('salinas', 'With great respect, señora, I have built this company for nineteen years.');
      await narrate('Rebut each claim by presenting the exhibit that contradicts it. Wrong exhibits cost credibility with the committee.');
    } else await say('liu', 'Again, please. Carefully.');
    const r = await G.hearing.start(HEARING);
    if (r === 'win') { f.hearing_done = true; G.save(); await ending(); }
    else { await text('Respira. Margaret called ten minutes. Press if you’re not sure — it costs nothing.'); K.refresh(); }
  }

  async function ending() {
    await K.ending({
      headline: '$7.5M+', headlineLabel: 'Exposure surfaced',
      epilogue: [
        'Brightwell’s special committee voluntarily disclosed the matter to the DOJ’s FCPA Unit and the SEC within a week, and Ana Lucía Garza filed a parallel report with Mexico’s Fiscalía Especializada en Combate a la Corrupción. ANAM, Mexico’s customs agency, opened an audit of every IMMEX pedimento since 2025.',
        'Rodrigo Salinas was terminated and, by August, was no longer in Mexico. Tito Salinas and two customs officers were arrested in Nuevo Laredo in October. GLS was dissolved.',
        'Craig Dunmore was indicted in the Southern District of Texas for conspiracy to violate the FCPA and money laundering. The government’s exhibit list opened with a wire to Dunmore Advisory LLC.',
        'Brightwell accrued $7.53 million at June 30, disclosed the range, and reported a material weakness in internal control over financial reporting. Two years later the DOJ issued a declination with disgorgement, citing voluntary self-disclosure, cooperation and remediation.',
        'Hearthstone signed anyway. Calder Ridge cut the price by $45 million and took a $20 million escrow. Simon Asher told the Financial Times the issue was "a legacy matter, fully remediated."',
        'Lucía Ferrer became Brightwell’s Latin America compliance lead. Don Esteban Montes still works the Nuevo Laredo crossing at 74. He sends you a Christmas card every year with a single word: "Verde."',
        'In September, the Hearthstone Brands S-1 became public. It listed four portfolio companies. You knew three of them.',
      ],
    });
  }

  // ================================================================ hearing
  const HEARING = {
    title: 'Special Committee of the Board — Brightwell Brands',
    place: 'SALA DE JUNTAS, BOTANAS DEL NORTE · VIE 6/11 10:04 AM',
    objection: '¡SEMÁFORO ROJO!',
    credLabel: 'Credibility with the special committee',
    reaction: 'Margaret Liu writes something down and underlines it.',
    rounds: [
      { who: 'salinas', key: 'r1', evidence: ['ev_gls'], claim: 'Grupo Logístico Sierra is a legitimate customs consultancy. Paperwork in Mexico is complicated. Every company here uses gestores.', press: 'They know the people, the forms, the process. That is what we pay for.', wrong: 'Salinas: "I don’t understand what this has to do with GLS."',
        after: [['you', 'GLS isn’t a licensed customs broker. It was incorporated eleven days before its first invoice. Its only shareholder is your cousin, Tito. It charges twelve percent of customs value. A real broker, Don Esteban Montes, charges less than half a percent.'], ['salinas', 'Tito is very good at paperwork.'], ['you', 'Then why are its invoices paid to someone else’s account?']] },
      { who: 'salinas', key: 'r2', evidence: ['ev_semaforo', 'ev_envelope'], claim: 'Our shipments clear customs normally. Botanas del Norte has never paid anyone to avoid an inspection.', press: 'The semáforo is random. Green, red — it is luck.', wrong: 'Salinas: "That proves nothing about customs."',
        after: [['you', 'Three red lights in Q1. Each one cleared the same day without an inspection. Each one, GLS withdrew cash that morning. On Tuesday I watched your cousin hand an envelope to an officer at lane one, and your truck left twelve minutes later without unloading.'], ['you', 'And every IMMEX shipment stayed in Mexico. Half a million dollars of duties evaded in one quarter. That’s not a facilitating payment. That’s bribery.']] },
      { who: 'ibarra', key: 'r3', evidence: ['ev_te'], claim: 'All of the Director General’s expense reports were reviewed and approved under policy.', press: 'I sign them every month. They are within the limits.', wrong: 'Ibarra: "That is not an expense report."',
        after: [['you', 'Within the limits because they were split to fit under them. Four iPhones on two receipts, $2,980 each. An $8,000 cash advance for "trámites" on a red-light day. Twelve bottles of Clase Azul "for SAT and ANAM officials" — that’s what the receipt says.'], ['ibarra', '…I didn’t read them. I never read them.']] },
      { who: 'dunmore', key: 'r4', evidence: ['ev_funds'], claim: 'Corporate had no knowledge of any of this. It’s a local matter. I approve budgets, not invoices.', press: 'I’m in Monterrey six days a quarter. I can’t see everything.', wrong: 'Dunmore: "That doesn’t have anything to do with me."',
        after: [['you', 'GLS received $546,000 from Botanas del Norte in Q1. Forty-one percent went to officials and their families. And $130,000 went by wire to Dunmore Advisory LLC, Frost Bank, Houston.'], ['you', 'You approved GLS’s inclusion in the FY26 budget, Craig. And GLS paid you for it.'], ['liu', 'Mr. Dunmore, I suggest you stop speaking and call a lawyer.']] },
      { who: 'asher', key: 'r5', evidence: ['ev_exposure'], claim: 'Whatever this is, it’s immaterial to a $640 million transaction. A modest escrow solves it. We close on schedule.', press: 'Five million in escrow. Generous, frankly.', wrong: 'Asher: "I’m afraid that’s not responsive."',
        after: [['you', 'Mexican customs exposure alone is $7.5 to $8.2 million before anyone talks about FCPA penalties, disgorgement or the cost of the monitor. Your escrow doesn’t cover the low end.'], ['you', 'And in a stock deal the liability comes with the company. The safe harbor rewards disclosure. It doesn’t replace it.'], ['asher', 'You make it sound so final.']] },
      { who: 'liu', key: 'r6', evidence: ['ev_ledger'], claim: '{last}, I need to know what our June 30 financial statements and our auditors will see. How was this recorded, and what do we do?', press: 'Specifically. Accounts, amounts, controls.', wrong: 'Liu: "That isn’t an answer to my question."',
        after: [['you', 'GLS payments were recorded as freight-in and capitalized into the cost of imported ingredients. $310,000 is still in inventory at June 30. It has to be expensed, isolated, and it isn’t tax-deductible. Accrue $7.53 million for the customs exposure and disclose the range.'], ['you', 'And an officer taking kickbacks while a GM overrides controls is a material weakness, whatever the dollar amount.']] },
    ],
    async lose() {
      await say('liu', 'I’m going to pause us. {first}, the committee needs exhibits that answer the claims in front of us.');
      await say('salinas', 'Gracias, señora. As I said: paperwork.');
      await say('liu', 'Ten minutes.');
    },
    async finale() {
      await say('liu', 'The committee will make a voluntary disclosure to the Department of Justice and the SEC. Mr. Salinas, Mr. Dunmore: you’re relieved of your duties effective immediately. Mr. Ibarra, please stay; counsel would like to speak with you.');
      await narrate('Salinas rises slowly and buttons his linen jacket. On his way past, he pauses beside you.');
      await K.gate('salinas', 'Monterrey es una ciudad pequeña, {first}. A small city. People talk. People remember.', [
        'We’re self-reporting to the DOJ, the SEC and the Fiscalía this week. Ana Lucía has documented everything. Threats go in the report too.',
        'Is that a threat?',
        'Maybe we can work something out.',
      ], 0, 'hearing.r7', async c => {
        if (c === 1) await say('salinas', 'A threat? No. An observation about geography.');
        else await say('garza', '{first}. No. Absolutely not.');
      });
      await say('garza', 'And I’ve just noted the time and his words. 11:52. Thank you, señor.');
      await narrate('Salinas leaves. Simon Asher remains seated, studying you with something that looks almost like admiration.');
    },
  };

  // ================================================================ talk
  const TALK = {
    async garza(ch, f) {
      if (ch === 0 && !f.met_garza) {
        await say('garza', 'Ana Lucía Garza, Garza & Treviño. Welcome to Monterrey. I’m Brightwell’s Mexican counsel for this matter.');
        await say('garza', 'Three rules. One: personal data stays in Mexico unless I clear it — our privacy law is strict. Two: anything sensitive, we discuss under privilege, with me present. Three: if anyone makes you uncomfortable, you call me. Day or night.');
        await say('garza', 'The Director General is expecting you. Rodrigo is… charming. Don’t accept gifts.');
        f.met_garza = true; return;
      }
      const l = { 0: 'Your room is the sala de juntas. I’ll be there.', 1: 'Don Esteban is the best broker on the border. If he says something is wrong, it is wrong.', 2: 'Expense reports involve personal data. Request them through Héctor, formally, citing the committee’s resolution and the privacy notice. I’ve drafted the letter.', 3: 'Stay close to me.', 4: 'Calder’s lawyers have asked for our workpapers. The answer is no.', 5: 'Breathe.' };
      await say('garza', l[ch] || '…');
    },
    async salinas(ch, f) {
      if (ch === 0 && !f.met_salinas) {
        if (!f.met_garza) return say('salinas', '¡Bienvenidos! Please, check in with reception first.');
        await say('salinas', 'Rodrigo Salinas. Bienvenidos to Botanas del Norte. Nineteen years I’ve run this plant. We make the best chips in Nuevo León. Try the habanero.');
        await say('salinas', 'Brightwell’s board is nervous because of a hotline message. I understand. Mexico makes Americans nervous. But you’ll find a family business here, with family values.');
        await say('salinas', 'Anything you need. My assistant Marisela, my finance director Héctor, they are at your service.');
        f.met_salinas = true; return;
      }
      const l = { 0: 'Mi casa es su casa.', 1: '¿Nuevo Laredo? Hot this time of year.', 2: 'I hear you are reading my expense reports. Very thorough. I eat a lot of dinners.', 4: 'Simon Asher is an old friend. He tells me you are very good.', 5: '…' };
      await say('salinas', l[ch] || 'Buenas.');
    },
    async ibarra(ch, f) {
      if (ch === 2 && !f.got_te) {
        await say('ibarra', 'Expense reports? For the Director General? I… I would need his authorization.');
        await K.gate('you', null, [
          'Here is the special committee’s resolution and Ana Lucía’s formal request. Personal data will be handled under the privacy notice and stay in Mexico with counsel. I need all T&E and petty cash for Mr. Salinas since January.',
          'Give them to me or you’ll be fired.',
          'Rodrigo already said it was fine.',
        ], 0, 'dlg.ibarra', async c => {
          if (c === 1) await say('ibarra', 'You cannot fire me. Only Rodrigo can fire me. That is the problem.');
          else await say('ibarra', 'He did not. He told me this morning to give you nothing. Please don’t lie to me.');
        });
        await say('ibarra', 'A resolution. A formal letter. The privacy notice. …Bueno. That is procedure. I follow procedure.');
        await narrate('He prints a stack of expense reports. His hands shake slightly as he hands them over.');
        await say('ibarra', 'I sign them every month. I never read them. That is the truth.');
        f.got_te = true; K.obtain('GM expense reports & petty cash, Jan–Mar 2027'); return;
      }
      await say('ibarra', ['Bienvenidos.', 'Mexican GAAP, US GAAP, IFRS. I speak all of them. Badly.', 'Please, whatever you need.'][ch % 3]);
    },
    async dunmore(ch, f) {
      const l = { 0: 'Craig Dunmore, Brightwell, VP LatAm. Houston guy. Rodrigo’s the best GM we’ve got. You’ll see.', 2: 'Heard you’re looking at expense reports. Hey — in Mexico, relationships are the business. It’s cultural.', 5: '…' };
      await say('dunmore', l[ch] || 'Howdy.');
    },
    async lucia(ch, f) {
      if (ch === 3 && !f.lucia_met) return luciaScene();
      if (ch === 5) return say('lucia', 'Go. I’ll be at my desk. Reconciling. Pretending.');
      const l = { 0: 'Lucía Ferrer, aduanas. I reconcile the pedimentos. Every one.', 1: '…', 2: 'Be careful today.', 4: 'He was here at eight. The tall man. He asked Diego for my name.' };
      await say('lucia', l[ch] || 'Hola.');
    },
    async diego(ch, f) {
      if (ch === 0 && f.phone_found && !f.got_vendors) {
        await say('diego', 'Diego, cuentas por pagar. Customs and logistics vendors for FY26? Claro. Payments, and the vendor files.');
        await say('diego', 'GLS’s file is… thin. The vendor form says "approved by Director General" and that’s about it.');
        f.got_vendors = true; K.obtain('FY26 customs & logistics vendor payments + vendor files'); return;
      }
      await say('diego', ['Hola.', 'GLS invoices always come with "urgente" written on them. In red.', 'I pay what I’m told to pay.'][ch % 3]);
    },
    async marisela(ch, f) {
      const l = { 0: 'The Director General is very busy. Can I offer you agua fresca?', 2: 'If you want his expense reports, Héctor has them. I just staple the receipts.', 4: 'Mr. Asher asked for your hotel. I didn’t tell him.', 5: '…' };
      await say('marisela', l[ch] || 'Buenos días.');
    },
    async montes(ch, f) {
      if (!f.met_montes) {
        await say('montes', 'Esteban Montes. Agente aduanal, patente 3417. Forty-one years on this border. Ana Lucía called. Sit.');
        await K.gate('you', null, [
          'Don Esteban, as a licensed broker: what does a real broker do, and what does GLS do?',
          'Is Botanas del Norte paying bribes?',
          'How much would it cost to clear a red light?',
        ], 0, 'dlg.montes', async c => {
          if (c === 1) await say('montes', 'You come to my office and ask me that in the first minute? Mijo. Ask me a professional question.');
          else await say('montes', '¡Qué barbaridad! I have never paid a peso in forty-one years. Ask me something worthy of my license.');
        });
        await say('montes', 'A broker classifies the goods, files the pedimento, pays the duties, presents for inspection when the light is red. For that, I charge less than half a percent. I have a license. I can lose it.');
        await say('montes', 'GLS has no license. It cannot file a pedimento. So what is it paid twelve percent for?');
        await say('montes', 'And Botanas imports seasoning and cheese powder under IMMEX — temporary import, no duty, as long as the finished product is exported. But Botanas sells only in Mexico. Nothing is exported. Ever.');
        await say('montes', 'Watch lane one. Their truck is due at 11:30. I have all their pedimentos on my computer when you are ready.');
        f.met_montes = true; return;
      }
      if (!f.saw_envelope) return say('montes', 'Lane one. Watch.');
      await say('montes', 'Now you have seen it. Come. The pattern is in the pedimentos.');
    },
    async tito(ch, f) { if (!f.met_montes) return say('tito', '\u00bfQu\u00e9? Move along.'); if (!f.saw_envelope) return envelopeScene(); },
    async asher(ch, f) {
      if (ch === 4 && !f.asher_met) return asherScene();
      await say('asher', ch === 5 ? 'Good morning. I’m only here for the buyer.' : 'Lovely patio.');
    },
    async liu(ch, f) { if (ch === 5 && !f.hearing_done) return hearing(); },
    async lena(ch, f) { await say('lena', 'Six claims. You’ve got six exhibits. Margaret reads everything twice.'); },
  };

  // ================================================================ objects
  const FLAVOR = {
    reception: 'A bowl of habanero chips for visitors and a framed photo: Salinas cutting a ribbon with the governor.',
    logo: 'BOTANAS DEL NORTE — "El sabor de Nuevo León." A Brightwell Brands company.',
    r_couch: 'A leather couch, cool to the touch. The air conditioning is aggressive.',
    s_desk: 'A gold pen, a humidor, and a framed letter of thanks from a customs administrator.',
    s_pc: 'Locked.',
    s_shelf: 'Leather-bound books nobody has opened and a signed Rayados jersey.',
    s_art: 'A large oil painting of the Cerro de la Silla at sunset.',
    s_bar: 'A minibar with twelve bottles of Clase Azul tequila. Eleven, actually.',
    s_couch: 'Where the Director General entertains.',
    mar_pc: 'A calendar: "R.S. — comida El Rey" appears on the same days as several red lights.',
    mar_desk: 'A stapler and a thick folder of receipts.',
    mar_files: 'Travel and entertainment receipts, by month.',
    h_desk: 'Approved expense reports in a tray, each signed "H. Ibarra" in identical, hurried ink.',
    h_pc: 'Héctor’s screen: the trial balance, mapped to Brightwell’s chart of accounts.',
    h_files: 'Monthly close binders. The FY26 freight-in reconciliation is labeled "NO TOCAR."',
    sala_table: 'Your table. Pedimentos, coffee, and a growing pile of Post-its.',
    sala_screen: 'A video screen. Chicago is six hours of time zones and a world away.',
    ap_pc: 'An AP workstation. CFDI invoices stack up in the queue.',
    ap_files: 'Vendor files. GLS’s is the thinnest in the drawer.',
    l_pc: 'Lucía’s reconciliation: every pedimento matched to every invoice, color-coded. Red rows have GLS invoices.',
    l_desk: 'A photo of two sisters at a quinceañera.',
    pedimento_pc: 'The customs system. Every import entry since 2019.',
    pedimento_files: 'Pedimentos, by month. Each one stamped with the regime: A1 or IMMEX.',
    aduana_sign: 'ADUANAS Y LOGÍSTICA.',
    fountain: 'A tiled fountain. The water sounds cooler than it is.',
    patio_table: 'Iron patio tables under umbrellas.',
    w_rack: 'Cases of chips, salsa jars and seasoning drums.',
    w_pallet: 'Pallets of imported seasoning blend. The drums are labeled "IMMEX — TEMPORAL."',
    w_forklift: 'A forklift.',
    semaforo: 'The semáforo fiscal. Press the button: green, you go; red, you get inspected.',
    semaforo2: 'Lane 2’s semáforo.',
    insp_dock: 'The inspection dock. Trucks with red lights are supposed to unload here.',
    insp_sign: 'REVISIÓN — INSPECTION.',
    mo_desk: 'Don Esteban’s desk: a magnifying glass, a tariff schedule from 1994 with notes in four colors, and a saint’s candle.',
    mo_files: 'Forty-one years of pedimentos.',
    mo_cooler: 'A garrafón of water. Don Esteban offers you a cup without asking.',
    mo_sign: 'AGENCIA ADUANAL MONTES — PATENTE 3417 — DESDE 1986.',
    railing: 'Monterrey glitters below. Somewhere down there, a gray SUV.',
    bench: 'A stone bench, still warm from the day.',
    flag: 'MIRADOR DEL OBISPADO.',
  };

  async function use(id, ch, f) {
    if (id === 'sala_pc') { await usePC(); return true; }
    if (id === 'chips') {
      if (!f.met_salinas) { await narrate('A bag of Botanas del Norte habanero chips on a side desk.'); return true; }
      if (f.phone_found) { await narrate('The chips are gone. You don’t remember eating them. You remember eating them.'); return true; }
      await narrate('A bag of Botanas del Norte habanero chips, sealed, sitting on the side desk in your conference room. It’s much too heavy.');
      await narrate('Inside, under the chips: a prepaid phone in a sandwich bag, and a note in Spanish and English. *"Ask what GLS does. Then ask who it pays. — A"*');
      f.phone_found = true;
      K.addEvidence('ev_chips');
      G.ui.updateHud();
      await K.sleep(600);
      await text('Hola. Soy ADUANA. I work here. I cannot be seen with you.');
      await text('Grupo Logístico Sierra. Ask Diego for the vendor payments. Compare GLS to the real broker. You’ll see.');
      await text('When you’re stuck I’ll help. When you’re very stuck, I’ll just say it.');
      await narrate(G.touch ? '(Tap *Phone* at the top of the screen to read messages, and *Case File* to review your evidence.)' : '(Press *P* to read the phone. Press *J* to open your case file.)');
      return true;
    }
    if (id === 'bdn_truck') {
      if (ch === 1 && f.met_montes && !f.saw_envelope) { await envelopeScene(); return true; }
      await narrate('A Botanas del Norte truck, BDN on the cab. ' + (f.saw_envelope ? 'It left lane 1 without being inspected.' : 'Waiting for its turn at lane 1.'));
      return true;
    }
    if (id === 'montes_pc') {
      if (ch === 1 && f.saw_envelope) { await K.runPuzzle('wpG2'); return true; }
      await narrate('Don Esteban’s computer. He’ll show you when you’re ready.');
      return true;
    }
    return false;
  }

  async function usePC() {
    const f = F(), ch = S().chapter;
    if (ch === 0) { if (!f.got_vendors) return narrate('You need the vendor payments from Diego first.'); return K.runPuzzle('wpG1'); }
    if (ch === 2) { if (!f.got_te) return narrate('You need the GM’s expense reports.'); return K.runPuzzle('wpG3'); }
    if (ch === 3) return K.runPuzzle('wpG4');
    if (ch === 4) { if (!f.asher_met) return narrate('Simon Asher is waiting in the patio. Get it over with.'); if (!done('wpG5')) return K.runPuzzle('wpG5'); return K.runPuzzle('wpG6'); }
    return narrate('Everything is in the case file.');
  }

  function onStep(x, y, s) {
    const f = s.flags;
    if (s.map === 'oficinas' && s.chapter === 4 && !f.asher_met && x >= 26 && y >= 12 && y <= 19) E().script(asherScene);
    if (s.map === 'oficinas' && s.chapter === 5 && !f.hearing_done && !f.liu_intro && x >= 34 && x <= 42 && y <= 8) E().script(hearing);
  }

  // ================================================================ workpapers
  const defs = {};
  defs.wpG1 = {
    ref: 'WP M-1 · THIRD-PARTY RISK (FCPA)',
    title: 'Customs & Logistics Vendors — Grupo Logístico Sierra',
    intro: 'A real broker charges almost nothing. GLS charges a fortune. Why?',
    header() {
      return '<div class="wp-meta"><span>Entity: <b>Botanas del Norte, S.A. de C.V.</b> (100% owned by Brightwell Brands, Inc., an SEC issuer)</span><span>Period: <b>FY26</b></span><span>USD at 18.0 MXN/USD</span></div>' +
        '<div class="tbl-wrap"><table class="ledger"><tr><th>Vendor</th><th>Service</th><th class="num">FY26 fees</th><th class="num">Declared customs value handled</th><th class="num">Fee %</th></tr>' +
        '<tr><td>Agencia Aduanal Montes (patente 3417)</td><td>Licensed customs brokerage</td><td class="num">81,900</td><td class="num">18,200,000</td><td class="num">0.45%</td></tr>' +
        '<tr><td>Transportes del Norte</td><td>Freight, Nuevo Laredo – Santa Catarina</td><td class="num">412,000</td><td class="num">n/a</td><td class="num">n/a</td></tr>' +
        '<tr><td>Grupo Logístico Sierra (GLS)</td><td>"Consultoría aduanal / agilización de trámites"</td><td class="num">2,184,000</td><td class="num">18,200,000</td><td class="num"><b style="color:#b8312f">?</b></td></tr></table></div>';
    },
    steps: [
      num('rate', 'GLS fees as a percentage of declared customs value?', {
        answerText: '12.0%', placeholder: '%', suffix: '%',
        check(v) { if (Math.abs(v - 12) <= 0.05 || Math.abs(v - 0.12) <= 0.0005) return true; if (Math.abs(v - 0.45) <= 0.01) return 'That’s the licensed broker.'; return 'Doesn’t tie. GLS fees ÷ customs value.'; },
      }, { okMsg: '$2,184,000 ÷ $18,200,000 = <b>12.0%</b> — twenty-seven times what a licensed broker charges for actually filing the paperwork.' }),
      multiPick('flags', 'GLS vendor file and public registry (RPC Nuevo León). Select every FCPA red flag.', [
        { t: 'Fact' },
      ], [
        { ok: true, cells: ['Incorporated 11 days before its first invoice to BDN.'] },
        { ok: true, cells: ['Not a licensed customs broker (no patente aduanal) — cannot legally file pedimentos.'] },
        { ok: true, cells: ['Sole shareholder: Tomás "Tito" Salinas Garza, first cousin of the GM, who approved the vendor.'] },
        { ok: true, cells: ['Invoices describe "agilización de trámites" (expediting) with no deliverables.'] },
        { ok: true, cells: ['Payment instructions direct funds to "Comercializadora Rivas," not to GLS.'] },
        { ok: false, why: 'A Monterrey address is ordinary for a Monterrey vendor.', cells: ['Registered office in Monterrey, N.L.'] },
        { ok: false, why: 'CFDI electronic invoices are required by SAT for everyone. Not a red flag.', cells: ['Invoices issued as CFDI electronic invoices.'] },
        { ok: false, why: 'Net 30 is normal terms.', cells: ['Payment terms net 30.'] },
      ], { okMsg: 'Newly formed, unlicensed, owned by the approver’s cousin, vague services, and payments routed to someone else. Every item on the DOJ’s third-party red-flag list.' }),
      mc('fcpa', 'Why does this matter under the FCPA, even though BDN is a Mexican company paying a Mexican vendor in Mexico?', [
        { t: 'It doesn’t. The FCPA only applies to payments made in the United States.', ok: false, why: 'The anti-bribery provisions reach issuers and their agents acting anywhere, and the accounting provisions apply to the consolidated books of an issuer — including a 100%-owned subsidiary.' },
        { t: 'It’s a high-risk intermediary: the FCPA prohibits payments to a third party while knowing they’ll be passed to a foreign official — and "knowing" includes conscious disregard of a high probability. Red flags like these defeat "we didn’t know."', ok: true, why: 'Most FCPA cases involve intermediaries. The statute’s knowledge standard is built for exactly this: you can’t avoid liability by not asking.' },
        { t: 'It only matters if the payments are material to Brightwell.', ok: false, why: 'Neither the anti-bribery nor the books-and-records provisions have a materiality threshold.' },
        { t: 'The facilitating payments exception covers "expediting," so it’s fine.', ok: false, why: 'The exception is for routine, non-discretionary government action. Twelve percent of customs value is not a routine expediting fee.' },
      ]),
    ],
    conclusion: 'GLS is an unlicensed shell owned by the GM’s cousin, paid 27 times the market rate for "expediting."',
  };

  const PED = [
    ['P-1', '01/08', 'VERDE', '01/08', '—', 'A1 (definitive, duties paid)', 410000, false, 'Green light, definitive import, duties paid. Clean.'],
    ['P-2', '01/19', 'ROJO', '01/19 14:10 — no inspection', 'Cash $38,000 01/19 11:52; GLS invoice 01/20', 'IMMEX (temporary)', 520000, true],
    ['P-3', '02/02', 'VERDE', '02/02', '—', 'IMMEX (temporary)', 480000, false, 'Green light — released automatically. (Still an IMMEX problem; just not a red-light release.)'],
    ['P-4', '02/15', 'ROJO', '02/18 after physical inspection', '—', 'A1 (definitive, duties paid)', 395000, false, 'A red light handled properly: unloaded, inspected, released three days later. This is what a red light is supposed to look like.'],
    ['P-5', '02/23', 'ROJO', '02/23 16:40 — no inspection', 'Cash $41,500 02/23; GLS invoice 02/24', 'IMMEX (temporary)', 610000, true],
    ['P-6', '03/04', 'VERDE', '03/04', '—', 'IMMEX (temporary)', 450000, false, 'Green light — automatic release.'],
    ['P-7', '03/22', 'ROJO', '03/22 13:05 — no inspection', 'Cash $36,000 03/22; GLS invoice 03/23', 'IMMEX (temporary)', 590000, true],
    ['P-8', '03/29', 'VERDE', '03/29', 'GLS invoice $12,000 03/30 ("gestión")', 'A1 (definitive, duties paid)', 380000, false, 'Suspicious invoice — but this was a green light. Nothing needed "expediting."'],
  ];
  defs.wpG2 = {
    ref: 'WP M-2 · CUSTOMS ENTRIES & IMPROPER PAYMENTS',
    title: 'Pedimentos Q1 2027 — Semáforo, Releases & IMMEX',
    intro: 'Red means stop. Unless someone pays for green.',
    header() {
      return '<div class="wp-meta"><span>Source: <b>Agencia Aduanal Montes pedimento records; GLS invoices (AP); bank activity</b></span><span>Duty rate on these goods if imported definitively: <b>20%</b></span></div>' +
        '<div class="wp-note">IMMEX (Programa de la Industria Manufacturera, Maquiladora y de Servicios de Exportación) allows temporary duty-free import of inputs <i>for goods that are exported</i>. Botanas del Norte has no exports; 100% of its production is sold in Mexico.</div>';
    },
    steps: [
      multiPick('red', 'Select every entry where a red light (mandatory inspection) was released the same day without inspection, coinciding with a GLS payment.', [
        { t: 'Entry' }, { t: 'Arrived' }, { t: 'Semáforo' }, { t: 'Released', wrap: 1 }, { t: 'GLS activity', wrap: 1 }, { t: 'Regime', wrap: 1 }, { t: 'Customs value', num: 1 },
      ], PED.map(r => ({ ok: r[7], why: r[8], cells: [r[0], r[1], r[2] === 'ROJO' ? '<b style="color:#b8312f">ROJO</b>' : '<b style="color:#3a8a4a">VERDE</b>', r[3], r[4], r[5], fmt(r[6])] })), { okMsg: 'P-2, P-5 and P-7: three red lights, three same-day releases with no inspection, three GLS cash withdrawals that morning. The one legitimate red light (P-4) took three days.' }),
      num('duty', 'Every IMMEX entry was consumed in Mexico, so duties were owed. How much duty was evaded on Q1 IMMEX entries?', {
        answerText: '$530,000', placeholder: '$', suffix: 'USD',
        check(v) { v = D(v); if (Math.abs(v - 530000) <= 1) return true; if (Math.abs(v - 2650000) <= 1) return 'That’s the customs value. Apply the 20% duty.'; if (Math.abs(v - 344000) <= 1) return 'All IMMEX entries owe duty, not just the red-light ones.'; return 'Doesn’t tie. Sum the customs value of IMMEX entries × 20%.'; },
      }, { okMsg: 'IMMEX customs value $2,650,000 × 20% = <b>$530,000</b> of duties evaded in one quarter. The red-light payments kept inspectors from noticing where the goods were going.' }),
      mc('facil', 'Management argues the GLS cash payments were "facilitating payments" for routine customs processing. Does the FCPA exception apply?', [
        { t: 'Yes — customs clearance is a routine governmental action.', ok: false, why: 'Processing papers is routine. Waiving a mandatory inspection and letting goods enter under a regime they don’t qualify for is a discretionary decision.' },
        { t: 'No. The exception covers routine, non-discretionary acts the payer is already entitled to. Paying to skip an inspection and evade duties buys a discretionary act and an improper advantage — and Mexican law prohibits it regardless.', ok: true, why: 'The facilitating-payments exception is narrow. Avoiding duties is the classic "improper advantage." And the exception never makes a payment legal under local law.' },
        { t: 'Yes, as long as each payment is under $50,000.', ok: false, why: 'There’s no dollar threshold in the exception.' },
        { t: 'Only if the payments were recorded accurately as bribes.', ok: false, why: 'Accurate recording would help with the books-and-records provision, but wouldn’t make these payments facilitating.' },
      ]),
    ],
    conclusion: 'Three red lights bought green. $530,000 of duties evaded in one quarter. Not a facilitating payment.',
  };

  const TE = [
    ['01/19', 'Restaurante El Rey', 'Dinner — "clientes," R. Salinas + 3 (no names)', 1840, true, 'Same day as red-light release P-2'],
    ['02/03', 'Apple Store Monterrey', '"Regalos clientes": 4× iPhone, two receipts of $2,980', 5960, true, 'Split under the $3,000 approval threshold'],
    ['02/14', 'Hotel Quinta Real', 'Lodging — C. Dunmore business visit', 612, false, '', 'Ordinary business travel with a named traveler and purpose.'],
    ['02/23', 'Caja chica (petty cash)', 'Cash advance — "GLS, trámites aduanales"', 8000, true, 'Same day as red-light release P-5'],
    ['03/10', 'Vinoteca San Pedro', '12× Clase Azul — "atención a funcionarios SAT/ANAM"', 4200, true, 'Gifts expressly for tax and customs officials'],
    ['03/15', 'Uber', 'Airport transfer', 48, false, '', 'A taxi.'],
    ['03/22', 'Restaurante San Carlos', 'Lunch — Agente Aduanal E. Montes (named)', 210, false, '', 'A modest, documented lunch with a named, licensed private broker. Not a government official.'],
  ];
  defs.wpG3 = {
    ref: 'WP M-3 · T&E & PETTY CASH (FCPA ACCOUNTING PROVISIONS)',
    title: 'Director General — Expense Reports & Petty Cash, Q1 2027',
    intro: 'Dinners, gifts and cash. Look at the dates. Look at who’s at the table.',
    header() {
      return '<div class="wp-meta"><span>Source: <b>Expense reports and petty cash (H. Ibarra), handled under counsel’s privacy protocol</b></span><span>Policy: single-receipt approval threshold <b>$3,000</b>; gifts to government officials prohibited</span><span>USD</span></div>';
    },
    steps: [
      multiPick('items', 'Select every improper item.', [
        { t: 'Date' }, { t: 'Vendor' }, { t: 'Description', wrap: 1 }, { t: 'USD', num: 1 }, { t: 'Note', wrap: 1 },
      ], TE.map(r => ({ ok: r[4], why: r[6], cells: [r[0], r[1], r[2], fmt(r[3]), r[5]] })), { okMsg: 'Undisclosed hospitality on a release day, split gifts, cash for "trámites," and tequila literally labeled for officials.' }),
      num('total', 'Total improper T&E and petty cash in Q1?', {
        answerText: '$20,000', placeholder: '$', suffix: 'USD',
        check(v) { if (Math.abs(v - 20000) <= 1) return true; if (Math.abs(v - 20870) <= 1) return 'You’ve included legitimate items.'; return 'Doesn’t tie. Sum the items you selected.'; },
      }, { okMsg: '<b>$20,000</b>.' }),
      mc('books', '$20,000 is immaterial to Brightwell’s $1.4 billion of revenue. Does it matter?', [
        { t: 'No — immaterial amounts don’t need adjustment.', ok: false, why: 'Materiality governs financial statement misstatement. The FCPA’s books-and-records provision has no materiality threshold.' },
        { t: 'Yes. Recording bribes and official gifts as "client gifts" and "petty cash" violates the FCPA books-and-records provision, which has no materiality threshold — and splitting receipts to dodge approval shows internal accounting controls being circumvented.', ok: true, why: 'The accounting provisions require books that "accurately and fairly reflect" transactions in reasonable detail. Mislabeling a bribe is a violation whatever its size.' },
        { t: 'Only if the officials were US officials.', ok: false, why: 'The FCPA is about foreign officials.' },
        { t: 'Only if Rodrigo Salinas is a US citizen.', ok: false, why: 'The issuer’s books are the issuer’s books, wherever they’re kept and whoever made the entry.' },
      ]),
    ],
    conclusion: '$20,000 of gifts, dinners and cash tied to officials, booked as client entertainment and split to avoid approval.',
  };

  const OUT = [
    ['01/19', 'Cash withdrawal', 38000, true, 'Day of red-light release P-2'],
    ['02/23', 'Cash withdrawal', 41500, true, 'Day of red-light release P-5'],
    ['03/22', 'Cash withdrawal', 36000, true, 'Day of red-light release P-7'],
    ['Jan–Mar', 'Transfers to María Elena Rojas', 60000, true, 'Spouse of the lane 1 customs supervisor'],
    ['Jan–Mar', 'Transfers to Consultores Integrales Vega', 48000, true, 'Owned by the brother of a state sanitary inspector'],
    ['02/28', 'Wire to Dunmore Advisory LLC, Frost Bank, Houston', 130000, false, 'Owner: Craig Dunmore', 'Not a government official — but hold that thought. That one is its own problem.'],
    ['Jan–Mar', 'Transfers to R. Salinas (personal)', 80500, false, 'The GM', 'A kickback to the GM — not a payment to an official.'],
    ['Jan–Mar', 'Owner draws — T. Salinas', 90000, false, 'GLS owner', 'Tito’s profit. Not an official.'],
    ['Jan–Mar', 'Payroll & rent (GLS)', 22000, false, 'Operating costs', 'GLS’s own operating costs.'],
  ];
  defs.wpG4 = {
    ref: 'WP M-4 · FUNDS FLOW TRACING',
    title: 'Grupo Logístico Sierra — Bank Statements, Q1 2027',
    intro: 'Inés kept every page. Follow every peso out.',
    header() {
      return '<div class="wp-meta"><span>Source: <b>GLS account statements via counsel (declaration of Inés Ferrer)</b></span><span>Q1 2027 receipts from Botanas del Norte: <b>$546,000</b></span><span>USD</span></div>';
    },
    steps: [
      multiPick('officials', 'Select every outflow to government officials or their relatives or affiliates.', [
        { t: 'Date' }, { t: 'Outflow', wrap: 1 }, { t: 'USD', num: 1 }, { t: 'Identified as', wrap: 1 },
      ], OUT.map(r => ({ ok: r[3], why: r[5], cells: [r[0], r[1], fmt(r[2]), r[4]] })), { okMsg: 'Cash on every red-light day, the customs supervisor’s wife, and a sanitary inspector’s brother: <b>$223,500</b>.' }),
      num('rate', 'What percentage of GLS’s Q1 receipts from BDN went to officials and their relatives?', {
        answerText: '40.9%', placeholder: '%', suffix: '%',
        check(v) { if (Math.abs(v - 40.9) <= 0.1 || Math.abs(v - 0.409) <= 0.001) return true; return 'Doesn’t tie. $223,500 ÷ $546,000.'; },
      }, { okMsg: '<b>40.9%</b> passed straight through to officials. The rest went to the Salinas family and to Houston.' }),
      mc('dunmore', 'Craig Dunmore, a US citizen and Brightwell officer who approved GLS in the FY26 budget, received $130,000 from GLS. What does that establish?', [
        { t: 'Nothing for Brightwell — it’s Dunmore’s personal matter.', ok: false, why: 'An officer of the issuer knowingly approving the intermediary is the issuer’s knowledge.' },
        { t: 'A kickback scheme reaching a US officer: Dunmore faces personal FCPA, money-laundering and fraud exposure, and his knowledge undercuts "corporate had no knowledge" — an officer’s knowledge is the company’s.', ok: true, why: 'He approved the intermediary and was paid by it. That’s personal criminal exposure and corporate knowledge in one wire.' },
        { t: 'It’s a consulting fee — lawful if reported as income.', ok: false, why: 'Paying taxes on a kickback doesn’t make it a consulting fee.' },
        { t: 'Only Mexican authorities have jurisdiction over GLS’s payments.', ok: false, why: 'The wire went to a Texas bank account owned by a US citizen who is an officer of a US issuer.' },
      ]),
    ],
    conclusion: '41% of GLS’s money went to officials. $130,000 went to Brightwell’s own VP Latin America in Houston.',
  };

  defs.wpG5 = {
    ref: 'WP M-5 · TRANSACTION EXPOSURE (M&A)',
    title: 'Hearthstone / Brightwell — Contingent Liabilities & Deal Implications',
    intro: 'He says it’s a rounding error. Make him a number.',
    header() {
      return '<div class="wp-meta"><span>Transaction: <b>Hearthstone Brands (Calder Ridge) to acquire 100% of Brightwell stock for $640M</b></span><span>Signing in 10 days</span><span>USD millions</span></div>' +
        '<div class="wp-exhibit"><b>Don Esteban Montes — reconstruction of IMMEX misuse, 2025 to Q1 2027:</b> omitted import duties <b>$3.10M</b>. Ley Aduanera Art. 178(I): fines of <b>130% to 150%</b> of omitted duties. Surcharges and inflation adjustment (recargos/actualización): <b>$0.40M</b>.</div>' +
        '<div class="wp-note">Calder Ridge proposal: close on schedule with a $5.0M escrow; any disclosure "after closing, under the DOJ M&A Safe Harbor."</div>';
    },
    steps: [
      num('low', 'What is the low end of Botanas del Norte’s Mexican customs exposure (duties + minimum fine + surcharges)? ($M)', {
        answerText: '7.53', placeholder: '$M', suffix: '$M',
        check(v) { v = M(v); if (Math.abs(v - 7.53) <= 0.005) return true; if (Math.abs(v - 8.15) <= 0.005) return 'That’s the high end (150%).'; if (Math.abs(v - 7.13) <= 0.005) return 'Add the surcharges.'; if (Math.abs(v - 4.43) <= 0.005) return 'The fine is 130% of duties — on top of the duties themselves.'; return 'Doesn’t tie. 3.10 + 130% × 3.10 + 0.40.'; },
      }, { okMsg: '$3.10M + $4.03M + $0.40M = <b>$7.53M</b> (high end $8.15M). Before any US penalties.' }),
      mc('accrue', 'The loss is probable and reasonably estimable within $7.53M–$8.15M, with no amount in the range better than any other. Under US GAAP, what does Brightwell record at June 30?', [
        { t: 'The midpoint, $7.84M.', ok: false, why: 'That’s IFRS (IAS 37). US GAAP is different.' },
        { t: 'The minimum of the range, $7.53M, with disclosure of the range and the reasonably possible additional loss (ASC 450-20-30-1).', ok: true, why: 'When no amount in the range is a better estimate, ASC 450 requires accruing the minimum and disclosing the possibility of more.' },
        { t: 'The maximum, $8.15M, to be conservative.', ok: false, why: 'Conservatism isn’t the standard.' },
        { t: 'Disclose only; accrue nothing until ANAM assesses.', ok: false, why: 'Probable and estimable means accrue.' },
      ]),
      mc('deal', 'What should the special committee tell Hearthstone about closing with a $5M escrow and disclosing "later"?', [
        { t: 'Fine — in a stock deal the seller keeps the liabilities.', ok: false, why: 'In a stock acquisition the target entity, with its liabilities, comes along. That’s successor liability.' },
        { t: 'Fine — the M&A Safe Harbor protects the buyer automatically.', ok: false, why: 'The Safe Harbor requires timely self-disclosure, cooperation and remediation. It’s not automatic, and it doesn’t erase the target’s past violations.' },
        { t: 'Brightwell is an issuer with known misconduct now: disclose to the DOJ and SEC, remediate, and re-price. Successor liability comes with the stock; the Safe Harbor rewards disclosure, it doesn’t replace it; and $5M doesn’t cover even the Mexican exposure.', ok: true, why: 'Known misconduct pre-signing belongs to the seller’s board to disclose and the buyer to price. Waiting to disclose "after closing" just transfers the problem with interest.' },
        { t: 'Only Mexico has jurisdiction, so no US disclosure is needed.', ok: false, why: 'A US issuer, a US officer, a Houston bank account and consolidated books say otherwise.' },
      ]),
    ],
    conclusion: 'At least $7.53M of Mexican customs exposure to accrue, US exposure on top, and no escrow that makes it go away.',
  };

  defs.wpG6 = {
    ref: 'WP M-6 · BOOKS, RECORDS & INTERNAL CONTROL',
    title: 'Where GLS Lives in the Ledger',
    intro: 'Héctor buried it somewhere boring. Freight is boring.',
    header() {
      return '<div class="wp-meta"><span>Source: <b>BDN general ledger mapped to Brightwell’s chart of accounts (H. Ibarra)</b></span><span>USD</span></div>' +
        '<div class="tbl-wrap"><table class="ledger"><tr><th>Period</th><th>BDN account</th><th>Brightwell mapping</th><th class="num">GLS amount</th></tr>' +
        '<tr><td>FY26</td><td>5105 Fletes y gastos de importación</td><td>Inventory — freight-in (capitalized)</td><td class="num">1,746,000</td></tr>' +
        '<tr><td>FY26</td><td>6240 Consultoría — otros</td><td>SG&A — professional fees</td><td class="num">438,000</td></tr>' +
        '<tr><td>H1 2027</td><td>5105 Fletes y gastos de importación</td><td>Inventory — freight-in (capitalized)</td><td class="num">820,000</td></tr></table></div>' +
        '<div class="wp-note">Inventory turnover: <b>37.8%</b> of ingredients imported in H1 2027 remain in inventory (raw materials and finished goods) at 6/30/2027. GLS amounts were deducted for Mexican income tax and reported to Brightwell for US consolidated tax.</div>';
    },
    steps: [
      num('inv', 'How much of the GLS payments is still capitalized in inventory at 6/30/2027? (nearest $1,000)', {
        answerText: '$310,000', placeholder: '$', suffix: 'USD',
        check(v) { v = D(v); if (Math.abs(v - 309960) <= 1000) return true; if (Math.abs(v - 820000) <= 1) return 'Not all H1 freight-in is still in inventory — only 37.8% of it.'; return 'Doesn’t tie. H1 2027 GLS freight-in × 37.8%.'; },
      }, { okMsg: '$820,000 × 37.8% = <b>~$310,000</b> of bribes sitting in the inventory balance as "freight."' }),
      mc('class', 'How should the GLS payments be accounted for?', [
        { t: 'Leave them in freight-in — they were incurred to bring goods to their location.', ok: false, why: 'Bribes to skip inspections and evade duties aren’t a cost of bringing inventory to its condition and location under ASC 330.' },
        { t: 'Expense them as incurred, isolate them in a separately identified account pending the investigation, and reverse their tax deductions — bribes aren’t deductible (IRC §162(c); Mexican law likewise).', ok: true, why: 'Not inventoriable, not deductible, and recorded transparently so the books reflect what actually happened.' },
        { t: 'Reclassify them as prepaid customs duties.', ok: false, why: 'They weren’t duties. They were the reason duties weren’t paid.' },
        { t: 'Net them against the omitted duty accrual.', ok: false, why: 'Two different things: one is a liability to ANAM, the other is money already gone.' },
      ]),
      mc('icfr', 'For Brightwell’s SOX 404 assessment, how should this be evaluated?', [
        { t: 'A deficiency only — the dollar amounts are small relative to consolidated revenue.', ok: false, why: 'Severity isn’t only about dollars.' },
        { t: 'Likely a material weakness: management override by the GM, no third-party due diligence or T&E enforcement at a significant component, and an officer receiving kickbacks. Fraud by senior management is a strong indicator of a material weakness regardless of amount (AS 2201).', ok: true, why: 'AS 2201 lists identification of fraud by senior management, of any magnitude, as an indicator of a material weakness. The entity-level controls failed.' },
        { t: 'Not an ICFR issue because the subsidiary is in Mexico.', ok: false, why: 'ICFR covers the consolidated entity.' },
        { t: 'Not an ICFR issue because it was fraud, not error.', ok: false, why: 'Controls exist precisely to prevent and detect fraud.' },
      ]),
    ],
    conclusion: 'Bribes recorded as freight and capitalized into inventory. Expense, isolate, de-deduct — and report a material weakness.',
  };

  // ================================================================ register
  function nightLights(mapName) {
    return mapName === 'oficinas' ? [{ x: 39, y: 4, r: 64 }, { x: 22, y: 10.5, r: 30 }, { x: 38, y: 9, r: 26 }] : [];
  }
  const def = {
    chapters: CHAPTERS, evidence: EV, clock, location, objective, npcPos, nightLights,
    newGame, beats, talk: TALK, use, flavor: FLAVOR, onStep, ending,
  };
  G.registerEpisode({
    id: 'ep4', num: 4,
    title: 'Facilitation',
    subtitle: 'Botanas del Norte · snacks, Monterrey · Customs bribery, IMMEX duty evasion and an acquirer who’d rather not know.',
    chapters: CHAPTERS,
    contact: { name: 'ADUANA', avatar: 'A', sub: 'número desconocido · cifrado', color: '#ff8a5a' },
    frustrated: 'Despacio. Slow down. Read the dates. In Mexico, the dates always tell the story.',
    ranks: ['Partner Track', 'Forensic Director', 'Senior Investigator', 'ADUANA Did the Heavy Lifting'],
    start: { map: 'oficinas', x: 5, y: 7, dir: 'up' },
    buildMaps: () => ({ oficinas: buildOficinas(), aduana: buildAduana(), mirador: buildMirador() }),
    cast, hints: HINTS, puzzles: defs, story: G.makeStory(def),
    puzzleEvidence: { wpG1: 'ev_gls', wpG2: 'ev_semaforo', wpG3: 'ev_te', wpG4: 'ev_funds', wpG5: 'ev_exposure', wpG6: 'ev_ledger' },
  });
})();
