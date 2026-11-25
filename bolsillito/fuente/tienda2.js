// ================= Tiendita: vitrina con saldo, destacado del día, lista de deseos y atajos =================
(function () {
const A = App, S = A.S, { $, esc, toast } = A, ACT = A.ACTIONS;
const spr = (n, k) => Pix.sprite(n, k || 3);
const ST = s => `<img class="pixel" alt="" src="${spr('estrellita', 3)}" style="width:${s}px;height:auto;vertical-align:-3px">`;
const wish = () => { const l = S.settings.wish; return Array.isArray(l) ? l : (S.settings.wish = []); };
const owned = id => A.isPlus() || ((A.roomState && A.rinconState ? A.rinconState().owned : null) || (S.settings.rincon || {}).owned || []).includes('acc:' + id);
const bal = () => (A.rinconBalance ? A.rinconBalance() : 0);
const buyable = () => Object.entries(A.ACC || {}).filter(([id, a]) => !a.off && !a.plus && !owned(id));
function dayPick() {
  const L = buyable(); if (!L.length) return null;
  const d = new Date(); let h = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate(); h = (h * 2654435761) >>> 0;
  return L[h % L.length];
}
function vitrina() {
  const b = bal(); const dp = dayPick();
  const w = wish().map(id => [id, (A.ACC || {})[id]]).filter(([id, a]) => a && !owned(id));
  const next = w.length ? w.slice().sort((x, y) => x[1].price - y[1].price)[0] : null;
  const dest = dp ? `<div class="vt-dest"><span class="vt-art">${`<img class="pixel" alt="" src="${spr('acc_' + dp[0], 4)}" style="width:${Math.min(60, dp[1].w * 4)}px">`}</span><span class="vt-tx"><span class="vt-k">Destacado de hoy</span><b>${esc(dp[1].name)}</b><span class="faint">${ST(12)} ${dp[1].price} estrellitas</span></span><button class="btn sm pink" data-act="shDest" data-id="${dp[0]}">Ver</button></div>` : '';
  const wl = w.length ? `<div class="vt-wish" id="sh-wish"><div class="vt-h"><b>Mi lista de deseos</b><span class="faint">${w.length} ${w.length === 1 ? 'cosa' : 'cosas'}</span></div>${w.map(([id, a]) => { const p = Math.min(1, b / a.price); const ok = b >= a.price; return `<div class="vt-row"><img class="pixel" alt="" src="${spr('acc_' + id, 3)}" style="width:${Math.min(40, a.w * 3)}px"><span class="vt-tx"><b>${esc(a.name)}</b><span class="vt-bar"><i style="width:${Math.round(p * 100)}%"></i></span><span class="faint">${ok ? '¡Ya te alcanza!' : 'Te faltan ' + (a.price - b) + ' estrellitas'}</span></span>${ok ? `<button class="btn sm pink" data-act="shopItem" data-id="${id}">Comprar</button>` : `<button class="iconbtn sm" data-act="wishToggle" data-id="${id}" aria-label="Quitar de la lista">✕</button>`}</div>`; }).join('')}</div>` : `<div class="vt-wish empty" id="sh-wish"><b>Mi lista de deseos</b><span class="faint">Toca el corazón de cualquier cosa para guardarla y ver cuánto te falta.</span></div>`;
  return `<div class="vit"><div class="vt-top"><div class="vt-bal"><span class="vt-k">Tus estrellitas</span><b>${ST(24)} ${b}</b>${next ? `<span class="faint">Siguiente deseo: ${esc(next[1].name)} (${next[1].price})</span>` : '<span class="faint">Ganas más anotando y cerrando el día</span>'}</div></div>
<div class="vt-nav"><button data-shgo=".probador">Probador</button><button data-shgo="#shopsec">Ropa y accesorios</button><button data-shgo=".se-mini,.se-hero,.se-next">Temporada</button><button data-shgo="#sh-wish">Deseos</button></div>${dest}${wl}</div>`;
}
const t0 = A.screens.tienda;
A.screens.tienda = () => {
  const h = t0(); const i = h.indexOf('class="shop-sign"'); if (i < 0) return h;
  const j = h.indexOf('</div>', i) + 6;
  const k = h.lastIndexOf('<div class="seg">');
  let out = h.slice(0, j) + vitrina() + h.slice(j);
  const k2 = out.lastIndexOf('<div class="seg">'); if (k2 > 0) out = out.slice(0, k2) + '<span id="shopsec"></span>' + out.slice(k2);
  return out;
};
ACT.wishToggle = a => { const id = a.dataset.id, l = wish(), i = l.indexOf(id); if (i >= 0) l.splice(i, 1); else { if (l.length >= 12) return toast('Tu lista tiene espacio para 12 deseos'); l.push(id); toast('Guardado en tu lista de deseos'); } A.saveSettings(); A.render(); };
ACT.shDest = a => { const x = (A.ACC || {})[a.dataset.id]; if (!x) return; S.shopSec = x.slot; A.render(); setTimeout(() => { const el = document.querySelector(`.shop-tile[data-id="${a.dataset.id}"]`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('pulse'); } }, 80); };
const af0 = A.after.tienda;
A.after.tienda = el => {
  if (af0) af0(el);
  el.querySelectorAll('[data-shgo]').forEach(b => { b.onclick = () => { const t = el.querySelector(b.dataset.shgo); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }; });
  const l = wish();
  el.querySelectorAll('.shop-tile[data-id]').forEach(t => {
    const id = t.dataset.id; if (owned(id)) return;
    const h = document.createElement('span'); h.className = 'wish-h' + (l.includes(id) ? ' on' : ''); h.dataset.act = 'wishToggle'; h.dataset.id = id; h.setAttribute('role', 'button'); h.setAttribute('aria-label', l.includes(id) ? 'Quitar de mi lista de deseos' : 'Guardar en mi lista de deseos'); h.textContent = l.includes(id) ? '♥' : '♡';
    t.appendChild(h);
  });
};
})();

