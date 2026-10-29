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
      if (codes.length) reqs.push(Store.sb.from('rooms').select('user_id, code, name, race:body->race, active:body->active').in('code', codes));
      if (own && own !== me) reqs.push(Store.sb.from('rooms').select('user_id, code, name, race:body->race, active:body->active').eq('user_id', own));
      const res = await Promise.all(reqs.map(q => Promise.race([q, new Promise(r => setTimeout(() => r({ data: [] }), 5000))])));
      const seen = new Set();
      res.forEach(r => (r.data || []).forEach(x => {
        if (!x || x.user_id === me || seen.has(x.user_id)) return; seen.add(x.user_id);
        const isOwner = x.user_id === own; const rc = x.race && x.race.w === w ? x.race : null;
        if (!rc && !isOwner) { out.push({ name: x.name || 'Amiga', sprite: spriteOf(x.active || 'gochi'), t: null, friend: true }); return; }
        out.push({ name: isOwner ? 'Meffy' : (x.name || 'Amiga'), sprite: rc ? (Pix.has(rc.pet) ? rc.pet : spriteOf(x.active || 'pudin')) : 'pudin', t: rc ? +rc.t : 49, owner: isOwner, practice: !rc, friend: !isOwner });
      }));
    } catch (e) {}
  }
  if (!out.some(r => r.owner) && !Store.isOwner) out.push({ name: 'Meffy', sprite: 'pudin', t: 49, owner: true, practice: true });
  // amigas que no han corrido esta semana: corren con un tiempo de práctica para que igual estén en la pista
  out.forEach((r, i) => { if (r.t == null) { r.t = 52 + (i % 4) * 3; r.practice = true; } });
  let b = 0; while (out.length < 3 && b < BOTS.length) { const [n, sp, t] = BOTS[b++]; if (!out.some(r => r.name === n)) out.push({ name: n, sprite: spriteOf(sp), t, bot: true }); }
  rivalsCache = out.sort((a, b2) => a.t - b2.t).slice(0, 7); rivalsAt = Date.now();
  return rivalsCache;
}
A.raceRivals = loadRivals;

