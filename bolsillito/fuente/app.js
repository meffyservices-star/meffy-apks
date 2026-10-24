(function () {
const PAL = {
k: '#8a4d4f', // outline cocoa brown (like the Moffy logo)
w: '#ffffff', c: '#fff6e4', C: '#f6e2c4',
p: '#ffc4d6', P: '#f27ea1', R: '#e0577f',
l: '#cdeefc', L: '#9fd6f2', V: '#5fb0dc',   // baby blues
y: '#fff09a', Y: '#f5c94c',
g: '#d3eaa8', G: '#8cbf4f', D: '#5f8f33',
b: '#cdeefc', B: '#8fcbed',
r: '#ff9fb5', n: '#b07a5a', N: '#8a5a3c',
a: '#e8a04a', A: '#c27a2e', // caramel
o: '#ffc49a', s: '#c9a7a0',
m: '#e6f6d6', M: '#c8e8ad', // mochi greens
h: '#ece0fb', H: '#d0bbf2', // mochi lilacs
q: '#a385e0', Q: '#7d5fc4'  // witchy purples
};
function paint(W, H, fn, opts) {
const g = Array.from({ length: H }, () => Array(W).fill(null));
const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
const p = {
px(x, y, c) { if (inb(x, y)) g[y][x] = c; },
r(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) p.px(i, j, c); },
e(cx, cy, rx, ry, c, clip) {
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
const dx = (i + 0.5 - cx) / rx, dy = (j + 0.5 - cy) / ry;
if (dx * dx + dy * dy <= 1 && (!clip || clip(i, j))) p.px(i, j, c);
}
},
line(x0, y0, x1, y1, c) {
const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
for (let t = 0; t <= n; t++) p.px(Math.round(x0 + (x1 - x0) * t / n), Math.round(y0 + (y1 - y0) * t / n), c);
},
map(x, y, rows) { rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') p.px(x + i, y + j, ch); })); },
clear(x, y) { if (inb(x, y)) g[y][x] = null; }
};
fn(p);
if (!(opts && opts.noOutline)) {
const out = g.map(r => r.slice());
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
if (g[y][x]) continue;
const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => inb(x + dx, y + dy) && g[y + dy][x + dx] && g[y + dy][x + dx] !== 'k');
if (n) out[y][x] = 'k';
}
return out;
}
return g;
}
const VARIANTS = {
fresa: { k: '#b8436b', P: '#ff7aa8', p: '#ffd0e0', R: '#e0457a', l: '#ffe3ee', L: '#ffb3cb', V: '#f27ea1', b: '#ffe3ee', B: '#ffb3cb', y: '#fff0f5', Y: '#ff9fc0', g: '#ffd6e4', G: '#f58fb1', D: '#d9668f', n: '#e07a9a', N: '#c0466f', C: '#ffe0ea', a: '#ff9fc0', A: '#e0457a', m: '#ffe3ee', M: '#ffc4d6', h: '#ffe3ee', H: '#ffc4d6', q: '#f27ea1', Q: '#c0466f' },
menta: { k: '#3f7a55', P: '#6fcf9f', p: '#c8f0dc', R: '#3fae7c', l: '#e0f7ec', L: '#9fe0bf', V: '#56b88a', b: '#e0f7ec', B: '#9fe0bf', y: '#fffbd9', Y: '#f2d675', g: '#d9f2c4', G: '#7cc46b', D: '#4f9a4f', n: '#a3855a', N: '#7a6040', C: '#eef8e6', a: '#9fe0bf', A: '#56b88a', q: '#6fcf9f', Q: '#3fae7c' },
noche: { k: '#2f2a5a', P: '#b48cf0', p: '#ddccff', R: '#9b6be0', l: '#d6dcff', L: '#8fa4f0', V: '#6b7fd6', b: '#d6dcff', B: '#8fa4f0', y: '#ffe27a', Y: '#f5c94c', g: '#c6e8ff', G: '#7fb6e8', D: '#5a8fd0', n: '#8a7ab8', N: '#5f528f', c: '#f3f0ff', C: '#e3ddff', w: '#fffdf0', a: '#ffe27a', A: '#f5c94c' },
chocolate: { k: '#4a2c22', P: '#d0906e', p: '#f2d0bc', R: '#b0503a', l: '#f7e6d2', L: '#dcb08a', V: '#b98660', b: '#f7e6d2', B: '#dcb08a', y: '#ffeec2', Y: '#e6b062', g: '#e3d6a8', G: '#a08a4e', D: '#7a6838', c: '#fff4e6', C: '#f0dcc2', n: '#8a5a3c', N: '#5e3a26' }
};
// tono de los packs de color para los íconos dibujados a mano
const RAW_TINT = { fresa: ['#7a2448', '#f2789f', '#fff2f6'], menta: ['#2f5e44', '#6fcf9f', '#f0fbf4'], noche: ['#26224f', '#8f7ae6', '#f1eeff'], chocolate: ['#3e2419', '#b98660', '#fbf1e6'] };
function tintRaw(c, [d, m, l]) { const h = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)); const [r, g, b] = h(c); const L = (r * .3 + g * .59 + b * .11) / 255; const mixc = (a, bb, t) => { const A = h(a), B = h(bb); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }; return L < .55 ? mixc(d, m, L / .55) : mixc(m, l, (L - .55) / .45); }
function toURL(grid, scale, over, style) {
const H = grid.length, W = grid[0].length, s = scale || 1;
const cv = document.createElement('canvas'); cv.width = W * s; cv.height = H * s;
const ctx = cv.getContext('2d');
const cols = style ? mistria(grid, over, style) : null;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
const c = grid[y][x]; if (!c) continue;
ctx.fillStyle = (cols && cols[y][x]) || (over && over[c]) || PAL[c] || c; ctx.fillRect(x * s, y * s, s, s);
}
return cv.toDataURL();
}
// Estilo "Mistria": sombrita abajo-derecha, brillito arriba-izquierda y (en íconos) contorno del color de su relleno.
function hexMix(a, b, t) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function mistria(g, over, st) {
const H = g.length, W = g[0].length;
const hexOf = c => { const v = (over && over[c]) || PAL[c] || c; return /^#[0-9a-f]{6}$/i.test(v) ? v : null; };
const col = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? null : g[y][x];
const lum = h => { const v = parseInt(h.slice(1), 16); return (v >> 16) * .3 + ((v >> 8) & 255) * .59 + (v & 255) * .11; };
const border = (x, y) => { const q = col(x, y); if (!q) return true; if (q !== 'k') return false; return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => !col(x + a, y + b)); };
const out = g.map(r => r.map(() => null));
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
const c = col(x, y); if (!c || c === 'k') continue; const h = hexOf(c); if (!h || lum(h) < 90) continue;
const e = (dx, dy, n) => { for (let k = 1; k <= n; k++) { if (border(x + dx * k, y + dy * k)) return k; const q = col(x + dx * k, y + dy * k); if (q === 'k' || q !== c) return 0; } return 0; };
const below = e(0, 1, 2), right = e(1, 0, 1), above = e(0, -1, 1), left = e(-1, 0, 1);
if (below === 1 || (below && right)) out[y][x] = hexMix(h, '#6a3a58', st.dk);
else if (below === 2 || right === 1) out[y][x] = hexMix(h, '#6a3a58', st.dk * .5);
else if (above === 1 && left) out[y][x] = hexMix(h, '#ffffff', st.lt);
}
if (st.selout) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
if (g[y][x] !== 'k' || !border(x, y)) continue;
for (const [a, b] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) { const q = col(x + a, y + b); const h = q && q !== 'k' && hexOf(q); if (h) { out[y][x] = hexMix(h, '#4a2238', .66); break; } }
}
return out;
}
const PET_STYLE = { dk: .16, lt: .35, selout: false }, ICON_STYLE = { dk: .2, lt: .4, selout: true };
const PETS = /^(pudin|gochi|shey|canela|lunita|lunitaBlink|maca|dony|gela|cupi|acc_.*)$/;
const DEFS = {
home(p) { // mushroom cottage
p.e(8, 7.2, 7, 5.2, 'P', (i, j) => j <= 7);
p.px(4, 4, 'w'); p.px(5, 4, 'w'); p.px(4, 5, 'w'); p.px(10, 3, 'w'); p.px(11, 3, 'w'); p.px(12, 5, 'w'); p.px(7, 6, 'w');
p.r(4, 8, 8, 6, 'c'); p.r(4, 8, 8, 1, 'C');
p.r(5, 10, 2, 2, 'b'); p.r(9, 10, 2, 4, 'n'); p.px(10, 12, 'y');
p.r(1, 14, 14, 1, 'G'); p.px(2, 13, 'g'); p.px(13, 13, 'g');
},
apple(p) {
p.e(8, 9.2, 6.6, 6, 'P'); p.clear(8, 3); p.px(7, 3, 'P');
p.r(8, 1, 1, 3, 'n'); p.map(9, 0, ['.GG.', 'GgGG', '.GG.']);
p.px(4, 7, 'w'); p.px(5, 6, 'w'); p.px(11, 8, 'w'); p.px(5, 12, 'w'); p.px(12, 12, 'w');
p.r(7, 10, 3, 5, 'c'); p.px(9, 12, 'Y'); p.r(4, 9, 2, 2, 'l');
},
list(p) {
p.r(3, 2, 10, 12, 'c'); p.r(3, 2, 10, 2, 'P'); p.px(5, 2, 'p'); p.px(8, 2, 'p'); p.px(11, 2, 'p');
p.r(5, 6, 6, 1, 'L'); p.r(5, 8, 4, 1, 'L'); p.r(5, 10, 5, 1, 'L');
p.r(10, 11, 2, 2, 'p');
},
month(p) {
p.r(2, 3, 12, 11, 'c'); p.r(2, 3, 12, 3, 'R'); p.px(5, 2, 'k'); p.px(10, 2, 'k'); p.px(5, 4, 'w'); p.px(10, 4, 'w');
[[4, 8], [6, 8], [8, 8], [10, 8], [4, 10], [6, 10], [10, 10], [4, 12], [6, 12], [8, 12]].forEach(([x, y]) => p.px(x, y, 'L'));
p.r(8, 10, 2, 2, 'P');
},
year(p) {
p.r(2, 2, 12, 12, 'c'); p.r(3, 10, 2, 3, 'B'); p.r(6, 7, 2, 6, 'P'); p.r(9, 4, 2, 9, 'Y'); p.r(12, 8, 1, 5, 'G');
p.px(4, 4, 'l'); p.px(5, 3, 'l');
},
book(p) {
p.r(2, 2, 12, 12, 'L'); p.r(2, 2, 2, 12, 'V'); p.r(13, 3, 1, 10, 'c');
p.r(6, 5, 5, 4, 'l'); p.map(7, 6, ['P.P', 'PPP', '.P.']);
p.px(8, 11, 'y'); p.px(6, 11, 'y'); p.px(10, 11, 'y');
},
more(p) { // wand
p.line(3, 13, 9, 7, 'n'); p.line(4, 13, 10, 7, 'N');
p.map(8, 1, ['..y..', '..y..', 'yyYyy', '.yYy.', '.y.y.']);
p.px(3, 3, 'p'); p.px(13, 9, 'b'); p.px(2, 8, 'l');
},
plus(p) {
p.e(8, 8, 7, 7, 'P'); p.r(7, 4, 2, 8, 'w'); p.r(4, 7, 8, 2, 'w'); p.px(4, 4, 'p'); p.px(5, 3, 'p');
},
goal(p) { // jar of stars
p.r(4, 3, 8, 2, 'n'); p.r(3, 5, 10, 9, 'b'); p.r(4, 6, 8, 7, 'l');
p.px(5, 11, 'y'); p.px(7, 9, 'y'); p.px(9, 11, 'Y'); p.px(10, 8, 'y'); p.px(6, 7, 'P'); p.px(8, 12, 'P'); p.px(4, 6, 'w'); p.px(4, 7, 'w');
},
repeat(p) { // little clock
p.e(8, 8.5, 6, 6, 'c'); p.r(8, 5, 1, 4, 'V'); p.r(8, 8, 3, 1, 'V'); p.px(3, 3, 'P'); p.px(13, 3, 'P');
p.px(8, 4, 'L'); p.px(12, 8, 'L'); p.px(4, 8, 'L'); p.px(8, 13, 'L');
},
gear(p) {
p.e(8, 8, 6, 6, 'l'); p.r(7, 1, 2, 14, 'l'); p.r(1, 7, 14, 2, 'l'); p.e(8, 8, 2.4, 2.4, 'w');
},
gem(p) {
p.map(3, 3, ['..LLLLLL..', '.LllwlllL.', 'LlllllllLL', '.LllllllL.', '..LllllL..', '...LllL...', '....LL....']);
},
bag(p) {
p.e(8, 10, 5.5, 4.5, 'l'); p.r(6, 4, 4, 2, 'L'); p.px(7, 3, 'P'); p.px(8, 3, 'P');
p.e(12, 12.5, 2.2, 1.6, 'y'); p.px(7, 9, 'y'); p.px(8, 9, 'Y'); p.px(5, 8, 'w');
},
piggy(p) {
p.e(8, 9, 6, 4.5, 'p'); p.r(4, 12, 2, 2, 'p'); p.r(10, 12, 2, 2, 'p'); p.px(5, 4, 'p'); p.px(5, 5, 'p');
p.r(12, 8, 2, 2, 'P'); p.px(10, 8, 'k'); p.r(7, 5, 3, 1, 'Y'); p.px(4, 8, 'w');
},
heartS(p) { p.map(4, 5, ['.PP.PP.', 'PwPPPPP', 'PPPPPPP', '.PPPPP.', '..PPP..', '...P...']); },
heartB(p) { p.map(4, 5, ['.BB.BB.', 'BwBBBBB', 'BBBBBBB', '.BBBBB.', '..BBB..', '...B...']); },
heartY(p) { p.map(4, 5, ['.YY.YY.', 'YwYYYYY', 'YYYYYYY', '.YYYYY.', '..YYY..', '...Y...']); },
heart(p) { p.map(2, 3, ['.PP...PP.', 'PwPP.PPPP', 'PPPPPPPPP', 'PPPPPPPPP', '.PPPPPPP.', '..PPPPP..', '...PPP...', '....P....']); },
star(p) { p.map(2, 2, ['.....y.....', '....yy.....', '....yyy....', 'yyyyyyyyyyy', '.yyyyywyyy.', '..yyyyyyy..', '..yyy.yyy..', '.yy.....yy.']); },
moon(p) { p.e(8, 8, 6, 6, 'y'); p.e(10.5, 6.5, 5, 5, null); for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const dx = (i + .5 - 11), dy = (j + .5 - 6); if (dx * dx + dy * dy <= 22) p.clear(i, j); } p.px(5, 9, 'Y'); p.px(6, 12, 'Y'); },
crystal(p) { p.e(8, 7, 5.5, 5.5, 'l'); p.px(6, 5, 'w'); p.px(7, 4, 'w'); p.r(9, 7, 2, 2, 'P'); p.r(4, 12, 8, 2, 'n'); p.r(5, 12, 6, 1, 'Y'); },
flower(p) { p.r(7, 9, 2, 6, 'G'); p.px(5, 11, 'g'); p.px(10, 12, 'g'); p.e(8, 5, 2.5, 2.5, 'y'); p.e(5, 5, 2, 2, 'p'); p.e(11, 5, 2, 2, 'p'); p.e(8, 2.5, 2, 2, 'p'); p.e(8, 7.5, 2, 1.6, 'p'); p.e(8, 5, 1.6, 1.6, 'y'); },
coffee(p) { p.r(3, 6, 8, 7, 'c'); p.r(4, 7, 6, 2, 'n'); p.r(11, 8, 2, 3, 'c'); p.px(5, 3, 'l'); p.px(7, 2, 'l'); p.px(6, 4, 'l'); p.r(2, 13, 11, 1, 'p'); },
cart(p) { p.r(3, 5, 10, 5, 'b'); p.r(2, 3, 2, 1, 'B'); p.r(3, 10, 9, 1, 'B'); p.e(5, 12.5, 1.4, 1.4, 'L'); p.e(11, 12.5, 1.4, 1.4, 'L'); p.px(6, 6, 'P'); p.px(9, 7, 'y'); },
car(p) { p.r(2, 8, 12, 4, 'P'); p.r(4, 5, 7, 3, 'P'); p.r(5, 6, 2, 2, 'b'); p.r(8, 6, 2, 2, 'b'); p.e(5, 12.5, 1.6, 1.6, 'k'); p.e(11, 12.5, 1.6, 1.6, 'k'); p.px(13, 9, 'y'); },
gift(p) { p.r(3, 6, 10, 8, 'L'); p.r(2, 5, 12, 2, 'V'); p.r(7, 5, 2, 9, 'P'); p.map(4, 2, ['PP..PP..', '.PP.PP..', '..PPP...']); },
house2(p) { p.map(1, 2, ['......RR......', '.....RRRR.....', '....RRRRRR....', '...RRRRRRRR...', '..RRRRRRRRRR..']); p.r(3, 7, 10, 7, 'c'); p.r(7, 10, 2, 4, 'n'); p.r(4, 8, 2, 2, 'b'); p.r(10, 8, 2, 2, 'b'); },
phone(p) { p.r(5, 2, 7, 12, 'L'); p.r(6, 3, 5, 8, 'b'); p.px(8, 12, 'w'); p.px(7, 4, 'w'); },
plane(p) { p.map(1, 4, ['.........ww...', '........wwb...', 'wwwwwwwwwwwwwb', '.bbwwwwwwwwbb.', '......wwb.....', '.....wwb......']); },
bolt(p) { p.map(4, 1, ['....yyy', '...yyy.', '..yyy..', '.yyyyyy', '....yy.', '...yy..', '..yy...', '.yy....', 'y......']); },
shirt(p) { p.map(2, 3, ['..pp..pp..', 'pppPPPPppp', 'pppppppppp', '.ppppppp..', '..pppppp..', '..pppppp..', '..pppppp..', '..pppppp..']); p.px(7, 4, 'w'); },
game(p) { p.r(2, 6, 12, 6, 'L'); p.r(4, 8, 3, 1, 'w'); p.r(5, 7, 1, 3, 'w'); p.px(11, 8, 'P'); p.px(12, 9, 'y'); },
book2(p) { p.r(3, 3, 10, 10, 'B'); p.r(4, 4, 8, 8, 'b'); p.r(3, 3, 2, 10, 'V'); p.r(6, 6, 4, 1, 'w'); },
med(p) { p.r(2, 6, 12, 5, 'w'); p.r(2, 6, 6, 5, 'P'); p.px(4, 7, 'p'); },
paw(p) { p.e(8, 10, 3.5, 3, 'C'); p.e(4, 6.5, 1.5, 1.8, 'C'); p.e(7, 4.5, 1.5, 1.8, 'C'); p.e(10.5, 4.5, 1.5, 1.8, 'C'); p.e(13, 6.5, 1.5, 1.8, 'C'); },
music(p) { p.r(6, 2, 1, 9, 'V'); p.r(12, 1, 1, 9, 'V'); p.r(6, 2, 7, 2, 'V'); p.e(4.5, 11.5, 2, 1.6, 'L'); p.e(10.5, 10.5, 2, 1.6, 'L'); },
sparkle(p) { p.map(3, 2, ['....y....', '....y....', '...yyy...', 'yyyywyyyy', '...yyy...', '....y....', '....y....']); p.px(13, 12, 'p'); p.px(2, 12, 'b'); },
pudin: { w: 20, h: 20, fn(p) {
p.r(0, 17, 20, 1, 'l'); p.r(1, 18, 18, 1, 'l');                 // plate
p.r(3, 8, 14, 1, 'y'); p.r(2, 9, 16, 4, 'y'); p.r(1, 13, 18, 4, 'y'); p.r(1, 16, 18, 1, 'Y'); // custard
p.r(4, 4, 12, 1, 'a'); p.r(3, 5, 14, 3, 'a'); p.px(5, 5, 'y'); p.px(6, 5, 'w');            // caramel
p.px(4, 8, 'a'); p.px(8, 8, 'a'); p.px(8, 9, 'a'); p.px(14, 8, 'a'); p.px(15, 8, 'a');      // drips
p.e(10, 3, 3.2, 1.6, 'w'); p.r(9, 0, 2, 2, 'R'); p.px(9, 0, 'P'); p.px(11, 0, 'G');          // cream + cherry
p.r(6, 11, 1, 2, 'k'); p.r(13, 11, 1, 2, 'k'); p.px(6, 11, 'k');
p.r(4, 13, 2, 1, 'p'); p.r(14, 13, 2, 1, 'p'); p.px(9, 13, 'R'); p.px(10, 13, 'R');
p.px(3, 10, 'w'); p.px(3, 11, 'w');
} },
gochi: { w: 20, h: 20, fn(p) {
p.e(10, 13, 8.6, 5.8, 'm'); p.r(2, 15, 16, 2, 'm'); p.r(3, 17, 14, 1, 'M');
p.e(10, 17.2, 7.5, 1.2, 'M');
p.px(5, 10, 'w'); p.px(6, 9, 'w'); p.px(4, 11, 'w');
p.r(7, 12, 1, 2, 'k'); p.r(12, 12, 1, 2, 'k');
p.r(5, 14, 2, 1, 'p'); p.r(13, 14, 2, 1, 'p'); p.px(9, 14, 'k'); p.px(10, 15, 'k'); p.px(11, 14, 'k');
p.r(10, 5, 1, 3, 'G'); p.map(7, 3, ['GG...', 'GgG..', '.GG..']); p.map(11, 3, ['..GG', '.GgG', '.GG.']);
} },
shey: { w: 20, h: 20, fn(p) {
p.e(10, 13, 8.6, 5.8, 'h'); p.r(2, 15, 16, 2, 'h'); p.r(3, 17, 14, 1, 'H'); p.e(10, 17.2, 7.5, 1.2, 'H');
p.px(5, 10, 'w'); p.px(6, 9, 'w'); p.px(4, 11, 'w');
p.r(7, 12, 1, 2, 'k'); p.r(12, 12, 1, 2, 'k'); p.px(8, 12, 'w'); p.px(13, 12, 'w');
p.r(5, 14, 2, 1, 'p'); p.r(13, 14, 2, 1, 'p'); p.px(9, 15, 'k'); p.px(10, 15, 'k');
p.map(12, 2, ['.yy.', 'y.yy', '..yy', 'y.yy', '.yy.']); p.px(7, 5, 'y'); p.px(5, 7, 'w');
} },
canela: { w: 20, h: 20, fn(p) {
p.e(10, 11, 8.6, 7.4, 'C');
const sp = [[10,11],[11,11],[11,10],[10,9],[9,9],[8,10],[8,11],[8,12],[9,13],[10,13],[11,13],[12,12],[13,11],[13,10],[13,9],[12,8],[11,7],[10,7],[9,7],[8,7],[7,8],[6,9],[5,10],[5,11],[5,12],[6,14],[7,15],[8,15]];
sp.forEach(([x, y]) => p.px(x, y, 'n'));
p.map(4, 3, ['..wwww..ww..', '.wwwwwwwwww.', 'ww.ww..www.w', 'w...w...w...']);
p.r(6, 12, 1, 2, 'k'); p.r(14, 12, 1, 2, 'k');
p.r(4, 14, 2, 1, 'p'); p.r(15, 14, 2, 1, 'p'); p.px(10, 15, 'k'); p.px(11, 15, 'k');
p.px(15, 6, 'y'); p.px(3, 8, 'y');
} },
lunita: { w: 20, h: 20, fn(p) {
p.e(6, 4.5, 1.8, 4.2, 'w'); p.e(14, 4.5, 1.8, 4.2, 'w'); p.r(6, 2, 1, 5, 'p'); p.r(13, 2, 1, 5, 'p');
p.e(10, 10, 6.2, 5, 'w');
p.px(7, 10, 'k'); p.px(12, 10, 'k'); p.px(7, 9, 'k'); p.px(12, 9, 'k');
p.r(5, 11, 2, 1, 'p'); p.r(13, 11, 2, 1, 'p'); p.px(9, 12, 'P'); p.px(10, 12, 'P');
p.e(10, 17, 3.8, 2.6, 'l'); p.px(10, 16, 'y');
p.e(3.2, 14.5, 2.2, 2.6, 'b'); p.e(16.8, 14.5, 2.2, 2.6, 'b');
p.map(8, 0, ['.y.', 'yYy', '.y.']);
} },
lunitaBlink: { w: 20, h: 20, fn(p) {
DEFS.lunita.fn(p); p.clear(7, 9); p.clear(12, 9); p.px(7, 9, 'w'); p.px(12, 9, 'w');
} }
};
const cache = {};
function sprite(name, scale) {
const key = name + '@' + (scale || 1);
if (cache[key]) return cache[key];
const [base, variant] = name.split('~');
const d = DEFS[base]; if (!d) return '';
let url;
if (d.raw) { // ícono dibujado a mano con sus propios colores y contorno
let pal = d.pal.split(','); if (variant && RAW_TINT[variant]) pal = pal.map(c => tintRaw(c, RAW_TINT[variant])); const grid = d.raw.map(r => [...r].map(ch => ch === '.' ? null : pal[parseInt(ch, 36)]));
url = toURL(grid, scale || 1, null, null);
} else {
const W = d.w || 16, H = d.h || 16, fn = d.fn || d;
url = toURL(paint(W, H, fn), scale || 1, VARIANTS[variant], d.flat ? null : (PETS.test(base) ? PET_STYLE : ICON_STYLE));
}
cache[key] = url; return url;
}
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function bands(ctx, W, H, cols, rand) {
const n = cols.length;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
const t = y / H * (n - 1); const i = Math.floor(t); const f = t - i;
const dither = ((x + y) % 2 === 0 ? 0.25 : -0.25) + (rand() - 0.5) * 0.2;
ctx.fillStyle = cols[Math.min(n - 1, f + dither > 0.5 ? i + 1 : i)];
ctx.fillRect(x, y, 1, 1);
}
}
function cloud(ctx, x, y, w, c, c2) {
ctx.fillStyle = c;
for (let i = 0; i < w; i += 3) { const h = 3 + Math.round(Math.sin(i * 0.7) * 2 + 2); ctx.fillRect(x + i, y - h, 4, h + 3); }
ctx.fillRect(x - 2, y, w + 6, 4);
if (c2) { ctx.fillStyle = c2; ctx.fillRect(x - 2, y + 3, w + 6, 1); }
}
function pstar(ctx, x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y - 2, 1, 5); ctx.fillRect(x - 2, y, 5, 1); ctx.fillRect(x - 1, y - 1, 3, 3); }
function scallop(ctx, W, y, c, dots) { ctx.fillStyle = c; ctx.fillRect(0, y + 2, W, 60); for (let x = 0; x < W; x += 6) { ctx.fillRect(x + 1, y, 4, 1); ctx.fillRect(x, y + 1, 6, 1); } if (dots) { ctx.fillStyle = '#ffffff'; for (let x = 3; x < W; x += 7) for (let yy = y + 5; yy < y + 40; yy += 6) ctx.fillRect(x + ((yy / 6) % 2 ? 3 : 0), yy, 1, 1); } }
const BANNERS = {
manzana: { name: 'Manzana con estrellas', draw(ctx, W, H, r) {
for (let x = 0; x < W; x++) { ctx.fillStyle = Math.floor(x / 6) % 2 ? '#fdf6e6' : '#fbeed3'; ctx.fillRect(x, 0, 1, H); }
const cs = ['#ffb3cb', '#9fd6f2', '#ffe27a']; for (let i = 0; i < 22; i++) pstar(ctx, 3 + Math.floor(r() * (W - 6)), 3 + Math.floor(r() * 26), cs[i % 3]);
for (let i = 0; i < 26; i++) { ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.floor(r() * W), Math.floor(r() * 32), 1, 1); }
ctx.fillStyle = '#ffffff'; scallop(ctx, W, H - 10, '#ffffff'); scallop(ctx, W, H - 8, '#f48fb1', true);
} },
picnic: { name: 'Picnic rosa', draw(ctx, W, H, r) {
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const a = Math.floor(x / 5) % 2, b = Math.floor(y / 5) % 2; ctx.fillStyle = a && b ? '#f7a8c2' : (a || b) ? '#fcd0de' : '#fff4f6'; ctx.fillRect(x, y, 1, 1); }
const heart = (x, y) => { ctx.fillStyle = '#e0577f'; ctx.fillRect(x, y, 2, 1); ctx.fillRect(x + 3, y, 2, 1); ctx.fillRect(x - 1, y + 1, 7, 2); ctx.fillRect(x, y + 3, 5, 1); ctx.fillRect(x + 1, y + 4, 3, 1); ctx.fillRect(x + 2, y + 5, 1, 1); };
for (let i = 0; i < 6; i++) heart(8 + i * 19 + Math.floor(r() * 4), 8 + Math.floor(r() * 26));
scallop(ctx, W, H - 6, '#ffffff');
} },
cielo: { name: 'Cielo celeste', draw(ctx, W, H, r) {
bands(ctx, W, H, ['#a9dcf5', '#c4e8fa', '#ddf2fc', '#fdf2f6'], r);
cloud(ctx, 6, 30, 26, '#ffffff', '#ffe0ea'); cloud(ctx, 58, 38, 32, '#ffffff', '#ffe0ea'); cloud(ctx, 94, 22, 20, '#ffffff', '#ffe0ea');
const cs = ['#ffb3cb', '#ffe27a', '#ffffff']; for (let i = 0; i < 12; i++) pstar(ctx, 4 + Math.floor(r() * (W - 8)), 4 + Math.floor(r() * 16), cs[i % 3]);
} },
pradera: { name: 'Pradera de manzanas', draw(ctx, W, H, r) {
bands(ctx, W, H, ['#ddf2fc', '#eef8fd', '#fdf6e6'], r);
ctx.fillStyle = '#c3e391'; for (let x = 0; x < W; x++) { const h = 12 + Math.round(Math.sin(x / 13) * 3); ctx.fillRect(x, H - h, 1, h); }
ctx.fillStyle = '#9ccb62'; for (let x = 0; x < W; x++) { const h = 7 + Math.round(Math.sin(x / 8 + 2) * 2); ctx.fillRect(x, H - h, 1, h); }
const tree = (x) => { ctx.fillStyle = '#8a5a3c'; ctx.fillRect(x, H - 20, 2, 10); ctx.fillStyle = '#8cbf4f'; for (let j = -7; j <= 7; j++) for (let i = -8; i <= 8; i++) if (i * i / 64 + j * j / 49 <= 1) ctx.fillRect(x + i, H - 26 + j, 1, 1); ctx.fillStyle = '#f27ea1'; [[-4, -3], [3, -5], [5, 1], [-2, 2], [0, -6]].forEach(([i, j]) => ctx.fillRect(x + i, H - 26 + j, 2, 2)); };
tree(22); tree(88);
for (let i = 0; i < 20; i++) { ctx.fillStyle = ['#ffffff', '#fff09a', '#ffc4d6'][i % 3]; ctx.fillRect(Math.floor(r() * W), H - 2 - Math.floor(r() * 6), 1, 1); }
pstar(ctx, 56, 8, '#ffe27a'); pstar(ctx, 66, 14, '#ffb3cb');
} },
noche: { name: 'Noche de luna', draw(ctx, W, H, r) {
bands(ctx, W, H, ['#3d3a8c', '#5b4fb0', '#8b6fcf', '#c792d8', '#f2b3d6'], r);
for (let i = 0; i < 70; i++) { ctx.fillStyle = r() > .8 ? '#fff6c8' : '#ffffff'; ctx.fillRect(Math.floor(r() * W), Math.floor(r() * H * .7), 1, 1); }
ctx.fillStyle = '#fff1b0'; for (let j = -5; j <= 5; j++) for (let i = -5; i <= 5; i++) if (i * i + j * j <= 25 && (i - 2) ** 2 + (j + 1) ** 2 > 16) ctx.fillRect(96 + i, 11 + j, 1, 1);
cloud(ctx, 6, 38, 26, '#f7c6e2', '#e59ac6'); cloud(ctx, 44, 42, 34, '#fbd5ea', '#eaa6cf'); cloud(ctx, 88, 39, 28, '#f7c6e2', '#e59ac6');
} },
atardecer: { name: 'Atardecer rosa', draw(ctx, W, H, r) {
bands(ctx, W, H, ['#ffb5c9', '#ffc7b2', '#ffd9a8', '#ffe9c2'], r);
ctx.fillStyle = '#fff3c4'; for (let j = -9; j <= 9; j++) for (let i = -9; i <= 9; i++) if (i * i + j * j <= 81) ctx.fillRect(60 + i, 34 + j, 1, 1);
ctx.fillStyle = '#f59fb6'; ctx.fillRect(0, 38, W, 8); ctx.fillStyle = '#ec86a3'; for (let x = 0; x < W; x += 5) ctx.fillRect(x, 39 + (x % 3), 3, 1);
cloud(ctx, 10, 18, 22, '#fff0f4'); cloud(ctx, 84, 14, 26, '#fff0f4');
ctx.fillStyle = '#7a4d6e'; [[30, 10], [36, 8], [42, 11]].forEach(([x, y]) => { ctx.fillRect(x, y, 1, 1); ctx.fillRect(x + 1, y - 1, 1, 1); ctx.fillRect(x + 2, y, 1, 1); });
} },
jardin: { name: 'Jardín de hongos', draw(ctx, W, H, r) {
bands(ctx, W, H, ['#c8ecff', '#dff4ff', '#eafbe9'], r);
cloud(ctx, 14, 12, 18, '#ffffff'); cloud(ctx, 76, 9, 24, '#ffffff');
ctx.fillStyle = '#9fdcae'; for (let x = 0; x < W; x++) { const h = 10 + Math.round(Math.sin(x / 11) * 3); ctx.fillRect(x, H - h, 1, h); }
ctx.fillStyle = '#76c48f'; for (let x = 0; x < W; x++) { const h = 6 + Math.round(Math.sin(x / 7 + 1) * 2); ctx.fillRect(x, H - h, 1, h); }
for (let i = 0; i < 26; i++) { ctx.fillStyle = ['#ffc2dc', '#fff3a8', '#ffffff', '#d9ccff'][i % 4]; ctx.fillRect(Math.floor(r() * W), H - 2 - Math.floor(r() * 6), 1, 1); }
const m = (x, y, c) => { ctx.fillStyle = '#fff4e2'; ctx.fillRect(x + 2, y + 3, 3, 4); ctx.fillStyle = c; ctx.fillRect(x, y + 1, 7, 2); ctx.fillRect(x + 1, y, 5, 1); ctx.fillStyle = '#fff'; ctx.fillRect(x + 2, y + 1, 1, 1); ctx.fillRect(x + 5, y + 1, 1, 1); };
m(20, H - 13, '#f58fbd'); m(96, H - 12, '#a893ec'); m(54, H - 10, '#f58fbd');
} },
nubes: { name: 'Nubes pastel', draw(ctx, W, H, r) {
bands(ctx, W, H, ['#b9d8ff', '#cfd2ff', '#e8cdf6', '#ffd6ea'], r);
cloud(ctx, 4, 20, 30, '#ffffff', '#f2e6ff'); cloud(ctx, 52, 30, 36, '#ffffff', '#f2e6ff'); cloud(ctx, 92, 16, 24, '#ffffff', '#f2e6ff'); cloud(ctx, 26, 44, 40, '#fff6fb'); cloud(ctx, 84, 46, 34, '#fff6fb');
for (let i = 0; i < 14; i++) { ctx.fillStyle = '#fffbd0'; ctx.fillRect(Math.floor(r() * W), Math.floor(r() * 12), 1, 1); }
} },
estrellas: { name: 'Lluvia de estrellas', draw(ctx, W, H, r) {
bands(ctx, W, H, ['#1d1b4a', '#2c2770', '#463a8f', '#6d4fa8'], r);
for (let i = 0; i < 110; i++) { ctx.fillStyle = ['#ffffff', '#fff3a8', '#ffc2dc', '#bfe0ff'][Math.floor(r() * 4)]; ctx.fillRect(Math.floor(r() * W), Math.floor(r() * H), 1, 1); }
const sh = (x, y, n) => { for (let i = 0; i < n; i++) { ctx.fillStyle = i < 2 ? '#ffffff' : (i < 6 ? '#fff3a8' : '#c9b8f5'); ctx.fillRect(x - i, y + Math.floor(i / 2), 1, 1); } };
sh(98, 8, 14); sh(40, 4, 10);
ctx.fillStyle = '#fff3a8'; [[20, 20], [70, 30], [104, 34]].forEach(([x, y]) => { ctx.fillRect(x, y - 1, 1, 3); ctx.fillRect(x - 1, y, 3, 1); });
} },
cerezo: { name: 'Cerezo', draw(ctx, W, H, r) {
bands(ctx, W, H, ['#fff1f6', '#ffe1ec', '#ffd2e4'], r);
ctx.fillStyle = '#8a5a6e'; let x = 0, y = 8; for (let i = 0; i < 80; i++) { ctx.fillRect(x, y, 1, 2); x++; if (i % 6 === 0) y++; }
ctx.fillRect(40, 18, 1, 8); for (let i = 0; i < 18; i++) ctx.fillRect(40 + i, 22 - Math.floor(i / 4), 1, 1);
for (let i = 0; i < 70; i++) { const bx = Math.floor(r() * 84), by = 4 + Math.floor(bx / 6) + Math.floor(r() * 10) - 3; ctx.fillStyle = r() > .5 ? '#ff9ec3' : '#ffc2dc'; ctx.fillRect(bx, by, 2, 2); }
for (let i = 0; i < 16; i++) { ctx.fillStyle = '#ffb3cf'; ctx.fillRect(Math.floor(r() * W), 26 + Math.floor(r() * 20), 1, 1); }
} },
menta: { name: 'Bosque de menta', draw(ctx, W, H, r) {
bands(ctx, W, H, ['#d7f5e8', '#c5ecdc', '#b0e0cf'], r);
for (let t = 0; t < 9; t++) { const tx = 6 + t * 14 + Math.floor(r() * 4), th = 16 + Math.floor(r() * 10); ctx.fillStyle = t % 2 ? '#6cc08b' : '#58a97a'; for (let j = 0; j < th; j++) { const w = Math.floor(j / 2) + 1; ctx.fillRect(tx - w, H - th - 4 + j, w * 2 + 1, 1); } ctx.fillStyle = '#a8714f'; ctx.fillRect(tx, H - 5, 1, 5); }
for (let i = 0; i < 20; i++) { ctx.fillStyle = '#fff6c8'; ctx.fillRect(Math.floor(r() * W), Math.floor(r() * 20), 1, 1); }
} }
};
const bcache = {};
function banner(id) {
if (bcache[id]) return bcache[id];
const b = BANNERS[id] || BANNERS.noche; const W = 120, H = 46;
const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
b.draw(cv.getContext('2d'), W, H, rnd(id.length * 977 + 13));
return (bcache[id] = cv.toDataURL());
}
function define(name, d) { DEFS[name] = d; Object.keys(cache).forEach(k => { if (k.split(/[@~]/)[0] === name) delete cache[k]; }); }
window.Pix = { sprite, banner, define, BANNERS, VARIANTS, has: n => !!DEFS[n.split('~')[0]], get names() { return Object.keys(DEFS).filter(n => !n.startsWith('lunita') && !n.startsWith('acc_') && !n.startsWith('ui_') && !n.startsWith('f_')); }, PAL };
})();
;
(function () {
const D = (name, fn, w, h) => Pix.define(name, w ? { w, h, fn } : fn);
D('maletin', p => { p.r(2, 5, 12, 9, 'n'); p.r(6, 3, 4, 2, 'N'); p.r(7, 4, 2, 1, null); p.r(2, 8, 12, 1, 'N'); p.r(7, 7, 2, 3, 'Y'); p.px(3, 6, 'C'); });
D('foco', p => { p.e(8, 6.5, 5, 5, 'y'); p.r(6, 11, 4, 1, 'Y'); p.r(6, 12, 4, 2, 'L'); p.px(6, 4, 'w'); p.px(5, 5, 'w'); p.r(7, 7, 1, 3, 'Y'); p.r(8, 7, 1, 3, 'Y'); });
D('wifi', p => { p.map(1, 3, ['...BBBBBBBB...', '.BB........BB.', 'B...BBBBBB...B', '..BB......BB..', '.....BBBB.....', '....B....B....', '......PP......', '......PP......']); }, 16, 16);
D('bus', p => { p.r(2, 3, 12, 9, 'y'); p.r(3, 4, 4, 3, 'l'); p.r(9, 4, 4, 3, 'l'); p.r(2, 9, 12, 1, 'P'); p.e(5, 12.5, 1.6, 1.6, 'N'); p.e(11, 12.5, 1.6, 1.6, 'N'); p.px(3, 10, 'w'); p.px(12, 10, 'w'); });
D('ramen', p => { p.r(5, 2, 1, 6, 'n'); p.r(8, 1, 1, 7, 'n'); p.e(8, 9, 6.5, 2, 'C'); p.r(2, 9, 13, 2, 'P'); p.e(8.5, 11, 6, 3.5, 'P', (i, j) => j >= 10); p.px(6, 8, 'y'); p.px(10, 8, 'w'); p.px(11, 8, 'G'); p.r(4, 11, 8, 1, 'p'); });
D('bolsa', p => { p.r(3, 5, 10, 9, 'P'); p.r(5, 2, 1, 4, 'N'); p.r(10, 2, 1, 4, 'N'); p.r(6, 2, 4, 1, 'N'); p.r(3, 5, 10, 1, 'R'); p.e(8, 10, 2, 2, 'w'); p.px(8, 10, 'p'); });
D('labial', p => { p.r(6, 9, 4, 5, 'Y'); p.r(6, 8, 4, 1, 'y'); p.r(7, 3, 2, 5, 'R'); p.px(7, 2, 'R'); p.px(8, 3, 'P'); p.px(6, 10, 'w'); });
D('unas', p => { p.r(6, 9, 4, 5, 'L'); p.r(6, 7, 4, 2, 'n'); p.r(7, 2, 1, 5, 'N'); p.px(8, 3, 'P'); p.px(8, 4, 'P'); p.px(6, 10, 'w'); p.e(12.5, 11, 1.8, 2, 'P'); p.px(12, 10, 'p'); });
D('ticket', p => { p.r(1, 5, 14, 7, 'p'); p.px(1, 8, null); p.px(14, 8, null); p.r(5, 5, 1, 7, 'P'); p.px(9, 7, 'y'); p.map(8, 7, ['.y.', 'yYy', '.y.']); });
D('audif', p => { p.map(2, 3, ['...LLLLLL...', '..L......L..', '.L........L.', '.L........L.']); p.r(1, 7, 3, 5, 'P'); p.r(12, 7, 3, 5, 'P'); p.px(2, 8, 'p'); p.px(13, 8, 'p'); });
D('monedero', p => { p.r(2, 5, 12, 9, 'P'); p.e(8, 5, 6, 2.2, 'P', (i, j) => j < 5); p.r(6, 2, 1, 2, 'Y'); p.r(9, 2, 1, 2, 'Y'); p.r(2, 7, 12, 1, 'R'); p.px(3, 9, 'p'); p.e(11, 11, 1.4, 1.4, 'y'); });
D('banco', p => { p.map(1, 1, ['......YY......', '....YYYYYY....', '..YYYYYYYYYY..', 'YYYYYYYYYYYYYY']); p.r(2, 6, 2, 6, 'c'); p.r(6, 6, 2, 6, 'c'); p.r(9, 6, 2, 6, 'c'); p.r(12, 6, 2, 6, 'c'); p.r(1, 12, 14, 2, 'C'); p.px(7, 2, 'w'); });
D('tarjeta', p => { p.r(1, 4, 14, 9, 'B'); p.r(1, 6, 14, 2, 'N'); p.r(3, 9, 3, 2, 'Y'); p.r(8, 10, 5, 1, 'l'); p.px(2, 5, 'l'); });
D('laptop', p => { p.r(3, 3, 10, 7, 'L'); p.r(4, 4, 8, 5, 'l'); p.r(1, 10, 14, 2, 'C'); p.px(5, 5, 'w'); p.px(9, 7, 'P'); });
D('playa', p => { p.e(8, 6, 7, 4, 'P', (i, j) => j <= 6); for (let i = 1; i < 15; i += 3) p.r(i, 3, 1, 4, 'w'); p.r(8, 6, 1, 7, 'n'); p.r(1, 13, 14, 2, 'y'); p.px(3, 12, 'Y'); });
D('salvavidas', p => { p.e(8, 8, 7, 7, 'R'); p.e(8, 8, 3, 3, null); for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const dx = i + .5 - 8, dy = j + .5 - 8; if (dx * dx + dy * dy < 9) p.clear(i, j); } p.r(7, 1, 2, 3, 'w'); p.r(7, 12, 2, 3, 'w'); p.r(1, 7, 3, 2, 'w'); p.r(12, 7, 3, 2, 'w'); });
D('pastel', p => { p.r(2, 8, 12, 6, 'C'); p.r(2, 8, 12, 2, 'P'); p.px(4, 10, 'P'); p.px(9, 10, 'P'); p.r(2, 11, 12, 1, 'p'); p.r(7, 4, 2, 4, 'l'); p.px(7, 2, 'y'); p.px(8, 3, 'Y'); });
D('pizza', p => { p.map(2, 2, ['YYYYYYYYYYYY', '.yyRyyyyRyy.', '..yyyyRyyy..', '...yRyyyy...', '....yyyRy...', '.....yyy....', '......y.....']); });
D('helado', p => { p.e(8, 5, 4.5, 3.5, 'p'); p.px(6, 4, 'w'); p.px(9, 3, 'P'); p.map(4, 8, ['YYYYYYYY', '.YyYyYY.', '..YyYY..', '...YY...', '...Y....']); });
D('pan', p => { p.e(8, 9, 7, 4.5, 'a'); p.r(4, 6, 1, 3, 'A'); p.r(8, 6, 1, 3, 'A'); p.r(11, 7, 1, 3, 'A'); p.px(3, 9, 'y'); });
D('gota', p => { p.map(5, 2, ['..B...', '.BBB..', '.BBB..', 'BBBBB.', 'BlBBB.', 'BlBBB.', 'BBBBB.', '.BBB..']); });
D('gasolina', p => { p.r(3, 3, 7, 11, 'R'); p.r(4, 4, 5, 3, 'l'); p.r(10, 5, 2, 1, 'N'); p.r(12, 5, 1, 6, 'N'); p.r(2, 14, 9, 1, 'N'); });
D('gym', p => { p.r(1, 6, 2, 4, 'L'); p.r(3, 4, 2, 8, 'B'); p.r(5, 7, 6, 2, 'C'); p.r(11, 4, 2, 8, 'B'); p.r(13, 6, 2, 4, 'L'); });
D('escuela', p => { p.map(1, 3, ['......NN......', '....NNNNNN....', '..NNNNNNNNNN..', 'NNNNNNNNNNNNNN', '..NNNNNNNNNN.Y', '...NNNNNNNN..Y', '...NNNNNNNN.YY']); });
D('planta', p => { p.r(5, 10, 6, 4, 'n'); p.r(4, 10, 8, 1, 'N'); p.e(5.5, 6, 2.5, 2, 'G'); p.e(10.5, 5, 2.5, 2, 'G'); p.r(7, 5, 2, 5, 'G'); p.e(8, 3, 1.5, 2, 'g'); });
D('moneda', p => { p.e(8, 8, 6.5, 6.5, 'y'); p.e(8, 8, 4.5, 4.5, 'Y'); p.r(7, 5, 2, 6, 'y'); p.px(5, 4, 'w'); });
D('palomitas', p => { p.map(3, 2, ['.ww.ww.', 'wwwwwww', 'wywwyww']); p.map(3, 5, ['RwRwRwR', 'RwRwRwR', '.RwRwR.', '.RwRwR.', '.RwRwR.', '..RwR..']); }, 16, 16);
D('trofeo', p => { p.r(4, 2, 8, 6, 'y'); p.e(8, 7, 4, 3, 'y'); p.r(2, 3, 2, 3, 'Y'); p.r(12, 3, 2, 3, 'Y'); p.r(7, 9, 2, 3, 'Y'); p.r(5, 12, 6, 2, 'n'); p.px(5, 3, 'w'); });
D('escudo', p => { p.r(3, 2, 10, 6, 'l'); p.e(8, 8, 5, 6, 'l', (i, j) => j >= 7); p.r(7, 4, 2, 8, 'P'); p.r(5, 6, 6, 2, 'P'); p.px(4, 3, 'w'); });
D('brote', p => { p.r(7, 8, 2, 6, 'G'); p.e(5, 6, 3, 2, 'G'); p.e(11, 5, 3, 2, 'g'); p.r(4, 14, 8, 1, 'n'); });
D('fuego', p => { p.map(4, 1, ['....R...', '...RR...', '..RRR.R.', '.RRPRRR.', '.RPPPRR.', 'RRPyPPRR', 'RPyyyPRR', 'RPyyyyPR', 'RPyyyyPR', '.RPyyPR.', '..RRRR..']); });
D('espiral', p => { const pts = [[8, 8], [9, 8], [9, 7], [8, 6], [7, 6], [6, 7], [6, 8], [6, 9], [7, 10], [8, 10], [9, 10], [10, 9], [11, 8], [11, 7], [11, 6], [10, 5], [9, 4], [8, 4], [7, 4], [6, 4], [5, 5], [4, 6], [4, 7], [4, 8], [4, 9], [4, 10], [5, 11], [6, 12], [7, 12], [8, 12], [9, 12], [10, 12], [11, 11], [12, 10], [13, 9]]; pts.forEach(([x, y]) => p.px(x, y, 'B')); });
D('nube', p => { p.e(6, 9, 4, 3, 'w'); p.e(10, 8, 4.5, 4, 'w'); p.r(2, 9, 12, 3, 'w'); p.px(9, 6, 'l'); });
D('zzz', p => { p.map(2, 3, ['BBBB....', '..B.....', '.B......', 'BBBB.BBB', '......B.', '.....BBB']); p.map(11, 1, ['BBB', '.B.', 'BBB']); });
D('alerta', p => { p.r(7, 2, 3, 8, 'R'); p.r(7, 12, 3, 3, 'R'); p.px(7, 2, 'P'); });
D('pic', p => { p.r(1, 2, 14, 12, 'Y'); p.r(2, 3, 12, 10, 'l'); p.e(5, 6, 1.5, 1.5, 'y'); p.map(2, 7, ['.....G......', '....GGG..G..', '...GGGGGGGG.', '..GGGGGGGGGG']); });
D('candado', p => { p.r(3, 7, 10, 7, 'Y'); p.map(4, 2, ['..NNNN..', '.N....N.', '.N....N.', '.N....N.', '.N....N.']); p.r(7, 9, 2, 3, 'N'); p.px(4, 8, 'y'); });
D('check', p => { p.map(2, 4, ['..........G.', '.........GG.', '........GG..', 'G......GG...', 'GG....GG....', '.GG..GG.....', '..GGGG......', '...GG.......']); });
D('estrellita', p => { p.map(1, 2, ['.......y......', '......yy......', '......yyy.....', 'yyyyyyyyyyyyy.', '.yyyywyyyyyy..', '...yyyyyyyy...', '...yyyyyyyy...', '..yyyy..yyyy..', '..yyy....yyy..', '.yy.......yy..']); });
D('diamante', p => { p.map(1, 3, ['...BBBBBBBB...', '..BlwBllBllB..', '.BBBBBBBBBBBB.', '..BllllllllB..', '...BllllllB...', '....BllllB....', '.....BllB.....', '......BB......']); });
D('casita', p => { p.map(1, 1, ['......PP......', '.....PPPP.....', '....PPPPPP....', '...PPPPPPPP...', '..PPPPPPPPPP..', '.PPPPPPPPPPPP.']); p.r(3, 7, 10, 7, 'c'); p.r(7, 10, 2, 4, 'n'); p.r(4, 8, 2, 2, 'l'); p.r(10, 8, 2, 2, 'l'); });
D('cine', p => { p.r(2, 6, 12, 8, 'N'); p.map(2, 2, ['NwNNwNNwNNwN', 'NNNNNNNNNNNN']); p.r(3, 7, 10, 6, 'L'); p.px(6, 9, 'y'); p.px(10, 10, 'P'); });
const bank = roof => p => { p.map(1, 1, ['......' + roof + roof + '......', '....' + roof.repeat(6) + '....', '..' + roof.repeat(10) + '..', roof.repeat(14)]); p.r(2, 6, 2, 6, 'c'); p.r(6, 6, 2, 6, 'c'); p.r(9, 6, 2, 6, 'c'); p.r(12, 6, 2, 6, 'c'); p.r(1, 12, 14, 2, 'C'); p.px(7, 2, 'w'); };
D('banco_azul', bank('B')); D('banco_verde', bank('G')); D('banco_rosa', bank('P')); D('banco_lila', bank('q'));
D('tarjeta_debito', p => { p.r(1, 4, 14, 9, 'G'); p.r(1, 6, 14, 2, 'D'); p.r(3, 9, 3, 2, 'Y'); p.r(8, 10, 5, 1, 'g'); p.px(2, 5, 'g'); });
D('tarjeta_rosa', p => { p.r(1, 4, 14, 9, 'P'); p.r(1, 6, 14, 2, 'R'); p.r(3, 9, 3, 2, 'Y'); p.r(8, 10, 5, 1, 'p'); p.px(2, 5, 'p'); });
D('billetera_digital', p => { p.r(3, 1, 9, 14, 'L'); p.r(4, 2, 7, 10, 'l'); p.px(7, 13, 'w'); p.e(11.5, 10.5, 3.3, 3.3, 'y'); p.r(11, 9, 1, 3, 'Y'); p.px(5, 3, 'w'); });
D('pago_movil', p => { p.r(3, 1, 9, 14, 'P'); p.r(4, 2, 7, 10, 'p'); p.px(7, 13, 'w'); p.map(5, 5, ['....G', '...GG', 'G.GG.', 'GGG..', '.G...']); });
D('pago_qr', p => { p.r(1, 1, 14, 14, 'w'); p.r(2, 2, 4, 4, 'N'); p.r(10, 2, 4, 4, 'N'); p.r(2, 10, 4, 4, 'N'); p.px(3, 3, 'w'); p.px(4, 4, 'w'); p.px(11, 3, 'w'); p.px(12, 4, 'w'); p.px(3, 11, 'w'); p.px(4, 12, 'w'); [[7, 2], [8, 4], [7, 6], [9, 7], [11, 8], [13, 7], [7, 9], [9, 10], [11, 11], [13, 13], [10, 13], [8, 12], [12, 10]].forEach(([x, y]) => p.px(x, y, 'N')); });
D('tienda_app', p => { p.r(3, 1, 9, 14, 'B'); p.r(4, 2, 7, 10, 'l'); p.px(7, 13, 'w'); p.r(5, 6, 5, 4, 'P'); p.r(6, 4, 1, 2, 'N'); p.r(8, 4, 1, 2, 'N'); });
D('nube_dinero', p => { p.e(6, 9, 4, 3, 'l'); p.e(10, 8, 4.5, 4, 'l'); p.r(2, 9, 12, 3, 'l'); p.e(8, 9.5, 2.4, 2.4, 'y'); p.r(8, 8, 1, 3, 'Y'); });
D('alcancia', p => { p.e(8, 9, 6, 4.5, 'p'); p.r(4, 12, 2, 2, 'p'); p.r(10, 12, 2, 2, 'p'); p.px(5, 5, 'p'); p.r(12, 8, 2, 2, 'P'); p.px(10, 8, 'k'); p.r(7, 5, 3, 1, 'N'); p.px(4, 8, 'w'); });
D('inversion', p => { p.r(2, 13, 12, 1, 'N'); p.r(3, 10, 2, 3, 'g'); p.r(6, 8, 2, 5, 'G'); p.r(9, 5, 2, 8, 'G'); p.line(3, 8, 12, 2, 'P'); p.map(11, 1, ['PPP', '..P', '..P']); });
D('prestamo', p => { p.r(2, 3, 12, 10, 'c'); p.r(2, 3, 12, 2, 'R'); p.r(4, 7, 6, 1, 'n'); p.r(4, 9, 4, 1, 'n'); p.e(11.5, 10.5, 2.4, 2.4, 'y'); });
const face = (draw) => p => { p.e(8, 8.5, 6.6, 6.2, 'y'); p.px(4, 5, 'w'); p.px(5, 4, 'w'); p.r(3, 10, 2, 1, 'p'); p.r(11, 10, 2, 1, 'p'); draw(p); };
D('f_feliz', face(p => { p.r(5, 6, 1, 2, 'k'); p.r(10, 6, 1, 2, 'k'); p.map(6, 10, ['k...k', '.kkk.']); }));
D('f_tranquila', face(p => { p.map(4, 7, ['kk..', '....']); p.map(9, 7, ['.kk', '...']); p.map(6, 10, ['k...k', '.kkk.']); }));
D('f_emocionada', face(p => { p.map(4, 5, ['.Y.', 'YYY', '.Y.']); p.map(9, 5, ['.Y.', 'YYY', '.Y.']); p.map(6, 9, ['kkkkk', 'kRRRk', '.kkk.']); }));
D('f_cansada', face(p => { p.r(4, 7, 3, 1, 'k'); p.r(9, 7, 3, 1, 'k'); p.r(7, 11, 2, 1, 'k'); p.map(12, 1, ['BBB', '.B.', 'BBB']); }));
D('f_aburrida', face(p => { p.r(4, 6, 3, 1, 'k'); p.r(9, 6, 3, 1, 'k'); p.px(5, 7, 'k'); p.px(10, 7, 'k'); p.r(6, 11, 4, 1, 'k'); }));
D('f_triste', face(p => { p.r(5, 6, 1, 2, 'k'); p.r(10, 6, 1, 2, 'k'); p.map(6, 10, ['.kkk.', 'k...k']); p.r(4, 8, 1, 2, 'B'); }));
D('f_estresada', face(p => { p.map(4, 5, ['k..', '.k.', 'k..']); p.map(10, 5, ['..k', '.k.', '..k']); p.map(5, 10, ['.k.k.k', 'k.k.k.']); }));
D('f_ansiosa', face(p => { p.r(5, 6, 1, 2, 'k'); p.r(10, 6, 1, 2, 'k'); p.r(6, 10, 4, 2, 'k'); p.map(12, 3, ['.B', 'BB', 'BB']); }));
D('ui_ojo', p => { p.e(8, 8, 7, 4, 'w'); p.e(8, 8, 3, 3, 'B'); p.e(8, 8, 1.4, 1.4, 'k'); p.px(9, 7, 'w'); });
D('ui_texto', p => { p.r(2, 2, 12, 3, 'P'); p.r(6, 5, 4, 9, 'P'); p.px(3, 3, 'p'); });
D('ui_lapiz', p => { p.line(3, 13, 12, 4, 'y'); p.line(4, 13, 13, 4, 'y'); p.line(3, 12, 12, 3, 'Y'); p.r(12, 2, 2, 2, 'P'); p.px(2, 14, 'k'); p.px(3, 13, 'C'); });
D('ui_borrador', p => { p.map(2, 4, ['......PPPP..', '.....PPPPPP.', '....PPPPPPP.', '...lPPPPPP..', '..lllPPPP...', '.llllPPP....', 'lllllPP.....', '.lllll......']); });
D('ui_formas', p => { p.map(1, 2, ['...P....', '..PPP...', '..PPP...', '.PPPPP..', 'PPPPPPP.']); p.r(8, 8, 6, 6, 'B'); p.e(5, 11, 3, 3, 'y'); });
D('ui_nota', p => { p.r(2, 2, 12, 12, 'y'); p.map(10, 10, ['...Y', '..YY', '.YYY', 'YYYY']); p.r(4, 5, 7, 1, 'Y'); p.r(4, 8, 5, 1, 'Y'); });
D('ui_washi', p => { p.e(6, 8, 5, 5, 'p'); p.e(6, 8, 2, 2, 'w'); p.r(6, 9, 9, 4, 'p'); for (let i = 7; i < 15; i += 2) p.px(i, 10, 'w'); p.px(15, 9, null); p.px(15, 12, null); });
D('ui_pagina', p => { p.r(3, 1, 10, 14, 'c'); p.map(10, 1, ['NNN', '.NN', '..N']); p.r(5, 5, 6, 1, 'L'); p.r(5, 8, 6, 1, 'L'); p.r(5, 11, 4, 1, 'L'); });
D('ui_plantilla', p => { p.r(3, 3, 10, 12, 'C'); p.r(6, 1, 4, 3, 'L'); p.r(5, 6, 1, 1, 'G'); p.r(7, 6, 4, 1, 'n'); p.r(5, 9, 1, 1, 'G'); p.r(7, 9, 4, 1, 'n'); p.r(5, 12, 1, 1, 'P'); p.r(7, 12, 3, 1, 'n'); });
D('ui_paginas', p => { p.r(5, 1, 9, 11, 'l'); p.r(2, 4, 9, 11, 'c'); p.r(4, 7, 5, 1, 'L'); p.r(4, 10, 5, 1, 'L'); });
D('ui_marcador', p => { p.map(4, 1, ['PPPPPPPP', 'PPPPPPPP', 'PPwPPPPP', 'PPPPPPPP', 'PPPPPPPP', 'PPPPPPPP', 'PPPPPPPP', 'PPPPPPPP', 'PPPPPPPP', 'PPP..PPP', 'PP....PP', 'P......P']); });
D('ui_luna', p => { p.e(8, 8, 6, 6, 'y'); for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const dx = i + .5 - 11, dy = j + .5 - 6; if (dx * dx + dy * dy <= 22) p.clear(i, j); } p.px(5, 9, 'Y'); });
D('ui_sol', p => { p.e(8, 8, 3.6, 3.6, 'y'); [[8, 1], [8, 14], [1, 8], [14, 8], [3, 3], [13, 3], [3, 13], [13, 13]].forEach(([x, y]) => p.px(x, y, 'Y')); });
D('ui_bolsa', p => { p.r(3, 5, 10, 9, 'p'); p.r(5, 2, 1, 4, 'N'); p.r(10, 2, 1, 4, 'N'); p.r(6, 2, 4, 1, 'N'); p.e(8, 9.5, 1.6, 1.6, 'P'); });
D('ui_transfer', p => { p.map(1, 3, ['.........B....', '.........BB...', 'BBBBBBBBBBBB..', '.........BB...', '.........B....']); p.map(1, 9, ['....P.........', '...PP.........', '..PPPPPPPPPPPP', '...PP.........', '....P.........']); });
window.EMOJI_TO_ICON = {
'💼': 'maletin', '✨': 'sparkle', '💡': 'foco', '📶': 'wifi', '🚌': 'bus', '💊': 'med', '🍓': 'ramen', '🛍️': 'bolsa', '💅': 'unas', '🎀': 'ticket', '🎧': 'audif',
'👛': 'monedero', '💳': 'tarjeta', '💻': 'laptop', '🏖️': 'playa', '🛟': 'salvavidas', '⭐': 'star', '🏦': 'banco', '🪙': 'moneda', '⏰': 'repeat', '🔮': 'crystal',
'🍰': 'pastel', '🎂': 'pastel', '🍕': 'pizza', '🍦': 'helado', '☕': 'coffee', '🛒': 'cart', '🏠': 'casita', '🏡': 'casita', '📱': 'phone', '🎁': 'gift', '🐷': 'piggy', '🐖': 'piggy',
'💎': 'diamante', '🚗': 'car', '✈️': 'plane', '🎮': 'game', '📚': 'book2', '🎵': 'music', '🐾': 'paw', '🌷': 'flower', '🌸': 'flower', '💖': 'heart', '💗': 'heart', '🌙': 'moon'
};
window.FEEL_ICON = { feliz: 'f_feliz', tranquila: 'f_tranquila', emocionada: 'f_emocionada', cansada: 'f_cansada', aburrida: 'f_aburrida', triste: 'f_triste', estresada: 'f_estresada', ansiosa: 'f_ansiosa' };
window.MOOD_ICON = { genial: 'f_emocionada', bien: 'f_feliz', normal: 'f_aburrida', cansado: 'f_cansada', dificil: 'f_triste' };
// --- Bolsillito 2026: mascotas postre nuevas, ojito cerrado e íconos de la barra dibujados a mano ---
D('maca', p => { // macarón rosa
  p.e(10, 14.5, 7.8, 3.8, 'p'); p.e(10, 15, 6.8, 2.6, 'r');
  p.r(3, 11, 15, 2, 'w'); p.r(3, 12, 15, 1, 'c');
  p.e(10, 7.6, 7.8, 4.4, 'p'); p.e(10, 7, 6.8, 3.2, 'r');
  p.px(7, 8, 'k'); p.px(13, 8, 'k'); p.px(7, 7, 'k'); p.px(13, 7, 'k'); p.r(5, 9, 2, 1, 'P'); p.r(14, 9, 2, 1, 'P'); p.px(10, 9, 'k');
  p.px(6, 5, 'w'); p.px(7, 4, 'w');
}, 20, 20);
D('dony', p => { // dona glaseada
  p.e(10, 11, 8.6, 7, 'a'); p.e(10, 10, 8, 6, 'h');
  p.e(10, 6.6, 2, 1.4, 'a');
  p.px(7, 11, 'k'); p.px(13, 11, 'k'); p.px(7, 10, 'k'); p.px(13, 10, 'k'); p.r(5, 12, 2, 1, 'P'); p.r(14, 12, 2, 1, 'P'); p.px(9, 12, 'k'); p.px(11, 12, 'k'); p.px(10, 13, 'k');
  p.px(4, 8, 'y'); p.px(15, 7, 'b'); p.px(16, 11, 'y'); p.px(6, 6, 'P'); p.px(14, 5, 'g'); p.px(5, 14, 'b'); p.px(15, 14, 'P'); p.px(5, 7, 'w');
}, 20, 20);
D('gela', p => { // gelatina
  p.r(4, 17, 13, 2, 'l'); p.r(3, 18, 15, 1, 'L');
  p.e(10, 11, 7, 7, 'r'); p.r(3, 11, 15, 7, 'r'); p.e(10, 11, 5.6, 6, 'p');
  p.r(5, 6, 11, 1, 'w'); p.px(5, 8, 'w'); p.px(5, 9, 'w');
  p.px(7, 11, 'k'); p.px(13, 11, 'k'); p.px(7, 10, 'k'); p.px(13, 10, 'k'); p.r(5, 13, 2, 1, 'P'); p.r(14, 13, 2, 1, 'P'); p.px(10, 13, 'k');
  p.e(10, 2.6, 1.6, 1.6, 'R'); p.px(10, 4, 'G');
}, 20, 20);
D('cupi', p => { // cupcake
  p.e(10, 8, 7, 4.6, 'h'); p.e(10, 5, 4.6, 3, 'h'); p.e(10, 2.4, 1.8, 1.6, 'R');
  p.r(4, 12, 13, 7, 'y'); p.r(6, 12, 1, 7, 'Y'); p.r(10, 12, 1, 7, 'Y'); p.r(14, 12, 1, 7, 'Y');
  p.px(7, 8, 'k'); p.px(13, 8, 'k'); p.px(7, 7, 'k'); p.px(13, 7, 'k'); p.r(5, 10, 2, 1, 'P'); p.r(14, 10, 2, 1, 'P'); p.px(10, 10, 'k');
  p.px(6, 5, 'w'); p.px(7, 4, 'w');
}, 20, 20);
D('silueta', p => { p.e(10, 12, 7.6, 6.2, 'C'); p.e(10, 8, 5, 4, 'C'); p.map(8, 9, ['.CC.', 'C..C', '...C', '..C.', '....', '..C.']); }, 20, 20);

// alitas para la evolución
D('ojo_cerrado', p => { p.map(1, 6, ['..L.........L..', '.LLL.......LLL.', '...LLLLLLLLL...', '.....L..L..L...']); });

// ---------- Mascotas postre nuevas (20x20) ----------
Pix.define('m_inicio', { raw: ["....................",".............01.....","............0231....","........44440231....",".......455554231....",".....44555555667....","....455555588889....","..4455555888888a99..",".455555888888aaaaa9.","45555888888aaaaaaaa9",".444bccccccccccd999.","...ebfghhhhhhfgdi...","...ebjjhkllmhjjdi...","...ebhhhknnmhhhdi...","...ebhhhknnmhhhdi...","...ebhhhknnohhhdi...","...ebhhhknnmhhhdi...","..ppqqqqrrrrqqqqpp..",".pssssssssssssssssp.","..pppppppppppppppp.."], pal: '#88574f,#7c4741,#d4a072,#b3774d,#944c60,#f2849f,#a86d4b,#784340,#d17089,#7e3f52,#b86279,#fff3e0,#fff5e4,#dec9bc,#997679,#b2dbf2,#91b1cd,#fff1dc,#8c666b,#8aa0bb,#c6916d,#d4ab8e,#a56848,#b8774c,#ffe08a,#6d654c,#ceb5ab,#9c6047,#8cc56a' });
Pix.define('m_movs', { raw: ["....................","....000000000000....","...01111111111110...","...23333333333332...","...23333333333332...","...45555555555567...","...45555555555567...","...45588599999567...","...45588555555567...","...45555555555567...","...45588599999567...","...45588555555567...","...45555555555567...","...45588599999567...","...45588555555567...","...45555555555567...","...45555555555567...","...abbbbbbbbbbbba...","....aaaaaaaaaaaa....","...................."], pal: '#996676,#ffc9d7,#96596c,#f7a6bd,#99797f,#fffaf0,#ded0cc,#8c6971,#a6d886,#c9a7a0,#86616a,#cebcb9' });
Pix.define('m_anotar', { raw: ["....................",".......011111.......",".....0123333344.....","....023333333554....","...12333333355554...","..1333333665555554..","..1333333665555554..",".133333556655555554.",".133335556655555554.",".133566666666665578.",".135566666666665778.",".455555556655577778.",".455555556655777778.","..4555555667777778..","..455555566777799a..","...4555577777799a...","....45577777999a....",".....44777799aa.....",".......8888aa.......","...................."], pal: '#987268,#966c53,#fce7b2,#f9d87d,#956641,#f6c94c,#ffffff,#d4a648,#88593f,#bb8d45,#7f503e' });
Pix.define('m_mes', { raw: ["....................",".....00......00.....","....0110....0110....","..2331133333311334..",".256611666666116674.",".258811888888118874.",".258888888888888874.",".9aaaaaaaaaaaaaaaa9.",".bcccccccccccccccde.",".bcccccccccccccccde.",".bccfccfccfccfcccde.",".bcccccccccccccccde.",".bccccccccc8c8cccde.",".bccfccfccf888cccde.",".bcccccccccc8ccccde.",".bccfccfccfccfcccde.",".bcccccccccccccccde.",".ghhhhhhhhhhhhhhhhg.","..gggggggggggggggg..","...................."], pal: '#75484c,#a07a6a,#955566,#965e6d,#884559,#f59caf,#f7b3bf,#d4728b,#f2849f,#824255,#c46981,#99797f,#fffaf0,#ded0cc,#8c6971,#d9c0b4,#86616a,#cebcb9' });
Pix.define('m_journal', { raw: ["....................","...00111111111112...","..0334444444444456..","..03377777777777586.","..03377777777777586.","..03379aaaaaaab7586.","..033798ccccc8b7586.","..033798ccc888b7586.","..0337ddddddddd7586.","..03377777777777586.","..03377777777777586.","..03377777777777586.","..03377777777777586.","..03377777777777586.","..0337777777ee77586.","..0337777777ee77586.","..0337777777ee77586.","..033fffffffeefff6..","...00gggggggeeggg...","............heh....."], pal: '#8d4a5d,#976673,#8a5062,#e07d97,#fac8d1,#d88da3,#99787e,#f7a6bd,#fff6ee,#fff7ee,#fff8ef,#decdca,#e8b5c2,#ceb9b8,#ffe08a,#c88196,#844b5d,#996f58' });
Pix.define('m_mas', { raw: ["....................","....................","......01111111......","....012333333344....","...12333333335554...","..1333333335555554..",".133333335555555554.",".133333555555555554.",".133335555555555554.",".133677556775567754.",".455777557775577789.",".455777557775577789.",".455555555555888889.",".4555555555888888ab.","..4555555888888aab..","...45558888888aab...","....44888888aabb....","......999999bb......","....................","...................."], pal: '#99787c,#99777a,#fff7e8,#fff4e2,#997678,#fff1dc,#f28aac,#c4506f,#dbc5b8,#8b656a,#c0a59e,#815960' });
Pix.define('m_billetera', { raw: ["....................","....................","....011111112.......","...03444444452......","..6637777777566666..",".688999999999888886.",".688888888888888886.",".abccccccccccccccde.",".abccccccccccccccde.",".abccccccccfggggghi.",".abccccccccfjkljjhi.",".abccccccccfjlljjhi.",".abccccccccfjlmjjhi.",".abccccccccnnnnnnno.",".abccccccccccccccde.",".abccccccccccccccde.",".pqqqqqqqqqqqqqqqqp.","..pppppppppppppppp..","....................","...................."], pal: '#7e6f5f,#857167,#715f51,#b8df9b,#cae6b0,#97b577,#8e5a4c,#a6d886,#e3a96a,#8fa46f,#88574f,#d4a072,#c98a52,#b3774d,#7c4741,#b98662,#cba386,#985c3e,#723d3c,#a8693f,#f9d87d,#f6c94c,#d4a648,#91563e,#6f3b3c,#784340,#a86d4b' });
Pix.define('m_ojo', { raw: ["....................","....................","....................","....................",".....0011111111.....","...01223333333344...","..1233333553666664..",".133333755588666664.","13333335569886666664","133366559aaa88666664","46666688aaabcc66ddde","466666688bfccdddddde",".46666688cccgddddhe.","..466666dcgdddhhhi..","...44ddddddhhhhii...",".....eeeeeeiiii.....","....................","....................","....................","...................."], pal: '#997a81,#997b83,#fffcf6,#fffefb,#997b85,#a5cae9,#ffffff,#cee0ec,#7fb6e6,#767f9d,#3b4a7a,#42436c,#7797c0,#dbd0d4,#8b6975,#473e62,#7181a5,#c0aeb4,#815c68' });
Pix.define('m_estrellita', { raw: ["....................","....................",".........00.........","........0110........","........2332........",".......233332.......","......22333322......","..0222333333332244..",".013333333333333554.","..0333333333333554..","...23336333365554...","....233733337554....",".....2333885554.....",".....2333555559.....","....233555555aa9....","....2355544aaaa9....","....45554..9aaa9....","....4544....99a9....",".....4........9.....","...................."], pal: '#976e53,#fbdc7c,#966940,#f9cf4a,#895b3f,#d6ab46,#ffffff,#3b2230,#e07d97,#80513e,#bd9044' });
})();
;
(function () {
const LS = 'lunabelle:';
const Store = {
mode: 'local', isOwner: false, config: null, db: null, uid: null, assets: null, downloads: null,
docs: {}, timers: {}, chains: {}, listeners: [], status: 'idle',
async init() {
if (window.MEFFY_SUPA && window.supabase) return this.initSupa();
const cl = window.claude;
if (cl && typeof cl.use === 'function') {
try {
const [db, user] = await Promise.all([cl.use('db'), cl.use('user')]);
if (db && user) {
const uid = await user.id();
try { this.isOwner = await user.isOwner(); } catch (e) { this.isOwner = false; }
try { const c = await db.doc('config/app').get(); if (c.exists) this.config = JSON.parse(JSON.stringify(c.data())); } catch (e) {}
if (uid) {
this.db = db; this.uid = uid; this.mode = 'cloud';
const snap = await db.collection('data/users/' + uid).get();
snap.docs.forEach(d => { if (d.exists) this.docs[d.id] = JSON.parse(JSON.stringify(d.data())); });
}
}
} catch (e) { console.warn('db unavailable, using this device', e); this.mode = 'local'; this.db = null; }
cl.use('assets').then(a => { this.assets = a; }).catch(() => {});
cl.use('downloads').then(d => { this.downloads = d; }).catch(() => {});
}
if (this.mode === 'local') {
this.isOwner = true; // on this device you are the owner
try { const c = localStorage.getItem(LS + '__config'); if (c) this.config = JSON.parse(c); } catch (e) {}
try {
for (let i = 0; i < localStorage.length; i++) {
const k = localStorage.key(i);
if (k && k.startsWith(LS) && !k.endsWith('__config')) this.docs[k.slice(LS.length)] = JSON.parse(localStorage.getItem(k));
}
} catch (e) { /* storage blocked: work in memory */ }
}
return this;
},
phoneEmail(raw) {
let d = String(raw || '').replace(/\D/g, '');
if (d.length === 10 && d.startsWith('0')) d = '593' + d.slice(1); else if (d.length === 9 && d.startsWith('9')) d = '593' + d;
return { phone: d, email: d + '@phone.meffy.app' };
},
async initSupa() {
const C = window.MEFFY_SUPA;
const sb = this.sb = supabase.createClient(C.url, C.key, { auth: { persistSession: true, autoRefreshToken: true } });
try { const { data } = await sb.from('app_config').select('body').eq('id', 1).single(); if (data && data.body && Object.keys(data.body).length) this.config = data.body; } catch (e) {}
let { data: { session } } = await sb.auth.getSession();
if (!session) { await window.Auth.show(this); ({ data: { session } } = await sb.auth.getSession()); }
this.uid = session.user.id;
const { data: prof, error: pe } = await sb.from('profiles').select('*').eq('id', this.uid).single();
if (pe || !prof) { await sb.auth.signOut(); location.reload(); return new Promise(() => {}); }
if (prof.blocked) { await sb.auth.signOut(); window.Auth.blocked(); return new Promise(() => {}); }
this.profile = prof; this.isOwner = prof.role === 'admin'; this.mode = 'supa';
const { data: rows } = await sb.from('user_docs').select('doc_id, body').eq('user_id', this.uid);
(rows || []).forEach(r => { this.docs[r.doc_id] = r.body; });
sb.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', this.uid).then(() => {});
sb.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_OUT') location.reload(); });
return this;
},
async signOut() { if (this.sb) { this.flushAll(); await new Promise(r => setTimeout(r, 400)); await this.sb.auth.signOut(); } location.reload(); },
async changePassword(pw) { const { error } = await this.sb.auth.updateUser({ password: pw }); if (error) throw error; },
async adminCall(body) {
const { data, error } = await this.sb.functions.invoke('admin-users', { body });
if (error) { let msg = 'No se pudo completar.'; try { const j = await error.context.json(); msg = j.error || msg; } catch (e) {} throw new Error(msg); }
if (data && data.error) throw new Error(data.error);
return data;
},
get(id) { return this.docs[id]; },
ids(prefix) { return Object.keys(this.docs).filter(k => k.startsWith(prefix)); },
put(id, obj, delay) {
this.docs[id] = obj;
clearTimeout(this.timers[id]);
this.timers[id] = setTimeout(() => this.flush(id), delay == null ? 700 : delay);
this.setStatus('saving');
},
flush(id) {
const obj = this.docs[id];
const body = JSON.parse(JSON.stringify(obj || {}));
const run = async () => {
if (this.mode === 'supa') {
const { error } = await this.sb.from('user_docs').upsert({ user_id: this.uid, doc_id: id, body, updated_at: new Date().toISOString() });
if (error) { this.setStatus('error', 'No se pudo guardar. Revisa tu conexión.'); throw error; }
} else if (this.mode === 'cloud') {
const ref = this.db.collection('data/users/' + this.uid).doc(id);
try { await ref.set(body); }
catch (e) {
if (e && e.code === 'unavailable') { await new Promise(r => setTimeout(r, 800 + Math.random() * 600)); await ref.set(body); }
else { this.setStatus('error', e && e.code === 'invalid_argument' ? 'Esta página es muy grande para guardarse. Quita alguna imagen.' : 'No se pudo guardar. Revisa tu conexión.'); throw e; }
}
} else {
try { localStorage.setItem(LS + id, JSON.stringify(body)); }
catch (e) { this.setStatus('error', 'Tu navegador se quedó sin espacio. Exporta una copia y quita imágenes grandes.'); throw e; }
}
};
this.chains[id] = (this.chains[id] || Promise.resolve()).then(run).then(() => this.setStatus('saved')).catch(() => {});
return this.chains[id];
},
async remove(id) {
delete this.docs[id]; clearTimeout(this.timers[id]);
if (this.mode === 'supa') { try { await this.sb.from('user_docs').delete().eq('user_id', this.uid).eq('doc_id', id); } catch (e) {} }
else if (this.mode === 'cloud') { try { await this.db.collection('data/users/' + this.uid).doc(id).delete(); } catch (e) {} }
else { try { localStorage.removeItem(LS + id); } catch (e) {} }
},
flushAll() { Object.keys(this.timers).forEach(id => { clearTimeout(this.timers[id]); this.flush(id); }); },
setStatus(s, msg) { this.status = s; this.listeners.forEach(fn => fn(s, msg)); },
onStatus(fn) { this.listeners.push(fn); },
async saveConfig(cfg) {
this.config = cfg; const body = JSON.parse(JSON.stringify(cfg));
if (this.mode === 'supa') { const { error } = await this.sb.from('app_config').update({ body, updated_at: new Date().toISOString() }).eq('id', 1); if (error) throw error; }
else if (this.mode === 'cloud') { await this.db.doc('config/app').set(body); }
else { localStorage.setItem(LS + '__config', JSON.stringify(body)); }
},
async shrink(file, max, quality) {
const url = URL.createObjectURL(file);
try {
const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
const cv = document.createElement('canvas'); cv.width = Math.round(img.naturalWidth * s); cv.height = Math.round(img.naturalHeight * s);
const ctx = cv.getContext('2d');
const small = Math.max(img.naturalWidth, img.naturalHeight) <= 64; // keep pixel art crisp
ctx.imageSmoothingEnabled = !small; ctx.drawImage(img, 0, 0, cv.width, cv.height);
const png = file.type === 'image/png' || file.type === 'image/gif' || small;
const blob = await new Promise(r => cv.toBlob(r, png ? 'image/png' : 'image/jpeg', quality || 0.85));
return { blob, w: cv.width, h: cv.height, canvas: cv, png };
} finally { URL.revokeObjectURL(url); }
},
async saveImage(file, max) {
const { blob, canvas, png, w, h } = await this.shrink(file, max || 1400);
if (this.mode === 'supa') {
const path = this.uid + '/' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7) + (png ? '.png' : '.jpg');
const { error } = await this.sb.storage.from('images').upload(path, blob, { contentType: png ? 'image/png' : 'image/jpeg' });
if (!error) return { src: this.sb.storage.from('images').getPublicUrl(path).data.publicUrl, w, h };
console.warn('upload failed', error);
}
if (this.assets) {
try { const r = await this.assets.upload(blob); return { src: '/_blob/' + r.id, w, h }; }
catch (e) { console.warn('asset upload failed', e); }
}
const s = Math.min(1, 520 / Math.max(w, h));
const cv = document.createElement('canvas'); cv.width = Math.round(w * s); cv.height = Math.round(h * s);
cv.getContext('2d').drawImage(canvas, 0, 0, cv.width, cv.height);
return { src: cv.toDataURL(png ? 'image/png' : 'image/jpeg', 0.78), w: cv.width, h: cv.height };
},
async download(filename, data) {
if (this.mode === 'supa' || (!this.downloads && !window.claude)) {
const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type: filename.endsWith('.json') ? 'application/json' : 'text/csv' }));
const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
return { status: 'saved' };
}
if (!this.downloads) throw { code: 'unavailable' };
return this.downloads.save({ filename, data });
}
};
window.Store = Store; if (window.__offline) window.__offline(Store);
})();
;
(function () {
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const css = `
#authRoot { position: fixed; inset: 0; overflow: auto; z-index: 40; padding-top: env(safe-area-inset-top, 0px); }
.auth { position: relative; z-index: 2; min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 24px 16px; }
.auth-card { width: 100%; max-width: 400px; background: rgba(255,253,248,.94); border: 3px solid #fff; border-radius: 28px; box-shadow: 0 6px 0 #f7cbd8, 0 18px 40px rgba(120,70,70,.12); padding: 22px 20px 20px; display: flex; flex-direction: column; gap: 14px; color: #6b3b3f; }
.auth-hero { display: flex; justify-content: center; align-items: flex-end; gap: 2px; margin-top: -4px; }
.auth-hero img { image-rendering: pixelated; animation: bob 3s ease-in-out infinite; }
.auth-hero img:nth-child(2) { animation-delay: -1s; } .auth-hero img:nth-child(3) { animation-delay: -2s; } .auth-hero img:nth-child(4) { animation-delay: -.5s; }
.auth h1 { margin: 0; text-align: center; font-family: 'Fredoka', 'Nunito', sans-serif; font-weight: 600; font-size: 28px; color: #fff; text-shadow: -2px 0 #8a4d4f, 2px 0 #8a4d4f, 0 -2px #8a4d4f, 0 2px #8a4d4f, 2px 2px #8a4d4f, -2px 2px #8a4d4f, 2px -2px #8a4d4f, -2px -2px #8a4d4f; letter-spacing: .01em; }
.auth p.sub { margin: -6px 0 0; text-align: center; color: #9b6b6b; font-weight: 700; }
.auth-msg { border-radius: 14px; padding: 10px 12px; font-weight: 700; font-size: 14px; }
.auth-msg.err { background: #ffe1e8; color: #a3264f; } .auth-msg.ok { background: #e4f4cf; color: #3f5a22; }
.auth .pw { position: relative; } .auth .pw button { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); border: 0; background: none; font-weight: 800; color: #9b6b6b; font-size: 13px; }
.auth .link { border: 0; background: none; color: #d24f7a; font-weight: 800; text-decoration: underline; padding: 0; align-self: center; }
`;
function shell(inner) {
let root = document.getElementById('authRoot');
if (!root) { root = document.createElement('div'); root.id = 'authRoot'; document.body.appendChild(root); const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
const boot = document.getElementById('boot'); if (boot) boot.hidden = true;
root.innerHTML = `<div class="auth"><div class="auth-card">${inner}</div></div>`;
return root;
}
const hero = () => `<div class="auth-hero">${['gochi', 'pudin', 'canela', 'shey'].map((n, i) => `<img alt="" src="${Pix.sprite(n, 4)}" width="${i === 1 ? 84 : 64}" height="${i === 1 ? 84 : 64}">`).join('')}</div><h1>Bolsillito</h1>`;
function contactLine(store) {
const c = store.config && store.config.plan && store.config.plan.contact;
if (!c) return 'Escríbele a la administradora de la app para que te ayude a crear una contraseña nueva.';
const wa = String(c).replace(/\D/g, '');
return `Escríbele a la administradora por WhatsApp para que te ayude: <a href="https://wa.me/${wa}" target="_blank" rel="noopener">${esc(c)}</a>`;
}
window.Auth = {
show(store) {
return new Promise(resolve => {
let mode = 'login';
const draw = (msg, kind) => {
const root = shell(`${hero()}<p class="sub">${mode === 'login' ? 'Tu dinerito, lindo y en orden ✦' : 'Crea tu cuenta en segundos ✦'}</p>
<div class="seg"><button type="button" data-m="login" aria-pressed="${mode === 'login'}">Entrar</button><button type="button" data-m="signup" aria-pressed="${mode === 'signup'}">Crear cuenta</button></div>
${msg ? `<div class="auth-msg ${kind || 'err'}">${msg}</div>` : ''}
<form id="authForm" class="stack" novalidate>
${mode === 'signup' ? '<label class="f">Tu nombre<input class="in" id="auName" autocomplete="name" placeholder="¿Cómo te llamamos?"></label>' : ''}
<label class="f">Número de celular<input class="in" id="auPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="Ej. 0991234567" required></label>
<label class="f">Contraseña<span class="pw"><input class="in" id="auPw" type="password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" placeholder="${mode === 'login' ? 'Tu contraseña' : 'Mínimo 6 caracteres'}" required><button type="button" id="auEye">Ver</button></span></label>
<button class="btn pink" type="submit" id="auGo" style="justify-content:center;padding:13px">${mode === 'login' ? 'Entrar' : 'Crear mi cuenta'}</button>
</form>
${mode === 'login' ? '<button type="button" class="link" id="auForgot">Olvidé mi contraseña</button>' : '<p class="faint" style="margin:0;text-align:center">Tu número solo se usa para entrar. No enviamos mensajes.</p>'}`);
root.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { mode = b.dataset.m; draw(); });
root.querySelector('#auEye').onclick = () => { const i = root.querySelector('#auPw'); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; root.querySelector('#auEye').textContent = show ? 'Ocultar' : 'Ver'; };
const fg = root.querySelector('#auForgot'); if (fg) fg.onclick = () => draw(contactLine(store), 'ok');
root.querySelector('#authForm').onsubmit = async e => {
e.preventDefault();
const phone = root.querySelector('#auPhone').value, pw = root.querySelector('#auPw').value;
const { email, phone: p } = store.phoneEmail(phone);
if (p.length < 9) return draw('Escribe tu número de celular completo.');
if (pw.length < 6) return draw('La contraseña debe tener al menos 6 caracteres.');
const go = root.querySelector('#auGo'); go.disabled = true; go.textContent = 'Un momento…';
try {
if (mode === 'signup') {
const name = (root.querySelector('#auName').value || '').trim();
const { data, error } = await store.sb.functions.invoke('signup', { body: { phone, password: pw, name } });
if (error) { let m = 'No se pudo crear la cuenta.'; try { m = (await error.context.json()).error || m; } catch (x) {} throw new Error(m); }
if (data && data.error) throw new Error(data.error);
}
const { error } = await store.sb.auth.signInWithPassword({ email, password: pw });
if (error) throw new Error(/invalid/i.test(error.message) ? 'El número o la contraseña no coinciden.' : /banned/i.test(error.message) ? 'Esta cuenta está pausada. Escríbele a la administradora.' : 'No pudimos entrar. Intenta otra vez.');
document.getElementById('authRoot').remove(); const boot = document.getElementById('boot'); if (boot) boot.hidden = false;
resolve();
} catch (err) { draw(esc(err.message || 'Algo salió mal.')); }
};
};
draw();
});
},
blocked() { shell(`${hero()}<div class="auth-msg err">Esta cuenta está pausada. Escríbele a la administradora de la app.</div>`); }
};
})();
;
(function () {
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const pad = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const today = () => ymd(new Date());
const ym = s => s.slice(0, 7);
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MON3 = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const DOW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const dowIdx = d => (d.getDay() + 6) % 7; // Monday = 0
const monthLabel = k => { const [y, m] = k.split('-').map(Number); return MONTHS[m - 1] + ' ' + y; };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function addMonths(k, n) { const [y, m] = k.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
function daysIn(k) { const [y, m] = k.split('-').map(Number); return new Date(y, m, 0).getDate(); }
function isoWeek(d) { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return { y: t.getUTCFullYear(), w: Math.ceil(((t - y0) / 864e5 + 1) / 7) }; }
function weekStart(d) { return addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -dowIdx(d)); }
let fmtCache = null;
function money(n, opts) {
const cur = (S.settings && S.settings.currency) || 'USD';
if (!fmtCache || fmtCache.cur !== cur) {
fmtCache = { cur, f: new Intl.NumberFormat('es-EC', { style: 'currency', currency: cur, minimumFractionDigits: 2, maximumFractionDigits: 2 }), f0: new Intl.NumberFormat('es-EC', { style: 'currency', currency: cur, maximumFractionDigits: 0 }) };
}
const v = Math.round((n || 0) * 100) / 100;
if (S.priv && !(opts && opts.real)) return '$••••';
const s = (opts && opts.short && Math.abs(v) >= 1000 ? fmtCache.f0 : fmtCache.f).format(Math.abs(v));
if (opts && opts.sign) return (v < 0 ? '−' : v > 0 ? '+' : '') + s;
return (v < 0 ? '−' : '') + s;
}
const EMOJI = ('🍓 🍑 🍒 🍋 🫐 🍉 🍰 🧁 🍩 🍪 🍫 🍬 🍭 🍮 ☕ 🧋 🍵 🍜 🍣 🍕 🍔 🥗 🥐 🛒 🧺 🛍️ 👗 👚 👠 👜 💄 💅 🎀 🧸 🪞 🕯️ 🛁 🧴 💊 🩺 🦷 🏥 🏠 🏡 🛋️ 💡 🔌 📶 📱 💻 🎧 🎮 📺 🎬 🎵 📚 ✏️ 🖍️ 🎨 🧶 🪴 🌷 🌸 🌼 🌻 🌙 ⭐ 🌟 ✨ 💫 🌈 ☁️ 🔮 🪄 🧚 🦄 🐰 🐱 🐶 🐾 🐷 🐻 🐥 🦋 🐚 🍄 🌵 🚌 🚕 🚗 ⛽ ✈️ 🏖️ 🧳 🎟️ 🎁 🎂 🎉 💌 💝 💖 💗 💜 💙 💚 🤍 💰 💵 💳 🏦 👛 🪙 🐖 📈 📉 🧾 📌 📎 🗓️ ⏰ 🛟 🎓 💼 🏋️ 🧘 ⚽ 🎾 🧗').split(' ');
const SYMBOLS = {
'Brillos': ['✧', '✦', '⋆', '✩', '✪', '❀', '✿', '❁', '⁺˖', '˚₊‧', '‧₊˚', '⋆｡°✩', '✧･ﾟ', '･ﾟ✧', '꒰ঌ', '໒꒱', '☾', '☽', '♡', '♥', '❣', 'ᰔ', '⟡', '✶'],
'Caritas': ['(˶ᵔ ᵕ ᵔ˶)', '(｡•̀ᴗ-)✧', '( ˘ ³˘)♥', '(っ˘ω˘ς )', 'ʕ•ᴥ•ʔ', '(=^･ω･^=)', '(◕‿◕✿)', '(´｡• ᵕ •｡`)', '(╥﹏╥)', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', '٩(◕‿◕)۶', '(˘︶˘).｡*♡', '૮ ˶ᵔ ᵕ ᵔ˶ ა', '₍ᐢ. .ᐢ₎'],
'Divisores': ['·˚ ༘₊· ͟͟͞͞➳❥', '⊹₊⋆ ── ⋆₊⊹', '✿ ─────── ✿', '⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆', '── ୨୧ ──', '•┈┈┈•┈┈┈•', '˗ˏˋ ♡ ˎˊ˗', '꒷꒦꒷꒦꒷꒦'],
'Flechas': ['➳', '➵', '➺', '↳', '⤷', '→', '⇢', '➝', '⟶', '↬']
};
const THEMES = {
manzanita: { name: 'Manzanita', free: true, stripes: ['#fbeed3', '#fdf6e6'], accent: '#f27ea1', pill: '#ffc4d6', pillInk: '#7a3f45', nav: '#f48fb1', line: '#f7cbd8', ink: '#6b3b3f', soft: '#9b6b6b', stars: ['#ffb3cb', '#a9dcf5', '#ffe27a'] },
algodon: { name: 'Algodón celeste', free: true, stripes: ['#e6f4fc', '#f4faff'], accent: '#5fb6e3', pill: '#c8ebfb', pillInk: '#2f5670', nav: '#86cbee', line: '#cbe7f6', ink: '#3e4f66', soft: '#6f8197', stars: ['#ffb3cb', '#a9dcf5', '#ffe27a'] },
fresanoche: { name: 'Fresa de noche', free: true, dark: true, stripes: ['#33242a', '#3a2930'], accent: '#ff8fb3', pill: '#6b3346', pillInk: '#ffe6ee', nav: '#5a2c3c', line: 'rgba(255,170,200,.22)', stars: ['#ff9fc0', '#8fd0f0', '#ffe27a'] },
hoja: { name: 'Hoja de manzana', stripes: ['#eef7df', '#f7fbee'], accent: '#7fb547', pill: '#d6efb5', pillInk: '#3f5a22', nav: '#9ccb62', line: '#d4ebb8', ink: '#45502f', soft: '#76805e', stars: ['#ffb3cb', '#a9dcf5', '#ffe27a'] },
limonada: { name: 'Limonada', stripes: ['#fff6cc', '#fffbe8'], accent: '#f0b23a', pill: '#fff0a0', pillInk: '#6b4d12', nav: '#f7cf63', line: '#f6e3a3', ink: '#5e4721', soft: '#8f7748', stars: ['#ffb3cb', '#a9dcf5', '#ffd04a'] },
durazno: { name: 'Durazno', stripes: ['#ffe8da', '#fff3eb'], accent: '#f08f6e', pill: '#ffd3c2', pillInk: '#6b3a2a', nav: '#f4a88b', line: '#f8d3c4', ink: '#62392c', soft: '#93685a', stars: ['#ffb3cb', '#a9dcf5', '#ffe27a'] },
cereza: { name: 'Cereza', stripes: ['#ffe5ee', '#fff2f6'], accent: '#e0577f', pill: '#ffc4d6', pillInk: '#6b2a3d', nav: '#ec7499', line: '#f8c6d6', ink: '#62293a', soft: '#94606f', stars: ['#ff8fb3', '#a9dcf5', '#ffe27a'] },
picnic: { name: 'Picnic', pattern: 'gingham', stripes: ['#fff4f6', '#ffd6e2'], accent: '#ec6f97', pill: '#fff0a0', pillInk: '#6b3b3f', nav: '#f48fb1', line: '#f7cbd8', ink: '#6b3b3f', soft: '#9b6b6b', stars: ['#ffffff', '#a9dcf5', '#ffe27a'] },
lavanda: { name: 'Lavanda', stripes: ['#efeafd', '#f8f5ff'], accent: '#9a84e3', pill: '#e2d9ff', pillInk: '#43366b', nav: '#b3a2ec', line: '#ddd3fb', ink: '#43366b', soft: '#776c98', stars: ['#ffb3cb', '#a9dcf5', '#ffe27a'] },
chocolate: { name: 'Chocolate con fresa', dark: true, stripes: ['#2b1f1c', '#31231f'], accent: '#f5a3bd', pill: '#5c3b32', pillInk: '#ffe6ee', nav: '#4a2f28', line: 'rgba(245,163,189,.22)', stars: ['#f5a3bd', '#a9dcf5', '#ffe27a'] }
};
Object.values(THEMES).forEach(t => { t.sky = [t.stripes[0], t.pill, t.accent, t.nav]; });
const FONTS = {
Nunito: { css: "'Nunito', system-ui, sans-serif", free: true },
Quicksand: { css: "'Quicksand', system-ui, sans-serif", free: true },
Fredoka: { css: "'Fredoka', system-ui, sans-serif", free: true },
Comfortaa: { css: "'Comfortaa', system-ui, sans-serif" },
'Baloo 2': { css: "'Baloo 2', system-ui, sans-serif" },
'Pixelify Sans': { css: "'Pixelify Sans', 'Nunito', monospace" },
'Patrick Hand': { css: "'Patrick Hand', 'Nunito', cursive" },
Itim: { css: "'Itim', 'Nunito', cursive" },
Gaegu: { css: "'Gaegu', 'Nunito', cursive" }
};
const TXC = { // light / night
cristal: ['#ffffff', 'rgba(84,56,66,.9)'], salvia: ['#e4f4cf', '#3d5232'], mantequilla: ['#fff6c4', '#5c5134'],
durazno: ['#ffe6da', '#5e4140'], rosa: ['#ffe0ea', '#5d3550'], celeste: ['#def2fc', '#2f4a6b'], lila: ['#ece6fd', '#463a78']
};
const BASE_MAP = { home: 'm_inicio', wallet: 'm_billetera', tx: 'm_movs', add: 'm_anotar', month: 'm_mes', journal: 'm_journal', more: 'm_mas', loans: 'billetera_digital', cuotas: 'tarjeta', year: 'year', goals: 'goal', recurring: 'repeat', rules: 'crystal', projections: 'sparkle', settings: 'gear', appearance: 'flower', plan: 'pudin', data: 'heart', rincon: 'gochi', tienda: 'gift', shey: 'shey' };
const packOf = v => Object.fromEntries(Object.entries(BASE_MAP).map(([k, n]) => [k, 's:' + n + (v ? '~' + v : '')]));
const PACKS = {
pixel: { name: 'Pixel Meffy', free: true, map: packOf('') },
fresa: { name: 'Pixel fresa', map: packOf('fresa') },
menta: { name: 'Pixel menta', map: packOf('menta') },
noche: { name: 'Pixel noche', map: packOf('noche') },
chocolate: { name: 'Pixel chocolate', map: packOf('chocolate') }
};
const PAGES = {
home: 'Inicio', wallet: 'Billetera', loans: 'Me deben / Debo', acctd: 'Cuenta', tx: 'Movimientos', month: 'Mes', journal: 'Journal', more: 'Más', year: 'Año', goals: 'Metas', recurring: 'Fijos', rules: 'Reglas',
projections: 'Proyecciones', settings: 'Cuentas y categorías', appearance: 'Apariencia', plan: 'Meffy+', data: 'Mi perfil'
};
const S = { priv: (() => { try { return localStorage.getItem('bolsillito:priv') === '1'; } catch (e) { return false; } })(), settings: null, fin: null, tx: [], route: 'home', month: ym(today()), filters: { q: '', type: 'all', cat: 'all', acct: 'all', month: 'all' } };
function defaults() {
const groups = [
{ id: 'ing', name: 'Ingresos', color: '#fff09a', kind: 'income' },
{ id: 'hog', name: 'Hogar', color: '#cdeefc' },
{ id: 'nec', name: 'Necesidades', color: '#d3eaa8' },
{ id: 'gus', name: 'Gustos', color: '#ffc4d6' },
{ id: 'aho', name: 'Ahorro', color: '#ffe0c9', saving: true }
];
const c = (id, name, icon, group, budget, type) => ({ id, name, icon, group, budget, type: type || 'expense' });
const categories = [
c('sueldo', 'Sueldo', 's:maletin', 'ing', 950, 'income'), c('extra', 'Extras', 's:sparkle', 'ing', 80, 'income'),
c('arriendo', 'Arriendo', 's:house2', 'hog', 320), c('servicios', 'Luz y agua', 's:foco', 'hog', 35), c('internet', 'Internet', 's:wifi', 'hog', 28),
c('super', 'Supermercado', 's:cart', 'nec', 170), c('transporte', 'Transporte', 's:bus', 'nec', 45), c('salud', 'Salud', 's:med', 'nec', 30), c('celular', 'Celular', 's:phone', 'nec', 15),
c('comida', 'Comida afuera', 's:ramen', 'gus', 70), c('cafe', 'Café', 's:coffee', 'gus', 25), c('compras', 'Compras', 's:bolsa', 'gus', 60), c('belleza', 'Belleza', 's:unas', 'gus', 30), c('salidas', 'Salidas', 's:ticket', 'gus', 40), c('subs', 'Suscripciones', 's:audif', 'gus', 12), c('regalos', 'Regalos', 's:gift', 'gus', 20),
c('ahorro', 'Ahorro', 's:piggy', 'aho', 100), c('metas', 'Para metas', 's:star', 'aho', 50)
];
const accounts = [
{ id: 'efectivo', name: 'Efectivo', type: 'efectivo', icon: 's:monedero', start: 45 },
{ id: 'banco', name: 'Cuenta de ahorros', type: 'ahorro', icon: 's:banco', start: 640 },
{ id: 'tarjeta', name: 'Tarjeta de crédito', type: 'tarjeta', icon: 's:tarjeta', start: -120, liability: true, due: 20 },
{ id: 'cochinito', name: 'Cochinito', type: 'alcancia', icon: 's:alcancia', start: 300 }
];
const t = new Date(); const k = ym(today());
const nextDay = (day) => { const d = new Date(t.getFullYear(), t.getMonth(), day); if (d <= t) d.setMonth(d.getMonth() + 1); return ymd(d); };
return {
settings: {
name: '', currency: 'USD', theme: 'manzanita', night: 'auto', font: 'Nunito', pack: 'pixel', navIcons: {}, pageIcons: {},
banners: { home: { preset: 'manzana' }, tx: { preset: 'cielo' }, month: { preset: 'picnic' }, year: { preset: 'pradera' }, goals: { preset: 'jardin' } },
mascot: 's:pudin', mascotOn: true, sparkle: true, txColors: { expense: 'cristal', income: 'salvia', transfer: 'mantequilla', recurring: 'durazno' },
hidden: [], plan: 'free', assetsInNet: true, examples: true, created: today(), v: 3
},
fin: {
groups, categories, accounts,
goals: [
{ id: 'g1', name: 'Viaje a la playa', icon: 's:playa', target: 400, saved: 130, date: ymd(addDays(t, 120)), color: '#ffd3e6', example: true },
{ id: 'g2', name: 'Fondo de emergencia', icon: 's:salvavidas', target: 1000, saved: 320, date: '', color: '#c9dcff', example: true }
],
recurring: [
{ id: 'r1', name: 'Arriendo', type: 'expense', amount: 320, cat: 'arriendo', acct: 'banco', freq: 'mensual', next: nextDay(1), active: true, example: true },
{ id: 'r2', name: 'Internet', type: 'expense', amount: 28, cat: 'internet', acct: 'banco', freq: 'mensual', next: nextDay(15), active: true, example: true },
{ id: 'r3', name: 'Música', type: 'expense', amount: 5.99, cat: 'subs', acct: 'tarjeta', freq: 'mensual', next: nextDay(22), active: true, example: true },
{ id: 'r4', name: 'Sueldo', type: 'income', amount: 950, cat: 'sueldo', acct: 'banco', freq: 'mensual', next: nextDay(28), active: true, example: true }
],
assets: [{ id: 'a1', name: 'Laptop', value: 450, icon: 's:laptop', example: true }],
rules: [
{ id: 'u1', match: 'contiene', text: 'café', cat: 'cafe' }, { id: 'u2', match: 'contiene', text: 'uber', cat: 'transporte' },
{ id: 'u3', match: 'contiene', text: 'super', cat: 'super' }, { id: 'u4', match: 'contiene', text: 'farmacia', cat: 'salud' }
]
},
tx: exampleTx(k)
};
}
function exampleTx(k) {
const d = new Date(); const day = d.getDate();
const at = n => k + '-' + pad(Math.max(1, Math.min(day, n)));
const x = (type, amount, cat, acct, dd, note) => ({ id: uid(), type, amount, cat, acct, date: at(dd), note, example: true });
return [
x('income', 950, 'sueldo', 'banco', 1, 'Sueldo'),
x('expense', 320, 'arriendo', 'banco', 1, 'Arriendo'),
x('expense', 42.80, 'super', 'banco', 2, 'Super de la semana'),
x('expense', 3.25, 'cafe', 'efectivo', 3, 'Café con pan de yuca'),
x('expense', 18.5, 'comida', 'tarjeta', 4, 'Sushi con amigas'),
x('expense', 6.4, 'transporte', 'efectivo', 5, 'Uber'),
x('expense', 24.9, 'belleza', 'tarjeta', 6, 'Uñas'),
x('expense', 28, 'internet', 'banco', 7, 'Internet'),
x('expense', 3.5, 'cafe', 'efectivo', 8, 'Café'),
x('expense', 35, 'compras', 'tarjeta', day - 1, 'Vestido'),
x('expense', 12.75, 'super', 'efectivo', day, 'Frutas y yogurt'),
x('income', 60, 'extra', 'efectivo', day - 2, 'Venta de stickers'),
{ id: uid(), type: 'transfer', amount: 50, acct: 'banco', to: 'cochinito', cat: 'ahorro', date: at(9), note: 'Al cochinito', example: true }
];
}
function loadTx() {
const out = [];
Store.ids('tx-').forEach(id => { const d = Store.get(id); (d && d.items || []).forEach(t => out.push(t)); });
S.tx = out.sort((a, b) => (b.date + (b.ts || '')).localeCompare(a.date + (a.ts || '')));
}
function saveTxMonth(k) { Store.put('tx-' + k, { items: S.tx.filter(t => ym(t.date) === k) }); }
function saveTxMonths(keys) { [...new Set(keys)].forEach(saveTxMonth); }
const saveSettings = () => Store.put('settings', S.settings);
const saveFin = () => Store.put('fin', S.fin);
function addTx(t) { t.id = t.id || uid(); t.ts = t.ts || Date.now().toString(36); S.tx.unshift(t); S.tx.sort((a, b) => b.date.localeCompare(a.date)); saveTxMonth(ym(t.date));  if (window.Sfx) Sfx.play('blup'); }
function updateTx(id, patch) {
const t = S.tx.find(x => x.id === id); if (!t) return; const oldK = ym(t.date);
Object.assign(t, patch); delete t.example; S.tx.sort((a, b) => b.date.localeCompare(a.date)); saveTxMonths([oldK, ym(t.date)]);
}
function deleteTx(id) { const t = S.tx.find(x => x.id === id); if (!t) return; S.tx = S.tx.filter(x => x.id !== id); saveTxMonth(ym(t.date)); }
const cat = id => S.fin.categories.find(c => c.id === id);
const acct = id => S.fin.accounts.find(a => a.id === id);
const group = id => S.fin.groups.find(g => g.id === id);
const isSaving = c => { const g = c && group(c.group); return !!(g && g.saving); };
function acctBalance(id) {
const a = acct(id); let b = a ? Number(a.start) || 0 : 0;
for (const t of S.tx) {
if (t.type === 'income' && t.acct === id) b += t.amount;
else if (t.type === 'expense' && t.acct === id) b -= t.amount;
else if (t.type === 'transfer') { if (t.acct === id) b -= t.amount; if (t.to === id) b += t.amount; }
else if (t.type === 'loan_out' && t.acct === id) b -= t.amount;
else if (t.type === 'loan_in' && t.acct === id) b += t.amount;
}
return b;
}
function netWorth(withAssets) {
let n = S.fin.accounts.reduce((s, a) => s + acctBalance(a.id), 0);
if (withAssets) n += S.fin.assets.reduce((s, a) => s + (Number(a.value) || 0), 0);
(S.fin.loans || []).forEach(l => { const left = Math.max(0, (+l.amount || 0) - (+l.paid || 0)); n += l.dir === 'out' ? -left : left; });
return n;
}
const txIn = k => S.tx.filter(t => ym(t.date) === k);
function spentOf(list, opts) { // spending excluding savings categories
return list.filter(t => t.type === 'expense' && (!opts || opts.withSaving || !isSaving(cat(t.cat)))).reduce((s, t) => s + t.amount, 0);
}
const incomeOf = list => list.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
function budgetExpenses(withSaving) { return S.fin.categories.filter(c => c.type !== 'income' && (withSaving || !isSaving(c))).reduce((s, c) => s + (Number(c.budget) || 0), 0); }
const budgetIncome = () => S.fin.categories.filter(c => c.type === 'income').reduce((s, c) => s + (Number(c.budget) || 0), 0);
function byCat(list, type) { const m = {}; list.filter(t => t.type === (type || 'expense')).forEach(t => { m[t.cat] = (m[t.cat] || 0) + t.amount; }); return m; }
function txOnDay(d) { return S.tx.filter(t => t.date === d); }
const ACCT_TYPES = [['efectivo', 'Efectivo', 's:monedero'], ['ahorro', 'Cuenta de ahorros', 's:banco'], ['corriente', 'Cuenta corriente', 's:banco_azul'], ['debito', 'Tarjeta de débito', 's:tarjeta_debito'], ['tarjeta', 'Tarjeta de crédito', 's:tarjeta'], ['virtual', 'Billetera digital / cuenta virtual', 's:billetera_digital'], ['alcancia', 'Alcancía / ahorro aparte', 's:alcancia'], ['inversion', 'Inversión', 's:inversion'], ['prestamo', 'Préstamo / deuda', 's:prestamo']];
const WALLET = [['Efectivo', ['efectivo']], ['Cuentas bancarias', ['ahorro', 'corriente', 'banco']], ['Tarjetas de débito', ['debito']], ['Tarjetas de crédito', ['tarjeta']], ['Cuentas virtuales', ['virtual']], ['Ahorro e inversión', ['alcancia', 'inversion']], ['Préstamos y deudas', ['prestamo']]];
const typeName = t => (ACCT_TYPES.find(x => x[0] === t) || [, t === 'banco' ? 'Cuenta de ahorros' : cap(t || '')])[1];
function walletHTML(row) {
const known = new Set(WALLET.flatMap(w => w[1]));
const groups = WALLET.map(([n, ts]) => [n, S.fin.accounts.filter(a => ts.includes(a.type))]).concat([['Otras', S.fin.accounts.filter(a => !known.has(a.type))]]).filter(g => g[1].length);
return groups.map(([n, list]) => { const tot = list.reduce((s2, a) => s2 + acctBalance(a.id), 0); return `<div class="card"><div class="row between" style="margin-bottom:4px"><h3 style="margin:0">${esc(n)}</h3><b class="num ${tot < 0 ? 'neg' : ''}">${money(tot)}</b></div>${list.map(row).join('')}</div>`; }).join('');
}
const isPlus = () => S.settings.plan === 'luna' || S.settings.plan === 'plus';
// Orden de las categorías (la usuaria decide cuáles salen primero)
function catOrderList() { const o = (S.settings.catOrder || []).filter(id => S.fin.categories.some(c => c.id === id)); S.fin.categories.forEach(c => { if (!o.includes(c.id)) o.push(c.id); }); return o; }
function sortCats(list) { const o = catOrderList(); return list.slice().sort((a, b) => o.indexOf(a.id) - o.indexOf(b.id)); }
function orderCats(type, done) {
let ty = type || 'expense';
openSheet('Tus categorías', `<div id="coBody"></div>`, sh => {
const body = $('#coBody', sh);
const draw = () => { const L = sortCats(S.fin.categories.filter(c => ty === 'income' ? c.type === 'income' : c.type !== 'income'));
body.innerHTML = `<div class="seg" style="margin-bottom:10px"><button data-ty="expense" aria-pressed="${ty === 'expense'}">Gastos</button><button data-ty="income" aria-pressed="${ty === 'income'}">Ingresos</button></div>
<p class="faint" style="margin:0 0 8px">Las de arriba salen primero en Anotar. Usa las flechas para ordenarlas y el lápiz para cambiarles el nombre, el icono o borrarlas.</p>
<button class="btn" data-auto style="width:100%;justify-content:center;margin-bottom:10px">Poner primero las que más uso</button>
<div class="list co-list">${L.map((c, i) => `<div class="li"><span class="ic">${iconHTML(c.icon, 28)}</span><span class="tx-main"><b>${esc(c.name)}</b></span><button class="iconbtn co-ed" data-ed="${c.id}" aria-label="Editar o borrar">✎</button><button class="iconbtn" data-mv="${c.id}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Subir">▲</button><button class="iconbtn" data-mv="${c.id}" data-d="1" ${i === L.length - 1 ? 'disabled' : ''} aria-label="Bajar">▼</button></div>`).join('')}</div>
<button class="btn pink" data-ok style="width:100%;justify-content:center;margin-top:12px;padding:12px">Listo</button>`; };
draw();
body.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
if (b.dataset.ty) { ty = b.dataset.ty; draw(); return; }
if (b.dataset.ed) { closeSheet(); editCategory(b.dataset.ed, null, () => orderCats(ty, done)); return; }
if (b.dataset.mv) { const L = sortCats(S.fin.categories.filter(c => ty === 'income' ? c.type === 'income' : c.type !== 'income')).map(c => c.id); const i = L.indexOf(b.dataset.mv), j = i + +b.dataset.d; if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; const all = catOrderList(); const pos = all.map((id, k) => L.includes(id) ? k : -1).filter(k => k >= 0); pos.forEach((k, n) => all[k] = L[n]); S.settings.catOrder = all; saveSettings(); draw(); return; }
if (b.hasAttribute('data-auto')) { const n = {}; S.tx.forEach(x => { if (x.cat) n[x.cat] = (n[x.cat] || 0) + 1; }); const all = catOrderList(); const L = all.filter(id => { const c = cat(id); return c && (ty === 'income' ? c.type === 'income' : c.type !== 'income'); }); const sorted = L.slice().sort((a, b2) => (n[b2] || 0) - (n[a] || 0) || L.indexOf(a) - L.indexOf(b2)); const pos = all.map((id, k) => L.includes(id) ? k : -1).filter(k => k >= 0); pos.forEach((k, m) => all[k] = sorted[m]); S.settings.catOrder = all; saveSettings(); draw(); toast('Listo, las que más usas van primero'); return; }
if (b.hasAttribute('data-ok')) { closeSheet(); if (done) done(); else render(); }
});
});
}
function guessCat(note) {
if (!note) return null; const n = note.toLowerCase().trim();
for (const r of S.fin.rules) {
const t = (r.text || '').toLowerCase(); if (!t) continue;
if ((r.match === 'contiene' && n.includes(t)) || (r.match === 'igual' && n === t) || (r.match === 'empieza' && n.startsWith(t))) return r.cat;
}
const hit = S.fin.categories.find(c => n.includes(c.name.toLowerCase()));
if (hit) return hit.id;
for (const [id, re] of Object.entries(CAT_KW)) if (S.fin.categories.some(c => c.id === id) && new RegExp('(^|[^a-záéíóúñü])(' + re + ')([^a-záéíóúñü]|$)', 'i').test(n)) return id;
return null;
}
const CAT_KW = { comida: 'helado|postre|snack|golosinas|almuerzo|almorc[eé]|cena|cen[eé]|desayuno|pizza|sushi|hamburguesa|restaurante|kfc|pollo|encebollado|comida|ceviche|hornado|papas', super: 'super|súper|supermercado|supermaxi|mercado|t[ií]a|aki|frutas|v[ií]veres|despensa|mi comisariato', transporte: 'uber|taxi|bus|buseta|pasaje|didi|metro|gasolina|indriver|parqueo|peaje|cabify', cafe: 'caf[eé]|cafecito|starbucks|sweet and coffee|capuchino|frapp[eé]', salud: 'farmacia|fybeca|medicina|doctor|m[eé]dico|pastillas|cita m[eé]dica|dentista|consulta', celular: 'recarga|celular|plan del celular|claro|movistar|cnt', internet: 'internet|wifi|netlife', servicios: 'luz|agua|gas|planilla', compras: 'ropa|zapatos|zapatillas|shein|amazon|temu|compras|vestido|blusa|cartera', belleza: 'u[nñ]as|peluquer[ií]a|maquillaje|cejas|pesta[nñ]as|skincare|corte de pelo|tinte', salidas: 'cine|bar|fiesta|concierto|salida|discoteca|karaoke|boliche|entradas', subs: 'netflix|spotify|disney|hbo|youtube|prime video|icloud|suscripci[oó]n|chatgpt', regalos: 'regalo|regal[eé]|cumplea[nñ]os', arriendo: 'arriendo|alquiler|renta', sueldo: 'sueldo|salario|quincena|me pagaron', extra: 'venta|vend[ií]|freelance|propina|extra', ahorro: 'ahorro|ahorr[eé]' };
// ---- Entender un texto hablado o copiado: "gasté 3,50 en café con tarjeta", "Consumo por USD 12,50 en SUPERMAXI" ----
const NUMW = { cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, 'dieciséis': 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veintiun: 21, veintiuno: 21, veintidos: 22, 'veintidós': 22, veintitres: 23, 'veintitrés': 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, 'veintiséis': 26, veintisiete: 27, veintiocho: 28, veintinueve: 29, treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400, quinientos: 500, seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900, mil: 1000 };
function wordsToDigits(txt) {
const tk = txt.split(/(\s+)/); const out = []; let run = null, cur = 0, tot = 0;
const flush = () => { if (run) { out.push(String(tot + cur)); run = null; cur = 0; tot = 0; } };
for (let i = 0; i < tk.length; i++) {
const w = tk[i]; const lw = w.toLowerCase().replace(/[.,;:!?]$/, '');
if (/^\s+$/.test(w)) { if (!run) out.push(w); continue; }
if (lw in NUMW && !((lw === 'un' || lw === 'una') && !run && !/^(d[oó]lar|d[oó]lares|mil|millón)/i.test(tk[i + 2] || ''))) { const v = NUMW[lw]; if (run && v !== 1000) { const last = cur % 100; if ((v < 10 && last % 10 !== 0) || (v >= 10 && v < 100 && last !== 0) || (v >= 100 && cur !== 0)) { flush(); out.push(' '); } } if (v === 1000) { tot += (cur || 1) * 1000; cur = 0; } else cur += v; run = true; if (/[.,;:!?]$/.test(w)) { flush(); out.push(w.slice(-1)); } continue; }
if (lw === 'y' && run && /^\s+$/.test(tk[i + 1] || '') && ((tk[i + 2] || '').toLowerCase() in NUMW)) continue;
if (run) { flush(); out.push(' '); }
out.push(w);
}
flush(); return out.join('').replace(/ {2,}/g, ' ');
}
function parseMoneyText(raw, opt) {
opt = opt || {};
let tx = ' ' + wordsToDigits(String(raw || '').replace(/\s+/g, ' ')) + ' ';
// "3 80", "3:80", "$3 80" dichos en voz = 3,80
if (opt.voice) tx = tx.replace(/(\d{1,4})(?:\s+|:|\s*,\s+)(\d{2})(?!\d|[.,]\d|\s*(?:personas|amigas|amigos))/g, '$1.$2');
const lo = tx.toLowerCase(); const r = { type: null, amount: 0, acct: null, date: null, note: '', split: 0, cat: null };
// monto
let m, used = '';
const cur = '(?:\\$|usd|us\\$|dólares|dolares)';
if ((m = tx.match(new RegExp(cur + '\\s*(\\d{1,3}(?:[.,]\\d{3})*(?:[.,]\\d{1,2})|\\d+(?:[.,]\\d{1,2})?)', 'i')))) { used = m[0]; r.amount = toNum(m[1]); }
else if ((m = tx.match(/(\d+)\s*(?:d[oó]lares?\s*)?con\s*(\d{1,2})(?:\s*centavos)?/i))) { used = m[0]; r.amount = +m[1] + +m[2].padEnd(2, '0') / 100; }
else if ((m = tx.match(/(\d+)\s*(?:d[oó]lares?\s*)?y\s*medio/i))) { used = m[0]; r.amount = +m[1] + .5; }
else if ((m = tx.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:d[oó]lares?|usd|\$)/i))) { used = m[0]; r.amount = toNum(m[1]); }
else if ((m = tx.match(/(\d+)\s*centavos/i))) { used = m[0]; r.amount = +m[1] / 100; }
else if ((m = tx.match(/(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?|\d+[.,]\d{1,2})(?![\d\/])/))) { used = m[0]; r.amount = toNum(m[1]); }
else if ((m = tx.match(/medio d[oó]lar/i))) { used = m[0]; r.amount = .5; }
else if ((m = tx.match(/(?:^|\s)(\d{1,5})(?=\s|$)/)) && !/\d{1,2}\/\d{1,2}/.test(m[0])) { used = m[0]; r.amount = +m[1]; }
// dividir: "entre 4", "dividido entre 3 personas"
if ((m = tx.match(/(?:dividid[oa]s?\s+)?entre\s+(\d{1,2})(?:\s+(?:personas|amigas|amigos))?/i))) { r.split = +m[1]; tx = tx.replace(m[0], ' '); }
if (used) tx = tx.replace(used, ' ');
// tipo
if (/(me pagaron|recib[ií]|cobr[eé]|gan[eé]|me depositaron|me (?:entr[oó]|lleg[oó])|me transfirieron|me enviaron|te (?:transfiri[oó]|envi[oó])|recibiste|acreditad|dep[oó]sito recibido|ingreso|sueldo|quincena|vend[ií])/i.test(lo)) r.type = 'income';
else if (/(gast[eé]|pagu[eé]|compr[eé]|consumo|compra|pago|d[eé]bito|me cobraron|transferencia (?:exitosa|enviada)|retiro)/i.test(lo)) r.type = 'expense';
// cuenta
const accs = S.fin.accounts.filter(a => !a.archived);
const byName = accs.find(a => a.name && lo.includes(a.name.toLowerCase())) || accs.find(a => a.name && a.name.split(/\s+/).some(w => w.length > 4 && !/cuenta|ahorros?|tarjeta|cr[eé]dito|corriente/i.test(w) && lo.includes(w.toLowerCase())));
if (byName) r.acct = byName.id;
else if (/efectivo|en cash/.test(lo)) r.acct = (accs.find(a => a.type === 'efectivo') || {}).id || null;
else if (/tarjeta|cr[eé]dito|\*{2,}\d{3,4}/.test(lo)) r.acct = (accs.find(a => a.type === 'tarjeta') || {}).id || null;
else if (/transferencia|banco|d[eé]bito|cuenta/.test(lo)) r.acct = (accs.find(a => /ahorro|corriente|banco/.test(a.type || '')) || {}).id || null;
// fecha
if (/antier|anteayer/.test(lo)) r.date = ymd(addDays(new Date(), -2));
else if (/\bayer\b/.test(lo)) r.date = ymd(addDays(new Date(), -1));
else if ((m = lo.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/))) { const y = m[3] ? (m[3].length === 2 ? '20' + m[3] : m[3]) : String(new Date().getFullYear()); const d = `${y}-${String(m[2]).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`; if (!isNaN(new Date(d)) && d <= today()) r.date = d; }
// nota: lo que queda, sin palabras de relleno
let note = '';
const en = tx.match(/\ben\s+(?!efectivo|tarjeta|la cuenta|mi cuenta)([a-záéíóúñü0-9][^,.;]{1,40})/i);
if (opt.shared && (m = tx.match(/(?:transfiri[oó]|envi[oó]|\ben|\ba|\bde)\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9&.'-]+(?: [A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9&.'-]+){0,3})/))) note = m[1].replace(/ (EL|LA|DE)$/, '');
else if (en) note = en[1];
else note = tx;
note = (' ' + note + ' ').replace(/(?<=[^a-záéíóúñü])(me|yo|te|hoy|ayer|antier|anteayer|gast[eé]|pagu[eé]|compr[eé]|cobraron|pagaron|recib[ií]|recibida|cobr[eé]|gan[eé]|transfiri[oó]|envi[oó]|transferencia|consumo|tarjeta(?: de cr[eé]dito)?|efectivo|cuenta|d[oó]lares?|d[oó]lar|centavos|usd|por|un|una|unos|unas|el|la|los|las|de|del|en|con|para|mi|tu)(?=[^a-záéíóúñü])/gi, ' ').replace(/(?<=[^a-záéíóúñü])(?:con|en|de)(?=[^a-záéíóúñü])/gi, ' ').replace(/[$*]/g, ' ').replace(/\s+/g, ' ').trim();
if (byName) note = note.replace(new RegExp(byName.name, 'i'), '').trim();
note = note.replace(/^[,.\-\s]+|[,.\-\s]+$/g, '');
if (note.length > 40) note = note.slice(0, 40).trim();
r.note = note ? (opt.shared && /^[A-ZÁÉÍÓÚÑ0-9 &.'-]+$/.test(note) ? note.split(' ').map(w => w.length <= 3 ? w : w.charAt(0) + w.slice(1).toLowerCase()).join(' ') : note.charAt(0).toUpperCase() + note.slice(1).toLowerCase()) : '';
r.cat = guessCat(r.note) || guessCat(lo);
r.amount = Math.round(r.amount * 100) / 100;
return r;
}
// Capturas de transferencias: se lee por renglones con etiquetas (Monto, Concepto, Beneficiario…) y se descarta el texto raro
function parseReceipt(raw) {
const lines = String(raw || '').split(/\n+/).map(l => l.trim()).filter(Boolean);
const r = parseMoneyText(lines.join(' '), { shared: true });
const lab = re => { for (let i = 0; i < lines.length; i++) { const m = lines[i].match(re); if (m) { const v = (m[1] || '').trim() || (lines[i + 1] || '').trim(); if (v) return v; } } return ''; };
const amt = lab(/^(?:monto|valor|total|importe|cantidad|monto (?:transferido|enviado|a pagar)|valor (?:transferido|enviado|pagado)|pagaste|enviaste|recibiste)\b[\s:$]*(.*)$/i);
if (amt) { const m = amt.match(/(\d{1,3}(?:[.,]\d{3})*[.,]\d{2}|\d+(?:[.,]\d{1,2})?)/); if (m) r.amount = Math.round(toNum(m[1]) * 100) / 100; }
const concept = lab(/^(?:concepto|descripci[oó]n|motivo|asunto|detalle|glosa|comentario|nota|mensaje|raz[oó]n)\b[\s:]*(.*)$/i);
const who = lab(/^(?:beneficiario|destinatario|para|a nombre de|nombre(?: del beneficiario)?|enviado a|transferiste a|ordenante|remitente|de parte de|recibiste de)\b[\s:]*(.*)$/i);
const clean = v => v.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñü0-9 .&-]/g, ' ').replace(/\s+/g, ' ').trim();
const ok = v => v && v.length >= 3 && /[a-záéíóúñ]{3,}/i.test(v) && v.replace(/[^a-záéíóúñü ]/gi, '').length / v.length > .75 && !/^(no|ninguno|n\/a|sin)/i.test(v);
const tc = v => v.toLowerCase().replace(/(^|\s)\S/g, x => x.toUpperCase());
const c1 = clean(concept), w1 = clean(who);
if (ok(c1)) r.note = c1.length > 3 && c1 === c1.toUpperCase() ? tc(c1) : c1.charAt(0).toUpperCase() + c1.slice(1);
else if (ok(w1)) r.note = (r.type === 'income' ? 'De ' : 'Transferencia a ') + tc(w1).split(' ').slice(0, 3).join(' ');
else r.note = /transfer/i.test(raw) ? 'Transferencia' : (ok(r.note) && r.note.split(' ').length <= 4 ? r.note : '');
r.note = r.note.slice(0, 40);
r.cat = guessCat(r.note) || null;
return r;
}
function toNum(x) { x = String(x); if (/^\d{1,3}([.,]\d{3})+$/.test(x)) return +x.replace(/[.,]/g, ''); if (/[.,]\d{3}[.,]\d{1,2}$/.test(x)) x = x.replace(/[.,](?=\d{3}[.,])/g, ''); return parseFloat(x.replace(',', '.')) || 0; }
function px(name, size, style) { return `<img class="pixel ico" alt="" src="${Pix.sprite(name, 3)}" style="width:${size || 20}px;height:${size || 20}px;vertical-align:-${Math.round((size || 20) * .2)}px;${style || ''}">`; }
function iconHTML(v, size) {
size = size || 28;
if (!v) return '';
if (v.startsWith('e:')) { const m = window.EMOJI_TO_ICON && EMOJI_TO_ICON[v.slice(2)]; v = 's:' + (m || 'sparkle'); }
if (v.startsWith('s:')) { const n = v.slice(2); return `<img class="pixel" alt="" src="${Pix.sprite(Pix.has(n) ? n : 'sparkle', 3)}" style="width:${size}px;height:${size}px">`; }
if (v.startsWith('i:')) return `<img alt="" src="${esc(v.slice(2))}" style="width:${size}px;height:${size}px;object-fit:contain;border-radius:6px">`;
return '';
}
function pageIcon(key) {
const own = S.settings.navIcons && S.settings.navIcons[key]; if (own) return own;
const pk = PACKS[S.settings.pack]; const map = pk && (pk.free || isPlus()) ? pk.map : PACKS.pixel.map;
return map[key] || PACKS.pixel.map[key] || 's:sparkle';
}
function hostDark() {
const a = document.documentElement.getAttribute('data-theme');
if (a === 'dark') return true; if (a === 'light') return false;
return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
}
function applyTheme() {
const st = S.settings; const th = THEMES[st.theme] || THEMES.manzanita;
const night = th.dark || st.night === 'on' || (st.night === 'auto' && hostDark());
const r = document.documentElement.style; const set = (k, v) => r.setProperty(k, v);
let stripes = th.stripes, nav = th.nav, pill = th.pill, pillInk = th.pillInk, line = th.line;
if (night && !th.dark) { stripes = ['#33242a', '#3a2930']; nav = mix(th.accent, '#2a1c20', .5); pill = mix(th.accent, '#2a1c20', .42); pillInk = '#fff0f5'; line = 'rgba(255,190,210,.2)'; }
const bg = th.pattern === 'gingham' && !night
? `linear-gradient(90deg, rgba(255,184,206,.38) 50%, transparent 0) 0 0/36px 36px, linear-gradient(rgba(255,184,206,.38) 50%, ${stripes[0]} 0) 0 0/36px 36px`
: `repeating-linear-gradient(90deg, ${stripes[0]} 0 26px, ${stripes[1]} 26px 52px)`;
set('--bg-img', bg); set('--bg-base', stripes[0]);
set('--accent', th.accent); set('--accent-deep', mix(th.accent, '#000', .82));
set('--pill', pill); set('--pill-ink', pillInk); set('--nav', nav); set('--glass-line', line);
if (night) {
Object.entries({ '--glass': 'rgba(70,46,54,.86)', '--glass-strong': 'rgba(84,56,66,.95)', '--ink': '#fbe9ee', '--ink-soft': '#d9b9c3', '--ink-faint': '#a98593', '--navy': '#ffd9e5', '--pos': '#9fe0a9', '--neg': '#ffa0c0', '--shadow': '0 6px 20px rgba(0,0,0,.28)' }).forEach(([k, v]) => set(k, v));
} else {
Object.entries({ '--glass': 'rgba(255,253,248,.9)', '--glass-strong': '#ffffff', '--ink': th.ink, '--ink-soft': th.soft, '--ink-faint': mix(th.soft, '#ffffff', .7), '--navy': th.ink, '--pos': '#4f9a3c', '--neg': '#d24f7a', '--shadow': `0 4px 0 ${line}, 0 8px 22px rgba(120,70,70,.08)` }).forEach(([k, v]) => set(k, v));
}
const tc = st.txColors || {};
['expense', 'income', 'transfer', 'recurring'].forEach(k => { const c = TXC[tc[k]] || TXC.cristal; set('--tx-' + k, c[night ? 1 : 0]); });
set('--f-body', (FONTS[st.font] || FONTS.Nunito).css);
r.colorScheme = night ? 'dark' : 'light';
document.body.classList.toggle('night', !!night);
S.night = !!night;
Sky.setColors(th.stars || THEMES.manzanita.stars, night);
Sky.setOn(st.sparkle !== false);
}
function mix(a, b, t) { // t = share of a
const p = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v * t + B[i] * (1 - t)).toString(16).padStart(2, '0')).join('');
}
const Sky = (() => {
const cv = document.getElementById('sky'); const ctx = cv.getContext('2d'); let stars = [], on = true, last = 0, cols = ['#ffb3cb', '#a9dcf5', '#ffe27a'], night = false;
const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function size() {
const d = Math.min(2, window.devicePixelRatio || 1); cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0);
const n = Math.round(innerWidth * innerHeight / 14000);
stars = Array.from({ length: n }, (_, i) => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: 5 + Math.random() * 8, c: i % 3, rot: Math.random() * 1.2 - .6, p: Math.random() * 6.28, s: .4 + Math.random() }));
stars = stars.concat(Array.from({ length: n * 2 }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, spark: true, r: 1.5 + Math.random() * 2.5, p: Math.random() * 6.28, s: .6 + Math.random() * 1.4 })));
draw(0);
}
function star(x, y, R, rot) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? R * .5 : R; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); }
function draw(t) {
ctx.clearRect(0, 0, cv.width, cv.height); if (!on) return;
for (const s of stars) {
const a = reduce ? .8 : .45 + .55 * (0.5 + 0.5 * Math.sin(s.p + t / 1000 * s.s));
if (s.spark) { ctx.fillStyle = night ? `rgba(255,240,250,${a * .8})` : `rgba(255,255,255,${a})`; const r = s.r; ctx.fillRect(s.x - r, s.y - .5, r * 2, 1); ctx.fillRect(s.x - .5, s.y - r, 1, r * 2); continue; }
ctx.globalAlpha = (night ? .55 : .75) * (.6 + .4 * a); ctx.fillStyle = cols[s.c]; star(s.x, s.y, s.r, s.rot); ctx.fill(); ctx.globalAlpha = 1;
}
}
function loop(t) { if (t - last > 110) { draw(t); last = t; } requestAnimationFrame(loop); }
addEventListener('resize', size); size();
if (!reduce) requestAnimationFrame(loop);
return { setOn(v) { on = v; draw(performance.now()); }, setColors(c, n) { cols = c; night = n; draw(performance.now()); } };
})();
let toastT;
function toast(msg) {
$$('.toast').forEach(n => n.remove()); clearTimeout(toastT);
const n = document.createElement('div'); n.className = 'toast'; n.textContent = msg; n.setAttribute('role', 'status'); document.body.appendChild(n);
toastT = setTimeout(() => { n.classList.add('out'); setTimeout(() => n.remove(), 320); }, 2400);
}
let sheetClose = null;
function openSheet(title, html, mount, opts) {
const scrim = $('#scrim'); const sh0 = $('#sheet'); const sh = sh0.cloneNode(false); sh0.replaceWith(sh);
sh.innerHTML = `<div class="grab"></div><div class="sheet-h"><h2>${esc(title)}</h2><button class="iconbtn" data-x aria-label="Cerrar">✕</button></div><div class="sheet-b">${html}</div>`;
scrim.hidden = false; scrim.classList.toggle('jsheet', !!(opts && opts.paper));
sheetClose = opts && opts.onClose;
$('[data-x]', sh).onclick = closeSheet;
scrim.onclick = e => { if (e.target === scrim) closeSheet(); };
if (mount) mount(sh);
const f = sh.querySelector('[autofocus]'); if (f && matchMedia('(pointer:fine)').matches) f.focus();
return sh;
}
addEventListener('popstate', e => {
if (!$('#scrim').hidden) { closeSheet(); try { history.pushState({ r: S.route }, ''); } catch (er) {} return; }
const r = e.state && e.state.r;
if (NAVSTACK.length) NAVSTACK.pop();
const to = r || NAVSTACK[NAVSTACK.length - 1] || 'home';
if (!NAVSTACK.length) NAVSTACK.push(to);
if (to !== S.route) go(to, true);
});
function closeSheet() { $('#scrim').hidden = true; $('#sheet').innerHTML = ''; const f = sheetClose; sheetClose = null; if (f) f(); }
addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#scrim').hidden) closeSheet(); });
function pickIcon(current, onPick, opts) {
const VARS = [['', 'Original'], ['fresa', 'Fresa'], ['menta', 'Menta'], ['noche', 'Noche'], ['chocolate', 'Chocolate']];
let variant = (current && current.includes('~')) ? current.split('~')[1] : '';
const canUp = isPlus() || !!(opts && opts.upload);
const tabs = `<div class="seg" style="margin-bottom:12px"><button data-tab="s" aria-pressed="true">Iconos</button><button data-tab="i" aria-pressed="false">Mi imagen ${canUp ? '' : '<span class="tag gold">Meffy+</span>'}</button></div>`;
openSheet(opts && opts.title || 'Elige un icono', tabs + '<div id="ipBody"></div>', sh => {
const body = $('#ipBody', sh);
const show = tab => {
$$('[data-tab]', sh).forEach(b => b.setAttribute('aria-pressed', b.dataset.tab === tab));
if (tab === 's') body.innerHTML = `<div class="chips" style="margin-bottom:10px">${VARS.map(([v, n]) => `<button class="chip" data-var="${v}" aria-pressed="${variant === v}">${v ? px('heart~' + v, 16) + ' ' : ''}${n}${v && !isPlus() ? ' ' + px('diamante', 14) : ''}</button>`).join('')}</div>
${variant && !isPlus() ? '<p class="faint" style="margin:0 0 8px">Los colores especiales son de Meffy+. Puedes verlos, y se activan con Meffy+.</p>' : ''}
<div class="emojigrid">${Pix.names.map(n => { const v = 's:' + n + (variant ? '~' + variant : ''); return `<button data-v="${v}" aria-pressed="${current === v}"><img class="pixel" alt="" src="${Pix.sprite(n + (variant ? '~' + variant : ''), 3)}"></button>`; }).join('')}</div>`;
if (tab === 'i') body.innerHTML = canUp ? `<p class="muted">${opts && opts.upload ? 'Puedes subir el logo de tu banco o app, o cualquier imagen tuya.' : 'Sube una imagen tuya (PNG con fondo transparente queda lindo).'} Se recorta a un tamaño pequeño.</p><label class="chip" style="margin-bottom:10px"><input type="checkbox" id="ipPix" checked> Es dibujo pixelado (queda nítido)</label><input type="file" accept="image/*" class="in" id="ipFile">` : plusPitch('Sube tus propios iconos con Meffy+.');
const f = $('#ipFile', sh); if (f) f.onchange = async () => {
let file = f.files[0]; if (!file) return; toast('Subiendo…');
if ($('#ipPix', sh) && $('#ipPix', sh).checked && A.pixelize) { try { const img = await A.readPixels(file); const r = A.pixFit(img, 48); if (r) { const cv = A.pixPNG(r, 160); const blob = await new Promise(ok => cv.toBlob(ok, 'image/png')); file = new File([blob], 'icono.png', { type: 'image/png' }); } } catch (e) { } }
const r = await Store.saveImage(file, 160); closeSheet(); onPick('i:' + r.src); };
};
sh.addEventListener('click', e => {
const t = e.target.closest('[data-tab]'); if (t) return show(t.dataset.tab);
const vr = e.target.closest('[data-var]'); if (vr) { variant = vr.dataset.var; return show('s'); }
const v = e.target.closest('[data-v]'); if (v) { if (variant && !isPlus()) { toast('Ese color es de Meffy+'); return; } const val = v.dataset.v; closeSheet(); onPick(val); }
if (e.target.closest('[data-go-plan]')) { closeSheet(); go('plan'); }
});
show('s');
});
}
function plusPitch(msg) { return `<div class="plan-hero" style="text-align:center"><div>${px('diamante', 40)}</div><b>${esc(msg)}</b><p style="margin:6px 0 12px">Meffy+ desbloquea temas, fuentes, packs de iconos y tus propias imágenes.</p><button class="btn pink" data-go-plan>Ver Meffy+</button></div>`; }
function pickBanner(key) {
const cur = (S.settings.banners || {})[key] || {};
const html = `<div class="bannergrid">${Object.entries(Pix.BANNERS).map(([id, b]) => `<button data-b="${id}" aria-pressed="${cur.preset === id}" title="${esc(b.name)}"><img class="pixel" alt="${esc(b.name)}" src="${Pix.banner(id)}"></button>`).join('')}</div>
<div class="stack" style="margin-top:14px">
<label class="f">Tu propia imagen ${isPlus() ? '' : '<span class="tag gold">Meffy+</span>'}<input type="file" accept="image/*" class="in" id="bnFile" ${isPlus() ? '' : 'disabled'}></label>
${isPlus() ? '' : '<button class="btn pink sm" data-go-plan style="align-self:flex-start">Desbloquear con Meffy+</button>'}
<button class="btn" data-b="none">Ocultar banner en esta página</button>
</div>`;
openSheet('Banner de ' + PAGES[key], html, sh => {
sh.addEventListener('click', e => {
if (e.target.closest('[data-go-plan]')) { closeSheet(); return go('plan'); }
const b = e.target.closest('[data-b]'); if (!b) return;
S.settings.banners[key] = b.dataset.b === 'none' ? { hidden: true } : { preset: b.dataset.b }; saveSettings(); closeSheet(); render();
});
const f = $('#bnFile', sh); if (f) f.onchange = async () => { if (!f.files[0]) return; toast('Subiendo imagen…'); const r = await Store.saveImage(f.files[0], 1400); S.settings.banners[key] = { img: r.src }; saveSettings(); closeSheet(); render(); };
});
}
function bannerHTML(key, inner) {
const b = (S.settings.banners || {})[key];
if (!b || b.hidden) return '';
const src = b.img ? esc(b.img) : Pix.banner(b.preset || 'noche');
return `<div class="banner"><img class="bg ${b.img ? '' : 'pixel'}" alt="" src="${src}"><button class="iconbtn edit" data-act="banner" data-k="${key}" aria-label="Cambiar banner">${px('pic', 22)}</button>${inner || ''}</div>`;
}
function privBtn(cls) { return `<button class="iconbtn priv ${cls || ''}" data-act="privacy" aria-pressed="${!!S.priv}" aria-label="${S.priv ? 'Mostrar las cifras' : 'Ocultar las cifras'}">${px(S.priv ? 'ojo_cerrado' : 'm_ojo', 26)}</button>`; }
function header(key, right) {
return `<div class="ph"><div class="ph-left"><span class="pill">${esc(PAGES[key])}</span><button class="ph-icon" data-act="pageicon" data-k="${key}" aria-label="Cambiar icono de ${esc(PAGES[key])}">${iconHTML(pageIcon(key), 34)}</button></div>${right || ''}</div>`;
}
const NAV = ['home', 'wallet', 'add', 'month', 'journal', 'more'];
function renderNav() {
$('#navIn').innerHTML = NAV.map(k => k === 'add'
? `<button class="fab" data-act="quickadd" aria-label="Registrar movimiento"><span class="ni">${iconHTML(pageIcon('add'), 30)}</span><span>Anotar</span></button>`
: `<button data-go="${k}" ${S.route === k || (k === 'wallet' && ['acctd', 'loans'].includes(S.route)) || (k === 'more' && !NAV.includes(S.route) && !['acctd', 'loans'].includes(S.route)) ? 'aria-current="page"' : ''}><span class="ni">${iconHTML(pageIcon(k), 32)}${window.App && App.navDot && App.navDot(k) ? '<i class="nav-dot"></i>' : ''}</span><span>${PAGES[k]}</span></button>`).join('');
}
const NAVSTACK = [];
function go(route, fromPop) {
if (!fromPop && route !== S.route) {
if (NAVSTACK.length > 1 && NAVSTACK[NAVSTACK.length - 2] === route) { history.back(); return; }
if (!NAVSTACK.length) NAVSTACK.push(S.route);
NAVSTACK.push(route); try { history.pushState({ r: route }, ''); } catch (e) {}
}
if (route !== S.route && S.route === 'journal' && window.Journal) Journal.leave();
S.route = route; renderNav(); render(); window.scrollTo(0, 0);
}
const screens = {};
function render() {
const app = $('#app');
let el = $('#scr');
if (!el) { el = document.createElement('main'); el.id = 'scr'; el.className = 'screen'; app.innerHTML = ''; app.appendChild(el); }
el.className = 'screen' + (S.route === 'journal' ? ' wide' : '');
if (S.route === 'journal' && window.Journal) { Journal.render(el); return; }
el.innerHTML = (screens[S.route] || screens.home)();
after[S.route] && after[S.route](el);
}
const after = {};
function exampleNote() {
if (!S.settings.examples || !S.tx.some(t => t.example)) return '';
return `<div class="example-note"><span>Estás viendo datos de ejemplo para que veas cómo luce todo.</span><button class="btn sm" data-act="clearExamples">Borrar ejemplos</button></div>`;
}
const cents = h => String(h).replace(/,(\d\d)(?!\d)/, '<small>,$1</small>');
const TINTS = ['#fde3ea', '#ffe8c7', '#e1effb', '#e3f3df', '#efe6fb', '#fff4c2', '#dcf3ec', '#ffe1d6'];
function tintOf(id) { let h = 0; String(id || '').split('').forEach(c => h = (h * 31 + c.charCodeAt(0)) >>> 0); return TINTS[h % TINTS.length]; }
function txRow(t) {
const c = cat(t.cat); const a = acct(t.acct); const to = acct(t.to);
const cls = (t.type === 'income' || t.type === 'loan_in') ? 'income' : t.type === 'transfer' ? 'transfer' : t.recurring ? 'recurring' : '';
const amt = (t.type === 'income' || t.type === 'loan_in') ? `<span class="amt pos num">+${cents(money(t.amount))}</span>` : t.type === 'transfer' ? `<span class="amt num">${cents(money(t.amount))}</span>` : `<span class="amt num">−${cents(money(t.amount))}</span>`;
const sub = t.type === 'transfer' ? `${esc(a ? a.name : '?')} → ${esc(to ? to.name : '?')}` : (t.type === 'loan_in' || t.type === 'loan_out') ? `Préstamo${a ? ' · ' + esc(a.name) : ''}` : `${esc(c ? c.name : 'Sin categoría')}${a ? ' · ' + esc(a.name) : ''}`;
return `<button class="li ${cls}" data-act="edittx" data-id="${t.id}"><span class="ic" style="background:${t.type === 'income' || t.type === 'loan_in' ? '#e3f3df' : t.type === 'transfer' ? '#fff4c2' : tintOf(t.cat)}">${iconHTML(t.type === 'transfer' ? 's:ui_transfer' : (c ? c.icon : 's:moneda'), 28)}</span><span class="tx-main"><b>${esc(t.note || (c ? c.name : 'Movimiento'))}</b><span>${sub}${t.feel && A_feels() && A_feels()[t.feel] ? ' · ' + A_feels()[t.feel].e : ''}${t.example ? ' · ejemplo' : ''}</span></span>${amt}</button>`;
}
screens.home = () => {
const st = S.settings; const k = ym(today()); const list = txIn(k);
const spent = spentOf(list); const budget = budgetExpenses(false);
const dLeft = daysIn(k) - new Date().getDate() + 1;
const todaySpent = spentOf(txOnDay(today())); const todayIn = incomeOf(txOnDay(today())); const todayN = txOnDay(today()).length;
const perDay = Math.max(0, (budget - spent + todaySpent) / dLeft);
const leftToday = perDay - todaySpent;
const hr = new Date().getHours(); const hi = hr < 12 ? 'Buenos días' : hr < 19 ? 'Buenas tardes' : 'Buenas noches';
const mascot = st.mascotOn ? `<button class="mascot" data-act="mascot" aria-label="Ale te da un consejo">${st.mascot && st.mascot.startsWith('i:') ? `<img alt="" src="${esc(st.mascot.slice(2))}">` : ((st.mascot || 's:pudin') === 's:pudin' && window.App && App.wear ? App.wear('ale', { scale: 4 }) : `<img class="pixel" alt="" src="${Pix.sprite((st.mascot || 's:pudin').slice(2), 4)}">`)}</button><div class="bubble" id="bubble">${esc(tip())}</div>` : '';
const banner = bannerHTML('home', `<div class="greet">${hi}${st.name ? ', ' + esc(st.name) : ''} ✦<small>${cap(new Date().toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' }))}</small></div>${mascot}${privBtn('onbanner')}`);
const recent = S.tx.slice(0, 5);
const withA = st.assetsInNet !== false;
const upcoming = S.fin.recurring.filter(r => r.active).sort((a, b) => a.next.localeCompare(b.next)).slice(0, 3);
return `
${banner || header('home', privBtn())}
${window.App && App.newsCard ? App.newsCard() : ''}
${exampleNote()}
${window.App && App.aleCard ? App.aleCard() : ''}
<!--alertas--><div class="hoy card">
<span class="hoy-deco" aria-hidden="true">${px('estrellita', 22)}${px('heart', 18)}${px('moneda', 20)}${px('star', 14)}</span>
<div class="hoy-k">Hoy <span>${cap(new Date().toLocaleDateString('es-EC', { weekday: 'long' }))}</span></div>
<div class="hoy-row"><div class="hoy-box out"><span class="hoy-ic">${px('bolsa', 26)}</span><div><span class="faint">Gastaste</span><div class="big num">${cents(money(todaySpent))}</div></div></div><div class="hoy-box in"><span class="hoy-ic">${px('alcancia', 26)}</span><div><span class="faint">Entró</span><div class="big num pos">${cents(money(todayIn))}</div></div></div></div>
${todayN ? `<div class="faint" style="font-size:12.5px">${todayN} ${todayN === 1 ? 'movimiento' : 'movimientos'} hoy${budget ? ` · en el mes llevas ${money(spent)} de ${money(budget)}` : ''}</div>` : `<div class="faint" style="font-size:12.5px">Aún no anotas nada hoy${budget ? ` · en el mes llevas ${money(spent)} de ${money(budget)}` : ''}</div>`}
</div>
${goalStories()}
${A_rincon()}
${window.App && App.sheyReady && App.sheyReady() ? `<button class="card row" data-go="shey" style="gap:12px;width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer;background:#f4edff;border-color:#e2d4fb"><img class="pixel" alt="" src="${Pix.sprite(App.petInfo && App.petActive && App.petActive() ? App.petInfo(App.petActive()).sprite : 'shey', 3)}" style="width:48px;height:48px"><div style="flex:1"><b>${esc(App.petInfo && App.petActive && App.petActive() ? App.petInfo(App.petActive()).name : 'Shey')} te espera</b> ${px('alerta', 16)}<div class="faint">${esc(App.sheyMsg())}</div></div></button>` : ''}
<section class="stack">
<div class="ph"><span class="pill sm">Movimientos</span><span class="row" style="gap:8px"><button class="round-btn" data-act="showFilters" aria-label="Buscar y filtrar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4.5 4.5"></path></svg></button><button class="btn sm" data-act="quickadd">Nuevo +</button></span></div>
${txListBody({ compact: true })}
</section>`;
};
function goalStories() {
const G = S.fin.goals || []; if (!G.length) return `<div class="gstories"><button class="gstory add" data-act="newgoal"><span class="gring"><span>+</span></span><b>Nueva meta</b></button></div>`;
return `<div class="gstories">${G.map((g, i) => { const p = g.target ? Math.min(100, Math.round(g.saved / g.target * 100)) : 0; return `<button class="gstory" data-go="goals" aria-label="${esc(g.name)}: ${p}%"><span class="gring" style="--p:${p}%"><span>${iconHTML(g.icon || 's:meta', 34)}</span></span><b>${esc(g.name)}</b><em>${p}%</em></button>`; }).join('')}<button class="gstory add" data-act="newgoal"><span class="gring"><span>+</span></span><b>Nueva</b></button></div>`;
}
function A_feels() { return window.App && App.FEELS; }
function A_rincon() { return window.App && App.rinconCard ? App.rinconCard() : ''; }
function goalMini(g) { const p = g.target ? Math.min(100, g.saved / g.target * 100) : 0; return `<div class="row"><span style="width:34px;display:grid;place-items:center">${iconHTML(g.icon, 28)}</span><div style="flex:1;min-width:0"><div class="row between"><b>${esc(g.name)}</b><span class="faint num">${money(g.saved)} / ${money(g.target)}</span></div><div class="prog"><i style="width:${p}%"></i></div></div></div>`; }
function fmtDate(s) { const d = parseYmd(s); return d.toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short' }); }
function tip() {
const k = ym(today()); const list = txIn(k); const spent = spentOf(list); const budget = budgetExpenses(false);
const bc = byCat(list); const top = Object.entries(bc).sort((a, b) => b[1] - a[1])[0];
const tips = [];
if (!S.tx.length) tips.push('¡Hola! Anota tu primer gasto con el botón rosa.');
if (budget && spent / budget > .9) tips.push('Ya usaste casi todo tu presupuesto del mes. ¡Respira y planea!');
else if (budget) tips.push(`Llevas el ${Math.round(spent / budget * 100)}% de tu presupuesto del mes.`);
if (top && cat(top[0])) tips.push(`Tu categoría más gastada: ${cat(top[0]).name}.`);
const g = S.fin.goals[0]; if (g && g.target) tips.push(`Te falta ${money(g.target - g.saved)} para “${g.name}”.`);
tips.push('Decora tu journal de hoy ✿'); tips.push('Soy Ale y cuido tu dinerito ✦');
return tips[Math.floor(Math.random() * tips.length)];
}
function dayClosed(d) { try { return (JSON.parse(localStorage.getItem('bolsi_days') || '[]')).includes(d); } catch (e) { return false; } }
function toggleDay(d) { try { let L = JSON.parse(localStorage.getItem('bolsi_days') || '[]'); L = L.includes(d) ? L.filter(x => x !== d) : L.concat(d).slice(-200); localStorage.setItem('bolsi_days', JSON.stringify(L)); } catch (e) { } }
document.addEventListener('click', e => { const h = e.target.closest('[data-dayfold]'); if (!h) return; const g = h.closest('.daygrp'); toggleDay(h.dataset.dayfold); g.classList.toggle('closed'); h.setAttribute('aria-expanded', !g.classList.contains('closed')); });
function txListBody(opts) {
const f = S.filters; const months = [...new Set(S.tx.map(t => ym(t.date)))].sort().reverse();
let list = S.tx.filter(t => (f.type === 'all' || t.type === f.type) && (f.cat === 'all' || t.cat === f.cat) && (f.acct === 'all' || t.acct === f.acct || t.to === f.acct) && (f.month === 'all' || ym(t.date) === f.month));
if (f.q) { const q = f.q.toLowerCase(); list = list.filter(t => (t.note || '').toLowerCase().includes(q) || ((cat(t.cat) || {}).name || '').toLowerCase().includes(q)); }
const groups = {}; list.forEach(t => (groups[t.date] = groups[t.date] || []).push(t));
const tot = { in: incomeOf(list), out: spentOf(list, { withSaving: true }) };
const compact = opts && opts.compact && !S.showFilters && !f.q && f.cat === 'all' && f.acct === 'all' && f.month === 'all';
const days = Object.keys(groups).length ? Object.entries(groups).map(([d, items]) => { const closed = dayClosed(d); const tot = items.reduce((s, t) => s + (t.type === 'income' ? t.amount : t.type === 'expense' ? -t.amount : 0), 0); return `<div class="daygrp ${closed ? 'closed' : ''}"><button class="dayhead" data-dayfold="${d}" aria-expanded="${!closed}"><span>${fmtDate(d)}<em>${items.length} ${items.length === 1 ? 'movimiento' : 'movimientos'}</em></span><span class="num ${tot > 0 ? 'pos' : ''}"><span>${cents(money(tot, { sign: true }))}</span><i class="chev"></i></span></button><div class="dayitems">${items.map(txRow).join('')}</div></div>`; }).join('') : '<div class="card empty">No hay movimientos con estos filtros.</div>';
if (compact) return `<div class="tabs-line">${[['all', 'Todos'], ['expense', 'Gastos'], ['income', 'Ingresos'], ['transfer', 'Transf.']].map(([v, n]) => `<button data-f="type" data-v="${v}" aria-pressed="${f.type === v}">${n}</button>`).join('')}</div><div class="list days">${days}</div>`;
return `<div class="card stack">
<input class="in" id="fq" placeholder="Buscar por nota o categoría" value="${esc(f.q)}" type="search">
<div class="seg"><button data-f="type" data-v="all" aria-pressed="${f.type === 'all'}">Todo</button><button data-f="type" data-v="expense" aria-pressed="${f.type === 'expense'}">Gastos</button><button data-f="type" data-v="income" aria-pressed="${f.type === 'income'}">Ingresos</button><button data-f="type" data-v="transfer" aria-pressed="${f.type === 'transfer'}">Transf.</button></div>
<div class="formgrid">
<select class="in" id="fmonth"><option value="all">Todos los meses</option>${months.map(m => `<option value="${m}" ${f.month === m ? 'selected' : ''}>${cap(monthLabel(m))}</option>`).join('')}</select>
<select class="in" id="facct"><option value="all">Todas las cuentas</option>${S.fin.accounts.map(a => `<option value="${a.id}" ${f.acct === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select>
<select class="in full" id="fcat"><option value="all">Todas las categorías</option>${S.fin.categories.map(c => `<option value="${c.id}" ${f.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
</div>
<div class="row between faint"><span>${list.length} movimientos</span><span class="num"><span class="pos">+${money(tot.in)}</span> · <span class="neg">−${money(tot.out)}</span></span></div>
</div>
${opts && opts.compact ? '<button class="btn sm" data-act="hideFilters" style="align-self:flex-start">Cerrar filtros</button>' : ''}
<div class="list days">${days}</div>`;
}
screens.tx = () => `
${bannerHTML('tx') || ''}
${header('tx', '<button class="btn sm" data-act="quickadd">Nuevo +</button>')}
${txListBody()}`;
after.home = el => after.tx(el);
after.tx = el => {
const f = S.filters; if (!$('#fq', el)) return;
$('#fq', el).oninput = e => { f.q = e.target.value; const pos = e.target.selectionStart; render(); const n = $('#fq'); n.focus(); n.setSelectionRange(pos, pos); };
$('#fmonth', el).onchange = e => { f.month = e.target.value; render(); };
$('#facct', el).onchange = e => { f.acct = e.target.value; render(); };
$('#fcat', el).onchange = e => { f.cat = e.target.value; render(); };
};
screens.month = () => {
const k = S.month; const list = txIn(k); const incl = !!S.monthWithSaving;
const out = spentOf(list, { withSaving: incl }), inn = incomeOf(list);
const expOut = budgetExpenses(incl), expIn = budgetIncome();
const bc = byCat(list), bi = byCat(list, 'income');
let rows = '';
S.fin.groups.forEach(g => {
const cs = S.fin.categories.filter(c => c.group === g.id); if (!cs.length) return;
const isInc = g.kind === 'income';
const totE = cs.reduce((s, c) => s + (+c.budget || 0), 0), totA = cs.reduce((s, c) => s + ((isInc ? bi : bc)[c.id] || 0), 0);
rows += `<tr class="grp"><td colspan="4"><span style="background:${g.color}">${esc(g.name)}</span></td></tr>`;
rows += `<tr><td><b>Total</b></td><td class="num"><b>${money(totE)}</b></td><td class="num"><b>${money(totA)}</b></td><td class="num">${totE ? Math.round(totA / totE * 100) + '%' : '—'}</td></tr>`;
cs.forEach(c => { const a = (isInc ? bi : bc)[c.id] || 0; const pc = c.budget ? a / c.budget : 0; rows += `<tr><td>${iconHTML(c.icon, 16)} ${esc(c.name)}</td><td class="num">${money(c.budget || 0)}</td><td class="num">${money(a)}</td><td class="num ${!isInc && pc > 1 ? 'neg' : ''}">${c.budget ? Math.round(pc * 100) + '%' : '—'}</td></tr>`; });
});
const dN = daysIn(k); const weeks = []; let start = 1;
while (start <= dN) { const d0 = parseYmd(k + '-' + pad(start)); const end = Math.min(dN, start + (6 - dowIdx(d0))); weeks.push([start, end]); start = end + 1; }
const wk = weeks.map(([a, b]) => ({ a, b, v: spentOf(list.filter(t => { const d = +t.date.slice(8); return d >= a && d <= b; })) }));
const wMax = Math.max(1, ...wk.map(w => w.v));
const mon = MON3[+k.slice(5) - 1];
const parts = Object.entries(bc).filter(([id]) => incl || !isSaving(cat(id))).sort((a, b) => b[1] - a[1]);
return `
${bannerHTML('month') || ''}
<div class="ph"><div class="ph-left"><button class="navarrow" data-act="mPrev" aria-label="Mes anterior">‹</button><span class="pill">${cap(monthLabel(k))}</span><button class="navarrow" data-act="mNext" aria-label="Mes siguiente">›</button></div><button class="ph-icon" data-act="pageicon" data-k="month" aria-label="Cambiar icono">${iconHTML(pageIcon('month'), 34)}</button></div>
<div class="seg"><button data-act="mSave" data-v="0" aria-pressed="${!incl}">Sin ahorro/inversión</button><button data-act="mSave" data-v="1" aria-pressed="${incl}">Con ahorro/inversión</button></div>
<div class="card"><h3>Entra vs. sale</h3>
${evsRow('Entra', 'alcancia', inn, expIn, '#7cc29a')}${evsRow('Sale', 'bolsa', out, expOut, '#f27ea1')}
<div class="evs-foot"><span>Sale de lo que entra: <b>${inn ? Math.round(out / inn * 100) + '%' : '—'}</b></span><span class="faint">planeado ${expIn ? Math.round(expOut / expIn * 100) + '%' : '—'}</span></div>
<p class="faint" style="margin:6px 0 0;font-size:12px">Lo real va del día 1 hasta hoy; lo planeado es el mes completo.</p>
</div>
<div class="card"><h3>Calendario de gastos</h3>${monthCalendar(k, list)}</div>
<div class="card"><h3>Gasto por semana</h3>${wk.map(w => `<div class="row" style="padding:5px 0"><span class="faint" style="width:92px;font-weight:800">${mon} ${w.a}–${w.b}</span><div class="prog" style="flex:1"><i style="width:${w.v / wMax * 100}%"></i></div><b class="num" style="width:90px;text-align:right">${money(w.v)}</b></div>`).join('')}<div class="faint" style="margin-top:6px">Total: ${money(out)} · Promedio semanal: ${money(out / weeks.length)}</div></div>
<div class="card"><h3>En qué se fue</h3>${parts.length ? donut(parts) : '<div class="empty">Cuando anotes gastos aparecerán aquí.</div>'}</div>
<div class="card"><h3>Gasto acumulado vs. ritmo del presupuesto</h3>${cumulative(k, list, expOut, incl)}</div>
<div class="card" style="overflow-x:auto"><h3>Planeado vs. real por categoría</h3><table class="bk"><thead><tr><th></th><th>PLAN</th><th>REAL</th><th>%</th></tr></thead><tbody>${rows}</tbody></table><p class="faint">Cambia los montos planeados en Más → Cuentas y categorías.</p></div>`;
};
function evsRow(name, ic, real, plan, col) {
const m = Math.max(1, real, plan); const pc = plan ? Math.round(real / plan * 100) : 0;
return `<div class="evs"><span class="evs-ic">${px(Pix.has(ic) ? ic : 'moneda', 26)}</span><div class="evs-b"><div class="evs-t"><b>${name}</b><span class="num"><b>${money(real)}</b> <span class="faint">de ${money(plan)}</span></span></div><div class="evs-track"><i class="plan" style="width:${plan / m * 100}%"></i><i class="real" style="width:${real / m * 100}%;background:${col}"></i></div></div><span class="evs-pc" style="color:${col}">${plan ? pc + '%' : ''}</span></div>`;
}
function barPair(a, b) {
const m = Math.max(1, a, b);
return `<div class="b"><span class="num">${money(a, { short: true })}</span><i style="height:${a / m * 100}%;background:#ffb8d6"></i><span class="faint">Entra</span></div><div class="b"><span class="num">${money(b, { short: true })}</span><i style="height:${b / m * 100}%;background:#8fcbed"></i><span class="faint">Sale</span></div>`;
}
function monthCalendar(k, list) {
const first = parseYmd(k + '-01'); const off = dowIdx(first); const n = daysIn(k); const td = today();
let h = DOW.map((d, i) => `<div class="dow ${i >= 5 ? 'we' : ''}">${d}</div>`).join('');
const maxO = Math.max(1, ...Array.from({ length: n }, (_, j) => spentOf(list.filter(t => t.date === k + '-' + pad(j + 1)), { withSaving: true })));
for (let i = 0; i < off; i++) h += '<div class="d out"></div>';
for (let d = 1; d <= n; d++) {
const ds = k + '-' + pad(d); const dl = list.filter(t => t.date === ds);
const o = spentOf(dl, { withSaving: true }), i = incomeOf(dl); const lvl = o ? Math.min(4, 1 + Math.floor(o / maxO * 3.99)) : 0; const dw = (off + d - 1) % 7;
h += `<button class="d ${ds === td ? 'today' : ''} ${ds > td ? 'fut' : ''} ${dw >= 5 ? 'we' : ''} lv${lvl}" data-act="dayDetail" data-d="${ds}" aria-label="${d}${o ? ', gastaste ' + Math.round(o) : ''}"><b>${d}</b>${o ? `<em>−${Math.round(o)}</em>` : ''}${i ? `<em class="i">+${Math.round(i)}</em>` : ''}</button>`;
}
return `<div class="calbook"><span class="calbook-rings" aria-hidden="true"><i></i><i></i><i></i><i></i></span><div class="calbook-top">${cap(monthLabel(k))}</div><div class="calendar">${h}</div></div>`;
}
const DONUT = ['#f27ea1', '#8fcbed', '#ffd65c', '#9ccb62', '#ffb3cb', '#f4a88b', '#5fb0dc', '#e8c4a0', '#c6e59a', '#d9b3c8'];
function donut(parts) {
const top = parts.slice(0, 8); const rest = parts.slice(8).reduce((s, p) => s + p[1], 0); if (rest) top.push(['otros', rest]);
const total = top.reduce((s, p) => s + p[1], 0); let a = -Math.PI / 2; const R = 70, r = 44, cx = 90, cy = 90;
const arcs = top.map(([id, v], i) => {
const sweep = v / total * Math.PI * 2; const a2 = a + sweep; const large = sweep > Math.PI ? 1 : 0;
const p = (ang, rad) => `${(cx + Math.cos(ang) * rad).toFixed(2)} ${(cy + Math.sin(ang) * rad).toFixed(2)}`;
const d = sweep >= Math.PI * 2 - 1e-6 ? `M ${p(0, R)} A ${R} ${R} 0 1 1 ${p(Math.PI, R)} A ${R} ${R} 0 1 1 ${p(0, R)} M ${p(0, r)} A ${r} ${r} 0 1 0 ${p(Math.PI, r)} A ${r} ${r} 0 1 0 ${p(0, r)} Z`
: `M ${p(a, R)} A ${R} ${R} 0 ${large} 1 ${p(a2, R)} L ${p(a2, r)} A ${r} ${r} 0 ${large} 0 ${p(a, r)} Z`;
a = a2; return `<path d="${d}" fill="${DONUT[i % DONUT.length]}" stroke="rgba(255,255,255,.9)" stroke-width="2"/>`;
}).join('');
const center = S.settings.donutCenter ? `<image href="${esc(S.settings.donutCenter.replace(/^i:/, ''))}" x="62" y="62" width="56" height="56"/>` : `<image href="${Pix.sprite('pudin', 4)}" x="62" y="60" width="56" height="56" style="image-rendering:pixelated"/>`;
return `<div class="row" style="flex-wrap:wrap;justify-content:center;gap:16px"><svg viewBox="0 0 180 180" width="180" height="180" role="img" aria-label="Gasto por categoría">${arcs}${center}</svg>
<div class="stack" style="gap:6px;flex:1;min-width:180px">${top.map(([id, v], i) => { const c = cat(id); return `<div class="row" style="gap:8px"><i style="width:12px;height:12px;border-radius:4px;background:${DONUT[i % DONUT.length]};flex:none"></i><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c ? iconHTML(c.icon, 16) + ' ' + esc(c.name) : 'Otros'}</span><b class="num">${money(v)}</b><span class="faint num" style="width:40px;text-align:right">${Math.round(v / total * 100)}%</span></div>`; }).join('')}</div></div>`;
}
function cumulative(k, list, budget, incl) {
const n = daysIn(k); const isCur = k === ym(today()); const last = isCur ? new Date().getDate() : (k < ym(today()) ? n : 0);
const per = []; let acc = 0;
for (let d = 1; d <= last; d++) { acc += spentOf(list.filter(t => +t.date.slice(8) === d), { withSaving: incl }); per.push(acc); }
const W = 320, H = 150, L = 46, B = 22, T = 10, Rr = 8; const maxV = Math.max(budget, acc, 1);
const x = d => L + (d - 1) / (n - 1) * (W - L - Rr), y = v => T + (1 - v / maxV) * (H - T - B);
const ticks = [0, maxV / 3, maxV * 2 / 3, maxV];
const grid = ticks.map(v => `<line x1="${L}" x2="${W - Rr}" y1="${y(v)}" y2="${y(v)}" stroke="currentColor" stroke-opacity=".12"/><text x="${L - 6}" y="${y(v) + 4}" font-size="10" text-anchor="end" fill="currentColor" fill-opacity=".7">${money(v, { short: true }).replace(/,\d\d$/, '')}</text>`).join('');
const pace = `<line x1="${x(1)}" y1="${y(budget / n)}" x2="${x(n)}" y2="${y(budget)}" stroke="#8fcbed" stroke-width="2" stroke-dasharray="5 4"/>`;
const path = per.map((v, i) => `${i ? 'L' : 'M'}${x(i + 1).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
const area = per.length ? `<path d="${path} L${x(per.length).toFixed(1)} ${y(0)} L${x(1)} ${y(0)} Z" fill="#f58fbd" fill-opacity=".18"/>` : '';
const line = per.length ? `<path d="${path}" fill="none" stroke="#e2648f" stroke-width="2.5" stroke-linejoin="round"/><circle cx="${x(per.length)}" cy="${y(acc)}" r="4" fill="#e2648f" stroke="#fff" stroke-width="2"/>` : '';
const xl = [1, Math.ceil(n / 2), n].map(d => `<text x="${x(d)}" y="${H - 6}" font-size="10" text-anchor="middle" fill="currentColor" fill-opacity=".7">${d}</text>`).join('');
return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="color:var(--ink);max-width:100%">${grid}${pace}${area}${line}${xl}</svg><div class="row faint" style="gap:14px;flex-wrap:wrap"><span><i style="display:inline-block;width:14px;height:3px;background:#e2648f;vertical-align:middle"></i> Real ${money(acc)}</span><span><i style="display:inline-block;width:14px;height:0;border-top:2px dashed #8fcbed;vertical-align:middle"></i> Ritmo ideal (presupuesto ${money(budget)})</span></div>`;
}
screens.year = () => {
const y = S.year || new Date().getFullYear(); const list = S.tx.filter(t => t.date.startsWith(y + ''));
const months = Array.from({ length: 12 }, (_, i) => y + '-' + pad(i + 1));
const per = months.map(m => { const l = list.filter(t => ym(t.date) === m); return { m, in: incomeOf(l), out: spentOf(l) }; });
const mx = Math.max(1, ...per.map(p => Math.max(p.in, p.out)));
const used = per.filter(p => p.in || p.out); const totOut = spentOf(list), totIn = incomeOf(list);
const bg = {}; list.filter(t => t.type === 'expense').forEach(t => { const c = cat(t.cat); const g = c ? c.group : 'x'; bg[g] = (bg[g] || 0) + t.amount; });
const topc = Object.entries(byCat(list)).filter(([id]) => !isSaving(cat(id))).sort((a, b) => b[1] - a[1]).slice(0, 6);
const saved = list.filter(t => (t.type === 'expense' && isSaving(cat(t.cat))) || (t.type === 'transfer' && ['ahorro', 'alcancia', 'inversion'].includes((acct(t.to) || {}).type))).reduce((s, t) => s + t.amount, 0);
return `
${bannerHTML('year') || ''}
<div class="ph"><div class="ph-left"><button class="navarrow" data-act="yPrev" aria-label="Año anterior">‹</button><span class="pill">Resumen ${y}</span><button class="navarrow" data-act="yNext" aria-label="Año siguiente">›</button></div><button class="ph-icon" data-act="pageicon" data-k="year" aria-label="Cambiar icono">${iconHTML(pageIcon('year'), 34)}</button></div>
<div class="grid2">
<div class="card"><h3>Ingresos del año</h3><div class="mid num pos">${money(totIn)}</div></div>
<div class="card"><h3>Gastos del año</h3><div class="mid num">${money(totOut)}</div></div>
<div class="card"><h3>Te quedó</h3><div class="mid num ${totIn - totOut < 0 ? 'neg' : ''}">${money(totIn - totOut)}</div></div>
<div class="card"><h3>Ahorraste</h3><div class="mid num">${money(saved)}</div></div>
</div>
<div class="card"><h3>Mes a mes</h3>
<div style="display:flex;align-items:flex-end;gap:4px;height:160px">${per.map(p => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%;justify-content:flex-end"><div style="display:flex;gap:1px;align-items:flex-end;height:calc(100% - 18px);width:100%"><i style="flex:1;border-radius:4px 4px 1px 1px;background:#ffb8d6;height:${p.in / mx * 100}%;min-height:${p.in ? 2 : 0}px"></i><i style="flex:1;border-radius:4px 4px 1px 1px;background:#8fcbed;height:${p.out / mx * 100}%;min-height:${p.out ? 2 : 0}px"></i></div><span style="font-size:9.5px;font-weight:800" class="faint">${MON3[+p.m.slice(5) - 1]}</span></div>`).join('')}</div>
<div class="row faint" style="gap:14px;margin-top:6px"><span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#ffb8d6"></i> Entra</span><span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#8fcbed"></i> Sale</span></div>
</div>
<div class="card"><h3>Por grupo</h3>${Object.keys(bg).length ? Object.entries(bg).sort((a, b) => b[1] - a[1]).map(([g, v]) => { const gg = group(g) || { name: 'Otros', color: '#eee' }; return `<div class="row" style="padding:5px 0"><span class="tag" style="background:${gg.color};color:#6b3b3f;width:110px;text-align:center">${esc(gg.name)}</span><div class="prog" style="flex:1"><i style="width:${v / Math.max(...Object.values(bg)) * 100}%"></i></div><b class="num" style="width:96px;text-align:right">${money(v)}</b></div>`; }).join('') : '<div class="empty">Sin gastos este año todavía.</div>'}</div>
<div class="card"><h3>Categorías con más gasto</h3>${topc.length ? topc.map(([id, v], i) => { const c = cat(id); return `<div class="row" style="padding:5px 0"><b style="width:18px" class="faint">${i + 1}</b>${iconHTML(c ? c.icon : 's:moneda', 22)}<span style="flex:1">${esc(c ? c.name : '—')}</span><b class="num">${money(v)}</b></div>`; }).join('') : '<div class="empty">Sin datos.</div>'}</div>
<div class="card"><h3>Promedio mensual</h3><div class="row between"><span>Gasto promedio</span><b class="num">${money(used.length ? totOut / used.length : 0)}</b></div><div class="row between"><span>Meses con movimientos</span><b>${used.length}</b></div>${used.length ? `<div class="row between"><span>Mes más gastador</span><b>${cap(monthLabel(used.slice().sort((a, b) => b.out - a.out)[0].m))}</b></div>` : ''}</div>`;
};
function evalExpr(s) {
const toks = (s.replace(/,/g, '.').match(/\d*\.?\d+|[+\-×÷*/]/g) || []);
if (!toks.length) return 0;
const nums = [], ops = []; const prec = o => (o === '×' || o === '÷' || o === '*' || o === '/') ? 2 : 1;
const apply = () => { const b = nums.pop(), a = nums.pop() ?? 0, o = ops.pop(); nums.push(o === '+' ? a + b : o === '-' ? a - b : (o === '×' || o === '*') ? a * b : (b ? a / b : 0)); };
let expectNum = true;
for (const t of toks) {
if (/[\d.]/.test(t)) { nums.push(parseFloat(t)); expectNum = false; }
else { if (expectNum) continue; while (ops.length && prec(ops[ops.length - 1]) >= prec(t)) apply(); ops.push(t); expectNum = true; }
}
if (expectNum && ops.length) ops.pop();
while (ops.length) apply();
const v = nums.pop(); return isFinite(v) ? Math.round(v * 100) / 100 : 0;
}
function quickAdd(existing, preset) {
const t = existing ? { ...existing } : Object.assign({ type: 'expense', cat: null, acct: S.settings.defaultAcct || (S.fin.accounts[0] || {}).id, to: null, date: today(), note: '' }, preset || {});
let expr = existing ? String(existing.amount) : (preset && preset.amount ? String(preset.amount) : '');
let manualCat = !!existing; let pane = 'cat'; if (!t.split || typeof t.split !== 'object') t.split = { n: (typeof t.split === 'number' && t.split) || 1, names: [] };
const SR = window.SpeechRecognition || window.webkitSpeechRecognition; let rec = null;
const title = existing ? 'Editar movimiento' : 'Anotar';
openSheet(title, `<div id="qa"></div>`, sh => {
const box = $('#qa', sh);
const draw = () => {
const cats = sortCats(S.fin.categories.filter(c => t.type === 'income' ? c.type === 'income' : c.type !== 'income'));
const val = evalExpr(expr);
const feels = t.type === 'expense' && A_feels();
if (pane === 'cat' && t.type === 'transfer') pane = 'cuenta';
if (pane === 'animo' && !feels) pane = 'cat';
if (pane === 'split' && (t.type !== 'expense' || existing)) pane = 'cat';
const splitPane = () => { const n = t.split.n, v = evalExpr(expr) || 0, share = Math.round(v / n * 100) / 100; return `<div class="qa-split"><div class="row between" style="gap:10px"><span>¿Entre cuántas personas?<small class="faint" style="display:block">Contándote a ti</small></span><span class="stepper"><button data-spn="-1" aria-label="Menos">−</button><b class="num">${n}</b><button data-spn="1" aria-label="Más">+</button></span></div>
${n > 1 ? `<div class="qa-spnames">${Array.from({ length: n - 1 }, (_, i) => `<input class="in" data-spname="${i}" placeholder="¿Quién? (persona ${i + 2})" value="${esc(t.split.names[i] || '')}" autocomplete="off">`).join('')}</div>
<div class="qa-sptot">${v ? `A cada una le toca <b>${money(share)}</b>. Tú gastas <b>${money(Math.round((v - share * (n - 1)) * 100) / 100)}</b> y te deben <b>${money(share * (n - 1))}</b>, lo verás en Me deben.` : 'Escribe el monto y te digo cuánto le toca a cada una.'}</div>` : '<div class="faint">Si pagaste por varias personas, súbele aquí y te anoto lo que te debe cada una.</div>'}</div>`; };
const catName = t.type === 'transfer' ? 'Transferencia' : ((cat(t.cat) || {}).name || 'Categoría');
const acName = (acct(t.acct) || {}).name || 'Cuenta';
const dayName = t.date === today() ? 'Hoy' : t.date === ymd(addDays(new Date(), -1)) ? 'Ayer' : fmtDate(t.date);
box.innerHTML = `
<div class="qa-wrap">
<div class="seg qa-tabs"><button data-ty="expense" aria-pressed="${t.type === 'expense'}">Gasto</button><button data-ty="income" aria-pressed="${t.type === 'income'}">Ingreso</button><button data-ty="transfer" aria-pressed="${t.type === 'transfer'}">Transferencia</button></div>
<div class="qa-amt"><div style="min-width:0"><div class="expr">${/[+\-×÷]/.test(expr.slice(1)) ? esc(expr) : (t.type === 'transfer' ? 'Monto a mover' : 'Monto')}</div><div class="val num ${t.type === 'income' ? 'pos' : ''}">${money(val)}</div></div><span>${t.type === 'transfer' ? px('ui_transfer', 34) : iconHTML((cat(t.cat) || {}).icon || 's:moneda', 34)}</span>${!existing ? `<button class="qa-mic qa-shot" data-shot aria-label="Anotar desde una captura" title="Sube la captura de una transferencia o recibo">${px('pic', 28)}<small>Captura</small></button><input type="file" accept="image/*" id="qaShot" hidden>` : ''}${SR && !existing ? `<button class="qa-mic" data-mic aria-label="Anotar con la voz" title="Dime qué gastaste">${px('mic', 30)}<small>Voz</small></button>` : ''}</div>
<input class="in qa-note" id="qaNote" placeholder="${t.type === 'income' ? 'Nota: sueldo, venta…' : 'Nota: café, uber, super…'}" value="${esc(t.note)}" autocomplete="off">
<div class="qa-panes" role="tablist">
${t.type !== 'transfer' ? `<button role="tab" data-pane="cat" aria-selected="${pane === 'cat'}"><small>Categoría</small><b>${esc(catName)}</b></button>` : ''}
<button role="tab" data-pane="cuenta" aria-selected="${pane === 'cuenta'}"><small>${t.type === 'transfer' ? 'Cuentas' : 'Cuenta y día'}</small><b>${t.type === 'transfer' ? esc(acName) + ' → ' + esc((acct(t.to) || {}).name || '¿?') : esc(acName) + ' · ' + esc(dayName)}</b></button>
${t.type === 'expense' && !existing ? `<button role="tab" data-pane="split" aria-selected="${pane === 'split'}"><small>Dividir</small><b>${t.split.n > 1 ? 'Entre ' + t.split.n : 'Solo yo'}</b></button>` : ''}
${feels ? `<button role="tab" data-pane="animo" aria-selected="${pane === 'animo'}"><small>Ánimo</small><b>${t.feel && feels[t.feel] ? feels[t.feel].e : '—'}</b></button>` : ''}
</div>
<div class="qa-pane">
${pane === 'cat' ? `<div class="catgrid qa-cats">${cats.map(c => `<button data-cat="${c.id}" aria-pressed="${t.cat === c.id}"><span class="ci" style="background:${tintOf(c.id)}">${iconHTML(c.icon, 28)}</span><span class="t">${esc(c.name)}</span></button>`).join('')}<button data-act-in="newcat"><span class="ci">＋</span><span class="t">Nueva</span></button><button data-act-in="catorder"><span class="ci">${px('list', 28)}</span><span class="t">Editar</span></button></div>`
  : pane === 'cuenta' ? (t.type === 'transfer' ? `<div class="formgrid"><label class="f">Desde<select class="in" id="qaFrom">${S.fin.accounts.map(a => `<option value="${a.id}" ${t.acct === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label><label class="f">Hacia<select class="in" id="qaTo"><option value="">Elige…</option>${S.fin.accounts.map(a => `<option value="${a.id}" ${t.to === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label></div><div class="row" style="gap:6px;margin-top:8px"><button class="chip" data-day="0" aria-pressed="${t.date === today()}">Hoy</button><button class="chip" data-day="-1" aria-pressed="${t.date === ymd(addDays(new Date(), -1))}">Ayer</button><input type="date" class="in" id="qaDate" value="${t.date}" style="flex:1;min-width:0;padding:6px 10px"></div>`
    : `<div class="qa-accts">${S.fin.accounts.filter(a => !a.archived).map(a => `<button class="chip" data-acpick="${a.id}" aria-pressed="${t.acct === a.id}">${iconHTML(a.icon || 's:monedero', 18)} ${esc(a.name)}</button>`).join('')}</div><div class="row" style="gap:6px;margin-top:8px"><button class="chip" data-day="0" aria-pressed="${t.date === today()}">Hoy</button><button class="chip" data-day="-1" aria-pressed="${t.date === ymd(addDays(new Date(), -1))}">Ayer</button><input type="date" class="in" id="qaDate" value="${t.date}" style="flex:1;min-width:0;padding:6px 10px"></div>`)
  : pane === 'split' ? splitPane()
  : `<div class="feelrow qa-feels">${Object.entries(feels).map(([k, f]) => `<button type="button" data-feel="${k}" aria-pressed="${t.feel === k}" aria-label="${f.n}" title="${f.n}">${f.e}<small>${f.n}</small></button>`).join('')}</div>`}
</div>
<div class="keypad qa-keys">
${['7', '8', '9', '⌫', '4', '5', '6', '+', '1', '2', '3', '−', '.', '0', '×', '÷'].map(k => `<button data-k="${k}" class="${/[⌫+−×÷]/.test(k) ? 'op' : ''}">${k}</button>`).join('')}
</div>
<div class="row">${existing ? '<button class="btn danger" data-del>Borrar</button>' : ''}<button class="btn pink qa-save" style="flex:1;justify-content:center;padding:13px" data-save>${existing ? 'Guardar cambios' : 'Guardar'} ✦</button></div>
</div>`;
const note = $('#qaNote', box);
note.oninput = () => {
t.note = note.value;
if (!manualCat && t.type !== 'transfer') { const g = guessCat(note.value); if (g && g !== t.cat) { t.cat = g; refreshCats(); } }
if (!expr) { const m = note.value.match(/(\d+(?:[.,]\d{1,2})?)/); if (m) { $('.val', box).textContent = money(parseFloat(m[1].replace(',', '.'))); } }
};
const refreshCats = () => { $$('[data-cat]', box).forEach(b => b.setAttribute('aria-pressed', b.dataset.cat === t.cat)); const ic = $('.qa-amt > span', box); if (ic) ic.innerHTML = iconHTML((cat(t.cat) || {}).icon || 's:moneda', 34); const pb = $('[data-pane="cat"] b', box); if (pb) pb.textContent = (cat(t.cat) || {}).name || 'Categoría'; };
const qs = $('#qaShot', box); if (qs) qs.onchange = async () => { const file = qs.files && qs.files[0]; if (!file) return; const ex = $('.expr', box); if (ex) ex.textContent = 'Leyendo tu captura…'; try { const txt = await window.App.ocrImage(file); const r = parseReceipt(txt); if (!r.amount && !r.note) { toast('No encontré un monto en la imagen'); draw(); return; } applyParsed(r); toast('Leí tu captura. Revisa y toca Guardar'); } catch (er) { toast(navigator.onLine ? 'No pude leer la imagen' : 'Para leer capturas necesitas internet'); draw(); } };
$$('[data-spname]', box).forEach(i => i.oninput = () => { t.split.names[+i.dataset.spname] = i.value; });
const qd = $('#qaDate', box); if (qd) qd.onchange = e => { t.date = e.target.value || today(); draw(); };
const ac = $('#qaAcct', box); if (ac) ac.onchange = e => { t.acct = e.target.value; };
const fr = $('#qaFrom', box); if (fr) fr.onchange = e => { t.acct = e.target.value; };
const to = $('#qaTo', box); if (to) to.onchange = e => { t.to = e.target.value; };
};
const listen = () => {
if (rec) { try { rec.stop(); } catch (er) {} return; }
rec = new SR(); rec.lang = 'es-EC'; rec.interimResults = true; rec.maxAlternatives = 1;
let said = '';
const mic = $('[data-mic]', box); if (mic) mic.classList.add('on'); const ex = $('.expr', box); if (ex) ex.textContent = 'Te escucho… di algo como "gasté 3,50 en café"';
rec.onresult = ev => { said = Array.from(ev.results).map(x => x[0].transcript).join(' '); const e2 = $('.expr', box); if (e2) e2.textContent = '“' + said + '”'; };
rec.onerror = ev => { if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') toast('Dale permiso al micrófono para anotar con la voz'); else if (ev.error === 'network') toast('Para la voz necesitas internet'); else if (ev.error !== 'no-speech' && ev.error !== 'aborted') toast('No te escuché bien, intenta otra vez'); };
rec.onend = () => { rec = null; const m2 = $('[data-mic]', box); if (m2) m2.classList.remove('on'); if (!said.trim()) { draw(); return; } applyParsed(parseMoneyText(said, { voice: true })); toast('Escuché: “' + said.trim() + '”. Revisa y toca Guardar'); };
try { rec.start(); } catch (er) { rec = null; toast('No se pudo usar el micrófono'); }
};
const applyParsed = r => {
if (r.type) t.type = r.type;
if (r.amount) expr = String(r.amount);
if (r.acct) t.acct = r.acct;
if (r.date) t.date = r.date;
if (r.note) t.note = r.note;
if (r.split > 1 && t.type === 'expense') { t.split.n = Math.min(20, r.split); pane = 'split'; }
const c = r.cat && cat(r.cat); if (c && (t.type === 'income') === (c.type === 'income')) { t.cat = r.cat; manualCat = false; }
else if (t.cat && cat(t.cat) && (t.type === 'income') !== (cat(t.cat).type === 'income')) t.cat = null;
draw();
};
box.addEventListener('click', e => {
const b = e.target.closest('button'); if (!b) return;
if (b.dataset.pane) { pane = b.dataset.pane; draw(); return; }
if (b.dataset.spn) { t.split.n = Math.max(1, Math.min(20, t.split.n + +b.dataset.spn)); draw(); return; }
if (b.hasAttribute('data-mic')) { listen(); return; }
if (b.hasAttribute('data-shot')) { const f = $('#qaShot', box); if (f) f.click(); return; }
if (b.dataset.acpick) { t.acct = b.dataset.acpick; draw(); return; }
if (b.dataset.ty) { t.type = b.dataset.ty; if (t.type === 'income' && cat(t.cat) && cat(t.cat).type !== 'income') t.cat = null; if (t.type === 'expense' && cat(t.cat) && cat(t.cat).type === 'income') t.cat = null; draw(); return; }
if (b.dataset.cat) { t.cat = b.dataset.cat; manualCat = true; draw(); return; }
if (b.dataset.feel) { t.feel = t.feel === b.dataset.feel ? null : b.dataset.feel; $$('[data-feel]', box).forEach(x => x.setAttribute('aria-pressed', x.dataset.feel === t.feel)); return; }
if (b.dataset.day != null) { t.date = ymd(addDays(new Date(), +b.dataset.day)); draw(); return; }
if (b.dataset.k) {
const k = b.dataset.k;
if (k === '⌫') expr = expr.slice(0, -1);
else if ('+−×÷'.includes(k)) { if (!expr) return; if (/[+\-×÷]$/.test(expr)) expr = expr.slice(0, -1); expr += k === '−' ? '-' : k; }
else if (k === '.') { const lastNum = expr.split(/[+\-×÷]/).pop(); if (!lastNum.includes('.')) expr += lastNum ? '.' : '0.'; }
else { const lastNum = expr.split(/[+\-×÷]/).pop(); if (lastNum.includes('.') && lastNum.split('.')[1].length >= 2) return; expr += k; }
const v = evalExpr(expr); $('.val', box).textContent = money(v); $('.expr', box).textContent = /[+\-×÷]/.test(expr.slice(1)) ? expr.replace(/-/g, '−') : (t.type === 'transfer' ? 'Monto a mover' : 'Monto');
return;
}
if (b.dataset.actIn === 'newcat' || b.dataset.actIn === 'catorder') { const keep = { type: t.type, acct: t.acct, to: t.to, date: t.date, note: t.note, feel: t.feel, cat: t.cat, split: t.split.n, amount: evalExpr(expr) || undefined }; closeSheet(); const back = c => quickAdd(null, Object.assign(keep, c && c.id ? { cat: c.id } : {})); if (b.dataset.actIn === 'newcat') editCategory(null, t.type === 'income' ? 'income' : 'expense', back); else orderCats(t.type === 'income' ? 'income' : 'expense', back); return; }
if (b.hasAttribute('data-del')) {
if (b.dataset.sure) { deleteTx(existing.id); closeSheet(); toast('Movimiento borrado'); render(); }
else { b.dataset.sure = '1'; b.textContent = '¿Seguro? Toca otra vez'; }
return;
}
if (b.hasAttribute('data-save')) {
let amount = evalExpr(expr);
if (!amount) { const m = (t.note || '').match(/(\d+(?:[.,]\d{1,2})?)/); if (m) amount = parseFloat(m[1].replace(',', '.')); }
if (!amount || amount <= 0) return toast('Escribe un monto mayor a cero');
if (t.type === 'transfer') { if (!t.to || t.to === t.acct) return toast('Elige una cuenta de destino distinta'); t.cat = null; }
else if (!t.cat) { t.cat = guessCat(t.note) || (S.fin.categories.find(c => (t.type === 'income') === (c.type === 'income')) || {}).id; }
const rec = { type: t.type, amount, cat: t.cat, acct: t.acct, to: t.type === 'transfer' ? t.to : undefined, date: t.date, feel: t.type === 'expense' ? (t.feel || undefined) : undefined, note: (t.note || '').replace(/\s*\d+(?:[.,]\d{1,2})?\s*$/, '').trim() || t.note };
if (existing) { updateTx(existing.id, rec); toast('Cambios guardados'); }
else if (t.type === 'expense' && t.split.n > 1) {
const n = t.split.n, share = Math.round(amount / n * 100) / 100, mine = Math.round((amount - share * (n - 1)) * 100) / 100;
rec.amount = mine; addTx(rec); S.fin.loans = S.fin.loans || [];
for (let i = 0; i < n - 1; i++) { const who = (t.split.names[i] || '').trim() || 'Persona ' + (i + 2); const l = { id: uid(), dir: 'in', who, amount: share, paid: 0, note: rec.note || ((cat(rec.cat) || {}).name || ''), date: rec.date, acct: rec.acct || null, pays: [] }; if (rec.acct) addTx({ type: 'loan_out', amount: share, acct: rec.acct, date: rec.date, note: 'Préstamo a ' + who, loan: l.id }); S.fin.loans.push(l); }
saveFin(); toast(`Anotado ✦ Te deben ${money(share * (n - 1))} entre ${n - 1} ${n - 1 === 1 ? 'persona' : 'personas'}`);
}
else { addTx(rec); toast(t.type === 'income' ? '¡Ingreso anotado! ✦' : 'Anotado ✦'); }
closeSheet(); render();
}
});
draw();
});
}
function dayDetail(d) {
const l = txOnDay(d);
openSheet(cap(fmtDate(d)), `<div class="list">${l.length ? l.map(txRow).join('') : '<div class="empty">Nada anotado este día.</div>'}</div><div class="row" style="margin-top:12px"><button class="btn pink" data-addday style="flex:1;justify-content:center">Anotar en este día</button></div>`, sh => {
sh.addEventListener('click', e => {
if (e.target.closest('[data-addday]')) { closeSheet(); quickAdd(null, { date: d }); }
const b = e.target.closest('[data-act="edittx"]'); if (b) { closeSheet(); quickAdd(S.tx.find(t => t.id === b.dataset.id)); }
});
});
}
document.addEventListener('click', e => {
const g = e.target.closest('[data-go]'); if (g && !e.target.closest('.sheet')) { go(g.dataset.go); return; }
if (e.target.closest('[data-go-plan]') && !e.target.closest('.sheet')) { go('plan'); return; }
const a = e.target.closest('[data-act]'); if (!a || e.target.closest('.sheet')) return;
const act = a.dataset.act; const fn = ACTIONS[act]; if (fn) fn(a, e);
});
document.addEventListener('click', e => { const f = e.target.closest('[data-f]'); if (f && !e.target.closest('.sheet')) { S.filters[f.dataset.f] = f.dataset.v; render(); } });
const ACTIONS = {
privacy: () => { S.priv = !S.priv; try { localStorage.setItem('bolsillito:priv', S.priv ? '1' : '0'); } catch (e) {} render(); },
quickadd: () => quickAdd(),
edittx: a => { const t = S.tx.find(x => x.id === a.dataset.id); if (t && /^loan_/.test(t.type)) return go('loans'); quickAdd(t); },
banner: a => pickBanner(a.dataset.k),
pageicon: a => pickIcon(pageIcon(a.dataset.k), v => { S.settings.navIcons[a.dataset.k] = v; saveSettings(); renderNav(); render(); }, { title: 'Icono de ' + PAGES[a.dataset.k] }),
assetsToggle: a => { S.settings.assetsInNet = a.dataset.v === '1'; saveSettings(); render(); },
mascot: () => { const b = $('#bubble'); if (b) b.textContent = tip(); },
clearExamples: () => clearExamples(),
mPrev: () => { S.month = addMonths(S.month, -1); render(); },
mNext: () => { S.month = addMonths(S.month, 1); render(); },
mSave: a => { S.monthWithSaving = a.dataset.v === '1'; render(); },
yPrev: () => { S.year = (S.year || new Date().getFullYear()) - 1; render(); },
yNext: () => { S.year = (S.year || new Date().getFullYear()) + 1; render(); },
dayDetail: a => dayDetail(a.dataset.d),
newacct: () => App.editAccount(null),
newasset: () => App.editAsset(null),
editasset: a => App.editAsset(a.dataset.id)
};
function clearExamples() {
const months = S.tx.filter(t => t.example).map(t => ym(t.date));
S.tx = S.tx.filter(t => !t.example); saveTxMonths(months);
S.fin.goals = S.fin.goals.filter(g => !g.example); S.fin.recurring = S.fin.recurring.filter(r => !r.example); S.fin.assets = S.fin.assets.filter(a => !a.example);
S.settings.examples = false; saveFin(); saveSettings(); toast('Ejemplos borrados. ¡Tu librito está listo!'); render();
}
function runRecurring() {
let n = 0; const td = today(); const touched = [];
S.fin.recurring.forEach(r => {
if (!r.active || !r.next) return; let guard = 0;
while (r.next <= td && guard++ < 24) {
const t = { id: uid(), type: r.type, amount: +r.amount, cat: r.cat, acct: r.acct, to: r.to, date: r.next, note: r.name, recurring: r.id };
if (r.example) t.example = true;
S.tx.push(t); touched.push(ym(t.date)); n++;
r.next = nextDate(r.next, r.freq);
}
});
if (n) { S.tx.sort((a, b) => b.date.localeCompare(a.date)); saveTxMonths(touched); saveFin(); }
return n;
}
function nextDate(s, freq) {
const d = parseYmd(s);
if (freq === 'semanal') return ymd(addDays(d, 7));
if (freq === 'quincenal') return ymd(addDays(d, 14));
if (freq === 'anual') return ymd(new Date(d.getFullYear() + 1, d.getMonth(), d.getDate()));
const day = d.getDate(); const n = new Date(d.getFullYear(), d.getMonth() + 1, 1); n.setDate(Math.min(day, new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate())); return ymd(n);
}
function wireStatus() {
const n = $('#statusbar'); let t;
Store.onStatus((s, msg) => {
clearTimeout(t); n.classList.toggle('err', s === 'error');
n.textContent = s === 'saving' ? 'Guardando…' : s === 'saved' ? (Store.mode === 'local' ? 'Guardado en este dispositivo ✓' : 'Guardado ✓') : (msg || 'No se pudo guardar');
n.style.opacity = 1; if (s === 'saved') t = setTimeout(() => n.style.opacity = 0, 1400);
});
}
async function start() {
applyThemeEarly();
await Store.init();
const d = defaults();
S.settings = Object.assign({}, d.settings, Store.get('settings') || {});
S.settings.banners = Object.assign({}, d.settings.banners, (Store.get('settings') || {}).banners || {});
S.settings.navIcons = S.settings.navIcons || {};
S.fin = Store.get('fin') || d.fin;
if ((S.settings.v || 1) < 2) { // move to the Moffy look
const oldDefault = { home: 'noche', tx: 'nubes', month: 'atardecer', year: 'estrellas', goals: 'jardin' };
Object.keys(oldDefault).forEach(k => { const b = S.settings.banners[k]; if (!b || b.preset === oldDefault[k] || !Pix.BANNERS[b.preset]) S.settings.banners[k] = d.settings.banners[k]; });
if (!THEMES[S.settings.theme]) S.settings.theme = 'manzanita';
if (!S.settings.mascot || S.settings.mascot === 's:lunita') S.settings.mascot = 's:pudin';
const gmap = { '#ddd2ff': '#cdeefc', '#c9dcff': '#d3eaa8', '#c4ecd3': '#fff09a', '#ffd3e6': '#ffc4d6', '#ffe8a3': '#ffe0c9' };
S.fin.groups.forEach(g => { if (gmap[g.color]) g.color = gmap[g.color]; }); saveFin();
S.settings.v = 2; saveSettings();
}
if (S.settings.v < 3) { // emojis become pixel icons
const conv = v => (typeof v === 'string' && v.startsWith('e:') && window.EMOJI_TO_ICON && EMOJI_TO_ICON[v.slice(2)]) ? 's:' + EMOJI_TO_ICON[v.slice(2)] : v;
['categories', 'accounts', 'goals', 'assets'].forEach(k => (S.fin[k] || []).forEach(x => { x.icon = conv(x.icon); }));
Object.keys(S.settings.navIcons || {}).forEach(k => { const v = S.settings.navIcons[k]; if (v && v.startsWith('e:')) delete S.settings.navIcons[k]; });
if (!PACKS[S.settings.pack]) S.settings.pack = 'pixel';
S.fin.accounts.forEach(a => { if (a.type === 'banco') { a.type = 'ahorro'; if (a.icon === 's:bag') a.icon = 's:banco'; } if (a.id === 'cochinito' && a.type === 'ahorro') { a.type = 'alcancia'; a.icon = 's:alcancia'; } });
S.settings.v = 3; saveSettings(); saveFin();
}
if (!Store.get('settings')) { // first visit: seed examples
saveSettings(); saveFin(); S.tx = d.tx; saveTxMonths(d.tx.map(t => ym(t.date)));
} else loadTx();
applyTheme();
const n = runRecurring();
$('#nav').hidden = false; renderNav(); render(); wireStatus();
if (n) toast(n === 1 ? 'Se anotó 1 pago fijo de hoy' : `Se anotaron ${n} pagos fijos`);
new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
addEventListener('pagehide', () => Store.flushAll());
document.addEventListener('visibilitychange', () => { if (document.hidden) Store.flushAll(); });
}
function applyThemeEarly() { /* CSS defaults already paint the sky */ }
window.App = {
start, S, $, $$, esc, uid, pad, ymd, parseYmd, addDays, today, ym, MONTHS, MON3, DOW, dowIdx, cap, monthLabel, addMonths, daysIn, isoWeek, weekStart,
money, iconHTML, px, pageIcon, parseMoneyText, parseReceipt, catOrderList, sortCats, orderCats, privBtn, txListBody, render, renderNav, go, toast, openSheet, closeSheet, pickIcon, pickBanner, plusPitch, bannerHTML, header, txRow, txOnDay, spentOf, incomeOf,
cat, acct, group, acctBalance, ACCT_TYPES, WALLET, typeName, walletHTML, netWorth, budgetExpenses, budgetIncome, byCat, txIn, isSaving, isPlus, saveSettings, saveFin, saveTxMonths, applyTheme, nextDate, quickAdd,
THEMES, FONTS, TXC, PACKS, PAGES, EMOJI, SYMBOLS, screens, after, ACTIONS, goalMini, fmtDate, clearExamples, evalExpr, addTx,
editCategory: (...a) => App._editCategory(...a)
};
function editCategory(id, type, done) { return App._editCategory(id, type, done); }
})();
;
(function () {
const A = App, S = A.S, { $, $$, esc, money, iconHTML, openSheet, closeSheet, toast, uid } = A;
const sc = A.screens, after = A.after, ACT = A.ACTIONS;
const rerender = () => { A.render(); };
function avatarHTML(cls) { return S.settings.photo ? `<img class="avatar ${cls}" alt="Tu foto" src="${esc(S.settings.photo)}">` : `<img class="avatar ${cls} pixel" alt="" src="${Pix.sprite('pudin', 5)}" style="object-fit:contain;padding:8px">`; }
A.avatarHTML = avatarHTML;
const MENU = ['rincon', 'logros', 'tienda', 'suscripciones', 'recordatorio', 'year', 'goals', 'recurring', 'projections', 'rules', 'settings', 'appearance', 'plan', 'data'];
sc.more = () => `
${A.header('more')}
<button class="card row" data-go="data" style="gap:14px;text-align:left;width:100%;color:inherit;font:inherit;cursor:pointer">${avatarHTML('')}<div style="min-width:0"><b class="mid" style="display:block">${esc(S.settings.name || 'Tu perfil')}</b><div class="faint">${A.isPlus() ? '<span class="tag gold">Meffy+</span> ' : ''}${S.settings.photo ? 'Toca para editar tu perfil' : 'Toca para poner tu foto y tu nombre'}</div></div></button>
${(() => { const vis = MENU.concat(Store.isOwner ? ['admin'] : []).filter(k => !(S.settings.hidden || []).includes(k) || ['settings', 'appearance', 'plan', 'data', 'admin'].includes(k)); const TINT = { rincon: '#e3f3df', logros: '#fff4c2', tienda: '#efe6fb', suscripciones: '#efe6fb', recordatorio: '#e1effb', year: '#fff4c2', goals: '#e1effb', recurring: '#fde3ea', projections: '#e3f3df', rules: '#dcf3ec', settings: '#ffe8c7', appearance: '#dcf3ec', plan: '#fde3ea', data: '#e1effb', admin: '#f3e4dc' }; const G = [['Tu mascota', ['rincon', 'logros', 'tienda']], ['Tu dinero', ['goals', 'suscripciones', 'recurring', 'year', 'projections', 'rules']], ['Ajustes', ['recordatorio', 'settings', 'appearance', 'plan', 'data', 'admin']]]; const used = new Set(G.flatMap(g => g[1])); const extra = vis.filter(k => !used.has(k)); if (extra.length) G[1][1] = G[1][1].concat(extra); return G.map(([t, ks]) => { const L = ks.filter(k => vis.includes(k)); return L.length ? `<div class="ph"><span class="pill sm">${t}</span></div><div class="menugrid tinted">${L.map(k => `<button data-go="${k}"><span class="ni" style="background:${TINT[k] || '#fde3ea'}">${iconHTML(A.pageIcon(k), 36)}</span>${esc(A.PAGES[k])}</button>`).join('')}</div>` : ''; }).join(''); })()}
`;
sc.goals = () => `
${A.bannerHTML('goals') || ''}
${A.header('goals', '<button class="btn sm" data-act="newgoal">Nueva +</button>')}
${S.fin.goals.length ? S.fin.goals.map(g => {
const p = g.target ? Math.min(1, g.saved / g.target) : 0; const left = Math.max(0, g.target - g.saved);
let eta = ''; if (g.date) { const months = Math.max(1, (A.parseYmd(g.date) - new Date()) / (30.4 * 864e5)); eta = `Para el ${A.fmtDate(g.date)} necesitas ${money(left / months)} al mes.`; }
return `<div class="card stack"><div class="row" style="gap:14px">${jar(p, g.color)}<div style="flex:1;min-width:0"><div class="row between"><b style="font-size:17px">${iconHTML(g.icon, 22)} ${esc(g.name)}</b><button class="btn ghost sm" data-act="editgoal" data-id="${g.id}">Editar</button></div><div class="mid num">${money(g.saved)} <span class="faint">de ${money(g.target)}</span></div><div class="prog" style="margin:6px 0"><i style="width:${p * 100}%"></i></div><div class="faint">${p >= 1 ? '¡Meta cumplida! ✦' : 'Te faltan ' + money(left) + '. ' + eta}</div></div></div><div class="row"><button class="btn pink sm" data-act="contrib" data-id="${g.id}">Agregar dinero</button><button class="btn sm" data-act="withdraw" data-id="${g.id}">Sacar</button></div></div>`;
}).join('') : '<div class="card empty">Crea una meta: un viaje, un fondo de emergencia, algo lindo para ti.</div>'}`;
function jar(p, color) {
const h = Math.round(56 * p);
return `<svg width="64" height="78" viewBox="0 0 64 78" aria-hidden="true"><rect x="16" y="2" width="32" height="10" rx="3" fill="#c98a5a" stroke="#8a4d4f" stroke-width="2"/><rect x="6" y="12" width="52" height="62" rx="14" fill="rgba(255,255,255,.55)" stroke="#8a4d4f" stroke-width="2"/><clipPath id="jc${Math.round(p * 1000)}"><rect x="8" y="14" width="48" height="58" rx="12"/></clipPath><rect x="8" y="${72 - h}" width="48" height="${h}" fill="${color || '#ffd3e6'}" clip-path="url(#jc${Math.round(p * 1000)})"/>${p > .15 ? '<text x="32" y="' + (70 - h / 2) + '" font-size="12" text-anchor="middle">✦</text>' : ''}<rect x="13" y="20" width="5" height="20" rx="2" fill="#fff" opacity=".8"/></svg>`;
}
function editGoal(id) {
const g = id ? S.fin.goals.find(x => x.id === id) : { id: uid(), name: '', icon: 's:star', target: 100, saved: 0, date: '', color: '#ffd3e6' };
const draw = () => openSheet(id ? 'Editar meta' : 'Nueva meta', `<div class="formgrid">
<label class="f full">Nombre<input class="in" id="gN" value="${esc(g.name)}" placeholder="Ej. Viaje a Montañita" autofocus></label>
<label class="f">Meta<input class="in" id="gT" type="number" inputmode="decimal" step="0.01" value="${g.target}"></label>
<label class="f">Ya tengo<input class="in" id="gS" type="number" inputmode="decimal" step="0.01" value="${g.saved}"></label>
<label class="f">Para cuándo<input class="in" id="gD" type="date" value="${g.date || ''}"></label>
<label class="f">Color<input class="in" id="gC" type="color" value="${g.color || '#ffd3e6'}" style="height:44px;padding:4px"></label>
<div class="full row"><button class="btn" id="gI" type="button">${iconHTML(g.icon, 22)} Cambiar icono</button></div>
<div class="full row">${id ? '<button class="btn danger" id="gDel">Borrar</button>' : ''}<button class="btn pink" id="gOk" style="flex:1;justify-content:center">Guardar</button></div></div>`, sh => {
const read = () => Object.assign(g, { name: $('#gN').value.trim(), target: +$('#gT').value || 0, saved: +$('#gS').value || 0, date: $('#gD').value, color: $('#gC').value });
$('#gI', sh).onclick = () => { read(); A.pickIcon(g.icon, v => { g.icon = v; draw(); }); };
$('#gOk', sh).onclick = () => { read(); delete g.example; if (!g.name) return toast('Ponle un nombre a tu meta'); if (!S.fin.goals.includes(g)) S.fin.goals.push(g); A.saveFin(); closeSheet(); rerender(); };
const del = $('#gDel', sh); if (del) del.onclick = () => { if (!del.dataset.s) { del.dataset.s = 1; del.textContent = '¿Seguro?'; return; } S.fin.goals = S.fin.goals.filter(x => x.id !== g.id); A.saveFin(); closeSheet(); rerender(); };
});
draw();
}
function contrib(id, sign) {
const g = S.fin.goals.find(x => x.id === id);
openSheet(sign > 0 ? 'Agregar a “' + g.name + '”' : 'Sacar de “' + g.name + '”', `<div class="stack"><input class="in" id="cA" type="number" inputmode="decimal" step="0.01" placeholder="Monto" autofocus>
${sign > 0 ? `<label class="setrow"><span>Anotarlo también como movimiento de ahorro</span><span class="toggle"><input type="checkbox" id="cT" checked><span></span></span></label><label class="f">Desde la cuenta<select class="in" id="cAc">${S.fin.accounts.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select></label>` : ''}
<button class="btn pink" id="cOk" style="justify-content:center">Listo</button></div>`, sh => {
$('#cOk', sh).onclick = () => {
const v = +$('#cA').value; if (!v || v <= 0) return toast('Escribe un monto');
g.saved = Math.max(0, Math.round((g.saved + sign * v) * 100) / 100); delete g.example;
if (sign > 0 && $('#cT').checked) { const c = S.fin.categories.find(c => c.id === 'metas') || S.fin.categories.find(c => A.isSaving(c)); A.addTx({ type: 'expense', amount: v, cat: c ? c.id : null, acct: $('#cAc').value, date: A.today(), note: 'Para ' + g.name, goal: g.id }); }
A.saveFin(); closeSheet(); toast(g.saved >= g.target ? '¡Cumpliste tu meta! ✦' : 'Guardado ✦'); rerender();
};
});
}
ACT.newgoal = () => editGoal(null); ACT.editgoal = a => editGoal(a.dataset.id); ACT.contrib = a => contrib(a.dataset.id, 1); ACT.withdraw = a => contrib(a.dataset.id, -1);
sc.recurring = () => {
const list = S.fin.recurring.slice().sort((a, b) => (b.active - a.active) || a.next.localeCompare(b.next));
const monthly = r => r.freq === 'semanal' ? r.amount * 52 / 12 : r.freq === 'quincenal' ? r.amount * 26 / 12 : r.freq === 'anual' ? r.amount / 12 : r.amount;
const outM = list.filter(r => r.active && r.type === 'expense').reduce((s, r) => s + monthly(r), 0);
const inM = list.filter(r => r.active && r.type === 'income').reduce((s, r) => s + monthly(r), 0);
return `${A.header('recurring', '<button class="btn sm" data-act="newrec">Nuevo +</button>')}
<div class="grid2"><div class="card"><h3>Pagos fijos al mes</h3><div class="mid num">${money(outM)}</div></div><div class="card"><h3>Ingresos fijos al mes</h3><div class="mid num pos">${money(inM)}</div></div></div>
<p class="faint" style="margin:0">Cuando llega la fecha, La app anota el movimiento sola al abrir la app.</p>
<div class="list">${list.length ? list.map(r => { const c = A.cat(r.cat); return `<button class="li ${r.type === 'income' ? 'income' : 'recurring'}" data-act="editrec" data-id="${r.id}" style="${r.active ? '' : 'opacity:.55'}"><span class="ic">${iconHTML(c ? c.icon : 's:repeat', 28)}</span><span class="tx-main"><b>${esc(r.name)}</b><span>${r.active ? 'Próximo: ' + A.fmtDate(r.next) : 'En pausa'} · ${esc(r.freq)}${r.example ? ' · ejemplo' : ''}</span></span><span class="amt num ${r.type === 'income' ? 'pos' : ''}">${r.type === 'income' ? '+' : '−'}${money(r.amount)}</span></button>`; }).join('') : '<div class="card empty">Agrega tu arriendo, suscripciones o sueldo para no olvidarlos.</div>'}</div>`;
};
function editRec(id) {
const r = id ? S.fin.recurring.find(x => x.id === id) : { id: uid(), name: '', type: 'expense', amount: 0, cat: (S.fin.categories.find(c => c.type !== 'income') || {}).id, acct: (S.fin.accounts[0] || {}).id, freq: 'mensual', next: A.today(), active: true };
const catOpts = type => S.fin.categories.filter(c => type === 'income' ? c.type === 'income' : c.type !== 'income').map(c => `<option value="${c.id}" ${r.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
openSheet(id ? 'Editar pago fijo' : 'Nuevo pago fijo', `<div class="formgrid">
<label class="f full">Nombre<input class="in" id="rN" value="${esc(r.name)}" placeholder="Ej. Netflix, arriendo, sueldo" autofocus></label>
<div class="full seg"><button data-rt="expense" aria-pressed="${r.type === 'expense'}">Gasto</button><button data-rt="income" aria-pressed="${r.type === 'income'}">Ingreso</button></div>
<label class="f">Monto<input class="in" id="rA" type="number" inputmode="decimal" step="0.01" value="${r.amount || ''}"></label>
<label class="f">Cada<select class="in" id="rF">${['semanal', 'quincenal', 'mensual', 'anual'].map(f => `<option ${r.freq === f ? 'selected' : ''}>${f}</option>`).join('')}</select></label>
<label class="f">Próxima fecha<input class="in" id="rD" type="date" value="${r.next}"></label>
<label class="f">Cuenta<select class="in" id="rAc">${S.fin.accounts.map(a => `<option value="${a.id}" ${r.acct === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label>
<label class="f full">Categoría<select class="in" id="rC">${catOpts(r.type)}</select></label>
<label class="full setrow"><span>Activo</span><span class="toggle"><input type="checkbox" id="rOn" ${r.active ? 'checked' : ''}><span></span></span></label>
<div class="full row">${id ? '<button class="btn danger" id="rDel">Borrar</button>' : ''}<button class="btn pink" id="rOk" style="flex:1;justify-content:center">Guardar</button></div></div>`, sh => {
sh.addEventListener('click', e => { const b = e.target.closest('[data-rt]'); if (!b) return; r.type = b.dataset.rt; $$('[data-rt]', sh).forEach(x => x.setAttribute('aria-pressed', x === b)); $('#rC', sh).innerHTML = catOpts(r.type); });
$('#rOk', sh).onclick = () => {
Object.assign(r, { name: $('#rN').value.trim(), amount: +$('#rA').value || 0, freq: $('#rF').value, next: $('#rD').value || A.today(), acct: $('#rAc').value, cat: $('#rC').value, active: $('#rOn').checked }); delete r.example;
if (!r.name || !r.amount) return toast('Completa nombre y monto');
if (!S.fin.recurring.includes(r)) S.fin.recurring.push(r); A.saveFin(); closeSheet(); rerender();
};
const del = $('#rDel', sh); if (del) del.onclick = () => { if (!del.dataset.s) { del.dataset.s = 1; del.textContent = '¿Seguro?'; return; } S.fin.recurring = S.fin.recurring.filter(x => x.id !== r.id); A.saveFin(); closeSheet(); rerender(); };
});
}
ACT.newrec = () => editRec(null); ACT.editrec = a => editRec(a.dataset.id);
sc.rules = () => `${A.header('rules', '<button class="btn sm" data-act="newrule">Nueva +</button>')}
<div class="card"><b>¿Cómo funcionan?</b><p class="muted" style="margin:6px 0 0">Cuando escribes la nota de un movimiento, La app busca estas palabras y elige la categoría por ti. Ej.: si la nota contiene “café”, va a Café.</p></div>
<div class="list">${S.fin.rules.length ? S.fin.rules.map(r => { const c = A.cat(r.cat); return `<button class="li" data-act="editrule" data-id="${r.id}"><span class="ic">${iconHTML(c ? c.icon : 's:crystal', 26)}</span><span class="tx-main"><b>Si la nota ${esc(r.match)} “${esc(r.text)}”</b><span>→ ${esc(c ? c.name : '—')}</span></span></button>`; }).join('') : '<div class="card empty">Sin reglas todavía.</div>'}</div>`;
function editRule(id) {
const r = id ? S.fin.rules.find(x => x.id === id) : { id: uid(), match: 'contiene', text: '', cat: (S.fin.categories[0] || {}).id };
openSheet(id ? 'Editar regla' : 'Nueva regla', `<div class="formgrid">
<label class="f">Si la nota<select class="in" id="uM">${['contiene', 'empieza', 'igual'].map(m => `<option value="${m}" ${r.match === m ? 'selected' : ''}>${m === 'empieza' ? 'empieza con' : m === 'igual' ? 'es igual a' : m}</option>`).join('')}</select></label>
<label class="f">Texto<input class="in" id="uT" value="${esc(r.text)}" placeholder="Ej. farmacia" autofocus></label>
<label class="f full">Usar categoría<select class="in" id="uC">${S.fin.categories.map(c => `<option value="${c.id}" ${r.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
<div class="full row">${id ? '<button class="btn danger" id="uDel">Borrar</button>' : ''}<button class="btn pink" id="uOk" style="flex:1;justify-content:center">Guardar</button></div></div>`, sh => {
$('#uOk', sh).onclick = () => { Object.assign(r, { match: $('#uM').value, text: $('#uT').value.trim(), cat: $('#uC').value }); if (!r.text) return toast('Escribe el texto a buscar'); if (!S.fin.rules.includes(r)) S.fin.rules.push(r); A.saveFin(); closeSheet(); rerender(); };
const del = $('#uDel', sh); if (del) del.onclick = () => { S.fin.rules = S.fin.rules.filter(x => x.id !== r.id); A.saveFin(); closeSheet(); rerender(); };
});
}
ACT.newrule = () => editRule(null); ACT.editrule = a => editRule(a.dataset.id);
sc.projections = () => {
const k = A.ym(A.today()); const last3 = [1, 2, 3].map(i => A.addMonths(k, -i));
const hist = last3.map(m => { const l = A.txIn(m); return A.incomeOf(l) - A.spentOf(l, { withSaving: true }); }).filter((v, i) => A.txIn(last3[i]).length);
const plan = A.budgetIncome() - A.budgetExpenses(true) + A.budgetExpenses(true) - A.budgetExpenses(false); // income minus spending (savings stay yours)
const mode = S.projMode || 'plan';
const monthlyNet = mode === 'plan' ? plan : (hist.length ? hist.reduce((s, v) => s + v, 0) / hist.length : 0);
const base = A.netWorth(false);
const rows = Array.from({ length: 13 }, (_, i) => ({ m: A.addMonths(k, i), v: base + monthlyNet * i }));
const mx = Math.max(...rows.map(r => Math.abs(r.v)), 1);
return `${A.header('projections')}
<div class="card"><b>¿Cómo funciona?</b><p class="muted" style="margin:6px 0 0">Calcula cuánto podrías tener cada mes si sigues tu plan, o si sigues como en los últimos 3 meses.</p></div>
<div class="seg"><button data-act="proj" data-v="plan" aria-pressed="${mode === 'plan'}">Según mi plan</button><button data-act="proj" data-v="hist" aria-pressed="${mode === 'hist'}">Según mis últimos meses</button></div>
<div class="card"><h3>Te queda al mes</h3><div class="mid num ${monthlyNet < 0 ? 'neg' : 'pos'}">${money(monthlyNet, { sign: true })}</div>${mode === 'hist' && !hist.length ? '<div class="faint">Necesitas al menos un mes anterior con movimientos.</div>' : ''}</div>
<div class="card" style="overflow-x:auto"><h3>Patrimonio proyectado</h3><table class="bk"><thead><tr><th>MES</th><th>PATRIMONIO</th><th></th></tr></thead><tbody>${rows.map((r, i) => `<tr><td>${i === 0 ? 'Este mes' : A.cap(A.monthLabel(r.m))}</td><td class="num ${r.v < 0 ? 'neg' : ''}">${money(r.v)}</td><td style="width:40%"><div class="prog"><i style="width:${Math.abs(r.v) / mx * 100}%"></i></div></td></tr>`).join('')}</tbody></table></div>
<div class="card"><h3>Tus metas</h3>${S.fin.goals.length ? S.fin.goals.map(g => { const left = g.target - g.saved; const m = monthlyNet > 0 ? Math.ceil(left / monthlyNet) : null; return `<div class="row between" style="padding:5px 0"><span>${iconHTML(g.icon, 20)} ${esc(g.name)}</span><b>${left <= 0 ? '¡Lista!' : m ? 'en ~' + m + (m === 1 ? ' mes' : ' meses') : '—'}</b></div>`; }).join('') + '<p class="faint">Si pones todo lo que te sobra en cada meta.</p>' : '<div class="empty">Sin metas.</div>'}</div>`;
};
ACT.proj = a => { S.projMode = a.dataset.v; rerender(); };
sc.settings = () => `${A.header('settings')}
<div class="card stack"><h3>General</h3>
<div class="formgrid"><label class="f">Moneda<select class="in" id="stCur">${['USD', 'EUR', 'MXN', 'COP', 'PEN', 'CLP', 'ARS', 'GTQ'].map(c => `<option ${S.settings.currency === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
<label class="f">Cuenta por defecto<select class="in" id="stDef">${S.fin.accounts.map(a => `<option value="${a.id}" ${S.settings.defaultAcct === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label></div>
</div>
<section class="stack"><div class="ph"><span class="pill sm">Billetera</span><button class="btn sm" data-act="newacct">Agregar +</button></div>
${A.walletHTML(a => `<button class="acct" data-act="editacct" data-id="${a.id}" style="width:100%;background:none;border:0;border-bottom:1px dashed var(--glass-line);text-align:left;color:inherit;font:inherit"><span class="ic">${iconHTML(a.icon, 30)}</span><span class="n">${esc(a.name)}<small>${esc(A.typeName(a.type))} · saldo ${money(A.acctBalance(a.id))}</small></span><span class="faint">Editar</span></button>`)}</section>
<section class="stack"><div class="ph"><span class="pill sm">Categorías y presupuesto</span><span class="row" style="gap:6px"><button class="btn sm" data-act="catorder">Ordenar</button><button class="btn sm" data-act="newcat">Agregar +</button></span></div>
${S.fin.groups.map(g => `<div class="card"><div class="row between" style="margin-bottom:6px"><span class="tag" style="background:${g.color};color:#6b3b3f;font-size:13px">${esc(g.name)}</span><button class="btn ghost sm" data-act="editgroup" data-id="${g.id}">Editar grupo</button></div>${A.sortCats(S.fin.categories.filter(c => c.group === g.id)).map(c => `<button class="acct" data-act="editcat" data-id="${c.id}" style="width:100%;background:none;border:0;border-bottom:1px dashed var(--glass-line);text-align:left"><span class="ic">${iconHTML(c.icon, 28)}</span><span class="n">${esc(c.name)}<small>${c.type === 'income' ? 'Ingreso esperado' : 'Presupuesto'} ${money(c.budget || 0)} al mes</small></span><span class="faint">Editar</span></button>`).join('') || '<div class="faint">Sin categorías.</div>'}</div>`).join('')}
<button class="btn" data-act="newgroup" style="align-self:flex-start">Nuevo grupo +</button>
<div class="card row between"><span>Presupuesto de gastos del mes</span><b class="num">${money(A.budgetExpenses(false))}</b></div></section>`;
after.settings = el => {
$('#stCur', el).onchange = e => { S.settings.currency = e.target.value; A.saveSettings(); rerender(); };
$('#stDef', el).onchange = e => { S.settings.defaultAcct = e.target.value; A.saveSettings(); toast('Guardado'); };
};
function editAccount(id) {
const a = id ? A.acct(id) : { id: uid(), name: '', type: 'ahorro', icon: 's:banco', start: 0 };
if (a.type === 'banco') a.type = 'ahorro';
const movOf = () => { let m = 0; for (const t of S.tx) { const v = Number(t.amount) || 0; if (t.type === 'income' && t.acct === a.id) m += v; else if (t.type === 'expense' && t.acct === a.id) m -= v; else if (t.type === 'transfer') { if (t.acct === a.id) m -= v; if (t.to === a.id) m += v; } } return m; }; const curBal = () => Math.round(((Number(a.start) || 0) + movOf()) * 100) / 100;
const defIcon = t => (A.ACCT_TYPES.find(x => x[0] === t) || [, , 's:banco'])[2];
const draw = () => openSheet(id ? 'Editar cuenta' : 'Nueva cuenta', `<div class="formgrid">
<div class="full row" style="gap:12px"><button class="iconbtn" id="aI" type="button" style="width:64px;height:64px" aria-label="Cambiar icono">${iconHTML(a.icon, 44)}</button><span class="faint">Toca el icono para cambiarlo. Puedes subir el logo de tu banco o app.</span></div>
<label class="f full">Nombre<input class="in" id="aN" value="${esc(a.name)}" placeholder="Ej. Banco de ahorros, Peigo, PayPal" autofocus></label>
<label class="f full">Tipo<select class="in" id="aT">${A.ACCT_TYPES.map(([v, l]) => `<option value="${v}" ${a.type === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
<label class="f">Saldo de hoy<input class="in" id="aS" type="number" inputmode="decimal" step="0.01" value="${curBal()}"></label>
<label class="f">Día de pago (deudas)<input class="in" id="aD" type="number" min="1" max="31" value="${a.due || ''}"></label>
<p class="faint full" style="margin:0">Para tarjetas de crédito y préstamos, escribe lo que debes en negativo (ej. −120).</p>
<div class="full row">${id ? '<button class="btn danger" id="aDel">Borrar</button>' : ''}<button class="btn pink" id="aOk" style="flex:1;justify-content:center">Guardar</button></div></div>`, sh => {
const read = () => { a.name = $('#aN').value.trim(); a.type = $('#aT').value; a.start = Math.round(((+$('#aS').value || 0) - movOf()) * 100) / 100; a.due = +$('#aD').value || undefined; a.liability = ['tarjeta', 'prestamo'].includes(a.type); };
$('#aT', sh).onchange = () => { const wasDef = A.ACCT_TYPES.some(x => x[2] === a.icon); read(); if (wasDef) { a.icon = defIcon(a.type); $('#aI', sh).innerHTML = iconHTML(a.icon, 44); } };
$('#aI', sh).onclick = () => { read(); A.pickIcon(a.icon, v => { a.icon = v; draw(); }, { upload: true, title: 'Icono de la cuenta' }); };
$('#aOk', sh).onclick = () => { read(); if (!a.name) return toast('Ponle un nombre'); if (!S.fin.accounts.includes(a)) S.fin.accounts.push(a); A.saveFin(); closeSheet(); rerender(); };
const del = $('#aDel', sh); if (del) del.onclick = () => {
if (S.tx.some(t => t.acct === a.id || t.to === a.id)) return toast('Esta cuenta tiene movimientos. Bórralos o muévelos primero.');
if (S.fin.accounts.length < 2) return toast('Necesitas al menos una cuenta');
S.fin.accounts = S.fin.accounts.filter(x => x.id !== a.id); A.saveFin(); closeSheet(); rerender();
};
});
draw();
}
function editCategory(id, type, done) {
const c = id ? A.cat(id) : { id: uid(), name: '', icon: 's:ramen', group: (S.fin.groups.find(g => type === 'income' ? g.kind === 'income' : g.kind !== 'income') || S.fin.groups[0]).id, budget: 0, type: type || 'expense' };
const draw = () => openSheet(id ? 'Editar categoría' : 'Nueva categoría', `<div class="formgrid">
<label class="f full">Nombre<input class="in" id="cN" value="${esc(c.name)}" placeholder="Ej. Mascotas" autofocus></label>
<div class="full seg"><button data-ct="expense" aria-pressed="${c.type !== 'income'}">Gasto</button><button data-ct="income" aria-pressed="${c.type === 'income'}">Ingreso</button></div>
<label class="f">Grupo<select class="in" id="cG">${S.fin.groups.map(g => `<option value="${g.id}" ${c.group === g.id ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label>
<label class="f">${c.type === 'income' ? 'Espero al mes' : 'Presupuesto al mes'}<input class="in" id="cB" type="number" inputmode="decimal" step="0.01" value="${c.budget || 0}"></label>
<div class="full row"><button class="btn" id="cI" type="button">${iconHTML(c.icon, 22)} Cambiar icono</button></div>
<div class="full row">${id ? '<button class="btn danger" id="cDel">Borrar</button>' : ''}<button class="btn pink" id="cOk" style="flex:1;justify-content:center">Guardar</button></div></div>`, sh => {
const read = () => { c.name = $('#cN').value.trim(); c.group = $('#cG').value; c.budget = +$('#cB').value || 0; };
sh.addEventListener('click', e => { const b = e.target.closest('[data-ct]'); if (!b) return; read(); c.type = b.dataset.ct; draw(); });
$('#cI', sh).onclick = () => { read(); A.pickIcon(c.icon, v => { c.icon = v; draw(); }); };
$('#cOk', sh).onclick = () => { read(); if (!c.name) return toast('Ponle un nombre'); if (!S.fin.categories.includes(c)) { S.fin.categories.push(c); const o = A.catOrderList(); S.settings.catOrder = [c.id].concat(o.filter(x => x !== c.id)); A.saveSettings(); toast('Categoría creada. Sale primero en Anotar'); } A.saveFin(); closeSheet(); if (done) done(c); else rerender(); };
const del = $('#cDel', sh); if (del) del.onclick = () => {
const used = S.tx.filter(t => t.cat === c.id); const others = S.fin.categories.filter(x => x.id !== c.id && (x.type === 'income') === (c.type === 'income'));
const kill = to => { if (to) { used.forEach(t => t.cat = to); A.saveTxMonths(used.map(t => A.ym(t.date))); } S.fin.categories = S.fin.categories.filter(x => x.id !== c.id); S.settings.catOrder = (S.settings.catOrder || []).filter(x => x !== c.id); A.saveSettings(); A.saveFin(); closeSheet(); toast('Categoría borrada'); if (done) done(null); else rerender(); };
if (!used.length) { if (!del.dataset.s) { del.dataset.s = 1; del.textContent = '¿Segura? Toca otra vez'; return; } return kill(null); }
if (!others.length) return toast('Necesitas otra categoría para pasarle sus movimientos');
const box = document.createElement('div'); box.className = 'full card flat stack'; box.style.background = '#fff7d6';
box.innerHTML = `<b>Tiene ${used.length} ${used.length === 1 ? 'movimiento' : 'movimientos'}</b><span class="faint">¿A qué categoría los paso antes de borrarla?</span><select class="in" id="cTo">${A.sortCats(others).map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select><button class="btn danger" id="cKill" style="justify-content:center">Pasarlos y borrar</button>`;
del.closest('.row').before(box); del.remove(); box.querySelector('#cKill').onclick = () => kill(box.querySelector('#cTo').value);
};
});
draw();
}
function editGroup(id) {
const g = id ? A.group(id) : { id: uid(), name: '', color: '#ffd3e6' };
openSheet(id ? 'Editar grupo' : 'Nuevo grupo', `<div class="formgrid">
<label class="f full">Nombre<input class="in" id="grN" value="${esc(g.name)}" autofocus></label>
<label class="f">Color<input class="in" id="grC" type="color" value="${g.color}" style="height:44px;padding:4px"></label>
<label class="setrow"><span>Cuenta como ahorro</span><span class="toggle"><input type="checkbox" id="grS" ${g.saving ? 'checked' : ''}><span></span></span></label>
<div class="full row">${id ? '<button class="btn danger" id="grDel">Borrar</button>' : ''}<button class="btn pink" id="grOk" style="flex:1;justify-content:center">Guardar</button></div></div>`, sh => {
$('#grOk', sh).onclick = () => { g.name = $('#grN').value.trim(); g.color = $('#grC').value; g.saving = $('#grS').checked; if (!g.name) return toast('Ponle un nombre'); if (!S.fin.groups.includes(g)) S.fin.groups.push(g); A.saveFin(); closeSheet(); rerender(); };
const del = $('#grDel', sh); if (del) del.onclick = () => { if (S.fin.categories.some(c => c.group === g.id)) return toast('Mueve sus categorías a otro grupo primero'); S.fin.groups = S.fin.groups.filter(x => x.id !== g.id); A.saveFin(); closeSheet(); rerender(); };
});
}
function editAsset(id) {
const a = id ? S.fin.assets.find(x => x.id === id) : { id: uid(), name: '', value: 0, icon: 's:diamante' };
const draw = () => openSheet(id ? 'Editar activo' : 'Nuevo activo', `<div class="formgrid">
<label class="f full">Nombre<input class="in" id="xN" value="${esc(a.name)}" placeholder="Ej. Laptop, moto" autofocus></label>
<label class="f">Valor estimado<input class="in" id="xV" type="number" inputmode="decimal" step="0.01" value="${a.value}"></label>
<div class="f" style="justify-content:flex-end"><button class="btn" id="xI" type="button">${iconHTML(a.icon, 22)} Icono</button></div>
<div class="full row">${id ? '<button class="btn danger" id="xDel">Borrar</button>' : ''}<button class="btn pink" id="xOk" style="flex:1;justify-content:center">Guardar</button></div></div>`, sh => {
const read = () => { a.name = $('#xN').value.trim(); a.value = +$('#xV').value || 0; };
$('#xI', sh).onclick = () => { read(); A.pickIcon(a.icon, v => { a.icon = v; draw(); }); };
$('#xOk', sh).onclick = () => { read(); delete a.example; if (!a.name) return toast('Ponle un nombre'); if (!S.fin.assets.includes(a)) S.fin.assets.push(a); A.saveFin(); closeSheet(); rerender(); };
const del = $('#xDel', sh); if (del) del.onclick = () => { S.fin.assets = S.fin.assets.filter(x => x.id !== a.id); A.saveFin(); closeSheet(); rerender(); };
});
draw();
}
A._editCategory = editCategory; A.editAccount = editAccount; A.editAsset = editAsset;
ACT.editacct = a => editAccount(a.dataset.id); ACT.newcat = () => editCategory(null, 'expense'); ACT.catorder = () => A.orderCats('expense'); ACT.editcat = a => editCategory(a.dataset.id);
ACT.editgroup = a => editGroup(a.dataset.id); ACT.newgroup = () => editGroup(null);
const lock = free => (free || A.isPlus()) ? '' : '<span class="lock">Meffy+</span>';
sc.appearance = () => {
const st = S.settings;
return `${A.header('appearance')}
<div class="card"><h3>Tema de colores</h3><div class="themegrid">${Object.entries(A.THEMES).map(([id, t]) => `<button data-act="theme" data-v="${id}" aria-pressed="${st.theme === id}"><div class="prev" style="background:linear-gradient(135deg,${t.sky.join(',')})"></div><span class="lbl">${esc(t.name)}</span>${lock(t.free)}</button>`).join('')}</div></div>
<div class="card"><h3>Modo noche</h3><div class="seg"><button data-act="night" data-v="auto" aria-pressed="${st.night === 'auto'}">Automático</button><button data-act="night" data-v="off" aria-pressed="${st.night === 'off'}">Día</button><button data-act="night" data-v="on" aria-pressed="${st.night === 'on'}">Noche</button></div></div>
<div class="card"><h3>Letra</h3><div class="chips">${Object.entries(A.FONTS).map(([n, f]) => `<button class="chip" data-act="font" data-v="${esc(n)}" aria-pressed="${st.font === n}" style="font-family:${f.css};font-size:15px">${esc(n)} ${f.free || A.isPlus() ? '' : A.px('diamante', 14)}</button>`).join('')}</div><p style="font-family:var(--f-body);margin:10px 0 0" class="muted">Café con pan de yuca −$3,25 ✦</p></div>
<div class="card"><h3>Pack de iconos</h3><div class="stack">${Object.entries(A.PACKS).map(([id, p]) => `<button class="li" data-act="pack" data-v="${id}" style="${st.pack === id ? 'outline:2.5px solid var(--navy)' : ''}"><span class="tx-main"><b>${esc(p.name)} ${p.free || A.isPlus() ? '' : '<span class="tag gold">Meffy+</span>'}</b></span><span class="row" style="gap:4px">${['home', 'tx', 'month', 'journal', 'more'].map(k => iconHTML(p.map[k], 26)).join('')}</span></button>`).join('')}</div>
<p class="faint">También puedes tocar el icono al lado del título de cada página para cambiarlo uno por uno.</p>
<div class="row" style="flex-wrap:wrap">${['home', 'tx', 'add', 'month', 'journal', 'more'].map(k => `<button class="btn sm" data-act="pageicon" data-k="${k}">${iconHTML(A.pageIcon(k), 20)} ${esc(k === 'add' ? 'Botón anotar' : A.PAGES[k])}</button>`).join('')}${Object.keys(st.navIcons || {}).length ? '<button class="btn ghost sm" data-act="resetIcons">Volver al pack</button>' : ''}</div></div>
<div class="card"><h3>Banners</h3><div class="stack">${['home', 'wallet', 'month', 'year', 'goals'].map(k => { const b = st.banners[k] || {}; return `<button class="li" data-act="banner" data-k="${k}"><span class="tx-main"><b>${esc(A.PAGES[k])}</b><span>${b.hidden ? 'Oculto' : b.img ? 'Imagen propia' : esc((Pix.BANNERS[b.preset] || {}).name || '—')}</span></span>${b.hidden ? '' : `<img alt="" class="${b.img ? '' : 'pixel'}" src="${b.img ? esc(b.img) : Pix.banner(b.preset || 'noche')}" style="width:96px;height:37px;object-fit:cover;border-radius:8px">`}</button>`; }).join('')}</div></div>
<div class="card"><h3>Mascota</h3>
<div class="setrow"><span>Mostrar a Ale en Inicio</span><span class="toggle"><input type="checkbox" id="mOn" ${st.mascotOn ? 'checked' : ''}><span></span></span></div>
<div class="row" style="flex-wrap:wrap;margin-top:8px"><button class="btn sm" data-act="mascotPick">${iconHTML(st.mascot, 24)} Cambiar mascota</button><button class="btn sm" data-act="donutPick">Centro de la dona ${A.isPlus() ? '' : '<span class="tag gold">Meffy+</span>'}</button></div></div>
<div class="card"><h3>Colores de los movimientos</h3>${['expense', 'income', 'transfer', 'recurring'].map(k => `<div class="setrow"><span>${{ expense: 'Gasto', income: 'Ingreso', transfer: 'Transferencia', recurring: 'Pago fijo' }[k]}</span><div class="swatches">${Object.entries(A.TXC).map(([n, c]) => `<button class="sw" title="${n}" data-act="txc" data-k="${k}" data-v="${n}" aria-pressed="${(st.txColors || {})[k] === n}" style="background:${c[S.night ? 1 : 0]}"></button>`).join('')}</div></div>`).join('')}</div>
<div class="card"><h3>Detalles</h3>
<div class="setrow"><span>Estrellitas en el cielo</span><span class="toggle"><input type="checkbox" id="spOn" ${st.sparkle !== false ? 'checked' : ''}><span></span></span></div>
${['year', 'goals', 'recurring', 'projections', 'rules'].map(k => `<div class="setrow"><span>Mostrar “${esc(A.PAGES[k])}” en Más</span><span class="toggle"><input type="checkbox" data-hide="${k}" ${(st.hidden || []).includes(k) ? '' : 'checked'}><span></span></span></div>`).join('')}
</div>`;
};
after.appearance = el => {
$('#mOn', el).onchange = e => { S.settings.mascotOn = e.target.checked; A.saveSettings(); };
$('#spOn', el).onchange = e => { S.settings.sparkle = e.target.checked; A.saveSettings(); A.applyTheme(); };
$$('[data-hide]', el).forEach(i => i.onchange = () => { const k = i.dataset.hide; S.settings.hidden = (S.settings.hidden || []).filter(x => x !== k); if (!i.checked) S.settings.hidden.push(k); A.saveSettings(); });
};
function needPlus(free) { if (free || A.isPlus()) return false; openSheet('Esto es de Meffy+', A.plusPitch('Este detalle es parte de Meffy+.'), sh => sh.addEventListener('click', e => { if (e.target.closest('[data-go-plan]')) { closeSheet(); A.go('plan'); } })); return true; }
ACT.theme = a => { const t = A.THEMES[a.dataset.v]; if (needPlus(t.free)) return; S.settings.theme = a.dataset.v; A.saveSettings(); A.applyTheme(); rerender(); };
ACT.night = a => { S.settings.night = a.dataset.v; A.saveSettings(); A.applyTheme(); rerender(); };
ACT.font = a => { if (needPlus(A.FONTS[a.dataset.v].free)) return; S.settings.font = a.dataset.v; A.saveSettings(); A.applyTheme(); rerender(); };
ACT.pack = a => { if (needPlus(A.PACKS[a.dataset.v].free)) return; S.settings.pack = a.dataset.v; A.saveSettings(); A.renderNav(); rerender(); };
ACT.resetIcons = () => { S.settings.navIcons = {}; A.saveSettings(); A.renderNav(); rerender(); };
ACT.txc = a => { S.settings.txColors[a.dataset.k] = a.dataset.v; A.saveSettings(); A.applyTheme(); rerender(); };
ACT.mascotPick = () => A.pickIcon(S.settings.mascot, v => { S.settings.mascot = v; A.saveSettings(); rerender(); }, { title: 'Tu mascota' });
ACT.donutPick = () => { if (needPlus(false)) return; A.pickIcon(S.settings.donutCenter || 's:pudin', v => { S.settings.donutCenter = v.startsWith('i:') ? v : null; if (!v.startsWith('i:')) toast('Para el centro de la dona sube una imagen propia'); A.saveSettings(); rerender(); }, { title: 'Centro de la dona' }); };
sc.data = () => `${A.header('data')}
<div class="card stack" style="align-items:center;text-align:center">
${avatarHTML('big')}
<div class="row" style="flex-wrap:wrap;justify-content:center"><label class="btn pink sm" for="pfFile" style="cursor:pointer">${S.settings.photo ? 'Cambiar foto' : 'Poner mi foto'}</label>${S.settings.photo ? '<button class="btn sm" data-act="photoOff">Quitar foto</button>' : ''}</div>
<input type="file" id="pfFile" accept="image/*" hidden>
<label class="f" style="width:100%;text-align:left">Tu nombre<input class="in" id="pfName" value="${esc(S.settings.name)}" placeholder="¿Cómo te llamamos?"></label>
${A.isPlus() ? '<span class="tag gold">Tienes Meffy+ ✦</span>' : '<button class="btn sm" data-go="plan">Conoce Meffy+</button>'}
</div>
${Store.mode === 'supa' ? `<div class="card stack"><h3>Tu cuenta</h3><div class="row between"><span>Número</span><b>${esc(Store.profile && Store.profile.phone && Store.profile.phone.startsWith('593') ? '0' + Store.profile.phone.slice(3) : (Store.profile || {}).phone || '')}</b></div>
<label class="f">Nueva contraseña<input class="in" id="pfPw" type="password" autocomplete="new-password" placeholder="Mínimo 6 caracteres"></label><button class="btn sm" data-act="pwChange" style="align-self:flex-start">Cambiar contraseña</button>
<button class="btn danger" data-act="logout">Cerrar sesión</button></div>` : ''}
<div class="card stack"><h3>Exportar</h3><p class="muted" style="margin:0">Descarga tus movimientos para Excel, o una copia completa para guardar.</p>
<div class="row" style="flex-wrap:wrap"><button class="btn" data-act="expCsv">Movimientos (.csv)</button><button class="btn" data-act="expJson">Copia completa (.json)</button></div><div id="expMsg" class="faint"></div></div>
<div class="card stack"><h3>Importar</h3><p class="muted" style="margin:0">Sube una copia .json que hayas exportado aquí, o un .csv con columnas fecha, tipo, monto, categoría, cuenta, nota.</p>
<input type="file" class="in" id="impFile" accept=".json,.csv,application/json,text/csv"></div>
<div class="card stack"><h3>Dónde se guarda</h3><p class="muted" style="margin:0">${Store.mode === 'supa' ? 'En tu cuenta de Meffy, privado para ti. Puedes entrar desde cualquier teléfono o computadora con tu número y contraseña.' : Store.mode === 'cloud' ? 'En tu cuenta de Claude, privado para ti. Las imágenes que subes se guardan con la app.' : 'En este navegador. Si borras los datos del navegador se pierden, así que exporta copias.'}</p></div>
<div class="card stack"><h3>Empezar de cero</h3>${S.tx.some(t => t.example) ? '<button class="btn" data-act="clearExamples">Borrar solo los ejemplos</button>' : ''}<button class="btn danger" data-act="wipe">Borrar todos mis movimientos</button></div>`;
function csvCell(v) { v = v == null ? '' : String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
async function save(name, data) {
const msg = $('#expMsg');
try { await Store.download(name, data); if (msg) msg.textContent = 'Listo ✓'; }
catch (e) {
if (e && e.code === 'declined') return;
openSheet('Copia tus datos', `<p class="muted">Tu navegador no permite descargar desde aquí. Copia este texto y pégalo en un archivo llamado <b>${esc(name)}</b>.</p><textarea class="in" style="min-height:240px;font-family:var(--f-mono);font-size:12px" readonly>${esc(data)}</textarea><button class="btn pink" id="cpy" style="margin-top:10px">Copiar</button>`, sh => { $('#cpy', sh).onclick = async () => { const ta = $('textarea', sh); try { await navigator.clipboard.writeText(ta.value); toast('Copiado'); } catch (er) { ta.select(); toast('Selecciona y copia'); } }; });
}
}
ACT.expCsv = () => {
const head = ['fecha', 'tipo', 'monto', 'categoria', 'cuenta', 'hacia', 'nota'];
const tipo = { expense: 'gasto', income: 'ingreso', transfer: 'transferencia' };
const lines = [head.join(',')].concat(S.tx.map(t => [t.date, tipo[t.type], t.amount.toFixed(2), (A.cat(t.cat) || {}).name || '', (A.acct(t.acct) || {}).name || '', (A.acct(t.to) || {}).name || '', t.note || ''].map(csvCell).join(',')));
save('moffy-movimientos-' + A.today() + '.csv', '﻿' + lines.join('\n'));
};
ACT.expJson = () => {
const journal = {}; Store.ids('jr-').forEach(id => journal[id] = Store.get(id));
save('moffy-copia-' + A.today() + '.json', JSON.stringify({ app: 'moffy', v: 1, settings: S.settings, fin: S.fin, tx: S.tx, journal }, null, 1));
};
ACT.wipe = a => { if (!a.dataset.s) { a.dataset.s = 1; a.textContent = '¿Segura? Toca otra vez para borrar todo'; return; } const ms = S.tx.map(t => A.ym(t.date)); S.tx.length = 0; A.saveTxMonths(ms); toast('Movimientos borrados'); rerender(); };
ACT.logout = () => Store.signOut();
ACT.pwChange = async () => { const v = ($('#pfPw') || {}).value || ''; if (v.length < 6) return toast('Mínimo 6 caracteres'); try { await Store.changePassword(v); $('#pfPw').value = ''; toast('Contraseña cambiada ✦'); } catch (e) { toast('No se pudo cambiar. Intenta otra vez.'); } };
ACT.photoOff = () => { S.settings.photo = null; A.saveSettings(); rerender(); };
after.data = el => {
$('#pfName', el).onchange = e => { S.settings.name = e.target.value.trim(); A.saveSettings(); if (Store.mode === 'supa') Store.sb.from('profiles').update({ name: S.settings.name }).eq('id', Store.uid).then(() => {}); toast('Guardado'); };
$('#pfFile', el).onchange = async e => { const f = e.target.files[0]; if (!f) return; toast('Subiendo tu foto…'); try { const r = await Store.saveImage(f, 400); S.settings.photo = r.src; A.saveSettings(); rerender(); } catch (er) { toast('No pude abrir esa imagen'); } };
$('#impFile', el).onchange = async e => {
const f = e.target.files[0]; if (!f) return; const text = await f.text();
try {
if (f.name.endsWith('.json')) {
const d = JSON.parse(text); if (d.app !== 'moffy' && d.app !== 'lunabelle') throw new Error('No es una copia de esta app');
const months = S.tx.map(t => A.ym(t.date));
Object.assign(S.settings, d.settings); S.fin = A.S.fin = d.fin; S.tx.length = 0; d.tx.forEach(t => S.tx.push(t));
A.saveSettings(); A.saveFin(); A.saveTxMonths(months.concat(S.tx.map(t => A.ym(t.date))));
Object.entries(d.journal || {}).forEach(([id, doc]) => Store.put(id, doc));
A.applyTheme(); A.renderNav(); toast('Copia restaurada ✦'); rerender();
} else {
const rows = parseCSV(text); const h = rows.shift().map(x => x.trim().toLowerCase());
const ix = n => h.findIndex(x => x.startsWith(n)); let n = 0; const ms = [];
rows.forEach(r => {
const amt = parseFloat((r[ix('monto')] || '').replace(/[^\d.,-]/g, '').replace(',', '.')); if (!amt) return;
const tp = (r[ix('tipo')] || '').toLowerCase(); const type = tp.startsWith('ing') ? 'income' : tp.startsWith('tra') ? 'transfer' : (amt > 0 && ix('tipo') < 0 ? 'income' : 'expense');
const cName = (r[ix('categ')] || '').toLowerCase(); const aName = (r[ix('cuenta')] || '').toLowerCase();
const c = S.fin.categories.find(c => c.name.toLowerCase() === cName); const ac = S.fin.accounts.find(a => a.name.toLowerCase() === aName) || S.fin.accounts[0];
const date = (r[ix('fecha')] || A.today()).slice(0, 10);
S.tx.push({ id: uid(), type, amount: Math.abs(amt), cat: c ? c.id : null, acct: ac.id, date, note: r[ix('nota')] || '' }); ms.push(A.ym(date)); n++;
});
S.tx.sort((a, b) => b.date.localeCompare(a.date)); A.saveTxMonths(ms); toast(`Importados ${n} movimientos`); rerender();
}
} catch (er) { toast('No pude leer ese archivo: ' + (er.message || 'formato raro')); }
};
};
function parseCSV(t) {
const rows = []; let row = [], cell = '', q = false; const sep = (t.split('\n')[0].match(/;/g) || []).length > (t.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
t = t.replace(/^﻿/, '');
for (let i = 0; i < t.length; i++) { const ch = t[i]; if (q) { if (ch === '"' && t[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; } else if (ch === '"') q = true; else if (ch === sep) { row.push(cell); cell = ''; } else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else if (ch !== '\r') cell += ch; }
if (cell || row.length) { row.push(cell); rows.push(row); } return rows.filter(r => r.some(c => c.trim()));
}
})();
;
(function () {
const A = App, S = A.S, { $, $$, esc, money, ymd, addDays, toast } = A;
const BGS = { cielo: { price: 0 }, picnic: { price: 20 }, pradera: { price: 20 }, atardecer: { price: 30 }, cerezo: { price: 30 }, estrellas: { price: 40 } };
const UNLOCKS = {
'washi:estrellas': { name: 'Washi Noche estrellada', price: 40, ic: 'ui_washi' }, 'washi:arcoiris': { name: 'Washi Arcoíris pastel', price: 40, ic: 'ui_washi' },
'washi:durazno': { name: 'Washi Durazno con corazones', price: 40, ic: 'ui_washi' }, 'stickers:pixel': { name: 'Stickers de las mascotas', price: 90, ic: 'gochi' }
};
function R() { S.settings.rincon = S.settings.rincon || { spent: 0, owned: [], equip: {}, bg: 'cielo', pets: 0, lastPet: '' }; return S.settings.rincon; }
const ST = `<img class="pixel ico" alt="estrellitas" src="${Pix.sprite('estrellita', 3)}" style="width:16px;height:16px;vertical-align:-3px">`;
function stats() {
const real = S.tx.filter(t => !t.example && !t.recurring);
const days = [...new Set(real.map(t => t.date))].sort();
const set = new Set(days);
let streak = 0; let d = new Date(); if (!set.has(ymd(d))) d = addDays(d, -1);
while (set.has(ymd(d))) { streak++; d = addDays(d, -1); }
let best = 0, run = 0, prev = null;
days.forEach(x => { const t = A.parseYmd(x); run = prev && (t - prev) / 864e5 === 1 ? run + 1 : 1; best = Math.max(best, run); prev = t; });
const goalsDone = S.fin.goals.filter(g => !g.example && g.target && g.saved >= g.target).length;
const goalTx = real.filter(t => t.goal).length;
const jWeeks = Store.ids('jr-').filter(id => { const doc = Store.get(id); return doc && doc.pages && doc.pages.some(p => (p.els || []).length || (p.strokes || []).length || Object.values(p.days || {}).some(v => v && v.trim())); }).length;
const cur = A.ym(A.today()); const budget = A.budgetExpenses(false);
const months = [...new Set(real.map(t => A.ym(t.date)))].filter(m => m < cur);
const under = months.filter(m => A.spentOf(A.txIn(m).filter(t => !t.example)) <= budget).length;
return { days: days.length, streak, best, goalsDone, goalTx, jWeeks, under, txCount: real.length, lastDate: days[days.length - 1] };
}
const ACH = [
{ id: 'first', ic: 'brote', name: 'Primer paso', desc: 'Anota tu primer movimiento', ok: s => s.txCount >= 1, prize: 5 },
{ id: 's3', ic: 'fuego', name: 'Racha de 3', desc: '3 días seguidos anotando', ok: s => s.best >= 3, prize: 10 },
{ id: 's7', ic: 'star', name: 'Semana perfecta', desc: '7 días seguidos anotando', ok: s => s.best >= 7, prize: 25 },
{ id: 's30', ic: 'trofeo', name: 'Mes constante', desc: '30 días seguidos anotando', ok: s => s.best >= 30, prize: 80 },
{ id: 'tx50', ic: 'list', name: 'Contadora', desc: '50 movimientos anotados', ok: s => s.txCount >= 50, prize: 20 },
{ id: 'tx200', ic: 'book2', name: 'Archivista', desc: '200 movimientos anotados', ok: s => s.txCount >= 200, prize: 50 },
{ id: 'goal1', ic: 'goal', name: 'Meta cumplida', desc: 'Completa una meta de ahorro', ok: s => s.goalsDone >= 1, prize: 30 },
{ id: 'under1', ic: 'escudo', name: 'Mes en control', desc: 'Termina un mes sin pasarte del presupuesto', ok: s => s.under >= 1, prize: 30 },
{ id: 'shey3', ic: 'heart', name: 'Fuerza de voluntad', desc: 'Resiste 3 antojos con tu mascota', ok: () => (A.sheyResisted ? A.sheyResisted() : 0) >= 3, prize: 20 },
{ id: 'jr4', ic: 'book', name: 'Journal lindo', desc: 'Decora 4 semanas de tu journal', ok: s => s.jWeeks >= 4, prize: 20 }
];
const RW = () => (A.CFG && A.CFG.rewards) || { day: 2, goalTx: 3, goalDone: 15, journalWeek: 5, monthUnder: 20, antojo: 5, closeDay: 1, pet: 1 };
A.RC = { get BGS() { return BGS; }, get UNLOCKS() { return UNLOCKS; }, get ACH() { return ACH; } };
function earned(s) {
const r = R();
const w = RW();
return s.days * w.day + s.goalTx * w.goalTx + s.goalsDone * w.goalDone + s.jWeeks * w.journalWeek + s.under * w.monthUnder + (r.pets || 0) * w.pet + (A.sheyResisted ? A.sheyResisted() * w.antojo : 0) + (A.closedDays ? A.closedDays() * w.closeDay : 0) + (r.bonus || 0) + ACH.filter(a => a.ok(s)).reduce((n, a) => n + a.prize, 0);
}
function balance() { const s = stats(); return { s, total: earned(s), bal: Math.max(0, earned(s) - (R().spent || 0)) }; }
A.rinconBalance = () => balance().bal; A.rcStats = stats;
A.owns = key => (R().owned || []).includes(key);
function gochiMood() {
const s = stats(); const k = A.ym(A.today()); const n = new Date().getDate(); const dim = A.daysIn(k);
const spent = A.spentOf(A.txIn(k)); const pace = A.budgetExpenses(false) * n / dim;
const since = s.lastDate ? (new Date() - A.parseYmd(s.lastDate)) / 864e5 : 99;
if (since >= 3) return { k: 'sleep', fx: 'zzz', msg: 'Zzz… ¿me cuentas qué gastaste hoy?' };
if (pace && spent > pace * 1.15) return { k: 'worry', fx: 'gota', msg: `Uy… vas ${money(spent - pace)} por encima del ritmo de este mes. ¿Revisamos juntas?` };
return { k: 'happy', fx: 'sparkle', msg: pace ? `¡Vas súper! Te quedan ${money(Math.max(0, A.budgetExpenses(false) - spent))} para el mes ✦` : '¡Hola! Ponme un presupuesto y te ayudo a cuidarlo ✦' };
}
function yakiMood() {
const s = stats();
if (s.streak >= 7) return { k: 'wow', fx: 'star', msg: `¡${s.streak} días seguidos anotando! Eres mi heroína.` };
if (s.streak >= 1) return { k: 'happy', fx: 'espiral', msg: `Racha de ${s.streak} ${s.streak === 1 ? 'día' : 'días'}. ¡No la rompamos!` };
return { k: 'calm', fx: 'nube', msg: 'Anota algo hoy y empezamos una racha juntas ✦' };
}
A.PAGES.rincon = 'Mi mascota';
Object.values(A.PACKS).forEach(p => { p.map.rincon = p.map.rincon || (p === A.PACKS.pixel ? 's:gochi' : 'e:🍡'); });
const NAMES = { gochi: 'Gochi', yaki: 'Yaki', shey: 'Shey' };
function charHTML(id, sprite, mood) {
return `<button class="rc-char" data-pet="${id}" aria-label="${NAMES[id]}">
<span class="rc-fx">${A.px(mood.fx, 26)}</span>
${A.wear ? A.wear(id, { cls: mood.k === 'sleep' ? 'sleepy' : '' }) : `<img class="pixel" alt="" src="${Pix.sprite(sprite, 5)}">`}
<span class="pill sm">${NAMES[id]}</span></button>`;
}
A.screens.rincon = () => {
const r = R(); const { s, bal } = balance(); const gm = gochiMood(), ym = yakiMood();
const tab = S.rcTab || 'logros';
const today = A.today();
return `${A.header('rincon', `<span class="pill sm" style="background:#fff09a;color:#6b4d12">${ST} ${bal}</span>`)}
<div class="rc-scene" style="background-image:url(${Pix.banner(r.bg || 'cielo')})">
<div class="rc-row">${charHTML('gochi', 'gochi', gm)}${charHTML('yaki', 'canela', ym)}${charHTML('shey', 'shey', { k: 'calm', fx: A.sheyReady && A.sheyReady() ? 'alerta' : 'moon', msg: A.sheyMsg ? A.sheyMsg() : '' })}</div>
<div class="rc-say" id="rcSay">${esc(gm.msg)}</div>
</div>
<div class="row"><button class="btn pink" data-act="rcPet" style="flex:1;justify-content:center" ${r.lastPet === today ? 'disabled' : ''}>${r.lastPet === today ? 'Ya les diste cariño hoy ✦' : 'Darles cariño (+1 estrellita)'}</button></div>
<div class="grid2">
<div class="card"><h3>Racha</h3><div class="mid">${s.streak} ${s.streak === 1 ? 'día' : 'días'}</div><div class="faint">Mejor racha: ${s.best}</div></div>
<div class="card"><h3>Estrellitas</h3><div class="mid">${ST} ${bal}</div><div class="faint">Ganas ${RW().day} por cada día que anotas</div></div>
</div>
<div class="grid2"><button class="btn" data-go="tienda" style="justify-content:center">${A.px('gift', 20)} Tiendita</button><button class="btn" data-go="shey" style="justify-content:center">${A.px('shey', 20)} Antojos con Shey</button></div>
<div class="seg"><button data-act="rcTab" data-v="logros" aria-pressed="${tab !== 'como'}">Logros</button><button data-act="rcTab" data-v="como" aria-pressed="${tab === 'como'}">Cómo ganar</button></div>
${tab !== 'como' ? `<div class="list">${ACH.map(a => { const ok = a.ok(s); return `<div class="li" style="${ok ? '' : 'opacity:.6'}"><span class="ic" style="${ok ? 'background:#fff09a' : 'filter:grayscale(1)'}">${A.px(a.ic, 28)}</span><span class="tx-main"><b>${esc(a.name)}</b><span>${esc(a.desc)}</span></span><span class="amt">${ok ? '✓' : '+' + a.prize + ' ' + ST}</span></div>`; }).join('')}</div>` : ''}
${tab === 'como' ? `<div class="card stack">
<div class="row between"><span>Anotar al menos un movimiento en el día</span><b>+${RW().day} ${ST}</b></div>
<div class="row between"><span>Poner dinero en una meta</span><b>+${RW().goalTx} ${ST}</b></div>
<div class="row between"><span>Decorar una semana del journal</span><b>+${RW().journalWeek} ${ST}</b></div>
<div class="row between"><span>Cumplir una meta</span><b>+${RW().goalDone} ${ST}</b></div>
<div class="row between"><span>Terminar un mes sin pasarte</span><b>+${RW().monthUnder} ${ST}</b></div>
<div class="row between"><span>Resistir un antojo con tu mascota</span><b>+${RW().antojo} ${ST}</b></div>
<div class="row between"><span>Cerrar el día con Ale</span><b>+${RW().closeDay} ${ST}</b></div>
<div class="row between"><span>Darles cariño (una vez al día)</span><b>+${RW().pet} ${ST}</b></div>
${A.isPlus() ? `<div class="row between"><span>Regalo de Meffy+</span><b>+${(A.CFG && A.CFG.plan[S.settings.planType === 'anual' ? 'bonusAnnual' : 'bonusMonthly']) || 0} ${ST}</b></div>` : ''}
<div class="row between"><span>Cada logro desbloqueado</span><b>su premio</b></div>
<p class="faint" style="margin:0">Los movimientos de ejemplo y los pagos fijos automáticos no cuentan: solo lo que anotas tú.</p></div>` : ''}`;
};
A.rcExtrasHTML = bal => {
const r = R(); const own = k => (r.owned || []).includes(k);
const btn = (key, price) => own(key) ? '' : `<button class="btn sm ${bal >= price ? 'pink' : ''}" data-act="rcBuy" data-k="${key}" data-p="${price}" ${bal >= price ? '' : 'disabled'}>${ST} ${price}</button>`;
return `<div class="card"><h3>Fondos para tus mascotas</h3><div class="bannergrid">${Object.entries(BGS).map(([k, b]) => `<button ${own('bg:' + k) || !b.price ? `data-act="rcBg" data-k="${k}"` : `data-act="rcBuy" data-k="bg:${k}" data-p="${b.price}"`} aria-pressed="${(r.bg || 'cielo') === k}" ${!own('bg:' + k) && b.price && bal < b.price ? 'disabled' : ''}><img class="pixel" alt="" src="${Pix.banner(k)}">${!own('bg:' + k) && b.price ? `<span class="lock" style="background:#fff09a">${ST} ${b.price}</span>` : ''}</button>`).join('')}</div></div>
<div class="card"><h3>Para tu journal</h3><div class="stack">${Object.entries(UNLOCKS).map(([k, u]) => `<div class="row between"><span style="width:30px">${A.px(u.ic, 24)}</span><span style="flex:1;font-weight:700">${esc(u.name)}</span>${own(k) || A.isPlus() ? '<span class="tag">Tuyo ✓</span>' : btn(k, u.price)}</div>`).join('')}</div></div>`;
};
const ACT = A.ACTIONS;
ACT.rcTab = a => { S.rcTab = a.dataset.v; A.render(); };
ACT.rcPet = () => {
const r = R(); const t = A.today(); if (r.lastPet === t) return;
r.lastPet = t; r.pets = (r.pets || 0) + 1; A.saveSettings();
hearts(); setTimeout(() => A.render(), 900); toast('¡Gochi, Yaki y Shey están felices! +1 estrellita');
};
ACT.rcBuy = a => {
const r = R(); const price = +a.dataset.p; const { bal } = balance();
if (bal < price) return toast('Te faltan estrellitas. ¡Sigue anotando!');
if (!a.dataset.sure) { a.dataset.sure = 1; a.textContent = '¿Comprar?'; return; }
r.spent = (r.spent || 0) + price; r.owned = (r.owned || []).concat(a.dataset.k);
if (a.dataset.k.startsWith('bg:')) r.bg = a.dataset.k.slice(3);
A.saveSettings(); toast('¡Es tuyo! ✦'); A.render();
};
ACT.rcBg = a => { R().bg = a.dataset.k; A.saveSettings(); A.render(); };
document.addEventListener('click', e => {
const c = e.target.closest('[data-pet]'); if (!c || S.route !== 'rincon') return;
const id = c.dataset.pet; const m = id === 'gochi' ? gochiMood() : id === 'yaki' ? yakiMood() : { msg: A.sheyMsg ? A.sheyMsg() + ' (tócame otra vez para ir a mis antojos)' : '' };
const say = $('#rcSay');
if (id === 'shey' && say && say.dataset.last === 'shey') { A.go('shey'); return; }
if (say) { say.textContent = NAMES[id] + ': ' + m.msg; say.dataset.last = id; }
c.classList.remove('boing'); void c.offsetWidth; c.classList.add('boing'); hearts(c);
});
function hearts(target) {
const sc = $('.rc-scene'); if (!sc) return;
const kinds = ['heartS', 'heart', 'heartB', 'sparkle', 'heartY', 'heartS'];
const n = target ? 4 : 10; const box = sc.getBoundingClientRect(); const t = target ? target.getBoundingClientRect() : null;
for (let i = 0; i < n; i++) {
const h = document.createElement('img'); h.className = 'rc-heart pixel'; h.alt = '';
h.src = Pix.sprite(kinds[i % kinds.length], 3);
const size = [26, 34, 22, 28][i % 4]; h.style.width = h.style.height = size + 'px';
if (t) { h.style.left = (t.left - box.left + t.width / 2 - size / 2 + (Math.random() * 50 - 25)) + 'px'; h.style.bottom = (box.bottom - t.top - 30) + 'px'; }
else { h.style.left = (8 + Math.random() * 80) + '%'; h.style.bottom = (25 + Math.random() * 20) + '%'; }
h.style.animationDelay = (i * .11) + 's'; h.style.setProperty('--dx', (Math.random() * 40 - 20).toFixed(0) + 'px');
sc.appendChild(h); setTimeout(() => h.remove(), 2200);
}
}
A.pixelHearts = hearts;
A.rinconCard = () => {
const { bal, s } = balance(); const gm = gochiMood();
return `<button class="card row" data-go="rincon" style="gap:12px;width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer"><img class="pixel" alt="" src="${Pix.sprite('gochi', 3)}" style="width:52px;height:52px"><img class="pixel" alt="" src="${Pix.sprite('canela', 3)}" style="width:52px;height:52px;margin-left:-14px"><img class="pixel" alt="" src="${Pix.sprite('shey', 3)}" style="width:52px;height:52px;margin-left:-14px"><div style="flex:1;min-width:0"><b>Gochi, Yaki y Shey</b> ${A.px(gm.fx, 18)}<div class="faint">${ST} ${bal} · racha de ${s.streak} ${s.streak === 1 ? 'día' : 'días'}</div></div><span class="faint">›</span></button>`;
};
})();
;
(function () {
const A = App, S = A.S, { $, $$, esc, money, uid, ymd, addDays, toast, openSheet, closeSheet } = A;
const fi = n => `<img class="pixel ico" alt="" src="${Pix.sprite(n, 3)}" style="width:22px;height:22px;vertical-align:-5px">`;
const FEELS = {};
[['feliz', 'Feliz'], ['tranquila', 'Tranquila'], ['emocionada', 'Emocionada'], ['cansada', 'Cansada'], ['aburrida', 'Aburrida'], ['triste', 'Triste'], ['estresada', 'Estresada'], ['ansiosa', 'Ansiosa']]
.forEach(([k, n]) => { FEELS[k] = { n, get e() { return fi('f_' + k); } }; });
A.FEELS = FEELS;
A.PAGES.shey = 'Antojos';
Object.values(A.PACKS).forEach(p => { p.map.shey = p.map.shey || (p === A.PACKS.pixel ? 's:shey' : 'e:🍡'); });
const list = () => (S.fin.antojos = S.fin.antojos || []);
const daysLeft = a => Math.ceil((A.parseYmd(a.until) - A.parseYmd(A.today())) / 864e5);
const ready = () => list().filter(a => a.status === 'esperando' && daysLeft(a) <= 0);
A.sheyReady = () => ready().length;
A.sheyResisted = () => list().filter(a => a.status === 'resistido').length;
const PID = () => (window.App && App.petActive && App.petActive()) || 'shey';
const PN = () => (window.App && App.petInfo ? App.petInfo(PID()).name : 'Shey');
function sheyMsg() {
const r = ready(); const saved = list().filter(a => a.status === 'resistido').reduce((s, a) => s + (+a.price || 0), 0);
if (r.length) return `¡Ya terminó la espera de “${r[0].name}”! ¿Todavía lo quieres?`;
const w = list().filter(a => a.status === 'esperando');
if (w.length) return `Estoy cuidando ${w.length} ${w.length === 1 ? 'antojo' : 'antojos'}. Respira, yo te aviso ✦`;
if (saved) return `Por resistir antojos ya te ahorraste ${money(saved)}. ¡Qué orgullo!`;
return '¿Se te antojó algo? Cuéntamelo antes de comprarlo y lo pensamos juntas ✦';
}
A.sheyMsg = sheyMsg;
function feelChips(cur, attr) {
return `<div class="chips">${Object.entries(FEELS).map(([k, f]) => `<button type="button" class="chip" data-${attr}="${k}" aria-pressed="${cur === k}">${f.e} ${f.n}</button>`).join('')}</div>`;
}
A.feelChips = feelChips;
A.screens.shey = () => {
const tab = S.sheyTab || 'antojos'; const all = list();
const wait = all.filter(a => a.status === 'esperando' && daysLeft(a) > 0);
const rd = ready(); const done = all.filter(a => a.status !== 'esperando').sort((a, b) => (b.decided || '').localeCompare(a.decided || ''));
const saved = all.filter(a => a.status === 'resistido').reduce((s, a) => s + (+a.price || 0), 0);
const card = a => `<div class="li" style="flex-wrap:wrap"><span class="ic">${a.feel ? FEELS[a.feel].e : A.px('moon', 24)}</span><span class="tx-main"><b>${esc(a.name)}</b><span>${a.why ? esc(a.why) + ' · ' : ''}lo anotaste el ${A.fmtDate(a.created)}</span></span><span class="amt num">${money(a.price)}</span>`;
return `${A.header('shey', `<span class="pill sm" style="background:#ece0fb;color:#4a3570">${money(saved)} ahorrados</span>`)}
<div class="rc-scene" style="background-image:url(${Pix.banner('estrellas')});min-height:210px">
<div class="rc-row"><button class="rc-char" data-shey-tap aria-label="${esc(PN())}"><span class="rc-fx">${A.px(rd.length ? 'alerta' : 'moon', 26)}</span>${A.wear ? A.wear(PID()) : `<img class="pixel" alt="" src="${Pix.sprite((A.petInfo ? A.petInfo(PID()).sprite : 'shey'), 5)}">`}<span class="pill sm">${esc(PN())}</span></button></div>
<div class="rc-say">${esc(sheyMsg())}</div>
</div>
<button class="btn pink" data-act="antojoNew" style="justify-content:center;padding:12px">Contarle un antojo a ${esc(PN())}</button>
<div class="seg"><button data-act="sheyTab" data-v="antojos" aria-pressed="${tab === 'antojos'}">Antojos</button><button data-act="sheyTab" data-v="emociones" aria-pressed="${tab === 'emociones'}">Mis emociones</button></div>
${tab === 'antojos' ? `
${rd.length ? `<section class="stack"><span class="pill sm" style="align-self:flex-start">Listos para decidir</span>${rd.map(a => card(a) + `<div class="row" style="width:100%;margin-top:8px"><button class="btn sm" data-act="antojoYes" data-id="${a.id}" style="flex:1;justify-content:center">Sí, lo compro</button><button class="btn pink sm" data-act="antojoNo" data-id="${a.id}" style="flex:1;justify-content:center">Ya no lo quiero +5 ${A.px('estrellita', 16)}</button></div></div>`).join('')}</section>` : ''}
<section class="stack"><span class="pill sm" style="align-self:flex-start">Esperando</span>${wait.length ? wait.map(a => card(a) + `<div class="row between" style="width:100%;margin-top:6px"><span class="faint">${daysLeft(a) === 1 ? 'Falta 1 día' : 'Faltan ' + daysLeft(a) + ' días'}</span><button class="btn ghost sm" data-act="antojoDel" data-id="${a.id}">Quitar</button></div></div>`).join('') : `<div class="card empty">No hay antojos esperando. Cuando quieras comprar algo, cuéntaselo primero a ${esc(PN())}.</div>`}</section>
${done.length ? `<section class="stack"><span class="pill sm" style="align-self:flex-start">Historial</span>${done.slice(0, 20).map(a => `<div class="li ${a.status === 'resistido' ? 'income' : ''}"><span class="ic">${A.px(a.status === 'resistido' ? 'heart' : 'bolsa', 26)}</span><span class="tx-main"><b>${esc(a.name)}</b><span>${a.status === 'resistido' ? 'Resististe' : 'Lo compraste'} · ${A.fmtDate(a.decided || a.created)}</span></span><span class="amt num ${a.status === 'resistido' ? 'pos' : ''}">${money(a.price)}</span></div>`).join('')}</section>` : ''}
<div class="card"><b>¿Cómo funciona?</b><p class="muted" style="margin:6px 0 0">Anotas lo que se te antojó y eliges cuántos días esperar. ${esc(PN())} lo guarda. Al terminar la espera decides: si ya no lo quieres, ganas 5 estrellitas y ${esc(PN())} suma ese dinero a lo que te ahorraste.</p></div>`
: emotions()}`;
};
function emotions() {
const since = ymd(addDays(new Date(), -90));
const tx = S.tx.filter(t => t.type === 'expense' && t.date >= since && t.feel && !A.isSaving(A.cat(t.cat)));
const untagged = S.tx.filter(t => t.type === 'expense' && t.date >= since && !t.feel && !t.recurring).length;
if (!tx.length) return `<div class="card stack"><b>Aún no hay emociones anotadas</b><p class="muted" style="margin:0">Cuando anotes un gasto, toca cómo te sentías (aparece arriba de la calculadora). Con unas cuantas compras, ${esc(PN())} te muestra si gastas distinto según tu ánimo.</p></div>`;
const by = {}; tx.forEach(t => { const b = by[t.feel] = by[t.feel] || { n: 0, sum: 0, cats: {} }; b.n++; b.sum += t.amount; b.cats[t.cat] = (b.cats[t.cat] || 0) + t.amount; });
const rows = Object.entries(by).map(([k, b]) => ({ k, ...b, avg: b.sum / b.n })).sort((a, b) => b.sum - a.sum);
const mx = Math.max(...rows.map(r => r.sum));
const calm = ['feliz', 'tranquila']; const tough = ['triste', 'estresada', 'ansiosa', 'aburrida', 'cansada'];
const avgOf = ks => { const r = rows.filter(x => ks.includes(x.k)); const n = r.reduce((s, x) => s + x.n, 0); return n ? r.reduce((s, x) => s + x.sum, 0) / n : 0; };
const ac = avgOf(calm), at = avgOf(tough);
let insight = '';
if (ac && at) insight = at > ac * 1.15 ? `Cuando estás triste, estresada, ansiosa, aburrida o cansada gastas en promedio ${money(at)} por compra, un ${Math.round((at / ac - 1) * 100)}% más que cuando estás bien (${money(ac)}). Antes de comprar en esos días, cuéntaselo a ${PN()}.` : at < ac * .85 ? `Buenas noticias: tus días difíciles no te hacen gastar más. Compras más cuando estás contenta (${money(ac)} en promedio).` : `Gastas parecido sin importar tu ánimo (${money(ac)} vs. ${money(at)} por compra). ¡Muy equilibrada!`;
const top = rows[0]; const topCat = top ? Object.entries(top.cats).sort((a, b) => b[1] - a[1])[0] : null;
return `${insight ? `<div class="card" style="background:#f4edff;border-color:#e2d4fb"><b>${esc(PN())} notó algo</b> ${A.px('moon', 18)}<p style="margin:6px 0 0">${esc(insight)}</p></div>` : ''}
<div class="card"><h3>Gasto según cómo te sentías · últimos 90 días</h3>${rows.map(r => `<div class="row" style="padding:5px 0"><span style="width:26px">${FEELS[r.k].e}</span><span style="width:92px;font-weight:700">${FEELS[r.k].n}</span><div class="prog" style="flex:1"><i style="width:${r.sum / mx * 100}%;background:#b79ae8"></i></div><b class="num" style="width:84px;text-align:right">${money(r.sum)}</b></div><div class="faint" style="margin:-4px 0 4px 26px">${r.n} ${r.n === 1 ? 'compra' : 'compras'} · ${money(r.avg)} promedio</div>`).join('')}</div>
${topCat && A.cat(topCat[0]) ? `<div class="card"><b>Tu ánimo con más gasto: ${FEELS[top.k].e} ${FEELS[top.k].n}</b><p class="muted" style="margin:6px 0 0">En esos días lo que más compras es ${esc(A.cat(topCat[0]).name)} (${money(topCat[1])}).</p></div>` : ''}
${untagged ? `<p class="faint" style="margin:0">${untagged} gastos de estos días no tienen emoción. Puedes agregarla tocando el gasto en Movimientos.</p>` : ''}`;
}
const ACT = A.ACTIONS;
ACT.sheyTab = a => { S.sheyTab = a.dataset.v; A.render(); };
ACT.antojoNew = () => newAntojo();
ACT.antojoDel = a => { S.fin.antojos = list().filter(x => x.id !== a.dataset.id); A.saveFin(); A.render(); };
ACT.antojoNo = a => {
const x = list().find(y => y.id === a.dataset.id); if (!x) return;
x.status = 'resistido'; x.decided = A.today(); A.saveFin(); toast(`¡Te ahorraste ${money(x.price)}! +5 estrellitas`); A.render();
};
ACT.antojoYes = a => {
const x = list().find(y => y.id === a.dataset.id); if (!x) return;
x.status = 'comprado'; x.decided = A.today(); A.saveFin(); A.render();
A.quickAdd(null, { type: 'expense', amount: x.price, note: x.name, feel: x.feel, cat: x.cat || null });
};
document.addEventListener('click', e => { if (e.target.closest('[data-shey-tap]')) { const s = $('.rc-say'); if (s) s.textContent = sheyMsg(); const c = e.target.closest('.rc-char'); c.classList.remove('boing'); void c.offsetWidth; c.classList.add('boing'); } });
function newAntojo() {
const a = { id: uid(), name: '', price: '', wait: 3, feel: null, why: '', cat: null };
openSheet('Contarle un antojo a ' + PN(), `<div class="stack">
<div class="row" style="gap:10px"><img class="pixel" alt="" src="${Pix.sprite((A.petInfo ? A.petInfo(PID()).sprite : 'shey'), 3)}" style="width:48px;height:48px"><span class="muted">Cuéntame qué se te antojó. Lo guardo unos días y después decides con calma.</span></div>
<label class="f">¿Qué quieres comprar?<input class="in" id="anN" placeholder="Ej. unos tenis, un labial" autofocus></label>
<div class="formgrid"><label class="f">¿Cuánto cuesta?<input class="in" id="anP" type="number" inputmode="decimal" step="0.01"></label>
<label class="f">Categoría<select class="in" id="anC"><option value="">Sin categoría</option>${S.fin.categories.filter(c => c.type !== 'income').map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label></div>
<div class="f">¿Cuánto esperamos?<div class="seg" style="margin-top:4px"><button type="button" data-w="1" aria-pressed="false">1 día</button><button type="button" data-w="3" aria-pressed="true">3 días</button><button type="button" data-w="7" aria-pressed="false">7 días</button><button type="button" data-w="30" aria-pressed="false">30 días</button></div></div>
<div class="f">¿Cómo te sientes ahora?${feelChips(null, 'fl')}</div>
<label class="f">¿Por qué lo quieres? (opcional)<input class="in" id="anW" placeholder="Ej. lo vi en TikTok, lo necesito para el trabajo"></label>
<button class="btn pink" id="anOk" style="justify-content:center;padding:12px">Guardar con ${esc(PN())} ✦</button></div>`, sh => {
sh.addEventListener('click', e => {
const w = e.target.closest('[data-w]'); if (w) { a.wait = +w.dataset.w; $$('[data-w]', sh).forEach(b => b.setAttribute('aria-pressed', b === w)); }
const f = e.target.closest('[data-fl]'); if (f) { a.feel = a.feel === f.dataset.fl ? null : f.dataset.fl; $$('[data-fl]', sh).forEach(b => b.setAttribute('aria-pressed', b.dataset.fl === a.feel)); }
});
$('#anOk', sh).onclick = () => {
a.name = $('#anN').value.trim(); a.price = +$('#anP').value || 0; a.cat = $('#anC').value || null; a.why = $('#anW').value.trim();
if (!a.name) return toast('Cuéntale a ' + PN() + ' qué quieres');
a.created = A.today(); a.until = ymd(addDays(new Date(), a.wait)); a.status = 'esperando';
list().push(a); A.saveFin(); closeSheet(); toast(`${PN()} lo cuida ${a.wait === 1 ? '1 día' : a.wait + ' días'} ✦`); A.render();
};
});
}
})();
;
(function () {
const A = App, S = A.S, { $, $$, esc, money, toast, openSheet, closeSheet } = A;
const mi = n => `<img class="pixel ico" alt="" src="${Pix.sprite(n, 3)}" style="width:20px;height:20px;vertical-align:-4px">`;
const MOODS = [['genial', 'f_emocionada', 'Genial'], ['bien', 'f_feliz', 'Bien'], ['normal', 'f_aburrida', 'Normal'], ['cansado', 'f_cansada', 'Cansado'], ['dificil', 'f_triste', 'Difícil']];
A.DAY_MOODS = Object.fromEntries(MOODS.map(([k, ic, n]) => [k, { get e() { return mi(ic); }, n }]));
const FRASES = [
'Cada día que anotas es un paso hacia tus sueños. Ale está orgulloso de ti ✦',
'Descansa bonito. Mañana es una página nueva de tu journal ✦',
'No tienes que ser perfecta, solo constante. ¡Lo estás haciendo muy bien!',
'Tu yo del futuro te va a agradecer lo de hoy ✦',
'Un día a la vez, un pesito a la vez ✦',
'Hoy cuidaste tu dinerito y también a ti. Eso vale mucho.',
'Gracias por contarme tu día. ¡Hasta mañana!'
];
const log = () => (S.fin.dayLog = S.fin.dayLog || {});
A.dayLog = d => (S.fin.dayLog || {})[d];
A.closedDays = () => Object.values(S.fin.dayLog || {}).filter(x => x && x.closed).length;
function dayNumbers(d) {
const k = A.ym(d); const list = A.txIn(k);
const budget = A.budgetExpenses(false); const dim = A.daysIn(k); const day = +d.slice(8);
const spentBefore = A.spentOf(list.filter(t => t.date < d));
const perDay = Math.max(0, (budget - spentBefore) / (dim - day + 1));
const tx = A.txOnDay(d);
const spent = A.spentOf(tx); const income = A.incomeOf(tx);
const left = perDay - spent;
const tomorrow = day < dim ? Math.max(0, (budget - spentBefore - spent) / (dim - day)) : 0;
return { tx, spent, income, perDay, left, tomorrow };
}
function summary(d) {
d = d || A.today();
const n = dayNumbers(d); const L = log(); const rec = L[d] || {};
let mood = rec.mood || null; let sentTo = null;
const FR = (A.CFG && A.CFG.phrases && A.CFG.phrases.length) ? A.CFG.phrases : FRASES; const frase = FR[(+d.slice(8) + +d.slice(5, 7)) % FR.length];
const goals = S.fin.goals.filter(g => !g.example || S.settings.examples);
const top = n.tx.filter(t => t.type === 'expense').sort((a, b) => b.amount - a.amount).slice(0, 4);
openSheet(d === A.today() ? 'Cierre del día con Ale' : 'Cierre del ' + A.fmtDate(d), `
<div class="stack">
<div class="row" style="gap:12px"><img class="pixel" alt="" src="${Pix.sprite('pudin', 4)}" style="width:72px;height:72px;flex:none"><div class="bubble-in">${rec.closed ? '¡Este día ya está cerrado! Igual puedes cambiar tu carita.' : n.tx.length ? `Hoy anotaste ${n.tx.length} ${n.tx.length === 1 ? 'movimiento' : 'movimientos'}. Te cuento cómo te fue ✦` : 'Hoy no anotaste nada. Si gastaste algo, anótalo antes de dormir y lo vemos juntos.'}</div></div>
<div class="grid2">
<div class="card flat"><h3>Gastaste hoy</h3><div class="mid num">${money(n.spent)}</div>${n.income ? `<div class="faint pos">Entró ${money(n.income)}</div>` : ''}</div>
<div class="card flat"><h3>${n.left >= 0 ? 'Te quedó' : 'Te pasaste'}</h3><div class="mid num ${n.left >= 0 ? 'pos' : 'neg'}">${money(Math.abs(n.left))}</div><div class="faint">de ${money(n.perDay)} para hoy</div></div>
</div>
${top.length ? `<div class="card flat"><h3>Lo más grande de hoy</h3>${top.map(t => { const c = A.cat(t.cat); return `<div class="row between" style="padding:3px 0"><span>${A.iconHTML(c ? c.icon : 's:moneda', 18)} ${esc(t.note || (c ? c.name : ''))}</span><b class="num">${money(t.amount)}</b></div>`; }).join('')}</div>` : ''}
<p class="muted" style="margin:0">${n.left >= 0 ? `Mañana tendrás ${money(n.tomorrow)} para gastar.` : `Para compensar, mañana tendrás ${money(n.tomorrow)} para gastar. ¡Tú puedes!`}</p>
${n.left > 0.5 && goals.length && !rec.sent ? `<div class="card flat stack"><b>¿Mandamos lo que te quedó a una meta?</b><div class="chips">${goals.map(g => `<button class="chip" data-goal="${g.id}">${A.iconHTML(g.icon, 16)} ${esc(g.name)}</button>`).join('')}</div><div class="faint">Se suma a la meta y se anota como ahorro.</div></div>` : ''}
${rec.sent ? `<div class="faint">Ya mandaste ${money(rec.sent.amount)} a “${esc(rec.sent.name)}” ✦</div>` : ''}
<div class="f">¿Cómo estuvo tu día?<div class="chips" style="margin-top:4px">${MOODS.map(([k, ic, nm]) => `<button class="chip" data-dm="${k}" aria-pressed="${mood === k}">${mi(ic)} ${nm}</button>`).join('')}</div></div>
<label class="f">Algo que quieras recordar de hoy (opcional)<input class="in" id="aleNote" value="${esc(rec.note || '')}" placeholder="Ej. comí helado con mi mamá"></label>
<div class="card flat" style="background:#fff6c4;border-color:#f6e3a3;text-align:center;font-weight:700">${esc(frase)}</div>
<button class="btn pink" id="aleClose" style="justify-content:center;padding:12px">${rec.closed ? 'Guardar cambios' : 'Cerrar el día ✦ (+1 estrellita)'}</button>
<p class="faint" style="margin:0;text-align:center">Tu carita y tu nota también aparecen en tu journal.</p>
</div>`, sh => {
sh.addEventListener('click', e => {
const m = e.target.closest('[data-dm]'); if (m) { mood = mood === m.dataset.dm ? null : m.dataset.dm; $$('[data-dm]', sh).forEach(b => b.setAttribute('aria-pressed', b.dataset.dm === mood)); }
const g = e.target.closest('[data-goal]');
if (g) {
const goal = S.fin.goals.find(x => x.id === g.dataset.goal); const amt = Math.floor(n.left * 100) / 100;
goal.saved = Math.round((goal.saved + amt) * 100) / 100; delete goal.example;
const c = S.fin.categories.find(c => c.id === 'metas') || S.fin.categories.find(c => A.isSaving(c));
A.addTx({ type: 'expense', amount: amt, cat: c ? c.id : null, acct: S.settings.defaultAcct || S.fin.accounts[0].id, date: d, note: 'Para ' + goal.name, goal: goal.id });
L[d] = Object.assign({}, L[d], { sent: { amount: amt, name: goal.name } }); A.saveFin();
toast(`¡${money(amt)} a “${goal.name}”! ✦`); g.closest('.card').innerHTML = `<b>¡Listo! Mandaste ${money(amt)} a “${esc(goal.name)}” ✦</b>`;
}
});
$('#aleClose', sh).onclick = () => {
const was = !!(L[d] && L[d].closed);
L[d] = Object.assign({}, L[d], { closed: true, mood, note: $('#aleNote').value.trim() }); A.saveFin(); closeSheet();
toast(was ? 'Guardado ✦' : '¡Día cerrado! Ale te desea dulces sueños ✦ +1 estrellita'); A.render();
};
});
}
A.aleSummary = summary;
A.aleCard = () => {
const d = A.today(); const rec = (S.fin.dayLog || {})[d]; const h = new Date().getHours();
if (rec && rec.closed) return `<button class="card row" data-act="aleOpen" style="gap:12px;width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer"><img class="pixel" alt="" src="${Pix.sprite('pudin', 3)}" style="width:44px;height:44px"><div style="flex:1"><b>Día cerrado ${rec.mood ? A.DAY_MOODS[rec.mood].e : '✓'}</b><div class="faint">Ale guardó tu día. ¡Hasta mañana!</div></div></button>`;
if (h < 17) return '';
return `<button class="card row" data-act="aleOpen" style="gap:12px;width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer;background:#fff6c4;border-color:#f6e3a3"><img class="pixel" alt="" src="${Pix.sprite('pudin', 3)}" style="width:48px;height:48px"><div style="flex:1"><b>¿Cerramos el día?</b> ${A.px('moon', 18)}<div class="faint">Ale tiene tu resumen de hoy listo</div></div><span class="faint">›</span></button>`;
};
A.ACTIONS.aleOpen = () => summary();
const tipFn = A.ACTIONS.mascot;
A.ACTIONS.mascot = (a, e) => { if (new Date().getHours() >= 17) summary(); else tipFn(a, e); };
})();
;
(function () {
const A = App, S = A.S, { $, esc, toast } = A;
const ACC = {
lazo: { slot: 'head', name: 'Lazo rosa', price: 10, map: ['PP...PP', 'PwPRPwP', 'PPPRPPP', 'PP...PP'] },
fresa: { slot: 'head', name: 'Gorrito fresa', price: 15, map: ['..GGG..', '.RRRRR.', 'RRwRRwR', 'RRRRRRR'] },
boina: { slot: 'head', name: 'Boina', price: 15, map: ['...n....', '.RRRRRR.', 'RRRRRRRR', 'RwRRRRRR'] },
conejo: { slot: 'head', name: 'Orejitas de conejo', price: 20, map: ['.ww..ww.', '.wp..pw.', '.wp..pw.', '.wp..pw.', '.ww..ww.'], lift: -1 },
gato: { slot: 'head', name: 'Orejitas de gato', price: 20, map: ['C........C', 'CC......CC', 'CpC....CpC'] },
flores: { slot: 'head', name: 'Corona de flores', price: 25, map: ['PwP.yYy.PwP', 'GGGGGGGGGGG'] },
fiesta: { slot: 'head', name: 'Gorrito de fiesta', price: 25, map: ['..w..', '..P..', '.PbP.', '.bPb.', 'PbPbP', 'bPbPb'] },
chef: { slot: 'head', name: 'Gorro de chef', price: 30, map: ['.wwwww.', 'wwwwwww', 'wwwwwww', '.wwwww.', '.CCCCC.'] },
bruja: { slot: 'head', name: 'Sombrero de bruja', price: 35, map: ['...qq....', '...qqq...', '..qqqq...', '..qqqqq..', '.qqyqqq..', 'QQQQQQQQQ'] },
estrella: { slot: 'head', name: 'Pinza de estrella', price: 10, map: ['.y.', 'yYy', '.y.'], side: true },
aureola: { slot: 'head', name: 'Aureola', plus: true, map: ['..yyyy..', '.y....y.', '..yyyy..'], halo: true },
corona: { slot: 'head', name: 'Corona dorada', plus: true, map: ['y..y..y', 'yy.y.yy', 'yyyyyyy', 'YRYYYbY'] },
redondos: { slot: 'face', name: 'Lentes redondos', price: 15, map: ['bbb.bbb', 'bwbkbwb', 'bbb.bbb'] },
sol: { slot: 'face', name: 'Lentes de sol', price: 20, map: ['NNN.NNN', 'NwNkNwN', 'NNN.NNN'] },
corazones: { slot: 'face', name: 'Lentes de corazón', plus: true, map: ['PP.P.PP', 'PPPkPPP', '.P...P.'] },
monito: { slot: 'neck', name: 'Moñito', price: 10, map: ['BB.BB', 'BBVBB', 'BB.BB'] },
bufanda: { slot: 'neck', name: 'Bufanda', price: 20, map: ['RRRRRRRRRRRR', 'RwRwRwRwRwRw', '......RR....', '......Rw....'] },
perlas: { slot: 'neck', name: 'Collar de perlas', price: 25, map: ['w........w', '.w......w.', '..wwwwww..'] },
capa: { slot: 'neck', name: 'Pañuelo de lunares', plus: true, map: ['PPPPPPPPPP', '.PwPPPwPP.', '..PPwPPP..', '...PPPP...', '....PP....'] }
};
Object.entries(ACC).forEach(([id, a]) => {
a.w = a.map[0].length + 2; a.h = a.map.length + 2;
Pix.define('acc_' + id, { w: a.w, h: a.h, fn(p) { p.map(1, 1, a.map); } });
});
A.ACC = ACC;
const ANCH = {
gochi: { hx: 10, hy: 7.5, fy: 12.5, ny: 16.5, sprite: 'gochi', name: 'Gochi' },
yaki: { hx: 10, hy: 4, fy: 12.5, ny: 17, sprite: 'canela', name: 'Yaki' },
shey: { hx: 10, hy: 7.5, fy: 12.5, ny: 16.5, sprite: 'shey', name: 'Shey' },
ale: { hx: 10, hy: 3.5, fy: 11.5, ny: 16.8, sprite: 'pudin', name: 'Ale' }
};
const SLOTS = { head: 'Cabeza', face: 'Cara', neck: 'Cuello' };
const OLD = { lazo: 'lazo', flor: 'flores', fresa: 'fresa', estrella: 'estrella', lentes: 'sol', gorrito: 'fiesta', corona: 'corona', halo: 'aureola' };
function R() {
const r = S.settings.rincon = S.settings.rincon || { spent: 0, owned: [], equip: {}, bg: 'cielo', pets: 0, lastPet: '' };
r.equip = r.equip || {}; r.owned = r.owned || [];
let changed = false;
Object.keys(ANCH).forEach(c => { const v = r.equip[c]; if (v == null || typeof v === 'string') { r.equip[c] = { head: null, face: null, neck: null }; if (typeof v === 'string' && OLD[v]) { const n = OLD[v]; r.equip[c][ACC[n].slot] = n; } changed = true; } });
r.owned = r.owned.map(k => k.startsWith('acc:') && OLD[k.slice(4)] && !ACC[k.slice(4)] ? 'acc:' + OLD[k.slice(4)] : k);
if (changed) A.saveSettings();
return r;
}
const hasAcc = id => A.isPlus() || R().owned.includes('acc:' + id) || false;
const canUse = id => ACC[id] && (ACC[id].plus ? A.isPlus() : hasAcc(id));
A.canWearAle = () => A.isPlus();
function wear(cid, opts) {
const an = ANCH[cid]; const eq = (R().equip[cid]) || {}; const scale = (opts && opts.scale) || 5;
const useEq = cid === 'ale' ? (A.isPlus() ? eq : {}) : eq;
const layers = Object.values(SLOTS).length && ['neck', 'head', 'face'].map(slot => {
const id = useEq[slot]; const a = ACC[id]; if (!a || !canUse(id)) return '';
let left = an.hx - a.w / 2, top;
if (slot === 'head') { top = an.hy - a.h + 2 + (a.lift || 0); if (a.halo) top = an.hy - a.h - 1; if (a.side) { left = an.hx + 2; top = an.hy - 1; } }
else if (slot === 'face') top = an.fy - a.h / 2;
else top = an.ny - 1;
left += a.dx || 0; top += a.dy || 0;
return `<img class="pixel mz-acc" alt="" src="${Pix.sprite('acc_' + id, scale)}" style="left:${left / 20 * 100}%;top:${top / 20 * 100}%;width:${a.w / 20 * 100}%">`;
}).join('');
return `<span class="mz ${(opts && opts.cls) || ''}"><img class="pixel mz-base" alt="${an.name}" src="${Pix.sprite(an.sprite, scale)}">${layers}</span>`;
}
A.wear = wear; A.ANCH = ANCH; A.SLOTS = SLOTS;
A.PAGES.tienda = 'Tiendita';
Object.values(A.PACKS).forEach(p => { p.map.tienda = p.map.tienda || (p === A.PACKS.pixel ? 's:gift' : 'e:🛍️'); });
A.screens.tienda = () => {
const r = R(); const bal = A.rinconBalance ? A.rinconBalance() : 0;
const who = S.shopWho || (A.petActive && A.petActive()) || 'gochi'; const sec = S.shopSec || 'head';
const aleLocked = who === 'ale' && !A.isPlus();
const eq = r.equip[who] || {};
const tile = (id, a) => {
const owned = hasAcc(id) && !a.plus; const usable = canUse(id); const on = eq[a.slot] === id;
const lockTxt = a.plus ? (A.isPlus() ? '' : '<span class="lock">Meffy+</span>') : owned || A.isPlus() ? '' : `<span class="lock" style="background:#fff09a">${A.px('estrellita', 12)} ${a.price}</span>`;
return `<button class="shop-tile ${on ? 'on' : ''}" data-act="shopItem" data-id="${id}" ${aleLocked ? 'disabled' : ''}><img class="pixel" alt="" src="${Pix.sprite('acc_' + id, 4)}" style="width:${Math.min(64, a.w * 4)}px">${lockTxt}<span>${esc(a.name)}</span>${on ? '<em>Puesto ✓</em>' : usable ? '<em>Ponérselo</em>' : ''}</button>`;
};
return `${A.header('tienda', `<span class="pill sm" style="background:#fff09a;color:#6b4d12">${A.px('estrellita', 18)} ${bal}</span>`)}
<div class="seg" style="overflow-x:auto">${Object.entries(ANCH).filter(([k]) => !A.petOwns || A.petOwns(k) || k === who).map(([k, an]) => `<button data-act="shopWho" data-v="${k}" aria-pressed="${who === k}">${an.name}${k === 'ale' && !A.isPlus() ? ' ' + A.px('diamante', 14) : ''}</button>`).join('')}</div>
<div class="rc-scene probador" style="min-height:300px;align-items:center"><div class="pb-room">${App.probadorHTML ? App.probadorHTML() : ''}</div><span class="pb-sign">Probador</span>${Store.isOwner ? '<button class="pb-edit" data-act="probEdit">Decorar (solo tú)</button>' : ''}
<div class="rc-row pb-stage"><span class="pb-podium" aria-hidden="true"></span>${wear(who, { cls: 'big' })}</div>
<div class="rc-say">${aleLocked ? 'Ale se viste solo con Meffy+. Con Meffy+ además tienes todos los accesorios para todos.' : `Elige qué ponerle a ${ANCH[who].name}. Toca otra vez para quitárselo.`}</div>
</div>
${aleLocked ? '<button class="btn pink" data-go="plan" style="justify-content:center">Conoce Meffy+</button>' : ''}
<div class="seg">${Object.entries(SLOTS).map(([k, n]) => `<button data-act="shopSec" data-v="${k}" aria-pressed="${sec === k}">${n}</button>`).join('')}<button data-act="shopSec" data-v="mas" aria-pressed="${sec === 'mas'}">Más cositas</button></div>
${sec === 'mas' ? (A.rcExtrasHTML ? A.rcExtrasHTML(bal) : '') : `<div class="shop-grid">${Object.entries(ACC).filter(([, a]) => a.slot === sec && !a.off).map(([id, a]) => tile(id, a)).join('')}</div>`}
<p class="faint" style="margin:0">Gana estrellitas anotando tus gastos, resistiendo antojos con tu mascota y cerrando el día con Ale. Las cosas marcadas con Meffy+ vienen incluidas en el plan.</p>`;
};
const ACT = A.ACTIONS;
ACT.shopWho = a => { S.shopWho = a.dataset.v; A.render(); };
ACT.shopSec = a => { S.shopSec = a.dataset.v; A.render(); };
ACT.shopItem = a => {
const id = a.dataset.id, it = ACC[id], r = R(), who = S.shopWho || (A.petActive && A.petActive()) || 'gochi';
if (who === 'ale' && !A.isPlus()) return;
if (canUse(id)) {
const eq = r.equip[who]; eq[it.slot] = eq[it.slot] === id ? null : id; A.saveSettings();
if (A.pixelHearts && eq[it.slot]) setTimeout(() => A.pixelHearts(document.querySelector('.mz.big')), 60);
A.render(); return;
}
if (it.plus) { A.go('plan'); return; }
const bal = A.rinconBalance ? A.rinconBalance() : 0;
if (bal < it.price) return toast(`Te faltan ${it.price - bal} estrellitas. ¡Sigue anotando!`);
if (!a.dataset.sure) { a.dataset.sure = 1; a.querySelector('span:last-of-type').textContent = `¿Comprar por ${it.price}?`; return; }
r.spent = (r.spent || 0) + it.price; r.owned.push('acc:' + id); r.equip[who][it.slot] = id; A.saveSettings();
toast(`¡${it.name} para ${ANCH[who].name}! ✦`); A.render();
if (A.pixelHearts) setTimeout(() => A.pixelHearts(document.querySelector('.mz.big')), 60);
};
})();
;
(function () {
const A = App, S = A.S, { $, $$, esc, money, toast } = A;
const DEFAULTS = () => ({
plan: { monthly: 3.99, annual: 29.99, bonusMonthly: 150, bonusAnnual: 2000, promo: 'Primer mes a mitad de precio', contact: '+593987157616' },
rewards: { day: 2, goalTx: 3, journalWeek: 5, goalDone: 15, monthUnder: 20, antojo: 5, closeDay: 1, pet: 1 },
shop: {}, bgs: {}, unlocks: {}, ach: {},
phrases: [
'Cada día que anotas es un paso hacia tus sueños. Ale está orgulloso de ti ✦',
'Descansa bonito. Mañana es una página nueva de tu journal ✦',
'No tienes que ser perfecta, solo constante. ¡Lo estás haciendo muy bien!',
'Tu yo del futuro te va a agradecer lo de hoy ✦',
'Un día a la vez, un pesito a la vez ✦',
'Hoy cuidaste tu dinerito y también a ti. Eso vale mucho.',
'Gracias por contarme tu día. ¡Hasta mañana!'
],
news: { on: false, id: '', title: 'Novedades', text: '' },
freeThemes: ['manzanita', 'algodon', 'fresanoche']
});
const merge = (d, o) => { if (!o) return d; Object.keys(o).forEach(k => { d[k] = (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) && d[k] && typeof d[k] === 'object' && !Array.isArray(d[k])) ? merge(d[k], o[k]) : o[k]; }); return d; };
A.CFG = DEFAULTS();
let ORIG = null;
function snapshotOriginals() {
if (ORIG) return;
ORIG = { acc: {}, bgs: {}, unlocks: {}, ach: {} };
Object.entries(A.ACC || {}).forEach(([k, a]) => ORIG.acc[k] = { name: a.name, price: a.price, plus: !!a.plus });
Object.entries(A.RC.BGS).forEach(([k, b]) => ORIG.bgs[k] = b.price);
Object.entries(A.RC.UNLOCKS).forEach(([k, u]) => ORIG.unlocks[k] = u.price);
A.RC.ACH.forEach(a => ORIG.ach[a.id] = a.prize);
Object.entries(A.THEMES).forEach(([k, t]) => ORIG['t_' + k] = !!t.free);
}
function apply() {
snapshotOriginals();
const C = A.CFG;
Object.entries(A.ACC || {}).forEach(([k, a]) => { const o = Object.assign({}, ORIG.acc[k], C.shop[k] || {}); a.name = o.name; a.price = o.price; a.plus = !!o.plus; a.off = !!o.off; });
Object.entries(A.RC.BGS).forEach(([k, b]) => { b.price = C.bgs[k] != null ? C.bgs[k] : ORIG.bgs[k]; });
Object.entries(A.RC.UNLOCKS).forEach(([k, u]) => { u.price = C.unlocks[k] != null ? C.unlocks[k] : ORIG.unlocks[k]; });
A.RC.ACH.forEach(a => { a.prize = C.ach[a.id] != null ? C.ach[a.id] : ORIG.ach[a.id]; });
Object.entries(A.THEMES).forEach(([k, t]) => { t.free = (C.freeThemes || []).includes(k); });
}
A.applyConfig = apply;
function grantMonthly() {
if (!A.isPlus()) return;
const r = S.settings.rincon = S.settings.rincon || { spent: 0, owned: [], equip: {} };
const k = A.ym(A.today());
if (S.settings.planType === 'mensual' && S.settings.planGrant !== k) {
r.bonus = (r.bonus || 0) + (+A.CFG.plan.bonusMonthly || 0); S.settings.planGrant = k; A.saveSettings();
toast(`Meffy+ te regaló ${A.CFG.plan.bonusMonthly} estrellitas este mes ✦`);
}
}
A.screens.plan = () => {
const on = A.isPlus(); const P = A.CFG.plan; const type = S.settings.planType;
const st = n => `<b>${n.toLocaleString('es-EC')}</b> ${A.px('estrellita', 16)}`;
const nFree = Object.values(A.THEMES).filter(t => t.free).length;
const rows = [['Movimientos, billetera, presupuestos y metas', 1, 1], ['Resumen del mes y del año', 1, 1], ['Journal decorable con todas las herramientas', 1, 1], ['Mascotas, logros y Tiendita', 1, 1], ['Antojos y emociones con Shey', 1, 1], ['Cierre del día con Ale', 1, 1], ['Exportar e importar tus datos', 1, 1],
[`${nFree} temas de color`, 1, 1], [`Los ${Object.keys(A.THEMES).length} temas de color`, 0, 1], ['Todas las letras', 0, 1], ['Packs de iconos de colores', 0, 1], ['Subir tus propios iconos y banners', 0, 1], ['Vestir a Ale con accesorios', 0, 1], ['Todos los accesorios para las mascotas', 0, 1], ['Accesorios exclusivos', 0, 1], ['Estrellitas de regalo', 0, 1]];
const card = (k, name, price, per, bonus, bonusTxt) => `<div class="card stack" style="${type === k && on ? 'border-color:var(--accent);background:var(--pill)' : ''}">
<div class="row between"><b class="mid">${name}</b>${type === k && on ? '<span class="tag gold">TU PLAN</span>' : k === 'anual' ? '<span class="tag gold">AHORRAS ' + Math.max(0, Math.round((1 - P.annual / (P.monthly * 12)) * 100)) + '%</span>' : ''}</div>
<div><span class="big">${money(price)}</span> <span class="muted">${per}</span></div>
<div class="row" style="gap:6px">${A.px('gift', 22)}<span>${bonusTxt.replace('{n}', st(bonus))}</span></div>
${Store.mode === 'supa' ? (on && type === k ? '' : `<button class="btn ${k === 'anual' ? 'pink' : 'primary'}" data-act="planAsk" data-t="${k}" style="justify-content:center">Quiero el plan ${name.toLowerCase()}</button>`) : on && type === k ? '<button class="btn" data-act="planOff">Volver al plan gratis</button>' : `<button class="btn ${k === 'anual' ? 'pink' : 'primary'}" data-act="planOn" data-t="${k}" style="justify-content:center">${on ? 'Cambiar a este plan' : 'Elegir ' + name.toLowerCase()}</button>`}
</div>`;
return `${A.header('plan')}
<div class="plan-hero"><img class="pixel" alt="" src="${Pix.sprite('pudin', 5)}" style="width:96px;height:96px;float:right;margin-left:10px"><span class="tag gold">${on ? 'ACTIVO' : esc(P.promo || '').toUpperCase()}</span><h2>Meffy+ ✦</h2><p style="margin:0">Todo lo útil es gratis. Meffy+ es para que tu app se vea exactamente como tú quieres, y te regala estrellitas para la Tiendita.</p></div>
${card('mensual', 'Mensual', P.monthly, 'al mes', +P.bonusMonthly, '{n} estrellitas de regalo cada mes')}
${card('anual', 'Anual', P.annual, 'al año', +P.bonusAnnual, '{n} estrellitas de regalo al activarlo')}
<p class="faint" style="margin:0">${Store.mode === 'supa' ? 'Por ahora Meffy+ se activa con la administradora: le escribes, pagas por transferencia o como acuerden, y ella lo activa en tu cuenta.' : 'Versión de prueba: aquí todavía no se cobra nada. El cobro real se activa cuando la app se publique con pagos.'}</p>
<div class="card" style="overflow-x:auto"><table class="cmp"><thead><tr><th style="text-align:left">QUÉ INCLUYE</th><th>GRATIS</th><th>MEFFY+</th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(r[0])}</td><td>${r[1] ? '✓' : ''}</td><td>${r[2] ? '✦' : ''}</td></tr>`).join('')}</tbody></table></div>`;
};
A.ACTIONS.planOn = a => {
const t = a.dataset.t || 'mensual'; const r = S.settings.rincon = S.settings.rincon || { spent: 0, owned: [], equip: {} };
const wasType = S.settings.planType; const wasOn = A.isPlus();
S.settings.plan = 'plus'; S.settings.planType = t; S.settings.planSince = A.today();
let gift = 0;
if (t === 'anual' && !(wasOn && wasType === 'anual')) { gift = +A.CFG.plan.bonusAnnual || 0; }
if (t === 'mensual' && S.settings.planGrant !== A.ym(A.today())) { gift = +A.CFG.plan.bonusMonthly || 0; S.settings.planGrant = A.ym(A.today()); }
r.bonus = (r.bonus || 0) + gift; A.saveSettings();
toast(gift ? `¡Meffy+ activado! Te regalamos ${gift} estrellitas ✦` : '¡Listo! Cambiaste de plan ✦'); A.render();
};
A.ACTIONS.planAsk = a => {
const t = a.dataset.t; const P = A.CFG.plan; const wa = String(P.contact || '').replace(/\D/g, '');
const msg = encodeURIComponent(`Hola, quiero activar Meffy+ ${t} en mi cuenta ${Store.profile ? Store.profile.phone : ''}`);
A.openSheet('Activar Meffy+ ' + t, `<div class="stack"><p style="margin:0">Escríbele a la administradora para activar tu plan ${t} (${money(t === 'anual' ? P.annual : P.monthly)}). Cuando lo active, verás Meffy+ y tus estrellitas de regalo.</p>
${wa ? `<a class="btn pink" href="https://wa.me/${wa}?text=${msg}" target="_blank" rel="noopener" style="justify-content:center;text-decoration:none">Escribir por WhatsApp</a><p class="faint" style="margin:0;text-align:center">Número: <b style="user-select:all">${esc(P.contact)}</b></p>` : '<p class="faint" style="margin:0">La administradora todavía no puso su contacto.</p>'}
<p class="faint" style="margin:0">Tu número de cuenta: <b style="user-select:all">${esc(Store.profile ? Store.profile.phone : '')}</b></p></div>`);
};
A.ACTIONS.planOff = () => { S.settings.plan = 'free'; A.saveSettings(); A.render(); };
A.newsCard = () => {
const n = A.CFG.news; if (!n || !n.on || !n.text || S.settings.newsSeen === n.id) return '';
return `<div class="card" style="position:relative;padding-right:46px"><b class="mid" style="display:block;font-size:18px">${esc(n.title || 'Novedades')}</b><p style="margin:6px 0 0;white-space:pre-wrap">${esc(n.text)}</p><button class="iconbtn" data-act="newsClose" aria-label="Cerrar novedades" style="position:absolute;right:10px;top:10px;width:32px;height:32px">✕</button></div>`;
};
A.ACTIONS.newsClose = () => { S.settings.newsSeen = A.CFG.news.id; A.saveSettings(); A.render(); };
A.PAGES.admin = 'Admin';
Object.values(A.PACKS).forEach(p => { p.map.admin = 's:gear' + (p.map.home.includes('~') ? '~' + p.map.home.split('~')[1] : ''); });
let draft = null;
const num = (id, v, step) => `<input class="in num" data-cf="${id}" type="number" inputmode="decimal" step="${step || 1}" value="${v}" style="max-width:120px">`;
const row = (label, input) => `<div class="setrow"><span>${label}</span>${input}</div>`;
A.screens.admin = () => {
if (!Store.isOwner) return `${A.header('admin')}<div class="card empty">Esta sección es solo para la dueña de la app.</div>`;
snapshotOriginals();
draft = draft || JSON.parse(JSON.stringify(A.CFG));
const D = draft; const R = D.rewards; const P = D.plan;
const accRow = (k, a) => { const o = Object.assign({}, ORIG.acc[k], D.shop[k] || {}); return `<div class="setrow" style="flex-wrap:wrap"><span class="row" style="gap:8px;min-width:0;flex:1 1 160px"><img class="pixel" alt="" src="${Pix.sprite('acc_' + k, 3)}" style="width:${Math.min(40, a.w * 3)}px"><input class="in" data-cf="shop.${k}.name" value="${esc(o.name)}" style="min-width:0"></span><span class="row" style="gap:6px">${A.px('estrellita', 16)}${num('shop.' + k + '.price', o.price || 0)}<label class="chip"><input type="checkbox" data-cf="shop.${k}.plus" ${o.plus ? 'checked' : ''}> Meffy+</label><label class="chip"><input type="checkbox" data-cf="shop.${k}.off" ${o.off ? 'checked' : ''}> Oculto</label></span></div>`; };
return `${A.header('admin', '<span class="tag gold">Solo tú</span>')}
<div class="card"><b>Panel de admin</b><p class="muted" style="margin:6px 0 0">Aquí manejas a tus usuarias y cambias precios, estrellitas, la Tiendita, los logros, las frases de Ale y las novedades.</p></div>
${Store.mode === 'supa' ? usersHTML() : ''}
<details class="card" open><summary><b>Meffy+</b></summary>
${row('Precio mensual ($)', num('plan.monthly', P.monthly, .01))}${row('Precio anual ($)', num('plan.annual', P.annual, .01))}
${row('Estrellitas de regalo cada mes (mensual)', num('plan.bonusMonthly', P.bonusMonthly))}${row('Estrellitas de regalo al activar (anual)', num('plan.bonusAnnual', P.bonusAnnual))}
<label class="f">Etiqueta de promoción<input class="in" data-cf="plan.promo" value="${esc(P.promo || '')}"></label>
<label class="f">Tu WhatsApp de contacto (para Meffy+ y contraseñas olvidadas)<input class="in" data-cf="plan.contact" value="${esc(P.contact || '')}" placeholder="Ej. 0991234567"></label></details>
<details class="card"><summary><b>Estrellitas por acción</b></summary>
${[['day', 'Anotar en el día'], ['goalTx', 'Poner dinero en una meta'], ['journalWeek', 'Decorar una semana del journal'], ['goalDone', 'Cumplir una meta'], ['monthUnder', 'Mes sin pasarse'], ['antojo', 'Resistir un antojo'], ['closeDay', 'Cerrar el día con Ale'], ['pet', 'Dar cariño a la mascota']].map(([k, l]) => row(l, num('rewards.' + k, R[k]))).join('')}</details>
<details class="card"><summary><b>Tiendita: accesorios</b></summary><p class="faint">Cambia nombre y precio. "Meffy+" lo vuelve exclusivo del plan; "Oculto" lo quita de la Tiendita.</p>${Object.entries(A.ACC).map(([k, a]) => accRow(k, a)).join('')}</details>
<details class="card"><summary><b>Tiendita: fondos y journal</b></summary>
${Object.keys(A.RC.BGS).map(k => row(`Fondo “${esc((Pix.BANNERS[k] || {}).name || k)}”`, num('bgs.' + k, D.bgs[k] != null ? D.bgs[k] : ORIG.bgs[k]))).join('')}
${Object.entries(A.RC.UNLOCKS).map(([k, u]) => row(esc(u.name), num('unlocks.' + k, D.unlocks[k] != null ? D.unlocks[k] : ORIG.unlocks[k]))).join('')}</details>
<details class="card"><summary><b>Logros</b></summary>${A.RC.ACH.map(a => row(`${A.px(a.ic, 18)} ${esc(a.name)}`, num('ach.' + a.id, D.ach[a.id] != null ? D.ach[a.id] : ORIG.ach[a.id]))).join('')}</details>
<details class="card"><summary><b>Temas gratis</b></summary><div class="chips">${Object.entries(A.THEMES).map(([k, t]) => `<label class="chip"><input type="checkbox" data-theme-free="${k}" ${(D.freeThemes || []).includes(k) ? 'checked' : ''}> ${esc(t.name)}</label>`).join('')}</div></details>
<details class="card"><summary><b>Frases de Ale</b></summary><p class="faint">Una frase por línea. Ale elige una cada noche.</p><textarea class="in" data-cf-lines="phrases" style="min-height:160px">${esc((D.phrases || []).join('\n'))}</textarea></details>
<details class="card"><summary><b>Novedades en Inicio</b></summary>
<div class="setrow"><span>Mostrar tarjeta de novedades</span><span class="toggle"><input type="checkbox" data-cf="news.on" ${D.news.on ? 'checked' : ''}><span></span></span></div>
<label class="f">Título<input class="in" data-cf="news.title" value="${esc(D.news.title || '')}"></label>
<label class="f">Texto<textarea class="in" data-cf="news.text">${esc(D.news.text || '')}</textarea></label></details>
<div class="row" style="position:sticky;bottom:calc(86px + env(safe-area-inset-bottom, 0px));z-index:5"><button class="btn" data-act="cfgReset">Restablecer todo</button><button class="btn pink" data-act="cfgSave" style="flex:1;justify-content:center">Guardar cambios</button></div>`;
};
let USERS = null, uq = '', loadingUsers = false;
function loadUsers() {
if (loadingUsers) return; loadingUsers = true;
Store.adminCall({ action: 'list' }).then(d => { USERS = d.users || []; }).catch(e => { USERS = []; toast(e.message); }).finally(() => { loadingUsers = false; if (S.route === 'admin') A.render(); });
}
const ago = s => { if (!s) return 'nunca'; const d = Math.floor((Date.now() - new Date(s)) / 864e5); return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : 'hace ' + d + ' días'; };
const fmtPhone = p => p && p.startsWith('593') ? '0' + p.slice(3) : p;
function usersHTML() {
if (!USERS) { loadUsers(); return '<details class="card" open><summary><b>Usuarias</b></summary><div class="empty">Cargando…</div></details>'; }
const q = uq.toLowerCase(); const list = USERS.filter(u => !q || (u.name || '').toLowerCase().includes(q) || (u.phone || '').includes(q.replace(/\D/g, '')) || fmtPhone(u.phone).includes(q));
const plus = USERS.filter(u => u.plan === 'plus').length; const week = USERS.filter(u => u.last_sign_in && Date.now() - new Date(u.last_sign_in) < 7 * 864e5).length;
return `<details class="card" open><summary><b>Usuarias (${USERS.length})</b></summary>
<div class="grid2" style="margin-bottom:10px"><div class="card flat"><h3>Con Meffy+</h3><div class="mid">${plus}</div></div><div class="card flat"><h3>Activas esta semana</h3><div class="mid">${week}</div></div></div>
<div class="row" style="margin-bottom:8px"><input class="in" id="uSearch" placeholder="Buscar por nombre o número" value="${esc(uq)}" type="search"><button class="btn sm" data-act="usersReload">Actualizar</button></div>
<div class="list">${list.map(u => `<button class="li" data-act="userOpen" data-id="${u.id}" style="${u.blocked ? 'opacity:.55' : ''}"><span class="ic">${A.px(u.role === 'admin' ? 'gem' : u.plan === 'plus' ? 'pudin' : 'gochi', 28)}</span><span class="tx-main"><b>${esc(u.name || 'Sin nombre')}</b><span>${esc(fmtPhone(u.phone))} · entró ${ago(u.last_sign_in)}${u.blocked ? ' · pausada' : ''}</span></span><span class="tag ${u.plan === 'plus' ? 'gold' : ''}">${u.plan === 'plus' ? 'Meffy+ ' + (u.plan_type || '') : 'Gratis'}</span></button>`).join('') || '<div class="empty">Nadie con ese nombre o número.</div>'}</div></details>`;
}
A.ACTIONS.usersReload = () => { USERS = null; A.render(); };
A.ACTIONS.userOpen = a => {
const u = USERS.find(x => x.id === a.dataset.id); if (!u) return; const self = u.id === Store.uid;
A.openSheet(u.name || fmtPhone(u.phone), `<div class="stack">
<div class="card flat"><div class="row between"><span>Número</span><b style="user-select:all">${esc(fmtPhone(u.phone))}</b></div><div class="row between"><span>Se unió</span><b>${new Date(u.created_at).toLocaleDateString('es-EC')}</b></div><div class="row between"><span>Último ingreso</span><b>${ago(u.last_sign_in)}</b></div><div class="row between"><span>Rol</span><b>${u.role === 'admin' ? 'Administradora' : 'Usuaria'}</b></div></div>
<label class="f">Nombre<input class="in" id="usName" value="${esc(u.name || '')}"></label><button class="btn sm" data-u="name" style="align-self:flex-start">Guardar nombre</button>
<div class="card flat stack"><b>¿Olvidó su contraseña?</b><p class="faint" style="margin:0">Por seguridad nadie puede ver las contraseñas, ni siquiera tú. Ponle una nueva, pásasela y que la cambie en su perfil.</p>
<div class="row"><input class="in" id="usPw" placeholder="Nueva contraseña (mín. 6)" autocomplete="off"><button class="btn pink sm" data-u="pw">Cambiar</button></div></div>
<div class="f">Meffy+<div class="seg" style="margin-top:4px"><button data-u="plan" data-v="free" aria-pressed="${u.plan !== 'plus'}">Gratis</button><button data-u="plan" data-v="mensual" aria-pressed="${u.plan === 'plus' && u.plan_type === 'mensual'}">Mensual</button><button data-u="plan" data-v="anual" aria-pressed="${u.plan === 'plus' && u.plan_type === 'anual'}">Anual</button></div></div>
${self ? '' : `<div class="row" style="flex-wrap:wrap"><button class="btn sm" data-u="role">${u.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}</button><button class="btn sm" data-u="block">${u.blocked ? 'Reactivar cuenta' : 'Pausar cuenta'}</button><button class="btn danger sm" data-u="del">Borrar cuenta</button></div>`}
</div>`, sh => sh.addEventListener('click', async e => {
const b = e.target.closest('[data-u]'); if (!b) return; const k = b.dataset.u;
try {
if (k === 'name') { await Store.adminCall({ action: 'set_name', id: u.id, name: sh.querySelector('#usName').value }); u.name = sh.querySelector('#usName').value; toast('Nombre guardado'); }
if (k === 'pw') { const pw = sh.querySelector('#usPw').value.trim(); if (pw.length < 6) return toast('Mínimo 6 caracteres'); await Store.adminCall({ action: 'set_password', id: u.id, password: pw }); toast('Contraseña cambiada. Pásasela a ' + (u.name || 'ella')); sh.querySelector('#usPw').value = ''; return; }
if (k === 'plan') { const v = b.dataset.v; await Store.adminCall({ action: 'set_plan', id: u.id, plan: v === 'free' ? 'free' : 'plus', plan_type: v }); u.plan = v === 'free' ? 'free' : 'plus'; u.plan_type = v === 'free' ? null : v; toast(v === 'free' ? 'Ahora tiene el plan gratis' : 'Meffy+ ' + v + ' activado ✦'); }
if (k === 'role') { await Store.adminCall({ action: 'set_role', id: u.id, role: u.role === 'admin' ? 'user' : 'admin' }); u.role = u.role === 'admin' ? 'user' : 'admin'; toast('Listo'); }
if (k === 'block') { await Store.adminCall({ action: 'block', id: u.id, blocked: !u.blocked }); u.blocked = !u.blocked; toast(u.blocked ? 'Cuenta pausada' : 'Cuenta reactivada'); }
if (k === 'del') { if (!b.dataset.s) { b.dataset.s = 1; b.textContent = '¿Segura? Se borra todo. Toca otra vez'; return; } await Store.adminCall({ action: 'delete', id: u.id }); USERS = USERS.filter(x => x.id !== u.id); toast('Cuenta borrada'); }
A.closeSheet(); A.render();
} catch (err) { toast(err.message); }
}));
};
A.after.admin = el => {
const us = el.querySelector('#uSearch'); if (us) us.oninput = e => { uq = e.target.value; const pos = e.target.selectionStart; A.render(); const n = document.getElementById('uSearch'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } };
el.addEventListener('input', e => {
const t = e.target;
if (t.dataset.cf) {
const path = t.dataset.cf.split('.'); let o = draft; for (let i = 0; i < path.length - 1; i++) o = o[path[i]] = o[path[i]] || {};
const k = path[path.length - 1];
o[k] = t.type === 'checkbox' ? t.checked : t.type === 'number' ? (t.value === '' ? 0 : +t.value) : t.value;
}
if (t.dataset.cfLines) draft[t.dataset.cfLines] = t.value.split('\n').map(x => x.trim()).filter(Boolean);
if (t.dataset.themeFree) { const set = new Set(draft.freeThemes || []); t.checked ? set.add(t.dataset.themeFree) : set.delete(t.dataset.themeFree); draft.freeThemes = [...set]; }
});
};
A.ACTIONS.cfgSave = async () => {
const before = JSON.stringify(A.CFG.news);
if (JSON.stringify(draft.news) !== before) draft.news.id = Date.now().toString(36);
['catalog', 'probador', 'look'].forEach(k => { if (A.CFG[k] !== undefined) draft[k] = JSON.parse(JSON.stringify(A.CFG[k])); });
A.CFG = merge(DEFAULTS(), draft); apply();
try { await Store.saveConfig(A.CFG); toast('Cambios guardados ✦'); } catch (e) { toast('No se pudo guardar. Revisa tu conexión.'); }
draft = null; A.render();
};
A.ACTIONS.cfgReset = a => { if (!a.dataset.s) { a.dataset.s = 1; a.textContent = '¿Segura? Toca otra vez'; return; } draft = DEFAULTS(); toast('Valores originales cargados. Toca Guardar para aplicarlos.'); A.render(); };
const start = A.start;
A.start = async () => {
await start();
A.CFG = merge(DEFAULTS(), Store.config); apply();
if (Store.mode === 'supa' && Store.profile) {
const pr = Store.profile; S.settings.plan = pr.plan; S.settings.planType = pr.plan_type || null;
if (!S.settings.name && pr.name) S.settings.name = pr.name;
const r = S.settings.rincon = S.settings.rincon || { spent: 0, owned: [], equip: {} };
if (pr.plan === 'plus' && pr.plan_type === 'anual' && S.settings.annualGift !== pr.plan_since) { r.bonus = (r.bonus || 0) + (+A.CFG.plan.bonusAnnual || 0); S.settings.annualGift = pr.plan_since; toast(`¡Bienvenida a Meffy+! Te regalamos ${A.CFG.plan.bonusAnnual} estrellitas ✦`); }
A.saveSettings();
}
grantMonthly(); A.renderNav(); A.render();
};
})();
;
(function () {
const A = App, S = A.S, { $, $$, esc, money, uid, pad, ymd, addDays, parseYmd } = A;
const PW = 380, PH = 580; // logical page size
const PENS = [
{ id: 'fino', name: 'Lápiz fino', w: 1, alpha: 1 },
{ id: 'gel', name: 'Bolígrafo de gel', w: 1.6, alpha: 1 },
{ id: 'marcador', name: 'Marcador', w: 3, alpha: 1 },
{ id: 'resaltador', name: 'Resaltador', w: 7, alpha: .35, cap: 'butt' }
];
const INKS = ['#3a2f3b', '#c0533f', '#3a6aa8', '#4a8a5c', '#8a55b0', '#d49a1c', '#e2648f', '#7fb8e8', '#ffffff'];
const WIDTHS = [1, 2, 3.5, 6];
const WASHI = {
rosa: { name: 'Rosa a rayas', free: true, css: 'repeating-linear-gradient(90deg,#ffc2dc 0 8px,#ffe0ec 8px 16px)' },
rasgado: { name: 'Rosa rasgado', free: true, torn: true, css: 'repeating-linear-gradient(90deg,#ffb3cf 0 6px,#ffd1e2 6px 12px)' },
celeste: { name: 'Celeste a cuadros', free: true, css: 'linear-gradient(90deg,rgba(120,174,240,.45) 50%,transparent 0) 0 0/12px 12px,linear-gradient(rgba(120,174,240,.45) 50%,#e3f0ff 0) 0 0/12px 12px' },
dorado: { name: 'Dorado', free: true, css: 'linear-gradient(180deg,#f6d77d,#e8b84a 55%,#f3cf6c)' },
sakura: { name: 'Sakura', free: true, css: 'radial-gradient(circle at 6px 6px,#ff8fb8 2px,transparent 3px) 0 0/16px 14px,radial-gradient(circle at 13px 10px,#fff 1.5px,transparent 2.5px) 0 0/16px 14px,#ffd6e6' },
lavanda: { name: 'Hoja a rayas', free: true, css: 'repeating-linear-gradient(135deg,#cfe8a6 0 6px,#eef7df 6px 12px)' },
lunares: { name: 'Lunares rosas', free: true, css: 'radial-gradient(circle,#fff 2.5px,transparent 3px) 0 0/12px 12px,#f7a8c2' },
estrellas: { name: 'Noche estrellada', css: 'radial-gradient(circle at 4px 4px,#ffe08a 1.5px,transparent 2px) 0 0/14px 12px,radial-gradient(circle at 10px 9px,#fff 1px,transparent 1.6px) 0 0/14px 12px,#3d3a8c' },
menta: { name: 'Menta cuadrícula', css: 'linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px) 0 0/8px 8px,linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px) 0 0/8px 8px,#9fdcc4' },
arcoiris: { name: 'Arcoíris pastel', css: 'linear-gradient(180deg,#ffc2dc 0 20%,#ffe0b3 20% 40%,#fff3a8 40% 60%,#c4ecd3 60% 80%,#c9dcff 80%)' },
durazno: { name: 'Durazno con corazones', css: 'radial-gradient(circle at 5px 6px,#ff9fb0 2px,transparent 2.6px) 0 0/14px 12px,#ffe0cf' },
kraft: { name: 'Kraft', css: 'repeating-linear-gradient(90deg,rgba(0,0,0,.04) 0 2px,transparent 2px 5px),#d9b98e' }
};
const STICKY = ['#fff1a8', '#ffd9bf', '#ffd1e3', '#e2d7ff', '#d3e8ff', '#d2f0dc'];
const PAPER = ['#fffaf3', '#ffffff', '#fff0f5', '#f3efff', '#eef6ff', '#effaf3', '#fff7e0', '#2b2742'];
const SHAPES = ['triángulo', 'círculo', 'estrella', 'cuadrado', 'corazón', 'nube', 'línea', 'línea punteada'];
const TPLS = {
semana: 'Semana con gastos', lista: 'Lista de pendientes', gastos: 'Gastos de la semana', mes: 'Calendario del mes',
habitos: 'Hábitos de la semana', ahorro: 'Reto de ahorro 100', deseos: 'Lista de deseos', libre: 'Hoja libre'
};
const MOODS = ['', 'f_feliz', 'f_tranquila', 'f_emocionada', 'f_aburrida', 'f_cansada', 'f_triste', 'f_estresada'];
const pxi = (n, s) => `<img class="pixel" alt="" src="${Pix.sprite(n, 3)}" style="width:${s || 22}px;height:${s || 22}px;vertical-align:middle" draggable="false">`;
const J = { key: null, doc: null, page: 0, tool: null, pen: { id: 'gel', color: INKS[0], w: 2 }, sel: null, editing: null, hist: [], fut: [], lock: false, night: false, scale: 1, pagesShown: 1 };
function weekKey(d) { const w = A.isoWeek(d); return w.y + '-W' + pad(w.w); }
function weekDates(key) { // Monday of ISO week
if (key.startsWith('sh-')) key = weekKey(new Date());
const [y, w] = key.split('-W').map(Number); const jan4 = new Date(y, 0, 4); const mon = addDays(jan4, -A.dowIdx(jan4) + (w - 1) * 7);
return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}
function blankPage(tpl, grid) { return { id: uid(), tpl, bg: '#fffaf3', grid: grid || (tpl === 'semana' ? 'lisa' : 'cuadros'), gridColor: '#e6ddd2', gs: 16, els: [], strokes: [], days: {} }; }
function loadWeek(key) {
J.key = key; const d = key.startsWith('sh-') ? (window.Shared && Shared.doc(key)) : Store.get('jr-' + key);
J.doc = d ? JSON.parse(JSON.stringify(d)) : key.startsWith('sh-') ? { pages: [blankPage('libre', 'cuadros')] } : { pages: [blankPage('semana'), blankPage('libre', 'cuadros')] };
J.hist = []; J.fut = []; J.sel = null; J.editing = null;
if (J.page >= J.doc.pages.length) J.page = 0;
}
function persist() { if (J.key.startsWith('sh-')) { window.Shared && Shared.save(J.key, J.doc); return; } Store.put('jr-' + J.key, J.doc); }
function snapshot() { J.hist.push(JSON.stringify(J.doc)); if (J.hist.length > 60) J.hist.shift(); J.fut = []; updateUndo(); }
function commit() { persist(); updateUndo(); }
function undo() { if (!J.hist.length) return; J.fut.push(JSON.stringify(J.doc)); J.doc = JSON.parse(J.hist.pop()); J.sel = null; persist(); draw(); }
function redo() { if (!J.fut.length) return; J.hist.push(JSON.stringify(J.doc)); J.doc = JSON.parse(J.fut.pop()); J.sel = null; persist(); draw(); }
function updateUndo() { const u = $('#tbUndo'), r = $('#tbRedo'); if (u) u.disabled = !J.hist.length; if (r) r.disabled = !J.fut.length; }
let root = null;
function render(el) {
root = el;
if (!J.key) { J.key = weekKey(new Date()); }
loadWeek(J.key);
const tools = [
['view', 'ui_ojo', 'Solo ver', 'c1'], ['text', 'ui_texto', 'Texto', 'c2'], ['pen', 'ui_lapiz', 'Lápices', 'c3'], ['eraser', 'ui_borrador', 'Borrador', 'c4'], ['habits', 'f_feliz', 'Hábitos', 'c5'], ['shapes', 'ui_formas', 'Formas', 'c6'],
['images', 'pic', 'Imágenes', 'c2'], ['sticky', 'ui_nota', 'Notas adhesivas', 'c3'], ['washi', 'ui_washi', 'Washi', 'c6'], ['symbols', 'heart', 'Símbolos', 'c5'], ['stickers', 'star', 'Stickers', 'c7'],
['paper', 'ui_pagina', 'Página', 'c1'], ['templates', 'ui_plantilla', 'Plantillas', 'c4'], ['pages', 'ui_paginas', 'Páginas', 'c6'], ['marks', 'ui_marcador', 'Marcadores', 'c5']
];
tools.splice(5, 0, ['blocks', 'check', 'Casillas, estrellitas y tiempo', 'c3']);
J.tools = tools; const hidden = S.settings.jrHide || [];
el.innerHTML = `
<div class="jr-top">
<div class="ph-left"><span class="pill">Mi journal</span><button class="ph-icon" data-act="pageicon" data-k="journal" aria-label="Cambiar icono">${A.iconHTML(A.pageIcon('journal'), 34)}</button></div>
<div class="row" style="gap:6px"><button class="navarrow" id="jSpread" aria-label="Ver las dos páginas completas" title="Ver completo">${pxi('ui_paginas', 20)}</button><button class="navarrow" id="jPrev" aria-label="Semana anterior">‹</button><button class="btn sm" id="jWeek"></button><button class="navarrow" id="jNext" aria-label="Semana siguiente">›</button></div>
</div>
<div class="toolbar" role="toolbar" aria-label="Herramientas del diario">
${tools.filter(([id]) => !hidden.includes(id)).map(([id, ic, lbl, c]) => `<button class="tb ${c}" data-tool="${id}" aria-label="${lbl}" title="${lbl}" aria-pressed="false">${pxi(ic, 24)}</button>`).join('')}
<span class="sep"></span>
<button class="tb c1" id="tbUndo" aria-label="Deshacer" title="Deshacer">↶</button><button class="tb c1" id="tbRedo" aria-label="Rehacer" title="Rehacer">↷</button>
<button class="tb c6" id="tbNight" aria-label="Papel de noche" title="Papel de noche">${pxi('ui_luna', 24)}</button><button class="tb c1" id="tbCfg" aria-label="Elegir qué herramientas ver" title="Elegir qué herramientas ver">${pxi('gear', 22)}</button>
</div>
<div class="jr-links"><button class="jr-dreams" data-go="tablero">${pxi('pic', 22)}<span>Mis sueños</span><span class="faint">›</span></button><button class="jr-dreams" data-go="jardin">${pxi('girasol', 22)}<span>Mi jardín</span><span class="faint">›</span></button><button class="jr-dreams" data-go="compartidas">${pxi('heart', 22)}<span>Con amigas</span><span class="faint">›</span></button></div>
<div id="jHint" class="faint" style="text-align:center;min-height:18px"></div>
<div class="book-wrap" id="bookWrap"></div>
<div class="jr-dots" id="jDots"></div>
<div class="jr-spread-bar"><span class="jr-spread-t" id="jSpreadT"></span><span class="row" style="gap:6px"><button class="btn sm" id="jSpPrev" aria-label="Páginas anteriores">‹</button><button class="btn sm" id="jSpNext" aria-label="Páginas siguientes">›</button><button class="btn sm pink" id="jSpreadX">Cerrar</button></span></div>`;
$('#jSpread').onclick = () => { J.spread = true; J.sel = null; J.tool = null; document.body.classList.add('jr-spread'); draw(); };
$('#jSpreadX').onclick = () => { J.spread = false; document.body.classList.remove('jr-spread'); draw(); };
$('#jSpPrev').onclick = () => { if (J.page >= 2) { J.page -= 2; draw(); } };
$('#jSpNext').onclick = () => { if (J.page + 2 < J.doc.pages.length) { J.page += 2; draw(); } };
if (J.key.startsWith('sh-')) { $('#jPrev').onclick = () => { leave(); J.key = weekKey(new Date()); J.page = 0; render(root); }; $('#jNext').style.visibility = 'hidden'; $('#jWeek').onclick = () => A.go('compartidas'); $('#jPrev').setAttribute('aria-label', 'Volver a mi semana'); }
else $('#jPrev').onclick = () => { leave(); J.key = weekKey(addDays(weekDates(J.key)[0], -7)); J.page = 0; render(root); };
$('#jNext').onclick = () => { leave(); J.key = weekKey(addDays(weekDates(J.key)[0], 7)); J.page = 0; render(root); };
if (!J.key.startsWith('sh-')) $('#jWeek').onclick = jumpSheet;
$('#tbUndo').onclick = undo; $('#tbRedo').onclick = redo;
$('#tbNight').onclick = () => { J.night = !J.night; draw(); };
$('#tbCfg').onclick = toolsSheet;
el.querySelector('.toolbar').addEventListener('click', e => { const b = e.target.closest('[data-tool]'); if (b) onTool(b.dataset.tool); });
draw();
if (!J.resizeBound) { J.resizeBound = true; let jW = innerWidth; addEventListener('resize', () => { if (S.route !== 'journal') return; const ae = document.activeElement; if (ae && ae.isContentEditable) return; if (Math.abs(innerWidth - jW) < 2) return; jW = innerWidth; draw(); }); }
}
function leave() { if (J.key && J.key.startsWith('sh-') && window.Shared) Shared.flush(J.key); Store.flush && J.key && Store.docs['jr-' + J.key] && Store.flush('jr-' + J.key); J.sel = null; J.editing = null; J.tool = null; }
function setHint(t) { const h = $('#jHint'); if (h) h.textContent = t || ''; }
function setTool(t) {
J.tool = J.tool === t ? null : t;
$$('.toolbar [data-tool]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tool === J.tool || (b.dataset.tool === 'view' && J.lock)));
$$('.page').forEach(p => { p.classList.toggle('drawing', J.tool === 'pen' || J.tool === 'eraser'); p.classList.toggle('texting', J.tool === 'text'); });
setHint(J.tool === 'text' ? 'Toca la página donde quieras escribir.' : J.tool === 'pen' ? 'Dibuja con el dedo o el mouse. Toca ✏️ otra vez para soltar el lápiz.' : J.tool === 'eraser' ? 'Pasa sobre los trazos para borrarlos.' : J.lock ? 'Modo solo ver: no se puede mover nada.' : '');
}
function draw() {
const wrap = $('#bookWrap'); if (!wrap) return;
const cs = getComputedStyle(root); const avail = Math.min(root.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), 1030);
if (J.spread && S.route !== 'journal') { J.spread = false; document.body.classList.remove('jr-spread'); }
const two = J.spread || avail >= 780; J.pagesShown = two ? 2 : 1;
J.scale = J.spread ? Math.min((innerWidth - 20) / (PW * 2), (innerHeight - 76) / PH) : two ? Math.min(1.3, (avail - 70) / (PW * 2)) : Math.min(1.35, avail / PW);
if (two && J.page % 2) J.page -= 1;
const idx = two ? [J.page, J.page + 1] : [J.page];
const ds = weekDates(J.key);
const marks = S.settings.jrMarks || [];
const side = two && !J.spread ? `<div class="book-side"><button style="background:#f9d9e5" data-jy>${ds[3].getFullYear()}</button><button style="background:#dbe8f7" data-jm>${A.MON3[ds[3].getMonth()]}</button><button style="background:#d6eee3" data-jt>Hoy</button>${marks.slice(0, 5).map(m => `<button style="background:#fbe9b3" data-jk="${m.key}">${esc(m.label)}</button>`).join('')}</div>` : '';
wrap.innerHTML = `${side}<div class="book ${two ? '' : 'single'} ${J.night ? 'night-paper' : ''}">${idx.map(i => {
const p = J.doc.pages[i];
if (!p) return `<div class="pagebox" style="width:${PW * J.scale}px;height:${PH * J.scale}px;display:grid;place-items:center;background:#fbf6ef"><button class="btn" data-addpage style="transform:scale(${Math.max(.8, J.scale)})">＋ Agregar página</button></div>`;
return `<div class="pagebox" style="width:${PW * J.scale}px;height:${PH * J.scale}px"><div class="page" data-pi="${i}" style="transform:scale(${J.scale});background:${pageBg(p)}"><div class="bgpat" style="${pattern(p)}"></div><div class="tpl">${tplHTML(p, ds, i)}</div><div class="layer">${p.els.map(elHTML).join('')}</div><canvas class="ink" width="${Math.round(PW * J.scale * (devicePixelRatio || 1))}" height="${Math.round(PH * J.scale * (devicePixelRatio || 1))}"></canvas><span class="page-num">${i + 1}</span></div></div>`;
}).join('')}</div>`;
const total = J.doc.pages.length; const step = J.pagesShown;
$('#jDots').innerHTML = Array.from({ length: Math.ceil(total / step) }, (_, k) => `<button aria-label="Página ${k * step + 1}" aria-current="${Math.floor(J.page / step) === k}" data-jp="${k * step}"></button>`).join('') + `<button aria-label="Agregar página" data-addpage style="width:auto;height:auto;background:none;font-weight:900;color:var(--ink)">＋</button>`;
const spT = $('#jSpreadT'); if (spT) spT.textContent = `Páginas ${J.page + 1}–${Math.min(J.page + 2, J.doc.pages.length)} de ${J.doc.pages.length} · toma captura o gira el celular`;
$('#jWeek').textContent = J.key.startsWith('sh-') ? (window.Shared ? Shared.title(J.key) : 'Página compartida') : `Semana ${J.key.split('-W')[1]} · ${ds[0].getDate()} ${A.MON3[ds[0].getMonth()].toLowerCase()} – ${ds[6].getDate()} ${A.MON3[ds[6].getMonth()].toLowerCase()}`;
$$('.page', wrap).forEach(pg => { bindPage(pg); paintInk(pg); pg.classList.toggle('act', J.pagesShown === 2 && +pg.dataset.pi === actIdx()); });
$$('[data-jp]').forEach(b => b.onclick = () => { J.page = +b.dataset.jp; J.sel = null; draw(); });
$$('[data-addpage]').forEach(b => b.onclick = () => addPageSheet());
const jy = $('[data-jy]', wrap), jm = $('[data-jm]', wrap), jt = $('[data-jt]', wrap);
if (jy) jy.onclick = jumpSheet; if (jm) jm.onclick = jumpSheet; if (jt) jt.onclick = () => { leave(); J.key = weekKey(new Date()); J.page = 0; render(root); };
$$('[data-jk]', wrap).forEach(b => b.onclick = () => { leave(); J.key = b.dataset.jk; J.page = 0; render(root); });
if (!two && !wrap._sw) { wrap._sw = true; bindSwipe(wrap); }
$$('.toolbar [data-tool]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tool === J.tool || (b.dataset.tool === 'view' && J.lock)));
$$('.page').forEach(p => { p.classList.toggle('drawing', J.tool === 'pen' || J.tool === 'eraser'); p.classList.toggle('texting', J.tool === 'text'); });
updateUndo(); showElbar();
}
function pageBg(p) { return J.night ? '#2b2742' : (p.bg || '#fffaf3'); }
function pattern(p) {
const c = J.night ? 'rgba(255,255,255,.12)' : (p.gridColor || '#e6ddd2'); const g = p.gs || 16;
if (p.grid === 'cuadros') return `background-image:linear-gradient(${c} 1px,transparent 1px),linear-gradient(90deg,${c} 1px,transparent 1px);background-size:${g}px ${g}px;background-position:-1px -1px`;
if (p.grid === 'puntos') return `background-image:radial-gradient(${c} 1.3px,transparent 1.6px);background-size:${g}px ${g}px`;
if (p.grid === 'lineas') return `background-image:linear-gradient(transparent ${g * 1.6 - 1}px,${c} 0);background-size:100% ${g * 1.6}px;background-position:0 30px`;
return '';
}
function tplHTML(p, ds, i) {
const ink = J.night ? 'color:#efe8ff' : '';
const d0 = ds[0], d6 = ds[6];
if (p.tpl === 'semana') {
const td = A.today();
return `<div class="wk" style="${ink}"><div class="wk-h"><b>${A.cap(A.MONTHS[ds[3].getMonth()])} ${ds[3].getFullYear()}</b><span>SEMANA ${J.key.split('-W')[1]} · ${d0.getDate()} → ${d6.getDate()}</span></div>${ds.map((d, k) => {
const key = ymd(d); const sp = A.spentOf(A.txOnDay(key), { withSaving: true });
const lg = A.dayLog ? A.dayLog(key) : null; const mo = lg && lg.mood && A.DAY_MOODS ? A.DAY_MOODS[lg.mood].e : '';
return `<div class="wk-day"><div class="dn ${key === td ? 'today' : ''} ${k === 6 ? 'sun' : ''}"><b>${d.getDate()}</b><small>${A.DOW[k]}${mo ? ' ' + mo : ''}</small></div><div class="dt" contenteditable="${!J.lock}" data-day="${key}" data-pi="${i}" spellcheck="false" style="${ink}">${esc((p.days || {})[key] || '')}</div>${sp ? `<span class="money" style="right:4px">−${money(sp)}</span>` : ''}${lg && lg.note ? `<span class="money" style="left:50px;right:auto;max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#8a4d4f;background:#fff6c4">${pxi('pudin', 12)} ${esc(lg.note)}</span>` : ''}</div>`;
}).join('')}</div>`;
}
if (p.tpl === 'gastos') {
const rows = ds.map(d => { const l = A.txOnDay(ymd(d)); return { d, l, o: A.spentOf(l, { withSaving: true }), n: A.incomeOf(l) }; });
const mx = Math.max(1, ...rows.map(r => r.o)); const tot = rows.reduce((s, r) => s + r.o, 0);
return `<div class="wk" style="${ink}"><div class="wk-h"><b>Gastos de la semana</b><span>${d0.getDate()} → ${d6.getDate()} ${A.MON3[d6.getMonth()]}</span></div>
<div style="display:flex;align-items:flex-end;gap:8px;height:110px;margin:14px 6px 6px">${rows.map((r, k) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%;justify-content:flex-end"><span style="font-size:9px">${r.o ? '$' + Math.round(r.o) : ''}</span><i style="width:100%;border-radius:6px 6px 2px 2px;background:${['#ffc2dc', '#ffe0b3', '#fff3a8', '#c4ecd3', '#c9dcff', '#e2d7ff', '#ffd1e3'][k]};height:${r.o / mx * 80}%;min-height:3px;border:1px solid rgba(0,0,0,.08)"></i><span style="font-size:10px">${A.DOW[k].slice(0, 2)}</span></div>`).join('')}</div>
<div style="font-size:12px;border-top:1px solid var(--paper-line);padding-top:6px;display:flex;justify-content:space-between"><span>TOTAL</span><b style="font-family:var(--f-hand);font-size:20px;font-weight:400">${money(tot)}</b></div>
<div style="font-size:11px;margin-top:8px;display:flex;flex-direction:column;gap:3px;max-height:330px;overflow:hidden">${rows.flatMap(r => r.l.filter(t => t.type !== 'transfer').map(t => `<div style="display:flex;justify-content:space-between;gap:6px;border-bottom:1px dotted var(--paper-line);padding:2px 0"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.d.getDate()} · ${esc(t.note || (A.cat(t.cat) || {}).name || '')}</span><span style="color:${t.type === 'income' ? '#3d9b6a' : '#c8507e'}">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</span></div>`)).join('') || '<div style="text-align:center;padding:10px">Sin movimientos esta semana</div>'}</div></div>`;
}
if (p.tpl === 'mes') {
const m = ds[3]; const k = m.getFullYear() + '-' + pad(m.getMonth() + 1); const first = new Date(m.getFullYear(), m.getMonth(), 1); const off = A.dowIdx(first); const n = A.daysIn(k);
let cells = ''; for (let x = 0; x < off; x++) cells += '<div></div>';
for (let d = 1; d <= n; d++) { const key = k + '-' + pad(d); const o = A.spentOf(A.txOnDay(key), { withSaving: true }); cells += `<div style="border:1px solid var(--paper-line);border-radius:6px;height:58px;padding:2px 3px;font-size:10px;position:relative;${key === A.today() ? 'border-color:#e2648f;' : ''}"><b style="font-family:var(--f-hand);font-size:15px;font-weight:400">${d}</b>${o ? `<div style="position:absolute;bottom:2px;right:3px;color:#c8507e;font-size:9px">−${Math.round(o)}</div>` : ''}</div>`; }
return `<div class="wk" style="${ink}"><div class="wk-h"><b>${A.cap(A.MONTHS[m.getMonth()])} ${m.getFullYear()}</b><span>GASTOS POR DÍA</span></div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-top:8px;font-size:10px;text-align:center">${A.DOW.map(d => `<div>${d}</div>`).join('')}${cells}</div><div style="margin-top:8px;font-size:12px;display:flex;justify-content:space-between"><span>TOTAL DEL MES</span><b>${money(A.spentOf(A.txIn(k), { withSaving: true }))}</b></div></div>`;
}
if (p.tpl === 'ahorro') {
const cells = p.cells || []; const sum = cells.reduce((s, n) => s + n, 0);
return `<div class="wk" style="${ink}"><div class="wk-h"><b>Reto de ahorro 100</b><span>${money(sum)} DE ${money(5050)}</span></div><div style="display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-top:12px">${Array.from({ length: 100 }, (_, k) => k + 1).map(n => `<button data-cell="${n}" data-pi="${i}" style="aspect-ratio:1;border-radius:50%;border:1.5px solid ${cells.includes(n) ? '#e2648f' : '#d6c8bc'};background:${cells.includes(n) ? '#ffc2dc' : 'transparent'};font-family:var(--f-mono);font-size:10px;color:inherit;padding:0">${n}</button>`).join('')}</div><p style="font-size:11px;margin:10px 0 0;line-height:1.4">Cada vez que guardes ese monto, pinta su círculo. Al completar los 100 tendrás ${money(5050)}.</p></div>`;
}
if (p.tpl === 'deseos' || p.tpl === 'lista') {
const items = p.items || []; const isW = p.tpl === 'deseos';
return `<div class="wk" style="${ink}"><div class="wk-h"><b>${isW ? 'Lista de deseos' : 'Pendientes'}</b><span>${isW ? money(items.filter(x => x && !x.done).reduce((s, x) => s + (+x.p || 0), 0)) : items.filter(x => x && x.done).length + ' / ' + items.filter(x => x && x.t).length}</span></div>${Array.from({ length: 13 }, (_, k) => { const it = items[k] || {}; return `<div style="display:flex;align-items:center;gap:8px;height:38px;border-bottom:1px solid var(--paper-line)"><button data-chk="${k}" data-pi="${i}" style="width:18px;height:18px;border-radius:${isW ? '50%' : '5px'};border:1.5px solid #b9a99d;background:${it.done ? '#b9ecc6' : 'transparent'};padding:0;font-size:11px;color:#3d7a52">${it.done ? '✓' : ''}</button><div contenteditable="${!J.lock}" data-it="${k}" data-pi="${i}" spellcheck="false" style="flex:1;font-family:var(--f-hand);font-size:18px;outline:none;${it.done ? 'text-decoration:line-through;opacity:.6;' : ''}">${esc(it.t || '')}</div>${isW ? `<div contenteditable="${!J.lock}" data-ip="${k}" data-pi="${i}" style="width:62px;text-align:right;font-family:var(--f-mono);font-size:12px;outline:none" inputmode="decimal">${it.p ? esc(it.p) : ''}</div>` : ''}</div>`; }).join('')}</div>`;
}
if (p.tpl === 'habitos') {
const h = p.hab || { names: [], on: {} };
return `<div class="wk" style="${ink}"><div class="wk-h"><b>Hábitos de la semana</b><span>${d0.getDate()} → ${d6.getDate()}</span></div><div style="display:grid;grid-template-columns:1.6fr repeat(7,1fr);gap:4px;margin-top:10px;align-items:center;font-size:10px;text-align:center"><div></div>${A.DOW.map(d => `<div>${d.slice(0, 2)}</div>`).join('')}${Array.from({ length: 10 }, (_, r) => `<div contenteditable="${!J.lock}" data-hn="${r}" data-pi="${i}" spellcheck="false" style="text-align:left;font-family:var(--f-hand);font-size:16px;border-bottom:1px solid var(--paper-line);min-height:30px;outline:none;padding-top:4px">${esc(h.names[r] || (r === 0 && !h.names.length ? 'Tomar agua' : r === 1 && !h.names.length ? 'Anotar gastos' : ''))}</div>${Array.from({ length: 7 }, (_, c) => `<button data-hb2="${r}-${c}" data-pi="${i}" style="aspect-ratio:1;border-radius:7px;border:1.5px solid #d6c8bc;background:${h.on[r + '-' + c] ? ['#ffc2dc', '#c9dcff', '#c4ecd3', '#fff3a8', '#e2d7ff'][r % 5] : 'transparent'};padding:0;font-size:11px">${h.on[r + '-' + c] ? '✦' : ''}</button>`).join('')}`).join('')}</div></div>`;
}
return p.title ? `<div class="wk" style="${ink}"><div class="tpl-title">${esc(p.title)}</div></div>` : '';
}
function elHTML(e) {
const st = `left:${e.x}px;top:${e.y}px;width:${e.w}px;${['text', 'checks', 'rating', 'timer'].includes(e.t) ? '' : 'height:' + e.h + 'px;'}transform:rotate(${e.r || 0}deg);z-index:${e.z || 1}`;
let inner = '';
if (e.t === 'text') inner = `<div class="el-text" style="font-size:${e.fs || 20}px;color:${e.c || (J.night ? '#f4eeff' : '#3a2f3b')};font-family:${fontOf(e.f)};text-align:${e.al || 'left'}" data-edit>${esc(e.txt || '')}</div>`;
else if (e.t === 'sticky') inner = `<div class="el-sticky" style="background:${e.c};font-family:${fontOf(e.f)};font-size:${e.fs || 18}px;color:#3a2f3b" data-edit>${esc(e.txt || '')}</div>`;
else if (e.t === 'washi') { const w = WASHI[e.k] || WASHI.rosa; inner = `<div class="el-washi" style="background:${w.css};${(w.torn || e.torn) ? 'clip-path:polygon(0 8%,3% 0,6% 10%,9% 0,100% 0,97% 12%,100% 25%,96% 38%,100% 52%,97% 66%,100% 80%,96% 92%,100% 100%,0 100%,4% 88%,0 75%,3% 62%,0 48%,4% 35%,0 22%)' : ''}"></div>`; }
else if (e.t === 'img') inner = e.frame ? `<div class="el-img-frame"><img class="el-img" alt="" src="${esc(e.src)}" draggable="false" style="height:100%"></div>` : `<img class="el-img" alt="" src="${esc(e.src)}" draggable="false" style="border-radius:${e.round ? '50%' : '4px'}">`;
else if (e.t === 'sym') inner = `<div class="el-sym" style="font-size:${e.fs || 28}px;color:${e.c || '#e2648f'}">${esc(e.txt)}</div>`;
else if (e.t === 'sticker') inner = `<div class="el-sticker" style="font-size:${Math.round(e.h * .82)}px">${e.v.startsWith('s:') ? `<img class="pixel" alt="" src="${Pix.sprite(e.v.slice(2), 4)}" draggable="false">` : e.v.startsWith('i:') ? `<img alt="" src="${esc(e.v.slice(2))}" draggable="false">` : esc(e.v.replace(/^e:/, ''))}</div>`;
else if (e.t === 'shape') inner = `<div class="el-shape" style="width:100%;height:100%">${shapeSVG(e)}</div>`;
else if (e.t === 'habit') inner = habitHTML(e);
else if (e.t === 'checks') inner = `<div class="el-checks" style="font-family:${fontOf(e.f)};font-size:${e.fs || 17}px;color:${e.c || (J.night ? '#f4eeff' : '#3a2f3b')}">${e.title != null ? `<div class="ck-t" data-edit>${esc(e.title)}</div>` : ''}${(e.items || []).map((it, i) => `<div class="ck-row ${it.on ? 'on' : ''}"><button data-ck="${i}" aria-label="${it.on ? 'Hecho' : 'Pendiente'}">${it.on ? '✓' : ''}</button><span>${esc(it.txt)}</span></div>`).join('')}</div>`;
else if (e.t === 'rating') inner = `<div class="el-rating"><div class="ht" data-edit>${esc(e.txt || '')}</div><div class="stars">${Array.from({ length: e.n || 5 }, (_, i) => `<button data-star="${i + 1}" aria-label="${i + 1} de ${e.n || 5}"><img class="pixel" alt="" src="${Pix.sprite('estrellita', 3)}" draggable="false" style="${i < (e.v || 0) ? '' : 'filter:grayscale(1) opacity(.35)'}"></button>`).join('')}</div></div>`;
else if (e.t === 'timer') { const secs = Math.floor((e.secs || 0) + (e.run ? (Date.now() - e.run) / 1000 : 0)); inner = `<div class="el-timer ${e.run ? 'run' : ''}" data-run="${e.run || ''}"><div class="ht" data-edit>${esc(e.txt || '')}</div><div class="tm-row"><button data-tm="go" aria-label="${e.run ? 'Pausar' : 'Empezar'}">${e.run ? '❚❚' : '▶'}</button><b class="tm-v" data-secs="${e.secs || 0}">${fmtT(secs)}</b><button data-tm="reset" aria-label="Volver a cero">↺</button></div></div>`; }
const deco = ['text', 'sticky', 'checks'].includes(e.t) ? `font-weight:${e.b ? 800 : 'inherit'};font-style:${e.i ? 'italic' : 'normal'};text-decoration:${[e.u ? 'underline' : '', e.s ? 'line-through' : ''].filter(Boolean).join(' ') || 'none'}` : '';
if (deco) inner = `<div style="${deco};width:100%;height:100%">${inner}</div>`;
return `<div class="el ${J.sel === e.id ? 'sel' : ''}" data-id="${e.id}" style="${st}">${inner}<span class="h rs" data-h="rs"></span><span class="h rt" data-h="rt"></span></div>`;
}
function fmtT(t) { const h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, sec = t % 60; return (h ? h + ':' + pad(m) : m) + ':' + pad(sec); }
setInterval(() => { if (S.route !== 'journal') return; $$('.el-timer.run').forEach(n => { const v = n.querySelector('.tm-v'); const run = +n.dataset.run; if (v && run) v.textContent = fmtT(Math.floor(+v.dataset.secs + (Date.now() - run) / 1000)); }); }, 1000);
function fontOf(f) { return { hand: 'var(--f-hand)', mono: 'var(--f-mono)', caveat: "'Caveat', cursive", round: "'Nunito', sans-serif", pixel: "'Pixelify Sans', monospace", gaegu: "'Gaegu', cursive" }[f || 'hand']; }
function shapeSVG(e) {
const f = e.fill || '#ffd1e3', s = e.c || '#b06a8a', sw = 2;
const paths = {
'triángulo': `<polygon points="50,4 96,96 4,96" fill="${f}" stroke="${s}" stroke-width="${sw}" vector-effect="non-scaling-stroke"/>`,
'círculo': `<ellipse cx="50" cy="50" rx="47" ry="47" fill="${f}" stroke="${s}" stroke-width="${sw}" vector-effect="non-scaling-stroke"/>`,
'estrella': `<polygon points="50,3 62,37 97,37 69,58 79,94 50,72 21,94 31,58 3,37 38,37" fill="${f}" stroke="${s}" stroke-width="${sw}" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`,
'cuadrado': `<rect x="3" y="3" width="94" height="94" rx="8" fill="${f}" stroke="${s}" stroke-width="${sw}" vector-effect="non-scaling-stroke"/>`,
'corazón': `<path d="M50 92 C20 70 3 52 3 30 C3 14 15 4 29 4 C39 4 46 10 50 18 C54 10 61 4 71 4 C85 4 97 14 97 30 C97 52 80 70 50 92Z" fill="${f}" stroke="${s}" stroke-width="${sw}" vector-effect="non-scaling-stroke"/>`,
'nube': `<path d="M22 84 C8 84 2 72 6 62 C2 50 14 38 26 42 C28 24 48 16 60 28 C70 18 90 24 90 42 C100 46 100 66 90 72 C92 82 82 88 72 84 Z" fill="${f}" stroke="${s}" stroke-width="${sw}" vector-effect="non-scaling-stroke"/>`,
'línea': `<line x1="0" y1="50" x2="100" y2="50" stroke="${s}" stroke-width="${e.sw || 3}" vector-effect="non-scaling-stroke" stroke-linecap="round"/>`,
'línea punteada': `<line x1="0" y1="50" x2="100" y2="50" stroke="${s}" stroke-width="${e.sw || 3}" stroke-dasharray="7 6" vector-effect="non-scaling-stroke" stroke-linecap="round"/>`
};
return `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${paths[e.k] || paths['círculo']}</svg>`;
}
function habitHTML(e) {
const t = `<div class="ht" data-edit>${esc(e.txt || '')}</div>`;
if (e.k === 'agua') return `<div class="el-habit">${t}<div class="cells">${Array.from({ length: 8 }, (_, i) => `<button data-hb="${i}" class="${(e.on || [])[i] ? 'on' : ''}">${pxi('gota', 16)}</button>`).join('')}</div></div>`;
if (e.k === 'habito') return `<div class="el-habit">${t}<div class="cells check">${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => `<button data-hb="${i}" class="${(e.on || [])[i] ? 'on' : ''}">${(e.on || [])[i] ? '✓' : d}</button>`).join('')}</div></div>`;
if (e.k === 'animo') return `<div class="el-habit">${t}<div class="cells mood">${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => `<button data-hb="${i}" class="${(e.on || [])[i] ? 'on' : ''}" title="${d}">${(e.on || [])[i] ? pxi(MOODS[e.on[i]], 18) : d}</button>`).join('')}</div></div>`;
return `<div class="el-habit">${t}<div class="pbar" data-pbar><i style="width:${e.p || 0}%"></i></div><div style="text-align:right">${Math.round(e.p || 0)}%</div></div>`;
}
const actIdx = () => (J.pagesShown === 2 && J.act === J.page + 1 && J.doc.pages[J.page + 1]) ? J.page + 1 : J.page; const curPage = () => J.doc.pages[actIdx()];
function addEl(e, pi) {
const p = J.doc.pages[pi == null ? actIdx() : pi]; if (!p) return;
snapshot(); e.id = uid(); e.z = (Math.max(0, ...p.els.map(x => x.z || 1)) + 1); e.r = e.r || 0;
if (e.x == null) { e.x = Math.round(Math.max(10, Math.min(PW - e.w - 10, (PW - e.w) / 2 + (Math.random() * 160 - 80)))); e.y = Math.round(Math.max(40, Math.min(PH - (e.h || 40) - 20, (PH - (e.h || 40)) / 2 + (Math.random() * 260 - 130)))); }
p.els.push(e); J.sel = e.id; commit(); draw(); return e;
}
function findEl(id) { for (const p of J.doc.pages) { const e = p.els.find(x => x.id === id); if (e) return { e, p }; } return null; }
function paintInk(pg) {
const p = J.doc.pages[+pg.dataset.pi]; const cv = $('canvas.ink', pg); const ctx = cv.getContext('2d');
const k = cv.width / PW; ctx.setTransform(k, 0, 0, k, 0, 0); ctx.clearRect(0, 0, PW, PH);
(p.strokes || []).forEach(s => strokePath(ctx, s));
}
function strokePath(ctx, s) {
const pts = s.p; if (!pts || pts.length < 2) return;
ctx.save(); ctx.globalAlpha = s.a || 1; ctx.strokeStyle = s.c; ctx.lineWidth = s.w; ctx.lineCap = s.cap || 'round'; ctx.lineJoin = 'round';
if (s.a && s.a < 1) ctx.globalCompositeOperation = 'multiply';
ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
if (pts.length === 2) ctx.lineTo(pts[0] + .1, pts[1] + .1);
for (let i = 2; i < pts.length - 2; i += 2) { const mx = (pts[i] + pts[i + 2]) / 2, my = (pts[i + 1] + pts[i + 3]) / 2; ctx.quadraticCurveTo(pts[i], pts[i + 1], mx, my); }
if (pts.length > 2) ctx.lineTo(pts[pts.length - 2], pts[pts.length - 1]);
ctx.stroke(); ctx.restore();
}
function toLocal(pg, ev) { const r = pg.getBoundingClientRect(); return { x: (ev.clientX - r.left) / J.scale, y: (ev.clientY - r.top) / J.scale }; }
function bindPage(pg) {
const pi = +pg.dataset.pi;
pg.addEventListener('pointerdown', ev => {
if (ev.button > 0) return;
if (J.act !== pi) { J.act = pi; document.querySelectorAll('.page').forEach(n => n.classList.toggle('act', J.pagesShown === 2 && +n.dataset.pi === pi)); } const p = J.doc.pages[pi]; const pt = toLocal(pg, ev);
if (J.tool === 'pen' && !J.lock) {
ev.preventDefault(); pg.setPointerCapture(ev.pointerId); snapshot();
const pen = PENS.find(x => x.id === J.pen.id) || PENS[1];
const s = { c: J.pen.color, w: +(J.pen.w * pen.w).toFixed(2), a: pen.alpha < 1 ? pen.alpha : undefined, cap: pen.cap, p: [Math.round(pt.x * 10) / 10, Math.round(pt.y * 10) / 10] };
p.strokes = p.strokes || []; p.strokes.push(s);
const cv = $('canvas.ink', pg); const ctx = cv.getContext('2d');
const move = e2 => { const q = toLocal(pg, e2); const lx = s.p[s.p.length - 2], ly = s.p[s.p.length - 1]; if (Math.hypot(q.x - lx, q.y - ly) < 1.2) return; s.p.push(Math.round(q.x * 10) / 10, Math.round(q.y * 10) / 10); paintInk(pg); };
const up = () => { pg.removeEventListener('pointermove', move); pg.removeEventListener('pointerup', up); pg.removeEventListener('pointercancel', up); if (s.p.length === 2) s.p.push(s.p[0] + .5, s.p[1] + .5); paintInk(pg); commit(); };
pg.addEventListener('pointermove', move); pg.addEventListener('pointerup', up); pg.addEventListener('pointercancel', up);
return;
}
if (J.tool === 'eraser' && !J.lock) {
ev.preventDefault(); pg.setPointerCapture(ev.pointerId); snapshot(); let changed = false;
const er = q => { const before = p.strokes.length; p.strokes = p.strokes.filter(s => { for (let i = 0; i < s.p.length; i += 2) if (Math.hypot(s.p[i] - q.x, s.p[i + 1] - q.y) < 9 + s.w / 2) return false; return true; }); if (p.strokes.length !== before) { changed = true; paintInk(pg); } };
er(pt);
const move = e2 => er(toLocal(pg, e2));
const up = () => { pg.removeEventListener('pointermove', move); pg.removeEventListener('pointerup', up); if (changed) commit(); else J.hist.pop(); updateUndo(); };
pg.addEventListener('pointermove', move); pg.addEventListener('pointerup', up);
return;
}
const elNode = ev.target.closest('.el');
if (ev.target.closest('[data-hb],[data-pbar]') && elNode) return;
if (elNode && !J.lock) {
const id = elNode.dataset.id; const { e } = findEl(id) || {}; if (!e) return;
const handle = ev.target.dataset.h;
if (J.editing === id && !handle) return; // typing inside
ev.preventDefault();
const wasSel = J.sel === id;
if (!wasSel) { J.sel = id; J.editing = null; $$('.el.sel').forEach(n => n.classList.remove('sel')); elNode.classList.add('sel'); showElbar(); }
pg.setPointerCapture(ev.pointerId);
const start = { x: pt.x, y: pt.y, ex: e.x, ey: e.y, ew: e.w, eh: e.h, fs: e.fs, r: e.r || 0 };
const cx = e.x + e.w / 2, cy = e.y + (e.t === 'text' ? elNode.offsetHeight / 2 : e.h / 2);
let moved = false; let snapped = false;
const move = e2 => {
const q = toLocal(pg, e2); const dx = q.x - start.x, dy = q.y - start.y;
if (!moved && Math.hypot(dx, dy) < 4) return; moved = true;
if (!snapped) { snapshot(); snapped = true; }
if (handle === 'rs') {
const ratio = Math.max(.2, (start.ew + dx) / start.ew);
if (e.t === 'text' || e.t === 'sym') { e.fs = Math.max(8, Math.round((start.fs || (e.t === 'sym' ? 28 : 20)) * ratio)); e.w = Math.max(30, Math.round(start.ew * ratio)); if (e.t === 'sym') e.h = Math.max(20, Math.round(start.eh * ratio)); }
else if (e.t === 'img' || e.t === 'sticker') { e.w = Math.max(24, Math.round(start.ew * ratio)); e.h = Math.max(24, Math.round(start.eh * ratio)); }
else { e.w = Math.max(20, Math.round(start.ew + dx)); e.h = Math.max(e.t === 'washi' || e.k === 'línea' || e.k === 'línea punteada' ? 6 : 20, Math.round(start.eh + dy)); }
} else if (handle === 'rt') {
let ang = Math.atan2(q.y - cy, q.x - cx) * 180 / Math.PI + 90; const near = Math.round(ang / 45) * 45; if (Math.abs(ang - near) < 5) ang = near; e.r = Math.round(ang);
} else { e.x = Math.round(start.ex + dx); e.y = Math.round(start.ey + dy); }
elNode.style.left = e.x + 'px'; elNode.style.top = e.y + 'px'; elNode.style.width = e.w + 'px'; if (e.t !== 'text') elNode.style.height = e.h + 'px'; elNode.style.transform = `rotate(${e.r || 0}deg)`;
const inner = elNode.firstElementChild; if (e.t === 'text' && inner) inner.style.fontSize = e.fs + 'px'; if (e.t === 'sym' && inner) inner.style.fontSize = e.fs + 'px'; if (e.t === 'sticker' && inner) inner.style.fontSize = Math.round(e.h * .82) + 'px';
showElbar();
};
const up = () => {
pg.removeEventListener('pointermove', move); pg.removeEventListener('pointerup', up); pg.removeEventListener('pointercancel', up);
if (moved) { // moved to the other page? keep inside bounds
e.x = Math.max(-e.w + 20, Math.min(PW - 20, e.x)); e.y = Math.max(-20, Math.min(PH - 20, e.y)); commit(); draw();
} else if (wasSel && !handle && elNode.querySelector('[data-edit]')) startEdit(elNode, e);
};
pg.addEventListener('pointermove', move); pg.addEventListener('pointerup', up); pg.addEventListener('pointercancel', up);
return;
}
const editableTpl = ev.target.closest('[contenteditable="true"]');
if (J.tool === 'text' && !J.lock) {
ev.preventDefault(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
const txOff = () => { pg.removeEventListener('pointerup', txUp); pg.removeEventListener('pointercancel', txOff); };
const txUp = () => { txOff(); const e = addEl({ t: 'text', txt: '', w: 200, h: 30, x: Math.round(pt.x - 6), y: Math.round(pt.y - 14), fs: 20, f: 'hand', c: J.night ? '#f4eeff' : J.pen.color }, pi); J.tool = null; setTool(null); const n = $(`.el[data-id="${e.id}"]`); if (n) startEdit(n, e); };
pg.addEventListener('pointerup', txUp); pg.addEventListener('pointercancel', txOff);
return;
}
if (J.sel) { J.sel = null; J.editing = null; $$('.el.sel').forEach(n => n.classList.remove('sel')); showElbar(); }
});
pg.addEventListener('input', ev => {
const t = ev.target; const p = J.doc.pages[pi];
if (t.dataset.day) { p.days = p.days || {}; p.days[t.dataset.day] = t.innerText; persist(); }
else if (t.dataset.it != null) { p.items = p.items || []; p.items[+t.dataset.it] = Object.assign({}, p.items[+t.dataset.it], { t: t.innerText }); persist(); }
else if (t.dataset.ip != null) { p.items = p.items || []; p.items[+t.dataset.ip] = Object.assign({}, p.items[+t.dataset.ip], { p: t.innerText.replace(/[^\d.,]/g, '').replace(',', '.') }); persist(); }
else if (t.dataset.hn != null) { p.hab = p.hab || { names: [], on: {} }; if (!p.hab.names.length) p.hab.names = ['Tomar agua', 'Anotar gastos']; p.hab.names[+t.dataset.hn] = t.innerText; persist(); }
});
pg.addEventListener('focusout', ev => { if (ev.target.dataset.ip != null) draw(); });
pg.addEventListener('click', ev => {
if (J.lock) return;
const p = J.doc.pages[pi];
const cell = ev.target.closest('[data-cell]');
if (cell) { snapshot(); const n = +cell.dataset.cell; p.cells = p.cells || []; p.cells = p.cells.includes(n) ? p.cells.filter(x => x !== n) : p.cells.concat(n); commit(); draw(); return; }
const chk = ev.target.closest('[data-chk]');
if (chk) { snapshot(); p.items = p.items || []; const k = +chk.dataset.chk; p.items[k] = Object.assign({}, p.items[k], { done: !(p.items[k] || {}).done }); commit(); draw(); return; }
const hb2 = ev.target.closest('[data-hb2]');
if (hb2) { snapshot(); p.hab = p.hab || { names: [], on: {} }; const k = hb2.dataset.hb2; p.hab.on[k] = !p.hab.on[k]; commit(); draw(); return; }
const ck = ev.target.closest('[data-ck]'), stb = ev.target.closest('[data-star]'), tm = ev.target.closest('[data-tm]');
if (ck || stb || tm) { const nd = ev.target.closest('.el'); if (!nd) return; const { e } = findEl(nd.dataset.id); snapshot();
if (ck) { const it = e.items[+ck.dataset.ck]; it.on = !it.on; }
if (stb) { const v = +stb.dataset.star; e.v = e.v === v ? v - 1 : v; }
if (tm) { if (tm.dataset.tm === 'reset') { e.secs = 0; if (e.run) e.run = Date.now(); } else if (e.run) { e.secs = (e.secs || 0) + (Date.now() - e.run) / 1000; e.run = 0; } else e.run = Date.now(); }
commit(); draw(); return; }
const hb = ev.target.closest('[data-hb]'); const pb = ev.target.closest('[data-pbar]');
const node = ev.target.closest('.el'); if (!node || (!hb && !pb)) return;
const { e } = findEl(node.dataset.id); snapshot();
if (hb) { const i = +hb.dataset.hb; e.on = e.on || []; if (e.k === 'animo') e.on[i] = ((e.on[i] || 0) + 1) % MOODS.length; else e.on[i] = !e.on[i]; }
if (pb) { const r = pb.getBoundingClientRect(); e.p = Math.max(0, Math.min(100, Math.round((ev.clientX - r.left) / r.width * 20) * 5)); }
commit(); draw();
});
}
function startEdit(node, e) {
const ed = node.querySelector('[data-edit]'); if (!ed) return;
J.editing = e.id; ed.contentEditable = 'true'; ed.spellcheck = false; ed.focus();
const range = document.createRange(); range.selectNodeContents(ed); range.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(range);
let snapped = false;
ed.oninput = () => { if (!snapped) { snapshot(); snapped = true; } e.txt = ed.innerText; persist(); showElbar(); };
ed.onblur = () => { ed.contentEditable = 'false'; if (J.editing === e.id) J.editing = null; if (e.t === 'text' && !(e.txt || '').trim()) { const f = findEl(e.id); if (f) { f.p.els = f.p.els.filter(x => x !== e); J.sel = null; persist(); draw(); } } };
}
function showElbar() {
$$('.elbar').forEach(n => n.remove());
if (!J.sel || J.lock) return; const f = findEl(J.sel); if (!f) return; const { e } = f;
const node = $(`.el[data-id="${e.id}"]`); if (!node) return; const box = $('#bookWrap'); if (!box) return;
const bar = document.createElement('div'); bar.className = 'elbar';
const colorable = ['text', 'sticky', 'sym', 'shape'].includes(e.t);
bar.innerHTML = `${colorable ? `<input type="color" data-eb="color" value="${toHex(e.t === 'sticky' ? e.c : e.t === 'shape' ? (e.fill || '#ffd1e3') : (e.c || '#3a2f3b'))}" aria-label="Color">` : ''}
${e.t === 'shape' ? `<input type="color" data-eb="stroke" value="${toHex(e.c || '#b06a8a')}" aria-label="Color del borde">` : ''}
${e.t === 'text' || e.t === 'sticky' || e.t === 'checks' ? `<button data-eb="font" title="Letra">Aa</button>${e.t !== 'checks' ? '<button data-eb="align" title="Alinear">≡</button>' : ''}<button data-eb="fb" title="Negrita" style="font-weight:900;${e.b ? 'background:#ffd1e3' : ''}">B</button><button data-eb="fi" title="Cursiva" style="font-style:italic;${e.i ? 'background:#ffd1e3' : ''}">I</button><button data-eb="fu" title="Subrayado" style="text-decoration:underline;${e.u ? 'background:#ffd1e3' : ''}">U</button><button data-eb="fs" title="Tachado" style="text-decoration:line-through;${e.s ? 'background:#ffd1e3' : ''}">S</button><button data-eb="bigger" title="Más grande">A+</button><button data-eb="smaller" title="Más pequeña">A−</button>` : ''}
${e.t === 'checks' ? `<button data-eb="items" title="Editar la lista">✎</button>` : ''}${e.t === 'rating' ? `<button data-eb="nstars" title="Cuántas estrellitas">${e.n || 5}★</button>` : ''}
${e.t === 'img' ? `<button data-eb="frame" title="Marco polaroid">▢</button><button data-eb="round" title="Redonda">◯</button>` : ''}
${e.t === 'washi' ? `<button data-eb="torn" title="Bordes rasgados">≈</button>` : ''}
<button data-eb="up" title="Traer al frente">⬆</button><button data-eb="down" title="Enviar atrás">⬇</button><button data-eb="dup" title="Duplicar">⧉</button><button data-eb="del" title="Borrar">✕</button>`;
box.appendChild(bar);
const r = node.getBoundingClientRect(), br = box.getBoundingClientRect();
let top = r.top - br.top - 52; if (top < 4) top = r.bottom - br.top + 10;
let left = r.left - br.left + r.width / 2 - bar.offsetWidth / 2; left = Math.max(4, Math.min(br.width - bar.offsetWidth - 4, left));
bar.style.top = top + 'px'; bar.style.left = left + 'px';
bar.addEventListener('pointerdown', ev => ev.stopPropagation());
bar.addEventListener('input', ev => {
const k = ev.target.dataset.eb; if (!k) return;
if (!bar._snap) { snapshot(); bar._snap = true; }
if (k === 'color') { if (e.t === 'shape') e.fill = ev.target.value; else e.c = ev.target.value; }
if (k === 'stroke') e.c = ev.target.value;
persist(); const n = $(`.el[data-id="${e.id}"]`); if (n) n.outerHTML = elHTML(e);
});
bar.addEventListener('change', () => { bar._snap = false; draw(); });
bar.addEventListener('click', ev => {
const k = (ev.target.closest('[data-eb]') || {}).dataset?.eb; if (!k || k === 'color' || k === 'stroke') return;
snapshot(); const p = f.p;
if (k === 'del') { p.els = p.els.filter(x => x !== e); J.sel = null; }
if (k === 'up') e.z = Math.max(...p.els.map(x => x.z || 1)) + 1;
if (k === 'down') { e.z = Math.min(...p.els.map(x => x.z || 1)) - 1; }
if (k === 'dup') { const c = JSON.parse(JSON.stringify(e)); c.id = uid(); c.x += 14; c.y += 14; c.z = Math.max(...p.els.map(x => x.z || 1)) + 1; p.els.push(c); J.sel = c.id; }
if (k === 'font') { const fs = ['hand', 'caveat', 'gaegu', 'round', 'mono', 'pixel']; e.f = fs[(fs.indexOf(e.f || 'hand') + 1) % fs.length]; }
if (k === 'align') { const al = ['left', 'center', 'right']; e.al = al[(al.indexOf(e.al || 'left') + 1) % 3]; }
if (k === 'frame') { e.frame = !e.frame; if (e.frame) e.round = false; }
if (k === 'round') { e.round = !e.round; if (e.round) { e.frame = false; e.h = e.w; } }
if (k === 'torn') e.torn = !e.torn;
if (k === 'fb') e.b = !e.b; if (k === 'fi') e.i = !e.i; if (k === 'fu') e.u = !e.u; if (k === 'fs') e.s = !e.s;
if (k === 'bigger') e.fs = Math.min(64, (e.fs || (e.t === 'checks' ? 17 : 20)) + 2); if (k === 'smaller') e.fs = Math.max(10, (e.fs || (e.t === 'checks' ? 17 : 20)) - 2);
if (k === 'nstars') { e.n = (e.n || 5) >= 10 ? 3 : (e.n || 5) + 1; e.v = Math.min(e.v || 0, e.n); }
if (k === 'items') { commit(); checksSheet(e); return; }
commit(); draw();
});
}
function toHex(c) { if (/^#[0-9a-f]{6}$/i.test(c || '')) return c; const cv = document.createElement('canvas').getContext('2d'); cv.fillStyle = c || '#000'; return cv.fillStyle.startsWith('#') ? cv.fillStyle : '#3a2f3b'; }
function bindSwipe(wrap) {
let sx = null, sy = 0;
wrap.addEventListener('touchstart', e => { if (J.tool || e.touches.length !== 1 || e.target.closest('.el,[contenteditable="true"],button')) { sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
wrap.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { const n = J.page + (dx < 0 ? 1 : -1); if (n >= 0 && n < J.doc.pages.length) { J.page = n; J.sel = null; draw(); } } sx = null; }, { passive: true });
}
function onTool(t) {
if (t === 'view') { J.lock = !J.lock; J.sel = null; J.tool = null; draw(); setTool(null); return; }
if (J.lock) { J.lock = false; }
if (t === 'text' || t === 'eraser') { setTool(t); return; }
if (t === 'pen') { if (J.tool === 'pen') { setTool('pen'); return; } penSheet(); return; }
const sheets = { blocks: blocksSheet, habits: habitsSheet, shapes: shapesSheet, images: imagesSheet, sticky: stickySheet, washi: washiSheet, symbols: symbolsSheet, stickers: stickersSheet, paper: paperSheet, templates: templatesSheet, pages: addPageSheet, marks: marksSheet };
if (sheets[t]) sheets[t]();
}
const open = (title, html, mount) => A.openSheet(title, `<div class="pop" style="box-shadow:none;border:0;padding:0;background:transparent">${html}</div>`, mount, { paper: true });
function penSheet() {
open('Lápices', `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">${PENS.map(p => `<button class="opt" data-pen="${p.id}" style="flex-direction:column;justify-content:center;${J.pen.id === p.id ? 'outline:2px solid #e2648f;' : ''}"><span style="display:block;width:${4 + p.w * 4}px;height:34px;border-radius:4px 4px 2px 2px;background:${p.alpha < 1 ? '#fff38a' : '#3a2f3b'};opacity:${p.alpha < 1 ? .8 : 1}"></span><span style="font-size:11px">${p.name}</span></button>`).join('')}</div>
<div class="lab">Color</div><div class="swatches">${INKS.map(c => `<button class="sw" data-ink="${c}" aria-pressed="${J.pen.color === c}" style="background:${c};${c === '#ffffff' ? 'border-color:#ddd' : ''}"></button>`).join('')}<input type="color" id="inkC" value="${J.pen.color}" style="width:34px;height:34px;border:0;background:none;padding:0" aria-label="Otro color"></div>
<div class="lab">Grosor</div><div style="display:flex;gap:8px">${WIDTHS.map(w => `<button class="opt" data-w="${w}" style="justify-content:center;${J.pen.w === w ? 'outline:2px solid #e2648f;' : ''}"><span style="display:block;width:40px;height:${w * 1.6}px;background:#3a2f3b;border-radius:9px"></span></button>`).join('')}</div>
<button class="btn pink" id="penGo" style="margin-top:12px;width:100%;justify-content:center">Empezar a dibujar</button>`, sh => {
sh.addEventListener('click', e => {
const p = e.target.closest('[data-pen]'), c = e.target.closest('[data-ink]'), w = e.target.closest('[data-w]');
if (p) { J.pen.id = p.dataset.pen; if (J.pen.id === 'resaltador') J.pen.color = '#ffd84d'; }
if (c) J.pen.color = c.dataset.ink; if (w) J.pen.w = +w.dataset.w;
if (p || c || w) { penSheet(); }
if (e.target.closest('#penGo')) { A.closeSheet(); J.tool = null; setTool('pen'); }
});
$('#inkC', sh).onchange = e => { J.pen.color = e.target.value; };
});
}
function habitsSheet() {
const opts = [['agua', 'gota', 'Agua del día', { w: 230, h: 64, txt: 'Agua' }], ['habito', 'check', 'Hábito de la semana', { w: 230, h: 64, txt: 'Leer 10 min' }], ['animo', 'f_feliz', 'Ánimo de la semana', { w: 230, h: 64, txt: 'Mi ánimo' }], ['progreso', 'ui_nota', 'Barra de progreso', { w: 220, h: 72, txt: 'Ahorro del mes', p: 40 }]];
open('Hábitos', opts.map(([k, ic, n]) => `<button class="opt" data-hk="${k}"><span style="width:24px">${pxi(ic, 22)}</span>${n}</button>`).join(''), sh => sh.addEventListener('click', e => { const b = e.target.closest('[data-hk]'); if (!b) return; const o = opts.find(x => x[0] === b.dataset.hk); A.closeSheet(); addEl(Object.assign({ t: 'habit', k: o[0] }, JSON.parse(JSON.stringify(o[3])))); }));
}
function blocksSheet() {
const opts = [['checks', 'check', 'Lista con casillas', 'Para marcar lo que ya hiciste'], ['rating', 'estrellita', 'Calificación con estrellitas', 'Califica tu día, una peli o un libro'], ['timer', 'x_reloj', 'Contador de tiempo', 'Cuánto estudiaste, leíste o trabajaste']];
open('Casillas, estrellitas y tiempo', opts.map(([k, ic, n, d]) => `<button class="opt" data-bk="${k}"><span style="width:26px">${pxi(ic, 22)}</span><span><b>${n}</b><br><small style="font-family:var(--f-body)">${d}</small></span></button>`).join(''), sh => sh.addEventListener('click', ev => {
const b = ev.target.closest('[data-bk]'); if (!b) return; const k = b.dataset.bk; A.closeSheet();
if (k === 'checks') { const el = addEl({ t: 'checks', w: 230, h: 40, title: 'Pendientes', items: [{ txt: 'Anotar mis gastos', on: false }, { txt: 'Tomar agua', on: false }, { txt: 'Algo lindo para mí', on: false }], f: 'hand', fs: 17 }); checksSheet(el); }
if (k === 'rating') addEl({ t: 'rating', w: 220, h: 40, txt: 'Mi día', n: 5, v: 0 });
if (k === 'timer') addEl({ t: 'timer', w: 200, h: 40, txt: 'Estudié', secs: 0, run: 0 });
}));
}
function checksSheet(e) {
open('Lista con casillas', `<label class="lab">Título (opcional)</label><input class="in" id="ckT" value="${esc(e.title || '')}" maxlength="40" style="margin-bottom:8px"><label class="lab">Una cosa por línea</label><textarea class="in" id="ckL" style="min-height:150px">${esc((e.items || []).map(i => i.txt).join('\n'))}</textarea><button class="btn pink" id="ckOk" style="justify-content:center;width:100%;margin-top:8px">Listo</button>`, sh => {
$('#ckOk', sh).onclick = () => { snapshot(); const old = e.items || []; e.title = $('#ckT', sh).value.trim(); e.items = $('#ckL', sh).value.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 20).map((txt, i) => ({ txt, on: !!(old.find(o => o.txt === txt) || {}).on })); commit(); A.closeSheet(); draw(); };
});
}
function toolsSheet() {
const hidden = new Set(S.settings.jrHide || []);
open('Tus herramientas', `<p style="font-family:var(--f-body);font-size:13px;margin:0 0 8px">Elige cuáles quieres ver en la barra del journal.</p>${J.tools.filter(([id]) => id !== 'view').map(([id, ic, lbl]) => `<label class="opt" style="cursor:pointer"><input type="checkbox" data-tv="${id}" ${hidden.has(id) ? '' : 'checked'}> <span style="width:24px">${pxi(ic, 20)}</span>${lbl}</label>`).join('')}`, sh => sh.addEventListener('change', ev => {
const t = ev.target.dataset.tv; if (!t) return; ev.target.checked ? hidden.delete(t) : hidden.add(t); S.settings.jrHide = [...hidden]; A.saveSettings(); render(root);
}));
}
function shapesSheet() {
open('Formas', SHAPES.map(s => `<button class="opt" data-sh="${s}"><span style="width:28px;height:28px;display:inline-block">${shapeSVG({ k: s, fill: '#ffd1e3', c: '#b06a8a' })}</span>${A.cap(s)}</button>`).join(''), sh => sh.addEventListener('click', e => { const b = e.target.closest('[data-sh]'); if (!b) return; A.closeSheet(); const line = b.dataset.sh.startsWith('línea'); addEl({ t: 'shape', k: b.dataset.sh, w: line ? 160 : 90, h: line ? 12 : 90, fill: ['#ffd1e3', '#d3e8ff', '#fff1a8', '#d2f0dc', '#e2d7ff'][Math.floor(Math.random() * 5)], c: '#b06a8a' }); }));
}
function imagesSheet() {
open('Imágenes', `<p style="margin:0 0 10px;font-family:var(--f-body)">Sube fotos o recortes para decorar. Después puedes moverlas, girarlas y ponerles marco.</p><input type="file" accept="image/*" multiple class="in" id="jImg"><div class="lab">Consejo</div><p style="margin:0;font-family:var(--f-body);font-size:13px">Los PNG con fondo transparente quedan como stickers.</p>`, sh => {
$('#jImg', sh).onchange = async e => {
const files = Array.from(e.target.files || []); if (!files.length) return; A.closeSheet(); A.toast('Subiendo…');
for (const f of files) {
try { const r = await Store.saveImage(f, 1200); const w = 170, h = Math.round(170 * r.h / r.w); addEl({ t: 'img', src: r.src, w, h: Math.min(260, h), frame: !/png/.test(f.type) }); }
catch (er) { A.toast('No pude abrir esa imagen'); }
}
if (Store.mode !== 'cloud') A.toast('Imagen agregada. En este dispositivo se guarda en tamaño reducido.');
};
});
}
function stickySheet() {
open('Notas adhesivas', `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${STICKY.map(c => `<button data-st="${c}" style="aspect-ratio:1;background:${c};border:1px solid rgba(0,0,0,.08);border-radius:6px;box-shadow:0 4px 10px rgba(60,40,30,.12)"></button>`).join('')}</div>`, sh => sh.addEventListener('click', e => { const b = e.target.closest('[data-st]'); if (!b) return; A.closeSheet(); const el = addEl({ t: 'sticky', c: b.dataset.st, w: 140, h: 140, txt: '', fs: 18, f: 'hand', r: Math.round(Math.random() * 6 - 3) }); const n = $(`.el[data-id="${el.id}"]`); if (n) startEdit(n, el); }));
}
function washiSheet() {
open('Washi', Object.entries(WASHI).map(([k, w]) => `<button class="opt" data-wk="${k}"><span style="width:56px;height:16px;display:inline-block;background:${w.css};border-radius:2px;opacity:.9"></span>${esc(w.name)} ${w.free || A.isPlus() || (A.owns && A.owns('washi:' + k)) ? '' : '<span class="tag gold" style="margin-left:auto">Meffy+</span>'}</button>`).join(''), sh => sh.addEventListener('click', e => {
const b = e.target.closest('[data-wk]'); if (!b) return; const w = WASHI[b.dataset.wk];
if (!w.free && !A.isPlus() && !(A.owns && A.owns('washi:' + b.dataset.wk))) { A.closeSheet(); A.openSheet('Washi de Meffy+', A.plusPitch('Este washi es parte de Meffy+.'), s => s.addEventListener('click', ev => { if (ev.target.closest('[data-go-plan]')) { A.closeSheet(); A.go('plan'); } })); return; }
A.closeSheet(); addEl({ t: 'washi', k: b.dataset.wk, w: 150, h: 26, r: Math.round(Math.random() * 16 - 8) });
}));
}
function symbolsSheet() {
open('Símbolos', `<input class="in" id="symQ" placeholder="Buscar… (corazón, estrella, flecha)" style="margin-bottom:8px">` + Object.entries(A.SYMBOLS).map(([g, list]) => `<div class="lab">${g}</div><div style="display:flex;flex-wrap:wrap;gap:6px">${list.map(s => `<button class="opt" data-sym="${esc(s)}" style="width:auto;margin:0;padding:8px 10px;font-size:15px">${esc(s)}</button>`).join('')}</div>`).join('') + `<div class="lab">El tuyo</div><div style="display:flex;gap:6px"><input class="in" id="symOwn" placeholder="Pega o escribe un símbolo"><button class="btn sm" id="symOk">Agregar</button></div>`, sh => {
sh.addEventListener('click', e => { const b = e.target.closest('[data-sym]'); if (b) { A.closeSheet(); placeSym(b.dataset.sym); } if (e.target.closest('#symOk')) { const v = $('#symOwn', sh).value.trim(); if (v) { A.closeSheet(); placeSym(v); } } });
$('#symQ', sh).oninput = e => { const q = e.target.value.toLowerCase(); const map = { coraz: '♡♥❣ᰔ', estrell: '✧✦⋆✩✪✶⟡', flor: '❀✿❁', flech: '➳➵➺↳⤷→⇢➝⟶↬', luna: '☾☽', cara: '()' }; const hit = Object.entries(map).find(([k]) => q && k.startsWith(q.slice(0, 5))); $$('[data-sym]', sh).forEach(b => { b.hidden = !!q && !(hit ? [...hit[1]].some(ch => b.dataset.sym.includes(ch)) : b.dataset.sym.includes(q)); }); };
});
}
function placeSym(s) { const w = Math.max(40, Math.min(300, s.length * 18)); addEl({ t: 'sym', txt: s, w, h: 40, fs: s.length > 4 ? 20 : 30, c: '#e2648f' }); }
function stickersSheet() {
const MOCHIS = ['gochi', 'canela', 'shey', 'pudin', 'gochi~fresa', 'canela~noche', 'shey~menta', 'pudin~chocolate', 'heart~noche', 'star~fresa', 'moon~menta', 'flower~noche'];
const regalos = (S.settings.giftStickers || []).filter(n => Pix.has(n));
const nuevos = Pix.names.filter(n => /^cs_/.test(n));
open('Stickers', `${nuevos.length ? `<div class="lab">Nuevos</div><div class="emojigrid">${nuevos.map(n => `<button data-sk="s:${n}"><img class="pixel" alt="" src="${Pix.sprite(n, 3)}"></button>`).join('')}</div>` : ''}${regalos.length ? `<div class="lab">Regalos de tus amigas</div><div class="emojigrid">${regalos.map(n => `<button data-sk="s:${n}"><img class="pixel" alt="" src="${Pix.sprite(n, 3)}"></button>`).join('')}</div>` : ''}<div class="lab">Stickers pixel</div><div class="emojigrid">${Pix.names.filter(n => !['gochi', 'canela', 'shey', 'pudin'].includes(n) && !/^(x_pared|x_piso|pg_|cp_|cf_|cfo_|cs_|ci_|__|m_|regalo_|plataforma)/.test(n)).map(n => `<button data-sk="s:${n}"><img class="pixel" alt="" src="${Pix.sprite(n, 3)}"></button>`).join('')}</div><div class="lab">Mascotas y colores especiales ${A.isPlus() || (A.owns && A.owns('stickers:pixel')) ? '' : '<span class="tag gold">Meffy+</span>'}</div><div class="emojigrid">${MOCHIS.map(n => `<button data-sk="s:${n}" data-special="1"><img class="pixel" alt="" src="${Pix.sprite(n, 3)}"></button>`).join('')}</div>`, sh => sh.addEventListener('click', e => {
const b = e.target.closest('[data-sk]'); if (!b) return;
if (b.dataset.special && !A.isPlus() && !(A.owns && A.owns('stickers:pixel'))) { A.closeSheet(); A.openSheet('Stickers especiales', A.plusPitch('Los stickers de las mascotas vienen con Meffy+ o se compran en la Tiendita.'), s => s.addEventListener('click', ev => { if (ev.target.closest('[data-go-plan]')) { A.closeSheet(); A.go('plan'); } })); return; }
A.closeSheet(); addEl({ t: 'sticker', v: b.dataset.sk, w: 64, h: 64, r: Math.round(Math.random() * 20 - 10) });
}));
}
function paperSheet() {
const p = curPage(); if (!p) return;
open('Página ' + (J.page + 1), `<div class="lab">Color del papel</div><div class="swatches">${PAPER.map(c => `<button class="sw" data-bg="${c}" aria-pressed="${p.bg === c}" style="background:${c};border-color:#e6ddd2"></button>`).join('')}</div>
<div class="lab">Fondo</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${[['lisa', 'Lisa'], ['cuadros', 'Cuadros'], ['puntos', 'Puntos'], ['lineas', 'Líneas']].map(([k, n]) => `<button class="opt" data-gr="${k}" style="justify-content:center;${p.grid === k ? 'outline:2px solid #e2648f;' : ''}">${n}</button>`).join('')}</div>
<div class="lab">Color de la cuadrícula</div><div class="swatches">${['#e6ddd2', '#f2c6d6', '#c9dcff', '#cfe9d9', '#e2d7ff', '#f3dca4'].map(c => `<button class="sw" data-gc="${c}" aria-pressed="${p.gridColor === c}" style="background:${c}"></button>`).join('')}</div>
<div class="lab">Tamaño de la cuadrícula</div><div style="display:flex;gap:8px;align-items:center"><button class="opt" data-gs="-2" style="width:auto;margin:0">−</button><span>${p.gs || 16}px</span><button class="opt" data-gs="2" style="width:auto;margin:0">+</button></div>`, sh => sh.addEventListener('click', e => {
const b = e.target.closest('[data-bg],[data-gr],[data-gc],[data-gs]'); if (!b) return; snapshot();
if (b.dataset.bg) p.bg = b.dataset.bg; if (b.dataset.gr) p.grid = b.dataset.gr; if (b.dataset.gc) p.gridColor = b.dataset.gc; if (b.dataset.gs) p.gs = Math.max(8, Math.min(40, (p.gs || 16) + +b.dataset.gs));
commit(); draw(); paperSheet();
}));
}
function myTpls() { return S.settings.jrTpls = S.settings.jrTpls || []; }
function pageFromTpl(t) { const pg = JSON.parse(JSON.stringify(t.page)); pg.id = uid(); (pg.els || []).forEach(e => e.id = uid()); pg.els = pg.els || []; return pg; }
function templatesSheet() {
const p = curPage(); if (!p) return; const mine = myTpls();
open('Plantilla de la página ' + (actIdx() + 1), Object.entries(TPLS).map(([k, n]) => `<button class="opt" data-tp="${k}" style="${p.tpl === k ? 'outline:2px solid #e2648f;' : ''}">${pxi({ semana: 'month', lista: 'check', gastos: 'moneda', mes: 'month', habitos: 'star', ahorro: 'piggy', deseos: 'gift', libre: 'ui_pagina' }[k], 20)} ${n}</button>`).join('') + '<p style="font-family:var(--f-body);font-size:12px;margin:8px 0 0">Tus decoraciones se quedan; solo cambia el contenido de fondo.</p>'
+ `<div class="lab">Mis plantillas</div>${mine.length ? mine.map(t => `<div style="display:flex;gap:6px;align-items:center"><button class="opt" data-mt="${t.id}" style="flex:1">${pxi('ui_plantilla', 20)} ${esc(t.name)}</button>${(S.settings.friends || []).length && A.sendTplTo ? `<button class="opt" data-mtsend="${t.id}" style="width:auto" aria-label="Mandar ${esc(t.name)} a una amiga">${pxi('pg_carta', 18)}</button>` : ''}<button class="opt" data-mtdel="${t.id}" style="width:auto;color:#a3264f" aria-label="Borrar ${esc(t.name)}">✕</button></div>`).join('') : '<p style="font-family:var(--f-body);font-size:12px;margin:0 0 6px">Decora una página como te guste y guárdala aquí para usarla otras semanas.</p>'}
<input class="in" id="mtName" placeholder="Nombre (ej. Mi semana bonita)" maxlength="30" style="margin:6px 0"><button class="opt" data-mtsave>${pxi('ui_plantilla', 20)} Guardar esta página como plantilla</button>`, sh => sh.addEventListener('click', e => {
const b = e.target.closest('[data-tp]'); if (b) { snapshot(); p.tpl = b.dataset.tp; if (p.tpl !== 'libre' && p.tpl !== 'semana' && p.grid === 'cuadros') p.grid = 'lisa'; commit(); A.closeSheet(); draw(); return; }
const sv = e.target.closest('[data-mtsave]'); if (sv) { if (mine.length >= 12) { A.toast('Tienes 12 plantillas. Borra una para guardar otra.'); return; } const pg = JSON.parse(JSON.stringify(p)); delete pg.id; delete pg.days; delete pg.cells; mine.push({ id: uid(), name: ($('#mtName', sh).value || '').trim() || 'Mi plantilla ' + (mine.length + 1), page: pg }); A.saveSettings(); A.toast('Plantilla guardada'); A.closeSheet(); return; }
const u = e.target.closest('[data-mt]'); if (u) { const t = mine.find(x => x.id === u.dataset.mt); if (!t) return; if (!u.dataset.s && (p.els || []).length) { u.dataset.s = 1; u.innerHTML = '¿Reemplazar lo que tiene esta página? Toca otra vez'; return; } snapshot(); J.doc.pages[actIdx()] = pageFromTpl(t); commit(); A.closeSheet(); draw(); return; }
const sd = e.target.closest('[data-mtsend]'); if (sd) { const t = mine.find(x => x.id === sd.dataset.mtsend); A.closeSheet(); open('¿A quién se la mandas?', (S.settings.friends || []).map(f => `<button class="opt" data-fsend="${esc(f.code)}">${pxi('heart', 18)} ${esc(f.name || f.code)}</button>`).join(''), s2 => s2.addEventListener('click', ev => { const b = ev.target.closest('[data-fsend]'); if (!b) return; A.closeSheet(); A.sendTplTo(b.dataset.fsend, t); })); return; }
const d = e.target.closest('[data-mtdel]'); if (d) { if (!d.dataset.s) { d.dataset.s = 1; d.textContent = '¿Seguro?'; return; } S.settings.jrTpls = mine.filter(x => x.id !== d.dataset.mtdel); A.saveSettings(); A.closeSheet(); templatesSheet(); }
}));
}
function addPageSheet() {
open('Páginas de esta semana', `<div class="lab">Agregar una página nueva</div>` + Object.entries(TPLS).map(([k, n]) => `<button class="opt" data-np="${k}">＋ ${n}</button>`).join('') + myTpls().map(t => `<button class="opt" data-npm="${t.id}">＋ ${pxi('ui_plantilla', 18)} ${esc(t.name)}</button>`).join('') + (J.doc.pages.length > 1 ? `<div class="lab">Esta página</div><button class="opt" data-delp style="color:#a3264f">✕ Borrar la página ${J.page + 1}</button>` : ''), sh => sh.addEventListener('click', e => {
const b = e.target.closest('[data-np]');
const bm = e.target.closest('[data-npm]'); if (bm) { const t = myTpls().find(x => x.id === bm.dataset.npm); if (t) { snapshot(); J.doc.pages.push(pageFromTpl(t)); J.page = J.doc.pages.length - 1; if (J.pagesShown === 2 && J.page % 2) J.page -= 1; commit(); A.closeSheet(); draw(); } return; }
if (b) { snapshot(); J.doc.pages.push(blankPage(b.dataset.np, b.dataset.np === 'libre' ? 'cuadros' : 'lisa')); J.page = J.doc.pages.length - 1; if (J.pagesShown === 2 && J.page % 2) J.page -= 1; commit(); A.closeSheet(); draw(); }
const d = e.target.closest('[data-delp]');
if (d) { if (!d.dataset.s) { d.dataset.s = 1; d.textContent = '¿Segura? Toca otra vez'; return; } snapshot(); J.doc.pages.splice(J.page, 1); J.page = Math.max(0, J.page - 1); commit(); A.closeSheet(); draw(); }
}));
}
function marksSheet() {
const marks = S.settings.jrMarks || []; const has = marks.some(m => m.key === J.key);
open('Marcadores', `<button class="opt" data-mk>${has ? '✕ Quitar marcador de esta semana' : pxi('ui_marcador', 18) + ' Marcar esta semana'}</button>${has ? '' : '<input class="in" id="mkL" placeholder="Nombre corto (ej. viaje, cumple)" maxlength="12" style="margin-bottom:8px">'}<div class="lab">Tus marcadores</div>${marks.length ? marks.map(m => `<button class="opt" data-go-k="${m.key}">${pxi('ui_marcador', 18)} ${esc(m.label)} · semana ${m.key.split('-W')[1]} de ${m.key.slice(0, 4)}</button>`).join('') : '<p style="margin:0">Aún no marcas ninguna semana.</p>'}`, sh => sh.addEventListener('click', e => {
if (e.target.closest('[data-mk]')) {
S.settings.jrMarks = has ? marks.filter(m => m.key !== J.key) : marks.concat({ key: J.key, label: ($('#mkL', sh) || {}).value || 'Sem ' + J.key.split('-W')[1] });
A.saveSettings(); A.closeSheet(); draw();
}
const g = e.target.closest('[data-go-k]'); if (g) { A.closeSheet(); leave(); J.key = g.dataset.goK; J.page = 0; render(root); }
}));
}
function jumpSheet() {
const d = weekDates(J.key)[3]; let y = d.getFullYear(), m = d.getMonth();
const draw2 = sh => {
const first = new Date(y, m, 1); const off = A.dowIdx(first); const n = new Date(y, m + 1, 0).getDate();
let cells = A.DOW.map(x => `<div style="text-align:center;font-size:11px">${x}</div>`).join(''); for (let i = 0; i < off; i++) cells += '<div></div>';
for (let i = 1; i <= n; i++) { const dd = new Date(y, m, i); const k = weekKey(dd); const has = !!Store.get('jr-' + k); cells += `<button data-day-k="${k}" class="opt" style="margin:0;justify-content:center;padding:8px 0;${k === J.key ? 'background:#ffd1e3;' : ''}${has ? 'font-weight:700;' : ''}">${i}${has ? '·' : ''}</button>`; }
$('#jumpBody', sh).innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><button class="opt" data-mm="-1" style="width:auto;margin:0">‹</button><b>${A.cap(A.MONTHS[m])} ${y}</b><button class="opt" data-mm="1" style="width:auto;margin:0">›</button></div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">${cells}</div><p style="font-family:var(--f-body);font-size:12px">Los días con · ya tienen páginas.</p>`;
};
open('Ir a otra semana', '<div id="jumpBody"></div>', sh => {
draw2(sh);
sh.addEventListener('click', e => {
const mm = e.target.closest('[data-mm]'); if (mm) { m += +mm.dataset.mm; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } draw2(sh); return; }
const b = e.target.closest('[data-day-k]'); if (b) { A.closeSheet(); leave(); J.key = b.dataset.dayK; J.page = 0; render(root); }
});
});
}
document.addEventListener('keydown', e => {
if (S.route !== 'journal' || J.editing || e.target.closest('input,textarea,[contenteditable="true"]')) return;
if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
if ((e.key === 'Delete' || e.key === 'Backspace') && J.sel) { const f = findEl(J.sel); if (f) { snapshot(); f.p.els = f.p.els.filter(x => x !== f.e); J.sel = null; commit(); draw(); } }
});
function openKey(key) { leave(); J.key = key; J.page = 0; J.sel = null; if (S.route === 'journal' && root) render(root); else A.go('journal'); }
function reload() { if (!J.key || !J.key.startsWith('sh-') || J.editing || S.route !== 'journal') return; const pg = J.page; loadWeek(J.key); J.page = Math.min(pg, J.doc.pages.length - 1); draw(); }
window.Journal = { render, leave, openKey, reload, get key() { return J.key; } };
})();
;document.getElementById('bootImg').src = Pix.sprite('pudin', 6); App.start();