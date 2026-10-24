// ===== Bolsillito · Cruzar la calle (estilo Crossy Road), personajes y máquina gacha =====
(function () {
const A = App, S = A.S, { $, esc } = A; const ACT = A.ACTIONS;
const K = A.gameKit; if (!K) return;
const { gameShell, loadImgs, endCard, GM, payGame, gsfx, ST, spr, img } = K;

// ---------------- Personajes ----------------
// Los de la máquina que vienen con la app (pixel, hechos a mano). Los que agregues en el panel se suman solos.
const BUILT = {
  pollito: { name: 'Pollito', rare: 1, col: { k: '#5b3a3a', y: '#ffe066', s: '#f5c542', o: '#ff9a3c', p: '#ffb3c7' }, map: ['................', '.......kk.......', '......kyyk......', '.....kkyykk.....', '...kkyyyyyykk...', '..kyyyyyyyyyyk..', '.kyyyyyyyyyyyyk.', '.kyykyyyyyykyyk.', '.kyykyyooyykyyk.', '.kyppyyooyyppyk.', '.kyyyyyyyyyyyyk.', 'kyyyyyyyyyyyyyyk', '.kyyyyyyyyyyyyk.', '.ksyyyyyyyyyysk.', '..kssyyyyyyssk..', '...kkkkkkkkkk...', '....ok....ko....', '...oo......oo...'] },
  ranita: { name: 'Ranita', rare: 1, col: { k: '#5b3a3a', g: '#86dc5e', s: '#5cb83c', w: '#ffffff', l: '#d4f5ae', p: '#ffb3c7' }, map: ['................', '..kkkk....kkkk..', '.kwwwwk..kwwwwk.', '.kwkkwk..kwkkwk.', '.kwkkwkkkkwkkwk.', '.kgwwggggggwwgk.', 'kggggggggggggggk', 'kgppggggggggppgk', 'kgggggkkkkgggggk', 'kgggllllllllgggk', '.kggllllllllggk.', '.ksgggllllgggsk.', '..ksssggggsssk..', '..kkkkkkkkkkkk..', '.ggk........kgg.'] },
  gatito: { name: 'Gatito', rare: 1, col: { k: '#5b3a3a', n: '#ffad5c', s: '#f08a3a', w: '#fff6ec', p: '#ff9fbd' }, map: ['................', '.kk..........kk.', '.knk........knk.', '.knpk......kpnk.', '.knnnkkkkkknnnk.', '.knnnnnnnnnnnnk.', 'knnnnnnnnnnnnnnk', 'knnnknnnnnnknnnk', 'knnnknnppnnknnnk', 'knppnnnkknnnppnk', 'knnnnnnnnnnnnnnk', '.knnwwwwwwwwnnk.', '.ksnwwwwwwwwnsk.', '..kssnnnnnnssk..', '...kkkkkkkkkk...', '...kn......nk...'] },
  pinguino: { name: 'Pingüino', rare: 2, col: { k: '#3a3550', b: '#4f5f93', d: '#36436b', w: '#ffffff', o: '#ffa23c', p: '#ffb3c7' }, map: ['................', '.....kkkkkk.....', '...kkbbbbbbkk...', '..kbbbbbbbbbbk..', '.kbbbbbbbbbbbbk.', '.kbbwwwbbwwwbbk.', '.kbwwkwwwwkwwbk.', '.kbwpwwoowwpwbk.', 'kbbwwwwwwwwwwbbk', 'kbbbwwwwwwwwbbbk', 'kdbbwwwwwwwwbbdk', 'kdbbwwwwwwwwbbdk', '.kbbbwwwwwwbbbk.', '..kbbbbbbbbbbk..', '...kkkkkkkkkk...', '....oo....oo....'] },
  conejita: { name: 'Conejita', rare: 2, col: { k: '#5b3a3a', w: '#ffffff', s: '#f1dfe8', p: '#ffa6c5' }, map: ['...kk......kk...', '..kwwk....kwwk..', '..kwpk....kpwk..', '..kwpk....kpwk..', '..kwpk....kpwk..', '..kwwkkkkkkwwk..', '.kwwwwwwwwwwwwk.', 'kwwwwwwwwwwwwwwk', 'kwwwkwwwwwwkwwwk', 'kwppkwwppwwkppwk', 'kwwwwwwkkwwwwwwk', '.kwwwwwwwwwwwwk.', '.kswwwwwwwwwwsk.', '..ksswwwwwwssk..', '...kkkkkkkkkk...', '...wk......kw...'] },
  unicornio: { name: 'Unicornio', rare: 3, col: { k: '#5b3a3a', w: '#fffaf5', s: '#efe1ef', r: '#ff8fc0', v: '#b49cff', c: '#8fd8ff', y: '#ffd75e', p: '#ffb3c7' }, map: ['........k.......', '.......kyk......', '.k.....kyk....k.', '.kk...kyyyk..kk.', '.kwkkkkkkkkkkwk.', 'krrwwwwwwwwwwwwk', 'krvwwkwwwwkwwwwk', 'kvvwpwwwwwwpwwwk', 'kvcwwwwkkwwwwwwk', 'kccwwwwwwwwwwwwk', '.kcwwwwwwwwwwwk.', '.kswwwwwwwwwwsk.', '..ksswwwwwwssk..', '...kkkkkkkkkk...', '...pk......kp...'] }
};
Object.entries(BUILT).forEach(([k, b]) => { const keys = Object.keys(b.col); Pix.define('cgb_' + k, { raw: b.map.map(r => [...r].map(ch => ch === '.' ? '.' : keys.indexOf(ch).toString(36)).join('')), pal: keys.map(c => b.col[c]).join(',') }); });
const RARE = { 1: ['Común', '#8fd59a'], 2: ['Raro', '#8ec5ff'], 3: ['Súper raro', '#ff9fd0'] };
const GACHA_PRICE = 30, DUP_BACK = 10;
const catChars = () => (((A.CFG && A.CFG.catalog) || {}).chars || []).filter(x => !x.off && !(x.from && x.from > A.today()));
function allChars() {
  const out = catChars().map(x => ({ id: 'cg_' + x.id, name: x.name, sprite: 'cg_' + x.id, how: x.how || 'gacha', price: +x.price || 0, rare: +x.rare || 1 }));
  Object.entries(BUILT).forEach(([k, b]) => out.push({ id: 'cgb_' + k, name: b.name, sprite: 'cgb_' + k, how: 'gacha', rare: b.rare }));
  return out;
}
const PET_CHAR = () => ({ id: 'pet', name: (A.petInfo ? A.petInfo(K.activePet()).name : 'Tu mascota'), sprite: K.petSprite(), how: 'free', rare: 1, pet: true });
const findChar = id => id === 'pet' ? PET_CHAR() : allChars().find(c => c.id === id);
function CS() {
  const c = S.settings.calle = S.settings.calle || {}; c.owned = c.owned || [];
  allChars().forEach(ch => { if (ch.how === 'free' && !c.owned.includes(ch.id)) c.owned.push(ch.id); });
  if (!c.sel || (c.sel !== 'pet' && (!c.owned.includes(c.sel) || !findChar(c.sel)))) c.sel = c.owned.find(id => findChar(id)) || 'pet';
  return c;
}
const ownedChars = () => [PET_CHAR()].concat(allChars().filter(ch => CS().owned.includes(ch.id)));
A.calleChar = () => findChar(CS().sel) || PET_CHAR();

// ---------------- Escenarios ----------------
const BIO_LEN = 34, COLS = 9;
const BIOMES = [
  { id: 'pradera', name: 'Pradera', grass: ['#9ad86f', '#90d065'], side: '#6fae4b', dots: ['#7cc052', '#ffffff', '#ffd6e7', '#fff3a8'], road: '#77707f', side2: '#5e5867', dash: '#f6f1e6', water: '#7fd3f5', wave: '#c4efff', obs: ['tree', 'tree', 'bush', 'rock'], float: 'log', pad: 'lily', cars: ['car', 'car', 'van', 'car'], carCols: ['#ff8fab', '#ffd36e', '#8ec9ff', '#b9a3ff', '#8fe3b0'], train: ['#ff7aa2', '#ffffff'], w: { road: 5, water: 3, rail: 1.1 } },
  { id: 'ciudad', name: 'Ciudad pastel', grass: ['#f6dbe2', '#f2d2db'], side: '#d9aab8', dots: ['#e9c0cc'], tiles: true, road: '#5f5a74', side2: '#4c4760', dash: '#fff2a8', water: '#86d7ec', wave: '#d2f5ff', obs: ['lamp', 'bench', 'planter', 'hydrant'], float: 'boat', pad: 'buoy', cars: ['taxi', 'bus', 'car', 'car'], carCols: ['#9ad1ff', '#ffb0c8', '#c7b4ff', '#a8e6c0', '#ffffff'], train: ['#8ec9ff', '#ffffff'], w: { road: 7, water: 1.4, rail: 1.5 } },
  { id: 'playa', name: 'Playa', grass: ['#f7e6ae', '#f3dea0'], side: '#dcc27c', dots: ['#e6cd88', '#ffffff', '#ffb7a0'], road: '#8b8592', side2: '#716b78', dash: '#ffffff', water: '#4fc6ec', wave: '#bff1ff', obs: ['palm', 'umbrella', 'castle', 'palm'], float: 'surf', pad: 'buoy', cars: ['car', 'icecream', 'van'], carCols: ['#ff9e7a', '#7fe0d0', '#ffd36e', '#ff8fab'], train: ['#ffb36b', '#ffffff'], w: { road: 3, water: 6, rail: .6 } },
  { id: 'nieve', name: 'Bosque nevado', grass: ['#f4f8ff', '#e9f0fc'], side: '#bfd0ea', dots: ['#d5e2f5', '#ffffff'], road: '#8d93ab', side2: '#737992', dash: '#ffffff', water: '#6cc1e6', wave: '#b9e6f7', obs: ['pine', 'pine', 'snowman', 'rock'], float: 'ice', pad: 'ice1', cars: ['car', 'van', 'car'], carCols: ['#ff6f8f', '#7fb8ff', '#a8e6c0', '#ffcf6b'], train: ['#ff6f8f', '#fff6e8'], w: { road: 5, water: 3, rail: 1.4 } },
  { id: 'dulce', name: 'Dulcelandia', grass: ['#ffcade', '#ffc0d7'], side: '#f08db3', dots: ['#ff7fae', '#9fe0ff', '#fff07a', '#b9f0a8'], road: '#7b4b3c', side2: '#623a2e', dash: '#fff6ea', water: '#9fdcf5', wave: '#e6f8ff', obs: ['lolly', 'cupcake', 'cane', 'lolly'], float: 'wafer', pad: 'macaron', cars: ['icecream', 'car', 'van'], carCols: ['#a8e6ff', '#fff3a8', '#c8f0b0', '#ffd0f0', '#ffffff'], train: ['#9fd6ff', '#ffe0ec'], w: { road: 5, water: 4, rail: 1 } }
];
let bioShift = 0; // solo para probar los escenarios
const bioOf = r => BIOMES[(Math.floor(Math.max(0, r) / BIO_LEN) + bioShift) % BIOMES.length];

// ---------------- El juego ----------------
async function calleGame(opts) {
  opts = opts || {}; bioShift = opts.bioShift || 0;
  const sh = gameShell('calle'); let { w: W, h: H } = sh.fit(); const g = sh.g;
  const ch = A.calleChar();
  const I = await loadImgs({ me: spr(ch.sprite, 6), coin: spr('estrellita', 4), cloud: spr('nube', 4) });
  let T, P; const sizes = () => { T = Math.floor(W / COLS); P = T / 12; };
  sizes();
  const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
  const hsh = (a, b) => { let h = (a * 374761393 + b * 668265263) >>> 0; h = (h ^ (h >> 13)) * 1274126177 >>> 0; return (h ^ (h >> 16)) >>> 0; };
  let lanes, nextRow, safe, lastType, lastDir, me, hop, queue, cam, camMin, started, score, coinsGot, dead, parts, banner, seenBio, run = true, paused = true, last = 0, raf, frame = 0, bump = 0;

  // ---- generar carriles ----
  function diffAt(r) { return Math.min(1, r / 260); }
  function addLane(l) { lanes[l.r] = l; }
  function grass(r, start) {
    const bio = bioOf(r); const obs = new Set(); const d = diffAt(r);
    if (start) { [0, COLS - 1].forEach(c => obs.add(c)); if (r === 1 || r === 3) obs.add(r === 1 ? 1 : COLS - 2); }
    else { const n = Math.floor(rnd(1, 2.6 + d * 2)); for (let i = 0; i < n; i++) { const c = Math.floor(Math.random() * COLS); if (Math.abs(c - safe) > 0) obs.add(c); } if (obs.size >= COLS - 1) obs.clear(); }
    if (!start && Math.random() < .5) { const ns = Math.max(0, Math.min(COLS - 1, safe + pick([-1, 1]))); if (!obs.has(ns)) safe = ns; }
    obs.delete(safe);
    const kinds = {}; obs.forEach(c => kinds[c] = bio.obs[hsh(r, c) % bio.obs.length]);
    addLane({ r, type: 'grass', bio, obs, kinds, coin: !start && Math.random() < .2 ? freeCol(obs) : -1 });
  }
  const freeCol = obs => { const f = []; for (let c = 0; c < COLS; c++) if (!obs.has(c)) f.push(c); return f.length ? pick(f) : -1; };
  function road(r) {
    const bio = bioOf(r), d = diffAt(r); const dir = Math.random() < .5 ? 1 : -1; const sp = (0.026 + Math.random() * .028 + d * .034) * dir;
    const L = COLS + 8; const cars = []; let x = -4 + rnd(0, 2);
    while (x < COLS + 4 - 1) { const k = pick(bio.cars); const len = k === 'bus' ? 2.6 : k === 'van' || k === 'icecream' || k === 'taxi' ? 1.6 : 1.25; cars.push({ x, len, k, col: pick(bio.carCols) }); x += len + rnd(2.4, 5.6 - d * 1.6); }
    addLane({ r, type: 'road', bio, dir, sp, L, cars, coin: Math.random() < .14 ? Math.floor(Math.random() * COLS) : -1 });
  }
  function water(r) {
    const bio = bioOf(r), d = diffAt(r);
    if (lastType === 'water' && Math.random() < .28 && lanes[r - 1] && !lanes[r - 1].pads) {
      const pads = new Set([safe]); const n = Math.floor(rnd(2, 4)); for (let i = 0; i < n; i++) pads.add(Math.floor(Math.random() * COLS));
      addLane({ r, type: 'water', bio, pads, logs: [], sp: 0 }); return;
    }
    const dir = lastDir ? -lastDir : (Math.random() < .5 ? 1 : -1); lastDir = dir;
    const sp = (0.016 + Math.random() * .02 + d * .016) * dir; const L = COLS + 8; const logs = []; let x = -4 + rnd(0, 1.5);
    while (x < COLS + 4 - 1) { const len = Math.round(rnd(2, d > .5 ? 3.4 : 4.4)); logs.push({ x, len }); x += len + rnd(1.2, 2.6 + d); }
    addLane({ r, type: 'water', bio, dir, sp, L, logs });
  }
  function rail(r) { addLane({ r, type: 'rail', bio: bioOf(r), dir: Math.random() < .5 ? 1 : -1, st: 'idle', t: rnd(90, 320), train: null }); }
  function genUntil(top) {
    while (nextRow <= top) {
      const r = nextRow;
      if (r < 4) { grass(r, true); nextRow++; lastType = 'grass'; continue; }
      if (r % BIO_LEN < 2) { grass(r); nextRow++; lastType = 'grass'; continue; }
      const bio = bioOf(r), d = diffAt(r);
      if (lastType !== 'grass' && Math.random() < .5) { const n = Math.random() < .35 ? 2 : 1; for (let i = 0; i < n && nextRow % BIO_LEN >= 2; i++) grass(nextRow++); lastType = 'grass'; continue; }
      const tot = bio.w.road + bio.w.water + bio.w.rail; let x = Math.random() * tot;
      const type = (x -= bio.w.road) < 0 ? 'road' : (x -= bio.w.water) < 0 ? 'water' : 'rail';
      const n = type === 'road' ? 1 + Math.floor(Math.random() * (1.6 + d * 2.4)) : type === 'water' ? 1 + Math.floor(Math.random() * (1.5 + d * 1.5)) : (Math.random() < .2 + d * .2 ? 2 : 1);
      lastDir = 0;
      for (let i = 0; i < n; i++) { const rr = nextRow; if (rr % BIO_LEN < 2) break; ({ road, water, rail })[type](rr); lastType = type; nextRow++; }
    }
  }

  function reset() {
    lanes = {}; nextRow = 0; safe = 4; lastType = 'grass'; lastDir = 0;
    me = { r: 0, x: 4, face: 1, sq: 1 }; hop = null; queue = null; cam = 0; camMin = 0; started = false; score = 0; coinsGot = 0; dead = null; parts = []; banner = null; seenBio = 0;
    genUntil(30);
  }

  // ---- moverse ----
  const laneAt = r => lanes[r];
  function tryMove(dr, dc) {
    if (dead || paused) return;
    if (hop) { queue = [dr, dc]; return; }
    const cur = laneAt(me.r); const tr = me.r + dr; const tl = laneAt(tr); if (!tl) return;
    const onLog = cur && cur.type === 'water' && !cur.pads;
    let tx = dc ? (onLog ? me.x + dc : Math.round(me.x) + dc) : me.x;
    if (tl.type !== 'water' || tl.pads) tx = Math.round(tx);
    if (dc) me.face = dc;
    const c = Math.round(tx);
    if (c < 0 || c > COLS - 1 || (tl.type === 'grass' && tl.obs.has(c))) { bump = 8; gsfx('bonk'); return; }
    if (tr < cam - 3.2) return;
    hop = { fr: me.r, fx: me.x, tr, tx, t: 0 }; started = true; gsfx('jump');
    for (let i = 0; i < 4; i++) parts.push({ x: me.x + .5, r: me.r, oy: 0, vx: rnd(-.03, .03), vy: rnd(-.6, -.2), life: 18, col: 'rgba(255,255,255,.85)', s: rnd(2, 4) * P });
  }
  function land() {
    me.r = hop.tr; me.x = hop.tx; hop = null; me.sq = .78;
    const l = laneAt(me.r);
    if (me.r > score) { score = me.r; const b = Math.floor(score / BIO_LEN); if (b > seenBio) { seenBio = b; banner = { text: bioOf(score).name, t: 150 }; gsfx('gift'); } }
    if (l && l.type === 'water') { const on = rideOn(l); if (!on) return die('splash'); if (l.pads) me.x = Math.round(me.x); }
    if (l && l.coin >= 0 && Math.round(me.x) === l.coin && l.type !== 'water') { l.coin = -1; coinsGot++; gsfx('coin'); for (let i = 0; i < 8; i++) parts.push({ x: me.x + .5, r: me.r, oy: -T * .5, vx: rnd(-.06, .06), vy: rnd(-2.2, -.6), life: 26, col: pick(['#fff07a', '#ffd23f', '#ffffff']), s: rnd(2, 4) * P }); }
    if (queue) { const q = queue; queue = null; tryMove(q[0], q[1]); }
  }
  function rideOn(l) {
    if (l.pads) return l.pads.has(Math.round(me.x));
    const cx = me.x + .5; return l.logs.find(o => cx > o.x + .08 && cx < o.x + o.len - .08) || null;
  }
  function die(kind, extra) {
    if (dead) return; dead = Object.assign({ kind, t: 0 }, extra || {});
    if (kind === 'splash') { gsfx('water'); for (let i = 0; i < 14; i++) parts.push({ x: me.x + .5, r: me.r, oy: -T * .2, vx: rnd(-.07, .07), vy: rnd(-3, -1), life: 30, col: pick(['#ffffff', '#c4efff']), s: rnd(2, 5) * P, gr: .18 }); }
    else if (kind === 'car') { gsfx('bonk'); if (navigator.vibrate) navigator.vibrate(80); }
    else if (kind === 'train') { gsfx('crack'); if (navigator.vibrate) navigator.vibrate(120); }
    else gsfx('poof');
  }

  // ---- cada cuadro ----
  function step(dt) {
    frame += dt;
    Object.values(lanes).forEach(l => {
      if (l.type === 'road') l.cars.forEach(c => { c.x += l.sp * dt; if (l.sp > 0 && c.x > COLS + 4) c.x -= l.L; if (l.sp < 0 && c.x + c.len < -4) c.x += l.L; });
      if (l.type === 'water' && l.logs.length) l.logs.forEach(o => { o.x += l.sp * dt; if (l.sp > 0 && o.x > COLS + 4) o.x -= l.L; if (l.sp < 0 && o.x + o.len < -4) o.x += l.L; });
      if (l.type === 'rail') {
        l.t -= dt;
        if (l.st === 'idle' && l.t <= 0) { l.st = 'warn'; l.t = 80; }
        else if (l.st === 'warn') { if (Math.floor(l.t / 14) !== Math.floor((l.t + dt) / 14) && Math.abs(l.r - me.r) < 9) gsfx('tick'); if (l.t <= 0) { l.st = 'pass'; l.train = { x: l.dir > 0 ? -14 : COLS + 1, len: 13 }; } }
        else if (l.st === 'pass') { l.train.x += .5 * l.dir * dt; if ((l.dir > 0 && l.train.x > COLS + 2) || (l.dir < 0 && l.train.x + l.train.len < -2)) { l.st = 'idle'; l.t = rnd(170, 380); l.train = null; } }
      }
    });
    parts.forEach(p => { p.x += p.vx * dt; p.oy += p.vy * dt * P; p.vy += (p.gr || .12) * dt; p.life -= dt; }); parts = parts.filter(p => p.life > 0);
    if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
    if (bump > 0) bump -= dt; me.sq += (1 - me.sq) * Math.min(1, .25 * dt);
    if (dead) { dead.t += dt; if (dead.kind === 'eagle') dead.cy = (dead.cy || 0) + 0; if (dead.t > (dead.kind === 'eagle' ? 90 : 70)) over(); return; }
    if (hop) { hop.t += dt / 6.5; if (hop.t >= 1) land(); }
    if (dead) return;
    const l = laneAt(me.r);
    if (!hop && l && l.type === 'water' && !l.pads) { const o = rideOn(l); if (!o) return die('splash'); me.x += l.sp * dt; if (me.x < -.45 || me.x > COLS - .55) return die('splash'); }
    // choques (con el carril donde va el cuerpo en el aire)
    const vr = hop ? (hop.t < .5 ? hop.fr : hop.tr) : me.r, vx = hop ? hop.fx + (hop.tx - hop.fx) * hop.t : me.x;
    const vl = laneAt(vr);
    if (vl && vl.type === 'road') { const c = vl.cars.find(c => vx + .78 > c.x + .05 && vx + .22 < c.x + c.len - .05); if (c) { if (hop) { me.r = vr; me.x = vx; hop = null; } return die('car', { dir: vl.sp > 0 ? 1 : -1 }); } }
    if (vl && vl.type === 'rail' && vl.train) { const tn = vl.train; if (vx + .8 > tn.x && vx + .2 < tn.x + tn.len) { if (hop) { me.r = vr; me.x = vx; hop = null; } return die('train', { dir: vl.dir, vx: vl.dir * .35 }); } }
    // cámara: sigue a tu personaje y avanza solita después del primer salto
    const target = (hop ? hop.fr + (hop.tr - hop.fr) * hop.t : me.r);
    if (started) camMin += (0.0045 + Math.min(.012, score * .00005)) * dt;
    cam += (Math.max(target, camMin) - cam) * Math.min(1, .1 * dt); cam = Math.max(cam, camMin);
    if (!hop && me.r < cam - 2.95) die('eagle');
    genUntil(Math.ceil(cam + H / T + 4));
    Object.keys(lanes).forEach(k => { if (+k < cam - 8) delete lanes[k]; });
  }

  // ---- dibujo (todo pixelado, en cuadritos de P) ----
  const baseY = () => H - T * 3.4;
  const yOf = r => baseY() - (r - cam) * T;
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h)); };
  const U = (ox, oy) => (x, y, w, h, c) => R(ox + x * P, oy + y * P, w * P, h * P, c);
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = n >> 8 & 255, b = n & 255; const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))); return '#' + ((1 << 24) + (f(r) << 16) + (f(gg) << 8) + f(b)).toString(16).slice(1); };
  function ground(l, y) {
    const bio = l.bio;
    if (l.type === 'grass') {
      R(0, y, W, T, bio.grass[l.r & 1]);
      if (bio.tiles) { for (let c = 0; c <= COLS; c++) R(c * T - P * .5, y, P, T, bio.dots[0]); R(0, y + T / 2 - P * .5, W, P, bio.dots[0]); }
      else for (let c = 0; c < COLS; c++) { const h = hsh(l.r, c); if (h % 3 === 0) { const u = U(c * T, y); const dc = bio.dots[h % bio.dots.length]; const px = 2 + (h >> 3) % 7, py = 2 + (h >> 6) % 7; u(px, py, 1, 1, dc); u(px + 1, py - 1, 1, 1, dc); if (dc !== bio.dots[0]) u(px + 1, py, 1, 1, '#ffe27a'); else u(px + 2, py, 1, 1, dc); } }
      R(0, y + T - P * 1.5, W, P * 1.5, bio.side);
    } else if (l.type === 'road') {
      R(0, y, W, T, bio.road);
      const up = laneAt(l.r + 1), dn = laneAt(l.r - 1);
      if (up && up.type === 'road') { for (let x = 0; x < W; x += T) R(x + T * .2, y - P * .5, T * .5, P, bio.dash); } else R(0, y, W, P * 1.5, shade(bio.road, .25));
      if (!dn || dn.type !== 'road') R(0, y + T - P * 1.5, W, P * 1.5, bio.side2);
      for (let c = 0; c < COLS; c++) { const h = hsh(l.r, c * 7); if (h % 5 === 0) R(c * T + (h % 9) * P, y + (3 + (h >> 4) % 6) * P, P, P, shade(bio.road, -.12)); }
    } else if (l.type === 'water') {
      R(0, y, W, T, bio.water);
      for (let i = 0; i < 4; i++) { const sx = ((hsh(l.r, i) % 1000) / 1000 * W + frame * .35 * (l.sp >= 0 ? 1 : -1) * (i % 2 ? 1 : .6)) % (W + 40); R((sx + W + 40) % (W + 40) - 20, y + (2 + i * 2.4) * P, T * .55, P, bio.wave); }
      const up = laneAt(l.r + 1); if (!up || up.type !== 'water') R(0, y, W, P * 1.2, shade(bio.water, -.15));
    } else if (l.type === 'rail') {
      R(0, y, W, T, '#c9b9a6'); for (let x = 0; x < W; x += P * 3) R(x, y + T * .18 + ((x / P) % 2) * P, P, P, '#b3a18c');
      for (let x = 0; x < W; x += T * .5) R(x + P, y + P * 2.5, P * 3, T - P * 5, '#8a6a52');
      R(0, y + P * 3.5, W, P * 1.2, '#9aa0b4'); R(0, y + T - P * 4.7, W, P * 1.2, '#9aa0b4'); R(0, y + P * 3.5, W, P * .5, '#d9dde8'); R(0, y + T - P * 4.7, W, P * .5, '#d9dde8');
      R(0, y + T - P * 1.2, W, P * 1.2, '#a8937c');
    }
  }
  // árboles, postes y dulces (en una grilla de 12×12 por cuadro; pueden asomarse hacia arriba)
  const OBJ = {
    tree(u) { u(2, 10, 8, 2, 'rgba(0,0,0,.12)'); u(5, 7, 2, 4, '#a5714d'); u(3, -4, 6, 1, '#3f9a4f'); u(2, -3, 8, 9, '#4fae5a'); u(1, -1, 10, 5, '#4fae5a'); u(2, 5, 8, 2, '#3f9a4f'); u(3, -3, 3, 2, '#7fd07a'); u(2, -1, 2, 2, '#7fd07a'); u(8, 1, 1, 1, '#ff8fab'); u(4, 3, 1, 1, '#ff8fab'); },
    bush(u) { u(1, 10, 10, 2, 'rgba(0,0,0,.12)'); u(2, 4, 8, 6, '#58b860'); u(1, 5, 10, 4, '#58b860'); u(2, 4, 3, 2, '#86d67d'); u(3, 6, 1, 1, '#ff7aa2'); u(7, 5, 1, 1, '#ff7aa2'); u(5, 8, 1, 1, '#ff7aa2'); },
    rock(u) { u(2, 10, 8, 2, 'rgba(0,0,0,.12)'); u(3, 5, 6, 5, '#b9b3c3'); u(2, 6, 8, 4, '#b9b3c3'); u(3, 5, 3, 2, '#dcd7e3'); u(2, 9, 8, 1, '#958fa3'); },
    pine(u) { u(2, 10, 8, 2, 'rgba(0,0,0,.12)'); u(5, 8, 2, 3, '#8d6047'); u(1, 4, 10, 4, '#4f9a72'); u(2, 0, 8, 4, '#5aa97f'); u(3, -4, 6, 4, '#5aa97f'); u(4, -7, 4, 3, '#5aa97f'); u(5, -9, 2, 2, '#5aa97f'); u(4, -7, 4, 1, '#ffffff'); u(3, -4, 6, 1, '#ffffff'); u(2, 0, 8, 1, '#ffffff'); u(1, 4, 10, 1, '#ffffff'); u(5, -9, 2, 1, '#ffffff'); },
    snowman(u) { u(2, 10, 8, 2, 'rgba(0,0,0,.1)'); u(2, 4, 8, 7, '#ffffff'); u(3, 3, 6, 9, '#ffffff'); u(4, -2, 4, 5, '#ffffff'); u(3, -1, 6, 3, '#ffffff'); u(3, 2, 6, 1, '#ff7aa2'); u(7, 2, 1, 3, '#ff7aa2'); u(4, 0, 1, 1, '#3a3550'); u(7, 0, 1, 1, '#3a3550'); u(5, 1, 2, 1, '#ff9a3c'); u(5, 5, 1, 1, '#3a3550'); u(5, 8, 1, 1, '#3a3550'); u(3, 10, 6, 1, '#dbe6f7'); },
    lamp(u) { u(3, 10, 6, 2, 'rgba(0,0,0,.12)'); u(5, -6, 2, 17, '#6b6f8a'); u(4, 9, 4, 2, '#575b75'); u(3, -8, 6, 3, '#6b6f8a'); u(4, -6, 4, 2, '#fff2a8'); u(2, -5, 8, 1, 'rgba(255,240,160,.35)'); },
    bench(u) { u(1, 10, 10, 2, 'rgba(0,0,0,.12)'); u(1, 3, 10, 2, '#e89b6c'); u(1, 6, 10, 2, '#f2b384'); u(2, 8, 1, 3, '#6b6f8a'); u(9, 8, 1, 3, '#6b6f8a'); u(1, 3, 10, 1, '#f7c9a4'); },
    planter(u) { u(1, 10, 10, 2, 'rgba(0,0,0,.12)'); u(2, 6, 8, 5, '#d98aa3'); u(2, 6, 8, 1, '#efb3c5'); u(2, 2, 8, 4, '#5fb867'); u(3, 1, 1, 1, '#fff07a'); u(6, 2, 1, 1, '#ffffff'); u(8, 1, 1, 1, '#ff7aa2'); u(4, 3, 1, 1, '#ff7aa2'); },
    hydrant(u) { u(3, 10, 6, 2, 'rgba(0,0,0,.12)'); u(4, 2, 4, 9, '#ff6f8f'); u(3, 5, 6, 2, '#ff6f8f'); u(4, 1, 4, 1, '#e04f72'); u(5, 0, 2, 1, '#e04f72'); u(4, 2, 1, 7, '#ff9fb4'); },
    palm(u) { u(2, 10, 8, 2, 'rgba(0,0,0,.12)'); u(5, 0, 2, 11, '#c9955f'); u(5, 3, 2, 1, '#a8774a'); u(5, 6, 2, 1, '#a8774a'); u(1, -3, 10, 2, '#4fb36a'); u(0, -2, 2, 3, '#4fb36a'); u(10, -2, 2, 3, '#4fb36a'); u(3, -5, 6, 2, '#5fc77b'); u(4, -1, 2, 2, '#8a5a3a'); u(6, -1, 2, 2, '#8a5a3a'); },
    umbrella(u) { u(1, 10, 10, 2, 'rgba(0,0,0,.1)'); u(6, -1, 1, 12, '#ffffff'); u(1, -3, 10, 2, '#ff8fab'); u(3, -4, 6, 1, '#ff8fab'); u(3, -3, 2, 2, '#ffffff'); u(7, -3, 2, 2, '#ffffff'); u(0, -1, 12, 1, '#ff8fab'); },
    castle(u) { u(1, 10, 10, 2, 'rgba(0,0,0,.1)'); u(2, 4, 8, 7, '#e8cf88'); u(2, 2, 2, 2, '#e8cf88'); u(5, 1, 2, 3, '#e8cf88'); u(8, 2, 2, 2, '#e8cf88'); u(5, 7, 2, 4, '#c9ad66'); u(6, -2, 1, 3, '#a8774a'); u(7, -2, 2, 1, '#ff7aa2'); u(2, 4, 8, 1, '#f5e2a8'); },
    lolly(u) { u(3, 10, 6, 2, 'rgba(0,0,0,.1)'); u(6, 4, 1, 7, '#ffffff'); u(5, 4, 1, 7, '#e8dde3'); u(2, -3, 8, 6, '#ff7fae'); u(3, -4, 6, 8, '#ff7fae'); u(4, -4, 3, 1, '#ffffff'); u(7, -3, 1, 2, '#ffffff'); u(4, -1, 4, 1, '#ffffff'); u(3, -3, 1, 2, '#ffffff'); u(5, -2, 1, 1, '#ffffff'); u(2, 2, 8, 1, '#e0558d'); u(3, 3, 6, 1, '#e0558d'); },
    cupcake(u) { u(2, 10, 8, 2, 'rgba(0,0,0,.1)'); u(3, 6, 6, 5, '#9fd6ff'); u(4, 6, 1, 5, '#c8e8ff'); u(7, 6, 1, 5, '#c8e8ff'); u(2, 2, 8, 4, '#fff6fb'); u(3, 1, 6, 1, '#fff6fb'); u(5, -1, 2, 2, '#ff4f7f'); u(3, 3, 1, 1, '#ff7fae'); u(7, 2, 1, 1, '#fff07a'); u(5, 4, 1, 1, '#9fe0ff'); },
    cane(u) { u(3, 10, 6, 2, 'rgba(0,0,0,.1)'); u(6, -2, 2, 13, '#ffffff'); u(3, -4, 5, 2, '#ffffff'); u(3, -2, 2, 2, '#ffffff'); u(6, 0, 2, 1, '#ff4f7f'); u(6, 3, 2, 1, '#ff4f7f'); u(6, 6, 2, 1, '#ff4f7f'); u(6, 9, 2, 1, '#ff4f7f'); u(4, -4, 1, 2, '#ff4f7f'); u(3, -2, 1, 1, '#ff4f7f'); }
  };
  function vehicle(x, y, len, k, col, dir) {
    const w = len * T; const u = (a, b, cw, chh, c) => { const xx = dir > 0 ? a : w / P - a - cw; R(x + xx * P, y + b * P, cw * P, chh * P, c); };
    const wl = w / P; const dark = shade(col, -.22), lite = shade(col, .35);
    u(1, 10, wl - 2, 2, 'rgba(0,0,0,.16)');
    if (k === 'bus') {
      u(1, 1, wl - 2, 9, col); u(1, 1, wl - 2, 1, lite); u(1, 8, wl - 2, 2, dark);
      for (let i = 3; i < wl - 6; i += 4) u(i, 3, 3, 3, '#e6f6ff'); u(wl - 5, 2, 3, 5, '#e6f6ff'); u(wl - 2, 7, 1, 1, '#fff2a8');
      u(4, 9, 3, 3, '#4a4050'); u(wl - 7, 9, 3, 3, '#4a4050');
    } else if (k === 'icecream') {
      u(1, 2, wl - 2, 8, col); u(1, 2, wl - 2, 1, lite); u(1, 8, wl - 2, 2, dark); u(wl - 6, 3, 4, 3, '#e6f6ff');
      u(3, 3, 6, 4, '#ffffff'); u(4, 4, 4, 2, '#ff9fc2'); u(wl / 2 - 1, -2, 2, 4, '#e8b07a'); u(wl / 2 - 2, -4, 4, 2, '#ff9fc2'); u(wl / 2 - 1, -5, 2, 1, '#ff4f7f');
      u(3, 9, 3, 3, '#4a4050'); u(wl - 6, 9, 3, 3, '#4a4050'); u(wl - 2, 7, 1, 1, '#fff2a8');
    } else {
      const taxi = k === 'taxi', van = k === 'van'; const body = taxi ? '#ffd23f' : col;
      u(1, 4, wl - 2, 6, body); u(1, 8, wl - 2, 2, shade(body, -.22)); u(1, 4, wl - 2, 1, shade(body, .35));
      const rx = van ? 2 : Math.round(wl * .22), rw = van ? wl - 6 : Math.round(wl * .5);
      u(rx, 0, rw, 4, body); u(rx + 1, 1, rw - 2, 3, '#e6f6ff'); u(rx + Math.round(rw / 2), 1, 1, 3, body); u(rx, 0, rw, 1, shade(body, .35));
      if (taxi) { u(rx + Math.round(rw / 2) - 2, -2, 4, 2, '#ffffff'); u(rx + Math.round(rw / 2) - 1, -1, 2, 1, '#ff7aa2'); }
      u(3, 9, 3, 3, '#4a4050'); u(wl - 6, 9, 3, 3, '#4a4050'); u(4, 10, 1, 1, '#9a92a4'); u(wl - 5, 10, 1, 1, '#9a92a4'); u(wl - 2, 6, 1, 2, '#fff2a8'); u(1, 6, 1, 2, '#ff6f8f');
    }
  }
  function floater(x, y, len, kind, l) {
    const w = len * T; const u = (a, b, cw, chh, c) => R(x + a * P, y + b * P, cw * P, chh * P, c); const wl = w / P;
    if (kind === 'log') { u(0, 3, wl, 7, '#b07a4f'); u(0, 3, wl, 1, '#cf9a6b'); u(0, 9, wl, 1, '#8a5a3a'); for (let i = 4; i < wl - 3; i += 7) u(i, 5, 3, 1, '#9a6842'); u(0, 3, 2, 7, '#e3b98a'); u(wl - 2, 3, 2, 7, '#e3b98a'); u(0.5, 5.5, 1, 2, '#c99a6b'); }
    else if (kind === 'boat') { u(1, 4, wl - 2, 6, '#ffffff'); u(0, 4, wl, 1, '#ffffff'); u(1, 7, wl - 2, 1, '#ff8fab'); u(2, 9, wl - 4, 1, '#d8e8f2'); u(3, 1, wl - 6, 3, '#9fd6ff'); }
    else if (kind === 'surf') { const cols = ['#ff8fab', '#7fe0d0', '#ffd36e']; for (let i = 0; i < len; i++) { const bx = i * 12; u(bx + 1, 4, 10, 5, cols[(i + l.r) % 3]); u(bx, 5, 12, 3, cols[(i + l.r) % 3]); u(bx + 2, 6, 8, 1, '#ffffff'); } }
    else if (kind === 'ice') { u(0, 3, wl, 7, '#ffffff'); u(1, 2, wl - 3, 1, '#ffffff'); u(0, 9, wl, 1, '#cfe8f7'); for (let i = 3; i < wl - 2; i += 9) u(i, 5, 3, 1, '#e3f3fc'); }
    else if (kind === 'wafer') { u(0, 3, wl, 7, '#f2c27a'); u(0, 3, wl, 1, '#f8d99f'); u(0, 9, wl, 1, '#c99450'); for (let i = 2; i < wl - 1; i += 4) u(i, 4, 1, 5, '#d9a55f'); u(0, 5, wl, 1, '#d9a55f'); u(0, 7, wl, 1, '#d9a55f'); u(wl - 3, 2, 2, 2, '#ff7fae'); }
  }
  function padDraw(x, y, kind) {
    const u = (a, b, cw, chh, c) => R(x + a * P, y + b * P, cw * P, chh * P, c);
    if (kind === 'lily') { u(2, 4, 8, 6, '#5fbf6a'); u(1, 5, 10, 4, '#5fbf6a'); u(6, 4, 2, 2, '#4aa556'); u(2, 4, 4, 1, '#86d67d'); u(7, 6, 2, 2, '#ffb3c7'); u(7.5, 6.5, 1, 1, '#fff07a'); }
    else if (kind === 'buoy') { u(2, 4, 8, 6, '#ff6f8f'); u(1, 5, 10, 4, '#ff6f8f'); u(4, 5, 4, 4, '#ffffff'); u(5, 6, 2, 2, '#9fd6ff'); u(2, 4, 2, 6, '#ffffff'); u(8, 4, 2, 6, '#ffffff'); }
    else if (kind === 'ice1') { u(1, 4, 10, 6, '#ffffff'); u(2, 3, 7, 1, '#ffffff'); u(1, 9, 10, 1, '#cfe8f7'); }
    else if (kind === 'macaron') { u(2, 3, 8, 3, '#b9f0a8'); u(1, 4, 10, 2, '#b9f0a8'); u(1, 6, 10, 1, '#fff6ea'); u(2, 7, 8, 3, '#b9f0a8'); u(1, 7, 10, 2, '#b9f0a8'); u(3, 3, 3, 1, '#ddf8d2'); }
  }
  function train(x, y, len, dir, cols) {
    const u = (a, b, cw, chh, c) => { const w = len * 12; const xx = dir > 0 ? a : w - a - cw; R(x + xx * P, y + b * P, cw * P, chh * P, c); };
    const w = len * 12; u(0, 11, w, 1, 'rgba(0,0,0,.18)');
    for (let i = 0; i < len; i += 3.2) { const cx = i * 12; const head = i + 3.2 >= len; const c = head ? cols[0] : (Math.floor(i / 3.2) % 2 ? cols[0] : shade(cols[0], .25));
      u(cx + 1, -1, 37, 11, c); u(cx + 1, -1, 37, 1, shade(c, .35)); u(cx + 1, 8, 37, 2, shade(c, -.25)); u(cx + 1, 4, 37, 1, cols[1]);
      for (let j = 4; j < 34; j += 7) u(cx + j, 1, 4, 3, '#e6f6ff');
      if (head) { u(cx + 34, 0, 4, 5, '#e6f6ff'); u(cx + 37, 6, 1, 2, '#fff2a8'); }
      u(cx + 4, 9, 3, 3, '#4a4050'); u(cx + 30, 9, 3, 3, '#4a4050'); }
  }
  function drawPlayer(y) {
    let x = me.x, r = me.r, air = 0, sx = 1, sy = me.sq;
    if (hop) { x = hop.fx + (hop.tx - hop.fx) * hop.t; air = Math.sin(Math.PI * hop.t) * T * .5; sy = 1 + Math.sin(Math.PI * hop.t) * .12; sx = 1 / sy; }
    if (bump > 0) x += Math.sin(bump * 2) * .06;
    const ih = I.me.height || 1, iw = I.me.width || 1; const k = Math.min(T * .92 / iw, T * 1.02 / ih); let dw = iw * k, dh = ih * k;
    const cx = x * T + T / 2, by = y + T - P * 1.5;
    if (dead && dead.kind === 'splash') return;
    if (dead && dead.kind === 'car') { sy = .28; sx = 1.35; }
    let ex = 0, ey = 0, rot = 0;
    if (dead && dead.kind === 'train') { ex = dead.t * dead.vx * T * .9; ey = -Math.sin(Math.min(1, dead.t / 40) * Math.PI) * T * 1.6; rot = dead.t * .25 * dead.dir; }
    if (dead && dead.kind === 'eagle') { const tt = Math.max(0, dead.t - 30); ey = -tt * tt * .05 * P; }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(cx, by - P, T * .32 * (1 - air / T * .6), P * 2, 0, 0, 7); g.fill();
    g.save(); g.translate(cx + ex, by - air + ey); g.rotate(rot); g.scale(me.face * sx, sy); g.drawImage(I.me, -dw / 2, -dh, dw, dh); g.restore();
  }
  function draw() {
    sizes();
    const top = Math.floor(cam - 4), bot = Math.ceil(cam + H / T + 2);
    g.fillStyle = bioOf(Math.round(cam)).grass[0]; g.fillRect(0, 0, W, H);
    for (let r = bot; r >= top; r--) { const l = laneAt(r); if (l) ground(l, yOf(r)); }
    for (let r = bot; r >= top; r--) {
      const l = laneAt(r); if (!l) continue; const y = yOf(r);
      if (l.type === 'water') { if (l.pads) l.pads.forEach(c => padDraw(c * T, y, l.bio.pad)); else l.logs.forEach(o => floater(o.x * T, y, o.len, l.bio.float, l)); }
      if (l.coin >= 0) g.drawImage(I.coin, l.coin * T + T * .2, y + T * .08 + Math.sin(frame / 12 + l.r) * P * 1.5, T * .6, T * .6);
      const pr = dead || !hop ? me.r : (hop.t < .5 ? hop.fr : hop.tr);
      const playerHere = pr === r;
      if (l.type === 'grass') l.obs.forEach(c => { if (c >= 0 && c < COLS) OBJ[l.kinds[c]](U(c * T, y)); });
      if (playerHere && l.type !== 'road') drawPlayer(y);
      if (l.type === 'road') { if (playerHere && dead && dead.kind === 'car') drawPlayer(y); l.cars.forEach(c => vehicle(c.x * T, y, c.len, c.k, c.col, l.sp > 0 ? 1 : -1)); if (playerHere && !(dead && dead.kind === 'car')) drawPlayer(y); }
      if (l.type === 'rail') {
        const blink = l.st === 'warn' && Math.floor(frame / 8) % 2; const u = U(P * 2, y - T * .35); u(1, 0, 1, 12, '#6b6f8a'); u(0, -1, 3, 3, '#3a3550'); u(.5, -.5, 2, 2, blink ? '#ff4f6f' : '#7a5a6a');
        if (l.train) train(l.train.x * T, y, l.train.len, l.dir, l.bio.train);
      }
    }
    if (dead && dead.kind === 'splash') { const y = yOf(me.r) + T * .55, cx = me.x * T + T / 2; g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = P; [0, 12, 24].forEach(o => { const tt = dead.t - o; if (tt > 0 && tt < 40) { g.globalAlpha = 1 - tt / 40; g.beginPath(); g.ellipse(cx, y, tt * P * .5, tt * P * .2, 0, 0, 7); g.stroke(); } }); g.globalAlpha = 1; }
    if (dead && dead.kind === 'eagle') { const tt = dead.t; const cy = yOf(me.r) - T * 3 + Math.min(1, tt / 30) * T * 2.4 - Math.max(0, tt - 30) * Math.max(0, tt - 30) * .05 * P; g.drawImage(I.cloud, me.x * T + T / 2 - T, cy, T * 2, T * 1.3); }
    parts.forEach(p => { const y = yOf(p.r) + T * .7 + p.oy; R(p.x * T - p.s / 2, y, p.s, p.s, p.col); });
    // aviso cuando la nubecita te alcanza
    if (!dead && started && me.r < cam - 1.9) { g.globalAlpha = .35 + .25 * Math.sin(frame / 5); g.fillStyle = '#ffffff'; g.fillRect(0, H - T * .8, W, T * .8); g.globalAlpha = 1; }
    if (banner) { const a = Math.min(1, banner.t / 20, (150 - banner.t) / 15); g.globalAlpha = Math.max(0, a); const tw = Math.max(150, banner.text.length * 13 + 40); const bx = W / 2 - tw / 2, by = 70; R(bx, by, tw, 40, '#8a4d4f'); R(bx + 3, by + 3, tw - 6, 34, '#fff6ea'); R(bx + 3, by + 3, tw - 6, 4, '#ffffff'); g.fillStyle = '#8a4d4f'; g.font = "600 18px 'Pixelify Sans', Fredoka, sans-serif"; g.textAlign = 'center'; g.fillText(banner.text, W / 2, by + 27); g.globalAlpha = 1; }
    $('#gmA', sh.ov).textContent = score; $('#gmB', sh.ov).innerHTML = `${ST(14)} ${coinsGot}`;
  }
  function loop(t) { if (!run) return; const dt = Math.min(2.2, last ? (t - last) / 16.67 : 1); last = t; if (!paused) step(dt); if (run) draw(); raf = requestAnimationFrame(loop); }
  function over() {
    if (!run) return; A.gameMusic.stop(); run = false; cancelAnimationFrame(raf);
    const gm = GM(); const rec = score > (gm.best.calle || 0); if (rec) gm.best.calle = score; gsfx(rec ? 'record' : 'over');
    const want = coinsGot + Math.floor(score / 8); const earned = payGame(want); A.petAddXp && A.petAddXp(10, 'game'); A.saveSettings();
    const why = { car: '¡Ay, un carrito!', splash: '¡Splash! Al agua', train: '¡Cuidado con el tren!', eagle: 'Te llevó la nubecita' }[dead ? dead.kind : ''] || '¡Buen viaje!';
    endCard(sh, rec ? '¡NUEVO RÉCORD!' : why.toUpperCase(), `<img class="pixel" alt="" src="${spr(ch.sprite, 5)}" style="height:64px;width:auto;margin:0 auto">${rec ? `<div class="faint">${esc(why)}</div>` : ''}<div class="gm-big">${score} pasos</div><div class="row" style="justify-content:center;gap:6px;font-weight:800">${ST(18)} +${earned} estrellitas</div>${earned < want ? '<div class="faint">Ya llegaste al tope de estrellitas de juegos por hoy.</div>' : '<div class="faint">Úsalas en la tienda de tus mascotitas.</div>'}<div class="faint">Récord: ${gm.best.calle || 0} pasos</div>`, () => calleGame({ quick: true }));
  }

  // ---- controles: tocar = saltar adelante · deslizar = a los lados o atrás ----
  let p0 = null;
  sh.cv.addEventListener('pointerdown', e => { p0 = { x: e.clientX, y: e.clientY }; });
  sh.cv.addEventListener('pointerup', e => {
    if (!p0) return; const dx = e.clientX - p0.x, dy = e.clientY - p0.y; p0 = null;
    if (Math.abs(dx) < 26 && Math.abs(dy) < 26) return tryMove(1, 0);
    if (Math.abs(dx) > Math.abs(dy)) tryMove(0, dx > 0 ? 1 : -1); else tryMove(dy < 0 ? 1 : -1, 0);
  });
  const kd = e => { const m = { ArrowUp: [1, 0], w: [1, 0], ' ': [1, 0], ArrowDown: [-1, 0], s: [-1, 0], ArrowLeft: [0, -1], a: [0, -1], ArrowRight: [0, 1], d: [0, 1] }[e.key]; if (m) { e.preventDefault(); tryMove(m[0], m[1]); } if (e.key === 'Escape') sh.close(); };
  addEventListener('keydown', kd);
  const pauseBtn = $('.gm-pause', sh.ov);
  pauseBtn.onclick = () => { if (dead || !run) return; paused = !paused; gsfx('tick'); paused ? A.gameMusic.pause() : A.gameMusic.resume(); const m = $('.gm-msg', sh.ov); if (paused) { m.hidden = false; m.innerHTML = `<div class="gm-end"><div class="gm-k">PAUSA</div><div class="row" style="gap:8px;margin-top:10px"><button class="btn" data-x="out" style="flex:1;justify-content:center">Salir</button><button class="btn pink" data-x="go" style="flex:1;justify-content:center">Seguir</button></div></div>`; m.onclick = e => { const b = e.target.closest('[data-x]'); if (!b) return; if (b.dataset.x === 'out') sh.close(); else { paused = false; m.hidden = true; A.gameMusic.resume(); } }; } };
  sh.close = () => { A.gameMusic.stop(); run = false; cancelAnimationFrame(raf); removeEventListener('keydown', kd); sh.ov.remove(); document.body.classList.remove('gaming'); if (S.route === 'juegos' || S.route === 'rincon') A.render(); };
  addEventListener('resize', () => { if (!run) return; const r = sh.fit(); W = r.w; H = r.h; }, { once: true });
  sh.ov.__st = () => ({ me, lanes, cam, hop, dead, score, coinsGot, T, tryMove, set: v => Object.assign(me, v), unpause: () => { paused = false; } });
  reset();
  const go = () => { const m = $('.gm-msg', sh.ov); m.hidden = true; paused = false; gsfx('start'); A.gameMusic.start('calle'); };
  if (opts.quick) go(); else menu(sh, go, () => sh.close(), () => { sh.close(); calleGame(); });
  raf = requestAnimationFrame(loop);
}

