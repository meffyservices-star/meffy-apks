// ================= Amigos: solicitudes, última vez en línea y todo lo que se puede hacer juntas =================
(function () {
const A = App, S = A.S, { $, esc, toast, iconHTML } = A;
const sc = A.screens, ACT = A.ACTIONS;
const spr = (n, sc2) => Pix.sprite(n, sc2 || 3);
const img = (n, size) => `<img class="pixel" alt="" src="${spr(Pix.has(n) ? n : 'estrellita', 3)}" style="width:${size}px;height:auto">`;
const online = () => Store.mode === 'supa' && Store.sb && navigator.onLine !== false;
const FR = { list: [], loaded: false, loading: false, at: 0, code: '', found: null, busy: false };
A.PAGES.amigos = 'Amistades';
Object.values(A.PACKS || {}).forEach(p => { if (p.map && !p.map.amigos) p.map.amigos = 's:gochi'; if (p.map && !p.map.visitas) p.map.visitas = 's:casita'; });
const LEG = { map: {}, tried: false };
A.friendUsers = () => {
  const out = FR.list.filter(r => r.status === 'accepted').map(r => r.from_user === Store.uid ? { id: r.to_user, name: (r.to_name || '').trim() || 'Amistad' } : { id: r.from_user, name: (r.from_name || '').trim() || 'Amistad' });
  const have = new Set(out.map(o => o.id));
  (S.settings.friends || []).forEach(f => { const u = LEG.map[f.code]; if (u && !have.has(u) && u !== Store.uid) { have.add(u); out.push({ id: u, name: (f.name || '').trim() || 'Amistad' }); } });
  return out;
};
// amistades viejas (agregadas solo con código): buscamos su usuario por el código de su cuarto
async function resolveLegacy() {
  const codes = (S.settings.friends || []).map(f => f.code).filter(c => c && !LEG.map[c]); if (!codes.length || !online()) return;
  try { const { data } = await Store.sb.from('rooms').select('user_id, code').in('code', codes); (data || []).forEach(r => { LEG.map[r.code] = r.user_id; }); } catch (e) { console.warn(e); }
}
A.friendsLoaded = () => FR.loaded;
A.loadFriendReqs = () => loadReqs();
A.friendPending = () => FR.list.filter(r => r.status === 'pending' && r.to_user === Store.uid).length;

// ---- fechas con día y hora ----
function when(iso) {
  if (!iso) return '';
  const d = new Date(iso), n = new Date(); if (isNaN(d)) return '';
  const hm = d.toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit' });
  const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(n) - day(d)) / 864e5);
  if (diff <= 0) return 'hoy ' + hm; if (diff === 1) return 'ayer ' + hm;
  if (diff < 7) return d.toLocaleDateString('es', { weekday: 'long' }) + ' ' + hm;
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' }) + ' ' + hm;
}
A.whenFull = when;
function seen(iso) {
  if (!iso) return 'Aún no ha entrado desde la actualización';
  const m = (Date.now() - new Date(iso)) / 60000;
  return m < 5 ? 'En línea ahora' : m < 60 ? 'Estuvo hace ' + Math.round(m) + ' min' : 'Última vez: ' + when(iso);
}

