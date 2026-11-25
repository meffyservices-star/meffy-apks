// ===== Bolsillito · Juego "Cafecito": atiende a tus amistades-mascota cocinando hotcakes, té de burbujas, helados y cupcakes =====
(function () {
const A = App, S = A.S, { $, esc, toast } = A;
const ACT = A.ACTIONS;
const K = A.gameKit; if (!K) return;
const { gameShell, loadImgs, GM, spr, img, activePet, petSprite, endCard, payGame } = K;
const gsfx = n => K.gsfx(n);
const D = (name, w, h, fn) => Pix.define(name, { w, h, fn });

// ---------------- Dibujitos (pixel art, misma paleta de la app) ----------------
D('ck_masa', 16, 16, p => { p.e(8, 10, 7, 5.4, 'p', (i, j) => j >= 8); p.r(1, 7, 14, 2, 'P'); p.e(8, 7.6, 6.2, 1.9, 'y'); p.r(4, 7, 3, 1, 'w'); p.r(3, 11, 1, 3, 'w'); p.px(11, 7, 'Y'); });
D('ck_miel', 16, 16, p => { p.r(4, 6, 8, 9, 'Y'); p.r(5, 6, 6, 9, 'y'); p.r(6, 3, 4, 3, 'y'); p.r(6, 1, 4, 2, 'a'); p.r(5, 9, 6, 4, 'c'); p.px(8, 10, 'R'); p.px(7, 11, 'R'); p.px(9, 11, 'R'); p.px(8, 12, 'R'); p.r(5, 7, 1, 6, 'w'); });
D('ck_taza', 16, 16, p => { p.r(3, 3, 10, 1, 'w'); p.map(3, 4, ['lllllllllll', '.lllllllll.', '.lllllllll.', '.lllllllll.', '..lllllll..', '..lllllll..', '..lllllll..', '..lllllll..', '...lllll...']); p.r(4, 5, 1, 7, 'w'); p.r(9, 0, 2, 5, 'P'); p.px(9, 0, 'p'); p.r(5, 14, 6, 1, 'L'); });
D('ck_te', 16, 16, p => { p.e(7, 9.5, 5.4, 4.6, 'P'); p.e(6.5, 8.5, 4, 3, 'p'); p.r(4, 4, 6, 1, 'R'); p.r(5, 3, 4, 1, 'p'); p.px(7, 2, 'R'); p.line(11, 9, 14, 5, 'P'); p.px(14, 4, 'R'); p.map(0, 6, ['.pp', 'p.p', 'p.p', '.pp']); p.px(6, 9, 'w'); p.px(8, 10, 'w'); p.px(7, 12, 'R'); });
D('ck_boba', 16, 16, p => { p.map(4, 3, ['llllllll', 'lwwwwwwl', 'lwwwwwwl', 'lwwwwwwl', 'lwwwwwwl', 'lwwwwwwl', 'lwwwwwwl', 'lwwwwwwl', 'lwwwwwwl', 'lwwwwwwl', 'llllllll']); p.r(3, 1, 10, 2, 'n'); p.r(3, 1, 10, 1, 'a'); [[6, 12], [9, 12], [6, 9], [9, 9], [7.5, 6.5]].forEach(([x, y]) => { p.e(x + .5, y + .5, 1.7, 1.7, 'N'); p.px(Math.round(x) - 1, Math.round(y) - 1, 'n'); }); p.r(5, 4, 1, 7, 'w'); });
D('ck_cono', 16, 16, p => { for (let y = 3; y < 16; y++) { const w = Math.max(1, 11 - Math.floor((y - 3) * .85)); p.r(8 - Math.floor(w / 2), y, w, 1, (y + 1) % 3 ? 'a' : 'o'); } for (let y = 4; y < 15; y += 3) p.px(6 + (y % 2) * 3, y, 'A'); p.r(3, 2, 10, 2, 'A'); p.r(3, 2, 10, 1, 'a'); });
D('ck_bola', 16, 16, p => { p.e(8, 8, 6.4, 5.8, 'p'); p.e(7, 6.5, 3.6, 2.8, 'w'); p.r(2, 11, 12, 3, 'P'); [2, 5, 8, 11].forEach(x => p.e(x + 1.5, 13.5, 1.8, 1.4, 'P')); p.px(5, 5, 'w'); p.px(6, 5, 'w'); p.px(11, 9, 'R'); p.px(5, 10, 'R'); });
D('ck_chispas', 16, 16, p => { p.map(4, 3, ['llllllll', 'lwwwwwwl', 'lwwwwwwl', 'lwwwwwwl', 'lwwwwwwl', 'lwwwwwwl', 'lwwwwwwl', 'lwwwwwwl', 'lwwwwwwl', 'lwwwwwwl', 'lllllllll']); p.r(3, 1, 10, 2, 'P'); [[6, 6, 'P'], [9, 5, 'Y'], [7, 9, 'G'], [10, 8, 'h'], [6, 12, 'Y'], [9, 12, 'P'], [8, 7, 'V'], [6, 9, 'R']].forEach(([x, y, c]) => { p.px(x, y, c); p.px(x + 1, y, c); }); p.r(5, 4, 1, 8, 'w'); });
D('ck_crema', 16, 16, p => { p.e(8, 12.4, 6.6, 2.8, 'w'); p.e(8, 9.2, 5, 2.6, 'w'); p.e(8, 6.2, 3.4, 2.3, 'w'); p.r(7, 2, 2, 3, 'w'); p.px(8, 1, 'w'); p.r(3, 13, 10, 1, 'l'); p.r(5, 10, 6, 1, 'l'); p.r(6, 7, 4, 1, 'l'); p.px(6, 5, 'p'); p.px(10, 12, 'p'); });
const plate = p => { p.e(10, 15.5, 9.5, 2.8, 'w'); p.e(10, 15, 8, 2, 'c'); p.r(3, 16, 14, 1, 'L'); };
D('ck_hotcakes', 20, 20, p => { plate(p); [0, 1, 2].forEach(i => { p.e(10, 14 - i * 3.2, 7, 2.5, 'a'); p.e(10, 13.2 - i * 3.2, 6.6, 1.9, 'o'); }); p.e(10, 6.6, 5.4, 2, 'A'); p.px(5, 9, 'A'); p.px(6, 10, 'A'); p.px(14, 9, 'A'); p.px(15, 10, 'A'); p.px(10, 10, 'A'); p.r(8, 3, 4, 3, 'y'); p.r(8, 3, 4, 1, 'w'); });
D('ck_hotcakes_fresa', 20, 20, p => { plate(p); [0, 1, 2].forEach(i => { p.e(10, 14 - i * 3.2, 7, 2.5, 'a'); p.e(10, 13.2 - i * 3.2, 6.6, 1.9, 'o'); }); p.e(10, 6.8, 5.4, 2, 'A'); p.px(5, 9, 'A'); p.px(15, 9, 'A'); [[7, 3], [12, 3]].forEach(([x, y]) => { p.e(x, y + 1, 2.8, 2.7, 'R'); p.e(x, y + .6, 2.2, 2, 'P'); p.px(x - 1, y - 2, 'G'); p.px(x, y - 2, 'G'); p.px(x + 1, y - 2, 'G'); p.px(x, y + 1, 'y'); }); p.r(9, 2, 2, 2, 'y'); });
D('ck_boba_dish', 20, 20, p => { p.map(4, 4, ['wwwwwwwwwwww', 'woooooooooow', '.woooooooow.', '.woooooooow.', '.woooooooow.', '..wooooooow.', '..wooooooow.', '..woooooooo.', '...wwwwwww..']); p.r(3, 3, 14, 1, 'w'); p.r(7, 5, 4, 2, 'n'); p.r(13, 0, 2, 7, 'P'); p.px(13, 0, 'p'); [[7, 15], [10, 15], [13, 15], [8, 13], [11, 13]].forEach(([x, y]) => { p.e(x, y, 1.6, 1.6, 'N'); p.px(x - 1, y - 1, 'n'); }); p.r(6, 5, 1, 7, 'c'); });
D('ck_boba_crema', 20, 20, p => { p.map(4, 7, ['wwwwwwwwwwww', 'woooooooooow', '.woooooooow.', '.woooooooow.', '..wooooooow.', '..wooooooow.', '..woooooooo.', '...wwwwwww..']); p.r(3, 6, 14, 1, 'w'); p.e(10, 4.6, 5.4, 2.4, 'w'); p.e(10, 2.6, 3.4, 2, 'w'); p.px(10, 0, 'w'); p.px(8, 4, 'l'); p.px(11, 3, 'l'); p.px(12, 5, 'p'); [[7, 16], [10, 16], [13, 16], [8, 14], [11, 14]].forEach(([x, y]) => { p.e(x, y, 1.6, 1.6, 'N'); p.px(x - 1, y - 1, 'n'); }); });
D('ck_helado', 20, 20, p => { for (let y = 10; y < 20; y++) { const w = Math.max(1, 9 - Math.floor((y - 10) * .9)); p.r(10 - Math.floor(w / 2), y, w, 1, (y + 1) % 3 ? 'a' : 'o'); } p.e(10, 8.6, 5.8, 3.6, 'M'); p.e(10, 5.4, 5.6, 4.4, 'p'); p.e(8.4, 3.8, 2.6, 1.8, 'w'); [[6, 6, 'Y'], [12, 5, 'G'], [9, 2, 'V'], [13, 8, 'P'], [7, 9, 'Y']].forEach(([x, y, c]) => { p.px(x, y, c); p.px(x + 1, y, c); }); p.r(14, 4, 1, 2, 'R'); p.px(14, 3, 'G'); });
D('ck_crepa', 20, 20, p => { plate(p); p.e(10, 12, 8, 4, 'a'); p.e(10, 11.2, 7.4, 3.2, 'o'); p.e(10, 10.6, 5.4, 1.6, 'a'); p.r(6, 8, 8, 1, 'w'); p.e(8, 8, 1.8, 1.4, 'R'); p.e(12.5, 8, 1.8, 1.4, 'R'); p.px(10, 6, 'w'); p.px(9, 7, 'w'); p.px(11, 7, 'w'); });
D('ck_helado2', 20, 20, p => { for (let y = 11; y < 20; y++) { const w = Math.max(1, 8 - Math.floor((y - 11) * .9)); p.r(10 - Math.floor(w / 2), y, w, 1, (y + 1) % 3 ? 'a' : 'o'); } p.e(10, 9.2, 5.2, 3, 'p'); p.e(10, 5.4, 4.4, 2.8, 'w'); p.px(8, 4, 'w'); p.px(9, 8, 'w'); p.px(8, 5, 'R'); p.px(11, 6, 'y'); p.px(10, 3, 'R'); });
D('ck_tefresa', 20, 20, p => { p.map(4, 4, ['wwwwwwwwwwww', 'wppppppppppw', '.wppppppppw.', '.wppppppppw.', '.wppppppppw.', '..wpppppppw.', '..wpppppppw.', '..wppppppp..', '...wwwwwww..']); p.r(3, 3, 14, 1, 'w'); p.r(11, 0, 2, 4, 'R'); p.e(8, 12, 1.4, 1.4, 'R'); p.e(11, 13, 1.4, 1.4, 'R'); p.e(9, 15, 1.4, 1.4, 'R'); p.px(7, 8, 'R'); });
D('ck_cupcake', 20, 20, p => { for (let y = 11; y < 19; y++) { const w = 13 - Math.floor((y - 11) * .4); p.r(10 - Math.floor(w / 2), y, w, 1, 'P'); } for (let x = 5; x < 16; x += 3) p.r(x, 11, 1, 8, 'p'); p.e(10, 10.5, 6.6, 2.6, 'C'); p.e(10, 8, 5.6, 2.4, 'w'); p.e(10, 5.6, 4, 2.2, 'p'); p.e(10, 3.4, 2.4, 1.8, 'w'); p.px(10, 1, 'R'); p.px(10, 2, 'R'); p.px(9, 2, 'R'); p.px(7, 8, 'V'); p.px(12, 7, 'Y'); p.px(9, 5, 'G'); p.px(12, 5, 'P'); });

// ---------------- Recetas ----------------
const ING = { masa: 'ck_masa', miel: 'ck_miel', fresa: 'fresa', taza: 'ck_taza', te: 'ck_te', boba: 'ck_boba', cono: 'ck_cono', bola: 'ck_bola', chispas: 'ck_chispas', crema: 'ck_crema' };
const ORDER = ['masa', 'miel', 'fresa', 'crema', 'chispas', 'taza', 'te', 'boba', 'cono', 'bola'];
const RECIPES = [
  { id: 'hot', name: 'Hotcakes', steps: ['masa', 'cook', 'miel'], art: 'ck_hotcakes', price: 6, lvl: 1 },
  { id: 'boba', name: 'Té de burbujas', steps: ['taza', 'te', 'boba'], art: 'ck_boba_dish', price: 7, lvl: 1 },
  { id: 'helado', name: 'Helado', steps: ['cono', 'bola', 'chispas'], art: 'ck_helado', price: 6, lvl: 1 },
  { id: 'hotf', name: 'Hotcakes con fresa', steps: ['masa', 'cook', 'fresa', 'miel'], art: 'ck_hotcakes_fresa', price: 9, lvl: 2 },
  { id: 'cup', name: 'Cupcake', steps: ['masa', 'cook', 'crema', 'chispas'], art: 'ck_cupcake', price: 10, lvl: 3 },
  { id: 'bobac', name: 'Té con crema', steps: ['taza', 'te', 'crema', 'boba'], art: 'ck_boba_crema', price: 10, lvl: 4 },
  { id: 'crepa', name: 'Crepa de fresa', steps: ['masa', 'cook', 'fresa', 'crema'], art: 'ck_crepa', price: 11, lvl: 5 },
  { id: 'helado2', name: 'Helado doble', steps: ['cono', 'bola', 'bola', 'chispas'], art: 'ck_helado2', price: 11, lvl: 5 },
  { id: 'tefresa', name: 'Té de fresa', steps: ['taza', 'te', 'fresa', 'boba'], art: 'ck_tefresa', price: 12, lvl: 6 }
];
const CK = () => { const g = GM(); g.cook = g.cook || { served: 0 }; return g.cook; };
const lvlOf = served => Math.min(6, 1 + Math.floor(served / 8));
const cookLvl = () => lvlOf(CK().served);
const unlocked = () => RECIPES.filter(r => r.lvl <= cookLvl());
const TURN = 90;

// ---------------- El juego ----------------
async function cookGame() {
  const sh = gameShell('cook'); let { w: W, h: H } = sh.fit(); const MUS = 'cocina';
  const SC = 3, DPR = window.devicePixelRatio || 1, KP = Math.max(2, Math.round(SC * DPR)); // cada pixel del juego = número ENTERO de pixeles de pantalla (nítido)
  let LW = Math.floor(W * DPR / KP), LH = Math.floor(H * DPR / KP);
  sh.cv.width = LW * KP; sh.cv.height = LH * KP; sh.cv.style.width = (LW * KP / DPR) + 'px'; sh.cv.style.height = (LH * KP / DPR) + 'px'; sh.g.setTransform(1, 0, 0, 1, 0, 0); sh.g.imageSmoothingEnabled = false;
  const lo = document.createElement('canvas'); const L = lo.getContext('2d');
  const reset0 = () => { lo.width = LW; lo.height = LH; L.imageSmoothingEnabled = false; };
  reset0();
  const names = Object.keys(ING).map(k => ING[k]).concat(RECIPES.map(r => r.art)); const map = {}; names.forEach(n => map[n] = spr(n, 1));
  const pets = ['gochi', 'shey', 'pandy', 'pudin'].filter(k => Pix.has(k)); pets.forEach(k => map['p_' + k] = spr(k, 1)); map.me = spr(petSprite(), 1); map.heart = spr('heart', 1); map.heartE = spr('heartS', 1); map.star = spr('estrellita', 1); map.coin = spr(Pix.has('moneda') ? 'moneda' : 'estrellita', 1);
  const I = await loadImgs(map);
  // pixel-art nítido: sin bordes suaves, colores en pocos tonos y contorno oscuro
  const crisp = (im, line) => { if (!im || !im.width) return im; const w = im.width + 2, h = im.height + 2, c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(im, 1, 1); const d = x.getImageData(0, 0, w, h), a = d.data, solid = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) { const o = i * 4; if (a[o + 3] > 110) { solid[i] = 1; a[o + 3] = 255; } else a[o + 3] = 0; }
    const lc = [122, 74, 82]; for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) { const i = yy * w + xx; if (solid[i]) continue; if ((xx > 0 && solid[i - 1]) || (xx < w - 1 && solid[i + 1]) || (yy > 0 && solid[i - w]) || (yy < h - 1 && solid[i + w])) { const o = i * 4; a[o] = lc[0]; a[o + 1] = lc[1]; a[o + 2] = lc[2]; a[o + 3] = 255; } }
    x.putImageData(d, 0, 0); return c; };
  Object.keys(I).filter(k => k.startsWith('p_') || k === 'me').forEach(k => { I[k] = crisp(I[k]); });
  const U = unlocked(); const lvl = cookLvl();
  // posiciones
  const hudH = 16, counterY = Math.round(LH * .47), btnH = 24, btnRows = 2, gap = 2;
  const btnY0 = LH - (btnH * btnRows + gap * (btnRows + 1)) - 4;
  const slotX = [0, 1, 2].map(i => Math.round(LW * (1 + i * 2) / 6));
  let cust, tray, pan, time, money, lives, served, perfect, pops, focus, fx, run = true, paused = true, last = 0, raf, spawnT, flash, shake, goneT, combo;
  function reset() { cust = [null, null, null]; tray = { steps: [], done: null }; pan = null; time = TURN; money = 0; lives = 3; served = 0; perfect = 0; pops = []; focus = 0; fx = []; spawnT = .6; flash = null; shake = 0; combo = 0; goneT = 0; }
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const prefixOK = steps => U.some(r => steps.length <= r.steps.length && steps.every((s, i) => r.steps[i] === s));
  const complete = steps => U.find(r => r.steps.length === steps.length && steps.every((s, i) => r.steps[i] === s));
  function addFx(x, y, kind) { for (let i = 0; i < 6; i++) fx.push({ x, y, vx: (Math.random() - .5) * 1.4, vy: -Math.random() * 1.2 - .3, t: 24 + Math.random() * 10, k: kind || 'star' }); }
  function pop(x, y, txt, col) { pops.push({ x: x * SC, y: y * SC, t: 50, txt, col: col || '#c44a72' }); }
  function spawn() {
    const free = [0, 1, 2].filter(i => !cust[i]); if (!free.length) return;
    const i = pick(free), r = pick(U), maxp = Math.max(18, 30 - lvl * 2.2);
    cust[i] = { pet: pick(pets), r, p: maxp, max: maxp, st: 'in', t: 0, hop: 0 };
    if (!cust.some((c, k) => c && k === focus && c.st === 'wait')) focus = i;
    gsfx('tick');
  }
  function focusOrder() { const c = cust[focus]; if (c && c.st !== 'out') return c; const k = cust.findIndex(x => x && x.st !== 'out'); if (k >= 0) { focus = k; return cust[k]; } return null; }
  // ---- toques ----
  function tapIngredient(item) {
    if (pan && pan.on) { flash = { t: 12, txt: 'espera' }; pop(LW / 2, counterY + 6, '¡Cuida la plancha!', '#7d5fc4'); return; }
    if (tray.done) { tray = { steps: [], done: null }; }
    const ns = tray.steps.concat(item);
    const need = item === 'masa' ? ns.concat('cook') : ns; // masa siempre pide plancha
    if (!prefixOK(item === 'masa' ? ns : ns)) { gsfx('bonk'); shake = 14; pop(LW / 2, counterY + 24, '¡Esa no va!', '#c44a72'); tray = { steps: [], done: null }; combo = 0; return; }
    if (item === 'masa') { tray.steps = ns; pan = { on: true, p: 0, item: 'masa' }; gsfx('blup'); return; }
    tray.steps = ns; gsfx('blup'); addFx(LW / 2, counterY + 34);
    const r = complete(ns); if (r) { tray.done = r; gsfx('coin'); }
  }
  function tapPan() {
    if (!pan || !pan.on) return; const g0 = .56, g1 = .84;
    if (pan.p < g0 - .05) { pop(34, counterY + 20, '¡Aún no!', '#7d5fc4'); gsfx('tick'); return; }
    if (pan.p > .93) return;
    const ok = pan.p >= g0 && pan.p <= g1; if (!ok && pan.p < g0) { pop(34, counterY + 20, 'Casi…', '#7d5fc4'); return; }
    pan.on = false; const per = pan.p >= .64 && pan.p <= .76; if (pan.p > g1) { pop(34, counterY + 20, 'Tostadito', '#d68a3a'); } else if (per) { perfect++; pop(34, counterY + 20, '¡Perfecto!', '#3f9a5f'); addFx(34, counterY + 24); } else pop(34, counterY + 20, '¡Listo!', '#3f9a5f');
    tray.steps.push('cook'); tray.q = per ? 2 : 1; pan = null; gsfx('catch');
    const r = complete(tray.steps); if (r) { tray.done = r; gsfx('coin'); }
  }
  function burn() { pan = null; tray = { steps: [], done: null }; gsfx('bonk'); shake = 14; pop(34, counterY + 20, '¡Se quemó!', '#c44a72'); combo = 0; }
  function serve(i) {
    const c = cust[i]; if (!c || c.st === 'out') return;
    if (!tray.done) { focus = i; return; }
    if (tray.done.id !== c.r.id) { gsfx('bonk'); c.p = Math.max(0, c.p - c.max * .2); pop(slotX[i], counterY - 52, '¡Ese no pedí!', '#c44a72'); tray = { steps: [], done: null }; combo = 0; shake = 10; return; }
    const frac = c.p / c.max, tip = Math.round(frac * 4) + (tray.q === 2 ? 1 : 0) + Math.min(3, combo); const gain = c.r.price + tip;
    money += gain; served++; combo++; c.st = 'out'; c.out = 'happy'; c.t = 0; gsfx('coin'); addFx(slotX[i], counterY - 30, 'heart'); pop(slotX[i], counterY - 56, '+$' + gain + (tip ? '' : ''), '#3f9a5f'); tray = { steps: [], done: null }; goneT = 0;
  }
  function tapBin() { if (tray.steps.length || pan) { tray = { steps: [], done: null }; pan = null; gsfx('blup'); combo = 0; } }
  // ---- cuadro a cuadro ----
  function step(dt) {
    time -= dt; if (time <= 0) return over();
    spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = Math.max(3.8, 8.2 - lvl * .8 - (TURN - time) / 40); }
    cust.forEach((c, i) => { if (!c) return; c.t += dt;
      if (c.st === 'in') { if (c.t > .5) c.st = 'wait'; }
      else if (c.st === 'wait') { c.p -= dt; if (c.p <= 0) { c.st = 'out'; c.out = 'angry'; c.t = 0; lives--; combo = 0; gsfx('bonk'); shake = 14; pop(slotX[i], counterY - 56, '¡Se fue!', '#c44a72'); if (navigator.vibrate) navigator.vibrate(60); if (lives <= 0) return over(); } }
      else if (c.st === 'out' && c.t > 1) cust[i] = null; });
    if (pan && pan.on) { pan.p += dt / Math.max(2.3, 3.2 - lvl * .25); if (pan.p >= 1) burn(); }
    if (flash) { flash.t -= dt * 60; if (flash.t <= 0) flash = null; } if (shake > 0) shake -= dt * 60;
    fx.forEach(f => { f.x += f.vx; f.y += f.vy; f.vy += .03; f.t -= dt * 60; }); fx = fx.filter(f => f.t > 0); pops.forEach(p => p.t -= dt * 60); pops = pops.filter(p => p.t > 0);
  }
  // ---- dibujo (en baja resolución, luego se agranda: así todo es pixel art) ----
  const px = (x, y, w, h, c) => { L.fillStyle = c; L.fillRect(Math.round(x), Math.round(y), w, h); };
  const spr1 = (n, x, y, s) => { const im = I[n]; if (im && im.width) L.drawImage(im, Math.round(x), Math.round(y), im.width * (s || 1), im.height * (s || 1)); };
  function scene(tm) {
    tm = tm || Date.now();
    px(0, 0, LW, LH, '#fff3ea');
    for (let x = 0; x < LW; x += 12) px(x, hudH, 6, counterY - hudH, '#ffe6ee');
    px(0, counterY - 32, LW, 32, '#ffd3e0'); for (let x = 0; x < LW; x += 8) for (let y = counterY - 28; y < counterY; y += 8) px(x + ((y / 8) % 2 ? 4 : 0), y, 2, 2, '#fff3f7'); px(0, counterY - 33, LW, 2, '#fff');
    // toldo
    for (let x = 0; x < LW + 12; x += 12) { const c = (x / 12) % 2 ? '#fff' : '#f9a8c4'; px(x - 6, hudH, 12, 8, c); px(x - 5, hudH + 8, 10, 2, c); px(x - 3, hudH + 10, 6, 2, c); }
    px(0, hudH, LW, 1, '#f27ea1');
    // lucecitas colgando del toldo
    for (let x = 4; x < LW; x += 10) { const y = hudH + 13 + Math.round(Math.sin(x / 7) * 1.5), on = (Math.floor(tm / 500) + x / 10) % 3; px(x, y - 1, 1, 1, '#c9a46b'); px(x - 1, y, 3, 3, on === 0 ? '#fff6a8' : on === 1 ? '#ffc4d6' : '#d7ecff'); }
    // ventana con cielo y nubecitas
    const ww = 26, wx = Math.round(LW / 2 - ww / 2), wy = 34; px(wx - 2, wy - 2, ww + 4, 30, '#fff'); px(wx, wy, ww, 26, '#bfe6ff'); px(wx, wy + 15, ww, 11, '#d9f2c8'); px(wx + 3, wy + 4, 9, 3, '#fff'); px(wx + 5, wy + 2, 5, 3, '#fff'); px(wx + 15, wy + 8, 8, 3, '#fff'); px(wx + ww / 2, wy, 1, 26, '#fff'); px(wx, wy + 12, ww, 1, '#fff'); px(wx - 3, wy + 27, ww + 6, 3, '#f9a8c4');
    px(wx + 18, wy + 21, 6, 5, '#e7b987'); px(wx + 20, wy + 15, 1, 6, '#6fbf7f'); px(wx + 17, wy + 16, 3, 2, '#8fd49a'); px(wx + 21, wy + 13, 3, 2, '#8fd49a');
    // estante con frasquitos
    px(6, 46, 44, 3, '#d9a574'); px(6, 49, 44, 1, '#b07a52'); spr1('ck_masa', 8, 31, 1); spr1('ck_miel', 25, 31, 1); spr1('ck_chispas', 38, 31, 1);
    px(LW - 50, 46, 44, 3, '#d9a574'); px(LW - 50, 49, 44, 1, '#b07a52'); spr1('ck_taza', LW - 48, 31, 1); spr1('ck_crema', LW - 31, 31, 1); spr1('ck_boba', LW - 18, 31, 1);
    // mostrador (superficie de trabajo)
    px(0, counterY, LW, 4, '#e7b987'); px(0, counterY, LW, 1, '#f6d6ac'); px(0, counterY + 4, LW, LH - counterY, '#fbe6c8');
    for (let y = counterY + 8; y < btnY0 - 4; y += 7) px(0, y, LW, 1, '#f3d8b0');
    // barra de ingredientes
    px(0, btnY0 - 6, LW, LH - btnY0 + 6, '#ffc4d6'); for (let x = 0; x < LW; x += 8) { px(x, btnY0 - 9, 4, 3, '#ffc4d6'); } px(0, btnY0 - 6, LW, 1, '#fff');
  }
  const btnPos = i => { const per = 5, bw = btnH, sp = (LW - per * bw) / (per + 1); const col = i % per, row = Math.floor(i / per); return { x: Math.round(sp + col * (bw + sp)), y: btnY0 + gap + row * (btnH + gap), w: bw, h: btnH }; };
  const trayRect = () => ({ x: Math.round(LW / 2 - 21 + 8), y: counterY + 14, w: 42, h: 30 });
  const panRect = () => ({ x: 8, y: counterY + 10, w: 38, h: 38 });
  const binRect = () => ({ x: LW - 30, y: counterY + 14, w: 24, h: 30 });
  function drawCust(c, i) {
    const x = slotX[i]; let dy = 0, a = 1; const bounce = Math.sin(Date.now() / 260 + i) * 1;
    if (c.st === 'in') dy = Math.max(0, 28 - c.t * 56); if (c.st === 'out') { a = Math.max(0, 1 - c.t); dy = c.out === 'happy' ? -Math.sin(Math.min(1, c.t) * Math.PI) * 6 : 0; }
    L.globalAlpha = a; const im = I['p_' + c.pet]; if (im && im.width) { L.drawImage(im, Math.round(x - 20), Math.round(counterY - 40 + dy + (c.st === 'wait' ? bounce : 0)), 40, 40); }
    // sombrita del mostrador
    L.globalAlpha = 1;
    if (c.st === 'wait' || c.st === 'in') {
      const bx = Math.round(x - 20), by = counterY - 80; const sel = i === focus;
      px(bx, by, 40, 34, sel ? '#f27ea1' : '#e8c5d1'); px(bx + 1, by + 1, 38, 32, '#fff'); px(x - 2, by + 34, 5, 3, sel ? '#f27ea1' : '#e8c5d1'); px(x - 1, by + 34, 3, 2, '#fff');
      spr1(c.r.art, x - 10, by + 3, 1);
      // paciencia
      const f = Math.max(0, c.p / c.max), col = f > .5 ? '#7fcf98' : f > .25 ? '#f5c94c' : '#e0577f'; px(bx + 4, by + 26, 32, 4, '#f3e1e8'); px(bx + 4, by + 26, Math.round(32 * f), 4, col);
    }
    if (c.st === 'out') { spr1(c.out === 'happy' ? 'heart' : 'heartE', x - 5, counterY - 52 - Math.round(c.t * 8), 1); }
  }
  function drawPan() {
    const r = panRect(); px(r.x + 2, r.y + 30, r.w - 4, 4, 'rgba(120,80,60,.15)');
    px(r.x, r.y + 8, r.w, 20, '#7a6470'); px(r.x + 1, r.y + 7, r.w - 2, 22, '#7a6470'); px(r.x + 3, r.y + 9, r.w - 6, 16, '#8f7a86'); px(r.x + r.w - 2, r.y + 14, 10, 4, '#f27ea1'); px(r.x + r.w + 6, r.y + 14, 3, 4, '#f9a8c4');
    if (pan && pan.on) {
      const t = pan.p; const col = t < .3 ? '#fff3b0' : t < .56 ? '#f7d88a' : t < .84 ? '#e8a04a' : '#7a4a30'; const R = 12; L.fillStyle = col; L.beginPath(); L.ellipse(r.x + r.w / 2, r.y + 17, R, R * .62, 0, 0, 7); L.fill();
      px(r.x + r.w / 2 - 6, r.y + 13, 4, 2, 'rgba(255,255,255,.6)');
      if (Math.floor(Date.now() / 140) % 2) { px(r.x + 9, r.y + 2, 1, 4, 'rgba(255,255,255,.8)'); px(r.x + 26, r.y + 1, 1, 5, 'rgba(255,255,255,.8)'); }
      // medidor
      const mx = r.x - 2, my = r.y + 36, mw = r.w + 4; px(mx, my, mw, 6, '#fff'); px(mx + 1, my + 1, mw - 2, 4, '#f3e1e8'); px(mx + 1 + Math.round((mw - 2) * .56), my + 1, Math.round((mw - 2) * .28), 4, '#9ad7a0'); px(mx + 1 + Math.round((mw - 2) * .64), my + 1, Math.round((mw - 2) * .12), 4, '#5fbf7a'); px(mx + 1 + Math.round((mw - 2) * t), my - 2, 2, 10, '#c44a72');
    } else px(r.x + 6, r.y + 14, r.w - 12, 8, '#8f7a86');
  }
  function drawTray() {
    const r = trayRect(); const sx = shake > 0 ? Math.round(Math.sin(shake) * 2) : 0; px(r.x + sx, r.y + 24, r.w, 3, 'rgba(120,80,60,.15)');
    px(r.x + sx, r.y + 2, r.w, 24, '#fff'); px(r.x + sx + 1, r.y + 1, r.w - 2, 26, '#fff'); px(r.x + sx, r.y + 2, r.w, 2, '#f9a8c4'); px(r.x + sx + 2, r.y + 4, r.w - 4, 20, '#fff6ee');
    if (tray.done) { const ph = Math.floor(Date.now() / 220) % 4; px(r.x + sx + 12 + ph, r.y - 16, 1, 3, 'rgba(255,255,255,.9)'); px(r.x + sx + 22 - ph, r.y - 18, 1, 3, 'rgba(255,255,255,.9)'); if (Math.floor(Date.now() / 300) % 2) { px(r.x + sx + 36, r.y - 8, 3, 1, '#fff6a8'); px(r.x + sx + 37, r.y - 9, 1, 3, '#fff6a8'); } }
    if (tray.done) { const im = I[tray.done.art]; if (im) { L.drawImage(im, r.x + sx + 1, r.y - 12 + Math.round(Math.sin(Date.now() / 200)), 40, 40); } }
    else tray.steps.filter(s => s !== 'cook').forEach((s, i) => { const im = I[ING[s]]; if (im) L.drawImage(im, r.x + sx + 2 + i * 9, r.y + 6, 16, 16); });
  }
  function drawRecipe() {
    const c = focusOrder(); const y = counterY + 50; if (!c) { return; }
    const st = c.r.steps; const bw = 16, sp = 3, tot = st.length * (bw + sp) - sp, x0 = Math.round(LW / 2 - tot / 2) + 6;
    px(x0 - 3, y - 2, tot + 6, 20, 'rgba(255,255,255,.7)');
    st.forEach((s, i) => { const done = i < tray.steps.length && tray.steps[i] === s; const x = x0 + i * (bw + sp); L.globalAlpha = done ? .35 : 1; if (s === 'cook') { px(x + 2, y + 3, 12, 8, '#8f7a86'); px(x + 4, y + 5, 8, 4, '#e8a04a'); } else spr1(ING[s], x, y, 1); L.globalAlpha = 1; if (done) { px(x + 10, y + 10, 5, 5, '#5fbf7a'); px(x + 11, y + 12, 1, 1, '#fff'); px(x + 12, y + 13, 1, 1, '#fff'); px(x + 13, y + 11, 1, 1, '#fff'); } });
  }
  function drawBin() { const r = binRect(); px(r.x + 3, r.y + 28, r.w - 6, 2, 'rgba(120,80,60,.15)'); px(r.x + 2, r.y + 4, r.w - 4, 24, '#cfc0e8'); px(r.x + 3, r.y + 5, r.w - 6, 22, '#e3d8f5'); px(r.x, r.y + 1, r.w, 4, '#b79ae8'); px(r.x + 8, r.y - 1, 8, 2, '#b79ae8'); [8, 12, 16].forEach(v => px(r.x + v - 3, r.y + 9, 2, 14, '#b79ae8')); px(r.x + 6, r.y + 24, 12, 1, '#b79ae8'); }
  function draw() {
    const tm = Date.now(); L.globalAlpha = 1; scene(tm);
    cust.forEach((c, i) => c && drawCust(c, i));
    // mostrador por delante de las mascotitas
    px(0, counterY, LW, 4, '#e7b987'); px(0, counterY, LW, 1, '#f6d6ac');
    drawPan(); drawTray(); drawBin(); drawRecipe();
    U.forEach((_, i) => 0); const ings = ORDER; ings.forEach((k, i) => { const b = btnPos(i); const used = (pan && pan.on) ? 0 : 1; px(b.x, b.y + 2, b.w, b.h, 'rgba(120,70,100,.18)'); px(b.x, b.y, b.w, b.h, '#fff'); px(b.x + 1, b.y + 1, b.w - 2, b.h - 2, '#fff7fb'); px(b.x, b.y, b.w, 1, '#f9a8c4'); spr1(ING[k], b.x + 4, b.y + 4, 1); const need = (() => { const c = focusOrder(); if (!c || tray.done) return false; const nx = c.r.steps[tray.steps.length]; return nx === k; })(); if (need) { px(b.x, b.y + b.h - 2, b.w, 2, '#f27ea1'); } });
    fx.forEach(f => { L.globalAlpha = Math.min(1, f.t / 14); const im = I[f.k === 'heart' ? 'heart' : 'star']; if (im) L.drawImage(im, Math.round(f.x), Math.round(f.y), im.width, im.height); }); L.globalAlpha = 1;
    const g = sh.g; g.imageSmoothingEnabled = false; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, sh.cv.width, sh.cv.height); g.drawImage(lo, 0, 0, LW * KP, LH * KP); g.setTransform(KP / SC, 0, 0, KP / SC, 0, 0);
    pops.forEach(p => { g.globalAlpha = Math.min(1, p.t / 20); g.font = '800 16px Nunito, sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = '#fff'; g.strokeText(p.txt, p.x, p.y - (50 - p.t) * .6); g.fillStyle = p.col; g.fillText(p.txt, p.x, p.y - (50 - p.t) * .6); g.globalAlpha = 1; });
    { const tt = Math.max(0, time); $('#gmA', sh.ov).textContent = Math.floor(tt / 60) + ':' + String(Math.ceil(tt % 60) % 60).padStart(2, '0'); }
    $('#gmB', sh.ov).innerHTML = `${img('moneda', 16)} $${money} · ${[0, 1, 2].map(i => `<img class="pixel" alt="" src="${spr(i < lives ? 'heart' : 'heartS', 2)}" style="width:14px">`).join('')}${combo > 1 ? ` · x${combo}` : ''}`;
  }
  function loop(t) { if (!run) return; const dt = Math.min(.08, last ? (t - last) / 1000 : .016); last = t; if (!paused) step(dt); if (run) draw(); raf = requestAnimationFrame(loop); }
  function over() {
    A.gameMusic.stop(); run = false; cancelAnimationFrame(raf); draw();
    const g = GM(), ck = CK(); const before = lvlOf(ck.served); ck.served += served; const after = lvlOf(ck.served); const rec = money > (g.best.cocina || 0); if (rec) g.best.cocina = money;
    gsfx(rec ? 'record' : 'over'); const earned = payGame(Math.min(14, Math.floor(money / 6))); A.petAddXp && A.petAddXp(10, 'game'); A.saveSettings();
    const nuevas = RECIPES.filter(r => r.lvl > before && r.lvl <= after);
    endCard(sh, lives <= 0 ? '¡Se fueron tus clientes!' : rec ? '¡NUEVO RÉCORD!' : '¡Cerramos por hoy!', `<div class="gm-big">$${money}</div><div class="faint">${served} ${served === 1 ? 'pedido' : 'pedidos'} · ${perfect} ${perfect === 1 ? 'perfecto' : 'perfectos'}</div>${nuevas.length ? `<div class="gm-loot">${nuevas.map(r => `<span>${img(r.art, 28)}¡Receta nueva!<br>${esc(r.name)}</span>`).join('')}</div>` : ''}<div class="faint">${earned ? '+' + earned + ' estrellitas' : money < 6 ? 'Sirve más pedidos para ganar estrellitas' : 'Ya juntaste las estrellitas de hoy'}</div>`, cookGame);
  }
  // ---- control táctil ----
  const hit = (r, x, y) => x >= r.x - 3 && x <= r.x + r.w + 3 && y >= r.y - 3 && y <= r.y + r.h + 3;
  sh.cv.addEventListener('pointerdown', e => {
    if (paused) return; const rc = sh.cv.getBoundingClientRect(); const x = (e.clientX - rc.left) * LW / rc.width, y = (e.clientY - rc.top) * LH / rc.height;
    for (let i = 0; i < ORDER.length; i++) if (hit(btnPos(i), x, y)) return tapIngredient(ORDER[i]);
    if (hit(panRect(), x, y)) return tapPan();
    if (hit(binRect(), x, y)) return tapBin();
    for (let i = 0; i < 3; i++) if (cust[i] && Math.abs(x - slotX[i]) < 22 && y > counterY - 84 && y < counterY + 2) return serve(i);
    if (hit(trayRect(), x, y)) { const c = focusOrder(); if (tray.done) { const k = cust.findIndex(cc => cc && cc.st === 'wait' && cc.r.id === tray.done.id); if (k >= 0) serve(k); } }
  });
  const kd = e => { if (e.key === 'Escape') sh.close(); }; addEventListener('keydown', kd);
  $('.gm-pause', sh.ov).onclick = () => { paused = !paused; gsfx('tick'); paused ? A.gameMusic.pause() : A.gameMusic.resume(); const m = $('.gm-msg', sh.ov); if (paused) { m.hidden = false; m.innerHTML = `<div class="gm-end"><div class="gm-k">PAUSA</div><div class="row" style="gap:8px;margin-top:10px"><button class="btn" data-x="out" style="flex:1;justify-content:center">Salir</button><button class="btn pink" data-x="go" style="flex:1;justify-content:center">Seguir</button></div></div>`; m.onclick = e => { const b = e.target.closest('[data-x]'); if (!b) return; if (b.dataset.x === 'out') sh.close(); else { paused = false; m.hidden = true; A.gameMusic.resume(); } }; } };
  sh.close = () => { A.gameMusic.stop(); run = false; cancelAnimationFrame(raf); removeEventListener('keydown', kd); sh.ov.remove(); document.body.classList.remove('gaming'); if (S.route === 'juegos' || S.route === 'rincon') A.render(); };
  sh.ov.__ck = { tapIngredient, tapPan, serve, st: () => ({ cust, tray, pan, money, lives, served }), skip: s => { time -= s; } };
  reset(); const m = $('.gm-msg', sh.ov); m.hidden = false;
  m.innerHTML = `<div class="gm-end"><div class="gm-k">CAFECITO KAWAII</div><div class="gm-legend"><span>${img('ck_hotcakes', 30)}Mira el pedido</span><span>${img('ck_masa', 30)}Toca en orden</span><span>${img('ck_cupcake', 30)}Sirve rápido</span></div><div class="faint">Atiende antes de que se enojen. Con la masa, toca la plancha cuando esté dorada. Nivel ${lvl}.</div><button class="btn pink" data-x="go" style="justify-content:center;width:100%;margin-top:10px">¡Abrir el café!</button></div>`;
  m.onclick = e => { if (e.target.closest('[data-x]')) { m.hidden = true; paused = false; gsfx('start'); A.gameMusic.start(MUS); } };
  raf = requestAnimationFrame(loop);
}
A.cookGame = cookGame;

