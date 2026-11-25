// ===== Vision boards: collage con fotos, letras recortadas, cintas y stickers =====
(function () {
const A = App, S = A.S, { $, $$, esc, toast, openSheet, closeSheet, uid } = A;
const gid = id => document.getElementById(id), ACT = A.ACTIONS, spr = (n, k) => Pix.sprite(n, k || 3);
A.PAGES.tablero = 'Vision boards';
const sheet = (t, h, cb) => openSheet(t, h, sh => { sh.addEventListener('click', ev => { const b = ev.target.closest('[data-act]'); if (b && ACT[b.dataset.act]) { ev.stopPropagation(); ACT[b.dataset.act](b, ev); } }); cb && cb(sh); });
const W = () => A.WASHI || {};
const BGS = [
  ['rosa', 'Cuadros rosa', 'repeating-linear-gradient(0deg,rgba(255,160,195,.5) 0 11px,transparent 11px 22px),repeating-linear-gradient(90deg,rgba(255,160,195,.5) 0 11px,transparent 11px 22px),#fff'],
  ['lunares', 'Lunares', 'radial-gradient(#3a2a2a 1.7px,transparent 2.2px) 0 0/17px 17px,#fff8e6'],
  ['kraft', 'Kraft', 'radial-gradient(rgba(120,80,40,.12) 1px,transparent 1.5px) 0 0/7px 7px,#e6c99c'],
  ['amarillo', 'Papel amarillo', 'repeating-linear-gradient(0deg,rgba(0,0,0,.035) 0 1px,transparent 1px 7px),#ffe989'],
  ['celeste', 'Flores celeste', 'radial-gradient(circle at 6px 6px,#fff 2.5px,transparent 3px) 0 0/22px 22px,radial-gradient(circle at 17px 17px,#fff 1.5px,transparent 2px) 0 0/22px 22px,#bfe3f7'],
  ['cuaderno', 'Cuaderno', 'repeating-linear-gradient(#fffaf0 0 21px,#f1c9d4 21px 22px)'],
  ['lila', 'Lila', 'radial-gradient(circle at 8px 8px,rgba(255,255,255,.7) 2px,transparent 2.6px) 0 0/20px 20px,#d9c9f5'],
  ['menta', 'Menta', 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px) 0 0/12px 12px,linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px) 0 0/12px 12px,#bfead2'],
  ['cielo', 'Cielo', 'linear-gradient(#aee0ff,#e8f7ff 70%,#fff)'],
  ['durazno', 'Corazones', 'radial-gradient(circle at 5px 6px,#ff9fb0 2.2px,transparent 2.8px) 0 0/16px 14px,#ffe3d3']
];
const bgCss = k => (BGS.find(b => b[0] === k) || BGS[0])[2];
const INK = ['#5a3a3a', '#e0709a', '#3f8fd9', '#3fa56a', '#f0a030', '#8a5cd6', '#ffffff', '#222222'];
const FRAMES = [['pola', 'Polaroid'], ['plain', 'Simple'], ['round', 'Redonda'], ['heart', 'Corazón'], ['torn', 'Rasgada'], ['stamp', 'Sello'], ['tape', 'Con cinta']];
const TXTS = [['ransom', 'Recortes'], ['label', 'Etiqueta'], ['bold', 'Gigante'], ['note', 'Notita'], ['cloud', 'Nubecita'], ['marker', 'Marcador']];
const STK = ['corazon_rosa', 'estrellita', 'brillito', 'mariposa', 'nube', 'regalo_cerrado', 'flower', 'foco', 'trofeo', 'fuego', 'casita', 'billetera', 'coffee', 'laptop', 'music', 'book', 'paw', 'alitas', 'brote', 'campanita', 'gota', 'zzz', 'bolsa', 'hormiga', 'sobre_ic', 'plan_ic', 'pic', 'star', 'heart', 'gochi'].filter(n => Pix.has && Pix.has(n));
// ---------- datos ----------
function V() {
  let v = S.settings.vision;
  if (!v) {
    v = S.settings.vision = { cur: 'b1', boards: [] }; const old = S.settings.board || {}, items = [];
    (old.items || []).forEach((o, i) => { if (!o.img) return; items.push({ id: uid(), t: 'photo', img: o.img, ar: 1, cap: o.cap || '', fr: o.shape === 'round' ? 'round' : 'pola', x: 6 + (i % 2) * 48, y: 18 + Math.floor(i / 2) * 26, w: 40, r: [-3, 2.5, -1.5, 3][i % 4], z: i + 2, goal: o.goal || '' }); });
    items.push({ id: uid(), t: 'text', st: 'ransom', txt: String(old.title || 'Mi año').toUpperCase(), c: 0, x: 8, y: 3, w: 84, r: -2, z: 1 });
    v.boards.push({ id: 'b1', title: old.title || 'Mi año', bg: 'rosa', items });
  }
  return v;
}
const cur = () => { const v = V(); return v.boards.find(b => b.id === v.cur) || v.boards[0]; };
const save = () => A.saveSettings();
const zmax = b => b.items.reduce((m, x) => Math.max(m, x.z || 1), 1) + 1;
let edit = false, sel = null;
// ---------- cómo se dibuja cada cosa ----------
const hash = (s, i) => { let h = i * 7 + 3; for (const ch of s) h = (h * 33 + ch.charCodeAt(0)) >>> 0; return h; };
const RB = [['#fff', '#222'], ['#ffd1e0', '#b0305e'], ['#fff2a0', '#222'], ['#222', '#fff'], ['#cfe8ff', '#1f4f8f'], ['#d6f5d6', '#256b3a'], ['#ff8fb3', '#fff']];
const RF = ['Georgia,serif', 'Fredoka,sans-serif', '"Pixelify Sans",monospace', 'Comfortaa,sans-serif', 'Nunito,sans-serif'];
function textHTML(it) {
  const t = esc(it.txt || ''), ink = INK[it.c || 0] || INK[0], fs = (it.w * .12).toFixed(2) + 'cqw';
  if (it.st === 'ransom') return `<div class="vt-ransom" style="font-size:${Math.min(it.w * .2, 1.5 * it.w / Math.max(4, (it.txt || '').length)).toFixed(2)}cqw">${(it.txt || '').split(' ').map((wd, wi, arr) => { const off = arr.slice(0, wi).join(' ').length + (wi ? 1 : 0); return '<b class="vt-w">' + [...wd].map((ch, j) => { const i = off + j; const h = hash(it.txt, i), p = RB[h % RB.length]; return `<span style="background:${p[0]};color:${p[1]};font-family:${RF[(h >> 3) % RF.length]};transform:rotate(${((h >> 5) % 9) - 4}deg) translateY(${((h >> 7) % 5) - 2}%);font-weight:${(h >> 9) % 2 ? 800 : 500}">${esc(ch)}</span>`; }).join('') + '</b>'; }).join('<i class="sp"></i>')}</div>`;
  if (it.st === 'label') return `<div class="vt-label" style="font-size:${fs};color:${ink === '#ffffff' ? '#222' : ink}">${t}</div>`;
  if (it.st === 'bold') return `<div class="vt-bold" style="font-size:${(it.w * .2).toFixed(2)}cqw;color:${ink}">${t}</div>`;
  if (it.st === 'note') return `<div class="vt-note" style="font-size:${fs}"><i class="vt-tp"></i><span style="color:${ink === '#ffffff' ? '#5a3a3a' : ink}">${t}</span></div>`;
  if (it.st === 'cloud') return `<div class="vt-cloud" style="font-size:${fs};color:${ink === '#ffffff' ? '#5a3a3a' : ink}">${t}</div>`;
  return `<div class="vt-marker" style="font-size:${(it.w * .16).toFixed(2)}cqw;color:${ink}"><span>${t}</span></div>`;
}
const camera = () => `<div class="vp-empty"><img class="pixel" alt="" src="${spr(Pix.has('pic') ? 'pic' : 'estrellita', 3)}"><small>Tu foto</small></div>`;
function itemInner(it) {
  if (it.t === 'photo') { const im = it.img ? `<img class="vp-img" alt="" draggable="false" src="${esc(it.img)}">` : camera(); return `<div class="vp vf-${it.fr || 'pola'}">${im}${it.fr === 'tape' ? '<i class="vp-t1"></i><i class="vp-t2"></i>' : ''}${it.fr === 'pola' && it.cap ? `<span class="vp-cap">${esc(it.cap)}</span>` : ''}</div>`; }
  if (it.t === 'text') return textHTML(it);
  if (it.t === 'spr') return `<img class="pixel vs-img" alt="" draggable="false" src="${spr(it.v, 5)}">`;
  if (it.t === 'tape') { const w = W()[it.k] || W().rosa || { css: '#ffc2dc' }; return `<div class="vtape ${w.torn ? 'torn' : ''}" style="background:${w.css}"></div>`; }
  if (it.t === 'goal') { const g = (S.fin.goals || []).find(x => x.id === it.goal); if (!g) return `<div class="vgoal"><b>Meta</b><small>Elige una meta</small></div>`; const pc = g.target ? Math.min(100, Math.round(g.saved / g.target * 100)) : 0; return `<div class="vgoal"><b>${esc(g.name)}</b><span class="vg-bar"><i style="width:${pc}%"></i></span><small>${pc}% · faltan ${A.money(Math.max(0, g.target - g.saved))}</small></div>`; }
  return '';
}
const itemHTML = it => `<div class="vbi t-${it.t} ${edit && sel === it.id ? 'sel' : ''}" data-id="${it.id}" style="left:${it.x}%;top:${it.y}%;width:${it.w}%;z-index:${it.z || 1};transform:rotate(${it.r || 0}deg)">${itemInner(it)}${edit && sel === it.id ? '<span class="vb-h" data-h="1"></span>' : ''}</div>`;
const boardHTML = b => `<div class="vb-board ${edit ? 'edit' : ''}" id="vbBoard" style="background:${bgCss(b.bg)}">${b.items.map(itemHTML).join('')}</div>`;
// ---------- pantalla ----------
A.screens.tablero = () => {
  A.PAGES.tablero = 'Vision boards'; if (A.pnStyles) A.pnStyles(); const v = V(), b = cur(), it = b.items.find(x => x.id === sel);
  const bar = !edit ? `<div class="vb-actions"><button class="pl-btn" data-act="vbEdit">Editar tablero</button><button class="pl-btn ghost" data-act="vbSave">Guardar imagen</button></div>`
    : it ? `<div class="vb-tray sel"><button data-act="vbItemEdit"><b>Cambiar</b></button><button data-act="vbFront"><b>Al frente</b></button><button data-act="vbBack"><b>Atrás</b></button><button data-act="vbDup"><b>Copiar</b></button><button data-act="vbDel" class="red"><b>Borrar</b></button></div><div class="vb-hint">Arrastra para mover. Pellizca o usa la bolita rosa para girar y agrandar.</div>`
      : `<div class="vb-tray"><button data-act="vbAddPhoto"><img class="pixel" alt="" src="${spr(Pix.has('pic') ? 'pic' : 'estrellita', 2)}"><b>Foto</b></button><button data-act="vbAddText"><span class="vb-ab">Aa</span><b>Texto</b></button><button data-act="vbAddStk"><img class="pixel" alt="" src="${spr('estrellita', 2)}"><b>Sticker</b></button><button data-act="vbAddTape"><span class="vb-tp"></span><b>Cinta</b></button><button data-act="vbAddGoal"><img class="pixel" alt="" src="${spr('trofeo', 2)}"><b>Meta</b></button><button data-act="vbBg"><span class="vb-sw" style="background:${bgCss(b.bg)}"></span><b>Fondo</b></button></div><button class="pl-btn" data-act="vbDone">Listo</button>`;
  return `${A.header('tablero')}<div class="vb-tabs">${v.boards.map(x => `<button class="vb-tab ${x.id === b.id ? 'on' : ''}" data-act="vbPick" data-id="${x.id}">${esc(x.title)}</button>`).join('')}<button class="vb-tab add" data-act="vbNew">+ Nuevo</button></div>${boardHTML(b)}${bar}${edit ? '' : `<button class="vb-more" data-act="vbMenu">Nombre, fondo y borrar tablero</button>`}`;
};
A.after.tablero = el => bind(el);
const rerender = () => { const el = $('#vbBoard'); if (!el) return A.render(); A.render(); };
// ---------- mover, girar, agrandar ----------
function bind(el) {
  const B = $('#vbBoard', el); if (!B || !edit) return; const b = cur(); const pts = new Map(); let c = null, st = null, mode = null;
  B.addEventListener('pointerdown', ev => {
    const h = ev.target.closest('[data-h]'), n = ev.target.closest('.vbi');
    if (!n) { if (sel) { sel = null; A.render(); } return; }
    const it = b.items.find(x => x.id === n.dataset.id); if (!it) return; ev.preventDefault();
    if (sel !== it.id) { sel = it.id; A.render(); return; }
    try { B.setPointerCapture(ev.pointerId); } catch (e) { }
    pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY }); const r = B.getBoundingClientRect(), nr = n.getBoundingClientRect();
    c = { it, n }; mode = h ? 'h' : 'm'; const cx = nr.left + nr.width / 2, cy = nr.top + nr.height / 2;
    st = { hp: n.offsetHeight / r.height * 100, x: it.x, y: it.y, w: it.w, r: it.r || 0, rect: r, p: [...pts.values()].map(p => ({ ...p })), cx, cy, a0: Math.atan2(ev.clientY - cy, ev.clientX - cx), d0: Math.hypot(ev.clientX - cx, ev.clientY - cy) || 1 };
  });
  B.addEventListener('pointermove', ev => {
    if (!c || !pts.has(ev.pointerId)) return; pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY }); const { it, n } = c, P = [...pts.values()];
    if (P.length >= 2 && st.p.length >= 2) {
      const d0 = Math.hypot(st.p[0].x - st.p[1].x, st.p[0].y - st.p[1].y) || 1, d1 = Math.hypot(P[0].x - P[1].x, P[0].y - P[1].y), a0 = Math.atan2(st.p[1].y - st.p[0].y, st.p[1].x - st.p[0].x), a1 = Math.atan2(P[1].y - P[0].y, P[1].x - P[0].x);
      it.w = Math.max(5, Math.min(120, st.w * d1 / d0)); it.r = Math.round(st.r + (a1 - a0) * 180 / Math.PI);
    } else if (mode === 'h') {
      const d = Math.hypot(ev.clientX - st.cx, ev.clientY - st.cy), a = Math.atan2(ev.clientY - st.cy, ev.clientX - st.cx);
      const nw = Math.max(5, Math.min(120, st.w * d / st.d0)), k = nw / st.w; it.x = st.x + (st.w - nw) / 2; it.y = st.y + st.hp * (1 - k) / 2; it.w = nw; it.r = Math.round(st.r + (a - st.a0) * 180 / Math.PI);
      const nr0 = n.getBoundingClientRect(); void nr0; void k;
    } else { const p0 = st.p[0]; it.x = Math.max(-20, Math.min(100, st.x + (ev.clientX - p0.x) / st.rect.width * 100)); it.y = Math.max(-20, Math.min(100, st.y + (ev.clientY - p0.y) / st.rect.height * 100)); }
    n.style.left = it.x + '%'; n.style.top = it.y + '%'; n.style.width = it.w + '%'; n.style.transform = `rotate(${it.r || 0}deg)`;
  });
  const end = ev => { if (!pts.has(ev.pointerId)) return; pts.delete(ev.pointerId); if (c && pts.size === 1) { const it = c.it; st = { ...st, x: it.x, y: it.y, w: it.w, r: it.r || 0, p: [...pts.values()].map(p => ({ ...p })) }; mode = 'm'; return; } if (!pts.size && c) { const moved = c; c = null; save(); if (moved.it.t === 'text' || moved.it.t === 'photo') A.render(); } };
  B.addEventListener('pointerup', end); B.addEventListener('pointercancel', end);
}
// ---------- acciones ----------
ACT.vbEdit = () => { edit = true; sel = null; A.render(); };
ACT.vbDone = () => { edit = false; sel = null; save(); A.render(); };
ACT.vbPick = a => { V().cur = a.dataset.id; sel = null; save(); A.render(); };
const addIt = o => { const b = cur(); if (b.items.length >= 80) return toast('Tu tablero ya tiene muchas cosas (máximo 80)'); const n = Object.assign({ id: uid(), x: 25 + Math.random() * 30, y: 25 + Math.random() * 30, w: 30, r: Math.round(Math.random() * 10 - 5), z: zmax(b) }, o); b.items.push(n); sel = n.id; save(); A.render(); return n; };
const getSel = () => cur().items.find(x => x.id === sel);
ACT.vbFront = () => { const i = getSel(); if (i) { i.z = zmax(cur()); save(); A.render(); } };
ACT.vbBack = () => { const i = getSel(); if (i) { i.z = Math.min(...cur().items.map(x => x.z || 1)) - 1; save(); A.render(); } };
ACT.vbDup = () => { const i = getSel(); if (i) addIt({ ...JSON.parse(JSON.stringify(i)), id: uid(), x: i.x + 5, y: i.y + 4, z: zmax(cur()) }); };
ACT.vbDel = () => { const b = cur(); b.items = b.items.filter(x => x.id !== sel); sel = null; save(); A.render(); };
function pickPhoto(cb) { const f = document.createElement('input'); f.type = 'file'; f.accept = 'image/*'; f.onchange = async () => { const file = f.files[0]; if (!file) return; toast('Subiendo foto…'); try { const r = await Store.saveImage(file, 800); const im = new Image(); im.onload = () => cb(r.src, im.naturalHeight / im.naturalWidth); im.onerror = () => cb(r.src, 1); im.src = r.src; } catch (e) { toast('No se pudo subir la foto'); } }; f.click(); }
ACT.vbAddPhoto = () => pickPhoto((src, ar) => addIt({ t: 'photo', img: src, ar, fr: 'pola', w: 40 }));
ACT.vbAddText = () => textSheet(null);
ACT.vbAddStk = () => sheet('Stickers', `<div class="vb-grid">${STK.map(n => `<button class="vb-stk" data-act="vbStk" data-n="${n}"><img class="pixel" alt="" src="${spr(n, 3)}"></button>`).join('')}</div>`);
ACT.vbStk = a => { closeSheet(); addIt({ t: 'spr', v: a.dataset.n, w: 16 }); };
ACT.vbAddTape = () => sheet('Cintas', `<div class="vb-grid t">${Object.entries(W()).map(([k, w]) => `<button class="vb-tp2" data-act="vbTape" data-k="${k}"><span class="${w.torn ? 'torn' : ''}" style="background:${w.css}"></span></button>`).join('')}</div>`);
ACT.vbTape = a => { closeSheet(); addIt({ t: 'tape', k: a.dataset.k, w: 24, r: Math.round(Math.random() * 30 - 15) }); };
ACT.vbAddGoal = () => goalSheet(null);
function goalSheet(it) { const G = (S.fin.goals || []).filter(g => !g.example); if (!G.length) return toast('Primero crea una meta de ahorro en Metas'); sheet('¿Cuál meta?', `<div class="vb-list">${G.map(g => `<button class="vb-li" data-act="vbGoal" data-id="${g.id}">${A.iconHTML(g.icon, 28)}<b>${esc(g.name)}</b></button>`).join('')}</div>`); }
ACT.vbGoal = a => { closeSheet(); const i = getSel(); if (i && i.t === 'goal') { i.goal = a.dataset.id; save(); A.render(); } else addIt({ t: 'goal', goal: a.dataset.id, w: 44 }); };
ACT.vbBg = () => sheet('Fondo', `<div class="vb-grid bg">${BGS.map(([k, n, css]) => `<button class="vb-bgb ${cur().bg === k ? 'on' : ''}" data-act="vbSetBg" data-k="${k}"><span style="background:${css}"></span><small>${n}</small></button>`).join('')}</div>`);
ACT.vbSetBg = a => { cur().bg = a.dataset.k; save(); closeSheet(); A.render(); };
// texto
let TS = null;
function textSheet(it) {
  TS = it ? { ...it } : { t: 'text', st: 'ransom', txt: '', c: 0, w: 60 }; const draw = () => sheet(it ? 'Cambiar texto' : 'Nuevo texto', `<div class="sb-form"><label class="f">¿Qué dice?<input class="in" id="vtTxt" maxlength="60" value="${esc(TS.txt)}" placeholder="Ej. I am my own muse"></label><div class="f">Estilo<div class="vb-chips">${TXTS.map(([k, n]) => `<button class="pl-chip ${TS.st === k ? 'on' : ''}" data-act="vtSt" data-k="${k}">${n}</button>`).join('')}</div></div><div class="f">Color<div class="vb-chips">${INK.map((c, i) => `<button class="vb-ink ${TS.c === i ? 'on' : ''}" data-act="vtInk" data-i="${i}" style="background:${c}"></button>`).join('')}</div></div><button class="pl-btn" data-act="vtOk">${it ? 'Guardar' : 'Poner en el tablero'}</button></div>`);
  TS.redraw = draw; draw();
}
ACT.vtSt = a => { TS.txt = gid('vtTxt').value; TS.st = a.dataset.k; TS.redraw(); };
ACT.vtInk = a => { TS.txt = gid('vtTxt').value; TS.c = +a.dataset.i; TS.redraw(); };
ACT.vtOk = () => { const t = gid('vtTxt').value.trim(); if (!t) return toast('Escribe algo'); const i = getSel(); closeSheet(); if (i && i.t === 'text' && TS.id) { Object.assign(i, { txt: t, st: TS.st, c: TS.c }); save(); A.render(); } else addIt({ t: 'text', txt: TS.st === 'ransom' || TS.st === 'label' || TS.st === 'bold' ? t.toUpperCase() : t, st: TS.st, c: TS.c, w: TS.st === 'bold' ? 70 : TS.st === 'ransom' ? 70 : 44 }); };
ACT.vbItemEdit = () => { const i = getSel(); if (!i) return; if (i.t === 'text') return textSheet(i); if (i.t === 'goal') return goalSheet(i);
  if (i.t === 'tape') return ACT.vbAddTape(); if (i.t === 'spr') return ACT.vbAddStk();
  sheet('Tu foto', `<div class="sb-form"><button class="pl-btn" data-act="vpNew">${i.img ? 'Cambiar la foto' : 'Elegir foto'}</button><div class="f">Marco<div class="vb-chips">${FRAMES.map(([k, n]) => `<button class="pl-chip ${i.fr === k ? 'on' : ''}" data-act="vpFr" data-k="${k}">${n}</button>`).join('')}</div></div><label class="f">Frasecita (en la polaroid)<input class="in" id="vpCap" maxlength="30" value="${esc(i.cap || '')}"></label><button class="pl-btn" data-act="vpOk">Listo</button></div>`); };