// ---- cargar solicitudes y sincronizar la lista de amistades ----
async function loadReqs() {
  if (!online() || FR.loading) return; FR.loading = true;
  try {
    const { data, error } = await Store.sb.from('friend_requests').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    FR.list = data || []; syncFriends(); await resolveLegacy(); FR.loaded = true; FR.at = Date.now();
  } catch (e) { console.warn(e); } finally { FR.loading = false; }
  try { A.renderNav(); } catch (e) {}
}
function syncFriends() {
  const me = Store.uid, fr = S.settings.friends = S.settings.friends || []; let ch = false;
  const ids = new Set();
  FR.list.filter(r => r.status === 'accepted').forEach(r => {
    const mine = r.from_user === me; const code = mine ? r.to_code : r.from_code, name = mine ? r.to_name : r.from_name;
    ids.add(r.id);
    const f = fr.find(x => x.code === code);
    if (!f) { fr.push({ code, name, rid: r.id }); ch = true; } else if (f.rid !== r.id) { f.rid = r.id; ch = true; }
  });
  // si la otra persona te quitó, se va de tu lista (las amistades viejas, sin solicitud, se quedan)
  for (let i = fr.length - 1; i >= 0; i--) if (fr[i].rid && !ids.has(fr[i].rid)) { fr.splice(i, 1); ch = true; }
  if (ch) A.saveSettings();
}
function refresh(force) {
  if (!online()) return;
  if (force || !FR.loaded || Date.now() - FR.at > 45000) loadReqs().then(() => { if (S.route === 'amigos') A.render(); });
  if (A.refreshVisits && (force || !A.V.done)) A.refreshVisits(!!force);
}

// ---- la pantalla ----
const FEATS = [
  ['casita', 'Visitar su cuarto', 'Mira cómo decoró su cuarto, su mascota y su jardín. Nunca ves sus cuentas ni sus gastos.', 'visitas'],
  ['regalo_cerrado', 'Cajita de regalos', 'Déjale estrellitas, comida o cositas lindas. Quien lo recibe lo abre y te da las gracias.', 'visitas'],
  ['pg_carta', 'Cartas', 'Escríbele una carta en papel bonito con sello y pegatinas especiales.', 'visitas'],
  ['book', 'Libro de visitas', 'Firma en su libro y mira quién firmó el tuyo.', 'visitas'],
  ['cupcake', 'Cuidar su mascota', 'Dale de comer, juega con ella y riega su jardín. Eso la ayuda y te da estrellitas a ti.', 'visitas'],
  ['heart', 'Corazones', 'Regala un corazón al cuarto que más te guste.', 'visitas'],
  ['book', 'Páginas de journal compartidas', 'Escribe una página junto a una amistad y las dos la ven.', 'compartidas'],
  ['x_carrito_super', 'Lista de compras compartida', 'Armen juntas el súper o repartan gastos. Lo que una marca, la otra lo ve al instante.', 'compras'],
  ['trofeo', 'Carreritas', 'Compite con las mascotas de tus amistades en los minijuegos.', 'juegos']
];
const IDEAS = ['Meta de ahorro en pareja o en grupo (alcancía compartida)', 'Dividir una cuenta (salida, cumpleaños) y saber quién debe a quién', 'Intercambio de pegatinas y mascotas repetidas', 'Tablero de las más constantes del mes'];

function reqCard(r) {
  const me = Store.uid;
  if (r.status === 'pending' && r.to_user === me) return `<div class="li"><span class="ic">${img('casita', 30)}</span><span class="tx-main"><b>${esc(r.from_name || 'Alguien')}</b><span>Quiere ser tu amistad · ${esc(when(r.created_at))}</span></span><span class="row" style="gap:6px"><button class="btn sm pink" data-act="frYes" data-id="${r.id}">Aceptar</button><button class="btn sm" data-act="frNo" data-id="${r.id}">Ahora no</button></span></div>`;
  if (r.status === 'pending') return `<div class="li"><span class="ic">${img('casita', 30)}</span><span class="tx-main"><b>${esc(r.to_name || r.to_code)}</b><span>Esperando respuesta · ${esc(when(r.created_at))}</span></span><button class="btn sm" data-act="frCancel" data-id="${r.id}">Cancelar</button></div>`;
  return '';
}

