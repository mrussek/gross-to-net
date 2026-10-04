// Map construction toolkit. Each map has a floor layer (terrain/walls) and an object layer (furniture).
// Episodes build their own maps from these primitives so room geometry stays consistent.
(function () {
  const SOLID_FLOOR = new Set(['#', 'W', 'g', '!']);
  const SOLID_OBJ = new Set(['D', 'C', 'T', 'F', 'B', 'P', 'S', 'K', 'M', 'R', 'w', 'c', 'X', 'Y', 'E', 'r', 'Q', 'O',
    'H', 'j', 'f', 'v', 'n', 'l', 'G', 'I', 'o', 'e', 'u', 'q', 'y']);

  function makeMap(name, W, H, opts = {}) {
    const m = Object.assign({
      name, W, H,
      floor: Array.from({ length: H }, () => Array(W).fill('#')),
      obj: Array.from({ length: H }, () => Array(W).fill(null)),
      interact: {},  // "x,y" -> id
      labels: {},    // "x,y" -> short text for signs, pillars, dock doors
      props: [],     // multi-tile drawables (cars, trailers)
      lights: [],    // light sources used when the map is dark {x,y,r,flicker}
      dark: false,   // always dark (garages, night exteriors)
      darkness: 0.8,
    }, opts);
    m.room = (x1, y1, x2, y2, ch) => { for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) m.floor[y][x] = ch; };
    m.door = (x, y) => { m.floor[y][x] = 'd'; };
    m.put = (x, y, ch, id) => { m.obj[y][x] = ch; if (id) m.interact[x + ',' + y] = id; };
    m.row = (x1, x2, y, ch, id) => { for (let x = x1; x <= x2; x++) m.put(x, y, ch, id); };
    m.col = (x, y1, y2, ch, id) => { for (let y = y1; y <= y2; y++) m.put(x, y, ch, id); };
    m.tag = (x, y, id) => { m.interact[x + ',' + y] = id; };
    m.label = (x, y, text) => { m.labels[x + ',' + y] = text; };
    m.hline = (x1, x2, y, ch) => { for (let x = x1; x <= x2; x++) m.floor[y][x] = ch; };
    m.vline = (x, y1, y2, ch) => { for (let y = y1; y <= y2; y++) m.floor[y][x] = ch; };
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

  G.mapkit = { makeMap, SOLID_OBJ };
})();
