// ================= Tiendita en pestañas: Colecciones (con tu mascota de modelo), Ropa, Cajitas y Deseos =================
(function () {
const A = App, S = A.S, { $, esc, toast } = A, ACT = A.ACTIONS;
const spr = (n, k) => Pix.sprite(n, k || 3);
const ST = s => `<img class="pixel" alt="" src="${spr('estrellita', 3)}" style="width:${s}px;height:auto;vertical-align:-3px">`;
const wish = () => { const l = S.settings.wish; return Array.isArray(l) ? l : (S.settings.wish = []); };
const bought = id => ((S.settings.rincon || {}).owned || []).includes('acc:' + id);
const ownedAcc = id => A.isPlus() || ((S.settings.rincon || {}).owned || []).includes('acc:' + id);
const bal = () => (A.rinconBalance ? A.rinconBalance() : 0);
const buyable = () => Object.entries(A.ACC || {}).filter(([id, a]) => !a.off && !a.plus && !ownedAcc(id));
const activePet = () => (A.petActive && A.petActive()) || 'gochi';

// ---------- colores y estilo de cada colección ----------
const PALS = [['#e0577f', '#f7a6c0', '#ffd6e2'], ['#5fa7d6', '#a9d3f2', '#e1f1fc'], ['#6cb38a', '#a6dcbc', '#e3f5ea'], ['#e6a23c', '#f5c97c', '#fff1d4'], ['#8a6fd1', '#bfaef0', '#efe9ff'], ['#e07b5f', '#f4b29d', '#ffe6dc']];
const DEF = { halloween: ['#5b4791', '#a27fd6', '#f6b07a'], navidad: ['#c8475f', '#e98a8f', '#5fa77a'], valentin: ['#e0577f', '#f7a6c0', '#ffd6e2'] };
const colorsOf = se => { if (se.c1) return [se.c1, se.c2 || se.c1, se.c3 || '#ffffff']; if (DEF[se.id]) return DEF[se.id]; let h = 0; String(se.id).split('').forEach(c => h = (h * 31 + c.charCodeAt(0)) >>> 0); return PALS[h % PALS.length]; };
const daysLeft = se => (A.seasonDaysLeft ? A.seasonDaysLeft(se) : 0);

// ---------- la mascota de modelo ----------
function modelArt(pet, ids, sc) {
  const an = A.ANCH[pet]; const base = `<img class="pixel mz-base" alt="" src="${spr(an ? an.sprite : ((A.petInfo && A.petInfo(pet)) || {}).sprite || pet, sc)}">`;
  if (!an) return `<span class="mz" style="animation:none">${base}</span>`;
  const eq = ((S.settings.rincon || {}).equip || {})[pet];
  const layers = ids.filter(id => A.ACC[id]).map(id => { const a = A.ACC[id]; return `<img class="pixel mz-acc" alt="" src="${spr('acc_' + id, sc)}" style="${A.accStyle(A.accPlace(an, a, a.slot, id, eq))}">`; }).join('');
  return `<span class="mz" style="animation:none">${base}${layers}</span>`;
}
// lo que lleva puesto: lo que tocaste para probar o, si no, la primera prenda de cada lugar (automático)
function outfit(se) {
  const t = (S.seTry || {})[se.id]; if (t && Object.keys(t).length) return Object.values(t);
  const bySlot = {}; se.items.filter(k => k.startsWith('acc:')).forEach(k => { const a = A.ACC[k.slice(4)]; if (a && !bySlot[a.slot]) bySlot[a.slot] = k.slice(4); });
  return Object.values(bySlot);
}
const seasonPets = se => (se.petsIds || []).filter(k => A.ANCH[k]);
const modelOf = se => { const sp = seasonPets(se), pick = (S.seModel || {})[se.id]; if (pick && (sp.includes(pick) || !sp.length)) return pick; if (se.model && se.model !== 'active' && A.ANCH[se.model]) return se.model; return sp[0] || activePet(); };

function seasonCard(se, up) {
  const [c1, c2, c3] = colorsOf(se); const days = up ? 0 : daysLeft(se); const pet = modelOf(se); const worn = outfit(se); const tried = (S.seTry || {})[se.id] || {};
  const sp = seasonPets(se); const pets = sp;
  const toBuy = up ? [] : worn.filter(id => A.ACC[id] && !ownedAcc(id) && !A.ACC[id].plus);
  const total = toBuy.reduce((t, id) => t + (A.ACC[id].price || 0), 0);
  const item = k => {
    const [kind, id] = k.split(':');
    if (kind !== 'acc') return A.seasonItem ? A.seasonItem(k) : '';
    const a = A.ACC[id]; if (!a) return ''; const own = ownedAcc(id); const on = tried[a.slot] === id;
    return `<button class="se-item sx-it ${on ? 'on' : ''}" data-act="seTry" data-se="${esc(se.id)}" data-id="${id}"><img class="pixel" alt="" src="${spr('acc_' + id, 4)}" style="width:${Math.min(52, a.w * 4)}px"><b>${esc(a.name)}</b>${own ? '<span class="tag">Tuyo</span>' : `<span class="se-price">${ST(12)} ${a.price}</span>`}</button>`;
  };
  const size = { s: 96, m: 120, l: 150 }[se.size || 'm'];
  return `<section class="sx sx-p-${se.pat || 'puntos'}" style="--se1:${c1};--se2:${c2};--se3:${c3}">
<div class="sx-top"><span class="sx-badge">${up ? 'Próximamente · ' + (up === 1 ? 'mañana' : 'en ' + up + ' días') : esc(se.badge || 'Edición limitada') + (days ? ' · ' + (days === 1 ? 'último día' : days + ' días') : '')}</span><div class="sx-name">${esc(se.name)}</div><div class="sx-sub">${esc(se.sub || se.when || '')}</div></div>
${se.nomodel ? '' : `<div class="sx-stage" style="--mz:${size}px"><span class="sx-pod"></span>${modelArt(pet, worn, 6)}</div>
<div class="sx-who">${pets.length > 1 ? pets.map(k => `<button class="chip" data-act="seModel" data-se="${esc(se.id)}" data-id="${k}" aria-pressed="${k === pet}">${esc(A.ANCH[k].name)}</button>`).join('') : ''}</div>
${toBuy.length ? `<div class="sx-buy"><span>Probando: <b>${toBuy.map(id => esc(A.ACC[id].name)).join(' + ')}</b></span>${toBuy.map(id => `<button class="btn sm pink" data-act="shopItem" data-id="${id}" ${bal() < A.ACC[id].price ? 'disabled' : ''}>${bal() < A.ACC[id].price ? 'Faltan ' + (A.ACC[id].price - bal()) + ' ' : 'Comprar '}${ST(11)}</button>`).join('')}</div>` : ''}
${Object.keys(tried).length ? `<button class="btn sm sx-clear" data-act="seTryClear" data-se="${esc(se.id)}">Quitar lo probado</button>` : ''}`}
<div class="sx-shelf">${se.items.map(item).join('')}</div>
<div class="sx-hint">${up ? 'Todavía no abre. Pruébate las prendas mientras llega.' : 'Toca una prenda para probársela a ' + esc((A.ANCH[pet] || {}).name || 'la mascota') + ' ›'}</div></section>`;
}
ACT.seTry = a => { S.seTry = S.seTry || {}; const t = S.seTry[a.dataset.se] = S.seTry[a.dataset.se] || {}; const ac = A.ACC[a.dataset.id]; if (!ac) return; t[ac.slot] === a.dataset.id ? delete t[ac.slot] : (t[ac.slot] = a.dataset.id); A.render(); };
ACT.seTryClear = a => { (S.seTry = S.seTry || {})[a.dataset.se] = {}; A.render(); };
ACT.seModel = a => { (S.seModel = S.seModel || {})[a.dataset.se] = a.dataset.id; A.render(); };

// ---------- destacado y deseos ----------
function dayPick() { const L = buyable(); if (!L.length) return null; const d = new Date(); let h = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate(); h = (h * 2654435761) >>> 0; return L[h % L.length]; }
function destacado() {
  const dp = dayPick(); if (!dp) return '';
  return `<div class="vt-dest"><span class="vt-art"><img class="pixel" alt="" src="${spr('acc_' + dp[0], 4)}" style="width:${Math.min(56, dp[1].w * 4)}px"></span><span class="vt-tx"><span class="vt-k">Destacado de hoy</span><b>${esc(dp[1].name)}</b><span class="faint">${ST(12)} ${dp[1].price} estrellitas</span></span><button class="btn sm pink" data-act="shDest" data-id="${dp[0]}">Ver</button></div>`;
}
function wishHTML() {
  const b = bal(); const w = wish().map(id => [id, (A.ACC || {})[id]]).filter(([id, a]) => a && !bought(id));
  if (!w.length) return `<div class="vt-wish empty"><b>Mi lista de deseos</b><span class="faint">Toca el corazoncito de cualquier prenda para guardarla aquí y ver cuánto te falta.</span></div>`;
  return `<div class="vt-wish"><div class="vt-h"><b>Mi lista de deseos</b><span class="faint">${w.length} ${w.length === 1 ? 'cosa' : 'cosas'}</span></div>${w.map(([id, a]) => { const p = Math.min(1, b / a.price); const ok = b >= a.price; return `<div class="vt-row"><img class="pixel" alt="" src="${spr('acc_' + id, 3)}" style="width:${Math.min(40, a.w * 3)}px"><span class="vt-tx"><b>${esc(a.name)}</b><span class="vt-bar"><i style="width:${Math.round(p * 100)}%"></i></span><span class="faint">${ok ? '¡Ya te alcanza!' : 'Te faltan ' + (a.price - b) + ' estrellitas'}</span></span>${ok ? `<button class="btn sm pink" data-act="shopItem" data-id="${id}">Comprar</button>` : `<button class="iconbtn sm" data-act="wishToggle" data-id="${id}" aria-label="Quitar de la lista">✕</button>`}</div>`; }).join('')}</div>`;
}

// ---------- lo nuevo (lo último que agregó la tienda, para todos) ----------
const daysTo = se => { const t = new Date(), t0 = new Date(t.getFullYear(), t.getMonth(), t.getDate()); let d = new Date(t.getFullYear(), +se.from.slice(0, 2) - 1, +se.from.slice(3)); if (d < t0) d = new Date(t.getFullYear() + 1, +se.from.slice(0, 2) - 1, +se.from.slice(3)); return Math.round((d - t0) / 864e5); };
function newest() {
  const c = (A.CFG && A.CFG.catalog) || {}; const today = A.today ? A.today() : ''; const out = [];
  const add = (kind, pfx, list) => (list || []).forEach((x, i) => { if (!x || x.off || (x.from && x.from > today)) return; const k = kind + ':' + pfx + x.id; if (kind === 'acc' && !(A.ACC || {})[pfx + x.id]) return; if (kind === 'pet' && !A.allPets()[pfx + x.id]) return; out.push({ k, t: x.added || 0, i }); });
  add('acc', 'cc_', c.clothes); add('furn', 'cf_', c.furn); add('pet', 'cp_', c.pets);
  const recent = out.filter(o => o.t && Date.now() - o.t < 30 * 864e5).sort((a, b) => b.t - a.t);
  if (recent.length >= 4) return recent.slice(0, 10);
  const rest = out.filter(o => !recent.includes(o)).sort((a, b) => b.i - a.i).slice(0, 10 - recent.length);
  return recent.concat(rest);
}
function nuevoHTML() {
  const L = newest(); if (!L.length) return '';
  const tile = o => { const [kind, id] = o.k.split(':'); if (kind !== 'acc') return A.seasonItem ? A.seasonItem(o.k).replace('class="se-item', 'class="se-item sx-it') : ''; const a = A.ACC[id]; const own = ownedAcc(id); return `<button class="se-item sx-it nw" data-act="${own ? 'shDest' : 'shopItem'}" data-id="${id}"><i class="nw-r">${o.t && Date.now() - o.t < 14 * 864e5 ? 'NUEVO' : 'reciente'}</i><img class="pixel" alt="" src="${spr('acc_' + id, 4)}" style="width:${Math.min(52, a.w * 4)}px"><b>${esc(a.name)}</b>${own ? '<span class="tag">Tuyo</span>' : `<span class="se-price">${ST(12)} ${a.price}</span>`}</button>`; };
  return `<section class="nw-sec"><div class="nw-h"><b>Lo nuevo</b><span>Recién llegado a la tienda</span></div><div class="sx-shelf nw-shelf">${L.map(tile).join('')}</div></section>`;
}
function categorias() {
  const A_ = Object.entries(A.ACC || {}).filter(([, a]) => !a.off);
  const rows = [['head', 'Cabeza'], ['face', 'Cara'], ['neck', 'Cuello']].map(([sl, n]) => { const l = A_.filter(([, a]) => a.slot === sl); const f = l.find(([id]) => !ownedAcc(id)) || l[0]; return `<button class="cat-tile" data-act="shGoSec" data-v="${sl}">${f ? `<img class="pixel" alt="" src="${spr('acc_' + f[0], 4)}" style="width:${Math.min(48, f[1].w * 4)}px">` : ''}<b>${n}</b><span>${l.length} cosas</span></button>`; });
  rows.push(`<button class="cat-tile" data-act="shGoSec" data-v="mas"><img class="pixel" alt="" src="${spr('estrellita', 4)}" style="width:40px"><b>Más cositas</b><span>y sorpresas</span></button>`);
  return `<section class="nw-sec"><div class="nw-h"><b>Pasillos</b><span>Entra por donde quieras</span></div><div class="cat-grid">${rows.join('')}</div></section>`;
}
ACT.shGoSec = a => { S.shopTab = 'ropa'; S.shopSec = a.dataset.v; A.render(); window.scrollTo(0, 0); };

// ---------- al tocar algo sin comprar: ficha con Comprar y Guardar en deseos ----------
const si0 = ACT.shopItem;
ACT.shopItem = a => {
  const id = a.dataset.id, it = (A.ACC || {})[id];
  if (!it || a.dataset.sure || it.plus || !(it.price > 0) || ownedAcc(id)) return si0(a);
  const sheetBuy = () => { const bal0 = bal(); return { bal0, ok: bal0 >= it.price }; };
  const draw = sh => {
    const { bal0, ok } = sheetBuy(); const on = wish().includes(id);
    sh.innerHTML = `<div class="stack" style="text-align:center"><div class="buy-art"><img class="pixel" alt="" src="${spr('acc_' + id, 6)}" style="width:${Math.min(96, it.w * 6)}px"></div><b style="font-size:18px">${esc(it.name)}</b><div class="faint">${ST(13)} ${it.price} estrellitas · tienes ${bal0}</div>
<button class="btn pink" id="byGo" style="justify-content:center" ${ok ? '' : 'disabled'}>${ok ? 'Comprar por ' + it.price : 'Te faltan ' + (it.price - bal0) + ' estrellitas'}</button>
<button class="btn" id="byGift" style="justify-content:center">🎁 Regalarlo a una amistad</button>
<button class="btn" id="byWish" style="justify-content:center;gap:8px"><img class="pixel" alt="" src="${spr('heart', 3)}" style="width:18px;height:auto;${on ? '' : 'filter:grayscale(1);opacity:.55'}">${on ? 'Está en tu lista de deseos · quitar' : 'Guardar en mi lista de deseos'}</button>
<button class="btn" id="byNo" style="justify-content:center">Ahora no</button></div>`;
    sh.querySelector('#byGo').onclick = () => { A.closeSheet(); si0({ dataset: { id, sure: '1' }, querySelector: () => ({}) }); };
    sh.querySelector('#byWish').onclick = () => { const l = wish(), i = l.indexOf(id); if (i >= 0) l.splice(i, 1); else if (l.length < 12) l.push(id); else return toast('Tu lista tiene espacio para 12 deseos'); A.saveSettings(); toast(i >= 0 ? 'Quitado de tu lista' : 'Guardado en tu lista de deseos'); draw(sh); A.render && 0; };
    sh.querySelector('#byGift').onclick = () => { A.closeSheet(); setTimeout(() => A.giftAccPick && A.giftAccPick(id), 60); };
    sh.querySelector('#byNo').onclick = () => { A.closeSheet(); A.render(); };
  };
  A.openSheet(it.name, '<div id="byBox"></div>', sh => draw(sh.querySelector('#byBox')));
};

// ---------- la pantalla en pestañas ----------
const t0 = A.screens.tienda;
A.screens.tienda = () => {
  const h = t0(); const aw = h.indexOf('<div class="awning"'); const si = h.indexOf('class="shop-sign"');
  if (aw < 0 || si < 0) return h;
  const head = h.slice(0, aw); const front = h.slice(aw, h.indexOf('</div>', si) + 6); const rest = h.slice(h.indexOf('</div>', si) + 6);
  const s0 = rest.indexOf('<div class="seg" style="overflow-x:auto">'); if (s0 < 0) return h;
  const extras = rest.slice(0, s0), after = rest.slice(s0);
  const sS = after.lastIndexOf('<div class="seg">'); const probador = after.slice(0, sS), catalog = after.slice(sS);
  const bi = extras.search(/<div class="bx-shelf"|<button class="card bx-empty"/), di = extras.indexOf('<details class="card se-next"');
  const boxes = bi >= 0 ? extras.slice(bi, di >= 0 ? di : undefined) : ''; const next = di >= 0 ? extras.slice(di) : '';
  const seasons = A.allSeasons().filter(s => A.inSeason(s.id) && s.items.length);
  const tabs = [['col', 'Colecciones'], ['ropa', 'Ropa'], ...(boxes ? [['caj', 'Cajitas']] : []), ['des', 'Deseos' + (wish().length ? ' ' + wish().length : '')]];
  const tab = tabs.some(t => t[0] === S.shopTab) ? S.shopTab : (seasons.length ? 'col' : 'ropa');
  let body = '';
  if (tab === 'col') { let up = ''; if (!seasons.length) { const n = A.allSeasons().filter(x => !A.inSeason(x.id) && x.items.length).sort((a, b) => daysTo(a) - daysTo(b))[0]; if (n) up = seasonCard(n, daysTo(n) || 1); } body = nuevoHTML() + (A.dealsHTML ? A.dealsHTML() : destacado()) + seasons.map(x => seasonCard(x)).join('') + up + categorias() + next; }
  else if (tab === 'ropa') body = probador + catalog;
  else if (tab === 'caj') body = boxes;
  else body = wishHTML() + destacado();
  return `${head}<div class="shopfront">${front}</div><div class="shop-wrap"><div class="shop-in"><div class="shop-tabs">${tabs.map(([k, n]) => `<button data-act="shopTab" data-v="${k}" aria-pressed="${k === tab}">${esc(n)}</button>`).join('')}</div>${body}</div><div class="shop-floor"></div></div>`;
};
ACT.shopTab = a => { S.shopTab = a.dataset.v; A.render(); window.scrollTo(0, 0); };
ACT.wishToggle = a => { const id = a.dataset.id, l = wish(), i = l.indexOf(id); if (i >= 0) l.splice(i, 1); else { if (l.length >= 12) return toast('Tu lista tiene espacio para 12 deseos'); l.push(id); toast('Guardado en tu lista de deseos'); } A.saveSettings(); A.render(); };
ACT.shDest = a => { const x = (A.ACC || {})[a.dataset.id]; if (!x) return; S.shopTab = 'ropa'; S.shopSec = x.slot; A.render(); setTimeout(() => { const el = document.querySelector(`.shop-tile[data-id="${a.dataset.id}"]`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }); el.classList.add('pulse'); } }, 80); };
const af0 = A.after.tienda;
A.after.tienda = el => {
  if (af0) af0(el);
  const l = wish();
  el.querySelectorAll('.shop-tile[data-id]').forEach(t => {
    const id = t.dataset.id; if (bought(id) || t.querySelector('.wish-h')) return;
    const h = document.createElement('span'); h.className = 'wish-h' + (l.includes(id) ? ' on' : ''); h.dataset.act = 'wishToggle'; h.dataset.id = id; h.setAttribute('role', 'button'); h.setAttribute('aria-label', l.includes(id) ? 'Quitar de mi lista de deseos' : 'Guardar en mi lista de deseos'); h.innerHTML = `<img class="pixel" alt="" src="${spr('heart', 3)}" style="width:20px;height:auto">`;
    t.appendChild(h);
  });
};


