// ===== Bolsillito · Muebles vistos desde arriba (estilo granja acogedora) =====
(function () {
const D = (name, w, h, fn, flat) => Pix.define(name, { w, h, fn, flat: !!flat });
const W = { d: '#8a5a3c', m: '#b07a52', l: '#d39b68', h: '#ecc08a' };   // madera
const Q = { d: '#d66d8c', m: '#f29bb3', l: '#ffc4d4', h: '#ffe3eb' };   // rosa
const CR = { d: '#e3c9a4', m: '#f6e2c4', l: '#fff6e8' };                // crema
const G = { d: '#5f9e6a', m: '#8fc9a0', l: '#bfe6c9', h: '#e3f6e8' };   // menta
const L = { d: '#8d6cc9', m: '#b59ae6', l: '#d9c8f6', h: '#f0e8ff' };   // lila
const Y = { d: '#d9a441', m: '#f2cd73', l: '#fff09a' };                 // dorado
const ST = { d: '#9c8f86', m: '#c4b8ad', l: '#e0d6cc' };                // piedra
const LF = { d: '#4f8a43', m: '#74ad5c', l: '#a3d07f' };                // hojas
const SK = { d: '#7fb2d6', m: '#a9d3ef', l: '#d8eefb' };                // vidrio
const rr = (p, x, y, w, h, c) => { p.r(x, y, w, h, c); [[x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1]].forEach(([a, b]) => p.clear(a, b)); };
const checker = (p, x, y, w, h, a, b, s) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.px(x + i, y + j, (Math.floor(i / s) + Math.floor(j / s)) % 2 ? a : b); };

// ---------- camas ----------
D('x_cama', 26, 34, p => {
  rr(p, 1, 0, 24, 7, W.m); p.r(2, 1, 22, 1, W.h); p.r(2, 2, 22, 1, W.l); p.r(1, 6, 24, 1, W.d); p.px(3, 3, W.d); p.px(22, 3, W.d);
  p.r(2, 7, 22, 24, CR.l); p.r(2, 7, 1, 24, CR.d); p.r(23, 7, 1, 24, CR.m);
  rr(p, 3, 8, 9, 5, '#ffffff'); rr(p, 14, 8, 9, 5, '#ffffff'); p.r(4, 12, 7, 1, CR.m); p.r(15, 12, 7, 1, CR.m);
  checker(p, 2, 15, 22, 14, Q.m, Q.l, 3); p.r(2, 15, 22, 2, Q.h); p.r(2, 17, 22, 1, Q.d); p.r(2, 28, 22, 1, Q.d);
  rr(p, 1, 29, 24, 5, W.m); p.r(2, 30, 22, 1, W.l); p.r(1, 33, 24, 1, W.d);
});
D('x_cama_nube', 30, 34, p => {
  [[5, 4], [11, 3], [19, 3], [25, 4]].forEach(([x, y]) => p.e(x, y + 1, 4.5, 3.6, L.l)); p.r(2, 3, 26, 5, L.l); p.r(3, 2, 24, 1, L.h);
  p.r(3, 8, 24, 22, '#ffffff'); rr(p, 5, 9, 9, 5, L.h); rr(p, 16, 9, 9, 5, L.h);
  p.r(3, 15, 24, 15, L.m); p.r(3, 15, 24, 2, L.l); for (let i = 0; i < 9; i++) p.px(5 + (i * 7) % 21, 18 + (i * 5) % 10, '#ffffff');
  [[4, 29], [10, 30], [17, 30], [24, 29]].forEach(([x, y]) => p.e(x + 1, y + 1, 4, 3, L.l)); p.r(3, 28, 24, 2, L.l);
});
// ---------- asientos ----------
D('x_sofa', 32, 20, p => {
  rr(p, 2, 0, 28, 9, Q.m); p.r(3, 1, 26, 1, Q.l); p.r(3, 7, 26, 1, Q.d);
  rr(p, 0, 4, 6, 15, Q.d); rr(p, 26, 4, 6, 15, Q.d); p.r(1, 5, 4, 1, Q.m); p.r(27, 5, 4, 1, Q.m);
  p.r(6, 8, 20, 9, Q.l); p.r(16, 8, 1, 9, Q.m); p.r(6, 8, 20, 1, Q.h); p.r(6, 16, 20, 1, Q.m);
  rr(p, 8, 3, 6, 5, '#ffffff'); p.px(9, 4, Q.h); p.r(1, 19, 2, 1, W.d); p.r(29, 19, 2, 1, W.d);
});
D('x_sofa_amarillo', 32, 20, p => {
  const A = { d: '#d9a441', m: '#f2c867', l: '#ffe39a', h: '#fff3c9' };
  rr(p, 2, 0, 28, 9, A.m); p.r(3, 1, 26, 1, A.l); p.r(3, 7, 26, 1, A.d);
  rr(p, 0, 4, 6, 15, A.d); rr(p, 26, 4, 6, 15, A.d);
  p.r(6, 8, 20, 9, A.l); p.r(16, 8, 1, 9, A.m); p.r(6, 8, 20, 1, A.h); p.r(1, 19, 2, 1, W.d); p.r(29, 19, 2, 1, W.d);
});
D('x_sillon', 16, 18, p => { rr(p, 1, 0, 14, 8, G.m); p.r(2, 1, 12, 1, G.l); rr(p, 0, 4, 4, 13, G.d); rr(p, 12, 4, 4, 13, G.d); p.r(4, 8, 8, 8, G.l); p.r(4, 8, 8, 1, G.h); p.r(1, 17, 2, 1, W.d); p.r(13, 17, 2, 1, W.d); });
D('x_silla', 10, 14, p => { rr(p, 1, 0, 8, 6, W.l); p.r(2, 1, 6, 1, W.h); p.r(1, 5, 8, 1, W.d); rr(p, 1, 6, 8, 6, Q.l); p.r(2, 7, 6, 1, Q.h); p.r(1, 12, 2, 2, W.d); p.r(7, 12, 2, 2, W.d); });
D('x_puff', 18, 16, p => {
  p.e(9, 10, 8.5, 6, CR.l); p.e(9, 9, 7.5, 5, '#ffffff'); p.r(3, 13, 12, 1, CR.d);
  p.e(6.5, 4, 3.6, 3.2, Q.m); p.e(11.5, 4, 3.6, 3.2, Q.m); p.e(9, 6.5, 4, 3, Q.m); p.px(5, 3, Q.h); p.px(6, 2, Q.h);
});
D('x_cojin', 14, 10, p => { rr(p, 1, 1, 12, 8, Q.l); p.r(2, 2, 10, 1, Q.h); p.r(2, 7, 10, 1, Q.m); p.px(7, 5, Q.d); p.px(0, 0, Q.m); p.px(13, 0, Q.m); p.px(0, 9, Q.m); p.px(13, 9, Q.m); });
// ---------- mesas ----------
D('x_mesa', 26, 20, p => {
  rr(p, 0, 0, 26, 14, CR.l); p.r(1, 1, 24, 1, '#ffffff'); checker(p, 6, 2, 14, 10, Q.l, Q.h, 2); p.r(0, 12, 26, 2, CR.d);
  p.r(2, 14, 2, 6, W.d); p.r(22, 14, 2, 6, W.d);
  p.e(8, 6, 2.6, 2.2, '#ffffff'); p.px(8, 5, Q.d); p.e(18, 6, 2.6, 2.2, '#ffffff'); p.r(17, 4, 2, 2, '#f2cd73'); p.px(13, 4, LF.m); p.px(13, 3, Q.m);
});
D('x_mesa_te', 18, 18, p => {
  p.e(9, 7, 8.5, 6.5, CR.l); p.e(9, 6, 7.5, 5, '#ffffff'); p.e(9, 6.5, 5, 3.5, Q.l);
  p.r(7, 12, 4, 6, W.m); p.r(4, 17, 10, 1, W.d);
  p.e(6, 5, 2, 1.6, Q.m); p.px(6, 4, '#ffffff'); p.r(11, 3, 3, 3, '#ffffff'); p.px(12, 3, '#e0577f');
});
D('x_mesita', 12, 14, p => { rr(p, 0, 0, 12, 9, W.m); p.r(1, 1, 10, 1, W.h); p.r(1, 2, 10, 1, W.l); p.r(1, 5, 10, 1, W.d); p.px(6, 6, Y.m); p.r(1, 9, 2, 5, W.d); p.r(9, 9, 2, 5, W.d); p.r(5, 0, 2, 1, '#ffffff'); p.px(6, 0, Y.l); });
D('x_comoda', 22, 20, p => {
  rr(p, 0, 4, 22, 14, Y.m); p.r(1, 5, 20, 1, Y.l); p.r(1, 10, 20, 1, Y.d); p.r(1, 14, 20, 1, Y.d); p.px(6, 8, W.d); p.px(15, 8, W.d); p.px(6, 12, W.d); p.px(15, 12, W.d); p.px(6, 16, W.d); p.px(15, 16, W.d);
  p.r(1, 18, 2, 2, W.d); p.r(19, 18, 2, 2, W.d);
  p.r(14, 1, 5, 3, '#ffffff'); p.px(16, 0, LF.m); p.px(15, 0, LF.l); p.e(5, 2.5, 2.5, 2, Q.m); p.px(5, 1, '#ffffff');
});
D('x_tocador', 22, 26, p => {
  p.e(11, 7, 8, 7, Y.m); p.e(11, 7, 6.6, 5.8, SK.l); p.e(9, 5, 2, 2, '#ffffff'); p.line(13, 3, 15, 5, '#ffffff');
  rr(p, 0, 12, 22, 9, CR.l); p.r(1, 13, 20, 1, '#ffffff'); p.r(1, 17, 20, 1, CR.d); p.px(11, 19, Y.m);
  p.r(1, 21, 2, 5, W.d); p.r(19, 21, 2, 5, W.d); p.r(3, 14, 3, 2, Q.m); p.r(16, 13, 2, 3, L.m);
});
D('x_estante', 22, 30, p => {
  p.r(0, 0, 22, 30, W.m); p.r(1, 0, 20, 1, W.h); p.r(2, 2, 18, 8, W.d); p.r(2, 12, 18, 7, W.d); p.r(2, 21, 18, 7, W.d);
  const books = (y, h, cols) => cols.forEach((c, i) => p.r(3 + i * 2, y + (i % 3 === 1 ? 1 : 0), 2, h - (i % 3 === 1 ? 1 : 0), c));
  books(3, 7, [Q.m, G.m, L.m, Y.m, '#9fd6f2', Q.d, G.d]); p.e(17, 7, 2, 2, LF.m); p.r(16, 8, 3, 2, '#c8714f');
  books(13, 6, [L.m, '#9fd6f2', Q.l, G.m]); p.r(13, 15, 5, 4, '#ffffff'); p.px(15, 14, Y.l);
  books(22, 6, [Y.m, Q.m, G.l, L.l, '#9fd6f2', Q.d, W.l, G.m]);
});
D('x_chimenea', 26, 28, p => {
  p.r(0, 4, 26, 24, ST.m); p.r(0, 4, 26, 2, ST.l); p.r(0, 0, 26, 4, W.m); p.r(0, 0, 26, 1, W.h); p.r(0, 3, 26, 1, W.d);
  for (let y = 7; y < 27; y += 4) for (let x = (y / 4 % 2 ? 0 : 3); x < 26; x += 6) p.r(x, y, 1, 3, ST.d);
  rr(p, 6, 12, 14, 14, '#4a3030'); p.e(13, 26, 6, 2, '#2e1e1e');
  p.e(13, 22, 4.5, 4.5, '#f28b3c'); p.e(13, 23, 3, 3.4, '#ffd36b'); p.px(13, 17, '#f28b3c'); p.px(11, 19, '#ffd36b'); p.px(15, 19, '#ffd36b');
  p.r(9, 25, 8, 1, W.m); p.r(3, 0, 4, 1, LF.m); p.r(19, 1, 4, 2, Q.l);
});
D('x_cocina', 32, 24, p => {
  rr(p, 0, 2, 16, 20, ST.d); p.r(1, 3, 14, 3, ST.l); p.e(5, 4.5, 2, 1.2, '#4a3030'); p.e(11, 4.5, 2, 1.2, '#4a3030'); rr(p, 2, 8, 12, 10, ST.m); p.r(3, 9, 10, 1, '#ffffff'); p.r(4, 11, 8, 5, '#4a3030'); p.r(5, 12, 6, 1, '#f28b3c');
  rr(p, 16, 4, 16, 18, W.m); p.r(17, 5, 14, 3, CR.l); p.r(19, 5, 8, 2, SK.m); p.px(28, 4, ST.d); p.r(17, 10, 14, 1, W.d); p.px(20, 14, W.d); p.px(27, 14, W.d);
  p.e(5, 1.5, 3, 1.8, Q.m); p.px(8, 1, Q.m); p.px(4, 0, '#ffffff'); p.r(29, 1, 2, 3, LF.m);
});
D('x_cofre', 14, 11, p => { rr(p, 0, 0, 14, 5, Q.m); p.r(1, 1, 12, 1, Q.l); rr(p, 0, 4, 14, 7, Q.d); p.r(1, 5, 12, 1, Q.m); p.r(6, 3, 2, 3, Y.m); p.px(6, 4, Y.l); });
D('x_piano', 26, 22, p => {
  rr(p, 0, 0, 26, 12, '#5a3838'); p.r(1, 1, 24, 1, '#7a5050'); p.r(2, 3, 22, 2, '#7a5050'); p.r(9, 2, 8, 3, CR.l); p.px(11, 3, Q.m); p.px(14, 3, Q.m);
  p.r(1, 12, 24, 4, '#ffffff'); for (let x = 2; x < 25; x += 3) p.r(x, 12, 1, 4, CR.d); for (let x = 3; x < 24; x += 3) if (x % 9 !== 0) p.r(x, 12, 2, 2, '#2a1e1e');
  p.r(1, 16, 24, 2, '#5a3838'); p.r(2, 18, 2, 4, '#5a3838'); p.r(22, 18, 2, 4, '#5a3838'); rr(p, 9, 18, 8, 4, Q.m);
});
// ---------- alfombras (planas, van debajo de todo) ----------
D('x_alfombra', 34, 22, p => { checker(p, 1, 1, 32, 20, Q.m, Q.l, 3); p.r(1, 1, 32, 1, Q.h); p.r(0, 2, 1, 18, Q.d); p.r(33, 2, 1, 18, Q.d); for (let x = 2; x < 32; x += 3) { p.px(x, 0, Q.l); p.px(x, 21, Q.l); } });
D('x_alfombra_verde', 34, 24, p => {
  p.r(1, 1, 32, 22, G.l); p.r(3, 3, 28, 18, '#fff6e8'); p.r(5, 5, 24, 14, G.h);
  [[5, 5], [26, 5], [5, 16], [26, 16]].forEach(([x, y]) => { p.r(x, y, 3, 3, Q.m); p.px(x + 1, y + 1, Q.h); });
  for (let i = 0; i < 4; i++) { p.e(11 + i * 4, 12, 1.6, 1.2, G.m); } p.e(17, 12, 3, 2.4, Q.m); p.e(17, 12, 1.4, 1, Q.h);
  for (let x = 2; x < 32; x += 3) { p.px(x, 0, CR.d); p.px(x, 23, CR.d); }
});
D('x_alfombra_flor', 26, 24, p => {
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; p.e(13 + Math.cos(a) * 8, 12 + Math.sin(a) * 7.3, 3.4, 3.2, Q.m); }
  p.e(13, 12, 8, 7.4, Q.l); p.e(13, 12, 5, 4.6, '#c8714f'); p.e(13, 12, 3.6, 3.2, '#a2543a'); p.px(12, 11, '#e3916b');
});
D('x_alfombra_girasol', 26, 24, p => {
  for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; p.e(13 + Math.cos(a) * 8.5, 12 + Math.sin(a) * 7.8, 3.2, 3, Y.m); }
  p.e(13, 12, 8, 7.4, Y.l); p.e(13, 12, 5.4, 5, '#8a5a3c'); p.e(13, 12, 4, 3.6, '#6b4026'); [[12, 10], [14, 13], [11, 13], [15, 10]].forEach(([x, y]) => p.px(x, y, '#a2743a'));
});
D('x_alfombra_lila', 30, 22, p => { p.e(15, 11, 14.5, 10.5, L.m); p.e(15, 11, 12, 8.5, L.l); p.e(15, 11, 8, 5.5, L.h); p.e(15, 11, 4, 2.6, L.m); });
// ---------- plantas y adornos de piso ----------
D('x_cerezo', 18, 26, p => {
  p.r(8, 12, 2, 8, W.d); p.line(9, 14, 5, 10, W.d); p.line(9, 13, 13, 9, W.d);
  [[5, 8, 4.5], [12, 7, 4.5], [9, 4, 5], [4, 12, 3.5], [14, 12, 3.4], [9, 10, 4]].forEach(([x, y, r]) => p.e(x, y, r, r * .9, Q.m));
  [[6, 6], [10, 3], [13, 6], [4, 11], [9, 9], [14, 11], [7, 12]].forEach(([x, y]) => { p.px(x, y, Q.h); p.px(x + 1, y, Q.l); });
  rr(p, 4, 19, 10, 7, '#c8714f'); p.r(4, 19, 10, 2, '#e3916b'); p.r(5, 25, 8, 1, '#a2543a');
});
D('x_planta', 14, 18, p => {
  [[4, 6, -1], [9, 5, 1], [7, 3, 0], [3, 9, -1], [11, 9, 1]].forEach(([x, y]) => p.e(x, y, 3, 2.4, LF.m)); [[4, 5], [9, 4], [7, 2]].forEach(([x, y]) => p.px(x, y, LF.l));
  p.r(7, 7, 1, 5, LF.d); rr(p, 3, 11, 8, 7, '#ffffff'); p.r(3, 11, 8, 2, CR.l); p.r(4, 17, 6, 1, CR.d);
});
D('x_planta_grande', 20, 30, p => {
  p.r(9, 10, 2, 12, LF.d);
  [[5, 6], [14, 5], [10, 2], [3, 12], [16, 12], [10, 8], [6, 16], [14, 17]].forEach(([x, y]) => { p.e(x, y, 4, 3.2, LF.m); p.px(x - 1, y - 1, LF.l); p.px(x, y - 1, LF.l); });
  rr(p, 4, 21, 12, 9, '#c8714f'); p.r(4, 21, 12, 2, '#e3916b'); p.r(5, 29, 10, 1, '#a2543a');
});
D('x_flores', 12, 14, p => { rr(p, 3, 7, 6, 7, '#9fd6f2'); p.r(4, 8, 1, 4, '#d8eefb'); p.e(4, 4, 2.2, 2, Q.m); p.e(8, 3.6, 2.2, 2, '#ffffff'); p.e(6, 2, 2, 1.8, L.m); p.px(4, 4, Y.l); p.px(8, 4, Y.m); p.px(6, 2, Y.l); p.px(2, 6, LF.m); p.px(10, 6, LF.m); });
D('x_cristal', 10, 16, p => { const c = [Q.d, Q.m, Q.l, Q.h]; [[4, 0, 2], [3, 1, 4], [2, 2, 6], [2, 3, 6], [1, 4, 8], [1, 5, 8], [2, 6, 6], [3, 7, 4]].forEach(([x, y, w]) => p.r(x, y, w, 1, Q.m)); p.r(4, 1, 1, 6, Q.h); p.r(5, 2, 1, 5, Q.l); p.r(7, 4, 1, 3, Q.d); p.r(2, 4, 1, 2, Q.l); p.r(3, 8, 4, 2, ST.m); rr(p, 1, 10, 8, 6, ST.d); p.r(2, 10, 6, 1, ST.l); });
D('x_peluche', 14, 16, p => {
  p.e(4, 3, 1.6, 3, '#ffffff'); p.e(10, 3, 1.6, 3, '#ffffff'); p.px(4, 3, Q.l); p.px(10, 3, Q.l);
  p.e(7, 8, 5, 4, '#ffffff'); p.e(7, 13, 5.5, 3.4, '#ffffff'); p.px(5, 8, '#4a3030'); p.px(9, 8, '#4a3030'); p.px(7, 9, Q.d); p.px(4, 9, Q.l); p.px(10, 9, Q.l); p.e(7, 13, 2.4, 1.8, Q.h);
});
D('x_lampara', 10, 26, p => { p.e(5, 4, 4.5, 4, Q.l); p.r(1, 4, 9, 2, Q.m); p.px(3, 2, Q.h); p.px(4, 1, '#ffffff'); p.r(4, 8, 2, 15, Y.d); p.r(4, 8, 1, 15, Y.m); rr(p, 1, 23, 8, 3, Y.d); });
D('x_lampara_mesa', 12, 14, p => { p.e(6, 4, 5, 3.6, Q.l); p.r(1, 5, 10, 2, Q.m); p.px(4, 2, '#ffffff'); p.r(5, 8, 2, 3, W.m); rr(p, 2, 11, 8, 3, W.m); p.r(3, 11, 6, 1, W.l); });
D('x_hongo', 14, 18, p => {
  p.e(7, 5, 6.5, 4.8, '#e0577f'); p.e(7, 4.5, 5.5, 3.8, '#f27ea1'); p.r(1, 6, 12, 2, '#e0577f'); p.e(4, 3, 1.4, 1.2, '#ffffff'); p.e(9.5, 2.6, 1.6, 1.3, '#ffffff'); p.px(7, 5, '#ffffff'); p.px(11, 5, '#ffffff');
  p.r(5, 8, 4, 8, CR.l); p.r(5, 8, 1, 8, CR.m); p.e(7, 8.5, 2.6, .8, Y.l); rr(p, 3, 15, 8, 3, W.m);
});
D('x_calabaza', 14, 12, p => { p.r(6, 0, 2, 3, LF.d); p.e(4, 7, 3.6, 4, '#e8a04a'); p.e(10, 7, 3.6, 4, '#e8a04a'); p.e(7, 7, 4, 4.6, '#f2b25e'); p.r(6, 3, 1, 8, '#c27a2e'); p.px(3, 5, '#ffe3b0'); });
D('x_arbolito', 18, 26, p => {
  p.e(9, 18, 8, 5, LF.m); p.e(9, 12, 6.4, 4.4, LF.m); p.e(9, 6.5, 4.6, 3.6, LF.m); p.e(7, 16, 5, 2.6, LF.l); p.e(8, 10.5, 3.6, 2, LF.l); p.e(8, 5.5, 2.4, 1.6, LF.l);
  [[4, 17, Q.d], [13, 16, Y.l], [7, 12, SK.m], [12, 11, Q.d], [9, 7, Y.l], [5, 20, SK.m], [14, 20, Q.l]].forEach(([x, y, c]) => p.px(x, y, c));
  p.r(8, 0, 2, 2, Y.m); p.px(7, 1, Y.l); p.px(10, 1, Y.l); p.px(8, 2, Y.l); p.r(7, 22, 4, 2, W.m); rr(p, 5, 23, 8, 3, Q.m);
});
// ---------- cosas de pared ----------
D('x_ventana', 22, 20, p => {
  rr(p, 2, 2, 18, 16, W.l); p.r(4, 4, 14, 12, SK.l); p.r(4, 4, 14, 4, '#eef8ff'); p.r(10, 4, 2, 12, W.l); p.r(4, 9, 14, 1, W.l); p.e(7, 6, 1.6, .8, '#ffffff');
  p.r(0, 0, 22, 3, Q.l); p.r(0, 0, 22, 1, Q.m); p.r(0, 3, 4, 14, Q.l); p.r(18, 3, 4, 14, Q.l); p.r(0, 16, 4, 2, Q.m); p.r(18, 16, 4, 2, Q.m); p.r(1, 18, 20, 2, W.m);
});
D('x_ventana_noche', 22, 20, p => {
  rr(p, 2, 2, 18, 16, W.l); p.r(4, 4, 14, 12, '#3d3a8c'); p.r(4, 4, 14, 4, '#2f2a6a'); p.r(10, 4, 2, 12, W.l); p.r(4, 9, 14, 1, W.l); p.e(15, 6.5, 1.8, 1.8, '#fff09a'); p.px(14, 6, '#3d3a8c'); p.px(6, 6, '#ffffff'); p.px(8, 12, '#ffffff');
  p.r(0, 0, 22, 3, Q.l); p.r(0, 0, 22, 1, Q.m); p.r(0, 3, 4, 14, Q.l); p.r(18, 3, 4, 14, Q.l); p.r(0, 16, 4, 2, Q.m); p.r(18, 16, 4, 2, Q.m); p.r(1, 18, 20, 2, W.m);
});
D('x_cuadro', 16, 13, p => { rr(p, 0, 0, 16, 13, Y.m); p.r(1, 1, 14, 1, Y.l); p.r(2, 2, 12, 9, SK.l); p.r(2, 7, 12, 4, LF.l); p.e(6, 9, 4, 2, LF.m); p.e(11, 4, 1.4, 1.4, Y.l); });
D('x_marco', 16, 14, p => { rr(p, 0, 0, 16, 14, '#ffffff'); p.r(1, 1, 14, 1, CR.l); p.r(2, 2, 12, 10, CR.m); p.r(1, 12, 14, 1, CR.d); p.px(8, 0, Q.m); });
D('x_corona', 16, 16, p => { for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; p.e(8 + Math.cos(a) * 5.5, 8.5 + Math.sin(a) * 5.5, 2, 2, k % 2 ? G.m : G.d); } p.e(8, 8.5, 3, 3, null); p.e(8, 3, 2.6, 2, Q.m); p.px(5, 3, Q.m); p.px(11, 3, Q.m); p.px(8, 3, Q.h); [[4, 11], [12, 11], [8, 14]].forEach(([x, y]) => p.px(x, y, Q.d)); });
D('x_aplique', 8, 12, p => { p.r(3, 0, 2, 4, Y.d); p.e(4, 6, 3.4, 3, Y.l); p.e(4, 6, 2, 2, '#ffffff'); p.r(2, 9, 4, 2, Y.d); });
D('x_luces', 48, 9, p => { for (let x = 0; x < 48; x++) p.px(x, Math.round(1 + Math.sin(x / 48 * Math.PI) * 3), '#4a3a6a'); const cs = ['#fff09a', '#ffc4d4', '#cdeefc', '#d3eaa8', '#e6d4ff']; for (let i = 0; i < 9; i++) { const x = 2 + i * 5, y = Math.round(1 + Math.sin(x / 48 * Math.PI) * 3) + 1; p.r(x, y, 2, 3, cs[i % cs.length]); p.px(x, y, '#ffffff'); } });
D('x_estrellas', 40, 10, p => { for (let x = 0; x < 40; x++) p.px(x, Math.round(Math.sin(x / 40 * Math.PI) * 2), '#8a5a3c'); for (let i = 0; i < 5; i++) { const x = 3 + i * 8, y = Math.round(Math.sin(x / 40 * Math.PI) * 2) + 2; p.map(x, y, ['..y..', '.yYy.', 'yyyyy', '.y.y.']); } });
D('x_reloj', 12, 18, p => { rr(p, 1, 0, 10, 18, W.m); p.r(2, 1, 8, 1, W.h); p.e(6, 5, 3.4, 3.4, CR.l); p.px(6, 3, W.d); p.px(6, 4, W.d); p.px(7, 5, W.d); p.r(5, 11, 2, 4, Y.m); p.e(6, 15, 1.4, 1.2, Y.l); });
// ---------- marco del cuarto y pared/piso de vista desde arriba ----------
const WALLS3 = {
  rosa: (x, y) => ((x + (Math.floor(y / 7) % 2) * 5) % 10 === 0 && y % 7 === 3) ? '#ffffff' : ((x % 10 < 5) ? '#fbd9e1' : '#f8cfd9'),
  cereza: (x, y) => { const cx = (x + (Math.floor(y / 9) % 2) * 6) % 12, cy = y % 9; return (cx === 5 && cy === 4) || (cx === 7 && cy === 4) ? '#e0577f' : (cx === 6 && cy === 2) ? '#5f9e6a' : '#fde8ec'; },
  menta: (x, y) => (x % 12 < 6) ? '#e3f4ea' : '#d4eedf',
  lila: (x, y) => ((x + (Math.floor(y / 8) % 2) * 4) % 8 === 0 && y % 8 === 3) ? '#fff7ff' : '#e6d8f8',
  durazno: (x, y) => ((Math.floor(x / 6) + Math.floor(y / 6)) % 2) ? '#ffe3cf' : '#ffd6bd',
  cielo: (x, y) => y < 14 ? '#d8eefb' : '#e6f4fd'
};
Object.keys(WALLS3).forEach(k => Pix.define('x_pared_' + k, { w: 144, h: 34, flat: true, fn(p) {
  for (let y = 0; y < 28; y++) for (let x = 0; x < 144; x++) p.px(x, y, WALLS3[k](x, y));
  if (k === 'cielo') [[20, 7], [62, 4], [104, 9], [130, 3]].forEach(([cx, cy]) => { p.e(cx, cy, 8, 2.6, '#ffffff'); p.e(cx - 4, cy - 1.5, 3.5, 2.4, '#ffffff'); });
  p.r(0, 28, 144, 6, '#e9b8c6'); p.r(0, 28, 144, 1, '#fbd9e1'); p.r(0, 33, 144, 1, '#c98a9c');
} }));
const FLOORS3 = {
  madera: (x, y) => { const col = Math.floor(x / 9); const off = (col % 3) * 13; const seam = x % 9 === 0 || (y + off) % 38 === 0; return seam ? '#c99a6c' : ((col % 2) ? '#f2d3a8' : '#eccb9c'); },
  rosa: (x, y) => { const col = Math.floor(x / 9); const off = (col % 3) * 13; const seam = x % 9 === 0 || (y + off) % 38 === 0; return seam ? '#e9a9b9' : ((col % 2) ? '#fbd2dc' : '#f8c8d4'); },
  cafe: (x, y) => { const col = Math.floor(x / 9); const off = (col % 3) * 13; const seam = x % 9 === 0 || (y + off) % 38 === 0; return seam ? '#6b4026' : ((col % 2) ? '#9a6440' : '#915d3b'); },
  lila: (x, y) => { const col = Math.floor(x / 9); const off = (col % 3) * 13; const seam = x % 9 === 0 || (y + off) % 38 === 0; return seam ? '#a68ad6' : ((col % 2) ? '#cdb9f0' : '#c5aeec'); },
  cuadros: (x, y) => ((Math.floor(x / 9) + Math.floor(y / 9)) % 2) ? '#fff3df' : '#ffc4d4',
  pasto: (x, y) => ((x * 7 + y * 13) % 9 === 0) ? '#a3d07f' : ((x * 3 + y) % 17 === 0 ? '#ffffff' : '#bfe39a')
};
Object.keys(FLOORS3).forEach(k => Pix.define('x_piso_' + k, { w: 144, h: 98, flat: true, fn(p) {
  for (let y = 0; y < 98; y++) for (let x = 0; x < 144; x++) p.px(x, y, FLOORS3[k](x, y));
  for (let x = 0; x < 144; x++) { p.px(x, 0, '#00000022'); }
} }));
})();
