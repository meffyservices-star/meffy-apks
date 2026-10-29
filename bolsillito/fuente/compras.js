// ===== Bolsillito · Compras: listas de compras, cantidades, precios, despensa de la casa, comparar tiendas y totales semanal/mensual =====
(function () {
const A = App, S = A.S, { $, $$, esc, toast, openSheet, closeSheet, uid, today, ymd, parseYmd, addDays, money } = A;
const ACT = A.ACTIONS;

// ---------------- Dibujitos pixel ----------------
Pix.define('cp_leche', { raw: ["....................", ".......000000.......", "......01111110......", ".....0111111110.....", "....011111111110....", "....000000000000....", "....011111111110....", "....011111111110....", "....033333333330....", "....032222222230....", "....032244442230....", "....032244442230....", "....032222222230....", "....033333333330....", "....011111111110....", "....011111111110....", "....011111111110....", "....000000000000....", "....................", "...................."], pal: '#7a4a3a,#ffffff,#bfe3f7,#6fb3e0,#f6a5c0' });
Pix.define('cp_carne', { raw: ["....................", "....................", "......000000........", ".....01122110.......", "....0112222110......", "...011222221110.....", "...0111222111110....", "...01111111111110...", "...01111144111110...", "....0111144411110...", "....011111111110....", ".....0111111110.....", "......00111100......", "........0110........", "........0330........", ".......033330.......", "......03330330......", "......0330.00.......", ".......00...........", "...................."], pal: '#7a4a3a,#e8768a,#f6a5b4,#fff6e6,#ffd9df' });
Pix.define('cp_jabon', { raw: ["....................", "......00000.........", ".....0333330000.....", ".....03333333330....", ".....0333330000.....", "......00300.........", ".......030..........", "......00000.........", ".....0111110........", "....011111110.......", "....012111110.......", "....012444410.......", "....012444410.......", "....012444410.......", "....012111110.......", "....011111110.......", "....011111110.......", "....000000000.......", "....................", "...................."], pal: '#7a4a3a,#9fd9c8,#d6f3ea,#f27ea1,#ffffff' });
Pix.define('cp_ticket', { raw: ["....................", "...00000000000000...", "...01111111111110...", "...01222222222210...", "...01111111111110...", "...01333331111110...", "...01111111111110...", "...01333333311110...", "...01111111111110...", "...01333311111110...", "...01111111111110...", "...01444444444410...", "...01111111111110...", "...01555555555510...", "...01111111111110...", "...01010101010110...", "...0.0.0.0.0.0.0....", "....................", "....................", "...................."], pal: '#7a4a3a,#fffaf3,#f27ea1,#c9aaa9,#eedfd2,#7a4a3a' });
const CART = ["........................", "...........44...........", "..........4444.55.......", ".........444445555......", "..00....66444455556.....", ".0110.0000000000000000..", "..01001222222222222210..", "...0101212121212121210..", "...0101222222222222210..", "....011212121212121210..", "....011222222222222210..", ".....01212121212121210..", ".....01222222222222210..", "......0111111111111110..", "......0100000000000010..", ".......01..........10...", ".......01111111111110...", "........0..........0....", ".......000........000...", "......03330......03330..", ".......000........000...", "........................"];
const fix = (rows, w) => rows.map(r => (r + '.'.repeat(w)).slice(0, w));
const CARTP = '#7a4a3a,#f27ea1,#ffe3ec,#6b3b3f,#8fd16a,#ffb35c,#e8b46a';
Pix.define('x_carrito_super', { raw: fix(CART, 24), pal: CARTP });
Pix.define('cp_cart_vacio', { raw: fix(CART, 24).map((r, i) => i < 5 ? r.replace(/[456]/g, '.') : r), pal: CARTP });
if (A.FURN && !A.FURN.carrito_super) A.FURN.carrito_super = { name: 'Carrito de súper', w: 24, h: 22, price: 40, x: 70, y: 66, cat: 'mesas' };

// banner de la tiendita (toldo a rayas, estantes con frutas y frascos) para la cabecera de Compras
if (Pix.BANNERS && !Pix.BANNERS.tiendita) Pix.BANNERS.tiendita = { name: 'Tiendita', draw(ctx, W, H, r) {
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  for (let x = 0; x < W; x++) R(x, 0, 1, H, Math.floor(x / 6) % 2 ? '#fdf6e6' : '#fbeed3');
  // toldo
  for (let x = 0; x < W; x += 8) { R(x, 0, 4, 7, '#f48fb1'); R(x + 4, 0, 4, 7, '#ffffff'); }
  R(0, 0, W, 1, '#e0729a');
  for (let x = 0; x < W; x += 8) { const c = (x / 8) % 2 ? '#ffffff' : '#f48fb1'; R(x + 1, 7, 6, 1, c); R(x + 2, 8, 4, 1, c); R(x + 3, 9, 2, 1, c); }
  // estantes
  const shelf = y => { R(4, y, W - 8, 2, '#d39b68'); R(4, y + 2, W - 8, 1, '#b07a52'); };
  const fruit = (x, y, c, h) => { R(x, y, 3, 3, c); R(x + 1, y - 1, 1, 1, '#4f8a43'); if (h) R(x, y, 1, 1, h); };
  const jar = (x, y, c) => { R(x, y - 5, 4, 5, '#ffffff'); R(x, y - 3, 4, 3, c); R(x, y - 6, 4, 1, '#d39b68'); R(x + 1, y - 4, 1, 1, '#ffffff'); };
  const box = (x, y, c, c2) => { R(x, y - 6, 5, 6, c); R(x + 1, y - 4, 3, 2, c2); };
  shelf(19); shelf(31);
  const top = [['f', '#ff6f8f'], ['f', '#ffb35c'], ['j', '#ffd1df'], ['b', '#9fd6f2', '#ffffff'], ['f', '#8fd16a'], ['j', '#fff09a'], ['f', '#ff6f8f'], ['b', '#ffc4d4', '#e0729a'], ['j', '#c8f0d4'], ['f', '#ffb35c'], ['f', '#b59ae6'], ['j', '#ffd1df'], ['b', '#fff09a', '#d9a441'], ['f', '#ff6f8f'], ['f', '#8fd16a']];
  let x = 7; top.forEach(([t, c, c2], i) => { if (t === 'f') { fruit(x, 15, c, '#ffffff'); if (i % 2) fruit(x + 2, 16, c); x += 6; } else if (t === 'j') { jar(x, 19, c); x += 7; } else { box(x, 19, c, c2); x += 8; } });
  x = 9; [['b', '#9fd6f2', '#ffffff'], ['j', '#fff09a'], ['f', '#ff6f8f'], ['f', '#ffb35c'], ['b', '#c8f0d4', '#5f9e6a'], ['j', '#ffd1df'], ['f', '#8fd16a'], ['b', '#ffc4d4', '#e0729a'], ['j', '#d9c8f6'], ['f', '#ff6f8f']].forEach(([t, c, c2]) => { if (t === 'f') { fruit(x, 27, c, '#ffffff'); x += 6; } else if (t === 'j') { jar(x, 31, c); x += 8; } else { box(x, 31, c, c2); x += 9; } });
  // brillitos
  const st = (x, y, c) => { R(x, y - 1, 1, 3, c); R(x - 1, y, 3, 1, c); };
  for (let i = 0; i < 7; i++) st(6 + Math.floor(r() * (W - 12)), 11 + Math.floor(r() * 3), ['#ffb3cb', '#9fd6f2', '#ffe27a'][i % 3]);
  // ondita de abajo con puntitos, como el de Inicio
  const sc = (y, c, dots) => { R(0, y + 2, W, 60, c); for (let x = 0; x < W; x += 6) { R(x + 1, y, 4, 1, c); R(x, y + 1, 6, 1, c); } if (dots) for (let x = 3; x < W; x += 7) for (let yy = y + 5; yy < y + 40; yy += 6) R(x + ((yy / 6) % 2 ? 3 : 0), yy, 1, 1, '#ffffff'); };
  sc(H - 10, '#ffffff'); sc(H - 8, '#f48fb1', true);
} };
const spr = (n, sc) => Pix.sprite(n, sc || 3);
const img = (n, size, extra, cls) => `<img class="pixel ${cls || ''}" alt="" src="${spr(n, 3)}" style="width:${size}px;height:auto;${extra || ''}">`;
const online = () => Store.mode === 'supa' && Store.sb && navigator.onLine !== false;
const activePet = () => (A.petActive && A.petActive()) || 'gochi';
const petName = () => (A.petInfo ? A.petInfo(activePet()).name : 'Tu mascota');
const petSprite = () => (A.petInfo ? A.petInfo(activePet()).sprite : 'gochi');

A.PAGES.compras = 'Compras';
A.PAGES.compra = 'Lista de compras';
Object.values(A.PACKS).forEach(pk => { const t = pk.map.home && pk.map.home.includes('~') ? '~' + pk.map.home.split('~')[1] : ''; pk.map.compras = pk.map.compras || ('s:cart' + t); pk.map.compra = pk.map.compra || ('s:cart' + t); });

// ---------------- Datos ----------------
const C = () => {
  if (!S.cp) S.cp = Object.assign({ lists: [], prices: {}, pantry: [], hist: [], tpls: [], stores: [], monthBudget: 0, group: true, shDirty: [], shHidden: [] }, JSON.parse(JSON.stringify(Store.get('compras') || {})));
  return S.cp;
};
const save = () => Store.put('compras', C());
const L = id => C().lists.find(l => l.id === id);
const cur = () => L(S.cpOpen);

const UNITS = [['und', 'und'], ['kg', 'kg'], ['g', 'g'], ['lb', 'lb'], ['L', 'litro'], ['ml', 'ml'], ['paq', 'paquete'], ['doc', 'docena']];
const unitN = u => (UNITS.find(x => x[0] === u) || UNITS[0])[1];
const CATS = {
  frutas: { n: 'Frutas', ic: 'apple', bg: '#ffe0e6' },
  verduras: { n: 'Verduras', ic: 'brote', bg: '#e3f3df' },
  carnes: { n: 'Carnes y pescado', ic: 'cp_carne', bg: '#ffe3e3' },
  lacteos: { n: 'Lácteos y huevos', ic: 'cp_leche', bg: '#e1effb' },
  pan: { n: 'Panadería', ic: 'pan', bg: '#fff1d6' },
  despensa: { n: 'Granos y despensa', ic: 'bolsa', bg: '#fff4c2' },
  bebidas: { n: 'Bebidas', ic: 'coffee', bg: '#efe6fb' },
  snacks: { n: 'Dulces y snacks', ic: 'helado', bg: '#ffe8f2' },
  limpieza: { n: 'Limpieza', ic: 'cp_jabon', bg: '#dcf3ec' },
  aseo: { n: 'Aseo personal', ic: 'gota', bg: '#e6f4ff' },
  farmacia: { n: 'Farmacia', ic: 'med', bg: '#e1effb' },
  mascotas: { n: 'Mascotas', ic: 'paw', bg: '#f3e4dc' },
  otros: { n: 'Otros', ic: 'cart', bg: '#fde3ea' }
};
const CK = Object.keys(CATS);
const cat = k => CATS[k] || CATS.otros;
const tile = (k, size) => `<span class="cp-tile" style="background:${cat(k).bg};width:${size}px;height:${size}px">${img(cat(k).ic, Math.round(size * .68))}</span>`;
const KINDS = { super: { n: 'Súper', ic: 'cart', bg: '#ffe0ea' }, mercado: { n: 'Mercado', ic: 'apple', bg: '#e3f3df' }, farmacia: { n: 'Farmacia', ic: 'med', bg: '#e1effb' }, casa: { n: 'Casa', ic: 'cp_jabon', bg: '#dcf3ec' }, otro: { n: 'Otra', ic: 'bolsa', bg: '#fff4c2' } };
const kind = k => KINDS[k] || KINDS.otro;

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const pkey = s => norm(s).replace(/(es|s)$/, '');
const KW = [
  ['mascotas', 'croqueta,comida de gato,comida de perro,comida para gato,comida para perro,arena para gato,arena de gato,dog chow,whiskas,pedigree,cat chow,snack de perro'],
  ['farmacia', 'pastilla,paracetamol,ibuprofeno,vitamina,alcohol,curita,jarabe,medicina,remedio,gasa,suero,termometro'],
  ['limpieza', 'detergente,cloro,desinfectante,jabon de ropa,jabon de platos,lavavajilla,esponja,suavizante,escoba,trapeador,funda de basura,fundas de basura,papel aluminio,servilleta,limpiavidrios,ambiental,deja,ace,fab,lustre'],
  ['aseo', 'papel higienico,papel de bano,shampoo,champu,acondicionador,jabon,pasta dental,crema dental,cepillo,desodorante,toalla,panal,algodon,hilo dental,enjuague,protector,afeitadora,toallas sanitarias,crema'],
  ['frutas', 'tomate de arbol,manzana,banano,guineo,platano,pera,uva,fresa,frutilla,naranja,mandarina,limon,pina,papaya,sandia,melon,mango,mora,aguacate,kiwi,durazno,maracuya,naranjilla,coco,frambuesa,arandano,taxo,granadilla'],
  ['verduras', 'tomate,cebolla,papa,zanahoria,lechuga,brocoli,pimiento,ajo,pepino,col,culantro,cilantro,perejil,apio,espinaca,choclo,yuca,verde,vainita,zapallo,remolacha,champinon,coliflor,rabano,zuquini,arveja,haba'],
  ['carnes', 'pollo,carne,res,cerdo,chancho,pescado,atun,salchicha,jamon,mortadela,camaron,chuleta,pechuga,molida,tocino,chorizo,costilla,tilapia,salmon,alitas,pavo,sardina'],
  ['lacteos', 'leche,queso,yogur,yogurt,mantequilla,huevo,crema de leche,margarina,manjar,quesillo'],
  ['snacks', 'chocolate,galleta,chifle,papitas,caramelo,chicle,helado,snack,dulce,gomita,cereal de chocolate,nachos,doritos,canguil,palomita'],
  ['pan', 'pan,baguette,tostada,croissant,cachito,torta,pastel,tortilla,empanada,bizcocho'],
  ['bebidas', 'agua,jugo,gaseosa,cola,coca,sprite,fanta,cafe,te,cerveza,vino,bebida,nescafe,colada,horchata,leche de almendra,energizante,gatorade'],
  ['despensa', 'arroz,azucar,sal,aceite,fideo,pasta,harina,avena,lenteja,frejol,menestra,salsa,mayonesa,ketchup,mostaza,vinagre,enlatado,especia,comino,oregano,cereal,maiz,quinoa,mermelada,panela,miel,granola,maicena,polvo de hornear,levadura,condimento,caldo,sopa,arveja seca']
].map(([k, s]) => [k, s.split(',')]);
function guessCat(name) {
  const own = C().prices[pkey(name)]; if (own && own.cat) return own.cat;
  const n = ' ' + norm(name) + ' ';
  for (const [k, ws] of KW) if (ws.some(w => n.includes(' ' + w))) return k;
  return 'otros';
}

// ---------------- Entender lo que escribe o dicta: "2 kg de tomate", "media docena de huevos", "leche x3 a $1.10" ----------------
const NUMW = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, doce: 12, media: .5, medio: .5 };
const UNW = [[/^(kg|kgs|kilos?|kilogramos?)$/, 'kg'], [/^(g|gr|grs|gramos?)$/, 'g'], [/^(lb|lbs|libras?)$/, 'lb'], [/^(l|lt|lts|litros?)$/, 'L'], [/^(ml|mililitros?)$/, 'ml'], [/^(paq|paquetes?|fundas?|bolsas?|cajas?|latas?|frascos?|botellas?|tarros?)$/, 'paq'], [/^(docenas?)$/, 'doc'], [/^(und|unid|unidades?|u)$/, 'und']];
const toUnit = w => { const x = norm(w); for (const [re, u] of UNW) if (re.test(x)) return u; return null; };
function parseItem(raw) {
  let s = String(raw || '').replace(/^[\s\-–•*·>]+|\[\s?[xX]?\s?\]/g, '').trim(); if (!s) return null;
  let price = null, qty = 1, unit = null;
  const pm = s.match(/(?:\ba\s*|\s|^)\$\s?(\d+(?:[.,]\d{1,2})?)|\ba\s+(\d+(?:[.,]\d{1,2})?)\s*(?:dolares|usd)?$/i);
  if (pm) { price = parseFloat((pm[1] || pm[2]).replace(',', '.')); s = s.replace(pm[0], ' ').trim(); }
  const xm = s.match(/\s[xX]\s?(\d+(?:[.,]\d+)?)$/); if (xm) { qty = parseFloat(xm[1].replace(',', '.')); s = s.slice(0, xm.index).trim(); }
  const words = s.split(/\s+/);
  const w0 = norm(words[0]);
  let n = null;
  if (/^\d+([.,]\d+)?$/.test(w0)) n = parseFloat(w0.replace(',', '.'));
  else if (/^\d+\/\d+$/.test(w0)) { const [a, b] = w0.split('/').map(Number); n = b ? a / b : null; }
  else if (/^(\d+(?:[.,]\d+)?)(kg|g|gr|lb|l|ml)$/.test(w0)) { const m = w0.match(/^(\d+(?:[.,]\d+)?)([a-z]+)$/); n = parseFloat(m[1].replace(',', '.')); unit = toUnit(m[2]); }
  else if (NUMW[w0] != null) n = NUMW[w0];
  if (n != null) {
    words.shift();
    if (!unit && words.length > 1 && toUnit(words[0])) unit = toUnit(words.shift());
    if (words.length > 1 && norm(words[0]) === 'de') words.shift();
    qty = n * (xm ? qty : 1);
  } else {
    const tm = s.match(/\s(\d+(?:[.,]\d+)?)\s?(kg|kilos?|g|gr|gramos?|lb|libras?|l|litros?|ml|paquetes?|docenas?|unidades?)$/i);
    if (tm) { qty = parseFloat(tm[1].replace(',', '.')); unit = toUnit(tm[2]); words.length = 0; words.push(...s.slice(0, tm.index).trim().split(/\s+/)); }
  }
  if (unit === 'doc' && /huevo/i.test(words.join(' '))) { qty = qty * 12; unit = 'und'; }
  let name = words.join(' ').trim(); if (!name) return null;
  name = name.charAt(0).toUpperCase() + name.slice(1);
  const known = C().prices[pkey(name)];
  return { id: 'i' + uid(), name, qty: Math.round(qty * 1000) / 1000 || 1, unit: unit || (known && known.unit) || 'und', price: price != null ? price : (known ? known.last.p : 0), cat: guessCat(name), done: false };
}
const splitSpeech = t => String(t || '').split(/,|;|\n|\s+y\s+(?=\S)|\s+tambien\s+|\s+también\s+|\s+luego\s+|\s+ademas\s+|\s+además\s+/i).map(x => x.trim()).filter(Boolean);

// ---------------- Cuentas ----------------
const qtyTxt = (q, u) => { const v = Math.round((+q || 0) * 1000) / 1000; return `${String(v).replace('.', ',')} ${u === 'und' ? (v === 1 ? 'und' : 'und') : unitN(u)}`; };
const iTot = i => (+i.qty || 0) * (+i.price || 0);
const tot = l => l.items.reduce((s, i) => s + iTot(i), 0);
const inCart = l => l.items.filter(i => i.done).reduce((s, i) => s + iTot(i), 0);
const doneN = l => l.items.filter(i => i.done).length;
const pct = (a, b) => b > 0 ? Math.max(0, Math.min(100, Math.round(a / b * 100))) : 0;
const wkStart = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -((x.getDay() + 6) % 7)); };
const thisWeek = () => ymd(wkStart(new Date()));
const thisMonth = () => today().slice(0, 7);
const histIn = (from, to) => C().hist.filter(h => h.date >= from && h.date <= to);
const sumH = H => H.reduce((s, h) => s + (+h.total || 0), 0);
const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const shortD = s => { const d = parseYmd(s); return `${d.getDate()} ${MES[d.getMonth()].slice(0, 3)}`; };