ACT.vpNew = () => pickPhoto((src, ar) => { const i = getSel(); if (i) { i.img = src; i.ar = ar; save(); closeSheet(); A.render(); } });
ACT.vpFr = a => { const i = getSel(); if (i) { i.cap = (gid('vpCap') || {}).value || i.cap; i.fr = a.dataset.k; save(); closeSheet(); A.render(); setTimeout(() => ACT.vbItemEdit(), 60); } };
ACT.vpOk = () => { const i = getSel(); if (i) { i.cap = gid('vpCap').value; save(); } closeSheet(); A.render(); };
// tableros
const TPL = [['vacio', 'En blanco', 'Solo el título'], ['rosa', 'Collage rosa', 'Fotos, notitas y cintas'], ['metas', 'Metas del año', 'Cuatro áreas de tu vida'], ['mood', 'Mi mood', 'Frases grandes y fotos redondas']];
const ph = (x, y, w, r, fr) => ({ t: 'photo', img: '', ar: 1.1, fr, x, y, w, r }), tx = (txt, st, x, y, w, r, c) => ({ t: 'text', txt, st, x, y, w, r, c: c || 0 }), sp = (v, x, y, w, r) => ({ t: 'spr', v, x, y, w, r }), tp = (k, x, y, w, r) => ({ t: 'tape', k, x, y, w, r });
function tplItems(k, title) {
  const T = tx(title.toUpperCase(), 'ransom', 6, 2.5, 88, -2);
  if (k === 'rosa') return [T, ph(6, 20, 42, -4, 'pola'), ph(52, 23, 40, 3, 'pola'), ph(8, 47, 36, 2, 'tape'), ph(50, 52, 40, -3, 'round'), tx('YOUNG GIRL WITH BIG GOALS', 'label', 22, 41, 56, -2), tx("don't overthink it", 'cloud', 56, 80, 38, 3, 1), tx('make art, make money', 'note', 6, 76, 34, -3, 0), tp('rosa', 14, 15, 24, -8), tp('celeste', 62, 18, 22, 9), sp('corazon_rosa', 44, 70, 12, 8), sp('estrellita', 84, 44, 9, -10), sp('mariposa', 2, 40, 11, -8)];
  if (k === 'metas') return [T, tx('AHORRAR', 'bold', 6, 17, 40, -3, 1), ph(52, 15, 38, 3, 'pola'), tx('VIAJAR', 'bold', 52, 40, 40, 2, 2), ph(6, 31, 38, -2, 'tape'), tx('cuidarme', 'marker', 8, 58, 40, -2, 3), ph(8, 66, 34, 2, 'round'), tx('estudiar', 'marker', 54, 58, 38, 3, 5), ph(52, 66, 36, -2, 'heart'), sp('estrellita', 42, 28, 9, 8), sp('brillito', 88, 8, 8, 0)];
  if (k === 'mood') return [T, tx('I AM MY OWN MUSE', 'bold', 8, 16, 84, -3, 1), ph(8, 40, 40, -3, 'round'), ph(54, 38, 36, 3, 'stamp'), tx('finish your songs', 'cloud', 10, 70, 46, 2, 2), tx('hot girl walks', 'note', 56, 68, 34, -3, 0), sp('music', 80, 8, 12, 8), sp('corazon_rosa', 44, 62, 12, -10), tp('dorado', 24, 36, 24, -12)];
  return [T];
}
ACT.vbNew = () => sheet('Nuevo vision board', `<div class="sb-form"><label class="f">Nombre<input class="in" id="vnT" maxlength="26" value="Vision board ${new Date().getFullYear() + (new Date().getMonth() >= 10 ? 1 : 0)}"></label><div class="f">¿Con qué empezamos?</div><div class="vb-list">${TPL.map(([k, n, d]) => `<button class="vb-li" data-act="vbCreate" data-k="${k}"><b>${n}</b><small>${d}</small></button>`).join('')}</div></div>`);
ACT.vbCreate = a => { const title = (gid('vnT').value || '').trim() || 'Mi tablero', k = a.dataset.k, v = V(), id = 'b' + uid(); v.boards.push({ id, title, bg: { rosa: 'rosa', metas: 'lunares', mood: 'amarillo', vacio: 'cuaderno' }[k], items: tplItems(k, title).map((o, i) => Object.assign({ id: uid(), z: i + 1 }, o)) }); v.cur = id; edit = true; sel = null; save(); closeSheet(); A.render(); };
ACT.vbMenu = () => { const b = cur(); sheet('Este tablero', `<div class="sb-form"><label class="f">Nombre<input class="in" id="vmT" maxlength="26" value="${esc(b.title)}"></label><button class="pl-btn" data-act="vmOk">Guardar nombre</button><button class="pl-btn ghost" data-act="vbBg">Cambiar fondo</button><button class="pl-btn ghost" data-act="vmDel">Borrar este tablero</button></div>`); };
ACT.vmOk = () => { const t = gid('vmT').value.trim(); if (t) { cur().title = t; save(); } closeSheet(); A.render(); };
ACT.vmDel = () => { const v = V(); if (v.boards.length <= 1) { const b = cur(); b.items = []; save(); closeSheet(); return A.render(); } v.boards = v.boards.filter(x => x.id !== v.cur); v.cur = v.boards[0].id; save(); closeSheet(); A.render(); };
// ---------- guardar como imagen ----------
ACT.vbSave = async () => {
  const b = cur(), B = $('#vbBoard'); if (!B) return; const bw = B.clientWidth, bh = B.clientHeight, k = 1080 / bw, cv = document.createElement('canvas'); cv.width = 1080; cv.height = Math.round(bh * k); const g = cv.getContext('2d');
  toast('Preparando imagen…');
  const sw = document.createElement('canvas'); sw.width = 40; sw.height = 40; // fondo: se dibuja el mismo estilo con un div → canvas aproximado
  const BC = { rosa: '#fff', lunares: '#fff8e6', kraft: '#e6c99c', amarillo: '#ffe989', celeste: '#bfe3f7', cuaderno: '#fffaf0', lila: '#d9c9f5', menta: '#bfead2', cielo: '#cfeeff', durazno: '#ffe3d3' }, bk = b.bg || 'rosa', Wd = cv.width, Hd = cv.height;
  g.fillStyle = BC[bk] || '#fff'; g.fillRect(0, 0, Wd, Hd);
  if (bk === 'cielo') { const gr = g.createLinearGradient(0, 0, 0, Hd); gr.addColorStop(0, '#aee0ff'); gr.addColorStop(.7, '#e8f7ff'); gr.addColorStop(1, '#fff'); g.fillStyle = gr; g.fillRect(0, 0, Wd, Hd); }
  const dots = (col, step, r) => { g.fillStyle = col; for (let y = step / 2; y < Hd; y += step) for (let x = step / 2; x < Wd; x += step) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } };
  if (bk === 'rosa') { g.fillStyle = 'rgba(255,160,195,.5)'; const st = 22 * k; for (let y = 0; y < Hd; y += st * 2) g.fillRect(0, y, Wd, st); for (let x = 0; x < Wd; x += st * 2) g.fillRect(x, 0, st, Hd); }
  else if (bk === 'lunares') dots('#3a2a2a', 17 * k, 2 * k); else if (bk === 'celeste') dots('#fff', 22 * k, 3 * k); else if (bk === 'lila') dots('rgba(255,255,255,.7)', 20 * k, 2.4 * k); else if (bk === 'durazno') dots('#ff9fb0', 16 * k, 2.4 * k);
  else if (bk === 'cuaderno') { g.fillStyle = '#f1c9d4'; for (let y = 22 * k; y < Hd; y += 22 * k) g.fillRect(0, y, Wd, Math.max(1, k)); }
  else if (bk === 'menta') { g.fillStyle = 'rgba(255,255,255,.6)'; for (let y = 0; y < Hd; y += 12 * k) g.fillRect(0, y, Wd, Math.max(1, k)); for (let x = 0; x < Wd; x += 12 * k) g.fillRect(x, 0, Math.max(1, k), Hd); }
  else if (bk === 'kraft') dots('rgba(120,80,40,.12)', 7 * k, 1 * k);
  const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
  for (const it of b.items.slice().sort((a, c) => (a.z || 1) - (c.z || 1))) {
    const n = B.querySelector(`[data-id="${it.id}"]`); if (!n) continue; const x = it.x / 100 * bw * k, y = it.y / 100 * bh * k, w = n.offsetWidth * k, h = n.offsetHeight * k;
    g.save(); g.translate(x + w / 2, y + h / 2); g.rotate((it.r || 0) * Math.PI / 180); g.translate(-w / 2, -h / 2);
    if (it.t === 'photo') { if (it.fr === 'pola') { g.fillStyle = '#fff'; g.shadowColor = 'rgba(0,0,0,.18)'; g.shadowBlur = 8; g.fillRect(0, 0, w, h); g.shadowBlur = 0; } const im = it.img ? await load(it.img) : null; const pad = it.fr === 'pola' ? w * .05 : 0, ph2 = it.fr === 'pola' ? h - w * .05 - h * .14 : h; if (im) { const bx = pad, by = pad, bw2 = w - pad * 2, bh2 = ph2 - pad; g.save(); if (it.fr === 'round') { g.beginPath(); g.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, 7); g.clip(); } const sc = Math.max(bw2 / im.width, bh2 / im.height); g.beginPath(); g.rect(bx, by, bw2, bh2); if (it.fr !== 'round') g.clip(); g.drawImage(im, bx + (bw2 - im.width * sc) / 2, by + (bh2 - im.height * sc) / 2, im.width * sc, im.height * sc); g.restore(); } else { g.fillStyle = '#ffe3ee'; g.fillRect(pad, pad, w - pad * 2, ph2 - pad); } if (it.fr === 'pola' && it.cap) { g.fillStyle = '#5a3a3a'; g.font = `700 ${w * .075}px Quicksand,sans-serif`; g.textAlign = 'center'; g.fillText(it.cap, w / 2, h - h * .04); } }
    else if (it.t === 'spr') { const im = await load(spr(it.v, 6)); if (im) { g.imageSmoothingEnabled = false; g.drawImage(im, 0, 0, w, h); } }
    else if (it.t === 'tape') { const w2 = W()[it.k] || {}; g.fillStyle = '#ffc9dc'; g.globalAlpha = .9; g.fillRect(0, 0, w, h); g.globalAlpha = 1; void w2; }
    else if (it.t === 'text' && it.st === 'ransom') { const fz = parseFloat(getComputedStyle(n.firstElementChild).fontSize) * k; g.textBaseline = 'middle'; const words = (it.txt || '').split(' '); let off = 0, cx = 0, cy = fz * .7; const lw = []; g.font = `700 ${fz}px Georgia,serif`; const line = []; words.forEach(wd => { const ww = [...wd].length * fz * .8; if (cx + ww > w && cx > 0) { cx = 0; cy += fz * 1.4; } [...wd].forEach((ch, j) => { const h = hash(it.txt, off + j), p = RB[h % RB.length]; g.save(); g.translate(cx + fz * .4, cy); g.rotate((((h >> 5) % 9) - 4) * Math.PI / 180); g.fillStyle = p[0]; g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 3; g.fillRect(-fz * .4, -fz * .55, fz * .8, fz * 1.1); g.shadowBlur = 0; g.fillStyle = p[1]; g.textAlign = 'center'; g.font = `${(h >> 9) % 2 ? 800 : 500} ${fz}px ${RF[(h >> 3) % RF.length]}`; g.fillText(ch, 0, 0); g.restore(); cx += fz * .86; }); off += [...wd].length + 1; cx += fz * .4; }); void lw; void line; }
    else if (it.t === 'text') { const ink = INK[it.c || 0]; g.textAlign = 'center'; g.textBaseline = 'middle'; const fsz = n.firstElementChild ? parseFloat(getComputedStyle(n.firstElementChild).fontSize) * k : 30; g.font = `800 ${fsz}px Fredoka,Nunito,sans-serif`; if (it.st === 'label' || it.st === 'note' || it.st === 'cloud') { g.fillStyle = it.st === 'note' ? '#ffd1e0' : '#fff'; g.fillRect(0, 0, w, h); } g.fillStyle = it.st === 'ransom' ? '#5a3a3a' : ink; const words = (it.txt || '').split(' '); let line = '', ly = fsz; const lines = []; words.forEach(wd => { const t = line ? line + ' ' + wd : wd; if (g.measureText(t).width > w * .95 && line) { lines.push(line); line = wd; } else line = t; }); lines.push(line); const th = lines.length * fsz * 1.15; lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 - th / 2 + (i + .6) * fsz * 1.15)); void ly; }
    else if (it.t === 'goal') { g.fillStyle = '#fffdf3'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a3a3a'; g.font = `800 ${w * .09}px Nunito,sans-serif`; g.textAlign = 'left'; const gl = (S.fin.goals || []).find(x => x.id === it.goal); g.fillText(gl ? gl.name : 'Meta', w * .06, h * .4); const pc = gl && gl.target ? Math.min(1, gl.saved / gl.target) : 0; g.fillStyle = '#ecdcc0'; g.fillRect(w * .06, h * .55, w * .88, h * .14); g.fillStyle = '#e0709a'; g.fillRect(w * .06, h * .55, w * .88 * pc, h * .14); }
    g.restore();
  }
  cv.toBlob(bl => { if (!bl) return toast('No se pudo crear la imagen'); const u = URL.createObjectURL(bl), l = document.createElement('a'); l.href = u; l.download = (b.title || 'vision-board') + '.png'; l.click(); setTimeout(() => URL.revokeObjectURL(u), 4000); toast('Imagen guardada'); }, 'image/png');
};
// salir del modo editar al cambiar de pantalla
const go0 = A.go; A.go = function (...x) { if (edit && x[0] !== 'tablero') { edit = false; sel = null; } return go0.apply(this, x); };
})();
