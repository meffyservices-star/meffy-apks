// ================= Tiendita en pestañas: Colecciones (con tu mascota de modelo), Ropa, Cajitas y Deseos =================
(function () {
const A = App, S = A.S, { $, esc, toast } = A, ACT = A.ACTIONS;
const spr = (n, k) => Pix.sprite(n, k || 3);
const ST = s => `<img class="pixel" alt="" src="${spr('estrellita', 3)}" style="width:${s}px;height:auto;vertical-align:-3px">`;
const wish = () => { const l = S.settings.wish; return Array.isArray(l) ? l : (S.settings.wish = []); };
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
const modelOf = se => (S.seModel || {})[se.id] || (se.model && se.model !== 'active' ? se.model : activePet());

function seasonCard(se) {
  const [c1, c2, c3] = colorsOf(se); const days = daysLeft(se); const pet = modelOf(se); const worn = outfit(se); const tried = (S.seTry || {})[se.id] || {};
  const pets = Object.keys(A.ANCH).filter(k => !A.petOwns || A.petOwns(k) || k === pet);
  const toBuy = worn.filter(id => A.ACC[id] && !ownedAcc(id) && !A.ACC[id].plus);
  const total = toBuy.reduce((t, id) => t + (A.ACC[id].price || 0), 0);
  const item = k => {
    const [kind, id] = k.split(':');
    if (kind !== 'acc') return A.seasonItem ? A.seasonItem(k) : '';
    const a = A.ACC[id]; if (!a) return ''; const own = ownedAcc(id); const on = tried[a.slot] === id;
    return `<button class="se-item sx-it ${on ? 'on' : ''}" data-act="seTry" data-se="${esc(se.id)}" data-id="${id}"><img class="pixel" alt="" src="${spr('acc_' + id, 4)}" style="width:${Math.min(52, a.w * 4)}px"><b>${esc(a.name)}</b>${own ? '<span class="tag">Tuyo</span>' : `<span class="se-price">${ST(12)} ${a.price}</span>`}</button>`;
  };
  const size = { s: 120, m: 150, l: 190 }[se.size || 'm'];
  return `<section class="sx sx-p-${se.pat || 'puntos'}" style="--se1:${c1};--se2:${c2};--se3:${c3}">
<div class="sx-top"><span class="sx-badge">${esc(se.badge || 'Edición limitada')}${days ? ' · ' + (days === 1 ? 'último día' : days + ' días') : ''}</span><div class="sx-name">${esc(se.name)}</div><div class="sx-sub">${esc(se.sub || se.when || '')}</div></div>
${se.nomodel ? '' : `<div class="sx-stage" style="--mz:${size}px"><span class="sx-pod"></span>${modelArt(pet, worn, 6)}</div>
<div class="sx-who">${pets.length > 1 ? pets.map(k => `<button class="chip" data-act="seModel" data-se="${esc(se.id)}" data-id="${k}" aria-pressed="${k === pet}">${esc(A.ANCH[k].name)}</button>`).join('') : ''}</div>
${toBuy.length ? `<div class="sx-buy"><span>Lleva puesto: <b>${toBuy.map(id => esc(A.ACC[id].name)).join(', ')}</b></span>${toBuy.map(id => `<button class="btn sm pink" data-act="shopItem" data-id="${id}" ${bal() < A.ACC[id].price ? 'disabled' : ''}>${esc(A.ACC[id].name)} · ${A.ACC[id].price}</button>`).join('')}</div>` : ''}
${Object.keys(tried).length ? `<button class="btn sm sx-clear" data-act="seTryClear" data-se="${esc(se.id)}">Quitar lo probado</button>` : ''}`}
<div class="sx-shelf">${se.items.map(item).join('')}</div>
<div class="sx-hint">Toca una prenda para probársela a ${esc(((A.ANCH[pet] || {}).name) || 'tu mascota')} ›</div></section>`;
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
  const b = bal(); const w = wish().map(id => [id, (A.ACC || {})[id]]).filter(([id, a]) => a && !ownedAcc(id));
  if (!w.length) return `<div class="vt-wish empty"><b>Mi lista de deseos</b><span class="faint">Toca el corazón ♡ de cualquier prenda para guardarla aquí y ver cuánto te falta.</span></div>`;
  return `<div class="vt-wish"><div class="vt-h"><b>Mi lista de deseos</b><span class="faint">${w.length} ${w.length === 1 ? 'cosa' : 'cosas'}</span></div>${w.map(([id, a]) => { const p = Math.min(1, b / a.price); const ok = b >= a.price; return `<div class="vt-row"><img class="pixel" alt="" src="${spr('acc_' + id, 3)}" style="width:${Math.min(40, a.w * 3)}px"><span class="vt-tx"><b>${esc(a.name)}</b><span class="vt-bar"><i style="width:${Math.round(p * 100)}%"></i></span><span class="faint">${ok ? '¡Ya te alcanza!' : 'Te faltan ' + (a.price - b) + ' estrellitas'}</span></span>${ok ? `<button class="btn sm pink" data-act="shopItem" data-id="${id}">Comprar</button>` : `<button class="iconbtn sm" data-act="wishToggle" data-id="${id}" aria-label="Quitar de la lista">✕</button>`}</div>`; }).join('')}</div>`;
}

// ---------- la pantalla en pestañas ----------
const t0 = A.screens.tienda;
A.screens.tienda = () => {
  const h = t0(); const aw = h.indexOf('<div class="awning"'); const si = h.indexOf('class="shop-sign"');
  if (aw < 0 || si < 0) return h;
  const head = h.slice(0, aw); const rest = h.slice(h.indexOf('</div>', si) + 6);
  const s0 = rest.indexOf('<div class="seg" style="overflow-x:auto">'); if (s0 < 0) return h;
  const extras = rest.slice(0, s0), after = rest.slice(s0);
  const sS = after.lastIndexOf('<div class="seg">'); const probador = after.slice(0, sS), catalog = after.slice(sS);
  const bi = extras.search(/<div class="bx-shelf"|<button class="card bx-empty"/), di = extras.indexOf('<details class="card se-next"');
  const boxes = bi >= 0 ? extras.slice(bi, di >= 0 ? di : undefined) : ''; const next = di >= 0 ? extras.slice(di) : '';
  const seasons = A.allSeasons().filter(s => A.inSeason(s.id) && s.items.length);
  const tabs = [['col', 'Colecciones'], ['ropa', 'Ropa'], ...(boxes ? [['caj', 'Cajitas']] : []), ['des', 'Deseos' + (wish().length ? ' ' + wish().length : '')]];
  const tab = tabs.some(t => t[0] === S.shopTab) ? S.shopTab : (seasons.length ? 'col' : 'ropa');
  let body = '';
  if (tab === 'col') body = (seasons.length ? seasons.map(seasonCard).join('') : '<div class="card empty"><b>No hay una colección abierta ahora</b><div class="faint">Cuando empiece una temporada, aparece aquí sola con tu mascota de modelo.</div></div>') + destacado() + next;
  else if (tab === 'ropa') body = probador + catalog;
  else if (tab === 'caj') body = boxes;
  else body = wishHTML() + destacado();
  return `${head}<div class="seg shop-tabs">${tabs.map(([k, n]) => `<button data-act="shopTab" data-v="${k}" aria-pressed="${k === tab}">${esc(n)}</button>`).join('')}</div>${body}`;
};
ACT.shopTab = a => { S.shopTab = a.dataset.v; A.render(); window.scrollTo(0, 0); };
ACT.wishToggle = a => { const id = a.dataset.id, l = wish(), i = l.indexOf(id); if (i >= 0) l.splice(i, 1); else { if (l.length >= 12) return toast('Tu lista tiene espacio para 12 deseos'); l.push(id); toast('Guardado en tu lista de deseos'); } A.saveSettings(); A.render(); };
ACT.shDest = a => { const x = (A.ACC || {})[a.dataset.id]; if (!x) return; S.shopTab = 'ropa'; S.shopSec = x.slot; A.render(); setTimeout(() => { const el = document.querySelector(`.shop-tile[data-id="${a.dataset.id}"]`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }); el.classList.add('pulse'); } }, 80); };
const af0 = A.after.tienda;
A.after.tienda = el => {
  if (af0) af0(el);
  const l = wish();
  el.querySelectorAll('.shop-tile[data-id]').forEach(t => {
    const id = t.dataset.id; if (ownedAcc(id)) return;
    const h = document.createElement('span'); h.className = 'wish-h' + (l.includes(id) ? ' on' : ''); h.dataset.act = 'wishToggle'; h.dataset.id = id; h.setAttribute('role', 'button'); h.setAttribute('aria-label', l.includes(id) ? 'Quitar de mi lista de deseos' : 'Guardar en mi lista de deseos'); h.textContent = l.includes(id) ? '♥' : '♡';
    t.appendChild(h);
  });
};

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
<label class="f">Quién modela<select class="in" id="ssModel">${opt('active', 'La mascota de cada usuario', se.model)}${pk.map(([k, an]) => opt(k, an.name, se.model)).join('')}</select></label>
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

// ---------- aviso automático en Inicio cuando se abre una colección ----------
const h0 = A.after.home;
A.after.home = el => {
  if (h0) h0(el);
  try {
    const yr = new Date().getFullYear(); const seen = S.settings.seSeen = S.settings.seSeen || {};
    const se = A.allSeasons().find(s => A.inSeason(s.id) && s.items.length && !seen[s.id + '_' + yr]); if (!se) return;
    const [c1, c2] = colorsOf(se); const box = document.createElement('div');
    box.innerHTML = `<button class="card row sx-news" data-act="seOpenNews" data-id="${esc(se.id)}" style="--se1:${c1};--se2:${c2}"><span class="sx-news-art">${modelArt(modelOf(se), outfit(se), 3)}</span><span><b>¡Llegó ${esc(se.name)}!</b><br><span class="faint" style="color:#fff">Mira la colección con tu mascota de modelo</span></span></button>`;
    el.insertBefore(box.firstChild, el.children[1] || null);
  } catch (e) {}
};
ACT.seOpenNews = a => { const yr = new Date().getFullYear(); (S.settings.seSeen = S.settings.seSeen || {})[a.dataset.id + '_' + yr] = 1; A.saveSettings(); S.shopTab = 'col'; A.go('tienda'); };
})();
