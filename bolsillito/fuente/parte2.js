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
function sub(key, back, right) { return `<div class="ph"><div class="ph-left"><button class="navarrow" data-go="${back || 'rincon'}" aria-label="Volver">‹</button><span class="pill">${esc(A.PAGES[key])}</span></div>${right || ''}</div>`; }
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
  cuarto: { name: 'Mi cuarto', price: 0, wall: 'rosa', floor: 'madera' },
  cocina: { name: 'Cocina', price: 120, wall: 'cereza', floor: 'cuadros', gift: ['cocina', 'mesa'] },
  juegos: { name: 'Cuarto de juegos', price: 150, wall: 'lila', floor: 'lila', gift: ['alfombra_lila', 'peluche'] },
  jardin: { name: 'Jardín', price: 150, wall: 'cielo', floor: 'pasto', gift: ['cerezo', 'flores'] }
};
// ropa de temporada (mismo sistema que la Tiendita)
const SEAS_ACC = {
  calabaza: { slot: 'head', name: 'Gorrito de calabaza', price: 30, season: 'halloween', map: ['...G....', '..aaaa..', '.aAaaAa.', 'aaAaaAaa', 'aaAaaAaa'] },
  navidad: { slot: 'head', name: 'Gorrito navideño', price: 30, season: 'navidad', map: ['......ww', '.....RRw', '...RRRR.', '..RRRRR.', '.RRRRRR.', 'wwwwwwww'] },
  bufanda_verde: { slot: 'neck', name: 'Bufanda verde', price: 25, season: 'navidad', map: ['GGGGGGGGGGGG', 'GwGwGwGwGwGw', '......GG....', '......Gw....'] },
  corona_corazon: { slot: 'head', name: 'Corona de corazones', price: 35, season: 'valentin', map: ['P...P...P', 'PP.PPP.PP', 'PPPPPPPPP', 'RRRRRRRRR'] }
};
function addAcc(id, a) { a.w = a.map[0].length + 2; a.h = a.map.length + 2; A.ACC[id] = a; Pix.define('acc_' + id, { w: a.w, h: a.h, fn(p) { p.map(1, 1, a.map); } }); }
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
const catalog = () => { const c = (A.CFG && A.CFG.catalog) || {}; return { pets: c.pets || [], furn: c.furn || [], clothes: c.clothes || [], food: c.food || [], seasons: c.seasons || [] }; };
const defMap = (name, w, h, map) => Pix.define(name, { w, h, fn(p) { p.map(0, 0, map); } });
let customKeys = { pets: [], furn: [], clothes: [], food: [] };
function registerCatalog() {
  customKeys.furn.forEach(k => delete FURN[k]); customKeys.food.forEach(k => delete FOODS[k]); customKeys.clothes.forEach(k => delete A.ACC[k]);
  customKeys.pets.forEach(k => delete A.ANCH[k]);
  customKeys = { pets: [], furn: [], clothes: [], food: [] };
  const c = catalog();
  c.pets.forEach(x => { const k = 'cp_' + x.id; defMap(k, x.w || 20, x.h || 20, x.map); customKeys.pets.push(k); if (!x.off) A.ANCH[k] = { hx: (x.w || 20) / 2, hy: x.hy || 5, fy: x.fy || 10, ny: x.ny || 15, sprite: k, name: x.name }; });
  c.furn.forEach(x => { const k = 'cf_' + x.id; defMap(k, x.w, x.h, x.map); customKeys.furn.push(k); FURN[k] = { name: x.name, w: x.w, h: x.h, price: +x.price || 0, how: x.how, ach: x.ach, season: x.season, sprite: k, x: Math.max(0, 72 - x.w / 2), y: x.wall ? 4 : 70, cat: x.wall ? 'pared' : 'deco', wall: !!x.wall, off: x.off, custom: true }; });
  c.food.forEach(x => { const k = 'cfo_' + x.id; defMap(k, x.w || 16, x.h || 16, x.map); customKeys.food.push(k); FOODS[k] = { name: x.name, art: x.name, gain: +x.gain || 20, price: +x.price || 3, sprite: k, off: x.off, custom: true }; });
  c.clothes.forEach(x => { const k = 'cc_' + x.id; customKeys.clothes.push(k); addAcc(k, { slot: x.slot || 'head', name: x.name, price: +x.price || 10, season: x.how === 'temporada' ? x.season : null, ach: x.how === 'logro' ? x.ach : null, raro: x.how === 'raro', map: x.map.map(r => r), off: x.off, offAdmin: x.off, custom: true }); });
  seasonGate();
}
function seasonGate() {
  const owned = R().owned || [];
  Object.entries(A.ACC).forEach(([id, a]) => {
    if (a.season || a.raro || a.ach) a.off = !!a.offAdmin || (!owned.includes('acc:' + id) && !(a.season && inSeason(a.season)) && !(a.ach && achOk(a.ach)));
    if (a.custom && a.offAdmin) a.off = true;
  });
}
A.registerCatalog = registerCatalog;
const achOk = id => { const a = (A.RC.ACH || []).find(x => x.id === id); return a && A.rcStats ? a.ok(A.rcStats()) : false; };