// ---------------- Menú del juego: personaje, colección y máquina gacha ----------------
function menu(sh, play, quit, reload) {
  const m = $('.gm-msg', sh.ov); m.hidden = false; let view = 'home', spin = null;
  const best = GM().best.calle || 0;
  const charImg = (c, h, cls) => `<img class="pixel ${cls || ''}" alt="" src="${spr(c.sprite, 6)}" style="height:${h}px;width:auto">`;
  const pool = () => allChars().filter(c => c.how === 'gacha');
  function render() {
    const cs = CS(); const cur = A.calleChar(); const all = [PET_CHAR()].concat(allChars()); const own = ownedChars();
    if (view === 'home') m.innerHTML = `<div class="gm-end cl-menu"><div class="gm-k">CRUZAR LA CALLE</div>
<div class="cl-hero"><div class="cl-road"></div>${charImg(cur, 76, 'cl-hop')}<span class="cl-name">${esc(cur.name)}</span></div>
<div class="row" style="gap:8px"><button class="btn cl-pix" data-x="chars" style="flex:1;justify-content:center">Personajes <b>${own.length}/${all.length}</b></button><button class="btn cl-pix gold" data-x="gacha" style="flex:1;justify-content:center">Máquina</button></div>
<div class="faint">Toca para saltar hacia adelante. Desliza a los lados o hacia atrás. ¡No te quedes quieta, que la nubecita te alcanza!</div>
<button class="btn pink cl-pix big" data-x="go" style="justify-content:center;width:100%">¡A cruzar!</button>
<div class="row" style="justify-content:space-between"><button class="cl-link" data-x="out">Salir</button><span class="cl-best">Récord · ${best} pasos</span></div></div>`;
    if (view === 'chars') m.innerHTML = `<div class="gm-end cl-menu"><div class="gm-k">PERSONAJES</div><div class="cl-grid">${all.map(c => { const has = c.id === 'pet' || cs.owned.includes(c.id); const rr = RARE[c.rare] || RARE[1];
      return `<button class="cl-ch ${cs.sel === c.id ? 'on' : ''} ${has ? '' : 'locked'}" data-ch="${c.id}" style="--rc:${rr[1]}">${charImg(c, 44)}<b>${has ? esc(c.name) : '???'}</b><span>${c.id === 'pet' ? 'Tu mascota' : has ? rr[0] : c.how === 'stars' ? `${ST(11)} ${c.price}` : c.how === 'gacha' ? 'En la máquina' : rr[0]}</span></button>`; }).join('')}</div>
<div class="faint" data-msg></div><button class="btn cl-pix" data-x="home" style="justify-content:center">Listo</button></div>`;
    if (view === 'gacha') {
      const P2 = pool(); const left = P2.filter(c => !cs.owned.includes(c.id)).length;
      m.innerHTML = `<div class="gm-end cl-menu"><div class="gm-k">MÁQUINA DE PERSONAJES</div><div class="row" style="justify-content:center">${K.starsPill()}</div>
${spin && spin.open ? '' : `<div class="cl-machine ${spin ? 'spin' : ''}"><img class="pixel cl-mach" alt="" src="${machineArt()}"><img class="pixel cl-knob" alt="" src="${knobArt()}">${spin && spin.cap ? `<button class="cl-cap" data-x="open" style="--c1:${RARE[spin.c.rare][1]}" aria-label="Abrir cápsula"><i></i><i></i></button>` : ''}</div>`}
${spin && spin.open ? `<div class="cl-reveal" style="--rc:${RARE[spin.c.rare][1]}"><div class="cl-rays"></div>${charImg(spin.c, 84, 'cl-pop')}<b>${esc(spin.c.name)}</b><span class="cl-rare">${RARE[spin.c.rare][0]}</span>${spin.dup ? `<div class="faint">Ya lo tenías: te devolvemos ${ST(12)} ${DUP_BACK}</div>` : '<div class="faint">¡Nuevo personaje!</div>'}</div>
<div class="row" style="gap:8px"><button class="btn cl-pix" data-x="use" style="flex:1;justify-content:center">Jugar con ${esc(spin.c.name)}</button><button class="btn cl-pix gold" data-x="again" style="flex:1;justify-content:center">Otra vez</button></div>`
  : spin ? `<div class="faint">${spin.cap ? '¡Toca la cápsula para abrirla!' : 'Girando…'}</div>` : `<button class="btn pink cl-pix big" data-x="spin" style="justify-content:center;width:100%" ${P2.length ? '' : 'disabled'}>Girar · ${ST(14)} ${GACHA_PRICE}</button><div class="faint" data-msg>${P2.length ? (left ? `Te faltan ${left} de ${P2.length} personajes de la máquina.` : 'Ya tienes todos. Los repetidos te devuelven estrellitas.') : 'Pronto habrá personajes aquí.'}</div>`}
<div class="cl-odds">${[1, 2, 3].map(r => `<span style="--rc:${RARE[r][1]}">${RARE[r][0]}</span>`).join('')}</div>
<button class="btn" data-x="home" style="justify-content:center" ${spin && !spin.open ? 'disabled' : ''}>Volver</button></div>`;
    }
  }
  function doSpin() {
    const P2 = pool(); if (!P2.length) return; const msg = $('[data-msg]', m);
    if (K.bal() < GACHA_PRICE) { if (msg) msg.innerHTML = `<b style="color:#c44a72">Te faltan ${GACHA_PRICE - K.bal()} estrellitas. ¡Juega un poquito más!</b>`; gsfx('bonk'); return; }
    if (!A.spendStars(GACHA_PRICE)) return;
    const W8 = { 1: 62, 2: 30, 3: 8 }; const have = [1, 2, 3].filter(r => P2.some(c => c.rare === r)); const tot = have.reduce((s, r) => s + W8[r], 0); let x = Math.random() * tot; let rr = have[0]; for (const r of have) { if ((x -= W8[r]) < 0) { rr = r; break; } }
    const c = (L => L[Math.floor(Math.random() * L.length)])(P2.filter(c => c.rare === rr));
    const cs = CS(); const dup = cs.owned.includes(c.id); if (!dup) cs.owned.push(c.id); else A.giveStars(DUP_BACK); A.saveSettings();
    spin = { c, dup, cap: false, open: false }; gsfx('swoosh'); render();
    setTimeout(() => { if (!spin) return; spin.cap = true; gsfx('place'); render(); }, 1250);
  }
  m.onclick = e => {
    const ch = e.target.closest('[data-ch]');
    if (ch) { const cs = CS(), id = ch.dataset.ch, c = findChar(id); if (!c) return;
      if (id === 'pet' || cs.owned.includes(id)) { cs.sel = id; A.saveSettings(); gsfx('pop'); render(); return; }
      const msg = $('[data-msg]', m);
      if (c.how === 'stars') { if (!ch.dataset.sure) { ch.dataset.sure = 1; ch.querySelector('span').textContent = `¿Comprar por ${c.price}?`; return; } if (K.bal() < c.price) { if (msg) msg.textContent = `Te faltan ${c.price - K.bal()} estrellitas.`; return; } if (!A.spendStars(c.price)) return; cs.owned.push(id); cs.sel = id; A.saveSettings(); gsfx('adopt'); render(); return; }
      if (msg) msg.textContent = c.how === 'gacha' ? 'Este sale en la máquina. ¡Prueba tu suerte!' : 'Todavía no lo tienes.'; gsfx('nope'); return; }
    const b = e.target.closest('[data-x]'); if (!b) return; const x = b.dataset.x;
    if (x === 'go') return play();
    if (x === 'out') return quit();
    if (x === 'chars' || x === 'gacha' || x === 'home') { view = x; spin = null; gsfx('tick'); render(); return; }
    if (x === 'spin') return doSpin();
    if (x === 'open' && spin) { spin.open = true; spin.cap = false; gsfx(spin.dup ? 'catch' : 'adopt'); render(); return; }
    if (x === 'again') { spin = null; render(); setTimeout(doSpin, 60); return; }
    if (x === 'use' && spin) { const cs = CS(); cs.sel = spin.c.id; A.saveSettings(); reload(); }
  };
  render();
}

