// ===== Bolsillito Negocio: ventas, costos, ganancia real, clientes y stock para emprendedoras =====
(function () {
const A = App, S = A.S, { esc, money, toast, openSheet, closeSheet } = A, sc = A.screens, ACT = A.ACTIONS;
A.PAGES.negocio = 'Negocio';
const spr = (n, k) => Pix.sprite(n, k || 3);
const sheet = (t, h) => openSheet(t, h, sh => (sh.classList.add('nvx', 'ngx'), sh.addEventListener('change', ev => { if (ev.target.id === 'npF') pickImg(ev.target); }), sh.addEventListener('click', ev => { const b = ev.target.closest('[data-act]'); if (b && ACT[b.dataset.act]) { ev.stopPropagation(); ACT[b.dataset.act](b); } })));
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
  comida: { n: 'Comida y postres', s: 'pudin', exp: ['Ingredientes', 'Empaques', 'Gas y luz', 'Transporte', 'Publicidad', 'Otros'], ej: ['Brownie', 'Torta pequeña'], m: { pedidos: 1, stock: 1, renov: 0 } },
  belleza: { n: 'Maquillaje y belleza', s: 'labial', exp: ['Mercadería', 'Empaques', 'Envíos', 'Publicidad', 'Comisiones', 'Otros'], ej: ['Labial', 'Set de skincare'], m: { pedidos: 1, stock: 1, renov: 0 } },
  ropa: { n: 'Ropa y accesorios', s: 'bolsa', exp: ['Mercadería', 'Empaques', 'Envíos', 'Publicidad', 'Local o feria', 'Otros'], ej: ['Aretes', 'Blusa'], m: { pedidos: 0, stock: 1, renov: 0 } },
  manual: { n: 'Manualidades', s: 'gift', exp: ['Materiales', 'Empaques', 'Envíos', 'Publicidad', 'Herramientas', 'Otros'], ej: ['Pulsera', 'Tarjeta'], m: { pedidos: 1, stock: 1, renov: 0 } },
  servicios: { n: 'Servicios', s: 'unas', exp: ['Materiales', 'Transporte', 'Publicidad', 'Herramientas', 'Capacitación', 'Otros'], ej: ['Peinado', 'Uñas'], m: { pedidos: 1, stock: 0, renov: 0, serv: 1 } },
  suscrip: { n: 'Suscripciones y membresías', s: 'diamante', exp: ['Cuentas y licencias', 'Publicidad', 'Herramientas', 'Comisiones', 'Otros'], ej: ['Plan mensual', 'Plan semanal'], m: { pedidos: 0, stock: 0, renov: 1, serv: 1 } },
  otro: { n: 'Otro negocio', s: 'maletin', exp: ['Materiales', 'Empaques', 'Transporte', 'Publicidad', 'Otros'], ej: ['Producto', 'Servicio'], m: { pedidos: 1, stock: 1, renov: 0 } }
};
const T = () => TIPOS[N().tipo] || TIPOS.otro;
const M = () => Object.assign({}, T().m, N().mods || {});
const NOUN = () => M().serv ? ['Servicios', 'servicio', 'Agregar servicio'] : ['Productos', 'producto', 'Agregar producto'];
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
  const por = {}; ss.forEach(s => s.items.forEach(i => { if (!i.p) return; const o = por[i.n] = por[i.n] || { n: i.n, q: 0, g: 0 }; o.q += i.q; o.g += i.q * (i.pr - (i.c || 0)); }));
  return { ss, ee, ventas, costo, gastos, ganancia: r2(ventas - costo - gastos), bruta: r2(ventas - costo), top: Object.values(por).sort((a, b) => b.g - a.g).slice(0, 3) };
}
const debe = s => r2(s.total - (s.paid == null ? s.total : s.paid));
const porCobrar = () => N().sales.filter(s => debe(s) > 0.001);
const cliName = i => { const c = N().clients.find(c => c.id === i); return c ? c.n : ''; };
// ---------- pantalla ----------
let TAB = 'resumen';
const tabsL = () => [['resumen', 'Inicio'], ['ventas', 'Ventas'], ...(M().pedidos ? [['pedidos', 'Pedidos']] : []), ['productos', NOUN()[0]], ['clientes', 'Clientas']];
const pet = () => { try { return A.petInfo(A.petActive ? A.petActive() : 'gochi').sprite; } catch (e) { return 'gochi'; } };
const ic = (n, z, bg) => `<span class="ng-ic" style="${bg ? 'background:' + bg : ''}"><img class="pixel" alt="" src="${spr(Pix.has(n) ? n : 'moneda', 3)}" style="width:${z || 28}px;height:${z || 28}px"></span>`;
const empty = (t, s) => `<div class="card ng-empty"><img class="pixel" alt="" src="${spr('negocio_ic', 6)}"><b>${t}</b><span class="faint">${s}</span></div>`;
const cta = (act, t, extra) => `<button class="btn pink ng-cta" data-act="${act}" ${extra || ''}>${t}</button>`;
sc.negocio = () => '<div class="ngx">' + negScr() + '</div>';
function negScr() {
  if (!okAcceso()) return lockedHTML();
  const n = N(); if (!n.tipo) return setupHTML();
  syncLinks();
  if (TAB === 'pedidos' && !M().pedidos) TAB = 'resumen'; const body = { resumen, ventas, pedidos, productos, clientes }[TAB]();
  return `<div class="ph"><div class="ph-left"><span class="pill">${esc(n.name || 'Negocio')}</span><button class="ph-icon" data-act="pageicon" data-k="negocio" aria-label="Cambiar icono">${A.iconHTML(A.pageIcon('negocio'), 34)}</button></div><button class="round-btn" data-act="negAjustes" aria-label="Ajustes del negocio"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/></svg></button></div>
<div class="ng-nav">${tabsL().map(([k, t]) => `<button data-act="negTab" data-k="${k}" aria-pressed="${TAB === k}">${t}</button>`).join('')}</div><div class="stack ng-body">${body}</div>`;
}
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
const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const addD = (t, n) => { const d = new Date(t + 'T12:00'); d.setDate(d.getDate() + n); return iso(d); };
let PER = 'mes';
const PL = { hoy: 'de hoy', semana: 'de la semana', mes: 'del mes' };
function rng(per) { const t = A.today(); if (per === 'hoy') return [t, t, addD(t, -1), addD(t, -1)]; if (per === 'semana') return [addD(t, -6), t, addD(t, -13), addD(t, -7)]; const k = A.ym(t), pd = new Date(+k.slice(0, 4), +k.slice(5) - 2, 1), pk = iso(pd).slice(0, 7); return [k + '-01', t, pk + '-01', pk + '-31']; }
function statsR(a, b) { const n = N(), ss = n.sales.filter(s => s.d >= a && s.d <= b), ee = n.exps.filter(e => e.d >= a && e.d <= b); const ventas = r2(ss.reduce((x, s) => x + s.total, 0)), costo = r2(ss.reduce((x, s) => x + saleCost(s), 0)), gastos = r2(ee.reduce((x, e) => x + e.amt, 0)); const por = {}; ss.forEach(s => s.items.forEach(i => { if (!i.p) return; const o = por[i.n] = por[i.n] || { n: i.n, p: i.p, q: 0, g: 0 }; o.q += i.q; o.g += i.q * (i.pr - (i.c || 0)); })); return { ss, ee, ventas, costo, gastos, ganancia: r2(ventas - costo - gastos), top: Object.values(por).sort((x, y) => y.q - x.q).slice(0, 4) }; }
const img = (p, cls) => p && p.img ? `<img class="${cls || 'ng-pimg'}" alt="" src="${esc(p.img)}">` : `<span class="${cls || 'ng-pimg'} ng-pph" style="background:${PAST[(p && p.n ? p.n.charCodeAt(0) : 0) % PAST.length]}">${esc(((p && p.n) || '?')[0].toUpperCase())}</span>`;
const PAST = ['linear-gradient(135deg,#ffd6e3,#ffb4cc)', 'linear-gradient(135deg,#dff3e3,#bfe5c8)', 'linear-gradient(135deg,#fff1c2,#ffe08a)', 'linear-gradient(135deg,#e1effb,#bcd9f2)', 'linear-gradient(135deg,#ece6fd,#d3c8f5)', 'linear-gradient(135deg,#ffe6d6,#ffc9a8)'];
function spark(vals) { const w = 300, h = 70, mx = Math.max(1, ...vals), st = w / Math.max(1, vals.length - 1); const pts = vals.map((v, i) => [i * st, h - 6 - (v / mx) * (h - 16)]); const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '); return `<svg class="ng-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${d} L${w},${h} L0,${h} Z" fill="rgba(255,255,255,.22)"/><path d="${d}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${pts.length ? `<circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="4.5" fill="#fff"/>` : ''}</svg>`; }
const niceTop = v => { const p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; };
function chart(days) {
  const W = 340, H = 178, L = 34, B = 24, T = 14, n = days.length, cw = (W - L - 6) / n, mx = Math.max(5, ...days.map(d => Math.max(d.v, d.g))), top = niceTop(mx), y = v => T + (H - T - B) * (1 - v / top);
  const grid = [0, 1, 2, 3].map(i => { const v = top * i / 3; return `<line x1="${L}" x2="${W - 4}" y1="${y(v)}" y2="${y(v)}" stroke="#f6cfdf" stroke-dasharray="3 4"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="#a27b8d">${v >= 10 ? Math.round(v) : v.toFixed(1)}</text>`; }).join('');
  const bw = Math.min(14, cw * .34), bars = days.map((d, i) => { const x = L + i * cw + cw / 2, last = i === n - 1; return `<rect x="${x - bw - 1}" y="${y(d.v)}" width="${bw}" height="${Math.max(0, H - B - y(d.v))}" rx="${Math.min(6, bw / 2)}" fill="${last ? '#ef6fa3' : '#ffc7dc'}"/><rect x="${x + 1}" y="${y(d.g)}" width="${bw}" height="${Math.max(0, H - B - y(d.g))}" rx="${Math.min(6, bw / 2)}" fill="${last ? '#7fbfe3' : '#a8d6f0'}"/>${(n <= 7 || i % 5 === 0 || last) ? `<text x="${x}" y="${H - 8}" text-anchor="middle" font-size="10.5" fill="#a27b8d">${d.l}</text>` : ''}`; }).join('');
  return `<svg class="ng-chart2" viewBox="0 0 ${W} ${H}" role="img" aria-label="Ventas y gastos por día">${grid}${bars}</svg>`;
}
const tint = i => i % 2 ? 'sky' : 'pink';
function resumen() {
  const n = N(), [a, b, pa, pb] = rng(PER), st = statsR(a, b), pv = statsR(pa, pb), pc = porCobrar(), deb = r2(pc.reduce((x, s) => x + debe(s), 0)), today = A.today();
  const dl = (v, p) => p > 0 ? Math.round((v - p) / p * 100) : null, dv = dl(st.ventas, pv.ventas), dg = dl(st.ganancia, pv.ganancia);
  const chip = d => d == null ? '' : `<em class="ng-d ${d >= 0 ? 'up' : 'dn'}">${d >= 0 ? '▲' : '▼'} ${Math.abs(d)}%</em>`;
  const nd = PER === 'mes' ? 30 : 7, days = Array.from({ length: nd }, (_, i) => { const d = addD(today, -(nd - 1 - i)), x = new Date(d + 'T12:00'); return { l: nd > 7 ? x.getDate() : DIA[x.getDay()], v: n.sales.filter(s => s.d === d).reduce((t, s) => t + s.total, 0), g: n.exps.filter(e => e.d === d).reduce((t, e) => t + e.amt, 0) }; });
  const orders = M().pedidos ? (n.orders || []) : [], late = orders.filter(o => o.estado !== 'entregado' && o.fecha && o.fecha < today), soon = orders.filter(o => o.estado === 'pendiente' && o.fecha && o.fecha >= today && o.fecha <= addD(today, 2)), ready = orders.filter(o => o.estado === 'listo');
  const ren = !M().renov ? [] : n.clients.filter(c => c.renov && c.renov <= addD(today, 5)).sort((x, y) => x.renov < y.renov ? -1 : 1), low = M().stock ? n.prods.filter(p => p.stock != null && p.stock <= 3) : [];
  const al = []; if (deb > 0) al.push(['alcancia', '#e3f3df', `Te deben ${money(deb)}`, `${new Set(pc.map(s => s.cli || s.id)).size} por cobrar`, 'negTab', 'clientes', 'Ver']);
  late.forEach(o => al.push(['gift', '#ffe0e4', 'Pedido atrasado', `${o.desc} · era para ${dayLbl(o.fecha)}`, 'negPedOpen', o.id, 'Abrir', 'warn'])); soon.forEach(o => al.push(['gift', '#fff4c2', 'Pedido para entregar pronto', `${o.desc} · ${dayLbl(o.fecha)}`, 'negPedOpen', o.id, 'Abrir']));
  ready.forEach(o => al.push(['gift', '#e3f3df', 'Listo para entregar', `${o.desc}${cliName(o.cli) ? ' · ' + cliName(o.cli) : ''}`, 'negPedOpen', o.id, 'Abrir']));
  ren.forEach(c => al.push(['ticket', '#e1effb', c.renov < today ? 'Renovación vencida' : 'Renovación pronto', `${c.n} · ${c.plan || 'plan'} · ${dayLbl(c.renov)}`, 'negCliOpen', c.id, 'Ver']));
  low.forEach(p => al.push(['bolsa', '#fff4c2', p.stock === 0 ? 'Agotado' : 'Stock bajo', `${p.n}: ${p.stock} ${p.stock === 1 ? 'queda' : 'quedan'}`, 'negProd', p.id, 'Reponer']));
  const link = n.link && (n.link.cats || []).length, mxq = Math.max(1, ...st.top.map(t => t.q)), meta = n.goal > 0 ? stats(A.ym(today)).ventas : 0, pagado = r2(n.pays.filter(p => ym(p.d) === A.ym(today)).reduce((x, p) => x + p.amt, 0));
  const tot = Math.max(st.ventas, 1), pcost = Math.min(100, st.costo / tot * 100), pgas = Math.min(100 - pcost, st.gastos / tot * 100), pgan = Math.max(0, 100 - pcost - pgas);
  return `<div class="ng-acts" style="grid-template-columns:1.3fr ${M().pedidos ? '1fr 1fr 1fr' : '1fr 1fr'}"><button class="ng-act main" data-act="posGo">Vender</button>${M().pedidos ? '<button class="ng-act" data-act="negPedido">Pedido</button>' : ''}<button class="ng-act sky" data-act="negProd">${NOUN()[1][0].toUpperCase() + NOUN()[1].slice(1)}</button><button class="ng-act" data-act="negGasto">Gasto</button></div>
<div class="ng-chips">${['hoy', 'semana', 'mes'].map(k => `<button data-act="negPer" data-k="${k}" aria-pressed="${PER === k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}<span class="ng-range">${PER === 'hoy' ? 'Hoy' : PER === 'semana' ? 'Últimos 7 días' : MES[+a.slice(5, 7) - 1][0].toUpperCase() + MES[+a.slice(5, 7) - 1].slice(1)}</span></div>
<div class="ng-k4"><div class="ng-k pink"><span>Ingresos</span><b>${money(st.ventas)}</b>${chip(dv)}</div><div class="ng-k sky"><span>Ganancia</span><b class="${st.ganancia < 0 ? 'neg' : ''}">${money(st.ganancia)}</b>${st.ventas ? `<em class="ng-d flat">${Math.round(st.ganancia / st.ventas * 100)}% margen</em>` : chip(dg)}</div><div class="ng-k sky"><span>Ventas</span><b>${st.ss.length}</b><em class="ng-d flat">ticket ${money(st.ss.length ? st.ventas / st.ss.length : 0)}</em></div><div class="ng-k pink"><span>Por cobrar</span><b>${money(deb)}</b><em class="ng-d flat">${(k => k + (k === 1 ? ' pendiente' : ' pendientes'))(new Set(pc.map(s => s.cli || s.id)).size)}</em></div></div>
<div class="card"><h3>Ventas y gastos por día</h3>${chart(days)}<div class="ng-leg"><span><i style="background:#ef6fa3"></i>Ventas</span><span><i style="background:#7fbfe3"></i>Gastos</span></div></div>
${!link ? `<button class="card ng-por ng-vin" data-act="negVinc"><span class="ng-ic" style="background:#e1effb">${A.px('maletin', 26)}</span><span><b>Vincula tu plata con el negocio</b><small class="faint">Elige qué ingresos y gastos de tu plata son del negocio y pasan solos</small></span><i>›</i></button>` : ''}
${link ? `<button class="card ng-por ng-vin" data-act="negVinc"><span class="ng-ic" style="background:#e1effb">${A.px('maletin', 26)}</span><span><b>Vinculado con tu plata</b><small class="faint">${esc((n.link.cats || []).map(id => (A.cat(id) || {}).name).filter(Boolean).join(', ') || 'Sin categorías')} · Toca para cambiar</small></span></button>` : ''}<div class="card"><h3>Necesita tu atención</h3>${al.length ? `<div class="ng-als">${al.slice(0, 7).map(r => `<div class="ng-al ${r[7] || ''}"><span class="ng-ic" style="background:${r[1]}">${A.px(Pix.has(r[0]) ? r[0] : 'moneda', 24)}</span><span><b>${esc(r[2])}</b><small>${esc(r[3])}</small></span><button class="ng-mini" data-act="${r[4]}" data-${r[4] === 'negTab' ? 'k' : 'id'}="${r[5]}">${r[6]}</button></div>`).join('')}</div>` : '<p class="faint" style="margin:0">Todo en orden por ahora.</p>'}</div>
${st.top.length ? `<div class="card"><h3>Lo más vendido</h3><div class="ng-rank">${st.top.map((t, i) => { const p = n.prods.find(x => x.id === t.p) || { n: t.n }; return `<div><span class="ng-rn ${tint(i)}">${i + 1}</span>${img(p, 'ng-rimg')}<span class="ng-rt"><b>${esc(t.n)}</b><i style="width:${Math.max(8, t.q / mxq * 100)}%" class="${tint(i)}"></i></span><small>${t.q} vend.</small></div>`; }).join('')}</div></div>` : ''}
<div class="card"><h3>Cómo te fue</h3><div class="ng-pl"><div><span>Ingresos por ventas</span><b>${money(st.ventas)}</b></div><div><span>Lo que te costó lo vendido</span><b>− ${money(st.costo)}</b></div><div><span>Gastos del negocio</span><b>− ${money(st.gastos)}</b></div><div class="tot"><span>Ganancia</span><b class="${st.ganancia < 0 ? 'neg' : 'pos'}">${money(st.ganancia)}</b></div></div>${st.ventas ? `<div class="ng-stack"><i class="c" style="width:${pcost}%"></i><i class="g" style="width:${pgas}%"></i><i class="p" style="width:${pgan}%"></i></div><div class="ng-leg"><span><i style="background:#ffc7dc"></i>Costo</span><span><i style="background:#a8d6f0"></i>Gastos</span><span><i style="background:#9fd9b3"></i>Ganancia</span></div>` : ''}</div>
${n.goal > 0 ? `<div class="card"><h3>Meta del mes</h3><div class="row" style="justify-content:space-between;margin-bottom:8px"><b class="num">${money(meta)} <span class="faint">de ${money(n.goal)}</span></b><b style="color:#c24f82">${Math.min(100, Math.round(meta / n.goal * 100))}%</b></div><div class="ng-prog"><i style="width:${Math.min(100, meta / n.goal * 100)}%"></i></div></div>` : ''}
<div class="card"><h3>Pagarte un sueldo</h3><p class="faint" style="margin:0 0 10px">Pasa plata del negocio a tus ingresos personales.${pagado ? ' Este mes ya te pagaste ' + money(pagado) + '.' : ''}</p><button class="btn ng-cta" data-act="negSueldo">Pagarme</button></div>`;
}
ACT.negPer = a => { PER = a.dataset.k; A.render(); };
ACT.negMes = a => { const [y, m] = mk().split('-').map(Number), d = new Date(y, m - 1 + (+a.dataset.d), 1); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); if (k <= A.ym(A.today())) { A._negM = k; A.render(); } };
ACT.negSueldo = () => sheet('Pagarme mi sueldo', `<div class="stack"><p class="faint">Se anota como ingreso en tu plata personal y queda registrado en el negocio.</p><label class="f">Cuánto<input class="in" id="ngPay" inputmode="decimal" placeholder="0.00" value="${Math.max(0, stats(A.ym(A.today())).ganancia) || ''}"></label><button class="btn pink ng-cta" data-act="negSueldoOk">Pagarme</button></div>`);
ACT.negSueldoOk = () => { const v = num(gid('ngPay').value); if (!v) return toast('Pon un monto'); const inc = S.fin.categories.find(c => c.type === 'income'); A.addTx({ type: 'income', amount: v, cat: inc ? inc.id : null, acct: S.settings.defaultAcct || (S.fin.accounts[0] || {}).id, date: A.today(), note: 'Sueldo de ' + (N().name || 'mi negocio') }); N().pays.push({ id: id(), d: A.today(), amt: v }); save(); closeSheet(); toast('Listo, ya está en tus ingresos'); A.render(); };
// ---- ventas ----
const dayLbl = d => { const t = A.today(); if (d === t) return 'Hoy'; const x = new Date(d + 'T12:00'); return `${DIA[x.getDay()]} ${x.getDate()} de ${MES[x.getMonth()]}`; };
let SUB = 'v';
function ventas() {
  const st = stats(mk()), by = {}, src = SUB === 'v' ? st.ss : st.ee; src.slice().sort((a, b) => b.d < a.d ? -1 : 1).forEach(s => (by[s.d] = by[s.d] || []).push(s));
  const ks = Object.keys(by), mes = MES[+mk().slice(5) - 1];
  const head = `<div class="seg"><button data-act="negSub" data-k="v" aria-pressed="${SUB === 'v'}">Ventas</button><button data-act="negSub" data-k="g" aria-pressed="${SUB === 'g'}">Gastos</button></div><div class="ng-mes"><button class="navarrow" data-act="negMes" data-d="-1" aria-label="Mes anterior">‹</button><span class="pill">${mes[0].toUpperCase() + mes.slice(1)} ${mk().slice(0, 4)}</span><button class="navarrow" data-act="negMes" data-d="1" ${mk() >= A.ym(A.today()) ? 'disabled' : ''} aria-label="Mes siguiente">›</button></div>`;
  if (SUB === 'g') return `${head}${cta('negGasto', 'Anotar un gasto del negocio')}${ks.length ? ks.map(d => `<div class="card"><h3>${dayLbl(d)} · ${money(by[d].reduce((a, s) => a + s.amt, 0))}</h3><div class="list">${by[d].map(e => `<button class="li" data-act="negGastoOpen" data-id="${e.id}"><span class="ic">${A.px('bolsa', 24)}</span><span class="tx-main"><b>${esc(e.n || e.cat)}</b><span>${esc(e.cat)}${e.tx ? ' · de tu plata' : ''}</span></span><span class="amt">${money(e.amt)}</span></button>`).join('')}</div></div>`).join('') : empty('Sin gastos este mes', 'Anota lo que compras para tu negocio: materiales, empaques, publicidad.')}`;
  return `${head}${cta('posGo', 'Vender')}${ks.length ? ks.map(d => `<div class="card"><h3>${dayLbl(d)} · ${money(by[d].reduce((a, s) => a + s.total, 0))}</h3><div class="list">${by[d].map(s => `<button class="li ${debe(s) > 0 ? '' : 'income'}" data-act="negSaleOpen" data-id="${s.id}"><span class="ic">${A.px('ticket', 24)}</span><span class="tx-main"><b>${esc(s.items.map(i => (i.q > 1 ? i.q + ' ' : '') + i.n).join(', '))}</b><span>${s.tx ? 'De tu plata' : esc(cliName(s.cli) || 'Sin clienta')}${s.met ? ' · ' + esc(s.met) : ''}${debe(s) > 0 ? ' · debe ' + money(debe(s)) : ''}</span></span><span class="amt">${money(s.total)}</span></button>`).join('')}</div></div>`).join('') : empty('Aún no hay ventas este mes', 'Cuando vendas algo, anótalo aquí en segunditos.')}`;
}
ACT.negSub = a => { SUB = a.dataset.k; A.render(); };
// ---- punto de venta ----
A.PAGES.vender = 'Vender';
let CART = { items: {}, extra: [], cli: '', pago: 'todo', met: 'Efectivo', ab: '' }, PQ = '';
const cartN = () => Object.values(CART.items).reduce((a, q) => a + q, 0) + CART.extra.length;
const cartTotal = () => r2(N().prods.reduce((t, p) => t + (CART.items[p.id] || 0) * p.price, 0) + CART.extra.reduce((t, e) => t + e.pr, 0));
ACT.posGo = () => { A.go('vender'); };
function posBar() { const n = cartN(), t = cartTotal(); return n ? `<button class="pos-pay" data-act="posCobrar"><span><b>${n}</b> ${n === 1 ? 'producto' : 'productos'}</span><em>Cobrar ${money(t)}</em></button>` : '<div class="pos-hint">Toca un producto para agregarlo</div>'; }
sc.vender = () => '<div class="ngx">' + posScr() + '</div>';
function posScr() {
  const n = N(), P = n.prods;
  return `<div class="ph"><div class="ph-left"><button class="navarrow" data-act="posBack" aria-label="Volver">‹</button><span class="pill">Vender</span></div><button class="btn sm" data-act="posOtro">+ Otro monto</button></div>
${P.length ? `<input class="in pos-q" id="posQ" type="search" placeholder="Buscar producto" value="${esc(PQ)}"><div class="pos-grid">${P.map(p => `<button class="pos-tile" data-act="posAdd" data-p="${p.id}" data-n="${esc(p.n.toLowerCase())}">${img(p, 'pos-img')}<b>${esc(p.n)}</b><span>${money(p.price)}</span><i class="pos-badge" ${CART.items[p.id] ? '' : 'hidden'}>${CART.items[p.id] || 0}</i><u class="pos-minus" data-act="posSub" data-p="${p.id}" ${CART.items[p.id] ? '' : 'hidden'}>−</u></button>`).join('')}</div>` : `<div class="card ng-empty"><img class="pixel" alt="" src="${spr('negocio_ic', 6)}"><b>Primero agrega productos</b><span class="faint">Así vender será tocar y cobrar. También puedes usar “Otro monto”.</span>${cta('negProd', 'Agregar producto')}</div>`}
<div class="pos-dock" id="posDock">${posBar()}</div>`;
}
A.after.negocio = el => { const q = el.querySelector('#ngCq'); if (q) q.oninput = () => { CQ = q.value; const v = CQ.trim().toLowerCase(); el.querySelectorAll('.ng-cli').forEach(t => { t.style.display = !v || t.dataset.n.includes(v) ? '' : 'none'; }); }; };
A.after.vender = el => { const q = el.querySelector('#posQ'); if (q) q.oninput = () => { PQ = q.value; const v = PQ.trim().toLowerCase(); el.querySelectorAll('.pos-tile').forEach(t => { t.style.display = !v || t.dataset.n.includes(v) ? '' : 'none'; }); }; };
const posRef = (p) => { const t = document.querySelector(`.pos-tile[data-p="${p}"]`), q = CART.items[p] || 0; if (t) { const b = t.querySelector('.pos-badge'), m = t.querySelector('.pos-minus'); b.textContent = q; b.hidden = !q; m.hidden = !q; } const d = gid('posDock'); if (d) d.innerHTML = posBar(); };
ACT.posAdd = a => { const p = a.dataset.p; CART.items[p] = (CART.items[p] || 0) + 1; posRef(p); };
ACT.posSub = a => { const p = a.dataset.p; if (CART.items[p] > 1) CART.items[p]--; else delete CART.items[p]; posRef(p); };
ACT.posBack = () => { A.go('negocio'); };
ACT.posOtro = () => sheet('Otro monto', `<div class="stack ng-f"><label class="f">Qué fue<input class="in" id="poN" maxlength="30" placeholder="Ej. Pedido especial"></label><label class="f">Cuánto<input class="in" id="poP" inputmode="decimal" placeholder="0.00"></label><button class="btn pink ng-cta" data-act="posOtroOk">Agregar</button></div>`);
ACT.posOtroOk = () => { const v = num(gid('poP').value); if (!v) return toast('Pon un monto'); CART.extra.push({ n: (gid('poN').value || '').trim() || 'Venta suelta', pr: v }); closeSheet(); A.render(); };
ACT.posCobrar = () => { if (!cartN()) return; pullCart(); checkout(); };
function pullCart() { const g = x => (gid(x) || {}).value; if (g('ngCli') != null && g('ngCli') !== '+') CART.cli = g('ngCli'); if (g('ngAb') != null) CART.ab = g('ngAb'); }
function checkout() {
  const n = N(), c = CART, tot = cartTotal(), lines = [...n.prods.filter(p => c.items[p.id]).map(p => [c.items[p.id] + ' × ' + p.n, c.items[p.id] * p.price]), ...c.extra.map(e => [e.n, e.pr])];
  sheet('Cobrar', `<div class="stack ng-f"><div class="card flat">${lines.map(l => `<div class="ng-row"><span>${esc(l[0])}</span><b>${money(l[1])}</b></div>`).join('')}<div class="ng-total" style="margin-top:8px"><span>Total</span><b>${money(tot)}</b></div></div>
<label class="f">Clienta<select class="in" id="ngCli" data-act-change="1"><option value="">Sin clienta</option>${n.clients.map(x => `<option value="${x.id}" ${c.cli === x.id ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}<option value="+">+ Clienta nueva</option></select></label>
<div class="chips">${['Efectivo', 'Transferencia', 'Tarjeta'].map(m => `<button class="chip" aria-pressed="${c.met === m}" data-act="posMet" data-k="${m}">${m}</button>`).join('')}</div>
<div class="seg">${[['todo', 'Pagó todo'], ['fiado', 'Fiado'], ['abono', 'Abono']].map(([k, t]) => `<button data-act="negPago" data-k="${k}" aria-pressed="${c.pago === k}">${t}</button>`).join('')}</div>
${c.pago === 'abono' ? `<label class="f">Cuánto abonó<input class="in" id="ngAb" inputmode="decimal" placeholder="0.00" value="${esc(c.ab || '')}"></label>` : ''}
<button class="btn pink ng-cta" data-act="negVentaOk">Cobrar ${money(tot)}</button></div>`);
  const sel = gid('ngCli'); if (sel) sel.onchange = () => { if (sel.value === '+') { closeSheet(); ACT.negCliNew(null, true); } else CART.cli = sel.value; };
}
ACT.posMet = a => { pullCart(); CART.met = a.dataset.k; checkout(); };
ACT.negPago = a => { pullCart(); CART.pago = a.dataset.k; checkout(); };
let LAST = null;
ACT.negVentaOk = () => {
  pullCart(); const n = N(), c = CART, items = [];
  n.prods.forEach(p => { const q = c.items[p.id]; if (q) items.push({ p: p.id, n: p.n, q, pr: p.price, c: p.cost || 0 }); });
  c.extra.forEach(e => items.push({ p: null, n: e.n, q: 1, pr: e.pr, c: 0 }));
  if (!items.length) return;
  const total = r2(items.reduce((a, i) => a + i.q * i.pr, 0));
  let paid = total; if (c.pago === 'fiado') paid = 0; if (c.pago === 'abono') paid = Math.min(total, num(c.ab));
  if (paid < total && !c.cli) return toast('Para fiar elige a la clienta');
  items.forEach(i => { const p = n.prods.find(x => x.id === i.p); if (p && p.stock != null) p.stock = Math.max(0, p.stock - i.q); });
  const sale = { id: id(), d: A.today(), items, total, paid, cli: c.cli || '', met: c.met }; n.sales.push(sale); save(); LAST = sale;
  CART = { items: {}, extra: [], cli: '', pago: 'todo', met: 'Efectivo', ab: '' }; closeSheet(); done(sale);
};
const receipt = s => { const n = N(); return `${n.name || 'Mi negocio'}\nComprobante de venta · ${dayLbl(s.d)}\n\n${s.items.map(i => `${i.q} × ${i.n}  ${money(i.q * i.pr)}`).join('\n')}\n\nTotal: ${money(s.total)}${debe(s) > 0 ? `\nPagado: ${money(s.paid)} · Saldo: ${money(debe(s))}` : '\nPagado'}\n\n¡Gracias por tu compra!`; };
function done(s) { sheet('Venta lista', `<div class="stack ng-f ng-done"><span class="ng-okk">${A.px('moneda', 44)}</span><b class="big">${money(s.total)}</b><span class="faint">${debe(s) > 0 ? 'Quedó por cobrar ' + money(debe(s)) : 'Cobrada. ¡Qué bien!'}</span><button class="btn pink ng-cta" data-act="negShare" data-id="${s.id}">Compartir comprobante</button><button class="btn ng-cta" data-act="posNueva">Nueva venta</button><button class="btn ghost ng-cta" data-act="posFin">Listo</button></div>`); }
ACT.negShare = a => { const s = N().sales.find(x => x.id === a.dataset.id) || LAST; if (!s) return; const t = receipt(s); if (navigator.share) navigator.share({ text: t }).catch(() => { }); else window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank'); };
ACT.posNueva = () => { closeSheet(); A.render(); };
ACT.posFin = () => { closeSheet(); A.go('negocio'); };
ACT.negSaleOpen = a => {
  const s = N().sales.find(x => x.id === a.dataset.id); if (!s) return;
  sheet('Venta', `<div class="stack ng-f"><div class="ng-total"><span>${dayLbl(s.d)}</span><b>${money(s.total)}</b></div>${s.items.map(i => `<div class="ng-row"><span>${i.q} × ${esc(i.n)}</span><b>${money(i.q * i.pr)}</b></div>`).join('')}<p class="faint">${esc(cliName(s.cli) || 'Sin clienta')} · ${debe(s) > 0 ? 'Debe ' + money(debe(s)) : 'Pagada'}</p>${debe(s) > 0 ? `<button class="btn pink ng-cta" data-act="negCobrar" data-id="${s.id}">Marcar como pagada</button>` : ''}<button class="btn ng-cta" data-act="negShare" data-id="${s.id}">Compartir comprobante</button><button class="btn ng-cta" data-act="negSaleDel" data-id="${s.id}">Borrar venta</button></div>`);
};
ACT.negCobrar = a => { const s = N().sales.find(x => x.id === a.dataset.id); if (s) { s.paid = s.total; save(); closeSheet(); toast('Cobrada'); A.render(); } };
ACT.negSaleDel = a => { const n = N(), s = n.sales.find(x => x.id === a.dataset.id); if (!s) return; s.items.forEach(i => { const p = n.prods.find(x => x.id === i.p); if (p && p.stock != null) p.stock += i.q; }); n.sales = n.sales.filter(x => x !== s); save(); closeSheet(); A.render(); };
// ---- productos ----
function productos() {
  const n = N();
  return `${cta('negProd', NOUN()[2])}${n.prods.length ? `<div class="ng-prods">${n.prods.map(p => { const m = p.price > 0 ? Math.round((p.price - (p.cost || 0)) / p.price * 100) : 0; return `<button class="card ng-prod" data-act="negProd" data-id="${p.id}">${img(p, 'ng-pcover')}<b>${esc(p.n)}</b><span class="mid">${money(p.price)}</span><span class="ng-tags"><em class="${m < 25 ? 'lo' : 'ok'}">${m}% margen</em>${M().stock && p.stock != null ? `<em class="${p.stock <= 3 ? 'lo' : 'st'}">${p.stock} en stock</em>` : ''}</span></button>`; }).join('')}</div>` : empty(M().serv ? 'Aún no tienes servicios' : 'Aún no tienes productos', `Agrega los que vendes, por ejemplo: ${T().ej.join(' o ')}. Puedes ponerles foto.`)}`;
}
let PIMG = null;
async function pickImg(inp) { const f = inp.files && inp.files[0]; if (!f) return; toast('Subiendo foto…'); try { const r = await Store.saveImage(f, 420); PIMG = r.src; const pv = gid('npPrev'); if (pv) { pv.innerHTML = `<img class="ng-pcover" alt="" src="${esc(PIMG)}">`; } } catch (e) { toast('No se pudo subir la foto'); } }
ACT.negProd = a => {
  const p = a && a.dataset && a.dataset.id ? N().prods.find(x => x.id === a.dataset.id) : null; PIMG = null;
  sheet(p ? 'Editar ' + NOUN()[1] : 'Nuevo ' + NOUN()[1], `<div class="stack ng-f"><div id="npPrev" class="ng-prev">${p ? img(p, 'ng-pcover') : ''}</div><label class="btn ng-cta" style="cursor:pointer">${A.px('gift', 20)} Foto del producto<input type="file" accept="image/*" id="npF" hidden></label><label class="f">Nombre<input class="in" id="npN" maxlength="30" value="${esc(p ? p.n : '')}" placeholder="${esc(T().ej[0])}"></label><div class="grid2"><label class="f">Precio de venta<input class="in" id="npP" inputmode="decimal" value="${p ? p.price : ''}" placeholder="0.00"></label><label class="f">Cuánto te cuesta<input class="in" id="npC" inputmode="decimal" value="${p ? p.cost || '' : ''}" placeholder="0.00"></label></div>${M().stock ? `<label class="f">Stock (opcional)<input class="in" id="npS" inputmode="numeric" value="${p && p.stock != null ? p.stock : ''}" placeholder="Cuántas tienes"></label>`: ''}<button class="btn pink ng-cta" data-act="negProdOk" data-id="${p ? p.id : ''}">Guardar</button>${p ? `<button class="btn ng-cta" data-act="negProdDel" data-id="${p.id}">Borrar producto</button>` : ''}</div>`);
};
ACT.negProdOk = a => { const n = N(), nm = gid('npN').value.trim(), pr = num(gid('npP').value); if (!nm || !pr) return toast('Falta el nombre o el precio'); const sv = (gid('npS') || { value: '' }).value.trim(), o = { n: nm, price: pr, cost: num(gid('npC').value), stock: !M().stock || sv === '' ? null : Math.max(0, Math.round(+sv || 0)) }; if (PIMG) o.img = PIMG; const p = a.dataset.id && n.prods.find(x => x.id === a.dataset.id); if (p) Object.assign(p, o); else n.prods.push({ id: id(), ...o }); save(); closeSheet(); A.render(); };
ACT.negProdDel = a => { const n = N(); n.prods = n.prods.filter(x => x.id !== a.dataset.id); save(); closeSheet(); A.render(); };
// ---- pedidos (encargos) ----
const ESTL = { pendiente: 'Por hacer', listo: 'Listo para entregar', entregado: 'Entregado' };
const fechaChip = f => { if (!f) return '<span class="ng-fch"><b>—</b><small>sin fecha</small></span>'; const d = new Date(f + 'T12:00'); return `<span class="ng-fch"><b>${d.getDate()}</b><small>${MES[d.getMonth()].slice(0, 3)}</small></span>`; };
function ordRow(o) { return `<button class="li ${o.estado === 'listo' ? 'income' : ''}" data-act="negPedOpen" data-id="${o.id}">${fechaChip(o.fecha)}<span class="tx-main"><b>${esc(o.desc)}</b><span>${esc(cliName(o.cli) || 'Sin clienta')} · ${ESTL[o.estado]}${o.anticipo ? ' · anticipo ' + money(o.anticipo) : ''}</span></span><span class="amt">${money(o.total)}</span></button>`; }
function pedidos() {
  const n = N(), O = n.orders || [], g = k => O.filter(o => o.estado === k).sort((a, b) => (a.fecha || '9') < (b.fecha || '9') ? -1 : 1);
  return `${cta('negPedido', 'Nuevo pedido')}${O.length ? ['pendiente', 'listo', 'entregado'].map(k => { const L = g(k).slice(0, k === 'entregado' ? 5 : 50); return L.length ? `<div class="card"><h3>${ESTL[k]} · ${g(k).length}</h3><div class="list">${L.map(ordRow).join('')}</div></div>` : ''; }).join('') : empty('Aún no tienes pedidos', 'Anota los encargos de tus clientas con fecha de entrega y anticipo, y no se te olvida ninguno.')}`;
}
ACT.negPedido = () => { const n = N(); sheet('Nuevo pedido', `<div class="stack ng-f"><label class="f">Qué te pidieron<input class="in" id="opD" maxlength="60" placeholder="Ej. Torta de cumpleaños"></label><label class="f">Clienta<select class="in" id="opC"><option value="">Sin clienta</option>${n.clients.map(x => `<option value="${x.id}">${esc(x.n)}</option>`).join('')}</select></label><div class="grid2"><label class="f">Total<input class="in" id="opT" inputmode="decimal" placeholder="0.00"></label><label class="f">Anticipo<input class="in" id="opA" inputmode="decimal" placeholder="0.00"></label></div><label class="f">Fecha de entrega<input class="in" id="opF" type="date"></label><button class="btn pink ng-cta" data-act="negPedOk">Guardar pedido</button></div>`); };
ACT.negPedOk = () => { const d = gid('opD').value.trim(), t = num(gid('opT').value); if (!d || !t) return toast('Falta qué es y el total'); const n = N(); (n.orders = n.orders || []).push({ id: id(), desc: d, cli: gid('opC').value, total: t, anticipo: Math.min(t, num(gid('opA').value)), fecha: gid('opF').value, estado: 'pendiente' }); save(); closeSheet(); TAB = 'pedidos'; A.render(); };
ACT.negPedOpen = a => {
  const n = N(), o = (n.orders || []).find(x => x.id === a.dataset.id); if (!o) return; const c = n.clients.find(x => x.id === o.cli);
  const wa = c && c.tel ? 'https://wa.me/' + (c.tel.startsWith('0') ? '593' + c.tel.slice(1) : c.tel) + '?text=' + encodeURIComponent(`Hola ${c.n}, tu pedido (${o.desc}) de ${n.name || 'mi negocio'} ya está listo. ¡Gracias!`) : '';
  sheet('Pedido', `<div class="stack ng-f"><div class="ng-total"><span>${esc(o.desc)}</span><b>${money(o.total)}</b></div><p class="faint">${esc(cliName(o.cli) || 'Sin clienta')} · ${ESTL[o.estado]}${o.fecha ? ' · entrega ' + dayLbl(o.fecha) : ''}${o.anticipo ? ' · anticipo ' + money(o.anticipo) + ', falta ' + money(o.total - o.anticipo) : ''}</p>
${o.estado === 'pendiente' ? `<button class="btn pink ng-cta" data-act="negPedEst" data-id="${o.id}" data-e="listo">Marcar como listo</button>` : ''}${o.estado === 'listo' && wa ? `<a class="btn ng-cta" style="text-decoration:none" href="${wa}" target="_blank" rel="noopener">Avisarle por WhatsApp</a>` : ''}${o.estado !== 'entregado' ? `<button class="btn pink ng-cta" data-act="negPedEst" data-id="${o.id}" data-e="entregado">Entregado y cobrado</button>` : ''}<button class="btn ng-cta" data-act="negPedDel" data-id="${o.id}">Borrar pedido</button></div>`);
};
ACT.negPedEst = a => { const n = N(), o = n.orders.find(x => x.id === a.dataset.id); if (!o) return; o.estado = a.dataset.e; if (o.estado === 'entregado' && !o.venta) { const sale = { id: id(), d: A.today(), items: [{ p: null, n: o.desc, q: 1, pr: o.total, c: 0 }], total: o.total, paid: o.total, cli: o.cli || '', met: 'Pedido' }; n.sales.push(sale); o.venta = sale.id; toast('Pedido cobrado y anotado como venta'); } save(); closeSheet(); A.render(); };
ACT.negPedDel = a => { const n = N(); n.orders = n.orders.filter(x => x.id !== a.dataset.id); save(); closeSheet(); A.render(); };
// ---- clientas ----
let CQ = '';
function clientes() {
  const n = N(), today = A.today();
  const rows = n.clients.map(c => { const ss = n.sales.filter(s => s.cli === c.id); const last = ss.map(s => s.d).sort().pop(); return { c, tot: r2(ss.reduce((a, s) => a + s.total, 0)), deb: r2(ss.reduce((a, s) => a + Math.max(0, debe(s)), 0)), n: ss.length, last }; }).sort((a, b) => b.deb - a.deb || b.tot - a.tot);
  const ago = d => { if (!d) return 'sin compras'; const x = Math.round((new Date(today) - new Date(d)) / 864e5); return x <= 0 ? 'compró hoy' : x === 1 ? 'compró ayer' : `compró hace ${x} días`; };
  return `${cta('negCliNew', 'Agregar clienta')}${rows.length ? `<input class="in ng-search" id="ngCq" type="search" placeholder="Buscar clienta" value="${esc(CQ)}"><div class="card ng-cl">${rows.map((r, i) => `<button class="ng-cli" data-n="${esc(r.c.n.toLowerCase())}" data-act="negCliOpen" data-id="${r.c.id}"><span class="ng-av ${tint(i)}">${esc(r.c.n[0].toUpperCase())}</span><span class="ng-ct"><b>${esc(r.c.n)}</b><small>${r.n} compra${r.n === 1 ? '' : 's'} · ${ago(r.last)}</small>${M().renov && r.c.renov ? `<em class="ng-rv ${r.c.renov < today ? 'late' : ''}">${esc(r.c.plan || 'Renovación')} · ${dayLbl(r.c.renov)}</em>` : ''}</span><span class="ng-cr"><b>${money(r.tot)}</b>${r.deb > 0 ? `<em class="ng-debe">Debe ${money(r.deb)}</em>` : ''}</span></button>`).join('')}</div>` : empty('Aún no tienes clientas', 'Guárdalas para saber quién te compra más, quién te debe y cuándo renuevan.')}`;
}
ACT.negCliNew = (a, fromSale) => sheet('Nueva clienta', `<div class="stack ng-f"><label class="f">Nombre<input class="in" id="ncN" maxlength="30" placeholder="Nombre"></label><label class="f">WhatsApp (opcional)<input class="in" id="ncT" inputmode="tel" placeholder="09XXXXXXXX"></label>${M().renov ? '<div class="grid2"><label class="f">Plan (opcional)<input class="in" id="ncP" maxlength="24" placeholder="Ej. Mensual"></label><label class="f">Próxima renovación<input class="in" id="ncR" type="date"></label></div>' : ''}<button class="btn pink ng-cta" data-act="negCliOk" data-sale="${fromSale ? 1 : ''}">Guardar</button></div>`);
ACT.negCliOk = a => { const nm = gid('ncN').value.trim(); if (!nm) return toast('Pon un nombre'); const c = { id: id(), n: nm, tel: gid('ncT').value.replace(/\D/g, ''), plan: (gid('ncP') || {}).value || '', renov: (gid('ncR') || {}).value || '' }; N().clients.push(c); save(); closeSheet(); if (a.dataset.sale && CART) { CART.cli = c.id; checkout(); } else A.render(); };
ACT.negCliOpen = a => {
  const n = N(), c = n.clients.find(x => x.id === a.dataset.id); if (!c) return; const ss = n.sales.filter(s => s.cli === c.id).sort((x, y) => y.d < x.d ? -1 : 1), deb = r2(ss.reduce((t, s) => t + Math.max(0, debe(s)), 0));
  const wa = c.tel ? 'https://wa.me/' + (c.tel.startsWith('0') ? '593' + c.tel.slice(1) : c.tel) + '?text=' + encodeURIComponent(`Hola ${c.n}, te escribo de ${n.name || 'mi negocio'}. Te recuerdo que tienes un saldo pendiente de ${money(deb)}. ¡Gracias!`) : '';
  sheet(c.n, `<div class="stack ng-f"><div class="ng-total"><span>${deb > 0 ? 'Te debe' : 'Al día'}</span><b>${money(deb)}</b></div>${ss.slice(0, 8).map(s => `<div class="ng-row"><span>${dayLbl(s.d)} · ${esc(s.items.map(i => i.n).join(', ').slice(0, 28))}</span><b>${money(s.total)}</b></div>`).join('') || '<p class="faint">Aún no te ha comprado.</p>'}
${M().renov ? `<div class="grid2"><label class="f">Plan<input class="in" id="ncP2" maxlength="24" value="${esc(c.plan || '')}"></label><label class="f">Renovación<input class="in" id="ncR2" type="date" value="${c.renov || ''}"></label></div><div class="grid2"><button class="btn ng-cta" data-act="negCliUp" data-id="${c.id}">Guardar datos</button><button class="btn ng-cta" data-act="negCliRenov" data-id="${c.id}">Renovó +1 mes</button></div>` : ''}${deb > 0 ? `<label class="f">Abonar<input class="in" id="ncAb" inputmode="decimal" placeholder="${deb}"></label><button class="btn pink ng-cta" data-act="negAbono" data-id="${c.id}">Registrar pago</button>${wa ? `<a class="btn ng-cta" style="text-decoration:none" href="${wa}" target="_blank" rel="noopener">Recordarle por WhatsApp</a>` : ''}` : ''}<button class="btn ng-cta" data-act="negCliDel" data-id="${c.id}">Borrar clienta</button></div>`);
};
ACT.negCliUp = a => { const c = N().clients.find(x => x.id === a.dataset.id); if (!c) return; c.plan = gid('ncP2').value.trim(); c.renov = gid('ncR2').value; save(); closeSheet(); A.render(); };
ACT.negCliRenov = a => { const c = N().clients.find(x => x.id === a.dataset.id); if (!c) return; const t = A.today(), base = c.renov && c.renov > t ? c.renov : t, d = new Date(base + 'T12:00'); d.setMonth(d.getMonth() + 1); c.renov = iso(d); save(); closeSheet(); toast('Renovación hasta ' + dayLbl(c.renov)); A.render(); };
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
  n.sales = n.sales.filter(x => { if (!x.tx) return true; const t = live.get(x.tx); if (!t || t.type !== 'income') { ch = true; return false; } if (x.total !== t.amount) { x.total = x.paid = t.amount; x.items[0].pr = t.amount; ch = true; } const nn = (t.note || '').trim() || 'Ingreso de ' + ((A.cat(t.cat) || {}).name || 'la tienda'); if (x.items[0].n !== nn) { x.items[0].n = nn; ch = true; } return true; });
  n.exps = n.exps.filter(x => { if (!x.tx) return true; const t = live.get(x.tx); if (!t || t.type !== 'expense') { ch = true; return false; } if (x.amt !== t.amount) { x.amt = t.amount; ch = true; } return true; });
  const have = new Set([...n.sales, ...n.exps].filter(x => x.tx).map(x => x.tx));
  live.forEach(t => { if (have.has(t.id)) return; const nm = (t.note || '').trim() || (t.type === 'income' ? 'Ingreso de ' + ((A.cat(t.cat) || {}).name || 'la tienda') : (A.cat(t.cat) || {}).name || 'Movimiento'); if (t.type === 'income') n.sales.push({ id: id(), d: t.date, items: [{ p: null, n: nm, q: 1, pr: t.amount, c: 0 }], total: t.amount, paid: t.amount, cli: '', tx: t.id }); else n.exps.push({ id: id(), d: t.date, amt: t.amount, n: nm, cat: (A.cat(t.cat) || {}).name || 'Otros', tx: t.id }); ch = true; });
  if (ch) save();
}
let VK = null;
ACT.negVinc = () => {
  const n = N(), L = n.link || {}; VK = { cats: new Set(L.cats || []), accts: new Set(L.accts || []), since: L.since || A.ym(A.today()) + '-01' };
  const inc = S.fin.categories.filter(c => c.type === 'income'), exp = S.fin.categories.filter(c => c.type !== 'income' && !A.isSaving(c));
  const chips = L2 => `<div class="chips">${L2.map(c => `<button class="chip" aria-pressed="${VK.cats.has(c.id)}" data-act="negVk" data-w="cats" data-k="${esc(c.id)}">${esc(c.name)}</button>`).join('') || '<span class="faint">No tienes categorías de este tipo</span>'}</div>`;
  sheet('Vincular con mi plata', `<div class="stack ng-f"><p class="faint">Elige solo lo que es de tu negocio. Lo demás de tu plata personal no entra.</p>
<b style="font-size:13px">Ingresos del negocio</b><span class="faint" style="margin-top:-6px;font-size:12px">Cada ingreso anotado en estas categorías cuenta como una venta.</span>${chips(inc)}
<b style="font-size:13px">Gastos del negocio</b><span class="faint" style="margin-top:-6px;font-size:12px">Por ejemplo tu inventario. Cada gasto en estas categorías cuenta como gasto del negocio.</span>${chips(exp)}
<b style="font-size:13px">Traer movimientos</b><div class="chips"><button class="chip" aria-pressed="${VK.since !== '0000-01-01'}" data-act="negVkSince" data-k="mes">Desde este mes</button><button class="chip" aria-pressed="${VK.since === '0000-01-01'}" data-act="negVkSince" data-k="todo">Todo el historial</button></div>
<button class="btn pink ng-cta" data-act="negVincOk">Guardar vínculo</button>${(L.cats || L.accts) ? '<button class="btn ng-cta" data-act="negVincQuitar">Quitar vínculo</button>' : ''}</div>`);
};
ACT.negVkSince = a => { VK.since = a.dataset.k === 'todo' ? '0000-01-01' : A.ym(A.today()) + '-01'; document.querySelectorAll('[data-act=negVkSince]').forEach(b => b.setAttribute('aria-pressed', b === a)); };
ACT.negVk = a => { const s = VK[a.dataset.w], k = a.dataset.k; if (s.has(k)) s.delete(k); else s.add(k); a.setAttribute('aria-pressed', s.has(k)); };
ACT.negVincOk = () => { const n = N(); if (!VK.cats.size) return toast('Elige al menos una categoría'); const before = n.sales.length + n.exps.length; n.link = { cats: [...VK.cats], accts: [], since: VK.since }; syncLinks(); save(); closeSheet(); const got = n.sales.length + n.exps.length - before; toast(got > 0 ? 'Vinculado: traje ' + got + ' movimiento' + (got === 1 ? '' : 's') : 'Vinculado. Aún no hay movimientos en esas categorías'); A.render(); };
ACT.negVincQuitar = () => { const n = N(); n.sales = n.sales.filter(x => !x.tx); n.exps = n.exps.filter(x => !x.tx); n.link = null; save(); closeSheet(); toast('Vínculo quitado'); A.render(); };
// ---- ajustes ----
let MODS = null;
ACT.negAjustes = () => { const n = N(); MODS = { ...M() }; ajSheet(); };
function ajSheet() {
  const n = N(), mods = [['pedidos', 'Pedidos y encargos', 'Con fecha de entrega y anticipo'], ['stock', 'Inventario', 'Stock que baja con cada venta'], ['renov', 'Renovaciones', 'Clientas con plan y fecha de renovación']];
  sheet('Tu negocio', `<div class="stack ng-f"><label class="f">Nombre<input class="in" id="naN" maxlength="30" value="${esc(n.name)}"></label><label class="f">Meta de ventas del mes (opcional)<input class="in" id="naG" inputmode="decimal" value="${n.goal || ''}" placeholder="0.00"></label><label class="f">Tipo de negocio<select class="in" id="naT">${Object.entries(TIPOS).map(([k, t]) => `<option value="${k}" ${n.tipo === k ? 'selected' : ''}>${t.n}</option>`).join('')}</select></label>
<b style="font-size:13px">Qué necesita tu negocio</b><div class="ng-mods">${mods.map(([k, t, d]) => `<button class="ng-mod" aria-pressed="${!!MODS[k]}" data-act="negMod" data-k="${k}"><b>${t}</b><small>${d}</small></button>`).join('')}</div>
<button class="btn pink ng-cta" data-act="negAjOk">Guardar</button><button class="btn ng-cta" data-act="negVinc">Vincular con mi plata</button></div>`);
  const t = gid('naT'); if (t) t.onchange = () => { const m = (TIPOS[t.value] || TIPOS.otro).m; MODS = { ...m }; document.querySelectorAll('.ng-mod').forEach(b => b.setAttribute('aria-pressed', !!MODS[b.dataset.k])); };
}
ACT.negMod = a => { MODS[a.dataset.k] = MODS[a.dataset.k] ? 0 : 1; a.setAttribute('aria-pressed', !!MODS[a.dataset.k]); };
ACT.negAjOk = () => { const n = N(); n.name = gid('naN').value.trim() || n.name; n.goal = num(gid('naG').value); n.tipo = gid('naT').value; n.mods = { ...MODS, serv: (TIPOS[n.tipo].m || {}).serv || 0 }; save(); closeSheet(); A.render(); };
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
