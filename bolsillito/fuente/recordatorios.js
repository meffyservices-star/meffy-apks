// ===== Bolsillito · Recordatorios: pago de tarjeta, suscripciones, cositas, alarma con sonido y el aviso diario para anotar =====
(function () {
const A = App, S = A.S, { $, $$, esc, toast, openSheet, closeSheet, uid, today, ymd, parseYmd, addDays, money, iconHTML } = A;
const ACT = A.ACTIONS;

// ---------------- Dibujitos pixel ----------------
Pix.define('campanita', { raw: ["....................", "........0000........", ".......045540.......", ".........00.........", "........0110........", ".......021130.......", "......02211130......", "......02211130......", ".....0211111130.....", ".....0211111130.....", ".....0211111130.....", "....021111111130....", "....011111111130....", "...03333333333330...", "..0111111111111130..", "..0111111111133330..", "..0000000000000000..", ".........66.........", "........0660........", ".........00........."], pal: '#7a4a3a,#ffd56b,#fff1a8,#e8a93c,#f27ea1,#c9668a,#d9963a' });
Pix.define('reloj_alarma', { raw: ["....................", "....................", "...000........000...", "..06760..00..06760..", "..06660.0660.06660..", "..00000..00..00000..", "......00022000......", ".....0222441110.....", "....022445444110....", "....024445444410....", "....024445444410....", "...02444455554330...", "...02444444444430...", "....014444444430....", "....014444444430....", "....011444444330....", ".....0111343330.....", ".....0000000000.....", "....00........00....", "...................."], pal: '#7a4a3a,#f48fb1,#ffc4d6,#d9668e,#fff6e6,#7a4a3a,#ffd56b,#ffffff' });

const spr = (n, sc) => Pix.sprite(n, sc || 4);
const img = (n, size, extra, cls) => `<img class="pixel ${cls || ''}" alt="" src="${spr(n, 3)}" style="width:${size}px;height:auto;${extra || ''}">`;
const online = () => Store.mode === 'supa' && Store.sb && navigator.onLine !== false;
const activePet = () => (A.petActive && A.petActive()) || 'gochi';
const petName = () => (A.petInfo ? A.petInfo(activePet()).name : 'Tu mascota');
const petSprite = () => (A.petInfo ? A.petInfo(activePet()).sprite : 'gochi');
const sub = A.subHeader;
const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Guayaquil'; } catch (e) { return 'America/Guayaquil'; } };

A.PAGES.recordatorio = 'Recordatorios';
Object.values(A.PACKS).forEach(pk => { pk.map.recordatorio = 's:campanita' + (pk.map.home && pk.map.home.includes('~') ? '~' + pk.map.home.split('~')[1] : ''); });

// ---------------- Tipos de recordatorio ----------------
const KINDS = {
  tarjeta: { name: 'Tarjeta', ic: 'tarjeta', bg: '#ffe0ea', ink: '#b03d66', ph: 'Pagar mi tarjeta' },
  suscripcion: { name: 'Suscripción', ic: 'repeat', bg: '#efe6fb', ink: '#7a4fb8', ph: 'Ej. Pagar Netflix' },
  servicio: { name: 'Servicios', ic: 'foco', bg: '#fff4c2', ink: '#94680f', ph: 'Ej. Pagar la luz' },
  cobro: { name: 'Cobrar', ic: 'moneda', bg: '#e3f3df', ink: '#3f7d33', ph: 'Ej. Cobrarle a Vale' },
  cumple: { name: 'Cumple', ic: 'pastel', bg: '#ffe8c7', ink: '#a8601b', ph: 'Ej. Cumple de mi mami' },
  salud: { name: 'Salud', ic: 'med', bg: '#e1effb', ink: '#2f6d9e', ph: 'Ej. Tomar mi vitamina' },
  otro: { name: 'Otra cosita', ic: 'campanita', bg: '#dcf3ec', ink: '#2c7a64', ph: 'Ej. Regar las plantas' }
};
const K = k => KINDS[k] || KINDS.otro;
const tile = (k, size) => `<span class="rm-tile" style="background:${K(k).bg};width:${size}px;height:${size}px">${img(K(k).ic, Math.round(size * .7))}</span>`;

// ---------------- Fechas ----------------
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_C = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const RL = () => (S.settings.reminders = S.settings.reminders || []);
const hm = r => { const [h, m] = String(r.time || '09:00').split(':').map(Number); return [h || 0, m || 0]; };
const atMin = r => { const [h, m] = hm(r); return h * 60 + m; };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const fmtTime = t => { const [h, m] = String(t || '09:00').split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`; };
const befores = r => r.repeat === 'daily' ? [0] : (r.before && r.before.length ? r.before : [0]);
function occurs(r, s) {
  const d = parseYmd(s), day = d.getDate(), last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const sameDom = dom => day === Math.min(dom, last);
  switch (r.repeat) {
    case 'once': return r.date === s;
    case 'daily': return true;
    case 'weekly': return (r.wdays || []).includes(d.getDay());
    case 'monthly': return !!r.dom && sameDom(r.dom);
    case 'yearly': return !!r.dom && !!r.month && d.getMonth() + 1 === r.month && sameDom(r.dom);
  }
  return false;
}
// la próxima vez que toca (hoy cuenta si todavía no pasa la hora)
function nextOcc(r) {
  const base = new Date(); base.setHours(12, 0, 0, 0);
  for (let i = 0; i < 400; i++) { const s = ymd(addDays(base, i)); if (occurs(r, s) && (i > 0 || nowMin() < atMin(r))) return { date: s, days: i }; if (r.repeat === 'once' && r.date && s > r.date) break; }
  return null;
}
const daysTxt = n => n === 0 ? 'Hoy' : n === 1 ? 'Mañana' : n < 7 ? 'En ' + n + ' días' : null;
const shortDate = s => { const d = parseYmd(s); return `${DIAS[d.getDay()].slice(0, 3)} ${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`; };
const whenChip = o => o ? (daysTxt(o.days) || shortDate(o.date)) : 'Ya pasó';
const cuando = b => b === 0 ? 'hoy' : b === 1 ? 'mañana' : b === 7 ? 'en una semana' : `en ${b} días`;
function repeatTxt(r) {
  if (r.repeat === 'once') return r.date ? `El ${parseYmd(r.date).getDate()} de ${MESES[parseYmd(r.date).getMonth()]}` : 'Una sola vez';
  if (r.repeat === 'daily') return 'Todos los días';
  if (r.repeat === 'weekly') { const L = (r.wdays || []).slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(i => DIAS[i]); return L.length === 7 ? 'Todos los días' : L.length ? 'Cada ' + (L.length > 1 ? L.slice(0, -1).join(', ') + ' y ' + L[L.length - 1] : L[0]) : 'Cada semana'; }
  if (r.repeat === 'monthly') return r.dom >= 31 ? 'El último día de cada mes' : `El ${r.dom || 1} de cada mes`;
  if (r.repeat === 'yearly') return `Cada ${r.dom} de ${MESES[(r.month || 1) - 1]}`;
  return '';
}
function beforeTxt(r) { const L = befores(r).filter(b => b > 0).sort((a, b) => b - a); if (!L.length) return ''; return 'avisa ' + L.map(b => b === 1 ? '1 día' : b === 7 ? '1 semana' : b + ' días').join(' y ') + ' antes'; }
const noteTxt = r => [r.amount ? money(+r.amount) : '', r.note || ''].filter(Boolean).join(' · ');

// ---------------- Guardar en el servidor (para que lleguen los avisos con la app cerrada) ----------------
let syncT = null;
const toRow = r => {
  const [h, m] = hm(r);
  return { user_id: Store.uid, id: r.id, title: (r.title || 'Recordatorio').slice(0, 80), note: noteTxt(r).slice(0, 140) || null, kind: r.kind || 'otro', repeat: r.repeat,
    date: r.repeat === 'once' ? r.date : null, dom: ['monthly', 'yearly'].includes(r.repeat) ? Math.min(31, Math.max(1, +r.dom || 1)) : null,
    wdays: r.repeat === 'weekly' ? (r.wdays || []) : null, month: r.repeat === 'yearly' ? (+r.month || 1) : null,
    hour: h, minute: m, before: befores(r), tz: tz(), sound: null, enabled: r.on !== false, updated_at: new Date().toISOString() };
};
async function syncNow() {
  if (!online() || !Store.uid) { S.remDirty = true; return; }
  const L = RL();
  try {
    if (L.length) { const { error } = await Store.sb.from('reminders').upsert(L.map(toRow), { onConflict: 'user_id,id' }); if (error) throw error; }
    const { data, error: e2 } = await Store.sb.from('reminders').select('id'); if (e2) throw e2;
    const gone = (data || []).map(x => x.id).filter(id => !L.some(r => r.id === id));
    if (gone.length) await Store.sb.from('reminders').delete().in('id', gone);
    S.remDirty = false;
  } catch (e) { console.warn('recordatorios', e); S.remDirty = true; }
}
const sync = () => { clearTimeout(syncT); syncT = setTimeout(syncNow, 700); };
addEventListener('online', () => { if (S.remDirty) sync(); });
const save = () => { A.saveSettings(); sync(); };

// ---------------- Avisos en este celular (notificaciones push) ----------------
const VAPID = 'BJZS49m-TRZOYs2Ansy5qpS72ybEIoIuvTQYbO28jCCe8McNclVj2j6KI2Jkp0qetmzJuC4N8tsDi9zzV7X35n4';
const RM = () => (S.settings.reminder = S.settings.reminder || { on: false, hour: 20 });
const canPush = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const isAndroid = () => /android/i.test(navigator.userAgent);
try { if (/^android-app:\/\/com\.meffy\.bolsillito/.test(document.referrer)) localStorage.setItem('bolsi_twa', '1'); } catch (e) {}
const isApp = () => { try { return localStorage.getItem('bolsi_twa') === '1'; } catch (e) { return false; } };
A.isApp = isApp;
const appCard = () => isAndroid() && !isApp() ? `<div class="card row app-dl" style="gap:12px;background:#fff7d6">${img('phone', 40)}<div style="flex:1"><b>Bolsillito ya es una app</b><div class="faint">Descárgala para Android: se abre sin barra del navegador y los avisos llegan como de app.</div></div><a class="btn pink sm" href="/descargar" style="text-decoration:none">Descargar</a></div>` : '';
A.appCard = appCard;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent); const standalone = () => window.matchMedia && matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const b64u = s => { const p = '='.repeat((4 - s.length % 4) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map(c => c.charCodeAt(0))); };
const hourTxt = h => (h % 12 || 12) + (h < 12 ? ' de la mañana' : h < 19 ? ' de la tarde' : ' de la noche');
const EPK = 'bolsi_push_ep';
const myEp = () => { try { return localStorage.getItem(EPK) || ''; } catch (e) { return ''; } };
const setEp = v => { try { v ? localStorage.setItem(EPK, v) : localStorage.removeItem(EPK); } catch (e) { } };
const devOn = () => canPush() && Notification.permission === 'granted' && !!myEp();
async function subscribeDevice() {
  if (!canPush()) { toast('Este celular no permite avisos'); return false; }
  if (!online()) { toast('Para activar los avisos necesitas internet'); return false; }
  const p = await Notification.requestPermission(); if (p !== 'granted') { toast('Necesito permiso para mandarte avisos'); return false; }
  try {
    const reg = await navigator.serviceWorker.ready; let s = await reg.pushManager.getSubscription(); if (!s) s = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(VAPID) });
    const j = s.toJSON(); const r = RM();
    const { error } = await Store.sb.from('push_subs').upsert({ endpoint: j.endpoint, user_id: Store.uid, p256dh: j.keys.p256dh, auth: j.keys.auth, hour: r.hour, tz: tz(), pet: petName(), enabled: true, daily: !!r.on }, { onConflict: 'endpoint' });
    if (error) throw error; setEp(j.endpoint); r.endpoint = j.endpoint; A.saveSettings(); return true;
  } catch (e) { console.warn(e); toast('No se pudieron activar los avisos en este celular'); return false; }
}
const updSub = patch => { const ep = myEp(); if (ep && online()) return Store.sb.from('push_subs').update(patch).eq('endpoint', ep).then(() => {}, () => {}); };
// si ya tenía los avisos activos de antes, recuerda este celular
// al abrir la app: si el celular tiene permiso y está suscrito, se vuelve a registrar como activo (así nunca queda apagado sin querer)
async function adoptSub() {
  if (!canPush() || Notification.permission !== 'granted' || !online()) return;
  try {
    const reg = await navigator.serviceWorker.ready; let s = await reg.pushManager.getSubscription();
    if (!s) { if (!myEp()) return; s = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(VAPID) }); }
    const j = s.toJSON(), r = RM();
    const { error } = await Store.sb.from('push_subs').upsert({ endpoint: j.endpoint, user_id: Store.uid, p256dh: j.keys.p256dh, auth: j.keys.auth, hour: r.hour, tz: tz(), pet: petName(), enabled: true, daily: !!r.on }, { onConflict: 'endpoint' });
    if (!error) { setEp(j.endpoint); r.endpoint = j.endpoint; }
  } catch (e) { console.warn(e); }
}
addEventListener('beforeinstallprompt', e => { e.preventDefault(); A.installEvt = e; if (S.route === 'recordatorio') A.render(); });
addEventListener('appinstalled', () => { A.installEvt = null; toast('¡Listo! Bolsillito ya está instalada como app.'); });
ACT.installApp = async () => { const e = A.installEvt; if (!e) return; e.prompt(); try { await e.userChoice; } catch (er) { } A.installEvt = null; A.render(); };

// ---------------- Ideas de recordatorios (tarjetas y suscripciones que ya tiene) ----------------
function ideas() {
  const L = RL(), ign = S.settings.remIgn || [], out = [];
  (S.fin.accounts || []).filter(a => !a.archived && (a.type === 'tarjeta' || a.liability) && a.due).forEach(a => {
    const k = 'ac:' + a.id; if (ign.includes(k) || L.some(r => r.acct === a.id)) return;
    out.push({ k, kind: 'tarjeta', icon: a.icon || 's:tarjeta', title: 'Pagar ' + a.name, sub: `Pagas el día ${a.due} de cada mes`, preset: { kind: 'tarjeta', title: 'Pagar ' + a.name, repeat: 'monthly', dom: a.due, before: [3, 0], acct: a.id, time: '09:00' } });
  });
  try {
    (A.findSubs ? A.findSubs() : []).forEach(x => {
      const k = 'sb:' + x.k; if (ign.includes(k) || L.some(r => r.subk === x.k) || L.some(r => (r.title || '').toLowerCase().includes(String(x.name).toLowerCase()))) return;
      const dom = x.last ? parseYmd(x.last).getDate() : 1;
      out.push({ k, kind: 'suscripcion', icon: (S.settings.subIcons || {})[x.k] || x.icon, title: x.name, sub: `${money(x.monthly)} al mes · sueles pagar el ${dom}`, preset: { kind: 'suscripcion', title: 'Pagar ' + x.name, amount: x.monthly, repeat: 'monthly', dom, before: [1], subk: x.k, time: '09:00' } });
    });
  } catch (e) { }
  return out.slice(0, 4);
}

// ---------------- Pantalla ----------------
function itemHTML(r) {
  const o = nextOcc(r), off = r.on === false, k = K(r.kind), soon = o && o.days <= 1 && !off;
  return `<div class="rm-item ${off ? 'off' : ''} ${soon ? 'soon' : ''}" style="--k:${k.ink};--kb:${k.bg}">
<button class="rm-item-main" data-act="remEdit" data-id="${esc(r.id)}">${tile(r.kind, 46)}<span class="rm-item-tx"><b>${esc(r.title || 'Recordatorio')}</b><span>${esc(repeatTxt(r))} · ${fmtTime(r.time)}</span>${noteTxt(r) || beforeTxt(r) ? `<span class="rm-item-x">${esc([noteTxt(r), beforeTxt(r)].filter(Boolean).join(' · '))}</span>` : ''}</span></button>
<span class="rm-item-r"><span class="rm-when">${esc(r.auto ? 'Pospuesto' : whenChip(o))}</span><span class="toggle"><input type="checkbox" data-rm-on="${esc(r.id)}" ${off ? '' : 'checked'} aria-label="Prender o apagar"><span></span></span></span></div>`;
}
A.screens.recordatorio = () => {
  const L = RL(), r = RM(), perm = canPush() ? Notification.permission : 'no';
  const withNext = L.map(x => ({ x, o: nextOcc(x) }));
  const live = withNext.filter(z => z.o).sort((a, b) => (a.o.date + atMin(a.x)).localeCompare(b.o.date + atMin(b.x)) || a.o.days - b.o.days);
  const nextOn = live.find(z => z.x.on !== false);
  const past = withNext.filter(z => !z.o);
  const sorted = live.slice().sort((a, b) => a.o.days - b.o.days || atMin(a.x) - atMin(b.x));
  const idx = ideas();
  const hero = `<div class="rm-hero">
<div class="rm-hero-art"><span class="rm-hero-pet">${img(petSprite(), 74)}</span><span class="rm-hero-clock">${img('reloj_alarma', 40)}</span></div>
<div class="rm-hero-tx">${nextOn ? `<span class="rm-kicker">Lo próximo</span><b class="rm-hero-t">${esc(nextOn.x.title)}</b><span class="rm-hero-w">${esc(daysTxt(nextOn.o.days) || shortDate(nextOn.o.date))} · ${fmtTime(nextOn.x.time)}</span>`
    : `<span class="rm-kicker">Tus recordatorios</span><b class="rm-hero-t">¿Qué te recuerdo?</b><span class="rm-hero-w">${esc(petName())} te avisa para que no se te pase nada.</span>`}</div></div>`;
  const dev = !online() ? `<div class="rm-dev warn">${img('nube', 26)}<span>Sin internet: tus recordatorios salen con la app abierta. Los avisos al celular se activan al volver la conexión.</span></div>`
    : !canPush() ? `<div class="rm-dev warn">${img('alerta', 26)}<span>${isIOS() && !standalone() ? 'En iPhone primero agrega Bolsillito a tu pantalla de inicio (Compartir → "Agregar a inicio") y ábrela desde ahí.' : 'Este navegador no permite avisos. Prueba con Chrome o instalando la app.'}</span></div>`
    : perm === 'denied' ? `<div class="rm-dev warn">${img('alerta', 26)}<span>Bloqueaste los avisos de Bolsillito. Actívalos en los ajustes de tu celular (Notificaciones → Bolsillito).</span></div>`
    : devOn() ? `<div class="rm-dev ok">${img('check', 24)}<span><b>Avisos activados en este celular</b><br>Te llegan aunque la app esté cerrada.</span><button class="btn sm" data-act="rmTest">Probar</button></div>`
    : `<div class="rm-dev">${img('campanita', 26)}<span><b>Activa los avisos</b><br>Para que te lleguen aunque la app esté cerrada.</span><button class="btn pink sm" data-act="remDev">Activar</button></div>`;
  return `${sub('recordatorio', 'more')}
${hero}
${dev}
<div class="rm-kinds-row" role="list">${Object.entries(KINDS).map(([k, v]) => `<button class="rm-qk" data-act="remNew" data-kind="${k}" role="listitem">${tile(k, 44)}<span>${v.name}</span></button>`).join('')}</div>
${idx.length ? `<div class="card stack rm-ideas"><div class="row between"><b>¿Te aviso de esto?</b><span class="faint" style="font-size:12px">Lo vi en tus cuentas</span></div>${idx.map((x, i) => `<div class="rm-idea"><span class="ic">${iconHTML(x.icon, 30)}</span><span class="rm-item-tx"><b>${esc(x.title)}</b><span>${esc(x.sub)}</span></span><button class="btn pink sm" data-act="remIdea" data-i="${i}">Avisarme</button><button class="iconbtn sm" data-act="remIdeaX" data-k="${esc(x.k)}" aria-label="No, gracias">×</button></div>`).join('')}</div>` : ''}
<div class="rm-sec"><h3>Mis recordatorios</h3><button class="btn pink sm" data-act="remNew" data-kind="otro">+ Nuevo</button></div>
${sorted.length ? `<div class="rm-list">${sorted.map(z => itemHTML(z.x)).join('')}</div>` : `<div class="card rm-empty">${img('campanita', 46, '', 'rm-swing')}<b>Todavía no tienes recordatorios</b><span class="faint">Toca un tipo de arriba: el pago de tu tarjeta, una suscripción o cualquier cosita que no quieras olvidar.</span></div>`}
${past.length ? `<details class="card rm-past"><summary><b>Ya pasaron (${past.length})</b></summary><div class="rm-list" style="margin-top:8px">${past.map(z => itemHTML(z.x)).join('')}</div><button class="btn sm danger" data-act="remClearPast" style="margin-top:10px">Borrar los que ya pasaron</button></details>` : ''}
<div class="card stack rm-daily"><div class="row" style="gap:12px">${img(petSprite(), 44)}<div style="flex:1"><b>Aviso para anotar</b><div class="faint">Todos los días ${esc(petName())} te recuerda anotar tus gastos. Si ese día ya anotaste, no te molesta.</div></div><span class="toggle"><input type="checkbox" id="rmOn" ${r.on ? 'checked' : ''} ${online() && canPush() ? '' : 'disabled'}><span></span></span></div>
<label class="f">¿A qué hora?<select class="in" id="rmH">${Array.from({ length: 24 }, (_, h) => `<option value="${h}" ${h === r.hour ? 'selected' : ''}>${hourTxt(h)}</option>`).join('')}</select></label></div>
${appCard()}${!standalone() && !isIOS() && !isAndroid() ? `<div class="card stack" style="background:#fff7d6"><b>¿El aviso dice el link de la página?</b><div class="faint">Pasa cuando abres Bolsillito desde el navegador o con un acceso directo. Instálala como app y los avisos dirán solo "Bolsillito", como las demás apps.</div>${A.installEvt ? '<button class="btn pink" data-act="installApp" style="justify-content:center">Instalar Bolsillito</button>' : '<div class="faint">En Chrome toca el menú ⋮ y luego <b>"Instalar app"</b> (no "Agregar a pantalla de inicio"). Si ya tenías un acceso directo, bórralo primero.</div>'}</div>` : ''}
<p class="faint" style="margin:0">Los avisos suenan con el tono de notificaciones de tu celular. Llegan aunque la app esté cerrada.</p>`;
};
A.after.recordatorio = el => {
  const on = $('#rmOn', el), h = $('#rmH', el);
  if (on) on.onchange = async () => {
    const r = RM();
    if (on.checked) { r.on = true; A.saveSettings(); if (!devOn()) { if (!(await subscribeDevice())) { r.on = false; A.saveSettings(); A.render(); return; } } else await updSub({ daily: true, hour: r.hour, pet: petName(), tz: tz() }); toast(`¡Listo! Te aviso todos los días a las ${hourTxt(r.hour)}`); }
    else { r.on = false; A.saveSettings(); await updSub({ daily: false }); toast('Aviso para anotar apagado'); }
    A.render();
  };
  if (h) h.onchange = () => { const r = RM(); r.hour = +h.value; A.saveSettings(); updSub({ hour: r.hour }); if (r.on) toast(`Te aviso a las ${hourTxt(r.hour)}`); };
  el.addEventListener('change', e => { const t = e.target; if (!t.dataset.rmOn) return; const r = RL().find(x => x.id === t.dataset.rmOn); if (!r) return; r.on = t.checked; save(); A.render(); });
};
ACT.remDev = async () => { if (await subscribeDevice()) { toast('¡Avisos activados en este celular!'); A.render(); } };
ACT.rmTest = async () => {
  if (Notification.permission !== 'granted' && (await Notification.requestPermission()) !== 'granted') return toast('Necesito permiso para mandarte avisos');
  const reg = await navigator.serviceWorker.ready;
  reg.showNotification('Bolsillito', { badge: '/badge.png', body: `Así te llegan los avisos. ${petName()} te saluda.`, icon: '/icon-192.png', tag: 'bolsillito-prueba', vibrate: [200, 100, 200] });
};
ACT.remIdeaX = a => { S.settings.remIgn = (S.settings.remIgn || []).concat(a.dataset.k); A.saveSettings(); A.render(); };
ACT.remIdea = a => { const x = ideas()[+a.dataset.i]; if (x) editor(null, x.preset); };
ACT.remNew = a => editor(null, { kind: a.dataset.kind || 'otro' });
ACT.remEdit = a => { const r = RL().find(x => x.id === a.dataset.id); if (r) editor(r); };
ACT.remClearPast = a => { if (!a.dataset.s) { a.dataset.s = 1; a.textContent = '¿Segura? Toca otra vez'; return; } S.settings.reminders = RL().filter(r => nextOcc(r)); save(); A.render(); };

// ---------------- Crear / editar ----------------
function editor(r0, preset) {
  const isNew = !r0;
  const d = Object.assign({ kind: 'otro', title: '', note: '', amount: '', repeat: 'monthly', date: today(), dom: new Date().getDate(), wdays: [new Date().getDay()], month: new Date().getMonth() + 1, time: '09:00', before: [0], on: true }, preset || {}, r0 ? JSON.parse(JSON.stringify(r0)) : {});
  if (isNew && preset && preset.kind && !preset.repeat) Object.assign(d, { cumple: { repeat: 'yearly', before: [1, 0] }, salud: { repeat: 'daily' }, servicio: { before: [2, 0] }, tarjeta: { before: [3, 0] }, cobro: { repeat: 'once' }, suscripcion: { before: [1] } }[preset.kind] || {});
  const cards = (S.fin.accounts || []).filter(a => !a.archived && (a.type === 'tarjeta' || a.liability));
  const REPS = [['once', 'Una vez'], ['daily', 'Diario'], ['weekly', 'Semanal'], ['monthly', 'Mensual'], ['yearly', 'Anual']];
  const BEF = [[0, 'El mismo día'], [1, '1 día antes'], [3, '3 días antes'], [7, '1 semana antes']];
  const yDate = () => { const y = new Date().getFullYear(); return `${y}-${String(d.month || 1).padStart(2, '0')}-${String(Math.min(d.dom || 1, 28 + 3)).padStart(2, '0')}`; };
  const whenHTML = () => d.repeat === 'once' ? `<label class="f">¿Qué día?<input class="in" type="date" id="reDate" value="${esc(d.date || today())}" min="${today()}"></label>`
    : d.repeat === 'weekly' ? `<div class="f">¿Qué días?<div class="rm-wd">${[1, 2, 3, 4, 5, 6, 0].map(i => `<button type="button" data-wd="${i}" aria-pressed="${(d.wdays || []).includes(i)}" aria-label="${DIAS[i]}">${DIAS_C[i]}</button>`).join('')}</div></div>`
    : d.repeat === 'monthly' ? `<label class="f">¿Qué día del mes?<select class="in" id="reDom">${Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}" ${+d.dom === i + 1 ? 'selected' : ''}>${i === 30 ? '31 (o el último día)' : 'Día ' + (i + 1)}</option>`).join('')}</select></label>${d.kind === 'tarjeta' && cards.length ? `<label class="f">¿Qué tarjeta?<select class="in" id="reAc"><option value="">Ninguna en especial</option>${cards.map(a => `<option value="${esc(a.id)}" ${d.acct === a.id ? 'selected' : ''}>${esc(a.name)}${a.due ? ' · paga el ' + a.due : ''}</option>`).join('')}</select></label>` : ''}`
    : d.repeat === 'yearly' ? `<label class="f">¿Qué fecha? (se repite cada año)<input class="in" type="date" id="reY" value="${yDate()}"></label>` : '';
  const prevHTML = () => { const b = Math.max(...befores(d)); const t = (d.title || K(d.kind).ph.replace(/^Ej\. /, '')); return `<div class="rm-notif"><img src="/icon-192.png" alt=""><div><div class="rm-notif-h"><b>Bolsillito</b><span>ahora</span></div><b>${esc(b > 0 && d.repeat !== 'daily' ? t + ' · ' + cuando(b) : t)}</b><span>${esc(noteTxt(d) || petName() + ' te lo recuerda.')}</span></div></div>`; };
  const html = `<div class="rm-ed stack">
<div class="rm-ed-kinds">${Object.entries(KINDS).map(([k, v]) => `<button type="button" class="rm-ek" data-k="${k}" aria-pressed="${d.kind === k}">${tile(k, 40)}<span>${v.name}</span></button>`).join('')}</div>
<label class="f">¿Qué te recuerdo?<input class="in" id="reT" maxlength="60" value="${esc(d.title)}" placeholder="${esc(K(d.kind).ph)}" autofocus></label>
<div class="formgrid"><label class="f">Hora<input class="in" type="time" id="reTime" value="${esc(d.time)}"></label><label class="f">Monto (si quieres)<input class="in" type="number" inputmode="decimal" step="0.01" min="0" id="reAmt" value="${d.amount ? esc(String(d.amount)) : ''}" placeholder="$0,00"></label></div>
<label class="f">Notita (si quieres)<input class="in" id="reN" maxlength="80" value="${esc(d.note || '')}" placeholder="Ej. Se paga en la app del banco"></label>
<div class="f">¿Cada cuánto?<div class="seg rm-seg" id="reRep">${REPS.map(([k, n]) => `<button type="button" data-rep="${k}" aria-pressed="${d.repeat === k}">${n}</button>`).join('')}</div></div>
<div id="reWhen" class="stack" style="gap:10px">${whenHTML()}</div>
<div class="f" id="reBefW" ${d.repeat === 'daily' ? 'hidden' : ''}>Avísame<div class="chips">${BEF.map(([b, n]) => `<button type="button" class="chip" data-bef="${b}" aria-pressed="${befores(d).includes(b)}">${n}</button>`).join('')}</div></div>
<div class="f">Así te llega<div id="rePrev">${prevHTML()}</div></div>
<div class="row" style="gap:8px;margin-top:4px">${isNew ? '' : '<button type="button" class="btn danger" id="reDel">Borrar</button>'}<button type="button" class="btn pink" id="reOk" style="flex:1;justify-content:center;padding:12px">${isNew ? 'Guardar recordatorio' : 'Guardar cambios'}</button></div>
</div>`;
  openSheet(isNew ? 'Nuevo recordatorio' : 'Editar recordatorio', html, sh => {
    const rePrev = () => { const p = $('#rePrev', sh); if (p) p.innerHTML = prevHTML(); };
    const reWhen = () => { $('#reWhen', sh).innerHTML = whenHTML(); $('#reBefW', sh).hidden = d.repeat === 'daily'; rePrev(); };
    sh.addEventListener('input', e => {
      const t = e.target;
      if (t.id === 'reT') d.title = t.value; if (t.id === 'reN') d.note = t.value; if (t.id === 'reAmt') d.amount = t.value ? Math.max(0, +t.value) : '';
      if (t.id === 'reTime') d.time = t.value || '09:00'; if (t.id === 'reDate') d.date = t.value;
      if (t.id === 'reY' && t.value) { const x = parseYmd(t.value); d.dom = x.getDate(); d.month = x.getMonth() + 1; }
      rePrev();
    });
    sh.addEventListener('change', e => {
      const t = e.target;
      if (t.id === 'reDom') d.dom = +t.value;
      if (t.id === 'reAc') { d.acct = t.value || undefined; const a = cards.find(x => x.id === t.value); if (a) { if (a.due) { d.dom = a.due; } if (!d.title || /^Pagar /.test(d.title)) d.title = 'Pagar ' + a.name; $('#reT', sh).value = d.title; reWhen(); } }
    });
    sh.addEventListener('click', async e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.k) { d.kind = b.dataset.k; $$('.rm-ek', sh).forEach(x => x.setAttribute('aria-pressed', x.dataset.k === d.kind)); $('#reT', sh).placeholder = K(d.kind).ph; reWhen(); }
      if (b.dataset.rep) { d.repeat = b.dataset.rep; $$('[data-rep]', sh).forEach(x => x.setAttribute('aria-pressed', x.dataset.rep === d.repeat)); if (d.repeat === 'once' && (!d.date || d.date < today())) d.date = today(); reWhen(); }
      if (b.dataset.wd) { const i = +b.dataset.wd, s = new Set(d.wdays || []); s.has(i) ? s.delete(i) : s.add(i); d.wdays = [...s]; b.setAttribute('aria-pressed', s.has(i)); }
      if (b.dataset.bef != null && b.dataset.bef !== '') { const v = +b.dataset.bef, s = new Set(befores(d)); s.has(v) ? s.delete(v) : s.add(v); d.before = [...s].sort((x, y) => y - x); b.setAttribute('aria-pressed', s.has(v)); rePrev(); }
      if (b.id === 'reDel') { if (!b.dataset.s) { b.dataset.s = 1; b.textContent = '¿Segura?'; return; } S.settings.reminders = RL().filter(x => x.id !== r0.id); closeSheet(); save(); A.render(); toast('Recordatorio borrado'); }
      if (b.id === 'reOk') {
        d.title = ($('#reT', sh).value || '').trim(); if (!d.title) { $('#reT', sh).focus(); return toast('Escribe qué te recuerdo'); }
        if (d.repeat === 'weekly' && !(d.wdays || []).length) return toast('Elige al menos un día');
        if (d.repeat === 'once' && !d.date) return toast('Elige el día');
        if (d.repeat === 'once') { const tooLate = d.date < today() || (d.date === today() && atMin(d) <= nowMin()); if (tooLate) return toast('Esa hora ya pasó. Elige una más tarde.'); }
        if (!befores(d).length) d.before = [0];
        if (d.amount === '' || !(+d.amount > 0)) delete d.amount;
        delete d.sound; delete d.auto;
        if (isNew) { d.id = 'r' + uid(); d.on = true; RL().push(d); } else Object.assign(r0, d);
        save(); closeSheet(); A.render();
        const o = nextOcc(d); toast(o ? `¡Listo! Te aviso ${(daysTxt(o.days) || 'el ' + shortDate(o.date)).toLowerCase()} a las ${fmtTime(d.time)}` : 'Guardado');
        if (!devOn() && canPush() && Notification.permission !== 'denied' && online() && !S.settings.remAsked) { S.settings.remAsked = 1; A.saveSettings(); setTimeout(async () => { if (await subscribeDevice()) { toast('Avisos activados: te llegan aunque la app esté cerrada'); A.render(); } }, 600); }
      }
    });
  });
}

// ---------------- Con la app abierta: aviso chiquito (la notificación la manda el servidor) ----------------
const FK = 'bolsi_rem_fired';
const fired = () => { try { return JSON.parse(localStorage.getItem(FK) || '[]'); } catch (e) { return []; } };
const markFired = k => { try { localStorage.setItem(FK, JSON.stringify(fired().concat(k).slice(-80))); } catch (e) { } };
function checkDue() {
  if (document.hidden) return;
  const now = new Date(), t = today(), cur = nowMin();
  for (const r of RL()) {
    if (r.on === false) continue; const at = atMin(r); if (cur < at || cur > at + 10) continue;
    for (const b of befores(r)) {
      if (!occurs(r, ymd(addDays(now, b)))) continue; const fk = r.id + '|' + t + ':' + b;
      if (fired().includes(fk)) continue; markFired(fk);
      toast(`${b > 0 ? 'Es ' + cuando(b) + ': ' : 'Recordatorio: '}${r.title}`); if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      if (r.auto) { S.settings.reminders = RL().filter(x => x.id !== r.id); save(); }
      return;
    }
  }
}
setInterval(checkDue, 20000); document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(checkDue, 800); });
// al tocar la notificación se abre la app en Recordatorios
function openFromLink() {
  const q = new URLSearchParams(location.search); const id = q.get('alarma'); if (!id) return;
  const key = q.get('k') || today() + ':0'; markFired(id + '|' + key);
  try { history.replaceState({ r: 'home' }, '', '/'); } catch (e) { }
  setTimeout(() => { if (A.go) A.go('recordatorio'); }, 300);
}

// avisa al servidor que hoy ya anotaste (así no te manda el aviso para anotar)
const render2 = A.render;
A.render = (...x) => { const r = S.settings.reminder; const d = today(); const ep = myEp() || (r && r.endpoint); if (r && r.on && ep && r.logged !== d && online() && S.tx.some(t => t.date === d && !t.example && !t.recurring)) { r.logged = d; Store.sb.from('push_subs').update({ last_log: d }).eq('endpoint', ep).then(() => {}, () => {}); } return render2(...x); };

// limpia los "recuérdame en 10 min" que ya pasaron
function cleanAuto() { const L = RL(), keep = L.filter(r => !r.auto || nextOcc(r) || (r.date === today() && nowMin() - atMin(r) < 30)); if (keep.length !== L.length) { S.settings.reminders = keep; return true; } return false; }

const st0 = A.start;
A.start = async () => {
  await st0();
  if (cleanAuto()) A.saveSettings();
  adoptSub().then(() => { if (S.route === 'recordatorio') A.render(); });
  if (RL().length || S.remDirty) setTimeout(syncNow, 3000);
  openFromLink(); setTimeout(checkDue, 2500);
};

})();
