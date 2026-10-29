// ===== Bolsillito · Juego "Carreritas": carrera contra las amigas agregadas y Meffy (récord de la semana) =====
(function () {
const A = App, S = A.S, { $, esc, toast } = A;
const ACT = A.ACTIONS;
const K = A.gameKit; if (!K) return;
const { gameShell, loadImgs, GM, ST, spr, img, activePet, petSprite } = K;
const gsfx = n => K.gsfx(n);

// ---------------- Dibujitos ----------------
Pix.define('cr_cono', { w: 14, h: 16, fn(p) { p.r(1, 13, 12, 3, '#f27ea1'); p.r(0, 14, 14, 2, '#d65a85'); for (let y = 1; y < 13; y++) { const w = 2 + Math.round(y * .7); p.r(7 - w / 2, y, w, 1, y % 5 === 3 || y % 5 === 4 ? '#ffffff' : '#ff9a5c'); } } });
Pix.define('cr_charco', { w: 20, h: 10, fn(p) { p.e(10, 5, 9.5, 4.5, '#7fb2d6'); p.e(10, 5, 8, 3.4, '#a9d3ef'); p.e(7, 4, 2.5, 1, '#e8f6ff'); p.px(14, 6, '#e8f6ff'); } });
Pix.define('cr_caja', { w: 16, h: 14, fn(p) { p.r(1, 2, 14, 12, '#d39b68'); p.r(1, 2, 14, 3, '#ecc08a'); p.r(7, 2, 2, 12, '#b07a52'); p.r(3, 8, 3, 2, '#f27ea1'); } });
Pix.define('cr_turbo', { w: 14, h: 16, fn(p) { p.e(7, 8, 6.5, 7.5, '#fff3b0'); p.e(7, 8, 5, 6, '#ffe27a'); [[8, 2], [7, 3], [6, 4], [5, 5], [4, 6], [5, 7], [6, 7], [7, 7], [8, 8], [7, 9], [6, 10], [5, 11], [4, 12]].forEach(([x, y]) => p.r(x, y, 3, 1, '#f2a33a')); } });
Pix.define('cr_bandera', { w: 14, h: 16, fn(p) { p.r(1, 0, 2, 16, '#8a5a3c'); for (let y = 0; y < 8; y++) for (let x = 0; x < 10; x++) p.px(3 + x, y + 1, (Math.floor(x / 2) + Math.floor(y / 2)) % 2 ? '#6b3b3f' : '#ffffff'); } });

// ---------------- Datos ----------------
const GOAL = 600;            // metros de la carrera
const PXM = 13;              // pixeles por metro en pantalla
const RACE_CAP = 60;         // estrellitas de carreritas por día (aparte de los otros juegos)
const BOTS = [['Gochi', 'gochi', 51], ['Shey', 'shey', 55], ['Pandy', 'pandy', 60]];
function isoWeek(d) { d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = d.getUTCDay() || 7; d.setUTCDate(d.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)); return d.getUTCFullYear() + '-W' + String(Math.ceil(((d - y0) / 864e5 + 1) / 7)).padStart(2, '0'); }
const week = () => isoWeek(new Date());
const fmtT = t => t.toFixed(2).replace('.', ',') + ' s';
const ownerUid = () => (Store.config && Store.config.ownerUid) || (A.CFG && A.CFG.ownerUid) || null;
const myBest = () => { const r = S.settings.race; return r && r.w === week() ? r.t : null; };
const spriteOf = k => (A.petInfo && A.petInfo(k) && A.petInfo(k).sprite) || (Pix.has(k) ? k : 'gochi');
function RC() { const g = GM(); const r = g.race = g.race || {}; if (r.d !== A.today()) { r.d = A.today(); r.n = 0; } return r; }
function payRace(n) { const r = RC(); const ok = Math.max(0, Math.min(n, RACE_CAP - r.n)); r.n += ok; if (ok) A.giveStars(ok); return ok; }

// las rivales: tus amigas y Meffy con su mejor tiempo de esta semana (si no han corrido, corre su versión de práctica)
let rivalsCache = null, rivalsAt = 0;
async function loadRivals() {
  if (rivalsCache && Date.now() - rivalsAt < 60000) return rivalsCache;
  const out = []; const w = week(); const me = Store.uid;
  const online = Store.mode === 'supa' && Store.sb && navigator.onLine !== false;
  if (online) {
    try {
      const codes = (S.settings.friends || []).map(f => f.code).filter(Boolean).slice(0, 30);
      const own = ownerUid();
      const reqs = [];
      if (codes.length) reqs.push(Store.sb.from('rooms').select('user_id, code, name, race:body->race, active:body->active, equip:body->equip').in('code', codes));
      if (own && own !== me) reqs.push(Store.sb.from('rooms').select('user_id, code, name, race:body->race, active:body->active, equip:body->equip').eq('user_id', own));
      const res = await Promise.all(reqs.map(q => Promise.race([q, new Promise(r => setTimeout(() => r({ data: [] }), 5000))])));
      const seen = new Set();
      res.forEach(r => (r.data || []).forEach(x => {
        if (!x || x.user_id === me || seen.has(x.user_id)) return; seen.add(x.user_id);
        const isOwner = x.user_id === own; const rc = x.race && x.race.w === w ? x.race : null;
        const pk = x.active || null, eq = pk && x.equip ? x.equip[pk] : null;
        if (!rc && !isOwner) { out.push({ name: x.name || 'Amiga', sprite: spriteOf(pk || 'gochi'), pk, eq, t: null, friend: true }); return; }
        out.push({ name: isOwner ? 'Meffy' : (x.name || 'Amiga'), sprite: rc ? (Pix.has(rc.pet) ? rc.pet : spriteOf(x.active || 'pudin')) : 'pudin', pk, eq, t: rc ? +rc.t : 49, owner: isOwner, practice: !rc, friend: !isOwner });
      }));
    } catch (e) {}
  }
  if (!out.some(r => r.owner) && !Store.isOwner) out.push({ name: 'Meffy', sprite: 'pudin', t: 49, owner: true, practice: true });
  // amigas que no han corrido esta semana: corren con un tiempo de práctica para que igual estén en la pista
  out.forEach((r, i) => { if (r.t == null) { r.t = 52 + (i % 4) * 3; r.practice = true; } });
  let b = 0; while (out.length < 3 && b < BOTS.length) { const [n, sp, t] = BOTS[b++]; if (!out.some(r => r.name === n)) out.push({ name: n, sprite: spriteOf(sp), pk: sp, t, bot: true }); }
  rivalsCache = out.sort((a, b2) => a.t - b2.t).slice(0, 7); rivalsAt = Date.now();
  return rivalsCache;
}
A.raceRivals = loadRivals;

// ---------------- El juego ----------------
Pix.define('cr_flecha', { w: 12, h: 12, fn(p) { p.r(5, 1, 2, 1, '#ffffff'); p.r(4, 2, 4, 1, '#ffffff'); p.r(3, 3, 6, 1, '#ffffff'); p.r(2, 4, 8, 1, '#ffffff'); p.r(1, 5, 10, 1, '#ffffff'); p.r(4, 6, 4, 5, '#ffffff'); } });
Pix.define('cr_rayo', { w: 12, h: 14, fn(p) { [[6, 0, 3], [5, 1, 3], [4, 2, 3], [3, 3, 3], [2, 4, 3], [2, 5, 8], [3, 6, 6], [5, 7, 3], [4, 8, 3], [3, 9, 3], [2, 10, 3], [2, 11, 2]].forEach(([x, y, w]) => p.r(x, y, w, 1, '#ffffff')); } });
Pix.define('cr_rampa', { w: 20, h: 12, fn(p) { for (let y = 0; y < 12; y++) p.r(1, y, 18, 1, y < 2 ? '#ffe27a' : y % 3 === 0 ? '#f2a33a' : '#ffc96b'); p.r(0, 10, 20, 2, '#b07a52'); [[6, 4], [10, 4], [14, 4], [8, 7], [12, 7]].forEach(([x, y]) => p.px(x, y, '#ffffff')); } });
// tramos del camino: cada uno con su pasto, su pista y sus adornos
const ZONES = [
  { m: 0, name: 'Pradera', grass: '#bfe6a8', grass2: '#a9d98f', track: '#f7d9c4', edge: '#f27ea1' },
  { m: 200, name: 'Playa', grass: '#f6e2b0', grass2: '#ecd096', track: '#fbeede', edge: '#5fa7d6' },
  { m: 400, name: 'Dulcelandia', grass: '#ffd1df', grass2: '#f7b8cc', track: '#fff3f6', edge: '#b59ae6' }
];
const zoneAt = m => ZONES.reduce((z, x) => (m >= x.m ? x : z), ZONES[0]);
// las rivales no corren parejo: aceleran y se cansan, pero llegan justo en su tiempo
const paceF = (u, ph, amp) => u >= 1 ? 1 : Math.max(0, u + amp * (Math.sin(2 * Math.PI * (2 * u + ph)) - Math.sin(2 * Math.PI * ph)) / (4 * Math.PI));
const PAD = 8, KPX = 8, NB = 20 + PAD * 2, NH = PAD + 21; // sin espacio abajo: los pies tocan el piso
async function dressedCanvas(pk, eq, sprite) {
  const an = pk && A.ANCH[pk]; const slots = an && eq ? ['neck', 'head', 'face'].filter(sl => eq[sl] && A.ACC[eq[sl]]) : [];
  const src = { base: spr(sprite || spriteOf(pk || 'gochi'), 4) }; slots.forEach(sl => { src[sl] = spr('acc_' + eq[sl], 4); });
  const im = await loadImgs(src);
  const cv = document.createElement('canvas'); cv.width = NB * KPX; cv.height = NH * KPX; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(im.base, PAD * KPX, PAD * KPX, 20 * KPX, 20 * KPX);
  slots.forEach(sl => { const a = A.ACC[eq[sl]]; const p = A.accPlace(an, a, sl, eq[sl], eq); const i2 = im[sl]; const ratio = i2.naturalWidth ? i2.naturalHeight / i2.naturalWidth : a.h / a.w; g.drawImage(i2, (PAD + p.left) * KPX, (PAD + p.top) * KPX, p.w * KPX, p.w * ratio * KPX); });
  return cv;
}
const myEq = () => { const pk = activePet(); return ((S.settings.rincon || {}).equip || {})[pk] || null; };
A.raceDressed = dressedCanvas;
async function raceGame() {
  const sh = gameShell('race'); let { w: W, h: H } = sh.fit();
  const rivals = (await loadRivals()).map((r, i) => Object.assign({}, r, { ph: (i * .37) % 1, amp: .5 + (i % 3) * .2, lane: i % 3, lx: 0, last: 0 }));
  const map = { pet: spr(petSprite(), 4), star: spr('estrellita', 3), cono: spr('cr_cono', 4), charco: spr('cr_charco', 4), caja: spr('cr_caja', 4), turbo: spr('cr_turbo', 4), rampa: spr('cr_rampa', 4), flag: spr('cr_bandera', 4), flor: spr(Pix.has('flower') ? 'flower' : 'estrellita', 3) };
  const I = await loadImgs(map);
  // cada corredora con su ropita puesta
  const meCv = await dressedCanvas(activePet(), myEq(), petSprite());
  const RC = await Promise.all(rivals.map(r => dressedCanvas(r.pk, r.eq, r.sprite)));
  rivals.forEach((r, i) => { r.cv = RC[i]; r.url = RC[i].toDataURL(); }); const meUrl = meCv.toDataURL();
  const LANES = 3; let TW, TX, LW;
  const geo = () => { TW = Math.min(W - 70, 320); TX = (W - TW) / 2; LW = TW / LANES; };
  geo();
  const PET = 54, PY = () => H - 170; let ctl = null;
  let lane, x, dist, v, slow, boost, items, nextSpawn, time, stars, run = true, paused = true, last = 0, raf, count, pops, finished, hits, deco, jump, meter, combo, dust, shake, place, lastPlace, conf, zoneShown, lastStretch, maxCombo;
  const laneX = l => TX + LW * l + LW / 2;
  function reset() {
    lane = 1; x = laneX(1); dist = 0; v = 0; slow = 0; boost = 0; items = []; nextSpawn = 26; time = 0; stars = 0; count = 3.4; pops = []; finished = false; hits = 0;
    jump = 0; meter = 0; combo = 0; maxCombo = 0; dust = []; shake = 0; place = rivals.length + 1; lastPlace = place; conf = []; zoneShown = 0; lastStretch = false;
    deco = []; for (let m = -10; m < GOAL + 60; m += 4 + Math.random() * 5) deco.push({ m, side: Math.random() < .5 ? 0 : 1, o: Math.random(), k: Math.random() });
    rivals.forEach((r, i) => { r.lane = i % 2 ? 2 : 0; r.lx = laneX(r.lane); r.last = 0; }); // en la salida, a tus lados
  }
  function spawn() {
    while (nextSpawn < dist + 70 && nextSpawn < GOAL - 15) {
      const m = nextSpawn; const free = [0, 1, 2];
      const nObs = Math.random() < .25 + dist / GOAL * .35 ? 2 : 1;
      for (let k = 0; k < nObs; k++) { const i = Math.floor(Math.random() * free.length); const l = free.splice(i, 1)[0]; items.push({ m, l, k: ['cono', 'charco', 'caja'][Math.floor(Math.random() * 3)], bad: true }); }
      const l2 = free[Math.floor(Math.random() * free.length)];
      const roll = Math.random();
      if (roll < .1) items.push({ m: m + 3, l: l2, k: 'turbo' });
      else if (roll < .2) items.push({ m: m + 2, l: l2, k: 'rampa' });
      else for (let j = 0; j < 3; j++) items.push({ m: m + 2 + j * 2.4, l: l2, k: 'star' });
      nextSpawn += 10 + Math.random() * 8 - dist / GOAL * 3;
    }
  }
  const pop = (txt, c, big) => pops.push({ x, y: PY(), t: 34, txt, c: c || '#c44a72', big });
  const banner = (txt, c) => pops.push({ banner: true, t: 70, txt, c: c || '#c44a72' });
  const rivalDist = r => GOAL * paceF(Math.max(0, time) / r.t, r.ph, r.amp);
  function doJump() { if (count > 0 || finished || paused || jump > 0) return; jump = .62; gsfx('jump'); }
  function useTurbo() { if (meter < 1 || count > 0 || finished || paused) return; meter = 0; boost = 2.6; gsfx('swoosh'); banner('¡TURBO!', '#f2a33a'); }
  function step(dt) {
    const s = dt / 60;
    if (count > 0) { const c0 = Math.ceil(count); count -= s; if (Math.ceil(count) < c0 && count > 0) gsfx('tick'); if (count <= 0) { gsfx('start'); banner('¡YA!'); } return; }
    if (finished) { conf.forEach(c => { c.x += c.vx * dt; c.y += c.vy * dt; c.vy += .12 * dt; c.r += .2 * dt; }); return; }
    time += s;
    const base = 10.5 + Math.min(4.5, time * .09) + Math.min(1.5, combo * .12);
    const target = slow > 0 ? 5 : boost > 0 ? base + 7 : base;
    v += (target - v) * Math.min(1, s * 3); slow -= s; boost -= s; shake = Math.max(0, shake - s * 3);
    if (jump > 0) jump -= s;
    dist += v * s; spawn();
    x += (laneX(lane) - x) * Math.min(1, s * 14);
    const myLane = Math.round((x - TX - LW / 2) / LW);
    const air = jump > .08;
    items.forEach(it => {
      if (it.done || Math.abs(it.m - dist) > .9 || it.l !== myLane) return;
      if (it.bad && air) { if (!it.jumped) { it.jumped = true; pop('¡Salto!', '#5fa7d6'); } return; }
      it.done = true;
      if (it.bad) {
        slow = .9; hits++; combo = 0; shake = 1; gsfx('bonk'); if (navigator.vibrate) navigator.vibrate(60);
        const lost = Math.min(2, stars); stars -= lost; pop(lost ? `¡Ay! -${lost}` : '¡Ay!', '#3d78b5');
      } else if (it.k === 'turbo') { boost = 2.2; gsfx('swoosh'); banner('¡TURBO!', '#f2a33a'); }
      else if (it.k === 'rampa') { jump = 1; boost = Math.max(boost, .9); gsfx('boing'); pop('¡Wiii!', '#f2a33a', true); }
      else {
        stars++; combo++; maxCombo = Math.max(maxCombo, combo); meter = Math.min(1, meter + 1 / 7); gsfx('coin');
        pop(combo >= 3 ? `+1  x${combo}` : '+1');
        if (meter >= 1 && meter - 1 / 7 < 1) { gsfx('gift'); pop('¡Turbo listo!', '#f2a33a', true); }
      }
    });
    items = items.filter(it => it.m > dist - 20);
    // las rivales esquivan lo que viene en su carril
    rivals.forEach(r => {
      const m = rivalDist(r);
      if (time - r.last > .35) { r.last = time; const blocked = l => items.some(it => it.bad && it.l === l && it.m > m && it.m < m + 9); if (blocked(r.lane)) { const opts = [r.lane - 1, r.lane + 1].filter(l => l >= 0 && l < LANES && !blocked(l)); if (opts.length) r.lane = opts[Math.floor(Math.random() * opts.length)]; } }
      r.lx += (laneX(r.lane) - r.lx) * Math.min(1, s * 8);
    });
    // polvito detrás de quien corre
    if (Math.random() < .5) dust.push({ x: x + (Math.random() - .5) * 18, y: PY() + 6, t: 18, r: 3 + Math.random() * 3 });
    dust.forEach(d => { d.t -= dt; d.y += (v * PXM / 60) * dt * .9; d.r += .08 * dt; }); dust = dust.filter(d => d.t > 0);
    // posición en vivo y quién te pasa
    const ahead = rivals.filter(r => r.t < time || rivalDist(r) > dist); // las que ya llegaron también van adelante
    place = ahead.length + 1;
    if (place < lastPlace) { const passed = rivals.filter(r => rivalDist(r) <= dist).sort((a, b2) => rivalDist(b2) - rivalDist(a))[0]; if (passed) pop(`¡Pasaste a ${passed.name}!`, '#5f9e6a', true); gsfx('pop'); }
    else if (place > lastPlace) { const by = ahead.sort((a, b2) => rivalDist(a) - rivalDist(b2))[0]; if (by) pop(`${by.name} te pasó`, '#8d6cc9'); }
    lastPlace = place;
    const z = ZONES.findIndex((zz, i) => i > zoneShown && dist >= zz.m); if (z > 0) { zoneShown = z; banner(ZONES[z].name, ZONES[z].edge); }
    if (!lastStretch && dist > GOAL - 100) { lastStretch = true; banner('¡Último tramo!', '#c44a72'); }
    pops.forEach(p => p.t -= dt); pops = pops.filter(p => p.t > 0);
    if (dist >= GOAL) {
      dist = GOAL; finished = true; if (ctl) ctl.hidden = true; place = 1 + rivals.filter(r => r.t < time).length; gsfx(place === 1 ? 'record' : 'gift');
      for (let i = 0; i < 60; i++) conf.push({ x: W / 2, y: H * .35, vx: (Math.random() - .5) * 9, vy: -Math.random() * 7 - 2, r: Math.random() * 6, c: ['#f27ea1', '#ffd166', '#9fd6f2', '#b59ae6', '#8fd16a'][i % 5] });
      setTimeout(over, 1400);
    }
  }
  const yOf = m => PY() - (m - dist) * PXM;
  function drawDeco(g, d) {
    const y = yOf(d.m); if (y < -40 || y > H + 40) return;
    const z = zoneAt(d.m); const room = Math.max(6, TX - 12); const fx = d.side ? TX + TW + 8 + d.o * room : 4 + d.o * room;
    if (z.name === 'Pradera') {
      if (d.k < .45) { g.fillStyle = '#8a5a3c'; g.fillRect(fx + 6, y - 4, 4, 10); g.fillStyle = '#74ad5c'; g.beginPath(); g.arc(fx + 8, y - 10, 11, 0, 7); g.fill(); g.fillStyle = '#8fc96a'; g.beginPath(); g.arc(fx + 5, y - 13, 6, 0, 7); g.fill(); g.fillStyle = '#f27ea1'; g.fillRect(fx + 11, y - 14, 3, 3); }
      else g.drawImage(I.flor, fx, y - 8, 16, 16);
    } else if (z.name === 'Playa') {
      if (d.k < .4) { g.strokeStyle = '#a8764b'; g.lineWidth = 3; g.beginPath(); g.moveTo(fx + 8, y + 6); g.quadraticCurveTo(fx + 4, y - 8, fx + 10, y - 18); g.stroke(); g.fillStyle = '#5fa77a'; [-1.2, -.4, .4, 1.2].forEach(a => { g.beginPath(); g.ellipse(fx + 10 + Math.sin(a) * 9, y - 18 + Math.cos(a) * 3, 9, 3, a, 0, 7); g.fill(); }); }
      else if (d.k < .7) { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(fx + 8, y, 6, Math.PI, 0); g.fill(); g.fillStyle = '#f27ea1'; g.beginPath(); g.arc(fx + 8, y, 6, Math.PI, Math.PI * 1.33); g.fill(); g.fillStyle = '#5fa7d6'; g.beginPath(); g.arc(fx + 8, y, 6, Math.PI * 1.66, Math.PI * 2); g.fill(); }
      else { g.fillStyle = '#f2a33a'; g.beginPath(); g.moveTo(fx + 8, y - 6); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5, rr = k % 2 ? 2.5 : 6; g.lineTo(fx + 8 + Math.sin(a) * rr, y - Math.cos(a) * rr); } g.fill(); }
    } else {
      if (d.k < .45) { g.fillStyle = '#ffffff'; g.fillRect(fx + 7, y - 6, 3, 14); const cs = ['#f27ea1', '#9fd6f2', '#ffd166']; g.fillStyle = cs[Math.floor(d.o * 3)]; g.beginPath(); g.arc(fx + 8.5, y - 12, 8, 0, 7); g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.beginPath(); g.arc(fx + 8.5, y - 12, 4, 0, 5); g.stroke(); }
      else { g.fillStyle = '#ffffff'; g.fillRect(fx + 6, y - 14, 4, 20); g.fillStyle = '#f27ea1'; for (let k = 0; k < 4; k++) g.fillRect(fx + 6, y - 14 + k * 5, 4, 2); g.fillRect(fx + 6, y - 16, 8, 3); }
    }
  }
  function drawArch(g, m, txt, c1, c2) {
    const y = yOf(m); if (y < -60 || y > H + 30) return;
    g.fillStyle = '#8a5a3c'; g.fillRect(TX - 10, y - 44, 6, 46); g.fillRect(TX + TW + 4, y - 44, 6, 46);
    g.fillStyle = c1; g.fillRect(TX - 14, y - 58, TW + 28, 18); g.fillStyle = c2; for (let i = 0; i < (TW + 28) / 14; i++) g.fillRect(TX - 14 + i * 14, y - 40, 7, 5);
    g.font = '900 13px Nunito, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.fillText(txt, W / 2, y - 45);
  }
  function drawRunner(g, im, cx, y, size, hop, alpha, tag, tagC) {
    g.fillStyle = 'rgba(80,40,50,.18)'; g.beginPath(); g.ellipse(cx, y + 6, size * .36, 5, 0, 0, 7); g.fill();
    const k = size / 20, full = NB * k;
    g.save(); if (alpha != null) g.globalAlpha = alpha; g.drawImage(im, cx - full / 2, y - size + 8 - hop - PAD * k, full, NH * k); g.restore();
    if (tag) { g.font = '800 11px Nunito, sans-serif'; g.textAlign = 'center'; const tw = g.measureText(tag).width + 12; g.fillStyle = tagC || 'rgba(255,255,255,.92)'; const ty = y - size - 6 - hop; g.beginPath(); g.roundRect ? g.roundRect(cx - tw / 2, ty - 12, tw, 16, 8) : g.rect(cx - tw / 2, ty - 12, tw, 16); g.fill(); g.fillStyle = tagC ? '#fff' : '#6b3b3f'; g.fillText(tag, cx, ty); }
  }
  function draw() {
    const g = sh.g; const z = zoneAt(dist);
    g.save(); if (shake > 0) g.translate((Math.random() - .5) * 8 * shake, (Math.random() - .5) * 6 * shake);
    g.fillStyle = z.grass; g.fillRect(-10, -10, W + 20, H + 20);
    g.fillStyle = z.grass2; for (let y = -((dist * PXM) % 40); y < H; y += 40) { g.fillRect(0, y, TX - 6, 20); g.fillRect(TX + TW + 6, y + 20, W, 20); }
    deco.forEach(d => drawDeco(g, d));
    // pista con el color del tramo
    for (let y = 0; y < H; y += 8) { const m = dist + (PY() - y) / PXM; const zz = zoneAt(m); g.fillStyle = zz.track; g.fillRect(TX, y, TW, 8); g.fillStyle = zz.edge; const on = Math.floor(m / 1.85) % 2; g.fillRect(TX - 5, y, 5, 8); g.fillStyle = on ? '#ffffff' : zz.edge; g.fillRect(TX - 5, y, 5, 4); g.fillStyle = zz.edge; g.fillRect(TX + TW, y, 5, 8); g.fillStyle = on ? zz.edge : '#ffffff'; g.fillRect(TX + TW, y, 5, 4); }
    g.fillStyle = 'rgba(255,255,255,.8)'; for (let l = 1; l < LANES; l++) for (let y = -((dist * PXM) % 30); y < H; y += 30) g.fillRect(TX + LW * l - 1.5, y, 3, 16);
    // líneas de velocidad
    if (boost > 0 || v > 14.5) { g.fillStyle = boost > 0 ? 'rgba(255,226,122,.55)' : 'rgba(255,255,255,.4)'; for (let k = 0; k < 8; k++) { const lx = TX + ((k * 53 + Math.floor(time * 60) * 7) % TW); const ly = (k * 97 + time * 900) % H; g.fillRect(lx, ly, 2, 26); } }
    // salida y meta
    [[0, '#ffffff', '#f27ea1'], [GOAL, '#6b3b3f', '#ffffff']].forEach(([m, a, b]) => { const y = yOf(m); if (y < -20 || y > H + 20) return; for (let i = 0; i < TW / 10; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(TX + i * 10, y - 10 + j * 10, 10, 10); } });
    drawArch(g, 0, 'SALIDA', '#f27ea1', '#ffffff'); drawArch(g, GOAL, 'META', '#6b3b3f', '#ffd166');
    // cositas en la pista
    items.forEach(it => { if (it.done) return; const y = yOf(it.m); if (y < -40 || y > H + 40) return; const cx = laneX(it.l);
      if (it.k === 'star') { const bb = Math.sin(time * 6 + it.m) * 2; g.drawImage(I.star, cx - 12, y - 12 + bb, 24, 24); }
      else if (it.k === 'charco') g.drawImage(I.charco, cx - 26, y - 10, 52, 26);
      else if (it.k === 'rampa') g.drawImage(I.rampa, cx - 26, y - 14, 52, 30);
      else g.drawImage(I[it.k], cx - 20, y - 22, 40, 40); });
    // polvito
    dust.forEach(d => { g.fillStyle = `rgba(255,255,255,${d.t / 30})`; g.beginPath(); g.arc(d.x, d.y, d.r, 0, 7); g.fill(); });
    // rivales: corren de verdad, cambian de carril y se te adelantan o se quedan
    rivals.forEach((r, i) => { const m = rivalDist(r); const y = yOf(m); if (y < -60 || y > H + 60) return; const hop = Math.abs(Math.sin(time * 16 + i)) * 4; drawRunner(g, r.cv, r.lx + (i % 2 ? 6 : -6), y, 44, hop, 1, r.name, r.owner ? 'rgba(242,126,161,.95)' : null); });
    // tu mascota (con salto)
    const jh = jump > 0 ? Math.sin(Math.PI * (1 - jump / (jump > .62 ? 1 : .62))) * (jump > .62 ? 46 : 34) : 0;
    const hop = count > 0 ? 0 : (jump > 0 ? jh : Math.abs(Math.sin(time * 18)) * 3);
    if (boost > 0) { g.fillStyle = 'rgba(255,190,90,.6)'; for (let k = 1; k < 4; k++) { g.beginPath(); g.ellipse(x, PY() + 8 + k * 9, 12 - k * 3, 4, 0, 0, 7); g.fill(); } }
    drawRunner(g, meCv, x, PY(), PET + (jump > 0 ? 6 : 0), hop, slow > 0 && Math.floor(time * 20) % 2 ? .45 : 1, 'Tú', 'rgba(242,166,58,.95)');
    // textitos
    pops.forEach(p => {
      if (p.banner) { const k = Math.min(1, (70 - p.t) / 10), out = Math.min(1, p.t / 12); g.save(); g.globalAlpha = out; g.translate(W / 2, H * .28); g.scale(.6 + .4 * k, .6 + .4 * k); g.font = '900 34px Nunito, sans-serif'; g.textAlign = 'center'; g.lineWidth = 7; g.strokeStyle = '#ffffff'; g.strokeText(p.txt, 0, 0); g.fillStyle = p.c; g.fillText(p.txt, 0, 0); g.restore(); return; }
      g.globalAlpha = Math.max(0, p.t / 34); g.font = `900 ${p.big ? 18 : 15}px Nunito, sans-serif`; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = '#ffffff'; const yy = p.y - 70 - (34 - p.t); g.strokeText(p.txt, p.x, yy); g.fillStyle = p.c; g.fillText(p.txt, p.x, yy); g.globalAlpha = 1;
    });
    g.restore();
    // barra de la carrera: dónde va cada una
    const bx = 12, by = 70, bh = Math.min(H - 300, 280);
    g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(bx, by, 8, bh); g.fillStyle = '#6b3b3f'; g.fillRect(bx - 3, by - 4, 14, 4);
    rivals.forEach(r => { const yy = by + bh - bh * rivalDist(r) / GOAL; g.fillStyle = r.owner ? '#f27ea1' : '#9fd6f2'; g.fillRect(bx - 2, yy - 3, 12, 6); });
    const yy = by + bh - bh * dist / GOAL; g.fillStyle = '#ffe27a'; g.fillRect(bx - 4, yy - 5, 16, 10); g.strokeStyle = '#8a4d4f'; g.lineWidth = 2; g.strokeRect(bx - 4, yy - 5, 16, 10);
    // cuenta regresiva con semáforo
    if (count > 0) {
      g.fillStyle = 'rgba(80,40,50,.28)'; g.fillRect(0, 0, W, H);
      const n = Math.ceil(count - .4); const cx = W / 2, cy = H * .4;
      g.fillStyle = '#6b3b3f'; g.beginPath(); g.roundRect ? g.roundRect(cx - 34, cy - 92, 68, 150, 18) : g.rect(cx - 34, cy - 92, 68, 150); g.fill();
      ['#f27ea1', '#ffd166', '#8fd16a'].forEach((c, i) => { const on = (i === 0 && n >= 3) || (i === 1 && n === 2) || (i === 2 && n <= 1); g.fillStyle = on ? c : 'rgba(255,255,255,.15)'; g.beginPath(); g.arc(cx, cy - 58 + i * 46, 17, 0, 7); g.fill(); });
      g.font = '900 30px Nunito, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText(n > 0 ? String(n) : '¡YA!', cx, cy + 96);
    }
    // confeti al llegar
    if (finished) { conf.forEach(c => { g.save(); g.translate(c.x, c.y); g.rotate(c.r); g.fillStyle = c.c; g.fillRect(-4, -2, 8, 4); g.restore(); }); g.font = '900 38px Nunito, sans-serif'; g.textAlign = 'center'; g.lineWidth = 8; g.strokeStyle = '#fff'; const t = place === 1 ? '¡Llegaste 1.º!' : `Llegaste ${place}.º`; g.strokeText(t, W / 2, H * .3); g.fillStyle = place === 1 ? '#f2a33a' : '#c44a72'; g.fillText(t, W / 2, H * .3); }
    $('#gmA', sh.ov).innerHTML = `${fmtT(Math.max(0, time))}${time > 0 ? ` · <b>${place}.º</b>/${rivals.length + 1}` : ''}`;
    $('#gmB', sh.ov).innerHTML = `${img('estrellita', 16)} ${stars} · ${Math.round(GOAL - dist)} m`;
    const tb = $('.cr-turbo', sh.ov); if (tb) { const n = Math.round(meter * 7); tb.querySelectorAll('.cr-cells i').forEach((c, i) => c.classList.toggle('on', i < n)); tb.classList.toggle('ready', meter >= 1); }
    if (ctl) ctl.hidden = finished || count > 0 && time === 0 && paused;
  }
  function loop(t) { if (!run) return; const dt = Math.min(2.2, last ? (t - last) / 16.67 : 1); last = t; if (!paused) step(dt); if (run) draw(); raf = requestAnimationFrame(loop); }
  function over() {
    if (!run) return; A.gameMusic.stop(); run = false; cancelAnimationFrame(raf);
    const t = Math.round(time * 100) / 100;
    const all = rivals.map(r => ({ name: r.name, t: r.t, owner: r.owner, practice: r.practice, bot: r.bot, url: r.url })).concat([{ name: 'Tú', t, me: true, url: meUrl }]).sort((a, b) => a.t - b.t);
    const pos = all.findIndex(r => r.me) + 1;
    const prize = [0, 10, 6, 4][pos] || 2;
    const prev = myBest(); const rec = prev == null || t < prev;
    if (rec) { S.settings.race = { w: week(), t, pet: petSprite() }; }
    const gm = GM(); if (!gm.best.carrera || t < gm.best.carrera) gm.best.carrera = t;
    const fromStars = Math.floor(stars / 3); const comboB = maxCombo >= 9 ? 2 : maxCombo >= 6 ? 1 : 0; const earned = payRace(fromStars + prize + comboB);
    A.petAddXp && A.petAddXp(10, 'game'); A.saveSettings();
    if (rec && A.publishRoom && Store.mode === 'supa') { A.publishRoom().catch(() => {}); rivalsCache = null; }
    const pod = all.slice(0, 3);
    const podium = `<div class="cr-podium">${[1, 0, 2].filter(i => pod[i]).map(i => `<div class="cr-pod p${i + 1} ${pod[i].me ? 'me' : ''}"><img class="pixel" alt="" src="${pod[i].url}"><span>${esc(pod[i].name)}</span><b>${i + 1}</b></div>`).join('')}</div>`;
    const lines = `${podium}<div class="gm-big">${fmtT(t)}</div>${rec ? `<div class="cr-rec">${prev == null ? 'Tu primer tiempo de la semana' : '¡Nuevo récord de la semana!'}</div>` : `<div class="faint">Tu récord de la semana: ${fmtT(prev)}</div>`}
<div class="cr-rank">${all.map((r, i) => `<div class="${r.me ? 'me' : ''} ${r.owner ? 'owner' : ''}"><span>${i + 1}</span><b>${esc(r.name)}${r.practice || r.bot ? ' <em>práctica</em>' : ''}</b><span>${fmtT(r.t)}</span></div>`).join('')}</div>
<div class="row" style="justify-content:center;gap:6px;font-weight:800">${ST(18)} +${earned} estrellitas</div>${earned < fromStars + prize + comboB ? '<div class="faint">Llegaste al máximo de estrellitas de carreritas por hoy.</div>' : `<div class="faint">${fromStars} por ${stars} atrapadas + ${prize} por tu lugar${comboB ? ` + ${comboB} por tu racha de ${maxCombo}` : ''}${hits ? ` · chocaste ${hits} ${hits === 1 ? 'vez' : 'veces'}` : ' · ¡sin chocar!'}</div>`}`;
    K.endCard(sh, pos === 1 ? '¡GANASTE!' : 'CARRERITAS', lines, raceGame);
  }
  // controles: tocar izquierda/derecha o deslizar para cambiar de carril; deslizar hacia arriba o tocar tu mascota para saltar
  const move = d => { if (count > 0 || finished || paused) return; const n = Math.max(0, Math.min(LANES - 1, lane + d)); if (n !== lane) { lane = n; gsfx('tick'); } };
  let sx = null, sy = null;
  sh.cv.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  sh.cv.addEventListener('pointerup', e => {
    if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; const r = sh.cv.getBoundingClientRect(); const px = e.clientX - r.left, py = e.clientY - r.top;
    if (dy < -35 && Math.abs(dy) > Math.abs(dx)) doJump();
    else if (Math.abs(dx) > 30) move(dx > 0 ? 1 : -1);
    else if (Math.abs(px - x) < 36 && Math.abs(py - (PY() - PET / 2)) < 44) doJump();
    else move(px < W / 2 ? -1 : 1);
    sx = sy = null;
  });
  const kd = e => { if (e.key === 'ArrowLeft') move(-1); if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowUp' || e.key === ' ') { e.preventDefault(); doJump(); } if (e.key === 't' || e.key === 'Shift') useTurbo(); if (e.key === 'Escape') sh.close(); };
  addEventListener('keydown', kd);
  // botones grandes: saltar y turbo
  ctl = document.createElement('div'); ctl.className = 'cr-ctl';
  ctl.innerHTML = `<button class="cr-btn cr-jump" aria-label="Saltar"><img class="pixel" alt="" src="${spr('cr_flecha', 4)}"><span>SALTAR</span></button><button class="cr-btn cr-turbo" aria-label="Turbo"><img class="pixel" alt="" src="${spr('cr_rayo', 4)}"><span>TURBO</span><span class="cr-cells">${'<i></i>'.repeat(7)}</span></button>`;
  sh.ov.appendChild(ctl);
  ctl.querySelector('.cr-jump').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); doJump(); });
  ctl.querySelector('.cr-turbo').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); useTurbo(); });
  const onResize = () => { ({ w: W, h: H } = sh.fit()); geo(); x = laneX(lane); }; addEventListener('resize', onResize);
  $('.gm-pause', sh.ov).onclick = () => { if (finished) return; paused = !paused; gsfx('tick'); paused ? A.gameMusic.pause() : A.gameMusic.resume(); const m = $('.gm-msg', sh.ov); if (paused) { m.hidden = false; m.innerHTML = `<div class="gm-end"><div class="gm-k">PAUSA</div><div class="row" style="gap:8px;margin-top:10px"><button class="btn" data-x="out" style="flex:1;justify-content:center">Salir</button><button class="btn pink" data-x="go" style="flex:1;justify-content:center">Seguir</button></div></div>`; m.onclick = e => { const b = e.target.closest('[data-x]'); if (!b) return; if (b.dataset.x === 'out') sh.close(); else { paused = false; m.hidden = true; A.gameMusic.resume(); } }; } };
  sh.close = () => { A.gameMusic.stop(); run = false; cancelAnimationFrame(raf); removeEventListener('keydown', kd); removeEventListener('resize', onResize); sh.ov.remove(); document.body.classList.remove('gaming'); if (S.route === 'juegos' || S.route === 'rincon') A.render(); };
  reset();
  const m = $('.gm-msg', sh.ov); m.hidden = false;
  const best = myBest();
  m.innerHTML = `<div class="gm-end"><div class="gm-k">CARRERITAS</div>
<div class="faint" style="margin-bottom:6px">${GOAL} m por la Pradera, la Playa y Dulcelandia. Tus rivales corren con su mejor tiempo de esta semana: ¡pásalas!</div>
<div class="gm-legend"><span>${img('estrellita', 26)}Llenan tu turbo</span><span>${img('cr_rampa', 26)}Rampa</span><span>${img('cr_cono', 26)}Salta o esquiva</span></div>
<div class="cr-rank small">${rivals.map(r => `<div class="${r.owner ? 'owner' : ''}"><span><img class="pixel cr-face" alt="" src="${r.url}"></span><b>${esc(r.name)}${r.practice || r.bot ? ' <em>práctica</em>' : ''}</b><span>${fmtT(r.t)}</span></div>`).join('')}${best != null ? `<div class="me"><span><img class="pixel cr-face" alt="" src="${meUrl}"></span><b>Tú</b><span>${fmtT(best)}</span></div>` : ''}</div>
<div class="faint">Toca a los lados o desliza para cambiar de carril. Desliza hacia arriba o toca <b>Saltar</b> para brincar los obstáculos. Con 7 estrellitas se llena el <b>Turbo</b>.</div>
<button class="btn pink" data-x="go" style="justify-content:center;margin-top:10px;width:100%">¡A correr!</button></div>`;
  m.onclick = e => { if (e.target.closest('[data-x]')) { m.hidden = true; paused = false; A.gameMusic.start('carrera'); } };
  raf = requestAnimationFrame(loop);
}

