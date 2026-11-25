// ================= Mercadito entre amistades: puestitos con cajitas de 10 =================
(function () {
const A = App, S = A.S, { esc, toast, openSheet, closeSheet } = A;
const sc = A.screens, ACT = A.ACTIONS;
A.PAGES.mercadito = 'Mercadito';
const spr = (n, s) => Pix.sprite(n, s || 3);
const ST = n => `<img class="pixel" alt="" src="${spr('estrellita', 2)}" style="width:${n || 14}px;height:${n || 14}px;vertical-align:-2px">`;
const sheet = (t, h) => openSheet(t, h, sh => sh.addEventListener('click', ev => { const b = ev.target.closest('[data-act]'); if (b && ACT[b.dataset.act]) ACT[b.dataset.act](b); }));
const BOXES = 3, SLOTS = 10;
const M = { loaded: false, loading: false, friends: [], stalls: {}, mine: { name: '', items: [] }, owed: [], tab: 'ver' };
const online = () => Store.mode === 'supa' && Store.sb && !!Store.uid && navigator.onLine !== false;
const cfg = () => S.settings.market = S.settings.market || { name: '' };
const myName = () => (cfg().name || '').trim() || ('Puestito de ' + (S.settings.name || 'ti').split(' ')[0]);
const R = () => A.roomState();
const uid = () => Math.random().toString(36).slice(2, 10);

// ---------- dibujo de las cosas ----------
function spriteOf(l) {
  if (l.d && l.d.rows) { const n = 'mk_' + l.id; if (!Pix.has(n)) Pix.define(n, { raw: l.d.rows, pal: A.studioPal }); return n; }
  if (l.t === 'furn') return A.FURN[l.k] ? A.furnSprite(l.k) : 'regalo_cerrado';
  return A.ACC[l.k] ? 'acc_' + l.k : 'regalo_cerrado';
}
const imgOf = (l, sc2) => `<img class="pixel" alt="${esc(l.nm)}" src="${spr(spriteOf(l), sc2 || 2)}">`;
function crate(items, b, mode) { // una cajita de madera con 10 huecos
  const cells = Array.from({ length: SLOTS }, (_, s) => { const l = items.find(x => x.b === b && x.s === s);
    if (!l) return `<button class="mk-cell empty" ${mode === 'mine' ? `data-act="mkSlot" data-b="${b}" data-s="${s}"` : 'disabled'} aria-label="Hueco vacío">${mode === 'mine' ? '<i>+</i>' : ''}</button>`;
    return `<button class="mk-cell" data-act="${mode === 'mine' ? 'mkSlot' : 'mkLook'}" data-b="${b}" data-s="${s}" data-id="${l.id}"><span class="mk-img">${imgOf(l, 2)}</span><span class="mk-price">${ST(11)}${l.price}</span></button>`; }).join('');
  const n = items.filter(x => x.b === b).length;
  return `<div class="mk-crate"><div class="mk-crate-h"><b>Cajita ${b + 1}</b><span>${n} de ${SLOTS}</span></div><div class="mk-cells">${cells}</div></div>`;
}
const awning = name => `<div class="mk-awning"><span>${esc(name)}</span></div>`;
function stallHTML(name, items, mode) {
  return `<div class="mk-stall">${awning(name)}<div class="mk-shop">${Array.from({ length: BOXES }, (_, b) => crate(items, b, mode)).join('')}</div><div class="mk-counter"></div></div>`;
}

// ---------- datos ----------
async function load(force) {
  if (!online() || M.loading) return; if (M.loaded && !force) return; M.loading = true;
  try {
    if (A.loadFriendReqs && !(A.friendsLoaded && A.friendsLoaded())) { try { await A.loadFriendReqs(); } catch (x) {} }
    M.friends = A.friendUsers ? A.friendUsers() : [];
    const ids = M.friends.map(f => f.id).concat([Store.uid]);
    const [a, s] = await Promise.all([Store.sb.from('market_stalls').select('user_id,name,items').in('user_id', ids), Store.sb.from('market_sales').select('id,price,item_name,buyer_name').eq('seller', Store.uid).eq('claimed', false)]);
    M.stalls = {}; (a.data || []).forEach(r => { if (r.user_id === Store.uid) M.mine = { name: r.name, items: r.items || [] }; else M.stalls[r.user_id] = r; });
    M.owed = s.data || []; M.loaded = true;
  } catch (e) { M.err = true; }
  M.loading = false; if (A.S.route === 'mercadito' || document.querySelector('.mk-wrap')) A.render();
}
async function save(fn) { // siempre sobre lo más nuevo del servidor, por si alguien te compró mientras tanto
  const { data } = await Store.sb.from('market_stalls').select('items').eq('user_id', Store.uid).maybeSingle();
  const items = fn(((data && data.items) || []).slice());
  const { error } = await Store.sb.from('market_stalls').upsert({ user_id: Store.uid, name: myName(), items, updated_at: new Date().toISOString() });
  if (error) throw error; M.mine = { name: myName(), items }; return items;
}

// ---------- lo que puedo vender ----------
function sellable() {
  const out = [], own = (R().owned || []);
  Object.keys(A.FURN).forEach(k => { const f = A.FURN[k]; if (f.off && !A.furnFree(k)) return; if (A.furnFree(k) > 0) out.push({ t: 'furn', k, nm: f.name, d: f.mine ? A.studioData(k) : null }); });
  Object.keys(A.ACC).forEach(k => { const a = A.ACC[k]; if (own.includes('acc:' + k)) out.push({ t: 'acc', k, nm: a.name, d: a.mine ? A.studioData(k) : null }); });
  return out;
}
function unequip(k) { const eq = (S.settings.rincon || {}).equip || {}; Object.values(eq).forEach(o => { if (o && typeof o === 'object') Object.keys(o).forEach(sl => { if (o[sl] === k) delete o[sl]; }); }); }
function giveItem(it) {
  if (it.d && it.d.rows) A.studioGot(it.k, it.d);
  if (it.t === 'furn') A.giveFurn(it.k, 1);
  else { const r = R(); r.owned = r.owned || []; if (!r.owned.includes('acc:' + it.k)) r.owned.push('acc:' + it.k); }
  if (A.registerCatalog) try { A.studioReg(); } catch (e) {}
}

const hero = () => `<div class="mk-hero"><span class="mk-sky"><img class="pixel mk-c1" alt="" src="${spr('nube', 3)}"><img class="pixel mk-c2" alt="" src="${spr('nube', 2)}"><img class="pixel mk-st" alt="" src="${spr('estrellita', 2)}"></span><img class="pixel mk-shop-ic" alt="" src="${spr('mercadito', 7)}"><div class="mk-hero-t"><b>Mercadito</b><span>Compra y vende cositas con tus amistades</span><em>${ST(13)} ${A.rinconBalance ? A.rinconBalance() : 0}</em></div></div>`;
// ---------- pantalla ----------
sc.mercadito = () => {
  const tab = M.tab;
  const head = `${A.header('mercadito')}${hero()}<div class="mk-tabs"><button data-act="mkTab" data-t="ver" aria-pressed="${tab === 'ver'}">Pasear</button><button data-act="mkTab" data-t="mio" aria-pressed="${tab === 'mio'}">Mi puestito${M.owed.length ? ' <i>' + M.owed.length + '</i>' : ''}</button></div>`;
  if (!online()) return head + `<div class="card" style="text-align:center"><h3>Sin conexión por ahora</h3><p class="faint">El Mercadito se abre cuando tengas internet.</p></div>`;
  if (!M.loaded) { load(); return head + `<p class="faint" style="text-align:center;margin:24px">Abriendo el mercadito…</p>`; }
  if (tab === 'mio') {
    const owed = M.owed.reduce((s2, r) => s2 + (+r.price || 0), 0);
    return `${head}<div class="mk-wrap">
${owed ? `<button class="btn pink mk-collect" data-act="mkCollect" style="width:100%;justify-content:center">Recoger ${owed} estrellitas de tus ventas (${M.owed.length})</button>` : ''}
<div class="card"><label class="f">Nombre de tu puestito<input class="in" id="mkName" maxlength="22" placeholder="${esc(myName())}" value="${esc(cfg().name || '')}"></label><p class="faint" style="margin:6px 2px 0;font-size:12px">Toca un hueco para poner algo. Tus amistades ven el puestito y te compran con estrellitas.</p></div>
${stallHTML(myName(), M.mine.items, 'mine')}</div>`;
  }
  const fr = M.friends;
  return `${head}<div class="mk-wrap">${fr.length ? fr.map(f => { const st = M.stalls[f.id], n = st ? (st.items || []).length : 0; return `<button class="mk-fr" data-act="mkVisit" data-u="${f.id}"><span class="mk-mini"><i></i><i></i><i></i><i></i></span><span class="mk-fr-t"><b>${esc((st && st.name) || ('Puestito de ' + f.name))}</b><small>${n ? n + (n === 1 ? ' cosita a la venta' : ' cositas a la venta') : 'Todavía no vende nada'}</small></span></button>`; }).join('') : '<div class="card" style="text-align:center"><h3>Aquí aparecen los puestitos</h3><p class="faint">Agrega amistades y verás lo que venden.</p><button class="btn pink" data-go="amigos" style="justify-content:center;width:100%">Ir a Amistades</button></div>'}</div>`;
};
A.after.mercadito = el => { const n = el.querySelector('#mkName'); if (n) n.onchange = async () => { cfg().name = n.value.trim(); A.saveSettings(); try { await save(i => i); toast('Nombre guardado'); A.render(); } catch (e) { toast('No pude guardar ahora'); } }; };
ACT.mkTab = a => { M.tab = a.dataset.t; if (M.tab === 'mio') M.loaded = false; A.render(); };
ACT.mkCollect = async a => {
  const ids = M.owed.map(r => r.id), sum = M.owed.reduce((s2, r) => s2 + (+r.price || 0), 0); if (!ids.length) return;
  const { error } = await Store.sb.from('market_sales').update({ claimed: true }).in('id', ids).eq('seller', Store.uid); if (error) return toast('No pude recogerlo ahora');
  A.giveStars(sum); A.saveSettings(); M.owed = []; toast(`+${sum} estrellitas de tus ventas`); A.render();
};
// ---- visitar un puestito ----
ACT.mkVisit = a => { const f = M.friends.find(x => x.id === a.dataset.u); if (!f) return; M.cur = f.id; showStall(); };
function showStall() {
  const f = M.friends.find(x => x.id === M.cur), st = M.stalls[M.cur]; if (!f) return;
  const items = (st && st.items) || [];
  sheet((st && st.name) || ('Puestito de ' + f.name), `<div class="mk-wrap">${stallHTML((st && st.name) || ('Puestito de ' + f.name), items, 'ver')}<p class="faint" style="text-align:center;margin:8px">Toca algo para verlo. Tienes ${ST(13)} ${A.rinconBalance ? A.rinconBalance() : 0}</p></div>`);
}
ACT.mkLook = a => {
  const st = M.stalls[M.cur], l = ((st && st.items) || []).find(x => x.id === a.dataset.id); if (!l) return;
  sheet(l.nm, `<div class="mk-look"><div class="mk-look-img">${imgOf(l, 5)}</div><b>${esc(l.nm)}</b><span class="faint">${l.t === 'furn' ? 'Mueble para tu cuarto' : 'Ropita para tus mascotas'}${(l.qty || 1) > 1 ? ' · quedan ' + l.qty : ''}</span><button class="btn pink" data-act="mkBuy" data-id="${l.id}" style="justify-content:center;width:100%">Comprar por ${l.price} ${ST(14)}</button><button class="btn" data-act="mkBack" style="justify-content:center;width:100%">Volver al puestito</button></div>`);
};
ACT.mkBack = () => showStall();
ACT.mkBuy = async a => {
  const st = M.stalls[M.cur], l = ((st && st.items) || []).find(x => x.id === a.dataset.id); if (!l || a.dataset.busy) return;
  if (!A.spendStars(l.price)) return toast('Te faltan estrellitas'); a.dataset.busy = 1;
  const { data, error } = await Store.sb.rpc('market_buy', { p_seller: M.cur, p_listing: l.id, p_buyer_name: (S.settings.name || '').split(' ')[0] || 'Una amistad' });
  if (error) { A.giveStars(l.price); const m = String(error.message || ''); toast(/sold_out/.test(m) ? 'Ay, ya se vendió' : /not_friends/.test(m) ? 'Solo se compra entre amistades' : 'No se pudo comprar'); await load(true); showStall(); return; }
  giveItem(data || l); A.saveSettings(); toast(`¡${l.nm} es tuyo!`); await load(true); showStall();
};
// ---- mi puestito: poner y quitar ----
ACT.mkSlot = a => {
  const b = +a.dataset.b, s = +a.dataset.s, l = M.mine.items.find(x => x.b === b && x.s === s);
  if (l) return sheet(l.nm, `<div class="mk-look"><div class="mk-look-img">${imgOf(l, 5)}</div><b>${esc(l.nm)}</b><span class="faint">En venta por ${l.price} estrellitas</span><button class="btn" data-act="mkTake" data-id="${l.id}" style="justify-content:center;width:100%">Quitar y guardarlo</button></div>`);
  const L = sellable();
  sheet('¿Qué ponemos en la cajita?', `<div class="mk-pick">${L.length ? L.map((x, i) => `<button class="mk-pk" data-act="mkPick" data-i="${i}" data-b="${b}" data-s="${s}"><span>${imgOf(Object.assign({ id: 'p' + i }, x), 2)}</span><small>${esc(x.nm)}</small></button>`).join('') : '<p class="faint" style="text-align:center;margin:18px">No tienes nada libre para vender. Los muebles que ya están puestos en tu cuarto no cuentan: quítalos primero.</p>'}</div>`);
  M.pickList = L;
};
ACT.mkPick = a => {
  const x = M.pickList[+a.dataset.i]; if (!x) return; M.sel = { x, b: +a.dataset.b, s: +a.dataset.s };
  sheet('Ponle precio', `<div class="mk-look"><div class="mk-look-img">${imgOf(Object.assign({ id: 'pp' }, x), 5)}</div><b>${esc(x.nm)}</b><label class="f">Precio en estrellitas<input class="in" id="mkPrice" inputmode="numeric" value="5" maxlength="4"></label><button class="btn pink" data-act="mkPut" style="justify-content:center;width:100%">Ponerlo a la venta</button></div>`);
};
ACT.mkPut = async a => {
  const sel = M.sel; if (!sel || a.dataset.busy) return; const price = Math.max(1, Math.min(9999, parseInt(document.getElementById('mkPrice').value, 10) || 0)); if (!price) return toast('Pon un precio');
  const { x, b, s } = sel; a.dataset.busy = 1;
  if (x.t === 'furn') { if (!A.furnTake(x.k)) return toast('Ese mueble ya no está libre'); }
  else { const r = R(); r.owned = (r.owned || []).filter(o => o !== 'acc:' + x.k); unequip(x.k); }
  try {
    await save(items => { const n = items.filter(i => i.b === b && i.s === s).length; if (n) throw new Error('ocupado'); items.push(Object.assign({ id: uid(), b, s, t: x.t, k: x.k, nm: x.nm, price, qty: 1 }, x.d ? { d: x.d } : {})); return items; });
    A.saveSettings(); closeSheet(); toast('¡Ya está a la venta!'); A.render();
  } catch (e) { giveItem(Object.assign({}, x, { d: null })); A.saveSettings(); toast('No pude ponerlo, intenta de nuevo'); }
};
ACT.mkTake = async a => {
  let got = null;
  try { await save(items => { const i = items.findIndex(x => x.id === a.dataset.id); if (i >= 0) { got = items[i]; items.splice(i, 1); } return items; }); } catch (e) { return toast('No pude quitarlo ahora'); }
  if (got) { giveItem(got); A.saveSettings(); toast('Guardado otra vez en tu cuarto'); } else toast('Ese ya se vendió'); closeSheet(); await load(true);
};
// icono del menú: un puestito con toldo
(function () {
  Pix.define('mercadito', { raw: ['..000000000000..', '.01122112211220.', '0112211221122110', '0222222222222220', '.03..........30.', '.03.44.66.55.30.', '.03.44.66.55.30.', '.07777777777770.'], pal: '#5a3a3a,#ff8fb3,#fff6e6,#c08a5a,#ffd84a,#7cc2f5,#8fd45a,#7a4a2c' });
  Object.values(A.PACKS || {}).forEach(p => { if (p.map) p.map.mercadito = p === A.PACKS.pixel ? 's:mercadito' : 's:estudio'; });
})();
})();
