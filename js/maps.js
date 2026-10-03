// Map construction. Each map has a floor layer (terrain/walls) and an object layer (furniture).
// Built programmatically so room geometry stays consistent.
(function () {
  const SOLID_FLOOR = new Set(['#', 'W', 'g']);
  const SOLID_OBJ = new Set(['D', 'C', 'T', 'F', 'B', 'P', 'S', 'K', 'M', 'R', 'w', 'c', 'X', 'Y', 'E', 'r', 'Q', 'O']);

  function makeMap(name, W, H) {
    const m = {
      name, W, H,
      floor: Array.from({ length: H }, () => Array(W).fill('#')),
      obj: Array.from({ length: H }, () => Array(W).fill(null)),
      interact: {},  // "x,y" -> id
      props: [],     // multi-tile drawables (cars)
      lights: [],    // night light sources {x,y,r}
      dark: false,
    };
    m.room = (x1, y1, x2, y2, ch) => { for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) m.floor[y][x] = ch; };
    m.door = (x, y) => { m.floor[y][x] = 'd'; };
    m.put = (x, y, ch, id) => { m.obj[y][x] = ch; if (id) m.interact[x + ',' + y] = id; };
    m.row = (x1, x2, y, ch, id) => { for (let x = x1; x <= x2; x++) m.put(x, y, ch, id); };
    m.tag = (x, y, id) => { m.interact[x + ',' + y] = id; };
    m.inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
    m.solid = (x, y) => {
      if (!m.inside(x, y)) return true;
      if (SOLID_FLOOR.has(m.floor[y][x])) return true;
      if (SOLID_OBJ.has(m.obj[y][x])) return true;
      for (const p of m.props) if (p.solid && x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h) return true;
      return false;
    };
    m.isWall = (x, y) => !m.inside(x, y) || m.floor[y][x] === '#' || m.floor[y][x] === 'W';
    return m;
  }

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
    const pillars = [[6, 8, 'A'], [13, 8, 'B'], [20, 8, 'C'], [26, 8, 'D']];
    for (const [x, y, l] of pillars) { m.put(x, y, 'O', 'pillar_' + l); m.pillarLabels = m.pillarLabels || {}; m.pillarLabels[x + ',' + y] = l; }
    // Parked cars (north row and south row), 2 wide x 3 tall
    const north = [[2, '#6b7a8f'], [5, '#8a2a2a'], [8, '#2f4f3f'], [17, '#c8c2b0'], [23, '#2a2d38'], [26, '#5a5f66']];
    const south = [[3, '#a08040'], [9, '#3b4b6b'], [12, '#7a7a7a'], [18, '#264036'], [24, '#9a3b2a']];
    for (const [x, c] of north) m.props.push({ kind: 'car', x, y: 1, w: 2, h: 3, color: c, facing: 'down', solid: true });
    for (const [x, c] of south) m.props.push({ kind: 'car', x, y: 14, w: 2, h: 3, color: c, facing: 'up', solid: true });
    m.lights = [{ x: 14.5, y: 2, r: 70 }, { x: 6.5, y: 10, r: 60 }, { x: 20.5, y: 10, r: 46, flicker: true }, { x: 26, y: 13, r: 54 }];
    m.put(10, 0, 'A', 'g_sign');
    return m;
  }

  G.maps = { floor: buildFloor(), garage: buildGarage() };
  G.SOLID_OBJ = SOLID_OBJ;
})();