sc.amigos = () => {
  const me = Store.uid, friends = S.settings.friends || [], V = A.V || {};
  if (!online()) return `${A.subHeader('amigos', 'more')}<div class="card empty"><p>Las amistades necesitan internet y tu cuenta de Bolsillito. Cuando tengas conexión podrás agregar amistades y ver sus solicitudes.</p></div>`;
  refresh();
  const inc = FR.list.filter(r => r.status === 'pending' && r.to_user === me), out = FR.list.filter(r => r.status === 'pending' && r.from_user === me);
  const declined = FR.list.filter(r => r.status === 'declined' && r.from_user === me && !r.seen);
  const code = S.settings.visitCode || '…';
  // actividad reciente de amistades hacia mí
  const act = [];
  (V.events || []).filter(e => e.to_user === me && e.from_user !== me).forEach(e => { const t = { feed: 'le dio de comer a tu mascota', water: 'regó tu jardín', play: 'jugó con tu mascota', letter: 'te mandó una carta', sign: 'firmó tu libro de visitas' }[e.kind]; if (t) act.push({ at: e.created_at, n: e.from_name, t }); });
  (V.gifts || []).filter(g => g.to_user === me && g.from_user !== me).forEach(g => act.push({ at: g.created_at, n: g.from_name, t: g.kind === 'thanks' ? 'te dio las gracias' : 'te dejó algo en la cajita' }));
  (V.inbox || []).filter(n => n.to_user === me && n.kind === 'heart').forEach(n => act.push({ at: n.created_at, n: n.from_name, t: 'le dio un corazón a tu cuarto' }));
  act.sort((a, b) => (a.at < b.at ? 1 : -1));
  const f = FR.found;
  return `${A.subHeader('amigos', 'more')}
<div class="card stack"><b>Tu código</b><div class="row between"><span class="vs-code">${esc(code)}</span><span class="row" style="gap:6px"><button class="btn sm" data-act="vsCopy">Copiar</button><button class="btn sm pink" data-act="frShare">Compartir</button></span></div><span class="faint">Pásaselo a tu amistad: ella te manda una solicitud y tú aceptas. Ya no hace falta que las dos pongan el código.</span></div>
<div class="card stack"><b>Agregar a una amistad</b>
<div class="row" style="gap:8px"><input class="in" id="frCode" value="${esc(FR.code)}" placeholder="BOLSI-1234" inputmode="text" autocomplete="off" style="text-transform:uppercase"><button class="btn" data-act="frFind" ${FR.busy ? 'disabled' : ''}>Buscar</button></div>
${f ? (f.err ? `<span class="faint">${esc(f.err)}</span>` : `<div class="li" style="margin:0"><span class="ic">${f.pet && A.petInfo ? `<img class="pixel" alt="" src="${spr(A.petInfo(f.pet).sprite, 3)}" style="width:40px">` : img('casita', 30)}</span><span class="tx-main"><b>${esc(f.name)}</b><span>${esc(f.code)} · le llegará tu solicitud</span></span><button class="btn sm pink" data-act="frSend" ${FR.busy ? 'disabled' : ''}>Enviar solicitud</button></div>`) : ''}
</div>
${typeof Notification !== 'undefined' && Notification.permission !== 'granted' ? `<button class="card row" data-go="recordatorio" style="gap:12px;text-align:left;width:100%;color:inherit;font:inherit;cursor:pointer">${img('campana', 28)}<span><b>Activa los avisos del celular</b><br><span class="faint">Así te llega al instante cuando una amistad te manda una solicitud o un regalo.</span></span></button>` : ''}
${inc.length ? `<div class="k-lbl">SOLICITUDES PARA TI · ${inc.length}</div><div class="list">${inc.map(reqCard).join('')}</div>` : ''}
${out.length ? `<div class="k-lbl">SOLICITUDES ENVIADAS</div><div class="list">${out.map(reqCard).join('')}</div>` : ''}
${declined.length ? `<div class="card faint">${declined.map(r => esc(r.to_name || 'Una persona')).join(', ')} no pudo aceptar por ahora. Puedes intentarlo de nuevo en una semana.</div>` : ''}
<div class="k-lbl">TUS AMISTADES · ${friends.length}</div>
<div class="list vs-list">${friends.map(fr => { const r = (V.cache || {})[fr.code]; return `<div class="li"><span class="ic" style="width:44px;height:44px">${r && r.body && r.body.active && A.petInfo ? `<img class="pixel" alt="" src="${spr(A.petInfo(r.body.active).sprite, 3)}" style="width:40px">` : img('casita', 30)}</span><span class="tx-main"><b>${esc(fr.name || fr.code)}</b><span>${r ? esc(seen(r.last_seen)) : 'Cargando…'}</span></span><span class="row" style="gap:6px"><button class="btn sm pink" data-act="vsGo" data-c="${esc(fr.code)}" ${r ? '' : 'disabled'}>Visitar</button><button class="btn sm" data-act="frDel" data-c="${esc(fr.code)}" aria-label="Quitar amistad">✕</button></span></div>`; }).join('') || '<div class="card empty">Todavía no tienes amistades aquí. Pídele su código a una amistad y mándale una solicitud.</div>'}</div>
${act.length ? `<div class="k-lbl">LO ÚLTIMO DE TUS AMISTADES</div><div class="list">${act.slice(0, 8).map(a => `<div class="li"><span class="tx-main"><b>${esc(a.n || 'Alguien')}</b><span>${esc(a.t)} · ${esc(when(a.at))}</span></span></div>`).join('')}</div>` : ''}
<div class="k-lbl">¿QUÉ PUEDES HACER CON TUS AMISTADES?</div>
<div class="list">${FEATS.map(x => `<button class="li" data-go="${x[3]}" style="text-align:left;width:100%;color:inherit;font:inherit;cursor:pointer"><span class="ic">${img(x[0], 26)}</span><span class="tx-main"><b>${esc(x[1])}</b><span>${esc(x[2])}</span></span><span class="qs-chev">›</span></button>`).join('')}</div>
<details class="card"><summary><b>Ideas que vienen pronto</b></summary><ul class="faint" style="margin:8px 0 0;padding-left:18px">${IDEAS.map(i => `<li>${esc(i)}</li>`).join('')}</ul></details>
<label class="card row between" style="gap:12px"><span><b>Mostrar cuándo estuve en línea</b><br><span class="faint">Tus amistades ven el día y la hora de tu última entrada.</span></span><input type="checkbox" data-act="frSeen" ${S.settings.hideSeen ? '' : 'checked'} style="width:22px;height:22px"></label>`;
};

