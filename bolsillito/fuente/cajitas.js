// ===== Bolsillito · Cajitas sorpresa (blind boxes): la admin las arma en el panel y se compran en la Tiendita =====
(function () {
const A = App, S = A.S, { $, $$, esc, toast, openSheet, closeSheet } = A;
const ACT = A.ACTIONS;
const spr = (n, sc) => Pix.sprite(n, sc || 3);
const ST = n => `<img class="pixel ico" alt="estrellitas" src="${spr('estrellita', 3)}" style="width:${n || 16}px;height:${n || 16}px;vertical-align:-3px">`;
const bal = () => (A.rinconBalance ? A.rinconBalance() : 0);
const sfx = n => { if (window.Sfx) window.Sfx.play(n, true); };

// ---------------- Qué tan difícil es sacar cada cosa ----------------
const RARE = { 1: ['Común', 10, '#9fd6f2'], 2: ['Raro', 4, '#b59ae6'], 3: ['Súper raro', 1, '#f2b33a'] };
const KIND_N = { acc: 'Ropa', furn: 'Mueble', pet: 'Mascota', food: 'Comida', stars: 'Estrellitas' };
const pets = () => (A.allPets ? A.allPets() : {});
function exists(it) { return it.t === 'stars' ? +it.k > 0 : it.t === 'acc' ? !!A.ACC[it.k] : it.t === 'furn' ? !!A.FURN[it.k] : it.t === 'pet' ? !!pets()[it.k] : it.t === 'food' ? !!A.FOODS[it.k] : false; }
function nameOf(it) { return it.t === 'stars' ? it.k + ' estrellitas' : it.t === 'acc' ? A.ACC[it.k].name : it.t === 'furn' ? A.FURN[it.k].name : it.t === 'pet' ? pets()[it.k].name : A.FOODS[it.k].name; }
function srcOf(it, sc) { return it.t === 'stars' ? spr('estrellita', sc || 4) : it.t === 'acc' ? spr('acc_' + it.k, sc || 4) : it.t === 'furn' ? Pix.sprite(A.furnSprite(it.k), Math.max(1, (sc || 4) - 2)) : it.t === 'pet' ? spr(pets()[it.k].sprite || it.k, sc || 4) : spr(A.FOODS[it.k].sprite || it.k, sc || 4); }
const R0 = () => { const r = S.settings.rincon = S.settings.rincon || { owned: [] }; r.owned = r.owned || []; return r; };
function owned(it) { if (it.t === 'acc') return R0().owned.includes('acc:' + it.k); if (it.t === 'pet') return ((A.petState().owned) || []).includes(it.k); return false; }
const odds = items => { const tot = items.reduce((n, x) => n + RARE[x.r || 1][1], 0) || 1; return x => Math.round(RARE[x.r || 1][1] / tot * 1000) / 10; };
const live = () => (((A.CFG && A.CFG.catalog) || {}).boxes || []).filter(b => !b.off && !(b.from && b.from > A.today())).map(b => Object.assign({}, b, { items: (b.items || []).filter(exists) })).filter(b => b.items.length);

// ---------------- La caja: tú haces solo la portada y la app arma la caja (tapa, costado y contorno) ----------------
const BCOLORS = { rosa: '#f7a6c0', lila: '#c3aef0', menta: '#9fdcb8', cielo: '#a9d3f2', durazno: '#f8c49a', crema: '#f6e2c4', dorado: '#f2cd73', noche: '#5b4791' };
const BRARE = { 1: ['Común', '#9fd6f2'], 2: ['Rara', '#b59ae6'], 3: ['Súper rara', '#f2b33a'] };
const hex2 = h => { h = (h || '#f7a6c0').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const mix = (h, t, k) => { const a = hex2(h), b = hex2(t); return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
function composeBox(cover, color) {
  const map = cover.map || [], pal = typeof cover.pal === 'string' ? cover.pal.split(',') : (cover.pal || []);
  const cw = (cover.w || (map[0] || '').length || 14), ch = (cover.h || map.length || 16), D = Math.max(3, Math.round(cw / 4));
  const W = cw + D + 2, H = ch + D + 2, g = Array.from({ length: H }, () => Array(W).fill('.'));
  const base = BCOLORS[color] || color || '#f7a6c0';
  const P = pal.slice(), add = c => { P.push(c); return (P.length - 1).toString(36); };
  // si la paleta de la portada ya ocupa muchos colores, igual cabe: base36 llega a 36
  const cOut = add('#6b3b3f'), cTop = add(mix(base, '#ffffff', .35)), cTopHi = add(mix(base, '#ffffff', .65)), cSide = add(mix(base, '#000000', .18)), cSideDk = add(mix(base, '#000000', .3)), cFront = add(base);
  for (let r = 0; r < D; r++) for (let x = 0; x < cw; x++) g[1 + r][1 + (D - r) + x] = r === 0 ? cTopHi : cTop;          // tapa
  for (let c = 0; c < D; c++) for (let y = 0; y < ch; y++) g[1 + (D - c) + y][1 + cw + c] = c === D - 1 ? cSideDk : cSide; // costado
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) { const chh = (map[y] || '')[x]; g[1 + D + y][1 + x] = chh && chh !== '.' ? chh : cFront; } // portada
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === '.' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => g[y + b] && g[y + b][x + a] && g[y + b][x + a] !== '.' && g[y + b][x + a] !== cOut)) g[y][x] = 'O';
  return { raw: g.map(row => row.join('').replace(/O/g, cOut)), pal: P.join(',') };
}
const boxCache = {};
function boxImg(b, sc) {
  const key = 'cbxb_' + b.id, sig = (b.map || []).join('') + '|' + b.pal + '|' + (b.bcolor || '');
  if (boxCache[key] !== sig) { Pix.define(key, composeBox(b, b.bcolor)); boxCache[key] = sig; }
  return spr(key, sc || 4);
}
A.boxImg = boxImg;
// portadas listas (14 x 16) para empezar; se pueden dibujar encima o subir la propia
const ICONS = {
  heart: ['.11.11.', '1111111', '1111111', '.11111.', '..111..', '...1...'],
  star: ['...1...', '..111..', '1111111', '.11111.', '.11.11.', '.1...1.'],
  q: ['.1111.', '11..11', '....11', '...11.', '..11..', '......', '..11..'],
  bow: ['11...11', '111.111', '1111111', '111.111', '11...11'],
  frame: ['1111111', '1.....1', '1.2.2.1', '1..2..1', '1.....1', '1111111']
};
const COVERS = [['Ropa', 'rosa', 'bow', '#c44a72'], ['Personajes', 'menta', 'heart', '#f27ea1'], ['Juguetes', 'durazno', 'star', '#f2a33a'], ['Cuadros', 'cielo', 'frame', '#5b4791'], ['Misterio', 'lila', 'q', '#ffffff']];
function coverMap(i) {
  const [, col, ic, icol] = COVERS[i] || COVERS[0]; const W = 14, H = 16;
  const pal = [mix(BCOLORS[col], '#ffffff', .15), '#ffffff', icol, mix(BCOLORS[col], '#000000', .15), '#fff3b0'];
  const g = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => ((x + y) % 4 === 0 ? '3' : '0')));
  for (let x = 1; x < W - 1; x++) { g[1][x] = '1'; g[H - 2][x] = '1'; } for (let y = 1; y < H - 1; y++) { g[y][1] = '1'; g[y][W - 2] = '1'; }
  const L = ICONS[ic]; const ox = Math.floor((W - L[0].length) / 2), oy = 4;
  L.forEach((row, y) => [...row].forEach((c, x) => { if (c === '1') g[oy + y][ox + x] = '2'; if (c === '2') g[oy + y][ox + x] = '4'; }));
  for (let x = 3; x < W - 3; x++) g[H - 4][x] = '1';
  return { w: W, h: H, map: g.map(r => r.join('')), pal };
}
A.boxPreset = (ed, i) => { const c = coverMap(i); ed.w = c.w; ed.h = c.h; ed.map = c.map; ed.pal = c.pal.slice(); ed.preset = i; ed.bcolor = COVERS[i][1]; if (!ed.name) ed.name = 'Cajita de ' + COVERS[i][0].toLowerCase(); };
COVERS.forEach((_, i) => { const c = coverMap(i); Pix.define('bx_pre_' + i, composeBox(c, COVERS[i][1])); });

