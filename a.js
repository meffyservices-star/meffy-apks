/* aeffy · núcleo: utilidades, datos, etiquetas, audio, color */
'use strict';
const A = window.A = {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ms = (n, f) => `<span class="ms${f ? ' f' : ''}" aria-hidden="true">${n}</span>`;
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch (e) { return d } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } };
const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') };
const fmtL = s => { s = s || 0; if (s < 60) return Math.round(s) + ' s'; const m = Math.round(s / 60); if (m < 60) return m + ' min'; const h = Math.floor(m / 60); return h + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '') };
const dkey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const hueOf = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h };
const base = n => n.replace(/\.[^.]+$/, '');
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = Math.imul(s ^ s >>> 15, 1 | s) + 0x6D2B79F5 | 0, ((s ^ s >>> 14) >>> 0) / 4294967296)) }
function shuffled(a, seed) { const r = seed ? rng(seed) : Math.random; const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[b[i], b[j]] = [b[j], b[i]] } return b }
let toastT; function toast(m) { const e = $('#toast'); e.textContent = m; e.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('on'), 2600) }
Object.assign(A, { $, $$, esc, ms, lsGet, lsSet, fmt, fmtL, dkey, hueOf, shuffled, toast, base });

/* ---------- formas Material 3 Expressive ---------- */
function polar(n, amp, r0 = 46, pts = 144) { let d = ''; for (let i = 0; i <= pts; i++) { const a = i / pts * Math.PI * 2; const r = r0 + amp * Math.cos(n * a); d += (i ? 'L' : 'M') + (50 + r * Math.cos(a)).toFixed(2) + ' ' + (50 + r * Math.sin(a)).toFixed(2) } return d + 'Z' }
const SH = { cookie: polar(9, 3.2), flower: polar(6, 7, 42), sunny: polar(8, 2.6, 47), soft: polar(4, 1.6), clover: polar(4, 8, 40), burst: polar(12, 3.6, 46) };
const shp = (k = 'cookie') => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${SH[k]}"/></svg>`;
A.SH = SH; A.shp = shp;
/* logo: flor de 6 pétalos con la clave de sol en corazón */
const CLEF = 'M50 80 C38 72 30 64 31 55 C32 47 40 44 46 48 C48 49 50 52 50 54 C50 52 52 49 54 48 C60 44 68 47 69 55 C70 64 62 72 50 80 M55 12 C62 10 65 20 58 27 C52 33 47 36 46 44 M55 12 C50 13 49 20 50 28 L50 84 C50 90 44 91 42 88 C40 85 44 82 47 85';
A.logo = (sz = 40, fill = 'var(--p)', ink = 'var(--onp)') => `<svg width="${sz}" height="${sz}" viewBox="0 0 100 100" aria-hidden="true"><path d="${SH.flower}" fill="${fill}"/><path d="${CLEF}" fill="none" stroke="${ink}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- ajustes ---------- */
const DEF = {
  name: '', mode: 'dark', amoled: false, remember: false, color: 'aeffy', neutral: false, coverColor: true,
  autoScan: true, background: true, crossfade: true, xfade: 4, gapless: false, normalize: true, rgMode: 'track', rgLevel: 'normal',
  speed: 1, eqOn: false, eq: Array(12).fill(0), bass: 0, mid: 0, treble: 0, balance: 0, constVol: false, limiter: false,
  karaoke: false, autoLyrics: true, showFriends: true, smartQueue: false, spotPeople: 4, backupAuto: true, lang: 'auto', onboarded: false
};
A.ST = Object.assign({}, DEF, lsGet('ae_set', {}));
if (!Array.isArray(A.ST.eq) || A.ST.eq.length !== 12) A.ST.eq = Array(12).fill(0);
A.saveSet = () => lsSet('ae_set', A.ST);
A.STS = Object.assign({ t: {}, h: Array(24).fill(0), d: {}, a: {}, al: {}, plays: {}, recent: [], sessions: [], firstDay: dkey(new Date()) }, lsGet('ae_stats', {}));
A.saveStats = () => lsSet('ae_stats', A.STS);
A.META = lsGet('ae_meta', {}); A.saveMeta = () => lsSet('ae_meta', A.META);
A.meta = id => A.META[id] || (A.META[id] = {});
A.LISTS = lsGet('ae_lists', []); A.saveLists = () => lsSet('ae_lists', A.LISTS);
A.ALRATE = lsGet('ae_alrate', {}); A.saveAlRate = () => lsSet('ae_alrate', A.ALRATE);
A.TOOLUSE = lsGet('ae_tooluse', {});
A.isFav = id => !!(A.META[id] && A.META[id].fav);

/* ---------- biblioteca ---------- */
A.tracks = [];
A.byId = id => A.tracks.find(t => t.id === id);
A.MEMBLOB = new Map();
let db = null;
function openDB() { return new Promise(r => { try { const q = indexedDB.open('aeffy', 1); q.onupgradeneeded = () => { const d = q.result; d.createObjectStore('meta', { keyPath: 'id' }); d.createObjectStore('blob') }; q.onsuccess = () => r(q.result); q.onerror = () => r(null); q.onblocked = () => r(null) } catch (e) { r(null) } }) }
function tx(store, mode, fn) { return new Promise(res => { if (!db) return res(null); try { const t = db.transaction(store, mode); const q = fn(t.objectStore(store)); t.oncomplete = () => res(q ? q.result : true); t.onerror = () => res(null); t.onabort = () => res(null) } catch (e) { res(null) } }) }
A.tx = tx;
A.loadLibrary = async () => {
  db = await openDB(); if (!db) return;
  const ms_ = await tx('meta', 'readonly', s => s.getAll()); if (ms_) A.tracks = ms_;
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist() } catch (e) { }
};
A.hasDB = () => !!db;
A.saveTrack = t => tx('meta', 'readwrite', s => s.put(t));

/* ---------- etiquetas ID3 / FLAC ---------- */
const clean = s => String(s || '').replace(/\0+$/, '').replace(/\0/g, ', ').trim();
function dec(b, enc) { try { if (enc === 0) return new TextDecoder('windows-1252').decode(b); if (enc === 1) { const be = b[0] === 0xFE && b[1] === 0xFF, bom = (b[0] === 0xFF && b[1] === 0xFE) || be; return new TextDecoder(be ? 'utf-16be' : 'utf-16le').decode(b.subarray(bom ? 2 : 0)) } if (enc === 2) return new TextDecoder('utf-16be').decode(b); return new TextDecoder('utf-8').decode(b) } catch (e) { return '' } }
function skipStr(d, q, enc) { if (enc === 1 || enc === 2) { while (q + 1 < d.length && !(d[q] === 0 && d[q + 1] === 0)) q += 2; return q + 2 } while (q < d.length && d[q] !== 0) q++; return q + 1 }
const ss = (a, b, c, d) => ((a & 127) << 21) | ((b & 127) << 14) | ((c & 127) << 7) | (d & 127);
function parseID3(b) {
  const v = b[3], flags = b[5], end = Math.min(b.length, 10 + ss(b[6], b[7], b[8], b[9])); let p = 10; const o = {};
  if (flags & 0x40 && v >= 3) p += v === 4 ? ss(b[10], b[11], b[12], b[13]) : ((b[10] << 24) | (b[11] << 16) | (b[12] << 8) | b[13]) + 4;
  const map = { TIT2: 'title', TT2: 'title', TPE1: 'artist', TP1: 'artist', TPE2: 'albumArtist', TALB: 'album', TAL: 'album', TYER: 'year', TDRC: 'year', TYE: 'year', TRCK: 'track', TRK: 'track', TCON: 'genre', TCO: 'genre', TPUB: 'label', TSRC: 'isrc' };
  while (p < end - 6) {
    let id, sz, hs; if (v === 2) { id = String.fromCharCode(b[p], b[p + 1], b[p + 2]); sz = (b[p + 3] << 16) | (b[p + 4] << 8) | b[p + 5]; hs = 6 } else { id = String.fromCharCode(b[p], b[p + 1], b[p + 2], b[p + 3]); sz = v === 4 ? ss(b[p + 4], b[p + 5], b[p + 6], b[p + 7]) : ((b[p + 4] << 24) | (b[p + 5] << 16) | (b[p + 6] << 8) | b[p + 7]); hs = 10 }
    if (!/^[A-Z0-9]{3,4}$/.test(id) || sz <= 0 || p + hs + sz > b.length) break;
    const d = b.subarray(p + hs, p + hs + sz);
    if (map[id]) { if (!o[map[id]]) o[map[id]] = clean(dec(d.subarray(1), d[0])) }
    else if (id === 'APIC' || id === 'PIC') {
      const enc = d[0]; let q, mime; if (id === 'PIC') { mime = 'image/' + String.fromCharCode(d[1], d[2], d[3]).toLowerCase(); q = 4 } else { q = 1; while (q < d.length && d[q] !== 0) q++; mime = new TextDecoder('windows-1252').decode(d.subarray(1, q)); q++ }
      const pt = d[q]; q = skipStr(d, q + 1, enc); if (!mime.includes('/')) mime = 'image/jpeg'; if (mime === 'image/jpg') mime = 'image/jpeg';
      if (!o.pic || pt === 3) o.pic = new Blob([d.subarray(q)], { type: mime })
    }
    else if (id === 'USLT' || id === 'ULT') { const enc = d[0]; const q = skipStr(d, 4, enc); if (!o.lyrics) o.lyrics = clean(dec(d.subarray(q), enc)) }
    p += hs + sz
  }
  if (o.year) o.year = o.year.slice(0, 4); if (o.genre) o.genre = o.genre.replace(/^\((\d+)\)$/, '$1'); return o
}
function parseFLAC(b) {
  const o = {}; let p = 4; const dv = new DataView(b.buffer, b.byteOffset, b.byteLength), td = new TextDecoder();
  while (p + 4 <= b.length) {
    const h = b[p], last = h & 128, type = h & 127, len = (b[p + 1] << 16) | (b[p + 2] << 8) | b[p + 3]; p += 4; if (p + len > b.length) break;
    try {
      if (type === 0) { o.sr = (dv.getUint32(p + 10) >>> 12); o.bits = ((dv.getUint16(p + 12) >> 4) & 31) + 1 }
      else if (type === 4) { let q = p; q += 4 + dv.getUint32(q, true); const n = dv.getUint32(q, true); q += 4; for (let i = 0; i < n && q < p + len; i++) { const l = dv.getUint32(q, true); q += 4; const s = td.decode(b.subarray(q, q + l)); q += l; const e = s.indexOf('='); if (e < 0) continue; const k = { TITLE: 'title', ARTIST: 'artist', ALBUMARTIST: 'albumArtist', ALBUM: 'album', DATE: 'year', TRACKNUMBER: 'track', LYRICS: 'lyrics', UNSYNCEDLYRICS: 'lyrics', GENRE: 'genre', LABEL: 'label', ISRC: 'isrc' }[s.slice(0, e).toUpperCase()]; if (k && !o[k]) o[k] = s.slice(e + 1) } }
      else if (type === 6) { let q = p; const pt = dv.getUint32(q); q += 4; const ml = dv.getUint32(q); q += 4; const mime = td.decode(b.subarray(q, q + ml)); q += ml; const dl = dv.getUint32(q); q += 4 + dl + 16; const L = dv.getUint32(q); q += 4; if (!o.pic || pt === 3) o.pic = new Blob([b.subarray(q, q + L)], { type: mime || 'image/jpeg' }) }
    } catch (e) { }
    p += len; if (last) break
  }
  if (o.year) o.year = String(o.year).slice(0, 4); return o
}
function mp3Rate(b, start) { const R = [[11025, 12000, 8000], null, [22050, 24000, 16000], [44100, 48000, 32000]]; for (let i = start; i < Math.min(b.length - 4, start + 60000); i++) { if (b[i] === 0xFF && (b[i + 1] & 0xE0) === 0xE0) { const ver = (b[i + 1] >> 3) & 3, sri = (b[i + 2] >> 2) & 3; if (ver !== 1 && sri !== 3 && R[ver]) return R[ver][sri] } } return 0 }
A.readTags = async f => {
  const h = new Uint8Array(await f.slice(0, 10).arrayBuffer());
  if (h[0] === 73 && h[1] === 68 && h[2] === 51) { const sz = ss(h[6], h[7], h[8], h[9]); const b = new Uint8Array(await f.slice(0, Math.min(sz + 10 + 70000, 16e6)).arrayBuffer()); const o = parseID3(b); o.sr = mp3Rate(b, sz + 10); return o }
  if (h[0] === 102 && h[1] === 76 && h[2] === 97 && h[3] === 67) return parseFLAC(new Uint8Array(await f.slice(0, Math.min(f.size, 10e6)).arrayBuffer()));
  if (h[0] === 0xFF && (h[1] & 0xE0) === 0xE0) { const b = new Uint8Array(await f.slice(0, 8000).arrayBuffer()); return { sr: mp3Rate(b, 0) } }
  if (h[0] === 82 && h[1] === 73 && h[2] === 70 && h[3] === 70) { const b = new DataView(await f.slice(0, 64).arrayBuffer()); return { sr: b.getUint32(24, true), bits: b.getUint16(34, true) } }
  return {}
};
A.parseID3 = parseID3;
function loadImg(blob) { return new Promise((res, rej) => { const u = URL.createObjectURL(blob); const i = new Image(); i.onload = () => { URL.revokeObjectURL(u); res(i) }; i.onerror = () => { URL.revokeObjectURL(u); rej() }; i.src = u }) }
A.loadImg = loadImg;
function rgb2hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60 } return [Math.round(h), s, l] }
A.shrinkCover = async blob => {
  const i = await loadImg(blob); const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; const s = Math.min(i.width, i.height); x.drawImage(i, (i.width - s) / 2, (i.height - s) / 2, s, s, 0, 0, 512, 512);
  const url = c.toDataURL('image/jpeg', .9); const d = document.createElement('canvas'); d.width = d.height = 24; const y = d.getContext('2d'); y.drawImage(c, 0, 0, 24, 24); const px = y.getImageData(0, 0, 24, 24).data;
  const bins = new Array(36).fill(0).map(() => ({ w: 0, s: 0 })); let gray = 0, tot = 0;
  for (let k = 0; k < px.length; k += 4) { const [h, s, l] = rgb2hsl(px[k], px[k + 1], px[k + 2]); const w = s * (1 - Math.abs(l - .5) * 1.6); tot++; if (s < .15 || l < .08 || l > .94) { gray++; continue } const b = bins[Math.floor(h / 10) % 36]; b.w += w; b.s += s * w }
  let best = 0; bins.forEach((b, i) => { const w3 = b.w + bins[(i + 35) % 36].w * .5 + bins[(i + 1) % 36].w * .5; if (w3 > bins[best].w + bins[(best + 35) % 36].w * .5 + bins[(best + 1) % 36].w * .5) best = i });
  const bb = bins[best]; const hue = best * 10 + 5; const sat = bb.w ? bb.s / bb.w : 0; const neutral = gray / tot > .7 || bb.w < 1.2;
  return { url, hue, sat: neutral ? .12 : Math.max(.35, Math.min(1, sat)) }
};
A.probeDur = f => new Promise(res => { const a = document.createElement('audio'); const u = URL.createObjectURL(f); let done = false; const fin = v => { if (done) return; done = true; URL.revokeObjectURL(u); a.removeAttribute('src'); res(isFinite(v) ? v : 0) }; a.preload = 'metadata'; a.onloadedmetadata = () => fin(a.duration); a.onerror = () => fin(0); setTimeout(() => fin(0), 6000); a.src = u });

/* ---------- importar ---------- */
const AUD = /\.(mp3|flac|wav|ogg|oga|opus|m4a|aac|webm|aif|aiff|alac)$/i;
A.importFiles = async (files, onDone) => {
  const arr = [...files]; const lrcs = {};
  for (const f of arr) if (/\.lrc$/i.test(f.name)) lrcs[base(f.name).toLowerCase()] = await f.text();
  const auds = arr.filter(f => AUD.test(f.name) || /^audio\//.test(f.type));
  if (!auds.length) {
    let n = 0; for (const t of A.tracks) { const k = base(t.file || '').toLowerCase(); if (lrcs[k]) { t.lrc = lrcs[k]; n++; A.saveTrack(t) } }
    toast(n ? `Agregaste ${n} letras` : 'No encontré música ahí'); return
  }
  let n = 0, skip = 0; const bar = $('#bar0');
  for (const f of auds) {
    if (A.tracks.some(t => t.file === f.name && t.size === f.size)) { skip++; continue }
    const id = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); let tg = {}; try { tg = await A.readTags(f) } catch (e) { }
    const b = base(f.name); let artist = '', name = b; const m = b.match(/^(.+?)\s+-\s+(.+)$/); if (m) { artist = m[1]; name = m[2] } name = name.replace(/^\d{1,3}[\s.\-_]+/, '') || b;
    const parts = (f.webkitRelativePath || '').split('/'); const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
    const t = { id, file: f.name, folder, size: f.size, name: tg.title || name, artist: tg.artist || artist || 'Artista desconocido', albumArtist: tg.albumArtist || '', album: tg.album || (folder ? parts[parts.length - 2] : '') || 'Sin álbum', year: tg.year || '', track: parseInt(tg.track) || 0, genre: tg.genre || '', label: tg.label || '', isrc: tg.isrc || '', ext: (f.name.split('.').pop() || '').toUpperCase(), sr: tg.sr || 0, bits: tg.bits || 0, addedAt: Date.now(), cover: null, hue: null, sat: null, lrc: lrcs[b.toLowerCase()] || '', uslt: tg.lyrics || '', dur: 0 };
    if (tg.pic) { try { const c = await A.shrinkCover(tg.pic); t.cover = c.url; t.hue = c.hue; t.sat = c.sat; await tx('blob', 'readwrite', s => s.put(tg.pic, 'cv:' + id)) } catch (e) { } }
    if (t.hue == null) { t.hue = hueOf(t.album + t.artist); t.sat = .55 }
    t.dur = await A.probeDur(f);
    A.MEMBLOB.set(id, f); A.tracks.push(t); await A.saveTrack(t); await tx('blob', 'readwrite', s => s.put(f, id));
    n++; bar.style.width = (n / auds.length * 100) + '%'
  }
  bar.style.width = '0';
  toast(n ? `Agregaste ${n} ${n === 1 ? 'canción' : 'canciones'}${skip ? ' · ' + skip + ' ya estaban' : ''}` : 'Esas canciones ya estaban');
  if (!db && n) setTimeout(() => toast('Este navegador no guarda archivos: al cerrar tendrás que agregarlos otra vez'), 2800);
  onDone && onDone()
};
A.deleteTrack = async id => {
  A.tracks = A.tracks.filter(t => t.id !== id); A.MEMBLOB.delete(id); delete A.META[id]; A.saveMeta();
  A.LISTS.forEach(l => l.ids = l.ids.filter(x => x !== id)); A.saveLists();
  await tx('meta', 'readwrite', s => s.delete(id)); await tx('blob', 'readwrite', s => s.delete(id));
  const P = A.P; const qi = P.queue.indexOf(id); if (qi >= 0) { P.queue.splice(qi, 1); if (qi < P.qi) P.qi-- }
  if (P.cur === id) { P.au.pause(); P.au.removeAttribute('src'); P.cur = null }
};

/* ---------- color: la portada tiñe toda la app ---------- */
A.SWATCHES = [
  { k: 'aeffy', n: 'aeffy', h: 222, s: 1 }, { k: 'indigo', n: 'Índigo', h: 245, s: .9 }, { k: 'pizarra', n: 'Pizarra', h: 210, s: .35 }, { k: 'esmeralda', n: 'Esmeralda', h: 150, s: .8 },
  { k: 'cian', n: 'Cian', h: 188, s: .9 }, { k: 'coral', n: 'Coral', h: 12, s: .9 }, { k: 'ambar', n: 'Ámbar', h: 38, s: .9 }, { k: 'lima', n: 'Lima', h: 82, s: .8 },
  { k: 'rosa', n: 'Rosa', h: 335, s: .95 }, { k: 'pastelito', n: 'Pastelito', h: 340, s: .7, pastel: 1 },
  { k: 'chicle', n: 'Rosa chicle', h: 328, s: .8, pastel: 1, ps: 1, pl: 56 }, { k: 'menta', n: 'Menta', h: 160, s: .5, pastel: 1, ps: .7, pl: 36 }];
A.applyPalette = (h, s) => {
  const r = document.documentElement.style, light = A.ST.mode === 'light' || (A.ST.mode === 'auto' && matchMedia('(prefers-color-scheme: light)').matches);
  if (A.ST.neutral) s = .08;
  const S = (x) => Math.round(x * s) + '%';
  r.setProperty('--h', h);
  if (light) {
    r.setProperty('--p', `hsl(${h} ${S(60)} 38%)`); r.setProperty('--onp', '#fff'); r.setProperty('--pc', `hsl(${h} ${S(70)} 86%)`); r.setProperty('--pcl', `hsl(${h} ${S(60)} 78%)`);
    r.setProperty('--mini', `hsl(${h} ${S(60)} 84%)`); r.setProperty('--onpc', `hsl(${h} 50% 14%)`); r.setProperty('--fpbg', `linear-gradient(180deg,hsl(${h} ${S(60)} 80%),hsl(${h} ${S(40)} 92%) 70%)`)
  } else {
    r.setProperty('--p', `hsl(${h} ${S(92)} 84%)`); r.setProperty('--onp', `hsl(${h} ${S(55)} 16%)`); r.setProperty('--pc', `hsl(${h} ${S(34)} 33%)`); r.setProperty('--pcl', `hsl(${h} ${S(30)} 42%)`);
    r.setProperty('--mini', `hsl(${h} ${S(32)} 36%)`); r.setProperty('--onpc', '#f2f4ff'); r.setProperty('--fpbg', `linear-gradient(180deg,hsl(${h} ${S(42)} 27%) 0%,hsl(${h} ${S(36)} 17%) 55%,hsl(${h} ${S(26)} 11%) 100%)`)
  }
  const PV = ['--bg', '--s1', '--s2', '--s3', '--s4', '--line']; PV.forEach(k => r.removeProperty(k));
  if (A._pastel && !A.ST.neutral) {
    const P = A._pastel, ps = P.ps ?? .9, pl = P.pl ?? 56, Q = x => Math.round(x * ps) + '%', H = P.h;
    if (light) { [['--bg', `hsl(${H} ${Q(80)} 97%)`], ['--s1', `hsl(${H} ${Q(70)} 94%)`], ['--s2', `hsl(${H} ${Q(60)} 90%)`], ['--s3', `hsl(${H} ${Q(52)} 86%)`], ['--s4', `hsl(${H} ${Q(45)} 80%)`], ['--line', `hsl(${H} ${Q(45)} 85%)`], ['--p', `hsl(${H} ${Q(55)} ${pl}%)`], ['--onp', '#fff'], ['--pc', `hsl(${H} ${Q(70)} 88%)`], ['--pcl', `hsl(${H} ${Q(62)} 80%)`], ['--mini', `hsl(${H} ${Q(62)} 85%)`], ['--onpc', `hsl(${H} 42% 20%)`], ['--fpbg', `linear-gradient(180deg,hsl(${H} ${Q(65)} 84%),hsl(${H} ${Q(70)} 94%) 55%,hsl(${H} ${Q(80)} 97%))`]].forEach(([k, v]) => r.setProperty(k, v)) }
    else { [['--p', `hsl(${H} ${Q(88)} 86%)`], ['--onp', `hsl(${H} 45% 18%)`], ['--pc', `hsl(${H} ${Q(32)} 33%)`], ['--pcl', `hsl(${H} ${Q(34)} 43%)`], ['--mini', `hsl(${H} ${Q(30)} 35%)`], ['--onpc', `hsl(${H} 60% 96%)`], ['--fpbg', `linear-gradient(180deg,hsl(${H} ${Q(34)} 29%) 0%,hsl(${H} ${Q(28)} 18%) 55%,hsl(${H} ${Q(22)} 11%) 100%)`]].forEach(([k, v]) => r.setProperty(k, v)) }
  }
  r.setProperty('--glow', `hsl(${h} ${S(50)} 40% / .35)`);
  const m = $('meta[name=theme-color]'); if (m) m.content = light ? `hsl(${h} 30% 97%)` : '#0e1016';
};
A.baseColor = () => A.SWATCHES.find(x => x.k === A.ST.color) || A.SWATCHES[0];
A.repaint = () => {
  const t = A.P && A.byId(A.P.cur); const b = A.baseColor();
  A._pastel = b.pastel && !(t && A.ST.coverColor) ? b : null;
  if (t && A.ST.coverColor) A.applyPalette(t.hue ?? b.h, t.sat ?? .6); else A.applyPalette(b.h, b.s);
  document.documentElement.dataset.mode = A.ST.mode === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : A.ST.mode;
  document.documentElement.dataset.amoled = A.ST.amoled ? '1' : '0';
};
A.cov = (t, cls = '') => {
  if (t && t.cover) return `<div class="cov ${cls}"><img src="${esc(t.cover)}" alt="" loading="lazy" decoding="async"${/\bhi\b/.test(cls) && t.id ? ` data-hi="${t.id}"` : ''}></div>`;
  if (!t) return `<div class="cov ${cls}">${ms('music_note')}</div>`;
  return `<div class="cov gen ${cls}" style="--ch:${t.hue ?? hueOf((t.album || '') + (t.artist || ''))}">${ms('music_note')}</div>`
};

/* ---------- reproductor ---------- */
const P = A.P = { au: new Audio(), queue: [], qi: -1, cur: null, shuffle: false, repeat: 0, from: 'Tu biblioteca', url: null, last: 0, dirty: 0, sleepT: null, sess: null };
P.au.preload = 'auto';
let actx = null, eqN = [], tone = [], panN = null, gainN = null, compN = null, fadeN = null;
const EQF = [32, 56, 100, 180, 320, 560, 1000, 1800, 3200, 5600, 10000, 16000];
A.EQF = EQF;
A.EQP = {
  'Plano (bit-perfect)': Array(12).fill(0), 'Calidez de referencia Hi-Fi': [2, 2, 1.5, 1, .5, 0, -.5, -.5, 0, .5, 1, 1],
  'Golpe de subgraves': [7, 6, 4.5, 2.5, 1, 0, 0, 0, 0, 0, .5, 1], 'Claridad vocal y acústica': [-2, -1.5, -1, 0, 1.5, 3, 3.5, 3, 2, 1, 0, -.5],
  'Electrónica / Synthwave en V': [5, 4.5, 3, 1, -1, -2.5, -2.5, -1, 1, 3, 4.5, 5]
};
A.initAudio = () => {
  if (actx) return; try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return; actx = new C(); const src = actx.createMediaElementSource(P.au); let n = src;
    eqN = EQF.map((f, i) => { const b = actx.createBiquadFilter(); b.type = 'peaking'; b.frequency.value = f; b.Q.value = 1.2; n.connect(b); n = b; return b });
    const lo = actx.createBiquadFilter(); lo.type = 'lowshelf'; lo.frequency.value = 180; const mid = actx.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 1000; mid.Q.value = .7; const hi = actx.createBiquadFilter(); hi.type = 'highshelf'; hi.frequency.value = 5000;
    n.connect(lo); lo.connect(mid); mid.connect(hi); tone = [lo, mid, hi]; n = hi;
    panN = actx.createStereoPanner ? actx.createStereoPanner() : null; if (panN) { n.connect(panN); n = panN }
    compN = actx.createDynamicsCompressor(); fadeN = actx.createGain(); gainN = actx.createGain();
    n.connect(fadeN); fadeN.connect(gainN); gainN.connect(actx.destination); try { A._dest = actx.createMediaStreamDestination() } catch (e) { } A.applyAudio()
  } catch (e) { }
};
A.spotStream = () => { A.initAudio(); if (actx && actx.state === 'suspended') actx.resume(); return A._dest ? A._dest.stream : null };
A.applyAudio = () => {
  if (!actx) return; const S = A.ST;
  eqN.forEach((b, i) => b.gain.value = S.eqOn ? (S.eq[i] || 0) : 0);
  if (tone.length) { tone[0].gain.value = S.bass; tone[1].gain.value = S.mid; tone[2].gain.value = S.treble }
  if (panN) panN.pan.value = S.balance;
  const boost = S.eqOn ? Math.max(0, ...S.eq) : 0; let g = S.constVol ? Math.pow(10, -boost / 20) : 1;
  try { gainN.disconnect() } catch (e) { }
  if (S.limiter || S.normalize) { compN.threshold.value = S.limiter ? -3 : -14; compN.ratio.value = S.limiter ? 20 : 3; gainN.connect(compN); compN.connect(actx.destination) } else gainN.connect(actx.destination);
  if (A._dest) gainN.connect(A._dest);
  const lvl = { silencioso: .7, normal: 1, alto: 1.2 }[S.rgLevel] || 1; gainN.gain.value = g * (S.normalize ? lvl : 1);
};
async function blobFor(t) {
  if (t.native) { try { const r = await fetch('/__native/audio/' + t.nid); if (!r.ok) return null; return await r.blob() } catch (e) { return null } }
  let b = A.MEMBLOB.get(t.id); if (!b) { b = await tx('blob', 'readonly', s => s.get(t.id)); if (b) A.MEMBLOB.set(t.id, b) } return b }
A.blobFor = blobFor;
A.saveBlob = async (blob, name) => {
  if (window.AeffyNative) { const b64 = await new Promise(r => { const f = new FileReader(); f.onload = () => r(String(f.result).split(',')[1] || ''); f.readAsDataURL(blob) }); const ok = AeffyNative.saveFile(name, blob.type || 'application/octet-stream', b64); if (!ok) toast('No pude guardar el archivo'); return }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 30000) };
A.playIdx = async (i, keepPos, noPlay) => {
  P.qi = i; const t = A.byId(P.queue[i]); if (!t) return; A.initAudio(); if (actx && actx.state === 'suspended') actx.resume();
  const b = await blobFor(t); if (!b) { toast('No encuentro el archivo; vuelve a agregar esta canción'); return }
  if (P.url) URL.revokeObjectURL(P.url); P.url = URL.createObjectURL(b); P.cur = t.id; P.au.src = P.url; P.au.playbackRate = A.ST.speed; P.last = 0;
  if (fadeN) fadeN.gain.value = A.ST.crossfade ? 0 : 1;
  if (noPlay) { if (fadeN) fadeN.gain.value = 1; if (noPlay.t) { const seek = () => { try { P.au.currentTime = noPlay.t } catch (e) { } }; P.au.readyState >= 1 ? seek() : P.au.addEventListener('loadedmetadata', seek, { once: true }) } if (noPlay.play) { try { await P.au.play() } catch (e) { } } setMedia(t); A.repaint(); A.onTrack && A.onTrack(t); return }
  try { await P.au.play() } catch (e) { }
  if (fadeN && A.ST.crossfade) fadeN.gain.setTargetAtTime(1, actx.currentTime, .4);
  const S = A.STS; S.recent = [t.id, ...S.recent.filter(x => x !== t.id)].slice(0, 60); S.plays[t.id] = (S.plays[t.id] || 0) + 1; A.saveStats();
  A.meta(t.id).last = Date.now(); A.saveMeta();
  setMedia(t); A.repaint(); A.onTrack && A.onTrack(t); A.liveNotify && A.liveNotify(); if (A.ST.autoLyrics) A.fetchLyrics(t);
};
A.playList = (ids, start, from) => { if (!ids.length) return; start = Math.max(0, start || 0); let q = [...ids], i = start; if (P.shuffle) { const first = q[start]; q = [first, ...shuffled(q.filter((x, k) => k !== start))]; i = 0 } P.queue = q; P.from = from || 'Tu biblioteca'; A.playIdx(i) };
A.toggle = () => { if (!P.cur) { if (A.tracks.length) A.playList(A.tracks.map(t => t.id), 0, 'Tu biblioteca'); return } if (actx && actx.state === 'suspended') actx.resume(); P.au.paused ? P.au.play().catch(() => { }) : P.au.pause() };
A.next = () => { if (P.qi < P.queue.length - 1) A.playIdx(P.qi + 1); else if (P.repeat === 1 && P.queue.length) A.playIdx(0); else { P.au.pause(); P.au.currentTime = 0 } };
A.prev = () => { if (P.au.currentTime > 3) { P.au.currentTime = 0; return } if (P.qi > 0) A.playIdx(P.qi - 1); else P.au.currentTime = 0 };
P.au.addEventListener('ended', () => { if (P.repeat === 2) { P.au.currentTime = 0; P.au.play().catch(() => { }) } else A.next() });
P.au.addEventListener('play', () => { A.onPlayState && A.onPlayState(); A.liveNotify && A.liveNotify(); if (!P.sess) P.sess = { s: Date.now(), l: 0 } });
P.au.addEventListener('pause', () => { A.onPlayState && A.onPlayState(); A.liveNotify && A.liveNotify(); endSession(); A.saveStats() });
P.au.addEventListener('loadedmetadata', () => { const t = A.byId(P.cur); if (t && isFinite(P.au.duration) && Math.abs((t.dur || 0) - P.au.duration) > 1) { t.dur = P.au.duration; A.saveTrack(t) } });
P.au.addEventListener('seeked', () => { P.last = P.au.currentTime; A.liveNotify && A.liveNotify() });
function endSession() { if (P.sess && P.sess.l > 20) { A.STS.sessions.push({ d: dkey(new Date(P.sess.s)), l: Math.round(P.sess.l) }); if (A.STS.sessions.length > 400) A.STS.sessions.shift() } P.sess = null }
P.au.addEventListener('timeupdate', () => {
  const c = P.au.currentTime, d = c - P.last; P.last = c;
  if (!P.au.paused && d > 0 && d < 2.5 && P.cur) {
    const t = A.byId(P.cur), now = new Date(), k = dkey(now), S = A.STS;
    S.t[P.cur] = (S.t[P.cur] || 0) + d; S.h[now.getHours()] += d; S.d[k] = (S.d[k] || 0) + d; if (t) { S.a[t.artist] = (S.a[t.artist] || 0) + d; S.al[t.album] = (S.al[t.album] || 0) + d }
    if (P.sess) P.sess.l += d;
    if (++P.dirty > 20) { P.dirty = 0; A.saveStats() }
    const dur = P.au.duration;
    if (fadeN && A.ST.crossfade && dur && dur - c < A.ST.xfade && P.repeat !== 2 && (P.qi < P.queue.length - 1 || P.repeat === 1)) fadeN.gain.value = Math.max(0, (dur - c) / A.ST.xfade);
  }
  A.onTime && A.onTime(c)
});
function setMedia(t) { if (!('mediaSession' in navigator)) return; try { navigator.mediaSession.metadata = new MediaMetadata({ title: t.name, artist: t.artist, album: t.album, artwork: t.cover ? [{ src: t.cover, sizes: '360x360', type: 'image/jpeg' }] : [{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }] });[['play', () => P.au.play()], ['pause', () => P.au.pause()], ['nexttrack', A.next], ['previoustrack', A.prev], ['seekto', e => { P.au.currentTime = e.seekTime }]].forEach(([a, f]) => { try { navigator.mediaSession.setActionHandler(a, f) } catch (e) { } }) } catch (e) { } }
A.setSleep = min => { clearTimeout(P.sleepT); P.sleepAt = min ? Date.now() + min * 60000 : 0; if (min) P.sleepT = setTimeout(() => { P.au.pause(); P.sleepAt = 0; toast('Buenas noches: se pausó la música') }, min * 60000) };

/* ---------- letras: LRCLIB ---------- */
A.parseLRC = s => { const out = []; for (const line of String(s).split(/\r?\n/)) { const tags = [...line.matchAll(/\[(\d+):(\d+(?:[.:]\d+)?)\]/g)]; if (!tags.length) continue; const x = line.replace(/\[[^\]]*\]/g, '').replace(/<\d+:\d+(?:\.\d+)?>/g, '').trim(); for (const m of tags) out.push({ t: +m[1] * 60 + parseFloat(m[2].replace(':', '.')), x }) } return out.sort((a, b) => a.t - b.t) };
A.lyricsOf = t => (A.META[t.id] && A.META[t.id].lyr) || t.lrc || t.uslt || '';
A.fetchLyrics = async (t, force) => {
  if (!t || (!force && A.lyricsOf(t)) || (!force && A.meta(t.id).noLyr)) return A.lyricsOf(t);
  try {
    const q = new URLSearchParams({ artist_name: t.artist, track_name: t.name }); if (t.album && t.album !== 'Sin álbum') q.set('album_name', t.album); if (t.dur) q.set('duration', Math.round(t.dur));
    let r = await fetch('https://lrclib.net/api/get?' + q); let j = r.ok ? await r.json() : null;
    if (!j || (!j.syncedLyrics && !j.plainLyrics)) { r = await fetch('https://lrclib.net/api/search?' + new URLSearchParams({ q: t.artist + ' ' + t.name })); const arr = r.ok ? await r.json() : []; j = arr.find(x => x.syncedLyrics) || arr[0] }
    const txt = j ? (j.syncedLyrics || j.plainLyrics || '') : '';
    if (txt) { t.lrc = txt; A.saveTrack(t); A.onLyrics && A.onLyrics(t) } else { A.meta(t.id).noLyr = 1; A.saveMeta() }
    return txt
  } catch (e) { return '' }
};

/* ---------- estadísticas ---------- */
A.range = k => { const now = new Date(); const d = new Date(now); if (k === 'hoy') return [dkey(now)]; const n = { semana: 7, mes: 30, año: 365 }[k]; if (!n) return Object.keys(A.STS.d); const out = []; for (let i = 0; i < n; i++) { out.push(dkey(d)); d.setDate(d.getDate() - 1) } return out };
A.sumDays = keys => keys.reduce((a, k) => a + (A.STS.d[k] || 0), 0);
A.streak = () => { const ok = k => (A.STS.d[k] || 0) >= 30; let cur = 0; const d = new Date(); if (!ok(dkey(d))) d.setDate(d.getDate() - 1); while (ok(dkey(d))) { cur++; d.setDate(d.getDate() - 1) } const ks = Object.keys(A.STS.d).filter(ok).sort(); let best = 0, run = 0, pv = null; for (const k of ks) { const t = new Date(k + 'T12:00'); run = pv && (t - pv) / 864e5 < 1.5 ? run + 1 : 1; best = Math.max(best, run); pv = t } return { cur, best } };
A.topTracks = n => Object.entries(A.STS.t).filter(([id]) => A.byId(id)).sort((a, b) => b[1] - a[1]).slice(0, n).map(([id, s]) => ({ t: A.byId(id), s }));
A.topBy = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
A.peakHour = () => { let m = 0, h = -1; A.STS.h.forEach((v, i) => { if (v > m) { m = v; h = i } }); return h };
A.partOfDay = h => h < 6 ? 'madrugada' : h < 12 ? 'mañana' : h < 19 ? 'tarde' : 'noche';
A.totalSecs = () => Object.values(A.STS.d).reduce((a, b) => a + b, 0);

/* ---------- portadas en alta calidad ---------- */
const HI = new Map();
A.hiCover = async id => {
  const nt = A.byId(id); if (nt && nt.native) return '/__native/art/' + nt.nid + '?s=1200';
  if (HI.has(id)) return HI.get(id);
  const p = (async () => {
    let b = await tx('blob', 'readonly', s => s.get('cv:' + id));
    if (!b) { const a = A.MEMBLOB.get(id) || await tx('blob', 'readonly', s => s.get(id)); if (a) { try { const tg = await A.readTags(a); if (tg.pic) { b = tg.pic; tx('blob', 'readwrite', s => s.put(b, 'cv:' + id)) } } catch (e) { } } }
    return b ? URL.createObjectURL(b) : null
  })();
  HI.set(id, p); return p
};
A.upgradeCovers = (root = document) => { root.querySelectorAll('img[data-hi]').forEach(async img => { const u = await A.hiCover(img.dataset.hi); if (u && img.isConnected) img.src = u }) };
/* aeffy · pantallas */
'use strict';
{
const { $, $$, esc, ms, fmt, fmtL, dkey, shuffled, toast, shp, cov, P } = A;
const ACT = A.ACT = {};
const on = (k, f) => ACT[k] = f;
A.on = on;
const plural = (n, a, b) => n + ' ' + (n === 1 ? a : b);

/* ---------- navegación ---------- */
const TABS = ['inicio', 'buscar', 'biblioteca', 'spots'];
A.route = () => { const h = location.hash.replace(/^#\/?/, ''); const [v, ...r] = h.split('/'); return { v: v || 'inicio', arg: decodeURIComponent(r.join('/')) } };
A.go = (path, replace) => { while (layers.length) layers.pop()(); const u = '#/' + path; if (replace) history.replaceState(history.state, '', u); else history.pushState({ p: path }, '', u); A.render(); window.scrollTo(0, 0) };
A.back = () => { if (history.length > 1 && history.state) history.back(); else A.go('inicio', true) };
let lastTab = 'inicio';

/* capas (reproductor, hojas, cajón) con el botón atrás del teléfono */
const layers = [];
A.pushLayer = close => { layers.push(close); history.pushState({ layer: layers.length, p: A.route().v }, '', location.hash) };
let skipPop = 0;
A.popLayer = () => { if (!layers.length) return; const c = layers.pop(); c(); skipPop++; history.back() };
window.addEventListener('popstate', () => { if (skipPop) { skipPop--; return } if (layers.length) { const c = layers.pop(); c(); return } A.render() });

function top(opts = {}) {
  const left = opts.back ? `<button class="ib" data-a="back" aria-label="Atrás">${ms('arrow_back')}</button>` :
    `<button class="avatar" data-a="drawer" aria-label="Menú">${shp('cookie')}${A.me ? `${A.avImg()}` : (A.session ? '<b>?</b>' : ms('person'))}</button>`;
  const upd = !opts.back && A.tracks.length ? `<button class="pill" data-a="import-dir">${ms('add_circle')}Actualizar</button>` : '';
  return `<header class="top">${left}<div class="r">${opts.right || ''}${upd}<button class="ib" data-a="go" data-v="ajustes" aria-label="Ajustes">${ms('settings')}</button></div></header>`
}
A.top = top;

/* ---------- arte de los mixes ---------- */
const MIXART = {
  aleatorio: { c: '#c9751a', n: 'Aleatorio', svg: `<g fill="#e89a3d" opacity=".9"><rect x="70" y="20" width="56" height="56" rx="14" transform="rotate(18 98 48)"/><rect x="22" y="80" width="46" height="46" rx="12" transform="rotate(-14 45 103)"/></g><g fill="#c9751a"><circle cx="90" cy="40" r="5"/><circle cx="105" cy="55" r="5"/><circle cx="40" cy="98" r="4"/><circle cx="52" cy="110" r="4"/></g><path d="M18 30l14 14M18 44l14-14" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>` },
  megusta: { c: '#c23b78', n: 'Me gusta', svg: `<path d="M98 120c-30-20-46-36-46-54 0-13 10-22 22-22 9 0 17 6 24 15 7-9 15-15 24-15 12 0 22 9 22 22 0 18-16 34-46 54z" fill="none" stroke="#ec6aa6" stroke-width="12"/><path d="M34 46c-9-6-14-11-14-17 0-4 3-7 7-7 3 0 5 2 7 5 2-3 4-5 7-5 4 0 7 3 7 7 0 6-5 11-14 17z" fill="#fff" opacity=".9"/>` },
  descubrimientos: { c: '#1f8a4c', n: 'Descubrimientos', svg: `<path d="M-10 70c30-20 50 20 80 0s50 20 90 0M-10 100c30-20 50 20 80 0s50 20 90 0M-10 40c30-20 50 20 80 0s50 20 90 0" stroke="#37b36b" stroke-width="12" fill="none"/><path d="M30 18c1.5 9 5 12.5 14 14-9 1.5-12.5 5-14 14-1.5-9-5-12.5-14-14 9-1.5 12.5-5 14-14z" fill="#d8ffe6"/>` },
  diario: { c: '#2b6cb8', n: 'Mix diario', svg: `<g fill="#4a90e2"><path d="${A.SH.cookie}" transform="translate(52 30) scale(.85)"/></g><path d="${A.SH.sunny}" fill="#8cc0ff" transform="translate(-10 70) scale(.5)"/>` },
  recientes: { c: '#7a32b8', n: 'Agregados recientemente', svg: `<g fill="#9b55d6"><path d="${A.SH.clover}" transform="translate(50 40) scale(.8)"/></g>` }
};
const mixCard = (k, sub, ctx) => { const m = MIXART[k]; return `<button class="mix" data-a="playctx" data-ctx="${ctx}" data-from="${esc(m.n)}"><div class="art" style="--c:${m.c}"><svg viewBox="0 0 140 140" preserveAspectRatio="xMidYMid slice">${m.svg}</svg><i>${esc(m.n)}</i></div><b>${esc(m.n)}</b><span>${esc(sub)}</span></button>` };

/* ---------- contextos de reproducción ---------- */
A.ctx = {};
const setCtx = (k, list) => { A.ctx[k] = list.map(t => t.id); return list };
function albums() {
  const m = new Map(); for (const t of A.tracks) { const k = t.album || 'Sin álbum'; if (!m.has(k)) m.set(k, { name: k, artists: new Set(), items: [], added: 0 }); const g = m.get(k); g.items.push(t); g.artists.add(t.albumArtist || t.artist); g.added = Math.max(g.added, t.addedAt || 0) }
  return [...m.values()].map(g => { g.items.sort((a, b) => (a.track || 99) - (b.track || 99) || a.name.localeCompare(b.name)); g.artist = g.artists.size > 1 ? 'Varios artistas' : [...g.artists][0]; g.cv = g.items.find(t => t.cover) || g.items[0]; g.dur = g.items.reduce((a, t) => a + (t.dur || 0), 0); return g })
}
function artists() { const m = new Map(); for (const t of A.tracks) { if (!m.has(t.artist)) m.set(t.artist, []); m.get(t.artist).push(t) } return [...m.entries()].map(([name, items]) => ({ name, items, cv: items.find(t => t.cover) || items[0] })).sort((a, b) => a.name.localeCompare(b.name)) }
A.albums = albums; A.artists = artists;
const dailyMix = () => { const seed = +dkey(new Date()).replace(/-/g, ''); const top = A.topTracks(30).map(x => x.t); const rest = shuffled(A.tracks, seed); const mix = [...new Set([...shuffled(top, seed).slice(0, 12), ...rest])].slice(0, 30); return mix };
const unheard = () => { const out = []; for (const g of albums()) { const t = g.items.find(x => !A.STS.plays[x.id]); if (t) out.push(t) } return out };

/* ---------- filas ---------- */
const row = (t, ctx, num) => `<div class="li${t.id === P.cur ? ' on' : ''}" data-a="playin" data-id="${t.id}" data-ctx="${ctx}" role="button" tabindex="0">${num ? `<span class="muted" style="width:20px;text-align:center;font-weight:700">${num}</span>` : cov(t, 's48')}<div class="t"><b>${esc(t.name)}</b><span>${A.isFav(t.id) ? ms('favorite', 1) : ''}${esc(t.artist)}</span></div><span class="end">${fmt(t.dur)}</span><button class="ib" data-a="menu" data-id="${t.id}" data-ctx="${ctx}" aria-label="Opciones">${ms('more_vert')}</button></div>`;
const rows = (list, ctx, num) => { setCtx(ctx, list); return list.map((t, i) => row(t, ctx, num ? (t.track || i + 1) : 0)).join('') };
A.row = row; A.rows = rows;

/* ---------- INICIO ---------- */
function greet() { const h = new Date().getHours(); return h < 5 ? 'Buenas noches' : h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches' }
function deck() {
  const t = A.byId(P.cur) || A.byId(A.STS.recent[0]) || A.tracks[0]; if (!t) return '';
  const playing = P.cur && !P.au.paused;
  return `<section class="deck" id="deck"><div class="tt${playing ? ' spin' : ''}" id="tt" data-a="${P.cur ? 'openfp' : 'resume'}"><span class="pw"></span><span class="brand">AEFFY · TT-1</span>
   <div class="plat"><div class="vinyl"><div class="lab">${t.cover ? `<img src="${esc(t.cover)}" alt="" data-hi="${t.id}">` : ''}</div></div></div>
   <div class="arm"><svg viewBox="0 0 40 160"><circle cx="28" cy="14" r="11" fill="#c9ccd4"/><circle cx="28" cy="14" r="5" fill="#7d818b"/><path d="M28 18 L26 118 L14 140" stroke="#d9dce3" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="6" y="136" width="14" height="20" rx="3" fill="#b8bcc6" transform="rotate(30 13 146)"/></svg></div>
   <div class="slider"></div><div class="knob"></div><div class="dots"><i></i><i></i></div></div>
   <div class="info"><div><div class="lbl">${playing ? ms('equalizer') + 'Sonando ahora' : ms('more_horiz') + 'Continuar escuchando'}</div><h3>${esc(t.name)}</h3><div class="ar">${esc(t.artist)}</div><div class="lyr" id="deckLyr"></div></div>
   <button class="ck s56${playing ? ' on' : ''}" data-a="${P.cur ? 'toggle' : 'resume'}" data-id="${t.id}" aria-label="${playing ? 'Pausar' : 'Reproducir'}">${shp('cookie')}${ms(playing ? 'pause' : 'play_arrow', 1)}</button></div></section>`
}
function vInicio() {
  const T = A.tracks, al = albums(), today = A.STS.d[dkey(new Date())] || 0;
  const topA = A.topBy(Object.fromEntries(A.range('semana').length ? Object.entries(A.STS.a) : []), 1)[0];
  let h = top() + `<h1 class="h1">${greet()}</h1>`;
  h += T.length ? `<div class="sub">${ms('headphones')}${today ? 'Hoy llevas ' + fmtL(today) + (topA ? ' · Esta semana suena ' + esc(topA[0]) : '') : plural(T.length, 'canción', 'canciones') + ' · ' + plural(al.length, 'álbum', 'álbumes') + ' · ' + fmtL(T.reduce((a, t) => a + (t.dur || 0), 0)) + ' de música'}</div>`
    : `<div class="sub">${ms('headphones')}0 canciones · 0 álbumes · 0 min de música</div>`;
  h += A.noticeHtml ? A.noticeHtml() : '';
  h += A.installHtml ? A.installHtml() : '';
  h += '<div style="height:14px"></div>';
  if (!T.length) {
    h += `<section class="card c">${badge('album')}<h3>Tu tocadiscos te espera</h3><p>Agrega la carpeta donde tienes tu música y aquí sonará.</p><div class="row2" style="justify-content:center"><button class="btn t" data-a="import-dir">Agregar carpetas de música</button><button class="btn g" data-a="import">Elegir canciones</button></div></section>`;
    h += `<section class="card" style="margin-top:14px"><div class="carh"><div><h3>Lo último en tu biblioteca</h3><p>Toca un disco para ponerlo en el tocadiscos</p></div><div class="arrows"><button disabled>${ms('chevron_left')}</button><button disabled>${ms('chevron_right')}</button></div></div><div style="height:90px"></div></section>`;
  } else {
    h += deck();
    const rec = [...al].sort((a, b) => b.added - a.added).slice(0, 12);
    h += `<section class="card" style="margin-top:14px"><div class="carh"><div><h3>Lo último en tu biblioteca</h3><p>Toca un disco para ponerlo en el tocadiscos</p></div><div class="arrows"><button data-a="rail" data-d="-1" data-r="r1" aria-label="Anterior">${ms('chevron_left')}</button><button data-a="rail" data-d="1" data-r="r1" aria-label="Siguiente">${ms('chevron_right')}</button></div></div><div class="rail" id="r1">${rec.map(g => `<button class="tile" data-a="playalbum" data-k="${esc(g.name)}">${cov(g.cv)}<b>${esc(g.name)}</b><span>${esc(g.artist)}</span></button>`).join('')}</div></section>`;
    const un = setCtx('unheard', unheard());
    h += `<section class="card" style="margin-top:14px"><div class="carh"><div><h3>Aún sin escuchar</h3><p>Una canción de cada álbum que nunca escuchaste</p></div><div class="arrows">${un.length ? `<button data-a="playctx" data-ctx="unheard" data-shuf="1" data-from="Aún sin escuchar" aria-label="Aleatorio">${ms('shuffle')}</button><button data-a="playctx" data-ctx="unheard" data-from="Aún sin escuchar" style="background:var(--p);color:var(--onp)" aria-label="Reproducir">${ms('play_arrow', 1)}</button>` : ''}<button data-a="rail" data-d="-1" data-r="r2">${ms('chevron_left')}</button><button data-a="rail" data-d="1" data-r="r2">${ms('chevron_right')}</button></div></div>
     <div class="rail" id="r2">${un.length ? un.map(t => `<button class="tile" data-a="playin" data-id="${t.id}" data-ctx="unheard">${cov(t)}<b>${esc(t.name)}</b><span>${esc(t.artist)}</span></button>`).join('') : '<p class="muted small" style="padding:20px 0">Ya escuchaste algo de cada álbum.</p>'}</div></section>`;
  }
  setCtx('shuffle', shuffled(T)); setCtx('likes', T.filter(t => A.isFav(t.id))); setCtx('disc', shuffled(T.filter(t => !A.STS.plays[t.id]))); const dm = setCtx('daily', dailyMix());
  h += `<div class="sech"><h2>Hechas por aeffy</h2><p>Tus favoritas, tus mixes del día y lo nuevo para ti</p></div><div class="rail">${mixCard('aleatorio', 'Toda tu biblioteca', 'shuffle')}${mixCard('megusta', 'Marca canciones con el corazón', 'likes')}${mixCard('descubrimientos', 'Música nueva para ti', 'disc')}${mixCard('diario', 'Distinto cada día', 'daily')}</div>`;
  if (T.length) {
    h += `<section class="card" style="margin-top:18px">${dm.slice(0, 4).map(t => row(t, 'daily')).join('')}<button class="li" data-a="go" data-v="mix" style="margin-top:6px"><div class="t"><b>Ver todo el Mix diario</b></div><span class="ck s40">${shp('cookie')}${ms('arrow_forward')}</span></button></section>`;
    h += `<div class="sech carh"><div><h2>Tus álbumes</h2><p>${plural(al.length, 'álbum', 'álbumes')} en tu biblioteca</p></div><button class="btn g" data-a="go" data-v="biblioteca">Ver todos ${ms('chevron_right')}</button></div><div class="rail">${al.slice(0, 12).map(g => `<button class="tile" style="flex-basis:150px" data-a="go" data-v="album/${esc(encodeURIComponent(g.name))}">${cov(g.cv)}<b>${esc(g.name)}</b><span>${esc(g.artist)}</span></button>`).join('')}</div>`;
  }
  h += monthCard();
  return h
}
function badge(icon, cls = '') { return `<div class="badge ${cls}">${shp('sunny')}${ms(icon, 1)}</div>` }
A.badge = badge;
function monthCard() {
  const now = new Date(), p = dkey(now).slice(0, 7), mon = now.toLocaleDateString('es', { month: 'long' });
  const days = Object.keys(A.STS.d).filter(k => k.startsWith(p)), tot = A.sumDays(days);
  if (tot < 30) return `<section class="card c" style="margin-top:18px">${badge('bar_chart')}<h3>Tu mes, aquí</h3><p>Escucha un poco de música y aquí verás cuánto, qué y cuándo.</p></section>`;
  const wk = [0, 0, 0, 0, 0]; days.forEach(k => { wk[Math.min(4, Math.floor((+k.slice(8) - 1) / 7))] += A.STS.d[k] }); const mx = Math.max(...wk, 1), cw = Math.min(4, Math.floor((now.getDate() - 1) / 7));
  const plays = Object.values(A.STS.plays).reduce((a, b) => a + b, 0);
  return `<section class="card" style="margin-top:18px"><button class="carh" data-a="go" data-v="estadisticas" style="width:100%;text-align:left"><div style="display:flex;gap:12px;align-items:center">${badge('bar_chart', 'sm')}<div><h3>Tus estadísticas</h3><p>En lo que va de ${mon}</p></div></div><span class="ib t">${ms('arrow_forward')}</span></button>
   <div style="font-family:var(--hf);font-size:40px;font-weight:800;margin:14px 0 6px">${fmtL(tot)}</div>
   <div class="row2" style="gap:22px"><div><small class="muted">Reproducciones</small><div style="font-weight:800;font-size:18px">${plays}</div></div><div><small class="muted">Promedio diario</small><div style="font-weight:800;font-size:18px">${fmtL(tot / Math.max(1, now.getDate()))}</div></div><div><small class="muted">Racha</small><div style="font-weight:800;font-size:18px">${plural(A.streak().cur, 'día', 'días')}</div></div></div>
   <div class="chart">${wk.map((v, i) => `<div class="${i === cw ? 'on' : ''}">${v ? fmtL(v) : '–'}<i style="height:${Math.max(6, v / mx * 100)}%"></i>Semana ${i + 1}</div>`).join('')}</div></section>`
}

/* ---------- BUSCAR ---------- */
let q = '';
function vBuscar() {
  const ar = artists().slice(0, 12), recent = [...A.tracks].sort((a, b) => b.addedAt - a.addedAt);
  setCtx('recientes', recent); setCtx('daily', dailyMix());
  return top() + `<h1 class="h1">Buscar</h1><label class="search">${ms('search')}<input id="q" type="search" placeholder="Busca canciones, artistas o álbumes" value="${esc(q)}" autocomplete="off" aria-label="Buscar"></label><div id="sres">${searchRes()}</div>`
}
function searchRes() {
  const s = q.trim().toLowerCase();
  if (!s) { const ar = artists().slice(0, 12); const d = A.tracks[0]; return (ar.length ? `<div class="sech"><h2>Tus artistas</h2></div><div class="artists">${ar.map(a => `<button data-a="go" data-v="artista/${esc(encodeURIComponent(a.name))}">${cov(a.cv, 'round')}<b>${esc(a.name)}</b></button>`).join('')}</div>` : '') + `<div class="sech"><h2>Explorar todo</h2></div><div class="explore"><button class="ex" style="background:#2f7fb8" data-a="go" data-v="mix">Mix diario${d ? cov(d) : ''}</button><button class="ex" style="background:#8a2fc0" data-a="go" data-v="recientes">Agregados recientemente${d ? cov(A.ctx.recientes ? A.byId(A.ctx.recientes[0]) : d) : ''}</button><button class="ex" style="background:#c0397a" data-a="go" data-v="megusta">Tus me gusta</button><button class="ex" style="background:#2b8a57" data-a="go" data-v="estadisticas">Lo más escuchado</button></div>` }
  const T = A.tracks.filter(t => (t.name + ' ' + t.artist + ' ' + t.album).toLowerCase().includes(s)).slice(0, 60);
  const ar = artists().filter(a => a.name.toLowerCase().includes(s)).slice(0, 8), al = albums().filter(a => a.name.toLowerCase().includes(s)).slice(0, 8);
  if (!T.length && !ar.length && !al.length) return `<p class="muted" style="padding:20px 4px">Nada con “${esc(q)}” en tu biblioteca.</p>`;
  return (ar.length ? `<div class="sech"><h2>Artistas</h2></div><div class="artists">${ar.map(a => `<button data-a="go" data-v="artista/${esc(encodeURIComponent(a.name))}">${cov(a.cv, 'round')}<b>${esc(a.name)}</b></button>`).join('')}</div>` : '') +
    (al.length ? `<div class="sech"><h2>Álbumes</h2></div><div class="rail">${al.map(g => `<button class="tile" data-a="go" data-v="album/${esc(encodeURIComponent(g.name))}">${cov(g.cv)}<b>${esc(g.name)}</b><span>${esc(g.artist)}</span></button>`).join('')}</div>` : '') +
    (T.length ? `<div class="sech"><h2>Canciones</h2></div>${rows(T, 'search')}` : '')
}

/* ---------- BIBLIOTECA ---------- */
let libTab = '', libGrid = false;
function vBiblioteca() {
  const al = albums(), ar = artists(), likes = A.tracks.filter(t => A.isFav(t.id));
  let items = [];
  if (libTab !== 'albumes' && libTab !== 'artistas') {
    items.push(`<button class="li" data-a="go" data-v="megusta"><div class="ph like">${ms('favorite', 1)}</div><div class="t"><b>Tus me gusta</b><span>${ms('push_pin', 1)}${plural(likes.length, 'canción', 'canciones')}</span></div></button>`);
    items.push(`<button class="li" data-a="go" data-v="todas"><div class="ph pc">${ms('music_note', 1)}</div><div class="t"><b>Todas tus canciones</b><span>${ms('push_pin', 1)}${plural(A.tracks.length, 'canción', 'canciones')}</span></div></button>`);
    const folders = new Set(A.tracks.map(t => (t.folder || '').split('/')[0]).filter(Boolean));
    items.push(`<button class="li" data-a="go" data-v="carpetas"><div class="ph">${ms('folder', 1)}</div><div class="t"><b>Carpetas</b><span>${plural(folders.size, 'carpeta', 'carpetas')}</span></div></button>`);
    A.LISTS.forEach(l => { const it = l.ids.map(A.byId).filter(Boolean); items.push(`<button class="li" data-a="go" data-v="lista/${l.id}">${l.cover ? cov(l, 's48') : it.length ? cov(it.find(t => t.cover) || it[0], 's48') : `<div class="ph">${ms('queue_music')}</div>`}<div class="t"><b>${esc(l.name)}</b><span>Playlist · ${plural(it.length, 'canción', 'canciones')}</span></div></button>`) })
  }
  if (libTab === 'playlists') items = items.slice(0, 3).concat(items.slice(3));
  if (!libTab || libTab === 'albumes') al.sort((a, b) => b.added - a.added).forEach(g => items.push(`<button class="li" data-a="go" data-v="album/${esc(encodeURIComponent(g.name))}">${cov(g.cv, 's48')}<div class="t"><b>${esc(g.name)}</b><span>Álbum · ${esc(g.artist)}</span></div></button>`));
  if (!libTab || libTab === 'artistas') ar.forEach(a => items.push(`<button class="li" data-a="go" data-v="artista/${esc(encodeURIComponent(a.name))}">${cov(a.cv, 's48 round')}<div class="t"><b>${esc(a.name)}</b><span>Artista</span></div></button>`));
  const chip = (k, n) => `<button class="chip${libTab === k ? ' on' : ''}" data-a="libtab" data-v="${k}">${libTab === k ? ms('check') : ''}${n}</button>`;
  return top() + `<div class="carh" style="align-items:center"><h1 class="h1">Biblioteca</h1><div class="row2"><button class="ib" data-a="import" aria-label="Agregar canciones">${ms('note_add')}</button><button class="ib" data-a="import-dir" aria-label="Agregar carpeta">${ms('create_new_folder')}</button></div></div>
   <div class="chips">${chip('playlists', 'Playlists')}${chip('albumes', 'Álbumes')}${chip('artistas', 'Artistas')}</div>
   <div class="carh" style="margin:14px 0 4px;align-items:center"><span class="sub">${ms('sort')}Recientes</span><button class="ib" data-a="newlist" aria-label="Nueva playlist">${ms('add')}</button></div>
   ${A.tracks.length || A.LISTS.length ? items.join('') : `<section class="card c">${badge('library_music')}<h3>Tu biblioteca está vacía</h3><p>Agrega canciones o una carpeta entera.</p><div class="row2" style="justify-content:center"><button class="btn" data-a="import-dir">${ms('folder')}Carpeta</button><button class="btn t" data-a="import">${ms('description')}Archivos</button></div></section>`}`
}
function listPage(title, kind, list, ctx, sub, cvT, extra) {
  const tot = list.reduce((a, t) => a + (t.dur || 0), 0); setCtx(ctx, list);
  return top({ back: 1 }) + `<div style="text-align:center;margin-top:6px"><div style="width:min(240px,62vw);margin:0 auto">${cvT ? cov(cvT, 'hi') : `<div class="cov" style="border-radius:20px;background:linear-gradient(140deg,var(--pcl),var(--pc))">${ms(kind === 'Me gusta' ? 'favorite' : 'queue_music', 1)}</div>`}</div></div>
   <div class="label" style="margin-top:18px;color:var(--mute)">${esc(kind)}</div><h1 class="h1" style="font-size:30px">${esc(title)}</h1><div class="sub">${esc(sub || '')}${list.length ? ' · ' + plural(list.length, 'canción', 'canciones') + ' · ' + fmtL(tot) : ''}</div>
   <div class="carh" style="align-items:center;margin:14px 0"><div class="row2">${extra || ''}<button class="ib" data-a="ctxmenu" data-ctx="${ctx}" aria-label="Más">${ms('more_horiz')}</button></div><div class="row2" style="align-items:center"><button class="ib" data-a="playctx" data-ctx="${ctx}" data-shuf="1" data-from="${esc(title)}" aria-label="Aleatorio">${ms('shuffle')}</button><button class="ck s56" data-a="playctx" data-ctx="${ctx}" data-from="${esc(title)}" aria-label="Reproducir">${shp('cookie')}${ms('play_arrow', 1)}</button></div></div>
   ${list.length ? rows(list, ctx, kind === 'Álbum') : `<p class="muted">Todavía no hay canciones aquí.</p>`}`
}
function vAlbum(name) { const g = albums().find(a => a.name === name); if (!g) return notFound(); const r = A.ALRATE[g.name]; return listPage(g.name, 'Álbum', g.items, 'album', g.artist + (g.items[0].year ? ' · ' + g.items[0].year : ''), g.cv, `<button class="ib" data-a="ratealbum" data-k="${esc(g.name)}" aria-label="Calificar álbum">${ms('stars', !!r)}</button>`) }
function vArtista(name) { const a = artists().find(x => x.name === name); if (!a) return notFound(); const it = [...a.items].sort((x, y) => (A.STS.t[y.id] || 0) - (A.STS.t[x.id] || 0)); return listPage(a.name, 'Artista', it, 'artist', fmtL(A.STS.a[a.name] || 0) + ' escuchado', a.cv) }
function vLista(id) { const l = A.LISTS.find(x => x.id === id); if (!l) return notFound(); const it = l.ids.map(A.byId).filter(Boolean); return listPage(l.name, 'Playlist', it, 'plist', l.desc || '', l.cover ? { cover: l.cover, hue: l.hue } : it.find(t => t.cover), `<button class="ib" data-a="editlist" data-id="${l.id}" aria-label="Editar">${ms('edit')}</button>`) }
function vCarpetas() { const m = {}; A.tracks.forEach(t => { const k = t.folder || 'Archivos sueltos'; (m[k] = m[k] || []).push(t) }); return top({ back: 1 }) + `<h1 class="h1">Carpetas</h1>` + (Object.keys(m).length ? Object.entries(m).sort().map(([k, v]) => { setCtx('f:' + k, v); return `<button class="li" data-a="playctx" data-ctx="f:${esc(k)}" data-from="${esc(k)}"><div class="ph">${ms('folder', 1)}</div><div class="t"><b>${esc(k.split('/').pop())}</b><span>${esc(k)} · ${plural(v.length, 'canción', 'canciones')}</span></div>${ms('play_arrow')}</button>` }).join('') : '<p class="muted">Agrega una carpeta desde Biblioteca.</p>') }
const notFound = () => top({ back: 1 }) + `<section class="card c">${badge('search_off')}<h3>No está</h3><p>Puede que la hayas quitado de tu biblioteca.</p></section>`;

/* ---------- SPOTS ---------- */
function vSpots() {
  return top() + `<h1 class="h1">Spots</h1><div class="sub">Escuchen lo mismo, al mismo tiempo, cada quien en su casa</div>
  <section class="card" style="margin-top:16px;background:linear-gradient(160deg,var(--pcl),var(--pc));color:var(--onpc)"><div class="label" style="color:inherit">${ms('podcasts')}Spot</div><h2 style="font-size:28px;margin:8px 0 4px">Spot de ${esc(A.me?.display_name || 'Anfitrión')}</h2><p style="opacity:.85;margin:0 0 14px">${A.isPremium() ? 'Hasta 12 personas, sin límite de tiempo' : 'Hasta 4 personas · 1 h al día'}</p><button class="btn" data-a="spot-create">${ms('add')}Crear Spot</button></section>
  <div class="sech"><h2>Cómo funciona</h2></div>
  <div class="sgrp">${[['link', 'Comparte tu enlace', 'Tus amigos entran desde el navegador o desde aeffy.'], ['how_to_vote', 'Voten lo que suena', 'Lancen una votación y cada quien califica la canción.'], ['group', 'Quién puede entrar', 'Abierto a amigos, con tu permiso o solo con invitación.']].map(([i, b, s]) => `<div class="si"><span class="ic">${ms(i)}</span><span class="t"><b>${b}</b><span>${s}</span></span></div>`).join('')}</div>
  <div class="sech"><h2>Spots de tus amigos</h2><p>Cuando un amigo abra un Spot, aparecerá aquí.</p></div>`
}

/* ---------- cajón lateral ---------- */
function drawer() {
  const me = A.me; const d = $('#drawer');
  d.innerHTML = `<div class="bk" data-a="closedrawer"></div><nav aria-label="Menú">
   <button class="who" data-a="dgo" data-v="${me ? 'perfil' : 'cuenta'}"><span class="avatar">${shp('cookie')}${me ? `${A.avImg()}` : ms('person')}</span><span><b>${me ? esc(me.display_name || 'Tu perfil') : 'Sin cuenta'}</b><span>${me ? (me.handle ? '@' + esc(me.handle) : 'Ver perfil') : 'Ver perfil'}</span></span></button>
   ${[['auto_awesome', 'aeffy Premium', 'premium'], ['bar_chart', 'Estadísticas', 'estadisticas'], ['leaderboard', 'Calificaciones', 'calificaciones'], ['group', 'Amigos', 'amigos'], ['chat', 'Mensajes' + (A.unreadTotal && A.unreadTotal() ? ' (' + A.unreadTotal() + ')' : ''), 'mensajes'], ['redeem', 'Invita y gana', 'invita'], ['handyman', 'Herramientas', 'herramientas'], ['settings', 'Configuración y privacidad', 'ajustes']].map(([i, n, v]) => `<button class="mi" data-a="dgo" data-v="${v}">${ms(i)}${n}</button>`).join('')}
   ${A.isAdmin ? `<button class="mi" data-a="admin">${ms('admin_panel_settings')}Panel de administradora</button>` : ''}
   <div class="fr"><b style="font-family:var(--hf);font-size:16px">Tus amigos ahora</b><p class="muted small" style="margin:6px 0 0">Cuando tus amigos escuchen algo, aparecerá aquí.</p></div></nav>`;
  d.classList.add('open'); A.pushLayer(() => d.classList.remove('open')); A.paintDrawerFriends && A.paintDrawerFriends(); A.loadFriends && A.loadFriends()
}
on('drawer', drawer);
on('closedrawer', () => A.popLayer());
on('dgo', el => { $('#drawer').classList.remove('open'); layers.pop(); history.replaceState(history.state, '', location.hash); A.go(el.dataset.v) });

/* ---------- render ---------- */
A.views = { inicio: vInicio, buscar: vBuscar, biblioteca: vBiblioteca, spots: vSpots, album: vAlbum, artista: vArtista, lista: vLista, carpetas: vCarpetas,
  megusta: () => listPage('Tus me gusta', 'Me gusta', A.tracks.filter(t => A.isFav(t.id)), 'likes', 'Tus favoritas'),
  todas: () => listPage('Todas tus canciones', 'Playlist', [...A.tracks].sort((a, b) => a.name.localeCompare(b.name)), 'all', 'Toda tu biblioteca'),
  mix: () => listPage('Mix diario', 'Hecha por aeffy', dailyMix(), 'daily', 'Cambia cada día', dailyMix()[0]),
  recientes: () => listPage('Agregados recientemente', 'Hecha por aeffy', [...A.tracks].sort((a, b) => b.addedAt - a.addedAt).slice(0, 50), 'recientes', 'Lo último que agregaste')
};
A.render = () => {
  const { v, arg } = A.route(); if (TABS.includes(v)) lastTab = v;
  const f = A.views[v] || vInicio; $('#page').innerHTML = f(arg);
  $$('#bnav button').forEach(b => b.classList.toggle('on', b.dataset.v === (TABS.includes(v) ? v : lastTab)));
  A.paintMini(); A.afterRender && A.afterRender(v); A.upgradeCovers()
};

/* ---------- mini reproductor ---------- */
A.paintMini = () => {
  const t = A.byId(P.cur), m = $('#mini'), playing = P.cur && !P.au.paused;
  m.innerHTML = `${t ? cov(t) : `<div class="cov" style="width:48px;border-radius:12px;background:rgba(0,0,0,.2)">${ms('music_note')}</div>`}<div class="t"><b>${t ? esc(t.name) : 'Nada sonando'}</b><span>${t ? esc(t.artist) : 'Elige una canción de tu biblioteca'}</span></div>
   <button class="ring" data-a="toggle" aria-label="${playing ? 'Pausar' : 'Reproducir'}"><svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" id="mring" stroke-dasharray="132" stroke-dashoffset="132"/></svg>${ms(playing ? 'pause' : 'play_arrow', 1)}</button><button class="ib" data-a="next" aria-label="Siguiente">${ms('skip_next', 1)}</button>`;
  m.dataset.a = t ? 'openfp' : 'noop'
};
A.updProg = c => { const d = P.au.duration || 0, r = $('#mring'); if (r) r.setAttribute('stroke-dashoffset', 132 - (d ? c / d : 0) * 132) };

/* ---------- reproductor completo ---------- */
let fpMode = '';
function fpHtml() {
  const t = A.byId(P.cur); if (!t) return '';
  const r = (A.META[t.id] && A.META[t.id].rating) || 0, playing = !P.au.paused;
  return `<div class="in"><div class="fph"><button class="ib" data-a="closefp" aria-label="Cerrar">${ms('keyboard_arrow_down')}</button><div class="c"><small>Reproduciendo desde${P.from.startsWith('Álbum') ? ' álbum' : ''}:</small><b>${esc(P.from.replace(/^Álbum · /, ''))}</b></div><button class="ib" data-a="menu" data-id="${t.id}" aria-label="Opciones">${ms('more_horiz')}</button></div>
  <div class="compact">${cov(t)}<div class="t"><b>${esc(t.name)}</b><span>${esc(t.artist)}</span><span class="proc">Procesado</span></div><button class="ib trbtn${A.ST.showTr ? ' on' : ''}" data-a="trly" aria-label="Traducir letra">${ms('translate')}</button><button class="ib" data-a="prev">${ms('skip_previous', 1)}</button><button class="ck s40${playing ? ' on' : ''}" data-a="toggle">${shp('cookie')}${ms(playing ? 'pause' : 'play_arrow', 1)}</button><button class="ib" data-a="next">${ms('skip_next', 1)}</button></div>
  <div class="stage"><div class="bigcov">${cov(t, 'hi')}</div><div class="ly" id="ly"></div><div class="qv" id="qv"></div>
   <div class="meta"><div><h2>${esc(t.name)}</h2><p>${esc(t.artist)}</p></div><div class="side2"><button class="ib" data-a="fav" data-id="${t.id}" aria-label="Me gusta">${ms('favorite', A.isFav(t.id))}</button><button class="ib" data-a="enqueue-menu" data-id="${t.id}" aria-label="Agregar a playlist">${ms('playlist_add')}</button></div></div>
   <div class="prog"><div class="wave" id="wave" role="slider" aria-label="Posición" tabindex="0"><svg id="wsvg"></svg><span class="th" id="wth"></span></div><div class="times"><span id="tc">0:00</span><span class="fmt">${ms('graphic_eq')}${esc([t.ext, t.bits ? t.bits + '-bit' : '', t.sr ? (t.sr / 1000).toFixed(1).replace('.0', '') + ' kHz' : ''].filter(Boolean).join(' · ') || 'Local')}</span><span id="td">${fmt(t.dur)}</span></div></div>
   <div class="tp"><button class="ib${P.shuffle ? ' on' : ''}" data-a="shuffle" aria-label="Aleatorio">${ms('shuffle')}</button><button class="ib" data-a="prev" aria-label="Anterior">${ms('skip_previous', 1)}</button><button class="ck s80${playing ? ' on' : ''}" data-a="toggle" id="fpPlay" aria-label="Reproducir o pausar">${shp('cookie')}${ms(playing ? 'pause' : 'play_arrow', 1)}</button><button class="ib" data-a="next" aria-label="Siguiente">${ms('skip_next', 1)}</button><button class="ib${P.repeat ? ' on' : ''}${P.repeat === 2 ? ' rep1' : ''}" data-a="repeat" aria-label="Repetir">${ms(P.repeat === 2 ? 'repeat_one' : 'repeat')}</button></div></div>
  <div class="tbar"><button data-a="recast" aria-label="Dispositivos">${ms('devices')}</button><button data-a="rate" data-id="${t.id}" class="${r ? 'on' : ''}" aria-label="Calificar">${ms('filter_vintage', !!r)}${r ? r : ''}</button><button data-a="fpmode" data-v="lyrics" class="${fpMode === 'lyrics' ? 'on' : ''}" aria-label="Letra">${ms('lyrics')}</button><button data-a="fpmode" data-v="queue" class="${fpMode === 'queue' ? 'on' : ''}" aria-label="Cola">${ms('format_list_bulleted')}</button></div></div>`
}
A.paintFp = () => { const f = $('#fp'); if (!f.classList.contains('open')) return; f.innerHTML = fpHtml(); f.className = 'fp open' + (fpMode ? ' panel ' + fpMode : ''); A.upgradeCovers(f); if (fpMode === 'lyrics') buildLyrics(); if (fpMode === 'queue') buildQueue(); drawWave() };
A.openFp = () => { if (!P.cur) return; const f = $('#fp'); f.classList.add('open'); A.paintFp(); A.pushLayer(() => { f.classList.remove('open') }) };
on('openfp', A.openFp); on('closefp', () => A.popLayer());
on('fpmode', el => { fpMode = fpMode === el.dataset.v ? '' : el.dataset.v; A.paintFp() });
function drawWave() {
  const w = $('#wave'); if (!w) return; const W = w.clientWidth || 300, d = P.au.duration || 0, c = P.au.currentTime || 0, x = d ? c / d * W : 0;
  let path = ''; const amp = P.au.paused ? 0 : 3.2; for (let i = 0; i <= x; i += 3) path += (i ? 'L' : 'M') + i.toFixed(1) + ' ' + (12 + Math.sin(i / 4 + performance.now() / 260) * amp).toFixed(1);
  $('#wsvg').innerHTML = `<path class="tr" d="M${Math.min(W, x + 8)} 12 L${W} 12"/>${path ? `<path class="done" d="${path}"/>` : ''}`; $('#wth').style.left = x + 'px'; $('#tc').textContent = fmt(c); $('#td').textContent = fmt(d)
}
(function waveLoop() { if ($('#fp').classList.contains('open') && !fpMode) drawWave(); requestAnimationFrame(waveLoop) })();
function seekFrom(e) { const w = $('#wave'); const r = w.getBoundingClientRect(); const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); if (P.au.duration) P.au.currentTime = x * P.au.duration }
document.addEventListener('pointerdown', e => { if (e.target.closest('#wave')) { seekFrom(e); const mv = ev => seekFrom(ev); const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up) }; addEventListener('pointermove', mv); addEventListener('pointerup', up) } });
document.addEventListener('keydown', e => { if (e.target.id === 'wave') { if (e.key === 'ArrowRight') P.au.currentTime += 5; if (e.key === 'ArrowLeft') P.au.currentTime -= 5 } });

/* letras */
let LY = [], lyI = -1;
function buildLyrics() {
  const t = A.byId(P.cur), el = $('#ly'); if (!t || !el) return; const src = A.lyricsOf(t); LY = A.parseLRC(src); lyI = -1;
  const TR = A.ST.showTr ? ((A.META[t.id] || {}).tr || {})[A.trLang ? A.trLang() : 'es'] : null;
  if (LY.length) { el.classList.remove('plain'); el.innerHTML = LY.map((l, i) => `<p data-a="lyseek" data-i="${i}">${A.ST.karaoke && A.can('karaoke') ? (l.x || '·').split(' ').map(w => `<span class="w">${esc(w)}</span>`).join(' ') : esc(l.x || '·')}${TR && TR[i] ? `<small class="tr">${esc(TR[i])}</small>` : ''}</p>`).join(''); syncLyrics(P.au.currentTime) }
  else if (src.trim()) { el.classList.add('plain'); el.innerHTML = src.split(/\r?\n/).map((l, i) => `<p>${esc(l) || '&nbsp;'}${TR && TR[i] ? `<small class="tr">${esc(TR[i])}</small>` : ''}</p>`).join('') }
  else { el.innerHTML = `<p class="empty">Buscando la letra…</p>`; A.fetchLyrics(t, true).then(txt => { if (P.cur === t.id && fpMode === 'lyrics') { if (txt) buildLyrics(); else el.innerHTML = `<p class="empty">No encontré la letra de esta canción.<br><br><button class="btn t" data-a="editly" data-id="${t.id}">${ms('edit')}Agregar letra</button></p>` } }) }
}
function syncLyrics(c) {
  if (!LY.length) return; let i = -1; for (let k = 0; k < LY.length; k++) { if (LY[k].t <= c + .2) i = k; else break }
  const ps = $$('#ly p[data-i]');
  const kara = A.ST.karaoke && A.can('karaoke'), lyEl = $('#ly'); if (lyEl) lyEl.classList.toggle('kara', !!kara);
  if (kara && i >= 0 && ps[i]) {
    /* relleno suave letra por letra, como Sosu: avanza al ritmo de la línea con un borde difuminado */
    const st = LY[i].t, nx = (LY[i + 1] || { t: st + 6 }).t, ws = ps[i]._ws || (ps[i]._ws = $$('.w', ps[i])), tot = ws.reduce((a, w) => a + w.textContent.length + 1, 0) || 1;
    const dur = Math.max(.8, Math.min((nx - st) * .94 - .1, tot * .2 + 1.2)), f = Math.max(0, Math.min(1, (c - st) / dur)) * tot;
    let acc = 0; for (const w of ws) { const n = w.textContent.length + 1, pr = Math.max(0, Math.min(1, (f - acc) / n)); acc += n; const v = (pr * 112 - 6).toFixed(1) + '%'; if (w._v !== v) { w._v = v; w.style.setProperty('--p', v) } }
  }
  if (i === lyI) return; lyI = i; ps.forEach((p, k) => p.classList.toggle('on', k === i));
  if (i >= 0 && ps[i]) { const el = $('#ly'); el.scrollTo({ top: ps[i].offsetTop - el.clientHeight / 2.6, behavior: 'smooth' }) }
}
(function kloop() { try { if (fpMode === 'lyrics' && P.cur && !P.au.paused && !document.hidden && A.ST.karaoke) syncLyrics(P.au.currentTime) } catch (e) { } requestAnimationFrame(kloop) })();
function deckLyric(c) { const d = $('#deckLyr'); if (!d) return; const t = A.byId(P.cur); if (!t) return; const L = t._ly && t._lysrc === A.lyricsOf(t) ? t._ly : (t._lysrc = A.lyricsOf(t), t._ly = A.parseLRC(t._lysrc)); let x = ''; for (const l of L) { if (l.t <= c + .2) x = l.x; else break } d.textContent = x }
on('trly', async () => { const t = A.byId(P.cur); if (!t) return; if (A.ST.showTr) { A.ST.showTr = false; A.saveSet(); A.paintFp(); return } if (!A.lyricsOf(t)) { toast('Esta canción no tiene letra todavía'); return } const r = await A.translateLyrics(t); if (r) { A.ST.showTr = true; A.saveSet(); A.paintFp() } });
on('lyseek', el => { const l = LY[+el.dataset.i]; if (l) P.au.currentTime = l.t });
A.onLyrics = t => { if (t.id === P.cur && fpMode === 'lyrics') buildLyrics() };
function buildQueue() { const el = $('#qv'); if (!el) return; setCtx('queue', P.queue.map(A.byId).filter(Boolean)); el.innerHTML = `<div class="qh"><h3>A continuación</h3><button class="btn g" data-a="shufq">${ms('shuffle')}Mezclar todo</button></div><p class="muted small" style="margin:0 0 8px">${plural(Math.max(0, P.queue.length - P.qi - 1), 'canción', 'canciones')} en cola</p>` + P.queue.slice(P.qi).map(id => { const t = A.byId(id); return t ? row(t, 'queue') : '' }).join('') }
on('shufq', () => { P.queue = [...P.queue.slice(0, P.qi + 1), ...shuffled(P.queue.slice(P.qi + 1))]; buildQueue() });

A.onTime = c => { A.updProg(c); if (fpMode === 'lyrics') syncLyrics(c); deckLyric(c) };
A.onPlayState = () => { A.paintMini(); const playing = !P.au.paused; $$('.ck[data-a="toggle"],.ck[data-a="resume"]').forEach(b => { b.classList.toggle('on', playing); const i = b.querySelector('.ms'); if (i) i.textContent = playing ? 'pause' : 'play_arrow' }); const tt = $('#tt'); if (tt) tt.classList.toggle('spin', playing); const lb = $('#deck .lbl'); if (lb) lb.innerHTML = playing ? ms('equalizer') + 'Sonando ahora' : ms('more_horiz') + 'Continuar escuchando' };
A.onTrack = () => { A.paintMini(); A.paintFp(); const { v } = A.route(); if (v === 'inicio') { const d = $('#deck'); if (d) { d.outerHTML = deck(); A.upgradeCovers() } } $$('.li[data-id]').forEach(r => r.classList.toggle('on', r.dataset.id === P.cur)) };

/* ---------- hojas ---------- */
A.sheet = (html, opts = {}) => {
  const s = document.createElement('div'); s.className = 'scrim'; s.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${opts.head === false ? '<div class="grab"></div>' : ''}${html}</div>`; document.body.appendChild(s);
  requestAnimationFrame(() => s.classList.add('open'));
  const close = () => { s.classList.remove('open'); setTimeout(() => s.remove(), 250) };
  s.addEventListener('click', e => { if (e.target === s) A.popLayer() });
  /* deslizar hacia abajo para cerrar */
  const sh = s.querySelector('.sheet'); let y0 = null, dy = 0, fromTop = false;
  sh.addEventListener('touchstart', e => { const t = e.target; fromTop = !!t.closest('.grab,.shead,.shtrack'); if (!fromTop && sh.scrollTop > 0) { y0 = null; return } if (t.closest('input,textarea,select,button,label,.rate,[type=range]') && !t.closest('.grab')) { y0 = null; return } y0 = e.touches[0].clientY; dy = 0 }, { passive: true });
  sh.addEventListener('touchmove', e => { if (y0 === null) return; dy = e.touches[0].clientY - y0; if (dy < 12 || (!fromTop && sh.scrollTop > 0)) { if (dy <= 0) { dy = 0; sh.style.transform = '' } return } e.preventDefault(); sh.classList.add('drag'); sh.style.transform = `translateY(${dy}px)`; s.style.opacity = Math.max(.3, 1 - dy / 500) }, { passive: false });
  sh.addEventListener('touchend', () => { if (y0 === null) return; y0 = null; sh.classList.remove('drag'); if (dy < 12) { sh.style.transform = ''; s.style.opacity = ''; dy = 0; return } if (dy > 90) { sh.style.transform = 'translateY(100%)'; A.popLayer() } else { sh.style.transform = ''; s.style.opacity = '' } dy = 0 });
  A.pushLayer(close); const f = s.querySelector('input,textarea'); if (f) setTimeout(() => f.focus(), 200); return s
};
A.closeSheet = () => A.popLayer();
A.shead = (icon, title, sub) => `<div class="grab"></div><div class="shead"><div class="pix"></div><span class="lg">${A.logo(34, 'var(--on)', 'var(--bg)')}</span><button class="ib x" data-a="closesheet" aria-label="Cerrar">${ms('close')}</button><div class="ico">${ms(icon, 1)}</div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>`;
on('closesheet', () => A.popLayer());

function menu(id, ctx) {
  const t = A.byId(id); if (!t) return; const r = (A.META[id] && A.META[id].rating) || 0, fav = A.isFav(id);
  A.sheet(`<div class="grab"></div><div class="shtrack">${cov(t)}<div><b>${esc(t.name)}</b><span>${esc(t.artist)} · ${esc(t.album)}</span></div></div>
  <button class="mi" data-a="share" data-id="${id}">${ms('share')}Compartir</button>
  <button class="mi" data-a="playnext" data-id="${id}">${ms('playlist_play')}Reproducir a continuación</button>
  <button class="mi" data-a="enqueue" data-id="${id}">${ms('queue_music')}Agregar a la cola</button>
  <button class="mi" data-a="addto" data-id="${id}">${ms('playlist_add')}Agregar a una playlist</button>
  ${ctx === 'plist' ? `<button class="mi" data-a="rmfrom" data-id="${id}">${ms('playlist_remove')}Quitar de esta playlist</button>` : ''}
  <button class="mi" data-a="fav" data-id="${id}" data-close="1">${ms('favorite', fav)}${fav ? 'Quitar de Me gusta' : 'Agregar a Me gusta'}</button>
  <button class="mi" data-a="rate" data-id="${id}">${ms('filter_vintage')}Calificar canción<span class="end">${r || ''}</span></button>
  <button class="mi" data-a="goalbum" data-id="${id}">${ms('album')}Ir al álbum</button>
  <button class="mi" data-a="goartist" data-id="${id}">${ms('person')}Ir al artista</button>
  <button class="mi" data-a="edittags" data-id="${id}">${ms('edit_note')}Editar etiquetas y letra</button>
  <button class="mi" data-a="info" data-id="${id}">${ms('info')}Información de la pista</button>
  <button class="mi bad" data-a="delask" data-id="${id}">${ms('delete')}Eliminar de la biblioteca</button>`, { head: false })
}
on('menu', el => menu(el.dataset.id, el.dataset.ctx));
on('enqueue-menu', el => addTo(el.dataset.id));
on('share', async el => { const t = A.byId(el.dataset.id); const txt = `Estoy escuchando ${t.name} de ${t.artist} en aeffy`; try { if (navigator.share) await navigator.share({ text: txt, url: location.origin }); else { await navigator.clipboard.writeText(txt + ' ' + location.origin); toast('Copiado para compartir') } } catch (e) { } });
on('playnext', el => { const id = el.dataset.id; A.popLayer(); if (!P.cur) A.playList([id], 0); else P.queue.splice(P.qi + 1, 0, id); toast('Sonará a continuación') });
on('enqueue', el => { const id = el.dataset.id; A.popLayer(); if (!P.cur) A.playList([id], 0); else P.queue.push(id); toast('Agregada a la cola') });
function addTo(id) { setTimeout(() => A.sheet(A.shead('playlist_add', 'Agregar a una playlist') + A.LISTS.map(l => `<button class="mi" data-a="addtolist" data-id="${id}" data-l="${l.id}">${ms('queue_music')}${esc(l.name)}<span class="end">${l.ids.length}</span></button>`).join('') + `<button class="mi" data-a="newlist" data-id="${id}">${ms('add')}Nueva playlist</button>`), layers.length ? 260 : 0); if (layers.length) A.popLayer() }
on('addto', el => addTo(el.dataset.id));
on('addtolist', el => { const l = A.LISTS.find(x => x.id === el.dataset.l); if (l && !l.ids.includes(el.dataset.id)) l.ids.push(el.dataset.id); A.saveLists(); A.popLayer(); toast('Agregada a “' + l.name + '”') });
function listForm(l, id) {
  let pic = l && l.cover ? { cover: l.cover, hue: l.hue, sat: l.sat } : null;
  const prev = () => pic ? `<img src="${esc(pic.cover)}" alt="">` : ms('queue_music', 1);
  const s = A.sheet(A.shead('queue_music', l ? 'Editar playlist' : 'Nueva playlist') + `<form id="lf"><div class="plcov"><div class="cov" id="lfc">${prev()}</div><div style="display:grid;gap:6px;justify-items:start"><button type="button" class="btn t" id="lfp">${ms('add_photo_alternate')}Elegir portada</button><button type="button" class="btn g" id="lfx" style="${pic ? '' : 'display:none'}">Quitar portada</button></div><input type="file" id="lff" accept="image/*" hidden></div><label class="fld"><small>Nombre de la playlist</small><input id="lfn" maxlength="60" required value="${esc(l ? l.name : (id ? A.byId(id).artist + ' Mix' : ''))}"></label><label class="fld"><input id="lfd" maxlength="160" placeholder="Descripción (opcional)" value="${esc(l?.desc || '')}"></label><label class="si" style="padding:6px 4px;min-height:0"><span class="t"><b>Mostrarla en mi perfil</b><span>Tus amigos podrán verla y escuchar las canciones que también tengan.</span></span><input type="checkbox" id="lfs" class="ck2" ${l && l.share === false ? '' : 'checked'}></label><div class="foot">${l ? `<button type="button" class="btn d" data-a="dellist" data-id="${l.id}">Borrar</button>` : `<button type="button" class="btn t" data-a="closesheet">Cancelar</button>`}<button class="btn">${l ? 'Guardar' : 'Crear'}</button></div></form>`);
  const f = $('#lff', s);
  $('#lfp', s).onclick = () => { f.value = ''; f.click() };
  f.onchange = async () => { const file = f.files[0]; if (!file) return; try { const r = await A.shrinkCover(file); pic = { cover: r.url, hue: r.hue, sat: r.sat }; $('#lfc', s).innerHTML = prev(); $('#lfx', s).style.display = '' } catch (e) { toast('No pude abrir esa imagen') } };
  $('#lfx', s).onclick = () => { pic = null; $('#lfc', s).innerHTML = prev(); $('#lfx', s).style.display = 'none' };
  $('#lf', s).addEventListener('submit', e => { e.preventDefault(); const n = $('#lfn', s).value.trim(); if (!n) return; const cv = pic ? { cover: pic.cover, hue: pic.hue, sat: pic.sat } : { cover: null, hue: null, sat: null };
    const share = $('#lfs', s).checked; if (l) { l.name = n; l.desc = $('#lfd', s).value.trim(); l.share = share; Object.assign(l, cv) } else A.LISTS.unshift({ id: 'l' + Date.now().toString(36), name: n, desc: $('#lfd', s).value.trim(), ids: id ? [id] : [], share, ...cv });
    try { A.saveLists() } catch (err) { toast('No hay espacio para esa portada'); return } A.popLayer(); toast(l ? 'Playlist guardada' : 'Playlist creada'); A.render() })
}
on('newlist', el => { const id = el.dataset.id; if (layers.length) { A.popLayer(); setTimeout(() => listForm(null, id), 260) } else listForm(null, id) });
on('editlist', el => listForm(A.LISTS.find(x => x.id === el.dataset.id)));
on('dellist', el => { A.LISTS = A.LISTS.filter(x => x.id !== el.dataset.id); A.saveLists(); A.popLayer(); setTimeout(() => A.go('biblioteca', true), 260) });
on('rmfrom', el => { const l = A.LISTS.find(x => x.id === A.route().arg); if (l) { l.ids = l.ids.filter(x => x !== el.dataset.id); A.saveLists() } A.popLayer(); A.render() });
on('goalbum', el => { const t = A.byId(el.dataset.id); closeAll(); A.go('album/' + encodeURIComponent(t.album)) });
on('goartist', el => { const t = A.byId(el.dataset.id); closeAll(); A.go('artista/' + encodeURIComponent(t.artist)) });
function closeAll() { while (layers.length) { layers.pop()() } }
A.closeAll = closeAll;

/* calificar: 5 círculos, medio = 1 punto, lleno = 2 */
function rateSheet(id) {
  const t = A.byId(id); let v = (A.META[id] && A.META[id].rating) || 0;
  const s = A.sheet(A.shead('star', 'Calificar canción') + `<div style="text-align:center"><div style="width:150px;margin:0 auto">${cov(t)}</div><h2 style="font-size:20px;margin-top:14px">${esc(t.name)}</h2><div style="font-weight:600">${esc(t.artist)}</div><div class="muted small">${esc(t.album)}</div>
   <div class="rate" id="rt"></div><div class="small" id="rtl"></div></div><div class="foot"><button class="btn t" data-a="dgo" data-v="calificaciones">Ver calificaciones</button><button class="btn" data-a="closesheet">Listo</button></div>`);
  const paint = () => { $('#rt', s).innerHTML = [0, 1, 2, 3, 4].map(i => { const f = v - i * 2; return `<button class="${f >= 2 ? 'f' : f === 1 ? 'h' : ''}" data-i="${i}" aria-label="Círculo ${i + 1}"></button>` }).join(''); $('#rtl', s).innerHTML = v ? `<b>${v} de 10</b>` : 'Medio círculo = 1 punto · lleno = 2' };
  paint(); $('#rt', s).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const i = +b.dataset.i, f = v - i * 2; v = f >= 2 ? i * 2 + 1 : f === 1 ? i * 2 : i * 2 + 2; if (v === 0 && i === 0 && f === 1) v = 0; A.meta(id).rating = v; A.meta(id).ratedAt = Date.now(); A.saveMeta(); paint(); A.paintFp() })
}
on('rate', el => { const id = el.dataset.id; if (layers.length && !$('#fp').classList.contains('open') || $('.scrim')) { A.popLayer(); setTimeout(() => rateSheet(id), 260) } else rateSheet(id) });
on('ratealbum', el => { const k = el.dataset.k; let v = A.ALRATE[k] || 0; const s = A.sheet(A.shead('album', 'Calificar álbum', esc(k)) + `<div class="rate" id="rt"></div><div class="small" id="rtl" style="text-align:center"></div><div class="foot"><button class="btn" data-a="closesheet">Listo</button></div>`); const paint = () => { $('#rt', s).innerHTML = [0, 1, 2, 3, 4].map(i => { const f = v - i * 2; return `<button class="${f >= 2 ? 'f' : f === 1 ? 'h' : ''}" data-i="${i}"></button>` }).join(''); $('#rtl', s).innerHTML = v ? `<b>${v} de 10</b>` : 'Medio círculo = 1 punto · lleno = 2' }; paint(); $('#rt', s).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const i = +b.dataset.i, f = v - i * 2; v = f >= 2 ? i * 2 + 1 : f === 1 ? i * 2 : i * 2 + 2; A.ALRATE[k] = v; A.saveAlRate(); paint() }) });


on('info', el => { const t = A.byId(el.dataset.id); const r = (k, v) => v ? `<div class="si"><span class="t"><span>${k}</span><b>${esc(v)}</b></span></div>` : ''; A.popLayer(); setTimeout(() => A.sheet(A.shead('info', 'Información de la pista') + `<div class="sgrp">${r('Título', t.name)}${r('Artista', t.artist)}${r('Álbum', t.album)}${r('Año', t.year)}${r('Género', t.genre)}${r('Formato', [t.ext, t.bits ? t.bits + '-bit' : '', t.sr ? t.sr + ' Hz' : ''].filter(Boolean).join(' · '))}${r('Duración', fmt(t.dur))}${r('Tamaño', t.size ? (t.size / 1048576).toFixed(1) + ' MB' : '')}${r('Archivo', t.file)}${r('Carpeta', t.folder)}${r('Escuchada', fmtL(A.STS.t[t.id] || 0) + ' · ' + (A.STS.plays[t.id] || 0) + ' veces')}</div>`), 260) });
on('delask', el => { const id = el.dataset.id; A.popLayer(); setTimeout(() => A.sheet(A.shead('delete', '¿Eliminar del disco?', 'Se quita de aeffy y de tus playlists. Tu archivo original en el teléfono no se toca.') + `<div class="foot"><button class="btn t" data-a="closesheet">Cancelar</button><button class="btn" style="background:var(--danger);color:#410" data-a="delok" data-id="${id}">Eliminar</button></div>`), 260) });
on('delok', async el => { await A.deleteTrack(el.dataset.id); A.popLayer(); toast('Eliminada'); A.render() });
on('edittags', el => { const t = A.byId(el.dataset.id); A.popLayer(); setTimeout(() => { const s = A.sheet(A.shead('edit_note', 'Editar etiquetas y letra') + `<form id="tf">${[['name', 'Título'], ['artist', 'Artista'], ['album', 'Álbum'], ['year', 'Año'], ['genre', 'Género'], ['track', 'Pista']].map(([k, n]) => `<label class="fld"><small>${n}</small><input name="${k}" value="${esc(t[k] || '')}"></label>`).join('')}<label class="fld"><small>Letra (.lrc o texto)</small><textarea name="lyr">${esc(A.lyricsOf(t))}</textarea></label><div class="row2"><button type="button" class="btn t" data-a="findlrc" data-id="${t.id}">${ms('cloud_download')}Buscar .LRC</button></div><div class="foot"><button type="button" class="btn t" data-a="closesheet">Cancelar</button><button class="btn">Guardar</button></div></form>`); $('#tf', s).addEventListener('submit', e => { e.preventDefault(); const f = new FormData(e.target);['name', 'artist', 'album', 'year', 'genre'].forEach(k => t[k] = String(f.get(k) || '').trim() || t[k]); t.track = parseInt(f.get('track')) || 0; A.meta(t.id).lyr = String(f.get('lyr') || ''); A.saveMeta(); A.saveTrack(t); A.popLayer(); toast('Guardado'); A.render(); A.paintFp() }) }, 260) });
on('findlrc', async el => { const t = A.byId(el.dataset.id); toast('Buscando en LRCLIB…'); const txt = await A.fetchLyrics(t, true); const ta = document.querySelector('#tf textarea'); if (txt && ta) { ta.value = txt; toast('Letra encontrada') } else toast('No encontré la letra') });
on('editly', el => { const id = el.dataset.id || P.cur; A.ACT.edittags({ dataset: { id } }) });

/* ---------- acciones generales ---------- */
on('go', el => A.go(el.dataset.v));
on('back', () => A.back());
on('tab', el => A.go(el.dataset.v, true));
on('libtab', el => { libTab = libTab === el.dataset.v ? '' : el.dataset.v; A.render() });
on('rail', el => { const r = $('#' + el.dataset.r); r && r.scrollBy({ left: +el.dataset.d * r.clientWidth * .8, behavior: 'smooth' }) });
on('playin', el => { const ids = A.ctx[el.dataset.ctx] || [el.dataset.id]; if (el.dataset.ctx === 'queue') { A.playIdx(P.queue.indexOf(el.dataset.id)); return } const from = { search: 'Búsqueda', likes: 'Tus me gusta', daily: 'Mix diario', unheard: 'Aún sin escuchar', album: 'Álbum · ' + A.route().arg, artist: A.route().arg, plist: (A.LISTS.find(l => l.id === A.route().arg) || {}).name, all: 'Tu biblioteca', recientes: 'Agregados recientemente' }[el.dataset.ctx] || 'Tu biblioteca'; A.playList(ids, Math.max(0, ids.indexOf(el.dataset.id)), from) });
on('playctx', el => { const ids = A.ctx[el.dataset.ctx] || []; if (!ids.length) { toast(el.dataset.ctx === 'likes' ? 'Marca canciones con el corazón' : 'Agrega música primero'); return } if (el.dataset.shuf) P.shuffle = true; A.playList(ids, el.dataset.shuf ? Math.floor(Math.random() * ids.length) : 0, el.dataset.from) });
on('playalbum', el => { const g = albums().find(a => a.name === el.dataset.k); if (g) { A.ctx.album = g.items.map(t => t.id); A.playList(A.ctx.album, 0, 'Álbum · ' + g.name) } });
on('resume', el => { const id = el.dataset.id; const ids = A.tracks.map(t => t.id); A.playList(ids, Math.max(0, ids.indexOf(id)), 'Tu biblioteca') });
on('ctxmenu', el => { const ids = A.ctx[el.dataset.ctx] || []; A.sheet(`<div class="grab"></div><button class="mi" data-a="ctxq" data-ctx="${el.dataset.ctx}">${ms('queue_music')}Agregar todo a la cola</button><button class="mi" data-a="ctxlist" data-ctx="${el.dataset.ctx}">${ms('playlist_add')}Guardar como playlist</button>`, { head: false }) });
on('ctxq', el => { P.queue.push(...(A.ctx[el.dataset.ctx] || [])); A.popLayer(); toast('Agregadas a la cola') });
on('ctxlist', el => { const ids = A.ctx[el.dataset.ctx] || []; A.LISTS.unshift({ id: 'l' + Date.now().toString(36), name: 'Nueva playlist', ids: [...ids] }); A.saveLists(); A.popLayer(); toast('Playlist creada') });
on('toggle', A.toggle); on('next', A.next); on('prev', A.prev);
on('shuffle', () => { P.shuffle = !P.shuffle; if (P.shuffle && P.queue.length) P.queue = [...P.queue.slice(0, P.qi + 1), ...shuffled(P.queue.slice(P.qi + 1))]; toast(P.shuffle ? 'Aleatorio activado' : 'Aleatorio desactivado'); A.paintFp() });
on('repeat', () => { P.repeat = (P.repeat + 1) % 3; toast(['Sin repetir', 'Repetir todo', 'Repetir esta canción'][P.repeat]); A.paintFp() });
on('fav', el => { const id = el.dataset.id, m = A.meta(id); m.fav = !m.fav; A.saveMeta(); toast(m.fav ? 'Agregada a Me gusta' : 'Quitada de Me gusta'); if (el.dataset.close) A.popLayer(); A.paintFp(); if (A.route().v !== 'inicio') A.render() });
on('noop', () => { });
on('import', () => $('#fIn').click());
on('import-dir', () => $('#dIn').click());

/* búsqueda en vivo */
document.addEventListener('input', e => { if (e.target.id === 'q') { q = e.target.value; $('#sres').innerHTML = searchRes() } });
}
/* aeffy · cuenta, premium, PayPal (Supabase) */
'use strict';
{
const { $, esc, ms, toast } = A;
const SB_URL = 'https://nhyxgfnjjzrdwshiuoyo.supabase.co';
const SB_KEY = 'sb_publishable_mWqzzXWVr3y971we6jhW3A_1Z3PakCO';
let sb = null;
A.cfg = { plan: { price: 3, currency: 'USD', trial_days: 15, name: 'aeffy Premium' }, paypal: { client_id: '', plan_id: '', enabled: false }, premium_features: { karaoke: true, translate: true, tools_unlimited: true, app_color: false, spots_12: true, profile_color: true, history_import: true }, limits: { free_tool_uses: 10 }, notice: { text: '', active: false } };
Object.assign(A.cfg, A.lsGet('ae_cfg', {}));
A.me = A.lsGet('ae_me', null); A.session = null; A.isAdmin = false;

A.isPremium = () => !!(A.me && A.me.premium_until && new Date(A.me.premium_until) > new Date());
A.can = f => !A.cfg.premium_features?.[f] || A.isPremium();
let avN = 0;
A.avImg = (me = A.me, shape = 'cookie') => { const sp = me && me.avatar_anim ? String(me.avatar_anim) : '', an = sp ? ` data-av="${esc(sp)}"` : ''; if (sp && A.shapePath) shape = '@' + sp.split('|')[0]; if (!me || !me.avatar_url) return `<b${an}>${esc(A.initials())}</b>`; const id = 'avc' + (++avN); return `<svg class="avsvg"${an} viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="${id}"><path d="${shape[0] === '@' && A.shapePath ? A.shapePath(shape.slice(1)) : (A.SH[shape] || A.SH.cookie)}"/></clipPath></defs><image href="${esc(me.avatar_url)}" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/></svg>` };
A.uploadPic = async (file, kind) => {
  const c = client(); if (!c || !A.session) return null;
  const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = URL.createObjectURL(file) });
  const W = kind === 'banner' ? 1200 : 512, H = kind === 'banner' ? 480 : 512;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'); x.imageSmoothingQuality = 'high';
  const r = Math.max(W / img.width, H / img.height), w = img.width * r, h = img.height * r; x.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  const blob = await new Promise(ok => cv.toBlob(ok, 'image/jpeg', .88));
  const path = A.session.user.id + '/' + kind + '-' + Date.now().toString(36) + '.jpg';
  const { error } = await c.storage.from('aeffy-avatars').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  if (error) { toast('No pude subir la foto'); return null }
  return c.storage.from('aeffy-avatars').getPublicUrl(path).data.publicUrl
};
A.saveProfileExtra = async (o) => { const c = client(); const { data, error } = await c.rpc('aeffy_update_profile_extra', { p_bio: o.bio ?? null, p_avatar: o.avatar ?? null, p_banner: o.banner ?? null, p_color: o.color ?? null }); if (error) { toast('No se pudo guardar'); return false } A.me = data; A.lsSet('ae_me', data); return true };
A.initials = () => { const n = (A.me?.display_name || A.me?.email || '?').trim(); const p = n.split(/\s+/); return ((p[0] || '')[0] + ((p[1] || '')[0] || '')).toUpperCase() || '?' };
A.daysLeft = () => A.me?.premium_until ? Math.max(0, Math.ceil((new Date(A.me.premium_until) - new Date()) / 864e5)) : 0;
A.noticeHtml = () => A.cfg.notice?.active && A.cfg.notice.text ? `<div class="notice">${ms('campaign')}<span>${esc(A.cfg.notice.text)}</span></div>` : '';

function client() { if (sb) return sb; if (!window.supabase) return null; sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } }); return sb }
A.sb = client;
async function loadCfg() { const c = client(); if (!c) return; const { data } = await c.from('aeffy_config').select('key,value'); if (data) { data.forEach(r => A.cfg[r.key] = r.value); A.lsSet('ae_cfg', A.cfg) } }
async function loadMe() {
  const c = client(); if (!c || !A.session) { A.me = null; A.lsSet('ae_me', null); A.isAdmin = false; return }
  const { data, error } = await c.rpc('aeffy_ensure_profile'); if (!error && data) { A.me = data; A.lsSet('ae_me', data) }
  const ref = localStorage.getItem('ae_ref'); if (ref) { await c.rpc('aeffy_set_ref', { p_handle: ref }); localStorage.removeItem('ae_ref') }
  const ad = await c.rpc('aeffy_claim_admin'); A.isAdmin = !!ad.data;
  if (A.me && A.me.paypal_sub_id) refreshPaypal(true);
  if (A.liveStart) A.liveStart();
}
A.refreshMe = async () => { await loadMe(); A.render() };
/* correos de aeffy (se envían con el Gmail de Meffy) */
A.mail = async body => { try { const r = await fetch('https://meffy-store.vercel.app/api/aeffy-mail', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); return await r.json() } catch (e) { return null } };
async function confirmFromLink(c) {
  const p = new URLSearchParams(location.search); const th = p.get('ok'), k = p.get('k'); if (!th || !k) return;
  p.delete('ok'); p.delete('k'); history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : '') + location.hash);
  const { error } = await c.auth.verifyOtp({ token_hash: th, type: k === 'recovery' ? 'recovery' : k === 'magiclink' ? 'magiclink' : 'signup' });
  if (error) { toast(/expired|invalid/i.test(error.message) ? 'Ese enlace ya se usó o venció. Pide otro correo.' : 'No pude confirmar: ' + error.message); return }
  if (k === 'recovery') setTimeout(() => A.newPassSheet(), 400); else toast('¡Tu cuenta está confirmada! Ya entraste');
}
A.newPassSheet = () => {
  const s = A.sheet(A.shead('lock_reset', 'Elige tu nueva contraseña', 'Escríbela y guárdala. La usarás para entrar a aeffy.') + `<form id="np"><label class="fld"><small>Nueva contraseña</small><input id="npP" type="password" minlength="6" required autocomplete="new-password" placeholder="Mínimo 6 caracteres"></label><button class="btn big" style="width:100%">Guardar</button><p class="small muted" id="npM" style="text-align:center;min-height:20px"></p></form>`);
  $('#np', s).addEventListener('submit', async ev => { ev.preventDefault(); const { error } = await client().auth.updateUser({ password: $('#npP', s).value }); if (error) { $('#npM', s).textContent = error.message; return } A.popLayer(); toast('Contraseña cambiada') })
};
A.cloudInit = async () => {
  const p = new URLSearchParams(location.search); if (p.get('ref')) localStorage.setItem('ae_ref', p.get('ref'));
  const c = client(); if (!c) return;
  try { await loadCfg() } catch (e) { }
  try { await confirmFromLink(c) } catch (e) { }
  const { data } = await c.auth.getSession(); A.session = data.session; await loadMe();
  c.auth.onAuthStateChange(async (ev, s) => { const had = !!A.session; A.session = s; if (ev === 'SIGNED_IN' || ev === 'SIGNED_OUT' || (!had && s)) { await loadMe(); A.render() } });
  syncMinutes(); setInterval(syncMinutes, 5 * 60000);
  A.render()
};
async function syncMinutes() { const c = client(); if (!c || !A.session) return; const m = Math.floor(A.totalSecs() / 60); try { const { data } = await c.rpc('aeffy_update_profile', { p_name: null, p_handle: null, p_visibility: null, p_minutes: m }); if (data) { A.me = data; A.lsSet('ae_me', data) } } catch (e) { } }

/* ---------- entrar / crear cuenta ---------- */
A.loginSheet = (mode = 'in') => {
  const s = A.sheet(A.shead('account_circle', 'Entra a aeffy', 'Tu cuenta guarda tu perfil, tus estadísticas y tu Premium, y te sigue a tus otros dispositivos.') + `
   <form id="lg"><label class="fld"><small>Correo electrónico</small><input id="lgE" type="email" autocomplete="email" required placeholder="tu@correo.com"></label>
   <label class="fld"><small>Contraseña</small><input id="lgP" type="password" autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}" minlength="6" required placeholder="Mínimo 6 caracteres"></label>
   <button type="button" class="btn big t" style="width:100%;margin-bottom:10px" data-a="google"><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Continuar con Google</button><div class="small muted" style="text-align:center;margin:0 0 10px">o con tu correo</div>
   <button class="btn big" style="width:100%" id="lgB">${mode === 'up' ? 'Crear cuenta' : 'Entrar'}</button>
   <p class="small muted" id="lgM" style="text-align:center;min-height:20px"></p>
   <div style="text-align:center"><button type="button" class="btn g" id="lgT">${mode === 'up' ? '¿Ya tienes cuenta? Entra' : '¿No tienes cuenta? Créala gratis'}</button><button type="button" class="btn g" id="lgR">Olvidé mi contraseña</button></div></form>`);
  $('#lgT', s).onclick = () => { A.popLayer(); setTimeout(() => A.loginSheet(mode === 'up' ? 'in' : 'up'), 260) };
  $('#lgR', s).onclick = async () => { const e = $('#lgE', s).value.trim(); if (!e) { $('#lgM', s).textContent = 'Escribe tu correo arriba'; return } const r = await A.mail({ kind: 'recovery', email: e }); if (r && r.error) { $('#lgM', s).textContent = r.error; return } if (!r || r.fallback) { const c = client(); await c.auth.resetPasswordForEmail(e, { redirectTo: location.origin + '/#/cuenta' }) } $('#lgM', s).textContent = 'Si ese correo tiene cuenta, te llegará un correo de aeffy para cambiarla. Revisa también Spam.' };
  /* pantalla clara de "revisa tu correo" después de registrarte */
  const showWait = (e, pw, viaMail) => {
    const sh = s.querySelector('.sheet'); const dom = (e.split('@')[1] || '').toLowerCase();
    const open = /gmail|googlemail/.test(dom) ? 'https://mail.google.com/mail/u/0/#search/aeffy' : /outlook|hotmail|live|msn/.test(dom) ? 'https://outlook.live.com/mail/' : /yahoo/.test(dom) ? 'https://mail.yahoo.com/' : /icloud|me\.com/.test(dom) ? 'https://www.icloud.com/mail' : '';
    sh.innerHTML = A.shead('mark_email_unread', 'Revisa tu correo', 'Tu cuenta ya casi está lista.') + `
     <div style="text-align:center;margin:6px 0 14px"><div style="font-size:15px">Te enviamos un correo a</div><b style="font-size:18px;word-break:break-all">${esc(e)}</b></div>
     <div class="card" style="display:grid;gap:12px">${[['mail', 'Abre el correo de aeffy', 'Puede tardar 1 o 2 minutos en llegar. Si no lo ves, revisa Spam o Promociones.'], ['task_alt', 'Toca «Confirmar mi cuenta»', 'Ese botón activa tu cuenta.'], ['login', 'Vuelve aquí', 'Toca «Ya lo confirmé» y entras con tu correo y contraseña.']].map(([i, t, d], k) => `<div style="display:flex;gap:12px;align-items:flex-start"><span class="badge sm" style="flex:none"><b style="font-size:16px">${k + 1}</b></span><span><b style="display:block">${t}</b><span class="muted small">${d}</span></span></div>`).join('')}</div>
     <p class="small" id="wtM" style="text-align:center;min-height:20px;margin:12px 0 4px"></p>
     <button class="btn big" style="width:100%" id="wtOk">${ms('login')}Ya lo confirmé, entrar</button>
     <div class="row2" style="margin-top:10px">${open ? `<a class="btn t" href="${open}" target="_blank" rel="noopener" id="wtOpen">${ms('open_in_new')}Abrir mi correo</a>` : ''}<button class="btn t" id="wtRe">${ms('refresh')}Reenviar correo</button></div>
     <button class="btn g" style="width:100%;margin-top:8px" id="wtBack">Usar otro correo</button>`;
    const M = sh.querySelector('#wtM'); let busy = false;
    const tryIn = async quiet => {
      if (busy) return; busy = true; const c = client();
      try { const { error } = await c.auth.signInWithPassword({ email: e, password: pw }); if (error) throw error; A.popLayer(); toast('¡Cuenta confirmada! Ya entraste') }
      catch (err) { if (!quiet) M.textContent = /confirm/i.test(err.message) ? 'Todavía no está confirmada. Abre el correo y toca «Confirmar mi cuenta».' : /Invalid login/i.test(err.message) ? 'Correo o contraseña incorrectos' : err.message }
      busy = false
    };
    sh.querySelector('#wtOk').onclick = () => tryIn(false);
    if (open) sh.querySelector('#wtOpen').onclick = e2 => { if (window.AeffyNative) { e2.preventDefault(); try { AeffyNative.openExternal(open) } catch (x) { location.href = open } } };
    let wait = 0; const reBtn = sh.querySelector('#wtRe');
    reBtn.onclick = async () => {
      if (wait) return; reBtn.disabled = true; M.textContent = 'Enviando…';
      try { const r = viaMail ? await A.mail({ kind: 'signup', email: e, password: pw }) : null; if (!viaMail || !(r && r.ok)) { const { error } = await client().auth.resend({ type: 'signup', email: e, options: { emailRedirectTo: location.origin } }); if (error) throw error } M.textContent = 'Te lo enviamos otra vez. Revisa también Spam.' }
      catch (err) { M.textContent = 'No pude reenviarlo: ' + err.message }
      wait = 60; const t = setInterval(() => { wait--; reBtn.innerHTML = wait > 0 ? `${ms('schedule')}Reenviar en ${wait}s` : `${ms('refresh')}Reenviar correo`; if (wait <= 0) { clearInterval(t); reBtn.disabled = false } }, 1000)
    };
    sh.querySelector('#wtBack').onclick = () => { A.popLayer(); setTimeout(() => A.loginSheet('up'), 260) };
    /* cuando vuelves de tu correo, intenta entrar solo */
    const onBack = () => { if (!document.hidden && document.body.contains(sh)) tryIn(true) };
    document.addEventListener('visibilitychange', onBack);
  };
  $('#lg', s).addEventListener('submit', async ev => {
    ev.preventDefault(); const c = client(); if (!c) { toast('Sin conexión'); return }
    const e = $('#lgE', s).value.trim(), pw = $('#lgP', s).value, b = $('#lgB', s), m = $('#lgM', s); b.disabled = true; m.textContent = '';
    try {
      if (mode === 'up') {
        const r = await A.mail({ kind: 'signup', email: e, password: pw });
        if (r && r.ok) { showWait(e, pw, true); return }
        if (r && r.error) throw new Error(r.error);
        const { data, error } = await c.auth.signUp({ email: e, password: pw, options: { emailRedirectTo: location.origin } }); if (error) throw error; if (!data.session) { showWait(e, pw, false); return } }
      else { const { error } = await c.auth.signInWithPassword({ email: e, password: pw }); if (error) throw error }
      A.popLayer(); toast('¡Listo, ya entraste!')
    } catch (err) { if (/confirm/i.test(err.message)) { showWait(e, pw, false); return } m.textContent = /Invalid login/i.test(err.message) ? 'Correo o contraseña incorrectos' : /registered/i.test(err.message) ? 'Ese correo ya tiene cuenta: entra' : err.message; b.disabled = false }
  })
};
A.signOut = async () => { const c = client(); if (c) await c.auth.signOut(); A.me = null; A.isAdmin = false; A.lsSet('ae_me', null); A.render(); toast('Cerraste sesión') };
A.updateProfile = async (name, handle, vis) => { const c = client(); const { data, error } = await c.rpc('aeffy_update_profile', { p_name: name, p_handle: handle, p_visibility: vis, p_minutes: null }); if (error) { toast(/unique|duplicate/i.test(error.message) ? 'Ese @nombre ya está en uso' : 'No se pudo guardar'); return false } A.me = data; A.lsSet('ae_me', data); return true };
A.redeem = async code => { const c = client(); if (!A.session) { A.loginSheet(); return } const { data, error } = await c.rpc('aeffy_redeem', { p_code: code }); if (error) { toast(error.message.replace(/^.*?: /, '')); return } A.me = data; A.lsSet('ae_me', data); toast('¡Código canjeado! Ya eres Premium'); A.render() };
A.invites = async () => { const c = client(); if (!c || !A.session) return { joined: 0, confirmed: 0 }; const { data } = await c.rpc('aeffy_my_invites'); return data || { joined: 0, confirmed: 0 } };
A.deleteAccount = async () => { const c = client(); await c.rpc('aeffy_delete_me'); await A.signOut(); toast('Tu cuenta de aeffy se borró') };

/* ---------- PayPal: prueba gratis y suscripción ---------- */
function loadPaypal() {
  return new Promise((res, rej) => { if (window.paypal) return res(); const pp = A.cfg.paypal || {}; if (!pp.client_id || !pp.plan_id) return rej(new Error('nocfg')); const s = document.createElement('script'); s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(pp.client_id)}&vault=true&intent=subscription&currency=${encodeURIComponent(A.cfg.plan.currency || 'USD')}&locale=es_ES`; s.onload = res; s.onerror = () => rej(new Error('load')); document.head.appendChild(s) })
}
async function refreshPaypal(silent, subId) {
  const c = client(); if (!c || !A.session) return;
  try { const { data, error } = await c.functions.invoke('aeffy-paypal', { body: subId ? { subscriptionID: subId } : {} }); if (error) throw error; if (data?.error) throw new Error(data.error); await loadMe(); if (!silent) { toast(A.isPremium() ? '¡Ya eres Premium!' : 'Tu suscripción no está activa'); A.render() } }
  catch (e) { if (!silent) toast('No pude confirmar con PayPal todavía') }
}
A.refreshPaypal = refreshPaypal;
A.startTrial = async () => {
  if (!A.session) { A.loginSheet('up'); return }
  const days = A.cfg.plan.trial_days || 15, price = A.cfg.plan.price || 3;
  const s = A.sheet(A.shead('workspace_premium', 'aeffy Premium') + `<div class="sg">Enlace fijo de tus Spots</div>${premiumList()}<p class="small muted" style="margin:14px 0">${esc(A.cfg.plan.name || 'aeffy Premium')}: ${price} ${esc(A.cfg.plan.currency || 'USD')} al mes después de ${days} días gratis. Cancela cuando quieras desde PayPal.</p><div id="ppb" style="min-height:50px"></div><div class="foot"><button class="btn g" data-a="closesheet">Ahora no</button><button class="btn t" data-a="codesheet">${ms('redeem')}Tengo un código</button></div>`);
  try {
    await loadPaypal();
    window.paypal.Buttons({
      style: { shape: 'pill', color: 'blue', layout: 'vertical', label: 'subscribe' },
      createSubscription: (d, actions) => actions.subscription.create({ plan_id: A.cfg.paypal.plan_id, custom_id: A.session.user.id }),
      onApprove: async d => { toast('Confirmando con PayPal…'); await refreshPaypal(false, d.subscriptionID); A.closeAll(); A.go('premium', true) },
      onError: () => toast('PayPal no pudo completar el pago')
    }).render($('#ppb', s))
  } catch (e) { $('#ppb', s).innerHTML = `<div class="notice">${ms('info')}<span>${e.message === 'nocfg' ? 'Los pagos con PayPal se activan muy pronto. Mientras, puedes usar un código.' : 'No pude cargar PayPal. Revisa tu conexión.'}</span></div>` }
};
A.codeSheet = () => { const s = A.sheet(A.shead('redeem', 'Tengo un código', 'Escribe el código que te dieron para activar Premium.') + `<form id="cf"><label class="fld"><small>Código</small><input id="cfI" autocapitalize="characters" required placeholder="AEFFY-XXXX"></label><div class="foot"><button type="button" class="btn t" data-a="closesheet">Cancelar</button><button class="btn">Canjear</button></div></form>`); $('#cf', s).addEventListener('submit', async e => { e.preventDefault(); await A.redeem($('#cfI', s).value); A.popLayer() }) };
A.on('codesheet', () => { A.popLayer(); setTimeout(A.codeSheet, 260) });
function premiumList() { return `<div>${['Herramientas sin límite de pruebas', 'Modo karaoke palabra por palabra', 'Spots sin límite de tiempo, hasta 12 personas', 'Importar historial de otras plataformas', 'Color propio y avatar en tu perfil', 'Y apoyas el desarrollo de aeffy'].map(x => `<div class="mi" style="min-height:40px">${ms('check')}<span>${x}</span></div>`).join('')}</div>` }
A.premiumList = premiumList;
}
/* aeffy · premium, cuenta, perfil, estadísticas, calificaciones, amigos, ajustes */
'use strict';
{
const { $, $$, esc, ms, fmt, fmtL, dkey, toast, shp, cov, P, on, top, badge } = A;
const V = A.views;
const plural = (n, a, b) => n + ' ' + (n === 1 ? a : b);
const sw = (k, onv) => `<button class="sw${onv ? ' on' : ''}" data-a="set" data-k="${k}" role="switch" aria-checked="${!!onv}" aria-label="${k}"></button>`;
const lock = f => A.can(f) ? '' : `<span class="lock">${ms('workspace_premium', 1)}Premium</span>`;

/* ---------- PREMIUM ---------- */
V.premium = () => {
  const c = A.cfg.plan, prem = A.isPremium();
  const orbit = `<div class="orbit"><div class="ring"></div><div class="core">${shp('flower')}${ms('crown', 1)}</div>${[['mic', 0], ['insights', 72], ['handyman', 144], ['podcasts', 216], ['leaderboard', 288]].map(([i, a]) => { const r = 130, x = 130 + r * Math.cos(a * Math.PI / 180) - 20, y = 130 + r * Math.sin(a * Math.PI / 180) - 20; return `<span class="sat" style="left:${x}px;top:${y}px;animation:none">${shp('cookie')}${ms(i)}</span>` }).join('')}</div>`;
  let h = top({ back: 1 }) + `<section class="hero"><div class="label">${ms('crown', 1)}aeffy Premium</div>`;
  if (prem) {
    const d = new Date(A.me.premium_until); h += `<h1>Ya eres<br>Premium.</h1><p>${A.me.premium_source === 'paypal' ? 'Se renueva el' : 'Activo hasta el'} ${d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })} · ${plural(A.daysLeft(), 'queda 1 día', 'quedan ' + A.daysLeft() + ' días').replace(/^\d+ /, '')}</p>
     <div class="row2" style="align-items:center">${A.me.paypal_sub_id ? `<a class="btn big t" href="https://www.paypal.com/myaccount/autopay/" target="_blank" rel="noopener">${ms('settings')}Gestionar suscripción</a>` : ''}<button class="btn g" data-a="codesheet2">${ms('redeem')}Tengo un código</button><button class="ib t" data-a="ppref" aria-label="Actualizar">${ms('refresh')}</button></div>`
  } else {
    h += `<h1>Todo aeffy,<br><em>sin límites.</em></h1><p>Herramientas sin límite, Spots sin reloj, karaoke, letras traducidas y un perfil con tu color. Y, de paso, ayudas a que aeffy siga creciendo.</p><div class="price">${c.price} ${esc(c.currency || 'USD')}<small>al mes</small></div><p class="small" style="margin:4px 0 18px">Cancela cuando quieras, sin permanencia.</p>
     ${A.session ? `<button class="btn big" data-a="trial">${ms('auto_awesome')}Probar ${c.trial_days} días gratis</button>` : `<button class="btn big" data-a="login">${ms('login')}Iniciar sesión</button><p class="small muted">Inicia sesión para hacerte Premium.</p>`}`
  }
  h += `</section>${orbit}<div class="sech"><h2 style="font-size:28px">Todo lo que incluye</h2></div>`;
  const feats = [['all_inclusive', 'Herramientas sin límite', 'Analiza, convierte, remuestrea y ordena tus archivos tantas veces como quieras.'], ['photo_library', 'Tus notas, a tu estilo', 'Publica sin límite en tu perfil y comparte con estilos de imagen. Calificar siempre es gratis.'], ['groups', 'Spots sin reloj', 'Sin límite de tiempo, hasta 12 personas, con enlace propio y votaciones.'], ['lyrics', 'Modo karaoke', 'La letra se llena palabra por palabra, al ritmo exacto de la canción.'], ['palette', 'Tu perfil, a tu manera', 'Elige un color propio para tu perfil y anima tu avatar.'], ['translate', 'Letras traducidas', 'Traduce la letra de cualquier canción a tu idioma mientras suena.'], ['history', 'Tu historial, completo', 'Importa lo que escuchaste en otras plataformas con un archivo CSV.'], ['favorite', 'aeffy sigue adelante', 'aeffy lo hace una sola persona, sin anuncios. Premium es lo que lo mantiene vivo.']];
  h += feats.map(([i, t, d]) => `<div class="feat"><div class="vis">${ms(i, 1)}</div><h3>${t}</h3><p>${d}</p></div>`).join('');
  const L = A.cfg.limits || {};
  const rows = [['Perfil público y estadísticas', 1, 1], ['Amigos y «Escuchando ahora»', 1, 1], ['Herramientas de audio', (L.free_tool_uses || 10) + ' usos de cada una', 'Sin límite'], ['Tiempo de tus Spots', '1 h al día', 'Sin límite'], ['Personas en un Spot', 'Hasta ' + (L.free_spot_people || 4), 'Hasta ' + (L.premium_spot_people || 12)], ['Modo karaoke', 0, 1], ['Traducir letras', 0, 1], ['Color propio en tu perfil', 0, 1], ['Importar historial', 0, 1]];
  const cell = v => v === 1 ? ms('check') : v === 0 ? '—' : esc(v);
  h += `<div class="sech"><h2 style="font-size:28px">Gratis y Premium, lado a lado</h2></div><div class="card" style="padding:6px 12px"><table class="cmp"><thead><tr><th></th><th>Gratis</th><th>${ms('crown', 1)}</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${cell(r[1])}</td><td>${cell(r[2])}</td></tr>`).join('')}</tbody></table></div>
   <div class="card" style="margin-top:14px;display:flex;gap:12px;background:var(--s2)">${ms('group')}<p class="small" style="margin:0">Lo social de aeffy es gratis: calificar sin límite, tu perfil público, amigos y Spots. Premium quita los topes y suma personalización, herramientas y comodidades.</p></div>`;
  if (!prem) h += `<div class="try"><h2>Pruébalo ${c.trial_days} días, gratis.</h2><p>${A.session ? 'Después ' + c.price + ' ' + esc(c.currency || 'USD') + ' al mes. Cancela cuando quieras.' : 'Inicia sesión para hacerte Premium.'}</p><button class="btn big" data-a="${A.session ? 'trial' : 'login'}">${ms(A.session ? 'auto_awesome' : 'login')}${A.session ? 'Probar gratis' : 'Iniciar sesión'}</button></div>`;
  return h
};
on('trial', () => A.startTrial());
on('login', () => A.loginSheet('in'));
on('codesheet2', () => A.codeSheet());
on('ppref', () => A.refreshPaypal(false));

/* ---------- PERFIL ---------- */
V.perfil = () => {
  if (!A.me) return V.cuenta();
  const me = A.me, st = A.streak(), dist = Object.keys(A.STS.t).length, rated = Object.values(A.META).filter(m => m.rating).length;
  const col = me.color ? `--ph:${+me.color};` : '';
  const ban = me.banner_url ? `<div class="ban img" style="${col}background-image:url('${esc(me.banner_url)}')"></div>` : `<div class="ban" style="${col}"></div>`;
  return top({ back: 1 }) + ban + `<div class="prof" style="${col}"><div class="avatar">${shp('flower')}${A.avImg(A.me, 'flower')}</div><h2>${esc(me.display_name || 'Tu perfil')}</h2>${me.handle ? `<div class="muted">@${esc(me.handle)}</div>` : ''}${A.isPremium() ? `<span class="pbadge">${ms('crown', 1)}Premium</span>` : ''}
   ${me.bio ? `<p class="pbio">${esc(me.bio)}</p>` : ''}
   <div class="counts"><div><b>${rated}</b><span>reseñas</span></div><div><b>0</b><span>seguidores</span></div><div><b>0</b><span>amigos</span></div></div>
   <div class="row2" style="justify-content:center"><button class="btn" data-a="go" data-v="ajustes/perfil">${ms('edit')}Editar perfil</button><button class="btn t" data-a="viewas">${ms('visibility')}Cómo me ven</button>${me.handle ? `<button class="btn t" data-a="fr-share">${ms('share')}Compartir</button>` : ''}</div></div>
   <div class="sech"><h2>Sesiones y rachas</h2></div><div class="sgrid">${stt('local_fire_department', 'Días seguidos', plural(st.cur, 'día', 'días'))}${stt('music_note', 'Canciones distintas', dist)}${stt('graphic_eq', 'Sesiones', A.STS.sessions.length)}${stt('timer', 'Racha más larga', plural(st.best, 'día', 'días'))}</div>`
};
const stt = (i, l, v, s, cls = '') => `<div class="st ${cls}"><small>${ms(i)}${l}</small><b>${v}</b>${s ? `<span>${s}</span>` : ''}</div>`;

/* ---------- CUENTA ---------- */
V.cuenta = () => {
  let h = top({ back: 1 }) + `<h1 class="h1">Cuenta</h1>`;
  if (!A.session) return h + `<section class="card" style="display:flex;gap:14px;align-items:center;margin-top:12px"><span class="avatar" style="width:52px;height:52px">${shp('cookie')}${ms('person')}</span><div style="flex:1"><b style="font-family:var(--hf);font-size:18px">Cuenta aeffy</b><p class="muted small" style="margin:2px 0 10px">Gratis. Sirve para tus amigos y para aeffy Premium. aeffy funciona igual sin cuenta.</p><button class="btn" data-a="login">${ms('login')}Iniciar sesión</button></div></section>`;
  const me = A.me || {};
  return h + `<section class="card" style="display:flex;gap:14px;align-items:center;margin-top:12px"><span class="avatar" style="width:52px;height:52px">${shp('cookie')}${A.avImg()}</span><div style="flex:1"><b style="font-family:var(--hf);font-size:18px">Sesión iniciada</b><div class="muted small">Cuenta aeffy</div><button class="btn g" style="padding:0;margin-top:6px" data-a="signout">${ms('logout')}Cerrar sesión</button></div></section>
   <div class="sg">Información de la cuenta</div><div class="sgrp">
    <button class="si" data-a="go" data-v="ajustes/perfil"><span class="ic">${ms('badge')}</span><span class="t"><b>Nombre visible</b><span>${esc(me.display_name || 'Sin nombre')}</span></span><span class="chev">${ms('chevron_right')}</span></button>
    <button class="si" data-a="go" data-v="ajustes/perfil"><span class="ic">${ms('alternate_email')}</span><span class="t"><b>Nombre de usuario</b><span>${me.handle ? '@' + esc(me.handle) : 'Elige un nombre y tus invitaciones serán siempre el mismo enlace'}</span></span><span class="chev">${ms('chevron_right')}</span></button>
    <div class="si"><span class="ic">${ms('mail')}</span><span class="t"><b>Correo electrónico</b><span>${esc((me.email || '').replace(/^(.).*(@.*)$/, '$1•••$2'))}</span></span></div></div>
   <div class="sg">Estado de la cuenta</div><div class="sgrp"><div class="si"><span class="ic">${ms('verified', 1)}</span><span class="t"><b>Todo en orden</b><span>Tu cuenta no tiene ninguna restricción.</span></span></div></div>
   <div class="card" style="margin-top:16px;background:var(--dangerbg);color:#ffdad6"><b style="font-family:var(--hf);font-size:17px">Eliminar la cuenta aeffy</b><p class="small" style="opacity:.85">Se borran tu perfil, tus amigos y tu suscripción en aeffy. Tu biblioteca y tus datos en este equipo no cambian.</p><button class="btn d" data-a="delacc">${ms('delete')}Borrar cuenta</button></div>`
};
on('signout', () => A.signOut());
on('delacc', () => A.sheet(A.shead('warning', '¿Borrar tu cuenta?', 'Esto no se puede deshacer. Si pagas Premium con PayPal, cancélalo también en PayPal.') + `<div class="foot"><button class="btn t" data-a="closesheet">Cancelar</button><button class="btn" style="background:var(--danger);color:#410" data-a="delaccok">Borrar</button></div>`));
on('delaccok', async () => { A.popLayer(); await A.deleteAccount(); A.go('inicio', true) });

/* ---------- ESTADÍSTICAS ---------- */
let stR = 'semana', stTop = 'canciones', stMetric = 'tiempo';
V.estadisticas = () => {
  const keys = A.range(stR), tot = A.sumDays(keys), st = A.streak();
  const first = new Date((A.STS.firstDay || dkey(new Date())) + 'T12:00');
  let h = top({ back: 1 }) + `<div style="display:flex;gap:14px;align-items:center;margin-top:4px">${badge('bar_chart', 'sm')}<div><h1 class="h1" style="margin:0">Estadísticas</h1><div class="sub">Desde el ${first.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })} · solo cuenta lo que de verdad suena</div></div></div>
  <div class="chips" style="margin-top:14px">${[['hoy', 'Hoy'], ['semana', 'Semana'], ['mes', 'Mes'], ['año', 'Año'], ['siempre', 'Siempre']].map(([k, n]) => `<button class="chip${stR === k ? ' on' : ''}" data-a="strange" data-v="${k}">${n}</button>`).join('')}</div>`;
  const now = new Date(), dec1 = new Date(now.getFullYear(), 11, 1), left = Math.ceil((dec1 - now) / 864e5);
  h += left > 0 ? `<div class="banner"><small>RESUMEN</small><b>Tu resumen ${now.getFullYear()} llega el 1 de diciembre</b><span>Faltan ${plural(left, 'día', 'días')}. Todo tu año en diapositivas: lo más escuchado y qué tipo de oyente eres.</span></div>` : `<button class="banner" data-a="wrapped" style="width:100%;text-align:left;border:0"><small>RESUMEN</small><b>Tu resumen ${now.getFullYear()} ya está aquí</b><span>Tócalo para verlo en diapositivas.</span></button>`;
  if (tot < 20) return h + `<section class="card c" style="margin-top:14px">${badge('bar_chart')}<h3>Tus estadísticas empiezan ahora</h3><p>aeffy cuenta cuánto escuchas de verdad cada canción (las pausas y los saltos no cuentan). Escucha música y vuelve en un rato.</p></section>`;
  const plays = Object.values(A.STS.plays).reduce((a, b) => a + b, 0), act = keys.filter(k => A.STS.d[k] > 0).length, dist = Object.keys(A.STS.t).filter(id => A.STS.t[id] > 30).length;
  const curve = (() => { const pts = keys.slice().reverse().map(k => A.STS.d[k] || 0); const mx = Math.max(...pts, 1); if (pts.length < 2) return ''; return `<svg viewBox="0 0 100 40" preserveAspectRatio="none"><path d="${pts.map((v, i) => (i ? 'L' : 'M') + (i / (pts.length - 1) * 100).toFixed(1) + ' ' + (38 - v / mx * 32).toFixed(1)).join(' ')}" fill="none" stroke="var(--p)" stroke-width="1.2" vector-effect="non-scaling-stroke"/></svg>` })();
  h += `<div class="sgrid" style="margin-top:4px"><div class="st big"><small>${ms('headphones')}Tiempo escuchado</small><b>${fmtL(tot)}</b>${curve}</div>${stt('play_circle', 'Reproducciones', plays, 'Escuchas de 30 s o más')}${stt('music_note', 'Canciones distintas', dist, Math.round(dist / Math.max(1, plays) * 100) + ' % de variedad')}${stt('timer', 'Media por día', fmtL(tot / Math.max(1, act)), plural(act, 'día activo', 'días activos'))}${stt('local_fire_department', 'Racha', plural(st.cur, 'día', 'días'), 'Récord: ' + plural(st.best, 'día', 'días'), 'hot')}</div>`;
  /* tu ritmo */
  const D = ['D', 'L', 'M', 'X', 'J', 'V', 'S'], wk = Array(7).fill(0), wp = Array(7).fill(0); keys.forEach(k => { const d = new Date(k + 'T12:00').getDay(); wk[d] += A.STS.d[k] || 0 });
  const order = [1, 2, 3, 4, 5, 6, 0], vals = stMetric === 'tiempo' ? wk : wk.map(v => Math.round(v / 200)), mx = Math.max(...vals, 1), pk = vals.indexOf(Math.max(...vals));
  h += `<section class="card" style="margin-top:12px"><div class="carh" style="align-items:center"><div style="display:flex;gap:10px;align-items:center">${badge('bar_chart', 'sm')}<div><h3>Tu ritmo</h3><p>Cuánto escuchas por día</p></div></div></div><div class="chart">${order.map(d => `<div class="${d === pk ? 'on' : ''}"><i style="height:${Math.max(4, vals[d] / mx * 100)}%"></i>${D[d]}</div>`).join('')}</div><p class="small" style="margin:10px 0 0">${ms('crown', 1)} Pico: ${['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][pk]} · ${fmtL(wk[pk])}</p></section>`;
  /* reloj */
  const ph = A.peakHour(), hm = Math.max(...A.STS.h, 1);
  const bars = A.STS.h.map((v, i) => { const a = i / 24 * Math.PI * 2 - Math.PI / 2, r1 = 62, r2 = r1 + 8 + v / hm * 50; return `<line x1="${(130 + r1 * Math.cos(a)).toFixed(1)}" y1="${(130 + r1 * Math.sin(a)).toFixed(1)}" x2="${(130 + r2 * Math.cos(a)).toFixed(1)}" y2="${(130 + r2 * Math.sin(a)).toFixed(1)}" stroke="${i === ph ? 'var(--p)' : 'var(--s4)'}" stroke-width="8" stroke-linecap="round"/>` }).join('');
  const hh = ph >= 0 ? new Date(2000, 0, 1, ph).toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit' }) : '—';
  h += `<section class="card" style="margin-top:12px"><div style="display:flex;gap:10px;align-items:center">${badge('schedule', 'sm')}<div><h3>Reloj de escucha</h3><p class="muted small" style="margin:0">A qué horas suena tu música</p></div></div><svg viewBox="0 0 260 260" style="width:100%;max-width:300px;display:block;margin:10px auto"><circle cx="130" cy="130" r="122" fill="none" stroke="var(--line)"/>${bars}<text x="130" y="134" text-anchor="middle" font-family="Outfit" font-size="26" font-weight="800" fill="var(--on)">${hh}</text><text x="130" y="154" text-anchor="middle" font-size="12" fill="var(--mute)">${ph >= 0 ? 'tu hora · ' + A.partOfDay(ph) : ''}</text>${[['0', 130, 14], ['6', 248, 134], ['12', 130, 254], ['18', 12, 134]].map(([t, x, y]) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="12" fill="var(--mute)">${t}</text>`).join('')}</svg></section>`;
  /* hábitos */
  const ss = A.STS.sessions, sl = ss.map(s => s.l), dayCount = {}; keys.forEach(k => { const d = new Date(k + 'T12:00').getDay(); dayCount[d] = (dayCount[d] || 0) + (A.STS.d[k] || 0) }); const fav = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
  h += `<div class="sech"><h2>Hábitos</h2></div><div class="sgrid">${stt('headphones', 'Sesiones', ss.length)}${stt('hourglass_top', 'Sesión media', fmtL(sl.reduce((a, b) => a + b, 0) / Math.max(1, sl.length)))}${stt('workspace_premium', 'Sesión más larga', fmtL(Math.max(0, ...sl)))}${stt('trending_up', 'Sesiones por día', (ss.length / Math.max(1, Object.keys(A.STS.d).length)).toFixed(1).replace('.', ','))}${stt('calendar_month', 'Día favorito', fav ? ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fav[0]] : '—')}${stt('local_fire_department', 'Racha más larga', plural(st.best, 'día', 'días'))}</div>`;
  /* lo más escuchado */
  let list = [];
  if (stTop === 'canciones') list = A.topTracks(10).map(x => ({ n: x.t.name, s: x.t.artist, v: x.s, c: x.t, p: A.STS.plays[x.t.id] || 0 }));
  if (stTop === 'artistas') list = A.topBy(A.STS.a, 10).map(([n, v]) => ({ n, s: 'Artista', v, c: A.tracks.find(t => t.artist === n) }));
  if (stTop === 'albumes') list = A.topBy(A.STS.al, 10).map(([n, v]) => ({ n, s: 'Álbum', v, c: A.tracks.find(t => t.album === n) }));
  if (stTop === 'generos') { const g = {}; Object.entries(A.STS.t).forEach(([id, v]) => { const t = A.byId(id); if (t) g[t.genre || 'Sin género'] = (g[t.genre || 'Sin género'] || 0) + v }); list = A.topBy(g, 10).map(([n, v]) => ({ n, s: 'Género', v })) }
  const lm = list[0] ? list[0].v : 1;
  h += `<section class="card top5" style="margin-top:14px"><div style="display:flex;gap:10px;align-items:center">${badge('leaderboard', 'sm')}<div><h3>Lo más escuchado</h3><p class="muted small" style="margin:0">Ordenado por tiempo de escucha</p></div></div><div class="chips" style="margin:12px 0">${[['canciones', 'Canciones'], ['artistas', 'Artistas'], ['albumes', 'Álbumes'], ['generos', 'Géneros']].map(([k, n]) => `<button class="chip${stTop === k ? ' on' : ''}" data-a="sttop" data-v="${k}">${n}</button>`).join('')}</div>
   ${list.map((x, i) => `<div class="li"><span style="width:18px;font-weight:800">${i + 1}</span>${x.c ? cov(x.c, 's40') : `<div class="ph" style="width:40px;height:40px">${ms('category')}</div>`}<div class="t"><b>${esc(x.n)}</b><span>${esc(x.s)}</span><div class="bar" style="width:${(x.v / lm * 100).toFixed(1)}%"></div></div><span class="end" style="text-align:right"><b style="color:var(--on)">${fmtL(x.v)}</b>${x.p ? '<br>' + plural(x.p, 'vez', 'veces') : ''}</span></div>`).join('')}</section>`;
  return h
};
on('strange', el => { stR = el.dataset.v; A.render() });
on('sttop', el => { stTop = el.dataset.v; A.render() });

/* ---------- resumen anual (diapositivas) ---------- */
on('wrapped', () => {
  const tt = A.topTracks(5), ta = A.topBy(A.STS.a, 1)[0], ph = A.peakHour(), st = A.streak(), tot = A.totalSecs(), yr = new Date().getFullYear();
  const sl = [`<h3>aeffy · ${yr}</h3><h2>Tu año sonó así</h2><div class="huge">${Math.round(tot / 60)}</div><p>minutos de música de verdad</p>`,
  ta ? `<h3>Tu artista del año</h3><h2>${esc(ta[0])}</h2><p>${fmtL(ta[1])} juntos</p>` : '',
  `<h3>Tus canciones top</h3>${tt.map((x, i) => `<p style="font-size:18px;font-weight:700">${i + 1}. ${esc(x.t.name)} <span style="opacity:.7">· ${esc(x.t.artist)}</span></p>`).join('')}`,
  ph >= 0 ? `<h3>Tu hora</h3><div class="huge">${ph}:00</div><h2>Eres de ${A.partOfDay(ph)}</h2>` : '',
  `<h3>Racha récord</h3><div class="huge">${st.best}</div><h2>días seguidos con música</h2>`].filter(Boolean);
  let i = 0; const s = A.sheet(`<div class="grab"></div><div id="wrs" style="min-height:60vh;display:flex;flex-direction:column;justify-content:center;padding:20px;border-radius:24px;background:linear-gradient(160deg,var(--pc),#0b0c12)"></div><div class="foot"><button class="btn t" id="wp">Anterior</button><button class="btn" id="wn">Siguiente</button></div>`, { head: false });
  const paint = () => { $('#wrs', s).innerHTML = sl[i].replace('class="huge"', 'class="huge" style="font-family:Outfit;font-size:84px;font-weight:800;line-height:1"') }; paint();
  $('#wn', s).onclick = () => { i = Math.min(sl.length - 1, i + 1); paint() }; $('#wp', s).onclick = () => { i = Math.max(0, i - 1); paint() }
});

/* ---------- CALIFICACIONES ---------- */
let rtTab = 'mis';
V.calificaciones = () => {
  const rated = Object.entries(A.META).filter(([id, m]) => m.rating && A.byId(id)), al = Object.entries(A.ALRATE).filter(([, v]) => v);
  const avg = rated.length ? rated.reduce((a, [, m]) => a + m.rating, 0) / rated.length : 0, t = A.byId(P.cur);
  const circ = v => [0, 1, 2, 3, 4].map(i => { const f = v - i * 2; return `<span style="display:inline-block;width:18px;height:18px;border-radius:50%;border:2px solid var(--p);background:${f >= 2 ? 'var(--p)' : f === 1 ? 'linear-gradient(90deg,var(--p) 50%,transparent 50%)' : 'none'}"></span>` }).join(' ');
  let h = top({ back: 1 }) + `<div style="display:flex;gap:14px;align-items:center">${badge('leaderboard', 'sm')}<div><h1 class="h1" style="margin:0">Calificaciones</h1><div class="sub">Tus rankings de canciones y álbumes, y las votaciones de tus Spots</div></div></div>
   <div class="chips" style="margin:14px 0"><button class="chip${rtTab === 'mis' ? ' on' : ''}" data-a="rttab" data-v="mis">${ms('stars')}Mis calificaciones</button><button class="chip${rtTab === 'spots' ? ' on' : ''}" data-a="rttab" data-v="spots">${ms('groups')}De los Spots</button></div>`;
  if (rtTab === 'spots') { const V2 = A._votes || []; if (!A._votesLoaded && A.session) { A._votesLoaded = 1; A.sb().from('aeffy_spot_votes').select('*').order('at', { ascending: false }).limit(200).then(({ data }) => { A._votes = data || []; A.render() }) } const mine = V2.filter(x => x.voter_id === A.session?.user.id), recv = V2.filter(x => x.host_id === A.session?.user.id && x.voter_id !== A.session?.user.id); const avg = recv.length ? recv.reduce((a, b) => a + b.value, 0) / recv.length : 0; return h + `<div class="sgrid">${stt('how_to_vote', 'Votaciones', mine.length)}${stt('thumb_up', 'Votos recibidos', recv.length)}<div class="st" style="grid-column:1/-1"><small>${ms('functions')}Media general</small><b>${avg ? avg.toFixed(1).replace('.', ',') : '—'}</b></div></div>` + (V2.length ? `<div class="sech"><h2>Votaciones de los Spots</h2><p>Cada votación guarda quién votó y cuánto</p></div>` + V2.map(x => `<div class="li"><div class="ph">${ms('how_to_vote')}</div><div class="t"><b>${esc(x.title || '')}</b><span>${esc(x.voter_name || '')} · ${esc(x.artist || '')}</span></div><span class="end"><b style="color:var(--p);font-size:16px">${x.value}</b>/10</span></div>`).join('') : `<section class="card c" style="margin-top:14px">${badge('groups')}<h3>Aún no hay votaciones</h3><p>Abre un Spot y toca «Lanzar votación». Las votaciones de los Spots en los que participas también se guardan aquí.</p></section>`) }
  h += `<div class="sgrid">${stt('music_note', 'Canciones calificadas', rated.length)}${stt('album', 'Álbumes', al.length)}<div class="st" style="grid-column:1/-1"><small>${ms('functions')}Tu media</small><b>${avg ? avg.toFixed(1).replace('.', ',') : '—'}</b><div style="margin-top:6px">${circ(Math.round(avg))}</div></div></div>`;
  if (t) h += `<section class="card" style="margin-top:14px;background:var(--pc);color:var(--onpc)"><div class="label" style="color:inherit">Sonando ahora</div><div class="li">${cov(t, 's48')}<div class="t"><b>${esc(t.name)}</b><span style="color:inherit;opacity:.8">${esc(t.artist)}</span></div><button class="btn t" data-a="rate" data-id="${t.id}">${(A.META[t.id] || {}).rating ? (A.META[t.id].rating + ' de 10') : 'Calificar'}</button></div></section>`;
  h += `<div class="sech carh"><h2>Tus canciones</h2></div>` + (rated.length ? rated.sort((a, b) => b[1].rating - a[1].rating).map(([id, m]) => { const x = A.byId(id); return `<div class="li" data-a="rate" data-id="${id}">${cov(x, 's48')}<div class="t"><b>${esc(x.name)}</b><span>${esc(x.artist)}</span></div><span class="end"><b style="color:var(--p);font-size:16px">${m.rating}</b>/10</span></div>` }).join('') : `<p class="muted small">Califica desde el reproductor con el botón de la flor.</p>`);
  h += `<div class="sech carh"><h2>Tus álbumes</h2><button class="btn t" data-a="pickalbum">${ms('add')}Calificar un álbum</button></div>` + (al.length ? al.map(([k, v]) => { const g = A.albums().find(a => a.name === k); return `<div class="li" data-a="ratealbum" data-k="${esc(k)}">${cov(g && g.cv, 's48')}<div class="t"><b>${esc(k)}</b><span>${esc(g ? g.artist : '')}</span></div><span class="end"><b style="color:var(--p);font-size:16px">${v}</b>/10</span></div>` }).join('') : `<section class="card c">${badge('contrast')}<h3>Todavía no calificas nada</h3><p>Elige un álbum y llena los círculos: medio círculo vale 1 punto y uno lleno vale 2; cinco llenos son 10.</p><button class="btn t" data-a="pickalbum">${ms('album')}Elegir un álbum</button></section>`);
  return h
};
on('rttab', el => { rtTab = el.dataset.v; A.render() });
on('pickalbum', () => A.sheet(A.shead('album', 'Elige un álbum') + A.albums().map(g => `<button class="mi" data-a="ratealbum2" data-k="${esc(g.name)}">${cov(g.cv, 's40')}${esc(g.name)}<span class="end">${esc(g.artist)}</span></button>`).join('') || '<p class="muted">Agrega música primero.</p>'));
on('ratealbum2', el => { A.popLayer(); setTimeout(() => A.ACT.ratealbum(el), 260) });

/* ---------- AMIGOS ---------- */
V.amigos = () => top({ back: 1 }) + `<h1 class="h1">Amigos</h1>` + (A.session ? `<section class="card" style="background:linear-gradient(160deg,var(--pcl),var(--pc));color:var(--onpc)"><div style="display:flex;gap:14px;align-items:center"><span class="avatar" style="width:56px;height:56px">${shp('cookie')}${A.avImg()}</span><div><b style="font-family:var(--hf);font-size:20px">${esc(A.me?.display_name || 'Tú')}</b><div style="opacity:.85">${A.me?.handle ? '@' + esc(A.me.handle) : 'Elige tu @nombre para que te encuentren'}</div></div></div><div class="row2" style="margin-top:14px"><button class="btn" data-a="go" data-v="ajustes/perfil">${ms('alternate_email')}${A.me?.handle ? 'Cambiar @nombre' : 'Elegir @nombre'}</button><button class="btn t" data-a="go" data-v="invita">${ms('redeem')}Invita y gana</button></div></section><div class="sech"><h2>Tus amigos</h2><p>Cuando tus amigos escuchen algo, aparecerá aquí.</p></div><section class="card c">${badge('group')}<h3>Aún no tienes amigos aquí</h3><p>Comparte tu enlace para que te agreguen.</p></section>`
  : `<section class="card" style="background:linear-gradient(160deg,var(--pcl),var(--pc));color:var(--onpc);margin-top:12px"><div style="height:90px;display:grid;place-items:center">${ms('group', 1)}</div><h2 style="font-size:24px">Inicia sesión para tener amigos</h2><p style="opacity:.85">Con tu cuenta de aeffy tienes una tarjeta con tu @nombre y un enlace para que te agreguen. Es gratis.</p><button class="btn" data-a="login">${ms('login')}Iniciar sesión</button></section>`);

/* ---------- INVITA Y GANA ---------- */
V.invita = () => {
  const link = A.me?.handle ? 'https://aeffy.vercel.app/invita/' + A.me.handle : '';
  setTimeout(async () => { const r = await A.invites(); const a = $('#invJ'), b = $('#invC'), c = $('#invH'); if (a) { a.textContent = r.joined; b.textContent = r.confirmed; c.textContent = r.confirmed * 12 + ' h' } }, 0);
  return top({ back: 1 }) + `<section class="card" style="margin-top:8px;background:linear-gradient(160deg,var(--pcl),hsl(calc(var(--h) + 40) 30% 28%));color:var(--onpc)">${badge('redeem', 'sm')}<h2 style="font-size:26px;margin:14px 0 6px">Invita y gana Premium</h2><p style="opacity:.85;margin:0 0 14px">Cada amigo que llegue con tu enlace, inicie sesión y escuche 30 minutos te da 12 h de aeffy Premium.</p><div class="carh" style="align-items:flex-end"><div style="display:flex;align-items:baseline;gap:8px"><b id="invC" style="font-family:var(--hf);font-size:48px">0</b><span>amigos confirmados</span></div><div style="text-align:right"><b id="invH" style="font-family:var(--hf);font-size:20px">0 h</b><div class="small" style="opacity:.8">de Premium ganadas</div></div></div></section>
  <section class="card" style="margin-top:12px"><h3>Tu enlace de invitación</h3>${!A.session ? `<p class="muted small">Inicia sesión para tener tu enlace.</p><button class="btn" data-a="login">Iniciar sesión</button>` : link ? `<div class="search" style="margin:10px 0 0"><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(link)}</span><button class="btn t" data-a="copyinv" data-v="${esc(link)}">${ms('content_copy')}Copiar</button></div>` : `<p class="muted small">Elige tu @usuario en tu perfil y aquí aparecerá tu enlace.</p><button class="btn t" data-a="go" data-v="ajustes/perfil">Elegir @usuario</button>`}</section>
  <div class="sgrid" style="margin-top:12px">${stt('person_add', 'Se unieron', '<span id="invJ">0</span>')}${stt('check_circle', 'Confirmados', '—')}</div>`
};
on('copyinv', async el => { try { if (navigator.share) await navigator.share({ title: 'aeffy', text: 'Escucha tu música conmigo en aeffy', url: el.dataset.v }); else { await navigator.clipboard.writeText(el.dataset.v); toast('Enlace copiado') } } catch (e) { } });

/* ---------- INFORMACIÓN ---------- */
V.info = () => top({ back: 1 }) + `<h1 class="h1">Información</h1><section class="card" style="background:linear-gradient(160deg,var(--pcl),var(--pc));color:var(--onpc);margin-top:10px"><div style="display:flex;gap:14px;align-items:center">${A.logo(72, '#fff', 'var(--pc)')}<div><div style="font-family:'Great Vibes',cursive;font-size:46px;line-height:1">aeffy</div><span class="lock" style="background:rgba(0,0,0,.25);color:#fff">Versión 1.0</span> <span class="lock" style="background:var(--p);color:var(--onp)">Beta</span></div></div><p style="opacity:.85">Estás al día</p><button class="btn t" data-a="checkupd">${ms('sync')}Buscar actualizaciones</button></section>
  <div class="sg">Creadora</div><section class="card" style="display:flex;gap:14px;align-items:center"><span class="avatar" style="width:56px;height:56px">${shp('flower')}<b style="color:var(--onp)">M</b></span><div><b style="font-family:var(--hf);font-size:18px">Mefi</b><div class="muted small">Creadora y desarrolladora de aeffy</div></div></section>
  <p class="muted small" style="text-align:center;margin-top:24px">Hecho con cariño para quien todavía guarda su música.</p>`;
on('checkupd', async () => { try { const r = await navigator.serviceWorker?.getRegistration(); if (r) { await r.update(); toast('Estás en la última versión') } else toast('Estás en la última versión') } catch (e) { toast('Estás en la última versión') } });

/* ---------- AJUSTES ---------- */
const SEC = [
  ['Cuenta', [['cuenta', 'account_circle', 'Cuenta', 'Sesión, datos de la cuenta y seguridad'], ['privacidad', 'shield', 'Datos y privacidad', ''], ['perfil', 'badge', 'Editar perfil', 'Foto, portada, nombre y más'], ['premium', 'crown', 'aeffy Premium', '']]],
  ['Aspecto', [['apariencia', 'palette', 'Apariencia', '']]],
  ['Música', [['biblioteca', 'folder', 'Biblioteca local', ''], ['reproduccion', 'play_circle', 'Reproducción', ''], ['eq', 'tune', 'Ecualizador y Tono', ''], ['letra', 'mic', 'Letra', '']]],
  ['Conexiones y datos', [['spots', 'podcasts', 'Spots', ''], ['recast', 'devices', 'aeffy Recast', ''], ['copias', 'inventory_2', 'Copias e historial', '']]],
  ['aeffy', [['info', 'info', 'Información', '']]]];
let sq = '';
V.ajustes = arg => {
  if (arg) return (SUB[arg] || (() => notFound()))();
  const f = sq.trim().toLowerCase();
  let h = top({ back: 1, right: '' }) + `<h1 class="h1" style="font-size:36px">Ajustes</h1><label class="search">${ms('search')}<input id="sq" type="search" placeholder="Buscar ajustes" value="${esc(sq)}"></label>`;
  if (!f) h += `<button class="si" data-a="setgo" data-v="cuenta" style="background:var(--pc);color:var(--onpc);border-radius:24px"><span class="avatar" style="width:48px;height:48px">${shp('cookie')}${A.me ? `${A.avImg()}` : ms('person')}</span><span class="t"><b style="font-family:var(--hf);font-size:18px">${A.me ? esc(A.me.display_name || 'Tu cuenta') : 'Sin cuenta'}</b><span style="color:inherit;opacity:.85">Cuenta · Sesión, datos de la cuenta y seguridad</span></span><span>${ms('chevron_right')}</span></button>`;
  SEC.forEach(([g, items]) => { const it = items.filter(x => !f || (x[2] + ' ' + g).toLowerCase().includes(f)); if (!it.length) return; h += `<div class="sg">${g}</div><div class="sgrp">${it.map(([k, i, n]) => `<button class="si" data-a="setgo" data-v="${k}"><span class="ic">${ms(i)}</span><span class="t"><b>${n}</b></span><span class="chev">${ms('chevron_right')}</span></button>`).join('')}</div>` });
  if (A.isAdmin) h += `<div class="sg">Administración</div><div class="sgrp"><button class="si" data-a="admin"><span class="ic">${ms('admin_panel_settings')}</span><span class="t"><b>Panel de administradora</b><span>Usuarios, Premium, códigos, precios y PayPal</span></span><span class="chev">${ms('chevron_right')}</span></button></div>`;
  return h
};
const notFound = () => top({ back: 1 }) + '<p class="muted">No encontré ese ajuste.</p>';
on('setgo', el => { const v = el.dataset.v; if (v === 'cuenta') A.go('cuenta'); else if (v === 'premium') A.go('premium'); else if (v === 'info') A.go('info'); else A.go('ajustes/' + v) });
on('admin', () => { location.href = '/admin.html' });
document.addEventListener('input', e => { if (e.target.id === 'sq') { sq = e.target.value; const p = e.target.selectionStart; A.render(); const i = $('#sq'); if (i) { i.focus(); i.setSelectionRange(p, p) } } });
const head = t => top({ back: 1 }) + `<div class="sub" style="margin-top:-4px">Ajustes</div><h1 class="h1" style="font-size:30px">${t}</h1>`;
const item = (i, b, s, end) => `<div class="si">${i ? `<span class="ic">${ms(i)}</span>` : ''}<span class="t"><b>${b}</b>${s ? `<span>${s}</span>` : ''}</span>${end || ''}</div>`;
const SUB = {
  privacidad: () => head('Datos y privacidad') + `<div class="sg">Tus datos</div><div class="sgrp">${item('smartphone', 'Tu música se queda contigo', 'Tus canciones, historial y estadísticas viven en este teléfono. aeffy no sube tus archivos a ningún lado.')}${item('cloud', 'Con cuenta', 'Tu perfil, tu @nombre, tus minutos totales y tu Premium se guardan en tu cuenta para seguirte a otros dispositivos.')}${item('visibility', 'Lo que ven tus amigos', 'Qué escuchas ahora y desde hace cuánto.', sw('showFriends', A.ST.showFriends))}</div><div class="sg">Borrar</div><div class="sgrp"><button class="si" data-a="wipe"><span class="ic">${ms('delete_sweep')}</span><span class="t"><b>Borrar biblioteca y estadísticas</b><span>Quita todo lo que agregaste en este teléfono. Tus archivos originales no se tocan.</span></span></button></div>`,
  perfil: () => { const me = A.me; if (!A.session) return head('Editar perfil') + `<div class="sg">Cuenta aeffy</div><div class="sgrp">${item('account_circle', 'Esto va con tu cuenta', 'Sirve para tus amigos y para aeffy Premium.', `<button class="btn" data-a="login">Iniciar sesión</button>`)}</div>`;
    const col = me?.color ? `--ph:${+me.color};` : '';
    return head('Editar perfil') + `<form id="pf">
     <div class="pfedit"><button type="button" class="ban${me?.banner_url ? ' img' : ''}" id="pfBan" style="${col}${me?.banner_url ? `background-image:url('${esc(me.banner_url)}')` : ''}" data-a="pfpick" data-k="banner"><span class="pfcam">${ms('photo_camera')}Cambiar portada</span></button>
     <button type="button" class="avatar pfav" id="pfAv" data-a="avmenu">${shp('flower')}${A.avImg(A.me, 'flower')}<span class="pfcam2">${ms('photo_camera', 1)}</span></button></div>
     <div class="row2" style="justify-content:center;margin:6px 0 10px">${me?.avatar_url ? `<button type="button" class="btn g" data-a="pfrm" data-k="avatar">Quitar foto</button>` : ''}${me?.banner_url ? `<button type="button" class="btn g" data-a="pfrm" data-k="banner">Quitar portada</button>` : ''}</div>
     <div class="row2" style="justify-content:center;margin:0 0 12px"><button type="button" class="btn t" data-a="avshape">${ms('interests')}Forma y animación</button></div><input type="file" id="pfFile" accept="image/*" hidden>
     <label class="fld"><small>Nombre visible</small><input id="pfN" maxlength="40" value="${esc(me?.display_name || '')}"></label>
     <label class="fld"><small>@nombre (sin espacios)</small><input id="pfH" maxlength="24" value="${esc(me?.handle || '')}" autocapitalize="off" autocomplete="off"></label>
     <label class="fld"><small>Sobre ti</small><textarea id="pfB" maxlength="160" rows="3" placeholder="Cuéntale a tus amigos qué música te mueve" oninput="this.parentNode.querySelector('.pfcnt').textContent=this.value.length+'/160'">${esc(me?.bio || '')}</textarea><span class="pfcnt" style="display:block;text-align:right;font-size:12px;opacity:.7">${(me?.bio || '').length}/160</span></label>
     <div class="sg">Color de tu perfil ${lock('profile_color')}</div><div class="swatches" id="pfC">${[['', 'Del tema', 222], ...A.SWATCHES.map(x => [String(x.h), x.n, x.h]), ['330', 'Rosa', 330], ['280', 'Lila', 280]].map(([v, n, h]) => `<button type="button" class="swatch${(me?.color || '') === v ? ' on' : ''}" data-c="${v}"><i><svg viewBox="0 0 100 100"><path d="${A.SH.cookie}" fill="hsl(${h} 70% 70%)"/></svg></i>${n}</button>`).join('')}</div>
     <div class="sg">Quién ve lo que escuchas</div><div class="seg" id="pfV">${[['friends', 'Mis amigos'], ['nobody', 'Nadie']].map(([k, n]) => `<button type="button" data-v="${k}" class="${(me?.visibility || 'friends') === k ? 'on' : ''}">${n}</button>`).join('')}</div><div class="foot"><button class="btn">Guardar</button></div></form>` },
  apariencia: () => head('Apariencia') + `<div class="sg">Tema</div><div class="sgrp"><div class="si"><span class="t"><b>Modo de tema</b><span>Automático sigue el tema claro u oscuro de tu teléfono.</span></span></div><div style="padding:0 16px 14px"><div class="seg">${[['auto', 'brightness_auto', 'Automático'], ['light', 'light_mode', 'Claro'], ['dark', 'dark_mode', 'Oscuro']].map(([k, i, n]) => `<button class="${A.ST.mode === k ? 'on' : ''}" data-a="setv" data-k="mode" data-v="${k}">${ms(i)}${n}</button>`).join('')}</div></div>
   ${item('', 'Fondo negro puro (AMOLED)', 'Usa negro puro (#000000) en la superficie principal del tema oscuro.', sw('amoled', A.ST.amoled))}${item('', 'Recordar dónde te quedaste', 'Al volver, sigue donde lo dejaste en vez de empezar en Inicio.', sw('remember', A.ST.remember))}</div>
   <div class="sg">Color de la app</div><div class="sgrp"><div class="si"><span class="t"><span>Elige el color base de la interfaz. El reproductor se tiñe además con los colores de cada portada.</span></span></div><div class="swatches">${A.SWATCHES.map(s => `<button class="swatch${A.ST.color === s.k ? ' on' : ''}" data-a="setv" data-k="color" data-v="${s.k}"><i><svg viewBox="0 0 100 100"><defs><linearGradient id="g${s.k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${s.h} ${Math.round(s.s * 90)}% 86%)"/><stop offset="1" stop-color="hsl(${s.h} ${Math.round(s.s * 60)}% 58%)"/></linearGradient></defs><path d="${A.SH.cookie}" fill="url(#g${s.k})"/></svg></i>${s.n}</button>`).join('')}</div>
   ${item('', 'Color neutral', 'Toda la interfaz en grises. La portada sigue dando color al reproductor.', sw('neutral', A.ST.neutral))}${item('', 'Color de la portada', 'Toda la app toma el color de la portada de la canción que suena, en lugar del color elegido.', sw('coverColor', A.ST.coverColor))}</div>`,
  biblioteca: () => { const folders = [...new Set(A.tracks.map(t => (t.folder || '').split('/')[0]).filter(Boolean))]; return head('Biblioteca local') + `<div class="sg">Carpetas de tu biblioteca</div><div class="sgrp"><div class="si"><span class="t"><span>aeffy guarda una copia de tu música dentro de la app para que suene aunque no tengas internet. Tus archivos originales no se mueven ni cambian.</span></span></div>${folders.length ? folders.map(f => item('folder', esc(f), plural(A.tracks.filter(t => (t.folder || '').startsWith(f)).length, 'canción', 'canciones'))).join('') : item('', 'Aún no hay carpetas: agrega una para empezar.', '')}
   <div style="padding:12px 16px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn t" data-a="import-dir">${ms('create_new_folder')}Agregar carpeta</button><button class="btn o" data-a="import">${ms('note_add')}Agregar canciones</button></div><div class="si"><span class="t"><span>${plural(A.tracks.length, 'canción', 'canciones')} · ${A.tracks.filter(t => t.bits > 16 || t.sr > 48000).length} Hi-Res</span></span></div></div>
   <div class="sg">Importar lista de reproducción (.M3U / .M3U8)</div><div class="sgrp"><div class="si"><span class="t"><span>Vincula automáticamente tus archivos con las canciones que ya tienes.</span></span></div><div style="padding:0 16px 14px"><button class="btn t" data-a="m3u">${ms('upload_file')}Importar .M3U8</button></div></div>` },
  reproduccion: () => head('Reproducción') + `<div class="sg">Segundo plano</div><div class="sgrp">${item('battery_saver', 'Seguir sonando con la pantalla apagada', 'Instala aeffy en tu pantalla de inicio para que el teléfono no la pause.', sw('background', A.ST.background))}</div>
   <div class="sg">Transiciones (Crossfade) y volumen</div><div class="sgrp">${item('', 'Transición suave entre canciones (Crossfade)', 'Ventana actual: ' + A.ST.xfade + ' segundos', sw('crossfade', A.ST.crossfade))}<div class="rng"><input type="range" min="1" max="12" step="1" value="${A.ST.xfade}" data-set="xfade" aria-label="Segundos de crossfade"></div>
   ${item('', 'Normalización de volumen', 'Iguala el volumen entre canciones para que ninguna te sorprenda.', sw('normalize', A.ST.normalize))}<div style="padding:0 16px 14px"><div class="sub" style="margin-bottom:8px">Nivel</div><div class="seg">${['silencioso', 'normal', 'alto'].map(k => `<button class="${A.ST.rgLevel === k ? 'on' : ''}" data-a="setv" data-k="rgLevel" data-v="${k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div></div></div>
   <div class="sg">Velocidad y Temporizador de sueño</div><div class="sgrp">${item('speed', 'Velocidad', '', `<select data-set="speed" style="background:var(--s3);border:0;border-radius:10px;height:36px;padding:0 10px">${[.5, .75, .9, 1, 1.1, 1.25, 1.5, 2].map(v => `<option value="${v}"${+A.ST.speed === v ? ' selected' : ''}>${v.toFixed(2)}x${v === 1 ? ' · normal' : ''}</option>`).join('')}</select>`)}${item('bedtime', 'Temporizador de sueño', P.sleepAt ? 'Se pausa a las ' + new Date(P.sleepAt).toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit' }) : 'Detiene la música automáticamente tras el tiempo elegido', `<button class="btn t" data-a="sleep">${ms('timer')}Configurar</button>`)}</div>`,
  eq: () => head('Ecualizador y Tono') + `<div class="sg">Ecualizador gráfico de 12 bandas</div><div class="sgrp">${item('', 'Activar ecualizador de 12 bandas', '', sw('eqOn', A.ST.eqOn))}<div style="padding:4px 16px 12px;display:flex;flex-direction:column;gap:8px;align-items:flex-start">${Object.keys(A.EQP).map(k => `<button class="chip${A.EQP[k].every((v, i) => v === A.ST.eq[i]) ? ' on' : ''}" data-a="eqp" data-v="${esc(k)}" style="border:1px solid var(--line);background:${A.EQP[k].every((v, i) => v === A.ST.eq[i]) ? 'var(--p)' : 'none'}">${esc(k)}</button>`).join('')}</div>
   <div class="eqbars">${A.EQF.map((f, i) => `<label><span id="eqv${i}">${A.ST.eq[i] > 0 ? '+' : ''}${A.ST.eq[i]}</span><input type="range" min="-12" max="12" step=".5" value="${A.ST.eq[i]}" data-eq="${i}" aria-label="${f} Hz">${f >= 1000 ? f / 1000 + 'k' : f}</label>`).join('')}</div></div>
   <div class="sg">Graves, Medios, Agudos y Balance estéreo</div><div class="sgrp">${[['bass', 'Graves (< 180 Hz)', -12, 12], ['mid', 'Medios', -12, 12], ['treble', 'Agudos (> 5 kHz)', -12, 12], ['balance', 'Balance estéreo (I/D)', -1, 1]].map(([k, n, a, b]) => `<div class="rng" style="padding-top:12px"><div class="h"><span>${n}</span><b id="tv_${k}">${k === 'balance' ? (A.ST.balance == 0 ? 'Centro' : (A.ST.balance < 0 ? 'I ' : 'D ') + Math.abs(Math.round(A.ST.balance * 100)) + '%') : (A.ST[k] > 0 ? '+' : '') + (+A.ST[k]).toFixed(1) + ' dB'}</b></div><input type="range" min="${a}" max="${b}" step="${k === 'balance' ? .05 : .5}" value="${A.ST[k]}" data-set="${k}" aria-label="${n}"></div>`).join('')}<div style="padding:4px 16px 12px"><button class="btn g" data-a="resettone">${ms('restart_alt')}Restablecer tono y balance</button></div>
   ${item('', 'Volumen constante', 'Compensa el volumen general que añade el ecualizador para que la música suene igual de fuerte.', sw('constVol', A.ST.constVol))}${item('', 'Protección estricta de picos', 'Baja todo el volumen lo justo para que nada sature nunca.', sw('limiter', A.ST.limiter))}</div>`,
  letra: () => head('Letra') + `<div class="sg">Cómo se ven</div><div class="sgrp">${item('', 'Modo karaoke ' + lock('karaoke'), 'La línea que suena se llena palabra por palabra.', A.can('karaoke') ? sw('karaoke', A.ST.karaoke) : `<button class="btn t" data-a="go" data-v="premium">Ver</button>`)}</div>
   <div class="sg">Sincronización de letras (.LRC y LRCLIB)</div><div class="sgrp">${item('', 'Buscar letras automáticamente', 'Cuando suena una canción sin letra, aeffy la busca en LRCLIB.', sw('autoLyrics', A.ST.autoLyrics))}${item('', 'Buscar letra sincronizada en LRCLIB', 'Pista actual: ' + esc(A.byId(P.cur)?.name || '—'), `<button class="btn t" data-a="lrcnow">${ms('cloud_download')}Buscar .LRC</button>`)}${item('', 'Editor de etiquetas y letras', 'Edita título, artista, álbum y la letra de la pista actual.', `<button class="btn t" data-a="editly">${ms('edit')}Editar pista</button>`)}</div>`,
  spots: () => head('Spots') + `<div class="sg">Personaliza tu Spot</div><section class="card" style="background:linear-gradient(160deg,var(--pcl),var(--pc));color:var(--onpc)"><div class="label" style="color:inherit">${ms('podcasts')}Spot</div><h2 style="font-size:24px;margin:6px 0">Spot de ${esc(A.me?.display_name || 'Anfitrión')}</h2><span class="small">${A.ST.spotPeople} personas</span></section>
   <div class="sg">¿Quién puede entrar?</div><div class="sgrp">${[['open', 'Abierto a amigos', 'Tus amigos ven tu Spot en su Inicio y entran sin invitación.'], ['ask', 'Amigos, con tu permiso', 'Te llega un aviso para aceptar o rechazar.'], ['invite', 'Solo con invitación', 'Entra quien tenga el enlace.']].map(([k, b, s]) => `<button class="si" data-a="setv" data-k="spotMode" data-v="${k}"><span class="ic">${ms((A.ST.spotMode || 'open') === k ? 'radio_button_checked' : 'radio_button_unchecked')}</span><span class="t"><b>${b}</b><span>${s}</span></span></button>`).join('')}</div>
   <div class="sg">Capacidad</div><div class="sgrp">${item('groups', 'Hasta ' + A.ST.spotPeople + ' personas', 'Cuántas personas caben en tus Spots, contándote.', `<select data-set="spotPeople" style="background:var(--s3);border:0;border-radius:10px;height:36px;padding:0 10px">${[2, 3, 4, ...(A.can('spots_12') ? [6, 8, 10, 12] : [])].map(v => `<option${+A.ST.spotPeople === v ? ' selected' : ''}>${v}</option>`).join('')}</select>`)}</div>
   <div class="sg">Permisos</div><div class="sgrp">${item('', 'Solo usuarios registrados', 'Los invitados entran con su cuenta de aeffy.', sw('spotOnlyUsers', A.ST.spotOnlyUsers))}${item('', 'Los invitados pueden controlar la reproducción', 'Pausar, saltar y volver atrás.', sw('spotControl', A.ST.spotControl))}</div>
   <div class="sg">Cola de los Spots que creas</div><div class="sgrp">${item('', 'Reglas inteligentes', 'Las canciones se turnan entre las personas del Spot.', sw('smartQueue', A.ST.smartQueue))}</div>`,
  recast: () => head('aeffy Recast') + `<div class="sg">Este dispositivo</div><div class="sgrp">${item('cast', 'Usar aeffy Recast', 'Controla aeffy desde tus otros dispositivos con la misma cuenta, y pasa la música de uno a otro.', sw('recast', A.ST.recast !== false))}<div style="padding:0 16px 14px"><label class="fld"><small>Nombre de este dispositivo</small><input id="devName" value="${esc(localStorage.getItem('ae_devname') || '')}" placeholder="Ej.: Teléfono de Mefi"></label></div></div>`,
  copias: () => head('Copias e historial') + `<div class="sg">Copias de seguridad</div><div class="sgrp"><div class="si"><span class="t"><span>Tu historial, reproducciones, favoritos, calificaciones y playlists viven en este teléfono. Una copia los guarda en un archivo para recuperarlos si cambias de teléfono. Tu música no se copia.</span></span></div><div style="padding:0 16px 14px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-a="backup">${ms('save')}Crear copia ahora</button><button class="btn o" data-a="restore">${ms('upload')}Restaurar una copia…</button></div>${item('', 'Copia automática diaria', 'Última: ' + (localStorage.getItem('ae_lastbk') || 'nunca'), sw('backupAuto', A.ST.backupAuto))}</div>
   <div class="sg">Importar tu historial ${lock('history_import')}</div><div class="sgrp"><div class="si"><span class="t"><span>Trae lo que escuchaste en otros sitios: tus estadísticas y tus mixes tendrán en cuenta años pasados. Todo se procesa en tu teléfono.</span></span></div>${item('csv', 'Archivo CSV', 'Una fila por escucha, con columnas de fecha, artista y canción (álbum y duración, si los tienes).', `<button class="btn t" data-a="csv">Importar</button>`)}${item('', 'Spotify', 'Pide tus datos en Spotify → Privacidad → «Historial de reproducción ampliado» y sube los JSON.', `<button class="btn t" data-a="spjson">Importar</button>`)}</div>`
};
SUB.perfil.after = 1;
let pfKind = 'avatar';
on('pfpick', el => { pfKind = el.dataset.k; const i = $('#pfFile'); if (!i) return; i.value = ''; i.onchange = async () => { const file = i.files[0]; if (!file) return; toast('Subiendo foto…'); const url = await A.uploadPic(file, pfKind); if (!url) return; if (await A.saveProfileExtra(pfKind === 'avatar' ? { avatar: url } : { banner: url })) { toast(pfKind === 'avatar' ? 'Foto de perfil lista' : 'Portada lista'); A.render() } }; i.click() });
on('pfrm', async el => { if (await A.saveProfileExtra(el.dataset.k === 'avatar' ? { avatar: '' } : { banner: '' })) { toast('Listo'); A.render() } });
A.afterRender = v => {
  const f = $('#pf'); if (f) {
    $$('#pfV button').forEach(b => b.onclick = () => { $$('#pfV button').forEach(x => x.classList.toggle('on', x === b)) });
    $$('#pfC button').forEach(b => b.onclick = () => { if (b.dataset.c && !A.can('profile_color')) { A.go('premium'); return } $$('#pfC button').forEach(x => x.classList.toggle('on', x === b)); const h = b.dataset.c; $('#pfBan').style.setProperty('--ph', h || ''); $('#pfAv').style.setProperty('--ph', h || '') });
    f.onsubmit = async e => { e.preventDefault(); const b = f.querySelector('.foot .btn'); b.disabled = true;
      const ok = await A.updateProfile($('#pfN').value, $('#pfH').value, ($('#pfV .on') || {}).dataset?.v);
      const c = ($('#pfC .on') || {}).dataset?.c ?? ''; const ok2 = ok && await A.saveProfileExtra({ bio: $('#pfB').value, color: A.can('profile_color') ? c : null });
      b.disabled = false; if (ok && ok2) { toast('Perfil guardado'); A.go('perfil') } } }
};
on('set', el => { const k = el.dataset.k; A.ST[k] = k === 'recast' ? A.ST[k] === false : !A.ST[k]; A.saveSet(); el.classList.toggle('on', A.ST[k]); el.setAttribute('aria-checked', A.ST[k]); A.applyAudio(); if (['amoled', 'neutral', 'coverColor'].includes(k)) A.repaint(); if (k === 'crossfade') A.render(); if (k === 'showFriends') A.publishNow && A.publishNow() });
on('setv', el => { const k = el.dataset.k; A.ST[k] = el.dataset.v; A.saveSet(); A.repaint(); A.applyAudio(); A.render() });
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.eq != null) { const i = +t.dataset.eq; A.ST.eq[i] = +t.value; if (!A.ST.eqOn) { A.ST.eqOn = true } A.saveSet(); A.applyAudio(); const s = $('#eqv' + i); if (s) s.textContent = (t.value > 0 ? '+' : '') + t.value }
  else if (t.dataset.set) { const k = t.dataset.set; A.ST[k] = +t.value; A.saveSet(); A.applyAudio(); if (k === 'speed') P.au.playbackRate = A.ST.speed; const o = $('#tv_' + k); if (o) o.textContent = k === 'balance' ? (A.ST.balance == 0 ? 'Centro' : (A.ST.balance < 0 ? 'I ' : 'D ') + Math.abs(Math.round(A.ST.balance * 100)) + '%') : (A.ST[k] > 0 ? '+' : '') + A.ST[k].toFixed(1) + ' dB' }
});
document.addEventListener('change', e => { if (e.target.dataset.set === 'speed' || e.target.dataset.set === 'spotPeople') { A.ST[e.target.dataset.set] = +e.target.value; A.saveSet(); P.au.playbackRate = A.ST.speed; A.render() } if (e.target.dataset.set === 'xfade') A.render() });
on('eqp', el => { A.ST.eq = [...A.EQP[el.dataset.v]]; A.ST.eqOn = el.dataset.v !== 'Plano (bit-perfect)'; A.saveSet(); A.applyAudio(); A.render() });
on('resettone', () => { A.ST.bass = A.ST.mid = A.ST.treble = A.ST.balance = 0; A.saveSet(); A.applyAudio(); A.render() });
on('sleep', () => A.sheet(A.shead('bedtime', 'Temporizador de sueño') + [0, 15, 30, 45, 60, 90].map(m => `<button class="mi" data-a="sleepset" data-v="${m}">${ms(m ? 'timer' : 'timer_off')}${m ? m + ' minutos' : 'Apagado'}</button>`).join('')));
on('sleepset', el => { A.setSleep(+el.dataset.v); A.popLayer(); toast(+el.dataset.v ? 'Se pausa en ' + el.dataset.v + ' min' : 'Temporizador apagado'); setTimeout(A.render, 300) });
on('lrcnow', async () => { const t = A.byId(P.cur); if (!t) { toast('Pon una canción primero'); return } toast('Buscando…'); const x = await A.fetchLyrics(t, true); toast(x ? 'Letra encontrada' : 'No la encontré') });
on('wipe', () => A.sheet(A.shead('delete_sweep', '¿Borrar todo?', 'Se quitan tus canciones de aeffy, tus playlists y tus estadísticas en este teléfono. Tus archivos originales no se tocan.') + `<div class="foot"><button class="btn t" data-a="closesheet">Cancelar</button><button class="btn" style="background:var(--danger);color:#410" data-a="wipeok">Borrar todo</button></div>`));
on('wipeok', async () => { for (const t of [...A.tracks]) await A.deleteTrack(t.id); ['ae_stats', 'ae_meta', 'ae_lists', 'ae_alrate'].forEach(k => localStorage.removeItem(k)); location.reload() });

/* copias */
function backupData() { return JSON.stringify({ v: 1, app: 'aeffy', at: new Date().toISOString(), ST: A.ST, STS: A.STS, META: A.META, LISTS: A.LISTS, ALRATE: A.ALRATE, tracks: A.tracks.map(t => ({ ...t, cover: null })) }) }
A.backupData = backupData;
on('backup', () => { const b = new Blob([backupData()], { type: 'application/json' }); A.saveBlob(b, 'aeffy-copia-' + dkey(new Date()) + '.aeffybackup'); localStorage.setItem('ae_lastbk', new Date().toLocaleString('es')); toast('Copia creada') });
on('restore', () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.aeffybackup,.json'; i.onchange = async () => { try { const d = JSON.parse(await i.files[0].text()); if (d.app !== 'aeffy') throw 0; Object.assign(A.ST, d.ST); A.STS = d.STS; A.META = d.META; A.LISTS = d.LISTS; A.ALRATE = d.ALRATE || {}; A.saveSet(); A.saveStats(); A.saveMeta(); A.saveLists(); A.saveAlRate(); toast('Copia restaurada'); setTimeout(() => location.reload(), 800) } catch (e) { toast('Ese archivo no es una copia de aeffy') } }; i.click() });
on('m3u', () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.m3u,.m3u8'; i.onchange = async () => { const txt = await i.files[0].text(); const names = txt.split(/\r?\n/).filter(l => l && !l.startsWith('#')).map(l => l.split(/[\\/]/).pop().toLowerCase()); const ids = names.map(n => (A.tracks.find(t => (t.file || '').toLowerCase() === n) || {}).id).filter(Boolean); A.LISTS.unshift({ id: 'l' + Date.now().toString(36), name: A.base(i.files[0].name), ids }); A.saveLists(); toast(`Playlist creada con ${ids.length} de ${names.length} canciones`) }; i.click() });
function importPlays(rows) { let n = 0; rows.forEach(r => { const t = A.tracks.find(x => x.name.toLowerCase() === String(r.track || '').toLowerCase() && x.artist.toLowerCase() === String(r.artist || '').toLowerCase()); const d = new Date(r.date); if (isNaN(d)) return; const k = dkey(d), s = Math.min(600, (+r.ms || 180000) / 1000); A.STS.d[k] = (A.STS.d[k] || 0) + s; A.STS.h[d.getHours()] += s; A.STS.a[r.artist] = (A.STS.a[r.artist] || 0) + s; if (t) { A.STS.t[t.id] = (A.STS.t[t.id] || 0) + s; A.STS.plays[t.id] = (A.STS.plays[t.id] || 0) + 1 } n++ }); A.saveStats(); toast(`Importé ${n} escuchas`) }
on('csv', () => { if (!A.can('history_import')) { A.go('premium'); return } const i = document.createElement('input'); i.type = 'file'; i.accept = '.csv'; i.onchange = async () => { const L = (await i.files[0].text()).split(/\r?\n/).filter(Boolean); const hd = L.shift().toLowerCase().split(/[,;]/); const ix = k => hd.findIndex(h => h.includes(k)); const di = ix('fec') >= 0 ? ix('fec') : ix('date'), ai = ix('artist'), ti = ix('canci') >= 0 ? ix('canci') : ix('track') >= 0 ? ix('track') : ix('title'); importPlays(L.map(l => { const c = l.split(/[,;](?=(?:[^"]*"[^"]*")*[^"]*$)/).map(x => x.replace(/^"|"$/g, '')); return { date: c[di], artist: c[ai], track: c[ti] } })) }; i.click() });
on('spjson', () => { if (!A.can('history_import')) { A.go('premium'); return } const i = document.createElement('input'); i.type = 'file'; i.accept = '.json'; i.multiple = true; i.onchange = async () => { const rows = []; for (const f of i.files) { try { JSON.parse(await f.text()).forEach(r => rows.push({ date: r.ts || r.endTime, artist: r.master_metadata_album_artist_name || r.artistName, track: r.master_metadata_track_name || r.trackName, ms: r.ms_played || r.msPlayed })) } catch (e) { } } importPlays(rows.filter(r => r.artist)) }; i.click() });
}
/* aeffy · Herramientas */
'use strict';
{
const { $, $$, esc, ms, fmt, toast, shp, on, top, badge } = A;
const V = A.views;
const TOOLS = [
  { k: 'analizador', i: 'graphic_eq', n: 'Analizador de calidad de audio', d: 'Espectrograma completo y detección de falsos lossless: transcodificaciones y Hi-Res inflado.', s2: 'Resultado' },
  { k: 'remuestreador', i: 'airwave', n: 'Remuestreador de audio', d: 'Cambia la frecuencia de muestreo y la profundidad de bits con dither.', s2: 'Calidad' },
  { k: 'convertidor', i: 'swap_horiz', n: 'Convertidor de audio', d: 'Pasa tus canciones a WAV o MP3 conservando título, artista y portada.', s2: 'Formato' },
  { k: 'archivos', i: 'folder_managed', n: 'Administrador de archivos', d: 'Renombra tus canciones a partir de sus etiquetas, con vista previa.', s2: 'Nombres' },
  { k: 'enriquecedor', i: 'sell', n: 'Enriquecedor de metadatos', d: 'Completa etiquetas, año, pista, sello, ISRC y portada con MusicBrainz.', s2: 'Revisar' },
  { k: 'letras', i: 'lyrics', n: 'Administrador de letras', d: 'Busca, guarda y edita letras sincronizadas para tus canciones.', s2: 'Destino' },
  { k: 'creadores', i: 'album', n: 'Metadatos para creadores', d: 'Para tus propios lanzamientos: sello, UPC, ISRC, créditos y portada, escritos en tus archivos MP3.', s2: 'Lanzamiento' }];
const GUIDES = {
  analizador: [['equalizer', '¿Qué mira el analizador?', 'Dibuja el espectrograma: el tiempo de izquierda a derecha y las frecuencias de abajo arriba. Un archivo sin pérdida auténtico llega con energía hasta arriba.'], ['content_cut', 'El corte delator', 'Un MP3 o AAC recorta los agudos en 16, 19 o 20 kHz. Si un FLAC muestra ese corte, fue convertido desde un archivo con pérdida.'], ['verified', 'El veredicto', 'aeffy te dice si es lossless auténtico, una transcodificación o un Hi-Res inflado, y con cuánta seguridad.']],
  remuestreador: [['waves', '¿Qué es la frecuencia de muestreo?', 'El audio digital son fotos del sonido tomadas muy rápido. 44,1 kHz son 44 100 fotos por segundo: la calidad de un CD, que ya cubre todo lo que el oído humano puede oír.'], ['stairs', '¿Y la profundidad de bits?', 'Es la precisión de cada foto. 16 bits dan 96 dB de margen, de sobra para escuchar; 24 bits se usan para grabar y mezclar.'], ['trending_up', 'Subir no agrega calidad', 'Remuestrear a más kHz o bits inventa puntos intermedios: el archivo ocupa más pero suena igual. Úsalo solo cuando un programa o equipo lo necesite.'], ['blur_on', 'Dither: déjalo activado', 'Al bajar de 24 a 16 bits cada muestra se redondea. El dither añade un ruido mínimo, inaudible, que lo disimula.']],
  convertidor: [['compress', 'Sin pérdida y con pérdida', 'FLAC, ALAC y WAV guardan el audio completo. MP3, AAC y Opus descartan lo que menos se oye para ocupar hasta diez veces menos.'], ['block', 'Lo que se pierde no vuelve', 'Pasar un MP3 a WAV no recupera nada: solo crea un archivo más grande con el mismo sonido. Convierte desde el original de mejor calidad.'], ['tune', '¿Qué calidad elijo?', 'Más kbps es más fiel y más pesado. MP3 a 320 kbps suena casi idéntico al original.'], ['sell', 'Tus etiquetas viajan contigo', 'El archivo nuevo lleva el mismo título, artista, álbum y portada. El original nunca se modifica.']],
  archivos: [['text_fields', 'Nombres a partir de las etiquetas', 'Escribe una plantilla con piezas como {artist} o {title} y aeffy completa el nombre de cada canción. Adiós a «track01.flac».'], ['create_new_folder', 'La barra / crea carpetas', 'Separa con / para ordenar en carpetas: «{artist}/{album}/{track} - {title}».'], ['preview', 'Primero miras, luego aplicas', 'La lista muestra cómo quedará cada archivo antes de descargar nada.']],
  enriquecedor: [['travel_explore', '¿Qué hace el enriquecedor?', 'Busca cada canción en MusicBrainz, la enciclopedia musical libre, usando su título, artista y duración, y te propone el lanzamiento que mejor encaja.'], ['speed', 'Fíjate en la confianza', 'Cada coincidencia trae una confianza alta, media o baja. Las de confianza baja llegan desmarcadas: revísalas.'], ['table', 'Revisa antes de guardar', 'La tabla Ahora → Quedará resalta solo lo que va a cambiar. Nada se escribe hasta que toques Guardar cambios.'], ['image', 'Portadas oficiales', 'aeffy puede agregar la portada de Cover Art Archive a las canciones que no tienen.']],
  letras: [['schedule', 'Letras sincronizadas', 'Las letras LRC llevan una marca de tiempo en cada línea, así aeffy las ilumina al ritmo de la canción. Las de texto plano solo se muestran enteras.'], ['description', 'Dentro de aeffy o en un .lrc', 'La letra queda guardada en aeffy y también puedes descargarla como archivo .lrc con el mismo nombre de la canción.'], ['done_all', 'Todo de una vez', 'Elige varias canciones y toca Buscar las que faltan: aeffy consulta LRCLIB canción por canción.']],
  creadores: [['rocket_launch', 'Prepara tu lanzamiento', 'Escribe una vez los datos de tu sencillo, EP o álbum y los créditos de cada pista.'], ['qr_code_2', 'UPC, ISRC y sello', 'Los códigos que piden las distribuidoras viajan dentro de tus archivos.'], ['download', 'Nada cambia hasta que lo descargas', 'aeffy crea copias nuevas con las etiquetas escritas. Tus originales quedan intactos.']]
};
V.herramientas = arg => arg ? toolPage(arg) : top({ back: 1 }) + `<div style="display:flex;gap:14px;align-items:center">${badge('handyman', 'sm')}<div><h1 class="h1" style="margin:0">Herramientas</h1></div></div><p class="muted">Para quienes quieren control total sobre sus archivos de audio. Todo se procesa en tu teléfono.</p>
  ${TOOLS.map(t => `<button class="tool" data-a="go" data-v="herramientas/${t.k}"><span class="badge sm">${shp('sunny')}${ms(t.i, 1)}</span><span class="t"><b>${t.n}</b><span>${t.d}</span></span>${ms('chevron_right')}</button>`).join('')}
  <div class="card" style="margin-top:6px">${[['touch_app', 'Desde cualquier canción', 'Toca ⋮ en una canción → Editar etiquetas y letra.'], ['upload_file', 'Elige y suelta', 'Dentro de cada herramienta puedes elegir canciones o carpetas enteras del teléfono.'], ['shield', 'Tus originales, a salvo', 'Antes de cambiar nada ves cómo quedará, y siempre se descarga una copia nueva.']].map(([i, b, s]) => `<div class="mi" style="align-items:flex-start;padding:8px 0">${ms(i)}<span><b style="display:block">${b}</b><span class="muted small">${s}</span></span></div>`).join('')}</div>`;

/* uso gratuito limitado */
const uses = k => A.TOOLUSE[k] || 0;
const left = k => A.can('tools_unlimited') ? Infinity : Math.max(0, (A.cfg.limits?.free_tool_uses || 10) - uses(k));
function spend(k) { if (left(k) <= 0) { A.sheet(A.shead('workspace_premium', 'Se acabaron tus pruebas', 'Con aeffy Premium usas todas las herramientas sin límite.') + `<div class="foot"><button class="btn t" data-a="closesheet">Ahora no</button><button class="btn" data-a="dgo" data-v="premium">Ver Premium</button></div>`); return false } A.TOOLUSE[k] = uses(k) + 1; A.lsSet('ae_tooluse', A.TOOLUSE); return true }

const st = { files: [], k: '', step: 1 };
function toolPage(k) {
  const t = TOOLS.find(x => x.k === k); if (!t) return top({ back: 1 });
  if (st.k !== k) { st.k = k; st.files = []; st.step = 1; st.out = '' }
  if (!A.lsGet('ae_guide_' + k, 0)) setTimeout(() => guide(k), 300);
  const L = left(k);
  return top({ back: 1, right: `<button class="ib" data-a="guide" data-v="${k}" aria-label="Guía">${ms('menu_book')}</button>` }) + `<h1 class="h1">${t.n}</h1><p class="muted" style="margin:0">${t.d}</p>
  <div class="left">${ms('crown', 1)}${L === Infinity ? 'Sin límite con Premium' : `Te quedan ${L} de ${A.cfg.limits?.free_tool_uses || 10} pruebas`}</div>
  <div class="steps"><span class="s${st.step === 1 ? ' on' : ''}"><i>1</i>Canciones</span><span class="ln"></span><span class="s${st.step === 2 ? ' on' : ''}"><i>2</i>${t.s2}</span></div>
  <div id="tbody">${st.step === 1 ? pickHtml(k) : (STEP2[k] || (() => ''))()}</div>`
}
function pickHtml(k) {
  const lib = A.tracks.length ? `<button class="btn o" data-a="tpicklib">${ms('library_music')}De tu biblioteca</button>` : '';
  return `<section class="card"><div style="display:flex;gap:10px;align-items:center"><span class="ck s40">${shp('cookie')}<b style="position:relative">1</b></span><b>${k === 'creadores' ? 'Las pistas de tu lanzamiento' : 'Agrega las canciones'}</b></div><p class="muted small">Elige archivos o una carpeta entera.</p><div class="row2"><button class="btn t" data-a="tpick">${ms('description')}Archivos</button><button class="btn t" data-a="tpickdir">${ms('folder')}Carpeta</button>${lib}</div>
  ${st.files.length ? `<div style="margin-top:12px">${st.files.map((f, i) => `<div class="li"><div class="ph">${ms('audio_file')}</div><div class="t"><b>${esc(f.name)}</b><span>${(f.size / 1048576).toFixed(1)} MB</span></div><button class="ib" data-a="trm" data-i="${i}" aria-label="Quitar">${ms('close')}</button></div>`).join('')}</div>` : `<div style="height:110px;display:grid;place-items:center">${badge('upload_file')}</div>`}</section>
  <div class="foot"><button class="btn" data-a="tnext" ${st.files.length ? '' : 'disabled'}>${ms('arrow_forward')}Siguiente: ${TOOLS.find(x => x.k === k).s2}</button></div>`
}
function pickFiles(dir) { const i = document.createElement('input'); i.type = 'file'; i.multiple = true; if (dir) i.webkitdirectory = true; else i.accept = 'audio/*,.flac,.mp3,.wav,.m4a,.ogg,.opus'; i.onchange = () => { st.files.push(...[...i.files].filter(f => /^audio\//.test(f.type) || /\.(flac|mp3|wav|m4a|ogg|opus|aac|aiff?)$/i.test(f.name))); A.render() }; i.click() }
on('tpick', () => pickFiles(false)); on('tpickdir', () => pickFiles(true));
on('tpicklib', () => A.sheet(A.shead('library_music', 'De tu biblioteca') + A.tracks.map(t => `<label class="mi"><input type="checkbox" value="${t.id}" style="width:20px;height:20px;accent-color:var(--p)">${A.cov(t, 's40')}<span>${esc(t.name)}<br><span class="muted small">${esc(t.artist)}</span></span></label>`).join('') + `<div class="foot"><button class="btn" data-a="tpickok">Agregar</button></div>`));
on('tpickok', async () => { const ids = $$('.scrim input:checked').map(x => x.value); for (const id of ids) { let b = A.byId(id)?.native ? await A.blobFor(A.byId(id)) : A.MEMBLOB.get(id); if (!b) b = await A.tx('blob', 'readonly', s => s.get(id)); if (b) { const t = A.byId(id); const f = b instanceof File ? b : new File([b], t.file || t.name, { type: b.type }); f._tid = id; st.files.push(f) } } A.popLayer(); A.render() });
on('trm', el => { st.files.splice(+el.dataset.i, 1); A.render() });
on('tnext', () => { st.step = 2; A.render() });
on('tback', () => { st.step = 1; A.render() });

/* guía paso a paso */
function guide(k) {
  const g = GUIDES[k]; if (!g) return; let i = 0; const t = TOOLS.find(x => x.k === k);
  const s = A.sheet(`<div class="grab"></div><div class="guide" id="gd"></div>`, { head: false });
  const paint = () => { $('#gd', s).innerHTML = `<div class="vis"><span class="tag">${ms('auto_awesome')}Guía · ${t.n.split(' ')[0]}</span>${ms(g[i][0], 1)}</div><small>PASO ${i + 1} DE ${g.length}</small><h2>${g[i][1]}</h2><p>${g[i][2]}</p><div class="gfoot"><span class="gdots">${g.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</span>${i ? `<button class="btn g" id="gb">Atrás</button>` : ''}<button class="btn" id="gn">${i < g.length - 1 ? ms('arrow_forward') + 'Siguiente' : ms('check') + '¡Entendido!'}</button></div>`; const b = $('#gb', s); if (b) b.onclick = () => { i--; paint() }; $('#gn', s).onclick = () => { if (i < g.length - 1) { i++; paint() } else { A.lsSet('ae_guide_' + k, 1); A.popLayer() } } };
  paint()
}
on('guide', el => guide(el.dataset.v));

/* ---------- utilidades de audio ---------- */
async function decode(f) { const C = window.AudioContext || window.webkitAudioContext; const c = new C(); try { return await c.decodeAudioData(await f.arrayBuffer()) } finally { c.close && c.close() } }
function wavBlob(buf, bits, dither) {
  const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate, bps = bits / 8, size = n * ch * bps, ab = new ArrayBuffer(44 + size), dv = new DataView(ab); const ws = (o, s) => { for (let j = 0; j < s.length; j++)dv.setUint8(o + j, s.charCodeAt(j)) };
  ws(0, 'RIFF'); dv.setUint32(4, 36 + size, true); ws(8, 'WAVE'); ws(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, ch, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr * ch * bps, true); dv.setUint16(32, ch * bps, true); dv.setUint16(34, bits, true); ws(36, 'data'); dv.setUint32(40, size, true);
  const data = []; for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c)); const mx = bits === 16 ? 32767 : 8388607; let o = 44;
  for (let k = 0; k < n; k++) for (let c = 0; c < ch; c++) { let v = data[c][k] * mx; if (dither) v += (Math.random() - Math.random()); v = Math.max(-mx - 1, Math.min(mx, Math.round(v))); if (bits === 16) { dv.setInt16(o, v, true); o += 2 } else { dv.setUint8(o, v & 255); dv.setUint8(o + 1, (v >> 8) & 255); dv.setUint8(o + 2, (v >> 16) & 255); o += 3 } }
  return new Blob([ab], { type: 'audio/wav' })
}
function download(blob, name) { A.saveBlob(blob, name) }
function prog(t) { const o = $('#tout'); if (o) o.innerHTML = `<div class="res">${ms('progress_activity')} ${esc(t)}</div>` }
function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]];[im[i], im[j]] = [im[j], im[i]] } } for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) { const ur = re[i + j], ui = im[i + j], vr = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci, vi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr; re[i + j] = ur + vr; im[i + j] = ui + vi; re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t } } } }

const STEP2 = {};
/* Analizador */
STEP2.analizador = () => `<div class="row2" style="margin-bottom:10px"><button class="btn t" data-a="tback">${ms('arrow_back')}Canciones</button><button class="btn" data-a="analyze">${ms('play_arrow')}Analizar ${st.files.length}</button></div><div id="tout"></div>`;
on('analyze', async () => {
  const out = $('#tout'); out.innerHTML = '';
  for (const f of st.files) {
    if (!spend('analizador')) break; prog('Analizando ' + f.name + '…');
    try {
      const buf = await decode(f), sr = buf.sampleRate, N = 2048, d = buf.getChannelData(0), cols = 300, step = Math.max(N, Math.floor((d.length - N) / cols));
      const cv = document.createElement('canvas'); cv.className = 'spec'; cv.width = cols; cv.height = 256; const x = cv.getContext('2d'); const img = x.createImageData(cols, 256); const avg = new Float32Array(N / 2);
      for (let c = 0; c < cols; c++) { const s0 = c * step; if (s0 + N > d.length) break; const re = new Float32Array(N), im = new Float32Array(N); for (let i = 0; i < N; i++) re[i] = d[s0 + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / N)); fft(re, im); for (let b = 0; b < N / 2; b++) { const m = 20 * Math.log10(Math.hypot(re[b], im[b]) + 1e-9); avg[b] += m; const y = 255 - Math.floor(b / (N / 2) * 256); const v = Math.max(0, Math.min(1, (m + 60) / 90)); const p = (y * cols + c) * 4; img.data[p] = 255 * Math.min(1, v * 2.2); img.data[p + 1] = 255 * Math.max(0, v * 1.6 - .5); img.data[p + 2] = 255 * Math.max(0, .6 - v) + 80 * v; img.data[p + 3] = 255 } }
      x.putImageData(img, 0, 0);
      const peak = Math.max(...avg); let cut = N / 2 - 1; while (cut > 10 && avg[cut] < peak - 75 * cols / 10) cut--;
      const lvl = avg.map(v => v / cols); const ref = Math.max(...lvl.slice(10, 200)); cut = N / 2 - 1; while (cut > 10 && lvl[cut] < ref - 55) cut--;
      const cutHz = Math.round(cut / (N / 2) * sr / 2), ext = (f.name.split('.').pop() || '').toUpperCase(), lossless = /FLAC|WAV|ALAC|AIFF?/.test(ext);
      let v, cls; if (cutHz >= sr / 2 * .93) { v = lossless ? 'Lossless auténtico' : 'Rango completo'; cls = 'ok' } else if (cutHz < 16800) { v = lossless ? 'Transcodificado desde MP3 de baja calidad' : 'Corte en ' + (cutHz / 1000).toFixed(1) + ' kHz: calidad baja'; cls = lossless ? 'bad' : 'warn' } else if (cutHz < 20500) { v = lossless ? 'Probable transcodificación desde MP3/AAC' : 'Típico de MP3/AAC de buena calidad'; cls = lossless ? 'warn' : 'ok' } else { v = 'Rango casi completo'; cls = 'ok' }
      if (sr > 48000 && cutHz < 22500) v += ' · Hi-Res inflado (el contenido no pasa de 22 kHz)';
      const box = document.createElement('div'); box.className = 'res'; box.innerHTML = `<b>${esc(f.name)}</b><div class="muted small">${ext} · ${sr / 1000} kHz · ${buf.numberOfChannels} canales · ${fmt(buf.duration)}</div>`; box.appendChild(cv); box.insertAdjacentHTML('beforeend', `<div style="margin-top:8px">Las frecuencias llegan hasta <b>${(cutHz / 1000).toFixed(1)} kHz</b></div><div class="${cls}" style="font-weight:700;margin-top:4px">${esc(v)}</div>`); out.appendChild(box)
    } catch (e) { out.insertAdjacentHTML('beforeend', `<div class="res bad">${esc(f.name)}: no pude leer este archivo</div>`) }
  }
  const p = $('#tout .res'); if (p && /Analizando/.test(p.textContent)) p.remove()
});
/* Remuestreador */
STEP2.remuestreador = () => `<section class="card"><label class="fld"><small>Frecuencia de muestreo</small><select id="rsr">${[44100, 48000, 88200, 96000, 192000].map(v => `<option value="${v}">${v / 1000} kHz</option>`).join('')}</select></label><label class="fld"><small>Profundidad de bits</small><select id="rbits"><option value="16">16 bits</option><option value="24">24 bits</option></select></label><label class="mi"><input type="checkbox" id="rdith" checked style="width:20px;height:20px;accent-color:var(--p)">Dither activado (recomendado)</label></section><div class="foot"><button class="btn t" data-a="tback">${ms('arrow_back')}Canciones</button><button class="btn" data-a="resample">${ms('play_arrow')}Remuestrear</button></div><div id="tout"></div>`;
on('resample', async () => {
  const sr = +$('#rsr').value, bits = +$('#rbits').value, dith = $('#rdith').checked;
  for (const f of st.files) { if (!spend('remuestreador')) break; prog('Procesando ' + f.name + '…'); try { const b = await decode(f); const off = new OfflineAudioContext(b.numberOfChannels, Math.ceil(b.duration * sr), sr); const s = off.createBufferSource(); s.buffer = b; s.connect(off.destination); s.start(); const r = await off.startRendering(); download(wavBlob(r, bits, dith), A.base(f.name) + ` (${sr / 1000}kHz ${bits}bit).wav`) } catch (e) { toast('No pude procesar ' + f.name) } }
  $('#tout').innerHTML = `<div class="res ok">${ms('check_circle')} Listo. Los archivos nuevos están en tus descargas.</div>`
});
/* Convertidor */
STEP2.convertidor = () => `<section class="card"><label class="fld"><small>Formato</small><select id="cfmt"><option value="wav16">WAV 16 bits (sin pérdida)</option><option value="wav24">WAV 24 bits (sin pérdida)</option><option value="mp3-320">MP3 320 kbps</option><option value="mp3-256">MP3 256 kbps</option><option value="mp3-192">MP3 192 kbps</option><option value="mp3-128">MP3 128 kbps</option></select></label><label class="mi"><input type="checkbox" id="ctags" checked style="width:20px;height:20px;accent-color:var(--p)">Conservar etiquetas y portada</label></section><div class="foot"><button class="btn t" data-a="tback">${ms('arrow_back')}Canciones</button><button class="btn" data-a="convert">${ms('swap_horiz')}Convertir</button></div><div id="tout"></div>`;
function loadLame() { return new Promise((res, rej) => { if (window.lamejs) return res(); const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s) }) }
on('convert', async () => {
  const fm = $('#cfmt').value, keep = $('#ctags').checked;
  for (const f of st.files) {
    if (!spend('convertidor')) break; prog('Convirtiendo ' + f.name + '…');
    try {
      const b = await decode(f); let tg = {}; if (keep) try { tg = await A.readTags(f) } catch (e) { }
      if (fm.startsWith('wav')) download(wavBlob(b, fm === 'wav24' ? 24 : 16, true), A.base(f.name) + '.wav');
      else {
        await loadLame(); const kb = +fm.split('-')[1], ch = Math.min(2, b.numberOfChannels), enc = new lamejs.Mp3Encoder(ch, b.sampleRate, kb), L = b.getChannelData(0), R = ch > 1 ? b.getChannelData(1) : L, parts = [], blk = 1152;
        const toI = a => { const o = new Int16Array(a.length); for (let i = 0; i < a.length; i++) o[i] = Math.max(-32768, Math.min(32767, a[i] * 32767)); return o };
        for (let i = 0; i < L.length; i += blk) { const l = toI(L.subarray(i, i + blk)), r = toI(R.subarray(i, i + blk)); const m = ch > 1 ? enc.encodeBuffer(l, r) : enc.encodeBuffer(l); if (m.length) parts.push(new Uint8Array(m)); if (i % (blk * 400) === 0) { prog(`Convirtiendo ${f.name}… ${Math.round(i / L.length * 100)} %`); await new Promise(r => setTimeout(r)) } }
        const e = enc.flush(); if (e.length) parts.push(new Uint8Array(e));
        const tag = keep ? await id3({ title: tg.title, artist: tg.artist, album: tg.album, year: tg.year, track: tg.track, genre: tg.genre }, tg.pic) : new Uint8Array(0);
        download(new Blob([tag, ...parts], { type: 'audio/mpeg' }), A.base(f.name) + '.mp3')
      }
    } catch (e) { toast('No pude convertir ' + f.name) }
  }
  $('#tout').innerHTML = `<div class="res ok">${ms('check_circle')} Listo. Tus originales no se tocaron; las copias nuevas están en tus descargas.</div>`
});
/* escritor ID3v2.3 */
async function id3(tags, pic, extra = []) {
  const enc = new TextEncoder(); const frames = [];
  const u16 = s => { const b = new Uint8Array(3 + s.length * 2 + 2); b[0] = 1; b[1] = 0xFF; b[2] = 0xFE; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); b[3 + i * 2] = c & 255; b[4 + i * 2] = c >> 8 } return b };
  const frame = (id, body) => { const h = new Uint8Array(10 + body.length); h.set(enc.encode(id)); const n = body.length; h[4] = n >>> 24; h[5] = (n >> 16) & 255; h[6] = (n >> 8) & 255; h[7] = n & 255; h.set(body, 10); frames.push(h) };
  const T = { title: 'TIT2', artist: 'TPE1', album: 'TALB', year: 'TYER', track: 'TRCK', genre: 'TCON', label: 'TPUB', isrc: 'TSRC', albumArtist: 'TPE2', composer: 'TCOM' };
  for (const k in T) if (tags[k]) frame(T[k], u16(String(tags[k])));
  extra.forEach(([d, v]) => { if (!v) return; const a = u16(d), b = u16(String(v)); const body = new Uint8Array(a.length + b.length - 1); body.set(a); body.set(b.subarray(1), a.length); frame('TXXX', body) });
  if (pic) { const data = new Uint8Array(await pic.arrayBuffer()); const mime = enc.encode(pic.type || 'image/jpeg'); const body = new Uint8Array(1 + mime.length + 1 + 1 + 1 + data.length); let o = 0; body[o++] = 0; body.set(mime, o); o += mime.length; body[o++] = 0; body[o++] = 3; body[o++] = 0; body.set(data, o); frame('APIC', body) }
  const size = frames.reduce((a, f) => a + f.length, 0); const h = new Uint8Array(10 + size); h.set([73, 68, 51, 3, 0, 0, (size >> 21) & 127, (size >> 14) & 127, (size >> 7) & 127, size & 127]); let o = 10; frames.forEach(f => { h.set(f, o); o += f.length }); return h
}
async function stripID3(f) { const h = new Uint8Array(await f.slice(0, 10).arrayBuffer()); if (h[0] === 73 && h[1] === 68 && h[2] === 51) { const sz = ((h[6] & 127) << 21) | ((h[7] & 127) << 14) | ((h[8] & 127) << 7) | (h[9] & 127); return f.slice(10 + sz) } return f }
/* Administrador de archivos */
STEP2.archivos = () => `<section class="card"><label class="fld"><small>Plantilla</small><input id="tpl" value="${esc(A.lsGet('ae_tpl', '{track} - {artist} - {title}'))}"></label><div class="chips">${['{artist}', '{title}', '{album}', '{track}', '{year}', '/'].map(p => `<button class="chip" data-a="tplp" data-v="${p}">${p}</button>`).join('')}</div></section><div id="tprev" style="margin-top:10px"></div><div class="foot"><button class="btn t" data-a="tback">${ms('arrow_back')}Canciones</button><button class="btn" data-a="rename">${ms('download')}Descargar renombrados</button></div>`;
async function previewNames() { const tpl = ($('#tpl') || {}).value || ''; A.lsSet('ae_tpl', tpl); const out = []; for (const f of st.files) { let t = {}; try { t = await A.readTags(f) } catch (e) { } const ext = f.name.split('.').pop(); const nm = tpl.replace(/\{(\w+)\}/g, (_, k) => k === 'track' ? String(parseInt(t.track) || '').padStart(2, '0') : (t[k] || (k === 'title' ? A.base(f.name) : 'Desconocido'))).replace(/[\\:*?"<>|]/g, '').trim() + '.' + ext; out.push([f.name, nm]) } const p = $('#tprev'); if (p) p.innerHTML = out.map(([a, b]) => `<div class="res" style="padding:10px 12px"><span class="muted small" style="text-decoration:line-through">${esc(a)}</span><br>${ms('arrow_forward')} <b>${esc(b)}</b></div>`).join(''); return out }
on('tplp', el => { const i = $('#tpl'); i.value += el.dataset.v; previewNames() });
document.addEventListener('input', e => { if (e.target.id === 'tpl') previewNames() });
on('rename', async () => { if (!spend('archivos')) return; const names = await previewNames(); st.files.forEach((f, i) => download(f, names[i][1].replace(/\//g, ' - '))); toast('Descargando copias renombradas') });
/* Enriquecedor */
STEP2.enriquecedor = () => `<div class="row2"><button class="btn t" data-a="tback">${ms('arrow_back')}Canciones</button><button class="btn" data-a="enrich">${ms('travel_explore')}Buscar en MusicBrainz</button></div><div id="tout"></div>`;
on('enrich', async () => {
  const out = $('#tout'); out.innerHTML = '';
  for (const f of st.files) {
    if (!spend('enriquecedor')) break; prog('Buscando ' + f.name + '…'); let t = {}; try { t = await A.readTags(f) } catch (e) { } const title = t.title || A.base(f.name).replace(/^\d+[\s.\-_]+/, ''), artist = t.artist || '';
    try {
      const r = await fetch('https://musicbrainz.org/ws/2/recording/?fmt=json&limit=3&query=' + encodeURIComponent(`recording:"${title}"${artist ? ` AND artist:"${artist}"` : ''}`)); const j = await r.json(); const rec = j.recordings && j.recordings[0];
      if (!rec) { out.insertAdjacentHTML('beforeend', `<div class="res warn">${esc(f.name)}: sin coincidencias</div>`); continue }
      const rel = (rec.releases || [])[0] || {}, conf = rec.score >= 90 ? 'alta' : rec.score >= 70 ? 'media' : 'baja';
      const q = { title: rec.title, artist: (rec['artist-credit'] || []).map(a => a.name + (a.joinphrase || '')).join(''), album: rel.title, year: (rel.date || '').slice(0, 4), isrc: (rec.isrcs || [])[0] || '' };
      const row = (k, n) => `<tr><td>${n}</td><td class="muted">${esc(t[k] || '—')}</td><td style="${q[k] && q[k] !== t[k] ? 'color:var(--p);font-weight:700' : ''}">${esc(q[k] || '—')}</td></tr>`;
      const id = 'e' + Math.random().toString(36).slice(2, 7); A['_en_' + id] = { f, q, rel };
      out.insertAdjacentHTML('beforeend', `<div class="res"><b>${esc(f.name)}</b> <span class="lock" style="background:var(--s3);color:var(--on)">Confianza ${conf}</span><table class="cmp" style="margin-top:8px"><tr><th></th><th>Ahora</th><th>Quedará</th></tr>${row('title', 'Título')}${row('artist', 'Artista')}${row('album', 'Álbum')}${row('year', 'Año')}${row('isrc', 'ISRC')}</table><div class="row2" style="margin-top:10px"><button class="btn" data-a="enok" data-id="${id}">${ms('save')}Guardar cambios</button></div></div>`);
      await new Promise(r => setTimeout(r, 1100))
    } catch (e) { out.insertAdjacentHTML('beforeend', `<div class="res bad">${esc(f.name)}: MusicBrainz no respondió</div>`) }
  }
  const p = $('#tout .res'); if (p && /Buscando/.test(p.textContent)) p.remove()
});
on('enok', async el => {
  const d = A['_en_' + el.dataset.id]; if (!d) return; let pic = null;
  if (d.rel.id) { try { const r = await fetch(`https://coverartarchive.org/release/${d.rel.id}/front-1200`); if (r.ok) pic = await r.blob() } catch (e) { } }
  const lt = A.tracks.find(t => t.id === d.f._tid) || A.tracks.find(t => t.file === d.f.name && t.size === d.f.size);
  if (lt) { Object.entries(d.q).forEach(([k, v]) => { if (v) lt[k] = v }); if (pic && !lt.cover) { try { const c = await A.shrinkCover(pic); lt.cover = c.url; lt.hue = c.hue; lt.sat = c.sat } catch (e) { } } A.saveTrack(lt) }
  if (/\.mp3$/i.test(d.f.name)) { const old = await A.readTags(d.f).catch(() => ({})); const tag = await id3({ ...old, ...d.q }, pic || old.pic); download(new Blob([tag, await stripID3(d.f)], { type: 'audio/mpeg' }), d.f.name) }
  el.closest('.res').insertAdjacentHTML('beforeend', `<div class="ok small" style="margin-top:6px">${ms('check')} Guardado${lt ? ' en tu biblioteca' : ''}${/\.mp3$/i.test(d.f.name) ? ' y descargado con las etiquetas nuevas' : ''}</div>`); el.remove()
});
/* Letras */
STEP2.letras = () => `<div class="row2"><button class="btn t" data-a="tback">${ms('arrow_back')}Canciones</button><button class="btn" data-a="lyrfind">${ms('search')}Buscar las que faltan</button></div><div id="tout"></div>`;
on('lyrfind', async () => {
  const out = $('#tout'); out.innerHTML = '';
  for (const f of st.files) {
    if (!spend('letras')) break; let t = {}; try { t = await A.readTags(f) } catch (e) { } const fake = { id: '_', name: t.title || A.base(f.name), artist: t.artist || '', album: t.album || '', dur: 0 };
    prog('Buscando ' + fake.name + '…');
    try { const r = await fetch('https://lrclib.net/api/search?' + new URLSearchParams({ q: (fake.artist + ' ' + fake.name).trim() })); const arr = r.ok ? await r.json() : []; const j = arr.find(x => x.syncedLyrics) || arr[0]; const txt = j ? (j.syncedLyrics || j.plainLyrics) : ''; const id = 'l' + Math.random().toString(36).slice(2, 7); A['_ly_' + id] = { f, txt };
      out.insertAdjacentHTML('beforeend', `<div class="res"><b>${esc(fake.name)}</b> ${txt ? `<span class="lock" style="background:var(--pc);color:var(--onpc)">${j.syncedLyrics ? 'LRC' : 'Texto'}</span>` : '<span class="warn">sin letra</span>'}${txt ? `<pre style="white-space:pre-wrap;max-height:120px;overflow:auto;font-size:12px;margin:8px 0">${esc(txt.slice(0, 600))}</pre><div class="row2"><button class="btn" data-a="lyrsave" data-id="${id}">${ms('save')}Guardar</button><button class="btn t" data-a="lyrdl" data-id="${id}">${ms('download')}.lrc</button></div>` : ''}</div>`) } catch (e) { }
  }
  const p = $('#tout .res'); if (p && /Buscando/.test(p.textContent)) p.remove()
});
on('lyrsave', el => { const d = A['_ly_' + el.dataset.id]; const lt = A.tracks.find(t => t.id === d.f._tid) || A.tracks.find(t => t.file === d.f.name); if (lt) { lt.lrc = d.txt; A.saveTrack(lt); toast('Letra guardada en tu biblioteca') } else toast('Esa canción no está en tu biblioteca: descárgala como .lrc') });
on('lyrdl', el => { const d = A['_ly_' + el.dataset.id]; download(new Blob([d.txt], { type: 'text/plain' }), A.base(d.f.name) + '.lrc') });
/* Creadores */
STEP2.creadores = () => `<section class="card">${[['rel_title', 'Título del lanzamiento'], ['rel_artist', 'Artista'], ['rel_label', 'Sello'], ['rel_year', 'Año'], ['rel_upc', 'UPC'], ['rel_credits', 'Créditos (productor, compositor…)']].map(([k, n]) => `<label class="fld"><small>${n}</small><input id="${k}" value="${esc(A.lsGet('ae_' + k, ''))}"></label>`).join('')}<div class="row2"><button class="btn t" data-a="relcover">${ms('image')}Portada</button><span class="small muted" id="relc">${st.cover ? esc(st.cover.name) : 'Sin portada'}</span></div></section>
 <div class="sech"><h2>Pistas</h2></div>${st.files.map((f, i) => `<section class="card" style="margin-bottom:10px"><b>${i + 1}. ${esc(f.name)}</b><label class="fld"><small>Título de la pista</small><input data-tr="${i}" data-k="title" value="${esc(A.base(f.name).replace(/^\d+[\s.\-_]+/, ''))}"></label><label class="fld"><small>ISRC</small><input data-tr="${i}" data-k="isrc" placeholder="XX-XXX-00-00000"></label></section>`).join('')}
 <div class="foot"><button class="btn t" data-a="tback">${ms('arrow_back')}Canciones</button><button class="btn" data-a="relwrite">${ms('download')}Escribir y descargar</button></div><p class="small muted">Las etiquetas se escriben en archivos MP3. Los demás formatos se guardan solo dentro de aeffy.</p>`;
on('relcover', () => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = () => { st.cover = i.files[0]; $('#relc').textContent = st.cover.name }; i.click() });
on('relwrite', async () => {
  if (!spend('creadores')) return; const g = k => { const v = $('#' + k).value.trim(); A.lsSet('ae_' + k, v); return v };
  const R = { album: g('rel_title'), artist: g('rel_artist'), label: g('rel_label'), year: g('rel_year') }, upc = g('rel_upc'), cred = g('rel_credits');
  for (let i = 0; i < st.files.length; i++) { const f = st.files[i]; const tr = {}; $$(`[data-tr="${i}"]`).forEach(x => tr[x.dataset.k] = x.value.trim()); if (!/\.mp3$/i.test(f.name)) continue; const tag = await id3({ ...R, title: tr.title, isrc: tr.isrc, track: String(i + 1), albumArtist: R.artist }, st.cover, [['UPC', upc], ['CREDITS', cred]]); download(new Blob([tag, await stripID3(f)], { type: 'audio/mpeg' }), f.name) }
  toast('Listo: tus archivos con etiquetas nuevas se están descargando')
});
}
/* aeffy · en vivo: Spots (audio en tiempo real), amigos, Recast, traducir letras */
'use strict';
{
const { $, $$, esc, ms, fmt, toast, shp, cov, P, on, top, badge } = A;
const V = A.views;
const ICE = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }] };
const rid = n => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');
const ago = d => { const s = (Date.now() - new Date(d)) / 1000; if (s < 90) return 'ahora'; if (s < 3600) return 'hace ' + Math.round(s / 60) + ' min'; if (s < 86400) return 'hace ' + Math.round(s / 3600) + ' h'; return 'hace ' + Math.round(s / 86400) + ' d' };
async function thumb(src, size = 96) { if (!src) return null; try { const i = new Image(); i.src = src; await i.decode(); const c = document.createElement('canvas'); c.width = c.height = size; c.getContext('2d').drawImage(i, 0, 0, size, size); return c.toDataURL('image/jpeg', .7) } catch (e) { return null } }
const COLORS = ['#ff7eb3', '#8f6bff', '#3b9bf5', '#2fbf8f', '#ffb347', '#ef5d5d', '#6c8cff', '#c06cff'];
const colorOf = s => COLORS[A.hueOf(s || '') % COLORS.length];
const av = (name, sz = 40, img, an) => an && A.shapeAv ? A.shapeAv(name, sz, img, an) : img ? `<i class="pav" style="width:${sz}px;height:${sz}px;background:url('${esc(img)}') center/cover"></i>` : `<i class="pav" style="width:${sz}px;height:${sz}px;background:${colorOf(name)}">${esc((name || '?').trim().charAt(0).toUpperCase())}</i>`;

/* =================== SPOTS =================== */
const S = A.spot = { role: null, code: null, ch: null, peers: new Map(), people: [], chat: [], meta: null, vote: null, votes: {}, state: null, me: null, timer: null, started: 0 };
const myKey = () => S.me || (S.me = (A.session ? 'u-' + A.session.user.id.slice(0, 8) : 'g') + '-' + rid(5));
function send(event, payload) { if (S.ch) S.ch.send({ type: 'broadcast', event, payload }) }

/* --- anfitriona --- */
A.spotCreate = async () => {
  if (!A.inApp) { A.downloadSheet('Los Spots se crean y se escuchan solo en la app aeffy.'); return }
  if (!A.session) { A.loginSheet('in'); return }
  if (S.role) { A.go('spots'); return }
  const sb = A.sb(); const code = rid(6); const max = Math.min(A.ST.spotPeople || 4, A.isPremium() ? (A.cfg.limits?.premium_spot_people || 12) : (A.cfg.limits?.free_spot_people || 4));
  const name = 'Spot de ' + (A.me?.display_name || 'Anfitrión');
  const { error } = await sb.from('aeffy_spots').insert({ code, host_id: A.session.user.id, name, mode: A.ST.spotMode || 'open', max_people: max, only_users: !!A.ST.spotOnlyUsers, allow_control: !!A.ST.spotControl });
  if (error) { toast('No pude crear el Spot'); return }
  A.initAudio(); if (!A.spotStream()) { toast('Este navegador no puede transmitir audio'); }
  Object.assign(S, { role: 'host', code, meta: { name, max_people: max, allow_control: !!A.ST.spotControl, host: A.me?.display_name }, chat: [], peers: new Map(), started: Date.now(), votes: {}, vote: null });
  join(code, { name: A.me?.display_name || 'Anfitrión', host: true });
  S.timer = setInterval(hostTick, 5000); A.publishNow(); A.go('spots'); toast('Tu Spot está abierto')
};
function hostTick() {
  pushState();
  if (!A.isPremium()) { const k = 'ae_spotmin_' + A.dkey(new Date()); const m = (+localStorage.getItem(k) || 0) + 5 / 60; localStorage.setItem(k, m); if (m >= 60) { toast('Se acabó la hora gratis de Spots de hoy'); A.spotEnd(); } }
}
async function pushState() {
  if (S.role !== 'host') return; const t = A.byId(P.cur);
  const st = { t: t ? { hue: t.hue, sat: t.sat, name: t.name, artist: t.artist, album: t.album, dur: t.dur || P.au.duration || 0, cover: t._thumb || (t._thumb = await thumb(t.cover, 160)) } : null, pos: P.au.currentTime || 0, playing: !!(t && !P.au.paused), at: Date.now(), next: P.queue.slice(P.qi + 1, P.qi + 6).map(id => { const x = A.byId(id); return x ? { name: x.name, artist: x.artist } : null }).filter(Boolean), meta: S.meta };
  S.state = st; send('state', st)
}
A.spotPush = () => { if (S.role === 'host') pushState() };
function offerTo(key) {
  const stream = A.spotStream(); if (!stream) return; const pc = new RTCPeerConnection(ICE); S.peers.set(key, pc);
  stream.getAudioTracks().forEach(tr => pc.addTrack(tr, stream));
  pc.onicecandidate = e => { if (e.candidate) send('sig', { to: key, from: myKey(), kind: 'ice', data: e.candidate.toJSON() }) };
  pc.onconnectionstatechange = () => { if (['failed', 'closed'].includes(pc.connectionState)) { S.peers.delete(key) } A.spotPaint() };
  pc.createOffer().then(o => pc.setLocalDescription(o)).then(() => send('sig', { to: key, from: myKey(), kind: 'offer', data: pc.localDescription.toJSON() }))
}
A.spotEnd = async () => {
  if (!S.role) return; const was = S.role, code = S.code;
  if (was === 'host') { send('end', {}); try { await A.sb().from('aeffy_spots').update({ active: false, ended_at: new Date().toISOString() }).eq('code', code) } catch (e) { } }
  leave(); if (was === 'host') toast('Cerraste tu Spot'); A.publishNow(); A.render()
};
function leave() {
  clearInterval(S.timer); S.peers.forEach(pc => pc.close()); S.peers.clear();
  if (S.ch) { try { S.ch.untrack(); A.sb().removeChannel(S.ch) } catch (e) { } }
  const a = $('#spotAudio'); if (a) { a.srcObject = null; a.remove() }
  Object.assign(S, { role: null, code: null, ch: null, people: [], state: null, meta: null, vote: null, guestPc: null })
}

/* --- invitado --- */
A.spotJoin = async (code, name) => {
  if (!A.inApp) { A.downloadSheet('Este Spot se escucha en la app aeffy.'); return }
  const sb = A.sb(); if (!sb) { toast('Sin conexión'); return }
  const { data: sp } = await sb.from('aeffy_spots').select('*').eq('code', code).maybeSingle();
  if (!sp || !sp.active) { toast('Ese Spot ya se cerró'); return }
  if (sp.only_users && !A.session) { A.loginSheet('in'); return }
  if (S.role) leave();
  if (!P.au.paused) P.au.pause();
  let a = $('#spotAudio'); if (!a) { a = document.createElement('audio'); a.id = 'spotAudio'; a.autoplay = true; a.playsInline = true; document.body.appendChild(a) }
  a.muted = false; a.play().catch(() => { });
  Object.assign(S, { role: 'guest', code, meta: sp, chat: [], votes: {}, vote: null, state: null });
  localStorage.setItem('ae_spotname', name);
  join(code, { name, host: false, app: matchMedia('(display-mode: standalone)').matches ? 'aeffy' : 'web' }); A.render()
};
function onSig(p) {
  if (p.to !== myKey()) return;
  if (S.role === 'guest') {
    if (p.kind === 'offer') {
      if (S.guestPc) S.guestPc.close(); const pc = S.guestPc = new RTCPeerConnection(ICE);
      pc.ontrack = e => { const a = $('#spotAudio'); if (a) { a.srcObject = e.streams[0]; a.play().catch(() => { S.needTap = true; A.spotPaint() }) } };
      pc.onicecandidate = e => { if (e.candidate) send('sig', { to: p.from, from: myKey(), kind: 'ice', data: e.candidate.toJSON() }) };
      pc.onconnectionstatechange = () => { S.conn = pc.connectionState; A.spotPaint() };
      pc.setRemoteDescription(p.data).then(() => pc.createAnswer()).then(ans => pc.setLocalDescription(ans)).then(() => send('sig', { to: p.from, from: myKey(), kind: 'answer', data: pc.localDescription.toJSON() }))
    } else if (p.kind === 'ice' && S.guestPc) S.guestPc.addIceCandidate(p.data).catch(() => { })
  } else if (S.role === 'host') {
    const pc = S.peers.get(p.from); if (!pc) return;
    if (p.kind === 'answer') pc.setRemoteDescription(p.data).catch(() => { });
    if (p.kind === 'ice') pc.addIceCandidate(p.data).catch(() => { })
  }
}
function join(code, info) {
  const sb = A.sb(); const key = myKey();
  const ch = S.ch = sb.channel('aeffy-spot-' + code, { config: { broadcast: { self: false }, presence: { key } } });
  ch.on('presence', { event: 'sync' }, () => {
    const st = ch.presenceState(); S.people = Object.entries(st).map(([k, v]) => ({ key: k, ...(v[0] || {}) })).sort((a, b) => (b.host ? 1 : 0) - (a.host ? 1 : 0) || (a.at || 0) - (b.at || 0));
    if (S.role === 'host') {
      const guests = S.people.filter(x => !x.host); const max = S.meta.max_people || 4;
      guests.forEach((g, i) => { if (i + 1 >= max) { send('full', { to: g.key }); return } if (!S.peers.has(g.key)) offerTo(g.key) });
      [...S.peers.keys()].forEach(k => { if (!st[k]) { S.peers.get(k).close(); S.peers.delete(k) } });
      pushState()
    }
    A.spotPaint()
  });
  ch.on('broadcast', { event: 'sig' }, ({ payload }) => onSig(payload));
  ch.on('broadcast', { event: 'state' }, ({ payload }) => { if (S.role === 'guest') { const ch2 = !S.state || !S.state.t || !payload.t || S.state.t.name !== payload.t.name; S.state = payload; if (ch2 && payload.t) { guestLyrics(payload.t); if (payload.t.hue != null && A.ST.coverColor) A.applyPalette(payload.t.hue, payload.t.sat ?? .6) } A.spotPaint() } });
  ch.on('broadcast', { event: 'hello' }, () => { if (S.role === 'host') pushState() });
  ch.on('broadcast', { event: 'chat' }, ({ payload }) => { S.chat.push(payload); S.chat = S.chat.slice(-80); A.spotPaint(true) });
  ch.on('broadcast', { event: 'react' }, ({ payload }) => floatReact(payload.i));
  ch.on('broadcast', { event: 'vote_start' }, ({ payload }) => { S.vote = payload; S.votes = {}; A.spotPaint(); voteSheet() });
  ch.on('broadcast', { event: 'vote' }, ({ payload }) => { if (S.vote && payload.id === S.vote.id) { S.votes[payload.key] = payload; A.spotPaint() } });
  ch.on('broadcast', { event: 'ctrl' }, ({ payload }) => { if (S.role === 'host' && S.meta.allow_control) { ({ toggle: A.toggle, next: A.next, prev: A.prev })[payload.c]?.(); setTimeout(pushState, 300) } });
  ch.on('broadcast', { event: 'full' }, ({ payload }) => { if (payload.to === myKey()) { toast('El Spot está lleno'); leave(); A.render() } });
  ch.on('broadcast', { event: 'end' }, () => { if (S.role === 'guest') { toast('La anfitriona cerró el Spot'); leave(); A.render() } });
  ch.subscribe(async status => { if (status === 'SUBSCRIBED') { await ch.track({ ...info, at: Date.now() }); if (S.role === 'guest') send('hello', {}) } })
}

/* --- letras para invitados --- */
async function guestLyrics(t) { S.lyr = []; try { const q = new URLSearchParams({ artist_name: t.artist, track_name: t.name }); let r = await fetch('https://lrclib.net/api/get?' + q); let j = r.ok ? await r.json() : null; if (!j || !j.syncedLyrics) { r = await fetch('https://lrclib.net/api/search?' + new URLSearchParams({ q: t.artist + ' ' + t.name })); const arr = r.ok ? await r.json() : []; j = arr.find(x => x.syncedLyrics) || null } if (j && j.syncedLyrics) S.lyr = A.parseLRC(j.syncedLyrics) } catch (e) { } }
setInterval(() => { if (S.role !== 'guest' || !S.state) return; const st = S.state, pos = st.pos + (st.playing ? (Date.now() - st.at) / 1000 : 0); const b = $('#spProg'); if (b && st.t?.dur) b.style.width = Math.min(100, pos / st.t.dur * 100) + '%'; const tc = $('#spTime'); if (tc) tc.textContent = fmt(pos) + ' / ' + fmt(st.t?.dur); const ly = $('#spLyr'); if (ly && S.lyr?.length) { let x = ''; for (const l of S.lyr) { if (l.t <= pos + .3) x = l.x; else break } ly.textContent = x } }, 500);

/* --- votaciones y reacciones --- */
function voteSheet() {
  const v = S.vote; if (!v) return; let val = 0;
  const s = A.sheet(A.shead('how_to_vote', 'Votación del Spot', esc(v.title) + ' · ' + esc(v.artist)) + `<div class="rate" id="vrt"></div><div class="small" id="vrl" style="text-align:center">Medio círculo = 1 punto · lleno = 2</div><div class="foot"><button class="btn" id="vok" disabled>Votar</button></div>`);
  const paint = () => { $('#vrt', s).innerHTML = [0, 1, 2, 3, 4].map(i => { const f = val - i * 2; return `<button class="${f >= 2 ? 'f' : f === 1 ? 'h' : ''}" data-i="${i}" aria-label="Círculo ${i + 1}"></button>` }).join(''); $('#vrl', s).innerHTML = val ? `<b>${val} de 10</b>` : 'Medio círculo = 1 punto · lleno = 2'; $('#vok', s).disabled = !val };
  paint(); $('#vrt', s).onclick = e => { const b = e.target.closest('button'); if (!b) return; const i = +b.dataset.i, f = val - i * 2; val = f >= 2 ? i * 2 + 1 : f === 1 ? i * 2 : i * 2 + 2; paint() };
  $('#vok', s).onclick = async () => { const name = A.me?.display_name || localStorage.getItem('ae_spotname') || 'Invitado'; const pl = { id: v.id, key: myKey(), value: val, name }; S.votes[myKey()] = pl; send('vote', pl); try { await A.sb().from('aeffy_spot_votes').insert({ spot_code: S.code, host_id: S.meta.host_id || (S.role === 'host' ? A.session.user.id : null), voter_id: A.session?.user.id || null, voter_name: name, title: v.title, artist: v.artist, value: val }) } catch (e) { } A.popLayer(); A.spotPaint(); toast('Voto enviado') }
}
function floatReact(i) { const e = document.createElement('span'); e.className = 'ms f react'; e.textContent = i; e.style.left = (20 + Math.random() * 60) + '%'; document.body.appendChild(e); setTimeout(() => e.remove(), 2200) }
on('sp-react', el => { floatReact(el.dataset.v); send('react', { i: el.dataset.v }) });
on('sp-vote', () => { const t = S.role === 'host' ? A.byId(P.cur) : S.state?.t; if (!t) { toast('No hay nada sonando'); return } S.vote = { id: rid(6), title: t.name, artist: t.artist }; S.votes = {}; send('vote_start', S.vote); voteSheet(); A.spotPaint() });
on('sp-ctrl', el => { if (S.role === 'host') { ({ toggle: A.toggle, next: A.next, prev: A.prev })[el.dataset.v](); setTimeout(pushState, 300) } else send('ctrl', { c: el.dataset.v }) });
on('sp-create', () => A.spotCreate());
on('spot-create', () => A.spotCreate());
on('sp-end', () => A.spotEnd());
on('sp-leave', () => { leave(); toast('Saliste del Spot'); A.render() });
on('sp-copy', async () => { const url = location.origin + '/#/spot/' + S.code; try { if (navigator.share) await navigator.share({ title: S.meta?.name || 'Spot de aeffy', text: 'Ven a escuchar conmigo en aeffy', url }); else { await navigator.clipboard.writeText(url); toast('Enlace copiado') } } catch (e) { } });
on('sp-tap', () => { const a = $('#spotAudio'); a && a.play().then(() => { S.needTap = false; A.spotPaint() }).catch(() => { }) });
on('sp-joinbtn', el => { const n = ($('#spName') || {}).value?.trim() || A.me?.display_name || 'Invitado'; A.spotJoin(el.dataset.code, n.slice(0, 30)) });
document.addEventListener('submit', e => { if (e.target.id === 'spChat') { e.preventDefault(); const i = $('#spMsg'); const t = i.value.trim(); if (!t) return; const m = { n: A.me?.display_name || localStorage.getItem('ae_spotname') || 'Invitado', t: t.slice(0, 280), at: Date.now() }; S.chat.push(m); send('chat', m); i.value = ''; A.spotPaint(true) } });

/* --- pantalla Spots --- */
function people() { const max = S.meta?.max_people || 4; const L = S.people; return `<div class="people">${L.map(p => `<div class="p">${av(p.name)}<div class="t"><b>${esc(p.name)}</b><span class="muted small">${p.host ? 'Anfitriona' : p.app === 'aeffy' ? 'Desde aeffy' : 'Desde el navegador'}${p.key === myKey() ? ' · tú' : ''}</span></div>${S.role === 'host' && !p.host ? `<span class="small muted">${S.peers.get(p.key)?.connectionState === 'connected' ? ms('graphic_eq') : '…'}</span>` : ''}</div>`).join('')}${L.length < max ? `<div class="p"><i class="pav free">${ms('person_add')}</i><span class="muted">${max - L.length} ${max - L.length === 1 ? 'plaza libre' : 'plazas libres'}</span></div>` : ''}</div>` }
function chatBox() { return `<section class="card" style="margin-top:12px"><h3 style="margin-bottom:8px">Chat</h3><div class="chat" id="spChatList">${S.chat.map(m => `<div class="msg">${av(m.n, 28)}<div><b>${esc(m.n)}</b><p>${esc(m.t)}</p></div></div>`).join('') || '<p class="muted small">Saluda a la gente del Spot.</p>'}</div><form id="spChat" class="search" style="margin:10px 0 0"><input id="spMsg" maxlength="280" placeholder="Escribe un mensaje" autocomplete="off"><button class="ib" aria-label="Enviar">${ms('send')}</button></form><div class="row2" style="margin-top:10px">${['favorite', 'local_fire_department', 'celebration', 'music_note', 'sentiment_very_satisfied'].map(i => `<button class="ib t" data-a="sp-react" data-v="${i}" aria-label="Reaccionar">${ms(i, 1)}</button>`).join('')}</div></section>` }
function voteBox() { if (!S.vote) return ''; const vs = Object.values(S.votes); const avg = vs.length ? (vs.reduce((a, b) => a + b.value, 0) / vs.length) : 0; return `<section class="card" style="margin-top:12px;background:var(--pc);color:var(--onpc)"><div class="label" style="color:inherit">${ms('how_to_vote')}Votación</div><b style="font-size:17px">${esc(S.vote.title)}</b><div class="small" style="opacity:.85">${vs.length} ${vs.length === 1 ? 'voto' : 'votos'}${vs.length ? ' · media ' + avg.toFixed(1).replace('.', ',') + ' de 10' : ''}</div>${!S.votes[myKey()] ? `<button class="btn" style="margin-top:10px" data-a="sp-revote">Votar</button>` : ''}</section>` }
on('sp-revote', voteSheet);
V.spot = code => {
  if (S.role && S.code === code) return V.spots();
  if (!A.inApp) return top({ back: 1 }) + `<section class="card" style="margin-top:12px;background:linear-gradient(160deg,var(--pcl),var(--pc));color:var(--onpc);text-align:center">${badge('podcasts')}<h2 style="font-size:24px;margin:14px 0 6px">Te invitaron a un Spot</h2><p style="opacity:.85">Los Spots se escuchan en la app aeffy para Android. Descárgala y vuelve a abrir este enlace.</p><a class="btn big" href="${A.APK}">${ms('download')}Descargar aeffy</a>${/android/i.test(navigator.userAgent) ? `<a class="btn g" style="display:flex;margin-top:8px" href="intent://${location.host}/#/spot/${esc(code)}#Intent;scheme=https;package=app.aeffy.music;end">Ya la tengo: abrir el Spot</a>` : ''}</section>`;
  setTimeout(async () => { const sb = A.sb(); if (!sb) return; const { data } = await sb.from('aeffy_spots').select('name,active,max_people,only_users').eq('code', code).maybeSingle(); const b = $('#spInfo'); if (!b) return; if (!data || !data.active) b.innerHTML = `<p class="muted">Este Spot ya se cerró.</p>`; else b.innerHTML = `<h2 style="font-size:26px;margin:6px 0">${esc(data.name)}</h2><p style="opacity:.85">Escuchen lo mismo, al mismo tiempo. Hasta ${data.max_people} personas.</p>${A.session ? '' : `<label class="fld" style="background:rgba(0,0,0,.2)"><small style="color:inherit">Tu nombre</small><input id="spName" maxlength="30" value="${esc(localStorage.getItem('ae_spotname') || '')}" placeholder="Cómo te verán en el Spot"></label>`}<button class="btn big" data-a="sp-joinbtn" data-code="${esc(code)}">${ms('headphones')}Unirme y escuchar</button>${data.only_users && !A.session ? '<p class="small">Este Spot pide iniciar sesión.</p>' : ''}` }, 0);
  return top({ back: 1 }) + `<section class="card" style="margin-top:12px;background:linear-gradient(160deg,var(--pcl),var(--pc));color:var(--onpc)"><div class="label" style="color:inherit">${ms('podcasts')}Spot</div><div id="spInfo"><p>Buscando el Spot…</p></div></section><p class="muted small" style="margin-top:12px">El audio llega en directo desde el teléfono de quien abrió el Spot. Usa audífonos o parlante y sube el volumen.</p>`
};
const spotsHome = V.spots;
V.spots = () => {
  if (!S.role) {
    let h = spotsHome();
    const fs = (A.FR || []).filter(f => f.status === 'accepted' && f.spot_code);
    if (fs.length) h += fs.map(f => `<button class="li" data-a="go" data-v="spot/${esc(f.spot_code)}">${av(f.display_name, 40, f.avatar_url, f.avatar_anim)}<div class="t"><b>Spot de ${esc(f.display_name || '@' + f.handle)}</b><span>${f.title ? ms('graphic_eq') + esc(f.title) + ' · ' + esc(f.artist || '') : 'Abierto ahora'}</span></div><span class="btn t">Entrar</span></button>`).join('');
    return h
  }
  const host = S.role === 'host', st = S.state, t = host ? A.byId(P.cur) : st?.t;
  const covH = host ? (t ? cov(t) : cov(null)) : (t?.cover ? `<div class="cov"><img src="${esc(t.cover)}" alt=""></div>` : cov(null));
  return top() + `<div class="carh" style="align-items:center"><h1 class="h1">${host ? 'Tu Spot' : esc(S.meta?.name || 'Spot')}</h1><span class="lock" style="background:var(--p);color:var(--onp)">${ms('sensors')}En vivo</span></div>
   <section class="card" style="background:linear-gradient(160deg,var(--pcl),var(--pc));color:var(--onpc)"><div style="display:flex;gap:14px;align-items:center"><div style="width:96px">${covH}</div><div style="flex:1;min-width:0"><div class="label" style="color:inherit">${ms('equalizer')}${t ? 'Sonando a la vez' : 'Nada sonando'}</div><h2 style="font-size:20px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t?.name || (host ? 'Pon una canción' : 'Esperando a la anfitriona'))}</h2><div style="opacity:.85">${esc(t?.artist || '')}</div><div class="lyr" id="spLyr" style="font-style:italic;font-weight:600;font-size:14px;margin-top:4px;min-height:20px"></div></div></div>
   ${!host ? `<div style="height:4px;background:rgba(0,0,0,.25);border-radius:4px;margin-top:12px;overflow:hidden"><i id="spProg" style="display:block;height:100%;background:var(--p);width:0"></i></div><div class="small" id="spTime" style="opacity:.8;margin-top:4px"></div>` : ''}
   ${host || S.meta?.allow_control ? `<div class="row2" style="justify-content:center;margin-top:12px"><button class="ib" data-a="sp-ctrl" data-v="prev">${ms('skip_previous', 1)}</button><button class="ck s56" data-a="sp-ctrl" data-v="toggle">${shp('cookie')}${ms(host ? (P.au.paused ? 'play_arrow' : 'pause') : (st?.playing ? 'pause' : 'play_arrow'), 1)}</button><button class="ib" data-a="sp-ctrl" data-v="next">${ms('skip_next', 1)}</button></div>` : ''}
   ${S.needTap ? `<button class="btn" style="margin-top:12px" data-a="sp-tap">${ms('volume_up')}Toca para escuchar</button>` : ''}
   ${!host && S.conn && S.conn !== 'connected' ? `<p class="small" style="margin:10px 0 0">${S.conn === 'failed' ? 'No se pudo conectar el audio con tu red. Prueba con otra red wifi o datos.' : 'Conectando el audio…'}</p>` : ''}</section>
   ${host ? `<section class="card" style="margin-top:12px"><h3>Invita a tus amigos</h3><p class="muted small">Envíales este enlace: lo abren en el navegador y ya están dentro.</p><div class="search" style="margin:8px 0 0"><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(location.host + '/#/spot/' + S.code)}</span><button class="btn t" data-a="sp-copy">${ms('content_copy')}Copiar enlace</button></div></section>` : ''}
   <section class="card" style="margin-top:12px"><div class="carh"><div><h3>En el Spot</h3><p>${S.people.length} de ${S.meta?.max_people || 4} personas escuchando</p></div><button class="btn t" data-a="sp-vote">${ms('how_to_vote')}Lanzar votación</button></div>${people()}</section>
   ${voteBox()}${chatBox()}
   <div class="foot"><button class="btn d" data-a="${host ? 'sp-end' : 'sp-leave'}">${ms(host ? 'stop_circle' : 'logout')}${host ? 'Cerrar el Spot' : 'Salir del Spot'}</button></div>`
};
A.spotPaint = chatOnly => { const { v, arg } = A.route(); if (v !== 'spots' && !(v === 'spot' && arg === S.code)) return; if (chatOnly) { const l = $('#spChatList'); if (l) { l.innerHTML = S.chat.map(m => `<div class="msg">${av(m.n, 28)}<div><b>${esc(m.n)}</b><p>${esc(m.t)}</p></div></div>`).join(''); l.scrollTop = l.scrollHeight; return } } const f = document.activeElement?.id === 'spMsg' ? $('#spMsg').value : null; A.render(); if (f !== null) { const i = $('#spMsg'); if (i) { i.value = f; i.focus() } } };

/* =================== AMIGOS =================== */
A.FR = [];
A.loadFriends = async () => { const sb = A.sb(); if (!sb || !A.session) { A.FR = []; return } const { data } = await sb.rpc('aeffy_friend_list'); A.FR = data || []; const { v } = A.route(); if (v === 'amigos' || v === 'spots') A.render(); paintDrawerFriends() };
let lastPub = 0, pubT = null;
A.publishNow = () => { clearTimeout(pubT); pubT = setTimeout(doPublish, Date.now() - lastPub > 4000 ? 50 : 4000) };
async function doPublish() {
  const sb = A.sb(); if (!sb || !A.session) return; lastPub = Date.now(); const t = A.byId(P.cur);
  const show = A.ST.showFriends !== false;
  const row = { user_id: A.session.user.id, title: show && t ? t.name : null, artist: show && t ? t.artist : null, album: show && t ? t.album : null, cover: show && t ? (t._thumb || (t._thumb = await thumb(t.cover, 160))) : null, playing: show && !!t && !P.au.paused, spot_code: S.role === 'host' ? S.code : null, updated_at: new Date().toISOString() };
  try { await sb.from('aeffy_now').upsert(row) } catch (e) { }
}
let frCh = null;
A.liveStart = () => {
  const sb = A.sb(); if (!sb || !A.session) return;
  A.loadFriends(); if (frCh) sb.removeChannel(frCh);
  frCh = sb.channel('aeffy-fr-' + A.session.user.id).on('postgres_changes', { event: '*', schema: 'public', table: 'aeffy_now' }, () => A.loadFriends()).on('postgres_changes', { event: '*', schema: 'public', table: 'aeffy_friends' }, () => A.loadFriends()).subscribe();
  recastStart(); A.publishNow()
};
setInterval(() => { if (!document.hidden && A.session) A.loadFriends() }, 45000);
function friendRow(f) {
  const live = f.playing && f.updated_at && Date.now() - new Date(f.updated_at) < 15 * 60000;
  return `<div class="li" data-a="go" data-v="u/${esc(f.id)}" role="button" tabindex="0">${f.cover ? `<div class="cov s48 round"><img src="${esc(f.cover)}" alt=""></div>` : av(f.display_name, 48, f.avatar_url, f.avatar_anim)}<div class="t"><b>${esc(f.display_name || '@' + f.handle)}</b><span>${f.title ? (live ? ms('graphic_eq') : '') + esc(f.title) + ' · ' + esc(f.artist || '') + (live ? '' : ' · ' + ago(f.updated_at)) : f.handle ? '@' + esc(f.handle) : ''}</span></div>${f.spot_code ? `<button class="btn t" data-a="go" data-v="spot/${esc(f.spot_code)}">${ms('podcasts')}Spot</button>` : ''}${f.status === 'accepted' ? `<button class="ib" data-a="go" data-v="chat/${esc(f.id)}" aria-label="Mandar mensaje">${ms('chat_bubble')}${A.unreadFrom && A.unreadFrom(f.id) ? '<i class="udot"></i>' : ''}</button>` : ''}<button class="ib" data-a="fr-menu" data-id="${f.id}" aria-label="Opciones">${ms('more_vert')}</button></div>`
}
function paintDrawerFriends() { const d = $('#drawer .fr'); if (!d) return; const L = (A.FR || []).filter(f => f.status === 'accepted' && f.title).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 6); d.innerHTML = `<b style="font-family:var(--hf);font-size:16px">Tus amigos ahora</b>` + (L.length ? L.map(friendRow).join('') : `<p class="muted small" style="margin:6px 0 0">Cuando tus amigos escuchen algo, aparecerá aquí.</p>`) }
A.paintDrawerFriends = paintDrawerFriends;
const oldAmigos = V.amigos;
V.amigos = () => {
  if (!A.session) return oldAmigos();
  const FR = A.FR || [], inc = FR.filter(f => f.status === 'pending' && f.incoming), out = FR.filter(f => f.status === 'pending' && !f.incoming), acc = FR.filter(f => f.status === 'accepted').sort((a, b) => (b.playing ? 1 : 0) - (a.playing ? 1 : 0) || new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  return top({ back: 1 }) + `<h1 class="h1">Amigos</h1>
   <section class="card" style="background:linear-gradient(160deg,var(--pcl),var(--pc));color:var(--onpc)"><div style="display:flex;gap:14px;align-items:center"><span class="avatar" style="width:56px;height:56px">${shp('cookie')}${A.avImg()}</span><div><b style="font-family:var(--hf);font-size:20px">${esc(A.me?.display_name || 'Tú')}</b><div style="opacity:.85">${A.me?.handle ? '@' + esc(A.me.handle) : 'Elige tu @nombre para que te encuentren'}</div></div></div>${A.me?.handle ? `<button class="btn" style="margin-top:12px" data-a="fr-share">${ms('share')}Compartir mi @nombre</button>` : `<button class="btn" style="margin-top:12px" data-a="go" data-v="ajustes/perfil">${ms('alternate_email')}Elegir @nombre</button>`}</section>
   <form id="frAdd" class="search" style="margin-top:14px">${ms('person_add')}<input id="frH" placeholder="Agrega a alguien por su @nombre" autocapitalize="off" autocomplete="off"><button class="btn t">Agregar</button></form>
   ${inc.length ? `<div class="sech"><h2>Solicitudes</h2></div>` + inc.map(f => `<div class="li">${av(f.display_name, 48, f.avatar_url, f.avatar_anim)}<div class="t"><b>${esc(f.display_name || '')}</b><span>@${esc(f.handle || '')} quiere ser tu amigo</span></div><button class="btn" data-a="fr-ok" data-id="${f.id}">Aceptar</button><button class="ib" data-a="fr-del" data-id="${f.id}" aria-label="Rechazar">${ms('close')}</button></div>`).join('') : ''}
   <div class="sech"><h2>Lo que escuchan ahora</h2><p>Se actualiza en vivo.</p></div>${acc.length ? acc.map(friendRow).join('') : `<section class="card c">${badge('group')}<h3>Aún no tienes amigos aquí</h3><p>Agrégalos por su @nombre o comparte el tuyo.</p></section>`}
   ${out.length ? `<div class="sech"><h2>Enviadas</h2></div>` + out.map(f => `<div class="li">${av(f.display_name, 40)}<div class="t"><b>${esc(f.display_name || '')}</b><span>Esperando respuesta</span></div><button class="ib" data-a="fr-del" data-id="${f.id}" aria-label="Cancelar">${ms('close')}</button></div>`).join('') : ''}
   <div class="sech"><h2>Invita y gana</h2><p>Gana 12 h de Premium por cada amigo que llegue con tu enlace.</p></div><button class="btn t" data-a="go" data-v="invita">${ms('redeem')}Ver mi enlace</button>`
};
document.addEventListener('submit', async e => {
  if (e.target.id !== 'frAdd') return; e.preventDefault(); const sb = A.sb(); const h = $('#frH').value.trim().replace(/^@/, '').toLowerCase(); if (!h) return;
  const { data } = await sb.rpc('aeffy_find', { p_handle: h }); const u = data && data[0];
  if (!u) { toast('No encontré a @' + h); return } if (u.id === A.session.user.id) { toast('Ese eres tú'); return }
  const ex = (A.FR || []).find(f => f.id === u.id); if (ex) { if (ex.incoming && ex.status === 'pending') { await accept(u.id) } else toast(ex.status === 'accepted' ? 'Ya son amigos' : 'Ya le enviaste solicitud'); return }
  const { error } = await sb.from('aeffy_friends').insert({ a: A.session.user.id, b: u.id }); if (error) toast('No se pudo enviar'); else { toast('Solicitud enviada a @' + u.handle); A.loadFriends() }
});
async function accept(id) { await A.sb().from('aeffy_friends').update({ status: 'accepted' }).eq('a', id).eq('b', A.session.user.id); toast('Ahora son amigos'); A.loadFriends() }
on('fr-ok', el => accept(el.dataset.id));
on('fr-del', async el => { const me = A.session.user.id, id = el.dataset.id; await A.sb().from('aeffy_friends').delete().or(`and(a.eq.${me},b.eq.${id}),and(a.eq.${id},b.eq.${me})`); A.popLayer && document.querySelector('.scrim') && A.popLayer(); A.loadFriends() });
on('fr-menu', el => { const f = A.FR.find(x => x.id === el.dataset.id); A.sheet(`<div class="grab"></div><div class="shtrack">${av(f.display_name, 48, f.avatar_url, f.avatar_anim)}<div><b>${esc(f.display_name || '')}</b><span>@${esc(f.handle || '')}</span></div></div>${f.spot_code ? `<button class="mi" data-a="go" data-v="spot/${esc(f.spot_code)}">${ms('podcasts')}Entrar a su Spot</button>` : ''}${f.title ? `<button class="mi" data-a="fr-find" data-t="${esc(f.title)}">${ms('search')}Buscar “${esc(f.title)}” en mi biblioteca</button>` : ''}<button class="mi bad" data-a="fr-del" data-id="${f.id}">${ms('person_remove')}Quitar de amigos</button>`, { head: false }) });
on('fr-find', el => { A.closeAll(); A.go('buscar'); setTimeout(() => { const i = $('#q'); if (i) { i.value = el.dataset.t; i.dispatchEvent(new Event('input', { bubbles: true })) } }, 50) });
on('fr-share', async () => { const txt = 'Agrégame en aeffy: @' + A.me.handle + ' ' + location.origin; try { if (navigator.share) await navigator.share({ text: txt }); else { await navigator.clipboard.writeText(txt); toast('Copiado') } } catch (e) { } });

/* =================== RECAST =================== */
const devId = localStorage.getItem('ae_dev') || (() => { const d = rid(8); localStorage.setItem('ae_dev', d); return d })();
const devName = () => localStorage.getItem('ae_devname') || ((/android/i.test(navigator.userAgent) ? 'Android' : /iphone/i.test(navigator.userAgent) ? 'iPhone' : /ipad/i.test(navigator.userAgent) ? 'iPad' : /windows/i.test(navigator.userAgent) ? 'Computador Windows' : /mac/i.test(navigator.userAgent) ? 'Mac' : 'Este dispositivo'));
const R = A.recast = { ch: null, devs: [] };
function recastStart() {
  const sb = A.sb(); if (!sb || !A.session || A.ST.recast === false) return; if (R.ch) sb.removeChannel(R.ch);
  const ch = R.ch = sb.channel('aeffy-recast-' + A.session.user.id, { config: { broadcast: { self: false }, presence: { key: devId } } });
  ch.on('presence', { event: 'sync' }, () => { const st = ch.presenceState(); R.devs = Object.entries(st).map(([k, v]) => ({ id: k, ...(v[0] || {}) })).filter(d => d.id !== devId); paintRecast() });
  ch.on('broadcast', { event: 'cmd' }, ({ payload: p }) => {
    if (p.to !== devId) return;
    if (p.c === 'toggle') A.toggle(); if (p.c === 'next') A.next(); if (p.c === 'prev') A.prev(); if (p.c === 'pause') P.au.pause();
    if (p.c === 'play') { const t = A.tracks.find(x => x.name.toLowerCase() === (p.t.name || '').toLowerCase() && x.artist.toLowerCase() === (p.t.artist || '').toLowerCase()) || A.tracks.find(x => x.name.toLowerCase() === (p.t.name || '').toLowerCase()); if (t) { A.playList(A.tracks.map(x => x.id), A.tracks.indexOf(t), 'aeffy Recast'); setTimeout(() => { P.au.currentTime = p.pos || 0 }, 600); toast('Sonando aquí desde otro dispositivo') } else { ch.send({ type: 'broadcast', event: 'nf', payload: { to: p.from, name: p.t.name } }) } }
  });
  ch.on('broadcast', { event: 'nf' }, ({ payload }) => { if (payload.to === devId) toast('Ese dispositivo no tiene “' + payload.name + '” en su biblioteca') });
  ch.subscribe(s => { if (s === 'SUBSCRIBED') recastTrack() })
}
let rcT = null;
function recastTrack() { clearTimeout(rcT); rcT = setTimeout(() => { if (!R.ch) return; const t = A.byId(P.cur); R.ch.track({ name: devName(), title: t?.name || null, artist: t?.artist || null, playing: !!t && !P.au.paused, pos: P.au.currentTime || 0, at: Date.now() }) }, 300) }
A.recastTrack = recastTrack;
function recastSheetHtml() {
  const t = A.byId(P.cur);
  return A.shead('devices', 'aeffy Recast') + `<div class="card" style="display:flex;gap:14px;align-items:center;background:var(--s2)"><div style="width:56px;height:56px;border-radius:16px;background:var(--s3);display:grid;place-items:center">${ms('smartphone')}</div><div style="flex:1;min-width:0"><div class="label" style="color:var(--mute)">${ms('equalizer')}Escuchando ahora en:</div><b style="font-size:18px">${esc(devName())}</b><div class="small" style="color:var(--p)">${ms('volume_up')} Su propio altavoz</div><span class="lock" style="background:var(--s3);color:var(--on);margin-top:6px">Este dispositivo</span></div></div>
  <div class="sech"><h2 style="font-size:17px">Tus otros dispositivos</h2><p>${A.session ? 'Con la misma cuenta y aeffy abierta' : 'Inicia sesión en tus dispositivos con la misma cuenta'}</p></div><div id="rcList">${recastList()}</div>
  ${A.session ? '' : `<button class="btn" data-a="login">${ms('login')}Iniciar sesión</button>`}
  <div class="sech"><h2 style="font-size:17px">Parlantes y TV</h2></div><div class="mi">${ms('cast')}<span class="small">Para un parlante o TV, usa el botón de transmitir o Bluetooth de tu teléfono: aeffy sigue siendo el control.</span></div>`
}
function recastList() { if (!A.session) return ''; if (!R.devs.length) return `<div class="mi">${ms('wifi_tethering')}<span class="muted">Buscando dispositivos…</span></div>`; return R.devs.map(d => `<div class="card" style="background:var(--s2);margin-bottom:8px;padding:12px"><div style="display:flex;gap:12px;align-items:center"><span class="ms">${/Android|iPhone/.test(d.name) ? 'smartphone' : 'computer'}</span><div style="flex:1;min-width:0"><b>${esc(d.name)}</b><div class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.title ? (d.playing ? ms('graphic_eq') : ms('pause')) + ' ' + esc(d.title) + ' · ' + esc(d.artist || '') : 'Sin reproducir'}</div></div></div><div class="row2" style="margin-top:8px"><button class="ib t" data-a="rc" data-c="prev" data-to="${d.id}" aria-label="Anterior">${ms('skip_previous', 1)}</button><button class="ib t" data-a="rc" data-c="toggle" data-to="${d.id}" aria-label="Reproducir o pausar">${ms(d.playing ? 'pause' : 'play_arrow', 1)}</button><button class="ib t" data-a="rc" data-c="next" data-to="${d.id}" aria-label="Siguiente">${ms('skip_next', 1)}</button>${P.cur ? `<button class="btn t" data-a="rc-send" data-to="${d.id}">${ms('cast')}Mandar allá</button>` : ''}${d.title ? `<button class="btn t" data-a="rc-take" data-to="${d.id}">${ms('download')}Traer aquí</button>` : ''}</div></div>`).join('') }
function paintRecast() { const l = $('#rcList'); if (l) l.innerHTML = recastList() }
on('recast', () => { if (A.session && !R.ch) recastStart(); A.sheet(recastSheetHtml()) });
on('rc', el => { R.ch && R.ch.send({ type: 'broadcast', event: 'cmd', payload: { to: el.dataset.to, from: devId, c: el.dataset.c } }) });
on('rc-send', el => { const t = A.byId(P.cur); R.ch.send({ type: 'broadcast', event: 'cmd', payload: { to: el.dataset.to, from: devId, c: 'play', t: { name: t.name, artist: t.artist }, pos: P.au.currentTime } }); P.au.pause(); toast('Mandando la música…') });
on('rc-take', el => { const d = R.devs.find(x => x.id === el.dataset.to); const t = A.tracks.find(x => x.name.toLowerCase() === (d.title || '').toLowerCase()); if (!t) { toast('No tienes “' + d.title + '” en este dispositivo'); return } R.ch.send({ type: 'broadcast', event: 'cmd', payload: { to: d.id, from: devId, c: 'pause' } }); A.playList(A.tracks.map(x => x.id), A.tracks.indexOf(t), 'aeffy Recast'); setTimeout(() => { P.au.currentTime = (d.pos || 0) + (d.playing ? (Date.now() - d.at) / 1000 : 0) }, 600); A.popLayer() });

/* =================== TRADUCIR LETRAS =================== */
const SW = { en: ['the', 'you', 'and', 'i', 'me', 'my', 'is', 'to', 'love', 'it', 'in', 'on', 'your', 'we', 'be', 'don\'t', 'can'], es: ['el', 'la', 'que', 'de', 'y', 'yo', 'tu', 'te', 'me', 'mi', 'no', 'en', 'un', 'una', 'por', 'con', 'es', 'quiero'], pt: ['o', 'a', 'que', 'de', 'e', 'eu', 'você', 'não', 'meu', 'é', 'com', 'um', 'uma', 'pra', 'te', 'do', 'da'], fr: ['le', 'la', 'je', 'tu', 'et', 'de', 'que', 'pas', 'les', 'mon', 'moi', 'est', 'un', 'une', 'dans', 'c\'est'], it: ['il', 'la', 'che', 'di', 'e', 'io', 'tu', 'non', 'mi', 'ti', 'un', 'una', 'per', 'sono', 'è', 'con'], de: ['der', 'die', 'das', 'und', 'ich', 'du', 'nicht', 'ist', 'mich', 'mein', 'ein', 'eine', 'zu', 'mit', 'auf'] };
A.detectLang = txt => {
  if (/[぀-ヿ]/.test(txt)) return 'ja'; if (/[가-힯]/.test(txt)) return 'ko'; if (/[一-鿿]/.test(txt)) return 'zh'; if (/[Ѐ-ӿ]/.test(txt)) return 'ru'; if (/[؀-ۿ]/.test(txt)) return 'ar'; if (/[฀-๿]/.test(txt)) return 'th';
  const w = txt.toLowerCase().match(/[a-zà-ÿ']+/g) || []; let best = 'en', bs = -1; for (const [l, L] of Object.entries(SW)) { const set = new Set(L); const s = w.filter(x => set.has(x)).length; if (s > bs) { bs = s; best = l } } return best
};
A.trLang = () => A.ST.trLang || (navigator.language || 'es').slice(0, 2);
A.translateLyrics = async t => {
  const m = A.meta(t.id), to = A.trLang(); if (m.tr && m.tr[to]) return m.tr[to];
  if (!A.session) { A.loginSheet('in'); return null }
  if (!A.can('translate')) { A.go('premium'); toast('Traducir letras es de aeffy Premium'); return null }
  const L = A.parseLRC(A.lyricsOf(t)); const lines = L.length ? L.map(l => l.x) : A.lyricsOf(t).split(/\r?\n/);
  const from = A.detectLang(lines.join(' ')); if (from === to) { toast('La letra ya está en tu idioma'); return null }
  toast('Traduciendo…');
  try { const { data, error } = await A.sb().functions.invoke('aeffy-translate', { body: { lines, from, to } }); if (error || data?.error) throw new Error(data?.error || 'x'); m.tr = m.tr || {}; m.tr[to] = data.lines; A.saveMeta(); return data.lines }
  catch (e) { toast(e.message && e.message !== 'x' ? e.message : 'No pude traducir ahora'); return null }
};

/* =================== GOOGLE =================== */
A.googleLogin = async () => { const sb = A.sb(); if (!sb) { toast('Sin conexión'); return } const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/' } }); if (error) toast(/provider is not enabled|Unsupported provider/i.test(error.message) ? 'Entrar con Google se activa muy pronto' : 'No se pudo abrir Google') };
on('google', () => A.googleLogin());
}
/* aeffy · perfiles entre amigos y playlists compartidas */
'use strict';
{
const { $, esc, ms, toast, shp, cov, on, top, badge } = A;
const V = A.views;
const plural = (n, a, b) => n + ' ' + (n === 1 ? a : b);
const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\(.*?\)|\[.*?\]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

/* ---------- subir mis playlists para que las vean mis amigos ---------- */
let syncT = null, syncing = false;
const save0 = A.saveLists;
A.saveLists = () => { save0(); clearTimeout(syncT); syncT = setTimeout(A.syncLists, 2500) };
const sigOf = c => c ? c.length + ':' + c.slice(-40) : '';
A.syncLists = async () => {
  const sb = A.sb && A.sb(); if (!sb || !A.session || syncing) return; syncing = true;
  try {
    const uid = A.session.user.id; let dirty = false;
    for (const l of A.LISTS) {
      const sg = sigOf(l.cover);
      if (l.cover && l.coverSig !== sg) {
        try {
          const blob = await (await fetch(l.cover)).blob(); const path = uid + '/pl-' + l.id + '-' + Date.now().toString(36) + '.jpg';
          const { error } = await sb.storage.from('aeffy-avatars').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
          if (!error) { l.coverUrl = sb.storage.from('aeffy-avatars').getPublicUrl(path).data.publicUrl; l.coverSig = sg; dirty = true }
        } catch (e) { }
      }
      if (!l.cover && l.coverUrl) { l.coverUrl = null; l.coverSig = ''; dirty = true }
    }
    if (dirty) save0();
    const rows = A.LISTS.map((l, i) => ({ user_id: uid, lid: l.id, name: l.name, descr: l.desc || null, cover_url: l.cover ? l.coverUrl || null : null, visible: l.share !== false, pos: i, updated_at: new Date().toISOString(),
      tracks: l.ids.map(A.byId).filter(Boolean).slice(0, 500).map(t => ({ t: t.name, a: t.artist, al: t.album || '', d: Math.round(t.dur || 0) })) }));
    if (rows.length) await sb.from('aeffy_lists').upsert(rows);
    const keep = A.LISTS.map(l => l.id);
    const { data } = await sb.from('aeffy_lists').select('lid').eq('user_id', uid);
    const gone = (data || []).map(r => r.lid).filter(x => !keep.includes(x));
    if (gone.length) await sb.from('aeffy_lists').delete().eq('user_id', uid).in('lid', gone);
  } catch (e) { }
  syncing = false
};
const ls0 = A.liveStart;
A.liveStart = () => { ls0 && ls0(); setTimeout(A.syncLists, 4000) };

/* ---------- perfil de un amigo (y "así te ven") ---------- */
const FP = A.FP = {};
async function loadFP(id) {
  const sb = A.sb && A.sb(); if (!sb || !A.session) return;
  const { data, error } = await sb.rpc('aeffy_friend_profile', { p_id: id });
  FP[id] = error ? { err: 1 } : (data || { err: 1 }); FP[id].at = Date.now();
  const { v, arg } = A.route(); if (v === 'u' && arg.split('~')[0] === id) A.render()
}
function mine(tr) {
  const ix = A._ix || (A._ix = new Map()); if (ix._n !== A.tracks.length) { ix.clear(); for (const t of A.tracks) ix.set(norm(t.name) + '|' + norm(t.artist), t.id); ix._n = A.tracks.length }
  return ix.get(norm(tr.t) + '|' + norm(tr.a)) || null
}
const avBig = (p, shape) => p.avatar_url ? `<svg class="avsvg"${p.avatar_anim ? ` data-av="${esc(p.avatar_anim)}"` : ''} viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="fpav"><path d="${p.avatar_anim && A.shapePath ? A.shapePath(String(p.avatar_anim).split('|')[0]) : A.SH[shape]}"/></clipPath></defs><image href="${esc(p.avatar_url)}" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#fpav)"/></svg>` : `<b${p.avatar_anim ? ` data-av="${esc(p.avatar_anim)}"` : ''}>${esc((p.display_name || p.handle || '?').trim().charAt(0).toUpperCase())}</b>`;
const plCover = (l, cls = '') => l.cover_url ? `<div class="cov ${cls}"><img src="${esc(l.cover_url)}" alt="" loading="lazy"></div>` : `<div class="cov ${cls}" style="background:linear-gradient(140deg,var(--pcl),var(--pc));display:grid;place-items:center">${ms('queue_music', 1)}</div>`;

V.u = arg => {
  const [id, lid] = (arg || '').split('~');
  if (!A.session) return top({ back: 1 }) + `<section class="card c">${badge('person')}<h3>Inicia sesión</h3><p>Para ver perfiles de tus amigos necesitas tu cuenta aeffy.</p><button class="btn" data-a="login">Iniciar sesión</button></section>`;
  const p = FP[id];
  if (!p || Date.now() - p.at > 60000) loadFP(id);
  if (!p) return top({ back: 1 }) + `<div class="ban"></div><div class="prof"><div class="avatar">${shp('flower')}</div><h2 class="muted">Cargando…</h2></div>`;
  if (p.err) return top({ back: 1 }) + `<section class="card c">${badge('lock')}<h3>Este perfil es privado</h3><p>Solo tus amigos pueden ver el perfil y las playlists de otra persona.</p></section>`;
  if (lid) return listView(p, lid);
  const me = A.session.user.id === p.id, col = p.color ? `--ph:${+p.color};` : '';
  const ban = p.banner_url ? `<div class="ban img" style="${col}background-image:url('${esc(p.banner_url)}')"></div>` : `<div class="ban" style="${col}"></div>`;
  const n = p.now, live = n && n.playing && Date.now() - new Date(n.updated_at) < 15 * 60000;
  const h = Math.round((p.minutes || 0) / 60);
  return top({ back: 1 }) + (me ? `<div class="viewas">${ms('visibility')}Así ven tu perfil tus amigos</div>` : '') + ban + `<div class="prof" style="${col}"><div class="avatar">${shp('flower')}${avBig(p, 'flower')}</div><h2>${esc(p.display_name || '@' + p.handle)}</h2>${p.handle ? `<div class="muted">@${esc(p.handle)}</div>` : ''}${p.premium ? `<span class="pbadge">${ms('crown', 1)}Premium</span>` : ''}
   ${p.bio ? `<p class="pbio">${esc(p.bio)}</p>` : ''}
   <div class="counts"><div><b>${p.lists.length}</b><span>playlists</span></div><div><b>${p.friends || 0}</b><span>amigos</span></div><div><b>${h}</b><span>horas escuchadas</span></div></div>
   ${me ? `<button class="btn" data-a="go" data-v="ajustes/perfil">${ms('edit')}Editar perfil</button>` : `<button class="btn" data-a="go" data-v="chat/${esc(p.id)}">${ms('chat_bubble')}Mandar mensaje</button>`}</div>
   ${n && n.title ? `<div class="sech"><h2>${live ? 'Escuchando ahora' : 'Lo último que escuchó'}</h2></div><div class="card fpnow">${n.cover ? `<div class="cov s56"><img src="${esc(n.cover)}" alt=""></div>` : `<div class="cov s56 gen">${ms('music_note')}</div>`}<div class="t"><b>${esc(n.title)}</b><span>${esc(n.artist || '')}${n.album ? ' · ' + esc(n.album) : ''}</span><small>${live ? ms('graphic_eq') + 'Sonando ahora' : ''}</small></div></div>` : ''}
   <div class="sech"><h2>Playlists</h2>${me ? `<p>Tus amigos ven las playlists que tienes marcadas como visibles.</p>` : ''}</div>
   ${p.lists.length ? `<div class="fpgrid">${p.lists.map(l => `<button class="fpl" data-a="go" data-v="u/${esc(p.id)}~${esc(l.lid)}">${plCover(l)}<b>${esc(l.name)}</b><span>${plural(l.tracks.length, 'canción', 'canciones')}</span></button>`).join('')}</div>` : `<section class="card c">${badge('queue_music')}<h3>${me ? 'Aún no compartes playlists' : 'Todavía no hay playlists'}</h3>${me ? '<p>Crea una playlist en tu Biblioteca y aparecerá aquí.</p>' : ''}</section>`}`
};
function listView(p, lid) {
  const l = p.lists.find(x => x.lid === lid); if (!l) return top({ back: 1 }) + `<section class="card c">${badge('queue_music')}<h3>Esta playlist ya no está</h3></section>`;
  const ids = []; const rowsH = l.tracks.map((tr, i) => { const id = mine(tr); if (id) ids.push(id); const t = id && A.byId(id);
    return id ? `<div class="li" data-a="playin" data-id="${id}" data-ctx="fpl" role="button" tabindex="0">${cov(t, 's48')}<div class="t"><b>${esc(tr.t)}</b><span>${esc(tr.a)}</span></div></div>`
              : `<div class="li off"><div class="cov s48 gen" style="--ch:${A.hueOf(tr.al + tr.a)}">${ms('music_off')}</div><div class="t"><b>${esc(tr.t)}</b><span>${esc(tr.a)} · No la tienes en tu teléfono</span></div></div>` }).join('');
  A.ctx.fpl = ids;
  const mine0 = A.session.user.id === p.id;
  return top({ back: 1 }) + `<div style="text-align:center;margin-top:6px"><div style="width:min(240px,62vw);margin:0 auto">${plCover(l, 'big')}</div></div>
   <div class="label" style="margin-top:18px;color:var(--mute);text-align:center">Playlist de ${esc(p.display_name || '@' + p.handle)}</div><h1 class="h1" style="font-size:30px;text-align:center">${esc(l.name)}</h1><div class="sub" style="text-align:center">${esc(l.descr || '')}${l.descr ? ' · ' : ''}${plural(l.tracks.length, 'canción', 'canciones')}${mine0 ? '' : ' · tienes ' + ids.length}</div>
   <div class="row2" style="justify-content:center;margin:14px 0">${ids.length ? `<button class="btn" data-a="playctx" data-ctx="fpl" data-from="${esc(l.name)}">${ms('play_arrow', 1)}Reproducir las que tengo</button>` : ''}${!mine0 && ids.length ? `<button class="btn t" data-a="fpcopy" data-v="${esc(p.id)}~${esc(l.lid)}">${ms('library_add')}Guardar copia</button>` : ''}</div>
   ${rowsH || `<section class="card c"><p>Esta playlist está vacía.</p></section>`}`
}
on('fpcopy', el => { const [id, lid] = el.dataset.v.split('~'); const p = FP[id]; const l = p && p.lists.find(x => x.lid === lid); if (!l) return; const ids = l.tracks.map(mine).filter(Boolean);
  A.LISTS.unshift({ id: 'l' + Date.now().toString(36), name: l.name, desc: 'De ' + (p.display_name || '@' + p.handle), ids, share: false }); A.saveLists(); toast('Guardada en tu Biblioteca') });
on('viewas', () => { if (A.session) A.go('u/' + A.session.user.id) });
}
/* aeffy · arranque, eventos, disco arrastrable, instalación */
'use strict';
{
const { $, $$, ms, esc, toast, P } = A;

/* clics delegados */
document.addEventListener('click', e => {
  if (dragJustEnded) { e.preventDefault(); e.stopPropagation(); return }
  const el = e.target.closest('[data-a]'); if (!el) return;
  const f = A.ACT[el.dataset.a]; if (!f) return;
  if (el.tagName === 'A') return;
  e.preventDefault(); e.stopPropagation(); f(el, e)
}, true);
document.addEventListener('keydown', e => {
  const tag = (e.target.tagName || '').toLowerCase();
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.li[data-a]')) { e.preventDefault(); A.ACT[e.target.dataset.a](e.target); return }
  if (e.key === 'Escape') { A.popLayer(); return }
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
  if (e.key === ' ' && tag !== 'button') { e.preventDefault(); A.toggle() }
});
$('#fIn').addEventListener('change', e => { A.importFiles(e.target.files, A.render); e.target.value = '' });
$('#dIn').addEventListener('change', e => { A.importFiles(e.target.files, A.render); e.target.value = '' });
let dragN = 0;
document.addEventListener('dragenter', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { dragN++; $('#drop').classList.remove('hide') } });
document.addEventListener('dragleave', () => { dragN = Math.max(0, dragN - 1); if (!dragN) $('#drop').classList.add('hide') });
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => { e.preventDefault(); dragN = 0; $('#drop').classList.add('hide'); if (e.dataTransfer?.files.length) A.importFiles(e.dataTransfer.files, A.render) });

/* ---------- disco arrastrable al tocadiscos ---------- */
let pressT = null, drag = null, dragJustEnded = false, sx = 0, sy = 0;
function startDrag(tile, x, y) {
  const g = A.albums().find(a => a.name === tile.dataset.k); if (!g) return;
  const d = document.createElement('div'); d.className = 'dragdisc';
  d.innerHTML = `<div class="vinyl"><div class="lab">${g.cv && g.cv.cover ? `<img src="${esc(g.cv.cover)}" alt="">` : ''}</div></div>`;
  document.body.appendChild(d); drag = { d, g }; moveDrag(x, y); navigator.vibrate && navigator.vibrate(15);
  const tt = $('#tt'); if (tt) tt.classList.add('target')
}
function moveDrag(x, y) { if (!drag) return; drag.d.style.transform = `translate(${x - 60}px,${y - 60}px)`; const tt = $('#tt'); if (tt) { const r = tt.getBoundingClientRect(); tt.classList.toggle('over', x > r.left && x < r.right && y > r.top && y < r.bottom) } }
function endDrag(x, y) {
  if (!drag) return; const tt = $('#tt'); let hit = false;
  if (tt) { const r = tt.getBoundingClientRect(); hit = x > r.left && x < r.right && y > r.top && y < r.bottom; tt.classList.remove('target', 'over') }
  const { d, g } = drag; drag = null; dragJustEnded = true; setTimeout(() => dragJustEnded = false, 350);
  if (hit) { const p = $('.plat', tt).getBoundingClientRect(); d.style.transition = 'transform .35s cubic-bezier(.3,.7,.3,1),opacity .35s'; d.style.transform = `translate(${p.left + p.width / 2 - 60}px,${p.top + p.height / 2 - 60}px) scale(${p.width / 120})`; setTimeout(() => { d.remove(); A.ctx.album = g.items.map(t => t.id); A.playList(A.ctx.album, 0, 'Álbum · ' + g.name) }, 360) }
  else { d.style.transition = 'opacity .25s,transform .25s'; d.style.opacity = '0'; setTimeout(() => d.remove(), 260) }
}
document.addEventListener('touchstart', e => { const tile = e.target.closest('.tile[data-a="playalbum"]'); if (!tile) return; const t = e.touches[0]; sx = t.clientX; sy = t.clientY; clearTimeout(pressT); pressT = setTimeout(() => startDrag(tile, sx, sy), 320) }, { passive: true });
document.addEventListener('touchmove', e => { const t = e.touches[0]; if (drag) { e.preventDefault(); moveDrag(t.clientX, t.clientY) } else if (pressT && Math.hypot(t.clientX - sx, t.clientY - sy) > 10) { clearTimeout(pressT); pressT = null } }, { passive: false });
document.addEventListener('touchend', e => { clearTimeout(pressT); pressT = null; if (drag) { const t = e.changedTouches[0]; endDrag(t.clientX, t.clientY) } });
document.addEventListener('contextmenu', e => { if (e.target.closest('.tile[data-a="playalbum"]')) e.preventDefault() });
document.addEventListener('mousedown', e => { const tile = e.target.closest('.tile[data-a="playalbum"]'); if (!tile || e.button) return; e.preventDefault(); sx = e.clientX; sy = e.clientY; const mv = ev => { if (!drag && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 12) startDrag(tile, ev.clientX, ev.clientY); else moveDrag(ev.clientX, ev.clientY) }; const up = ev => { removeEventListener('mousemove', mv); removeEventListener('mouseup', up); if (drag) endDrag(ev.clientX, ev.clientY) }; addEventListener('mousemove', mv); addEventListener('mouseup', up) });

/* ---------- la app de Android ---------- */
{ const q = new URLSearchParams(location.search); if (q.get('src') === 'twa' || document.referrer.startsWith('android-app://')) { try { localStorage.setItem('ae_inapp', '1') } catch (e) { } } }
A.inApp = (() => { try { return localStorage.getItem('ae_inapp') === '1' } catch (e) { return false } })();
A.APK = '/aeffy.apk';
addEventListener('beforeinstallprompt', e => e.preventDefault());
A.installHtml = () => { if (A.inApp || localStorage.getItem('ae_noinst')) return ''; return `<div class="install">${A.logo(40)}<div class="t"><b>Descarga aeffy para Android</b><br><span class="muted small">La app completa, con Spots para escuchar con tus amigos.</span></div><a class="btn" href="${A.APK}">Descargar</a><button class="ib" data-a="noinst" aria-label="Cerrar">${ms('close')}</button></div>` };
A.downloadSheet = why => A.sheet(A.shead('android', 'Descarga aeffy', why || 'Esto funciona en la app aeffy para Android.') + `<a class="btn big" style="width:100%" href="${A.APK}">${ms('download')}Descargar aeffy para Android</a><p class="small muted" style="margin:12px 0 0">Abre el archivo aeffy.apk y, si Android te lo pide, permite instalar apps de esta fuente.</p>${/android/i.test(navigator.userAgent) ? `<a class="btn g" style="width:100%;margin-top:6px" href="intent://${location.host}/${location.hash}#Intent;scheme=https;package=app.aeffy.music;end">Ya la tengo: abrir aeffy</a>` : ''}`);
A.on('noinst', () => { localStorage.setItem('ae_noinst', 1); A.render() });
if ('serviceWorker' in navigator && location.protocol === 'https:' && !window.AeffyNative) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => { }));

/* avisos en vivo: amigos, Recast, Spot */
A.liveNotify = () => { A.publishNow && A.publishNow(); A.recastTrack && A.recastTrack(); A.spotPush && A.spotPush(); if (A.route().v === 'spots' && A.spot?.role === 'host') A.spotPaint() };
document.addEventListener('input', e => { if (e.target.id === 'devName') { localStorage.setItem('ae_devname', e.target.value.trim().slice(0, 30)); A.recastTrack && A.recastTrack() } });
/* guardar al salir */
addEventListener('pagehide', A.saveStats);
document.addEventListener('visibilitychange', () => { if (document.hidden) { A.saveStats(); if (A.ST.backupAuto) autoBackup() } });
function autoBackup() { const k = A.dkey(new Date()); if (localStorage.getItem('ae_bkday') === k) return; try { localStorage.setItem('ae_autobk', A.backupData()); localStorage.setItem('ae_bkday', k); localStorage.setItem('ae_lastbk', new Date().toLocaleString('es')) } catch (e) { } }

/* ---------- inicio ---------- */
(async () => {
  A.repaint();
  matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', A.repaint);
  if (!location.hash) history.replaceState(null, '', A.ST.remember && localStorage.getItem('ae_last') ? localStorage.getItem('ae_last') : '#/inicio');
  addEventListener('hashchange', () => { if (A.ST.remember) localStorage.setItem('ae_last', location.hash) });
  A.render();
  await A.loadLibrary(); A.render();
  A.afterBoot && A.afterBoot();
  A.resumeNow && A.resumeNow();
  A.cloudInit && A.cloudInit();
})();
}
/* aeffy · dentro de la app de Android: lee la música del teléfono sola */
'use strict';
{
const { $, esc, ms, toast, P, on } = A;
const N = window.AeffyNative;
A.BUILD = 24;
A.native = !!N;
if (N) {
  try { localStorage.setItem('ae_inapp', '1') } catch (e) { }
  A.inApp = true;
  document.documentElement.classList.add('native');
  /* dentro de la app no usamos service worker: tapaba la música del teléfono */
  try { if (navigator.serviceWorker) navigator.serviceWorker.getRegistrations().then(rs => { rs.forEach(r => r.unregister()); if (navigator.serviceWorker.controller && !sessionStorage.getItem('ae_swoff')) { sessionStorage.setItem('ae_swoff', '1'); setTimeout(() => location.reload(), 150) } }) } catch (e) { }
  A._artfix = !localStorage.getItem('ae_artfix3');

  const delT = A.deleteTrack;
  A.deleteTrack = async id => { const t = A.byId(id); await delT(id); if (t && t.native) { A.meta(id).hidden = 1; A.saveMeta() } };

  /* botón atrás del teléfono */
  A.nativeBack = () => {
    if (document.querySelector('.scrim, .drawer.open') || $('#fp').classList.contains('open')) { A.popLayer(); return true }
    const { v } = A.route();
    if (v !== 'inicio') { if (['buscar', 'biblioteca', 'spots'].includes(v)) A.go('inicio', true); else A.back(); return true }
    return false
  };

  /* permiso y escaneo */
  A.nativeHasPerm = () => { try { return N.hasPermission() } catch (e) { return false } };
  let scanning = false, lastScan = 0;
  const extOf = (mime, name) => { const m = { 'audio/mpeg': 'MP3', 'audio/flac': 'FLAC', 'audio/x-flac': 'FLAC', 'audio/mp4': 'M4A', 'audio/aac': 'AAC', 'audio/ogg': 'OGG', 'audio/opus': 'OPUS', 'audio/wav': 'WAV', 'audio/x-wav': 'WAV' }[mime]; return m || ((name || '').split('.').pop() || '').toUpperCase() };
  A.nativeScan = async (quiet) => {
    if (scanning || !A.nativeHasPerm()) return; scanning = true; lastScan = Date.now();
    let all = []; try { all = JSON.parse(N.scan() || '[]') } catch (e) { all = [] }
    A._nall = all;
    if (!Array.isArray(A.ST.folders)) { scanning = false; if (all.length) { A.folderSheet(true); return } }
    const list = all.filter(m => A.inFolders(m.path || ''));
    const seen = new Set(); let added = 0, removed = 0;
    for (const m of list) {
      const id = 'n' + m.id; seen.add(id); if (A.META[id] && A.META[id].hidden) continue;
      let t = A.byId(id);
      const fields = { file: m.name, folder: m.path || '', size: m.size, name: m.title || A.base(m.name || 'Canción'), artist: m.artist || 'Artista desconocido', albumArtist: m.albumArtist || '', album: m.album || (m.path || '').split('/').pop() || 'Sin álbum', year: m.year ? String(m.year) : '', track: (m.track || 0) % 1000, ext: extOf(m.mime, m.name), dur: (m.duration || 0) / 1000, native: 1, nid: m.id, albumId: m.albumId };
      if (!t) { t = { id, addedAt: (m.added || 0) * 1000 || Date.now(), cover: null, hue: null, sat: null, lrc: '', uslt: '', ...fields }; A.tracks.push(t); added++ }
      else Object.assign(t, fields);
      A.saveTrack(t)
    }
    for (const t of [...A.tracks]) if (t.native && !seen.has(t.id)) { A.tracks = A.tracks.filter(x => x !== t); A.tx('meta', 'readwrite', s => s.delete(t.id)); removed++ }
    scanning = false; A.render();
    if (!quiet || added || removed) toast(added ? `Encontré ${added} ${added === 1 ? 'canción' : 'canciones'}` : removed ? `Quité ${removed} ${removed === 1 ? 'canción' : 'canciones'} de otras carpetas` : list.length ? 'Tu biblioteca está al día' : all.length ? 'No hay música en las carpetas que elegiste' : 'No encontré música en el teléfono');
    paintCovers()
  };
  /* portadas y colores, de a poco y por álbum */
  let painting = false;
  async function paintCovers() {
    if (painting) return; painting = true; const done = {};
    const sw = !!(navigator.serviceWorker && navigator.serviceWorker.controller);
    if (A._artfix && !sw) { A._artfix = 0; localStorage.setItem('ae_artfix3', '1'); for (const t of A.tracks) if (t.native && t.noArt) { delete t.noArt; t.cover = null } }
    if (sw) { painting = false; return }
    const todo = A.tracks.filter(t => t.native && t.cover === null && !t.noArt);
    let n = 0;
    for (const t of todo) {
      const key = t.albumId != null ? 'a' + t.albumId : t.album + '|' + t.artist;
      if (done[key]) { Object.assign(t, done[key]); A.saveTrack(t); continue }
      try {
        const r = await fetch('/__native/art/' + t.nid + '?s=512');
        if (r.ok) { const c = await A.shrinkCover(await r.blob()); done[key] = { cover: c.url, hue: c.hue, sat: c.sat }; Object.assign(t, done[key]) }
        else if (r.headers.get('x-aeffy') || r.status === 404 && !r.headers.get('server')) { t.noArt = 1; t.hue = A.hueOf(t.album + t.artist); t.sat = .55; done[key] = { noArt: 1, hue: t.hue, sat: .55 } }
      } catch (e) { }
      A.saveTrack(t);
      if (++n % 12 === 0) { A.render(); await new Promise(r => setTimeout(r, 30)) }
    }
    painting = false; if (n) A.render()
  }
  window.AeffyNativeCb = (k, v) => {
    if (k === 'perm') { if (v) { if (Array.isArray(A.ST.folders)) toast('Buscando tu música…'); A.nativeScan() } else { toast('Sin permiso no puedo ver tu música'); A.render() } }
    if (k === 'resume' && A.nativeHasPerm() && Date.now() - lastScan > 5 * 60000) A.nativeScan(true);
    if (k === 'resume') fetch('/v.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).then(j => { if (j && j.v && A.BUILD && j.v > A.BUILD) A.pendingUpdate = 1 }).catch(() => { });
  };
  on('nperm', () => { try { N.requestPermission() } catch (e) { } });
  on('import-dir', () => { if (!A.nativeHasPerm()) { N.requestPermission(); return } try { A._nall = JSON.parse(N.scan() || '[]') } catch (e) { } A.folderSheet(false) });
  on('nrescan', () => { if (A.nativeHasPerm()) { toast('Buscando música nueva…'); A.nativeScan() } else N.requestPermission() });

  /* carpetas: aeffy solo lee las que elijas */
  const rootOf = p => { const s = (p || '').split('/').filter(Boolean); if (!s.length) return ''; if (/^android$/i.test(s[0])) return s.slice(0, Math.min(s.length, 4)).join('/'); return s[0] };
  const SKIP = /whatsapp|telegram|signal|messenger|record|grabaci|ringtone|tono|notification|notificacion|alarm|call|llamada|voice|voz|podcast|audiobook|android\/data|android\/media\/com\.(?!.*music)/i;
  const LIKE = /^(music|m[uú]sica|musicas|download|downloads|descargas|audio|audios|songs|canciones|mp3|flac)$/i;
  const nice = r => { const s = r.split('/'); if (/^android$/i.test(s[0])) { const pk = (s[2] || '').split('.').pop(); return (s[3] || pk || r).replace(/^\w/, c => c.toUpperCase()) } return r };
  A.inFolders = path => { const f = A.ST.folders; if (!Array.isArray(f)) return true; return f.some(r => path === r || path.startsWith(r + '/')) };
  let pick = null;
  A.folderSheet = first => {
    const all = A._nall || []; const cnt = {};
    for (const m of all) { const r = rootOf(m.path); cnt[r] = (cnt[r] || 0) + 1 }
    const roots = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]);
    if (Array.isArray(A.ST.folders)) pick = new Set(A.ST.folders.filter(r => r in cnt));
    else { pick = new Set(roots.filter(r => LIKE.test(r))); if (!pick.size) roots.filter(r => !SKIP.test(r)).forEach(r => pick.add(r)) }
    const row = r => `<button class="si fold${pick.has(r) ? ' on' : ''}" data-a="nfold" data-v="${esc(r)}"><span class="ic">${ms(SKIP.test(r) ? 'forum' : 'folder')}</span><span class="t"><b>${esc(nice(r) || 'Almacenamiento principal')}</b><span>${cnt[r]} ${cnt[r] === 1 ? 'audio' : 'audios'}${r && nice(r) !== r ? ' · ' + esc(r) : ''}</span></span><span class="ck">${ms('check')}</span></button>`;
    A.sheet(A.shead('folder_open', 'Elige tus carpetas de música', 'aeffy solo leerá las canciones de las carpetas que marques. Las demás, como audios de WhatsApp o grabaciones, quedan fuera.') +
      `<div style="max-height:46vh;overflow:auto;margin:4px 0">${roots.length ? roots.map(row).join('') : '<p class="muted" style="padding:16px">No encontré audios en el teléfono.</p>'}</div><div class="foot">${first ? '' : '<button class="btn t" data-a="closesheet">Cancelar</button>'}<button class="btn" data-a="nfoldok">Listo</button></div>`)
  };
  on('nfold', el => { const r = el.dataset.v; if (pick.has(r)) pick.delete(r); else pick.add(r); el.classList.toggle('on', pick.has(r)) });
  on('nfoldok', () => { if (!pick || !pick.size) { toast('Marca al menos una carpeta'); return } A.ST.folders = [...pick]; A.saveSet(); A.popLayer(); toast('Buscando tu música…'); A.nativeScan() });

  /* notificación y pantalla de bloqueo */
  const prevNotify = A.liveNotify;
  let nT = null;
  A.liveNotify = () => { prevNotify && prevNotify(); clearTimeout(nT); nT = setTimeout(() => { const t = A.byId(P.cur); if (!t) return; try { N.nowPlaying(t.name, t.artist, t.album || '', !P.au.paused, t.native ? t.nid : -1, P.au.currentTime || 0, P.au.duration || t.dur || 0) } catch (e) { } }, 120) };

  /* pantalla de inicio sin permiso: como Sosu */
  const vInicio = A.views.inicio;
  A.views.inicio = arg => {
    let h = vInicio(arg).replace('data-a="import-dir"><span class="ms" aria-hidden="true">add_circle</span>Actualizar', 'data-a="nrescan"><span class="ms" aria-hidden="true">add_circle</span>Actualizar');
    if (!A.nativeHasPerm()) h = h.replace(/<section class="card c">[\s\S]*?Tu tocadiscos te espera[\s\S]*?<\/section>/, `<section class="card c">${A.badge('album')}<h3>Tu tocadiscos te espera</h3><p>Permite que aeffy vea la música de tu teléfono y aquí sonará. Tus archivos no se mueven ni se suben a ningún lado.</p><button class="btn" data-a="nperm">${ms('library_music')}Permitir acceso a mi música</button></section>`);
    return h
  };
  A.afterBoot = () => { if (A.nativeHasPerm()) A.nativeScan(true); else setTimeout(() => { if (!A.nativeHasPerm() && !localStorage.getItem('ae_asked')) { localStorage.setItem('ae_asked', '1'); A.sheet(A.shead('library_music', '¿Permitir que aeffy acceda a tu música?', 'Así aeffy encuentra sola las canciones de tu teléfono, como un reproductor de verdad. Tu música no se mueve ni se sube a ningún lado.') + `<div class="foot"><button class="btn t" data-a="closesheet">Ahora no</button><button class="btn" data-a="nperm2">Permitir</button></div>`) } }, 900) };
  on('nperm2', () => { A.popLayer(); try { N.requestPermission() } catch (e) { } });
}
}

/* aeffy · recordar lo que sonaba: al volver a la app sigue la misma canción y en el mismo segundo */
'use strict';
{
const P = A.P;
let lastSave = 0;
const snap = () => P.cur ? { q: P.queue, qi: P.qi, cur: P.cur, t: P.au.currentTime || 0, from: P.from, play: !P.au.paused, at: Date.now() } : null;
const saveNow = () => { const s = snap(); if (!s) return; try { localStorage.setItem('ae_now', JSON.stringify(s)) } catch (e) { } };
A.saveNow = saveNow;
P.au.addEventListener('timeupdate', () => { const n = Date.now(); if (n - lastSave > 3000) { lastSave = n; saveNow() } });
['pause', 'play', 'ended', 'loadedmetadata'].forEach(ev => P.au.addEventListener(ev, saveNow));
addEventListener('pagehide', saveNow);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow() });

/* si hay otra ventana de aeffy abierta sonando, esta toma la canción y la otra se calla */
let bc = null; try { bc = new BroadcastChannel('aeffy-player') } catch (e) { }
const me = Math.random().toString(36).slice(2);
let handed = null;
if (bc) bc.onmessage = e => {
  const m = e.data || {}; if (m.from === me) return;
  if (m.k === 'hello' && P.cur && !P.au.paused) { const s = snap(); P.au.pause(); bc.postMessage({ k: 'state', to: m.from, from: me, s }) }
  else if (m.k === 'state' && m.to === me) handed = m.s;
  else if (m.k === 'playing' && !P.au.paused) P.au.pause();
};
P.au.addEventListener('play', () => { if (bc) bc.postMessage({ k: 'playing', from: me }) });
if (bc) bc.postMessage({ k: 'hello', from: me });

const apply = async s => {
  if (!s || !s.cur || P.cur) return false;
  const q = (s.q || []).filter(id => A.byId(id)); let qi = q.indexOf(s.cur);
  if (qi < 0) { if (!A.byId(s.cur)) return false; q.unshift(s.cur); qi = 0 }
  P.queue = q; P.from = s.from || 'Tu biblioteca';
  /* si venía sonando hace poco, sigue sonando; si no, queda en pausa lista para continuar */
  const t = s.play ? (s.t || 0) + Math.min(30, (Date.now() - (s.at || 0)) / 1000) : (s.t || 0);
  await A.playIdx(qi, true, { t: s.play ? Math.max(0, t - .5) : t, play: !!s.play && (Date.now() - (s.at || 0) < 6 * 3600e3) });
  A.paintMini && A.paintMini(); return true
};
A.resumeNow = async () => {
  await new Promise(r => setTimeout(r, 150)); /* esperar respuesta de otra ventana */
  if (handed) { handed.at = Date.now(); if (await apply(handed)) return }
  let s = null; try { s = JSON.parse(localStorage.getItem('ae_now') || 'null') } catch (e) { }
  if (!s) return;
  /* la música del teléfono puede tardar en aparecer: reintento un rato */
  for (let i = 0; i < 8 && !P.cur; i++) { if (await apply(s)) return; await new Promise(r => setTimeout(r, 1500)) }
};
}

/* actualizar sin interrumpir: solo cuando la app está en segundo plano y no suena nada */
{
const P = A.P;
const tryUpdate = () => { if (A.pendingUpdate && document.hidden && (!P.cur || P.au.paused)) { A.saveNow && A.saveNow(); location.reload() } };
document.addEventListener('visibilitychange', tryUpdate);
P.au.addEventListener('pause', () => setTimeout(tryUpdate, 1500));
}
/* Premium: karaoke encendido de entrada y avatar animado */
{
if (!localStorage.getItem('ae_kara1')) { localStorage.setItem('ae_kara1', '1'); A.ST.karaoke = true; A.saveSet() }
}

/* aeffy · Notas en tu perfil (con estilos de imagen Premium) y avatar animado que ven tus amigos */
'use strict';
{
const { $, $$, esc, ms, toast, P, on } = A;
const V = A.views;
const STY = [['simple', 'Simple', 0], ['degradado', 'Degradado', 1], ['portada', 'Portada', 1], ['polaroid', 'Polaroid', 1], ['cuaderno', 'Cuaderno', 1], ['pixel', 'Pixel', 1]];
const ago = d => { const s = (Date.now() - new Date(d)) / 1000; if (s < 90) return 'ahora'; if (s < 3600) return 'hace ' + Math.round(s / 60) + ' min'; if (s < 86400) return 'hace ' + Math.round(s / 3600) + ' h'; if (s < 86400 * 30) return 'hace ' + Math.round(s / 86400) + ' d'; return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short' }) };
const myId = () => A.session && A.session.user && A.session.user.id;
A.FP = A.FP || {};
async function loadNotes(id, force) {
  const sb = A.sb && A.sb(); if (!sb || !A.session || !id) return;
  const c = A.FP[id]; if (!force && c && Date.now() - c.at < 60000) return;
  const { data, error } = await sb.rpc('aeffy_friend_profile', { p_id: id });
  if (!error && data) { A.FP[id] = Object.assign(data, { at: Date.now() }); const { v } = A.route(); if (v === 'perfil' || v === 'u') A.render() }
}
A.loadNotes = loadNotes; A.noteHTML = (n, own, i) => noteHTML(n, own, i); A.smallCover = src => smallCover(src);

const dots = r => `<span class="rdots" aria-label="${r} de 10">${[0, 1, 2, 3, 4].map(i => { const f = r - i * 2; return `<i class="${f >= 2 ? 'f' : f === 1 ? 'h' : ''}"></i>` }).join('')}</span>`;
A.rateDots = dots;
function noteHTML(n, own, i) {
  const st = n.style || 'simple', cov = n.cover ? esc(n.cover) : '';
  const song = n.title ? `<div class="ns">${st !== 'polaroid' ? (cov ? `<img src="${cov}" alt="">` : `<span class="gen">${ms(n.kind === 'album' ? 'album' : 'music_note')}</span>`) : ''}<div><b>${esc(n.title)}</b><span>${n.kind === 'album' ? 'Álbum · ' : ''}${esc(n.artist || '')}</span></div>${n.rating != null ? dots(n.rating) : ''}</div>` : '';
  const bg = st === 'portada' && cov ? ` style="background-image:url('${cov}')"` : '';
  return `<article class="note st-${esc(st)}"${bg}>${st === 'polaroid' ? `<div class="ph" style="${cov ? `background-image:url('${cov}')` : 'background:linear-gradient(140deg,var(--pcl),var(--pc))'}"></div>` : ''}<p class="nb">${esc(n.body)}</p>${song}
   <div class="nf"><span>${ago(n.at || n.created_at)}</span><span class="sp"></span><button class="ib" data-a="note-img" data-i="${i}" data-own="${own ? 1 : 0}" aria-label="Guardar como imagen">${ms('image')}</button>${own ? `<button class="ib" data-a="note-del" data-id="${n.id}" aria-label="Borrar nota">${ms('delete')}</button>` : ''}</div></article>`
}
let shown = [];
function notesSection(p, own) {
  const list = (p && p.notes) || []; shown = list;
  const head = `<div class="sech"><h2>Reseñas</h2>${own ? `<p>Reseña lo que ya calificaste. Tus amigos lo ven en tu perfil.</p>` : ''}</div>`;
  const add = own ? `<button class="btn" style="margin-bottom:12px" data-a="note-new">${ms('rate_review')}Escribir una reseña</button>` : '';
  if (!p) return head + add + `<p class="muted small">Cargando reseñas…</p>`;
  return head + add + (list.length ? `<div class="notes">${list.map((n, i) => noteHTML(n, own, i)).join('')}</div>` : `<p class="muted small">${own ? 'Todavía no escribes ninguna reseña.' : 'Todavía no hay reseñas.'}</p>`)
}

/* en tu perfil */
const perfil0 = V.perfil;
V.perfil = arg => {
  let h = perfil0(arg); if (!A.me || !A.session) return h;
  const id = myId(); loadNotes(id);
  const sec = notesSection(A.FP[id], true), k = '<div class="sech"><h2>Sesiones y rachas';
  return h.includes(k) ? h.replace(k, sec + k) : h + sec
};
/* en el perfil de un amigo (y en "Cómo me ven") */
const u0 = V.u;
V.u = arg => {
  let h = u0(arg); const [id, lid] = (arg || '').split('~'); const p = A.FP[id];
  if (lid || !p || p.err || !p.id) return h;
  const sec = notesSection(p, false), k = '<div class="sech"><h2>Playlists';
  return h.includes(k) ? h.replace(k, sec + k) : h + sec
};

/* escribir una nota */
async function smallCover(src) {
  if (!src) return null;
  try { const im = new Image(); im.crossOrigin = 'anonymous'; im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = c.height = 200; const x = c.getContext('2d'); const s = Math.min(im.width, im.height); x.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 200, 200); return c.toDataURL('image/jpeg', .72) } catch (e) { return null }
}
on('note-new', async () => {
  if (!A.session) { A.loginSheet ? A.loginSheet('in') : A.go('cuenta'); return }
  const t = A.byId(P.cur), prem = A.isPremium();
  const cov = t ? await smallCover(t.cover) : null;
  let style = 'simple', withSong = !!t;
  const s = A.sheet(A.shead('edit_note', 'Nueva nota', prem ? 'Publica todas las que quieras.' : 'Sin Premium puedes publicar 1 nota al día.') + `
   <textarea class="ntx" id="ntx" maxlength="280" placeholder="¿Qué estás sintiendo con tu música?"></textarea><div class="ncnt" id="ncnt">0/280</div>
   ${t ? `<label class="si" style="padding:8px 0;display:flex;gap:10px;align-items:center"><input type="checkbox" id="nsong" checked><span><b style="display:block">Agregar la canción que suena</b><span class="muted small">${esc(t.name)} · ${esc(t.artist)}</span></span></label>` : ''}
   <div class="small muted" style="margin-top:6px">Estilo ${prem ? '' : '· los estilos de imagen son de Premium'}</div>
   <div class="stpick" id="npick">${STY.map(([k, n, pr]) => `<button type="button" data-k="${k}" class="${k === 'simple' ? 'on' : ''}">${pr && !prem ? ms('lock') : ''}${n}</button>`).join('')}</div>
   <div id="nprev"></div>
   <div class="foot"><button class="btn t" data-a="closesheet">Cancelar</button><button class="btn" id="npub">${ms('send')}Publicar</button></div>`);
  const prev = () => { const body = $('#ntx', s).value.trim() || 'Así se verá tu nota.'; $('#ncnt', s).textContent = $('#ntx', s).value.length + '/280'; $('#nprev', s).innerHTML = `<div class="small muted" style="margin:6px 0">Vista previa</div>` + noteHTML({ body, style, title: withSong ? t.name : null, artist: withSong ? t.artist : null, cover: withSong ? cov : null, at: new Date() }, false, -1).replace(/<div class="nf">[\s\S]*<\/div><\/article>$/, '</article>') };
  prev();
  $('#ntx', s).addEventListener('input', prev);
  const cb = $('#nsong', s); if (cb) cb.addEventListener('change', () => { withSong = cb.checked; prev() });
  $('#npick', s).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const k = b.dataset.k, pr = STY.find(x => x[0] === k)[2]; if (pr && !prem) { A.popLayer(); setTimeout(() => A.go('premium'), 260); toast('Los estilos de imagen son de aeffy Premium'); return } style = k; $$('#npick button', s).forEach(x => x.classList.toggle('on', x === b)); prev() });
  $('#npub', s).addEventListener('click', async e => {
    const body = $('#ntx', s).value.trim(); if (!body) { toast('Escribe algo primero'); return }
    const b = e.currentTarget; b.disabled = true;
    const { error } = await A.sb().rpc('aeffy_post_note', { p_body: body, p_title: withSong ? t.name : null, p_artist: withSong ? t.artist : null, p_cover: withSong ? cov : null, p_style: style });
    b.disabled = false;
    if (error) { toast(/LIMITE/.test(error.message) ? 'Sin Premium puedes publicar 1 nota al día' : 'No pude publicar la nota'); return }
    A.popLayer(); toast('Nota publicada'); await loadNotes(myId(), true); A.render()
  });
  setTimeout(() => $('#ntx', s).focus(), 250)
});
on('note-del', async el => {
  const s = A.sheet(A.shead('delete', '¿Borrar esta nota?', 'Tus amigos ya no la verán. No se puede deshacer.') + `<div class="foot"><button class="btn t" data-a="closesheet">Cancelar</button><button class="btn" id="ndel">Borrar</button></div>`);
  $('#ndel', s).onclick = async () => { await A.sb().rpc('aeffy_delete_note', { p_id: +el.dataset.id }); A.popLayer(); toast('Nota borrada'); await loadNotes(myId(), true); A.render() }
});

/* guardar una nota como imagen, con su estilo */
function wrap(x, text, maxW) { const out = []; for (const para of text.split('\n')) { let line = ''; for (const w of para.split(' ')) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { out.push(line); line = w } else line = t } out.push(line) } return out }
async function loadImg(src) { if (!src) return null; try { const im = new Image(); im.crossOrigin = 'anonymous'; im.src = src; await im.decode(); return im } catch (e) { return null } }
function rr(x, X, Y, W, H, r) { x.beginPath(); x.roundRect ? x.roundRect(X, Y, W, H, r) : x.rect(X, Y, W, H) }
async function noteImage(n, who) {
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const cs = getComputedStyle(document.documentElement), col = k => cs.getPropertyValue(k).trim() || '#ff8fc0';
  const st = n.style || 'simple', im = await loadImg(n.cover);
  let ink = '#fff', font = '700 58px Nunito, sans-serif', pad = 110, top = 230;
  if (st === 'degradado' || st === 'simple') { const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, col('--pcl')); g.addColorStop(.6, col('--pc')); g.addColorStop(1, col('--p')); x.fillStyle = st === 'simple' ? col('--bg') : g; x.fillRect(0, 0, W, H); ink = st === 'simple' ? col('--on') || '#fff' : col('--onpc') || '#111' }
  if (st === 'portada') { x.fillStyle = '#111'; x.fillRect(0, 0, W, H); if (im) { x.filter = 'blur(40px) brightness(.55) saturate(1.4)'; x.drawImage(im, -200, -200, W + 400, H + 400); x.filter = 'none'; x.save(); rr(x, 240, 140, 600, 600, 40); x.clip(); x.drawImage(im, 240, 140, 600, 600); x.restore() } top = 820 }
  if (st === 'cuaderno') { x.fillStyle = '#fffaf0'; x.fillRect(0, 0, W, H); x.fillStyle = '#f3c9d8'; for (let y = 120; y < H; y += 72) x.fillRect(0, y, W, 3); x.fillStyle = '#ffb3c8'; x.fillRect(120, 0, 5, H); ink = '#3b2f2f'; font = '600 56px Fredoka, sans-serif'; pad = 170 }
  if (st === 'pixel') { x.imageSmoothingEnabled = false; x.fillStyle = '#2b1d3a'; x.fillRect(0, 0, W, H); x.fillStyle = '#ff8fc0'; x.fillRect(30, 30, W - 60, 16); x.fillRect(30, H - 46, W - 60, 16); x.fillRect(30, 30, 16, H - 60); x.fillRect(W - 46, 30, 16, H - 60); font = '700 52px monospace' }
  if (st === 'polaroid') { x.fillStyle = col('--bg'); x.fillRect(0, 0, W, H); x.save(); x.translate(W / 2, H / 2); x.rotate(-.025); x.fillStyle = '#fff'; x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 40; x.fillRect(-400, -560, 800, 1120); x.shadowBlur = 0; if (im) x.drawImage(im, -350, -510, 700, 700); else { x.fillStyle = col('--pc'); x.fillRect(-350, -510, 700, 700) } x.restore(); ink = '#222'; font = '600 46px Fredoka, sans-serif'; pad = 220; top = 970 }
  x.fillStyle = ink; x.font = font; x.textBaseline = 'top';
  const lines = wrap(x, n.body, W - pad * 2).slice(0, st === 'polaroid' ? 4 : 10), lh = parseInt(font.match(/(\d+)px/)[1]) * 1.3;
  lines.forEach((l, i) => x.fillText(l, pad, top + i * lh));
  let y = top + lines.length * lh + 40;
  if (n.title && st !== 'polaroid' && st !== 'portada') { if (im) { x.save(); rr(x, pad, y, 120, 120, 20); x.clip(); x.drawImage(im, pad, y, 120, 120); x.restore() } x.font = '700 40px Nunito, sans-serif'; x.fillText(n.title.slice(0, 34), pad + (im ? 150 : 0), y + 18); x.globalAlpha = .75; x.font = '500 34px Nunito, sans-serif'; x.fillText((n.artist || '').slice(0, 40), pad + (im ? 150 : 0), y + 70); x.globalAlpha = 1 }
  if (n.title && (st === 'polaroid' || st === 'portada')) { x.globalAlpha = .8; x.font = '600 34px Nunito, sans-serif'; x.fillText('♪ ' + (n.title + ' · ' + (n.artist || '')).slice(0, 48), pad, y) ; x.globalAlpha = 1 }
  x.globalAlpha = .7; x.font = '700 34px Nunito, sans-serif'; x.fillText((who ? '@' + who + ' · ' : '') + 'aeffy', st === 'cuaderno' ? 170 : 80, H - 110); x.globalAlpha = 1;
  return new Promise(r => c.toBlob(r, 'image/png'))
}
on('note-img', async el => {
  const n = shown[+el.dataset.i]; if (!n) return;
  if (n.style !== 'simple' && !A.isPremium() && el.dataset.own === '1') { /* sus propias notas con estilo ya las pagó */ }
  toast('Preparando la imagen…');
  const who = el.dataset.own === '1' ? A.me?.handle : (A.FP[A.route().arg.split('~')[0]] || {}).handle;
  const b = await noteImage(n, who); if (!b) { toast('No pude crear la imagen'); return }
  const name = 'nota-aeffy-' + Date.now() + '.png';
  try { if (!window.AeffyNative && navigator.canShare && navigator.canShare({ files: [new File([b], name, { type: 'image/png' })] })) { await navigator.share({ files: [new File([b], name, { type: 'image/png' })] }); return } } catch (e) { if (e && e.name === 'AbortError') return }
  await A.saveBlob(b, name); toast('Imagen guardada')
});

/* avatar animado: se guarda en tu cuenta y lo ven tus amigos */
const ANS = [['', 'Quieto'], ['girar', 'Girar'], ['latir', 'Latir'], ['flotar', 'Flotar'], ['brillo', 'Brillo']];
A.avAnimPicker = () => {
  const cur = (A.me && A.me.avatar_anim) || '', prem = A.isPremium();
  return `<div class="si"><span class="t"><b>Avatar animado ${prem ? '' : ms('lock')}</b><span>${A.session ? 'Tu foto se mueve en tu perfil y tus amigos también lo ven.' : 'Inicia sesión para animar tu avatar.'}</span></span></div><div class="anpick">${ANS.map(([k, n]) => `<button class="${cur === k ? 'on' : ''}" data-a="avanim" data-v="${k}"><span class="dot${k ? ' an-' + k : ''}"></span>${n}</button>`).join('')}</div>`
};
on('avanim', async el => {
  if (!A.session) { A.loginSheet ? A.loginSheet('in') : A.go('cuenta'); return }
  const v = el.dataset.v; if (v && !A.isPremium()) { A.go('premium'); toast('Animar tu avatar es de aeffy Premium'); return }
  const { data, error } = await A.sb().rpc('aeffy_set_avatar_anim', { p_anim: v });
  if (error) { toast('No pude guardarlo'); return }
  A.me.avatar_anim = data || null; A.lsSet('ae_me', A.me); A.render(); toast(v ? 'Listo, tu avatar ya se mueve' : 'Avatar quieto')
});
}

/* aeffy · Compartir canción o un pedazo de letra como historia bonita (1080×1920) */
'use strict';
{
const { $, $$, esc, ms, toast, P, on } = A;
const SST = [['portada', 'Portada'], ['color', 'Color'], ['vinilo', 'Vinilo'], ['minimal', 'Minimal']];
async function img(src) { if (!src) return null; try { const i = new Image(); i.crossOrigin = 'anonymous'; i.src = src; await i.decode(); return i } catch (e) { return null } }
function rr(x, X, Y, W, H, r) { x.beginPath(); x.roundRect ? x.roundRect(X, Y, W, H, r) : x.rect(X, Y, W, H) }
function wrap(x, text, maxW) { const out = []; let line = ''; for (const w of text.split(' ')) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { out.push(line); line = w } else line = t } if (line) out.push(line); return out }
function fit(x, text, maxW, size, weight = 800, fam = 'Nunito, sans-serif') { let s = size; do { x.font = `${weight} ${s}px ${fam}`; s -= 2 } while (x.measureText(text).width > maxW && s > 28); return s + 2 }
async function story(t, style, lines) {
  const W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const im = await img(t.cover), h = t.hue ?? A.hueOf(t.album + t.artist), sa = Math.round((t.sat ?? .6) * 100);
  const c1 = `hsl(${h} ${sa}% 62%)`, c2 = `hsl(${h} ${sa}% 30%)`, c3 = `hsl(${(h + 40) % 360} ${sa}% 18%)`;
  let ink = '#fff';
  if (style === 'portada') { x.fillStyle = c2; x.fillRect(0, 0, W, H); if (im) { x.filter = 'blur(60px) brightness(.6) saturate(1.5)'; x.drawImage(im, -300, -300, W + 600, H + 600); x.filter = 'none' } }
  else if (style === 'color') { const g = x.createLinearGradient(0, 0, W * .4, H); g.addColorStop(0, c1); g.addColorStop(.55, c2); g.addColorStop(1, c3); x.fillStyle = g; x.fillRect(0, 0, W, H) }
  else if (style === 'vinilo') { x.fillStyle = c3; x.fillRect(0, 0, W, H); const g = x.createRadialGradient(W / 2, H * .3, 50, W / 2, H * .3, 900); g.addColorStop(0, c2); g.addColorStop(1, 'transparent'); x.fillStyle = g; x.fillRect(0, 0, W, H) }
  else { x.fillStyle = '#0f0f13'; x.fillRect(0, 0, W, H) }
  const lyr = lines && lines.length;
  const cs = lyr ? 300 : 760, cx = (W - cs) / 2, cy = lyr ? 230 : 330;
  if (style === 'vinilo' && !lyr) {
    const R = 400, X0 = W / 2 + 120, Y0 = cy + cs / 2; x.fillStyle = '#111'; x.beginPath(); x.arc(X0, Y0, R, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 2; for (let r = 150; r < R; r += 14) { x.beginPath(); x.arc(X0, Y0, r, 0, 7); x.stroke() } x.fillStyle = c1; x.beginPath(); x.arc(X0, Y0, 120, 0, 7); x.fill(); x.fillStyle = '#111'; x.beginPath(); x.arc(X0, Y0, 14, 0, 7); x.fill();
    x.save(); x.shadowColor = 'rgba(0,0,0,.5)'; x.shadowBlur = 50; rr(x, 120, cy + 60, 640, 640, 24); x.fillStyle = c2; x.fill(); x.shadowBlur = 0; x.clip(); if (im) x.drawImage(im, 120, cy + 60, 640, 640); x.restore()
  } else {
    x.save(); x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = 60; x.shadowOffsetY = 20; rr(x, cx, cy, cs, cs, lyr ? 28 : 44); x.fillStyle = c2; x.fill(); x.shadowColor = 'transparent'; x.clip(); if (im) x.drawImage(im, cx, cy, cs, cs); x.restore()
  }
  x.fillStyle = ink; x.textAlign = 'center'; x.textBaseline = 'top';
  if (lyr) {
    let y = cy + cs + 50; x.font = '800 44px Nunito, sans-serif'; x.fillText(t.name.slice(0, 40), W / 2, y); x.globalAlpha = .75; x.font = '600 36px Nunito, sans-serif'; x.fillText(t.artist.slice(0, 44), W / 2, y + 60); x.globalAlpha = 1;
    const box = { X: 90, Y: y + 160, W: W - 180 };
    x.font = '800 64px Fredoka, Nunito, sans-serif'; let L = []; for (const l of lines) L.push(...wrap(x, l, box.W - 120));
    let fs = 64; while (L.length * fs * 1.28 > H - box.Y - 320 && fs > 36) { fs -= 4; x.font = `800 ${fs}px Fredoka, Nunito, sans-serif`; L = []; for (const l of lines) L.push(...wrap(x, l, box.W - 120)) }
    const bh = L.length * fs * 1.28 + 120; rr(x, box.X, box.Y, box.W, bh, 48); x.fillStyle = style === 'minimal' ? '#1c1c22' : 'rgba(255,255,255,.16)'; x.fill();
    x.fillStyle = '#fff'; x.textAlign = 'left'; L.forEach((l, i) => x.fillText(l, box.X + 60, box.Y + 60 + i * fs * 1.28)); x.textAlign = 'center'
  } else {
    let y = (style === 'vinilo' ? cy + 760 : cy + cs) + 80; const s = fit(x, t.name, W - 160, 76); x.fillText(t.name, W / 2, y); x.globalAlpha = .8; fit(x, t.artist, W - 160, 46, 600); x.fillText(t.artist, W / 2, y + s * 1.25); x.globalAlpha = .55; fit(x, t.album || '', W - 160, 36, 600); x.fillText(t.album || '', W / 2, y + s * 1.25 + 64); x.globalAlpha = 1
  }
  x.globalAlpha = .85; x.font = '800 40px Nunito, sans-serif'; x.fillText((A.me?.handle ? '@' + A.me.handle + ' · ' : '') + 'escuchando en aeffy', W / 2, H - 170); x.globalAlpha = 1;
  return new Promise(r => c.toBlob(r, 'image/png'))
}
A.storyImage = story;
async function deliver(b, t) {
  const name = 'aeffy-' + (t.name || 'cancion').replace(/[^\w\-]+/g, '_').slice(0, 30) + '.png', f = new File([b], name, { type: 'image/png' });
  try { if (!window.AeffyNative && navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], text: `${t.name} · ${t.artist}` }); return } } catch (e) { if (e && e.name === 'AbortError') return }
  await A.saveBlob(b, name); toast(window.AeffyNative ? 'Imagen guardada: súbela a tu historia' : 'Imagen descargada')
}
on('share', async el => {
  const t = A.byId(el.dataset.id || P.cur); if (!t) return; if (document.querySelector('.scrim')) { A.popLayer(); await new Promise(r => setTimeout(r, 260)) }
  const L = A.parseLRC(A.lyricsOf(t)); const lines = (L.length ? L.map(l => l.x) : A.lyricsOf(t).split(/\r?\n/)).map(s => s.trim()).filter(Boolean);
  let mode = 'cancion', style = 'portada', pick = new Set(), url = null, busy = 0;
  const s = A.sheet(A.shead('ios_share', 'Compartir', esc(t.name) + ' · ' + esc(t.artist)) + `
   <div class="seg" id="shm" style="margin-bottom:10px"><button class="on" data-m="cancion">${ms('music_note')}Canción</button><button data-m="letra"${lines.length ? '' : ' disabled'}>${ms('lyrics')}Letra</button></div>
   <div class="stpick" id="shs">${SST.map(([k, n]) => `<button data-k="${k}" class="${k === style ? 'on' : ''}">${n}</button>`).join('')}</div>
   <div id="shl" style="display:none"><div class="small muted" style="margin:4px 0 6px">Toca hasta 5 líneas</div><div id="shll" style="max-height:200px;overflow-y:auto;display:grid;gap:6px"></div></div>
   <div style="display:grid;place-items:center;margin:10px 0"><img id="shp" alt="Vista previa" style="width:min(56vw,240px);aspect-ratio:9/16;border-radius:18px;background:var(--s2);object-fit:cover;box-shadow:0 8px 24px rgba(0,0,0,.35)"></div>
   <div class="foot"><button class="btn t" id="shlink">${ms('link')}Solo texto</button><button class="btn" id="shgo">${ms('ios_share')}Compartir</button></div>`);
  const paintLines = () => { $('#shll', s).innerHTML = lines.map((l, i) => `<button class="mi" data-i="${i}" style="padding:10px 12px;border-radius:14px;${pick.has(i) ? 'background:var(--pc);color:var(--onpc)' : 'background:var(--s2)'}">${esc(l)}</button>`).join('') };
  const render = async () => { const my = ++busy; const sel = mode === 'letra' ? [...pick].sort((a, b) => a - b).map(i => lines[i]) : null; const b = await story(t, style, mode === 'letra' ? (sel.length ? sel : lines.slice(0, 2)) : null); if (my !== busy || !b) return; if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(b); $('#shp', s).src = url; s._blob = b };
  $('#shm', s).addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; mode = b.dataset.m; $$('#shm button', s).forEach(x => x.classList.toggle('on', x === b)); $('#shl', s).style.display = mode === 'letra' ? '' : 'none'; if (mode === 'letra') { if (!pick.size) { const c = P.cur === t.id ? L.findIndex((l, i) => l.t <= P.au.currentTime && (!L[i + 1] || L[i + 1].t > P.au.currentTime)) : -1; [0, 1].forEach(k => { const i = Math.max(0, c) + k; if (i < lines.length) pick.add(i) }) } paintLines() } render() });
  $('#shs', s).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; style = b.dataset.k; $$('#shs button', s).forEach(x => x.classList.toggle('on', x === b)); render() });
  $('#shll', s).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; e.stopPropagation(); e.preventDefault(); const i = +b.dataset.i; if (pick.has(i)) pick.delete(i); else { if (pick.size >= 5) { toast('Máximo 5 líneas'); return } pick.add(i) } paintLines(); render() }, true);
  $('#shgo', s).addEventListener('click', async () => { if (!s._blob) await render(); deliver(s._blob, t) });
  $('#shlink', s).addEventListener('click', async () => { const txt = `Estoy escuchando ${t.name} de ${t.artist} en aeffy`; try { if (navigator.share) await navigator.share({ text: txt, url: location.origin }); else { await navigator.clipboard.writeText(txt + ' ' + location.origin); toast('Copiado para compartir') } } catch (e) { } });
  render()
});
}

/* aeffy · Reseñas como en Sosu: solo de lo que ya calificaste (canción, o álbum con el 80 % calificado) */
'use strict';
{
const { $, $$, esc, ms, toast, P, on } = A;
const STY = [['simple', 'Simple', 0], ['degradado', 'Degradado', 1], ['portada', 'Portada', 1], ['polaroid', 'Polaroid', 1], ['cuaderno', 'Cuaderno', 1], ['pixel', 'Pixel', 1]];
const myId = () => A.session && A.session.user && A.session.user.id;
function works() {
  const songs = A.tracks.filter(t => A.META[t.id] && A.META[t.id].rating).map(t => ({ kind: 'cancion', key: t.id, title: t.name, artist: t.artist, cover: t.cover, rating: A.META[t.id].rating }));
  const alb = {}; for (const t of A.tracks) { const k = t.album || 'Sin álbum'; (alb[k] = alb[k] || []).push(t) }
  const albums = [];
  for (const [k, ts] of Object.entries(alb)) {
    if (k === 'Sin álbum') continue; const rated = ts.filter(t => A.META[t.id] && A.META[t.id].rating);
    const need = ts.length === 1 ? 1 : Math.ceil(ts.length * .8);
    const avg = rated.length ? Math.round(rated.reduce((a, t) => a + A.META[t.id].rating, 0) / rated.length) : 0;
    albums.push({ kind: 'album', key: k, title: k, artist: ts[0].albumArtist || ts[0].artist, cover: (ts.find(t => t.cover) || {}).cover, rating: (A.ALRATE && A.ALRATE[k]) || avg, ok: rated.length >= need, have: rated.length, need, total: ts.length })
  }
  albums.sort((a, b) => (b.ok - a.ok) || b.have / b.total - a.have / a.total);
  return { songs: songs.sort((a, b) => b.rating - a.rating), albums }
}
const wkRow = (w, i) => `<button class="wk" data-i="${i}"${w.kind === 'album' && !w.ok ? ' data-lock="1" style="opacity:.55"' : ''}>${w.cover ? `<img src="${esc(w.cover)}" alt="">` : `<span class="gen">${ms(w.kind === 'album' ? 'album' : 'music_note')}</span>`}<div><b>${esc(w.title)}</b><span>${w.kind === 'album' && !w.ok ? `Calificaste ${w.have} de ${w.total} · te faltan ${w.need - w.have}` : esc(w.artist || '')}</span></div>${w.rating ? A.rateDots(w.rating) : ''}</button>`;

on('note-new', async () => {
  if (!A.session) { A.loginSheet ? A.loginSheet('in') : A.go('cuenta'); return }
  const W = works(); let tab = 'cancion', q = '';
  const s = A.sheet(A.shead('rate_review', 'Elegir obra', 'Reseña una canción que calificaste, o un álbum con al menos el 80 % de sus canciones calificadas.') + `
   <div class="seg" id="wkt"><button class="on" data-t="cancion">${ms('music_note')}Canciones</button><button data-t="album">${ms('album')}Álbumes</button></div>
   <div class="search" style="margin-top:10px">${ms('search')}<input id="wkq" placeholder="Buscar" autocomplete="off"></div>
   <div class="wkl" id="wkl"></div>`);
  let list = [];
  const paint = () => { list = (tab === 'cancion' ? W.songs : W.albums).filter(w => !q || (w.title + ' ' + w.artist).toLowerCase().includes(q)); $('#wkl', s).innerHTML = list.length ? list.map(wkRow).join('') : `<p class="muted small" style="text-align:center;padding:20px 0">${tab === 'cancion' ? 'Todavía no calificas canciones. Toca ⋮ en una canción → Calificar.' : 'No hay álbumes todavía.'}</p>` };
  paint();
  $('#wkt', s).onclick = e => { const b = e.target.closest('button'); if (!b) return; tab = b.dataset.t; $$('#wkt button', s).forEach(x => x.classList.toggle('on', x === b)); paint() };
  $('#wkq', s).oninput = e => { q = e.target.value.trim().toLowerCase(); paint() };
  $('#wkl', s).onclick = e => { const b = e.target.closest('.wk'); if (!b) return; const w = list[+b.dataset.i]; if (b.dataset.lock) { toast(`Califica ${w.need - w.have} canción${w.need - w.have === 1 ? '' : 'es'} más de este álbum para reseñarlo`); return } A.popLayer(); setTimeout(() => compose(w), 280) };
});

async function compose(w) {
  const prem = A.isPremium(); const cov = await A.smallCover(w.cover); let style = 'simple', sending = false;
  const s = A.sheet(A.shead('rate_review', 'Tu reseña', prem ? 'Publica todas las que quieras.' : 'Sin Premium puedes publicar 1 reseña al día.') + `
   <div class="wk" style="pointer-events:none">${cov ? `<img src="${cov}" alt="">` : `<span class="gen">${ms(w.kind === 'album' ? 'album' : 'music_note')}</span>`}<div><b>${esc(w.title)}</b><span>${w.kind === 'album' ? 'Álbum · ' : ''}${esc(w.artist || '')}</span></div>${w.rating ? A.rateDots(w.rating) : ''}</div>
   <textarea class="ntx" id="ntx" maxlength="500" placeholder="¿Qué te hizo sentir?"></textarea><div class="ncnt" id="ncnt">0/500</div>
   <div class="small muted" style="margin-top:6px">Estilo${prem ? '' : ' · los estilos de imagen son de Premium'}</div>
   <div class="stpick" id="npick">${STY.map(([k, n, pr]) => `<button type="button" data-k="${k}" class="${k === 'simple' ? 'on' : ''}">${pr && !prem ? ms('lock') : ''}${n}</button>`).join('')}</div>
   <div id="nprev"></div>
   <div class="foot"><button type="button" class="btn t" data-a="closesheet">Cancelar</button><button type="button" class="btn" id="npub">${ms('send')}Publicar</button></div>`);
  const prev = () => { const body = $('#ntx', s).value.trim() || 'Así se verá tu reseña.'; $('#ncnt', s).textContent = $('#ntx', s).value.length + '/500'; $('#nprev', s).innerHTML = `<div class="small muted" style="margin:6px 0">Vista previa</div>` + A.noteHTML({ body, style, kind: w.kind, rating: w.rating, title: w.title, artist: w.artist, cover: cov, at: new Date() }, false, -1).replace(/<div class="nf">[\s\S]*<\/div><\/article>$/, '</article>') };
  prev(); $('#ntx', s).addEventListener('input', prev);
  $('#npick', s).onclick = e => { const b = e.target.closest('button'); if (!b) return; const k = b.dataset.k, pr = STY.find(x => x[0] === k)[2]; if (pr && !prem) { toast('Los estilos de imagen son de aeffy Premium'); return } style = k; $$('#npick button', s).forEach(x => x.classList.toggle('on', x === b)); prev() };
  const pub = async () => {
    if (sending) return; const body = $('#ntx', s).value.trim(); if (!body) { toast('Escribe tu reseña primero'); return }
    sending = true; const b = $('#npub', s); b.disabled = true; b.textContent = 'Publicando…';
    try {
      const { error } = await A.sb().rpc('aeffy_post_review', { p_body: body, p_kind: w.kind, p_title: w.title, p_artist: w.artist || '', p_cover: cov, p_rating: w.rating || null, p_style: style });
      if (error) throw error;
      A.popLayer(); toast('Reseña publicada'); await A.loadNotes(myId(), true); A.render()
    } catch (err) { const m = String(err && err.message || err); toast(/LIMITE/.test(m) ? 'Sin Premium puedes publicar 1 reseña al día' : /fetch|network/i.test(m) ? 'Sin conexión: inténtalo otra vez' : 'No pude publicarla: ' + m.slice(0, 80)); b.disabled = false; b.innerHTML = ms('send') + 'Publicar'; sending = false }
  };
  /* toque directo en el botón, además del clic, para que nunca se pierda */
  const btn = $('#npub', s); btn.addEventListener('click', pub); btn.addEventListener('touchend', e => { e.preventDefault(); pub() });
  setTimeout(() => $('#ntx', s).focus(), 250)
}

/* avatar animado: respuesta inmediata al tocar y errores claros */
const avOld = A.ACT['avanim'];
on('avanim', async el => {
  if (!A.session) { toast('Inicia sesión para animar tu avatar'); A.loginSheet ? A.loginSheet('in') : A.go('cuenta'); return }
  const v = el.dataset.v; if (v && !A.isPremium()) { toast('Animar tu avatar es de aeffy Premium'); A.go('premium'); return }
  $$('.anpick button').forEach(b => b.classList.toggle('on', b === el));
  try {
    const { data, error } = await A.sb().rpc('aeffy_set_avatar_anim', { p_anim: v }); if (error) throw error;
    A.me.avatar_anim = data || null; A.lsSet('ae_me', A.me); toast(v ? 'Listo, tu avatar ya se mueve' : 'Avatar quieto'); A.render()
  } catch (err) { toast('No pude guardarlo: ' + String(err && err.message || err).slice(0, 80)); A.render() }
});

/* hay versión nueva: aviso con botón, sin recargar sola mientras usas la app */
let shownUp = false;
const showUp = () => {
  if (shownUp || !A.pendingUpdate || document.hidden) return; shownUp = true;
  const d = document.createElement('div'); d.className = 'upbar'; d.innerHTML = `${ms('system_update')}<span>Hay una versión nueva de aeffy</span><button class="btn" id="upgo">Actualizar</button><button class="ib" id="upx" aria-label="Luego">${ms('close')}</button>`;
  document.body.appendChild(d);
  d.querySelector('#upgo').onclick = () => { A.saveNow && A.saveNow(); try { sessionStorage.setItem('ae_resume_play', P.cur && !P.au.paused ? '1' : '') } catch (e) { } location.reload() };
  d.querySelector('#upx').onclick = () => d.remove();
};
setInterval(showUp, 4000); document.addEventListener('visibilitychange', showUp);
/* también lo revisa en el navegador, no solo en la app */
const chk = () => fetch('/v.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).then(j => { if (j && j.v && A.BUILD && j.v > A.BUILD) A.pendingUpdate = 1 }).catch(() => { });
setTimeout(chk, 8000); setInterval(chk, 10 * 60000);
}

/* aeffy · Forma del avatar y animación que pasa de una forma a otra (como Sosu) */
'use strict';
{
const { $, $$, esc, ms, toast, on } = A;
const N = 144, TAU = Math.PI * 2;
const poly = (k, R, rot = -Math.PI / 2, soft = .25) => a => { const seg = TAU / k, x = ((a - rot) % seg + seg) % seg - seg / 2; const r = R * Math.cos(Math.PI / k) / Math.cos(x); return r * (1 - soft) + R * .9 * soft };
const wave = (n, amp, r0 = 46) => a => r0 + amp * Math.cos(n * a);
const SHAPES = {
  circulo: ['Círculo', () => 46], galleta: ['Galleta', wave(9, 3.2)], flor: ['Flor', wave(6, 7, 42)], sol: ['Sol', wave(8, 2.6, 47)], suave: ['Suave', wave(4, 1.6)],
  trebol: ['Trébol', wave(4, 8, 40)], estallido: ['Estallido', wave(12, 3.6, 46)], cuadrado: ['Cuadrado', poly(4, 50, Math.PI / 4, .3)], diamante: ['Diamante', poly(4, 50, 0, .3)],
  triangulo: ['Triángulo', poly(3, 54, -Math.PI / 2, .35)], pentagono: ['Pentágono', poly(5, 50, -Math.PI / 2, .25)], hexagono: ['Hexágono', poly(6, 49, 0, .2)], ola: ['Ola', wave(5, 4.5, 45)]
};
const radii = name => { const f = (SHAPES[name] || SHAPES.flor)[1]; const out = new Float32Array(N + 1); for (let i = 0; i <= N; i++) out[i] = Math.min(49, f(i / N * TAU)); return out };
const cache = {}; const R = n => cache[n] || (cache[n] = radii(n));
const toPath = rs => { let d = ''; for (let i = 0; i <= N; i++) { const a = i / N * TAU; d += (i ? 'L' : 'M') + (50 + rs[i] * Math.cos(a)).toFixed(1) + ' ' + (50 + rs[i] * Math.sin(a)).toFixed(1) } return d + 'Z' };
A.shapePath = name => toPath(R(SHAPES[name] ? name : 'flor'));
A.SHAPES = SHAPES;
const parse = sp => { const [b, rest] = String(sp || '').split('|'); const base = SHAPES[b] ? b : 'flor'; const seq = [base, ...(rest ? rest.split(',').filter(k => SHAPES[k]) : [])]; return { base, seq } };
/* avatar de amigos en listas */
let sid = 0;
A.shapeAv = (name, sz, img, sp) => { const id = 'sav' + (++sid), d = A.shapePath(parse(sp).base); const ini = esc((name || '?').trim().charAt(0).toUpperCase()); return `<span class="anw" style="width:${sz}px;height:${sz}px"><svg viewBox="0 0 100 100" data-av="${esc(sp)}" aria-hidden="true"><defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><path class="bgp" d="${d}" fill="hsl(${A.hueOf ? A.hueOf(name || '') : 300} 55% 60%)"/>${img ? `<image href="${esc(img)}" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>` : `<text x="50" y="62" text-anchor="middle" font-size="36" font-weight="800" fill="#fff">${ini}</text>`}</svg></span>` };

/* animador: cada forma se queda un momento y luego se transforma suave en la siguiente */
const HOLD = 1.4, MORPH = .9, ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const targets = el => { const out = []; const cp = el.tagName === 'svg' ? el.querySelector('clipPath path') : null; if (cp) out.push(cp); const bg = el.querySelector && el.querySelector('.bgp'); if (bg) out.push(bg); const host = el.closest('.avatar,.pfav'); if (host) { const sv = host.querySelector(':scope > svg:first-child path'); if (sv && !out.includes(sv)) out.push(sv) } return out };
function frame(now) {
  if (!document.hidden) {
    const t = now / 1000;
    for (const el of document.querySelectorAll('[data-av]')) {
      const { seq } = parse(el.dataset.av); const tg = targets(el); if (!tg.length) continue;
      let d;
      if (seq.length < 2 || reduce) { d = el._base === seq[0] ? null : A.shapePath(seq[0]); el._base = seq[0] }
      else { const per = HOLD + MORPH, ph = t % (per * seq.length), i = Math.floor(ph / per), local = ph - i * per; const a = R(seq[i]), b = R(seq[(i + 1) % seq.length]); if (local < HOLD) { const k = 'h' + i; if (el._k === k) continue; el._k = k; d = toPath(a) } else { el._k = ''; const f = ease((local - HOLD) / MORPH), rs = new Float32Array(N + 1); for (let j = 0; j <= N; j++) rs[j] = a[j] + (b[j] - a[j]) * f; d = toPath(rs) } }
      if (d) for (const p of tg) p.setAttribute('d', d)
    }
  }
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame);

/* hoja "Forma y animación" */
on('avshape', () => {
  if (!A.session) { A.loginSheet ? A.loginSheet('in') : A.go('cuenta'); return }
  const prem = A.isPremium(); let { base, seq } = parse(A.me && A.me.avatar_anim); let extra = seq.slice(1);
  const spec = () => base + (extra.length ? '|' + extra.join(',') : '');
  const ico = k => `<svg viewBox="0 0 100 100"><path d="${A.shapePath(k)}"/></svg>`;
  const s = A.sheet(A.shead('interests', 'Forma y animación', 'Tu avatar pasa por estas formas y tus amigos lo ven moverse.') + `
   <svg class="shp-prev" viewBox="0 0 100 100" id="shpv"><defs><clipPath id="shpclip"><path d="${A.shapePath(base)}"/></clipPath></defs><path class="bgp" d="${A.shapePath(base)}" fill="var(--pc)"/>${A.me && A.me.avatar_url ? `<image href="${esc(A.me.avatar_url)}" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#shpclip)"/>` : `<text x="50" y="62" text-anchor="middle" font-size="34" font-weight="800" fill="var(--onpc)">${esc(A.initials())}</text>`}</svg><p class="small muted" id="shph" style="text-align:center;margin:0 0 8px"></p>
   <div class="sg">Forma</div><div class="shp-grid" id="shpb"></div>
   <div class="sg">Animación ${prem ? '' : ms('lock')}</div><p class="muted small" style="margin:0">Toca hasta 6 formas más, en el orden en que quieres que aparezcan.${prem ? '' : ' Es de aeffy Premium.'}</p><div class="shp-grid" id="shpa"></div>
   <div class="foot"><button type="button" class="btn t" id="shpx">Quitar animación</button><button type="button" class="btn" id="shpok">Listo</button></div>`);
  const paint = () => {
    $('#shpb', s).innerHTML = Object.entries(SHAPES).map(([k, [n]]) => `<button type="button" data-k="${k}" class="${k === base ? 'on' : ''}">${ico(k)}${n}</button>`).join('');
    $('#shpa', s).innerHTML = Object.entries(SHAPES).map(([k, [n]]) => { const i = extra.indexOf(k); return `<button type="button" data-k="${k}" class="${i >= 0 ? 'on' : ''}">${i >= 0 ? `<span class="n">${i + 1}</span>` : ''}${ico(k)}${n}</button>` }).join('');
    $('#shpv', s).dataset.av = spec(); $('#shpv', s)._k = ''; $('#shpv', s)._base = ''; $('#shph', s).textContent = extra.length ? 'Así se mueve tu avatar' : (prem ? 'Para que se mueva, toca formas en Animación ↓' : 'Así se ve tu avatar')
  };
  paint();
  $('#shpb', s).onclick = e => { const b = e.target.closest('button'); if (!b) return; base = b.dataset.k; paint() };
  $('#shpa', s).onclick = e => { const b = e.target.closest('button'); if (!b) return; if (!prem) { toast('La animación del avatar es de aeffy Premium'); return } const k = b.dataset.k, i = extra.indexOf(k); if (i >= 0) extra.splice(i, 1); else { if (extra.length >= 6) { toast('Máximo 6 formas'); return } extra.push(k) } paint() };
  $('#shpx', s).onclick = () => { extra = []; paint() };
  $('#shpok', s).onclick = async () => {
    const b = $('#shpok', s); b.disabled = true; b.textContent = 'Guardando…';
    try { const { data, error } = await A.sb().rpc('aeffy_set_avatar_anim', { p_anim: spec() }); if (error) throw error; A.me.avatar_anim = data || null; A.lsSet('ae_me', A.me); A.popLayer(); toast('Avatar guardado'); A.render() }
    catch (err) { toast('No pude guardarlo: ' + String(err && err.message || err).slice(0, 80)); b.disabled = false; b.textContent = 'Listo' }
  };
});
A.avAnimPicker = () => '';
}

/* aeffy · Mensajes con amigos: texto, canciones y stickers propios (como Spotify + WhatsApp) */
'use strict';
{
const { $, $$, esc, ms, toast, P, on } = A;
const V = A.views;
const myId = () => A.session && A.session.user && A.session.user.id;
const BASE = 'https://nhyxgfnjjzrdwshiuoyo.supabase.co/storage/v1/object/public/aeffy-avatars/';
let CH = [], MSG = {}, STK = null, cur = null, chan = null;
const fr = id => (A.FR || []).find(f => f.id === id) || (A.FP && A.FP[id]) || {};
const nm = f => f.display_name || (f.handle ? '@' + f.handle : 'Amigo');
const avOf = (f, sz) => A.shapeAv ? A.shapeAv(nm(f), sz, f.avatar_url, f.avatar_anim || 'circulo') : '';
const hm = d => new Date(d).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
const day = d => { const x = new Date(d), t = new Date(); const y = new Date(t - 864e5); return x.toDateString() === t.toDateString() ? 'Hoy' : x.toDateString() === y.toDateString() ? 'Ayer' : x.toLocaleDateString('es', { day: 'numeric', month: 'long' }) };
const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\(.*?\)|\[.*?\]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const mineTrack = m => A.tracks.find(t => norm(t.name) === norm(m.title) && norm(t.artist) === norm(m.artist)) || A.tracks.find(t => norm(t.name) === norm(m.title));
A.unreadFrom = id => (CH.find(c => c.friend === id) || {}).unread || 0;
A.unreadTotal = () => CH.reduce((a, c) => a + (c.unread || 0), 0);

let chLoading = 0, chAt = 0;
async function loadChats(force) { const sb = A.sb && A.sb(); if (!sb || !A.session || chLoading) return; if (!force && Date.now() - chAt < 4000) return; chLoading = 1; chAt = Date.now(); try { const { data } = await sb.rpc('aeffy_chats'); if (data) { const changed = JSON.stringify(data) !== JSON.stringify(CH); CH = data; paintBadge(); const { v } = A.route(); if (changed && v === 'mensajes') A.render() } } finally { chLoading = 0 } }
A.loadChats = loadChats;
function paintBadge() { const n = A.unreadTotal(); document.documentElement.style.setProperty('--unread', n ? `"${n}"` : '""'); $$('[data-a="dgo"][data-v="mensajes"]').forEach(b => { b.lastChild.textContent = 'Mensajes' + (n ? ' (' + n + ')' : '') }) }
async function loadMsgs(id) {
  const sb = A.sb(), me = myId();
  const { data, error } = await sb.from('aeffy_messages').select('*').or(`and(sender.eq.${me},receiver.eq.${id}),and(sender.eq.${id},receiver.eq.${me})`).order('created_at', { ascending: false }).limit(200);
  MSG[id] = error ? (MSG[id] || []) : (data || []).reverse(); paintMsgs(id, true);
  if ((CH.find(c => c.friend === id) || {}).unread) { await sb.rpc('aeffy_read_chat', { p_with: id }); loadChats(true) }
}
function live() {
  const sb = A.sb && A.sb(); if (!sb || !A.session) return; if (chan) sb.removeChannel(chan); const me = myId();
  chan = sb.channel('aeffy-dm-' + me).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'aeffy_messages', filter: 'receiver=eq.' + me }, ({ new: m }) => {
    const L = MSG[m.sender]; if (L && !L.find(x => x.id === m.id)) L.push(m);
    if (cur === m.sender && !document.hidden) { paintMsgs(m.sender, true); sb.rpc('aeffy_read_chat', { p_with: m.sender }) }
    else { const tx = m.kind === 'text' ? m.body.slice(0, 120) : m.kind === 'song' ? '🎵 Te mandó una canción' : 'Te mandó un sticker'; if (document.hidden && A.notifyMsg) A.notifyMsg(m, nm(fr(m.sender)), tx); else toast(`${nm(fr(m.sender))}: ${tx}`); loadChats() }
    try { window.AeffyNative && AeffyNative.notified && AeffyNative.notified(m.id) } catch (e) { }
    if (navigator.vibrate) try { navigator.vibrate(30) } catch (e) { }
  }).subscribe();
  loadChats(true)
}
const ls0 = A.liveStart; A.liveStart = () => { ls0 && ls0(); setTimeout(live, 1500) };
if (A.session) setTimeout(live, 2500);
setInterval(() => { if (!document.hidden && A.session) loadChats() }, 60000);

/* lista de conversaciones */
V.mensajes = () => {
  if (!A.session) return `<section class="card c"><h3>Inicia sesión</h3><p>Para mandar mensajes a tus amigos necesitas tu cuenta aeffy.</p><button class="btn" data-a="login">Iniciar sesión</button></section>`;
  loadChats();
  const acc = (A.FR || []).filter(f => f.status === 'accepted'), seen = new Set(CH.map(c => c.friend));
  const prev = c => c.last_kind === 'text' ? esc((c.last_from_me ? 'Tú: ' : '') + (c.last_body || '')) : c.last_kind === 'song' ? (c.last_from_me ? 'Tú: ' : '') + '🎵 Canción' : (c.last_from_me ? 'Tú: ' : '') + 'Sticker';
  return `<div class="top"><button class="ib" data-a="back" aria-label="Atrás">${ms('arrow_back')}</button></div><h1 class="h1">Mensajes</h1>
   ${CH.length ? CH.map(c => { const f = fr(c.friend); return `<div class="li" data-a="go" data-v="chat/${esc(c.friend)}" role="button" tabindex="0">${avOf(f, 48)}<div class="t"><b>${esc(nm(f))}</b><span${c.unread ? ' style="font-weight:800;opacity:1"' : ''}>${prev(c)}</span></div><small class="muted">${c.unread ? `<i class="ucount">${c.unread}</i>` : hm(c.last_at)}</small></div>` }).join('') : `<p class="muted">Todavía no tienes conversaciones.</p>`}
   ${acc.filter(f => !seen.has(f.id)).length ? `<div class="sech"><h2>Escríbele a</h2></div>` + acc.filter(f => !seen.has(f.id)).map(f => `<div class="li" data-a="go" data-v="chat/${esc(f.id)}" role="button" tabindex="0">${avOf(f, 44)}<div class="t"><b>${esc(nm(f))}</b><span>${f.handle ? '@' + esc(f.handle) : ''}</span></div>${ms('chat_bubble')}</div>`).join('') : ''}`
};

/* conversación */
V.chat = id => {
  if (!A.session) return V.mensajes();
  cur = id; document.body.classList.add('chatmode');
  const f = fr(id); const liveNow = f.playing && f.updated_at && Date.now() - new Date(f.updated_at) < 15 * 60000;
  if (!MSG[id]) setTimeout(() => loadMsgs(id), 0); else setTimeout(() => { paintMsgs(id, true); loadMsgs(id) }, 0);
  return `<div class="chh"><button class="ib" data-a="back" aria-label="Atrás">${ms('arrow_back')}</button><button class="chwho" data-a="go" data-v="u/${esc(id)}">${avOf(f, 44)}<span><b>${esc(nm(f))}</b><small>${f.title ? (liveNow ? ms('graphic_eq') : ms('history')) + esc(f.title) + ' — ' + esc(f.artist || '') : f.handle ? '@' + esc(f.handle) : ''}</small></span></button></div>
   <div class="chl" id="chl"><div class="chintro">${avOf(f, 96)}<b>${esc(nm(f))}</b><button class="btn t" data-a="go" data-v="u/${esc(id)}">Ir al perfil</button></div><div id="chm"></div></div>
   <form class="chin" id="chin"><input id="chtx" placeholder="Escribe un mensaje…" autocomplete="off" maxlength="2000"><button type="button" class="ib" data-a="ch-song" aria-label="Mandar canción">${ms('add')}</button><button type="button" class="ib" data-a="ch-stk" aria-label="Stickers">${ms('add_reaction')}</button><button class="ib snd" aria-label="Enviar">${ms('send', 1)}</button></form>`
};
function bubble(m, me) {
  const mine = m.sender === me;
  if (m.kind === 'sticker') return `<div class="mb ${mine ? 'me' : ''} stk"><img src="${esc(m.meta.url)}" alt="Sticker" loading="lazy"><small>${hm(m.created_at)}</small></div>`;
  if (m.kind === 'song') { const t = mineTrack(m.meta || {}); return `<div class="mb ${mine ? 'me' : ''} song"><div class="sc">${m.meta.cover ? `<img src="${esc(m.meta.cover)}" alt="">` : `<span class="gen">${ms('music_note')}</span>`}<div><b>${esc(m.meta.title || '')}</b><span>${esc(m.meta.artist || '')}</span></div></div>${t ? `<button class="btn t sm" data-a="ch-play" data-id="${t.id}">${ms('play_arrow', 1)}Reproducir</button>` : `<span class="muted small">No está en tu biblioteca</span>`}<small>${hm(m.created_at)}</small></div>` }
  return `<div class="mb ${mine ? 'me' : ''}"><p>${esc(m.body)}</p><small>${hm(m.created_at)}</small></div>`
}
function paintMsgs(id, scroll) {
  if (cur !== id) return; const box = $('#chm'); if (!box) return; const me = myId(); let last = '';
  box.innerHTML = (MSG[id] || []).map(m => { const d = day(m.created_at); const sep = d !== last ? `<div class="chday">${d}</div>` : ''; last = d; return sep + bubble(m, me) }).join('') || `<p class="muted small" style="text-align:center">Salúdale 👋</p>`;
  if (scroll) { const l = $('#chl'); if (l) requestAnimationFrame(() => l.scrollTop = l.scrollHeight) }
}
const send = async (kind, body, meta) => {
  const id = cur; if (!id) return; const tmp = { id: 'tmp' + Date.now(), sender: myId(), receiver: id, kind, body, meta: meta || {}, created_at: new Date().toISOString() };
  (MSG[id] = MSG[id] || []).push(tmp); paintMsgs(id, true);
  const { data, error } = await A.sb().rpc('aeffy_send_message', { p_to: id, p_kind: kind, p_body: body || null, p_meta: meta || {} });
  const L = MSG[id], i = L.indexOf(tmp);
  if (error) { if (i >= 0) L.splice(i, 1); paintMsgs(id); toast(/NO_AMIGOS/.test(error.message) ? 'Solo puedes escribirle a tus amigos' : /LENTO/.test(error.message) ? 'Vas muy rápido, espera un momento' : 'No se envió: ' + error.message.slice(0, 60)); return }
  if (i >= 0) L[i] = data; paintMsgs(id); loadChats(true)
};
document.addEventListener('submit', e => { if (e.target.id !== 'chin') return; e.preventDefault(); const i = $('#chtx'); const v = i.value.trim(); if (!v) return; i.value = ''; send('text', v) }, true);
on('ch-play', el => { const ids = A.tracks.map(t => t.id); A.playList([el.dataset.id], 0, 'Mensajes') });

/* salir del chat: vuelve el reproductor de abajo */
const r0 = A.render; A.render = (...a) => { const { v } = A.route(); if (v !== 'chat') { document.body.classList.remove('chatmode'); cur = null } return r0(...a) };

/* mandar canción */
on('ch-song', () => {
  const now = A.byId(P.cur); let q = '';
  const s = A.sheet(A.shead('music_note', 'Mandar una canción') + `<div class="search">${ms('search')}<input id="csq" placeholder="Buscar en tu biblioteca" autocomplete="off"></div><div id="csl" class="wkl"></div>`);
  const paint = () => { const L = (q ? A.tracks.filter(t => norm(t.name + ' ' + t.artist).includes(norm(q))) : [now, ...A.tracks.filter(t => t !== now)].filter(Boolean)).slice(0, 80); $('#csl', s).innerHTML = L.map(t => `<button class="wk" data-id="${t.id}">${t.cover ? `<img src="${esc(t.cover)}" alt="">` : `<span class="gen">${ms('music_note')}</span>`}<div><b>${esc(t.name)}</b><span>${t === now ? 'Sonando ahora · ' : ''}${esc(t.artist)}</span></div>${ms('send')}</button>`).join('') || '<p class="muted small">No encontré esa canción.</p>' };
  paint(); $('#csq', s).oninput = e => { q = e.target.value; paint() };
  $('#csl', s).onclick = async e => { const b = e.target.closest('.wk'); if (!b) return; const t = A.byId(b.dataset.id); A.popLayer(); const cov = A.smallCover ? await A.smallCover(t.cover) : null; send('song', null, { title: t.name, artist: t.artist, album: t.album, cover: cov }) }
});

/* stickers: el primero siempre es «Agregar sticker» */
async function loadStk() { const { data } = await A.sb().from('aeffy_stickers').select('*').order('created_at', { ascending: false }); STK = data || []; return STK }
async function makeSticker(file) {
  const sb = A.sb(), me = myId(); let blob = file, ext = 'gif', type = 'image/gif';
  if (file.type !== 'image/gif') { const im = new Image(); im.src = URL.createObjectURL(file); await im.decode(); const c = document.createElement('canvas'), S = 320, k = Math.min(S / im.width, S / im.height, 1); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); blob = await new Promise(r => c.toBlob(r, 'image/webp', .9)); ext = 'webp'; type = 'image/webp' }
  else if (file.size > 2.5e6) { toast('Ese GIF es muy pesado (máximo 2,5 MB)'); return null }
  const path = me + '/st-' + Date.now().toString(36) + '.' + ext;
  const { error } = await sb.storage.from('aeffy-avatars').upload(path, blob, { contentType: type }); if (error) { toast('No pude subir el sticker'); return null }
  const url = sb.storage.from('aeffy-avatars').getPublicUrl(path).data.publicUrl;
  const r = await sb.rpc('aeffy_add_sticker', { p_url: url }); if (r.error) { toast(/LLENO/.test(r.error.message) ? 'Ya tienes 300 stickers' : 'No pude guardarlo'); return null }
  STK = [r.data, ...(STK || [])]; return r.data
}
on('ch-stk', async () => {
  let edit = false;
  const s = A.sheet(`<div class="sthd"><b>Tus stickers</b><button class="btn g sm" id="ste">Editar</button></div><div class="stg" id="stg"><p class="muted small">Cargando…</p></div><input type="file" id="stf" accept="image/png,image/webp,image/gif,image/jpeg" multiple hidden>`, { head: false });
  const paint = () => { $('#stg', s).innerHTML = `<button class="stadd" id="sta">${ms('add_photo_alternate')}<span>Agregar sticker</span></button>` + (STK || []).map((x, i) => `<button class="sti${edit ? ' ed' : ''}" data-i="${i}"><img src="${esc(x.url)}" alt="" loading="lazy">${edit ? `<i>${ms('close')}</i>` : ''}</button>`).join('') };
  if (!STK) await loadStk(); paint();
  $('#ste', s).onclick = () => { edit = !edit; $('#ste', s).textContent = edit ? 'Listo' : 'Editar'; paint() };
  $('#stf', s).onchange = async e => { const fs = [...e.target.files].slice(0, 10); if (!fs.length) return; toast(fs.length > 1 ? `Agregando ${fs.length} stickers…` : 'Agregando sticker…'); for (const f of fs) await makeSticker(f); paint(); toast('Listo, ya están en tus stickers') };
  $('#stg', s).onclick = async e => {
    if (e.target.closest('#sta')) { $('#stf', s).value = ''; $('#stf', s).click(); return }
    const b = e.target.closest('.sti'); if (!b) return; const x = STK[+b.dataset.i];
    if (edit) { await A.sb().rpc('aeffy_del_sticker', { p_id: x.id }); STK = STK.filter(y => y !== x); paint(); return }
    A.popLayer(); send('sticker', null, { url: x.url })
  };
  /* también puedes guardar un sticker que te mandaron: mantén presionado */
});
on('stk-save', async el => { const url = el.dataset.url; if (!url || !url.startsWith(BASE)) return; const r = await A.sb().rpc('aeffy_add_sticker', { p_url: url }); toast(r.error ? 'Solo puedes guardar stickers subidos por ti' : 'Sticker guardado') });
}

/* aeffy · notificaciones de mensajes, menú de foto como Sosu (foto, GIF, portada, iniciales) */
'use strict';
{
const { $, $$, esc, ms, toast, P, on } = A;
const N = window.AeffyNative;
/* avisar de un mensaje: en la app de Android con su notificación; en el navegador con la del sistema */
A.notifyMsg = async (m, who, text) => {
  const url = location.origin + '/#/chat/' + m.sender;
  try { if (N && N.notify) { N.notify('m' + m.sender, who, text, url); return } } catch (e) { }
  try { if ('Notification' in window && Notification.permission === 'granted') { const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if (reg) reg.showNotification(who, { body: text, tag: 'm' + m.sender, icon: '/icons/icon-192.png', data: { url } }); else new Notification(who, { body: text, tag: 'm' + m.sender }) } } catch (e) { }
};
/* registrar este teléfono para avisar aunque aeffy esté cerrada */
const regDev = async () => {
  if (!N || !N.setDeviceKey || !A.session) return;
  let k = localStorage.getItem('ae_devkey'); if (!k) { const a = new Uint8Array(24); crypto.getRandomValues(a); k = [...a].map(x => x.toString(16).padStart(2, '0')).join(''); localStorage.setItem('ae_devkey', k) }
  const { error } = await A.sb().rpc('aeffy_register_device', { p_key: k }); if (!error) N.setDeviceKey(k)
};
const ls1 = A.liveStart; A.liveStart = () => { ls1 && ls1(); setTimeout(regDev, 3000) };
if (A.session) setTimeout(regDev, 5000);
/* si la app es vieja (sin notificaciones), avisar que hay versión nueva para instalar */
if (N && !N.notify && !sessionStorage.getItem('ae_apkmsg')) { sessionStorage.setItem('ae_apkmsg', '1'); setTimeout(() => toast('Hay una versión nueva de la app con notificaciones: descárgala en aeffy.vercel.app/descargar'), 6000) }

/* menú de la foto de perfil */
const upRaw = async (file, kind) => { const sb = A.sb(), me = A.session.user.id; if (file.size > 3e6) { toast('Ese GIF pesa más de 3 MB'); return null } const path = me + '/' + kind + '-' + Date.now().toString(36) + '.gif'; const { error } = await sb.storage.from('aeffy-avatars').upload(path, file, { contentType: 'image/gif' }); if (error) { toast('No pude subir el GIF'); return null } return sb.storage.from('aeffy-avatars').getPublicUrl(path).data.publicUrl };
const setAv = async url => { if (url && await A.saveProfileExtra({ avatar: url })) { toast('Foto de perfil lista'); A.render() } };
const pick = accept => new Promise(r => { const i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.onchange = () => r(i.files[0] || null); i.click() });
on('avmenu', () => {
  const prem = A.isPremium();
  A.sheet(`<div class="shtrack"><b style="font-size:18px">Foto de perfil</b></div>
   <button class="mi" data-a="av-photo">${ms('upload')}Subir una foto</button>
   <button class="mi" data-a="av-gif">${ms('gif_box')}Subir un GIF${prem ? '' : ' ' + ms('lock')}</button>
   <button class="mi" data-a="av-cover">${ms('album')}Portada de un álbum</button>
   <button class="mi" data-a="av-ini">${ms('text_fields')}Usar iniciales</button>
   <button class="mi" data-a="av-shape">${ms('interests')}Forma y animación</button>`, { head: false })
});
on('av-photo', async () => { A.popLayer(); const f = await pick('image/png,image/jpeg,image/webp'); if (!f) return; toast('Subiendo foto…'); setAv(await A.uploadPic(f, 'avatar')) });
on('av-gif', async () => { A.popLayer(); if (!A.isPremium()) { toast('El avatar con GIF es de aeffy Premium'); A.go('premium'); return } const f = await pick('image/gif'); if (!f) return; if (f.type !== 'image/gif') { toast('Elige un archivo .gif'); return } toast('Subiendo GIF…'); setAv(await upRaw(f, 'avatar')) });
on('av-ini', async () => { A.popLayer(); if (await A.saveProfileExtra({ avatar: '' })) { toast('Ahora se ven tus iniciales'); A.render() } });
on('av-shape', () => { A.popLayer(); setTimeout(() => A.ACT.avshape(), 260) });
on('av-cover', () => {
  A.popLayer();
  const al = {}; for (const t of A.tracks) if (t.cover && !al[t.album]) al[t.album] = t;
  const L = Object.values(al).slice(0, 120);
  setTimeout(() => { const s = A.sheet(A.shead('album', 'Portada de un álbum') + `<div class="stg" id="avc">${L.map((t, i) => `<button data-i="${i}" style="padding:0"><img src="${esc(t.cover)}" alt="" style="width:100%;height:100%;object-fit:cover"></button>`).join('') || '<p class="muted small">Todavía no tienes álbumes con portada.</p>'}</div>`);
    $('#avc', s).onclick = async e => { const b = e.target.closest('button'); if (!b) return; const t = L[+b.dataset.i]; A.popLayer(); toast('Poniendo la portada…'); try { const blob = await (await fetch(t.cover)).blob(); setAv(await A.uploadPic(new File([blob], 'cover.jpg', { type: blob.type || 'image/jpeg' }), 'avatar')) } catch (err) { toast('No pude usar esa portada') } } }, 260)
});
}
