// ===== Bolsillito Negocio: ventas, costos, ganancia real, clientes y stock para emprendedoras =====
(function () {
const A = App, S = A.S, { esc, money, toast, openSheet, closeSheet } = A, sc = A.screens, ACT = A.ACTIONS;
A.PAGES.negocio = 'Negocio';
const spr = (n, k) => Pix.sprite(n, k || 3);
const sheet = (t, h) => openSheet(t, h, sh => sh.addEventListener('click', ev => { const b = ev.target.closest('[data-act]'); if (b && ACT[b.dataset.act]) { ev.stopPropagation(); ACT[b.dataset.act](b); } }));
const id = () => Math.random().toString(36).slice(2, 9);
const num = v => Math.max(0, Math.round((+String(v).replace(',', '.') || 0) * 100) / 100);
const gid = x => document.getElementById(x);
const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const N = () => (S.settings.neg = S.settings.neg || { name: '', tipo: '', goal: 0, prods: [], sales: [], exps: [], clients: [], pays: [] });
const save = () => A.saveSettings();
const r2 = x => Math.round(x * 100) / 100;
// ---------- tipos de negocio ----------
const TIPOS = {
  comida: { n: 'Comida y postres', s: 'pudin', exp: ['Ingredientes', 'Empaques', 'Gas y luz', 'Transporte', 'Publicidad', 'Otros'], ej: ['Brownie', 'Torta pequeña'] },
  belleza: { n: 'Maquillaje y belleza', s: 'heart', exp: ['Mercadería', 'Empaques', 'Envíos', 'Publicidad', 'Comisiones', 'Otros'], ej: ['Labial', 'Set de skincare'] },
  ropa: { n: 'Ropa y accesorios', s: 'gem', exp: ['Mercadería', 'Empaques', 'Envíos', 'Publicidad', 'Local o feria', 'Otros'], ej: ['Aretes', 'Blusa'] },
  manual: { n: 'Manualidades', s: 'book', exp: ['Materiales', 'Empaques', 'Envíos', 'Publicidad', 'Herramientas', 'Otros'], ej: ['Pulsera', 'Tarjeta'] },
  servicios: { n: 'Servicios', s: 'diamante', exp: ['Materiales', 'Transporte', 'Publicidad', 'Herramientas', 'Capacitación', 'Otros'], ej: ['Peinado', 'Uñas'] },
  otro: { n: 'Otro negocio', s: 'gochi', exp: ['Materiales', 'Empaques', 'Transporte', 'Publicidad', 'Otros'], ej: ['Producto', 'Servicio'] }
};
const T = () => TIPOS[N().tipo] || TIPOS.otro;
// ---------- sprite e icono ----------
(function () {
  const g = Array.from({ length: 12 }, () => Array(14).fill('.'));
  for (let y = 4; y < 11; y++) for (let x = 1; x < 13; x++) g[y][x] = (x === 1 || x === 12 || y === 4 || y === 10) ? '0' : '2';
  for (let x = 1; x < 13; x++) { g[2][x] = x % 4 < 2 ? '1' : '3'; g[3][x] = x % 4 < 2 ? '1' : '3'; }
  g[2][0] = g[3][0] = g[2][13] = g[3][13] = '.';
  for (let y = 6; y < 11; y++) { g[y][5] = '0'; g[y][8] = '0'; } g[6][6] = g[6][7] = '0';
  for (let y = 6; y < 9; y++) { g[y][10] = '3'; g[y][11] = '3'; }
  Pix.define('negocio_ic', { raw: g.map(r => r.join('')), pal: '#5a3a3a,#ff9fbf,#fff6e6,#ffffff' });
  Object.values(A.PACKS || {}).forEach(p => { if (p.map) p.map.negocio = p === A.PACKS.pixel ? 's:negocio_ic' : 's:gem'; });
})();
// ---------- acceso (lo da la admin) ----------
const NEG = A.NEG = A.NEG || { estado: null, loaded: false };
const okAcceso = () => !!Store.isOwner || NEG.estado === 'activo' || (Store.mode !== 'supa' && !!S.settings.negLocal);
A.negNav = () => okAcceso();
async function load() {
  if (!(window.Store && Store.mode === 'supa' && Store.uid)) { NEG.loaded = true; return; }
  try { const { data } = await Store.sb.from('negocio_acceso').select('estado,nombre,tipo').eq('user_id', Store.uid).maybeSingle(); const was = okAcceso(); NEG.estado = data ? data.estado : null; NEG.loaded = true; if (was !== okAcceso()) { A.renderNav && A.renderNav(); } if (S.route === 'negocio' || S.route === 'more') A.render(); } catch (e) { NEG.loaded = true; }
}
(function poll(n) { if (window.Store && Store.uid) { load(); } else if (n < 40) setTimeout(() => poll(n + 1), 1500); })(0);
ACT.negPedir = async () => {
  if (Store.mode !== 'supa') return toast('Entra con tu cuenta para pedirlo');
  try { const { error } = await Store.sb.from('negocio_acceso').upsert({ user_id: Store.uid, estado: 'pendiente', nombre: (S.settings.name || '').slice(0, 40) }, { ignoreDuplicates: true }); if (error) throw error; NEG.estado = NEG.estado || 'pendiente'; toast('Listo, se lo avisamos a Meffy'); A.render(); } catch (e) { toast('No se pudo pedir ahora'); }
};
ACT.negCerrarPromo = () => { S.settings.negPromo = 1; save(); A.render(); };
// ---------- cálculos ----------
const ym = d => d.slice(0, 7);
const mk = () => (A._negM = A._negM || A.ym(A.today()));
const saleCost = s => s.items.reduce((a, i) => a + i.q * (i.c || 0), 0);
function stats(k) {
  const n = N(), ss = n.sales.filter(s => ym(s.d) === k), ee = n.exps.filter(e => ym(e.d) === k);
  const ventas = r2(ss.reduce((a, s) => a + s.total, 0)), costo = r2(ss.reduce((a, s) => a + saleCost(s), 0)), gastos = r2(ee.reduce((a, e) => a + e.amt, 0));
  const por = {}; ss.forEach(s => s.items.forEach(i => { const o = por[i.n] = por[i.n] || { n: i.n, q: 0, g: 0 }; o.q += i.q; o.g += i.q * (i.pr - (i.c || 0)); }));
  return { ss, ee, ventas, costo, gastos, ganancia: r2(ventas - costo - gastos), bruta: r2(ventas - costo), top: Object.values(por).sort((a, b) => b.g - a.g).slice(0, 3) };
}
const debe = s => r2(s.total - (s.paid == null ? s.total : s.paid));
const porCobrar = () => N().sales.filter(s => debe(s) > 0.001);
const cliName = i => { const c = N().clients.find(c => c.id === i); return c ? c.n : ''; };
// ---------- pantalla ----------
let TAB = 'resumen';
const tabs = [['resumen', 'Resumen'], ['ventas', 'Ventas'], ['productos', 'Productos'], ['clientes', 'Clientes'], ['gastos', 'Gastos']];
const pet = () => { try { return A.petInfo(A.petActive ? A.petActive() : 'gochi').sprite; } catch (e) { return 'gochi'; } };
const empty = (t, s, b) => `<div class="ng-empty"><img class="pixel" alt="" src="${spr('negocio_ic', 6)}"><b>${t}</b><span>${s}</span>${b || ''}</div>`;
sc.negocio = () => {
  if (A.pnStyles) A.pnStyles();
  if (!okAcceso()) return lockedHTML();
  const n = N(); if (!n.tipo) return setupHTML();
  const body = { resumen, ventas, productos, clientes, gastos }[TAB]();
  return `${A.header('negocio', '<button class="round-btn" data-act="negAjustes" aria-label="Ajustes del negocio"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></button>')}
<div class="ng-name"><img class="pixel" alt="" src="${spr(T().s, 3)}"><b>${esc(n.name || 'Mi negocio')}</b><span>${esc(T().n)}</span></div>
<div class="ng-tabs">${tabs.map(([k, t]) => `<button class="ng-tab ${TAB === k ? 'on' : ''}" data-act="negTab" data-k="${k}">${t}</button>`).join('')}</div>${body}`;
};
function lockedHTML() {
  const e = NEG.estado;
  const btn = e === 'pendiente' ? '<div class="ng-wait">Ya pediste acceso. Meffy lo revisa y te aparece aquí.</div>' : e === 'pausado' ? '<div class="ng-wait">Tu acceso está en pausa por ahora.</div>' : '<button class="pl-btn" data-act="negPedir">Pedir acceso</button>';
  return `${A.header('negocio')}<div class="ng-hero"><img class="pixel" alt="" src="${spr('negocio_ic', 8)}"><b>Bolsillito Negocio</b><span>Para chicas emprendedoras: lleva tus ventas, tus costos y cuánto ganas de verdad, todo con el mismo estilo de tu Bolsillito.</span></div>
<div class="ng-feat">${[['Ventas en segundos', 'Anota lo que vendes y quién te debe'], ['Ganancia real', 'Sabe si ganaste o solo moviste plata'], ['Productos y stock', 'Con tu margen y avisos cuando se acaban'], ['Clientas', 'Fiados, abonos y recordatorio por WhatsApp']].map(a => `<div class="pn pn-cream"><b>${a[0]}</b><span>${a[1]}</span></div>`).join('')}</div>${btn}`;
}
function setupHTML() {
  return `${A.header('negocio')}<div class="ng-hero"><img class="pixel" alt="" src="${spr('negocio_ic', 7)}"><b>Armemos tu negocio</b><span>Dime qué vendes y lo dejo listo para ti.</span></div>
<label class="f" style="margin:10px 2px">Nombre de tu negocio<input class="in" id="ngNom" maxlength="30" placeholder="Ej. Dulces de Mefi"></label>
<div class="ng-types">${Object.entries(TIPOS).map(([k, t]) => `<button class="ng-type" data-act="negTipo" data-k="${k}"><img class="pixel" alt="" src="${spr(t.s, 4)}"><b>${t.n}</b></button>`).join('')}</div>`;
}
ACT.negTipo = a => { const n = N(), v = (gid('ngNom') || {}).value || ''; n.tipo = a.dataset.k; n.name = v.trim() || 'Mi negocio'; save(); A.render(); };
ACT.negTab = a => { TAB = a.dataset.k; A.render(); };
// ---- resumen ----
const bar = p => { const c = 12, on = Math.round(Math.max(0, Math.min(1, p)) * c); return `<span class="ng-bar">${Array.from({ length: c }, (_, i) => `<i class="${i < on ? 'on' : ''}"></i>`).join('')}</span>`; };
function resumen() {
  const n = N(), k = mk(), st = stats(k), cur = k === A.ym(A.today()), pc = porCobrar(), deb = r2(pc.reduce((a, s) => a + debe(s), 0));
  const gan = st.ganancia, sin = !st.ss.length && !st.ee.length;
  const msg = sin ? 'Aún no hay movimientos este mes.' : gan > 0 ? `Ganaste de verdad. Por cada $1 vendido te quedan ${(gan / Math.max(st.ventas, 1) * 100).toFixed(0)} centavos.` : gan === 0 ? 'Quedaste en cero: lo que entró se fue.' : 'Por ahora solo moviste plata: gastaste más de lo que ganaste.';
  const d7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); const s = d.toISOString().slice(0, 10), lt = new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); return { l: DIA[d.getDay()], v: n.sales.filter(x => x.d === lt).reduce((a, x) => a + x.total, 0) }; });
  const mx = Math.max(1, ...d7.map(x => x.v));
  const low = n.prods.filter(p => p.stock != null && p.stock <= 3);
  const pagado = r2(n.pays.filter(p => ym(p.d) === k).reduce((a, p) => a + p.amt, 0));
  return `<div class="ng-mes"><button class="navarrow" data-act="negMes" data-d="-1">‹</button><span class="pill">${MES[+k.slice(5) - 1][0].toUpperCase() + MES[+k.slice(5) - 1].slice(1)} ${k.slice(0, 4)}</span><button class="navarrow" data-act="negMes" data-d="1" ${cur ? 'disabled' : ''}>›</button></div>
<div class="ng-tick"><div class="ng-tk-top"><img class="pixel" alt="" src="${spr(pet(), 3)}"><span>Tu ganancia real</span></div><b class="ng-big ${gan < 0 ? 'neg' : ''}">${money(gan)}</b><p>${msg}</p>
<div class="ng-lines"><div><span>Vendiste</span><b>${money(st.ventas)}</b></div><div><span>Costo de lo vendido</span><b>- ${money(st.costo)}</b></div><div><span>Gastos del negocio</span><b>- ${money(st.gastos)}</b></div></div></div>
<button class="pl-btn" data-act="negVenta">Nueva venta</button>
${n.goal > 0 ? `<div class="pn pn-cream ng-sec"><b>Meta del mes</b>${bar(st.ventas / n.goal)}<span>${money(st.ventas)} de ${money(n.goal)} · ${Math.min(100, Math.round(st.ventas / n.goal * 100))}%</span></div>` : ''}
${deb > 0 ? `<button class="pn pn-pink ng-sec ng-link" data-act="negTab" data-k="clientes"><b>Te deben ${money(deb)}</b><span>${new Set(pc.map(s => s.cli || s.id)).size} pendientes por cobrar. Toca para verlos.</span></button>` : ''}
<div class="pn pn-cream ng-sec"><b>Últimos 7 días</b><div class="ng-chart">${d7.map(x => `<div><i style="height:${Math.max(3, Math.round(x.v / mx * 70))}px" class="${x.v ? 'on' : ''}"></i><small>${x.l}</small></div>`).join('')}</div></div>
${st.top.length ? `<div class="pn pn-cream ng-sec"><b>Lo que más te deja</b>${st.top.map((t, i) => `<div class="ng-row"><span>${i + 1}. ${esc(t.n)}</span><span>${t.q} vend. · <b>${money(t.g)}</b></span></div>`).join('')}</div>` : ''}
${low.length ? `<div class="pn pn-tag ng-sec"><b>Se te están acabando</b>${low.map(p => `<div class="ng-row"><span>${esc(p.n)}</span><b>${p.stock} ${p.stock === 1 ? 'queda' : 'quedan'}</b></div>`).join('')}</div>` : ''}
<div class="pn pn-cream ng-sec"><b>Pagarte tu sueldo</b><span>Pasa plata de tu negocio a tus ingresos personales. ${pagado ? 'Este mes ya te pagaste ' + money(pagado) + '.' : ''}</span><button class="pl-btn ghost" data-act="negSueldo">Pagarme</button></div>`;
}
ACT.negMes = a => { const [y, m] = mk().split('-').map(Number), d = new Date(y, m - 1 + (+a.dataset.d), 1); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); if (k <= A.ym(A.today())) { A._negM = k; A.render(); } };
ACT.negSueldo = () => sheet('Pagarme mi sueldo', `<div class="sb-form"><p class="faint">Se anota como ingreso en tu plata personal y queda registrado en el negocio.</p><label class="f">Cuánto<input class="in" id="ngPay" inputmode="decimal" placeholder="0.00" value="${Math.max(0, stats(A.ym(A.today())).ganancia) || ''}"></label><button class="sb-act pn pn-pink" data-act="negSueldoOk">Pagarme</button></div>`);
ACT.negSueldoOk = () => { const v = num(gid('ngPay').value); if (!v) return toast('Pon un monto'); const inc = S.fin.categories.find(c => c.type === 'income'); A.addTx({ type: 'income', amount: v, cat: inc ? inc.id : null, acct: S.settings.defaultAcct || (S.fin.accounts[0] || {}).id, date: A.today(), note: 'Sueldo de ' + (N().name || 'mi negocio') }); N().pays.push({ id: id(), d: A.today(), amt: v }); save(); closeSheet(); toast('Listo, ya está en tus ingresos'); A.render(); };
// ---- ventas ----
let CART = null;
const dayLbl = d => { const t = A.today(); if (d === t) return 'Hoy'; const x = new Date(d + 'T12:00'); return `${DIA[x.getDay()]} ${x.getDate()} de ${MES[x.getMonth()]}`; };
function ventas() {
  const st = stats(mk()), by = {}; st.ss.slice().sort((a, b) => b.d < a.d ? -1 : 1).forEach(s => (by[s.d] = by[s.d] || []).push(s));
  const ks = Object.keys(by);
  return `<button class="pl-btn" data-act="negVenta" style="margin-top:2px">Nueva venta</button>${ks.length ? ks.map(d => `<p class="ng-day">${dayLbl(d)} · <b>${money(by[d].reduce((a, s) => a + s.total, 0))}</b></p>${by[d].map(s => `<button class="ng-sale" data-act="negSaleOpen" data-id="${s.id}"><span><b>${esc(s.items.map(i => (i.q > 1 ? i.q + ' ' : '') + i.n).join(', '))}</b><small>${esc(cliName(s.cli) || 'Sin clienta')}${debe(s) > 0 ? ' · debe ' + money(debe(s)) : ''}</small></span><em class="${debe(s) > 0 ? 'deb' : ''}">${money(s.total)}</em></button>`).join('')}`).join('') : empty('Aún no hay ventas este mes', 'Cuando vendas algo, anótalo aquí en segunditos.')}`;
}
ACT.negVenta = () => { CART = { items: {}, cli: '', pago: 'todo', ab: '', otro: '' }; ventaSheet(); };
function ventaSheet() {
  const n = N(), c = CART, tot = cartTotal();
  openSheet('Nueva venta', `<div class="sb-form ng-vf">
${n.prods.length ? `<div class="ng-pick">${n.prods.map(p => { const q = c.items[p.id] || 0; return `<div class="ng-pk ${q ? 'on' : ''}"><div><b>${esc(p.n)}</b><small>${money(p.price)}${p.stock != null ? ' · quedan ' + p.stock : ''}</small></div><div class="ng-step"><button data-act="negQ" data-p="${p.id}" data-d="-1">−</button><span>${q}</span><button data-act="negQ" data-p="${p.id}" data-d="1">+</button></div></div>`; }).join('')}</div>` : '<p class="faint">Aún no tienes productos. Puedes anotar una venta suelta aquí abajo.</p>'}
<div class="ng-otro"><input class="in" id="ngOn" placeholder="Venta suelta: qué fue" value="${esc(c.on || '')}"><input class="in" id="ngOp" inputmode="decimal" placeholder="$" value="${esc(c.op || '')}"></div>
<label class="f">Clienta<select class="in" id="ngCli"><option value="">Sin clienta</option>${n.clients.map(x => `<option value="${x.id}" ${c.cli === x.id ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}<option value="+">+ Clienta nueva</option></select></label>
<div class="ng-seg">${[['todo', 'Pagó todo'], ['fiado', 'Fiado'], ['abono', 'Abono']].map(([k, t]) => `<button class="ng-sg ${c.pago === k ? 'on' : ''}" data-act="negPago" data-k="${k}">${t}</button>`).join('')}</div>
${c.pago === 'abono' ? `<label class="f">Cuánto abonó<input class="in" id="ngAb" inputmode="decimal" placeholder="0.00" value="${esc(c.ab || '')}"></label>` : ''}
<div class="ng-total"><span>Total</span><b id="ngTot">${money(tot)}</b></div>
<button class="sb-act pn pn-pink" data-act="negVentaOk">Guardar venta</button></div>`, sh => {
    if (sh._ng) return; sh._ng = 1;
    sh.addEventListener('click', ev => { const b = ev.target.closest('[data-act]'); if (b && ACT[b.dataset.act]) { ev.stopPropagation(); ACT[b.dataset.act](b); } });
    sh.addEventListener('input', ev => { if (ev.target.id === 'ngOp' || ev.target.id === 'ngOn') { const t = gid('ngTot'); CART.op = (gid('ngOp') || {}).value; CART.on = (gid('ngOn') || {}).value; if (t) t.textContent = money(cartTotal()); } });
    sh.addEventListener('change', ev => { if (ev.target.id === 'ngCli') { const v = ev.target.value; if (v === '+') { pullCart(); closeSheet(); ACT.negCliNew(null, true); } else CART.cli = v; } });
  });
}
function pullCart() { const c = CART; if (!c) return; const g = x => (gid(x) || {}).value; if (g('ngOn') != null) c.on = g('ngOn'); if (g('ngOp') != null) c.op = g('ngOp'); if (g('ngCli') != null && g('ngCli') !== '+') c.cli = g('ngCli'); if (g('ngAb') != null) c.ab = g('ngAb'); }
function cartTotal() { const c = CART, n = N(); let t = 0; n.prods.forEach(p => { t += (c.items[p.id] || 0) * p.price; }); return r2(t + num(c.op || 0)); }
ACT.negQ = a => { pullCart(); const p = a.dataset.p, v = Math.max(0, (CART.items[p] || 0) + (+a.dataset.d)); if (v) CART.items[p] = v; else delete CART.items[p]; ventaSheet(); };
ACT.negPago = a => { pullCart(); CART.pago = a.dataset.k; ventaSheet(); };
ACT.negVentaOk = () => {
  pullCart(); const n = N(), c = CART, items = [];
  n.prods.forEach(p => { const q = c.items[p.id]; if (q) items.push({ p: p.id, n: p.n, q, pr: p.price, c: p.cost || 0 }); });
  if (num(c.op) > 0) items.push({ p: null, n: (c.on || '').trim() || 'Venta suelta', q: 1, pr: num(c.op), c: 0 });
  if (!items.length) return toast('Elige qué vendiste');
  const total = r2(items.reduce((a, i) => a + i.q * i.pr, 0));
  let paid = total; if (c.pago === 'fiado') paid = 0; if (c.pago === 'abono') paid = Math.min(total, num(c.ab));
  if (paid < total && !c.cli) return toast('Para fiar elige a la clienta');
  items.forEach(i => { const p = n.prods.find(x => x.id === i.p); if (p && p.stock != null) p.stock = Math.max(0, p.stock - i.q); });
  n.sales.push({ id: id(), d: A.today(), items, total, paid, cli: c.cli || '' }); save(); CART = null; closeSheet(); toast('Venta anotada'); A.render();
};
ACT.negSaleOpen = a => {
  const s = N().sales.find(x => x.id === a.dataset.id); if (!s) return;
  sheet('Venta', `<div class="sb-form"><div class="ng-total"><span>${dayLbl(s.d)}</span><b>${money(s.total)}</b></div>${s.items.map(i => `<div class="ng-row"><span>${i.q} × ${esc(i.n)}</span><b>${money(i.q * i.pr)}</b></div>`).join('')}<p class="faint">${esc(cliName(s.cli) || 'Sin clienta')} · ${debe(s) > 0 ? 'Debe ' + money(debe(s)) : 'Pagada'}</p>${debe(s) > 0 ? `<button class="sb-act pn pn-pink" data-act="negCobrar" data-id="${s.id}">Marcar como pagada</button>` : ''}<button class="sb-act pn pn-cream" data-act="negSaleDel" data-id="${s.id}">Borrar venta</button></div>`);
};
ACT.negCobrar = a => { const s = N().sales.find(x => x.id === a.dataset.id); if (s) { s.paid = s.total; save(); closeSheet(); toast('Cobrada'); A.render(); } };
ACT.negSaleDel = a => { const n = N(), s = n.sales.find(x => x.id === a.dataset.id); if (!s) return; s.items.forEach(i => { const p = n.prods.find(x => x.id === i.p); if (p && p.stock != null) p.stock += i.q; }); n.sales = n.sales.filter(x => x !== s); save(); closeSheet(); A.render(); };
// ---- productos ----
function productos() {
  const n = N();
  return `<button class="pl-btn" data-act="negProd" style="margin-top:2px">Agregar producto</button>${n.prods.length ? `<div class="ng-prods">${n.prods.map(p => { const m = p.price > 0 ? Math.round((p.price - (p.cost || 0)) / p.price * 100) : 0; return `<button class="ng-prod" data-act="negProd" data-id="${p.id}"><b>${esc(p.n)}</b><em>${money(p.price)}</em><small>Costo ${money(p.cost || 0)} · te deja ${money(p.price - (p.cost || 0))}</small><span class="ng-m ${m < 25 ? 'lo' : ''}">${m}% margen</span>${p.stock != null ? `<span class="ng-st ${p.stock <= 3 ? 'lo' : ''}">${p.stock} en stock</span>` : ''}</button>`; }).join('')}</div>` : empty('Aún no tienes productos', `Agrega los que vendes, por ejemplo: ${T().ej.join(' o ')}.`)}`;
}
ACT.negProd = a => {
  const p = a && a.dataset && a.dataset.id ? N().prods.find(x => x.id === a.dataset.id) : null;
  sheet(p ? 'Editar producto' : 'Nuevo producto', `<div class="sb-form" data-pid="${p ? p.id : ''}"><label class="f">Nombre<input class="in" id="npN" maxlength="30" value="${esc(p ? p.n : '')}" placeholder="${esc(T().ej[0])}"></label><div class="grid2"><label class="f">Precio de venta<input class="in" id="npP" inputmode="decimal" value="${p ? p.price : ''}" placeholder="0.00"></label><label class="f">Cuánto te cuesta<input class="in" id="npC" inputmode="decimal" value="${p ? p.cost || '' : ''}" placeholder="0.00"></label></div><label class="f">Stock (opcional)<input class="in" id="npS" inputmode="numeric" value="${p && p.stock != null ? p.stock : ''}" placeholder="Cuántas tienes"></label><button class="sb-act pn pn-pink" data-act="negProdOk" data-id="${p ? p.id : ''}">Guardar</button>${p ? `<button class="sb-act pn pn-cream" data-act="negProdDel" data-id="${p.id}">Borrar producto</button>` : ''}</div>`);
};
ACT.negProdOk = a => { const n = N(), nm = gid('npN').value.trim(), pr = num(gid('npP').value); if (!nm || !pr) return toast('Falta el nombre o el precio'); const sv = gid('npS').value.trim(), o = { n: nm, price: pr, cost: num(gid('npC').value), stock: sv === '' ? null : Math.max(0, Math.round(+sv || 0)) }; const p = a.dataset.id && n.prods.find(x => x.id === a.dataset.id); if (p) Object.assign(p, o); else n.prods.push({ id: id(), ...o }); save(); closeSheet(); A.render(); };
ACT.negProdDel = a => { const n = N(); n.prods = n.prods.filter(x => x.id !== a.dataset.id); save(); closeSheet(); A.render(); };
// ---- clientas ----
function clientes() {
  const n = N(), pc = porCobrar();
  const rows = n.clients.map(c => { const ss = n.sales.filter(s => s.cli === c.id); return { c, tot: r2(ss.reduce((a, s) => a + s.total, 0)), deb: r2(ss.reduce((a, s) => a + Math.max(0, debe(s)), 0)), n: ss.length }; }).sort((a, b) => b.deb - a.deb || b.tot - a.tot);
  return `<button class="pl-btn" data-act="negCliNew" style="margin-top:2px">Agregar clienta</button>${rows.length ? rows.map(r => `<button class="ng-cli" data-act="negCliOpen" data-id="${r.c.id}"><span class="ng-av">${esc(r.c.n[0].toUpperCase())}</span><span><b>${esc(r.c.n)}</b><small>${r.n} compra${r.n === 1 ? '' : 's'} · ${money(r.tot)}</small></span>${r.deb > 0 ? `<em class="deb">Debe ${money(r.deb)}</em>` : ''}</button>`).join('') : empty('Aún no tienes clientas', 'Guárdalas para saber quién te compra más y quién te debe.')}`;
}
ACT.negCliNew = (a, fromSale) => sheet('Nueva clienta', `<div class="sb-form"><label class="f">Nombre<input class="in" id="ncN" maxlength="30" placeholder="Nombre"></label><label class="f">WhatsApp (opcional)<input class="in" id="ncT" inputmode="tel" placeholder="09XXXXXXXX"></label><button class="sb-act pn pn-pink" data-act="negCliOk" data-sale="${fromSale ? 1 : ''}">Guardar</button></div>`);
ACT.negCliOk = a => { const nm = gid('ncN').value.trim(); if (!nm) return toast('Pon un nombre'); const c = { id: id(), n: nm, tel: gid('ncT').value.replace(/\D/g, '') }; N().clients.push(c); save(); closeSheet(); if (a.dataset.sale && CART) { CART.cli = c.id; ventaSheet(); } else A.render(); };
ACT.negCliOpen = a => {
  const n = N(), c = n.clients.find(x => x.id === a.dataset.id); if (!c) return; const ss = n.sales.filter(s => s.cli === c.id).sort((x, y) => y.d < x.d ? -1 : 1), deb = r2(ss.reduce((t, s) => t + Math.max(0, debe(s)), 0));
  const wa = c.tel ? 'https://wa.me/' + (c.tel.startsWith('0') ? '593' + c.tel.slice(1) : c.tel) + '?text=' + encodeURIComponent(`Hola ${c.n}, te escribo de ${n.name || 'mi negocio'}. Te recuerdo que tienes un saldo pendiente de ${money(deb)}. ¡Gracias!`) : '';
  sheet(c.n, `<div class="sb-form"><div class="ng-total"><span>${deb > 0 ? 'Te debe' : 'Al día'}</span><b>${money(deb)}</b></div>${ss.slice(0, 8).map(s => `<div class="ng-row"><span>${dayLbl(s.d)} · ${esc(s.items.map(i => i.n).join(', ').slice(0, 28))}</span><b>${money(s.total)}</b></div>`).join('') || '<p class="faint">Aún no te ha comprado.</p>'}
${deb > 0 ? `<label class="f">Abonar<input class="in" id="ncAb" inputmode="decimal" placeholder="${deb}"></label><button class="sb-act pn pn-pink" data-act="negAbono" data-id="${c.id}">Registrar pago</button>${wa ? `<a class="sb-act pn pn-cream" style="text-align:center;text-decoration:none" href="${wa}" target="_blank" rel="noopener">Recordarle por WhatsApp</a>` : ''}` : ''}<button class="sb-act pn pn-cream" data-act="negCliDel" data-id="${c.id}">Borrar clienta</button></div>`);
};
ACT.negAbono = a => { const n = N(); let v = num(gid('ncAb').value); if (!v) return toast('Pon cuánto pagó'); n.sales.filter(s => s.cli === a.dataset.id && debe(s) > 0).sort((x, y) => x.d < y.d ? -1 : 1).forEach(s => { const t = Math.min(v, debe(s)); s.paid = r2((s.paid || 0) + t); v = r2(v - t); }); save(); closeSheet(); toast('Pago registrado'); A.render(); };
ACT.negCliDel = a => { const n = N(); n.clients = n.clients.filter(x => x.id !== a.dataset.id); n.sales.forEach(s => { if (s.cli === a.dataset.id) s.cli = ''; }); save(); closeSheet(); A.render(); };
// ---- gastos ----
function gastos() {
  const st = stats(mk()), by = {}; st.ee.forEach(e => { by[e.cat] = (by[e.cat] || 0) + e.amt; });
  return `<button class="pl-btn" data-act="negGasto" style="margin-top:2px">Anotar gasto del negocio</button>${st.ee.length ? `<div class="pn pn-cream ng-sec"><b>En qué se va · ${money(st.gastos)}</b>${Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="ng-row"><span>${esc(k)}</span><b>${money(v)}</b></div>`).join('')}</div>${st.ee.slice().sort((a, b) => b.d < a.d ? -1 : 1).map(e => `<button class="ng-sale" data-act="negGastoOpen" data-id="${e.id}"><span><b>${esc(e.n || e.cat)}</b><small>${dayLbl(e.d)} · ${esc(e.cat)}</small></span><em>${money(e.amt)}</em></button>`).join('')}` : empty('Sin gastos este mes', 'Anota lo que compras para tu negocio: materiales, empaques, publicidad.')}`;
}
let GC = '';
ACT.negGasto = () => { GC = T().exp[0]; sheet('Gasto del negocio', `<div class="sb-form"><label class="f">Cuánto<input class="in" id="ngeA" inputmode="decimal" placeholder="0.00"></label><label class="f">En qué (opcional)<input class="in" id="ngeN" maxlength="40" placeholder="Ej. cajitas"></label><div class="ng-seg wrap">${T().exp.map(c => `<button class="ng-sg ${c === GC ? 'on' : ''}" data-act="negGCat" data-k="${esc(c)}">${esc(c)}</button>`).join('')}</div><button class="sb-act pn pn-pink" data-act="negGastoOk">Guardar</button></div>`); };
ACT.negGCat = a => { GC = a.dataset.k; document.querySelectorAll('.ng-sg').forEach(b => b.classList.toggle('on', b.dataset.k === GC)); };
ACT.negGastoOk = () => { const v = num(gid('ngeA').value); if (!v) return toast('Pon un monto'); N().exps.push({ id: id(), d: A.today(), amt: v, n: gid('ngeN').value.trim(), cat: GC || 'Otros' }); save(); closeSheet(); A.render(); };
ACT.negGastoOpen = a => sheet('Gasto', `<div class="sb-form"><button class="sb-act pn pn-cream" data-act="negGastoDel" data-id="${a.dataset.id}">Borrar este gasto</button></div>`);
ACT.negGastoDel = a => { const n = N(); n.exps = n.exps.filter(x => x.id !== a.dataset.id); save(); closeSheet(); A.render(); };
// ---- ajustes ----
ACT.negAjustes = () => { const n = N(); sheet('Tu negocio', `<div class="sb-form"><label class="f">Nombre<input class="in" id="naN" maxlength="30" value="${esc(n.name)}"></label><label class="f">Meta de ventas del mes (opcional)<input class="in" id="naG" inputmode="decimal" value="${n.goal || ''}" placeholder="0.00"></label><label class="f">Tipo de negocio<select class="in" id="naT">${Object.entries(TIPOS).map(([k, t]) => `<option value="${k}" ${n.tipo === k ? 'selected' : ''}>${t.n}</option>`).join('')}</select></label><button class="sb-act pn pn-pink" data-act="negAjOk">Guardar</button></div>`); };
ACT.negAjOk = () => { const n = N(); n.name = gid('naN').value.trim() || n.name; n.goal = num(gid('naG').value); n.tipo = gid('naT').value; save(); closeSheet(); A.render(); };
// ---------- invitación en Más ----------
sc.more = ((m0) => () => { const h = m0(); if (okAcceso() || S.settings.negPromo || NEG.estado === 'pausado' || Store.mode !== 'supa') return h; const pend = NEG.estado === 'pendiente'; return `<div class="ng-promo"><img class="pixel" alt="" src="${spr('negocio_ic', 5)}"><span><b>¿Tienes un negocio?</b><small>${pend ? 'Ya pediste acceso. Te avisamos cuando esté listo.' : 'Prueba Bolsillito Negocio: ventas, costos y ganancia real.'}</small></span>${pend ? '' : '<button data-act="negPedir">Pedir acceso</button>'}<button class="x" data-act="negCerrarPromo" aria-label="Cerrar">×</button></div>` + h; })(sc.more);
// ---------- panel de la admin ----------
let AD = null, adLoading = false;
function adLoad() { if (adLoading) return; adLoading = true; Store.sb.from('negocio_acceso').select('*').then(async r => { const rows = r.data || []; let nm = {}; try { const { data } = await Store.sb.from('profiles').select('id,name'); (data || []).forEach(p => { nm[p.id] = p.name; }); } catch (e) { } AD = rows.map(x => ({ ...x, pname: nm[x.user_id] || x.nombre || 'Sin nombre' })); }).catch(() => { AD = []; }).finally(() => { adLoading = false; if (S.route === 'admin') A.render(); }); }
A.negAdminHTML = () => {
  if (!AD) { adLoad(); return '<details class="card"><summary><b>Bolsillito Negocio</b></summary><div class="empty">Cargando…</div></details>'; }
  const L = { pendiente: 'Pidió acceso', activo: 'Con acceso', pausado: 'En pausa' }, order = { pendiente: 0, activo: 1, pausado: 2 };
  return `<details class="card" ${AD.some(x => x.estado === 'pendiente') ? 'open' : ''}><summary><b>Bolsillito Negocio (${AD.filter(x => x.estado === 'activo').length} activas${AD.some(x => x.estado === 'pendiente') ? ', ' + AD.filter(x => x.estado === 'pendiente').length + ' por aprobar' : ''})</b></summary>
<p class="faint">Quien pide acceso aparece aquí. Al aprobar, le sale la pestaña Negocio abajo.</p>
<div class="list">${AD.slice().sort((a, b) => order[a.estado] - order[b.estado]).map(x => `<div class="li"><span class="tx-main"><b>${esc(x.pname)}</b><span>${L[x.estado]}</span></span>${x.estado !== 'activo' ? `<button class="btn sm pink" data-act="negAd" data-id="${x.user_id}" data-e="activo">Aprobar</button>` : `<button class="btn sm" data-act="negAd" data-id="${x.user_id}" data-e="pausado">Pausar</button>`}</div>`).join('') || '<div class="empty">Nadie lo ha pedido todavía.</div>'}</div>
<label class="f" style="margin-top:8px">Darle acceso directo a una usuaria<select class="in" id="negAdSel"><option value="">Elige…</option>${(window.App && App.negUsers ? App.negUsers() : []).map(u => `<option value="${u.id}">${esc(u.name || 'Sin nombre')}</option>`).join('')}</select></label><button class="btn sm" data-act="negAdAdd">Dar acceso</button></details>`;
};
A.ACTIONS.negAd = async a => { try { const { error } = await Store.sb.from('negocio_acceso').update({ estado: a.dataset.e, aprobado_at: new Date().toISOString() }).eq('user_id', a.dataset.id); if (error) throw error; const r = AD.find(x => x.user_id === a.dataset.id); if (r) r.estado = a.dataset.e; toast(a.dataset.e === 'activo' ? 'Acceso dado' : 'En pausa'); A.render(); } catch (e) { toast('No se pudo cambiar'); } };
A.ACTIONS.negAdAdd = async () => { const v = (gid('negAdSel') || {}).value; if (!v) return toast('Elige a una usuaria'); try { const { error } = await Store.sb.from('negocio_acceso').upsert({ user_id: v, estado: 'activo', aprobado_at: new Date().toISOString() }); if (error) throw error; AD = null; toast('Acceso dado'); A.render(); } catch (e) { toast('No se pudo dar acceso'); } };
})();
