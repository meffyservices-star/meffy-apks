// ================= Hacer cosas entre amistades: Tarrito compartido, Cuentas y Retos =================
(function () {
const A = App, S = A.S, { $, $$, esc, money, toast, openSheet, closeSheet } = A;
const sc = A.screens, ACT = A.ACTIONS;
const spr = (n, k) => Pix.sprite(n, k || 3);
const px = (n, w) => `<img class="pixel" alt="" src="${spr(Pix.has(n) ? n : 'estrellita', 4)}" style="width:${w}px;height:auto">`;
A.PAGES.tarrito = 'Tarrito compartido'; A.PAGES.cuentas = 'Cuentas entre amistades'; A.PAGES.retos = 'Retos';
const online = () => Store.mode === 'supa' && Store.sb && navigator.onLine !== false && !!Store.uid;
const me = () => (S.settings.name || '').trim() || 'Yo';
const friends = () => (A.friendUsers ? A.friendUsers() : []);
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };
const initials = n => (String(n).trim()[0] || '?').toUpperCase();
const COLORS = ['#f27ea1', '#7fb7e8', '#8fcf9f', '#f2b45e', '#b79ae8', '#f09a7a'];
const colorOf = id => { let h = 0; String(id).split('').forEach(c => h = (h * 31 + c.charCodeAt(0)) >>> 0); return COLORS[h % COLORS.length]; };
const dot = (id, name, sz) => `<span class="jt-dot" style="background:${colorOf(id)};${sz ? 'width:' + sz + 'px;height:' + sz + 'px' : ''}" title="${esc(name)}">${esc(initials(name))}</span>`;
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
    (b.data || []).forEach(m => (J.members[m.jar_id] = J.members[m.jar_id] || []).push(m)); (c.data || []).forEach(d => (J.deps[d.jar_id] = J.deps[d.jar_id] || []).push(d)); J.loaded = true;
  } catch (e) { console.warn(e); toast('No pude cargar tus tarritos. Revisa tu conexión.'); } finally { J.loading = false; }
  if (S.route === 'tarrito') A.render();
}
const jarTotal = id => (J.deps[id] || []).reduce((s, d) => s + (+d.amount || 0), 0);
sc.tarrito = () => {
  if (!online()) return H('tarrito') + offline();
  ensureFriends(); if (!J.loaded && !J.loading) loadJars();
  return `${H('tarrito')}
<div class="card jt-intro">${px('alcancia', 40)}<div><b>Un tarrito para ahorrar juntas</b><div class="faint">Con tu pareja, una amiga o tu familia. Cada quien pone lo suyo y el tarrito se va llenando.</div></div></div>
<button class="btn pink" data-act="jarNew" style="justify-content:center;width:100%;padding:12px">+ Crear un tarrito</button>
${!J.loaded ? '<div class="faint" style="text-align:center;padding:16px">Cargando tus tarritos…</div>' : J.jars.length ? J.jars.map(jarCard).join('') : '<div class="an-empty">' + px('alcancia', 48) + '<b>Aún no tienes tarritos</b><span>Crea uno, elige con quién y pongan una meta bonita: un viaje, un regalo, el depa.</span></div>'}`;
};
function jarCard(j) {
  const t = jarTotal(j.id), p = Math.min(100, Math.round(t / j.goal * 100)), ms = J.members[j.id] || [];
  return `<button class="jt-card" data-act="jarOpen" data-id="${j.id}"><div class="jr-jar" style="--p:${p}"><span class="jr-lid"></span><span class="jr-glass"><i class="jr-fill"></i><b class="jr-pct">${p}%</b></span></div><div class="jt-tx"><b>${esc(j.name)}</b><span class="jt-amt">${money(t)} <small>de ${money(j.goal)}</small></span><span class="jt-ppl">${ms.map(m => dot(m.user_id, m.name, 22)).join('')}</span>${p >= 100 ? '<span class="jt-done">¡Meta lograda!</span>' : `<span class="faint">Faltan ${money(Math.max(0, j.goal - t))}</span>`}</div></button>`;
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
  const t = jarTotal(j.id), p = Math.min(100, Math.round(t / j.goal * 100)), ms = J.members[j.id] || [], deps = J.deps[j.id] || [];
  const per = ms.map(m => ({ m, sum: deps.filter(d => d.user_id === m.user_id).reduce((s, d) => s + +d.amount, 0) })).sort((x, y) => y.sum - x.sum);
  const mine = j.owner === Store.uid;
  openSheet(j.name, `<div class="stack"><div class="jt-big"><div class="jr-jar big" style="--p:${p}"><span class="jr-lid"></span><span class="jr-glass"><i class="jr-fill"></i><b class="jr-pct">${p}%</b></span></div><div><div class="an-big" style="font-size:28px">${money(t)}</div><div class="faint">de ${money(j.goal)}${p >= 100 ? ' · ¡meta lograda!' : ' · faltan ' + money(Math.max(0, j.goal - t))}</div></div></div>
<button class="btn pink" id="jDep" style="justify-content:center;padding:12px">Poner dinero en el tarrito</button>
<div class="an-h" style="margin:4px">Quién ha puesto</div>${per.map(x => `<div class="li"><span class="ic">${dot(x.m.user_id, x.m.name, 30)}</span><span class="tx-main"><b>${esc(x.m.name)}${x.m.user_id === Store.uid ? ' (tú)' : ''}</b></span><span class="amt num">${money(x.sum)}</span></div>`).join('')}
${deps.length ? `<div class="an-h" style="margin:4px">Movimientos</div>${deps.slice(0, 15).map(d => `<div class="li"><span class="ic">${dot(d.user_id, d.name, 30)}</span><span class="tx-main"><b>${esc(d.name)} puso</b><span>${fmtDay(d.created_at.slice(0, 10))}${d.note ? ' · ' + esc(d.note) : ''}</span></span><span class="amt num pos">+${money(d.amount)}</span></div>`).join('')}` : ''}
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
    (b.data || []).forEach(m => (Q.members[m.group_id] = Q.members[m.group_id] || []).push(m)); (c.data || []).forEach(x => (Q.exps[x.group_id] = Q.exps[x.group_id] || []).push(x)); (d.data || []).forEach(x => (Q.sets[x.group_id] = Q.sets[x.group_id] || []).push(x)); Q.loaded = true;
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
sc.cuentas = () => {
  if (!online()) return H('cuentas') + offline();
  ensureFriends(); if (!Q.loaded && !Q.loading) loadQ();
  return `${H('cuentas')}
<div class="card jt-intro">${px('moneda', 40)}<div><b>Dividan gastos sin enredos</b><div class="faint">Crea un grupo con tus amistades, anota quién pagó qué y la app te dice quién le debe a quién.</div></div></div>
<button class="btn pink" data-act="qNew" style="justify-content:center;width:100%;padding:12px">+ Crear un grupo</button>
${!Q.loaded ? '<div class="faint" style="text-align:center;padding:16px">Cargando tus grupos…</div>' : Q.groups.length ? Q.groups.map(g => { const net = balances(g.id), my = Math.round((net[Store.uid] || 0) * 100) / 100, ms = Q.members[g.id] || []; return `<button class="jt-card" data-act="qOpen" data-id="${g.id}"><span class="jt-ic">${px('moneda', 30)}</span><div class="jt-tx"><b>${esc(g.name)}</b><span class="jt-ppl">${ms.map(m => dot(m.user_id, m.name, 22)).join('')}</span><span class="${my > 0.004 ? 'pos' : my < -0.004 ? 'neg' : 'faint'} jt-bal">${my > 0.004 ? 'Te deben ' + money(my) : my < -0.004 ? 'Debes ' + money(-my) : 'Están a mano'}</span></div></button>`; }).join('') : '<div class="an-empty">' + px('moneda', 48) + '<b>Aún no tienes grupos</b><span>Crea uno para una salida, un viaje o la casa que comparten.</span></div>'}`;
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
  const g = Q.groups.find(x => x.id === a.dataset.id); if (!g) return; const ms = Q.members[g.id] || [], net = balances(g.id), tr = transfers(net), exps = Q.exps[g.id] || [], mine = g.owner === Store.uid;
  openSheet(g.name, `<div class="stack"><div class="jt-ppl" style="gap:6px">${ms.map(m => `<span class="chip" style="pointer-events:none">${dot(m.user_id, m.name, 20)} ${esc(m.name)}</span>`).join('')}</div>
<button class="btn pink" id="qAdd" style="justify-content:center;padding:12px">+ Anotar un gasto</button>
<div class="an-h" style="margin:4px">Cómo van</div>${tr.length ? tr.map((t, i) => `<div class="li"><span class="ic">${dot(t.from, mname(g.id, t.from), 30)}</span><span class="tx-main"><b>${t.from === Store.uid ? 'Tú le debes a ' + esc(mname(g.id, t.to)) : esc(mname(g.id, t.from)) + ' le debe a ' + (t.to === Store.uid ? 'ti' : esc(mname(g.id, t.to)))}</b></span><span class="amt num ${t.to === Store.uid ? 'pos' : ''}">${money(t.amount)}</span></div>${t.from === Store.uid ? `<button class="btn sm" data-pay="${i}" style="justify-content:center;margin:-2px 0 6px">Ya le pagué</button>` : ''}`).join('') : '<div class="faint">Están a mano. ¡Todo parejo!</div>'}
${exps.length ? `<div class="an-h" style="margin:4px">Gastos</div>${exps.slice(0, 20).map(x => `<div class="li"><span class="ic">${dot(x.paid_by, x.paid_name, 30)}</span><span class="tx-main"><b>${esc(x.note || 'Gasto')}</b><span>Pagó ${x.paid_by === Store.uid ? 'tú' : esc(x.paid_name)} · entre ${(x.participants || []).length || ms.length} · ${fmtDay(x.created_at.slice(0, 10))}</span></span><span class="amt num">${money(x.amount)}</span></div>`).join('')}` : ''}
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

// ============================== RETOS ==============================
const R = { list: [], members: {}, checks: {}, loaded: false, loading: false };
const PRESETS = [['Anotar mis gastos todos los días', 'anotar'], ['Día sin gastos hormiga', 'hormiga'], ['Ahorrar un poquito cada día', 'ahorrar']];
async function loadR() {
  if (!online() || R.loading) return; R.loading = true;
  try {
    const [a, b, c] = await Promise.all([Store.sb.from('challenges').select('*').order('created_at', { ascending: false }), Store.sb.from('challenge_members').select('*'), Store.sb.from('challenge_checkins').select('*').limit(3000)]);
    if (a.error) throw a.error; R.list = a.data || []; R.members = {}; R.checks = {};
    (b.data || []).forEach(m => (R.members[m.challenge_id] = R.members[m.challenge_id] || []).push(m)); (c.data || []).forEach(x => (R.checks[x.challenge_id] = R.checks[x.challenge_id] || []).push(x)); R.loaded = true;
  } catch (e) { console.warn(e); toast('No pude cargar tus retos. Revisa tu conexión.'); } finally { R.loading = false; }
  if (S.route === 'retos') { payRetos(); A.render(); }
}
const days = c => Math.round((A.parseYmd(c.end_day) - A.parseYmd(c.start_day)) / 864e5) + 1;
const doneBy = (c, u) => (R.checks[c.id] || []).filter(x => x.user_id === u).length;
function payRetos() { // +10 estrellitas, una sola vez, al terminar un reto con todos los días cumplidos
  const paid = S.settings.retoPaid = S.settings.retoPaid || {}; let n = 0;
  R.list.forEach(c => { if (c.end_day < A.today() && !paid[c.id] && doneBy(c, Store.uid) >= days(c)) { paid[c.id] = 1; n += 10; } });
  if (n && A.giveStars) { A.giveStars(n); A.saveSettings(); setTimeout(() => toast(`¡Cumpliste un reto! +${n} estrellitas ✦`), 400); }
}
sc.retos = () => {
  if (!online()) return H('retos') + offline();
  ensureFriends(); if (!R.loaded && !R.loading) loadR();
  const today = A.today(); const act = R.list.filter(c => c.end_day >= today), old = R.list.filter(c => c.end_day < today);
  return `${H('retos')}
<div class="card jt-intro">${px('trofeo', 40)}<div><b>Retos con tus amistades</b><div class="faint">Elijan un hábito, marquen cada día que lo cumplen y vean quién va primera. ¡Cumplirlo completo da 10 estrellitas!</div></div></div>
<button class="btn pink" data-act="rNew" style="justify-content:center;width:100%;padding:12px">+ Crear un reto</button>
${!R.loaded ? '<div class="faint" style="text-align:center;padding:16px">Cargando tus retos…</div>' : act.length ? act.map(retoCard).join('') : '<div class="an-empty">' + px('trofeo', 48) + '<b>No hay retos activos</b><span>Invita a una amistad a un reto de 7 días y vean quién lo cumple.</span></div>'}
${old.length ? `<details class="card an-hist"><summary><b>Retos terminados</b> <span class="faint">${old.length}</span></summary>${old.slice(0, 10).map(c => { const ms = R.members[c.id] || []; const top = ms.map(m => ({ m, n: doneBy(c, m.user_id) })).sort((a, b) => b.n - a.n)[0]; return `<div class="li"><span class="ic">${px('trofeo', 22)}</span><span class="tx-main"><b>${esc(c.name)}</b><span>${top ? 'Ganó ' + esc(top.m.name) + ' · ' + top.n + ' de ' + days(c) + ' días' : ''}</span></span></div>`; }).join('')}</details>` : ''}`;
};
function retoCard(c) {
  const ms = R.members[c.id] || [], today = A.today(), total = days(c), checked = (R.checks[c.id] || []).some(x => x.user_id === Store.uid && x.day === today), started = c.start_day <= today;
  const left = Math.round((A.parseYmd(c.end_day) - A.parseYmd(today)) / 864e5) + 1;
  const rows = ms.map(m => ({ m, n: doneBy(c, m.user_id) })).sort((a, b) => b.n - a.n);
  return `<div class="jt-reto"><div class="row between"><b>${esc(c.name)}</b><span class="faint">${started ? (left === 1 ? 'Último día' : 'Quedan ' + left + ' días') : 'Empieza ' + fmtDay(c.start_day)}</span></div>
${rows.map((r, i) => `<div class="jt-rank">${i === 0 && r.n ? px('trofeo', 18) : `<span class="jt-pos">${i + 1}</span>`}${dot(r.m.user_id, r.m.name, 26)}<span class="jt-rn">${esc(r.m.name)}${r.m.user_id === Store.uid ? ' (tú)' : ''}</span><span class="cp-bar jt-bar"><i style="width:${Math.round(r.n / total * 100)}%;background:${colorOf(r.m.user_id)}"></i></span><b class="num">${r.n}/${total}</b></div>`).join('')}
${started ? `<button class="btn ${checked ? '' : 'pink'}" data-act="rCheck" data-id="${c.id}" style="justify-content:center;margin-top:8px">${checked ? '✓ Hoy ya cumpliste (toca para deshacer)' : '¡Hoy cumplí!'}</button>` : ''}</div>`;
}
ACT.rCheck = async a => {
  const id = a.dataset.id, today = A.today(), done = (R.checks[id] || []).some(x => x.user_id === Store.uid && x.day === today); a.disabled = true;
  const r = done ? await Store.sb.from('challenge_checkins').delete().eq('challenge_id', id).eq('user_id', Store.uid).eq('day', today) : await Store.sb.from('challenge_checkins').insert({ challenge_id: id, day: today });
  if (r.error) { a.disabled = false; return toast('No se pudo guardar. Revisa tu conexión.'); }
  if (!done) toast('¡Muy bien! Un día más ✦'); R.loaded = false; loadR();
};
ACT.rNew = () => {
  if (!friends().length) return toast('Primero agrega a una amistad en Amistades.');
  const sel = new Set(); const st = { name: PRESETS[0][0], len: 7 };
  openSheet('Nuevo reto', `<div class="stack"><div class="f">¿Qué reto es?<div class="chips">${PRESETS.map(([n], i) => `<button type="button" class="chip" data-rp="${i}" aria-pressed="${i === 0}">${esc(n)}</button>`).join('')}</div></div><label class="f">O ponle tu propio nombre<input class="in" id="rN" maxlength="50" placeholder="Ej. Cero delivery"></label><div class="f">¿Cuántos días?<div class="seg">${[7, 14, 30].map(d => `<button type="button" data-rl="${d}" aria-pressed="${d === 7}">${d} días</button>`).join('')}</div></div><div class="f">¿Con quién?${pickChips(sel, 'rq')}</div><button class="btn pink" id="rOk" style="justify-content:center;padding:12px">Empezar reto</button></div>`, sh => {
    sh.addEventListener('click', e => {
      if (togglePick(sh, 'rq', sel, e)) return;
      const p = e.target.closest('[data-rp]'); if (p) { st.name = PRESETS[+p.dataset.rp][0]; $('#rN', sh).value = ''; $$('[data-rp]', sh).forEach(b => b.setAttribute('aria-pressed', b === p)); }
      const l = e.target.closest('[data-rl]'); if (l) { st.len = +l.dataset.rl; $$('[data-rl]', sh).forEach(b => b.setAttribute('aria-pressed', b === l)); }
    });
    sh.addEventListener('input', e => { if (e.target.id === 'rN' && e.target.value) $$('[data-rp]', sh).forEach(b => b.setAttribute('aria-pressed', 'false')); });
    $('#rOk', sh).onclick = async () => {
      const name = ($('#rN', sh).value.trim() || st.name); if (!sel.size) return toast('Elige al menos a una amistad');
      const start = A.today(), end = (() => { const d = A.parseYmd(start); d.setDate(d.getDate() + st.len - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
      const b = $('#rOk', sh); b.disabled = true; const { data, error } = await Store.sb.from('challenges').insert({ name, start_day: start, end_day: end }).select().single();
      if (error) { b.disabled = false; console.warn(error); return toast('No se pudo crear el reto.'); }
      await A.ensureFriendRows([...sel]); const r = await Store.sb.from('challenge_members').insert([{ challenge_id: data.id, user_id: Store.uid, name: me() }].concat([...sel].map(id => ({ challenge_id: data.id, user_id: id, name: nameOfFriend(id) })))); if (r.error) { console.warn(r.error); toast('El grupo se creó, pero no pude agregar a todas.'); }
      closeSheet(); toast('¡Reto creado! A cumplirlo'); R.loaded = false; loadR();
    };
  });
};
})();
