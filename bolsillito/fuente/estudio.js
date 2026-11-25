// ================= Estudio de diseño (Meffy+): muebles, ropita y pegatinas dibujados por ti =================
(function () {
const A = App, S = A.S, { esc } = A;
const sc = A.screens, ACT = A.ACTIONS, FURN = A.FURN;
A.PAGES.estudio = 'Estudio de diseño';
// 36 colores: 10 tonos en 3 luces (clarito, normal, oscuro) + 6 neutros. El contorno es el café suave.
const HUES = [['Rosa', '#ffd6e3', '#ff8fb3', '#d94a7a'], ['Rojo', '#ffb8b3', '#f0605c', '#b02e3c'], ['Naranja', '#ffdcb5', '#ffa558', '#d9742a'], ['Amarillo', '#fff2a8', '#ffd84a', '#d9a520'], ['Verde', '#d9f4b5', '#8fd45a', '#4f9a3a'], ['Menta', '#c8f5e3', '#6fd3b0', '#33977c'], ['Azul', '#cfeaff', '#7cc2f5', '#3f86c9'], ['Lila', '#e6dcff', '#b79cf2', '#7a5cc4'], ['Morado', '#f3c8f1', '#cf7fd0', '#9040a0'], ['Café', '#f0d2b0', '#c08a5a', '#7a4a2c']];
const NEUT = ['#ffffff', '#fff6e6', '#ddd6e0', '#5a3a3a', '#9a92a2', '#2e2230'];
const PAL = HUES.flatMap(h => h.slice(1)).concat(NEUT);
const PALS = PAL.join(',');
const OUT = 33;
const CH = i => i.toString(36);
const SIZES = { furn: [[16, 16, 'Chiquito'], [24, 24, 'Mediano'], [32, 24, 'Ancho'], [40, 28, 'Grande']], acc: [[12, 12, 'Cuadrado'], [16, 12, 'Ancho']], sticker: [[16, 16, 'Chiquita'], [24, 24, 'Grande']] };
const KINDS = { furn: ['Mueble u objeto', 'Para tu cuarto', 'Mueble'], acc: ['Ropita y accesorios', 'Para tus mascotas', 'Accesorio'], sticker: ['Pegatina', 'Para tu Journal y tablero', 'Pegatina'] };
const SLOTS = [['head', 'Cabeza'], ['face', 'Cara'], ['neck', 'Cuello']];
const st = () => S.settings.studio = S.settings.studio || { items: [] };
const keyOf = it => it.kind === 'furn' ? 'cu_' + it.id : it.kind === 'acc' ? 'cu_' + it.id : 'cs_u' + it.id;
const spName = it => it.kind === 'acc' ? 'acc_cu_' + it.id : keyOf(it);

function trim(rows) {
  const h = rows.length, w = rows[0].length; let x0 = w, y0 = h, x1 = -1, y1 = -1;
  rows.forEach((r, j) => [...r].forEach((c, i) => { if (c !== '.') { x0 = Math.min(x0, i); y0 = Math.min(y0, j); x1 = Math.max(x1, i); y1 = Math.max(y1, j); } }));
  if (x1 < 0) return { rows: ['.'], w: 1, h: 1 };
  const out = rows.slice(y0, y1 + 1).map(r => r.slice(x0, x1 + 1)); return { rows: out, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}
// deja listo todo lo que dibujaste: sprites, muebles, accesorios y pegatinas
function reg() {
  st().items.forEach(it => {
    const t = trim(it.rows), nm = spName(it), k = keyOf(it);
    if (it.kind === 'acc') {
      if (!A.ACC[k]) { const dw = Math.max(8, Math.min(18, Math.round(t.w * 1.15))); A.ACC[k] = { slot: it.slot || 'head', name: it.name, price: 0, w: dw, h: dw * t.h / t.w, mine: true, dx: 0, dy: 0 }; }
      else A.ACC[k].name = it.name;
    }
    if (it.kind === 'furn') {
      FURN[k] = Object.assign(FURN[k] || {}, { name: it.name, w: t.w, h: t.h, price: 0, sprite: k, x: Math.max(0, 72 - t.w / 2), y: it.wall ? 4 : 70, cat: it.wall ? 'pared' : 'deco', wall: !!it.wall, custom: true, mine: true, sp: { w: t.w, h: t.h, r: t.rows.join('') } });
    }
    if (it.sig === it.rows.join('') && Pix.has(nm)) return;
    Pix.define(nm, { raw: t.rows, pal: PALS }); it.sig = it.rows.join('');
  });
}
A.studioReg = reg;
// un mueble de una amiga: lo dibujamos con los datos que viajan junto al mueble
A.studioEnsure = it => {
  if (!it || !it.sp || FURN[it.k]) return; const sp = it.sp; if (!sp.w || !sp.h || !sp.r) return;
  const rows = []; for (let j = 0; j < sp.h; j++) rows.push(sp.r.slice(j * sp.w, (j + 1) * sp.w));
  Pix.define(it.k, { raw: rows, pal: PALS });
  FURN[it.k] = { name: 'Mueble de una amistad', w: sp.w, h: sp.h, price: 0, sprite: it.k, x: 0, y: 0, cat: 'deco', custom: true, off: true, sp };
};
const h0 = A.header; A.header = function () { try { reg(); } catch (e) {} return h0.apply(this, arguments); };


// ---------- plantillas para empezar (dibujadas con formas y sombreado, quedan lindas y las puedes cambiar) ----------
const cir = (cx, cy, r) => (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
const rect = (x0, y0, x1, y1) => (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
const ell = (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
const tri = (ax, ay, bx, by, cx, cy) => (x, y) => { const d = (px, py, qx, qy) => (x - qx) * (py - qy) - (px - qx) * (y - qy); const d1 = d(ax, ay, bx, by), d2 = d(bx, by, cx, cy), d3 = d(cx, cy, ax, ay); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); };
const heart = (cx, cy, s) => (x, y) => { const nx = (x - cx) / s, ny = (cy - y) / s; return (nx * nx + ny * ny - 1) ** 3 - nx * nx * ny ** 3 <= 0; };
const star = (cx, cy, R, r) => (x, y) => { const a = Math.atan2(y - cy, x - cx) + Math.PI / 2, d = Math.hypot(x - cx, y - cy); const t = ((a % (2 * Math.PI / 5)) + 2 * Math.PI / 5) % (2 * Math.PI / 5) / (2 * Math.PI / 5); const k = Math.abs(t - .5) * 2; return d <= r + (R - r) * (1 - k); };
const HUE = { rosa: 0, rojo: 1, naranja: 2, amarillo: 3, verde: 4, menta: 5, azul: 6, lila: 7, morado: 8, cafe: 9 };
// shapes: [[pred, hue o índice fijo], …] se pintan en orden; luz arriba-izquierda y sombra abajo-derecha
function build(w, h, shapes) {
  const id = Array.from({ length: h }, () => Array(w).fill(-1));
  shapes.forEach(([f], n) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (f(x + .5, y + .5)) id[y][x] = n; });
  const g = blank(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const n = id[y][x]; if (n < 0) continue; const c = shapes[n][1];
    if (typeof c === 'string') { g[y][x] = +c; continue; }
    const up = (id[y - 1] || [])[x] !== n || (id[y] || [])[x - 1] !== n, dn = (id[y + 1] || [])[x] !== n || (id[y] || [])[x + 1] !== n;
    g[y][x] = c * 3 + (up && !dn ? 0 : dn && !up ? 2 : 1);
  }
  const o = g.map(r => r.slice());
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (g[y][x] < 0 && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => (g[y + b] || [])[x + a] >= 0)) o[y][x] = OUT;
  return o;
}
const TPL = {
  sticker: [['Corazón', 16, 16, () => build(16, 16, [[heart(8, 7.6, 5.6), HUE.rosa], [cir(5.6, 5.6, 1.1), '30']])], ['Estrella', 16, 16, () => build(16, 16, [[star(8, 8.6, 6.6, 3.2), HUE.amarillo]])], ['Nube', 16, 16, () => build(16, 16, [[cir(5.5, 9, 3.4), HUE.azul], [cir(9.5, 7.5, 4.2), HUE.azul], [cir(12, 10, 2.8), HUE.azul], [rect(5.5, 9, 12, 12.4), HUE.azul]])], ['Flor', 16, 16, () => build(16, 16, [[cir(8, 4.4, 2.8), HUE.rosa], [cir(12, 7.6, 2.8), HUE.rosa], [cir(10.6, 11.6, 2.8), HUE.rosa], [cir(5.4, 11.6, 2.8), HUE.rosa], [cir(4, 7.6, 2.8), HUE.rosa], [cir(8, 8, 2.4), HUE.amarillo]])]],
  furn: [['Maceta', 16, 16, () => build(16, 16, [[cir(8, 5.5, 3.2), HUE.verde], [cir(4.8, 8, 3), HUE.verde], [cir(11.2, 8, 3), HUE.verde], [tri(3, 10, 13, 10, 11, 15.8), HUE.naranja], [rect(3, 10, 13, 12), HUE.naranja], [tri(3.5, 12, 12.5, 12, 11, 15.8), HUE.naranja], [cir(8, 3.6, 1.2), HUE.rosa]])], ['Puff', 16, 16, () => build(16, 16, [[ell(8, 10.6, 6.6, 4.6), HUE.lila], [ell(8, 8.4, 5, 2.8), HUE.lila], [cir(8, 7.8, 1.1), '30']])], ['Lámpara', 16, 16, () => build(16, 16, [[rect(7.2, 8, 8.8, 14), '34'], [ell(8, 14.4, 4, 1.4), HUE.cafe], [tri(3, 8.4, 13, 8.4, 9.4, 1.2), HUE.amarillo], [tri(3, 8.4, 13, 8.4, 6.6, 1.2), HUE.amarillo]])], ['Mesita', 16, 16, () => build(16, 16, [[rect(2, 6, 14, 8.6), HUE.cafe], [rect(3, 8.6, 4.8, 15), HUE.cafe], [rect(11.2, 8.6, 13, 15), HUE.cafe], [cir(8, 4.2, 1.8), HUE.rosa], [rect(7.2, 5, 8.8, 6), HUE.verde]])]],
  acc: [['Moño', 12, 12, () => build(12, 12, [[tri(1, 2.6, 6, 6, 1, 9.4), HUE.rosa], [tri(11, 2.6, 6, 6, 11, 9.4), HUE.rosa], [cir(6, 6, 1.9), HUE.rojo]])], ['Gorrito', 12, 12, () => build(12, 12, [[tri(1, 10.5, 11, 10.5, 6, 2.2), HUE.lila], [rect(1, 9, 11, 10.8), HUE.rosa], [cir(6, 2, 1.4), '30']])], ['Corona', 12, 12, () => build(12, 12, [[rect(1.5, 6, 10.5, 10), HUE.amarillo], [tri(1.5, 6.2, 4, 6.2, 1.5, 2.4), HUE.amarillo], [tri(4, 6.2, 8, 6.2, 6, 1.6), HUE.amarillo], [tri(8, 6.2, 10.5, 6.2, 10.5, 2.4), HUE.amarillo], [cir(6, 8.2, 1), HUE.rojo]])], ['Lentes', 16, 12, () => build(16, 12, [[ring(4.4, 6, 3.4, 2.2), HUE.azul], [ring(11.6, 6, 3.4, 2.2), HUE.azul], [rect(7.6, 5.4, 8.4, 6.6), HUE.azul]])]]
};
function ring(cx, cy, r, t) { return (x, y) => { const d = Math.hypot(x - cx, y - cy); return d <= r && d >= r - t * .55; }; }

// ---------- el editor ----------
let E = null; // lo que estás dibujando ahora
const blank = (w, h) => Array.from({ length: h }, () => Array(w).fill(-1));
const fromRows = rows => rows.map(r => [...r].map(c => c === '.' ? -1 : parseInt(c, 36)));
const toRows = g => g.map(r => r.map(v => v < 0 ? '.' : CH(v)).join(''));
function open(kind, it) {
  if (it) { const g = fromRows(it.rows); E = { id: it.id, kind: it.kind, name: it.name, w: g[0].length, h: g.length, g, slot: it.slot || 'head', wall: !!it.wall }; }
  else { const s = SIZES[kind][kind === 'furn' ? 1 : 0]; E = { id: null, kind, name: '', w: s[0], h: s[1], g: blank(s[0], s[1]), slot: 'head', wall: false }; }
  E.tool = 'pen'; E.color = 4; E.mirror = false; E.hist = [];
}
const snap = () => { E.hist.push(E.g.map(r => r.slice())); if (E.hist.length > 40) E.hist.shift(); };
const CELL = 14;
function paint() {
  const cv = document.getElementById('esCv'); if (!cv || !E) return; const x = cv.getContext('2d');
  cv.width = E.w * CELL; cv.height = E.h * CELL;
  for (let j = 0; j < E.h; j++) for (let i = 0; i < E.w; i++) {
    const v = E.g[j][i];
    x.fillStyle = (i + j) % 2 ? '#fbf3ee' : '#f4e9e3'; x.fillRect(i * CELL, j * CELL, CELL, CELL);
    if (v >= 0) { x.fillStyle = PAL[v]; x.fillRect(i * CELL, j * CELL, CELL, CELL); }
  }
  x.strokeStyle = 'rgba(122,74,60,.10)'; x.lineWidth = 1; x.beginPath();
  for (let i = 0; i <= E.w; i++) { x.moveTo(i * CELL + .5, 0); x.lineTo(i * CELL + .5, E.h * CELL); }
  for (let j = 0; j <= E.h; j++) { x.moveTo(0, j * CELL + .5); x.lineTo(E.w * CELL, j * CELL + .5); }
  x.stroke();
  if (E.mirror) { x.strokeStyle = 'rgba(217,74,122,.55)'; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(E.w * CELL / 2, 0); x.lineTo(E.w * CELL / 2, E.h * CELL); x.stroke(); x.setLineDash([]); }
  const pv = document.getElementById('esPv'); if (pv) {
    const sc2 = 3; pv.width = E.w * sc2; pv.height = E.h * sc2; const p = pv.getContext('2d');
    for (let j = 0; j < E.h; j++) for (let i = 0; i < E.w; i++) { const v = E.g[j][i]; if (v >= 0) { p.fillStyle = PAL[v]; p.fillRect(i * sc2, j * sc2, sc2, sc2); } }
  }
  const pv1 = document.getElementById('esPv1'); if (pv1) { pv1.width = E.w; pv1.height = E.h; const p = pv1.getContext('2d'); for (let j = 0; j < E.h; j++) for (let i = 0; i < E.w; i++) { const v = E.g[j][i]; if (v >= 0) { p.fillStyle = PAL[v]; p.fillRect(i, j, 1, 1); } } }
}
function fill(i, j, to) {
  const from = E.g[j][i]; if (from === to) return; const q = [[i, j]];
  while (q.length) { const [a, b] = q.pop(); if (a < 0 || b < 0 || a >= E.w || b >= E.h || E.g[b][a] !== from) continue; E.g[b][a] = to; q.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]); }
}
const shade = (v, d) => { if (v < 0 || v >= 30) return v; const r = Math.floor(v / 3), s = Math.max(0, Math.min(2, v % 3 + d)); return r * 3 + s; };
function apply(i, j) {
  if (i < 0 || j < 0 || i >= E.w || j >= E.h) return;
  const pts = E.mirror ? [[i, j], [E.w - 1 - i, j]] : [[i, j]];
  pts.forEach(([a, b]) => {
    if (E.tool === 'pen') E.g[b][a] = E.color;
    else if (E.tool === 'erase') E.g[b][a] = -1;
    else if (E.tool === 'light') E.g[b][a] = shade(E.g[b][a], -1);
    else if (E.tool === 'dark') E.g[b][a] = shade(E.g[b][a], 1);
  });
}
function bind(el) {
  const cv = el.querySelector('#esCv'); if (!cv) return;
  const cell = ev => { const r = cv.getBoundingClientRect(); return [Math.floor((ev.clientX - r.left) / r.width * E.w), Math.floor((ev.clientY - r.top) / r.height * E.h)]; };
  let down = false, last = '';
  cv.addEventListener('pointerdown', ev => {
    ev.preventDefault(); const [i, j] = cell(ev); if (i < 0 || j < 0 || i >= E.w || j >= E.h) return;
    if (E.tool === 'pick') { const v = E.g[j][i]; if (v >= 0) { E.color = v; E.tool = 'pen'; sync(el); } return; }
    snap();
    if (E.tool === 'fill') { fill(i, j, E.color); paint(); return; }
    down = true; last = i + ',' + j; apply(i, j); paint(); try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
  });
  cv.addEventListener('pointermove', ev => { if (!down) return; const [i, j] = cell(ev); const k = i + ',' + j; if (k === last) return; last = k; apply(i, j); paint(); });
  const up = () => { down = false; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
}
function sync(el) {
  el.querySelectorAll('[data-tool]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tool === E.tool));
  el.querySelectorAll('[data-col]').forEach(b => b.classList.toggle('on', +b.dataset.col === E.color));
  const m = el.querySelector('[data-act="esMirror"]'); if (m) m.setAttribute('aria-pressed', E.mirror);
  const cur = el.querySelector('#esCur'); if (cur) cur.style.background = PAL[E.color];
  paint();
}
const TOOLS = [['pen', 'Lápiz'], ['erase', 'Borrador'], ['fill', 'Cubeta'], ['pick', 'Gotero'], ['light', 'Aclarar'], ['dark', 'Sombrear']];
function editor() {
  const kd = KINDS[E.kind];
  const hue = (c, r) => c < 10 ? c * 3 + r : 30 + (c - 10) * 3 + r;
  const pal = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 12; c++) { const v = hue(c, r); pal.push(`<button class="es-sw ${v === E.color ? 'on' : ''}" data-act="esColor" data-col="${v}" style="background:${PAL[v]}" aria-label="Color ${v + 1}"></button>`); }
  return `${A.header('estudio')}
<div class="card es-top"><div class="es-pv"><canvas id="esPv" class="pixel"></canvas></div><div style="flex:1;min-width:0"><span class="pill sm">${esc(kd[2])}</span><input id="esName" class="es-name" maxlength="24" placeholder="Ponle nombre…" value="${esc(E.name)}"></div></div>
<div class="card es-tpl"><b>Empezar con una plantilla</b><div class="chips" style="margin-top:6px">${(TPL[E.kind] || []).map(([n], i) => `<button class="chip" data-act="esTpl" data-i="${i}">${n}</button>`).join('')}</div></div>
<div class="card es-board"><canvas id="esCv" class="es-cv"></canvas>
<p class="faint" style="margin:6px 2px 0;font-size:12px">Deja un marguito vacío alrededor y usa “Contorno” para que se vea como de tienda.</p></div>
<div class="card es-tools"><div class="chips">${TOOLS.map(([t, n]) => `<button class="chip" data-act="esTool" data-tool="${t}" aria-pressed="${E.tool === t}">${n}</button>`).join('')}</div>
<div class="chips" style="margin-top:6px"><button class="chip" data-act="esMirror" aria-pressed="${E.mirror}">Espejo</button><button class="chip" data-act="esOutline">Contorno</button><button class="chip" data-act="esUndo">Deshacer</button><button class="chip" data-act="esClear">Limpiar</button></div></div>
<div class="card"><div class="es-palh"><span id="esCur" class="es-cur" style="background:${PAL[E.color]}"></span><b>Colores</b></div><div class="es-pal">${pal.join('')}</div></div>
<div class="card"><h3>Tamaño</h3><div class="chips">${SIZES[E.kind].map(([w, h, n]) => `<button class="chip" data-act="esSize" data-w="${w}" data-h="${h}" aria-pressed="${E.w === w && E.h === h}">${n} · ${w}×${h}</button>`).join('')}</div>
${E.kind === 'furn' ? `<h3 style="margin-top:12px">Dónde va</h3><div class="chips"><button class="chip" data-act="esWall" data-v="0" aria-pressed="${!E.wall}">En el suelo</button><button class="chip" data-act="esWall" data-v="1" aria-pressed="${E.wall}">En la pared</button></div>` : ''}
${E.kind === 'acc' ? `<h3 style="margin-top:12px">Dónde se pone</h3><div class="chips">${SLOTS.map(([s, n]) => `<button class="chip" data-act="esSlot" data-v="${s}" aria-pressed="${E.slot === s}">${n}</button>`).join('')}</div>` : ''}
<div class="es-real"><span class="faint">Así de grande se ve de verdad</span><canvas id="esPv1" class="pixel"></canvas></div></div>
<div style="display:flex;gap:8px"><button class="btn" data-act="esCancel" style="flex:1;justify-content:center">Salir</button><button class="btn pink" data-act="esSave" style="flex:2;justify-content:center">Guardar</button></div>`;
}
function tile(it) {
  const k = keyOf(it), nm = spName(it), t = trim(it.rows);
  const act = it.kind === 'furn' ? `<button class="btn sm" data-act="esAdd" data-id="${it.id}">Al cuarto</button>` : it.kind === 'acc' ? `<button class="btn sm" data-act="esWear" data-id="${it.id}">Ponérsela</button>` : '';
  return `<div class="es-tile"><div class="es-ph"><img class="pixel" alt="" src="${Pix.sprite(nm, Math.max(2, Math.min(6, Math.floor(64 / Math.max(t.w, t.h)))))}"></div><b>${esc(it.name)}</b><span class="faint">${KINDS[it.kind][2]} · ${t.w}×${t.h}</span><div class="es-act">${act}<button class="btn sm" data-act="esEdit" data-id="${it.id}">Editar</button><button class="btn sm" data-act="esDel" data-id="${it.id}" aria-label="Borrar">✕</button></div></div>`;
}
function gallery() {
  reg(); const items = st().items, plus = A.isPlus();
  const news = Object.keys(KINDS).map(k => `<button class="es-new" data-act="esNew" data-kind="${k}" ${plus ? '' : 'disabled'}><span class="es-ni"><img class="pixel" alt="" src="${Pix.sprite(k === 'furn' ? 'es_mueble' : k === 'acc' ? 'es_mono' : 'estrellita', 3)}"></span><b>${KINDS[k][0]}</b><small>${KINDS[k][1]}</small></button>`).join('');
  return `${A.header('estudio')}
${plus ? '' : `<div class="card es-lock"><span class="tag gold">Meffy+</span><h3>Crea tus propias cosas</h3><p class="faint">Dibuja muebles para tu cuarto, ropita para tus mascotas y pegatinas para tu Journal, pixel por pixel, con colores de paleta kawaii, espejo y contorno automático.</p><button class="btn pink" data-go="plan" style="justify-content:center;width:100%">Ver Meffy+</button></div>`}
<div class="es-hero"><img class="pixel" alt="" src="${Pix.sprite('estudio', 5)}"><div><b>Tu estudio de diseño</b><span>Dibuja muebles, ropita y pegatinas. ${items.length ? items.length + (items.length === 1 ? ' creación guardada' : ' creaciones guardadas') : 'Todo lo que hagas es solo tuyo'}.</span></div></div>
<div class="es-news">${news}</div>
<div class="ph"><span class="pill sm">Mis creaciones</span></div>
${items.length ? `<div class="es-grid">${items.map(tile).join('')}</div>` : '<p class="faint" style="text-align:center;margin:18px 8px">Aquí van a aparecer las cosas que crees. ¡Empieza con una pegatina chiquita!</p>'}`;
}
sc.estudio = () => E ? editor() : gallery();
A.after.estudio = el => { if (E) { paint(); bind(el); const n = el.querySelector('#esName'); if (n) n.oninput = () => E.name = n.value; } };

const T = A.toast;
ACT.esNew = a => { if (!A.isPlus()) return T('El Estudio es parte de Meffy+'); open(a.dataset.kind); A.render(); };
ACT.esEdit = a => { if (!A.isPlus()) return T('Para editar necesitas Meffy+'); const it = st().items.find(x => x.id === a.dataset.id); if (!it) return; open(it.kind, it); A.render(); };
ACT.esCancel = () => { E = null; A.render(); };
ACT.esTool = a => { E.tool = a.dataset.tool; sync(document); };
ACT.esColor = a => { E.color = +a.dataset.col; if (E.tool !== 'pen' && E.tool !== 'fill') E.tool = 'pen'; sync(document); };
ACT.esMirror = () => { E.mirror = !E.mirror; sync(document); };
ACT.esUndo = () => { const g = E.hist.pop(); if (g) { E.g = g; paint(); } };
ACT.esClear = () => { snap(); E.g = blank(E.w, E.h); paint(); };
ACT.esTpl = a => { const t = TPL[E.kind][+a.dataset.i]; if (!t) return; snap(); E.w = t[1]; E.h = t[2]; E.g = t[3](); if (!E.name) E.name = t[0]; A.render(); };
ACT.esOutline = () => {
  snap(); const g = E.g.map(r => r.slice());
  for (let j = 0; j < E.h; j++) for (let i = 0; i < E.w; i++) if (E.g[j][i] < 0) {
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => (E.g[j + b] || [])[i + a] >= 0 && (E.g[j + b] || [])[i + a] !== OUT)) g[j][i] = OUT;
  }
  E.g = g; paint();
};
ACT.esSize = a => { const w = +a.dataset.w, h = +a.dataset.h; snap(); const g = blank(w, h); const ox = Math.floor((w - E.w) / 2), oy = Math.floor((h - E.h) / 2); E.g.forEach((r, j) => r.forEach((v, i) => { const x = i + ox, y = j + oy; if (v >= 0 && x >= 0 && y >= 0 && x < w && y < h) g[y][x] = v; })); E.g = g; E.w = w; E.h = h; E.hist = []; A.render(); };
ACT.esWall = a => { E.wall = a.dataset.v === '1'; document.querySelectorAll('[data-act="esWall"]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.v === '1') === E.wall)); };
ACT.esSlot = a => { E.slot = a.dataset.v; document.querySelectorAll('[data-act="esSlot"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === E.slot)); };
ACT.esSave = () => {
  if (!A.isPlus()) return T('El Estudio es parte de Meffy+');
  const filled = E.g.flat().filter(v => v >= 0).length; if (filled < 4) return T('Dibuja un poquito más primero');
  const n = document.getElementById('esName'); if (n) E.name = n.value;
  const name = (E.name || '').trim() || 'Mi ' + KINDS[E.kind][2].toLowerCase();
  const L = st().items; let it = E.id && L.find(x => x.id === E.id);
  if (!it) { it = { id: Date.now().toString(36), kind: E.kind }; L.push(it); }
  Object.assign(it, { name, rows: toRows(E.g), slot: E.slot, wall: E.wall }); delete it.sig;
  const k = keyOf(it); reg();
  if (it.kind === 'furn' && !E.id) A.giveFurn(k, 1);
  if (it.kind === 'acc') { const r = A.roomState(); r.owned = r.owned || []; if (!r.owned.includes('acc:' + k)) r.owned.push('acc:' + k); }
  A.saveSettings(); E = null; A.render(); T('¡Guardado en tus creaciones!');
};
ACT.esAdd = a => { const it = st().items.find(x => x.id === a.dataset.id); if (!it) return; reg(); A.giveFurn(keyOf(it), 1); A.saveSettings(); T(`Otro ${it.name} en tu inventario`); };
ACT.esWear = a => { const it = st().items.find(x => x.id === a.dataset.id); if (!it) return; reg(); const r = A.roomState(); r.owned = r.owned || []; if (!r.owned.includes('acc:' + keyOf(it))) r.owned.push('acc:' + keyOf(it)); A.saveSettings(); S.shopSec = it.slot; A.go('tienda'); };
ACT.esDel = a => {
  if (!a.dataset.sure) { a.dataset.sure = 1; a.textContent = '¿Borrar?'; return; }
  const L = st().items, i = L.findIndex(x => x.id === a.dataset.id); if (i < 0) return; const it = L[i], k = keyOf(it);
  L.splice(i, 1); if (it.kind === 'acc') delete A.ACC[k];
  A.saveSettings(); A.render();
};
// iconos de los botones: un sillón y un moño
Pix.define('es_mueble', { raw: ['..0000000000..', '.033333333330.', '.031111111130.', '00311111111300', '03211111111230', '03221111112230', '03111111111130', '02222222222220', '.000000000000.', '.0.0......0.0.'].map(r => r.length === 14 ? r : r.slice(0, 14)), pal: '#5a3a3a,#b79cf2,#7a5cc4,#e6dcff' });
Pix.define('es_mono', { raw: (() => { const L = ['.000..', '03310.', '031110', '031112', '031110', '03310.', '.000..'], C = ['.', '0', '0', '2', '0', '0', '.']; return L.map((l, i) => l + C[i] + [...l].reverse().join('')); })(), pal: '#5a3a3a,#ff8fb3,#d94a7a,#ffd6e3' });
// icono del menú: una paleta de pintura
(function () {
  const W = 16, H = 14, g = Array.from({ length: H }, () => Array(W).fill('.'));
  const inE = (x, y) => ((x - 7.5) / 7.2) ** 2 + ((y - 6.5) / 6.2) ** 2 <= 1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inE(x, y)) g[y][x] = '1';
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === '1' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => !(g[y + b] && g[y + b][x + a] && g[y + b][x + a] !== '.') )) g[y][x] = '0';
  [[4, 4, '2'], [8, 3, '5'], [11, 5, '4'], [4, 8, '3']].forEach(([x, y, c]) => { g[y][x] = c; g[y][x + 1] = c; g[y + 1][x] = c; g[y + 1][x + 1] = c; });
  for (let y = 9; y < 12; y++) for (let x = 10; x < 13; x++) if (g[y][x] === '1') g[y][x] = (x + y) % 5 === 0 ? '0' : '6';
  g[9][11] = '0'; g[9][10] = '0'; g[10][10] = '0'; g[10][11] = '0'; g[10][9] = '0'; g[11][11] = '0'; g[11][12] = '0'; g[10][12] = '0';
  Pix.define('estudio', { raw: g.map(r => r.join('')), pal: '#7a4a2c,#fff6e6,#ff8fb3,#ff8fb3,#7cc2f5,#ffd84a,#fff6e6' });
  Object.values(A.PACKS || {}).forEach(p => { if (p.map) p.map.estudio = p === A.PACKS.pixel ? 's:estudio' : 's:estudio'; });
})();
})();