// ---- acciones ----
ACT.frFind = async () => {
  const inp = $('#frCode'); const v = ((inp && inp.value) || '').trim().toUpperCase().replace(/\s/g, ''); const c = /^\d{4}$/.test(v) ? 'BOLSI-' + v : v;
  FR.code = c;
  if (!/^BOLSI-\d{4}$/.test(c)) { FR.found = { err: 'El código es así: BOLSI-1234' }; return A.render(); }
  if (c === S.settings.visitCode) { FR.found = { err: 'Ese es tu propio código.' }; return A.render(); }
  if ((S.settings.friends || []).some(x => x.code === c)) { FR.found = { err: 'Ya está en tus amistades.' }; return A.render(); }
  FR.busy = true; A.render();
  try { const r = await A.fetchRoom(c); FR.found = r ? { code: r.code, name: r.name, pet: r.body && r.body.active } : { err: 'No encontramos ese código. Revisa que esté bien escrito.' }; }
  catch (e) { FR.found = { err: 'No se pudo buscar. Revisa tu conexión.' }; }
  FR.busy = false; A.render();
};
const ERR = { sin_cuarto: 'Primero abre Visitas una vez para crear tu código.', no_existe: 'No encontramos ese código.', es_mi_codigo: 'Ese es tu propio código.', espera: 'Te dijeron que ahora no. Intenta de nuevo en una semana.', demasiadas: 'Tienes muchas solicitudes pendientes. Espera a que respondan.', sin_sesion: 'Inicia sesión otra vez.' };
ACT.frSend = async () => {
  if (!FR.found || FR.found.err || FR.busy) return; FR.busy = true; A.render();
  try {
    if (A.publishRoom) await A.publishRoom();
    const { data, error } = await Store.sb.rpc('send_friend_request', { p_code: FR.found.code }); if (error) throw error;
    if (!data.ok) toast(ERR[data.error] || 'No se pudo enviar');
    else { toast(data.result === 'aceptada' || data.result === 'ya_son_amigas' ? `¡${data.name} y tú ya son amistades!` : data.result === 'ya_enviada' ? 'Ya le habías enviado una solicitud' : `Solicitud enviada a ${data.name}`); FR.found = null; FR.code = ''; }
  } catch (e) { toast('No se pudo enviar. Revisa tu conexión.'); }
  FR.busy = false; await loadReqs(); A.render();
};
async function answer(id, ok) {
  try {
    const { data, error } = await Store.sb.rpc('respond_friend_request', { p_id: id, p_accept: ok }); if (error) throw error;
    if (!data.ok) toast('Esa solicitud ya no está'); else toast(ok ? `¡${data.from_name} ahora está en tus amistades!` : 'Listo, no se lo diremos');
  } catch (e) { toast('No se pudo. Revisa tu conexión.'); }
  await loadReqs(); if (A.refreshVisits) A.refreshVisits(true); A.render();
}
ACT.frYes = a => answer(Number(a.dataset.id), true);
ACT.frNo = a => answer(Number(a.dataset.id), false);
ACT.frCancel = async a => { await Store.sb.from('friend_requests').delete().eq('id', Number(a.dataset.id)); await loadReqs(); A.render(); };
ACT.frDel = async a => {
  const c = a.dataset.c, fr = S.settings.friends || [], f = fr.find(x => x.code === c); if (!f) return;
  if (!confirm(`¿Quitar a ${f.name || c} de tus amistades? Tendrías que mandar otra solicitud para volver a verla.`)) return;
  if (f.rid) { await Store.sb.from('friend_requests').delete().eq('id', f.rid); }
  S.settings.friends = fr.filter(x => x.code !== c); A.saveSettings(); await loadReqs(); A.render();
};
ACT.frShare = () => {
  const c = S.settings.visitCode; if (!c) return;
  const text = `Agrégame en Bolsillito. Mi código es ${c}`;
  if (navigator.share) navigator.share({ text }).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('Mensaje copiado')).catch(() => toast(c)); else toast(c);
};
ACT.frSeen = a => { S.settings.hideSeen = !a.checked; A.saveSettings(); if (!S.settings.hideSeen && A.publishRoom) A.publishRoom(); toast(S.settings.hideSeen ? 'Tus amistades ya no ven tu última vez en línea' : 'Tus amistades verán tu última vez en línea'); };

