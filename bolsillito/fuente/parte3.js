// ===== Bolsillito 2026 · Parte 3: juegos, temporada, visitas, tablero de sueños y jardín =====
(function () {
const A = App, S = A.S, { $, $$, esc, toast, openSheet, closeSheet, uid, today, ymd, addDays, money } = A;
const ACT = A.ACTIONS;
const ST = n => `<img class="pixel ico" alt="estrellitas" src="${Pix.sprite('estrellita', 3)}" style="width:${n || 16}px;height:${n || 16}px;vertical-align:-3px">`;
const spr = (n, sc) => Pix.sprite(n, sc || 4);
const img = (n, size, sc, extra) => `<img class="pixel" alt="" src="${spr(n, sc || 3)}" style="width:${size}px;height:auto;${extra || ''}">`;
const bal = () => (A.rinconBalance ? A.rinconBalance() : 0);
const starsPill = () => `<span class="pill sm" style="background:#fff09a;color:#6b4d12">${ST(18)} ${bal()}</span>`;
const sub = A.subHeader;
const pageIcon = (k, n) => Object.values(A.PACKS).forEach(pk => { pk.map[k] = pk.map[k] || ('s:' + n + (pk.map.home && pk.map.home.includes('~') ? '~' + pk.map.home.split('~')[1] : '')); });
Object.assign(A.PAGES, { juegos: 'Juegos', jardin: 'Mi jardín', tablero: 'Tablero de sueños', visitas: 'Visitas' });
pageIcon('juegos', 'game'); pageIcon('jardin', 'brote'); pageIcon('tablero', 'pic'); pageIcon('visitas', 'casita');
const activePet = () => (A.petActive && A.petActive()) || 'gochi';
const petSprite = () => (A.petInfo ? A.petInfo(activePet()).sprite : 'gochi');

// ================= Juegos =================
const GAME_CAP = 40;
function GM() { const g = S.settings.games = S.settings.games || { best: {} }; if (g.d !== today()) { g.d = today(); g.stars = 0; } g.best = g.best || {}; return g; }
function payGame(n) { const g = GM(); const ok = Math.max(0, Math.min(n, GAME_CAP - g.stars)); g.stars += ok; if (ok) A.giveStars(ok); return ok; }
A.screens.juegos = () => {
  const g = GM();
  return `${sub('juegos', 'rincon', starsPill())}
<button class="card gm-card sky" data-act="gmPlay" data-g="saltar"><div class="gm-art"><img class="pixel" alt="" src="${spr('plataforma_nube', 3)}" style="width:66px;position:absolute;left:4px;top:56px"><img class="pixel" alt="" src="${spr('plataforma', 3)}" style="width:66px;position:absolute;right:2px;top:20px"><img class="pixel gm-bounce" alt="" src="${spr(petSprite(), 4)}" style="width:54px;position:absolute;left:32px;top:6px"></div><div style="flex:1"><b class="mid" style="font-family:var(--f-display)">Saltar hasta las nubes</b><div class="faint">Atrapa estrellitas mientras subes. Cuidado: unas plataformas se rompen y las nubes se esfuman.</div><div class="tag gold" style="margin-top:6px">Tu récord · ${g.best.saltar || 0} m</div></div></button>
<button class="card gm-card picnic" data-act="gmPlay" data-g="atrapar"><div class="gm-art">${['fresa', 'dona', 'galleta'].map((f, i) => `<img class="pixel gm-fall" alt="" src="${spr(f, 3)}" style="width:28px;position:absolute;left:${10 + i * 26}px;top:${4 + (i % 2) * 18}px;animation-delay:-${i * .5}s">`).join('')}<img class="pixel" alt="" src="${spr(petSprite(), 4)}" style="width:54px;position:absolute;left:24px;bottom:2px"></div><div style="flex:1"><b class="mid" style="font-family:var(--f-display)">Atrapar comidita</b><div class="faint">Toda la comida que atrapes va directo a la despensa. Esquiva las gotas de lluvia.</div><div class="tag gold" style="margin-top:6px">Tu récord · ${g.best.atrapar || 0} cositas</div></div></button>
<div class="card row" style="gap:10px">${img('estrellita', 28)}<div style="flex:1"><b>Hoy llevas ${g.stars} de ${GAME_CAP} estrellitas de juegos</b><div class="faint">Cada partida también le da +10 puntos a ${esc(A.petInfo ? A.petInfo(activePet()).name : 'tu mascota')} para crecer.</div></div></div>`;
};
ACT.gmPlay = a => (a.dataset.g === 'saltar' ? jumpGame : catchGame)();

function loadImgs(map) { return Promise.all(Object.entries(map).map(([k, src]) => new Promise(res => { const i = new Image(); i.onload = () => res([k, i]); i.onerror = () => res([k, i]); i.src = src; }))).then(Object.fromEntries); }
function gameShell(cls) {
  const ov = document.createElement('div'); ov.className = 'game ' + cls; ov.setAttribute('role', 'dialog');
  ov.innerHTML = `<canvas></canvas><div class="gm-hud"><span class="chip" id="gmA"></span><span class="chip" id="gmB"></span><button class="gm-pause" aria-label="Pausa"><span></span><span></span></button></div><div class="gm-msg" hidden></div>`;
  document.body.appendChild(ov); document.body.classList.add('gaming');
  const cv = $('canvas', ov); const g = cv.getContext('2d');
  const fit = () => { const dpr = Math.min(2, window.devicePixelRatio || 1); const w = ov.clientWidth, h = ov.clientHeight; cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px'; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingEnabled = false; return { w, h }; };
  return { ov, cv, g, fit };
}
function tiltControl(onTilt) {
  const h = e => { if (e.gamma != null) onTilt(Math.max(-1, Math.min(1, e.gamma / 25))); };
  try { if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission().then(r => { if (r === 'granted') addEventListener('deviceorientation', h); }).catch(() => {}); else addEventListener('deviceorientation', h); } catch (e) { }
  return () => removeEventListener('deviceorientation', h);
}
function endCard(sh, title, lines, again) {
  const m = $('.gm-msg', sh.ov); m.hidden = false;
  m.innerHTML = `<div class="gm-end"><div class="gm-k">${title}</div>${lines}<div class="row" style="gap:8px;margin-top:10px"><button class="btn" data-x="out" style="flex:1;justify-content:center">Salir</button><button class="btn pink" data-x="again" style="flex:1;justify-content:center">Otra vez</button></div></div>`;
  m.onclick = e => { const b = e.target.closest('[data-x]'); if (!b) return; sh.close(); if (b.dataset.x === 'again') again(); };
}

// ---- Saltar hasta las nubes ----
async function jumpGame() {
  const sh = gameShell('jump'); let { w: W, h: H } = sh.fit();
  const I = await loadImgs({ pet: spr(petSprite(), 4), p: spr('plataforma', 3), rota: spr('plataforma_rota', 3), nube: spr('plataforma_nube', 3), coin: spr('estrellita', 3), spring: spr('resorte', 3), cloud: spr('nube', 4) });
  const PW = 72, PH = 24, PET = 52;
  let me, plats, coins, cam, coinsGot, maxH, run = true, paused = false, tilt = 0, keyDir = 0, touchDir = 0, last = 0, raf;
  const rnd = (a, b) => a + Math.random() * (b - a);
  function platAt(y) { const hgt = -y / 10; const r = Math.random(); const t = hgt > 30 && r < Math.min(.28, .08 + hgt / 1200) ? 'rota' : hgt > 15 && r > 1 - Math.min(.25, .06 + hgt / 1500) ? 'nube' : 'p'; return { x: rnd(4, W - PW - 4), y, t, gone: false, vy: 0, spring: t === 'p' && Math.random() < .07, dx: hgt > 60 && t === 'p' && Math.random() < .2 ? rnd(-1, 1) : 0 }; }
  function reset() {
    me = { x: W / 2 - PET / 2, y: H - 140, vy: -11, vx: 0, face: 1 }; plats = []; coins = []; cam = 0; coinsGot = 0; maxH = 0;
    plats.push({ x: W / 2 - PW / 2, y: H - 80, t: 'p', gone: false, vy: 0, dx: 0 });
    let y = H - 80; while (y > -H) { y -= rnd(58, 92); plats.push(platAt(y)); if (Math.random() < .35) coins.push({ x: rnd(10, W - 30), y: y - rnd(30, 60), got: false }); }
  }
  function step(dt) {
    const dir = keyDir || touchDir || tilt;
    me.vx = dir * 6.2; me.x += me.vx * dt; if (dir) me.face = dir > 0 ? 1 : -1;
    if (me.x < -PET / 2) me.x = W - PET / 2; if (me.x > W - PET / 2) me.x = -PET / 2;
    me.vy += 0.42 * dt; me.y += me.vy * dt;
    plats.forEach(p => { if (p.dx) { p.x += p.dx * dt; if (p.x < 0 || p.x > W - PW) p.dx *= -1; } if (p.gone) { p.vy += .5 * dt; p.y += p.vy * dt; } });
    if (me.vy > 0) for (const p of plats) {
      if (p.gone) continue; const feet = me.y + PET - 4;
      if (feet >= p.y && feet <= p.y + PH * .6 + me.vy * dt && me.x + PET * .75 > p.x && me.x + PET * .25 < p.x + PW) {
        if (p.t === 'rota') { p.gone = true; continue; }
        me.vy = p.spring ? -19 : -12; me.y = p.y - PET + 4;
        if (p.t === 'nube') { p.gone = true; p.fade = 1; }
        break;
      }
    }
    coins.forEach(c => { if (!c.got && Math.abs(c.x + 12 - (me.x + PET / 2)) < 30 && Math.abs(c.y + 12 - (me.y + PET / 2)) < 32) { c.got = true; coinsGot++; } });
    if (me.y < H * .42) { const d = H * .42 - me.y; me.y += d; cam += d; plats.forEach(p => p.y += d); coins.forEach(c => c.y += d); }
    maxH = Math.max(maxH, Math.floor(cam / 10));
    plats = plats.filter(p => p.y < H + 40 && !(p.fade && p.fade <= 0)); coins = coins.filter(c => c.y < H + 40 && !c.got);
    let top = Math.min(...plats.map(p => p.y)); while (top > -60) { top -= rnd(56, 90 + Math.min(36, maxH / 15)); plats.push(platAt(top - cam * 0)); if (Math.random() < .35) coins.push({ x: rnd(10, W - 30), y: top - rnd(30, 60), got: false }); }
    if (me.y > H + 20) over();
  }
  function draw() {
    const g = sh.g; const k = Math.min(1, maxH / 600);
    const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, k > .5 ? '#c9b8f2' : '#bfe4fb'); grd.addColorStop(1, k > .5 ? '#ffe0ec' : '#eef8ff'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 5; i++) { const cy = ((i * 190 + cam * .3) % (H + 120)) - 60, cx = (i * 137 + 20) % (W - 80); [[0, 8, 34, 12], [-18, 12, 18, 10], [20, 4, 22, 14]].forEach(([dx, dy, rx, ry]) => { g.beginPath(); g.ellipse(cx + 40 + dx, cy + dy, rx, ry, 0, 0, 7); g.fill(); }); }
    plats.forEach(p => { const im = p.t === 'rota' ? I.rota : p.t === 'nube' ? I.nube : I.p; if (p.fade) { p.fade -= .06; g.globalAlpha = Math.max(0, p.fade); } g.drawImage(im, p.x, p.y, PW, PH); g.globalAlpha = 1; if (p.spring && !p.gone) g.drawImage(I.spring, p.x + PW / 2 - 12, p.y - 20, 24, 24); });
    coins.forEach(c => g.drawImage(I.coin, c.x, c.y + Math.sin((Date.now() / 300) + c.x) * 3, 24, 24));
    g.save(); g.translate(me.x + PET / 2, me.y + PET / 2); g.scale(me.face, 1); const sq = me.vy < -9 ? 1.08 : 1; g.scale(1 / sq, sq); g.drawImage(I.pet, -PET / 2, -PET / 2, PET, PET); g.restore();
    $('#gmA', sh.ov).textContent = maxH + ' m'; $('#gmB', sh.ov).innerHTML = `${ST(14)} +${coinsGot}`;
  }
  function loop(t) { if (!run) return; const dt = Math.min(2.2, last ? (t - last) / 16.67 : 1); last = t; if (!paused) step(dt); draw(); raf = requestAnimationFrame(loop); }
  function over() {
    run = false; cancelAnimationFrame(raf); const gm = GM(); const rec = maxH > (gm.best.saltar || 0); if (rec) gm.best.saltar = maxH;
    const earned = payGame(coinsGot + Math.floor(maxH / 25)); A.petAddXp && A.petAddXp(10, 'game'); A.saveSettings();
    endCard(sh, rec ? '¡NUEVO RÉCORD!' : '¡Buen salto!', `<div class="gm-big">${maxH} m</div><div class="row" style="justify-content:center;gap:6px;font-weight:800">${ST(18)} +${earned} estrellitas</div>${earned < coinsGot + Math.floor(maxH / 25) ? '<div class="faint">Ya llegaste al tope de estrellitas de juegos por hoy.</div>' : ''}<div class="faint">Récord: ${gm.best.saltar || 0} m</div>`, jumpGame);
  }
  const kd = e => { if (e.key === 'ArrowLeft') keyDir = -1; if (e.key === 'ArrowRight') keyDir = 1; if (e.key === 'Escape') sh.close(); };
  const ku = e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') keyDir = 0; };
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  const td = e => { if (e.target.closest('.gm-hud,.gm-msg')) return; touchDir = e.clientX < W / 2 ? -1 : 1; };
  sh.cv.addEventListener('pointerdown', td); sh.cv.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') td(e); }); addEventListener('pointerup', () => touchDir = 0);
  const untilt = tiltControl(v => tilt = Math.abs(v) < .12 ? 0 : v);
  $('.gm-pause', sh.ov).onclick = () => { paused = !paused; const m = $('.gm-msg', sh.ov); if (paused) { m.hidden = false; m.innerHTML = `<div class="gm-end"><div class="gm-k">PAUSA</div><div class="row" style="gap:8px;margin-top:10px"><button class="btn" data-x="out" style="flex:1;justify-content:center">Salir</button><button class="btn pink" data-x="go" style="flex:1;justify-content:center">Seguir</button></div></div>`; m.onclick = e => { const b = e.target.closest('[data-x]'); if (!b) return; if (b.dataset.x === 'out') sh.close(); else { paused = false; m.hidden = true; } }; } };
  sh.close = () => { run = false; cancelAnimationFrame(raf); removeEventListener('keydown', kd); removeEventListener('keyup', ku); untilt(); sh.ov.remove(); document.body.classList.remove('gaming'); if (S.route === 'juegos' || S.route === 'rincon') A.render(); };
  addEventListener('resize', () => { const r = sh.fit(); W = r.w; H = r.h; }, { once: true });
  sh.ov.__st = () => ({ me, plats, W, PW, PET, set: d => { keyDir = d; } });
  reset(); const m = $('.gm-msg', sh.ov); m.hidden = false; paused = true;
  m.innerHTML = `<div class="gm-end"><div class="gm-k">SALTAR HASTA LAS NUBES</div><div class="gm-legend"><span>${img('plataforma', 48)}Normal</span><span>${img('plataforma_rota', 48)}Se rompe</span><span>${img('plataforma_nube', 48)}Se esfuma</span></div><div class="faint">Inclina el celular, toca un lado de la pantalla o usa las flechas para moverte. Cada estrellita que atrapes es tuya.</div><button class="btn pink" data-x="go" style="justify-content:center;margin-top:10px;width:100%">¡A saltar!</button></div>`;
  m.onclick = e => { if (e.target.closest('[data-x]')) { m.hidden = true; paused = false; } };
  raf = requestAnimationFrame(loop);
}

// ---- Atrapar comidita ----
async function catchGame() {
  const sh = gameShell('catch'); let { w: W, h: H } = sh.fit();
  const foods = Object.keys(A.FOODS).filter(k => !A.FOODS[k].off);
  const map = { pet: spr(petSprite(), 4), gota: spr('gota', 3), heart: spr('heart', 3), heartE: spr('heartS', 3) }; foods.forEach(k => map[k] = spr(A.FOODS[k].sprite || k, 3));
  const I = await loadImgs(map);
  const PET = 64; let px, items, caught, lives, time, run = true, paused = true, last = 0, spawn = 0, raf, tilt = 0, keyDir = 0, target = null, pop = [];
  function reset() { px = W / 2 - PET / 2; items = []; caught = {}; lives = 3; time = 45; }
  const total = () => Object.values(caught).reduce((s, n) => s + n, 0);
  function step(dt) {
    time -= dt / 60; if (time <= 0) return over();
    const sp = 1 + (45 - time) / 30;
    spawn -= dt; if (spawn <= 0) { spawn = Math.max(14, 42 - (45 - time)) ; const bad = Math.random() < .22 + (45 - time) / 200; items.push({ k: bad ? 'gota' : foods[Math.floor(Math.random() * foods.length)], x: 10 + Math.random() * (W - 50), y: -40, v: (2 + Math.random() * 1.6) * sp, r: Math.random() * 6 }); }
    const dir = keyDir || tilt; if (dir) px += dir * 7 * dt; if (target != null) px += (target - PET / 2 - px) * Math.min(1, .35 * dt);
    px = Math.max(0, Math.min(W - PET, px));
    const py = H - PET - 24;
    items.forEach(it => { it.y += it.v * dt; it.r += .05 * dt;
      if (!it.done && it.y + 30 > py + 8 && it.y < py + PET * .6 && it.x + 30 > px + 6 && it.x < px + PET - 6) {
        it.done = true;
        if (it.k === 'gota') { lives--; pop.push({ x: px + PET / 2, y: py, t: 30, txt: '-1', bad: true }); if (navigator.vibrate) navigator.vibrate(60); if (lives <= 0) return over(); }
        else { caught[it.k] = (caught[it.k] || 0) + 1; pop.push({ x: px + PET / 2, y: py, t: 30, txt: '+1' }); }
      } });
    items = items.filter(it => !it.done && it.y < H + 40); pop.forEach(p => p.t -= dt); pop = pop.filter(p => p.t > 0);
  }
  function draw() {
    const g = sh.g; const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#fff0de'); grd.addColorStop(1, '#ffd5b8'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
    for (let y = H - 24; y < H; y += 8) for (let x = 0; x < W; x += 8) { g.fillStyle = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 ? '#ffc4d4' : '#fff6ea'; g.fillRect(x, y, 8, 8); }
    items.forEach(it => { g.save(); g.translate(it.x + 16, it.y + 16); g.rotate(Math.sin(it.r) * .25); g.drawImage(I[it.k], -16, -16, 32, 32); g.restore(); });
    const py = H - PET - 24; g.drawImage(I.pet, px, py, PET, PET);
    pop.forEach(p => { g.globalAlpha = p.t / 30; g.font = '800 18px Nunito, sans-serif'; g.textAlign = 'center'; g.fillStyle = p.bad ? '#3d78b5' : '#c44a72'; g.fillText(p.txt, p.x, p.y - (30 - p.t)); g.globalAlpha = 1; });
    $('#gmA', sh.ov).textContent = '0:' + String(Math.max(0, Math.ceil(time))).padStart(2, '0');
    $('#gmB', sh.ov).innerHTML = `${img('cupcake', 16)} ${total()} · ${[0, 1, 2].map(i => `<img class="pixel" alt="" src="${i < lives ? map.heart : map.heartE}" style="width:14px;${i < lives ? '' : 'opacity:.35'}">`).join('')}`;
  }
  function loop(t) { if (!run) return; const dt = Math.min(2.2, last ? (t - last) / 16.67 : 1); last = t; if (!paused) step(dt); if (run) draw(); raf = requestAnimationFrame(loop); }
  function over() {
    run = false; cancelAnimationFrame(raf); const pst = A.petState(); Object.entries(caught).forEach(([k, n]) => pst.pantry[k] = (pst.pantry[k] || 0) + n);
    const n = total(); const gm = GM(); const rec = n > (gm.best.atrapar || 0); if (rec) gm.best.atrapar = n;
    const earned = payGame(Math.floor(n / 3)); A.petAddXp && A.petAddXp(10, 'game'); A.saveSettings();
    endCard(sh, lives <= 0 ? '¡Te mojaste!' : rec ? '¡NUEVO RÉCORD!' : '¡Se acabó el tiempo!', `<div class="gm-big">${n} cositas</div><div class="gm-loot">${Object.entries(caught).map(([k, c]) => `<span>${img(k in A.FOODS && A.FOODS[k].sprite ? A.FOODS[k].sprite : k, 26)}×${c}</span>`).join('') || '<span class="faint">Nada esta vez</span>'}</div><div class="faint">Todo se guardó en la despensa.</div><div class="row" style="justify-content:center;gap:6px;font-weight:800">${ST(18)} +${earned} estrellitas</div>`, catchGame);
  }
  const kd = e => { if (e.key === 'ArrowLeft') keyDir = -1; if (e.key === 'ArrowRight') keyDir = 1; if (e.key === 'Escape') sh.close(); };
  const ku = e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') keyDir = 0; };
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  sh.cv.addEventListener('pointerdown', e => { target = e.clientX; }); sh.cv.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') target = e.clientX; });
  sh.cv.addEventListener('pointerup', () => target = null);
  const untilt = tiltControl(v => tilt = Math.abs(v) < .12 ? 0 : v);
  $('.gm-pause', sh.ov).onclick = () => { paused = !paused; const m = $('.gm-msg', sh.ov); if (paused) { m.hidden = false; m.innerHTML = `<div class="gm-end"><div class="gm-k">PAUSA</div><div class="row" style="gap:8px;margin-top:10px"><button class="btn" data-x="out" style="flex:1;justify-content:center">Salir</button><button class="btn pink" data-x="go" style="flex:1;justify-content:center">Seguir</button></div></div>`; m.onclick = e => { const b = e.target.closest('[data-x]'); if (!b) return; if (b.dataset.x === 'out') sh.close(); else { paused = false; m.hidden = true; } }; } };
  sh.close = () => { run = false; cancelAnimationFrame(raf); removeEventListener('keydown', kd); removeEventListener('keyup', ku); untilt(); sh.ov.remove(); document.body.classList.remove('gaming'); if (S.route === 'juegos' || S.route === 'rincon') A.render(); };
  reset(); const m = $('.gm-msg', sh.ov); m.hidden = false;
  m.innerHTML = `<div class="gm-end"><div class="gm-k">ATRAPAR COMIDITA</div><div class="gm-legend"><span>${img('fresa', 30)}Atrápala</span><span>${img('dona', 30)}A la despensa</span><span>${img('gota', 30)}Esquívala</span></div><div class="faint">Desliza el dedo o inclina el celular para mover a tu mascota. Tienes 45 segundos y 3 vidas.</div><button class="btn pink" data-x="go" style="justify-content:center;margin-top:10px;width:100%">¡Empezar!</button></div>`;
  m.onclick = e => { if (e.target.closest('[data-x]')) { m.hidden = true; paused = false; } };
  raf = requestAnimationFrame(loop);
}

// ================= Ropa de temporada (en la Tiendita) =================
function lookArt(pet, accId, sc) {
  const an = A.ANCH[pet], a = A.ACC[accId]; const base = `<img class="pixel mz-base" alt="" src="${spr(an ? an.sprite : pet, sc)}">`;
  if (!an || !a) return `<span class="mz">${base}</span>`;
  let left = an.hx - a.w / 2, top = a.slot === 'head' ? an.hy - a.h + 2 + (a.lift || 0) : a.slot === 'face' ? an.fy - a.h / 2 : an.ny - 1;
  return `<span class="mz" style="animation:none">${base}<img class="pixel mz-acc" alt="" src="${spr('acc_' + accId, sc)}" style="left:${left / 20 * 100}%;top:${top / 20 * 100}%;width:${a.w / 20 * 100}%"></span>`;
}
function seasonItem(key) {
  const [kind, id] = key.split(':'); const r = S.settings.rincon || {}; const owned = r.owned || []; const bl = bal();
  if (kind === 'acc') { const a = A.ACC[id]; if (!a) return ''; const own = owned.includes('acc:' + id); return `<button class="se-item" data-act="shopItem" data-id="${id}"><img class="pixel" alt="" src="${spr('acc_' + id, 4)}" style="width:${Math.min(56, a.w * 4)}px"><b>${esc(a.name)}</b>${own ? '<span class="tag">Tuyo</span>' : `<span class="se-price">${ST(12)} ${a.price}</span>`}<span></span></button>`; }
  if (kind === 'bg') { const b = A.RC.BGS[id]; const own = owned.includes('bg:' + id); return `<button class="se-item" ${own ? `data-act="rcBg" data-k="${id}"` : `data-act="rcBuy" data-k="bg:${id}" data-p="${b.price}" ${bl < b.price ? 'disabled' : ''}`}><img class="pixel" alt="" src="${Pix.banner(id)}" style="width:64px;height:30px;object-fit:cover;border-radius:6px"><b>Fondo de noche</b>${own ? '<span class="tag">Tuyo</span>' : `<span class="se-price">${ST(12)} ${b.price}</span>`}</button>`; }
  if (kind === 'furn') { const f = A.FURN[id]; if (!f) return ''; const own = A.roomState().owned.includes(id); return `<button class="se-item" data-act="rmFurn" data-k="${id}"><img class="pixel" alt="" src="${Pix.sprite(f.sprite || 'x_' + id, 2)}" style="height:40px;width:auto"><b>${esc(f.name)}</b>${own ? '<span class="tag">Tuyo</span>' : `<span class="se-price">${ST(12)} ${f.price}</span>`}<em></em></button>`; }
  return '';
}
const tiendaScreen = A.screens.tienda;
A.screens.tienda = () => {
  const html = tiendaScreen(); const ALL = A.allSeasons(); const cur = ALL.filter(s => A.inSeason(s.id) && s.items.length); const next = ALL.filter(s => !A.inSeason(s.id));
  const bd = S.settings.birthday || '';
  const hero = cur.map(se => `<div class="se-hero"><div class="row between" style="align-items:flex-start"><div><div class="se-k">EDICIÓN LIMITADA</div><div class="se-name">${esc(se.name)}</div></div><span class="tag gold">Quedan ${A.seasonDaysLeft(se)} días</span></div>
<div class="se-looks">${se.look ? lookArt(se.pet, se.look, 5) : ''}${se.id === 'halloween' ? lookArt('shey', 'bruja', 5) : ''}</div>
<div class="se-items">${se.items.map(seasonItem).join('')}</div></div>`).join('');
  const extra = `${hero}<details class="card se-next"><summary><b>Lo que viene</b></summary>${next.map(se => `<div class="row" style="gap:10px;padding:6px 0">${se.look ? `<span style="width:48px;flex:none">${lookArt(se.pet, se.look, 3)}</span>` : `<span style="width:48px;flex:none">${img('gift', 34)}</span>`}<div style="flex:1"><b>${esc(se.name)}</b><div class="faint">${se.items.filter(k => k.startsWith('acc:')).map(k => esc((A.ACC[k.slice(4)] || {}).name || '')).join(' y ')} · ${esc(se.when)}</div></div>${img('candado', 22)}</div>`).join('')}
<div class="row" style="gap:10px;padding:6px 0"><span style="width:48px;flex:none">${lookArt(activePet(), 'fiesta', 3)}</span><div style="flex:1"><b>Tu cumpleaños</b><div class="faint">Gorrito de fiesta gratis para todos tus mochis</div></div><input class="in" type="date" id="bdayIn" value="${bd ? new Date().getFullYear() + '-' + bd : ''}" style="max-width:150px" aria-label="Tu cumpleaños"></div></details>`;
  const i = html.indexOf('<div class="seg"'); return i >= 0 ? html.slice(0, i) + extra + html.slice(i) : html + extra;
};
const afterTienda = A.after.tienda;
A.after.tienda = el => { afterTienda && afterTienda(el); const b = $('#bdayIn', el); if (b) b.onchange = () => { S.settings.birthday = b.value ? b.value.slice(5) : ''; A.saveSettings(); birthdayGift(); toast('¡Anotado! Ese día habrá sorpresa.'); }; };
function birthdayGift() {
  const bd = S.settings.birthday; if (!bd) return; const y = new Date().getFullYear(); if (S.settings.bdayGift === y) return;
  const d0 = new Date(y, +bd.slice(0, 2) - 1, +bd.slice(3)); const diff = (new Date() - d0) / 864e5; if (diff < -1 || diff > 3) return;
  const r = S.settings.rincon = S.settings.rincon || { owned: [] }; r.owned = r.owned || []; if (!r.owned.includes('acc:fiesta')) r.owned.push('acc:fiesta');
  S.settings.bdayGift = y; A.giveStars(20); A.saveSettings(); toast('¡Feliz cumpleaños! Te regalamos el gorrito de fiesta y 20 estrellitas');
}

// ================= Jardín de hábitos =================
function GD() { const g = S.settings.garden = S.settings.garden || {}; if (!g.habits) g.habits = [{ id: uid(), name: 'Anotar mis gastos', icon: 'list', auto: 'tx', days: [] }, { id: uid(), name: 'Tomar agua', icon: 'gota', days: [] }, { id: uid(), name: 'No comprar antojos', icon: 'shey', days: [] }]; return g; }
function habitDays(h) { const set = new Set(h.days || []); if (h.auto === 'tx') S.tx.forEach(t => { if (!t.example && !t.recurring && !t.inst) set.add(t.date); }); return set; }
function habitInfo(h) {
  const set = habitDays(h); const t = today(); let streak = 0; let d = new Date(); if (!set.has(t)) d = addDays(d, -1);
  while (set.has(ymd(d))) { streak++; d = addDays(d, -1); }
  const all = [...set].filter(x => x <= t).sort(); const lastD = all[all.length - 1]; const missed = lastD ? Math.round((A.parseYmd(t) - A.parseYmd(lastD)) / 864e5) : 99;
  const done = set.has(t);
  const plant = missed >= 3 && all.length ? 'marchita' : streak >= 30 ? 'girasol' : streak >= 7 ? 'florecida' : streak >= 3 ? 'plantita' : streak >= 1 ? 'brotecito' : 'semilla';
  return { streak, done, plant, missed, total: all.length };
}
A.screens.jardin = () => {
  const g = GD(); const hs = g.habits; const inf = hs.map(habitInfo); const doneN = inf.filter(x => x.done).length; const bloom = inf.some(x => x.plant === 'florecida' || x.plant === 'girasol');
  return `${sub('jardin', 'rincon', `<span class="pill sm">${doneN} de ${hs.length} hoy</span>`)}
<div class="garden" id="garden" style="background-image:url(${Pix.banner('pradera')})">${bloom ? `<img class="pixel gd-fly" alt="" src="${spr('mariposa', 3)}"><img class="pixel gd-fly b" alt="" src="${spr('mariposa', 3)}">` : ''}
<div class="gd-soil">${hs.map((h, i) => `<div class="gd-plot" data-plot="${h.id}"><img class="pixel gd-plant ${inf[i].plant}" alt="${esc(h.name)}" src="${spr(inf[i].plant, 4)}"><span class="gd-tag">${esc(h.name)}</span></div>`).join('')}</div></div>
<div class="list">${hs.map((h, i) => { const x = inf[i]; return `<div class="li gd-row"><button class="gd-name" data-act="gdEdit" data-id="${h.id}"><span class="ic">${img(h.icon || 'brote', 28)}</span><span class="tx-main"><b>${esc(h.name)}</b><span>${x.plant === 'marchita' ? `Se está marchitando: ${x.missed} días sin regar` : x.streak ? `${x.streak} ${x.streak === 1 ? 'día' : 'días'} seguidos` + (x.streak < 7 ? ` · florece en ${7 - x.streak}` : x.streak < 30 ? ` · girasol en ${30 - x.streak}` : ' · ¡girasol!') : 'Riégala hoy para que brote'}${h.auto ? ' · se riega sola al anotar' : ''}</span></span></button>
<button class="btn sm ${x.done ? 'ok' : 'pink'} gd-water" data-act="gdWater" data-id="${h.id}" ${x.done && h.auto ? 'disabled' : ''}>${img(x.done ? 'check' : 'regadera', 18)}${x.done ? 'Regado' : 'Regar'}</button></div>`; }).join('')}</div>
<button class="btn" data-act="gdNew" style="justify-content:center">Nuevo hábito +</button>
<p class="faint" style="margin:0">Cada hábito cumplido riega su planta y te da 1 estrellita. A los 7 días florece y a los 30 sale un girasol. Si la dejas 3 días, se marchita, pero revive en cuanto la riegues.</p>`;
};
ACT.gdWater = a => {
  const g = GD(); const h = g.habits.find(x => x.id === a.dataset.id); if (!h) return; const t = today(); h.days = h.days || [];
  if (h.days.includes(t)) { if (h.auto) return; h.days = h.days.filter(d => d !== t); A.saveSettings(); A.render(); return; }
  h.days.push(t); h.days = h.days.filter(d => d >= ymd(addDays(new Date(), -400)));
  if (!g.sd || g.sd.d !== t) g.sd = { d: t, n: 0, ids: [] };
  if (!g.sd.ids.includes(h.id) && g.sd.n < 6) { g.sd.n++; g.sd.ids.push(h.id); A.giveStars(1); }
  A.saveSettings();
  const plot = $(`[data-plot="${h.id}"]`); if (plot) { for (let i = 0; i < 6; i++) { const d = document.createElement('img'); d.className = 'pixel gd-drop'; d.src = spr('gota', 2); d.alt = ''; d.style.left = (20 + Math.random() * 60) + '%'; d.style.animationDelay = (i * .08) + 's'; plot.appendChild(d); } const can = document.createElement('img'); can.className = 'pixel gd-can'; can.src = spr('regadera', 3); can.alt = ''; plot.appendChild(can); }
  setTimeout(() => A.render(), 900);
};
const HAB_ICONS = ['gota', 'book', 'heart', 'shey', 'list', 'moon', 'gym', 'music', 'flower', 'coffee', 'piggy', 'star', 'escuela', 'paw', 'brote', 'sparkle'];
function habitSheet(h) {
  const g = GD(); const isNew = !h; h = h || { id: uid(), name: '', icon: 'gota', days: [] }; let icon = h.icon;
  openSheet(isNew ? 'Nuevo hábito' : 'Editar hábito', `<div class="stack"><label class="f">¿Qué quieres hacer cada día?<input class="in" id="hbN" value="${esc(h.name)}" placeholder="Ej. Leer 10 minutos" ${h.auto ? 'disabled' : ''}></label>
<div class="f">Su dibujito<div class="chips">${HAB_ICONS.map(i => `<button class="chip" data-hi="${i}" aria-pressed="${i === icon}">${img(i, 22)}</button>`).join('')}</div></div>
<button class="btn pink" id="hbOk" style="justify-content:center">Guardar</button>${isNew ? '' : '<button class="btn danger" id="hbDel" style="justify-content:center">Quitar del jardín</button>'}</div>`, sh => {
    sh.addEventListener('click', e => { const b = e.target.closest('[data-hi]'); if (!b) return; icon = b.dataset.hi; $$('[data-hi]', sh).forEach(x => x.setAttribute('aria-pressed', x === b)); });
    $('#hbOk', sh).onclick = () => { const n = $('#hbN').value.trim(); if (!n) return toast('Escribe el hábito'); h.name = n; h.icon = icon; if (isNew) { if (g.habits.length >= 8) return toast('Tu jardín tiene espacio para 8 plantas'); g.habits.push(h); } A.saveSettings(); closeSheet(); A.render(); };
    const del = $('#hbDel', sh); if (del) del.onclick = () => { if (!del.dataset.s) { del.dataset.s = 1; del.textContent = '¿Segura? Toca otra vez'; return; } g.habits = g.habits.filter(x => x.id !== h.id); A.saveSettings(); closeSheet(); A.render(); };
  });
}
ACT.gdNew = () => habitSheet(null);
ACT.gdEdit = a => habitSheet(GD().habits.find(x => x.id === a.dataset.id));

// ================= Tablero de sueños =================
function BD() { const b = S.settings.board = S.settings.board || {}; b.title = b.title || 'Mi ' + (new Date().getMonth() >= 9 ? new Date().getFullYear() + 1 : new Date().getFullYear()); b.items = b.items || []; b.words = b.words || ['Este es mi año', 'Me lo merezco']; return b; }
A.screens.tablero = () => {
  const b = BD(); const goals = S.fin.goals.filter(g => !g.example);
  const linked = b.items.map(it => it.goal && goals.find(g => g.id === it.goal)).filter(Boolean);
  const cards = b.items.map((it, i) => { const gl = it.goal && goals.find(g => g.id === it.goal); const pc = gl && gl.target ? Math.min(100, Math.round(gl.saved / gl.target * 100)) : null;
    return `<button class="pol ${it.shape === 'round' ? 'round' : ''}" data-act="bdEdit" data-id="${it.id}" style="--rot:${[-3, 2.5, -1.5, 3, -2.5, 1.5][i % 6]}deg"><img class="pixel pol-tape" alt="" src="${spr('ui_washi', 3)}"><span class="pol-pic">${it.img ? `<img alt="" src="${esc(it.img)}">` : `<span class="pol-empty">${img('pic', 30)}Toca para poner tu foto</span>`}</span><span class="pol-cap">${esc(it.cap || 'Mi sueño')}</span>${pc != null ? `<span class="prog" style="height:6px;margin:2px 6px 0"><i style="width:${pc}%"></i></span>` : ''}</button>`; });
  const words = b.words.map((w, i) => `<button class="bd-word" data-act="bdWord" data-i="${i}" style="--rot:${i % 2 ? 3 : -4}deg">${esc(w)}</button>`);
  const mix = []; cards.forEach((c, i) => { mix.push(c); if (i === 1 && words[0]) mix.push(words[0]); if (i === 3 && words[1]) mix.push(words[1]); });
  if (cards.length < 2) words.forEach(w => mix.push(w));
  return `${sub('tablero', 'journal', `<button class="btn sm" data-act="bdAdd">Agregar +</button>`)}
<button class="pill bd-title" data-act="bdTitle">${esc(b.title)}</button>
<div class="board">${mix.join('') || ''}${!b.items.length ? `<button class="pol" data-act="bdAdd" style="--rot:-2deg"><img class="pixel pol-tape" alt="" src="${spr('ui_washi', 3)}"><span class="pol-pic"><span class="pol-empty">${img('pic', 30)}Pon aquí la foto de tu primer sueño</span></span><span class="pol-cap">Mi primer sueño</span></button>` : ''}
<img class="pixel bd-st a" alt="" src="${spr('star', 3)}"><img class="pixel bd-st b" alt="" src="${spr('heart', 3)}"><img class="pixel bd-st c" alt="" src="${spr('sparkle', 3)}"></div>
${linked.length ? `<div class="card stack">${linked.map(gl => `<div class="row" style="gap:10px">${A.iconHTML(gl.icon, 34)}<div style="flex:1"><div class="row between"><b>Meta: ${esc(gl.name)}</b><b>${gl.target ? Math.round(gl.saved / gl.target * 100) : 0}%</b></div><span class="prog"><i style="width:${gl.target ? Math.min(100, gl.saved / gl.target * 100) : 0}%"></i></span><div class="faint">${money(gl.saved)} de ${money(gl.target)} · conectado a tus metas</div></div></div>`).join('')}</div>` : ''}
<p class="faint" style="margin:0">Pon fotos de lo que quieres lograr. Si las conectas con una meta de ahorro, ves cuánto te falta.</p>`;
};
function boardSheet(it) {
  const b = BD(); const isNew = !it; it = it || { id: uid(), img: '', cap: '', shape: 'pola', goal: '' }; const d = Object.assign({}, it);
  const goals = S.fin.goals.filter(g => !g.example);
  const draw = () => openSheet(isNew ? 'Nuevo sueño' : 'Tu sueño', `<div class="stack">
<label class="bd-photo">${d.img ? `<img alt="" src="${esc(d.img)}">` : `<span>${img('pic', 34)}Elegir foto</span>`}<input type="file" accept="image/*" id="bdFile" hidden></label>
<label class="f">¿Qué sueño es?<input class="in" id="bdCap" value="${esc(d.cap)}" placeholder="Ej. Viaje a la playa" maxlength="40"></label>
<div class="f">Forma de la foto<div class="seg"><button data-sh="pola" aria-pressed="${d.shape !== 'round'}">Polaroid</button><button data-sh="round" aria-pressed="${d.shape === 'round'}">Redonda</button></div></div>
<label class="f">Conectarlo a una meta (opcional)<select class="in" id="bdGoal"><option value="">Ninguna</option>${goals.map(g => `<option value="${g.id}" ${g.id === d.goal ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label>
<button class="btn pink" id="bdOk" style="justify-content:center">Guardar</button>${isNew ? '' : '<button class="btn danger" id="bdDel" style="justify-content:center">Quitar del tablero</button>'}</div>`, sh => {
    sh.addEventListener('click', e => { const s = e.target.closest('[data-sh]'); if (s) { d.cap = $('#bdCap').value; d.goal = $('#bdGoal').value; d.shape = s.dataset.sh; draw(); } });
    $('#bdFile', sh).onchange = async e => { const f = e.target.files[0]; if (!f) return; d.cap = $('#bdCap').value; d.goal = $('#bdGoal').value; toast('Subiendo foto…'); try { const r = await Store.saveImage(f, 900); d.img = r.src; draw(); } catch (er) { toast('No se pudo subir la foto'); } };
    $('#bdOk', sh).onclick = () => { d.cap = $('#bdCap').value.trim(); d.goal = $('#bdGoal').value; if (!d.cap && !d.img) return toast('Ponle una foto o un nombre'); Object.assign(it, d); if (isNew) b.items.push(it); A.saveSettings(); closeSheet(); A.render(); };
    const del = $('#bdDel', sh); if (del) del.onclick = () => { if (!del.dataset.s) { del.dataset.s = 1; del.textContent = '¿Segura? Toca otra vez'; return; } b.items = b.items.filter(x => x.id !== it.id); A.saveSettings(); closeSheet(); A.render(); };
  });
  draw();
}
ACT.bdAdd = () => { if (BD().items.length >= 12) return toast('Tu tablero tiene espacio para 12 sueños'); boardSheet(null); };
ACT.bdEdit = a => boardSheet(BD().items.find(x => x.id === a.dataset.id));
ACT.bdTitle = () => { const b = BD(); openSheet('Título del tablero', `<div class="stack"><input class="in" id="bdT" value="${esc(b.title)}" maxlength="24"><button class="btn pink" id="bdTo" style="justify-content:center">Guardar</button></div>`, sh => { $('#bdTo', sh).onclick = () => { b.title = $('#bdT').value.trim() || b.title; A.saveSettings(); closeSheet(); A.render(); }; }); };
ACT.bdWord = a => { const b = BD(); const i = +a.dataset.i; openSheet('Frase del tablero', `<div class="stack"><input class="in" id="bdW" value="${esc(b.words[i])}" maxlength="28"><button class="btn pink" id="bdWo" style="justify-content:center">Guardar</button></div>`, sh => { $('#bdWo', sh).onclick = () => { b.words[i] = $('#bdW').value.trim() || b.words[i]; A.saveSettings(); closeSheet(); A.render(); }; }); };

// ================= Visitas a los cuartos de tus amigas =================
const V = { cache: {}, inbox: null, loading: false, mine: null };
const online = () => Store.mode === 'supa' && Store.sb && navigator.onLine !== false;
function myName() { return (S.settings.name || (Store.profile && Store.profile.name) || 'Amiga').split(' ')[0]; }
function roomBody() { const r = A.roomState(); const p = A.petState(); return { room: { wall: r.wall, floor: r.floor, items: r.items }, pets: p.room, active: p.active || null }; }
async function publishRoom() {
  if (!online()) return null;
  if (!S.settings.visitCode) { S.settings.visitCode = 'BOLSI-' + String(Math.floor(1000 + Math.random() * 9000)); A.saveSettings(); }
  for (let i = 0; i < 4; i++) {
    const { data, error } = await Store.sb.from('rooms').upsert({ user_id: Store.uid, code: S.settings.visitCode, name: myName(), body: roomBody(), updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select('hearts').single();
    if (!error) { V.mine = data; return data; }
    if (String(error.code) === '23505') { S.settings.visitCode = 'BOLSI-' + String(Math.floor(1000 + Math.random() * 9000)); A.saveSettings(); continue; }
    console.warn(error); return null;
  }
}
async function fetchRoom(code) { const { data, error } = await Store.sb.from('rooms').select('user_id, code, name, body, hearts, updated_at').eq('code', code.toUpperCase()).maybeSingle(); if (error) throw error; return data; }
async function loadInbox() { const { data } = await Store.sb.from('room_notes').select('from_name, kind, text, created_at, to_user, from_user').or(`to_user.eq.${Store.uid},from_user.eq.${Store.uid}`).order('created_at', { ascending: false }).limit(40); V.inbox = data || []; }
const ago = s => { const d = Math.floor((Date.now() - new Date(s)) / 864e5); return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : 'hace ' + d + ' días'; };
function refreshVisits() {
  if (V.loading || !online()) return; V.loading = true;
  Promise.all([publishRoom(), loadInbox(), ...(S.settings.friends || []).map(f => fetchRoom(f.code).then(r => { if (r) { V.cache[f.code] = r; f.name = r.name; } }).catch(() => {}))])
    .catch(e => console.warn(e)).finally(() => { V.loading = false; V.done = true; if (S.route === 'visitas') A.render(); });
}
A.screens.visitas = () => {
  if (!online()) return `${sub('visitas')}<div class="card empty">${img('casita', 48)}<p>Las visitas necesitan internet y tu cuenta de Bolsillito. Cuando tengas conexión, aquí verás los cuartos de tus amigas.</p></div>`;
  if (!V.done) refreshVisits();
  const friends = S.settings.friends || []; const cur = S.visitCode && V.cache[S.visitCode];
  const notesMine = (V.inbox || []).filter(n => n.to_user === Store.uid);
  if (cur) {
    const b = cur.body || {}; const sent = (V.inbox || []).filter(n => n.from_user === Store.uid && n.to_user === cur.user_id && n.kind === 'note').slice(0, 2);
    return `<div class="ph"><div class="ph-left"><button class="navarrow" data-act="vsBack" aria-label="Volver">‹</button><span class="pill">Cuarto de ${esc(cur.name)}</span></div><span class="pill sm">${img('heart', 16)} ${cur.hearts || 0}</span></div>
${A.roomHTML(Object.assign({ wall: 'rosa', floor: 'madera', items: [] }, b.room || {}), { pets: b.pets || [], id: 'friendRoom' })}
<div class="grid2"><button class="btn pink" data-act="vsHeart" style="justify-content:center">${img('heart', 18)} Dejar un corazón</button><button class="btn" data-act="vsNote" style="justify-content:center">${img('ui_nota', 18)} Dejar notita</button></div>
${sent.map(n => `<div class="card row" style="gap:10px">${img('ui_nota', 26)}<span>“${esc(n.text)}” <span class="faint">— tú, ${ago(n.created_at)}</span></span></div>`).join('')}
<p class="faint" style="margin:0">Solo se ve su cuarto: nunca sus cuentas ni sus gastos.</p>`;
  }
  return `${sub('visitas', 'rincon', V.mine ? `<span class="pill sm">${img('heart', 16)} ${V.mine.hearts || 0}</span>` : '')}
<div class="card stack"><b>Tu código para que te agreguen</b><div class="row between"><span class="vs-code">${esc(S.settings.visitCode || '…')}</span><button class="btn sm" data-act="vsCopy">Copiar</button></div><span class="faint">Solo se ve tu cuarto: nunca tus cuentas ni tus gastos.</span></div>
<div class="k-lbl">TUS AMIGAS</div>
<div class="list">${friends.map(f => { const r = V.cache[f.code]; return `<div class="li"><span class="ic" style="width:44px;height:44px">${r && r.body && r.body.active && A.petInfo ? `<img class="pixel" alt="" src="${spr(A.petInfo(r.body.active).sprite, 3)}" style="width:40px">` : img('casita', 30)}</span><span class="tx-main"><b>${esc(f.name || f.code)}</b><span>${r ? 'Cambió su cuarto ' + ago(r.updated_at) : V.loading ? 'Cargando…' : 'No encontramos este código'}</span></span><button class="btn sm pink" data-act="vsGo" data-c="${esc(f.code)}" ${r ? '' : 'disabled'}>Visitar</button></div>`; }).join('') || '<div class="card empty">Agrega a tus amigas con su código para visitar sus cuartos.</div>'}</div>
<div class="row" style="gap:8px"><input class="in" id="vsAdd" placeholder="Código de tu amiga (BOLSI-1234)" style="text-transform:uppercase"><button class="btn pink" data-act="vsAdd">Agregar</button></div>
${notesMine.length ? `<div class="k-lbl">LO QUE TE DEJARON</div><div class="list">${notesMine.slice(0, 12).map(n => `<div class="li"><span class="ic">${img(n.kind === 'heart' ? 'heart' : 'ui_nota', 26)}</span><span class="tx-main"><b>${esc(n.from_name || 'Una amiga')}</b><span>${n.kind === 'heart' ? 'Le encantó tu cuarto' : '“' + esc(n.text) + '”'} · ${ago(n.created_at)}</span></span></div>`).join('')}</div>` : ''}`;
};
ACT.vsCopy = () => { const c = S.settings.visitCode; if (!c) return; (navigator.clipboard ? navigator.clipboard.writeText(c) : Promise.reject()).then(() => toast('Código copiado')).catch(() => toast(c)); };
ACT.vsAdd = async () => {
  const v = ($('#vsAdd').value || '').trim().toUpperCase().replace(/\s/g, ''); const code = /^\d{4}$/.test(v) ? 'BOLSI-' + v : v;
  if (!/^BOLSI-\d{4}$/.test(code)) return toast('El código es así: BOLSI-1234');
  if (code === S.settings.visitCode) return toast('Ese es tu propio código');
  const fr = S.settings.friends = S.settings.friends || []; if (fr.some(f => f.code === code)) return toast('Ya la tienes en tu lista');
  try { const r = await fetchRoom(code); if (!r) return toast('No encontramos ese código'); V.cache[code] = r; fr.push({ code, name: r.name }); A.saveSettings(); toast(`¡${r.name} está en tu lista!`); A.render(); } catch (e) { toast('No se pudo buscar. Revisa tu conexión.'); }
};
ACT.vsGo = a => { S.visitCode = a.dataset.c; A.render(); window.scrollTo(0, 0); };
ACT.vsBack = () => { S.visitCode = null; A.render(); };
ACT.vsHeart = async () => {
  const cur = V.cache[S.visitCode]; if (!cur) return;
  try { const { data, error } = await Store.sb.rpc('give_heart', { p_code: cur.code, p_name: myName() }); if (error) throw error; if (data === -1) toast('Ya le dejaste un corazón hoy'); else { cur.hearts = data; toast('¡Corazón enviado!'); } A.pixelHearts && A.pixelHearts(); A.render(); } catch (e) { toast('No se pudo enviar. Revisa tu conexión.'); }
};
ACT.vsNote = () => {
  const cur = V.cache[S.visitCode]; if (!cur) return;
  openSheet('Notita para ' + cur.name, `<div class="stack"><textarea class="in" id="vsT" maxlength="140" placeholder="Ej. ¡Amo tu ventana! Me la voy a comprar"></textarea><button class="btn pink" id="vsTo" style="justify-content:center">Dejar notita</button></div>`, sh => {
    $('#vsTo', sh).onclick = async () => { const t = $('#vsT').value.trim(); if (!t) return; try { const { error } = await Store.sb.from('room_notes').insert({ to_user: cur.user_id, from_user: Store.uid, from_name: myName(), kind: 'note', text: t }); if (error) throw error; closeSheet(); toast('Notita enviada'); await loadInbox(); A.render(); } catch (e) { toast('No se pudo enviar. Revisa tu conexión.'); } };
  });
};
// cuando cambias tu cuarto, se actualiza lo que ven tus amigas
let pubT = null; const saveSet = A.saveSettings;
A.saveSettings = (...x) => { const r = saveSet(...x); if (S.settings.visitCode && online()) { clearTimeout(pubT); pubT = setTimeout(() => publishRoom().catch(() => {}), 4000); } return r; };

// ---------------- Arranque ----------------
const st0 = A.start;
A.start = async () => { await st0(); birthdayGift(); };
})();