// la máquina dibujada en pixel (se genera una vez)
let machURL = null, knobURL = null;
function paintURL(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); fn((a, b, cw, chh, col) => { x.fillStyle = col; x.fillRect(a, b, cw, chh); }); return c.toDataURL(); }
function machineArt() {
  return machURL || (machURL = paintURL(36, 50, R => {
    const K2 = '#8a4d4f';
    // cúpula de vidrio con cápsulas
    R(8, 1, 20, 1, K2); R(5, 2, 3, 1, K2); R(28, 2, 3, 1, K2); R(4, 3, 1, 2, K2); R(31, 3, 1, 2, K2); R(3, 5, 1, 15, K2); R(32, 5, 1, 15, K2);
    R(8, 2, 20, 1, '#e6f6ff'); R(5, 3, 26, 2, '#e6f6ff'); R(4, 5, 28, 15, '#d8f0ff');
    const caps = [[6, 14, '#ff9fd0'], [11, 15, '#8ec5ff'], [16, 13, '#fff07a'], [21, 15, '#8fd59a'], [26, 14, '#ff9fd0'], [8, 10, '#8fd59a'], [13, 9, '#ff9fd0'], [19, 9, '#8ec5ff'], [24, 10, '#fff07a'], [10, 5, '#8ec5ff'], [16, 5, '#ff9fd0'], [22, 5, '#8fd59a']];
    caps.forEach(([cx, cy, c]) => { R(cx, cy, 4, 4, c); R(cx, cy + 2, 4, 2, '#ffffff'); R(cx, cy, 1, 1, '#d8f0ff'); R(cx + 3, cy, 1, 1, '#d8f0ff'); R(cx, cy + 3, 1, 1, '#d8f0ff'); R(cx + 3, cy + 3, 1, 1, '#d8f0ff'); });
    R(6, 4, 2, 6, '#ffffff'); R(6, 11, 1, 2, '#ffffff');
    // cuerpo
    R(2, 20, 32, 2, K2); R(2, 22, 1, 26, K2); R(33, 22, 1, 26, K2); R(2, 48, 32, 2, K2);
    R(3, 22, 30, 26, '#f27ea1'); R(3, 22, 30, 2, '#ffb3cc'); R(3, 44, 30, 4, '#d9608a');
    R(6, 25, 24, 7, '#fff6ea'); R(6, 25, 24, 1, '#ffffff'); R(7, 27, 2, 3, '#ff9fd0'); R(11, 27, 2, 3, '#8ec5ff'); R(15, 27, 2, 3, '#fff07a'); R(19, 27, 2, 3, '#8fd59a'); R(23, 27, 2, 3, '#ff9fd0'); R(27, 27, 2, 3, '#8ec5ff');
    // salida de la cápsula
    R(22, 35, 9, 8, K2); R(23, 36, 7, 6, '#4a2f3a'); R(23, 36, 7, 1, '#6b4352');
    // lugar de la perilla
    R(5, 34, 12, 12, '#d9608a'); R(6, 35, 10, 10, '#e96f98');
  }));
}
function knobArt() {
  return knobURL || (knobURL = paintURL(12, 12, R => { const K2 = '#8a4d4f'; R(3, 0, 6, 1, K2); R(1, 1, 2, 1, K2); R(9, 1, 2, 1, K2); R(0, 3, 1, 6, K2); R(11, 3, 1, 6, K2); R(1, 10, 2, 1, K2); R(9, 10, 2, 1, K2); R(3, 11, 6, 1, K2); R(1, 2, 1, 1, K2); R(10, 2, 1, 1, K2); R(1, 9, 1, 1, K2); R(10, 9, 1, 1, K2);
    R(3, 1, 6, 10, '#ffffff'); R(1, 3, 10, 6, '#ffffff'); R(2, 2, 8, 8, '#ffffff'); R(5, 2, 2, 8, '#ffd23f'); R(2, 5, 8, 2, '#ffd23f'); R(5, 5, 2, 2, '#f2a93b'); }));
}

// ---------------- En la sección de juegos ----------------
ACT.gmPlay = (prev => a => a.dataset.g === 'calle' ? calleGame() : prev(a))(ACT.gmPlay);
A.calleGame = calleGame;
A.calleCardArt = () => { const c = A.calleChar(); return `<div class="gm-art cl-art"><span class="cl-art-road"></span><span class="cl-art-car"></span><img class="pixel gm-bounce" alt="" src="${spr(c.sprite, 4)}" style="height:46px;width:auto;position:absolute;left:50%;transform:translateX(-50%);bottom:30px"></div>`; };
})();
