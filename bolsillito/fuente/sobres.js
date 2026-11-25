// ================= Sobres de presupuesto: tu dinero del mes repartido en sobrecitos =================
(function () {
const A = App, S = A.S, { esc, money, toast, openSheet, closeSheet } = A;
const sc = A.screens, ACT = A.ACTIONS;
A.PAGES.sobres = 'Sobres';
const spr = (n, k) => Pix.sprite(n, k || 3);
const sheet = (t, h) => openSheet(t, h, sh => (sh.classList.add('nvx'), sh.addEventListener('click', ev => { const b = ev.target.closest('[data-act]'); if (b && ACT[b.dataset.act]) { ev.stopPropagation(); ACT[b.dataset.act](b); } })));
const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const KRAFT = [['#f6d9a8', '#e3bd82', '#fff0cf'], ['#ffd1de', '#f0a5bd', '#ffe9f0'], ['#cfeedd', '#9fd5b8', '#e8f8ef'], ['#cfe6fb', '#9cc8ee', '#e6f2fd'], ['#e2d8fb', '#bcaaf0', '#f1ecfd'], ['#ffe3b8', '#f5c283', '#fff2da']];
const OUT = '#a0707a';
const k0 = () => A.ym(A.today());
const eff = (c, k) => (+c.budget || 0) + (((S.settings.sobres || {})[k || k0()] || {})[c.id] || 0);
const cats = () => S.fin.categories.filter(c => c.type !== 'income' && !A.isSaving(c));
function data() {
  const k = k0(), list = A.txIn(k).filter(t => t.type === 'expense'); const sp = {}; list.forEach(t => { sp[t.cat] = (sp[t.cat] || 0) + (+t.amount || 0); });
  const all = cats().map(c => { const b = eff(c, k), s = sp[c.id] || 0; return { c, b, s, left: b - s, pct: b > 0 ? Math.max(0, Math.min(1, (b - s) / b)) : 0 }; });
  return { k, withB: all.filter(x => x.b > 0 || (x.c.budget > 0)), none: all.filter(x => x.b <= 0 && x.s > 0), tot: all.filter(x => x.b > 0).reduce((a, x) => ({ b: a.b + x.b, s: a.s + x.s }), { b: 0, s: 0 }) };
}
const state = x => x.b <= 0 ? 'none' : x.left < 0 ? 'over' : x.left === 0 ? 'empty' : x.pct > .5 ? 'full' : x.pct > .2 ? 'mid' : 'low';

// ---------- el sobre, dibujado píxel por píxel ----------
const W = 56, H = 50;
const TAPE = ['#ffb3c9', '#fff2f6'];
function drawEnv(cv, x, idx) {
  const col = KRAFT[idx % KRAFT.length], st = state(x); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const R = (c, a, b, w, h) => { g.fillStyle = c; g.fillRect(a, b, w, h); };
  const open = st !== 'over' && st !== 'empty' && st !== 'none';
  R('rgba(90,58,58,.18)', 7, 46, 42, 3); R('rgba(90,58,58,.1)', 4, 47, 48, 2);
  // cuerpo trasero
  R(OUT, 3, 15, 50, 31); R(col[1], 4, 16, 48, 29);
  if (open) { // solapa abierta hacia arriba
    for (let r = 0; r < 12; r++) { const half = Math.round(24 * (1 - r / 12)); R(OUT, 28 - half - 1, 15 - r, half * 2 + 2, 1); R(col[1], 28 - half, 15 - r, half * 2, 1); } R(col[2], 18, 13, 20, 1);
  }
  // billetes que asoman
  const n = !open ? 0 : Math.max(1, Math.ceil(x.pct * 4));
  for (let i = 0; i < n; i++) { const bx = 9 + (i % 2) * 5 - (i === 2 ? 2 : 0), by = 19 - i * 4;
    R(OUT, bx - 1, by - 1, 38, 15); R('#a9e28c', bx, by, 36, 13); R('#cdf3b4', bx, by, 36, 1); R('#78c15a', bx, by + 12, 36, 1);
    R('#78c15a', bx + 2, by + 2, 3, 3); R('#78c15a', bx + 31, by + 8, 3, 3);
    R('#78c15a', bx + 13, by + 3, 10, 7); R('#cdf3b4', bx + 14, by + 4, 8, 5); R('#78c15a', bx + 17, by + 5, 2, 3); R('#78c15a', bx + 16, by + 5, 4, 1); R('#78c15a', bx + 16, by + 7, 4, 1); }
  // frente: bolsillo con corte en V
  const top = xx => 24 + Math.round((1 - Math.abs(xx - 27.5) / 23.5) * 9);
  for (let xx = 4; xx < 52; xx++) { const t = top(xx); R(OUT, xx, t - 1, 1, 1); R(col[0], xx, t, 1, 45 - t); R(col[2], xx, t, 1, 1); }
  // textura de papel
  for (let k = 0; k < 40; k++) { const px = 6 + (k * 17) % 44, py = 28 + (k * 11) % 15; if (py > top(px) + 1) R(col[2], px, py, 1, 1); }
  R(col[1], 4, 41, 48, 4); R(OUT, 4, 45, 48, 1); R(OUT, 3, 15, 1, 31); R(OUT, 52, 15, 1, 31);
  for (let xx = 7; xx < 50; xx += 4) R(col[2], xx, 40, 2, 1);
  if (!open) { // solapa cerrada
    for (let r = 0; r < 11; r++) { const half = Math.round(24 * (1 - r / 11)); R(OUT, 28 - half - 1, 16 + r, half * 2 + 2, 1); R(col[0], 28 - half, 16 + r, half * 2, 1); } R(col[2], 6, 16, 44, 1);
  }
  // carita
  const f = '#5a3a3a', cx = 28, cy = 35;
  if (st === 'over' || st === 'empty') { R(f, cx - 7, cy - 1, 4, 1); R(f, cx + 3, cy - 1, 4, 1); R(f, cx - 3, cy + 4, 6, 1); R(f, cx - 4, cy + 5, 1, 1); R(f, cx + 3, cy + 5, 1, 1); if (st === 'over') { R('#7cc9f5', cx + 8, cy + 1, 1, 3); R('#7cc9f5', cx + 8, cy + 4, 1, 1); } }
  else if (st === 'low') { R(f, cx - 6, cy - 2, 2, 3); R(f, cx + 4, cy - 2, 2, 3); R(f, cx - 2, cy + 4, 4, 1); R(f, cx - 3, cy + 5, 1, 1); R(f, cx + 2, cy + 5, 1, 1); }
  else if (st === 'mid') { R(f, cx - 6, cy - 2, 2, 3); R(f, cx + 4, cy - 2, 2, 3); R(f, cx - 2, cy + 3, 4, 1); }
  else { R(f, cx - 6, cy - 2, 2, 3); R('#fff', cx - 6, cy - 2, 1, 1); R(f, cx + 4, cy - 2, 2, 3); R('#fff', cx + 4, cy - 2, 1, 1); R(f, cx - 3, cy + 3, 1, 1); R(f, cx - 2, cy + 4, 4, 1); R(f, cx + 2, cy + 3, 1, 1); }
  if (st !== 'over' && st !== 'empty') { R('#ff9db8', cx - 10, cy + 2, 3, 2); R('#ff9db8', cx + 7, cy + 2, 3, 2); }
  // washi tape
  R('rgba(255,179,201,.9)', 6, 21, 15, 6); R(OUT, 6, 21, 15, 1); R(OUT, 6, 26, 15, 1); for (let t = 0; t < 15; t += 4) R(TAPE[1], 6 + t, 22, 2, 4); R(OUT, 5, 22, 1, 1); R(OUT, 5, 24, 1, 1); R(OUT, 21, 23, 1, 1); R(OUT, 21, 25, 1, 1);
  // sellito de estado
  const sc2 = { full: '#7fd16a', mid: '#f5c14d', low: '#f59a6a', empty: '#c9c1c9', over: '#ec6a86', none: '#d9c9b9' }[st], hx = 40, hy = 27;
  const H8 = ['.00.00.', '0110110', '0111110', '.01110.', '..010..'.slice(0, 7), '...0...'];
  R(OUT, hx - 1, hy - 1, 9, 9); R(sc2, hx, hy, 7, 7); R('rgba(255,255,255,.55)', hx + 1, hy + 1, 2, 1);
  if (st === 'over') { R('#fff', hx + 3, hy + 1, 1, 3); R('#fff', hx + 3, hy + 5, 1, 1); } else if (st === 'empty') { R('#fff', hx + 1, hy + 3, 5, 1); } else { R('#fff', hx + 2, hy + 2, 1, 2); R('#fff', hx + 4, hy + 2, 1, 2); R('#fff', hx + 2, hy + 4, 3, 1); }
  // destellos
  if (st === 'full') { [[2, 6], [50, 4], [47, 11]].forEach(([a, b]) => { R('#fff6a8', a, b, 1, 3); R('#fff6a8', a - 1, b + 1, 3, 1); }); }
}
const stateTxt = (x, st) => ({ full: 'Va tranquilo', mid: 'Ya a la mitad', low: 'Casi se acaba', empty: 'Se acabó justo', over: 'Te pasaste', none: 'Sin tope' })[st];
const tone = st => ({ full: '#6bbf5a', mid: '#f0b84a', low: '#f08a6a', empty: '#a8a0a8', over: '#e0617a', none: '#c9b8a8' })[st];
const bar = (x, st) => { const n = 10, on = x.b > 0 ? Math.round(Math.max(0, Math.min(1, x.s / x.b)) * n) : 0; return `<span class="sb-bar">${Array.from({ length: n }, (_, i) => `<i class="${i < on ? 'on' : ''}" style="${i < on ? 'background:' + tone(st) : ''}"></i>`).join('')}</span>`; };

// ---------- pantalla ----------
sc.sobres = () => {
  if (A.pnStyles) A.pnStyles();
  const d = data(), now = new Date(), dim = A.daysIn(d.k), dl = Math.max(1, dim - now.getDate() + 1), disp = Math.max(0, d.tot.b - d.tot.s);
  const over = d.withB.filter(x => state(x) === 'over'), low = d.withB.filter(x => ['low', 'empty'].includes(state(x)));
  const say = !d.withB.length ? 'Ponle un tope a una categoría y le hago su sobrecito' : over.length ? `El sobre de ${over[0].c.name} se pasó. ¿Le pasamos plata de otro?` : low.length ? `A ${low[0].c.name} le queda poquito. ¡Cuidémoslo!` : d.tot.s === 0 ? 'Mes nuevo, sobres llenitos. ¡A cuidarlos!' : 'Todos los sobres respiran bien. ¡Vas genial!';
  const pet = (() => { try { return A.petInfo(A.petActive ? A.petActive() : 'gochi').sprite; } catch (e) { return 'gochi'; } })();
  const nb = (x, st) => `<div class="evs-track"><i class="real" style="width:${x.b > 0 ? Math.max(3, Math.min(100, x.s / x.b * 100)) : 0}%;background:${tone(st)}"></i></div>`;
  const card = (x, i) => { const st = state(x); return `<button class="card sbn-card" data-act="sbOpen" data-id="${x.c.id}"><canvas class="sb-cv" data-i="${i}" data-id="${x.c.id}"></canvas><span class="sbn-name">${A.iconHTML ? A.iconHTML(x.c.icon, 18) : ''}<b>${esc(x.c.name)}</b></span><span class="sbn-left ${x.left < 0 ? 'neg' : ''}">${x.left < 0 ? '−' + money(-x.left) : money(x.left)}</span>${nb(x, st)}<small class="faint">${x.b > 0 ? 'de ' + money(x.b) + ' · ' : ''}${stateTxt(x, st)}</small></button>`; };
  return `${A.header('sobres')}
<div class="stack sbn">
<div class="card"><div class="sbn-say"><img class="pixel" alt="" src="${spr(pet, 3)}"><span>${esc(say)}</span></div>
<div class="sbn-stats"><div><small>Repartido</small><b>${money(d.tot.b)}</b></div><div><small>Gastado</small><b>${money(d.tot.s)}</b></div><div class="${disp > 0 ? 'ok' : 'bad'}"><small>Te queda</small><b>${money(disp)}</b></div></div>
<div class="evs-foot"><span>${disp > 0 && d.tot.b ? `Puedes gastar unos <b>${money(disp / dl)}</b> al día` : 'Sin margen por ahora'}</span><span class="faint">${dl} ${dl === 1 ? 'día' : 'días'} para fin de mes</span></div></div>
${d.withB.length ? `<div class="sbn-grid">${d.withB.map(card).join('')}</div>` : `<div class="card sbn-empty"><canvas id="sbDemo" class="sb-cv"></canvas><b>Aún no tienes sobres</b><span class="faint">Elige una categoría de abajo, ponle cuánto quieres gastar al mes y nace su sobre.</span></div>`}
${(() => { const L = cats().filter(c => !(eff(c) > 0)); return L.length ? `<div class="card"><h3>Categorías sin sobre</h3><div class="chips">${L.map(c => `<button class="chip" data-act="sbTope" data-id="${c.id}">${A.iconHTML ? A.iconHTML(c.icon, 16) : ''}<span>${esc(c.name)}</span> +</button>`).join('')}</div></div>` : ''; })()}</div>`;
};
A.sobreDraw = drawEnv; A.sobreState = state;
A.after.sobres = el => {
  const d = data();
  el.querySelectorAll('.sb-cv[data-id]').forEach(cv => { const x = d.withB.find(y => y.c.id === cv.dataset.id); if (x) drawEnv(cv, x, +cv.dataset.i); });
  const dm = el.querySelector('#sbDemo'); if (dm) drawEnv(dm, { b: 100, s: 20, left: 80, pct: .8 }, 1);
};
// ---------- un sobre abierto ----------
function recent(c) { return A.txIn(k0()).filter(t => t.type === 'expense' && t.cat === c.id).sort((a, b) => (b.date + (b.id || '')).localeCompare(a.date + (a.id || ''))).slice(0, 6); }
function openEnv(id) {
  const c = S.fin.categories.find(x => x.id === id); if (!c) return; const d = data(), x = d.withB.find(y => y.c.id === id) || { c, b: eff(c), s: 0, left: eff(c), pct: 1 }, st = state(x), idx = Math.max(0, d.withB.findIndex(y => y.c.id === id));
  const L = recent(c);
  sheet(c.name, `<div class="sb-open"><div class="sb-big card flat"><canvas id="sbBig" class="sb-cv"></canvas><b class="sb-bigleft ${x.left < 0 ? 'neg' : ''}">${x.left < 0 ? '−' + money(-x.left) : money(x.left)}</b><span>${x.left < 0 ? 'te pasaste de este sobre' : 'te quedan en este sobre'}</span><div class="evs-track"><i class="real" style="width:${x.b > 0 ? Math.max(3, Math.min(100, x.s / x.b * 100)) : 0}%;background:${tone(st)}"></i></div><small class="faint">${money(x.s)} gastado de ${money(x.b)}</small></div>
<div class="sb-acts"><button class="btn pink sbn-btn" data-act="sbMove" data-id="${id}">Pasar plata de otro sobre</button><button class="btn sbn-btn" data-act="sbTope" data-id="${id}">Cambiar el tope</button></div>
<div class="sb-lbl">Lo último que salió de aquí</div>${L.length ? `<div class="sb-hist">${L.map(t => `<div><span>${A.fmtDate ? A.fmtDate(t.date) : t.date}</span><em>${esc(t.note || c.name)}</em><b>${money(t.amount)}</b></div>`).join('')}</div>` : '<p class="faint" style="text-align:center">Todavía no has gastado de este sobre este mes.</p>'}</div>`);
  setTimeout(() => { const cv = document.getElementById('sbBig'); if (cv) drawEnv(cv, x, idx); }, 0);
}
ACT.sbOpen = a => openEnv(a.dataset.id);
ACT.sbTope = a => {
  const c = S.fin.categories.find(x => x.id === a.dataset.id); if (!c) return;
  sheet(`Tope de ${c.name}`, `<div class="sb-form"><p class="faint" style="margin:0">¿Cuánto quieres gastar al mes en ${esc(c.name)}? Es el tope de todos los meses.</p><label class="f">Tope al mes<input class="in" id="sbTopeIn" type="number" inputmode="decimal" step="0.01" min="0" value="${+c.budget || ''}" placeholder="Ej. 80"></label><button class="btn pink sbn-btn" data-act="sbTopeOk" data-id="${c.id}">Guardar</button></div>`);
};
ACT.sbTopeOk = a => {
  const c = S.fin.categories.find(x => x.id === a.dataset.id), v = Math.max(0, +document.getElementById('sbTopeIn').value || 0); if (!c) return;
  c.budget = v; (A.saveFin || A.saveSettings)(); closeSheet(); toast(v ? 'Sobre listo' : 'Sobre sin tope'); A.render();
};
ACT.sbMove = a => {
  const id = a.dataset.id, d = data(); const src = d.withB.filter(x => x.c.id !== id && x.left > 0);
  if (!src.length) return toast('No hay otro sobre con plata para pasar');
  sheet('¿De cuál sobre sacamos?', `<div class="sb-src">${src.map(x => `<button class="sb-srcb pn pn-slot" data-act="sbMoveAmt" data-from="${x.c.id}" data-to="${id}"><span>${A.iconHTML ? A.iconHTML(x.c.icon, 20) : ''}</span><b>${esc(x.c.name)}</b><em>quedan ${money(x.left)}</em></button>`).join('')}</div>`);
};
ACT.sbMoveAmt = a => {
  const d = data(), f = d.withB.find(x => x.c.id === a.dataset.from), t = d.withB.find(x => x.c.id === a.dataset.to) || { c: S.fin.categories.find(x => x.id === a.dataset.to), left: 0 }; if (!f) return;
  const need = t.left < 0 ? Math.min(f.left, -t.left) : Math.min(f.left, 5);
  sheet('¿Cuánto pasamos?', `<div class="sb-form"><p class="faint" style="margin:0">De <b>${esc(f.c.name)}</b> a <b>${esc(t.c.name)}</b>. Solo cambia este mes.</p><label class="f">Cantidad (máx. ${money(f.left)})<input class="in" id="sbAmt" type="number" inputmode="decimal" step="0.01" min="0" value="${Math.round(need * 100) / 100}"></label><button class="btn pink sbn-btn" data-act="sbMoveOk" data-from="${f.c.id}" data-to="${t.c.id}">Pasar la plata</button></div>`);
};
ACT.sbMoveOk = a => {
  const d = data(), f = d.withB.find(x => x.c.id === a.dataset.from); const v = Math.round(Math.min(f ? f.left : 0, +document.getElementById('sbAmt').value || 0) * 100) / 100; if (!f || v <= 0) return toast('Pon una cantidad');
  const m = S.settings.sobres = S.settings.sobres || {}, k = k0(); m[k] = m[k] || {}; m[k][a.dataset.from] = (m[k][a.dataset.from] || 0) - v; m[k][a.dataset.to] = (m[k][a.dataset.to] || 0) + v;
  A.saveSettings(); closeSheet(); toast(`Pasaste ${money(v)}`); A.render();
};
// icono del menú
(function () {
  const w = 16, h = 13, g = Array.from({ length: h }, () => Array(w).fill('.'));
  const set = (x, y, c) => { if (x >= 0 && x < w && y >= 0 && y < h) g[y][x] = c; };
  for (let x = 4; x < 12; x++) { set(x, 0, '0'); } for (let y = 1; y < 4; y++) { set(3, y, '0'); set(12, y, '0'); for (let x = 4; x < 12; x++) set(x, y, '1'); }
  for (let y = 4; y < 12; y++) for (let x = 1; x < 15; x++) set(x, y, (x === 1 || x === 14 || y === 4 || y === 11) ? '0' : '2');
  for (let x = 2; x < 14; x++) { const t = Math.round((1 - Math.abs(x - 7.5) / 6.5) * 5); for (let y = 5; y <= 5 + t; y++) set(x, y, '3'); set(x, 5 + t + 1, '0'); }
  [[7, 7], [8, 7], [6, 8], [7, 8], [8, 8], [9, 8], [7, 9], [8, 9]].forEach(([x, y]) => set(x, y, '4')); set(6, 7, '4'); set(9, 7, '4');
  Pix.define('sobre_ic', { raw: g.map(r => r.join('')), pal: '#5a3a3a,#9fdf80,#ffe0a8,#fff3d6,#ff6f9c' });
  Object.values(A.PACKS || {}).forEach(p => { if (p.map) p.map.sobres = 's:sobre_ic'; });
})();
  sc.sobres = ((f) => function () { return '<div class="nvx">' + f.apply(this, arguments) + '</div>'; })(sc.sobres);
})();