// ---------------- Libreta de precios ----------------
function notePrice(it, store, date) {
  if (!(+it.price > 0)) return;
  const k = pkey(it.name), P = C().prices, d = date || today();
  const p = P[k] = P[k] || { name: it.name, unit: it.unit, cat: it.cat, hist: [] };
  p.name = it.name; p.unit = it.unit; p.cat = it.cat;
  const last = p.hist[p.hist.length - 1];
  if (last && last.d === d && (last.s || '') === (store || '')) last.p = +it.price; else p.hist.push({ p: +it.price, d, s: store || '' });
  p.hist = p.hist.slice(-16); p.last = { p: +it.price, d, s: store || '' };
}
function trend(k) { const p = C().prices[k]; if (!p || p.hist.length < 2) return 0; const a = p.hist[p.hist.length - 2].p, b = p.hist[p.hist.length - 1].p; return b > a + .001 ? 1 : b < a - .001 ? -1 : 0; }
function bestStore(k) { const p = C().prices[k]; if (!p) return null; const m = {}; p.hist.forEach(h => { if (h.s) m[h.s] = h.p; }); const e = Object.entries(m); if (e.length < 2) return null; e.sort((a, b) => a[1] - b[1]); return { s: e[0][0], p: e[0][1], worst: e[e.length - 1] }; }
const arrow = t => t > 0 ? '<span class="cp-tr up" title="Subió">▲</span>' : t < 0 ? '<span class="cp-tr down" title="Bajó">▼</span>' : '';

