// ===== Bolsillito Negocio: ventas, costos, ganancia real, clientes y stock para emprendedoras =====
(function () {
const A = App, S = A.S, { esc, money, toast, openSheet, closeSheet } = A, sc = A.screens, ACT = A.ACTIONS;
A.PAGES.negocio = 'Negocio';
const spr = (n, k) => Pix.sprite(n, k || 3);
const sheet = (t, h) => openSheet(t, h, sh => (sh.classList.add('nvx'), sh.addEventListener('click', ev => { const b = ev.target.closest('[data-act]'); if (b && ACT[b.dataset.act]) { ev.stopPropagation(); ACT[b.dataset.act](b); } })));
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
  belleza: { n: 'Maquillaje y belleza', s: 'labial', exp: ['Mercadería', 'Empaques', 'Envíos', 'Publicidad', 'Comisiones', 'Otros'], ej: ['Labial', 'Set de skincare'] },
  ropa: { n: 'Ropa y accesorios', s: 'bolsa', exp: ['Mercadería', 'Empaques', 'Envíos', 'Publicidad', 'Local o feria', 'Otros'], ej: ['Aretes', 'Blusa'] },
  manual: { n: 'Manualidades', s: 'gift', exp: ['Materiales', 'Empaques', 'Envíos', 'Publicidad', 'Herramientas', 'Otros'], ej: ['Pulsera', 'Tarjeta'] },
  servicios: { n: 'Servicios', s: 'unas', exp: ['Materiales', 'Transporte', 'Publicidad', 'Herramientas', 'Capacitación', 'Otros'], ej: ['Peinado', 'Uñas'] },
  otro: { n: 'Otro negocio', s: 'maletin', exp: ['Materiales', 'Empaques', 'Transporte', 'Publicidad', 'Otros'], ej: ['Producto', 'Servicio'] }
};
const T = () => TIPOS[N().tipo] || TIPOS.otro;
// ---------- iconos ----------
(function () {
  const mk = (w, h) => { const g = Array.from({ length: h }, () => Array(w).fill('.')); return { r: (x, y, a, b, c) => { for (let j = y; j < y + b; j++) for (let i = x; i < x + a; i++) g[j][i] = c; }, p: (x, y, c) => { g[y][x] = c; }, out: () => g.map(r => r.join('')) }; };
  // tienda con toldo
  let m = mk(16, 16); const aw = x => ((x - 1) >> 1) % 2 ? '2' : '1';
  for (let x = 1; x < 15; x++) { m.p(x, 1, '0'); m.p(x, 2, aw(x)); m.p(x, 3, aw(x)); m.p(x, 4, aw(x) === '1' ? '7' : '4'); if (aw(x) === '1') m.p(x, 5, '7'); }
  for (let y = 2; y < 5; y++) { m.p(0, y, '0'); m.p(15, y, '0'); }
  m.r(2, 6, 12, 9, '3'); m.r(2, 13, 12, 2, '4'); m.r(2, 6, 1, 7, '9'); for (let y = 5; y < 15; y++) { m.p(1, y, '0'); m.p(14, y, '0'); } m.r(2, 15, 12, 1, '0'); m.r(2, 5, 1, 1, '0'); m.r(13, 5, 1, 1, '0');
  m.r(4, 9, 3, 6, '5'); m.r(6, 9, 1, 6, '7'); m.p(5, 12, '8'); m.r(3, 8, 5, 1, '0'); m.p(3, 9, '0'); m.p(7, 9, '0');
  m.r(9, 8, 4, 4, '6'); m.p(9, 8, '9'); m.p(9, 9, '9'); m.r(8, 7, 6, 1, '0'); m.r(8, 12, 6, 1, '0'); for (let y = 8; y < 12; y++) { m.p(8, y, '0'); m.p(13, y, '0'); } m.r(11, 8, 1, 4, '0');
  Pix.define('negocio_ic', { raw: m.out(), pal: '#a8586e,#f58aa8,#fff7ee,#ffe6c2,#e7c49a,#d9946a,#bfe4f6,#d9658a,#f7cb4d,#ffffff' });
  // maletita (planes)
  m = mk(16, 16); m.r(5, 1, 6, 1, '0'); for (let y = 2; y < 4; y++) { m.p(5, y, '0'); m.p(10, y, '0'); m.p(6, y, '.'); }
  m.r(1, 4, 14, 11, '1'); m.r(1, 13, 14, 2, '7'); m.r(3, 5, 1, 7, '9'); m.r(4, 4, 2, 11, '8'); m.r(10, 4, 2, 11, '8'); m.r(1, 8, 14, 1, '7');
  m.r(7, 7, 2, 3, '8'); m.p(7, 9, '0'); for (let x = 1; x < 15; x++) { m.p(x, 3, '0'); m.p(x, 15, '0'); } for (let y = 4; y < 15; y++) { m.p(0, y, '0'); m.p(15, y, '0'); } m.p(0, 3, '.'); m.p(15, 3, '.');
  Pix.define('plan_ic', { raw: m.out(), pal: '#b4566f,#f9a6bf,#fff7ee,#ffe6c2,#e7c49a,#d9946a,#bfe4f6,#e0708f,#f7cb4d,#ffffff' });
  // sobre con billete (sobres)
  m = mk(16, 16); m.r(3, 1, 10, 7, '5'); m.r(3, 6, 10, 2, '6'); m.r(7, 3, 2, 3, '8'); for (let x = 3; x < 13; x++) m.p(x, 0, '6'); for (let y = 1; y < 8; y++) { m.p(2, y, '6'); m.p(13, y, '6'); } m.p(4, 2, '9'); m.p(11, 4, '9');
  m.r(1, 7, 14, 8, '3'); m.r(1, 13, 14, 2, '4'); for (let i = 0; i < 6; i++) { m.p(2 + i, 8 + i, '4'); m.p(13 - i, 8 + i, '4'); }
  for (let x = 0; x < 16; x++) { m.p(x, 15, '0'); } for (let y = 7; y < 16; y++) { m.p(0, y, '0'); m.p(15, y, '0'); } for (let x = 0; x < 16; x++) m.p(x, 7, x > 1 && x < 14 ? '3' : '0');
  [[6, 10], [9, 10], [6, 11], [7, 11], [8, 11], [9, 11], [7, 12], [8, 12]].forEach(([x, y]) => m.p(x, y, '1')); m.p(6, 10, '9'); m.p(7, 13, '7'); m.p(8, 13, '7');
  Pix.define('sobre_ic', { raw: m.out(), pal: '#c79a6a,#f58aa8,#fff7ee,#ffe6c2,#e7c49a,#a6e08a,#5f9a4c,#d9658a,#f7cb4d,#ffffff' });
  Object.values(A.PACKS || {}).forEach(p => { if (p.map) { p.map.negocio = p === A.PACKS.pixel ? 's:negocio_ic' : 's:gem'; } });
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
const tabs = [['resumen', 'Resumen'], ['ventas', 'Ventas'], ['productos', 'Productos'], ['clientes', 'Clientas'], ['gastos', 'Gastos']];
const pet = () => { try { return A.petInfo(A.petActive ? A.petActive() : 'gochi').sprite; } catch (e) { return 'gochi'; } };
const ic = (n, z, bg) => `<span class="ng-ic" style="${bg ? 'background:' + bg : ''}"><img class="pixel" alt="" src="${spr(Pix.has(n) ? n : 'moneda', 3)}" style="width:${z || 28}px;height:${z || 28}px"></span>`;
const empty = (t, s) => `<div class="card ng-empty"><img class="pixel" alt="" src="${spr('negocio_ic', 6)}"><b>${t}</b><span class="faint">${s}</span></div>`;
const cta = (act, t, extra) => `<button class="btn pink ng-cta" data-act="${act}" ${extra || ''}>${t}</button>`;
sc.negocio = () => {
  if (!okAcceso()) return lockedHTML();
  const n = N(); if (!n.tipo) return setupHTML();
  syncLinks();
  const body = { resumen, ventas, productos, clientes, gastos }[TAB]();
  return `<div class="ph"><div class="ph-left"><span class="pill">${esc(n.name || 'Negocio')}</span><button class="ph-icon" data-act="pageicon" data-k="negocio" aria-label="Cambiar icono">${A.iconHTML(A.pageIcon('negocio'), 34)}</button></div><button class="round-btn" data-act="negAjustes" aria-label="Ajustes del negocio"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/></svg></button></div>
<div class="seg ng-seg5">${tabs.map(([k, t]) => `<button data-act="negTab" data-k="${k}" aria-pressed="${TAB === k}">${t}</button>`).join('')}</div><div class="stack ng-body">${body}</div>`;
};
function lockedHTML() {
  const e = NEG.estado;
  const btn = e === 'pendiente' ? '<div class="card flat ng-wait">Ya pediste acceso. Meffy lo revisa y te aparece aquí.</div>' : e === 'pausado' ? '<div class="card flat ng-wait">Tu acceso está en pausa por ahora.</div>' : cta('negPedir', 'Pedir acceso');
  return `<div class="ph"><div class="ph-left"><span class="pill">Negocio</span><button class="ph-icon" data-act="pageicon" data-k="negocio">${A.iconHTML(A.pageIcon('negocio'), 34)}</button></div></div>
<div class="stack"><div class="card ng-hero"><img class="pixel" alt="" src="${spr('negocio_ic', 7)}"><b class="mid">Bolsillito Negocio</b><span class="faint">Para emprendedoras: lleva tus ventas, tus costos y cuánto ganas de verdad, con el mismo estilo de tu Bolsillito.</span></div>
<div class="card"><div class="ng-feat">${[['ticket', 'Ventas en segundos', 'Anota lo que vendes y quién te debe', '#e3f3df'], ['alcancia', 'Ganancia real', 'Sabe si ganaste o solo moviste plata', '#fde3ea'], ['bolsa', 'Productos y stock', 'Con tu margen y avisos cuando se acaban', '#fff4c2'], ['gochi', 'Clientas', 'Fiados, abonos y recordatorio por WhatsApp', '#e1effb']].map(a => `<div class="ng-fr">${ic(a[0], 28, a[3])}<span><b>${a[1]}</b><small class="faint">${a[2]}</small></span></div>`).join('')}</div></div>${btn}</div>`;
}
function setupHTML() {
  return `<div class="ph"><div class="ph-left"><span class="pill">Negocio</span></div></div>
<div class="stack"><div class="card ng-hero"><img class="pixel" alt="" src="${spr('negocio_ic', 7)}"><b class="mid">Armemos tu negocio</b><span class="faint">Dime qué vendes y lo dejo listo para ti.</span></div>
<label class="f">Nombre de tu negocio<input class="in" id="ngNom" maxlength="30" placeholder="Ej. Dulces de Mefi"></label>
<div class="ng-types">${Object.entries(TIPOS).map(([k, t]) => `<button class="card ng-type" data-act="negTipo" data-k="${k}">${ic(t.s, 34)}<b>${t.n}</b></button>`).join('')}</div></div>`;
}
ACT.negTipo = a => { const n = N(), v = (gid('ngNom') || {}).value || ''; n.tipo = a.dataset.k; n.name = v.trim() || 'Mi negocio'; save(); A.render(); };
ACT.negTab = a => { TAB = a.dataset.k; A.render(); };
// ---- resumen ----
function evs(name, icn, bg, v, m, col) { return `<div class="evs"><span class="evs-ic" style="background:${bg}">${A.px(Pix.has(icn) ? icn : 'moneda', 26)}</span><div class="evs-b"><div class="evs-t"><b>${name}</b><span class="num"><b>${money(v)}</b></span></div><div class="evs-track"><i class="real" style="width:${m ? Math.max(2, v / m * 100) : 0}%;background:${col}"></i></div></div></div>`; }
function resumen() {
  const n = N(), k = mk(), st = stats(k), cur = k === A.ym(A.today()), pc = porCobrar(), deb = r2(pc.reduce((a, s) => a + debe(s), 0));
  const gan = st.ganancia, sin = !st.ss.length && !st.ee.length, mx = Math.max(st.ventas, st.costo, st.gastos, 1);
  const msg = sin ? 'Aún no hay movimientos este mes' : gan > 0 ? `Por cada $1 vendido te quedan ${(gan / Math.max(st.ventas, 1) * 100).toFixed(0)} centavos` : gan === 0 ? 'Quedaste en cero: lo que entró se fue' : 'Por ahora solo moviste plata: gastaste más de lo que ganaste';
  const d7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); const lt = new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); return { l: DIA[d.getDay()], v: n.sales.filter(x => x.d === lt).reduce((a, x) => a + x.total, 0) }; });
  const m7 = Math.max(1, ...d7.map(x => x.v)), low = n.prods.filter(p => p.stock != null && p.stock <= 3), pagado = r2(n.pays.filter(p => ym(p.d) === k).reduce((a, p) => a + p.amt, 0));
  const mes = MES[+k.slice(5) - 1];
  return `<div class="ng-mes"><button class="navarrow" data-act="negMes" data-d="-1" aria-label="Mes anterior">‹</button><span class="pill">${mes[0].toUpperCase() + mes.slice(1)} ${k.slice(0, 4)}</span><button class="navarrow" data-act="negMes" data-d="1" ${cur ? 'disabled' : ''} aria-label="Mes siguiente">›</button></div>
<div class="card ng-gan"><span class="ng-gi">${A.px('alcancia', 44)}</span><div><b class="big ${gan < 0 ? 'ng-neg' : 'ng-pos'}">${money(gan)}</b><div class="faint">Tu ganancia real</div></div></div>
<p class="faint ng-msg">${msg}</p>
${cta('negVenta', 'Anotar una venta')}
<div class="card"><h3>De dónde sale</h3>${evs('Vendiste', 'alcancia', '#e3f3df', st.ventas, mx, '#7cc29a')}${evs('Costo de lo vendido', 'bolsa', '#fde3ea', st.costo, mx, '#f27ea1')}${evs('Gastos del negocio', 'ticket', '#fff4c2', st.gastos, mx, '#f2b45a')}</div>
${n.goal > 0 ? `<div class="card"><h3>Meta del mes</h3><div class="row" style="justify-content:space-between;margin-bottom:6px"><b class="num">${money(st.ventas)} <span class="faint">de ${money(n.goal)}</span></b><b style="color:#f27ea1">${Math.min(100, Math.round(st.ventas / n.goal * 100))}%</b></div><div class="evs-track"><i class="real" style="width:${Math.min(100, st.ventas / n.goal * 100)}%;background:#f27ea1"></i></div></div>` : ''}
${deb > 0 ? `<button class="card ng-por" data-act="negTab" data-k="clientes">${ic('gochi', 28, '#fde3ea')}<span><b>Te deben ${money(deb)}</b><small class="faint">${new Set(pc.map(s => s.cli || s.id)).size} por cobrar · toca para verlos</small></span><i>›</i></button>` : ''}
<div class="card"><h3>Últimos 7 días</h3><div class="ng-chart">${d7.map(x => `<div><small class="num">${x.v ? Math.round(x.v) : ''}</small><i style="height:${Math.max(4, Math.round(x.v / m7 * 64))}px" class="${x.v ? 'on' : ''}"></i><em>${x.l}</em></div>`).join('')}</div></div>
${st.top.length ? `<div class="card"><h3>Lo que más te deja</h3><div class="list">${st.top.map((t, i) => `<div class="li income"><span class="ic"><b>${i + 1}</b></span><span class="tx-main"><b>${esc(t.n)}</b><span>${t.q} vendido${t.q === 1 ? '' : 's'}</span></span><span class="amt">${money(t.g)}</span></div>`).join('')}</div></div>` : ''}
${low.length ? `<div class="card"><h3>Se te están acabando</h3><div class="list">${low.map(p => `<div class="li"><span class="ic">${A.px('bolsa', 24)}</span><span class="tx-main"><b>${esc(p.n)}</b><span>${p.stock === 0 ? 'Se acabó' : 'Quedan ' + p.stock}</span></span></div>`).join('')}</div></div>` : ''}
<div class="card"><h3>Pagarte un sueldo</h3><p class="faint" style="margin:0 0 10px">Pasa plata del negocio a tus ingresos personales.${pagado ? ' Este mes ya te pagaste ' + money(pagado) + '.' : ''}</p><button class="btn ng-cta" data-act="negSueldo">Pagarme</button></div>`;
}
ACT.negMes = a => { const [y, m] = mk().split('-').map(Number), d = new Date(y, m - 1 + (+a.dataset.d), 1); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); if (k <= A.ym(A.today())) { A._negM = k; A.render(); } };
ACT.negSueldo = () => sheet('Pagarme mi sueldo', `<div class="stack"><p class="faint">Se anota como ingreso en tu plata personal y queda registrado en el negocio.</p><label class="f">Cuánto<input class="in" id="ngPay" inputmode="decimal" placeholder="0.00" value="${Math.max(0, stats(A.ym(A.today())).ganancia) || ''}"></label><button class="btn pink ng-cta" data-act="negSueldoOk">Pagarme</button></div>`);
ACT.negSueldoOk = () => { const v = num(gid('ngPay').value); if (!v) return toast('Pon un monto'); const inc = S.fin.categories.find(c => c.type === 'income'); A.addTx({ type: 'income', amount: v, cat: inc ? inc.id : null, acct: S.settings.defaultAcct || (S.fin.accounts[0] || {}).id, date: A.today(), note: 'Sueldo de ' + (N().name || 'mi negocio') }); N().pays.push({ id: id(), d: A.today(), amt: v }); save(); closeSheet(); toast('Listo, ya está en tus ingresos'); A.render(); };
// ---- ventas ----
let CART = null;
const dayLbl = d => { const t = A.today(); if (d === t) return 'Hoy'; const x = new Date(d + 'T12:00'); return `${DIA[x.getDay()]} ${x.getDate()} de ${MES[x.getMonth()]}`; };
function ventas() {
  const st = stats(mk()), by = {}; st.ss.slice().sort((a, b) => b.d < a.d ? -1 : 1).forEach(s => (by[s.d] = by[s.d] || []).push(s));
  const ks = Object.keys(by);
  return `${cta('negVenta', 'Anotar una venta')}${ks.length ? ks.map(d => `<div class="card"><h3>${dayLbl(d)} · ${money(by[d].reduce((a, s) => a + s.total, 0))}</h3><div class="list">${by[d].map(s => `<button class="li ${debe(s) > 0 ? '' : 'income'}" data-act="negSaleOpen" data-id="${s.id}"><span class="ic">${A.px('ticket', 24)}</span><span class="tx-main"><b>${esc(s.items.map(i => (i.q > 1 ? i.q + ' ' : '') + i.n).join(', '))}</b><span>${s.tx ? 'De tu plata' : esc(cliName(s.cli) || 'Sin clienta')}${debe(s) > 0 ? ' · debe ' + money(debe(s)) : ''}</span></span><span class="amt">${money(s.total)}</span></button>`).join('')}</div></div>`).join('') : empty('Aún no hay ventas este mes', 'Cuando vendas algo, anótalo aquí en segunditos.')}`;
}
ACT.negVenta = () => { CART = { items: {}, cli: '', pago: 'todo', ab: '', otro: '' }; ventaSheet(); };
function ventaSheet() {
  const n = N(), c = CART, tot = cartTotal();
  openSheet('Nueva venta', `<div class="stack ng-f ng-vf">
${n.prods.length ? `<div class="ng-pick">${n.prods.map(p => { const q = c.items[p.id] || 0; return `<div class="ng-pk ${q ? 'on' : ''}"><div><b>${esc(p.n)}</b><small>${money(p.price)}${p.stock != null ? ' · quedan ' + p.stock : ''}</small></div><div class="ng-step"><button data-act="negQ" data-p="${p.id}" data-d="-1">−</button><span>${q}</span><button data-act="negQ" data-p="${p.id}" data-d="1">+</button></div></div>`; }).join('')}</div>` : '<p class="faint">Aún no tienes productos. Puedes anotar una venta suelta aquí abajo.</p>'}
<div class="ng-otro"><input class="in" id="ngOn" placeholder="Venta suelta: qué fue" value="${esc(c.on || '')}"><input class="in" id="ngOp" inputmode="decimal" placeholder="$" value="${esc(c.op || '')}"></div>
<label class="f">Clienta<select class="in" id="ngCli"><option value="">Sin clienta</option>${n.clients.map(x => `<option value="${x.id}" ${c.cli === x.id ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}<option value="+">+ Clienta nueva</option></select></label>
<div class="seg">${[['todo', 'Pagó todo'], ['fiado', 'Fiado'], ['abono', 'Abono']].map(([k, t]) => `<button data-act="negPago" data-k="${k}" aria-pressed="${c.pago === k}">${t}</button>`).join('')}</div>
${c.pago === 'abono' ? `<label class="f">Cuánto abonó<input class="in" id="ngAb" inputmode="decimal" placeholder="0.00" value="${esc(c.ab || '')}"></label>` : ''}
<div class="ng-total"><span>Total</span><b id="ngTot">${money(tot)}</b></div>
<button class="btn pink ng-cta" data-act="negVentaOk">Guardar venta</button></div>`, sh => {
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
  sheet('Venta', `<div class="stack ng-f"><div class="ng-total"><span>${dayLbl(s.d)}</span><b>${money(s.total)}</b></div>${s.items.map(i => `<div class="ng-row"><span>${i.q} × ${esc(i.n)}</span><b>${money(i.q * i.pr)}</b></div>`).join('')}<p class="faint">${esc(cliName(s.cli) || 'Sin clienta')} · ${debe(s) > 0 ? 'Debe ' + money(debe(s)) : 'Pagada'}</p>${debe(s) > 0 ? `<button class="btn pink ng-cta" data-act="negCobrar" data-id="${s.id}">Marcar como pagada</button>` : ''}<button class="btn ng-cta" data-act="negSaleDel" data-id="${s.id}">Borrar venta</button></div>`);
};
ACT.negCobrar = a => { const s = N().sales.find(x => x.id === a.dataset.id); if (s) { s.paid = s.total; save(); closeSheet(); toast('Cobrada'); A.render(); } };
ACT.negSaleDel = a => { const n = N(), s = n.sales.find(x => x.id === a.dataset.id); if (!s) return; s.items.forEach(i => { const p = n.prods.find(x => x.id === i.p); if (p && p.stock != null) p.stock += i.q; }); n.sales = n.sales.filter(x => x !== s); save(); closeSheet(); A.render(); };
// ---- productos ----
function productos() {
  const n = N();
  return `${cta('negProd', 'Agregar producto')}${n.prods.length ? `<div class="ng-prods">${n.prods.map(p => { const m = p.price > 0 ? Math.round((p.price - (p.cost || 0)) / p.price * 100) : 0; return `<button class="card ng-prod" data-act="negProd" data-id="${p.id}"><b>${esc(p.n)}</b><span class="mid">${money(p.price)}</span><small class="faint">Te cuesta ${money(p.cost || 0)} · te deja ${money(p.price - (p.cost || 0))}</small><span class="ng-tags"><em class="${m < 25 ? 'lo' : 'ok'}">${m}% margen</em>${p.stock != null ? `<em class="${p.stock <= 3 ? 'lo' : 'st'}">${p.stock} en stock</em>` : ''}</span></button>`; }).join('')}</div>` : empty('Aún no tienes productos', `Agrega los que vendes, por ejemplo: ${T().ej.join(' o ')}.`)}`;
}
ACT.negProd = a => {
  const p = a && a.dataset && a.dataset.id ? N().prods.find(x => x.id === a.dataset.id) : null;
  sheet(p ? 'Editar producto' : 'Nuevo producto', `<div class="stack ng-f" data-pid="${p ? p.id : ''}"><label class="f">Nombre<input class="in" id="npN" maxlength="30" value="${esc(p ? p.n : '')}" placeholder="${esc(T().ej[0])}"></label><div class="grid2"><label class="f">Precio de venta<input class="in" id="npP" inputmode="decimal" value="${p ? p.price : ''}" placeholder="0.00"></label><label class="f">Cuánto te cuesta<input class="in" id="npC" inputmode="decimal" value="${p ? p.cost || '' : ''}" placeholder="0.00"></label></div><label class="f">Stock (opcional)<input class="in" id="npS" inputmode="numeric" value="${p && p.stock != null ? p.stock : ''}" placeholder="Cuántas tienes"></label><button class="btn pink ng-cta" data-act="negProdOk" data-id="${p ? p.id : ''}">Guardar</button>${p ? `<button class="btn ng-cta" data-act="negProdDel" data-id="${p.id}">Borrar producto</button>` : ''}</div>`);
};
ACT.negProdOk = a => { const n = N(), nm = gid('npN').value.trim(), pr = num(gid('npP').value); if (!nm || !pr) return toast('Falta el nombre o el precio'); const sv = gid('npS').value.trim(), o = { n: nm, price: pr, cost: num(gid('npC').value), stock: sv === '' ? null : Math.max(0, Math.round(+sv || 0)) }; const p = a.dataset.id && n.prods.find(x => x.id === a.dataset.id); if (p) Object.assign(p, o); else n.prods.push({ id: id(), ...o }); save(); closeSheet(); A.render(); };
ACT.negProdDel = a => { const n = N(); n.prods = n.prods.filter(x => x.id !== a.dataset.id); save(); closeSheet(); A.render(); };
// ---- clientas ----
function clientes() {
  const n = N();
  const rows = n.clients.map(c => { const ss = n.sales.filter(s => s.cli === c.id); return { c, tot: r2(ss.reduce((a, s) => a + s.total, 0)), deb: r2(ss.reduce((a, s) => a + Math.max(0, debe(s)), 0)), n: ss.length }; }).sort((a, b) => b.deb - a.deb || b.tot - a.tot);
  return `${cta('negCliNew', 'Agregar clienta')}${rows.length ? `<div class="card"><div class="list">${rows.map(r => `<button class="li ${r.deb > 0 ? '' : 'income'}" data-act="negCliOpen" data-id="${r.c.id}"><span class="ic ng-av">${esc(r.c.n[0].toUpperCase())}</span><span class="tx-main"><b>${esc(r.c.n)}</b><span>${r.n} compra${r.n === 1 ? '' : 's'} · ${money(r.tot)}</span></span>${r.deb > 0 ? `<span class="amt" style="color:#d4546e">Debe ${money(r.deb)}</span>` : ''}</button>`).join('')}</div></div>` : empty('Aún no tienes clientas', 'Guárdalas para saber quién te compra más y quién te debe.')}`;
}
ACT.negCliNew = (a, fromSale) => sheet('Nueva clienta', `<div class="stack ng-f"><label class="f">Nombre<input class="in" id="ncN" maxlength="30" placeholder="Nombre"></label><label class="f">WhatsApp (opcional)<input class="in" id="ncT" inputmode="tel" placeholder="09XXXXXXXX"></label><button class="btn pink ng-cta" data-act="negCliOk" data-sale="${fromSale ? 1 : ''}">Guardar</button></div>`);
ACT.negCliOk = a => { const nm = gid('ncN').value.trim(); if (!nm) return toast('Pon un nombre'); const c = { id: id(), n: nm, tel: gid('ncT').value.replace(/\D/g, '') }; N().clients.push(c); save(); closeSheet(); if (a.dataset.sale && CART) { CART.cli = c.id; ventaSheet(); } else A.render(); };
ACT.negCliOpen = a => {
  const n = N(), c = n.clients.find(x => x.id === a.dataset.id); if (!c) return; const ss = n.sales.filter(s => s.cli === c.id).sort((x, y) => y.d < x.d ? -1 : 1), deb = r2(ss.reduce((t, s) => t + Math.max(0, debe(s)), 0));
  const wa = c.tel ? 'https://wa.me/' + (c.tel.startsWith('0') ? '593' + c.tel.slice(1) : c.tel) + '?text=' + encodeURIComponent(`Hola ${c.n}, te escribo de ${n.name || 'mi negocio'}. Te recuerdo que tienes un saldo pendiente de ${money(deb)}. ¡Gracias!`) : '';
  sheet(c.n, `<div class="stack ng-f"><div class="ng-total"><span>${deb > 0 ? 'Te debe' : 'Al día'}</span><b>${money(deb)}</b></div>${ss.slice(0, 8).map(s => `<div class="ng-row"><span>${dayLbl(s.d)} · ${esc(s.items.map(i => i.n).join(', ').slice(0, 28))}</span><b>${money(s.total)}</b></div>`).join('') || '<p class="faint">Aún no te ha comprado.</p>'}
${deb > 0 ? `<label class="f">Abonar<input class="in" id="ncAb" inputmode="decimal" placeholder="${deb}"></label><button class="btn pink ng-cta" data-act="negAbono" data-id="${c.id}">Registrar pago</button>${wa ? `<a class="btn ng-cta" style="text-decoration:none" href="${wa}" target="_blank" rel="noopener">Recordarle por WhatsApp</a>` : ''}` : ''}<button class="btn ng-cta" data-act="negCliDel" data-id="${c.id}">Borrar clienta</button></div>`);
};
ACT.negAbono = a => { const n = N(); let v = num(gid('ncAb').value); if (!v) return toast('Pon cuánto pagó'); n.sales.filter(s => s.cli === a.dataset.id && debe(s) > 0).sort((x, y) => x.d < y.d ? -1 : 1).forEach(s => { const t = Math.min(v, debe(s)); s.paid = r2((s.paid || 0) + t); v = r2(v - t); }); save(); closeSheet(); toast('Pago registrado'); A.render(); };
ACT.negCliDel = a => { const n = N(); n.clients = n.clients.filter(x => x.id !== a.dataset.id); n.sales.forEach(s => { if (s.cli === a.dataset.id) s.cli = ''; }); save(); closeSheet(); A.render(); };
// ---- gastos ----
function gastos() {
  const st = stats(mk()), by = {}; st.ee.forEach(e => { by[e.cat] = (by[e.cat] || 0) + e.amt; });
  return `${cta('negGasto', 'Anotar un gasto del negocio')}${st.ee.length ? `<div class="card"><h3>En qué se va · ${money(st.gastos)}</h3>${Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="evs"><div class="evs-b"><div class="evs-t"><b>${esc(k)}</b><span class="num"><b>${money(v)}</b></span></div><div class="evs-track"><i class="real" style="width:${Math.max(3, v / st.gastos * 100)}%;background:#f2b45a"></i></div></div></div>`).join('')}</div><div class="card"><h3>Movimientos</h3><div class="list">${st.ee.slice().sort((a, b) => b.d < a.d ? -1 : 1).map(e => `<button class="li" data-act="negGastoOpen" data-id="${e.id}"><span class="ic">${A.px('bolsa', 24)}</span><span class="tx-main"><b>${esc(e.n || e.cat)}</b><span>${dayLbl(e.d)} · ${esc(e.cat)}${e.tx ? ' · de tu plata' : ''}</span></span><span class="amt">${money(e.amt)}</span></button>`).join('')}</div></div>` : empty('Sin gastos este mes', 'Anota lo que compras para tu negocio: materiales, empaques, publicidad.')}`;
}
let GC = '';
ACT.negGasto = () => { GC = T().exp[0]; sheet('Gasto del negocio', `<div class="stack ng-f"><label class="f">Cuánto<input class="in" id="ngeA" inputmode="decimal" placeholder="0.00"></label><label class="f">En qué (opcional)<input class="in" id="ngeN" maxlength="40" placeholder="Ej. cajitas"></label><div class="chips">${T().exp.map(c => `<button class="chip" aria-pressed="${c === GC}" data-act="negGCat" data-k="${esc(c)}">${esc(c)}</button>`).join('')}</div><button class="btn pink ng-cta" data-act="negGastoOk">Guardar</button></div>`); };
ACT.negGCat = a => { GC = a.dataset.k; document.querySelectorAll('.chip[data-act=negGCat]').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === GC)); };
ACT.negGastoOk = () => { const v = num(gid('ngeA').value); if (!v) return toast('Pon un monto'); N().exps.push({ id: id(), d: A.today(), amt: v, n: gid('ngeN').value.trim(), cat: GC || 'Otros' }); save(); closeSheet(); A.render(); };
ACT.negGastoOpen = a => sheet('Gasto', `<div class="stack ng-f"><button class="btn ng-cta" data-act="negGastoDel" data-id="${a.dataset.id}">Borrar este gasto</button></div>`);
ACT.negGastoDel = a => { const n = N(); n.exps = n.exps.filter(x => x.id !== a.dataset.id); save(); closeSheet(); A.render(); };

