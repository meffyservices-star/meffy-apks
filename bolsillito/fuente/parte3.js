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
A.payGame = n => payGame(n);
function payGame(n) { const g = GM(); const ok = Math.max(0, Math.min(n, GAME_CAP - g.stars)); g.stars += ok; if (ok) A.giveStars(ok); return ok; }
A.screens.juegos = () => {
  const g = GM();
  return `${sub('juegos', 'rincon', starsPill())}
<button class="card gm-card sky" data-act="gmPlay" data-g="saltar"><div class="gm-art"><img class="pixel" alt="" src="${spr('plataforma_nube', 3)}" style="width:66px;position:absolute;left:4px;top:56px"><img class="pixel" alt="" src="${spr('plataforma', 3)}" style="width:66px;position:absolute;right:2px;top:20px"><img class="pixel gm-bounce" alt="" src="${spr(petSprite(), 4)}" style="width:54px;position:absolute;left:32px;top:6px"></div><div style="flex:1"><b class="mid" style="font-family:var(--f-display)">Saltar hasta las nubes</b><div class="faint">Atrapa estrellitas mientras subes. Cuidado: unas plataformas se rompen y las nubes se esfuman.</div><div class="tag gold" style="margin-top:6px">Tu récord · ${g.best.saltar || 0} m</div></div></button>
<button class="card gm-card coins" data-act="gmPlay" data-g="monedas"><div class="gm-art">${['moneda', 'ticket', 'moneda'].map((f, i) => `<img class="pixel gm-fall" alt="" src="${spr(f, 3)}" style="width:28px;position:absolute;left:${10 + i * 26}px;top:${4 + (i % 2) * 18}px;animation-delay:-${i * .5}s">`).join('')}<img class="pixel" alt="" src="${spr('alcancia', 4)}" style="width:56px;position:absolute;left:24px;bottom:2px"></div><div style="flex:1"><b class="mid" style="font-family:var(--f-display)">Ahorra monedas, no antojos</b><div class="faint">Atrapa las monedas con tu cochinito y esquiva los antojos que te hacen gastar.</div><div class="tag gold" style="margin-top:6px">Tu récord · ${g.best.monedas || 0} monedas</div></div></button>
<div class="card row" style="gap:10px">${img('estrellita', 28)}<div style="flex:1"><b>Hoy llevas ${g.stars} de ${GAME_CAP} estrellitas de juegos</b><div class="faint">Cada partida también le da +10 puntos a ${esc(A.petInfo ? A.petInfo(activePet()).name : 'tu mascota')} para crecer.</div></div></div>`;
};
ACT.gmPlay = a => a.dataset.g === 'saltar' ? jumpGame() : catchGame('monedas');

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
  function platAt(y) { const hgt = (H - y + cam) / 10; const r = Math.random(); const t = hgt > 40 && r < Math.min(.28, .08 + hgt / 1200) ? 'rota' : hgt > 25 && r > 1 - Math.min(.25, .06 + hgt / 1500) ? 'nube' : 'p'; return { x: rnd(4, W - PW - 4), y, t, gone: false, vy: 0, spring: t === 'p' && Math.random() < .07, dx: hgt > 60 && t === 'p' && Math.random() < .2 ? rnd(-1, 1) : 0 }; }
  function reset() {
    me = { x: W / 2 - PET / 2, y: H - 140, vy: -11, vx: 0, face: 1 }; plats = []; coins = []; cam = 0; coinsGot = 0; maxH = 0;
    plats.push({ x: W / 2 - PW / 2, y: H - 80, t: 'p', gone: false, vy: 0, dx: 0 });
    let y = H - 80; while (y > -H) { y -= rnd(46, 70); plats.push(platAt(y)); if (Math.random() < .35) coins.push({ x: rnd(10, W - 30), y: y - rnd(30, 60), got: false }); }
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
    let top = Math.min(...plats.map(p => p.y)); while (top > -60) { top -= rnd(maxH < 50 ? 46 : 54, (maxH < 50 ? 70 : 84) + Math.min(36, maxH / 15)); plats.push(platAt(top - cam * 0)); if (Math.random() < .35) coins.push({ x: rnd(10, W - 30), y: top - rnd(30, 60), got: false }); }
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
async function catchGame(mode) {
  const coins = mode === 'monedas'; const sh = gameShell('catch' + (coins ? ' coins' : '')); let { w: W, h: H } = sh.fit();
  const ANTOJOS = ['ticket', 'labial', 'helado', 'bolsa', 'unas', 'palomitas', 'cart'];
  const foods = coins ? ['moneda', 'moneda', 'moneda', 'estrellita'] : Object.keys(A.FOODS).filter(k => !A.FOODS[k].off);
  const map = { pet: spr(coins ? 'alcancia' : petSprite(), 4), gota: spr('gota', 3), heart: spr('heart', 3), heartE: spr('heartS', 3) }; foods.forEach(k => map[k] = spr(coins ? k : (A.FOODS[k].sprite || k), 3)); ANTOJOS.forEach(k => map[k] = spr(k, 3));
  const I = await loadImgs(map);
  const PET = 64; let px, items, caught, lives, time, run = true, paused = true, last = 0, spawn = 0, raf, tilt = 0, keyDir = 0, target = null, pop = [];
  function reset() { px = W / 2 - PET / 2; items = []; caught = {}; lives = 3; time = 45; }
  const total = () => Object.values(caught).reduce((s, n) => s + n, 0);
  const saved = () => (caught.moneda || 0) * .5 + (caught.estrellita || 0);
  function step(dt) {
    time -= dt / 60; if (time <= 0) return over();
    const sp = 1 + (45 - time) / 30;
    spawn -= dt; if (spawn <= 0) { spawn = Math.max(14, 42 - (45 - time)) ; const bad = Math.random() < .22 + (45 - time) / 200; items.push({ k: bad ? (coins ? ANTOJOS[Math.floor(Math.random() * ANTOJOS.length)] : 'gota') : foods[Math.floor(Math.random() * foods.length)], bad, x: 10 + Math.random() * (W - 50), y: -40, v: (2 + Math.random() * 1.6) * sp, r: Math.random() * 6 }); }
    const dir = keyDir || tilt; if (dir) px += dir * 7 * dt; if (target != null) px += (target - PET / 2 - px) * Math.min(1, .35 * dt);
    px = Math.max(0, Math.min(W - PET, px));
    const py = H - PET - 24;
    items.forEach(it => { it.y += it.v * dt; it.r += .05 * dt;
      if (!it.done && it.y + 30 > py + 8 && it.y < py + PET * .6 && it.x + 30 > px + 6 && it.x < px + PET - 6) {
        it.done = true;
        if (it.bad) { lives--; pop.push({ x: px + PET / 2, y: py, t: 30, txt: '-1', bad: true }); if (navigator.vibrate) navigator.vibrate(60); if (lives <= 0) return over(); }
        else { caught[it.k] = (caught[it.k] || 0) + 1; pop.push({ x: px + PET / 2, y: py, t: 30, txt: coins ? (it.k === 'estrellita' ? '+$1' : '+$0,50') : '+1' }); }
      } });
    items = items.filter(it => !it.done && it.y < H + 40); pop.forEach(p => p.t -= dt); pop = pop.filter(p => p.t > 0);
  }
  function draw() {
    const g = sh.g; const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, coins ? '#e8f8e4' : '#fff0de'); grd.addColorStop(1, coins ? '#cdeec3' : '#ffd5b8'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
    for (let y = H - 24; y < H; y += 8) for (let x = 0; x < W; x += 8) { g.fillStyle = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 ? '#ffc4d4' : '#fff6ea'; g.fillRect(x, y, 8, 8); }
    items.forEach(it => { g.save(); g.translate(it.x + 16, it.y + 16); g.rotate(Math.sin(it.r) * .25); g.drawImage(I[it.k], -16, -16, 32, 32); g.restore(); });
    const py = H - PET - 24; g.drawImage(I.pet, px, py, PET, PET);
    pop.forEach(p => { g.globalAlpha = p.t / 30; g.font = '800 18px Nunito, sans-serif'; g.textAlign = 'center'; g.fillStyle = p.bad ? '#3d78b5' : '#c44a72'; g.fillText(p.txt, p.x, p.y - (30 - p.t)); g.globalAlpha = 1; });
    $('#gmA', sh.ov).textContent = '0:' + String(Math.max(0, Math.ceil(time))).padStart(2, '0');
    $('#gmB', sh.ov).innerHTML = `${img(coins ? 'moneda' : 'cupcake', 16)} ${coins ? '$' + saved().toFixed(2).replace('.', ',') : total()} · ${[0, 1, 2].map(i => `<img class="pixel" alt="" src="${i < lives ? map.heart : map.heartE}" style="width:14px;${i < lives ? '' : 'opacity:.35'}">`).join('')}`;
  }
  function loop(t) { if (!run) return; const dt = Math.min(2.2, last ? (t - last) / 16.67 : 1); last = t; if (!paused) step(dt); if (run) draw(); raf = requestAnimationFrame(loop); }
  function over() {
    run = false; cancelAnimationFrame(raf);
    if (coins) { const n = total(); const gm = GM(); const rec = n > (gm.best.monedas || 0); if (rec) gm.best.monedas = n; const earned = payGame(Math.floor(n / 4)); A.petAddXp && A.petAddXp(10, 'game'); A.saveSettings();
      endCard(sh, lives <= 0 ? '¡Te ganaron los antojos!' : rec ? '¡NUEVO RÉCORD!' : '¡Se acabó el tiempo!', `<div class="gm-big">$${saved().toFixed(2).replace('.', ',')}</div><div class="faint">ahorrados en tu cochinito (de mentiritas)</div><div class="row" style="justify-content:center;gap:6px;font-weight:800">${ST(18)} +${earned} estrellitas</div><div class="faint">Cada antojo que esquivas es plata que se queda contigo.</div>`, () => catchGame('monedas')); return; }
    const pst = A.petState(); Object.entries(caught).forEach(([k, n]) => pst.pantry[k] = (pst.pantry[k] || 0) + n);
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
  m.innerHTML = coins ? `<div class="gm-end"><div class="gm-k">AHORRA MONEDAS, NO ANTOJOS</div><div class="gm-legend"><span>${img('moneda', 30)}Atrápalas</span><span>${img('estrellita', 30)}Vale más</span><span>${img('bolsa', 30)}Esquiva los antojos</span></div><div class="faint">Desliza el dedo o inclina el celular para mover tu cochinito. Tienes 45 segundos y 3 vidas.</div><button class="btn pink" data-x="go" style="justify-content:center;margin-top:10px;width:100%">¡Empezar!</button></div>` : `<div class="gm-end"><div class="gm-k">ATRAPAR COMIDITA</div><div class="gm-legend"><span>${img('fresa', 30)}Atrápala</span><span>${img('dona', 30)}A la despensa</span><span>${img('gota', 30)}Esquívala</span></div><div class="faint">Desliza el dedo o inclina el celular para mover a tu mascota. Tienes 45 segundos y 3 vidas.</div><button class="btn pink" data-x="go" style="justify-content:center;margin-top:10px;width:100%">¡Empezar!</button></div>`;
  m.onclick = e => { if (e.target.closest('[data-x]')) { m.hidden = true; paused = false; } };
  raf = requestAnimationFrame(loop);
}

// ================= Ropa de temporada (en la Tiendita) =================
function lookArt(pet, accId, sc) {
  const an = A.ANCH[pet], a = A.ACC[accId]; const base = `<img class="pixel mz-base" alt="" src="${spr(an ? an.sprite : pet, sc)}">`;
  if (!an || !a) return `<span class="mz">${base}</span>`;
  let left = an.hx - a.w / 2, top = a.slot === 'head' ? an.hy - a.h + 2 + (a.lift || 0) : a.slot === 'face' ? an.fy - a.h / 2 : an.ny - 1; left += a.dx || 0; top += a.dy || 0;
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
  const SE_THEME = { halloween: ['#5b4791', '#a27fd6', '#f6b07a', 'Noche de brujas'], navidad: ['#c8475f', '#e98a8f', '#5fa77a'], valentin: ['#e0577f', '#f7a6c0', '#ffd6e2'] };
  const PALS = [['#e0577f', '#f7a6c0', '#ffd6e2'], ['#5fa7d6', '#a9d3f2', '#e1f1fc'], ['#6cb38a', '#a6dcbc', '#e3f5ea'], ['#e6a23c', '#f5c97c', '#fff1d4'], ['#8a6fd1', '#bfaef0', '#efe9ff'], ['#e07b5f', '#f4b29d', '#ffe6dc']];
  const theme = se => { if (SE_THEME[se.id]) return SE_THEME[se.id]; let h = 0; String(se.id).split('').forEach(c => h = (h * 31 + c.charCodeAt(0)) >>> 0); return PALS[h % PALS.length]; };
  const hero = cur.map(se => { const [c1, c2, c3] = theme(se); const days = A.seasonDaysLeft(se); return `<div class="se-hero" style="--se1:${c1};--se2:${c2};--se3:${c3}">
<div class="se-top"><div class="se-topline"><span class="se-k">${img('estrellita', 14)} Edición limitada</span><span class="se-days">${days === 1 ? 'Último día' : 'Quedan ' + days + ' días'}</span></div><div class="se-name">${esc(se.name)}</div><div class="se-when">${esc(se.when || '')}</div>
<div class="se-looks">${se.look ? lookArt(se.pet, se.look, 5) : img('gift', 64)}${se.id === 'halloween' ? lookArt('shey', 'bruja', 5) : ''}</div></div>
<div class="se-body"><div class="se-sub">Solo por esta temporada</div><div class="se-items">${se.items.map(seasonItem).join('')}</div></div></div>`; }).join('');
  const extra = `${hero}<details class="card se-next"><summary><b>Lo que viene</b></summary>${next.map(se => `<div class="row" style="gap:10px;padding:6px 0">${se.look ? `<span style="width:48px;flex:none">${lookArt(se.pet, se.look, 3)}</span>` : `<span style="width:48px;flex:none">${img('gift', 34)}</span>`}<div style="flex:1"><b>${esc(se.name)}</b><div class="faint">${se.items.filter(k => k.startsWith('acc:')).map(k => esc((A.ACC[k.slice(4)] || {}).name || '')).join(' y ')} · ${esc(se.when)}</div></div>${img('candado', 22)}</div>`).join('')}
<div class="row" style="gap:10px;padding:6px 0"><span style="width:48px;flex:none">${lookArt(activePet(), 'fiesta', 3)}</span><div style="flex:1"><b>Tu cumpleaños</b><div class="faint">Gorrito de fiesta gratis para todas tus mascotas</div></div><input class="in" type="date" id="bdayIn" value="${bd ? new Date().getFullYear() + '-' + bd : ''}" style="max-width:150px" aria-label="Tu cumpleaños"></div></details>`;
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
  return `${sub('jardin', 'journal', `<span class="pill sm">${doneN} de ${hs.length} hoy</span>`)}
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
// pegatinas especiales: solo se consiguen cuando una amiga te las regala
(function () {
  const D = (n, fn) => Pix.define(n, { w: 16, h: 16, fn });
  D('pg_carta', p => { p.r(1, 4, 14, 10, 'w'); p.line(1, 4, 8, 9, 'C'); p.line(14, 4, 8, 9, 'C'); p.e(8, 10, 2.4, 2, 'P'); p.px(7, 9, 'p'); });
  D('pg_abrazo', p => { p.e(5.5, 9, 4.6, 4.2, 'm'); p.e(10.5, 9, 4.6, 4.2, 'h'); p.px(4, 8, 'k'); p.px(6, 8, 'k'); p.px(10, 8, 'k'); p.px(12, 8, 'k'); p.px(3, 10, 'P'); p.px(13, 10, 'P'); p.e(8, 4, 2.4, 2, 'P'); p.px(7, 3, 'p'); });
  D('pg_arcoiris', p => { [['R', 7], ['a', 6], ['y', 5], ['G', 4], ['B', 3]].forEach(([c, r]) => p.e(8, 12, r, r, c, (i, j) => j < 12)); p.e(8, 12, 2, 2, null); p.e(3, 12, 2.4, 1.6, 'w'); p.e(13, 12, 2.4, 1.6, 'w'); });
  D('pg_brillo', p => { p.e(8, 8, 6, 5.4, 'P'); p.e(5.5, 6, 3.4, 3.2, 'P'); p.e(10.5, 6, 3.4, 3.2, 'P'); p.e(8, 10, 4.6, 4, 'P', (i, j) => j > 6); p.px(5, 5, 'w'); p.px(6, 4, 'w'); p.map(11, 1, ['.y.', 'yYy', '.y.']); p.px(2, 12, 'y'); });
  D('pg_luna', p => { p.e(7, 8, 5.5, 5.5, 'y'); p.e(9.5, 6.5, 4.6, 4.6, null); p.px(4, 9, 'Y'); p.map(10, 9, ['.y.', 'yyy', '.y.']); p.px(13, 3, 'y'); });
  D('pg_trebol', p => { p.e(5.5, 6, 3, 3, 'G'); p.e(10.5, 6, 3, 3, 'G'); p.e(8, 10, 3, 3, 'G'); p.r(8, 11, 1, 4, 'D'); p.px(5, 5, 'g'); p.px(10, 5, 'g'); });
  D('pg_cupcake', p => { p.e(8, 7, 5, 3.4, 'p'); p.r(4, 9, 8, 5, 'L'); p.r(6, 9, 1, 5, 'B'); p.r(9, 9, 1, 5, 'B'); p.map(7, 1, ['.y.', 'yYy', '.y.']); p.px(5, 6, 'w'); });
  D('pg_te_quiero', p => { p.e(6, 6, 3.4, 3.2, 'R'); p.e(10, 6, 3.4, 3.2, 'R'); p.e(8, 9, 5, 4, 'R', (i, j) => j > 6); p.r(3, 12, 10, 3, 'w'); p.r(4, 13, 8, 1, 'P'); p.px(5, 5, 'w'); });
})();
const PEGATINAS = { pg_carta: 'Cartita', pg_abrazo: 'Abrazo de mascotas', pg_arcoiris: 'Arcoíris', pg_brillo: 'Corazón brillante', pg_luna: 'Luna y estrella', pg_trebol: 'Trébol de la suerte', pg_cupcake: 'Cupcake de amigas', pg_te_quiero: 'Te quiero' };
A.PEGATINAS = PEGATINAS;
const PAPELES = { rosa: ['#fff0f5', '#f7a8c0'], menta: ['#effaf3', '#9fd6b5'], lila: ['#f5f0ff', '#c4b2ec'], crema: ['#fffaf0', '#e8c99a'], cielo: ['#eef7ff', '#a9d3ef'] };
const SELLOS = ['heart', 'star', 'flower', 'pudin', 'gochi', 'estrellita'];
const V = { cache: {}, inbox: null, events: null, gifts: null, signs: {}, loading: false, mine: null };
const online = () => Store.mode === 'supa' && Store.sb && navigator.onLine !== false;
function myName() { return (S.settings.name || (Store.profile && Store.profile.name) || 'Amiga').split(' ')[0]; }
function roomBody() {
  const r = A.roomState(); const p = A.petState(); const lv = Math.max(1, ...p.owned.map(k => A.petLevel(k).L));
  const st = A.rcStats ? A.rcStats() : {}; const logros = (A.RC.ACH || []).filter(a => { try { return a.ok(st); } catch (e) { return false; } }).length;
  const c = p.active ? A.petCare(p.active) : null;
  const garden = ((S.settings.garden || {}).habits || []).slice(0, 6).map(h => ({ name: h.name.slice(0, 20), plant: habitInfo(h).plant }));
  const photos = ((S.settings.board || {}).items || []).map(x => x.img).filter(x => x && /^https?:/.test(x)).slice(0, 6);
  const eqAll = (S.settings.rincon || {}).equip || {}; const equip = {}; p.room.concat(p.active ? [p.active] : []).forEach(k => { if (eqAll[k]) equip[k] = eqAll[k]; });
  return { rooms: r.rooms, cur: r.cur, pets: p.room, equip, active: p.active || null, owned: p.owned, lv, logros, garden, photos, care: c ? { h: Math.round(c.h), f: Math.round(c.f), l: Math.round(c.l), sleep: !!c.sleep } : null };
}
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
async function loadInbox() {
  const me = Store.uid;
  const [n, e, g] = await Promise.all([
    Store.sb.from('room_notes').select('from_name, kind, text, created_at, to_user, from_user').or(`to_user.eq.${me},from_user.eq.${me}`).order('created_at', { ascending: false }).limit(40),
    Store.sb.from('visit_events').select('id, from_name, kind, text, style, created_at, to_user, from_user, day').or(`to_user.eq.${me},from_user.eq.${me}`).order('created_at', { ascending: false }).limit(80),
    Store.sb.from('gifts').select('id, from_name, from_user, to_user, kind, item, qty, payload, msg, opened, created_at, day').or(`to_user.eq.${me},from_user.eq.${me}`).order('created_at', { ascending: false }).limit(60)
  ]);
  V.inbox = n.data || []; V.events = e.data || []; V.gifts = g.data || [];
  applyHelp();
}
async function loadSigns(uid) { const { data } = await Store.sb.from('visit_events').select('from_name, text, style, created_at').eq('to_user', uid).eq('kind', 'sign').order('created_at', { ascending: false }).limit(30); V.signs[uid] = data || []; }
// lo que tus amigas hicieron por ti mientras no estabas
function applyHelp() {
  const seen = S.settings.helpSeen || ''; const mine = (V.events || []).filter(e => e.to_user === Store.uid && ['feed', 'water', 'play'].includes(e.kind) && e.created_at > seen);
  if (!mine.length) return; const pst = A.petState(); const msgs = [];
  mine.forEach(e => {
    if (e.kind === 'feed' && pst.active) { const c = A.petCare(pst.active); c.h = Math.min(100, c.h + 20); c.f = Math.min(100, c.f + 5); msgs.push(`${e.from_name} le dio de comer a ${A.petInfo(pst.active).name}`); }
    if (e.kind === 'play' && pst.active) { const c = A.petCare(pst.active); c.f = Math.min(100, c.f + 10); msgs.push(`${e.from_name} vino a jugar con ${A.petInfo(pst.active).name}`); }
    if (e.kind === 'water') { A.giveStars(1); msgs.push(`${e.from_name} regó tu jardín (+1 estrellita)`); }
  });
  S.settings.helpSeen = mine[0].created_at; A.saveSettings();
  setTimeout(() => toast(msgs.slice(0, 2).join(' · ') + (msgs.length > 2 ? ` y ${msgs.length - 2} cosas más` : '')), 600);
}
const ago = s => { const d = Math.floor((Date.now() - new Date(s)) / 864e5); return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : 'hace ' + d + ' días'; };
function refreshVisits(force) {
  if (V.loading || !online()) return; if (V.done && !force) return; V.loading = true;
  Promise.all([publishRoom(), loadInbox(), ...(S.settings.friends || []).map(f => fetchRoom(f.code).then(r => { if (r) { V.cache[f.code] = r; f.name = r.name; } }).catch(() => {}))])
    .catch(e => console.warn(e)).finally(() => { V.loading = false; V.done = true; if (S.route === 'visitas') A.render(); });
}
A.refreshVisits = refreshVisits;
const did = (cur, kind) => (V.events || []).some(e => e.from_user === Store.uid && e.to_user === cur.user_id && e.kind === kind && e.day === today());
const giftsToday = () => (V.gifts || []).filter(g => g.from_user === Store.uid && g.day === today());
function friendRoomView(cur) {
  const b = cur.body || {}; const rooms = b.rooms || (b.room ? { cuarto: b.room } : { cuarto: {} }); const rk = rooms[S.visitRoom] ? S.visitRoom : (b.cur && rooms[b.cur] ? b.cur : Object.keys(rooms)[0]);
  const mine = activePet(); const guestPets = (b.pets || []).slice(0, mine ? 2 : 3).map(k => ({ k, eq: (b.equip || {})[k] }));
  const care = b.care; const pname = b.active && A.petInfo ? A.petInfo(b.active).name : 'su mascota';
  const sentLetters = (V.events || []).filter(n => n.from_user === Store.uid && n.to_user === cur.user_id && n.kind === 'letter').slice(0, 2);
  const signs = V.signs[cur.user_id]; if (!signs) loadSigns(cur.user_id).then(() => { if (S.route === 'visitas') A.render(); });
  const need = care && !care.sleep && (care.h < 50 || care.f < 50);
  return `<div class="ph"><div class="ph-left"><button class="navarrow" data-act="vsBack" aria-label="Volver">‹</button><span class="pill">Cuarto de ${esc(cur.name)}</span></div><span class="pill sm">${img('heart', 16)} ${cur.hearts || 0}</span></div>
${Object.keys(rooms).length > 1 ? `<div class="chips">${Object.keys(rooms).map(k => `<button class="chip" data-act="vsRoom" data-k="${k}" aria-pressed="${k === rk}">${esc({ cuarto: 'Su cuarto', cocina: 'Cocina', juegos: 'Cuarto de juegos', jardin: 'Jardín' }[k] || k)}</button>`).join('')}</div>` : ''}
${A.roomHTML(rooms[rk], { pets: guestPets, id: 'friendRoom', photos: b.photos || [], guest: mine })}
<p class="faint" style="margin:-4px 0 0;text-align:center">${mine ? esc(A.petInfo(mine).name) + ' vino contigo de visita' : ''}</p>
${care ? `<div class="card row vs-pet" style="gap:10px"><img class="pixel" alt="" src="${spr(A.petInfo(b.active).sprite, 3)}" style="width:44px"><div style="flex:1"><b>${esc(pname)}</b><div class="faint">${care.sleep ? 'Está durmiendo' : care.h < 40 ? 'Tiene hambre' : care.f < 40 ? 'Está un poco triste' : 'Está feliz'}</div></div><button class="btn sm ${need ? 'pink' : ''}" data-act="vsFeed" ${did(cur, 'feed') || care.sleep ? 'disabled' : ''}>${img('cupcake', 16)} ${did(cur, 'feed') ? 'Ya le diste' : 'Darle de comer'}</button></div>` : ''}
<div class="vs-acts">
<button class="pc-act" data-act="vsHeart">${img('heart', 26)}Corazón</button>
<button class="pc-act" data-act="vsLetter">${img('pg_carta', 26)}Carta</button>
<button class="pc-act" data-act="vsGift">${img('gift', 26)}Su cajita</button>
<button class="pc-act" data-act="vsPlay" ${did(cur, 'play') || !mine ? 'disabled' : ''}>${img('paw', 26)}${did(cur, 'play') ? 'Ya jugaron' : 'Jugar juntas'}</button>
</div>
${b.garden && b.garden.length ? `<div class="card stack"><div class="row between"><b>Su jardín</b><button class="btn sm" data-act="vsWater" ${did(cur, 'water') ? 'disabled' : ''}>${img('regadera', 16)} ${did(cur, 'water') ? 'Ya regaste hoy' : 'Regar'}</button></div><div class="vs-garden">${b.garden.map(g => `<span>${img(g.plant, 34)}<em>${esc(g.name)}</em></span>`).join('')}</div></div>` : ''}
<div class="card stack"><b>Su vitrina</b><div class="row" style="gap:14px;flex-wrap:wrap"><span class="vs-stat">${img('brotecito', 22)} Nivel ${b.lv || 1}</span><span class="vs-stat">${img('trofeo', 22)} ${b.logros || 0} logros</span><span class="vs-stat">${img('paw', 22)} ${(b.owned || []).length} mascotas</span></div><div class="vs-coll">${(b.owned || []).map(k => A.petInfo ? `<img class="pixel" alt="${esc(A.petInfo(k).name)}" src="${spr(A.petInfo(k).sprite, 3)}">` : '').join('')}</div></div>
<div class="card stack"><div class="row between"><b>Libro de visitas</b><button class="btn sm" data-act="vsSign" ${did(cur, 'sign') ? 'disabled' : ''}>${did(cur, 'sign') ? 'Ya firmaste hoy' : 'Firmar'}</button></div>
${signs ? (signs.length ? `<div class="vs-book">${signs.slice(0, 12).map(sg => `<div class="vs-sign" style="--rot:${(sg.created_at.charCodeAt(18) % 7) - 3}deg"><img class="pixel" alt="" src="${spr(sg.style && sg.style.st || 'heart', 3)}"><b>${esc(sg.from_name)}</b><span>${esc(sg.text || '')}</span><em>${ago(sg.created_at)}</em></div>`).join('')}</div>` : '<span class="faint">Nadie ha firmado todavía. ¡Sé la primera!</span>') : '<span class="faint">Cargando…</span>'}</div>
${sentLetters.map(n => `<div class="card row" style="gap:10px">${img('pg_carta', 26)}<span>Le mandaste una carta <span class="faint">${ago(n.created_at)}</span></span></div>`).join('')}
<p class="faint" style="margin:0">Solo se ve su cuarto: nunca sus cuentas ni sus gastos.</p>`;
}
A.screens.visitas = () => {
  const house = (cls, x, w) => `<span class="vl-house ${cls}" style="left:${x}%;width:${w}px"><img class="pixel" alt="" src="${spr('casita', 6)}"></span>`;
  const hero = (t, sub2) => `<div class="vs-hero village"><span class="vl-sun"></span><span class="vl-cloud a"></span><span class="vl-cloud b"></span><span class="vl-hill a"></span><span class="vl-hill b"></span>
${house('h1', 4, 70)}${house('h2', 27, 84)}${house('h3', 53, 72)}${house('h4', 76, 78)}
<span class="vl-fence"></span><span class="vl-path"></span>
<img class="pixel vl-tree a" alt="" src="${spr(Pix.has('x_cerezo') ? 'x_cerezo' : 'flower', 3)}"><img class="pixel vl-tree b" alt="" src="${spr(Pix.has('x_cerezo') ? 'x_cerezo' : 'flower', 3)}">
${Pix.has('x_farol') ? `<img class="pixel vl-lamp" alt="" src="${spr('x_farol', 3)}">` : ''}${Pix.has('x_flores') ? `<img class="pixel vl-fl a" alt="" src="${spr('x_flores', 3)}"><img class="pixel vl-fl b" alt="" src="${spr('x_flores', 3)}">` : ''}
<img class="pixel vs-pet" alt="" src="${spr(petSprite(), 4)}"><div class="vs-hero-t"><b>${t}</b><span>${sub2}</span></div></div>`;
  if (!online()) return `${sub('visitas')}${hero('Tu barrio', 'Visita los cuartos de tus amigas')}<div class="card empty"><p>Las visitas necesitan internet y tu cuenta de Bolsillito. Cuando tengas conexión, aquí verás los cuartos de tus amigas.</p></div>`;
  refreshVisits();
  const friends = S.settings.friends || []; const cur = S.visitCode && V.cache[S.visitCode];
  if (cur) return friendRoomView(cur);
  const toMe = (V.inbox || []).filter(n => n.to_user === Store.uid);
  const ev = (V.events || []).filter(e => e.to_user === Store.uid);
  const letters = ev.filter(e => e.kind === 'letter'); const helps = ev.filter(e => ['feed', 'water', 'play'].includes(e.kind)).slice(0, 6);
  const box = (V.gifts || []).filter(g => g.to_user === Store.uid && !g.opened);
  const unreadL = letters.filter(l => !(S.settings.lettersRead || []).includes(l.id)).length;
  return `${sub('visitas', 'rincon', V.mine ? `<span class="pill sm">${img('heart', 16)} ${V.mine.hearts || 0}</span>` : '')}
${hero('Tu barrio', friends.length ? (friends.length === 1 ? '1 amiga en tu lista' : friends.length + ' amigas en tu lista') : 'Agrega a tus amigas con su código')}
<div class="grid2"><button class="card vs-box" data-act="vsOpenBox">${img(box.length ? 'regalo_cerrado' : 'regalo_abierto', 52)}<b>Tu cajita</b><span class="faint">${box.length ? box.length + (box.length === 1 ? ' regalo sin abrir' : ' regalos sin abrir') : 'Vacía por ahora'}</span>${box.length ? '<span class="pc-dot"></span>' : ''}</button>
<button class="card vs-box" data-act="vsLetters">${img('pg_carta', 52)}<b>Tus cartas</b><span class="faint">${letters.length ? (unreadL ? unreadL + ' sin leer' : letters.length + ' guardadas') : 'Todavía no hay'}</span>${unreadL ? '<span class="pc-dot"></span>' : ''}</button></div>
<div class="card stack"><b>Tu código para que te agreguen</b><div class="row between"><span class="vs-code">${esc(S.settings.visitCode || '…')}</span><button class="btn sm" data-act="vsCopy">Copiar</button></div><span class="faint">Solo se ve tu cuarto: nunca tus cuentas ni tus gastos.</span></div>
<div class="k-lbl">TUS AMIGAS</div>
<div class="list vs-list">${friends.map(f => { const r = V.cache[f.code]; return `<div class="li"><span class="ic" style="width:44px;height:44px">${r && r.body && r.body.active && A.petInfo ? `<img class="pixel" alt="" src="${spr(A.petInfo(r.body.active).sprite, 3)}" style="width:40px">` : img('casita', 30)}</span><span class="tx-main"><b>${esc(f.name || f.code)}</b><span>${r ? 'Cambió su cuarto ' + ago(r.updated_at) : V.loading ? 'Cargando…' : 'No encontramos este código'}</span></span><button class="btn sm pink" data-act="vsGo" data-c="${esc(f.code)}" ${r ? '' : 'disabled'}>Visitar</button></div>`; }).join('') || '<div class="card empty">Agrega a tus amigas con su código para visitar sus cuartos.</div>'}</div>
<div class="row" style="gap:8px"><input class="in" id="vsAdd" placeholder="Código de tu amiga (BOLSI-1234)" style="text-transform:uppercase"><button class="btn pink" data-act="vsAdd">Agregar</button></div>
${helps.length ? `<div class="k-lbl">LO QUE HICIERON POR TI</div><div class="list">${helps.map(e => `<div class="li"><span class="ic">${img({ feed: 'cupcake', water: 'regadera', play: 'paw' }[e.kind], 26)}</span><span class="tx-main"><b>${esc(e.from_name)}</b><span>${{ feed: 'Le dio de comer a tu mascota', water: 'Regó tu jardín', play: 'Vino a jugar con tu mascota' }[e.kind]} · ${ago(e.created_at)}</span></span></div>`).join('')}</div>` : ''}
${toMe.length ? `<div class="k-lbl">CORAZONES Y NOTITAS</div><div class="list">${toMe.slice(0, 10).map(n => `<div class="li"><span class="ic">${img(n.kind === 'heart' ? 'heart' : 'ui_nota', 26)}</span><span class="tx-main"><b>${esc(n.from_name || 'Una amiga')}</b><span>${n.kind === 'heart' ? 'Le encantó tu cuarto' : '“' + esc(n.text) + '”'} · ${ago(n.created_at)}</span></span></div>`).join('')}</div>` : ''}
<button class="btn" data-act="vsMyBook" style="justify-content:center">${img('book', 18)} Ver mi libro de visitas</button>`;
};
ACT.vsCopy = () => { const c = S.settings.visitCode; if (!c) return; (navigator.clipboard ? navigator.clipboard.writeText(c) : Promise.reject()).then(() => toast('Código copiado')).catch(() => toast(c)); };
ACT.vsAdd = async () => {
  const v = ($('#vsAdd').value || '').trim().toUpperCase().replace(/\s/g, ''); const code = /^\d{4}$/.test(v) ? 'BOLSI-' + v : v;
  if (!/^BOLSI-\d{4}$/.test(code)) return toast('El código es así: BOLSI-1234');
  if (code === S.settings.visitCode) return toast('Ese es tu propio código');
  const fr = S.settings.friends = S.settings.friends || []; if (fr.some(f => f.code === code)) return toast('Ya la tienes en tu lista');
  try { const r = await fetchRoom(code); if (!r) return toast('No encontramos ese código'); V.cache[code] = r; fr.push({ code, name: r.name }); A.saveSettings(); toast(`¡${r.name} está en tu lista!`); A.render(); } catch (e) { toast('No se pudo buscar. Revisa tu conexión.'); }
};
ACT.vsGo = a => { S.visitCode = a.dataset.c; S.visitRoom = null; A.render(); window.scrollTo(0, 0); };
ACT.vsBack = () => { S.visitCode = null; A.render(); };
ACT.vsRoom = a => { S.visitRoom = a.dataset.k; A.render(); };
const cur = () => V.cache[S.visitCode];
async function addEvent(kind, text, style) {
  const c = cur(); if (!c) return false;
  const { error } = await Store.sb.from('visit_events').insert({ to_user: c.user_id, from_user: Store.uid, from_name: myName(), kind, text: text || '', style: style || {} });
  if (error) { if (String(error.code) === '23505') { toast('Eso ya lo hiciste hoy'); return false; } toast('No se pudo. Revisa tu conexión.'); return false; }
  await loadInbox(); return true;
}
ACT.vsHeart = async () => {
  const c = cur(); if (!c) return;
  try { const { data, error } = await Store.sb.rpc('give_heart', { p_code: c.code, p_name: myName() }); if (error) throw error; if (data === -1) toast('Ya le dejaste un corazón hoy'); else { c.hearts = data; toast('¡Corazón enviado!'); } A.pixelHearts && A.pixelHearts(); A.render(); } catch (e) { toast('No se pudo enviar. Revisa tu conexión.'); }
};
ACT.vsPlay = async () => {
  if (!(await addEvent('play'))) return; const pst = A.petState(); if (pst.active) { const c = A.petCare(pst.active); c.f = Math.min(100, c.f + 15); A.petAddXp && A.petAddXp(5, 'care'); A.saveSettings(); }
  const box = $('#friendRoom'); if (box) { for (let i = 0; i < 8; i++) { const h = document.createElement('img'); h.className = 'pixel rc-heart'; h.src = spr(['heart', 'heartS', 'sparkle', 'heartY'][i % 4], 3); h.alt = ''; h.style.cssText = `left:${20 + Math.random() * 60}%;bottom:${20 + Math.random() * 30}%;width:24px;animation-delay:${i * .12}s;z-index:600`; box.appendChild(h); setTimeout(() => h.remove(), 2200); } }
  toast('¡Jugaron juntas! Las dos mascotas quedaron felices'); setTimeout(() => A.render(), 1800);
};
ACT.vsFeed = () => {
  const pst = A.petState(); const foods = Object.entries(pst.pantry || {}).filter(([k, n]) => n > 0 && A.FOODS[k]);
  if (!foods.length) return toast('Tu despensa está vacía. Atrapa comidita en los juegos.');
  openSheet('¿Qué le das?', `<div class="fr-shop">${foods.map(([k, n]) => `<button class="shop-tile" data-ff="${k}"><img class="pixel" alt="" src="${spr(A.FOODS[k].sprite || k, 3)}" style="width:40px"><span>${esc(A.FOODS[k].name)}</span><em>tienes ${n}</em></button>`).join('')}</div><p class="faint" style="margin:8px 0 0">Sale de tu despensa.</p>`, sh => sh.addEventListener('click', async e => {
    const b = e.target.closest('[data-ff]'); if (!b) return; const k = b.dataset.ff; closeSheet();
    if (!(await addEvent('feed', A.FOODS[k].name))) return; pst.pantry[k]--; A.saveSettings(); toast('¡Le diste de comer! Tu amiga lo verá al entrar.'); A.render();
  }));
};
ACT.vsWater = async () => { if (await addEvent('water')) { toast('¡Regaste su jardín!'); A.render(); } };
ACT.vsSign = () => {
  let st = 'heart';
  openSheet('Firmar su libro de visitas', `<div class="stack"><div class="f">Elige tu sello<div class="chips">${['heart', 'star', 'flower', 'pudin', 'gochi', 'estrellita', 'sparkle', 'moon'].map(i => `<button class="chip" data-st="${i}" aria-pressed="${i === st}">${img(i, 22)}</button>`).join('')}</div></div><input class="in" id="sgT" maxlength="60" placeholder="Unas palabritas (opcional)"><button class="btn pink" id="sgOk" style="justify-content:center">Firmar</button></div>`, sh => {
    sh.addEventListener('click', e => { const b = e.target.closest('[data-st]'); if (b) { st = b.dataset.st; $$('[data-st]', sh).forEach(x => x.setAttribute('aria-pressed', x === b)); } });
    $('#sgOk', sh).onclick = async () => { const t = $('#sgT').value.trim(); closeSheet(); if (await addEvent('sign', t, { st })) { const c = cur(); if (c) await loadSigns(c.user_id); toast('¡Firmaste su libro!'); A.render(); } };
  });
};
ACT.vsLetter = () => {
  const c = cur(); if (!c) return; let pap = 'rosa', sello = 'heart';
  const draw = () => openSheet('Carta para ' + c.name, `<div class="stack"><div class="carta" style="--pa:${PAPELES[pap][0]};--pb:${PAPELES[pap][1]}"><textarea class="carta-t" id="ltT" maxlength="500" placeholder="Querida ${esc(c.name)}…">${esc(V.draftL || '')}</textarea><span class="carta-firma">Con cariño, ${esc(myName())}</span><img class="pixel carta-sello" alt="" src="${spr(sello, 4)}"></div>
<div class="f">Papel<div class="chips">${Object.entries(PAPELES).map(([k, [a, b2]]) => `<button class="chip" data-pap="${k}" aria-pressed="${k === pap}" style="background:${a};border-color:${b2}">${k}</button>`).join('')}</div></div>
<div class="f">Sello<div class="chips">${SELLOS.map(i => `<button class="chip" data-sello="${i}" aria-pressed="${i === sello}">${img(i, 22)}</button>`).join('')}</div></div>
<button class="btn pink" id="ltOk" style="justify-content:center;padding:12px">Mandar carta</button></div>`, sh => {
    sh.addEventListener('input', e => { if (e.target.id === 'ltT') V.draftL = e.target.value; });
    sh.addEventListener('click', e => { const p1 = e.target.closest('[data-pap]'), s1 = e.target.closest('[data-sello]'); if (p1) { pap = p1.dataset.pap; draw(); } if (s1) { sello = s1.dataset.sello; draw(); } });
    $('#ltOk', sh).onclick = async () => { const t = ($('#ltT').value || '').trim(); if (!t) return toast('Escribe algo bonito'); closeSheet(); if (await addEvent('letter', t, { pap, sello })) { V.draftL = ''; toast('¡Carta enviada!'); A.render(); } };
  });
  draw();
};
ACT.vsLetters = () => {
  const letters = (V.events || []).filter(e => e.to_user === Store.uid && e.kind === 'letter');
  if (!letters.length) return toast('Todavía no te llegan cartas');
  const read = new Set(S.settings.lettersRead || []);
  openSheet('Tus cartas', `<div class="vs-letters">${letters.map(l => `<button class="sobre ${read.has(l.id) ? 'leida' : ''}" data-lt="${l.id}" style="--pb:${(PAPELES[(l.style || {}).pap] || PAPELES.rosa)[1]}"><img class="pixel" alt="" src="${spr((l.style || {}).sello || 'heart', 3)}"><b>${esc(l.from_name)}</b><em>${ago(l.created_at)}</em></button>`).join('')}</div>`, sh => sh.addEventListener('click', e => {
    const b = e.target.closest('[data-lt]'); if (!b) return; const l = letters.find(x => String(x.id) === b.dataset.lt); if (!l) return;
    S.settings.lettersRead = [...new Set([...(S.settings.lettersRead || []), l.id])].slice(-200); A.saveSettings();
    const pp = PAPELES[(l.style || {}).pap] || PAPELES.rosa;
    openSheet('Carta de ' + l.from_name, `<div class="carta abre" style="--pa:${pp[0]};--pb:${pp[1]}"><div class="carta-txt">${esc(l.text)}</div><span class="carta-firma">Con cariño, ${esc(l.from_name)}</span><img class="pixel carta-sello" alt="" src="${spr((l.style || {}).sello || 'heart', 4)}"></div><p class="faint" style="text-align:center;margin:8px 0 0">${ago(l.created_at)}</p>`);
  }));
};
ACT.vsMyBook = async () => { if (!online()) return; await loadSigns(Store.uid); const sg = V.signs[Store.uid] || []; openSheet('Tu libro de visitas', sg.length ? `<div class="vs-book">${sg.map(s2 => `<div class="vs-sign" style="--rot:${(s2.created_at.charCodeAt(18) % 7) - 3}deg"><img class="pixel" alt="" src="${spr(s2.style && s2.style.st || 'heart', 3)}"><b>${esc(s2.from_name)}</b><span>${esc(s2.text || '')}</span><em>${ago(s2.created_at)}</em></div>`).join('')}</div>` : '<p class="faint">Todavía nadie firmó tu libro. Comparte tu código con tus amigas.</p>'); };
// ---- la cajita: mandar regalos ----
const STAR_DAY = 10, STICK_DAY = 3;
function accOwned() { const r = S.settings.rincon || {}; return (r.owned || []).filter(k => k.startsWith('acc:')).map(k => k.slice(4)).filter(k => A.ACC[k] && !A.ACC[k].plus); }
ACT.vsGift = () => {
  const c = cur(); if (!c) return; const tab = V.gTab || 'food'; const pst = A.petState();
  const sentStars = giftsToday().filter(g => g.kind === 'stars').reduce((s2, g) => s2 + g.qty, 0); const sentSt = giftsToday().filter(g => g.kind === 'sticker').length;
  const tabs = [['food', 'Comida'], ['furn', 'Muebles'], ['acc', 'Ropa'], ['stars', 'Estrellitas'], ['sticker', 'Pegatinas'], ['tpl', 'Plantillas']];
  let body = '';
  if (tab === 'food') { const L2 = Object.entries(pst.pantry || {}).filter(([k, n]) => n > 0 && A.FOODS[k]); body = L2.length ? `<div class="fr-shop">${L2.map(([k, n]) => `<button class="shop-tile" data-gf="food:${k}"><img class="pixel" alt="" src="${spr(A.FOODS[k].sprite || k, 3)}" style="width:40px"><span>${esc(A.FOODS[k].name)}</span><em>tienes ${n}</em></button>`).join('')}</div>` : '<p class="faint">Tu despensa está vacía.</p>'; }
  if (tab === 'furn') { const L2 = Object.keys(A.FURN).filter(k => A.furnFree(k) > 0); body = L2.length ? `<div class="fr-shop">${L2.map(k => `<button class="shop-tile" data-gf="furn:${k}"><img class="pixel" alt="" src="${Pix.sprite(A.furnSprite(k), 2)}" style="max-width:56px;max-height:48px"><span>${esc(A.FURN[k].name)}</span><em>sin usar: ${A.furnFree(k)}</em></button>`).join('')}</div>` : '<p class="faint">Solo puedes regalar muebles que no estén puestos en tus cuartos. Guárdalos con "Mover cosas" y luego "Guardar".</p>'; }
  if (tab === 'acc') { const L2 = accOwned(); body = L2.length ? `<div class="fr-shop">${L2.map(k => `<button class="shop-tile" data-gf="acc:${k}"><img class="pixel" alt="" src="${spr('acc_' + k, 4)}" style="max-width:56px"><span>${esc(A.ACC[k].name)}</span><em>se va de tu Tiendita</em></button>`).join('')}</div>` : '<p class="faint">No tienes ropa para regalar.</p>'; }
  if (tab === 'stars') body = `<p class="faint" style="margin:0">Puedes regalar hasta ${STAR_DAY} estrellitas al día. Hoy te quedan ${Math.max(0, STAR_DAY - sentStars)}.</p><div class="chips">${[1, 3, 5, 10].map(n => `<button class="chip" data-gf="stars:${n}" ${n > STAR_DAY - sentStars || n > bal() ? 'disabled' : ''}>${ST(14)} ${n}</button>`).join('')}</div>`;
  if (tab === 'sticker') body = `<p class="faint" style="margin:0">Pegatinas especiales para su journal: solo se consiguen cuando una amiga te las regala. Hoy puedes mandar ${Math.max(0, STICK_DAY - sentSt)}.</p><div class="fr-shop">${Object.entries(PEGATINAS).map(([k, n]) => `<button class="shop-tile" data-gf="sticker:${k}" ${sentSt >= STICK_DAY ? 'disabled' : ''}><img class="pixel" alt="" src="${spr(k, 3)}" style="width:40px"><span>${esc(n)}</span></button>`).join('')}</div>`;
  if (tab === 'tpl') { const L2 = S.settings.jrTpls || []; body = L2.length ? `<div class="list">${L2.map(t => `<button class="li" data-gf="tpl:${t.id}"><span class="ic">${img('ui_plantilla', 26)}</span><span class="tx-main"><b>${esc(t.name)}</b><span>Le llega una copia para su journal</span></span></button>`).join('')}</div>` : '<p class="faint">Guarda una página como plantilla en tu journal (botón Plantillas) para poder mandarla.</p>'; }
  openSheet('Para la cajita de ' + c.name, `<div class="stack"><div class="chips">${tabs.map(([k, n]) => `<button class="chip" data-gt="${k}" aria-pressed="${k === tab}">${n}</button>`).join('')}</div>${body}<input class="in" id="gMsg" maxlength="140" placeholder="Mensajito (opcional)" value="${esc(V.gMsg || '')}"></div>`, sh => {
    sh.addEventListener('input', e => { if (e.target.id === 'gMsg') V.gMsg = e.target.value; });
    sh.addEventListener('click', async e => {
      const t = e.target.closest('[data-gt]'); if (t) { V.gTab = t.dataset.gt; ACT.vsGift(); return; }
      const g = e.target.closest('[data-gf]'); if (!g || g.disabled) return; const [kind, item] = g.dataset.gf.split(':');
      if (!g.dataset.sure) { g.dataset.sure = 1; const sp = g.querySelector('em') || g; sp.textContent = 'Toca otra vez para mandarlo'; return; }
      const row = { to_user: c.user_id, from_user: Store.uid, from_name: myName(), kind, item, qty: 1, msg: (V.gMsg || '').trim(), payload: {} };
      if (kind === 'stars') { row.qty = +item; row.item = 'estrellitas'; if (!A.spendStars(row.qty)) return; }
      if (kind === 'food') { if (!((pst.pantry || {})[item] > 0)) return; pst.pantry[item]--; }
      if (kind === 'furn') { if (!A.furnTake(item)) return toast('Ese mueble está puesto en tu cuarto'); }
      if (kind === 'acc') { const r = S.settings.rincon; r.owned = r.owned.filter(x => x !== 'acc:' + item); Object.values(r.equip || {}).forEach(eq => { Object.keys(eq).forEach(sl => { if (eq[sl] === item) eq[sl] = null; }); }); }
      if (kind === 'tpl') { const tp = (S.settings.jrTpls || []).find(x => x.id === item); if (!tp) return; row.payload = { name: tp.name, page: tp.page }; row.item = tp.name.slice(0, 60); }
      const { error } = await Store.sb.from('gifts').insert(row);
      if (error) { toast('No se pudo mandar. Revisa tu conexión.'); if (kind === 'stars') A.giveStars(row.qty); if (kind === 'food') pst.pantry[item]++; if (kind === 'furn') A.giveFurn(item); if (kind === 'acc') S.settings.rincon.owned.push('acc:' + item); return; }
      A.saveSettings(); V.gMsg = ''; closeSheet(); toast(`¡Lo dejaste en la cajita de ${c.name}!`); await loadInbox(); A.render();
    });
  });
};
// ---- abrir tu cajita ----
function giftLabel(g) { return g.kind === 'food' ? (A.FOODS[g.item] || {}).name || g.item : g.kind === 'furn' ? (A.FURN[g.item] || {}).name || g.item : g.kind === 'acc' ? (A.ACC[g.item] || {}).name || g.item : g.kind === 'stars' ? g.qty + ' estrellitas' : g.kind === 'sticker' ? 'Pegatina ' + (PEGATINAS[g.item] || '') : 'Plantilla ' + g.item; }
function giftSrc(g) { return g.kind === 'food' ? spr((A.FOODS[g.item] || {}).sprite || g.item, 5) : g.kind === 'furn' ? Pix.sprite(A.FURN[g.item] ? A.furnSprite(g.item) : 'gift', 3) : g.kind === 'acc' ? spr('acc_' + g.item, 6) : g.kind === 'stars' ? spr('estrellita', 5) : g.kind === 'sticker' ? spr(g.item, 5) : spr('ui_plantilla', 5); }
ACT.vsOpenBox = () => {
  const box = (V.gifts || []).filter(g => g.to_user === Store.uid && !g.opened);
  if (!box.length) return toast('Tu cajita está vacía. Comparte tu código para que te dejen regalitos.');
  const g = box[box.length - 1];
  openSheet('Tu cajita', `<div class="rg-stage" id="gbStage" style="min-height:300px">${''}<div class="rg-halo"></div><div class="rg-title" style="font-size:18px">${esc(g.from_name)} te dejó algo</div><button class="rg-btn" id="gbOpen" aria-label="Abrir"><img class="pixel rg-box shake" alt="" src="${spr('regalo_cerrado', 7)}" style="width:150px"></button><div class="rg-hint">Toca para abrir · quedan ${box.length}</div></div>`, sh => {
    $('#gbOpen', sh).onclick = async () => {
      const bx = $('.rg-box', sh); bx.classList.remove('shake'); bx.classList.add('pop');
      const { error } = await Store.sb.from('gifts').update({ opened: true }).eq('id', g.id);
      if (error) { toast('No se pudo abrir. Revisa tu conexión.'); return; }
      g.opened = true; applyGiftFromFriend(g); A.saveSettings(); A.render(); A.renderNav();
      setTimeout(() => { $('#gbStage', sh).innerHTML = `<div class="rg-halo"></div><div class="rg-burst"></div><div class="rg-prize" style="position:relative;top:0"><img class="pixel" alt="" src="${giftSrc(g)}" style="max-width:110px;max-height:110px"><div class="rg-card"><div class="rg-k">DE ${esc(g.from_name.toUpperCase())}</div><b>${esc(giftLabel(g))}</b>${g.msg ? `<div style="font-size:13px;margin-top:4px">“${esc(g.msg)}”</div>` : ''}</div></div>${box.length > 1 ? '<button class="btn pink" id="gbNext" style="position:relative;margin-top:10px">Abrir el siguiente</button>' : ''}`; const nx = $('#gbNext', sh); if (nx) nx.onclick = () => ACT.vsOpenBox(); }, 600);
    };
  });
};
function applyGiftFromFriend(g) {
  const pst = A.petState();
  if (g.kind === 'food') pst.pantry[g.item] = (pst.pantry[g.item] || 0) + g.qty;
  if (g.kind === 'furn' && A.FURN[g.item]) A.giveFurn(g.item, g.qty);
  if (g.kind === 'acc') { const r = S.settings.rincon = S.settings.rincon || { owned: [] }; r.owned = r.owned || []; if (!r.owned.includes('acc:' + g.item)) r.owned.push('acc:' + g.item); }
  if (g.kind === 'stars') A.giveStars(g.qty);
  if (g.kind === 'sticker') { const L2 = S.settings.giftStickers = S.settings.giftStickers || []; if (!L2.includes(g.item)) L2.push(g.item); }
  if (g.kind === 'tpl' && g.payload && g.payload.page) { const L2 = S.settings.jrTpls = S.settings.jrTpls || []; if (L2.length < 20) L2.push({ id: uid(), name: (g.payload.name || 'Plantilla') + ' (de ' + g.from_name + ')', page: g.payload.page }); }
}
A.navDotVisits = () => (V.gifts || []).some(g => g.to_user === Store.uid && !g.opened);
// cuando cambias tu cuarto, se actualiza lo que ven tus amigas
let pubT = null; const saveSet = A.saveSettings;
A.saveSettings = (...x) => { const r = saveSet(...x); if (S.settings.visitCode && online()) { clearTimeout(pubT); pubT = setTimeout(() => publishRoom().catch(() => {}), 4000); } return r; };
// ================= Journal: páginas compartidas con amigas =================
A.PAGES.compartidas = 'Páginas con amigas'; pageIcon('compartidas', 'heart');
const SH = { rows: {}, base: {}, local: {}, timers: {}, chans: {}, list: null, loading: false };
const jk = id => 'sh-' + id, idOf = key => key.slice(3);
const clone = o => JSON.parse(JSON.stringify(o));
const sameJ = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function m3(base, loc, rem, keyFn) {
  const B = new Map((base || []).map(x => [keyFn(x), x])), L = new Map((loc || []).map(x => [keyFn(x), x])), R = new Map((rem || []).map(x => [keyFn(x), x]));
  const out = []; const seen = new Set();
  [...(loc || []), ...(rem || [])].forEach(x => { const k = keyFn(x); if (seen.has(k)) return; seen.add(k); const b = B.get(k), l = L.get(k), r = R.get(k);
    if (l && r) out.push(!sameJ(l, b) ? l : r); else if (l) { if (!b) out.push(l); } else if (r) { if (!b) out.push(r); } });
  return out;
}
function mergeDoc(base, loc, rem) {
  base = base || { pages: [] }; const bp = new Map((base.pages || []).map(p => [p.id, p])), rp = new Map((rem.pages || []).map(p => [p.id, p]));
  const pages = m3(base.pages, loc.pages, rem.pages, p => p.id).map(p => {
    const lp = (loc.pages || []).find(x => x.id === p.id), r = rp.get(p.id), b = bp.get(p.id); if (!lp || !r) return p;
    const out = Object.assign({}, r); ['bg', 'grid', 'gridColor', 'gs', 'tpl'].forEach(k => { if (!b || lp[k] !== b[k]) out[k] = lp[k]; });
    out.els = m3(b && b.els, lp.els, r.els, e => e.id); out.strokes = m3(b && b.strokes, lp.strokes, r.strokes, st => JSON.stringify(st).slice(0, 200) + JSON.stringify(st).length);
    return out;
  });
  return { pages };
}
async function pushShared(key) {
  const id = idOf(key); const loc = SH.local[key]; if (!loc || !online()) return;
  try {
    const { data: row } = await Store.sb.from('shared_pages').select('body, updated_at').eq('id', id).maybeSingle();
    const merged = row && row.body && row.body.pages ? mergeDoc(SH.base[id], loc, row.body) : loc;
    const { error } = await Store.sb.from('shared_pages').update({ body: merged, updated_by: Store.uid, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    SH.base[id] = clone(merged); if (SH.rows[id]) SH.rows[id].body = clone(merged); delete SH.local[key];
    if (!sameJ(merged, loc) && window.Journal) Journal.reload();
  } catch (e) { console.warn(e); toast('No se pudo guardar la página compartida. Se reintenta solita.'); SH.timers[key] = setTimeout(() => pushShared(key), 5000); }
}
window.Shared = {
  doc: key => { const r = SH.rows[idOf(key)]; return SH.local[key] || (r && r.body && r.body.pages ? r.body : null); },
  title: key => { const r = SH.rows[idOf(key)]; if (!r) return 'Página compartida'; const others = Object.entries(r.names || {}).filter(([u]) => u !== Store.uid).map(([, n]) => n); return r.title + (others.length ? ' · con ' + others.join(', ') : ''); },
  save: (key, doc) => { SH.local[key] = clone(doc); clearTimeout(SH.timers[key]); SH.timers[key] = setTimeout(() => pushShared(key), 1200); },
  flush: key => { if (SH.timers[key] && SH.local[key]) { clearTimeout(SH.timers[key]); pushShared(key); } }
};
function listen(id) {
  if (SH.chans[id] || !Store.sb.channel) return;
  SH.chans[id] = Store.sb.channel('sp-' + id).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'shared_pages', filter: 'id=eq.' + id }, pl => {
    const row = pl.new; if (!row || row.updated_by === Store.uid) return; const key = jk(id);
    if (SH.local[key]) { SH.local[key] = mergeDoc(SH.base[id], SH.local[key], row.body); }
    SH.rows[id] = Object.assign(SH.rows[id] || {}, row); SH.base[id] = clone(row.body);
    if (window.Journal && Journal.key === key) Journal.reload();
  }).subscribe();
}
async function loadShared() {
  if (!online() || SH.loading) return; SH.loading = true;
  try { const { data } = await Store.sb.from('shared_pages').select('id, owner, members, names, title, body, updated_by, updated_at').order('updated_at', { ascending: false }).limit(30); SH.list = data || []; SH.list.forEach(r => { SH.rows[r.id] = r; if (!SH.base[r.id]) SH.base[r.id] = clone(r.body); }); }
  catch (e) { SH.list = SH.list || []; } finally { SH.loading = false; if (S.route === 'compartidas') A.render(); }
}
A.screens.compartidas = () => {
  if (!online()) return `${sub('compartidas', 'journal')}<div class="card empty">${img('heart', 40)}<p>Las páginas con amigas necesitan internet y tu cuenta.</p></div>`;
  if (!SH.list) loadShared();
  const hidden = S.settings.shHidden || [];
  const L2 = (SH.list || []).filter(r => !hidden.includes(r.id));
  return `${sub('compartidas', 'journal', '<button class="btn sm pink" data-act="shNew">Nueva +</button>')}
<div class="card row" style="gap:12px">${img('pg_abrazo', 44)}<div style="flex:1"><b>Decoren una página juntas</b><div class="faint">Las dos pueden escribir, dibujar y pegar stickers en la misma página. Los cambios de tu amiga te aparecen solitos.</div></div></div>
${SH.list ? (L2.length ? `<div class="list">${L2.map(r => { const others = Object.entries(r.names || {}).filter(([u]) => u !== Store.uid).map(([, n]) => n); const n = ((r.body || {}).pages || []).reduce((s2, p) => s2 + (p.els || []).length, 0); return `<button class="li" data-act="shOpen" data-id="${r.id}"><span class="ic">${img('ui_paginas', 28)}</span><span class="tx-main"><b>${esc(r.title)}</b><span>Con ${esc(others.join(', ') || 'nadie todavía')} · ${n} cositas · ${ago(r.updated_at)}</span></span><span class="faint">›</span></button>`; }).join('')}</div>` : '<div class="card empty">Todavía no tienes páginas con amigas. Crea una y elige con quién decorarla.</div>') : '<div class="card empty">Cargando…</div>'}
${(SH.list || []).some(r => hidden.includes(r.id)) ? '<button class="btn sm" data-act="shShowAll">Mostrar las ocultas</button>' : ''}`;
};
ACT.shOpen = async a => { const id = a.dataset.id; listen(id); Journal.openKey(jk(id)); };
ACT.shShowAll = () => { S.settings.shHidden = []; A.saveSettings(); A.render(); };
ACT.shNew = async () => {
  const fr = (S.settings.friends || []); await Promise.all(fr.filter(f => !V.cache[f.code]).map(f => fetchRoom(f.code).then(r => { if (r) V.cache[f.code] = r; }).catch(() => {})));
  const ok = fr.filter(f => V.cache[f.code]);
  if (!ok.length) return toast('Primero agrega a una amiga en Visitas con su código');
  const pick = new Set();
  openSheet('Nueva página con amigas', `<div class="stack"><label class="f">Nombre de la página<input class="in" id="shT" maxlength="40" placeholder="Ej. Nuestro viaje a la playa"></label>
<div class="f">¿Con quién? (hasta 5)<div class="list">${ok.map(f => `<label class="li" style="cursor:pointer"><input type="checkbox" data-fu="${V.cache[f.code].user_id}" data-fn="${esc(V.cache[f.code].name)}"> <span class="tx-main"><b>${esc(V.cache[f.code].name)}</b><span>${esc(f.code)}</span></span></label>`).join('')}</div></div>
<button class="btn pink" id="shOk" style="justify-content:center">Crear y empezar a decorar</button></div>`, sh => {
    sh.addEventListener('change', e => { const u = e.target.dataset.fu; if (!u) return; e.target.checked ? pick.add(u) : pick.delete(u); if (pick.size > 5) { e.target.checked = false; pick.delete(u); toast('Hasta 5 amigas'); } });
    $('#shOk', sh).onclick = async () => {
      if (!pick.size) return toast('Elige al menos una amiga');
      const names = { [Store.uid]: myName() }; $$('[data-fu]', sh).forEach(c => { if (c.checked) names[c.dataset.fu] = c.dataset.fn; });
      const body = { pages: [{ id: uid(), tpl: 'libre', bg: '#fffaf3', grid: 'puntos', gridColor: '#f2c6d6', gs: 16, els: [], strokes: [], days: {} }] };
      const { data, error } = await Store.sb.from('shared_pages').insert({ owner: Store.uid, members: [Store.uid, ...pick], names, title: ($('#shT').value || '').trim() || 'Página compartida', body, updated_by: Store.uid }).select('id, owner, members, names, title, body, updated_by, updated_at').single();
      if (error) return toast('No se pudo crear. Revisa tu conexión.');
      SH.rows[data.id] = data; SH.base[data.id] = clone(data.body); SH.list = [data].concat(SH.list || []); closeSheet(); listen(data.id); Journal.openKey(jk(data.id));
    };
  });
};
// mandar una plantilla a una amiga desde el journal (también se puede desde su cajita)
A.sendTplTo = async (code, tpl) => {
  const r = V.cache[code] || await fetchRoom(code).catch(() => null); if (!r) return toast('No encontramos a tu amiga');
  const { error } = await Store.sb.from('gifts').insert({ to_user: r.user_id, from_user: Store.uid, from_name: myName(), kind: 'tpl', item: tpl.name.slice(0, 60), qty: 1, payload: { name: tpl.name, page: tpl.page } });
  toast(error ? 'No se pudo mandar' : `¡Plantilla enviada a ${r.name}!`);
};
// ================= Recordatorio para anotar =================
const VAPID = 'BJZS49m-TRZOYs2Ansy5qpS72ybEIoIuvTQYbO28jCCe8McNclVj2j6KI2Jkp0qetmzJuC4N8tsDi9zzV7X35n4';
A.PAGES.recordatorio = 'Recordatorio'; pageIcon('recordatorio', 'alerta');
const RM = () => (S.settings.reminder = S.settings.reminder || { on: false, hour: 20 });
const canPush = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent); const standalone = () => window.matchMedia && matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const b64u = s => { const p = '='.repeat((4 - s.length % 4) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map(c => c.charCodeAt(0))); };
const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Guayaquil'; } catch (e) { return 'America/Guayaquil'; } };
const hourTxt = h => (h % 12 || 12) + (h < 12 ? ' de la mañana' : h < 19 ? ' de la tarde' : ' de la noche');
A.screens.recordatorio = () => {
  const r = RM(); const perm = canPush() ? Notification.permission : 'no';
  return `${sub('recordatorio', 'more')}
<div class="card row" style="gap:12px">${img(petSprite(), 56)}<div style="flex:1"><b>Te aviso para anotar</b><div class="faint">Todos los días a la hora que elijas, ${esc(A.petInfo ? A.petInfo(activePet()).name : 'tu mascota')} te recuerda anotar tus gastos. Si ese día ya anotaste, no te molesta.</div></div></div>
${!online() ? '<div class="card empty">El recordatorio necesita internet y tu cuenta de Bolsillito.</div>' : !canPush() ? `<div class="card empty">${isIOS() && !standalone() ? 'En iPhone primero agrega Bolsillito a tu pantalla de inicio (botón Compartir → "Agregar a inicio") y ábrela desde ahí.' : 'Este navegador no permite notificaciones. Prueba con Chrome o instalando la app.'}</div>`
  : `<div class="card stack"><div class="setrow"><span><b>Recordatorio diario</b></span><span class="toggle"><input type="checkbox" id="rmOn" ${r.on ? 'checked' : ''}><span></span></span></div>
<label class="f">¿A qué hora?<select class="in" id="rmH">${Array.from({ length: 24 }, (_, h) => `<option value="${h}" ${h === r.hour ? 'selected' : ''}>${hourTxt(h)}</option>`).join('')}</select></label>
${perm === 'denied' ? '<p class="faint" style="margin:0;color:#c44a72">Bloqueaste las notificaciones para Bolsillito. Actívalas en los ajustes de tu navegador o celular.</p>' : ''}
<button class="btn" data-act="rmTest" style="justify-content:center">Mandarme uno de prueba</button></div>`}
${!standalone() && !isIOS() ? `<div class="card stack" style="background:#fff7d6"><b>¿El aviso dice el link de la página?</b><div class="faint">Pasa cuando abres Bolsillito desde el navegador o con un acceso directo. Instálala como app y los avisos dirán solo "Bolsillito", como las demás apps.</div>${A.installEvt ? '<button class="btn pink" data-act="installApp" style="justify-content:center">Instalar Bolsillito</button>' : '<div class="faint">En Chrome toca el menú ⋮ y luego <b>"Instalar app"</b> (no "Agregar a pantalla de inicio"). Si ya tenías un acceso directo, bórralo primero.</div>'}</div>` : ''}
<p class="faint" style="margin:0">Puedes apagarlo cuando quieras. Las notificaciones solo dicen que anotes: nunca muestran tus cifras.</p>`;
};
addEventListener('beforeinstallprompt', e => { e.preventDefault(); A.installEvt = e; if (S.route === 'recordatorio') A.render(); });
addEventListener('appinstalled', () => { A.installEvt = null; toast('¡Listo! Bolsillito ya está instalada como app.'); });
ACT.installApp = async () => { const e = A.installEvt; if (!e) return; e.prompt(); try { await e.userChoice; } catch (er) { } A.installEvt = null; A.render(); };
async function rmSave(on, hour) {
  const r = RM(); r.hour = hour; A.saveSettings();
  if (!on) { r.on = false; A.saveSettings(); if (r.endpoint && online()) await Store.sb.from('push_subs').update({ enabled: false }).eq('endpoint', r.endpoint); toast('Recordatorio apagado'); return; }
  const p = await Notification.requestPermission(); if (p !== 'granted') { toast('Necesito permiso para mandarte notificaciones'); r.on = false; A.saveSettings(); A.render(); return; }
  try {
    const reg = await navigator.serviceWorker.ready; let subn = await reg.pushManager.getSubscription(); if (!subn) subn = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(VAPID) });
    const j = subn.toJSON(); const pet = A.petInfo ? A.petInfo(activePet()).name : '';
    const { error } = await Store.sb.from('push_subs').upsert({ endpoint: j.endpoint, user_id: Store.uid, p256dh: j.keys.p256dh, auth: j.keys.auth, hour, tz: tz(), pet, enabled: true }, { onConflict: 'endpoint' });
    if (error) throw error; r.on = true; r.endpoint = j.endpoint; A.saveSettings(); toast(`¡Listo! Te aviso todos los días a las ${hourTxt(hour)}`);
  } catch (e) { console.warn(e); r.on = false; A.saveSettings(); toast('No se pudo activar el recordatorio en este celular'); }
  A.render();
}
A.after.recordatorio = el => { const on = $('#rmOn', el), h = $('#rmH', el); if (on) on.onchange = () => rmSave(on.checked, +h.value); if (h) h.onchange = () => { if (RM().on) rmSave(true, +h.value); else { RM().hour = +h.value; A.saveSettings(); } }; };
ACT.rmTest = async () => { if (Notification.permission !== 'granted' && (await Notification.requestPermission()) !== 'granted') return toast('Necesito permiso para mandarte notificaciones'); const reg = await navigator.serviceWorker.ready; reg.showNotification('Bolsillito', { badge: '/badge.png', body: `¿Anotamos lo de hoy? ${A.petInfo ? A.petInfo(activePet()).name : 'Tu mascota'} te está esperando.`, icon: '/icon-192.png', tag: 'bolsillito-prueba' }); };
// avisa al servidor que hoy ya anotaste (así no te manda el recordatorio)
const render2 = A.render;
A.render = (...x) => { const r = S.settings.reminder; const d = today(); if (r && r.on && r.endpoint && r.logged !== d && online() && S.tx.some(t => t.date === d && !t.example && !t.recurring)) { r.logged = d; Store.sb.from('push_subs').update({ last_log: d }).eq('endpoint', r.endpoint).then(() => {}, () => {}); } return render2(...x); };
// ---------------- Sonidos suaves (hechos con el navegador, sin archivos) ----------------
const Sfx = (() => {
  let ctx = null, lastTap = 0;
  addEventListener('pointerdown', () => { lastTap = Date.now(); if (ctx && ctx.state === 'suspended') ctx.resume(); }, { capture: true, passive: true });
  const on = () => S.settings.sound !== false;
  const tone = (f, t0, dur, type, vol, f2) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, ctx.currentTime + t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, ctx.currentTime + t0 + dur);
    g.gain.setValueAtTime(0.0001, ctx.currentTime + t0); g.gain.exponentialRampToValueAtTime(vol || .06, ctx.currentTime + t0 + .015); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t0 + dur);
    o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + t0); o.stop(ctx.currentTime + t0 + dur + .02);
  };
  const SOUNDS = {
    blup: () => tone(420, 0, .14, 'sine', .07, 760),                       // al anotar
    coin: () => { tone(988, 0, .09, 'triangle', .05); tone(1319, .07, .18, 'triangle', .05); },   // estrellitas
    pop: () => tone(520, 0, .08, 'triangle', .05, 340),                     // tocar o darle de comer
    yum: () => { tone(600, 0, .07, 'sine', .05, 700); tone(700, .09, .08, 'sine', .05, 820); },
    gift: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * .07, .16, 'triangle', .045)), // regalo
    save: () => { tone(660, 0, .1, 'sine', .05); tone(880, .08, .16, 'sine', .05); }
  };
  return {
    play(n, force) {
      if (!on() || !SOUNDS[n]) return; if (!force && Date.now() - lastTap > 2500) return; // solo cuando tú hiciste algo
      try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); SOUNDS[n](); } catch (e) { }
    }
  };
})();
window.Sfx = Sfx; A.sfx = n => Sfx.play(n);
// enganchar los sonidos a lo que ya existe
{ const g = A.giveStars; A.giveStars = n => { g(n); if (n > 0) Sfx.play('coin'); }; }
for (const [k, n] of [['pcFeed', 'yum'], ['rgOpen', 'gift'], ['pcPet', 'pop'], ['vsHeart', 'pop'], ['rmStyle', 'pop'], ['rmFurn', 'pop'], ['jrSave', 'save']]) { const f = ACT[k]; if (f) ACT[k] = (...x) => { Sfx.play(n); return f(...x); }; }

// ---------------- Clima real en la ventana del cuarto ----------------
const WXC = c => c == null ? null : c <= 1 ? 'sol' : c <= 3 ? 'nubes' : c <= 48 ? 'niebla' : c <= 67 || (c >= 80 && c <= 82) ? 'lluvia' : c <= 77 || c === 85 || c === 86 ? 'nieve' : c >= 95 ? 'tormenta' : 'nubes';
const WXT = { sol: 'está despejado', nubes: 'está nublado', niebla: 'hay neblina', lluvia: 'está lloviendo', nieve: 'está nevando', tormenta: 'hay tormenta' };
let WX = null; try { WX = JSON.parse(localStorage.getItem('bolsi_wx') || 'null'); } catch (e) { }
A.weather = () => { const w = S.settings.wx; if (!w || !w.on || !WX || Date.now() - WX.t > 3 * 3600e3) return null; return WX; };
async function loadWx(force) {
  const w = S.settings.wx; if (!w || !w.on || w.lat == null || !navigator.onLine) return;
  if (!force && WX && Date.now() - WX.t < 30 * 60e3 && WX.lat === w.lat) return;
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${w.lat}&longitude=${w.lon}&current=temperature_2m,weather_code,is_day&timezone=auto`);
    const j = await r.json(); const c = j.current || {};
    WX = { t: Date.now(), lat: w.lat, kind: WXC(c.weather_code), temp: Math.round(c.temperature_2m), day: !!c.is_day };
    try { localStorage.setItem('bolsi_wx', JSON.stringify(WX)); } catch (e) { }
    if (['rincon', 'cuarto', 'appearance'].includes(S.route)) A.render();
  } catch (e) { }
}
A.loadWx = loadWx;
setInterval(() => loadWx(), 30 * 60e3);
const apScreen = A.screens.appearance;
A.screens.appearance = () => {
  const w = S.settings.wx || {}; const now = A.weather();
  return apScreen() + `<div class="card stack" id="wxCard"><h3 style="margin:0">Sonidos y clima</h3>
<div class="setrow"><span><b>Sonidos suaves</b><br><span class="faint">Un "blup" al anotar, campanita con las estrellitas, ñam al comer.</span></span><span class="toggle"><input type="checkbox" id="sfxOn" ${S.settings.sound !== false ? 'checked' : ''}><span></span></span></div>
<div class="setrow"><span><b>Clima real en el cuarto</b><br><span class="faint">Si llueve donde estás, también llueve en la ventana del cuarto.</span></span><span class="toggle"><input type="checkbox" id="wxOn" ${w.on ? 'checked' : ''}><span></span></span></div>
${w.on ? `<div class="faint">${w.city ? 'Clima de <b>' + esc(w.city) + '</b>' : 'Aún no elegiste tu ciudad.'}${now ? ` · ahora ${WXT[now.kind] || ''}, ${now.temp}°` : ''}</div>
<div class="row" style="gap:6px;flex-wrap:wrap"><input class="in" id="wxCity" placeholder="Escribe tu ciudad (ej. Quito)" style="flex:1 1 160px" value=""><button class="btn sm" data-act="wxCity">Buscar</button><button class="btn sm" data-act="wxGps">Usar mi ubicación</button></div>
<div id="wxRes" class="stack" style="gap:4px"></div>
<p class="faint" style="margin:0;font-size:12px">Solo se guarda tu ciudad (sin la dirección exacta) para preguntar el clima.</p>` : ''}</div>`;
};
const apAfter = A.after.appearance;
A.after.appearance = el => {
  if (apAfter) apAfter(el); const c = $('#wxCard', el); if (!c) return;
  $('#sfxOn', c).onchange = e => { S.settings.sound = e.target.checked; A.saveSettings(); if (e.target.checked) Sfx.play('coin', true); };
  $('#wxOn', c).onchange = e => { S.settings.wx = Object.assign(S.settings.wx || {}, { on: e.target.checked }); A.saveSettings(); loadWx(true); A.render(); };
};
const setPlace = (lat, lon, city) => { S.settings.wx = Object.assign(S.settings.wx || {}, { on: true, lat: Math.round(lat * 10) / 10, lon: Math.round(lon * 10) / 10, city }); A.saveSettings(); WX = null; loadWx(true).then(() => A.render()); toast('Listo: clima de ' + city); };
ACT.wxCity = async () => {
  const q = ($('#wxCity').value || '').trim(); if (!q) return toast('Escribe tu ciudad');
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=es`); const j = await r.json();
    const L = j.results || []; const box = $('#wxRes'); if (!L.length) { box.innerHTML = '<span class="faint">No encontré esa ciudad.</span>'; return; }
    box.innerHTML = L.map((x, i) => `<button class="btn sm" data-wxi="${i}" style="justify-content:flex-start">${esc(x.name)}${x.admin1 ? ', ' + esc(x.admin1) : ''} · ${esc(x.country || '')}</button>`).join('');
    box.onclick = e => { const b = e.target.closest('[data-wxi]'); if (!b) return; const x = L[+b.dataset.wxi]; setPlace(x.latitude, x.longitude, x.name); };
  } catch (e) { toast('No pude buscar. Revisa tu internet.'); }
};
ACT.wxGps = () => {
  if (!navigator.geolocation) return toast('Tu celular no deja usar la ubicación aquí');
  navigator.geolocation.getCurrentPosition(async p => {
    let city = 'tu zona';
    setPlace(p.coords.latitude, p.coords.longitude, city);
  }, () => toast('No me diste permiso de ubicación. Puedes escribir tu ciudad.'), { maximumAge: 3600e3, timeout: 10000 });
};
// ---------------- Tiendita con toldo y letrero ----------------
{ const tScreen = A.screens.tienda; A.screens.tienda = () => { const h = tScreen(); const i = h.indexOf('<div class="ph">'); if (i < 0) return h; let j = h.indexOf('</div>', h.indexOf('</div>', i) + 6) + 6; const pn = A.petInfo ? A.petInfo(A.petActive()).name : 'tu mascota'; return h.slice(0, j) + `<div class="awning" aria-hidden="true"></div><div class="shop-sign">${img('gift', 22)}Tiendita de ${esc(pn)}</div>` + h.slice(j); }; }
// ---------------- Personalizar la app (solo la dueña) ----------------
// Iconos: cambia un dibujito por otro en TODA la app. Nombres: renombra secciones. Secciones: apaga las que no quieras mostrar.
const LOOK = () => (A.CFG && A.CFG.look) || {};
const origSprite = Pix.sprite;
Pix.sprite = (n, sc) => { const m = LOOK().icons; if (m && n) { const [b, v] = String(n).split('~'); const t = m[b]; if (t && t !== b && Pix.has(t)) return origSprite(t + (v ? '~' + v : ''), sc); } return origSprite(n, sc); };
Pix.origSprite = origSprite;
const ORIGP = Object.assign({}, A.PAGES);
function applyLook() {
  const L = LOOK(); Object.keys(ORIGP).forEach(k => { A.PAGES[k] = (L.names && L.names[k]) || ORIGP[k]; });
  let st = document.getElementById('lookOff'); if (!st) { st = document.createElement('style'); st.id = 'lookOff'; document.head.appendChild(st); }
  const off = Store.isOwner ? [] : (L.off || []); st.textContent = off.map(k => `[data-go="${k}"]`).join(',') + (off.length ? '{display:none!important}' : '');
  if (off.includes(S.route)) A.go('home');
}
A.applyLook = applyLook;
async function saveLook(msg) { applyLook(); try { await Store.saveConfig(A.CFG); toast(msg || 'Guardado. Ya lo ven todas.'); } catch (e) { toast('No se pudo guardar. Revisa tu conexión.'); } A.renderNav(); A.render(); }
const look = () => { A.CFG.look = A.CFG.look || {}; const L = A.CFG.look; L.icons = L.icons || {}; L.names = L.names || {}; L.off = L.off || []; return L; };
Object.assign(A.PAGES, { adminlook: 'Personalizar la app' }); ORIGP.adminlook = 'Personalizar la app'; pageIcon('adminlook', 'flower');
const baseOf = v => String(v || '').replace(/^s:/, '').split('~')[0];
const oimg = (n, size) => `<img class="pixel" alt="" src="${origSprite(n, 3)}" style="width:${size}px;height:${size}px;object-fit:contain">`;
const cimg = (n, size) => `<img class="pixel" alt="" src="${Pix.sprite(n, 3)}" style="width:${size}px;height:${size}px;object-fit:contain">`;
const NAVK = ['home', 'wallet', 'add', 'month', 'journal', 'more'];
const OFFABLE = ['rincon', 'logros', 'tienda', 'suscripciones', 'recordatorio', 'year', 'goals', 'recurring', 'projections', 'rules', 'juegos', 'jardin', 'tablero', 'visitas', 'coleccion', 'regalo', 'crecer', 'shey', 'cuarto', 'loans', 'cuotas'];
function iconTiles(list) {
  const L = LOOK().icons || {};
  return `<div class="lk-grid">${list.filter(([n]) => n && Pix.has(n)).map(([n, label]) => `<button data-act="lkPick" data-n="${esc(n)}" data-l="${esc(label)}"><span class="lk-ic">${cimg(n, 34)}${L[n] ? '<i class="lk-dot" title="Cambiado"></i>' : ''}</span><span>${esc(label)}</span></button>`).join('')}</div>`;
}
A.screens.adminlook = () => {
  if (!Store.isOwner) return `${sub('adminlook', 'admin')}<div class="card empty">Esta sección es solo para la dueña de la app.</div>`;
  const tab = S.lookTab || 'icons'; const L = LOOK(); const map = A.PACKS.pixel.map;
  const tabs = `<div class="tabs-line">${[['icons', 'Iconos'], ['names', 'Nombres'], ['off', 'Secciones']].map(([k, l]) => `<button data-act="lkTab" data-v="${k}" aria-pressed="${tab === k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (tab === 'icons') {
    const seen = new Set(); const uniq = arr => arr.filter(([n]) => n && !seen.has(n) && seen.add(n));
    const nav = uniq(NAVK.map(k => [baseOf(map[k]), A.PAGES[k] || 'Anotar']));
    const secs = uniq(Object.keys(map).filter(k => !NAVK.includes(k) && A.PAGES[k]).map(k => [baseOf(map[k]), A.PAGES[k]]));
    const cats = uniq((S.fin.categories || []).filter(c => /^s:/.test(c.icon || '')).map(c => [baseOf(c.icon), c.name]));
    const accs = uniq((S.fin.accounts || []).filter(c => /^s:/.test(c.icon || '')).map(c => [baseOf(c.icon), c.name]));
    const changed = Object.keys(L.icons || {});
    body = `<div class="card stack"><b>Toca un icono para cambiarlo</b><span class="faint">El cambio se ve en toda la app y para todas las usuarias: en la barra, en las categorías, en los movimientos, en todo lugar donde salga ese dibujito. Los que tienen puntito rosa ya están cambiados.</span></div>
<div class="card"><h3>Barra de abajo</h3>${iconTiles(nav)}</div>
<div class="card"><h3>Secciones</h3>${iconTiles(secs)}</div>
<div class="card"><h3>Categorías</h3>${iconTiles(cats)}</div>
<div class="card"><h3>Cuentas</h3>${iconTiles(accs)}</div>
${changed.length ? `<div class="card"><h3>Ya cambiados</h3>${iconTiles(changed.map(n => [n, n]))}</div>` : ''}
<button class="card row" data-act="lkAny" style="gap:12px;width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer">${cimg('sparkle', 36)}<div style="flex:1"><b>Cambiar cualquier otro dibujito</b><div class="faint">Comidas, estrellitas, adornos, lo que sea</div></div><span class="faint">›</span></button>`;
  } else if (tab === 'names') {
    const keys = [...new Set(NAVK.concat(['rincon', 'logros', 'tienda', 'suscripciones', 'recordatorio', 'year', 'goals', 'recurring', 'projections', 'rules', 'juegos', 'jardin', 'tablero', 'visitas', 'coleccion', 'regalo', 'crecer', 'shey', 'cuarto', 'loans', 'settings', 'appearance', 'plan', 'data']))].filter(k => ORIGP[k]);
    body = `<div class="card stack"><b>Ponle otro nombre a las secciones</b><span class="faint">Déjalo vacío para usar el nombre original. Los nombres cortos se ven mejor en la barra de abajo.</span>
${keys.map(k => `<div class="setrow"><span class="row" style="gap:8px">${cimg(baseOf(map[k]) || 'sparkle', 24)}<span class="faint" style="min-width:0">${esc(ORIGP[k])}</span></span><input class="in" data-lkname="${k}" value="${esc((L.names || {})[k] || '')}" placeholder="${esc(ORIGP[k])}" maxlength="24" style="max-width:170px"></div>`).join('')}
<button class="btn pink" data-act="lkNames" style="justify-content:center">Guardar nombres</button></div>`;
  } else {
    body = `<div class="card stack"><b>Prende o apaga secciones</b><span class="faint">Las apagadas desaparecen para tus usuarias. Tú las sigues viendo para poder revisarlas y prenderlas cuando quieras.</span>
${OFFABLE.filter(k => ORIGP[k]).map(k => `<div class="setrow"><span class="row" style="gap:8px">${cimg(baseOf(map[k]) || 'sparkle', 24)}${esc(A.PAGES[k])}</span><span class="toggle"><input type="checkbox" data-lkoff="${k}" ${(L.off || []).includes(k) ? '' : 'checked'}><span></span></span></div>`).join('')}</div>`;
  }
  return `${sub('adminlook', 'admin', '<span class="tag gold">Solo tú</span>')}${tabs}${body}`;
};
A.after.adminlook = el => {
  el.addEventListener('change', e => { const t = e.target; if (!t.dataset.lkoff) return; const L = look(); const k = t.dataset.lkoff; L.off = L.off.filter(x => x !== k); if (!t.checked) L.off.push(k); saveLook(t.checked ? `${A.PAGES[k]} está prendida` : `${A.PAGES[k]} quedó apagada para tus usuarias`); });
};
ACT.lkTab = a => { S.lookTab = a.dataset.v; A.render(); };
ACT.lkNames = () => { const L = look(); $$('[data-lkname]').forEach(i => { const v = i.value.trim(); if (v) L.names[i.dataset.lkname] = v; else delete L.names[i.dataset.lkname]; }); saveLook('Nombres guardados. Ya los ven todas.'); };
function pickerGrid(exclude) {
  const all = Pix.names.filter(n => n !== exclude && !/^(x_pared|x_piso|pg_|__|regalo_|plataforma)/.test(n));
  const mine = all.filter(n => n.startsWith('ci_'));
  return `${mine.length ? `<div class="lab">Tus iconos</div><div class="emojigrid">${mine.map(n => `<button data-to="${n}">${oimg(n, 30)}</button>`).join('')}</div>` : ''}
<div class="lab">Todos los dibujitos</div><input class="in" id="lkQ" type="search" placeholder="Buscar (ej. cafe, gift, star)" style="margin-bottom:8px"><div class="emojigrid" id="lkAll">${all.filter(n => !n.startsWith('ci_')).map(n => `<button data-to="${n}" data-q="${n.toLowerCase()}">${oimg(n, 30)}</button>`).join('')}</div>`;
}
function bindSearch(sh) { const q = sh.querySelector('#lkQ'); if (q) q.oninput = () => { const v = q.value.toLowerCase().trim(); sh.querySelectorAll('#lkAll [data-q]').forEach(b => b.style.display = !v || b.dataset.q.includes(v) ? '' : 'none'); }; }
ACT.lkPick = a => {
  const n = a.dataset.n, label = a.dataset.l || n; const cur = (LOOK().icons || {})[n];
  openSheet('Cambiar icono: ' + label, `<div class="stack">
<div class="row" style="gap:14px;justify-content:center"><div class="stack" style="align-items:center;gap:2px">${oimg(n, 48)}<span class="faint">Original</span></div>${cur ? `<span class="faint">›</span><div class="stack" style="align-items:center;gap:2px">${oimg(cur, 48)}<span class="faint">Ahora</span></div>` : ''}</div>
<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn pink" data-lk="draw" style="flex:1;justify-content:center">Dibujar o subir uno nuevo</button>${cur ? '<button class="btn" data-lk="reset" style="flex:1;justify-content:center">Volver al original</button>' : ''}</div>
${pickerGrid(n)}</div>`, sh => { bindSearch(sh); sh.addEventListener('click', e => {
    const b = e.target.closest('[data-to],[data-lk]'); if (!b) return; const L = look();
    if (b.dataset.to) { L.icons[n] = b.dataset.to; closeSheet(); saveLook('Icono cambiado. Ya lo ven todas.'); }
    else if (b.dataset.lk === 'reset') { delete L.icons[n]; closeSheet(); saveLook('Volvió el icono original'); }
    else if (b.dataset.lk === 'draw') { closeSheet(); S.lookTarget = n; S.catKind = 'icons'; A.go('admincat'); setTimeout(() => { ACT.edNew && ACT.edNew(); toast('Dibuja o sube tu icono y toca Guardar. Lo pongo en lugar de ' + label + '.'); }, 30); }
  }); });
};
ACT.lkAny = () => openSheet('¿Qué dibujito quieres cambiar?', `<div class="stack"><p class="faint" style="margin:0">Elige el que quieres reemplazar. Después eliges por cuál.</p>${pickerGrid('')}</div>`, sh => { bindSearch(sh); sh.addEventListener('click', e => { const b = e.target.closest('[data-to]'); if (!b) return; closeSheet(); setTimeout(() => ACT.lkPick({ dataset: { n: b.dataset.to, l: b.dataset.to } }), 60); }); });
// al guardar un icono dibujado para reemplazar otro, se aplica solo
{ const save0 = ACT.edSave; ACT.edSave = (...x) => {
  const tgt = S.lookTarget; const before = new Set(((A.CFG.catalog || {}).icons || []).map(i => i.id));
  const r = save0(...x);
  if (tgt) { const nu = ((A.CFG.catalog || {}).icons || []).find(i => !before.has(i.id)); if (nu) { S.lookTarget = null; look().icons[tgt] = 'ci_' + nu.id; setTimeout(() => { saveLook('Listo, tu icono nuevo ya reemplazó al anterior'); A.go('adminlook'); }, 400); } }
  return r;
}; }
{ const adm = A.screens.admin; A.screens.admin = () => { const h = adm(); if (!Store.isOwner) return h; const btn = `<button class="card row" data-go="adminlook" style="gap:12px;width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer">${cimg('m_inicio', 40)}${cimg('ramen', 32)}<div style="flex:1"><b>Personalizar la app</b><div class="faint">Cambia iconos, nombres de secciones y prende o apaga secciones para todas</div></div><span class="faint">›</span></button>`; const i = h.indexOf('<details'); return i > 0 ? h.slice(0, i) + btn + h.slice(i) : h + btn; }; }

// ---------------- Arranque ----------------
const st0 = A.start;
A.start = async () => { await st0(); applyLook(); A.renderNav(); birthdayGift(); loadWx(); if (online() && S.settings.visitCode) setTimeout(() => { loadInbox().then(() => { A.renderNav(); }).catch(() => {}); }, 2500); };
})();