// ---------------- Listas compartidas (con internet; sin internet se guardan y suben después) ----------------
const SH = { base: {}, rows: {}, chans: {}, timers: {}, loaded: false, loading: false };
const clone = o => JSON.parse(JSON.stringify(o));
const sameJ = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function m3(base, loc, rem) {
  const B = new Map((base || []).map(x => [x.id, x])), Lm = new Map((loc || []).map(x => [x.id, x])), R = new Map((rem || []).map(x => [x.id, x]));
  const out = [], seen = new Set();
  [...(loc || []), ...(rem || [])].forEach(x => { if (seen.has(x.id)) return; seen.add(x.id); const b = B.get(x.id), l = Lm.get(x.id), r = R.get(x.id);
    if (l && r) out.push(!sameJ(l, b) ? l : r); else if (l) { if (!b) out.push(l); } else if (r) { if (!b) out.push(r); } });
  return out;
}
const bodyOf = l => ({ items: l.items, budget: l.budget || 0, kind: l.kind, repeat: l.repeat || null });
const dirty = rid => { const D = C().shDirty; if (!D.includes(rid)) D.push(rid); };
function touch(l) { if (l && l.shared) { dirty(l.shared); clearTimeout(SH.timers[l.shared]); SH.timers[l.shared] = setTimeout(() => pushShared(l.shared), 1200); } }
async function pushShared(rid) {
  const l = C().lists.find(x => x.shared === rid); if (!l) { C().shDirty = C().shDirty.filter(x => x !== rid); return; }
  if (!online()) return;
  try {
    const { data: row, error: e1 } = await Store.sb.from('shared_lists').select('body, title').eq('id', rid).maybeSingle(); if (e1) throw e1;
    if (!row) { delete l.shared; C().shDirty = C().shDirty.filter(x => x !== rid); save(); return; }
    const base = SH.base[rid] || { items: [] }, loc = bodyOf(l), rem = row.body || { items: [] };
    const merged = Object.assign({}, rem, { items: m3(base.items, loc.items, rem.items) });
    ['budget', 'kind', 'repeat'].forEach(k => { if (loc[k] !== base[k]) merged[k] = loc[k]; });
    const upd = { body: merged, updated_by: Store.uid, updated_at: new Date().toISOString() }; if (l.name !== row.title) upd.title = l.name;
    const { error } = await Store.sb.from('shared_lists').update(upd).eq('id', rid); if (error) throw error;
    SH.base[rid] = clone(merged); l.items = clone(merged.items); l.budget = merged.budget; l.kind = merged.kind; l.repeat = merged.repeat;
    C().shDirty = C().shDirty.filter(x => x !== rid); save();
    if (['compras', 'compra'].includes(S.route) && !document.querySelector('.scrim:not([hidden])')) A.render();
  } catch (e) { console.warn('lista compartida', e); SH.timers[rid] = setTimeout(() => pushShared(rid), 6000); }
}
function listen(rid) {
  if (SH.chans[rid] || !online() || !Store.sb.channel) return;
  SH.chans[rid] = Store.sb.channel('sl-' + rid).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'shared_lists', filter: 'id=eq.' + rid }, pl => {
    const row = pl.new; if (!row || row.updated_by === Store.uid) return;
    const l = C().lists.find(x => x.shared === rid); if (!l) return;
    const body = row.body || { items: [] };
    if (C().shDirty.includes(rid)) { l.items = m3((SH.base[rid] || {}).items, l.items, body.items); }
    else { l.items = clone(body.items || []); l.budget = body.budget; l.kind = body.kind || l.kind; l.repeat = body.repeat || null; l.name = row.title || l.name; }
    SH.base[rid] = clone(body); SH.rows[rid] = row; save();
    if (['compras', 'compra'].includes(S.route) && !document.querySelector('.scrim:not([hidden])')) { A.render(); toast((Object.entries(row.names || {}).find(([u]) => u === row.updated_by) || [, 'Tu amiga'])[1] + ' cambió la lista'); }
  }).subscribe();
}
async function loadShared() {
  if (!online() || SH.loading) return; SH.loading = true;
  try {
    const { data, error } = await Store.sb.from('shared_lists').select('id, owner, members, names, title, body, updated_by, updated_at').order('updated_at', { ascending: false }).limit(30); if (error) throw error;
    let changed = false;
    (data || []).forEach(row => {
      SH.rows[row.id] = row; if (C().shHidden.includes(row.id)) return;
      const body = row.body || { items: [] };
      let l = C().lists.find(x => x.shared === row.id);
      if (!l) { l = { id: 'l' + uid(), shared: row.id, name: row.title, kind: body.kind || 'super', budget: body.budget || 0, repeat: body.repeat || null, items: clone(body.items || []), created: today() }; C().lists.push(l); changed = true; SH.base[row.id] = clone(body); }
      else if (C().shDirty.includes(row.id)) { if (!SH.base[row.id]) SH.base[row.id] = clone(body); pushShared(row.id); }
      else if (!sameJ(l.items, body.items || []) || l.name !== row.title) { l.items = clone(body.items || []); l.budget = body.budget; l.name = row.title; changed = true; SH.base[row.id] = clone(body); }
      else SH.base[row.id] = clone(body);
      listen(row.id);
    });
    SH.loaded = true; if (changed) { save(); if (['compras', 'compra'].includes(S.route)) A.render(); }
  } catch (e) { console.warn('listas compartidas', e); } finally { SH.loading = false; }
}
const sharedWith = l => { const r = l.shared && SH.rows[l.shared]; if (!r) return ''; return Object.entries(r.names || {}).filter(([u]) => u !== Store.uid).map(([, n]) => n).join(', '); };
addEventListener('online', () => { C().shDirty.forEach(pushShared); loadShared(); });

// ---------------- Pantalla principal ----------------
const TABS = [['listas', 'Listas'], ['casa', 'En casa'], ['precios', 'Precios'], ['resumen', 'Resumen']];
const TAB_IC = { listas: 'cp_ticket', casa: 'casita', precios: 'estrellita', resumen: 'trofeo' };
// cabecera: el banner con Ale (el pudín) empujando su carrito, como el de Inicio
function bannerTop() {
  const bs = S.settings.banners = S.settings.banners || {}; if (!bs.compras) bs.compras = { preset: 'tiendita' };
  const plan = C().lists.reduce((n, l) => n + l.items.filter(i => !i.done).length, 0);
  const wk = sumH(histIn(thisWeek(), '9999'));
  const ale = A.wear ? A.wear('ale', { scale: 4 }) : img('pudin', 76);
  const inner = `<div class="greet">Compras<small>${plan ? `Te faltan ${plan === 1 ? '1 cosita' : plan + ' cositas'}` : wk > 0 ? 'Esta semana llevas ' + money(wk) : '¿Qué toca comprar hoy?'}</small></div>
<div class="cp-bn-art" aria-hidden="true"><span class="cp-bn-ale">${ale}</span><span class="cp-bn-cart">${img(plan > 0 || wk > 0 ? 'x_carrito_super' : 'cp_cart_vacio', 74)}</span></div>${A.privBtn ? A.privBtn('onbanner') : ''}`;
  const h = A.bannerHTML ? A.bannerHTML('compras', inner) : '';
  return h ? h.replace('class="banner"', 'class="banner cp-banner"') : A.header('compras', A.privBtn ? A.privBtn() : '');
}
const tab = () => S.cpTab || 'listas';
A.screens.compras = () => {
  C(); if (!SH.loaded) loadShared();
  const t = tab();
  return `${bannerTop()}
<div class="seg cp-tabs" role="tablist">${TABS.map(([k, n]) => `<button role="tab" data-act="cpTab" data-v="${k}" aria-pressed="${t === k}">${img(TAB_IC[k], 18)}<span>${n}</span></button>`).join('')}</div>
${t === 'casa' ? casaHTML() : t === 'precios' ? preciosHTML() : t === 'resumen' ? resumenHTML() : listasHTML()}`;
};
ACT.cpTab = a => { S.cpTab = a.dataset.v; A.render(); };

