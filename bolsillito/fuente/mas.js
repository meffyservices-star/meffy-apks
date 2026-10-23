// ===== Bolsillito · Más muebles, adornos y ropa =====
(function () {
const A = App;
const D = (name, w, h, fn) => Pix.define(name, { w, h, fn });
const W = { d: '#8a5a3c', m: '#b07a52', l: '#d39b68', h: '#ecc08a' };
const Q = { d: '#d66d8c', m: '#f29bb3', l: '#ffc4d4', h: '#ffe3eb' };
const CR = { d: '#e3c9a4', m: '#f6e2c4', l: '#fff6e8' };
const G = { d: '#5f9e6a', m: '#8fc9a0', l: '#bfe6c9', h: '#e3f6e8' };
const L = { d: '#8d6cc9', m: '#b59ae6', l: '#d9c8f6', h: '#f0e8ff' };
const Y = { d: '#d9a441', m: '#f2cd73', l: '#fff09a' };
const ST = { d: '#9c8f86', m: '#c4b8ad', l: '#e0d6cc' };
const LF = { d: '#4f8a43', m: '#74ad5c', l: '#a3d07f' };
const SK = { d: '#7fb2d6', m: '#a9d3ef', l: '#d8eefb' };
const MT = { d: '#4f9e8c', m: '#7fcdb8', l: '#bfeee0' };
const rr = (p, x, y, w, h, c) => { p.r(x, y, w, h, c); [[x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1]].forEach(([a, b]) => p.clear(a, b)); };
const checker = (p, x, y, w, h, a, b, s) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.px(x + i, y + j, (Math.floor(i / s) + Math.floor(j / s)) % 2 ? a : b); };
const pot = (p, x, y, w, h, c1, c2) => { rr(p, x, y, w, h, c1); p.r(x, y, w, 2, c2); };

// ================= MUEBLES =================
// camas y asientos
D('x_cama_dosel', 30, 40, p => {
  p.r(1, 0, 2, 38, W.l); p.r(27, 0, 2, 38, W.l); p.r(1, 0, 28, 3, Q.l); for (let x = 3; x < 27; x += 4) p.e(x + 2, 3, 2, 1.6, Q.l);
  p.r(3, 3, 3, 14, Q.h); p.r(24, 3, 3, 14, Q.h); p.r(3, 3, 1, 14, Q.l); p.r(26, 3, 1, 14, Q.l);
  rr(p, 4, 8, 22, 6, W.m); p.r(5, 9, 20, 1, W.h);
  p.r(5, 13, 20, 24, '#ffffff'); rr(p, 6, 14, 8, 5, Q.h); rr(p, 16, 14, 8, 5, Q.h);
  p.r(5, 20, 20, 16, Q.l); p.r(5, 20, 20, 2, Q.h); for (let i = 0; i < 6; i++) { p.px(7 + i * 3, 24 + (i % 2) * 5, Q.m); p.px(8 + i * 3, 27 + (i % 2) * 4, '#ffffff'); } p.r(5, 35, 20, 2, W.m);
  [[2, 2], [27, 2], [2, 36], [27, 36]].forEach(([x, y]) => p.e(x + .5, y, 1.6, 1.4, LF.m));
});
D('x_futon', 30, 22, p => { rr(p, 0, 2, 30, 18, MT.l); p.r(1, 3, 28, 2, '#ffffff'); rr(p, 2, 4, 9, 5, '#ffffff'); checker(p, 1, 10, 28, 9, MT.m, MT.l, 3); p.r(1, 10, 28, 1, '#ffffff'); p.r(0, 20, 30, 2, W.m); });
D('x_sofa_lila', 32, 20, p => { rr(p, 2, 0, 28, 9, L.m); p.r(3, 1, 26, 1, L.l); rr(p, 0, 4, 6, 15, L.d); rr(p, 26, 4, 6, 15, L.d); p.r(6, 8, 20, 9, L.l); p.r(16, 8, 1, 9, L.m); p.r(6, 8, 20, 1, L.h); rr(p, 18, 3, 6, 5, Y.l); p.px(20, 5, Y.m); p.r(1, 19, 2, 1, W.d); p.r(29, 19, 2, 1, W.d); });
D('x_mecedora', 18, 22, p => { rr(p, 2, 0, 14, 10, W.l); for (let x = 4; x < 15; x += 3) p.r(x, 1, 1, 8, W.m); rr(p, 1, 9, 16, 7, Q.l); p.r(2, 10, 14, 1, Q.h); p.r(1, 16, 2, 4, W.d); p.r(15, 16, 2, 4, W.d); p.line(0, 21, 17, 21, W.d); p.px(0, 20, W.d); p.px(17, 20, W.d); });
D('x_silla_huevo', 22, 30, p => { p.r(10, 0, 2, 4, W.d); p.e(11, 15, 10, 12, '#e8c48a'); p.e(11, 16, 8, 10, '#f3dcb3'); for (let y = 6; y < 26; y += 3) for (let x = 3; x < 20; x += 3) if ((x + y) % 2) p.px(x, y, '#d9b37a'); p.e(11, 19, 6.5, 6, Q.l); p.e(10, 17, 3, 2, '#ffffff'); p.r(9, 27, 4, 3, ST.d); });
D('x_banco', 30, 14, p => { rr(p, 0, 2, 30, 6, W.l); p.r(1, 3, 28, 1, W.h); p.r(1, 6, 28, 1, W.d); p.r(2, 8, 2, 6, W.d); p.r(26, 8, 2, 6, W.d); p.r(4, 0, 5, 3, Q.l); p.r(20, 0, 6, 3, G.l); });
D('x_puff_nube', 20, 14, p => { [[5, 7], [10, 5], [15, 7]].forEach(([x, y]) => p.e(x, y, 5, 4.4, '#ffffff')); p.r(3, 7, 14, 5, '#ffffff'); p.r(3, 11, 14, 1, SK.l); p.px(7, 5, SK.l); });
D('x_cojin_estrella', 16, 16, p => { p.map(0, 0, ['.......yy.......', '......yyyy......', '.....yyllyy.....', 'yyyyyylllyyyyyy.', '.yylllllllllyy..', '..yyllkllkllyy..', '...yylllllyy....', '...yylYlYlyy....', '..yylllllllyy...', '..yyllyyylllyy..', '.yyllyy..yyllyy.', '.yyyy......yyyy.'].map(r => r.replace(/l/g, 'y').replace(/k/g, 'N').replace(/Y/g, 'P'))); });
// mesas y muebles
D('x_escritorio', 30, 24, p => { rr(p, 0, 6, 30, 6, W.m); p.r(1, 7, 28, 1, W.h); p.r(1, 12, 2, 12, W.d); p.r(20, 12, 9, 10, W.l); p.r(21, 14, 7, 1, W.d); p.r(21, 18, 7, 1, W.d); p.px(24, 16, Y.m); p.px(24, 20, Y.m); rr(p, 8, 0, 12, 7, '#d0d6e0'); p.r(9, 1, 10, 5, SK.l); p.r(9, 1, 10, 2, '#ffffff'); p.r(4, 3, 3, 3, Q.m); p.px(5, 2, LF.m); });
D('x_ropero', 26, 34, p => { rr(p, 0, 0, 26, 32, W.l); p.r(1, 1, 24, 1, W.h); p.r(2, 3, 10, 26, W.m); p.r(14, 3, 10, 26, W.m); p.r(3, 4, 8, 24, W.l); p.r(15, 4, 8, 24, W.l); p.r(11, 14, 1, 4, Y.m); p.r(14, 14, 1, 4, Y.m); p.e(7, 10, 2.4, 2, Q.l); p.e(19, 10, 2.4, 2, Q.l); p.r(1, 32, 3, 2, W.d); p.r(22, 32, 3, 2, W.d); });
D('x_vitrina', 22, 30, p => { rr(p, 0, 0, 22, 30, '#ffffff'); p.r(1, 1, 20, 1, CR.l); p.r(2, 3, 18, 24, SK.l); p.r(2, 11, 18, 1, '#ffffff'); p.r(2, 19, 18, 1, '#ffffff'); [[4, 7, Q.m], [9, 7, G.m], [14, 7, L.m], [5, 15, Y.m], [11, 15, Q.l], [4, 23, MT.m], [10, 23, Q.m], [15, 23, Y.l]].forEach(([x, y, c]) => { rr(p, x, y, 4, 4, c); p.px(x + 4, y + 1, c); }); p.r(1, 28, 20, 2, CR.d); });
D('x_refri', 18, 32, p => { rr(p, 0, 0, 18, 32, MT.l); p.r(1, 1, 16, 1, '#ffffff'); p.r(1, 11, 16, 1, MT.d); p.r(14, 4, 2, 5, '#ffffff'); p.r(14, 14, 2, 9, '#ffffff'); p.r(3, 3, 3, 3, Q.m); p.px(8, 5, Y.m); p.r(4, 16, 4, 3, '#ffffff'); p.r(1, 30, 16, 2, MT.d); });
D('x_fregadero', 24, 22, p => { rr(p, 0, 6, 24, 16, W.l); p.r(1, 7, 22, 3, CR.l); rr(p, 4, 7, 12, 3, ST.m); p.r(10, 1, 2, 6, ST.d); p.r(8, 1, 4, 1, ST.d); p.r(1, 12, 22, 1, W.d); p.px(6, 16, W.d); p.px(17, 16, W.d); p.r(18, 4, 3, 3, LF.m); });
D('x_carrito', 22, 24, p => { rr(p, 1, 2, 20, 4, Q.l); p.r(2, 3, 18, 1, Q.h); rr(p, 1, 13, 20, 4, Q.l); p.r(1, 6, 2, 14, ST.d); p.r(19, 6, 2, 14, ST.d); p.e(4, 21, 2, 2, ST.d); p.e(18, 21, 2, 2, ST.d); p.e(7, 1, 3, 2, '#ffffff'); p.px(7, 0, Q.d); p.r(13, 0, 5, 3, Y.l); p.e(8, 12, 3, 1.6, CR.m); p.px(14, 12, Q.m); p.px(16, 11, G.m); });
D('x_tocadiscos', 18, 18, p => { rr(p, 0, 6, 18, 12, W.m); p.r(1, 7, 16, 1, W.h); p.e(8, 11, 5, 3.4, '#3a2a3a'); p.e(8, 11, 1.4, 1, Q.m); p.line(14, 8, 12, 12, ST.l); p.r(14, 14, 2, 2, Y.m); p.e(5, 3, 3, 3, Y.l); p.px(5, 1, Y.m); p.px(11, 2, '#ffffff'); });
D('x_tele', 22, 22, p => { rr(p, 0, 2, 22, 16, '#f2c867'); p.r(1, 3, 20, 1, '#ffe39a'); rr(p, 2, 4, 14, 12, '#3a2a3a'); p.r(3, 5, 12, 10, '#7fb8e8'); p.r(3, 5, 12, 3, '#cdeefc'); p.e(9, 11, 2.4, 2, Q.m); p.e(18, 7, 1.4, 1.4, '#c27a2e'); p.e(18, 11, 1.4, 1.4, '#c27a2e'); p.line(6, 0, 9, 2, ST.d); p.line(14, 0, 11, 2, ST.d); p.r(3, 18, 2, 4, W.d); p.r(17, 18, 2, 4, W.d); });
D('x_pecera', 20, 18, p => { rr(p, 0, 2, 20, 14, SK.l); p.r(1, 3, 18, 1, '#ffffff'); p.r(1, 6, 18, 9, SK.m); p.r(1, 13, 18, 2, Y.l); p.e(7, 9, 2.6, 1.6, '#f28b3c'); p.px(4, 9, '#f28b3c'); p.px(8, 9, '#ffffff'); p.e(14, 11, 1.8, 1.2, Q.m); p.r(4, 10, 1, 4, LF.m); p.r(16, 8, 1, 6, LF.m); p.px(11, 5, '#ffffff'); p.r(0, 16, 20, 2, W.d); });
D('x_jaula', 16, 26, p => { p.r(7, 0, 2, 3, Y.d); p.e(8, 10, 7, 7, Y.m, (i, j) => j < 10); for (let x = 2; x < 15; x += 3) p.r(x, 5, 1, 13, Y.m); p.r(1, 17, 14, 2, Y.d); p.e(8, 13, 2.4, 2, SK.m); p.px(9, 12, '#ffffff'); p.px(10, 13, Y.d); p.line(3, 15, 13, 15, W.l); p.r(6, 19, 4, 7, Y.d); });
D('x_espejo_pie', 14, 30, p => { p.e(7, 9, 6.5, 9, Y.m); p.e(7, 9, 5, 7.5, SK.l); p.line(4, 6, 6, 3, '#ffffff'); p.line(8, 12, 10, 9, '#ffffff'); p.r(6, 18, 2, 10, Y.d); p.r(2, 28, 10, 2, Y.d); });
D('x_perchero', 14, 30, p => { p.r(6, 2, 2, 26, W.d); p.r(2, 28, 10, 2, W.d); p.line(2, 4, 6, 2, W.d); p.line(11, 4, 7, 2, W.d); p.e(4, 9, 3, 4, Q.m); p.r(2, 11, 4, 4, Q.m); p.e(10, 8, 2.6, 3, Y.l); p.r(9, 9, 3, 6, L.l); });
D('x_baul', 20, 14, p => { rr(p, 0, 0, 20, 6, W.l); p.r(1, 1, 18, 1, W.h); rr(p, 0, 5, 20, 9, W.m); p.r(4, 0, 2, 14, Y.d); p.r(14, 0, 2, 14, Y.d); p.r(9, 4, 2, 3, Y.m); });
D('x_cajonera', 18, 20, p => { const c = [Q.l, MT.l, Y.l, L.l]; rr(p, 0, 0, 18, 18, '#ffffff'); c.forEach((col, i) => { p.r(1, 1 + i * 4, 16, 3, col); p.r(8, 2 + i * 4, 2, 1, W.d); }); p.r(1, 18, 2, 2, W.d); p.r(15, 18, 2, 2, W.d); });
D('x_mesa_lila', 20, 18, p => { p.e(10, 7, 9.5, 6.5, L.l); p.e(10, 6, 8.5, 5, L.h); p.e(10, 6, 5, 3, '#ffffff'); p.r(9, 12, 2, 6, L.d); p.r(5, 17, 10, 1, L.d); p.e(7, 5, 1.6, 1.2, Q.m); p.r(12, 3, 2, 3, Y.l); });
D('x_frutero', 14, 12, p => { p.e(7, 8, 6.5, 3.4, W.l); p.e(7, 7, 5.5, 2, W.h); p.e(4, 5, 2.2, 2.2, '#e0577f'); p.e(9, 5, 2.4, 2.2, Y.m); p.e(7, 3.4, 2, 2, '#8cbf4f'); p.e(11, 6, 1.8, 1.8, '#a385e0'); p.px(4, 4, '#ffffff'); });
D('x_tetera', 14, 12, p => { p.e(6, 7, 5, 4, '#ffffff'); p.e(6, 3, 2.4, 1.2, Q.m); p.px(6, 1, Q.m); p.line(10, 6, 13, 4, '#ffffff'); p.e(1.4, 7, 1.4, 2, '#ffffff'); p.px(5, 7, Q.m); p.px(7, 8, Q.m); p.r(2, 10, 9, 1, CR.d); });
// alfombras nuevas
D('x_alfombra_corazon', 26, 22, p => { p.e(8, 7, 7, 6.4, Q.m); p.e(18, 7, 7, 6.4, Q.m); p.e(13, 12, 11, 8, Q.m, (i, j) => j > 8); for (let j = 8; j < 22; j++) { const w = Math.max(0, Math.round(12 - (j - 8) * .9)); p.r(13 - w, j, w * 2, 1, Q.m); } p.e(8, 7, 5, 4.4, Q.l); p.e(18, 7, 5, 4.4, Q.l); for (let j = 9; j < 19; j++) { const w = Math.max(0, Math.round(9 - (j - 9) * .95)); p.r(13 - w, j, w * 2, 1, Q.l); } p.px(6, 5, '#ffffff'); p.px(7, 4, '#ffffff'); });
D('x_alfombra_fresa', 26, 24, p => { p.e(13, 13, 12, 10.5, '#e0577f'); p.e(13, 12, 10.5, 9, '#f27ea1'); [[8, 10], [13, 8], [18, 10], [10, 15], [16, 15], [13, 19]].forEach(([x, y]) => p.px(x, y, Y.l)); p.map(7, 0, ['..GG..GG..', '.GGGGGGGG.', 'GGGGGGGGGG'].map(r => r.replace(/G/g, 'G'))); });
D('x_alfombra_arcoiris', 34, 20, p => { const cs = ['#f7a8c0', '#ffd6a0', '#fff09a', '#bfe6c9', '#a9d3ef', '#d9c8f6']; cs.forEach((c, i) => p.e(17, 19, 16.5 - i * 2.2, 18 - i * 2.2, c, (x, y) => y < 19)); p.e(17, 19, 3, 4, null); p.e(4, 18, 4, 2.4, '#ffffff'); p.e(30, 18, 4, 2.4, '#ffffff'); });
D('x_alfombra_luna', 28, 24, p => { p.e(14, 12, 13.5, 11.5, '#4a3f8f'); p.e(14, 12, 12, 10, '#5c4a9f'); p.e(11, 12, 6, 6, Y.l); p.e(14, 10, 5.4, 5.4, '#5c4a9f'); [[20, 6], [22, 15], [7, 6], [17, 19], [6, 17]].forEach(([x, y]) => { p.px(x, y, '#ffffff'); p.px(x + 1, y, Y.l); }); });
D('x_alfombra_limon', 26, 24, p => { p.e(13, 12, 12.5, 11.5, '#f2cd73'); p.e(13, 12, 11, 10, '#fff7c9'); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; p.line(13, 12, Math.round(13 + Math.cos(a) * 10), Math.round(12 + Math.sin(a) * 9), '#f2cd73'); } p.e(13, 12, 2, 2, '#fff7c9'); });
D('x_tapete_nube', 30, 18, p => { [[6, 10], [12, 7], [19, 7], [25, 10]].forEach(([x, y]) => p.e(x, y, 6, 5.5, '#ffffff')); p.r(4, 10, 22, 6, '#ffffff'); p.r(4, 15, 22, 1, SK.l); p.px(10, 9, SK.l); p.px(20, 11, SK.l); });
// plantas, peluches y adornos
D('x_girasol', 14, 26, p => { p.r(6, 9, 2, 12, LF.d); p.e(4, 14, 3, 1.4, LF.m); p.e(10, 17, 3, 1.4, LF.m); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; p.e(7 + Math.cos(a) * 4, 6 + Math.sin(a) * 4, 2, 2, Y.m); } p.e(7, 6, 2.8, 2.8, W.d); p.px(6, 5, W.l); pot(p, 3, 20, 8, 6, '#c8714f', '#e3916b'); });
D('x_cactus', 12, 18, p => { rr(p, 4, 2, 4, 11, '#74ad5c'); rr(p, 1, 5, 3, 5, '#74ad5c'); rr(p, 8, 4, 3, 5, '#74ad5c'); p.r(5, 3, 1, 9, '#a3d07f'); p.px(6, 1, Q.m); p.px(5, 1, Q.l); pot(p, 2, 12, 8, 6, Q.l, Q.h); p.px(5, 15, Q.m); });
D('x_monstera', 22, 28, p => { p.r(10, 12, 2, 10, LF.d); [[5, 8, -1], [16, 7, 1], [11, 4, 0], [5, 15, -1], [17, 15, 1]].forEach(([x, y]) => { p.e(x, y, 5, 4, LF.m); p.px(x, y - 1, LF.l); p.px(x - 2, y, LF.d); p.px(x + 2, y + 1, LF.d); }); pot(p, 5, 21, 12, 7, '#ffffff', CR.l); p.r(6, 27, 10, 1, CR.d); });
D('x_tulipanes', 14, 20, p => { [[3, 4, Q.m], [7, 2, '#e0577f'], [11, 4, Y.m]].forEach(([x, y, c]) => { p.r(x, y + 3, 1, 8, LF.d); p.e(x + .5, y + 2, 2, 2.4, c); p.px(x, y, c); p.px(x + 1, y, c); }); pot(p, 2, 13, 10, 7, SK.m, SK.l); });
D('x_vela', 8, 12, p => { rr(p, 1, 5, 6, 7, Q.l); p.r(1, 5, 6, 1, Q.h); p.r(4, 3, 1, 2, '#4a3030'); p.e(4, 2, 1.4, 2, Y.m); p.px(4, 1, Y.l); });
D('x_libros', 14, 12, p => { const cs = [Q.m, MT.m, Y.m, L.m]; cs.forEach((c, i) => { rr(p, 1 + (i % 2), 9 - i * 3, 12 - (i % 2) * 2, 3, c); p.r(2 + (i % 2), 10 - i * 3, 10 - (i % 2) * 2, 1, '#ffffff'); }); p.e(10, 1, 1.6, 1.4, Q.l); });
D('x_globo', 12, 16, p => { p.e(6, 6, 5, 5, SK.m); p.e(4, 5, 2, 2, LF.m); p.e(8, 8, 2, 1.6, LF.m); p.px(7, 3, LF.m); p.line(1, 6, 6, 12, Y.d); p.r(5, 12, 2, 2, Y.d); rr(p, 2, 14, 8, 2, Y.d); });
D('x_oso', 16, 18, p => { p.e(3.5, 3, 2.4, 2.4, W.l); p.e(12.5, 3, 2.4, 2.4, W.l); p.e(8, 7, 5.5, 5, W.l); p.e(8, 14, 6.5, 4.4, W.l); p.e(8, 9, 2.4, 1.6, CR.l); p.px(6, 6, '#4a3030'); p.px(10, 6, '#4a3030'); p.px(8, 8, '#4a3030'); p.e(8, 14, 3, 2.4, CR.l); p.e(3.5, 3, 1, 1, Q.l); p.e(12.5, 3, 1, 1, Q.l); p.r(6, 11, 4, 1, Q.m); });
D('x_pollito', 12, 12, p => { p.e(6, 7, 5, 4.6, Y.l); p.e(6, 4, 3.4, 3, Y.l); p.px(5, 3, '#4a3030'); p.px(7, 3, '#4a3030'); p.r(5, 5, 3, 1, '#f28b3c'); p.px(2, 7, Y.m); p.px(10, 7, Y.m); p.px(4, 5, Q.l); p.px(8, 5, Q.l); });
D('x_pinguino', 12, 14, p => { p.e(6, 8, 5, 5.5, '#4a4a6a'); p.e(6, 9, 3.4, 4.4, '#ffffff'); p.e(6, 4, 3.6, 3, '#4a4a6a'); p.px(5, 3, '#ffffff'); p.px(7, 3, '#ffffff'); p.r(5, 5, 3, 1, '#f28b3c'); p.r(3, 13, 2, 1, '#f28b3c'); p.r(7, 13, 2, 1, '#f28b3c'); p.px(4, 5, Q.l); p.px(8, 5, Q.l); p.r(4, 7, 5, 1, Q.m); });
D('x_osito_gigante', 26, 28, p => { p.e(5, 5, 4, 4, '#e8c4a8'); p.e(21, 5, 4, 4, '#e8c4a8'); p.e(13, 11, 9, 8, '#e8c4a8'); p.e(13, 22, 11, 7, '#e8c4a8'); p.e(13, 14, 4, 2.6, '#fff0e6'); p.px(10, 9, '#4a3030'); p.px(16, 9, '#4a3030'); p.r(12, 13, 3, 1, '#4a3030'); p.e(5, 5, 2, 2, Q.l); p.e(21, 5, 2, 2, Q.l); p.e(13, 22, 5, 4, '#fff0e6'); p.map(9, 17, ['PP...PP', 'PPPPPPP', 'PP...PP'].map(r => r.replace(/P/g, 'P'))); });
D('x_caballete', 20, 28, p => { p.line(3, 27, 9, 0, W.d); p.line(16, 27, 10, 0, W.d); p.line(9, 0, 9, 26, W.m); rr(p, 2, 4, 16, 14, '#ffffff'); p.r(3, 5, 14, 12, SK.l); p.r(3, 12, 14, 5, LF.l); p.e(13, 8, 2, 2, Y.l); p.e(7, 13, 3, 2, Q.l); p.r(1, 18, 18, 2, W.m); });
D('x_cesta', 16, 12, p => { p.line(3, 4, 8, 0, W.d); p.line(13, 4, 8, 0, W.d); rr(p, 1, 4, 14, 8, '#e8c48a'); for (let x = 2; x < 15; x += 2) p.r(x, 5, 1, 6, '#d9b37a'); p.r(1, 4, 14, 2, Q.l); for (let x = 2; x < 15; x += 3) p.px(x, 5, '#ffffff'); });
D('x_maleta', 16, 14, p => { p.r(6, 0, 4, 3, W.d); rr(p, 0, 2, 16, 12, Q.m); p.r(1, 3, 14, 1, Q.l); p.r(4, 2, 1, 12, Q.d); p.r(11, 2, 1, 12, Q.d); p.e(8, 8, 2, 2, Y.l); });
D('x_guitarra', 12, 26, p => { p.r(5, 0, 2, 3, W.d); p.r(5, 3, 2, 10, W.m); p.e(6, 15, 4.6, 4, '#f2c867'); p.e(6, 21, 5.6, 4.6, '#f2c867'); p.e(6, 18, 1.8, 1.8, '#3a2a3a'); p.r(4, 23, 4, 1, W.d); p.px(3, 20, '#ffe39a'); });
D('x_hongos', 14, 12, p => { p.e(4, 5, 4, 3, '#e0577f'); p.r(3, 6, 3, 5, '#fff6e8'); p.px(3, 4, '#ffffff'); p.px(5, 3, '#ffffff'); p.e(10, 7, 3, 2.4, Y.m); p.r(9, 8, 2, 3, '#fff6e8'); p.px(10, 6, '#ffffff'); p.r(0, 11, 14, 1, LF.m); });
// luces
D('x_lampara_luna', 14, 16, p => { p.e(7, 7, 6.5, 6.5, Y.l); p.e(10, 5, 5.4, 5.4, null); p.e(5, 9, 1, 1, Y.m); p.e(7, 4, .8, .8, Y.m); rr(p, 3, 14, 8, 2, W.m); });
D('x_lampara_estrella', 12, 22, p => { p.map(1, 0, ['....yy....', '...yyyy...', 'yyyyyyyyyy', '.yyyyyyyy.', '..yyyyyy..', '.yyy..yyy.', '.yy....yy.'].map(r => r)); p.r(5, 7, 2, 12, Y.d); rr(p, 2, 19, 8, 3, Y.d); });
D('x_farol', 10, 16, p => { p.r(4, 0, 2, 2, ST.d); rr(p, 1, 2, 8, 3, '#4a4a6a'); rr(p, 2, 5, 6, 8, Y.l); p.r(4, 6, 2, 6, '#ffffff'); p.r(1, 13, 8, 3, '#4a4a6a'); });
D('x_lava', 10, 20, p => { p.e(5, 2, 2, 1.6, ST.d); rr(p, 2, 2, 6, 12, L.l); p.e(5, 5, 1.6, 2, Q.m); p.e(4, 10, 1.4, 1.6, Q.m); p.e(6, 12, 1.2, 1, Q.m); p.r(1, 14, 8, 6, ST.d); p.r(2, 15, 6, 1, ST.m); });
// pared
D('x_repisa_plantas', 30, 14, p => { p.r(0, 9, 30, 3, W.m); p.r(0, 9, 30, 1, W.h); p.r(3, 12, 2, 2, W.d); p.r(25, 12, 2, 2, W.d); pot(p, 2, 5, 6, 4, '#ffffff', CR.l); p.e(5, 3, 3, 2.4, LF.m); pot(p, 12, 4, 6, 5, Q.l, Q.h); p.r(14, 0, 2, 4, LF.m); p.px(13, 1, LF.l); p.px(16, 2, LF.l); pot(p, 22, 6, 6, 3, '#c8714f', '#e3916b'); p.e(25, 4, 2.4, 2, '#e0577f'); });
D('x_banderines', 44, 10, p => { for (let x = 0; x < 44; x++) p.px(x, Math.round(Math.sin(x / 44 * Math.PI) * 2), '#8a5a3c'); const cs = [Q.m, Y.m, MT.m, L.m, '#a9d3ef', Q.l]; for (let i = 0; i < 6; i++) { const x = 3 + i * 7, y = Math.round(Math.sin(x / 44 * Math.PI) * 2) + 1; for (let j = 0; j < 6; j++) p.r(x + Math.floor(j / 2), y + j, 6 - Math.floor(j / 2) * 2, 1, cs[i]); } });
D('x_enredadera', 40, 14, p => { for (let x = 0; x < 40; x++) p.px(x, 2 + Math.round(Math.sin(x / 5) * 1.5), LF.d); for (let i = 0; i < 12; i++) { const x = 1 + i * 3.3, y = 2 + Math.round(Math.sin(x / 5) * 1.5); p.e(x, y + 2, 1.6, 1.4, i % 2 ? LF.m : LF.l); if (i % 3 === 0) { p.e(x + 1, y + 5, 1.4, 1.4, Q.m); p.px(Math.round(x + 1), y + 5, Y.l); } } for (let k = 0; k < 4; k++) { const x = 4 + k * 10; p.r(x, 4, 1, 6 + (k % 2) * 3, LF.d); p.e(x, 10 + (k % 2) * 3, 1.4, 1.2, LF.m); } });
D('x_espejo_redondo', 16, 16, p => { p.e(8, 8, 7.5, 7.5, Y.m); p.e(8, 8, 6, 6, SK.l); p.line(5, 6, 7, 4, '#ffffff'); p.line(9, 11, 11, 9, '#ffffff'); p.e(8, 1, 2, 1.4, Q.m); });
D('x_reloj_pared', 14, 14, p => { p.e(7, 7, 6.5, 6.5, Q.m); p.e(7, 7, 5, 5, '#ffffff'); p.r(7, 3, 1, 4, '#4a3030'); p.r(7, 7, 3, 1, '#4a3030'); [[7, 2], [12, 7], [7, 12], [2, 7]].forEach(([x, y]) => p.px(x, y, Q.d)); });
D('x_cuadro_gato', 16, 14, p => { rr(p, 0, 0, 16, 14, W.l); p.r(2, 2, 12, 10, Q.h); p.e(8, 9, 4, 3, '#4a4a6a'); p.map(5, 4, ['k....k', 'kk..kk'].map(r => r.replace(/k/g, 'N'))); p.e(8, 7, 3.4, 2.6, '#4a4a6a'); p.px(7, 7, Y.l); p.px(9, 7, Y.l); });
D('x_cuadro_arcoiris', 16, 14, p => { rr(p, 0, 0, 16, 14, '#ffffff'); p.r(2, 2, 12, 10, SK.l); ['#f7a8c0', '#fff09a', '#bfe6c9', '#a9d3ef'].forEach((c, i) => p.e(8, 12, 6 - i * 1.2, 7 - i * 1.4, c, (x, y) => y < 12)); p.e(8, 12, 1.2, 1.2, SK.l); });
D('x_ventana_redonda', 20, 20, p => { p.e(10, 10, 9.5, 9.5, W.l); p.e(10, 10, 8, 8, SK.l); p.r(9, 2, 2, 16, W.l); p.r(2, 9, 16, 2, W.l); p.e(6, 6, 1.6, 1, '#ffffff'); p.e(14, 14, 1.6, 1, LF.l); });
D('x_ventana_lila', 22, 20, p => { rr(p, 2, 2, 18, 16, W.l); p.r(4, 4, 14, 12, SK.l); p.r(4, 4, 14, 4, '#eef8ff'); p.r(10, 4, 2, 12, W.l); p.r(4, 9, 14, 1, W.l); p.r(0, 0, 22, 3, L.l); p.r(0, 0, 22, 1, L.m); p.r(0, 3, 5, 14, L.l); p.r(17, 3, 5, 14, L.l); p.r(1, 3, 1, 14, L.h); p.r(20, 3, 1, 14, L.h); p.r(0, 10, 5, 2, Y.m); p.r(17, 10, 5, 2, Y.m); p.r(1, 18, 20, 2, W.m); });
D('x_pizarra', 20, 16, p => { rr(p, 0, 0, 20, 14, W.m); p.r(2, 2, 16, 10, '#4f6e5a'); p.line(4, 5, 9, 5, '#ffffff'); p.line(4, 8, 12, 8, '#ffffff'); p.e(14, 6, 1.6, 1.6, Q.l); p.r(1, 14, 18, 2, W.d); p.r(5, 14, 3, 1, '#ffffff'); });
D('x_repisa_tazas', 26, 12, p => { p.r(0, 8, 26, 3, '#ffffff'); p.r(0, 8, 26, 1, CR.l); p.r(2, 11, 2, 1, CR.d); p.r(22, 11, 2, 1, CR.d); [[2, Q.m], [8, MT.m], [14, Y.m], [20, L.m]].forEach(([x, c]) => { rr(p, x, 3, 4, 5, c); p.px(x + 4, 4, c); p.px(x + 4, 6, c); p.px(x + 1, 4, '#ffffff'); }); });
D('x_cortina_estrellas', 30, 22, p => { for (let i = 0; i < 7; i++) { const x = 2 + i * 4; p.r(x, 0, 1, 8 + (i % 3) * 4, '#c4b8ad'); p.map(x - 2, 6 + (i % 3) * 4, ['..y..', '.yyy.', 'yyyyy', '.y.y.']); } p.r(0, 0, 30, 1, W.d); });
D('x_poster', 14, 18, p => { rr(p, 0, 0, 14, 18, '#ffffff'); p.r(1, 1, 12, 16, '#ffd6e4'); p.e(7, 8, 4, 4, Q.m); p.e(7, 7, 3, 2.6, '#ffffff'); p.px(6, 7, '#4a3030'); p.px(8, 7, '#4a3030'); p.r(3, 13, 8, 1, Q.d); p.r(4, 15, 6, 1, Q.m); p.px(2, 0, '#e0577f'); p.px(11, 0, '#e0577f'); });

