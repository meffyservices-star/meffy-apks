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

// ---------------- Dibujos listos para la cajita (la admin puede cambiarlos o subir el suyo) ----------------
// paleta: 0 contorno, 1 caja, 2 sombra, 3 tapa, 4 cinta, 5 cinta oscura, 6 blanco, 7 signo
const PRESETS = [
  ['Ropa', ['#7a4a5a', '#ffc4d6', '#f29bb8', '#ffe3ec', '#b59ae6', '#8d6cc9', '#ffffff', '#ffffff']],
  ['Personajes', ['#4f6b5a', '#bfe6c9', '#8fc9a0', '#e3f6e8', '#f27ea1', '#c44a72', '#ffffff', '#ffffff']],
  ['Muebles y juguetes', ['#7a4a3a', '#f6c79a', '#e0a46e', '#fde2c4', '#8fd16a', '#5f9e6a', '#ffffff', '#fff6e8']],
  ['Cuadros', ['#4a5a7a', '#bfe0f6', '#8fbfe0', '#e1f1fc', '#ffd166', '#e6a23c', '#ffffff', '#ffffff']],
  ['Misterio', ['#4a3a6b', '#cbb8f2', '#a48ad8', '#ece4ff', '#ffd166', '#e6a23c', '#ffffff', '#fff3b0']]
];
function boxMap() {
  const W = 20, H = 20, g = Array.from({ length: H }, () => Array(W).fill('.'));
  const r = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j] && i >= 0 && i < W) g[j][i] = c; };
  r(2, 9, 16, 10, '1'); r(15, 9, 3, 10, '2'); r(2, 17, 16, 2, '2');           // caja
  r(1, 5, 18, 4, '3'); r(1, 8, 18, 1, '2');                                    // tapa
  r(9, 5, 2, 14, '4'); r(10, 5, 1, 14, '5');                                   // cinta
  r(6, 2, 3, 3, '4'); r(11, 2, 3, 3, '4'); r(9, 3, 2, 2, '5'); r(7, 3, 1, 1, '6'); r(12, 3, 1, 1, '6'); // moño
  [[4, 11], [5, 11], [6, 11], [6, 12], [5, 13], [5, 15]].forEach(([x, y]) => r(x, y, 1, 1, '7')); // signo ?
  r(3, 6, 2, 1, '6');                                                           // brillo
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === '.' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => g[y + b] && g[y + b][x + a] && !['.', '0'].includes(g[y + b][x + a]))) g[y][x] = 'o';
  return g.map(row => row.join('').replace(/o/g, '0'));
}
A.boxPreset = (ed, i) => { const [n, pal] = PRESETS[i] || PRESETS[0]; ed.w = 20; ed.h = 20; ed.map = boxMap(); ed.pal = pal.slice(); ed.preset = i; if (!ed.name) ed.name = 'Cajita de ' + n.toLowerCase(); };
PRESETS.forEach(([, pal], i) => Pix.define('bx_pre_' + i, { raw: boxMap(), pal: pal.join(',') }));

// ---------------- Panel: armar la cajita ----------------
A.boxFormHTML = ed => {
  ed.items = ed.items || []; const pc = odds(ed.items);
  return `<div class="bx-form">
<div class="f">Dibujo listo (o dibuja o sube el tuyo arriba)<div class="bx-presets">${PRESETS.map(([n], i) => `<button type="button" data-act="bxPreset" data-i="${i}" aria-pressed="${ed.preset === i}"><img class="pixel" alt="" src="${spr('bx_pre_' + i, 3)}"><span>${n}</span></button>`).join('')}</div></div>
<div class="formgrid"><label class="f">Precio en estrellitas<input class="in" data-ed="price" type="number" min="1" value="${+ed.price || 30}"></label></div>
<div class="f">Sorpresitas adentro (${ed.items.length})<div class="bx-items">${ed.items.map((it, i) => exists(it) ? `<div class="bx-it" style="--rc:${RARE[it.r || 1][2]}"><img class="pixel" alt="" src="${srcOf(it, 3)}"><span class="bx-it-tx"><b>${esc(nameOf(it))}</b><span>${KIND_N[it.t]} · ${pc(it)}%</span></span><select class="in" data-bxr="${i}" aria-label="Qué tan difícil">${[1, 2, 3].map(v => `<option value="${v}" ${(it.r || 1) === v ? 'selected' : ''}>${RARE[v][0]}</option>`).join('')}</select><button type="button" class="iconbtn sm" data-act="bxDel" data-i="${i}" aria-label="Quitar">×</button></div>` : '').join('') || '<div class="faint">Todavía no hay sorpresitas. Agrega ropa, muebles (juguetes, cuadros…), mascotas, comida o estrellitas.</div>'}</div>
<button type="button" class="btn pink sm" data-act="bxAdd" style="align-self:flex-start;margin-top:6px">+ Agregar sorpresitas</button></div>
<p class="faint" style="margin:0">Común sale seguido, Raro a veces y Súper raro muy poquito. Si a alguien le sale ropa o una mascota que ya tiene, le devolvemos parte de las estrellitas. Para cosas que solo salgan en cajitas, créalas con "¿Cómo se consigue?" en Raro.</p></div>`;
};
ACT.bxPreset = a => { const ed = A.catEd && A.catEd(); if (!ed) return; const keep = ed.name; const auto = !keep || PRESETS.some(([n]) => keep === 'Cajita de ' + n.toLowerCase()); if (auto) ed.name = ''; A.boxPreset(ed, +a.dataset.i); if (!auto) ed.name = keep; A.render(); };
ACT.bxDel = a => { const ed = A.catEd(); ed.items.splice(+a.dataset.i, 1); A.render(); };
document.addEventListener('change', e => { const s = e.target.closest && e.target.closest('[data-bxr]'); if (!s) return; const ed = A.catEd && A.catEd(); if (!ed || !ed.items) return; ed.items[+s.dataset.bxr].r = +s.value; A.render(); });
A.boxSaveItem = (ed, item) => {
  const items = (ed.items || []).filter(exists); if (!items.length) return 'Agrega al menos una sorpresita';
  item.how = 'stars'; item.price = Math.max(1, Math.round(+ed.price || 30)); item.items = items.map(x => ({ t: x.t, k: x.k, r: x.r || 1 })); if (ed.preset != null) item.preset = ed.preset;
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
  if (!L.length) return Store.isOwner ? `<button class="card bx-empty" data-go="admincat" data-kind="boxes">${spr ? `<img class="pixel" alt="" src="${spr('bx_pre_4', 4)}" style="width:56px">` : ''}<span><b>Cajitas sorpresa</b><br><span class="faint">Solo tú ves esto: crea la primera en Panel → Agregar cosas nuevas → Cajita sorpresa.</span></span></button>` : '';
  return `<div class="bx-shop"><div class="bx-shop-h"><b>Cajitas sorpresa</b><span>¿Qué te saldrá?</span></div>
<div class="bx-grid">${L.map(b => `<button class="bx-card" data-act="bxView" data-id="${esc(b.id)}"><span class="bx-card-art"><img class="pixel" alt="" src="${spr('cbx_' + b.id, 4)}"></span><b>${esc(b.name)}</b><span class="bx-card-n">${b.items.length} sorpresitas</span><span class="se-price">${ST(12)} ${b.price}</span></button>`).join('')}</div></div>`;
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
  const paint = () => { const bl = bal(); return `<div class="bx-view"><div class="bx-stage" id="bxStage"><span class="bx-glow"></span><img class="pixel bx-big wiggle" alt="" src="${spr('cbx_' + b.id, 8)}"></div>
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