function heroHTML() {
  const w0 = thisWeek(), m0 = thisMonth() + '-01';
  const wk = sumH(histIn(w0, '9999')), mo = sumH(histIn(m0, '9999'));
  const plan = C().lists.reduce((s, l) => s + l.items.filter(i => !i.done).reduce((n, i) => n + iTot(i), 0), 0);
  const mb = +C().monthBudget || 0;
  const stat = (ic, bg, k, v, sub2) => `<div class="cp-st"><span class="cp-st-ic" style="background:${bg}">${img(ic, 26)}</span><span class="cp-st-k">${k}</span><b class="cp-money">${v}</b>${sub2 ? `<span class="cp-st-s">${sub2}</span>` : ''}</div>`;
  return `<div class="cp-hero2">
<div class="cp-hero2-h"><b>Tu carrito</b><span>${MES[new Date().getMonth()]}</span></div>
<div class="cp-stats">${stat('cp_ticket', '#ffe3ec', 'Esta semana', money(wk))}${stat('bolsa', '#fff3c4', 'En ' + MES[new Date().getMonth()], money(mo), mb ? 'de ' + money(mb) : '')}${stat('x_carrito_super', '#dff3e6', 'En tus listas', money(plan), plan ? 'por comprar' : '')}</div>
${mb ? `<span class="cp-bar ${mo > mb ? 'over' : mo > mb * .85 ? 'warn' : ''}"><i style="width:${pct(mo, mb)}%"></i></span><span class="cp-hero2-f">${mo > mb ? 'Te pasaste por ' + money(mo - mb) : 'Te quedan ' + money(mb - mo) + ' para compras este mes'}</span>` : ''}</div>`;
}
function listCard(l) {
  const n = l.items.length, d = doneN(l), T = tot(l), k = kind(l.kind), over = l.budget > 0 && T > l.budget, sw = sharedWith(l);
  return `<button class="cp-lcard" data-act="cpOpen" data-id="${esc(l.id)}" style="--k:${k.bg}">
<span class="cp-tile" style="background:${k.bg};width:48px;height:48px">${img(k.ic, 32)}</span>
<span class="cp-lcard-tx"><b>${esc(l.name)}</b><span>${n ? `${d} de ${n} en el carrito` : 'Vacía · toca para anotar'}${l.repeat ? ' · se repite ' + (l.repeat === 'weekly' ? 'cada semana' : 'cada mes') : ''}</span>${sw ? `<span class="cp-with">${img('heart', 12)} con ${esc(sw)}</span>` : ''}
<span class="cp-bar ${over ? 'over' : ''}"><i style="width:${pct(d, n)}%"></i></span></span>
<span class="cp-lcard-r"><b class="cp-money">${money(T)}</b>${l.budget ? `<span class="${over ? 'neg' : 'faint'}">de ${money(l.budget)}</span>` : ''}</span></button>`;
}
function listasHTML() {
  const Ls = C().lists;
  const lowN = C().pantry.filter(p => p.state !== 'ok').length;
  return `${heroHTML()}
<div class="cp-sec"><h3>Mis listas</h3><button class="btn pink sm" data-act="cpNew">+ Nueva lista</button></div>
${Ls.length ? `<div class="cp-lists">${Ls.map(listCard).join('')}</div>` : `<div class="card cp-empty"><span class="cp-empty-art">${img('cp_ticket', 50, '', 'cp-float')}${img('cp_leche', 34, '', 'cp-float b')}${img('cp_carne', 34, '', 'cp-float c')}</span><b>Arma tu primera lista</b><span class="faint">Anota lo que necesitas, con cantidad y precio. Te voy sumando el total mientras compras.</span><button class="btn pink" data-act="cpNew">Crear lista</button></div>`}
${lowN ? `<button class="card cp-tip" data-act="cpTab" data-v="casa">${img('bolsa', 30)}<span><b>Se te está acabando ${lowN === 1 ? '1 cosita' : lowN + ' cositas'} en casa</b><br><span class="faint">Toca para pasarlas a una lista</span></span><span class="cp-chev">›</span></button>` : ''}
${C().tpls.length ? `<div class="cp-sec"><h3>Plantillas</h3></div><div class="cp-tpls">${C().tpls.map(t => `<div class="cp-tpl"><button data-act="cpFromTpl" data-id="${esc(t.id)}">${img(kind(t.kind).ic, 26)}<span><b>${esc(t.name)}</b><span>${t.items.length} cosas</span></span></button><button class="iconbtn sm" data-act="cpTplDel" data-id="${esc(t.id)}" aria-label="Borrar plantilla">×</button></div>`).join('')}</div>` : ''}
${C().hist.length ? `<div class="cp-sec"><h3>Compras recientes</h3><button class="btn sm" data-act="cpTab" data-v="resumen">Ver resumen</button></div><div class="cp-hist">${C().hist.slice(0, 5).map(histRow).join('')}</div>` : ''}`;
}
const histRow = h => `<button class="cp-hrow" data-act="cpHist" data-id="${esc(h.id)}">${img('cp_ticket', 28)}<span class="cp-lcard-tx"><b>${esc(h.name)}</b><span>${shortD(h.date)}${h.store ? ' · ' + esc(h.store) : ''} · ${h.items.length} cosas</span></span><b class="cp-money">${money(h.total)}</b></button>`;

// ---------------- Nueva lista ----------------
function newListSheet(preset) {
  const d = Object.assign({ name: '', kind: 'super', budget: '', repeat: null }, preset || {});
  openSheet('Nueva lista', `<div class="stack">
<div class="cp-kinds">${Object.entries(KINDS).map(([k, v]) => `<button type="button" class="cp-k" data-k="${k}" aria-pressed="${d.kind === k}"><span class="cp-tile" style="background:${v.bg};width:42px;height:42px">${img(v.ic, 28)}</span><span>${v.n}</span></button>`).join('')}</div>
<label class="f">Nombre<input class="in" id="cpN" maxlength="40" value="${esc(d.name)}" placeholder="Ej. Súper de la semana"></label>
<label class="f">Presupuesto (si quieres)<input class="in" id="cpB" type="number" inputmode="decimal" step="0.01" min="0" value="${esc(d.budget)}" placeholder="Ej. 60"></label>
<div class="f">¿Se repite?<div class="seg" id="cpRep"><button type="button" data-rep="" aria-pressed="${!d.repeat}">No</button><button type="button" data-rep="weekly" aria-pressed="${d.repeat === 'weekly'}">Cada semana</button><button type="button" data-rep="monthly" aria-pressed="${d.repeat === 'monthly'}">Cada mes</button></div><span class="faint" style="font-size:12px">Al cerrar la compra, la lista vuelve a quedar lista para la próxima vez.</span></div>
<button class="btn pink" id="cpOk" style="justify-content:center;padding:12px">Crear lista</button></div>`, sh => {
    sh.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.k) { d.kind = b.dataset.k; $$('.cp-k', sh).forEach(x => x.setAttribute('aria-pressed', x.dataset.k === d.kind)); const n = $('#cpN', sh); if (!n.value) n.placeholder = 'Ej. ' + KINDS[d.kind].n + ' de la semana'; }
      if (b.dataset.rep != null) { d.repeat = b.dataset.rep || null; $$('[data-rep]', sh).forEach(x => x.setAttribute('aria-pressed', (x.dataset.rep || null) === d.repeat)); }
      if (b.id === 'cpOk') {
        const name = ($('#cpN', sh).value || '').trim() || (KINDS[d.kind].n + ' de la semana');
        const l = { id: 'l' + uid(), name, kind: d.kind, budget: Math.max(0, +$('#cpB', sh).value || 0), repeat: d.repeat, items: (d.items || []).map(i => Object.assign({}, i, { id: 'i' + uid(), done: false })), created: today() };
        C().lists.unshift(l); save(); closeSheet(); S.cpOpen = l.id; A.go('compra');
      }
    });
  });
}
ACT.cpNew = () => newListSheet();
ACT.cpFromTpl = a => { const t = C().tpls.find(x => x.id === a.dataset.id); if (t) newListSheet({ name: t.name, kind: t.kind, budget: t.budget || '', repeat: t.repeat || null, items: t.items }); };
ACT.cpTplDel = a => { if (!a.dataset.s) { a.dataset.s = 1; a.textContent = '?'; return; } C().tpls = C().tpls.filter(x => x.id !== a.dataset.id); save(); A.render(); };
ACT.cpOpen = a => { S.cpOpen = a.dataset.id; A.go('compra'); };

// ---------------- Una lista (el ticket) ----------------
function itemRow(i, l) {
  const k = pkey(i.name), tr = trend(k), best = bestStore(k);
  return `<div class="cp-item ${i.done ? 'done' : ''}" data-iid="${esc(i.id)}">
<button class="cp-check" data-act="cpTick" data-id="${esc(i.id)}" aria-pressed="${!!i.done}" aria-label="${i.done ? 'Quitar del carrito' : 'Al carrito'}"><span></span></button>
<button class="cp-item-main" data-act="cpItem" data-id="${esc(i.id)}"><span class="cp-item-tx"><b><span class="cp-strike">${esc(i.name)}</span></b><span>${qtyTxt(i.qty, i.unit)}${+i.price > 0 ? ` × ${money(i.price)}${i.unit !== 'und' ? '/' + unitN(i.unit) : ''}` : ' · sin precio'} ${arrow(tr)}${i.store ? ' · ' + esc(i.store) : ''}</span>${best && !i.done && (!i.store || i.store !== best.s) ? `<span class="cp-best">Más barato en ${esc(best.s)} (${money(best.p)})</span>` : ''}</span>
<b class="cp-money">${+i.price > 0 ? money(iTot(i)) : '—'}</b></button></div>`;
}
A.screens.compra = () => {
  const l = cur(); if (!l) { setTimeout(() => A.go('compras'), 0); return '<div></div>'; }
  const T = tot(l), cart = inCart(l), n = l.items.length, d = doneN(l), over = l.budget > 0 && T > l.budget, p = pct(d, n);
  const groups = C().group ? CK.map(k => [k, l.items.filter(i => (i.cat || 'otros') === k)]).filter(g => g[1].length) : [['', l.items]];
  const todo = g => g.filter(i => !i.done), dn = l.items.filter(i => i.done);
  const sw = sharedWith(l);
  return `<div class="ph"><div class="ph-left"><button class="navarrow" data-go="compras" aria-label="Volver a Compras">‹</button><span class="pill">${esc(l.name)}</span></div><button class="iconbtn" data-act="cpMenu" aria-label="Opciones de la lista">⋯</button></div>
<div class="cp-ticket">
<div class="cp-ticket-h"><span class="cp-kicker">${esc(kind(l.kind).n)}${l.repeat ? ' · se repite' : ''}${sw ? ' · con ' + esc(sw) : ''}</span>
<div class="cp-road" aria-hidden="true"><span class="cp-road-go" style="left:calc(${p}% * .78)"><span class="cp-road-pet">${img(petSprite(), 34)}</span>${img(d ? 'x_carrito_super' : 'cp_cart_vacio', 40)}</span></div>
${l.budget ? `<div class="cp-budget"><span>Presupuesto ${money(l.budget)}</span><b class="${over ? 'neg' : ''}">${over ? 'Te pasas por ' + money(T - l.budget) : 'Te quedan ' + money(l.budget - T)}</b></div><span class="cp-bar ${over ? 'over' : T > l.budget * .85 ? 'warn' : ''}"><i style="width:${pct(T, l.budget)}%"></i></span>` : `<button class="cp-addbud" data-act="cpBudget">+ Ponerle presupuesto</button>`}
</div>
<form class="cp-add" id="cpAdd" autocomplete="off"><input class="in" id="cpNew" placeholder="Ej. 2 kg de tomate a $1.20" enterkeyhint="done" list="cpSug"><button type="button" class="cp-mic" data-act="cpMic" aria-label="Dictar con la voz">${img('mic', 22)}</button><button class="btn pink" type="submit" aria-label="Agregar">+</button></form>
<datalist id="cpSug">${Object.values(C().prices).slice(-80).map(p => `<option value="${esc(p.name)}">`).join('')}</datalist>
<div class="cp-tools"><button class="chip" data-act="cpPaste">Pegar lista</button><button class="chip" data-act="cpFromCasa">Lo que falta en casa</button><button class="chip" data-act="cpGroup" aria-pressed="${!!C().group}">${C().group ? 'Por pasillo' : 'Como lo anoté'}</button></div>
${n ? groups.map(([k, g]) => { const td = todo(g); return td.length ? `${k ? `<div class="cp-aisle">${tile(k, 26)}<span>${cat(k).n}</span><i></i></div>` : ''}<div class="cp-items">${td.map(i => itemRow(i, l)).join('')}</div>` : ''; }).join('')
    + (dn.length ? `<div class="cp-aisle cart">${img('cart', 20)}<span>En el carrito (${dn.length})</span><i></i></div><div class="cp-items">${dn.map(i => itemRow(i, l)).join('')}</div>` : '')
    : `<div class="cp-empty in-ticket">${img('cp_ticket', 44, '', 'cp-float')}<span class="faint">Escribe arriba, dicta con el micrófono o pega una lista de WhatsApp. Puedes poner la cantidad y el precio: "3 panes a $0.25".</span></div>`}
<div class="cp-teeth" aria-hidden="true"></div>
</div>
<div class="cp-foot">
<div class="cp-foot-row"><span>En el carrito</span><b>${money(cart)}</b></div>
<div class="cp-foot-row faint"><span>Falta</span><span>${money(T - cart)}</span></div>
<div class="cp-foot-total"><span>Total</span><b class="${over ? 'neg' : ''}">${money(T)}</b></div>
<button class="btn pink cp-close" data-act="cpClose" ${d ? '' : 'disabled'}>${d ? `Cerrar compra · ${money(cart)}` : 'Marca lo que vas comprando'}</button>
</div>`;
};
A.after.compra = el => {
  const f = $('#cpAdd', el); if (!f) return;
  f.onsubmit = e => {
    e.preventDefault(); const inp = $('#cpNew', el); const v = inp.value.trim(); if (!v) return;
    addItems(splitSpeech(v).length > 1 && /,|;/.test(v) ? splitSpeech(v) : [v]); S.cpFocus = 1;
  };
  if (S.cpFocus) { S.cpFocus = 0; const i = $('#cpNew', el); if (i) i.focus({ preventScroll: true }); }
};
function addItems(texts) {
  const l = cur(); if (!l) return 0; let n = 0;
  texts.forEach(t => { const it = parseItem(t); if (!it) return; const same = l.items.find(x => !x.done && pkey(x.name) === pkey(it.name) && x.unit === it.unit); if (same) same.qty = Math.round(((+same.qty || 0) + (+it.qty || 1)) * 1000) / 1000; else l.items.push(it); n++; });
  if (n) { save(); touch(l); if (window.Sfx) Sfx.play('blup'); A.render(); if (n > 1) toast(`Agregué ${n} cosas`); }
  return n;
}
ACT.cpTick = a => {
  const l = cur(); const i = l && l.items.find(x => x.id === a.dataset.id); if (!i) return;
  i.done = !i.done; save(); touch(l);
  const row = a.closest('.cp-item'); if (row) { row.classList.toggle('done', i.done); a.setAttribute('aria-pressed', i.done); }
  if (window.Sfx) Sfx.play(i.done ? 'coin' : 'blup');
  if (i.done && !(+i.price > 0)) { setTimeout(() => itemSheet(i, true), 380); return; }
  setTimeout(() => { A.render(); if (i.done && doneN(l) === l.items.length) toast('¡Todo en el carrito! Ya puedes cerrar la compra'); }, 360);
};
ACT.cpGroup = () => { C().group = !C().group; save(); A.render(); };
ACT.cpBudget = () => { const l = cur(); if (!l) return; openSheet('Presupuesto de la lista', `<div class="stack"><label class="f">¿Cuánto quieres gastar como máximo?<input class="in" id="cpB" type="number" inputmode="decimal" step="0.01" min="0" value="${l.budget || ''}" autofocus></label><button class="btn pink" id="cpBOk" style="justify-content:center">Guardar</button></div>`, sh => { $('#cpBOk', sh).onclick = () => { l.budget = Math.max(0, +$('#cpB', sh).value || 0); save(); touch(l); closeSheet(); A.render(); }; }); };

