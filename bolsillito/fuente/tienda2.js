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
