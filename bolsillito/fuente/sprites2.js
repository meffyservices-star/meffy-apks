// ===== Bolsillito · Sprites nuevos (comida, muebles, juegos, regalo, jardín). Se cargan antes de las partes 2 y 3 =====
(function () {
const D = (name, fn, w, h) => Pix.define(name, w ? { w, h, fn } : fn);
D('galleta', p => { p.e(8, 8, 6, 6, 'a'); p.e(8, 8, 5, 5, 'o'); p.px(6, 6, 'N'); p.px(10, 7, 'N'); p.px(7, 10, 'N'); p.px(10, 10, 'N'); p.px(5, 8, 'N'); });
D('fresa', p => { p.e(8, 9.5, 5, 5.2, 'R'); p.e(8, 8.5, 4.2, 4, 'P'); p.map(5, 2, ['.G.G..', 'GGGGG.', '.GGG..']); p.px(6, 8, 'y'); p.px(9, 9, 'y'); p.px(7, 11, 'y'); p.px(10, 7, 'y'); p.px(6, 7, 'w'); });
D('dona', p => { p.e(8, 8, 6.5, 5.5, 'a'); p.e(8, 7.4, 6, 4.6, 'p'); p.e(8, 8, 2, 1.6, null); for (let j = 6; j < 10; j++) for (let i = 6; i < 10; i++) { const dx = i + .5 - 8, dy = j + .5 - 8; if (dx * dx / 4 + dy * dy / 2.6 <= 1) p.clear(i, j); } p.px(4, 6, 'y'); p.px(11, 5, 'b'); p.px(12, 8, 'y'); p.px(5, 9, 'b'); p.px(9, 4, 'w'); });
D('cupcake', p => { p.e(8, 6, 5, 3.6, 'p'); p.e(8, 4, 3, 2.4, 'p'); p.px(8, 1, 'R'); p.px(8, 2, 'R'); p.r(4, 8, 8, 6, 'l'); p.r(5, 8, 1, 6, 'L'); p.r(8, 8, 1, 6, 'L'); p.r(11, 8, 1, 6, 'L'); p.px(6, 4, 'w'); });
D('dango', p => { p.r(7, 1, 2, 15, 'C'); p.e(8, 4, 3, 2.6, 'p'); p.e(8, 8.5, 3, 2.6, 'w'); p.e(8, 13, 3, 2.6, 'g'); p.px(7, 3, 'w'); });
D('manzanita', p => { p.e(8, 9.5, 5.4, 5, 'R'); p.e(7.5, 9, 4.6, 4.2, 'P'); p.r(8, 2, 1, 3, 'N'); p.map(9, 2, ['GG.', 'GGG']); p.px(5, 7, 'w'); p.px(5, 8, 'w'); });
D('leche', p => { p.r(4, 5, 8, 10, 'w'); p.map(4, 2, ['..wwww..', '.wwwwww.', 'wwwwwwww']); p.r(4, 8, 8, 4, 'B'); p.e(8, 10, 1.4, 1.2, 'w'); });
D('plataforma', p => { p.r(1, 2, 22, 4, 'G'); p.r(1, 2, 22, 1, 'g'); p.px(4, 4, 'D'); p.px(10, 5, 'D'); p.px(17, 4, 'D'); }, 24, 8);
D('plataforma_rota', p => { p.r(1, 2, 9, 4, 'a'); p.r(13, 3, 9, 4, 'a'); p.r(1, 2, 9, 1, 'o'); p.r(13, 3, 9, 1, 'o'); p.px(10, 4, 'A'); p.px(12, 5, 'A'); }, 24, 8);
D('plataforma_nube', p => { p.e(12, 5, 10, 2.6, 'w'); p.e(7, 3.4, 3.4, 2.4, 'w'); p.e(15, 3, 4, 2.4, 'w'); p.px(6, 5, 'l'); p.px(17, 6, 'l'); }, 24, 8);
D('resorte', p => { p.r(4, 10, 8, 2, 'V'); p.line(5, 9, 10, 7, 'L'); p.line(10, 7, 5, 5, 'L'); p.line(5, 5, 10, 3, 'L'); p.r(4, 2, 8, 2, 'P'); });
D('regalo_cerrado', p => {
  p.r(3, 9, 18, 12, 'p'); p.r(2, 6, 20, 4, 'P'); p.r(10, 6, 4, 15, 'y'); p.r(10, 6, 4, 1, 'Y');
  p.map(5, 1, ['.yy.....yy.', 'yYyy...yyYy', '.yyyy.yyyy.', '...yyyyy...']);
  p.px(4, 11, 'w'); p.px(5, 10, 'w');
}, 24, 22);
D('regalo_abierto', p => {
  p.r(3, 13, 18, 9, 'p'); p.r(10, 13, 4, 9, 'y'); p.r(3, 13, 18, 1, 'R');
  p.map(0, 3, ['..PPPPPPPPPP', '.PPPPPPPPPP.', 'PPPPyyyyPP..', '..PPyyyyP...']);
  p.px(4, 15, 'w');
}, 24, 22);
D('destello', p => { p.r(7, 1, 2, 14, 'y'); p.r(1, 7, 14, 2, 'y'); p.r(7, 6, 2, 4, 'w'); p.r(6, 7, 4, 2, 'w'); p.px(4, 4, 'y'); p.px(11, 4, 'y'); p.px(4, 11, 'y'); p.px(11, 11, 'y'); });

// ---------- Jardín de hábitos ----------
D('semilla', p => { p.r(2, 11, 12, 3, 'N'); p.r(2, 11, 12, 1, 'n'); p.e(8, 10, 1.5, 1, 'a'); });
D('brotecito', p => { p.r(2, 11, 12, 3, 'N'); p.r(2, 11, 12, 1, 'n'); p.r(8, 7, 1, 4, 'G'); p.map(5, 5, ['gg..gg', '.gGGg.']); });
D('plantita', p => { p.r(2, 12, 12, 2, 'N'); p.r(2, 12, 12, 1, 'n'); p.r(8, 5, 1, 7, 'G'); p.e(5.5, 6, 2.4, 1.4, 'g'); p.e(10.8, 8, 2.4, 1.4, 'g'); p.e(6, 9.5, 2, 1.2, 'G'); p.e(8.5, 3.5, 1.6, 1.6, 'g'); });
D('florecida', p => { p.r(2, 13, 12, 2, 'N'); p.r(2, 13, 12, 1, 'n'); p.r(8, 7, 1, 6, 'G'); p.e(5.5, 10, 2.2, 1.3, 'g'); p.e(10.5, 9, 2.2, 1.3, 'g'); p.e(8.5, 4, 1.6, 1.6, 'y'); p.e(6, 4, 1.8, 1.8, 'p'); p.e(11, 4, 1.8, 1.8, 'p'); p.e(8.5, 1.6, 1.8, 1.4, 'p'); p.e(8.5, 6.4, 1.8, 1.4, 'p'); p.e(8.5, 4, 1.2, 1.2, 'y'); });
D('marchita', p => { p.r(2, 13, 12, 2, 'N'); p.r(2, 13, 12, 1, 'n'); p.line(8, 12, 8, 7, 'A'); p.line(8, 7, 11, 6, 'A'); p.e(11.5, 7, 1.6, 1.4, 'C'); p.e(5.5, 10, 2, 1.1, 'C'); });
D('girasol', p => { p.r(2, 13, 12, 2, 'N'); p.r(2, 13, 12, 1, 'n'); p.r(8, 7, 1, 6, 'G'); p.e(5.5, 10.5, 2.2, 1.2, 'G'); p.e(8.5, 4.5, 4, 4, 'Y'); p.e(8.5, 4.5, 3, 3, 'y'); p.e(8.5, 4.5, 1.8, 1.8, 'N'); });
D('regadera', p => { p.r(3, 6, 8, 7, 'L'); p.r(3, 6, 8, 1, 'l'); p.line(11, 8, 14, 5, 'L'); p.r(13, 3, 2, 2, 'V'); p.map(4, 2, ['.LLLL.', 'L....L']); p.px(5, 8, 'w'); });
D('mariposa', p => { p.e(5, 6, 3, 3, 'p'); p.e(11, 6, 3, 3, 'p'); p.e(5.5, 11, 2.2, 2, 'h'); p.e(10.5, 11, 2.2, 2, 'h'); p.r(8, 4, 1, 10, 'N'); p.px(7, 2, 'N'); p.px(9, 2, 'N'); p.px(4, 5, 'w'); });
D('alitas', p => { p.map(0, 0, ['ww......ww', 'wlw....wlw', 'wllw..wllw', '.wlw..wlw.']); }, 10, 4);
})();
(function () {
const D = (name, w, h, fn) => Pix.define(name, { w, h, fn });
const W = { d: '#7a4a2e', m: '#a8693f', l: '#c98a52', h: '#e3a96a' };              // madera
const Q = { d: '#d66d8c', m: '#f29bb3', l: '#ffc4d4', h: '#ffe3eb' };              // tela rosa
const CR = { d: '#d9bf98', m: '#f1dfc2', l: '#fff3df' };                             // crema
const G = { d: '#4f8a43', m: '#74ad5c', l: '#a3d07f', h: '#c9e8a6' };              // hojas
const T = { d: '#a2543a', m: '#c8714f', l: '#e3916b' };                              // barro
const B = { d: '#b07f2a', m: '#d9a441', l: '#f2cd73' };                              // bronce
const SK = { d: '#7fb2d6', m: '#a9d3ef', l: '#d8eefb', h: '#ffffff' };               // vidrio / cielo

D('x_cama', 34, 26, p => {
  // cabecera redondeada con postes
  p.r(1, 4, 4, 21, W.m); p.r(1, 4, 1, 21, W.l); p.r(4, 4, 1, 21, W.d); p.e(3, 3.5, 2.2, 2, W.l);
  p.e(9.5, 7, 6, 4.5, W.m); p.r(5, 7, 10, 8, W.m); p.r(5, 6, 9, 1, W.l); p.r(6, 9, 8, 1, W.d);
  // colchón y sábana
  p.r(5, 14, 26, 6, CR.l); p.r(5, 18, 26, 2, CR.m);
  // almohada
  p.e(10, 13.5, 4.6, 2.6, '#ffffff'); p.r(7, 14, 7, 1, CR.m);
  // cobija con cuadritos
  for (let y = 14; y < 21; y++) for (let x = 15; x < 31; x++) p.px(x, y, ((x >> 1) + (y >> 1)) % 2 ? Q.m : Q.l);
  p.r(15, 14, 16, 1, Q.h); p.r(15, 20, 16, 1, Q.d); p.r(15, 15, 1, 6, Q.d);
  // patas y pie de cama
  p.r(30, 12, 3, 13, W.m); p.r(30, 12, 1, 13, W.l); p.r(32, 12, 1, 13, W.d); p.e(31.5, 11.5, 1.8, 1.5, W.l);
  p.r(5, 21, 26, 2, W.m); p.r(5, 21, 26, 1, W.l); p.r(5, 23, 26, 1, W.d);
});

D('x_alfombra', 44, 18, p => {
  p.e(22, 9, 21, 8, Q.d); p.e(22, 9, 19.5, 6.8, Q.m); p.e(22, 9, 15, 5, CR.l); p.e(22, 9, 11, 3.4, Q.l); p.e(22, 9, 6, 1.6, Q.m);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; p.px(Math.round(22 + Math.cos(a) * 17), Math.round(9 + Math.sin(a) * 6), CR.l); }
  p.px(1, 8, CR.m); p.px(0, 9, CR.m); p.px(43, 8, CR.m); p.px(42, 10, CR.m);
});

D('x_lampara', 16, 36, p => {
  // pantalla de tela con borde ondulado
  // pintar con colores reales
  const shade = { l: CR.l, h: '#ffffff', m: CR.m, d: CR.d };
  ['....llllll....', '...lhhhlllm...', '..lhhllllllm..', '.lhllllllllmm.', 'lhlllllllllmmd', 'lllllllllllmmd', 'm.m.m.m.m.m.md'].forEach((row, j) => [...row].forEach((c, i) => { if (c !== '.') p.px(2 + i, 1 + j, shade[c]); }));
  // foco cálido
  p.r(7, 8, 2, 1, '#ffe08a');
  // poste de bronce
  p.r(7, 9, 2, 22, B.m); p.r(7, 9, 1, 22, B.l); p.r(9, 9, 0, 22, B.d);
  p.r(6, 18, 4, 2, B.m); p.r(6, 18, 4, 1, B.l);
  // base
  p.e(8, 33, 5.5, 2.2, B.d); p.e(8, 32.5, 5, 1.8, B.m); p.r(5, 31, 6, 1, B.l);
});

D('x_lampara_mesa', 16, 18, p => {
  ['...hhhhhh...', '..hllllllm..', '.hlllllllmm.', 'llllllllllmd', 'm.m.m.m.m.md'].forEach((row, j) => [...row].forEach((c, i) => { if (c !== '.') p.px(2 + i, 1 + j, { l: '#ffd9e3', h: '#fff0f4', m: Q.l, d: Q.m }[c]); }));
  p.r(7, 6, 2, 1, '#ffe08a');
  p.r(7, 6, 2, 5, B.m); p.r(7, 6, 1, 5, B.l);
  p.e(8, 13, 4.2, 3.2, T.m); p.e(7, 12, 2.6, 2, T.l); p.r(5, 15, 6, 1, T.d);
});

D('x_mesita', 18, 18, p => {
  p.r(1, 2, 16, 3, W.l); p.r(1, 2, 16, 1, W.h); p.r(1, 4, 16, 1, W.d);
  p.r(2, 5, 14, 9, W.m); p.r(2, 5, 1, 9, W.l); p.r(15, 5, 1, 9, W.d);
  p.r(4, 7, 10, 5, W.l); p.r(4, 11, 10, 1, W.d); p.r(8, 9, 2, 1, B.l);
  p.r(2, 14, 2, 3, W.d); p.r(14, 14, 2, 3, W.d);
});

D('x_estante', 30, 34, p => {
  p.r(1, 1, 28, 32, W.m); p.r(1, 1, 28, 2, W.l); p.r(1, 1, 1, 32, W.l); p.r(28, 1, 1, 32, W.d);
  [[3, 4], [3, 14], [3, 24]].forEach(([x, y]) => { p.r(x, y, 24, 8, W.d); p.r(x, y + 8, 24, 2, W.l); });
  // libros fila 1
  const books = [[4, Q.m, 7], [6, '#9fc3e6', 6], [8, CR.m, 7], [10, '#b49ad8', 5], [12, G.l, 7], [14, '#f2c46b', 6]];
  books.forEach(([x, c, h]) => { p.r(x, 12 - h, 2, h, c); p.px(x, 12 - h, '#ffffff'); });
  // frasco de estrellitas
  p.r(19, 6, 6, 6, SK.l); p.r(19, 5, 6, 1, W.l); p.px(20, 8, '#f2cd73'); p.px(22, 10, Q.m); p.px(23, 7, '#f2cd73'); p.px(19, 7, '#ffffff');
  // fila 2: plantita colgante y caja
  p.r(5, 18, 7, 4, T.m); p.r(5, 18, 7, 1, T.l); p.e(8.5, 17, 4, 2, G.m); p.px(5, 22, G.m); p.px(4, 23, G.l); p.px(11, 22, G.m); p.px(12, 24, G.l);
  p.r(16, 17, 9, 5, Q.l); p.r(16, 17, 9, 1, Q.h); p.r(19, 19, 3, 1, Q.d);
  // fila 3: tazas
  p.r(5, 28, 4, 4, '#ffffff'); p.r(9, 29, 1, 2, '#ffffff'); p.r(5, 29, 4, 1, Q.l);
  p.r(12, 28, 4, 4, '#cfe8f7'); p.r(16, 29, 1, 2, '#cfe8f7');
  p.r(19, 27, 6, 5, '#f2cd73'); p.r(19, 27, 6, 1, '#fff09a');
});

D('x_ventana', 34, 32, p => {
  // marco y vidrio
  p.r(5, 2, 24, 22, CR.m); p.r(7, 4, 20, 18, SK.m);
  p.r(7, 4, 20, 6, SK.l); p.r(7, 4, 20, 2, SK.h);
  p.e(11, 8, 3, 1.4, '#ffffff'); p.e(22, 12, 4, 1.4, '#ffffff');
  p.r(16, 4, 2, 18, CR.l); p.r(7, 12, 20, 2, CR.l);
  p.line(9, 20, 13, 16, '#ffffff'); p.line(19, 20, 23, 16, SK.h);
  // cortinas
  for (let y = 1; y < 27; y++) { const w = y < 3 ? 6 : Math.max(3, 7 - Math.floor((y - 3) / 6)); p.r(1, y, w, 1, y % 4 < 2 ? Q.l : Q.m); p.r(33 - w, y, w, 1, y % 4 < 2 ? Q.l : Q.m); }
  p.r(0, 0, 34, 2, W.m); p.r(0, 0, 34, 1, W.l);
  // repisa con macetita
  p.r(3, 24, 28, 2, W.l); p.r(3, 26, 28, 1, W.d);
  p.r(14, 20, 5, 4, T.m); p.r(14, 20, 5, 1, T.l); p.e(16.5, 19, 2.5, 1.6, G.m); p.px(15, 17, Q.m); p.px(18, 17, '#f2cd73'); p.px(16, 16, Q.l);
});

D('x_cuadro', 20, 16, p => {
  p.r(1, 1, 18, 14, B.m); p.r(1, 1, 18, 1, B.l); p.r(1, 14, 18, 1, B.d);
  p.r(3, 3, 14, 10, SK.l); p.r(3, 9, 14, 4, G.l); p.e(8, 10, 5, 2.4, G.m); p.e(14, 10.5, 4, 2, G.l); p.e(13, 5, 1.6, 1.6, '#fff09a'); p.px(6, 5, '#ffffff'); p.px(7, 5, '#ffffff');
});

D('x_planta', 22, 30, p => {
  // hojas grandes
  [[11, 9, 7, 6, G.m], [6, 12, 5, 4, G.m], [16, 12, 5, 4, G.m], [11, 5, 4, 4, G.l], [5, 7, 3, 3, G.l], [17, 6, 3, 3, G.l]].forEach(([x, y, rx, ry, c]) => p.e(x, y, rx, ry, c));
  p.e(9, 7, 2, 1.4, G.h); p.e(14, 10, 2, 1.2, G.h); p.line(11, 18, 11, 8, G.d); p.line(11, 15, 6, 11, G.d); p.line(11, 14, 16, 11, G.d);
  // maceta
  p.r(5, 18, 12, 3, T.l); p.r(5, 18, 12, 1, '#f2b08e'); p.r(6, 21, 10, 7, T.m); p.r(6, 21, 2, 7, T.l); p.r(14, 21, 2, 7, T.d);
  p.r(8, 23, 6, 1, '#f2b08e');
});

D('x_mesa', 28, 24, p => {
  // mesa redonda
  p.e(14, 9, 13, 4.5, W.l); p.e(14, 8.5, 12, 3.6, W.h); p.e(14, 9, 9, 2.4, W.l);
  p.r(12, 12, 4, 10, W.m); p.r(12, 12, 1, 10, W.l); p.e(14, 22, 6, 1.6, W.d);
  // mantelito
  p.e(14, 8.5, 6, 2, '#ffffff'); p.px(8, 9, Q.l); p.px(20, 9, Q.l);
  // tetera y taza
  p.e(12, 5, 3.4, 3, '#ffffff'); p.r(10, 2, 4, 1, Q.m); p.px(12, 1, Q.m); p.line(15, 5, 17, 3, '#ffffff'); p.px(9, 5, '#ffffff'); p.px(11, 5, Q.l); p.px(13, 6, Q.l);
  p.r(18, 5, 3, 3, Q.l); p.px(21, 6, Q.l);
});

D('x_cojin', 18, 12, p => { p.e(9, 7, 8, 4.4, Q.m); p.e(9, 6.4, 7, 3.4, Q.l); p.e(7, 5, 2, 1, Q.h); p.px(9, 7, Q.d); p.px(0, 4, Q.m); p.px(17, 4, Q.m); });

D('x_luces', 60, 10, p => {
  for (let x = 0; x < 60; x++) p.px(x, Math.round(2 + Math.sin(x / 60 * Math.PI) * 4), '#8a5a3c');
  const cs = ['#ffe08a', '#ffc4d4', '#cdeefc', '#d3eaa8', '#ffe08a', '#e6d4ff'];
  for (let i = 0; i < 10; i++) { const x = 3 + i * 6, y = Math.round(2 + Math.sin(x / 60 * Math.PI) * 4) + 1; p.r(x, y, 2, 3, cs[i % cs.length]); p.px(x, y, '#ffffff'); }
});

D('x_reloj', 14, 18, p => { p.r(3, 1, 8, 16, W.m); p.r(3, 1, 8, 1, W.l); p.e(7, 6, 3.4, 3.4, CR.l); p.px(7, 4, W.d); p.px(7, 5, W.d); p.px(8, 6, W.d); p.r(6, 11, 2, 4, B.m); p.e(7, 15, 1.4, 1.2, B.l); });

// ----- Paredes y pisos del cuarto (se combinan) -----
const WALLS = {
  rosa: (p, x, y) => { const v = (x % 10 < 5) ? '#fbe3e3' : '#f7d6d8'; p.px(x, y, v); },
  menta: (p, x, y) => p.px(x, y, (x % 12 < 6) ? '#e3f4ea' : '#d4eedf'),
  lila: (p, x, y) => p.px(x, y, ((x + (Math.floor(y / 8) % 2) * 4) % 8 === 0 && y % 8 === 3) ? '#fff7ff' : '#ece0fb'),
  durazno: (p, x, y) => p.px(x, y, ((Math.floor(x / 6) + Math.floor(y / 6)) % 2) ? '#ffe3cf' : '#ffd6bd'),
  cielo: (p, x, y) => p.px(x, y, y < 30 ? '#d8eefb' : '#e6f4fd')
};
const WALL_DECO = {
  rosa: p => { for (let y = 4; y < 52; y += 10) for (let x = (y / 10 % 2 ? 7 : 2); x < 120; x += 10) { p.px(x, y, '#f6b8c8'); p.px(x - 1, y, '#fff3f3'); p.px(x + 1, y, '#fff3f3'); p.px(x, y - 1, '#fff3f3'); p.px(x, y + 1, '#fff3f3'); } },
  menta: p => { for (let y = 6; y < 52; y += 12) for (let x = 3; x < 120; x += 12) { p.px(x, y, '#ffffff'); p.px(x + 1, y + 1, '#b9e2c9'); } },
  lila: () => {},
  durazno: p => { for (let y = 2; y < 52; y += 12) for (let x = 2; x < 120; x += 12) { p.px(x, y, '#f7a8a0'); p.px(x + 1, y, '#f7a8a0'); p.px(x, y + 1, '#f7a8a0'); p.px(x + 1, y + 1, '#f7a8a0'); } },
  cielo: p => { [[14, 10], [52, 6], [88, 14], [108, 4]].forEach(([cx, cy]) => { p.e(cx, cy, 8, 2.6, '#ffffff'); p.e(cx - 4, cy - 1.5, 3.5, 2.4, '#ffffff'); p.e(cx + 3, cy - 2, 4, 2.6, '#ffffff'); }); for (let i = 0; i < 18; i++) p.px((i * 37) % 118 + 1, 24 + (i * 13) % 26, '#ffffff'); }
};
Object.keys(WALLS).forEach(k => Pix.define('x_pared_' + k, { w: 120, h: 62, flat: true, fn(p) {
  for (let y = 0; y < 54; y++) for (let x = 0; x < 120; x++) WALLS[k](p, x, y);
  WALL_DECO[k](p);
  p.r(0, 54, 120, 8, '#c98a52'); p.r(0, 54, 120, 1, '#e3a96a'); p.r(0, 61, 120, 1, '#7a4a2e');
  for (let x = 4; x < 120; x += 12) { p.r(x, 56, 8, 4, '#b9794a'); p.r(x, 56, 8, 1, '#a8693f'); }
} }));
const FLOORS = {
  madera: (x, y) => { const row = Math.floor(y / 6); const off = (row % 2) * 9; const seam = (x + off) % 18 === 0 || y % 6 === 0; return seam ? '#9a5f36' : (y % 6 === 1 ? '#d29a63' : ((x + off) % 18 < 9 ? '#c4864f' : '#bd7f49')); },
  cuadros: (x, y) => ((Math.floor(x / 8) + Math.floor(y / 6)) % 2) ? '#fff3df' : '#ffc4d4',
  alfombra: (x, y) => ((x + y * 3) % 11 === 0) ? '#d0bbf2' : '#e6d8f8',
  piedra: (x, y) => { const row = Math.floor(y / 7); const off = (row % 2) * 7; return ((x + off) % 14 === 0 || y % 7 === 0) ? '#b9b0a6' : ((x + y) % 5 ? '#e3ddd3' : '#d8d0c4'); },
  pasto: (x, y) => ((x * 7 + y * 13) % 9 === 0) ? '#a3d07f' : ((x * 3 + y) % 17 === 0 ? '#ffffff' : '#bfe39a')
};
Object.keys(FLOORS).forEach(k => Pix.define('x_piso_' + k, { w: 120, h: 42, flat: true, fn(p) {
  p.r(0, 0, 120, 2, '#7a4a2e');
  for (let y = 2; y < 42; y++) for (let x = 0; x < 120; x++) p.px(x, y, FLOORS[k](x, y - 2));
} }));
// ----- Muebles nuevos -----
D('x_piano', 30, 26, p => {
  p.r(2, 3, 26, 14, W.d); p.r(2, 3, 26, 2, W.m); p.r(3, 5, 24, 1, W.l);
  p.r(3, 12, 24, 4, '#ffffff'); for (let x = 4; x < 27; x += 3) p.r(x, 12, 1, 4, '#d9bf98');
  for (let x = 5; x < 27; x += 3) if (x % 9 !== 2) p.r(x, 12, 2, 2, '#4a3030');
  p.r(4, 17, 2, 8, W.d); p.r(24, 17, 2, 8, W.d); p.r(8, 7, 14, 4, CR.l); p.px(10, 8, Q.m); p.px(14, 9, Q.m); p.px(18, 8, Q.m);
});
D('x_hongo', 18, 22, p => {
  p.e(9, 7, 8, 6, '#e0577f'); p.e(9, 6, 7, 4.6, '#f27ea1'); p.r(1, 7, 16, 2, '#e0577f');
  p.e(5, 4, 1.6, 1.4, '#ffffff'); p.e(12, 3.5, 2, 1.6, '#ffffff'); p.e(9, 6.5, 1.2, 1, '#ffffff'); p.px(14, 6, '#ffffff');
  p.r(7, 9, 4, 10, CR.l); p.r(7, 9, 1, 10, CR.m); p.r(10, 9, 1, 10, CR.d); p.e(9, 9.5, 3, 1, '#fff09a');
  p.r(4, 19, 10, 2, W.m); p.r(4, 19, 10, 1, W.l);
});
D('x_calabaza', 18, 16, p => {
  p.r(8, 1, 2, 3, '#5f8f33'); p.px(10, 2, '#8cbf4f'); p.px(11, 1, '#8cbf4f');
  p.e(5, 9.5, 4.4, 5.2, '#e8a04a'); p.e(13, 9.5, 4.4, 5.2, '#e8a04a'); p.e(9, 9.5, 5, 6, '#f2b25e');
  p.r(8, 5, 1, 10, '#c27a2e'); p.r(4, 6, 1, 7, '#c27a2e'); p.r(13, 6, 1, 7, '#c27a2e');
  p.px(6, 8, '#6b3b1f'); p.px(11, 8, '#6b3b1f'); p.r(7, 11, 4, 1, '#6b3b1f'); p.px(6, 6, '#ffe3b0');
});
D('x_arbolito', 22, 30, p => {
  p.e(11, 21, 9, 5, G.m); p.e(11, 14, 7, 4.4, G.m); p.e(11, 8, 5, 3.6, G.m); p.e(9, 19, 6, 3, G.l); p.e(9, 12.5, 4, 2.6, G.l); p.e(10, 7, 3, 2, G.l);
  [[6, 20, '#e0577f'], [15, 18, '#fff09a'], [9, 13, '#9fd6f2'], [14, 12, '#e0577f'], [11, 8, '#fff09a'], [5, 23, '#9fd6f2'], [17, 23, '#ffc4d4']].forEach(([x, y, c]) => p.px(x, y, c));
  p.r(10, 1, 2, 2, '#f5c94c'); p.px(9, 2, '#fff09a'); p.px(12, 2, '#fff09a'); p.px(10, 3, '#fff09a');
  p.r(9, 25, 4, 3, W.m); p.r(7, 27, 8, 2, '#e0577f'); p.r(7, 27, 8, 1, '#f27ea1');
});
D('x_sofa', 36, 22, p => {
  p.r(3, 3, 30, 10, Q.m); p.r(3, 3, 30, 2, Q.l); p.r(4, 5, 28, 1, Q.h);
  p.r(1, 8, 5, 10, Q.d); p.r(30, 8, 5, 10, Q.d); p.r(1, 8, 5, 1, Q.m); p.r(30, 8, 5, 1, Q.m);
  p.r(6, 12, 24, 6, Q.l); p.r(6, 12, 24, 1, Q.h); p.r(17, 12, 1, 6, Q.m);
  p.r(3, 18, 2, 3, W.d); p.r(31, 18, 2, 3, W.d);
});
D('x_flores', 16, 22, p => {
  p.r(5, 14, 6, 7, '#9fd6f2'); p.r(5, 14, 6, 1, '#cdeefc'); p.r(6, 15, 1, 5, '#cdeefc');
  p.line(8, 14, 8, 7, G.d); p.line(8, 12, 4, 7, G.d); p.line(8, 12, 12, 6, G.d);
  p.e(8, 5, 2, 2, '#ffc4d6'); p.e(4, 6, 2, 2, '#fff09a'); p.e(12, 5, 2, 2, '#ece0fb'); p.px(8, 5, '#f27ea1'); p.px(4, 6, '#f5c94c'); p.px(12, 5, '#a385e0');
});
D('x_burbuja', 12, 12, p => { p.e(6, 6, 5, 5, '#d8eefb'); p.e(6, 6, 4, 4, '#eef8ff'); p.px(4, 3, '#ffffff'); p.px(3, 4, '#ffffff'); p.px(4, 4, '#ffffff'); });
})();