const LIGHT = (x, y, r) => [x, y, r];
Object.assign(A.FURN, {
  cama_dosel: { name: 'Cama con dosel', w: 30, h: 40, price: 80, x: 6, y: 24, cat: 'camas', bed: true },
  futon: { name: 'Futón menta', w: 30, h: 22, price: 35, x: 10, y: 50, cat: 'camas', bed: true },
  sofa_lila: { name: 'Sofá lila', w: 32, h: 20, price: 35, x: 56, y: 74, cat: 'camas', seat: [8, 4] },
  mecedora: { name: 'Mecedora', w: 18, h: 22, price: 25, x: 110, y: 56, cat: 'camas', seat: [0, 2] },
  silla_huevo: { name: 'Silla colgante', w: 22, h: 30, price: 45, x: 116, y: 36, cat: 'camas', seat: [0, 4] },
  banco: { name: 'Banquito', w: 30, h: 14, price: 15, x: 56, y: 100, cat: 'camas', seat: [4, 0] },
  puff_nube: { name: 'Puff de nube', w: 20, h: 14, price: 20, x: 80, y: 100, cat: 'camas', seat: [0, -2] },
  cojin_estrella: { name: 'Cojín estrella', w: 16, h: 16, price: 12, x: 30, y: 104, cat: 'camas', seat: [0, -4] },
  escritorio: { name: 'Escritorio con compu', w: 30, h: 24, price: 40, x: 100, y: 30, cat: 'mesas' },
  ropero: { name: 'Ropero', w: 26, h: 34, price: 40, x: 110, y: 2, cat: 'mesas' },
  vitrina: { name: 'Vitrina de tazas', w: 22, h: 30, price: 35, x: 4, y: 4, cat: 'mesas' },
  refri: { name: 'Refri retro', w: 18, h: 32, price: 40, x: 4, y: 4, cat: 'mesas' },
  fregadero: { name: 'Fregadero', w: 24, h: 22, price: 30, x: 24, y: 12, cat: 'mesas' },
  carrito: { name: 'Carrito de postres', w: 22, h: 24, price: 30, x: 40, y: 60, cat: 'mesas', table: true },
  tocadiscos: { name: 'Tocadiscos', w: 18, h: 18, price: 30, x: 96, y: 40, cat: 'mesas', piano: true },
  tele: { name: 'Tele retro', w: 22, h: 22, price: 35, x: 60, y: 30, cat: 'mesas' },
  pecera: { name: 'Pecera', w: 20, h: 18, price: 30, x: 120, y: 60, cat: 'mesas' },
  jaula: { name: 'Pajarito', w: 16, h: 26, price: 30, x: 126, y: 30, cat: 'deco' },
  espejo_pie: { name: 'Espejo de pie', w: 14, h: 30, price: 25, x: 2, y: 40, cat: 'mesas' },
  perchero: { name: 'Perchero', w: 14, h: 30, price: 20, x: 128, y: 40, cat: 'mesas' },
  baul: { name: 'Baúl', w: 20, h: 14, price: 20, x: 116, y: 110, cat: 'mesas' },
  cajonera: { name: 'Cajonera pastel', w: 18, h: 20, price: 25, x: 40, y: 14, cat: 'mesas' },
  mesa_lila: { name: 'Mesita lila', w: 20, h: 18, price: 25, x: 70, y: 84, cat: 'mesas', table: true },
  frutero: { name: 'Frutero', w: 14, h: 12, price: 10, x: 90, y: 100, cat: 'deco' },
  tetera: { name: 'Tetera', w: 14, h: 12, price: 10, x: 70, y: 100, cat: 'deco' },
  alfombra_corazon: { name: 'Alfombra corazón', w: 26, h: 22, price: 25, x: 60, y: 76, flat: true, cat: 'alfombras' },
  alfombra_fresa: { name: 'Alfombra fresa', w: 26, h: 24, price: 25, x: 50, y: 90, flat: true, cat: 'alfombras' },
  alfombra_arcoiris: { name: 'Alfombra arcoíris', w: 34, h: 20, price: 25, x: 54, y: 66, flat: true, cat: 'alfombras' },
  alfombra_luna: { name: 'Alfombra luna', w: 28, h: 24, price: 25, x: 58, y: 80, flat: true, cat: 'alfombras' },
  alfombra_limon: { name: 'Alfombra limón', w: 26, h: 24, price: 20, x: 90, y: 90, flat: true, cat: 'alfombras' },
  tapete_nube: { name: 'Tapete de nube', w: 30, h: 18, price: 20, x: 20, y: 90, flat: true, cat: 'alfombras' },
  girasol: { name: 'Girasol', w: 14, h: 26, price: 15, x: 130, y: 70, cat: 'deco' },
  cactus: { name: 'Cactus con flor', w: 12, h: 18, price: 10, x: 132, y: 100, cat: 'deco' },
  monstera: { name: 'Monstera', w: 22, h: 28, price: 25, x: 120, y: 90, cat: 'deco' },
  tulipanes: { name: 'Tulipanes', w: 14, h: 20, price: 15, x: 4, y: 100, cat: 'deco' },
  vela: { name: 'Vela aromática', w: 8, h: 12, price: 8, x: 46, y: 100, cat: 'luces', glow: LIGHT(4, 2, 12) },
  libros: { name: 'Pila de libros', w: 14, h: 12, price: 10, x: 30, y: 60, cat: 'deco' },
  globo: { name: 'Globo terráqueo', w: 12, h: 16, price: 15, x: 104, y: 30, cat: 'deco' },
  oso: { name: 'Osito de peluche', w: 16, h: 18, price: 15, x: 20, y: 100, cat: 'deco' },
  pollito: { name: 'Pollito de peluche', w: 12, h: 12, price: 12, x: 100, y: 104, cat: 'deco' },
  pinguino: { name: 'Pingüino de peluche', w: 12, h: 14, price: 12, x: 110, y: 104, cat: 'deco' },
  osito_gigante: { name: 'Osito gigante', w: 26, h: 28, price: 50, x: 4, y: 56, cat: 'deco' },
  caballete: { name: 'Caballete con pintura', w: 20, h: 28, price: 30, x: 120, y: 60, cat: 'deco' },
  cesta: { name: 'Cesta de picnic', w: 16, h: 12, price: 12, x: 80, y: 110, cat: 'deco' },
  maleta: { name: 'Maleta de viaje', w: 16, h: 14, price: 15, x: 126, y: 104, cat: 'deco' },
  guitarra: { name: 'Guitarra', w: 12, h: 26, price: 30, x: 132, y: 56, cat: 'deco' },
  hongos: { name: 'Hongos de adorno', w: 14, h: 12, price: 8, x: 6, y: 112, cat: 'deco' },
  lampara_luna: { name: 'Lámpara de luna', w: 14, h: 16, price: 20, x: 36, y: 40, cat: 'luces', glow: LIGHT(7, 7, 20) },
  lampara_estrella: { name: 'Lámpara de estrella', w: 12, h: 22, price: 20, x: 2, y: 34, cat: 'luces', glow: LIGHT(6, 3, 20) },
  farol: { name: 'Farol', w: 10, h: 16, price: 15, x: 132, y: 40, cat: 'luces', glow: LIGHT(5, 8, 18) },
  lava: { name: 'Lámpara de lava', w: 10, h: 20, price: 20, x: 96, y: 40, cat: 'luces', glow: LIGHT(5, 8, 18) },
  repisa_plantas: { name: 'Repisa con plantitas', w: 30, h: 14, price: 25, x: 6, y: 4, wall: true, cat: 'pared' },
  banderines: { name: 'Banderines', w: 44, h: 10, price: 15, x: 50, y: 0, wall: true, cat: 'pared' },
  enredadera: { name: 'Enredadera con flores', w: 40, h: 14, price: 20, x: 52, y: 0, wall: true, cat: 'pared' },
  espejo_redondo: { name: 'Espejo redondo', w: 16, h: 16, price: 20, x: 40, y: 4, wall: true, cat: 'pared' },
  reloj_pared: { name: 'Reloj de pared', w: 14, h: 14, price: 15, x: 110, y: 4, wall: true, cat: 'pared' },
  cuadro_gato: { name: 'Cuadro de gatito', w: 16, h: 14, price: 15, x: 20, y: 6, wall: true, cat: 'pared' },
  cuadro_arcoiris: { name: 'Cuadro arcoíris', w: 16, h: 14, price: 15, x: 120, y: 6, wall: true, cat: 'pared' },
  ventana_redonda: { name: 'Ventana redonda', w: 20, h: 20, price: 25, x: 60, y: 4, wall: true, cat: 'pared' },
  ventana_lila: { name: 'Ventana con cortina lila', w: 22, h: 20, price: 25, x: 90, y: 4, wall: true, cat: 'pared' },
  pizarra: { name: 'Pizarrita', w: 20, h: 16, price: 15, x: 30, y: 6, wall: true, cat: 'pared' },
  repisa_tazas: { name: 'Repisa de tazas', w: 26, h: 12, price: 20, x: 80, y: 8, wall: true, cat: 'pared' },
  cortina_estrellas: { name: 'Cortina de estrellas', w: 30, h: 22, price: 25, x: 100, y: 0, wall: true, cat: 'pared' },
  poster: { name: 'Póster de mochi', w: 14, h: 18, price: 12, x: 70, y: 6, wall: true, cat: 'pared' }
});
// la ventana lila también se ve de noche
Pix.define('x_ventana_lila_noche', { w: 22, h: 20, fn(p) { rr(p, 2, 2, 18, 16, W.l); p.r(4, 4, 14, 12, '#3d3a8c'); p.r(10, 4, 2, 12, W.l); p.r(4, 9, 14, 1, W.l); p.e(14, 6.5, 1.6, 1.6, '#fff09a'); p.px(7, 6, '#ffffff'); p.r(0, 0, 22, 3, L.l); p.r(0, 0, 22, 1, L.m); p.r(0, 3, 5, 14, L.l); p.r(17, 3, 5, 14, L.l); p.r(0, 10, 5, 2, Y.m); p.r(17, 10, 5, 2, Y.m); p.r(1, 18, 20, 2, W.m); } });
Pix.define('x_ventana_redonda_noche', { w: 20, h: 20, fn(p) { p.e(10, 10, 9.5, 9.5, W.l); p.e(10, 10, 8, 8, '#3d3a8c'); p.r(9, 2, 2, 16, W.l); p.r(2, 9, 16, 2, W.l); p.e(14, 6, 1.6, 1.6, '#fff09a'); p.px(5, 13, '#ffffff'); } });