// ---------------- Editar una cosa ----------------
function itemSheet(i, askPrice) {
  const l = cur(); if (!l) return; const d = Object.assign({}, i); const k = pkey(i.name), P = C().prices[k];
  const stores = C().stores;
  const html = () => `<div class="stack cp-ied">
<label class="f">¿Qué es?<input class="in" id="iN" maxlength="50" value="${esc(d.name)}"></label>
<div class="f">Cantidad<div class="cp-qty"><button type="button" data-q="-1" aria-label="Menos">−</button><input class="in" id="iQ" type="number" inputmode="decimal" step="0.01" min="0" value="${d.qty}"><button type="button" data-q="1" aria-label="Más">+</button></div></div>
<div class="f">Unidad<div class="chips cp-units">${UNITS.map(([u, n]) => `<button type="button" class="chip" data-u="${u}" aria-pressed="${d.unit === u}">${n}</button>`).join('')}</div></div>
<label class="f">Precio ${d.unit === 'und' ? 'de cada una' : 'por ' + unitN(d.unit)}<input class="in" id="iP" type="number" inputmode="decimal" step="0.01" min="0" value="${+d.price > 0 ? d.price : ''}" placeholder="0,00" ${askPrice ? 'autofocus' : ''}></label>
${P && P.last ? `<div class="cp-last">${img('cp_ticket', 20)}<span>La última vez: <b>${money(P.last.p)}</b>${P.last.s ? ' en ' + esc(P.last.s) : ''} · ${shortD(P.last.d)} ${arrow(trend(k))}</span></div>` : ''}
<div class="cp-sub"><span>Subtotal</span><b id="iT">${money(iTot(d))}</b></div>
<div class="f">Pasillo<div class="cp-cats">${CK.map(c => `<button type="button" class="cp-c" data-c="${c}" aria-pressed="${(d.cat || 'otros') === c}" title="${cat(c).n}">${tile(c, 34)}<span>${cat(c).n.split(' ')[0]}</span></button>`).join('')}</div></div>
<label class="f">Tienda (si quieres)<input class="in" id="iS" list="cpStores" maxlength="30" value="${esc(d.store || '')}" placeholder="Ej. Supermaxi, Tía, el mercado"><datalist id="cpStores">${stores.map(s => `<option value="${esc(s)}">`).join('')}</datalist></label>
<div class="row" style="gap:8px"><button type="button" class="btn danger" id="iDel">Borrar</button><button type="button" class="btn pink" id="iOk" style="flex:1;justify-content:center;padding:12px">Guardar</button></div></div>`;
  openSheet(askPrice ? '¿Cuánto costó?' : 'Editar', html(), sh => {
    const upT = () => { const t = $('#iT', sh); if (t) t.textContent = money(iTot(d)); };
    sh.addEventListener('input', e => { const t = e.target; if (t.id === 'iQ') d.qty = Math.max(0, +t.value || 0); if (t.id === 'iP') d.price = Math.max(0, +t.value || 0); if (t.id === 'iN') d.name = t.value; if (t.id === 'iS') d.store = t.value; upT(); });
    sh.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.q) { const step = ['kg', 'lb', 'L'].includes(d.unit) ? .5 : d.unit === 'g' || d.unit === 'ml' ? 100 : 1; d.qty = Math.max(0, Math.round(((+d.qty || 0) + step * +b.dataset.q) * 1000) / 1000); $('#iQ', sh).value = d.qty; upT(); }
      if (b.dataset.u) { d.unit = b.dataset.u; $$('[data-u]', sh).forEach(x => x.setAttribute('aria-pressed', x.dataset.u === d.unit)); const lb = $('#iP', sh).closest('label'); if (lb) lb.firstChild.textContent = `Precio ${d.unit === 'und' ? 'de cada una' : 'por ' + unitN(d.unit)}`; }
      if (b.dataset.c) { d.cat = b.dataset.c; $$('[data-c]', sh).forEach(x => x.setAttribute('aria-pressed', x.dataset.c === d.cat)); }
      if (b.id === 'iDel') { l.items = l.items.filter(x => x.id !== i.id); save(); touch(l); closeSheet(); A.render(); }
      if (b.id === 'iOk') {
        d.name = (d.name || '').trim() || i.name; d.store = (d.store || '').trim(); if (!d.store) delete d.store;
        if (d.store && !C().stores.includes(d.store)) C().stores.push(d.store);
        Object.assign(i, d); if (+i.price > 0) notePrice(i, i.store); const pk = C().prices[pkey(i.name)]; if (pk) pk.cat = i.cat;
        save(); touch(l); closeSheet(); A.render();
      }
    });
  });
}
ACT.cpItem = a => { const l = cur(); const i = l && l.items.find(x => x.id === a.dataset.id); if (i) itemSheet(i); };

// ---------------- Voz, pegar, desde la casa ----------------
ACT.cpMic = a => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return toast('Tu celular no permite dictar aquí. Prueba con Chrome.');
  if (navigator.onLine === false) return toast('Para dictar necesitas internet');
  const rec = new SR(); rec.lang = 'es-EC'; rec.interimResults = true; rec.continuous = false;
  const inp = $('#cpNew'); a.classList.add('on'); let fin = '';
  rec.onresult = e => { let t = ''; for (const r of e.results) { t += r[0].transcript; if (r.isFinal) fin = t; } if (inp) inp.value = t; };
  rec.onerror = e => { a.classList.remove('on'); if (e.error === 'not-allowed') toast('Activa el permiso del micrófono'); };
  rec.onend = () => { a.classList.remove('on'); const t = fin || (inp && inp.value) || ''; if (t.trim()) { if (inp) inp.value = ''; addItems(splitSpeech(t)); } };
  try { rec.start(); toast('Te escucho… di por ejemplo "leche, 2 kilos de arroz y pan"'); } catch (e) { a.classList.remove('on'); }
};
ACT.cpPaste = () => {
  openSheet('Pegar lista', `<div class="stack"><span class="faint">Pega la lista de WhatsApp o de tus notas. Una cosa por línea (o separadas por comas).</span><textarea class="in" id="cpTx" rows="8" placeholder="- 2 kg de arroz&#10;- Leche x3&#10;- Media docena de huevos&#10;- Pan a $0.25"></textarea><div class="row" style="gap:8px"><button type="button" class="btn" id="cpClip">Pegar del portapapeles</button><button type="button" class="btn pink" id="cpTxOk" style="flex:1;justify-content:center">Agregar todo</button></div></div>`, sh => {
    $('#cpClip', sh).onclick = async () => { try { $('#cpTx', sh).value = await navigator.clipboard.readText(); } catch (e) { toast('Mantén presionado el cuadro y toca Pegar'); } };
    $('#cpTxOk', sh).onclick = () => { const v = $('#cpTx', sh).value; const parts = v.split(/\n/).flatMap(x => /,/.test(x) && !/\d,\d/.test(x) ? x.split(',') : [x]).map(x => x.trim()).filter(Boolean); closeSheet(); if (!addItems(parts)) toast('No encontré nada para agregar'); };
  });
};
ACT.cpFromCasa = () => {
  const l = cur(); if (!l) return; const need = C().pantry.filter(p => p.state !== 'ok' && !l.items.some(i => !i.done && pkey(i.name) === pkey(p.name)));
  if (!need.length) return toast(C().pantry.length ? 'En casa no falta nada' : 'Primero anota lo que tienes en casa (pestaña En casa)');
  need.forEach(p => { const it = parseItem(p.name); if (it) { it.cat = p.cat || it.cat; if (p.unit) it.unit = p.unit; l.items.push(it); } });
  save(); touch(l); A.render(); toast(`Agregué ${need.length} cositas que faltan en casa`);
};