function allPets() {
  const out = {}; Object.entries(BASE_PETS).forEach(([k, v]) => out[k] = v);
  catalog().pets.forEach(x => { if (!x.off) out['cp_' + x.id] = { name: x.name, sprite: 'cp_' + x.id, desc: x.desc || '', say: x.say || x.desc || '¡Hola!', how: x.how || 'stars', price: +x.price || 0, ach: x.ach, season: x.season, custom: true }; });
  return out;
}
A.allPets = allPets;

// ---------------- Estado de las mascotas ----------------
function P() {
  const s = S.settings; const p = s.pet = s.pet || {};
  p.owned = p.owned || ['gochi', 'yaki', 'shey', 'ale']; p.room = p.room || ['gochi', 'yaki', 'shey'];
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
// premios por nivel (se ganan con el nivel más alto de tus mochis)
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
A.PAGES.rincon = 'Mis mochis';
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
  ['tienda', 'gift', 'Tiendita'], ['visitas', 'casita', 'Visitas', !!(A.navDotVisits && A.navDotVisits())], ['shey', 'shey', 'Antojos']
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
  const id = p.active, c = care(id), lv = level(id);
  checkLevelUp(); moneyMood();
  return `${A.header('rincon', starsPill())}${tabs}
<div class="pc-scene ${c.sleep ? 'dormida' : ''}" id="pcScene" style="background-image:url(${Pix.banner(R().bg || 'cielo')})">
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
<div class="pc-places">${PLACES().map(([go, ic, n, dot]) => `<button class="pc-place" data-go="${go}">${dot ? '<span class="pc-dot"></span>' : ''}<img class="pixel" alt="" src="${spr(ic, 3)}">${n}</button>`).join('')}</div></section>`;
};
ACT.pcTab = a => { S.pcTab = a.dataset.v; S.roomEdit = false; A.render(); window.scrollTo(0, 0); };
A.after.rincon = el => { if (S.pcTab === 'cuarto' && A.after.cuarto) A.after.cuarto(el); };
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
// cerrar el día con Ale también le da de cenar a tu mascota
const render0 = A.render;
A.render = (...x) => { const p = P(); const d = today(); const rec = (S.fin.dayLog || {})[d]; if (p.active && rec && rec.closed && p.aleFed !== d) { p.aleFed = d; const c = care(p.active); c.h = clamp(c.h + 25); c.f = clamp(c.f + 10); A.saveSettings(); setTimeout(() => toast(`Ale le dio de cenar a ${info(p.active).name}`), 1200); } return render0(...x); };
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
  if (kind === 'love') [[30, 30, 0, 28, 'heart'], [80, 20, .2, 22, 'heartS'], [55, 0, .4, 30, 'heart'], [105, 40, .55, 20, 'heartY'], [15, 55, .7, 18, 'heartB']].forEach(([x, y, d, w, n]) => add(spr(n, 3), 'fx-heart', `left:calc(50% - 70px + ${x}px);top:${y}px;width:${w}px;animation-delay:${d}s`));
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
  const draw = () => openSheet('Comprar comida', `<div class="stack"><div class="row between"><span class="faint">Se guarda en la despensa.</span>${starsPill()}</div>
<div class="fr-shop">${Object.entries(FOODS).filter(([, f]) => !f.off).map(([k, f]) => `<button class="shop-tile" data-buyfood="${k}" ${bal() < f.price ? 'disabled' : ''}><img class="pixel" alt="" src="${spr(f.sprite || k, 3)}" style="width:40px"><span>${esc(f.name)}</span><em>${ST(12)} ${f.price} · tienes ${p.pantry[k] || 0}</em></button>`).join('')}</div>
<p class="faint" style="margin:0">En el juego de atrapar comidita la consigues gratis.</p></div>`, sh => {
    sh.addEventListener('click', e => { const b = e.target.closest('[data-buyfood]'); if (!b) return; const k = b.dataset.buyfood; if (!spend(FOODS[k].price)) return; p.pantry[k] = (p.pantry[k] || 0) + 1; A.saveSettings(); toast(`${FOODS[k].name} a la despensa`); draw(); });
  });
  draw();
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
<div class="k-lbl">TUS MOCHIS Y LOS NUEVOS</div>
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
  return `${sub('coleccion', 'rincon', `<span class="pill sm">${mine.length} de ${all.length} mochis</span>`)}
<div class="k-lbl">TUS MOCHIS</div>
<div class="col-grid">${mine.map(k => `<button class="col-pet" data-act="colPet" data-id="${k}"><img class="pixel" alt="" src="${spr(pets[k].sprite, 3)}"><b>${esc(pets[k].name)}</b><span class="faint">nivel ${level(k).L}</span>${tag(k)}</button>`).join('')}</div>
${others.length ? `<div class="k-lbl">NUEVOS PARA ADOPTAR</div><div class="list">${others.map(k => { const pt = pets[k]; return `<button class="li" data-act="colNew" data-id="${k}"><span class="ic" style="width:52px;height:52px"><img class="pixel" alt="" src="${spr(pt.sprite, 3)}" style="width:48px"></span><span class="tx-main"><b>${esc(pt.name)}</b><span>${esc(pt.desc)}</span></span><span class="tag gold" style="white-space:nowrap">${howTxt(pt, k)}</span></button>`; }).join('')}</div>` : ''}
<div class="k-lbl">MUY PRONTO</div>
<div class="col-grid soon">${[0, 1, 2, 3].map(() => `<div class="col-pet"><img class="pixel" alt="" src="${spr('silueta', 3)}" style="opacity:.5"><span class="faint">¿?</span></div>`).join('')}</div>
<p class="faint" style="margin:0">Elige hasta 3 mochis para que vivan en tu cuarto. Los demás se quedan guardados y los cambias cuando quieras.</p>`;
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
      if (inRoom) { if (p.room.length <= 1) return toast('Tu cuarto necesita al menos un mochi'); p.room = p.room.filter(x => x !== id); }
      else { if (p.room.length >= 3) return toast('Ya hay 3 mochis en el cuarto. Guarda uno primero.'); p.room.push(id); }
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
<div class="card gr-path">${LV_PRIZES.map(([L, k, a, , t]) => { const ok = maxL >= L; return `<div class="gr-step ${ok ? 'ok' : ''}"><span class="gr-lv">${L}</span><span class="gr-ic">${img(k === 'food' ? a : k === 'stars' ? 'estrellita' : k === 'wall' ? 'casita' : k === 'floor' ? 'casita' : k === 'acc' ? 'acc_' + a : k === 'furn' ? 'x_' + a : k === 'wings' ? 'alitas' : 'brotecito', 28)}</span><span style="flex:1">${esc(t)}</span>${ok ? img('check', 18) : img('candado', 16)}</div>`; }).join('')}<p class="faint" style="margin:6px 0 0">Cuenta el nivel más alto de tus mochis. Los premios se guardan solos.</p></div>
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
${[['Anotar al menos un movimiento en el día', RW.day], ['Poner dinero en una meta', RW.goalTx], ['Decorar una semana del journal', RW.journalWeek], ['Cumplir una meta', RW.goalDone], ['Terminar un mes sin pasarte', RW.monthUnder], ['Resistir un antojo con Shey', RW.antojo], ['Cerrar el día con Ale', RW.closeDay], ['Darle cariño a tu mascota (una vez al día)', RW.pet]].map(([t, n]) => `<div class="row between"><span>${t}</span><b>+${n || 0} ${ST(14)}</b></div>`).join('')}
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
    let left = an.hx - a.w / 2, top;
    if (slot === 'head') { top = an.hy - a.h + 2 + (a.lift || 0); if (a.halo) top = an.hy - a.h - 1; if (a.side) { left = an.hx + 2; top = an.hy - 1; } }
    else if (slot === 'face') top = an.fy - a.h / 2; else top = an.ny - 1;
    return `<img class="pixel rm-acc" alt="" src="${Pix.sprite('acc_' + eq[slot], sc || 4)}" draggable="false" style="left:${left / 20 * 100}%;top:${top / 20 * 100}%;width:${a.w / 20 * 100}%">`;
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
  const html = items.map(({ it, f }) => {
    const sp = it.k === 'ventana' && night ? 'x_ventana_noche' : furnSprite(it.k);
    let extra = '';
    if (f.photo && photos.length) { const src = photos[ph++ % photos.length]; extra = `<span class="rm-photo" style="left:${pct(it.x + 2, RW)};top:${pct(it.y + 2, RH)};width:${pct(12, RW)};height:${pct(10, RH)};z-index:${zOf(it, f) + 1};background-image:url('${esc(src)}')"></span>`; }
    const glow = night && f.glow ? `<span class="rm-glow" style="left:${pct(it.x + f.glow[0] - f.glow[2], RW)};top:${pct(it.y + f.glow[1] - f.glow[2], RH)};width:${pct(f.glow[2] * 2, RW)}"></span>` : '';
    return `<img class="pixel rm-it ${opts.sel === it.u ? 'sel' : ''}" alt="${esc(f.name)}" data-u="${it.u}" draggable="false" src="${Pix.sprite(sp, 3)}" style="left:${pct(it.x, RW)};top:${pct(it.y, RH)};width:${pct(f.w, RW)};z-index:${zOf(it, f)};${it.fl ? 'transform:scaleX(-1);' : ''}">${extra}${glow}`;
  }).join('');
  const petHtml = spots.map((s, i) => `<span class="rm-pet ${s.sleep ? 'sleep' : ''} ${list[i].guest ? 'guest' : ''}" aria-label="${esc(info(s.k).name)}" style="left:${pct(s.x, RW)};top:${pct(s.y, RH)};z-index:${10 + Math.round(s.z)};animation-delay:-${i * .6}s">${dressed(s.k, list[i].eq, 4)}</span>`
    + (s.sleep ? `<img class="pixel rm-zz" alt="" src="${spr('zzz', 2)}" style="left:${pct(s.x + 16, RW)};top:${pct(s.y - 8, RH)}">` : '')
    + (s.notes ? `<img class="pixel rm-note" alt="" src="${spr('music', 2)}" style="left:${pct(s.x + 18, RW)};top:${pct(s.y - 10, RH)}"><img class="pixel rm-note b" alt="" src="${spr('music', 2)}" style="left:${pct(s.x - 4, RW)};top:${pct(s.y - 6, RH)}">` : '')
    + (s.eat ? `<img class="pixel rm-food" alt="" src="${spr(['cupcake', 'dona', 'fresa', 'galleta'][i % 4], 2)}" style="left:${pct(s.eat.x, RW)};top:${pct(s.eat.y, RH)};z-index:${10 + Math.round(s.z) + 1}">` : '')).join('');
  return `<div class="room-frame"><div class="room ${edit ? 'editing' : ''} t-${part}" id="${opts.id || 'roomBox'}">
<img class="pixel rm-wall" alt="" src="${Pix.sprite('x_pared_' + (WALLS[rm.wall] ? rm.wall : 'rosa'), 3)}"><img class="pixel rm-floor" alt="" src="${Pix.sprite('x_piso_' + (FLOORS[rm.floor] ? rm.floor : 'madera'), 3)}">
${html}${petHtml}<span class="rm-shade"></span>
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
  return `${sub('cuarto', 'rincon', starsPill())}
