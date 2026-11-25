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
const TXTS = [['ransom', 'Recortes'], ['hand', 'A mano'], ['badge', 'Medalla'], ['label', 'Etiqueta'], ['bold', 'Gigante'], ['note', 'Notita'], ['cloud', 'Nubecita'], ['marker', 'Marcador']];
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

// ---------- fotos pixel de ejemplo ----------
const SC = {};
function scene(k) {
  if (SC[k]) return SC[k]; const W = 72, H = 80, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const R = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); }, band = (cols, y0, y1) => { const n = cols.length, h = (y1 - y0) / n; cols.forEach((c, i) => R(c, 0, Math.round(y0 + i * h), W, Math.ceil(h) + 1)); }, dot = (c, x, y, r) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  if (k === 'sunset') { band(['#ffe9b8', '#ffd1a0', '#ffb3a0', '#ff94b0', '#e57fbc', '#b87ad0'], 0, 46); dot('#fff6c0', 36, 40, 12); R('#7a5aa8', 0, 42, W, 3); band(['#8a6ac0', '#7a5eb4', '#6a52a6', '#5a4698'], 45, H); for (let i = 0; i < 22; i++) R('#ffd6a0', 26 + (i * 7) % 22, 47 + (i * 5) % 30, 3 + i % 4, 1); R('#4a3a70', 54, 20, 2, 26); [[56, 22], [52, 24], [60, 24], [50, 28], [62, 28]].forEach(([x, y]) => R('#3f6b4f', x - 4, y, 9, 2)); [[8, 12], [20, 6], [46, 10]].forEach(([x, y]) => { R('#fff', x, y, 8, 2); R('#fff', x + 2, y - 1, 5, 1); }); }
  else if (k === 'flores') { band(['#aee0ff', '#c9eeff', '#e4f7ff'], 0, 38); dot('#fff3a0', 58, 14, 7); band(['#9fdc8a', '#86cf78', '#6fc067', '#5aae5a'], 36, H); [[6, 8], [24, 12]].forEach(([x, y]) => { R('#fff', x, y, 12, 3); R('#fff', x + 2, y - 2, 7, 2); }); const C = ['#ff8fb3', '#fff', '#ffd75e', '#c79bff', '#ff6f8f']; for (let i = 0; i < 34; i++) { const x = 4 + (i * 17) % 66, y = 42 + (i * 11) % 34, c = C[i % 5]; R('#3f9a52', x, y + 2, 1, 5); R(c, x - 1, y, 3, 1); R(c, x, y - 1, 1, 3); R('#ffd75e', x, y, 1, 1); } }
  else if (k === 'noche') { band(['#10143a', '#1a1f52', '#2a2a6a', '#3e3a80'], 0, 56); for (let i = 0; i < 26; i++) R(i % 4 ? '#fff6c8' : '#ffffff', (i * 23) % 70, (i * 13) % 34, 1, 1); dot('#fff6c0', 52, 14, 6); dot('#2a2a6a', 54, 12, 5); [[4, 34, 12, 46], [18, 26, 10, 54], [30, 38, 14, 42], [46, 30, 10, 50], [58, 36, 14, 44]].forEach(([x, y, w, h], i) => { R('#14183c', x, y, w, h); for (let a = 0; a < h - 6; a += 6) for (let b = 2; b < w - 2; b += 4) if ((a * 3 + b + i) % 3) R('#ffd75e', x + b, y + 3 + a, 2, 3); }); R('#0b0e2a', 0, 74, W, 6); }
  else if (k === 'montana') { band(['#cfe9ff', '#e4f3ff', '#fff2e0'], 0, 44); dot('#fff6c0', 14, 12, 5); g.fillStyle = '#7f9bc4'; g.beginPath(); g.moveTo(0, 46); g.lineTo(22, 14); g.lineTo(46, 46); g.fill(); g.fillStyle = '#6a86b4'; g.beginPath(); g.moveTo(26, 46); g.lineTo(50, 8); g.lineTo(76, 46); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(44, 17); g.lineTo(50, 8); g.lineTo(56, 18); g.lineTo(52, 15); g.lineTo(49, 19); g.fill(); band(['#7ec4d8', '#6ab4cc', '#5aa2c0'], 46, H); for (let i = 0; i < 10; i++) R('#cdeefb', 8 + (i * 13) % 58, 52 + (i * 7) % 24, 6, 1); for (let i = 0; i < 6; i++) { const x = 4 + i * 12, y = 40 + (i % 2) * 3; R('#2f6b4a', x + 2, y, 2, 6); R('#2f6b4a', x + 1, y + 2, 4, 3); R('#2f6b4a', x, y + 4, 6, 3); } }
  else if (k === 'cafe') { R('#f6dcc0', 0, 0, W, H); R('#e9c5a0', 0, 52, W, 28); R('#d9ac84', 0, 52, W, 2); R('#bfe6ff', 8, 6, 22, 24); R('#fff', 18, 6, 2, 24); R('#fff', 8, 17, 22, 2); R('#a9835c', 6, 4, 26, 3); R('#a9835c', 6, 30, 26, 3); R('#8a5a3c', 42, 12, 22, 3); dot('#7aa862', 53, 8, 5); R('#fff', 18, 52, 38, 6); R('#fff', 22, 58, 30, 8); R('#e8d4c0', 22, 64, 30, 2); R('#a0643c', 26, 50, 22, 3); R('#8a4e2c', 27, 51, 20, 1); R('#fff', 56, 54, 6, 8); R('#ff8fb3', 34, 51, 3, 1); R('#ff8fb3', 38, 51, 3, 1); R('#ff8fb3', 35, 52, 5, 1); R('#fff', 14, 40, 1, 8); R('#fff', 16, 36, 1, 10); R('#fff', 12, 38, 1, 8); R('#d9a05a', 6, 60, 12, 6); R('#c88a44', 8, 58, 8, 3); }
  else { band(['#2a1f5a', '#4a2f7a', '#7a3f98', '#b85fb0', '#ff8fb3'], 0, H); for (let i = 0; i < 40; i++) R(i % 5 ? '#fff6c8' : '#fff', (i * 29) % 70, (i * 17) % 60, 1, 1); dot('#fff6c0', 46, 22, 10); dot('#e8d6a0', 49, 20, 3); dot('#e8d6a0', 42, 26, 2); [[6, 52], [30, 58], [50, 54]].forEach(([x, y]) => { R('#ffd1e8', x, y, 18, 4); R('#ffd1e8', x + 3, y - 3, 11, 3); R('#ffe6f2', x + 4, y - 2, 6, 1); }); R('#ffd75e', 10, 14, 3, 1); R('#ffd75e', 11, 13, 1, 3); R('#ffd75e', 22, 30, 3, 1); R('#ffd75e', 23, 29, 1, 3); }
  return SC[k] = cv.toDataURL();
}
const SCENES = [['sunset', 'Atardecer'], ['flores', 'Flores'], ['cafe', 'Café'], ['noche', 'Ciudad'], ['montana', 'Montañas'], ['estrellas', 'Estrellas']];
const imgSrc = it => (it.img || '').startsWith('px:') ? scene(it.img.slice(3)) : it.img;
const O = '#5a3a3a';
const SVGS = {
  flecha: `<svg viewBox="0 0 100 70"><path d="M6 58C22 12 62 6 86 40" fill="none" stroke="${O}" stroke-width="3.5" stroke-linecap="round"/><path d="M70 36l17 5-4 17" fill="none" stroke="${O}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  circulo: `<svg viewBox="0 0 100 70"><path d="M52 6C88 4 98 30 88 50 76 70 22 68 10 46 0 24 22 8 58 12" fill="none" stroke="#ff6f9c" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  ondita: `<svg viewBox="0 0 100 30"><path d="M4 16q9-14 18 0t18 0 18 0 18 0 18 0" fill="none" stroke="#3f8fd9" stroke-width="4" stroke-linecap="round"/></svg>`,
  estrella: `<svg viewBox="0 0 100 100"><path d="M50 4l11 24 26-5-14 22 20 18-27 2-6 26-10-24-24 9 10-25-24-12 27-4z" fill="#ffe36b" stroke="${O}" stroke-width="3" stroke-linejoin="round"/></svg>`,
  flor: `<svg viewBox="0 0 100 100">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="50" cy="26" rx="14" ry="22" fill="#ffb3cf" stroke="${O}" stroke-width="3" transform="rotate(${a} 50 50)"/>`).join('')}<circle cx="50" cy="50" r="12" fill="#ffe36b" stroke="${O}" stroke-width="3"/></svg>`,
  corazon: `<svg viewBox="0 0 100 90"><path d="M50 84C14 56 4 38 4 26a22 22 0 0 1 46-6 22 22 0 0 1 46 6c0 12-10 30-46 58z" fill="#ff8fb3" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/><path d="M20 24q4-8 12-8" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
  brillo: `<svg viewBox="0 0 100 100"><path d="M50 4Q54 46 96 50 54 54 50 96 46 54 4 50 46 46 50 4z" fill="#fff7b0" stroke="${O}" stroke-width="3" stroke-linejoin="round"/></svg>`,
  nube: `<svg viewBox="0 0 100 64"><path d="M24 58a18 18 0 0 1 2-36 24 24 0 0 1 46-4 20 20 0 0 1 4 40z" fill="#fff" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/></svg>`,
  rayo: `<svg viewBox="0 0 70 100"><path d="M42 4L8 56h24l-8 40 38-56H36z" fill="#ffe36b" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/></svg>`,
  check: `<svg viewBox="0 0 100 80"><path d="M10 42l26 28L90 10" fill="none" stroke="#3fa56a" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  moneda: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#ffd75e" stroke="${O}" stroke-width="4"/><circle cx="50" cy="50" r="32" fill="none" stroke="#e0a52a" stroke-width="4"/><text x="50" y="66" font-size="46" font-weight="900" text-anchor="middle" fill="#c98a1a" font-family="Nunito,sans-serif">$</text></svg>`,
  corona: `<svg viewBox="0 0 100 80"><path d="M10 66L4 20l28 22 18-34 18 34 28-22-6 46z" fill="#ffd75e" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/><circle cx="50" cy="48" r="5" fill="#ff6f9c"/></svg>`
};
const PAPERS = { rosa: '#ffc7da', amarillo: '#fff0a0', azul: '#c4e4ff', kraft: '#e3c593', menta: '#c9efd8', lila: '#e2d4fa', blanco: '#ffffff', blonda: '#fffaf3' };
// ---------- cómo se dibuja cada cosa ----------
const hash = (s, i) => { let h = i * 7 + 3; for (const ch of s) h = (h * 33 + ch.charCodeAt(0)) >>> 0; return h; };
const RB = [['#fff', '#222'], ['#ffd1e0', '#b0305e'], ['#fff2a0', '#222'], ['#222', '#fff'], ['#cfe8ff', '#1f4f8f'], ['#d6f5d6', '#256b3a'], ['#ff8fb3', '#fff']];
const RF = ['Georgia,serif', 'Fredoka,sans-serif', '"Pixelify Sans",monospace', 'Comfortaa,sans-serif', 'Nunito,sans-serif'];
function textHTML(it) {
  const t = esc(it.txt || ''), ink = INK[it.c || 0] || INK[0], fs = (it.w * .12).toFixed(2) + 'cqw';
  if (it.st === 'ransom') return `<div class="vt-ransom" style="font-size:${Math.min(it.w * .2, 1.02 * it.w / Math.max(4, (it.txt || '').length)).toFixed(2)}cqw">${(it.txt || '').split(' ').map((wd, wi, arr) => { const off = arr.slice(0, wi).join(' ').length + (wi ? 1 : 0); return '<b class="vt-w">' + [...wd].map((ch, j) => { const i = off + j; const h = hash(it.txt, i), p = RB[h % RB.length]; return `<span style="background:${p[0]};color:${p[1]};font-family:${RF[(h >> 3) % RF.length]};transform:rotate(${((h >> 5) % 9) - 4}deg) translateY(${((h >> 7) % 5) - 2}%);font-weight:${(h >> 9) % 2 ? 800 : 500}">${esc(ch)}</span>`; }).join('') + '</b>'; }).join('<i class="sp"></i>')}</div>`;
  if (it.st === 'hand') return `<div class="vt-hand" style="font-size:${Math.min(it.w * .24, 1.9 * it.w / Math.max(5, (it.txt || '').length)).toFixed(2)}cqw;color:${ink}">${t}</div>`;
  if (it.st === 'badge') return `<div class="vt-badge" style="font-size:${Math.min(it.w * .3, 2.2 * it.w / Math.max(3, (it.txt || '').length)).toFixed(2)}cqw"><span style="color:${ink === '#ffffff' ? '#5a3a3a' : ink}">${t}</span></div>`;
  if (it.st === 'label') return `<div class="vt-label" style="font-size:${fs};color:${ink === '#ffffff' ? '#222' : ink}">${t}</div>`;
  if (it.st === 'bold') return `<div class="vt-bold" style="font-size:${Math.min(it.w * .2, 1.7 * it.w / Math.max(4, (it.txt || '').length)).toFixed(2)}cqw;color:${ink}">${t}</div>`;
  if (it.st === 'note') return `<div class="vt-note" style="font-size:${fs}"><i class="vt-tp"></i><span style="color:${ink === '#ffffff' ? '#5a3a3a' : ink}">${t}</span></div>`;
  if (it.st === 'cloud') return `<div class="vt-cloud" style="font-size:${fs};color:${ink === '#ffffff' ? '#5a3a3a' : ink}">${t}</div>`;
  return `<div class="vt-marker" style="font-size:${(it.w * .16).toFixed(2)}cqw;color:${ink}"><span>${t}</span></div>`;
}
const camera = () => `<div class="vp-empty"><img class="pixel" alt="" src="${spr(Pix.has('pic') ? 'pic' : 'estrellita', 3)}"><small>Tu foto</small></div>`;
function itemInner(it) {
  if (it.t === 'photo') { const im = it.img ? `<img class="vp-img ${(it.img || '').startsWith('px:') ? 'px' : ''}" alt="" draggable="false" src="${esc(imgSrc(it))}">` : camera(); return `<div class="vp vf-${it.fr || 'pola'}">${im}${it.fr === 'tape' ? '<i class="vp-t1"></i><i class="vp-t2"></i>' : ''}${it.fr === 'pola' && it.cap ? `<span class="vp-cap">${esc(it.cap)}</span>` : ''}</div>`; }
  if (it.t === 'text') return textHTML(it);
  if (it.t === 'svg') return `<div class="vsvg">${SVGS[it.k] || ''}</div>`;
  if (it.t === 'paper') return `<div class="vpaper pf-${it.fr || 'torn'}" style="--pc:${PAPERS[it.k] || '#ffc7da'};aspect-ratio:1/${it.ar || 1.1}"></div>`;
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
ACT.vbAddPhoto = () => sheet('Elegir foto', `<div class="sb-form"><button class="pl-btn" data-act="vbGal">De mi galería</button><div class="f">O una foto pixel de ejemplo</div><div class="vb-scenes">${SCENES.map(([k, n]) => `<button class="vb-scn" data-act="vbScn" data-k="${k}"><img class="px" alt="" src="${scene(k)}"><small>${n}</small></button>`).join('')}</div></div>`);
ACT.vbGal = () => { closeSheet(); pickPhoto((src, ar) => addIt({ t: 'photo', img: src, ar, fr: 'pola', w: 40 })); };
ACT.vbScn = a => { closeSheet(); addIt({ t: 'photo', img: 'px:' + a.dataset.k, ar: 1.1, fr: 'pola', w: 40 }); };
ACT.vbAddText = () => textSheet(null);
let stTab = 'dib';
const stkSheet = () => sheet('Stickers', `<div class="vb-chips" style="margin-bottom:10px">${[['dib', 'Dibujitos'], ['pap', 'Papeles'], ['pix', 'Pixel']].map(([k, n]) => `<button class="pl-chip ${stTab === k ? 'on' : ''}" data-act="vbStTab" data-k="${k}">${n}</button>`).join('')}</div>` + (stTab === 'dib' ? `<div class="vb-grid d">${Object.keys(SVGS).map(k => `<button class="vb-stk svg" data-act="vbSvg" data-k="${k}">${SVGS[k]}</button>`).join('')}</div>` : stTab === 'pap' ? `<div class="vb-grid d">${[['rosa', 'torn'], ['amarillo', 'torn'], ['azul', 'torn'], ['kraft', 'torn'], ['menta', 'torn'], ['lila', 'torn'], ['blonda', 'doily'], ['rosa', 'scallop'], ['blanco', 'round'], ['amarillo', 'plain']].map(([k, fr]) => `<button class="vb-stk" data-act="vbPap" data-k="${k}" data-fr="${fr}"><span class="vpaper pf-${fr}" style="--pc:${PAPERS[k]};width:44px;aspect-ratio:1"></span></button>`).join('')}</div>` : `<div class="vb-grid">${STK.map(n => `<button class="vb-stk" data-act="vbStk" data-n="${n}"><img class="pixel" alt="" src="${spr(n, 3)}"></button>`).join('')}</div>`));
ACT.vbAddStk = () => stkSheet();
ACT.vbStTab = a => { stTab = a.dataset.k; closeSheet(); setTimeout(stkSheet, 40); };
ACT.vbSvg = a => { closeSheet(); addIt({ t: 'svg', k: a.dataset.k, w: a.dataset.k === 'ondita' || a.dataset.k === 'circulo' ? 34 : 18, r: Math.round(Math.random() * 20 - 10) }); };
ACT.vbPap = a => { closeSheet(); const b = cur(); addIt({ t: 'paper', k: a.dataset.k, fr: a.dataset.fr, w: 56, ar: a.dataset.fr === 'round' || a.dataset.fr === 'doily' ? 1 : 1.1, z: Math.min(...b.items.map(x => x.z || 1)) - 1, x: 8, y: 20 }); };
ACT.vbStk = a => { closeSheet(); addIt({ t: 'spr', v: a.dataset.n, w: 16 });
};
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
  if (i.t === 'tape') return ACT.vbAddTape(); if (i.t === 'spr' || i.t === 'svg' || i.t === 'paper') return ACT.vbAddStk();
  sheet('Tu foto', `<div class="sb-form"><button class="pl-btn" data-act="vpNew">${i.img ? 'Cambiar la foto' : 'Elegir foto'}</button><div class="vb-scenes">${SCENES.map(([k, n]) => `<button class="vb-scn" data-act="vpScn" data-k="${k}"><img class="px" alt="" src="${scene(k)}"><small>${n}</small></button>`).join('')}</div><div class="f">Marco<div class="vb-chips">${FRAMES.map(([k, n]) => `<button class="pl-chip ${i.fr === k ? 'on' : ''}" data-act="vpFr" data-k="${k}">${n}</button>`).join('')}</div></div><label class="f">Frasecita (en la polaroid)<input class="in" id="vpCap" maxlength="30" value="${esc(i.cap || '')}"></label><button class="pl-btn" data-act="vpOk">Listo</button></div>`); };