// ---------------- Panel: armar la cajita ----------------
function prevBox(ed) { Pix.define('__bxprev', composeBox({ map: ed.map, pal: ed.pal, w: ed.w, h: ed.h }, ed.bcolor || 'rosa')); return Pix.sprite('__bxprev', 6); }
A.boxFormHTML = ed => {
  ed.items = ed.items || []; const pc = odds(ed.items);
  return `<div class="bx-form">
<div class="bx-prev-wrap"><img class="pixel" id="bxPrevBox" alt="Así se ve la cajita" src="${prevBox(ed)}"><span class="faint">Arriba dibujas o subes <b>solo la portada</b> (el frente). La tapa, el costado y el contorno se arman solos.</span></div>
<div class="f">Portadas listas para empezar<div class="bx-presets">${COVERS.map(([n], i) => `<button type="button" data-act="bxPreset" data-i="${i}" aria-pressed="${ed.preset === i}"><img class="pixel" alt="" src="${spr('bx_pre_' + i, 3)}"><span>${n}</span></button>`).join('')}</div></div>
<div class="f">Color de la caja<div class="bx-colors">${Object.entries(BCOLORS).map(([k, c]) => `<button type="button" data-act="bxColor" data-v="${k}" aria-pressed="${(ed.bcolor || 'rosa') === k}" style="--c:${c}" aria-label="${k}"><i></i></button>`).join('')}</div></div>
<div class="f">Rareza de la cajita (en qué estante va)<div class="seg">${[1, 2, 3].map(v => `<button type="button" data-act="bxBrare" data-v="${v}" aria-pressed="${(+ed.brare || 1) === v}">${BRARE[v][0]}</button>`).join('')}</div></div>
<div class="formgrid"><label class="f">Precio en estrellitas<input class="in" data-ed="price" type="number" min="1" value="${+ed.price || 30}"></label></div>
<div class="f">Sorpresitas adentro (${ed.items.length})<div class="bx-items">${ed.items.map((it, i) => exists(it) ? `<div class="bx-it" style="--rc:${RARE[it.r || 1][2]}"><img class="pixel" alt="" src="${srcOf(it, 3)}"><span class="bx-it-tx"><b>${esc(nameOf(it))}</b><span>${KIND_N[it.t]} · ${pc(it)}%</span></span><select class="in" data-bxr="${i}" aria-label="Qué tan difícil">${[1, 2, 3].map(v => `<option value="${v}" ${(it.r || 1) === v ? 'selected' : ''}>${RARE[v][0]}</option>`).join('')}</select><button type="button" class="iconbtn sm" data-act="bxDel" data-i="${i}" aria-label="Quitar">×</button></div>` : '').join('') || '<div class="faint">Todavía no hay sorpresitas. Agrega ropa, muebles (juguetes, cuadros…), mascotas, comida o estrellitas.</div>'}</div>
<button type="button" class="btn pink sm" data-act="bxAdd" style="align-self:flex-start;margin-top:6px">+ Agregar sorpresitas</button></div>
<p class="faint" style="margin:0">En la Tiendita las cajitas se ponen en una estantería: abajo las comunes, luego las raras y arriba las súper raras, de la más barata a la más cara. Adentro, cada sorpresita sale según su rareza. Si a alguien le sale ropa o una mascota que ya tiene, le devolvemos parte de las estrellitas.</p></div>`;
};
// la vista de la caja se actualiza mientras dibujas la portada
const refreshPrev = () => { const im = document.getElementById('bxPrevBox'); const ed = A.catEd && A.catEd(); if (im && ed && ed.kind === 'boxes') im.src = prevBox(ed); };
['pointerup', 'change', 'click'].forEach(ev => document.addEventListener(ev, () => setTimeout(refreshPrev, 30)));
ACT.bxPreset = a => { const ed = A.catEd && A.catEd(); if (!ed) return; const keep = ed.name; const auto = !keep || COVERS.some(([n]) => keep === 'Cajita de ' + n.toLowerCase()); if (auto) ed.name = ''; A.boxPreset(ed, +a.dataset.i); if (!auto) ed.name = keep; A.render(); };
ACT.bxColor = a => { const ed = A.catEd(); ed.bcolor = a.dataset.v; A.render(); };
ACT.bxBrare = a => { const ed = A.catEd(); ed.brare = +a.dataset.v; A.render(); };
ACT.bxDel = a => { const ed = A.catEd(); ed.items.splice(+a.dataset.i, 1); A.render(); };
document.addEventListener('change', e => { const s = e.target.closest && e.target.closest('[data-bxr]'); if (!s) return; const ed = A.catEd && A.catEd(); if (!ed || !ed.items) return; ed.items[+s.dataset.bxr].r = +s.value; A.render(); });
A.boxSaveItem = (ed, item) => {
  const items = (ed.items || []).filter(exists); if (!items.length) return 'Agrega al menos una sorpresita';
  item.how = 'stars'; item.price = Math.max(1, Math.round(+ed.price || 30)); item.items = items.map(x => ({ t: x.t, k: x.k, r: x.r || 1 }));
  item.bcolor = ed.bcolor || 'rosa'; item.brare = +ed.brare || 1; if (ed.preset != null) item.preset = ed.preset;
  return null;
};
// elegir qué trae
ACT.bxAdd = () => {
  const ed = A.catEd(); if (!ed) return; let tab = S.bxTab || 'acc', q = '';
  const list = () => {
    const L = tab === 'acc' ? Object.keys(A.ACC).filter(k => !A.ACC[k].gone).map(k => ({ t: 'acc', k }))
      : tab === 'furn' ? Object.keys(A.FURN).map(k => ({ t: 'furn', k }))
      : tab === 'pet' ? Object.keys(pets()).map(k => ({ t: 'pet', k }))
      : tab === 'food' ? Object.keys(A.FOODS).filter(k => !A.FOODS[k].off).map(k => ({ t: 'food', k }))
      : [5, 10, 15, 25, 50, 100].map(n => ({ t: 'stars', k: String(n) }));
    const nq = q.toLowerCase();
    return L.filter(exists).filter(it => !nq || nameOf(it).toLowerCase().includes(nq));
  };
  const has = it => ed.items.some(x => x.t === it.t && x.k === it.k);
  const body = () => `<div class="stack"><div class="chips">${Object.entries(KIND_N).map(([k, n]) => `<button class="chip" data-bt="${k}" aria-pressed="${tab === k}">${n}</button>`).join('')}</div>
<input class="in" id="bxQ" placeholder="Buscar…" value="${esc(q)}" type="search">
<div class="bx-pick" id="bxPick">${pick()}</div><button class="btn pink" id="bxDone" data-x style="justify-content:center">Listo (${ed.items.length})</button></div>`;
  const pick = () => list().map(it => `<button class="bx-pk ${has(it) ? 'on' : ''}" data-pk="${it.t}|${esc(it.k)}"><img class="pixel" alt="" src="${srcOf(it, 3)}"><span>${esc(nameOf(it))}</span>${has(it) ? '<i>✓</i>' : ''}</button>`).join('') || '<div class="faint">No hay nada aquí.</div>';
  openSheet('Sorpresitas de la cajita', body(), sh => {
    sh.addEventListener('click', e => {
      const t = e.target.closest('[data-bt]'); if (t) { tab = S.bxTab = t.dataset.bt; $$('[data-bt]', sh).forEach(b => b.setAttribute('aria-pressed', b.dataset.bt === tab)); $('#bxPick', sh).innerHTML = pick(); return; }
      const p = e.target.closest('[data-pk]'); if (p) { const [tt, k] = p.dataset.pk.split('|'); const i = ed.items.findIndex(x => x.t === tt && x.k === k); if (i >= 0) ed.items.splice(i, 1); else ed.items.push({ t: tt, k, r: 1 }); $('#bxPick', sh).innerHTML = pick(); const d = $('#bxDone', sh); if (d) d.textContent = `Listo (${ed.items.length})`; return; }
    });
    sh.addEventListener('input', e => { if (e.target.id === 'bxQ') { q = e.target.value; $('#bxPick', sh).innerHTML = pick(); } });
    const done = $('#bxDone', sh); if (done) done.addEventListener('click', () => { closeSheet(); setTimeout(() => A.render(), 60); });
  }, { onClose: () => A.render() });
};