// ---------- lo nuevo va primero en todos los estantes (ropa, muebles, comida...) ----------
const KMAP = { cc_: 'clothes', cf_: 'furn', cp_: 'pets', cfo_: 'food', cw_: 'walls', cl_: 'floors' };
function newestFirst(el) {
  const c = (A.CFG && A.CFG.catalog) || {}; const info = {};
  Object.entries(KMAP).forEach(([pfx, kind]) => (c[kind] || []).forEach((x, i) => { info[pfx + x.id] = { t: x.added || 0, i }; }));
  el.querySelectorAll('.shop-grid, .fr-shop, .shop-shelf').forEach(g => {
    const tiles = [...g.children].filter(t => t.classList && t.classList.contains('shop-tile')); if (tiles.length < 2) return;
    const key = t => { const id = t.dataset.id || t.dataset.k || t.dataset.buyfood || t.dataset.ff || ''; return info[id.replace(/^(acc|furn|food):/, '')] || info[id] || null; };
    const rank = tiles.map((t, n) => ({ t, n, k: key(t) }));
    const sorted = rank.slice().sort((a, b) => (a.k && !b.k) ? -1 : (!a.k && b.k) ? 1 : (a.k && b.k) ? ((b.k.t - a.k.t) || (b.k.i - a.k.i)) : a.n - b.n);
    if (sorted.some((r, i) => r !== rank[i])) sorted.forEach(r => g.appendChild(r.t));
    sorted.forEach(r => { if (r.k && r.k.t && Date.now() - r.k.t < 14 * 864e5 && !r.t.querySelector('.nw-r')) { const b = document.createElement('i'); b.className = 'nw-r'; b.textContent = 'NUEVO'; r.t.appendChild(b); r.t.style.position = 'relative'; } });
  });
}
['tienda', 'rincon', 'cuarto'].forEach(r => { const f0 = A.after[r]; A.after[r] = el => { if (f0) f0(el); try { newestFirst(el); } catch (e) { console.warn(e); } }; });