ACT.vpScn = a => { const i = getSel(); if (i) { i.img = 'px:' + a.dataset.k; save(); closeSheet(); A.render(); } };
ACT.vpNew = () => pickPhoto((src, ar) => { const i = getSel(); if (i) { i.img = src; i.ar = ar; save(); closeSheet(); A.render(); } });
ACT.vpFr = a => { const i = getSel(); if (i) { i.cap = (gid('vpCap') || {}).value || i.cap; i.fr = a.dataset.k; save(); closeSheet(); A.render(); setTimeout(() => ACT.vbItemEdit(), 60); } };
ACT.vpOk = () => { const i = getSel(); if (i) { i.cap = gid('vpCap').value; save(); } closeSheet(); A.render(); };
// tableros
const TPL = [['vacio', 'En blanco', 'Solo el título'], ['rosa', 'Collage rosa', 'Fotos, notitas y cintas'], ['metas', 'Metas del año', 'Cuatro áreas de tu vida'], ['mood', 'Mi mood', 'Frases grandes y fotos redondas']];
const ph = (img, x, y, w, r, fr) => ({ t: 'photo', img: img ? 'px:' + img : '', ar: 1.1, fr, x, y, w, r }), tx = (txt, st, x, y, w, r, c) => ({ t: 'text', txt, st, x, y, w, r, c: c || 0 }), sp = (v, x, y, w, r) => ({ t: 'spr', v, x, y, w, r }), tp = (k, x, y, w, r) => ({ t: 'tape', k, x, y, w, r }), sv = (k, x, y, w, r) => ({ t: 'svg', k, x, y, w, r }), pp = (k, fr, x, y, w, r, ar) => ({ t: 'paper', k, fr, x, y, w, r, ar: ar || 1.1, z: -5 });
function tplItems(k, title) {
  const yr = (title.match(/20\d\d/) || [])[0] || String(new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0)), t0 = title.replace(/20\d\d/, '').trim() || 'Vision board', T = tx(t0.toUpperCase(), 'ransom', 6, 1.5, 88, -2);
  if (k === 'rosa') return [pp('rosa', 'torn', -6, -2, 72, -4, 1.2), pp('amarillo', 'torn', 42, 20, 62, 3, 1.3), pp('blonda', 'doily', -12, 56, 56, 0, 1), pp('kraft', 'torn', 52, 62, 54, -3, 1), T,
    tx(yr, 'badge', 64, 12, 30, 3, 2), ph('sunset', 7, 17, 40, -4, 'pola'), ph('flores', 53, 24, 38, 3, 'plain'), ph('cafe', 9, 47, 30, 2, 'round'), ph('montana', 46, 49, 40, -2, 'tape'),
    tx('YOUNG GIRL WITH BIG GOALS', 'label', 14, 74, 52, -2), tx('make art, make money', 'note', 66, 76, 30, 3, 0), tx('i am my own muse', 'hand', 8, 92, 52, -2, 1),
    sv('flecha', 40, 36, 16, 20), sv('circulo', 48, 21, 40, -4), sv('corazon', 84, 63, 11, 10), sv('flor', 1, 40, 13, -10), sv('brillo', 86, 8, 9, 0), sv('estrella', 38, 66, 9, 12), tp('rosa', 14, 15, 24, -8), tp('celeste', 60, 22, 22, 9), sp('mariposa', 78, 90, 12, 8)];
  if (k === 'metas') return [pp('lila', 'torn', -4, -2, 108, 0, 1.6), pp('amarillo', 'torn', 4, 56, 54, 2, 1), pp('menta', 'torn', 50, 26, 52, -3, 1.2), T,
    tx('AHORRAR', 'bold', 6, 14, 40, -3, 1), ph('estrellas', 52, 12, 38, 3, 'pola'), tx('VIAJAR', 'bold', 54, 41, 40, 2, 2), ph('montana', 6, 25, 38, -2, 'tape'), tx('cuidarme', 'hand', 8, 55, 36, -2, 3), ph('flores', 8, 62, 32, 2, 'round'), tx('estudiar', 'hand', 52, 58, 36, 3, 5), ph('noche', 50, 66, 38, -2, 'heart'),
    tx(yr, 'badge', 34, 82, 30, -2, 2), sv('brillo', 42, 22, 9, 8), sv('estrella', 88, 6, 8, 0), sv('flecha', 40, 48, 14, -10), sv('ondita', 4, 52, 30, -3), sv('corona', 86, 52, 10, 12)];
  if (k === 'mood') return [pp('amarillo', 'torn', -4, -2, 108, 0, 1.5), pp('rosa', 'torn', 40, 52, 66, -3, 1.2), pp('blonda', 'doily', -12, 62, 50, 0, 1), T,
    tx('I AM MY OWN MUSE', 'bold', 6, 14, 88, -3, 1), ph('sunset', 8, 38, 40, -3, 'round'), ph('cafe', 54, 36, 36, 3, 'stamp'), tx('finish your songs', 'cloud', 10, 70, 46, 2, 2), tx('hot girl walks', 'note', 58, 70, 34, -3, 0), tx('release music', 'hand', 12, 90, 50, -1, 5),
    sp('music', 82, 6, 12, 8), sv('corazon', 44, 62, 12, -10), sv('brillo', 6, 33, 10, 0), sv('rayo', 90, 33, 7, 12), tp('dorado', 24, 36, 24, -12), sv('ondita', 50, 90, 36, 2)];
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
    if (it.t === 'photo') { if (it.fr === 'pola') { g.fillStyle = '#fff'; g.shadowColor = 'rgba(0,0,0,.18)'; g.shadowBlur = 8; g.fillRect(0, 0, w, h); g.shadowBlur = 0; } const im = it.img ? await load(imgSrc(it)) : null; const pad = it.fr === 'pola' ? w * .05 : 0, ph2 = it.fr === 'pola' ? h - w * .05 - h * .14 : h; if (im) { const bx = pad, by = pad, bw2 = w - pad * 2, bh2 = ph2 - pad; g.save(); if (it.fr === 'round') { g.beginPath(); g.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, 7); g.clip(); } const sc = Math.max(bw2 / im.width, bh2 / im.height); g.beginPath(); g.rect(bx, by, bw2, bh2); if (it.fr !== 'round') g.clip(); g.drawImage(im, bx + (bw2 - im.width * sc) / 2, by + (bh2 - im.height * sc) / 2, im.width * sc, im.height * sc); g.restore(); } else { g.fillStyle = '#ffe3ee'; g.fillRect(pad, pad, w - pad * 2, ph2 - pad); } if (it.fr === 'pola' && it.cap) { g.fillStyle = '#5a3a3a'; g.font = `700 ${w * .075}px Quicksand,sans-serif`; g.textAlign = 'center'; g.fillText(it.cap, w / 2, h - h * .04); } }
    else if (it.t === 'svg') { const im = await load('data:image/svg+xml;charset=utf-8,' + encodeURIComponent((SVGS[it.k] || '').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))); if (im) g.drawImage(im, 0, 0, w, h); }
    else if (it.t === 'paper') { g.fillStyle = PAPERS[it.k] || '#ffc7da'; g.shadowColor = 'rgba(0,0,0,.2)'; g.shadowBlur = 8; if (it.fr === 'round' || it.fr === 'doily') { g.beginPath(); g.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, 7); g.fill(); } else g.fillRect(0, 0, w, h); g.shadowBlur = 0; }
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
