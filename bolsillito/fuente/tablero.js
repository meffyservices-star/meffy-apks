// ===== Bolsillito · Tablero de sueños: decorar con stickers, washi y stickers propios (como en el journal) =====
(function () {
const A = App, S = A.S, { $, $$, esc, toast, openSheet, closeSheet, uid } = A;
const ACT = A.ACTIONS;
const spr = (n, sc) => Pix.sprite(n, sc || 4);
const BD = () => S.settings.board = S.settings.board || {};
const DECO = () => { const b = BD(); return (b.deco = b.deco || []); };
const MINE = () => (S.settings.myStickers = S.settings.myStickers || []);
const WASHI = () => A.WASHI || App.WASHI || {};
const owns = k => (A.owns && A.owns(k)) || (A.isPlus && A.isPlus());
const specialOK = () => (A.isPlus && A.isPlus()) || (A.owns && A.owns('stickers:pixel'));
let deco = false, sel = null;

// ---------- cómo se dibuja cada decoración ----------
function elHTML(e) {
  const st = `left:${e.x}%;top:${e.y}%;width:${e.w}%;--r:${e.r || 0}deg;z-index:${e.z || 1}`;
  let inner = '';
  if (e.t === 'washi') { const w = WASHI()[e.k] || WASHI().rosa || { css: '#ffc2dc' }; inner = `<span class="bdx-washi ${w.torn ? 'torn' : ''}" style="background:${w.css}"></span>`; }
  else if (e.v && e.v.startsWith('s:')) inner = `<img class="pixel" alt="" src="${spr(e.v.slice(2), 4)}" draggable="false">`;
  else if (e.v && e.v.startsWith('i:')) inner = `<img alt="" src="${esc(e.v.slice(2))}" draggable="false">`;
  return `<div class="bdx ${e.t === 'washi' ? 'is-washi' : ''} ${deco && sel === e.id ? 'sel' : ''}" data-dx="${esc(e.id)}" style="${st}">${inner}</div>`;
}
const layerHTML = () => `<div class="bd-deco ${deco ? 'on' : ''}" id="bdDeco">${DECO().map(elHTML).join('')}</div>`;
const barHTML = () => {
  const e = DECO().find(x => x.id === sel);
  return `<div class="bdx-bar" id="bdBar">${e ? `<div class="bdx-tools"><button data-dt="small" aria-label="Más pequeño">−</button><button data-dt="big" aria-label="Más grande">+</button><button data-dt="rl" aria-label="Girar a la izquierda">⟲</button><button data-dt="rr" aria-label="Girar a la derecha">⟳</button><button data-dt="front" aria-label="Al frente">${'<img class="pixel" alt="" src="' + spr('sparkle', 3) + '" style="width:18px">'}</button><button data-dt="dup" aria-label="Duplicar">⧉</button><button data-dt="del" class="del" aria-label="Quitar">✕</button></div>` : '<div class="bdx-hint">Toca una decoración para moverla, agrandarla o girarla. Arrástrala con el dedo.</div>'}
<div class="bdx-add"><button class="btn pink sm" data-act="bdxPick" data-tab="st">${'<img class="pixel" alt="" src="' + spr('star', 3) + '" style="width:16px">'} Stickers</button><button class="btn sm" data-act="bdxPick" data-tab="wa">${'<img class="pixel" alt="" src="' + spr('ui_washi', 3) + '" style="width:16px">'} Washi</button><button class="btn sm" data-act="bdxPick" data-tab="mi">${'<img class="pixel" alt="" src="' + spr('pic', 3) + '" style="width:16px">'} Los míos</button><button class="btn sm primary" data-act="bdxDone">Listo</button></div></div>`;
};

// ---------- se mete en la pantalla del tablero que ya existe ----------
const scr0 = A.screens.tablero;
A.screens.tablero = () => {
  let h = scr0();
  if (deco) h = h.replace('<button class="btn sm" data-act="bdAdd">Agregar +</button>', '');
  const tools = deco ? '' : `<div class="bd-tools"><button class="btn sm" data-act="bdxOn"><img class="pixel" alt="" src="${spr('star', 3)}" style="width:16px"> Decorar con stickers</button></div>`;
  h = h.replace('<div class="board">', `${tools}<div class="board ${deco ? 'decorating' : ''}" id="bdBoard">${layerHTML()}`);
  if (deco) h = h.replace(/<p class="faint" style="margin:0">Pon fotos[\s\S]*?<\/p>/, '') + barHTML();
  return h;
};
const after0 = A.after.tablero;
A.after.tablero = el => { if (after0) after0(el); if (deco) bindDrag(el); };
ACT.bdxOn = () => { deco = true; sel = null; A.render(); };
ACT.bdxDone = () => { deco = false; sel = null; A.saveSettings(); A.render(); };
// fuera del tablero se sale del modo decorar
const go0 = A.go; if (go0) A.go = (...x) => { if (deco) { deco = false; sel = null; A.saveSettings(); } return go0(...x); };

function refresh() { const L = $('#bdDeco'); if (L) L.outerHTML = layerHTML(); const B = $('#bdBar'); if (B) B.outerHTML = barHTML(); const el = $('#scr'); if (el) bindDrag(el); }
function add(e) {
  const L = DECO(); if (L.length >= 60) return toast('Tu tablero ya tiene muchas decoraciones (máximo 60)');
  const z = L.reduce((m, x) => Math.max(m, x.z || 1), 1) + 1;
  // aparece donde estás mirando
  const B = $('#bdBoard'); let y = 30; if (B) { const r = B.getBoundingClientRect(); const mid = Math.min(r.bottom, innerHeight) / 2 + Math.max(r.top, 0) / 2; y = Math.max(5, Math.min(90, (mid - r.top) / r.height * 100)); }
  const n = Object.assign({ x: 30 + Math.random() * 40, y, w: 22, r: Math.round(Math.random() * 16 - 8), z }, e, { id: 'd' + uid() });
  L.push(n); sel = n.id; A.saveSettings(); refresh();
}

// ---------- mover con el dedo (y pellizcar para agrandar) ----------
function bindDrag(el) {
  const B = $('#bdBoard', el); if (!B || B.dataset.bound) return; B.dataset.bound = '1';
  const pts = new Map(); let cur = null, start = null;
  B.addEventListener('pointerdown', ev => {
    if (!deco) return;
    const t = ev.target.closest('.bdx');
    if (!t) { if (!ev.target.closest('.bdx-bar')) { sel = null; refresh(); } return; }
    ev.preventDefault(); const e = DECO().find(x => x.id === t.dataset.dx); if (!e) return;
    if (sel !== e.id) { sel = e.id; refresh(); }
    const node = B.querySelector(`[data-dx="${CSS.escape(e.id)}"]`); if (!node) return;
    try { B.setPointerCapture(ev.pointerId); } catch (er) { }
    pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    cur = { e, node }; const r = B.getBoundingClientRect();
    start = { x: e.x, y: e.y, w: e.w, r: e.r || 0, rect: r, p: [...pts.values()].map(p => ({ ...p })) };
  });
  B.addEventListener('pointermove', ev => {
    if (!cur || !pts.has(ev.pointerId)) return; pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    const { e, node } = cur, r = start.rect, P = [...pts.values()];
    if (P.length >= 2 && start.p.length >= 2) {
      const d0 = Math.hypot(start.p[0].x - start.p[1].x, start.p[0].y - start.p[1].y) || 1, d1 = Math.hypot(P[0].x - P[1].x, P[0].y - P[1].y);
      const a0 = Math.atan2(start.p[1].y - start.p[0].y, start.p[1].x - start.p[0].x), a1 = Math.atan2(P[1].y - P[0].y, P[1].x - P[0].x);
      e.w = Math.max(6, Math.min(90, start.w * d1 / d0)); e.r = Math.round(start.r + (a1 - a0) * 180 / Math.PI);
      node.style.width = e.w + '%'; node.style.setProperty('--r', e.r + 'deg');
    } else {
      const p0 = start.p[0];
      e.x = Math.max(-5, Math.min(105, start.x + (ev.clientX - p0.x) / r.width * 100));
      e.y = Math.max(-5, Math.min(105, start.y + (ev.clientY - p0.y) / r.height * 100));
      node.style.left = e.x + '%'; node.style.top = e.y + '%';
    }
  });
  const end = ev => {
    if (!pts.has(ev.pointerId)) return; pts.delete(ev.pointerId);
    if (cur && pts.size === 1) { const e = cur.e; start = { x: e.x, y: e.y, w: e.w, r: e.r || 0, rect: B.getBoundingClientRect(), p: [...pts.values()].map(p => ({ ...p })) }; return; }
    if (!pts.size && cur) { cur = null; A.saveSettings(); }
  };
  B.addEventListener('pointerup', end); B.addEventListener('pointercancel', end);
}

// botones de la barrita (se escuchan una sola vez para toda la app)
document.addEventListener('click', ev => {
  const b = ev.target.closest('#bdBar [data-dt]'); if (!b || !deco) return; const L = DECO(), e = L.find(x => x.id === sel); if (!e) return;
  const k = b.dataset.dt;
  if (k === 'small') e.w = Math.max(6, e.w / 1.15); if (k === 'big') e.w = Math.min(90, e.w * 1.15);
  if (k === 'rl') e.r = (e.r || 0) - 10; if (k === 'rr') e.r = (e.r || 0) + 10;
  if (k === 'front') e.z = L.reduce((m, x) => Math.max(m, x.z || 1), 1) + 1;
  if (k === 'dup') { add(Object.assign({}, e, { id: undefined, x: Math.min(95, e.x + 6), y: Math.min(95, e.y + 4) })); return; }
  if (k === 'del') { BD().deco = L.filter(x => x.id !== e.id); sel = null; }
  A.saveSettings(); refresh();
});

// ---------- elegir decoraciones: stickers, washi y los que sube la usuaria ----------
ACT.bdxPick = a => picker(a.dataset.tab || 'st');
function picker(tab) {
  const MOCHIS = ['gochi', 'canela', 'shey', 'pudin', 'gochi~fresa', 'canela~noche', 'shey~menta', 'pudin~chocolate', 'heart~noche', 'star~fresa', 'moon~menta', 'flower~noche'];
  const grid = list => `<div class="emojigrid">${list.join('')}</div>`;
  const stBtn = (n, special) => `<button data-sk="s:${n}" ${special ? 'data-special="1"' : ''}><img class="pixel" alt="" src="${Pix.sprite(n, 3)}"></button>`;
  const body = () => {
    if (tab === 'wa') return `<div class="bdx-washis">${Object.entries(WASHI()).map(([k, w]) => { const ok = w.free || owns('washi:' + k); return `<button class="bdx-wpick ${ok ? '' : 'lock'}" data-wk="${k}" ${ok ? '' : 'data-lock="1"'}><span class="bdx-washi ${w.torn ? 'torn' : ''}" style="background:${w.css}"></span><span>${esc(w.name)}${ok ? '' : ' · Tiendita'}</span></button>`; }).join('')}</div>`;
    if (tab === 'mi') { const L = MINE(); return `<label class="btn pink" style="justify-content:center;cursor:pointer">Subir un sticker (foto o PNG)<input type="file" accept="image/*" id="bdxUp" hidden></label><p class="faint" style="margin:6px 0 10px">Si el PNG no tiene fondo, se ve recortadito. Quedan guardados aquí para usarlos cuando quieras.</p><div id="bdxUpSt" class="faint"></div>${L.length ? `<div class="emojigrid bdx-mine">${L.map((src, i) => `<button data-sk="i:${esc(src)}"><img alt="" src="${esc(src)}"><i data-mdel="${i}" aria-label="Quitar">×</i></button>`).join('')}</div>` : '<div class="empty">Todavía no subiste stickers.</div>'}`; }
    const regalos = (S.settings.giftStickers || []).filter(n => Pix.has(n));
    const nuevos = Pix.names.filter(n => /^cs_/.test(n));
    const pixel = Pix.names.filter(n => !['gochi', 'canela', 'shey', 'pudin'].includes(n) && !/^(x_pared|x_piso|pg_|cp_|cf_|cfo_|cs_|ci_|__|m_|regalo_|plataforma|acc_|cgb_|i_|x_)/.test(n));
    return `${nuevos.length ? `<div class="lab">Nuevos</div>${grid(nuevos.map(n => stBtn(n)))}` : ''}${regalos.length ? `<div class="lab">Regalos de tus amigas</div>${grid(regalos.map(n => stBtn(n)))}` : ''}<div class="lab">Mascotas y colores especiales ${specialOK() ? '' : '<span class="tag gold">Meffy+</span>'}</div>${grid(MOCHIS.map(n => stBtn(n, true)))}<div class="lab">Stickers pixel</div>${grid(pixel.map(n => stBtn(n)))}`;
  };
  const html = () => `<div class="seg" style="margin-bottom:12px"><button data-tb="st" aria-pressed="${tab === 'st'}">Stickers</button><button data-tb="wa" aria-pressed="${tab === 'wa'}">Washi</button><button data-tb="mi" aria-pressed="${tab === 'mi'}">Los míos</button></div><div id="bdxBody">${body()}</div>`;
  openSheet('Decorar el tablero', html(), sh => {
    const redraw = () => { const b = $('#bdxBody', sh); if (b) b.innerHTML = body(); $$('[data-tb]', sh).forEach(x => x.setAttribute('aria-pressed', x.dataset.tb === tab)); };
    sh.addEventListener('click', e => {
      const t = e.target.closest('[data-tb]'); if (t) { tab = t.dataset.tb; redraw(); return; }
      const md = e.target.closest('[data-mdel]'); if (md) { e.stopPropagation(); MINE().splice(+md.dataset.mdel, 1); A.saveSettings(); redraw(); return; }
      const s = e.target.closest('[data-sk]'); if (s) {
        if (s.dataset.special && !specialOK()) { closeSheet(); A.openSheet('Stickers especiales', A.plusPitch ? A.plusPitch('Los stickers de las mascotas vienen con Meffy+ o se compran en la Tiendita.') : 'Vienen con Meffy+.', x => x.addEventListener('click', ev => { if (ev.target.closest('[data-go-plan]')) { A.closeSheet(); A.go('plan'); } })); return; }
        closeSheet(); add({ t: 'sticker', v: s.dataset.sk, w: s.dataset.sk.startsWith('i:') ? 26 : 20 }); return;
      }
      const w = e.target.closest('[data-wk]'); if (w) { if (w.dataset.lock) return toast('Esa washi se consigue en la Tiendita'); closeSheet(); add({ t: 'washi', k: w.dataset.wk, w: 34, r: Math.round(Math.random() * 30 - 15) }); }
    });
    sh.addEventListener('change', async e => {
      if (e.target.id !== 'bdxUp' || !e.target.files[0]) return; const st = $('#bdxUpSt', sh);
      st.textContent = 'Subiendo…';
      try { const r = await Store.saveImage(e.target.files[0], 360); MINE().unshift(r.src); S.settings.myStickers = MINE().slice(0, 40); A.saveSettings(); st.textContent = '¡Listo! Tócalo para ponerlo en tu tablero.'; redraw(); }
      catch (er) { st.textContent = 'No se pudo subir. Revisa tu conexión.'; }
    });
  });
}
})();