// ---------- temporadas: nombre, texto, colores, fondo, modelo y fechas editables ----------
const as0 = A.allSeasons;
A.allSeasons = () => {
  const c = (A.CFG && A.CFG.catalog) || {}; const st = c.seStyle || {};
  return as0().map(se => {
    const pets = (c.pets || []).filter(x => x.how === 'temporada' && x.season === se.id && !x.off).map(x => 'pet:cp_' + x.id);
    const o = st[se.id] || {};
    return Object.assign({}, se, { items: se.items.concat(pets), petsIds: pets.map(k => k.slice(4)), name: o.name || se.name, sub: o.sub || '', badge: o.badge || '', c1: o.c1 || '', c2: o.c2 || '', c3: o.c3 || '', pat: o.pat || 'puntos', model: o.model || 'active', size: o.size || 'm', nomodel: !!o.nomodel });
  });
};
ACT.seStyle = a => {
  const id = a.dataset.id; const se = A.allSeasons().find(x => x.id === id); if (!se) return;
  const [c1, c2, c3] = colorsOf(se);
  const raw = ((A.CFG.catalog || {}).seasons || []).find(x => x.id === id);
  const pk = Object.entries(A.ANCH);
  const opt = (v, l, cur) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${l}</option>`;
  A.openSheet('Diseño de ' + se.name, `<div class="stack"><section class="sx sx-p-${se.pat}" id="sePrev" style="--se1:${c1};--se2:${c2};--se3:${c3}"><div class="sx-top"><span class="sx-badge">${esc(se.badge || 'Edición limitada')}</span><div class="sx-name">${esc(se.name)}</div><div class="sx-sub">${esc(se.sub || 'Solo por esta temporada')}</div></div></section>
<label class="f">Nombre<input class="in" id="ssName" maxlength="30" value="${esc(se.name)}"></label>
<label class="f">Etiqueta de arriba<input class="in" id="ssBadge" maxlength="24" value="${esc(se.badge || '')}" placeholder="Edición limitada"></label>
<label class="f">Texto debajo del nombre<input class="in" id="ssSub" maxlength="50" value="${esc(se.sub || '')}" placeholder="Solo por esta temporada"></label>
<div class="row" style="gap:10px"><label class="f" style="flex:1">Fuerte<input type="color" class="in" id="ssC1" value="${c1}" style="height:44px;padding:2px"></label><label class="f" style="flex:1">Suave<input type="color" class="in" id="ssC2" value="${c2}" style="height:44px;padding:2px"></label><label class="f" style="flex:1">Claro<input type="color" class="in" id="ssC3" value="${c3}" style="height:44px;padding:2px"></label></div>
<div class="row" style="gap:10px"><label class="f" style="flex:1">Fondo<select class="in" id="ssPat">${[['puntos', 'Puntitos'], ['rayas', 'Rayas'], ['estrellas', 'Estrellas'], ['liso', 'Liso']].map(([v, l]) => opt(v, l, se.pat)).join('')}</select></label><label class="f" style="flex:1">Tamaño del modelo<select class="in" id="ssSize">${[['s', 'Chico'], ['m', 'Mediano'], ['l', 'Grande']].map(([v, l]) => opt(v, l, se.size)).join('')}</select></label></div>
<label class="f">Quién modela<select class="in" id="ssModel">${opt('active', 'La mascota de la temporada (o la del usuario si no hay)', se.model)}${pk.map(([k, an]) => opt(k, an.name, se.model)).join('')}</select></label>
<label class="check"><input type="checkbox" id="ssNoModel" ${se.nomodel ? 'checked' : ''}> No mostrar mascota modelo (solo las cosas)</label>
${raw ? `<div class="row" style="gap:10px"><label class="f" style="flex:1">Desde<input class="in" id="ssFrom" type="date" value="${new Date().getFullYear()}-${raw.from}"></label><label class="f" style="flex:1">Hasta<input class="in" id="ssTo" type="date" value="${new Date().getFullYear()}-${raw.to}"></label></div>` : ''}
<p class="faint" style="margin:0">Todo lo que agregues con "Qué temporada" = esta colección (ropa, muebles y personajes) sale solo en su tarjeta, y la mascota lo modela sola. Cuando llegan las fechas, la colección se abre sola.</p>
<div class="row" style="gap:8px"><button class="btn" id="ssReset" style="flex:1;justify-content:center">Restablecer</button><button class="btn pink" id="ssSave" style="flex:1;justify-content:center">Guardar</button></div></div>`, sh => {
    const upd = () => { const p = sh.querySelector('#sePrev'); if (!p) return; p.style.setProperty('--se1', $('#ssC1', sh).value); p.style.setProperty('--se2', $('#ssC2', sh).value); p.style.setProperty('--se3', $('#ssC3', sh).value); p.className = 'sx sx-p-' + $('#ssPat', sh).value; p.querySelector('.sx-name').textContent = $('#ssName', sh).value || se.name; p.querySelector('.sx-sub').textContent = $('#ssSub', sh).value || 'Solo por esta temporada'; p.querySelector('.sx-badge').textContent = $('#ssBadge', sh).value || 'Edición limitada'; };
    sh.addEventListener('input', upd); sh.addEventListener('change', upd);
    $('#ssSave', sh).onclick = () => {
      A.CFG.catalog = A.CFG.catalog || {}; const st = A.CFG.catalog.seStyle = A.CFG.catalog.seStyle || {};
      st[id] = { name: $('#ssName', sh).value.trim(), badge: $('#ssBadge', sh).value.trim(), sub: $('#ssSub', sh).value.trim(), c1: $('#ssC1', sh).value, c2: $('#ssC2', sh).value, c3: $('#ssC3', sh).value, pat: $('#ssPat', sh).value, size: $('#ssSize', sh).value, model: $('#ssModel', sh).value, nomodel: $('#ssNoModel', sh).checked };
      if (raw) { const f = $('#ssFrom', sh), t = $('#ssTo', sh); if (f && f.value) raw.from = f.value.slice(5); if (t && t.value) raw.to = t.value.slice(5); }
      S.seasOpen = true; A.closeSheet(); A.saveCatalog();
    };
    $('#ssReset', sh).onclick = () => { if (A.CFG.catalog && A.CFG.catalog.seStyle) delete A.CFG.catalog.seStyle[id]; S.seasOpen = true; A.closeSheet(); A.saveCatalog(); };
  });
};


// ---------- que no se reinicie nada al comprar o probar: se queda en el mismo lugar ----------
{
  const r0 = A.render; let last = '';
  A.render = function () {
    const same = S.route === 'tienda' && !!document.querySelector('#scr .shop-in');
    const y = window.scrollY, sh = same ? [...document.querySelectorAll('.shop-grid, .sx-shelf')].map(e => e.scrollLeft) : null;
    const out = r0.apply(this, arguments); last = S.route;
    if (same) { window.scrollTo(0, y); [...document.querySelectorAll('.shop-grid, .sx-shelf')].forEach((e, i) => { if (sh[i]) e.scrollLeft = sh[i]; }); }
    return out;
  };
}
})();
