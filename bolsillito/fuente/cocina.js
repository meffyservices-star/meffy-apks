// ===== Bolsillito · Cocinita: juego de cocinar paso a paso =====
(function () {
const A = App, S = A.S, { $, $$, esc, toast, openSheet, closeSheet, uid, today } = A;
const ACT = A.ACTIONS;
const spr = (n, sc) => Pix.sprite(n, sc || 4);
const img = (n, size, sc, extra) => `<img class="pixel" alt="" src="${spr(n, sc || 3)}" style="width:${size}px;height:auto;${extra || ''}" draggable="false">`;
const ST = n => `<img class="pixel ico" alt="estrellitas" src="${Pix.sprite('estrellita', 3)}" style="width:${n || 16}px;height:${n || 16}px;vertical-align:-3px">`;
const wait = ms => new Promise(r => setTimeout(r, ms));

// ---------- dibujitos de ingredientes y utensilios ----------
const D = (n, fn, w, h) => Pix.define(n, { w: w || 16, h: h || 16, fn });
D('i_harina', p => { p.r(3, 5, 10, 10, 'c'); p.r(4, 4, 8, 1, 'c'); p.r(5, 2, 6, 2, 'C'); p.r(7, 1, 2, 1, 'n'); p.r(5, 8, 6, 4, 'B'); p.r(6, 9, 4, 2, 'w'); p.px(4, 6, 'w'); });
D('i_huevo', p => { p.e(8, 9, 4.6, 5.6, 'c'); p.e(7, 7, 1.4, 2, 'w'); p.e(8, 13.5, 3.6, 1.2, 'C'); });
D('i_azucar', p => { p.r(4, 5, 8, 10, 'l'); p.r(3, 3, 10, 2, 'P'); p.r(5, 9, 2, 2, 'w'); p.r(8, 10, 2, 2, 'w'); p.r(6, 12, 2, 2, 'w'); p.r(9, 7, 2, 2, 'w'); p.px(5, 6, 'w'); });
D('i_mantequilla', p => { p.r(1, 11, 14, 3, 'w'); p.r(2, 13, 12, 1, 'C'); p.r(4, 6, 8, 5, 'y'); p.r(4, 6, 8, 1, 'w'); p.r(11, 7, 1, 4, 'Y'); });
D('i_chocolate', p => { p.r(3, 3, 10, 11, 'N'); for (let x = 3; x < 13; x += 3) p.r(x, 3, 1, 11, 'n'); for (let y = 6; y < 14; y += 3) p.r(3, y, 10, 1, 'n'); p.r(3, 10, 10, 4, 'R'); p.r(3, 10, 10, 1, 'P'); });
D('i_crema', p => { p.e(8, 11, 6.5, 3.6, 'B'); p.r(2, 9, 13, 2, 'l'); p.e(8, 8, 5, 3, 'w'); p.e(8, 5.5, 3, 2.2, 'w'); p.px(9, 3, 'w'); p.px(6, 7, 'c'); });
D('i_miel', p => { p.r(4, 5, 8, 10, 'Y'); p.r(4, 5, 8, 2, 'a'); p.r(3, 3, 10, 2, 'n'); p.r(6, 9, 4, 3, 'y'); p.px(5, 8, 'y'); });
D('i_fideos', p => { for (let y = 4; y < 13; y += 2) for (let x = 2; x < 14; x++) p.px(x, y + (x % 4 < 2 ? 0 : 1), 'y'); p.r(6, 3, 4, 11, 'Y'); p.r(6, 7, 4, 2, 'R'); });
D('i_cebollita', p => { p.r(5, 2, 2, 8, 'G'); p.r(8, 1, 2, 9, 'g'); p.r(11, 3, 2, 7, 'G'); p.r(5, 10, 8, 4, 'w'); p.r(5, 10, 8, 1, 'm'); p.px(6, 14, 'C'); p.px(10, 14, 'C'); });
D('i_nori', p => { p.r(3, 3, 10, 10, 'D'); p.r(3, 3, 10, 1, 'G'); p.px(5, 6, 'G'); p.px(9, 8, 'G'); p.px(7, 11, 'G'); });
D('i_salsa', p => { p.e(8, 10, 6.5, 4, 'w'); p.e(8, 9.4, 5.4, 2.6, 'R'); p.px(6, 9, 'P'); p.px(10, 10, 'P'); p.r(9, 2, 1, 5, 'G'); });
D('i_queso', p => { p.map(2, 4, ['......yy....', '....yyyyyy..', '..yyyyyyyyyy', 'yyyyyyyyyyyy', 'yYyyyyYyyyyy', 'yyyyyyyyyYyy', 'yyyYyyyyyyyy', 'YYYYYYYYYYYY']); });
D('i_masa', p => { p.e(8, 9, 6.5, 5, 'c'); p.e(8, 8, 5.5, 3.6, 'w'); p.px(5, 8, 'C'); p.px(10, 10, 'C'); p.px(8, 7, 'C'); });
D('i_salchicha', p => { p.e(8, 8, 6, 2.6, 'R'); p.e(8, 7.4, 5, 1.4, 'P'); p.px(3, 8, 'n'); p.px(13, 8, 'n'); });
D('i_arroz', p => { p.e(8, 10, 6.5, 4, 'B'); p.e(8, 8, 5.5, 3, 'w'); p.px(6, 7, 'c'); p.px(9, 7, 'c'); p.px(7, 9, 'c'); p.px(10, 8, 'c'); });
D('i_matcha', p => { p.e(8, 10, 6, 4, 'C'); p.e(8, 9, 5, 2.6, 'G'); p.px(6, 8, 'g'); p.r(11, 2, 1, 6, 'n'); p.e(11.5, 2, 1.6, 1.2, 'C'); });
D('tanghulu', p => { p.r(7, 2, 2, 22, 'n'); p.r(7, 2, 1, 22, 'C'); [4, 10.5, 17].forEach(y => { p.e(8, y, 4.6, 3.4, 'R'); p.e(7.6, y - .6, 3.8, 2.4, 'P'); p.px(5, Math.round(y) - 2, 'w'); p.px(6, Math.round(y) - 2, 'w'); p.px(5, Math.round(y) - 1, 'w'); p.px(10, Math.round(y) + 1, 'y'); p.px(7, Math.round(y), 'y'); }); p.px(8, 0, 'G'); p.px(7, 1, 'G'); p.px(9, 1, 'G'); }, 16, 24);
D('panqueque', p => { [12, 9, 6].forEach(y => { p.e(8, y, 6.5, 2, 'A'); p.e(8, y - .5, 6, 1.4, 'a'); }); p.r(6, 3, 4, 2, 'y'); p.r(6, 3, 4, 1, 'w'); p.r(4, 6, 1, 3, 'A'); p.r(11, 7, 1, 4, 'A'); });
D('onigiri', p => { p.map(2, 2, ['.....ww.....', '....wwww....', '...wwwwww...', '..wwwwwwww..', '.wwwwwwwwww.', 'wwwwwwwwwwww', 'wwwwwwwwwwww', 'wwwDDDDDDwww', 'wwwDDDDDDwww', '.wwDDDDDDww.']); p.px(5, 7, 'k'); p.px(10, 7, 'k'); p.px(4, 8, 'P'); p.px(11, 8, 'P'); });
D('k_tazon', p => { p.r(1, 2, 26, 2, 'w'); p.e(14, 4, 13, 10, 'L', (i, j) => j >= 4); p.e(14, 4, 11, 8, 'l', (i, j) => j >= 5); p.r(2, 4, 24, 1, 'B'); }, 28, 16);
D('k_molde', p => { p.r(1, 3, 26, 9, 'C'); p.r(2, 4, 24, 7, 'c'); p.r(1, 3, 26, 1, 'w'); for (let x = 3; x < 26; x += 3) p.px(x, 11, 'n'); }, 28, 13);
D('k_olla', p => { p.r(3, 5, 22, 13, 'V'); p.r(3, 5, 22, 2, 'L'); p.r(0, 7, 3, 3, 'N'); p.r(25, 7, 3, 3, 'N'); p.r(4, 8, 20, 1, 'B'); p.px(6, 11, 'l'); }, 28, 19);
D('k_sarten', p => { p.e(11, 7, 10, 5, 'N'); p.e(11, 6.4, 8.6, 3.6, 'n'); p.r(20, 6, 8, 2, 'N'); }, 28, 13);
D('k_horno', p => { p.r(1, 1, 30, 28, 'C'); p.r(1, 1, 30, 6, 'c'); [5, 11, 17, 23].forEach(x => p.e(x, 4, 1.6, 1.6, 'N')); p.r(4, 9, 24, 16, 'N'); p.r(6, 11, 20, 12, 'a'); p.r(6, 11, 20, 3, 'y'); p.r(10, 8, 12, 1, 'n'); }, 32, 30);
D('k_copa', p => { p.e(8, 5, 6.5, 4, 'l', (i, j) => j >= 4); p.r(1, 2, 14, 3, 'l'); p.r(1, 2, 14, 1, 'w'); p.r(7, 9, 2, 5, 'l'); p.r(4, 14, 8, 2, 'l'); }, 16, 16);
D('k_palito', p => { p.r(7, 0, 2, 24, 'n'); p.r(7, 0, 1, 24, 'C'); }, 16, 24);
D('k_cuchillo', p => { p.r(2, 5, 14, 5, 'w'); p.r(2, 5, 14, 1, 'l'); p.line(2, 9, 0, 7, 'w'); p.r(16, 6, 8, 3, 'n'); }, 24, 14);
D('k_cortador', p => { p.e(8, 8, 7, 7, 'L'); p.e(8, 8, 5.5, 5.5, null); p.r(6, 0, 4, 2, 'L'); });
D('k_cuchara', p => { p.e(5, 4, 3.6, 3.4, 'C'); p.e(5, 4, 2.6, 2.4, 'c'); p.line(7, 7, 14, 15, 'n'); p.line(8, 7, 15, 14, 'n'); });

// comidas que salen de la cocina
Object.assign(A.FOODS, {
  tanghulu: { name: 'Tanghulu', art: 'un tanghulu', gain: 30, price: 5 },
  panqueque: { name: 'Panqueques', art: 'panqueques', gain: 35, price: 5 },
  ramen: { name: 'Ramen', art: 'ramen', gain: 45, price: 6 },
  onigiri: { name: 'Onigiri', art: 'un onigiri', gain: 30, price: 4 }
});
const ING = {
  harina: 'Harina', huevo: 'Huevo', azucar: 'Azúcar', leche: 'Leche', mantequilla: 'Mantequilla', chocolate: 'Chocolate', crema: 'Crema', miel: 'Miel',
  fresa: 'Fresas', manzanita: 'Manzana', fideos: 'Fideos', cebollita: 'Cebollita', nori: 'Alga nori', salsa: 'Salsa de tomate', queso: 'Queso', masa: 'Masa',
  salchicha: 'Salchicha', arroz: 'Arroz', matcha: 'Matcha'
};
const ingSpr = k => (['leche', 'fresa', 'manzanita'].includes(k) ? k : 'i_' + k);
const BASES = {
  pastel: { fill: '#ffe3eb', ring: '#ffc4d4', crust: '#e8b07a' }, pizza: { fill: '#e85a4a', ring: '#f2a65a', crust: '#e8b07a', dots: '#f7d26a' },
  ramen: { fill: '#f6d9a8', ring: '#ffffff', crust: '#e0577f' }, cupcake: { fill: '#ffd1e3', ring: '#fff6e8', crust: '#9fd6f2' },
  panqueque: { fill: '#e8a04a', ring: '#f2c06a', crust: '#c27a2e' }, helado: { fill: '#ffc4d6', ring: '#fff6e8', crust: '#cdeefc' }, onigiri: { fill: '#ffffff', ring: '#f6efe6', crust: '#5f8f33' }
};
// ---------- recetas ----------
const RECIPES = {
  pastel: { name: 'Pastel de fresa', out: 'pastel', price: 0, hint: 'Un clásico. Perfecto para aprender.', steps: [
    { t: 'pick', items: ['harina', 'huevo', 'azucar', 'leche'], say: 'Pon en el tazón harina, huevo, azúcar y leche.' },
    { t: 'mix', color: '#ffe6b8', say: 'Mezcla dando vueltitas con el dedo dentro del tazón.' },
    { t: 'pour', into: 'k_molde', color: '#ffe0a8', say: 'Mantén apretado para llenar el molde hasta la línea.' },
    { t: 'heat', tool: 'k_horno', say: 'Saca el pastel cuando la flecha esté en lo dorado.' },
    { t: 'decorate', base: 'pastel', tops: ['fresa', 'i_crema'], n: 6, say: 'Decora tocando el pastel. Pon 6 cositas.' }] },
  tanghulu: { name: 'Tanghulu de fresa', out: 'tanghulu', price: 0, hint: 'Fruta con caramelo crujiente.', steps: [
    { t: 'skewer', fruit: 'fresa', n: 4, say: 'Toca para soltar cada fresa justo encima del palito.' },
    { t: 'heat', tool: 'k_olla', syrup: true, say: 'Calienta el almíbar. Para cuando esté dorado, no café.' },
    { t: 'dip', say: 'Mantén apretado para bañar las fresas. Suelta cuando brillen.' },
    { t: 'tap', n: 5, say: '¡Escucha el crack! Toca 5 veces para romper la capa de caramelo.' }] },
  galletas: { name: 'Galletas de chocolate', out: 'galleta', price: 0, hint: 'Corta muchas sin encimarlas.', steps: [
    { t: 'pick', items: ['harina', 'mantequilla', 'azucar', 'chocolate'], say: 'Pon harina, mantequilla, azúcar y chocolate.' },
    { t: 'mix', color: '#e8c48a', say: 'Mezcla la masa dando vueltas.' },
    { t: 'cut', n: 5, say: 'Toca para cortar 5 galletas. ¡Que no se encimen!' },
    { t: 'heat', tool: 'k_horno', say: 'Hornea hasta que estén doradas.' }] },
  panqueques: { name: 'Panqueques con miel', out: 'panqueque', price: 20, hint: 'Ojo con la sartén.', steps: [
    { t: 'pick', items: ['harina', 'huevo', 'leche', 'azucar'], say: 'Pon harina, huevo, leche y azúcar.' },
    { t: 'mix', color: '#fbe3b0', say: 'Mezcla bien la masa.' },
    { t: 'pour', into: 'k_sarten', color: '#fbe3b0', say: 'Sirve la masa en la sartén hasta la línea.' },
    { t: 'heat', tool: 'k_sarten', say: 'Voltea cuando esté dorado de abajo.' },
    { t: 'decorate', base: 'panqueque', tops: ['i_miel', 'fresa', 'i_mantequilla'], n: 5, say: 'Ponle miel, fresas y mantequilla.' }] },
  cupcakes: { name: 'Cupcakes', out: 'cupcake', price: 20, hint: 'Tres capacillos, tres veces atinarle.', steps: [
    { t: 'pick', items: ['harina', 'huevo', 'azucar', 'mantequilla'], say: 'Pon harina, huevo, azúcar y mantequilla.' },
    { t: 'mix', color: '#ffe6b8', say: 'Mezcla con vueltitas.' },
    { t: 'pour', into: 'k_copa', color: '#ffe0a8', cups: 3, say: 'Llena cada capacillo hasta la línea.' },
    { t: 'heat', tool: 'k_horno', say: 'Hornea hasta que estén doraditos.' },
    { t: 'decorate', base: 'cupcake', tops: ['i_crema', 'fresa', 'star'], n: 5, say: 'Decora con crema y fresas.' }] },
  pizza: { name: 'Pizza', out: 'pizza', price: 30, hint: 'Estira, salsa, queso y al horno.', steps: [
    { t: 'pick', items: ['masa', 'salsa', 'queso', 'salchicha'], say: 'Pon masa, salsa, queso y salchicha.' },
    { t: 'mix', color: '#f6e2c4', say: 'Amasa dando vueltas para estirar la masa.' },
    { t: 'decorate', base: 'pizza', tops: ['i_queso', 'i_salchicha'], n: 7, say: 'Pon el queso y la salchicha sobre la pizza.' },
    { t: 'heat', tool: 'k_horno', say: 'Saca la pizza cuando el queso esté dorado.' }] },
  ramen: { name: 'Ramen', out: 'ramen', price: 30, hint: 'Hierve, corta y arma tu tazón.', steps: [
    { t: 'heat', tool: 'k_olla', say: 'Espera a que el agua hierva y para en lo dorado.' },
    { t: 'pick', items: ['fideos', 'huevo', 'cebollita', 'nori'], say: 'Pon fideos, huevo, cebollita y alga.' },
    { t: 'cut', n: 3, slice: true, say: 'Corta el huevo tocando cuando el cuchillo esté en la línea.' },
    { t: 'decorate', base: 'ramen', tops: ['i_huevo', 'i_cebollita', 'i_nori'], n: 6, say: 'Arma tu tazón con los toppings.' }] },
  helado: { name: 'Helado de fresa', out: 'helado', price: 25, hint: 'Frío, frío… pero no tanto.', steps: [
    { t: 'pick', items: ['leche', 'azucar', 'fresa', 'crema'], say: 'Pon leche, azúcar, fresas y crema.' },
    { t: 'mix', color: '#ffc4d6', say: 'Bate dando vueltas.' },
    { t: 'pour', into: 'k_copa', color: '#ffc4d6', say: 'Sirve en la copa hasta la línea.' },
    { t: 'heat', tool: 'k_copa', cold: true, say: 'Congela y para cuando esté cremoso (en lo celeste).' }] },
  onigiri: { name: 'Onigiri', out: 'onigiri', price: 25, hint: 'Bolitas de arroz con carita.', steps: [
    { t: 'pick', items: ['arroz', 'nori'], say: 'Pon arroz y alga nori.' },
    { t: 'mix', color: '#ffffff', say: 'Dale forma dando vueltas.' },
    { t: 'decorate', base: 'onigiri', tops: ['i_nori', 'heartS'], n: 3, say: 'Ponle alga y una carita.' }] }
};
A.RECIPES = RECIPES;
const allRecipes = () => { const out = Object.assign({}, RECIPES); ((A.CFG && A.CFG.catalog && A.CFG.catalog.recipes) || []).forEach(r => { if (!r.off) out['cr_' + r.id] = r; }); return out; };
const CK = () => { const c = S.settings.cook = S.settings.cook || {}; c.owned = c.owned || []; c.best = c.best || {}; return c; };
const owns = (k, r) => !r.price || CK().owned.includes(k);

// ---------- pantalla de recetas ----------
A.PAGES.cocina = 'Cocinita';
A.screens.cocina = () => {
  const R = allRecipes(); const bal = A.rinconBalance ? A.rinconBalance() : 0; const c = CK();
  return `${A.subHeader('cocina', 'rincon', `<span class="pill sm" style="background:#fff09a;color:#6b4d12">${ST(18)} ${bal}</span>`)}
<div class="ck-hero"><img class="pixel" alt="" src="${spr((A.petInfo && A.petActive && A.petActive()) ? A.petInfo(A.petActive()).sprite : 'pudin', 4)}" style="width:64px"><div><b>Elige qué cocinar</b><div class="faint">Cada receta tiene sus pasos. Mientras mejor te salga, más comida va a tu despensa.</div></div><button class="btn sm" data-act="ckHow">Cómo se juega</button></div>
<div class="ck-grid">${Object.entries(R).map(([k, r]) => { const own = owns(k, r); const best = c.best[k] || 0; return `<button class="ck-card ${own ? '' : 'locked'}" data-act="ckPick" data-k="${k}"><img class="pixel" alt="" src="${spr(A.FOODS[r.out] ? (A.FOODS[r.out].sprite || r.out) : r.out, 4)}"><b>${esc(r.name)}</b><span class="faint">${r.steps.length} pasos${r.hint ? ' · ' + esc(r.hint) : ''}</span>${own ? `<span class="ck-best">${[1, 2, 3].map(i => img('estrellita', 14, 3, i <= best ? '' : 'filter:grayscale(1) opacity(.3)')).join('')}</span>` : `<span class="tag gold">${ST(12)} ${r.price}</span>`}</button>`; }).join('')}</div>`;
};
ACT.ckHow = () => howTo();
function howTo(after) {
  const cards = [
    ['i_harina', '1. Elige una receta', 'Cada comida tiene sus propios pasos: poner ingredientes, mezclar, servir, hornear y decorar.'],
    ['k_cuchara', '2. Sigue cada paso', 'Arriba te digo qué hacer. A veces tocas, a veces mantienes apretado, a veces das vueltas con el dedo o esperas el momento justo.'],
    ['estrellita', '3. Mientras mejor, más rico', 'Cada paso te da hasta 3 estrellitas. Con 3 estrellitas sale perfecto: más comida para la despensa y más estrellitas para ti.']];
  let i = 0;
  const draw = () => openSheet('Cómo se juega', `<div class="ck-how"><img class="pixel" alt="" src="${spr(cards[i][0], 6)}"><b>${cards[i][1]}</b><p>${cards[i][2]}</p><div class="ck-dots">${cards.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div><button class="btn pink" id="ckNext" style="justify-content:center;width:100%">${i < cards.length - 1 ? 'Siguiente' : '¡A cocinar!'}</button></div>`, sh => { $('#ckNext', sh).onclick = () => { if (i < cards.length - 1) { i++; draw(); } else { closeSheet(); CK().tut = true; A.saveSettings(); if (after) after(); } }; });
  draw();
}
ACT.ckPick = a => {
  const k = a.dataset.k, r = allRecipes()[k]; if (!r) return;
  if (!owns(k, r)) {
    if (!a.dataset.sure) { a.dataset.sure = 1; const t = a.querySelector('.tag'); if (t) t.textContent = '¿Desbloquear?'; return; }
    if (!A.spendStars(r.price)) return; CK().owned.push(k); A.saveSettings(); toast(`¡Desbloqueaste ${r.name}!`); A.render(); return;
  }
  if (!CK().tut) return howTo(() => cook(k, r));
  cook(k, r);
};

// ---------- el juego ----------
async function cook(key, r) {
  const ov = document.createElement('div'); ov.className = 'ck'; document.body.appendChild(ov); document.body.classList.add('gaming');
  const pet = (A.petActive && A.petActive()) ? A.petInfo(A.petActive()).sprite : 'pudin';
  let closed = false; const close = () => { closed = true; ov.remove(); document.body.classList.remove('gaming'); if (S.route === 'cocina' || S.route === 'rincon') A.render(); };
  ov.innerHTML = `<div class="ck-top"><button class="ck-x" aria-label="Salir">×</button><b>${esc(r.name)}</b><span class="ck-steps">${r.steps.map(() => '<i></i>').join('')}</span></div>
<div class="ck-chef"><img class="pixel" alt="" src="${spr(pet, 4)}"><div class="ck-say" id="ckSay"></div></div>
<div class="ck-stage" id="ckStage"></div><div class="ck-ctl" id="ckCtl"></div>`;
  $('.ck-x', ov).onclick = close;
  const ctx = { ov, stage: $('#ckStage', ov), ctl: $('#ckCtl', ov), say: t => { $('#ckSay', ov).textContent = t; }, recipe: r, alive: () => !closed };
  const scores = [];
  for (let i = 0; i < r.steps.length; i++) {
    if (closed) return;
    $$('.ck-steps i', ov).forEach((d, j) => d.className = j < i ? 'ok' : j === i ? 'now' : '');
    const st = r.steps[i]; ctx.say(st.say || ''); ctx.stage.innerHTML = ''; ctx.ctl.innerHTML = '';
    const sc = await (STEPS[st.t] || STEPS.tap)(st, ctx);
    if (closed) return;
    scores.push(sc); await flash(ctx, sc);
  }
  if (closed) return;
  const avg = scores.reduce((s, x) => s + x, 0) / scores.length; const stars = avg >= 2.6 ? 3 : avg >= 1.9 ? 2 : 1;
  const pst = A.petState(); const out = r.out; pst.pantry[out] = (pst.pantry[out] || 0) + stars;
  const earned = A.payGame ? A.payGame(stars * 2) : 0; A.petAddXp && A.petAddXp(10, 'game');
  const c = CK(); c.best[key] = Math.max(c.best[key] || 0, stars); c.made = (c.made || 0) + 1; A.saveSettings();
  $$('.ck-steps i', ov).forEach(d => d.className = 'ok');
  ctx.say(stars === 3 ? '¡Perfecto! Te quedó delicioso.' : stars === 2 ? '¡Muy bien! Quedó muy rico.' : '¡Te salió rico! La próxima sale perfecto.');
  ctx.stage.innerHTML = `<div class="ck-done"><div class="rg-burst" style="top:40%"></div><img class="pixel rg-rays" alt="" src="${spr('destello', 8)}" style="top:40%"><img class="pixel ck-dish" alt="" src="${spr(A.FOODS[out] ? (A.FOODS[out].sprite || out) : out, 8)}"><div class="ck-stars">${[1, 2, 3].map(i => img('estrellita', 40, 3, i <= stars ? `animation-delay:${i * .2}s` : 'filter:grayscale(1) opacity(.3)')).join('')}</div></div>`;
  ctx.ctl.innerHTML = `<div class="ck-res"><span>${img(A.FOODS[out] ? (A.FOODS[out].sprite || out) : out, 22)} +${stars} a la despensa</span><span>${ST(18)} +${earned}</span></div><div class="row" style="gap:8px"><button class="btn" id="ckOut" style="flex:1;justify-content:center">Salir</button><button class="btn pink" id="ckAgain" style="flex:1;justify-content:center">Otra vez</button></div>`;
  $('#ckOut', ov).onclick = close; $('#ckAgain', ov).onclick = () => { close(); cook(key, r); };
}
async function flash(ctx, sc) {
  const f = document.createElement('div'); f.className = 'ck-flash'; f.innerHTML = `<b>${['', '¡Bien!', '¡Muy bien!', '¡Perfecto!'][sc]}</b><span>${[1, 2, 3].map(i => img('estrellita', 26, 3, i <= sc ? '' : 'filter:grayscale(1) opacity(.3)')).join('')}</span>`;
  ctx.stage.appendChild(f); await wait(950); f.remove();
}
const hand = (cls) => `<span class="ck-hand ${cls || ''}">${img('paw', 30)}</span>`;
const STEPS = {
  // tocar los ingredientes correctos
  pick(st, ctx) {
    return new Promise(res => {
      const decoys = Object.keys(ING).filter(k => !st.items.includes(k)).sort(() => Math.random() - .5).slice(0, Math.max(2, 8 - st.items.length));
      const all = st.items.concat(decoys).sort(() => Math.random() - .5); let got = 0, bad = 0;
      ctx.stage.innerHTML = `<div class="ck-shelf">${all.map(k => `<button class="ck-ing" data-k="${k}">${img(ingSpr(k), 44)}<span>${esc(ING[k])}</span></button>`).join('')}</div><div class="ck-bowl" id="ckBowl">${img('k_tazon', 150, 5)}</div>`;
      ctx.ctl.innerHTML = `<div class="ck-need">${st.items.map(k => `<span data-n="${k}">${img(ingSpr(k), 22)}${esc(ING[k])}</span>`).join('')}</div>`;
      ctx.stage.addEventListener('click', e => {
        const b = e.target.closest('.ck-ing'); if (!b || b.disabled) return; const k = b.dataset.k;
        if (!st.items.includes(k)) { bad++; b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); ctx.say('¡Uy! Eso no va en esta receta.'); return; }
        b.disabled = true; const bowl = $('#ckBowl', ctx.stage); const r1 = b.getBoundingClientRect(), r2 = bowl.getBoundingClientRect();
        const fl = b.querySelector('img').cloneNode(); fl.className = 'pixel ck-fly'; fl.style.left = r1.left + 'px'; fl.style.top = r1.top + 'px'; document.body.appendChild(fl);
        requestAnimationFrame(() => { fl.style.transform = `translate(${r2.left + r2.width / 2 - r1.left - 22}px, ${r2.top + 10 - r1.top}px) scale(.6)`; fl.style.opacity = '.2'; });
        setTimeout(() => fl.remove(), 650);
        const n = $(`[data-n="${k}"]`, ctx.ctl); if (n) n.classList.add('ok'); got++;
        if (got === st.items.length) setTimeout(() => res(bad === 0 ? 3 : bad === 1 ? 2 : 1), 700);
      });
    });
  },
  // dar vueltas con el dedo
  mix(st, ctx) {
    return new Promise(res => {
      ctx.stage.innerHTML = `<div class="ck-mix" id="ckMix"><div class="ck-batter" style="background:${st.color || '#ffe6b8'}">${Array.from({ length: 22 }, (_, i) => `<i style="left:${15 + (i * 37) % 70}%;top:${15 + (i * 53) % 70}%;background:${['#fff', '#f5c94c', '#c27a2e', '#ff9fb5'][i % 4]}"></i>`).join('')}</div><div class="ck-ring" id="ckRing"></div><img class="pixel ck-spoon" id="ckSpoon" alt="" src="${spr('k_cuchara', 5)}">${hand('circle')}</div>`;
      ctx.ctl.innerHTML = `<div class="prog" style="height:14px"><i id="ckBar" style="width:0%;background:#a385e0"></i></div>`;
      const box = $('#ckMix', ctx.stage); const NEED = Math.PI * 2 * 3; let acc = 0, last = null, t0 = null, down = false;
      const ang = e => { const r = box.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); };
      const mv = e => {
        if (!down) return; const sp = $('#ckSpoon', box); const r = box.getBoundingClientRect(); sp.style.left = (e.clientX - r.left - 30) + 'px'; sp.style.top = (e.clientY - r.top - 50) + 'px';
        const a = ang(e); if (last != null) { let d = a - last; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; acc += Math.abs(d); } last = a;
        const p = Math.min(1, acc / NEED); $('#ckBar', ctx.ctl).style.width = (p * 100) + '%'; $('#ckRing', box).style.setProperty('--p', p * 360 + 'deg');
        $$('.ck-batter i', box).forEach((d, i) => { d.style.opacity = Math.max(0, 1 - p * 1.3 + (i % 5) * .02); });
        $('.ck-batter', box).style.transform = `rotate(${acc * 20}deg)`;
        if (p >= 1) { down = false; const secs = (Date.now() - t0) / 1000; res(secs < 6 ? 3 : secs < 10 ? 2 : 1); }
      };
      box.addEventListener('pointerdown', e => { down = true; if (!t0) t0 = Date.now(); last = ang(e); try { box.setPointerCapture(e.pointerId); } catch (er) { } const h = $('.ck-hand', box); if (h) h.remove(); e.preventDefault(); });
      box.addEventListener('pointermove', mv); box.addEventListener('pointerup', () => { down = false; last = null; });
    });
  },
  // mantener apretado para servir hasta la línea
  pour(st, ctx) {
    return new Promise(async res => {
      const cups = st.cups || 1; const scores = [];
      for (let c = 0; c < cups; c++) {
        if (!ctx.alive()) return;
        const target = 62 + Math.random() * 18;
        ctx.stage.innerHTML = `<div class="ck-pour"><img class="pixel ck-jar" id="ckJar" alt="" src="${spr('k_tazon', 4)}"><span class="ck-stream" id="ckStream" style="background:${st.color}"></span><div class="ck-cup ${st.into === 'k_sarten' ? 'flat' : ''}"><span class="ck-fill" id="ckFill" style="background:${st.color}"></span><span class="ck-band" style="bottom:${target - 6}%;height:12%"></span></div>${cups > 1 ? `<span class="tag" style="position:absolute;top:8px;left:8px">Capacillo ${c + 1} de ${cups}</span>` : ''}${hand('press')}</div>`;
        ctx.ctl.innerHTML = `<button class="btn pink ck-hold" id="ckHold">Mantén para servir</button>`;
        const sc = await new Promise(r2 => {
          let lvl = 0, holding = false, raf, done = false; const fill = $('#ckFill', ctx.stage), stream = $('#ckStream', ctx.stage), jar = $('#ckJar', ctx.stage); let tLast = 0;
          const tick = t => { const dt = tLast ? (t - tLast) / 1000 : 0; tLast = t; if (holding) { lvl = Math.min(110, lvl + dt * (22 + lvl * .25)); fill.style.height = Math.min(100, lvl) + '%'; } if (!done) raf = requestAnimationFrame(tick); };
          raf = requestAnimationFrame(tick);
          const stop = () => { if (!holding || done) return; holding = false; done = true; cancelAnimationFrame(raf); stream.classList.remove('on'); jar.classList.remove('tilt'); const d = Math.abs(lvl - target); setTimeout(() => r2(lvl > 100 ? 1 : d <= 6 ? 3 : d <= 13 ? 2 : 1), 300); if (lvl > 100) ctx.say('¡Se derramó un poquito!'); };
          const btn = $('#ckHold', ctx.ctl);
          btn.addEventListener('pointerdown', e => { if (done) return; holding = true; stream.classList.add('on'); jar.classList.add('tilt'); const h = $('.ck-hand', ctx.stage); if (h) h.remove(); e.preventDefault(); });
          btn.addEventListener('pointerup', stop); btn.addEventListener('pointerleave', stop); btn.addEventListener('pointercancel', stop);
        });
        scores.push(sc);
      }
      res(Math.round(scores.reduce((s, x) => s + x, 0) / scores.length));
    });
  },
  // parar en el momento justo
  heat(st, ctx) {
    return new Promise(res => {
      const cold = !!st.cold; const zones = cold ? ['#ffffff', '#cdeefc', '#7fb8e8', '#4a6fa8'] : ['#f6e2c4', '#f5c94c', '#e8a04a', '#6b4026'];
      const gStart = 46 + Math.random() * 18, gW = 12;
      ctx.stage.innerHTML = `<div class="ck-heat"><img class="pixel ck-tool" alt="" src="${spr(st.tool || 'k_horno', 6)}"><span class="ck-food" id="ckFood"></span>${!cold ? '<span class="ck-steam"></span><span class="ck-steam b"></span>' : '<span class="ck-snow"></span>'}</div>`;
      ctx.ctl.innerHTML = `<div class="ck-gauge"><span class="g" style="background:linear-gradient(90deg,${zones[0]} 0%,${zones[1]} ${gStart - 10}%,${zones[1]} ${gStart}%,${zones[2]} ${gStart}%,${zones[2]} ${gStart + gW}%,${zones[1]} ${gStart + gW}%,${zones[3]} 100%)"></span><span class="ck-gold" style="left:${gStart}%;width:${gW}%"></span><i id="ckNeedle"></i></div><button class="btn pink ck-hold" id="ckStop">${cold ? '¡Ya está!' : '¡Listo!'}</button>`;
      let x = 0, dir = 1, raf, done = false, tLast = 0; const nd = $('#ckNeedle', ctx.ctl), food = $('#ckFood', ctx.stage);
      const speed = 34 + Math.random() * 10;
      const tick = t => { const dt = tLast ? (t - tLast) / 1000 : 0; tLast = t; x += dir * speed * dt; if (x >= 100) { x = 100; dir = -1; } if (x <= 0) { x = 0; dir = 1; } nd.style.left = x + '%'; const c = x < gStart ? zones[1] : x < gStart + gW ? zones[2] : zones[3]; food.style.background = c; if (!done) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
      $('#ckStop', ctx.ctl).onclick = () => { if (done) return; done = true; cancelAnimationFrame(raf); const inG = x >= gStart && x <= gStart + gW; const near = x >= gStart - 8 && x <= gStart + gW + 8; res(inG ? 3 : near ? 2 : 1); if (!inG) ctx.say(x > gStart + gW ? (cold ? 'Quedó muy duro.' : 'Se tostó de más.') : (cold ? 'Le faltó un poquito de frío.' : 'Le faltó un poquito.')); };
    });
  },
  // tocar el plato para poner toppings
  decorate(st, ctx) {
    return new Promise(res => {
      const b = BASES[st.base] || BASES.pastel; let sel = st.tops[0], n = 0, out = 0; const pts = [];
      ctx.stage.innerHTML = `<div class="ck-deco"><div class="ck-base" id="ckBase" style="--f:${b.fill};--r:${b.ring};--c:${b.crust}">${b.dots ? Array.from({ length: 10 }, (_, i) => `<i style="left:${20 + (i * 41) % 60}%;top:${20 + (i * 29) % 60}%;background:${b.dots}"></i>`).join('') : ''}</div>${hand('tap')}</div>`;
      const ctlDraw = () => { ctx.ctl.innerHTML = `<div class="ck-tops">${st.tops.map(t => `<button class="ck-tp ${t === sel ? 'on' : ''}" data-tp="${t}">${img(t, 36)}</button>`).join('')}<span class="ck-count">${n} de ${st.n}</span></div>${n >= st.n ? '<button class="btn pink ck-hold" id="ckDone">¡Listo!</button>' : ''}`; const d = $('#ckDone', ctx.ctl); if (d) d.onclick = () => { const spread = pts.length > 1 ? Math.sqrt(pts.reduce((s, p) => s + (p[0] - .5) ** 2 + (p[1] - .5) ** 2, 0) / pts.length) : 0; res(out ? (out > 2 ? 1 : 2) : spread > .14 ? 3 : 2); }; };
      ctlDraw();
      ctx.ctl.addEventListener('click', e => { const t = e.target.closest('[data-tp]'); if (t) { sel = t.dataset.tp; ctlDraw(); } });
      const base = $('#ckBase', ctx.stage);
      base.addEventListener('click', e => {
        const r = base.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        const inside = (x - .5) ** 2 + (y - .5) ** 2 <= .2; if (!inside) out++;
        const im = document.createElement('img'); im.className = 'pixel ck-placed'; im.src = spr(sel, 4); im.style.left = (x * 100) + '%'; im.style.top = (y * 100) + '%'; im.style.transform = `translate(-50%,-50%) rotate(${Math.round(Math.random() * 40 - 20)}deg)`; base.appendChild(im);
        const h = $('.ck-hand', ctx.stage); if (h) h.remove(); n++; pts.push([x, y]); ctlDraw();
      });
    });
  },
  // soltar la fruta encima del palito
  skewer(st, ctx) {
    return new Promise(res => {
      ctx.stage.innerHTML = `<div class="ck-skewer" id="ckSk"><img class="pixel ck-stick" alt="" src="${spr('k_palito', 6)}"><img class="pixel ck-swing" id="ckFruit" alt="" src="${spr(st.fruit || 'fresa', 5)}">${hand('tap')}</div>`;
      ctx.ctl.innerHTML = `<button class="btn pink ck-hold" id="ckDrop">¡Soltar!</button><span class="ck-count" id="ckCnt">0 de ${st.n}</span>`;
      const box = $('#ckSk', ctx.stage); const fr = $('#ckFruit', box); let t0 = performance.now(), raf, stack = 0, miss = 0, busy = false, x = 50;
      const tick = t => { const sp = 1.6 + stack * .35; x = 50 + Math.sin((t - t0) / 1000 * sp) * 34; if (!busy) fr.style.left = x + '%'; raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
      const drop = () => {
        if (busy || !ctx.alive()) return; busy = true; const h = $('.ck-hand', box); if (h) h.remove();
        const ok = Math.abs(x - 50) < 7; const yEnd = ok ? 78 - stack * 12 : 120;
        fr.style.transition = 'top .35s ease-in'; fr.style.top = yEnd + '%';
        setTimeout(() => {
          if (ok) { stack++; const st2 = document.createElement('img'); st2.className = 'pixel ck-stacked'; st2.src = fr.src; st2.style.top = yEnd + '%'; box.appendChild(st2); } else { miss++; ctx.say('¡Se cayó! Intenta otra vez.'); }
          $('#ckCnt', ctx.ctl).textContent = stack + ' de ' + st.n;
          fr.style.transition = 'none'; fr.style.top = '6%'; busy = false;
          if (stack >= st.n) { cancelAnimationFrame(raf); fr.remove(); res(miss === 0 ? 3 : miss <= 2 ? 2 : 1); }
        }, 380);
      };
      $('#ckDrop', ctx.ctl).onclick = drop; box.addEventListener('click', drop);
    });
  },
  // bañar en almíbar
  dip(st, ctx) {
    return new Promise(res => {
      ctx.stage.innerHTML = `<div class="ck-dip"><div class="ck-kebab" id="ckKb"><img class="pixel" alt="" src="${spr('k_palito', 6)}"><span class="ck-berries">${[0, 1, 2, 3].map(i => img('fresa', 46, 3)).join('')}</span><span class="ck-glaze" id="ckGl"></span></div><div class="ck-pot">${img('k_olla', 200, 5)}<span class="ck-syrup"></span></div>${hand('press')}</div>`;
      ctx.ctl.innerHTML = `<div class="prog" style="height:14px;position:relative"><i id="ckCoat" style="width:0%;background:#f5c94c"></i><span class="ck-band2" style="left:72%;width:18%"></span></div><button class="btn pink ck-hold" id="ckHold">Mantén para bañar</button>`;
      let coat = 0, holding = false, raf, done = false, tLast = 0; const kb = $('#ckKb', ctx.stage), gl = $('#ckGl', ctx.stage), bar = $('#ckCoat', ctx.ctl);
      const tick = t => { const dt = tLast ? (t - tLast) / 1000 : 0; tLast = t; if (holding) { coat = Math.min(110, coat + dt * 40); bar.style.width = Math.min(100, coat) + '%'; gl.style.opacity = Math.min(1, coat / 90); } if (!done) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
      const stop = () => { if (!holding || done) return; holding = false; done = true; kb.classList.remove('down'); cancelAnimationFrame(raf); setTimeout(() => res(coat >= 72 && coat <= 90 ? 3 : coat >= 60 && coat <= 100 ? 2 : 1), 400); };
      const btn = $('#ckHold', ctx.ctl);
      btn.addEventListener('pointerdown', e => { if (done) return; holding = true; kb.classList.add('down'); const h = $('.ck-hand', ctx.stage); if (h) h.remove(); e.preventDefault(); });
      btn.addEventListener('pointerup', stop); btn.addEventListener('pointerleave', stop); btn.addEventListener('pointercancel', stop);
    });
  },
  // cortar: galletas sin encimar o rodajas en la línea
  cut(st, ctx) {
    return new Promise(res => {
      const slice = !!st.slice;
      ctx.stage.innerHTML = slice ? `<div class="ck-cut slice" id="ckCut">${img('i_huevo', 170, 6)}<span class="ck-line"></span><img class="pixel ck-knife" id="ckKn" alt="" src="${spr('k_cuchillo', 5)}">${hand('tap')}</div>` : `<div class="ck-cut" id="ckCut"><div class="ck-dough"></div><img class="pixel ck-knife" id="ckKn" alt="" src="${spr('k_cortador', 5)}">${hand('tap')}</div>`;
      ctx.ctl.innerHTML = `<button class="btn pink ck-hold" id="ckGo">${slice ? '¡Cortar!' : '¡Cortar galleta!'}</button><span class="ck-count" id="ckCnt">0 de ${st.n}</span>`;
      const box = $('#ckCut', ctx.stage), kn = $('#ckKn', box); let t0 = performance.now(), raf, x = 50, y = 50, n = 0, bad = 0; const cuts = [];
      const tick = t => { const s = (t - t0) / 1000; x = 50 + Math.sin(s * 1.7) * 36; y = slice ? 50 : 50 + Math.sin(s * 1.1 + 1) * 28; kn.style.left = x + '%'; kn.style.top = y + '%'; raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
      const go = () => {
        if (!ctx.alive()) return; const h = $('.ck-hand', box); if (h) h.remove();
        if (slice) { const ok = Math.abs(x - 50) < 6; if (!ok) bad++; const l = document.createElement('span'); l.className = 'ck-slice'; l.style.left = x + '%'; box.appendChild(l); if (!ok) ctx.say('Un poquito chueco. ¡Otra vez!'); }
        else { const over = cuts.some(([a, b]) => Math.hypot(a - x, (b - y) * .9) < 17); if (over) { bad++; ctx.say('¡Uy, se encimó!'); } cuts.push([x, y]); const c = document.createElement('span'); c.className = 'ck-cookie' + (over ? ' bad' : ''); c.style.left = x + '%'; c.style.top = y + '%'; box.appendChild(c); }
        n++; $('#ckCnt', ctx.ctl).textContent = n + ' de ' + st.n;
        if (n >= st.n) { cancelAnimationFrame(raf); setTimeout(() => res(bad === 0 ? 3 : bad <= 1 ? 2 : 1), 400); }
      };
      $('#ckGo', ctx.ctl).onclick = go;
    });
  },
  // tocar varias veces
  tap(st, ctx) {
    return new Promise(res => {
      const n = st.n || 5; let k = 0; const t0 = Date.now();
      ctx.stage.innerHTML = `<div class="ck-tap" id="ckTap">${img(ctx.recipe.out in A.FOODS ? (A.FOODS[ctx.recipe.out].sprite || ctx.recipe.out) : 'tanghulu', 170, 7)}${hand('tap')}</div>`;
      ctx.ctl.innerHTML = `<span class="ck-count" id="ckCnt">0 de ${n}</span>`;
      $('#ckTap', ctx.stage).addEventListener('click', e => {
        k++; const box = $('#ckTap', ctx.stage); const h = $('.ck-hand', box); if (h) h.remove();
        box.classList.remove('crack'); void box.offsetWidth; box.classList.add('crack');
        const s = document.createElement('img'); s.className = 'pixel ck-spark'; s.src = spr('sparkle', 3); const r = box.getBoundingClientRect(); s.style.left = (e.clientX - r.left) + 'px'; s.style.top = (e.clientY - r.top) + 'px'; box.appendChild(s); setTimeout(() => s.remove(), 600);
        $('#ckCnt', ctx.ctl).textContent = k + ' de ' + n;
        if (k >= n) { const secs = (Date.now() - t0) / 1000; setTimeout(() => res(secs < 3 ? 3 : secs < 6 ? 2 : 1), 300); }
      });
    });
  }
};

// ---------- admin: agregar recetas ----------
const STEP_NAMES = { pick: 'Poner ingredientes', mix: 'Mezclar', pour: 'Servir hasta la línea', heat: 'Hornear o cocinar', decorate: 'Decorar', skewer: 'Ensartar en palito', dip: 'Bañar en almíbar', cut: 'Cortar galletas', tap: 'Tocar varias veces' };
let rd = null;
const adminScreen = A.screens.admincat;
A.screens.admincat = () => {
  const h = adminScreen(); if (!Store.isOwner) return h;
  rd = rd || { name: '', out: 'pastel', price: 20, items: [], tops: [], steps: [] };
  const list = (A.CFG.catalog && A.CFG.catalog.recipes) || [];
  return h + `<details class="card stack" ${S.recOpen ? 'open' : ''} id="recCard"><summary><b>Recetas de la Cocinita</b> <span class="faint">(${Object.keys(RECIPES).length} de la app${list.length ? ' + ' + list.length + ' tuyas' : ''})</span></summary>
${list.length ? `<div class="list" style="margin:8px 0">${list.map(r => `<div class="li" style="${r.off ? 'opacity:.55' : ''}"><span class="ic">${img(A.FOODS[r.out] ? (A.FOODS[r.out].sprite || r.out) : r.out, 30)}</span><span class="tx-main"><b>${esc(r.name)}</b><span>${r.steps.map(s => STEP_NAMES[s.t]).join(' → ')}</span></span><button class="btn sm danger" data-act="recDel" data-id="${r.id}">Borrar</button></div>`).join('')}</div>` : ''}
<div class="formgrid"><label class="f">Nombre<input class="in" data-rd="name" value="${esc(rd.name)}" placeholder="Ej. Brownies"></label>
<label class="f">Qué sale (va a la despensa)<select class="in" data-rd="out">${Object.entries(A.FOODS).filter(([, f]) => !f.off).map(([k, f]) => `<option value="${k}" ${rd.out === k ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}</select></label>
<label class="f">Precio para desbloquear<input class="in" type="number" min="0" data-rd="price" value="${rd.price}"></label></div>
<div class="f">Ingredientes que hay que poner<div class="chips">${Object.entries(ING).map(([k, n]) => `<button class="chip" data-ri="${k}" aria-pressed="${rd.items.includes(k)}">${img(ingSpr(k), 18)} ${esc(n)}</button>`).join('')}</div></div>
<div class="f">Toppings para decorar<div class="chips">${Object.keys(ING).concat(['star', 'heartS', 'sparkle']).map(k => `<button class="chip" data-rt="${k}" aria-pressed="${rd.tops.includes(k)}">${img(ING[k] ? ingSpr(k) : k, 18)}</button>`).join('')}</div></div>
<div class="f">Pasos en orden (toca para agregar)<div class="chips">${Object.entries(STEP_NAMES).map(([k, n]) => `<button class="chip" data-rs="${k}">+ ${n}</button>`).join('')}</div></div>
<div class="ck-seq">${rd.steps.length ? rd.steps.map((s, i) => `<span class="tag">${i + 1}. ${STEP_NAMES[s]}</span>`).join(' ') : '<span class="faint">Todavía no hay pasos</span>'}${rd.steps.length ? ' <button class="btn sm" data-act="recUndo">Quitar el último</button>' : ''}</div>
<button class="btn pink" data-act="recSave" style="justify-content:center">Guardar receta</button></details>`;
};
const afterAdmin = A.after.admincat;
A.after.admincat = el => {
  afterAdmin && afterAdmin(el); const card = $('#recCard', el); if (!card) return;
  card.addEventListener('toggle', () => { S.recOpen = card.open; });
  card.addEventListener('input', e => { const k = e.target.dataset.rd; if (k) rd[k] = e.target.type === 'number' ? +e.target.value : e.target.value; });
  card.addEventListener('change', e => { const k = e.target.dataset.rd; if (k) rd[k] = e.target.type === 'number' ? +e.target.value : e.target.value; });
  card.addEventListener('click', e => {
    const i = e.target.closest('[data-ri]'), t = e.target.closest('[data-rt]'), s2 = e.target.closest('[data-rs]');
    if (i) { const k = i.dataset.ri; rd.items = rd.items.includes(k) ? rd.items.filter(x => x !== k) : rd.items.concat(k); i.setAttribute('aria-pressed', rd.items.includes(k)); }
    if (t) { const k = t.dataset.rt; rd.tops = rd.tops.includes(k) ? rd.tops.filter(x => x !== k) : rd.tops.concat(k).slice(-4); t.setAttribute('aria-pressed', rd.tops.includes(k)); }
    if (s2) { if (rd.steps.length >= 7) return toast('Máximo 7 pasos'); rd.steps.push(s2.dataset.rs); S.recOpen = true; A.render(); }
  });
};
ACT.recUndo = () => { rd.steps.pop(); S.recOpen = true; A.render(); };
ACT.recDel = a => { if (!a.dataset.s) { a.dataset.s = 1; a.textContent = '¿Segura?'; return; } A.CFG.catalog.recipes = (A.CFG.catalog.recipes || []).filter(r => r.id !== a.dataset.id); S.recOpen = true; A.saveCatalog && A.saveCatalog(); };
ACT.recSave = () => {
  if (!rd.name.trim()) return toast('Ponle nombre a la receta'); if (!rd.steps.length) return toast('Agrega al menos un paso');
  if (rd.steps.includes('pick') && rd.items.length < 2) return toast('Elige al menos 2 ingredientes'); if (rd.steps.includes('decorate') && !rd.tops.length) return toast('Elige los toppings');
  const tops = rd.tops.map(k => ING[k] ? ingSpr(k) : k);
  const steps = rd.steps.map(t => t === 'pick' ? { t, items: rd.items.slice(), say: 'Pon: ' + rd.items.map(k => ING[k].toLowerCase()).join(', ') + '.' }
    : t === 'mix' ? { t, color: '#f6e2c4', say: 'Mezcla dando vueltitas.' } : t === 'pour' ? { t, into: 'k_molde', color: '#f6e2c4', say: 'Mantén para llenar hasta la línea.' }
      : t === 'heat' ? { t, tool: 'k_horno', say: 'Para cuando esté dorado.' } : t === 'decorate' ? { t, base: 'pastel', tops, n: 6, say: 'Decora tocando el plato.' }
        : t === 'skewer' ? { t, fruit: rd.items.find(k => ['fresa', 'manzanita'].includes(k)) || 'fresa', n: 4, say: 'Suelta la fruta encima del palito.' } : t === 'dip' ? { t, say: 'Mantén para bañar.' }
          : t === 'cut' ? { t, n: 5, say: 'Corta sin encimar.' } : { t: 'tap', n: 5, say: 'Toca varias veces.' });
  A.CFG.catalog = A.CFG.catalog || {}; (A.CFG.catalog.recipes = A.CFG.catalog.recipes || []).push({ id: uid(), name: rd.name.trim(), out: rd.out, price: Math.max(0, +rd.price || 0), steps });
  rd = null; S.recOpen = true; A.saveCatalog && A.saveCatalog();
};
})();
