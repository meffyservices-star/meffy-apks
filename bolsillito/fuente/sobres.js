// ================= Sobres de presupuesto: tu dinero del mes repartido en sobrecitos =================
(function () {
const A = App, S = A.S, { esc, money, toast, openSheet, closeSheet } = A;
const sc = A.screens, ACT = A.ACTIONS;
A.PAGES.sobres = 'Sobres';
const spr = (n, k) => Pix.sprite(n, k || 3);
const sheet = (t, h) => openSheet(t, h, sh => sh.addEventListener('click', ev => { const b = ev.target.closest('[data-act]'); if (b && ACT[b.dataset.act]) ACT[b.dataset.act](b); }));
const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const KRAFT = [['#f6d9a8', '#e3bd82', '#fff0cf'], ['#ffd1de', '#f0a5bd', '#ffe9f0'], ['#cfeedd', '#9fd5b8', '#e8f8ef'], ['#cfe6fb', '#9cc8ee', '#e6f2fd'], ['#e2d8fb', '#bcaaf0', '#f1ecfd'], ['#ffe3b8', '#f5c283', '#fff2da']];
const OUT = '#5a3a3a';
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
const W = 48, H = 40;
function drawEnv(cv, x, idx) {
  const col = KRAFT[idx % KRAFT.length], st = state(x); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const R = (c, a, b, w, h) => { g.fillStyle = c; g.fillRect(a, b, w, h); };
  // sombrita en el suelo
  R('rgba(90,58,58,.15)', 6, 37, 38, 2);
  // fondo del sobre
  R(OUT, 3, 9, 42, 29); R(col[1], 4, 10, 40, 27); R(col[0], 4, 10, 40, 2);
  // billetes que asoman según lo que queda (4 = lleno)
  const n = st === 'none' ? 0 : x.left <= 0 ? 0 : Math.max(1, Math.ceil(x.pct * 4));
  for (let i = 0; i < n; i++) { const by = 13 - i * 3 - (i === n - 1 ? 0 : 0), bx = 9 + (i % 2) * 3;
    R(OUT, bx - 1, by - 1, 30, 12); R('#a8e08a', bx, by, 28, 10); R('#c9f0b0', bx, by, 28, 1); R('#7cc45e', bx, by + 9, 28, 1); R('#7cc45e', bx + 11, by + 3, 6, 4); R('#c9f0b0', bx + 12, by + 4, 4, 2); R('#7cc45e', bx + 2, by + 2, 2, 2); R('#7cc45e', bx + 24, by + 6, 2, 2); }
  // frente con la solapa en V
  for (let xx = 4; xx < 44; xx++) { const top = 16 + Math.round((1 - Math.abs(xx - 23.5) / 19.5) * 9); R(OUT, xx, top - 1, 1, 1); R(col[0], xx, top, 1, 37 - top); R(col[2], xx, top, 1, 1); }
  R(col[1], 4, 34, 40, 3); R(OUT, 4, 37, 40, 1); R(OUT, 3, 9, 1, 29); R(OUT, 44, 9, 1, 29);
  for (let xx = 7; xx < 41; xx += 4) R(col[2], xx, 33, 2, 1); // costurita
  // carita según cómo va el sobre
  const f = '#5a3a3a', cx = 24, cy = 27;
  if (st === 'over' || st === 'empty') { R(f, cx - 6, cy - 1, 3, 1); R(f, cx + 3, cy - 1, 3, 1); R(f, cx - 3, cy + 4, 6, 1); R(f, cx - 4, cy + 5, 1, 1); R(f, cx + 3, cy + 5, 1, 1); if (st === 'over') { R('#7cc9f5', cx + 7, cy + 1, 1, 3); R('#7cc9f5', cx + 7, cy + 4, 1, 1); } }
  else if (st === 'low') { R(f, cx - 5, cy - 2, 2, 3); R(f, cx + 3, cy - 2, 2, 3); R(f, cx - 2, cy + 4, 4, 1); R(f, cx - 3, cy + 5, 1, 1); R(f, cx + 2, cy + 5, 1, 1); }
  else if (st === 'mid') { R(f, cx - 5, cy - 2, 2, 3); R(f, cx + 3, cy - 2, 2, 3); R(f, cx - 2, cy + 4, 4, 1); }
  else { R(f, cx - 5, cy - 2, 2, 3); R(f, cx + 3, cy - 2, 2, 3); R(f, cx - 3, cy + 3, 1, 1); R(f, cx - 2, cy + 4, 4, 1); R(f, cx + 2, cy + 3, 1, 1); }
  if (st !== 'over' && st !== 'empty') { R('#ff9db8', cx - 8, cy + 2, 3, 2); R('#ff9db8', cx + 5, cy + 2, 3, 2); }
  // destellitos cuando está lleno
  if (st === 'full' && x.pct > .85) { R('#fff6a8', 3, 4, 1, 3); R('#fff6a8', 2, 5, 3, 1); R('#fff6a8', 43, 2, 1, 3); R('#fff6a8', 42, 3, 3, 1); }
  if (st === 'over') { R(OUT, 36, 3, 9, 9); R('#ff8f8f', 37, 4, 7, 7); R('#fff', 40, 5, 1, 4); R('#fff', 40, 10, 1, 1); }
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
  const card = (x, i) => { const st = state(x); return `<button class="sb-card" data-act="sbOpen" data-id="${x.c.id}"><canvas class="sb-cv" data-i="${i}" data-id="${x.c.id}"></canvas><span class="sb-tag pn pn-tag">${A.iconHTML ? A.iconHTML(x.c.icon, 14) : ''}<b>${esc(x.c.name)}</b></span><span class="sb-left ${x.left < 0 ? 'neg' : ''}">${x.left < 0 ? '−' + money(-x.left) : money(x.left)}</span><small>${x.b > 0 ? 'de ' + money(x.b) + ' · ' + stateTxt(x, st) : stateTxt(x, st)}</small>${bar(x, st)}</button>`; };
  return `${A.header('sobres')}
<div class="sb-board"><div class="sb-head pn pn-wood"><span>Sobres de ${MES[+d.k.slice(5) - 1]}</span><em>${dl} ${dl === 1 ? 'día' : 'días'} para fin de mes</em></div>
<div class="sb-body pn pn-cream"><div class="sb-say"><img class="pixel" alt="" src="${spr(pet, 3)}"><span>${esc(say)}</span></div>
<div class="sb-stats"><div><small>Repartido</small><b>${money(d.tot.b)}</b></div><div><small>Gastado</small><b>${money(d.tot.s)}</b></div><div class="${disp > 0 ? 'ok' : 'bad'}"><small>Te queda</small><b>${money(disp)}</b></div></div>
${disp > 0 && d.tot.b ? `<div class="sb-day">Puedes gastar unos <b>${money(disp / dl)}</b> al día</div>` : ''}</div></div>
${d.withB.length ? `<div class="sb-grid">${d.withB.map(card).join('')}</div>` : `<div class="sb-empty"><canvas id="sbDemo" class="sb-cv"></canvas><b>Aún no tienes sobres</b><span>Elige una categoría de abajo, ponle cuánto quieres gastar al mes y nace su sobre.</span></div>`}
${(() => { const L = cats().filter(c => !(eff(c) > 0)); return L.length ? `<div class="sb-lbl">Categorías sin sobre</div><div class="sb-none">${L.map(c => `<button class="sb-ghost" data-act="sbTope" data-id="${c.id}">${A.iconHTML ? A.iconHTML(c.icon, 16) : ''}<span>${esc(c.name)}</span><i>+ sobre</i></button>`).join('')}</div>` : ''; })()}`;
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
  sheet(c.name, `<div class="sb-open"><div class="sb-big pn pn-cream"><canvas id="sbBig" class="sb-cv"></canvas><b class="sb-bigleft ${x.left < 0 ? 'neg' : ''}">${x.left < 0 ? '−' + money(-x.left) : money(x.left)}</b><span>${x.left < 0 ? 'te pasaste de este sobre' : 'te quedan en este sobre'}</span>${bar(x, st)}<small>${money(x.s)} gastado de ${money(x.b)}</small></div>
<div class="sb-acts"><button class="sb-act pn pn-pink" data-act="sbMove" data-id="${id}">Pasar plata de otro sobre</button><button class="sb-act pn pn-wood" data-act="sbTope" data-id="${id}">Cambiar el tope</button></div>
<div class="sb-lbl">Lo último que salió de aquí</div>${L.length ? `<div class="sb-hist">${L.map(t => `<div><span>${A.fmtDate ? A.fmtDate(t.date) : t.date}</span><em>${esc(t.note || c.name)}</em><b>${money(t.amount)}</b></div>`).join('')}</div>` : '<p class="faint" style="text-align:center">Todavía no has gastado de este sobre este mes.</p>'}</div>`);
  setTimeout(() => { const cv = document.getElementById('sbBig'); if (cv) drawEnv(cv, x, idx); }, 0);
}
ACT.sbOpen = a => openEnv(a.dataset.id);
ACT.sbTope = a => {
  const c = S.fin.categories.find(x => x.id === a.dataset.id); if (!c) return;
  sheet(`Tope de ${c.name}`, `<div class="sb-form"><p class="faint" style="margin:0">¿Cuánto quieres gastar al mes en ${esc(c.name)}? Es el tope de todos los meses.</p><label class="f">Tope al mes<input class="in" id="sbTopeIn" type="number" inputmode="decimal" step="0.01" min="0" value="${+c.budget || ''}" placeholder="Ej. 80"></label><button class="sb-act pn pn-pink" data-act="sbTopeOk" data-id="${c.id}">Guardar</button></div>`);
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
  sheet('¿Cuánto pasamos?', `<div class="sb-form"><p class="faint" style="margin:0">De <b>${esc(f.c.name)}</b> a <b>${esc(t.c.name)}</b>. Solo cambia este mes.</p><label class="f">Cantidad (máx. ${money(f.left)})<input class="in" id="sbAmt" type="number" inputmode="decimal" step="0.01" min="0" value="${Math.round(need * 100) / 100}"></label><button class="sb-act pn pn-pink" data-act="sbMoveOk" data-from="${f.c.id}" data-to="${t.c.id}">Pasar la plata</button></div>`);
};
ACT.sbMoveOk = a => {
  const d = data(), f = d.withB.find(x => x.c.id === a.dataset.from); const v = Math.round(Math.min(f ? f.left : 0, +document.getElementById('sbAmt').value || 0) * 100) / 100; if (!f || v <= 0) return toast('Pon una cantidad');
  const m = S.settings.sobres = S.settings.sobres || {}, k = k0(); m[k] = m[k] || {}; m[k][a.dataset.from] = (m[k][a.dataset.from] || 0) - v; m[k][a.dataset.to] = (m[k][a.dataset.to] || 0) + v;
  A.saveSettings(); closeSheet(); toast(`Pasaste ${money(v)}`); A.render();
};
// icono del menú
(function () {
  const w = 16, h = 12, g = Array.from({ length: h }, () => Array(w).fill('.'));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g[y][x] = (x === 0 || y === h - 1 || x === w - 1 || y === 0) ? '0' : '2';
  for (let x = 1; x < w - 1; x++) { const t = Math.round((1 - Math.abs(x - 7.5) / 7) * 6); for (let y = 1; y <= t; y++) g[y][x] = '1'; if (t >= 1) g[t + 1 < h ? t + 1 : t][x] = '0'; }
  g[8][7] = '3'; g[8][8] = '3';
  Pix.define('sobre_ic', { raw: g.map(r => r.join('')), pal: '#5a3a3a,#ffd6e3,#ff8fb3,#fff6e6' });
  Object.values(A.PACKS || {}).forEach(p => { if (p.map) p.map.sobres = p === A.PACKS.pixel ? 's:sobre_ic' : 's:estudio'; });
})();
})();
