// ================= Hacer cosas entre amistades: Tarrito compartido y Cuentas =================
(function () {
const A = App, S = A.S, { $, $$, esc, money, toast, openSheet, closeSheet } = A;
const sc = A.screens, ACT = A.ACTIONS;
const spr = (n, k) => Pix.sprite(n, k || 3);
const px = (n, w) => `<img class="pixel" alt="" src="${spr(Pix.has(n) ? n : 'estrellita', 4)}" style="width:${w}px;height:auto">`;
A.PAGES.tarrito = 'Tarrito compartido'; A.PAGES.cuentas = 'Cuentas entre amistades'; ;
const online = () => Store.mode === 'supa' && Store.sb && navigator.onLine !== false && !!Store.uid;
const me = () => (S.settings.name || '').trim() || 'Yo';
const friends = () => (A.friendUsers ? A.friendUsers() : []);
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };
const initials = n => (String(n).trim()[0] || '?').toUpperCase();
const COLORS = ['#f27ea1', '#7fb7e8', '#8fcf9f', '#f2b45e', '#b79ae8', '#f09a7a'];
const colorOf = id => { let h = 0; String(id).split('').forEach(c => h = (h * 31 + c.charCodeAt(0)) >>> 0); return COLORS[h % COLORS.length]; };
const PR = {};
const dot = (id, name, sz) => { const p = PR[id] && PR[id].photo, st = sz ? 'width:' + sz + 'px;height:' + sz + 'px;' : ''; return p ? `<img class="jt-dot jt-ph" alt="${esc(name)}" title="${esc(name)}" src="${esc(p)}" style="${st}">` : `<span class="jt-dot" style="background:${colorOf(id)};${st}" title="${esc(name)}">${esc(initials(name))}</span>`; };
let pubDone = false;
async function profiles(ids) {
  if (!online()) return;
  try {
    if (!pubDone) { pubDone = true; await Store.sb.from('profiles_pub').upsert({ user_id: Store.uid, name: me(), photo: S.settings.photo || null, updated_at: new Date().toISOString() }); }
    const need = [...new Set(ids)].filter(x => x && !PR[x] && x !== Store.uid); if (S.settings.photo) PR[Store.uid] = { photo: S.settings.photo };
    if (!need.length) return; const { data } = await Store.sb.from('profiles_pub').select('user_id,photo').in('user_id', need);
    let ch = false; (data || []).forEach(r => { if (r.photo) { PR[r.user_id] = { photo: r.photo }; ch = true; } else PR[r.user_id] = { photo: null }; });
    if (ch && ['tarrito', 'cuentas'].includes(S.route)) A.render();
  } catch (e) { console.warn(e); }
}
const offline = () => `<div class="card jt-off">${px('nube', 28)}<div><b>Necesitas conexión y tu cuenta</b><div class="faint">Esto se comparte con tus amistades, así que se guarda en la nube. Entra con tu cuenta y vuelve a intentar.</div></div></div>`;
const noFriends = () => `<div class="card jt-off">${px('gochi', 28)}<div><b>Primero agrega a una amistad</b><div class="faint">Cuando alguien acepte tu solicitud, podrán hacer esto juntas. Ve a Amistades para agregarla.</div></div><button class="btn sm pink" data-go="amigos">Amistades</button></div>`;
const ensureFriends = () => { if (online() && A.friendsLoaded && !A.friendsLoaded() && A.loadFriendReqs) A.loadFriendReqs().then(() => A.render()); };
const pickChips = (sel, attr) => friends().length ? `<div class="chips jt-pick">${friends().map(f => `<button type="button" class="chip" data-${attr}="${f.id}" aria-pressed="${sel.has(f.id)}">${esc(f.name)}</button>`).join('')}</div>` : '<div class="faint">Aún no tienes amistades agregadas.</div>';
const togglePick = (sh, attr, set, e) => { const b = e.target.closest(`[data-${attr}]`); if (!b) return false; const id = b.dataset[attr]; set.has(id) ? set.delete(id) : set.add(id); b.setAttribute('aria-pressed', set.has(id)); return true; };
A.ensureFriendRows = async ids => { try { if (ids.length) await Store.sb.from('legacy_friends').upsert(ids.map(f => ({ friend_id: f })), { onConflict: 'user_id,friend_id', ignoreDuplicates: true }); } catch (e) { console.warn(e); } };
const nameOfFriend = id => (friends().find(f => f.id === id) || {}).name || 'Amistad';
const fmtDay = d => { const x = A.parseYmd ? A.parseYmd(d) : new Date(d); return x.toLocaleDateString('es', { day: 'numeric', month: 'short' }); };
const H = (key) => A.header(key);

// ============================== TARRITO ==============================
const J = { jars: [], members: {}, deps: {}, loaded: false, loading: false, open: null };
async function loadJars() {
  if (!online() || J.loading) return; J.loading = true;
  try {
    const [a, b, c] = await Promise.all([Store.sb.from('jars').select('*').order('created_at', { ascending: false }), Store.sb.from('jar_members').select('*'), Store.sb.from('jar_deposits').select('*').order('created_at', { ascending: false }).limit(600)]);
    if (a.error) throw a.error; J.jars = a.data || []; J.members = {}; J.deps = {};
    (b.data || []).forEach(m => (J.members[m.jar_id] = J.members[m.jar_id] || []).push(m)); (c.data || []).forEach(d => (J.deps[d.jar_id] = J.deps[d.jar_id] || []).push(d)); J.loaded = true; profiles(Object.values(J.members).flat().map(m => m.user_id)); profiles(Object.values(J.members).flat().map(m => m.user_id));
  } catch (e) { console.warn(e); toast('No pude cargar tus tarritos. Revisa tu conexión.'); } finally { J.loading = false; }
  if (S.route === 'tarrito') A.render();
}
const jarTotal = id => (J.deps[id] || []).reduce((s, d) => s + (+d.amount || 0), 0);
const JT = [['#fff0c9', '#ffd36b'], ['#ffe3ee', '#ff9fc0'], ['#e3f1ff', '#8ec5ff'], ['#e7f7e4', '#9ad7a0'], ['#efe6ff', '#c3a6f5']];
const jtOf = id => { let h = 0; String(id).split('').forEach(c => h = (h * 31 + c.charCodeAt(0)) >>> 0); return JT[h % JT.length]; };
function jarSVG(p, id, big) {
  const [bg, fill] = jtOf(id), cid = 'jc' + String(id).replace(/\W/g, '').slice(0, 8) + (big ? 'b' : ''), y = 116 - (Math.max(p, 4) / 100) * 78;
  let coins = ''; const n = Math.round(p / 7); for (let k = 0; k < n; k++) { const cx = 20 + ((k * 37) % 60), cy = 112 - Math.floor(k / 4) * 9 - (k % 2) * 3; if (cy > y + 4) coins += `<circle cx="${cx}" cy="${cy}" r="6" fill="#ffe28a" stroke="#c9902e" stroke-width="1.6"/><path d="M${cx - 2} ${cy - 2} h4" stroke="#fff8d6" stroke-width="1.6" stroke-linecap="round"/>`; }
  const spark = p >= 100 ? '<path d="M8 22l2 5 5 2-5 2-2 5-2-5-5-2 5-2z M92 14l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#ffd36b" stroke="#c9902e" stroke-width="1"/>' : '';
  return `<svg class="jr-svg${big ? ' big' : ''}" viewBox="0 0 100 124" role="img" aria-label="Tarrito al ${p}%"><defs><clipPath id="${cid}"><path d="M22 34 Q10 40 10 58 L10 100 Q10 116 26 116 L74 116 Q90 116 90 100 L90 58 Q90 40 78 34 Z"/></clipPath></defs>
<path d="M22 34 Q10 40 10 58 L10 100 Q10 116 26 116 L74 116 Q90 116 90 100 L90 58 Q90 40 78 34 Z" fill="rgba(255,255,255,.55)"/>
<g clip-path="url(#${cid})"><rect x="0" y="${y}" width="100" height="124" fill="${fill}"/><path d="M0 ${y} q12 -7 25 0 t25 0 t25 0 t25 0 V${y + 10} H0z" fill="${fill}"/><path d="M0 ${y + 2} q12 -7 25 0 t25 0 t25 0 t25 0" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2"/>${coins}</g>
<path d="M22 34 Q10 40 10 58 L10 100 Q10 116 26 116 L74 116 Q90 116 90 100 L90 58 Q90 40 78 34 Z" fill="none" stroke="#7a5468" stroke-width="3" stroke-linejoin="round"/>
<path d="M17 62 v28" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/><path d="M17 96 v3" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>
<rect x="24" y="24" width="52" height="12" rx="5" fill="#fff7fb" stroke="#7a5468" stroke-width="3"/>
<rect x="18" y="6" width="64" height="20" rx="8" fill="#f6a5be" stroke="#7a5468" stroke-width="3"/><path d="M50 21 l-6 -6 a3.6 3.6 0 0 1 6 -4 a3.6 3.6 0 0 1 6 4z" fill="#fff" stroke="#7a5468" stroke-width="1.4" stroke-linejoin="round"/>${spark}</svg>`;
}
const avs = (ms, sz) => `<span class="jt-ppl ov">${ms.slice(0, 6).map(m => dot(m.user_id, m.name, sz || 26)).join('')}${ms.length > 6 ? `<span class="jt-dot more" style="width:${sz || 26}px;height:${sz || 26}px">+${ms.length - 6}</span>` : ''}</span>`;
sc.tarrito = () => {
  if (!online()) return H('tarrito') + offline();
  ensureFriends(); if (!J.loaded && !J.loading) loadJars();
  return `${H('tarrito')}
<div class="jt-hero"><div class="jt-hero-jar">${jarSVG(62, 'hero')}</div><div><b>Tarritos compartidos</b><span>Ahorren juntas para eso que sueñan: un viaje, un regalo, el depa. Cada moneda cuenta ✦</span></div></div>
<button class="btn pink jt-new" data-act="jarNew">+ Nuevo tarrito</button>
${!J.loaded ? '<div class="faint" style="text-align:center;padding:16px">Cargando tus tarritos…</div>' : J.jars.length ? '<div class="jt-shelf">' + J.jars.map(jarCard).join('') + '</div>' : '<div class="an-empty">' + jarSVG(0, 'vacio', true) + '<b>Tu repisa está vacía</b><span>Crea tu primer tarrito, elige con quién y pongan una meta bonita.</span></div>'}`;
};
function jarCard(j) {
  const t = jarTotal(j.id), p = Math.min(100, Math.round(t / j.goal * 100)), ms = J.members[j.id] || [], [bg] = jtOf(j.id);
  return `<button class="jt-jar" data-act="jarOpen" data-id="${j.id}" style="--bg:${bg}"><span class="jt-tag">${esc(j.name)}</span>${jarSVG(p, j.id)}<span class="jt-pct">${p >= 100 ? '¡Meta! ✦' : p + '%'}</span><span class="jt-amt">${money(t)}</span><small>de ${money(j.goal)}</small>${avs(ms, 22)}</button>`;
}
ACT.jarNew = () => {
  if (!friends().length) return toast('Primero agrega a una amistad en Amistades.');
  const sel = new Set(); const d = { name: '', goal: '' };
  openSheet('Nuevo tarrito', `<div class="stack"><label class="f">¿Para qué ahorran?<input class="in" id="jN" maxlength="40" placeholder="Ej. Viaje a la playa, regalo de aniversario"></label><label class="f">¿Cuánto quieren juntar?<input class="in" id="jG" inputmode="decimal" placeholder="Ej. 500"></label><div class="f">¿Con quién?${pickChips(sel, 'jp')}</div><button class="btn pink" id="jOk" style="justify-content:center;padding:12px">Crear tarrito</button></div>`, sh => {
    sh.addEventListener('click', e => togglePick(sh, 'jp', sel, e));
    $('#jOk', sh).onclick = async () => {
      const name = $('#jN', sh).value.trim(), goal = num($('#jG', sh).value);
      if (!name) return toast('Ponle nombre al tarrito'); if (!(goal > 0)) return toast('Escribe cuánto quieren juntar'); if (!sel.size) return toast('Elige al menos a una amistad');
      const b = $('#jOk', sh); b.disabled = true;
      const { data, error } = await Store.sb.from('jars').insert({ name, goal }).select().single();
      if (error) { b.disabled = false; console.warn(error); return toast('No se pudo crear el tarrito.'); }
      const rows = [{ jar_id: data.id, user_id: Store.uid, name: me() }].concat([...sel].map(id => ({ jar_id: data.id, user_id: id, name: nameOfFriend(id) })));
      await A.ensureFriendRows([...sel]); const r = await Store.sb.from('jar_members').insert(rows); if (r.error) { console.warn(r.error); toast('El grupo se creó, pero no pude agregar a todas.'); }
      closeSheet(); toast('¡Tarrito creado!'); J.loaded = false; loadJars();
    };
  });
};
ACT.jarOpen = a => {
  const j = J.jars.find(x => x.id === a.dataset.id); if (!j) return;
  const t = jarTotal(j.id), p = Math.min(100, Math.round(t / j.goal * 100)), ms = J.members[j.id] || [], deps = J.deps[j.id] || [], [bg] = jtOf(j.id);
  const per = ms.map(m => ({ m, sum: deps.filter(d => d.user_id === m.user_id).reduce((s, d) => s + +d.amount, 0) })).sort((x, y) => y.sum - x.sum);
  const mine = j.owner === Store.uid;
  openSheet(j.name, `<div class="stack"><div class="jt-stage" style="--bg:${bg}">${jarSVG(p, j.id, true)}<div class="jt-stage-tx"><div class="an-big" style="font-size:30px">${money(t)}</div><div class="faint">de ${money(j.goal)}</div><div class="jt-bar2"><i style="width:${p}%"></i></div><div class="jt-note">${p >= 100 ? '¡Lo lograron! ✦' : 'Faltan ' + money(Math.max(0, j.goal - t))}</div></div></div>
<button class="btn pink jt-new" id="jDep">Poner una moneda ✦</button>
<div class="an-h" style="margin:6px 4px 0">Quién ha puesto</div><div class="jt-who">${per.map(x => `<div class="jt-wp">${dot(x.m.user_id, x.m.name, 44)}<b>${esc(x.m.name.split(' ')[0])}${x.m.user_id === Store.uid ? ' (tú)' : ''}</b><span class="num">${money(x.sum)}</span><span class="jt-wbar"><i style="width:${t ? Math.round(x.sum / t * 100) : 0}%;background:${colorOf(x.m.user_id)}"></i></span></div>`).join('')}</div>
${deps.length ? `<div class="an-h" style="margin:6px 4px 0">Últimas monedas</div>${deps.slice(0, 15).map(d => `<div class="jt-coin">${dot(d.user_id, d.name, 30)}<span class="tx-main"><b>${esc(d.name)} puso</b><span>${fmtDay(d.created_at.slice(0, 10))}${d.note ? ' · ' + esc(d.note) : ''}</span></span><span class="amt num pos">+${money(d.amount)}</span></div>`).join('')}` : ''}
<button class="btn ghost sm" id="jOut" style="justify-content:center">${mine ? 'Borrar el tarrito' : 'Salir del tarrito'}</button></div>`, sh => {
    $('#jDep', sh).onclick = () => { closeSheet(); setTimeout(() => jarDeposit(j), 80); };
    $('#jOut', sh).onclick = async () => { if (!confirm(mine ? '¿Borrar este tarrito para todas? No se puede deshacer.' : '¿Salir de este tarrito?')) return; const r = mine ? await Store.sb.from('jars').delete().eq('id', j.id) : await Store.sb.from('jar_members').delete().eq('jar_id', j.id).eq('user_id', Store.uid); if (r.error) return toast('No se pudo.'); closeSheet(); J.loaded = false; loadJars(); };
  });
};
function jarDeposit(j) {
  openSheet('Poner dinero', `<div class="stack"><label class="f">¿Cuánto pones?<input class="in" id="dA" inputmode="decimal" placeholder="Ej. 10" autofocus></label><label class="f">Nota (opcional)<input class="in" id="dN" maxlength="60" placeholder="Ej. de mi sueldo"></label><button class="btn pink" id="dOk" style="justify-content:center;padding:12px">Ponerlo ✦</button></div>`, sh => {
    $('#dOk', sh).onclick = async () => {
      const amount = num($('#dA', sh).value); if (!(amount > 0)) return toast('Escribe cuánto pones');
      const b = $('#dOk', sh); b.disabled = true;
      const { error } = await Store.sb.from('jar_deposits').insert({ jar_id: j.id, name: me(), amount, note: $('#dN', sh).value.trim() });
      if (error) { b.disabled = false; console.warn(error); return toast('No se pudo guardar. Revisa tu conexión.'); }
      closeSheet(); toast('¡Listo! Tu tarrito se llenó un poquito más'); if (A.giveStars) { A.giveStars(1); A.saveSettings(); } J.loaded = false; loadJars();
    };
  });
}

// ============================== CUENTAS ==============================
const Q = { groups: [], members: {}, exps: {}, sets: {}, loaded: false, loading: false };
async function loadQ() {
  if (!online() || Q.loading) return; Q.loading = true;
  try {
    const [a, b, c, d] = await Promise.all([Store.sb.from('split_groups').select('*').order('created_at', { ascending: false }), Store.sb.from('split_members').select('*'), Store.sb.from('split_expenses').select('*').order('created_at', { ascending: false }).limit(800), Store.sb.from('split_settlements').select('*').limit(800)]);
    if (a.error) throw a.error; Q.groups = a.data || []; Q.members = {}; Q.exps = {}; Q.sets = {};
    (b.data || []).forEach(m => (Q.members[m.group_id] = Q.members[m.group_id] || []).push(m)); (c.data || []).forEach(x => (Q.exps[x.group_id] = Q.exps[x.group_id] || []).push(x)); (d.data || []).forEach(x => (Q.sets[x.group_id] = Q.sets[x.group_id] || []).push(x)); Q.loaded = true; profiles(Object.values(Q.members).flat().map(m => m.user_id));
  } catch (e) { console.warn(e); toast('No pude cargar tus cuentas. Revisa tu conexión.'); } finally { Q.loading = false; }
  if (S.route === 'cuentas') A.render();
}
function balances(gid) {
  const net = {}; (Q.members[gid] || []).forEach(m => net[m.user_id] = 0);
  (Q.exps[gid] || []).forEach(x => { const P = x.participants && x.participants.length ? x.participants : Object.keys(net); const share = +x.amount / P.length; net[x.paid_by] = (net[x.paid_by] || 0) + +x.amount; P.forEach(u => net[u] = (net[u] || 0) - share); });
  (Q.sets[gid] || []).forEach(s => { net[s.from_user] = (net[s.from_user] || 0) + +s.amount; net[s.to_user] = (net[s.to_user] || 0) - +s.amount; });
  return net;
}
function transfers(net) {
  const cr = Object.entries(net).filter(([, v]) => v > 0.005).map(([u, v]) => [u, v]).sort((a, b) => b[1] - a[1]), de = Object.entries(net).filter(([, v]) => v < -0.005).map(([u, v]) => [u, -v]).sort((a, b) => b[1] - a[1]); const out = [];
  let i = 0, k = 0; while (i < cr.length && k < de.length) { const x = Math.min(cr[i][1], de[k][1]); out.push({ from: de[k][0], to: cr[i][0], amount: Math.round(x * 100) / 100 }); cr[i][1] -= x; de[k][1] -= x; if (cr[i][1] < 0.005) i++; if (de[k][1] < 0.005) k++; }
  return out;
}
const mname = (gid, id) => ((Q.members[gid] || []).find(m => m.user_id === id) || {}).name || 'Alguien';
const gTotal = gid => (Q.exps[gid] || []).reduce((s, x) => s + +x.amount, 0);
sc.cuentas = () => {
  if (!online()) return H('cuentas') + offline();
  ensureFriends(); if (!Q.loaded && !Q.loading) loadQ();
  return `${H('cuentas')}
<div class="jt-hero rc"><div class="jt-hero-jar rcico"><span>$</span></div><div><b>Cuentas entre amistades</b><span>Dividan gastos sin enredos: anotan quién pagó y el recibo les dice quién le debe a quién.</span></div></div>
<button class="btn pink jt-new" data-act="qNew">+ Nuevo grupo</button>
${!Q.loaded ? '<div class="faint" style="text-align:center;padding:16px">Cargando tus grupos…</div>' : Q.groups.length ? Q.groups.map(g => { const net = balances(g.id), my = Math.round((net[Store.uid] || 0) * 100) / 100, ms = Q.members[g.id] || []; return `<button class="rc-mini" data-act="qOpen" data-id="${g.id}"><span class="rc-top"><b>${esc(g.name)}</b><span>${money(gTotal(g.id))}</span></span><span class="rc-dash"></span><span class="rc-row">${avs(ms, 24)}<span class="rc-st ${my > 0.004 ? 'pos' : my < -0.004 ? 'neg' : ''}">${my > 0.004 ? 'Te deben ' + money(my) : my < -0.004 ? 'Debes ' + money(-my) : 'A mano ✓'}</span></span></button>`; }).join('') : '<div class="an-empty"><div class="jt-hero-jar rcico"><span>$</span></div><b>Aún no tienes grupos</b><span>Crea uno para una salida, un viaje o la casa que comparten.</span></div>'}`;
};
ACT.qNew = () => {
  if (!friends().length) return toast('Primero agrega a una amistad en Amistades.');
  const sel = new Set();
  openSheet('Nuevo grupo', `<div class="stack"><label class="f">Nombre del grupo<input class="in" id="qN" maxlength="40" placeholder="Ej. Viaje a Baños, Casa"></label><div class="f">¿Quiénes están?${pickChips(sel, 'qp')}</div><button class="btn pink" id="qOk" style="justify-content:center;padding:12px">Crear grupo</button></div>`, sh => {
    sh.addEventListener('click', e => togglePick(sh, 'qp', sel, e));
    $('#qOk', sh).onclick = async () => {
      const name = $('#qN', sh).value.trim(); if (!name) return toast('Ponle nombre al grupo'); if (!sel.size) return toast('Elige al menos a una amistad');
      const b = $('#qOk', sh); b.disabled = true; const { data, error } = await Store.sb.from('split_groups').insert({ name }).select().single();
      if (error) { b.disabled = false; return toast('No se pudo crear el grupo.'); }
      await A.ensureFriendRows([...sel]); const r = await Store.sb.from('split_members').insert([{ group_id: data.id, user_id: Store.uid, name: me() }].concat([...sel].map(id => ({ group_id: data.id, user_id: id, name: nameOfFriend(id) })))); if (r.error) { console.warn(r.error); toast('El grupo se creó, pero no pude agregar a todas.'); }
      closeSheet(); toast('¡Grupo creado!'); Q.loaded = false; loadQ();
    };
  });
};
ACT.qOpen = a => {
  const g = Q.groups.find(x => x.id === a.dataset.id); if (!g) return; const ms = Q.members[g.id] || [], net = balances(g.id), tr = transfers(net), exps = Q.exps[g.id] || [], mine = g.owner === Store.uid, tot = gTotal(g.id);
  const d0 = new Date().toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
  openSheet(g.name, `<div class="stack"><div class="rc-paper"><div class="rc-head"><span class="rc-star">✦ BOLSILLITO ✦</span><b>${esc(g.name)}</b><small>${d0} · ${ms.length} personas</small></div>
<div class="rc-dash"></div>
${exps.length ? exps.slice(0, 20).map(x => `<div class="rc-line"><span class="rc-who">${dot(x.paid_by, x.paid_name, 20)}</span><span class="rc-n"><b>${esc(x.note || 'Gasto')}</b><small>pagó ${x.paid_by === Store.uid ? 'tú' : esc(x.paid_name)} · ${fmtDay(x.created_at.slice(0, 10))}</small></span><span class="rc-dots"></span><span class="num">${money(x.amount)}</span></div>`).join('') : '<div class="rc-empty">Aún no hay gastos en este recibo</div>'}
<div class="rc-dash"></div>
<div class="rc-line tot"><b>TOTAL</b><span class="rc-dots"></span><b class="num">${money(tot)}</b></div>
<div class="rc-line"><span>Por persona</span><span class="rc-dots"></span><span class="num">${money(ms.length ? tot / ms.length : 0)}</span></div>
<div class="rc-dash"></div>
<div class="rc-sec">CÓMO VAN</div>
${tr.length ? tr.map((t, i) => `<div class="rc-line pay"><span class="rc-who">${dot(t.from, mname(g.id, t.from), 22)}</span><span class="rc-n"><b>${t.from === Store.uid ? 'Tú' : esc(mname(g.id, t.from))} → ${t.to === Store.uid ? 'ti' : esc(mname(g.id, t.to))}</b></span><span class="rc-dots"></span><b class="num ${t.to === Store.uid ? 'pos' : 'neg'}">${money(t.amount)}</b></div>${t.from === Store.uid ? `<button class="btn sm pink rc-pay" data-pay="${i}">Ya le pagué</button>` : ''}`).join('') : '<div class="rc-ok">A MANO ✓<small>¡Todo parejo!</small></div>'}
<div class="rc-bar"></div><div class="rc-thanks">¡Gracias por cuidar sus cuentas! ♡</div></div>
<button class="btn pink jt-new" id="qAdd">+ Anotar un gasto</button>
<button class="btn ghost sm" id="qOut" style="justify-content:center">${mine ? 'Borrar el grupo' : 'Salir del grupo'}</button></div>`, sh => {
    $('#qAdd', sh).onclick = () => { closeSheet(); setTimeout(() => qExpense(g), 80); };
    $$('[data-pay]', sh).forEach(b => b.onclick = async () => { const t = tr[+b.dataset.pay]; b.disabled = true; const r = await Store.sb.from('split_settlements').insert({ group_id: g.id, to_user: t.to, amount: t.amount }); if (r.error) { b.disabled = false; return toast('No se pudo guardar.'); } closeSheet(); toast('Anotado. ¡Gracias por pagar!'); Q.loaded = false; loadQ(); });
    $('#qOut', sh).onclick = async () => { if (!confirm(mine ? '¿Borrar este grupo para todas?' : '¿Salir de este grupo?')) return; const r = mine ? await Store.sb.from('split_groups').delete().eq('id', g.id) : await Store.sb.from('split_members').delete().eq('group_id', g.id).eq('user_id', Store.uid); if (r.error) return toast('No se pudo.'); closeSheet(); Q.loaded = false; loadQ(); };
  });
};
function qExpense(g) {
  const ms = Q.members[g.id] || []; const sel = new Set(ms.map(m => m.user_id));
  openSheet('Anotar un gasto', `<div class="stack"><label class="f">¿Qué fue?<input class="in" id="xN" maxlength="50" placeholder="Ej. Cena, gasolina"></label><label class="f">¿Cuánto fue?<input class="in" id="xA" inputmode="decimal" placeholder="Ej. 24.50"></label><div class="f">Lo pagaste tú. ¿Entre quiénes se divide?<div class="chips jt-pick">${ms.map(m => `<button type="button" class="chip" data-xp="${m.user_id}" aria-pressed="true">${esc(m.name)}${m.user_id === Store.uid ? ' (tú)' : ''}</button>`).join('')}</div></div><div class="faint" id="xSh"></div><button class="btn pink" id="xOk" style="justify-content:center;padding:12px">Guardar gasto</button></div>`, sh => {
    const upd = () => { const a = num($('#xA', sh).value); $('#xSh', sh).textContent = a > 0 && sel.size ? `A cada quien le toca ${money(a / sel.size)}` : ''; };
    sh.addEventListener('click', e => { if (togglePick(sh, 'xp', sel, e)) upd(); }); sh.addEventListener('input', upd);
    $('#xOk', sh).onclick = async () => {
      const amount = num($('#xA', sh).value); if (!(amount > 0)) return toast('Escribe cuánto fue'); if (!sel.size) return toast('Elige al menos a una persona');
      const b = $('#xOk', sh); b.disabled = true; const { error } = await Store.sb.from('split_expenses').insert({ group_id: g.id, paid_name: me(), amount, note: $('#xN', sh).value.trim(), participants: [...sel] });
      if (error) { b.disabled = false; console.warn(error); return toast('No se pudo guardar.'); } closeSheet(); toast('Gasto anotado'); Q.loaded = false; loadQ();
    };
  });
}


// API para "Anotar": dividir un gasto con un grupo de cuentas
A.qGroups = cb => { if (!online()) return []; if (!Q.loaded && !Q.tried) { Q.tried = true; loadQ().then(() => cb && cb()); } return Q.loaded ? Q.groups.map(g => ({ id: g.id, name: g.name, n: (Q.members[g.id] || []).length })) : []; };
A.qAddExpense = async (gid, amount, note) => {
  const ms = Q.members[gid] || []; const { error } = await Store.sb.from('split_expenses').insert({ group_id: gid, paid_name: me(), amount, note: note || '', participants: ms.map(m => m.user_id) });
  if (error) { console.warn(error); return false; } Q.loaded = false; loadQ(); return true;
};

})();
