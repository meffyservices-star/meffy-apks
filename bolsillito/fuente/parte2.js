// ===== Bolsillito 2026 · Parte 2: mascotas (elegir, cuidar, cuarto, regalo, crecer, colección y admin) =====
(function () {
const A = App, S = A.S, { $, $$, esc, toast, openSheet, closeSheet, uid, today, ymd, addDays } = A;
const ACT = A.ACTIONS;
const ST = n => `<img class="pixel ico" alt="estrellitas" src="${Pix.sprite('estrellita', 3)}" style="width:${n || 16}px;height:${n || 16}px;vertical-align:-3px">`;
const spr = (n, sc) => Pix.sprite(n, sc || 4);
const img = (n, size, sc, extra) => `<img class="pixel" alt="" src="${spr(n, sc || 3)}" style="width:${size}px;height:auto;${extra || ''}">`;
const R = () => (S.settings.rincon = S.settings.rincon || { spent: 0, owned: [], equip: {}, bg: 'cielo', pets: 0, lastPet: '' });
const bal = () => (A.rinconBalance ? A.rinconBalance() : 0);
function spend(n) { if (bal() < n) { toast(`Te faltan ${n - bal()} estrellitas. ¡Sigue anotando!`); return false; } R().spent = (R().spent || 0) + n; return true; }
function give(n) { R().bonus = (R().bonus || 0) + n; }
A.giveStars = give; A.spendStars = spend;
const starsPill = () => `<span class="pill sm" style="background:#fff09a;color:#6b4d12">${ST(18)} ${bal()}</span>`;
const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
const pageIcon = (k, n) => Object.values(A.PACKS).forEach(pk => { pk.map[k] = pk.map[k] || ('s:' + n + (pk.map.home && pk.map.home.includes('~') ? '~' + pk.map.home.split('~')[1] : '')); });
function sub(key, back, right) { return `<div class="ph"><div class="ph-left"><button class="navarrow" data-go="${back || 'rincon'}" aria-label="Volver">‹</button><span class="pill">${esc(A.PAGES[key])}</span><button class="ph-icon" data-act="pageicon" data-k="${key}" aria-label="Cambiar icono de ${esc(A.PAGES[key])}">${A.iconHTML(A.pageIcon(key), 34)}</button></div>${right || ''}</div>`; }
A.subHeader = sub;

// ---------------- Catálogo ----------------
const BASE_PETS = {
  gochi: { name: 'Gochi', sprite: 'gochi', desc: 'Mochi de matcha. Tranquila y dormilona.', say: '¡Hola! Yo te cuido la racha de anotar.', how: 'free' },
  yaki: { name: 'Yaki', sprite: 'canela', desc: 'Rollito de canela. Siempre con energía.', say: '¡Vamos! Hoy anotamos todo juntas.', how: 'free' },
  shey: { name: 'Shey', sprite: 'shey', desc: 'Mochi de ube. Te ayuda con los antojos.', say: 'Cuéntame tus antojos, yo los guardo.', how: 'free' },
  ale: { name: 'Ale', sprite: 'pudin', desc: 'Flancito. Te da consejos de tu plata.', say: 'Te aviso cómo vas con tu presupuesto.', how: 'free' },
  maca: { name: 'Maca', sprite: 'maca', desc: 'Macarón de fresa. Muy coqueta.', say: '¡Adóptame y decoramos el cuarto!', how: 'stars', price: 150 },
  dony: { name: 'Dony', sprite: 'dony', desc: 'Dona glaseada. Ama los minijuegos.', say: '¿Jugamos a saltar hasta las nubes?', how: 'stars', price: 120 },
  gela: { name: 'Gela', sprite: 'gela', desc: 'Gelatina de frutilla. Rara y tembleque.', say: 'Salgo en el regalo grande del domingo.', how: 'raro' },
  cupi: { name: 'Cupi', sprite: 'cupi', desc: 'Cupcake de uva. Fan de las metas.', say: 'Llega con una racha de 30 días.', how: 'logro', ach: 's30' }
};
Object.assign(A.ANCH, {
  maca: { hx: 10, hy: 4.5, fy: 8, ny: 11.5, sprite: 'maca', name: 'Maca' },
  dony: { hx: 10, hy: 5.5, fy: 11, ny: 15.5, sprite: 'dony', name: 'Dony' },
  gela: { hx: 10, hy: 5, fy: 11, ny: 16.5, sprite: 'gela', name: 'Gela' },
  cupi: { hx: 10, hy: 3.5, fy: 8, ny: 11.5, sprite: 'cupi', name: 'Cupi' }
});
const FOODS = {
  fresa: { name: 'Fresa', art: 'una fresa', gain: 15, price: 2 }, galleta: { name: 'Galleta', art: 'una galleta', gain: 20, price: 2 },
  leche: { name: 'Leche', art: 'leche', gain: 10, price: 2 }, manzanita: { name: 'Manzanita', art: 'una manzanita', gain: 15, price: 2 },
  dango: { name: 'Dango', art: 'un dango', gain: 25, price: 3 }, pan: { name: 'Pan', art: 'pancito', gain: 20, price: 3 },
  dona: { name: 'Dona', art: 'una dona', gain: 30, price: 4 }, cupcake: { name: 'Cupcake', art: 'un cupcake', gain: 30, price: 4 },
  helado: { name: 'Helado', art: 'un helado', gain: 25, price: 4 }, pizza: { name: 'Pizza', art: 'pizza', gain: 35, price: 5 },
  pastel: { name: 'Pastel', art: 'pastel', gain: 40, price: 6 }
};
A.FOODS = FOODS;
const FURN = {
  // camas y asientos
  cama: { name: 'Camita', w: 26, h: 34, price: 0, x: 8, y: 30, cat: 'camas', bed: true },
  cama_nube: { name: 'Cama de nube', w: 30, h: 34, price: 70, x: 56, y: 30, cat: 'camas', bed: true },
  sofa: { name: 'Sofá rosa', w: 32, h: 20, price: 35, x: 20, y: 70, cat: 'camas', seat: [8, 4] },
  sofa_amarillo: { name: 'Sofá amarillo', w: 32, h: 20, price: 35, x: 90, y: 70, cat: 'camas', seat: [8, 4] },
  sillon: { name: 'Sillón menta', w: 16, h: 18, price: 20, x: 110, y: 60, cat: 'camas', seat: [0, 2] },
  silla: { name: 'Sillita', w: 10, h: 14, price: 8, x: 80, y: 90, cat: 'mesas' },
  puff: { name: 'Puff corazón', w: 18, h: 16, price: 20, x: 64, y: 96, cat: 'camas', seat: [0, 0] },
  cojin: { name: 'Cojín', w: 14, h: 10, price: 0, x: 104, y: 104, cat: 'camas', seat: [-2, -6] },
  // mesas y muebles
  mesa: { name: 'Mesa con mantel', w: 26, h: 20, price: 30, x: 96, y: 92, cat: 'mesas', table: true },
  mesa_te: { name: 'Mesa de té', w: 18, h: 18, price: 25, x: 60, y: 72, cat: 'mesas', table: true },
  mesita: { name: 'Mesita de noche', w: 12, h: 14, price: 12, x: 36, y: 36, cat: 'mesas', glow: [6, 0, 14] },
  comoda: { name: 'Cómoda', w: 22, h: 20, price: 30, x: 116, y: 18, cat: 'mesas' },
  tocador: { name: 'Tocador con espejo', w: 22, h: 26, price: 40, x: 4, y: 6, cat: 'mesas' },
  estante: { name: 'Estante de libros', w: 22, h: 30, price: 35, x: 116, y: 4, cat: 'mesas' },
  chimenea: { name: 'Chimenea', w: 26, h: 28, price: 60, x: 46, y: 6, cat: 'mesas', glow: [13, 21, 30] },
  cocina: { name: 'Cocinita', w: 32, h: 24, price: 50, x: 100, y: 10, cat: 'mesas' },
  cofre: { name: 'Cofre', w: 14, h: 11, price: 15, x: 120, y: 112, cat: 'mesas' },
  piano: { name: 'Piano', w: 26, h: 22, price: 60, lvl: 8, x: 108, y: 34, cat: 'mesas', piano: true },
  // alfombras
  alfombra: { name: 'Alfombra a cuadros', w: 34, h: 22, price: 0, x: 54, y: 66, flat: true, cat: 'alfombras' },
  alfombra_verde: { name: 'Alfombra verde', w: 34, h: 24, price: 20, x: 20, y: 66, flat: true, cat: 'alfombras' },
  alfombra_flor: { name: 'Alfombra de flor', w: 26, h: 24, price: 20, x: 58, y: 104, flat: true, cat: 'alfombras' },
  alfombra_girasol: { name: 'Alfombra girasol', w: 26, h: 24, price: 20, x: 96, y: 60, flat: true, cat: 'alfombras' },
  alfombra_lila: { name: 'Alfombra lila', w: 30, h: 22, price: 20, x: 50, y: 60, flat: true, cat: 'alfombras' },
  // plantas y adornos
  cerezo: { name: 'Cerezo en maceta', w: 18, h: 26, price: 25, x: 124, y: 30, cat: 'deco' },
  planta: { name: 'Plantita', w: 14, h: 18, price: 10, x: 4, y: 100, cat: 'deco' },
  planta_grande: { name: 'Planta grande', w: 20, h: 30, price: 25, x: 2, y: 64, cat: 'deco' },
  flores: { name: 'Florero', w: 12, h: 14, price: 12, x: 128, y: 70, cat: 'deco' },
  cristal: { name: 'Cristal rosa', w: 10, h: 16, price: 15, x: 132, y: 92, cat: 'deco' },
  peluche: { name: 'Conejito de peluche', w: 14, h: 16, price: 15, x: 40, y: 104, cat: 'deco' },
  lampara: { name: 'Lámpara de pie', w: 10, h: 26, price: 20, x: 2, y: 34, cat: 'luces', glow: [5, 4, 26] },
  lampara_mesa: { name: 'Lámpara de mesa', w: 12, h: 14, price: 15, x: 36, y: 26, cat: 'luces', glow: [6, 4, 18] },
  hongo: { name: 'Lámpara de hongo', w: 14, h: 18, how: 'raro', x: 126, y: 50, cat: 'luces', glow: [7, 5, 22] },
  calabaza: { name: 'Calabaza', w: 14, h: 12, price: 30, season: 'halloween', x: 84, y: 112, cat: 'deco' },
  arbolito: { name: 'Arbolito', w: 18, h: 26, price: 40, season: 'navidad', x: 2, y: 34, cat: 'deco', glow: [9, 10, 20] },
  // pared
  ventana: { name: 'Ventana', w: 22, h: 20, price: 0, x: 84, y: 4, wall: true, cat: 'pared' },
  cuadro: { name: 'Cuadrito', w: 16, h: 13, price: 12, x: 34, y: 6, wall: true, cat: 'pared' },
  marco: { name: 'Marco con tu foto', w: 16, h: 14, price: 15, x: 64, y: 5, wall: true, cat: 'pared', photo: true },
  corona: { name: 'Corona de flores', w: 16, h: 16, price: 15, x: 20, y: 4, wall: true, cat: 'pared' },
  aplique: { name: 'Lamparita de pared', w: 8, h: 12, price: 15, x: 110, y: 8, wall: true, cat: 'luces', glow: [4, 6, 16] },
  luces: { name: 'Lucecitas', w: 48, h: 9, price: 20, x: 48, y: 0, wall: true, cat: 'luces', glow: [24, 4, 34] },
  estrellas: { name: 'Guirnalda de estrellas', w: 40, h: 10, price: 20, x: 52, y: 0, wall: true, cat: 'pared' },
  reloj: { name: 'Reloj', w: 12, h: 18, price: 25, x: 70, y: 6, wall: true, cat: 'pared' }
};
A.FURN = FURN;
const FCATS = [['todo', 'Todo'], ['camas', 'Camas y asientos'], ['mesas', 'Muebles'], ['alfombras', 'Alfombras'], ['deco', 'Plantas y adornos'], ['luces', 'Luces'], ['pared', 'Pared']];
const WALLS = { rosa: ['Rosa con puntitos', 0], cereza: ['Cerezas', 20], menta: ['Menta', 20], lila: ['Lila', 20], durazno: ['Durazno', 20], cielo: ['Cielo', 25] };
const FLOORS = { madera: ['Madera clara', 0], rosa: ['Madera rosa', 20], cafe: ['Madera café', 20], lila: ['Madera lila', 20], cuadros: ['Cuadritos', 20], pasto: ['Pasto', 25] };
const ROOMS = {
  cuarto: { name: 'Mi cuarto', price: 0, wall: 'rosa', floor: 'madera', icon: 'cama' },
  sala: { name: 'Sala de cuidar', short: 'Sala', price: 0, wall: 'menta', floor: 'madera', icon: 'sofa_lila' },
  cocina: { name: 'Cocina', price: 120, wall: 'cereza', floor: 'cuadros', gift: ['cocina', 'mesa'], icon: 'tetera' },
  juegos: { name: 'Cuarto de juegos', price: 150, wall: 'lila', floor: 'lila', gift: ['alfombra_lila', 'peluche'], icon: 'peluche', short: 'Juegos' },
  jardin: { name: 'Jardín', price: 150, wall: 'cielo', floor: 'pasto', gift: ['cerezo', 'flores'], icon: 'flores' }
};
// ropa de temporada (mismo sistema que la Tiendita)
const SEAS_ACC = {
  calabaza: { slot: 'head', name: 'Gorrito de calabaza', price: 30, season: 'halloween', map: ['...G....', '..aaaa..', '.aAaaAa.', 'aaAaaAaa', 'aaAaaAaa'] },
  navidad: { slot: 'head', name: 'Gorrito navideño', price: 30, season: 'navidad', map: ['......ww', '.....RRw', '...RRRR.', '..RRRRR.', '.RRRRRR.', 'wwwwwwww'] },
  bufanda_verde: { slot: 'neck', name: 'Bufanda verde', price: 25, season: 'navidad', map: ['GGGGGGGGGGGG', 'GwGwGwGwGwGw', '......GG....', '......Gw....'] },
  corona_corazon: { slot: 'head', name: 'Corona de corazones', price: 35, season: 'valentin', map: ['P...P...P', 'PP.PPP.PP', 'PPPPPPPPP', 'RRRRRRRRR'] }
};

// ---- Animación de 2 cuadros: los dibujos con "cuadro 2" se alternan solos ----
A.ANIM = A.ANIM || {};
(() => {
  const PAIR = new Map(); const orig = Pix.sprite;
  Pix.sprite = (n, sc) => { const u = orig(n, sc); const b = A.ANIM[n]; if (b && !PAIR.has(u)) { const u2 = orig(b, sc); if (u2) { PAIR.set(u, u2); PAIR.set(u2, u); } } return u; };
  setInterval(() => { if (document.hidden || !PAIR.size) return; for (const im of document.images) { const o = PAIR.get(im.src); if (o) im.src = o; } }, 550);
})();
function addAcc(id, a, raw) {
  if (raw) { a.w = raw.dw || 14; a.h = raw.dh || a.w * raw.h / raw.w; A.ACC[id] = a; Pix.define('acc_' + id, { raw: raw.map, pal: raw.pal }); if (raw.map2) { Pix.define('acc_' + id + '__2', { raw: raw.map2, pal: raw.pal }); A.ANIM['acc_' + id] = 'acc_' + id + '__2'; } return; }
  a.w = a.map[0].length + 2; a.h = a.map.length + 2; A.ACC[id] = a; Pix.define('acc_' + id, { w: a.w, h: a.h, fn(p) { p.map(1, 1, a.map); } }); }
Object.entries(SEAS_ACC).forEach(([id, a]) => addAcc(id, a));
A.RC.BGS.noche = { price: 25, season: 'halloween' };
const SEASONS = [
  { id: 'halloween', name: 'Noche de brujas', from: '10-15', to: '11-02', pet: 'yaki', look: 'calabaza', items: ['acc:calabaza', 'acc:bruja', 'bg:noche', 'furn:calabaza'], when: 'del 15 de octubre al 2 de noviembre' },
  { id: 'navidad', name: 'Navidad', from: '12-01', to: '01-06', pet: 'gochi', look: 'navidad', items: ['acc:navidad', 'acc:bufanda_verde', 'furn:arbolito'], when: 'desde el 1 de diciembre' },
  { id: 'valentin', name: 'San Valentín', from: '02-01', to: '02-14', pet: 'ale', look: 'corona_corazon', items: ['acc:corona_corazon', 'furn:flores'], when: 'en febrero' }
];
A.SEASONS = SEASONS;
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const mdTxt = md => +md.slice(3) + ' de ' + MESES[+md.slice(0, 2) - 1];
function allSeasons() {
  const c = (A.CFG && A.CFG.catalog) || {}; const extra = (k, sid) => (c[k] || []).filter(x => x.how === 'temporada' && x.season === sid && !x.off);
  const itemsFor = sid => extra('clothes', sid).map(x => 'acc:cc_' + x.id).concat(extra('furn', sid).map(x => 'furn:cf_' + x.id));
  const base = SEASONS.map(s => Object.assign({}, s, { items: s.items.concat(itemsFor(s.id)) }));
  const custom = (c.seasons || []).map(s => { const items = itemsFor(s.id); const look = items.find(k => k.startsWith('acc:')); return { id: s.id, name: s.name, from: s.from, to: s.to, pet: (P().active || 'gochi'), look: look ? look.slice(4) : null, items, when: 'del ' + mdTxt(s.from) + ' al ' + mdTxt(s.to), custom: true }; });
  return base.concat(custom);
}
A.allSeasons = allSeasons;
function inSeason(id, d) {
  const se = SEASONS.find(x => x.id === id) || ((A.CFG && A.CFG.catalog && A.CFG.catalog.seasons) || []).find(x => x.id === id); if (!se) return false;
  const md = (d || today()).slice(5);
  return se.from <= se.to ? md >= se.from && md <= se.to : md >= se.from || md <= se.to;
}
A.inSeason = inSeason;
function daysLeft(se) {
  const t = new Date(); let end = new Date(t.getFullYear(), +se.to.slice(0, 2) - 1, +se.to.slice(3));
  if (end < new Date(t.getFullYear(), t.getMonth(), t.getDate())) end = new Date(t.getFullYear() + 1, +se.to.slice(0, 2) - 1, +se.to.slice(3));
  return Math.round((end - new Date(t.getFullYear(), t.getMonth(), t.getDate())) / 864e5) + 1;
}
A.seasonDaysLeft = daysLeft;

// ---- cosas que agrega la administradora (se guardan en la configuración de la app) ----
const catalog = () => { const c = (A.CFG && A.CFG.catalog) || {}; return { pets: c.pets || [], furn: c.furn || [], clothes: c.clothes || [], food: c.food || [], icons: c.icons || [], stickers: c.stickers || [], walls: c.walls || [], floors: c.floors || [], seasons: c.seasons || [], chars: c.chars || [], boxes: c.boxes || [] }; };
const defMap = (name, w, h, map) => Pix.define(name, { w, h, fn(p) { p.map(0, 0, map); } });
const defX = (name, x, w, h) => { if (x.pal) { Pix.define(name, { raw: x.map, pal: x.pal }); if (x.map2) { Pix.define(name + '__2', { raw: x.map2, pal: x.pal }); A.ANIM[name] = name + '__2'; } } else defMap(name, w, h, x.map); };
const notYet = x => x.from && x.from > A.today();
let customKeys = { pets: [], furn: [], clothes: [], food: [], icons: [], walls: [], floors: [] };
function registerCatalog() {
  customKeys.furn.forEach(k => delete FURN[k]); customKeys.food.forEach(k => delete FOODS[k]); customKeys.clothes.forEach(k => delete A.ACC[k]);
  customKeys.pets.forEach(k => delete A.ANCH[k]);
  customKeys.walls.forEach(k => delete WALLS[k]); customKeys.floors.forEach(k => delete FLOORS[k]);
  customKeys = { pets: [], furn: [], clothes: [], food: [], icons: [], walls: [], floors: [] };
  const c = catalog();
  c.pets.forEach(x => { const k = 'cp_' + x.id; defX(k, x, x.w || 20, x.h || 20); customKeys.pets.push(k); if (!x.off && !notYet(x)) A.ANCH[k] = { hx: x.pal ? 10 : (x.w || 20) / 2, hy: x.hy || 5, fy: x.fy || 10, ny: x.ny || 15, sprite: k, name: x.name }; });
  c.furn.forEach(x => { const k = 'cf_' + x.id; defX(k, x, x.w, x.h); customKeys.furn.push(k); const fw = x.dw || x.w, fh = x.dh || x.h; if (notYet(x)) return; FURN[k] = Object.assign({ name: x.name, w: fw, h: fh, price: x.how === 'free' ? 0 : +x.price || 0, how: x.how, ach: x.ach, season: x.season, sprite: k, x: Math.max(0, 72 - fw / 2), y: x.wall ? 4 : 70, cat: x.cat || (x.wall ? 'pared' : 'deco'), wall: !!x.wall, off: x.off, custom: true }, furnSpecial(k, x, fw, fh)); });
  c.food.forEach(x => { const k = 'cfo_' + x.id; defX(k, x, x.w || 16, x.h || 16); customKeys.food.push(k); if (notYet(x)) return; FOODS[k] = { name: x.name, art: x.name, gain: +x.gain || 20, price: +x.price || 3, sprite: k, off: x.off, custom: true }; });
  c.clothes.forEach(x => { const k = 'cc_' + x.id; customKeys.clothes.push(k); if (notYet(x)) return; addAcc(k, { slot: x.slot || 'head', name: x.name, price: x.how === 'free' ? 0 : +x.price || 10, season: x.how === 'temporada' ? x.season : null, ach: x.how === 'logro' ? x.ach : null, raro: x.how === 'raro', map: x.map.map(r => r), off: x.off, offAdmin: x.off, custom: true, dx: +x.dx || 0, dy: +x.dy || 0 }, x.pal ? x : null); if (x.dw && !x.pal) { const a = A.ACC[k]; const r0 = a.h / a.w; a.w = x.dw; a.h = x.dw * r0; } });
  c.icons.forEach(x => { if (x.off || notYet(x)) return; const k = 'ci_' + x.id; defX(k, x, x.w || 16, x.h || 16); customKeys.icons.push(k); });
  c.stickers.forEach(x => { if (x.off || notYet(x)) return; defX('cs_' + x.id, x, x.w, x.h); });
  c.chars.forEach(x => defX('cg_' + x.id, x, x.w || 20, x.h || 20));
  c.boxes.forEach(x => defX('cbx_' + x.id, x, x.w || 20, x.h || 20));
  const tileDef = (name, x, W, H) => { const t = x.pal ? x : null; if (!t) return; Pix.define(name, { raw: tiledRaw(x.map, W, H), pal: x.pal }); };
  c.walls.forEach(x => { const k = 'cw_' + x.id; tileDef('x_pared_' + k, x, 144, 34); customKeys.walls.push(k); if (!x.off && !notYet(x)) WALLS[k] = [x.name, x.how === 'stars' ? +x.price || 0 : 0]; });
  c.floors.forEach(x => { const k = 'cl_' + x.id; tileDef('x_piso_' + k, x, 144, 98); customKeys.floors.push(k); if (!x.off && !notYet(x)) FLOORS[k] = [x.name, x.how === 'stars' ? +x.price || 0 : 0]; });
  applyGone();
  seasonGate();
}
// luces y ventanas de los muebles hechos en el panel
// light: '' = según la categoría (los de Luces alumbran), 'no' = nada, 'luz' = alumbra de noche, 'ventana' = se ve el día y la noche
const furnLit = x => x.light === 'luz' || (!x.light && x.cat === 'luces');
const lightR = (x, fw, fh) => +x.lr || Math.round(Math.max(22, Math.max(fw, fh) * 1.6));
function glassBox(x) { // dónde va el paisaje: el vidrio si se eligió su color; si no, el centro del dibujo
  const ch = glassChar(x); if (!ch) return [.12, .12, .88, .88];
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; x.map.forEach((r, j) => [...r].forEach((c, i) => { if (c === ch) { x0 = Math.min(x0, i); y0 = Math.min(y0, j); x1 = Math.max(x1, i); y1 = Math.max(y1, j); } }));
  return x1 < 0 ? [.12, .12, .88, .88] : [x0 / x.w, y0 / x.h, (x1 + 1) / x.w, (y1 + 1) / x.h];
}
function glassChar(x) { if (!x.glass || !x.pal) return null; const pal = typeof x.pal === 'string' ? x.pal.split(',') : x.pal; const i = pal.findIndex(c => (c || '').toLowerCase() === x.glass.toLowerCase()); return i < 0 ? null : i.toString(36); }
function furnSpecial(k, x, fw, fh) {
  const o = {};
  if (furnLit(x)) o.glow = [(x.lx != null ? +x.lx : .5) * fw, (x.ly != null ? +x.ly : .3) * fh, lightR(x, fw, fh)];
  if (x.light === 'ventana') {
    o.win = glassBox(x);
    const ch = glassChar(x); // el color del vidrio se vuelve transparente para que se vea el paisaje de atrás
    if (ch) { Pix.define(k + '__win', { raw: x.map.map(r => r.split(ch).join('.')), pal: x.pal }); o.winSprite = k + '__win'; }
  }
  return o;
}
// el paisaje que se ve por las ventanas: día, atardecer y noche
(function () {
  const hills = (p, a, b, c) => { p.e(8, 34, 16, 9, a); p.e(34, 35, 18, 10, b); p.e(22, 38, 20, 8, c); p.r(0, 30, 40, 2, c); p.r(0, 32, 40, 8, c); };
  const tree = (p, x, y, l, d) => { p.r(x, y + 3, 1, 3, '#7a5236'); p.e(x + .5, y + 2, 2.4, 2.6, l); p.px(x - 1, y + 3, d); p.px(x + 1, y + 1, d); };
  Pix.define('x_paisaje_dia', { w: 40, h: 32, flat: true, fn(p) { p.r(0, 0, 40, 32, '#9fd4f5'); p.r(0, 0, 40, 6, '#86c6ef'); p.r(0, 14, 40, 10, '#b9e2fa'); p.e(31, 7, 4, 4, '#fff3b0'); p.e(31, 7, 3, 3, '#ffe27a');
    p.e(9, 8, 4, 2, '#ffffff'); p.e(13, 7, 3, 2.2, '#ffffff'); p.e(6, 9, 2.4, 1.6, '#f2f8ff'); p.e(22, 13, 3, 1.4, '#ffffff'); p.e(25, 12.6, 2, 1.4, '#ffffff');
    hills(p, '#9fd28a', '#86c475', '#74b565'); tree(p, 6, 21, '#5fa456', '#4c8a45'); tree(p, 30, 22, '#5fa456', '#4c8a45'); p.px(14, 27, '#ffd1df'); p.px(20, 28, '#fff3b0'); p.px(25, 27, '#ffd1df'); p.px(11, 29, '#ffffff'); } });
  Pix.define('x_paisaje_tarde', { w: 40, h: 32, flat: true, fn(p) { p.r(0, 0, 40, 32, '#ffc7a8'); p.r(0, 0, 40, 6, '#e9a3c4'); p.r(0, 6, 40, 6, '#f6b2b8'); p.r(0, 17, 40, 8, '#ffd9a8'); p.e(20, 23, 6, 6, '#ffe7a3'); p.e(20, 23, 4.5, 4.5, '#ffb46b');
    p.e(8, 9, 4, 1.4, '#ffd7e2'); p.e(30, 7, 4.5, 1.4, '#ffd7e2'); p.e(33, 12, 2.6, 1, '#ffe4ec');
    hills(p, '#c98aa0', '#b07a96', '#9a6b88'); tree(p, 6, 21, '#8a5f7f', '#6f4c68'); tree(p, 31, 22, '#8a5f7f', '#6f4c68'); p.px(16, 29, '#ffcf8f'); p.px(26, 28, '#ffcf8f'); } });
  Pix.define('x_paisaje_noche', { w: 40, h: 32, flat: true, fn(p) { p.r(0, 0, 40, 32, '#2f2c74'); p.r(0, 0, 40, 8, '#24205c'); p.r(0, 18, 40, 8, '#3e3b8f'); p.e(29, 8, 4, 4, '#fff6cf'); p.e(30.6, 7, 3.4, 3.4, '#2f2c74');
    [[4, 4], [9, 10], [14, 3], [19, 8], [23, 2], [36, 4], [35, 13], [6, 15], [17, 14], [24, 11], [12, 18]].forEach(([x, y], i) => p.px(x, y, i % 3 ? '#e9e6ff' : '#fff3b0')); p.px(14, 2, '#bdb8ff'); p.px(14, 4, '#bdb8ff'); p.px(13, 3, '#bdb8ff'); p.px(15, 3, '#bdb8ff');
    hills(p, '#3b4f7c', '#33456f', '#2a3a60'); tree(p, 6, 21, '#2c4a5e', '#213a4c'); tree(p, 31, 22, '#2c4a5e', '#213a4c'); p.px(12, 27, '#ffe27a'); p.px(13, 27, '#ffe27a'); p.px(27, 28, '#ffe27a'); p.px(19, 25, '#c8f7a8'); p.px(33, 26, '#c8f7a8'); } });
})();
function seasonGate() {
  const owned = R().owned || [];
  Object.entries(A.ACC).forEach(([id, a]) => {
    if (a.season || a.raro || a.ach) a.off = !!a.offAdmin || (!owned.includes('acc:' + id) && !(a.season && inSeason(a.season)) && !(a.ach && achOk(a.ach)));
    if (a.custom && a.offAdmin) a.off = true;
    if (a.gone) a.off = true;
  });
}
A.registerCatalog = registerCatalog;
const achOk = id => { const a = (A.RC.ACH || []).find(x => x.id === id); return a && A.rcStats ? a.ok(A.rcStats()) : false; };

function allPets() {
  const out = {}; const gp = goneOf('pets'); const mine = ((S.settings.pet || {}).owned || []); Object.entries(BASE_PETS).forEach(([k, v]) => { if (!gp.includes(k) || mine.includes(k)) out[k] = v; });
  catalog().pets.forEach(x => { if (!x.off && !(x.from && x.from > A.today())) out['cp_' + x.id] = { name: x.name, sprite: 'cp_' + x.id, desc: x.desc || '', say: x.say || x.desc || '¡Hola!', how: x.how || 'stars', price: +x.price || 0, ach: x.ach, season: x.season, custom: true }; });
  return out;
}
A.allPets = allPets;

// ---------------- Estado de las mascotas ----------------
function P() {
  const s = S.settings; const p = s.pet = s.pet || {};
  p.owned = p.owned || ['gochi', 'yaki', 'shey', 'ale'].filter(k => !goneOf('pets').includes(k)); p.room = p.room || ['gochi', 'yaki', 'shey'].filter(k => p.owned.includes(k));
  p.care = p.care || {}; p.xp = p.xp || {}; p.since = p.since || {}; p.lvSeen = p.lvSeen || {};
  p.pantry = p.pantry || { fresa: 3, galleta: 3, leche: 2, manzanita: 2 };
  return p;
}
A.petState = P;
A.petOwns = k => P().owned.includes(k);
A.petActive = () => P().active || null;
const info = id => allPets()[id] || BASE_PETS[id] || { name: 'Mochi', sprite: 'gochi' };
A.petInfo = info;
function care(id) {
  const p = P(); const now = Date.now();
  const c = p.care[id] = p.care[id] || { h: 60, f: 70, e: 70, l: 70, t: now, sleep: false };
  const hrs = Math.max(0, (now - (c.t || now)) / 36e5);
  if (hrs > 0.01) {
    c.h = clamp(c.h - 4 * hrs); c.f = clamp(c.f - 2 * hrs); c.l = clamp(c.l - 2.5 * hrs);
    c.e = clamp(c.sleep ? c.e + 14 * hrs : c.e - 3 * hrs); c.t = now;
    if (c.sleep && c.e >= 100) c.sleep = false;
  }
  return c;
}
A.petCare = care;
// puntos para crecer: lo que ganas cuidándola y jugando + lo que anotas
const need = L => 80 * L + 20;
function bestStreak() { const s = A.rcStats ? A.rcStats() : { best: 0, goalsDone: 0 }; return s; }
function xpOf(id) {
  const p = P(); const since = p.since[id] || '2000-01-01';
  const per = {}; S.tx.forEach(t => { if (t.example || t.recurring || t.inst || t.date < since) return; per[t.date] = (per[t.date] || 0) + 1; });
  const txXp = Object.values(per).reduce((s, n) => s + Math.min(6, n) * 5, 0);
  const st = bestStreak();
  return (p.xp[id] || 0) + txXp + (st.best >= 7 ? 40 : 0) + (st.goalsDone || 0) * 80;
}
function level(id) { let x = xpOf(id), L = 1; while (x >= need(L) && L < 50) { x -= need(L); L++; } return { L, cur: x, need: need(L), stage: L >= 10 ? 'real' : L >= 5 ? 'mochi' : 'bebe' }; }
A.petLevel = level;
function addXp(id, n, kind) {
  const p = P(); const d = today(); if (!p.xpd || p.xpd.d !== d) p.xpd = { d, care: 0, game: 0 };
  const cap = kind === 'game' ? 60 : 30; const room = Math.max(0, cap - (p.xpd[kind] || 0)); const g = Math.min(n, room);
  if (!g) return 0; p.xpd[kind] = (p.xpd[kind] || 0) + g; p.xp[id] = (p.xp[id] || 0) + g; return g;
}
A.petAddXp = (n, kind) => { const id = P().active; if (id) addXp(id, n, kind || 'game'); };
// premios por nivel (se ganan con el nivel más alto de tus mascotas)
const LV_PRIZES = [
  [2, 'food', 'dango', 3, '3 dangos para la despensa'], [3, 'stars', 15, 0, '15 estrellitas'], [4, 'wall', 'menta', 0, 'Pared menta para el cuarto'],
  [5, 'grow', 0, 0, 'Crece: ya no es chiquita'], [6, 'floor', 'cuadros', 0, 'Piso de cuadritos'], [7, 'acc', 'lazo', 0, 'Lazo rosa'],
  [8, 'furn', 'piano', 0, 'El piano para tu cuarto'], [9, 'stars', 30, 0, '30 estrellitas'], [10, 'wings', 0, 0, 'Le salen alitas'],
  [12, 'furn', 'hongo', 0, 'Lámpara de hongo'], [15, 'stars', 80, 0, '80 estrellitas']
];
A.LV_PRIZES = LV_PRIZES;
function claimPrizes() {
  const p = P(); const maxL = Math.max(1, ...p.owned.map(k => level(k).L)); const from = p.lvClaim || 1; if (maxL <= from) return [];
  const got = LV_PRIZES.filter(([L]) => L > from && L <= maxL); const r = room();
  got.forEach(([, k, a, n]) => {
    if (k === 'food') p.pantry[a] = (p.pantry[a] || 0) + n;
    if (k === 'stars') give(a);
    if (k === 'wall' || k === 'floor') { const key = k + ':' + a; if (!r.owned.includes(key)) r.owned.push(key); }
    if (k === 'acc') { const ro = R(); ro.owned = ro.owned || []; if (!ro.owned.includes('acc:' + a)) ro.owned.push('acc:' + a); }
    if (k === 'furn') { if (!cnt(a)) addInv(a, 1); }
  });
  p.lvClaim = maxL; return got;
}
function checkLevelUp() {
  const p = P(); let msg = null;
  p.owned.forEach(id => { const L = level(id).L; if ((p.lvSeen[id] || 0) < L) { if (p.lvSeen[id]) msg = `¡${info(id).name} subió a nivel ${L}!` + (L === 5 ? ' Ya creció.' : L === 10 ? ' ¡Le salieron alitas!' : ''); p.lvSeen[id] = L; } });
  const got = claimPrizes(); if (got.length) msg = (msg ? msg + ' ' : '') + 'Ganaste: ' + got.map(x => x[4]).join(', ') + '.';
  if (msg) { A.saveSettings(); setTimeout(() => toast(msg), 300); }
}
function petArt(id, sc, cls) {
  const lv = level(id); const an = A.ANCH[id];
  const base = an && A.wear ? A.wear(id, { scale: sc || 5 }) : `<span class="mz"><img class="pixel mz-base" alt="" src="${spr(info(id).sprite, sc || 5)}"></span>`;
  return `<span class="petw st-${lv.stage} ${cls || ''}" aria-label="${esc(info(id).name)}">${lv.stage === 'real' ? `<img class="pixel petw-alas" alt="" src="${spr('alitas', 6)}">` : ''}${base}</span>`;
}
A.petArt = petArt;
const petImgSrc = (id, sc) => spr(info(id).sprite, sc || 4);
A.petSrc2 = petImgSrc;
function moodMsg(id, c) {
  const n = info(id).name;
  if (c.sleep) return `${n} está durmiendo. Shh…`;
  const dd = daysSinceTx(); if (dd >= 2) return dd >= 4 ? `Te extraño… hace ${dd} días que no anotamos nada.` : '¿Anotamos lo que gastaste? Me pongo triste si no.';
  const low = [['h', 'Tengo hambre… ¿me das algo de la despensa?'], ['l', 'Estoy un poquito sucia. ¿Me bañas?'], ['e', 'Tengo sueño… ¿me acuestas a dormir?'], ['f', '¿Me das cariño? Toca Mimar.']].filter(([k]) => c[k] < 35);
  if (low.length) return low[0][1];
  if (c.h > 80 && c.f > 80 && c.l > 70) return '¡Me siento genial! Gracias por cuidarme.';
  return info(id).say || '¡Hola!';
}

// ---------------- Pantalla principal: Mis mochis ----------------
A.PAGES.rincon = 'Mi mascota';
Object.assign(A.PAGES, { elegir: 'Elige tu mascota', cuarto: 'Mi cuarto', regalo: 'Regalo del día', crecer: 'Crecer', coleccion: 'Colección', logros: 'Logros', admincat: 'Agregar cosas nuevas' });
pageIcon('cuarto', 'casita'); pageIcon('regalo', 'gift'); pageIcon('crecer', 'brote'); pageIcon('coleccion', 'paw'); pageIcon('logros', 'trofeo'); pageIcon('admincat', 'gear'); pageIcon('elegir', 'heart');
const bar = (name, ic, v) => `<div class="pc-bar"><span class="pc-bar-ic">${img(ic, 22)}</span><span class="pc-bar-n">${name}</span><span class="pc-track"><i style="width:${v}%;background:${v < 30 ? '#e0577f' : v < 60 ? '#f5c94c' : '#7cbf5a'}"></i></span></div>`;
const barsHTML = c => bar('Pancita', 'cupcake', c.h) + bar('Felicidad', 'heart', c.f) + bar('Energía', 'bolt', c.e) + bar('Limpieza', 'x_burbuja', c.l);
function fridgeHTML() {
  const p = P();
  const list = Object.entries(FOODS).filter(([k, f]) => !f.off && (!f.custom || (p.pantry[k] || 0) > 0));
  const cells = list.map(([k, f]) => { const n = p.pantry[k] || 0; return `<button class="fr-cell ${n ? '' : 'empty'}" data-act="pcFeed" data-k="${k}" aria-label="Darle ${esc(f.art)} (quedan ${n})"><img class="pixel" alt="" src="${spr(f.sprite || k, 3)}"><span class="fr-n">${n}</span></button>`; });
  while (cells.length % 5) cells.push('<span class="fr-cell blank"></span>');
  return `<div class="fridge" id="pcFridge"><div class="freezer"><span>DESPENSA</span><button class="btn sm" data-act="pcShop">Comprar comida</button></div><div class="fr-inside">${cells.join('')}</div><span class="fr-handle"></span></div>`;
}
const giftReady = () => (S.settings.gift || {}).last !== today();
A.giftReady = giftReady;
const PLACES = () => [
  ['regalo', giftReady() ? 'regalo_cerrado' : 'regalo_abierto', 'Regalo del día', giftReady()], ['crecer', 'brotecito', 'Crecer'], ['coleccion', 'maca', 'Colección'],
  ['tienda', 'gift', 'Tiendita'], ['visitas', 'casita', 'Visitas', !!(A.navDotVisits && A.navDotVisits())], ['shey', (info(P().active || 'shey') || {}).sprite || 'shey', 'Antojos']
];
const needsCare = () => { const p = P(); if (!p.active) return false; const c = care(p.active); return !c.sleep && (c.h < 30 || c.l < 25 || c.f < 25); };
A.navDot = k => k === 'more' && (giftReady() || needsCare() || !!(A.navDotVisits && A.navDotVisits()));
const stripHead = h => h.slice(h.indexOf('\n') + 1);
A.screens.rincon = () => {
  const p = P(); if (!p.active) return elegirHTML(true);
  const tab = S.pcTab || 'cuidar';
  const tabs = `<div class="seg pc-tabs"><button data-act="pcTab" data-v="cuidar" aria-pressed="${tab === 'cuidar'}">Cuidar</button><button data-act="pcTab" data-v="cuarto" aria-pressed="${tab === 'cuarto'}">Cuarto</button><button data-act="pcTab" data-v="jugar" aria-pressed="${tab === 'jugar'}">Jugar</button></div>`;
  if (tab === 'cuarto') return `${A.header('rincon', starsPill())}${tabs}${stripHead(A.screens.cuarto())}`;
  if (tab === 'jugar') return `${A.header('rincon', starsPill())}${tabs}${stripHead(A.screens.juegos())}`;
  if (S.pcDeco && room().cur === 'cuidar') return `${A.header('rincon', starsPill())}${tabs}<div class="card row pc-deco-bar"><span style="flex:1"><b>Decorando el fondo de Cuidar</b><br><span class="faint">Solo se ve aquí en Cuidar. La Sala del cuarto no cambia.</span></span><button class="btn pink" data-act="pcDecoDone">Listo</button></div><div class="pc-deco">${stripHead(A.screens.cuarto())}</div>`;
  const id = p.active, c = care(id), lv = level(id);
  checkLevelUp(); moneyMood();
  return `${A.header('rincon', starsPill())}${tabs}
<div class="pc-scene pc-sala ${c.sleep ? 'dormida' : ''}" id="pcScene"><div class="pc-room">${roomHTML(room().rooms.cuidar, { pets: [], id: 'salaRoom' })}</div><button class="pc-decor" data-act="pcDecor">${img('x_marco', 18)} Decorar</button>
<div class="pc-say" id="pcSay">${esc(moodMsg(id, c))}</div>
<div class="pc-stage" id="pcStage"><button class="pc-pet" id="pcPet" data-act="pcLove" aria-label="Mimar a ${esc(info(id).name)}">${petArt(id, 6, c.sleep ? 'sleepy' : '')}</button>${c.sleep ? `<img class="pixel pc-zz" alt="" src="${spr('zzz', 3)}">` : ''}</div>
<button class="pc-lv" data-go="crecer">${esc(info(id).name)} · nivel ${lv.L}</button>
</div>
<div class="card pc-bars" id="pcBars">${barsHTML(c)}</div>
<div class="pc-acts">
<button class="pc-act" data-act="pcBath">${img('x_burbuja', 28)}Bañar</button>
<button class="pc-act" data-act="pcSleep">${img(c.sleep ? 'star' : 'moon', 28)}${c.sleep ? 'Despertar' : 'Dormir'}</button>
<button class="pc-act" data-act="pcLove">${img('heart', 28)}Mimar</button>
<button class="pc-act" data-act="pcTab" data-v="jugar">${img('game', 28)}Jugar</button>
</div>
${fridgeHTML()}
<section class="stack"><div class="ph"><span class="pill sm">Más cositas</span><button class="btn sm" data-go="coleccion">Cambiar de mascota</button></div>
<div class="pc-places">${PLACES().map(([go, ic, n, dot]) => `<button class="pc-place" data-go="${go}">${dot ? '<span class="pc-dot"></span>' : ''}${(S.settings.navIcons || {})[go] ? A.iconHTML(S.settings.navIcons[go], 38) : `<img class="pixel" alt="" src="${spr(ic, 3)}">`}${n}</button>`).join('')}</div></section>`;
};
const decoOff = () => { if (!S.pcDeco) return; const r = room(); S.pcDeco = false; S.roomEdit = false; S.roomSel = null; r.cur = r.prevCur2 && r.rooms[r.prevCur2] && r.prevCur2 !== 'cuidar' ? r.prevCur2 : 'cuarto'; A.saveSettings(); };
ACT.pcDecor = () => { S.pcTab = 'cuidar'; S.pcDeco = true; const r = room(); if (r.cur !== 'cuidar') r.prevCur2 = r.cur; r.cur = 'cuidar'; S.roomTab = 'muebles'; S.roomSel = null; S.roomEdit = true; A.saveSettings(); A.render(); window.scrollTo(0, 0); };
ACT.pcDecoDone = () => { decoOff(); A.render(); window.scrollTo(0, 0); };
ACT.pcTab = a => { decoOff(); S.pcTab = a.dataset.v; S.roomEdit = false; A.render(); window.scrollTo(0, 0); };
A.after.rincon = el => { if ((S.pcTab === 'cuarto' || S.pcDeco) && A.after.cuarto) A.after.cuarto(el); };
// tu mascota se conecta con tu plata: si no anotas se pone triste; si cumples tu presupuesto de la semana, gana un premio
function daysSinceTx() { const real = S.tx.filter(t => !t.example && !t.recurring && !t.inst); if (!real.length) return 0; const last = real.reduce((m, t) => t.date > m ? t.date : m, ''); return Math.max(0, Math.round((A.parseYmd(today()) - A.parseYmd(last)) / 864e5)); }
A.petDaysSinceTx = daysSinceTx;
function moneyMood() {
  const p = P(); if (!p.active) return; const c = care(p.active);
  const dd = daysSinceTx(); if (dd >= 2) c.f = Math.min(c.f, Math.max(10, 60 - dd * 10));
  // premio de la semana pasada (lunes a domingo) si no se pasó del presupuesto
  const t = new Date(); const mon = addDays(t, -((t.getDay() + 6) % 7) - 7); const days = [0, 1, 2, 3, 4, 5, 6].map(i => ymd(addDays(mon, i))); const wk = days[0];
  if (p.weekPrize === wk) return; p.weekPrize = wk;
  const budget = A.budgetExpenses(false); if (!budget) return;
  const logged = new Set(S.tx.filter(x => !x.example && !x.recurring).map(x => x.date)); if (days.filter(d => logged.has(d)).length < 3) return;
  const perDay = budget / A.daysIn(A.ym(days[3])); const spent = A.spentOf(S.tx.filter(x => !x.example && days.includes(x.date)));
  if (spent <= perDay * 7) { give(10); p.pantry.cupcake = (p.pantry.cupcake || 0) + 2; c.f = clamp(c.f + 20); A.saveSettings(); setTimeout(() => toast(`¡Cumpliste tu presupuesto de la semana! ${info(p.active).name} gana 2 cupcakes y tú 10 estrellitas.`), 400); }
  else A.saveSettings();
}
A.petMoneyMood = moneyMood;
// cerrar el día también le da de cenar a tu mascota
const render0 = A.render;
A.render = (...x) => { const p = P(); const d = today(); const rec = (S.fin.dayLog || {})[d]; if (p.active && rec && rec.closed && p.aleFed !== d) { p.aleFed = d; const c = care(p.active); c.h = clamp(c.h + 25); c.f = clamp(c.f + 10); A.saveSettings(); setTimeout(() => toast(`${info(p.active).name} cenó rico al cerrar el día`), 1200); } return render0(...x); };
// tarjeta del Inicio con la mascota elegida
A.rinconCard = () => {
  const p = P(); const b = bal();
  if (!p.active) return `<button class="card row" data-go="rincon" style="gap:12px;width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer"><img class="pixel" alt="" src="${spr('gochi', 3)}" style="width:52px;height:52px"><img class="pixel" alt="" src="${spr('canela', 3)}" style="width:52px;height:52px;margin-left:-14px"><img class="pixel" alt="" src="${spr('maca', 3)}" style="width:52px;height:52px;margin-left:-14px"><div style="flex:1;min-width:0"><b>Elige tu mascota</b><div class="faint">La cuidas, decoras su cuarto y juegan juntas</div></div><span class="faint">›</span></button>`;
  const id = p.active, c = care(id); const lv = level(id);
  const worst = Math.min(c.h, c.f, c.l, c.e);
  return `<button class="card row" data-go="rincon" style="gap:12px;width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer"><img class="pixel" alt="" src="${petImgSrc(id, 3)}" style="width:56px;height:56px;${c.sleep ? 'filter:brightness(.85)' : ''}"><div style="flex:1;min-width:0"><b>${esc(info(id).name)}</b> <span class="faint">nivel ${lv.L}</span><div class="faint">${worst < 35 ? esc(moodMsg(id, c)) : `${ST(14)} ${b} · ${giftReady() ? 'tu regalo de hoy te espera' : 'está feliz'}`}</div></div>${giftReady() ? `<img class="pixel" alt="" src="${spr('regalo_cerrado', 2)}" style="width:34px">` : '<span class="faint">›</span>'}</button>`;
};
// --- acciones de cuidado (sin recargar la pantalla, para que se vean las animaciones) ---
function say(t) { const e = $('#pcSay'); if (e) e.textContent = t; }
function refreshCare() { const id = P().active; const c = care(id); const b = $('#pcBars'); if (b) b.innerHTML = barsHTML(c); const f = $('#pcFridge'); if (f) f.outerHTML = fridgeHTML(); A.saveSettings(); }
function fx(kind, src) {
  const st = $('#pcStage'), pet = $('#pcPet'); if (!st || !pet) return;
  pet.classList.remove('fx-bath', 'fx-love', 'fx-eat'); void pet.offsetWidth; pet.classList.add('fx-' + kind);
  const add = (s, cls, style) => { const i = document.createElement('img'); i.className = 'pixel pc-fx ' + cls; i.alt = ''; i.src = s; i.setAttribute('style', style); st.appendChild(i); setTimeout(() => i.remove(), 2200); };
  if (kind === 'eat') add(src, 'fx-food', '');
  if (kind === 'bath') [[20, 70, 0, 22], [55, 90, .15, 16], [90, 60, .3, 26], [110, 95, .1, 14], [35, 40, .45, 18], [75, 30, .55, 24], [100, 20, .7, 16], [10, 100, .8, 20], [60, 110, .9, 18]].forEach(([x, y, d, w]) => add(spr('x_burbuja', 3), 'fx-bub', `left:calc(50% - 80px + ${x * 1.2}px);top:${y}px;width:${w * 1.6}px;animation-delay:${d}s`));
  if (kind === 'love') { if (A.prettyHearts) A.prettyHearts(pet, { n: 7, y: .25 }); }
  setTimeout(() => pet.classList.remove('fx-' + kind), 1600);
}
ACT.pcFeed = a => {
  const p = P(), id = p.active, c = care(id), k = a.dataset.k, f = FOODS[k]; const n = p.pantry[k] || 0;
  if (c.sleep) return say(`Shh… ${info(id).name} está durmiendo.`);
  if (!n) return say('Ya no queda. Atrapa más en el minijuego o cómprala.');
  if (c.h >= 98) return say('¡Estoy llenita! Mejor más tarde.');
  p.pantry[k] = n - 1; c.h = clamp(c.h + f.gain); c.f = clamp(c.f + 4); addXp(id, 3, 'care');
  fx('eat', spr(f.sprite || k, 4)); say(c.h >= 100 ? '¡Estoy llenita! Gracias.' : `¡Ñam! Gracias por ${f.art}.`); refreshCare();
};
ACT.pcBath = () => {
  const id = P().active, c = care(id); if (c.sleep) return say(`Shh… ${info(id).name} está durmiendo.`);
  c.l = 100; c.f = clamp(c.f + 3); addXp(id, 3, 'care'); fx('bath'); say('¡Qué rico el bañito! Quedé brillante.'); refreshCare();
};
ACT.pcLove = () => {
  const id = P().active, c = care(id); const r = R(); const t = today();
  if (c.sleep) { say('Zzz… (te da un abrazo dormida)'); return; }
  c.f = clamp(c.f + 15); addXp(id, 1, 'care'); fx('love');
  if (r.lastPet !== t) { r.lastPet = t; r.pets = (r.pets || 0) + 1; toast('¡Le diste cariño! +1 estrellita'); }
  say(['¡Te quiero mucho!', 'Jiji, me haces cosquillas.', '¡Eres la mejor!', 'Más mimos, porfa.'][Math.floor(Math.random() * 4)]); refreshCare();
};
ACT.pcSleep = () => { const id = P().active, c = care(id); c.sleep = !c.sleep; c.t = Date.now(); A.saveSettings(); A.render(); };
ACT.pcShop = () => {
  const p = P();
  const tiles = () => Object.entries(FOODS).filter(([, f]) => !f.off).map(([k, f]) => `<button class="shop-tile" data-buyfood="${k}" ${bal() < f.price ? 'disabled' : ''}><img class="pixel" alt="" src="${spr(f.sprite || k, 3)}" style="width:40px"><span>${esc(f.name)}</span><em>${ST(12)} ${f.price} · tienes <b data-have="${k}">${p.pantry[k] || 0}</b></em></button>`).join('');
  openSheet('Comprar comida', `<div class="stack"><div class="row between"><span class="faint">Se guarda en la despensa.</span><span id="fsBal">${starsPill()}</span></div>
<div class="fr-shop">${tiles()}</div>
<p class="faint" style="margin:0">También te llega comida en el regalo del día.</p></div>`, sh => {
    // al comprar se actualiza solo lo que cambió (sin volver a abrir la hoja ni saltar arriba)
    sh.addEventListener('click', e => {
      const b = e.target.closest('[data-buyfood]'); if (!b || b.disabled) return; const k = b.dataset.buyfood; if (!spend(FOODS[k].price)) return;
      p.pantry[k] = (p.pantry[k] || 0) + 1; A.saveSettings(); toast(`${FOODS[k].name} a la despensa`); if (window.Sfx) window.Sfx.play('coin', true);
      const h = b.querySelector(`[data-have="${k}"]`); if (h) h.textContent = p.pantry[k];
      b.classList.remove('bought'); void b.offsetWidth; b.classList.add('bought');
      $$('[data-buyfood]', sh).forEach(x => { x.disabled = bal() < FOODS[x.dataset.buyfood].price; });
      const bl = $('#fsBal', sh); if (bl) bl.innerHTML = starsPill();
      refreshCare();
    });
  });
};
ACT.pcClose = () => { closeSheet(); A.render(); };
const _closeSheet = A.closeSheet;

// ---------------- Elegir mascota ----------------
function howTxt(pt, id) {
  if (P().owned.includes(id)) return '';
  if (pt.how === 'stars') return `${ST(12)} ${pt.price}`;
  if (pt.how === 'logro') { const a = (A.RC.ACH || []).find(x => x.id === pt.ach); return 'Logro: ' + (a ? a.name : 'especial'); }
  if (pt.how === 'raro') return 'Regalo del domingo';
  if (pt.how === 'temporada') { const se = SEASONS.find(s => s.id === pt.season); return 'Temporada' + (se ? ': ' + se.name : ''); }
  return '';
}
function canGet(pt) { return pt.how === 'free' || (pt.how === 'logro' && achOk(pt.ach)) || (pt.how === 'temporada' && inSeason(pt.season)); }
function elegirHTML(first) {
  const p = P(); const pets = allPets(); const sel = S.elegirSel && pets[S.elegirSel] ? S.elegirSel : (p.active || 'gochi'); const c = pets[sel];
  const owned = p.owned.includes(sel);
  let btn = `<button class="btn pink el-btn" data-act="elPick" data-id="${sel}">${p.active === sel ? `${esc(c.name)} ya es tu mascota` : 'Elegir a ' + esc(c.name)}</button>`;
  if (!owned) {
    if (c.how === 'stars') btn = `<button class="btn el-btn gold" data-act="elAdopt" data-id="${sel}" ${bal() < c.price ? 'disabled' : ''}>Adoptar a ${esc(c.name)} · ${c.price} estrellitas</button>`;
    else if (canGet(c)) btn = `<button class="btn el-btn gold" data-act="elAdopt" data-id="${sel}">¡Ya puedes adoptar a ${esc(c.name)}!</button>`;
    else btn = `<button class="btn el-btn gold" disabled>${esc(c.name)} todavía está bloqueada · ${esc(howTxt(c, sel))}</button>`;
  }
  return `${first ? `<div class="ph"><div class="ph-left"><span class="pill">Elige tu mascota</span></div>${starsPill()}</div>` : sub('elegir', 'coleccion', starsPill())}
<div class="card el-hero"><span class="el-big">${petArt(sel, 7)}</span><div class="el-name">${esc(c.name)}</div><div class="el-desc">${esc(c.desc)}</div></div>
<div class="card el-say">${esc(c.say)}</div>
<div class="k-lbl">TUS MASCOTAS Y LAS NUEVAS</div>
<div class="el-grid">${Object.entries(pets).map(([k, pt]) => `<button class="el-pet ${k === sel ? 'on' : ''}" data-act="elSel" data-id="${k}" aria-pressed="${k === sel}"><img class="pixel" alt="" src="${spr(pt.sprite, 3)}" style="${p.owned.includes(k) || canGet(pt) ? '' : 'filter:saturate(.5) brightness(1.05)'}">${esc(pt.name)}${p.owned.includes(k) ? '' : '<span class="el-tag">NUEVA</span>'}</button>`).join('')}</div>
${btn}
<p class="faint" style="text-align:center;margin:0">La que elijas es la que cuidas, la que vive en tu cuarto y la que juega contigo.</p>`;
}
A.screens.elegir = () => elegirHTML(false);
ACT.elSel = a => { S.elegirSel = a.dataset.id; A.render(); };
function setActive(id) {
  const p = P(); p.active = id; if (!p.since[id]) p.since[id] = today();
  if (!p.room.includes(id)) { p.room.unshift(id); p.room = p.room.slice(0, 3); }
  const sp = info(id).sprite; if (Pix.has(sp)) S.settings.mascot = 's:' + sp;
  A.saveSettings();
}
A.petSetActive = setActive;
ACT.elPick = a => { const id = a.dataset.id; const first = !P().active; setActive(id); toast(`¡${info(id).name} es tu mascota!`); S.elegirSel = null; A.go('rincon'); if (first) setTimeout(() => A.pixelHearts && A.pixelHearts(), 200); };
ACT.elAdopt = a => {
  const id = a.dataset.id, pt = allPets()[id]; const p = P(); if (p.owned.includes(id)) return;
  if (pt.how === 'stars') { if (!a.dataset.sure) { a.dataset.sure = 1; a.textContent = `¿Seguro? Toca otra vez para adoptar por ${pt.price}`; return; } if (!spend(pt.price)) return; }
  else if (!canGet(pt)) return;
  p.owned.push(id); p.since[id] = today(); setActive(id); toast(`¡Bienvenida, ${pt.name}!`); A.go('rincon');
};
A.petAdopt = id => { const p = P(); if (!p.owned.includes(id)) { p.owned.push(id); p.since[id] = today(); A.saveSettings(); } };

// ---------------- Colección ----------------
A.screens.coleccion = () => {
  const p = P(); const pets = allPets(); const all = Object.keys(pets);
  const mine = all.filter(k => p.owned.includes(k)), others = all.filter(k => !p.owned.includes(k));
  const tag = k => k === p.active ? '<span class="tag gold">La que cuidas</span>' : p.room.includes(k) ? '<span class="tag">En el cuarto</span>' : '<span class="tag" style="background:#eee5dc;color:#8a5a4a">Guardada</span>';
  return `${sub('coleccion', 'rincon', `<span class="pill sm">${mine.length} de ${all.length} mascotas</span>`)}
<div class="k-lbl">TUS MASCOTAS</div>
<div class="col-grid">${mine.map(k => `<button class="col-pet" data-act="colPet" data-id="${k}"><img class="pixel" alt="" src="${spr(pets[k].sprite, 3)}"><b>${esc(pets[k].name)}</b><span class="faint">nivel ${level(k).L}</span>${tag(k)}</button>`).join('')}</div>
${others.length ? `<div class="k-lbl">NUEVOS PARA ADOPTAR</div><div class="list">${others.map(k => { const pt = pets[k]; return `<button class="li" data-act="colNew" data-id="${k}"><span class="ic" style="width:52px;height:52px"><img class="pixel" alt="" src="${spr(pt.sprite, 3)}" style="width:48px"></span><span class="tx-main"><b>${esc(pt.name)}</b><span>${esc(pt.desc)}</span></span><span class="tag gold" style="white-space:nowrap">${howTxt(pt, k)}</span></button>`; }).join('')}</div>` : ''}
<div class="k-lbl">MUY PRONTO</div>
<div class="col-grid soon">${[0, 1, 2, 3].map(() => `<div class="col-pet"><img class="pixel" alt="" src="${spr('silueta', 3)}" style="opacity:.5"><span class="faint">¿?</span></div>`).join('')}</div>
<p class="faint" style="margin:0">Elige hasta 3 mascotas para que vivan en tu cuarto. Los demás se quedan guardados y los cambias cuando quieras.</p>`;
};
ACT.colNew = a => { S.elegirSel = a.dataset.id; A.go('elegir'); };
ACT.colPet = a => {
  const id = a.dataset.id, p = P(); const inRoom = p.room.includes(id);
  openSheet(info(id).name, `<div class="stack" style="align-items:stretch"><div style="text-align:center">${petArt(id, 6)}</div>
<button class="btn pink" data-cp="care" ${p.active === id ? 'disabled' : ''} style="justify-content:center">${p.active === id ? 'Ya es la que cuidas' : 'Cuidar a ' + esc(info(id).name)}</button>
<button class="btn" data-cp="room" style="justify-content:center">${inRoom ? 'Guardarla (sacarla del cuarto)' : 'Ponerla en el cuarto'}</button>
${A.ANCH[id] ? `<button class="btn" data-cp="dress" style="justify-content:center">Vestirla en la Tiendita</button>` : ''}
<button class="btn" data-cp="grow" style="justify-content:center">Ver cómo crece</button></div>`, sh => sh.addEventListener('click', e => {
    const b = e.target.closest('[data-cp]'); if (!b) return; const k = b.dataset.cp;
    if (k === 'care') { setActive(id); closeSheet(); A.go('rincon'); return; }
    if (k === 'room') {
      if (inRoom) { if (p.room.length <= 1) return toast('Tu cuarto necesita al menos una mascota'); p.room = p.room.filter(x => x !== id); }
      else { if (p.room.length >= 3) return toast('Ya hay 3 mascotas en el cuarto. Guarda una primero.'); p.room.push(id); }
      A.saveSettings(); closeSheet(); A.render(); return;
    }
    if (k === 'dress') { S.shopWho = id; closeSheet(); A.go('tienda'); return; }
    if (k === 'grow') { S.growId = id; closeSheet(); A.go('crecer'); }
  }));
};

// ---------------- Crecer ----------------
A.screens.crecer = () => {
  const p = P(); const id = S.growId && p.owned.includes(S.growId) ? S.growId : p.active || 'gochi'; const lv = level(id); const pt = info(id);
  const stage = (k, name, range, on, reached) => `<div class="gr-stage ${on ? 'on' : ''} ${reached ? '' : 'locked'}"><span class="gr-art">${stageArt(id, k)}</span><b>${name}</b><span class="faint">${on ? '¡Aquí está!' : range}</span></div>`;
  const maxL = Math.max(...p.owned.map(k => level(k).L));
  return `${sub('crecer')}
${p.owned.length > 1 ? `<div class="chips">${p.owned.map(k => `<button class="chip" data-act="grSel" data-id="${k}" aria-pressed="${k === id}">${esc(info(k).name)}</button>`).join('')}</div>` : ''}
<div class="card row" style="gap:14px"><span style="width:96px;flex:none">${petArt(id, 5)}</span><div style="flex:1;min-width:0" class="stack"><div class="mid" style="font-family:var(--f-display);font-size:22px">${esc(pt.name)} · nivel ${lv.L}</div><span class="prog" style="height:14px"><i style="width:${Math.round(lv.cur / lv.need * 100)}%;background:#a385e0"></i></span><div class="faint">${lv.cur} de ${lv.need} puntos para el nivel ${lv.L + 1}</div></div></div>
<div class="k-lbl">CÓMO VA CAMBIANDO</div>
<div class="gr-row">${stage('bebe', 'Chiquita', 'Nivel 1 a 4', lv.stage === 'bebe', true)}${stage('mochi', 'Grande', 'Desde el nivel 5', lv.stage === 'mochi', lv.L >= 5)}${stage('real', 'Con alitas', 'Desde el nivel 10', lv.stage === 'real', lv.L >= 10)}</div>
<div class="k-lbl">PREMIOS POR NIVEL</div>
<div class="card gr-path">${LV_PRIZES.map(([L, k, a, , t]) => { const ok = maxL >= L; return `<div class="gr-step ${ok ? 'ok' : ''}"><span class="gr-lv">${L}</span><span class="gr-ic">${img(k === 'food' ? a : k === 'stars' ? 'estrellita' : k === 'wall' ? 'casita' : k === 'floor' ? 'casita' : k === 'acc' ? 'acc_' + a : k === 'furn' ? 'x_' + a : k === 'wings' ? 'alitas' : 'brotecito', 28)}</span><span style="flex:1">${esc(t)}</span>${ok ? img('check', 18) : img('candado', 16)}</div>`; }).join('')}<p class="faint" style="margin:6px 0 0">Cuenta el nivel más alto de tus mascotas. Los premios se guardan solos.</p></div>
<div class="card stack"><b>Así gana puntos</b>
${[['list', 'Anotar un movimiento (hasta 6 al día)', '+5'], ['cupcake', 'Darle de comer o bañarla', '+3'], ['heart', 'Mimarla', '+1'], ['plataforma', 'Jugar un minijuego', '+10'], ['fuego', 'Llegar a una racha de 7 días', '+40'], ['goal', 'Cumplir una meta de ahorro', '+80']].map(([ic, t, n]) => `<div class="row" style="gap:10px">${img(ic, 26)}<span style="flex:1">${t}</span><span class="tag" style="background:#ece0fb;color:#5f4a8a">${n}</span></div>`).join('')}</div>
`;
};
function stageArt(id, k) {
  const s = spr(info(id).sprite, 4);
  if (k === 'bebe') return `<img class="pixel" alt="" src="${s}" style="width:52px;margin-top:22px">`;
  if (k === 'mochi') return `<img class="pixel" alt="" src="${s}" style="width:76px">`;
  return `<span class="gr-real"><img class="pixel gr-alas" alt="" src="${spr('alitas', 6)}"><img class="pixel" alt="" src="${s}" style="width:76px;position:relative"></span>`;
}
ACT.grSel = a => { S.growId = a.dataset.id; A.render(); };

// ---------------- Logros (antes estaban en Mis mochis) ----------------
A.screens.logros = () => {
  const s = A.rcStats(); const ACH = A.RC.ACH; const RW = (A.CFG && A.CFG.rewards) || {};
  const tab = S.rcTab || 'logros';
  return `${sub('logros', 'more', starsPill())}
<div class="grid2"><div class="card"><h3>Racha</h3><div class="mid">${s.streak} ${s.streak === 1 ? 'día' : 'días'}</div><div class="faint">Mejor racha: ${s.best}</div></div><div class="card"><h3>Estrellitas</h3><div class="mid">${ST(20)} ${bal()}</div><div class="faint">Ganas ${RW.day || 2} por cada día que anotas</div></div></div>
<div class="seg"><button data-act="rcTab" data-v="logros" aria-pressed="${tab !== 'como'}">Logros</button><button data-act="rcTab" data-v="como" aria-pressed="${tab === 'como'}">Cómo ganar</button></div>
${tab !== 'como' ? `<div class="list">${ACH.map(a => { const ok = a.ok(s); return `<div class="li" style="${ok ? '' : 'opacity:.6'}"><span class="ic" style="${ok ? 'background:#fff09a' : 'filter:grayscale(1)'}">${A.px(a.ic, 28)}</span><span class="tx-main"><b>${esc(a.name)}</b><span>${esc(a.desc)}</span></span><span class="amt">${ok ? img('check', 20) : '+' + a.prize + ' ' + ST(14)}</span></div>`; }).join('')}</div>` : `<div class="card stack">
${[['Anotar al menos un movimiento en el día', RW.day], ['Poner dinero en una meta', RW.goalTx], ['Decorar una semana del journal', RW.journalWeek], ['Cumplir una meta', RW.goalDone], ['Terminar un mes sin pasarte', RW.monthUnder], ['Resistir un antojo con tu mascota', RW.antojo], [esc(A.conMascota('Cerrar el día con {nombre}')), RW.closeDay], ['Darle cariño a tu mascota (una vez al día)', RW.pet]].map(([t, n]) => `<div class="row between"><span>${t}</span><b>+${n || 0} ${ST(14)}</b></div>`).join('')}
<div class="row between"><span>Abrir el regalo del día</span><b>sorpresa</b></div><div class="row between"><span>Jugar los minijuegos</span><b>hasta 40 al día</b></div><div class="row between"><span>Regar tu jardín de hábitos</span><b>+1 ${ST(14)} por hábito</b></div>
<p class="faint" style="margin:0">Los movimientos de ejemplo y los pagos fijos automáticos no cuentan: solo lo que anotas tú.</p></div>`}`;
};

// ---------------- Cuarto (visto desde arriba) ----------------
const RW = 144, RH = 132, WALLH = 34;
function room() {
  const s = S.settings; const r = s.room = s.room || {};
  r.owned = r.owned || ['cama', 'ventana', 'alfombra', 'cojin'];
  r.inv = r.inv || {};
  if (!r.rooms) {
    const fix = { alfombra: 'lila', piedra: 'madera' };
    r.rooms = { cuarto: { wall: WALLS[r.wall] ? r.wall : 'rosa', floor: FLOORS[r.floor] ? r.floor : (fix[r.floor] || 'madera'), items: (r.items || ['ventana', 'cama', 'alfombra', 'cojin'].map(k => ({ k }))).filter(it => FURN[it.k]).map(it => ({ u: uid(), k: it.k, x: FURN[it.k].x, y: FURN[it.k].y })) } };
    delete r.items; delete r.wall; delete r.floor; delete r.v2;
  }
  if (!r.rooms.sala) { // la sala donde cuidas a tu mascota (se puede decorar)
    const D = [['banderines', 50, 1], ['marco', 18, 8], ['ventana', 104, 6], ['sofa_lila', 4, 38], ['lampara', 38, 34], ['planta_grande', 120, 34], ['alfombra_corazon', 59, 92], ['tetera', 126, 76]].filter(([k]) => FURN[k]);
    r.rooms.sala = { wall: 'menta', floor: 'madera', items: D.map(([k, x, y]) => ({ u: uid(), k, x, y })) };
    D.forEach(([k]) => { if (!r.owned.includes(k)) r.owned.push(k); const pl = Object.values(r.rooms).reduce((n, rm) => n + rm.items.filter(i => i.k === k).length, 0); r.inv[k] = Math.max(r.inv[k] != null ? r.inv[k] : (r.owned.includes(k) ? 1 : 0), pl); });
  }
  if (!r.rooms.cuidar) { // el fondo de Cuidar: aparte de la Sala, solo se decora y se ve desde Cuidar
    const D = [['banderines', 50, 1], ['marco', 18, 8], ['ventana', 104, 6], ['sofa_lila', 4, 38], ['lampara', 38, 34], ['planta_grande', 120, 34], ['alfombra_corazon', 59, 92], ['tetera', 126, 76]].filter(([k]) => FURN[k]);
    r.rooms.cuidar = { wall: 'menta', floor: 'madera', items: D.map(([k, x, y]) => ({ u: uid(), k, x, y })) };
    D.forEach(([k]) => { if (!r.owned.includes(k)) r.owned.push(k); const pl = Object.values(r.rooms).reduce((n, rm) => n + rm.items.filter(i => i.k === k).length, 0); r.inv[k] = Math.max(r.inv[k] || 0, pl); });
  }
  if (r.cur === 'cuidar' && !(S.pcDeco && S.route === 'rincon' && (S.pcTab || 'cuidar') === 'cuidar')) { r.cur = r.prevCur2 && r.rooms[r.prevCur2] && r.prevCur2 !== 'cuidar' ? r.prevCur2 : 'cuarto'; S.pcDeco = false; S.roomEdit = false; }
  r.cur = r.rooms[r.cur] ? r.cur : 'cuarto';
  r.owned = r.owned.map(k => k === 'wall:piedra' ? 'floor:madera' : k);
  return r;
}
A.roomState = room;
const curRoom = () => { const r = room(); return r.rooms[r.cur]; };
const cnt = k => { const r = room(); return r.inv[k] != null ? r.inv[k] : (r.owned.includes(k) ? 1 : 0); };
const placedN = k => Object.values(room().rooms).reduce((n, rm) => n + rm.items.filter(i => i.k === k).length, 0);
function addInv(k, n) { const r = room(); r.inv[k] = cnt(k) + (n || 1); if (r.inv[k] > 0 && !r.owned.includes(k)) r.owned.push(k); if (r.inv[k] <= 0) { r.inv[k] = 0; r.owned = r.owned.filter(x => x !== k); } }
A.furnFree = k => cnt(k) - placedN(k);
A.furnTake = k => { if (cnt(k) - placedN(k) < 1) return false; addInv(k, -1); return true; };
const furnSprite = k => FURN[k].sprite || 'x_' + k;
A.furnSprite = furnSprite;
const maxLevel = () => Math.max(1, ...P().owned.map(k => level(k).L));
function furnLock(k) {
  const f = FURN[k];
  if (cnt(k)) return null;
  if (f.lvl && maxLevel() < f.lvl) return 'Nivel ' + f.lvl;
  if (f.season && !inSeason(f.season)) { const se = allSeasons().find(s => s.id === f.season); return se ? se.name : 'Temporada'; }
  if (f.how === 'raro') return 'Regalo raro';
  if (f.how === 'logro' && !achOk(f.ach)) return 'Logro';
  return null;
}
function dayPart() { const h = new Date().getHours() + new Date().getMinutes() / 60; return h >= 19 || h < 6 ? 'noche' : h >= 17 ? 'tarde' : 'dia'; }
A.dayPart = dayPart;
function boardPhotos() { return ((S.settings.board || {}).items || []).filter(x => x.img).map(x => x.img); }
// dónde se pone cada mascota según los muebles que hay
function petSpots(rm, pets, part, guestIdx) {
  const out = []; const used = new Set(); const items = rm.items.filter(i => FURN[i.k]);
  const find = pred => items.find(i => pred(FURN[i.k]) && !used.has(i.u));
  const PS = 22;
  pets.forEach((k, idx) => { const isGuest = idx === guestIdx;
    let spot = null;
    if (part === 'noche' && !isGuest) { const b = find(f => f.bed); if (b) { used.add(b.u); const f = FURN[b.k]; spot = { x: b.x + f.w / 2 - PS / 2, y: b.y + 10, z: b.y + f.h + 1, sleep: true }; } }
    if (!spot && part !== 'noche') {
      const order = idx === 0 ? ['piano', 'table', 'seat'] : idx === 1 ? ['table', 'seat', 'piano'] : ['seat', 'piano', 'table'];
      for (const kind of order) {
        const it = find(f => f[kind]); if (!it) continue; used.add(it.u); const f = FURN[it.k];
        if (kind === 'piano') spot = { x: it.x + f.w / 2 - PS / 2, y: it.y + f.h - 8, z: it.y + f.h + 2, notes: true };
        if (kind === 'table') spot = { x: it.x - PS + 6, y: it.y + f.h - PS + 2, z: it.y + f.h, eat: { x: it.x + f.w / 2 - 4, y: it.y + 2 } };
        if (kind === 'seat') spot = { x: it.x + f.w / 2 - PS / 2 + f.seat[0], y: it.y - PS / 2 + f.seat[1], z: it.y + f.h + 1 };
        break;
      }
    }
    if (!spot) { const free = [[60, 84], [86, 88], [34, 92], [100, 100], [20, 104]][idx % 5]; spot = { x: free[0], y: free[1], z: free[1] + PS, sleep: part === 'noche' && !isGuest }; }
    out.push(Object.assign({ k }, spot));
  });
  return out;
}
const pct = (v, t) => (v / t * 100).toFixed(3) + '%';
// dibuja una mascota con sus accesorios (los mismos cálculos que en la Tiendita)
function dressed(id, eq, sc) {
  const an = A.ANCH[id]; const base = `<img class="pixel" alt="" src="${petImgSrc(id, sc || 4)}" draggable="false">`;
  if (!an || !eq) return base;
  return base + ['neck', 'head', 'face'].map(slot => {
    const a = A.ACC[eq[slot]]; if (!a) return '';
    return `<img class="pixel rm-acc" alt="" src="${Pix.sprite('acc_' + eq[slot], sc || 4)}" draggable="false" style="${A.accStyle(A.accPlace(an, a, slot, eq[slot], eq))}">`;
  }).join('');
}
A.petDressed = dressed;
function roomHTML(rmIn, opts) {
  opts = opts || {}; const edit = opts.edit; const rm = Object.assign({ wall: 'rosa', floor: 'madera', items: [] }, rmIn || {});
  const part = opts.part || dayPart(); const night = part === 'noche';
  const photos = opts.photos || boardPhotos(); let ph = 0;
  const items = rm.items.filter(it => FURN[it.k]).map(it => ({ it, f: FURN[it.k] })).sort((a, b) => (a.f.flat ? 0 : a.f.wall ? 1 : 2) - (b.f.flat ? 0 : b.f.wall ? 1 : 2) || (a.it.y + a.f.h) - (b.it.y + b.f.h));
  // cada mascota con su ropa: la tuya con lo que le pusiste, la de tu amiga con lo que le puso ella
  const myEq = (S.settings.rincon || {}).equip || {};
  const list = (opts.pets || P().room).map(x => typeof x === 'string' ? { k: x, eq: opts.equip ? opts.equip[x] : myEq[x] } : x).filter(x => allPets()[x.k]);
  if (opts.guest && allPets()[opts.guest]) list.push({ k: opts.guest, eq: myEq[opts.guest], guest: true });
  const pets = list.map(x => x.k);
  const spots = petSpots(rm, pets, part, list.findIndex(x => x.guest));
  const zOf = (it, f) => f.flat ? 1 : f.wall ? 2 : 10 + Math.round(it.y + f.h);
  let lit = 0;
  const html = items.map(({ it, f }) => {
    const sp = night && ['ventana', 'ventana_lila', 'ventana_redonda'].includes(it.k) ? 'x_' + it.k + '_noche' : f.winSprite || furnSprite(it.k);
    let extra = '';
    if (f.win) { const [a, b, c2, d2] = f.win; const ax = it.fl ? 1 - c2 : a; extra += `<span class="rm-sky t-${part}" style="left:${pct(it.x + ax * f.w, RW)};top:${pct(it.y + b * f.h, RH)};width:${pct((c2 - a) * f.w, RW)};height:${pct((d2 - b) * f.h, RH)};z-index:${zOf(it, f)};background-image:url('${Pix.sprite('x_paisaje_' + part, 3)}')">${night ? '<i></i><i></i><i></i>' : ''}</span>`; }
    if (f.photo && photos.length) { const src = photos[ph++ % photos.length]; extra = `<span class="rm-photo" style="left:${pct(it.x + 2, RW)};top:${pct(it.y + 2, RH)};width:${pct(12, RW)};height:${pct(10, RH)};z-index:${zOf(it, f) + 1};background-image:url('${esc(src)}')"></span>`; }
    const wx = A.weather && A.weather(); if (wx && (f.win || /ventana/.test(it.k)) && f.wall && wx.kind !== 'sol') extra += `<span class="rm-wx ${wx.kind}" style="left:${pct(it.x + f.w * .16, RW)};top:${pct(it.y + f.h * .14, RH)};width:${pct(f.w * .68, RW)};height:${pct(f.h * .6, RH)};z-index:${zOf(it, f) + 1}"></span>`;
    const gx = f.glow ? (it.fl ? f.w - f.glow[0] : f.glow[0]) : 0; if (night && f.glow) lit++;
    const glow = night && f.glow ? `<span class="rm-glow" style="left:${pct(it.x + gx - f.glow[2], RW)};top:${pct(it.y + f.glow[1] - f.glow[2], RH)};width:${pct(f.glow[2] * 2, RW)};animation-delay:-${(it.x % 7) * .4}s"></span>` : '';
    return `<img class="pixel rm-it ${opts.sel === it.u ? 'sel' : ''}" alt="${esc(f.name)}" data-u="${it.u}" draggable="false" src="${Pix.sprite(sp, 3)}" style="left:${pct(it.x, RW)};top:${pct(it.y, RH)};width:${pct(f.w, RW)};z-index:${zOf(it, f)};${it.fl ? 'transform:scaleX(-1);' : ''}">${extra}${glow}`;
  }).join('');
  const petHtml = spots.map((s, i) => `<span class="rm-pet ${s.sleep ? 'sleep' : ''} ${list[i].guest ? 'guest' : ''}" data-pk="${esc(s.k)}" aria-label="${esc(info(s.k).name)}" style="left:${pct(s.x, RW)};top:${pct(s.y, RH)};z-index:${10 + Math.round(s.z)};animation-delay:-${i * .6}s">${dressed(s.k, list[i].eq, 4)}</span>`
    + (s.sleep ? `<img class="pixel rm-zz" alt="" src="${spr('zzz', 2)}" style="left:${pct(s.x + 16, RW)};top:${pct(s.y - 8, RH)}">` : '')
    + (s.notes ? `<img class="pixel rm-note" alt="" src="${spr('music', 2)}" style="left:${pct(s.x + 18, RW)};top:${pct(s.y - 10, RH)}"><img class="pixel rm-note b" alt="" src="${spr('music', 2)}" style="left:${pct(s.x - 4, RW)};top:${pct(s.y - 6, RH)}">` : '')
    + (s.eat ? `<img class="pixel rm-food" alt="" src="${spr(['cupcake', 'dona', 'fresa', 'galleta'][i % 4], 2)}" style="left:${pct(s.eat.x, RW)};top:${pct(s.eat.y, RH)};z-index:${10 + Math.round(s.z) + 1}">` : '')).join('');
  return `<div class="room-frame"><div class="room ${edit ? 'editing' : ''} t-${part}" id="${opts.id || 'roomBox'}">
<img class="pixel rm-wall" alt="" src="${Pix.sprite('x_pared_' + (WALLS[rm.wall] ? rm.wall : 'rosa'), 3)}"><img class="pixel rm-floor" alt="" src="${Pix.sprite('x_piso_' + (FLOORS[rm.floor] ? rm.floor : 'madera'), 3)}">
${html}${petHtml}<span class="rm-shade" style="--sh:${Math.max(.12, .3 - lit * .05).toFixed(2)}"></span>
${opts.inner || ''}</div><span class="room-door"></span></div>`;
}
A.roomHTML = (rm, opts) => roomHTML(rm, opts);
A.PAGES.cuarto = 'Mi cuarto';
A.screens.cuarto = () => {
  const r = room(); const rm = curRoom(); const tab = S.roomTab || 'muebles'; const edit = !!S.roomEdit; const fc = S.furnCat || 'todo';
  const tile = k => {
    const f = FURN[k]; const n = cnt(k), used = placedN(k), free = n - used, lock = furnLock(k);
    if (f.off && !n) return '';
    const lbl = free > 0 ? `<em style="color:#3f7a2f">Poner${n > 1 ? ' · tienes ' + free : ''}</em>` : n ? `<em>Puesto · comprar otro</em><span class="lock" style="background:#fff09a">${ST(12)} ${f.price || 0}</span>` : lock ? `<em>${esc(lock)}</em>` : `<span class="lock" style="background:#fff09a">${ST(12)} ${f.price || 0}</span><em>Comprar</em>`;
    return `<button class="shop-tile ${used ? 'on' : ''}" data-act="rmFurn" data-k="${k}" ${!n && lock ? 'disabled' : ''}><img class="pixel" alt="" src="${Pix.sprite(furnSprite(k), 2)}" style="max-width:${Math.min(68, f.w * 2)}px;max-height:56px">${lbl}<span>${esc(f.name)}</span></button>`;
  };
  const sty = (kind, k, n, price) => { const own = !price || r.owned.includes(kind + ':' + k); const on = rm[kind] === k; return `<button class="shop-tile ${on ? 'on' : ''}" data-act="rmStyle" data-kind="${kind}" data-k="${k}" data-p="${price}"><img class="pixel" alt="" src="${Pix.sprite('x_' + (kind === 'wall' ? 'pared_' : 'piso_') + k, 1)}" style="width:72px;height:34px;object-fit:cover;object-position:top;border-radius:6px">${on ? '<em style="color:#3f7a2f">Puesto</em>' : own ? '<em>Poner</em>' : `<span class="lock" style="background:#fff09a">${ST(12)} ${price}</span><em>Comprar</em>`}<span>${esc(n)}</span></button>`; };
  const keys = Object.keys(FURN).filter(k => fc === 'todo' || FURN[k].cat === fc || (fc === 'deco' && FURN[k].custom && !FURN[k].wall) || (fc === 'pared' && FURN[k].custom && FURN[k].wall));
  const probBar = r.cur === '__probador' ? `<div class="card stack" style="background:#fff7d6"><b>Estás decorando el probador de la Tiendita</b><span class="faint">Solo tú lo ves aquí. Pon, mueve o quita cosas, y cambia pared y piso. Al guardar, les aparece a todas.</span><div class="row" style="gap:8px"><button class="btn" data-act="probExit" style="flex:1;justify-content:center">Salir sin guardar</button><button class="btn pink" data-act="probSave" style="flex:1;justify-content:center">Guardar para todas</button></div></div>` : '';
  return `${sub('cuarto', 'rincon', starsPill())}${probBar}
<div class="rm-rooms">${Object.keys(r.rooms).filter(k => k !== 'cuidar').map(k => { const ro = ROOMS[k] || {}; return `<button class="rm-door" data-act="rmRoom" data-k="${k}" aria-pressed="${r.cur === k}"><span class="rm-door-art" style="background-image:url(${Pix.sprite('x_piso_' + (ro.floor || 'madera'), 1)})"><img class="pixel" alt="" src="${Pix.sprite('x_' + (ro.icon || 'cama'), 2)}"></span><span class="rm-door-t">${esc(k === '__probador' ? 'Probador' : (ro.short || ro.name || k))}</span></button>`; }).join('')}${Object.keys(r.rooms).length < Object.keys(ROOMS).length ? `<button class="rm-door add" data-act="rmTab" data-v="cuartos"><span class="rm-door-art"><b>+</b></span><span class="rm-door-t">Más</span></button>` : ''}</div>
${roomHTML(rm, { edit, sel: S.roomSel, pets: r.cur === 'cuidar' ? [] : undefined, inner: `<button class="btn sm rm-editbtn" data-act="rmEdit">${edit ? 'Listo' : 'Mover cosas'}</button>${edit && S.roomSel ? '<span class="rm-tools"><button class="btn sm" data-act="rmFlip">Voltear</button><button class="btn sm danger" data-act="rmRemove">Guardar</button></span>' : ''}` })}
${edit ? '<p class="faint" style="margin:0;text-align:center">Arrastra los muebles. Toca uno para voltearlo o guardarlo.</p>' : `<p class="faint" style="margin:0;text-align:center">${{ dia: 'Es de día', tarde: 'Está atardeciendo', noche: 'Es de noche: tus mascotas se van a dormir' }[dayPart()]}${A.weather && A.weather() ? ` · afuera ${{ sol: 'está despejado', nubes: 'está nublado', niebla: 'hay neblina', lluvia: 'llueve', nieve: 'nieva', tormenta: 'hay tormenta' }[A.weather().kind] || ''}, ${A.weather().temp}°` : ''}</p>`}
<div class="seg"><button data-act="rmTab" data-v="muebles" aria-pressed="${tab === 'muebles'}">Muebles</button><button data-act="rmTab" data-v="paredes" aria-pressed="${tab === 'paredes'}">Pared y piso</button><button data-act="rmTab" data-v="cuartos" aria-pressed="${tab === 'cuartos'}">Cuartos</button><button data-go="tienda">Ropa</button></div>
${tab === 'muebles' ? `<div class="chips">${FCATS.map(([k, n]) => `<button class="chip" data-act="rmCat" data-v="${k}" aria-pressed="${fc === k}">${n}</button>`).join('')}</div><div class="shop-grid">${keys.map(tile).join('')}</div>`
  : tab === 'paredes' ? `<div class="k-lbl">PARED</div><div class="shop-grid">${Object.entries(WALLS).map(([k, [n, pr]]) => sty('wall', k, n, pr)).join('')}</div><div class="k-lbl">PISO</div><div class="shop-grid">${Object.entries(FLOORS).map(([k, [n, pr]]) => sty('floor', k, n, pr)).join('')}</div>`
  : `<div class="list">${Object.entries(ROOMS).map(([k, ro]) => `<div class="li"><span class="ic" style="width:70px;height:48px;border-radius:10px;overflow:hidden"><img class="pixel" alt="" src="${Pix.sprite('x_piso_' + ro.floor, 1)}" style="width:70px;height:48px;object-fit:cover"></span><span class="tx-main"><b>${esc(ro.name)}</b><span>${ro.gift ? 'Viene con ' + ro.gift.map(g => esc(FURN[g].name.toLowerCase())).join(' y ') : 'Tu cuarto de siempre'}</span></span>${r.rooms[k] ? `<button class="btn sm" data-act="rmRoom" data-k="${k}">${r.cur === k ? 'Aquí estás' : 'Ir'}</button>` : `<button class="btn sm pink" data-act="rmBuyRoom" data-k="${k}" ${bal() < ro.price ? 'disabled' : ''}>${ST(12)} ${ro.price}</button>`}</div>`).join('')}</div>`}
<p class="faint" style="margin:0">Aquí viven ${P().room.map(k => esc(info(k).name)).join(', ')}. Los cambias en Colección. Los marcos muestran las fotos de tu tablero de sueños.</p>`;
};
ACT.rmTab = a => { S.roomTab = a.dataset.v; A.render(); };
ACT.rmCat = a => { S.furnCat = a.dataset.v; A.render(); };
ACT.rmRoom = a => { room().cur = a.dataset.k; S.roomSel = null; A.saveSettings(); A.render(); };
ACT.rmBuyRoom = a => {
  const k = a.dataset.k, ro = ROOMS[k], r = room(); if (r.rooms[k]) return;
  if (!a.dataset.sure) { a.dataset.sure = 1; a.textContent = `¿Comprar por ${ro.price}?`; return; }
  if (!spend(ro.price)) return;
  r.rooms[k] = { wall: ro.wall, floor: ro.floor, items: [] }; r.owned.push('wall:' + ro.wall, 'floor:' + ro.floor);
  (ro.gift || []).forEach(g => { addInv(g, 1); r.rooms[k].items.push({ u: uid(), k: g, x: FURN[g].x, y: FURN[g].y }); });
  r.cur = k; S.roomTab = 'muebles'; A.saveSettings(); toast(`¡${ro.name} es tuya!`); A.render();
};
ACT.rmEdit = () => { if (S.roomEdit) A.saveSettings(); S.roomEdit = !S.roomEdit; S.roomSel = null; A.render(); };
ACT.rmRemove = () => { const rm = curRoom(); rm.items = rm.items.filter(i => i.u !== S.roomSel); S.roomSel = null; A.saveSettings(); A.render(); };
ACT.rmFlip = () => { const it = curRoom().items.find(i => i.u === S.roomSel); if (it) { it.fl = !it.fl; A.saveSettings(); A.render(); } };
function placeFurn(k) { const f = FURN[k]; if (!f || cnt(k) - placedN(k) < 1) return false; const rm = curRoom(); const n = rm.items.filter(i => i.k === k).length; rm.items.push({ u: uid(), k, x: Math.min(RW - f.w, f.x + n * 6), y: Math.min(RH - f.h, f.y + n * 4) }); return true; }
A.placeFurn = placeFurn;
A.giveFurn = (k, n) => addInv(k, n || 1);
// ---- Probador de la Tiendita: lo decora la dueña desde el admin y lo ven todas ----
const PROB_DEF = () => ({ wall: 'rosa', floor: 'madera', items: [['banderines', 50, 1], ['espejo_grande', 8, 44], ['ropero_abierto', 96, 40], ['planta', 46, 70], ['alfombra_corazon', 59, 98]].filter(([k]) => FURN[k]).map(([k, x, y]) => ({ u: uid(), k, x, y })) });
const probLayout = () => (A.CFG && A.CFG.probador) || PROB_DEF();
A.probadorHTML = () => roomHTML(probLayout(), { pets: [], part: 'dia', id: 'probRoom' });
ACT.probEdit = () => { if (!Store.isOwner) return; const r = room(); r.rooms.__probador = JSON.parse(JSON.stringify(probLayout())); r.rooms.__probador.items.forEach(it => it.u = it.u || uid()); r.prevCur = r.cur; r.cur = '__probador'; S.roomEdit = true; S.roomTab = 'muebles'; A.go('cuarto'); };
ACT.probSave = async () => { const r = room(); const rm = r.rooms.__probador; if (!rm) return; A.CFG.probador = JSON.parse(JSON.stringify(rm)); delete r.rooms.__probador; r.cur = r.prevCur && r.rooms[r.prevCur] ? r.prevCur : 'cuarto'; S.roomEdit = false; A.saveSettings(); try { await Store.saveConfig(A.CFG); toast('Probador guardado. Ya lo ven todas.'); } catch (e) { toast('No se pudo guardar. Revisa tu conexión.'); } A.go('tienda'); };
ACT.probExit = () => { const r = room(); delete r.rooms.__probador; r.cur = r.prevCur && r.rooms[r.prevCur] ? r.prevCur : 'cuarto'; S.roomEdit = false; A.saveSettings(); A.go('tienda'); };
ACT.rmFurn = a => {
  const k = a.dataset.k, f = FURN[k];
  if (room().cur === '__probador') { const rm = curRoom(); rm.items.push({ u: uid(), k, x: Math.min(RW - f.w, f.x), y: Math.min(RH - f.h, f.y) }); A.saveSettings(); A.render(); return; }
  if (cnt(k) - placedN(k) < 1) {
    if (cnt(k) === 0 && furnLock(k)) return;
    if (f.how === 'raro' || f.lvl && !f.price) return toast('Ese mueble no se compra');
    const price = f.price || 0;
    if (price) { if (!a.dataset.sure) { a.dataset.sure = 1; const e = a.querySelector('em'); if (e) e.textContent = `¿Comprar por ${price}?`; return; } if (!spend(price)) return; }
    addInv(k, 1); toast(`¡${f.name} para tu cuarto!`);
  }
  placeFurn(k); A.saveSettings(); A.render();
};
ACT.rmStyle = a => {
  const kind = a.dataset.kind, k = a.dataset.k, price = +a.dataset.p, r = room(); const key = kind + ':' + k;
  if (price && !r.owned.includes(key)) { if (!a.dataset.sure) { a.dataset.sure = 1; const e = a.querySelector('em'); if (e) e.textContent = `¿Comprar por ${price}?`; return; } if (!spend(price)) return; r.owned.push(key); }
  curRoom()[kind] = k; A.saveSettings(); A.render();
};
A.after.cuarto = el => {
  const box = el.querySelector('#roomBox'); if (!box || !S.roomEdit) return;
  let drag = null;
  box.addEventListener('pointerdown', e => {
    const t = e.target.closest('.rm-it'); if (!t) return; e.preventDefault();
    const it = curRoom().items.find(i => i.u === t.dataset.u); if (!it) return;
    const rc = box.getBoundingClientRect(); drag = { t, it, sx: e.clientX, sy: e.clientY, ox: it.x, oy: it.y, k: RW / rc.width, moved: false };
    try { t.setPointerCapture(e.pointerId); } catch (er) { } $$('.rm-it.sel', box).forEach(x => x.classList.remove('sel')); t.classList.add('sel');
  });
  box.addEventListener('pointermove', e => {
    if (!drag) return; const f = FURN[drag.it.k];
    const dx = (e.clientX - drag.sx) * drag.k, dy = (e.clientY - drag.sy) * drag.k; if (Math.abs(dx) + Math.abs(dy) > 1) drag.moved = true;
    drag.it.x = Math.round(Math.max(0, Math.min(RW - f.w, drag.ox + dx)));
    drag.it.y = Math.round(f.wall ? Math.max(0, Math.min(WALLH - f.h + 4, drag.oy + dy)) : Math.max(WALLH - f.h + 6, Math.min(RH - f.h, drag.oy + dy)));
    drag.t.style.left = pct(drag.it.x, RW); drag.t.style.top = pct(drag.it.y, RH); drag.t.style.zIndex = f.flat ? 1 : f.wall ? 2 : 10 + drag.it.y + f.h;
  });
  const end = () => { if (!drag) return; const u = drag.it.u; drag = null; S.roomSel = u; A.saveSettings(); A.render(); };
  box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
};
// ---------------- Regalo del día ----------------
function weekDays() { const t = new Date(); const dow = (t.getDay() + 6) % 7; const mon = addDays(t, -dow); return [0, 1, 2, 3, 4, 5, 6].map(i => ymd(addDays(mon, i))); }
function G() { const g = S.settings.gift = S.settings.gift || {}; g.opened = (g.opened || []).filter(d => d >= ymd(addDays(new Date(), -14))); return g; }
function rollGift() {
  const p = P(), r = room(); const wk = weekDays(); const g = G(); const t = today();
  const big = t === wk[6] && wk.slice(0, 6).every(d => g.opened.includes(d));
  if (big) {
    if (!p.owned.includes('gela') && !goneOf('pets').includes('gela')) return { kind: 'pet', id: 'gela', name: 'Gela', src: spr('gela', 5), big };
    if (!cnt('hongo')) return { kind: 'furn', id: 'hongo', name: FURN.hongo.name, src: Pix.sprite('x_hongo', 4), stars: 10, big };
    const rareAcc = Object.entries(A.ACC).find(([k, a]) => a.raro && !(R().owned || []).includes('acc:' + k));
    if (rareAcc) return { kind: 'acc', id: rareAcc[0], name: rareAcc[1].name, src: spr('acc_' + rareAcc[0], 6), big };
    return { kind: 'stars', n: 50, name: '50 estrellitas', src: spr('estrellita', 6), big };
  }
  const x = Math.random();
  if (x < .42) { const n = 5 + Math.floor(Math.random() * 11); return { kind: 'stars', n, name: n + ' estrellitas', src: spr('estrellita', 6) }; }
  if (x < .80) { const ks = Object.keys(FOODS).filter(k => !FOODS[k].off); const k = ks[Math.floor(Math.random() * ks.length)]; const n = 2 + Math.floor(Math.random() * 2); return { kind: 'food', id: k, n, name: `${n} × ${FOODS[k].name}`, src: spr(FOODS[k].sprite || k, 6), stars: 3 }; }
  if (x < .95) { const ks = Object.keys(FURN).filter(k => !cnt(k) && !furnLock(k) && FURN[k].price && FURN[k].price <= 40); if (ks.length) { const k = ks[Math.floor(Math.random() * ks.length)]; return { kind: 'furn', id: k, name: FURN[k].name, src: Pix.sprite(furnSprite(k), 4), stars: 5 }; } }
  const acc = Object.entries(A.ACC).filter(([k, a]) => !a.plus && !a.off && !a.season && a.price <= 20 && !(R().owned || []).includes('acc:' + k));
  if (acc.length) { const [k, a] = acc[Math.floor(Math.random() * acc.length)]; return { kind: 'acc', id: k, name: a.name, src: spr('acc_' + k, 6), stars: 5 }; }
  return { kind: 'stars', n: 12, name: '12 estrellitas', src: spr('estrellita', 6) };
}
function applyGift(w) {
  const p = P(), r = room();
  if (w.kind === 'stars') give(w.n);
  if (w.kind === 'food') { p.pantry[w.id] = (p.pantry[w.id] || 0) + w.n; }
  if (w.kind === 'furn') addInv(w.id, 1);
  if (w.kind === 'acc') { const ro = R(); ro.owned = (ro.owned || []).concat('acc:' + w.id); seasonGate(); }
  if (w.kind === 'pet') { if (!p.owned.includes(w.id)) { p.owned.push(w.id); p.since[w.id] = today(); } }
  if (w.stars) give(w.stars);
}
const twinkles = () => [[30, 0, 18, 0], [140, 0, 14, -2], [250, 0, 20, -4], [310, 0, 16, -1], [80, 0, 14, -3.2], [200, 0, 12, -5]].map(([x, y, w, d]) => `<img class="pixel rg-fall" alt="" src="${spr('estrellita', 3)}" style="left:${x / 360 * 100}%;width:${w}px;animation-delay:${d}s">`).join('') + [[10, 18, 26, 0], [82, 30, 20, .5], [22, 62, 16, 1], [70, 70, 22, 1.3]].map(([x, y, w, d]) => `<img class="pixel rg-spark" alt="" src="${spr('destello', 3)}" style="left:${x}%;top:${y}%;width:${w}px;animation-delay:${d}s">`).join('');
A.screens.regalo = () => {
  const g = G(); const t = today(); const wk = weekDays(); const ready = g.last !== t; const w = S.giftShown;
  const L = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  return `${sub('regalo', 'rincon', starsPill())}
<div class="rg-stage ${w ? 'open' : ''}" id="rgStage">${twinkles()}<div class="rg-halo"></div>
${w ? `<div class="rg-burst"></div><img class="pixel rg-rays" alt="" src="${spr('destello', 8)}">
<div class="rg-prize"><img class="pixel" alt="" src="${w.src}" style="width:${w.kind === 'furn' ? 96 : 104}px"><div class="rg-card"><div class="rg-k">${w.big ? '¡REGALO GRANDE!' : '¡TE TOCÓ!'}</div><b>${esc(w.name)}</b>${w.stars ? `<div class="row" style="justify-content:center;gap:4px;font-weight:800">y +${w.stars} ${ST(16)}</div>` : ''}</div></div>
<img class="pixel rg-box" alt="Regalo abierto" src="${spr('regalo_abierto', 8)}">`
    : ready ? `<div class="rg-title">Tu regalo de hoy te espera</div><button class="rg-btn" data-act="rgOpen" aria-label="Abrir el regalo"><img class="pixel rg-box shake" alt="" src="${spr('regalo_cerrado', 8)}"></button><div class="rg-hint">Toca la cajita para abrirla</div>`
      : `<div class="rg-title">Ya abriste el regalo de hoy</div><img class="pixel rg-box" alt="" src="${spr('regalo_abierto', 8)}" style="opacity:.85"><div class="rg-hint">Vuelve mañana por otro</div>`}
</div>
${w ? `<button class="btn pink" data-act="rgDone" style="justify-content:center;padding:12px">${w.kind === 'furn' ? 'Ponerla en el cuarto' : w.kind === 'food' ? 'Ver la despensa' : w.kind === 'acc' ? 'Probárselo en la Tiendita' : w.kind === 'pet' ? `Conocer a ${esc(w.name)}` : '¡Gracias!'}</button>` : ''}
<div class="stack"><b>Tu semana de regalos</b><div class="rg-week">${wk.map((d, i) => { const op = g.opened.includes(d); return `<div class="rg-day ${d === t ? 'hoy' : ''} ${i === 6 ? 'dom' : ''} ${op ? 'ok' : ''}">${L[i]}<img class="pixel" alt="" src="${spr(op ? 'check' : i === 6 ? 'regalo_cerrado' : 'gift', 3)}"></div>`; }).join('')}</div>
<p class="faint" style="margin:0">Si abres el regalo de lunes a sábado, el domingo te toca un regalo grande: una mascota rara, un mueble raro o algo especial.</p></div>`;
};
ACT.rgOpen = () => {
  const g = G(); const t = today(); if (g.last === t) return;
  const w = rollGift(); applyGift(w); g.last = t; if (!g.opened.includes(t)) g.opened.push(t); A.saveSettings();
  const box = $('.rg-box'); if (box) { box.classList.remove('shake'); box.classList.add('pop'); }
  setTimeout(() => { S.giftShown = w; A.render(); }, 650);
};
ACT.rgDone = () => {
  const w = S.giftShown; S.giftShown = null; if (!w) return A.render();
  if (w.kind === 'furn') { placeFurn(w.id); A.saveSettings(); S.pcTab = 'cuarto'; A.go('rincon'); }
  else if (w.kind === 'food') A.go('rincon');
  else if (w.kind === 'acc') { S.shopSec = A.ACC[w.id].slot; A.go('tienda'); }
  else if (w.kind === 'pet') { setActive(w.id); A.go('rincon'); }
  else A.go('rincon');
};

// ---------------- Admin: crear mascotas, muebles, ropa, comida, paredes, pisos, stickers e íconos ----------------
const KINDS = { pets: ['Mascota', 20, 20], furn: ['Mueble', 24, 24], clothes: ['Ropa', 12, 8], food: ['Comida', 16, 16], walls: ['Pared', 16, 16], floors: ['Piso', 16, 16], stickers: ['Sticker', 24, 24], icons: ['Ícono', 16, 16], chars: ['Personaje', 20, 20], boxes: ['Cajita sorpresa', 14, 16] };
const KIND_NEW = { pets: 'Nueva mascota', furn: 'Nuevo mueble', clothes: 'Nueva ropa', food: 'Nueva comida', walls: 'Nueva pared', floors: 'Nuevo piso', stickers: 'Nuevo sticker', icons: 'Nuevo ícono', chars: 'Nuevo personaje del juego', boxes: 'Nueva cajita sorpresa' };
const KIND_PL = { pets: 'Mascotas', furn: 'Muebles', clothes: 'Ropa', food: 'Comidas', walls: 'Paredes', floors: 'Pisos', stickers: 'Stickers', icons: 'Íconos', chars: 'Personajes de Cruzar la calle', boxes: 'Cajitas sorpresa' };
const KIND_SPR = { pets: 'cp_', furn: 'cf_', clothes: 'acc_cc_', food: 'cfo_', walls: 'x_pared_cw_', floors: 'x_piso_cl_', stickers: 'cs_', icons: 'ci_', chars: 'cg_', boxes: 'cbx_' };
const PALK = Object.keys(Pix.PAL);
const BASE_PAL = PALK.map(k => Pix.PAL[k]);
function blankMap(w, h) { return Array.from({ length: h }, () => '.'.repeat(w)); }
let ed = null; // borrador del editor
let edImg = null; // la imagen subida, para volver a pixelarla
function toPalMode(e) { // los dibujos viejos (con letras de colores) pasan a colores propios
  if (e.pal) return;
  e.pal = BASE_PAL.slice(); e.map = e.map.map(r => [...r].map(ch => ch === '.' ? '.' : Math.max(0, PALK.indexOf(ch)).toString(36)).join(''));
}
function newDraft(kind, item) {
  const [, w, h] = KINDS[kind];
  ed = Object.assign({ kind, id: null, name: '', desc: '', how: kind === 'chars' ? 'gacha' : 'stars', rare: 1, price: kind === 'chars' ? 60 : kind === 'pets' ? 100 : kind === 'food' ? 3 : 20, gain: 20, slot: 'head', season: 'halloween', ach: 's7', wall: false, w, h, map: blankMap(w, h), dx: 0, dy: 0 }, item ? JSON.parse(JSON.stringify(item)) : {}, { kind });
  if (item) ed.id = item.id;
  if (typeof ed.pal === 'string') ed.pal = ed.pal.split(',');
  toPalMode(ed);
  ed.color = ed.color && ed.color !== 'P' ? ed.color : String(PALK.indexOf('P').toString(36));
  ed.tool = 'pen'; ed.hist = [];
  if (kind === 'furn' && !ed.dw) ed.dw = Math.min(40, Math.max(10, ed.w));
  if (kind === 'boxes' && !item) { ed.price = 30; ed.items = []; if (A.boxPreset) A.boxPreset(ed, 0); }
  if (kind === 'clothes' && !ed.dw) ed.dw = ed.w + 2;
  ed.tryPet = ed.tryPet || A.petActive && A.petActive() || 'gochi';
  edImg = null; ed.mode = null;
}
const sprOf = (kind, id) => KIND_SPR[kind] + id;
A.catEd = () => ed; A.catEdRedraw = () => { edPaintCanvas(); const pv = $('#edPrev'); if (pv) { Pix.define('__edprev', { raw: ed.map, pal: ed.pal.join(',') }); pv.src = Pix.sprite('__edprev', Math.max(1, Math.ceil(90 / ed.w))); } };
A.screens.admincat = () => {
  if (!Store.isOwner) return `${sub('admincat', 'admin')}<div class="card empty">Esta sección es solo para la dueña de la app.</div>`;
  const kind = S.catKind || 'pets'; const c = catalog(); const list = c[kind] || [];
  if (!ed || ed.kind !== kind) newDraft(kind);
  return `${sub('admincat', 'admin', '<span class="tag gold">Solo tú</span>')}
<div class="ad-kinds">${Object.entries(KINDS).map(([k, [n]]) => `<button data-act="catKind" data-v="${k}" aria-pressed="${k === kind}">${n}</button>`).join('')}</div>
${list.length ? `<div class="card"><h3>${KIND_PL[kind]} que ya agregaste</h3><div class="ad-list">${list.map(x => `<button class="ad-item ${x.off ? 'off' : ''} ${ed.id === x.id ? 'on' : ''}" data-act="catEdit" data-id="${x.id}"><span class="ad-item-art ${kind === 'walls' || kind === 'floors' ? 'tile' : ''}"><img class="pixel" alt="" src="${Pix.sprite(sprOf(kind, x.id), 2)}"></span><b>${esc(x.name)}</b><span>${x.off ? 'Oculto' : x.from && x.from > A.today() ? 'Sale el ' + x.from.slice(8) + '/' + x.from.slice(5, 7) : esc(howLabel(x, kind))}${x.col ? ' · ' + esc(x.col) : ''}${x.map2 ? ' · se mueve' : ''}</span></button>`).join('')}</div></div>` : ''}
<div class="card stack" id="catForm">${formHTML()}</div>
${builtinHTML(kind)}
<details class="card stack" ${S.seasOpen ? 'open' : ''}><summary><b>Temporadas</b> <span class="faint">(Noche de brujas, Navidad, San Valentín y las tuyas)</span></summary>
<div class="list" style="margin:8px 0">${allSeasons().map(se => `<div class="li"><span class="tx-main"><b>${esc(se.name)}</b><span>${esc(se.when)}${inSeason(se.id) ? ' · <b>activa ahora</b>' : ''} · ${se.items.length} cosas</span></span>${se.custom ? `<button class="btn sm danger" data-act="seDel" data-id="${se.id}">Borrar</button>` : ''}</div>`).join('')}</div>
<div class="formgrid"><label class="f full">Nueva temporada<input class="in" id="seName" placeholder="Ej. Día de la madre" maxlength="30"></label><label class="f">Desde<input class="in" id="seFrom" type="date"></label><label class="f">Hasta<input class="in" id="seTo" type="date"></label></div>
<button class="btn" data-act="seAdd" style="justify-content:center">Agregar temporada</button>
<p class="faint" style="margin:0">Se repite cada año en esas fechas. Luego, al agregar ropa o muebles, elige "Temporada" y escoge esta.</p></details>`;
};
function howLabel(x, kind) { if (kind === 'stickers' || kind === 'icons') return 'Gratis'; return x.how === 'gacha' ? 'Máquina gacha · ' + (['', 'Común', 'Raro', 'Súper raro'][+x.rare || 1]) : x.how === 'stars' ? `${x.price} estrellitas` : x.how === 'logro' ? 'Por logro' : x.how === 'temporada' ? 'De temporada' : x.how === 'raro' ? 'Regalo raro' : 'Gratis'; }
const PH = { pets: 'Ej. Mochi de coco', furn: 'Ej. Lámpara de luna', clothes: 'Ej. Gorrito de lana', food: 'Ej. Flan', walls: 'Ej. Rayitas rosadas', floors: 'Ej. Baldosa de corazones', stickers: 'Ej. Gatito feliz', icons: 'Ej. Mi banco', chars: 'Ej. Pandy', boxes: 'Ej. Cajita de gorritos' };
const HELP = {
  walls: 'Dibuja o sube un cuadrito que se repite a lo ancho de toda la pared (la pared mide 34 de alto).',
  floors: 'Dibuja o sube una baldosa: se repite en todo el piso, como azulejos.',
  stickers: 'Los stickers les aparecen gratis a todas en el journal. Con "Foto a pixel" puedes convertir cualquier foto o dibujo, con borde blanco de sticker.',
  icons: 'Los íconos son gratis: les aparecen a todas al elegir el ícono de una cuenta, tarjeta o categoría.',
  clothes: 'Muévela y cámbiale el tamaño sobre la mascota hasta que quede en su lugar.',
  furn: 'Mira el tamaño junto a la camita y ajústalo.',
  boxes: 'Dibuja o sube solo la portada de la cajita (el frente). La app le pone la tapa, el costado y el contorno. Abajo eliges el color, en qué estante va, el precio y qué sorpresitas trae.',
  chars: 'Personajes para el juego Cruzar la calle. Sube un dibujo pixel (de frente, con fondo transparente). Pueden salir en la máquina gacha, venderse con estrellitas o darse gratis desde el inicio.'
};
function formHTML() {
  if (ed.replaces) return replBanner() + formHTML0();
  return formHTML0();
}
function formHTML0() {
  const k = ed.kind; const tile = k === 'walls' || k === 'floors';
  const maxW = tile ? 48 : 96, maxH = k === 'walls' ? 34 : tile ? 48 : 96;
  const photo = ed.mode === 'photo';
  return `<b>${ed.id ? 'Editar: ' + esc(ed.name) : KIND_NEW[k]}</b>
<div class="formgrid">
<label class="f">Nombre<input class="in" data-ed="name" value="${esc(ed.name)}" placeholder="${PH[k]}"></label>
${k === 'pets' ? `<label class="f">Cómo es<input class="in" data-ed="desc" value="${esc(ed.desc)}" placeholder="Ej. Muy dormilona"></label>` : k === 'food' ? `<label class="f">Llena la pancita (+)<input class="in" data-ed="gain" type="number" value="${ed.gain}"></label>` : k === 'clothes' ? `<label class="f">Dónde se pone<select class="in" data-ed="slot">${[['head', 'Cabeza'], ['face', 'Cara'], ['neck', 'Cuello']].map(([v, n]) => `<option value="${v}" ${ed.slot === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>` : k === 'furn' ? `<label class="f">Va en<select class="in" data-ed="wall"><option value="" ${!ed.wall ? 'selected' : ''}>El piso</option><option value="1" ${ed.wall ? 'selected' : ''}>La pared</option></select></label><label class="f">Sale en la tienda en<select class="in" data-ed="cat">${FCATS.filter(([c]) => c !== 'todo').map(([c, n]) => `<option value="${c}" ${(ed.cat || (ed.wall ? 'pared' : 'deco')) === c ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label class="f">Hace algo especial<select class="in" data-ed="light">${[['', 'Según la tienda (los de Luces alumbran)'], ['no', 'Nada'], ['luz', 'Alumbra de noche (lámpara)'], ['ventana', 'Es ventana (se ve el día y la noche)']].map(([v, n]) => `<option value="${v}" ${(ed.light || '') === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>` : ''}
</div>
${HELP[k] ? `<p class="faint" style="margin:0">${HELP[k]}</p>` : ''}
<div class="ad-up">
<label class="btn sm pink">Subir dibujo pixel<input type="file" accept="image/*" id="edFile" multiple hidden></label>
<label class="btn sm">Foto a pixel<input type="file" accept="image/*" id="edPhoto" hidden></label>
${ed.mode === 'pixel' && edImg ? `<button class="btn sm" data-act="edDetail" data-v="-1">Menos detalle</button><button class="btn sm" data-act="edDetail" data-v="1">Más detalle</button>` : ''}
</div>
${photo && edImg ? `<div class="ad-photo">
<label class="f">Tamaño: <b id="phNv">${ed.ph.n}</b> cuadritos<input type="range" min="12" max="${tile ? 48 : 80}" value="${ed.ph.n}" data-ph="n"></label>
<label class="f">Colores: <b id="phKv">${ed.ph.k}</b><input type="range" min="4" max="32" value="${ed.ph.k}" data-ph="k"></label>
<div class="chips"><label class="chip"><input type="checkbox" data-ph="bg" ${ed.ph.bg ? 'checked' : ''}> Quitar fondo</label><label class="chip"><input type="checkbox" data-ph="border" ${ed.ph.border ? 'checked' : ''}> Borde de sticker</label><label class="chip"><input type="checkbox" data-ph="line" ${ed.ph.line ? 'checked' : ''}> Contorno</label></div>
</div>` : ''}
<div class="ad-tools">
${[['pen', 'Lápiz'], ['fill', 'Balde'], ['pick', 'Gotero'], ['line', 'Línea'], ['rect', 'Cuadro'], ['oval', 'Círculo']].map(([t, n]) => `<button class="chip" data-tool="${t}" aria-pressed="${ed.tool === t}">${n}</button>`).join('')}
<button class="chip" data-edop="mirror" aria-pressed="${!!ed.mirror}">Espejo</button>
</div>
<div class="ad-tools">
<button class="chip" data-edop="outline">Contorno</button><button class="chip" data-edop="shade">Sombrita</button><button class="chip" data-edop="flip">Voltear</button><button class="chip" data-edop="undo">Deshacer</button><button class="chip" data-edop="clear">Borrar todo</button>
</div>
<div class="ad-frames"><span class="faint">Animación:</span><button class="chip" data-frame="1" aria-pressed="${!ed.f2}">Cuadro 1</button><button class="chip" data-frame="2" aria-pressed="${!!ed.f2}">Cuadro 2${ed.map2 ? ' ✓' : ''}</button>${ed.map2 ? '<button class="chip" data-edop="noanim">Quitar animación</button>' : '<span class="faint" style="font-size:12px">Dibuja un cuadro 2 y se mueve solo (brillo, parpadeo, burbujas).</span>'}</div>
${ed.full ? fullEdHTML() : `<div class="ed-wrap"><canvas id="edCanvas" class="ed-canvas" style="aspect-ratio:${ed.w}/${ed.h}"></canvas><div class="ed-side"><img class="pixel" id="edPrev" alt="Vista previa" src="" style="max-width:96px;max-height:96px"><span class="faint">${ed.w} × ${ed.h}</span><button class="btn sm pink" data-edop="full" style="margin-top:6px">Pantalla grande</button></div></div>
${palHTML()}`}
<details class="ad-size"><summary>Cambiar cuadrícula (${ed.w} × ${ed.h})</summary><div class="row" style="gap:6px;margin-top:8px"><input class="in" data-ed="w" type="number" min="3" max="${maxW}" value="${ed.w}" style="width:80px"> × <input class="in" data-ed="h" type="number" min="3" max="${maxH}" value="${ed.h}" style="width:80px"></div></details>
<div class="f">Variantes de color<div class="ad-vars">${VARS.map(([n, hue]) => `<button class="ad-var" data-var="${n}"><img class="pixel" alt="" src="${varPreview(hue)}"><span>${n}</span></button>`).join('')}</div><span class="faint" style="font-size:12px">Toca una y se crea una copia en ese color, lista para guardar.</span></div>
${k === 'clothes' ? tryOnHTML() : ''}${k === 'furn' || tile ? roomPreviewHTML() : ''}
<div class="formgrid"><label class="f">Colección (opcional)<input class="in" data-ed="col" value="${esc(ed.col || '')}" placeholder="Ej. Otoño cozy" list="adCols"><datalist id="adCols">${[...new Set(Object.values(catalog()).flat().map(x => x && x.col).filter(Boolean))].map(c => `<option value="${esc(c)}">`).join('')}</datalist></label><label class="f">Sale el día (opcional)<input class="in" data-ed="from" type="date" value="${ed.from || ''}"></label></div>
${k === 'boxes' ? (A.boxFormHTML ? A.boxFormHTML(ed) : '') : k === 'stickers' || k === 'icons' ? '' : `<div class="f">¿Cómo se consigue?<div class="chips">${(k === 'chars' ? [['gacha', 'Máquina gacha'], ['stars', 'Con estrellitas'], ['free', 'Gratis desde el inicio']] : tile ? [['stars', 'Con estrellitas'], ['free', 'Gratis']] : [['stars', 'Con estrellitas'], ['logro', 'Logro'], ['temporada', 'Temporada'], ['raro', 'Regalo raro'], ...(k === 'food' ? [] : [['free', 'Gratis']])]).map(([v, n]) => `<button class="chip" data-edhow="${v}" aria-pressed="${ed.how === v}">${n}</button>`).join('')}</div></div>
<div class="formgrid">
${k === 'chars' && ed.how === 'gacha' ? `<label class="f">Qué tan difícil de sacar<select class="in" data-ed="rare">${[[1, 'Común'], [2, 'Raro'], [3, 'Súper raro']].map(([v, n]) => `<option value="${v}" ${+ed.rare === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>` : ''}
${ed.how === 'stars' || k === 'food' ? `<label class="f">Precio en estrellitas<input class="in" data-ed="price" type="number" min="0" value="${ed.price}"></label>` : ''}
${ed.how === 'logro' ? `<label class="f">Qué logro<select class="in" data-ed="ach">${A.RC.ACH.map(a => `<option value="${a.id}" ${ed.ach === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label>` : ''}
${ed.how === 'temporada' ? `<label class="f">Qué temporada<select class="in" data-ed="season">${allSeasons().map(s => `<option value="${s.id}" ${ed.season === s.id ? 'selected' : ''}>${esc(s.name)} (${esc(s.when)})</option>`).join('')}</select></label>` : ''}
</div>`}
<div class="row" style="gap:8px;flex-wrap:wrap">${ed.id ? `<button class="btn" data-act="edOff">${ed.off ? 'Mostrar otra vez' : 'Ocultar'}</button><button class="btn danger" data-act="edDel">Borrar</button><button class="btn" data-act="edNew">Nueva</button>` : ''}<button class="btn pink" data-act="edSave" style="flex:1;justify-content:center">Guardar y publicar</button></div>
<p class="faint" style="margin:0">Lo que guardes aquí les aparece a todas tus usuarias.</p>`;
}
function palHTML() { return `<div class="ed-pal">${ed.pal.map((h, i) => `<button class="ed-sw ${ed.color === i.toString(36) ? 'on' : ''}" data-sw="${i.toString(36)}" style="background:${h}" aria-label="Color ${i + 1}"></button>`).join('')}<button class="ed-sw erase ${ed.color === '.' ? 'on' : ''}" data-sw="." aria-label="Borrador">×</button><label class="ed-sw add" aria-label="Agregar color">+<input type="color" id="edAddCol" value="#f27ea1"></label></div>`; }
// ---- Pantalla grande: solo el dibujo, con las herramientas justas y zoom con dos dedos ----
function fullEdHTML() {
  const z = ed.zoom || 1;
  return `<div class="ed-full" id="edFull">
<div class="ed-full-top">
<img class="pixel ed-full-mini" id="edPrev" alt="Vista previa" src="">
<div class="ed-full-tools">${[['pen', 'Lápiz'], ['fill', 'Balde'], ['pick', 'Gotero'], ['line', 'Línea'], ['rect', 'Cuadro'], ['oval', 'Círculo'], ['pan', 'Mover']].map(([t, n]) => `<button class="chip" data-tool="${t}" aria-pressed="${ed.tool === t}">${n}</button>`).join('')}<button class="chip" data-edop="mirror" aria-pressed="${!!ed.mirror}">Espejo</button><button class="chip" data-edop="undo">Deshacer</button></div>
<button class="btn sm pink ed-full-x" data-edop="full">Listo</button>
</div>
<div class="ed-full-stage" id="edStage"><div class="ed-full-pan" id="edPan"><canvas id="edCanvas" class="ed-canvas big"></canvas></div>
<div class="ed-full-zoom"><button class="btn sm" data-zoom="-1" aria-label="Alejar">−</button><b id="edZv">${Math.round(z * 100)}%</b><button class="btn sm" data-zoom="1" aria-label="Acercar">+</button><button class="btn sm" data-zoom="0">Ver todo</button></div></div>
${palHTML()}
</div>`;
}
function edApplyView() {
  const p = $('#edPan'); if (!p) return; const z = ed.zoom || 1;
  p.style.transform = `translate(-50%,-50%) translate(${ed.panX || 0}px,${ed.panY || 0}px) scale(${z})`;
  const v = $('#edZv'); if (v) v.textContent = Math.round(z * 100) + '%';
}
function edZoomTo(z, mx, my) { // mx,my: punto fijo, medido desde el centro del cuadro de dibujo
  const st = $('#edStage'); if (!st) return; const old = ed.zoom || 1; z = Math.max(1, Math.min(10, z));
  mx = mx || 0; my = my || 0; ed.panX = mx - (mx - (ed.panX || 0)) * z / old; ed.panY = my - (my - (ed.panY || 0)) * z / old; ed.zoom = z;
  if (z === 1) { ed.panX = 0; ed.panY = 0; }
  const cv = $('#edCanvas'); if (cv) { const lx = cv.offsetWidth * z / 2, ly = cv.offsetHeight * z / 2; ed.panX = Math.max(-lx, Math.min(lx, ed.panX)); ed.panY = Math.max(-ly, Math.min(ly, ed.panY)); }
  edApplyView();
}
// ---- Probador de ropa: la mascota con la prenda encima, para moverla y cambiarle el tamaño ----
function accBox(an, a, slot) {
  let left = an.hx - a.w / 2, top;
  if (slot === 'head') top = an.hy - a.h + 2 + (a.lift || 0); else if (slot === 'face') top = an.fy - a.h / 2; else top = an.ny - 1;
  return { left: left + (a.dx || 0), top: top + (a.dy || 0) };
}
A.accBox = accBox;
function tryOnHTML() {
  const pets = Object.keys(A.ANCH).filter(k => A.allPets()[k] || BASE_PETS[k]).slice(0, 12);
  return `<div class="ad-try"><div class="ad-try-stage" id="tryStage"><div class="ad-try-pet" id="tryPet"></div></div>
<div class="stack" style="gap:8px;flex:1;min-width:150px">
<div class="ad-pad"><span></span><button class="btn sm" data-mv="0,-0.5" aria-label="Subir">↑</button><span></span><button class="btn sm" data-mv="-0.5,0" aria-label="Izquierda">←</button><button class="btn sm" data-mv="center" aria-label="Centrar">•</button><button class="btn sm" data-mv="0.5,0" aria-label="Derecha">→</button><span></span><button class="btn sm" data-mv="0,0.5" aria-label="Bajar">↓</button><span></span></div>
<label class="f">Tamaño: <b id="tryDw">${ed.dw}</b><input type="range" min="3" max="30" step="0.5" value="${ed.dw}" data-ed="dw"></label>
<span class="faint" style="font-size:12px">También puedes arrastrarla con el dedo.</span></div></div>
<div class="chips">${pets.map(p => `<button class="chip" data-try="${p}" aria-pressed="${ed.tryPet === p}"><img class="pixel" alt="" src="${spr(A.ANCH[p].sprite || p, 2)}" style="width:20px"> ${esc((A.allPets()[p] || BASE_PETS[p] || {}).name || p)}</button>`).join('')}</div>`;
}
function drawTryOn() {
  const box = $('#tryPet'); if (!box || ed.kind !== 'clothes') return;
  const an = A.ANCH[ed.tryPet] || A.ANCH.gochi; const a = { w: +ed.dw || 14, h: (+ed.dw || 14) * ed.h / ed.w, dx: +ed.dx || 0, dy: +ed.dy || 0 };
  const p = accBox(an, a, ed.slot);
  box.innerHTML = `<img class="pixel" alt="" src="${spr(an.sprite || ed.tryPet, 6)}" draggable="false"><img class="pixel ad-try-acc" id="tryAcc" alt="" src="${Pix.sprite('__edprev', Math.max(1, Math.ceil(120 / ed.w)))}" draggable="false" style="left:${p.left / 20 * 100}%;top:${p.top / 20 * 100}%;width:${a.w / 20 * 100}%">`;
  const v = $('#tryDw'); if (v) v.textContent = ed.dw;
}
// ---- Vista en el cuarto: la camita de referencia y lo que estás creando ----
function edLit() { return ed.kind === 'furn' && furnLit({ light: ed.light, cat: ed.cat || (ed.wall ? 'pared' : 'deco') }); }
function edColors() { const used = new Set(); ed.map.forEach(r => [...r].forEach(c => { if (c !== '.') used.add(c); })); return [...used].map(c => ed.pal[parseInt(c, 36)]).filter((c, i, a) => c && a.indexOf(c) === i); }
function specialHTML() {
  if (ed.kind !== 'furn') return '';
  if (edLit()) return `<div class="ad-special"><b>Luz de la lámpara</b><span class="faint">Toca en el cuarto de abajo el lugar de donde sale la luz (el foco o la pantalla).</span><label class="f">Tamaño de la luz: <b id="litR">${lightR(ed, +ed.dw || 20, (+ed.dw || 20) * ed.h / ed.w)}</b><input type="range" min="8" max="80" value="${lightR(ed, +ed.dw || 20, (+ed.dw || 20) * ed.h / ed.w)}" data-ed="lr"></label></div>`;
  if (ed.light === 'ventana') { const cols = edColors(); return `<div class="ad-special"><b>Vidrio de la ventana</b><span class="faint">Toca el color del vidrio: esa parte se vuelve transparente y por ahí se ve el cielo de día, el atardecer o la noche con estrellas (y la lluvia si llueve). Si dejaste el vidrio vacío al dibujar, no hace falta elegir nada.</span><div class="ad-glass"><button type="button" data-act="edGlass" data-v="" aria-pressed="${!ed.glass}">Vacío</button>${cols.map(c => `<button type="button" data-act="edGlass" data-v="${esc(c)}" aria-pressed="${(ed.glass || '').toLowerCase() === c.toLowerCase()}" style="--c:${esc(c)}"><i></i></button>`).join('')}</div></div>`; }
  return '';
}
function roomPreviewHTML() { const sp = ed.kind === 'furn' && (edLit() || ed.light === 'ventana'); return `<div class="f">Así se ve en el cuarto${sp ? `<div class="chips" style="margin:4px 0 0">${[['dia', 'Día'], ['tarde', 'Tarde'], ['noche', 'Noche']].map(([v, n]) => `<button type="button" class="chip" data-act="edPart" data-v="${v}" aria-pressed="${(ed.part || 'noche') === v}">${n}</button>`).join('')}</div>` : ''}<div class="ad-room ${sp ? 't-' + (ed.part || 'noche') : ''}" id="adRoom"></div>${ed.kind === 'furn' ? `<label class="f">Tamaño en el cuarto: <b id="furnDw">${ed.dw}</b><input type="range" min="6" max="100" value="${ed.dw}" data-ed="dw"></label>${specialHTML()}` : ''}</div>`; }
ACT.edPart = a => { ed.part = a.dataset.v; A.render(); };
ACT.edGlass = a => { ed.glass = a.dataset.v || ''; A.render(); };
function tiledRaw(map, W, H) { const th = map.length, tw = map[0].length; return Array.from({ length: H }, (_, y) => { const r = map[y % th]; return r.repeat(Math.ceil(W / tw)).slice(0, W); }); }
function drawRoomPreview() {
  const box = $('#adRoom'); if (!box) return; const k = ed.kind; const pal = ed.pal.join(',');
  let wall = Pix.sprite('x_pared_rosa', 3), floor = Pix.sprite('x_piso_madera', 3), item = '';
  if (k === 'walls') { Pix.define('__edwall', { raw: tiledRaw(ed.map, 144, 34), pal }); wall = Pix.sprite('__edwall', 3); }
  if (k === 'floors') { Pix.define('__edfloor', { raw: tiledRaw(ed.map, 144, 98), pal }); floor = Pix.sprite('__edfloor', 3); }
  if (k === 'furn') {
    const w = +ed.dw || 20, h = w * ed.h / ed.w, X = 72 - w / 2, Y = ed.wall ? 6 : Math.max(36, 110 - h); const part = ed.part || 'noche'; let src = '__edprev';
    const pc = (v, T) => v / T * 100 + '%'; let back = '', front = '';
    if (ed.light === 'ventana') { const tmp = { map: ed.map, w: ed.w, h: ed.h, pal: ed.pal, glass: ed.glass }; const [a, b, c2, d2] = glassBox(tmp); const ch = glassChar(tmp); if (ch) { Pix.define('__edprev_win', { raw: ed.map.map(r => r.split(ch).join('.')), pal: ed.pal.join(',') }); src = '__edprev_win'; } back = `<span class="rm-sky t-${part}" style="position:absolute;left:${pc(X + a * w, 144)};top:${pc(Y + b * h, 132)};width:${pc((c2 - a) * w, 144)};height:${pc((d2 - b) * h, 132)};background-image:url('${Pix.sprite('x_paisaje_' + part, 3)}')">${part === 'noche' ? '<i></i><i></i><i></i>' : ''}</span>`; }
    if (edLit() && part === 'noche') { const r = lightR(ed, w, h); const lx = ed.lx != null ? +ed.lx : .5, ly = ed.ly != null ? +ed.ly : .3; front = `<span class="rm-glow" style="left:${pc(X + lx * w - r, 144)};top:${pc(Y + ly * h - r, 132)};width:${pc(r * 2, 144)}"></span><span class="ad-lpt" style="left:${pc(X + lx * w, 144)};top:${pc(Y + ly * h, 132)}"></span>`; }
    item = `${back}<img class="pixel" alt="" id="adItem" src="${Pix.sprite(src, Math.max(1, Math.ceil(90 / ed.w)))}" style="left:${pc(X, 144)};top:${pc(Y, 132)};width:${pc(w, 144)}">`;
    if (ed.light === 'ventana' || edLit()) item += `<span class="rm-shade" style="--sh:${edLit() ? .2 : .3}"></span>${front}`;
    const v = $('#furnDw'); if (v) v.textContent = ed.dw;
    box.onclick = e => { if (!edLit()) return; const rc = box.getBoundingClientRect(); const ux = (e.clientX - rc.left) / rc.width * 144, uy = (e.clientY - rc.top) / rc.height * 132; ed.lx = Math.round(Math.max(0, Math.min(1, (ux - X) / w)) * 100) / 100; ed.ly = Math.round(Math.max(0, Math.min(1, (uy - Y) / h)) * 100) / 100; if ((ed.part || 'noche') !== 'noche') ed.part = 'noche'; drawRoomPreview(); };
  }
  box.innerHTML = `<img class="pixel ad-room-wall" alt="" src="${wall}"><img class="pixel ad-room-floor" alt="" src="${floor}"><img class="pixel" alt="" src="${Pix.sprite('x_cama', 3)}" style="left:${8 / 144 * 100}%;top:${30 / 132 * 100}%;width:${26 / 144 * 100}%">${item}`;
}
function edPaintCanvas() {
  const cv = $('#edCanvas'); if (!cv) return; let cell;
  const st = ed.full && $('#edStage');
  if (st) { // ocupa todo el espacio libre; se dibuja más fino para que se vea nítido al hacer zoom
    const css = Math.max(2, Math.min((st.clientWidth - 16) / ed.w, (st.clientHeight - 16) / ed.h));
    cv.style.width = ed.w * css + 'px'; cv.style.height = ed.h * css + 'px';
    cell = Math.max(3, Math.ceil(css * Math.min(2, window.devicePixelRatio || 1)));
  } else cell = Math.max(3, Math.floor(Math.min(300, cv.parentElement.clientWidth - 110) / Math.max(ed.w, ed.h * .8)));
  const colOf = ch => ed.pal[parseInt(ch, 36)];
  if (cv.width !== ed.w * cell || cv.height !== ed.h * cell) { cv.width = ed.w * cell; cv.height = ed.h * cell; } const g = cv.getContext('2d');
  for (let y = 0; y < ed.h; y++) for (let x = 0; x < ed.w; x++) { g.fillStyle = (x + y) % 2 ? '#f6efe6' : '#fffaf2'; g.fillRect(x * cell, y * cell, cell, cell); const ch = ed.map[y][x]; if (ch !== '.') { g.fillStyle = colOf(ch) || '#000'; g.fillRect(x * cell, y * cell, cell, cell); } }
  if (cell >= 5) { g.strokeStyle = 'rgba(138,77,79,.12)'; for (let x = 0; x <= ed.w; x++) { g.beginPath(); g.moveTo(x * cell + .5, 0); g.lineTo(x * cell + .5, cv.height); g.stroke(); } for (let y = 0; y <= ed.h; y++) { g.beginPath(); g.moveTo(0, y * cell + .5); g.lineTo(cv.width, y * cell + .5); g.stroke(); } }
  cv._cell = cell;
  Pix.define('__edprev', { raw: ed.map, pal: ed.pal.join(',') });
  const pv = $('#edPrev'); if (pv) pv.src = (ed.kind === 'walls' || ed.kind === 'floors') ? (Pix.define('__edtile', { raw: tiledRaw(ed.map, ed.w * 3, ed.h * 3), pal: ed.pal.join(',') }), Pix.sprite('__edtile', 2)) : Pix.sprite('__edprev', Math.max(1, Math.ceil(96 / Math.max(ed.w, ed.h))));
  drawTryOn(); drawRoomPreview();
}
function resizeMap(w, h) { ed.map = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => (ed.map[y] && ed.map[y][x]) || '.').join('')); ed.w = w; ed.h = h; }
const snap = () => { ed.hist.push(ed.map.slice()); if (ed.hist.length > 40) ed.hist.shift(); };
function set1(x, y, c) { if (x < 0 || y < 0 || x >= ed.w || y >= ed.h) return false; const row = ed.map[y]; if (row[x] === c) return false; ed.map[y] = row.slice(0, x) + c + row.slice(x + 1); return true; }
function setPx(x, y, c) { const a = set1(x, y, c); const b = ed.mirror ? set1(ed.w - 1 - x, y, c) : false; return a || b; }
function shape(t, x0, y0, x1, y1, c) {
  if (t === 'line') { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++) setPx(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), c); return; }
  const ax = Math.min(x0, x1), bx = Math.max(x0, x1), ay = Math.min(y0, y1), by = Math.max(y0, y1);
  if (t === 'rect') { for (let x = ax; x <= bx; x++) { setPx(x, ay, c); setPx(x, by, c); } for (let y = ay; y <= by; y++) { setPx(ax, y, c); setPx(bx, y, c); } return; }
  const cx = (ax + bx) / 2, cy = (ay + by) / 2, rx = (bx - ax) / 2 + .5, ry = (by - ay) / 2 + .5;
  for (let y = ay; y <= by; y++) for (let x = ax; x <= bx; x++) { const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; if (d <= 1 && d > Math.pow(Math.max(0, 1 - 1.4 / Math.min(rx, ry)), 2)) setPx(x, y, c); }
}
// colores: rgb <-> hsl para variantes, sombritas y contornos
const h2r = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const r2h = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
function r2hsl([r, g, b]) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; }
function hsl2r([h, s, l]) { const f = n => { const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))); }; return [f(0), f(8), f(4)]; }
const VARS = [['Rosa', 340], ['Durazno', 22], ['Dorado', 45], ['Menta', 150], ['Cielo', 200], ['Lila', 268]];
function recolor(pal, map, hue) {
  // tono principal del dibujo (ponderado por cuántos cuadritos tiene cada color)
  const cnt = {}; map.join('').replace(/\./g, '').split('').forEach(ch => cnt[ch] = (cnt[ch] || 0) + 1);
  let sx = 0, sy = 0; Object.entries(cnt).forEach(([ch, n]) => { const [h, s, l] = r2hsl(h2r(pal[parseInt(ch, 36)])); if (s > .25 && l > .2 && l < .92) { sx += Math.cos(h * Math.PI / 180) * n * s; sy += Math.sin(h * Math.PI / 180) * n * s; } });
  const main = Math.atan2(sy, sx) * 180 / Math.PI; const shift = hue - main;
  return pal.map(c => { const [h, s, l] = r2hsl(h2r(c)); if (s < .2 || l < .2 || l > .94) return c; return r2h(hsl2r([(h + shift + 360) % 360, s, l])); });
}
function varPreview(hue) { if (!ed.map.some(r => /[^.]/.test(r))) return Pix.sprite('heart', 2); Pix.define('__var' + hue, { raw: ed.map, pal: recolor(ed.pal, ed.map, hue).join(',') }); return Pix.sprite('__var' + hue, Math.max(1, Math.ceil(40 / Math.max(ed.w, ed.h)))); }
function palIdx(hex) { let i = ed.pal.indexOf(hex); if (i >= 0) return i.toString(36); if (ed.pal.length >= 36) { const used = new Set(ed.map.join('') + (ed.map2 || []).join('')); i = ed.pal.findIndex((_, k) => !used.has(k.toString(36))); if (i < 0) { let bd = 1e9; const t = h2r(hex); ed.pal.forEach((c, k) => { const q = h2r(c); const d = (q[0] - t[0]) ** 2 + (q[1] - t[1]) ** 2 + (q[2] - t[2]) ** 2; if (d < bd) { bd = d; i = k; } }); return i.toString(36); } ed.pal[i] = hex; return i.toString(36); } ed.pal.push(hex); return (ed.pal.length - 1).toString(36); }
function autoOutline() {
  const cnt = {}; ed.map.join('').replace(/\./g, '').split('').forEach(ch => cnt[ch] = (cnt[ch] || 0) + 1);
  let dark = null, dl = 1; Object.keys(cnt).forEach(ch => { const l = r2hsl(h2r(ed.pal[parseInt(ch, 36)]))[2]; if (l < dl) { dl = l; dark = ch; } });
  const c = dl < .35 ? dark : palIdx('#7a4a52'); const add = [];
  for (let y = 0; y < ed.h; y++) for (let x = 0; x < ed.w; x++) if (ed.map[y][x] === '.' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => ed.map[y + b] && ed.map[y + b][x + a] && ed.map[y + b][x + a] !== '.')) add.push([x, y]);
  add.forEach(([x, y]) => set1(x, y, c));
}
function autoShade() {
  // sombrita abajo y a la derecha de cada forma (como en los juegos pixel)
  const out = ed.map.slice(); const memo = {};
  const lum = ch => r2hsl(h2r(ed.pal[parseInt(ch, 36)]))[2];
  const edge = (x, y) => { const q = ed.map[y] && ed.map[y][x]; return !q || q === '.' || lum(q) < .3; };
  const darker = ch => { if (memo[ch]) return memo[ch]; const [h, s, l] = r2hsl(h2r(ed.pal[parseInt(ch, 36)])); return memo[ch] = palIdx(r2h(hsl2r([(h + 350) % 360, Math.min(1, s * 1.05), Math.max(0, l * .8)]))); };
  for (let y = 0; y < ed.h; y++) for (let x = 0; x < ed.w; x++) { const ch = ed.map[y][x]; if (ch === '.' || lum(ch) < .3) continue; if (edge(x, y + 1) || edge(x + 1, y)) out[y] = out[y].slice(0, x) + darker(ch) + out[y].slice(x + 1); }
  ed.map = out;
}

function bucket(x, y, c) {
  const from = ed.map[y][x]; if (from === c) return; const st = [[x, y]];
  while (st.length) { const [i, j] = st.pop(); if (i < 0 || j < 0 || i >= ed.w || j >= ed.h || ed.map[j][i] !== from) continue; setPx(i, j, c); st.push([i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]); }
}
A.after.admincat = el => {
  $$('body > .ed-full').forEach(n => n.remove()); document.body.classList.remove('ed-full-on');
  const form = $('#catForm', el); if (!form || !$('#edCanvas', el)) return; el = form;
  const full = $('#edFull', el);
  if (full) { // la pantalla grande va directo en el body para quedar encima de todo (barra de abajo incluida)
    document.body.appendChild(full); document.body.classList.add('ed-full-on');
    const watch = setInterval(() => { if (!document.contains(form) || !document.contains(full)) { full.remove(); if (!$('body > .ed-full')) document.body.classList.remove('ed-full-on'); clearInterval(watch); } }, 400);
  }
  edPaintCanvas(); edApplyView();
  const cv = $('#edCanvas'); let down = false;
  if (full) {
    const stage = $('#edStage', full); const pts = new Map(); let gest = null;
    cv._many = () => pts.size > 1;
    const center = () => { const r = stage.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
    const startGest = () => {
      const [a, b] = [...pts.values()]; const [cx, cy] = center();
      if (b) gest = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: ed.zoom || 1, mx: (a.x + b.x) / 2 - cx, my: (a.y + b.y) / 2 - cy, px: ed.panX || 0, py: ed.panY || 0 };
      else gest = { d: 0, z: ed.zoom || 1, mx: a.x - cx, my: a.y - cy, px: ed.panX || 0, py: ed.panY || 0 };
    };
    stage.addEventListener('pointerdown', e => {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) { // segundo dedo: era un gesto, no un trazo
        if (down) { const m = ed.hist.pop(); if (m) ed.map = m; down = false; edPaintCanvas(); }
        startGest();
      } else if (pts.size === 1 && (ed.tool === 'pan' || !e.target.closest('#edCanvas'))) startGest();
    }, true);
    stage.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (!gest) return;
      const [a, b] = [...pts.values()]; const [cx, cy] = center();
      if (b && gest.d) { const mx = (a.x + b.x) / 2 - cx, my = (a.y + b.y) / 2 - cy; ed.zoom = gest.z; ed.panX = gest.px + (mx - gest.mx); ed.panY = gest.py + (my - gest.my); edZoomTo(gest.z * Math.hypot(a.x - b.x, a.y - b.y) / gest.d, mx, my); }
      else if (!b && !gest.d) { ed.panX = gest.px + (a.x - cx - gest.mx); ed.panY = gest.py + (a.y - cy - gest.my); edZoomTo(ed.zoom || 1); }
    }, true);
    const up = e => { pts.delete(e.pointerId); if (pts.size === 1 && gest && gest.d) startGest(); else if (!pts.size) gest = null; };
    stage.addEventListener('pointerup', up, true); stage.addEventListener('pointercancel', up, true);
    stage.addEventListener('wheel', e => { e.preventDefault(); const [cx, cy] = center(); edZoomTo((ed.zoom || 1) * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX - cx, e.clientY - cy); }, { passive: false });
    full.addEventListener('click', e => { const zb = e.target.closest('[data-zoom]'); if (!zb) return; const v = +zb.dataset.zoom; if (!v) { ed.zoom = 1; ed.panX = 0; ed.panY = 0; edApplyView(); } else edZoomTo((ed.zoom || 1) * (v > 0 ? 1.5 : 1 / 1.5)); });
    let rt; window.addEventListener('resize', function rs() { if (!document.contains(full)) return window.removeEventListener('resize', rs); clearTimeout(rt); rt = setTimeout(() => { edPaintCanvas(); edZoomTo(ed.zoom || 1); }, 120); });
  }
  const cellAt = e => { const rc = cv.getBoundingClientRect(); return [Math.floor((e.clientX - rc.left) / rc.width * ed.w), Math.floor((e.clientY - rc.top) / rc.height * ed.h)]; };
  const paint = e => { const [x, y] = cellAt(e); if (x < 0 || y < 0 || x >= ed.w || y >= ed.h) return; if (setPx(x, y, ed.color)) edPaintCanvas(); };
  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); if (ed.tool === 'pan' || cv._many && cv._many()) return; const [x, y] = cellAt(e); if (x < 0 || y < 0 || x >= ed.w || y >= ed.h) return;
    if (ed.tool === 'pick') { const ch = ed.map[y][x]; ed.color = ch; ed.tool = 'pen'; A.render(); return; }
    snap(); if (ed.tool === 'fill') { bucket(x, y, ed.color); if (ed.mirror) bucket(ed.w - 1 - x, y, ed.color); edPaintCanvas(); return; }
    down = true; try { cv.setPointerCapture(e.pointerId); } catch (er) { }
    if (['line', 'rect', 'oval'].includes(ed.tool)) { down = { x, y, base: ed.map.slice() }; return; }
    paint(e);
  });
  cv.addEventListener('pointermove', e => {
    if (!down) return;
    if (down.base) { const [x, y] = cellAt(e); ed.map = down.base.slice(); shape(ed.tool, down.x, down.y, Math.max(0, Math.min(ed.w - 1, x)), Math.max(0, Math.min(ed.h - 1, y)), ed.color); edPaintCanvas(); return; }
    paint(e);
  });
  cv.addEventListener('pointerup', e => { if (down && down.base) { const [x, y] = cellAt(e); ed.map = down.base.slice(); shape(ed.tool, down.x, down.y, Math.max(0, Math.min(ed.w - 1, x)), Math.max(0, Math.min(ed.h - 1, y)), ed.color); edPaintCanvas(); } down = false; }); cv.addEventListener('pointercancel', () => { down = false; });
  // arrastrar la prenda sobre la mascota
  const stage = $('#tryStage', el);
  if (stage) {
    let drag = null;
    stage.addEventListener('pointerdown', e => { if (!e.target.closest('#tryAcc')) return; e.preventDefault(); drag = { x: e.clientX, y: e.clientY, dx: +ed.dx || 0, dy: +ed.dy || 0, w: $('#tryPet', el).getBoundingClientRect().width }; try { stage.setPointerCapture(e.pointerId); } catch (er) { } });
    stage.addEventListener('pointermove', e => { if (!drag) return; const k = 20 / drag.w; ed.dx = Math.round((drag.dx + (e.clientX - drag.x) * k) * 2) / 2; ed.dy = Math.round((drag.dy + (e.clientY - drag.y) * k) * 2) / 2; drawTryOn(); });
    const end = () => { drag = null; }; stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  }
  const onClick = e => {
    const sw = e.target.closest('[data-sw]'); if (sw) { ed.color = sw.dataset.sw; if (ed.tool === 'pick') ed.tool = 'pen'; $$('.ed-sw').forEach(b => b.classList.toggle('on', b === sw)); }
    const tl = e.target.closest('[data-tool]'); if (tl) { ed.tool = tl.dataset.tool; $$('[data-tool]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tool === ed.tool)); }
    const op = e.target.closest('[data-edop]');
    if (op) {
      const o = op.dataset.edop;
      if (o === 'full') { ed.full = !ed.full; if (!ed.full) { if (ed.tool === 'pan') ed.tool = 'pen'; const n = $('body > .ed-full'); if (n) n.remove(); document.body.classList.remove('ed-full-on'); } A.render(); if (!ed.full) { const c = $('#edCanvas'); if (c) c.scrollIntoView({ block: 'center' }); } return; }
      if (o === 'flip') { snap(); ed.map = ed.map.map(r => [...r].reverse().join('')); edPaintCanvas(); }
      if (o === 'undo') { const m = ed.hist.pop(); if (m) { ed.map = m; ed.h = m.length; ed.w = m[0].length; edPaintCanvas(); } else toast('No hay nada que deshacer'); }
      if (o === 'clear') { snap(); ed.map = blankMap(ed.w, ed.h); edPaintCanvas(); }
      if (o === 'mirror') { ed.mirror = !ed.mirror; $$('[data-edop="mirror"]').forEach(b => b.setAttribute('aria-pressed', ed.mirror)); toast(ed.mirror ? 'Espejo: lo que dibujes se copia al otro lado' : 'Espejo apagado'); }
      if (o === 'outline') { snap(); autoOutline(); A.render(); }
      if (o === 'shade') { snap(); autoShade(); A.render(); }
      if (o === 'noanim') { if (ed.f2) { ed.map2 = ed.map; ed.map = ed.map1; } ed.map2 = null; ed.map1 = null; ed.f2 = false; A.render(); }
    }
    const fr = e.target.closest('[data-frame]');
    if (fr) { const two = fr.dataset.frame === '2'; if (two !== !!ed.f2) { if (two) { ed.map1 = ed.map; ed.map = ed.map2 || ed.map.slice(); ed.map2 = ed.map; } else { ed.map2 = ed.map; ed.map = ed.map1; } ed.f2 = two; ed.hist = []; A.render(); } }
    const vr = e.target.closest('[data-var]');
    if (vr) { const hue = VARS.find(v => v[0] === vr.dataset.var)[1]; const base = ed.f2 ? ed.map1 : ed.map; const m2 = ed.f2 ? ed.map : ed.map2; const pal = recolor(ed.pal, base, hue); Object.assign(ed, { id: null, name: (ed.name || 'Nueva').replace(/ \((Rosa|Durazno|Dorado|Menta|Cielo|Lila)\)$/, '') + ' (' + vr.dataset.var + ')', pal, off: false }); ed.map = base; ed.map2 = m2 || null; ed.f2 = false; ed.map1 = null; A.render(); toast('Copia en ' + vr.dataset.var.toLowerCase() + ' lista. Revísala y toca Guardar.'); }
    const mv = e.target.closest('[data-mv]'); if (mv) { if (mv.dataset.mv === 'center') { ed.dx = 0; ed.dy = 0; } else { const [a, b] = mv.dataset.mv.split(',').map(Number); ed.dx = (+ed.dx || 0) + a; ed.dy = (+ed.dy || 0) + b; } drawTryOn(); }
    const tp = e.target.closest('[data-try]'); if (tp) { ed.tryPet = tp.dataset.try; $$('[data-try]', el).forEach(b => b.setAttribute('aria-pressed', b === tp)); drawTryOn(); }
    const hw = e.target.closest('[data-edhow]'); if (hw) { ed.how = hw.dataset.edhow; A.render(); }
  };
  el.addEventListener('click', onClick); if (full) full.addEventListener('click', onClick);
  const onChange = e => {
    const t = e.target;
    if (t.dataset.ed) { const k = t.dataset.ed; if (k === 'w' || k === 'h') { const mw = ed.kind === 'walls' || ed.kind === 'floors' ? 48 : 96, mh = ed.kind === 'walls' ? 34 : mw; snap(); resizeMap(Math.max(3, Math.min(mw, +$('[data-ed="w"]', el).value || ed.w)), Math.max(3, Math.min(mh, +$('[data-ed="h"]', el).value || ed.h))); A.render(); return; } ed[k] = k === 'wall' ? !!t.value : t.type === 'number' || t.type === 'range' ? +t.value : t.value; if (k === 'slot' || k === 'wall') edPaintCanvas(); if (k === 'light' || k === 'cat' || k === 'wall') A.render(); }
    if (t.id === 'edFile' && t.files.length > 1) importMany([...t.files]);
    else if (t.id === 'edFile' && t.files[0]) importImage(t.files[0], 'pixel');
    if (t.id === 'edPhoto' && t.files[0]) importImage(t.files[0], 'photo');
    if (t.dataset.ph) { ed.ph[t.dataset.ph] = t.type === 'checkbox' ? t.checked : +t.value; runPhoto(); }
    if (t.id === 'edAddCol') addColor(t.value);
  };
  el.addEventListener('change', onChange); if (full) full.addEventListener('change', onChange);
  el.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.ed && t.dataset.ed !== 'w' && t.dataset.ed !== 'h') { ed[t.dataset.ed] = t.type === 'number' || t.type === 'range' ? +t.value : t.value; if (t.dataset.ed === 'dw') { drawTryOn(); drawRoomPreview(); } if (t.dataset.ed === 'lr') { const v = $('#litR'); if (v) v.textContent = t.value; drawRoomPreview(); } }
    if (t.dataset.ph && t.type === 'range') { const v = $(t.dataset.ph === 'n' ? '#phNv' : '#phKv', el); if (v) v.textContent = t.value; }
  });
};
function addColor(hex) {
  const used = new Set(ed.map.join('').replace(/\./g, ''));
  if (ed.pal.length >= 36) { // se libera un color que no se esté usando
    const free = ed.pal.findIndex((_, i) => !used.has(i.toString(36)));
    if (free < 0) return toast('Ya hay 36 colores en uso. Borra alguno del dibujo primero.');
    ed.pal[free] = hex; ed.color = free.toString(36);
  } else { ed.pal.push(hex); ed.color = (ed.pal.length - 1).toString(36); }
  ed.tool = 'pen'; A.render();
}
// Convierte una imagen "pixel art" grande (agrandada, con brillo o fondo) en sus cuadritos reales.
// Devuelve { w, h, raw: [filas], pal: 'c0,c1,...' } listo para Pix.define(name, { raw, pal }).
function pixelize(d, W, H, opt) {
  opt = opt || {};
  const A = (x, y) => d[(y * W + x) * 4 + 3];
  const L = (x, y) => { const o = (y * W + x) * 4; return d[o + 3] < 100 ? 0 : d[o] * .3 + d[o + 1] * .59 + d[o + 2] * .11; };
  // 1) Bordes: cuánto cambia cada columna y cada fila respecto a la anterior.
  const colD = new Float64Array(W), rowD = new Float64Array(H);
  for (let y = 0; y < H; y += 1) for (let x = 1; x < W; x++) { const v = Math.abs(L(x, y) - L(x - 1, y)); colD[x] += v; }
  for (let y = 1; y < H; y++) for (let x = 0; x < W; x += 1) { const v = Math.abs(L(x, y) - L(x, y - 1)); rowD[y] += v; }
  // 2) Tamaño del cuadrito: medimos cuánto duran los tramos del mismo color en filas y columnas.
  const hist = new Float64Array(200);
  const diff = (o1, o2) => Math.abs(d[o1] - d[o2]) + Math.abs(d[o1 + 1] - d[o2 + 1]) + Math.abs(d[o1 + 2] - d[o2 + 2]);
  const stepY = Math.max(1, Math.floor(H / 300)), stepX = Math.max(1, Math.floor(W / 300));
  for (let y = 0; y < H; y += stepY) { let last = -1; for (let x = 1; x < W; x++) { const o = (y * W + x) * 4; if (d[o + 3] < 200 || d[o - 1] < 200) { last = -1; continue; } if (diff(o, o - 4) > 40) { if (last >= 0) { const r = x - last; if (r >= 3 && r < 200) hist[r]++; } last = x; } } }
  for (let x = 0; x < W; x += stepX) { let last = -1; for (let y = 1; y < H; y++) { const o = (y * W + x) * 4, o2 = ((y - 1) * W + x) * 4; if (d[o + 3] < 200 || d[o2 + 3] < 200) { last = -1; continue; } if (diff(o, o2) > 40) { if (last >= 0) { const r = y - last; if (r >= 3 && r < 200) hist[r]++; } last = y; } } }
  let tot = 0; hist.forEach(v => tot += v);
  let best = { p: 8, sc: -1 };
  for (let q = 3; q <= 80; q += 0.25) {
    let sc = 0; for (let r = 3; r < 200; r++) { if (!hist[r]) continue; const k = r / q; if (k < 0.8) { sc -= hist[r] * 0.5; continue; } const e = k - Math.round(k); sc += hist[r] * Math.exp(-(e * e) / 0.008) / Math.sqrt(Math.round(k)); }
    if (sc > best.sc) best = { p: q, sc };
  }
  const p = opt.cell || best.p;
  // fase: dónde cae la primera raya de la cuadrícula
  function phase(D, N) { let bo = 0, bs = -1; for (let o = 0; o < p; o += 0.5) { let s = 0; for (let t = o; t < N; t += p) { const i = Math.round(t); if (i > 0 && i < N) s += D[i]; } if (s > bs) { bs = s; bo = o; } } return bo; }
  const ox = phase(colD, W), oy = phase(rowD, H);
  // cada raya se acomoda al borde real más cercano (las imágenes hechas con IA no son parejas)
  function grid(o, D, N) {
    const out = []; let t = o;
    while (t <= N) {
      let bi = Math.round(t), bv = -1; const r = p * 0.3;
      for (let i = Math.max(1, Math.round(t - r)); i <= Math.min(N - 1, Math.round(t + r)); i++) { const v = D[i] * (1 - Math.abs(i - t) / (r * 3)); if (v > bv) { bv = v; bi = i; } }
      if (bv <= 0) bi = Math.round(t);
      if (!out.length || bi - out[out.length - 1] >= p * 0.5) out.push(bi);
      t = bi + p;
    }
    return out;
  }
  const bx = grid(ox, colD, W), by = grid(oy, rowD, H);
  // 3) Un color por cuadrito (el que más se repite en su centro).
  const gw = bx.length - 1, gh = by.length - 1;
  const cells = [];
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
    const cw = bx[i + 1] - bx[i], ch = by[j + 1] - by[j];
    const x0 = Math.floor(bx[i] + cw * .25), x1 = Math.ceil(bx[i] + cw * .75), y0 = Math.floor(by[j] + ch * .25), y1 = Math.ceil(by[j] + ch * .75);
    const cnt = new Map(); let n = 0, aSum = 0;
    for (let y = y0; y < y1 && y < H; y++) for (let x = x0; x < x1 && x < W; x++) {
      const o = (y * W + x) * 4; n++; aSum += d[o + 3];
      if (d[o + 3] < 200) continue;
      const k = (d[o] >> 3) << 10 | (d[o + 1] >> 3) << 5 | (d[o + 2] >> 3);
      const c = cnt.get(k); if (c) { c.n++; c.r += d[o]; c.g += d[o + 1]; c.b += d[o + 2]; } else cnt.set(k, { n: 1, r: d[o], g: d[o + 1], b: d[o + 2] });
    }
    let best = null, dark = null; cnt.forEach(c => { if (!best || c.n > best.n) best = c; const l = (c.r * .3 + c.g * .59 + c.b * .11) / c.n; if (l < 75 && (!dark || c.n > dark.n)) dark = c; });
    if (dark && dark !== best && dark.n >= n * 0.3) best = dark;
    const solid = best && aSum / n >= 170 && best.n >= n * 0.2;
    cells.push(solid ? [Math.round(best.r / best.n), Math.round(best.g / best.n), Math.round(best.b / best.n)] : null);
  }
  // 4) Recortar lo vacío alrededor.
  let minX = gw, minY = gh, maxX = -1, maxY = -1;
  cells.forEach((c, k) => { if (!c) return; const i = k % gw, j = (k / gw) | 0; minX = Math.min(minX, i); maxX = Math.max(maxX, i); minY = Math.min(minY, j); maxY = Math.max(maxY, j); });
  if (maxX < 0) return null;
  const w = maxX - minX + 1, h = maxY - minY + 1;
  // 5) Juntar colores casi iguales (máximo 36 colores).
  const dist = (a, b) => { const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]; return 2 * dr * dr + 4 * dg * dg + 3 * db * db; };
  const used = []; for (let j = minY; j <= maxY; j++) for (let i = minX; i <= maxX; i++) { const c = cells[j * gw + i]; if (c) used.push(c); }
  const freq = new Map(); used.forEach(c => { const k = c.join(); freq.set(k, (freq.get(k) || 0) + 1); });
  let pal = [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ c: k.split(',').map(Number), n }));
  let tol = 18 * 18 * 3;
  const merge = () => { const out = []; pal.forEach(e => { const m = out.find(o => dist(o.c, e.c) < tol); if (m) m.n += e.n; else out.push({ c: e.c, n: e.n }); }); pal = out; };
  merge(); while (pal.length > 36) { tol *= 1.4; merge(); }
  // ajustar cada color al promedio de su grupo (k-means corto)
  for (let it = 0; it < 4; it++) {
    const acc = pal.map(() => [0, 0, 0, 0]);
    used.forEach(c => { let bi = 0, bd = 1e12; pal.forEach((e, i) => { const dd = dist(c, e.c); if (dd < bd) { bd = dd; bi = i; } }); const a = acc[bi]; a[0] += c[0]; a[1] += c[1]; a[2] += c[2]; a[3]++; });
    pal = pal.map((e, i) => acc[i][3] ? { c: [acc[i][0] / acc[i][3], acc[i][1] / acc[i][3], acc[i][2] / acc[i][3]].map(Math.round), n: acc[i][3] } : e);
  }
  const hex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  const raw = [];
  for (let j = minY; j <= maxY; j++) { let row = ''; for (let i = minX; i <= maxX; i++) { const c = cells[j * gw + i]; if (!c) { row += '.'; continue; } let bi = 0, bd = 1e12; pal.forEach((e, k) => { const dd = dist(c, e.c); if (dd < bd) { bd = dd; bi = k; } }); row += bi.toString(36); } raw.push(row); }
  // 6) Quitar puntitos sueltos (un cuadrito solo, sin vecinos).
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { if (raw[j][i] === '.') continue; const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => raw[j + b] && raw[j + b][i + a] && raw[j + b][i + a] !== '.').length; if (!nb) raw[j] = raw[j].slice(0, i) + '.' + raw[j].slice(i + 1); }
  return { w, h, raw, pal: pal.map(e => hex(e.c)).join(','), cell: +p.toFixed(2) };
}

A.pixelize = pixelize;
// Lee un archivo de imagen y devuelve sus píxeles (achicada si es enorme).
A.readPixels = file => new Promise((ok, bad) => {
  const url = URL.createObjectURL(file); const im = new Image();
  im.onload = () => { const k = Math.min(1, 1800 / Math.max(im.width, im.height)); const W = Math.round(im.width * k), H = Math.round(im.height * k); const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(im, 0, 0, W, H); URL.revokeObjectURL(url); ok({ d: g.getImageData(0, 0, W, H).data, W, H }); };
  im.onerror = () => { URL.revokeObjectURL(url); bad(new Error('img')); }; im.src = url;
});
// Pixela con un tope de cuadritos (si sale más grande, se agranda el cuadrito).
A.pixFit = (img, maxN, cell) => {
  let r = pixelize(img.d, img.W, img.H, cell ? { cell } : {}); let n = 0;
  while (r && Math.max(r.w, r.h) > maxN && n++ < 6) r = pixelize(img.d, img.W, img.H, { cell: r.cell * Math.max(r.w, r.h) / maxN * 1.02 });
  return r;
};
// Dibuja el resultado en un PNG nítido (cada cuadrito del mismo tamaño).
A.pixPNG = (r, maxPx) => { const s = Math.max(1, Math.floor((maxPx || 160) / Math.max(r.w, r.h))); const pal = r.pal.split(','); const cv = document.createElement('canvas'); cv.width = r.w * s; cv.height = r.h * s; const g = cv.getContext('2d'); r.raw.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '.') return; g.fillStyle = pal[parseInt(ch, 36)]; g.fillRect(x * s, y * s, s, s); })); return cv; };
const MAXN = { chars: 48, pets: 64, furn: 96, clothes: 48, food: 48, icons: 48, stickers: 64, walls: 34, floors: 48 };
// Foto (o dibujo normal) a pixel: se achica a pocos cuadritos, se reducen los colores y, si quieres, se le pone borde de sticker.
function photoToPixel(img, o) {
  const { d, W, H } = img;
  // recorte a lo que tiene dibujo (si la imagen tiene fondo transparente)
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return null;
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1; const pad = o.border ? 2 : o.line ? 1 : 0; const n = Math.max(6, o.n - pad * 2);
  const w = bw >= bh ? n : Math.max(2, Math.round(n * bw / bh)), h = bh > bw ? n : Math.max(2, Math.round(n * bh / bw));
  const cells = [];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const sx0 = x0 + i * bw / w, sy0 = y0 + j * bh / h, sw = bw / w, sh = bh / h; let r = 0, g = 0, b = 0, a = 0, n2 = 0;
    for (let q = 0; q < 5; q++) for (let p = 0; p < 5; p++) { const x = Math.min(W - 1, Math.floor(sx0 + (p + .5) * sw / 5)), y = Math.min(H - 1, Math.floor(sy0 + (q + .5) * sh / 5)); const k = (y * W + x) * 4; const al = d[k + 3]; a += al; if (al > 40) { r += d[k]; g += d[k + 1]; b += d[k + 2]; n2++; } }
    cells.push(a / 25 >= 110 && n2 ? [r / n2, g / n2, b / n2].map(Math.round) : null);
  }
  // quitar el fondo: lo que toca los bordes y se parece al color de las esquinas
  if (o.bg) {
    const corners = [cells[0], cells[w - 1], cells[(h - 1) * w], cells[h * w - 1]].filter(Boolean);
    if (corners.length) {
      const bg = corners[0]; const near = c => c && Math.abs(c[0] - bg[0]) + Math.abs(c[1] - bg[1]) + Math.abs(c[2] - bg[2]) < 60;
      const st = []; for (let i = 0; i < w; i++) st.push([i, 0], [i, h - 1]); for (let j = 0; j < h; j++) st.push([0, j], [w - 1, j]);
      const seen = new Uint8Array(w * h);
      while (st.length) { const [i, j] = st.pop(); if (i < 0 || j < 0 || i >= w || j >= h) continue; const k = j * w + i; if (seen[k]) continue; seen[k] = 1; if (!near(cells[k])) continue; cells[k] = null; st.push([i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]); }
    }
  }
  // reducir colores (k-medias corto)
  const used = cells.filter(Boolean); if (!used.length) return null;
  const dist = (a, b) => 2 * (a[0] - b[0]) ** 2 + 4 * (a[1] - b[1]) ** 2 + 3 * (a[2] - b[2]) ** 2;
  let pal = [used[0]];
  while (pal.length < Math.min(o.k, used.length)) { let far = null, fd = -1; for (let i = 0; i < used.length; i += Math.max(1, Math.floor(used.length / 400))) { const c = used[i]; const m = Math.min(...pal.map(p => dist(p, c))); if (m > fd) { fd = m; far = c; } } if (fd < 30) break; pal.push(far); }
  for (let it = 0; it < 6; it++) { const acc = pal.map(() => [0, 0, 0, 0]); used.forEach(c => { let bi = 0, bd = 1e12; pal.forEach((p, i) => { const dd = dist(p, c); if (dd < bd) { bd = dd; bi = i; } }); const a = acc[bi]; a[0] += c[0]; a[1] += c[1]; a[2] += c[2]; a[3]++; }); pal = pal.map((p, i) => acc[i][3] ? [acc[i][0] / acc[i][3], acc[i][1] / acc[i][3], acc[i][2] / acc[i][3]].map(Math.round) : p); }
  const hex = c => '#' + c.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
  let pals = pal.map(hex);
  const W2 = w + pad * 2, H2 = h + pad * 2; let grid = Array.from({ length: H2 }, () => Array(W2).fill('.'));
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const c = cells[j * w + i]; if (!c) continue; let bi = 0, bd = 1e12; pal.forEach((p, k) => { const dd = dist(p, c); if (dd < bd) { bd = dd; bi = k; } }); grid[j + pad][i + pad] = bi.toString(36); }
  const ring = ch => { const add = []; for (let j = 0; j < H2; j++) for (let i = 0; i < W2; i++) if (grid[j][i] === '.' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => grid[j + b] && grid[j + b][i + a] && grid[j + b][i + a] !== '.' && grid[j + b][i + a] !== '·')) add.push([i, j]); add.forEach(([i, j]) => grid[j][i] = ch); };
  if (o.border) { pals.push('#ffffff'); ring((pals.length - 1).toString(36)); }
  if (o.line) { pals.push('#7a4a52'); ring((pals.length - 1).toString(36)); }
  return { w: W2, h: H2, raw: grid.map(r => r.join('')), pal: pals.join(',') };
}
function applyPix(r, keepSize) {
  if (!r) return toast('No encontré el dibujo. Prueba con otra imagen.');
  snap(); ed.w = r.w; ed.h = r.h; ed.map = r.raw; ed.pal = r.pal.split(','); ed.cell = r.cell; ed.color = '0'; ed.tool = 'pen';
  if (!keepSize && ed.kind === 'furn') { const k = 36 / Math.max(r.w, r.h); ed.dw = Math.max(8, Math.round(r.w * k)); }
  if (!keepSize && ed.kind === 'clothes') { ed.dw = 14; ed.dx = 0; ed.dy = 0; }
  A.render();
}
function runPhoto(keepSize) { if (!edImg) return; applyPix(photoToPixel(edImg, ed.ph), keepSize !== false); }
async function importImage(file, mode) {
  try { edImg = await A.readPixels(file); } catch (e) { return toast('No pude abrir esa imagen'); }
  ed.mode = mode;
  if (mode === 'photo') { const st = ed.kind === 'stickers'; ed.ph = { n: ed.kind === 'walls' || ed.kind === 'floors' ? 16 : st ? 40 : 32, k: 16, bg: true, border: st, line: !st && ed.kind !== 'walls' && ed.kind !== 'floors' }; applyPix(photoToPixel(edImg, ed.ph)); return; }
  const r = A.pixFit(edImg, MAXN[ed.kind] || 64); applyPix(r);
  if (r) toast(`Lista: ${r.w} × ${r.h} cuadritos, ${r.pal.split(',').length} colores.`);
}
async function importMany(files) {
  const kind = ed.kind; A.CFG.catalog = A.CFG.catalog || {}; const list = A.CFG.catalog[kind] = A.CFG.catalog[kind] || []; let n = 0;
  toast(`Convirtiendo ${files.length} imágenes…`);
  for (const f of files.slice(0, 40)) {
    try {
      const img = await A.readPixels(f); const r = A.pixFit(img, MAXN[kind] || 64); if (!r) continue;
      const name = f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim().slice(0, 30) || 'Nuevo';
      const item = { id: uid(), name: name[0].toUpperCase() + name.slice(1), how: kind === 'stickers' || kind === 'icons' ? 'free' : ed.how, price: +ed.price || 0, w: r.w, h: r.h, map: r.raw, pal: r.pal, off: false };
      if (kind === 'furn') { item.dw = Math.max(8, Math.round(r.w * 36 / Math.max(r.w, r.h))); item.dh = item.dw * r.h / r.w; item.wall = false; }
      if (kind === 'clothes') { item.dw = 14; item.dh = 14 * r.h / r.w; item.slot = ed.slot || 'head'; item.dx = 0; item.dy = 0; }
      if (kind === 'food') item.gain = 20; if (kind === 'chars') item.rare = +ed.rare || 1; if (kind === 'pets') { item.desc = ''; item.say = ''; }
      if ((ed.col || '').trim()) item.col = ed.col.trim(); if (ed.from) item.from = ed.from;
      list.push(item); n++;
    } catch (e) { }
  }
  ed = null; await saveCatalog(); toast(`Listo: agregué ${n} ${n === 1 ? 'cosa' : 'cosas'}. Toca cada una si quieres retocarla.`);
}
ACT.edDetail = a => { if (!edImg || !ed.cell) return; const r = A.pixFit(edImg, MAXN[ed.kind] || 64, ed.cell * (+a.dataset.v > 0 ? 0.85 : 1.18)); if (r && +a.dataset.v > 0 && Math.max(r.w, r.h) >= (MAXN[ed.kind] || 64) * .98 && r.cell >= ed.cell * .99) return toast('Ya está con el máximo detalle'); applyPix(r, true); };
async function saveCatalog() {
  A.CFG.catalog = Object.assign({ pets: [], furn: [], clothes: [], food: [] }, A.CFG.catalog || {});
  latestCatalog = JSON.parse(JSON.stringify(A.CFG.catalog));
  try { await Store.saveConfig(A.CFG); registerCatalog(); toast('Guardado. Ya les aparece a todas.'); } catch (e) { toast('No se pudo guardar. Revisa tu conexión.'); }
  A.render();
}
let latestCatalog = null;
A.saveCatalog = () => saveCatalog();
ACT.seAdd = () => {
  const n = ($('#seName').value || '').trim(), f = $('#seFrom').value, t = $('#seTo').value;
  if (!n || !f || !t) return toast('Pon el nombre y las dos fechas');
  A.CFG.catalog = A.CFG.catalog || {}; const L = A.CFG.catalog.seasons = A.CFG.catalog.seasons || [];
  L.push({ id: 'cs_' + uid(), name: n, from: f.slice(5), to: t.slice(5) }); S.seasOpen = true; saveCatalog();
};
ACT.seDel = a => { if (!a.dataset.s) { a.dataset.s = 1; a.textContent = '¿Segura?'; return; } A.CFG.catalog.seasons = (A.CFG.catalog.seasons || []).filter(x => x.id !== a.dataset.id); S.seasOpen = true; saveCatalog(); };
ACT.catKind = a => { S.catKind = a.dataset.v; ed = null; A.render(); };
ACT.catEdit = a => { const kind = S.catKind || 'pets'; const it = (catalog()[kind] || []).find(x => x.id === a.dataset.id); newDraft(kind, it); A.render(); setTimeout(() => { const f = $('#catForm'); if (f) f.scrollIntoView({ behavior: 'smooth' }); }, 50); };
ACT.edNew = () => { newDraft(S.catKind || 'pets'); A.render(); };
ACT.edClear = () => { snap(); ed.map = blankMap(ed.w, ed.h); edPaintCanvas(); };
// guarda solo los colores que de verdad se usan
function compact(map, pal) {
  const used = [...new Set(map.join('').replace(/\./g, ''))].sort((a, b) => parseInt(a, 36) - parseInt(b, 36));
  const re = {}; used.forEach((c, i) => re[c] = i.toString(36));
  return { map: map.map(r => [...r].map(ch => ch === '.' ? '.' : re[ch]).join('')), pal: used.map(c => pal[parseInt(c, 36)]).join(',') };
}
ACT.edSave = () => {
  if (!ed.name.trim()) return toast('Ponle un nombre');
  if (!ed.map.some(r => /[^.]/.test(r))) return toast('Dibuja algo o sube una imagen');
  const kind = ed.kind; A.CFG.catalog = A.CFG.catalog || {}; const list = A.CFG.catalog[kind] = A.CFG.catalog[kind] || [];
  if (ed.f2) { ed.map2 = ed.map; ed.map = ed.map1; ed.f2 = false; }
  const m2 = ed.map2 && ed.map2.length === ed.map.length && ed.map2.some((r, i) => r !== ed.map[i]) ? ed.map2 : null;
  const cp = compact(m2 ? ed.map.concat(m2) : ed.map, ed.pal); const mapA = cp.map.slice(0, ed.h), mapB = m2 ? cp.map.slice(ed.h) : null;
  const free = kind === 'stickers' || kind === 'icons';
  const item = { id: ed.id || uid(), name: ed.name.trim(), how: free ? 'free' : ed.how, price: +ed.price || 0, w: ed.w, h: ed.h, map: mapA, pal: cp.pal, off: !!ed.off };
  if (mapB) item.map2 = mapB; if ((ed.col || '').trim()) item.col = ed.col.trim(); if (ed.from) item.from = ed.from;
  if (kind === 'furn' || kind === 'clothes') { item.dw = Math.max(3, +ed.dw || 14); item.dh = Math.max(2, Math.round(item.dw * ed.h / ed.w * 10) / 10); }
  if (kind === 'clothes') Object.assign(item, { slot: ed.slot, dx: +ed.dx || 0, dy: +ed.dy || 0 });
  if (kind === 'pets') Object.assign(item, { desc: ed.desc, say: ed.desc });
  if (kind === 'food') Object.assign(item, { gain: +ed.gain || 20 });
  if (kind === 'chars') item.rare = +ed.rare || 1;
  if (kind === 'boxes') { const err = A.boxSaveItem ? A.boxSaveItem(ed, item) : 'Falta la parte de las cajitas'; if (err) return toast(err); }
  if (kind === 'furn') { Object.assign(item, { wall: !!ed.wall, cat: ed.cat || (ed.wall ? 'pared' : 'deco') }); if (ed.light) item.light = ed.light; if (ed.lx != null) { item.lx = +ed.lx; item.ly = +ed.ly; } if (+ed.lr) item.lr = +ed.lr; if (ed.light === 'ventana' && ed.glass) item.glass = ed.glass; }
  if (ed.how === 'logro') item.ach = ed.ach; if (ed.how === 'temporada') item.season = ed.season;
  const i = list.findIndex(x => x.id === item.id); if (i >= 0) list[i] = item; else list.push(item);
  if (ed.replaces) markSwap(kind, ed.replaces, item.id);
  ed = null; saveCatalog();
};
ACT.edOff = () => { const list = A.CFG.catalog[ed.kind]; const it = list.find(x => x.id === ed.id); if (it) it.off = !it.off; ed = null; saveCatalog(); };
ACT.edDel = a => { if (!a.dataset.s) { a.dataset.s = 1; a.textContent = '¿Segura? Toca otra vez'; return; } A.CFG.catalog[ed.kind] = A.CFG.catalog[ed.kind].filter(x => x.id !== ed.id); ed = null; saveCatalog(); };

// ---- Lo que ya viene en la app: la dueña lo puede quitar o reemplazar ----
const GONE_KINDS = ['pets', 'furn', 'clothes', 'food', 'walls', 'floors'];
const NEW_PFX = { pets: 'cp_', furn: 'cf_', clothes: 'cc_', food: 'cfo_', walls: 'cw_', floors: 'cl_' };
function goneOf(kind) { const g = (A.CFG && A.CFG.catalog && A.CFG.catalog.gone) || {}; return g[kind] || []; }
const GONE_STASH = { walls: {}, floors: {} };
function builtins(kind) {
  if (kind === 'pets') return Object.entries(BASE_PETS).map(([k, v]) => ({ k, name: v.name, src: spr(v.sprite, 2) }));
  if (kind === 'furn') return Object.entries(FURN).filter(([, v]) => !v.custom).map(([k, v]) => ({ k, name: v.name, src: Pix.sprite(furnSprite(k), 2) }));
  if (kind === 'clothes') return Object.entries(A.ACC || {}).filter(([, v]) => !v.custom).map(([k, v]) => ({ k, name: v.name, src: Pix.sprite('acc_' + k, 3) }));
  if (kind === 'food') return Object.entries(FOODS).filter(([, v]) => !v.custom).map(([k, v]) => ({ k, name: v.name, src: spr(v.sprite || k, 3) }));
  const T = kind === 'walls' ? WALLS : FLOORS, st = GONE_STASH[kind], pre = kind === 'walls' ? 'x_pared_' : 'x_piso_', cp = kind === 'walls' ? 'cw_' : 'cl_';
  return Object.entries(Object.assign({}, st, T)).filter(([k]) => !k.startsWith(cp)).map(([k, v]) => ({ k, name: v[0], src: Pix.sprite(pre + k, 1), tile: true }));
}
function applyGone() {
  const g = k => goneOf(k);
  Object.entries(FURN).forEach(([k, v]) => { if (v.custom) return; const on = g('furn').includes(k); if (on && !v._gone) { v._off0 = v.off; v._gone = true; v.off = true; } else if (!on && v._gone) { v.off = v._off0; delete v._gone; delete v._off0; } });
  Object.entries(FOODS).forEach(([k, v]) => { if (v.custom) return; const on = g('food').includes(k); if (on && !v._gone) { v._off0 = v.off; v._gone = true; v.off = true; } else if (!on && v._gone) { v.off = v._off0; delete v._gone; delete v._off0; } });
  Object.entries(A.ACC || {}).forEach(([k, a]) => { if (a.custom) return; const on = g('clothes').includes(k); if (on && !a.gone) { a._off0 = a.off; a.gone = true; } else if (!on && a.gone) { a.gone = false; a.off = a._off0; delete a._off0; } });
  [['walls', WALLS, 'cw_'], ['floors', FLOORS, 'cl_']].forEach(([kind, T, cp]) => {
    const st = GONE_STASH[kind];
    Object.keys(st).forEach(k => { if (!g(kind).includes(k)) { T[k] = st[k]; delete st[k]; } });
    g(kind).forEach(k => { if (T[k] && !k.startsWith(cp)) { st[k] = T[k]; delete T[k]; } });
  });
  migrateSwaps();
}
// a quien tenía lo viejo le llega lo nuevo que lo reemplazó
function migrateSwaps() {
  const sw = (A.CFG && A.CFG.catalog && A.CFG.catalog.swap) || {}; let ch = false;
  Object.entries(sw).forEach(([key, nu]) => {
    const [kind, old] = key.split(':'); if (!old || !nu || old === nu) return;
    if (kind === 'pets') {
      if (!S.settings.pet || !A.ANCH[nu]) return; const p = P();
      const swap = arr => { if (!arr.includes(old)) return arr; ch = true; return [...new Set(arr.map(x => x === old ? nu : x))]; };
      p.owned = swap(p.owned); p.room = swap(p.room); if (p.active === old) { p.active = nu; ch = true; }
      ['care', 'xp', 'since', 'lvSeen'].forEach(f => { if (p[f] && p[f][old] != null && p[f][nu] == null) { p[f][nu] = p[f][old]; delete p[f][old]; ch = true; } });
      const ro = R(); if (ro.equip && ro.equip[old] && !ro.equip[nu]) { ro.equip[nu] = ro.equip[old]; delete ro.equip[old]; ch = true; }
    } else if (kind === 'clothes') {
      const n2 = 'cc_' + nu.replace(/^cc_/, ''); if (!A.ACC[n2]) return; const ro = R(); ro.owned = ro.owned || [];
      if (ro.owned.includes('acc:' + old)) { ro.owned = [...new Set(ro.owned.map(x => x === 'acc:' + old ? 'acc:' + n2 : x))]; ch = true; }
      Object.values(ro.equip || {}).forEach(eq => { if (eq && typeof eq === 'object') Object.keys(eq).forEach(sl => { if (eq[sl] === old) { eq[sl] = n2; ch = true; } }); });
    } else if (kind === 'furn') {
      if (!FURN[nu] || !S.settings.rincon) return; const r = room(); const n = cnt(old);
      if (n > 0) { addInv(nu, n); addInv(old, -n); ch = true; }
      Object.values(r.rooms || {}).forEach(rm => (rm.items || []).forEach(it => { if (it.k === old) { it.k = nu; ch = true; } }));
    } else if (kind === 'food') {
      if (!FOODS[nu] || !S.settings.pet) return; const p = P();
      if (p.pantry[old]) { p.pantry[nu] = (p.pantry[nu] || 0) + p.pantry[old]; delete p.pantry[old]; ch = true; }
    } else if (kind === 'walls' || kind === 'floors') {
      const T = kind === 'walls' ? WALLS : FLOORS, f = kind === 'walls' ? 'wall' : 'floor'; if (!T[nu] || !S.settings.rincon) return; const r = room();
      if (r.owned.includes(f + ':' + old)) { r.owned = r.owned.map(x => x === f + ':' + old ? f + ':' + nu : x); ch = true; }
      Object.values(r.rooms || {}).forEach(rm => { if (rm[f] === old) { rm[f] = nu; ch = true; } });
    }
  });
  if (ch) A.saveSettings();
}
function setGone(kind, k, on) {
  A.CFG.catalog = A.CFG.catalog || {}; const g = A.CFG.catalog.gone = A.CFG.catalog.gone || {};
  g[kind] = (g[kind] || []).filter(x => x !== k); if (on) g[kind].push(k);
  if (!on && A.CFG.catalog.swap) delete A.CFG.catalog.swap[kind + ':' + k];
}
function markSwap(kind, old, id) {
  setGone(kind, old, true); const sw = A.CFG.catalog.swap = A.CFG.catalog.swap || {};
  sw[kind + ':' + old] = NEW_PFX[kind] + id;
}
function builtinHTML(kind) {
  if (!GONE_KINDS.includes(kind)) return '';
  const g = goneOf(kind); const sw = (A.CFG.catalog && A.CFG.catalog.swap) || {};
  const list = builtins(kind); if (!list.length) return '';
  const nameOf = key => { const all = catalog()[kind] || []; const it = all.find(x => NEW_PFX[kind] + x.id === key); return it ? it.name : 'otro'; };
  return `<div class="card stack" id="bltCard"><h3 style="margin:0">${KIND_PL[kind]} que ya vienen en la app</h3>
<p class="faint" style="margin:0">Quítalos o reemplázalos por uno tuyo. Lo quitado ya no sale en la tienda ni para adoptar; quien ya lo tenía lo conserva. Si lo reemplazas, a quien lo tenía le llega el nuevo.</p>
<div class="list">${list.map(x => { const off = g.includes(x.k); const to = sw[kind + ':' + x.k];
    return `<div class="li" style="gap:10px;${off ? 'opacity:.6' : ''}"><span class="ad-item-art ${x.tile ? 'tile' : ''}" style="flex:0 0 auto"><img class="pixel" alt="" src="${x.src}" style="max-width:40px;max-height:40px"></span><span class="tx-main" style="flex:1;min-width:0"><b>${esc(x.name)}</b><span>${off ? (to ? 'Reemplazado por ' + esc(nameOf(to)) : 'Quitado de la app') : 'Viene con la app'}</span></span>
<span class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-end">${off ? `<button class="btn sm" data-act="bltBack" data-k="${x.k}">Volver a poner</button>` : `<button class="btn sm" data-act="bltRepl" data-k="${x.k}">Reemplazar</button><button class="btn sm danger" data-act="bltDel" data-k="${x.k}">Quitar</button>`}</span></div>`; }).join('')}</div></div>`;
}
function replBanner() {
  const b = builtins(ed.kind).find(x => x.k === ed.replaces); if (!b) return '';
  return `<div class="row" style="gap:10px;padding:10px;border-radius:12px;background:#fff3c4;color:#6b4d12"><img class="pixel" alt="" src="${b.src}" style="max-width:36px;max-height:36px"><div style="flex:1"><b>Reemplazando a ${esc(b.name)}</b><div style="font-size:13px">Dibuja o sube el nuevo y toca Guardar. ${esc(b.name)} se quita de la app y a quien lo tenía le llega este.</div></div><button class="btn sm" data-act="bltCancel">Cancelar</button></div>`;
}
ACT.bltDel = a => { if (!a.dataset.s) { a.dataset.s = 1; a.textContent = '¿Segura? Toca otra vez'; return; } setGone(S.catKind || 'pets', a.dataset.k, true); saveCatalog(); };
ACT.bltBack = a => { setGone(S.catKind || 'pets', a.dataset.k, false); saveCatalog(); };
ACT.bltRepl = a => {
  const kind = S.catKind || 'pets', k = a.dataset.k; newDraft(kind);
  const pre = kind === 'pets' ? BASE_PETS[k] : kind === 'furn' ? FURN[k] : kind === 'food' ? FOODS[k] : kind === 'clothes' ? A.ACC[k] : null;
  if (pre) { ed.name = pre.name || ''; if (pre.desc) ed.desc = pre.desc; if (pre.price != null) ed.price = pre.price; if (pre.how && ['stars', 'free', 'logro', 'raro'].includes(pre.how)) ed.how = pre.how; if (pre.ach) ed.ach = pre.ach; if (kind === 'clothes' && pre.slot) ed.slot = pre.slot; if (kind === 'food' && pre.gain) ed.gain = pre.gain; if (kind === 'furn') { ed.wall = !!pre.wall; if (pre.cat) ed.cat = pre.cat; } }
  else { const T = kind === 'walls' ? WALLS : FLOORS; const v = T[k] || GONE_STASH[kind][k]; if (v) { ed.name = v[0]; ed.price = v[1]; ed.how = v[1] ? 'stars' : 'free'; } }
  ed.replaces = k; A.render(); setTimeout(() => { const f = $('#catForm'); if (f) f.scrollIntoView({ behavior: 'smooth' }); }, 50);
};
ACT.bltCancel = () => { newDraft(S.catKind || 'pets'); A.render(); };
// botón en el panel de admin
const adminScreen = A.screens.admin;
A.screens.admin = () => { const h = adminScreen(); if (!Store.isOwner) return h; const btn = `<button class="card row" data-go="admincat" style="gap:12px;width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer"><img class="pixel" alt="" src="${spr('maca', 3)}" style="width:44px"><img class="pixel" alt="" src="${Pix.sprite('x_lampara', 2)}" style="height:44px;margin-left:-6px"><div style="flex:1"><b>Agregar mascotas, muebles, ropa, comida y personajes</b><div class="faint">Dibújalas o sube una imagen pixel</div></div><span class="faint">›</span></button>`; const i = h.indexOf('<details'); return i > 0 ? h.slice(0, i) + btn + h.slice(i) : h + btn; };
// que guardar los demás ajustes del admin no borre lo que agregaste
const saveCfg = Store.saveConfig.bind(Store);
Store.saveConfig = cfg => { if (latestCatalog && cfg) cfg.catalog = JSON.parse(JSON.stringify(latestCatalog)); return saveCfg(cfg); };
const cfgSave = ACT.cfgSave;
ACT.cfgSave = async (...x) => { await cfgSave(...x); if (latestCatalog) A.CFG.catalog = JSON.parse(JSON.stringify(latestCatalog)); registerCatalog(); A.render(); };

// ---------------- Arranque ----------------
const st0 = A.start;
A.start = async () => {
  await st0();
  latestCatalog = A.CFG && A.CFG.catalog ? JSON.parse(JSON.stringify(A.CFG.catalog)) : null;
  registerCatalog();
  // cuando llega la configuración nueva (o se vuelve a la app), se registran los muebles, ropa y comida nuevos
  const rc0 = A.reloadConfig;
  if (rc0) A.reloadConfig = () => { rc0(); latestCatalog = A.CFG && A.CFG.catalog ? JSON.parse(JSON.stringify(A.CFG.catalog)) : null; registerCatalog(); A.render(); };
  A._ready = true;
  if (Store.refreshConfig) document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && navigator.onLine) Store.refreshConfig(); });
  const p = P(); if (p.active) { care(p.active); if (!p.since[p.active]) p.since[p.active] = today(); }
  // si el logro de Cupi ya está, queda lista para adoptar (no se adopta sola)
  A.render();
};
})();
