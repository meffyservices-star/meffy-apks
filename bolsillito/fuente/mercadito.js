// ================= Puestitos (estilo pueblito): se ven al visitar a una amistad, y el tuyo desde tu cuarto =================
(function () {
const A = App, S = A.S, { esc, toast, openSheet, closeSheet } = A;
const sc = A.screens, ACT = A.ACTIONS;
A.PAGES.puestito = 'Puestito';
const spr = (n, s) => Pix.sprite(n, s || 3);
const ST = n => `<img class="pixel" alt="" src="${spr('estrellita', 2)}" style="width:${n || 14}px;height:${n || 14}px;vertical-align:-2px">`;
const sheet = (t, h) => openSheet(t, h, sh => sh.addEventListener('click', ev => { const b = ev.target.closest('[data-act]'); if (b && ACT[b.dataset.act]) { ev.stopPropagation(); ACT[b.dataset.act](b); } }));
const BOXES = 3, SLOTS = 10;
const M = { loaded: false, loading: false, friends: [], stalls: {}, mine: { name: '', items: [] }, owed: [], view: null };
const online = () => Store.mode === 'supa' && Store.sb && !!Store.uid && navigator.onLine !== false;
const cfg = () => S.settings.market = S.settings.market || { name: '' };
const myName = () => (cfg().name || '').trim() || ('Puestito de ' + (S.settings.name || 'ti').split(' ')[0]);
const R = () => A.roomState();
const uid = () => Math.random().toString(36).slice(2, 10);
const myPet = () => { try { return A.petInfo(A.petActive ? A.petActive() : 'gochi').sprite; } catch (e) { return 'gochi'; } };

// ---------- paneles de pixel art (madera, crema, etiqueta) para que nada parezca una caja web ----------
function panelURL(fill, edge, hi, sh) {
  const c = document.createElement('canvas'); c.width = c.height = 8; const x = c.getContext('2d');
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
    const corner = (i === 0 || i === 7) && (j === 0 || j === 7); if (corner) continue;
    const bd = i === 0 || i === 7 || j === 0 || j === 7;
    x.fillStyle = bd ? edge : (j === 1 || i === 1) ? hi : (j === 6 || i === 6) ? sh : fill; x.fillRect(i, j, 1, 1);
  }
  return c.toDataURL();
}
let styled = false;
A.pnStyles = () => styles();
function styles() {
  if (styled) return; styled = true;
  const P = (n, a) => `url(${panelURL(...a)})`;
  const st = document.createElement('style');
  st.textContent = `.pn{border:9px solid transparent;border-image:var(--pn) 3 fill/9px stretch;image-rendering:pixelated}
.pn-wood{--pn:${P('w', ['#c98f55', '#5a3a3a', '#e3ae73', '#a8703f'])}}
.pn-cream{--pn:${P('c', ['#fff3d6', '#8a5a35', '#fffaf0', '#ecd9b0'])}}
.pn-slot{--pn:${P('s', ['#f6e3bb', '#8a5a35', '#e8cf9c', '#fff3d6'])}}
.pn-tag{--pn:${P('t', ['#ffe9a8', '#7a4a2c', '#fff6cf', '#ecc96a'])}}
.pn-pink{--pn:${P('p', ['#ff8fb3', '#5a3a3a', '#ffc2d6', '#d94a7a'])}}`;
  document.head.appendChild(st);
}

// ---------- la escena (todo dibujado píxel por píxel) ----------
const W = 160, H = 128;
function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function scene(back, front, seed) {
  back.width = front.width = W; back.height = front.height = H;
  const b = back.getContext('2d'), f = front.getContext('2d'); const r = rng(seed || 7);
  const R_ = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const OUT = '#5a3a3a';
  // cielo en franjas con puntitos entre una y otra
  const sky = ['#9fd8f7', '#b3e0fa', '#c8e9fb', '#dcf2fd', '#eef9fe'];
  sky.forEach((col, i) => { R_(b, col, 0, i * 14, W, 14); if (i) for (let x = (i % 2); x < W; x += 2) R_(b, sky[i - 1], x, i * 14, 1, 1); });
  R_(b, '#fff6a8', 118, 8, 12, 12); R_(b, '#ffe46b', 120, 10, 8, 8); R_(b, '#fff6a8', 116, 12, 16, 4); R_(b, '#fff6a8', 122, 6, 4, 16);
  const cloud = (x, y, k) => { const c = '#ffffff', s = '#dceaf6'; R_(b, c, x + 3, y, 9 * k, 3); R_(b, c, x, y + 3, 15 * k, 4); R_(b, c, x + 4, y - 2, 5, 3); R_(b, s, x, y + 6, 15 * k, 1); };
  cloud(12, 14, 1); cloud(64, 24, 1); cloud(100, 36, 1);
  // colinas
  for (let x = 0; x < W; x++) { const y1 = 66 + Math.round(Math.sin(x / 17) * 4), y2 = 74 + Math.round(Math.sin(x / 11 + 2) * 3); R_(b, '#a9de8c', x, y1, 1, H); R_(b, '#bfe8a0', x, y1, 1, 1); R_(b, '#8fd070', x, y2, 1, H); }
  // pasto con cuadritos y florecitas
  R_(b, '#7cc65a', 0, 82, W, H - 82);
  for (let y = 82; y < H; y += 4) for (let x = ((y / 4) % 2) * 4; x < W; x += 8) R_(b, '#86cf63', x, y, 4, 4);
  const fl = ['#ff8fb3', '#ffffff', '#ffd84a', '#c9a8ff']; for (let i = 0; i < 34; i++) { const x = Math.floor(r() * W), y = 84 + Math.floor(r() * 42), c = fl[i % 4]; R_(b, c, x, y, 2, 1); R_(b, c, x, y - 1, 1, 1); R_(b, '#fff3a0', x + 1, y, 1, 1); }
  // caminito
  for (let y = 104; y < H; y++) { const w = 38 + (y - 104) * 1.4, x0 = 80 - w / 2; R_(b, '#f0d9a8', Math.floor(x0), y, Math.floor(w), 1); R_(b, '#ddc38c', Math.floor(x0), y, 1, 1); R_(b, '#ddc38c', Math.floor(x0 + w) - 1, y, 1, 1); }
  for (let i = 0; i < 12; i++) R_(b, '#e2c995', 50 + Math.floor(r() * 60), 106 + Math.floor(r() * 20), 2, 1);
  // árboles de los lados
  const tree = (x, y) => { R_(b, OUT, x + 3, y + 20, 8, 14); R_(b, '#b97a48', x + 4, y + 20, 6, 13); R_(b, '#d9a068', x + 4, y + 20, 2, 13);
    [[7, 8, 13], [1, 14, 9], [13, 14, 9], [7, 16, 11]].forEach(([cx, cy, rr]) => { for (let j = -rr; j <= rr; j++) for (let i = -rr; i <= rr; i++) if (i * i + j * j <= rr * rr) R_(b, (i + j < -rr * .6) ? '#8fdb6b' : (i + j > rr * .8 ? '#4f9a3a' : '#6bc24f'), x + cx + i, y + cy + j, 1, 1); });
    R_(b, '#ff8fb3', x + 5, y + 8, 2, 2); R_(b, '#ff8fb3', x + 12, y + 13, 2, 2); R_(b, '#ffd6e3', x + 2, y + 15, 2, 2); };
  tree(-4, 40); tree(150, 44);
  // pared de atrás y postes
  R_(b, OUT, 25, 38, 110, 52); R_(b, '#a8703f', 26, 39, 108, 50);
  for (let x = 26; x < 134; x += 9) { R_(b, '#8a5a35', x, 39, 1, 50); R_(b, '#b97a48', x + 1, 39, 1, 50); }
  R_(b, '#7a4a2c', 26, 39, 108, 4); // sombra del toldo
  [[22, 36], [134, 36]].forEach(([x, y]) => { R_(b, OUT, x, y, 6, 70); R_(b, '#c98f55', x + 1, y, 4, 69); R_(b, '#e3ae73', x + 1, y, 1, 69); R_(b, '#a8703f', x + 4, y, 1, 69); });
  // ---- frente: toldo ----
  const x0 = 18, x1 = 142; R_(f, OUT, x0 + 6, 5, x1 - x0 - 12, 3); R_(f, OUT, x0, 8, x1 - x0, 26);
  const P = '#ff8fb3', C = '#fff6e6', Ps = '#e06b94', Cs = '#e6d8bd', Pl = '#ffc2d6';
  for (let x = x0 + 1; x < x1 - 1; x++) { const st = Math.floor((x - x0 - 1) / 8) % 2 === 0; R_(f, st ? P : C, x, 8, 1, 25); R_(f, st ? Pl : '#ffffff', x, 9, 1, 1); R_(f, st ? Ps : Cs, x, 31, 1, 2); }
  for (let x = x0 + 7; x < x1 - 7; x++) { const st = Math.floor((x - x0 - 7) / 8) % 2 === 0; R_(f, st ? P : C, x, 5 + 0, 1, 3); }
  for (let i = 0; i < 15; i++) { const cx = x0 + 4 + i * 8, st = i % 2 === 0; for (let y = 33; y < 40; y++) for (let x = cx - 5; x <= cx + 4; x++) { const dx = (x - (cx - .5)) / 4.6, dy = (y - 33) / 6.6, d = dx * dx + dy * dy; if (d <= 1) R_(f, d > .62 ? OUT : (st ? P : C), x, y, 1, 1); } }
  for (let i = 0; i < 15; i++) { const cx = x0 + 4 + i * 8, st = i % 2 === 0; for (let y = 33; y < 39; y++) for (let x = cx - 3; x <= cx + 3; x++) { const dx = (x - (cx - .5)) / 3.6, dy = (y - 33) / 5.2; if (dx * dx + dy * dy <= 1) R_(f, y > 36 ? (st ? Ps : Cs) : (st ? P : C), x, y, 1, 1); } }
  // banderín
  R_(f, OUT, 78, 0, 4, 6); R_(f, '#ffd84a', 79, 0, 2, 5); R_(f, '#fff6a8', 79, 0, 1, 2);
  // ---- frente: mostrador ----
  R_(f, OUT, 18, 88, 124, 36); R_(f, '#e3ae73', 19, 89, 122, 5); R_(f, '#fff0d0', 19, 89, 122, 1); R_(f, '#c98f55', 19, 94, 122, 29);
  for (let x = 19; x < 141; x += 20) { R_(f, '#8a5a35', x, 94, 1, 29); R_(f, '#e3ae73', x + 1, 94, 1, 29); }
  R_(f, '#a8703f', 19, 119, 122, 4); R_(f, '#8a5a35', 19, 94, 122, 1);
  // cajitas (de madera, abiertas) sobre el mostrador
  for (let i = 0; i < BOXES; i++) { const cx = 32 + i * 33;
    R_(f, OUT, cx, 77, 30, 13); R_(f, '#b97a48', cx + 1, 78, 28, 11); R_(f, '#e3ae73', cx + 1, 78, 28, 2); R_(f, '#8a5a35', cx + 1, 84, 28, 1); R_(f, '#a8703f', cx + 1, 86, 28, 3);
    [[2, 80], [26, 80], [2, 86], [26, 86]].forEach(([dx, dy]) => R_(f, '#fff0d0', cx + dx, dy, 1, 1)); R_(f, OUT, cx + 13, 81, 4, 3); R_(f, '#ffd84a', cx + 14, 82, 2, 1); }
  // pastito de adelante
  for (let i = 0; i < 26; i++) { const x = Math.floor(r() * W), y = 120 + Math.floor(r() * 8); R_(f, '#5fb044', x, y, 1, 3); R_(f, '#8fdb6b', x + 1, y + 1, 1, 2); }
}

// ---------- datos ----------
function spriteOf(l) {
  if (l.d && l.d.rows) { const n = 'mk_' + l.id; if (!Pix.has(n)) Pix.define(n, { raw: l.d.rows, pal: A.studioPal }); return n; }
  if (l.t === 'furn') return A.FURN[l.k] ? A.furnSprite(l.k) : 'regalo_cerrado';
  return A.ACC[l.k] ? 'acc_' + l.k : 'regalo_cerrado';
}
const imgOf = (l, sc2) => `<img class="pixel" alt="${esc(l.nm)}" src="${spr(spriteOf(l), sc2 || 2)}">`;
async function load(force) {
  if (!online() || M.loading) return; if (M.loaded && !force) return; M.loading = true;
  try {
    if (A.loadFriendReqs && !(A.friendsLoaded && A.friendsLoaded())) { try { await A.loadFriendReqs(); } catch (x) {} }
    M.friends = A.friendUsers ? A.friendUsers() : [];
    const ids = M.friends.map(f => f.id).concat([Store.uid]);
    const [a, s] = await Promise.all([Store.sb.from('market_stalls').select('user_id,name,items,pet').in('user_id', ids), Store.sb.from('market_sales').select('id,price,item_name,buyer_name').eq('seller', Store.uid).eq('claimed', false)]);
    M.stalls = {}; (a.data || []).forEach(r => { if (r.user_id === Store.uid) M.mine = { name: r.name, items: r.items || [] }; else M.stalls[r.user_id] = r; });
    M.owed = s.data || []; M.loaded = true;
  } catch (e) { M.err = true; }
  M.loading = false; if (S.route === 'puestito') A.render();
}
async function save(fn) { // siempre sobre lo más nuevo del servidor, por si alguien te compró mientras tanto
  const { data } = await Store.sb.from('market_stalls').select('items').eq('user_id', Store.uid).maybeSingle();
  const items = fn(((data && data.items) || []).slice());
  const { error } = await Store.sb.from('market_stalls').upsert({ user_id: Store.uid, name: myName(), items, pet: myPet(), updated_at: new Date().toISOString() });
  if (error) throw error; M.mine = { name: myName(), items }; return items;
}
function sellable() {
  const out = [], own = (R().owned || []);
  Object.keys(A.FURN).forEach(k => { const f = A.FURN[k]; if (A.furnFree(k) > 0) out.push({ t: 'furn', k, nm: f.name, d: f.mine ? A.studioData(k) : null }); });
  Object.keys(A.ACC).forEach(k => { const a = A.ACC[k]; if (own.includes('acc:' + k)) out.push({ t: 'acc', k, nm: a.name, d: a.mine ? A.studioData(k) : null }); });
  return out;
}
function unequip(k) { const eq = (S.settings.rincon || {}).equip || {}; Object.values(eq).forEach(o => { if (o && typeof o === 'object') Object.keys(o).forEach(sl => { if (o[sl] === k) delete o[sl]; }); }); }
function giveItem(it) {
  if (it.d && it.d.rows) A.studioGot(it.k, it.d);
  if (it.t === 'furn') A.giveFurn(it.k, 1);
  else { const r = R(); r.owned = r.owned || []; if (!r.owned.includes('acc:' + it.k)) r.owned.push('acc:' + it.k); }
  try { A.studioReg(); } catch (e) {}
}

function vitrina(c, mine) {
  const L = c.items.slice().sort((a, b) => a.b - b.b || a.s - b.s);
  const body = L.length ? `<div class="vt-grid">${L.map(l => `<button class="vt-it pn pn-slot" data-act="${mine ? 'mkSlot' : 'mkLookV'}" data-b="${l.b}" data-s="${l.s}" data-id="${l.id}"><span class="vt-img">${imgOf(l, 2)}</span><b>${esc(l.nm)}</b><span class="vt-pr pn pn-tag">${ST(10)}${l.price}</span></button>`).join('')}</div>` : `<div class="vt-empty"><img class="pixel" alt="" src="${spr('regalo_abierto', 4)}"><b>${mine ? 'Tu puestito está vacío' : 'Todavía no vende nada'}</b><span>${mine ? 'Toca una cajita de arriba y pon tu primera cosita.' : 'Vuelve pronto, a lo mejor ya puso algo.'}</span></div>`;
  return `<div class="vt-board"><div class="vt-head pn pn-wood"><span>${mine ? 'Lo que tienes a la venta' : 'Todo lo que vende'}</span><em>${L.length} ${L.length === 1 ? 'cosita' : 'cositas'}</em></div><div class="vt-body pn pn-cream">${body}</div></div>`;
}
// ---------- pantalla del puestito ----------
const cur = () => { const v = M.view; if (!v) return null; return v.mine ? { name: myName(), items: M.mine.items, pet: myPet(), mine: true } : { name: (M.stalls[v.u] && M.stalls[v.u].name) || ('Puestito de ' + v.n), items: (M.stalls[v.u] && M.stalls[v.u].items) || [], pet: (M.stalls[v.u] && M.stalls[v.u].pet) || null, mine: false }; };
sc.puestito = () => {
  styles(); const v = M.view; if (!v) return `${A.header('puestito')}<p class="faint" style="text-align:center;margin:24px">Visita a una amistad para ver su puestito.</p>`;
  if (!online()) return `${A.header('puestito')}<div class="card" style="text-align:center"><h3>Sin conexión por ahora</h3><p class="faint">Los puestitos se ven cuando tengas internet.</p></div>`;
  if (!M.loaded) { load(); return `${A.header('puestito')}<div class="pz-load">Yendo al puestito…</div>`; }
  const c = cur(), owed = v.mine ? M.owed.reduce((s2, r) => s2 + (+r.price || 0), 0) : 0;
  return `${A.header('puestito')}
<div class="pz" id="pz"><canvas class="pz-b" width="${W}" height="${H}"></canvas><img class="pz-pet pixel" alt="" ${c.pet && Pix.has(c.pet) ? `src="${spr(c.pet, 1)}"` : ''}><canvas class="pz-f" width="${W}" height="${H}"></canvas>
<div class="pz-sign pn pn-wood"><b>${esc(c.name)}</b></div>
${Array.from({ length: BOXES }, (_, i) => { const L = c.items.filter(x => x.b === i), n = L.length; return `<button class="pz-crate" data-act="mkCrate" data-b="${i}" style="left:${(32 + i * 33) / W * 100}%" aria-label="Cajita ${i + 1}">${L.slice(0, 3).map((l, j) => `<img class="pz-it pixel" alt="" data-x="${j}" src="${spr(spriteOf(l), 1)}">`).join('')}</button><span class="pz-tag pn pn-tag" style="left:${(32 + i * 33) / W * 100}%">${v.mine && !n ? '+ Poner' : n + ' de ' + SLOTS}</span>`; }).join('')}
</div>
${vitrina(c, v.mine)}
${v.mine ? `<div class="pz-info">${owed ? `<button class="btn pink" data-act="mkCollect" style="width:100%;justify-content:center">Recoger ${owed} estrellitas de tus ventas</button>` : ''}<label class="f">Nombre de tu puestito<input class="in" id="mkName" maxlength="22" placeholder="${esc(myName())}" value="${esc(cfg().name || '')}"></label><p class="faint" style="margin:0 2px;font-size:12px">Toca una cajita para poner cosas. Tus amistades te ven cuando visitan tu cuarto.</p></div>` : `<p class="faint" style="text-align:center;margin:10px 8px">Toca una cajita para ver lo que vende. Tienes ${ST(13)} ${A.rinconBalance ? A.rinconBalance() : 0}</p>`}`;
};
A.after.puestito = el => {
  const z = el.querySelector('#pz'); if (z) {
    const w = Math.max(W, Math.floor(Math.min(el.clientWidth || 360, 640) / W) * W), u = w / W; z.style.width = w + 'px'; z.style.height = H * u + 'px'; z.style.setProperty('--u', u + 'px');
    const c = cur(); scene(z.querySelector('.pz-b'), z.querySelector('.pz-f'), (M.view.u || 'mine').length * 31 + 5);
    const pet = z.querySelector('.pz-pet'); pet.onload = () => { pet.style.width = Math.min(30, pet.naturalWidth) * u + 'px'; }; if (pet.complete && pet.naturalWidth) pet.onload(); if (!c.pet) pet.style.display = 'none';
    z.querySelectorAll('.pz-it').forEach(im => { const sz = () => { const n = im.naturalWidth, m = Math.max(n, im.naturalHeight), k = m <= 14 ? 1 : m <= 28 ? .5 : .25; im.style.width = Math.max(4, Math.round(n * k)) * u + 'px'; }; im.onload = sz; if (im.complete && im.naturalWidth) sz(); });
  }
  const n = el.querySelector('#mkName'); if (n) n.onchange = async () => { cfg().name = n.value.trim(); A.saveSettings(); try { await save(i => i); toast('Nombre guardado'); A.render(); } catch (e) { toast('No pude guardar ahora'); } };
};
ACT.mkOpen = a => { M.view = { u: a.dataset.u, n: a.dataset.n || 'tu amistad', mine: false }; M.loaded = false; A.go('puestito'); };
ACT.mkMine = () => { M.view = { u: Store.uid, n: '', mine: true }; M.loaded = false; A.go('puestito'); };
ACT.mkCollect = async () => {
  const ids = M.owed.map(r => r.id), sum = M.owed.reduce((s2, r) => s2 + (+r.price || 0), 0); if (!ids.length) return;
  const { error } = await Store.sb.from('market_sales').update({ claimed: true }).in('id', ids).eq('seller', Store.uid); if (error) return toast('No pude recogerlo ahora');
  A.giveStars(sum); A.saveSettings(); M.owed = []; toast(`+${sum} estrellitas de tus ventas`); A.render();
};
// ---- la cajita abierta: 10 huecos ----
function crateHTML(b) {
  const c = cur(), mine = c.mine;
  const cells = Array.from({ length: SLOTS }, (_, s) => { const l = c.items.find(x => x.b === b && x.s === s);
    if (!l) return `<button class="pk-cell pn pn-slot empty" ${mine ? `data-act="mkSlot" data-b="${b}" data-s="${s}"` : 'disabled'} aria-label="Hueco vacío">${mine ? '<i>+</i>' : ''}</button>`;
    return `<button class="pk-cell pn pn-slot" data-act="${mine ? 'mkSlot' : 'mkLook'}" data-b="${b}" data-s="${s}" data-id="${l.id}"><span class="pk-img">${imgOf(l, 2)}</span><span class="pk-price pn pn-tag">${ST(10)}${l.price}</span></button>`; }).join('');
  return `<div class="pk-box pn pn-wood"><div class="pk-h"><b>Cajita ${b + 1}</b><span>${c.items.filter(x => x.b === b).length} de ${SLOTS}</span></div><div class="pk-cells">${cells}</div></div>`;
}
ACT.mkCrate = a => { styles(); M.box = +a.dataset.b; sheet(`Cajita ${M.box + 1}`, crateHTML(M.box)); };
ACT.mkLook = a => {
  const c = cur(), l = c.items.find(x => x.id === a.dataset.id); if (!l) return;
  sheet(l.nm, `<div class="mk-look"><div class="mk-look-img pn pn-cream">${imgOf(l, 5)}</div><b>${esc(l.nm)}</b><span class="faint">${l.t === 'furn' ? 'Mueble para tu cuarto' : 'Ropita para tus mascotas'}</span><button class="btn pink" data-act="mkBuy" data-id="${l.id}" style="justify-content:center;width:100%">Comprar por ${l.price} ${ST(14)}</button><button class="btn" data-act="mkBack" style="justify-content:center;width:100%">Volver a la cajita</button></div>`);
};
ACT.mkLookV = a => { M.box = +a.dataset.b; ACT.mkLook(a); };
ACT.mkBack = () => sheet(`Cajita ${M.box + 1}`, crateHTML(M.box));
ACT.mkBuy = async a => {
  const v = M.view, st = M.stalls[v.u], l = ((st && st.items) || []).find(x => x.id === a.dataset.id); if (!l || a.dataset.busy) return;
  if (!A.spendStars(l.price)) return toast('Te faltan estrellitas'); a.dataset.busy = 1;
  const { data, error } = await Store.sb.rpc('market_buy', { p_seller: v.u, p_listing: l.id, p_buyer_name: (S.settings.name || '').split(' ')[0] || 'Una amistad' });
  if (error) { A.giveStars(l.price); const m = String(error.message || ''); toast(/sold_out/.test(m) ? 'Ay, ya se vendió' : /not_friends/.test(m) ? 'Solo se compra entre amistades' : 'No se pudo comprar'); await load(true); ACT.mkBack(); return; }
  giveItem(data || l); A.saveSettings(); toast(`¡${l.nm} es tuyo!`); await load(true); ACT.mkBack();
};
// ---- mi puestito: poner y quitar ----
ACT.mkSlot = a => {
  const b = +a.dataset.b, s = +a.dataset.s, l = M.mine.items.find(x => x.b === b && x.s === s);
  if (l) return sheet(l.nm, `<div class="mk-look"><div class="mk-look-img pn pn-cream">${imgOf(l, 5)}</div><b>${esc(l.nm)}</b><span class="faint">En venta por ${l.price} estrellitas</span><button class="btn" data-act="mkTake" data-id="${l.id}" style="justify-content:center;width:100%">Quitar y guardarlo</button></div>`);
  const L = sellable(); M.pickList = L;
  sheet('¿Qué ponemos en la cajita?', `<div class="mk-pick">${L.length ? L.map((x, i) => `<button class="mk-pk pn pn-slot" data-act="mkPick" data-i="${i}" data-b="${b}" data-s="${s}"><span>${imgOf(Object.assign({ id: 'p' + i }, x), 2)}</span><small>${esc(x.nm)}</small></button>`).join('') : '<p class="faint" style="text-align:center;margin:18px">No tienes nada libre para vender. Los muebles que están puestos en tu cuarto no cuentan: quítalos primero.</p>'}</div>`);
};
ACT.mkPick = a => {
  const x = M.pickList[+a.dataset.i]; if (!x) return; M.sel = { x, b: +a.dataset.b, s: +a.dataset.s };
  sheet('Ponle precio', `<div class="mk-look"><div class="mk-look-img pn pn-cream">${imgOf(Object.assign({ id: 'pp' }, x), 5)}</div><b>${esc(x.nm)}</b><label class="f">Precio en estrellitas<input class="in" id="mkPrice" inputmode="numeric" value="5" maxlength="4"></label><button class="btn pink" data-act="mkPut" style="justify-content:center;width:100%">Ponerlo a la venta</button></div>`);
};
ACT.mkPut = async a => {
  const sel = M.sel; if (!sel || a.dataset.busy) return; const price = Math.max(1, Math.min(9999, parseInt(document.getElementById('mkPrice').value, 10) || 0)); if (!price) return toast('Pon un precio');
  const { x, b, s } = sel; a.dataset.busy = 1;
  if (x.t === 'furn') { if (!A.furnTake(x.k)) return toast('Ese mueble ya no está libre'); }
  else { const r = R(); r.owned = (r.owned || []).filter(o => o !== 'acc:' + x.k); unequip(x.k); }
  try {
    await save(items => { if (items.some(i => i.b === b && i.s === s)) throw new Error('ocupado'); items.push(Object.assign({ id: uid(), b, s, t: x.t, k: x.k, nm: x.nm, price, qty: 1 }, x.d ? { d: x.d } : {})); return items; });
    A.saveSettings(); closeSheet(); toast('¡Ya está a la venta!'); A.render();
  } catch (e) { giveItem(Object.assign({}, x, { d: null })); A.saveSettings(); toast('No pude ponerlo, intenta de nuevo'); }
};
ACT.mkTake = async a => {
  let got = null;
  try { await save(items => { const i = items.findIndex(x => x.id === a.dataset.id); if (i >= 0) { got = items[i]; items.splice(i, 1); } return items; }); } catch (e) { return toast('No pude quitarlo ahora'); }
  if (got) { giveItem(got); A.saveSettings(); toast('Guardado otra vez en tu cuarto'); } else toast('Ese ya se vendió'); closeSheet(); await load(true);
};
// ---- acceso: "Más cositas" en Cuidar (parte2) y el botón Puestito al visitar a una amistad (parte3) ----
Pix.define('puestito_ic', { raw: ['..000000000000..', '.01122112211220.', '0112211221122110', '0222222222222220', '.03..........30.', '.03.44.66.55.30.', '.03.44.66.55.30.', '.07777777777770.'], pal: '#5a3a3a,#ff8fb3,#fff6e6,#c08a5a,#ffd84a,#7cc2f5,#8fd45a,#7a4a2c' });
Object.values(A.PACKS || {}).forEach(p => { if (p.map) p.map.puestito = p === A.PACKS.pixel ? 's:puestito_ic' : 's:estudio'; });
})();