// ================= Temporadas: diseño editable (nombre, texto, colores) y personajes de cada colección =================
(function () {
const A = App, S = A.S, { $, esc, toast } = A, ACT = A.ACTIONS;
const as0 = A.allSeasons;
A.allSeasons = () => {
  const c = (A.CFG && A.CFG.catalog) || {}; const st = c.seStyle || {};
  return as0().map(se => {
    const pets = (c.pets || []).filter(x => x.how === 'temporada' && x.season === se.id && !x.off).map(x => 'pet:cp_' + x.id);
    const o = st[se.id] || {};
    return Object.assign({}, se, { items: se.items.concat(pets), petsIds: pets.map(k => k.slice(4)), name: o.name || se.name, sub: o.sub || '', c1: o.c1 || '', c2: o.c2 || '', c3: o.c3 || '' });
  });
};
const DEF = { halloween: ['#5b4791', '#a27fd6', '#f6b07a'], navidad: ['#c8475f', '#e98a8f', '#5fa77a'], valentin: ['#e0577f', '#f7a6c0', '#ffd6e2'] };
ACT.seStyle = a => {
  const id = a.dataset.id; const se = A.allSeasons().find(x => x.id === id); if (!se) return;
  const c1 = se.c1 || (DEF[id] || ['#8a6fd1'])[0], c2 = se.c2 || (DEF[id] || [0, '#bfaef0'])[1], c3 = se.c3 || (DEF[id] || [0, 0, '#efe9ff'])[2];
  const raw = ((A.CFG.catalog || {}).seasons || []).find(x => x.id === id);
  const prev = (a1, b1, d1, n, sb) => `<div class="se-mini" id="sePrev" style="--se1:${a1};--se2:${b1};--se3:${d1}"><div class="se-mini-h"><span class="se-mini-tx"><span class="se-k">Edición limitada</span><b>${esc(n)}</b></span><span class="se-price" style="padding:4px 10px;border-radius:99px">25</span></div><div class="faint" style="color:#fff">${esc(sb || 'Solo por esta temporada')}</div></div>`;
  A.openSheet('Diseño de ' + se.name, `<div class="stack">${prev(c1, c2, c3, se.name, se.sub)}
<label class="f">Nombre<input class="in" id="ssName" maxlength="30" value="${esc(se.name)}"></label>
<label class="f">Texto debajo del nombre<input class="in" id="ssSub" maxlength="50" value="${esc(se.sub || '')}" placeholder="Solo por esta temporada"></label>
<div class="row" style="gap:10px"><label class="f" style="flex:1">Color fuerte<input type="color" class="in" id="ssC1" value="${c1}" style="height:44px;padding:2px"></label><label class="f" style="flex:1">Color suave<input type="color" class="in" id="ssC2" value="${c2}" style="height:44px;padding:2px"></label><label class="f" style="flex:1">Color claro<input type="color" class="in" id="ssC3" value="${c3}" style="height:44px;padding:2px"></label></div>
${raw ? `<div class="row" style="gap:10px"><label class="f" style="flex:1">Desde<input class="in" id="ssFrom" type="date" value="${new Date().getFullYear()}-${raw.from}"></label><label class="f" style="flex:1">Hasta<input class="in" id="ssTo" type="date" value="${new Date().getFullYear()}-${raw.to}"></label></div>` : ''}
<p class="faint" style="margin:0">Las prendas, muebles y <b>personajes</b> que agregues con "Qué temporada" = esta colección salen solos en su tarjeta de la Tiendita.</p>
<div class="row" style="gap:8px"><button class="btn" id="ssReset" style="flex:1;justify-content:center">Restablecer</button><button class="btn pink" id="ssSave" style="flex:1;justify-content:center">Guardar</button></div></div>`, sh => {
    const upd = () => { const p = sh.querySelector('#sePrev'); if (!p) return; p.style.setProperty('--se1', $('#ssC1', sh).value); p.style.setProperty('--se2', $('#ssC2', sh).value); p.style.setProperty('--se3', $('#ssC3', sh).value); p.querySelector('b').textContent = $('#ssName', sh).value || se.name; p.querySelector('.faint').textContent = $('#ssSub', sh).value || 'Solo por esta temporada'; };
    sh.addEventListener('input', upd);
    $('#ssSave', sh).onclick = () => {
      A.CFG.catalog = A.CFG.catalog || {}; const st = A.CFG.catalog.seStyle = A.CFG.catalog.seStyle || {};
      st[id] = { name: $('#ssName', sh).value.trim(), sub: $('#ssSub', sh).value.trim(), c1: $('#ssC1', sh).value, c2: $('#ssC2', sh).value, c3: $('#ssC3', sh).value };
      if (raw) { const f = $('#ssFrom', sh), t = $('#ssTo', sh); if (f && f.value) raw.from = f.value.slice(5); if (t && t.value) raw.to = t.value.slice(5); }
      S.seasOpen = true; A.closeSheet(); A.saveCatalog();
    };
    $('#ssReset', sh).onclick = () => { if (A.CFG.catalog && A.CFG.catalog.seStyle) delete A.CFG.catalog.seStyle[id]; S.seasOpen = true; A.closeSheet(); A.saveCatalog(); };
  });
};
})();