// ---------------- Menú de la lista ----------------
const shareText = l => `${l.name}\n` + l.items.map(i => `${i.done ? '✓' : '•'} ${i.name}${+i.qty !== 1 || i.unit !== 'und' ? ' (' + qtyTxt(i.qty, i.unit).trim() + ')' : ''}${+i.price > 0 ? ' ' + money(iTot(i), { real: true }) : ''}`).join('\n') + `\nTotal: ${money(tot(l), { real: true })}`;
ACT.cpMenu = () => {
  const l = cur(); if (!l) return; const isOwner = !l.shared || (SH.rows[l.shared] && SH.rows[l.shared].owner === Store.uid);
  openSheet(l.name, `<div class="cp-menu">
<button data-m="rename">${img('book', 24)}<span>Cambiar nombre</span></button>
<button data-m="budget">${img('moneda', 24)}<span>Presupuesto</span></button>
<button data-m="repeat">${img('repeat', 24)}<span>${l.repeat ? 'No repetir' : 'Repetir cada semana'}</span></button>
<button data-m="tpl">${img('star', 24)}<span>Guardar como plantilla</span></button>
<button data-m="share">${img('heart', 24)}<span>${l.shared ? 'Compartida con ' + esc(sharedWith(l) || 'amigas') : 'Compartir con una amiga'}</span></button>
<button data-m="text">${img('phone', 24)}<span>Mandar por WhatsApp</span></button>
<button data-m="uncheck">${img('check', 24)}<span>Desmarcar todo</span></button>
<button data-m="clear">${img('cart', 24)}<span>Quitar lo que ya está en el carrito</span></button>
<button data-m="del" class="danger">${img('alerta', 24)}<span>${l.shared && !isOwner ? 'Salir de la lista' : 'Borrar lista'}</span></button></div>`, sh => {
    sh.addEventListener('click', async e => {
      const b = e.target.closest('[data-m]'); if (!b) return; const m = b.dataset.m;
      if (m === 'rename') { closeSheet(); setTimeout(() => openSheet('Nombre de la lista', `<div class="stack"><input class="in" id="cpRn" maxlength="40" value="${esc(l.name)}" autofocus><button class="btn pink" id="cpRnOk" style="justify-content:center">Guardar</button></div>`, s2 => { $('#cpRnOk', s2).onclick = () => { l.name = $('#cpRn', s2).value.trim() || l.name; save(); touch(l); closeSheet(); A.render(); }; }), 200); }
      if (m === 'budget') { closeSheet(); setTimeout(ACT.cpBudget, 200); }
      if (m === 'repeat') { l.repeat = l.repeat ? null : 'weekly'; save(); touch(l); closeSheet(); A.render(); toast(l.repeat ? 'Al cerrar la compra, la lista se vuelve a armar sola' : 'Ya no se repite'); }
      if (m === 'tpl') { C().tpls.unshift({ id: 't' + uid(), name: l.name, kind: l.kind, budget: l.budget, repeat: l.repeat, items: l.items.map(i => { const x = Object.assign({}, i); delete x.done; return x; }) }); save(); closeSheet(); toast('Plantilla guardada'); }
      if (m === 'share') { closeSheet(); if (l.shared) return toast('Ya está compartida. Los cambios se ven al instante.'); setTimeout(() => shareSheet(l), 200); }
      if (m === 'text') { closeSheet(); const t = shareText(l); if (navigator.share) { try { await navigator.share({ text: t }); } catch (er) { } } else { try { await navigator.clipboard.writeText(t); toast('Lista copiada'); } catch (er) { } } }
      if (m === 'uncheck') { l.items.forEach(i => { i.done = false; }); save(); touch(l); closeSheet(); A.render(); }
      if (m === 'clear') { l.items = l.items.filter(i => !i.done); save(); touch(l); closeSheet(); A.render(); }
      if (m === 'del') {
        if (!b.dataset.s) { b.dataset.s = 1; b.querySelector('span').textContent = '¿Segura? Toca otra vez'; return; }
        if (l.shared) { if (isOwner && online()) Store.sb.from('shared_lists').delete().eq('id', l.shared).then(() => {}, () => {}); else { C().shHidden.push(l.shared); if (online()) { const r = SH.rows[l.shared]; if (r) Store.sb.from('shared_lists').update({ members: r.members.filter(u => u !== Store.uid) }).eq('id', l.shared).then(() => {}, () => {}); } } }
        C().lists = C().lists.filter(x => x.id !== l.id); save(); closeSheet(); A.go('compras'); toast('Lista borrada');
      }
    });
  });
};
async function shareSheet(l) {
  if (!online()) return toast('Para compartir necesitas internet');
  const fr = S.settings.friends || []; if (!fr.length) return toast('Primero agrega a una amiga en Visitas con su código');
  const rooms = (await Promise.all(fr.map(f => (A.fetchRoom ? A.fetchRoom(f.code) : Promise.resolve(null)).catch(() => null)))).filter(Boolean);
  if (!rooms.length) return toast('No encontré a tus amigas. Revisa tu conexión.');
  const pick = new Set();
  openSheet('Compartir lista', `<div class="stack"><span class="faint">Las dos pueden anotar y marcar en la misma lista. Lo que marque tu amiga te aparece al instante.</span>
<div class="list">${rooms.map(r => `<label class="li" style="cursor:pointer"><input type="checkbox" data-fu="${esc(r.user_id)}" data-fn="${esc(r.name)}"> <span class="tx-main"><b>${esc(r.name)}</b></span></label>`).join('')}</div>
<button class="btn pink" id="cpShOk" style="justify-content:center">Compartir</button></div>`, sh => {
    sh.addEventListener('change', e => { const u = e.target.dataset.fu; if (!u) return; e.target.checked ? pick.add(u) : pick.delete(u); });
    $('#cpShOk', sh).onclick = async () => {
      if (!pick.size) return toast('Elige al menos una amiga');
      const names = { [Store.uid]: (S.settings.name || 'Amiga').split(' ')[0] }; $$('[data-fu]', sh).forEach(c => { if (c.checked) names[c.dataset.fu] = c.dataset.fn; });
      const { data, error } = await Store.sb.from('shared_lists').insert({ owner: Store.uid, members: [Store.uid, ...pick], names, title: l.name, body: bodyOf(l), updated_by: Store.uid }).select('id, owner, members, names, title, body, updated_by, updated_at').single();
      if (error) return toast('No se pudo compartir. Revisa tu conexión.');
      l.shared = data.id; SH.rows[data.id] = data; SH.base[data.id] = clone(data.body); save(); listen(data.id); closeSheet(); A.render(); toast('¡Lista compartida!');
    };
  });
}