// panqueques para la despensa (salen en la Torre de pancakes)
Pix.define('panqueque', { w: 16, h: 16, fn(p) { [12, 9, 6].forEach(y => { p.e(8, y, 6.5, 2, 'A'); p.e(8, y - .5, 6, 1.4, 'a'); }); p.r(6, 3, 4, 2, 'y'); p.r(6, 3, 4, 1, 'w'); p.r(4, 6, 1, 3, 'A'); p.r(11, 7, 1, 4, 'A'); } });
Pix.define('i_mantequilla', { w: 16, h: 16, fn(p) { p.r(1, 11, 14, 3, 'w'); p.r(2, 13, 12, 1, 'C'); p.r(4, 6, 8, 5, 'y'); p.r(4, 6, 8, 1, 'w'); p.r(11, 7, 1, 4, 'Y'); } });
A.FOODS.panqueque = A.FOODS.panqueque || { name: 'Pancakes', art: 'unos pancakes', gain: 35, price: 5 };
// ================= ROPA Y ACCESORIOS =================
// Mapas con los colores de Bolsillito; cabeza (head), cara (face) y cuello (neck).
const MORE = {
  gorro_lana: { slot: 'head', name: 'Gorro de lana', price: 20, map: ['....ww....', '...wwww...', '..PPPPPP..', '.PpPpPpPP.', 'PPPPPPPPPP', 'wwwwwwwwww'] },
  orejas_oso: { slot: 'head', name: 'Orejitas de oso', price: 20, map: ['nn......nn', 'npn....npn', 'nnn....nnn'] },
  paja: { slot: 'head', name: 'Sombrero de paja', price: 25, map: ['...CCCC.PP.', '..CCCCCPRP.', '..aaaaaaPP.', 'CCCCCCCCCCC', '.CCCCCCCCC.'] },
  margaritas: { slot: 'head', name: 'Corona de margaritas', price: 20, map: ['w.w.w.w.w.w', 'wyw.wyw.wyw', 'GwGGGwGGGwG'] },
  boina_lila: { slot: 'head', name: 'Boina lila', price: 15, map: ['....q....', '.hhhhhhh.', 'hhhhhhhhh', 'hHhhhhhhh'] },
  rana: { slot: 'head', name: 'Gorro de ranita', price: 30, map: ['.GG....GG.', 'GwkG..GkwG', 'GGGGGGGGGG', 'GgggggggGG', 'GGGGGGGGGG'] },
  pollito_gorro: { slot: 'head', name: 'Gorro de pollito', price: 30, map: ['....yy....', '...yyyy...', '.yyyyyyyy.', 'yykyyyykyy', 'yyyyaayyyy', 'yyyyyyyyyy'] },
  tiara: { slot: 'head', name: 'Tiara', price: 30, map: ['....P....', '..y.y.y..', '.yyyyyyy.', 'yYbYYYbYy'] },
  vaquero: { slot: 'head', name: 'Sombrero vaquero', price: 30, map: ['...nnnnn...', '..nnnnnnn..', '..NNNNNNN..', 'nn.nnnnn.nn', '.nnnnnnnnn.'] },
  fresa_pinza: { slot: 'head', name: 'Pinza de fresa', price: 10, side: true, map: ['.GG.', 'RRRR', 'RyRR', '.RR.'] },
  lazo_lila: { slot: 'head', name: 'Lazo grande lila', price: 15, map: ['hhh....hhh', 'hHhh..hhHh', 'hhhhqqhhhh', 'hHhh..hhHh', 'hhh....hhh'] },
  flor_oreja: { slot: 'head', name: 'Flor en la oreja', price: 10, side: true, map: ['.PP.', 'PyyP', '.PPG', '...G'] },
  audifonos: { slot: 'head', name: 'Audífonos', price: 25, lift: 1, map: ['...PPPPP...', '..P.....P..', '.P.......P.', 'pP.......Pp', 'pP.......Pp'] },
  gorro_dormir: { slot: 'head', name: 'Gorro de dormir', price: 15, map: ['........w', '.......bb', '.....bbb.', '...bbBbb.', '.bbbbbbb.', 'wwwwwwww.'] },
  mago: { slot: 'head', name: 'Sombrero de mago', price: 35, map: ['....V....', '...VyV...', '...VVV...', '..VVyVV..', '..VVVVV..', 'VVVVVVVVV'] },
  panda: { slot: 'head', name: 'Orejitas de panda', price: 20, map: ['NN......NN', 'NNN....NNN', '.N......N.'] },
  hojas: { slot: 'head', name: 'Corona de hojas', price: 15, map: ['.G.g.G.g.G.', 'GgGGgGGgGGg', 'DDDDDDDDDDD'] },
  cerezas: { slot: 'head', name: 'Moño de cerezas', price: 15, side: true, map: ['..GG', '.G.G', 'R..R', 'RR.RR'] },
  coletas: { slot: 'head', name: 'Liguitas de colores', price: 10, map: ['P........b', 'PP......bb', '.P......b.'] },
  chupete_c: { slot: 'face', name: 'Rubor de corazones', price: 10, map: ['P.P.....P.P', 'PPP.....PPP', '.P.......P.'] },
  antifaz: { slot: 'face', name: 'Antifaz de dormir', price: 15, map: ['ppppppppp', 'pPPpppPPp', 'ppppppppp'] },
  lentes_estrella: { slot: 'face', name: 'Lentes de estrella', price: 20, map: ['.y...y.', 'yyykyyy', '.y...y.'] },
  lentes_gato: { slot: 'face', name: 'Lentes de gatito', price: 20, map: ['N.....N', 'NN.k.NN', 'NNN.NNN'] },
  bigote: { slot: 'face', name: 'Bigotito', price: 10, map: ['NN.NN', '.NNN.'] },
  monoculo: { slot: 'face', name: 'Monóculo', price: 15, map: ['.....yyy', '.....ylY', '.....yyy', '......y.'] },
  lei: { slot: 'neck', name: 'Collar de flores', price: 20, map: ['P.y.P.y.P.y.', '.P.b.P.b.P..', '..w.P.y.w...'] },
  corbata_moño: { slot: 'neck', name: 'Moño rojo', price: 10, map: ['RR.RR', 'RRwRR', 'RR.RR'] },
  cascabel: { slot: 'neck', name: 'Cascabel', price: 15, map: ['RRRRRRRRRR', '....yy....', '....YY....'] },
  pañuelo_v: { slot: 'neck', name: 'Pañuelo vaquero', price: 15, map: ['BBBBBBBBBB', '.BwBBBwBB.', '..BBwBBB..', '...BBBB...'] },
  corazon_collar: { slot: 'neck', name: 'Collar de corazón', price: 20, map: ['y........y', '.y......y.', '..yyRRyy..', '....RR....'] },
  bufanda_rosa: { slot: 'neck', name: 'Bufanda rosa larga', price: 20, map: ['PPPPPPPPPPPP', 'PpPpPpPpPpPp', '.........PP.', '.........Pp.', '.........PP.'] },
  marinero: { slot: 'neck', name: 'Cuello de marinero', price: 20, map: ['VVVVVVVVVV', 'VwVVRRVVwV', '.VVVRRVVV.'] },
  babero: { slot: 'neck', name: 'Babero', price: 10, map: ['.pppppp.', 'pPppppPp', '.pppppp.', '..pppp..'] },
  medalla: { slot: 'neck', name: 'Medalla de oro', price: 25, map: ['B......B', '.B....B.', '..BYYB..', '...yy...'] }
};
Object.entries(MORE).forEach(([id, a]) => { a.w = a.map[0].length + 2; a.h = a.map.length + 2; A.ACC[id] = a; Pix.define('acc_' + id, { w: a.w, h: a.h, fn(p) { p.map(1, 1, a.map); } }); });
})();
