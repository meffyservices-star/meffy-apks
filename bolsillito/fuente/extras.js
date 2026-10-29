// ===== Bolsillito · Buscador en Más, "todo guardado", bienvenida con Ale, primeros pasitos y avisos de amigas =====
(function () {
const A = App, S = A.S, { $, $$, esc, toast } = A;
const ACT = A.ACTIONS;
const spr = (n, sc) => Pix.sprite(n, sc || 3);
const img = (n, size, extra) => `<img class="pixel" alt="" src="${spr(n, 3)}" style="width:${size}px;height:auto;${extra || ''}">`;
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const ale = sc => (A.wear ? A.wear('ale', { scale: sc || 5 }) : img('pudin', 80));

// ---------------- Buscador ----------------
// qué hay en cada sección y palabras con las que la gente la busca
const INFO = {
  home: ['Tu resumen del día', 'inicio hoy cerrar el dia gastaste entro racha'],
  wallet: ['Cuentas, saldos y tarjetas', 'billetera cuentas banco efectivo saldo tarjeta credito cuotas diferido'],
  loans: ['Lo que te deben y lo que debes', 'prestamo prestar deuda deber me deben debo cobrar'],
  tx: ['Todos tus gastos e ingresos', 'movimientos historial gastos ingresos buscar gasto transferencia'],
  month: ['Presupuesto y gastos del mes', 'mes presupuesto categorias resumen historias limite'],
  journal: ['Tu diario con stickers y plantillas', 'journal diario paginas stickers plantillas notas escribir'],
  year: ['Cómo te fue en el año', 'ano anual resumen del ano'],
  goals: ['Ahorros para un viaje, un fondo o algo lindo', 'metas ahorro ahorrar alcancia cochinito viaje fondo'],
  recurring: ['Pagos que se repiten', 'fijos arriendo alquiler internet luz agua pagos fijos mensual'],
  rules: ['Que la app anote sola', 'reglas automatico categorizar'],
  projections: ['Cuánto tendrás más adelante', 'proyecciones futuro cuanto tendre plan'],
  settings: ['Bancos, cuentas y categorías', 'cuentas categorias bancos editar cuenta saldo de hoy configuracion ajustes'],
  appearance: ['Tema, colores, letras e íconos', 'apariencia tema colores letra iconos fondo modo privado ocultar cifras'],
  plan: ['Tu plan Meffy+', 'meffy plus premium plan pagar suscripcion'],
  data: ['Tu foto, tu nombre y tu copia de seguridad', 'perfil foto nombre exportar respaldo copia cerrar sesion cuenta'],
  rincon: ['Cuida, baña y alimenta a tu mascota', 'mascota cuidar banar alimentar comida dormir mimar'],
  shey: ['Tus antojos', 'antojos caprichos'],
  tienda: ['Ropa y cositas para tu mascota', 'tiendita ropa probador comprar estrellitas accesorios'],
  suscripciones: ['Netflix, Spotify y lo que pagas cada mes', 'suscripciones netflix spotify disney youtube'],
  elegir: ['Adopta o cambia de mascota', 'elegir mascota adoptar cambiar'],
  cuarto: ['Muebles, lámparas, ventanas, pared y piso', 'cuarto decorar muebles lampara luces ventana pared piso sala'],
  regalo: ['Tu regalo de cada día', 'regalo del dia sorpresa diario'],
  crecer: ['Niveles de tu mascota', 'crecer nivel evolucionar'],
  coleccion: ['Todas las mascotas postre', 'coleccion mascotas postres'],
  logros: ['Tus trofeos', 'logros trofeos medallas'],
  juegos: ['Saltar, atrapar monedas, cruzar la calle', 'juegos jugar saltar monedas estrellitas cruzar calle minijuegos'],
  jardin: ['Tus hábitos como plantitas', 'jardin habitos plantas regar'],
  tablero: ['Tu moodboard del año', 'tablero suenos moodboard manifestar fotos stickers'],
  visitas: ['Tus amigas, tu cajita y tus cartas', 'visitas amigas cajita regalos cartas codigo libro de visitas barrio gracias'],
  compartidas: ['Páginas de journal con amigas', 'compartidas paginas con amigas journal compartido'],
  recordatorio: ['Avisos al celular', 'recordatorios avisos notificaciones alarma pago de tarjeta cumpleanos'],
  compras: ['Lista del súper, precios y lo que hay en casa', 'compras lista super mercado farmacia precios en casa carrito'],
  admin: ['Panel de la dueña', 'admin panel usuarias configuracion'],
  admincat: ['Mascotas, muebles, ropa y comida nuevos', 'agregar cosas nuevas panel muebles ropa mascotas'],
  adminlook: ['Íconos, nombres y secciones de la app', 'personalizar iconos nombres secciones apagar']
};
const OWNER_ONLY = ['admin', 'admincat', 'adminlook'];
const EXTRA = [
  { act: 'quickadd', t: 'Anotar un gasto o ingreso', d: 'Agrega un movimiento nuevo', k: 'anotar gasto ingreso registrar pague compre nuevo', ic: 'add' },
  { act: 'tourOpen', t: 'Primeros pasitos con Ale', d: 'El recorrido para conocer la app', k: 'ayuda bienvenida tutorial recorrido como funciona empezar', sp: 'pudin' },
  { act: 'syncNow', t: 'Subir mis cambios ahora', d: 'Guardar en la nube lo que está en tu celular', k: 'guardar subir nube sincronizar respaldo internet', sp: 'nube' }
];
function entries() {
  const out = [];
  Object.keys(INFO).forEach(k => {
    if (!A.PAGES[k] && k !== 'journal') return; if (OWNER_ONLY.includes(k) && !Store.isOwner) return;
    out.push({ go: k, t: A.PAGES[k] || k, d: INFO[k][0], k: INFO[k][1], ic: k });
  });
  return out.concat(EXTRA.filter(x => x.act !== 'syncNow' || Store.mode === 'supa'));
}
function search(q) {
  const words = norm(q).split(/\s+/).filter(Boolean); if (!words.length) return [];
  return entries().map(e => {
    const t = norm(e.t), all = t + ' ' + norm(e.d) + ' ' + e.k;
    if (!words.every(w => all.includes(w))) return null;
    const score = (t.startsWith(words[0]) ? 0 : t.includes(words[0]) ? 1 : 2);
    return [score, e];
  }).filter(Boolean).sort((a, b) => a[0] - b[0]).map(x => x[1]);
}
const icOf = e => e.sp ? img(e.sp, 30) : A.iconHTML(A.pageIcon(e.ic), 30);
function resultsHTML(q) {
  const L = search(q);
  if (!L.length) return `<div class="card qs-none">${ale(3)}<span><b>No encontré “${esc(q)}”</b><br><span class="faint">Prueba con otra palabra, como “metas”, “cuarto” o “avisos”.</span></span></div>`;
  return `<div class="qs-list">${L.map(e => `<button class="qs-row" ${e.go ? `data-go="${e.go}"` : `data-act="${e.act}"`}><span class="qs-ic">${icOf(e)}</span><span class="qs-tx"><b>${esc(e.t)}</b><span>${esc(e.d)}</span></span><span class="qs-chev">›</span></button>`).join('')}</div>`;
}

// ---------------- Que nada se pierda: cómo está lo guardado ----------------
function syncHTML() {
  if (Store.mode !== 'supa' || !Store.pendingCount) return '';
  const n = Store.pendingCount();
  if (!n) return `<div class="sync-ok">${img('nube', 20)}<span>Todo guardado en la nube</span></div>`;
  return `<div class="card sync-wait">${img('nube', 34)}<span><b>${n === 1 ? '1 cambio guardado en tu celular' : n + ' cambios guardados en tu celular'}</b><br><span class="faint">${navigator.onLine ? 'Se están subiendo a la nube.' : 'Se suben solos cuando vuelva el internet. No se pierde nada.'}</span></span><button class="btn sm" data-act="syncNow">Subir ahora</button></div>`;
}
ACT.syncNow = async () => {
  if (Store.mode !== 'supa') return toast('Todo queda guardado en este dispositivo.');
  if (!navigator.onLine) return toast('No hay internet ahora. Tus cambios siguen guardados en tu celular.');
  toast('Subiendo tus cambios…');
  try { if (Store.tryReconnect) Store.tryReconnect(); else await Store.syncDirty(); } catch (e) {}
  setTimeout(() => { if (!Store.pendingCount()) toast('Todo guardado en la nube ✓'); A.render(); }, 2500);
};

const more0 = A.screens.more;
A.screens.more = () => {
  const h = more0(); const hd = A.header('more'); const i = h.indexOf(hd); const cut = i >= 0 ? i + hd.length : 0;
  return `${h.slice(0, cut)}<label class="qs-box">${img('lupa', 22, 'opacity:.8')}<input id="qsIn" type="search" enterkeyhint="search" autocomplete="off" placeholder="Buscar en Bolsillito…" value="${esc(S.qs || '')}"><button type="button" class="qs-x" data-act="qsClear" aria-label="Borrar búsqueda" ${S.qs ? '' : 'hidden'}>✕</button></label>
<div id="qsRes">${S.qs ? resultsHTML(S.qs) : ''}</div><div id="qsBase" ${S.qs ? 'hidden' : ''}>${syncHTML()}${h.slice(cut)}</div>`;
};
ACT.qsClear = () => { S.qs = ''; A.render(); const i = $('#qsIn'); if (i) i.focus(); };
const after0 = A.after.more;
A.after.more = el => {
  if (after0) after0(el);
  const inp = $('#qsIn', el); if (!inp) return;
  inp.addEventListener('input', () => {
    S.qs = inp.value; const q = inp.value.trim();
    $('#qsRes', el).innerHTML = q ? resultsHTML(q) : ''; $('#qsBase', el).hidden = !!q;
    const x = $('.qs-x', el); if (x) x.hidden = !q;
  });
};
// al tocar un resultado se olvida la búsqueda para la próxima vez
document.addEventListener('click', e => { if (e.target.closest('#qsRes [data-go], #qsRes [data-act]')) S.qs = ''; }, true);
if (!Pix.has('lupa')) Pix.define('lupa', { w: 14, h: 14, fn(p) { p.e(5.5, 5.5, 4.6, 4.6, '#8a4d4f'); p.e(5.5, 5.5, 3.2, 3.2, '#e9f6ff'); p.px(4, 4, '#ffffff'); p.px(4, 5, '#ffffff'); p.r(9, 9, 2, 2, '#8a4d4f'); p.r(10, 10, 3, 3, '#f27ea1'); p.r(11, 11, 2, 2, '#c44a72'); } });

// ---------------- Bienvenida con Ale ----------------
const isNew = () => !(S.tx || []).some(t => !t.example);
function welcome() {
  if (document.getElementById('wl')) return;
  let step = 0; const name0 = S.settings.name || '';
  const slides = () => [
    `<div class="wl-art">${ale(6)}</div><h2>¡Hola! Soy Ale</h2><p>Te voy a ayudar a cuidar tu dinerito. Y mientras tanto, cuidamos juntas a una mascota.</p><label class="f wl-name">¿Cómo te llamo?<input class="in" id="wlName" maxlength="30" value="${esc(name0)}" placeholder="Tu nombre" autocomplete="given-name"></label>`,
    `<h2>Así funciona Bolsillito</h2><div class="wl-cards">
<div class="wl-card"><span class="wl-ic" style="background:#ffe3ec">${A.iconHTML(A.pageIcon('add'), 34)}</span><span><b>Anota en dos toques</b><br>Cada gasto con el botón Anotar. Funciona aunque no tengas internet.</span></div>
<div class="wl-card"><span class="wl-ic" style="background:#e3f3df">${img('heart', 30)}</span><span><b>Tu mascota crece contigo</b><br>Cuando cuidas tu dinero, ella está feliz. Báñala, aliméntala y decora su cuarto.</span></div>
<div class="wl-card"><span class="wl-ic" style="background:#efe6fb">${img('casita', 32)}</span><span><b>Con tus amigas</b><br>Visita sus cuartos y déjales regalitos en su cajita. Nunca ven tus cuentas.</span></div></div>`,
    `<div class="wl-art small">${ale(5)}</div><h2>Te dejé unos ejemplos</h2><p>Lo que ves en Inicio son datos de ejemplo para que veas cómo luce todo. Los borras cuando quieras.</p><p>Te preparé unos <b>primeros pasitos</b>: cada uno te da estrellitas para la Tiendita.</p>`
  ];
  const ov = document.createElement('div'); ov.id = 'wl'; ov.className = 'wl'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Bienvenida');
  const paint = () => {
    const sl = slides(); const last = step === sl.length - 1;
    ov.innerHTML = `<div class="wl-in"><button class="wl-skip" data-wl="skip">Saltar</button><div class="wl-slide" key="${step}">${sl[step]}</div>
<div class="wl-dots">${sl.map((_, i) => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</div>
<div class="wl-btns">${step ? '<button class="btn" data-wl="back">Atrás</button>' : ''}<button class="btn pink" data-wl="${last ? 'done' : 'next'}">${last ? '¡Empezar!' : 'Siguiente'}</button></div></div>`;
  };
  const keepName = () => { const n = $('#wlName', ov); if (n && n.value.trim()) { S.settings.name = n.value.trim().slice(0, 30); } };
  const finish = tour => { keepName(); S.settings.welcomed = 1; if (tour) { S.settings.tour = Object.assign({ on: 1, paid: [] }, S.settings.tour || {}, { on: 1, hide: 0 }); } A.saveSettings(); ov.classList.add('out'); setTimeout(() => ov.remove(), 300); A.render(); };
  ov.addEventListener('click', e => {
    const b = e.target.closest('[data-wl]'); if (!b) return; const v = b.dataset.wl;
    if (v === 'next') { keepName(); step++; paint(); } if (v === 'back') { step--; paint(); }
    if (v === 'done') finish(true); if (v === 'skip') finish(true);
  });
  paint(); document.body.appendChild(ov);
}
A.welcome = welcome;

// ---------------- Primeros pasitos ----------------
const STEPS = [
  ['anotar', 'Anota tu primer gasto', 'quickadd', () => (S.tx || []).some(t => !t.example), 'add'],
  ['mascota', 'Elige tu mascota', 'go:elegir', () => !!((S.settings.pet || {}).active), 'sp:heart'],
  ['cuarto', 'Decora el cuarto de tu mascota', 'go:rincon', () => !!(S.settings.seen || {}).cuarto, 'sp:casita'],
  ['compras', 'Arma tu primera lista de compras', 'go:compras', () => !!(((Store.get('compras') || {}).lists || []).length || ((S.cp || {}).lists || []).length), 'sp:x_carrito_super'],
  ['avisos', 'Activa los avisos del celular', 'go:recordatorio', () => typeof Notification !== 'undefined' && Notification.permission === 'granted', 'sp:campana'],
  ['amiga', 'Agrega a una amiga', 'go:visitas', () => !!(S.settings.friends || []).length, 'sp:casita'],
  ['ejemplos', 'Borra los datos de ejemplo', 'clearExamples', () => !(S.tx || []).some(t => t.example), 'sp:estrellita']
];
const STEP_STARS = 3, ALL_STARS = 10;
function tourCard() {
  const T = S.settings.tour; if (!T || !T.on || T.hide) return '';
  const done = STEPS.filter(s => s[3]()); const n = done.length, N = STEPS.length;
  // estrellitas por cada pasito cumplido (una sola vez)
  let paid = 0; T.paid = T.paid || [];
  done.forEach(s => { if (!T.paid.includes(s[0])) { T.paid.push(s[0]); paid += STEP_STARS; } });
  if (n === N && !T.paid.includes('todo')) { T.paid.push('todo'); paid += ALL_STARS; }
  if (paid && A.giveStars) { A.giveStars(paid); A.saveSettings(); setTimeout(() => toast(n === N ? `¡Completaste tus primeros pasitos! +${paid} estrellitas` : `¡Pasito cumplido! +${paid} estrellitas`), 300); }
  if (n === N) return `<div class="card tour-card done"><span class="tour-ale">${ale(3)}</span><span class="tour-tx"><b>¡Lo lograste!</b><span class="faint">Ya conoces lo más importante de Bolsillito.</span></span><button class="btn sm pink" data-act="tourHide">Lindo</button></div>`;
  const ic = s => s[4].startsWith('sp:') ? (Pix.has(s[4].slice(3)) ? img(s[4].slice(3), 22) : img('estrellita', 22)) : A.iconHTML(A.pageIcon(s[4]), 22);
  return `<div class="card tour-card"><div class="tour-h"><span class="tour-ale">${ale(3)}</span><span class="tour-tx"><b>Primeros pasitos</b><span class="faint">${n} de ${N} · cada uno te da ${STEP_STARS} estrellitas</span></span><button class="iconbtn sm" data-act="tourHide" aria-label="Ocultar los primeros pasitos">✕</button></div>
<span class="cp-bar tour-bar"><i style="width:${Math.round(n / N * 100)}%"></i></span>
<div class="tour-list">${STEPS.map(s => { const ok = s[3](); const [kind, arg] = s[2].split(':'); const at = kind === 'go' ? `data-go="${arg}"` : `data-act="${kind}"`; return `<button class="tour-step ${ok ? 'ok' : ''}" ${ok ? 'disabled' : at}><span class="tour-chk">${ok ? '✓' : ''}</span>${ic(s)}<span>${esc(s[1])}</span>${ok ? '' : '<span class="qs-chev">›</span>'}</button>`; }).join('')}</div></div>`;
}
ACT.tourHide = () => { const T = S.settings.tour = S.settings.tour || {}; T.hide = 1; A.saveSettings(); A.render(); };
ACT.tourOpen = () => { S.settings.tour = Object.assign({ paid: [] }, S.settings.tour || {}, { on: 1, hide: 0 }); A.saveSettings(); S.qs = ''; A.go('home'); };
const afterHome0 = A.after.home;
A.after.home = el => {
  if (afterHome0) afterHome0(el);
  const h = tourCard(); if (!h) return;
  const bn = el.querySelector(':scope > .banner');
  if (bn) bn.insertAdjacentHTML('afterend', h); else el.insertAdjacentHTML('afterbegin', h);
};
// recordar las secciones visitadas (para el pasito del cuarto)
const markSeen = k => { if (S.settings && !(S.settings.seen || {})[k]) { S.settings.seen = Object.assign({}, S.settings.seen, { [k]: 1 }); A.saveSettings(); } };
['rincon', 'cuarto'].forEach(r => { const f0 = A.after[r]; A.after[r] = el => { if (f0) f0(el); if (r === 'cuarto' || S.pcTab === 'cuarto') markSeen('cuarto'); }; });

// ---------------- Arranque: volver a donde estabas, abrir la cajita desde el aviso, bienvenida ----------------
function openFromUrl(u) {
  if (/cajita=1/.test(u)) { if (A.openCajita) A.openCajita(); else A.go('visitas'); return true; }
  if (/visitas=1/.test(u)) { A.go('visitas'); return true; }
  return false;
}
const st0 = A.start;
A.start = async () => {
  await st0();
  try { const r = sessionStorage.getItem('bolsillito:route'); if (r) { sessionStorage.removeItem('bolsillito:route'); if (r !== S.route && !['compra', 'acctd'].includes(r)) A.go(r); } } catch (e) {}
  if (openFromUrl(location.search)) { try { history.replaceState(history.state, '', location.pathname); } catch (e) {} }
  if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('message', e => { const u = e.data && e.data.abrir; if (u) openFromUrl(u); });
  // quien ya usa la app no ve la bienvenida
  if (!S.settings.welcomed) {
    if (isNew()) setTimeout(welcome, 700);
    else { S.settings.welcomed = 1; A.saveSettings(); }
  }
  // al volver a la app, refrescar lo de "todo guardado" si estás en Más
  addEventListener('online', () => { if (S.route === 'more') setTimeout(A.render, 3000); });
};
})();
