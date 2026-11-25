// ================= Ofertas del día, regalar prendas y Compra con calma =================
(function () {
const A = App, S = A.S, { $, $$, esc, toast, openSheet, closeSheet } = A;
const sc = A.screens, ACT = A.ACTIONS;
const spr = (n, k) => Pix.sprite(n, k || 3);
const ST = s => `<img class="pixel" alt="" src="${spr('estrellita', 3)}" style="width:${s}px;height:auto;vertical-align:-3px">`;
const ico = (n, fb) => (Pix.has(n) ? n : fb);
A.PAGES.calma = 'Compra con calma';
Object.values(A.PACKS || {}).forEach(p => { if (p.map && !p.map.calma) p.map.calma = 's:' + ico('luna', 'estrellita'); if (p.map && !p.map.tarrito) p.map.tarrito = 's:' + ico('alcancia', 'estrellita'); if (p.map && !p.map.cuentas) p.map.cuentas = 's:' + ico('moneda', 'estrellita'); if (p.map && !p.map.retos) p.map.retos = 's:' + ico('trofeo', 'estrellita'); });
const owned = id => A.isPlus() || ((S.settings.rincon || {}).owned || []).includes('acc:' + id);

// ---------- ofertas del día (cambian solas cada día, para todos) ----------
function seeded(n) { let h = 0; const d = new Date(); h = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate() + n * 7919; h = Math.imul(h ^ (h >>> 15), 2246822519); h = Math.imul(h ^ (h >>> 13), 3266489917); return (h ^ (h >>> 16)) >>> 0; }
function applyDeals() {
  const ACC = A.ACC || {};
  Object.values(ACC).forEach(a => { if (a._base != null) { a.price = a._base; delete a._base; } });
  const pool = Object.keys(ACC).filter(id => { const a = ACC[id]; return a && !a.off && !a.plus && !a.season && !a.ach && a.price >= 15; }).sort();
  const deals = []; const pct = [20, 30, 40];
  for (let i = 0; i < 3 && pool.length > i; i++) { let k = seeded(i) % pool.length, guard = 0; while (deals.some(d => d.id === pool[k]) && guard++ < pool.length) k = (k + 1) % pool.length; deals.push({ id: pool[k], pct: pct[i] }); }
  deals.forEach(d => { const a = ACC[d.id]; d.base = a.price; a._base = a.price; a.price = Math.max(1, Math.round(a.price * (100 - d.pct) / 100)); });
  A.deals = deals; return deals;
}
A.dealsHTML = () => {
  const L = (A.deals && A.deals.length ? A.deals : applyDeals()); if (!L.length) return '';
  const tile = d => { const a = A.ACC[d.id], own = owned(d.id); return `<button class="se-item sx-it nw" data-act="${own ? 'shDest' : 'shopItem'}" data-id="${d.id}"><i class="nw-r">-${d.pct}%</i><img class="pixel" alt="" src="${spr('acc_' + d.id, 4)}" style="width:${Math.min(52, a.w * 4)}px"><b>${esc(a.name)}</b>${own ? '<span class="tag">Tuyo</span>' : `<span class="se-price"><s style="opacity:.55">${d.base}</s> ${ST(12)} ${a.price}</span>`}</button>`; };
  return `<section class="nw-sec"><div class="nw-h"><b>Ofertas de hoy</b><span>Cambian cada día · terminan a medianoche</span></div><div class="sx-shelf nw-shelf deal-shelf">${L.map(tile).join('')}</div></section>`;
};
const t0 = sc.tienda; sc.tienda = () => { applyDeals(); return t0(); };

// ---------- regalar una prenda a una amistad ----------
A.giftAccPick = id => {
  const it = (A.ACC || {})[id]; if (!it) return;
  const V = A.V || { cache: {} };
  const fr = (S.settings.friends || []).map(f => ({ f, r: V.cache[f.code] })).filter(x => x.r && x.r.user_id);
  if (Store.mode !== 'supa' || !Store.sb) return toast('Para regalar necesitas tu cuenta y conexión.');
  if (!fr.length) return toast('Primero agrega una amistad en Amistades. Si ya tienes, abre Visitas para cargarlas.');
  openSheet('¿A quién se lo regalas?', `<div class="stack"><div class="buy-art" style="height:90px"><img class="pixel" alt="" src="${spr('acc_' + id, 5)}" style="width:${Math.min(80, it.w * 5)}px"></div><p class="faint" style="margin:0;text-align:center">${esc(it.name)} · ${ST(12)} ${it.price}. Le llega a su cajita y lo estrena cuando la abra.</p><div class="list">${fr.map(x => `<button class="li" data-c="${esc(x.f.code)}"><span class="tx-main"><b>${esc(x.r.name || x.f.name || 'Amistad')}</b><span>Toca para elegirla</span></span></button>`).join('')}</div><input class="in" id="gfMsg2" maxlength="140" placeholder="Mensajito (opcional)"></div>`, sh => {
    sh.addEventListener('click', async e => {
      const b = e.target.closest('[data-c]'); if (!b) return; const r = V.cache[b.dataset.c]; if (!r) return;
      if (!b.dataset.sure) { b.dataset.sure = 1; b.querySelector('span span').textContent = `Toca otra vez para regalarlo por ${it.price} estrellitas`; return; }
      if (b.dataset.busy) return; b.dataset.busy = 1;
      if (!A.spendStars(it.price)) { b.dataset.busy = ''; return toast(`Te faltan estrellitas para este regalo.`); }
      const row = { to_user: r.user_id, from_user: Store.uid, from_name: (S.settings.name || '').trim() || 'Alguien', kind: 'acc', item: id, qty: 1, msg: (($('#gfMsg2', sh) || {}).value || '').trim(), payload: { comprado: true } };
      const { error } = await Store.sb.from('gifts').insert(row);
      if (error) { console.warn(error); A.giveStars(it.price); A.saveSettings(); b.dataset.busy = ''; return toast(navigator.onLine ? 'No se pudo mandar: la nube no lo aceptó.' : 'No se pudo mandar: no hay internet.'); }
      A.saveSettings(); closeSheet(); toast(`¡Le regalaste ${it.name} a ${r.name || 'tu amistad'}!`); if (A.loadInbox) try { await A.loadInbox(); } catch (er) {} A.render();
    });
  });
};

// ---------- Compra con calma ----------
const C = () => { const c = S.settings.calma = S.settings.calma || { items: [], saved: 0, dropped: 0 }; c.items = c.items || []; return c; };
const WAITS = [[1, '1 día'], [3, '3 días'], [7, '1 semana']];
const left = it => it.due - Date.now();
const fmtLeft = ms => { const h = Math.ceil(ms / 36e5); return h >= 48 ? Math.ceil(h / 24) + ' días' : h >= 2 ? h + ' horas' : 'menos de 1 hora'; };
const money = n => (A.money ? A.money(n) : '$' + n);
A.calmaDue = () => C().items.filter(i => i.state === 'wait' && left(i) <= 0).length;
sc.calma = () => {
  const c = C(); const wait = c.items.filter(i => i.state === 'wait'); const ready = wait.filter(i => left(i) <= 0), soon = wait.filter(i => left(i) > 0).sort((a, b) => a.due - b.due);
  const w = S.calmaW || 1;
  return `${A.header('calma')}
<div class="card cm-intro"><span class="cm-ic">${ico('luna', 'estrellita') ? `<img class="pixel" alt="" src="${spr(ico('luna', 'estrellita'), 5)}" style="width:44px;height:auto">` : ''}</span><div><b>Antes de comprar, espera un ratito</b><div class="faint">Anota lo que se te antojó y elige cuánto esperar. Cuando pase el tiempo te pregunto si todavía lo quieres. Si ya no, ¡ese dinero se quedó contigo!</div></div></div>
<form class="card stack" id="cmForm" autocomplete="off"><b>¿Qué se te antojó?</b><input class="in" id="cmName" maxlength="40" placeholder="Ej. Audífonos, zapatos, un helado grande"><input class="in" id="cmPrice" inputmode="decimal" placeholder="¿Cuánto cuesta?"><div class="chips">${WAITS.map(([d, n]) => `<button type="button" class="chip" data-act="cmWait" data-v="${d}" aria-pressed="${d === w}">Esperar ${n}</button>`).join('')}</div><button class="btn pink" type="submit" style="justify-content:center">Guardar y esperar</button></form>
${ready.length ? `<div class="ph"><span class="pill sm">Ya puedes decidir</span></div>${ready.map(i => `<div class="card cm-it ready"><div class="tx-main"><b>${esc(i.name)}</b><span class="faint">${money(i.price)} · ya pasó el tiempo. ¿Todavía lo quieres?</span></div><div class="row" style="gap:8px"><button class="btn sm pink" data-act="cmYes" data-id="${i.id}">Sí, lo quiero</button><button class="btn sm" data-act="cmNo" data-id="${i.id}">Ya no</button></div></div>`).join('')}` : ''}
${soon.length ? `<div class="ph"><span class="pill sm">Esperando</span></div>${soon.map(i => { const tot = i.days * 864e5, p = Math.min(1, 1 - left(i) / tot); return `<div class="card cm-it"><div class="row between"><div class="tx-main"><b>${esc(i.name)}</b><span class="faint">${money(i.price)} · falta ${fmtLeft(left(i))}</span></div><button class="iconbtn sm" data-act="cmDel" data-id="${i.id}" aria-label="Quitar">✕</button></div><span class="cp-bar"><i style="width:${Math.round(p * 100)}%"></i></span></div>`; }).join('')}` : ''}
<div class="card cm-saved"><b>Lo que te ahorraste</b><div class="cm-big">${money(c.saved || 0)}</div><div class="faint">${c.dropped ? `por ${c.dropped} ${c.dropped === 1 ? 'antojo que se pasó' : 'antojos que se pasaron'}` : 'Aquí vas a ver el dinero de los antojos que se pasaron.'}</div></div>`;
};
ACT.cmWait = a => { S.calmaW = +a.dataset.v; A.render(); };
A.after.calma = el => {
  const f = $('#cmForm', el); if (!f) return;
  f.onsubmit = e => { e.preventDefault(); const n = $('#cmName', el).value.trim(); const p = parseFloat(String($('#cmPrice', el).value).replace(',', '.')); if (!n) return toast('Ponle nombre a lo que quieres'); if (!(p > 0)) return toast('Escribe cuánto cuesta'); const d = S.calmaW || 1; C().items.unshift({ id: 'cm' + Date.now().toString(36), name: n.slice(0, 40), price: p, days: d, due: Date.now() + d * 864e5, state: 'wait' }); A.saveSettings(); toast('Guardado. Te pregunto cuando pase el tiempo.'); A.render(); };
};
const find = a => C().items.find(i => i.id === a.dataset.id);
ACT.cmNo = a => { const i = find(a); if (!i) return; i.state = 'dropped'; const c = C(); c.saved = (c.saved || 0) + i.price; c.dropped = (c.dropped || 0) + 1; if (A.giveStars) A.giveStars(2); A.saveSettings(); toast(`¡Te ahorraste ${money(i.price)}! +2 estrellitas ✦`); A.render(); };
ACT.cmYes = a => { const i = find(a); if (!i) return; i.state = 'bought'; A.saveSettings(); A.render(); if (A.quickAdd) A.quickAdd(null, { type: 'expense', amount: i.price, note: i.name }); };
ACT.cmDel = a => { const c = C(); c.items = c.items.filter(i => i.id !== a.dataset.id); A.saveSettings(); A.render(); };
})();