<div class="chips rm-rooms">${Object.keys(r.rooms).map(k => `<button class="chip" data-act="rmRoom" data-k="${k}" aria-pressed="${r.cur === k}">${esc((ROOMS[k] || {}).name || k)}</button>`).join('')}<button class="chip" data-act="rmTab" data-v="cuartos">+ Más cuartos</button></div>
${roomHTML(rm, { edit, sel: S.roomSel, inner: `<button class="btn sm rm-editbtn" data-act="rmEdit">${edit ? 'Listo' : 'Mover cosas'}</button>${edit && S.roomSel ? '<span class="rm-tools"><button class="btn sm" data-act="rmFlip">Voltear</button><button class="btn sm danger" data-act="rmRemove">Guardar</button></span>' : ''}` })}
${edit ? '<p class="faint" style="margin:0;text-align:center">Arrastra los muebles. Toca uno para voltearlo o guardarlo.</p>' : `<p class="faint" style="margin:0;text-align:center">${{ dia: 'Es de día', tarde: 'Está atardeciendo', noche: 'Es de noche: tus mochis se van a dormir' }[dayPart()]}</p>`}
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
ACT.rmFurn = a => {
  const k = a.dataset.k, f = FURN[k];
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
    if (!p.owned.includes('gela')) return { kind: 'pet', id: 'gela', name: 'Gela', src: spr('gela', 5), big };
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

// ---------------- Admin: agregar mascotas, muebles, ropa y comida ----------------
const KINDS = { pets: ['Mascota', 20, 20], furn: ['Mueble', 24, 24], clothes: ['Ropa', 10, 6], food: ['Comida', 16, 16] };
const PALK = Object.keys(Pix.PAL);
function blankMap(w, h) { return Array.from({ length: h }, () => '.'.repeat(w)); }
let ed = null; // borrador del editor
function newDraft(kind, item) {
  const [, w, h] = KINDS[kind];
  ed = Object.assign({ kind, id: null, name: '', desc: '', how: 'stars', price: kind === 'pets' ? 100 : kind === 'food' ? 3 : 20, gain: 20, slot: 'head', season: 'halloween', ach: 's7', wall: false, w, h, map: blankMap(w, h), color: 'P' }, item ? JSON.parse(JSON.stringify(item)) : {}, { kind });
  if (item) ed.id = item.id;
}
A.screens.admincat = () => {
  if (!Store.isOwner) return `${sub('admincat', 'admin')}<div class="card empty">Esta sección es solo para la dueña de la app.</div>`;
  const kind = S.catKind || 'pets'; const c = catalog(); const list = c[kind];
  if (!ed || ed.kind !== kind) newDraft(kind);
  const pre = { pets: 'cp_', furn: 'cf_', clothes: 'cc_', food: 'cfo_' }[kind];
  return `${sub('admincat', 'admin', '<span class="tag gold">Solo tú</span>')}
<div class="seg">${Object.entries(KINDS).map(([k, [n]]) => `<button data-act="catKind" data-v="${k}" aria-pressed="${k === kind}">${n}</button>`).join('')}</div>
${list.length ? `<div class="card"><h3>${KINDS[kind][0]}s que ya agregaste</h3><div class="list">${list.map(x => `<div class="li" style="${x.off ? 'opacity:.55' : ''}"><span class="ic" style="width:48px;height:48px"><img class="pixel" alt="" src="${Pix.sprite((kind === 'clothes' ? 'acc_' : '') + pre + x.id, 3)}" style="max-width:44px;max-height:44px"></span><span class="tx-main"><b>${esc(x.name)}</b><span>${esc(howLabel(x))}${x.off ? ' · oculto' : ''}</span></span><button class="btn sm" data-act="catEdit" data-id="${x.id}">Editar</button></div>`).join('')}</div></div>` : ''}
<div class="card stack" id="catForm">${formHTML()}</div>
<details class="card stack" ${S.seasOpen ? 'open' : ''}><summary><b>Temporadas</b> <span class="faint">(Noche de brujas, Navidad, San Valentín y las tuyas)</span></summary>
<div class="list" style="margin:8px 0">${allSeasons().map(se => `<div class="li"><span class="tx-main"><b>${esc(se.name)}</b><span>${esc(se.when)}${inSeason(se.id) ? ' · <b>activa ahora</b>' : ''} · ${se.items.length} cosas</span></span>${se.custom ? `<button class="btn sm danger" data-act="seDel" data-id="${se.id}">Borrar</button>` : ''}</div>`).join('')}</div>
<div class="formgrid"><label class="f full">Nueva temporada<input class="in" id="seName" placeholder="Ej. Día de la madre" maxlength="30"></label><label class="f">Desde<input class="in" id="seFrom" type="date"></label><label class="f">Hasta<input class="in" id="seTo" type="date"></label></div>
<button class="btn" data-act="seAdd" style="justify-content:center">Agregar temporada</button>
<p class="faint" style="margin:0">Se repite cada año en esas fechas. Luego, al agregar ropa o muebles, elige "Temporada" y escoge esta.</p></details>`;
};
function howLabel(x) { return x.how === 'stars' ? `${x.price} estrellitas` : x.how === 'logro' ? 'Por logro' : x.how === 'temporada' ? 'De temporada' : x.how === 'raro' ? 'Regalo raro' : 'Gratis'; }
function formHTML() {
  const k = ed.kind; const [label] = KINDS[k];
  const sizeSel = k === 'furn' || k === 'clothes' ? `<label class="f">Tamaño (cuadritos)<span class="row" style="gap:6px"><input class="in" data-ed="w" type="number" min="4" max="${k === 'furn' ? 48 : 16}" value="${ed.w}" style="width:70px"> × <input class="in" data-ed="h" type="number" min="3" max="${k === 'furn' ? 48 : 12}" value="${ed.h}" style="width:70px"></span></label>` : `<div class="f">Tamaño<span class="faint">${ed.w} × ${ed.h} cuadritos</span></div>`;
  return `<b>${ed.id ? 'Editar ' + label.toLowerCase() : 'Nueva ' + label.toLowerCase()}</b>
<div class="formgrid">
<label class="f">Nombre<input class="in" data-ed="name" value="${esc(ed.name)}" placeholder="${{ pets: 'Ej. Mochi de coco', furn: 'Ej. Lámpara de luna', clothes: 'Ej. Gorrito de lana', food: 'Ej. Flan' }[k]}"></label>
${k === 'pets' ? `<label class="f">Cómo es<input class="in" data-ed="desc" value="${esc(ed.desc)}" placeholder="Ej. Muy dormilona"></label>` : k === 'food' ? `<label class="f">Llena la pancita (+)<input class="in" data-ed="gain" type="number" value="${ed.gain}"></label>` : k === 'clothes' ? `<label class="f">Dónde se pone<select class="in" data-ed="slot">${[['head', 'Cabeza'], ['face', 'Cara'], ['neck', 'Cuello']].map(([v, n]) => `<option value="${v}" ${ed.slot === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>` : `<label class="f">Va en<select class="in" data-ed="wall"><option value="" ${!ed.wall ? 'selected' : ''}>El piso</option><option value="1" ${ed.wall ? 'selected' : ''}>La pared</option></select></label>`}
${sizeSel}
</div>
<div class="row" style="gap:8px;flex-wrap:wrap"><span class="faint" style="flex:1 1 100%">Dibuja aquí con los colores de Bolsillito, o sube una imagen pixel (se ajusta sola a la cuadrícula).</span>
<label class="btn sm">Subir imagen pixel<input type="file" accept="image/*" id="edFile" hidden></label><button class="btn sm" data-act="edClear">Borrar todo</button></div>
<div class="ed-wrap"><canvas id="edCanvas" class="ed-canvas" style="aspect-ratio:${ed.w}/${ed.h}"></canvas><div class="ed-side"><img class="pixel" id="edPrev" alt="Vista previa" src="" style="width:${Math.min(96, ed.w * 4)}px"><span class="faint">Así se verá</span></div></div>
<div class="ed-pal">${PALK.map(c => `<button class="ed-sw ${ed.color === c ? 'on' : ''}" data-sw="${c}" style="background:${Pix.PAL[c]}" aria-label="Color ${c}"></button>`).join('')}<button class="ed-sw erase ${ed.color === '.' ? 'on' : ''}" data-sw="." aria-label="Borrador">×</button></div>
<div class="f">¿Cómo se consigue?<div class="chips">${[['stars', 'Con estrellitas'], ['logro', 'Logro'], ['temporada', 'Temporada'], ['raro', 'Regalo raro'], ...(k === 'food' ? [] : [['free', 'Gratis']])].map(([v, n]) => `<button class="chip" data-edhow="${v}" aria-pressed="${ed.how === v}">${n}</button>`).join('')}</div></div>
<div class="formgrid">
${ed.how === 'stars' || k === 'food' ? `<label class="f">Precio en estrellitas<input class="in" data-ed="price" type="number" min="0" value="${ed.price}"></label>` : ''}
${ed.how === 'logro' ? `<label class="f">Qué logro<select class="in" data-ed="ach">${A.RC.ACH.map(a => `<option value="${a.id}" ${ed.ach === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label>` : ''}
${ed.how === 'temporada' ? `<label class="f">Qué temporada<select class="in" data-ed="season">${allSeasons().map(s => `<option value="${s.id}" ${ed.season === s.id ? 'selected' : ''}>${esc(s.name)} (${esc(s.when)})</option>`).join('')}</select></label>` : ''}
</div>
<div class="row" style="gap:8px;flex-wrap:wrap">${ed.id ? `<button class="btn" data-act="edOff">${ed.off ? 'Mostrar otra vez' : 'Ocultar'}</button><button class="btn danger" data-act="edDel">Borrar</button><button class="btn" data-act="edNew">Nueva</button>` : ''}<button class="btn pink" data-act="edSave" style="flex:1;justify-content:center">Guardar y publicar</button></div>
<p class="faint" style="margin:0">Lo que guardes aquí les aparece a todas tus usuarias.</p>`;
}
function edPaintCanvas() {
  const cv = $('#edCanvas'); if (!cv) return; const cell = Math.max(6, Math.floor(Math.min(300, cv.parentElement.clientWidth - 110) / ed.w));
  cv.width = ed.w * cell; cv.height = ed.h * cell; const g = cv.getContext('2d');
  for (let y = 0; y < ed.h; y++) for (let x = 0; x < ed.w; x++) { g.fillStyle = (x + y) % 2 ? '#f6efe6' : '#fffaf2'; g.fillRect(x * cell, y * cell, cell, cell); const ch = ed.map[y][x]; if (ch !== '.') { g.fillStyle = Pix.PAL[ch]; g.fillRect(x * cell, y * cell, cell, cell); } }
  g.strokeStyle = 'rgba(138,77,79,.12)'; for (let x = 0; x <= ed.w; x++) { g.beginPath(); g.moveTo(x * cell + .5, 0); g.lineTo(x * cell + .5, cv.height); g.stroke(); } for (let y = 0; y <= ed.h; y++) { g.beginPath(); g.moveTo(0, y * cell + .5); g.lineTo(cv.width, y * cell + .5); g.stroke(); }
  cv._cell = cell;
  const nm = '__edprev'; const pad = ed.kind === 'clothes' ? 1 : 0; Pix.define(nm, { w: ed.w + pad * 2, h: ed.h + pad * 2, fn(p) { p.map(pad, pad, ed.map); } }); const pv = $('#edPrev'); if (pv) pv.src = Pix.sprite(nm, 4);
}
function resizeMap(w, h) { ed.map = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => (ed.map[y] && ed.map[y][x]) || '.').join('')); ed.w = w; ed.h = h; }
A.after.admincat = el => {
  const form = $('#catForm', el); if (!form || !$('#edCanvas', el)) return; edPaintCanvas(); el = form;
  const cv = $('#edCanvas', el); let down = false;
  const paint = e => { const rc = cv.getBoundingClientRect(); const x = Math.floor((e.clientX - rc.left) / rc.width * ed.w), y = Math.floor((e.clientY - rc.top) / rc.height * ed.h); if (x < 0 || y < 0 || x >= ed.w || y >= ed.h) return; const row = ed.map[y]; if (row[x] === ed.color) return; ed.map[y] = row.slice(0, x) + ed.color + row.slice(x + 1); edPaintCanvas(); };
  cv.addEventListener('pointerdown', e => { down = true; try { cv.setPointerCapture(e.pointerId); } catch (er) { } paint(e); e.preventDefault(); });
  cv.addEventListener('pointermove', e => { if (down) paint(e); });
  cv.addEventListener('pointerup', () => { down = false; }); cv.addEventListener('pointercancel', () => { down = false; });
  el.addEventListener('click', e => {
    const sw = e.target.closest('[data-sw]'); if (sw) { ed.color = sw.dataset.sw; $$('.ed-sw', el).forEach(b => b.classList.toggle('on', b === sw)); }
    const hw = e.target.closest('[data-edhow]'); if (hw) { ed.how = hw.dataset.edhow; A.render(); }
  });
  el.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.ed) { const k = t.dataset.ed; if (k === 'w' || k === 'h') { const w = Math.max(3, Math.min(48, +$('[data-ed="w"]', el).value || ed.w)), h = Math.max(3, Math.min(48, +$('[data-ed="h"]', el).value || ed.h)); resizeMap(w, h); A.render(); return; } ed[k] = k === 'wall' ? !!t.value : t.type === 'number' ? +t.value : t.value; }
    if (t.id === 'edFile' && t.files[0]) importImage(t.files[0]);
  });
  el.addEventListener('input', e => { const t = e.target; if (t.dataset.ed && t.dataset.ed !== 'w' && t.dataset.ed !== 'h') ed[t.dataset.ed] = t.type === 'number' ? +t.value : t.value; });
};
function importImage(file) {
  const url = URL.createObjectURL(file); const im = new Image();
  im.onload = () => {
    const cv = document.createElement('canvas'); cv.width = ed.w; cv.height = ed.h; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    const s = Math.min(ed.w / im.width, ed.h / im.height); const w = Math.max(1, Math.round(im.width * s)), h = Math.max(1, Math.round(im.height * s));
    g.drawImage(im, Math.floor((ed.w - w) / 2), ed.h - h, w, h); const d = g.getImageData(0, 0, ed.w, ed.h).data;
    const pal = PALK.map(k => { const v = parseInt(Pix.PAL[k].slice(1), 16); return [k, v >> 16, (v >> 8) & 255, v & 255]; });
    ed.map = Array.from({ length: ed.h }, (_, y) => Array.from({ length: ed.w }, (_, x) => { const o = (y * ed.w + x) * 4; if (d[o + 3] < 128) return '.'; let best = '.', bd = 1e9; pal.forEach(([k, r, gg, b]) => { const dd = (r - d[o]) ** 2 + (gg - d[o + 1]) ** 2 + (b - d[o + 2]) ** 2; if (dd < bd) { bd = dd; best = k; } }); return best; }).join(''));
    URL.revokeObjectURL(url); edPaintCanvas(); toast('Imagen lista. Puedes retocarla pintando encima.');
  };
  im.src = url;
}
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
ACT.catEdit = a => { const kind = S.catKind || 'pets'; const it = catalog()[kind].find(x => x.id === a.dataset.id); newDraft(kind, it); A.render(); setTimeout(() => { const f = $('#catForm'); if (f) f.scrollIntoView({ behavior: 'smooth' }); }, 50); };
ACT.edNew = () => { newDraft(S.catKind || 'pets'); A.render(); };
ACT.edClear = () => { ed.map = blankMap(ed.w, ed.h); edPaintCanvas(); };
ACT.edSave = () => {
  if (!ed.name.trim()) return toast('Ponle un nombre');
  if (!ed.map.some(r => /[^.]/.test(r))) return toast('Dibuja algo o sube una imagen');
  const kind = ed.kind; A.CFG.catalog = A.CFG.catalog || {}; const list = A.CFG.catalog[kind] = A.CFG.catalog[kind] || [];
  const item = { id: ed.id || uid(), name: ed.name.trim(), how: ed.how, price: +ed.price || 0, w: ed.w, h: ed.h, map: ed.map.slice(), off: !!ed.off };
  if (kind === 'pets') Object.assign(item, { desc: ed.desc, say: ed.desc });
  if (kind === 'food') Object.assign(item, { gain: +ed.gain || 20 });
  if (kind === 'clothes') Object.assign(item, { slot: ed.slot });
  if (kind === 'furn') Object.assign(item, { wall: !!ed.wall });
  if (ed.how === 'logro') item.ach = ed.ach; if (ed.how === 'temporada') item.season = ed.season;
  const i = list.findIndex(x => x.id === item.id); if (i >= 0) list[i] = item; else list.push(item);
  ed = null; saveCatalog();
};
ACT.edOff = () => { const list = A.CFG.catalog[ed.kind]; const it = list.find(x => x.id === ed.id); if (it) it.off = !it.off; ed = null; saveCatalog(); };
ACT.edDel = a => { if (!a.dataset.s) { a.dataset.s = 1; a.textContent = '¿Segura? Toca otra vez'; return; } A.CFG.catalog[ed.kind] = A.CFG.catalog[ed.kind].filter(x => x.id !== ed.id); ed = null; saveCatalog(); };
// botón en el panel de admin
const adminScreen = A.screens.admin;
A.screens.admin = () => { const h = adminScreen(); if (!Store.isOwner) return h; const btn = `<button class="card row" data-go="admincat" style="gap:12px;width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer"><img class="pixel" alt="" src="${spr('maca', 3)}" style="width:44px"><img class="pixel" alt="" src="${Pix.sprite('x_lampara', 2)}" style="height:44px;margin-left:-6px"><div style="flex:1"><b>Agregar mascotas, muebles, ropa y comida</b><div class="faint">Dibújalas o sube una imagen pixel</div></div><span class="faint">›</span></button>`; const i = h.indexOf('<details'); return i > 0 ? h.slice(0, i) + btn + h.slice(i) : h + btn; };
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
  const p = P(); if (p.active) { care(p.active); if (!p.since[p.active]) p.since[p.active] = today(); }
  // si el logro de Cupi ya está, queda lista para adoptar (no se adopta sola)
  A.render();
};
})();