// ---------------- Tiendita ----------------
A.boxesShopHTML = () => {
  const L = live();
  if (!L.length) return Store.isOwner ? `<button class="card bx-empty" data-go="admincat" data-kind="boxes"><img class="pixel" alt="" src="${spr('bx_pre_4', 4)}" style="width:56px"><span><b>Cajitas sorpresa</b><br><span class="faint">Solo tú ves esto: crea la primera en Panel → Agregar cosas nuevas → Cajita sorpresa.</span></span></button>` : '';
  // estantes: arriba las súper raras, al medio las raras y abajo las comunes; en cada uno de la más barata a la más cara
  const rows = [3, 2, 1].map(r => [r, L.filter(b => (+b.brare || 1) === r).sort((x, y) => x.price - y.price)]).filter(([, l]) => l.length);
  const box = b => `<button class="bx-slot r${+b.brare || 1}" data-act="bxView" data-id="${esc(b.id)}" aria-label="${esc(b.name)}, ${b.price} estrellitas"><span class="bx-slot-art"><img class="pixel" alt="" src="${boxImg(b, 4)}"></span><span class="bx-tag">${ST(11)} ${b.price}</span><span class="bx-slot-n">${esc(b.name)}</span></button>`;
  return `<div class="bx-shelf"><div class="bx-shelf-top"><b>Cajitas sorpresa</b><span>Toca una para ver qué trae</span></div>
${rows.map(([r, l]) => `<div class="bx-row r${r}"><span class="bx-sign" style="--rc:${BRARE[r][1]}">${BRARE[r][0]}${r === 3 ? ' ✦' : ''}</span><div class="bx-row-items">${l.map(box).join('')}</div><span class="bx-plank"></span></div>`).join('')}</div>`;
};
document.addEventListener('click', e => { const b = e.target.closest('[data-go="admincat"][data-kind]'); if (b) S.catKind = b.dataset.kind; }, true);
function pickPrize(items) { const tot = items.reduce((n, x) => n + RARE[x.r || 1][1], 0); let r = Math.random() * tot; for (const x of items) { r -= RARE[x.r || 1][1]; if (r <= 0) return x; } return items[items.length - 1]; }
function give(it, price) {
  if (it.t === 'stars') { A.giveStars(+it.k); return { dup: false }; }
  if (owned(it)) { const back = Math.max(2, Math.round(price * .4)); A.giveStars(back); return { dup: true, back }; }
  if (it.t === 'acc') { R0().owned.push('acc:' + it.k); if (A.registerCatalog) A.registerCatalog(); }
  if (it.t === 'pet') A.petAdopt(it.k);
  if (it.t === 'furn') A.giveFurn(it.k, 1);
  if (it.t === 'food') { const p = A.petState(); p.pantry = p.pantry || {}; p.pantry[it.k] = (p.pantry[it.k] || 0) + 1; }
  return { dup: false };
}
ACT.bxView = a => {
  const b = live().find(x => x.id === a.dataset.id); if (!b) return toast('Esta cajita ya no está');
  const pc = odds(b.items);
  const sorted = b.items.slice().sort((x, y) => (y.r || 1) - (x.r || 1));
  const paint = () => { const bl = bal(); return `<div class="bx-view"><div class="bx-stage" id="bxStage"><span class="bx-glow"></span><img class="pixel bx-big wiggle" alt="" src="${boxImg(b, 7)}"></div>
<div class="bx-odds">${sorted.map(it => `<div class="bx-odd ${owned(it) ? 'own' : ''}" style="--rc:${RARE[it.r || 1][2]}"><img class="pixel" alt="" src="${srcOf(it, 3)}"><span>${esc(nameOf(it))}</span><em>${RARE[it.r || 1][0]} · ${pc(it)}%</em>${owned(it) ? '<i>Ya lo tienes</i>' : ''}</div>`).join('')}</div>
<button class="btn pink bx-buy" data-bx="open" ${bl < b.price ? 'disabled' : ''}>${ST(18)} Abrir por ${b.price}${bl < b.price ? ` · te faltan ${b.price - bl}` : ''}</button>
<p class="faint" style="margin:0;text-align:center">Tienes ${bl} estrellitas. Si te sale ropa o una mascota que ya tienes, te devolvemos ${Math.max(2, Math.round(b.price * .4))}.</p></div>`; };
  openSheet(b.name, paint(), sh => {
    sh.addEventListener('click', e => {
      const btn = e.target.closest('[data-bx]'); if (!btn) return;
      if (btn.dataset.bx === 'again') { $('.sheet-b', sh).innerHTML = paint(); return; }
      if (btn.dataset.bx !== 'open' || btn.disabled) return;
      if (!A.spendStars(b.price)) return toast('Te faltan estrellitas');
      const it = pickPrize(b.items); const res = give(it, b.price);
      const log = S.settings.boxLog = (S.settings.boxLog || []); log.unshift({ b: b.id, t: it.t, k: it.k, d: A.today() }); S.settings.boxLog = log.slice(0, 40);
      A.saveSettings();
      btn.disabled = true; const big = $('.bx-big', sh); big.classList.remove('wiggle'); big.classList.add('shake'); sfx('tick');
      setTimeout(() => { big.classList.add('pop'); sfx(it.r === 3 ? 'record' : 'coin'); }, 900);
      setTimeout(() => {
        const rr = RARE[it.r || 1];
        $('.sheet-b', sh).innerHTML = `<div class="bx-view"><div class="bx-stage open r${it.r || 1}"><span class="bx-glow"></span><span class="bx-burst"></span>${Array.from({ length: 14 }, (_, i) => `<i class="bx-conf" style="--a:${i * 26}deg;--d:${(i % 4) * .05}s;--c:${['#f27ea1', '#ffd166', '#9fd6f2', '#b59ae6', '#8fd16a'][i % 5]}"></i>`).join('')}<img class="pixel bx-prize" alt="" src="${srcOf(it, it.t === 'furn' ? 4 : 7)}"></div>
<div class="bx-rare" style="--rc:${rr[2]}">${rr[0]}${it.r === 3 ? ' ✦' : ''}</div><div class="bx-won">${esc(nameOf(it))}</div>
<div class="faint" style="text-align:center">${res.dup ? `Ya lo tenías: te devolvimos ${res.back} estrellitas.` : it.t === 'acc' ? 'Ya está en tu Tiendita, en el Probador.' : it.t === 'furn' ? 'Ya está en tu cuarto, en Muebles.' : it.t === 'pet' ? '¡Una mascota nueva! Búscala en Colección.' : it.t === 'food' ? 'Se guardó en la despensa.' : 'Se sumaron a tus estrellitas.'}</div>
<div class="row" style="gap:8px"><button class="btn" data-x style="flex:1;justify-content:center">Listo</button><button class="btn pink" data-bx="again" style="flex:1;justify-content:center">Abrir otra</button></div></div>`;
        if (navigator.vibrate) navigator.vibrate(it.r === 3 ? [60, 40, 120] : 40);
      }, 1500);
    });
  }, { onClose: () => A.render() });
};
})();
