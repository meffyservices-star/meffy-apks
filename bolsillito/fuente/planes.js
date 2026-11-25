// ===== Planes: gastos hormiga, deudas, viajes/eventos, compras grandes, foto del mes =====
(function () {
const A = App, S = A.S, { esc, money, toast, openSheet, closeSheet } = A;
const sc = A.screens, ACT = A.ACTIONS;
A.PAGES.planes = 'Planes'; A.PAGES.viaje = 'Viaje';
const spr = (n, k) => Pix.sprite(n, k || 3);
const sheet = (t, h) => openSheet(t, h, sh => sh.addEventListener('click', ev => { const b = ev.target.closest('[data-act]'); if (b && ACT[b.dataset.act]) { ev.stopPropagation(); ACT[b.dataset.act](b); } }));
const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const P = () => (S.settings.planes = S.settings.planes || { debts: [], trips: [], wishes: [] });
const save = () => A.saveSettings();
const id = () => Math.random().toString(36).slice(2, 9);
const num = v => Math.max(0, Math.round((+String(v).replace(',', '.') || 0) * 100) / 100);
const when = m => { const d = new Date(); d.setMonth(d.getMonth() + m); return `${MES[d.getMonth()]} ${d.getFullYear()}`; };
const bar = (p, c) => { const n = 12, on = Math.round(Math.max(0, Math.min(1, p)) * n); return `<span class="sb-bar pl-bar">${Array.from({ length: n }, (_, i) => `<i style="${i < on ? 'background:' + (c || '#e0709a') : ''}"></i>`).join('')}</span>`; };
// ---------- sprites ----------
(function () {
  const w = 16, h = 9, g = Array.from({ length: h }, () => Array(w).fill('.'));
  const ell = (cx, cy, rx, ry) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; if (d <= 1.35 && g[y][x] === '.') g[y][x] = '0'; } for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; if (d <= .6) g[y][x] = '1'; } };
  [[3, 4, 2.2, 2.2], [7.5, 4, 2, 1.8], [12, 4, 3, 2.6]].forEach(a => ell(...a));
  [[1, 1], [0, 0], [4, 1], [5, 0], [6, 7], [7, 8], [9, 7], [10, 8], [8, 1], [9, 0]].forEach(([x, y]) => { g[y][x] = '0'; });
  g[3][2] = '2'; g[3][4] = '2';
  Pix.define('hormiga', { raw: g.map(r => r.join('')), pal: '#5a3a3a,#8a5a4a,#fff6e6' });
  const m = Array.from({ length: 12 }, () => Array(14).fill('.'));
  for (let y = 1; y < 11; y++) for (let x = 1; x < 13; x++) m[y][x] = (x === 1 || x === 12 || y === 1 || y === 10) ? '0' : '2';
  for (let y = 2; y < 10; y++) m[y][3] = '0'; for (let x = 4; x < 11; x += 2) { m[4][x] = '3'; m[6][x] = '3'; m[8][x] = '3'; }
  Pix.define('plan_ic', { raw: m.map(r => r.join('')), pal: '#5a3a3a,#ffd6e3,#fff0f4,#e0709a' });
  Object.values(A.PACKS || {}).forEach(p => { if (p.map) p.map.planes = p === A.PACKS.pixel ? 's:plan_ic' : 's:book'; });
})();
// ---------- formulario genérico ----------
let FM = null;
function form(title, fields, ok, cb, extra) {
  FM = { fields, cb };
  sheet(title, `<div class="sb-form">${extra || ''}${fields.map(f => `<label class="f">${f.l}<input class="in" id="pf_${f.k}" type="${f.t || 'text'}" ${f.t === 'number' ? 'inputmode="decimal" step="0.01" min="0"' : ''} value="${esc(f.v == null ? '' : f.v)}" placeholder="${esc(f.p || '')}"></label>`).join('')}<button class="sb-act pn pn-pink" data-act="plOk">${ok}</button></div>`);
}
ACT.plOk = () => { if (!FM) return; const v = {}; FM.fields.forEach(f => { const e = document.getElementById('pf_' + f.k); v[f.k] = f.t === 'number' ? num(e.value) : (e.value || '').trim(); }); const r = FM.cb(v); if (r !== false) { closeSheet(); A.render(); } };
// ====================== GASTOS HORMIGA ======================
const th = () => +(S.settings.hormiga || 5);
A.hormigaOk = t => t.type === 'expense' && (+t.amount || 0) <= th() && (+t.amount || 0) > 0 && !(A.cat(t.cat) && A.isSaving(A.cat(t.cat)));
function hormiga(k) { const l = A.txIn(k).filter(A.hormigaOk), by = {}; l.forEach(t => { by[t.cat] = (by[t.cat] || 0) + t.amount; }); return { n: l.length, tot: l.reduce((a, t) => a + t.amount, 0), top: Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c, v]) => ({ c: A.cat(c), v })) }; }
const txScr = sc.tx;
sc.tx = () => {
  let h = txScr(); if (A.pnStyles) A.pnStyles();
  const f = S.filters, k = f.month && f.month !== 'all' ? f.month : A.ym(A.today()), H = hormiga(k), on = !!f.hormiga;
  const card = `<div class="hm pn pn-cream"><div class="hm-top"><img class="pixel" alt="" src="${spr('hormiga', 4)}"><div><b>Gastos hormiga</b><small>de ${esc(A.cap(A.monthLabel(k)))} · hasta ${money(th())} cada uno</small></div></div>
${H.n ? `<div class="hm-num"><b>${money(H.tot)}</b><span>en ${H.n} ${H.n === 1 ? 'compra' : 'compras'}</span></div><div class="hm-year">Si sigues así, al año son <b>${money(H.tot * 12)}</b></div>${H.top.length ? `<div class="hm-top3">${H.top.map(x => `<span>${x.c ? A.iconHTML(x.c.icon, 14) : ''}${esc(x.c ? x.c.name : '—')} <b>${money(x.v)}</b></span>`).join('')}</div>` : ''}` : '<div class="hm-year">Este mes no hay compritas chiquitas. ¡Bien!</div>'}
<div class="hm-acts"><button class="sb-act pn ${on ? 'pn-wood' : 'pn-pink'}" data-act="hmToggle">${on ? 'Ver todo' : 'Ver cuáles son'}</button><button class="sb-act pn pn-slot" data-act="hmTh">Cambiar tope</button></div></div>`;
  const m = h.match(/<div class="tabs-line">|<div class="card stack">/); return m ? h.slice(0, m.index) + card + h.slice(m.index) : h + card;
};
ACT.hmToggle = () => { S.filters.hormiga = !S.filters.hormiga; if (S.filters.hormiga) { S.filters.type = 'expense'; } A.render(); };
ACT.hmTh = () => form('Tope de gasto hormiga', [{ k: 'v', l: '¿Hasta cuánto cuenta como compra chiquita?', t: 'number', v: th() }], 'Guardar', v => { if (!v.v) return false; S.settings.hormiga = v.v; save(); });
// ====================== HUB ======================
let tab = 'deudas';
sc.planes = () => {
  if (A.pnStyles) A.pnStyles();
  const T = [['deudas', 'Deudas', 'billetera'], ['viajes', 'Viajes', 'regalo_cerrado'], ['deseos', 'Deseos', 'estrellita']];
  return `${A.header('planes')}<div class="pl-tabs">${T.map(([k, n, ic]) => `<button class="pl-tab ${tab === k ? 'on' : ''}" data-act="plTab" data-v="${k}"><img class="pixel" alt="" src="${spr(ic, 2)}"><span>${n}</span></button>`).join('')}</div>${tab === 'deudas' ? deudasHTML() : tab === 'viajes' ? viajesHTML() : deseosHTML()}`;
};
ACT.plTab = a => { tab = a.dataset.v; A.render(); };
const empty = (t, s) => `<div class="pl-empty"><img class="pixel" alt="" src="${spr('plan_ic', 6)}"><b>${t}</b><span>${s}</span></div>`;
// ====================== DEUDAS ======================
const left = d => Math.max(0, d.total - (d.paid || 0));
function sim(list, mode) {
  const act = list.filter(d => left(d) > 0).map(d => ({ id: d.id, l: left(d), c: +d.cuota || 0, r: (+d.rate || 0) / 1200 }));
  const pool = act.reduce((a, d) => a + d.c, 0); const fin = {}; let m = 0;
  if (!pool) return { months: null, fin };
  while (act.some(d => d.l > 0) && m < 600) {
    m++; let spare = pool; act.forEach(d => { if (d.l > 0) { d.l += d.l * d.r; const p = Math.min(d.c, d.l); d.l -= p; spare -= p; if (d.l <= .005) { d.l = 0; fin[d.id] = fin[d.id] || m; } } });
    const order = act.filter(d => d.l > 0).sort((a, b) => mode === 'av' ? b.r - a.r || a.l - b.l : a.l - b.l);
    for (const d of order) { if (spare <= 0) break; const p = Math.min(spare, d.l); d.l -= p; spare -= p; if (d.l <= .005) { d.l = 0; fin[d.id] = m; } }
  }
  return { months: act.some(d => d.l > 0) ? null : m, fin };
}
function deudasHTML() {
  const L = P().debts, mode = S.settings.debtMode || 'nieve', open = L.filter(d => left(d) > 0), done = L.filter(d => left(d) <= 0);
  if (!L.length) return empty('Sin deudas anotadas', 'Anota lo que debes (tarjeta, préstamo, crédito) y te armo un camino para quedar libre.') + `<button class="pl-btn" data-act="dNew">Anotar una deuda</button>`;
  const r = sim(L, mode === 'nieve' ? 'ni' : 'av'), tl = open.reduce((a, d) => a + left(d), 0), tc = open.reduce((a, d) => a + (+d.cuota || 0), 0), all = L.reduce((a, d) => a + d.total, 0), pd = all ? 1 - tl / all : 0;
  const ord = open.slice().sort((a, b) => mode === 'nieve' ? left(a) - left(b) : (+b.rate || 0) - (+a.rate || 0));
  let pet = 'gochi'; try { pet = A.petInfo(A.petActive ? A.petActive() : 'gochi').sprite; } catch (e) { }
  return `<div class="pl-road"><div class="pl-road-top"><small>Te falta pagar</small><b>${money(tl)}</b><span>${r.months ? `Libre en <i>${when(r.months)}</i>` : open.length ? 'Pon una cuota mensual para ver tu fecha' : '¡Sin deudas!'}</span></div>
<div class="pl-track"><div class="pl-path"></div><div class="pl-done" style="width:${Math.round(pd * 100)}%"></div><img class="pixel pl-walker" alt="" style="left:${Math.min(88, Math.max(0, pd * 100))}%" src="${spr(pet, 3)}"><img class="pixel pl-flag" alt="" src="${spr('casita', 3)}"></div>
<div class="pl-road-bot"><span>${Math.round(pd * 100)}% pagado</span>${tc ? `<span>${money(tc)} al mes</span>` : ''}</div></div>
${open.length ? `<div class="pl-seg"><button class="pl-sg ${mode === 'nieve' ? 'on' : ''}" data-act="dMode" data-v="nieve"><b>Bola de nieve</b><small>la más chica primero</small></button><button class="pl-sg ${mode === 'av' ? 'on' : ''}" data-act="dMode" data-v="av"><b>Avalancha</b><small>la de más interés primero</small></button></div>` : ''}
<div class="pl-notes">${ord.map((d, i) => `<button class="pl-note" style="--r:${[-1.2, .9, -.6, 1.2][i % 4]}deg" data-act="dOpen" data-id="${d.id}"><i class="pl-tape"></i>${i === 0 ? '<span class="pl-stamp">Sigue esta</span>' : ''}<b>${esc(d.name)}</b><em>${money(left(d))}</em>${bar((d.paid || 0) / d.total, '#78c15a')}<small>${money(d.paid || 0)} de ${money(d.total)}${d.cuota ? ` · cuota ${money(d.cuota)}` : ''}</small>${r.fin[d.id] ? `<small class="pl-end">Termina en ${when(r.fin[d.id])}</small>` : ''}</button>`).join('')}</div>
${done.length ? `<div class="sb-lbl">Ya pagadas</div>${done.map(d => `<div class="pl-paid"><span>${esc(d.name)}</span><b>${money(d.total)}</b></div>`).join('')}` : ''}
<button class="pl-btn" data-act="dNew">Anotar otra deuda</button>`;
}
ACT.dMode = a => { S.settings.debtMode = a.dataset.v; save(); A.render(); };
const dF = d => [{ k: 'name', l: 'Nombre', v: d.name, p: 'Ej. Tarjeta Visa' }, { k: 'total', l: 'Cuánto debes en total', t: 'number', v: d.total }, { k: 'paid', l: 'Cuánto ya pagaste', t: 'number', v: d.paid || '' }, { k: 'cuota', l: 'Cuota mensual', t: 'number', v: d.cuota || '' }, { k: 'rate', l: 'Interés anual % (opcional)', t: 'number', v: d.rate || '' }];
ACT.dNew = () => form('Nueva deuda', dF({}), 'Guardar', v => { if (!v.name || !v.total) { toast('Pon nombre y monto'); return false; } P().debts.push({ id: id(), ...v }); save(); });
ACT.dOpen = a => { const d = P().debts.find(x => x.id === a.dataset.id); if (!d) return; sheet(d.name, `<div class="sb-form"><div class="sb-big pn pn-cream"><b class="sb-bigleft">${money(left(d))}</b><span>te falta de ${money(d.total)}</span>${bar((d.paid || 0) / d.total, '#6bbf5a')}</div><div class="sb-acts"><button class="sb-act pn pn-pink" data-act="dPay" data-id="${d.id}">Abonar</button><button class="sb-act pn pn-wood" data-act="dEdit" data-id="${d.id}">Editar</button></div><button class="sb-act pn pn-slot" data-act="dDel" data-id="${d.id}">Quitar esta deuda</button></div>`); };
ACT.dPay = a => { const d = P().debts.find(x => x.id === a.dataset.id); form('Abonar a ' + d.name, [{ k: 'v', l: 'Cantidad', t: 'number', v: d.cuota || '' }], 'Abonar', v => { if (!v.v) return false; d.paid = (d.paid || 0) + v.v; save(); toast(left(d) <= 0 ? '¡Deuda pagada!' : 'Abono anotado'); }); };
ACT.dEdit = a => { const d = P().debts.find(x => x.id === a.dataset.id); form('Editar deuda', dF(d), 'Guardar', v => { if (!v.name || !v.total) return false; Object.assign(d, v); save(); }); };
ACT.dDel = a => { P().debts = P().debts.filter(x => x.id !== a.dataset.id); save(); closeSheet(); A.render(); };
// ====================== VIAJES / EVENTOS ======================
const SECS = [['Transporte', .3], ['Hospedaje', .3], ['Comida', .2], ['Actividades', .15], ['Otros', .05]];
const tSpent = (t, s) => (t.gastos || []).filter(g => !s || g.sec === s).reduce((a, g) => a + g.amount, 0);
const tBud = t => t.secs.reduce((a, s) => a + s.b, 0);
const TK = [['#ffd6e3', '#ff8fb3'], ['#d6ecff', '#7cb8ee'], ['#d9f3df', '#78c98f'], ['#ffe8c2', '#f0b45a'], ['#e6dcff', '#a58ae8']];
function viajesHTML() {
  const L = P().trips; if (!L.length) return empty('Sin viajes ni eventos', 'Crea un plan con su propio presupuesto y sobrecitos: viaje, cumpleaños, boda, graduación…') + `<button class="pl-btn" data-act="vNew">Crear un plan</button>`;
  return L.map((t, i) => { const b = tBud(t), s = tSpent(t), dl = t.date ? Math.ceil((new Date(t.date + 'T00:00') - new Date()) / 864e5) : null, d = t.date ? new Date(t.date + 'T00:00') : null, c = TK[i % TK.length];
    return `<button class="pl-ticket" style="--bg:${c[0]};--ac:${c[1]}" data-act="vOpen" data-id="${t.id}"><div class="pl-stub">${d ? `<b>${d.getDate()}</b><span>${MES[d.getMonth()].slice(0, 3)}</span>` : `<img class="pixel" alt="" src="${spr('regalo_cerrado', 3)}">`}</div><div class="pl-main"><small>${dl == null ? 'Plan' : dl > 0 ? 'Faltan ' + dl + ' días' : dl === 0 ? '¡Es hoy!' : 'Ya pasó'}</small><b>${esc(t.name)}</b><div class="pl-mrow"><em>${money(Math.max(0, b - s))}</em><span>de ${money(b)}</span></div>${bar(b ? s / b : 0, s > b ? '#e0617a' : c[1])}</div></button>`; }).join('') + `<button class="pl-btn" data-act="vNew">Crear otro plan</button>`;
}
ACT.vNew = () => form('Nuevo plan', [{ k: 'name', l: 'Nombre', p: 'Ej. Viaje a Cuenca' }, { k: 'date', l: 'Fecha', t: 'date' }, { k: 'total', l: 'Presupuesto total', t: 'number' }], 'Crear', v => { if (!v.name) { toast('Ponle un nombre'); return false; } const t = { id: id(), name: v.name, date: v.date, secs: SECS.map(([n, w]) => ({ id: id(), name: n, b: Math.round(v.total * w * 100) / 100 })), gastos: [] }; P().trips.push(t); save(); S.trip = t.id; A.go('viaje'); return false; });
ACT.vOpen = a => { S.trip = a.dataset.id; A.go('viaje'); };
const trip = () => P().trips.find(t => t.id === S.trip);
sc.viaje = () => {
  if (A.pnStyles) A.pnStyles(); const t = trip(); if (!t) return `${A.header('viaje')}<p class="faint">No encontré ese plan.</p>`;
  const b = tBud(t), s = tSpent(t), dl = t.date ? Math.ceil((new Date(t.date + 'T00:00') - new Date()) / 864e5) : null;
  return `<div class="ph"><div class="ph-left"><button class="navarrow" data-go="planes" aria-label="Volver">‹</button><span class="pill">${esc(t.name)}</span></div></div>
<div class="pl-hero pn pn-cream"><img class="pixel" alt="" src="${spr('regalo_cerrado', 4)}"><div><small>Te queda</small><b>${money(b - s)}</b><span>${money(s)} de ${money(b)}${dl != null && dl > 0 ? ` · faltan ${dl} días` : ''}</span></div></div>
<div class="sb-grid">${t.secs.map((x, i) => { const sp = tSpent(t, x.id), lf = x.b - sp, st = A.sobreState({ b: x.b, left: lf, pct: x.b ? Math.max(0, lf / x.b) : 0 }); return `<button class="sb-card" data-act="vSec" data-id="${x.id}"><canvas class="sb-cv" data-i="${i}" data-s="${x.id}"></canvas><span class="sb-tag pn pn-tag"><b>${esc(x.name)}</b></span><span class="sb-left ${lf < 0 ? 'neg' : ''}">${lf < 0 ? '−' + money(-lf) : money(lf)}</span><small>de ${money(x.b)}</small></button>`; }).join('')}</div>
<button class="pl-btn" data-act="vGasto">Anotar un gasto</button>
<div class="sb-lbl">Gastos del plan</div>${(t.gastos || []).length ? `<div class="sb-hist">${t.gastos.slice().reverse().map(g => `<div><span>${esc((t.secs.find(x => x.id === g.sec) || {}).name || '')}</span><em>${esc(g.note || '')}</em><b>${money(g.amount)}</b><button class="pl-x" data-act="vGDel" data-id="${g.id}" aria-label="Quitar">×</button></div>`).join('')}</div>` : '<p class="faint" style="text-align:center">Todavía no hay gastos.</p>'}
<button class="pl-btn ghost" data-act="vDel">Borrar este plan</button>`;
};
A.after.viaje = el => { const t = trip(); if (!t) return; el.querySelectorAll('.sb-cv[data-s]').forEach(cv => { const x = t.secs.find(y => y.id === cv.dataset.s), sp = tSpent(t, x.id), lf = x.b - sp; A.sobreDraw(cv, { b: x.b, s: sp, left: lf, pct: x.b ? Math.max(0, Math.min(1, lf / x.b)) : 0 }, +cv.dataset.i); }); };
ACT.vSec = a => { const t = trip(), x = t.secs.find(y => y.id === a.dataset.id); form('Tope de ' + x.name, [{ k: 'b', l: 'Cuánto tienes para esto', t: 'number', v: x.b }], 'Guardar', v => { x.b = v.b; save(); }); };
ACT.vGasto = () => { const t = trip(); form('Anotar gasto', [{ k: 'amount', l: 'Cuánto', t: 'number' }, { k: 'note', l: 'En qué (opcional)' }], 'Anotar', v => { if (!v.amount) return false; t.gastos.push({ id: id(), sec: S.vsec || t.secs[0].id, amount: v.amount, note: v.note }); save(); }, `<div class="pl-chips">${t.secs.map(x => `<button class="pl-chip ${((S.vsec || t.secs[0].id) === x.id) ? 'on' : ''}" data-act="vPick" data-id="${x.id}">${esc(x.name)}</button>`).join('')}</div>`); };
ACT.vPick = a => { S.vsec = a.dataset.id; document.querySelectorAll('.pl-chip').forEach(b => b.classList.toggle('on', b === a)); };
ACT.vGDel = a => { const t = trip(); t.gastos = t.gastos.filter(g => g.id !== a.dataset.id); save(); A.render(); };
ACT.vDel = () => { P().trips = P().trips.filter(t => t.id !== S.trip); save(); A.go('planes'); };
// ====================== DESEOS / COMPRAS GRANDES ======================
const wl = w => Math.max(0, w.price - (w.saved || 0));
function jar(cv, pct, col) {
  const W = 40, H = 48; cv.width = W; cv.height = H; const g = cv.getContext('2d'); const R = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); }, O = '#5a3a3a';
  R('rgba(90,58,58,.16)', 6, 45, 28, 2);
  R(O, 9, 2, 22, 5); R('#f5c9a0', 10, 3, 20, 3); R('#fff0dc', 10, 3, 20, 1);
  R(O, 11, 7, 18, 2); R(O, 6, 9, 28, 36); R('#f4fbff', 7, 10, 26, 34); R('#dff1fb', 7, 10, 3, 34); R('#fff', 28, 12, 2, 10);
  const lv = Math.round(Math.max(0, Math.min(1, pct)) * 30), top = 43 - lv;
  for (let y = top; y < 43; y++) for (let x = 8; x < 32; x++) { R(col, x, y, 1, 1); if (y === top) R('rgba(255,255,255,.55)', x, y, 1, 1); }
  for (let r = 0; r < 6; r++) for (let q = 0; q < 4; q++) { const cx = 9 + q * 6 + (r % 2) * 3, cy = 39 - r * 5; if (cy > top + 1 && cx < 28) { R('#d9951c', cx, cy, 4, 4); R('#ffd75e', cx, cy, 3, 3); R('#fff2a8', cx, cy, 1, 1); } }
  R(O, 6, 44, 28, 1);
  if (pct >= 1) { R('#fff6a8', 2, 12, 1, 3); R('#fff6a8', 1, 13, 3, 1); R('#fff6a8', 36, 22, 1, 3); R('#fff6a8', 35, 23, 3, 1); }
}
function deseosHTML() {
  const L = P().wishes; if (!L.length) return empty('Sin deseos todavía', 'Anota algo que quieres comprar y cuánto puedes apartar al mes. Cada deseo vive en su frasco y se va llenando de monedas.') + `<button class="pl-btn" data-act="wNew">Anotar un deseo</button>`;
  return `<div class="pl-shelf">${L.map((w, i) => { const m = wl(w) <= 0 ? 0 : w.monthly ? Math.ceil(wl(w) / w.monthly) : null; return `<button class="pl-jar" data-act="wOpen" data-id="${w.id}"><canvas class="pl-jcv" data-pct="${Math.min(1, (w.saved || 0) / w.price)}" data-i="${i}"></canvas><span class="pl-jtag">${esc(w.name)}</span><b>${money(w.price)}</b><small>${wl(w) <= 0 ? '¡Ya lo puedes comprar!' : m ? 'Lo logras en ' + when(m) : 'Pon cuánto apartas'}</small></button>`; }).join('')}</div><button class="pl-btn" data-act="wNew">Anotar otro deseo</button>`;
}
A.after.planes = el => { const C = ['#ffb3c9', '#a9d8f5', '#b9e4a8', '#d9c3f7', '#ffd08a']; el.querySelectorAll('.pl-jcv').forEach(cv => jar(cv, +cv.dataset.pct, C[+cv.dataset.i % 5])); };
const wF = w => [{ k: 'name', l: 'Qué quieres', v: w.name, p: 'Ej. Laptop' }, { k: 'price', l: 'Cuánto cuesta', t: 'number', v: w.price }, { k: 'monthly', l: 'Cuánto apartas al mes', t: 'number', v: w.monthly || '' }];
ACT.wNew = () => form('Nuevo deseo', wF({}), 'Guardar', v => { if (!v.name || !v.price) { toast('Pon nombre y precio'); return false; } P().wishes.push({ id: id(), saved: 0, ...v }); save(); });
ACT.wOpen = a => { const w = P().wishes.find(x => x.id === a.dataset.id); if (!w) return; sheet(w.name, `<div class="sb-form"><div class="sb-big pn pn-cream"><b class="sb-bigleft">${money(wl(w))}</b><span>te falta de ${money(w.price)}</span>${bar((w.saved || 0) / w.price, '#f0b84a')}</div><div class="sb-acts"><button class="sb-act pn pn-pink" data-act="wAdd" data-id="${w.id}">Apartar plata</button><button class="sb-act pn pn-wood" data-act="wEdit" data-id="${w.id}">Editar</button></div><button class="sb-act pn pn-slot" data-act="wDel" data-id="${w.id}">${wl(w) <= 0 ? 'Ya lo compré' : 'Quitar este deseo'}</button></div>`); };
ACT.wAdd = a => { const w = P().wishes.find(x => x.id === a.dataset.id); form('Apartar para ' + w.name, [{ k: 'v', l: 'Cantidad', t: 'number', v: w.monthly || '' }], 'Apartar', v => { if (!v.v) return false; w.saved = (w.saved || 0) + v.v; save(); toast(wl(w) <= 0 ? '¡Lo lograste!' : 'Apartado'); }); };
ACT.wEdit = a => { const w = P().wishes.find(x => x.id === a.dataset.id); form('Editar deseo', wF(w), 'Guardar', v => { if (!v.name || !v.price) return false; Object.assign(w, v); save(); }); };
ACT.wDel = a => { P().wishes = P().wishes.filter(x => x.id !== a.dataset.id); save(); closeSheet(); A.render(); };
// ====================== FOTO DEL MES ======================
function stats(k) {
  const l = A.txIn(k), ex = l.filter(t => t.type === 'expense'), sv = ex.filter(t => A.cat(t.cat) && A.isSaving(A.cat(t.cat))), by = {};
  ex.filter(t => !sv.includes(t)).forEach(t => { by[t.cat] = (by[t.cat] || 0) + t.amount; });
  const top = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
  return { k, spent: ex.filter(t => !sv.includes(t)).reduce((a, t) => a + t.amount, 0), inc: l.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0), saved: sv.reduce((a, t) => a + t.amount, 0), top: top ? ((A.cat(top[0]) || {}).name || '') : '', topV: top ? top[1] : 0, hm: hormiga(k).tot, n: l.length };
}
function draw(cv, st) {
  const W = 300, H = 380; cv.width = W; cv.height = H; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const R = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  R('#5a3a3a', 0, 0, W, H); R('#fff8ea', 4, 4, W - 8, H - 8); R('#ffd6e3', 16, 16, W - 32, 190); R('#5a3a3a', 16, 16, W - 32, 3); R('#5a3a3a', 16, 203, W - 32, 3); R('#5a3a3a', 16, 16, 3, 190); R('#5a3a3a', W - 19, 16, 3, 190);
  for (let i = 0; i < 24; i++) R(i % 3 ? '#fff6a8' : '#fff', 24 + (i * 53) % 250, 24 + (i * 37) % 170, 3, 3);
  const mp = A.petSpriteName ? A.petSpriteName() : null; const img = new Image(); img.onload = () => { g.drawImage(img, 100, 70, 100, 100); };
  try { const p = A.petInfo(A.petActive ? A.petActive() : 'gochi'); img.src = spr(p.sprite, 8); } catch (e) { }
  g.fillStyle = '#5a3a3a'; g.textAlign = 'center'; g.font = '800 26px Nunito, system-ui, sans-serif'; g.fillText(A.cap(MES[+st.k.slice(5) - 1]) + ' ' + st.k.slice(0, 4), W / 2, 244);
  g.font = '700 14px Nunito, system-ui, sans-serif'; g.fillStyle = '#7a5a4a';
  const rows = [['Gasté', money(st.spent)], ['Entró', money(st.inc)], ['Ahorré', money(st.saved)], ['Hormiga', money(st.hm)]];
  rows.forEach(([a, b], i) => { g.fillStyle = '#7a5a4a'; g.textAlign = 'left'; g.fillText(a, 44, 276 + i * 22); g.textAlign = 'right'; g.fillStyle = '#5a3a3a'; g.fillText(b, W - 44, 276 + i * 22); g.fillStyle = '#7a5a4a'; R('#e9d2a8', 44, 281 + i * 22, W - 88, 1); });
  g.textAlign = 'center'; g.fillStyle = '#e0709a'; g.font = '800 13px Nunito, system-ui, sans-serif'; g.fillText(st.top ? `Lo que más: ${st.top}` : 'Mes tranquilito', W / 2, 372 - 4);
}
sc.month = ((m0) => () => { const h = m0(); const k = S.month, cur = A.ym(A.today()); if (k > cur) return h; return h + `<button class="card row foto-btn" data-act="fotoOpen" data-k="${k}" style="gap:12px;text-align:left;width:100%;color:inherit;font:inherit;cursor:pointer"><span class="ni" style="background:#ffd6e3"><img class="pixel" alt="" src="${spr('plan_ic', 3)}"></span><span><b>Foto de ${esc(MES[+k.slice(5) - 1])}</b><br><span class="faint">Guarda un recuerdito de cómo te fue este mes</span></span></button>`; })(sc.month);
ACT.fotoOpen = a => {
  const k = a.dataset.k || A.ym(A.today()), st = stats(k), al = Object.keys(S.settings.fotos || {}).sort().reverse();
  sheet('Foto del mes', `<div class="sb-form" style="align-items:center"><canvas id="fotoCv" class="foto-cv"></canvas><div class="sb-acts" style="width:100%"><button class="sb-act pn pn-pink" data-act="fotoSave" data-k="${k}">Guardar en mi álbum</button><button class="sb-act pn pn-wood" data-act="fotoDl">Descargar</button></div>${al.length ? `<div class="sb-lbl" style="align-self:flex-start">Mi álbum</div><div class="foto-al">${al.map(x => `<canvas class="foto-mini" data-k="${x}"></canvas>`).join('')}</div>` : ''}</div>`);
  setTimeout(() => { const c = document.getElementById('fotoCv'); if (c) draw(c, st); document.querySelectorAll('.foto-mini').forEach(c => draw(c, (S.settings.fotos || {})[c.dataset.k] || stats(c.dataset.k))); }, 30);
};
ACT.fotoSave = a => { S.settings.fotos = S.settings.fotos || {}; S.settings.fotos[a.dataset.k] = stats(a.dataset.k); save(); toast('Foto guardada en tu álbum'); closeSheet(); };
ACT.fotoDl = () => { const c = document.getElementById('fotoCv'); if (!c) return; const l = document.createElement('a'); l.download = 'foto-del-mes.png'; l.href = c.toDataURL('image/png'); l.click(); };