// ---------------- El juego ----------------
async function raceGame() {
  const sh = gameShell('race'); let { w: W, h: H } = sh.fit();
  const rivals = await loadRivals();
  const map = { pet: spr(petSprite(), 4), star: spr('estrellita', 3), cono: spr('cr_cono', 4), charco: spr('cr_charco', 4), caja: spr('cr_caja', 4), turbo: spr('cr_turbo', 4), flag: spr('cr_bandera', 4), flor: spr(Pix.has('flower') ? 'flower' : 'estrellita', 3) };
  rivals.forEach((r, i) => { map['r' + i] = spr(r.sprite, 4); });
  const I = await loadImgs(map);
  const LANES = 3; let TW, TX, LW;
  const geo = () => { TW = Math.min(W - 40, 330); TX = (W - TW) / 2; LW = TW / LANES; };
  geo();
  const PET = 52, PY = () => H - 150;
  let lane, x, dist, v, slow, boost, items, nextSpawn, time, stars, run = true, paused = true, last = 0, raf, count, pops, finished, hits, flowers;
  const laneX = l => TX + LW * l + LW / 2;
  function reset() { lane = 1; x = laneX(1); dist = 0; v = 0; slow = 0; boost = 0; items = []; nextSpawn = 30; time = 0; stars = 0; count = 3.2; pops = []; finished = false; hits = 0;
    flowers = Array.from({ length: 26 }, () => ({ side: Math.random() < .5 ? 0 : 1, m: Math.random() * (GOAL + 80), o: Math.random() })); }
  function spawn() {
    while (nextSpawn < dist + 60 && nextSpawn < GOAL - 15) {
      const m = nextSpawn; const free = [0, 1, 2];
      const nObs = Math.random() < .25 + dist / GOAL * .3 ? 2 : 1;
      for (let k = 0; k < nObs; k++) { const i = Math.floor(Math.random() * free.length); const l = free.splice(i, 1)[0]; items.push({ m, l, k: ['cono', 'charco', 'caja'][Math.floor(Math.random() * 3)], bad: true }); }
      const l2 = free[Math.floor(Math.random() * free.length)];
      if (Math.random() < .12) items.push({ m: m + 3, l: l2, k: 'turbo' });
      else for (let j = 0; j < 3; j++) items.push({ m: m + 2 + j * 2.4, l: l2, k: 'star' });
      nextSpawn += 11 + Math.random() * 8 - dist / GOAL * 3;
    }
  }
  function step(dt) {
    const s = dt / 60;
    if (count > 0) { const c0 = Math.ceil(count); count -= s; if (Math.ceil(count) < c0 && count > 0) gsfx('tick'); if (count <= 0) gsfx('start'); return; }
    if (finished) return;
    time += s;
    const base = 10.5 + Math.min(4.5, time * .09);
    const target = slow > 0 ? 5 : boost > 0 ? base + 7 : base;
    v += (target - v) * Math.min(1, s * 3); slow -= s; boost -= s;
    dist += v * s; spawn();
    x += (laneX(lane) - x) * Math.min(1, s * 14);
    const myLane = Math.round((x - TX - LW / 2) / LW);
    items.forEach(it => {
      if (it.done || Math.abs(it.m - dist) > .9 || it.l !== myLane) return;
      it.done = true;
      if (it.bad) { slow = .9; hits++; gsfx('bonk'); if (navigator.vibrate) navigator.vibrate(50); pops.push({ x, y: PY(), t: 30, txt: '¡Ay!', bad: true }); }
      else if (it.k === 'turbo') { boost = 2.2; gsfx('coin'); pops.push({ x, y: PY(), t: 30, txt: '¡Turbo!' }); }
      else { stars++; gsfx('coin'); pops.push({ x, y: PY(), t: 26, txt: '+1' }); }
    });
    items = items.filter(it => it.m > dist - 20);
    pops.forEach(p => p.t -= dt); pops = pops.filter(p => p.t > 0);
    if (dist >= GOAL) { dist = GOAL; finished = true; setTimeout(over, 700); }
  }
  const rivalDist = r => Math.min(GOAL, GOAL * Math.max(0, time) / r.t);
  const yOf = m => PY() - (m - dist) * PXM;
  function draw() {
    const g = sh.g;
    g.fillStyle = '#bfe6a8'; g.fillRect(0, 0, W, H);
    // pasto con florcitas a los lados
    flowers.forEach(f => { const y = yOf(f.m); if (y < -20 || y > H + 20) return; const fx = f.side ? TX + TW + 6 + f.o * Math.max(4, TX - 30) : 6 + f.o * Math.max(4, TX - 30); g.drawImage(I.flor, fx, y, 16, 16); });
    // pista
    g.fillStyle = '#f7d9c4'; g.fillRect(TX, 0, TW, H);
    g.fillStyle = '#ffffff'; g.fillRect(TX - 4, 0, 4, H); g.fillRect(TX + TW, 0, 4, H);
    g.fillStyle = '#f27ea1'; for (let y = -((dist * PXM) % 24); y < H; y += 24) { g.fillRect(TX - 4, y, 4, 12); g.fillRect(TX + TW, y + 12, 4, 12); }
    g.fillStyle = 'rgba(255,255,255,.75)'; for (let l = 1; l < LANES; l++) for (let y = -((dist * PXM) % 30); y < H; y += 30) g.fillRect(TX + LW * l - 1.5, y, 3, 16);
    // salida y meta
    [[0, '#ffffff', '#f27ea1'], [GOAL, '#6b3b3f', '#ffffff']].forEach(([m, a, b]) => { const y = yOf(m); if (y < -20 || y > H + 20) return; for (let i = 0; i < TW / 10; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(TX + i * 10, y - 10 + j * 10, 10, 10); } });
    const fy = yOf(GOAL); if (fy > -40 && fy < H) { g.drawImage(I.flag, TX - 34, fy - 44, 28, 32); g.drawImage(I.flag, TX + TW + 6, fy - 44, 28, 32); }
    // cositas en la pista
    items.forEach(it => { if (it.done) return; const y = yOf(it.m); if (y < -40 || y > H + 40) return; const cx = laneX(it.l);
      if (it.k === 'star') g.drawImage(I.star, cx - 12, y - 12, 24, 24);
      else if (it.k === 'charco') g.drawImage(I.charco, cx - 26, y - 10, 52, 26);
      else g.drawImage(I[it.k], cx - 20, y - 22, 40, 40); });
    // rivales (fantasmitas)
    rivals.forEach((r, i) => { const m = rivalDist(r); const y = yOf(m); if (y < -60 || y > H + 60) return; const l = i % LANES; const cx = laneX(l) + (i % 2 ? 10 : -10);
      g.globalAlpha = .55; g.drawImage(I['r' + i], cx - 20, y - 40, 40, 40); g.globalAlpha = 1;
      g.font = '800 11px Nunito, sans-serif'; g.textAlign = 'center'; const tw = g.measureText(r.name).width + 10; g.fillStyle = r.owner ? 'rgba(242,126,161,.92)' : 'rgba(255,255,255,.9)'; g.fillRect(cx - tw / 2, y - 56, tw, 15); g.fillStyle = r.owner ? '#fff' : '#6b3b3f'; g.fillText(r.name, cx, y - 45); });
    // tu mascota
    const bob = count > 0 ? 0 : Math.sin(time * 18) * 2;
    if (boost > 0) { g.fillStyle = 'rgba(255,226,122,.55)'; for (let k = 1; k < 4; k++) g.fillRect(x - 10 + k * 3, PY() + 8 + k * 9, 20 - k * 6, 6); }
    g.save(); if (slow > 0 && Math.floor(time * 20) % 2) g.globalAlpha = .45; g.drawImage(I.pet, x - PET / 2, PY() - PET + 10 + bob, PET, PET); g.restore();
    pops.forEach(p => { g.globalAlpha = Math.max(0, p.t / 30); g.font = '800 17px Nunito, sans-serif'; g.textAlign = 'center'; g.fillStyle = p.bad ? '#3d78b5' : '#c44a72'; g.fillText(p.txt, p.x, p.y - 50 - (30 - p.t)); g.globalAlpha = 1; });
    // barra de la carrera: dónde va cada una
    const bx = 14, by = 64, bh = Math.min(H - 260, 300);
    g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(bx, by, 8, bh); g.fillStyle = '#6b3b3f'; g.fillRect(bx - 3, by - 4, 14, 4);
    rivals.forEach(r => { const yy = by + bh - bh * rivalDist(r) / GOAL; g.fillStyle = r.owner ? '#f27ea1' : '#9fd6f2'; g.fillRect(bx - 2, yy - 3, 12, 6); });
    const yy = by + bh - bh * dist / GOAL; g.fillStyle = '#ffe27a'; g.fillRect(bx - 4, yy - 5, 16, 10); g.strokeStyle = '#8a4d4f'; g.lineWidth = 2; g.strokeRect(bx - 4, yy - 5, 16, 10);
    // cuenta regresiva
    if (count > 0) { g.fillStyle = 'rgba(80,40,50,.25)'; g.fillRect(0, 0, W, H); g.font = '900 86px Nunito, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.strokeStyle = '#c44a72'; g.lineWidth = 8; const t = count > .2 ? String(Math.ceil(count - .2)) : '¡YA!'; g.strokeText(t, W / 2, H / 2); g.fillText(t, W / 2, H / 2); }
    $('#gmA', sh.ov).textContent = fmtT(Math.max(0, time));
    $('#gmB', sh.ov).innerHTML = `${img('estrellita', 16)} ${stars} · ${Math.round(GOAL - dist)} m`;
  }
  function loop(t) { if (!run) return; const dt = Math.min(2.2, last ? (t - last) / 16.67 : 1); last = t; if (!paused) step(dt); if (run) draw(); raf = requestAnimationFrame(loop); }
  function over() {
    if (!run) return; A.gameMusic.stop(); run = false; cancelAnimationFrame(raf);
    const t = Math.round(time * 100) / 100;
    const all = rivals.map(r => ({ name: r.name, t: r.t, owner: r.owner, practice: r.practice, bot: r.bot })).concat([{ name: 'Tú', t, me: true }]).sort((a, b) => a.t - b.t);
    const pos = all.findIndex(r => r.me) + 1;
    const prize = [0, 10, 6, 4][pos] || 2;
    const prev = myBest(); const rec = prev == null || t < prev;
    if (rec) { S.settings.race = { w: week(), t, pet: petSprite() }; }
    const gm = GM(); if (!gm.best.carrera || t < gm.best.carrera) gm.best.carrera = t;
    const fromStars = Math.floor(stars / 3); const earned = payRace(fromStars + prize);
    A.petAddXp && A.petAddXp(10, 'game'); A.saveSettings();
    if (rec && A.publishRoom && Store.mode === 'supa') { A.publishRoom().catch(() => {}); rivalsCache = null; }
    gsfx(pos === 1 ? 'record' : 'over');
    const medal = ['', 'trofeo', 'estrellita', 'heart'][pos] || 'heart';
    const lines = `<div class="cr-pos">${img(medal, 34)}<b>${pos === 1 ? '¡Ganaste!' : pos + '.º lugar'}</b></div><div class="gm-big">${fmtT(t)}</div>${rec ? `<div class="cr-rec">${prev == null ? 'Tu primer tiempo de la semana' : '¡Nuevo récord de la semana!'}</div>` : `<div class="faint">Tu récord de la semana: ${fmtT(prev)}</div>`}
<div class="cr-rank">${all.map((r, i) => `<div class="${r.me ? 'me' : ''} ${r.owner ? 'owner' : ''}"><span>${i + 1}</span><b>${esc(r.name)}${r.practice || r.bot ? ' <em>práctica</em>' : ''}</b><span>${fmtT(r.t)}</span></div>`).join('')}</div>
<div class="row" style="justify-content:center;gap:6px;font-weight:800">${ST(18)} +${earned} estrellitas</div>${earned < fromStars + prize ? '<div class="faint">Llegaste al máximo de estrellitas de carreritas por hoy.</div>' : `<div class="faint">${fromStars} por ${stars} atrapadas (cada 3 = 1) + ${prize} por tu lugar${hits ? ` · chocaste ${hits} ${hits === 1 ? 'vez' : 'veces'}` : ''}</div>`}`;
    K.endCard(sh, 'CARRERITAS', lines, raceGame);
  }
  // controles: tocar a la izquierda o derecha, deslizar, o flechas
  const move = d => { if (count > 0 || finished || paused) return; const n = Math.max(0, Math.min(LANES - 1, lane + d)); if (n !== lane) { lane = n; gsfx('tick'); } };
  let sx = null;
  sh.cv.addEventListener('pointerdown', e => { sx = e.clientX; });
  sh.cv.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; if (Math.abs(dx) > 30) move(dx > 0 ? 1 : -1); else move(e.clientX < W / 2 ? -1 : 1); sx = null; });
  const kd = e => { if (e.key === 'ArrowLeft') move(-1); if (e.key === 'ArrowRight') move(1); if (e.key === 'Escape') sh.close(); };
  addEventListener('keydown', kd);
  const onResize = () => { ({ w: W, h: H } = sh.fit()); geo(); x = laneX(lane); }; addEventListener('resize', onResize);
  $('.gm-pause', sh.ov).onclick = () => { if (finished) return; paused = !paused; gsfx('tick'); paused ? A.gameMusic.pause() : A.gameMusic.resume(); const m = $('.gm-msg', sh.ov); if (paused) { m.hidden = false; m.innerHTML = `<div class="gm-end"><div class="gm-k">PAUSA</div><div class="row" style="gap:8px;margin-top:10px"><button class="btn" data-x="out" style="flex:1;justify-content:center">Salir</button><button class="btn pink" data-x="go" style="flex:1;justify-content:center">Seguir</button></div></div>`; m.onclick = e => { const b = e.target.closest('[data-x]'); if (!b) return; if (b.dataset.x === 'out') sh.close(); else { paused = false; m.hidden = true; A.gameMusic.resume(); } }; } };
  sh.close = () => { A.gameMusic.stop(); run = false; cancelAnimationFrame(raf); removeEventListener('keydown', kd); removeEventListener('resize', onResize); sh.ov.remove(); document.body.classList.remove('gaming'); if (S.route === 'juegos' || S.route === 'rincon') A.render(); };
  reset();
  const m = $('.gm-msg', sh.ov); m.hidden = false;
  const best = myBest();
  m.innerHTML = `<div class="gm-end"><div class="gm-k">CARRERITAS</div>
<div class="faint" style="margin-bottom:6px">Corre ${GOAL} m lo más rápido que puedas. Tus rivales corren con su mejor tiempo de esta semana.</div>
<div class="gm-legend"><span>${img('estrellita', 28)}3 = 1 estrellita</span><span>${img('cr_turbo', 28)}Turbo</span><span>${img('cr_cono', 28)}Esquiva</span></div>
<div class="cr-rank small">${rivals.map(r => `<div class="${r.owner ? 'owner' : ''}"><span>${img(r.sprite, 20)}</span><b>${esc(r.name)}${r.practice || r.bot ? ' <em>práctica</em>' : ''}</b><span>${fmtT(r.t)}</span></div>`).join('')}${best != null ? `<div class="me"><span>${img(petSprite(), 20)}</span><b>Tú</b><span>${fmtT(best)}</span></div>` : ''}</div>
<div class="faint">Toca a la izquierda o a la derecha (o desliza) para cambiar de carril.</div>
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