// ---------------- En la lista de juegos ----------------
ACT.gmPlay = (prev => a => a.dataset.g === 'carrera' ? raceGame() : prev(a))(ACT.gmPlay);
const juegos0 = A.screens.juegos;
A.screens.juegos = () => {
  const h = juegos0(); const best = myBest(); const RCd = RC();
  const art = `<div class="gm-art cr-art"><span class="cr-art-track"></span><img class="pixel cr-art-a" alt="" src="${spr(petSprite(), 4)}"><img class="pixel cr-art-b" alt="" src="${spr('pudin', 4)}"><img class="pixel cr-art-flag" alt="" src="${spr('cr_bandera', 3)}"></div>`;
  const card = `<button class="gm-row race" data-act="gmPlay" data-g="carrera"><span class="gm-cover">${art}</span><span class="gm-info"><b>Carreritas</b><span>Compite con tus amigas y Meffy.</span><span class="gm-rec">${img('trofeo', 14)}${best != null ? fmtT(best) + ' esta semana' : 'Sin tiempo esta semana'}</span></span><span class="gm-play"><i></i>Jugar</span></button>`;
  const extra = `<div class="gm-today cr-today">${img('cr_bandera', 22)}<div style="flex:1"><b>Carreritas hoy: ${RCd.n} de ${RACE_CAP} estrellitas</b><div class="gm-bar"><i style="width:${Math.min(100, RCd.n / RACE_CAP * 100)}%"></i></div><span class="faint">Aparte de los otros juegos. El que gana se lleva más.</span></div><button class="btn sm" data-act="raceBoard">Tabla</button></div>`;
  const i = h.indexOf('<div class="gm-list">');
  if (i < 0) return h + card;
  const j = i + '<div class="gm-list">'.length;
  return h.slice(0, j) + '\n' + card + h.slice(j).replace('<div class="gm-today">', extra + '<div class="gm-today">');
};
ACT.raceBoard = async () => {
  A.openSheet('Tabla de la semana', '<div class="empty">Buscando los tiempos…</div>');
  const rivals = await loadRivals(); const best = myBest();
  const all = rivals.filter(r => !r.bot && !r.practice).map(r => ({ name: r.name, t: r.t, owner: r.owner, sprite: r.sprite })).concat(best != null ? [{ name: 'Tú', t: best, me: true, sprite: petSprite() }] : []).sort((a, b) => a.t - b.t);
  const body = all.length ? `<div class="cr-rank big">${all.map((r, i) => `<div class="${r.me ? 'me' : ''} ${r.owner ? 'owner' : ''}"><span>${i < 3 ? img(['trofeo', 'estrellita', 'heart'][i], 22) : i + 1}</span><span>${img(r.sprite, 26)}</span><b>${esc(r.name)}</b><span>${fmtT(r.t)}</span></div>`).join('')}</div>` : '<div class="empty">Nadie ha corrido esta semana todavía. ¡Sé la primera!</div>';
  A.openSheet('Tabla de la semana', `<div class="stack">${body}<p class="faint" style="margin:0">Cuentan tus amigas agregadas y Meffy. Se reinicia cada lunes. ${(S.settings.friends || []).length ? '' : 'Agrega amigas en Visitas para competir con ellas.'}</p><button class="btn pink" data-act="raceGo" style="justify-content:center">¡A correr!</button></div>`);
};
ACT.raceGo = () => { A.closeSheet(); raceGame(); };
A.raceGame = raceGame;

// la dueña de la app guarda su id en la configuración para que todas puedan competir con Meffy
const st0 = A.start;
A.start = async () => {
  await st0();
  try {
    if (Store.isOwner && Store.mode === 'supa' && navigator.onLine && Store.config && Store.config.ownerUid !== Store.uid && A.CFG) {
      A.CFG.ownerUid = Store.uid; Store.config.ownerUid = Store.uid; await Store.saveConfig(A.CFG);
    }
  } catch (e) {}
};
})();