// ====================== ME DEBEN / DEBO (rediseño) ======================
const avC = n => { let h = 0; for (const ch of String(n || '?')) h = (h * 31 + ch.charCodeAt(0)) % 360; return [`hsl(${h} 80% 82%)`, `hsl(${h} 60% 62%)`]; };
const ini = n => String(n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
const lft = l => Math.max(0, (+l.amount || 0) - (+l.paid || 0));
sc.loans = () => {
  if (A.pnStyles) A.pnStyles();
  const tab = S.loanTab || 'in', all = S.fin.loans || [], mine = all.filter(l => l.dir === tab).sort((a, b) => (lft(b) > 0) - (lft(a) > 0) || (b.date || '').localeCompare(a.date || ''));
  const tot = d => all.filter(l => l.dir === d).reduce((a, l) => a + lft(l), 0), cnt = d => all.filter(l => l.dir === d && lft(l) > 0).length;
  const tile = (d, ttl, ic, cl) => `<button class="ld-tile ${cl} ${tab === d ? 'on' : ''}" data-act="loanTab" data-v="${d}"><img class="pixel" alt="" src="${spr(ic, 3)}"><small>${ttl}</small><b>${money(tot(d))}</b><span>${cnt(d)} ${cnt(d) === 1 ? 'persona' : 'personas'}</span></button>`;
  return `<div class="ph"><div class="ph-left"><button class="navarrow" data-go="wallet" aria-label="Volver a Billetera">‹</button><span class="pill">Me deben / Debo</span></div>${A.privBtn ? A.privBtn() : ''}</div>
<div class="ld-tiles">${tile('in', 'Me deben', 'corazon_rosa', 'in')}${tile('out', 'Debo', 'billetera', 'out')}</div>
${mine.length ? `<div class="ld-list">${mine.map(l => { const r = lft(l), done = r <= 0, pc = l.amount ? Math.min(1, (l.paid || 0) / l.amount) : 0, c = avC(l.who); return `<div class="ld-card ${done ? 'done' : ''}"><button class="ld-main" data-act="loanOpen" data-id="${l.id}"><span class="ld-av" style="background:linear-gradient(${c[0]},${c[1]})">${esc(ini(l.who))}</span><span class="ld-who"><b>${esc(l.who)}</b><small>${esc(l.note || (tab === 'in' ? 'Le presté' : 'Me prestó'))}${l.date ? ' · ' + (A.fmtDate ? A.fmtDate(l.date) : l.date) : ''}</small></span><span class="ld-amt">${done ? '<i>Pagado</i>' : `<em>${money(r)}</em><small>de ${money(l.amount)}</small>`}</span></button>${bar(pc, tab === 'in' ? '#78c15a' : '#e0709a')}${done ? '' : `<div class="ld-acts"><button class="ld-pay" data-act="loanPay" data-id="${l.id}">${tab === 'in' ? 'Me abonó' : 'Abonar'}</button><button class="ld-open" data-act="loanOpen" data-id="${l.id}">Ver detalle</button></div>`}</div>`; }).join('')}</div>` : `<div class="pl-empty"><img class="pixel" alt="" src="${spr(tab === 'in' ? 'corazon_rosa' : 'billetera', 6)}"><b>${tab === 'in' ? 'Nadie te debe nada' : 'No le debes a nadie'}</b><span>${tab === 'in' ? 'Aquí anotas lo que le prestas a alguien para no olvidarte.' : 'Aquí anotas lo que te prestaron para saber cuánto devolver.'}</span></div>`}
<button class="pl-btn" data-act="loanNew" data-dir="${tab}">${tab === 'in' ? 'Anotar algo que presté' : 'Anotar algo que me prestaron'}</button>`;
};
})();