// ---- al arrancar: marcar "última vez", ver solicitudes, abrir desde el aviso ----
const st0 = A.start;
let lastPub = 0;
const pubSeen = () => { if (!online() || !S.settings.visitCode || S.settings.hideSeen || Date.now() - lastPub < 5 * 60000) return; lastPub = Date.now(); if (A.publishRoom) A.publishRoom().catch(() => {}); };
A.start = async () => {
  await st0();
  setTimeout(() => {
    pubSeen();
    loadReqs().then(() => {
      const n = A.friendPending(); if (n) { const first = FR.list.find(r => r.status === 'pending' && r.to_user === Store.uid); toast(n === 1 ? `${first.from_name} quiere conectar contigo` : `${n} amistades quieren conectar contigo`); }
      const ok = FR.list.filter(r => r.status === 'accepted' && r.from_user === Store.uid && !r.seen);
      if (ok.length) { toast(`${ok[0].to_name} aceptó tu solicitud`); Store.sb.rpc('ack_friend_requests').then(() => {}, () => {}); }
      if (S.route === 'amigos') A.render();
    });
  }, 2500);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pubSeen(); });
  if (/amigos=1/.test(location.search)) { A.go('amigos'); try { history.replaceState(history.state, '', location.pathname); } catch (e) {} }
  if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('message', e => { const u = e.data && e.data.abrir; if (u && /amigos=1/.test(u)) A.go('amigos'); });
};
})();