// ---------- vincular con mi plata personal ----------
function syncLinks() {
  const n = N(), L = n.link; if (!L || (!(L.cats || []).length && !(L.accts || []).length)) return;
  const hit = t => (t.type === 'income' || t.type === 'expense') && t.date >= (L.since || '0000') && ((L.cats || []).includes(t.cat) || (L.accts || []).includes(t.acct));
  const live = new Map(S.tx.filter(hit).map(t => [t.id, t])); let ch = false;
  n.sales = n.sales.filter(x => { if (!x.tx) return true; const t = live.get(x.tx); if (!t || t.type !== 'income') { ch = true; return false; } if (x.total !== t.amount) { x.total = x.paid = t.amount; x.items[0].pr = t.amount; ch = true; } return true; });
  n.exps = n.exps.filter(x => { if (!x.tx) return true; const t = live.get(x.tx); if (!t || t.type !== 'expense') { ch = true; return false; } if (x.amt !== t.amount) { x.amt = t.amount; ch = true; } return true; });
  const have = new Set([...n.sales, ...n.exps].filter(x => x.tx).map(x => x.tx));
  live.forEach(t => { if (have.has(t.id)) return; const nm = (t.note || '').trim() || (A.cat(t.cat) || {}).name || 'Movimiento'; if (t.type === 'income') n.sales.push({ id: id(), d: t.date, items: [{ p: null, n: nm, q: 1, pr: t.amount, c: 0 }], total: t.amount, paid: t.amount, cli: '', tx: t.id }); else n.exps.push({ id: id(), d: t.date, amt: t.amount, n: nm, cat: (A.cat(t.cat) || {}).name || 'Otros', tx: t.id }); ch = true; });
  if (ch) save();
}
let VK = null;
ACT.negVinc = () => {
  const n = N(), L = n.link || {}; VK = { cats: new Set(L.cats || []), accts: new Set(L.accts || []), since: L.since || A.ym(A.today()) + '-01' };
  const cats = S.fin.categories.filter(c => !A.isSaving(c)), accts = S.fin.accounts;
  sheet('Vincular con mi plata', `<div class="stack ng-f"><p class="faint">Elige qué categorías o cuentas de tu plata personal son de tu negocio. Lo que anotes ahí pasa solo al negocio: los gastos como gastos y los ingresos como ventas.</p>
<b style="color:#5a3a3a;font-size:13px">Categorías</b><div class="chips">${cats.map(c => `<button class="chip" aria-pressed="${VK.cats.has(c.id)}" data-act="negVk" data-w="cats" data-k="${esc(c.id)}">${esc(c.name)}</button>`).join('')}</div>
<b style="color:#5a3a3a;font-size:13px">Cuentas</b><div class="chips">${accts.map(c => `<button class="chip" aria-pressed="${VK.accts.has(c.id)}" data-act="negVk" data-w="accts" data-k="${esc(c.id)}">${esc(c.name)}</button>`).join('')}</div>
<label class="f">Traer movimientos desde<input class="in" id="ngSince" type="date" value="${VK.since}"></label>
<button class="btn pink ng-cta" data-act="negVincOk">Guardar vínculo</button>${(L.cats || L.accts) ? '<button class="btn ng-cta" data-act="negVincQuitar">Quitar vínculo</button>' : ''}</div>`);
};
ACT.negVk = a => { const s = VK[a.dataset.w], k = a.dataset.k; if (s.has(k)) s.delete(k); else s.add(k); a.setAttribute('aria-pressed', s.has(k)); };
ACT.negVincOk = () => { N().link = { cats: [...VK.cats], accts: [...VK.accts], since: (gid('ngSince') || {}).value || VK.since }; syncLinks(); save(); closeSheet(); toast('Vinculado'); A.render(); };
ACT.negVincQuitar = () => { const n = N(); n.sales = n.sales.filter(x => !x.tx); n.exps = n.exps.filter(x => !x.tx); n.link = null; save(); closeSheet(); toast('Vínculo quitado'); A.render(); };
// ---- ajustes ----
ACT.negAjustes = () => { const n = N(); sheet('Tu negocio', `<div class="stack ng-f"><label class="f">Nombre<input class="in" id="naN" maxlength="30" value="${esc(n.name)}"></label><label class="f">Meta de ventas del mes (opcional)<input class="in" id="naG" inputmode="decimal" value="${n.goal || ''}" placeholder="0.00"></label><label class="f">Tipo de negocio<select class="in" id="naT">${Object.entries(TIPOS).map(([k, t]) => `<option value="${k}" ${n.tipo === k ? 'selected' : ''}>${t.n}</option>`).join('')}</select></label><button class="btn pink ng-cta" data-act="negAjOk">Guardar</button><button class="btn ng-cta" data-act="negVinc">Vincular con mi plata</button></div>`); };
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