// ---------------- En la lista de juegos ----------------
ACT.gmPlay = (prev => a => a.dataset.g === 'cocina' ? cookGame() : prev(a))(ACT.gmPlay);
const juegos0 = A.screens.juegos;
A.screens.juegos = function () {
  const h = juegos0.apply(this, arguments); const best = (GM().best.cocina) || 0; const ck = CK();
  const art = `<div class="gm-art ck-art"><img class="pixel ck-a1" alt="" src="${spr('ck_hotcakes', 3)}"><img class="pixel ck-a2" alt="" src="${spr('ck_boba_dish', 3)}"><img class="pixel ck-a3" alt="" src="${spr('ck_cupcake', 3)}"></div>`;
  const card = `<button class="gm-row cook" data-act="gmPlay" data-g="cocina"><span class="gm-cover">${art}</span><span class="gm-info"><b>Cafecito kawaii</b><span>Cocina y atiende a tus amistades. Nivel ${lvlOf(ck.served)}.</span><span class="gm-rec">${img('trofeo', 14)}${best ? '$' + best : 'Sin récord'}</span></span><span class="gm-play"><i></i>Jugar</span></button>`;
  const i = h.indexOf('<div class="gm-list">'); if (i < 0) return h + card; const j = i + '<div class="gm-list">'.length; return h.slice(0, j) + '\n' + card + h.slice(j);
};
})();