// ---------------- Cerrar compra: se vuelve un gasto en tu cuenta ----------------
function guessTxCat(l) {
  const cs = (S.fin.categories || []).filter(c => c.type !== 'income');
  const want = l.kind === 'farmacia' ? ['salud', 'farmacia'] : ['super', 'mercado', 'despensa', 'comida'];
  return (cs.find(c => want.includes(c.id)) || cs.find(c => want.some(w => norm(c.name).includes(w))) || cs.find(c => /super|mercado/.test(norm(c.name))) || cs[0] || {}).id;
}
ACT.cpClose = () => {
  const l = cur(); if (!l) return; const bought = l.items.filter(i => i.done); if (!bought.length) return;
  const accts = (S.fin.accounts || []).filter(a => !a.archived && a.type !== 'alcancia');
  const cats = (S.fin.categories || []).filter(c => c.type !== 'income');
  const last = C().lastClose || {};
  const d = { total: Math.round(inCart(l) * 100) / 100, acct: (accts.find(a => a.id === last.acct) || accts[0] || {}).id, cat: guessTxCat(l), date: today(), store: last.store || bought.find(i => i.store)?.store || '', casa: true, rest: !l.repeat };
  const left = l.items.filter(i => !i.done);
  openSheet('Cerrar compra', `<div class="stack cp-closed">
<div class="cp-receipt"><div class="cp-receipt-h">${img('cp_ticket', 30)}<b>${esc(l.name)}</b><span>${bought.length} cosas</span></div>
${bought.slice(0, 8).map(i => `<div class="cp-receipt-r"><span>${esc(i.name)} <i>${qtyTxt(i.qty, i.unit)}</i></span><span>${+i.price > 0 ? money(iTot(i)) : '—'}</span></div>`).join('')}${bought.length > 8 ? `<div class="cp-receipt-r faint"><span>y ${bought.length - 8} más…</span><span></span></div>` : ''}
<div class="cp-receipt-t"><span>Total</span><input class="in" id="ccT" type="number" inputmode="decimal" step="0.01" min="0" value="${d.total || ''}" aria-label="Total pagado"></div></div>
<span class="faint" style="font-size:12px;margin-top:-6px">Si el ticket dice otra cifra, cámbiala aquí.</span>
<div class="formgrid"><label class="f">Pagué con<select class="in" id="ccA">${accts.map(a => `<option value="${esc(a.id)}" ${a.id === d.acct ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label>
<label class="f">Categoría<select class="in" id="ccC">${cats.map(c => `<option value="${esc(c.id)}" ${c.id === d.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
<label class="f">Fecha<input class="in" id="ccD" type="date" value="${d.date}" max="${today()}"></label>
<label class="f">Tienda<input class="in" id="ccS" list="cpStores2" maxlength="30" value="${esc(d.store)}" placeholder="Ej. Supermaxi"><datalist id="cpStores2">${C().stores.map(s => `<option value="${esc(s)}">`).join('')}</datalist></label></div>
<label class="cp-opt"><input type="checkbox" id="ccH" checked> <span>Guardar en "En casa" lo que compré</span></label>
${left.length && !l.repeat ? `<label class="cp-opt"><input type="checkbox" id="ccR" checked> <span>Dejar en la lista lo que no compré (${left.length})</span></label>` : ''}
${l.budget ? `<div class="cp-reward">${img('estrellita', 22)}<span>${d.total <= l.budget ? 'Cumpliste el presupuesto: ¡ganas 5 estrellitas!' : 'Te pasaste del presupuesto esta vez. ¡La próxima sale!'}</span></div>` : ''}
<button class="btn pink" id="ccOk" style="justify-content:center;padding:13px">Guardar gasto</button></div>`, sh => {
    $('#ccOk', sh).onclick = () => {
      const total = Math.round((+$('#ccT', sh).value || 0) * 100) / 100; if (!(total > 0)) { $('#ccT', sh).focus(); return toast('Escribe cuánto pagaste'); }
      const acct = $('#ccA', sh).value, catId = $('#ccC', sh).value, date = $('#ccD', sh).value || today(), store = ($('#ccS', sh).value || '').trim();
      if (store && !C().stores.includes(store)) C().stores.push(store);
      C().lastClose = { acct, store };
      const tx = { type: 'expense', amount: total, cat: catId, acct, date, note: l.name + (store ? ' · ' + store : ''), compra: true };
      A.addTx(tx);
      bought.forEach(i => notePrice(i, i.store || store, date));
      C().hist.unshift({ id: 'h' + uid(), name: l.name, kind: l.kind, date, store, total, acct, tx: tx.id, budget: l.budget || 0, items: bought.map(i => ({ name: i.name, qty: i.qty, unit: i.unit, price: +i.price || 0, cat: i.cat || 'otros' })) });
      C().hist = C().hist.slice(0, 400);
      if ($('#ccH', sh) && $('#ccH', sh).checked) bought.forEach(i => { const p = C().pantry.find(x => pkey(x.name) === pkey(i.name)); if (p) p.state = 'ok'; else C().pantry.push({ id: 'p' + uid(), name: i.name, cat: i.cat || 'otros', unit: i.unit, state: 'ok' }); });
      const keepRest = $('#ccR', sh) ? $('#ccR', sh).checked : false;
      let gone = false;
      if (l.repeat) l.items.forEach(i => { i.done = false; });
      else if (keepRest) l.items = l.items.filter(i => !i.done);
      else if (l.shared) l.items = l.items.filter(i => !i.done);
      else { C().lists = C().lists.filter(x => x.id !== l.id); gone = true; }
      if (!gone) touch(l);
      let stars = 0; if (l.budget && total <= l.budget && A.giveStars) { A.giveStars(5); stars = 5; }
      const first = !C().gotCart; if (first && A.giveFurn && A.FURN && A.FURN.carrito_super) { A.giveFurn('carrito_super', 1); C().gotCart = 1; }
      save(); closeSheet();
      if (gone) A.go('compras'); else A.render();
      setTimeout(() => celebrate(total, stars, first && C().gotCart), 250);
    };
  });
};
function celebrate(total, stars, gift) {
  openSheet('¡Compra guardada!', `<div class="cp-yay"><div class="cp-yay-art">${img(petSprite(), 70, '', 'cp-hop')}${img('x_carrito_super', 76)}</div>
<b class="cp-yay-t">${money(total)}</b><span class="faint">Ya quedó anotado como gasto y el saldo de tu cuenta se ajustó.</span>
${stars ? `<span class="cp-reward">${img('estrellita', 20)} +${stars} estrellitas por cumplir el presupuesto</span>` : ''}
${gift ? `<span class="cp-reward gift">${img('x_carrito_super', 26)} ${esc(petName())} te regala un Carrito de súper para su cuarto</span>` : ''}
<button class="btn pink" data-close style="justify-content:center;width:100%">¡Listo!</button></div>`, sh => { const b = sh.querySelector('[data-close]'); if (b) b.onclick = closeSheet; });
}
ACT.cpHist = a => {
  const h = C().hist.find(x => x.id === a.dataset.id); if (!h) return;
  openSheet(h.name, `<div class="stack"><div class="cp-receipt"><div class="cp-receipt-h">${img('cp_ticket', 30)}<b>${shortD(h.date)}</b><span>${esc(h.store || '')}</span></div>
${h.items.map(i => `<div class="cp-receipt-r"><span>${esc(i.name)} <i>${qtyTxt(i.qty, i.unit)}</i></span><span>${i.price ? money(i.qty * i.price) : '—'}</span></div>`).join('')}
<div class="cp-receipt-t"><span>Total</span><b>${money(h.total)}</b></div></div>
<div class="row" style="gap:8px"><button class="btn" id="hAgain" style="flex:1;justify-content:center">Volver a comprar esto</button><button class="btn danger" id="hDel">Borrar</button></div>
<span class="faint" style="font-size:12px">Borrar aquí solo lo quita del resumen de compras; el gasto sigue en tus movimientos.</span></div>`, sh => {
    $('#hAgain', sh).onclick = () => { closeSheet(); setTimeout(() => newListSheet({ name: h.name, kind: h.kind || 'super', budget: h.budget || '', items: h.items.map(i => Object.assign({ id: '', done: false }, i)) }), 200); };
    $('#hDel', sh).onclick = e => { const b = e.currentTarget; if (!b.dataset.s) { b.dataset.s = 1; b.textContent = '¿Segura?'; return; } C().hist = C().hist.filter(x => x.id !== h.id); save(); closeSheet(); A.render(); };
  });
};

// ---------------- En casa (despensa de la casa) ----------------
const ST = { ok: { n: 'Hay', c: 'ok' }, poco: { n: 'Queda poco', c: 'poco' }, no: { n: 'Se acabó', c: 'no' } };
const NEXT = { ok: 'poco', poco: 'no', no: 'ok' };
function casaHTML() {
  const P = C().pantry; const need = P.filter(p => p.state !== 'ok');
  const groups = CK.map(k => [k, P.filter(p => (p.cat || 'otros') === k)]).filter(g => g[1].length);
  return `<div class="card cp-casa-h">${img('bolsa', 40, '', 'cp-float')}<div><b>Lo que tienes en casa</b><div class="faint">Toca una cosa para cambiarla: hay → queda poco → se acabó. Lo que falta lo pasas a una lista con un toque.</div></div></div>
<form class="cp-add" id="cpCasaAdd" autocomplete="off"><input class="in" id="cpCasaN" placeholder="Ej. Arroz, aceite, papel higiénico"><button class="btn pink" type="submit" aria-label="Agregar">+</button></form>
${need.length ? `<div class="cp-need"><span><b>${need.length}</b> ${need.length === 1 ? 'cosa falta' : 'cosas faltan'}</span><button class="btn pink sm" data-act="cpNeedToList">Pasar a una lista</button></div>` : ''}
${P.length ? groups.map(([k, g]) => `<div class="cp-aisle">${tile(k, 26)}<span>${cat(k).n}</span><i></i></div><div class="cp-pgrid">${g.map(p => `<button class="cp-pchip ${ST[p.state].c}" data-act="cpPState" data-id="${esc(p.id)}"><b>${esc(p.name)}</b><span>${ST[p.state].n}</span></button>`).join('')}</div>`).join('')
    : `<div class="card cp-empty"><span class="faint">Cuando cierres una compra, lo que compraste se guarda aquí solito. También puedes anotarlo tú.</span></div>`}
${P.length ? '<button class="btn sm" data-act="cpPEdit">Quitar cosas</button>' : ''}`;
}
A.after.compras = el => {
  const f = $('#cpCasaAdd', el); if (f) f.onsubmit = e => { e.preventDefault(); const v = $('#cpCasaN', el).value; const parts = v.split(',').map(x => x.trim()).filter(Boolean); parts.forEach(n => { const it = parseItem(n); if (it && !C().pantry.some(p => pkey(p.name) === pkey(it.name))) C().pantry.push({ id: 'p' + uid(), name: it.name, cat: it.cat, unit: it.unit, state: 'ok' }); }); save(); S.cpFocusCasa = 1; A.render(); };
  if (S.cpFocusCasa) { S.cpFocusCasa = 0; const i = $('#cpCasaN', el); if (i) i.focus({ preventScroll: true }); }
  const q = $('#cpQ', el); if (q) { q.oninput = () => { S.cpQ = q.value; const box = $('#cpPriceList', el); if (box) box.innerHTML = priceRows(); }; if (S.cpQFocus) { q.focus(); S.cpQFocus = 0; } }
  const mb = $('#cpMB', el); if (mb) mb.onchange = () => { C().monthBudget = Math.max(0, +mb.value || 0); save(); A.render(); };
};
ACT.cpPState = a => { const p = C().pantry.find(x => x.id === a.dataset.id); if (!p) return; p.state = NEXT[p.state] || 'ok'; save(); a.className = 'cp-pchip ' + ST[p.state].c; a.querySelector('span').textContent = ST[p.state].n; if (window.Sfx) Sfx.play('blup'); clearTimeout(S.cpPT); S.cpPT = setTimeout(() => A.render(), 1400); };
ACT.cpNeedToList = () => {
  const need = C().pantry.filter(p => p.state !== 'ok'); const Ls = C().lists;
  const put = l => { let n = 0; need.forEach(p => { if (l.items.some(i => !i.done && pkey(i.name) === pkey(p.name))) return; const it = parseItem(p.name); if (it) { it.cat = p.cat || it.cat; if (p.unit) it.unit = p.unit; l.items.push(it); n++; } }); save(); touch(l); closeSheet(); S.cpOpen = l.id; A.go('compra'); toast(n ? `Pasé ${n} cositas a "${l.name}"` : 'Ya estaban en la lista'); };
  openSheet('¿A qué lista?', `<div class="cp-menu">${Ls.map(l => `<button data-l="${esc(l.id)}">${img(kind(l.kind).ic, 24)}<span>${esc(l.name)}</span></button>`).join('')}<button data-l="">${img('plus', 24)}<span>Lista nueva</span></button></div>`, sh => {
    sh.addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (!b) return; let l = L(b.dataset.l); if (!l) { l = { id: 'l' + uid(), name: 'Lo que falta en casa', kind: 'super', budget: 0, repeat: null, items: [], created: today() }; C().lists.unshift(l); } put(l); });
  });
};
ACT.cpPEdit = () => {
  openSheet('Quitar de En casa', `<div class="stack"><div class="list">${C().pantry.map(p => `<label class="li" style="cursor:pointer"><input type="checkbox" data-pid="${esc(p.id)}"> <span class="tx-main"><b>${esc(p.name)}</b></span></label>`).join('')}</div><button class="btn danger" id="pDel" style="justify-content:center">Quitar las marcadas</button></div>`, sh => {
    $('#pDel', sh).onclick = () => { const ids = $$('[data-pid]', sh).filter(c => c.checked).map(c => c.dataset.pid); C().pantry = C().pantry.filter(p => !ids.includes(p.id)); save(); closeSheet(); A.render(); };
  });
};

// ---------------- Precios ----------------
function priceRows() {
  const q = norm(S.cpQ || ''); const E = Object.entries(C().prices).filter(([, p]) => p.last && (!q || norm(p.name).includes(q))).sort((a, b) => (b[1].last.d || '').localeCompare(a[1].last.d || '') || a[1].name.localeCompare(b[1].name));
  if (!E.length) return `<div class="card cp-empty"><span class="faint">${q ? 'No encontré ese producto.' : 'Aquí se guarda el precio de cada cosa cada vez que cierras una compra o le pones precio. Así ves si subió o bajó y dónde sale más barato.'}</span></div>`;
  return E.slice(0, 120).map(([k, p]) => { const b = bestStore(k); return `<button class="cp-prow" data-act="cpPrice" data-k="${esc(k)}">${tile(p.cat || 'otros', 34)}<span class="cp-lcard-tx"><b>${esc(p.name)}</b><span>${p.last.s ? esc(p.last.s) + ' · ' : ''}${shortD(p.last.d)}${b ? ` · <em>más barato en ${esc(b.s)}</em>` : ''}</span></span><span class="cp-lcard-r"><b class="cp-money">${money(p.last.p)}</b><span class="faint">${p.unit === 'und' ? 'c/u' : 'por ' + unitN(p.unit)} ${arrow(trend(k))}</span></span></button>`; }).join('');
}
function storeCompare() {
  const wins = {}; let n = 0;
  Object.keys(C().prices).forEach(k => { const b = bestStore(k); if (b) { wins[b.s] = (wins[b.s] || 0) + 1; n++; } });
  const E = Object.entries(wins).sort((a, b) => b[1] - a[1]); if (!E.length) return '';
  return `<div class="card cp-stores"><b>¿Dónde te sale más barato?</b><span class="faint" style="font-size:12px">Comparando ${n} productos que compraste en más de una tienda</span>${E.map(([s, w]) => `<div class="cp-srow"><span>${esc(s)}</span><span class="cp-bar"><i style="width:${pct(w, n)}%"></i></span><b>${w}</b></div>`).join('')}</div>`;
}
const preciosHTML = () => `<input class="in" id="cpQ" type="search" placeholder="Buscar un producto…" value="${esc(S.cpQ || '')}">${storeCompare()}<div class="cp-plist" id="cpPriceList">${priceRows()}</div>`;
ACT.cpPrice = a => {
  const k = a.dataset.k, p = C().prices[k]; if (!p) return; const H = p.hist.slice(-10), mx = Math.max(...H.map(h => h.p)), mn = Math.min(...H.map(h => h.p));
  const byS = {}; p.hist.forEach(h => { if (h.s) byS[h.s] = h; });
  openSheet(p.name, `<div class="stack"><div class="cp-pbig"><b class="cp-money">${money(p.last.p)}</b><span class="faint">${p.unit === 'und' ? 'cada una' : 'por ' + unitN(p.unit)} · ${shortD(p.last.d)}</span></div>
${H.length > 1 ? `<div class="cp-spark">${H.map(h => `<span title="${shortD(h.d)}"><i style="height:${mx > mn ? 18 + (h.p - mn) / (mx - mn) * 82 : 60}%"></i><em>${money(h.p, { short: true })}</em></span>`).join('')}</div><span class="faint" style="font-size:12px">Más bajo ${money(mn)} · más alto ${money(mx)}</span>` : ''}
${Object.keys(byS).length ? `<div class="cp-stores">${Object.entries(byS).sort((a2, b2) => a2[1].p - b2[1].p).map(([s, h], i2) => `<div class="cp-srow ${i2 === 0 && Object.keys(byS).length > 1 ? 'best' : ''}"><span>${esc(s)}</span><span class="faint">${shortD(h.d)}</span><b>${money(h.p)}</b></div>`).join('')}</div>` : ''}
<div class="row" style="gap:8px"><button class="btn pink" id="pAdd" style="flex:1;justify-content:center">Agregar a una lista</button><button class="btn danger" id="pDel">Olvidar</button></div></div>`, sh => {
    $('#pAdd', sh).onclick = () => { const Ls = C().lists; if (!Ls.length) { closeSheet(); return toast('Primero crea una lista'); } const l = (S.cpOpen && L(S.cpOpen)) || Ls[0]; l.items.push({ id: 'i' + uid(), name: p.name, qty: 1, unit: p.unit, price: p.last.p, cat: p.cat || 'otros', done: false }); save(); touch(l); closeSheet(); toast(`Agregado a "${l.name}"`); };
    $('#pDel', sh).onclick = e => { const b = e.currentTarget; if (!b.dataset.s) { b.dataset.s = 1; b.textContent = '¿Segura?'; return; } delete C().prices[k]; save(); closeSheet(); A.render(); };
  });
};

// ---------------- Resumen semanal y mensual ----------------
function resumenHTML() {
  const now = new Date(), w0 = wkStart(now), m0 = thisMonth() + '-01';
  const wk = sumH(histIn(ymd(w0), '9999')), mo = sumH(histIn(m0, '9999'));
  const weeks = Array.from({ length: 8 }, (_, i) => { const s = addDays(w0, -7 * (7 - i)), e = addDays(s, 6); return { s, v: sumH(histIn(ymd(s), ymd(e))) }; });
  const withData = weeks.filter(w => w.v > 0); const avg = withData.length ? sumH(withData.map(w => ({ total: w.v }))) / withData.length : 0;
  const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(), day = now.getDate();
  const proj = mo > 0 ? mo / day * dim : 0;
  const prevM = (() => { const d = new Date(now.getFullYear(), now.getMonth() - 1, 1); const a = ymd(d).slice(0, 7); return sumH(C().hist.filter(h => h.date.slice(0, 7) === a)); })();
  const mx = Math.max(1, ...weeks.map(w => w.v));
  const Hm = histIn(m0, '9999'); const byC = {}, byS = {};
  Hm.forEach(h => { h.items.forEach(i => { const v = (i.qty || 0) * (i.price || 0); byC[i.cat || 'otros'] = (byC[i.cat || 'otros'] || 0) + v; }); if (h.store) byS[h.store] = (byS[h.store] || 0) + h.total; });
  const cT = Object.values(byC).reduce((s, v) => s + v, 0) || 1;
  const topC = Object.entries(byC).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topS = Object.entries(byS).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const mb = +C().monthBudget || 0;
  const plan = C().lists.reduce((s, l) => s + tot(l) - inCart(l), 0);
  return `<div class="cp-kpis">
<div class="cp-kpi"><span>Esta semana</span><b class="cp-money">${money(wk)}</b><em>${avg && Math.abs(wk - avg) > .01 ? (wk > avg ? 'más' : 'menos') + ' que tu promedio' : 'desde el lunes'}</em></div>
<div class="cp-kpi"><span>Este mes</span><b class="cp-money">${money(mo)}</b><em>${prevM ? (mo > prevM ? '▲ ' : '▼ ') + money(Math.abs(mo - prevM)) + ' vs. mes pasado' : MES[now.getMonth()]}</em></div>
<div class="cp-kpi"><span>Promedio semanal</span><b class="cp-money">${money(avg)}</b><em>últimas 8 semanas</em></div>
<div class="cp-kpi"><span>Al ritmo de ahora</span><b class="cp-money">${money(proj)}</b><em>gastarías en el mes</em></div></div>
<div class="card stack cp-mb"><div class="row between"><b>Presupuesto de compras del mes</b><input class="in" id="cpMB" type="number" inputmode="decimal" min="0" step="1" value="${mb || ''}" placeholder="$" style="width:96px;text-align:right"></div>
${mb ? `<span class="cp-bar ${mo > mb ? 'over' : proj > mb ? 'warn' : ''}"><i style="width:${pct(mo, mb)}%"></i></span><span class="faint" style="font-size:12.5px">${mo > mb ? 'Te pasaste por ' + money(mo - mb) : 'Te quedan ' + money(mb - mo) + (proj > mb ? ' · a este ritmo te pasarías' : ' · vas bien')}${plan > 0 ? ' · en tus listas hay ' + money(plan) + ' por comprar' : ''}</span>` : '<span class="faint" style="font-size:12.5px">Ponle un tope y te aviso si a este ritmo te vas a pasar.</span>'}</div>
<div class="card cp-chart"><b>Por semana</b><div class="cp-bars">${weeks.map((w, i) => `<div class="cp-bcol ${i === 7 ? 'now' : ''}"><em>${w.v ? money(w.v, { short: true }) : ''}</em><span><i style="height:${Math.max(w.v ? 6 : 2, w.v / mx * 100)}%"></i></span><small>${w.s.getDate()}/${w.s.getMonth() + 1}</small></div>`).join('')}</div>${avg ? `<span class="faint" style="font-size:12px">Tu promedio: ${money(avg)}</span>` : ''}</div>
${topC.length ? `<div class="card stack"><b>En qué se va este mes</b>${topC.map(([k, v]) => `<div class="cp-crow">${tile(k, 30)}<span class="cp-crow-tx"><span>${cat(k).n}</span><span class="cp-bar"><i style="width:${pct(v, cT)}%;background:${cat(k).bg === '#fde3ea' ? 'var(--accent)' : ''}"></i></span></span><b>${money(v)}</b></div>`).join('')}</div>` : ''}
${topS.length ? `<div class="card stack"><b>Dónde compraste</b>${topS.map(([s, v]) => `<div class="cp-srow"><span>${esc(s)}</span><span class="cp-bar"><i style="width:${pct(v, mo)}%"></i></span><b>${money(v)}</b></div>`).join('')}</div>` : ''}
${C().hist.length ? `<div class="cp-sec"><h3>Todas tus compras</h3></div><div class="cp-hist">${C().hist.slice(0, 30).map(histRow).join('')}</div>` : `<div class="card cp-empty">${img('cp_ticket', 44, '', 'cp-float')}<span class="faint">Cuando cierres tu primera compra, aquí verás cuánto gastas por semana y por mes.</span></div>`}`;
}

// ---------------- Arranque ----------------
const st0 = A.start;
A.start = async () => {
  await st0();
  S.cp = null; C();
  if (online()) setTimeout(() => { loadShared(); C().shDirty.forEach(pushShared); }, 2500);
};
A.cpListsCount = () => (S.cp ? S.cp.lists.length : 0);
})();
